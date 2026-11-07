import { useStore } from '../lib/useStore.js'
import { campusById, stampsOf } from '../store.js'
import { LEVELS, levelIndex, trackProgress, badgesOf, starsOf } from '../lib/rules.js'
import GenderPill from './GenderPill.jsx'

/** LinkedIn-style profile. Deen progress is only shown to the owner (the server also strips it for others). */
export default function ProfileCard({ user, owner = false }) {
  const { events } = useStore()
  const prog = trackProgress(user.stamps, events)
  const badges = badgesOf(prog, { includePrivate: owner })
  const c = campusById(user.campusId)
  return (
    <article className="card overflow-hidden !p-0">
      <div className="h-24 bg-gradient-to-r from-navy2 via-[#1c2f66] to-gold/30" />
      <div className="px-6 pb-6">
        <div className="-mt-10 grid h-20 w-20 place-items-center rounded-full border-4 border-navy bg-gold font-display text-4xl text-[#2a1d00]">{user.name[0]}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2"><h2 className="text-4xl">{user.name}</h2><GenderPill value={user.gender} /></div>
        <p className="text-mute">{user.role === 'leader' ? `${user.position} · ` : ''}{c?.name}{user.major ? ` · ${user.major}` : ''}</p>
        {user.target && <p className="mt-1 text-sm">🎓 Transfer goal: <span className="text-gold2">{campusById(user.target)?.name}</span></p>}
        {user.role === 'student' && <>
          <div className="mt-4 flex gap-6 text-sm">
            <div><p className="text-mute">Level</p><p className="text-lg text-gold2">{LEVELS[levelIndex(stampsOf(user))]}</p></div>
            <div><p className="text-mute">Stamps</p><p className="text-lg">{stampsOf(user)}</p></div>
            <div><p className="text-mute">Stars</p><p className="text-lg">{starsOf(prog)} ★</p></div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.length ? badges.map((b) => <span key={b} className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-sm text-gold2">🏅 {b}</span>) : <span className="text-sm text-mute">No badges yet</span>}
          </div>
          {owner && <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-sm text-mute">🔒 Your Deen progress is private. Only you can see it.</p>}
        </>}
      </div>
    </article>
  )
}
