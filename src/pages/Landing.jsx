// Landing: pitch + Sign up (Front Door quiz) + username log in. No demo/fake accounts picker.
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginByUsername } from '../store.js'
import { HOME } from '../App.jsx'

export default function Landing() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const submit = (e) => {
    e.preventDefault()
    const u = loginByUsername(name)
    if (!u) return setErr('No account with that username. Sign up instead?')
    nav(HOME[u.role])
  }
  return (
    <section className="py-16">
      <h1 className="text-6xl sm:text-8xl">Your journey.<br />Your network.<br /><span className="text-gold">One passport.</span></h1>
      <p className="mt-6 max-w-xl text-lg text-mute">A passport and professional network for Muslim students across Manara West campuses, with separate spaces for brothers and sisters.</p>
      <div className="mt-8 flex flex-wrap items-start gap-4">
        <Link to="/signup" className="btn btn-gold">Sign up</Link>
        <form onSubmit={submit} className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input className="input !w-56" aria-label="Username" placeholder="Username" value={name} onChange={(e) => { setName(e.target.value); setErr('') }} />
            <button className="btn btn-glass" type="submit" disabled={!name.trim()}>Log in</button>
          </div>
          {err && <p role="alert" className="text-sm text-fading">{err}</p>}
        </form>
      </div>
    </section>
  )
}
