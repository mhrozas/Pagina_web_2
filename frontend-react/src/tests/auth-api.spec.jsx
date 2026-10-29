import { Route, Routes } from 'react-router-dom';
import { act } from 'react';
import Login from '../pages/Login';
import Registro from '../pages/Registro';
import Dashboard from '../pages/admin/Dashboard';
import UsuarioForm from '../pages/admin/UsuarioForm';
import * as db from '../data/db';
import { useSesion } from '../context/SesionContext';
import { montar, escribir, elegir, enviar } from './helpers';

const ADMIN = { run: '111111111', nombre: 'Admin', apellidos: 'Demo', correo: 'admin@duoc.cl', tipoUsuario: 'Administrador' };
const VENDEDOR = { run: '222222222', nombre: 'Vendedor', apellidos: 'Demo', correo: 'vendedor@duoc.cl', tipoUsuario: 'Vendedor' };
const CLIENTE = { run: '333333333', nombre: 'Cliente', apellidos: 'Demo', correo: 'cliente@gmail.com', tipoUsuario: 'Cliente' };
const USUARIOS = { 'admin@duoc.cl': ADMIN, 'vendedor@duoc.cl': VENDEDOR, 'cliente@gmail.com': CLIENTE };

const esperar = (ms = 30) => new Promise(resolver => setTimeout(resolver, ms));
const json = (estado, cuerpo) => new Response(estado === 204 ? null : JSON.stringify(cuerpo), { status: estado });

/** Servidor simulado: catálogo, login (demo1234) y registro. Las llamadas quedan en `llamadas`. */
async function conectarServidorSimulado(extra = () => null) {
    const llamadas = [];
    spyOn(window, 'fetch').and.callFake(async (url, opciones = {}) => {
        const metodo = opciones.method || 'GET';
        const ruta = url.replace('/api', '');
        const cuerpo = opciones.body ? JSON.parse(opciones.body) : undefined;
        llamadas.push({ metodo, ruta, cuerpo });

        const personalizada = extra(metodo, ruta, cuerpo);
        if (personalizada) return personalizada;
        if (ruta === '/productos') return json(200, []);
        if (ruta === '/categorias') return json(200, []);
        if (ruta === '/usuarios' && metodo === 'GET') return json(200, [ADMIN, VENDEDOR, CLIENTE]);
        if (ruta === '/ordenes' && metodo === 'GET') return json(200, []);
        if (ruta === '/auth/login') {
            const usuario = USUARIOS[cuerpo.correo];
            return usuario && cuerpo.password === 'demo1234'
                ? json(200, { token: 'tok-' + usuario.run, usuario })
                : json(401, { mensaje: 'Correo o contraseña incorrectos.' });
        }
        if (ruta === '/auth/registro') return json(201, { usuario: CLIENTE });
        if (ruta === '/auth/logout') return json(204);
        return json(201, {});
    });
    await db.conectarApi('/api');
    return llamadas;
}

/** Componente auxiliar para leer el estado de la sesión desde las pruebas. */
function EstadoSesion() {
    const { sesion, cerrarSesion } = useSesion();
    return (
        <div>
            <span id="quien">{sesion ? sesion.correo : 'nadie'}</span>
            <button id="salir" onClick={cerrarSesion}>salir</button>
        </div>
    );
}

