import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import { EventoContext } from '../context/EventoContext';

// datetime-local vuole "2026-10-27T18:00", senza il fuso dell'ISO del database
function versoDataOraLocale(iso) {
  if (!iso) return '';
  const data = new Date(iso);
  const dueCifre = (n) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${dueCifre(data.getMonth() + 1)}-${dueCifre(data.getDate())}T${dueCifre(data.getHours())}:${dueCifre(data.getMinutes())}`;
}

const label = 'mb-1.5 text-xs font-semibold tracking-[0.14em] text-muted uppercase';
const campo =
  'border border-bordo bg-white px-4 py-3 font-sans text-base outline-none transition focus:border-vino';

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

  if (caricamento) return <div className="anim-comparsa p-8 text-center text-lg text-muted">Caricamento statistiche in corso...</div>;

  return (
    <div className="anim-salita mx-auto max-w-6xl">
      <div className="mb-8">
        <p className="mb-2 text-sm font-light tracking-[0.28em] text-vino">/ admin</p>
        <h1 className="text-4xl font-light tracking-wide text-testo">Dashboard Amministratore</h1>
      </div>

      {errore && <div className="mb-4 rounded-2xl bg-red-50 p-4 text-center text-red-700">{errore}</div>}

      {dati && (
        <>
          {/* Griglia Statistiche */}
          <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
            <div className="flex flex-col bg-crema p-6 transition duration-300 hover:-translate-y-1">
              <span className="mb-2 text-[2.5rem] font-bold text-vino">{dati.statistiche.bigliettiVenduti}</span>
              <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Biglietti Venduti</span>
            </div>
            <div className="flex flex-col bg-crema p-6 transition duration-300 hover:-translate-y-1">
              <span className="mb-2 text-[2.5rem] font-bold text-vino">{dati.statistiche.bigliettiDisponibili}</span>
              <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Biglietti Disponibili</span>
            </div>
            <div className="flex flex-col bg-crema p-6 transition duration-300 hover:-translate-y-1">
              <span className="mb-2 text-[2.5rem] font-bold text-vino">€ {dati.statistiche.ricavoTotale.toFixed(2)}</span>
              <span className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Ricavo Totale</span>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-semibold text-testo">Modifica evento</h2>
          <form className="mb-12 bg-crema p-6" onSubmit={handleSalva}>
            {erroreForm && <div className="mb-4 rounded-2xl bg-red-50 p-4 text-center text-red-700">{erroreForm}</div>}
            {messaggio && <div className="mb-4 rounded-2xl bg-green-50 p-4 text-center text-green-800">{messaggio}</div>}

            <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
              <div className="mb-4 flex flex-col">
                <label className={label} htmlFor="titolo">Titolo</label>
                <input id="titolo" name="titolo" className={campo} value={form?.titolo ?? ''} onChange={handleChange} required />
              </div>
              <div className="mb-4 flex flex-col">
                <label className={label} htmlFor="luogo">Luogo</label>
                <input id="luogo" name="luogo" className={campo} value={form?.luogo ?? ''} onChange={handleChange} required />
              </div>
              <div className="mb-4 flex flex-col">
                <label className={label} htmlFor="dataOra">Data e ora</label>
                <input id="dataOra" name="dataOra" type="datetime-local" className={campo} value={form?.dataOra ?? ''} onChange={handleChange} required />
              </div>
              <div className="mb-4 flex flex-col">
                <label className={label} htmlFor="prezzo">Prezzo (€)</label>
                <input id="prezzo" name="prezzo" type="number" min="0" step="0.01" className={campo} value={form?.prezzo ?? ''} onChange={handleChange} required />
              </div>
              <div className="mb-4 flex flex-col">
                <label className={label} htmlFor="ticketDisponibili">Biglietti disponibili</label>
                <input id="ticketDisponibili" name="ticketDisponibili" type="number" min="0" step="1" className={campo} value={form?.ticketDisponibili ?? ''} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-4 flex flex-col">
              <label className={label} htmlFor="descrizione">Descrizione</label>
              <textarea id="descrizione" name="descrizione" className={`${campo} min-h-[110px] resize-y`} value={form?.descrizione ?? ''} onChange={handleChange} required />
            </div>

            <button
              type="submit"
              className="cursor-pointer bg-vino px-6 py-3 text-sm font-light tracking-[0.18em] text-crema transition duration-300 hover:bg-vino-scuro disabled:cursor-not-allowed disabled:bg-muted"
              disabled={salvataggio || !form}
            >
              {salvataggio ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </form>

          {/* Tabella Acquirenti */}
          <h2 className="mb-4 text-2xl font-semibold text-testo">Ultimi Acquirenti</h2>
          <div className="overflow-x-auto bg-crema">
            <table className="w-full border-collapse [&_tbody_tr:last-child_td]:border-b-0 [&_tbody_tr]:transition [&_tbody_tr]:hover:bg-sfondo">
              <thead>
                <tr>
                  <th className="border-b border-bordo bg-sfondo px-6 py-4 text-left text-sm font-semibold text-muted uppercase">Nome e Cognome</th>
                  <th className="border-b border-bordo bg-sfondo px-6 py-4 text-left text-sm font-semibold text-muted uppercase">Email</th>
                  <th className="border-b border-bordo bg-sfondo px-6 py-4 text-left text-sm font-semibold text-muted uppercase">Quantità</th>
                  <th className="border-b border-bordo bg-sfondo px-6 py-4 text-left text-sm font-semibold text-muted uppercase">Data Acquisto</th>
                </tr>
              </thead>
              <tbody>
                {dati.acquirenti.length > 0 ? (
                  dati.acquirenti.map((acquirente) => (
                    <tr key={acquirente.idOrdine}>
                      <td className="border-b border-bordo px-6 py-4 text-left text-base text-testo">{acquirente.nome} {acquirente.cognome}</td>
                      <td className="border-b border-bordo px-6 py-4 text-left text-base text-testo">{acquirente.email}</td>
                      <td className="border-b border-bordo px-6 py-4 text-left text-base text-testo">{acquirente.quantita}</td>
                      <td className="border-b border-bordo px-6 py-4 text-left text-base text-testo">{new Date(acquirente.dataAcquisto).toLocaleDateString('it-IT')}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-8 text-center text-lg text-muted">Nessun ordine effettuato finora.</td>
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
