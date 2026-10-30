# API

Base URL in sviluppo: `http://localhost:5001/api`.

Le stesse operazioni sono descritte in OpenAPI e si provano dall'interfaccia Swagger, all'indirizzo `http://localhost:5001/api-docs`. I commenti che Swagger legge stanno in `backend/docs/` (`auth.js`, `evento.js`, `ordini.js`, `operatore.js`, `admin.js`). Le route eseguite dal server stanno invece in `backend/routes/`.

## Convenzioni

Le richieste con un corpo usano `Content-Type: application/json`.

Le route protette richiedono:

```
Authorization: Bearer <token>
```

Il token è quello restituito da `POST /api/auth/login`. Scade dopo 24 ore.

| Situazione | Status | Corpo |
| --- | --- | --- |
| Token assente o senza il prefisso `Bearer` | 401 | `{ "errore": "Accesso negato. Nessun token fornito." }` |
| Token con firma errata o scaduto | 403 | `{ "errore": "Token non valido o scaduto." }` |
| Utente del token non più presente | 401 | `{ "errore": "Utente non trovato." }` |
| Ruolo non ammesso da quella route | 403 | `{ "errore": "Permessi insufficienti per eseguire questa operazione." }` |

Il middleware ricarica l'utente dal database. Il ruolo usato per l'autorizzazione è quello attuale della collection, non soltanto quello scritto nel token al momento del login.

## Riepilogo

| Metodo | Percorso | Chi può chiamarla | Effetto |
| --- | --- | --- | --- |
| GET | `/api/status` | chiunque | Verifica che il server risponda. |
| POST | `/api/auth/registrazione` | chiunque | Crea un utente con ruolo `utente`. |
| POST | `/api/auth/login` | chiunque | Restituisce il JWT e i dati dell'utente. |
| GET | `/api/evento` | chiunque | Legge l'unico evento. |
| PUT | `/api/evento` | amministratore | Crea o aggiorna l'evento. |
| POST | `/api/ordini/acquista` | utente autenticato | Acquista uno o più biglietti. |
| GET | `/api/ordini/miei` | utente autenticato | Elenca i propri ordini e i codici. |
| POST | `/api/operatore/verifica` | operatore o amministratore | Convalida un biglietto. |
| GET | `/api/admin/dashboard` | amministratore | Statistiche e acquirenti. |
| POST | `/api/admin/operatori` | amministratore | Crea un account operatore. |

## Autenticazione

### `POST /api/auth/registrazione`

Accesso libero. Corpo: `nome`, `cognome`, `email`, `password`.

Risposte: 201 con un messaggio di conferma; 400 se l'email esiste già. Non restituisce il token. Il client, dopo il 201, chiama il login. Il ruolo non si sceglie dal corpo della richiesta.

### `POST /api/auth/login`

Accesso libero. Corpo: `email`, `password`.

Risposta 200:

```json
{
  "messaggio": "Login effettuato.",
  "token": "<jwt>",
  "utente": {
    "id": "<ObjectId>",
    "nome": "Giulia",
    "cognome": "Rossi",
    "email": "giulia@example.com",
    "ruolo": "utente"
  }
}
```

Risposta 401 se l'email non esiste oppure se la password non coincide. Il messaggio è lo stesso nei due casi.

## Evento

### `GET /api/evento`

Accesso libero. Risposta 200: il documento evento. Risposta 404 se non è stato ancora creato.

### `PUT /api/evento`

Solo amministratore. Corpo, con i campi da modificare: `titolo`, `descrizione`, `dataOra`, `luogo`, `prezzo`, `ticketDisponibili`, `immaginePromozionale`.

Se un evento esiste, la risposta è 200 e i campi omessi restano invariati. `prezzo` e `ticketDisponibili` possono essere aggiornati a zero. Se non esiste alcun evento, la risposta è 201 e il documento viene creato.

## Ordini

### `POST /api/ordini/acquista`

Richiede il token. Il controller accetta solo il ruolo `utente`. Corpo:

```json
{ "quantita": 2 }
```

L'identità dell'acquirente è `req.user`, ricavato dal token. Non si può indicare un altro utente nel corpo.

Risposta 201: messaggio, ordine (`quantita`, `importoTotale`, `dataAcquisto`) e array dei ticket, ciascuno con `codice` e `utilizzato: false`.

Errori: 403 se il ruolo non è `utente`; 400 se la quantità non è valida, se i posti non bastano o se l'evento non esiste. In caso di errore la transazione viene annullata.

### `GET /api/ordini/miei`

Richiede il token. Non ha corpo né parametri: l'utente è quello del token, quindi un client non può chiedere gli ordini di un altro.

Risposta 200: array di ordini, dal più recente, ognuno con `id`, `quantita`, `importoTotale`, `dataAcquisto` e `tickets` (per ogni ticket, `_id` e `codice`).

## Operatore

### `POST /api/operatore/verifica`

Operatore o amministratore. Corpo:

```json
{ "codice": "3f1c2a0e-7b44-4d1a-9c8e-1a2b3c4d5e6f" }
```

| Status | Quando | Contenuto rilevante |
| --- | --- | --- |
| 200 | Prima convalida | `valido: true`, nome e email dell'acquirente, orario |
| 404 | Nessun ticket con quel codice | `valido: false` |
| 409 | Ticket già convalidato | `valido: false` e `dataScansione` |
| 400 | Corpo senza codice | messaggio di errore |

Il 409 è la risposta prevista per un biglietto già usato, non un guasto del server. Non esiste un'operazione per annullare una convalida.

## Amministrazione

### `GET /api/admin/dashboard`

Solo amministratore. Risposta 200:

```json
{
  "statistiche": {
    "bigliettiVenduti": 12,
    "bigliettiDisponibili": 488,
    "ricavoTotale": 180
  },
  "acquirenti": [
    {
      "idOrdine": "<ObjectId>",
      "nome": "Giulia",
      "cognome": "Rossi",
      "email": "giulia@example.com",
      "quantita": 2,
      "dataAcquisto": "2026-10-28T10:00:00.000Z"
    }
  ]
}
```

`bigliettiVenduti` conta tutti i ticket, anche quelli già convalidati. `bigliettiDisponibili` è il valore rimasto sull'evento. `ricavoTotale` è la somma di `importoTotale` degli ordini. Risposta 404 se l'evento non esiste.

### `POST /api/admin/operatori`

Solo amministratore. Corpo: `nome`, `cognome`, `email`, `password`, tutti obbligatori.

Risposta 201 con id, nome, email e ruolo del nuovo operatore, senza la password. Risposta 400 se manca un campo o se l'email è già in uso.

## Prova di una route protetta

Dopo il login si copia il token e lo si incolla in Authorize, su Swagger. In alternativa, con curl:

```bash
curl http://localhost:5001/api/admin/dashboard \
  -H "Authorization: Bearer IL_TOKEN"
```
