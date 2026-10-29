import { useState } from 'react';
import { Link } from 'react-router-dom';
import Alerta from '../../components/Alerta';
import ConfirmarEliminar from '../../components/ConfirmarEliminar';
import { eliminar } from '../../data/db';
import useColeccion from '../../hooks/useColeccion';
import { useSesion } from '../../context/SesionContext';

export default function Usuarios() {
    const { sesion } = useSesion();
    const usuarios = useColeccion('usuarios');
    const [tipo, setTipo] = useState('todos');
    const [busqueda, setBusqueda] = useState('');
    const [resultado, setResultado] = useState(null);

    const visibles = usuarios.filter(u => (
        (tipo === 'todos' || u.tipoUsuario === tipo) &&
        `${u.run} ${u.nombre} ${u.apellidos} ${u.correo}`.toLowerCase().includes(busqueda.toLowerCase())
    ));

    const quitar = usuario => {
        setResultado(usuario.correo === sesion.correo
            ? { exito: false, mensaje: 'No puedes eliminar tu propia cuenta.' }
            : eliminar('usuarios', usuario.run));
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 className="h3 mb-0">Usuarios</h1>
                <Link to="/admin/usuarios/nuevo" className="btn btn-primary">Nuevo usuario</Link>
            </div>

            <div className="row g-2 mb-3">
                <div className="col-md-8"><input className="form-control" placeholder="Buscar por RUN, nombre o correo" aria-label="Buscar" value={busqueda} onChange={e => setBusqueda(e.target.value)} /></div>
                <div className="col-md-4">
                    <select className="form-select" aria-label="Tipo de usuario" value={tipo} onChange={e => setTipo(e.target.value)}>
                        <option value="todos">Todos los perfiles</option>
                        <option>Administrador</option><option>Vendedor</option><option>Cliente</option>
                    </select>
                </div>
            </div>
            <Alerta resultado={resultado} onCerrar={() => setResultado(null)} />

            <div className="table-responsive">
                <table className="table table-hover align-middle">
                    <thead><tr><th>RUN</th><th>Nombre</th><th>Correo</th><th>Perfil</th><th /></tr></thead>
                    <tbody>
                        {visibles.map(u => (
                            <tr key={u.run}>
                                <td>{u.run}</td><td>{u.nombre} {u.apellidos}</td><td>{u.correo}</td>
                                <td><span className="badge bg-secondary">{u.tipoUsuario}</span></td>
                                <td className="text-nowrap">
                                    <Link className="btn btn-sm btn-outline-secondary me-1" to={`/admin/usuarios/${u.run}/historial`}>Historial</Link>
                                    <Link className="btn btn-sm btn-outline-primary me-1" to={`/admin/usuarios/${u.run}/editar`}>Editar</Link>
                                    <ConfirmarEliminar onConfirmar={() => quitar(u)} />
                                </td>
                            </tr>
                        ))}
                        {visibles.length === 0 && <tr><td colSpan="5" className="text-center text-muted">No hay usuarios.</td></tr>}
                    </tbody>
                </table>
            </div>
        </>
    );
}
