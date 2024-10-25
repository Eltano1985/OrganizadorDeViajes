import TripPlanner from "./TripPlanner.js";

// Inicializar el planificador de viajes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const mapContainer = document.getElementById('map');
  
  if (mapContainer) {
    const tripPlanner = new TripPlanner('map');
  } else {
    console.error("Error: No se encontró el contenedor del mapa.");
  }
});

