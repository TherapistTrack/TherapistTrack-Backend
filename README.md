<h1 align="center">📦 Therapist Track</h1>
<h3 align="center"> Backend </h3>

Utiliza Node.js y Express para proporcionar una API REST que interactúa con una base de datos MongoDB, gestionando autenticación, manejo de archivos y operaciones CRUD para pacientes y médicos.

Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para fines de desarrollo y pruebas.

### Prerrequisitos

Necesitas tener instalado Node.js y npm en tu computadora. Opcionalmente, puedes usar Docker para contenerizar la aplicación.

## Environment variables

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
```

💡**NOTA:** Si el DB_HOST cambiara dependiendo si el backend se corre dentro de un contenedor, en esos casos el host será `database` o como lo indique el archivo `compose.yaml` usado.

### Instalación

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

### Ejecución

Para ejecutar la aplicación en un entorno de desarrollo, puedes utilizar Node.js o Docker Compose:

#### Usando Node.js:

```bash
npm start
```

#### Usando Docker Compose:

Para iniciar los servicios

```bash
docker-compose up
```

Para detener y eliminar los contenedores creados

```bash
docker-compose down -v
```

Para reconstruir los contenedores después de realizar cambios

```bash
docker-compose build
```

### Uso de compose.test.yaml

1. Primero apagar y eliminar volúmenes para actualizar

   ```bash
   docker compose -f compose.test.yaml down -v
   ```

2. Iniciar y construir la base de datos

   ```bash
   docker compose -f compose.test.yaml up database --build
   ```

3. Iniciar el backend

   ```bash
   npm start
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

### Ejemplo de Uso

Para ver ejemplos detallados de cómo interactuar con la API, consulta la sección de documentación de Swagger.

## Documentación de la API

Accede a la documentación interactiva de la API generada con Swagger visitando:

```bash
http://localhost:3001/api-docs
```

Esta documentación proporciona una interfaz para probar todas las rutas disponibles y ver sus especificaciones.

### Construido con

- Node.js - El entorno de ejecución para JavaScript.
- Express - El framework web utilizado.
- Mongoose - ORM para MongoDB.
