const db = require('../config/db');

class CalificacionRepository {
    async getAll() {
        const result = await db.query('SELECT * FROM academico.calificaciones ORDER BY fecha_registro DESC');
        return result.rows;
    }

    async create({ matricula, asignatura, calificacion }) {
        const result = await db.query(`
            INSERT INTO academico.calificaciones (matricula, asignatura, calificacion)
            VALUES ($1, $2, $3)
            RETURNING *
        `, [matricula, asignatura, calificacion]);
        return result.rows[0];
    }
}
module.exports = new CalificacionRepository();