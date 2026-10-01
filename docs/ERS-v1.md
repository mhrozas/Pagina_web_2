# Especificación de Requisitos del Software (ERS)
## Sistema Ch.Store — Tienda online

**Asignatura:** DSY1104 — Desarrollo Full Stack I
**Evaluación:** Parcial 1 (30%)
**Versión:** 1.0 (propuesta previa)
**Fecha:** 30 de septiembre de 2026

### Ficha del documento

| Fecha | Revisión | Autor | Modificación |
|---|---|---|---|
| 30-09-2026 | 1.0 | Javiera Rojas | Versión inicial del documento. Secciones 1, 2 y 3 desarrolladas para la entrega 1. |

> **Nota sobre el alcance de esta versión:** conforme a las instrucciones de la evaluación,
> este documento se trabaja durante el semestre y se entrega parcialmente terminado. Las
> secciones 1, 2, 3.1, 3.2 y 3.3 están desarrolladas. Las interfaces de software y de
> comunicación (3.1.3 y 3.1.4) se completarán cuando el sistema incorpore backend y base
> de datos.

---

# 1. Introducción

## 1.1 Propósito

El propósito de este documento es especificar los requisitos del sistema **Ch.Store**, una
tienda online de ropa femenina. El documento describe qué debe hacer el sistema, bajo qué
restricciones y con qué criterios se considerará satisfecho cada requisito.

Está dirigido a:

- El **equipo de desarrollo**, como referencia para construir y verificar el sistema.
- El **cliente** (la empresa Ch.Store), para validar que lo especificado corresponde a lo
  solicitado.
- El **docente de la asignatura**, como evidencia del levantamiento de requerimientos.

## 1.2 Ámbito del Sistema

El sistema se denomina **Ch.Store**.

**Qué hará el sistema:**

- Exhibir un catálogo de productos de vestuario femenino con su imagen, precio y detalle.
- Permitir que los clientes armen un carrito de compras que persista en su navegador.
- Permitir el registro y el inicio de sesión de usuarios.
- Recibir consultas de los clientes a través de un formulario de contacto.
- Publicar artículos de contenido (blogs) relacionados con la tienda.
- Entregar al personal interno un panel de administración para mantener el catálogo de
  productos y los usuarios del sistema, y para consultar las órdenes.
- Restringir el acceso a las funciones del panel según el perfil del usuario.

**Qué no hará el sistema en esta versión:**

- No procesa pagos reales ni se integra con pasarelas de pago.
- No almacena información en una base de datos ni en un servidor; toda la persistencia
  ocurre en el navegador del usuario mediante `localStorage`.
- No gestiona despachos, inventario de bodega ni facturación electrónica.
- No envía correos electrónicos.

**Beneficios y objetivos esperados:**

| Objetivo | Meta |
|---|---|
| Ampliar el canal de venta más allá de las redes sociales | Catálogo disponible 24/7 |
| Reducir el tiempo de atención de consultas repetidas | Información del producto autoexplicativa |
| Centralizar la gestión del catálogo | Un único mantenedor para todo el equipo |
| Disminuir los quiebres de stock | Alerta automática de stock crítico |

## 1.3 Definiciones, Acrónimos y Abreviaturas

| Término | Definición |
|---|---|
| **ERS** | Especificación de Requerimientos de Software. |
| **RUN** | Rol Único Nacional, identificador de las personas en Chile. |
| **Dígito verificador** | Último carácter del RUN, calculado con el algoritmo módulo 11. Puede ser un dígito de 0 a 9 o la letra K. |
| **localStorage** | Mecanismo del navegador que permite guardar datos de forma persistente en el equipo del usuario. |
| **Stock crítico** | Cantidad mínima de unidades a partir de la cual el sistema alerta que un producto necesita reposición. |
| **Mantenedor** | Vista del panel que permite crear, consultar, editar y eliminar registros de un tipo de dato. |
| **Carrito** | Conjunto de productos y cantidades que un cliente ha seleccionado para comprar. |
| **Cupón** | Código que aplica un descuento porcentual sobre el subtotal del carrito. |
| **Perfil o rol** | Conjunto de permisos asociados a un tipo de usuario. |

