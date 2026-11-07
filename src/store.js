// Single source of truth. Persists to localStorage; the window 'storage' event syncs other tabs.
// SHARED CONTRACT: change signatures only via a PR to main. See PLAN.md.
import { buildSeed, CAMPUSES } from './data/seed.js'

const KEY = 'rihla.v1'
const DAY = 86400000
const mem = new Map() // fallback when localStorage is missing (node tests, private mode)
const ls = {
  get: (k) => { try { return globalThis.localStorage?.getItem(k) ?? mem.get(k) ?? null } catch { return mem.get(k) ?? null } },
  set: (k, v) => { try { globalThis.localStorage.setItem(k, v) } catch { mem.set(k, v) } },
}

const load = () => {
  try {
    const raw = ls.get(KEY)
    if (raw) { const s = JSON.parse(raw); if (s.version === 2) return s }
  } catch { /* corrupt state: fall through to seed */ }
  return buildSeed()
}

let state = load()
const subs = new Set()
const emit = () => subs.forEach((f) => f())
const persist = () => ls.set(KEY, JSON.stringify(state))

export const getState = () => state
export const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn) }
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => { if (e.key === KEY) { state = load(); emit() } })
}

function commit(mutate) {
  const next = structuredClone(state)
  const result = mutate(next)
  state = next
  persist()
  emit()
  return result
}

export const reset = () => commit((s) => { Object.assign(s, buildSeed()) })

// ---------- selectors ----------
export const campusById = (id) => CAMPUSES.find((c) => c.id === id)
export const userById = (id, s = state) => s.users.find((u) => u.id === id)
export const currentUser = (s = state) => userById(s.currentUserId, s)
export const usernameTaken = (name, s = state) => s.users.some((u) => u.username === String(name).trim().toLowerCase())
export const sameGender = (a, b) => !!a && !!b && a.gender === b.gender

/** THE gender filter. Every list of people in the UI must go through this. */
export const visibleUsers = (viewer, s = state) => {
  if (!viewer) return []
  if (viewer.role === 'admin') return s.users.filter((u) => u.id !== viewer.id)
  return s.users.filter((u) => u.id !== viewer.id && sameGender(u, viewer) && u.role !== 'admin')
}
/** Events a user may see: audience 'everyone' or matching their space. */
export const visibleEvents = (viewer, s = state) =>
  s.events.filter((e) => !viewer || viewer.role === 'admin' || e.audience === 'everyone' || e.audience === viewer.gender + 's')

export const LEVELS = ['Explorer', 'Traveler', 'Navigator', 'Manara Fellow']
export const levelIndex = (n) => (n >= 15 ? 3 : n >= 10 ? 2 : n >= 5 ? 1 : 0)
export const levelOf = (stamps) => LEVELS[levelIndex(Array.isArray(stamps) ? stamps.length : stamps)]

export const connectionsOf = (userId, s = state) =>
  s.connections.filter((c) => c.a === userId || c.b === userId).map((c) => (c.a === userId ? c.b : c.a))
export const areConnected = (a, b, s = state) => connectionsOf(a, s).includes(b)
export const messagesBetween = (a, b, s = state) =>
  s.messages.filter((m) => (m.from === a && m.to === b) || (m.from === b && m.to === a)).sort((x, y) => x.ts - y.ts)

export const lastActivityTs = (campusId, s = state) =>
  s.activity.filter((a) => a.campusId === campusId).reduce((m, a) => Math.max(m, a.ts), 0)
export const isFading = (campusId, s = state, now = Date.now()) => now - lastActivityTs(campusId, s) > 60 * DAY

/** Activity touching both campuses of a link: weight for line thickness. */
export const pairActivity = (a, b, s = state) => {
  const stu = new Map(s.users.map((u) => [u.id, u.campusId]))
  const co = s.events.filter((e) => (e.campusId === a && e.coHostId === b) || (e.campusId === b && e.coHostId === a))
  const checkins = co.reduce((n, e) => n + e.attendance.length, 0)
  const conns = s.connections.filter((c) => new Set([stu.get(c.a), stu.get(c.b)]).has(a) && new Set([stu.get(c.a), stu.get(c.b)]).has(b)).length
  return checkins + conns * 2 + co.length * 3
}

/** 0-100: recent activity (60) + links (20) + students (20). */
export const strength = (campusId, s = state, now = Date.now()) => {
  const recent = s.activity.filter((a) => a.campusId === campusId && now - a.ts < 30 * DAY).length
  const links = s.links.filter((l) => l.a === campusId || l.b === campusId).length
  const students = s.users.filter((u) => u.campusId === campusId && u.role === 'student').length
  return Math.min(100, Math.min(recent, 6) * 10 + Math.min(links, 2) * 10 + Math.min(students, 4) * 5)
}

