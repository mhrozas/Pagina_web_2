import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { abrirBaseDeDatos, reiniciar } from '../src/db.js';
import { crearApp } from '../src/app.js';

let db;
let servidor;
let base;

before(async () => {
    db = abrirBaseDeDatos(':memory:');
    servidor = crearApp(db).listen(0);
    await new Promise(resolver => servidor.once('listening', resolver));
    base = `http://localhost:${servidor.address().port}/api`;
});

beforeEach(() => reiniciar(db));
after(() => servidor.close());

async function pedir(metodo, ruta, cuerpo) {
    const respuesta = await fetch(base + ruta, {
        method: metodo,
        headers: cuerpo ? { 'Content-Type': 'application/json' } : undefined,
        body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    const texto = await respuesta.text();
    return { estado: respuesta.status, cuerpo: texto ? JSON.parse(texto) : null };
}

const PRODUCTO = {
    codigo: 'TST-001', nombre: 'Producto de prueba', descripcion: 'x', precio: 10000, stock: 5,
    stockCritico: 2, descuento: 0, categoria: 'Blusas', atributos: 'Blusas', imagen: '/img/a.png', galeria: []
};

test('los datos iniciales se cargan al abrir la base', async () => {
    const productos = await pedir('GET', '/productos');
    const usuarios = await pedir('GET', '/usuarios');
    assert.equal(productos.cuerpo.length, 8);
    assert.equal(usuarios.cuerpo.length, 3);
    assert.equal(productos.cuerpo[0].codigo, 'VES-001');
    assert.ok(Array.isArray(productos.cuerpo[0].galeria));
});

test('las órdenes iniciales conservan su orden y las nuevas quedan primero', async () => {
    const inicial = await pedir('GET', '/ordenes');
    assert.deepEqual(inicial.cuerpo.map(o => o.numero), ['ORD-1001', 'ORD-1002', 'ORD-1003', 'ORD-1004']);

    await pedir('POST', '/ordenes', {
        numero: 'CH-NUEVA', cliente: 'Ana', correo: 'ana@x.cl', fecha: '2026-10-29', productos: 1,
        total: 5000, estado: 'Pendiente de despacho', items: [{ codigo: 'VES-001', cantidad: 1 }],
        datosEntrega: { calle: 'Calle 1' }
    });
    const despues = await pedir('GET', '/ordenes');
    assert.equal(despues.cuerpo[0].numero, 'CH-NUEVA');
    assert.deepEqual(despues.cuerpo[0].items, [{ codigo: 'VES-001', cantidad: 1 }]);
    assert.equal(despues.cuerpo[0].datosEntrega.calle, 'Calle 1');
});

test('crear, leer, actualizar y eliminar un producto', async () => {
    const creado = await pedir('POST', '/productos', PRODUCTO);
    assert.equal(creado.estado, 201);

    const leido = await pedir('GET', '/productos/TST-001');
    assert.equal(leido.cuerpo.stockCritico, 2);

    const editado = await pedir('PUT', '/productos/TST-001', { precio: 15000 });
    assert.equal(editado.cuerpo.precio, 15000);
    assert.equal(editado.cuerpo.nombre, 'Producto de prueba');

    assert.equal((await pedir('DELETE', '/productos/TST-001')).estado, 204);
    assert.equal((await pedir('GET', '/productos/TST-001')).estado, 404);
});

test('no permite repetir el código de un producto', async () => {
    await pedir('POST', '/productos', PRODUCTO);
    const repetido = await pedir('POST', '/productos', PRODUCTO);
    assert.equal(repetido.estado, 409);
    assert.match(repetido.cuerpo.mensaje, /Ya existe/);
});

test('no permite repetir el correo de un usuario, sin distinguir mayúsculas', async () => {
    const respuesta = await pedir('POST', '/usuarios', {
        run: '999999999', nombre: 'Otra', apellidos: 'Persona', correo: 'CLIENTE@gmail.com', tipoUsuario: 'Cliente'
    });
    assert.equal(respuesta.estado, 409);
    assert.equal(respuesta.cuerpo.campo, 'correo');
});

test('no deja crear un producto con una categoría inexistente', async () => {
    const respuesta = await pedir('POST', '/productos', { ...PRODUCTO, categoria: 'Inexistente' });
    assert.equal(respuesta.estado, 409);
});

test('no deja eliminar una categoría que tiene productos', async () => {
    const respuesta = await pedir('DELETE', '/categorias/Vestidos');
    assert.equal(respuesta.estado, 409);
    assert.equal((await pedir('GET', '/categorias')).cuerpo.length, 4);
});

test('descontar stock resta las unidades y nunca baja de cero', async () => {
    const antes = (await pedir('GET', '/productos/CON-005')).cuerpo.stock;
    await pedir('POST', '/productos/descontar-stock', {
        items: [{ codigo: 'VES-001', cantidad: 2 }, { codigo: 'CON-005', cantidad: antes + 10 }]
    });
    assert.equal((await pedir('GET', '/productos/VES-001')).cuerpo.stock, 10);
    assert.equal((await pedir('GET', '/productos/CON-005')).cuerpo.stock, 0);
});

test('responde 404 con una colección desconocida y 400 con JSON inválido', async () => {
    assert.equal((await pedir('GET', '/inexistente')).estado, 404);
    const respuesta = await fetch(base + '/productos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{roto'
    });
    assert.equal(respuesta.status, 400);
});

test('reiniciar restaura los datos iniciales', async () => {
    await pedir('DELETE', '/usuarios/333333333');
    assert.equal((await pedir('GET', '/usuarios')).cuerpo.length, 2);
    await pedir('POST', '/reiniciar');
    assert.equal((await pedir('GET', '/usuarios')).cuerpo.length, 3);
});
