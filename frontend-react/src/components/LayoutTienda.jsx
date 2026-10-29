import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Estructura común de la tienda pública: encabezado, contenido de la ruta y pie.
 */
export default function LayoutTienda() {
    const { pathname } = useLocation();

    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

    return (
        <>
            <Navbar />
            <main className="container py-4"><Outlet /></main>
            <Footer />
        </>
    );
}
