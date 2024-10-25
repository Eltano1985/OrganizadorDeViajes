import ActivityFetcher from "./ActivityFetcher.js";
import MapHandler from "./MapHandler.js";

class TripPlanner {
    constructor(mapId) {
        this.mapHandler = new MapHandler(mapId);
        this.form = document.getElementById('itinerary-form');
        this.itineraryList = document.getElementById('itinerary-list');
        this.activitiesList = document.getElementById('activities-list'); // Contenedor del carrusel
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
        const pexelsApiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(destination)}&per_page=10`;
    
        this.activitiesList.innerHTML = '<p>Cargando imágenes...</p>'; // Mensaje de carga
        fetch(pexelsApiUrl, {
            headers: {
                Authorization: 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1' // Asegúrate de que esta clave sea válida
            }
        })
        .then(response => {
            console.log('Pexels API Response:', response); // Ver respuesta de la API
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Datos de Pexels:', data); // Ver los datos devueltos
            this.activitiesList.innerHTML = ''; // Limpiar mensaje de carga
            if (data.photos && data.photos.length > 0) {
                this.displayActivityImages(data.photos);
            } else {
                this.activitiesList.innerHTML = 'No se encontraron imágenes para este destino.';
            }
        })
        .catch(error => {
            console.error('Error al obtener las imágenes:', error);
            this.activitiesList.innerHTML = 'Ocurrió un error al obtener las imágenes: ' + error.message;
        });
    }
    
    
  
    displayActivityImages(images) {
        this.activitiesCoordinates = []; // Limpiar coordenadas antes de mostrar nuevas
    
        images.forEach((image, index) => {
            const imgElement = document.createElement('img');
            imgElement.src = image.src.medium; // Cambia esto a image.src.large si quieres una mejor calidad
            imgElement.alt = `Actividad ${index + 1}`;
            imgElement.classList.add('activity-image');
    
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = image.src.medium; // Cambia esto si quieres guardar otro valor
            checkbox.id = `image-${index}`;
            checkbox.addEventListener('change', () => this.handleCheckboxChange(checkbox, image.photographer));
    
            const label = document.createElement('label');
            label.htmlFor = `image-${index}`;
            label.textContent = `Imagen ${index + 1} - Fotógrafo: ${image.photographer}`;
    
            const div = document.createElement('div');
            div.classList.add('activity-item');
            div.appendChild(imgElement);
            div.appendChild(checkbox);
            div.appendChild(label);
    
            this.activitiesList.appendChild(div);
        });
    }
    
  
    handleCheckboxChange(checkbox, photographer) {
        if (checkbox.checked) {
            if (this.selectedPlaces.length < 10) {
                this.selectedPlaces.push(photographer);
                this.selectionError.style.display = 'none';
            } else {
                checkbox.checked = false;
                this.selectionError.style.display = 'block';
            }
        } else {
            const index = this.selectedPlaces.indexOf(photographer);
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
