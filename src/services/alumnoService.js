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

    /**
     * Registra un nuevo alumno en la base de datos previa verificación de permisos (RBAC) y validaciones.
     * Solo usuarios con rol 'admin' o 'docente' están autorizados.
     * Registra evento en la auditoría del sistema.
     */
    async createAlumno(data, user, ip) {
        if (user.rol === 'alumno') {
            throw new Error('No tienes permisos suficientes para registrar alumnos (se requiere rol Admin o Docente)');
        }

        const { matricula, nombre, apellido, semestre, usuario_id } = data;

        if (!matricula || !nombre || !apellido || semestre === undefined || semestre === null || semestre === '') {
            throw new Error('Matrícula, nombre, apellido y semestre son campos requeridos');
        }

        const cleanMatricula = String(matricula).trim();
        const cleanNombre = String(nombre).trim();
        const cleanApellido = String(apellido).trim();
        const sem = parseInt(semestre, 10);

        if (!cleanMatricula || !cleanNombre || !cleanApellido) {
            throw new Error('Los campos de texto no pueden estar vacíos');
        }

        if (isNaN(sem) || sem < 1 || sem > 12) {
            throw new Error('El semestre debe ser un número entero entre 1 y 12');
        }

        const existing = await alumnoRepository.findByMatricula(cleanMatricula);
        if (existing) {
            throw new Error(`Ya existe un alumno registrado con la matrícula '${cleanMatricula}'`);
        }

        const nuevoAlumno = await alumnoRepository.create({
            matricula: cleanMatricula,
            nombre: cleanNombre,
            apellido: cleanApellido,
            semestre: sem,
            usuario_id: usuario_id ? parseInt(usuario_id, 10) : null,
            activo: true
        });

        await authRepository.logAudit(
            'CREATE_ALUMNO',
            user.username,
            `Registro de nuevo alumno: ${cleanMatricula} - ${cleanNombre} ${cleanApellido} (Semestre: ${sem})`,
            ip
        );

        return nuevoAlumno;
    }
}

module.exports = new AlumnoService();

