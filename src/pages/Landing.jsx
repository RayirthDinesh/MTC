// Landing — "night to dawn".
// A manara is a lighthouse; a rihla is a journey. So the page travels from
// deep night at the hero, through violet pre-dawn, into sunrise at the CTA.
// The beam is the one thing constant across all of it. Motif throughout: the
// eight-point khatam star — stamp shape, divider, and the shape of the glow.
import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion'
import { loginByUsername } from '../store.js'
import { useStore } from '../lib/useStore.js'
import { CAMPUSES } from '../data/seed.js'
import { HOME } from '../App.jsx'
import NightSky from '../components/landing/NightSky.jsx'
import PassportCard from '../components/landing/PassportCard.jsx'
import StampScroller from '../components/landing/StampScroller.jsx'
import ProfileShowcase from '../components/landing/ProfileShowcase.jsx'
import CampusMarquee from '../components/landing/CampusMarquee.jsx'
import DemoLogin from '../components/landing/DemoLogin.jsx'
import MagneticButton from '../components/landing/MagneticButton.jsx'
import Parallax, { FullBleed } from '../components/landing/Parallax.jsx'
import Reveal from '../components/landing/Reveal.jsx'
import Khatam, { StarRule, KhatamField } from '../components/landing/Khatam.jsx'

const ease = [0.16, 1, 0.3, 1]

const PROBLEMS = [
  ['No way in', 'Manara programs have no sign-up path, and nothing a student does shows up anywhere or adds up to anything.', -70],
  ['No way to find each other', 'Nowhere to meet a student two campuses over, or someone who already made the transfer you are planning.', 40],
  ['Boundaries ignored by default', 'LinkedIn, Discord, and GroupMe mix brothers and sisters out of the box. Nobody designed for our boundaries.', -40],
  ['MSAs alone in the dark', 'Community colleges and 4-years rarely plan together. Small MSAs struggle quietly until they fade out entirely.', 70],
]

const GATED = ['Profiles', 'Search', 'Suggestions', 'Connections', 'Chat', 'Mentors', 'Events']

