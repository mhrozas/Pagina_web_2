import { useEffect, useState } from 'react';
import { listar, suscribir } from '../data/db';

/**
 * Entrega una colección de la base simulada y se actualiza sola
 * cuando cualquier componente la modifica.
 * @param {string} nombre productos | categorias | usuarios | ordenes
 */
export default function useColeccion(nombre) {
    const [datos, setDatos] = useState(() => listar(nombre));

    useEffect(() => {
        setDatos(listar(nombre));
        return suscribir(() => setDatos(listar(nombre)));
    }, [nombre]);

    return datos;
}
