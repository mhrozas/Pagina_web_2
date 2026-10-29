# Especificación de Requisitos del Software (ERS)
## Sistema Ch.Store — Tienda online (frontend en React)

**Asignatura:** DSY1104 — Desarrollo Full Stack II
**Evaluación:** Parcial 2 (30%)
**Versión:** 2.0 (propuesta terminada)
**Fecha:** 28 de octubre de 2026

### Ficha del documento

| Fecha | Revisión | Autor | Modificación |
|---|---|---|---|
| 30-09-2026 | 1.0 | Javiera Rojas | Versión inicial del documento. Secciones 1, 2 y 3 desarrolladas para la entrega 1. |
| 19-10-2026 | 1.1 | Javiera Rojas, M. Rozas | Integración del diseño visual de la tienda con la lógica JavaScript. Inicio de sesión con perfil, catálogo único para tienda y panel, y registro de órdenes. |
| 28-10-2026 | 2.0 | Javiera Rojas, M. Rozas | Migración del frontend a React con Bootstrap. Nuevas vistas de la tienda (categorías, ofertas, checkout, pago exitoso y pago con error) y del panel (órdenes y boleta, productos críticos, categorías, historial de compras, reportes y perfil). Fuente de datos simulada con CRUD y persistencia. Estrategia de pruebas con Jasmine y Karma (sección 3.5). Se reescriben las restricciones y los requisitos no funcionales afectados. |

> **Alcance de esta versión:** el documento queda terminado para la entrega 2, que se
> centra en el frontend. Las interfaces de software y de comunicación con un backend
> (3.1.3 y 3.1.4) siguen fuera de alcance: los datos se simulan en JavaScript y se
> guardan en el navegador.

---

# 1. Introducción

## 1.1 Propósito

Especificar los requisitos del sistema **Ch.Store**, una tienda online de ropa femenina,
en su versión 2: describe qué debe hacer el sistema, bajo qué restricciones y con qué
criterios se considerará satisfecho cada requisito, incluida la estrategia de pruebas que
lo verifica.

Está dirigido al **equipo de desarrollo**, al **cliente** (Ch.Store) y al **docente de la
asignatura**.

## 1.2 Ámbito del Sistema

**Qué hará el sistema:**

- Exhibir un catálogo de productos, con búsqueda, filtros por categoría y por stock, orden
  por precio, vista de categorías y vista de ofertas.
- Permitir armar un carrito (con talla, cupones y persistencia) y completar una compra en
  un paso de pago con datos del cliente y dirección de entrega.
- Mostrar el resultado del pago (exitoso, con boleta, o con error y posibilidad de reintento).
- Permitir el registro y el inicio de sesión (simulado) de usuarios.
- Recibir consultas por un formulario de contacto y publicar artículos de blog.
- Entregar al personal un panel de administración para mantener productos, categorías y
  usuarios, consultar órdenes y boletas, ver el historial de compras de cada usuario,
  detectar productos en stock crítico y revisar reportes.
- Restringir las funciones del panel según el perfil (Administrador o Vendedor).

**Qué no hará el sistema en esta versión:**

- No procesa pagos reales: el resultado del pago se simula.
- No tiene backend ni base de datos real; la fuente de datos es un módulo JavaScript con
  persistencia en `localStorage`.
- No envía correos; "enviar boleta por email" abre el cliente de correo del usuario.
- No autentica con contraseña real: la sesión se identifica por el correo (RNF-07).

**Objetivos:**

| Objetivo | Meta |
|---|---|
| Ofrecer una experiencia de compra completa de punta a punta | Del catálogo a la boleta sin salir de la aplicación |
| Centralizar la gestión del negocio | Un único panel para productos, categorías, usuarios y órdenes |
| Disminuir los quiebres de stock | Alerta y listado de productos críticos |
| Asegurar la calidad del frontend | Pruebas unitarias automatizadas con cobertura superior al 90% de líneas |

## 1.3 Definiciones, Acrónimos y Abreviaturas

