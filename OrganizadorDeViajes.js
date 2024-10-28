import TripPlanner from "./TripPlanner.js";

// Inicializar el planificador de viajes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const mapElement = document.getElementById('map');
  
  if (mapElement) {
    try {
      const tripPlanner = new TripPlanner('map');
    } catch (error) {
      console.error('Error al inicializar el planificador de viajes:', error);
    }
  } else {
    console.error('Elemento del mapa no encontrado. Asegúrate de que el ID sea correcto.');
  }
});
