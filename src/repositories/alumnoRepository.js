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
    async findByMatricula(matricula) {
        const result = await db.query(
            'SELECT * FROM academico.alumnos WHERE matricula = $1',
            [matricula]
        );
        return result.rows[0];
    }

    async create({ matricula, nombre, apellido, semestre, usuario_id = null, activo = true }) {
        const result = await db.query(`
            INSERT INTO academico.alumnos (matricula, nombre, apellido, semestre, usuario_id, activo)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [matricula, nombre, apellido, semestre, usuario_id, activo]);
        return result.rows[0];
    }
}

module.exports = new AlumnoRepository();
