import { createContext, useCallback, useState } from 'react';

export const UtenteContext = createContext(null);

// Il token resta in localStorage perché l'interceptor di axios non è un componente React
export function UtenteProvider({ children }) {
  //inizializza l'utente con i dati del localStorage
  const [utente, setUtente] = useState(() => { //questa arrow function viene eseguita solo una volta all'inizio
    const token = localStorage.getItem('token');
    const ruolo = localStorage.getItem('ruolo');
    const nome = localStorage.getItem('nome');
    return token ? { token, ruolo, nome } : null;
  });

  const accedi = useCallback((token, ruolo, nome) => {
    localStorage.setItem('token', token);
    localStorage.setItem('ruolo', ruolo);
    localStorage.setItem('nome', nome);
    setUtente({ token, ruolo, nome });
  }, []);

  const esci = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('ruolo');
    localStorage.removeItem('nome');
    setUtente(null);
  }, []);

  return (
    <UtenteContext.Provider value={{ utente, accedi, esci }}>
      {children}
    </UtenteContext.Provider>
  );
}
