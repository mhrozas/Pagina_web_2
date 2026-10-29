import TarjetaIndicador from '../../components/TarjetaIndicador';
import useColeccion from '../../hooks/useColeccion';
import { calcularIndicadores, ordenesPorEstado, productosCriticos, ventasPorProducto } from '../../utils/admin';
import { formatearPrecio } from '../../utils/formato';

export default function Reportes() {
    const ordenes = useColeccion('ordenes');
    const productos = useColeccion('productos');
    const usuarios = useColeccion('usuarios');

    const ind = calcularIndicadores(ordenes, productos, usuarios);
    const ventas = ventasPorProducto(ordenes);
    const estados = ordenesPorEstado(ordenes);

    return (
        <>
            <h1 className="h3 mb-3">Reportes</h1>

            <div className="row g-3 mb-4">
                <div className="col-md-4"><TarjetaIndicador titulo="Ingresos" valor={formatearPrecio(ind.ingresos)} color="success" icono="bi-cash-coin" /></div>
                <div className="col-md-4"><TarjetaIndicador titulo="Ticket promedio" valor={formatearPrecio(ind.ticketPromedio)} color="primary" icono="bi-receipt" /></div>
                <div className="col-md-4"><TarjetaIndicador titulo="Stock crítico" valor={productosCriticos(productos).length} color="warning" icono="bi-exclamation-triangle" /></div>
            </div>

            <div className="row g-4">
                <section className="col-lg-7">
                    <h2 className="h5">Productos más vendidos</h2>
                    <div className="table-responsive">
                        <table className="table table-sm">
                            <thead><tr><th>Producto</th><th>Unidades</th><th>Monto</th></tr></thead>
                            <tbody>
                                {ventas.map(v => <tr key={v.codigo}><td>{v.nombre}</td><td>{v.unidades}</td><td>{formatearPrecio(v.monto)}</td></tr>)}
                                {ventas.length === 0 && <tr><td colSpan="3" className="text-muted">Aún no hay ventas con detalle.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </section>
                <section className="col-lg-5">
                    <h2 className="h5">Órdenes por estado</h2>
                    <ul className="list-group">
                        {Object.entries(estados).map(([estado, cantidad]) => (
                            <li key={estado} className="list-group-item d-flex justify-content-between">{estado}<span className="badge bg-secondary">{cantidad}</span></li>
                        ))}
                    </ul>
                </section>
            </div>
        </>
    );
}
