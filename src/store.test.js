import test from 'node:test'
import assert from 'node:assert/strict'
import * as S from './store.js'

test('visibleUsers never crosses gender (every viewer)', () => {
  const st = S.getState()
  for (const v of st.users.filter((u) => u.role !== 'admin'))
    for (const u of S.visibleUsers(v, st)) assert.equal(u.gender, v.gender, `${v.id} sees ${u.id}`)
})

test('connect and chat refuse cross-gender', () => {
  assert.equal(S.connect('b1', 's1').ok, false)
  assert.equal(S.sendMessage('b1', 's1', 'hi').ok, false)
})

test('same-gender connect then message works', () => {
  assert.equal(S.connect('b3', 'b5').ok, true)
  assert.equal(S.sendMessage('b3', 'b5', 'salam').ok, true)
})

test('checkIn awards stamp once, logs activity, rejects bad/cross-space codes', () => {
  const before = S.getState().activity.length
  const r = S.checkIn('b7', 'fndr21') // b7 already holds e1; case-insensitive new code
  assert.equal(r.ok, true)
  assert.ok(S.getState().activity.length > before)
  assert.equal(S.checkIn('b7', 'FNDR21').ok, false)
  assert.equal(S.checkIn('b7', 'NOPE00').ok, false)
  assert.equal(S.checkIn('s1', 'TRNB09').ok, false) // brothers-only event
})

test('levels and fading', () => {
  assert.equal(S.levelOf(4), 'Explorer'); assert.equal(S.levelOf(5), 'Traveler')
  assert.equal(S.levelOf(10), 'Navigator'); assert.equal(S.levelOf(15), 'Manara Fellow')
  assert.equal(S.isFading('fcc'), true); assert.equal(S.isFading('ucsd'), false)
})

test('linkCampuses rejects duplicates', () => {
  assert.equal(S.linkCampuses('mesa', 'ucsd').ok, false)
  assert.equal(S.linkCampuses('miramar', 'sdsu').ok, true)
})