## 1.4 Referencias

| Documento | Fuente |
|---|---|
| DSY1104 Evaluación Parcial 1 — Anexo 1: Instrucciones | Escuela de Administración y Negocios |
| DSY1104 Evaluación Parcial 1 — Anexo 2: Planilla de Requerimientos | Escuela de Administración y Negocios |
| DSY1104 Evaluación Parcial 1 — Anexo 4: Plantilla ERS | Escuela de Administración y Negocios |
| IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications | IEEE |
| Documentación de `Window.localStorage` | MDN Web Docs |

## 1.5 Visión General del Documento

El documento se organiza en tres secciones. La **sección 1** introduce el propósito y el
alcance. La **sección 2** describe el contexto del producto: su perspectiva, sus funciones
a grandes rasgos, los tipos de usuario, las restricciones y las suposiciones. La
**sección 3** contiene los requisitos específicos, divididos en requisitos de interfaz,
requisitos funcionales y requisitos no funcionales, con el detalle suficiente para diseñar
y probar el sistema.

---

# 2. Descripción General

## 2.1 Perspectiva del Producto

Ch.Store es un **producto independiente**: no forma parte de un sistema mayor ni depende
de aplicaciones de terceros para operar en esta versión.

El sistema se compone de dos subsistemas que comparten la misma base de código y la misma
hoja de estilos:

```
┌─────────────────────────────────────────────────────────┐
│                     SISTEMA CH.STORE                     │
│                                                          │
│  ┌────────────────────┐      ┌────────────────────────┐ │
│  │   TIENDA PÚBLICA   │      │  PANEL ADMINISTRATIVO  │ │
│  │                    │      │                        │ │
│  │  Home              │      │  Tablero               │ │
│  │  Productos         │      │  Mantenedor productos  │ │
│  │  Detalle producto  │      │  Mantenedor usuarios   │ │
│  │  Carrito           │      │  Consulta de órdenes   │ │
│  │  Registro / Login  │      │                        │ │
│  │  Nosotros          │      │  Acceso filtrado       │ │
│  │  Blogs             │      │  por perfil            │ │
│  │  Contacto          │      │                        │ │
│  └─────────┬──────────┘      └───────────┬────────────┘ │
│            │                             │              │
│            └──────────┬──────────────────┘              │
│                       │                                 │
│         ┌─────────────▼──────────────┐                  │
│         │   CAPA JAVASCRIPT COMÚN    │                  │
│         │                            │                  │
│         │  productos.js  catálogo    │                  │
│         │  regiones.js   territorio  │                  │
│         │  validaciones.js  reglas   │                  │
│         │  carrito.js    persistencia│                  │
│         └─────────────┬──────────────┘                  │
│                       │                                 │
│         ┌─────────────▼──────────────┐                  │
│         │   LOCALSTORAGE DEL NAVEGADOR│                 │
│         └────────────────────────────┘                  │
└─────────────────────────────────────────────────────────┘
```

En versiones posteriores la capa de `localStorage` será reemplazada por un servidor con
base de datos, sin que ello altere las interfaces de usuario ya especificadas.

## 2.2 Funciones del Producto

| Módulo | Función | Descripción resumida |
|---|---|---|
| Catálogo | Listar productos | Muestra los productos disponibles con filtro por categoría |
| Catálogo | Ver detalle | Presenta la ficha completa de un producto con galería |
| Compra | Agregar al carrito | Incorpora productos respetando el stock disponible |
| Compra | Gestionar carrito | Modifica cantidades, elimina productos y vacía el carrito |
| Compra | Aplicar cupón | Descuenta un porcentaje sobre el subtotal |
| Compra | Confirmar compra | Cierra la orden y vacía el carrito |
| Cuentas | Registrar usuario | Crea una cuenta validando todos sus datos |
| Cuentas | Iniciar sesión | Autentica al usuario y define su perfil |
| Comunicación | Enviar consulta | Recibe mensajes mediante el formulario de contacto |
| Contenido | Publicar blogs | Muestra artículos con su listado y detalle |
| Administración | Mantener productos | Alta, baja, modificación y consulta del catálogo |
| Administración | Mantener usuarios | Alta, baja, modificación y consulta de cuentas |
| Administración | Consultar órdenes | Lista las órdenes registradas en el sistema |
| Administración | Alertar reposición | Destaca los productos bajo su stock crítico |
| Seguridad | Filtrar por perfil | Oculta las opciones no permitidas al rol activo |

