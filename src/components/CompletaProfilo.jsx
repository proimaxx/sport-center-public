import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { db } from '../firebase/config'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase/config'

export default function CompletaProfilo({ onComplete }) {
  const user = useAuth()
  const [form, setForm] = useState({ nome: '', cognome: '', telefono: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSalva = async () => {
    setError('')
    if (!form.nome.trim() || !form.cognome.trim() || !form.telefono.trim()) {
      setError('Compila tutti i campi per continuare')
      return
    }
    if (!/^3\d{8,9}$/.test(form.telefono)) {
      setError('Numero non valido (es. 3331234567)')
      return
    }
    setLoading(true)
    try {
      await updateProfile(auth.currentUser, {
        displayName: `${form.nome} ${form.cognome}`
      })
      await setDoc(doc(db, 'utenti', user.uid), {
        uid: user.uid,
        email: user.email,
        nome: form.nome,
        cognome: form.cognome,
        telefono: form.telefono,
        createdAt: serverTimestamp()
      })
      onComplete()
    } catch (e) {
      setError('Errore: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👤</div>
          <h2 style={{ fontSize: 20, fontWeight: 500, marginBottom: 4 }}>Completa il tuo profilo</h2>
          <p style={{ fontSize: 13, color: '#888' }}>Inserisci i tuoi dati per poter prenotare</p>
        </div>

        {error && (
          <div style={{ background: '#FCEBEB', color: '#A32D2D', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Nome</label>
            <input placeholder="Nome" value={form.nome} onChange={e => set('nome', e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Cognome</label>
            <input placeholder="Cognome" value={form.cognome} onChange={e => set('cognome', e.target.value)} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, color: '#666', display: 'block', marginBottom: 4 }}>Telefono</label>
          <input placeholder="es. 3331234567" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
        </div>

        <button className="btn-primary" onClick={handleSalva} disabled={loading}>
          {loading ? 'Salvataggio...' : 'Salva e continua'}
        </button>
      </div>
    </div>
  )
}
