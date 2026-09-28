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

    async create(req, res) {
        try {
            const data = await calificacionService.createCalificacion(req.body, req.user, req.ip);
            res.status(201).json({ status: 'ok', message: 'Calificación registrada exitosamente', data });
        } catch (err) {
            console.error('Error creating Calificacion:', err);
            res.status(400).json({ status: 'error', message: err.message || 'Error al registrar calificación' });
        }
    }
}
module.exports = new CalificacionController();