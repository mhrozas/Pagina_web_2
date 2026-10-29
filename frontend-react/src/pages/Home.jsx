import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';
import useColeccion from '../hooks/useColeccion';

export default function Home() {
    const productos = useColeccion('productos');

    return (
        <>
            <section className="hero position-relative text-white text-center rounded overflow-hidden mb-5">
                <video className="hero-video" autoPlay loop muted playsInline src="/img/videoropa.mp4" />
                <div className="hero-overlay d-flex flex-column justify-content-center align-items-center p-4">
                    <h1 className="display-4 fw-bold">Ch.Store</h1>
                    <p className="lead">Descubre la mejor tienda de ropa de Chile.</p>
                    <a href="#destacados" className="btn btn-light">Ver productos</a>
                </div>
            </section>

            <section id="destacados">
                <h2 className="h4 text-center mb-4">Productos destacados</h2>
                <ProductList productos={productos.slice(0, 8)} />
                <div className="text-center mt-4">
                    <Link to="/productos" className="btn btn-dark">Ver todo el catálogo</Link>
                </div>
            </section>
        </>
    );
}
