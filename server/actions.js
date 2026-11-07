// All reads/writes. The server decides what each viewer may see: gender separation is enforced here, not in the UI.
import { db, tx, seedDb } from './db.js'
import { CAMPUSES } from '../src/data/seed.js'
import { LEVELS, levelIndex, sameGender, audienceOk, TRACK_LIST } from '../src/lib/rules.js'

const id = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const no = (reason, forbidden = false) => ({ ok: false, reason, ...(forbidden && { forbidden: true }) })
const campusOk = (c) => CAMPUSES.some((x) => x.id === c)
const AUDIENCES = ['brothers', 'sisters', 'everyone']

const rowUser = (r, stamps = []) => ({
  id: r.id, username: r.username, role: r.role, gender: r.gender, name: r.name, campusId: r.campus_id, position: r.position,
  campusType: r.campus_type, major: r.major, transferring: !!r.transferring, target: r.target,
  interests: JSON.parse(r.interests || '[]'), track: r.track, stamps, stampCount: stamps.length,
})
export const getUser = (uid) => {
  if (!uid) return null
  const r = db.prepare('SELECT * FROM users WHERE id=?').get(uid)
  return r ? rowUser(r) : null
}
const log = (type, campusId, userId, text) =>
  db.prepare('INSERT INTO activity VALUES(?,?,?,?,?,?)').run(id('act'), type, campusId ?? null, userId ?? null, text, Date.now())
const stampCount = (uid) => db.prepare('SELECT COUNT(*) n FROM attendance WHERE user_id=?').get(uid).n

function full() {
  const stampsBy = new Map(), attBy = new Map()
  for (const a of db.prepare('SELECT * FROM attendance ORDER BY ts').all()) {
    if (!stampsBy.has(a.user_id)) stampsBy.set(a.user_id, [])
    stampsBy.get(a.user_id).push(a.event_id)
    if (!a.event_id.startsWith('x:')) { if (!attBy.has(a.event_id)) attBy.set(a.event_id, []); attBy.get(a.event_id).push(a.user_id) }
  }
  return {
    users: db.prepare('SELECT * FROM users').all().map((r) => rowUser(r, stampsBy.get(r.id) ?? [])),
    events: db.prepare('SELECT * FROM events ORDER BY date').all().map((e) => ({
      id: e.id, title: e.title, campusId: e.campus_id, coHostId: e.co_host_id, audience: e.audience, track: e.track,
      stamp: e.stamp, code: e.code, location: e.location, date: e.date, attendance: attBy.get(e.id) ?? [],
    })),
    links: db.prepare('SELECT a,b FROM links').all().map((l) => ({ a: l.a, b: l.b })),
    connections: db.prepare('SELECT a,b FROM connections').all().map((c) => ({ a: c.a, b: c.b })),
    messages: db.prepare('SELECT * FROM messages ORDER BY ts').all().map((m) => ({ id: m.id, from: m.from_id, to: m.to_id, text: m.text, ts: m.ts })),
    activity: db.prepare('SELECT * FROM activity ORDER BY ts DESC LIMIT 400').all().map((a) => ({ id: a.id, type: a.type, campusId: a.campus_id, userId: a.user_id, text: a.text, ts: a.ts })),
    blocks: db.prepare('SELECT * FROM blocks').all().map((b) => ({ by: b.by_id, target: b.target_id })),
    reports: db.prepare('SELECT * FROM reports').all().map((r) => ({ id: r.id, by: r.by_id, target: r.target_id, reason: r.reason, ts: r.ts })),
  }
}

/** What `me` is allowed to see. Anonymous sees only the public campus links. */
export function view(me) {
  const s = full()
  const empty = { users: [], events: [], connections: [], messages: [], activity: [], blocks: [], reports: [] }
  if (!me) return { ...empty, links: s.links }
  const withCount = (e) => ({ ...e, attendanceCount: e.attendance.length })
  if (me.role === 'admin') return { ...s, events: s.events.map(withCount), messages: [] }

  const users = s.users
    .filter((u) => u.id === me.id || (u.role !== 'admin' && sameGender(u, me)))
    // Deen progress is private: other people's Deen stamps are removed (the true count stays in stampCount).
    .map((u) => (u.id === me.id ? u : { ...u, stamps: u.stamps.filter((x) => s.events.find((e) => e.id === x)?.track !== 'Deen') }))
  const ids = new Set(users.map((u) => u.id))
  const isLeader = me.role === 'leader'
  const events = s.events
    .filter((e) => (isLeader ? e.campusId === me.campusId || e.coHostId === me.campusId : audienceOk(e.audience, me.gender)))
    .map((e) => {
      const x = withCount(e)
      x.attendance = e.attendance.filter((i) => ids.has(i))
      if (!isLeader) delete x.code // codes are secrets; leaders hand them out at the event
      return x
    })
  return {
    ...empty, users, events, links: s.links,
    connections: s.connections.filter((c) => c.a === me.id || c.b === me.id),
    messages: s.messages.filter((m) => m.from === me.id || m.to === me.id),
    blocks: s.blocks.filter((b) => b.by === me.id || b.target === me.id),
    activity: s.activity.filter((a) => a.campusId === me.campusId).slice(0, 40),
  }
}

