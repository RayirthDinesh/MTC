// Landing: pitch, problem, features, the boundary, and one way in —
// Sign up (Front Door quiz) only. No login.
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CAMPUSES, EVENTS } from '../data/seed.js'
import Beam from '../components/landing/Beam.jsx'
import CampusMarquee from '../components/landing/CampusMarquee.jsx'
import Reveal from '../components/landing/Reveal.jsx'
import SpotlightCard from '../components/landing/SpotlightCard.jsx'

const ease = [0.16, 1, 0.3, 1]

const PROBLEMS = [
  ['No way in, no reason to stay', 'Manara programs have no sign-up path, and nothing a student does shows up anywhere or adds up to anything.'],
  ['Muslim students cannot find each other', 'No place to meet a student two campuses over, or someone who already made the transfer you are planning.'],
  ['Platforms ignore Islamic boundaries', 'LinkedIn, Discord, and GroupMe mix brothers and sisters by default. Nobody designed for our boundaries.'],
  ['MSAs work in silos', 'Community college and 4-year MSAs rarely plan together, and small MSAs struggle alone until they fade.'],
]

const FEATURES = [
  {
    tag: '01',
    title: 'The Rihla Passport',
    body: 'Career, Leadership, Transfer, and Deen tracks. Earn a stamp at every event you check into, collect badges, and level up Explorer → Traveler → Navigator → Manara Fellow. Your passport is your profile — Deen progress stays private to you.',
    wide: true,
  },
  {
    tag: '02',
    title: 'Connect and chat, separately',
    body: 'Search brothers or sisters by campus, major, or transfer path. One helper gates every list, search, suggestion, mentor match, and chat.',
  },
  {
    tag: '03',
    title: 'A live network map',
    body: 'Manara sees every campus at once: which MSAs are linked, which are fading, and where the activity is. Link two MSAs as sister campuses in a click.',
  },
  {
    tag: '04',
    title: 'Co-hosted events',
    body: 'An MSA creates an event, invites a sister campus, and both get the credit. Community colleges and universities finally plan together.',
  },
  {
    tag: '05',
    title: 'Built for the transfer',
    body: 'Mesa → UCSD, De Anza → SJSU. Find the students who already made the jump you are planning, and ask them how.',
  },
]

const GATED = ['Profiles', 'Search', 'Suggestions', 'Connections', 'Chat', 'Mentors', 'Events']

