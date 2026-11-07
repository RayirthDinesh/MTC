// SQLite (node:sqlite, built in). One file DB; ':memory:' in tests via RIHLA_DB.
import { DatabaseSync } from 'node:sqlite'
import { buildSeed } from '../src/data/seed.js'

export const db = new DatabaseSync(process.env.RIHLA_DB || 'rihla.db')
db.exec('PRAGMA journal_mode=WAL')

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, role TEXT NOT NULL, gender TEXT NOT NULL, name TEXT NOT NULL,
  campus_id TEXT, position TEXT, campus_type TEXT, major TEXT, transferring INTEGER DEFAULT 0, target TEXT,
  interests TEXT DEFAULT '[]', track TEXT);
CREATE TABLE IF NOT EXISTS events(
  id TEXT PRIMARY KEY, title TEXT NOT NULL, campus_id TEXT NOT NULL, co_host_id TEXT, audience TEXT NOT NULL,
  track TEXT, stamp TEXT, code TEXT UNIQUE NOT NULL, location TEXT, date INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS attendance(user_id TEXT NOT NULL, event_id TEXT NOT NULL, ts INTEGER NOT NULL, PRIMARY KEY(user_id, event_id));
CREATE TABLE IF NOT EXISTS connections(a TEXT NOT NULL, b TEXT NOT NULL, ts INTEGER NOT NULL, PRIMARY KEY(a, b));
CREATE TABLE IF NOT EXISTS messages(id TEXT PRIMARY KEY, from_id TEXT NOT NULL, to_id TEXT NOT NULL, text TEXT NOT NULL, ts INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS activity(id TEXT PRIMARY KEY, type TEXT NOT NULL, campus_id TEXT, user_id TEXT, text TEXT, ts INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS links(a TEXT NOT NULL, b TEXT NOT NULL, PRIMARY KEY(a, b));
CREATE TABLE IF NOT EXISTS blocks(by_id TEXT NOT NULL, target_id TEXT NOT NULL, PRIMARY KEY(by_id, target_id));
CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY, by_id TEXT NOT NULL, target_id TEXT NOT NULL, reason TEXT, ts INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_activity_ts ON activity(ts);
CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(from_id, to_id);
`
db.exec(SCHEMA)

export const tx = (fn) => {
  db.exec('BEGIN')
  try { const r = fn(); db.exec('COMMIT'); return r } catch (e) { db.exec('ROLLBACK'); throw e }
}

export function seedDb(now = Date.now()) {
  const s = buildSeed(now)
  tx(() => {
    for (const t of ['users', 'events', 'attendance', 'connections', 'messages', 'activity', 'links', 'blocks', 'reports']) db.exec(`DELETE FROM ${t}`)
    const iu = db.prepare('INSERT INTO users VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)')
    const ia = db.prepare('INSERT INTO attendance VALUES(?,?,?)')
    for (const u of s.users) {
      iu.run(u.id, u.username, u.role, u.gender, u.name, u.campusId ?? null, u.position ?? null, u.campusType ?? null,
        u.major ?? null, u.transferring ? 1 : 0, u.target ?? null, JSON.stringify(u.interests ?? []), u.track ?? null)
      u.stamps.forEach((st, i) => ia.run(u.id, st, now - (u.stamps.length - i) * 86400000))
    }
    const ie = db.prepare('INSERT INTO events VALUES(?,?,?,?,?,?,?,?,?,?)')
    for (const e of s.events) ie.run(e.id, e.title, e.campusId, e.coHostId ?? null, e.audience, e.track, e.stamp, e.code, e.location, e.date)
    for (const l of s.links) db.prepare('INSERT INTO links VALUES(?,?)').run(l.a, l.b)
    for (const c of s.connections) db.prepare('INSERT INTO connections VALUES(?,?,?)').run(c.a, c.b, now)
    for (const m of s.messages) db.prepare('INSERT INTO messages VALUES(?,?,?,?,?)').run(m.id, m.from, m.to, m.text, m.ts)
    for (const a of s.activity) db.prepare('INSERT INTO activity VALUES(?,?,?,?,?,?)').run(a.id, a.type, a.campusId, a.userId, a.text, a.ts)
  })
}

if (db.prepare('SELECT COUNT(*) n FROM users').get().n === 0) seedDb()