| Término | Definición |
|---|---|
| **ERS** | Especificación de Requerimientos de Software. |
| **SPA** | Aplicación de una sola página: el navegador carga una vez la aplicación y la navegación ocurre sin recargar. |
| **Componente** | Función de React que recibe propiedades (props) y devuelve parte de la interfaz. |
| **Props / Estado** | Datos que un componente recibe de su padre (props) y datos que administra por sí mismo (estado). |
| **Contexto** | Mecanismo de React para compartir estado (carrito, sesión) entre componentes sin pasarlo por props. |
| **Bootstrap** | Framework CSS que aporta el sistema de grilla y los componentes responsivos. |
| **Jasmine / Karma** | Framework de pruebas (Jasmine) y ejecutor que las corre en un navegador real (Karma). |
| **Mock / Espía (spy)** | Reemplazo controlado de una dependencia para probar un componente de forma aislada. |
| **Cobertura** | Porcentaje del código fuente ejecutado por las pruebas. |
| **RUN** | Rol Único Nacional. Su último carácter es el dígito verificador (módulo 11). |
| **Stock crítico** | Cantidad a partir de la cual un producto necesita reposición. |
| **Cupón** | Código que aplica un descuento porcentual sobre el subtotal. |

## 1.4 Referencias

| Documento | Fuente |
|---|---|
| DSY1104 Evaluación Parcial 2 — Anexo 1: Instrucciones | Escuela de Administración y Negocios |
| DSY1104 Evaluación Parcial 2 — Pauta de evaluación | Subdirección de Evaluación de Resultados de Aprendizaje |
| ERS Ch.Store versión 1.1 (`docs/ERS-v1.md`) | Equipo de desarrollo |
| Documento de cobertura del testing (`docs/cobertura-testing.md`) | Equipo de desarrollo |
| IEEE Std 830-1998 | IEEE |
| Documentación de React, React Router, Bootstrap, Jasmine y Karma | Sitios oficiales |

## 1.5 Visión General del Documento

La **sección 1** introduce el propósito y el alcance. La **sección 2** describe el contexto
del producto. La **sección 3** contiene los requisitos específicos: interfaces, funcionales,
no funcionales, otros requisitos y la estrategia de pruebas.

---

# 2. Descripción General

## 2.1 Perspectiva del Producto

Ch.Store es un producto independiente. En la versión 2 es una **aplicación de una sola
página (SPA)** construida con React, con dos áreas que comparten componentes, datos y reglas:

```
┌────────────────────────────────────────────────────────────────┐
│                         CH.STORE (React)                        │
│                                                                 │
│  ┌──────────────────────┐        ┌───────────────────────────┐ │
│  │    TIENDA PÚBLICA    │        │   PANEL DE ADMINISTRACIÓN │ │
│  │ Home · Productos     │        │ Dashboard · Órdenes       │ │
│  │ Detalle · Categorías │        │ Boleta · Productos        │ │
│  │ Ofertas · Carrito    │        │ Críticos · Categorías     │ │
│  │ Checkout · Pago ok   │        │ Usuarios · Historial      │ │
│  │ Pago con error       │        │ Reportes · Perfil         │ │
│  │ Login · Registro     │        │ (acceso por perfil)       │ │
│  │ Nosotros · Blogs     │        │                           │ │
│  │ Contacto             │        │                           │ │
│  └──────────┬───────────┘        └─────────────┬─────────────┘ │
│             └─────────────┬────────────────────┘               │
│        ┌──────────────────▼───────────────────┐                │
│        │ COMPONENTES REUTILIZABLES (components)│                │
│        │ CONTEXTOS: CarritoContext, SesionContext               │
│        │ HOOK: useColeccion                    │                │
│        └──────────────────┬───────────────────┘                │
│        ┌──────────────────▼───────────────────┐                │
│        │ utils/: validaciones, carrito (reglas │                │
│        │ puras), pago, admin, regiones, formato│                │
│        └──────────────────┬───────────────────┘                │
│        ┌──────────────────▼───────────────────┐                │
│        │ data/db.js: CRUD sobre productos,     │                │
│        │ categorías, usuarios y órdenes        │                │
│        └──────────────────┬───────────────────┘                │
│                  LOCALSTORAGE DEL NAVEGADOR                     │
└────────────────────────────────────────────────────────────────┘
```

