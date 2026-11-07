const STYLE = {
  brother: { label: 'Brothers', icon: '🟦', cls: 'bg-bro/15 text-bro' },
  sister: { label: 'Sisters', icon: '🟪', cls: 'bg-sis/15 text-sis' },
  brothers: { label: 'Brothers', icon: '🟦', cls: 'bg-bro/15 text-bro' },
  sisters: { label: 'Sisters', icon: '🟪', cls: 'bg-sis/15 text-sis' },
  everyone: { label: 'Everyone', icon: '🌙', cls: 'bg-black/5 text-mute' },
}

/** Accepts a user gender ('brother'|'sister') or an event audience ('brothers'|'sisters'|'everyone'). */
export default function GenderPill({ value }) {
  const s = STYLE[value]
  if (!s) return null
  return <span className={`inline-block self-start whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>{s.icon} {s.label}</span>
}
