import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './index.css';
import App from './App.jsx';
import { CLAVE_SESION, SesionProvider } from './context/SesionContext.jsx';
import { CarritoProvider } from './context/CarritoContext.jsx';
import { conectarApi, restaurarSesionApi } from './data/db';

/* Con backend los datos se cargan antes de mostrar la tienda; si no responde, se usa localStorage */
async function iniciar() {
    const url = import.meta.env.VITE_API_URL;
    if (url) {
        try {
            await conectarApi(url);
            // Una sesión guardada solo vale si el servidor sigue reconociendo su token
            if (!(await restaurarSesionApi())) localStorage.removeItem(CLAVE_SESION);
        } catch (error) {
            console.warn('Backend no disponible, se usan los datos locales:', error.message);
        }
    }
    montar();
}

function montar() {
    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <BrowserRouter>
                <SesionProvider>
                    <CarritoProvider>
                        <App />
                    </CarritoProvider>
                </SesionProvider>
            </BrowserRouter>
        </StrictMode>
    );
}

iniciar();
