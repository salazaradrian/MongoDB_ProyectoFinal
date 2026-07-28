# MongoDB_ProyectoFinal

Back-end (Node.js + Express + Mongoose) para el proyecto de Bases de Datos NoSQL: optimización de infraestructura hospitalaria y listas de espera de la CCSS.

## Repositorio Github  - Publico

https://github.com/salazaradrian/MongoDB_ProyectoFinal

## Requisitos

- Node.js
- MongoDB corriendo localmente (o una URI de Atlas)

## Instalación

```bash
npm install
```

## Uso

```bash
# Terminal 1: backend (puerto 3000)
npm run dev

# Terminal 2: frontend estático (puerto 5000)
npm run ui

# Opcional: cargar datos de ejemplo (5 pacientes, 4 hospitales)
npm run seed
```

Por defecto se conecta a `mongodb://localhost:27017/hospitalesDB`. Para usar MongoDB Atlas, definir la variable de entorno `MONGO_URI`.

## Endpoints

### `/api/pacientes`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/pacientes` | Lista todos (soporta `?cedula=`) |
| GET | `/api/pacientes/:id` | Obtiene uno |
| POST | `/api/pacientes` | Crea |
| PUT | `/api/pacientes/:id` | Actualiza (parcial) |
| DELETE | `/api/pacientes/:id` | Elimina |

### `/api/hospitales`

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/hospitales` | Lista todos |
| GET | `/api/hospitales/:id` | Obtiene uno |
| POST | `/api/hospitales` | Crea |
| PUT | `/api/hospitales/:id` | Actualiza (parcial) |
| DELETE | `/api/hospitales/:id` | Elimina |

## Estructura

```
src/
  app.js               # entrada de la app Express
  config/db.js         # conexión a MongoDB
  models/              # esquemas Mongoose (Paciente, Hospital)
  services/             # acceso a datos (usado por los controllers)
  controllers/          # lógica HTTP (req/res)
  routes/                # definición de rutas por recurso
  scripts/seed.js       # carga datos de ejemplo
  queries/consultas.mongodb.js  # playground de consultas MongoDB
```
