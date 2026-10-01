/* ============================================================
   CARRITO DE COMPRAS
   Persistencia en LOCALSTORAGE bajo la clave "chstore_carrito".

   REGLAS DE NEGOCIO DEFINIDAS PARA EL CARRITO
   -------------------------------------------
   R1. Un producto sin stock (stock = 0) no puede agregarse.
   R2. La cantidad mínima por producto en el carrito es 1.
   R3. La cantidad máxima por producto es su stock disponible.
   R4. Si el producto ya está en el carrito, la nueva cantidad se
       suma a la existente, sin superar nunca el stock (R3).
   R5. Al bajar la cantidad a 0 con el botón "-", el producto se
       elimina del carrito.
   R6. El carrito sobrevive al cierre del navegador porque se
       guarda en localStorage y se lee en cada carga de página.
   R7. Los cupones aplican un descuento porcentual sobre el
       subtotal y solo puede haber un cupón activo a la vez.
   R8. Al confirmar el pago el carrito se vacía.
   ============================================================ */

const CLAVE_CARRITO = 'chstore_carrito';
const CLAVE_CUPON = 'chstore_cupon';

/* Cupones disponibles y su porcentaje de descuento */
const CUPONES = {
    "BIENVENIDA10": 10,
    "VERANO20": 20,
    "DUOC15": 15
};


/* ------------------------------------------------------------
   1. LECTURA Y ESCRITURA EN LOCALSTORAGE
   ------------------------------------------------------------ */

/**
 * Devuelve el carrito guardado. Si no existe o está corrupto, devuelve [].
 * @returns {Array}
 */
function obtenerCarrito() {
    try {
        const guardado = localStorage.getItem(CLAVE_CARRITO);
        const carrito = guardado ? JSON.parse(guardado) : [];
        return Array.isArray(carrito) ? carrito : [];
    } catch (error) {
        console.error('No se pudo leer el carrito desde localStorage:', error);
        return [];
    }
}

/**
 * Guarda el carrito en localStorage.
 * @param {Array} carrito
 */
function guardarCarrito(carrito) {
    try {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    } catch (error) {
        console.error('No se pudo guardar el carrito en localStorage:', error);
    }
}

/**
 * Devuelve el cupón activo, o null si no hay ninguno.
 * @returns {string|null}
 */
function obtenerCupon() {
    return localStorage.getItem(CLAVE_CUPON);
}


/* ------------------------------------------------------------
   2. OPERACIONES SOBRE EL CARRITO
   ------------------------------------------------------------ */

/**
 * Agrega un producto al carrito aplicando las reglas R1 a R4.
 * @param {string} codigo
 * @param {number} cantidad
 * @returns {{exito: boolean, mensaje: string}}
 */
function agregarAlCarrito(codigo, cantidad) {
    const producto = buscarProducto(codigo);

    if (!producto) {
        return { exito: false, mensaje: 'El producto no existe en el catálogo.' };
    }

    /* R1: no se agregan productos agotados */
    if (producto.stock === 0) {
        return { exito: false, mensaje: 'Este producto no tiene stock disponible.' };
    }

    /* R2: la cantidad mínima es 1 */
    let cantidadSolicitada = parseInt(cantidad, 10);
    if (isNaN(cantidadSolicitada) || cantidadSolicitada < 1) {
        cantidadSolicitada = 1;
    }

    const carrito = obtenerCarrito();
    const indice = carrito.findIndex(item => item.codigo === codigo);

    if (indice !== -1) {
        /* R4: se suma a lo que ya había */
        const nuevaCantidad = carrito[indice].cantidad + cantidadSolicitada;

        /* R3: nunca por sobre el stock */
        if (nuevaCantidad > producto.stock) {
            carrito[indice].cantidad = producto.stock;
            guardarCarrito(carrito);
            return {
                exito: true,
                mensaje: `Solo quedan ${producto.stock} unidades. Se ajustó la cantidad al máximo disponible.`
            };
        }

        carrito[indice].cantidad = nuevaCantidad;
    } else {
        /* R3: tampoco al agregarlo por primera vez */
        const cantidadFinal = Math.min(cantidadSolicitada, producto.stock);

        carrito.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: cantidadFinal
        });
    }

    guardarCarrito(carrito);
    return { exito: true, mensaje: `"${producto.nombre}" se agregó al carrito.` };
}

/**
 * Suma o resta unidades a un producto del carrito (reglas R3 y R5).
 * @param {string} codigo
 * @param {number} cambio +1 o -1
 */
function cambiarCantidad(codigo, cambio) {
    const carrito = obtenerCarrito();
    const indice = carrito.findIndex(item => item.codigo === codigo);

    if (indice === -1) return;

    const nuevaCantidad = carrito[indice].cantidad + cambio;
    const producto = buscarProducto(codigo);
    const stockDisponible = producto ? producto.stock : nuevaCantidad;

    /* R5: si llega a 0 se elimina del carrito */
    if (nuevaCantidad <= 0) {
        carrito.splice(indice, 1);
    } else if (nuevaCantidad > stockDisponible) {
        /* R3: tope en el stock disponible */
        carrito[indice].cantidad = stockDisponible;
    } else {
        carrito[indice].cantidad = nuevaCantidad;
    }

    guardarCarrito(carrito);
    renderizarCarrito();
}

