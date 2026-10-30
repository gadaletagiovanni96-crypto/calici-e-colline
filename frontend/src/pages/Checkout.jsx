import { useContext, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import { EventoContext } from '../context/EventoContext';

const submitButton =
  'mt-6 w-full cursor-pointer rounded-lg bg-oliva py-4 text-lg font-bold text-superficie transition hover:bg-oliva-scuro disabled:cursor-not-allowed disabled:bg-muted disabled:hover:bg-muted';

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
  // Operatore e amministratore non comprano.
  useEffect(() => {
    if (!sessioneIniziale.current) {
      navigate('/login', { state: { from: '/checkout' } });
    } else if (sessioneIniziale.current.ruolo === 'operatore') {
      navigate('/verifica', { replace: true });
    } else if (sessioneIniziale.current.ruolo === 'amministratore') {
      navigate('/dashboard', { replace: true });
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
    return <div className="p-12 text-center text-red-600">{erroreEvento || erroreMsg}</div>;
  }

  if (!evento) {
    return <div className="p-12 text-center">Caricamento carrello...</div>;
  }

  if (statoCaricamento === 'successo') {
    return (
      <div className="mx-auto my-8 max-w-3xl px-4">
        <div className="rounded-2xl border border-bordo bg-superficie p-12 text-center shadow-soft">
          <div className="mb-4 text-6xl">🍷</div>
          <h2 className="mb-8 text-center text-[2rem] text-vino">Ordine Completato!</h2>
          <p>
            Hai acquistato {ordine?.ordine?.quantita ?? quantitaNum}{' '}
            {(ordine?.ordine?.quantita ?? quantitaNum) === 1 ? 'biglietto' : 'biglietti'} per un
            totale di € {Number(ordine?.ordine?.importoTotale ?? totale).toFixed(2)}.
          </p>
          {/* I QR non stanno nella mail: restano consultabili dalla pagina acquisti */}
          <p>I QR Code dei biglietti sono nella pagina dei tuoi acquisti.</p>
          <button className={submitButton} onClick={() => navigate('/acquisti')}>
            Vedi i biglietti
          </button>
          <button
            className="mt-3 w-full cursor-pointer rounded-lg border border-vino bg-transparent py-4 text-lg font-bold text-vino"
            onClick={() => navigate('/')}
          >
            Torna alla Home
          </button>
        </div>
      </div>
    );
  }

  const esaurito = evento.ticketDisponibili !== undefined && evento.ticketDisponibili < 1;
  return (
    <div className="mx-auto my-8 max-w-3xl px-4">
      <h1 className="mb-8 text-center text-[2rem] text-vino">Completa l'Acquisto</h1>

      <form className="grid grid-cols-1 gap-8 md:grid-cols-[3fr_2fr]" onSubmit={handleSubmit}>
        <div className="rounded-2xl border border-bordo bg-superficie p-8 shadow-soft">
          <h2 className="mb-6 border-b-2 border-sfondo pb-2 text-xl">Biglietti</h2>

          {statoCaricamento === 'errore' && (
            <div className="mb-4 text-red-600">{erroreMsg}</div>
          )}

          {esaurito ? (
            <p>Biglietti esauriti.</p>
          ) : (
            <div className="mb-4 flex flex-col">
              <label className="mb-1.5 text-sm font-semibold text-testo" htmlFor="quantita">Quantità biglietti</label>
              <input
                id="quantita"
                type="number"
                name="quantita"
                className="rounded-lg border border-bordo px-3 py-3 font-sans outline-none focus:border-vino"
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

        <div className="rounded-2xl border border-bordo bg-superficie p-8 shadow-soft">
          <h2 className="mb-6 border-b-2 border-sfondo pb-2 text-xl">Riepilogo</h2>
          <div className="mb-4 flex justify-between text-muted">
            <span>Evento</span>
            <span>{evento.titolo}</span>
          </div>
          <div className="mb-4 flex justify-between text-muted">
            <span>Prezzo unitario</span>
            <span>€ {evento.prezzo.toFixed(2)}</span>
          </div>
          <div className="mb-4 flex justify-between text-muted">
            <span>Biglietti</span>
            <span>x {quantitaValida ? quantitaNum : 0}</span>
          </div>
          <div className="mt-6 flex justify-between border-t border-bordo pt-4 text-xl font-bold text-vino">
            <span>Totale da pagare</span>
            <span>€ {totale.toFixed(2)}</span>
          </div>

          <button
            type="submit"
            className={submitButton}
            disabled={statoCaricamento === 'invio' || esaurito}
          >
            {statoCaricamento === 'invio' ? 'Elaborazione...' : 'Conferma Ordine'}
          </button>
        </div>
      </form>
    </div>
  );
}
