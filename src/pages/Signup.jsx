// Front Door quiz. Steps: role -> space -> who you are -> details (student/leader) -> plan (student).
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CAMPUSES, TRACKS } from '../data/seed.js'
import { signUp, usernameTaken, fetchPlan } from '../store.js'
import { useStore } from '../lib/useStore.js'
import { HOME } from '../App.jsx'
import { spring } from '../lib/motion.js'
import GenderPill from '../components/GenderPill.jsx'

const POSITIONS = ['President', 'Vice President', 'Events Chair', 'Treasurer', 'Secretary', 'Outreach Chair']
const campus = (id) => CAMPUSES.find((c) => c.id === id)
const stepsFor = (role) => ['role', 'space', 'who', ...(role === 'leader' ? ['details'] : role === 'student' ? ['details', 'plan'] : [])]

function Choice({ on, onClick, children, sub }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on}
      className={`rounded-2xl border p-4 text-left transition ${on ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
      <div className="font-medium">{children}</div>{sub && <div className="text-sm text-mute">{sub}</div>}
    </button>
  )
}
const Field = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-sm text-mute">{label}</span>{children}</label>

// "Your Rihla Plan": suggested track + sister campus are local; events + same-space people come from the server.
function suggest(f, links) {
  const track = f.transferring ? 'Transfer' : f.interests[0] ?? 'Career'
  const here = campus(f.campusId)
  if (!here) return { track, sister: null } // college outside the network: no sister campus yet
  const linked = links.find((l) => l.a === f.campusId || l.b === f.campusId)
  const d = (c) => (c.lat - here.lat) ** 2 + (c.lng - here.lng) ** 2
  const sister = campus(linked ? (linked.a === f.campusId ? linked.b : linked.a) : CAMPUSES.filter((c) => c.type !== here.type).sort((a, b) => d(a) - d(b))[0].id)
  return { track, sister }
}

export default function Signup() {
  const nav = useNavigate()
  const [i, setI] = useState(0)
  const [f, setF] = useState({ role: '', gender: '', name: '', username: '', campusId: '', otherCampus: '', otherType: 'cc', transferring: null, target: '', major: '', interests: [], position: '' })
  const { links } = useStore()
  const [taken, setTaken] = useState(false)
  const [pl, setPl] = useState(null)
  const [err, setErr] = useState('')
  const set = (patch) => setF((p) => ({ ...p, ...patch }))
  const steps = stepsFor(f.role)
  const step = steps[i]
  const uname = f.username.trim().toLowerCase()
  const fmtOk = /^[a-z0-9_]{3,20}$/.test(uname)
  useEffect(() => {
    if (!fmtOk) return setTaken(false)
    let live = true
    const t = setTimeout(() => usernameTaken(uname).then((v) => live && setTaken(v)).catch(() => {}), 250)
    return () => { live = false; clearTimeout(t) }
  }, [uname, fmtOk])
  useEffect(() => {
    if (step !== 'plan') return
    let live = true
    fetchPlan({ gender: f.gender, campusId: f.campusId, target: f.target, major: f.major }).then((p) => live && setPl(p))
    return () => { live = false }
  }, [step, f.gender, f.campusId, f.target, f.major])
  const unameErr = !uname ? '' : !fmtOk ? '3–20 letters, numbers or _' : taken ? 'That username is taken' : ''
  const needsCampus = f.role !== 'admin'
  const ctype = f.campusId === 'other' ? f.otherType : campus(f.campusId)?.type
  const ok = {
    role: !!f.role, space: !!f.gender,
    who: f.name.trim() && uname && !unameErr && (!needsCampus || (f.campusId && (f.campusId !== 'other' || f.otherCampus.trim()))),
    details: f.role === 'leader' ? !!f.position : f.transferring !== null && f.major.trim() && (!f.transferring || f.target),
    plan: true,
  }[step]
  const last = i === steps.length - 1
  const finish = async () => {
    const base = { role: f.role, gender: f.gender, name: f.name.trim(), username: uname, campusId: needsCampus ? f.campusId : null, ...(f.campusId === 'other' && { otherCampus: f.otherCampus.trim(), campusType: f.otherType }) }
    const body = f.role === 'leader' ? { ...base, position: f.position }
      : f.role === 'student' ? { ...base, transferring: f.transferring, target: f.transferring ? f.target : null, major: f.major.trim(), interests: f.interests, track: suggest(f, links).track }
      : base
    const r = await signUp(body)
    if (!r.ok) return setErr(r.reason ?? 'Could not create account')
    nav(HOME[f.role])
  }
  const toggle = (t) => set({ interests: f.interests.includes(t) ? f.interests.filter((x) => x !== t) : [...f.interests, t] })

  return (
    <section className="mx-auto max-w-xl py-10">
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={i + 1}>
        <motion.div className="h-full bg-gold" animate={{ width: `${((i + 1) / steps.length) * 100}%` }} transition={spring.ui} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={spring.ui} className="card space-y-5">
          {step === 'role' && <>
            <h1 className="text-4xl">Who are you?</h1>
            <div className="grid gap-3">
              <Choice on={f.role === 'student'} onClick={() => set({ role: 'student' })} sub="Passport, connections, chat">Student</Choice>
              <Choice on={f.role === 'leader'} onClick={() => set({ role: 'leader' })} sub="Create events, co-host with other MSAs">Campus Leader</Choice>
              <Choice on={f.role === 'admin'} onClick={() => set({ role: 'admin' })} sub="Live network map, link MSAs">Admin</Choice>
            </div>
          </>}
          {step === 'space' && <>
            <h1 className="text-4xl">Which space?</h1>
            <p className="text-mute">Brothers and sisters have separate spaces. You will only see and message people in yours.</p>
            <div className="grid grid-cols-2 gap-3">
              <Choice on={f.gender === 'brother'} onClick={() => set({ gender: 'brother' })}>🟦 Brother</Choice>
              <Choice on={f.gender === 'sister'} onClick={() => set({ gender: 'sister' })}>🟪 Sister</Choice>
            </div>
          </>}
          {step === 'who' && <>
            <h1 className="text-4xl">Tell us about you</h1>
            <Field label="Full name"><input className="input" value={f.name} onChange={(e) => set({ name: e.target.value })} autoComplete="name" /></Field>
            <Field label="Username"><input className="input" value={f.username} onChange={(e) => set({ username: e.target.value })} autoComplete="username" />
              {unameErr && <span role="alert" className="mt-1 block text-sm text-fading">{unameErr}</span>}</Field>
            {needsCampus && <Field label="Campus / school">
              <select className="input" value={f.campusId} onChange={(e) => set({ campusId: e.target.value })}>
                <option value="" disabled>Choose your campus…</option>
                {['cc', '4yr'].map((t) => <optgroup key={t} label={t === 'cc' ? 'Community colleges' : '4-year universities'}>
                  {CAMPUSES.filter((c) => c.type === t).sort((a, b) => a.name.localeCompare(b.name)).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </optgroup>)}
                {f.role === 'student' && <option value="other">My college isn't listed…</option>}
              </select></Field>}
            {f.role === 'student' && f.campusId === 'other' && <>
              <p className="text-sm text-mute">No problem. You can still join. Tell us your college and we'll connect you with the network.</p>
              <Field label="Your college"><input className="input" value={f.otherCampus} maxLength={80} onChange={(e) => set({ otherCampus: e.target.value })} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Choice on={f.otherType === 'cc'} onClick={() => set({ otherType: 'cc' })}>Community college</Choice>
                <Choice on={f.otherType === '4yr'} onClick={() => set({ otherType: '4yr' })}>4-year university</Choice>
              </div></>}
          </>}
          {step === 'details' && f.role === 'leader' && <>
            <h1 className="text-4xl">Your position</h1>
            <div className="grid grid-cols-2 gap-3">{POSITIONS.map((p) => <Choice key={p} on={f.position === p} onClick={() => set({ position: p })}>{p}</Choice>)}</div>
          </>}
          {step === 'details' && f.role === 'student' && <>
            <h1 className="text-4xl">Your journey</h1>
            <p className="text-sm text-mute">Campus type: {ctype === 'cc' ? 'Community college' : '4-year university'}</p>
            <div className="grid grid-cols-2 gap-3">
              <Choice on={f.transferring === true} onClick={() => set({ transferring: true })}>Transferring</Choice>
              <Choice on={f.transferring === false} onClick={() => set({ transferring: false, target: '' })}>Not transferring</Choice>
            </div>
            {f.transferring && <Field label="Target campus">
              <select className="input" value={f.target} onChange={(e) => set({ target: e.target.value })}>
                <option value="" disabled>Where to?</option>
                {CAMPUSES.filter((c) => c.type === '4yr').map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select></Field>}
            <Field label="Major"><input className="input" value={f.major} onChange={(e) => set({ major: e.target.value })} /></Field>
            <div><span className="mb-1.5 block text-sm text-mute">Interests</span>
              <div className="flex flex-wrap gap-2">{TRACKS.map((t) => <button type="button" key={t} aria-pressed={f.interests.includes(t)} onClick={() => toggle(t)}
                className={`rounded-full border px-3.5 py-1.5 text-sm ${f.interests.includes(t) ? 'border-gold bg-gold/15 text-gold2' : 'border-white/10 text-mute'}`}>{t}</button>)}</div></div>
          </>}
          {step === 'plan' && !pl && <p className="text-mute">Building your plan…</p>}
          {step === 'plan' && pl && (() => { const p = { ...suggest(f, links), ...pl }; return <>
            <h1 className="text-4xl">Your Rihla Plan</h1>
            <p><span className="text-mute">First track:</span> <span className="text-gold">{p.track}</span> <GenderPill value={f.gender} /></p>
            <p><span className="text-mute">Sister campus:</span> {p.sister ? p.sister.name : 'None yet. Ask your MSA to join Manara Connect.'}</p>
            <div><p className="mb-1 text-mute">Suggested events</p><ul className="list-disc pl-5">{p.events.map((e) => <li key={e.id}>{e.title} · {campus(e.campusId).short}</li>)}</ul></div>
            <div><p className="mb-1 text-mute">People to connect with</p><ul className="list-disc pl-5">{p.people.map((u) => <li key={u.id}>{u.name} · {campus(u.campusId).short}</li>)}</ul></div>
          </> })()}
          {err && <p role="alert" className="text-sm text-fading">{err}</p>}
          <div className="flex justify-between pt-2">
            <button type="button" className="btn btn-glass" onClick={() => (i ? setI(i - 1) : nav('/'))}>Back</button>
            <button type="button" className="btn btn-gold disabled:opacity-40" disabled={!ok} onClick={() => (last ? finish() : setI(i + 1))}>{last ? 'Enter Rihla' : 'Continue'}</button>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
