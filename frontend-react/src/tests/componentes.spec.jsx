import Boton from '../components/Boton';
import MensajeError from '../components/MensajeError';
import ProductList from '../components/ProductList';
import ProductCard from '../components/ProductCard';
import CampoFormulario from '../components/CampoFormulario';
import SelectorRegionComuna from '../components/SelectorRegionComuna';
import Precio from '../components/Precio';
import ResumenTotales from '../components/ResumenTotales';
import { PRODUCTOS_BASE } from '../data/productosBase';
import { montar, clic, escribir, elegir } from './helpers';
import { useState } from 'react';

describe('Componentes React', () => {
    let vista;
    afterEach(() => vista && vista.desmontar());

    describe('Renderizado correcto', () => {
        it('ProductList renderiza todos los elementos del conjunto de datos', () => {
            vista = montar(<ProductList productos={PRODUCTOS_BASE} />);
            expect(vista.contenedor.querySelectorAll('.product-card').length).toBe(PRODUCTOS_BASE.length);
        });

        it('ProductList muestra el mensaje vacío cuando no hay productos', () => {
            vista = montar(<ProductList productos={[]} vacio="Sin resultados" />);
            expect(vista.contenedor.textContent).toContain('Sin resultados');
            expect(vista.contenedor.querySelectorAll('.product-card').length).toBe(0);
        });
    });

    describe('Renderizado condicional', () => {
        it('MensajeError solo se muestra cuando hay un error presente', () => {
            vista = montar(<MensajeError mensaje="Algo falló" />);
            expect(vista.contenedor.querySelector('.alert-danger').textContent).toBe('Algo falló');
            vista.desmontar();

            vista = montar(<MensajeError mensaje="" />);
            expect(vista.contenedor.querySelector('.alert-danger')).toBeNull();
        });

        it('ProductCard muestra "SIN STOCK" y "Últimas unidades" según el stock', () => {
            const agotado = PRODUCTOS_BASE.find(p => p.stock === 0);
            vista = montar(<ProductCard producto={agotado} />);
            expect(vista.contenedor.textContent).toContain('SIN STOCK');
            vista.desmontar();

            const critico = PRODUCTOS_BASE.find(p => p.stock > 0 && p.stock <= p.stockCritico);
            vista = montar(<ProductCard producto={critico} />);
            expect(vista.contenedor.textContent).toContain('Últimas unidades');
        });

        it('Precio muestra el valor tachado y el porcentaje solo si hay oferta', () => {
            vista = montar(<Precio producto={{ precio: 10000, descuento: 20 }} />);
            expect(vista.contenedor.querySelector('.text-decoration-line-through')).not.toBeNull();
            expect(vista.contenedor.textContent).toContain('-20%');
            vista.desmontar();

            vista = montar(<Precio producto={{ precio: 10000, descuento: 0 }} />);
            expect(vista.contenedor.querySelector('.text-decoration-line-through')).toBeNull();
        });

        it('ResumenTotales muestra la fila de descuento solo con cupón activo', () => {
            vista = montar(<ResumenTotales totales={{ subtotal: 100, descuento: 10, total: 90, cupon: 'DUOC15' }} />);
            expect(vista.contenedor.textContent).toContain('DUOC15');
            vista.desmontar();

            vista = montar(<ResumenTotales totales={{ subtotal: 100, descuento: 0, total: 100, cupon: null }} />);
            expect(vista.contenedor.textContent).not.toContain('Descuento');
        });
    });

    describe('Propiedades (props)', () => {
        it('Boton recibe la etiqueta y ejecuta la función onClick', () => {
            const alClic = jasmine.createSpy('onClick');
            vista = montar(<Boton etiqueta="Comprar" onClick={alClic} variante="success" />);
            const boton = vista.contenedor.querySelector('button');

            expect(boton.textContent).toBe('Comprar');
            expect(boton.classList).toContain('btn-success');
            clic(boton);
            expect(alClic).toHaveBeenCalledTimes(1);
        });

        it('Boton deshabilitado no ejecuta onClick', () => {
            const alClic = jasmine.createSpy('onClick');
            vista = montar(<Boton etiqueta="Agotado" onClick={alClic} deshabilitado />);
            clic(vista.contenedor.querySelector('button'));
            expect(alClic).not.toHaveBeenCalled();
        });

        it('ProductCard enlaza al detalle con el código del producto', () => {
            vista = montar(<ProductCard producto={PRODUCTOS_BASE[0]} />);
            expect(vista.contenedor.querySelector('a').getAttribute('href')).toBe('/producto/VES-001');
        });

        it('CampoFormulario muestra el error y marca el input como inválido', () => {
            vista = montar(<CampoFormulario id="run" etiqueta="RUN" valor="" onChange={() => {}} error="RUN inválido" />);
            expect(vista.contenedor.querySelector('input').classList).toContain('is-invalid');
            expect(vista.contenedor.querySelector('.invalid-feedback').textContent).toBe('RUN inválido');
        });
    });

    describe('Estado (state)', () => {
        function FormularioPrueba() {
            const [nombre, setNombre] = useState('');
            return (
                <>
                    <CampoFormulario id="nombre" etiqueta="Nombre" valor={nombre} onChange={e => setNombre(e.target.value)} />
                    <span id="eco">{nombre}</span>
                </>
            );
        }

        it('el estado del formulario cambia cuando el usuario introduce texto', () => {
            vista = montar(<FormularioPrueba />);
            escribir(vista.contenedor.querySelector('input'), 'Javiera');
            expect(vista.contenedor.querySelector('#eco').textContent).toBe('Javiera');
            expect(vista.contenedor.querySelector('input').value).toBe('Javiera');
        });

        it('SelectorRegionComuna carga las comunas según la región y deshabilita sin región', () => {
            vista = montar(<SelectorRegionComuna region="" comuna="" onChange={() => {}} />);
            expect(vista.contenedor.querySelector('#comuna').disabled).toBeTrue();
            vista.desmontar();

            vista = montar(<SelectorRegionComuna region="RM" comuna="" onChange={() => {}} />);
            const opciones = [...vista.contenedor.querySelectorAll('#comuna option')].map(o => o.value);
            expect(vista.contenedor.querySelector('#comuna').disabled).toBeFalse();
            expect(opciones).toContain('Santiago');
        });
    });

    describe('Eventos', () => {
        it('un clic cambia el estado del componente', () => {
            function Contador() {
                const [n, setN] = useState(0);
                return <Boton etiqueta={`Clics: ${n}`} onClick={() => setN(n + 1)} />;
            }
            vista = montar(<Contador />);
            const boton = vista.contenedor.querySelector('button');
            clic(boton);
            clic(boton);
            expect(boton.textContent).toBe('Clics: 2');
        });

        it('el select de región notifica el cambio mediante onChange', () => {
            const alCambiar = jasmine.createSpy('onChange');
            vista = montar(<SelectorRegionComuna region="" comuna="" onChange={alCambiar} />);
            elegir(vista.contenedor.querySelector('#region'), 'VA');
            expect(alCambiar).toHaveBeenCalledTimes(1);
        });
    });
});
