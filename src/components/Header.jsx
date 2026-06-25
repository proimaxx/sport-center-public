import { useNavigate } from 'react-router-dom'
import { esci } from '../firebase/services'
import { useAuth } from '../hooks/useAuth'

export default function Header() {
  const user = useAuth()
  const navigate = useNavigate()

  const handleEsci = async () => {
    await esci()
    navigate('/login')
  }

  return (
    <header style={{
      background: 'white', borderBottom: '0.5px solid #e0e0dc',
      padding: '0 1rem', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <span style={{ fontSize: 20 }}>🎾</span>
        <span style={{ fontWeight: 500, fontSize: 16 }}>Sport Center</span>
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => navigate('/prenotazioni')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 8, fontSize: 13,
              background: '#E6F1FB', color: '#0C447C',
              border: '0.5px solid #85B7EB', fontWeight: 500, cursor: 'pointer'
            }}>
            📋 Prenotazioni
          </button>
          <button onClick={() => navigate('/account')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 12px', borderRadius: 8, fontSize: 13,
              background: '#f5f5f3', color: '#444',
              border: '0.5px solid #e0e0dc', fontWeight: 500, cursor: 'pointer'
            }}>
            👤 Account
          </button>
        </div>
      )}
    </header>
  )
}
