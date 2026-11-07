// API + SSE. `npm run dev` runs this beside Vite (proxied at /api). Identity = x-user-id header (demo auth, no passwords).
import express from 'express'
import { pathToFileURL } from 'node:url'
import { view, plan, actions, getUser, usernameTaken } from './actions.js'

export const app = express()
app.use(express.json({ limit: '20kb' }))

const clients = new Set()
const broadcast = () => clients.forEach((r) => r.write('data: change\n\n'))
const actor = (req) => getUser(req.get('x-user-id'))

app.get('/api/stream', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
  res.flushHeaders()
  res.write('retry: 1000\n\n')
  clients.add(res)
  req.on('close', () => clients.delete(res))
})
app.get('/api/state', (req, res) => res.json(view(actor(req))))
app.get('/api/plan', (req, res) => res.json(plan(req.query)))
app.get('/api/username/:u', (req, res) => res.json({ taken: usernameTaken(req.params.u) }))

app.post('/api/:action', (req, res) => {
  const fn = Object.hasOwn(actions, req.params.action) ? actions[req.params.action] : null
  if (!fn) return res.status(404).json({ ok: false, reason: 'Unknown action' })
  try {
    const r = fn(actor(req), req.body ?? {})
    if (r.ok) broadcast()
    res.status(r.ok || !r.forbidden ? 200 : 403).json(r)
  } catch (e) {
    console.error(e)
    res.status(500).json({ ok: false, reason: 'Server error' })
  }
})

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = process.env.API_PORT || 3001 // not PORT: dev harnesses set PORT for the web server
  app.listen(port, () => console.log(`rihla api on :${port}`))
}
