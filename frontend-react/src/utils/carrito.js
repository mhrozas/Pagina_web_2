/* ============================================================
   LÓGICA DEL CARRITO (funciones puras)
   Reglas de negocio migradas de js/carrito.js. No leen ni
   escriben localStorage: reciben el carrito y devuelven el nuevo,
   lo que permite probarlas sin mocks de navegador.

   R1. Un producto sin stock no puede agregarse.
   R2. La cantidad mínima por producto es 1.
   R3. La cantidad máxima es el stock, sumando todas las tallas.
   R4. Mismo producto y talla: la cantidad se suma sin pasar el stock.
   R5. Al bajar la cantidad a 0 el producto se elimina.
   R7. Un solo cupón activo; descuento porcentual sobre el subtotal.
   ============================================================ */

export const CUPONES = {
    DESCUENTO20: 20,
    CHSTORE10: 10,
    BIENVENIDA10: 10,
    VERANO20: 20,
    DUOC15: 15
};

export const TALLAS = { S: 'S (Pequeña)', M: 'M (Mediana)', L: 'L (Grande)' };

export function claveItem(item) {
    return item.codigo + '|' + (item.talla || '');
}

export function unidadesDelProducto(carrito, codigo) {
    return carrito
        .filter(item => item.codigo === codigo)
        .reduce((total, item) => total + Number(item.cantidad), 0);
}

export function unidadesTotales(carrito) {
    return carrito.reduce((total, item) => total + (parseInt(item.cantidad, 10) || 0), 0);
}

/** Precio unitario con la oferta aplicada. */
export function precioFinal(producto) {
    const descuento = Number(producto.descuento) || 0;
    return Math.round(producto.precio * (100 - descuento) / 100);
}

/**
 * Agrega un producto aplicando R1 a R4.
 * @returns {{carrito: Array, exito: boolean, mensaje: string}}
 */
export function agregarItem(carrito, producto, cantidad, talla) {
    if (!producto) {
        return { carrito, exito: false, mensaje: 'El producto no existe en el catálogo.' };
    }
    if (producto.stock === 0) {
        return { carrito, exito: false, mensaje: 'Este producto no tiene stock disponible.' };
    }

    let solicitada = parseInt(cantidad, 10);
    if (isNaN(solicitada) || solicitada < 1) solicitada = 1;

    const disponible = producto.stock - unidadesDelProducto(carrito, producto.codigo);
    if (disponible <= 0) {
        return {
            carrito,
            exito: false,
            mensaje: `Ya tienes en tu carrito las ${producto.stock} unidades disponibles.`
        };
    }

    const final = Math.min(solicitada, disponible);
    const nuevo = { codigo: producto.codigo, talla: talla || '' };
    const existe = carrito.some(item => claveItem(item) === claveItem(nuevo));

    const actualizado = existe
        ? carrito.map(item => (
            claveItem(item) === claveItem(nuevo) ? { ...item, cantidad: item.cantidad + final } : item
        ))
        : [...carrito, {
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: precioFinal(producto),
            imagen: producto.imagen,
            talla: talla || '',
            cantidad: final
        }];

    const mensaje = final < solicitada
        ? `Solo quedaban ${disponible} unidades disponibles. Se ajustó la cantidad al máximo.`
        : `"${producto.nombre}" se agregó al carrito.`;

    return { carrito: actualizado, exito: true, mensaje };
}

/** Suma o resta unidades a una línea (R3 y R5). */
export function cambiarCantidadItem(carrito, clave, cambio, stockDelProducto) {
    const item = carrito.find(i => claveItem(i) === clave);
    if (!item) return carrito;

    const nueva = item.cantidad + cambio;
    if (nueva <= 0) return carrito.filter(i => claveItem(i) !== clave);

    const otrasTallas = unidadesDelProducto(carrito, item.codigo) - item.cantidad;
    const tope = stockDelProducto === undefined ? nueva : stockDelProducto - otrasTallas;

    return carrito.map(i => (
        claveItem(i) === clave ? { ...i, cantidad: Math.min(nueva, Math.max(tope, 1)) } : i
    ));
}

export function eliminarItem(carrito, clave) {
    return carrito.filter(item => claveItem(item) !== clave);
}

/** Calcula subtotal, descuento y total (R7). */
export function calcularTotales(carrito, cupon) {
    const subtotal = carrito.reduce((acc, item) => acc + Number(item.precio) * Number(item.cantidad), 0);
    const porcentaje = cupon && CUPONES[cupon] ? CUPONES[cupon] : 0;
    const descuento = Math.round(subtotal * porcentaje / 100);

    return {
        subtotal,
        descuento,
        total: subtotal - descuento,
        cupon: porcentaje > 0 ? cupon : null
    };
}

/** Valida un cupón. Devuelve el código normalizado si es válido. */
export function validarCupon(codigo, carrito) {
    const cupon = (codigo || '').trim().toUpperCase();

    if (cupon === '') return { exito: false, mensaje: 'Ingresa un código de cupón.' };
    if (!CUPONES[cupon]) return { exito: false, mensaje: 'El cupón ingresado no es válido.' };
    if (carrito.length === 0) return { exito: false, mensaje: 'Agrega productos antes de aplicar un cupón.' };

    return { exito: true, cupon, mensaje: `Cupón aplicado: ${CUPONES[cupon]}% de descuento.` };
}

/** Genera un código de seguimiento, por ejemplo CH-8A3X1Z. */
export function generarCodigoEnvio(aleatorio = Math.random) {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'CH-';
    for (let i = 0; i < 6; i++) {
        codigo += caracteres.charAt(Math.floor(aleatorio() * caracteres.length));
    }
    return codigo;
}
