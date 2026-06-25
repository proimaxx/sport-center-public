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
const getEaster = (year) => {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

const isFestivo = (d) => {
  const date = new Date(d + 'T00:00:00')
  const day = date.getDay()
  const year = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const mmdd = `${mm}-${dd}`

  if (day === 0 || day === 6) return true

  const nazionali = ['01-01','01-06','04-25','05-01','06-02','08-15','11-01','12-08','12-25','12-26']
  if (nazionali.includes(mmdd)) return true

  if (mmdd === '06-29') return true

  const pasqua = getEaster(year)
  const pasquetta = new Date(pasqua)
  pasquetta.setDate(pasqua.getDate() + 1)
  const formatDate = (dt) => `${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`
  if (mmdd === formatDate(pasqua) || mmdd === formatDate(pasquetta)) return true

  return false
}

export default function Piscina() {
  const user = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(oggi())
  const [config, setConfig] = useState({
    postiMax: 50,
    prezzoGiornalieroFeriale: 10, prezzoGiornalieroFestivo: 14,
    prezzoMattinaFeriale: 6, prezzoMattinaFestivo: 8,
    prezzoPomeriggioFeriale: 6, prezzoPomeriggioFestivo: 8,
    prezzoMezzaFeriale: 7, prezzoMezzaFestivo: 10,
    prezzoRidottoFeriale: 5, prezzoRidottoFestivo: 7,
  })
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

  const getPrezzo = (tipo, fest) => {
    switch(tipo) {
      case 'giornaliero': return fest ? config.prezzoGiornalieroFestivo : config.prezzoGiornalieroFeriale
      case 'mattina': return fest ? config.prezzoMattinaFestivo : config.prezzoMattinaFeriale
      case 'pomeriggio': return fest ? config.prezzoPomeriggioFestivo : config.prezzoPomeriggioFeriale
      case 'ridotto': return fest ? config.prezzoRidottoFestivo : config.prezzoRidottoFeriale
      case 'soci': return config.prezzoSoci || 6
      default: return fest ? config.prezzoMezzaFestivo : config.prezzoMezzaFeriale
    }
  }
  const prezzo = getPrezzo(tipoIngresso, festivo)

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
      const userDoc = await import('firebase/firestore').then(m => m.getDoc(m.doc(db, 'utenti', user.uid)))
      const telefono = userDoc.exists() ? userDoc.data().telefono || '' : ''
      await addDoc(collection(db, 'prenotazioniPiscina'), {
        uid: user.uid,
        clienteNome: user.displayName,
        clienteEmail: user.email,
        clienteTelefono: telefono,
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
      <div style={{ display: 'flex', gap: 8, marginBottom: '1rem', alignItems: 'center' }}>
        {[0, 1, 2].map(delta => {
          const d = new Date()
          d.setDate(d.getDate() + delta)
          const dateStr = d.toISOString().split('T')[0]
          const labels = ['Oggi', 'Domani', 'Dopodomani']
          const isSelected = data === dateStr
          return (
            <button key={delta} onClick={() => setData(dateStr)}
              style={{
                flex: 1, padding: '8px 6px', borderRadius: 8, fontSize: 13,
                fontWeight: isSelected ? 500 : 400,
                background: isSelected ? '#1D9E75' : 'white',
                color: isSelected ? 'white' : '#444',
                border: isSelected ? 'none' : '0.5px solid #e0e0dc',
                cursor: 'pointer', textAlign: 'center'
              }}>
              <div>{labels[delta]}</div>
              <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>
                {d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
              </div>
            </button>
          )
        })}
        <input type="date" value={data} min={oggi()}
          onChange={e => setData(e.target.value)}
          style={{ width: 'auto', padding: '6px 10px' }} />
      </div>
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <span style={{
          background: festivo ? '#FAEEDA' : '#E6F1FB',
          color: festivo ? '#633806' : '#0C447C',
          borderRadius: 99, padding: '3px 12px', fontSize: 12, fontWeight: 500
        }}>
          {festivo ? '🎉 Festivo' : 'Feriale'} · {fmtData(data)}
        </span>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                ['giornaliero', '☀️ Giornaliero', ''],
                ['mattina', '🌅 Mattina', ''],
                ['pomeriggio', '🌇 Pomeriggio', ''],
                ['mezza', '🌤 Mezza', ''],
                ['ridotto', '👶 Ridotto', '6-12 anni · sdraio inclusa'],
                ['soci', '🤝 Soci', 'tariffa unica'],
              ].map(([t, label, sub]) => (
                <button key={t} onClick={() => setTipoIngresso(t)}
                  style={{
                    padding: '10px 4px', borderRadius: 8, fontSize: 11,
                    fontWeight: tipoIngresso === t ? 500 : 400,
                    background: tipoIngresso === t ? '#E6F1FB' : 'white',
                    color: tipoIngresso === t ? '#0C447C' : '#666',
                    border: tipoIngresso === t ? '1.5px solid #85B7EB' : '0.5px solid #e0e0dc',
                    cursor: 'pointer', textAlign: 'center'
                  }}>
                  {label}
                  {sub && <div style={{ fontSize: 10, marginTop: 1, opacity: 0.75 }}>{sub}</div>}
                  <div style={{ fontSize: 11, marginTop: 2, fontWeight: 500 }}>
                    €{getPrezzo(t, festivo)}
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
