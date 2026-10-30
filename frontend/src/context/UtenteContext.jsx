import { createContext, useCallback, useState } from 'react';

export const UtenteContext = createContext(null);

// Il token resta in localStorage perché l'interceptor di axios non è un componente React
export function UtenteProvider({ children }) {
  const [utente, setUtente] = useState(() => {
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
    setUtente(null);
  }, []);

  return (
    <UtenteContext.Provider value={{ utente, accedi, esci }}>
      {children}
    </UtenteContext.Provider>
  );
}
