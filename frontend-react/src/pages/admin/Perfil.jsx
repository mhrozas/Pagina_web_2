import { useState } from 'react';
import Alerta from '../../components/Alerta';
import Boton from '../../components/Boton';
import CampoFormulario from '../../components/CampoFormulario';
import { actualizar, buscarUsuarioPorCorreo } from '../../data/db';
import { useSesion } from '../../context/SesionContext';
import { encadenar, validarCampos, validarMaximo, validarRequerido } from '../../utils/validaciones';

const REGLAS = {
    nombre: encadenar(v => validarRequerido(v, 'nombre'), v => validarMaximo(v, 50, 'nombre')),
    apellidos: encadenar(v => validarRequerido(v, 'apellidos'), v => validarMaximo(v, 100, 'apellidos')),
    direccion: encadenar(v => validarRequerido(v, 'dirección'), v => validarMaximo(v, 300, 'dirección'))
};

export default function Perfil() {
    const { sesion } = useSesion();
    const usuario = buscarUsuarioPorCorreo(sesion.correo);
    const [datos, setDatos] = useState({ nombre: usuario?.nombre || '', apellidos: usuario?.apellidos || '', direccion: usuario?.direccion || '' });
    const [errores, setErrores] = useState({});
    const [resultado, setResultado] = useState(null);

    if (!usuario) return <p>No se encontró tu usuario en la base de datos.</p>;

    const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });

    const guardar = evento => {
        evento.preventDefault();
        const nuevos = validarCampos(datos, REGLAS);
        setErrores(nuevos);
        if (Object.keys(nuevos).length === 0) setResultado(actualizar('usuarios', usuario.run, datos));
    };

    return (
        <>
            <h1 className="h3 mb-3">Perfil</h1>
            <form onSubmit={guardar} noValidate style={{ maxWidth: 520 }}>
                <Alerta resultado={resultado} onCerrar={() => setResultado(null)} />
                <CampoFormulario id="correo" etiqueta="Correo" valor={usuario.correo} soloLectura onChange={() => {}} />
                <CampoFormulario id="nombre" etiqueta="Nombre" obligatorio valor={datos.nombre} onChange={cambiar} error={errores.nombre} />
                <CampoFormulario id="apellidos" etiqueta="Apellidos" obligatorio valor={datos.apellidos} onChange={cambiar} error={errores.apellidos} />
                <CampoFormulario id="direccion" etiqueta="Dirección" obligatorio valor={datos.direccion} onChange={cambiar} error={errores.direccion} />
                <Boton tipo="submit" variante="primary" etiqueta="Guardar cambios" />
            </form>
        </>
    );
}
