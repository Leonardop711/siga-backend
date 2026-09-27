# SIGA Backend - API REST Segura

Backend API desarrollado en **Node.js** y **Express** con base de datos **PostgreSQL**, enfocado en la implementación de estándares de **Seguridad Web**, control de acceso basado en roles (**RBAC**), mitigación de ataques y auditoría continua.

---

## 📋 Tabla de Contenidos
- [Descripción General](#-descripción-general)
- [Arquitectura de Software](#-arquitectura-de-software)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Mecanismos y Medidas de Seguridad](#-mecanismos-y-medidas-de-seguridad)
- [Modelo de Base de Datos](#-modelo-de-base-de-datos)
- [Variables de Entorno](#-variables-de-entorno)
- [Instalación y Despliegue](#-instalación-y-despliegue)
  - [Opción 1: Con Docker Compose (Recomendado)](#opción-1-con-docker-compose-recomendado)
  - [Opción 2: Ejecución Local](#opción-2-ejecución-local)
- [Referencia de la API (Endpoints)](#-referencia-de-la-api-endpoints)
- [Usuarios y Credenciales de Prueba](#-usuarios-y-credenciales-de-prueba)
- [Pipeline de CI/CD](#-pipeline-de-cicd)

---

## 🚀 Descripción General

**SIGA (Sistema de Información y Gestión Académica)** es una plataforma diseñada con un enfoque prioritario en la seguridad defensiva. Permite la administración de alumnos, calificaciones y usuarios bajo un modelo de privilegios mínimos y trazabilidad total de operaciones.

---

## 🏛 Arquitectura de Software

El proyecto implementa una arquitectura en capas desacopladas (**Rutas -> Controladores -> Servicios -> Repositorios -> Base de Datos**):

```mermaid
graph TD
    Client[Cliente / Frontend] -->|HTTPS / REST| Router[Routes]
    Router -->|Middlewares Auth & RateLimit| Controller[Controllers]
    Controller -->|Lógica de Negocio y Auditoría| Service[Services]
    Service -->|Consultas Parametrizadas| Repository[Repositories]
    Repository -->|pg Pool / SQL| DB[(PostgreSQL Database)]
```

### Responsabilidades por Capa:
1. **Rutas (`src/routes/`)**: Mapeo de verbos HTTP y endpoints, vinculando middlewares de protección y controladores.
2. **Middlewares (`src/middlewares/`)**: Verificación y decodificación de tokens JWT, control de cuotas y limitación de tasa (*rate limiting*).
3. **Controladores (`src/controllers/`)**: Gestión de entrada (`req.body`, `req.user`, `req.ip`), códigos de estado HTTP y serialización de respuestas.
4. **Servicios (`src/services/`)**: Reglas de negocio, filtrado contextual según el rol del usuario autenticado y registro automático de eventos de auditoría.
5. **Repositorios (`src/repositories/`)**: Abstracción del acceso a datos, garantizando consultas SQL puras y parametrizadas para evitar inyecciones SQL.
6. **Configuración (`src/config/`)**: Pool de conexiones persistente hacia PostgreSQL con `pg.Pool`.

---

## 📂 Estructura del Proyecto

```text
siga-backend/
├── .github/
│   └── workflows/
│       └── deploy.yml           # Flujo de despliegue continuo vía SSH a AWS EC2
├── Database/
│   ├── 01-init.sql              # Creación de esquemas (seguridad, academico, auditoria) y tablas
│   └── 02-seed.sql              # Datos iniciales (usuarios, alumnos, calificaciones de prueba)
├── src/
│   ├── config/
│   │   └── db.js                # Conexión al pool de PostgreSQL
│   ├── controllers/             # Manejadores de peticiones HTTP
│   │   ├── alumnoController.js
│   │   ├── authController.js
│   │   ├── calificacionController.js
│   │   ├── intentoController.js
│   │   ├── logController.js
│   │   └── usuarioController.js
│   ├── middlewares/
│   │   └── authMiddleware.js    # Validación de token JWT en header Authorization
│   ├── repositories/            # Capa de persistencia (queries SQL preparadas)
│   │   ├── alumnoRepository.js
│   │   ├── authRepository.js
│   │   ├── calificacionRepository.js
│   │   ├── intentoRepository.js
│   │   ├── logRepository.js
│   │   └── usuarioRepository.js
│   ├── routes/                  # Definición de rutas y endpoints
│   │   ├── alumnoRoutes.js
│   │   ├── authRoutes.js
│   │   ├── calificacionRoutes.js
│   │   ├── intentoRoutes.js
│   │   ├── logRoutes.js
│   │   └── usuarioRoutes.js
│   ├── services/                # Reglas de negocio y auditoría
│   │   ├── alumnoService.js
│   │   ├── authService.js
│   │   ├── calificacionService.js
│   │   ├── intentoService.js
│   │   ├── logService.js
│   │   └── usuarioService.js
│   └── app.js                   # Configuración central de Express y middlewares globales
├── .env.example                 # Plantilla de variables de entorno
├── .gitignore                   # Archivos ignorados por Git
├── docker-compose.yaml          # Orquestación de contenedores (db, backend, frontend)
├── Dockerfile                   # Imagen Docker para el backend Node.js
├── package.json                 # Dependencias y scripts
└── server.js                    # Punto de entrada y arranque del servidor HTTP
```

---

## 🛡 Mecanismos y Medidas de Seguridad

El backend implementa defensas para los riesgos del **OWASP Top 10**:

| Medida / Riesgo | Implementación en el Código | Beneficio |
| :--- | :--- | :--- |
| **Prevención de Inyección SQL** | Parámetros `$1, $2, ...` en `src/repositories/*` mediante la librería `pg`. | Neutraliza ataques de manipulación o extracción maliciosa de datos vía SQL Injection. |
| **Protección contra Fuerza Bruta** | `express-rate-limit` con cuota estricta en `/api/login` (máx. 5 intentos cada 3 min) y global (máx. 100 reqs / 15 min). | Dificulta ataques de diccionario, fuerza bruta y abusos DoS. |
| **Almacenamiento Seguro de Credenciales** | Hashing con `bcrypt` (work factor 10-12) en `authService.js` e inicializaciones SQL. | No almacena contraseñas en texto plano; resistente a filtraciones de base de datos. |
| **Autenticación Stateless & RBAC** | `jsonwebtoken` (JWT) con expiración de 1 hora, transportado en cabecera `Bearer`. | Comprobación de identidad y roles (`admin`, `docente`, `alumno`) en cada endpoint. |
| **Seguridad de Cabeceras HTTP** | Middleware `helmet()` en `src/app.js`. | Añade cabeceras de protección (X-Content-Type-Options, X-Frame-Options, HSTS, etc.). |
| **Restricción de Orígenes (CORS)** | `cors()` configurado con orígenes autorizados específicos y credenciales. | Previene invocaciones no autorizadas desde dominios web externos no confiables. |
| **Auditoría y Trazabilidad** | Tablas `seguridad.intentos_fallidos` y `auditoria.logs`. | Registra accesos exitosos/fallidos, IP de origen, usuario y detalles de operaciones. |
| **Filtrado Contextual de Datos** | `alumnoService.js` restringe la consulta si el rol es `alumno` (sólo ve sus propias notas). | Cumple con el principio de mínimo privilegio y evita acceso horizontal no autorizado. |

---

## 🗄 Modelo de Base de Datos

La base de datos PostgreSQL está organizada en 3 esquemas independientes:

```mermaid
erDiagram
    seguridad_usuarios ||--o{ academico_alumnos : "asigna a"
    seguridad_usuarios ||--o{ seguridad_intentos_fallidos : "registra historial"
    academico_alumnos ||--o{ academico_calificaciones : "posee"

    seguridad_usuarios {
        int id PK
        string username UK
        string password_hash
        string rol "CHECK: admin, docente, alumno"
        boolean activo
        timestamp creado_en
    }

    seguridad_intentos_fallidos {
        int id PK
        string usuario
        timestamp fecha_intento
        boolean exitoso
        string ip
    }

    academico_alumnos {
        string matricula PK
        string nombre
        string apellido
        int semestre
        int usuario_id FK
        boolean activo
    }

    academico_calificaciones {
        int id PK
        string matricula FK
        string asignatura
        decimal calificacion "CHECK: 0.0 a 10.0"
        timestamp fecha_registro
    }

    auditoria_logs {
        int id PK
        timestamp fecha
        string accion
        string usuario
        text detalles
        string ip
    }
```

---

## ⚙ Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto tomando como base `.env.example`:

```env
# Puerto del servidor (opcional, por defecto 3000)
PORT=3000

# Base de Datos PostgreSQL
DB_USER=admin
DB_PASSWORD=tu_contraseña_segura
DB_NAME=sigadb
DATABASE_URL=postgres://admin:tu_contraseña_segura@localhost:5432/sigadb

# Secreto para firma y verificación de JSON Web Tokens
JWT_SECRET=super_secret_jwt_key_largo_y_aleatorio
```

---

## 💻 Instalación y Despliegue

### Opción 1: Con Docker Compose (Recomendado)

El archivo `docker-compose.yaml` levanta automáticamente el contenedor de base de datos PostgreSQL con los scripts `01-init.sql` y `02-seed.sql` precargados:

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd siga-backend

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar los servicios
docker compose up -d --build
```

El servicio estará disponible en: `http://localhost:3000`

### Opción 2: Ejecución Local

#### Prerrequisitos:
- **Node.js** >= 18.x
- **PostgreSQL** >= 14.x

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar la base de datos
# Ejecutar los scripts SQL en tu servidor PostgreSQL:
# Database/01-init.sql
# Database/02-seed.sql

# 3. Ejecutar en modo desarrollo con nodemon
npm run dev

# O ejecutar en producción
npm start
```

---

## 📡 Referencia de la API (Endpoints)

Todas las rutas están prefijadas por `/api`.

### 1. Healthcheck
- **`GET /api/health`**
  - **Acceso**: Público
  - **Descripción**: Comprueba la conectividad con la base de datos y la salud del servicio.
  - **Respuesta Exitosa (200 OK)**:
    ```json
    {
      "status": "ok",
      "db_time": "2026-09-26T23:00:00.000Z"
    }
    ```

---

### 2. Autenticación
- **`POST /api/login`**
  - **Acceso**: Público (Protegido por rate limiter: máx. 5 peticiones cada 3 minutos).
  - **Body**:
    ```json
    {
      "username": "admin",
      "password": "Admin123!"
    }
    ```
  - **Respuesta Exitosa (200 OK)**:
    ```json
    {
      "status": "ok",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "rol": "admin",
      "username": "admin"
    }
    ```
  - **Respuesta de Error (401 Unauthorized)**:
    ```json
    {
      "status": "error",
      "message": "Credenciales incorrectas"
    }
    ```

---

### 3. Alumnos
- **`GET /api/alumnos`**
  - **Acceso**: Privado (Requiere cabecera `Authorization: Bearer <TOKEN>`).
  - **Lógica de Seguridad**:
    - Si el usuario tiene rol `alumno`, devuelve únicamente sus calificaciones correspondientes.
    - Si el usuario es `admin` o `docente`, devuelve el catálogo general de alumnos con sus calificaciones.
    - Cada consulta genera un log en `auditoria.logs` con la acción `READ_ALUMNOS`.
  - **Respuesta Exitosa (200 OK)**:
    ```json
    {
      "status": "ok",
      "data": [
        {
          "matricula": "20230001",
          "nombre": "Juan",
          "apellido": "Pérez",
          "semestre": 5,
          "asignatura": "Seguridad Web",
          "calificacion": "9.50"
        }
      ]
    }
    ```

---

### 4. Usuarios
- **`GET /api/usuarios`**
  - **Acceso**: Privado (Requiere token JWT).
  - **Descripción**: Retorna la lista de usuarios del esquema de seguridad. Registra evento `READ_USUARIO` en auditoría.
  - **Respuesta Exitosa (200 OK)**:
    ```json
    {
      "status": "ok",
      "data": [
        {
          "id": 1,
          "username": "admin",
          "rol": "admin",
          "activo": true,
          "creado_en": "2026-09-26T20:00:00.000Z"
        }
      ]
    }
    ```

---

### 5. Calificaciones
- **`GET /api/calificaciones`**
  - **Acceso**: Privado (Requiere token JWT).
  - **Descripción**: Obtiene todas las calificaciones registradas en `academico.calificaciones`. Registra evento `READ_CALIFICACION`.

---

### 6. Intentos de Autenticación
- **`GET /api/intentos`**
  - **Acceso**: Privado (Requiere token JWT).
  - **Descripción**: Lista los registros de la tabla `seguridad.intentos_fallidos` (intentos de inicio de sesión válidos o inválidos junto con su IP). Registra evento `READ_INTENTO`.

---

### 7. Logs de Auditoría
- **`GET /api/logs`**
  - **Acceso**: Privado (Requiere token JWT).
  - **Descripción**: Lista las entradas registradas en `auditoria.logs` para trazabilidad de seguridad y análisis forense. Registra evento `READ_LOG`.

---

## 👥 Usuarios y Credenciales de Prueba

Los siguientes usuarios están configurados en los scripts `01-init.sql` y `02-seed.sql`:

| Usuario | Rol | Contraseña por defecto | Matrícula Vinculada |
| :--- | :--- | :--- | :--- |
| `admin` | `admin` | `Admin123!` | N/A |
| `admin2` | `admin` | `Admin123!` | N/A |
| `docente.ramirez` | `docente` | *(Hash precargado en seed)* | N/A |
| `docente.lopez` | `docente` | *(Hash precargado en seed)* | N/A |
| `alumno.20230001` | `alumno` | *(Hash precargado en seed)* | `20230001` |
| `alumno.20230002` | `alumno` | *(Hash precargado en seed)* | `20230002` |

---

## 🔄 Pipeline de CI/CD

El repositorio cuenta con un flujo automatizado en GitHub Actions ([deploy.yml](file:///.github/workflows/deploy.yml)):

- **Disparador**: Cada `push` a la rama `main`.
- **Acción**: Conexión vía SSH a una instancia **AWS EC2**, ejecución de `git pull` y recarga en caliente de los contenedores mediante `sudo docker compose up -d --build`.
