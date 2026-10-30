import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UtenteContext } from '../context/UtenteContext';
import { EventoContext } from '../context/EventoContext';

const buyButton =
  'cursor-pointer rounded-full bg-vino px-8 py-3.5 text-sm font-semibold tracking-[0.12em] text-white uppercase shadow-[0_12px_28px_rgb(255_92_26/0.35)] transition duration-300 hover:-translate-y-0.5 hover:bg-vino-scuro disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-[#b3a79e] disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:bg-[#b3a79e]';

const scheda =
  'rounded-[24px] bg-white/90 p-6 shadow-soft transition duration-300 hover:-translate-y-1';

export default function Evento() {
  const { utente } = useContext(UtenteContext);
  const { evento, caricamento, errore } = useContext(EventoContext);
  const navigate = useNavigate();
  const [verso, setVerso] = useState(0);

  // Lo scroll della home inclina il calice e tinge la pagina di rosa
  useEffect(() => {
    const radice = document.documentElement;
    const ridotta = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (ridotta) {
      radice.style.setProperty('--verso', '0');
      return undefined;
    }

    let frame = 0;
    const aggiorna = () => {
      frame = 0;
      const massimo = Math.max(1, radice.scrollHeight - window.innerHeight);
      const corsa = Math.min(380, massimo);
      const prossimo = Math.min(1, Math.max(0, window.scrollY / corsa));
      radice.style.setProperty('--verso', prossimo.toFixed(3));
      setVerso((attuale) => (Math.abs(attuale - prossimo) < 0.01 ? attuale : prossimo));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(aggiorna);
    };

    aggiorna();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      radice.style.setProperty('--verso', '0');
    };
  }, []);

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
    <div className="relative">
      <p aria-hidden="true" className="pointer-events-none absolute left-0 top-0 select-none font-display text-[clamp(4.5rem,16vw,11rem)] leading-none tracking-tight text-white/35">
        COLLINE
      </p>

      <div className="relative z-10 grid items-center gap-2 min-[720px]:grid-cols-[minmax(0,1.05fr)_minmax(200px,340px)]">
        <div className="anim-salita max-w-xl pt-10 min-[720px]:pt-16 min-[720px]:pb-6">
          <p className="mb-4 text-sm font-semibold tracking-[0.22em] text-vino">/ {anno}</p>
          <h1 className="text-[clamp(2.7rem,5.4vw,4.8rem)] font-bold uppercase leading-[0.92] tracking-tight text-testo">
            {evento.titolo}
          </h1>
          <p className="mt-5 max-w-md text-lg font-light leading-relaxed text-testo/85">{evento.descrizione}</p>
        </div>

        <div className="relative z-20 flex justify-center min-[720px]:justify-end">
          <div
            className="relative"
            style={{ transform: `rotate(${-verso * 32}deg)`, transformOrigin: '58% 78%' }}
          >
            <div className="anim-fluttua relative">
              <img
                src="/immagini/calice.png"
                alt=""
                className="relative z-10 h-[min(460px,62vh)] w-auto drop-shadow-[0_28px_36px_rgb(40_24_12/0.28)]"
              />
              <div
                className="pointer-events-none absolute top-[1%] left-[42%] z-20 h-[100%] w-10 origin-top"
                style={{
                  transform: `scaleY(${Math.max(0, (verso - 0.12) / 0.88)})`,
                  opacity: verso < 0.14 ? 0 : 1,
                }}
                aria-hidden="true"
              >
                <svg className="getto h-full w-full" viewBox="0 0 48 360" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gettoVino" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6d1228" />
                      <stop offset="40%" stopColor="#c43852" />
                      <stop offset="100%" stopColor="#f3b0bc" />
                    </linearGradient>
                  </defs>
                  <path
                    fill="url(#gettoVino)"
                    d="M18 0 C 26 28 8 64 18 110 C 30 164 6 210 20 268 C 30 312 12 340 22 360 L 34 360 C 24 332 40 300 30 256 C 16 198 38 150 28 96 C 20 52 32 22 26 0 Z"
                  />
                </svg>
                <span className="goccia absolute top-2 left-2 size-2 rounded-full bg-[#a32038]" />
                <span className="goccia absolute top-6 left-5 size-1.5 rounded-full bg-[#d45268]" style={{ animationDelay: '0.35s' }} />
                <span className="goccia absolute top-0 left-3 size-2.5 rounded-full bg-[#8e1830]" style={{ animationDelay: '0.7s' }} />
              </div>
              <div
                className="pointer-events-none absolute bottom-[6%] left-[18%] z-0 h-7 -translate-x-1/2 rounded-[100%] bg-[#d4536a] blur-md"
                style={{ width: `${28 + verso * 150}px`, opacity: verso < 0.14 ? 0 : verso }}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-30 -mt-2 min-[720px]:-mt-24">
        <p aria-hidden="true" className="pointer-events-none select-none font-display text-[clamp(5rem,18vw,12rem)] leading-[0.78] tracking-tight text-white">
          CALICI
        </p>

        <div className="anim-salita anim-ritardo mt-3 flex flex-wrap items-center gap-4">
          <span className="text-3xl font-bold text-testo">€ {evento.prezzo.toFixed(2)}</span>
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

      <div className="anim-salita anim-ritardo-2 mt-10 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div className={scheda}>
          <div className="mb-2 text-xs font-semibold tracking-[0.16em] text-muted uppercase">Data e Ora</div>
          <div className="text-lg font-semibold text-testo">
            {new Date(evento.dataOra).toLocaleString('it-IT', {
              day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>

        <div className={scheda}>
          <div className="mb-2 text-xs font-semibold tracking-[0.16em] text-muted uppercase">Location</div>
          <div className="text-lg font-semibold text-testo">{evento.luogo}</div>
        </div>

        <div className={scheda}>
          <div className="mb-2 text-xs font-semibold tracking-[0.16em] text-muted uppercase">Disponibilità</div>
          <div className="text-lg font-semibold text-testo">
            {evento.ticketDisponibili > 0
              ? `${evento.ticketDisponibili} posti rimasti`
              : 'Sold Out'}
          </div>
        </div>
      </div>

      <figure className="group anim-salita anim-ritardo-2 mt-6 overflow-hidden rounded-[28px] shadow-card">
        <img
          src="/immagini/colline.jpg"
          alt="Colline e vigneti"
          className="h-64 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-80"
        />
      </figure>
    </div>
  );
}
