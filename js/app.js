/* ============================================================
   APP - INICIALIZACIÓN POR PÁGINA
   Detecta qué elementos existen en el documento actual y
   conecta el renderizado y las validaciones que corresponden.
   De este modo un único archivo sirve a todas las vistas.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();

    iniciarHome();
    iniciarListadoProductos();
    iniciarDetalleProducto();
    iniciarCarrito();
    iniciarLogin();
    iniciarContacto();
    iniciarRegistro();
    iniciarNewsletter();
});


/* ------------------------------------------------------------
   HOME: productos destacados
   ------------------------------------------------------------ */
function iniciarHome() {
    if (!document.getElementById('grid-destacados')) return;

    /* Se muestran los primeros 8 productos del catálogo */
    renderizarProductos('grid-destacados', PRODUCTOS.slice(0, 8));
}


/* ------------------------------------------------------------
   PRODUCTOS: listado completo con filtro por categoría
   ------------------------------------------------------------ */
function iniciarListadoProductos() {
    const grid = document.getElementById('grid-productos');
    const filtro = document.getElementById('filtro-categoria');
    if (!grid) return;

    renderizarProductos('grid-productos', PRODUCTOS);

    if (!filtro) return;

    CATEGORIAS.forEach(categoria => {
        const opcion = document.createElement('option');
        opcion.value = categoria;
        opcion.textContent = categoria;
        filtro.appendChild(opcion);
    });

    filtro.addEventListener('change', () => {
        renderizarProductos('grid-productos', filtrarPorCategoria(filtro.value));
    });
}


/* ------------------------------------------------------------
   DETALLE DE PRODUCTO: se carga según ?codigo= de la URL
   ------------------------------------------------------------ */
function iniciarDetalleProducto() {
    const contenedorNombre = document.getElementById('producto-nombre');
    if (!contenedorNombre) return;

    const parametros = new URLSearchParams(window.location.search);
    const codigo = parametros.get('codigo') || PRODUCTOS[0].codigo;
    const producto = buscarProducto(codigo);

    if (!producto) {
        contenedorNombre.textContent = 'Producto no encontrado';
        document.getElementById('producto-descripcion').textContent =
            'El producto que buscas no existe o fue retirado del catálogo.';
        const boton = document.getElementById('btn-add-cart');
        if (boton) boton.disabled = true;
        return;
    }

    /* Datos principales */
    contenedorNombre.textContent = producto.nombre;
    document.getElementById('producto-precio').textContent = formatearPrecio(producto.precio);
    document.getElementById('producto-codigo').textContent = producto.codigo;
    document.getElementById('producto-categoria').textContent = 'Categoría: ' + producto.categoria;
    document.getElementById('producto-descripcion').textContent = producto.descripcion;
    document.getElementById('breadcrumb-producto').textContent = producto.nombre;
    document.title = producto.nombre + ' - Ch.Store';

    /* Imagen principal */
    const imagenPrincipal = document.getElementById('imagen-principal');
    imagenPrincipal.src = producto.imagen;
    imagenPrincipal.alt = producto.nombre;

    /* Galería de miniaturas: la imagen principal más las adicionales */
    const miniaturas = document.getElementById('miniaturas');
    const imagenes = [producto.imagen].concat(producto.galeria || []);

    miniaturas.innerHTML = imagenes.map((url, indice) => `
        <div class="thumb ${indice === 0 ? 'active' : ''}" data-imagen="${url}">
            <img src="${url}" alt="Vista ${indice + 1} de ${producto.nombre}">
        </div>
    `).join('');

    miniaturas.addEventListener('click', (evento) => {
        const miniatura = evento.target.closest('.thumb');
        if (!miniatura) return;

        imagenPrincipal.src = miniatura.dataset.imagen;
        miniaturas.querySelectorAll('.thumb').forEach(t => t.classList.remove('active'));
        miniatura.classList.add('active');
    });

    /* Estado del stock */
    mostrarEstadoStock(producto);

    /* El select de cantidad no puede ofrecer más unidades que el stock */
    const selectCantidad = document.getElementById('cantidad');
    if (selectCantidad) {
        const maximo = Math.min(producto.stock, 5);
        selectCantidad.innerHTML = '';

        for (let i = 1; i <= maximo; i++) {
            const opcion = document.createElement('option');
            opcion.value = i;
            opcion.textContent = i;
            selectCantidad.appendChild(opcion);
        }

        if (maximo === 0) selectCantidad.disabled = true;
    }

    /* Botón añadir al carrito */
    const boton = document.getElementById('btn-add-cart');
    if (boton) {
        if (producto.stock === 0) {
            boton.disabled = true;
            boton.textContent = 'Sin stock';
        }

        boton.addEventListener('click', () => {
            const cantidad = selectCantidad ? parseInt(selectCantidad.value, 10) : 1;
            const resultado = agregarAlCarrito(producto.codigo, cantidad);

            if (resultado.exito) {
                mostrarExito('exito-carrito', resultado.mensaje);
                actualizarContadorCarrito();
            } else {
                mostrarExito('exito-carrito', resultado.mensaje);
            }
        });
    }

    /* Productos relacionados: misma categoría, excluyendo el actual */
    const relacionados = PRODUCTOS
        .filter(p => p.categoria === producto.categoria && p.codigo !== producto.codigo)
        .slice(0, 4);

    renderizarProductos('grid-relacionados', relacionados);
}

