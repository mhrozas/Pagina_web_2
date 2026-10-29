import { generarToken, hashToken } from './seguridad.js';
import { obtener } from './repositorio.js';

export const DURACION_SESION_MS = 8 * 60 * 60 * 1000;

/** Abre una sesión y devuelve el token (solo se entrega una vez; la base guarda su hash). */
export function crearSesion(db, run, ahora = Date.now()) {
    db.prepare('DELETE FROM sesiones WHERE expira < ?').run(ahora);
    const token = generarToken();
    db.prepare('INSERT INTO sesiones (token_hash, run, expira) VALUES (?, ?, ?)')
        .run(hashToken(token), run, ahora + DURACION_SESION_MS);
    return token;
}

/** Devuelve el usuario dueño del token, o undefined si no existe o expiró. */
export function usuarioDeToken(db, token, ahora = Date.now()) {
    if (!token) return undefined;
    const sesion = db.prepare('SELECT run FROM sesiones WHERE token_hash = ? AND expira > ?')
        .get(hashToken(token), ahora);
    return sesion ? obtener(db, 'usuarios', sesion.run) : undefined;
}

export function cerrarSesion(db, token) {
    db.prepare('DELETE FROM sesiones WHERE token_hash = ?').run(hashToken(token));
}
