document.addEventListener("DOMContentLoaded", () => {
    const destino = localStorage.getItem('destinoSeleccionado');
    if (destino) {
        document.getElementById('destino-titulo').innerText = destino;
        document.getElementById('destino-titulo2').innerText = destino;
        cargarResumenDestino(destino);
        cargarImagenesDestino(destino);
    } else {
        alert("No se ha seleccionado ningún destino.");
    }
});

function cargarResumenDestino(destino) {
    document.getElementById('descripcion-destino').innerText = `Explora las maravillas de ${destino}, un lugar lleno de cultura, historia y paisajes únicos. ¡Planifica tu viaje y descubre todo lo que tiene para ofrecerte!`;
}

async function cargarImagenesDestino(destino) {
    const apiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1';
    const url = `https://api.pexels.com/v1/search?query=${destino}&per_page=15`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: apiKey }
        });
        const data = await response.json();

        if (data.photos.length === 0) {
            document.getElementById('carousel-image').alt = "No hay imágenes disponibles para este destino.";
            return;
        }

        const images = data.photos.map(photo => photo.src.medium);
        let currentIndex = 0;
        const carouselImage = document.getElementById('carousel-image');

        // Mostrar la primera imagen
        carouselImage.src = images[currentIndex];

        // Configurar botones de navegación
        document.getElementById('next-btn').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            carouselImage.src = images[currentIndex];
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            carouselImage.src = images[currentIndex];
        });

    } catch (error) {
        console.error("Error al cargar las imágenes del destino:", error);
    }
}
