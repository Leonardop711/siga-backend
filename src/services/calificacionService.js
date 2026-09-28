const calificacionRepository = require('../repositories/calificacionRepository');
const authRepository = require('../repositories/authRepository');

class CalificacionService {
    async getAll(username, ip) {
        await authRepository.logAudit('READ_CALIFICACION', username, 'Acceso a listado', ip);
        return await calificacionRepository.getAll();
    }

    /**
     * Registra una nueva calificación verificando permisos y consistencia de datos.
     * Solo 'admin' y 'docente' pueden calificar.
     */
    async createCalificacion(data, user, ip) {
        if (user.rol === 'alumno') {
            throw new Error('No tienes permisos para registrar calificaciones (se requiere rol Admin o Docente)');
        }

        const { matricula, asignatura, calificacion } = data;

        if (!matricula || !asignatura || calificacion === undefined || calificacion === null || calificacion === '') {
            throw new Error('Matrícula, asignatura y calificación son requeridos');
        }

        const cleanMatricula = String(matricula).trim();
        const cleanAsignatura = String(asignatura).trim();
        const numCalificacion = parseFloat(calificacion);

        if (!cleanMatricula || !cleanAsignatura) {
            throw new Error('La matrícula y la asignatura no pueden estar vacías');
        }

        if (isNaN(numCalificacion) || numCalificacion < 0 || numCalificacion > 10) {
            throw new Error('La calificación debe ser un valor numérico entre 0.0 y 10.0');
        }

        const nuevaCalificacion = await calificacionRepository.create({
            matricula: cleanMatricula,
            asignatura: cleanAsignatura,
            calificacion: numCalificacion
        });

        await authRepository.logAudit(
            'CREATE_CALIFICACION',
            user.username,
            `Calificación asignada a alumno '${cleanMatricula}' en '${cleanAsignatura}': ${numCalificacion}`,
            ip
        );

        return nuevaCalificacion;
    }
}
module.exports = new CalificacionService();