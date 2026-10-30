import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtenteContext } from '../context/UtenteContext';
import { EventoContext } from '../context/EventoContext';

const buyButton =
  'cursor-pointer rounded-full bg-oliva px-12 py-4 text-xl font-semibold text-superficie shadow-soft transition hover:-translate-y-0.5 hover:bg-oliva-scuro disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-muted disabled:hover:translate-y-0 disabled:hover:bg-muted';

export default function Evento() {
  const { utente } = useContext(UtenteContext);
  const { evento, caricamento, errore } = useContext(EventoContext);
  const navigate = useNavigate();

  const handleAcquisto = () => {
    if (!utente) {
      navigate('/login', { state: { from: '/checkout' } });
    } else {
      navigate('/checkout');
    }
  };
  if (caricamento && !evento) return <div className="py-20 text-center">Caricamento evento...</div>;
  if (!evento) return <div className="py-20 text-center text-red-600">{errore || "Impossibile caricare l'evento."}</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="rounded-b-[40px] bg-vino px-8 py-24 text-center text-superficie shadow-card">
        <h1 className="mb-4 text-[3.5rem] font-bold tracking-tight">{evento.titolo}</h1>
        <p className="mx-auto max-w-xl text-xl font-light opacity-90">{evento.descrizione}</p>
      </header>

      <main className="mx-auto -mt-12 mb-8 w-full max-w-5xl flex-1 px-4">
        <div className="rounded-2xl border border-bordo bg-superficie p-12 shadow-card">
          <div className="mb-12 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-8">
            <div className="rounded-lg border border-bordo bg-sfondo p-6 text-center">
              <div className="mb-2 text-sm font-semibold uppercase text-muted">Data e Ora</div>
              <div className="text-xl font-bold text-testo">
                {new Date(evento.dataOra).toLocaleString('it-IT', {
                  day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
            
            <div className="rounded-lg border border-bordo bg-sfondo p-6 text-center">
              <div className="mb-2 text-sm font-semibold uppercase text-muted">Location</div>
              <div className="text-xl font-bold text-testo">{evento.luogo}</div>
            </div>

            <div className="rounded-lg border border-bordo bg-sfondo p-6 text-center">
              <div className="mb-2 text-sm font-semibold uppercase text-muted">Disponibilità</div>
              <div className="text-xl font-bold text-testo">
                {evento.ticketDisponibili > 0 
                  ? `${evento.ticketDisponibili} posti rimasti` 
                  : 'Sold Out'}
              </div>
            </div>
          </div>

          <div className="border-t border-bordo pt-8 text-center">
            <span className="mb-6 block text-[2.5rem] font-bold text-vino">€ {evento.prezzo.toFixed(2)}</span>
            {utente?.ruolo === 'operatore' ? (
              <button className={buyButton} onClick={() => navigate('/verifica')}>
                Verifica un biglietto
              </button>
            ) : utente?.ruolo === 'amministratore' ? (
              <button className={buyButton} onClick={() => navigate('/dashboard')}>
                Vai alla dashboard
              </button>
            ) : (
              <button
                className={buyButton}
                onClick={handleAcquisto}
                disabled={evento.ticketDisponibili <= 0}
              >
                {evento.ticketDisponibili > 0 ? 'Acquista Biglietto' : 'Esaurito'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
