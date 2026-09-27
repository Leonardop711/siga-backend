-- 2 usuarios por rol
INSERT INTO seguridad.usuarios (username, password_hash, rol) VALUES 
('admin2', '$2b$10$YqGTl/.nlJ1QO86Qpr8lDu/d8nCq2GnBalYiHsTFZodAauGvj.w4q', 'admin'),
('docente.ramirez', '$2b$10$jES1tB6z/qlG5aCm78kdPumBl00UWSHmH/SeoP/G5styg/f1e/bSi', 'docente'),
('docente.lopez', '$2b$10$jES1tB6z/qlG5aCm78kdPumBl00UWSHmH/SeoP/G5styg/f1e/bSi', 'docente'),
('alumno.20230001', '$2b$10$ntwaHr.slCeom91o0NkcUuxznhAlutvwT8PwovZ/EAb2xipsYQgdG', 'alumno'),
('alumno.20230002', '$2b$10$ntwaHr.slCeom91o0NkcUuxznhAlutvwT8PwovZ/EAb2xipsYQgdG', 'alumno')
ON CONFLICT (username) DO NOTHING;

-- Asegurarse de que el usuario Admin existe o insertar alumnos base
INSERT INTO academico.alumnos (matricula, nombre, apellido, semestre, usuario_id, activo)
VALUES 
('20230001', 'Juan', 'Pérez', 5, (SELECT id FROM seguridad.usuarios WHERE username='alumno.20230001'), true),
('20230002', 'María', 'González', 3, (SELECT id FROM seguridad.usuarios WHERE username='alumno.20230002'), true),
('20230003', 'Carlos', 'López', 7, null, true)
ON CONFLICT (matricula) DO NOTHING;

-- Calificaciones base
INSERT INTO academico.calificaciones (matricula, asignatura, calificacion)
VALUES 
('20230001', 'Seguridad Web', 9.5),
('20230001', 'Bases de Datos', 8.0),
('20230002', 'Programación', 10.0),
('20230003', 'Redes', 7.5);
