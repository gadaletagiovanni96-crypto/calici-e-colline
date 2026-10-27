import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Evento from './pages/Evento';
import Checkout from './pages/Checkout';
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
            </Routes>
          </main>
        </Router>
      </EventoProvider>
    </UtenteProvider>
  );
}

export default App;
