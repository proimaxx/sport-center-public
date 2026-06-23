import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './styles/global.css'
import { AuthProvider, useAuth } from './hooks/useAuth'
import Header from './components/Header'
import Auth from './pages/Auth'
import Home from './pages/Home'
import Prenota from './pages/Prenota'
import Piscina from './pages/Piscina'
import MiePrenotazioni from './pages/MiePrenotazioni'

function PrivateRoute({ children }) {
  const user = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const user = useAuth()
  return (
    <>
      {user && <Header />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth />} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/prenota" element={<PrivateRoute><Prenota /></PrivateRoute>} />
        <Route path="/piscina" element={<PrivateRoute><Piscina /></PrivateRoute>} />
        <Route path="/prenotazioni" element={<PrivateRoute><MiePrenotazioni /></PrivateRoute>} />
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
