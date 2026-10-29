import { formatearPrecio } from '../utils/formato';
import { precioFinal } from '../utils/carrito';

/**
 * Precio de un producto; si tiene oferta muestra el original tachado.
 */
export default function Precio({ producto }) {
    if (!(producto.descuento > 0)) {
        return <span className="fw-bold">{formatearPrecio(producto.precio)}</span>;
    }

    return (
        <span>
            <span className="text-muted text-decoration-line-through me-2 small">{formatearPrecio(producto.precio)}</span>
            <span className="fw-bold text-danger">{formatearPrecio(precioFinal(producto))}</span>
            <span className="badge bg-danger ms-2">-{producto.descuento}%</span>
        </span>
    );
}
