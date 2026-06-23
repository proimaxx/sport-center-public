import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const TennisCourt = () => (
  <svg viewBox="0 0 260 160" style={{ width: '100%', height: 140 }}>
    <rect width="260" height="160" fill="#C1440E" rx="4"/>
    <rect x="15" y="10" width="230" height="140" fill="#A33A0C"/>
    <rect x="15" y="10" width="230" height="140" fill="none" stroke="white" strokeWidth="2"/>
    <line x1="15" y1="28" x2="245" y2="28" stroke="white" strokeWidth="1.5"/>
    <line x1="15" y1="132" x2="245" y2="132" stroke="white" strokeWidth="1.5"/>
    <line x1="130" y1="10" x2="130" y2="150" stroke="white" strokeWidth="2.5"/>
    <circle cx="130" cy="80" r="3" fill="white"/>
    <line x1="75" y1="28" x2="75" y2="132" stroke="white" strokeWidth="1.5"/>
    <line x1="185" y1="28" x2="185" y2="132" stroke="white" strokeWidth="1.5"/>
    <line x1="75" y1="80" x2="185" y2="80" stroke="white" strokeWidth="1.5"/>
    <line x1="15" y1="78" x2="15" y2="82" stroke="white" strokeWidth="2"/>
    <line x1="245" y1="78" x2="245" y2="82" stroke="white" strokeWidth="2"/>
  </svg>
)

const PadelCourt = () => (
  <svg viewBox="0 0 260 130" style={{ width: '100%', height: 140 }}>
    {/* Sfondo verde acqua */}
    <rect width="260" height="130" fill="#00897B" rx="4"/>
    {/* Pareti laterali sinistra */}
    <rect x="10" y="12" width="22" height="106" fill="#00695C" rx="1"/>
    {/* Pareti laterali destra */}
    <rect x="228" y="12" width="22" height="106" fill="#00695C" rx="1"/>
    {/* Campo principale blu scuro */}
    <rect x="32" y="12" width="196" height="106" fill="#1A237E"/>
    {/* Rete centrale verticale */}
    <line x1="130" y1="12" x2="130" y2="118" stroke="white" strokeWidth="2.5"/>
    {/* Linea orizzontale centrale */}
    <line x1="32" y1="65" x2="228" y2="65" stroke="white" strokeWidth="2"/>
    {/* Bordo campo */}
    <rect x="32" y="12" width="196" height="106" fill="none" stroke="white" strokeWidth="2"/>
    {/* Bordo pareti */}
    <rect x="10" y="12" width="22" height="106" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="228" y="12" width="22" height="106" fill="none" stroke="white" strokeWidth="1.5"/>
  </svg>
)

const PickleballCourt = () => (
  <svg viewBox="0 0 260 140" style={{ width: '100%', height: 140 }}>
    {/* Sfondo campo */}
    <rect width="260" height="140" fill="#1565C0" rx="4"/>
    {/* Campo principale */}
    <rect x="15" y="12" width="230" height="116" fill="#0D47A1" rx="2"/>
    {/* Zona cucina sinistra (blu chiaro) */}
    <rect x="15" y="12" width="72" height="116" fill="#1976D2"/>
    {/* Zona cucina destra (blu chiaro) */}
    <rect x="173" y="12" width="72" height="116" fill="#1976D2"/>
    {/* Bordo campo */}
    <rect x="15" y="12" width="230" height="116" fill="none" stroke="white" strokeWidth="2.5"/>
    {/* Rete centrale */}
    <line x1="130" y1="12" x2="130" y2="128" stroke="white" strokeWidth="2.5"/>
    {/* Linea cucina sinistra */}
    <line x1="87" y1="12" x2="87" y2="128" stroke="white" strokeWidth="2"/>
    {/* Linea cucina destra */}
    <line x1="173" y1="12" x2="173" y2="128" stroke="white" strokeWidth="2"/>
    {/* Linea centrale orizzontale sinistra (divide servizio) */}
    <line x1="87" y1="70" x2="173" y2="70" stroke="white" strokeWidth="1.5"/>
    {/* Bordo esterno */}
    <rect x="15" y="12" width="230" height="116" fill="none" stroke="white" strokeWidth="2.5"/>
  </svg>
)

const PiscinaCourt = () => {
  const corsie = [32, 50, 68, 86, 104]
  const colori = ['#E53935', '#1565C0', '#E53935', '#1565C0']
  return (
  <svg viewBox="0 0 300 130" style={{ width: '100%', height: 140 }}>
    <rect width="300" height="130" fill="#E8D5C4" rx="4"/>
    <rect x="12" y="8" width="276" height="114" fill="#29B6F6" rx="3"/>
    <rect x="12" y="8" width="276" height="114" fill="url(#acqua)" rx="3"/>
    {corsie.map((y, i) => (
      <g key={i}>
        <line x1="12" y1={y} x2="288" y2={y} stroke="white" strokeWidth="1.5"/>
        {Array.from({length: 18}).map((_, j) => (
          <rect key={j} x={14 + j * 15} y={y - 2.5} width="8" height="5"
            fill={j % 2 === 0 ? colori[i % 2] : 'white'} rx="1"/>
        ))}
      </g>
    ))}
    <rect x="12" y="8" width="276" height="114" fill="none" stroke="white" strokeWidth="4" rx="3"/>
    <text x="292" y="22" fill="#555" fontSize="9" fontWeight="500">1</text>
    <text x="292" y="41" fill="#555" fontSize="9" fontWeight="500">2</text>
    <text x="292" y="59" fill="#555" fontSize="9" fontWeight="500">3</text>
    <text x="292" y="77" fill="#555" fontSize="9" fontWeight="500">4</text>
    <text x="292" y="95" fill="#555" fontSize="9" fontWeight="500">5</text>
  </svg>
  )
}

