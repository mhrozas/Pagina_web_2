import express from 'express';
import {
    NOMBRES_COLECCIONES, ErrorDeNegocio, ESTADO_APROBADA, ESTADO_RECHAZADA,
    listar, obtener, crear, actualizar, eliminar, crearOrden, fijarPassword, obtenerCredenciales, transaccion
} from './repositorio.js';
import { reiniciar } from './db.js';
import { crearSesion, usuarioDeToken, cerrarSesion } from './sesiones.js';
import { crearLimitador, hashPassword, verificarPassword } from './seguridad.js';

const ADMIN = 'Administrador';
const PERSONAL = [ADMIN, 'Vendedor'];
const CON_SESION = [...PERSONAL, 'Cliente'];
const PUBLICO = null;

/* Quién puede hacer cada operación sobre cada colección (PUBLICO = sin sesión) */
const POLITICA = {
    productos: { leer: PUBLICO, crear: [ADMIN], actualizar: [ADMIN], eliminar: [ADMIN] },
    categorias: { leer: PUBLICO, crear: [ADMIN], actualizar: [ADMIN], eliminar: [ADMIN] },
    usuarios: { leer: [ADMIN], crear: [ADMIN], actualizar: [ADMIN], eliminar: [ADMIN] },
    // Cualquiera puede comprar; solo el personal ve y gestiona las órdenes
    ordenes: { leer: PERSONAL, crear: PUBLICO, actualizar: PERSONAL, eliminar: [ADMIN] }
};

const CAMPOS_SOLO_ADMIN = ['run', 'tipoUsuario', 'correo'];

function validarPassword(password) {
    if (typeof password !== 'string' || password.length < 4 || password.length > 64) {
        throw new ErrorDeNegocio('La contraseña debe tener entre 4 y 64 caracteres.', 400, 'password');
    }
}

