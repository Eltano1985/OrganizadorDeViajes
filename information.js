import Destination from "./Destination.js";

document.addEventListener("DOMContentLoaded", () => {
    const selectedDestination = localStorage.getItem('destinoSeleccionado');
    const destinationManager = new Destination(selectedDestination);
    destinationManager.loadDestinationData();
});

