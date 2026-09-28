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

    async create(req, res) {
        try {
            const data = await usuarioService.createUsuario(req.body, req.user, req.ip);
            res.status(201).json({ status: 'ok', message: 'Usuario creado exitosamente', data });
        } catch (err) {
            console.error('Error creating Usuario:', err);
            res.status(400).json({ status: 'error', message: err.message || 'Error al crear usuario' });
        }
    }

    async update(req, res) {
        try {
            const data = await usuarioService.updateUsuario(req.params.id, req.body, req.user, req.ip);
            res.json({ status: 'ok', message: 'Usuario actualizado exitosamente', data });
        } catch (err) {
            res.status(400).json({ status: 'error', message: err.message });
        }
    }

    async delete(req, res) {
        try {
            await usuarioService.deleteUsuario(req.params.id, req.user, req.ip);
            res.json({ status: 'ok', message: 'Usuario eliminado exitosamente' });
        } catch (err) {
            res.status(400).json({ status: 'error', message: err.message });
        }
    }
}
module.exports = new UsuarioController();