const CalcioA5Court = () => (
  <svg viewBox="0 0 260 160" style={{ width: '100%', height: 140 }}>
    <rect width="260" height="160" fill="#2E7D32" rx="4"/>
    <rect x="12" y="10" width="236" height="140" fill="#1B5E20" rx="2"/>
    <rect x="12" y="10" width="236" height="140" fill="none" stroke="white" strokeWidth="2"/>
    <circle cx="130" cy="80" r="20" fill="none" stroke="white" strokeWidth="1.5"/>
    <circle cx="130" cy="80" r="2" fill="white"/>
    <line x1="130" y1="10" x2="130" y2="150" stroke="white" strokeWidth="2"/>
    <rect x="12" y="55" width="22" height="50" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="226" y="55" width="22" height="50" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="12" y="40" width="45" height="80" fill="none" stroke="white" strokeWidth="1.5"/>
    <rect x="203" y="40" width="45" height="80" fill="none" stroke="white" strokeWidth="1.5"/>
  </svg>
)

const CentriEstiviCourt = () => (
  <svg viewBox="0 0 260 160" style={{ width: '100%', height: 140 }}>
    <rect width="260" height="160" fill="#F57C00" rx="4"/>
    <rect x="12" y="10" width="236" height="140" fill="#E65100" rx="2"/>
    <circle cx="130" cy="55" r="28" fill="#FFB300"/>
    <line x1="130" y1="20" x2="130" y2="10" stroke="#FFD54F" strokeWidth="2.5"/>
    <line x1="155" y1="30" x2="162" y2="23" stroke="#FFD54F" strokeWidth="2.5"/>
    <line x1="165" y1="55" x2="175" y2="55" stroke="#FFD54F" strokeWidth="2.5"/>
    <line x1="105" y1="30" x2="98" y2="23" stroke="#FFD54F" strokeWidth="2.5"/>
    <line x1="95" y1="55" x2="85" y2="55" stroke="#FFD54F" strokeWidth="2.5"/>
    <rect x="50" y="95" width="40" height="55" fill="#1565C0" rx="2"/>
    <rect x="65" y="110" width="12" height="40" fill="#0D47A1" rx="1"/>
    <polygon points="50,95 70,72 90,95" fill="#E53935"/>
    <rect x="120" y="100" width="35" height="50" fill="#1565C0" rx="2"/>
    <rect x="133" y="115" width="10" height="35" fill="#0D47A1" rx="1"/>
    <polygon points="120,100 137,80 155,100" fill="#E53935"/>
    <rect x="175" y="105" width="38" height="45" fill="#1565C0" rx="2"/>
    <rect x="188" y="118" width="10" height="32" fill="#0D47A1" rx="1"/>
    <polygon points="175,105 194,85 213,105" fill="#E53935"/>
  </svg>
)

const sezioni = [
  { sport: 'tennis', label: 'Tennis', descrizione: 'Prenota un campo da tennis', bg: '#C1440E', Court: TennisCourt, path: '/prenota?sport=tennis' },
  { sport: 'padel', label: 'Padel', descrizione: 'Prenota un campo da padel', bg: '#2E7D32', Court: PadelCourt, path: '/prenota?sport=padel' },
  { sport: 'pickleball', label: 'Pickleball', descrizione: 'Prenota un campo da pickleball', bg: '#1565C0', Court: PickleballCourt, path: '/prenota?sport=pickleball' },
  { sport: 'calcio5', label: 'Calcio a 5', descrizione: 'Prenota un campo da calcio a 5', bg: '#1B5E20', Court: CalcioA5Court, path: '/prenota?sport=calcio5' },
  { sport: 'piscina', label: 'Piscina', descrizione: 'Prenota il tuo posto in piscina', bg: '#0288D1', Court: PiscinaCourt, path: '/piscina' },
  { sport: 'estivi', label: 'Centri estivi', descrizione: 'Iscrizione settimanale o giornaliera', bg: '#E65100', Court: CentriEstiviCourt, path: '/estivi' },
]

export default function Home() {
  const navigate = useNavigate()
  const user = useAuth()

  return (
    <div style={{ maxWidth: 740, margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500 }}>Ciao, {user?.displayName?.split(' ')[0] || 'benvenuto'} 👋</h1>
        <p style={{ color: '#888', fontSize: 15, marginTop: 4 }}>Cosa vuoi prenotare oggi?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {sezioni.map(s => (
          <div key={s.sport}
            onClick={() => navigate(s.path)}
            style={{
              background: s.bg,
              borderRadius: 16,
              overflow: 'hidden',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.22)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'
            }}
          >
            <s.Court />
            <div style={{ padding: '14px 16px 18px' }}>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{s.descrizione}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
