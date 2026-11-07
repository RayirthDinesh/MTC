// Landing, from the mockup: word-by-word headline, lighthouse beam + the draggable passport, campus logo marquee,
// two-spaces showcase, three feature cards, CTA. Flat colors only.
import { motion } from 'framer-motion'
import { CAMPUSES } from '../data/seed.js'
import Lighthouse from '../components/landing/Lighthouse.jsx'
import PassportCard from '../components/landing/PassportCard.jsx'
import ProfileShowcase from '../components/landing/ProfileShowcase.jsx'
import MagneticButton from '../components/landing/MagneticButton.jsx'
import Reveal from '../components/landing/Reveal.jsx'
import Crest from '../components/Crest.jsx'
import BlurText from '../components/fx/BlurText.jsx'
import TiltCard from '../components/fx/TiltCard.jsx'

const ease = [0.16, 1, 0.3, 1]
const rise = (delay) => ({ initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay, ease } })
const LINES = [['Travel', 'to', 'seek', 'knowledge.'], ['Carry', 'the', 'proof.']]
const FEATURES = [
  ['M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0zm8-4v4l3 2', 'Rihla Passport', 'Stamps, badges and levels. Every event you attend adds to your journey. Deen progress stays private.'],
  ['M16 11a4 4 0 1 0-8 0M4 20c0-4 4-6 8-6s8 2 8 6', 'A network that fits', 'Find students by campus, major or transfer path, and message people who made the jump you are planning.'],
  ['M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', 'A live network map', 'Manara sees every campus at once, links MSAs as sister campuses, and spots the ones fading.'],
]
const LOGOS = CAMPUSES.filter((c) => ['ucsd', 'mesa', 'ucla', 'smc', 'uci', 'occ', 'ucr', 'rcc', 'usc', 'sjsu', 'deanza', 'ucb', 'stanford', 'dvc', 'ucd', 'csulb', 'asu', 'caltech'].includes(c.id))

export default function Landing() {
  let w = 0
  return (
    <div>
      {/* hero */}
      <section className="relative left-1/2 -mt-24 w-screen -translate-x-1/2 overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-32">
          <h1 className="relative z-10 text-[clamp(40px,6.6vw,88px)] font-semibold" aria-label="Travel to seek knowledge. Carry the proof.">
            {LINES.map((line, li) => (
              <span key={li} className="block md:whitespace-nowrap" aria-hidden="true">
                {line.map((t) => (
                  <span key={t + w} className="mr-[.22em] inline-block overflow-hidden align-top pb-[.08em]">
                    <motion.span className={`inline-block ${li ? 'text-sun' : ''}`} initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 1, ease, delay: 0.12 + 0.07 * w++ }}>{t}</motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <div className="mt-6 grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_480px]">
          <div className="relative z-10 lg:pt-2">
            <motion.p {...rise(0.9)} className="max-w-[40ch] text-[20px] text-mute">Show up at an MSA event, earn a stamp. Your passport becomes your profile, and your network across every campus.</motion.p>
            <motion.div {...rise(1.05)} className="mt-9 flex flex-wrap items-start gap-3"><MagneticButton to="/signup" variant="sun">Get your passport</MagneticButton></motion.div>
          </div>

          <div className="relative mx-auto flex w-full max-w-[480px] items-end justify-center gap-2 sm:gap-4 lg:-mt-[clamp(56px,8.4vw,120px)]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.3, ease }} className="w-[34%] shrink-0 self-end"><Lighthouse /></motion.div>
            <motion.div initial={{ opacity: 0, y: 34, rotate: -6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 1, delay: 0.5, ease }} className="relative w-[62%] max-w-[330px] pb-6">
              <PassportCard stamps={['mesa', 'ucsd', 'ucla', 'uci', '', '']} filled={4} photo="/people/brother.jpg" />
              <p className="mt-5 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-mute/70">drag it</p>
            </motion.div>
          </div>
          </div>
        </div>
      </section>

      {/* campus logo marquee */}
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-6 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]" aria-label="Campuses in the network">
        <div className="landing-marquee flex w-max gap-11">
          {[...LOGOS, ...LOGOS].map((c, i) => <div key={c.id + i} className="flex items-center gap-3 whitespace-nowrap font-medium text-mute"><Crest id={c.id} size={38} />{c.name}</div>)}
        </div>
      </div>

      {/* two spaces */}
      <section className="pt-24">
        <Reveal>
          <BlurText as="h2" text="Two spaces. No overlap." className="block max-w-[10em] text-[clamp(30px,4.6vw,52px)] font-semibold" />
          <p className="mt-4 max-w-[46ch] text-[17px] text-mute">Brothers and sisters each get their own network. Profiles, search, suggestions and chat never cross, by design.</p>
        </Reveal>
        <div className="mt-10"><ProfileShowcase /></div>
      </section>

      {/* features */}
      <section className="pt-28">
        <BlurText as="h2" text="Everything a journey needs." className="block max-w-[12em] text-[clamp(30px,4.6vw,52px)] font-semibold" />
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {FEATURES.map(([d, t, b], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <TiltCard className="card !p-7">
                <span className="mb-14 grid h-12 w-12 place-items-center rounded-2xl bg-sun/15 text-sun"><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg></span>
                <h3 className="text-xl font-semibold">{t}</h3><p className="mt-2 text-[15px] text-mute">{b}</p>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* cta */}
      <section className="py-28 text-center">
        <Reveal>
          <p className="font-ar text-3xl text-sun">رحلة</p>
          <BlurText as="h2" text="Your journey starts at the next event." className="mt-4 block text-[clamp(30px,5vw,56px)] font-semibold" />
          <div className="mt-8 flex justify-center"><MagneticButton to="/signup" variant="sun">Get your passport</MagneticButton></div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-[13px] text-mute">Manara Rihla · {CAMPUSES.length} campuses live</footer>

      <style>{`
        .landing-marquee { animation: landing-slide 60s linear infinite; }
        .landing-marquee:hover { animation-play-state: paused; }
        @keyframes landing-slide { to { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}
