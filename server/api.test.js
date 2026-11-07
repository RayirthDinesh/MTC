import test, { before, after } from 'node:test'
import assert from 'node:assert/strict'

process.env.RIHLA_DB = ':memory:'
const { app } = await import('./index.js')
let server, base
before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r() }) }))
after(() => server.close())

const get = async (path, as) => (await fetch(base + path, { headers: as ? { 'x-user-id': as } : {} })).json()
const post = async (action, as, body = {}) => {
  const res = await fetch(`${base}/api/${action}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(as ? { 'x-user-id': as } : {}) }, body: JSON.stringify(body) })
  return { status: res.status, ...(await res.json()) }
}

test('every viewer only receives their own space (users, connections, messages)', async () => {
  const all = (await get('/api/state', 'a1')).users
  for (const v of all.filter((u) => u.role !== 'admin')) {
    const s = await get('/api/state', v.id)
    for (const u of s.users) assert.equal(u.gender, v.gender, `${v.id} received ${u.id}`)
    const ids = new Set(s.users.map((u) => u.id))
    for (const c of s.connections) assert.ok(ids.has(c.a) && ids.has(c.b))
    for (const m of s.messages) assert.ok(m.from === v.id || m.to === v.id)
  }
})

test('anonymous sees no people or events', async () => {
  const s = await get('/api/state')
  assert.equal(s.users.length + s.events.length + s.messages.length, 0)
})

test('cross-gender connect and message are refused (403)', async () => {
  assert.equal((await post('connect', 'b1', { target: 's1' })).status, 403)
  assert.equal((await post('sendMessage', 'b1', { to: 's1', text: 'hi' })).status, 403)
})

test('same-gender connect then message; non-connected cannot message', async () => {
  assert.equal((await post('sendMessage', 'b3', { to: 'b5', text: 'x' })).ok, false)
  assert.equal((await post('connect', 'b3', { target: 'b5' })).ok, true)
  assert.equal((await post('sendMessage', 'b3', { to: 'b5', text: 'salam' })).ok, true)
  assert.equal((await get('/api/state', 'b5')).messages.some((m) => m.text === 'salam'), true)
  assert.equal((await post('block', 'b5', { target: 'b3' })).ok, true)
  assert.equal((await post('sendMessage', 'b3', { to: 'b5', text: 'again' })).ok, false)
})

test('student cannot see event codes; leader can', async () => {
  assert.equal((await get('/api/state', 'b1')).events.every((e) => e.code === undefined), true)
  assert.equal((await get('/api/state', 'l1')).events.every((e) => typeof e.code === 'string'), true)
})

test('checkIn: stamps once, logs activity, rejects bad / other-space / non-student', async () => {
  const r = await post('checkIn', 'b7', { code: 'fndr21' })
  assert.equal(r.ok, true)
  assert.equal((await post('checkIn', 'b7', { code: 'FNDR21' })).ok, false)
  assert.equal((await post('checkIn', 'b7', { code: 'NOPE00' })).ok, false)
  assert.equal((await post('checkIn', 's1', { code: 'TRNB09' })).ok, false) // brothers-only
  assert.equal((await post('checkIn', 'l1', { code: 'HOOP55' })).status, 403) // leaders can't stamp
  const lv = await post('checkIn', 'b4', { code: 'HOOP55' })
  assert.equal(lv.ok, true)
  assert.equal(lv.levelUp, null)
})

test('only leaders create events; only owner invites co-host; only admin links', async () => {
  assert.equal((await post('createEvent', 'b1', { title: 'x', date: Date.now(), audience: 'everyone' })).status, 403)
  const e = await post('createEvent', 'l1', { title: 'Mixer', date: Date.now() + 1e6, audience: 'brothers', track: 'Career', coHostId: 'mesa' })
  assert.equal(e.ok, true); assert.equal(e.code.length, 6)
  assert.equal((await post('inviteCoHost', 'l2', { eventId: e.id, campusId: 'ucr' })).status, 403) // l2 is Mesa
  assert.equal((await post('inviteCoHost', 'l1', { eventId: e.id, campusId: 'ucla' })).ok, true)
  assert.equal((await post('linkCampuses', 'b1', { a: 'mesa', b: 'csusm' })).status, 403)
  assert.equal((await post('linkCampuses', 'a1', { a: 'mesa', b: 'ucsd' })).ok, false) // duplicate
  assert.equal((await post('linkCampuses', 'a1', { a: 'miramar', b: 'csusm' })).ok, true)
})

test('signUp validates and enforces unique usernames; Deen stamps hidden from others', async () => {
  assert.equal((await post('signUp', null, { role: 'student', gender: 'brother', name: 'A', username: 'omark', campusId: 'mesa' })).ok, false)
  const ok = await post('signUp', null, { role: 'student', gender: 'sister', name: 'New S', username: 'news', campusId: 'mesa', major: 'Bio' })
  assert.equal(ok.ok, true)
  assert.equal((await get('/api/username/news')).taken, true)
  const seen = (await get('/api/state', 's1')).users.find((u) => u.id === 's2') // s2 holds Deen event e6
  assert.equal(seen.stampCount, 8)
  assert.equal(seen.stamps.includes('e6'), false)
  assert.equal((await get('/api/state', 's2')).users.find((u) => u.id === 's2').stamps.includes('e6'), true) // owner still sees it
})

test('plan preview is same-space and code-free', async () => {
  const p = await get('/api/plan?gender=sister&campusId=mesa')
  const genders = new Map((await get('/api/state', 'a1')).users.map((u) => [u.id, u.gender]))
  assert.equal(p.people.length, 3)
  assert.equal(p.people.every((x) => genders.get(x.id) === 'sister'), true)
  assert.equal(p.events.every((e) => e.code === undefined && e.audience !== 'brothers'), true)
})

test('students from an unlisted college can sign up; leaders and bad campuses cannot', async () => {
  const ok = await post('signUp', null, { role: 'student', gender: 'brother', name: 'Out B', username: 'outb', campusId: 'other', otherCampus: 'Palomar College', campusType: 'cc', major: 'CS' })
  assert.equal(ok.ok, true)
  const me = (await get('/api/state', ok.id)).users.find((u) => u.id === ok.id)
  assert.equal(me.otherCampus, 'Palomar College'); assert.equal(me.campusType, 'cc')
  assert.equal((await post('signUp', null, { role: 'student', gender: 'brother', name: 'X', username: 'outb2', campusId: 'other' })).ok, false) // needs a name
  assert.equal((await post('signUp', null, { role: 'leader', gender: 'brother', name: 'X', username: 'outl', campusId: 'other', otherCampus: 'Z' })).ok, false)
  assert.equal((await post('signUp', null, { role: 'student', gender: 'brother', name: 'X', username: 'outc', campusId: 'nowhere' })).ok, false)
})

test('login endpoint is gone', async () => {
  assert.equal((await post('login', null, { username: 'omark' })).status, 404)
})
