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

Solo el backend: `cd backend && npm run dev`. Para volver a los datos iniciales se puede borrar
`backend/data/` o llamar a `POST /api/reiniciar` como administrador.

Cuentas demo (contraseña `demo1234`, configurable con la variable `DEMO_PASSWORD` antes de
crear la base): `admin@duoc.cl`, `vendedor@duoc.cl` y `cliente@gmail.com`.

## Autenticación

- **Contraseñas:** se guardan con `scrypt` y una sal distinta por usuario (`password_hash`); la
  API nunca las devuelve.
- **Sesión:** `POST /api/auth/login` entrega un token aleatorio de 256 bits que el frontend envía
  como `Authorization: Bearer <token>`. En la base solo se guarda su hash SHA-256 (tabla
  `sesiones`) y vence a las 8 horas. Cerrar sesión o eliminar al usuario lo invalida.
- **Intentos fallidos:** 5 fallos seguidos con el mismo correo desde la misma IP bloquean el login
  15 minutos (`429` con `Retry-After`). Un usuario inexistente y una contraseña incorrecta dan el
  mismo mensaje y tardan lo mismo.
- **Registro público:** `POST /api/auth/registro` solo crea clientes, sin importar el perfil que
  se envíe.

## Permisos por perfil

| Recurso | Sin sesión | Cliente | Vendedor | Administrador |
|---|---|---|---|---|
| Leer productos y categorías | sí | sí | sí | sí |
| Crear, editar y eliminar productos y categorías | no | no | no | sí |
| Comprar (`POST /ordenes`) | sí | sí | sí | sí |
| Leer órdenes y cambiar su estado | no | no | sí | sí |
| Eliminar órdenes | no | no | no | sí |
| Leer y gestionar usuarios | no | no | no | sí |
| Leer y editar la propia cuenta | — | sí | sí | sí |
| Reiniciar los datos | no | no | no | sí |

Al editar su propia cuenta, un usuario que no es administrador no puede cambiar su RUN, su correo
ni su perfil, ni su contraseña. Sin sesión responde `401`; con una sesión sin permiso, `403`.

Las órdenes de un comprador sin sesión solo pueden quedar como `Pendiente de despacho` o
`Pago rechazado`. Al registrar una orden aprobada el servidor descuenta el stock en la misma
transacción (el stock nunca baja de cero).

## Modelo de datos

| Tabla | Clave | Notas |
|---|---|---|
| `categorias` | `nombre` | |
| `productos` | `codigo` | `categoria` referencia a `categorias` (no se puede borrar una categoría con productos) |
| `usuarios` | `run` | `correo` único, sin distinguir mayúsculas; `password_hash` |
| `ordenes` | `numero` | `items`, `datosEntrega` y `cupon` se guardan como JSON |
| `sesiones` | `token_hash` | pertenece a un usuario y se borra con él |

## Endpoints

Las colecciones son `categorias`, `productos`, `usuarios` y `ordenes`.

| Método | Ruta | Acción |
|---|---|---|
| POST | `/api/auth/login` | `{ correo, password }` → `{ token, usuario }` |
| POST | `/api/auth/registro` | Crea un cliente: datos del usuario + `password` |
| POST | `/api/auth/logout` | Cierra la sesión actual |
| GET | `/api/auth/yo` | Usuario de la sesión actual |
| GET | `/api/:coleccion` | Lista la colección |
| GET | `/api/:coleccion/:id` | Obtiene un registro |
| POST | `/api/:coleccion` | Crea un registro (`409` si ya existe o rompe una relación); para usuarios exige `password` |
| PUT | `/api/:coleccion/:id` | Actualiza los campos enviados (el administrador puede incluir `password`) |
| DELETE | `/api/:coleccion/:id` | Elimina un registro (`204`) |
| POST | `/api/reiniciar` | Restaura los datos iniciales |
| GET | `/api/salud` | Comprueba que el servidor responde |

## Pruebas

`npm test` ejecuta 33 pruebas con `node:test` sobre una base en memoria: CRUD, restricciones de
integridad, login, bloqueo por intentos, vencimiento y cierre de sesión, que las contraseñas y
tokens no queden en claro, registro, y los permisos de cada perfil.

## Límites conocidos

- El pago es simulado: el servidor confía en el total y los precios que envía el frontend al
  registrar una orden.
- El token se guarda en `localStorage` del navegador; no hay cookies `HttpOnly` ni HTTPS en
  desarrollo.
- La contraseña se valida con la regla del curso (4 a 64 caracteres), que es débil para un
  sistema real.
