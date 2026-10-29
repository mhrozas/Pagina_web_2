import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { abrirBaseDeDatos, reiniciar } from '../src/db.js';
import { crearApp } from '../src/app.js';
import { crearLimitador } from '../src/seguridad.js';

const PASSWORD_DEMO = 'demo1234';

let db;
let servidor;
let base;
let limitador;
let reloj = 0;
const tokens = {};

before(async () => {
    db = abrirBaseDeDatos(':memory:');
    limitador = crearLimitador({ ahora: () => reloj });
    servidor = crearApp(db, { limitador }).listen(0);
    await new Promise(resolver => servidor.once('listening', resolver));
    base = `http://localhost:${servidor.address().port}/api`;
});

beforeEach(async () => {
    reiniciar(db);
    limitador.reiniciar();
    reloj = 0;
    for (const [perfil, correo] of Object.entries({
        admin: 'admin@duoc.cl', vendedor: 'vendedor@duoc.cl', cliente: 'cliente@gmail.com'
    })) {
        tokens[perfil] = (await pedir('POST', '/auth/login', { correo, password: PASSWORD_DEMO })).cuerpo.token;
    }
});

after(() => servidor.close());

async function pedir(metodo, ruta, cuerpo, token) {
    const encabezados = {};
    if (cuerpo) encabezados['Content-Type'] = 'application/json';
    if (token) encabezados.Authorization = `Bearer ${token}`;
    const respuesta = await fetch(base + ruta, {
        method: metodo, headers: encabezados, body: cuerpo ? JSON.stringify(cuerpo) : undefined
    });
    const texto = await respuesta.text();
    return { estado: respuesta.status, cuerpo: texto ? JSON.parse(texto) : null, encabezados: respuesta.headers };
}

const PRODUCTO = {
    codigo: 'TST-001', nombre: 'Producto de prueba', descripcion: 'x', precio: 10000, stock: 5,
    stockCritico: 2, descuento: 0, categoria: 'Blusas', atributos: 'Blusas', imagen: '/img/a.png', galeria: []
};

const ORDEN = {
    numero: 'CH-NUEVA', cliente: 'Ana', correo: 'ana@x.cl', fecha: '2026-10-29', productos: 2, total: 40000,
    estado: 'Pendiente de despacho', items: [{ codigo: 'VES-001', cantidad: 2 }], datosEntrega: { calle: 'Calle 1' }
};

const USUARIO = {
    run: '999999999', nombre: 'Otra', apellidos: 'Persona', correo: 'otra@x.cl', tipoUsuario: 'Vendedor',
    region: 'RM', comuna: 'Santiago', direccion: 'Calle 9', password: 'clave1'
};

/* ---------- Datos y CRUD (con sesión de administrador) ---------- */

test('los datos iniciales se cargan al abrir la base', async () => {
    const productos = await pedir('GET', '/productos');
    const usuarios = await pedir('GET', '/usuarios', null, tokens.admin);
    assert.equal(productos.cuerpo.length, 8);
    assert.equal(usuarios.cuerpo.length, 3);
    assert.equal(productos.cuerpo[0].codigo, 'VES-001');
    assert.ok(Array.isArray(productos.cuerpo[0].galeria));
});

test('las órdenes iniciales conservan su orden y las nuevas quedan primero', async () => {
    const inicial = await pedir('GET', '/ordenes', null, tokens.admin);
    assert.deepEqual(inicial.cuerpo.map(o => o.numero), ['ORD-1001', 'ORD-1002', 'ORD-1003', 'ORD-1004']);

    await pedir('POST', '/ordenes', ORDEN);
    const despues = await pedir('GET', '/ordenes', null, tokens.admin);
    assert.equal(despues.cuerpo[0].numero, 'CH-NUEVA');
    assert.deepEqual(despues.cuerpo[0].items, ORDEN.items);
    assert.equal(despues.cuerpo[0].datosEntrega.calle, 'Calle 1');
});

test('crear, leer, actualizar y eliminar un producto', async () => {
    const t = tokens.admin;
    assert.equal((await pedir('POST', '/productos', PRODUCTO, t)).estado, 201);
    assert.equal((await pedir('GET', '/productos/TST-001')).cuerpo.stockCritico, 2);

    const editado = await pedir('PUT', '/productos/TST-001', { precio: 15000 }, t);
    assert.equal(editado.cuerpo.precio, 15000);
    assert.equal(editado.cuerpo.nombre, 'Producto de prueba');

    assert.equal((await pedir('DELETE', '/productos/TST-001', null, t)).estado, 204);
    assert.equal((await pedir('GET', '/productos/TST-001')).estado, 404);
});

