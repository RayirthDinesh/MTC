import { useStore } from '../lib/useStore.js'
import { campusById, campusName, campusShort, stampsOf } from '../store.js'
import { LEVELS, levelIndex, trackProgress, badgesOf, starsOf } from '../lib/rules.js'
import GenderPill from './GenderPill.jsx'
import { Badge } from './Stamp.jsx'
import Crest from './Crest.jsx'

/** LinkedIn-style profile. Deen progress is only shown to the owner (the server also strips it for others). */
export default function ProfileCard({ user, owner = false }) {
  const { events } = useStore()
  const prog = trackProgress(user.stamps, events)
  const badges = badgesOf(prog, { includePrivate: owner })
  return (
    <article className="card overflow-hidden !p-0">
      <div className="h-28 bg-black/10" />
      <div className="px-6 pb-6">
        <div className="-mt-12 grid h-24 w-24 place-items-center rounded-full border-4 border-white bg-gold font-display text-4xl text-[#1a1200]">{user.name[0]}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2"><h2 className="text-4xl">{user.name}</h2><GenderPill value={user.gender} /></div>
        <p className="text-mute">{user.role === 'leader' ? `${user.position} · ` : ''}{campusName(user)}{user.major ? ` · ${user.major}` : ''}</p>
        {user.target && <p className="mt-1 text-sm"><Crest id={user.target} size={22} className="mr-1.5 align-middle" />Transfer goal: <span className="text-gold2">{campusById(user.target)?.name}</span></p>}
        {user.role === 'student' && <>
          <div className="mt-4 flex gap-6 text-sm">
            <div><p className="text-mute">Level</p><p className="text-lg text-gold2">{LEVELS[levelIndex(stampsOf(user))]}</p></div>
            <div><p className="text-mute">Stamps</p><p className="text-lg">{stampsOf(user)}</p></div>
            <div><p className="text-mute">Stars</p><p className="text-lg">{starsOf(prog)} ★</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <div className="text-center"><Crest id={user.campusId} size={56} /><p className="mt-1 text-xs text-mute">{campusShort(user)}</p></div>
            {badges.map((b) => { const t = b.replace(' Badge', ''); return <Badge key={b} track={t} label={t} private={owner && t === 'Deen'} className="w-16" /> })}
            {!badges.length && <span className="self-center text-sm text-mute">No track badges yet</span>}
          </div>
          {owner && <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-sm text-mute">🔒 Your Deen progress is private. Only you can see it.</p>}
        </>}
      </div>
    </article>
  )
}
