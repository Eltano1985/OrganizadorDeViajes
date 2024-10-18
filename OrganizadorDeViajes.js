class MapHandler {
  constructor(mapId) {
      this.map = L.map(mapId).setView([20.5937, 78.9629], 5); // Coordenadas iniciales (India)
      this.marker = null;

      // Cargar las capas de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this.map);
  }

  addMarker(lat, lon, destination) {
      // Eliminar marcador anterior si existe
      if (this.marker) {
          this.marker.remove();
      }

      // Añadir nuevo marcador
      this.marker = L.marker([lat, lon]).addTo(this.map).bindPopup(`Destino: ${destination}`).openPopup();
  }

  setView(lat, lon) {
      this.map.setView([lat, lon], 12);
  }
}

class ActivityFetcher {
  static fetchActivities(lat, lon) {
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:5000,${lat},${lon})[tourism];out;`;

      return fetch(overpassUrl)
          .then(response => response.json())
          .catch(error => {
              console.error('Error al obtener las actividades:', error);
              throw new Error('Ocurrió un error al obtener las actividades.');
          });
  }
}

class TripPlanner {
  constructor(mapId) {
      this.mapHandler = new MapHandler(mapId);
      this.form = document.getElementById('itinerary-form');
      this.itineraryList = document.getElementById('itinerary-list');
      this.activitiesList = document.getElementById('activities-list');
      this.planTripBtn = document.getElementById('plan-trip-btn');
      this.selectionError = document.getElementById('selection-error');

      this.selectedPlaces = [];
      this.bindEvents();
  }

  bindEvents() {
      this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
      document.getElementById('destination').addEventListener('blur', (event) => this.geocodeDestination(event.target.value));
  }

  handleFormSubmit(event) {
      event.preventDefault();
      const destination = document.getElementById('destination').value;
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;
      const selectedActivities = this.selectedPlaces.join(', ');

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
      this.itineraryList.appendChild(itineraryItem);

      const deleteBtn = itineraryItem.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => this.deleteItinerary(itineraryItem));
  }

  geocodeDestination(destination) {
      const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`;

      // Llamada a la API para obtener coordenadas
      fetch(geocodeUrl)
          .then(response => response.json())
          .then(data => {
              if (data.length > 0) {
                  const lat = data[0].lat;
                  const lon = data[0].lon;
                  this.mapHandler.setView(lat, lon);
                  this.mapHandler.addMarker(lat, lon, destination);
                  this.fetchActivities(lat, lon);
              } else {
                  alert('No se encontró el destino.');
              }
          })
          .catch(error => {
              console.error('Error al obtener la ubicación:', error);
              alert('Ocurrió un error al intentar encontrar la ubicación.');
          });
  }

  fetchActivities(lat, lon) {
      ActivityFetcher.fetchActivities(lat, lon)
          .then(data => {
              this.activitiesList.innerHTML = '';
              if (data.elements.length > 0) {
                  this.displayActivities(data.elements);
              } else {
                  this.activitiesList.innerHTML = 'No se encontraron actividades.';
              }
          })
          .catch(error => {
              this.activitiesList.innerHTML = 'Ocurrió un error al obtener las actividades.';
          });
  }

  displayActivities(places) {
      places.slice(0, 10).forEach((place, index) => {
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
      if (this.mapHandler.marker) {
          this.mapHandler.marker.remove(); // Elimina el marcador del mapa
          this.mapHandler.marker = null; // Restablecer la variable marker
      }
  }
}

// Inicializar el planificador de viajes al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  const tripPlanner = new TripPlanner('map');
});
