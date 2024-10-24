import ActivityFetcher from "./ActivityFetcher.js";
import MapHandler from "./MapHandler.js";

class TripPlanner {
    constructor(mapId) {
        this.mapHandler = new MapHandler(mapId);
        this.form = document.getElementById('itinerary-form');
        this.itineraryList = document.getElementById('itinerary-list');
        this.activitiesList = document.getElementById('activities-list');
        this.planTripBtn = document.getElementById('plan-trip-btn');
        this.selectionError = document.getElementById('selection-error');
  
        this.selectedPlaces = [];
        this.activitiesCoordinates = []; // Array para almacenar coordenadas de actividades
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
        this.activitiesCoordinates = []; // Resetear las coordenadas al finalizar el viaje
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
                    this.activitiesList.innerHTML = ''; // Limpiar actividades anteriores
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
        this.activitiesList.innerHTML = '<p>Cargando actividades...</p>'; // Mostrar mensaje de carga
        ActivityFetcher.fetchActivities(lat, lon)
            .then(data => {
                this.activitiesList.innerHTML = ''; // Limpiar el mensaje de carga
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
        this.activitiesCoordinates = []; // Limpiar coordenadas antes de mostrar nuevas
  
        places.slice(0, 10).forEach((place, index) => {
            const placeName = place.tags.name || `Lugar sin nombre ${index + 1}`;
            const lat = place.lat || 0; // Extraer latitud
            const lon = place.lon || 0; // Extraer longitud
            
            // Guardar coordenadas del lugar
            this.activitiesCoordinates.push({ name: placeName, lat: lat, lon: lon });
  
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = placeName;
            checkbox.id = `place-${index}`;
            checkbox.addEventListener('change', () => this.handleCheckboxChange(checkbox, lat, lon));
  
            const label = document.createElement('label');
            label.htmlFor = `place-${index}`;
            label.textContent = `${index + 1}. ${placeName}`;
  
            const div = document.createElement('div');
            div.appendChild(checkbox);
            div.appendChild(label);
  
            this.activitiesList.appendChild(div);
        });
    }
  
    handleCheckboxChange(checkbox, lat, lon) {
        if (checkbox.checked) {
            if (this.selectedPlaces.length < 10) {
                this.selectedPlaces.push(checkbox.value);
                this.selectionError.style.display = 'none';
                this.mapHandler.addActivityMarker(lat, lon, checkbox.value); // Añadir marcador en el mapa
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

export default TripPlanner;
