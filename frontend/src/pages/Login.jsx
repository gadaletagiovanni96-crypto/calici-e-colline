import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import styles from './Login.module.css'; // Importazione del CSS Module

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita il ricaricamento della pagina
    setErrore('');

    try {
      // Chiama la rotta backend che abbiamo creato in precedenza
      const response = await api.post('/auth/login', { email, password });
      
      // Salva il token nel browser per le richieste future
      localStorage.setItem('token', response.data.token);
      
      //controlla da dove proviene la richiesta di login
      const destinazione = location.state?.from || '/dashboard';
      navigate(destinazione);
    } catch (err) {
      // Mostra l'errore restituito dal backend (es. "Credenziali non valide")
      setErrore(err.response?.data?.errore || 'Errore di connessione al server.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Accesso Staff</h2>
        
        {errore && <div className={styles.errorBox}>{errore}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className={styles.button}>
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
}