## 2.3 Características de los Usuarios

Existen **tres perfiles de usuario**:

### Administrador
- **Nivel educacional:** técnico o superior.
- **Experiencia técnica:** manejo de computador a nivel usuario intermedio y uso de
  planillas de cálculo.
- **Responsabilidad:** mantiene el catálogo y las cuentas del sistema. Tiene acceso total.
- **Frecuencia de uso:** diaria.

### Vendedor
- **Nivel educacional:** enseñanza media completa.
- **Experiencia técnica:** manejo de computador a nivel usuario básico.
- **Responsabilidad:** consulta el catálogo y las órdenes para atender a los clientes. No
  modifica información.
- **Frecuencia de uso:** diaria.

### Cliente
- **Nivel educacional:** indistinto.
- **Experiencia técnica:** usuario habitual de comercio electrónico y teléfono móvil.
- **Responsabilidad:** navega el catálogo, arma su carrito y realiza la compra.
- **Frecuencia de uso:** ocasional.

## 2.4 Restricciones

| Ámbito | Restricción |
|---|---|
| **Lenguajes** | El sistema debe desarrollarse exclusivamente con HTML5, CSS3 y JavaScript estándar, sin frameworks ni librerías externas. |
| **Arquitectura** | No se dispone de servidor de aplicaciones ni base de datos en esta etapa. Toda la persistencia ocurre en el navegador. |
| **Hoja de estilos** | Los estilos deben declararse en hojas externas, no en línea, para facilitar el mantenimiento. |
| **Hardware** | El sistema debe operar en equipos de gama baja y en teléfonos móviles, por lo que no puede depender de procesamiento intensivo. |
| **Navegadores** | Debe funcionar en las versiones actuales de Chrome, Firefox y Edge. |
| **Control de versiones** | El desarrollo debe registrarse en un repositorio público de GitHub, con commits descriptivos y aporte verificable de cada integrante. |
| **Seguridad** | Al no existir servidor, las validaciones son del lado del cliente y tienen carácter preventivo, no de control de seguridad. |
| **Criticidad** | El sistema no maneja información financiera ni datos sensibles en esta versión. |

## 2.5 Suposiciones y Dependencias

- Se asume que los usuarios acceden desde un navegador con JavaScript habilitado y con
  `localStorage` disponible. Si el navegador opera en modo incógnito restringido, el
  carrito no persistirá entre sesiones.
- Se asume que las imágenes de los productos se alojan en servicios externos mediante URL.
  Si esos servicios dejan de estar disponibles, las imágenes no se mostrarán.
- Se asume que el listado de regiones y comunas se mantiene estable durante el período de
  desarrollo. Un cambio en la división político-administrativa obligaría a actualizar el
  arreglo correspondiente.
- Se asume que el equipo de desarrollo mantiene la estructura de archivos descrita. Un
  cambio en las rutas obligaría a revisar todas las referencias de los documentos HTML.
- El sistema depende de que el catálogo de productos sea mantenido por el Administrador.
  Sin esa mantención, la información mostrada a los clientes pierde vigencia.

## 2.6 Requisitos Futuros

Las siguientes mejoras se analizarán e implementarán en etapas posteriores:

1. **Backend y base de datos** que reemplacen la persistencia en `localStorage` y unifiquen
   el catálogo del panel con el de la tienda.
2. **Autenticación real** con sesiones, contraseñas cifradas y recuperación de clave.
3. **Pasarela de pago** integrada con un proveedor local.
4. **Gestión completa de órdenes**, con estados, seguimiento y notificación al cliente.
5. **Carga de imágenes** desde el panel, en lugar de referenciarlas por URL.
6. **Reportes de venta** exportables para el Administrador.
7. **Accesibilidad WCAG 2.1 nivel AA** y pruebas automatizadas de interfaz.

