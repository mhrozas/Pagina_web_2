/**
 * Campo de formulario controlado: etiqueta, input, ayuda y error.
 * El estado vive en el componente padre; este solo recibe valor y manejadores.
 */
export default function CampoFormulario({
    id, etiqueta, valor, onChange, onBlur, error, tipo = 'text',
    obligatorio = false, ayuda, maxLength, placeholder, soloLectura = false, className = ''
}) {
    return (
        <div className={`mb-3 ${className}`}>
            <label htmlFor={id} className="form-label small fw-semibold text-uppercase">
                {etiqueta} {obligatorio && <span className="text-danger">*</span>}
            </label>
            <input
                id={id}
                name={id}
                type={tipo}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                value={valor}
                onChange={onChange}
                onBlur={onBlur}
                maxLength={maxLength}
                placeholder={placeholder}
                readOnly={soloLectura}
            />
            {ayuda && !error && <div className="form-text">{ayuda}</div>}
            {error && <div className="invalid-feedback" id={`error-${id}`}>{error}</div>}
        </div>
    );
}
