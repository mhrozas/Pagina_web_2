import { Navigate, useLocation } from 'react-router-dom';
import { useSesion, puedeEntrarAlPanel } from '../context/SesionContext';
import { puedeVer } from '../utils/admin';

/**
 * Protege las rutas del panel: sin sesión de Administrador o Vendedor vuelve al login,
 * y una sección no permitida para el rol vuelve al tablero.
 */
export default function RutaAdmin({ seccion, children }) {
    const { sesion } = useSesion();
    const { pathname } = useLocation();

    if (!puedeEntrarAlPanel(sesion)) return <Navigate to="/login?acceso=panel" replace state={{ desde: pathname }} />;
    if (seccion && !puedeVer(sesion.tipoUsuario, seccion)) return <Navigate to="/admin" replace />;
    return children;
}
