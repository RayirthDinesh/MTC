// SHELL (feat/landing-signup replaces this). Keep the Demo login: it is the demo's fast path.
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/useStore.js'
import { login } from '../store.js'
import { HOME } from '../App.jsx'

export default function Landing() {
  const { users } = useStore()
  const nav = useNavigate()
  const pick = (id) => { if (!id) return; login(id); nav(HOME[users.find((u) => u.id === id).role]) }
  return (
    <section className="py-16">
      <h1 className="text-6xl sm:text-8xl">Your journey.<br />Your network.<br /><span className="text-gold">One passport.</span></h1>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link to="/signup" className="btn btn-gold">Sign up</Link>
        <select aria-label="Demo login" className="input !w-auto" defaultValue="" onChange={(e) => pick(e.target.value)}>
          <option value="" disabled>Demo login…</option>
          {users.map((u) => <option key={u.id} value={u.id}>{u.name} · {u.role} · {u.gender}</option>)}
        </select>
      </div>
    </section>
  )
}
