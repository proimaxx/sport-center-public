import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { esci } from '../firebase/services'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export default function Account() {
  const user = useAuth()
  const navigate = useNavigate()
  const [dati, setDati] = useState(null)

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'utenti', user.uid)).then(snap => {
      if (snap.exists()) setDati(snap.data())
    })
  }, [user])

  const handleEsci = async () => {
    await esci()
    navigate('/login')
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <button onClick={() => navigate('/')}
        style={{ marginBottom: '1.25rem', background: 'white', border: '0.5px solid #e0e0dc', color: '#1a1a1a', fontSize: 14, padding: '9px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, cursor: 'pointer' }}>
        ← Torna alla home
      </button>

      <h1 style={{ marginBottom: '1.5rem' }}>👤 Account</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: '1rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#E6F1FB', color: '#0C447C',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 500
          }}>
            {user?.displayName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 18 }}>{user?.displayName}</div>
            <div style={{ fontSize: 13, color: '#888' }}>{user?.email}</div>
          </div>
        </div>

        {dati && (
          <div style={{ borderTop: '0.5px solid #e0e0dc', paddingTop: '1rem' }}>
            {dati.telefono && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: '0.5px solid #f0f0ee' }}>
                <span style={{ color: '#888' }}>Telefono</span>
                <span style={{ fontWeight: 500 }}>{dati.telefono}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14 }}>
              <span style={{ color: '#888' }}>Account</span>
              <span style={{ fontWeight: 500 }}>{user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'Email'}</span>
            </div>
          </div>
        )}
      </div>

      <button onClick={handleEsci}
        style={{ width: '100%', padding: '12px', background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F09595', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>
        Esci dall'account
      </button>
    </div>
  )
}
