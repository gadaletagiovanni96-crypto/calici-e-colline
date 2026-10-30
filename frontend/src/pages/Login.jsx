import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { UtenteContext } from '../context/UtenteContext';
import { NaturaMorta } from '../components/Illustrazione';

const label = 'mb-2 text-xs font-semibold tracking-[0.14em] text-muted uppercase';
const input =
  'border border-bordo bg-white px-4 py-3 font-sans transition outline-none focus:border-vino';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errore, setErrore] = useState('');
  
  const { accedi } = useContext(UtenteContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita il ricaricamento della pagina
    setErrore('');

    try {
      // Chiama la rotta backend che abbiamo creato in precedenza
      const response = await api.post('/auth/login', { email, password });
      
      accedi(response.data.token, response.data.utente.ruolo, response.data.utente.nome);

      const ruolo = response.data.utente.ruolo;
      // Operatore e amministratore non passano dal checkout
      let destinazione = location.state?.from || '/';
      if (ruolo === 'operatore') destinazione = '/verifica';
      else if (ruolo === 'amministratore' && (!location.state?.from || location.state.from === '/checkout')) {
        destinazione = '/dashboard';
      }
      navigate(destinazione);
    } catch (err) {
      // Mostra l'errore restituito dal backend (es. "Credenziali non valide")
      setErrore(err.response?.data?.errore || 'Errore di connessione al server.');
    }
  };

  return (
    <div className="anim-salita mx-auto grid max-w-5xl items-center gap-8 py-4 lg:grid-cols-2">
      <div className="flex justify-center">
        <NaturaMorta className="anim-fluttua h-56 w-auto sm:h-80" />
      </div>
      <div className="w-full bg-crema p-8 sm:p-10">
        <p className="mb-2 text-sm font-light tracking-[0.28em] text-vino">/ account</p>
        <h2 className="mb-8 text-4xl font-light tracking-wide text-testo">Accesso</h2>
        
        {errore && <div className="mb-5 rounded-2xl bg-red-50 px-3 py-3 text-center text-sm text-red-700">{errore}</div>}

        <form onSubmit={handleLogin}>
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
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full cursor-pointer bg-vino py-3.5 text-sm font-light tracking-[0.18em] text-crema transition duration-300 hover:bg-vino-scuro disabled:cursor-not-allowed disabled:bg-muted"
          >
            Accedi
          </button>
        </form>

        <Link to="/registrazione" state={location.state} className="mt-5 block text-center text-sm font-semibold text-testo transition hover:text-vino">
          Non hai un account? Registrati
        </Link>
      </div>
    </div>
  );
}
