import { formatearPrecio } from '../utils/formato';

/**
 * Subtotal, descuento por cupón y total.
 */
export default function ResumenTotales({ totales }) {
    return (
        <ul className="list-group mb-3">
            <li className="list-group-item d-flex justify-content-between">
                <span>Subtotal</span><span>{formatearPrecio(totales.subtotal)}</span>
            </li>
            {totales.descuento > 0 && (
                <li className="list-group-item d-flex justify-content-between text-success">
                    <span>Descuento ({totales.cupon})</span><span>- {formatearPrecio(totales.descuento)}</span>
                </li>
            )}
            <li className="list-group-item d-flex justify-content-between fw-bold">
                <span>Total</span><span>{formatearPrecio(totales.total)}</span>
            </li>
        </ul>
    );
}
