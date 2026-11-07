import { Link, useNavigate } from 'react-router-dom'
import { useMe } from '../lib/useStore.js'
import { reset, campusShort } from '../store.js'
import GenderPill from './GenderPill.jsx'

export default function Navbar() {
  const me = useMe()
  const nav = useNavigate()
  return (
    <header className="fixed inset-x-0 top-3 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-navy2/60 px-5 py-2 backdrop-blur-xl">
      <Link to="/" className="font-display text-2xl">Manara <span className="text-gold">Rihla</span> <span className="font-ar text-gold">رحلة</span></Link>
      <div className="flex items-center gap-3 text-sm">
        {me && (
          <>
            <span className="hidden sm:inline text-mute">{me.name}{me.campusId ? ` · ${campusShort(me)}` : ''}</span>
            {me.role !== 'admin' && <GenderPill value={me.gender} />}
          </>
        )}
        <button className="btn btn-glass !py-1.5" onClick={() => { reset(); nav('/') }}>Reset demo</button>
      </div>
    </header>
  )
}
