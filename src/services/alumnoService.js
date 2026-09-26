const alumnoRepository = require('../repositories/alumnoRepository');
const authRepository = require('../repositories/authRepository');

class AlumnoService {
    async getAlumnos(username, ip) {
        await authRepository.logAudit('READ_ALUMNOS', username, 'Acceso a listado de alumnos', ip);
        return await alumnoRepository.getAllWithGrades();
    }
}

module.exports = new AlumnoService();
