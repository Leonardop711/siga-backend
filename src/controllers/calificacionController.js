const calificacionService = require('../services/calificacionService');

class CalificacionController {
    async getAll(req, res) {
        try {
            const data = await calificacionService.getAll(req.user.username, req.ip);
            res.json({ status: 'ok', data });
        } catch (err) {
            console.error('Error in Calificacion:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}
module.exports = new CalificacionController();