test('crear, editar y eliminar una categoría', async () => {
    const t = tokens.admin;
    assert.equal((await pedir('POST', '/categorias', { nombre: 'Abrigos', descripcion: 'Invierno' }, t)).estado, 201);
    assert.equal((await pedir('PUT', '/categorias/Abrigos', { descripcion: 'Frío' }, t)).cuerpo.descripcion, 'Frío');
    assert.equal((await pedir('DELETE', '/categorias/Abrigos', null, t)).estado, 204);
});

test('no permite repetir el código de un producto', async () => {
    await pedir('POST', '/productos', PRODUCTO, tokens.admin);
    const repetido = await pedir('POST', '/productos', PRODUCTO, tokens.admin);
    assert.equal(repetido.estado, 409);
    assert.match(repetido.cuerpo.mensaje, /Ya existe/);
});

test('no permite repetir el correo de un usuario, sin distinguir mayúsculas', async () => {
    const respuesta = await pedir('POST', '/usuarios', { ...USUARIO, correo: 'CLIENTE@gmail.com' }, tokens.admin);
    assert.equal(respuesta.estado, 409);
    assert.equal(respuesta.cuerpo.campo, 'correo');
});

test('no deja crear un producto con una categoría inexistente', async () => {
    const respuesta = await pedir('POST', '/productos', { ...PRODUCTO, categoria: 'Inexistente' }, tokens.admin);
    assert.equal(respuesta.estado, 409);
});

test('no deja eliminar una categoría que tiene productos', async () => {
    const respuesta = await pedir('DELETE', '/categorias/Vestidos', null, tokens.admin);
    assert.equal(respuesta.estado, 409);
    assert.equal((await pedir('GET', '/categorias')).cuerpo.length, 4);
});

test('una orden aprobada descuenta el stock y una rechazada no', async () => {
    await pedir('POST', '/ordenes', ORDEN);
    assert.equal((await pedir('GET', '/productos/VES-001')).cuerpo.stock, 10);

    await pedir('POST', '/ordenes', { ...ORDEN, numero: 'CH-RECHAZADA', estado: 'Pago rechazado' });
    assert.equal((await pedir('GET', '/productos/VES-001')).cuerpo.stock, 10);
});

test('el stock nunca baja de cero al vender más de lo disponible', async () => {
    await pedir('POST', '/ordenes', { ...ORDEN, items: [{ codigo: 'CON-005', cantidad: 99 }] });
    assert.equal((await pedir('GET', '/productos/CON-005')).cuerpo.stock, 0);
});

