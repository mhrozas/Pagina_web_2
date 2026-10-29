import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Boton from '../components/Boton';
import CampoFormulario from '../components/CampoFormulario';
import MensajeError from '../components/MensajeError';
import { useSesion, puedeEntrarAlPanel } from '../context/SesionContext';
import { encadenar, validarCampos, validarCorreo, validarRango, validarRequerido } from '../utils/validaciones';

const REGLAS = {
    correo: encadenar(v => validarRequerido(v, 'correo'), validarCorreo),
    password: encadenar(v => validarRequerido(v, 'contraseña'), v => validarRango(v, 4, 10, 'contraseña'))
};

export default function Login() {
    const { iniciarSesion } = useSesion();
    const navegar = useNavigate();
    const [params] = useSearchParams();

    const [datos, setDatos] = useState({ correo: '', password: '' });
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState(
        params.get('acceso') === 'panel' ? 'Necesitas un perfil de administrador o vendedor para entrar al panel.' : ''
    );

    const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });

    const enviar = evento => {
        evento.preventDefault();
        const nuevos = validarCampos(datos, REGLAS);
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        const resultado = iniciarSesion(datos.correo);
        if (!resultado.exito) {
            setErrorGeneral(resultado.mensaje);
            return;
        }
        navegar(puedeEntrarAlPanel(resultado.sesion) ? '/admin' : '/');
    };

    return (
        <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
                <div className="card shadow-sm">
                    <form className="card-body" onSubmit={enviar} noValidate>
                        <h1 className="h4 mb-3">Iniciar sesión</h1>
                        <MensajeError mensaje={errorGeneral} />
                        <CampoFormulario id="correo" etiqueta="Correo" tipo="email" obligatorio maxLength={100} valor={datos.correo} onChange={cambiar} error={errores.correo} />
                        <CampoFormulario id="password" etiqueta="Contraseña" tipo="password" obligatorio maxLength={10} valor={datos.password} onChange={cambiar} error={errores.password} />
                        <Boton tipo="submit" etiqueta="INGRESAR" className="w-100" />
                        <p className="small mt-3 mb-1">¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link></p>
                        <p className="small mb-0"><Link to="/">← Volver a la tienda</Link></p>
                        <p className="small text-muted mt-3 mb-0">Demo: admin@duoc.cl, vendedor@duoc.cl o cliente@gmail.com (contraseña de 4 a 10 caracteres).</p>
                    </form>
                </div>
            </div>
        </div>
    );
}
