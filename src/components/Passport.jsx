import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore, useMe } from '../lib/useStore.js'
import { checkIn, campusById, campusName, stampsOf } from '../store.js'
import { LEVELS, levelIndex, trackProgress, starsOf, badgesOf, TRACK_LIST, MILESTONES } from '../lib/rules.js'
import { fireConfetti, LevelUpModal } from './Celebrate.jsx'
import GenderPill from './GenderPill.jsx'
import Stamp, { EmptyStamp, TRACK_INK } from './Stamp.jsx'
import { spring } from '../lib/motion.js'

const NEXT = [5, 10, 15, 15]
const fmt = (ts) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export default function Passport() {
  const s = useStore()
  const me = useMe()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)
  const [levelUp, setLevelUp] = useState(null)
  const n = stampsOf(me), L = levelIndex(n)
  const prog = trackProgress(me.stamps, s.events)
  const base = [0, 5, 10, 15][L]
  const pct = L === 3 ? 100 : ((n - base) / (NEXT[L] - base)) * 100
  const byId = new Map(s.events.map((e) => [e.id, e]))
  const badges = badgesOf(prog, { includePrivate: true })

  const submit = async (e) => {
    e.preventDefault()
    if (!code.trim() || busy) return
    setBusy(true)
    const r = await checkIn(code)
    setBusy(false)
    if (r.ok) {
      setMsg({ ok: true, text: `Stamp earned: ${r.stamp} · ${r.title}` }); setCode(''); fireConfetti()
      if (r.levelUp) setLevelUp(r.levelUp)
    } else setMsg({ ok: false, text: r.reason })
  }

  return (
    <div className="space-y-6">
      <div className="card border-gold/40 bg-gradient-to-br from-navy2 to-navy">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs uppercase tracking-widest text-gold">Rihla Passport</span>
          <GenderPill value={me.gender} />
        </div>
        <h2 className="mt-3 text-5xl">{me.name}</h2>
        <p className="text-mute">{campusName(me)} · {me.major}{me.target ? ` → ${campusById(me.target)?.short}` : ''}</p>
        <div className="mt-5 flex items-end justify-between">
          <div><p className="text-sm text-mute">Level</p><p className="font-display text-3xl text-gold2">{LEVELS[L]}</p></div>
          <div className="text-right"><p className="text-sm text-mute">Stars</p><p className="font-display text-3xl text-gold2">{'★'.repeat(Math.min(5, Math.ceil(starsOf(prog) / 4)))}<span className="text-mute">{' '}{starsOf(prog)}</span></p></div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to next level">
          <motion.div className="h-full bg-gradient-to-r from-gold to-gold2" animate={{ width: `${pct}%` }} transition={spring.sheet} />
        </div>
        <p className="mt-1.5 font-mono text-xs text-mute">{n} stamps{L < 3 ? ` · ${NEXT[L] - n} to ${LEVELS[L + 1]}` : ' · max level'}</p>
      </div>

      <form onSubmit={submit} className="card">
        <label className="mb-2 block text-sm text-mute" htmlFor="code">Check in with an event code</label>
        <div className="flex gap-2">
          <input id="code" className="input font-mono uppercase tracking-widest" placeholder="ABC123" value={code} maxLength={6} onChange={(e) => { setCode(e.target.value); setMsg(null) }} autoComplete="off" />
          <button className="btn btn-gold" disabled={busy || !code.trim()}>Check in</button>
        </div>
        {msg && <p role="status" className={`mt-2 text-sm ${msg.ok ? 'text-gold2' : 'text-fading'}`}>{msg.text}</p>}
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {TRACK_LIST.map((t) => (
          <div key={t} className="card">
            <div className="flex items-center justify-between"><h3 className="text-2xl">{t}</h3>{t === 'Deen' && <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-mute">🔒 Private</span>}</div>
            <div className="mt-3 flex gap-2" aria-label={`${prog[t]} of ${MILESTONES} milestones`}>
              {Array.from({ length: MILESTONES }, (_, k) => (
                <motion.span key={k} initial={false} animate={{ scale: prog[t] > k ? 1 : 0.85 }} transition={spring.pop}
                  className={`grid h-8 w-8 place-items-center rounded-full border text-xs ${prog[t] > k ? 'border-gold bg-gold/20 text-gold2' : 'border-white/15 text-mute'}`}>{prog[t] > k ? '✓' : k + 1}</motion.span>
              ))}
            </div>
            <p className="mt-2 text-sm text-mute">{Math.min(prog[t], MILESTONES)}/{MILESTONES} milestones</p>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="mb-3 text-2xl">Badges</h3>
        {badges.length ? <div className="flex flex-wrap gap-2">{badges.map((b) => <span key={b} className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm text-gold2">🏅 {b}{b.startsWith('Deen') ? ' · private' : ''}</span>)}</div>
          : <p className="text-mute">Earn 3 stamps in a track for its badge.</p>}
      </div>

      <div className="card">
        <h3 className="mb-3 text-2xl">Stamps</h3>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {me.stamps.map((id, i) => {
            const e = byId.get(id)
            return (
              <motion.div key={id} initial={{ scale: 1.9, opacity: 0, rotate: -30 }} animate={{ scale: 1, opacity: 1, rotate: ((i * 37) % 17) - 8 }} whileHover={{ scale: 1.08, rotate: 0 }} transition={spring.pop}>
                <Stamp className="w-full drop-shadow-[0_4px_6px_rgba(0,0,0,.5)]" campus={e ? campusById(e.campusId)?.short : 'Mentor'} label={e ? e.stamp : 'Meeting'} track={e?.track ?? 'Career'} />
              </motion.div>
            )
          })}
          {Array.from({ length: Math.max(0, Math.max(10, Math.ceil(me.stamps.length / 5) * 5) - me.stamps.length) }, (_, k) => <EmptyStamp key={`e${k}`} className="w-full" />)}
        </div>
        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-mute">{Object.entries(TRACK_INK).map(([t, c]) => <span key={t}><i className="mr-1 inline-block h-2 w-2 rounded-full" style={{ background: c }} />{t}</span>)}</p>
      </div>

      <div className="card">
        <h3 className="mb-3 text-2xl">Journey</h3>
        <ol className="space-y-3 border-l border-white/15 pl-5">
          {[...me.stamps].reverse().map((id) => {
            const e = byId.get(id)
            return <li key={id} className="relative"><span className="absolute -left-[26px] top-1.5 h-2.5 w-2.5 rounded-full bg-gold" />
              <p>{e ? e.title : 'Mentor meeting'}</p><p className="text-sm text-mute">{e ? `${campusById(e.campusId)?.name}${e.coHostId ? ` × ${campusById(e.coHostId)?.short}` : ''} · ${fmt(e.date)}` : 'Mentorship stamp'}</p></li>
          })}
        </ol>
      </div>
      <LevelUpModal level={levelUp} onClose={() => setLevelUp(null)} />
    </div>
  )
}
