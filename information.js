import Destination from "./Destination.js";
import ImagesCarousel from "./ImagesCarousel.js";

/**
 * Initializes the target and image carousel components when the DOM content is fully loaded. Retrieves the selected destination from `localStorage` and initializes two main components: `destinationManager` (manages destination-specific data using the `Destination` class). and `carousel` (manages the image carousel for the target using the `ImagesCarousel` class). Call `loadDestinationData` in `destinationManager` to retrieve destination data, and `loadImages` in `carousel` to load relevant images for display
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
    const selectedDestination = localStorage.getItem('destinoSeleccionado');
    
    const destinationManager = new Destination(selectedDestination);
    destinationManager.loadDestinationData();

    const carousel = new ImagesCarousel(selectedDestination);
    carousel.loadImages();
});
