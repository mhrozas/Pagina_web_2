import { Link } from 'react-router-dom';
import TarjetaIndicador from '../../components/TarjetaIndicador';
import useColeccion from '../../hooks/useColeccion';
import { useSesion } from '../../context/SesionContext';
import { calcularIndicadores, puedeVer } from '../../utils/admin';
import { formatearPrecio } from '../../utils/formato';

const ACCESOS = [
    { seccion: 'ordenes', ruta: '/admin/ordenes', titulo: 'Órdenes', texto: 'Gestión y seguimiento de las órdenes de compra realizadas.', icono: 'bi-receipt' },
    { seccion: 'productos', ruta: '/admin/productos', titulo: 'Productos', texto: 'Administrar inventario y detalles de los productos.', icono: 'bi-box-seam' },
    { seccion: 'categorias', ruta: '/admin/categorias', titulo: 'Categorías', texto: 'Organizar productos en categorías.', icono: 'bi-tags' },
    { seccion: 'usuarios', ruta: '/admin/usuarios', titulo: 'Usuarios', texto: 'Gestión de cuentas de usuario y sus roles.', icono: 'bi-people' },
    { seccion: 'reportes', ruta: '/admin/reportes', titulo: 'Reportes', texto: 'Informes de ventas y de inventario.', icono: 'bi-bar-chart' },
    { seccion: 'perfil', ruta: '/admin/perfil', titulo: 'Perfil', texto: 'Información personal y configuración de la cuenta.', icono: 'bi-person' }
];

export default function Dashboard() {
    const { sesion } = useSesion();
    const ordenes = useColeccion('ordenes');
    const productos = useColeccion('productos');
    const usuarios = useColeccion('usuarios');
    const ind = calcularIndicadores(ordenes, productos, usuarios);

    return (
        <>
            <h1 className="h3">Dashboard</h1>
            <p className="text-muted">Resumen de las actividades diarias</p>

            <div className="row g-3 mb-4">
                <div className="col-md-4"><TarjetaIndicador titulo="Compras" valor={ind.compras} detalle={`Ingresos: ${formatearPrecio(ind.ingresos)}`} color="primary" icono="bi-cart3" /></div>
                <div className="col-md-4"><TarjetaIndicador titulo="Productos" valor={ind.productos} detalle={`Inventario actual: ${ind.inventario}`} color="success" icono="bi-box-seam" /></div>
                {puedeVer(sesion.tipoUsuario, 'usuarios') && (
                    <div className="col-md-4"><TarjetaIndicador titulo="Usuarios" valor={ind.usuarios} detalle="Cuentas registradas" color="warning" icono="bi-people" /></div>
                )}
            </div>

            {ind.criticos > 0 && (
                <div className="alert alert-warning d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-exclamation-triangle me-2" />{ind.criticos} producto(s) en stock crítico.</span>
                    <Link to="/admin/productos/criticos" className="btn btn-sm btn-warning">Ver listado</Link>
                </div>
            )}

            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                {ACCESOS.filter(a => puedeVer(sesion.tipoUsuario, a.seccion)).map(a => (
                    <div className="col" key={a.ruta}>
                        <Link to={a.ruta} className="card h-100 text-center text-decoration-none">
                            <div className="card-body">
                                <i className={`bi ${a.icono} fs-2 text-primary`} />
                                <h2 className="h6 text-dark mt-2">{a.titulo}</h2>
                                <p className="small text-muted mb-0">{a.texto}</p>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </>
    );
}
