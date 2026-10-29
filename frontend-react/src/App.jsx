import { Route, Routes } from 'react-router-dom';
import LayoutTienda from './components/LayoutTienda';
import LayoutAdmin from './components/LayoutAdmin';
import RutaAdmin from './components/RutaAdmin';

import Home from './pages/Home';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Categorias from './pages/Categorias';
import Ofertas from './pages/Ofertas';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import ResultadoCompra from './pages/ResultadoCompra';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Blogs from './pages/Blogs';
import DetalleBlog from './pages/DetalleBlog';
import Contacto from './pages/Contacto';

import Dashboard from './pages/admin/Dashboard';
import Ordenes from './pages/admin/Ordenes';
import Boleta from './pages/admin/Boleta';
import AdminProductos from './pages/admin/Productos';
import ProductoForm from './pages/admin/ProductoForm';
import AdminCategorias from './pages/admin/Categorias';
import CategoriaForm from './pages/admin/CategoriaForm';
import Usuarios from './pages/admin/Usuarios';
import UsuarioForm from './pages/admin/UsuarioForm';
import HistorialCompras from './pages/admin/HistorialCompras';
import Reportes from './pages/admin/Reportes';
import Perfil from './pages/admin/Perfil';

/**
 * Mapa de navegación: tienda pública (flujo de la Figura 3) y panel de administración (Figura 10).
 */
export default function App() {
    const protegida = (seccion, elemento) => <RutaAdmin seccion={seccion}>{elemento}</RutaAdmin>;

    return (
        <Routes>
            <Route element={<LayoutTienda />}>
                <Route index element={<Home />} />
                <Route path="productos" element={<Productos />} />
                <Route path="producto/:codigo" element={<DetalleProducto />} />
                <Route path="categorias" element={<Categorias />} />
                <Route path="categorias/:nombre" element={<Categorias />} />
                <Route path="ofertas" element={<Ofertas />} />
                <Route path="carrito" element={<Carrito />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="pago-exitoso/:numero" element={<ResultadoCompra exitoso />} />
                <Route path="pago-error/:numero" element={<ResultadoCompra exitoso={false} />} />
                <Route path="login" element={<Login />} />
                <Route path="registro" element={<Registro />} />
                <Route path="nosotros" element={<Nosotros />} />
                <Route path="blogs" element={<Blogs />} />
                <Route path="blogs/:id" element={<DetalleBlog />} />
                <Route path="contacto" element={<Contacto />} />
                <Route path="*" element={<p className="text-center py-5">Página no encontrada.</p>} />
            </Route>

            <Route path="admin" element={protegida(null, <LayoutAdmin />)}>
                <Route index element={<Dashboard />} />
                <Route path="ordenes" element={protegida('ordenes', <Ordenes />)} />
                <Route path="ordenes/:numero" element={protegida('ordenes', <Boleta />)} />
                <Route path="productos" element={protegida('productos', <AdminProductos />)} />
                <Route path="productos/criticos" element={protegida('productos', <AdminProductos />)} />
                <Route path="productos/nuevo" element={protegida('editarProductos', <ProductoForm />)} />
                <Route path="productos/:codigo/editar" element={protegida('editarProductos', <ProductoForm />)} />
                <Route path="categorias" element={protegida('categorias', <AdminCategorias />)} />
                <Route path="categorias/nueva" element={protegida('categorias', <CategoriaForm />)} />
                <Route path="categorias/:nombre/editar" element={protegida('categorias', <CategoriaForm />)} />
                <Route path="usuarios" element={protegida('usuarios', <Usuarios />)} />
                <Route path="usuarios/nuevo" element={protegida('usuarios', <UsuarioForm />)} />
                <Route path="usuarios/:run/editar" element={protegida('usuarios', <UsuarioForm />)} />
                <Route path="usuarios/:run/historial" element={protegida('usuarios', <HistorialCompras />)} />
                <Route path="reportes" element={protegida('reportes', <Reportes />)} />
                <Route path="perfil" element={protegida('perfil', <Perfil />)} />
            </Route>
        </Routes>
    );
}
