/* ============================================================
   VALIDACIONES DE FORMULARIOS
   Funciones reutilizadas por los formularios de la tienda
   (login, contacto, registro) y del administrador
   (mantenedor de productos y de usuarios).
   Las reglas provienen de los requerimientos del cliente.
   ============================================================ */

/* Dominios de correo aceptados por el sistema */
const DOMINIOS_PERMITIDOS = ["@duoc.cl", "@profesor.duoc.cl", "@gmail.com"];


/* ------------------------------------------------------------
   1. UTILIDADES DE MENSAJES EN PANTALLA
   ------------------------------------------------------------ */

/**
 * Muestra un mensaje de error bajo un campo y lo marca visualmente.
 * @param {string} idCampo
 * @param {string} mensaje
 */
function mostrarError(idCampo, mensaje) {
    const campo = document.getElementById(idCampo);
    const contenedorError = document.getElementById('error-' + idCampo);

    if (campo) campo.classList.add('campo-invalido');
    if (contenedorError) {
        contenedorError.textContent = mensaje;
        contenedorError.classList.add('visible');
    }
}

/**
 * Limpia el mensaje de error de un campo.
 * @param {string} idCampo
 */
function limpiarError(idCampo) {
    const campo = document.getElementById(idCampo);
    const contenedorError = document.getElementById('error-' + idCampo);

    if (campo) campo.classList.remove('campo-invalido');
    if (contenedorError) {
        contenedorError.textContent = '';
        contenedorError.classList.remove('visible');
    }
}

/**
 * Muestra un mensaje de éxito en un contenedor.
 * @param {string} idContenedor
 * @param {string} mensaje
 */
function mostrarExito(idContenedor, mensaje) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    contenedor.textContent = mensaje;
    contenedor.classList.add('visible');
}


/* ------------------------------------------------------------
   2. VALIDADORES GENÉRICOS
   Cada validador devuelve "" si el valor es válido,
   o el mensaje de error correspondiente.
   ------------------------------------------------------------ */

/**
 * El campo no puede quedar vacío.
 */
function validarRequerido(valor, nombreCampo) {
    if (!valor || valor.trim() === '') {
        return `El campo ${nombreCampo} es obligatorio.`;
    }
    return '';
}

/**
 * El campo no puede superar un largo máximo.
 */
function validarMaximo(valor, maximo, nombreCampo) {
    if (valor && valor.length > maximo) {
        return `El campo ${nombreCampo} no puede superar los ${maximo} caracteres.`;
    }
    return '';
}

/**
 * El campo debe tener un largo dentro de un rango.
 */
function validarRango(valor, minimo, maximo, nombreCampo) {
    if (!valor) return '';
    if (valor.length < minimo || valor.length > maximo) {
        return `El campo ${nombreCampo} debe tener entre ${minimo} y ${maximo} caracteres.`;
    }
    return '';
}

/**
 * El correo debe tener formato válido y pertenecer a un dominio autorizado.
 */
function validarCorreo(valor) {
    if (!valor) return '';

    const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatoCorreo.test(valor)) {
        return 'El formato del correo no es válido.';
    }

    const correo = valor.toLowerCase();
    const dominioValido = DOMINIOS_PERMITIDOS.some(dominio => correo.endsWith(dominio));

    if (!dominioValido) {
        return 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl y @gmail.com.';
    }

    return '';
}

/**
 * Valida un número decimal mayor o igual a un mínimo.
 */
function validarNumeroDecimal(valor, minimo, nombreCampo) {
    if (valor === '' || valor === null) return '';

    const numero = Number(valor);
    if (isNaN(numero)) {
        return `El campo ${nombreCampo} debe ser un número.`;
    }
    if (numero < minimo) {
        return `El campo ${nombreCampo} no puede ser menor a ${minimo}.`;
    }
    return '';
}

/**
 * Valida un número entero mayor o igual a un mínimo.
 */
function validarNumeroEntero(valor, minimo, nombreCampo) {
    if (valor === '' || valor === null) return '';

    const numero = Number(valor);
    if (isNaN(numero)) {
        return `El campo ${nombreCampo} debe ser un número.`;
    }
    if (!Number.isInteger(numero)) {
        return `El campo ${nombreCampo} debe ser un número entero.`;
    }
    if (numero < minimo) {
        return `El campo ${nombreCampo} no puede ser menor a ${minimo}.`;
    }
    return '';
}


