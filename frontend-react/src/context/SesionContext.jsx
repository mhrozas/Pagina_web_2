import { createContext, useContext, useState } from 'react';
import { buscarUsuarioPorCorreo } from '../data/db';

const CLAVE_SESION = 'chstore_sesion';
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

    /** La sesión es simulada: se identifica al usuario por su correo. */
    const iniciarSesion = correo => {
        const usuario = buscarUsuarioPorCorreo(correo);
        if (!usuario) return { exito: false, mensaje: 'No existe una cuenta con ese correo.' };

        const nueva = {
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            correo: usuario.correo,
            tipoUsuario: usuario.tipoUsuario
        };
        localStorage.setItem(CLAVE_SESION, JSON.stringify(nueva));
        setSesion(nueva);
        return { exito: true, sesion: nueva };
    };

    const cerrarSesion = () => {
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
