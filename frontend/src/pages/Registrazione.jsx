import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import styles from './Login.module.css';

export default function Registrazione() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [invio, setInvio] = useState(false);

  const { accedi } = useContext(UtenteContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegistrazione = async (e) => {
    e.preventDefault();
    setErrore('');

    if (password !== confermaPassword) {
      setErrore('Le password non coincidono.');
      return;
    }

    setInvio(true);

    try {
      // Il backend assegna sempre il ruolo "utente" e hasha la password
      await api.post('/auth/registrazione', { nome, cognome, email, password });

      // Nessuna email di conferma: si entra subito con le stesse credenziali
      const response = await api.post('/auth/login', { email, password });
      accedi(response.data.token, response.data.utente.ruolo , response.data.utente.nome);
      navigate(location.state?.from || '/');
    } catch (err) {
      setErrore(err.response?.data?.errore || 'Errore durante la registrazione.');
    } finally {
      setInvio(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>Registrazione</h2>

        {errore && <div className={styles.errorBox}>{errore}</div>}

        <form onSubmit={handleRegistrazione}>
          <div className={styles.formGroup}>
            <label htmlFor="nome" className={styles.label}>Nome</label>
            <input
              id="nome"
              className={styles.input}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cognome" className={styles.label}>Cognome</label>
            <input
              id="cognome"
              className={styles.input}
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confermaPassword" className={styles.label}>Conferma password</label>
            <input
              id="confermaPassword"
              type="password"
              className={styles.input}
              value={confermaPassword}
              onChange={(e) => setConfermaPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className={styles.button} disabled={invio}>
            {invio ? 'Registrazione...' : 'Crea account'}
          </button>
        </form>

        <Link to="/login" state={location.state} className={styles.switchLink}>
          Hai già un account? Accedi
        </Link>
      </div>
    </div>
  );
}
