# Ch.Store — Tienda online

Proyecto de la asignatura **DSY1104 — Desarrollo Full Stack I**, Evaluación Parcial 1 (30%).

Tienda online de ropa femenina desarrollada con **HTML5, CSS3 y JavaScript puro**, sin
frameworks ni backend. El sistema se compone de dos módulos: la tienda pública y el
panel de administración.

---

## Integrantes

| Integrante | Responsabilidad |
|---|---|
| Javiera Rojas | Catálogo y carrito en JavaScript, validaciones, módulo administrador, documentación ERS |
| M. Rozas | Diseño visual, estructura HTML, hoja de estilos, portada con video, logo, carrito con cupones y código de envío |

---

> **Entrega 3 (rama `entrega-3-backend`):** el frontend React se conecta a un backend propio
> (Node + Express) con base de datos SQLite. Todo se levanta con un solo comando; ver
> [`backend/README.md`](backend/README.md).
>
> **Entrega 2:** la versión en React con Bootstrap, el panel ampliado y las pruebas con
> Jasmine y Karma están en [`frontend-react/`](frontend-react/README.md) (rama
> `entrega-2-react`). Los documentos actualizados son `docs/ERS-v2.md` y
> `docs/cobertura-testing.md`. La versión 1, en HTML y JavaScript puro, se conserva en [`legacy/`](legacy/); lo que sigue la describe y sus rutas son relativas a esa carpeta.

## Cómo ejecutar el proyecto

El sitio es estático, pero el detalle de producto lee parámetros de la URL, por lo que
conviene servirlo desde un servidor local en lugar de abrir los archivos directamente.

```bash
# Desde la carpeta legacy/
cd legacy
python3 -m http.server 8000
```

Luego abrir <http://localhost:8000> en el navegador.

También funciona con la extensión **Live Server** de Visual Studio Code.

---

## Estructura del proyecto

```
.
├── index.html              Home de la tienda
├── productos.html          Listado de productos con filtro por categoría
├── producto.html           Detalle de producto (recibe ?codigo=XXX)
├── carrito.html            Carrito de compras
├── registro.html           Registro de usuario
├── login.html              Inicio de sesión
├── nosotros.html           Información de la empresa y del equipo
├── contacto.html           Formulario de contacto
├── blogs.html              Listado de artículos
├── detalle_blogs1.html     Detalle del primer artículo
├── detalle_blogs2.html     Detalle del segundo artículo
├── styles.css              Hoja de estilos de la tienda
├── img/                    Logo y video de la portada
│
├── admin/
│   ├── index.html          Tablero con indicadores y alerta de stock crítico
│   ├── productos.html      Listado del mantenedor de productos
│   ├── producto-form.html  Alta y edición de productos
│   ├── usuarios.html       Listado del mantenedor de usuarios
│   ├── usuario-form.html   Alta y edición de usuarios
│   ├── ordenes.html        Consulta de órdenes
│   └── admin.css           Estilos del panel
│
├── js/
│   ├── productos.js        Catálogo de productos y funciones de renderizado
│   ├── regiones.js         Regiones y comunas de Chile, con carga en cascada
│   ├── validaciones.js     Validadores reutilizables (RUN, correo, longitudes)
│   ├── datos.js            Usuarios, sesión y órdenes compartidos con el panel
│   ├── carrito.js          Carrito con localStorage, tallas, cupones y compra
│   ├── app.js              Inicialización de las vistas de la tienda
│   └── admin.js            Mantenedores, roles y tablero del panel
│
└── docs/
    ├── ERS-v1.md                   Especificación de Requisitos del Software
    ├── ERS - Ch.Store - Version 1.docx
    ├── planilla-requerimientos.md  Los 15 requerimientos del sistema
    └── Anexo 2 - Planilla de Requerimientos - Ch.Store.xlsx
```

---

## Reglas de validación implementadas

### Correo electrónico
Solo se aceptan los dominios `@duoc.cl`, `@profesor.duoc.cl` y `@gmail.com`, con un
máximo de 100 caracteres.

### RUN
Se ingresa sin puntos ni guion (por ejemplo `19011029K`), entre 7 y 9 caracteres, y se
valida el **dígito verificador con el algoritmo módulo 11**.

> **Nota:** el ejemplo `19011022K` que aparece en el enunciado ilustra el formato, pero no
> es un RUN matemáticamente válido: su dígito verificador real es `2`. Por eso los
> ejemplos del sistema usan `19011029K`, que sí cumple el módulo 11.

