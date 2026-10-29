/* ============================================================
   CATÁLOGO DE PRODUCTOS
   Arreglo base de la tienda. Los listados de index.html,
   productos.html y el detalle en producto.html se construyen
   a partir de este arreglo, no desde HTML escrito a mano.
   Tienda y panel comparten un único catálogo: si el
   administrador guardó cambios, se usa esa versión.
   Los campos siguen la definición del mantenedor de productos
   del administrador (código, nombre, descripción, precio,
   stock, stock crítico, categoría e imagen).
   ============================================================ */

const CATEGORIAS = ["Vestidos", "Blusas", "Conjuntos", "Pantalones"];

const CLAVE_CATALOGO = 'chstore_productos_admin';

const PRODUCTOS_BASE = [
    {
        codigo: "VES-001",
        nombre: "Vestido Largo Tropic Negro",
        descripcion: "Vestido largo con escote regulable y panal de abeja en la espalda. Su calce permite que sea un vestido cómodo y perfecto para los días cálidos. Disponible en colores neutros y versátiles para cada salida de verano.",
        precio: 20000,
        stock: 12,
        stockCritico: 3,
        categoria: "Vestidos",
        atributos: "Elegante / Noche",
        imagen: "https://froens.cl/cdn/shop/files/VESTIDOTROPICNEGRO_2.webp?v=1768960021&width=1067",
        galeria: [
            "https://froens.cl/cdn/shop/files/VESTIDOTROPICNEGRO_4.webp?v=1762782558&width=1066",
            "https://froens.cl/cdn/shop/files/VESTIDOTROPICNEGRO_3.webp?v=1762782558&width=1067",
            "https://froens.cl/cdn/shop/files/vestidolargonegrofroens_11zon.webp?v=1762782550&width=800"
        ]
    },
    {
        codigo: "CON-002",
        nombre: "Conjunto Blazer Alondra Beige",
        descripcion: "Conjunto de blazer y pantalón en tono beige, confeccionado en tela de caída suave. Ideal para la oficina o una salida formal, combina con prendas básicas de cualquier color.",
        precio: 40000,
        stock: 8,
        stockCritico: 2,
        categoria: "Conjuntos",
        atributos: "Casual / Oficina",
        imagen: "https://froens.cl/cdn/shop/files/blazer-alondra-mujer-beige-lifestyle-froens-1_d1653926-de0c-4259-9101-dafda13822c6.webp?v=1784055114&width=1282",
        galeria: []
    },
    {
        codigo: "VES-003",
        nombre: "Vestido Crema con Botones",
        descripcion: "Vestido midi color crema con botonadura frontal completa y cinturón del mismo género. Manga corta y corte recto, pensado para eventos de día.",
        precio: 25000,
        stock: 5,
        stockCritico: 5,
        categoria: "Vestidos",
        atributos: "Elegante",
        imagen: "https://tse1.explicit.bing.net/th/id/OIP.UgaNNgEDOJQRGU8mTrkkGgHaJ3?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        galeria: []
    },
    {
        codigo: "BLU-004",
        nombre: "Blusa Gris con Vuelos",
        descripcion: "Blusa de lino en tono gris con vuelos en los hombros y amarre ajustable en la cintura. Fresca y liviana, perfecta para el uso diario.",
        precio: 16000,
        stock: 20,
        stockCritico: 4,
        categoria: "Blusas",
        atributos: "Lino / Ajustable",
        imagen: "https://ae-pic-a1.aliexpress-media.com/kf/S510b4a7386c74e02bb34b58bffead5abx.jpg_960x960q75.jpg_.avif",
        galeria: []
    },
    {
        codigo: "CON-005",
        nombre: "Conjunto Rojo Dos Piezas",
        descripcion: "Conjunto de crop top y falda en color rojo intenso. Confeccionado en tela con elastano que se adapta al cuerpo. Pensado para la temporada de verano.",
        precio: 40000,
        stock: 2,
        stockCritico: 3,
        categoria: "Conjuntos",
        atributos: "Verano / Crop Top",
        imagen: "https://media.falabella.com/falabellaCL/137969943_01/w=1200,h=1200,fit=pad",
        galeria: []
    },
    {
        codigo: "VES-006",
        nombre: "Vestido Blanco Bordado",
        descripcion: "Vestido blanco con bordado artesanal en el escote y las mangas. Tela de algodón 100%, sin forro, de calce holgado y fresco.",
        precio: 20000,
        stock: 15,
        stockCritico: 3,
        categoria: "Vestidos",
        atributos: "Verano / Algodón",
        imagen: "https://img.kwcdn.com/product/fancy/41f18390-702a-4991-b607-3ab553f18b10.jpg?imageView2/2/w/500/q/70/format/webp",
        galeria: []
    },
    {
        codigo: "PAN-007",
        nombre: "Set de Shorts Básicos",
        descripcion: "Pack de dos shorts de algodón en tonos neutros, con pretina elasticada y bolsillos laterales. Cómodos para el uso diario o para dormir.",
        precio: 40000,
        stock: 10,
        stockCritico: 2,
        categoria: "Pantalones",
        atributos: "Algodón / Pack x2",
        imagen: "https://i.pinimg.com/736x/d5/13/3a/d5133aa9949232987509869ebd71b362.jpg",
        galeria: []
    },
    {
        codigo: "VES-008",
        nombre: "Vestido Mini Floral Azul",
        descripcion: "Vestido corto con estampado floral sobre fondo azul. Tirantes regulables y espalda descubierta con amarre. Ideal para salidas casuales de verano.",
        precio: 38000,
        stock: 0,
        stockCritico: 3,
        categoria: "Vestidos",
        atributos: "Estampado / Casual",
        imagen: "https://tse4.mm.bing.net/th/id/OIP.nG-0Yu1sTwwvLqvUFPKDRwHaIY?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
        galeria: []
    }
];

