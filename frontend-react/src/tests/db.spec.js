import * as db from '../data/db';

describe('Base de datos simulada (CRUD sobre localStorage)', () => {
    beforeEach(() => db.reiniciar());
    afterAll(() => db.reiniciar());

    it('listar devuelve los datos iniciales cuando no hay nada guardado', () => {
        expect(db.listar('productos').length).toBe(8);
        expect(db.listar('categorias').length).toBe(4);
    });

    it('crear agrega un registro y lo persiste en localStorage', () => {
        const r = db.crear('categorias', { nombre: 'Abrigos', descripcion: 'Chaquetas' });
        expect(r.exito).toBeTrue();
        expect(db.obtener('categorias', 'Abrigos').descripcion).toBe('Chaquetas');
        expect(JSON.parse(localStorage.getItem(db.CLAVES.categorias)).length).toBe(5);
    });

    it('crear rechaza un identificador repetido', () => {
        const r = db.crear('categorias', { nombre: 'Vestidos', descripcion: '' });
        expect(r.exito).toBeFalse();
        expect(db.listar('categorias').length).toBe(4);
    });

    it('actualizar modifica solo los campos indicados', () => {
        db.actualizar('productos', 'VES-001', { precio: 1234 });
        const p = db.obtener('productos', 'VES-001');
        expect(p.precio).toBe(1234);
        expect(p.nombre).toBe('Vestido Largo Tropic Negro');
    });

    it('actualizar y eliminar informan cuando el registro no existe', () => {
        expect(db.actualizar('productos', 'NO-EXISTE', {}).exito).toBeFalse();
        expect(db.eliminar('productos', 'NO-EXISTE').exito).toBeFalse();
    });

    it('eliminar quita el registro', () => {
        expect(db.eliminar('productos', 'VES-001').exito).toBeTrue();
        expect(db.obtener('productos', 'VES-001')).toBeUndefined();
    });

    it('notifica a los suscriptores tras un cambio y permite cancelar la suscripción', () => {
        const espia = jasmine.createSpy('suscriptor');
        const cancelar = db.suscribir(espia);

        db.eliminar('productos', 'VES-001');
        expect(espia).toHaveBeenCalledTimes(1);

        cancelar();
        db.eliminar('productos', 'CON-002');
        expect(espia).toHaveBeenCalledTimes(1);
    });

    it('si el dato guardado está corrupto vuelve a los datos iniciales', () => {
        localStorage.setItem(db.CLAVES.productos, '{no es json');
        spyOn(console, 'error');
        expect(db.listar('productos').length).toBe(8);
        expect(console.error).toHaveBeenCalled();
    });

    describe('consultas específicas', () => {
        it('listarOfertas devuelve solo productos con descuento', () => {
            const ofertas = db.listarOfertas();
            expect(ofertas.length).toBeGreaterThan(0);
            expect(ofertas.every(p => p.descuento > 0)).toBeTrue();
        });

        it('listarCriticos incluye los agotados y los bajo el stock crítico', () => {
            const codigos = db.listarCriticos().map(p => p.codigo);
            expect(codigos).toContain('VES-008');
            expect(codigos).toContain('CON-005');
            expect(codigos).not.toContain('BLU-004');
        });

        it('listarPorCategoria filtra y "todas" devuelve el catálogo completo', () => {
            expect(db.listarPorCategoria('Blusas').length).toBe(1);
            expect(db.listarPorCategoria('todas').length).toBe(8);
        });

        it('registrarUsuario valida RUN y correo duplicados', () => {
            const base = { run: '19011029K', nombre: 'Ana', apellidos: 'Soto', correo: 'ana@gmail.com', tipoUsuario: 'Cliente' };
            expect(db.registrarUsuario(base).exito).toBeTrue();
            expect(db.registrarUsuario(base).campo).toBe('run');
            expect(db.registrarUsuario({ ...base, run: '12345678K', correo: 'ANA@gmail.com' }).campo).toBe('correo');
        });

        it('registrarOrden y listarOrdenesDeUsuario arman el historial de compras', () => {
            db.registrarOrden({ numero: 'CH-1', correo: 'Cliente@gmail.com', total: 100, items: [] });
            const historial = db.listarOrdenesDeUsuario('cliente@gmail.com');
            expect(historial.map(o => o.numero)).toContain('CH-1');
        });

        it('descontarStock resta lo vendido sin bajar de cero', () => {
            db.descontarStock([{ codigo: 'CON-005', cantidad: 5 }, { codigo: 'VES-001', cantidad: 2 }]);
            expect(db.obtener('productos', 'CON-005').stock).toBe(0);
            expect(db.obtener('productos', 'VES-001').stock).toBe(10);
        });
    });
});