**Arquitectura de componentes.** Cada componente tiene una única responsabilidad:

| Capa | Archivos | Responsabilidad |
|---|---|---|
| Presentación reutilizable | `components/` (`Boton`, `CampoFormulario`, `ProductCard`, `ProductList`, `Precio`, `TablaItems`, `FilaCarrito`, `ResumenTotales`, `SelectorRegionComuna`, `Alerta`, `MensajeError`, `ConfirmarEliminar`, `TarjetaIndicador`) | Reciben datos y funciones por props; solo manejan estado cuando es necesario |
| Estructura | `Navbar`, `Footer`, `Buscador`, `LayoutTienda`, `LayoutAdmin`, `RutaAdmin` | Encabezado, pie, menú lateral y control de acceso |
| Vistas | `pages/` y `pages/admin/` | Una vista por ruta; combinan componentes y datos |
| Estado compartido | `context/` | Carrito y cupón; sesión y perfil |
| Reglas de negocio | `utils/` | Funciones puras, sin DOM ni almacenamiento, fáciles de probar |
| Datos | `data/db.js` | Fuente de datos simulada con CRUD, consultas y suscripción a cambios |

**Flujos de navegación** (según las Figuras 2, 3 y 10 de las instrucciones):

- Tienda: Home → Productos → Detalle → Carrito → Checkout → Pago exitoso / Pago con error;
  Categorías → Categoría; Ofertas; Registro / Login; Nosotros; Blogs → Detalle; Contacto.
- Panel: Dashboard → Órdenes → Boleta; Productos → Nuevo / Editar / Críticos;
  Categorías → Nueva / Editar; Usuarios → Nuevo / Editar / Historial de compras;
  Reportes; Perfil.

## 2.2 Funciones del Producto

| Módulo | Función | Descripción resumida |
|---|---|---|
| Catálogo | Listar y filtrar | Búsqueda por texto, categoría, solo con stock y orden por precio |
| Catálogo | Ver detalle | Ficha con galería, talla, cantidad y botón de compra |
| Catálogo | Categorías y ofertas | Vistas que separan los productos por categoría y muestran los que tienen descuento |
| Compra | Gestionar carrito | Agregar, cambiar cantidades, eliminar, vaciar y aplicar cupón |
| Compra | Checkout | Datos del cliente y dirección de entrega; se autocompletan con la sesión |
| Compra | Resultado del pago | Boleta de compra exitosa o pantalla de pago con error y reintento |
| Cuentas | Registro e inicio de sesión | Validaciones completas; sesión simulada con perfil |
| Comunicación | Contacto y blog | Formulario validado y artículos con detalle |
| Administración | Mantenedores | Productos, categorías y usuarios con CRUD completo |
| Administración | Órdenes y boletas | Listado con filtro por estado, boleta imprimible y cambio de estado |
| Administración | Críticos, historial y reportes | Productos por reponer, compras por usuario, ingresos y más vendidos |
| Seguridad | Control de acceso | Rutas y menú según el perfil activo |

## 2.3 Características de los Usuarios

| Perfil | Experiencia | Responsabilidad | Frecuencia |
|---|---|---|---|
| **Administrador** | Usuario intermedio, planillas | Acceso total: productos, categorías, usuarios, órdenes y reportes | Diaria |
| **Vendedor** | Usuario básico | Consulta productos y órdenes; no modifica información | Diaria |
| **Cliente** | Usuario habitual de comercio electrónico y móvil | Navega, compra y revisa su sesión | Ocasional |

## 2.4 Restricciones

