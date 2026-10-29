/**
 * Indicador numérico del tablero, con color de Bootstrap.
 */
export default function TarjetaIndicador({ titulo, valor, detalle, color = 'primary', icono }) {
    return (
        <div className={`card text-white bg-${color} h-100`}>
            <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                    <div className="small text-uppercase">{titulo}</div>
                    <div className="fs-3 fw-bold">{valor}</div>
                    {detalle && <div className="small">{detalle}</div>}
                </div>
                {icono && <i className={`bi ${icono} fs-1 opacity-75`} />}
            </div>
        </div>
    );
}
