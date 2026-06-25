import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import './styles/global.css'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header from './components/Header'
import CompletaProfilo from './components/CompletaProfilo'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Prenota from './pages/Prenota'
import Piscina from './pages/Piscina'
import Estivi from './pages/Estivi'
import MiePrenotazioni from './pages/MiePrenotazioni'
import Account from './pages/Account'
import { db } from './firebase/config'
import { doc, getDoc } from 'firebase/firestore'

function PrivateRoute({ children }) {
  const user = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const user = useAuth()
  const [profiloCompleto, setProfiloCompleto] = useState(true)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) { setChecking(false); return }
    getDoc(doc(db, 'utenti', user.uid)).then(snap => {
      if (!snap.exists() || !snap.data().telefono) {
        setProfiloCompleto(false)
      } else {
        setProfiloCompleto(true)
      }
      setChecking(false)
    })
  }, [user])

  if (checking) return null

  return (
    <>
      {user && <Header />}
      {user && !profiloCompleto && (
        <CompletaProfilo onComplete={() => setProfiloCompleto(true)} />
      )}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/prenota" element={<PrivateRoute><Prenota /></PrivateRoute>} />
        <Route path="/piscina" element={<PrivateRoute><Piscina /></PrivateRoute>} />
        <Route path="/estivi" element={<PrivateRoute><Estivi /></PrivateRoute>} />
        <Route path="/prenotazioni" element={<PrivateRoute><MiePrenotazioni /></PrivateRoute>} />
        <Route path="/account" element={<PrivateRoute><Account /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
