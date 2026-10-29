/* ============================================================
   BASE DE DATOS
   SQLite mediante el módulo nativo node:sqlite: no requiere
   instalar ni levantar un servidor. El archivo se crea solo la
   primera vez y se llena con los datos de seed/datos.json.
   ============================================================ */

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crear, transaccion } from './repositorio.js';

const RUTA_SEMILLA = fileURLToPath(new URL('../seed/datos.json', import.meta.url));

const ESQUEMA = `
CREATE TABLE IF NOT EXISTS categorias (
    nombre      TEXT PRIMARY KEY,
    descripcion TEXT
);

CREATE TABLE IF NOT EXISTS productos (
    codigo        TEXT PRIMARY KEY,
    nombre        TEXT NOT NULL,
    descripcion   TEXT,
    precio        INTEGER NOT NULL DEFAULT 0,
    stock         INTEGER NOT NULL DEFAULT 0,
    stock_critico INTEGER NOT NULL DEFAULT 0,
    descuento     INTEGER NOT NULL DEFAULT 0,
    categoria     TEXT NOT NULL REFERENCES categorias(nombre) ON UPDATE CASCADE ON DELETE RESTRICT,
    atributos     TEXT,
    imagen        TEXT,
    galeria       TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
    run              TEXT PRIMARY KEY,
    nombre           TEXT NOT NULL,
    apellidos        TEXT,
    correo           TEXT NOT NULL COLLATE NOCASE UNIQUE,
    tipo_usuario     TEXT NOT NULL DEFAULT 'Cliente',
    region           TEXT,
    comuna           TEXT,
    direccion        TEXT,
    telefono         TEXT,
    fecha_nacimiento TEXT
);

CREATE TABLE IF NOT EXISTS ordenes (
    numero        TEXT PRIMARY KEY,
    cliente       TEXT,
    correo        TEXT,
    fecha         TEXT NOT NULL,
    productos     INTEGER NOT NULL DEFAULT 0,
    total         INTEGER NOT NULL DEFAULT 0,
    descuento     INTEGER,
    cupon         TEXT,
    estado        TEXT NOT NULL,
    datos_entrega TEXT,
    items         TEXT,
    posicion      INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_ordenes_correo ON ordenes(correo);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
`;

/** Abre (o crea) la base y deja listas las tablas con sus datos iniciales. */
export function abrirBaseDeDatos(ruta) {
    if (ruta !== ':memory:') mkdirSync(dirname(ruta), { recursive: true });

    const db = new DatabaseSync(ruta);
    db.exec('PRAGMA foreign_keys = ON');
    if (ruta !== ':memory:') db.exec('PRAGMA journal_mode = WAL');
    db.exec(ESQUEMA);

    if (db.prepare('SELECT COUNT(*) AS n FROM categorias').get().n === 0) sembrar(db);
    return db;
}

/** Inserta los datos iniciales (catálogo, usuarios demo y órdenes de ejemplo). */
export function sembrar(db) {
    const datos = JSON.parse(readFileSync(RUTA_SEMILLA, 'utf8'));
    transaccion(db, () => {
        ['categorias', 'productos', 'usuarios'].forEach(coleccion => {
            datos[coleccion].forEach(registro => crear(db, coleccion, registro));
        });
        // Las órdenes se insertan al revés: cada nueva queda al principio del listado
        [...datos.ordenes].reverse().forEach(orden => crear(db, 'ordenes', orden));
    });
}

/** Borra todos los datos y vuelve a cargar los iniciales. */
export function reiniciar(db) {
    transaccion(db, () => {
        ['ordenes', 'productos', 'usuarios', 'categorias'].forEach(tabla => db.exec(`DELETE FROM ${tabla}`));
    });
    sembrar(db);
}
