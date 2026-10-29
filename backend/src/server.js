import { fileURLToPath } from 'node:url';
import { abrirBaseDeDatos } from './db.js';
import { crearApp } from './app.js';

const PUERTO = Number(process.env.PORT) || 3001;
const RUTA_BD = process.env.DB_PATH || fileURLToPath(new URL('../data/chstore.db', import.meta.url));

const db = abrirBaseDeDatos(RUTA_BD);
crearApp(db).listen(PUERTO, () => {
    console.log(`API de Ch.Store lista en http://localhost:${PUERTO}/api (base de datos: ${RUTA_BD})`);
});
