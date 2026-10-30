# Componenti React

Il frontend è in `frontend/src`. Il punto di ingresso è `main.jsx`: monta `App` dentro il div `root` e carica gli stili globali. `App` avvolge le pagine in quest'ordine: `UtenteProvider`, `EventoProvider`, router. I context stanno fuori dal router, così login e pagine condividono lo stesso stato; la barra sta dentro il router, perché usa la navigazione.

Le chiamate HTTP passano tutte da `services/api.js`, un'istanza Axios con base `http://localhost:5001/api` (oppure il valore di `VITE_API_URL`). Un interceptor, prima di ogni richiesta, legge `localStorage` e, se trova un token, imposta `Authorization`. Le pagine non costruiscono l'intestazione a mano.

## Context

`UtenteContext` espone `utente`, `accedi` ed `esci`.

All'avvio, se in `localStorage` ci sono `token` e `ruolo`, `utente` è l'oggetto `{ token, ruolo }`. Altrimenti è `null`. `accedi` scrive le due chiavi e aggiorna lo stato. `esci` le cancella. Nome, cognome ed email arrivano nella risposta di login e non vengono memorizzati: alla barra basta il ruolo.

`EventoContext` espone `evento`, `caricamento`, `errore` e `ricarica`. Al mount chiama `GET /api/evento`. `ricarica` ripete la stessa chiamata: il checkout la usa dopo un acquisto, così i posti rimasti in home sono aggiornati senza ricaricare il browser.

## Barra e route

`BarraNavigazione` è sempre visibile. Mostra «Evento» a tutti. Aggiunge «I miei acquisti» solo se il ruolo è `utente`, «Verifica biglietti» se è `operatore`, «Dashboard» se è `amministratore`. Senza sessione mostra «Accesso». Con sessione mostra «Esci», che chiama `esci()` e torna alla home.

| Percorso         | Controllo                          | Pagina          |
| ---------------- | ---------------------------------- | --------------- |
| `/`              | nessuna                            | `Evento`        |
| `/login`         | nessuna                            | `Login`         |
| `/registrazione` | nessuna                            | `Registrazione` |
| `/checkout`      | il controllo è interno alla pagina | `Checkout`      |
| `/acquisti`      | `SoloAutenticato`                  | `Acquisti`      |
| `/verifica`      | `SoloOperatore`                    | `Verifica`      |
| `/dashboard`     | `SoloAmministratore`               | `Dashboard`     |

`SoloAutenticato` manda al login chi non ha sessione, ricordando in `state.from` la pagina `/acquisti` così, dopo l'accesso, ci si torna. Se il ruolo è operatore o amministratore, reindirizza alla pagina di quel ruolo. `SoloOperatore` accetta solo l'operatore. `SoloAmministratore` accetta solo l'amministratore e, in caso contrario, torna alla home.

## Pagine

**Evento.** Legge titolo, data, luogo, posti e prezzo dal context. Non fa una richiesta propria. Il pulsante dipende dal ruolo: acquisto per il visitatore e per l'utente, verifica per l'operatore, dashboard per l'amministratore. Se i posti sono zero il pulsante di acquisto è disabilitato. Se il visitatore preme acquista, la pagina apre il login portandosi dietro la destinazione `/checkout`.

**Login.** Tiene email, password e messaggio di errore nello stato locale. Al submit chiama `POST /api/auth/login`, poi `accedi` con token e ruolo, e naviga verso la pagina prevista dal ruolo o verso `state.from`. Il link verso la registrazione inoltra quello stesso stato, così non si perde la destinazione.

**Registrazione.** Raccoglie nome, cognome, email, password e conferma. Se le password differiscono si ferma nel browser. Altrimenti chiama `POST /api/auth/registrazione` e, subito dopo, il login: non c'è una mail di attivazione. Poi entra con `accedi` e va alla destinazione salvata, oppure alla home.

**Checkout.** All'ingresso, se non c'è sessione manda al login; se il ruolo è operatore o amministratore manda alla relativa pagina. L'utente sceglie la quantità, compresa tra 1 e i posti disponibili, e vede il totale come anteprima. Alla conferma chiama `POST /api/ordini/acquista` con la sola quantità. In caso di successo mostra il riepilogo e chiede al context di ricaricare l'evento. Se il token manca o è scaduto, cancella la sessione e torna al login.

**Acquisti.** Al mount chiama `GET /api/ordini/miei`. Per ogni ordine mostra data, quantità, importo e, per ogni ticket, il codice e un'immagine QR costruita a partire da quel codice. Se la lista è vuota lo comunica. Se il token non è più valido, esce e torna al login.

**Verifica.** Invia `POST /api/operatore/verifica` con il codice digitato oppure letto dalla fotocamera. La lettura usa `BarcodeDetector` e la camera del browser: se il browser non la offre, resta l'inserimento manuale. La risposta 200 è mostrata come biglietto valido, con acquirente ed email. Le risposte 404 e 409 sono mostrate come esito negativo, non come errore di rete. Un 403 di ruolo riporta alla home senza cancellare la sessione.

**Dashboard.** Al mount chiama `GET /api/admin/dashboard` e mostra tre valori (biglietti venduti, posti rimasti, incasso) e la tabella degli acquirenti. Non modifica l'evento e non crea operatori: quelle operazioni restano sulle API descritte in [api.md](api.md).

Gli stili di ogni pagina stanno in un CSS Module accanto al componente (`Login.module.css`, `Evento.module.css`, e gli altri). I colori comuni sono in `styles/variables.css`, importato dagli stili globali.
