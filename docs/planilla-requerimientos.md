# Planilla de Requerimientos — Ch.Store

**Asignatura:** DSY1104 — Desarrollo Full Stack I
**Evaluación:** Parcial 1 (30%)
**Versión:** 1.0
**Fecha:** 30 de septiembre de 2026

Este documento es la fuente de contenido de la planilla del Anexo 2. Cada requerimiento
sigue las columnas exigidas: código, nombre, tipo, clasificación, actores relacionados,
descripción, criterio de aceptación y estado.

---

## R.1 — Navegar por el catálogo de productos

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Cliente, Visitante
- **Descripción:** El sistema debe mostrar el listado completo de productos disponibles con su imagen, nombre, precio y categoría, permitiendo filtrar por categoría.
- **Criterio de aceptación:**
  - El listado se construye desde un arreglo JavaScript, no desde HTML escrito a mano.
  - Cada producto muestra imagen, nombre, atributos y precio formateado en pesos chilenos.
  - El filtro por categoría actualiza el listado sin recargar la página.
  - Los productos sin stock se muestran con la etiqueta "SIN STOCK".
- **Estado:** Completado

## R.2 — Consultar el detalle de un producto

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Cliente, Visitante
- **Descripción:** Al seleccionar un producto del listado, el sistema debe mostrar su ficha completa con galería de imágenes, descripción, precio, código, categoría y disponibilidad.
- **Criterio de aceptación:**
  - La vista recibe el código del producto por parámetro de URL.
  - Las miniaturas cambian la imagen principal al hacer clic.
  - Se indica el estado del stock: disponible, últimas unidades o agotado.
  - Se muestran hasta 4 productos relacionados de la misma categoría.
- **Estado:** Completado

## R.3 — Agregar productos al carrito de compras

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Cliente
- **Descripción:** El sistema debe permitir agregar productos al carrito indicando la cantidad, respetando el stock disponible.
- **Criterio de aceptación:**
  - No se puede agregar un producto con stock 0.
  - La cantidad solicitada nunca supera el stock disponible.
  - Si el producto ya está en el carrito, la cantidad se suma a la existente.
  - El contador del encabezado se actualiza en todas las páginas.
- **Estado:** Completado

## R.4 — Mantener el carrito entre sesiones

- **Tipo:** Funcional
- **Clasificación:** Funcional de sistema
- **Actores:** Cliente
- **Descripción:** El contenido del carrito debe persistir en el navegador mediante localStorage, de modo que no se pierda al cerrar la pestaña.
- **Criterio de aceptación:**
  - El carrito se guarda bajo la clave `chstore_carrito`.
  - Al reabrir el navegador el carrito conserva sus productos y cantidades.
  - Si el dato almacenado está corrupto, el sistema devuelve un carrito vacío sin fallar.
- **Estado:** Completado

## R.5 — Modificar el contenido del carrito

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Cliente
- **Descripción:** El sistema debe permitir aumentar o disminuir la cantidad de cada producto, eliminar un producto puntual y vaciar el carrito completo.
- **Criterio de aceptación:**
  - Los botones + y − ajustan la cantidad y recalculan el subtotal.
  - El botón + se deshabilita al alcanzar el stock disponible.
  - Al llegar a 0 el producto se elimina automáticamente.
  - El total general se recalcula tras cada cambio.
- **Estado:** Completado

## R.6 — Aplicar cupones de descuento

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Cliente
- **Descripción:** El sistema debe permitir aplicar un cupón de descuento porcentual sobre el subtotal del carrito.
- **Criterio de aceptación:**
  - Solo puede haber un cupón activo a la vez.
  - Un cupón inexistente muestra un mensaje de error y no altera el total.
  - No se puede aplicar un cupón con el carrito vacío.
  - La fila de descuento solo se muestra cuando hay un cupón activo.
- **Estado:** Completado

## R.7 — Registrar un usuario en la tienda

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Visitante
- **Descripción:** El sistema debe permitir que un visitante cree su cuenta entregando RUN, nombre, apellidos, correo, contraseña, región, comuna y dirección.
- **Criterio de aceptación:**
  - Todos los campos obligatorios se validan antes de enviar.
  - El RUN se valida con el algoritmo módulo 11.
  - El correo solo acepta los dominios autorizados.
  - La confirmación de contraseña debe coincidir con la contraseña.
  - Los errores se muestran bajo cada campo, no en ventanas emergentes.
- **Estado:** Completado

## R.8 — Validar el RUN con dígito verificador

