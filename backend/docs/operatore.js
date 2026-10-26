/**
 * @swagger
 * /api/operatore/verifica:
 *   post:
 *     summary: Verifica e convalida un biglietto tramite QR Code (Solo Operatore/Admin)
 *     tags: [Operatore]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codice
 *             properties:
 *               codice:
 *                 type: string
 *                 description: Il codice univoco letto dal QR Code
 *     responses:
 *       200:
 *         description: Biglietto valido e convalidato con successo
 *       404:
 *         description: Biglietto non trovato (Falso)
 *       409:
 *         description: Biglietto già scansionato in precedenza
 *       403:
 *         description: Permessi insufficienti
 */