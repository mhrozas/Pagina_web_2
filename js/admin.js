/* ============================================================
   PANEL DE ADMINISTRACIÓN
   Mantenedores de productos y usuarios, tablero de inicio y
   control de acceso por rol.

   ROLES DEL SISTEMA
   -----------------
   Administrador : acceso total al sistema.
   Vendedor      : solo consulta de productos y de órdenes.
                   El resto de las opciones no aparece en su menú.
   Cliente       : no accede al panel, solo a la tienda.
   ============================================================ */

const CLAVE_ROL = 'chstore_rol';
const CLAVE_USUARIOS = 'chstore_usuarios';
const CLAVE_PRODUCTOS_ADMIN = 'chstore_productos_admin';

/* Qué secciones del menú puede ver cada perfil */
const PERMISOS_POR_ROL = {
    "Administrador": ["inicio", "productos", "usuarios", "ordenes", "crear"],
    "Vendedor": ["inicio", "productos", "ordenes"],
    "Cliente": []
};

/* Usuarios de ejemplo del mantenedor */
const USUARIOS_INICIALES = [
    {
        run: "19011029K",
        nombre: "Javiera",
        apellidos: "Rojas Contreras",
        correo: "javiera.rojas@duoc.cl",
        tipoUsuario: "Administrador",
        region: "RM",
        comuna: "Providencia",
        direccion: "Av. Providencia 1234",
        fechaNacimiento: "2000-05-14"
    },
    {
        run: "111111111",
        nombre: "Carlos",
        apellidos: "Muñoz Silva",
        correo: "carlos.munoz@duoc.cl",
        tipoUsuario: "Vendedor",
        region: "VA",
        comuna: "Viña del Mar",
        direccion: "Calle Valparaíso 567",
        fechaNacimiento: "1995-11-02"
    },
    {
        run: "123456785",
        nombre: "Fernanda",
        apellidos: "Torres Rivas",
        correo: "fernanda.torres@gmail.com",
        tipoUsuario: "Cliente",
        region: "BI",
        comuna: "Concepción",
        direccion: "Barros Arana 890",
        fechaNacimiento: "1998-03-27"
    }
];

/* Órdenes de ejemplo para la vista de consulta */
const ORDENES = [
    { numero: "ORD-1001", cliente: "Fernanda Torres", fecha: "2026-09-18", productos: 3, total: 76000, estado: "Entregada" },
    { numero: "ORD-1002", cliente: "Camila Pérez", fecha: "2026-09-22", productos: 1, total: 20000, estado: "En preparación" },
    { numero: "ORD-1003", cliente: "Antonia Soto", fecha: "2026-09-25", productos: 2, total: 56000, estado: "Despachada" },
    { numero: "ORD-1004", cliente: "Fernanda Torres", fecha: "2026-09-28", productos: 1, total: 40000, estado: "Pendiente de pago" }
];


/* ------------------------------------------------------------
   1. PERSISTENCIA
   Los mantenedores guardan sus cambios en localStorage para que
   las altas y bajas se mantengan al navegar entre vistas.
   ------------------------------------------------------------ */

function leerDeStorage(clave, valorPorDefecto) {
    try {
        const guardado = localStorage.getItem(clave);
        if (!guardado) return valorPorDefecto;

        const datos = JSON.parse(guardado);
        return Array.isArray(datos) ? datos : valorPorDefecto;
    } catch (error) {
        console.error('No se pudo leer ' + clave + ':', error);
        return valorPorDefecto;
    }
}

function escribirEnStorage(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
        console.error('No se pudo guardar ' + clave + ':', error);
    }
}

function obtenerUsuarios() {
    return leerDeStorage(CLAVE_USUARIOS, USUARIOS_INICIALES);
}

function obtenerProductosAdmin() {
    return leerDeStorage(CLAVE_PRODUCTOS_ADMIN, PRODUCTOS);
}


/* ------------------------------------------------------------
   2. CONTROL DE ACCESO POR ROL
   ------------------------------------------------------------ */

function obtenerRolActivo() {
    return localStorage.getItem(CLAVE_ROL) || 'Administrador';
}

/**
 * Oculta las opciones del menú que el rol activo no puede ver.
 */
