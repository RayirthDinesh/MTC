import { useEffect, useRef, useState } from 'react'
import { useStore, useMe } from '../lib/useStore.js'
import { connectionsOf, messagesBetween, userById, sendMessage, campusById } from '../store.js'
import GenderPill from './GenderPill.jsx'
import Crest from './Crest.jsx'

const t = (ts) => new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

/** LinkedIn-style messaging: conversation list | thread. Connections only; live via the SSE-driven store. */
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
  if (!peers.length) return <div className="card text-mute">Connect with someone first, then message them here.</div>
  const last = (id) => messagesBetween(me.id, id, s).at(-1)

  return (
    <div className="card grid min-h-[480px] overflow-hidden !p-0 md:grid-cols-[300px_1fr]">
      <ul className="max-h-48 overflow-auto border-b border-white/10 md:max-h-none md:border-b-0 md:border-r" aria-label="Conversations">
        {peers.map((p) => (
          <li key={p.id}><button onClick={() => setPeerId(p.id)} aria-current={p.id === peer.id} className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/5 ${p.id === peer.id ? 'bg-white/5 shadow-[inset_3px_0_0_var(--color-gold)]' : ''}`}>
            <Crest id={p.campusId} size={46} />
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.name}</span><span className="block truncate text-sm text-mute">{last(p.id)?.text ?? 'Say salam 👋'}</span></span></button></li>
        ))}
      </ul>
      <section className="flex min-w-0 flex-col" aria-label={`Chat with ${peer.name}`}>
        <header className="flex items-center gap-3 border-b border-white/10 px-5 py-3">
          <Crest id={peer.campusId} size={40} /><div className="min-w-0 flex-1"><p className="truncate font-semibold">{peer.name}</p><p className="truncate text-sm text-mute">{campusById(peer.campusId)?.name}</p></div><GenderPill value={peer.gender} />
        </header>
        <div className="flex max-h-[380px] flex-1 flex-col gap-2 overflow-y-auto px-5 py-4" aria-live="polite">
          {thread.map((m) => (
            <div key={m.id} className={`max-w-[76%] rounded-[20px] px-4 py-2 ${m.from === me.id ? 'self-end rounded-br-md bg-bro text-white' : 'self-start rounded-bl-md bg-white/5'}`}>
              <p className="break-words">{m.text}</p><p className={`mt-0.5 text-[11px] ${m.from === me.id ? 'text-white/70' : 'text-mute'}`}>{t(m.ts)}</p></div>
          ))}
          <div ref={end} />
        </div>
        <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
          <input className="input !rounded-full" aria-label="Message" placeholder="Write a message" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
          <button className="btn btn-gold" disabled={!text.trim()}>Send</button>
        </form>
        {err && <p role="alert" className="px-5 pb-3 text-sm text-fading">{err}</p>}
      </section>
    </div>
  )
}
