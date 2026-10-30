import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Registrazione from './pages/Registrazione';
import Dashboard from './pages/Dashboard';
import Evento from './pages/Evento';
import Checkout from './pages/Checkout';
import Acquisti from './pages/Acquisti';
import Verifica from './pages/Verifica';
import { UtenteContext, UtenteProvider } from './context/UtenteContext';
import { EventoProvider } from './context/EventoContext';

const linkNav = 'font-medium transition hover:opacity-80';

function BarraNavigazione() {
  const { utente, esci} = useContext(UtenteContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    esci();
    navigate('/');
  };

  return (
    <nav className="flex items-center gap-6 bg-vino px-8 py-4 text-superficie shadow-soft">
      <Link to="/" className={linkNav}>Evento</Link>
      {/* Lo storico è solo per il ruolo utente: gli altri non acquistano */}
      {utente?.ruolo === 'utente' && <Link to="/acquisti" className={linkNav}>I miei acquisti</Link>}
      {utente?.ruolo === 'operatore' && <Link to="/verifica" className={linkNav}>Verifica biglietti</Link>}
      {utente?.ruolo === 'amministratore' && <Link to="/dashboard" className={linkNav}>Dashboard</Link>}
      {!utente && <Link to="/login" className={linkNav}>Accesso</Link>}
      {utente && <p>Benvenuto: {utente.nome}</p>}
      {utente && (
        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto cursor-pointer rounded-lg border border-superficie bg-transparent px-4 py-2 font-semibold text-superficie transition hover:bg-white/10"
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

          <main className="p-8">
            <Routes>
              <Route path="/" element={<Evento />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registrazione" element={<Registrazione />} />
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
