/* ============================================================
   REPOSITORIO
   Traduce entre los objetos que usa el frontend (camelCase) y
   las filas de SQLite (snake_case). Cada colección declara sus
   campos una sola vez y las cinco operaciones CRUD se comparten.
   ============================================================ */

/* [campo del objeto, columna, ¿se guarda como JSON?] */
const COLECCIONES = {
    categorias: {
        tabla: 'categorias',
        id: 'nombre',
        campos: [['nombre', 'nombre'], ['descripcion', 'descripcion']]
    },
    productos: {
        tabla: 'productos',
        id: 'codigo',
        campos: [
            ['codigo', 'codigo'], ['nombre', 'nombre'], ['descripcion', 'descripcion'],
            ['precio', 'precio'], ['stock', 'stock'], ['stockCritico', 'stock_critico'],
            ['descuento', 'descuento'], ['categoria', 'categoria'], ['atributos', 'atributos'],
            ['imagen', 'imagen'], ['galeria', 'galeria', true]
        ]
    },
    usuarios: {
        tabla: 'usuarios',
        id: 'run',
        campos: [
            ['run', 'run'], ['nombre', 'nombre'], ['apellidos', 'apellidos'], ['correo', 'correo'],
            ['tipoUsuario', 'tipo_usuario'], ['region', 'region'], ['comuna', 'comuna'],
            ['direccion', 'direccion'], ['telefono', 'telefono'], ['fechaNacimiento', 'fecha_nacimiento']
        ]
    },
    ordenes: {
        tabla: 'ordenes',
        id: 'numero',
        orden: 'posicion',
        campos: [
            ['numero', 'numero'], ['cliente', 'cliente'], ['correo', 'correo'], ['fecha', 'fecha'],
            ['productos', 'productos'], ['total', 'total'], ['descuento', 'descuento'],
            ['cupon', 'cupon', true], ['estado', 'estado'], ['datosEntrega', 'datos_entrega', true],
            ['items', 'items', true]
        ]
    }
};

export const NOMBRES_COLECCIONES = Object.keys(COLECCIONES);

export class ErrorDeNegocio extends Error {
    constructor(mensaje, estado = 400, campo) {
        super(mensaje);
        this.estado = estado;
        this.campo = campo;
    }
}

/** Ejecuta varias operaciones como una sola transacción. */
export function transaccion(db, operaciones) {
    db.exec('BEGIN');
    try {
        const resultado = operaciones();
        db.exec('COMMIT');
        return resultado;
    } catch (error) {
        db.exec('ROLLBACK');
        throw error;
    }
}

function aObjeto(config, fila) {
    const objeto = {};
    config.campos.forEach(([campo, columna, json]) => {
        const valor = fila[columna];
        if (valor === null || valor === undefined) return;
        objeto[campo] = json ? JSON.parse(valor) : valor;
    });
    return objeto;
}

function aValores(config, objeto) {
    return config.campos.map(([campo, , json]) => {
        const valor = objeto[campo];
        if (valor === undefined || valor === null) return null;
        return json ? JSON.stringify(valor) : valor;
    });
}

/** Traduce los errores de restricción de SQLite a errores entendibles. */
function traducir(error, config, registro) {
    const texto = String(error.message);
    if (/UNIQUE constraint failed: usuarios\.correo/.test(texto)) {
        return new ErrorDeNegocio('Ya existe una cuenta con este correo.', 409, 'correo');
    }
    if (/UNIQUE constraint failed|PRIMARY KEY/.test(texto)) {
        return new ErrorDeNegocio(`Ya existe un registro con ${config.id} "${registro[config.id]}".`, 409, config.id);
    }
    if (/FOREIGN KEY constraint failed/.test(texto)) {
        return new ErrorDeNegocio('La operación viola una relación: la categoría no existe o tiene productos asociados.', 409);
    }
    if (/NOT NULL constraint failed/.test(texto)) {
        return new ErrorDeNegocio('Faltan campos obligatorios.', 400);
    }
    return error;
}

export function listar(db, coleccion) {
    const config = COLECCIONES[coleccion];
    const orden = config.orden || 'rowid';
    return db.prepare(`SELECT * FROM ${config.tabla} ORDER BY ${orden}`).all().map(fila => aObjeto(config, fila));
}

export function obtener(db, coleccion, id) {
    const config = COLECCIONES[coleccion];
    const fila = db.prepare(`SELECT * FROM ${config.tabla} WHERE ${config.id} = ?`).get(id);
    return fila ? aObjeto(config, fila) : undefined;
}

export function crear(db, coleccion, registro) {
    const config = COLECCIONES[coleccion];
    if (!registro || !registro[config.id]) {
        throw new ErrorDeNegocio(`Falta el campo "${config.id}".`, 400, config.id);
    }

    const columnas = config.campos.map(([, columna]) => columna);
    const valores = aValores(config, registro);
    if (config.orden) {
        columnas.push(config.orden);
        valores.push(db.prepare(`SELECT COALESCE(MIN(${config.orden}), 0) - 1 AS p FROM ${config.tabla}`).get().p);
    }

    try {
        db.prepare(
            `INSERT INTO ${config.tabla} (${columnas.join(', ')}) VALUES (${columnas.map(() => '?').join(', ')})`
        ).run(...valores);
    } catch (error) {
        throw traducir(error, config, registro);
    }
    return obtener(db, coleccion, registro[config.id]);
}

export function actualizar(db, coleccion, id, cambios) {
    const config = COLECCIONES[coleccion];
    const actual = obtener(db, coleccion, id);
    if (!actual) throw new ErrorDeNegocio('El registro no existe.', 404);

    const nuevo = { ...actual, ...cambios };
    const asignaciones = config.campos.map(([, columna]) => `${columna} = ?`).join(', ');
    try {
        db.prepare(`UPDATE ${config.tabla} SET ${asignaciones} WHERE ${config.id} = ?`)
            .run(...aValores(config, nuevo), id);
    } catch (error) {
        throw traducir(error, config, nuevo);
    }
    return obtener(db, coleccion, nuevo[config.id]);
}

export function eliminar(db, coleccion, id) {
    const config = COLECCIONES[coleccion];
    let resultado;
    try {
        resultado = db.prepare(`DELETE FROM ${config.tabla} WHERE ${config.id} = ?`).run(id);
    } catch (error) {
        throw traducir(error, config, { [config.id]: id });
    }
    if (resultado.changes === 0) throw new ErrorDeNegocio('El registro no existe.', 404);
}

/** Descuenta las unidades vendidas; el stock nunca baja de cero. */
export function descontarStock(db, items) {
    const descontar = db.prepare('UPDATE productos SET stock = MAX(stock - ?, 0) WHERE codigo = ?');
    transaccion(db, () => {
        items.forEach(item => descontar.run(Number(item.cantidad) || 0, item.codigo));
    });
}