/** Arma la API REST sobre una base ya abierta (así las pruebas usan una en memoria). */
export function crearApp(db, { limitador = crearLimitador() } = {}) {
    const app = express();
    app.disable('x-powered-by');
    app.use(express.json({ limit: '1mb' }));

    /* Identifica al usuario por el token Bearer; sin token o con uno inválido sigue como anónimo */
    const identificar = (req, res, siguiente) => {
        const coincidencia = /^Bearer (.+)$/.exec(req.get('authorization') || '');
        req.token = coincidencia ? coincidencia[1] : undefined;
        req.usuario = usuarioDeToken(db, req.token);
        siguiente();
    };

    /** Exige sesión y, si se indican perfiles, que el usuario tenga uno de ellos. */
    const exigir = perfiles => (req, res, siguiente) => {
        if (perfiles === PUBLICO) return siguiente();
        if (!req.usuario) throw new ErrorDeNegocio('Debes iniciar sesión.', 401);
        if (!perfiles.includes(req.usuario.tipoUsuario)) {
            throw new ErrorDeNegocio('No tienes permiso para realizar esta acción.', 403);
        }
        siguiente();
    };

    /** Aplica la política de la colección; cada usuario además puede leer y editar su propia cuenta. */
    const autorizar = accion => (req, res, siguiente) => {
        const { coleccion, id } = req.params;
        const esSuCuenta = coleccion === 'usuarios' && req.usuario && id === req.usuario.run;
        if (esSuCuenta && (accion === 'leer' || accion === 'actualizar')) return siguiente();
        exigir(POLITICA[coleccion][accion])(req, res, siguiente);
    };

    const api = express.Router();
    api.use(identificar);

    api.get('/salud', (req, res) => res.json({ estado: 'ok' }));

    api.post('/reiniciar', exigir([ADMIN]), (req, res) => {
        reiniciar(db);
        limitador.reiniciar();
        res.json({ exito: true, mensaje: 'Datos restaurados.' });
    });

    /* ---------- Autenticación ---------- */

    api.post('/auth/login', (req, res) => {
        const { correo, password } = req.body || {};
        if (typeof correo !== 'string' || typeof password !== 'string' || !correo || !password) {
            throw new ErrorDeNegocio('Ingresa tu correo y tu contraseña.', 400);
        }

        const clave = `${correo.trim().toLowerCase()}|${req.ip}`;
        const espera = limitador.bloqueadoPor(clave);
        if (espera > 0) {
            res.set('Retry-After', String(Math.ceil(espera / 1000)));
            throw new ErrorDeNegocio('Demasiados intentos fallidos. Intenta de nuevo más tarde.', 429);
        }

        const credenciales = obtenerCredenciales(db, correo.trim());
        if (!verificarPassword(password, credenciales?.password_hash)) {
            limitador.registrarFallo(clave);
            throw new ErrorDeNegocio('Correo o contraseña incorrectos.', 401);
        }

        limitador.limpiar(clave);
        res.json({
            token: crearSesion(db, credenciales.run),
            usuario: obtener(db, 'usuarios', credenciales.run)
        });
    });

    api.post('/auth/registro', (req, res) => {
        const { password, ...datos } = req.body || {};
        validarPassword(password);
        const usuario = transaccion(db, () => {
            // Un registro público solo puede crear clientes
            const creado = crear(db, 'usuarios', { ...datos, tipoUsuario: 'Cliente' });
            fijarPassword(db, creado.run, hashPassword(password));
            return creado;
        });
        res.status(201).json({ usuario });
    });

    api.post('/auth/logout', exigir(CON_SESION), (req, res) => {
        cerrarSesion(db, req.token);
        res.status(204).end();
    });

    api.get('/auth/yo', exigir(CON_SESION), (req, res) => res.json({ usuario: req.usuario }));

    /* ---------- Colecciones ---------- */

    api.param('coleccion', (req, res, siguiente, coleccion) => {
        if (!NOMBRES_COLECCIONES.includes(coleccion)) {
            return res.status(404).json({ exito: false, mensaje: `La colección "${coleccion}" no existe.` });
        }
        siguiente();
    });

    api.get('/:coleccion', autorizar('leer'), (req, res) => res.json(listar(db, req.params.coleccion)));

    api.get('/:coleccion/:id', autorizar('leer'), (req, res) => {
        const registro = obtener(db, req.params.coleccion, req.params.id);
        if (!registro) throw new ErrorDeNegocio('El registro no existe.', 404);
        res.json(registro);
    });

    api.post('/:coleccion', autorizar('crear'), (req, res) => {
        const { coleccion } = req.params;
        const { password, ...registro } = req.body || {};

        if (coleccion === 'usuarios') {
            validarPassword(password);
            const creado = transaccion(db, () => {
                const nuevo = crear(db, 'usuarios', registro);
                fijarPassword(db, nuevo.run, hashPassword(password));
                return nuevo;
            });
            return res.status(201).json(creado);
        }

        if (coleccion === 'ordenes') {
            const personal = req.usuario && PERSONAL.includes(req.usuario.tipoUsuario);
            if (!personal && ![ESTADO_APROBADA, ESTADO_RECHAZADA].includes(registro.estado)) {
                throw new ErrorDeNegocio('Estado de orden no permitido.', 400, 'estado');
            }
            return res.status(201).json(crearOrden(db, registro));
        }

        res.status(201).json(crear(db, coleccion, registro));
    });

    api.put('/:coleccion/:id', autorizar('actualizar'), (req, res) => {
        const { coleccion, id } = req.params;
        const { password, ...cambios } = req.body || {};

        if (coleccion !== 'usuarios') return res.json(actualizar(db, coleccion, id, cambios));

        // Quien no es administrador solo edita sus datos personales
        const esAdmin = req.usuario.tipoUsuario === ADMIN;
        if (!esAdmin) CAMPOS_SOLO_ADMIN.forEach(campo => delete cambios[campo]);
        if (esAdmin && password !== undefined) validarPassword(password);

        const actualizado = transaccion(db, () => {
            const resultado = actualizar(db, 'usuarios', id, cambios);
            if (esAdmin && password !== undefined) fijarPassword(db, resultado.run, hashPassword(password));
            return resultado;
        });
        res.json(actualizado);
    });

    api.delete('/:coleccion/:id', autorizar('eliminar'), (req, res) => {
        const { coleccion, id } = req.params;
        if (coleccion === 'usuarios' && req.usuario.run === id) {
            throw new ErrorDeNegocio('No puedes eliminar tu propia cuenta.', 409);
        }
        eliminar(db, coleccion, id);
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
