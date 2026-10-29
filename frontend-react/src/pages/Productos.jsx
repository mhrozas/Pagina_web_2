import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../components/ProductList';
import useColeccion from '../hooks/useColeccion';

/**
 * Catálogo con filtros: búsqueda por texto (?q=), categoría, solo con stock y orden por precio.
 */
export default function Productos() {
    const productos = useColeccion('productos');
    const categorias = useColeccion('categorias');
    const [params, setParams] = useSearchParams();
    const [categoria, setCategoria] = useState('todas');
    const [soloStock, setSoloStock] = useState(false);
    const [orden, setOrden] = useState('');

    const consulta = (params.get('q') || '').toLowerCase();

    const visibles = useMemo(() => {
        let lista = productos.filter(p => (
            (categoria === 'todas' || p.categoria === categoria) &&
            (!soloStock || p.stock > 0) &&
            (!consulta || `${p.nombre} ${p.descripcion} ${p.categoria}`.toLowerCase().includes(consulta))
        ));
        if (orden === 'asc') lista = [...lista].sort((a, b) => a.precio - b.precio);
        if (orden === 'desc') lista = [...lista].sort((a, b) => b.precio - a.precio);
        return lista;
    }, [productos, categoria, soloStock, orden, consulta]);

    return (
        <>
            <h1 className="h3 mb-3">Productos</h1>

            {consulta && (
                <p className="text-muted">
                    Resultados para "<strong>{params.get('q')}</strong>"{' '}
                    <button className="btn btn-link btn-sm p-0" onClick={() => setParams({})}>Limpiar búsqueda</button>
                </p>
            )}

            <div className="row g-2 mb-4 align-items-center">
                <div className="col-12 col-md-4">
                    <select className="form-select" aria-label="Categoría" value={categoria} onChange={e => setCategoria(e.target.value)}>
                        <option value="todas">Todas las categorías</option>
                        {categorias.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                    </select>
                </div>
                <div className="col-12 col-md-4">
                    <select className="form-select" aria-label="Ordenar" value={orden} onChange={e => setOrden(e.target.value)}>
                        <option value="">Orden por defecto</option>
                        <option value="asc">Precio: menor a mayor</option>
                        <option value="desc">Precio: mayor a menor</option>
                    </select>
                </div>
                <div className="col-12 col-md-4">
                    <div className="form-check">
                        <input className="form-check-input" type="checkbox" id="soloStock" checked={soloStock} onChange={e => setSoloStock(e.target.checked)} />
                        <label className="form-check-label" htmlFor="soloStock">Solo con stock</label>
                    </div>
                </div>
            </div>

            <ProductList productos={visibles} vacio="No hay productos que coincidan con los filtros." />
        </>
    );
}
