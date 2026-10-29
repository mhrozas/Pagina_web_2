/* ============================================================
   BASE DE DATOS SIMULADA
   Cada colección expone las cuatro operaciones CRUD y los
   componentes de React las consumen a través de estas funciones.

   Tiene dos modos de persistencia con la misma interfaz:
   - API (conectarApi): los datos viven en la base del backend. Se
     cargan una vez en una caché en memoria, las lecturas son
     síncronas y cada escritura se envía al servidor.
   - localStorage (por defecto): se usa si no hay backend disponible
     y en las pruebas unitarias.

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
   0. MODO API (backend con base de datos)
   ------------------------------------------------------------ */

const CLAVE_TOKEN = 'chstore_token';

/* El catálogo es público; usuarios y órdenes se cargan solo si el perfil puede verlos */
const PUBLICAS = ['productos', 'categorias'];
const PRIVADAS_POR_PERFIL = { Administrador: ['usuarios', 'ordenes'], Vendedor: ['ordenes'] };

let urlApi = null;
const cache = {};
const alExpirar = new Set();

export function usandoApi() {
    return urlApi !== null;
}

function leerToken() {
    try {
        return localStorage.getItem(CLAVE_TOKEN);
    } catch {
        return null;
    }
}

function guardarToken(token) {
    try {
        if (token) localStorage.setItem(CLAVE_TOKEN, token);
        else localStorage.removeItem(CLAVE_TOKEN);
    } catch {
        // sin almacenamiento disponible: la sesión dura hasta recargar la página
    }
}

/** Avisa cuando el servidor rechaza el token (por ejemplo, la sesión venció). */
export function suscribirExpiracion(funcion) {
    alExpirar.add(funcion);
    return () => alExpirar.delete(funcion);
}

async function pedir(metodo, ruta, cuerpo) {
    const token = leerToken();
    const encabezados = {};
    if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json';
    if (token) encabezados.Authorization = `Bearer ${token}`;

    const respuesta = await fetch(urlApi + ruta, {
        method: metodo,
        headers: encabezados,
        body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined
    });

    if (respuesta.status === 204) return null;
    const datos = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
        // Un 401 con token guardado significa que la sesión ya no es válida
        if (respuesta.status === 401 && token && !ruta.startsWith('/auth/login')) {
            descartarSesion();
            alExpirar.forEach(funcion => funcion());
        }
        const error = new Error(datos.mensaje || `${metodo} ${ruta} respondió ${respuesta.status}`);
        error.estado = respuesta.status;
        error.campo = datos.campo;
        throw error;
    }
    return datos;
}

async function cargarColeccion(coleccion) {
    cache[coleccion] = await pedir('GET', '/' + coleccion);
}

/** Carga lo que el perfil puede ver; el resto queda vacío (salvo la propia cuenta). */
async function cargarPrivadas(usuario) {
    const permitidas = PRIVADAS_POR_PERFIL[usuario.tipoUsuario] || [];
    cache.usuarios = [usuario];
    cache.ordenes = [];
    await Promise.all(permitidas.map(cargarColeccion));
}

function descartarSesion() {
    guardarToken(null);
    cache.usuarios = [];
    cache.ordenes = [];
}

/**
 * Conecta la base con el backend: descarga el catálogo y, desde ese
 * momento, las lecturas salen de la caché y las escrituras van al servidor.
 * Si el servidor no responde lanza un error y se sigue en localStorage.
 */
export async function conectarApi(url) {
    urlApi = url.replace(/\/$/, '');
    try {
        await Promise.all(PUBLICAS.map(cargarColeccion));
        cache.usuarios = [];
        cache.ordenes = [];
    } catch (error) {
        urlApi = null;
        throw error;
    }
    notificar();
}

/** Desactiva el modo API y vuelve a localStorage (útil en pruebas). */
export function desconectarApi() {
    urlApi = null;
    Object.keys(cache).forEach(coleccion => delete cache[coleccion]);
}

/**
 * Si quedó un token guardado, comprueba con el servidor que siga vigente y
 * carga los datos del perfil. Devuelve el usuario, o null si no hay sesión válida.
 */
export async function restaurarSesionApi() {
    if (!usandoApi() || !leerToken()) return null;
    try {
        const { usuario } = await pedir('GET', '/auth/yo');
        await cargarPrivadas(usuario);
        notificar();
        return usuario;
    } catch {
        descartarSesion();
        return null;
    }
}

/** Inicia sesión en el servidor. @returns {Promise<{exito: boolean, usuario?: object, mensaje?: string}>} */
export async function iniciarSesionApi(correo, password) {
    try {
        const { token, usuario } = await pedir('POST', '/auth/login', { correo, password });
        guardarToken(token);
        await cargarPrivadas(usuario);
        notificar();
        return { exito: true, usuario };
    } catch (error) {
        return { exito: false, mensaje: error.estado ? error.message : 'No se pudo conectar con el servidor.' };
    }
}

