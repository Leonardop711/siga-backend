const logRepository = require('../repositories/logRepository');
const authRepository = require('../repositories/authRepository');

class LogService {
    async getAll(username, ip) {
        await authRepository.logAudit('READ_LOG', username, 'Acceso a listado', ip);
        return await logRepository.getAll();
    }
}
module.exports = new LogService();