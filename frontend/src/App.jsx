import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Evento from './pages/Evento';
import Checkout from './pages/Checkout';

// useLocation fa ricalcolare il menu a ogni cambio pagina, così legge il token appena salvato
function BarraNavigazione() {
  useLocation();
  const token = localStorage.getItem('token');
  const ruolo = localStorage.getItem('ruolo');

  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      backgroundColor: 'var(--color-primary)', 
      color: 'var(--color-surface)', 
      display: 'flex', 
      gap: '1.5rem',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <Link to="/">Evento</Link>
      <Link to="/login">Accesso Staff</Link>
      {token && ruolo === 'amministratore' && <Link to="/dashboard">Dashboard</Link>}
    </nav>
  );
}

function SoloAmministratore() {
  const token = localStorage.getItem('token');
  const ruolo = localStorage.getItem('ruolo');
  if (!token) return <Navigate to="/login" replace />;
  if (ruolo !== 'amministratore') return <Navigate to="/" replace />;
  return <Dashboard />;
}

function App() {
  return (
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
  );
}

export default App;