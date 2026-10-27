import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Evento.module.css';

export default function Evento() {
  const [evento, setEvento] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const response = await api.get('/evento'); 
        setEvento(response.data);
      } catch (err) {
        setErrore(err.response?.data?.errore || "Impossibile caricare l'evento.");
      } finally {
        setCaricamento(false);
      }
    };

    fetchEvento();
  }, []);

const handleAcquisto = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };
  if (caricamento) return <div style={{ textAlign: 'center', padding: '5rem' }}>Caricamento evento...</div>;
  if (errore) return <div style={{ color: 'red', textAlign: 'center', padding: '5rem' }}>{errore}</div>;

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>{evento.titolo}</h1>
        <p className={styles.heroSubtitle}>{evento.descrizione}</p>
      </header>

      <main className={styles.content}>
        <div className={styles.card}>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Data e Ora</div>
              <div className={styles.infoValue}>
                {new Date(evento.dataOra).toLocaleString('it-IT', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
            
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Location</div>
              <div className={styles.infoValue}>{evento.luogo}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>Disponibilità</div>
              <div className={styles.infoValue}>
                {evento.ticketDisponibili > 0 
                  ? `${evento.ticketDisponibili} posti rimasti` 
                  : 'Sold Out'}
              </div>
            </div>
          </div>

          <div className={styles.buySection}>
            <span className={styles.price}>€ {evento.prezzo.toFixed(2)}</span>
            <button 
              className={styles.buyButton} 
              onClick={handleAcquisto}
              disabled={evento.ticketDisponibili <= 0}
            >
              {evento.ticketDisponibili > 0 ? 'Acquista Biglietto' : 'Esaurito'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}