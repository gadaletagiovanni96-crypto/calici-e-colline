/**
 * @swagger
 * /api/evento:
 *   get:
 *     summary: Recupera i dettagli dell'evento (accesso libero)
 *     tags: [Evento]
 *     security: []
 *     responses:
 *       200:
 *         description: Dettagli evento recuperati
 *       404:
 *         description: Evento non ancora configurato
 *   put:
 *     summary: Crea o aggiorna l'evento (Solo Amministratore)
 *     tags: [Evento]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titolo:
 *                 type: string
 *               descrizione:
 *                 type: string
 *               dataOra:
 *                 type: string
 *                 format: date-time
 *               luogo:
 *                 type: string
 *               prezzo:
 *                 type: number
 *               ticketDisponibili:
 *                 type: number
 *               immaginePromozionale:
 *                 type: string
 *     responses:
 *       200:
 *         description: Evento aggiornato
 *       201:
 *         description: Evento creato
 *       403:
 *         description: Permessi insufficienti
 */