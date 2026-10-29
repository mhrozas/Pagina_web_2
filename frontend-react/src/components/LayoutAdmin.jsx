import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useSesion } from '../context/SesionContext';
import { puedeVer } from '../utils/admin';

const MENU = [
    { seccion: 'inicio', ruta: '/admin', texto: 'Dashboard', icono: 'bi-speedometer2', fin: true },
    { seccion: 'ordenes', ruta: '/admin/ordenes', texto: 'Órdenes', icono: 'bi-receipt' },
    { seccion: 'productos', ruta: '/admin/productos', texto: 'Productos', icono: 'bi-box-seam' },
    { seccion: 'categorias', ruta: '/admin/categorias', texto: 'Categorías', icono: 'bi-tags' },
    { seccion: 'usuarios', ruta: '/admin/usuarios', texto: 'Usuarios', icono: 'bi-people' },
    { seccion: 'reportes', ruta: '/admin/reportes', texto: 'Reportes', icono: 'bi-bar-chart' },
    { seccion: 'perfil', ruta: '/admin/perfil', texto: 'Perfil', icono: 'bi-person-circle' }
];

/**
 * Estructura del panel: barra superior, menú lateral según el rol y contenido.
 * En móvil el menú lateral pasa a ser un menú desplegable.
 */
export default function LayoutAdmin() {
    const { sesion, cerrarSesion } = useSesion();
    const navegar = useNavigate();

    const salir = () => {
        cerrarSesion();
        navegar('/login');
    };

    return (
        <div className="admin-app">
            <nav className="navbar navbar-dark bg-dark px-3">
                <span className="navbar-brand mb-0">Ch.Store · Administración</span>
                <span className="text-light small d-none d-md-inline">{sesion.nombre} {sesion.apellidos} · {sesion.tipoUsuario}</span>
                <button className="navbar-toggler d-md-none" type="button" data-bs-toggle="collapse" data-bs-target="#menuAdmin" aria-label="Abrir menú">
                    <span className="navbar-toggler-icon" />
                </button>
            </nav>

            <div className="container-fluid">
                <div className="row">
                    <aside className="col-md-3 col-lg-2 bg-light border-end py-3 collapse d-md-block" id="menuAdmin">
                        <ul className="nav nav-pills flex-column gap-1">
                            {MENU.filter(m => puedeVer(sesion.tipoUsuario, m.seccion)).map(m => (
                                <li className="nav-item" key={m.seccion}>
                                    <NavLink end={m.fin} to={m.ruta} className="nav-link">
                                        <i className={`bi ${m.icono} me-2`} />{m.texto}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                        <hr />
                        <Link to="/" className="btn btn-dark btn-sm w-100 mb-2"><i className="bi bi-shop me-1" />Tienda</Link>
                        <button className="btn btn-danger btn-sm w-100" onClick={salir}><i className="bi bi-box-arrow-right me-1" />Cerrar sesión</button>
                    </aside>

                    <main className="col-md-9 col-lg-10 py-4"><Outlet /></main>
                </div>
            </div>
        </div>
    );
}