export async function cerrarSesionApi() {
    try {
        await pedir('POST', '/auth/logout');
    } catch {
        // si el servidor no responde, igual se descarta la sesión local
    }
    descartarSesion();
    notificar();
}

/**
 * Envía un cambio al servidor. Si falla, vuelve a leer la colección para
 * que la pantalla no muestre algo que no quedó guardado.
 */
function sincronizar(coleccion, metodo, ruta, cuerpo) {
    pedir(metodo, ruta, cuerpo).catch(error => {
        console.error('No se pudo guardar en el servidor:', error);
        if (error.estado === 401) return;
        cargarColeccion(coleccion).then(notificar).catch(() => {});
    });
}


/* ------------------------------------------------------------
   1. LECTURA Y ESCRITURA EN LOCALSTORAGE
   ------------------------------------------------------------ */

function leer(coleccion) {
    if (usandoApi()) return cache[coleccion];
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
    if (usandoApi()) {
        cache[coleccion] = datos;
    } else {
        try {
            localStorage.setItem(CLAVES[coleccion], JSON.stringify(datos));
        } catch (error) {
            console.error('No se pudo guardar ' + coleccion + ':', error);
        }
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
 * `extra` son datos que solo viajan al servidor y no se guardan en la caché (por ejemplo, la contraseña).
 * @returns {{exito: boolean, mensaje: string}}
 */
export function crear(coleccion, registro, extra) {
    const datos = leer(coleccion);
    const id = registro[CAMPO_ID[coleccion]];

    if (datos.some(existente => existente[CAMPO_ID[coleccion]] === id)) {
        return { exito: false, mensaje: `Ya existe un registro con ${CAMPO_ID[coleccion]} "${id}".` };
    }

    escribir(coleccion, [...datos, registro]);
    if (usandoApi()) sincronizar(coleccion, 'POST', '/' + coleccion, { ...registro, ...extra });
    return { exito: true, mensaje: 'Registro creado correctamente.' };
}

/**
 * Actualiza los campos indicados de un registro existente.
 * `extra` solo viaja al servidor, igual que en crear.
 * @returns {{exito: boolean, mensaje: string}}
 */
export function actualizar(coleccion, id, cambios, extra) {
    const datos = leer(coleccion);
    const campoId = CAMPO_ID[coleccion];

    if (!datos.some(registro => registro[campoId] === id)) {
        return { exito: false, mensaje: 'El registro no existe.' };
    }

    escribir(coleccion, datos.map(registro => (
        registro[campoId] === id ? { ...registro, ...cambios } : registro
    )));
    if (usandoApi()) sincronizar(coleccion, 'PUT', `/${coleccion}/${encodeURIComponent(id)}`, { ...cambios, ...extra });
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
    if (usandoApi()) sincronizar(coleccion, 'DELETE', `/${coleccion}/${encodeURIComponent(id)}`);
    return { exito: true, mensaje: 'Registro eliminado correctamente.' };
}

/** Restaura una colección a sus datos iniciales (útil para pruebas y demo). */
export function reiniciar(coleccion) {
    if (usandoApi()) {
        pedir('POST', '/reiniciar')
            .then(() => Promise.all(PUBLICAS.map(cargarColeccion)))
            .then(() => restaurarSesionApi())
            .then(notificar)
            .catch(error => console.error('No se pudo reiniciar la base:', error));
        return;
    }
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

/**
 * Registra un usuario nuevo validando que RUN y correo no se repitan.
 * Con el backend la contraseña se envía al servidor y el resultado llega de forma asíncrona.
 */
export function registrarUsuario(usuario, password) {
    if (usandoApi()) {
        return pedir('POST', '/auth/registro', { ...usuario, password })
            .then(() => ({ exito: true, mensaje: 'Tu cuenta fue creada correctamente.' }))
            .catch(error => ({
                exito: false,
                campo: error.campo === 'run' || error.campo === 'correo' ? error.campo : undefined,
                mensaje: error.estado ? error.message : 'No se pudo conectar con el servidor.'
            }));
    }
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
    if (usandoApi()) sincronizar('ordenes', 'POST', '/ordenes', orden);
}

/** Descuenta del catálogo las unidades vendidas. Con el backend, el servidor ya las descontó al registrar la orden aprobada. */
export function descontarStock(items) {
    const productos = leer('productos').map(producto => {
        const vendidas = items
            .filter(item => item.codigo === producto.codigo)
            .reduce((total, item) => total + item.cantidad, 0);
        return vendidas ? { ...producto, stock: Math.max(producto.stock - vendidas, 0) } : producto;
    });
    escribir('productos', productos);
}
