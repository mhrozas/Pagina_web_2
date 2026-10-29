import App from '../App';
import * as db from '../data/db';
import { montar, clic, escribir, enviar } from './helpers';

describe('Navegación de la aplicación (App con todas las rutas)', () => {
    let vista;
    beforeEach(() => { localStorage.clear(); db.reiniciar(); });
    afterEach(() => { vista && vista.desmontar(); localStorage.clear(); db.reiniciar(); });

    const ir = (ruta) => { vista = montar(<App />, { ruta, conProviders: true }); return vista.contenedor; };

    const rutasPublicas = [
        ['/', 'Ch.Store'],
        ['/productos', 'Productos'],
        ['/producto/CON-002', 'Conjunto Blazer Alondra Beige'],
        ['/categorias', 'Categorías'],
        ['/categorias/Blusas', 'Blusas'],
        ['/ofertas', 'Ofertas'],
        ['/carrito', 'Tu carrito está vacío.'],
        ['/login', 'Iniciar sesión'],
        ['/registro', 'Registro de usuario'],
        ['/nosotros', 'Moda femenina de calidad,'],
        ['/blogs', 'Noticias y datos curiosos'],
        ['/blogs/2', 'Cinco formas de cuidar tus prendas para que duren más'],
        ['/contacto', 'Contáctanos']
    ];

    rutasPublicas.forEach(([ruta, titulo]) => {
        it(`la ruta ${ruta} muestra "${titulo}"`, () => {
            expect(ir(ruta).querySelector('h1').textContent).toContain(titulo);
        });
    });

    it('una ruta desconocida muestra "Página no encontrada"', () => {
        expect(ir('/no-existe').textContent).toContain('Página no encontrada');
    });

    it('un blog o una categoría inexistentes muestran un aviso', () => {
        expect(ir('/blogs/99').textContent).toContain('no existe');
        vista.desmontar();
        expect(ir('/categorias/Zapatos').textContent).toContain('no existe');
    });

    it('el encabezado muestra el total y las unidades del carrito', () => {
        localStorage.setItem('chstore_carrito', JSON.stringify([{ codigo: 'VES-001', nombre: 'V', precio: 1000, imagen: '/x.png', talla: 'M', cantidad: 3 }]));
        const c = ir('/');
        expect(c.querySelector('.cart-badge').textContent).toBe('3');
        expect(c.querySelector('header').textContent).toContain('$ 3.000');
    });

    it('el buscador del encabezado lleva al catálogo filtrado', () => {
        const c = ir('/');
        escribir(c.querySelector('input[type="search"]'), 'blusa');
        enviar(c.querySelector('form[role="search"]'));
        expect(c.querySelector('h1').textContent).toBe('Productos');
        expect(c.querySelectorAll('.product-card').length).toBe(1);
    });

    it('sin sesión, entrar a /admin redirige al login con aviso', () => {
        const c = ir('/admin');
        expect(c.querySelector('h1').textContent).toBe('Iniciar sesión');
        expect(c.querySelector('.alert-danger').textContent).toContain('administrador o vendedor');
    });

    it('flujo completo: iniciar sesión como administrador y llegar al panel', () => {
        const c = ir('/login');
        escribir(c.querySelector('#correo'), 'admin@duoc.cl');
        escribir(c.querySelector('#password'), '1234');
        enviar(c.querySelector('main form'));
        expect(c.querySelector('h1').textContent).toBe('Dashboard');
    });

    it('cerrar sesión desde el panel vuelve al login y borra la sesión', () => {
        localStorage.setItem('chstore_sesion', JSON.stringify({ nombre: 'Admin', apellidos: 'Demo', correo: 'admin@duoc.cl', tipoUsuario: 'Administrador' }));
        const c = ir('/admin');
        clic([...c.querySelectorAll('button')].find(b => b.textContent.includes('Cerrar sesión')));
        expect(localStorage.getItem('chstore_sesion')).toBeNull();
        expect(c.querySelector('h1').textContent).toBe('Iniciar sesión');
    });

    it('un cliente con sesión ve su nombre en el encabezado y no el acceso al panel', () => {
        localStorage.setItem('chstore_sesion', JSON.stringify({ nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', tipoUsuario: 'Cliente' }));
        const c = ir('/');
        expect(c.querySelector('header').textContent).toContain('Cliente');
        expect(c.querySelector('header').textContent).not.toContain('Panel de administración');
    });
});