// ---------- actions ----------
const uid = (p) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export const logActivity = (type, campusId, userId = null, text = '') =>
  commit((s) => { s.activity.push({ id: uid('act'), type, campusId, userId, ts: Date.now(), text }) })

export const login = (id) => commit((s) => { if (userById(id, s)) s.currentUserId = id })
/** Returns the user, or null when no such username. */
export const loginByUsername = (name) => {
  const u = state.users.find((x) => x.username === String(name).trim().toLowerCase())
  if (u) login(u.id)
  return u ?? null
}
export const logout = () => commit((s) => { s.currentUserId = null })

export function signUp(user) {
  const id = uid('u')
  commit((s) => {
    s.users.push({ stamps: [], interests: [], ...user, id })
    s.currentUserId = id
    if (user.campusId) s.activity.push({ id: uid('act'), type: 'join', campusId: user.campusId, userId: id, ts: Date.now(), text: `${user.name} joined` })
  })
  return id
}

export function checkIn(userId, code) {
  return commit((s) => {
    const u = userById(userId, s)
    const ev = s.events.find((e) => e.code.toUpperCase() === String(code).trim().toUpperCase())
    if (!u || !ev) return { ok: false, reason: 'Invalid code' }
    if (!(ev.audience === 'everyone' || ev.audience === u.gender + 's')) return { ok: false, reason: 'Event is not open to your space' }
    if (u.stamps.includes(ev.id)) return { ok: false, reason: 'Already stamped' }
    const before = levelIndex(u.stamps.length)
    u.stamps.push(ev.id)
    ev.attendance.push(u.id)
    for (const campusId of [ev.campusId, ev.coHostId].filter(Boolean))
      s.activity.push({ id: uid('act'), type: 'checkin', campusId, userId: u.id, ts: Date.now(), text: `${u.name} checked in: ${ev.title}` })
    const after = levelIndex(u.stamps.length)
    return { ok: true, event: ev, stamp: ev.stamp, levelUp: after > before ? LEVELS[after] : null }
  })
}

export function connect(a, b) {
  return commit((s) => {
    const ua = userById(a, s), ub = userById(b, s)
    if (!sameGender(ua, ub)) return { ok: false, reason: 'Different space' }
    if (areConnected(a, b, s)) return { ok: false, reason: 'Already connected' }
    s.connections.push({ a, b })
    for (const u of [ua, ub]) if (u.campusId) s.activity.push({ id: uid('act'), type: 'connect', campusId: u.campusId, userId: u.id, ts: Date.now(), text: `${ua.name} connected with ${ub.name}` })
    return { ok: true }
  })
}

export function sendMessage(from, to, text) {
  return commit((s) => {
    const a = userById(from, s), b = userById(to, s)
    if (!text?.trim()) return { ok: false, reason: 'Empty' }
    if (!sameGender(a, b) || !areConnected(from, to, s)) return { ok: false, reason: 'Not allowed' }
    if (s.blocks.some((x) => (x.by === from && x.target === to) || (x.by === to && x.target === from))) return { ok: false, reason: 'Blocked' }
    s.messages.push({ id: uid('m'), from, to, text: text.trim(), ts: Date.now() })
    return { ok: true }
  })
}

const makeCode = () => Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('')
export function createEvent(ev) {
  return commit((s) => {
    const e = { location: '', coHostId: null, ...ev, id: uid('e'), code: makeCode(), attendance: [] }
    s.events.push(e)
    s.activity.push({ id: uid('act'), type: 'event', campusId: e.campusId, userId: null, ts: Date.now(), text: `New event: ${e.title}` })
    return e
  })
}

export const inviteCoHost = (eventId, campusId) =>
  commit((s) => {
    const e = s.events.find((x) => x.id === eventId)
    if (!e || e.campusId === campusId) return { ok: false }
    e.coHostId = campusId
    s.activity.push({ id: uid('act'), type: 'cohost', campusId, userId: null, ts: Date.now(), text: `Co-hosting: ${e.title}` })
    return { ok: true }
  })

export const linkCampuses = (a, b) =>
  commit((s) => {
    if (a === b || s.links.some((l) => (l.a === a && l.b === b) || (l.a === b && l.b === a))) return { ok: false }
    s.links.push({ a, b })
    return { ok: true }
  })

export const blockUser = (by, target) => commit((s) => { s.blocks.push({ by, target }) })
export const reportUser = (by, target, reason = '') => commit((s) => { s.reports.push({ id: uid('r'), by, target, reason, ts: Date.now() }) })
