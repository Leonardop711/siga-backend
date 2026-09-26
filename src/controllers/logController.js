const logService = require('../services/logService');

class LogController {
    async getAll(req, res) {
        try {
            const data = await logService.getAll(req.user.username, req.ip);
            res.json({ status: 'ok', data });
        } catch (err) {
            console.error('Error in Log:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}
module.exports = new LogController();