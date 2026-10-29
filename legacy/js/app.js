/* ============================================================
   APP - INICIALIZACIÓN POR PÁGINA
   Detecta qué elementos existen en el documento actual y
   conecta el renderizado y las validaciones que corresponden.
   De este modo un único archivo sirve a todas las vistas.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    pintarEnlacesSesion();

    iniciarHome();
    iniciarListadoProductos();
    iniciarDetalleProducto();
    iniciarCarrito();
    iniciarModalLogin();
    iniciarLogin();
    iniciarContacto();
    iniciarRegistro();
    iniciarNewsletter();
    iniciarNosotros();
    iniciarBarraLectura();

    /* Al final, cuando las grillas ya están dibujadas */
    iniciarAnimacionesEntrada();
});


/* ------------------------------------------------------------
   MICROANIMACIONES
   ------------------------------------------------------------ */

/**
 * Hace aparecer suavemente tarjetas y secciones al entrar en pantalla.
 * Si el usuario prefiere menos movimiento, no se aplica.
 */
function iniciarAnimacionesEntrada() {
    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (menosMovimiento || !('IntersectionObserver' in window)) return;

    const elementos = document.querySelectorAll(
        '.product-card, .blog-card, .integrante, .section-title, .cart-item, .contacto-info, ' +
        '.contacto-formulario, .pilar, .nosotros-cifras, .nosotros-cta'
    );

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;

            const elemento = entrada.target;
            elemento.classList.add('entrada-visible');
            observador.unobserve(elemento);

            /* Terminada la aparición se quitan las clases para no
               interferir con las transiciones propias del elemento */
            elemento.addEventListener('transitionend', () => {
                elemento.classList.remove('entrada', 'entrada-visible');
                elemento.style.transitionDelay = '';
            }, { once: true });
        });
    }, { threshold: 0.12 });

    elementos.forEach(elemento => {
        /* Escalonado dentro de cada grilla: cada tarjeta parte un poco después */
        const hermanos = Array.from(elemento.parentElement.children);
        elemento.style.transitionDelay = `${Math.min(hermanos.indexOf(elemento), 6) * 70}ms`;

        elemento.classList.add('entrada');
        observador.observe(elemento);
    });
}

/**
 * NOSOTROS: las cifras de productos y categorías salen del catálogo
 * y todos los números cuentan hacia arriba al aparecer en pantalla.
 */
function iniciarNosotros() {
    const cifras = document.querySelectorAll('[data-contar]');
    if (cifras.length === 0) return;

    const productos = document.getElementById('cifra-productos');
    const categorias = document.getElementById('cifra-categorias');
    if (productos) productos.dataset.contar = PRODUCTOS.length;
    if (categorias) categorias.dataset.contar = CATEGORIAS.length;

    const escribir = (elemento, valor) => {
        elemento.textContent = valor + (elemento.dataset.sufijo || '');
    };

    cifras.forEach(elemento => escribir(elemento, elemento.dataset.contar));

    const menosMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (menosMovimiento || !('IntersectionObserver' in window)) return;

    const contar = (elemento) => {
        const desde = Number(elemento.dataset.desde || 0);
        const hasta = Number(elemento.dataset.contar);
        const duracion = 1200;
        const inicio = performance.now();

        const paso = (ahora) => {
            const avance = Math.min((ahora - inicio) / duracion, 1);
            const suavizado = 1 - Math.pow(1 - avance, 3);
            escribir(elemento, Math.round(desde + (hasta - desde) * suavizado));
            if (avance < 1) requestAnimationFrame(paso);
        };

        requestAnimationFrame(paso);
    };

    const observador = new IntersectionObserver((entradas) => {
        entradas.forEach(entrada => {
            if (!entrada.isIntersecting) return;
            contar(entrada.target);
            observador.unobserve(entrada.target);
        });
    }, { threshold: 0.6 });

    cifras.forEach(elemento => observador.observe(elemento));
}

/**
 * BLOGS: la barra superior avanza según cuánto se ha leído del artículo.
 */
