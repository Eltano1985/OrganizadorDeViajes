class TripPlanner {
  constructor(mapId) {
    this.map = L.map(mapId).setView([20.5937, 78.9629], 5); // Coordenadas de India como ejemplo
    this.marker = null;

    // Cargar las capas de los mapas desde OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Manejador del formulario
    this.form = document.getElementById('itinerary-form');
    this.itineraryList = document.getElementById('itinerary-list');

    this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
  }

  handleFormSubmit(event) {
    event.preventDefault();

    // Capturar los valores del formulario
    const destination = document.getElementById('destination').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const activities = document.getElementById('activities').value;

    // Crear un nuevo itinerario
    this.createItineraryItem(destination, startDate, endDate, activities);
    
    // Limpiar el formulario
    this.form.reset();

    // Función para ubicar el destino
    this.geocodeDestination(destination);
  }

  createItineraryItem(destination, startDate, endDate, activities) {
    const itineraryItem = document.createElement('div');
    itineraryItem.classList.add('itinerary-item');
    itineraryItem.innerHTML = `
      <h3>Destino: ${destination}</h3>
      <p><strong>Fecha de inicio:</strong> ${startDate}</p>
      <p><strong>Fecha de fin:</strong> ${endDate}</p>
      <p><strong>Actividades:</strong> ${activities}</p>
      <button class="delete-btn">Eliminar</button>
    `;

    // Agregar el itinerario a la lista
    this.itineraryList.appendChild(itineraryItem);

    // Eliminar itinerario y marcador
    const deleteBtn = itineraryItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => this.deleteItinerary(itineraryItem));

    return itineraryItem;
  }

  geocodeDestination(destination) {
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`;

    // Llamada a la API de OpenStreetMap Nominatim para obtener las coordenadas
    fetch(geocodeUrl)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const lat = data[0].lat;
          const lon = data[0].lon;

          // Centrar el mapa en las coordenadas obtenidas
          this.map.setView([lat, lon], 12);

          // Eliminar marcador anterior si existe
          this.addMarker(lat, lon, destination);
        } else {
          alert('No se encontró el destino.');
        }
      })
      .catch(error => {
        console.error('Error al obtener la ubicación:', error);
        alert('Ocurrió un error al intentar encontrar la ubicación.');
      });
  }

  addMarker(lat, lon, destination) {
    // Eliminar marcador anterior si existe
    if (this.marker) {
      this.marker.remove();
    }

    // Añadir un marcador en la nueva ubicación
    this.marker = L.marker([lat, lon]).addTo(this.map).bindPopup(`Destino: ${destination}`).openPopup();
  }

  deleteItinerary(itineraryItem) {
    itineraryItem.remove();
    if (this.marker) {
      this.marker.remove(); // Elimina el marcador del mapa
      this.marker = null; // Restablecer la variable marker
    }
  }
}

// Inicializar el planificador de viajes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  new TripPlanner('map');
});
