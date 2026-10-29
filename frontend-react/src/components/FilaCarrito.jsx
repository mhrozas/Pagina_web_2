import { claveItem } from '../utils/carrito';
import { formatearPrecio } from '../utils/formato';

/**
 * Una línea del carrito. Recibe el item y las acciones por props.
 * Si no se entregan acciones, se muestra en modo solo lectura (checkout y boleta).
 */
export default function FilaCarrito({ item, onSumar, onRestar, onEliminar }) {
    const clave = claveItem(item);
    const editable = Boolean(onSumar);

    return (
        <tr>
            <td style={{ width: 70 }}><img src={item.imagen} alt={item.nombre} className="img-fluid rounded" style={{ maxHeight: 60 }} /></td>
            <td>
                {item.nombre}
                {item.talla && <div className="small text-muted">Talla: {item.talla}</div>}
            </td>
            <td>{formatearPrecio(item.precio)}</td>
            <td>
                {editable ? (
                    <div className="btn-group btn-group-sm" role="group">
                        <button className="btn btn-outline-secondary" aria-label="Quitar una unidad" onClick={() => onRestar(clave)}>-</button>
                        <span className="btn btn-light disabled">{item.cantidad}</span>
                        <button className="btn btn-outline-secondary" aria-label="Agregar una unidad" onClick={() => onSumar(clave)}>+</button>
                    </div>
                ) : item.cantidad}
            </td>
            <td>{formatearPrecio(item.precio * item.cantidad)}</td>
            {editable && (
                <td><button className="btn btn-sm btn-danger" onClick={() => onEliminar(clave)}>Eliminar</button></td>
            )}
        </tr>
    );
}
