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
}

module.exports = new AlumnoRepository();
