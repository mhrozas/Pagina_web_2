import { Link, useParams } from 'react-router-dom';
import { listarOrdenesDeUsuario, obtener } from '../../data/db';
import useColeccion from '../../hooks/useColeccion';
import { formatearPrecio } from '../../utils/formato';

export default function HistorialCompras() {
    const { run } = useParams();
    useColeccion('ordenes');
    const usuario = obtener('usuarios', run);

    if (!usuario) return <p>El usuario no existe. <Link to="/admin/usuarios">Volver</Link></p>;

    const ordenes = listarOrdenesDeUsuario(usuario.correo);
    const total = ordenes.reduce((acc, o) => acc + o.total, 0);

    return (
        <>
            <h1 className="h3">Historial de compras</h1>
            <p className="text-muted">{usuario.nombre} {usuario.apellidos} · {usuario.correo}</p>
            <div className="table-responsive">
                <table className="table align-middle">
                    <thead><tr><th>N° orden</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th /></tr></thead>
                    <tbody>
                        {ordenes.map(o => (
                            <tr key={o.numero}>
                                <td>{o.numero}</td><td>{o.fecha}</td><td>{o.productos}</td><td>{formatearPrecio(o.total)}</td><td>{o.estado}</td>
                                <td><Link className="btn btn-sm btn-outline-primary" to={`/admin/ordenes/${o.numero}`}>Boleta</Link></td>
                            </tr>
                        ))}
                        {ordenes.length === 0 && <tr><td colSpan="6" className="text-center text-muted">Este usuario aún no tiene compras.</td></tr>}
                    </tbody>
                </table>
            </div>
            <p className="fw-bold">Total comprado: {formatearPrecio(total)}</p>
            <Link to="/admin/usuarios" className="btn btn-outline-secondary">← Volver</Link>
        </>
    );
}