| Ámbito | Restricción |
|---|---|
| **Tecnología** | Frontend con **React** (Vite) y **Bootstrap 5** para el diseño responsivo; enrutamiento con React Router. |
| **Datos** | No hay servidor ni base de datos: la fuente de datos es el módulo `data/db.js` y la persistencia ocurre en `localStorage`. |
| **Pruebas** | Las pruebas unitarias se escriben con **Jasmine** y se ejecutan con **Karma** en Chrome. |
| **Hardware** | Debe operar en equipos de gama baja y teléfonos móviles. |
| **Navegadores** | Versiones actuales de Chrome, Firefox y Edge. |
| **Control de versiones** | Repositorio público de GitHub con commits descriptivos y aporte verificable de cada integrante. |
| **Seguridad** | Sin servidor, las validaciones y el control de acceso son del lado del cliente: tienen carácter preventivo, no de seguridad real. |
| **Criticidad** | No se manejan datos financieros ni sensibles. |

## 2.5 Suposiciones y Dependencias

- Los usuarios acceden desde un navegador con JavaScript y `localStorage` habilitados.
- Las imágenes de los productos se alojan en servicios externos mediante URL; el logo y el
  video de portada están en `public/img/`.
- El listado de regiones y comunas se mantiene estable (`utils/regiones.js`).
- Dependencias de ejecución: `react`, `react-dom`, `react-router-dom`, `bootstrap` y
  `bootstrap-icons`. Dependencias de prueba: `jasmine-core`, `karma`, `karma-jasmine`,
  `karma-chrome-launcher`, `karma-webpack`, `karma-coverage`, `karma-spec-reporter`,
  `webpack` y Babel.
- Se necesita Node.js para instalar y compilar, y Google Chrome para ejecutar las pruebas.

## 2.6 Requisitos Futuros

1. **Backend y base de datos** que reemplacen `data/db.js`: la capa de datos ya está
   aislada, por lo que el cambio no alteraría los componentes.
2. **Autenticación real** con contraseñas cifradas y sesiones en el servidor.
3. **Pasarela de pago** real que reemplace el resultado simulado.
4. **Envío de boletas por correo** desde el servidor.
5. **Carga de imágenes** desde el panel.
6. **Reportes exportables** y gráficos.
7. **Pruebas de extremo a extremo** y accesibilidad WCAG 2.1 AA.

---

# 3. Requisitos Específicos

## 3.1 Requisitos comunes de las interfaces

### 3.1.1 Interfaces de usuario

**Tienda pública:** barra superior con logo, buscador, menú (Home, Productos, Categorías
con desplegable, Ofertas, Nosotros, Blog, Contacto), botón de carrito con total y número de
unidades, y accesos de sesión. En pantallas pequeñas el menú se colapsa en un botón
hamburguesa. Contenido central en contenedor Bootstrap y pie con enlaces secundarios.

**Panel de administración:** barra superior oscura, menú lateral según el rol y área de
contenido. En móvil el menú lateral pasa a ser desplegable. Listados en tablas responsivas
y altas/ediciones en formularios.

**Convenciones comunes:**

| Elemento | Definición |
|---|---|
| Sistema de diseño | Bootstrap 5 y Bootstrap Icons |
| Grilla de productos | 1 columna en móvil, 2 en tablet, 4 en escritorio |
| Campos obligatorios | Asterisco rojo junto a la etiqueta |
| Mensajes de error | Bajo el campo afectado (`is-invalid` / `invalid-feedback`), nunca en ventanas emergentes |
| Confirmaciones | Avisos (`alert`) con color según el resultado; las eliminaciones piden confirmación |
| Impresión | La boleta se imprime ocultando encabezado, menús y botones |

### 3.1.2 Interfaces de hardware

Computadores desde 1024 px de ancho, tablets en ambas orientaciones y teléfonos desde
360 px. Los controles deben poder accionarse con pantalla táctil.

### 3.1.3 Interfaces de software

| Producto | Propósito | Interfaz |
|---|---|---|
| Navegador web (`localStorage`) | Persistir datos | JSON bajo las claves `chstore_productos`, `chstore_categorias`, `chstore_usuarios`, `chstore_ordenes`, `chstore_carrito`, `chstore_cupon` y `chstore_sesion` |
| Cliente de correo del usuario | Enviar la boleta | Enlace `mailto:` con el correo del cliente y el número de orden |

