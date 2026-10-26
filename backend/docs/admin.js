/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Recupera le statistiche di vendita e la lista degli acquirenti (Solo Amministratore)
 *     tags: [Amministratore]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dati della dashboard recuperati con successo
 *       403:
 *         description: Permessi insufficienti
 *       404:
 *         description: Evento non ancora configurato
 *
 * /api/admin/operatori:
 *   post:
 *     summary: Crea un nuovo account Operatore (Solo Amministratore)
 *     tags: [Amministratore]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - cognome
 *               - email
 *               - password
 *             properties:
 *               nome:
 *                 type: string
 *               cognome:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Operatore creato con successo
 *       400:
 *         description: Dati mancanti o email già in uso nel sistema
 *       403:
 *         description: Permessi insufficienti
 */