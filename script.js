const productosPorDefecto = [
    {
        titulo: "Producto #1",
        precio: "$ 8.000",
        cantidad: 1,
        imagen: "https://placehold.co/100x100?text=Prod+1"
    },
    {
        titulo: "Producto #2",
        precio: "$ 6.000",
        cantidad: 1,
        imagen: "https://placehold.co/100x100?text=Prod+2"
    },
    {
        titulo: "Producto #3",
        precio: "$ 10.000",
        cantidad: 1,
        imagen: "https://placehold.co/100x100?text=Prod+3"
    }
];

// Inicializar el carrito con los 3 productos de la pauta si no hay nada guardado
function obtenerCarrito() {
    let carritoGuardado = localStorage.getItem('carrito');
    let carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
    
    // Si el carrito está vacío Y no hemos forzado el inicio antes, cargamos la pauta
    if (carrito.length === 0 && !localStorage.getItem('pauta_cargada')) {
        localStorage.setItem('carrito', JSON.stringify(productosPorDefecto));
        localStorage.setItem('pauta_cargada', 'true'); // Evita que se recarguen si los borras a mano
        return JSON.parse(JSON.stringify(productosPorDefecto));
    }
    
    return carrito;
}

// ==========================================
// 2. ACTUALIZAR CONTADOR DE NAVEGACIÓN
// ==========================================
function actualizarContadorCarrito() {
    const carrito = obtenerCarrito();
    let totalItems = 0;
    
    carrito.forEach(producto => {
        totalItems += (parseInt(producto.cantidad) || 0);
    });
    
    const elementoCarrito = document.querySelector('.cart');
    if (elementoCarrito) {
        elementoCarrito.innerHTML = `🛒 Cart (${totalItems})`;
    }
}

// ==========================================
// 3. CAMBIAR CANTIDAD (+ / -)
// ==========================================
function cambiarCantidad(index, cambio) {
    let carrito = obtenerCarrito();

    if (carrito[index]) {
        carrito[index].cantidad = (parseInt(carrito[index].cantidad) || 1) + cambio;

        if (carrito[index].cantidad <= 0) {
            carrito.splice(index, 1);
        }

        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
    }
}

// ==========================================
// 4. MOSTRAR PRODUCTOS EN CARRITO.HTML
// ==========================================
function renderizarCarrito() {
    const contenedor = document.querySelector('.cart-items-section');
    const elementoTotal = document.querySelector('.summary-total');
    
    if (!contenedor) return;

    let carrito = obtenerCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="padding: 30px; text-align: center; color: #666;">Tu carrito está vacío.</p>';
        if (elementoTotal) elementoTotal.innerText = '$ 0';
        actualizarContadorCarrito();
        return;
    }

    contenedor.innerHTML = '';
    let totalGeneral = 0;

    carrito.forEach((producto, index) => {
        let titulo = producto.titulo || 'Producto';
        let imagen = producto.imagen || 'https://placehold.co/100x100?text=Imagen';
        let cantidad = parseInt(producto.cantidad) || 1;
        let precioStr = producto.precio ? String(producto.precio) : '$0';
        
        let precioLimpio = parseInt(precioStr.replace(/[^0-9]/g, '')) || 0;
        let subtotal = precioLimpio * cantidad;
        totalGeneral += subtotal;

        contenedor.innerHTML += `
            <div class="cart-item">
                <img src="${imagen}" alt="${titulo}" class="item-img-placeholder" style="object-fit: cover;">
                <div class="item-info">
                    <h4>${titulo}</h4>
                    <p>Pink lorem ipsum dolor sit amet, consectetur adipisicing elit</p>
                </div>
                <div class="item-price-qty">
                    <span class="item-price">$ ${subtotal.toLocaleString('es-CL')}</span>
                    <div class="qty-controls">
                        <button class="btn-qty" onclick="cambiarCantidad(${index}, -1)">-</button>
                        <input type="text" value="${cantidad}" readonly>
                        <button class="btn-qty" onclick="cambiarCantidad(${index}, 1)">+</button>
                    </div>
                </div>
            </div>
        `;
    });

    if (elementoTotal) {
        elementoTotal.innerText = `$ ${totalGeneral.toLocaleString('es-CL')}`;
    }

    actualizarContadorCarrito();
}

// ==========================================
// 5. CAMBIAR IMAGEN EN PRODUCTO.HTML
// ==========================================
function cambiarImagen(rutaImagen, elementoMiniatura) {
    const imagenPrincipal = document.getElementById('imagen-principal');
    if (imagenPrincipal) {
        imagenPrincipal.src = rutaImagen;
    }

    const miniaturas = document.querySelectorAll('.thumb');
    miniaturas.forEach(miniatura => {
        miniatura.classList.remove('active');
    });

    if (elementoMiniatura) {
        elementoMiniatura.classList.add('active');
    }
}

// ==========================================
// 6. INICIALIZACIÓN DE EVENTOS
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorCarrito();
    renderizarCarrito();
    
    const botonAgregar = document.querySelector('.btn-add-cart');
    
    if (botonAgregar) {
        botonAgregar.addEventListener('click', () => {
            const tituloEl = document.querySelector('.product-title-price h1');
            const precioEl = document.querySelector('.product-title-price .price');
            const cantidadEl = document.getElementById('cantidad');
            const imagenEl = document.getElementById('imagen-principal');

            const titulo = tituloEl ? tituloEl.innerText : 'Producto';
            const precio = precioEl ? precioEl.innerText : '$0';
            const cantidad = cantidadEl ? parseInt(cantidadEl.value) : 1;
            const imagen = imagenEl ? imagenEl.src : '';

            const productoNuevo = {
                titulo: titulo,
                precio: precio,
                cantidad: cantidad,
                imagen: imagen
            };
            
            let carrito = obtenerCarrito();
            const indexExistente = carrito.findIndex(item => item.titulo === productoNuevo.titulo);
            
            if (indexExistente !== -1) {
                carrito[indexExistente].cantidad += productoNuevo.cantidad;
            } else {
                carrito.push(productoNuevo);
            }
            
            localStorage.setItem('carrito', JSON.stringify(carrito));
            actualizarContadorCarrito();
            
            alert('¡' + titulo + ' añadido al carrito!');
        });
    }
});