function aplicarPermisos() {
    const rol = obtenerRolActivo();
    const permitidos = PERMISOS_POR_ROL[rol] || [];

    document.querySelectorAll('[data-permiso]').forEach(elemento => {
        const permiso = elemento.dataset.permiso;
        elemento.style.display = permitidos.includes(permiso) ? '' : 'none';
    });

    const etiquetaRol = document.getElementById('rol-actual');
    if (etiquetaRol) etiquetaRol.textContent = rol;

    const selector = document.getElementById('selector-rol');
    if (selector) selector.value = rol;

    /* El vendedor solo consulta: se desactivan las acciones de edición */
    if (rol === 'Vendedor') {
        document.querySelectorAll('.accion-editar, .accion-eliminar').forEach(boton => {
            boton.style.display = 'none';
        });
    }
}

function iniciarSelectorRol() {
    const selector = document.getElementById('selector-rol');
    if (!selector) return;

    selector.value = obtenerRolActivo();

    selector.addEventListener('change', () => {
        localStorage.setItem(CLAVE_ROL, selector.value);
        window.location.reload();
    });
}


/* ------------------------------------------------------------
   3. TABLERO DE INICIO
   ------------------------------------------------------------ */

function iniciarTablero() {
    const tabla = document.getElementById('tabla-criticos');
    if (!tabla) return;

    const productos = obtenerProductosAdmin();
    const usuarios = obtenerUsuarios();

    const unidades = productos.reduce((total, p) => total + Number(p.stock), 0);
    const criticos = productos.filter(p => p.stock <= p.stockCritico);

    document.getElementById('total-productos').textContent = productos.length;
    document.getElementById('total-stock').textContent = unidades;
    document.getElementById('total-criticos').textContent = criticos.length;
    document.getElementById('total-usuarios').textContent = usuarios.length;

    if (criticos.length === 0) {
        tabla.innerHTML = '<tr><td colspan="6" class="tabla-vacia">Ningún producto está en nivel crítico.</td></tr>';
        return;
    }

    tabla.innerHTML = criticos.map(p => `
        <tr>
            <td>${p.codigo}</td>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>${p.stock}</td>
            <td>${p.stockCritico}</td>
            <td>${etiquetaEstadoStock(p)}</td>
        </tr>
    `).join('');
}

function etiquetaEstadoStock(producto) {
    if (producto.stock === 0) {
        return '<span class="etiqueta etiqueta-roja">Agotado</span>';
    }
    if (producto.stock <= producto.stockCritico) {
        return '<span class="etiqueta etiqueta-amarilla">Stock crítico</span>';
    }
    return '<span class="etiqueta etiqueta-verde">Disponible</span>';
}


/* ------------------------------------------------------------
   4. MANTENEDOR DE PRODUCTOS: LISTADO
   ------------------------------------------------------------ */

