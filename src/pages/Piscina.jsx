import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db, dbAdmin, auth } from '../firebase/config'
import {
  doc, getDoc, onSnapshot, addDoc,
  collection, query, where
} from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'

const oggi = () => new Date().toISOString().split('T')[0]
const fmtData = (d) => {
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
}
const isFestivo = (d) => {
  const day = new Date(d + 'T00:00:00').getDay()
  return day === 0 || day === 6
}

export default function Piscina() {
  const user = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(oggi())
  const [config, setConfig] = useState({ postiMax: 50, prezzoGiornalieroFeriale: 10, prezzoGiornalieroFestivo: 14, prezzoMezzaFeriale: 7, prezzoMezzaFestivo: 10 })
  const [prenotazioni, setPrenotazioni] = useState([])
  const [tipoIngresso, setTipoIngresso] = useState('giornaliero')
  const [persone, setPersone] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getDoc(doc(dbAdmin, 'config', 'piscina')).then(snap => {
      if (snap.exists()) setConfig(snap.data())
    })
  }, [])

  useEffect(() => {
    const q = query(
      collection(db, 'prenotazioniPiscina'),
      where('data', '==', data),
      where('stato', '==', 'confermata')
    )
    const unsub = onSnapshot(q, snap =>
      setPrenotazioni(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    setSuccess(false)
    return unsub
  }, [data])

  const festivo = isFestivo(data)
  const postiOccupati = prenotazioni.reduce((acc, p) => acc + (p.persone || 1), 0)
  const postiLiberi = config.postiMax - postiOccupati

  const prezzo = festivo
    ? (tipoIngresso === 'giornaliero' ? config.prezzoGiornalieroFestivo : config.prezzoMezzaFestivo)
    : (tipoIngresso === 'giornaliero' ? config.prezzoGiornalieroFeriale : config.prezzoMezzaFeriale)

  const totale = prezzo * persone
  const postiDisponibili = postiLiberi >= persone

  const changeDay = (delta) => {
    const d = new Date(data + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    const newData = d.toISOString().split('T')[0]
    if (newData >= oggi()) setData(newData)
  }

  const handlePrenota = async () => {
    if (!postiDisponibili) return
    setLoading(true)
    try {
      await addDoc(collection(db, 'prenotazioniPiscina'), {
        uid: user.uid,
        clienteNome: user.displayName,
        clienteEmail: user.email,
        data,
        tipoIngresso,
        persone,
        prezzo,
        totale,
        stato: 'confermata',
      })
      setSuccess(true)
      setPersone(1)
    } catch (e) {
      alert('Errore: ' + e.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '1.5rem 1rem' }}>
      <button onClick={() => navigate('/')}
        style={{ marginBottom: '1.25rem', background: 'white', border: '0.5px solid #e0e0dc', color: '#1a1a1a', fontSize: 14, padding: '9px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, cursor: 'pointer' }}>
        ← Torna alla home
      </button>

      {success && (
        <div style={{ background: '#EAF3DE', border: '0.5px solid #97C459', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontWeight: 500, color: '#27500A' }}>Prenotazione piscina confermata!</div>
            <div style={{ fontSize: 13, color: '#3B6D11' }}>Riceverai conferma via email.</div>
          </div>
          <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3B6D11', fontSize: 20 }}>✕</button>
        </div>
      )}

      <h1 style={{ marginBottom: '1.5rem' }}>🏊 Piscina</h1>

      {/* Navigazione data */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
        <button onClick={() => changeDay(-1)} style={{ padding: '6px 14px', fontSize: 16 }}>←</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontWeight: 500 }}>{fmtData(data)}</div>
          <span style={{
            background: festivo ? '#FAEEDA' : '#E6F1FB',
            color: festivo ? '#633806' : '#0C447C',
            borderRadius: 99, padding: '2px 8px', fontSize: 11, fontWeight: 500
          }}>
            {festivo ? 'Festivo' : 'Feriale'}
          </span>
        </div>
        <button onClick={() => changeDay(1)} style={{ padding: '6px 14px', fontSize: 16 }}>→</button>
        <input type="date" value={data} min={oggi()}
          onChange={e => setData(e.target.value)}
          style={{ width: 'auto', padding: '6px 10px' }} />
      </div>

      {/* Disponibilità */}
      <div style={{ display: 'flex', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{ background: postiLiberi > 10 ? '#EAF3DE' : postiLiberi > 0 ? '#FAEEDA' : '#FCEBEB', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{postiLiberi}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Posti disponibili</div>
        </div>
        <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 500 }}>{postiOccupati}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Posti occupati</div>
        </div>
      </div>

      {postiLiberi === 0 ? (
        <div style={{ background: '#FCEBEB', borderRadius: 12, padding: '1rem', textAlign: 'center', color: '#A32D2D', fontWeight: 500 }}>
          😔 Piscina al completo per questo giorno
        </div>
      ) : (
        <div className="card">
          {/* Tipo ingresso */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Tipo di ingresso</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {['giornaliero', 'mezza'].map(t => (
                <button key={t} onClick={() => setTipoIngresso(t)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, fontSize: 13,
                    fontWeight: tipoIngresso === t ? 500 : 400,
                    background: tipoIngresso === t ? '#E6F1FB' : 'white',
                    color: tipoIngresso === t ? '#0C447C' : '#666',
                    borderColor: tipoIngresso === t ? '#85B7EB' : '#e0e0dc',
                  }}>
                  {t === 'giornaliero' ? '☀️ Giornaliero' : '🌤 Mezza giornata'}
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    €{t === 'giornaliero'
                      ? (festivo ? config.prezzoGiornalieroFestivo : config.prezzoGiornalieroFeriale)
                      : (festivo ? config.prezzoMezzaFestivo : config.prezzoMezzaFeriale)}/persona
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Numero persone */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Numero di persone</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setPersone(p => Math.max(1, p - 1))}
                style={{ width: 36, height: 36, borderRadius: '50%', fontWeight: 500, fontSize: 18, padding: 0 }}>−</button>
              <span style={{ fontSize: 22, fontWeight: 500, minWidth: 40, textAlign: 'center' }}>{persone}</span>
              <button onClick={() => setPersone(p => Math.min(postiLiberi, p + 1))}
                style={{ width: 36, height: 36, borderRadius: '50%', fontWeight: 500, fontSize: 18, padding: 0 }}>+</button>
              <span style={{ fontSize: 13, color: '#888' }}>max {postiLiberi} disponibili</span>
            </div>
          </div>

          {/* Totale e conferma */}
          <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#666' }}>Totale da pagare in loco</span>
            <span style={{ fontSize: 22, fontWeight: 500 }}>€{totale.toFixed(2)}</span>
          </div>

          <button className="btn-primary" onClick={handlePrenota} disabled={loading || !postiDisponibili}>
            {loading ? 'Prenotazione in corso...' : `Prenota ${persone} ${persone === 1 ? 'posto' : 'posti'}`}
          </button>
        </div>
      )}
    </div>
  )
}
