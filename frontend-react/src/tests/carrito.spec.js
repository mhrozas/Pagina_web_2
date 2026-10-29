import {
    agregarItem, cambiarCantidadItem, eliminarItem, calcularTotales, validarCupon,
    precioFinal, unidadesTotales, generarCodigoEnvio, claveItem
} from '../utils/carrito';

const producto = { codigo: 'VES-001', nombre: 'Vestido', precio: 20000, stock: 5, descuento: 0, imagen: '' };

describe('Lógica del carrito', () => {
    describe('agregarItem', () => {
        it('R1: no agrega un producto sin stock', () => {
            const r = agregarItem([], { ...producto, stock: 0 }, 1, 'M');
            expect(r.exito).toBeFalse();
            expect(r.carrito.length).toBe(0);
        });

        it('R2: una cantidad inválida se corrige a 1', () => {
            const r = agregarItem([], producto, 'abc', 'M');
            expect(r.carrito[0].cantidad).toBe(1);
        });

        it('R3: nunca supera el stock disponible', () => {
            const r = agregarItem([], producto, 9, 'M');
            expect(r.carrito[0].cantidad).toBe(5);
            expect(r.mensaje).toContain('Solo quedaban 5');
        });

        it('R4: suma a la misma talla y crea otra línea para otra talla', () => {
            let r = agregarItem([], producto, 2, 'M');
            r = agregarItem(r.carrito, producto, 1, 'M');
            expect(r.carrito.length).toBe(1);
            expect(r.carrito[0].cantidad).toBe(3);

            r = agregarItem(r.carrito, producto, 1, 'L');
            expect(r.carrito.length).toBe(2);
        });

        it('usa el precio con oferta aplicada', () => {
            const r = agregarItem([], { ...producto, descuento: 25 }, 1, 'S');
            expect(r.carrito[0].precio).toBe(15000);
            expect(precioFinal({ precio: 40000, descuento: 25 })).toBe(30000);
        });
    });

    describe('cambiarCantidadItem y eliminarItem', () => {
        const carrito = [{ codigo: 'VES-001', talla: 'M', cantidad: 2, precio: 100 }];
        const clave = claveItem(carrito[0]);

        it('R5: al bajar a 0 elimina la línea', () => {
            expect(cambiarCantidadItem(carrito, clave, -2, 5)).toEqual([]);
        });

        it('R3: no pasa del stock al sumar', () => {
            const r = cambiarCantidadItem(carrito, clave, 10, 3);
            expect(r[0].cantidad).toBe(3);
        });

        it('eliminarItem quita la línea sin importar la cantidad', () => {
            expect(eliminarItem(carrito, clave)).toEqual([]);
        });
    });

    describe('totales y cupones', () => {
        const items = [{ precio: 10000, cantidad: 2 }, { precio: 5000, cantidad: 1 }];

        it('calcula subtotal, descuento y total con cupón', () => {
            const t = calcularTotales(items, 'DUOC15');
            expect(t.subtotal).toBe(25000);
            expect(t.descuento).toBe(3750);
            expect(t.total).toBe(21250);
            expect(t.cupon).toBe('DUOC15');
        });

        it('sin cupón o con cupón inexistente no descuenta', () => {
            expect(calcularTotales(items, null).descuento).toBe(0);
            expect(calcularTotales(items, 'FALSO').cupon).toBeNull();
        });

        it('validarCupon exige código válido y carrito con productos', () => {
            expect(validarCupon('', items).exito).toBeFalse();
            expect(validarCupon('xx', items).mensaje).toContain('no es válido');
            expect(validarCupon('duoc15', []).mensaje).toContain('Agrega productos');
            expect(validarCupon(' duoc15 ', items)).toEqual(jasmine.objectContaining({ exito: true, cupon: 'DUOC15' }));
        });

        it('unidadesTotales suma las cantidades', () => {
            expect(unidadesTotales(items)).toBe(3);
        });
    });

    describe('generarCodigoEnvio (con aleatorio simulado)', () => {
        it('genera CH- más 6 caracteres usando el generador entregado', () => {
            const aleatorio = jasmine.createSpy('aleatorio').and.returnValue(0);
            expect(generarCodigoEnvio(aleatorio)).toBe('CH-AAAAAA');
            expect(aleatorio).toHaveBeenCalledTimes(6);
        });
    });
});