- **Tipo:** Funcional
- **Clasificación:** Funcional de sistema
- **Actores:** Visitante, Administrador
- **Descripción:** El sistema debe verificar que el RUN ingresado sea un identificador chileno válido, sin puntos ni guion, de 7 a 9 caracteres.
- **Criterio de aceptación:**
  - Se rechaza el RUN que contenga puntos o guion, indicando el formato correcto.
  - Se rechaza el RUN cuyo dígito verificador no corresponda al cuerpo del número.
  - Se acepta la letra K como dígito verificador.
  - El mensaje de error indica con precisión cuál es el problema.
- **Estado:** Completado

## R.9 — Iniciar sesión en el sistema

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Cliente, Vendedor, Administrador
- **Descripción:** El sistema debe autenticar al usuario mediante correo y contraseña para habilitar el acceso según su perfil.
- **Criterio de aceptación:**
  - El correo es obligatorio, de máximo 100 caracteres y de dominio autorizado.
  - La contraseña es obligatoria y debe tener entre 4 y 10 caracteres.
  - Las validaciones se ejecutan en tiempo real al salir de cada campo.
- **Estado:** Completado

## R.10 — Enviar mensajes de contacto

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Cliente, Visitante
- **Descripción:** El sistema debe disponer de un formulario para que los usuarios envíen consultas de manera interna.
- **Criterio de aceptación:**
  - El nombre es obligatorio, de máximo 100 caracteres.
  - El correo es opcional pero, si se ingresa, debe ser de dominio autorizado.
  - El comentario es obligatorio, de máximo 500 caracteres, con contador visible.
  - Al enviar correctamente se muestra una confirmación y el formulario se limpia.
- **Estado:** Completado

## R.11 — Administrar el catálogo de productos

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Administrador
- **Descripción:** El administrador debe poder crear, consultar, editar y eliminar productos desde un mantenedor con listado, búsqueda y filtro por categoría.
- **Criterio de aceptación:**
  - El listado muestra código, nombre, categoría, precio, stock y estado.
  - El código del producto es único y no puede repetirse.
  - El código no es editable una vez creado el producto.
  - Las validaciones de todos los campos se aplican antes de guardar.
- **Estado:** Completado

## R.12 — Administrar los usuarios del sistema

- **Tipo:** Funcional
- **Clasificación:** Funcional de usuario
- **Actores:** Administrador
- **Descripción:** El administrador debe poder crear, consultar, editar y eliminar usuarios, asignando a cada uno su perfil dentro del sistema.
- **Criterio de aceptación:**
  - El listado muestra RUN, nombre completo, correo, perfil y región.
  - El RUN identifica al usuario y no puede repetirse.
  - El tipo de usuario permite elegir entre Administrador, Vendedor y Cliente.
  - Al editar, la comuna se precarga según la región guardada.
- **Estado:** Completado

## R.13 — Seleccionar comuna en función de la región

- **Tipo:** Funcional
- **Clasificación:** Funcional de sistema
- **Actores:** Visitante, Administrador
- **Descripción:** Al elegir una región, el sistema debe cargar únicamente las comunas que le corresponden.
- **Criterio de aceptación:**
  - Las regiones y comunas provienen de un arreglo JavaScript.
  - El select de comuna permanece deshabilitado mientras no se elija una región.
  - Al cambiar la región, la lista de comunas se reemplaza por completo.
- **Estado:** Completado

## R.14 — Controlar el acceso según el perfil del usuario

- **Tipo:** No funcional
- **Clasificación:** No funcional de producto (seguridad)
- **Actores:** Administrador, Vendedor, Cliente
- **Descripción:** El sistema debe mostrar únicamente las opciones a las que el perfil activo tiene derecho, ocultando el resto del menú.
- **Criterio de aceptación:**
  - El Administrador visualiza todas las secciones del panel.
  - El Vendedor solo visualiza productos y órdenes, en modo consulta.
  - El Cliente no accede al panel de administración.
  - Las acciones de edición y eliminación no aparecen para el Vendedor.
- **Estado:** Completado

## R.15 — Adaptar la interfaz a distintos tamaños de pantalla

- **Tipo:** No funcional
- **Clasificación:** No funcional de producto (usabilidad)
- **Actores:** Todos los actores
- **Descripción:** El sitio debe verse y operarse correctamente en computador, tablet y teléfono, mediante una hoja de estilos externa con diseño responsivo.
- **Criterio de aceptación:**
  - Existe una única hoja de estilos externa para la tienda y otra para el panel.
  - Hay puntos de corte en 992, 768 y 600 píxeles.
  - Ningún contenido se desborda horizontalmente en pantallas de 360 píxeles.
  - El menú lateral del panel pasa a disposición horizontal bajo 900 píxeles.
- **Estado:** Completado
