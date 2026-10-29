# Ch.Store — Backend

API REST en **Node.js + Express** con base de datos **SQLite** (módulo nativo `node:sqlite`,
requiere Node 22.13 o superior). No hay que instalar ni levantar ningún motor de base de
datos: el archivo `backend/data/chstore.db` se crea solo al arrancar y se llena con los
datos de `seed/datos.json` (4 categorías, 8 productos, 3 usuarios demo y 4 órdenes).

## Cómo ejecutarlo

Desde la raíz del repositorio:

```bash
npm run setup    # solo la primera vez
npm run dev      # API en http://localhost:3001/api y frontend en http://localhost:5173
```

Solo el backend: `cd backend && npm run dev`. Pruebas: `npm test` (10 pruebas con
`node:test`, sobre una base en memoria). Para volver a los datos iniciales se puede borrar
`backend/data/` o llamar a `POST /api/reiniciar`.

## Modelo de datos

| Tabla | Clave | Notas |
|---|---|---|
| `categorias` | `nombre` | |
| `productos` | `codigo` | `categoria` referencia a `categorias` (no se puede borrar una categoría con productos) |
| `usuarios` | `run` | `correo` único, sin distinguir mayúsculas |
| `ordenes` | `numero` | `items`, `datosEntrega` y `cupon` se guardan como JSON |

## Endpoints

Las colecciones son `categorias`, `productos`, `usuarios` y `ordenes`.

| Método | Ruta | Acción |
|---|---|---|
| GET | `/api/:coleccion` | Lista la colección |
| GET | `/api/:coleccion/:id` | Obtiene un registro |
| POST | `/api/:coleccion` | Crea un registro (`409` si ya existe o rompe una relación) |
| PUT | `/api/:coleccion/:id` | Actualiza los campos enviados |
| DELETE | `/api/:coleccion/:id` | Elimina un registro (`204`) |
| POST | `/api/productos/descontar-stock` | Descuenta unidades vendidas: `{ "items": [{ "codigo", "cantidad" }] }` |
| POST | `/api/reiniciar` | Restaura los datos iniciales |
| GET | `/api/salud` | Comprueba que el servidor responde |

## Alcance actual

La sesión sigue siendo simulada (el usuario se identifica por su correo y la contraseña solo
se valida en formato, igual que en la entrega 2): el backend persiste los datos, pero aún no
autentica ni protege las rutas por perfil.
