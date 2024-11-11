import Destination from "./Destination.js";
import ImagesCarousel from "./ImagesCarousel.js";

/**
 * Event that is executed when the document content has been completely loaded. Retrieves the selected destination from local storage and loads the destination data and images
 */
document.addEventListener("DOMContentLoaded", () => {
    const selectedDestination = localStorage.getItem('destinoSeleccionado');
    
    const destinationManager = new Destination(selectedDestination);
    destinationManager.loadDestinationData();

    const carousel = new ImagesCarousel(selectedDestination);
    carousel.loadImages();
});
