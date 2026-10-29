import express from 'express';
import {
    NOMBRES_COLECCIONES, ErrorDeNegocio, listar, obtener, crear, actualizar, eliminar, descontarStock
} from './repositorio.js';
import { reiniciar } from './db.js';

/** Arma la API REST sobre una base ya abierta (así las pruebas usan una en memoria). */
export function crearApp(db) {
    const app = express();
    app.use(express.json({ limit: '1mb' }));

    const api = express.Router();

    api.get('/salud', (req, res) => res.json({ estado: 'ok' }));

    api.post('/reiniciar', (req, res) => {
        reiniciar(db);
        res.json({ exito: true, mensaje: 'Datos restaurados.' });
    });

    api.post('/productos/descontar-stock', (req, res) => {
        if (!Array.isArray(req.body.items)) throw new ErrorDeNegocio('Se esperaba una lista de items.');
        descontarStock(db, req.body.items);
        res.json({ exito: true });
    });

    api.param('coleccion', (req, res, siguiente, coleccion) => {
        if (!NOMBRES_COLECCIONES.includes(coleccion)) {
            return res.status(404).json({ exito: false, mensaje: `La colección "${coleccion}" no existe.` });
        }
        siguiente();
    });

    api.get('/:coleccion', (req, res) => res.json(listar(db, req.params.coleccion)));

    api.get('/:coleccion/:id', (req, res) => {
        const registro = obtener(db, req.params.coleccion, req.params.id);
        if (!registro) throw new ErrorDeNegocio('El registro no existe.', 404);
        res.json(registro);
    });

    api.post('/:coleccion', (req, res) => {
        res.status(201).json(crear(db, req.params.coleccion, req.body));
    });

    api.put('/:coleccion/:id', (req, res) => {
        res.json(actualizar(db, req.params.coleccion, req.params.id, req.body));
    });

    api.delete('/:coleccion/:id', (req, res) => {
        eliminar(db, req.params.coleccion, req.params.id);
        res.status(204).end();
    });

    app.use('/api', api);

    app.use((error, req, res, siguiente) => {
        if (error instanceof ErrorDeNegocio) {
            return res.status(error.estado).json({ exito: false, mensaje: error.message, campo: error.campo });
        }
        if (error.type === 'entity.parse.failed') {
            return res.status(400).json({ exito: false, mensaje: 'El cuerpo no es un JSON válido.' });
        }
        console.error(error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor.' });
    });

    return app;
}
