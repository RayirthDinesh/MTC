// Synthetic demo data. Pure function of "now" so reset() always yields fresh recent timestamps.
const DAY = 86400000

export const TRACKS = ['Career', 'Leadership', 'Transfer', 'Deen']

const C = (id, name, short, type, lat, lng, idle) => ({ id, name, short, type, lat, lng, idle })
// idle = days since last activity (>60 flags the campus as fading)
export const CAMPUSES = [
  C('ucsd', 'UC San Diego', 'UCSD', '4yr', 32.8801, -117.234, 1),
  C('ucla', 'UCLA', 'UCLA', '4yr', 34.0689, -118.4452, 2),
  C('ucb', 'UC Berkeley', 'UCB', '4yr', 37.8719, -122.2585, 3),
  C('uci', 'UC Irvine', 'UCI', '4yr', 33.6405, -117.8443, 2),
  C('ucr', 'UC Riverside', 'UCR', '4yr', 33.9737, -117.3281, 4),
  C('ucd', 'UC Davis', 'UCD', '4yr', 38.5382, -121.7617, 6),
  C('sdsu', 'San Diego State', 'SDSU', '4yr', 32.7757, -117.0719, 5),
  C('csulb', 'CSU Long Beach', 'CSULB', '4yr', 33.7838, -118.1141, 9),
  C('cpp', 'Cal Poly Pomona', 'CPP', '4yr', 34.0565, -117.8212, 8),
  C('sjsu', 'San Jose State', 'SJSU', '4yr', 37.3352, -121.8811, 2),
  C('mesa', 'San Diego Mesa College', 'Mesa', 'cc', 32.8004, -117.1626, 1),
  C('miramar', 'Miramar College', 'Miramar', 'cc', 32.897, -117.142, 75),
  C('smc', 'Santa Monica College', 'SMC', 'cc', 34.0166, -118.4696, 3),
  C('deanza', 'De Anza College', 'De Anza', 'cc', 37.3194, -122.045, 2),
  C('mtsac', 'Mt. San Antonio College', 'Mt. SAC', 'cc', 34.0467, -117.8447, 12),
  C('occ', 'Orange Coast College', 'OCC', 'cc', 33.6675, -117.9109, 3),
  C('rcc', 'Riverside City College', 'RCC', 'cc', 33.9744, -117.3731, 4),
  C('elcamino', 'El Camino College', 'El Camino', 'cc', 33.8847, -118.3267, 10),
  C('foothill', 'Foothill College', 'Foothill', 'cc', 37.3613, -122.1285, 90),
  C('dvc', 'Diablo Valley College', 'DVC', 'cc', 37.965, -122.0699, 5),
  C('fcc', 'Fresno City College', 'FCC', 'cc', 36.764, -119.7924, 120),
  C('fresnostate', 'Fresno State', 'Fresno St', '4yr', 36.8122, -119.7459, 14),
  C('csus', 'Sacramento State', 'Sac State', '4yr', 38.5603, -121.424, 7),
  C('sfsu', 'SF State', 'SFSU', '4yr', 37.722, -122.4783, 6),
  C('usc', 'USC', 'USC', '4yr', 34.0224, -118.2851, 4),
]

export const LINKS = [
  ['mesa', 'ucsd'], ['deanza', 'sjsu'], ['smc', 'ucla'],
  ['rcc', 'ucr'], ['occ', 'uci'], ['dvc', 'ucb'],
]

const E = (id, title, campusId, coHostId, audience, track, stamp, code, inDays) =>
  ({ id, title, campusId, coHostId, audience, track, stamp, code, location: 'Student Center', inDays })
export const EVENTS = [
  E('e1', 'Transfer Pathways Panel', 'ucsd', 'mesa', 'everyone', 'Transfer', 'Mesa × UCSD', 'MESA42', -20),
  E('e2', 'Brothers Halaqa Night', 'ucla', null, 'brothers', 'Deen', 'Halaqa', 'HALQ01', -18),
  E('e3', 'Sisters Career Circle', 'ucr', 'rcc', 'sisters', 'Career', 'Career Circle', 'SIST07', -16),
  E('e4', 'MSA Leadership Summit', 'uci', 'occ', 'everyone', 'Leadership', 'Summit', 'LEAD88', -14),
  E('e5', 'Resume + LinkedIn Lab', 'sjsu', 'deanza', 'everyone', 'Career', 'Resume Lab', 'RESU12', -12),
  E('e6', 'Sisters Study Hall', 'ucb', 'dvc', 'sisters', 'Deen', 'Study Hall', 'STDY33', -10),
  E('e7', 'Brothers Basketball + Iftar', 'sdsu', null, 'brothers', 'Leadership', 'Iftar', 'HOOP55', -8),
  E('e8', 'Founders Night', 'ucla', 'smc', 'everyone', 'Career', 'Founders', 'FNDR21', -6),
  E('e9', 'Transfer Q&A Brothers', 'ucsd', 'mesa', 'brothers', 'Transfer', 'Transfer Q&A', 'TRNB09', 3),
  E('e10', 'Transfer Q&A Sisters', 'ucsd', 'mesa', 'sisters', 'Transfer', 'Transfer Q&A', 'TRNS09', 3),
  E('e11', 'Cross-Campus Open House', 'ucd', 'sfsu', 'everyone', 'Leadership', 'Open House', 'OPEN99', 7),
  E('e12', 'Quran & Coffee', 'cpp', 'mtsac', 'everyone', 'Deen', 'Quran Circle', 'QURN14', 10),
]

