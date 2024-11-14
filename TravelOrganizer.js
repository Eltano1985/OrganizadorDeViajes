import TripPlanner from "./TripPlanner.js";

/**
 * Initializes `TripPlanner` when the DOM content is fully loaded. Wait for the `DOMContentLoaded` event to ensure that the DOM is fully parsed. Once the event fires, it checks if the map container (`#map`) exists in the document. If the container is found, it creates a new instance of `TripPlanner` and passes the string ``map'' as an argument. If the container is not found, log an error message to the console
 * @event DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map');
  
  if (mapContainer) {
    const tripPlanner = new TripPlanner('map');
  } else {
    console.error("Error: No se encontró el contenedor del mapa.");
  }
});
