/**
 * @swagger
 * /api/ordini/acquista:
 *   post:
 *     summary: Acquista uno o più biglietti (Richiede Login)
 *     tags: [Ordini]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantita
 *             properties:
 *               quantita:
 *                 type: number
 *                 example: 2
 *     responses:
 *       201:
 *         description: Acquisto completato con successo (Genera Ordine e Ticket)
 *       400:
 *         description: Quantità non valida o posti insufficienti
 *       403:
 *         description: Amministratore o operatore non autorizzati all'acquisto, oppure token scaduto
 */

/**
 * @swagger
 * /api/ordini/miei:
 *   get:
 *     summary: Elenco degli acquisti dell'utente loggato, con i codici dei ticket
 *     tags: [Ordini]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storico ordini e codici per i QR Code
 *       401:
 *         description: Token assente
 */