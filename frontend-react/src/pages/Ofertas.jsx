import ProductList from '../components/ProductList';
import useColeccion from '../hooks/useColeccion';

export default function Ofertas() {
    const productos = useColeccion('productos');
    const ofertas = productos.filter(p => p.descuento > 0);

    return (
        <>
            <h1 className="h3 mb-3">Ofertas</h1>
            <p className="text-muted">Productos con descuento por tiempo limitado.</p>
            <ProductList productos={ofertas} vacio="Por ahora no hay productos en oferta." />
        </>
    );
}
