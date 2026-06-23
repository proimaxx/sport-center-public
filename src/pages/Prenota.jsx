import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { subscribeCampi, subscribePrenotazioniByData, addPrenotazione, getConfig } from '../firebase/services'
import { useAuth } from '../hooks/useAuth'

const SPORT_LABELS = { tennis: 'Tennis', padel: 'Padel', pickleball: 'Pickleball' }

function generaSlot(oraApertura, oraChiusura) {
  const slots = []
  const [hA, mA] = oraApertura.split(':').map(Number)
  const [hC, mC] = oraChiusura.split(':').map(Number)
  let min = hA * 60 + mA
  const fine = hC * 60 + mC
  while (min < fine) {
    const h = String(Math.floor(min / 60)).padStart(2, '0')
    const m = String(min % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    min += 30
  }
  return slots
}

const oggi = () => new Date().toISOString().split('T')[0]
const fmtData = (d) => {
  const date = new Date(d + 'T00:00:00')
  return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Prenota() {
  const user = useAuth()
  const [data, setData] = useState(oggi())
  const [campi, setCampi] = useState([])
  const [prenotazioni, setPrenotazioni] = useState([])
  const [config, setConfig] = useState({ oraApertura: '08:00', oraChiusura: '22:00', giorniPrenotabili: 3, slotSingolo: 60, slotDoppio: 90 })
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sportParam = searchParams.get('sport')
  const [filtroSport, setFiltroSport] = useState(sportParam || 'tutti')
  const [selected, setSelected] = useState(null)
  const [tipoPartita, setTipoPartita] = useState('singolo')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [giocatori, setGiocatori] = useState(['', ''])

  useEffect(() => {
    const unsub = subscribeCampi(setCampi)
    getConfig().then(setConfig)
    return unsub
  }, [])

  useEffect(() => {
    const unsub = subscribePrenotazioniByData(data, setPrenotazioni)
    setSelected(null)
    setSuccess(false)
    return unsub
  }, [data])

  const changeDay = (delta) => {
    const d = new Date(data + 'T00:00:00')
    d.setDate(d.getDate() + delta)
    const newData = d.toISOString().split('T')[0]
    if (newData >= oggi()) setData(newData)
  }

  const isSlotOccupato = (campoId, slot, durata) => {
    return prenotazioni.some(p => {
      if (p.campoId !== campoId) return false
      const [ph, pm] = p.orario.split(':').map(Number)
      const [sh, sm] = slot.split(':').map(Number)
      const pStart = ph * 60 + pm
      const pEnd = pStart + p.durataMin
      const sStart = sh * 60 + sm
      const sEnd = sStart + durata
      return sStart < pEnd && sEnd > pStart
    })
  }

  const isSlotNonDisponibile = (slot) => {
    const now = new Date()
    const dataSlot = new Date(`${data}T${slot}:00`)
    const giorniMax = config.giorniPrenotabili || 3
    const maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + giorniMax)
    maxDate.setHours(23, 59, 59)
    return dataSlot < now || dataSlot > maxDate
  }

  const handleConferma = async () => {
    if (!selected) return
    setLoading(true)
    const campo = campi.find(c => c.id === selected.campoId)
    const durata = tipoPartita === 'singolo' ? (config.slotSingolo || 60) : (config.slotDoppio || 90)
  const numGiocatori = tipoPartita === 'singolo' ? 2 : 4
    const prezzo = tipoPartita === 'singolo' ? campo.prezzoSingolo : campo.prezzoDoppio
    const [sh, sm] = selected.slot.split(':').map(Number)
    const fineMin = sh * 60 + sm + durata
    const orarioFine = `${String(Math.floor(fineMin / 60)).padStart(2, '0')}:${String(fineMin % 60).padStart(2, '0')}`
    try {
      await addPrenotazione({
        giocatori: giocatori.filter(g => g.trim()),

        uid: user.uid,
        clienteNome: user.displayName,
        clienteEmail: user.email,
        campoId: selected.campoId,
        campoNome: campo.nome,
        sport: campo.sport,
        data,
        orario: selected.slot,
        orarioFine,
        durataMin: durata,
        tipoPartita,
        prezzo,
      })
      setSuccess(true)
      setSelected(null)
    } catch (e) {
      alert('Errore: ' + e.message)
    }
    setLoading(false)
  }

  const durata = tipoPartita === 'singolo' ? (config.slotSingolo || 60) : (config.slotDoppio || 90)
  const numGiocatori = tipoPartita === 'singolo' ? 2 : 4
  const campiFiltrati = filtroSport === 'tutti' ? campi : campi.filter(c => c.sport === filtroSport)

  const maxData = (() => {
    const d = new Date()
    d.setDate(d.getDate() + (config.giorniPrenotabili || 3))
    return d.toISOString().split('T')[0]
  })()

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem 1rem' }}>
      {sportParam && (
        <button onClick={() => navigate('/')}
          style={{ marginBottom: '1.25rem', background: 'white', border: '0.5px solid #e0e0dc', color: '#1a1a1a', fontSize: 14, padding: '9px 16px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, cursor: 'pointer' }}>
          ← Torna alla home
        </button>
      )}

      {success && (
        <div style={{ background: '#EAF3DE', border: '0.5px solid #97C459', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <div style={{ fontWeight: 500, color: '#27500A' }}>Prenotazione confermata!</div>
            <div style={{ fontSize: 13, color: '#3B6D11' }}>Riceverai conferma via email e un promemoria WhatsApp 2 ore prima.</div>
          </div>
          <button onClick={() => setSuccess(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#3B6D11', fontSize: 20 }}>✕</button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.25rem' }}>
        <button onClick={() => changeDay(-1)} style={{ padding: '6px 14px', fontSize: 16 }}>←</button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 500 }}>{fmtData(data)}</div>
        <button onClick={() => changeDay(1)} style={{ padding: '6px 14px', fontSize: 16 }}>→</button>
        <input type="date" value={data} min={oggi()} max={maxData}
          onChange={e => setData(e.target.value)}
          style={{ width: 'auto', padding: '6px 10px' }} />
      </div>

      {!sportParam && (
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['tutti', 'tennis', 'padel', 'pickleball'].map(s => (
          <button key={s} onClick={() => setFiltroSport(s)}
            style={{
              padding: '6px 16px', borderRadius: 99,
              fontWeight: filtroSport === s ? 500 : 400,
              background: filtroSport === s ? '#E6F1FB' : 'white',
              color: filtroSport === s ? '#0C447C' : '#666',
              borderColor: filtroSport === s ? '#85B7EB' : '#e0e0dc'
            }}>
            {s === 'tutti' ? 'Tutti' : SPORT_LABELS[s]}
          </button>
        ))}
      </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
        {['singolo', 'doppio'].map(t => (
          <button key={t} onClick={() => { setTipoPartita(t); setSelected(null) }}
            style={{
              flex: 1, padding: '8px', borderRadius: 8,
              fontWeight: tipoPartita === t ? 500 : 400,
              background: tipoPartita === t ? '#E6F1FB' : 'white',
              color: tipoPartita === t ? '#0C447C' : '#666',
              borderColor: tipoPartita === t ? '#85B7EB' : '#e0e0dc',
              fontSize: 13
            }}>
            {t === 'singolo' ? `Singolo — 1h` : `Doppio — 1h 30min`}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888', marginBottom: '1rem' }}>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: 'white', border: '0.5px solid #ccc', marginRight: 4 }}></span>Disponibile</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#f0f0ee', border: '0.5px solid #e0e0dc', marginRight: 4 }}></span>Occupato</span>
        <span><span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#E6F1FB', border: '0.5px solid #85B7EB', marginRight: 4 }}></span>Selezionato</span>
      </div>

      {campiFiltrati.map(campo => {
        const slots = generaSlot(config.oraApertura || '08:00', config.oraChiusura || '22:00')
        return (
          <div key={campo.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontWeight: 500 }}>{campo.nome}</span>
              <span className={`badge badge-${campo.sport}`}>{SPORT_LABELS[campo.sport]}</span>
              <span className="badge" style={{ background: '#f5f5f3', color: '#666' }}>{campo.indoor ? 'Indoor' : 'Outdoor'}</span>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: '#888' }}>
                €{(tipoPartita === 'singolo' ? campo.prezzoSingolo : campo.prezzoDoppio)?.toFixed(2)}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {slots.map(slot => {
                const occupato = isSlotOccupato(campo.id, slot, durata)
                const nonDisp = isSlotNonDisponibile(slot)
                const isSel = selected?.campoId === campo.id && selected?.slot === slot
                const bloccato = occupato || nonDisp
                const [sh, sm] = slot.split(':').map(Number)
                const fineMin = sh * 60 + sm + durata
                const orarioFine = `${String(Math.floor(fineMin / 60)).padStart(2, '0')}:${String(fineMin % 60).padStart(2, '0')}`
                return (
                  <button key={slot} disabled={bloccato}
                    onClick={() => setSelected(isSel ? null : { campoId: campo.id, slot })}
                    style={{
                      padding: '6px 12px', fontSize: 13, fontWeight: isSel ? 500 : 400,
                      background: isSel ? '#E6F1FB' : bloccato ? '#f5f5f3' : 'white',
                      color: isSel ? '#0C447C' : bloccato ? '#ccc' : '#1a1a1a',
                      borderColor: isSel ? '#85B7EB' : bloccato ? '#e8e8e4' : '#e0e0dc',
                      textDecoration: bloccato ? 'line-through' : 'none',
                      cursor: bloccato ? 'not-allowed' : 'pointer',
                      minWidth: 90, textAlign: 'center'
                    }}>
                    {slot} – {orarioFine}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {selected && (
        <div style={{
          position: 'sticky', bottom: 16, background: 'white',
          border: '0.5px solid #e0e0dc', borderRadius: 12,
          padding: '1rem 1.25rem', marginTop: '1rem',
          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>
              {campi.find(c => c.id === selected.campoId)?.nome} — {selected.slot}
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>
              {tipoPartita} · {durata}min · €{(tipoPartita === 'singolo'
                ? campi.find(c => c.id === selected.campoId)?.prezzoSingolo
                : campi.find(c => c.id === selected.campoId)?.prezzoDoppio)?.toFixed(2)} in loco
            </div>
          </div>
          <div style={{ padding: '12px 14px', background: 'white', borderTop: '0.5px solid #e0e0dc' }}>
            <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
              Giocatori ({numGiocatori} {numGiocatori === 2 ? 'persone' : 'persone'})
            </div>
            {Array.from({ length: numGiocatori }).map((_, i) => (
              <input key={i} placeholder={`Giocatore ${i + 1}${i === 0 ? ' (tu)' : ''}`}
                value={giocatori[i] || ''}
                onChange={e => {
                  const g = [...giocatori]
                  g[i] = e.target.value
                  setGiocatori(g)
                }}
                style={{ marginBottom: 8 }} />
            ))}
          </div>
          <button className="btn-primary" onClick={handleConferma} disabled={loading}
            style={{ width: 'auto', padding: '10px 24px' }}>
            {loading ? 'Conferma...' : 'Prenota'}
          </button>
        </div>
      )}
    </div>
  )
}
