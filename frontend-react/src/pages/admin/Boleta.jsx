import { Link, useParams } from 'react-router-dom';
import TablaItems from '../../components/TablaItems';
import { obtener, actualizar } from '../../data/db';
import useColeccion from '../../hooks/useColeccion';
import { formatearPrecio } from '../../utils/formato';

const ESTADOS = ['Pendiente de despacho', 'En preparación', 'Despachada', 'Entregada'];

export default function Boleta() {
    const { numero } = useParams();
    useColeccion('ordenes');
    const orden = obtener('ordenes', numero);

    if (!orden) return <p>La orden no existe. <Link to="/admin/ordenes">Volver</Link></p>;

    const entrega = orden.datosEntrega;

    return (
        <>
            <h1 className="h3">Boleta {orden.numero}</h1>
            <dl className="row">
                <dt className="col-sm-2">Cliente</dt><dd className="col-sm-10">{orden.cliente} {orden.correo && `(${orden.correo})`}</dd>
                <dt className="col-sm-2">Fecha</dt><dd className="col-sm-10">{orden.fecha}</dd>
                {entrega && <><dt className="col-sm-2">Entrega</dt><dd className="col-sm-10">{entrega.calle}, {entrega.comuna}</dd></>}
                <dt className="col-sm-2">Estado</dt>
                <dd className="col-sm-10">
                    {orden.estado === 'Pago rechazado' || orden.estado === 'Pendiente de pago' ? orden.estado : (
                        <select className="form-select form-select-sm w-auto" value={orden.estado} onChange={e => actualizar('ordenes', orden.numero, { estado: e.target.value })}>
                            {ESTADOS.map(e => <option key={e}>{e}</option>)}
                        </select>
                    )}
                </dd>
            </dl>

            {orden.items && orden.items.length > 0
                ? <TablaItems items={orden.items} />
                : <p className="text-muted">Esta orden de ejemplo no tiene detalle de productos.</p>}

            {orden.descuento > 0 && <p>Descuento ({orden.cupon}): - {formatearPrecio(orden.descuento)}</p>}
            <p className="fs-5 fw-bold">Total: {formatearPrecio(orden.total)}</p>
            <div className="d-flex gap-2">
                <Link to="/admin/ordenes" className="btn btn-outline-secondary">← Volver</Link>
                <button className="btn btn-danger" onClick={() => window.print()}>Imprimir boleta en PDF</button>
            </div>
        </>
    );
}
