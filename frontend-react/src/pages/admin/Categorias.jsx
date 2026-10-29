import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../../components/Alerta';
import ConfirmarEliminar from '../../components/ConfirmarEliminar';
import { eliminar, listar } from '../../data/db';
import useColeccion from '../../hooks/useColeccion';

export default function Categorias() {
    const categorias = useColeccion('categorias');
    const productos = useColeccion('productos');
    const [resultado, setResultado] = useState(null);

    const quitar = nombre => {
        const enUso = listar('productos').some(p => p.categoria === nombre);
        setResultado(enUso
            ? { exito: false, mensaje: `No se puede eliminar "${nombre}": tiene productos asociados.` }
            : eliminar('categorias', nombre));
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Categorías</h1>
                <Link to="/admin/categorias/nueva" className="btn btn-primary">Nueva categoría</Link>
            </div>
            <Alerta resultado={resultado} onCerrar={() => setResultado(null)} />
            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead><tr><th>Nombre</th><th>Descripción</th><th>Productos</th><th /></tr></thead>
                    <tbody>
                        {categorias.map(c => (
                            <tr key={c.nombre}>
                                <td>{c.nombre}</td><td>{c.descripcion}</td>
                                <td>{productos.filter(p => p.categoria === c.nombre).length}</td>
                                <td className="text-nowrap">
                                    <Link className="btn btn-sm btn-outline-primary me-1" to={`/admin/categorias/${encodeURIComponent(c.nombre)}/editar`}>Editar</Link>
                                    <ConfirmarEliminar onConfirmar={() => quitar(c.nombre)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
