import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import { NaturaMorta } from '../components/Illustrazione';

const label = 'mb-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase';
const input =
  'border border-bordo bg-white px-4 py-3 font-sans transition outline-none focus:border-vino';

export default function Registrazione() {
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confermaPassword, setConfermaPassword] = useState('');
  const [errore, setErrore] = useState('');
  const [invio, setInvio] = useState(false);

  const { accedi } = useContext(UtenteContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRegistrazione = async (e) => {
    e.preventDefault();
    setErrore('');

    if (password !== confermaPassword) {
      setErrore('Le password non coincidono.');
      return;
    }

    setInvio(true);

    try {
      // Il backend assegna sempre il ruolo "utente" e hasha la password
      await api.post('/auth/registrazione', { nome, cognome, email, password });

      // Nessuna email di conferma: si entra subito con le stesse credenziali
      const response = await api.post('/auth/login', { email, password });
      accedi(response.data.token, response.data.utente.ruolo , response.data.utente.nome);
      navigate(location.state?.from || '/');
    } catch (err) {
      setErrore(err.response?.data?.errore || 'Errore durante la registrazione.');
    } finally {
      setInvio(false);
    }
  };

  return (
    <div className="anim-salita mx-auto grid max-w-5xl items-start gap-8 py-4 lg:grid-cols-2">
      <div className="flex justify-center lg:sticky lg:top-6">
        <NaturaMorta className="anim-fluttua h-56 w-auto sm:h-80" />
      </div>
      <div className="w-full bg-crema p-8 sm:p-10">
        <p className="mb-2 text-sm font-light tracking-[0.28em] text-vino">/ account</p>
        <h2 className="mb-8 text-4xl font-light tracking-wide text-testo">Registrazione</h2>

        {errore && <div className="mb-5 rounded-2xl bg-red-50 px-3 py-3 text-center text-sm text-red-700">{errore}</div>}

        <form onSubmit={handleRegistrazione}>
          <div className="mb-5 flex flex-col">
            <label htmlFor="nome" className={label}>Nome</label>
            <input
              id="nome"
              className={input}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>

          <div className="mb-5 flex flex-col">
            <label htmlFor="cognome" className={label}>Cognome</label>
            <input
              id="cognome"
              className={input}
              value={cognome}
              onChange={(e) => setCognome(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          <div className="mb-5 flex flex-col">
            <label htmlFor="email" className={label}>Email</label>
            <input
              id="email"
              type="email"
              className={input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-5 flex flex-col">
            <label htmlFor="password" className={label}>Password</label>
            <input
              id="password"
              type="password"
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <div className="mb-5 flex flex-col">
            <label htmlFor="confermaPassword" className={label}>Conferma password</label>
            <input
              id="confermaPassword"
              type="password"
              className={input}
              value={confermaPassword}
              onChange={(e) => setConfermaPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full cursor-pointer bg-vino py-3.5 text-sm font-light tracking-[0.18em] text-crema transition duration-300 hover:bg-vino-scuro disabled:cursor-not-allowed disabled:bg-muted"
            disabled={invio}
          >
            {invio ? 'Registrazione...' : 'Crea account'}
          </button>
        </form>

        <Link to="/login" state={location.state} className="mt-5 block text-center text-sm font-semibold text-testo transition hover:text-vino">
          Hai già un account? Accedi
        </Link>
      </div>
    </div>
  );
}