---

# 3. Requisitos Específicos

## 3.1 Requisitos comunes de las interfaces

### 3.1.1 Interfaces de usuario

Las interfaces son páginas web con dos disposiciones distintas según el módulo:

**Tienda pública:** encabezado superior fijo con el logo a la izquierda, el menú de
navegación al centro y el acceso al carrito a la derecha; área de contenido central de
ancho máximo 1200 píxeles; pie de página con enlaces secundarios y suscripción al boletín.

**Panel administrativo:** menú lateral vertical de 250 píxeles sobre fondo oscuro, siempre
visible, con el área de contenido a su derecha. Las operaciones de listado se presentan en
tablas y las de alta y edición en formularios de dos columnas.

**Convenciones comunes:**

| Elemento | Definición |
|---|---|
| Color principal | Azul `#0066CC` para acciones primarias y enlaces |
| Color de error | Rojo `#C0392B` |
| Color de éxito | Verde `#1E8449` |
| Color de alerta | Ámbar `#D68910` para stock crítico |
| Tipografía | Segoe UI, con alternativas Roboto, Helvetica y Arial |
| Campos obligatorios | Marcados con asterisco rojo junto a la etiqueta |
| Mensajes de error | Se muestran bajo el campo afectado, nunca en ventanas emergentes |

### 3.1.2 Interfaces de hardware

El sistema debe operar sobre:

- Computadores de escritorio y portátiles con pantalla desde 1024 píxeles de ancho.
- Tablets en orientación vertical y horizontal.
- Teléfonos móviles con pantalla desde 360 píxeles de ancho.

Los elementos interactivos deben poder accionarse mediante pantalla táctil, con un área de
toque mínima de 44 por 44 píxeles.

### 3.1.3 Interfaces de software

En la versión actual el sistema **no se integra con otros productos de software**. Su única
dependencia es el navegador web y su API `localStorage`.

| Producto | Propósito | Definición de la interfaz |
|---|---|---|
| Navegador web (API `localStorage`) | Persistir el carrito, los mantenedores y el perfil activo | Pares clave-valor en formato JSON, bajo las claves `chstore_carrito`, `chstore_cupon`, `chstore_rol`, `chstore_usuarios` y `chstore_productos_admin` |

Esta subsección se ampliará cuando el sistema incorpore servicios de backend.

### 3.1.4 Interfaces de comunicación

En la versión actual el sistema **no establece comunicación con otros sistemas**. Toda la
operación ocurre en el navegador del usuario.

Esta subsección se desarrollará cuando el sistema incorpore un servidor, momento en que se
especificará el uso de HTTPS y el formato de intercambio de datos.

## 3.2 Requisitos funcionales

Los requisitos se identifican con el prefijo **RF**. La trazabilidad con la planilla de
requerimientos del Anexo 2 se indica en cada caso.

### 3.2.1 RF-01 — Listar el catálogo de productos
- **Trazabilidad:** R.1
- **Actores:** Cliente, Visitante
- **Descripción:** El sistema construye el listado de productos a partir de un arreglo
  JavaScript y lo presenta en una grilla.
- **Entradas:** Categoría seleccionada en el filtro (opcional).
- **Proceso:** Se filtra el arreglo por categoría y se genera una tarjeta por producto.
- **Salidas:** Grilla con imagen, nombre, atributos y precio de cada producto.
- **Situaciones anormales:** Si el filtro no arroja resultados, se muestra el mensaje
  "No hay productos en esta categoría".

### 3.2.2 RF-02 — Mostrar el detalle de un producto
- **Trazabilidad:** R.2
- **Actores:** Cliente, Visitante
- **Descripción:** El sistema muestra la ficha completa del producto seleccionado.
- **Entradas:** Código del producto recibido por parámetro de URL.
- **Proceso:** Se busca el producto en el catálogo y se completan los elementos de la
  vista, incluidas las miniaturas y los productos relacionados.
- **Salidas:** Ficha con galería, nombre, código, categoría, descripción, precio y estado
  de stock.
