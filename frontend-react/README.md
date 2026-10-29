# Ch.Store — Frontend en React

Migración de la tienda Ch.Store (HTML, CSS y JavaScript puro) a **React** con **Bootstrap 5**,
para la Evaluación Parcial 2 de **DSY1104 — Desarrollo Full Stack II**.

## Cómo ejecutarlo

```bash
cd frontend-react
npm install
npm run dev      # http://localhost:5173
npm run build    # versión de producción en dist/
```

Usuarios de demostración (la sesión se identifica por el correo; la contraseña solo se
valida en formato, de 4 a 10 caracteres):

| Correo | Perfil |
|---|---|
| admin@duoc.cl | Administrador (acceso total al panel en `/admin`) |
| vendedor@duoc.cl | Vendedor (productos y órdenes, solo consulta) |
| cliente@gmail.com | Cliente |

Cupones disponibles: `DESCUENTO20`, `CHSTORE10`, `BIENVENIDA10`, `VERANO20`, `DUOC15`.
En el checkout, el resultado del pago se elige en pantalla (aprobado o rechazado) para
poder probar ambos caminos.

### Con backend y base de datos

Desde la raíz del repositorio, un solo comando levanta la API (puerto 3001) y el frontend
(puerto 5173). La base de datos se crea sola. El archivo `.env` activa el modo API
(`VITE_API_URL=/api`); Vite reenvía `/api` al backend. Si el backend no responde, la
tienda sigue funcionando con localStorage. Las pruebas unitarias siempre usan localStorage.

```bash
npm run setup    # solo la primera vez: instala las tres carpetas
npm run dev
```

## Pruebas unitarias (Jasmine + Karma)

```bash
npm test             # una ejecución con reporte de cobertura (requiere Google Chrome)
npm run test:watch   # modo continuo
```

Resultado actual: **138 pruebas, todas aprobadas; 95% de cobertura de líneas.** El reporte
HTML queda en `coverage/`. Detalle en [`../docs/cobertura-testing.md`](../docs/cobertura-testing.md).

Si Chrome no está en la ruta habitual de macOS, define `CHROME_BIN` con la ruta del ejecutable.

## Estructura

```
src/
├── App.jsx                 Mapa de rutas de la tienda y del panel
├── main.jsx                Arranque: enrutador, contextos y Bootstrap
├── components/             Componentes reutilizables (Boton, CampoFormulario, ProductCard,
│                           ProductList, TablaItems, Navbar, LayoutTienda, LayoutAdmin, RutaAdmin...)
├── pages/                  Una vista por ruta de la tienda
│   └── admin/              Vistas del panel de administración
├── context/                CarritoContext y SesionContext (estado compartido)
├── hooks/useColeccion.js   Entrega una colección de la base simulada y se actualiza sola
├── data/
│   ├── db.js               Fuente de datos simulada: CRUD sobre localStorage
│   ├── productosBase.js    Catálogo inicial
│   └── blogs.js            Artículos del blog
├── utils/                  Reglas de negocio como funciones puras
│   ├── validaciones.js     RUN, correo, rangos, números
│   ├── carrito.js          Reglas del carrito, cupones y totales
│   ├── pago.js             Validación del checkout y armado de órdenes
│   ├── admin.js            Permisos por rol, indicadores y reportes
│   ├── regiones.js         Regiones y comunas de Chile
│   └── formato.js          Formato de precios
└── tests/                  Pruebas Jasmine (*.spec.js / *.spec.jsx) y utilidades
```

## Rutas

| Tienda | Panel (requiere sesión de Administrador o Vendedor) |
|---|---|
| `/` Home | `/admin` Dashboard |
| `/productos` (filtros y `?q=`) | `/admin/ordenes`, `/admin/ordenes/:numero` (boleta) |
| `/producto/:codigo` | `/admin/productos`, `/nuevo`, `/:codigo/editar`, `/criticos` |
| `/categorias`, `/categorias/:nombre` | `/admin/categorias`, `/nueva`, `/:nombre/editar` |
| `/ofertas` | `/admin/usuarios`, `/nuevo`, `/:run/editar`, `/:run/historial` |
| `/carrito`, `/checkout` | `/admin/reportes` |
| `/pago-exitoso/:numero`, `/pago-error/:numero` | `/admin/perfil` |
| `/login`, `/registro`, `/nosotros`, `/blogs`, `/blogs/:id`, `/contacto` | |