### 3.1.4 Interfaces de comunicación

No hay comunicación con otros sistemas en esta versión.

## 3.2 Requisitos funcionales

La columna **Pruebas** indica dónde se verifica cada requisito (detalle en el documento de
cobertura). Las abreviaturas son: **VAL** `validaciones.spec.js`, **CAR** `carrito.spec.js`,
**DB** `db.spec.js`, **COMP** `componentes.spec.jsx`, **PAG** `paginas.spec.jsx`,
**ADM** `admin.spec.js`, **ADP** `admin-paginas.spec.jsx`, **NAV** `navegacion.spec.jsx`.

### Tienda

| ID | Requisito | Entradas | Proceso y salidas | Situaciones anormales | Pruebas |
|---|---|---|---|---|---|
| RF-01 | **Listar y filtrar el catálogo.** | Texto de búsqueda (`?q=`), categoría, "solo con stock", orden por precio | Se filtra el catálogo y se muestra una tarjeta por producto en una grilla responsiva | Sin coincidencias: "No hay productos que coincidan con los filtros." | PAG, COMP, NAV |
| RF-02 | **Mostrar el detalle de un producto.** | Código en la ruta `/producto/:codigo` | Ficha con galería, categoría, descripción, precio con oferta, stock, talla y cantidad | Código inexistente: aviso y enlace al catálogo | PAG, NAV |
| RF-03 | **Agregar al carrito.** | Código, talla (S, M, L) y cantidad | Reglas R1–R4: sin stock no se agrega, cantidad mínima 1, tope por stock sumando tallas, misma talla suma cantidades | Producto agotado: botón deshabilitado. Cantidad sobre el stock: se ajusta y se informa | CAR, PAG |
| RF-04 | **Persistir el carrito.** | Contenido del carrito | Se guarda en `localStorage` en cada cambio y se recupera al cargar | Dato corrupto: carrito vacío sin interrumpir la navegación | PAG, NAV |
| RF-05 | **Modificar el carrito.** | Línea y acción | Sumar, restar (al llegar a 0 se elimina), eliminar y limpiar; totales recalculados | Cantidad máxima = stock disponible | CAR, PAG |
| RF-06 | **Aplicar un cupón.** | Código | Se normaliza a mayúsculas; un solo cupón activo; descuento porcentual sobre el subtotal | Cupón inexistente o carrito vacío: aviso sin cambiar el total | CAR, PAG |
| RF-07 | **Registrar un usuario.** | RUN, nombre, apellidos, correo, contraseña y confirmación, teléfono, región, comuna, dirección | Validación por campo; se guarda con perfil Cliente y sin contraseña | RUN o correo duplicados se informan en el campo | VAL, DB, PAG |
| RF-08 | **Validar el RUN.** | RUN sin puntos ni guion, 7 a 9 caracteres | Módulo 11 con serie 2–7; 11 equivale a 0 y 10 a K | Mensaje distinto para formato, largo y dígito verificador | VAL |
| RF-09 | **Iniciar y cerrar sesión.** | Correo y contraseña (4 a 10 caracteres) | Se busca el correo entre los usuarios y se guarda la sesión con su perfil; Administrador y Vendedor van al panel | Formato inválido o correo no registrado: error en pantalla | PAG, NAV |
| RF-10 | **Enviar un mensaje de contacto.** | Nombre, correo (opcional), comentario (máx. 500) | Validación y contador de caracteres; confirmación y limpieza | Campos inválidos impiden el envío | PAG |
| RF-11 | **Listar categorías.** | Ruta `/categorias` o `/categorias/:nombre` | Tarjetas de categorías y sus productos; con nombre, solo esa categoría | Categoría inexistente: aviso | NAV |
| RF-12 | **Mostrar ofertas.** | — | Lista los productos con descuento mayor a 0, con precio original tachado y precio final | Sin ofertas: mensaje | PAG, COMP, DB |
| RF-13 | **Realizar el checkout.** | Nombre, apellidos, correo, calle, departamento (opcional), región, comuna, indicaciones (opcional) | Resumen del carrito y formulario validado; los datos se autocompletan si hay sesión; comuna en cascada según la región | Carrito vacío: no permite pagar. Campos inválidos: no se registra la orden | PAG, ADM |
| RF-14 | **Confirmar la compra y mostrar su resultado.** | Compra con resultado simulado (aprobado o rechazado) | Aprobado: código `CH-XXXXXX`, orden registrada, stock descontado, carrito vaciado y boleta con opción de imprimir y enviar por correo. Rechazado: intento registrado como "Pago rechazado", carrito y stock intactos y botón "Volver a realizar el pago" | Orden inexistente: aviso | PAG, CAR |
| RF-15 | **Mostrar nosotros y blogs.** | — | Páginas informativas y artículos con listado, detalle y siguiente lectura | Artículo inexistente: aviso | NAV |

