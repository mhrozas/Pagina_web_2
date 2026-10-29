/* ============================================================
   CARRITO DE COMPRAS
   Persistencia en LOCALSTORAGE bajo la clave "chstore_carrito".

   REGLAS DE NEGOCIO DEFINIDAS PARA EL CARRITO
   -------------------------------------------
   R1. Un producto sin stock (stock = 0) no puede agregarse.
   R2. La cantidad mínima por producto en el carrito es 1.
   R3. La cantidad máxima por producto es su stock disponible,
       sumando todas las tallas del mismo producto.
   R4. Si el producto ya está en el carrito en la misma talla, la
       nueva cantidad se suma a la existente, sin superar nunca
       el stock (R3).
   R5. Al bajar la cantidad a 0 con el botón "-", el producto se
       elimina del carrito.
   R6. El carrito sobrevive al cierre del navegador porque se
       guarda en localStorage y se lee en cada carga de página.
   R7. Los cupones aplican un descuento porcentual sobre el
       subtotal y solo puede haber un cupón activo a la vez.
   R8. Al confirmar el pago se registra la orden con su código de
       envío, se descuenta el stock y el carrito se vacía.
   ============================================================ */

const CLAVE_CARRITO = 'chstore_carrito';
const CLAVE_CUPON = 'chstore_cupon';

/* Cupones disponibles y su porcentaje de descuento */
const CUPONES = {
    "DESCUENTO20": 20,
    "CHSTORE10": 10,
    "BIENVENIDA10": 10,
    "VERANO20": 20,
    "DUOC15": 15
};

