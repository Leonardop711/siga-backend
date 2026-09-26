const usuarioRepository = require('../repositories/usuarioRepository');
const authRepository = require('../repositories/authRepository');

class UsuarioService {
    async getAll(username, ip) {
        await authRepository.logAudit('READ_USUARIO', username, 'Acceso a listado', ip);
        return await usuarioRepository.getAll();
    }
}
module.exports = new UsuarioService();