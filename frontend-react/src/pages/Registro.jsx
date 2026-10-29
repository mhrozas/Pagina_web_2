import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Boton from '../components/Boton';
import CampoFormulario from '../components/CampoFormulario';
import MensajeError from '../components/MensajeError';
import SelectorRegionComuna from '../components/SelectorRegionComuna';
import { registrarUsuario } from '../data/db';
import {
    encadenar, validarCampos, validarCorreo, validarMaximo, validarRango, validarRequerido, validarRun
} from '../utils/validaciones';

const VACIO = {
    run: '', nombre: '', apellidos: '', correo: '', password: '', confirm_password: '',
    telefono: '', region: '', comuna: '', direccion: ''
};

const reglas = datos => ({
    run: encadenar(v => validarRequerido(v, 'RUN'), validarRun),
    nombre: encadenar(v => validarRequerido(v, 'nombre'), v => validarMaximo(v, 50, 'nombre')),
    apellidos: encadenar(v => validarRequerido(v, 'apellidos'), v => validarMaximo(v, 100, 'apellidos')),
    correo: encadenar(v => validarRequerido(v, 'correo'), v => validarMaximo(v, 100, 'correo'), validarCorreo),
    password: encadenar(v => validarRequerido(v, 'contraseña'), v => validarRango(v, 4, 10, 'contraseña')),
    confirm_password: v => (!v ? 'Debes confirmar la contraseña.' : v !== datos.password ? 'Las contraseñas no coinciden.' : ''),
    telefono: v => (v && !/^\+?[0-9 ]{8,15}$/.test(v) ? 'El teléfono no es válido.' : ''),
    region: v => validarRequerido(v, 'región'),
    comuna: v => validarRequerido(v, 'comuna'),
    direccion: encadenar(v => validarRequerido(v, 'dirección'), v => validarMaximo(v, 300, 'dirección'))
});

export default function Registro() {
    const navegar = useNavigate();
    const [datos, setDatos] = useState(VACIO);
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');
    const [exito, setExito] = useState('');

    const cambiar = e => {
        const { name, value } = e.target;
        setDatos(name === 'region' ? { ...datos, region: value, comuna: '' } : { ...datos, [name]: value });
    };

    const validarCampo = e => {
        const { name, value } = e.target;
        setErrores({ ...errores, [name]: reglas(datos)[name](value) });
    };

    const enviar = evento => {
        evento.preventDefault();
        const nuevos = validarCampos(datos, reglas(datos));
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        const resultado = registrarUsuario({
            run: datos.run.trim().toUpperCase(),
            nombre: datos.nombre.trim(),
            apellidos: datos.apellidos.trim(),
            correo: datos.correo.trim(),
            tipoUsuario: 'Cliente',
            region: datos.region,
            comuna: datos.comuna,
            direccion: datos.direccion.trim(),
            telefono: datos.telefono,
            fechaNacimiento: ''
        });

        if (!resultado.exito) {
            setErrorGeneral(resultado.mensaje);
            if (resultado.campo) setErrores({ ...errores, [resultado.campo]: resultado.mensaje });
            return;
        }

        setErrorGeneral('');
        setExito(resultado.mensaje);
        setTimeout(() => navegar('/login'), 1500);
    };

    const campo = (id, etiqueta, extra = {}) => (
        <CampoFormulario id={id} etiqueta={etiqueta} valor={datos[id]} onChange={cambiar} onBlur={validarCampo} error={errores[id]} {...extra} />
    );

    return (
        <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6">
                <div className="card shadow-sm">
                    <form className="card-body" onSubmit={enviar} noValidate>
                        <h1 className="h4 mb-3">Registro de usuario</h1>
                        <MensajeError mensaje={errorGeneral} />
                        {exito && <div className="alert alert-success">{exito}</div>}

                        {campo('run', 'RUN', { obligatorio: true, maxLength: 9, placeholder: 'Ej: 19011029K', ayuda: 'Sin puntos ni guion, entre 7 y 9 caracteres.' })}
                        {campo('nombre', 'Nombre', { obligatorio: true, maxLength: 50 })}
                        {campo('apellidos', 'Apellidos', { obligatorio: true, maxLength: 100 })}
                        {campo('correo', 'Correo', { obligatorio: true, tipo: 'email', maxLength: 100, ayuda: 'Solo @duoc.cl, @profesor.duoc.cl y @gmail.com.' })}
                        {campo('password', 'Contraseña', { obligatorio: true, tipo: 'password', maxLength: 10, ayuda: 'Entre 4 y 10 caracteres.' })}
                        {campo('confirm_password', 'Confirmar contraseña', { obligatorio: true, tipo: 'password', maxLength: 10 })}
                        {campo('telefono', 'Teléfono (opcional)', { tipo: 'tel', maxLength: 15 })}
                        <SelectorRegionComuna region={datos.region} comuna={datos.comuna} onChange={cambiar} errores={errores} />
                        {campo('direccion', 'Dirección', { obligatorio: true, maxLength: 300 })}

                        <Boton tipo="submit" etiqueta="REGISTRAR" className="w-100" />
                        <p className="small mt-3 mb-0">¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
                    </form>
                </div>
            </div>
        </div>
    );
}
