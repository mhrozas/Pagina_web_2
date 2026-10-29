import ProductCard from './ProductCard';

/**
 * Grilla responsiva de productos: 1 columna en móvil, 2 en tablet, 4 en escritorio.
 */
export default function ProductList({ productos, vacio = 'No hay productos para mostrar.' }) {
    if (productos.length === 0) {
        return <p className="text-center text-muted py-5">{vacio}</p>;
    }

    return (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4 g-4">
            {productos.map(producto => (
                <div className="col" key={producto.codigo}>
                    <ProductCard producto={producto} />
                </div>
            ))}
        </div>
    );
}
