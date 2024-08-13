<h1 align="center">📦 Therapist Track</h1>
<h3 align="center"> Backend </h3>

Utiliza Node.js y Express para proporcionar una API REST que interactúa con una base de datos MongoDB, gestionando autenticación, manejo de archivos y operaciones CRUD para pacientes y médicos.

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para fines de desarrollo y pruebas.

# Requerimientos

- Docker
- NodeJS

# Environment variables

El `compose.yaml` necesita de ciertas variables de entorno para inicializar la BD correctamente. Este es un ejemplo un archivo `.env` con dichas variables (debe ser colocado en la raiz del proyecto):

```bash
# BUCKET
BUCKET_HOST=none

# DATABASE
DB_ADMIN_USER=root
DB_ADMIN_PASSWORD=1234
DB_HOST=localhost
DB_NAME=therapisttrack
DB_USER=administrator
DB_USER_PASSWORD=1234
DB_PORT=27017

DB_URI='mongodb://admin:1234@localhost:27017/therapisttrack'
API_PORT=3001
DELAY_START=8000
JWT_SECRET='LocalPassword'
LOGGING_METHOD=FILE


#CORS
ALLOWED_ORIGINS=localhost,https://therapisttrack.name
ALLOWED_CONTENT_TYPES=application/json
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
ALLOWED_HEADERS=Content-Type,Authorization
```

💡**NOTA:** Si el DB_HOST cambiara dependiendo si el backend se corre dentro de un contenedor, en esos casos el host será `database` o como lo indique el archivo `compose.yaml` usado.

# ⬇️ Instalación

Sigue estos pasos para iniciar el proyecto en tu máquina local:

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/TherapistTrack/therapistTrackApp.git
   ```

2. Instalar las dependencias del proyecto:

   ```bash
   npm install
   ```

3. Copiar el archivo .env.example a .env y ajustar las variables de entorno necesarias.

# 🏃‍♂️ Ejecución

Para ejecutar la aplicación en un entorno de desarrollo, puedes utilizar Node.js o Docker Compose:

## Usando Node.js:

Para esto es necesario, tener un BD operacional, en algún lado. El host de dicha DB se especifica en el archivo `.env` como se dijo arriba.

```bash
npm start
```

## Usando Docker Compose:

Se cuentan con 2 archivos de `compose`. Pero para propositos de desarrollo te bastará con `compose.test.yaml`, este te levantara una BD y una Backend funcional.

- **Apagar y eliminar volúmenes para actualizar**

  ```bash
  docker compose -f compose.test.yaml down -v
  ```

- **Iniciar y construir la base de datos**

  ```bash
  docker compose -f compose.test.yaml up --build
  ```

## Uso de la API

La API permite realizar operaciones autenticadas relacionadas con la gestión de usuarios y pacientes. Las rutas principales incluyen:

### Autenticación

```bash
POST /api/login
Body:
{
  "username": "ejemplo",
  "password": "password"
}
```

# 📚 Documentación de la API

Esta generada con Redocly, el siguiente comando levantará un página web con la documentación

```bash
npx redocly preview-docs ./docs/api-spec.yaml
```

Esta documentación proporciona una interfaz para probar todas las rutas disponibles y ver sus especificaciones.

# 🔨 Construido con

- Node.js - El entorno de ejecución para JavaScript.
- Express - El framework web utilizado.
- Mongoose - ORM para MongoDB.