function iniciarListadoAdminProductos() {
    const tabla = document.getElementById('tabla-productos');
    if (!tabla) return;

    const filtroCategoria = document.getElementById('filtro-categoria-admin');
    const buscador = document.getElementById('buscar-producto');

    if (filtroCategoria) {
        CATEGORIAS.forEach(categoria => {
            const opcion = document.createElement('option');
            opcion.value = categoria;
            opcion.textContent = categoria;
            filtroCategoria.appendChild(opcion);
        });
    }

    const dibujar = () => {
        const texto = buscador ? buscador.value.toLowerCase().trim() : '';
        const categoria = filtroCategoria ? filtroCategoria.value : 'todas';

        const filtrados = obtenerProductosAdmin().filter(producto => {
            const coincideTexto = producto.codigo.toLowerCase().includes(texto) ||
                                  producto.nombre.toLowerCase().includes(texto);
            const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;
            return coincideTexto && coincideCategoria;
        });

        if (filtrados.length === 0) {
            tabla.innerHTML = '<tr><td colspan="7" class="tabla-vacia">No se encontraron productos.</td></tr>';
            return;
        }

        tabla.innerHTML = filtrados.map(producto => `
            <tr>
                <td>${producto.codigo}</td>
                <td>${producto.nombre}</td>
                <td>${producto.categoria}</td>
                <td>${formatearPrecio(producto.precio)}</td>
                <td>${producto.stock}</td>
                <td>${etiquetaEstadoStock(producto)}</td>
                <td class="columna-acciones">
                    <a href="producto-form.html?codigo=${producto.codigo}" class="accion-editar">Editar</a>
                    <button class="accion-eliminar" data-codigo="${producto.codigo}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        aplicarPermisos();
    };

    dibujar();

    if (buscador) buscador.addEventListener('input', dibujar);
    if (filtroCategoria) filtroCategoria.addEventListener('change', dibujar);

    tabla.addEventListener('click', (evento) => {
        const boton = evento.target.closest('.accion-eliminar');
        if (!boton) return;

        const restantes = obtenerProductosAdmin().filter(p => p.codigo !== boton.dataset.codigo);
        escribirEnStorage(CLAVE_PRODUCTOS_ADMIN, restantes);
        dibujar();
    });
}


/* ------------------------------------------------------------
   5. MANTENEDOR DE PRODUCTOS: FORMULARIO
   Reglas: código requerido mín 3; nombre requerido máx 100;
   descripción opcional máx 500; precio requerido mín 0 decimal;
   stock requerido entero mín 0; stock crítico opcional entero
   mín 0; categoría requerida; imagen opcional.
   ------------------------------------------------------------ */

function iniciarFormularioProducto() {
    const formulario = document.getElementById('form-producto');
    if (!formulario) return;

    /* Llenar el select de categorías */
    const selectCategoria = document.getElementById('categoria');
    CATEGORIAS.forEach(categoria => {
        const opcion = document.createElement('option');
        opcion.value = categoria;
        opcion.textContent = categoria;
        selectCategoria.appendChild(opcion);
    });

    activarContador('descripcion', 'contador-descripcion', 500);

    /* Modo edición: se carga el producto indicado en la URL */
    const parametros = new URLSearchParams(window.location.search);
    const codigoEditar = parametros.get('codigo');
    let enEdicion = false;

    if (codigoEditar) {
        const producto = obtenerProductosAdmin().find(p => p.codigo === codigoEditar);

        if (producto) {
            enEdicion = true;
            document.getElementById('titulo-formulario').textContent = 'Editar producto';
            document.title = 'Editar producto - Panel de administración';

            document.getElementById('codigo').value = producto.codigo;
            document.getElementById('codigo').readOnly = true;
            document.getElementById('nombre').value = producto.nombre;
            document.getElementById('descripcion').value = producto.descripcion || '';
            document.getElementById('precio').value = producto.precio;
            document.getElementById('stock').value = producto.stock;
            document.getElementById('stockCritico').value = producto.stockCritico ?? '';
            document.getElementById('categoria').value = producto.categoria;
            document.getElementById('imagen').value = producto.imagen || '';

            activarContador('descripcion', 'contador-descripcion', 500);
        }
    }

    const reglas = {
        codigo: encadenar(
            v => validarRequerido(v, 'código'),
            v => v.trim().length < 3 ? 'El código debe tener al menos 3 caracteres.' : ''
        ),
        nombre: encadenar(
            v => validarRequerido(v, 'nombre'),
            v => validarMaximo(v, 100, 'nombre')
        ),
        descripcion: v => validarMaximo(v, 500, 'descripción'),
        precio: encadenar(
            v => validarRequerido(v, 'precio'),
            v => validarNumeroDecimal(v, 0, 'precio')
        ),
        stock: encadenar(
            v => validarRequerido(v, 'stock'),
            v => validarNumeroEntero(v, 0, 'stock')
        ),
        stockCritico: v => validarNumeroEntero(v, 0, 'stock crítico'),
        categoria: v => validarRequerido(v, 'categoría')
    };

    Object.keys(reglas).forEach(campo => validarEnTiempoReal(campo, reglas[campo]));

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const listaReglas = Object.keys(reglas).map(campo => ({
            campo: campo,
            validar: reglas[campo]
        }));

        if (!validarFormulario(listaReglas)) return;

        const productos = obtenerProductosAdmin();
        const codigo = document.getElementById('codigo').value.trim();

        /* El código identifica al producto, no puede repetirse */
        if (!enEdicion && productos.some(p => p.codigo === codigo)) {
            mostrarError('codigo', 'Ya existe un producto con este código.');
            return;
        }

        const datos = {
            codigo: codigo,
            nombre: document.getElementById('nombre').value.trim(),
            descripcion: document.getElementById('descripcion').value.trim(),
            precio: Number(document.getElementById('precio').value),
            stock: Number(document.getElementById('stock').value),
            stockCritico: Number(document.getElementById('stockCritico').value) || 0,
            categoria: document.getElementById('categoria').value,
            imagen: document.getElementById('imagen').value.trim() || 'https://placehold.co/400x400?text=Sin+imagen',
            atributos: document.getElementById('categoria').value,
            galeria: []
        };

        const indice = productos.findIndex(p => p.codigo === codigo);

        if (indice !== -1) {
            productos[indice] = Object.assign({}, productos[indice], datos);
        } else {
            productos.push(datos);
        }

        escribirEnStorage(CLAVE_PRODUCTOS_ADMIN, productos);

        mostrarExito('exito-producto', enEdicion
            ? 'El producto fue actualizado correctamente.'
            : 'El producto fue creado correctamente.');

        if (!enEdicion) formulario.reset();
    });
}


/* ------------------------------------------------------------
   6. MANTENEDOR DE USUARIOS: LISTADO
   ------------------------------------------------------------ */

function iniciarListadoUsuarios() {
    const tabla = document.getElementById('tabla-usuarios');
    if (!tabla) return;

    const buscador = document.getElementById('buscar-usuario');
    const filtroTipo = document.getElementById('filtro-tipo-usuario');

    const nombreRegion = (codigo) => {
        const region = REGIONES.find(r => r.codigo === codigo);
        return region ? region.nombre : codigo;
    };

    const dibujar = () => {
        const texto = buscador ? buscador.value.toLowerCase().trim() : '';
        const tipo = filtroTipo ? filtroTipo.value : 'todos';

        const filtrados = obtenerUsuarios().filter(usuario => {
            const campos = `${usuario.run} ${usuario.nombre} ${usuario.apellidos} ${usuario.correo}`.toLowerCase();
            const coincideTexto = campos.includes(texto);
            const coincideTipo = tipo === 'todos' || usuario.tipoUsuario === tipo;
            return coincideTexto && coincideTipo;
        });

        if (filtrados.length === 0) {
            tabla.innerHTML = '<tr><td colspan="6" class="tabla-vacia">No se encontraron usuarios.</td></tr>';
            return;
        }

        tabla.innerHTML = filtrados.map(usuario => `
            <tr>
                <td>${usuario.run}</td>
                <td>${usuario.nombre} ${usuario.apellidos}</td>
                <td>${usuario.correo}</td>
                <td><span class="etiqueta etiqueta-perfil">${usuario.tipoUsuario}</span></td>
                <td>${nombreRegion(usuario.region)}</td>
                <td class="columna-acciones">
                    <a href="usuario-form.html?run=${usuario.run}" class="accion-editar">Editar</a>
                    <button class="accion-eliminar" data-run="${usuario.run}">Eliminar</button>
                </td>
            </tr>
        `).join('');

        aplicarPermisos();
    };

    dibujar();

    if (buscador) buscador.addEventListener('input', dibujar);
    if (filtroTipo) filtroTipo.addEventListener('change', dibujar);

    tabla.addEventListener('click', (evento) => {
        const boton = evento.target.closest('.accion-eliminar');
        if (!boton) return;

        const restantes = obtenerUsuarios().filter(u => u.run !== boton.dataset.run);
        escribirEnStorage(CLAVE_USUARIOS, restantes);
        dibujar();
    });
}


/* ------------------------------------------------------------
   7. MANTENEDOR DE USUARIOS: FORMULARIO
   Mismas reglas que el registro de la tienda, más el tipo de
   usuario, que solo existe en la vista administrativa.
   ------------------------------------------------------------ */

function iniciarFormularioUsuario() {
    const formulario = document.getElementById('form-usuario');
    if (!formulario) return;

    inicializarRegionComuna('region', 'comuna');

    /* Modo edición */
    const parametros = new URLSearchParams(window.location.search);
    const runEditar = parametros.get('run');
    let enEdicion = false;

    if (runEditar) {
        const usuario = obtenerUsuarios().find(u => u.run === runEditar);

        if (usuario) {
            enEdicion = true;
            document.getElementById('titulo-formulario').textContent = 'Editar usuario';
            document.title = 'Editar usuario - Panel de administración';

            document.getElementById('run').value = usuario.run;
            document.getElementById('run').readOnly = true;
            document.getElementById('nombre').value = usuario.nombre;
            document.getElementById('apellidos').value = usuario.apellidos;
            document.getElementById('correo').value = usuario.correo;
            document.getElementById('tipoUsuario').value = usuario.tipoUsuario;
            document.getElementById('fechaNacimiento').value = usuario.fechaNacimiento || '';
            document.getElementById('direccion').value = usuario.direccion;

            /* La comuna depende de la región, por eso se carga después */
            const selectRegion = document.getElementById('region');
            selectRegion.value = usuario.region;
            cargarComunas(usuario.region, document.getElementById('comuna'));
            document.getElementById('comuna').value = usuario.comuna;
        }
    }

    const reglas = {
        run: encadenar(
            v => validarRequerido(v, 'RUN'),
            v => validarRun(v)
        ),
        nombre: encadenar(
            v => validarRequerido(v, 'nombre'),
            v => validarMaximo(v, 50, 'nombre')
        ),
        apellidos: encadenar(
            v => validarRequerido(v, 'apellidos'),
            v => validarMaximo(v, 100, 'apellidos')
        ),
        correo: encadenar(
            v => validarRequerido(v, 'correo'),
            v => validarMaximo(v, 100, 'correo'),
            v => validarCorreo(v)
        ),
        tipoUsuario: v => validarRequerido(v, 'tipo de usuario'),
        region: v => validarRequerido(v, 'región'),
        comuna: v => validarRequerido(v, 'comuna'),
        direccion: encadenar(
            v => validarRequerido(v, 'dirección'),
            v => validarMaximo(v, 300, 'dirección')
        )
    };

    Object.keys(reglas).forEach(campo => validarEnTiempoReal(campo, reglas[campo]));

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const listaReglas = Object.keys(reglas).map(campo => ({
            campo: campo,
            validar: reglas[campo]
        }));

        if (!validarFormulario(listaReglas)) return;

        const usuarios = obtenerUsuarios();
        const run = document.getElementById('run').value.trim().toUpperCase();

        /* El RUN identifica al usuario, no puede repetirse */
        if (!enEdicion && usuarios.some(u => u.run === run)) {
            mostrarError('run', 'Ya existe un usuario registrado con este RUN.');
            return;
        }

        const datos = {
            run: run,
            nombre: document.getElementById('nombre').value.trim(),
            apellidos: document.getElementById('apellidos').value.trim(),
            correo: document.getElementById('correo').value.trim(),
            tipoUsuario: document.getElementById('tipoUsuario').value,
            fechaNacimiento: document.getElementById('fechaNacimiento').value,
            region: document.getElementById('region').value,
            comuna: document.getElementById('comuna').value,
            direccion: document.getElementById('direccion').value.trim()
        };

        const indice = usuarios.findIndex(u => u.run === run);

        if (indice !== -1) {
            usuarios[indice] = datos;
        } else {
            usuarios.push(datos);
        }

        escribirEnStorage(CLAVE_USUARIOS, usuarios);

        mostrarExito('exito-usuario', enEdicion
            ? 'El usuario fue actualizado correctamente.'
            : 'El usuario fue creado correctamente.');

        if (!enEdicion) {
            formulario.reset();
            document.getElementById('comuna').disabled = true;
        }
    });
}


/* ------------------------------------------------------------
   8. LISTADO DE ÓRDENES
   ------------------------------------------------------------ */

function iniciarListadoOrdenes() {
    const tabla = document.getElementById('tabla-ordenes');
    if (!tabla) return;

    tabla.innerHTML = ORDENES.map(orden => `
        <tr>
            <td>${orden.numero}</td>
            <td>${orden.cliente}</td>
            <td>${orden.fecha}</td>
            <td>${orden.productos}</td>
            <td>${formatearPrecio(orden.total)}</td>
            <td><span class="etiqueta etiqueta-perfil">${orden.estado}</span></td>
        </tr>
    `).join('');
}


/* ------------------------------------------------------------
   INICIALIZACIÓN
   ------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
    iniciarSelectorRol();
    iniciarTablero();
    iniciarListadoAdminProductos();
    iniciarFormularioProducto();
    iniciarListadoUsuarios();
    iniciarFormularioUsuario();
    iniciarListadoOrdenes();
    aplicarPermisos();
});
