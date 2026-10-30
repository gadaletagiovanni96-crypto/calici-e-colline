import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import { EventoContext } from '../context/EventoContext';
import styles from './Dashboard.module.css';

// datetime-local vuole "2026-10-27T18:00", senza il fuso dell'ISO del database
function versoDataOraLocale(iso) {
  if (!iso) return '';
  const data = new Date(iso);
  const dueCifre = (n) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${dueCifre(data.getMonth() + 1)}-${dueCifre(data.getDate())}T${dueCifre(data.getHours())}:${dueCifre(data.getMinutes())}`;
}

export default function Dashboard() {
  const [dati, setDati] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');
  const [form, setForm] = useState(null);
  const [salvataggio, setSalvataggio] = useState(false);
  const [messaggio, setMessaggio] = useState('');
  const [erroreForm, setErroreForm] = useState('');
  const [aggiorna, setAggiorna] = useState(0);
  
  const { esci } = useContext(UtenteContext);
  const { evento, ricarica } = useContext(EventoContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setDati(response.data);
      } catch (err) {
        const status = err.response?.status;
        const messaggioErrore = err.response?.data?.errore;
        // 403 del middleware è il token scaduto; 403 del ruolo tiene la sessione e torna alla home
        if (status === 401 || messaggioErrore === 'Token non valido o scaduto.') {
          esci();
          navigate('/login');
        } else if (status === 403) {
          navigate('/');
        } else {
          setErrore(messaggioErrore || 'Errore nel caricamento della dashboard.');
        }
      } finally {
        setCaricamento(false);
      }
    };

    fetchDashboardData();
  }, [navigate, esci, aggiorna]);

  // Il form parte dai dati già salvati, così l'admin modifica e non riscrive tutto da zero
  useEffect(() => {
    if (!evento) return;
    setForm({
      titolo: evento.titolo,
      descrizione: evento.descrizione,
      dataOra: versoDataOraLocale(evento.dataOra),
      luogo: evento.luogo,
      prezzo: evento.prezzo,
      ticketDisponibili: evento.ticketDisponibili,
    });
  }, [evento]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSalva = async (e) => {
    e.preventDefault();
    setErroreForm('');
    setMessaggio('');

    const prezzo = Number(form.prezzo);
    const posti = Number(form.ticketDisponibili);
    if (!form.titolo.trim() || !form.descrizione.trim() || !form.luogo.trim() || !form.dataOra) {
      setErroreForm('Compila tutti i campi.');
      return;
    }
    if (!Number.isFinite(prezzo) || prezzo < 0 || !Number.isInteger(posti) || posti < 0) {
      setErroreForm('Prezzo e posti disponibili non possono essere negativi.');
      return;
    }

    setSalvataggio(true);
    try {
      await api.put('/evento', {
        titolo: form.titolo.trim(),
        descrizione: form.descrizione.trim(),
        dataOra: new Date(form.dataOra).toISOString(),
        luogo: form.luogo.trim(),
        prezzo,
        ticketDisponibili: posti,
      });
      setMessaggio('Evento aggiornato.');
      await ricarica();
      setAggiorna((n) => n + 1);
    } catch (err) {
      const status = err.response?.status;
      const messaggioErrore = err.response?.data?.errore;
      if (status === 401 || messaggioErrore === 'Token non valido o scaduto.') {
        esci();
        navigate('/login');
      } else if (status === 403) {
        navigate('/');
      } else {
        setErroreForm(messaggioErrore || "Errore nel salvataggio dell'evento.");
      }
    } finally {
      setSalvataggio(false);
    }
  };

  if (caricamento) return <div className={styles.message}>Caricamento statistiche in corso...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Amministratore</h1>
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

          <h2 className={styles.sectionTitle}>Modifica evento</h2>
          <form className={styles.form} onSubmit={handleSalva}>
            {erroreForm && <div className={styles.error}>{erroreForm}</div>}
            {messaggio && <div className={styles.success}>{messaggio}</div>}

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="titolo">Titolo</label>
                <input id="titolo" name="titolo" className={styles.input} value={form?.titolo ?? ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="luogo">Luogo</label>
                <input id="luogo" name="luogo" className={styles.input} value={form?.luogo ?? ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="dataOra">Data e ora</label>
                <input id="dataOra" name="dataOra" type="datetime-local" className={styles.input} value={form?.dataOra ?? ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="prezzo">Prezzo (€)</label>
                <input id="prezzo" name="prezzo" type="number" min="0" step="0.01" className={styles.input} value={form?.prezzo ?? ''} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="ticketDisponibili">Biglietti disponibili</label>
                <input id="ticketDisponibili" name="ticketDisponibili" type="number" min="0" step="1" className={styles.input} value={form?.ticketDisponibili ?? ''} onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="descrizione">Descrizione</label>
              <textarea id="descrizione" name="descrizione" className={styles.textarea} value={form?.descrizione ?? ''} onChange={handleChange} required />
            </div>

            <button type="submit" className={styles.saveButton} disabled={salvataggio || !form}>
              {salvataggio ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </form>

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