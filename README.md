# Calici e Colline

Applicazione web per la vendita e il controllo dei biglietti di un evento enogastronomico. Il sito presenta un solo evento: i visitatori consultano data, luogo e prezzo, gli utenti registrati acquistano i biglietti e ricevono un QR code, l’operatore li convalida all’ingresso e l’amministratore consulta le vendite.

Il frontend è una single page application in React. Il backend è un’API REST in Node.js. I dati sono salvati su MongoDB.

La documentazione di consegna (scenario, architettura, casi d’uso, modello dei dati, API e componenti React) è nella cartella [`documentazione`](documentazione/README.md). Le API si consultano anche in Swagger, su `http://localhost:5001/api-docs` a server avviato.

## Ruoli

| Ruolo | Cosa può fare |
| --- | --- |
| Visitatore | Vede la pagina dell’evento. Per acquistare deve accedere o registrarsi. |
| Utente | Compra uno o più biglietti e li rivede, con il relativo QR code, nella pagina dei propri acquisti. |
| Operatore | Verifica un biglietto inserendo il codice oppure scansionando il QR con la fotocamera. Non può acquistare. |
| Amministratore | Consulta biglietti venduti, posti rimasti, incasso e elenco degli acquirenti. Non può acquistare. |

Alla registrazione il ruolo assegnato è sempre `utente`. Gli account di operatore e amministratore vengono creati dallo script di inizializzazione del database.

## Tecnologie

**Frontend**

- React 18
- Vite
- React Router, per la navigazione tra le pagine
- Axios, per le chiamate all’API
- Tailwind CSS, per gli stili delle pagine

**Backend**

- Node.js ed Express
- MongoDB con Mongoose
- JSON Web Token, per riconoscere l’utente loggato
- bcrypt, per salvare le password in forma cifrata
- Nodemailer e qrcode, per la mail di conferma con i QR code allegati
- Swagger, per consultare le API da browser

## Come è organizzato

Il browser non accede mai al database. Ogni operazione passa dall’API.

```
React (Vite)  --HTTP-->  Express  --Mongoose-->  MongoDB
                              |
                              +--> mail di conferma (dopo un acquisto)
```

Le route protette controllano il token JWT e, dove serve, il ruolo. Il token viene salvato nel browser e allegato in automatico a ogni richiesta.

Sul frontend lo stato condiviso è gestito da due Context:

- `UtenteContext` conserva il token e il ruolo, e quindi sa se l’utente è entrato e quale barra di navigazione mostrare
- `EventoContext` carica i dati dell’evento all’avvio e li rende disponibili alle pagine

## Struttura

```
calici-e-colline/
├── backend/
│   ├── server.js            avvio del server e collegamento a MongoDB
│   ├── routes/              indirizzi delle API
│   ├── middlewares/         controllo del token e del ruolo
│   ├── controllers/         logica delle richieste
│   ├── models/              Utente, Evento, Ordine, Ticket
│   ├── utils/               invio email e configurazione di Swagger
│   └── scripts/seed.js      creazione degli account di sistema e dell’evento
└── frontend/
    └── src/
        ├── pages/           schermate dell’applicazione
        ├── context/         stato di utente ed evento
        └── services/api.js  client HTTP verso il backend
```

## Pagine

| Indirizzo | Contenuto |
| --- | --- |
| `/` | Scheda dell’evento e pulsante di acquisto |
| `/login` e `/registrazione` | Accesso e creazione dell’account |
| `/checkout` | Scelta della quantità e conferma dell’ordine |
| `/acquisti` | Storico ordini e QR code dell’utente |
| `/verifica` | Controllo biglietti, riservato all’operatore |
| `/dashboard` | Statistiche e acquirenti, riservata all’amministratore |

## API principali

Base: `http://localhost:5001/api`

| Metodo | Indirizzo | Accesso | Funzione |
| --- | --- | --- | --- |
| POST | `/auth/registrazione` | libero | Crea un utente |
| POST | `/auth/login` | libero | Restituisce il token JWT |
| GET | `/evento` | libero | Legge l’evento |
| PUT | `/evento` | amministratore | Aggiorna l’evento |
| POST | `/ordini/acquista` | utente | Acquista uno o più biglietti |
| GET | `/ordini/miei` | utente loggato | Elenca i propri ordini e i codici |
| POST | `/operatore/verifica` | operatore o amministratore | Convalida un biglietto |
| GET | `/admin/dashboard` | amministratore | Statistiche e lista acquirenti |
| POST | `/admin/operatori` | amministratore | Crea un account operatore |

La documentazione interattiva è disponibile su `http://localhost:5001/api-docs` a server avviato.

In fase di acquisto il backend scala i posti, crea l’ordine e genera un ticket per ogni biglietto dentro una transazione: se un passaggio fallisce, nessuna di queste scritture viene mantenuta. Ogni ticket ha un codice univoco. Alla prima verifica valida il biglietto viene segnato come utilizzato; una seconda scansione dello stesso codice viene rifiutata.

## Avvio

Servono Node.js e un’istanza di MongoDB.

Nella cartella `backend`, copiare `.envdibase` in un file chiamato `.env` e compilare almeno la stringa di connessione:

```
PORT=5001
MONGO_URI=<stringa di connessione MongoDB>
JWT_SECRET=<una chiave segreta>
SMTP_HOST=
SMTP_USER=
SMTP_PASS=
```

`SMTP_HOST`, `SMTP_USER` e `SMTP_PASS` servono solo per la mail di conferma. Se restano vuoti, l’acquisto funziona comunque e i QR code restano visibili nella pagina degli acquisti.

```bash
cd backend
npm install
node scripts/seed.js
npm run dev
```

Lo script `seed.js` va eseguito una volta: crea l’evento iniziale e gli account di operatore e amministratore. Il server resta in ascolto sulla porta indicata in `.env` (nel modello, la `5001`).

In un altro terminale:

```bash
cd frontend
npm install
npm run dev
```

L’interfaccia si apre sull’indirizzo indicato da Vite, di solito `http://localhost:5173`. Le chiamate vanno a `http://localhost:5001/api`.

## Account di prova

Creati da `node scripts/seed.js`:

| Ruolo | Email | Password |
| --- | --- | --- |
| Amministratore | `admin@caliciecolline.it` | `AdminPassword123!` |
| Operatore | `scanner@caliciecolline.it` | `Scanner123!` |

Un account utente si crea dalla pagina di registrazione. L’evento iniziale è «Calici e Colline 2026», a Molfetta, con prezzo di 15 € e 500 posti.
