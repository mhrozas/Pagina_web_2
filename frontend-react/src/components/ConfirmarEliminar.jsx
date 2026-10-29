import { useState } from 'react';

/**
 * Botón de eliminar que pide confirmación antes de ejecutar la acción.
 */
export default function ConfirmarEliminar({ onConfirmar, texto = 'Eliminar' }) {
    const [confirmando, setConfirmando] = useState(false);

    if (!confirmando) {
        return <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmando(true)}>{texto}</button>;
    }

    return (
        <span className="btn-group btn-group-sm">
            <button className="btn btn-danger" onClick={() => { setConfirmando(false); onConfirmar(); }}>Confirmar</button>
            <button className="btn btn-outline-secondary" onClick={() => setConfirmando(false)}>Cancelar</button>
        </span>
    );
}
