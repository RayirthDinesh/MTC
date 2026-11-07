// Front Door quiz. Steps: role -> space -> who you are -> details (student/leader) -> plan (student).
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CAMPUSES, TRACKS } from '../data/seed.js'
import { signUp, usernameTaken, fetchPlan } from '../store.js'
import { useStore } from '../lib/useStore.js'
import { HOME } from '../App.jsx'
import { spring } from '../lib/motion.js'

const TRACK_BLURB = {
  Career: 'Internships and mentors',
  Leadership: 'Run things in your MSA',
  Transfer: 'Get where you are going',
  Deen: 'Private to you, always',
}
const Tick = ({ on }) => (
  <span aria-hidden="true" className={`grid size-5 shrink-0 place-items-center rounded-md border transition ${on ? 'border-gold bg-gold text-[#2a1a05]' : 'border-white/20'}`}>
    {on && <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6.2 4.6 9 10 3.2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
  </span>
)
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
  const [f, setF] = useState({ role: '', gender: '', name: '', username: '', campusId: '', otherCampus: '', otherType: 'cc', transferring: null, target: '', major: '', interests: [], position: '', track: '', pickedEvents: [], pickedPeople: [] })
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
    fetchPlan({ gender: f.gender, campusId: f.campusId, target: f.target, major: f.major }).then((p) => live && setPl(p)).catch(() => live && setPl({ events: [], people: [] }))
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
      : f.role === 'student' ? { ...base, transferring: f.transferring, target: f.transferring ? f.target : null, major: f.major.trim(), interests: f.interests, track: f.track || suggest(f, links).track }
      : base
    const r = await signUp(body)
    if (!r.ok) return setErr(r.reason ?? 'Could not create account')
    nav(HOME[f.role])
  }
  const togglePick = (key, id) => setF((p) => ({ ...p, [key]: p[key].includes(id) ? p[key].filter((x) => x !== id) : [...p[key], id] }))
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
          {step === 'plan' && pl && (() => {
            const sug = suggest(f, links)
            const track = f.track || sug.track
            return <>
              <div>
                <h1 className="text-4xl">Your Rihla Plan</h1>
                <p className="mt-1.5 text-sm text-mute">Built from your answers. Change anything — this is your journey.</p>
              </div>

              {/* --- track: suggested, but yours to pick --- */}
              <div>
                <span className="label">Start on this track</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {TRACKS.map((t) => {
                    const on = track === t
                    return (
                      <button type="button" key={t} aria-pressed={on} onClick={() => set({ track: t })}
                        className={`rounded-xl border px-3.5 py-2.5 text-left transition ${on ? 'border-gold bg-gold/10' : 'border-white/10 hover:border-white/25'}`}>
                        <span className="block text-[15px] font-medium">{t}</span>
                        <span className="block text-[12px] text-mute">
                          {t === sug.track ? 'Suggested for you' : TRACK_BLURB[t]}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* --- events: tick the ones you'll actually go to --- */}
              {pl.events.length > 0 && <div>
                <span className="label">Pick your first events</span>
                <ul className="mt-2 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                  {pl.events.map((e) => {
                    const on = f.pickedEvents.includes(e.id)
                    return (
                      <li key={e.id}>
                        <button type="button" aria-pressed={on} onClick={() => togglePick('pickedEvents', e.id)}
                          className="flex w-full items-center gap-3 py-2.5 text-left">
                          <Tick on={on} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px]">{e.title}</span>
                            <span className="block text-[12px] text-mute">{campus(e.campusId)?.short ?? 'Network'} · {e.stamp}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>}

              {/* --- people: same space only --- */}
              {pl.people.length > 0 && <div>
                <span className="label">Connect on day one</span>
                <ul className="mt-2 divide-y divide-white/[0.07] border-y border-white/[0.07]">
                  {pl.people.map((u) => {
                    const on = f.pickedPeople.includes(u.id)
                    return (
                      <li key={u.id}>
                        <button type="button" aria-pressed={on} onClick={() => togglePick('pickedPeople', u.id)}
                          className="flex w-full items-center gap-3 py-2.5 text-left">
                          <Tick on={on} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[14.5px]">{u.name}</span>
                            <span className="block text-[12px] text-mute">{campus(u.campusId)?.short ?? 'Network'}{u.major && ` · ${u.major}`}</span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <p className="mt-1.5 text-[12px] text-mute">Only {f.gender === 'sister' ? 'sisters' : 'brothers'} appear here. That never changes.</p>
              </div>}

              {/* --- the live summary --- */}
              <div className="rounded-xl border border-gold/25 bg-gold/[0.04] p-4">
                <p className="text-[14.5px]">
                  You start as an <b className="text-gold2">Explorer</b> on the{' '}
                  <b className="text-gold2">{track}</b> track
                  {sug.sister && <> near <b className="text-gold2">{sug.sister.short}</b></>}.
                </p>
                <p className="mt-1 text-[13px] text-mute">
                  {f.pickedEvents.length
                    ? `${f.pickedEvents.length} event${f.pickedEvents.length > 1 ? 's' : ''} picked — that is ${f.pickedEvents.length} stamp${f.pickedEvents.length > 1 ? 's' : ''} toward Traveler.`
                    : 'Pick an event above and it becomes your first stamp.'}
                  {f.pickedPeople.length > 0 && ` ${f.pickedPeople.length} to connect with.`}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full rounded-full bg-sun"
                    animate={{ width: `${Math.min(100, (f.pickedEvents.length / 5) * 100)}%` }} transition={spring.ui} />
                </div>
                <p className="mt-1 flex justify-between font-mono text-[10px] text-mute"><span>Explorer</span><span>Traveler at 5</span></p>
              </div>
            </>
          })()}
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
