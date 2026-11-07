import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { login, campusById, levelOf } from '../../store.js'
import { useStore } from '../../lib/useStore.js'
import { spring } from '../../lib/motion.js'
import { HOME } from '../../App.jsx'
import GenderPill from '../GenderPill.jsx'

const GROUPS = [
  { role: 'student', label: 'Students' },
  { role: 'leader', label: 'Campus leaders' },
  { role: 'admin', label: 'Manara admin' },
]

/**
 * Jump straight into any seeded account. PRODUCT.md calls for this next to
 * sign-up, and the 3-minute demo needs it: student in one tab, admin in the
 * other, no typing. Username log in still works for real accounts.
 */
export default function DemoLogin() {
  const s = useStore()
  const [open, setOpen] = useState(false)
  const nav = useNavigate()
  const box = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (u) => {
    login(u.id)
    setOpen(false)
    nav(HOME[u.role])
  }

  return (
    <div className="relative" ref={box}>
      <button type="button" className="btn btn-glass" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Demo login
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .3s' }}>
          <path d="M2 4.5 6 8.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={spring.sheet}
            className="absolute left-0 z-50 mt-2 max-h-[22rem] w-[21rem] origin-top overflow-y-auto rounded-2xl border border-white/10 bg-navy2/95 p-2 shadow-[0_24px_60px_#000b] backdrop-blur-xl"
          >
            {GROUPS.map((g) => {
              const people = s.users.filter((u) => u.role === g.role)
              if (!people.length) return null
              return (
                <div key={g.role} className="mb-1">
                  <p className="px-2.5 pt-2 pb-1 font-mono text-[11px] tracking-[0.08em] text-gold uppercase">{g.label}</p>
                  {people.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => pick(u)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/10"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 font-mono text-[11px] text-gold">
                        {initials(u.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[13px]">{u.name}</span>
                        <span className="block truncate text-[11px] text-mute">
                          {[
                            campusById(u.campusId)?.short ?? 'Manara West',
                            u.position,
                            u.role === 'student' ? levelOf(u.stamps) : null,
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </span>
                      </span>
                      <GenderPill value={u.gender} />
                    </button>
                  ))}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const initials = (name = '') =>
  name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