function iniciarBarraLectura() {
    const barra = document.getElementById('barra-lectura');
    const articulo = document.querySelector('.blog-detalle article');
    if (!barra || !articulo) return;

    const actualizar = () => {
        const inicio = articulo.offsetTop;
        const recorrido = articulo.offsetHeight - window.innerHeight;
        const avance = recorrido > 0 ? (window.scrollY - inicio) / recorrido : 1;
        barra.style.transform = `scaleX(${Math.min(Math.max(avance, 0), 1)})`;
    };

    window.addEventListener('scroll', actualizar, { passive: true });
    window.addEventListener('resize', actualizar);
    actualizar();
}

/**
 * Muestra un aviso flotante que desaparece solo.
 * @param {string} mensaje
 */
function mostrarAvisoFlotante(mensaje) {
    const anterior = document.querySelector('.aviso-flotante');
    if (anterior) anterior.remove();

    const aviso = document.createElement('div');
    aviso.className = 'aviso-flotante';
    aviso.setAttribute('role', 'status');
    aviso.innerHTML = `<span></span><a href="carrito.html">Ver carrito →</a>`;
    aviso.querySelector('span').textContent = mensaje;
    document.body.appendChild(aviso);

    setTimeout(() => {
        aviso.classList.add('saliendo');
        setTimeout(() => aviso.remove(), 300);
    }, 3500);
}


/* ------------------------------------------------------------
   ENCABEZADO: enlaces según la sesión activa
   ------------------------------------------------------------ */
function pintarEnlacesSesion() {
    const contenedor = document.getElementById('auth-links');
    const sesion = obtenerSesion();
    if (!contenedor || !sesion) return;

    const enlacePanel = puedeEntrarAlPanel(sesion)
        ? ' | <a href="admin/index.html">Administración</a>'
        : '';

    contenedor.innerHTML = `
        <span class="saludo">Hola, ${sesion.nombre} (${sesion.tipoUsuario})</span>
        ${enlacePanel} | <button type="button" id="btn-cerrar-sesion">Cerrar sesión</button>
    `;

    document.getElementById('btn-cerrar-sesion').addEventListener('click', () => {
        cerrarSesion();
        window.location.reload();
    });
}


/* ------------------------------------------------------------
   HOME: productos destacados
   ------------------------------------------------------------ */
function iniciarHome() {
    if (!document.getElementById('grid-destacados')) return;

    /* Se destacan los primeros 4 productos con stock */
    const destacados = PRODUCTOS.filter(p => p.stock > 0).slice(0, 4);
    renderizarProductos('grid-destacados', destacados);
}


/* ------------------------------------------------------------
   PRODUCTOS: listado completo con filtro por categoría
   ------------------------------------------------------------ */
