import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Caja de búsqueda del encabezado: lleva a /productos?q=texto.
 */
export default function Buscador() {
    const [texto, setTexto] = useState('');
    const navegar = useNavigate();

    const buscar = evento => {
        evento.preventDefault();
        const consulta = texto.trim();
        navegar(consulta ? `/productos?q=${encodeURIComponent(consulta)}` : '/productos');
    };

    return (
        <form className="d-flex" role="search" onSubmit={buscar}>
            <input
                className="form-control form-control-sm me-2"
                type="search"
                placeholder="Buscar"
                aria-label="Buscar productos"
                value={texto}
                onChange={e => setTexto(e.target.value)}
            />
            <button className="btn btn-sm btn-outline-success" type="submit">Buscar</button>
        </form>
    );
}
