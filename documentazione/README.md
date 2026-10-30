# Documentazione di progetto — Calici e Colline

Documentazione dello scenario applicativo e dell'architettura, predisposta per la consegna del corso di Fondamenti del Web.

| Documento | Contenuto |
| --- | --- |
| [Scenario e architettura](scenario-e-architettura.md) | Dominio, attori, organizzazione del sistema |
| [Casi d'uso](casi-duso.md) | Diagramma UML dei casi d'uso, specifiche e diagrammi di sequenza |
| [Modello dei dati](modello-dati.md) | Collection MongoDB, attributi, vincoli e relazioni |
| [API](api.md) | Elenco delle API REST. La stessa descrizione è pubblicata in Swagger |
| [Componenti React](componenti-react.md) | Pagine, context, route protette e client HTTP |

I diagrammi sono file SVG nella cartella `diagrammi/`. Si aprono nel browser con un doppio click.

## Credenziali di prova

Vengono create con `node scripts/seed.js` nella cartella `backend`, dopo aver configurato il file `.env`.

| Ruolo | Email | Password |
| --- | --- | --- |
| Amministratore | `admin@caliciecolline.it` | `AdminPassword123!` |
| Operatore | `scanner@caliciecolline.it` | `Scanner123!` |

L'account con ruolo utente si crea dalla pagina di registrazione. Lo script inserisce anche l'evento iniziale, se non ne esiste già uno: «Calici e Colline 2026», Molfetta, 15 €, 500 posti.

## Swagger

Con il backend avviato, le API si provano da `http://localhost:5001/api-docs`. Il pulsante Authorize accetta il token restituito dal login, nel formato `Bearer <token>`: in Swagger UI si incolla solo il token.