function iniciarListadoProductos() {
    const grid = document.getElementById('grid-productos');
    const filtro = document.getElementById('filtro-categoria');
    if (!grid) return;

    if (!filtro) {
        renderizarProductos('grid-productos', PRODUCTOS);
        return;
    }

    CATEGORIAS.forEach(categoria => {
        const opcion = document.createElement('option');
        opcion.value = categoria;
        opcion.textContent = categoria;
        filtro.appendChild(opcion);
    });

    /* Los enlaces del pie de página llegan con ?categoria= */
    const categoriaUrl = new URLSearchParams(window.location.search).get('categoria');
    if (categoriaUrl && CATEGORIAS.includes(categoriaUrl)) {
        filtro.value = categoriaUrl;
    }

    renderizarProductos('grid-productos', filtrarPorCategoria(filtro.value));

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
    document.getElementById('producto-codigo').textContent = 'Código: ' + producto.codigo;
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

    miniaturas.innerHTML = imagenes.length > 1
        ? imagenes.map((url, indice) => `
            <img src="${url}" alt="Vista ${indice + 1} de ${producto.nombre}" class="${indice === 0 ? 'active' : ''}">
        `).join('')
        : '';

    miniaturas.addEventListener('click', (evento) => {
        const miniatura = evento.target.closest('img');
        if (!miniatura) return;

        imagenPrincipal.src = miniatura.src;
        miniaturas.querySelectorAll('img').forEach(img => img.classList.remove('active'));
        miniatura.classList.add('active');
    });

    /* Estado del stock */
    mostrarEstadoStock(producto);

    /* Tallas disponibles */
    const selectTalla = document.getElementById('talla');
    if (selectTalla) {
        Object.keys(TALLAS).forEach(talla => {
            const opcion = document.createElement('option');
            opcion.value = talla;
            opcion.textContent = TALLAS[talla];
            selectTalla.appendChild(opcion);
        });

        selectTalla.addEventListener('change', () => limpiarError('talla'));
    }

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
            if (selectTalla) selectTalla.disabled = true;
        }

        boton.addEventListener('click', () => {
            const talla = selectTalla ? selectTalla.value : '';

            if (selectTalla && !talla) {
                mostrarError('talla', 'Selecciona una talla antes de añadir el producto al carrito.');
                return;
            }
            limpiarError('talla');

            const cantidad = selectCantidad ? parseInt(selectCantidad.value, 10) : 1;
            const resultado = agregarAlCarrito(producto.codigo, cantidad, talla);
            const aviso = document.getElementById('exito-carrito');

            /* Lo agregado se confirma con el aviso flotante; los problemas,
               bajo el botón */
            if (resultado.exito) {
                aviso.classList.remove('visible');
                mostrarAvisoFlotante(resultado.mensaje);
                actualizarContadorCarrito(true);
            } else {
                aviso.classList.add('aviso-error');
                mostrarExito('exito-carrito', resultado.mensaje);
            }
        });
    }

    /* Productos relacionados: misma categoría, excluyendo el actual */
    const relacionados = PRODUCTOS
        .filter(p => p.categoria === producto.categoria && p.codigo !== producto.codigo)
        .slice(0, 4);

    /* Si no hay otros productos de la categoría, la sección no se muestra */
    const seccionRelacionados = document.querySelector('.producto-relacionados');
    if (relacionados.length === 0 && seccionRelacionados) {
        seccionRelacionados.hidden = true;
        return;
    }

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
    const contenedor = document.getElementById('lista-carrito');
    if (!contenedor) return;

    renderizarCarrito();

    /* Delegación de eventos: los botones se crean dinámicamente */
    contenedor.addEventListener('click', (evento) => {
        const boton = evento.target.closest('[data-accion]');
        if (!boton) return;

        const clave = boton.dataset.clave;

        if (boton.dataset.accion === 'sumar') cambiarCantidad(clave, 1);
        if (boton.dataset.accion === 'restar') cambiarCantidad(clave, -1);
        if (boton.dataset.accion === 'eliminar') eliminarDelCarrito(clave);
    });

    /* Cupón de descuento */
    const botonCupon = document.getElementById('btn-aplicar-cupon');
    if (botonCupon) {
        botonCupon.addEventListener('click', () => {
            const campo = document.getElementById('cupon');
            const resultado = aplicarCupon(campo.value);

            const contenedorCupon = document.getElementById('error-cupon');

            if (resultado.exito) {
                limpiarError('cupon');
                actualizarResumen();
                contenedorCupon.textContent = resultado.mensaje;
                contenedorCupon.classList.add('visible', 'mensaje-ok');
            } else {
                contenedorCupon.classList.remove('mensaje-ok');
                mostrarError('cupon', resultado.mensaje);
            }
        });
    }

    /* Vaciar carrito */
    const botonVaciar = document.getElementById('btn-vaciar');
    if (botonVaciar) {
        botonVaciar.addEventListener('click', () => {
            vaciarCarrito();
            limpiarError('cupon');
        });
    }

    /* Pagar: R8, se registra la orden y el carrito se vacía */
    const botonPagar = document.getElementById('btn-pagar');
    if (botonPagar) {
        botonPagar.addEventListener('click', () => {
            const resultado = confirmarCompra();

            if (!resultado.exito) {
                mostrarError('pago', resultado.mensaje);
                return;
            }

            document.getElementById('carrito-contenido').innerHTML = `
                <div class="compra-confirmada">
                    <h3>¡Compra realizada con éxito!</h3>
                    <p>Total pagado: <strong>${formatearPrecio(resultado.total)}</strong></p>
                    <p>Guarda tu código de seguimiento de envío:</p>
                    <p class="codigo-envio">${resultado.codigoEnvio}</p>
                    <p>Recibirás el detalle de tu pedido en tu correo registrado.</p>
                    <a href="productos.html" class="btn-primary">Seguir comprando</a>
                </div>
            `;

            actualizarContadorCarrito();
        });
    }
}


