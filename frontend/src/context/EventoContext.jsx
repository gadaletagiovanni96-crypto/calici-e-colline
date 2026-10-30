import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const EventoContext = createContext(null);

export function EventoProvider({ children }) {
  const [evento, setEvento] = useState(null);
  const [caricamento, setCaricamento] = useState(true);
  const [errore, setErrore] = useState('');

  const ricarica = async () => {
    try {
      const response = await api.get('/evento');
      setEvento(response.data);
      setErrore('');
    } catch (err) {
      setErrore(err.response?.data?.errore || "Impossibile caricare l'evento.");
    } finally {
      setCaricamento(false);
    }
  };

  useEffect(() => {
    ricarica();
  }, []);

  return (
    <EventoContext.Provider value={{ evento, caricamento, errore, ricarica }}>
      {children}
    </EventoContext.Provider>
  );
}
