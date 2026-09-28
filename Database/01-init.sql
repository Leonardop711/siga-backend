-- Esquemas sugeridos para organizar las tablas y mantener separaciÃ³n de privilegios
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS academico;
CREATE SCHEMA IF NOT EXISTS auditoria;

-- 1. Tabla de Usuarios (AutenticaciÃ³n y Roles)
CREATE TABLE seguridad.usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- AquÃ­ se guardarÃ¡ el hash de BCrypt
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'docente', 'alumno')),
    activo BOOLEAN DEFAULT true,
    session_token VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Intentos Fallidos (Para prevenir ataques de fuerza bruta)
CREATE TABLE seguridad.intentos_fallidos (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exitoso BOOLEAN DEFAULT false,
    ip VARCHAR(45)
);

-- 3. Tabla de Alumnos (Datos Sensibles)
CREATE TABLE academico.alumnos (
    matricula VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    semestre INT NOT NULL,
    usuario_id INT REFERENCES seguridad.usuarios(id),
    activo BOOLEAN DEFAULT true
);

-- 4. Tabla de Calificaciones (MÃ¡s Datos Sensibles)
CREATE TABLE academico.calificaciones (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) REFERENCES academico.alumnos(matricula),
    asignatura VARCHAR(100) NOT NULL,
    calificacion DECIMAL(5,2) CHECK (calificacion >= 0.0 AND calificacion <= 10.0),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de AuditorÃ­a (Para registrar accesos y cambios crÃ­ticos)
CREATE TABLE auditoria.logs (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accion VARCHAR(100) NOT NULL,
    usuario VARCHAR(50), -- Puede ser nulo si el error/ataque ocurre sin login
    detalles TEXT,
    ip VARCHAR(45)
);

-- Insertar un usuario administrador por defecto
-- La contraseÃ±a es 'Admin123!', su hash BCrypt con work factor 12 es el siguiente:
INSERT INTO seguridad.usuarios (username, password_hash, rol) 
VALUES ('admin', '$2b$10$YqGTl/.nlJ1QO86Qpr8lDu/d8nCq2GnBalYiHsTFZodAauGvj.w4q', 'admin');
