# Ch.Store — Tienda online

Proyecto de la asignatura **DSY1104 — Desarrollo Full Stack I**, Evaluación Parcial 1 (30%).

Tienda online de ropa femenina desarrollada con **HTML5, CSS3 y JavaScript puro**, sin
frameworks ni backend. El sistema se compone de dos módulos: la tienda pública y el
panel de administración.

---

## Integrantes

| Integrante | Responsabilidad |
|---|---|
| Javiera Rojas | Validaciones JavaScript, módulo administrador, documentación ERS |
| M. Rozas | Estructura HTML, hoja de estilos, carrito de compras |

---

## Cómo ejecutar el proyecto

El sitio es estático, pero el detalle de producto lee parámetros de la URL, por lo que
conviene servirlo desde un servidor local en lugar de abrir los archivos directamente.

```bash
# Desde la raíz del proyecto
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
├── blog-detalle-1.html     Detalle del primer artículo
├── blog-detalle-2.html     Detalle del segundo artículo
├── styles.css              Hoja de estilos de la tienda
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
│   ├── carrito.js          Carrito con localStorage y reglas de negocio
│   ├── app.js              Inicialización de las vistas de la tienda
│   └── admin.js            Mantenedores, roles y tablero del panel
│
└── docs/
    ├── ERS-v1.md                   Especificación de Requisitos del Software
    └── planilla-requerimientos.md  Los 15 requerimientos del sistema
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

### Contacto
Nombre requerido (máx. 100), correo opcional con dominio autorizado (máx. 100) y
comentario requerido (máx. 500, con contador de caracteres).

### Inicio de sesión
Correo requerido con dominio autorizado y contraseña entre 4 y 10 caracteres.

---

## Reglas de negocio del carrito

El carrito persiste en `localStorage` bajo la clave `chstore_carrito`.

1. Un producto sin stock no puede agregarse.
2. La cantidad mínima por producto es 1.
3. La cantidad máxima por producto es su stock disponible.
4. Si el producto ya está en el carrito, la cantidad se suma sin superar el stock.
5. Al bajar la cantidad a 0 el producto se elimina.
6. El carrito sobrevive al cierre del navegador.
7. Solo puede haber un cupón de descuento activo a la vez.
8. Al confirmar el pago el carrito se vacía.

**Cupones disponibles para pruebas:** `BIENVENIDA10` (10%), `DUOC15` (15%) y `VERANO20` (20%).

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| **Administrador** | Acceso total: productos, usuarios, órdenes y tablero |
| **Vendedor** | Solo consulta de productos y de órdenes; el resto del menú no aparece |
| **Cliente** | Solo la tienda pública, sin acceso al panel |

El perfil activo se cambia desde el selector del menú lateral del panel, que simula la
sesión mientras no exista autenticación real.

---

## Alcance de esta entrega

**Incluido:** las 11 vistas de la tienda, las 6 vistas del panel, todas las validaciones
de formularios con JavaScript, el carrito con `localStorage`, el filtrado por rol y el
diseño responsivo.

**Fuera de alcance (evaluaciones siguientes):** backend y base de datos, autenticación
real con sesiones, pasarela de pago, gestión de órdenes reales y pruebas automatizadas.

**Limitación conocida:** los mantenedores del panel guardan sus cambios en `localStorage`
de forma independiente del catálogo de la tienda, por lo que un producto creado en el
panel todavía no aparece en la vitrina pública. La unificación de ambas fuentes queda
pendiente para la entrega que incorpore la base de datos.