- **Situaciones anormales:** Si el código no existe, se informa que el producto no está
  disponible y se deshabilita el botón de compra.

### 3.2.3 RF-03 — Agregar un producto al carrito
- **Trazabilidad:** R.3
- **Actores:** Cliente
- **Descripción:** El sistema incorpora al carrito el producto y la cantidad indicados.
- **Entradas:** Código del producto y cantidad.
- **Proceso:** Se verifica la existencia del producto y su stock; si ya está en el carrito
  se suman las cantidades; el resultado nunca supera el stock disponible.
- **Salidas:** Carrito actualizado en `localStorage`, contador del encabezado actualizado y
  mensaje de confirmación.
- **Situaciones anormales:** Si el producto tiene stock 0 se rechaza la operación. Si la
  cantidad solicitada excede el stock, se ajusta al máximo disponible y se informa.

### 3.2.4 RF-04 — Persistir el carrito entre sesiones
- **Trazabilidad:** R.4
- **Actores:** Cliente
- **Descripción:** El carrito se almacena en `localStorage` y se recupera en cada carga.
- **Entradas:** Contenido actual del carrito.
- **Proceso:** El carrito se serializa a JSON y se guarda bajo la clave `chstore_carrito`.
- **Salidas:** Carrito disponible al reabrir el navegador.
- **Situaciones anormales:** Si el dato almacenado no es un JSON válido o no es un arreglo,
  el sistema registra el error en consola y devuelve un carrito vacío sin interrumpir la
  navegación.

### 3.2.5 RF-05 — Modificar el contenido del carrito
- **Trazabilidad:** R.5
- **Actores:** Cliente
- **Descripción:** El sistema permite ajustar cantidades, eliminar un producto y vaciar el
  carrito completo.
- **Entradas:** Código del producto y acción solicitada.
- **Proceso:** Se aplica el cambio respetando el stock disponible y se recalculan los
  totales.
- **Salidas:** Carrito y resumen de compra actualizados.
- **Situaciones anormales:** Si la cantidad llega a 0, el producto se elimina del carrito.

### 3.2.6 RF-06 — Aplicar un cupón de descuento
- **Trazabilidad:** R.6
- **Actores:** Cliente
- **Descripción:** El sistema aplica un descuento porcentual sobre el subtotal.
- **Entradas:** Código del cupón.
- **Proceso:** Se normaliza el código a mayúsculas y se busca en la tabla de cupones
  válidos. Solo puede haber un cupón activo.
- **Salidas:** Subtotal, descuento y total recalculados.
- **Situaciones anormales:** Cupón inexistente o carrito vacío generan mensaje de error sin
  alterar el total.

### 3.2.7 RF-07 — Registrar un usuario
- **Trazabilidad:** R.7, R.8, R.13
- **Actores:** Visitante
- **Descripción:** El sistema crea una cuenta nueva validando todos sus datos.
- **Entradas:** RUN, nombre, apellidos, correo, contraseña, confirmación de contraseña,
  fecha de nacimiento (opcional), región, comuna y dirección.
- **Proceso:** Cada campo se valida según sus reglas; el RUN se verifica con módulo 11; la
  confirmación debe coincidir con la contraseña.
- **Salidas:** Confirmación de cuenta creada.
- **Situaciones anormales:** Cada campo inválido muestra su mensaje bajo el control
  correspondiente y el formulario no se envía.

### 3.2.8 RF-08 — Validar el RUN
- **Trazabilidad:** R.8
- **Actores:** Visitante, Administrador
- **Descripción:** El sistema verifica que el RUN sea un identificador chileno válido.
- **Entradas:** RUN sin puntos ni guion, de 7 a 9 caracteres.
- **Proceso:** Se recorre el cuerpo del número de derecha a izquierda multiplicando por la
  serie cíclica 2 a 7; el dígito verificador se obtiene como 11 menos el resto de la suma
  dividida por 11, donde 11 equivale a 0 y 10 equivale a K.
- **Salidas:** RUN aceptado o mensaje de error específico.
- **Situaciones anormales:** Se distingue entre error de formato, error de largo y error de
  dígito verificador, con un mensaje distinto para cada caso.

