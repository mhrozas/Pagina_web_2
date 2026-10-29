import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConfirmarEliminar from '../../components/ConfirmarEliminar';
import Alerta from '../../components/Alerta';
import { eliminar } from '../../data/db';
import useColeccion from '../../hooks/useColeccion';
import { useSesion } from '../../context/SesionContext';
import { productosCriticos } from '../../utils/admin';
import { formatearPrecio } from '../../utils/formato';

/**
 * Listado del mantenedor de productos. Con la ruta /admin/productos/criticos
 * muestra solo los productos en o bajo su stock crítico.
 */
export default function Productos() {
    const { sesion } = useSesion();
    const { pathname } = useLocation();
    const productos = useColeccion('productos');
    const [busqueda, setBusqueda] = useState('');
    const [resultado, setResultado] = useState(null);

    const soloCriticos = pathname.endsWith('/criticos');
    const esAdmin = sesion.tipoUsuario === 'Administrador';
    const base = soloCriticos ? productosCriticos(productos) : productos;
    const visibles = base.filter(p => `${p.codigo} ${p.nombre}`.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">{soloCriticos ? 'Productos críticos' : 'Productos'}</h1>
                <div className="d-flex gap-2">
                    {soloCriticos
                        ? <Link to="/admin/productos" className="btn btn-outline-secondary">Ver todos</Link>
                        : <Link to="/admin/productos/criticos" className="btn btn-outline-warning">Críticos ({productosCriticos(productos).length})</Link>}
                    {esAdmin && <Link to="/admin/productos/nuevo" className="btn btn-primary">Nuevo producto</Link>}
                </div>
            </div>

            <input className="form-control mb-3" placeholder="Buscar por código o nombre" aria-label="Buscar" value={busqueda} onChange={e => setBusqueda(e.target.value)} />
            <Alerta resultado={resultado} onCerrar={() => setResultado(null)} />

            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Crítico</th><th>Estado</th>{esAdmin && <th />}</tr></thead>
                    <tbody>
                        {visibles.map(p => (
                            <tr key={p.codigo}>
                                <td>{p.codigo}</td><td>{p.nombre}</td><td>{p.categoria}</td>
                                <td>{formatearPrecio(p.precio)}</td><td>{p.stock}</td><td>{p.stockCritico}</td>
                                <td>
                                    {p.stock === 0 ? <span className="badge bg-danger">Agotado</span>
                                        : p.stock <= p.stockCritico ? <span className="badge bg-warning text-dark">Crítico</span>
                                            : <span className="badge bg-success">Normal</span>}
                                </td>
                                {esAdmin && (
                                    <td className="text-nowrap">
                                        <Link className="btn btn-sm btn-outline-primary me-1" to={`/admin/productos/${p.codigo}/editar`}>Editar</Link>
                                        <ConfirmarEliminar onConfirmar={() => setResultado(eliminar('productos', p.codigo))} />
                                    </td>
                                )}
                            </tr>
                        ))}
                        {visibles.length === 0 && <tr><td colSpan="8" className="text-center text-muted">No hay productos.</td></tr>}
                    </tbody>
                </table>
            </div>
        </>
    );
}
