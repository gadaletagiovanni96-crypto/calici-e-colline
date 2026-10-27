import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [dati, setDati] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setDati(response.data);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          // Se il token è scaduto o non si hanno i permessi, rimanda al login
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setErrore(err.response?.data?.errore || 'Errore nel caricamento della dashboard.');
        }
      } finally {
        setCaricamento(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (caricamento) return <div className={styles.message}>Caricamento statistiche in corso...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Amministratore</h1>
        <button onClick={handleLogout} className={styles.logoutButton}>Esci</button>
      </div>

      {errore && <div className={styles.error}>{errore}</div>}

      {dati && (
        <>
          {/* Griglia Statistiche */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{dati.statistiche.bigliettiVenduti}</span>
              <span className={styles.statLabel}>Biglietti Venduti</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{dati.statistiche.bigliettiDisponibili}</span>
              <span className={styles.statLabel}>Biglietti Disponibili</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>€ {dati.statistiche.ricavoTotale.toFixed(2)}</span>
              <span className={styles.statLabel}>Ricavo Totale</span>
            </div>
          </div>

          {/* Tabella Acquirenti */}
          <h2 className={styles.sectionTitle}>Ultimi Acquirenti</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Nome e Cognome</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Quantità</th>
                  <th className={styles.th}>Data Acquisto</th>
                </tr>
              </thead>
              <tbody>
                {dati.acquirenti.length > 0 ? (
                  dati.acquirenti.map((acquirente) => (
                    <tr key={acquirente.idOrdine}>
                      <td className={styles.td}>{acquirente.nome} {acquirente.cognome}</td>
                      <td className={styles.td}>{acquirente.email}</td>
                      <td className={styles.td}>{acquirente.quantita}</td>
                      <td className={styles.td}>{new Date(acquirente.dataAcquisto).toLocaleDateString('it-IT')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className={styles.message}>Nessun ordine effettuato finora.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}