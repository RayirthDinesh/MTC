// Client store: a cached, per-viewer snapshot of the server state (SQLite behind /api) + action helpers.
// The server already filters by gender; the selectors below filter again as defense in depth.
// Identity lives in sessionStorage so two tabs can be two different users (student + admin demo).
import { CAMPUSES } from './data/seed.js'
import { LEVELS, levelIndex, levelOf, sameGender, audienceOk } from './lib/rules.js'
export { LEVELS, levelIndex, levelOf, sameGender }

const DAY = 86400000
const EMPTY = { ready: false, currentUserId: null, users: [], events: [], links: [], connections: [], messages: [], activity: [], blocks: [], reports: [], network: [], inbox: [] }
const ss = {
  get: () => { try { return sessionStorage.getItem('rihla.uid') } catch { return null } },
  set: (v) => { try { v ? sessionStorage.setItem('rihla.uid', v) : sessionStorage.removeItem('rihla.uid') } catch { /* private mode */ } },
}
let uid = typeof window !== 'undefined' ? ss.get() : null
let state = { ...EMPTY, currentUserId: uid }
const subs = new Set()
const emit = () => subs.forEach((f) => f())
export const getState = () => state
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn) }

async function fetchOnce() {
  try {
    const r = await fetch('/api/state', { headers: { 'x-user-id': uid ?? '' } })
    const data = await r.json()
    if (uid && !data.users.some((u) => u.id === uid)) { uid = null; ss.set(null) } // account vanished (e.g. demo reset)
    state = { ...EMPTY, ...data, ready: true, currentUserId: uid }
  } catch { state = { ...state, ready: true } }
  emit()
}
// Coalesces bursts, but a caller that arrives mid-fetch still waits for a fetch that STARTS after the call.
let inflight = null, rerun = false
export function refresh() {
  if (inflight) { rerun = true; return inflight }
  inflight = (async () => {
    do { rerun = false; await fetchOnce() } while (rerun)
    inflight = null
  })()
  return inflight
}
if (typeof window !== 'undefined') {
  refresh()
  if (typeof EventSource !== 'undefined') new EventSource('/api/stream').onmessage = () => refresh()
}

async function call(action, body = {}) {
  let j
  try {
    const r = await fetch(`/api/${action}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-user-id': uid ?? '' }, body: JSON.stringify(body) })
    j = await r.json()
  } catch { j = { ok: false, reason: 'Network error' } }
  if (j.ok) await refresh()
  return j
}

// ---------- actions (all async, all return {ok, reason?, ...}) ----------
export async function signUp(user) {
  const j = await call('signUp', user)
  if (j.ok) { uid = j.id; ss.set(uid); await refresh() }
  return j
}
export const logout = () => { uid = null; ss.set(null); return refresh() }
export const reset = async () => { await call('reset'); uid = null; ss.set(null); await refresh() }
export const checkIn = (code) => call('checkIn', { code })
export const connect = (target) => call('connect', { target })
export const sendMessage = (to, text) => call('sendMessage', { to, text })
export const createEvent = (ev) => call('createEvent', ev)
export const inviteCoHost = (eventId, campusId) => call('inviteCoHost', { eventId, campusId })
export const linkCampuses = (a, b) => call('linkCampuses', { a, b })
export const unlinkCampuses = (a, b) => call('unlinkCampuses', { a, b })
export const blockUser = (target) => call('block', { target })
export const reportUser = (target, reason = '') => call('report', { target, reason })
export const simulate = () => call('simulate')
export const requestJoin = (eventId, note = '') => call('requestJoin', { eventId, note })
export const respondJoin = (requestId, accept) => call('respondJoin', { requestId, accept })
/** Ask Rihla. Not an action: no state change, so no refresh and no broadcast. */
export async function askRihla(question) {
  try {
    const r = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': uid ?? '' },
      body: JSON.stringify({ question }),
    })
    return await r.json()
  } catch { return { ok: false, reason: 'Network error.' } }
}
export const aiAvailable = async () => { try { return (await (await fetch('/api/ai')).json()).available } catch { return false } }
export const usernameTaken = async (u) => (await (await fetch(`/api/username/${encodeURIComponent(u)}`)).json()).taken
export const fetchPlan = async (q) => (await fetch(`/api/plan?${new URLSearchParams(q)}`)).json()

// ---------- selectors ----------
// Students outside the Manara network sign up with campusId 'other' + a free-text college name.
const OTHER_CAMPUS = { id: 'other', name: 'Other college', short: 'Other', type: '4yr' }
export const campusById = (id) => (id === 'other' ? OTHER_CAMPUS : CAMPUSES.find((c) => c.id === id))
export const campusName = (u) => (u?.campusId === 'other' ? u.otherCampus || OTHER_CAMPUS.name : campusById(u?.campusId)?.name)
export const campusShort = (u) => (u?.campusId === 'other' ? u.otherCampus || OTHER_CAMPUS.short : campusById(u?.campusId)?.short)
export const userById = (id, s = state) => s.users.find((u) => u.id === id)
export const currentUser = (s = state) => userById(s.currentUserId, s)
export const stampsOf = (u) => u?.stampCount ?? u?.stamps?.length ?? 0

/** Every list of people in the UI goes through this. */
export const visibleUsers = (viewer, s = state) => {
  if (!viewer) return []
  if (viewer.role === 'admin') return s.users.filter((u) => u.id !== viewer.id)
  return s.users.filter((u) => u.id !== viewer.id && sameGender(u, viewer) && u.role !== 'admin')
}
export const visibleEvents = (viewer, s = state) =>
  s.events.filter((e) => !viewer || viewer.role === 'admin' || viewer.role === 'leader' || audienceOk(e.audience, viewer.gender))

export const connectionsOf = (id, s = state) => s.connections.filter((c) => c.a === id || c.b === id).map((c) => (c.a === id ? c.b : c.a))
export const areConnected = (a, b, s = state) => connectionsOf(a, s).includes(b)
export const messagesBetween = (a, b, s = state) =>
  s.messages.filter((m) => (m.from === a && m.to === b) || (m.from === b && m.to === a)).sort((x, y) => x.ts - y.ts)

export const lastActivityTs = (campusId, s = state) => s.activity.filter((a) => a.campusId === campusId).reduce((m, a) => Math.max(m, a.ts), 0)
export const isFading = (campusId, s = state, now = Date.now()) => now - lastActivityTs(campusId, s) > 60 * DAY

/** Weight for a link's line thickness: co-host check-ins + cross-campus connections + co-hosted events. */
export const pairActivity = (a, b, s = state) => {
  const camp = new Map(s.users.map((u) => [u.id, u.campusId]))
  const co = s.events.filter((e) => (e.campusId === a && e.coHostId === b) || (e.campusId === b && e.coHostId === a))
  const checkins = co.reduce((n, e) => n + (e.attendanceCount ?? e.attendance.length), 0)
  const conns = s.connections.filter((c) => { const x = camp.get(c.a), y = camp.get(c.b); return (x === a && y === b) || (x === b && y === a) }).length
  return checkins + conns * 2 + co.length * 3
}

/** 0-100: recent activity (60) + links (20) + students (20). */
export const strength = (campusId, s = state, now = Date.now()) => {
  const recent = s.activity.filter((a) => a.campusId === campusId && now - a.ts < 30 * DAY).length
  const links = s.links.filter((l) => l.a === campusId || l.b === campusId).length
  const students = s.users.filter((u) => u.campusId === campusId && u.role === 'student').length
  return Math.min(100, Math.min(recent, 6) * 10 + Math.min(links, 2) * 10 + Math.min(students, 4) * 5)
}
