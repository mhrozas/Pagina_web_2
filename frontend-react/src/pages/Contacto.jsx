import { useState } from 'react';
import Boton from '../components/Boton';
import CampoFormulario from '../components/CampoFormulario';
import { encadenar, validarCampos, validarCorreo, validarMaximo, validarRequerido } from '../utils/validaciones';

const REGLAS = {
    nombre: encadenar(v => validarRequerido(v, 'nombre'), v => validarMaximo(v, 100, 'nombre')),
    correo: encadenar(v => validarMaximo(v, 100, 'correo'), validarCorreo),
    comentario: encadenar(v => validarRequerido(v, 'comentario'), v => validarMaximo(v, 500, 'comentario'))
};

export default function Contacto() {
    const [datos, setDatos] = useState({ nombre: '', correo: '', comentario: '' });
    const [errores, setErrores] = useState({});
    const [enviado, setEnviado] = useState(false);

    const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });

    const enviar = evento => {
        evento.preventDefault();
        const nuevos = validarCampos(datos, REGLAS);
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        setEnviado(true);
        setDatos({ nombre: '', correo: '', comentario: '' });
    };

    return (
        <>
            <h1 className="h3 mb-4">Contáctanos</h1>
            <div className="row g-4">
                <section className="col-md-5">
                    <h2 className="h5">Información de contacto</h2>
                    <p>¿Tienes dudas sobre un producto o tu pedido? Escríbenos y te respondemos dentro de 24 horas hábiles.</p>
                    <ul className="list-unstyled">
                        <li><strong>Dirección:</strong> Av. Providencia 1234, Santiago</li>
                        <li><strong>Teléfono:</strong> +56 2 2345 6789</li>
                        <li><strong>Correo:</strong> contacto@chstore.cl</li>
                        <li><strong>Horario:</strong> Lunes a viernes, 9:00 a 18:00</li>
                    </ul>
                </section>
                <section className="col-md-7">
                    <h2 className="h5">Envíanos un mensaje</h2>
                    {enviado && <div className="alert alert-success">¡Gracias! Tu mensaje fue enviado.</div>}
                    <form onSubmit={enviar} noValidate>
                        <CampoFormulario id="nombre" etiqueta="Nombre" obligatorio maxLength={100} valor={datos.nombre} onChange={cambiar} error={errores.nombre} />
                        <CampoFormulario id="correo" etiqueta="Correo (opcional)" tipo="email" maxLength={100} valor={datos.correo} onChange={cambiar} error={errores.correo} />
                        <div className="mb-3">
                            <label htmlFor="comentario" className="form-label small fw-semibold text-uppercase">Comentario <span className="text-danger">*</span></label>
                            <textarea
                                id="comentario"
                                name="comentario"
                                rows="5"
                                maxLength={500}
                                className={`form-control ${errores.comentario ? 'is-invalid' : ''}`}
                                value={datos.comentario}
                                onChange={cambiar}
                            />
                            <div className="form-text text-end">{datos.comentario.length} / 500</div>
                            {errores.comentario && <div className="invalid-feedback d-block">{errores.comentario}</div>}
                        </div>
                        <Boton tipo="submit" etiqueta="ENVIAR MENSAJE" />
                    </form>
                </section>
            </div>
        </>
    );
}
