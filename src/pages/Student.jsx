// SHELL (feat/student-passport owns this file; feat/connect-chat adds Connect + Chat tabs).
import { useMe } from '../lib/useStore.js'
import { levelOf } from '../store.js'

export default function Student() {
  const me = useMe()
  return (
    <div>
      <h1 className="text-5xl">Rihla Passport <span className="text-mute">(TODO: feat/student-passport)</span></h1>
      <p className="mt-4 text-mute">{me.name} · {me.stamps.length} stamps · {levelOf(me.stamps)}</p>
    </div>
  )
}
