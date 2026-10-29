import { createContext, useContext, useEffect, useState } from 'react';
import { obtener } from '../data/db';
import {
    agregarItem, cambiarCantidadItem, eliminarItem, calcularTotales,
    validarCupon, unidadesTotales
} from '../utils/carrito';

const CLAVE_CARRITO = 'chstore_carrito';
const CLAVE_CUPON = 'chstore_cupon';

const CarritoContext = createContext(null);

function leerCarrito() {
    try {
        const carrito = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
        return Array.isArray(carrito) ? carrito : [];
    } catch {
        return [];
    }
}

export function CarritoProvider({ children }) {
    const [carrito, setCarrito] = useState(leerCarrito);
    const [cupon, setCupon] = useState(() => localStorage.getItem(CLAVE_CUPON));

    /* El carrito sobrevive al cierre del navegador (R6) */
    useEffect(() => {
        localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
    }, [carrito]);

    useEffect(() => {
        if (cupon) localStorage.setItem(CLAVE_CUPON, cupon);
        else localStorage.removeItem(CLAVE_CUPON);
    }, [cupon]);

    const agregar = (codigo, cantidad, talla) => {
        const resultado = agregarItem(carrito, obtener('productos', codigo), cantidad, talla);
        setCarrito(resultado.carrito);
        return resultado;
    };

    const cambiarCantidad = (clave, cambio) => {
        const codigo = clave.split('|')[0];
        const producto = obtener('productos', codigo);
        setCarrito(cambiarCantidadItem(carrito, clave, cambio, producto ? producto.stock : undefined));
    };

    const eliminar = clave => setCarrito(eliminarItem(carrito, clave));

    const vaciar = () => {
        setCarrito([]);
        setCupon(null);
    };

    const aplicarCupon = codigo => {
        const resultado = validarCupon(codigo, carrito);
        if (resultado.exito) setCupon(resultado.cupon);
        return resultado;
    };

    const valor = {
        carrito,
        cupon,
        totales: calcularTotales(carrito, cupon),
        unidades: unidadesTotales(carrito),
        agregar,
        cambiarCantidad,
        eliminar,
        vaciar,
        aplicarCupon
    };

    return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

export function useCarrito() {
    return useContext(CarritoContext);
}
