const usuarioService = require('../services/usuarioService');

class UsuarioController {
    async getAll(req, res) {
        try {
            const data = await usuarioService.getAll(req.user.username, req.ip);
            res.json({ status: 'ok', data });
        } catch (err) {
            console.error('Error in Usuario:', err);
            res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
        }
    }
}
module.exports = new UsuarioController();