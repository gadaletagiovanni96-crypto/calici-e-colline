import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import styles from './Acquisti.module.css';

// Il QR non è salvato nel database: è un'immagine generata dal codice del ticket
function urlQr(codice) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(codice)}`;
}

export default function Acquisti() {
  const [acquisti, setAcquisti] = useState([]);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');

  const { esci } = useContext(UtenteContext);
  const navigate = useNavigate();

  useEffect(() => {
    const caricaAcquisti = async () => {
      try {
        const response = await api.get('/ordini/miei');
        setAcquisti(response.data);
      } catch (err) {
        const status = err.response?.status;
        const messaggio = err.response?.data?.errore;
        if (status === 401 || messaggio === 'Token non valido o scaduto.') {
          esci();
          navigate('/login', { state: { from: '/acquisti' } });
        } else {
          setErrore(messaggio || 'Errore nel caricamento degli acquisti.');
        }
      } finally {
        setCaricamento(false);
      }
    };

    caricaAcquisti();
  }, [navigate, esci]);

  if (caricamento) return <div className={styles.message}>Caricamento acquisti...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>I miei acquisti</h1>

      {errore && <div className={styles.error}>{errore}</div>}

      {!errore && acquisti.length === 0 && (
        <p className={styles.message}>Non hai ancora acquistato biglietti.</p>
      )}

      {acquisti.map((ordine) => (
        <article key={ordine.id} className={styles.card}>
          <h2 className={styles.orderTitle}>
            Ordine del {new Date(ordine.dataAcquisto).toLocaleString('it-IT', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </h2>
          <p className={styles.orderMeta}>
            {ordine.quantita} {ordine.quantita === 1 ? 'biglietto' : 'biglietti'} · € {Number(ordine.importoTotale).toFixed(2)}
          </p>

          <div className={styles.tickets}>
            {ordine.tickets.map((ticket, indice) => (
              <div key={ticket._id} className={styles.ticket}>
                <img
                  src={urlQr(ticket.codice)}
                  alt={`QR code del biglietto ${indice + 1}`}
                  width="160"
                  height="160"
                />
                <p>Biglietto {indice + 1}</p>
                <code>{ticket.codice}</code>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
