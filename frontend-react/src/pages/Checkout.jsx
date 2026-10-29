import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Boton from '../components/Boton';
import CampoFormulario from '../components/CampoFormulario';
import SelectorRegionComuna from '../components/SelectorRegionComuna';
import TablaItems from '../components/TablaItems';
import { useCarrito } from '../context/CarritoContext';
import { useSesion } from '../context/SesionContext';
import { buscarUsuarioPorCorreo, descontarStock, registrarOrden } from '../data/db';
import { generarCodigoEnvio } from '../utils/carrito';
import { REGLAS_CHECKOUT, armarOrden } from '../utils/pago';
import { validarCampos } from '../utils/validaciones';
import { formatearPrecio } from '../utils/formato';

function datosIniciales(sesion) {
    const usuario = sesion ? buscarUsuarioPorCorreo(sesion.correo) : null;
    return {
        nombre: usuario?.nombre || '',
        apellidos: usuario?.apellidos || '',
        correo: usuario?.correo || '',
        calle: usuario?.direccion || '',
        departamento: '',
        region: usuario?.region || '',
        comuna: usuario?.comuna || '',
        indicaciones: ''
    };
}

/**
 * Paso de pago: datos del cliente y dirección de entrega. Si hay sesión iniciada
 * los datos se completan solos. El pago es simulado: el resultado se elige en pantalla.
 */
export default function Checkout() {
    const { carrito, totales, vaciar } = useCarrito();
    const { sesion } = useSesion();
    const navegar = useNavigate();

    const [datos, setDatos] = useState(() => datosIniciales(sesion));
    const [errores, setErrores] = useState({});
    const [resultadoPago, setResultadoPago] = useState('aprobado');

    if (carrito.length === 0) {
        return (
            <div className="text-center py-5">
                <p>No tienes productos en el carrito.</p>
                <Link to="/productos" className="btn btn-dark">Ver productos</Link>
            </div>
        );
    }

    const cambiar = evento => {
        const { name, value } = evento.target;
        const nuevos = name === 'region' ? { ...datos, region: value, comuna: '' } : { ...datos, [name]: value };
        setDatos(nuevos);
        if (errores[name]) setErrores({ ...errores, [name]: REGLAS_CHECKOUT[name](value) });
    };

    const validarCampo = evento => {
        const { name, value } = evento.target;
        setErrores({ ...errores, [name]: REGLAS_CHECKOUT[name](value) });
    };

    const pagar = evento => {
        evento.preventDefault();

        const nuevosErrores = validarCampos(datos, REGLAS_CHECKOUT);
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        const aprobada = resultadoPago === 'aprobado';
        const orden = armarOrden({ numero: generarCodigoEnvio(), cliente: datos, items: carrito, totales, aprobada });
        registrarOrden(orden);

        if (aprobada) {
            descontarStock(carrito);
            vaciar();
            navegar(`/pago-exitoso/${orden.numero}`);
        } else {
            navegar(`/pago-error/${orden.numero}`);
        }
    };

    const campo = (id, etiqueta, extra = {}) => (
        <CampoFormulario
            id={id}
            etiqueta={etiqueta}
            valor={datos[id]}
            onChange={cambiar}
            onBlur={validarCampo}
            error={errores[id]}
            {...extra}
        />
    );

    return (
        <div className="card shadow-sm">
            <form className="card-body" onSubmit={pagar} noValidate>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h1 className="h4">Carrito de compra</h1>
                        <p className="text-muted mb-0">Completa la siguiente información</p>
                    </div>
                    <span className="badge bg-primary fs-6">Total a pagar: {formatearPrecio(totales.total)}</span>
                </div>

                <TablaItems items={carrito} />

                <h2 className="h5 mt-4">Información del cliente</h2>
                <div className="row">
                    <div className="col-md-6">{campo('nombre', 'Nombre', { obligatorio: true, maxLength: 50 })}</div>
                    <div className="col-md-6">{campo('apellidos', 'Apellidos', { obligatorio: true, maxLength: 100 })}</div>
                    <div className="col-md-6">{campo('correo', 'Correo', { obligatorio: true, tipo: 'email', maxLength: 100 })}</div>
                </div>

                <h2 className="h5 mt-3">Dirección de entrega de los productos</h2>
                <div className="row">
                    <div className="col-md-6">{campo('calle', 'Calle', { obligatorio: true, maxLength: 300 })}</div>
                    <div className="col-md-6">{campo('departamento', 'Departamento (opcional)', { placeholder: 'Ej: 603', maxLength: 50 })}</div>
                </div>
                <SelectorRegionComuna region={datos.region} comuna={datos.comuna} onChange={cambiar} errores={errores} />
                <div className="mb-3">
                    <label htmlFor="indicaciones" className="form-label small fw-semibold text-uppercase">Indicaciones para la entrega (opcional)</label>
                    <textarea
                        id="indicaciones"
                        name="indicaciones"
                        rows="3"
                        maxLength={500}
                        className="form-control"
                        placeholder="Ej: Entre calles, color del edificio, no tiene timbre."
                        value={datos.indicaciones}
                        onChange={cambiar}
                    />
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <label htmlFor="resultadoPago" className="form-label small mb-1">Resultado del pago (simulación)</label>
                        <select id="resultadoPago" className="form-select form-select-sm" value={resultadoPago} onChange={e => setResultadoPago(e.target.value)}>
                            <option value="aprobado">Pago aprobado</option>
                            <option value="rechazado">Pago rechazado</option>
                        </select>
                    </div>
                    <Boton tipo="submit" variante="success" etiqueta={`Pagar ahora ${formatearPrecio(totales.total)}`} />
                </div>
            </form>
        </div>
    );
}
