import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMe } from '../lib/useStore.js'
import { reset, campusShort } from '../store.js'
import { spring } from '../lib/motion.js'
import GenderPill from './GenderPill.jsx'

export const STUDENT_TABS = ['Home', 'Passport', 'Network', 'Messaging', 'Events', 'Ask']
const ICON = { Home: 'M4 11l8-7 8 7v9h-5v-6H9v6H4z', Passport: 'M6 3h12v18H6zM9 8h6M9 12h6M9 16h3', Network: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20c0-3.5 3-5.5 6-5.5s6 2 6 5.5M17 10a2.5 2.5 0 1 0 0-5M18 14.6c2 .5 3 2 3 4.4', Messaging: 'M4 5h16v11H10l-6 4z', Events: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', Ask: 'M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4zM18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z' }
const Svg = ({ d, className = 'h-6 w-6' }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true"><path d={d} /></svg>
export const Lighthouse = ({ className }) => <Svg className={className} d="M9.5 21l1-11h3l1 11zM8 21h8M10 10l2-4 2 4M12 6V4M7 7l-3-1M17 7l3-1" />

/** LinkedIn-style top bar for the signed-in screens (student tabs live in ?tab=). */
function AppNav({ me }) {
  const nav = useNavigate()
  const [sp, setSp] = useSearchParams()
  const tab = sp.get('tab') ?? 'Home'
  const isStudent = me.role === 'student'
  const go = (t) => setSp({ tab: t }, { replace: false })
  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white shadow-[0_1px_0_var(--line)]">
      <div className="mx-auto flex h-14 max-w-[1128px] items-center gap-3 px-5">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight"><Lighthouse className="h-6 w-6 text-gold" />Rihla</Link>
        {isStudent && <input className="input !hidden !h-9 !w-60 !rounded-lg !py-0 text-sm md:!block" placeholder="Search" aria-label="Search people" value={sp.get('q') ?? ''} onChange={(e) => setSp({ tab: 'Network', q: e.target.value }, { replace: true })} />}
        <span className="flex-1" />
        {isStudent && (
          <nav className="flex" aria-label="Student sections">
            {STUDENT_TABS.map((t) => (
              <button key={t} onClick={() => go(t)} aria-selected={tab === t} className={`relative flex min-w-14 flex-col items-center gap-px px-2 pb-1.5 pt-2 text-xs transition-colors md:min-w-[70px] ${tab === t ? 'text-cream' : 'text-mute hover:text-cream'}`}>
                <Svg d={ICON[t]} /><span className="hidden md:inline">{t}</span>
                {tab === t && <motion.span layoutId="nav-underline" transition={spring.ui} className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-cream" />}
              </button>
            ))}
          </nav>
        )}
        {!isStudent && <span className="hidden text-sm text-mute sm:inline">{me.role === 'admin' ? 'Manara Admin' : `${me.position ?? 'Leader'} · ${campusShort(me)}`}</span>}
        <button onClick={() => isStudent && go('Me')} className="ml-1 flex flex-col items-center border-l border-black/10 pl-4 text-xs text-mute hover:text-cream" aria-label="My profile">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[13px] font-bold text-[#1a1200]">{me.name[0]}</span><span>Me</span>
        </button>
        <button className="btn btn-glass !px-3 !py-1.5 text-xs" onClick={() => { reset(); nav('/') }}>Reset demo</button>
      </div>
    </header>
  )
}

export default function Navbar() {
  const me = useMe()
  const { pathname } = useLocation()
  const nav = useNavigate()
  if (me && /^\/(student|campus|admin)/.test(pathname)) return <AppNav me={me} />
  return (
    <header className="fixed inset-x-0 top-3 z-50 mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/10 bg-navy2/60 px-5 py-2 backdrop-blur-xl">
      <Link to="/" className="font-display text-2xl">Manara <span className="text-gold">Rihla</span> <span className="font-ar text-gold">رحلة</span></Link>
      <div className="flex items-center gap-3 text-sm">
        {me && <><span className="hidden sm:inline text-mute">{me.name}{me.campusId ? ` · ${campusShort(me)}` : ''}</span>{me.role !== 'admin' && <GenderPill value={me.gender} />}</>}
        <button className="btn btn-glass !py-1.5" onClick={() => { reset(); nav('/') }}>Reset demo</button>
      </div>
    </header>
  )
}
