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
      padding: '0 1.5rem', height: 56,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      position: 'sticky', top: 0, zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => navigate('/')}>
        <span style={{ fontSize: 20 }}>🎾</span>
        <span style={{ fontWeight: 500, fontSize: 16 }}>Sport Center</span>
      </div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span
            style={{ fontSize: 13, color: '#666', cursor: 'pointer' }}
            onClick={() => navigate('/prenotazioni')}
          >
            Le mie prenotazioni
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: '#E6F1FB', color: '#0C447C',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 500
            }}>
              {user.displayName?.charAt(0).toUpperCase() || '?'}
            </div>
            <button onClick={handleEsci} style={{ fontSize: 13, padding: '5px 12px' }}>Esci</button>
          </div>
        </div>
      )}
    </header>
  )
}
