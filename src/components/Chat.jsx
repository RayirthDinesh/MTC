import { useEffect, useRef, useState } from 'react'
import { useStore, useMe } from '../lib/useStore.js'
import { connectionsOf, messagesBetween, userById, sendMessage, campusById } from '../store.js'
import GenderPill from './GenderPill.jsx'

const t = (ts) => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

/** 1:1 chat with connections only. Live across tabs via the SSE-driven store. */
export default function Chat({ peerId, setPeerId }) {
  const s = useStore()
  const me = useMe()
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const end = useRef(null)
  const blocked = new Set(s.blocks.map((b) => (b.by === me.id ? b.target : b.by)))
  const peers = connectionsOf(me.id, s).filter((id) => !blocked.has(id)).map((id) => userById(id, s)).filter(Boolean)
  const peer = peers.find((p) => p.id === peerId) ?? peers[0]
  const thread = peer ? messagesBetween(me.id, peer.id, s) : []
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [thread.length, peer?.id])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim() || !peer) return
    const r = await sendMessage(peer.id, text)
    if (r.ok) { setText(''); setErr('') } else setErr(r.reason)
  }
  if (!peers.length) return <div className="card text-mute">Connect with someone first, then chat here.</div>
  const last = (id) => messagesBetween(me.id, id, s).at(-1)

  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <ul className="card !p-2" aria-label="Conversations">
        {peers.map((p) => (
          <li key={p.id}><button onClick={() => setPeerId(p.id)} aria-current={p.id === peer.id} className={`w-full rounded-xl p-3 text-left transition ${p.id === peer.id ? 'bg-gold/15' : 'hover:bg-white/5'}`}>
            <p className="font-medium">{p.name}</p><p className="truncate text-sm text-mute">{last(p.id)?.text ?? 'Say salam 👋'}</p></button></li>
        ))}
      </ul>
      <section className="card flex h-[60vh] min-h-96 flex-col !p-0" aria-label={`Chat with ${peer.name}`}>
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
          <span className="font-display text-2xl">{peer.name}</span><GenderPill value={peer.gender} /><span className="ml-auto text-sm text-mute">{campusById(peer.campusId)?.short}</span>
        </header>
        <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4" aria-live="polite">
          {thread.map((m) => (
            <div key={m.id} className={`flex ${m.from === me.id ? 'justify-end' : ''}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${m.from === me.id ? 'bg-gold text-[#2a1d00]' : 'bg-white/10'}`}>
                <p className="break-words">{m.text}</p><p className={`mt-0.5 text-[11px] ${m.from === me.id ? 'text-[#2a1d00]/70' : 'text-mute'}`}>{t(m.ts)}</p></div></div>
          ))}
          <div ref={end} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
          <input className="input" aria-label="Message" placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
          <button className="btn btn-gold" disabled={!text.trim()}>Send</button>
        </form>
        {err && <p role="alert" className="px-5 pb-3 text-sm text-fading">{err}</p>}
      </section>
    </div>
  )
}
