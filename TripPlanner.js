import ActivityFetcher from "./ActivityFetcher.js";
import MapHandler from "./MapHandler.js";

class TripPlanner {
    constructor(mapId) {
        this.mapHandler = new MapHandler(mapId);
        this.form = document.getElementById('itinerary-form');
        this.itineraryList = document.getElementById('itinerary-list');
        this.activitiesList = document.getElementById('activities-list'); // Contenedor para las actividades
        this.planTripBtn = document.getElementById('plan-trip-btn');
        this.selectionError = document.getElementById('selection-error');
        this.moreInfoBtn = document.getElementById('more-info-btn');

        this.selectedPlaces = [];
        this.activitiesCoordinates = []; // Array para almacenar coordenadas de actividades
        this.bindEvents();
    }

    bindEvents() {
        this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
        document.getElementById('destination').addEventListener('blur', (event) => this.geocodeDestination(event.target.value));
        this.moreInfoBtn.addEventListener('click', () => this.showMoreInfo());
    }

    handleFormSubmit(event) {
        event.preventDefault();
        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const selectedActivities = this.selectedPlaces.join(', ');
    
        // Guardar el destino en localStorage
        localStorage.setItem('destination', destination);
    
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
      
        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Geocoding response:', data);
                if (data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    this.mapHandler.setView(lat, lon);
                    this.mapHandler.addMarker(lat, lon, destination);
                    this.activitiesList.innerHTML = ''; // Limpiar actividades anteriores
                    this.fetchActivitiesImages(destination);
                } else {
                    alert('No se encontró el destino.');
                }
            })
            .catch(error => {
                console.error('Error al obtener la ubicación:', error);
                alert('Ocurrió un error al intentar encontrar la ubicación.');
            });
    }

    fetchActivitiesImages(destination) {
        this.activitiesList.innerHTML = '<p>Cargando sitios de interés...</p>';
        
        ActivityFetcher.fetchActivities(destination)
            .then(places => {
                this.activitiesList.innerHTML = ''; // Limpiar mensaje de carga
                if (places.length > 0) {
                    this.displayInterestSites(places); // Mostrar los sitios de interés
                } else {
                    this.activitiesList.innerHTML = 'No se encontraron sitios de interés para este destino.';
                }
            })
            .catch(error => {
                console.error('Error al obtener los sitios de interés:', error);
                this.activitiesList.innerHTML = 'Ocurrió un error al obtener los sitios de interés: ' + error.message;
            });
    }

    displayInterestSites(places) {
        this.activitiesCoordinates = []; // Limpiar coordenadas antes de mostrar nuevos sitios
     
        places.forEach((place, index) => {
            const placeName = place.name;
            const lat = place.geocodes.main.latitude;
            const lon = place.geocodes.main.longitude;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = placeName;
            checkbox.id = `place-${index}`;
            checkbox.addEventListener('change', () => this.handleCheckboxChange(checkbox, placeName, lat, lon));

            const label = document.createElement('label');
            label.htmlFor = `place-${index}`;
            label.textContent = placeName;

            const div = document.createElement('div');
            div.classList.add('activity-item');
            div.appendChild(checkbox);
            div.appendChild(label);

            this.activitiesList.appendChild(div);
        });
    }

    handleCheckboxChange(checkbox, placeName, lat, lon) {
        if (checkbox.checked) {
            if (this.selectedPlaces.length < 10) {
                this.selectedPlaces.push(placeName);
                this.activitiesCoordinates.push({ lat, lon, name: placeName });
                this.mapHandler.addActivityMarker(lat, lon, placeName);
                this.selectionError.style.display = 'none';
            } else {
                checkbox.checked = false;
                this.selectionError.style.display = 'block';
            }
        } else {
            const index = this.selectedPlaces.indexOf(placeName);
            if (index > -1) {
                this.selectedPlaces.splice(index, 1);
                this.activitiesCoordinates = this.activitiesCoordinates.filter(coord => coord.name !== placeName);
            }
            this.selectionError.style.display = 'none';
            this.mapHandler.removeActivityMarkers(); // Remover y agregar los seleccionados nuevamente
            this.activitiesCoordinates.forEach(coord => this.mapHandler.addActivityMarker(coord.lat, coord.lon, coord.name));
        }

        this.planTripBtn.disabled = this.selectedPlaces.length === 0;
    }

    showMoreInfo() {
        // Redireccionar a la página de información
        window.location.href = 'masinformacion.html';
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
