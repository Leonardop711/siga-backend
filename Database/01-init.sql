-- Esquemas sugeridos para organizar las tablas y mantener separación de privilegios
CREATE SCHEMA IF NOT EXISTS seguridad;
CREATE SCHEMA IF NOT EXISTS academico;
CREATE SCHEMA IF NOT EXISTS auditoria;

-- 1. Tabla de Usuarios (Autenticación y Roles)
CREATE TABLE IF NOT EXISTS seguridad.usuarios (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Aquí se guardará el hash de BCrypt
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('admin', 'docente', 'alumno')),
    activo BOOLEAN DEFAULT true,
    session_token VARCHAR(255),
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Intentos Fallidos (Para prevenir ataques de fuerza bruta)
CREATE TABLE IF NOT EXISTS seguridad.intentos_fallidos (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL,
    fecha_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    exitoso BOOLEAN DEFAULT false,
    ip VARCHAR(45)
);

-- 3. Tabla de Alumnos (Datos Sensibles)
CREATE TABLE IF NOT EXISTS academico.alumnos (
    matricula VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    semestre INT NOT NULL,
    usuario_id INT REFERENCES seguridad.usuarios(id),
    activo BOOLEAN DEFAULT true
);

-- 4. Tabla de Calificaciones (Más Datos Sensibles)
CREATE TABLE IF NOT EXISTS academico.calificaciones (
    id SERIAL PRIMARY KEY,
    matricula VARCHAR(20) REFERENCES academico.alumnos(matricula),
    asignatura VARCHAR(100) NOT NULL,
    calificacion DECIMAL(5,2) CHECK (calificacion >= 0.0 AND calificacion <= 10.0),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Auditoría (Para registrar accesos y cambios críticos)
CREATE TABLE IF NOT EXISTS auditoria.logs (
    id SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accion VARCHAR(100) NOT NULL,
    usuario VARCHAR(50), -- Puede ser nulo si el error/ataque ocurre sin login
    detalles TEXT,
    ip VARCHAR(45)
);

-- Usuarios base de demostración (Admin123!, Docente123!, Alumno123!)
INSERT INTO seguridad.usuarios (username, password_hash, rol) VALUES 
('admin', '$2b$10$YqGTl/.nlJ1QO86Qpr8lDu/d8nCq2GnBalYiHsTFZodAauGvj.w4q', 'admin'),
('admin2', '$2b$10$YqGTl/.nlJ1QO86Qpr8lDu/d8nCq2GnBalYiHsTFZodAauGvj.w4q', 'admin'),
('docente.ramirez', '$2b$10$jES1tB6z/qlG5aCm78kdPumBl00UWSHmH/SeoP/G5styg/f1e/bSi', 'docente'),
('docente.lopez', '$2b$10$jES1tB6z/qlG5aCm78kdPumBl00UWSHmH/SeoP/G5styg/f1e/bSi', 'docente'),
('alumno.20230001', '$2b$10$ntwaHr.slCeom91o0NkcUuxznhAlutvwT8PwovZ/EAb2xipsYQgdG', 'alumno'),
('alumno.20230002', '$2b$10$ntwaHr.slCeom91o0NkcUuxznhAlutvwT8PwovZ/EAb2xipsYQgdG', 'alumno')
ON CONFLICT (username) DO NOTHING;

-- Alumnos base vinculados
INSERT INTO academico.alumnos (matricula, nombre, apellido, semestre, usuario_id, activo) VALUES 
('20230001', 'Juan', 'Pérez', 5, (SELECT id FROM seguridad.usuarios WHERE username='alumno.20230001'), true),
('20230002', 'María', 'González', 3, (SELECT id FROM seguridad.usuarios WHERE username='alumno.20230002'), true),
('20230003', 'Carlos', 'López', 7, null, true)
ON CONFLICT (matricula) DO NOTHING;

-- Calificaciones base
INSERT INTO academico.calificaciones (matricula, asignatura, calificacion) VALUES 
('20230001', 'Seguridad Web', 9.5),
('20230001', 'Bases de Datos', 8.0),
('20230002', 'Programación', 10.0),
('20230003', 'Redes', 7.5)
ON CONFLICT DO NOTHING;
