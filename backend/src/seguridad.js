/* ============================================================
   SEGURIDAD
   Contraseñas con scrypt (con sal propia por usuario), tokens de
   sesión aleatorios que en la base se guardan solo como hash, y un
   límite de intentos fallidos de inicio de sesión.
   ============================================================ */

import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const LARGO_CLAVE = 64;
const SAL_FALSA = randomBytes(16);

export function hashPassword(password) {
    const sal = randomBytes(16);
    const hash = scryptSync(password, sal, LARGO_CLAVE);
    return `scrypt$${sal.toString('base64')}$${hash.toString('base64')}`;
}

/** Compara en tiempo constante; con un usuario inexistente igual gasta el mismo tiempo. */
export function verificarPassword(password, guardado) {
    const partes = typeof guardado === 'string' ? guardado.split('$') : [];
    if (partes.length !== 3 || partes[0] !== 'scrypt') {
        scryptSync(password, SAL_FALSA, LARGO_CLAVE);
        return false;
    }
    const esperado = Buffer.from(partes[2], 'base64');
    const calculado = scryptSync(password, Buffer.from(partes[1], 'base64'), LARGO_CLAVE);
    return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

export function generarToken() {
    return randomBytes(32).toString('base64url');
}

export function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}

/** Bloquea una clave (correo + IP) tras varios fallos seguidos durante un tiempo. */
export function crearLimitador({ maxIntentos = 5, bloqueoMs = 15 * 60 * 1000, ahora = Date.now } = {}) {
    const fallos = new Map();

    return {
        /** Milisegundos que faltan para poder reintentar (0 si no está bloqueado). */
        bloqueadoPor(clave) {
            const registro = fallos.get(clave);
            if (!registro || registro.hasta === 0) return 0;
            const falta = registro.hasta - ahora();
            if (falta <= 0) {
                fallos.delete(clave);
                return 0;
            }
            return falta;
        },
        registrarFallo(clave) {
            const registro = fallos.get(clave) || { intentos: 0, hasta: 0 };
            registro.intentos += 1;
            if (registro.intentos >= maxIntentos) registro.hasta = ahora() + bloqueoMs;
            fallos.set(clave, registro);
        },
        limpiar(clave) {
            fallos.delete(clave);
        },
        reiniciar() {
            fallos.clear();
        }
    };
}
