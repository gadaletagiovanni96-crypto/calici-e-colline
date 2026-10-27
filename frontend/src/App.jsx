import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Evento from './pages/Evento';
import Checkout from './pages/Checkout';
import Acquisti from './pages/Acquisti';
import Verifica from './pages/Verifica';
import { UtenteContext, UtenteProvider } from './context/UtenteContext';
import { EventoProvider } from './context/EventoContext';

function BarraNavigazione() {
  const { utente, esci } = useContext(UtenteContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    esci();
    navigate('/');
  };

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      backgroundColor: 'var(--color-primary)', 
      color: 'var(--color-surface)', 
      display: 'flex', 
      alignItems: 'center',
      gap: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Link to="/">Evento</Link>
      {/* Lo storico è solo per il ruolo utente: gli altri non acquistano */}
      {utente?.ruolo === 'utente' && <Link to="/acquisti">I miei acquisti</Link>}
      {utente?.ruolo === 'operatore' && <Link to="/verifica">Verifica biglietti</Link>}
      {utente?.ruolo === 'amministratore' && <Link to="/dashboard">Dashboard</Link>}
      {!utente && <Link to="/login">Accesso</Link>}
      {utente && (
        <button
          type="button"
          onClick={handleLogout}
          style={{
            marginLeft: 'auto',
            padding: '0.45rem 1rem',
            backgroundColor: 'transparent',
            border: '1px solid var(--color-surface)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-surface)',
            fontWeight: 600,
          }}
        >
          Esci
        </button>
      )}
    </nav>
  );
}

function SoloAmministratore() {
  const { utente } = useContext(UtenteContext);
  if (!utente) return <Navigate to="/" replace />;
  if (utente.ruolo !== 'amministratore') return <Navigate to="/" replace />;
  return <Dashboard />;
}

// Rotta protetta: senza sessione si va al login e, dopo l'accesso, si torna agli acquisti
function SoloAutenticato() {
  const { utente } = useContext(UtenteContext);
  if (!utente) return <Navigate to="/login" state={{ from: '/acquisti' }} replace />;
  if (utente.ruolo === 'operatore') return <Navigate to="/verifica" replace />;
  if (utente.ruolo === 'amministratore') return <Navigate to="/dashboard" replace />;
  return <Acquisti />;
}

// Solo l'operatore può aprire la pagina di scansione
function SoloOperatore() {
  const { utente } = useContext(UtenteContext);
  if (!utente) return <Navigate to="/login" state={{ from: '/verifica' }} replace />;
  if (utente.ruolo !== 'operatore') return <Navigate to="/" replace />;
  return <Verifica />;
}

function App() {
  return (
    <UtenteProvider>
      <EventoProvider>
        <Router>
          <BarraNavigazione />

          <main style={{ padding: '2rem' }}>
            <Routes>
              <Route path="/" element={<Evento />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<SoloAmministratore />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/acquisti" element={<SoloAutenticato />} />
              <Route path="/verifica" element={<SoloOperatore />} />
            </Routes>
          </main>
        </Router>
      </EventoProvider>
    </UtenteProvider>
  );
}

export default App;
