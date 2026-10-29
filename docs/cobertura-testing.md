# Documento de cobertura del testing
## Sistema Ch.Store — Frontend React

**Asignatura:** DSY1104 — Desarrollo Full Stack II
**Evaluación:** Parcial 2 (30%)
**Fecha:** 28 de octubre de 2026
**Autores:** Javiera Rojas, Mhyjal Rozas

---

## 1. Resumen ejecutivo

| Indicador | Resultado |
|---|---|
| Pruebas unitarias escritas | **138** |
| Pruebas aprobadas | **138 (100%)** |
| Pruebas fallidas | 0 |
| Cobertura de sentencias | 93,22% (812 de 871) |
| Cobertura de ramas | 84,71% (460 de 543) |
| Cobertura de funciones | 93,00% (319 de 343) |
| Cobertura de líneas | **95,25% (703 de 738)** |
| Tiempo de ejecución | cerca de 1 segundo |
| Entorno | Karma 6 con Jasmine, Chrome Headless |

Los resultados se obtuvieron con `npm test` el 28 de octubre de 2026. El reporte navegable
se genera en `frontend-react/coverage/` (HTML y `lcov.info`).

## 2. Configuración del entorno de pruebas

| Elemento | Detalle |
|---|---|
| Framework de pruebas | Jasmine (`jasmine-core`, `karma-jasmine`) |
| Ejecutor | Karma (`karma.conf.cjs`), con `ChromeHeadless --no-sandbox` |
| Compilación | `karma-webpack` con `babel-loader` y los presets `@babel/preset-env` y `@babel/preset-react` (JSX automático) |
| Cobertura | `babel-plugin-istanbul` instrumenta `src/` (excluye `src/tests/`) y `karma-coverage` genera los reportes `html`, `lcov` y resumen de texto |
| Reporte en consola | `karma-spec-reporter` |
| Punto de entrada | `src/tests/index.js` carga automáticamente todos los `*.spec.js` y `*.spec.jsx` |
| Utilidades | `src/tests/helpers.jsx`: `montar` (renderiza en el DOM real, con enrutador y contextos opcionales), `clic`, `escribir`, `elegir` y `enviar` para simular al usuario |

**Cómo ejecutarlas**

```bash
cd frontend-react
npm install
npm test            # una ejecución, con reporte de cobertura
npm run test:watch  # modo continuo
```

## 3. Técnicas de aislamiento y mocks

| Técnica | Dónde se usa | Qué resuelve |
|---|---|---|
| Espía de función (`jasmine.createSpy`) | Botón y selector de región | Verifica que el componente invoque el `onClick` / `onChange` recibido por props y cuántas veces |
| Espía sobre método existente (`spyOn(window, 'print')`) | Boleta de compra | Evita abrir el diálogo de impresión y comprueba la llamada |
| Espía sobre `console.error` | Lectura de datos corruptos | Comprueba que el error se registre sin ensuciar la consola |
| Dependencia inyectada | `generarCodigoEnvio(aleatorio)` | Un generador aleatorio falso hace determinista el código de envío |
| Fuente de datos reiniciable | `db.reiniciar()` en cada prueba | Cada prueba parte con los datos iniciales; `localStorage` real se limpia entre pruebas |
| Datos sembrados | Carrito y sesión escritos en `localStorage` antes de montar | Crea el contexto exacto que necesita cada caso |
| Enrutador en memoria (`MemoryRouter`) | Todas las pruebas de vistas | Navegar entre rutas sin depender de la URL del navegador |
| Rutas de destino simuladas | Checkout y control de acceso | Verifica adónde navega el componente sin montar la pantalla de destino |

## 4. Pruebas por archivo

| Archivo | Pruebas | Qué verifica |
|---|---|---|
| `validaciones.spec.js` | 12 | RUN (módulo 11, dígito K y 0, formato y largo), correo y dominios, requerido, rango, enteros, encadenado de reglas y `validarCampos` |
| `carrito.spec.js` | 13 | Reglas R1–R5 del carrito, precio con oferta, totales, cupones, unidades y código de envío con aleatorio simulado |
| `db.spec.js` | 14 | CRUD completo, identificadores duplicados, registros inexistentes, suscripción a cambios, datos corruptos, ofertas, críticos, categorías, registro de usuarios, historial y descuento de stock |
| `componentes.spec.jsx` | 14 | Renderizado de listas, renderizado condicional (error, stock, oferta, descuento), props (etiqueta, `onClick`, enlace, error), estado de formularios y eventos |
| `paginas.spec.jsx` | 30 | Productos y filtros, ofertas, detalle, carrito, cupones, checkout, pago aprobado y rechazado, boleta, login, registro, contacto y control de acceso por rol |
| `admin.spec.js` | 11 | Permisos por rol, productos críticos, indicadores, ventas por producto, órdenes por estado y reglas de validación del panel y del checkout |
| `admin-paginas.spec.jsx` | 23 | Dashboard, menú por rol, mantenedores de productos, categorías y usuarios, formularios, historial de compras, órdenes, boleta, reportes y perfil |
| `navegacion.spec.jsx` | 21 | 13 rutas públicas (una prueba por ruta) y flujos: ruta desconocida, carrito en el encabezado, buscador, redirección sin sesión, inicio y cierre de sesión |

Total: 12 + 13 + 14 + 14 + 30 + 11 + 23 + 21 = **138** pruebas.

## 5. Correspondencia con los tipos de prueba propuestos por el docente

