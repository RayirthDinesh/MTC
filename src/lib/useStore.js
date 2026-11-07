import { useSyncExternalStore } from 'react'
import { getState, subscribe, currentUser } from '../store.js'

/** Returns the whole state; re-renders on any store change (including other tabs). */
export const useStore = () => useSyncExternalStore(subscribe, getState)
export const useMe = () => { const s = useStore(); return currentUser(s) }
