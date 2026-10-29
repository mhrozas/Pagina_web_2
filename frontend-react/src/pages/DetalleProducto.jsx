import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Alerta from '../components/Alerta';
import Boton from '../components/Boton';
import Precio from '../components/Precio';
import useColeccion from '../hooks/useColeccion';
import { useCarrito } from '../context/CarritoContext';
import { TALLAS } from '../utils/carrito';

/**
 * Ficha del producto: galería, talla, cantidad y botón de agregar al carrito.
 */
export default function DetalleProducto() {
    const { codigo } = useParams();
    const producto = useColeccion('productos').find(p => p.codigo === codigo);
    const { agregar } = useCarrito();

    const [imagenActiva, setImagenActiva] = useState(null);
    const [talla, setTalla] = useState('M');
    const [cantidad, setCantidad] = useState(1);
    const [resultado, setResultado] = useState(null);

    if (!producto) {
        return (
            <div className="text-center py-5">
                <p>El producto no existe.</p>
                <Link to="/productos" className="btn btn-dark">Volver al catálogo</Link>
            </div>
        );
    }

    const imagenes = [producto.imagen, ...(producto.galeria || [])];
    const agotado = producto.stock === 0;

    return (
        <div className="row g-4">
            <div className="col-md-6">
                <img src={imagenActiva || producto.imagen} alt={producto.nombre} className="img-fluid rounded mb-2 w-100" />
                {imagenes.length > 1 && (
                    <div className="d-flex gap-2">
                        {imagenes.map(url => (
                            <img
                                key={url}
                                src={url}
                                alt=""
                                className="img-thumbnail miniatura"
                                onClick={() => setImagenActiva(url)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="col-md-6">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                        <li className="breadcrumb-item"><Link to={`/categorias/${encodeURIComponent(producto.categoria)}`}>{producto.categoria}</Link></li>
                        <li className="breadcrumb-item active">{producto.nombre}</li>
                    </ol>
                </nav>

                <h1 className="h3">{producto.nombre}</h1>
                <p className="fs-4"><Precio producto={producto} /></p>
                <p>{producto.descripcion}</p>
                <p className="small text-muted">Código: {producto.codigo} · Stock: {agotado ? 'agotado' : producto.stock}</p>

                <Alerta resultado={resultado} onCerrar={() => setResultado(null)} />

                {!agotado && (
                    <div className="row g-2 mb-3">
                        <div className="col-6">
                            <label htmlFor="talla" className="form-label small">Talla</label>
                            <select id="talla" className="form-select" value={talla} onChange={e => setTalla(e.target.value)}>
                                {Object.entries(TALLAS).map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
                            </select>
                        </div>
                        <div className="col-6">
                            <label htmlFor="cantidad" className="form-label small">Cantidad</label>
                            <input
                                id="cantidad"
                                type="number"
                                min="1"
                                max={producto.stock}
                                className="form-control"
                                value={cantidad}
                                onChange={e => setCantidad(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <Boton
                    etiqueta={agotado ? 'Sin stock' : 'Añadir al carrito'}
                    deshabilitado={agotado}
                    onClick={() => setResultado(agregar(producto.codigo, cantidad, talla))}
                />
            </div>
        </div>
    );
}
