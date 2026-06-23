import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribePrenotazioniUtente } from '../firebase/services'
import { useAuth } from '../hooks/useAuth'
import { db } from '../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'

const SPORT_LABELS = { tennis: 'Tennis', padel: 'Padel', pickleball: 'Pickleball', calcio5: 'Calcio a 5' }

export default function MiePrenotazioni() {
  const user = useAuth()
  const navigate = useNavigate()
  const [prenotazioni, setPrenotazioni] = useState([])

  useEffect(() => {
    if (!user) return
    const unsub = subscribePrenotazioniUtente(user.uid, setPrenotazioni)
    return unsub
  }, [user])

  const oggi = new Date().toISOString().split('T')[0]

  const puoCancellare = (p) => {
    const now = new Date()
    const orarioPartita = new Date(`${p.data}T${p.orario}:00`)
    const diffOre = (orarioPartita - now) / (1000 * 60 * 60)
    return diffOre >= 2 && p.stato === 'confermata'
  }

  const handleCancella = async (id) => {
    if (!confirm('Vuoi cancellare questa prenotazione?')) return
    await updateDoc(doc(db, 'prenotazioni', id), { stato: 'cancellata' })
  }

  const future = prenotazioni.filter(p => p.data >= oggi && p.stato === 'confermata')
  const passate = prenotazioni.filter(p => p.data < oggi || p.stato === 'cancellata')

  const CardPren = ({ p }) => (
    <div className="card" style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ minWidth: 52, textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 500 }}>{p.orario}</div>
        <div style={{ fontSize: 11, color: '#888' }}>{p.durataMin}min</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span style={{ fontWeight: 500 }}>{p.campoNome}</span>
          <span className={`badge badge-${p.sport}`}>{SPORT_LABELS[p.sport] || p.sport}</span>
          <span className={`badge badge-${p.stato}`}>{p.stato}</span>
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          {new Date(p.data + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
          {' · '}{p.tipoPartita} · €{p.prezzo?.toFixed(2)} in loco
        </div>
        {p.giocatori && p.giocatori.length > 0 && (
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
            👥 {p.giocatori.join(', ')}
          </div>
        )}
      </div>
      {puoCancellare(p) && (
        <button onClick={() => handleCancella(p.id)}
          style={{ padding: '6px 14px', background: '#FCEBEB', color: '#A32D2D', border: '0.5px solid #F09595', borderRadius: 8, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Cancella
        </button>
      )}
      {p.stato === 'confermata' && !puoCancellare(p) && (
        <span style={{ fontSize: 12, color: '#bbb', whiteSpace: 'nowrap' }}>Non cancellabile</span>
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={{ padding: '6px 12px' }}>← Home</button>
        <h1>Le mie prenotazioni</h1>
      </div>

      <h3 style={{ marginBottom: 10, color: '#444' }}>Prossime</h3>
      {future.length === 0
        ? <p style={{ color: '#aaa', fontSize: 14, marginBottom: '1.5rem' }}>
            Nessuna prenotazione futura. <span style={{ color: '#1D9E75', cursor: 'pointer' }} onClick={() => navigate('/')}>Prenota ora →</span>
          </p>
        : future.map(p => <CardPren key={p.id} p={p} />)
      }

      {passate.length > 0 && (
        <>
          <h3 style={{ margin: '1.5rem 0 10px', color: '#888' }}>Storico</h3>
          {passate.map(p => <CardPren key={p.id} p={p} />)}
        </>
      )}
    </div>
  )
}
