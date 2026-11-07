import { useState } from 'react'
import { CAMPUSES } from '../data/seed.js'
import { useStore } from '../lib/useStore.js'
import { inviteCoHost, campusById } from '../store.js'

/** Suggested co-hosts: the linked sister campus first, then the 3 nearest MSAs. */
export function cohostOptions(campusId, links) {
  const here = campusById(campusId)
  const d = (c) => (c.lat - here.lat) ** 2 + (c.lng - here.lng) ** 2
  const sister = links.filter((l) => l.a === campusId || l.b === campusId).map((l) => (l.a === campusId ? l.b : l.a))
  const near = CAMPUSES.filter((c) => c.id !== campusId && !sister.includes(c.id)).sort((a, b) => d(a) - d(b)).slice(0, 3).map((c) => c.id)
  const suggested = [...sister, ...near]
  return { suggested: suggested.map(campusById), rest: CAMPUSES.filter((c) => c.id !== campusId && !suggested.includes(c.id)), sister }
}

export function CampusSelect({ campusId, value, onChange, label = 'Co-host (optional)', none = 'No co-host' }) {
  const { links } = useStore()
  const { suggested, rest, sister } = cohostOptions(campusId, links)
  return (
    <label className="block"><span className="mb-1.5 block text-sm text-mute">{label}</span>
      <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{none}</option>
        <optgroup label="Suggested">{suggested.map((c) => <option key={c.id} value={c.id}>{c.name}{sister.includes(c.id) ? ' (sister campus)' : ''}</option>)}</optgroup>
        <optgroup label="All campuses">{rest.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</optgroup>
      </select></label>
  )
}

export default function CoHostInvite({ event, campusId }) {
  const [v, setV] = useState('')
  const [msg, setMsg] = useState('')
  const go = async () => { const r = await inviteCoHost(event.id, v); setMsg(r.ok ? 'Invited!' : r.reason); if (r.ok) setV('') }
  return (
    <div className="mt-3 flex flex-wrap items-end gap-2">
      <div className="min-w-48 flex-1"><CampusSelect campusId={campusId} value={v} onChange={setV} label={event.coHostId ? 'Change co-host' : 'Invite a co-host'} none="Choose a campus…" /></div>
      <button className="btn btn-glass" disabled={!v} onClick={go}>Invite</button>
      {msg && <span role="status" className="w-full text-sm text-gold2">{msg}</span>}
    </div>
  )
}
