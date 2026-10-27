import { useContext, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import { EventoContext } from '../context/EventoContext';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { utente, esci } = useContext(UtenteContext);
  const sessioneIniziale = useRef(utente);
  const { evento, errore: erroreEvento, ricarica } = useContext(EventoContext);
  const [quantita, setQuantita] = useState(1);
  const [statoCaricamento, setStatoCaricamento] = useState('iniziale'); // iniziale, invio, successo, errore
  const [erroreMsg, setErroreMsg] = useState('');
  const [ordine, setOrdine] = useState(null); // risposta del backend: { ordine, tickets }

  const navigate = useNavigate();

  // Solo all'ingresso: il logout dalla barra porta alla home, non di nuovo al login.
  // L'operatore non compra: se arriva qui viene mandato alla verifica.
  useEffect(() => {
    if (!sessioneIniziale.current) {
      navigate('/login', { state: { from: '/checkout' } });
    } else if (sessioneIniziale.current.ruolo === 'operatore') {
      navigate('/verifica', { replace: true });
    }
  }, [navigate]);

  // evento parte null: senza il ?. il render si interrompe e il redirect dell'operatore non parte
  const disponibili = evento?.ticketDisponibili ?? 0;
  const quantitaNum = Number(quantita);
  const quantitaValida =
    Number.isInteger(quantitaNum) && quantitaNum >= 1 && quantitaNum <= disponibili;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Stessa validazione del backend (quantità >= 1), più il tetto di disponibilità
    if (!quantitaValida) {
      setStatoCaricamento('errore');
      setErroreMsg(`Scegli da 1 a ${disponibili} biglietti.`);
      return;
    }

    setStatoCaricamento('invio');
    setErroreMsg('');

    try {
      // Il backend legge solo "quantita": utente ed email arrivano dal token (req.user)
      const response = await api.post('/ordini/acquista', { quantita: quantitaNum });
      setOrdine(response.data); // { messaggio, ordine, tickets }
      setStatoCaricamento('successo');
      ricarica();
    } catch (err) {
      // 401 = token assente. Il 403 del middleware è il token scaduto; un altro 403 è un divieto (es. operatore)
      const messaggio = err.response?.data?.errore;
      if (err.response?.status === 401 || messaggio === 'Token non valido o scaduto.') {
        esci();
        navigate('/login', { state: { from: '/checkout' } });
        return;
      }
      setStatoCaricamento('errore');
      setErroreMsg(err.response?.data?.errore || "Errore durante l'elaborazione dell'ordine.");
    }
  };

  const totale = quantitaValida && evento ? evento.prezzo * quantitaNum : 0;

  // Evento non caricato: mostra l'errore invece di restare in caricamento all'infinito
  if (!evento && (erroreEvento || erroreMsg)) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: 'red' }}>{erroreEvento || erroreMsg}</div>;
  }

  if (!evento) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Caricamento carrello...</div>;
  }

  if (statoCaricamento === 'successo') {
    return (
      <div className={styles.container}>
        <div className={`${styles.card} ${styles.successMessage}`}>
          <div className={styles.successIcon}>🍷</div>
          <h2 className={styles.title}>Ordine Completato!</h2>
          <p>
            Hai acquistato {ordine?.ordine?.quantita ?? quantitaNum}{' '}
            {(ordine?.ordine?.quantita ?? quantitaNum) === 1 ? 'biglietto' : 'biglietti'} per un
            totale di € {Number(ordine?.ordine?.importoTotale ?? totale).toFixed(2)}.
          </p>
          {/* I QR non stanno nella mail: restano consultabili dalla pagina acquisti */}
          <p>I QR Code dei biglietti sono nella pagina dei tuoi acquisti.</p>
          <button className={styles.submitButton} onClick={() => navigate('/acquisti')}>
            Vedi i biglietti
          </button>
          <button className={styles.secondaryButton} onClick={() => navigate('/')}>
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const esaurito = evento.ticketDisponibili !== undefined && evento.ticketDisponibili < 1;
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Completa l'Acquisto</h1>

      <form className={styles.grid} onSubmit={handleSubmit}>
        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Biglietti</h2>

          {statoCaricamento === 'errore' && (
            <div style={{ color: 'red', marginBottom: '1rem' }}>{erroreMsg}</div>
          )}

          {esaurito ? (
            <p>Biglietti esauriti.</p>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="quantita">Quantità biglietti</label>
              <input
                id="quantita"
                type="number"
                name="quantita"
                className={styles.input}
                min="1"
                max={disponibili}
                required
                value={quantita}
                onChange={(e) => setQuantita(e.target.value)}
              />
              {evento.ticketDisponibili !== undefined && (
                <small>Posti disponibili: {evento.ticketDisponibili}</small>
              )}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h2 className={styles.sectionTitle}>Riepilogo</h2>
          <div className={styles.summaryRow}>
            <span>Evento</span>
            <span>{evento.titolo}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Prezzo unitario</span>
            <span>€ {evento.prezzo.toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Biglietti</span>
            <span>x {quantitaValida ? quantitaNum : 0}</span>
          </div>
          <div className={styles.totalRow}>
            <span>Totale da pagare</span>
            <span>€ {totale.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={statoCaricamento === 'invio' || esaurito}
          >
            {statoCaricamento === 'invio' ? 'Elaborazione...' : 'Conferma Ordine'}
          </button>
        </div>
      </form>
    </div>
  );
}