### 3.2.9 RF-09 — Iniciar sesión
- **Trazabilidad:** R.9
- **Actores:** Cliente, Vendedor, Administrador
- **Descripción:** El sistema valida las credenciales del usuario.
- **Entradas:** Correo y contraseña.
- **Proceso:** Se valida el formato y el dominio del correo y el largo de la contraseña.
- **Salidas:** Confirmación de sesión iniciada.
- **Situaciones anormales:** Credenciales con formato inválido muestran el error bajo el
  campo correspondiente.

### 3.2.10 RF-10 — Enviar un mensaje de contacto
- **Trazabilidad:** R.10
- **Actores:** Cliente, Visitante
- **Descripción:** El sistema recibe consultas mediante un formulario.
- **Entradas:** Nombre, correo (opcional) y comentario.
- **Proceso:** Se validan las longitudes y el dominio del correo; el comentario muestra un
  contador de caracteres en tiempo real.
- **Salidas:** Confirmación de mensaje enviado y limpieza del formulario.
- **Situaciones anormales:** Campos inválidos impiden el envío y se señalan individualmente.

### 3.2.11 RF-11 — Mantener el catálogo de productos
- **Trazabilidad:** R.11
- **Actores:** Administrador
- **Descripción:** El sistema permite crear, consultar, editar y eliminar productos.
- **Entradas:** Código, nombre, descripción, precio, stock, stock crítico, categoría e
  imagen.
- **Proceso:** Se validan todos los campos según sus reglas y se verifica que el código no
  esté repetido. Al editar, el código queda bloqueado.
- **Salidas:** Catálogo actualizado y mensaje de confirmación.
- **Situaciones anormales:** Un código duplicado impide guardar y se informa en el campo.

### 3.2.12 RF-12 — Mantener los usuarios del sistema
- **Trazabilidad:** R.12
- **Actores:** Administrador
- **Descripción:** El sistema permite crear, consultar, editar y eliminar usuarios.
- **Entradas:** RUN, nombre, apellidos, correo, tipo de usuario, fecha de nacimiento,
  región, comuna y dirección.
- **Proceso:** Se aplican las mismas validaciones del registro, más la obligatoriedad del
  tipo de usuario. El RUN no puede repetirse y queda bloqueado al editar.
- **Salidas:** Listado de usuarios actualizado.
- **Situaciones anormales:** Un RUN duplicado impide guardar y se informa en el campo.

### 3.2.13 RF-13 — Cargar comunas según la región
- **Trazabilidad:** R.13
- **Actores:** Visitante, Administrador
- **Descripción:** El sistema carga en cascada las comunas de la región elegida.
- **Entradas:** Código de la región.
- **Proceso:** Se busca la región en el arreglo y se reconstruye el select de comunas.
- **Salidas:** Select de comunas habilitado con las opciones correspondientes.
- **Situaciones anormales:** Si no hay región seleccionada, el select de comuna permanece
  deshabilitado.

### 3.2.14 RF-14 — Alertar productos en stock crítico
- **Trazabilidad:** R.11
- **Actores:** Administrador
- **Descripción:** El sistema destaca los productos cuyo stock es igual o inferior a su
  stock crítico.
- **Entradas:** Catálogo vigente.
- **Proceso:** Se comparan stock y stock crítico de cada producto.
- **Salidas:** Indicador numérico en el tablero y tabla de productos por reponer, con
  etiquetas de estado.
- **Situaciones anormales:** Si ningún producto está en nivel crítico, se informa
  explícitamente.

### 3.2.15 RF-15 — Filtrar el menú según el perfil
- **Trazabilidad:** R.14
- **Actores:** Administrador, Vendedor
- **Descripción:** El sistema muestra únicamente las opciones permitidas al perfil activo.
- **Entradas:** Perfil activo del usuario.
- **Proceso:** Se consulta la tabla de permisos por rol y se ocultan los elementos cuyo
  permiso no está incluido.
