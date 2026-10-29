import { Link } from 'react-router-dom';
import { BLOGS } from '../data/blogs';

export default function Blogs() {
    return (
        <>
            <header className="mb-4">
                <p className="text-uppercase text-muted small mb-1">Blog Ch.Store</p>
                <h1 className="h3">Noticias y datos curiosos</h1>
                <p className="text-muted">Consejos de compra, cuidado de prendas y datos para sacarle el máximo partido a tu ropa.</p>
            </header>

            <div className="row g-4">
                {BLOGS.map(blog => (
                    <article className="col-md-6" key={blog.id}>
                        <div className="card h-100 shadow-sm">
                            <Link to={`/blogs/${blog.id}`}><img src={blog.imagen} alt={blog.titulo} className="card-img-top blog-img" /></Link>
                            <div className="card-body">
                                <span className="badge bg-secondary me-2">{blog.categoria}</span>
                                <small className="text-muted">{blog.fecha}</small>
                                <h2 className="h5 mt-2"><Link to={`/blogs/${blog.id}`} className="text-dark text-decoration-none">{blog.titulo}</Link></h2>
                                <p>{blog.resumen}</p>
                                <Link to={`/blogs/${blog.id}`}>Leer artículo →</Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </>
    );
}