export default function Landing() {
  const ccCount = CAMPUSES.filter((c) => c.type === 'cc').length

  return (
    <div>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative -mx-5 overflow-hidden rounded-[28px] px-5 py-16 sm:py-24">
        <Beam />
        <div className="relative">
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="font-mono text-xs tracking-[0.08em] text-gold uppercase"
          >
            Manara West · 65 campuses · one network
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, delay: 0.08, ease }}
            className="mt-4 text-[clamp(44px,9vw,104px)]"
          >
            Your journey.
            <br />
            Your network.
            <br />
            <span className="text-gold">One passport.</span>{' '}
            <span className="font-ar text-gold" style={{ fontSize: '.42em' }}>
              رحلة
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.18, ease }}
            className="mt-6 max-w-[56ch] text-lg text-mute"
          >
            A passport and professional network for Muslim students across Manara West. Your
            journey, badges, and progress <span className="text-cream">are</span> your profile —
            and you use it to connect with students, mentors, and MSA leaders on every campus.
            Separate spaces for brothers and sisters, built in from the first line of code.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.26, ease }}
            className="mt-9 flex flex-wrap items-start gap-4"
          >
            <Link to="/signup" className="btn btn-gold">
              Get your Rihla Passport →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-12 flex flex-wrap gap-x-10 gap-y-5"
          >
            <Stat n="65" label="campuses in the network" />
            <Stat n={CAMPUSES.length} label="live on the map today" />
            <Stat n={ccCount} label="community colleges" />
            <Stat n={EVENTS.length} label="events with check-in codes" />
          </motion.div>
        </div>
      </section>

      <Reveal className="-mx-5">
        <CampusMarquee />
      </Reveal>

      {/* --------------------------------------------------------- problem */}
      <section className="pt-24">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.08em] text-gold uppercase">The problem</p>
          <h2 className="mt-2 text-[clamp(32px,5.5vw,56px)]">
            65 campuses. No way to find each other.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {PROBLEMS.map(([head, body], i) => (
            <Reveal key={head} delay={0.06 * i}>
              <div className="card h-full">
                <h3 className="text-2xl">{head}</h3>
                <p className="mt-2 text-[15px] text-mute">{body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------------- features */}
      <section className="pt-24">
        <Reveal>
          <p className="font-mono text-xs tracking-[0.08em] text-gold uppercase">What you get</p>
          <h2 className="mt-2 text-[clamp(32px,5.5vw,56px)]">
            A passport, a network, and a map.
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {FEATURES.map((f, i) => (
            <Reveal key={f.tag} delay={0.06 * i} className={f.wide ? 'md:col-span-2' : ''}>
              <SpotlightCard className="h-full">
                <div className={f.wide ? 'grid items-center gap-7 sm:grid-cols-[1fr_auto]' : ''}>
                  <div>
                    <p className="font-mono text-xs tracking-[0.08em] text-gold uppercase">{f.tag}</p>
                    <h3 className="mt-2 text-[27px]">{f.title}</h3>
                    <p className="mt-2 max-w-[54ch] text-[15px] text-mute">{f.body}</p>
                  </div>
                  {f.wide && <PassportArt />}
                </div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------- the boundary */}
      <section className="pt-24">
        <Reveal>
          <div
            className="card"
            style={{ borderColor: '#e3b04b44', background: 'linear-gradient(160deg,#16275a66,#0b153044)' }}
          >
            <p className="font-mono text-xs tracking-[0.08em] text-gold uppercase">
              Judge feedback, built in
            </p>
            <h2 className="mt-3 text-[clamp(28px,4.5vw,46px)]">“No free mixing.”</h2>
            <p className="mt-4 max-w-[62ch] text-[15px] text-mute">
              Two judges told us the same thing, so it is not a setting — it is the architecture.
              Every user has a space, every event has an audience, and a single helper{' '}
              <code className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[13px] text-gold2">
                visibleUsers()
              </code>{' '}
              gates every profile, search, suggestion, mentor match, and chat. A brother account
              can never surface a sister profile anywhere in the app, and the reverse holds too.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {GATED.map((x) => (
                <span
                  key={x}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[13px] text-mute"
                >
                  {x} <span className="text-gold">✓</span>
                </span>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* -------------------------------------------------------------- cta */}
      <section className="py-24 text-center">
        <Reveal>
          <p className="font-ar text-4xl text-gold">رحلة</p>
          <h2 className="mx-auto mt-4 max-w-[24ch] text-[clamp(28px,5vw,52px)]">
            Rihla is traveling to seek knowledge. Start yours.
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/signup" className="btn btn-gold">
              Get your Rihla Passport →
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 pt-10 text-center text-[13px] text-mute">
        <p className="font-ar text-2xl text-gold">منارة</p>
        <p className="mt-2">Manara Rihla · MTC × Replit × Manara West Buildathon, UCSD</p>
      </footer>
    </div>
  )
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="font-display text-4xl text-gold">{n}</div>
      <div className="text-[13px] text-mute">{label}</div>
    </div>
  )
}

/** Miniature passport, so the lead feature card shows the thing itself. */
function PassportArt() {
  const stamps = ['MESA', 'UCSD', 'SDSU', 'UCLA', '', '']
  return (
    <div
      className="mx-auto w-[196px] shrink-0 rounded-[18px] border p-4"
      style={{
        borderColor: '#e3b04b66',
        background: 'linear-gradient(155deg,#16275a,#0b1530 60%)',
        boxShadow: '0 20px 50px #0009, inset 0 1px 0 #ffffff22',
      }}
      aria-hidden="true"
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.1em] text-gold uppercase">Rihla</span>
        <span className="rounded-full bg-bro/15 px-2 py-0.5 text-[9px] text-[#9db9ff]">🟦 Brothers</span>
      </div>
      <p className="font-display mt-2 text-lg">Omar K.</p>
      <p className="text-[10px] text-mute">Mesa → UCSD · Transfer</p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {stamps.map((st, i) => (
          <div
            key={i}
            className="grid aspect-square place-items-center rounded-full font-mono text-[8px]"
            style={
              st
                ? {
                    border: '1.5px solid #e3b04b',
                    color: '#e3b04b',
                    background: '#e3b04b14',
                    rotate: `${(i % 2 ? -1 : 1) * 6}deg`,
                  }
                : { border: '1.5px dashed #e3b04b44', color: '#c9a25a66' }
            }
          >
            {st}
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-gold to-gold2" />
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[9px] text-mute">
        <span>Explorer</span>
        <span>4 / 5</span>
      </div>
    </div>
  )
}
