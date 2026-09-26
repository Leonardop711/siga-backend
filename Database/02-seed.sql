-- Datos de prueba para que el dashboard muestre información

-- Asegurarse de que el usuario Admin existe o insertar alumnos base
INSERT INTO academico.alumnos (matricula, nombre, apellido, semestre, activo)
VALUES 
('20230001', 'Juan', 'Pérez', 5, true),
('20230002', 'María', 'González', 3, true),
('20230003', 'Carlos', 'López', 7, true)
ON CONFLICT (matricula) DO NOTHING;

-- Calificaciones base
INSERT INTO academico.calificaciones (matricula, asignatura, calificacion)
VALUES 
('20230001', 'Seguridad Web', 9.5),
('20230001', 'Bases de Datos', 8.0),
('20230002', 'Programación', 10.0),
('20230003', 'Redes', 7.5);
