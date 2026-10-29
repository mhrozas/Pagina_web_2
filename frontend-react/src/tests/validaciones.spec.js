import {
    validarRun, validarCorreo, validarRequerido, validarRango, validarNumeroEntero,
    calcularDigitoVerificador, encadenar, validarCampos
} from '../utils/validaciones';

describe('Validaciones de formularios', () => {
    describe('validarRun', () => {
        it('acepta un RUN con dígito verificador correcto', () => {
            expect(validarRun('19011029K')).toBe('');
        });

        it('rechaza un RUN con puntos o guion', () => {
            expect(validarRun('12.345.678-5')).toContain('sin puntos ni guion');
        });

        it('rechaza un RUN con dígito verificador incorrecto', () => {
            expect(validarRun('190110291')).toContain('dígito verificador');
        });

        it('rechaza un RUN demasiado corto', () => {
            expect(validarRun('12345')).toContain('entre 7 y 9');
        });
    });

    describe('calcularDigitoVerificador', () => {
        it('calcula K cuando el resto es 10 y 0 cuando es 11', () => {
            expect(calcularDigitoVerificador('19011029')).toBe('K');
            expect(calcularDigitoVerificador('1000013')).toBe('0');
            expect(calcularDigitoVerificador('12345678')).toBe('5');
        });
    });

    describe('validarCorreo', () => {
        it('acepta los dominios autorizados', () => {
            expect(validarCorreo('ana@duoc.cl')).toBe('');
            expect(validarCorreo('ana@profesor.duoc.cl')).toBe('');
            expect(validarCorreo('ana@gmail.com')).toBe('');
        });

        it('rechaza un dominio no autorizado y un formato inválido', () => {
            expect(validarCorreo('ana@hotmail.com')).toContain('Solo se aceptan');
            expect(validarCorreo('ana-sin-arroba')).toContain('formato');
        });
    });

    describe('validadores genéricos', () => {
        it('validarRequerido marca vacíos y espacios', () => {
            expect(validarRequerido('', 'nombre')).toContain('obligatorio');
            expect(validarRequerido('   ', 'nombre')).toContain('obligatorio');
            expect(validarRequerido('Ana', 'nombre')).toBe('');
        });

        it('validarRango controla el largo', () => {
            expect(validarRango('abc', 4, 10, 'contraseña')).toContain('entre 4 y 10');
            expect(validarRango('abcd', 4, 10, 'contraseña')).toBe('');
        });

        it('validarNumeroEntero rechaza decimales y negativos', () => {
            expect(validarNumeroEntero('2.5', 0, 'stock')).toContain('entero');
            expect(validarNumeroEntero('-1', 0, 'stock')).toContain('no puede ser menor');
            expect(validarNumeroEntero('4', 0, 'stock')).toBe('');
        });

        it('encadenar devuelve el primer error', () => {
            const regla = encadenar(v => validarRequerido(v, 'x'), v => validarRango(v, 3, 5, 'x'));
            expect(regla('')).toContain('obligatorio');
            expect(regla('ab')).toContain('entre 3 y 5');
            expect(regla('abcd')).toBe('');
        });

        it('validarCampos reúne los errores por campo', () => {
            const errores = validarCampos({ a: '', b: 'ok' }, {
                a: v => validarRequerido(v, 'a'),
                b: v => validarRequerido(v, 'b')
            });
            expect(Object.keys(errores)).toEqual(['a']);
        });
    });
});
