import { Link, useParams } from 'react-router-dom';
import { BLOGS } from '../data/blogs';

export default function DetalleBlog() {
    const { id } = useParams();
    const blog = BLOGS.find(b => String(b.id) === id);

    if (!blog) {
        return (
            <div className="text-center py-5">
                <p>El artículo no existe.</p>
                <Link to="/blogs" className="btn btn-dark">Volver a blogs</Link>
            </div>
        );
    }

    const siguiente = BLOGS.find(b => b.id !== blog.id);

    return (
        <article className="mx-auto" style={{ maxWidth: 780 }}>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/blogs">Blogs</Link></li>
                    <li className="breadcrumb-item active">{blog.titulo}</li>
                </ol>
            </nav>

            <span className="badge bg-secondary">{blog.categoria}</span>
            <h1 className="mt-2">{blog.titulo}</h1>
            <p className="text-muted">{blog.fecha}</p>
            <img src={blog.imagen} alt={blog.titulo} className="img-fluid rounded mb-4" />

            {blog.secciones.map((s, i) => (
                <section key={i}>
                    {s.subtitulo && <h2 className="h4 mt-4">{s.subtitulo}</h2>}
                    <p>{s.parrafo}</p>
                    {s.lista && <ul>{s.lista.map(item => <li key={item}>{item}</li>)}</ul>}
                </section>
            ))}

            {siguiente && (
                <aside className="card mt-5">
                    <div className="card-body">
                        <p className="text-uppercase text-muted small mb-1">Sigue leyendo</p>
                        <Link to={`/blogs/${siguiente.id}`}>{siguiente.titulo} →</Link>
                    </div>
                </aside>
            )}

            <div className="d-flex gap-2 mt-4">
                <Link to="/blogs" className="btn btn-outline-secondary">← Volver a blogs</Link>
                <Link to="/productos" className="btn btn-dark">Ver productos</Link>
            </div>
        </article>
    );
}
