/**
 * Continúa con el resultado de una operación que puede ser inmediata (modo local)
 * o una promesa (modo API). En modo local no se introduce ninguna espera.
 */
export function alResolver(valor, continuar) {
    return valor && typeof valor.then === 'function' ? valor.then(continuar) : continuar(valor);
}
