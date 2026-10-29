import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/Boton';
import CampoFormulario from '../../components/CampoFormulario';
import MensajeError from '../../components/MensajeError';
import SelectorRegionComuna from '../../components/SelectorRegionComuna';
import { actualizar, buscarUsuarioPorCorreo, crear, obtener, usandoApi } from '../../data/db';
import { REGLAS_USUARIO } from '../../utils/admin';
import { validarCampos, validarRango, validarRequerido } from '../../utils/validaciones';

const VACIO = { run: '', nombre: '', apellidos: '', correo: '', tipoUsuario: '', region: '', comuna: '', direccion: '', fechaNacimiento: '' };

export default function UsuarioForm() {
    const { run } = useParams();
    const navegar = useNavigate();
    const existente = run ? obtener('usuarios', run) : null;

    const [datos, setDatos] = useState(existente ? { ...VACIO, ...existente } : VACIO);
    const [password, setPassword] = useState('');
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    if (run && !existente) return <p>El usuario no existe. <Link to="/admin/usuarios">Volver</Link></p>;

    const cambiar = e => {
        const { name, value } = e.target;
        setDatos(name === 'region' ? { ...datos, region: value, comuna: '' } : { ...datos, [name]: value });
    };
    const validarCampo = e => setErrores({ ...errores, [e.target.name]: REGLAS_USUARIO[e.target.name]?.(e.target.value) || '' });

    const enviar = evento => {
        evento.preventDefault();
        const nuevos = validarCampos(datos, REGLAS_USUARIO);
        // Con backend, el usuario nuevo necesita contraseña; al editar es opcional (la restablece)
        if (usandoApi() && (!existente || password)) {
            const errorClave = (!existente && validarRequerido(password, 'contraseña')) || validarRango(password, 4, 10, 'contraseña');
            if (errorClave) nuevos.password = errorClave;
        }
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        const otro = buscarUsuarioPorCorreo(datos.correo);
        if (otro && otro.run !== datos.run.toUpperCase()) {
            setErrores({ ...nuevos, correo: 'Ya existe una cuenta con este correo.' });
            return;
        }

        const usuario = { ...datos, run: datos.run.trim().toUpperCase(), nombre: datos.nombre.trim(), apellidos: datos.apellidos.trim(), correo: datos.correo.trim() };
        const resultado = existente
            ? actualizar('usuarios', run, usuario, password ? { password } : undefined)
            : crear('usuarios', usuario, usandoApi() ? { password } : undefined);
        if (!resultado.exito) return setErrorGeneral(resultado.mensaje);
        navegar('/admin/usuarios');
    };

    const campo = (id, etiqueta, extra = {}) => (
        <CampoFormulario id={id} etiqueta={etiqueta} valor={datos[id]} onChange={cambiar} onBlur={validarCampo} error={errores[id]} {...extra} />
    );

    return (
        <>
            <h1 className="h3 mb-3">{existente ? 'Editar usuario' : 'Nuevo usuario'}</h1>
            <form onSubmit={enviar} noValidate style={{ maxWidth: 720 }}>
                <MensajeError mensaje={errorGeneral} />
                <div className="row">
                    <div className="col-md-6">{campo('run', 'RUN', { obligatorio: true, maxLength: 9, soloLectura: Boolean(existente), ayuda: 'Sin puntos ni guion.' })}</div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="tipoUsuario" className="form-label small fw-semibold text-uppercase">Tipo de usuario <span className="text-danger">*</span></label>
                        <select id="tipoUsuario" name="tipoUsuario" className={`form-select ${errores.tipoUsuario ? 'is-invalid' : ''}`} value={datos.tipoUsuario} onChange={cambiar}>
                            <option value="">-- Seleccione --</option>
                            <option>Administrador</option><option>Vendedor</option><option>Cliente</option>
                        </select>
                        {errores.tipoUsuario && <div className="invalid-feedback">{errores.tipoUsuario}</div>}
                    </div>
                    <div className="col-md-6">{campo('nombre', 'Nombre', { obligatorio: true, maxLength: 50 })}</div>
                    <div className="col-md-6">{campo('apellidos', 'Apellidos', { obligatorio: true, maxLength: 100 })}</div>
                    <div className="col-md-6">{campo('correo', 'Correo', { obligatorio: true, tipo: 'email', maxLength: 100 })}</div>
                    <div className="col-md-6">{campo('fechaNacimiento', 'Fecha de nacimiento', { tipo: 'date' })}</div>
                </div>
                <SelectorRegionComuna region={datos.region} comuna={datos.comuna} onChange={cambiar} errores={errores} />
                {campo('direccion', 'Dirección', { obligatorio: true, maxLength: 300 })}
                {usandoApi() && (
                    <CampoFormulario
                        id="password" etiqueta={existente ? 'Nueva contraseña' : 'Contraseña'} tipo="password"
                        obligatorio={!existente} maxLength={10} valor={password} onChange={e => setPassword(e.target.value)}
                        error={errores.password} ayuda={existente ? 'Déjala vacía para no cambiarla.' : 'Entre 4 y 10 caracteres.'}
                    />
                )}
                <div className="d-flex gap-2">
                    <Boton tipo="submit" variante="primary" etiqueta="Guardar" />
                    <Link to="/admin/usuarios" className="btn btn-outline-secondary">Cancelar</Link>
                </div>
            </form>
        </>
    );
}
