/**
 * Aviso con color según el resultado de una operación.
 */
export default function Alerta({ resultado, onCerrar }) {
    if (!resultado) return null;
    return (
        <div className={`alert alert-${resultado.exito ? 'success' : 'warning'} alert-dismissible`} role="status">
            {resultado.mensaje}
            {onCerrar && <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />}
        </div>
    );
}