test('responde 404 con una colección desconocida y 400 con JSON inválido', async () => {
    assert.equal((await pedir('GET', '/inexistente')).estado, 404);
    const respuesta = await fetch(base + '/productos', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.admin}` }, body: '{roto'
    });
    assert.equal(respuesta.status, 400);
});

test('reiniciar restaura los datos iniciales', async () => {
    await pedir('DELETE', '/usuarios/333333333', null, tokens.admin);
    assert.equal((await pedir('GET', '/usuarios', null, tokens.admin)).cuerpo.length, 2);
    await pedir('POST', '/reiniciar', null, tokens.admin);
    assert.equal(db.prepare('SELECT COUNT(*) AS n FROM usuarios').get().n, 3);
});

/* ---------- Inicio de sesión ---------- */

test('el login entrega un token y los datos del usuario sin la contraseña', async () => {
    const r = await pedir('POST', '/auth/login', { correo: 'ADMIN@duoc.cl', password: PASSWORD_DEMO });
    assert.equal(r.estado, 200);
    assert.equal(r.cuerpo.usuario.tipoUsuario, 'Administrador');
    assert.ok(r.cuerpo.token.length >= 40);
    assert.equal(JSON.stringify(r.cuerpo).includes('password'), false);
    assert.equal(JSON.stringify(r.cuerpo).includes('scrypt'), false);
});

test('rechaza contraseña incorrecta y usuario inexistente con el mismo mensaje', async () => {
    const mala = await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl', password: 'otra-cosa' });
    const inexistente = await pedir('POST', '/auth/login', { correo: 'nadie@x.cl', password: 'otra-cosa' });
    assert.equal(mala.estado, 401);
    assert.equal(inexistente.estado, 401);
    assert.equal(mala.cuerpo.mensaje, inexistente.cuerpo.mensaje);
});

test('el login exige correo y contraseña de tipo texto', async () => {
    assert.equal((await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl' })).estado, 400);
    assert.equal((await pedir('POST', '/auth/login', { correo: { $ne: '' }, password: { $ne: '' } })).estado, 400);
});

test('bloquea el login tras 5 fallos seguidos y se libera con el tiempo', async () => {
    for (let i = 0; i < 5; i++) {
        assert.equal((await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl', password: 'mala' })).estado, 401);
    }
    const bloqueado = await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl', password: PASSWORD_DEMO });
    assert.equal(bloqueado.estado, 429);
    assert.ok(Number(bloqueado.encabezados.get('retry-after')) > 0);

    reloj += 16 * 60 * 1000;
    assert.equal((await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl', password: PASSWORD_DEMO })).estado, 200);
});

test('un login correcto reinicia el contador de fallos', async () => {
    for (let i = 0; i < 4; i++) await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl', password: 'mala' });
    assert.equal((await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl', password: PASSWORD_DEMO })).estado, 200);
    for (let i = 0; i < 4; i++) {
        assert.equal((await pedir('POST', '/auth/login', { correo: 'admin@duoc.cl', password: 'mala' })).estado, 401);
    }
});

test('las contraseñas y los tokens no quedan en claro en la base', async () => {
    const hashes = db.prepare('SELECT password_hash FROM usuarios').all().map(f => f.password_hash);
    assert.ok(hashes.every(h => h.startsWith('scrypt$') && !h.includes(PASSWORD_DEMO)));
    const guardados = db.prepare('SELECT token_hash FROM sesiones').all().map(f => f.token_hash);
    assert.ok(guardados.length >= 3);
    assert.ok(Object.values(tokens).every(token => !guardados.includes(token)));
});

test('GET /auth/yo devuelve al usuario de la sesión y exige token', async () => {
    assert.equal((await pedir('GET', '/auth/yo', null, tokens.vendedor)).cuerpo.usuario.correo, 'vendedor@duoc.cl');
    assert.equal((await pedir('GET', '/auth/yo')).estado, 401);
    assert.equal((await pedir('GET', '/auth/yo', null, 'token-inventado')).estado, 401);
});

test('cerrar sesión invalida el token', async () => {
    assert.equal((await pedir('POST', '/auth/logout', null, tokens.cliente)).estado, 204);
    assert.equal((await pedir('GET', '/auth/yo', null, tokens.cliente)).estado, 401);
});

test('un token vencido deja de servir', async () => {
    db.prepare('UPDATE sesiones SET expira = 1').run();
    assert.equal((await pedir('GET', '/usuarios', null, tokens.admin)).estado, 401);
});

/* ---------- Registro ---------- */

test('el registro crea un cliente que luego puede iniciar sesión', async () => {
    const registro = await pedir('POST', '/auth/registro', { ...USUARIO, tipoUsuario: 'Administrador' });
    assert.equal(registro.estado, 201);
    assert.equal(registro.cuerpo.usuario.tipoUsuario, 'Cliente', 'no se puede elegir el perfil al registrarse');
    assert.equal(JSON.stringify(registro.cuerpo).includes('clave1'), false);

    const login = await pedir('POST', '/auth/login', { correo: 'otra@x.cl', password: 'clave1' });
    assert.equal(login.estado, 200);
});

test('el registro valida la contraseña y no repite RUN ni correo', async () => {
    assert.equal((await pedir('POST', '/auth/registro', { ...USUARIO, password: '123' })).estado, 400);
    assert.equal((await pedir('POST', '/auth/registro', { ...USUARIO, password: undefined })).estado, 400);
    assert.equal((await pedir('POST', '/auth/registro', { ...USUARIO, run: '333333333' })).estado, 409);
    assert.equal((await pedir('POST', '/auth/registro', { ...USUARIO, correo: 'admin@duoc.cl' })).estado, 409);
});

/* ---------- Permisos por perfil ---------- */

test('sin sesión no se puede modificar el catálogo ni leer datos privados', async () => {
    assert.equal((await pedir('POST', '/productos', PRODUCTO)).estado, 401);
    assert.equal((await pedir('PUT', '/productos/VES-001', { precio: 1 })).estado, 401);
    assert.equal((await pedir('DELETE', '/productos/VES-001')).estado, 401);
    assert.equal((await pedir('GET', '/usuarios')).estado, 401);
    assert.equal((await pedir('GET', '/ordenes')).estado, 401);
    assert.equal((await pedir('POST', '/reiniciar')).estado, 401);
});

test('el catálogo es público para leer', async () => {
    assert.equal((await pedir('GET', '/productos')).estado, 200);
    assert.equal((await pedir('GET', '/categorias')).estado, 200);
});

test('el vendedor consulta productos y órdenes, y cambia el estado de una orden, pero no edita el catálogo', async () => {
    const t = tokens.vendedor;
    assert.equal((await pedir('GET', '/ordenes', null, t)).estado, 200);
    assert.equal((await pedir('PUT', '/ordenes/ORD-1002', { estado: 'Despachada' }, t)).cuerpo.estado, 'Despachada');
    assert.equal((await pedir('POST', '/productos', PRODUCTO, t)).estado, 403);
    assert.equal((await pedir('PUT', '/productos/VES-001', { precio: 1 }, t)).estado, 403);
    assert.equal((await pedir('POST', '/categorias', { nombre: 'X' }, t)).estado, 403);
    assert.equal((await pedir('GET', '/usuarios', null, t)).estado, 403);
    assert.equal((await pedir('DELETE', '/ordenes/ORD-1002', null, t)).estado, 403);
});

test('el cliente no accede al panel ni a datos de otros', async () => {
    const t = tokens.cliente;
    assert.equal((await pedir('GET', '/ordenes', null, t)).estado, 403);
    assert.equal((await pedir('GET', '/usuarios', null, t)).estado, 403);
    assert.equal((await pedir('POST', '/productos', PRODUCTO, t)).estado, 403);
    assert.equal((await pedir('GET', '/usuarios/111111111', null, t)).estado, 403);
    assert.equal((await pedir('PUT', '/usuarios/111111111', { nombre: 'Hackeado' }, t)).estado, 403);
    assert.equal((await pedir('POST', '/reiniciar', null, t)).estado, 403);
});

test('cualquiera puede comprar, pero un cliente no puede fijar un estado arbitrario', async () => {
    assert.equal((await pedir('POST', '/ordenes', ORDEN)).estado, 201);
    const falsa = await pedir('POST', '/ordenes', { ...ORDEN, numero: 'CH-FALSA', estado: 'Entregada' }, tokens.cliente);
    assert.equal(falsa.estado, 400);
});

test('el administrador crea usuarios con contraseña propia y puede cambiársela', async () => {
    const t = tokens.admin;
    assert.equal((await pedir('POST', '/usuarios', USUARIO, t)).estado, 201);
    assert.equal((await pedir('POST', '/usuarios', { ...USUARIO, run: '888888888', correo: 'b@x.cl', password: undefined }, t)).estado, 400);
    assert.equal((await pedir('POST', '/auth/login', { correo: 'otra@x.cl', password: 'clave1' })).estado, 200);

    assert.equal((await pedir('PUT', '/usuarios/999999999', { password: 'nueva22' }, t)).estado, 200);
    assert.equal((await pedir('POST', '/auth/login', { correo: 'otra@x.cl', password: 'clave1' })).estado, 401);
    assert.equal((await pedir('POST', '/auth/login', { correo: 'otra@x.cl', password: 'nueva22' })).estado, 200);
});

test('cada usuario edita su perfil pero no su perfil de acceso, correo ni RUN', async () => {
    const t = tokens.vendedor;
    const r = await pedir('PUT', '/usuarios/222222222', {
        nombre: 'Nuevo', direccion: 'Otra calle', tipoUsuario: 'Administrador', correo: 'otro@x.cl', run: '1'
    }, t);
    assert.equal(r.estado, 200);
    assert.equal(r.cuerpo.nombre, 'Nuevo');
    assert.equal(r.cuerpo.tipoUsuario, 'Vendedor');
    assert.equal(r.cuerpo.correo, 'vendedor@duoc.cl');
    assert.equal(r.cuerpo.run, '222222222');
    assert.equal((await pedir('GET', '/usuarios', null, t)).estado, 403, 'sigue sin ser administrador');
});

test('un usuario no puede cambiarse la contraseña por la vía de editar perfil', async () => {
    await pedir('PUT', '/usuarios/333333333', { password: 'robada1' }, tokens.cliente);
    assert.equal((await pedir('POST', '/auth/login', { correo: 'cliente@gmail.com', password: 'robada1' })).estado, 401);
    assert.equal((await pedir('POST', '/auth/login', { correo: 'cliente@gmail.com', password: PASSWORD_DEMO })).estado, 200);
});

test('el administrador no puede eliminar su propia cuenta', async () => {
    assert.equal((await pedir('DELETE', '/usuarios/111111111', null, tokens.admin)).estado, 409);
});

test('eliminar un usuario cierra sus sesiones', async () => {
    await pedir('DELETE', '/usuarios/333333333', null, tokens.admin);
    assert.equal((await pedir('GET', '/auth/yo', null, tokens.cliente)).estado, 401);
});
