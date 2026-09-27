const alumnoRepository = require('../repositories/alumnoRepository');
const authRepository = require('../repositories/authRepository');

/**
 * Servicio encargado de la lógica de negocio para la gestión y consulta de alumnos.
 * Aplica reglas de autorización contextuales (RBAC) y registro de auditoría.
 */
class AlumnoService {
    /**
     * Obtiene el listado de alumnos o calificaciones según el rol del usuario autenticado.
     * Registra automáticamente la acción en la bitácora de auditoría.
     *
     * - Si el usuario es 'alumno': Devuelve únicamente sus calificaciones asociadas.
     * - Si el usuario es 'admin' o 'docente': Devuelve el catálogo general de alumnos con sus notas.
     *
     * @param {Object} user - Objeto con datos del usuario decodificado desde el JWT (id, username, rol).
     * @param {string} user.username - Nombre de usuario solicitante.
     * @param {string} user.rol - Rol del usuario ('admin', 'docente', 'alumno').
     * @param {string} ip - Dirección IP de origen de la solicitud HTTP.
     * @returns {Promise<Array<Object>>} Promesa que resuelve al conjunto de registros obtenidos de la base de datos.
     */
    async getAlumnos(user, ip) {
        await authRepository.logAudit('READ_ALUMNOS', user.username, 'Acceso a listado de alumnos', ip);
        if (user.rol === 'alumno') {
            return await alumnoRepository.getGradesByUsername(user.username);
        }
        return await alumnoRepository.getAllWithGrades();
    }
}

module.exports = new AlumnoService();