/* ------------------------------------------------------------
   VENTANA DE INICIO DE SESIÓN (portada)
   ------------------------------------------------------------ */
function iniciarModalLogin() {
    const modal = document.getElementById('login-modal');
    const abrir = document.getElementById('open-login-btn');
    if (!modal || !abrir) return;

    const cerrar = () => modal.classList.remove('abierto');

    abrir.addEventListener('click', (evento) => {
        evento.preventDefault();
        modal.classList.add('abierto');
        document.getElementById('correo').focus();
    });

    modal.querySelector('.close-btn').addEventListener('click', cerrar);

    /* Clic fuera del cuadro o tecla Escape cierran la ventana */
    modal.addEventListener('click', (evento) => {
        if (evento.target === modal) cerrar();
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') cerrar();
    });
}


/* ------------------------------------------------------------
   LOGIN
   Reglas: correo requerido, máx 100, dominio autorizado.
           contraseña requerida, entre 4 y 10 caracteres.
   El correo debe pertenecer a un usuario registrado; su perfil
   define a dónde se redirige (ver js/datos.js).
   ------------------------------------------------------------ */
function iniciarLogin() {
    const formulario = document.getElementById('form-login');
    if (!formulario) return;

    /* Aviso cuando se llega desde el panel sin permisos */
    if (new URLSearchParams(window.location.search).get('acceso') === 'panel') {
        const aviso = document.getElementById('exito-login');
        aviso.classList.add('aviso-error');
        mostrarExito('exito-login', 'Para entrar al panel inicia sesión con una cuenta de Administrador o Vendedor.');
    }

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

        if (!esValido) return;

        const usuario = buscarUsuarioPorCorreo(document.getElementById('correo').value);

        if (!usuario) {
            mostrarError('correo', 'No existe una cuenta registrada con este correo.');
            return;
        }

        const sesion = iniciarSesion(usuario);
        const destino = puedeEntrarAlPanel(sesion) ? 'admin/index.html' : 'index.html';

        const aviso = document.getElementById('exito-login');
        aviso.classList.remove('aviso-error');
        mostrarExito('exito-login', `Hola, ${sesion.nombre}. Sesión iniciada como ${sesion.tipoUsuario}. Redirigiendo...`);
        formulario.reset();

        setTimeout(() => {
            window.location.href = destino;
        }, 1200);
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
   Reglas completas del mantenedor de usuarios. La cuenta queda
   guardada con perfil Cliente y sin contraseña (RNF-07).
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
        telefono: (v) => {
            if (!v) return '';
            return /^\+?[0-9 ]{8,15}$/.test(v.trim())
                ? ''
                : 'El teléfono solo admite números, entre 8 y 15 dígitos.';
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

        if (!validarFormulario(listaReglas)) return;

        const valor = id => document.getElementById(id).value.trim();

        const resultado = registrarUsuario({
            run: valor('run').toUpperCase(),
            nombre: valor('nombre'),
            apellidos: valor('apellidos'),
            correo: valor('correo'),
            tipoUsuario: 'Cliente',
            region: valor('region'),
            comuna: valor('comuna'),
            direccion: valor('direccion'),
            telefono: valor('telefono'),
            fechaNacimiento: ''
        });

        if (!resultado.exito) {
            mostrarError(resultado.campo, resultado.mensaje);
            return;
        }

        mostrarExito('exito-registro', 'Tu cuenta fue creada correctamente. Ya puedes iniciar sesión.');
        formulario.reset();
        document.getElementById('comuna').disabled = true;
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
            contenedorError.classList.remove('mensaje-ok');
            contenedorError.classList.add('visible');
        } else {
            contenedorError.textContent = '¡Gracias por suscribirte!';
            contenedorError.classList.add('visible');
            contenedorError.classList.add('mensaje-ok');
            formulario.reset();
        }
    });
}