/**
 * Muestra si el producto tiene stock, está en nivel crítico o agotado.
 */
function mostrarEstadoStock(producto) {
    const contenedor = document.getElementById('producto-stock');
    if (!contenedor) return;

    if (producto.stock === 0) {
        contenedor.textContent = 'Producto sin stock';
        contenedor.className = 'producto-stock stock-agotado';
    } else if (producto.stock <= producto.stockCritico) {
        contenedor.textContent = `¡Últimas ${producto.stock} unidades!`;
        contenedor.className = 'producto-stock stock-critico';
    } else {
        contenedor.textContent = `${producto.stock} unidades disponibles`;
        contenedor.className = 'producto-stock stock-ok';
    }
}


/* ------------------------------------------------------------
   CARRITO: render, controles de cantidad, cupón y pago
   ------------------------------------------------------------ */
function iniciarCarrito() {
    const contenedor = document.querySelector('.cart-items-section');
    if (!contenedor) return;

    renderizarCarrito();

    /* Delegación de eventos: los botones se crean dinámicamente */
    contenedor.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-accion]');
        if (!boton) return;

        const codigo = boton.dataset.codigo;

        if (boton.dataset.accion === 'sumar') cambiarCantidad(codigo, 1);
        if (boton.dataset.accion === 'restar') cambiarCantidad(codigo, -1);
        if (boton.dataset.accion === 'eliminar') eliminarDelCarrito(codigo);
    });

    /* Cupón de descuento */
    const botonCupon = document.getElementById('btn-aplicar-cupon');
    if (botonCupon) {
        botonCupon.addEventListener('click', () => {
            const campo = document.getElementById('cupon');
            const resultado = aplicarCupon(campo.value);

            if (resultado.exito) {
                limpiarError('cupon');
                actualizarResumen();
                mostrarExito('error-cupon', resultado.mensaje);
            } else {
                mostrarError('cupon', resultado.mensaje);
            }
        });
    }

    /* Vaciar carrito */
    const botonVaciar = document.getElementById('btn-vaciar');
    if (botonVaciar) {
        botonVaciar.addEventListener('click', () => {
            vaciarCarrito();
        });
    }

    /* Pagar: R8, el carrito se vacía al confirmar */
    const botonPagar = document.getElementById('btn-pagar');
    if (botonPagar) {
        botonPagar.addEventListener('click', () => {
            const totales = calcularTotales();

            if (totales.total === 0 && obtenerCarrito().length === 0) {
                mostrarError('cupon', 'Tu carrito está vacío.');
                return;
            }

            contenedor.innerHTML = `
                <div class="compra-confirmada">
                    <h3>¡Compra realizada con éxito!</h3>
                    <p>Total pagado: <strong>${formatearPrecio(totales.total)}</strong></p>
                    <p>Recibirás el detalle de tu pedido en tu correo registrado.</p>
                    <a href="productos.html" class="btn-primary">Seguir comprando</a>
                </div>
            `;

            vaciarCarrito();
            actualizarContadorCarrito();
        });
    }
}


