import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { SesionProvider } from '../context/SesionContext';
import { CarritoProvider } from '../context/CarritoContext';

/* Le indica a React que corre dentro de un entorno de pruebas (habilita act) */
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

/**
 * Monta un elemento de React en el DOM real del navegador de pruebas.
 * Devuelve el contenedor y una función para desmontarlo.
 */
export function montar(elemento, { ruta = '/', conProviders = false } = {}) {
    const contenedor = document.createElement('div');
    document.body.appendChild(contenedor);
    const raiz = createRoot(contenedor);

    const envuelto = (
        <MemoryRouter initialEntries={[ruta]}>
            {conProviders ? <SesionProvider><CarritoProvider>{elemento}</CarritoProvider></SesionProvider> : elemento}
        </MemoryRouter>
    );

    act(() => raiz.render(envuelto));

    return {
        contenedor,
        desmontar: () => {
            act(() => raiz.unmount());
            contenedor.remove();
        }
    };
}

/** Simula un clic de usuario. */
export function clic(elemento) {
    act(() => elemento.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

/** Simula que el usuario escribe en un input (compatible con inputs controlados de React). */
export function escribir(input, valor) {
    const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    act(() => {
        setter.call(input, valor);
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
}

/** Simula un cambio de opción en un select. */
export function elegir(select, valor) {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    act(() => {
        setter.call(select, valor);
        select.dispatchEvent(new Event('change', { bubbles: true }));
    });
}

/** Simula el envío de un formulario. */
export function enviar(formulario) {
    act(() => formulario.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
}
