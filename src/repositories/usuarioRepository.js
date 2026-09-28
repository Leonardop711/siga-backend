const db = require('../config/db');

class UsuarioRepository {
    async getAll() {
        const result = await db.query('SELECT id, username, rol, activo, creado_en FROM seguridad.usuarios ORDER BY id ASC');
        return result.rows;
    }

    async findByUsername(username) {
        const result = await db.query('SELECT * FROM seguridad.usuarios WHERE username = $1', [username]);
        return result.rows[0];
    }

    async create({ username, password_hash, rol, activo = true }) {
        const result = await db.query(`
            INSERT INTO seguridad.usuarios (username, password_hash, rol, activo)
            VALUES ($1, $2, $3, $4)
            RETURNING id, username, rol, activo, creado_en
        `, [username, password_hash, rol, activo]);
        return result.rows[0];
    }

    async update(id, { rol, activo }) {
        const result = await db.query(`
            UPDATE seguridad.usuarios 
            SET rol = $1, activo = $2 
            WHERE id = $3 
            RETURNING id, username, rol, activo, creado_en
        `, [rol, activo, id]);
        return result.rows[0];
    }

    async delete(id) {
        // First delete their related alumnos and grades if they exist
        const alumnos = await db.query('SELECT matricula FROM academico.alumnos WHERE usuario_id = $1', [id]);
        for (let row of alumnos.rows) {
            await db.query('DELETE FROM academico.calificaciones WHERE matricula = $1', [row.matricula]);
            await db.query('DELETE FROM academico.alumnos WHERE matricula = $1', [row.matricula]);
        }
        const result = await db.query('DELETE FROM seguridad.usuarios WHERE id = $1 RETURNING id, username', [id]);
        return result.rows[0];
    }
}
module.exports = new UsuarioRepository();