/**
 * Elimina un producto del carrito sin importar su cantidad.
 * @param {string} codigo
 */
function eliminarDelCarrito(codigo) {
    const carrito = obtenerCarrito().filter(item => item.codigo !== codigo);
    guardarCarrito(carrito);
    renderizarCarrito();
}

/**
 * Vacía el carrito completo y descarta el cupón activo.
 */
function vaciarCarrito() {
    guardarCarrito([]);
    localStorage.removeItem(CLAVE_CUPON);
    renderizarCarrito();
}

/**
 * Calcula subtotal, descuento y total del carrito.
 * @returns {{subtotal: number, descuento: number, total: number, cupon: string|null}}
 */
function calcularTotales() {
    const carrito = obtenerCarrito();

    const subtotal = carrito.reduce((acumulado, item) => {
        return acumulado + (Number(item.precio) * Number(item.cantidad));
    }, 0);

    /* R7: un solo cupón activo, descuento porcentual sobre el subtotal */
    const cupon = obtenerCupon();
    const porcentaje = cupon && CUPONES[cupon] ? CUPONES[cupon] : 0;
    const descuento = Math.round(subtotal * porcentaje / 100);

    return {
        subtotal: subtotal,
        descuento: descuento,
        total: subtotal - descuento,
        cupon: porcentaje > 0 ? cupon : null
    };
}

/**
 * Aplica un cupón de descuento si el código existe.
 * @param {string} codigo
 * @returns {{exito: boolean, mensaje: string}}
 */
function aplicarCupon(codigo) {
    const cupon = (codigo || '').trim().toUpperCase();

    if (cupon === '') {
        return { exito: false, mensaje: 'Ingresa un código de cupón.' };
    }

    if (!CUPONES[cupon]) {
        return { exito: false, mensaje: 'El cupón ingresado no es válido.' };
    }

    if (obtenerCarrito().length === 0) {
        return { exito: false, mensaje: 'Agrega productos antes de aplicar un cupón.' };
    }

    localStorage.setItem(CLAVE_CUPON, cupon);
    return { exito: true, mensaje: `Cupón aplicado: ${CUPONES[cupon]}% de descuento.` };
}


/* ------------------------------------------------------------
   3. RENDERIZADO EN PANTALLA
   ------------------------------------------------------------ */

/**
 * Actualiza el contador de unidades en el encabezado de todas las páginas.
 */
function actualizarContadorCarrito() {
    const totalUnidades = obtenerCarrito().reduce((acumulado, item) => {
        return acumulado + (parseInt(item.cantidad, 10) || 0);
    }, 0);

    document.querySelectorAll('.cart').forEach(elemento => {
        elemento.textContent = `🛒 Cart (${totalUnidades})`;
    });
}

/**
 * Dibuja el contenido del carrito en carrito.html.
 */
function renderizarCarrito() {
    const contenedor = document.querySelector('.cart-items-section');
    if (!contenedor) return;

    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = `
            <div class="carrito-vacio">
                <p>Tu carrito está vacío.</p>
                <a href="productos.html" class="btn-primary">Ver productos</a>
            </div>
        `;
        actualizarResumen();
        actualizarContadorCarrito();
        return;
    }

    contenedor.innerHTML = carrito.map(item => {
        const subtotal = Number(item.precio) * Number(item.cantidad);
        const producto = buscarProducto(item.codigo);
        const stock = producto ? producto.stock : item.cantidad;

        return `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="item-img-placeholder">
                <div class="item-info">
                    <h4>${item.nombre}</h4>
                    <p class="item-codigo">Código: ${item.codigo}</p>
                    <p class="item-unitario">Precio unitario: ${formatearPrecio(item.precio)}</p>
                </div>
                <div class="item-price-qty">
                    <span class="item-price">${formatearPrecio(subtotal)}</span>
                    <div class="qty-controls">
                        <button class="btn-qty" data-accion="restar" data-codigo="${item.codigo}">-</button>
                        <input type="text" value="${item.cantidad}" readonly aria-label="Cantidad de ${item.nombre}">
                        <button class="btn-qty" data-accion="sumar" data-codigo="${item.codigo}" ${item.cantidad >= stock ? 'disabled' : ''}>+</button>
                    </div>
                    <button class="btn-eliminar" data-accion="eliminar" data-codigo="${item.codigo}">Eliminar</button>
                </div>
            </div>
        `;
    }).join('');

    actualizarResumen();
    actualizarContadorCarrito();
}

/**
 * Actualiza el cuadro de subtotal, descuento y total.
 */
function actualizarResumen() {
    const totales = calcularTotales();

    const elementoSubtotal = document.querySelector('.summary-subtotal');
    const elementoDescuento = document.querySelector('.summary-descuento');
    const elementoTotal = document.querySelector('.summary-total');
    const filaDescuento = document.getElementById('fila-descuento');

    if (elementoSubtotal) elementoSubtotal.textContent = formatearPrecio(totales.subtotal);
    if (elementoTotal) elementoTotal.textContent = formatearPrecio(totales.total);

    if (elementoDescuento) {
        elementoDescuento.textContent = '- ' + formatearPrecio(totales.descuento);
    }

    /* La fila de descuento solo se muestra si hay un cupón activo */
    if (filaDescuento) {
        filaDescuento.style.display = totales.descuento > 0 ? 'flex' : 'none';
    }
}
