// Pure rules shared by the client and the server. No I/O here.
export const LEVELS = ['Explorer', 'Traveler', 'Navigator', 'Manara Fellow']
export const levelIndex = (n) => (n >= 15 ? 3 : n >= 10 ? 2 : n >= 5 ? 1 : 0)
export const levelOf = (stamps) => LEVELS[levelIndex(Array.isArray(stamps) ? stamps.length : stamps)]
export const sameGender = (a, b) => !!a && !!b && a.gender === b.gender
/** Event audience vs. a user's space. */
export const audienceOk = (audience, gender) => audience === 'everyone' || audience === gender + 's'

export const TRACK_LIST = ['Career', 'Leadership', 'Transfer', 'Deen']
export const MILESTONES = 5
// Mentor/visit stamps ("x:...") count toward Career.
export const stampTrack = (stampId, eventsById) => (stampId.startsWith('x:') ? 'Career' : eventsById.get(stampId)?.track)
export function trackProgress(stamps, events) {
  const byId = new Map(events.map((e) => [e.id, e]))
  const out = Object.fromEntries(TRACK_LIST.map((t) => [t, 0]))
  for (const s of stamps) { const t = stampTrack(s, byId); if (t in out) out[t]++ }
  return out
}
/** Stars = completed milestones across all tracks (max 5 per track). */
export const starsOf = (progress) => Object.values(progress).reduce((n, v) => n + Math.min(v, MILESTONES), 0)
/** Public badges (Deen stays private to the owner). */
export const badgesOf = (progress, { includePrivate = false } = {}) =>
  TRACK_LIST.filter((t) => progress[t] >= 3 && (includePrivate || t !== 'Deen')).map((t) => `${t} Badge`)
