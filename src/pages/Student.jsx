// Student dashboard: Passport | Profile | Connect | Chat | Events. Tab underline is a shared-element (layoutId) animation.
import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMe } from '../lib/useStore.js'
import { spring } from '../lib/motion.js'
import Passport from '../components/Passport.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import ConnectList from '../components/ConnectList.jsx'
import Chat from '../components/Chat.jsx'
import EventsTab from '../components/EventsTab.jsx'

const TABS = ['Passport', 'Profile', 'Connect', 'Chat', 'Events']

export default function Student() {
  const me = useMe()
  const [tab, setTab] = useState('Passport')
  const [peerId, setPeerId] = useState(null)
  return (
    <div>
      <nav className="mb-6 flex gap-1 overflow-x-auto" role="tablist" aria-label="Student sections">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`relative whitespace-nowrap px-4 py-2.5 text-sm transition-colors ${tab === t ? 'text-gold2' : 'text-mute hover:text-cream'}`}>
            {t}{tab === t && <motion.span layoutId="tab-underline" transition={spring.ui} className="absolute inset-x-3 -bottom-px h-0.5 rounded bg-gold" />}
          </button>
        ))}
      </nav>
      {tab === 'Passport' && <Passport />}
      {tab === 'Profile' && <div className="mx-auto max-w-xl"><ProfileCard user={me} owner /></div>}
      {tab === 'Connect' && <ConnectList onMessage={(id) => { setPeerId(id); setTab('Chat') }} />}
      {tab === 'Chat' && <Chat peerId={peerId} setPeerId={setPeerId} />}
      {tab === 'Events' && <EventsTab />}
    </div>
  )
}
