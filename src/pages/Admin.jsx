// SHELL (feat/admin-map owns this file).
import { useStore } from '../lib/useStore.js'

export default function Admin() {
  const s = useStore()
  return (
    <div>
      <h1 className="text-5xl">Network map <span className="text-mute">(TODO: feat/admin-map)</span></h1>
      <p className="mt-4 text-mute">{s.users.length} users · {s.links.length} links · {s.activity.length} activity events</p>
    </div>
  )
}
