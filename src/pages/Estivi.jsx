import { useState, useEffect } from 'react'
import { db, dbAdmin } from '../firebase/config'
import {
  doc, getDoc, onSnapshot, addDoc,
  collection, query, where
} from 'firebase/firestore'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

const oggi = () => new Date().toISOString().split('T')[0]
const fmtData = (d) => {
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
}

const getLunedi = (d) => {
  const date = new Date(d + 'T00:00:00')
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  return date.toISOString().split('T')[0]
}

const getVenerdi = (lunedi) => {
  const date = new Date(lunedi + 'T00:00:00')
  date.setDate(date.getDate() + 4)
  return date.toISOString().split('T')[0]
}

export default function Estivi() {
  const user = useAuth()
  const navigate = useNavigate()
  const [config, setConfig] = useState({ postiMax: 30, prezzoSettimanale: 150, prezzoGiornaliero: 35 })
  const [data, setData] = useState(oggi())
  const [tipoIscrizione, setTipoIscrizione] = useState('settimanale')
  const [persone, setPersone] = useState(1)
  const [prenotazioni, setPrenotazioni] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const lunedi = getLunedi(data)
  const venerdi = getVenerdi(lunedi)

  useEffect(() => {
    getDoc(doc(dbAdmin, 'config', 'estivi')).then(snap => {
      if (snap.exists()) setConfig(snap.data())
    })
  }, [])

  useEffect(() => {
    const chiave = tipoIscrizione === 'settimanale' ? lunedi : data
    const q = query(
      collection(db, 'prenotazioniEstivi'),
      where('chiave', '==', chiave),
      where('stato', '==', 'confermata')
    )
    const unsub = onSnapshot(q, snap =>
      setPrenotazioni(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    )
    setSuccess(false)
    return unsub
  }, [data, tipoIscrizione, lunedi])

  const postiOccupati = prenotazioni.reduce((acc, p) => acc + (p.persone || 1), 0)
  const postiLiberi = config.postiMax - postiOccupati
  const prezzo = tipoIscrizione === 'settimanale' ? config.prezzoSettimanale : config.prezzoGiornaliero
  const totale = prezzo * persone

  const changeDay = (delta) => {
    const d = new Date(data + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      setData(d.toISOString().split('T')[0])
    }
  }

  const handleIscrivi = async () => {
    if (postiLiberi < persone) return
    setLoading(true)
    const chiave = tipoIscrizione === 'settimanale' ? lunedi : data
    try {
      await addDoc(collection(db, 'prenotazioniEstivi'), {
        uid: user.uid,
        clienteNome: user.displayName,
        clienteEmail: user.email,
        tipoIscrizione,
        chiave,
        dataInizio: tipoIscrizione === 'settimanale' ? lunedi : data,
        dataFine: tipoIscrizione === 'settimanale' ? venerdi : data,
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
            <div style={{ fontWeight: 500, color: '#27500A' }}>Iscrizione confermata!</div>
            <div style={{ fontSize: 13, color: '#3B6D11' }}>Riceverai conferma via email.</div>
          </div>
          <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3B6D11', fontSize: 20 }}>✕</button>
        </div>
      )}

      <h1 style={{ marginBottom: '1.5rem' }}>🏕️ Centri estivi</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {['settimanale', 'giornaliero'].map(t => (
          <button key={t} onClick={() => { setTipoIscrizione(t); setPersone(1) }}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, fontSize: 13,
              fontWeight: tipoIscrizione === t ? 500 : 400,
              background: tipoIscrizione === t ? '#FFF3E0' : 'white',
              color: tipoIscrizione === t ? '#E65100' : '#666',
              borderColor: tipoIscrizione === t ? '#FF9800' : '#e0e0dc',
              border: tipoIscrizione === t ? '1.5px solid #FF9800' : '0.5px solid #e0e0dc',
            }}>
            {t === 'settimanale' ? '📅 Settimanale' : '☀️ Giornaliero'}
            <div style={{ fontSize: 12, marginTop: 2 }}>
              €{t === 'settimanale' ? config.prezzoSettimanale : config.prezzoGiornaliero}/persona
            </div>
          </button>
        ))}
      </div>

      {tipoIscrizione === 'settimanale' ? (
        <div style={{ background: '#FFF3E0', borderRadius: 10, padding: '12px 16px', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, color: '#E65100' }}>Settimana selezionata</div>
            <div style={{ fontSize: 13, color: '#BF360C', marginTop: 2 }}>
              {fmtData(lunedi)} → {fmtData(venerdi)}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => changeDay(-7)} style={{ padding: '6px 10px' }}>←</button>
            <button onClick={() => changeDay(7)} style={{ padding: '6px 10px' }}>→</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
          <button onClick={() => changeDay(-1)} style={{ padding: '6px 14px', fontSize: 16 }}>←</button>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 500 }}>{fmtData(data)}</div>
          <button onClick={() => changeDay(1)} style={{ padding: '6px 14px', fontSize: 16 }}>→</button>
          <input type="date" value={data} min={oggi()}
            onChange={e => setData(e.target.value)}
            style={{ width: 'auto', padding: '6px 10px' }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: '1.25rem' }}>
        <div style={{ background: postiLiberi > 5 ? '#EAF3DE' : postiLiberi > 0 ? '#FFF3E0' : '#FCEBEB', borderRadius: 8, padding: '10px 16px', flex: 1, textAlign: 'center' }}>
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
          😔 Posti esauriti per questo periodo
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>Numero di bambini</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button onClick={() => setPersone(p => Math.max(1, p - 1))}
                style={{ width: 36, height: 36, borderRadius: '50%', fontWeight: 500, fontSize: 18, padding: 0 }}>−</button>
              <span style={{ fontSize: 22, fontWeight: 500, minWidth: 40, textAlign: 'center' }}>{persone}</span>
              <button onClick={() => setPersone(p => Math.min(postiLiberi, p + 1))}
                style={{ width: 36, height: 36, borderRadius: '50%', fontWeight: 500, fontSize: 18, padding: 0 }}>+</button>
              <span style={{ fontSize: 13, color: '#888' }}>max {postiLiberi} disponibili</span>
            </div>
          </div>

          <div style={{ background: '#f5f5f3', borderRadius: 8, padding: '12px 16px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: '#666' }}>Totale da pagare</span>
            <span style={{ fontSize: 22, fontWeight: 500 }}>€{totale.toFixed(2)}</span>
          </div>

          <button className="btn-primary" onClick={handleIscrivi} disabled={loading || postiLiberi < persone}>
            {loading ? 'Iscrizione in corso...' : `Iscriviti — ${persone} ${persone === 1 ? 'bambino' : 'bambini'}`}
          </button>
        </div>
      )}
    </div>
  )
}
