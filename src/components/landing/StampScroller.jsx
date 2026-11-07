import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useMotionValueEvent, useReducedMotion } from 'framer-motion'
import PassportCard from './PassportCard.jsx'

const STAMPS = ['Mesa', 'UCSD', 'SDSU', 'UCLA', 'SMC', 'UCI', 'DVC', 'UCB', 'SJSU']

const CHAPTERS = [
  {
    level: 'Explorer',
    range: '0–4 stamps',
    head: 'It starts empty.',
    body: 'You join, answer four questions, and get a blank passport with one suggested track. Nothing on it yet — which is the point. Everything after this you earned.',
  },
  {
    level: 'Traveler',
    range: '5–9 stamps',
    head: 'Then you show up.',
    body: 'Type the six-character code at an MSA event and the stamp lands. Jumuah at Mesa, a transfer panel at UCSD, a career mixer at SDSU. The passport remembers every campus you stood on.',
  },
  {
    level: 'Navigator',
    range: '10–14 stamps',
    head: 'You start crossing.',
    body: 'Co-hosted events stamp both campuses at once, so showing up at your sister campus counts twice — once for you, once for the link between the two MSAs on the admin map.',
  },
  {
    level: 'Manara Fellow',
    range: '15+ stamps',
    head: 'And it becomes your résumé.',
    body: 'Badges, completed tracks, and the campuses you have travelled to are your profile. Career, Leadership, and Transfer progress show publicly. Deen stays private to you, always.',
  },
]

/**
 * Apple-style pinned chapter. The passport holds still while the page scrolls
 * past it, taking a stamp at a time and stepping up a level with each chapter.
 */
export default function StampScroller() {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const [filled, setFilled] = useState(0)
  const [chapter, setChapter] = useState(0)

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -28])
  const cardRotate = useTransform(scrollYProgress, [0, 1], [-4, 4])

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    // Hold a beat at each end so the first and last chapters can be read.
    const eased = Math.min(1, Math.max(0, (p - 0.08) / 0.8))
    setFilled(Math.round(eased * STAMPS.length))
    setChapter(Math.min(CHAPTERS.length - 1, Math.floor(eased * CHAPTERS.length)))
  })

  // Reduced motion: no pinning, just show everything stacked and complete.
  if (reduced) {
    return (
      <section className="py-20">
        <div className="grid gap-10 md:grid-cols-2">
          <PassportCard stamps={STAMPS} filled={STAMPS.length} draggable={false} />
          <div className="grid gap-8">
            {CHAPTERS.map((c) => (
              <div key={c.level}>
                <p className="font-mono text-xs tracking-[0.18em] text-sun uppercase">
                  {c.level} · {c.range}
                </p>
                <h3 className="mt-2 text-4xl">{c.head}</h3>
                <p className="mt-2 text-[15px] text-mute">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section ref={ref} className="relative" style={{ height: `${CHAPTERS.length * 95}vh` }}>
      <div className="sticky top-0 flex min-h-screen items-center">
        <div className="grid w-full items-center gap-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-16">
          {/* the passport, pinned */}
          <motion.div style={{ y: cardY, rotate: cardRotate }} className="relative mx-auto w-full max-w-[340px]">
            <PassportCard stamps={STAMPS} filled={filled} draggable={false} />
            <div className="mt-6">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg,#7c5cff,#ffc247,#ff7a3d)' }}
                  animate={{ width: `${(filled / STAMPS.length) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 160, damping: 26 }}
                />
              </div>
              <p className="mt-2 flex justify-between font-mono text-[11px] text-mute">
                <span>{CHAPTERS[chapter].level}</span>
                <span>
                  {filled} / {STAMPS.length} stamps
                </span>
              </p>
            </div>
          </motion.div>

          {/* chapters, cross-fading in place */}
          <div className="relative min-h-[340px]">
            {CHAPTERS.map((c, i) => (
              <motion.div
                key={c.level}
                className="absolute inset-x-0 top-0"
                initial={false}
                animate={{
                  opacity: chapter === i ? 1 : 0,
                  y: chapter === i ? 0 : chapter > i ? -26 : 26,
                  filter: chapter === i ? 'blur(0px)' : 'blur(5px)',
                }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                style={{ pointerEvents: chapter === i ? 'auto' : 'none' }}
              >
                <p className="font-mono text-xs tracking-[0.18em] text-sun uppercase">
                  {c.level} · {c.range}
                </p>
                <h3 className="mt-3 text-[clamp(34px,5.5vw,62px)] leading-[1.02]">{c.head}</h3>
                <p className="mt-4 max-w-[46ch] text-lg text-mute">{c.body}</p>
              </motion.div>
            ))}

            {/* chapter ticks */}
            <div className="absolute -left-6 top-1 hidden gap-2 md:grid">
              {CHAPTERS.map((c, i) => (
                <span
                  key={c.level}
                  className="h-7 w-[3px] rounded-full transition-colors duration-300"
                  style={{ background: i <= chapter ? 'var(--color-sun)' : '#ffffff1f' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
