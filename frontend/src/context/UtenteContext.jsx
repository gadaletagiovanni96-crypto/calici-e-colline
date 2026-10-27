import { createContext, useCallback, useState } from 'react';

export const UtenteContext = createContext(null);

// Il token resta in localStorage perché l'interceptor di axios non è un componente React
export function UtenteProvider({ children }) {
  const [utente, setUtente] = useState(() => {
    const token = localStorage.getItem('token');
    const ruolo = localStorage.getItem('ruolo');
    return token ? { token, ruolo } : null;
  });

  const accedi = useCallback((token, ruolo) => {
    localStorage.setItem('token', token);
    localStorage.setItem('ruolo', ruolo);
    setUtente({ token, ruolo });
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
