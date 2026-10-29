import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="bg-dark text-light mt-5 py-4">
            <div className="container d-flex flex-column flex-md-row justify-content-between gap-2">
                <span>© 2026 Ch.Store — Moda femenina de Chile</span>
                <span className="small">
                    <Link className="text-light me-3" to="/nosotros">Nosotros</Link>
                    <Link className="text-light me-3" to="/blogs">Blog</Link>
                    <Link className="text-light" to="/contacto">Contacto</Link>
                </span>
            </div>
        </footer>
    );
}