### Panel de administración

| ID | Requisito | Entradas | Proceso y salidas | Situaciones anormales | Pruebas |
|---|---|---|---|---|---|
| RF-16 | **Controlar el acceso por perfil.** | Perfil de la sesión | Sin sesión o con perfil Cliente: redirige al login con aviso. El menú y las rutas dependen del rol (Vendedor: Dashboard, Productos, Órdenes y Perfil) | Vendedor en una sección reservada: vuelve al Dashboard | ADM, PAG, ADP, NAV |
| RF-17 | **Mostrar el dashboard.** | Datos del sistema | Indicadores de compras, ingresos, productos, inventario y usuarios; alerta de stock crítico y accesos por rol | — | ADP, ADM |
| RF-18 | **Mantener productos.** | Código, nombre, descripción, precio, stock, stock crítico, descuento, categoría, imagen | Alta, edición (código bloqueado), eliminación con confirmación y búsqueda; solo el Administrador modifica | Código duplicado o campos inválidos: no se guarda | ADP, ADM, DB |
| RF-19 | **Listar productos críticos.** | Catálogo | Productos con stock igual o menor al crítico, con estado Normal, Crítico o Agotado | — | ADP, DB, ADM |
| RF-20 | **Mantener categorías.** | Nombre y descripción | Alta, edición (nombre bloqueado) y eliminación | No se elimina una categoría con productos | ADP |
| RF-21 | **Mantener usuarios.** | RUN, nombre, apellidos, correo, tipo, fecha de nacimiento, región, comuna, dirección | Alta, edición (RUN bloqueado), eliminación, búsqueda y filtro por perfil | RUN o correo repetidos; no se elimina la propia cuenta | ADP, ADM |
| RF-22 | **Consultar órdenes y boletas.** | Filtro por estado | Listado y boleta con detalle; el Administrador puede cambiar el estado de una orden pagada | Orden de ejemplo sin detalle: se informa | ADP |
| RF-23 | **Ver el historial de compras de un usuario.** | RUN | Órdenes asociadas al correo del usuario y total comprado | Usuario sin compras: mensaje | ADP, DB |
| RF-24 | **Mostrar reportes.** | Órdenes y productos | Ingresos, ticket promedio, productos críticos, más vendidos y órdenes por estado; los pagos rechazados no cuentan como venta | Sin ventas con detalle: mensaje | ADP, ADM |
| RF-25 | **Editar el perfil propio.** | Nombre, apellidos y dirección | Validación y guardado en la base de datos | Campos vacíos: no se guarda | ADP |

### Datos

| ID | Requisito | Descripción | Pruebas |
|---|---|---|---|
| RF-26 | **Fuente de datos con CRUD.** | `data/db.js` ofrece `listar`, `obtener`, `crear`, `actualizar`, `eliminar` y `reiniciar` para productos, categorías, usuarios y órdenes; rechaza identificadores repetidos y notifica a los componentes suscritos tras cada cambio para que la interfaz se actualice | DB |
| RF-27 | **Persistencia.** | Cada colección se guarda en `localStorage`; si el dato es inválido se usan los datos iniciales y se registra el error | DB |

## 3.3 Requisitos no funcionales

