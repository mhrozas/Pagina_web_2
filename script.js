// Esta función recibe la ruta de la imagen pequeña a la que le hiciste clic
function cambiarImagen(rutaImagen) {
    // Busca la imagen grande por su ID y cambia su origen (src)
    document.getElementById("imagen-principal").src = rutaImagen;
}