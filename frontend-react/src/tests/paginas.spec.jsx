import { Route, Routes, useLocation } from 'react-router-dom';
import Productos from '../pages/Productos';
import DetalleProducto from '../pages/DetalleProducto';
import Carrito from '../pages/Carrito';
import Checkout from '../pages/Checkout';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Contacto from '../pages/Contacto';
import ResultadoCompra from '../pages/ResultadoCompra';
import Ofertas from '../pages/Ofertas';
import RutaAdmin from '../components/RutaAdmin';
import * as db from '../data/db';
import { montar, clic, escribir, elegir, enviar } from './helpers';

const limpiar = () => {
    localStorage.clear();
    db.reiniciar();
};

const sembrarCarrito = () => localStorage.setItem('chstore_carrito', JSON.stringify([
    { codigo: 'VES-001', nombre: 'Vestido Largo Tropic Negro', precio: 20000, imagen: '/img/logo-chstore.png', talla: 'M', cantidad: 2 }
]));

const sembrarSesion = tipoUsuario => localStorage.setItem('chstore_sesion', JSON.stringify({
    nombre: 'Admin', apellidos: 'Demo', correo: 'admin@duoc.cl', tipoUsuario
}));

describe('Páginas de la tienda', () => {
    let vista;
    beforeEach(limpiar);
    afterEach(() => { vista && vista.desmontar(); limpiar(); });

    describe('Productos (filtros de búsqueda)', () => {
        it('lista todo el catálogo por defecto', () => {
            vista = montar(<Productos />, { ruta: '/productos' });
            expect(vista.contenedor.querySelectorAll('.product-card').length).toBe(8);
        });

        it('filtra por texto con el parámetro ?q=', () => {
            vista = montar(<Productos />, { ruta: '/productos?q=blusa' });
            const tarjetas = vista.contenedor.querySelectorAll('.product-card');
            expect(tarjetas.length).toBe(1);
            expect(tarjetas[0].textContent).toContain('Blusa Gris');
        });

        it('el filtro "solo con stock" oculta los productos agotados', () => {
            vista = montar(<Productos />, { ruta: '/productos' });
            clic(vista.contenedor.querySelector('#soloStock'));
            expect(vista.contenedor.querySelectorAll('.product-card').length).toBe(7);
        });

        it('filtra por categoría y ordena por precio', () => {
            vista = montar(<Productos />, { ruta: '/productos' });
            elegir(vista.contenedor.querySelector('select[aria-label="Categoría"]'), 'Vestidos');
            elegir(vista.contenedor.querySelector('select[aria-label="Ordenar"]'), 'desc');
            const nombres = [...vista.contenedor.querySelectorAll('.card-title')].map(t => t.textContent);
            expect(nombres.length).toBe(4);
            expect(nombres[0]).toBe('Vestido Mini Floral Azul');
        });

        it('muestra un mensaje cuando nada coincide', () => {
            vista = montar(<Productos />, { ruta: '/productos?q=zzzz' });
            expect(vista.contenedor.textContent).toContain('No hay productos que coincidan');
        });
    });

    describe('Ofertas', () => {
        it('solo muestra productos con descuento', () => {
            vista = montar(<Ofertas />);
            expect(vista.contenedor.querySelectorAll('.product-card').length).toBe(db.listarOfertas().length);
        });
    });

    describe('Detalle de producto', () => {
        const montarDetalle = codigo => montar(
            <Routes><Route path="/producto/:codigo" element={<DetalleProducto />} /></Routes>,
            { ruta: `/producto/${codigo}`, conProviders: true }
        );

        it('muestra la ficha del producto', () => {
            vista = montarDetalle('VES-001');
            expect(vista.contenedor.querySelector('h1').textContent).toBe('Vestido Largo Tropic Negro');
        });

        it('añadir al carrito guarda el producto y avisa al usuario', () => {
            vista = montarDetalle('VES-001');
            const boton = [...vista.contenedor.querySelectorAll('button')].find(b => b.textContent === 'Añadir al carrito');
            clic(boton);
            expect(vista.contenedor.querySelector('.alert-success').textContent).toContain('se agregó al carrito');
            expect(JSON.parse(localStorage.getItem('chstore_carrito'))[0].cantidad).toBe(1);
        });

        it('un producto agotado tiene el botón deshabilitado', () => {
            vista = montarDetalle('VES-008');
            const boton = [...vista.contenedor.querySelectorAll('button')].find(b => b.textContent === 'Sin stock');
            expect(boton.disabled).toBeTrue();
        });

        it('un producto inexistente muestra un aviso', () => {
            vista = montarDetalle('NO-EXISTE');
            expect(vista.contenedor.textContent).toContain('no existe');
        });
    });

    describe('Carrito', () => {
        it('con el carrito vacío ofrece ir al catálogo', () => {
            vista = montar(<Carrito />, { conProviders: true });
            expect(vista.contenedor.textContent).toContain('Tu carrito está vacío');
        });

        it('sumar, restar y eliminar actualizan las líneas', () => {
            sembrarCarrito();
            vista = montar(<Carrito />, { conProviders: true });
            const boton = etiqueta => vista.contenedor.querySelector(`button[aria-label="${etiqueta}"]`);

            clic(boton('Agregar una unidad'));
            expect(vista.contenedor.querySelector('tbody tr .btn-light').textContent).toBe('3');
            clic(boton('Quitar una unidad'));
            clic(boton('Quitar una unidad'));
            clic(boton('Quitar una unidad'));
            expect(vista.contenedor.textContent).toContain('Tu carrito está vacío');
        });

        it('aplica un cupón válido y rechaza uno inexistente', () => {
            sembrarCarrito();
            vista = montar(<Carrito />, { conProviders: true });
            const aplicar = [...vista.contenedor.querySelectorAll('button')].find(b => b.textContent === 'Aplicar');

            escribir(vista.contenedor.querySelector('#cupon'), 'FALSO');
            clic(aplicar);
            expect(vista.contenedor.querySelector('.alert-warning').textContent).toContain('no es válido');

            escribir(vista.contenedor.querySelector('#cupon'), 'duoc15');
            clic(aplicar);
            expect(vista.contenedor.querySelector('.alert-success').textContent).toContain('15%');
            expect(vista.contenedor.textContent).toContain('Descuento (DUOC15)');
            expect(localStorage.getItem('chstore_cupon')).toBe('DUOC15');
        });
    });

    describe('Checkout y resultado del pago', () => {
        const Destino = () => <p id="destino">{useLocation().pathname}</p>;
        const montarCheckout = () => montar(
            <Routes>
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pago-exitoso/:numero" element={<Destino />} />
                <Route path="/pago-error/:numero" element={<Destino />} />
            </Routes>,
            { ruta: '/checkout', conProviders: true }
        );
        const llenarFormulario = () => {
            const c = vista.contenedor;
            escribir(c.querySelector('#nombre'), 'Ana');
            escribir(c.querySelector('#apellidos'), 'Soto');
            escribir(c.querySelector('#correo'), 'ana@gmail.com');
            escribir(c.querySelector('#calle'), 'Los Crisantemos 123');
            elegir(c.querySelector('#region'), 'RM');
            elegir(c.querySelector('#comuna'), 'Cerrillos');
        };

        it('sin productos en el carrito no permite pagar', () => {
            vista = montarCheckout();
            expect(vista.contenedor.textContent).toContain('No tienes productos en el carrito');
        });

        it('muestra errores si se intenta pagar con el formulario vacío', () => {
            sembrarCarrito();
            vista = montarCheckout();
            enviar(vista.contenedor.querySelector('form'));
            expect(vista.contenedor.querySelectorAll('.invalid-feedback').length).toBeGreaterThan(3);
            expect(db.listar('ordenes').length).toBe(4);
        });

        it('pago aprobado: registra la orden, descuenta stock y vacía el carrito', () => {
            sembrarCarrito();
            vista = montarCheckout();
            llenarFormulario();
            enviar(vista.contenedor.querySelector('form'));

            expect(vista.contenedor.querySelector('#destino').textContent).toMatch(/^\/pago-exitoso\/CH-/);
            expect(db.listar('ordenes')[0].estado).toBe('Pendiente de despacho');
            expect(db.obtener('productos', 'VES-001').stock).toBe(10);
            expect(JSON.parse(localStorage.getItem('chstore_carrito'))).toEqual([]);
        });

        it('pago rechazado: registra el intento, conserva el carrito y no toca el stock', () => {
            sembrarCarrito();
            vista = montarCheckout();
            llenarFormulario();
            elegir(vista.contenedor.querySelector('#resultadoPago'), 'rechazado');
            enviar(vista.contenedor.querySelector('form'));

            expect(vista.contenedor.querySelector('#destino').textContent).toMatch(/^\/pago-error\/CH-/);
            expect(db.listar('ordenes')[0].estado).toBe('Pago rechazado');
            expect(db.obtener('productos', 'VES-001').stock).toBe(12);
            expect(JSON.parse(localStorage.getItem('chstore_carrito')).length).toBe(1);
        });

        it('si hay sesión iniciada, los datos del cliente se completan solos', () => {
            localStorage.setItem('chstore_sesion', JSON.stringify({ nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', tipoUsuario: 'Cliente' }));
            sembrarCarrito();
            vista = montarCheckout();
            expect(vista.contenedor.querySelector('#nombre').value).toBe('Cliente');
            expect(vista.contenedor.querySelector('#correo').value).toBe('cliente@gmail.com');
            expect(vista.contenedor.querySelector('#region').value).toBe('RM');
        });

        it('ResultadoCompra muestra la boleta de una orden aprobada y el reintento en una rechazada', () => {
            const items = [{ codigo: 'A', nombre: 'Prod A', talla: 'M', cantidad: 1, precio: 5000, imagen: '/img/logo-chstore.png' }];
            const datosEntrega = { calle: 'Calle 1', departamento: '', region: 'RM', comuna: 'Santiago', indicaciones: '' };
            db.registrarOrden({ numero: 'CH-OK', cliente: 'Ana Soto', correo: 'a@gmail.com', total: 5000, datosEntrega, items });
            db.registrarOrden({ numero: 'CH-NO', cliente: 'Ana Soto', correo: 'a@gmail.com', total: 5000, datosEntrega, items });

            vista = montar(<Routes><Route path="/x/:numero" element={<ResultadoCompra exitoso />} /></Routes>, { ruta: '/x/CH-OK' });
            expect(vista.contenedor.querySelector('h1').textContent).toContain('Se ha realizado la compra');
            expect(vista.contenedor.textContent).toContain('Imprimir boleta en PDF');
            vista.desmontar();

            vista = montar(<Routes><Route path="/x/:numero" element={<ResultadoCompra exitoso={false} />} /></Routes>, { ruta: '/x/CH-NO' });
            expect(vista.contenedor.querySelector('h1').textContent).toContain('No se pudo realizar el pago');
            expect(vista.contenedor.textContent).toContain('Volver a realizar el pago');
        });

        it('imprimir boleta llama a window.print (simulado con un espía)', () => {
            const items = [{ codigo: 'A', nombre: 'Prod A', talla: '', cantidad: 1, precio: 5000, imagen: '/img/logo-chstore.png' }];
            const datosEntrega = { calle: 'Calle 1', departamento: '', region: 'RM', comuna: 'Santiago', indicaciones: '' };
            db.registrarOrden({ numero: 'CH-P', cliente: 'Ana', correo: 'a@gmail.com', total: 5000, datosEntrega, items });
            spyOn(window, 'print');

            vista = montar(<Routes><Route path="/x/:numero" element={<ResultadoCompra exitoso />} /></Routes>, { ruta: '/x/CH-P' });
            clic([...vista.contenedor.querySelectorAll('button')].find(b => b.textContent.includes('Imprimir')));
            expect(window.print).toHaveBeenCalled();
        });
    });

    describe('Inicio de sesión', () => {
        const montarLogin = () => montar(<Login />, { conProviders: true });
        const llenar = (correo, password) => {
            escribir(vista.contenedor.querySelector('#correo'), correo);
            escribir(vista.contenedor.querySelector('#password'), password);
            enviar(vista.contenedor.querySelector('form'));
        };

        it('valida los campos obligatorios', () => {
            vista = montarLogin();
            enviar(vista.contenedor.querySelector('form'));
            expect(vista.contenedor.querySelectorAll('.invalid-feedback').length).toBe(2);
        });

        it('informa si no existe una cuenta con ese correo', () => {
            vista = montarLogin();
            llenar('nadie@gmail.com', '1234');
            expect(vista.contenedor.querySelector('.alert-danger').textContent).toContain('No existe una cuenta');
            expect(localStorage.getItem('chstore_sesion')).toBeNull();
        });

        it('con credenciales válidas guarda la sesión', () => {
            vista = montarLogin();
            llenar('admin@duoc.cl', '1234');
            expect(JSON.parse(localStorage.getItem('chstore_sesion')).tipoUsuario).toBe('Administrador');
        });
    });

    describe('Registro de usuario', () => {
        it('muestra errores de RUN inválido y de contraseñas distintas', () => {
            vista = montar(<Registro />);
            const c = vista.contenedor;
            escribir(c.querySelector('#run'), '123');
            escribir(c.querySelector('#password'), '1234');
            escribir(c.querySelector('#confirm_password'), '9999');
            enviar(c.querySelector('form'));
            expect(c.querySelector('#error-run').textContent).toContain('entre 7 y 9');
            expect(c.querySelector('#error-confirm_password').textContent).toContain('no coinciden');
        });

        it('un registro válido crea el usuario con perfil Cliente', () => {
            vista = montar(<Registro />);
            const c = vista.contenedor;
            escribir(c.querySelector('#run'), '19011029K');
            escribir(c.querySelector('#nombre'), 'Ana');
            escribir(c.querySelector('#apellidos'), 'Soto');
            escribir(c.querySelector('#correo'), 'ana@duoc.cl');
            escribir(c.querySelector('#password'), '1234');
            escribir(c.querySelector('#confirm_password'), '1234');
            elegir(c.querySelector('#region'), 'RM');
            elegir(c.querySelector('#comuna'), 'Santiago');
            escribir(c.querySelector('#direccion'), 'Calle 1');
            enviar(c.querySelector('form'));

            expect(db.obtener('usuarios', '19011029K').tipoUsuario).toBe('Cliente');
            expect(c.querySelector('.alert-success')).not.toBeNull();
        });
    });

    describe('Contacto', () => {
        it('valida el comentario obligatorio y confirma el envío', () => {
            vista = montar(<Contacto />);
            const c = vista.contenedor;
            enviar(c.querySelector('form'));
            expect(c.textContent).toContain('El campo nombre es obligatorio');

            escribir(c.querySelector('#nombre'), 'Ana');
            escribir(c.querySelector('#comentario'), 'Hola');
            expect(c.textContent).toContain('4 / 500');
            enviar(c.querySelector('form'));
            expect(c.querySelector('.alert-success')).not.toBeNull();
        });
    });
});

describe('Control de acceso al panel (RutaAdmin)', () => {
    let vista;
    beforeEach(limpiar);
    afterEach(() => { vista && vista.desmontar(); limpiar(); });

    const montarRutas = () => montar(
        <Routes>
            <Route path="/login" element={<p id="pantalla">LOGIN</p>} />
            <Route path="/admin" element={<RutaAdmin><p id="pantalla">TABLERO</p></RutaAdmin>} />
            <Route path="/admin/usuarios" element={<RutaAdmin seccion="usuarios"><p id="pantalla">USUARIOS</p></RutaAdmin>} />
        </Routes>,
        { ruta: '/admin/usuarios', conProviders: true }
    );

    it('sin sesión redirige al login', () => {
        vista = montarRutas();
        expect(vista.contenedor.querySelector('#pantalla').textContent).toBe('LOGIN');
    });

    it('un Cliente no puede entrar al panel', () => {
        sembrarSesion('Cliente');
        vista = montarRutas();
        expect(vista.contenedor.querySelector('#pantalla').textContent).toBe('LOGIN');
    });

    it('un Vendedor entra al panel pero no a la sección de usuarios', () => {
        sembrarSesion('Vendedor');
        vista = montarRutas();
        expect(vista.contenedor.querySelector('#pantalla').textContent).toBe('TABLERO');
    });

    it('un Administrador accede a todas las secciones', () => {
        sembrarSesion('Administrador');
        vista = montarRutas();
        expect(vista.contenedor.querySelector('#pantalla').textContent).toBe('USUARIOS');
    });
});
