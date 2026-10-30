# Calici e Colline — come funziona il progetto

Documento di riferimento sul codice. Ogni sezione corrisponde a file reali del repository.

---

## Indice

1. [Cos'è l'applicazione](#1-cosè-lapplicazione)
2. [Tecnologie](#2-tecnologie)
3. [Mappa delle cartelle](#3-mappa-delle-cartelle)
4. [Come si avvia](#4-come-si-avvia)
5. [Schema generale: chi parla con chi](#5-schema-generale-chi-parla-con-chi)
6. [I tre ruoli](#6-i-tre-ruoli)
7. [Database e modelli](#7-database-e-modelli)
8. [Backend: il server](#8-backend-il-server)
9. [Middleware di autenticazione](#9-middleware-di-autenticazione)
10. [Catalogo delle API](#10-catalogo-delle-api)
11. [Controller, uno per uno](#11-controller-uno-per-uno)
12. [Email e QR code](#12-email-e-qr-code)
13. [Swagger](#13-swagger)
14. [Seed degli account di sistema](#14-seed-degli-account-di-sistema)
15. [Frontend: avvio e struttura](#15-frontend-avvio-e-struttura)
16. [Il client HTTP (`api.js`)](#16-il-client-http-apijs)
17. [Context React](#17-context-react)
18. [Routing e pagine protette](#18-routing-e-pagine-protette)
19. [Pagine, una per una](#19-pagine-una-per-una)
20. [Flusso: click su Accedi](#20-flusso-click-su-accedi)
21. [Flusso: registrazione](#21-flusso-registrazione)
22. [Flusso: acquisto di un biglietto](#22-flusso-acquisto-di-un-biglietto)
23. [Flusso: i miei acquisti e i QR](#23-flusso-i-miei-acquisti-e-i-qr)
24. [Flusso: verifica di un biglietto](#24-flusso-verifica-di-un-biglietto)
25. [Flusso: dashboard amministratore](#25-flusso-dashboard-amministratore)
26. [Flusso: logout](#26-flusso-logout)
27. [Cosa esiste solo come API, senza schermata](#27-cosa-esiste-solo-come-api-senza-schermata)
28. [Dettagli che non si vedono a colpo d'occhio](#28-dettagli-che-non-si-vedono-a-colpo-docchio)

---

## 1. Cos'è l'applicazione

Calici e Colline è un sito per un singolo evento enogastronomico. Non c'è un elenco di eventi: nel database vive **un solo documento Evento**.

Le persone fanno tre cose diverse, a seconda del ruolo:

| Chi | Cosa fa nell'interfaccia |
| --- | --- |
| Visitatore non loggato | Vede la pagina dell'evento. Per comprare viene mandato al login. |
| Utente (`utente`) | Compra biglietti e rivede i QR nella pagina acquisti. |
| Operatore (`operatore`) | Scansiona o digita il codice di un biglietto all'ingresso. Non compra. |
| Amministratore (`amministratore`) | Vede vendite, incasso e lista acquirenti. Non compra. |

Il frontend è un'app React. Il backend è un'API REST in Node.js. I dati stanno su MongoDB. L'identità dell'utente loggato è un token JWT tenuto nel `localStorage` del browser.

---

## 2. Tecnologie

### Backend (`backend/package.json`)

| Pacchetto | A cosa serve nel progetto |
| --- | --- |
| `express` 5 | Server HTTP e router delle API. |
| `mongoose` | Collegamento a MongoDB e definizione degli schemi. |
| `jsonwebtoken` | Crea e verifica il token di sessione. |
| `bcrypt` | Hash della password nel modello `Utente` (hook `pre('save')`). |
| `bcryptjs` | Hash della password dentro `creaOperatore`. È una seconda libreria, usata solo lì. |
| `cors` | Consente al browser (origine diversa, es. Vite sulla 5173) di chiamare l'API. |
| `dotenv` | Legge le variabili da un file `.env` nella cartella `backend`. |
| `nodemailer` | Invia la mail di conferma acquisto via SMTP. |
| `qrcode` | Disegna il PNG del QR allegato alla mail. |
| `uuid` | Genera il codice univoco di ogni biglietto (`uuid` v4). |
| `swagger-jsdoc` + `swagger-ui-express` | Pagina di documentazione interattiva su `/api-docs`. |
| `nodemon` (dev) | Riavvia il server quando salvi un file. |
| `passport`, `passport-google-oauth20`, `passport-jwt` | Sono nelle dipendenze. **Nessun file del progetto li importa.** Il login è fatto a mano con JWT, senza Passport e senza Google. |

Il backend è CommonJS: `require` / `module.exports`, `"type": "commonjs"`.

### Frontend (`frontend/package.json`)

| Pacchetto | A cosa serve |
| --- | --- |
| `react` 18 + `react-dom` | Interfaccia. |
| `vite` + `@vitejs/plugin-react` | Dev server e build. |
| `react-router-dom` 7 | URL delle pagine (`/`, `/login`, `/checkout`, …). |
| `axios` | Chiamate HTTP verso il backend. |
| CSS Modules (`*.module.css`) | Stili legati a una pagina, senza un framework CSS. |
| ESLint | Controllo statico, non entra nel funzionamento dell'app. |

Il frontend è ESM: `import` / `export`, `"type": "module"`.

Non ci sono Redux, React Query, né un backend-for-frontend. Lo stato condiviso sono due Context.

---

## 3. Mappa delle cartelle

```
calici-e-colline/
├── DOCUMENTAZIONE.md          ← questo file
├── backend/
│   ├── server.js              ← avvio Express, CORS, mount delle route, MongoDB
│   ├── .envdibase             ← modello delle variabili (dotenv NON lo legge da solo)
│   ├── routes/                ← URL → middleware → controller
│   │   ├── authRoutes.js
│   │   ├── eventoRoutes.js
│   │   ├── ordineRoutes.js
│   │   ├── operatoreRoutes.js
│   │   └── adminRoutes.js
│   ├── middlewares/
│   │   └── authMiddleware.js  ← autenticaJWT, autorizzaRuoli
│   ├── controllers/           ← logica delle richieste
│   ├── models/                ← schemi Mongoose
│   ├── utils/
│   │   ├── email.js
│   │   └── swagger.js
│   ├── docs/                  ← commenti JSDoc letti da Swagger, non sono route
│   └── scripts/seed.js        ← crea admin, operatore ed evento iniziale
└── frontend/
    ├── index.html             ← <div id="root">
    ├── vite.config.js
    └── src/
        ├── main.jsx           ← monta React
        ├── App.jsx            ← provider, barra, route
        ├── services/api.js    ← istanza axios + interceptor del token
        ├── context/
        │   ├── UtenteContext.jsx
        │   └── EventoContext.jsx
        ├── pages/             ← una schermata per file, più il suo CSS module
        └── styles/            ← global.css e variables.css
```

---

## 4. Come si avvia

Servono due processi.

**Backend**, dalla cartella `backend`:

```bash
npm install
npm run dev      # nodemon server.js
# oppure
npm start        # node server.js
```

`server.js` chiama `require('dotenv').config()`. Quel metodo legge **`backend/.env`**, non `backend/.envdibase`. Il file presente nel repo si chiama `.envdibase` ed è un modello. Per far partire il server con quelle variabili va copiato (o rinominato) in `.env`.

Chiavi attese:

| Variabile | Uso |
| --- | --- |
| `PORT` | Porta HTTP. Nel modello vale `5001`. Se manca, `server.js` usa `5000`. |
| `MONGO_URI` | Stringa di connessione MongoDB. Se è vuota, `mongoose.connect` fallisce e il server non si mette in ascolto. |
| `JWT_SECRET` | Firma e verifica dei token. |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS` | Invio mail. Se mancano, l'acquisto resta valido e in console compare l'errore SMTP. |

**Frontend**, dalla cartella `frontend`:

```bash
npm install
npm run dev      # Vite, di solito http://localhost:5173
```

L'indirizzo dell'API è in `frontend/src/services/api.js`:

```js
baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api'
```

Se non esiste `frontend/.env` con `VITE_API_URL`, il browser chiama `http://localhost:5001/api`. Per questo il backend, nel modello, è sulla porta **5001** e non sulla 5000 di default di `server.js`. Le due porte devono coincidere.

Prova rapida che il backend è su: `GET http://localhost:5001/api/status` risponde `{ "message": "API Calici e Colline operative." }`.

Documentazione interattiva: `http://localhost:5001/api-docs`.

---

## 5. Schema generale: chi parla con chi

```
Browser (React, porta Vite)
    │
    │  axios  →  http://localhost:5001/api/...
    │  header Authorization: Bearer <token>   (se c'è in localStorage)
    ▼
Express
    │  express.json()     legge il body JSON
    │  cors()             risponde agli header CORS
    │  router della risorsa
    │  autenticaJWT       solo sulle route protette
    │  autorizzaRuoli     solo dove il ruolo conta
    ▼
Controller
    │
    ├── MongoDB (Mongoose)
    └── nodemailer + qrcode   (solo dopo un acquisto andato a buon fine)
```

Il frontend non parla mai con MongoDB. Ogni dato passa da un URL sotto `/api`.

Esempio concreto di URL completo:

- il codice chiama `api.post('/auth/login', …)`
- `baseURL` è `http://localhost:5001/api`
- la richiesta reale è `POST http://localhost:5001/api/auth/login`

---

## 6. I tre ruoli

Il campo `ruolo` sull'utente accetta solo tre stringhe (`backend/models/Utente.js`):

- `utente` — valore di default quando qualcuno si registra da solo
- `operatore`
- `amministratore`

Chi decide cosa puoi fare non è solo il frontend. Il backend ricontrolla.

| Azione | utente | operatore | amministratore | non loggato |
| --- | --- | --- | --- | --- |
| `GET /api/evento` | sì | sì | sì | sì |
| `PUT /api/evento` | no | no | sì | no |
| `POST /api/auth/registrazione` e `/login` | — | — | — | sì |
| `POST /api/ordini/acquista` | sì | no (403 nel controller) | no (403 nel controller) | no |
| `GET /api/ordini/miei` | sì, solo i propri | tecnicamente la route chiede solo il token; in pratica l'interfaccia non ce li manda | stesso | no |
| `POST /api/operatore/verifica` | no | sì | sì | no |
| `GET /api/admin/dashboard` | no | no | sì | no |
| `POST /api/admin/operatori` | no | no | sì | no |

L'interfaccia nasconde i pulsanti, ma la protezione vera è il middleware. Un utente che chiama a mano `GET /api/admin/dashboard` riceve 403.

---

## 7. Database e modelli

Quattro collection. Mongoose pluralizza il nome del model in inglese: `Utente` → `utentes`, `Evento` → `eventos`, `Ordine` → `ordines`, `Ticket` → `tickets`.

### Utente — `backend/models/Utente.js`

| Campo | Note |
| --- | --- |
| `nome`, `cognome` | Obbligatori. |
| `email` | Obbligatoria, unica, salvata in minuscolo e senza spazi ai bordi. |
| `passwordHash` | Obbligatoria. In chiaro non resta nel database, vedi sotto. |
| `ruolo` | `utente` se non specificato. |
| `dataCreazione` | `timestamps` con `createdAt` rinominato. `updatedAt` è disattivato. |

Prima di ogni `save`, se `passwordHash` è stato modificato, uno hook fa questo:

1. `bcrypt.genSalt(10)`
2. `bcrypt.hash(this.passwordHash, salt)` e sovrascrive il campo

Quindi in registrazione e nel seed si passa la password in chiaro dentro `passwordHash`: è il nome del campo, non il fatto che sia già un hash. Lo hook la cifra.

`utente.confrontaPassword(passwordInserita)` usa `bcrypt.compare`: confronta il testo digitato con l'hash, senza decifrare nulla (l'hash non si decifra).

### Evento — `backend/models/Evento.js`

Un solo documento per tutto il sito. Campi: `titolo`, `descrizione`, `dataOra`, `luogo`, `prezzo` (≥ 0), `ticketDisponibili` (≥ 0), `immaginePromozionale` (stringa, opzionale; nessuna pagina la mostra).

Non c'è una collection di eventi. `Evento.findOne()` è la query usata ovunque.

### Ordine — `backend/models/Ordine.js`

| Campo | Note |
| --- | --- |
| `utenteId` | ObjectId che punta a `Utente`. |
| `quantita` | Intero ≥ 1. |
| `importoTotale` | `prezzo * quantita` calcolato dal server, non dal browser. |
| `dataAcquisto` | `createdAt` rinominato. |

### Ticket — `backend/models/Ticket.js`

Un documento per ogni biglietto fisico, anche se un ordine ne contiene diversi.

| Campo | Note |
| --- | --- |
| `ordineId` | ObjectId verso `Ordine`. |
| `codice` | Stringa unica. Se non la passi, `uuid` v4 la genera da solo. Esempio di forma: `3f1c2a0e-7b44-4d1a-9c8e-1a2b3c4d5e6f`. |
| `utilizzato` | `false` alla creazione. Diventa `true` alla prima scansione valida. |
| `dataUtilizzo` | Vuota finché non viene convalidato. |

Il PNG del QR **non** è un campo del database. Si conserva solo la stringa `codice`. L'immagine si ricostruisce al volo: in mail con la libreria `qrcode`, in pagina acquisti con un servizio esterno.

Relazione:

```
Utente 1 ─── N Ordine 1 ─── N Ticket
Evento è unico e non ha una foreign key sull'ordine:
il prezzo e i posti si leggono dall'unico Evento al momento dell'acquisto.
```

---

## 8. Backend: il server

File: `backend/server.js`.

Ordine di esecuzione:

1. `dotenv` carica `.env`.
2. Si crea `app = express()`.
3. Middleware globali, su **ogni** richiesta:
   - `express.json()` — se il body è JSON, lo mette in `req.body`. Senza questo, `req.body.email` nel login sarebbe `undefined`.
   - `cors()` — senza opzioni, accetta qualsiasi origine. In sviluppo va bene perché Vite e l'API sono su porte diverse.
4. Si montano i router:
   - `/api/auth` → `authRoutes`
   - `/api/evento` → `eventoRoutes`
   - `/api/ordini` → `ordineRoutes`
   - `/api/operatore` → `operatoreRoutes`
   - `/api/admin` → `adminRoutes`
5. `inizializzaSwagger(app)` aggiunge `/api-docs`.
6. `GET /api/status` risponde che l'API è su.
7. `mongoose.connect(process.env.MONGO_URI)`. **Solo se la connessione riesce** parte `app.listen`. Se MongoDB non risponde, il processo resta vivo ma non apre la porta: in console c'è l'errore, il frontend riceve "connessione rifiutata".

Non c'è un middleware globale di gestione errori. Ogni controller ha il proprio `try/catch`.

---

## 9. Middleware di autenticazione

File: `backend/middlewares/authMiddleware.js`. Due funzioni.

### `autenticaJWT`

È il controllo "sei loggato?". Sulle route che lo includono, Express lo chiama **prima** del controller.

Passi, in ordine:

1. Legge `req.header('Authorization')`.
2. Se manca, o non inizia con `Bearer `, risponde **401** `{ errore: 'Accesso negato. Nessun token fornito.' }` e il controller non parte.
3. Prende la parte dopo lo spazio: `Authorization: Bearer eyJhbGci...` → token = `eyJhbGci...`.
4. `jwt.verify(token, process.env.JWT_SECRET)`. Se la firma non torna o sono passate più di 24 ore, `verify` lancia e il `catch` risponde **403** `{ errore: 'Token non valido o scaduto.' }`.
5. Con l'`id` che sta dentro il token fa `Utente.findById(decoded.id).select('-passwordHash')`. La password non viene mai attaccata alla request.
6. Se l'utente è stato cancellato dal database, **401** `Utente non trovato.`
7. Mette il documento in `req.user` e chiama `next()`.

Da quel momento il controller può usare `req.user._id`, `req.user.ruolo`, `req.user.email`, `req.user.nome`.

Il payload firmato al login contiene `id` e `ruolo`, ma il middleware **non si fida del ruolo scritto nel token** per le query successive: ricarica l'utente dal database. `autorizzaRuoli` legge `req.user.ruolo`, cioè il valore attuale su MongoDB.

### `autorizzaRuoli`

È una funzione che **restituisce** un middleware. Per questo nelle route si scrive `autorizzaRuoli('amministratore')` con le parentesi: quella chiamata torna la funzione `(req, res, next) => …`.

```js
router.put('/', autenticaJWT, autorizzaRuoli('amministratore'), aggiornaEvento);
```

Express esegue, in fila:

1. `autenticaJWT` — deve aver già messo `req.user`
2. il middleware del ruolo — `ruoliAmmessi.includes(req.user.ruolo)`
3. `aggiornaEvento`

Se il ruolo non è nella lista: **403** `{ errore: 'Permessi insufficienti per eseguire questa operazione.' }`.

`autorizzaRuoli('operatore', 'amministratore')` accetta entrambi: i parametri restanti diventano l'array `ruoliAmmessi`.

Va sempre **dopo** `autenticaJWT`. Se fosse prima, `req.user` non esisterebbe.

### Cosa fa il frontend con 401 e 403

Le pagine non trattano tutti i 403 allo stesso modo. Il middleware usa lo stesso status per due casi diversi, e il testo del messaggio li distingue:

| Risposta | Significato nel codice | Cosa fa la pagina |
| --- | --- | --- |
| 401, oppure `errore === 'Token non valido o scaduto.'` | Non c'è sessione, oppure il JWT non è più buono | `esci()` cancella localStorage e manda al login |
| 403 con "Permessi insufficienti…" | Sei loggato, ma il ruolo non basta | Dashboard e Verifica tornano alla home, **senza** cancellare il token |

---

## 10. Catalogo delle API

Base: `http://localhost:5001/api` (se `PORT=5001`).

Le route protette vogliono:

```
Authorization: Bearer <token>
Content-Type: application/json
```

### `GET /api/status`

Libera. Risposta 200:

```json
{ "message": "API Calici e Colline operative." }
```

### `POST /api/auth/registrazione`

Libera. Body:

```json
{
  "nome": "Giulia",
  "cognome": "Rossi",
  "email": "giulia@example.com",
  "password": "unaPassword"
}
```

- 201 `{ "messaggio": "Registrazione completata con successo." }`
- 400 `{ "errore": "Email già registrata." }`
- 500 se manca un campo obbligatorio dello schema (Mongoose rifiuta il save) o per un altro errore

Non restituisce il token. Il frontend, dopo il 201, chiama da solo il login.

Il ruolo non si può scegliere dal body: lo schema mette `utente`.

### `POST /api/auth/login`

Libera. Body:

```json
{ "email": "giulia@example.com", "password": "unaPassword" }
```

200:

```json
{
  "messaggio": "Login effettuato.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....",
  "utente": {
    "id": "6712ab...",
    "nome": "Giulia",
    "cognome": "Rossi",
    "email": "giulia@example.com",
    "ruolo": "utente"
  }
}
```

401 `{ "errore": "Credenziali non valide." }` sia se l'email non esiste sia se la password è sbagliata. Il messaggio è uguale di proposito, così non si scopre quali email sono registrate.

Il token scade dopo **24 ore** (`expiresIn: '24h'`). Dentro, una volta decodificato, ci sono `id`, `ruolo`, `iat`, `exp`.

### `GET /api/evento`

Libera. 200: il documento evento (titolo, descrizione, dataOra, luogo, prezzo, ticketDisponibili, …).

404 `{ "errore": "Evento non ancora configurato." }` se il seed non è mai stato eseguito.

### `PUT /api/evento`

`autenticaJWT` + `autorizzaRuoli('amministratore')`.

Body, tutti i campi opzionali in aggiornamento (se ne ometti uno, resta il valore già salvato, tranne quando il documento non esiste ancora):

```json
{
  "titolo": "Calici e Colline 2026",
  "descrizione": "Evento enogastronomico tra le colline.",
  "dataOra": "2026-09-15T18:00:00.000Z",
  "luogo": "Piazza Centrale, Molfetta",
  "prezzo": 18,
  "ticketDisponibili": 400,
  "immaginePromozionale": "https://esempio.it/locandina.jpg"
}
```

- Se un evento c'è già: 200 `{ messaggio, evento }`
- Se la collection è vuota: 201 e lo crea
- `prezzo` e `ticketDisponibili` usano `!== undefined`, così si può salvare `0`. Gli altri campi usano `||`, quindi una stringa vuota non cancella il valore precedente.

Nessuna pagina React chiama questa route. Si può provare da Swagger o con curl.

### `POST /api/ordini/acquista`

`autenticaJWT`. Body:

```json
{ "quantita": 2 }
```

L'id utente **non** va messo nel body. Il controller usa `req.user._id`, preso dal token. Un client non può comprare a nome di un altro.

201:

```json
{
  "messaggio": "Acquisto completato con successo!",
  "ordine": {
    "_id": "...",
    "utenteId": "...",
    "quantita": 2,
    "importoTotale": 30,
    "dataAcquisto": "2026-10-28T10:00:00.000Z"
  },
  "tickets": [
    { "_id": "...", "ordineId": "...", "codice": "uuid-1", "utilizzato": false },
    { "_id": "...", "ordineId": "...", "codice": "uuid-2", "utilizzato": false }
  ]
}
```

Errori tipici, tutti 400 con `{ "errore": "<messaggio>" }` tranne il 403:

- 403 `Solo gli utenti possono acquistare biglietti.` se il ruolo non è `utente`
- 400 `Quantità non valida.` se manca o è &lt; 1
- 400 `Posti insufficienti per la quantità richiesta.`
- 400 `Evento non trovato.`

### `GET /api/ordini/miei`

`autenticaJWT`. Nessun body. Filtra `Ordine.find({ utenteId: req.user._id })`, dal più recente.

200, array:

```json
[
  {
    "id": "...",
    "quantita": 2,
    "importoTotale": 30,
    "dataAcquisto": "2026-10-28T10:00:00.000Z",
    "tickets": [
      { "_id": "...", "codice": "uuid-1" },
      { "_id": "...", "codice": "uuid-2" }
    ]
  }
]
```

`select('codice')` non toglie `_id` (Mongoose lo include comunque). Non restituisce `utilizzato`.

### `POST /api/operatore/verifica`

`autenticaJWT` + `autorizzaRuoli('operatore', 'amministratore')`.

```json
{ "codice": "3f1c2a0e-7b44-4d1a-9c8e-1a2b3c4d5e6f" }
```

| Status | Quando | Corpo |
| --- | --- | --- |
| 200 | Prima volta che quel codice viene visto | `{ valido: true, messaggio, dettagli: { codice, acquirente, email, dataUtilizzo } }` e il ticket passa a `utilizzato: true` |
| 404 | Nessun ticket con quel codice | `{ valido: false, messaggio: "Biglietto NON TROVATO..." }` |
| 409 | Esiste ma `utilizzato` è già true | `{ valido: false, messaggio: "ATTENZIONE: Biglietto GIÀ SCANSIONATO!", dataScansione }` |
| 400 | Body senza `codice` | `{ errore: "Nessun codice fornito." }` |

Il 409 non è un'eccezione: è la risposta normale di un biglietto già usato. Il frontend la mostra come esito negativo, non come crash.

### `GET /api/admin/dashboard`

`autenticaJWT` + solo `amministratore`.

200:

```json
{
  "statistiche": {
    "bigliettiVenduti": 12,
    "bigliettiDisponibili": 488,
    "ricavoTotale": 180
  },
  "acquirenti": [
    {
      "idOrdine": "...",
      "nome": "Giulia",
      "cognome": "Rossi",
      "email": "giulia@example.com",
      "quantita": 2,
      "dataAcquisto": "2026-10-28T10:00:00.000Z"
    }
  ]
}
```

`bigliettiVenduti` è `Ticket.countDocuments()` (tutti i ticket, anche quelli già scansiti). `bigliettiDisponibili` è il campo rimasto sull'evento, non una sottrazione fatta al momento. `ricavoTotale` somma `importoTotale` di tutti gli ordini.

### `POST /api/admin/operatori`

`autenticaJWT` + solo `amministratore`. Body: `nome`, `cognome`, `email`, `password`, tutti obbligatori.

201 con l'operatore creato (`id`, `nome`, `email`, `ruolo: "operatore"`), senza password.

400 se manca un campo o se l'email esiste già.

Anche questa route non ha un form nel frontend.

---

## 11. Controller, uno per uno

### `authController.js`

`registraUtente`: `findOne({ email })`. Se c'è già, 400. Altrimenti `new Utente({ ..., passwordHash: password })` e `save()`. Lo hook bcrypt parte qui. Risposta senza token e senza l'utente creato.

`loginUtente`: cerca per email. Se non c'è, 401. Altrimenti `confrontaPassword`. Se è false, 401. Se è true, `jwt.sign({ id: utente._id, ruolo: utente.ruolo }, JWT_SECRET, { expiresIn: '24h' })` e risponde token + anagrafica.

### `eventoController.js`

`getEvento`: `findOne()`. 404 se `null`.

`aggiornaEvento`: `findOne()`. Se esiste, assegna i campi uno a uno e `save()`. Se non esiste, `new Evento({...}).save()` con 201. Non c'è cancellazione dell'evento.

### `ordineController.js` — l'acquisto è una transazione

`acquistaBiglietti` è l'unico punto che usa una **transazione MongoDB**. Serve perché due acquisti contemporanei non devono vendere gli stessi ultimi posti, e perché ordine e ticket devono comparire insieme: o tutti e due, o nessuno.

Sequenza dentro `session.startTransaction()`:

1. `Evento.findOne().session(session)` — la lettura entra nella transazione.
2. Se `ticketDisponibili < quantita`, `throw` → si va nel `catch`.
3. `evento.ticketDisponibili -= quantita` e `save({ session })`.
4. `importoTotale = evento.prezzo * quantita` (prezzo del database, non quello mostrato nel browser).
5. `Ordine.create([{ utenteId, quantita, importoTotale }], { session })`. Con una session, `create` vuole un **array** e restituisce un array. `[nuovoOrdine]` prende il primo elemento.
6. `Array.from({ length: quantita })` costruisce N oggetti `{ ordineId }`. `Ticket.insertMany(..., { session })`. Il `codice` uuid nasce dal default dello schema, una volta per documento.
7. `commitTransaction()` — solo adesso MongoDB rende visibili le scritture.
8. Dopo il commit, `inviaEmailConferma(...)` **senza `await`**. La risposta HTTP parte subito. La mail va in parallelo. Se l'SMTP fallisce, l'ordine non viene annullato: `email.js` ingoia l'errore e scrive in console.

Nel `catch`: `abortTransaction()` annulla decremento posti, ordine e ticket. Poi 400 con `error.message`.

`getMieiAcquisti`: ordini dell'utente, e per ciascuno `Ticket.find({ ordineId }).select('codice')`. Il ciclo è sequenziale (`for...of` con `await`), non una aggregation.

### `operatoreController.js`

`verificaTicket` fa `findOne({ codice })` e con `populate` risale al nome dell'acquirente:

```
Ticket.ordineId  →  documento Ordine
Ordine.utenteId  →  nome, cognome, email  (nient'altro, grazie a select)
```

Poi i tre rami: non trovato (404), già usato (409), valido (imposta `utilizzato` e `dataUtilizzo`, salva, 200). Non c'è transazione: è un singolo documento.

### `adminController.js`

`getDashboardData`: evento, conteggio ticket, ordini con `populate('utenteId', 'nome cognome email')` ordinati dal più recente. Se un ordine avesse un `utenteId` orfano, `ordine.utenteId.nome` lancerebbe e finirebbe nel 500. Con i dati creati da questa app non succede, perché l'utente non si può cancellare da nessuna route.

`creaOperatore`: controlla i campi, controlla l'email, poi:

```js
const salt = await bcrypt.genSalt(10);          // libreria bcryptjs
const passwordHash = await bcrypt.hash(password, salt);
await Utente.create({ ..., passwordHash, ruolo: 'operatore' });
```

`Utente.create` scatena anche lo hook `pre('save')` del modello, che usa l'altra libreria (`bcrypt`) e **cifra di nuovo** un valore che è già un hash. Al login, `confrontaPassword` confronta la password in chiaro con questo doppio hash e risponde 401.

Gli account creati dal seed e dalla registrazione non passano da questo doppio passaggio: passano la password in chiaro a `Utente.create` / `save` e lo hash lo fa solo lo hook. Quei login funzionano.

Per creare un operatore che riesca a entrare, la strada prevista dal codice che funziona è `scripts/seed.js`, non `POST /api/admin/operatori`.

---

## 12. Email e QR code

File: `backend/utils/email.js`. Chiamata solo da `acquistaBiglietti`, dopo il commit.

1. `nodemailer.createTransport` verso `SMTP_HOST` porta **587**, `secure: false` (la connessione parte in chiaro e poi fa STARTTLS).
2. Per ogni ticket, `QRCode.toBuffer(codice)` produce un PNG il cui contenuto è la stringa uuid, non un URL.
3. Il PNG è un allegato con un `cid` (`qr0`, `qr1`, …). L'HTML della mail usa `<img src="cid:qr0">`, quindi l'immagine è dentro il messaggio, non ospitata su un server.
4. In più, il testo della mail elenca i codici in chiaro.
5. `sendMail`. Qualunque errore viene solo loggato.

In parallelo, la pagina acquisti **non** usa quei PNG. Ricostruisce l'immagine con:

```
https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=<codice>
```

L'operatore, inquadrandolo, legge la stessa stringa uuid che sta nel database. `verificaTicket` cerca quella stringa, non decodifica un'immagine.

---

## 13. Swagger

`backend/utils/swagger.js` monta l'interfaccia su `/api-docs`.

I testi delle API non sono generati dalle route Express. Stanno nei commenti `@swagger` di `backend/docs/*.js` (`auth.js`, `evento.js`, `ordini.js`, `operatore.js`, `admin.js`). Quei file non vengono `require` dal server: li legge solo `swagger-jsdoc`.

La definizione OpenAPI dichiara uno schema `bearerAuth` (bottone Authorize) e lo applica come security globale. In Swagger UI anche le route pubbliche risultano "con lucchetto"; sul server, login e `GET /evento` non chiedono il token.

---

## 14. Seed degli account di sistema

File: `backend/scripts/seed.js`. Non è collegato a `npm start`. Si lancia a mano, con MongoDB raggiungibile e `.env` presente:

```bash
node scripts/seed.js
```

Cosa fa:

1. Cancella, se esistono, solo `admin@caliciecolline.it` e `scanner@caliciecolline.it`. Non tocca gli utenti registrati dal sito.
2. Ricrea l'amministratore: email `admin@caliciecolline.it`, password `AdminPassword123!`, ruolo `amministratore`.
3. Ricrea l'operatore: email `scanner@caliciecolline.it`, password `Scanner123!`, ruolo `operatore`.
4. Se non c'è nessun evento, ne crea uno: titolo "Calici e Colline 2026", 15 euro, 500 posti, 15 settembre 2026 ore 18:00 UTC, luogo "Piazza Centrale, Molfetta". Se l'evento c'è già, non lo sovrascrive.
5. `process.exit()`.

Le password passano in `passwordHash` in chiaro. Lo hook del modello le cifra una volta sola, quindi il login con queste credenziali funziona.

---

## 15. Frontend: avvio e struttura

`index.html` ha `<div id="root">` e carica `/src/main.jsx`.

`main.jsx`:

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

`StrictMode` in sviluppo monta i componenti due volte per evidenziare effetti collaterali. Per questo, a caldo, la richiesta `GET /evento` può comparire due volte in rete. Non è un secondo utente.

`App` è avvolto, dall'esterno verso l'interno:

```
UtenteProvider
  EventoProvider
    Router (BrowserRouter)
      BarraNavigazione
      <Routes>…</Routes>
```

L'ordine conta. `BarraNavigazione` chiama `useNavigate()`, quindi deve stare **dentro** `Router`. I context stanno fuori dal router così login e pagine li condividono.

Gli stili globali (`styles/global.css`) azzerano margin e importano le variabili colore. Le pagine usano CSS Modules (`import styles from './Login.module.css'`): la classe `container` di Login non collide con quella di Checkout, perché Vite le rinomina in build.

---

## 16. Il client HTTP (`api.js`)

Un solo `axios.create`. Tutte le pagine importano questo oggetto, non `axios` diretto.

Interceptor di **richiesta** (parte prima che il pacchetto esca):

```js
const token = localStorage.getItem('token');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

Conseguenze:

- Dopo il login, ogni `api.get` / `api.post` è già autenticato. Le pagine non aggiungono il header a mano.
- Anche login e registrazione, se un vecchio token è ancora in `localStorage`, lo mandano. Il backend di quelle due route lo ignora.
- Non c'è un interceptor di **risposta**. Il 401 non fa logout globale: ogni pagina decide nel proprio `catch`.

---

## 17. Context React

Un context è un valore che i componenti discendenti leggono con `useContext`, senza passarsi props di mano in mano.

### `UtenteContext` — `frontend/src/context/UtenteContext.jsx`

Valore esposto: `{ utente, accedi, esci }`.

All'avvio:

```js
const token = localStorage.getItem('token');
const ruolo = localStorage.getItem('ruolo');
return token ? { token, ruolo } : null;
```

La funzione dentro `useState` parte una volta sola. Se ricarichi la pagina, la sessione sopravvive perché sta in `localStorage`, non nella memoria di React.

`accedi(token, ruolo)` scrive le due chiavi e fa `setUtente({ token, ruolo })`.

`esci()` le cancella e mette `utente` a `null`.

Cosa **non** c'è nello stato: nome, cognome, email. La risposta del login li contiene (`response.data.utente`), ma `Login.jsx` passa a `accedi` solo token e ruolo. Dopo un refresh restano solo le due chiavi di `localStorage`. Nessuna pagina mostra "ciao Giulia": la barra guarda solo `utente.ruolo`.

`utente` è truthy se c'è un token. `utente?.ruolo === 'utente'` distingue il cliente dall'operatore e dall'amministratore.

### `EventoContext` — `frontend/src/context/EventoContext.jsx`

Valore: `{ evento, caricamento, errore, ricarica }`.

Al mount, `useEffect` chiama `ricarica()`:

```js
const response = await api.get('/evento');
setEvento(response.data);
```

È una richiesta pubblica. Parte anche se nessuno è loggato, perché la home deve mostrare titolo e prezzo.

`caricamento` nasce `true` e diventa `false` nel `finally`, anche se la GET fallisce. `errore` prende `err.response.data.errore` (per esempio "Evento non ancora configurato.") oppure una frase fissa se il server non risponde.

`ricarica` è richiamata dal checkout dopo un acquisto riuscito, così il contatore "posti rimasti" in home si aggiorna senza ricaricare il browser. Il context è sopra il router: restare sulla pagina checkout e poi tornare a `/` mostra già il numero nuovo.

---

## 18. Routing e pagine protette

Definite in `frontend/src/App.jsx`.

| URL | Chi la vede | Componente |
| --- | --- | --- |
| `/` | Tutti | `Evento` |
| `/login` | Tutti (anche se già loggati: non c'è un redirect automatico) | `Login` |
| `/registrazione` | Tutti | `Registrazione` |
| `/checkout` | Il controllo non è una route wrapper: sta dentro `Checkout` | `Checkout` |
| `/acquisti` | Solo ruolo `utente` | `SoloAutenticato` → `Acquisti` |
| `/verifica` | Solo `operatore` | `SoloOperatore` → `Verifica` |
| `/dashboard` | Solo `amministratore` | `SoloAmministratore` → `Dashboard` |

Questi wrapper non sono URL. Sono componenti che decidono se disegnare la pagina o un `<Navigate>`.

`SoloAutenticato` (`/acquisti`):

- niente `utente` → `/login` con `state={{ from: '/acquisti' }}`. Dopo il login si torna qui.
- ruolo `operatore` → `/verifica`
- ruolo `amministratore` → `/dashboard`
- altrimenti disegna `Acquisti`

`SoloOperatore`:

- niente utente → login con `from: '/verifica'`
- ruolo diverso da `operatore` → `/`
- altrimenti `Verifica`

`SoloAmministratore`:

- niente utente, oppure ruolo diverso → `/` (qui **non** si passa dal login)
- altrimenti `Dashboard`

`replace` sul `Navigate` sostituisce la voce nella cronologia, così il tasto indietro non riporta sulla pagina vietata.

### Barra di navigazione

Sempre visibile, sopra le pagine. Link in base al ruolo:

- tutti: "Evento" → `/`
- `utente`: "I miei acquisti"
- `operatore`: "Verifica biglietti"
- `amministratore`: "Dashboard"
- nessuno loggato: "Accesso" → `/login`
- qualcuno loggato: bottone "Esci" che chiama `esci()` e `navigate('/')`

---

## 19. Pagine, una per una

### `Evento.jsx` — `/`

Legge `evento`, `caricamento`, `errore` dal context. Non fa una GET propria.

- Ancora in caricamento e `evento` è null → "Caricamento evento..."
- Finito senza evento → messaggio di errore in rosso
- Altrimenti: titolo, descrizione, data formattata `it-IT`, luogo, posti, prezzo con `toFixed(2)`

Il bottone in basso cambia:

- operatore → "Verifica un biglietto" → `/verifica`
- amministratore → "Vai alla dashboard" → `/dashboard`
- altri, con posti &gt; 0 → "Acquista Biglietto" → `handleAcquisto`
- posti a 0 → bottone disabilitato "Esaurito"

`handleAcquisto`: se `utente` è null, `navigate('/login', { state: { from: '/checkout' } })`. Se c'è, `navigate('/checkout')`. Lo `state` non compare nell'URL: sta nella cronologia di React Router e la pagina di login lo legge con `useLocation()`.

### `Login.jsx` — `/login`

Stato locale: `email`, `password`, `errore`. Il submit è descritto per intero nella [sezione 20](#20-flusso-click-su-accedi).

Il link "Registrati" inoltra `location.state`, così anche chi arriva dal checkout e poi sceglie "non ho un account" non perde la destinazione `/checkout`.

### `Registrazione.jsx` — `/registrazione`

Campi: nome, cognome, email, password, conferma. Se le due password differiscono, si ferma nel browser e non chiama l'API. Dettaglio nella [sezione 21](#21-flusso-registrazione).

### `Checkout.jsx` — `/checkout`

Stato: `quantita` (parte da 1), `statoCaricamento` (`iniziale` | `invio` | `successo` | `errore`), `erroreMsg`, `ordine` (la risposta 201).

All'ingresso un `useEffect` guarda `sessioneIniziale`, un `useRef` fissato al valore di `utente` del primo render:

- era null → login con `from: '/checkout'`
- era operatore → `/verifica`
- era amministratore → `/dashboard`

Il ref, e non `utente` nelle dipendenze dell'effetto, serve a un caso preciso: se l'utente loggato clicca "Esci" nella barra, `utente` diventa null. Se l'effetto dipendesse da `utente`, questo cambio lo ributterebbe al login. Così com'è, l'effetto non si riesegue e il logout della barra fa solo `navigate('/')`.

Quantità valida: intero compreso tra 1 e `ticketDisponibili`. Il totale mostrato è `prezzo * quantita`, solo come anteprima. Il totale che conta è quello che torna nel JSON dell'ordine.

Submit: [sezione 22](#22-flusso-acquisto-di-un-biglietto).

Schermata di successo: quantità e importo presi da `ordine.ordine`, pulsante verso `/acquisti` e uno verso `/`.

### `Acquisti.jsx` — `/acquisti`

Al mount, `GET /ordini/miei`. Lista di card. Per ogni ticket, un `<img>` verso `api.qrserver.com` e il codice in un `<code>`. Lista vuota: "Non hai ancora acquistato biglietti." Dettaglio nella [sezione 23](#23-flusso-i-miei-acquisti-e-i-qr).

La route è già filtrata da `SoloAutenticato`, ma la pagina ricontrolla 401 e token scaduto perché il token può scadere mentre la pagina è aperta.

### `Verifica.jsx` — `/verifica`

Due modi per ottenere il codice:

1. Input di testo + "Controlla biglietto".
2. "Scansiona con la fotocamera". Se `window.BarcodeDetector` non esiste (non tutti i browser ce l'hanno), mostra un errore e lascia l'inserimento a mano. Altrimenti `getUserMedia({ video: { facingMode: 'environment' } })` apre la camera posteriore, e ogni 500 ms `BarcodeDetector.detect(video)` cerca un QR. Al primo trovato ferma l'intervallo, scrive il codice nello stato e chiama la stessa `verificaCodice`.

Pulizia: il cleanup dell'effetto ferma le tracce video, così la camera si spegne uscendo dalla pagina o chiudendo il riquadro.

Esito verde se `esito.valido`, rosso altrimenti. In caso di successo mostra acquirente ed email. Se 409, mostra anche la data della scansione precedente. Dettaglio nella [sezione 24](#24-flusso-verifica-di-un-biglietto).

### `Dashboard.jsx` — `/dashboard`

Al mount, `GET /admin/dashboard`. Tre numeri (venduti, disponibili, ricavo) e una tabella di acquirenti. Non c'è form per modificare l'evento né per creare operatori: quelle API restano fuori dall'interfaccia. Dettaglio nella [sezione 25](#25-flusso-dashboard-amministratore).

---

## 20. Flusso: click su Accedi

Situazione di partenza: l'utente è sulla home, non è loggato, ha cliccato "Acquista Biglietto". `Evento.jsx` ha fatto:

```js
navigate('/login', { state: { from: '/checkout' } })
```

Poi compila email e password e preme **Accedi**. Il bottone è `type="submit"` dentro un `<form onSubmit={handleLogin}>`.

1. Il browser sta per ricaricare la pagina (comportamento nativo del form). `e.preventDefault()` lo impedisce: React resta montato, lo stato non si perde.
2. `setErrore('')` pulisce un eventuale messaggio precedente.
3. `api.post('/auth/login', { email, password })`.
4. L'interceptor di axios guarda `localStorage`. Non c'è token, quindi nessun header `Authorization`.
5. Parte `POST http://localhost:5001/api/auth/login` con body JSON. `express.json()` lo mette in `req.body`.
6. La route è `router.post('/login', loginUtente)`. Nessun middleware.
7. `loginUtente` cerca l'utente per email.
   - Non c'è, oppure `confrontaPassword` è false → 401. Axios lancia. Il `catch` di `handleLogin` legge `err.response.data.errore` e lo mostra nel riquadro rosso. Si resta su `/login`.
   - Password giusta → 200 con `token` e `utente`.
8. `accedi(response.data.token, response.data.utente.ruolo)`:
   - `localStorage.token = token`
   - `localStorage.ruolo = ruolo`
   - `setUtente({ token, ruolo })`
   - React ridisegna la barra: sparisce "Accesso", compare "Esci" e, se il ruolo è `utente`, il link "I miei acquisti".
9. Scelta della pagina successiva, in `Login.jsx`:
   - si parte da `location.state?.from`. Nell'esempio è `'/checkout'`. Se si era aperto il login dal link "Accesso", `state` è vuoto e la destinazione è `'/'`.
   - se il ruolo è `operatore`, la destinazione diventa sempre `/verifica`, anche se `from` diceva altro.
   - se il ruolo è `amministratore` e `from` manca oppure è `/checkout`, si va a `/dashboard`. Un amministratore che era stato mandato al login dalla pagina acquisti (`from: '/acquisti'`) segue quel `from`, e lì `SoloAutenticato` lo rimanda alla dashboard.
10. `navigate(destinazione)`. Da questo momento ogni axios avrà `Authorization: Bearer …`.

Il token non è una sessione sul server. Il server non tiene una lista di login. Alla richiesta successiva ricalcola la firma e rilegge l'utente.

---

## 21. Flusso: registrazione

Submit del form in `Registrazione.jsx`.

1. `preventDefault`.
2. Se `password !== confermaPassword`, errore locale e `return`. Il backend non ha un campo "conferma".
3. `setInvio(true)` disabilita il bottone e cambia l'etichetta in "Registrazione...".
4. `POST /api/auth/registrazione` con nome, cognome, email, password.
5. `registraUtente` rifiuta l'email duplicata con 400. Altrimenti salva. Lo hook bcrypt sostituisce la password. Ruolo `utente`. Risposta 201 senza token.
6. Subito dopo, la stessa funzione fa `POST /api/auth/login` con email e password appena scelte. Non c'è una mail di conferma account.
7. `accedi(token, ruolo)` come nel login.
8. `navigate(location.state?.from || '/')`. Se si era arrivati da "Acquista" → login → "Registrati", `state.from` è ancora `/checkout`, perché il link copia `location.state`.
9. `finally` rimette `invio` a false. Se la navigazione è già avvenuta, il componente si smonta e questo setState non si vede.

Se il 201 della registrazione riesce e il login successivo fallisce (caso raro), il `catch` mostra l'errore. L'account però esiste già: al tentativo seguente la registrazione risponderà "Email già registrata" e bisogna usare il login.

---

## 22. Flusso: acquisto di un biglietto

Utente con ruolo `utente`, già su `/checkout`, quantità 2, posti sufficienti, prezzo evento 15. Preme **Conferma Ordine**.

1. `preventDefault`.
2. Controllo locale: 2 è un intero fra 1 e i posti. Se no, stato `errore` e non parte nessuna richiesta.
3. Stato `invio`: il bottone mostra "Elaborazione..." ed è disabilitato.
4. `api.post('/ordini/acquista', { quantita: 2 })`.
5. L'interceptor aggiunge `Authorization: Bearer <token>`.
6. Express: `express.json` → router ordini → `autenticaJWT`:
   - verifica la firma
   - `Utente.findById`, senza password
   - `req.user = utente`
   - `next()`
7. Non c'è `autorizzaRuoli` su questa route. Il divieto per operatore e amministratore è la prima riga del controller: `if (req.user.ruolo !== 'utente') return 403`.
8. Transazione:
   - posti 500 → 498, salvato nella session
   - ordine con `importoTotale = 30`, `utenteId` del token
   - due ticket con due uuid diversi, `utilizzato: false`
   - commit
9. Parte l'invio mail (non atteso).
10. 201 con ordine e tickets.
11. Nel browser: `setOrdine(response.data)`, stato `successo`, `ricarica()` rifà `GET /evento`. Il context ora ha `ticketDisponibili: 498`. La schermata di checkout non mostra più il form: mostra il riepilogo e "Vedi i biglietti".
12. "Vedi i biglietti" va a `/acquisti`.

Se nel frattempo un altro acquisto ha preso gli ultimi posti, il `throw` nel controller fa `abortTransaction` e 400 "Posti insufficienti…". Il `catch` del checkout mette quel testo in rosso. I posti non risultano scalati.

Se il token è scaduto, il middleware risponde 403 con `Token non valido o scaduto.`. Il checkout riconosce quella frase, chiama `esci()` e manda al login con `from: '/checkout'`.

---

## 23. Flusso: i miei acquisti e i QR

Apertura di `/acquisti`.

1. `SoloAutenticato` legge il context. C'è un utente con ruolo `utente`, quindi monta `Acquisti`. Se si incolla l'URL senza token, il wrapper reindirizza al login prima ancora della GET.
2. `useEffect` chiama `api.get('/ordini/miei')` con il Bearer.
3. `autenticaJWT` poi `getMieiAcquisti`. La query è `{ utenteId: req.user._id }`. Un altro utente, anche con un token valido, non vede questi ordini: l'id arriva dal token, non da un parametro nell'URL.
4. Risposta: array di ordini, ciascuno con i soli `codice` dei ticket.
5. Per il codice `3f1c2a0e-…` il browser chiede l'immagine a `api.qrserver.com`. Quel servizio non è il backend del progetto: riceve la stringa e restituisce un PNG. Il backend non viene coinvolto nel disegno del QR in pagina.
6. Sotto l'immagine c'è il codice in chiaro, lo stesso che l'operatore può digitare se la camera non funziona.

---

## 24. Flusso: verifica di un biglietto

Operatore loggato (`scanner@caliciecolline.it`). È su `/verifica`. Inquadra il QR, oppure incolla il codice.

1. `verificaCodice` fa il `trim`. Stringa vuota → errore locale.
2. `POST /api/operatore/verifica` con `{ codice }`.
3. `autenticaJWT` poi `autorizzaRuoli('operatore', 'amministratore')`. Un utente normale riceve 403 "Permessi insufficienti…". In quel caso `Verifica.jsx` fa `navigate('/')` e **non** chiama `esci()`: il login dell'utente resta valido, semplicemente non è la sua pagina.
4. Il controller cerca il codice.

Prima scansione di un biglietto vero:

- `utilizzato` era false
- viene messo a true, `dataUtilizzo = adesso`, `save()`
- 200 `{ valido: true, dettagli: { acquirente: "Giulia Rossi", email, ... } }`
- la pagina chiude la camera e mostra il riquadro verde con nome ed email

Seconda scansione dello stesso codice:

- 409, `valido: false`, `dataScansione` compilata
- Axios tratta 409 come errore, quindi si entra nel `catch`
- lo `status === 409` è gestito come esito, non come guasto: `setEsito(data)` e riquadro rosso "GIÀ SCANSIONATO" più la data

Codice inventato:

- 404, stesso trattamento del 409, messaggio "NON TROVATO"

Il biglietto non torna mai a `utilizzato: false`. Non esiste una route di annullo scansione.

---

## 25. Flusso: dashboard amministratore

Login con `admin@caliciecolline.it`. `Login.jsx` manda a `/dashboard` (perché il ruolo è amministratore e `from` non è un'altra pagina riservata).

1. `SoloAmministratore` controlla `utente.ruolo === 'amministratore'` e monta `Dashboard`.
2. `useEffect` → `GET /api/admin/dashboard` con Bearer.
3. Middleware: token valido, ruolo amministratore, `next()`.
4. Il controller conta i ticket, legge i posti rimasti, somma gli importi, e per ogni ordine sostituisce `utenteId` con nome, cognome, email (`populate`).
5. La pagina disegna tre card e la tabella. Data mostrata con `toLocaleDateString('it-IT')` (solo la data, senza l'ora; in checkout e acquisti l'ora c'è).

Se un utente normale forza l'URL `/dashboard`, `SoloAmministratore` lo manda a `/` senza chiamare l'API. Se chiama l'API lo stesso, il middleware risponde 403.

---

## 26. Flusso: logout

Click su **Esci** nella barra (`App.jsx`, `handleLogout`).

1. `esci()` cancella `token` e `ruolo` da `localStorage` e mette `utente` a null.
2. `navigate('/')`.
3. La barra si ridisegna: torna il link "Accesso", spariscono acquisti / verifica / dashboard.
4. Le richieste successive non hanno più l'header Authorization.
5. Il server non viene informato. Non c'è `POST /logout`. Un token copiato prima del logout resta valido fino alla scadenza delle 24 ore, perché la firma è ancora corretta e l'utente esiste ancora. Il logout è solo locale al browser.

---

## 27. Cosa esiste solo come API, senza schermata

| Pezzo | Dove sta | Manca nel frontend |
| --- | --- | --- |
| Aggiornare titolo, prezzo, posti, data, luogo | `PUT /api/evento` | Nessun form. I posti scendono solo quando qualcuno compra. Per alzarli o cambiare il prezzo serve Swagger, curl, o un client esterno, con il token dell'amministratore. |
| Creare un operatore | `POST /api/admin/operatori` | Nessun form in dashboard. E il doppio hash descritto sopra farebbe fallire il login di un operatore creato da questa route. Il seed è la strada usata dal codice per gli account di sistema. |
| `immaginePromozionale` | Campo dell'evento | Nessun `<img>` lo usa. |
| Passport / login Google | `package.json` | Nessun `require('passport')`. |

Esempio di aggiornamento evento, dopo aver fatto login come amministratore e aver copiato il token:

```bash
curl -X PUT http://localhost:5001/api/evento \
  -H "Authorization: Bearer IL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prezzo": 18, "ticketDisponibili": 400}'
```

Il frontend, alla prossima `ricarica()` (refresh della home, o un acquisto), leggerà i valori nuovi. Il context non si aggiorna da solo se nessun componente chiama `ricarica` e non si ricarica la pagina: la GET parte al mount del provider, cioè all'apertura dell'app.

---

## 28. Dettagli che non si vedono a colpo d'occhio

**Il context utente è più povero della risposta di login.** Nome e email tornano dal backend e vengono ignorati. In `localStorage` ci sono solo `token` e `ruolo`.

**Due 403 diversi.** Token scaduto e "non sei amministratore" usano entrambi lo status 403. Le pagine li separano confrontando la stringa `errore` con `'Token non valido o scaduto.'`. Se quel testo nel middleware cambiasse, i `catch` non farebbero più logout.

**La mail non è parte della transazione.** L'ordine è già committed quando parte SMTP. Un acquisto può riuscire in pagina e non arrivare in posta. I QR restano su `/acquisti` comunque, perché nascono dal codice nel database.

**Il commento in `Checkout.jsx` dice che i QR non stanno nella mail.** Il codice di `email.js` invece li allega. Vale il codice di `email.js`: la mail contiene i PNG, e la pagina acquisti li ridisegna per conto suo.

**`GET /api/ordini/miei` non filtra il ruolo.** Filtra l'id. Un operatore che chiamasse l'URL a mano riceverebbe i propri ordini (di solito nessuno, perché non può comprare). L'interfaccia non gli mostra il link.

**Un solo evento.** Non c'è `eventoId` sull'ordine. Cambiare prezzo con la PUT non riscrive gli `importoTotale` già salvati: quelli sono stati copiati al momento dell'acquisto.

**Concorrenza sui posti.** Il commento nel controller parla di transazione per due acquisti nello stesso istante. Perché l'isolamento tenga davvero su MongoDB serve un replica set (o un'istanza che supporti le transazioni). Senza, `startSession` / `startTransaction` può fallire e l'acquisto risponde 400 con il messaggio di MongoDB.

**Porte.** Frontend di default → `5001`. `server.js` se `PORT` manca → `5000`. Il modello variabili (`.envdibase`) dice `5001`, ma dotenv legge `.env`.

**StrictMode** può duplicare la GET dell'evento in sviluppo.

**BarcodeDetector** è un'API del browser, non una libreria del progetto. Su un browser che non ce l'ha, la verifica resta manuale.

**Swagger e route possono divergere.** La fonte eseguita è `routes/` + `controllers/`. I file in `backend/docs/` descrivono le API per la UI di Swagger e non influenzano le risposte.
