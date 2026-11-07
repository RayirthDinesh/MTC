import { motion, useReducedMotion } from 'framer-motion'

/** React Bits-style BlurText: each word blurs, rises and sharpens in turn when scrolled into view. */
export default function BlurText({ text, className = '', delay = 0.07, as: Tag = 'span' }) {
  const reduced = useReducedMotion()
  const M = motion[Tag] ?? motion.span
  return (
    <M className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.6 }} transition={{ staggerChildren: reduced ? 0 : delay }}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i} aria-hidden="true" className="mr-[.25em] inline-block" variants={{ hidden: { opacity: 0, y: 24, filter: 'blur(10px)' }, show: { opacity: 1, y: 0, filter: 'blur(0px)' } }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>{w}</motion.span>
      ))}
    </M>
  )
}
