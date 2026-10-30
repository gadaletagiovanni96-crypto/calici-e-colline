import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Registrazione from './pages/Registrazione';
import Dashboard from './pages/Dashboard';
import Evento from './pages/Evento';
import Checkout from './pages/Checkout';
import Acquisti from './pages/Acquisti';
import Verifica from './pages/Verifica';
import { UtenteContext, UtenteProvider } from './context/UtenteContext';
import { EventoProvider } from './context/EventoContext';
import { Tenda } from './components/Illustrazione';

function pill({ isActive }) {
  return `px-4 py-2 text-sm font-light tracking-[0.12em] transition duration-200 ${
    isActive ? 'bg-crema text-prugna' : 'text-prugna/80 hover:bg-crema/70'
  }`;
}

function BarraNavigazione() {
  const { utente, esci } = useContext(UtenteContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    esci();
    navigate('/');
  };

  return (
    <nav className="anim-comparsa relative z-10 flex flex-wrap items-center gap-4 px-4 pt-4 sm:px-7 lg:px-8">
      <div className="flex flex-wrap items-center gap-1">
        <NavLink to="/" end className={pill}>Evento</NavLink>
        {/* Lo storico è solo per il ruolo utente: gli altri non acquistano */}
        {utente?.ruolo === 'utente' && <NavLink to="/acquisti" className={pill}>I miei acquisti</NavLink>}
        {utente?.ruolo === 'operatore' && <NavLink to="/verifica" className={pill}>Verifica biglietti</NavLink>}
        {utente?.ruolo === 'amministratore' && <NavLink to="/dashboard" className={pill}>Dashboard</NavLink>}
        {!utente && <NavLink to="/login" className={pill}>Accesso</NavLink>}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-3">
        {utente && <p className="text-sm font-medium text-testo/80">Benvenuto: {utente.nome}</p>}
        {utente && (
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer bg-crema px-4 py-2 text-sm font-light tracking-[0.12em] text-prugna transition duration-200 hover:bg-white"
          >
            Esci
          </button>
        )}
      </div>
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
          <div className="min-h-screen bg-sfondo sm:p-4 md:p-6">
            <div className="relative mx-auto flex min-h-screen flex-col overflow-hidden bg-tela sm:min-h-[calc(100vh-2rem)]">
              <Tenda />
              <BarraNavigazione />

              <main className="relative z-10 flex-1 px-4 pb-10 pt-4 sm:px-7 lg:px-8">
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
            </div>
          </div>
        </Router>
      </EventoProvider>
    </UtenteProvider>
  );
}

export default App;
