import { Link } from 'react-router-dom';
import useColeccion from '../hooks/useColeccion';

const EQUIPO = [
    { siglas: 'JR', nombre: 'Javiera Rojas', rol: 'Frontend / Validaciones JS', detalle: 'Responsable del catálogo y el carrito, las validaciones de formularios, el módulo administrador, las pruebas y la documentación ERS.' },
    { siglas: 'MH', nombre: 'M. Rozas', rol: 'Frontend / Maquetación', detalle: 'Responsable del diseño visual, la estructura de la interfaz, la portada con video y el carrito con cupones y código de envío.' }
];

export default function Nosotros() {
    const productos = useColeccion('productos');
    const categorias = useColeccion('categorias');

    const cifras = [
        { valor: 2024, texto: 'Año de fundación' },
        { valor: productos.length, texto: 'Productos en catálogo' },
        { valor: categorias.length, texto: 'Categorías' },
        { valor: '30 días', texto: 'Para cambios' }
    ];

    const pilares = [
        { icono: 'bi-bullseye', titulo: 'Nuestra misión', texto: 'Ofrecer ropa de calidad a precios justos, con una experiencia de compra simple, clara y confiable.' },
        { icono: 'bi-eye', titulo: 'Nuestra visión', texto: 'Ser una de las tiendas online de ropa femenina más reconocidas de Chile hacia 2028, destacando por el servicio al cliente y la rapidez de despacho.' },
        { icono: 'bi-heart', titulo: 'Cómo trabajamos', texto: 'Trabajamos con proveedores nacionales seleccionados, priorizando prendas de buena calidad a precios accesibles.' }
    ];

    return (
        <>
            <section className="row align-items-center g-4 mb-5">
                <div className="col-md-7">
                    <p className="text-uppercase text-muted small mb-1">Quiénes somos</p>
                    <h1>Moda femenina de calidad, <span className="text-danger">a un precio justo</span></h1>
                    <p>Ch.Store nació en 2024 como un emprendimiento dedicado a la venta de ropa femenina en Chile. Partimos vendiendo por redes sociales y hoy damos el paso a nuestra propia tienda online, con el objetivo de llegar a todo el país.</p>
                    <Link to="/productos" className="btn btn-dark">Conoce la colección</Link>
                </div>
                <div className="col-md-5">
                    <img className="img-fluid rounded" alt="" src="https://froens.cl/cdn/shop/files/blazer-alondra-mujer-beige-lifestyle-froens-1_d1653926-de0c-4259-9101-dafda13822c6.webp?v=1784055114&width=800" />
                </div>
            </section>

            <section className="row row-cols-2 row-cols-md-4 g-3 text-center mb-5" aria-label="Ch.Store en cifras">
                {cifras.map(c => (
                    <div className="col" key={c.texto}>
                        <div className="card h-100"><div className="card-body">
                            <strong className="display-6 d-block">{c.valor}</strong><span className="text-muted">{c.texto}</span>
                        </div></div>
                    </div>
                ))}
            </section>

            <section className="row g-3 mb-5">
                {pilares.map(p => (
                    <article className="col-md-4" key={p.titulo}>
                        <div className="card h-100"><div className="card-body">
                            <i className={`bi ${p.icono} fs-2`} />
                            <h2 className="h5 mt-2">{p.titulo}</h2>
                            <p className="mb-0">{p.texto}</p>
                        </div></div>
                    </article>
                ))}
            </section>

            <section className="mb-5">
                <h2 className="h4 text-center">Equipo de desarrollo</h2>
                <p className="text-center text-muted">Proyecto de la asignatura DSY1104 - Desarrollo Full Stack.</p>
                <div className="row g-3 justify-content-center">
                    {EQUIPO.map(m => (
                        <article className="col-md-5" key={m.siglas}>
                            <div className="card h-100 text-center"><div className="card-body">
                                <div className="avatar-equipo mx-auto mb-2">{m.siglas}</div>
                                <h3 className="h6">{m.nombre}</h3>
                                <p className="small text-muted mb-1">{m.rol}</p>
                                <p className="small mb-0">{m.detalle}</p>
                            </div></div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="text-center bg-light rounded p-4">
                <h2 className="h4">¿Buscas tu próxima prenda favorita?</h2>
                <p>Revisa el catálogo completo o escríbenos si tienes dudas sobre tallas, cambios o despachos.</p>
                <Link to="/productos" className="btn btn-dark me-2">Ver catálogo</Link>
                <Link to="/contacto" className="btn btn-outline-dark">Contáctanos</Link>
            </section>
        </>
    );
}
