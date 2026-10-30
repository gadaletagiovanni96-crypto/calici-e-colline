import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';

// Il QR non è salvato nel database: il servizio esterno disegna l'immagine a partire dal codice del ticket
function urlQr(codice) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(codice)}`;
}

export default function Acquisti() {
  const [acquisti, setAcquisti] = useState([]); // storico ordini con i relativi ticket
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');

  const { esci } = useContext(UtenteContext);
  const navigate = useNavigate();

  // Al primo render chiede gli acquisti dell'utente loggato (il token lo aggiunge l'interceptor di axios)
  useEffect(() => {
    const caricaAcquisti = async () => {
      try {
        const response = await api.get('/ordini/miei');
        setAcquisti(response.data);
      } catch (err) {
        const status = err.response?.status;
        const messaggio = err.response?.data?.errore;
        // 401 = token assente, 403 del middleware = token scaduto: si esce e si torna al login
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

  if (caricamento) return <div className="anim-comparsa p-8 text-center text-lg text-muted">Caricamento acquisti...</div>;

  return (
    <div className="anim-salita mx-auto max-w-[900px]">
      <div className="mb-8 grid items-center gap-6 md:grid-cols-[180px_1fr]">
        <img src="/immagini/bottiglia.jpg" alt="" className="h-36 w-full rounded-[24px] object-cover shadow-soft" />
        <div>
          <p className="mb-2 text-sm font-semibold tracking-[0.2em] text-vino">/ BIGLIETTI</p>
          <h1 className="text-4xl font-bold tracking-tight text-testo">I miei acquisti</h1>
        </div>
      </div>

      {errore && <div className="mb-8 rounded-2xl bg-red-50 p-4 text-center text-red-700">{errore}</div>}

      {/* Lista vuota: l'utente è loggato ma non ha ancora ordini */}
      {!errore && acquisti.length === 0 && (
        <p className="rounded-[28px] bg-white p-8 text-center text-lg text-muted shadow-soft">Non hai ancora acquistato biglietti.</p>
      )}

      {/* Un riquadro per ordine, e dentro un QR per ogni biglietto */}
      {acquisti.map((ordine) => (
        <article key={ordine.id} className="anim-salita mb-6 rounded-[28px] bg-white p-6 shadow-card">
          <h2 className="mb-1 text-xl">
            Ordine del {new Date(ordine.dataAcquisto).toLocaleString('it-IT', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </h2>
          <p className="mb-5 text-muted">
            {ordine.quantita} {ordine.quantita === 1 ? 'biglietto' : 'biglietti'} · € {Number(ordine.importoTotale).toFixed(2)}
          </p>

          <div className="flex flex-wrap gap-4">
            {ordine.tickets.map((ticket, indice) => (
              <div key={ticket._id} className="flex flex-col items-center gap-1.5 rounded-[20px] bg-sfondo p-4 transition duration-300 hover:-translate-y-1">
                <img
                  className="rounded bg-white"
                  src={urlQr(ticket.codice)}
                  alt={`QR code del biglietto ${indice + 1}`}
                  width="160"
                  height="160"
                />
                <p className="font-semibold">Biglietto {indice + 1}</p>
                <code className="max-w-[180px] text-center text-xs break-all text-muted">{ticket.codice}</code>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
