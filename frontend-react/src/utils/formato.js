/**
 * Formatea un número como precio en pesos chilenos.
 * @param {number} valor
 * @returns {string}
 */
export function formatearPrecio(valor) {
    const numero = Number(valor) || 0;
    return '$ ' + numero.toLocaleString('es-CL');
}
