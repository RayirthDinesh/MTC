// Landing. Three sections: the pitch, the one thing that makes us different,
// the way in. Everything else lives inside the product.
import { motion } from 'framer-motion'
import { CAMPUSES } from '../data/seed.js'
import NightSky from '../components/landing/NightSky.jsx'
import PassportCard from '../components/landing/PassportCard.jsx'
import ProfileShowcase from '../components/landing/ProfileShowcase.jsx'
import MagneticButton from '../components/landing/MagneticButton.jsx'
import Reveal from '../components/landing/Reveal.jsx'

const ease = [0.16, 1, 0.3, 1]
const rise = (delay) => ({
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay, ease },
})

export default function Landing() {
  return (
    <div>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative left-1/2 -mt-24 w-screen -translate-x-1/2 overflow-hidden">
        <NightSky />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pt-36 pb-24 lg:grid-cols-[1.1fr_minmax(0,330px)]">
          <div>
            <motion.p {...rise(0)} className="font-mono text-[11px] tracking-[0.2em] text-sun uppercase">
              Manara West · 65 campuses
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.06, ease }}
              className="mt-5 text-[clamp(44px,7.6vw,92px)] font-semibold"
            >
              Travel to seek knowledge.
              <br />
              <span className="text-sun">Carry the proof.</span>
            </motion.h1>

            <motion.p {...rise(0.16)} className="mt-6 max-w-[42ch] text-[17px] text-mute">
              Show up at an MSA event, get the stamp. Your passport becomes your profile —
              and your network across every campus.
            </motion.p>

            <motion.div {...rise(0.24)} className="mt-9 flex flex-wrap items-start gap-3">
              <MagneticButton to="/signup" variant="sun">
                Get your passport
              </MagneticButton>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 34, rotate: -6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2, ease }}
            className="relative mx-auto w-full max-w-[330px]"
          >
            <PassportCard stamps={['Mesa', 'UCSD', 'SDSU', 'UCLA', '']} filled={4} photo="/people/brother.jpg" />
            <p className="mt-5 text-center font-mono text-[10px] tracking-[0.18em] text-mute/70 uppercase">
              drag it
            </p>
          </motion.div>
        </div>
      </section>

      {/* -------------------------------------------- the one differentiator */}
      <section className="pt-28">
        <Reveal>
          <h2 className="text-[clamp(30px,4.6vw,52px)] font-semibold">Two spaces. No overlap.</h2>
          <p className="mt-3 max-w-[46ch] text-[16px] text-mute">
            Judges told us: no free mixing. So it is the architecture, not a setting.
          </p>
        </Reveal>
        <div className="mt-10">
          <ProfileShowcase />
        </div>
      </section>

      {/* ------------------------------------------------------------- cta */}
      <section className="py-28 text-center">
        <Reveal>
          <p className="font-ar text-3xl text-sun">رحلة</p>
          <h2 className="mt-4 text-[clamp(30px,5vw,56px)] font-semibold">Start your rihla.</h2>
          <div className="mt-8 flex justify-center">
            <MagneticButton to="/signup" variant="sun">
              Get your passport
            </MagneticButton>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-[13px] text-mute">
        Manara Rihla · {CAMPUSES.length} campuses live
      </footer>
    </div>
  )
}
