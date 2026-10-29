import { Link, useParams } from 'react-router-dom';
import TablaItems from '../components/TablaItems';
import { obtener } from '../data/db';
import { obtenerComunas, REGIONES } from '../utils/regiones';
import { formatearPrecio } from '../utils/formato';

/**
 * Resumen de una compra (boleta). Sirve para el pago exitoso y para el pago con error.
 */
export default function ResultadoCompra({ exitoso }) {
    const { numero } = useParams();
    const orden = obtener('ordenes', numero);

    if (!orden || !orden.datosEntrega) {
        return (
            <div className="text-center py-5">
                <p>No se encontró la orden {numero}.</p>
                <Link to="/" className="btn btn-dark">Volver al inicio</Link>
            </div>
        );
    }

    const entrega = orden.datosEntrega;
    const region = REGIONES.find(r => r.codigo === entrega.region);

    return (
        <div className="card shadow-sm">
            <div className="card-body">
                <p className="text-end small text-muted mb-1">Código orden: {orden.numero}</p>
                <h1 className={`h4 ${exitoso ? 'text-success' : 'text-danger'}`}>
                    <i className={`bi ${exitoso ? 'bi-check-circle' : 'bi-x-circle'} me-2`} />
                    {exitoso ? `Se ha realizado la compra. nro #${orden.numero}` : `No se pudo realizar el pago. nro #${orden.numero}`}
                </h1>

                {!exitoso && (
                    <div className="my-3">
                        <Link to="/checkout" className="btn btn-success text-uppercase">Volver a realizar el pago</Link>
                    </div>
                )}

                <dl className="row mt-3">
                    <dt className="col-sm-3">Cliente</dt><dd className="col-sm-9">{orden.cliente} ({orden.correo})</dd>
                    <dt className="col-sm-3">Dirección</dt>
                    <dd className="col-sm-9">
                        {entrega.calle}{entrega.departamento && `, Depto ${entrega.departamento}`} — {entrega.comuna}, {region ? region.nombre : entrega.region}
                    </dd>
                    {entrega.indicaciones && <><dt className="col-sm-3">Indicaciones</dt><dd className="col-sm-9">{entrega.indicaciones}</dd></>}
                </dl>

                <TablaItems items={orden.items} />

                <div className="bg-light rounded p-3 text-center fw-bold fs-5 mb-3">
                    {exitoso ? 'Total pagado' : 'Total a pagar'}: {formatearPrecio(orden.total)}
                </div>

                {exitoso && (
                    <div className="d-flex gap-2 justify-content-center">
                        <button className="btn btn-sm btn-danger" onClick={() => window.print()}>Imprimir boleta en PDF</button>
                        <a className="btn btn-sm btn-success" href={`mailto:${orden.correo}?subject=Boleta ${orden.numero}`}>Enviar boleta por email</a>
                    </div>
                )}
            </div>
        </div>
    );
}
