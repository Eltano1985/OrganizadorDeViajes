import TripPlanner from "./TripPlanner.js";

/**
 * Event that is executed when the document content has been completely loaded. Checks if the map container is present in the DOM and if so initializes the trip planner. Otherwise, it displays an error message in the console.
 */
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map');
  
  if (mapContainer) {
    const tripPlanner = new TripPlanner('map');
  } else {
    console.error("Error: No se encontró el contenedor del mapa.");
  }
});