describe('Autenticación en modo API (pantallas)', () => {
    let vista;

    beforeEach(() => localStorage.clear());
    afterEach(() => {
        vista && vista.desmontar();
        vista = null;
        db.desconectarApi();
        localStorage.clear();
    });

    const llenarLogin = (correo, password) => {
        escribir(vista.contenedor.querySelector('#correo'), correo);
        escribir(vista.contenedor.querySelector('#password'), password);
        enviar(vista.contenedor.querySelector('form'));
    };

    describe('Login', () => {
        it('con credenciales correctas abre la sesión, guarda el token y entra al panel', async () => {
            await conectarServidorSimulado();
            vista = montar(
                <Routes>
                    <Route path="/login" element={<><Login /><EstadoSesion /></>} />
                    <Route path="/admin" element={<><h1>Panel</h1><EstadoSesion /></>} />
                </Routes>,
                { ruta: '/login', conProviders: true }
            );

            llenarLogin('admin@duoc.cl', 'demo1234');
            await act(async () => { await esperar(); });

            expect(vista.contenedor.querySelector('h1').textContent).toBe('Panel');
            expect(vista.contenedor.querySelector('#quien').textContent).toBe('admin@duoc.cl');
            expect(localStorage.getItem('chstore_token')).toBe('tok-111111111');
            expect(JSON.parse(localStorage.getItem('chstore_sesion')).run).toBe('111111111');
        });

        it('un cliente va a la tienda y no al panel', async () => {
            await conectarServidorSimulado();
            vista = montar(
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={<h1>Tienda</h1>} />
                    <Route path="/admin" element={<h1>Panel</h1>} />
                </Routes>,
                { ruta: '/login', conProviders: true }
            );
            llenarLogin('cliente@gmail.com', 'demo1234');
            await act(async () => { await esperar(); });
            expect(vista.contenedor.querySelector('h1').textContent).toBe('Tienda');
        });

        it('con una contraseña incorrecta muestra el mensaje del servidor y no abre sesión', async () => {
            await conectarServidorSimulado();
            vista = montar(<><Login /><EstadoSesion /></>, { ruta: '/login', conProviders: true });

            llenarLogin('admin@duoc.cl', 'equivocada');
            await act(async () => { await esperar(); });

            expect(vista.contenedor.querySelector('.alert-danger').textContent).toContain('Correo o contraseña incorrectos.');
            expect(vista.contenedor.querySelector('#quien').textContent).toBe('nadie');
            expect(localStorage.getItem('chstore_token')).toBeNull();
        });

        it('indica la contraseña de las cuentas demo', async () => {
            await conectarServidorSimulado();
            vista = montar(<Login />, { conProviders: true });
            expect(vista.contenedor.textContent).toContain('demo1234');
        });
    });

    describe('Sesión', () => {
        it('cerrar sesión avisa al servidor y deja al usuario sin sesión', async () => {
            const llamadas = await conectarServidorSimulado();
            vista = montar(<><Login /><EstadoSesion /></>, { conProviders: true });
            llenarLogin('vendedor@duoc.cl', 'demo1234');
            await act(async () => { await esperar(); });
            expect(vista.contenedor.querySelector('#quien').textContent).toBe('vendedor@duoc.cl');

            act(() => vista.contenedor.querySelector('#salir').click());
            await act(async () => { await esperar(); });

            expect(vista.contenedor.querySelector('#quien').textContent).toBe('nadie');
            expect(llamadas.some(l => l.ruta === '/auth/logout')).toBeTrue();
            expect(localStorage.getItem('chstore_sesion')).toBeNull();
            expect(localStorage.getItem('chstore_token')).toBeNull();
        });

        it('si el servidor da por vencida la sesión, se cierra en pantalla', async () => {
            await conectarServidorSimulado((metodo, ruta) => (
                metodo === 'POST' && ruta === '/categorias' ? json(401, { mensaje: 'Debes iniciar sesión.' }) : null
            ));
            spyOn(console, 'error');
            vista = montar(<><Login /><EstadoSesion /></>, { conProviders: true });
            llenarLogin('admin@duoc.cl', 'demo1234');
            await act(async () => { await esperar(); });
            expect(vista.contenedor.querySelector('#quien').textContent).toBe('admin@duoc.cl');

            db.crear('categorias', { nombre: 'X', descripcion: '' });
            await act(async () => { await esperar(); });

            expect(vista.contenedor.querySelector('#quien').textContent).toBe('nadie');
            expect(localStorage.getItem('chstore_sesion')).toBeNull();
        });
    });

    describe('Registro', () => {
        const llenarRegistro = () => {
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
        };

        it('envía la contraseña al servidor y confirma la creación', async () => {
            const llamadas = await conectarServidorSimulado();
            vista = montar(<Registro />);
            llenarRegistro();
            await act(async () => { await esperar(); });

            const peticion = llamadas.find(l => l.ruta === '/auth/registro');
            expect(peticion.cuerpo.password).toBe('1234');
            expect(peticion.cuerpo.tipoUsuario).toBe('Cliente');
            expect(vista.contenedor.querySelector('.alert-success')).not.toBeNull();
        });

        it('si el correo ya existe, lo marca en el campo', async () => {
            await conectarServidorSimulado((metodo, ruta) => (
                ruta === '/auth/registro'
                    ? json(409, { mensaje: 'Ya existe una cuenta con este correo.', campo: 'correo' })
                    : null
            ));
            vista = montar(<Registro />);
            llenarRegistro();
            await act(async () => { await esperar(); });

            expect(vista.contenedor.querySelector('.alert-danger').textContent).toContain('Ya existe una cuenta con este correo.');
            expect(vista.contenedor.querySelector('#correo').classList.contains('is-invalid')).toBeTrue();
            expect(vista.contenedor.querySelector('.alert-success')).toBeNull();
        });
    });

    describe('Panel', () => {
        /** Deja una sesión abierta (token y datos cargados) antes de mostrar la pantalla del panel. */
        const abrirSesion = async usuario => {
            await db.iniciarSesionApi(usuario.correo, 'demo1234');
            localStorage.setItem('chstore_sesion', JSON.stringify(usuario));
        };

        it('el dashboard del vendedor no muestra la tarjeta de usuarios', async () => {
            await conectarServidorSimulado();
            await abrirSesion(VENDEDOR);
            vista = montar(<Dashboard />, { conProviders: true });
            expect(vista.contenedor.textContent).toContain('Compras');
            expect(vista.contenedor.textContent).not.toContain('Cuentas registradas');
        });

        it('el dashboard del administrador sí la muestra, con las cuentas cargadas del servidor', async () => {
            await conectarServidorSimulado();
            await abrirSesion(ADMIN);
            vista = montar(<Dashboard />, { conProviders: true });
            expect(vista.contenedor.textContent).toContain('Cuentas registradas');
        });

        describe('formulario de usuario', () => {
            const llenar = c => {
                escribir(c.querySelector('#run'), '19011029K');
                escribir(c.querySelector('#nombre'), 'Ana');
                escribir(c.querySelector('#apellidos'), 'Soto');
                escribir(c.querySelector('#correo'), 'ana@duoc.cl');
                elegir(c.querySelector('#tipoUsuario'), 'Vendedor');
                elegir(c.querySelector('#region'), 'RM');
                elegir(c.querySelector('#comuna'), 'Santiago');
                escribir(c.querySelector('#direccion'), 'Calle 1');
            };

            it('pide la contraseña al crear un usuario', async () => {
                await conectarServidorSimulado();
                vista = montar(<UsuarioForm />, { conProviders: true });
                expect(vista.contenedor.querySelector('#password')).not.toBeNull();
            });

            it('exige una contraseña de 4 a 10 caracteres', async () => {
                const llamadas = await conectarServidorSimulado();
                vista = montar(<UsuarioForm />, { conProviders: true });
                const c = vista.contenedor;
                llenar(c);

                enviar(c.querySelector('form'));
                expect(c.querySelector('#password').classList.contains('is-invalid')).toBeTrue();

                escribir(c.querySelector('#password'), '123');
                enviar(c.querySelector('form'));
                expect(c.querySelector('#password').classList.contains('is-invalid')).toBeTrue();
                expect(llamadas.some(l => l.metodo === 'POST' && l.ruta === '/usuarios')).toBeFalse();
            });

            it('con una contraseña válida envía el usuario con su contraseña al servidor', async () => {
                const llamadas = await conectarServidorSimulado();
                vista = montar(<UsuarioForm />, { conProviders: true });
                const c = vista.contenedor;
                llenar(c);
                escribir(c.querySelector('#password'), 'clave1');
                enviar(c.querySelector('form'));
                await act(async () => { await esperar(); });

                const peticion = llamadas.find(l => l.metodo === 'POST' && l.ruta === '/usuarios');
                expect(peticion.cuerpo.password).toBe('clave1');
                expect(peticion.cuerpo.tipoUsuario).toBe('Vendedor');
            });

            const editarUsuarioCliente = async ({ conPassword }) => {
                const llamadas = await conectarServidorSimulado();
                await abrirSesion(ADMIN);
                vista = montar(
                    <Routes><Route path="/admin/usuarios/:run/editar" element={<UsuarioForm />} /></Routes>,
                    { ruta: '/admin/usuarios/333333333/editar', conProviders: true }
                );
                const c = vista.contenedor;
                // El usuario de prueba no trae dirección: se completa para que el formulario sea válido
                elegir(c.querySelector('#region'), 'RM');
                elegir(c.querySelector('#comuna'), 'Santiago');
                escribir(c.querySelector('#direccion'), 'Calle 1');
                if (conPassword) escribir(c.querySelector('#password'), 'nueva22');
                enviar(c.querySelector('form'));
                await act(async () => { await esperar(); });
                return llamadas.find(l => l.metodo === 'PUT');
            };

            it('al editar, la contraseña es opcional: si se deja vacía no se envía', async () => {
                const put = await editarUsuarioCliente({ conPassword: false });
                expect(put.ruta).toBe('/usuarios/333333333');
                expect(put.cuerpo.password).toBeUndefined();
            });

            it('al editar, si se escribe una contraseña nueva se envía al servidor', async () => {
                const put = await editarUsuarioCliente({ conPassword: true });
                expect(put.cuerpo.password).toBe('nueva22');
            });
        });
    });
});
