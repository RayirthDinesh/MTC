// Student dashboard, LinkedIn-style: the top bar (Navbar) switches tabs via ?tab=  Home | Passport | Network | Messaging | Events | Me
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMe } from '../lib/useStore.js'
import StudentHome from '../components/StudentHome.jsx'
import Passport from '../components/Passport.jsx'
import ProfileCard from '../components/ProfileCard.jsx'
import ConnectList from '../components/ConnectList.jsx'
import Chat from '../components/Chat.jsx'
import NearbyEvents from '../components/NearbyEvents.jsx'
import EventsTab from '../components/EventsTab.jsx'
import AskRihla from '../components/AskRihla.jsx'

export default function Student() {
  const me = useMe()
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') ?? 'Home'
  const peerId = sp.get('peer')
  return (
    <motion.div key={tab} initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ type: 'spring', stiffness: 260, damping: 30 }} className="pt-5">
      {tab === 'Home' && <StudentHome />}
      {tab === 'Passport' && <div className="mx-auto max-w-3xl"><Passport /></div>}
      {tab === 'Me' && <div className="mx-auto max-w-3xl"><ProfileCard user={me} owner /></div>}
      {tab === 'Network' && <ConnectList onMessage={(id) => setSp({ tab: 'Messaging', peer: id })} />}
      {tab === 'Messaging' && <Chat peerId={peerId} setPeerId={(id) => setSp({ tab: 'Messaging', peer: id }, { replace: true })} />}
      {tab === 'Ask' && <div className="mx-auto max-w-3xl"><AskRihla /></div>}
      {tab === 'Events' && <div className="space-y-8"><NearbyEvents /><div><h3 className="mb-3 text-2xl">All events in your space</h3><EventsTab /></div></div>}
    </motion.div>
  )
}
