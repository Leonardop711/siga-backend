const calificacionRepository = require('../repositories/calificacionRepository');
const authRepository = require('../repositories/authRepository');

class CalificacionService {
    async getAll(username, ip) {
        await authRepository.logAudit('READ_CALIFICACION', username, 'Acceso a listado', ip);
        return await calificacionRepository.getAll();
    }
}
module.exports = new CalificacionService();