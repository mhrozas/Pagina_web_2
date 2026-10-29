import {
    puedeVer, productosCriticos, calcularIndicadores, ventasPorProducto, ordenesPorEstado,
    REGLAS_PRODUCTO, REGLAS_USUARIO
} from '../utils/admin';
import { REGLAS_CHECKOUT, armarOrden } from '../utils/pago';
import { PRODUCTOS_BASE } from '../data/productosBase';

describe('Lógica del panel de administración', () => {
    it('el Administrador ve todas las secciones y el Vendedor solo productos y órdenes', () => {
        expect(puedeVer('Administrador', 'usuarios')).toBeTrue();
        expect(puedeVer('Vendedor', 'ordenes')).toBeTrue();
        expect(puedeVer('Vendedor', 'usuarios')).toBeFalse();
        expect(puedeVer('Cliente', 'inicio')).toBeFalse();
        expect(puedeVer('Inexistente', 'inicio')).toBeFalse();
    });

    it('productosCriticos incluye los agotados y los que llegaron al stock crítico', () => {
        const codigos = productosCriticos(PRODUCTOS_BASE).map(p => p.codigo);
        expect(codigos).toEqual(jasmine.arrayContaining(['VES-003', 'CON-005', 'VES-008']));
    });

    const ordenes = [
        { numero: 'A', total: 1000, estado: 'Entregada', items: [{ codigo: 'X', nombre: 'Prod X', cantidad: 2, precio: 300 }] },
        { numero: 'B', total: 3000, estado: 'Despachada', items: [{ codigo: 'X', nombre: 'Prod X', cantidad: 1, precio: 300 }, { codigo: 'Y', nombre: 'Prod Y', cantidad: 5, precio: 500 }] },
        { numero: 'C', total: 9999, estado: 'Pago rechazado', items: [{ codigo: 'X', nombre: 'Prod X', cantidad: 9, precio: 300 }] }
    ];

    it('calcularIndicadores ignora las órdenes con pago rechazado', () => {
        const ind = calcularIndicadores(ordenes, PRODUCTOS_BASE, [{}, {}]);
        expect(ind.compras).toBe(2);
        expect(ind.ingresos).toBe(4000);
        expect(ind.ticketPromedio).toBe(2000);
        expect(ind.usuarios).toBe(2);
        expect(ind.productos).toBe(PRODUCTOS_BASE.length);
    });

    it('calcularIndicadores no divide por cero sin ventas', () => {
        expect(calcularIndicadores([], [], []).ticketPromedio).toBe(0);
    });

    it('ventasPorProducto acumula unidades y ordena de mayor a menor', () => {
        const ventas = ventasPorProducto(ordenes);
        expect(ventas[0]).toEqual(jasmine.objectContaining({ codigo: 'Y', unidades: 5 }));
        expect(ventas[1]).toEqual(jasmine.objectContaining({ codigo: 'X', unidades: 3, monto: 900 }));
    });

    it('ordenesPorEstado cuenta por estado', () => {
        expect(ordenesPorEstado(ordenes)).toEqual({ Entregada: 1, Despachada: 1, 'Pago rechazado': 1 });
    });

    it('REGLAS_PRODUCTO valida código, precio, stock y descuento', () => {
        expect(REGLAS_PRODUCTO.codigo('AB')).toContain('al menos 3');
        expect(REGLAS_PRODUCTO.precio('')).toContain('obligatorio');
        expect(REGLAS_PRODUCTO.stock('1.5')).toContain('entero');
        expect(REGLAS_PRODUCTO.descuento('95')).toContain('90%');
        expect(REGLAS_PRODUCTO.descuento('20')).toBe('');
    });

    it('REGLAS_USUARIO valida RUN, correo y tipo de usuario', () => {
        expect(REGLAS_USUARIO.run('123')).not.toBe('');
        expect(REGLAS_USUARIO.correo('x@otro.com')).toContain('Solo se aceptan');
        expect(REGLAS_USUARIO.tipoUsuario('')).toContain('obligatorio');
    });
});

describe('Datos de la compra (utils/pago)', () => {
    const cliente = { nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com', calle: 'Calle 1', departamento: '', region: 'RM', comuna: 'Santiago', indicaciones: '' };
    const items = [{ codigo: 'A', talla: 'M', cantidad: 2, precio: 100 }];
    const totales = { subtotal: 200, descuento: 20, total: 180, cupon: 'DUOC15' };

    it('armarOrden arma una orden aprobada con sus datos de entrega', () => {
        const orden = armarOrden({ numero: 'CH-1', cliente, items, totales, aprobada: true, fecha: '2026-10-28' });
        expect(orden).toEqual(jasmine.objectContaining({
            numero: 'CH-1', cliente: 'Ana Soto', productos: 2, total: 180, estado: 'Pendiente de despacho', fecha: '2026-10-28'
        }));
        expect(orden.datosEntrega.comuna).toBe('Santiago');
    });

    it('armarOrden marca como rechazada una orden no aprobada', () => {
        expect(armarOrden({ numero: 'CH-2', cliente, items, totales, aprobada: false }).estado).toBe('Pago rechazado');
    });

    it('REGLAS_CHECKOUT exige los campos obligatorios', () => {
        expect(REGLAS_CHECKOUT.nombre('')).toContain('obligatorio');
        expect(REGLAS_CHECKOUT.comuna('')).toContain('obligatorio');
        expect(REGLAS_CHECKOUT.departamento('')).toBe('');
    });
});
