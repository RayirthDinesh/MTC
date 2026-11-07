// Synthetic demo data. Pure function of "now" so reset() always yields fresh recent timestamps.
const DAY = 86400000

export const TRACKS = ['Career', 'Leadership', 'Transfer', 'Deen']

// Source: manarawest.org/campus-list (60 distinct campuses; MTC chapters/initiatives folded into their campus).
// [id, name, short, type, lat, lng]   type: 'cc' community college, '4yr' university
const RAW = [
  ['usc', 'University of Southern California', 'USC', '4yr', 34.0224, -118.2851],
  ['moorpark', 'Moorpark College', 'Moorpark', 'cc', 34.2845, -118.8776],
  ['ucsb', 'UC Santa Barbara', 'UCSB', '4yr', 34.414, -119.8489],
  ['ucla', 'UCLA', 'UCLA', '4yr', 34.0689, -118.4452],
  ['uci', 'UC Irvine', 'UCI', '4yr', 33.6405, -117.8443],
  ['ucsd', 'UC San Diego', 'UCSD', '4yr', 32.8801, -117.234],
  ['csusb', 'CSU San Bernardino', 'CSUSB', '4yr', 34.1817, -117.3239],
  ['ucr', 'UC Riverside', 'UCR', '4yr', 33.9737, -117.3281],
  ['csulb', 'CSU Long Beach', 'CSULB', '4yr', 33.7838, -118.1141],
  ['smc', 'Santa Monica College', 'SMC', 'cc', 34.0166, -118.4696],
  ['cpp', 'Cal Poly Pomona', 'CPP', '4yr', 34.0565, -117.8212],
  ['csun', 'CSU Northridge', 'CSUN', '4yr', 34.24, -118.529],
  ['mtsac', 'Mt. San Antonio College', 'Mt. SAC', 'cc', 34.0467, -117.8447],
  ['unlv', 'University of Nevada, Las Vegas', 'UNLV', '4yr', 36.1081, -115.1439],
  ['asu', 'Arizona State University', 'ASU', '4yr', 33.4242, -111.9281],
  ['claremont', 'The Claremont Colleges', 'Claremont', '4yr', 34.0967, -117.71],
  ['elcamino', 'El Camino College', 'El Camino', 'cc', 33.8847, -118.3267],
  ['csusm', 'CSU San Marcos', 'CSUSM', '4yr', 33.1291, -117.1595],
  ['csuf', 'CSU Fullerton', 'CSUF', '4yr', 33.8829, -117.8869],
  ['csudh', 'CSU Dominguez Hills', 'CSUDH', '4yr', 33.8645, -118.2547],
  ['csub', 'CSU Bakersfield', 'CSUB', '4yr', 35.3513, -119.104],
  ['santiago', 'Santiago Canyon College', 'Santiago', 'cc', 33.7918, -117.8135],
  ['pierce', 'Los Angeles Pierce College', 'Pierce', 'cc', 34.1848, -118.5719],
  ['chaffey', 'Chaffey College', 'Chaffey', 'cc', 34.1055, -117.5731],
  ['occ', 'Orange Coast College', 'OCC', 'cc', 33.6675, -117.9109],
  ['csula', 'Cal State LA', 'CSULA', '4yr', 34.0668, -118.1684],
  ['chapman', 'Chapman University', 'Chapman', '4yr', 33.7931, -117.8513],
  ['rcc', 'Riverside City College', 'RCC', 'cc', 33.9744, -117.3731],
  ['norco', 'Norco College', 'Norco', 'cc', 33.934, -117.56],
  ['caltech', 'California Institute of Technology', 'Caltech', '4yr', 34.1377, -118.1253],
  ['miramar', 'Miramar College', 'Miramar', 'cc', 32.897, -117.142],
  ['mesa', 'San Diego Mesa College', 'Mesa', 'cc', 32.8004, -117.1626],
  ['ucb', 'UC Berkeley', 'UCB', '4yr', 37.8719, -122.2585],
  ['ucd', 'UC Davis', 'UCD', '4yr', 38.5382, -121.7617],
  ['ohlone', 'Ohlone College', 'Ohlone', 'cc', 37.5267, -121.9168],
  ['ucm', 'UC Merced', 'UCM', '4yr', 37.3666, -120.425],
  ['sfsu', 'San Francisco State', 'SFSU', '4yr', 37.722, -122.4783],
  ['csueb', 'Cal State East Bay', 'CSUEB', '4yr', 37.6564, -122.0568],
  ['pacific', 'University of the Pacific', 'Pacific', '4yr', 37.9795, -121.3118],
  ['usf', 'University of San Francisco', 'USF', '4yr', 37.7766, -122.4506],
  ['fresnostate', 'Fresno State', 'Fresno St', '4yr', 36.8122, -119.7459],
  ['stanford', 'Stanford University', 'Stanford', '4yr', 37.4275, -122.1697],
  ['calpolyslo', 'Cal Poly SLO', 'Cal Poly SLO', '4yr', 35.305, -120.6625],
  ['foothill', 'Foothill College', 'Foothill', 'cc', 37.3613, -122.1285],
  ['csus', 'Sacramento State', 'Sac State', '4yr', 38.5603, -121.424],
  ['sjsu', 'San Jose State University', 'SJSU', '4yr', 37.3352, -121.8811],
  ['scu', 'Santa Clara University', 'SCU', '4yr', 37.3496, -121.939],
  ['dominican', 'Dominican University of California', 'Dominican', '4yr', 37.9707, -122.5183],
  ['zaytuna', 'Zaytuna College', 'Zaytuna', '4yr', 37.868, -122.272],
  ['fcc', 'Fresno City College', 'FCC', 'cc', 36.764, -119.7924],
  ['ucsc', 'UC Santa Cruz', 'UCSC', '4yr', 36.9914, -122.0609],
  ['clovis', 'Clovis Community College', 'Clovis CC', 'cc', 36.84, -119.646],
  ['dvc', 'Diablo Valley College', 'DVC', 'cc', 37.965, -122.0699],
  ['mission', 'Mission College', 'Mission', 'cc', 37.3883, -121.9795],
  ['deanza', 'De Anza College', 'De Anza', 'cc', 37.3194, -122.045],
  ['missionearly', 'Mission Early College High School', 'Mission Early', 'cc', 37.3925, -121.9835],
  ['arc', 'American River College', 'ARC', 'cc', 38.6522, -121.35],
  ['laspositas', 'Las Positas College', 'Las Positas', 'cc', 37.7157, -121.8057],
  ['nau', 'Northern Arizona University', 'NAU', '4yr', 35.1905, -111.6513],
  ['cuboulder', 'University of Colorado Boulder', 'CU Boulder', '4yr', 40.0076, -105.2659],
]
// idle = days since last activity (>60 flags the campus as fading). Demo campuses are busy; three are fading.
const IDLE = { miramar: 75, foothill: 90, fcc: 120, ucsd: 1, mesa: 1, ucla: 2, uci: 2, sjsu: 2, deanza: 2, ucb: 3, smc: 3, occ: 3 }
export const CAMPUSES = RAW.map(([id, name, short, type, lat, lng], i) => ({ id, name, short, type, lat, lng, idle: IDLE[id] ?? 4 + ((i * 5) % 20) }))

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
  E('e7', 'Brothers Basketball + Iftar', 'csusm', null, 'brothers', 'Leadership', 'Iftar', 'HOOP55', -8),
  E('e8', 'Founders Night', 'ucla', 'smc', 'everyone', 'Career', 'Founders', 'FNDR21', -6),
  E('e9', 'Transfer Q&A Brothers', 'ucsd', 'mesa', 'brothers', 'Transfer', 'Transfer Q&A', 'TRNB09', 3),
  E('e10', 'Transfer Q&A Sisters', 'ucsd', 'mesa', 'sisters', 'Transfer', 'Transfer Q&A', 'TRNS09', 3),
  E('e11', 'Cross-Campus Open House', 'ucd', 'sfsu', 'everyone', 'Leadership', 'Open House', 'OPEN99', 7),
  E('e12', 'Quran & Coffee', 'cpp', 'mtsac', 'everyone', 'Deen', 'Quran Circle', 'QURN14', 10),
]

const BRO = [
  ['Omar K.', 'mesa', 'Computer Science', 'ucsd'], ['Yusuf A.', 'ucsd', 'Computer Science', null],
  ['Ibrahim S.', 'ucla', 'Economics', null], ['Hamza R.', 'rcc', 'Engineering', 'ucr'],
  ['Zaid M.', 'deanza', 'Business', 'sjsu'], ['Bilal T.', 'csusm', 'Biology', null],
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
