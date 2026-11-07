// SHELL (feat/campus-events owns this file).
import { useMe } from '../lib/useStore.js'

export default function Campus() {
  const me = useMe()
  return <h1 className="text-5xl">{me.position} dashboard <span className="text-mute">(TODO: feat/campus-events)</span></h1>
}
