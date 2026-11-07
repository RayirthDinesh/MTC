import { useState } from 'react'
import { useMe } from '../lib/useStore.js'
import { createEvent } from '../store.js'
import { TRACK_LIST } from '../lib/rules.js'
import { CampusSelect } from './CoHostInvite.jsx'

const tomorrow = () => { const d = new Date(Date.now() + 86400000); d.setHours(18, 0, 0, 0); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16) }
const AUDIENCES = [['brothers', '🟦 Brothers'], ['sisters', '🟪 Sisters'], ['everyone', '🌙 Everyone']]
const Field = ({ label, children }) => <label className="block"><span className="mb-1.5 block text-sm text-mute">{label}</span>{children}</label>

/** Create an event: audience, track + stamp, optional co-host. The server generates the 6-char check-in code. */
export default function EventForm() {
  const me = useMe()
  const [f, setF] = useState({ title: '', date: tomorrow(), location: '', audience: 'everyone', track: 'Career', stamp: '', coHostId: '' })
  const [res, setRes] = useState(null)
  const set = (p) => setF((x) => ({ ...x, ...p }))
  const submit = async (e) => {
    e.preventDefault()
    const r = await createEvent({ ...f, date: new Date(f.date).getTime(), stamp: f.stamp || f.title })
    setRes(r)
    if (r.ok) set({ title: '', stamp: '', location: '', coHostId: '' })
  }
  return (
    <form onSubmit={submit} className="card space-y-4">
      <h3 className="text-3xl">Create an event</h3>
      <Field label="Title"><input className="input" required value={f.title} onChange={(e) => set({ title: e.target.value })} /></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date & time"><input type="datetime-local" className="input" required value={f.date} onChange={(e) => set({ date: e.target.value })} /></Field>
        <Field label="Location"><input className="input" value={f.location} onChange={(e) => set({ location: e.target.value })} /></Field>
      </div>
      <div><span className="mb-1.5 block text-sm text-mute">Audience</span>
        <div className="grid grid-cols-3 gap-2">{AUDIENCES.map(([v, l]) => <button type="button" key={v} aria-pressed={f.audience === v} onClick={() => set({ audience: v })}
          className={`rounded-xl border px-3 py-2 text-sm ${f.audience === v ? 'border-gold bg-gold/10' : 'border-white/10 bg-white/5'}`}>{l}</button>)}</div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Track"><select className="input" value={f.track} onChange={(e) => set({ track: e.target.value })}>{TRACK_LIST.map((t) => <option key={t}>{t}</option>)}</select></Field>
        <Field label="Stamp awarded"><input className="input" placeholder={f.title || 'Stamp name'} maxLength={40} value={f.stamp} onChange={(e) => set({ stamp: e.target.value })} /></Field>
      </div>
      <CampusSelect campusId={me.campusId} value={f.coHostId} onChange={(v) => set({ coHostId: v })} />
      <button className="btn btn-gold">Create event</button>
      {res && (res.ok
        ? <p role="status" className="rounded-xl bg-gold/10 p-3">Created. Check-in code: <span className="font-mono text-xl tracking-widest text-gold2">{res.code}</span></p>
        : <p role="alert" className="text-sm text-fading">{res.reason}</p>)}
    </form>
  )
}
