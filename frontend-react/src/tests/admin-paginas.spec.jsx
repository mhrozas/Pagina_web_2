import { Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/admin/Dashboard';
import AdminProductos from '../pages/admin/Productos';
import ProductoForm from '../pages/admin/ProductoForm';
import AdminCategorias from '../pages/admin/Categorias';
import CategoriaForm from '../pages/admin/CategoriaForm';
import Usuarios from '../pages/admin/Usuarios';
import UsuarioForm from '../pages/admin/UsuarioForm';
import HistorialCompras from '../pages/admin/HistorialCompras';
import Ordenes from '../pages/admin/Ordenes';
import Boleta from '../pages/admin/Boleta';
import Reportes from '../pages/admin/Reportes';
import Perfil from '../pages/admin/Perfil';
import LayoutAdmin from '../components/LayoutAdmin';
import * as db from '../data/db';
import { montar, clic, escribir, elegir, enviar } from './helpers';

const limpiar = () => {
    localStorage.clear();
    db.reiniciar();
};

const iniciarComo = (tipoUsuario, correo = 'admin@duoc.cl') => localStorage.setItem('chstore_sesion', JSON.stringify({
    nombre: 'Admin', apellidos: 'Demo', correo, tipoUsuario
}));

const boton = (vista, texto) => [...vista.contenedor.querySelectorAll('button, a')].find(b => b.textContent.trim() === texto);

describe('Panel de administración (páginas)', () => {
    let vista;
    beforeEach(() => { limpiar(); iniciarComo('Administrador'); });
    afterEach(() => { vista && vista.desmontar(); limpiar(); });

    describe('Dashboard', () => {
        it('muestra los indicadores y la alerta de stock crítico', () => {
            vista = montar(<Dashboard />, { conProviders: true });
            const texto = vista.contenedor.textContent;
            expect(texto).toContain('Compras');
            expect(texto).toContain('Inventario actual');
            expect(texto).toContain('producto(s) en stock crítico');
        });

        it('un Vendedor no ve los accesos a usuarios ni reportes', () => {
            iniciarComo('Vendedor');
            vista = montar(<Dashboard />, { conProviders: true });
            expect(vista.contenedor.textContent).toContain('Órdenes');
            expect(vista.contenedor.textContent).not.toContain('Gestión de cuentas de usuario');
        });
    });

    describe('LayoutAdmin', () => {
        it('el menú depende del rol', () => {
            iniciarComo('Vendedor');
            vista = montar(<Routes><Route path="/admin" element={<LayoutAdmin />} /></Routes>, { ruta: '/admin', conProviders: true });
            const menu = vista.contenedor.querySelector('#menuAdmin').textContent;
            expect(menu).toContain('Productos');
            expect(menu).not.toContain('Usuarios');
        });
    });

    describe('Productos', () => {
        it('lista los productos y filtra por texto', () => {
            vista = montar(<AdminProductos />, { ruta: '/admin/productos', conProviders: true });
            expect(vista.contenedor.querySelectorAll('tbody tr').length).toBe(8);
            escribir(vista.contenedor.querySelector('input[aria-label="Buscar"]'), 'blusa');
            expect(vista.contenedor.querySelectorAll('tbody tr').length).toBe(1);
        });

        it('el listado de críticos muestra solo los productos bajo su stock crítico', () => {
            vista = montar(<AdminProductos />, { ruta: '/admin/productos/criticos', conProviders: true });
            expect(vista.contenedor.querySelectorAll('tbody tr').length).toBe(db.listarCriticos().length);
        });

        it('eliminar pide confirmación y borra el producto', () => {
            vista = montar(<AdminProductos />, { ruta: '/admin/productos', conProviders: true });
            clic(boton(vista, 'Eliminar'));
            expect(db.listar('productos').length).toBe(8);
            clic(boton(vista, 'Confirmar'));
            expect(db.listar('productos').length).toBe(7);
        });

        it('un Vendedor solo consulta: no ve los botones de editar ni eliminar', () => {
            iniciarComo('Vendedor');
            vista = montar(<AdminProductos />, { ruta: '/admin/productos', conProviders: true });
            expect(boton(vista, 'Eliminar')).toBeUndefined();
            expect(boton(vista, 'Nuevo producto')).toBeUndefined();
        });
    });

    describe('Formulario de producto', () => {
        const montarForm = ruta => montar(
            <Routes>
                <Route path="/admin/productos/nuevo" element={<ProductoForm />} />
                <Route path="/admin/productos/:codigo/editar" element={<ProductoForm />} />
                <Route path="/admin/productos" element={<p id="listado">LISTADO</p>} />
            </Routes>, { ruta }
        );

        it('crea un producto válido y vuelve al listado', () => {
            vista = montarForm('/admin/productos/nuevo');
            const c = vista.contenedor;
            escribir(c.querySelector('#codigo'), 'ABR-009');
            elegir(c.querySelector('#categoria'), 'Vestidos');
            escribir(c.querySelector('#nombre'), 'Abrigo Nuevo');
            escribir(c.querySelector('#precio'), '30000');
            escribir(c.querySelector('#stock'), '7');
            enviar(c.querySelector('form'));

            expect(db.obtener('productos', 'ABR-009').stock).toBe(7);
            expect(c.querySelector('#listado')).not.toBeNull();
        });

        it('no guarda si faltan campos obligatorios', () => {
            vista = montarForm('/admin/productos/nuevo');
            enviar(vista.contenedor.querySelector('form'));
            expect(vista.contenedor.querySelectorAll('.invalid-feedback').length).toBeGreaterThanOrEqual(4);
            expect(db.listar('productos').length).toBe(8);
        });

        it('rechaza un código repetido', () => {
            vista = montarForm('/admin/productos/nuevo');
            const c = vista.contenedor;
            escribir(c.querySelector('#codigo'), 'VES-001');
            elegir(c.querySelector('#categoria'), 'Vestidos');
            escribir(c.querySelector('#nombre'), 'Repetido');
            escribir(c.querySelector('#precio'), '1000');
            escribir(c.querySelector('#stock'), '1');
            enviar(c.querySelector('form'));
            expect(c.querySelector('.alert-danger').textContent).toContain('Ya existe');
        });

        it('edita un producto existente con el código bloqueado', () => {
            vista = montarForm('/admin/productos/VES-001/editar');
            const c = vista.contenedor;
            expect(c.querySelector('#codigo').readOnly).toBeTrue();
            escribir(c.querySelector('#precio'), '99999');
            enviar(c.querySelector('form'));
            expect(db.obtener('productos', 'VES-001').precio).toBe(99999);
        });
    });

    describe('Categorías', () => {
        it('no permite eliminar una categoría con productos asociados', () => {
            vista = montar(<AdminCategorias />, { conProviders: true });
            clic(boton(vista, 'Eliminar'));
            clic(boton(vista, 'Confirmar'));
            expect(vista.contenedor.querySelector('.alert-warning').textContent).toContain('tiene productos asociados');
            expect(db.listar('categorias').length).toBe(4);
        });

        it('crea una categoría nueva', () => {
            vista = montar(
                <Routes>
                    <Route path="/admin/categorias/nueva" element={<CategoriaForm />} />
                    <Route path="/admin/categorias" element={<p id="listado">LISTADO</p>} />
                </Routes>, { ruta: '/admin/categorias/nueva' }
            );
            escribir(vista.contenedor.querySelector('#nombre'), 'Abrigos');
            enviar(vista.contenedor.querySelector('form'));
            expect(db.obtener('categorias', 'Abrigos')).toBeDefined();
        });
    });

    describe('Usuarios', () => {
        it('filtra por perfil', () => {
            vista = montar(<Usuarios />, { conProviders: true });
            elegir(vista.contenedor.querySelector('select[aria-label="Tipo de usuario"]'), 'Vendedor');
            expect(vista.contenedor.querySelectorAll('tbody tr').length).toBe(1);
        });

        it('no deja eliminar la propia cuenta', () => {
            vista = montar(<Usuarios />, { conProviders: true });
            escribir(vista.contenedor.querySelector('input[aria-label="Buscar"]'), 'admin@duoc.cl');
            clic(boton(vista, 'Eliminar'));
            clic(boton(vista, 'Confirmar'));
            expect(vista.contenedor.querySelector('.alert-warning').textContent).toContain('propia cuenta');
            expect(db.listar('usuarios').length).toBe(3);
        });

        it('elimina a otro usuario', () => {
            vista = montar(<Usuarios />, { conProviders: true });
            escribir(vista.contenedor.querySelector('input[aria-label="Buscar"]'), 'cliente@gmail.com');
            clic(boton(vista, 'Eliminar'));
            clic(boton(vista, 'Confirmar'));
            expect(db.listar('usuarios').length).toBe(2);
        });

        it('el formulario valida el RUN y crea un usuario', () => {
            vista = montar(
                <Routes>
                    <Route path="/admin/usuarios/nuevo" element={<UsuarioForm />} />
                    <Route path="/admin/usuarios" element={<p id="listado">LISTADO</p>} />
                </Routes>, { ruta: '/admin/usuarios/nuevo' }
            );
            const c = vista.contenedor;
            escribir(c.querySelector('#run'), '123');
            enviar(c.querySelector('form'));
            expect(c.querySelector('#error-run')).not.toBeNull();

            escribir(c.querySelector('#run'), '19011029K');
            elegir(c.querySelector('#tipoUsuario'), 'Vendedor');
            escribir(c.querySelector('#nombre'), 'Luis');
            escribir(c.querySelector('#apellidos'), 'Paz');
            escribir(c.querySelector('#correo'), 'luis@duoc.cl');
            elegir(c.querySelector('#region'), 'RM');
            elegir(c.querySelector('#comuna'), 'Santiago');
            escribir(c.querySelector('#direccion'), 'Calle 5');
            enviar(c.querySelector('form'));
            expect(db.obtener('usuarios', '19011029K').tipoUsuario).toBe('Vendedor');
        });

        it('el historial de compras muestra las órdenes del usuario', () => {
            vista = montar(
                <Routes><Route path="/admin/usuarios/:run/historial" element={<HistorialCompras />} /></Routes>,
                { ruta: '/admin/usuarios/333333333/historial' }
            );
            expect(vista.contenedor.querySelectorAll('tbody tr').length).toBe(2);
            expect(vista.contenedor.textContent).toContain('Total comprado');
        });
    });

    describe('Órdenes, boleta y reportes', () => {
        it('filtra las órdenes por estado', () => {
            vista = montar(<Ordenes />);
            elegir(vista.contenedor.querySelector('select[aria-label="Filtrar por estado"]'), 'Entregada');
            expect(vista.contenedor.querySelectorAll('tbody tr').length).toBe(1);
        });

        it('la boleta permite cambiar el estado de una orden despachable', () => {
            vista = montar(<Routes><Route path="/admin/ordenes/:numero" element={<Boleta />} /></Routes>, { ruta: '/admin/ordenes/ORD-1002' });
            elegir(vista.contenedor.querySelector('select'), 'Despachada');
            expect(db.obtener('ordenes', 'ORD-1002').estado).toBe('Despachada');
        });

        it('los reportes muestran ingresos y órdenes por estado', () => {
            vista = montar(<Reportes />);
            expect(vista.contenedor.textContent).toContain('Ingresos');
            expect(vista.contenedor.textContent).toContain('Órdenes por estado');
        });
    });

    describe('Perfil', () => {
        it('guarda los cambios del perfil del usuario con sesión', () => {
            vista = montar(<Perfil />, { conProviders: true });
            escribir(vista.contenedor.querySelector('#nombre'), 'Nuevo Nombre');
            enviar(vista.contenedor.querySelector('form'));
            expect(db.obtener('usuarios', '111111111').nombre).toBe('Nuevo Nombre');
        });

        it('no guarda con un nombre vacío', () => {
            vista = montar(<Perfil />, { conProviders: true });
            escribir(vista.contenedor.querySelector('#nombre'), '');
            enviar(vista.contenedor.querySelector('form'));
            expect(vista.contenedor.querySelector('.invalid-feedback')).not.toBeNull();
            expect(db.obtener('usuarios', '111111111').nombre).toBe('Admin');
        });
    });
});
