import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { subscribePrenotazioniUtente } from '../firebase/services'
import { useAuth } from '../hooks/useAuth'

const SPORT_LABELS = { tennis: 'Tennis', padel: 'Padel', pickleball: 'Pickleball' }

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
          <span className={`badge badge-${p.sport}`}>{SPORT_LABELS[p.sport]}</span>
          <span className={`badge badge-${p.stato}`}>{p.stato}</span>
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          {new Date(p.data + 'T00:00:00').toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'long' })}
          {' · '}{p.tipoPartita} · €{p.prezzo?.toFixed(2)} in loco
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <button onClick={() => navigate('/')} style={{ padding: '6px 12px' }}>← Prenota</button>
        <h1>Le mie prenotazioni</h1>
      </div>

      <h3 style={{ marginBottom: 10, color: '#444' }}>Prossime</h3>
      {future.length === 0
        ? <p style={{ color: '#aaa', fontSize: 14, marginBottom: '1.5rem' }}>Nessuna prenotazione futura. <span style={{ color: '#185FA5', cursor: 'pointer' }} onClick={() => navigate('/')}>Prenota ora →</span></p>
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
