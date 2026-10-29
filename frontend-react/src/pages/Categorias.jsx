import { Link, useParams } from 'react-router-dom';
import ProductList from '../components/ProductList';
import useColeccion from '../hooks/useColeccion';

/**
 * Sin parámetro: tarjetas de categorías y sus productos. Con /:nombre: solo esa categoría.
 */
export default function Categorias() {
    const { nombre } = useParams();
    const categorias = useColeccion('categorias');
    const productos = useColeccion('productos');

    const seleccionada = nombre ? categorias.find(c => c.nombre === nombre) : null;
    const secciones = seleccionada ? [seleccionada] : categorias;

    return (
        <>
            <h1 className="h3 mb-3">{seleccionada ? seleccionada.nombre : 'Categorías'}</h1>

            <div className="row row-cols-2 row-cols-md-4 g-3 mb-5">
                {categorias.map(c => (
                    <div className="col" key={c.nombre}>
                        <Link
                            to={`/categorias/${encodeURIComponent(c.nombre)}`}
                            className={`card h-100 text-center text-decoration-none shadow-sm ${c.nombre === nombre ? 'border-dark' : ''}`}
                        >
                            <div className="card-body">
                                <h2 className="h6 text-dark mb-1">{c.nombre}</h2>
                                <small className="text-muted">{c.descripcion}</small>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {nombre && !seleccionada && <p className="text-muted">La categoría "{nombre}" no existe.</p>}

            {secciones.map(c => (
                <section key={c.nombre} className="mb-5">
                    <h2 className="h4 mb-3">{c.nombre}</h2>
                    <ProductList
                        productos={productos.filter(p => p.categoria === c.nombre)}
                        vacio="No hay productos en esta categoría."
                    />
                </section>
            ))}
        </>
    );
}
