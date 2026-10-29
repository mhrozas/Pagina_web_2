/* Reglas del panel de administración (funciones puras) */

import {
    encadenar, validarRequerido, validarMaximo, validarNumeroDecimal, validarNumeroEntero,
    validarCorreo, validarRun
} from './validaciones';

/* Qué secciones del menú puede ver cada perfil */
export const PERMISOS_POR_ROL = {
    Administrador: ['inicio', 'productos', 'editarProductos', 'categorias', 'usuarios', 'ordenes', 'reportes', 'perfil'],
    Vendedor: ['inicio', 'productos', 'ordenes', 'perfil'],
    Cliente: []
};

export function puedeVer(rol, seccion) {
    return (PERMISOS_POR_ROL[rol] || []).includes(seccion);
}

export const REGLAS_PRODUCTO = {
    codigo: encadenar(
        v => validarRequerido(v, 'código'),
        v => (v.trim().length < 3 ? 'El código debe tener al menos 3 caracteres.' : '')
    ),
    nombre: encadenar(v => validarRequerido(v, 'nombre'), v => validarMaximo(v, 100, 'nombre')),
    descripcion: v => validarMaximo(v, 500, 'descripción'),
    precio: encadenar(v => validarRequerido(v, 'precio'), v => validarNumeroDecimal(v, 0, 'precio')),
    stock: encadenar(v => validarRequerido(v, 'stock'), v => validarNumeroEntero(v, 0, 'stock')),
    stockCritico: v => validarNumeroEntero(v, 0, 'stock crítico'),
    descuento: v => validarNumeroEntero(v, 0, 'descuento') || (Number(v) > 90 ? 'El descuento no puede superar el 90%.' : ''),
    categoria: v => validarRequerido(v, 'categoría')
};

export const REGLAS_USUARIO = {
    run: encadenar(v => validarRequerido(v, 'RUN'), validarRun),
    nombre: encadenar(v => validarRequerido(v, 'nombre'), v => validarMaximo(v, 50, 'nombre')),
    apellidos: encadenar(v => validarRequerido(v, 'apellidos'), v => validarMaximo(v, 100, 'apellidos')),
    correo: encadenar(v => validarRequerido(v, 'correo'), v => validarMaximo(v, 100, 'correo'), validarCorreo),
    tipoUsuario: v => validarRequerido(v, 'tipo de usuario'),
    region: v => validarRequerido(v, 'región'),
    comuna: v => validarRequerido(v, 'comuna'),
    direccion: encadenar(v => validarRequerido(v, 'dirección'), v => validarMaximo(v, 300, 'dirección'))
};

export const REGLAS_CATEGORIA = {
    nombre: encadenar(v => validarRequerido(v, 'nombre'), v => validarMaximo(v, 50, 'nombre')),
    descripcion: v => validarMaximo(v, 200, 'descripción')
};

/** Productos en o bajo su stock crítico. */
export function productosCriticos(productos) {
    return productos.filter(p => p.stock <= p.stockCritico);
}

/**
 * Indicadores del tablero y de los reportes.
 * Solo las órdenes con pago aprobado cuentan como venta.
 */
export function calcularIndicadores(ordenes, productos, usuarios) {
    const ventas = ordenes.filter(o => o.estado !== 'Pago rechazado' && o.estado !== 'Pendiente de pago');
    const ingresos = ventas.reduce((total, o) => total + o.total, 0);

    return {
        compras: ventas.length,
        ingresos,
        ticketPromedio: ventas.length ? Math.round(ingresos / ventas.length) : 0,
        productos: productos.length,
        inventario: productos.reduce((total, p) => total + p.stock, 0),
        usuarios: usuarios.length,
        criticos: productosCriticos(productos).length
    };
}

/** Unidades vendidas por producto, a partir de las líneas de las órdenes. */
export function ventasPorProducto(ordenes) {
    const acumulado = {};
    ordenes
        .filter(o => o.estado !== 'Pago rechazado')
        .forEach(o => (o.items || []).forEach(item => {
            const actual = acumulado[item.codigo] || { codigo: item.codigo, nombre: item.nombre, unidades: 0, monto: 0 };
            actual.unidades += item.cantidad;
            actual.monto += item.cantidad * item.precio;
            acumulado[item.codigo] = actual;
        }));
    return Object.values(acumulado).sort((a, b) => b.unidades - a.unidades);
}

/** Cantidad de órdenes por estado. */
export function ordenesPorEstado(ordenes) {
    return ordenes.reduce((acc, o) => ({ ...acc, [o.estado]: (acc[o.estado] || 0) + 1 }), {});
}