/* ------------------------------------------------------------
   3. VALIDACIÓN DE RUN CHILENO
   Formato exigido: sin puntos ni guion (ej: 19011022K),
   entre 7 y 9 caracteres, con dígito verificador correcto.
   ------------------------------------------------------------ */

/**
 * Calcula el dígito verificador de un RUN usando el algoritmo módulo 11.
 * @param {string} numero Cuerpo del RUN, sin dígito verificador.
 * @returns {string} Dígito verificador: "0"-"9" o "K".
 */
function calcularDigitoVerificador(numero) {
    let suma = 0;
    let multiplicador = 2;

    /* Se recorre el número de derecha a izquierda multiplicando
       por la serie 2,3,4,5,6,7 de forma cíclica. */
    for (let i = numero.length - 1; i >= 0; i--) {
        suma += parseInt(numero.charAt(i), 10) * multiplicador;
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);

    if (resto === 11) return '0';
    if (resto === 10) return 'K';
    return String(resto);
}

/**
 * Valida un RUN completo según las reglas del cliente.
 * @param {string} valor
 * @returns {string} Mensaje de error, o "" si es válido.
 */
function validarRun(valor) {
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

    const cuerpo = run.slice(0, -1);
    const digitoIngresado = run.slice(-1);
    const digitoCalculado = calcularDigitoVerificador(cuerpo);

    if (digitoIngresado !== digitoCalculado) {
        return 'El RUN ingresado no es válido. Verifica el dígito verificador.';
    }

    return '';
}


/* ------------------------------------------------------------
   4. VALIDACIÓN EN TIEMPO REAL
   Asocia un validador a un campo y lo ejecuta mientras el
   usuario escribe y cuando abandona el campo.
   ------------------------------------------------------------ */

/**
 * Conecta un campo con su función de validación.
 * @param {string} idCampo
 * @param {Function} funcionValidadora Recibe el valor y devuelve "" o el error.
 */
function validarEnTiempoReal(idCampo, funcionValidadora) {
    const campo = document.getElementById(idCampo);
    if (!campo) return;

    const ejecutar = () => {
        const error = funcionValidadora(campo.value);
        if (error) {
            mostrarError(idCampo, error);
        } else {
            limpiarError(idCampo);
        }
    };

    campo.addEventListener('blur', ejecutar);
    campo.addEventListener('input', () => {
        /* Mientras escribe solo se limpia el error si ya quedó correcto,
           para no molestar al usuario campo por campo. */
        if (campo.classList.contains('campo-invalido')) {
            ejecutar();
        }
    });
}

/**
 * Ejecuta un conjunto de reglas y pinta todos los errores encontrados.
 * @param {Array} reglas Lista de objetos { campo, validar }.
 * @returns {boolean} true si el formulario completo es válido.
 */
function validarFormulario(reglas) {
    let esValido = true;

    reglas.forEach(regla => {
        const campo = document.getElementById(regla.campo);
        const valor = campo ? campo.value : '';
        const error = regla.validar(valor);

        if (error) {
            mostrarError(regla.campo, error);
            esValido = false;
        } else {
            limpiarError(regla.campo);
        }
    });

    return esValido;
}

/**
 * Encadena varios validadores sobre un mismo valor y devuelve el primer error.
 * @param {...Function} validadores
 * @returns {Function}
 */
function encadenar(...validadores) {
    return function (valor) {
        for (const validador of validadores) {
            const error = validador(valor);
            if (error) return error;
        }
        return '';
    };
}

/**
 * Muestra un contador de caracteres usados sobre un campo de texto.
 * @param {string} idCampo
 * @param {string} idContador
 * @param {number} maximo
 */
function activarContador(idCampo, idContador, maximo) {
    const campo = document.getElementById(idCampo);
    const contador = document.getElementById(idContador);
    if (!campo || !contador) return;

    const actualizar = () => {
        contador.textContent = `${campo.value.length} / ${maximo}`;
        contador.classList.toggle('contador-limite', campo.value.length >= maximo);
    };

    campo.addEventListener('input', actualizar);
    actualizar();
}
