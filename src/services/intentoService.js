const intentoRepository = require('../repositories/intentoRepository');
const authRepository = require('../repositories/authRepository');

class IntentoService {
    async getAll(username, ip) {
        await authRepository.logAudit('READ_INTENTO', username, 'Acceso a listado', ip);
        return await intentoRepository.getAll();
    }
}
module.exports = new IntentoService();