### 3.3.1 Rendimiento

| ID | Requisito |
|---|---|
| RNF-01 | El 95% de las vistas debe renderizarse completamente en menos de 2 segundos en una conexión de 10 Mbps. |
| RNF-02 | Las operaciones del carrito deben reflejarse en pantalla en menos de 200 ms. |
| RNF-03 | El filtrado debe mantenerse bajo 500 ms con hasta 500 productos. |

### 3.3.2 Seguridad

| ID | Requisito |
|---|---|
| RNF-04 | Las rutas del panel deben protegerse según el perfil mediante `RutaAdmin`, no solo ocultando opciones. |
| RNF-05 | Los datos de entrada deben validarse antes de procesarse, con las reglas centralizadas en `utils/validaciones.js`. |
| RNF-06 | No deben almacenarse contraseñas ni exponerse en la URL. |
| RNF-07 | Los errores de lectura del almacenamiento se registran en consola y el sistema continúa con datos iniciales. |

> **Observación:** sin servidor, el control de acceso y las validaciones del cliente
> mejoran la usabilidad pero no constituyen seguridad efectiva.

### 3.3.3 Fiabilidad y disponibilidad

| ID | Requisito |
|---|---|
| RNF-08 | Un fallo de `localStorage` no debe interrumpir la navegación. |
| RNF-09 | El sistema no debe mostrar errores en la consola durante la operación normal. |
| RNF-10 | El carrito, el catálogo y las órdenes deben funcionar sin conexión, una vez cargada la aplicación. |

### 3.3.4 Mantenibilidad

| ID | Requisito |
|---|---|
| RNF-11 | Cada componente debe cumplir el principio de responsabilidad única, usar props para recibir datos y funciones, y manejar estado propio solo cuando sea necesario. |
| RNF-12 | Las reglas de negocio deben implementarse como funciones puras en `utils/`, independientes del DOM y del almacenamiento. |
| RNF-13 | Los componentes deben acceder a los datos únicamente a través de `data/db.js` y de los contextos. |
| RNF-14 | El código se comenta en español, indicando propósito y reglas de negocio. |

### 3.3.5 Portabilidad y usabilidad

| ID | Requisito |
|---|---|
| RNF-15 | Diseño responsivo con Bootstrap para pantallas desde 360 px, en móvil, tablet y escritorio. |
| RNF-16 | Compatibilidad con las versiones actuales de Chrome, Firefox y Edge. |
| RNF-17 | Los errores de formulario se muestran bajo cada campo y los campos obligatorios se marcan con asterisco. |

## 3.4 Otros Requisitos

| ID | Requisito |
|---|---|
| RNF-18 | El código debe alojarse en un repositorio público de GitHub, con la migración en la rama `entrega-2-react`. |
| RNF-19 | Cada integrante debe registrar commits propios con mensajes descriptivos. |
| RNF-20 | El repositorio debe incluir un README con las instrucciones de ejecución, de pruebas y la estructura. |
| RNF-21 | La documentación se versiona en `docs/` junto al código. |

## 3.5 Estrategia de pruebas

| Aspecto | Definición |
|---|---|
| Herramientas | Jasmine (pruebas), Karma (ejecución en Chrome sin ventana), webpack y Babel (compilación del JSX), `karma-coverage` con Istanbul (cobertura) |
| Comandos | `npm test` ejecuta todo y genera el reporte en `coverage/`; `npm run test:watch` vuelve a ejecutar al guardar |
| Niveles | Funciones puras (validaciones, carrito, pago, administración), capa de datos, componentes (renderizado, props, estado, eventos), páginas y flujos completos |
| Aislamiento | Cada prueba parte con `localStorage` y datos vacíos; se usan espías (`spyOn`, `createSpy`) para `console.error`, `window.print` y funciones entregadas por props, y un generador aleatorio inyectado para el código de envío |
| Criterio de aceptación | Todas las pruebas pasan y la cobertura de líneas supera el 90% |
| Evidencia | Documento de cobertura del testing (`docs/cobertura-testing.md`) |
