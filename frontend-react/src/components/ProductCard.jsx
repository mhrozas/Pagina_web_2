import { Link } from 'react-router-dom';
import Precio from './Precio';

/**
 * Tarjeta de un producto para los listados. Es solo presentación:
 * recibe el producto por props y enlaza a su detalle.
 */
export default function ProductCard({ producto }) {
    const agotado = producto.stock === 0;
    const critico = !agotado && producto.stock <= producto.stockCritico;

    return (
        <div className="card h-100 product-card shadow-sm">
            <Link to={`/producto/${producto.codigo}`} className="text-decoration-none text-dark">
                <div className="position-relative">
                    <img src={producto.imagen} className={`card-img-top product-img ${agotado ? 'opacity-50' : ''}`} alt={producto.nombre} />
                    {critico && <span className="badge bg-warning text-dark position-absolute top-0 start-0 m-2">¡Últimas unidades!</span>}
                    {agotado && <span className="badge bg-secondary position-absolute top-0 start-0 m-2">SIN STOCK</span>}
                </div>
                <div className="card-body">
                    <h3 className="h6 card-title">{producto.nombre}</h3>
                    <div className="small text-muted mb-1">{producto.atributos || producto.categoria}</div>
                    <Precio producto={producto} />
                </div>
            </Link>
        </div>
    );
}
