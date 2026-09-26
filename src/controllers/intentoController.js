const intentoService = require('../services/intentoService');

class IntentoController {
    async getAll(req, res) {
        try {
            const data = await intentoService.getAll(req.user.username, req.ip);
            res.json({ status: 'ok', data });
        } catch (err) {
            console.error('Error in Intento:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}
module.exports = new IntentoController();