/** Signup preview ("Your Rihla Plan"): upcoming events + same-space people. No account needed. */
export function plan({ gender, campusId, target, major }) {
  if (gender !== 'brother' && gender !== 'sister') return { events: [], people: [] }
  const s = full(), now = Date.now()
  const events = s.events.filter((e) => audienceOk(e.audience, gender))
    .sort((a, b) => (a.date < now) - (b.date < now) || a.date - b.date).slice(0, 3)
    .map(({ id, title, campusId: c, stamp, date, audience }) => ({ id, title, campusId: c, stamp, date, audience }))
  const score = (u) => (u.campusId === campusId) * 2 + (!!target && u.target === target) * 2 + (!!major && u.major === major)
  const people = s.users.filter((u) => u.role === 'student' && u.gender === gender)
    .sort((a, b) => score(b) - score(a)).slice(0, 3).map((u) => ({ id: u.id, name: u.name, campusId: u.campusId, major: u.major }))
  return { events, people }
}

export const usernameTaken = (u) => !!db.prepare('SELECT 1 FROM users WHERE username=?').get(String(u).trim().toLowerCase())

const makeCode = () => {
  for (;;) {
    const c = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
    if (!db.prepare('SELECT 1 FROM events WHERE code=?').get(c)) return c
  }
}

function doCheckIn(me, code) {
  const ev = db.prepare('SELECT * FROM events WHERE code=?').get(String(code ?? '').trim().toUpperCase())
  if (!ev) return no('Invalid code')
  if (!audienceOk(ev.audience, me.gender)) return no('This event is not open to your space')
  if (db.prepare('SELECT 1 FROM attendance WHERE user_id=? AND event_id=?').get(me.id, ev.id)) return no('Already stamped')
  const before = levelIndex(stampCount(me.id))
  db.prepare('INSERT INTO attendance VALUES(?,?,?)').run(me.id, ev.id, Date.now())
  for (const c of [ev.campus_id, ev.co_host_id].filter(Boolean)) log('checkin', c, me.id, `${me.name} checked in: ${ev.title}`)
  const after = levelIndex(stampCount(me.id))
  return { ok: true, eventId: ev.id, title: ev.title, stamp: ev.stamp, track: ev.track, levelUp: after > before ? LEVELS[after] : null, level: LEVELS[after] }
}

function doConnect(me, targetId) {
  const t = getUser(targetId)
  if (!t || t.id === me.id || t.role === 'admin') return no('No such person')
  if (!sameGender(me, t)) return no('Different space', true)
  const [a, b] = [me.id, t.id].sort()
  if (db.prepare('SELECT 1 FROM connections WHERE a=? AND b=?').get(a, b)) return no('Already connected')
  db.prepare('INSERT INTO connections VALUES(?,?,?)').run(a, b, Date.now())
  for (const u of [me, t]) if (u.campusId) log('connect', u.campusId, u.id, `${me.name} connected with ${t.name}`)
  return { ok: true }
}
const connected = (x, y) => !!db.prepare('SELECT 1 FROM connections WHERE a=? AND b=?').get(...[x, y].sort())

