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
        const destination = document.getElementById('destination').value; // Obtener el destino
        ActivityFetcher.fetchActivities(lat, lon, destination)
            .then(data => {
                this.activitiesList.innerHTML = ''; // Limpiar el mensaje de carga
                if (data.activitiesData.elements.length > 0) {
                    this.displayActivities(data.activitiesData.elements, data.imagesData.photos);
                } else {
                    this.activitiesList.innerHTML = 'No se encontraron actividades.';
                }
            })
            .catch(error => {
                this.activitiesList.innerHTML = 'Ocurrió un error al obtener las actividades.';
            });
    }
    
    
    
  
    displayActivities(places, images) {
        this.activitiesCoordinates = []; // Limpiar coordenadas antes de mostrar nuevas
    
        // Crear contenedor para el carrusel
        const carouselContainer = document.createElement('div');
        carouselContainer.classList.add('carousel');
    
        // Mostrar hasta 10 imágenes en el carrusel
        images.slice(0, 10).forEach((image, index) => {
            const placeName = places[index]?.tags.name || `Lugar sin nombre ${index + 1}`;
            const lat = places[index]?.lat || 0; // Extraer latitud
            const lon = places[index]?.lon || 0; // Extraer longitud
    
            // Guardar coordenadas del lugar
            this.activitiesCoordinates.push({ name: placeName, lat: lat, lon: lon });
    
            const img = document.createElement('img');
            img.src = image.src.small; // Tamaño pequeño de la imagen
            img.alt = placeName;
            img.classList.add('carousel-image');
            img.addEventListener('click', () => this.handleImageSelect(placeName, lat, lon));
    
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            item.appendChild(img);
            carouselContainer.appendChild(item);
        });
    
        this.activitiesList.innerHTML = ''; // Limpiar actividades anteriores
        this.activitiesList.appendChild(carouselContainer);
    }
        
    
    handleImageSelect(placeName, lat, lon) {
        // Lógica para seleccionar o deseleccionar imágenes
        const index = this.selectedPlaces.indexOf(placeName);
        if (index > -1) {
            // Ya está seleccionado, eliminarlo
            this.selectedPlaces.splice(index, 1);
            this.mapHandler.removeActivityMarker(lat, lon); // Elimina el marcador del mapa
        } else {
            // Agregar a los seleccionados
            if (this.selectedPlaces.length < 10) {
                this.selectedPlaces.push(placeName);
                this.mapHandler.addActivityMarker(lat, lon, placeName); // Añadir marcador en el mapa
            } else {
                alert('Has alcanzado el límite de 10 actividades.');
            }
        }
        // Actualizar el estado del botón
        this.planTripBtn.disabled = this.selectedPlaces.length === 0;
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