- **Salidas:** Menú y acciones ajustados al perfil.
- **Situaciones anormales:** Un perfil sin permisos definidos no visualiza ninguna opción
  del panel.

## 3.3 Requisitos no funcionales

### 3.3.1 Requisitos de rendimiento

| Requisito | Métrica |
|---|---|
| RNF-01 | El 95% de las vistas debe renderizarse completamente en menos de 2 segundos en una conexión de 10 Mbps. |
| RNF-02 | Las operaciones del carrito deben reflejarse en pantalla en menos de 200 milisegundos. |
| RNF-03 | El sistema debe soportar un catálogo de hasta 500 productos sin degradar el tiempo de filtrado por sobre 500 milisegundos. |
| RNF-04 | El peso total de los archivos de código (HTML, CSS y JavaScript) no debe superar los 300 KB sin comprimir. |

### 3.3.2 Seguridad

| Requisito | Descripción |
|---|---|
| RNF-05 | El acceso a las funciones del panel debe filtrarse según el perfil del usuario, ocultando las opciones no autorizadas. |
| RNF-06 | Los datos de entrada deben validarse antes de ser procesados, rechazando formatos no previstos. |
| RNF-07 | El sistema no debe almacenar contraseñas en `localStorage` ni exponerlas en la URL. |
| RNF-08 | Los errores de lectura del almacenamiento deben registrarse en consola sin exponer detalles al usuario final. |

> **Observación:** al tratarse de una aplicación sin servidor, las validaciones son del
> lado del cliente y constituyen una ayuda a la usabilidad, no un control de seguridad
> efectivo. El control real se implementará en el backend de las etapas siguientes.

### 3.3.3 Fiabilidad

| Requisito | Descripción |
|---|---|
| RNF-09 | Un fallo en la lectura de `localStorage` no debe interrumpir la navegación; el sistema debe continuar con un estado vacío. |
| RNF-10 | La ausencia de una imagen externa no debe impedir que el resto de la ficha del producto se muestre. |
| RNF-11 | El sistema no debe presentar errores de JavaScript en consola durante la operación normal. |

### 3.3.4 Disponibilidad

| Requisito | Descripción |
|---|---|
| RNF-12 | Al ser un sitio estático, la disponibilidad esperada es del 99,5% mensual, condicionada al servicio de alojamiento. |
| RNF-13 | El sistema debe seguir operando sin conexión a internet en lo relativo al carrito, dado que su persistencia es local. |

### 3.3.5 Mantenibilidad

| Requisito | Descripción |
|---|---|
| RNF-14 | Los estilos deben declararse en hojas externas; no se admiten estilos en línea salvo los generados dinámicamente. |
| RNF-15 | Las reglas de validación deben estar centralizadas en un único archivo reutilizable por la tienda y el panel. |
| RNF-16 | El código debe comentarse en español, indicando el propósito de cada función y las reglas de negocio que aplica. |
| RNF-17 | El mantenimiento correctivo queda a cargo del equipo de desarrollo; la actualización del catálogo, a cargo del Administrador. |

### 3.3.6 Portabilidad

| Requisito | Descripción |
|---|---|
| RNF-18 | El sistema debe funcionar en las versiones actuales de Chrome, Firefox y Edge, sin código específico de un navegador. |
| RNF-19 | El 100% del código debe ser independiente del servidor: no se admiten lenguajes de lado servidor en esta versión. |
| RNF-20 | El sistema debe operar correctamente en Windows, macOS, Linux, Android e iOS. |
| RNF-21 | El diseño debe adaptarse a pantallas desde 360 píxeles de ancho mediante puntos de corte en 992, 768 y 600 píxeles. |

## 3.4 Otros Requisitos

| Requisito | Descripción |
|---|---|
| RNF-22 | El código fuente debe alojarse en un repositorio público de GitHub. |
| RNF-23 | Cada integrante del equipo debe registrar commits propios, con mensajes descriptivos del cambio realizado. |
| RNF-24 | El repositorio debe incluir un archivo README con las instrucciones de ejecución y la estructura del proyecto. |
| RNF-25 | La documentación del proyecto debe versionarse junto al código, en la carpeta `docs/`. |
