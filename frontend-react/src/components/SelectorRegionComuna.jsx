import { REGIONES, obtenerComunas } from '../utils/regiones';

/**
 * Par de selects en cascada: la comuna depende de la región elegida.
 */
export default function SelectorRegionComuna({ region, comuna, onChange, errores = {} }) {
    const comunas = obtenerComunas(region);

    return (
        <div className="row">
            <div className="col-md-6 mb-3">
                <label htmlFor="region" className="form-label small fw-semibold text-uppercase">Región <span className="text-danger">*</span></label>
                <select
                    id="region"
                    name="region"
                    className={`form-select ${errores.region ? 'is-invalid' : ''}`}
                    value={region}
                    onChange={onChange}
                >
                    <option value="">-- Seleccione la región --</option>
                    {REGIONES.map(r => <option key={r.codigo} value={r.codigo}>{r.nombre}</option>)}
                </select>
                {errores.region && <div className="invalid-feedback">{errores.region}</div>}
            </div>
            <div className="col-md-6 mb-3">
                <label htmlFor="comuna" className="form-label small fw-semibold text-uppercase">Comuna <span className="text-danger">*</span></label>
                <select
                    id="comuna"
                    name="comuna"
                    className={`form-select ${errores.comuna ? 'is-invalid' : ''}`}
                    value={comuna}
                    onChange={onChange}
                    disabled={!region}
                >
                    <option value="">-- Seleccione la comuna --</option>
                    {comunas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errores.comuna && <div className="invalid-feedback">{errores.comuna}</div>}
            </div>
        </div>
    );
}
