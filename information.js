import Destination from "./Destination.js";
import ImagesCarousel from "./ImagesCarousel.js";

document.addEventListener("DOMContentLoaded", () => {
    const selectedDestination = localStorage.getItem('destinoSeleccionado');
    
    // Inicializar el gestor del destino
    const destinationManager = new Destination(selectedDestination);
    destinationManager.loadDestinationData();

    // Inicializar y cargar el carrusel de imágenes
    const carousel = new ImagesCarousel(selectedDestination);
    carousel.loadImages();
});
