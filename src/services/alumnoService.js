const alumnoRepository = require('../repositories/alumnoRepository');
const authRepository = require('../repositories/authRepository');

class AlumnoService {
    async getAlumnos(user, ip) {
        await authRepository.logAudit('READ_ALUMNOS', user.username, 'Acceso a listado de alumnos', ip);
        if (user.rol === 'alumno') {
            return await alumnoRepository.getGradesByUsername(user.username);
        }
        return await alumnoRepository.getAllWithGrades();
    }
}

module.exports = new AlumnoService();
