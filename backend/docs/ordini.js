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
 */