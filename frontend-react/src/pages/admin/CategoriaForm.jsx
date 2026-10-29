import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/Boton';
import CampoFormulario from '../../components/CampoFormulario';
import MensajeError from '../../components/MensajeError';
import { actualizar, crear, obtener } from '../../data/db';
import { REGLAS_CATEGORIA } from '../../utils/admin';
import { validarCampos } from '../../utils/validaciones';

export default function CategoriaForm() {
    const { nombre } = useParams();
    const navegar = useNavigate();
    const existente = nombre ? obtener('categorias', nombre) : null;

    const [datos, setDatos] = useState(existente || { nombre: '', descripcion: '' });
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    if (nombre && !existente) return <p>La categoría no existe. <Link to="/admin/categorias">Volver</Link></p>;

    const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });

    const enviar = evento => {
        evento.preventDefault();
        const nuevos = validarCampos(datos, REGLAS_CATEGORIA);
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        const categoria = { nombre: datos.nombre.trim(), descripcion: datos.descripcion.trim() };
        const resultado = existente ? actualizar('categorias', nombre, categoria) : crear('categorias', categoria);
        if (!resultado.exito) return setErrorGeneral(resultado.mensaje);
        navegar('/admin/categorias');
    };

    return (
        <>
            <h1 className="h3 mb-3">{existente ? 'Editar categoría' : 'Nueva categoría'}</h1>
            <form onSubmit={enviar} noValidate style={{ maxWidth: 520 }}>
                <MensajeError mensaje={errorGeneral} />
                <CampoFormulario id="nombre" etiqueta="Nombre" obligatorio maxLength={50} valor={datos.nombre} onChange={cambiar} error={errores.nombre} soloLectura={Boolean(existente)} />
                <CampoFormulario id="descripcion" etiqueta="Descripción" maxLength={200} valor={datos.descripcion} onChange={cambiar} error={errores.descripcion} />
                <div className="d-flex gap-2">
                    <Boton tipo="submit" variante="primary" etiqueta="Guardar" />
                    <Link to="/admin/categorias" className="btn btn-outline-secondary">Cancelar</Link>
                </div>
            </form>
        </>
    );
}