### Producto
| Campo | Regla |
|---|---|
| Código | Requerido, mínimo 3 caracteres, único |
| Nombre | Requerido, máximo 100 caracteres |
| Descripción | Opcional, máximo 500 caracteres |
| Precio | Requerido, mínimo 0, admite decimales |
| Stock | Requerido, entero, mínimo 0 |
| Stock crítico | Opcional, entero, mínimo 0 |
| Categoría | Requerido, select |
| Imagen | Opcional |

### Usuario
| Campo | Regla |
|---|---|
| RUN | Requerido, 7 a 9 caracteres, dígito verificador válido, único |
| Nombre | Requerido, máximo 50 caracteres |
| Apellidos | Requerido, máximo 100 caracteres |
| Correo | Requerido, máximo 100, dominio autorizado |
| Fecha de nacimiento | Opcional |
| Tipo de usuario | Requerido (solo en el panel de administración) |
| Región y comuna | Requeridos, la comuna se carga según la región |
| Dirección | Requerido, máximo 300 caracteres |

### Registro de usuario (tienda)
Mismas reglas del usuario, más contraseña (4 a 10 caracteres) con su confirmación y
teléfono opcional (8 a 15 dígitos). La cuenta queda con perfil Cliente. El RUN y el
correo no pueden repetirse.

### Contacto
Nombre requerido (máx. 100), correo opcional con dominio autorizado (máx. 100) y
comentario requerido (máx. 500, con contador de caracteres).

### Inicio de sesión
Correo requerido con dominio autorizado y contraseña entre 4 y 10 caracteres. El correo
debe pertenecer a un usuario registrado; su perfil define si entra al panel o vuelve a la
tienda.

---

## Reglas de negocio del carrito

El carrito persiste en `localStorage` bajo la clave `chstore_carrito`.

1. Un producto sin stock no puede agregarse.
2. La cantidad mínima por producto es 1.
3. La cantidad máxima por producto es su stock disponible, sumando todas sus tallas.
4. Si el producto ya está en el carrito en la misma talla, la cantidad se suma sin superar el stock.
5. Al bajar la cantidad a 0 el producto se elimina.
6. El carrito sobrevive al cierre del navegador.
7. Solo puede haber un cupón de descuento activo a la vez.
8. Al confirmar el pago se genera un código de envío (`CH-XXXXXX`), la orden queda
   registrada para el panel, se descuenta el stock del catálogo y el carrito se vacía.

Para agregar un producto hay que elegir su talla (S, M o L).

**Cupones disponibles para pruebas:** `DESCUENTO20` (20%), `CHSTORE10` (10%),
`BIENVENIDA10` (10%), `DUOC15` (15%) y `VERANO20` (20%).

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| **Administrador** | Acceso total: productos, usuarios, órdenes y tablero |
| **Vendedor** | Solo consulta de productos y de órdenes; el resto del menú no aparece |
| **Cliente** | Solo la tienda pública, sin acceso al panel |

El perfil se obtiene al iniciar sesión. Las páginas del panel revisan la sesión antes de
mostrarse: sin sesión, o con perfil Cliente, se vuelve al inicio de sesión; un Vendedor
que abre una página de Administrador vuelve al tablero.

### Usuarios de prueba

| Correo | Perfil |
|---|---|
| `admin@duoc.cl` | Administrador |
| `vendedor@duoc.cl` | Vendedor |
| `cliente@gmail.com` | Cliente |

Son cuentas de demostración, sin datos de personas reales.

La sesión es **simulada**: se identifica al usuario por su correo y la contraseña solo se
valida en formato (4 a 10 caracteres), porque las contraseñas no se guardan en
`localStorage` (RNF-07). La autenticación real llega con el backend.

### Datos en `localStorage`

| Clave | Contenido |
|---|---|
| `chstore_carrito` | Productos del carrito con talla y cantidad |
| `chstore_cupon` | Cupón activo |
| `chstore_productos_admin` | Catálogo compartido por la tienda y el panel |
| `chstore_usuarios` | Usuarios del sistema (sin contraseñas) |
| `chstore_sesion` | Usuario con sesión iniciada y su perfil |
| `chstore_ordenes` | Órdenes generadas por compras en la tienda |

---

## Alcance de esta entrega

**Incluido:** las 11 vistas de la tienda, las 6 vistas del panel, todas las validaciones
de formularios con JavaScript, el carrito con `localStorage`, el inicio de sesión
simulado con control de acceso por perfil, un catálogo único para la tienda y el panel,
y el diseño responsivo.

**Fuera de alcance (evaluaciones siguientes):** backend y base de datos, autenticación
real con sesiones, pasarela de pago, gestión de órdenes reales y pruebas automatizadas.

**Limitaciones conocidas:** como todo vive en el navegador, cada equipo tiene su propia
copia de los datos y el control de acceso es preventivo, no una barrera de seguridad.
Ambas cosas se resuelven con el backend y la base de datos de la siguiente etapa.
