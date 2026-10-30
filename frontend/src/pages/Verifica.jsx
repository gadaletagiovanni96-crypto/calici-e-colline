import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import { NaturaMorta } from '../components/Illustrazione';

export default function Verifica() {
  const [codice, setCodice] = useState('');
  const [esito, setEsito] = useState(null);
  const [errore, setErrore] = useState('');
  const [invio, setInvio] = useState(false);
  const [fotocameraAttiva, setFotocameraAttiva] = useState(false);

  const videoRef = useRef(null);
  const { esci } = useContext(UtenteContext);
  const navigate = useNavigate();

  // Il codice arriva dalla tastiera oppure dal QR letto dalla fotocamera
  const verificaCodice = useCallback(async (valore) => {
    const codicePulito = valore.trim(); 
    if (!codicePulito) {
      setErrore('Inserisci o scansiona un codice.');
      return;
    }

    setInvio(true);
    setErrore('');
    setEsito(null);

    try {
      const response = await api.post('/operatore/verifica', { codice: codicePulito });
      setEsito(response.data); // 200: biglietto venduto e non ancora usato
      setFotocameraAttiva(false);
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;
      // 404 = codice assente (non venduto), 409 = biglietto già controllato
      if (status === 404 || status === 409) {
        setEsito(data);
        setFotocameraAttiva(false);
      } else if (status === 401 || data?.errore === 'Token non valido o scaduto.') {
        esci();
        navigate('/login', { state: { from: '/verifica' } });
      } else if (status === 403) {
        navigate('/');
      } else {
        setErrore(data?.errore || 'Errore durante la verifica.');
      }
    } finally {
      setInvio(false);
    }
  }, [esci, navigate]);

  // Fotocamera: il browser legge il QR. Se non può, resta l'inserimento a mano
  useEffect(() => {
    if (!fotocameraAttiva) return undefined;

    let fermo = false;
    let stream;
    let timer;

    const avvia = async () => {
      if (!('BarcodeDetector' in window)) {
        setErrore('Questo browser non legge i QR dalla fotocamera. Inserisci il codice.');
        setFotocameraAttiva(false);
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (fermo) {
          stream.getTracks().forEach((traccia) => traccia.stop());
          return;
        }

        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const rilevatore = new window.BarcodeDetector({ formats: ['qr_code'] });
        timer = setInterval(async () => {
          if (fermo || !videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const trovati = await rilevatore.detect(videoRef.current);
            if (trovati.length > 0) {
              fermo = true;
              clearInterval(timer);
              setCodice(trovati[0].rawValue);
              verificaCodice(trovati[0].rawValue);
            }
          } catch {
            // Un singolo frame illeggibile non ferma la scansione
          }
        }, 500);
      } catch {
        if (!fermo) {
          setErrore('Fotocamera non disponibile. Inserisci il codice a mano.');
          setFotocameraAttiva(false);
        }
      }
    };

    avvia();

    return () => {
      fermo = true;
      clearInterval(timer);
      stream?.getTracks().forEach((traccia) => traccia.stop());
    };
  }, [fotocameraAttiva, verificaCodice]);

  const handleSubmit = (e) => {
    e.preventDefault();
    verificaCodice(codice);
  };

  return (
    <div className="anim-salita mx-auto grid max-w-5xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
      <div className="flex justify-center">
        <NaturaMorta className="anim-fluttua h-64 w-auto" />
      </div>

      <div>
      <p className="mb-2 text-sm font-light tracking-[0.28em] text-vino">/ ingresso</p>
      <h1 className="mb-2 text-4xl font-light tracking-wide text-testo">Verifica biglietto</h1>
      <p className="mb-6 text-testo/75">Scansiona il QR oppure inserisci il codice del biglietto.</p>

      {errore && <div className="mb-4 rounded-2xl bg-red-50 p-4 text-center text-red-700">{errore}</div>}

      <form className="bg-crema p-6" onSubmit={handleSubmit}>
        <label className="mb-1.5 block text-xs font-semibold tracking-[0.14em] text-muted uppercase" htmlFor="codice">Codice</label>
        <input
          id="codice"
          className="mb-4 w-full border border-bordo bg-white px-4 py-3 font-sans outline-none focus:border-vino"
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
          placeholder="Codice letto dal QR"
          autoComplete="off"
        />
        <button
          type="submit"
          className="w-full cursor-pointer bg-vino py-3.5 text-sm font-light tracking-[0.18em] text-crema transition duration-300 hover:bg-vino-scuro disabled:cursor-not-allowed disabled:bg-muted"
          disabled={invio}
        >
          {invio ? 'Verifica...' : 'Controlla biglietto'}
        </button>
        <button
          type="button"
          className="mt-3 w-full cursor-pointer bg-tela py-3.5 text-sm font-light tracking-[0.18em] text-prugna transition duration-300 hover:bg-white"
          onClick={() => setFotocameraAttiva((attiva) => !attiva)}
        >
          {fotocameraAttiva ? 'Chiudi fotocamera' : 'Scansiona con la fotocamera'}
        </button>

        {fotocameraAttiva && (
          <video ref={videoRef} className="mt-4 w-full rounded-lg bg-black" muted playsInline />
        )}
      </form>

      {esito && (
        <div className={esito.valido
          ? 'mt-6 rounded-2xl bg-green-50 p-4 text-center text-green-800'
          : 'mt-6 rounded-2xl bg-red-50 p-4 text-center text-red-700'}
        >
          <p className="mb-1 font-bold">{esito.messaggio}</p>
          {esito.dettagli && (
            <p>{esito.dettagli.acquirente} · {esito.dettagli.email}</p>
          )}
          {esito.dataScansione && (
            <p>Già controllato il {new Date(esito.dataScansione).toLocaleString('it-IT')}</p>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
