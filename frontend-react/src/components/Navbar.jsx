import { Link, NavLink, useNavigate } from 'react-router-dom';
import Buscador from './Buscador';
import useColeccion from '../hooks/useColeccion';
import { useCarrito } from '../context/CarritoContext';
import { useSesion, puedeEntrarAlPanel } from '../context/SesionContext';
import { formatearPrecio } from '../utils/formato';

/**
 * Encabezado de la tienda: búsqueda, navegación, carrito y sesión.
 * Se colapsa en un menú hamburguesa en pantallas pequeñas (Bootstrap).
 */
export default function Navbar() {
    const categorias = useColeccion('categorias');
    const { totales, unidades } = useCarrito();
    const { sesion, cerrarSesion } = useSesion();
    const navegar = useNavigate();

    const salir = () => {
        cerrarSesion();
        navegar('/');
    };

    const claseEnlace = ({ isActive }) => `nav-link ${isActive ? 'active fw-bold' : ''}`;

    return (
        <header className="bg-white border-bottom sticky-top">
            <nav className="navbar navbar-expand-lg">
                <div className="container">
                    <Link className="navbar-brand" to="/">
                        <img src="/img/logo-chstore.png" alt="Ch.Store" height="40" />
                    </Link>

                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menuTienda" aria-controls="menuTienda" aria-expanded="false" aria-label="Abrir menú">
                        <span className="navbar-toggler-icon" />
                    </button>

                    <div className="collapse navbar-collapse" id="menuTienda">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item"><NavLink end to="/" className={claseEnlace}>Home</NavLink></li>
                            <li className="nav-item"><NavLink to="/productos" className={claseEnlace}>Productos</NavLink></li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#categorias" role="button" data-bs-toggle="dropdown" aria-expanded="false">Categorías</a>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to="/categorias">Todas las categorías</Link></li>
                                    <li><hr className="dropdown-divider" /></li>
                                    {categorias.map(c => (
                                        <li key={c.nombre}>
                                            <Link className="dropdown-item" to={`/categorias/${encodeURIComponent(c.nombre)}`}>{c.nombre}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                            <li className="nav-item"><NavLink to="/ofertas" className={claseEnlace}>Ofertas</NavLink></li>
                            <li className="nav-item"><NavLink to="/nosotros" className={claseEnlace}>Nosotros</NavLink></li>
                            <li className="nav-item"><NavLink to="/blogs" className={claseEnlace}>Blog</NavLink></li>
                            <li className="nav-item"><NavLink to="/contacto" className={claseEnlace}>Contacto</NavLink></li>
                        </ul>

                        <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-2">
                            <Buscador />
                            <Link to="/carrito" className="btn btn-sm btn-success position-relative">
                                <i className="bi bi-cart3 me-1" />
                                Carrito {formatearPrecio(totales.total)}
                                <span className="badge bg-light text-dark ms-1 cart-badge">{unidades}</span>
                            </Link>

                            {sesion ? (
                                <div className="dropdown">
                                    <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                                        <i className="bi bi-person-circle me-1" />{sesion.nombre}
                                    </button>
                                    <ul className="dropdown-menu dropdown-menu-end">
                                        {puedeEntrarAlPanel(sesion) && (
                                            <li><Link className="dropdown-item" to="/admin">Panel de administración</Link></li>
                                        )}
                                        <li><button className="dropdown-item" onClick={salir}>Cerrar sesión</button></li>
                                    </ul>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login" className="btn btn-sm btn-outline-primary">Iniciar Sesión</Link>
                                    <Link to="/registro" className="btn btn-sm btn-primary">Crear Cuenta</Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
