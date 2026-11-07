import { motion } from 'framer-motion'
import GenderPill from '../GenderPill.jsx'
import Crest from '../Crest.jsx'

/**
 * The same profile card, twice: one sisters', one brothers'. Same look as the network cards inside the app.
 * Showing the two feeds never touching makes the point without a paragraph about it.
 */
const PROFILES = [
  { gender: 'sister', campus: 'mesa', name: 'Aisha Noor', sub: 'CS · Mesa → UCSD', feed: [['ucsd', 'Fatima Z.', 'UCSD'], ['ucb', 'Sumayya P.', 'Berkeley'], ['deanza', 'Khadija A.', 'De Anza']] },
  { gender: 'brother', campus: 'mesa', name: 'Omar Khalid', sub: 'CS · Mesa → UCSD', feed: [['ucsd', 'Bilal R.', 'UCSD'], ['ucla', 'Idris M.', 'UCLA'], ['deanza', 'Yusuf A.', 'De Anza']] },
]

export default function ProfileShowcase() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {PROFILES.map((p) => <Card key={p.gender} {...p} />)}
    </div>
  )
}

function Card({ gender, campus, name, sub, feed }) {
  return (
    <motion.article whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 400, damping: 24 }} className="overflow-hidden rounded-[14px] bg-navy2 ring-1 ring-white/10">
      <div className="h-16 bg-white/10" />
      <div className="px-5 pb-5 text-center">
        <span className="-mt-8 inline-block rounded-full border-[3px] border-navy2"><Crest id={campus} size={64} /></span>
        <h3 className="mt-2 text-xl font-semibold">{name}</h3>
        <p className="mt-1"><GenderPill value={gender} /></p>
        <p className="mt-1 text-sm text-mute">{sub}</p>
        <ul className="mt-4 text-left">
          {feed.map(([id, who, school]) => (
            <li key={who} className="flex items-center gap-3 border-t border-white/10 py-2.5 first:border-0">
              <Crest id={id} size={36} />
              <span className="min-w-0 flex-1 truncate text-sm"><b className="font-semibold">{who}</b> <span className="text-mute">· {school}</span></span>
              <span className="rounded-full px-3 py-1 text-xs font-semibold text-sun ring-1 ring-sun/60">Connect</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.article>
  )
}