| Tipo | Tarea propuesta | Prueba que la cubre |
|---|---|---|
| Renderizado correcto | Componentes de lista renderizan todos los elementos | `ProductList renderiza todos los elementos del conjunto de datos` |
| Renderizado condicional | Mensaje de error solo si hay error | `MensajeError solo se muestra cuando hay un error presente` |
| Propiedades | Botón recibe etiqueta y `onClick` | `Boton recibe la etiqueta y ejecuta la función onClick` |
| Estado | El estado del formulario cambia al escribir | `el estado del formulario cambia cuando el usuario introduce texto` |
| Eventos | Un clic cambia el estado o ejecuta una función | `un clic cambia el estado del componente` y los espías de `onClick` |

## 6. Cobertura por archivo

Porcentajes de líneas, ramas y funciones del último reporte.

### Lógica y datos

| Archivo | Líneas | Ramas | Funciones |
|---|---|---|---|
| `utils/validaciones.js` | 97% | 86% | 100% |
| `utils/carrito.js` | 96% | 82% | 100% |
| `utils/pago.js` | 100% | 100% | 100% |
| `utils/admin.js` | 100% | 94% | 100% |
| `utils/regiones.js`, `utils/formato.js` | 100% | 100% | 100% |
| `data/db.js` | 97% | 90% | 100% |
| `data/blogs.js`, `data/productosBase.js` | 100% | 100% | 100% |
| `context/CarritoContext.jsx` | 97% | 88% | 91% |
| `context/SesionContext.jsx` | 95% | 100% | 100% |
| `hooks/useColeccion.js` | 100% | 100% | 100% |

### Componentes

| Archivo | Líneas | Ramas | Funciones |
|---|---|---|---|
| `Alerta`, `Boton`, `CampoFormulario`, `Footer`, `LayoutAdmin`, `LayoutTienda`, `MensajeError`, `Precio`, `ProductList`, `ResumenTotales`, `RutaAdmin`, `SelectorRegionComuna`, `TablaItems` | 100% | 100% | 100% |
| `ProductCard.jsx` | 100% | 90% | 100% |
| `Buscador.jsx` | 100% | 50% | 100% |
| `TarjetaIndicador.jsx` | 100% | 80% | 100% |
| `Navbar.jsx` | 80% | 100% | 75% |
| `FilaCarrito.jsx`, `ConfirmarEliminar.jsx` | 83% | 100% | 75% |

### Páginas de la tienda

| Archivo | Líneas | Ramas | Funciones |
|---|---|---|---|
| `Home`, `Blogs`, `Categorias`, `Contacto`, `Nosotros`, `Ofertas` | 100% | 100% | 100% |
| `Login.jsx` | 100% | 88% | 100% |
| `Productos.jsx` | 95% | 93% | 80% |
| `Checkout.jsx` | 94% | 92% | 88% |
| `Carrito.jsx` | 91% | 100% | 83% |
| `DetalleBlog.jsx` | 88% | 88% | 80% |
| `ResultadoCompra.jsx` | 88% | 82% | 100% |
| `Registro.jsx` | 87% | 63% | 91% |
| `DetalleProducto.jsx` | 79% | 93% | 56% |

### Páginas del panel

| Archivo | Líneas | Ramas | Funciones |
|---|---|---|---|
| `Dashboard.jsx` | 100% | 100% | 100% |
| `HistorialCompras.jsx` | 100% | 50% | 100% |
| `Ordenes.jsx` | 100% | 75% | 100% |
| `CategoriaForm.jsx` | 100% | 56% | 100% |
| `ProductoForm.jsx` | 100% | 83% | 86% |
| `Usuarios.jsx` | 93% | 100% | 88% |
| `Productos.jsx` | 93% | 94% | 83% |
| `UsuarioForm.jsx` | 93% | 59% | 80% |
| `Perfil.jsx` | 94% | 60% | 82% |
| `Categorias.jsx` | 91% | 50% | 86% |
| `Boleta.jsx` | 90% | 63% | 75% |
| `Reportes.jsx` | 89% | 100% | 67% |

## 7. Análisis de resultados

**Fortalezas**

- Toda la lógica de negocio (validaciones, carrito, pago, indicadores) y la capa de datos
  superan el 95% de líneas. Se probó porque son funciones puras, sin DOM ni almacenamiento.
- Los dos flujos críticos están cubiertos de punta a punta: la compra (carrito, cupón,
  checkout, pago aprobado y rechazado, boleta) y el control de acceso por perfil.
- Cada requisito funcional tiene al menos una prueba asociada (columna "Pruebas" del ERS V2).

**Brechas conocidas y su causa**

| Brecha | Causa | Riesgo |
|---|---|---|
| Ramas bajas en formularios del panel (`CategoriaForm`, `UsuarioForm`, `Perfil`, `Boleta`) | Combinaciones de edición contra alta y estados poco frecuentes no tienen prueba propia | Bajo: las validaciones están cubiertas en `utils/` |
| Funciones sin ejecutar en `DetalleProducto` y `Navbar` | Manejadores de la galería de miniaturas y del cierre del aviso, y el menú de usuario según perfil | Bajo: son acciones de presentación |
| `main.jsx` no se mide | Es solo el punto de arranque del navegador; las pruebas montan `App` directamente | Ninguno |

**Limitaciones**

- Las pruebas son unitarias y de integración de componentes: no incluyen pruebas de
  extremo a extremo ni de accesibilidad.
- El resultado del pago se simula, por lo que no se prueba ninguna pasarela real.

## 8. Mejoras propuestas

1. Probar la galería de miniaturas y el cierre de avisos en el detalle de producto.
2. Completar las ramas de edición contra alta en los formularios del panel.
3. Incorporar pruebas de extremo a extremo con un navegador automatizado.
4. Configurar un umbral de cobertura en `karma.conf.cjs` para que la ejecución falle si
   baja del 90% de líneas.
