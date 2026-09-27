const alumnoService = require('../services/alumnoService');

class AlumnoController {
    async getAlumnos(req, res) {
        try {
            const data = await alumnoService.getAlumnos(req.user, req.ip);
            res.json({ status: 'ok', data });
        } catch (err) {
            console.error('Get alumnos error:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}

module.exports = new AlumnoController();
