import { createContext, useContext, useEffect, useState } from 'react';
import {
    buscarUsuarioPorCorreo, cerrarSesionApi, iniciarSesionApi, suscribirExpiracion, usandoApi
} from '../data/db';

export const CLAVE_SESION = 'chstore_sesion';
const PERFILES_PANEL = ['Administrador', 'Vendedor'];

const SesionContext = createContext(null);

function leerSesion() {
    try {
        const sesion = JSON.parse(localStorage.getItem(CLAVE_SESION));
        return sesion && sesion.correo && sesion.tipoUsuario ? sesion : null;
    } catch {
        return null;
    }
}

export function puedeEntrarAlPanel(sesion) {
    return Boolean(sesion) && PERFILES_PANEL.includes(sesion.tipoUsuario);
}

export function SesionProvider({ children }) {
    const [sesion, setSesion] = useState(leerSesion);

    // Si el servidor da por vencida la sesión, se cierra también en pantalla
    useEffect(() => suscribirExpiracion(() => {
        localStorage.removeItem(CLAVE_SESION);
        setSesion(null);
    }), []);

    const abrir = usuario => {
        const nueva = {
            run: usuario.run,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            tipoUsuario: usuario.tipoUsuario
        };
        localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
        setSesion(nueva);
        return { exito: true, sesion: nueva };
    };

    /**
     * Con el backend valida correo y contraseña en el servidor (devuelve una promesa).
     * Sin backend la sesión es simulada: se identifica al usuario por su correo.
     */
    const iniciarSesion = (correo, password) => {
        if (usandoApi()) {
            return iniciarSesionApi(correo, password).then(
                resultado => (resultado.exito ? abrir(resultado.usuario) : resultado)
            );
        }
        const usuario = buscarUsuarioPorCorreo(correo);
        if (!usuario) return { exito: false, mensaje: 'No existe una cuenta con ese correo.' };
        return abrir(usuario);
    };

    const cerrarSesion = () => {
        if (usandoApi()) cerrarSesionApi();
        localStorage.removeItem(CLAVE_SESION);
        setSesion(null);
    };

    return (
        <SesionContext.Provider value={{ sesion, iniciarSesion, cerrarSesion }}>
            {children}
        </SesionContext.Provider>
    );
}

export function useSesion() {
    return useContext(SesionContext);
}
