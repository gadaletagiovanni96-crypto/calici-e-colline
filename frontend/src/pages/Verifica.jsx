import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';

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
    <div className="mx-auto max-w-[520px] p-4">
      <h1 className="mb-2 text-[2rem] font-bold text-vino">Verifica biglietto</h1>
      <p className="mb-6 text-muted">Scansiona il QR oppure inserisci il codice del biglietto.</p>

      {errore && <div className="mb-4 rounded-lg bg-red-100 p-4 text-center text-red-700">{errore}</div>}

      <form className="rounded-2xl border border-bordo bg-superficie p-6 shadow-card" onSubmit={handleSubmit}>
        <label className="mb-1.5 block font-semibold" htmlFor="codice">Codice</label>
        <input
          id="codice"
          className="mb-4 w-full rounded-lg border border-bordo px-3 py-3 font-sans outline-none focus:border-vino"
          value={codice}
          onChange={(e) => setCodice(e.target.value)}
          placeholder="Codice letto dal QR"
          autoComplete="off"
        />
        <button
          type="submit"
          className="w-full cursor-pointer rounded-lg bg-oliva py-3.5 font-bold text-superficie disabled:cursor-not-allowed disabled:bg-muted"
          disabled={invio}
        >
          {invio ? 'Verifica...' : 'Controlla biglietto'}
        </button>
        <button
          type="button"
          className="mt-3 w-full cursor-pointer rounded-lg border border-vino bg-transparent py-3.5 font-bold text-vino"
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
          ? 'mt-6 rounded-lg bg-green-100 p-4 text-center text-green-800'
          : 'mt-6 rounded-lg bg-red-100 p-4 text-center text-red-700'}
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
  );
}
