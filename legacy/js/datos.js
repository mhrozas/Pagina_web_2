/* ============================================================
   DATOS COMPARTIDOS ENTRE LA TIENDA Y EL PANEL
   Usuarios, sesión activa y órdenes de compra.
   Todo se guarda en localStorage del navegador; no hay servidor
   ni base de datos en esta versión del sistema.
   ============================================================ */

const CLAVE_USUARIOS = 'chstore_usuarios';
const CLAVE_SESION = 'chstore_sesion';
const CLAVE_ORDENES = 'chstore_ordenes';

/* Perfiles que pueden entrar al panel de administración */
const PERFILES_PANEL = ["Administrador", "Vendedor"];

/* Usuarios de demostración del sistema (sin contraseña: RNF-07) */
const USUARIOS_INICIALES = [
    {
        run: "111111111",
        nombre: "Admin",
        apellidos: "Demo",
        correo: "admin@duoc.cl",
        tipoUsuario: "Administrador",
        region: "RM",
        comuna: "Santiago",
        direccion: "Calle Demo 100",
        fechaNacimiento: ""
    },
    {
        run: "222222222",
        nombre: "Vendedor",
        apellidos: "Demo",
        correo: "vendedor@duoc.cl",
        tipoUsuario: "Vendedor",
        region: "RM",
        comuna: "Santiago",
        direccion: "Calle Demo 200",
        fechaNacimiento: ""
    },
    {
        run: "333333333",
        nombre: "Cliente",
        apellidos: "Demo",
        correo: "cliente@gmail.com",
        tipoUsuario: "Cliente",
        region: "RM",
        comuna: "Santiago",
        direccion: "Calle Demo 300",
        fechaNacimiento: ""
    }
];


/* ------------------------------------------------------------
   1. LECTURA Y ESCRITURA GENÉRICA
   ------------------------------------------------------------ */

/**
 * Lee un arreglo guardado. Si no existe o está corrupto devuelve el valor por defecto.
 * @param {string} clave
 * @param {Array} valorPorDefecto
 * @returns {Array}
 */
function leerLista(clave, valorPorDefecto) {
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

/**
 * Guarda un arreglo en formato JSON.
 * @param {string} clave
 * @param {Array} datos
 */
function guardarLista(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
        console.error('No se pudo guardar ' + clave + ':', error);
    }
}


/* ------------------------------------------------------------
   2. USUARIOS
   ------------------------------------------------------------ */

function obtenerUsuarios() {
    return leerLista(CLAVE_USUARIOS, USUARIOS_INICIALES);
}

/**
 * Busca un usuario por correo, sin distinguir mayúsculas.
 * @param {string} correo
 * @returns {object|undefined}
 */
function buscarUsuarioPorCorreo(correo) {
    const buscado = (correo || '').trim().toLowerCase();
    return obtenerUsuarios().find(u => u.correo.toLowerCase() === buscado);
}

/**
 * Registra un usuario nuevo desde la tienda. El RUN y el correo no pueden repetirse.
 * @param {object} usuario
 * @returns {{exito: boolean, campo?: string, mensaje: string}}
 */
function registrarUsuario(usuario) {
    const usuarios = obtenerUsuarios();

    if (usuarios.some(u => u.run === usuario.run)) {
        return { exito: false, campo: 'run', mensaje: 'Ya existe una cuenta con este RUN.' };
    }

    if (buscarUsuarioPorCorreo(usuario.correo)) {
        return { exito: false, campo: 'correo', mensaje: 'Ya existe una cuenta con este correo.' };
    }

    usuarios.push(usuario);
    guardarLista(CLAVE_USUARIOS, usuarios);
    return { exito: true, mensaje: 'Tu cuenta fue creada correctamente.' };
}


/* ------------------------------------------------------------
   3. SESIÓN
   La sesión es simulada: se identifica al usuario por su correo
   y se guarda su perfil. La contraseña solo se valida en formato
   y nunca se almacena (RNF-07). La autenticación real queda para
   la etapa con backend.
   ------------------------------------------------------------ */

/**
 * Devuelve la sesión activa o null.
 * @returns {{nombre: string, apellidos: string, correo: string, tipoUsuario: string}|null}
 */
function obtenerSesion() {
    try {
        const guardado = localStorage.getItem(CLAVE_SESION);
        const sesion = guardado ? JSON.parse(guardado) : null;
        return sesion && sesion.correo && sesion.tipoUsuario ? sesion : null;
    } catch (error) {
        console.error('No se pudo leer la sesión:', error);
        return null;
    }
}

function iniciarSesion(usuario) {
    const sesion = {
        nombre: usuario.nombre,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        tipoUsuario: usuario.tipoUsuario
    };
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    return sesion;
}

function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}

/**
 * Indica si la sesión tiene un perfil autorizado para el panel.
 * @param {object|null} sesion
 * @returns {boolean}
 */
function puedeEntrarAlPanel(sesion) {
    return Boolean(sesion) && PERFILES_PANEL.includes(sesion.tipoUsuario);
}


/* ------------------------------------------------------------
   4. ÓRDENES
   Las compras confirmadas en la tienda quedan registradas para
   la vista de órdenes del panel.
   ------------------------------------------------------------ */

function obtenerOrdenesTienda() {
    return leerLista(CLAVE_ORDENES, []);
}

/**
 * Registra una orden nueva al principio del listado.
 * @param {object} orden
 */
function registrarOrden(orden) {
    const ordenes = obtenerOrdenesTienda();
    ordenes.unshift(orden);
    guardarLista(CLAVE_ORDENES, ordenes);
}
