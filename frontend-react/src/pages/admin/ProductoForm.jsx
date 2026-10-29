import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Boton from '../../components/Boton';
import CampoFormulario from '../../components/CampoFormulario';
import MensajeError from '../../components/MensajeError';
import { actualizar, crear, obtener } from '../../data/db';
import useColeccion from '../../hooks/useColeccion';
import { REGLAS_PRODUCTO } from '../../utils/admin';
import { validarCampos } from '../../utils/validaciones';

const VACIO = { codigo: '', nombre: '', descripcion: '', precio: '', stock: '', stockCritico: '', descuento: '0', categoria: '', imagen: '' };

/**
 * Alta y edición de productos (la ruta con :codigo es edición).
 */
export default function ProductoForm() {
    const { codigo } = useParams();
    const navegar = useNavigate();
    const categorias = useColeccion('categorias');
    const existente = codigo ? obtener('productos', codigo) : null;

    const [datos, setDatos] = useState(() => (existente ? {
        ...VACIO, ...existente,
        precio: String(existente.precio), stock: String(existente.stock),
        stockCritico: String(existente.stockCritico ?? ''), descuento: String(existente.descuento ?? 0)
    } : VACIO));
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    if (codigo && !existente) return <p>El producto no existe. <Link to="/admin/productos">Volver</Link></p>;

    const cambiar = e => setDatos({ ...datos, [e.target.name]: e.target.value });
    const validarCampo = e => setErrores({ ...errores, [e.target.name]: REGLAS_PRODUCTO[e.target.name]?.(e.target.value) || '' });

    const enviar = evento => {
        evento.preventDefault();
        const nuevos = validarCampos(datos, REGLAS_PRODUCTO);
        setErrores(nuevos);
        if (Object.keys(nuevos).length > 0) return;

        const producto = {
            codigo: datos.codigo.trim(),
            nombre: datos.nombre.trim(),
            descripcion: datos.descripcion.trim(),
            precio: Number(datos.precio),
            stock: Number(datos.stock),
            stockCritico: Number(datos.stockCritico) || 0,
            descuento: Number(datos.descuento) || 0,
            categoria: datos.categoria,
            imagen: datos.imagen.trim() || '/img/logo-chstore.png'
        };

        const resultado = existente
            ? actualizar('productos', codigo, producto)
            : crear('productos', { atributos: producto.categoria, galeria: [], ...producto });

        if (!resultado.exito) return setErrorGeneral(resultado.mensaje);
        navegar('/admin/productos');
    };

    const campo = (id, etiqueta, extra = {}) => (
        <CampoFormulario id={id} etiqueta={etiqueta} valor={datos[id]} onChange={cambiar} onBlur={validarCampo} error={errores[id]} {...extra} />
    );

    return (
        <>
            <h1 className="h3 mb-3">{existente ? 'Editar producto' : 'Nuevo producto'}</h1>
            <form onSubmit={enviar} noValidate style={{ maxWidth: 720 }}>
                <MensajeError mensaje={errorGeneral} />
                <div className="row">
                    <div className="col-md-6">{campo('codigo', 'Código del producto', { obligatorio: true, soloLectura: Boolean(existente) })}</div>
                    <div className="col-md-6 mb-3">
                        <label htmlFor="categoria" className="form-label small fw-semibold text-uppercase">Categoría <span className="text-danger">*</span></label>
                        <select id="categoria" name="categoria" className={`form-select ${errores.categoria ? 'is-invalid' : ''}`} value={datos.categoria} onChange={cambiar} onBlur={validarCampo}>
                            <option value="">-- Seleccione la categoría --</option>
                            {categorias.map(c => <option key={c.nombre} value={c.nombre}>{c.nombre}</option>)}
                        </select>
                        {errores.categoria && <div className="invalid-feedback">{errores.categoria}</div>}
                    </div>
                </div>
                {campo('nombre', 'Nombre', { obligatorio: true, maxLength: 100 })}
                <div className="mb-3">
                    <label htmlFor="descripcion" className="form-label small fw-semibold text-uppercase">Descripción</label>
                    <textarea id="descripcion" name="descripcion" rows="4" maxLength={500} className={`form-control ${errores.descripcion ? 'is-invalid' : ''}`} value={datos.descripcion} onChange={cambiar} onBlur={validarCampo} />
                    <div className="form-text text-end">{datos.descripcion.length} / 500</div>
                </div>
                <div className="row">
                    <div className="col-md-3">{campo('precio', 'Precio', { obligatorio: true, tipo: 'number' })}</div>
                    <div className="col-md-3">{campo('stock', 'Stock', { obligatorio: true, tipo: 'number' })}</div>
                    <div className="col-md-3">{campo('stockCritico', 'Stock crítico', { tipo: 'number' })}</div>
                    <div className="col-md-3">{campo('descuento', 'Descuento %', { tipo: 'number', ayuda: '0 = sin oferta' })}</div>
                </div>
                {campo('imagen', 'Imagen (URL)')}
                <div className="d-flex gap-2">
                    <Boton tipo="submit" variante="primary" etiqueta="Guardar" />
                    <Link to="/admin/productos" className="btn btn-outline-secondary">Cancelar</Link>
                </div>
            </form>
        </>
    );
}
