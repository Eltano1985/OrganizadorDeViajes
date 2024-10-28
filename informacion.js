if (data.photos.length === 0) {
    imagesCarousel.innerHTML = '<p>No se encontraron imágenes para este destino.</p>';
} else {
    data.photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.src.large; // Cambia según el tamaño que prefieras
        img.alt = photo.alt; // Texto alternativo para la imagen
        imagesCarousel.appendChild(img);
    });
}
