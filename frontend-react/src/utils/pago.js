/* Datos de la compra: validación del checkout y armado de la orden (funciones puras) */

import { encadenar, validarRequerido, validarCorreo, validarMaximo } from './validaciones';
import { unidadesTotales } from './carrito';

export const REGLAS_CHECKOUT = {
    nombre: encadenar(v => validarRequerido(v, 'nombre'), v => validarMaximo(v, 50, 'nombre')),
    apellidos: encadenar(v => validarRequerido(v, 'apellidos'), v => validarMaximo(v, 100, 'apellidos')),
    correo: encadenar(v => validarRequerido(v, 'correo'), v => validarMaximo(v, 100, 'correo'), validarCorreo),
    calle: encadenar(v => validarRequerido(v, 'calle'), v => validarMaximo(v, 300, 'calle')),
    departamento: v => validarMaximo(v, 50, 'departamento'),
    region: v => validarRequerido(v, 'región'),
    comuna: v => validarRequerido(v, 'comuna'),
    indicaciones: v => validarMaximo(v, 500, 'indicaciones')
};

/**
 * Arma el registro de una orden a partir del carrito y de los datos del cliente.
 * @param {{numero: string, cliente: object, items: Array, totales: object, aprobada: boolean, fecha?: string}} datos
 */
export function armarOrden({ numero, cliente, items, totales, aprobada, fecha }) {
    return {
        numero,
        cliente: `${cliente.nombre} ${cliente.apellidos}`.trim(),
        correo: cliente.correo,
        fecha: fecha || new Date().toISOString().slice(0, 10),
        productos: unidadesTotales(items),
        total: totales.total,
        descuento: totales.descuento,
        cupon: totales.cupon,
        estado: aprobada ? 'Pendiente de despacho' : 'Pago rechazado',
        datosEntrega: {
            calle: cliente.calle,
            departamento: cliente.departamento,
            region: cliente.region,
            comuna: cliente.comuna,
            indicaciones: cliente.indicaciones
        },
        items
    };
}
