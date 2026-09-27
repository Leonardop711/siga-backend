const db = require('../config/db');

class AlumnoRepository {
    async getAllWithGrades() {
        const result = await db.query(`
            SELECT a.matricula, a.nombre, a.apellido, a.semestre, c.asignatura, c.calificacion 
            FROM academico.alumnos a 
            LEFT JOIN academico.calificaciones c ON a.matricula = c.matricula 
            WHERE a.activo = true
            ORDER BY a.apellido ASC
        `);
        return result.rows;
    }

    async getGradesByUsername(username) {
        const result = await db.query(`
            SELECT a.matricula, a.nombre, a.apellido, a.semestre, c.asignatura, c.calificacion 
            FROM academico.alumnos a 
            INNER JOIN seguridad.usuarios u ON a.usuario_id = u.id
            LEFT JOIN academico.calificaciones c ON a.matricula = c.matricula 
            WHERE a.activo = true AND u.username = $1
            ORDER BY c.asignatura ASC
        `, [username]);
        return result.rows;
    }
}

module.exports = new AlumnoRepository();
