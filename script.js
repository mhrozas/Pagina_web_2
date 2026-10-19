// ==========================================
// 7. LÓGICA DE DESCUENTOS Y COMPRA
// ==========================================
let porcentajeDescuento = 0; // Variable global para guardar el descuento activo

function aplicarDescuento() {
    const inputDescuento = document.getElementById('codigo-descuento');
    if (!inputDescuento) return;

    const codigo = inputDescuento.value.trim().toUpperCase();

    // Puedes agregar los códigos que quieras aquí
    if (codigo === 'DESCUENTO20') {
        porcentajeDescuento = 0.20; // 20% de descuento
        alert('¡Código aplicado! Se ha descontado un 20% al total.');
    } else if (codigo === 'CHSTORE10') {
        porcentajeDescuento = 0.10; // 10% de descuento
        alert('¡Código aplicado! Se ha descontado un 10% al total.');
    } else {
        porcentajeDescuento = 0;
        alert('Código inválido. Intenta nuevamente.');
    }

    // Volver a renderizar para que el total se actualice
    renderizarCarrito(); 
}

// Sobrescribir la función renderizarCarrito para incluir el descuento en el cálculo final
function renderizarCarrito() {
    const contenedor = document.querySelector('.cart-items');
    const subtotalEl = document.getElementById('subtotal-precio') || document.querySelector('.summary-row span:last-child'); // Ajuste por si usas clases
    const totalEl = document.getElementById('total-precio') || document.querySelector('.total-row span:last-child');

    if (!contenedor) return;

    let carrito = obtenerCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="padding: 30px; text-align: center; color: #666; background: #fff; border-radius: 12px;">Tu carrito está vacío.</p>';
        if (subtotalEl) subtotalEl.innerText = '$0.00';
        if (totalEl) totalEl.innerText = '$0.00';
        return;
    }

    contenedor.innerHTML = '';
    let totalGeneral = 0;

    carrito.forEach((producto, index) => {
        let titulo = producto.titulo || 'Producto';
        let imagen = producto.imagen || 'https://via.placeholder.com/100';
        let cantidad = parseInt(producto.cantidad) || 1;
        let talla = producto.talla || 'Única';
        let precioStr = producto.precio ? String(producto.precio) : '$0';
        
        let precioLimpio = parseFloat(precioStr.replace(/[^0-9.]/g, '')) || 0;
        let subtotal = precioLimpio * cantidad;
        totalGeneral += subtotal;

        contenedor.innerHTML += `
            <div class="cart-item">
                <img src="${imagen}" alt="${titulo}">
                <div class="cart-item-details">
                    <h3>${titulo}</h3>
                    <p class="item-size">Talla: ${talla}</p>
                    <button class="btn-remove" onclick="eliminarProducto(${index})">Eliminar</button>
                </div>
                <div class="cart-item-quantity">
                    <input type="number" value="${cantidad}" min="1" onchange="cambiarCantidadInput(${index}, this.value)">
                </div>
                <div class="cart-item-price">
                    $${subtotal.toFixed(2)}
                </div>
            </div>
        `;
    });

    // Mostrar subtotal sin descuento
    if (subtotalEl) subtotalEl.innerText = '$' + totalGeneral.toFixed(2);
    
    // Aplicar descuento al total
    let totalConDescuento = totalGeneral - (totalGeneral * porcentajeDescuento);
    
    if (totalEl) {
        if (porcentajeDescuento > 0) {
            // Si hay descuento, mostramos el total anterior tachado y el nuevo
            totalEl.innerHTML = `<span style="text-decoration: line-through; color: #999; font-size: 14px; margin-right: 10px;">$${totalGeneral.toFixed(2)}</span> $${totalConDescuento.toFixed(2)}`;
        } else {
            totalEl.innerText = '$' + totalConDescuento.toFixed(2);
        }
    }
}

function procesarCompra() {
    let carrito = obtenerCarrito();
    
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de pagar.');
        return;
    }

    // Generar código de envío aleatorio (Ej: CH-7X9P2)
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigoEnvio = 'CH-';
    for (let i = 0; i < 6; i++) {
        codigoEnvio += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }

    // Mensaje de éxito
    alert(`¡Compra realizada con éxito!\n\nTu pedido está siendo procesado.\nGuarda tu código de envío: ${codigoEnvio}`);

    // Vaciar el carrito en LocalStorage
    localStorage.removeItem('carrito');
    
    // Resetear descuento
    porcentajeDescuento = 0;
    
    // Limpiar input de código si existe
    const inputDescuento = document.getElementById('codigo-descuento');
    if(inputDescuento) inputDescuento.value = '';

    // Actualizar la interfaz
    actualizarContadorCarrito();
    renderizarCarrito();
}