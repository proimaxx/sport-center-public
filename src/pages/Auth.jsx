import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { accedi, registra, resetPassword, accediConGoogle } from '../firebase/services'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', nome: '', cognome: '', telefono: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const errMsg = (e) => ({
    'auth/user-not-found': 'Email non trovata',
    'auth/wrong-password': 'Password errata',
    'auth/invalid-credential': 'Email o password errati',
    'auth/email-already-in-use': 'Email già registrata',
    'auth/weak-password': 'Password troppo corta (min 6 caratteri)',
    'auth/invalid-email': 'Email non valida',
    'auth/popup-closed-by-user': 'Accesso annullato',
  }[e.code] || e.message)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await accedi(form.email, form.password)
        navigate('/')
      } else if (mode === 'registra') {
        if (!form.nome || !form.cognome || !form.telefono) throw new Error('Compila tutti i campi')
        if (!/^3\d{8,9}$/.test(form.telefono)) throw new Error('Numero non valido (es. 3331234567)')
        await registra(form)
        navigate('/')
      } else {
        await resetPassword(form.email)
        setResetSent(true)
      }
    } catch (e) { setError(errMsg(e)) }
    setLoading(false)
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await accediConGoogle()
      navigate('/')
    } catch (e) { setError(errMsg(e)) }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f3', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎾</div>
          <h1 style={{ fontSize: 22, fontWeight: 500 }}>Sport Center</h1>
          <p style={{ color: '#888', fontSize: 14, marginTop: 4 }}>Prenota il tuo campo</p>
        </div>
        <div className="card">
          <div style={{ display: 'flex', marginBottom: '1.5rem', borderBottom: '0.5px solid #e0e0dc' }}>
            {['login', 'registra'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                style={{
                  flex: 1, border: 'none', background: 'none', padding: '10px',
                  fontWeight: mode === m ? 500 : 400,
                  color: mode === m ? '#185FA5' : '#888',
                  borderBottom: mode === m ? '2px solid #185FA5' : '2px solid transparent',
                  borderRadius: 0
                }}>
                {m === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>
          {error && <div className="error-msg">{error}</div>}
          <button onClick={handleGoogle} disabled={loading}
            style={{
              width: '100%', padding: '11px', marginBottom: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              border: '0.5px solid #e0e0dc', borderRadius: 8, background: 'white',
              fontWeight: 500, fontSize: 14, color: '#1a1a1a'
            }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Continua con Google
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: '0.5px', background: '#e0e0dc' }}></div>
            <span style={{ fontSize: 12, color: '#aaa' }}>oppure</span>
            <div style={{ flex: 1, height: '0.5px', background: '#e0e0dc' }}></div>
          </div>
          {mode === 'registra' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
              <input placeholder="Nome" value={form.nome} onChange={e => set('nome', e.target.value)} />
              <input placeholder="Cognome" value={form.cognome} onChange={e => set('cognome', e.target.value)} />
            </div>
          )}
          {mode === 'registra' && (
            <input placeholder="Telefono (es. 3331234567)" value={form.telefono}
              onChange={e => set('telefono', e.target.value)} style={{ marginBottom: 10 }} />
          )}
          <input placeholder="Email" type="email" value={form.email}
            onChange={e => set('email', e.target.value)} style={{ marginBottom: 10 }} />
          <input placeholder="Password" type="password" value={form.password}
            onChange={e => set('password', e.target.value)} style={{ marginBottom: 16 }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Caricamento...' : mode === 'login' ? 'Accedi' : 'Crea account'}
          </button>
          {mode === 'login' && (
            <button onClick={() => { setMode('reset'); setError('') }}
              style={{ marginTop: 10, width: '100%', background: 'none', border: 'none', color: '#888', fontSize: 13 }}>
              Password dimenticata?
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
