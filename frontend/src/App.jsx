import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Evento from './pages/Evento';
import Checkout from './pages/Checkout';
import { useState } from 'react';
import { Navigate } from 'react-router-dom';

function App() {
  const [token, setToken] = useState(()=> localStorage.getItem('token'));
  return (
    <Router>
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
        {token && <Link to="/dashboard">Dashboard</Link>}
      </nav>

      {/* Il contenitore dinamico dove React caricherà le pagine */}
      <main style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Evento />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" replace />}/>
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;