/* Tallas disponibles para todas las prendas */
const TALLAS = {
    "S": "S (Pequeña)",
    "M": "M (Mediana)",
    "L": "L (Grande)"
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

/**
 * Identifica una línea del carrito: el mismo producto en otra talla es otra línea.
 * @param {object} item
 * @returns {string}
 */
function claveItem(item) {
    return item.codigo + '|' + (item.talla || '');
}

/**
 * Suma las unidades de un producto en el carrito, considerando todas sus tallas.
 * @param {Array} carrito
 * @param {string} codigo
 * @returns {number}
 */
function unidadesDelProducto(carrito, codigo) {
    return carrito
        .filter(item => item.codigo === codigo)
        .reduce((total, item) => total + Number(item.cantidad), 0);
}


/* ------------------------------------------------------------
   2. OPERACIONES SOBRE EL CARRITO
   ------------------------------------------------------------ */

/**
 * Agrega un producto al carrito aplicando las reglas R1 a R4.
 * @param {string} codigo
 * @param {number} cantidad
 * @param {string} talla
 * @returns {{exito: boolean, mensaje: string}}
 */
function agregarAlCarrito(codigo, cantidad, talla) {
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

    /* R3: nunca por sobre el stock, sumando todas las tallas */
    const disponible = producto.stock - unidadesDelProducto(carrito, codigo);
    if (disponible <= 0) {
        return {
            exito: false,
            mensaje: `Ya tienes en tu carrito las ${producto.stock} unidades disponibles.`
        };
    }

    const cantidadFinal = Math.min(cantidadSolicitada, disponible);
    const nuevoItem = { codigo: producto.codigo, talla: talla || '' };
    const indice = carrito.findIndex(item => claveItem(item) === claveItem(nuevoItem));

    if (indice !== -1) {
        /* R4: se suma a lo que ya había en la misma talla */
        carrito[indice].cantidad += cantidadFinal;
    } else {
        carrito.push({
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            imagen: producto.imagen,
            talla: talla || '',
            cantidad: cantidadFinal
        });
    }

    guardarCarrito(carrito);

    if (cantidadFinal < cantidadSolicitada) {
        return {
            exito: true,
            mensaje: `Solo quedaban ${disponible} unidades disponibles. Se ajustó la cantidad al máximo.`
        };
    }

    return { exito: true, mensaje: `"${producto.nombre}" se agregó al carrito.` };
}

/**
 * Suma o resta unidades a una línea del carrito (reglas R3 y R5).
 * @param {string} clave Código y talla de la línea.
 * @param {number} cambio +1 o -1
 */
function cambiarCantidad(clave, cambio) {
    const carrito = obtenerCarrito();
    const indice = carrito.findIndex(item => claveItem(item) === clave);

    if (indice === -1) return;

    const item = carrito[indice];
    const nuevaCantidad = item.cantidad + cambio;
    const producto = buscarProducto(item.codigo);

    /* R3: el tope considera lo que ocupan las otras tallas del producto */
    const otrasTallas = unidadesDelProducto(carrito, item.codigo) - item.cantidad;
    const stockDisponible = producto ? producto.stock - otrasTallas : nuevaCantidad;

    /* R5: si llega a 0 se elimina del carrito */
    if (nuevaCantidad <= 0) {
        carrito.splice(indice, 1);
    } else if (nuevaCantidad > stockDisponible) {
        item.cantidad = Math.max(stockDisponible, 1);
    } else {
        item.cantidad = nuevaCantidad;
    }

    guardarCarrito(carrito);
    renderizarCarrito();
}

/**
 * Elimina una línea del carrito sin importar su cantidad.
 * @param {string} clave Código y talla de la línea.
 */
function eliminarDelCarrito(clave) {
    const carrito = obtenerCarrito().filter(item => claveItem(item) !== clave);
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

/**
 * Genera un código de seguimiento de envío, por ejemplo CH-8A3X1Z.
 * @returns {string}
 */
function generarCodigoEnvio() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = 'CH-';
    for (let i = 0; i < 6; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
}

/**
 * Confirma la compra (R8): registra la orden, descuenta el stock
 * del catálogo y vacía el carrito.
 * @returns {{exito: boolean, mensaje?: string, codigoEnvio?: string, total?: number}}
 */
function confirmarCompra() {
    const carrito = obtenerCarrito();

    if (carrito.length === 0) {
        return { exito: false, mensaje: 'Tu carrito está vacío. Agrega productos antes de pagar.' };
    }

    const totales = calcularTotales();
    const codigoEnvio = generarCodigoEnvio();
    const sesion = obtenerSesion();

    registrarOrden({
        numero: codigoEnvio,
        cliente: sesion ? `${sesion.nombre} ${sesion.apellidos}` : 'Cliente invitado',
        fecha: new Date().toISOString().slice(0, 10),
        productos: unidadesTotales(carrito),
        total: totales.total,
        estado: 'Pendiente de despacho'
    });

    /* Se descuenta del catálogo compartido lo que se acaba de vender */
    const catalogo = PRODUCTOS.map(producto => {
        const vendidas = unidadesDelProducto(carrito, producto.codigo);
        return vendidas ? { ...producto, stock: Math.max(producto.stock - vendidas, 0) } : producto;
    });
    guardarCatalogo(catalogo);

    guardarCarrito([]);
    localStorage.removeItem(CLAVE_CUPON);

    return { exito: true, codigoEnvio: codigoEnvio, total: totales.total };
}


/* ------------------------------------------------------------
   3. RENDERIZADO EN PANTALLA
   ------------------------------------------------------------ */

function unidadesTotales(carrito) {
    return carrito.reduce((acumulado, item) => acumulado + (parseInt(item.cantidad, 10) || 0), 0);
}

/**
 * Actualiza el contador de unidades del botón del carrito en todas las páginas.
 * @param {boolean} animar Si es true, el contador hace un pequeño salto.
 */
function actualizarContadorCarrito(animar = false) {
    const totalUnidades = unidadesTotales(obtenerCarrito());

    document.querySelectorAll('.cart-badge').forEach(elemento => {
        elemento.textContent = totalUnidades;

        if (animar) {
            elemento.classList.remove('salto');
            void elemento.offsetWidth; /* reinicia la animación si se repite */
            elemento.classList.add('salto');
            elemento.addEventListener('animationend', () => elemento.classList.remove('salto'), { once: true });
        }
    });
}

/**
 * Dibuja el contenido del carrito en carrito.html.
 */
function renderizarCarrito() {
    const contenedor = document.getElementById('lista-carrito');
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
        const otrasTallas = unidadesDelProducto(carrito, item.codigo) - item.cantidad;
        const tope = producto ? producto.stock - otrasTallas : item.cantidad;
        const clave = claveItem(item);

        return `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="cart-item-details">
                    <h3>${item.nombre}</h3>
                    ${item.talla ? `<p class="item-size">Talla: ${item.talla}</p>` : ''}
                    <p class="item-unitario">Precio unitario: ${formatearPrecio(item.precio)}</p>
                    <button class="btn-remove" data-accion="eliminar" data-clave="${clave}">Eliminar</button>
                </div>
                <div class="cart-item-quantity">
                    <div class="qty-controls">
                        <button class="btn-qty" data-accion="restar" data-clave="${clave}" aria-label="Quitar una unidad">-</button>
                        <input type="text" value="${item.cantidad}" readonly aria-label="Cantidad de ${item.nombre}">
                        <button class="btn-qty" data-accion="sumar" data-clave="${clave}" aria-label="Agregar una unidad" ${item.cantidad >= tope ? 'disabled' : ''}>+</button>
                    </div>
                </div>
                <div class="cart-item-price">${formatearPrecio(subtotal)}</div>
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

    const elementoSubtotal = document.getElementById('subtotal-precio');
    const elementoDescuento = document.getElementById('descuento-precio');
    const elementoTotal = document.getElementById('total-precio');
    const filaDescuento = document.getElementById('fila-descuento');

    if (elementoSubtotal) elementoSubtotal.textContent = formatearPrecio(totales.subtotal);
    if (elementoTotal) elementoTotal.textContent = formatearPrecio(totales.total);

    if (elementoDescuento) {
        elementoDescuento.textContent = `- ${formatearPrecio(totales.descuento)} (${totales.cupon || ''})`;
    }

    /* La fila de descuento solo se muestra si hay un cupón activo */
    if (filaDescuento) {
        filaDescuento.style.display = totales.descuento > 0 ? 'flex' : 'none';
    }
}
