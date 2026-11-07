import { useState } from 'react'
import { campusById } from '../store.js'

// Each school's own domain: the logo loads from there (Google favicon service). Monogram shows if it can't.
const DOMAINS = {
  usc: 'usc.edu', moorpark: 'moorparkcollege.edu', ucsb: 'ucsb.edu', ucla: 'ucla.edu', uci: 'uci.edu', ucsd: 'ucsd.edu', csusb: 'csusb.edu', ucr: 'ucr.edu',
  csulb: 'csulb.edu', smc: 'smc.edu', cpp: 'cpp.edu', csun: 'csun.edu', mtsac: 'mtsac.edu', unlv: 'unlv.edu', asu: 'asu.edu', claremont: 'claremont.edu',
  elcamino: 'elcamino.edu', csusm: 'csusm.edu', csuf: 'fullerton.edu', csudh: 'csudh.edu', csub: 'csub.edu', santiago: 'sccollege.edu', pierce: 'piercecollege.edu',
  chaffey: 'chaffey.edu', occ: 'orangecoastcollege.edu', csula: 'calstatela.edu', chapman: 'chapman.edu', rcc: 'rcc.edu', norco: 'norcocollege.edu',
  caltech: 'caltech.edu', miramar: 'sdmiramar.edu', mesa: 'sdmesa.edu', ucb: 'berkeley.edu', ucd: 'ucdavis.edu', ohlone: 'ohlone.edu', ucm: 'ucmerced.edu',
  sfsu: 'sfsu.edu', csueb: 'csueastbay.edu', pacific: 'pacific.edu', usf: 'usfca.edu', fresnostate: 'fresnostate.edu', stanford: 'stanford.edu',
  calpolyslo: 'calpoly.edu', foothill: 'foothill.edu', csus: 'csus.edu', sjsu: 'sjsu.edu', scu: 'scu.edu', dominican: 'dominican.edu', zaytuna: 'zaytuna.edu',
  fcc: 'fresnocitycollege.edu', ucsc: 'ucsc.edu', clovis: 'cloviscollege.edu', dvc: 'dvc.edu', mission: 'missioncollege.edu', deanza: 'deanza.edu',
  missionearly: 'missioncollege.edu', arc: 'arc.losrios.edu', laspositas: 'laspositascollege.edu', nau: 'nau.edu', cuboulder: 'colorado.edu',
}
const hue = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7)

/** Campus logo in a circle. `id` is a campus id ('other' / unknown = monogram only). */
export default function Crest({ id, size = 40, className = '' }) {
  const [bad, setBad] = useState(false)
  const c = campusById(id)
  const short = c?.short ?? '?'
  const dom = DOMAINS[id]
  const fs = short.length <= 2 ? size * 0.36 : short.length <= 4 ? size * 0.27 : size * 0.21
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 ${className}`} style={{ width: size, height: size, background: `hsl(${hue(id ?? '?')} 38% 30%)` }} role="img" aria-label={`${c?.name ?? 'College'} logo`}>
      <span className="absolute inset-0 grid place-items-center font-bold tracking-tight text-white" style={{ fontSize: fs }}>{short.slice(0, 5)}</span>
      {dom && !bad && <img src={`https://www.google.com/s2/favicons?domain=${dom}&sz=128`} alt="" loading="lazy" onError={() => setBad(true)} className="absolute inset-0 h-full w-full bg-white object-contain p-[13%]" />}
    </span>
  )
}
