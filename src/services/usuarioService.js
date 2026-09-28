const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');
const authRepository = require('../repositories/authRepository');

class UsuarioService {
    async getAll(username, ip) {
        await authRepository.logAudit('READ_USUARIO', username, 'Acceso a listado', ip);
        return await usuarioRepository.getAll();
    }

    /**
     * Registra un nuevo usuario en seguridad.usuarios cifrando la contraseña con BCrypt.
     * Solo administradores pueden registrar nuevos usuarios (RBAC).
     */
    async createUsuario(data, user, ip) {
        if (user.rol !== 'admin') {
            throw new Error('Solo los administradores tienen autorización para registrar nuevos usuarios');
        }

        const { username, password, rol, activo = true } = data;

        if (!username || !password || !rol) {
            throw new Error('Nombre de usuario, contraseña y rol son requeridos');
        }

        const cleanUsername = String(username).trim();
        const cleanRol = String(rol).trim().toLowerCase();

        if (cleanUsername.length < 3) {
            throw new Error('El nombre de usuario debe contener al menos 3 caracteres');
        }

        if (String(password).length < 6) {
            throw new Error('La contraseña debe contener al menos 6 caracteres');
        }

        const validRoles = ['admin', 'docente', 'alumno'];
        if (!validRoles.includes(cleanRol)) {
            throw new Error(`Rol inválido. Los roles permitidos son: ${validRoles.join(', ')}`);
        }

        const existing = await usuarioRepository.findByUsername(cleanUsername);
        if (existing) {
            throw new Error(`El usuario '${cleanUsername}' ya se encuentra registrado en el sistema`);
        }

        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const nuevoUsuario = await usuarioRepository.create({
            username: cleanUsername,
            password_hash,
            rol: cleanRol,
            activo: activo !== false
        });

        await authRepository.logAudit(
            'CREATE_USUARIO',
            user.username,
            `Creación de cuenta para usuario '${cleanUsername}' con rol '${cleanRol}'`,
            ip
        );

        return nuevoUsuario;
    }
}
module.exports = new UsuarioService();