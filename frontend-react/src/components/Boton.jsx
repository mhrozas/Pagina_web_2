/**
 * Botón reutilizable: recibe su etiqueta, su variante de Bootstrap y la función onClick.
 */
export default function Boton({ etiqueta, onClick, variante = 'dark', tipo = 'button', deshabilitado = false, className = '' }) {
    return (
        <button
            type={tipo}
            className={`btn btn-${variante} ${className}`}
            onClick={onClick}
            disabled={deshabilitado}
        >
            {etiqueta}
        </button>
    );
}