/**
 * Devuelve el catálogo vigente: el guardado por el panel o, si no existe, el base.
 * @returns {Array}
 */
function cargarCatalogo() {
    try {
        const guardado = localStorage.getItem(CLAVE_CATALOGO);
        const catalogo = guardado ? JSON.parse(guardado) : null;
        return Array.isArray(catalogo) ? catalogo : PRODUCTOS_BASE;
    } catch (error) {
        console.error('No se pudo leer el catálogo desde localStorage:', error);
        return PRODUCTOS_BASE;
    }
}

/**
 * Guarda el catálogo completo (lo usan el panel y la confirmación de compra).
 * @param {Array} catalogo
 */
function guardarCatalogo(catalogo) {
    try {
        localStorage.setItem(CLAVE_CATALOGO, JSON.stringify(catalogo));
    } catch (error) {
        console.error('No se pudo guardar el catálogo en localStorage:', error);
    }
}

const PRODUCTOS = cargarCatalogo();

/**
 * Formatea un número como precio en pesos chilenos.
 * @param {number} valor
 * @returns {string}
 */
function formatearPrecio(valor) {
    const numero = Number(valor) || 0;
    return "$ " + numero.toLocaleString('es-CL');
}

/**
 * Busca un producto por su código.
 * @param {string} codigo
 * @returns {object|undefined}
 */
function buscarProducto(codigo) {
    return PRODUCTOS.find(producto => producto.codigo === codigo);
}

/**
 * Devuelve los productos de una categoría. "todas" devuelve el catálogo completo.
 * @param {string} categoria
 * @returns {Array}
 */
function filtrarPorCategoria(categoria) {
    if (!categoria || categoria === "todas") return PRODUCTOS;
    return PRODUCTOS.filter(producto => producto.categoria === categoria);
}

/**
 * Construye la tarjeta HTML de un producto para los listados.
 * @param {object} producto
 * @returns {string}
 */
function plantillaTarjetaProducto(producto) {
    const agotado = producto.stock === 0;
    const critico = !agotado && producto.stock <= producto.stockCritico;
    /* Si el producto tiene galería, su primera foto aparece al pasar el mouse */
    const imagenAlterna = (producto.galeria || [])[0];

    return `
        <a href="producto.html?codigo=${producto.codigo}" class="product-card ${agotado ? 'agotado' : ''}">
            <div class="product-card-media">
                <img src="${producto.imagen}" alt="${producto.nombre}">
                ${imagenAlterna ? `<img src="${imagenAlterna}" alt="" class="imagen-alterna" loading="lazy">` : ''}
                ${critico ? '<span class="etiqueta-tarjeta etiqueta-ultimas">¡Últimas unidades!</span>' : ''}
            </div>
            <div class="product-info">
                <h3 class="product-title">${producto.nombre}</h3>
                <div class="product-details">
                    <span class="attributes">${producto.atributos || producto.categoria}</span>
                    <span class="price">${formatearPrecio(producto.precio)}</span>
                </div>
                ${agotado ? '<span class="etiqueta-agotado">SIN STOCK</span>' : ''}
            </div>
        </a>
    `;
}

/**
 * Renderiza un conjunto de productos dentro de un contenedor.
 * @param {string} idContenedor
 * @param {Array} listaProductos
 */
function renderizarProductos(idContenedor, listaProductos) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    if (listaProductos.length === 0) {
        contenedor.innerHTML = '<p class="sin-resultados">No hay productos en esta categoría.</p>';
        return;
    }

    contenedor.innerHTML = listaProductos.map(plantillaTarjetaProducto).join('');
}
