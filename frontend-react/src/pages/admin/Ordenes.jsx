import { useState } from 'react';
import { Link } from 'react-router-dom';
import useColeccion from '../../hooks/useColeccion';
import { formatearPrecio } from '../../utils/formato';

export default function Ordenes() {
    const ordenes = useColeccion('ordenes');
    const [estado, setEstado] = useState('todos');

    const estados = [...new Set(ordenes.map(o => o.estado))];
    const visibles = estado === 'todos' ? ordenes : ordenes.filter(o => o.estado === estado);

    return (
        <>
            <h1 className="h3 mb-3">Órdenes / Boletas</h1>
            <select className="form-select w-auto mb-3" aria-label="Filtrar por estado" value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="todos">Todos los estados</option>
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
            </select>

            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead><tr><th>N° orden</th><th>Cliente</th><th>Fecha</th><th>Productos</th><th>Total</th><th>Estado</th><th /></tr></thead>
                    <tbody>
                        {visibles.map(o => (
                            <tr key={o.numero}>
                                <td>{o.numero}</td><td>{o.cliente}</td><td>{o.fecha}</td><td>{o.productos}</td>
                                <td>{formatearPrecio(o.total)}</td><td>{o.estado}</td>
                                <td><Link className="btn btn-sm btn-outline-primary" to={`/admin/ordenes/${o.numero}`}>Ver boleta</Link></td>
                            </tr>
                        ))}
                        {visibles.length === 0 && <tr><td colSpan="7" className="text-center text-muted">No hay órdenes.</td></tr>}
                    </tbody>
                </table>
            </div>
        </>
    );
}