/* ------------------------------------------------------------
   LOGIN
   Reglas: correo requerido, máx 100, dominio autorizado.
           contraseña requerida, entre 4 y 10 caracteres.
   ------------------------------------------------------------ */
function iniciarLogin() {
    const formulario = document.getElementById('form-login');
    if (!formulario) return;

    const reglaCorreo = encadenar(
        v => validarRequerido(v, 'correo'),
        v => validarMaximo(v, 100, 'correo'),
        v => validarCorreo(v)
    );

    const reglaPassword = encadenar(
        v => validarRequerido(v, 'contraseña'),
        v => validarRango(v, 4, 10, 'contraseña')
    );

    validarEnTiempoReal('correo', reglaCorreo);
    validarEnTiempoReal('password', reglaPassword);

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const esValido = validarFormulario([
            { campo: 'correo', validar: reglaCorreo },
            { campo: 'password', validar: reglaPassword }
        ]);

        if (esValido) {
            mostrarExito('exito-login', 'Sesión iniciada correctamente. Redirigiendo...');
            formulario.reset();
        }
    });
}


/* ------------------------------------------------------------
   CONTACTO
   Reglas: nombre requerido máx 100, correo opcional con dominio
           autorizado máx 100, comentario requerido máx 500.
   ------------------------------------------------------------ */
function iniciarContacto() {
    const formulario = document.getElementById('form-contacto');
    if (!formulario) return;

    const reglaNombre = encadenar(
        v => validarRequerido(v, 'nombre'),
        v => validarMaximo(v, 100, 'nombre')
    );

    const reglaCorreo = encadenar(
        v => validarMaximo(v, 100, 'correo'),
        v => validarCorreo(v)
    );

    const reglaComentario = encadenar(
        v => validarRequerido(v, 'comentario'),
        v => validarMaximo(v, 500, 'comentario')
    );

    validarEnTiempoReal('nombre', reglaNombre);
    validarEnTiempoReal('correo', reglaCorreo);
    validarEnTiempoReal('comentario', reglaComentario);
    activarContador('comentario', 'contador-comentario', 500);

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const esValido = validarFormulario([
            { campo: 'nombre', validar: reglaNombre },
            { campo: 'correo', validar: reglaCorreo },
            { campo: 'comentario', validar: reglaComentario }
        ]);

        if (esValido) {
            mostrarExito('exito-contacto', 'Tu mensaje fue enviado. Te responderemos dentro de 24 horas hábiles.');
            formulario.reset();
            document.getElementById('contador-comentario').textContent = '0 / 500';
        }
    });
}


/* ------------------------------------------------------------
   REGISTRO DE USUARIO
   Reglas completas del mantenedor de usuarios.
   ------------------------------------------------------------ */
function iniciarRegistro() {
    const formulario = document.getElementById('form-registro');
    if (!formulario) return;

    inicializarRegionComuna('region', 'comuna');

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
        password: encadenar(
            v => validarRequerido(v, 'contraseña'),
            v => validarRango(v, 4, 10, 'contraseña')
        ),
        confirm_password: (v) => {
            const password = document.getElementById('password').value;
            if (!v) return 'Debes confirmar la contraseña.';
            if (v !== password) return 'Las contraseñas no coinciden.';
            return '';
        },
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

        if (validarFormulario(listaReglas)) {
            mostrarExito('exito-registro', 'Tu cuenta fue creada correctamente. Ya puedes iniciar sesión.');
            formulario.reset();
            document.getElementById('comuna').disabled = true;
        }
    });
}


/* ------------------------------------------------------------
   NEWSLETTER DEL PIE DE PÁGINA
   ------------------------------------------------------------ */
function iniciarNewsletter() {
    const formulario = document.getElementById('form-newsletter');
    if (!formulario) return;

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();

        const campo = document.getElementById('newsletter-correo');
        const error = encadenar(
            v => validarRequerido(v, 'correo'),
            v => validarCorreo(v)
        )(campo.value);

        const contenedorError = document.getElementById('error-newsletter');

        if (error) {
            contenedorError.textContent = error;
            contenedorError.classList.add('visible');
        } else {
            contenedorError.textContent = '¡Gracias por suscribirte!';
            contenedorError.classList.add('visible');
            contenedorError.classList.add('mensaje-ok');
            formulario.reset();
        }
    });
}
