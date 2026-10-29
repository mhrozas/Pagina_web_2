import FilaCarrito from './FilaCarrito';

/**
 * Tabla de productos del carrito o de una orden.
 */
export default function TablaItems({ items, onSumar, onRestar, onEliminar }) {
    const editable = Boolean(onSumar);

    return (
        <div className="table-responsive">
            <table className="table align-middle">
                <thead>
                    <tr>
                        <th>Imagen</th><th>Nombre</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th>
                        {editable && <th>Acciones</th>}
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <FilaCarrito
                            key={item.codigo + item.talla}
                            item={item}
                            onSumar={onSumar}
                            onRestar={onRestar}
                            onEliminar={onEliminar}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
}
