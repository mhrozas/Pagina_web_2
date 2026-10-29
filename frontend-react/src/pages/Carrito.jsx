import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Boton from '../components/Boton';
import ResumenTotales from '../components/ResumenTotales';
import TablaItems from '../components/TablaItems';
import { useCarrito } from '../context/CarritoContext';

export default function Carrito() {
    const { carrito, totales, cambiarCantidad, eliminar, vaciar, aplicarCupon } = useCarrito();
    const [codigoCupon, setCodigoCupon] = useState('');
    const [resultado, setResultado] = useState(null);

    if (carrito.length === 0) {
        return (
            <div className="text-center py-5">
                <h1 className="h4">Tu carrito está vacío.</h1>
                <Link to="/productos" className="btn btn-dark mt-3">Ver productos</Link>
            </div>
        );
    }

    return (
        <>
            <h1 className="h3 mb-3">Carrito de compras</h1>

            <TablaItems
                items={carrito}
                onSumar={clave => cambiarCantidad(clave, 1)}
                onRestar={clave => cambiarCantidad(clave, -1)}
                onEliminar={eliminar}
            />

            <div className="row g-4">
                <div className="col-md-6">
                    <label htmlFor="cupon" className="form-label">¿Tienes un cupón?</label>
                    <div className="input-group mb-2">
                        <input id="cupon" className="form-control" value={codigoCupon} onChange={e => setCodigoCupon(e.target.value)} placeholder="Ej: DUOC15" />
                        <Boton etiqueta="Aplicar" variante="outline-secondary" onClick={() => setResultado(aplicarCupon(codigoCupon))} />
                    </div>
                    <Alerta resultado={resultado} onCerrar={() => setResultado(null)} />
                </div>
                <div className="col-md-6">
                    <ResumenTotales totales={totales} />
                    <div className="d-flex justify-content-end gap-2">
                        <Boton etiqueta="Limpiar" variante="secondary" onClick={vaciar} />
                        <Link to="/checkout" className="btn btn-success">Comprar ahora</Link>
                    </div>
                </div>
            </div>
        </>
    );
}