export default function Landing() {
  const s = useStore()
  const nav = useNavigate()
  const reduced = useReducedMotion()
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const page = useRef(null)

  // The sky colour walks from night to dawn across the whole page.
  const { scrollYProgress } = useScroll()
  const sky = useTransform(
    scrollYProgress,
    [0, 0.3, 0.55, 0.8, 1],
    ['#070d20', '#0e0f2c', '#1a1033', '#2a1338', '#34172c'],
  )

  const heroRef = useRef(null)
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const SKY = { stiffness: 80, damping: 22, mass: 0.4 }
  const yStars = useSpring(useTransform(heroP, [0, 1], [0, 120]), SKY)
  const yGlow = useSpring(useTransform(heroP, [0, 1], [0, 60]), SKY)
  const yTower = useSpring(useTransform(heroP, [0, 1], [0, -70]), SKY)
  const heroFade = useTransform(heroP, [0, 0.85], [1, 0])

  const submit = (e) => {
    e.preventDefault()
    const u = loginByUsername(name)
    if (!u) return setErr('No account with that username. Sign up instead?')
    nav(HOME[u.role])
  }

  const ccCount = CAMPUSES.filter((c) => c.type === 'cc').length

  return (
    <div ref={page}>
      {/* The sky, behind everything, following the scroll. Portalled to body:
          App.jsx's page wrapper keeps a `filter` on it after the transition,
          and a filtered ancestor becomes the containing block for fixed
          children, which would make this scroll away instead of staying put. */}
      {createPortal(
        <motion.div
          className="pointer-events-none fixed inset-0"
          style={{ backgroundColor: reduced ? '#070d20' : sky, zIndex: -1 }}
          aria-hidden="true"
        />,
        document.body,
      )}

      {/* ------------------------------------------------------------ hero */}
      <FullBleed>
        <section ref={heroRef} className="relative min-h-[96svh] overflow-hidden">
          <NightSky yStars={yStars} yGlow={yGlow} yTower={yTower} />

          <motion.div
            style={{ opacity: reduced ? 1 : heroFade }}
            className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pt-10 pb-24 lg:grid-cols-[1.15fr_minmax(0,380px)]"
          >
            <div>
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease }}
                className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] text-sun uppercase"
              >
                <Khatam size={13} stroke="var(--color-sun)" width={1.4} />
                Manara West · 65 campuses · one network
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1, delay: 0.08, ease }}
                className="mt-5 text-[clamp(46px,8.4vw,108px)] leading-[0.94]"
              >
                Travel to seek
                <br />
                knowledge.
                <br />
                <span className="rihla-dawn-text">Carry the proof.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.2, ease }}
                className="mt-7 max-w-[52ch] text-[17px] leading-relaxed text-mute"
              >
                Every Muslim student gets a Rihla Passport. Show up at an MSA event, get the
                stamp. Your journey, badges, and campuses become your professional profile — and
                the network you use to reach students, mentors, and leaders anywhere in Manara
                West. Brothers and sisters have separate spaces, by design.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.85, delay: 0.3, ease }}
                className="mt-9 flex flex-wrap items-start gap-3"
              >
                <MagneticButton to="/signup" variant="sun">
                  Get your passport
                  <span aria-hidden="true">→</span>
                </MagneticButton>
                <DemoLogin />
                <form onSubmit={submit} className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      className="input w-48!"
                      aria-label="Username"
                      placeholder="Username"
                      autoComplete="username"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setErr('')
                      }}
                    />
                    <button className="btn btn-glass" type="submit" disabled={!name.trim()}>
                      Log in
                    </button>
                  </div>
                  {err && (
                    <p role="alert" className="text-sm text-fading">
                      {err}
                    </p>
                  )}
                </form>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.45 }}
                className="mt-12 flex flex-wrap gap-x-9 gap-y-5"
              >
                <Stat n="65" label="campuses in the network" />
                <Stat n={CAMPUSES.length} label="live on the map" />
                <Stat n={ccCount} label="community colleges" />
                <Stat n={s.events.length} label="events with codes" />
              </motion.div>
            </div>

            {/* the toy */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -7 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 1.1, delay: 0.25, ease }}
              className="relative mx-auto w-full max-w-[340px]"
            >
              <PassportCard
                stamps={['Mesa', 'UCSD', 'SDSU', 'UCLA', '', '']}
                filled={4}
                photo="/people/brother.jpg"
              />
              <p className="mt-5 text-center font-mono text-[11px] tracking-[0.14em] text-mute uppercase">
                ← drag it ·  tilt it →
              </p>
            </motion.div>
          </motion.div>
        </section>
      </FullBleed>

      <FullBleed className="-mt-6">
        <CampusMarquee />
      </FullBleed>

      {/* --------------------------------------------------------- problem */}
      <section className="pt-28">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-plum uppercase">The problem</p>
          <h2 className="mt-3 max-w-[18ch] text-[clamp(32px,5.6vw,62px)] leading-[1.02]">
            Sixty-five campuses, all of them dark to each other.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {PROBLEMS.map(([head, body, speed], i) => (
            <Parallax key={head} speed={reduced ? 0 : speed}>
              <Reveal delay={0.05 * i}>
                <div className="rihla-glass h-full rounded-3xl p-7">
                  <span className="font-mono text-[11px] text-sun">0{i + 1}</span>
                  <h3 className="mt-2 text-[26px] leading-tight">{head}</h3>
                  <p className="mt-2.5 text-[15px] text-mute">{body}</p>
                </div>
              </Reveal>
            </Parallax>
          ))}
        </div>
      </section>

      <StarRule className="mt-28" />

      {/* ------------------------------------------- the passport, pinned */}
      <section className="pt-24">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-sun uppercase">
            01 · The Rihla Passport
          </p>
          <h2 className="mt-3 max-w-[16ch] text-[clamp(32px,5.6vw,62px)] leading-[1.02]">
            A record of everywhere you showed up.
          </h2>
        </Reveal>
      </section>
      <StampScroller />

      {/* ------------------------------------------------ LinkedIn, halal */}
      <section className="pt-10">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-plum uppercase">
            02 · The network
          </p>
          <h2 className="mt-3 max-w-[20ch] text-[clamp(32px,5.6vw,62px)] leading-[1.02]">
            LinkedIn, if it had been built for us.
          </h2>
          <p className="mt-5 max-w-[58ch] text-[17px] text-mute">
            Same professional surface — profile, headline, badges, suggested connections, direct
            messages. One difference, and it runs all the way down: these two feeds never touch.
            Here they are side by side.
          </p>
        </Reveal>
        <div className="mt-12">
          <ProfileShowcase />
        </div>
      </section>

      {/* ------------------------------------------------------- the map */}
      <section className="pt-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.2em] text-ember uppercase">
              03 · The live map
            </p>
            <h2 className="mt-3 text-[clamp(32px,5.6vw,58px)] leading-[1.02]">
              Manara finally sees its own network.
            </h2>
            <p className="mt-5 max-w-[48ch] text-[17px] text-mute">
              Every campus on one map: community colleges in teal, universities in gold. Linked
              MSAs are joined by a line that thickens as real activity flows between them —
              check-ins, cross-campus connections, co-hosted events. A campus that has gone quiet
              for sixty days gets a red ring and lands on the Fading list, so no MSA disappears
              without anyone noticing.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              {[
                ['Community college', 'var(--color-cc)'],
                ['4-year university', 'var(--color-gold)'],
                ['Fading, 60+ days quiet', 'var(--color-fading)'],
              ].map(([label, c]) => (
                <span
                  key={label}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[13px] text-mute"
                >
                  <i className="size-2 rounded-full" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
                  {label}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <MapPreview />
          </Reveal>
        </div>
      </section>

      {/* ---------------------------------------------------- the boundary */}
      <section className="pt-28">
        <Reveal>
          <div className="rihla-boundary relative overflow-hidden rounded-[30px] p-8 sm:p-12">
            <KhatamField className="pointer-events-none absolute inset-0 size-full text-sun" opacity={0.07} />
            <div className="relative">
              <p className="font-mono text-[11px] tracking-[0.2em] text-sun uppercase">
                Judge feedback, built in
              </p>
              <h2 className="mt-4 text-[clamp(30px,5vw,54px)] leading-[1.02]">“No free mixing.”</h2>
              <p className="mt-5 max-w-[60ch] text-[16px] text-cream/75">
                Two judges told us the same thing, so we did not make it a setting — we made it
                the architecture. Every user belongs to a space, every event declares an
                audience, and one helper{' '}
                <code className="rounded-md bg-black/30 px-1.5 py-0.5 font-mono text-[13px] text-sun">
                  visibleUsers()
                </code>{' '}
                stands in front of every profile, search, suggestion, mentor match, and chat. A
                brother account cannot surface a sister anywhere in this app, and the reverse
                holds just as firmly. There is one test that proves it for every seeded account.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {GATED.map((x) => (
                  <span
                    key={x}
                    className="flex items-center gap-1.5 rounded-full border border-sun/25 bg-black/20 px-3 py-1.5 text-[13px] text-cream/80"
                  >
                    {x}
                    <span className="text-sun">✓</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="pt-28 pb-10 text-center">
        <Reveal>
          <Khatam size={34} stroke="var(--color-sun)" width={1} className="mx-auto" />
          <p className="font-ar mt-5 text-4xl text-sun">رحلة</p>
          <h2 className="mx-auto mt-4 max-w-[17ch] text-[clamp(32px,6vw,68px)] leading-[1.02]">
            Your rihla starts at sunrise.
          </h2>
          <p className="mx-auto mt-5 max-w-[44ch] text-[17px] text-mute">
            Four questions, then the passport is yours.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <MagneticButton to="/signup" variant="sun">
              Get your passport
              <span aria-hidden="true">→</span>
            </MagneticButton>
            <DemoLogin />
          </div>
        </Reveal>
      </section>

      <footer className="mt-20 border-t border-white/10 pt-10 pb-4 text-center text-[13px] text-mute">
        <p className="font-ar text-2xl text-sun">منارة</p>
        <p className="mt-2">Manara Rihla · MTC × Replit × Manara West Buildathon, UCSD</p>
        <p className="mt-1 text-mute/60">
          <Link to="/signup" className="text-mute/80 underline-offset-4 hover:underline">
            Sign up
          </Link>{' '}
          · built in one afternoon
        </p>
      </footer>

      <style>{`
        .rihla-dawn-text {
          background: linear-gradient(104deg,#ffc247 0%,#ff7a3d 38%,#b06ab3 70%,#7c5cff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .rihla-glass {
          background: linear-gradient(180deg,#ffffff0f,#ffffff05);
          border: 1px solid #ffffff1a;
          box-shadow: 0 24px 60px -30px #000c, inset 0 1px 0 #ffffff14;
          transition: transform .5s cubic-bezier(.16,1,.3,1), border-color .35s, box-shadow .5s;
        }
        .rihla-glass:hover {
          transform: translateY(-5px);
          border-color: #ffc2474d;
          box-shadow: 0 34px 70px -28px #000e, 0 0 36px -18px #ffc24766, inset 0 1px 0 #ffffff1f;
        }
        .rihla-boundary {
          background:
            radial-gradient(120% 140% at 85% -10%, #ff7a3d2e, transparent 58%),
            radial-gradient(90% 120% at 10% 110%, #7c5cff2e, transparent 60%),
            linear-gradient(165deg,#1b1340,#0d1026);
          border: 1px solid #ffc2473d;
          box-shadow: 0 40px 90px -40px #000e;
        }
      `}</style>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-display text-[38px] leading-none text-sun">{n}</div>
      <div className="mt-1.5 text-[13px] text-mute">{label}</div>
    </div>
  )
}

/** A still of the admin map: campuses, sister links, one fading MSA. */
function MapPreview() {
  const reduced = useReducedMotion()
  const nodes = [
    { x: 24, y: 72, t: 'cc', n: 'Mesa' },
    { x: 46, y: 60, t: 'uni', n: 'UCSD' },
    { x: 30, y: 40, t: 'cc', n: 'SMC' },
    { x: 55, y: 28, t: 'uni', n: 'UCLA' },
    { x: 74, y: 46, t: 'cc', n: 'RCC' },
    { x: 86, y: 33, t: 'uni', n: 'UCR' },
    { x: 15, y: 20, t: 'cc', n: 'Foothill', fading: true },
  ]
  const links = [[0, 1, 4], [2, 3, 3], [4, 5, 2]]

  return (
    <div
      className="relative aspect-[4/3] overflow-hidden rounded-[26px] border border-white/10"
      style={{
        background: 'radial-gradient(100% 90% at 30% 10%, #16224d, #090f26 70%)',
        boxShadow: '0 40px 90px -40px #000e, inset 0 1px 0 #ffffff14',
      }}
    >
      <KhatamField className="absolute inset-0 size-full text-sun" opacity={0.05} />
      <svg className="absolute inset-0 size-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {links.map(([a, b, w], i) => (
          <motion.line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke="url(#linkgrad)"
            strokeWidth={w / 5}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.2 + i * 0.18, ease }}
          />
        ))}
        <defs>
          <linearGradient id="linkgrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#2db5a6" />
            <stop offset="1" stopColor="#ffc247" />
          </linearGradient>
        </defs>
      </svg>

      {nodes.map((p, i) => (
        <div key={p.n} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
          {!p.fading && !reduced && (
            <motion.span
              className="absolute inset-0 -z-10 rounded-full"
              style={{ background: p.t === 'cc' ? '#2db5a6' : '#ffc247' }}
              animate={{ scale: [1, 3.4], opacity: [0.5, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
            />
          )}
          <span
            className="block size-2.5 rounded-full"
            style={{
              background: p.fading ? 'transparent' : p.t === 'cc' ? '#2db5a6' : '#ffc247',
              boxShadow: p.fading
                ? '0 0 0 2px var(--color-fading), 0 0 14px #ff5c5c88'
                : `0 0 14px ${p.t === 'cc' ? '#2db5a6' : '#ffc247'}`,
            }}
          />
          <span className="mt-1.5 block font-mono text-[9px] whitespace-nowrap text-mute">
            {p.n}
          </span>
        </div>
      ))}

      <span className="absolute bottom-3 left-4 font-mono text-[10px] tracking-[0.14em] text-mute uppercase">
        Live · cross-tab
      </span>
    </div>
  )
}
