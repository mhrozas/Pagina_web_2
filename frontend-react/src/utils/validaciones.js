/* ============================================================
   VALIDADORES DE FORMULARIOS (funciones puras)
   Migrados de js/validaciones.js. Cada validador devuelve ""
   si el valor es válido, o el mensaje de error.
   ============================================================ */

export const DOMINIOS_PERMITIDOS = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

export function validarRequerido(valor, nombreCampo) {
    if (!valor || String(valor).trim() === '') {
        return `El campo ${nombreCampo} es obligatorio.`;
    }
    return '';
}

export function validarMaximo(valor, maximo, nombreCampo) {
    if (valor && valor.length > maximo) {
        return `El campo ${nombreCampo} no puede superar los ${maximo} caracteres.`;
    }
    return '';
}

export function validarRango(valor, minimo, maximo, nombreCampo) {
    if (!valor) return '';
    if (valor.length < minimo || valor.length > maximo) {
        return `El campo ${nombreCampo} debe tener entre ${minimo} y ${maximo} caracteres.`;
    }
    return '';
}

export function validarCorreo(valor) {
    if (!valor) return '';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
        return 'El formato del correo no es válido.';
    }

    const correo = valor.toLowerCase();
    if (!DOMINIOS_PERMITIDOS.some(dominio => correo.endsWith(dominio))) {
        return 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl y @gmail.com.';
    }
    return '';
}

export function validarNumeroDecimal(valor, minimo, nombreCampo) {
    if (valor === '' || valor === null) return '';

    const numero = Number(valor);
    if (isNaN(numero)) return `El campo ${nombreCampo} debe ser un número.`;
    if (numero < minimo) return `El campo ${nombreCampo} no puede ser menor a ${minimo}.`;
    return '';
}

export function validarNumeroEntero(valor, minimo, nombreCampo) {
    if (valor === '' || valor === null) return '';

    const numero = Number(valor);
    if (isNaN(numero)) return `El campo ${nombreCampo} debe ser un número.`;
    if (!Number.isInteger(numero)) return `El campo ${nombreCampo} debe ser un número entero.`;
    if (numero < minimo) return `El campo ${nombreCampo} no puede ser menor a ${minimo}.`;
    return '';
}

/**
 * Calcula el dígito verificador de un RUN (módulo 11).
 * @param {string} numero Cuerpo del RUN, sin dígito verificador.
 * @returns {string} "0"-"9" o "K".
 */
export function calcularDigitoVerificador(numero) {
    let suma = 0;
    let multiplicador = 2;

    for (let i = numero.length - 1; i >= 0; i--) {
        suma += parseInt(numero.charAt(i), 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    if (resto === 11) return '0';
    if (resto === 10) return 'K';
    return String(resto);
}

export function validarRun(valor) {
    if (!valor) return '';

    const run = valor.trim().toUpperCase();

    if (run.includes('.') || run.includes('-')) {
        return 'El RUN debe ingresarse sin puntos ni guion. Ej: 19011029K';
    }
    if (run.length < 7 || run.length > 9) {
        return 'El RUN debe tener entre 7 y 9 caracteres.';
    }
    if (!/^[0-9]+[0-9K]$/.test(run)) {
        return 'El RUN solo puede contener números y, opcionalmente, la letra K al final.';
    }
    if (run.slice(-1) !== calcularDigitoVerificador(run.slice(0, -1))) {
        return 'El RUN ingresado no es válido. Verifica el dígito verificador.';
    }
    return '';
}

/**
 * Encadena varios validadores sobre un mismo valor y devuelve el primer error.
 * @param {...Function} validadores
 * @returns {Function}
 */
export function encadenar(...validadores) {
    return function (valor) {
        for (const validador of validadores) {
            const error = validador(valor);
            if (error) return error;
        }
        return '';
    };
}

/**
 * Ejecuta un conjunto de reglas sobre un objeto de valores.
 * @param {Object} valores
 * @param {Object<string, Function>} reglas campo -> validador
 * @returns {Object} errores por campo (vacío si todo es válido)
 */
export function validarCampos(valores, reglas) {
    const errores = {};
    Object.keys(reglas).forEach(campo => {
        const error = reglas[campo](valores[campo] ?? '');
        if (error) errores[campo] = error;
    });
    return errores;
}
