const STYLE = {
  brother: { label: 'Brothers', icon: '🟦', cls: 'bg-bro/15 text-[#9db9ff]' },
  sister: { label: 'Sisters', icon: '🟪', cls: 'bg-sis/15 text-[#d2b8ff]' },
  brothers: { label: 'Brothers', icon: '🟦', cls: 'bg-bro/15 text-[#9db9ff]' },
  sisters: { label: 'Sisters', icon: '🟪', cls: 'bg-sis/15 text-[#d2b8ff]' },
  everyone: { label: 'Everyone', icon: '🌙', cls: 'bg-gold/15 text-gold2' },
}

/** Accepts a user gender ('brother'|'sister') or an event audience ('brothers'|'sisters'|'everyone'). */
export default function GenderPill({ value }) {
  const s = STYLE[value]
  if (!s) return null
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.icon} {s.label}</span>
}
