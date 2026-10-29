import * as db from '../data/db';
import { alResolver } from '../utils/asincrono';

const ADMIN = { run: '111111111', nombre: 'Admin', apellidos: 'Demo', correo: 'admin@duoc.cl', tipoUsuario: 'Administrador' };
const VENDEDOR = { run: '222222222', nombre: 'Vendedor', apellidos: 'Demo', correo: 'vendedor@duoc.cl', tipoUsuario: 'Vendedor' };
const CLIENTE = { run: '333333333', nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', tipoUsuario: 'Cliente' };
const PRODUCTOS = [{ codigo: 'P-1', nombre: 'Uno', categoria: 'Blusas', precio: 1000, stock: 5, stockCritico: 1, descuento: 0 }];
const CATEGORIAS = [{ nombre: 'Blusas', descripcion: '' }];

const esperar = (ms = 0) => new Promise(resolver => setTimeout(resolver, ms));

/**
 * Reemplaza fetch por un servidor simulado. `responder` recibe la llamada y devuelve
 * [estado, cuerpo]; las llamadas quedan registradas en `llamadas` para revisarlas.
 */
function simularServidor(responder) {
    const llamadas = [];
    spyOn(window, 'fetch').and.callFake(async (url, opciones = {}) => {
        const llamada = {
            metodo: opciones.method || 'GET',
            ruta: url.replace('/api', ''),
            cuerpo: opciones.body ? JSON.parse(opciones.body) : undefined,
            token: (opciones.headers || {}).Authorization
        };
        llamadas.push(llamada);
        const [estado, cuerpo] = responder(llamada);
        return new Response(estado === 204 ? null : JSON.stringify(cuerpo ?? {}), { status: estado });
    });
    return llamadas;
}

/** Servidor que responde como el backend real para el catálogo y la sesión. */
function servidorNormal(extra = () => null) {
    return llamada => {
        const personalizada = extra(llamada);
        if (personalizada) return personalizada;
        const { metodo, ruta } = llamada;
        if (metodo === 'GET' && ruta === '/productos') return [200, PRODUCTOS];
        if (metodo === 'GET' && ruta === '/categorias') return [200, CATEGORIAS];
        if (metodo === 'GET' && ruta === '/usuarios') return [200, [ADMIN, VENDEDOR, CLIENTE]];
        if (metodo === 'GET' && ruta === '/ordenes') return [200, [{ numero: 'ORD-1', estado: 'Entregada' }]];
        if (metodo === 'POST' && ruta === '/auth/login') {
            const usuario = { [ADMIN.correo]: ADMIN, [VENDEDOR.correo]: VENDEDOR, [CLIENTE.correo]: CLIENTE }[llamada.cuerpo.correo];
            return usuario && llamada.cuerpo.password === 'demo1234'
                ? [200, { token: 'token-' + usuario.tipoUsuario, usuario }]
                : [401, { mensaje: 'Correo o contraseña incorrectos.' }];
        }
        if (metodo === 'POST' && ruta === '/auth/logout') return [204];
        if (metodo === 'DELETE' || metodo === 'POST') return [metodo === 'POST' ? 201 : 204, {}];
        return [200, {}];
    };
}

describe('Base de datos en modo API (backend)', () => {
    afterEach(() => {
        db.desconectarApi();
        localStorage.clear();
    });

    describe('conectarApi', () => {
        it('carga el catálogo y activa el modo API', async () => {
            simularServidor(servidorNormal());
            await db.conectarApi('/api');
            expect(db.usandoApi()).toBeTrue();
            expect(db.listar('productos')).toEqual(PRODUCTOS);
            expect(db.listar('categorias')).toEqual(CATEGORIAS);
        });

        it('no pide usuarios ni órdenes sin una sesión iniciada', async () => {
            const llamadas = simularServidor(servidorNormal());
            await db.conectarApi('/api');
            expect(llamadas.map(l => l.ruta).sort()).toEqual(['/categorias', '/productos']);
            expect(db.listar('usuarios')).toEqual([]);
            expect(db.listar('ordenes')).toEqual([]);
        });

        it('si el servidor falla vuelve al modo local y avisa con un error', async () => {
            spyOn(window, 'fetch').and.rejectWith(new TypeError('Failed to fetch'));
            await expectAsync(db.conectarApi('/api')).toBeRejected();
            expect(db.usandoApi()).toBeFalse();
            expect(db.listar('productos').length).toBe(8, 'usa los datos locales de respaldo');
        });

        it('acepta una dirección con barra final', async () => {
            const llamadas = simularServidor(servidorNormal());
            await db.conectarApi('/api/');
            expect(llamadas[0].ruta).not.toContain('//');
        });
    });

    describe('inicio y cierre de sesión', () => {
        let llamadas;

        beforeEach(async () => {
            llamadas = simularServidor(servidorNormal());
            await db.conectarApi('/api');
        });

        it('un login válido guarda el token y carga lo que el perfil puede ver (administrador)', async () => {
            const r = await db.iniciarSesionApi('admin@duoc.cl', 'demo1234');
            expect(r.exito).toBeTrue();
            expect(r.usuario.tipoUsuario).toBe('Administrador');
            expect(localStorage.getItem('chstore_token')).toBe('token-Administrador');
            expect(db.listar('usuarios').length).toBe(3);
            expect(db.listar('ordenes').length).toBe(1);
        });

        it('el vendedor carga las órdenes pero no la lista de usuarios', async () => {
            await db.iniciarSesionApi('vendedor@duoc.cl', 'demo1234');
            expect(llamadas.some(l => l.ruta === '/usuarios')).toBeFalse();
            expect(db.listar('ordenes').length).toBe(1);
            expect(db.listar('usuarios')).toEqual([VENDEDOR], 'solo conoce su propia cuenta');
        });

        it('el cliente no carga ni usuarios ni órdenes', async () => {
            await db.iniciarSesionApi('cliente@gmail.com', 'demo1234');
            expect(llamadas.some(l => l.ruta === '/usuarios' || l.ruta === '/ordenes')).toBeFalse();
            expect(db.listar('ordenes')).toEqual([]);
        });

        it('un login incorrecto devuelve el mensaje del servidor y no guarda token', async () => {
            const r = await db.iniciarSesionApi('admin@duoc.cl', 'mala');
            expect(r.exito).toBeFalse();
            expect(r.mensaje).toBe('Correo o contraseña incorrectos.');
            expect(localStorage.getItem('chstore_token')).toBeNull();
        });

        it('después del login las peticiones llevan el token', async () => {
            await db.iniciarSesionApi('admin@duoc.cl', 'demo1234');
            db.crear('categorias', { nombre: 'Nueva', descripcion: '' });
            await esperar();
            const post = llamadas.find(l => l.metodo === 'POST' && l.ruta === '/categorias');
            expect(post.token).toBe('Bearer token-Administrador');
        });

        it('si el servidor no responde al iniciar sesión informa del problema de conexión', async () => {
            window.fetch.and.rejectWith(new TypeError('Failed to fetch'));
            const r = await db.iniciarSesionApi('admin@duoc.cl', 'demo1234');
            expect(r.exito).toBeFalse();
            expect(r.mensaje).toContain('No se pudo conectar');
        });

        it('cerrar sesión avisa al servidor, borra el token y vacía los datos privados', async () => {
            await db.iniciarSesionApi('admin@duoc.cl', 'demo1234');
            await db.cerrarSesionApi();
            expect(llamadas.some(l => l.ruta === '/auth/logout')).toBeTrue();
            expect(localStorage.getItem('chstore_token')).toBeNull();
            expect(db.listar('usuarios')).toEqual([]);
            expect(db.listar('ordenes')).toEqual([]);
        });

        it('cerrar sesión funciona aunque el servidor no responda', async () => {
            await db.iniciarSesionApi('admin@duoc.cl', 'demo1234');
            window.fetch.and.rejectWith(new TypeError('Failed to fetch'));
            await db.cerrarSesionApi();
            expect(localStorage.getItem('chstore_token')).toBeNull();
        });
    });

    describe('restaurarSesionApi', () => {
        it('sin token no hace nada', async () => {
            simularServidor(servidorNormal());
            await db.conectarApi('/api');
            expect(await db.restaurarSesionApi()).toBeNull();
        });

        it('con un token vigente devuelve al usuario y carga sus datos', async () => {
            simularServidor(servidorNormal(l => (l.ruta === '/auth/yo' ? [200, { usuario: ADMIN }] : null)));
            await db.conectarApi('/api');
            localStorage.setItem('chstore_token', 'token-Administrador');
            expect(await db.restaurarSesionApi()).toEqual(ADMIN);
            expect(db.listar('usuarios').length).toBe(3);
        });

        it('con un token que el servidor rechaza lo descarta', async () => {
            simularServidor(servidorNormal(l => (l.ruta === '/auth/yo' ? [401, { mensaje: 'Debes iniciar sesión.' }] : null)));
            await db.conectarApi('/api');
            localStorage.setItem('chstore_token', 'vencido');
            expect(await db.restaurarSesionApi()).toBeNull();
            expect(localStorage.getItem('chstore_token')).toBeNull();
        });

        it('fuera del modo API devuelve null', async () => {
            expect(await db.restaurarSesionApi()).toBeNull();
        });
    });

    describe('sesión vencida', () => {
        it('un 401 con token guardado borra el token y avisa a los suscriptores', async () => {
            simularServidor(servidorNormal(l => (l.metodo === 'POST' && l.ruta === '/productos' ? [401, { mensaje: 'Debes iniciar sesión.' }] : null)));
            await db.conectarApi('/api');
            await db.iniciarSesionApi('admin@duoc.cl', 'demo1234');
            const aviso = jasmine.createSpy('aviso');
            const cancelar = db.suscribirExpiracion(aviso);
            spyOn(console, 'error');

            db.crear('productos', { codigo: 'X-1', nombre: 'X', categoria: 'Blusas' });
            await esperar(20);

            expect(aviso).toHaveBeenCalledTimes(1);
            expect(localStorage.getItem('chstore_token')).toBeNull();
            cancelar();
        });

        it('un login fallido (401) no se toma por sesión vencida', async () => {
            simularServidor(servidorNormal());
            await db.conectarApi('/api');
            localStorage.setItem('chstore_token', 'viejo');
            const aviso = jasmine.createSpy('aviso');
            const cancelar = db.suscribirExpiracion(aviso);
            await db.iniciarSesionApi('admin@duoc.cl', 'mala');
            expect(aviso).not.toHaveBeenCalled();
            cancelar();
        });
    });

    describe('escrituras', () => {
        let llamadas;

        beforeEach(async () => {
            llamadas = simularServidor(servidorNormal());
            await db.conectarApi('/api');
        });

        it('crear actualiza la caché al instante y envía el registro al servidor', async () => {
            const r = db.crear('categorias', { nombre: 'Abrigos', descripcion: 'Frío' });
            expect(r.exito).toBeTrue();
            expect(db.obtener('categorias', 'Abrigos')).toBeDefined();
            await esperar();
            const post = llamadas.find(l => l.metodo === 'POST' && l.ruta === '/categorias');
            expect(post.cuerpo).toEqual({ nombre: 'Abrigos', descripcion: 'Frío' });
        });

        it('los datos extra (contraseña) viajan al servidor pero no quedan en la caché', async () => {
            db.crear('usuarios', { run: '999999999', nombre: 'Ana', correo: 'ana@x.cl', tipoUsuario: 'Cliente' }, { password: 'clave1' });
            await esperar();
            const post = llamadas.find(l => l.ruta === '/usuarios' && l.metodo === 'POST');
            expect(post.cuerpo.password).toBe('clave1');
            expect(JSON.stringify(db.listar('usuarios'))).not.toContain('clave1');
        });

        it('actualizar envía solo los cambios por PUT', async () => {
            db.actualizar('productos', 'P-1', { precio: 2000 });
            await esperar();
            const put = llamadas.find(l => l.metodo === 'PUT');
            expect(put.ruta).toBe('/productos/P-1');
            expect(put.cuerpo).toEqual({ precio: 2000 });
            expect(db.obtener('productos', 'P-1').precio).toBe(2000);
        });

        it('el identificador se codifica en la ruta', async () => {
            db.crear('categorias', { nombre: 'A/B', descripcion: '' });
            db.eliminar('categorias', 'A/B');
            await esperar();
            expect(llamadas.find(l => l.metodo === 'DELETE').ruta).toBe('/categorias/A%2FB');
        });

        it('eliminar quita el registro de la caché y llama a DELETE', async () => {
            db.eliminar('productos', 'P-1');
            await esperar();
            expect(db.obtener('productos', 'P-1')).toBeUndefined();
            expect(llamadas.some(l => l.metodo === 'DELETE' && l.ruta === '/productos/P-1')).toBeTrue();
        });

        it('registrar una orden la envía al servidor, que descuenta el stock; el front solo refleja el cambio', async () => {
            const orden = { numero: 'CH-1', correo: 'a@x.cl', estado: 'Pendiente de despacho', items: [{ codigo: 'P-1', cantidad: 2 }] };
            db.registrarOrden(orden);
            db.descontarStock(orden.items);
            await esperar();
            expect(llamadas.filter(l => l.ruta === '/ordenes' && l.metodo === 'POST').length).toBe(1);
            expect(llamadas.some(l => l.ruta.includes('descontar'))).toBeFalse();
            expect(db.obtener('productos', 'P-1').stock).toBe(3);
            expect(db.listar('ordenes')[0].numero).toBe('CH-1');
        });

        it('si el servidor rechaza un guardado vuelve a leer la colección', async () => {
            spyOn(console, 'error');
            llamadas.length = 0;
            window.fetch.and.callFake(async (url, opciones = {}) => {
                const metodo = opciones.method || 'GET';
                llamadas.push({ metodo, ruta: url.replace('/api', '') });
                if (metodo === 'POST') return new Response(JSON.stringify({ mensaje: 'Ya existe' }), { status: 409 });
                return new Response(JSON.stringify(CATEGORIAS), { status: 200 });
            });

            db.crear('categorias', { nombre: 'Rara', descripcion: '' });
            expect(db.obtener('categorias', 'Rara')).toBeDefined('se muestra de inmediato');
            await esperar(20);
            expect(db.obtener('categorias', 'Rara')).toBeUndefined('se revierte al fallar el servidor');
            expect(llamadas.some(l => l.metodo === 'GET' && l.ruta === '/categorias')).toBeTrue();
        });

        it('suscribir avisa cuando cambia una colección', async () => {
            const aviso = jasmine.createSpy('aviso');
            const cancelar = db.suscribir(aviso);
            db.eliminar('productos', 'P-1');
            expect(aviso).toHaveBeenCalled();
            cancelar();
        });

        it('reiniciar restaura los datos en el servidor y vuelve a cargar el catálogo', async () => {
            db.reiniciar();
            await esperar(20);
            expect(llamadas.some(l => l.metodo === 'POST' && l.ruta === '/reiniciar')).toBeTrue();
            expect(llamadas.filter(l => l.metodo === 'GET' && l.ruta === '/productos').length).toBe(2);
        });

        it('si reiniciar falla lo deja registrado en la consola', async () => {
            const error = spyOn(console, 'error');
            window.fetch.and.rejectWith(new TypeError('Failed to fetch'));
            db.reiniciar();
            await esperar(20);
            expect(error).toHaveBeenCalled();
        });
    });

    describe('registrarUsuario con backend', () => {
        beforeEach(async () => {
            simularServidor(servidorNormal());
            await db.conectarApi('/api');
        });

        it('envía la contraseña al servidor y devuelve éxito', async () => {
            const llamadas = [];
            window.fetch.and.callFake(async (url, opciones) => {
                llamadas.push(JSON.parse(opciones.body));
                return new Response(JSON.stringify({ usuario: CLIENTE }), { status: 201 });
            });
            const r = await db.registrarUsuario({ run: '1', correo: 'a@x.cl' }, 'clave1');
            expect(r.exito).toBeTrue();
            expect(llamadas[0].password).toBe('clave1');
        });

        it('traduce un conflicto del servidor al campo repetido', async () => {
            window.fetch.and.resolveTo(new Response(JSON.stringify({ mensaje: 'Ya existe una cuenta con este correo.', campo: 'correo' }), { status: 409 }));
            const r = await db.registrarUsuario({ run: '1', correo: 'a@x.cl' }, 'clave1');
            expect(r.exito).toBeFalse();
            expect(r.campo).toBe('correo');
            expect(r.mensaje).toContain('correo');
        });

        it('un error que no es de un campo conocido no marca ningún campo', async () => {
            window.fetch.and.resolveTo(new Response(JSON.stringify({ mensaje: 'La contraseña debe tener entre 4 y 64 caracteres.', campo: 'password' }), { status: 400 }));
            const r = await db.registrarUsuario({ run: '1', correo: 'a@x.cl' }, '1');
            expect(r.exito).toBeFalse();
            expect(r.campo).toBeUndefined();
        });

        it('si no hay conexión informa del problema', async () => {
            window.fetch.and.rejectWith(new TypeError('Failed to fetch'));
            const r = await db.registrarUsuario({ run: '1', correo: 'a@x.cl' }, 'clave1');
            expect(r.exito).toBeFalse();
            expect(r.mensaje).toContain('No se pudo conectar');
        });
    });
});

describe('alResolver', () => {
    it('con un valor inmediato continúa sin esperar', () => {
        expect(alResolver(2, v => v * 3)).toBe(6);
    });

    it('con una promesa continúa cuando se resuelve', async () => {
        expect(await alResolver(Promise.resolve(2), v => v * 3)).toBe(6);
    });

    it('con null continúa con null', () => {
        expect(alResolver(null, v => v === null)).toBeTrue();
    });
});
