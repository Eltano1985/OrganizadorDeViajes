class TripPlanner {
  constructor(mapId) {
    this.map = L.map(mapId).setView([20.5937, 78.9629], 5); // Coordenadas de ejemplo (India)
    this.marker = null;

    // Cargar las capas de los mapas desde OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Manejador del formulario
    this.form = document.getElementById('itinerary-form');
    this.itineraryList = document.getElementById('itinerary-list');
    this.activitiesList = document.getElementById('activities-list'); // Nueva lista de actividades
    this.planTripBtn = document.getElementById('plan-trip-btn'); // Botón de planificar viaje
    this.selectionError = document.getElementById('selection-error'); // Mensaje de error de selección

    this.selectedPlaces = [];

    this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
  }

  handleFormSubmit(event) {
    event.preventDefault();

    // Capturar los valores del formulario
    const destination = document.getElementById('destination').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    // Capturar los lugares seleccionados
    const selectedActivities = this.selectedPlaces.join(', ');

    // Crear un nuevo itinerario
    this.createItineraryItem(destination, startDate, endDate, selectedActivities);
    
    // Limpiar el formulario y reiniciar la lista de selección
    this.form.reset();
    this.activitiesList.innerHTML = '';
    this.planTripBtn.disabled = true;
    this.selectedPlaces = [];
  }

  createItineraryItem(destination, startDate, endDate, activities) {
    const itineraryItem = document.createElement('div');
    itineraryItem.classList.add('itinerary-item');
    itineraryItem.innerHTML = `
      <h3>Destino: ${destination}</h3>
      <p><strong>Fecha de inicio:</strong> ${startDate}</p>
      <p><strong>Fecha de fin:</strong> ${endDate}</p>
      <p><strong>Actividades seleccionadas:</strong> ${activities}</p>
      <button class="delete-btn">Eliminar</button>
    `;

    // Agregar el itinerario a la lista
    this.itineraryList.appendChild(itineraryItem);

    // Eliminar itinerario y marcador
    const deleteBtn = itineraryItem.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => this.deleteItinerary(itineraryItem));
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

          // Añadir marcador en la nueva ubicación
          this.addMarker(lat, lon, destination);

          // Obtener actividades para el destino
          this.fetchActivities(lat, lon, destination);
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

  fetchActivities(lat, lon, destination) {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:5000,${lat},${lon})[tourism];out;`;

    // Llamada a la API de Overpass para obtener lugares de interés cercanos (tourism)
    fetch(overpassUrl)
      .then(response => response.json())
      .then(data => {
        console.log('Lugares obtenidos:', data); // Verificar si se obtienen lugares

        if (data.elements.length > 0) {
          this.activitiesList.innerHTML = ''; // Limpiar lista de actividades

          // Generar lista de checkboxes con numeración
          data.elements.slice(0, 10).forEach((place, index) => {
            const placeName = place.tags.name || `Lugar sin nombre ${index + 1}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = placeName;
            checkbox.id = `place-${index}`;
            checkbox.addEventListener('change', () => this.handleCheckboxChange(checkbox));

            const label = document.createElement('label');
            label.htmlFor = `place-${index}`;
            label.textContent = `${index + 1}. ${placeName}`;

            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);

            this.activitiesList.appendChild(div);
          });
        } else {
          this.activitiesList.innerHTML = 'No se encontraron actividades.';
        }
      })
      .catch(error => {
        console.error('Error al obtener las actividades:', error);
        this.activitiesList.innerHTML = 'Ocurrió un error al obtener las actividades.';
      });
  }

  handleCheckboxChange(checkbox) {
    if (checkbox.checked) {
      if (this.selectedPlaces.length < 10) {
        this.selectedPlaces.push(checkbox.value);
        this.selectionError.style.display = 'none';
      } else {
        checkbox.checked = false;
        this.selectionError.style.display = 'block';
      }
    } else {
      const index = this.selectedPlaces.indexOf(checkbox.value);
      if (index > -1) {
        this.selectedPlaces.splice(index, 1);
      }
      this.selectionError.style.display = 'none';
    }

    // Habilitar el botón solo si hay al menos un lugar seleccionado
    this.planTripBtn.disabled = this.selectedPlaces.length === 0;
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
  const tripPlanner = new TripPlanner('map');
  const destinationInput = document.getElementById('destination');
  
  destinationInput.addEventListener('blur', () => {
    const destination = destinationInput.value;
    if (destination) {
      tripPlanner.geocodeDestination(destination);
    }
  });
});