export const actions = {
  signUp(_me, b) {
    const username = String(b.username ?? '').trim().toLowerCase()
    if (!['student', 'leader', 'admin'].includes(b.role)) return no('Pick a role')
    if (!['brother', 'sister'].includes(b.gender)) return no('Pick a space')
    if (!String(b.name ?? '').trim()) return no('Name required')
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return no('Username must be 3-20 letters, numbers or _')
    if (usernameTaken(username)) return no('That username is taken')
    if (b.role !== 'admin' && !campusOk(b.campusId)) return no('Pick your campus')
    const uid = id('u'), campus = b.role === 'admin' ? null : b.campusId
    db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').run(uid, username, b.role, b.gender, String(b.name).trim(), campus,
      b.role === 'leader' ? String(b.position ?? '') : null, b.role === 'student' ? (CAMPUSES.find((c) => c.id === campus)?.type ?? null) : null,
      b.role === 'student' ? String(b.major ?? '') : null, b.transferring ? 1 : 0, b.transferring ? (campusOk(b.target) ? b.target : null) : null,
      JSON.stringify(Array.isArray(b.interests) ? b.interests.filter((t) => TRACK_LIST.includes(t)) : []),
      b.role === 'student' ? (TRACK_LIST.includes(b.track) ? b.track : 'Career') : null)
    if (campus) log('join', campus, uid, `${String(b.name).trim()} joined`)
    return { ok: true, id: uid }
  },
  login(_me, b) {
    const r = db.prepare('SELECT id FROM users WHERE username=?').get(String(b.username ?? '').trim().toLowerCase())
    return r ? { ok: true, id: r.id } : no('No account with that username')
  },
  checkIn(me, b) {
    if (me?.role !== 'student') return no('Students only', true)
    return tx(() => doCheckIn(me, b.code))
  },
  connect(me, b) {
    if (!me) return no('Log in first', true)
    return tx(() => doConnect(me, b.target))
  },
  sendMessage(me, b) {
    if (!me) return no('Log in first', true)
    const t = getUser(b.to), text = String(b.text ?? '').trim().slice(0, 1000)
    if (!text) return no('Empty message')
    if (!t || !sameGender(me, t) || !connected(me.id, t.id)) return no('Not allowed', true)
    if (db.prepare('SELECT 1 FROM blocks WHERE (by_id=? AND target_id=?) OR (by_id=? AND target_id=?)').get(me.id, t.id, t.id, me.id)) return no('Blocked', true)
    db.prepare('INSERT INTO messages VALUES(?,?,?,?,?)').run(id('m'), me.id, t.id, text, Date.now())
    return { ok: true }
  },
  createEvent(me, b) {
    if (me?.role !== 'leader') return no('Campus leaders only', true)
    const date = Number(b.date), title = String(b.title ?? '').trim()
    if (!title || !Number.isFinite(date)) return no('Title and date required')
    if (!AUDIENCES.includes(b.audience)) return no('Pick an audience')
    const track = TRACK_LIST.includes(b.track) ? b.track : 'Career'
    const co = b.coHostId && b.coHostId !== me.campusId && campusOk(b.coHostId) ? b.coHostId : null
    const eid = id('e'), code = makeCode()
    tx(() => {
      db.prepare('INSERT INTO events VALUES(?,?,?,?,?,?,?,?,?,?)').run(eid, title, me.campusId, co, b.audience, track, String(b.stamp || title).slice(0, 40), code, String(b.location ?? ''), date)
      log('event', me.campusId, me.id, `New event: ${title}`)
      if (co) log('cohost', co, me.id, `Co-hosting: ${title}`)
    })
    return { ok: true, id: eid, code }
  },
  inviteCoHost(me, b) {
    const ev = db.prepare('SELECT * FROM events WHERE id=?').get(b.eventId)
    if (me?.role !== 'leader' || !ev || ev.campus_id !== me.campusId) return no('Not your event', true)
    if (!campusOk(b.campusId) || b.campusId === me.campusId) return no('Pick another campus')
    tx(() => { db.prepare('UPDATE events SET co_host_id=? WHERE id=?').run(b.campusId, ev.id); log('cohost', b.campusId, me.id, `Co-hosting: ${ev.title}`) })
    return { ok: true }
  },
  linkCampuses(me, b) {
    if (me?.role !== 'admin') return no('Admins only', true)
    if (!campusOk(b.a) || !campusOk(b.b) || b.a === b.b) return no('Pick two different campuses')
    if (db.prepare('SELECT 1 FROM links WHERE (a=? AND b=?) OR (a=? AND b=?)').get(b.a, b.b, b.b, b.a)) return no('Already linked')
    db.prepare('INSERT INTO links VALUES(?,?)').run(b.a, b.b)
    log('link', b.a, me.id, `Linked ${b.a} with ${b.b}`); log('link', b.b, me.id, `Linked ${b.b} with ${b.a}`)
    return { ok: true }
  },
  unlinkCampuses(me, b) {
    if (me?.role !== 'admin') return no('Admins only', true)
    db.prepare('DELETE FROM links WHERE (a=? AND b=?) OR (a=? AND b=?)').run(b.a, b.b, b.b, b.a)
    return { ok: true }
  },
  block(me, b) {
    if (!me || !getUser(b.target) || b.target === me.id) return no('No such person')
    db.prepare('INSERT OR IGNORE INTO blocks VALUES(?,?)').run(me.id, b.target)
    return { ok: true }
  },
  report(me, b) {
    if (!me || !getUser(b.target)) return no('No such person')
    db.prepare('INSERT INTO reports VALUES(?,?,?,?,?)').run(id('r'), me.id, b.target, String(b.reason ?? '').slice(0, 300), Date.now())
    return { ok: true }
  },
  /** Admin demo toggle: one random check-in or connection. */
  simulate(me) {
    if (me?.role !== 'admin') return no('Admins only', true)
    const students = db.prepare("SELECT * FROM users WHERE role='student'").all().map((r) => rowUser(r))
    const pick = (a) => a[Math.floor(Math.random() * a.length)]
    return tx(() => {
      const u = pick(students)
      if (Math.random() < 0.6) {
        const evs = db.prepare('SELECT * FROM events').all().filter((e) => audienceOk(e.audience, u.gender) &&
          !db.prepare('SELECT 1 FROM attendance WHERE user_id=? AND event_id=?').get(u.id, e.id))
        if (evs.length) return doCheckIn(u, pick(evs).code)
      }
      const others = students.filter((x) => x.id !== u.id && x.gender === u.gender && !connected(u.id, x.id))
      return others.length ? doConnect(u, pick(others).id) : no('Nothing to simulate')
    })
  },
  reset() { seedDb(); return { ok: true } },
}
