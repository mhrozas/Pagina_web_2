/* ============================================================
   BASE DE DATOS SIMULADA
   Fuente de datos en JavaScript con persistencia en localStorage.
   Cada colección expone las cuatro operaciones CRUD y los
   componentes de React las consumen a través de estas funciones.

   Colecciones: productos, categorias, usuarios, ordenes.
   ============================================================ */

import { PRODUCTOS_BASE } from './productosBase';

export const CLAVES = {
    productos: 'chstore_productos',
    categorias: 'chstore_categorias',
    usuarios: 'chstore_usuarios',
    ordenes: 'chstore_ordenes'
};

/* Campo que identifica cada registro dentro de su colección */
const CAMPO_ID = {
    productos: 'codigo',
    categorias: 'nombre',
    usuarios: 'run',
    ordenes: 'numero'
};

export const CATEGORIAS_BASE = [
    { nombre: 'Vestidos', descripcion: 'Vestidos largos, midi y cortos' },
    { nombre: 'Blusas', descripcion: 'Blusas livianas para el día a día' },
    { nombre: 'Conjuntos', descripcion: 'Conjuntos de dos piezas' },
    { nombre: 'Pantalones', descripcion: 'Pantalones y shorts' }
];

export const USUARIOS_BASE = [
    { run: '111111111', nombre: 'Admin', apellidos: 'Demo', correo: 'admin@duoc.cl', tipoUsuario: 'Administrador', region: 'RM', comuna: 'Santiago', direccion: 'Calle Demo 100', fechaNacimiento: '' },
    { run: '222222222', nombre: 'Vendedor', apellidos: 'Demo', correo: 'vendedor@duoc.cl', tipoUsuario: 'Vendedor', region: 'RM', comuna: 'Santiago', direccion: 'Calle Demo 200', fechaNacimiento: '' },
    { run: '333333333', nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', tipoUsuario: 'Cliente', region: 'RM', comuna: 'Santiago', direccion: 'Calle Demo 300', fechaNacimiento: '' }
];

export const ORDENES_BASE = [
    { numero: 'ORD-1001', cliente: 'Cliente Demo', correo: 'cliente@gmail.com', fecha: '2026-09-18', productos: 3, total: 76000, estado: 'Entregada', items: [] },
    { numero: 'ORD-1002', cliente: 'Cliente invitado', correo: '', fecha: '2026-09-22', productos: 1, total: 20000, estado: 'En preparación', items: [] },
    { numero: 'ORD-1003', cliente: 'Cliente invitado', correo: '', fecha: '2026-09-25', productos: 2, total: 56000, estado: 'Despachada', items: [] },
    { numero: 'ORD-1004', cliente: 'Cliente Demo', correo: 'cliente@gmail.com', fecha: '2026-09-28', productos: 1, total: 40000, estado: 'Pendiente de pago', items: [] }
];

const SEMILLAS = {
    productos: PRODUCTOS_BASE,
    categorias: CATEGORIAS_BASE,
    usuarios: USUARIOS_BASE,
    ordenes: ORDENES_BASE
};

/* Los componentes se suscriben para volver a leer los datos tras un cambio */
const suscriptores = new Set();

export function suscribir(funcion) {
    suscriptores.add(funcion);
    return () => suscriptores.delete(funcion);
}

function notificar() {
    suscriptores.forEach(funcion => funcion());
}


/* ------------------------------------------------------------
   1. LECTURA Y ESCRITURA EN LOCALSTORAGE
   ------------------------------------------------------------ */

function leer(coleccion) {
    try {
        const guardado = localStorage.getItem(CLAVES[coleccion]);
        const datos = guardado ? JSON.parse(guardado) : null;
        return Array.isArray(datos) ? datos : SEMILLAS[coleccion];
    } catch (error) {
        console.error('No se pudo leer ' + coleccion + ':', error);
        return SEMILLAS[coleccion];
    }
}

function escribir(coleccion, datos) {
    try {
        localStorage.setItem(CLAVES[coleccion], JSON.stringify(datos));
    } catch (error) {
        console.error('No se pudo guardar ' + coleccion + ':', error);
    }
    notificar();
}


/* ------------------------------------------------------------
   2. CRUD GENÉRICO
   ------------------------------------------------------------ */

/** Lee todos los registros de una colección. */
export function listar(coleccion) {
    return leer(coleccion);
}

/** Busca un registro por su identificador. */
export function obtener(coleccion, id) {
    return leer(coleccion).find(registro => registro[CAMPO_ID[coleccion]] === id);
}

/**
 * Crea un registro. El identificador no puede repetirse.
 * @returns {{exito: boolean, mensaje: string}}
 */
export function crear(coleccion, registro) {
    const datos = leer(coleccion);
    const id = registro[CAMPO_ID[coleccion]];

    if (datos.some(existente => existente[CAMPO_ID[coleccion]] === id)) {
        return { exito: false, mensaje: `Ya existe un registro con ${CAMPO_ID[coleccion]} "${id}".` };
    }

    escribir(coleccion, [...datos, registro]);
    return { exito: true, mensaje: 'Registro creado correctamente.' };
}

/**
 * Actualiza los campos indicados de un registro existente.
 * @returns {{exito: boolean, mensaje: string}}
 */
export function actualizar(coleccion, id, cambios) {
    const datos = leer(coleccion);
    const campoId = CAMPO_ID[coleccion];

    if (!datos.some(registro => registro[campoId] === id)) {
        return { exito: false, mensaje: 'El registro no existe.' };
    }

    escribir(coleccion, datos.map(registro => (
        registro[campoId] === id ? { ...registro, ...cambios } : registro
    )));
    return { exito: true, mensaje: 'Registro actualizado correctamente.' };
}

/**
 * Elimina un registro por su identificador.
 * @returns {{exito: boolean, mensaje: string}}
 */
export function eliminar(coleccion, id) {
    const datos = leer(coleccion);
    const campoId = CAMPO_ID[coleccion];

    if (!datos.some(registro => registro[campoId] === id)) {
        return { exito: false, mensaje: 'El registro no existe.' };
    }

    escribir(coleccion, datos.filter(registro => registro[campoId] !== id));
    return { exito: true, mensaje: 'Registro eliminado correctamente.' };
}

/** Restaura una colección a sus datos iniciales (útil para pruebas y demo). */
export function reiniciar(coleccion) {
    if (coleccion) {
        localStorage.removeItem(CLAVES[coleccion]);
    } else {
        Object.values(CLAVES).forEach(clave => localStorage.removeItem(clave));
    }
    notificar();
}


/* ------------------------------------------------------------
   3. CONSULTAS ESPECÍFICAS
   ------------------------------------------------------------ */

export function buscarUsuarioPorCorreo(correo) {
    const buscado = (correo || '').trim().toLowerCase();
    return leer('usuarios').find(u => u.correo.toLowerCase() === buscado);
}

/** Registra un usuario nuevo validando que RUN y correo no se repitan. */
export function registrarUsuario(usuario) {
    if (obtener('usuarios', usuario.run)) {
        return { exito: false, campo: 'run', mensaje: 'Ya existe una cuenta con este RUN.' };
    }
    if (buscarUsuarioPorCorreo(usuario.correo)) {
        return { exito: false, campo: 'correo', mensaje: 'Ya existe una cuenta con este correo.' };
    }
    crear('usuarios', usuario);
    return { exito: true, mensaje: 'Tu cuenta fue creada correctamente.' };
}

/** Productos con oferta vigente. */
export function listarOfertas() {
    return leer('productos').filter(producto => producto.descuento > 0);
}

/** Productos cuyo stock llegó al nivel crítico (incluye los agotados). */
export function listarCriticos() {
    return leer('productos').filter(producto => producto.stock <= producto.stockCritico);
}

export function listarPorCategoria(categoria) {
    if (!categoria || categoria === 'todas') return leer('productos');
    return leer('productos').filter(producto => producto.categoria === categoria);
}

/** Compras de un usuario, según el correo con que se registró la orden. */
export function listarOrdenesDeUsuario(correo) {
    const buscado = (correo || '').toLowerCase();
    return leer('ordenes').filter(orden => (orden.correo || '').toLowerCase() === buscado);
}

/** Registra una orden nueva al principio del listado. */
export function registrarOrden(orden) {
    escribir('ordenes', [orden, ...leer('ordenes')]);
}

/** Descuenta del catálogo las unidades vendidas. */
export function descontarStock(items) {
    const productos = leer('productos').map(producto => {
        const vendidas = items
            .filter(item => item.codigo === producto.codigo)
            .reduce((total, item) => total + item.cantidad, 0);
        return vendidas ? { ...producto, stock: Math.max(producto.stock - vendidas, 0) } : producto;
    });
    escribir('productos', productos);
}
