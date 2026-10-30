import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtenteContext } from '../context/UtenteContext';
import { EventoContext } from '../context/EventoContext';
import { NaturaMorta } from '../components/Illustrazione';

const buyButton =
  'cursor-pointer bg-vino px-8 py-3.5 text-sm font-light tracking-[0.18em] text-crema transition duration-300 hover:bg-vino-scuro disabled:cursor-not-allowed disabled:bg-muted';

const scheda = 'bg-crema p-6 transition duration-300 hover:-translate-y-1';

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
  if (caricamento && !evento) return <div className="anim-comparsa py-24 text-center text-lg text-testo/70">Caricamento evento...</div>;
  if (!evento) return <div className="anim-comparsa py-24 text-center text-lg text-red-700">{errore || "Impossibile caricare l'evento."}</div>;

  const anno = new Date(evento.dataOra).getFullYear();

  return (
    <div>
      <div className="grid items-center gap-6 min-[720px]:grid-cols-[minmax(0,1.1fr)_minmax(220px,360px)]">
        <div className="anim-salita max-w-xl pt-4">
          <p className="mb-4 text-sm font-light tracking-[0.28em] text-prugna">/ {anno}</p>
          <h1 className="text-[clamp(2.4rem,5vw,4.2rem)] font-light leading-[1.05] tracking-tight text-prugna">
            {evento.titolo}
          </h1>
          <p className="mt-5 max-w-md text-lg font-light leading-relaxed text-testo/85">{evento.descrizione}</p>
          <div className="anim-salita anim-ritardo mt-8 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-light text-prugna">€ {evento.prezzo.toFixed(2)}</span>
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

        <NaturaMorta className="anim-fluttua mx-auto h-[min(420px,58vh)] w-auto" />
      </div>

      <div className="anim-salita anim-ritardo-2 mt-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div className={scheda}>
          <div className="mb-2 text-xs font-light tracking-[0.18em] text-muted uppercase">Data e Ora</div>
          <div className="text-lg font-light text-testo">
            {new Date(evento.dataOra).toLocaleString('it-IT', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>

        <div className={scheda}>
          <div className="mb-2 text-xs font-light tracking-[0.18em] text-muted uppercase">Location</div>
          <div className="text-lg font-light text-testo">{evento.luogo}</div>
        </div>

        <div className={scheda}>
          <div className="mb-2 text-xs font-light tracking-[0.18em] text-muted uppercase">Disponibilità</div>
          <div className="text-lg font-light text-testo">
            {evento.ticketDisponibili > 0
              ? `${evento.ticketDisponibili} posti rimasti`
              : 'Sold Out'}
          </div>
        </div>
      </div>

      <p aria-hidden="true" className="-mx-4 -mb-10 mt-12 bg-vino py-10 text-center text-5xl font-light tracking-[0.45em] text-crema sm:-mx-7 sm:text-6xl lg:-mx-8">
        vino
      </p>
    </div>
  );
}
