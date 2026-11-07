import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useMe, useStore } from './lib/useStore.js'
import { page } from './lib/motion.js'
import Navbar from './components/Navbar.jsx'
import ChatBubble from './components/ChatBubble.jsx'
import Landing from './pages/Landing.jsx'
import Signup from './pages/Signup.jsx'
import Student from './pages/Student.jsx'
import Campus from './pages/Campus.jsx'
import Admin from './pages/Admin.jsx'

export const HOME = { student: '/student', leader: '/campus', admin: '/admin' }

// Route guard: wrong or no user bounces to the right place.
function Guard({ role, children }) {
  const { ready } = useStore()
  const me = useMe()
  if (!ready) return null // wait for the first server snapshot
  if (!me) return <Navigate to="/" replace />
  if (me.role !== role) return <Navigate to={HOME[me.role]} replace />
  return children
}

export default function App() {
  const loc = useLocation()
  const isApp = /^\/(student|campus|admin)/.test(loc.pathname)
  useEffect(() => { document.body.classList.toggle('app', isApp) }, [isApp])
  return (
    <>
      <Navbar />
      <AnimatePresence mode="wait">
        <motion.main key={loc.pathname} {...page} className={`mx-auto px-5 pb-20 ${isApp ? 'max-w-[1128px] pt-[4.5rem]' : 'max-w-6xl pt-24'}`}>
          <Routes location={loc}>
            <Route path="/" element={<Landing />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/student" element={<Guard role="student"><Student /></Guard>} />
            <Route path="/campus" element={<Guard role="leader"><Campus /></Guard>} />
            <Route path="/admin" element={<Guard role="admin"><Admin /></Guard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </motion.main>
      </AnimatePresence>
      <ChatBubble />
    </>
  )
}
