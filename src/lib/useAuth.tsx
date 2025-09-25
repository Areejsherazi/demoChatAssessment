import React, { createContext, useContext, useEffect, useState } from 'react'
import api from './api'
import { deriveMasterKey } from './crypto'

type User = { id: string; email: string; displayName?: string } | null

const AuthContext = createContext<any>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useProvideAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

function useProvideAuth() {
  const [user, setUser] = useState<User>(null)
  useEffect(() => {
    const t = localStorage.getItem('sc_token')
    const u = localStorage.getItem('sc_user')
    if (t && u) setUser(JSON.parse(u))
  }, [])

  async function login(email: string, password: string) {
    // call backend login endpoint returning token + user
    const res = await api.post('/auth/login', { body: { email, password } })
    const data = await res.json()
    localStorage.setItem('sc_token', data.token)
    localStorage.setItem('sc_user', JSON.stringify(data.user))
    setUser(data.user)


    const { key } = await deriveMasterKey(password, loadOrCreateSalt())
    // export raw master key to session
    const rawMaster = await crypto.subtle.exportKey('raw', key)
    sessionStorage.setItem('sc_master_key_b64', btoa(String.fromCharCode(...new Uint8Array(rawMaster))))
    // also store master pw hashed indicator in session (to know it's available)
    sessionStorage.setItem('sc_master_pw', 'present')
  }

  async function register(email: string, password: string, displayName?: string) {
    const res = await api.post('/auth/register', { body: { email, password, displayName } })
    const data = await res.json()
    // after register, auto-login
    await login(email, password)
    return data
  }

  function logout() {
    localStorage.removeItem('sc_token')
    localStorage.removeItem('sc_user')
    sessionStorage.removeItem('sc_master_key_b64')
    sessionStorage.removeItem('sc_master_pw')
    setUser(null)
    // do not call backend here (optional)
    window.location.href = '/login'
  }

  return { user, login, register, logout }
}

function loadOrCreateSalt() {
  const key = 'sc_master_salt'
  const v = localStorage.getItem(key)
  if (v) return new Uint8Array(atob(v).split('').map(c => c.charCodeAt(0)))
  const s = crypto.getRandomValues(new Uint8Array(16))
  localStorage.setItem(key, btoa(String.fromCharCode(...s)))
  return s
}