const BRO = [
  ['Omar K.', 'mesa', 'Computer Science', 'ucsd'], ['Yusuf A.', 'ucsd', 'Computer Science', null],
  ['Ibrahim S.', 'ucla', 'Economics', null], ['Hamza R.', 'rcc', 'Engineering', 'ucr'],
  ['Zaid M.', 'deanza', 'Business', 'sjsu'], ['Bilal T.', 'sdsu', 'Biology', null],
  ['Ali H.', 'occ', 'Computer Science', 'uci'], ['Idris N.', 'ucb', 'Data Science', null],
  ['Tariq B.', 'smc', 'Film', 'ucla'], ['Adam F.', 'sjsu', 'Computer Science', null],
]
const SIS = [
  ['Maryam A.', 'mesa', 'Biology', 'ucsd'], ['Fatima K.', 'ucsd', 'Public Health', null],
  ['Aisha R.', 'ucr', 'Psychology', null], ['Zainab S.', 'dvc', 'Computer Science', 'ucb'],
  ['Layla M.', 'ucla', 'Neuroscience', null], ['Noor H.', 'uci', 'Business', null],
  ['Hana T.', 'smc', 'Communications', 'ucla'], ['Sara B.', 'ucb', 'Economics', null],
  ['Amina Y.', 'deanza', 'Engineering', 'sjsu'], ['Khadija N.', 'rcc', 'Chemistry', 'ucr'],
]
const campusType = (id) => CAMPUSES.find((c) => c.id === id).type
const TRACK_OF = (t, i) => (t ? 'Transfer' : TRACKS[i % 3])
// stamp counts chosen so every level shows up
const STAMP_COUNTS = [3, 6, 11, 2, 5, 9, 1, 15, 4, 7, 4, 8, 12, 2, 6, 3, 10, 5, 1, 7]
const EXTRA = Array.from({ length: 12 }, (_, i) => `x:mentor-${i + 1}`)

export function buildSeed(now = Date.now()) {
  const users = []
  const mk = (list, gender, prefix) =>
    list.forEach(([name, campusId, major, target], i) => {
      const idx = users.length
      const visible = EVENTS.filter((e) => e.inDays < 0 && (e.audience === 'everyone' || e.audience === gender + 's'))
      const n = STAMP_COUNTS[idx]
      const stamps = [...visible.map((e) => e.id), ...EXTRA].slice(0, n)
      users.push({
        id: `${prefix}${i + 1}`, role: 'student', gender, name, campusId,
        campusType: campusType(campusId), major, transferring: !!target, target,
        interests: [TRACKS[i % 4], TRACKS[(i + 1) % 4]], track: TRACK_OF(target, i), stamps,
      })
    })
  mk(BRO, 'brother', 'b')
  mk(SIS, 'sister', 's')

  const leaders = [
    ['l1', 'Ahmad Z.', 'brother', 'ucsd', 'President'], ['l2', 'Mariam L.', 'sister', 'mesa', 'Events Chair'],
    ['l3', 'Khalid W.', 'brother', 'ucla', 'Vice President'], ['l4', 'Rania D.', 'sister', 'ucr', 'President'],
  ].map(([id, name, gender, campusId, position]) => ({ id, role: 'leader', gender, name, campusId, position, stamps: [] }))
  const admin = { id: 'a1', role: 'admin', gender: 'brother', name: 'Manara Admin', campusId: null, stamps: [] }

  const events = EVENTS.map(({ inDays, ...e }) => ({ ...e, date: now + inDays * DAY, attendance: [] }))
  for (const u of users) for (const sid of u.stamps) events.find((e) => e.id === sid)?.attendance.push(u.id)

  // one activity per campus at its "idle" age, plus a few recent ones for pulse/feed
  const activity = CAMPUSES.map((c, i) => ({
    id: `act${i}`, type: 'checkin', campusId: c.id, userId: null, ts: now - c.idle * DAY, text: `Activity at ${c.short}`,
  }))
  const connections = [['b1', 'b2'], ['b1', 'b4'], ['b2', 'b3'], ['s1', 's2'], ['s1', 's4'], ['s3', 's5']]
  const messages = [
    ['b1', 'b2', 'Salam! How was the transfer to UCSD?', 5], ['b2', 'b1', 'Wa alaykum salam, honestly smooth. Meet at the panel?', 4],
    ['s1', 's2', 'Salam! Are you coming to the Q&A?', 3], ['s2', 's1', 'InshaAllah, save me a seat', 2],
  ].map(([from, to, text, d], i) => ({ id: `m${i}`, from, to, text, ts: now - d * 3600000 }))

  return {
    version: 2, currentUserId: null,
    users: [...users, ...leaders, admin].map((u) => ({ ...u, username: u.name.toLowerCase().replace(/[^a-z0-9]/g, '') })), events, links: LINKS.map(([a, b]) => ({ a, b })),
    connections: connections.map(([a, b]) => ({ a, b })), messages, activity, blocks: [], reports: [],
  }
}
