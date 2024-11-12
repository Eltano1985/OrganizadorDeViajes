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
        this.moreInfoBtn = document.getElementById('more-info-btn');

        this.selectedPlaces = [];
        this.activitiesCoordinates = [];
        this.bindEvents();
    }

    /**
     * Adds event handlers to key elements: the trip planning form, the destination field and the more Information button
     */
    bindEvents() {
        this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
        document.getElementById('destination').addEventListener('blur', (event) => this.geocodeDestination(event.target.value));
        this.moreInfoBtn.addEventListener('click', () => this.showMoreInfo());
    }

    /**
     * Validates the input fields and checks if there is at least one activity selected. If all data is valid, store the destination in localStorage. Create a new item in the itinerary, and restart the form. In case of missing data or activities, it shows alerts to the user
     * @param {event} event 
     * @returns empty at the end of validation
     */
    handleFormSubmit(event) {
        event.preventDefault();

        const destination = document.getElementById('destination').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const selectedActivities = this.selectedPlaces.join(', ');

        if (!destination || !startDate || !endDate) {
            alert("Por favor, completa todos los campos antes de planificar el viaje.");
            return;
        }

        if (this.selectedPlaces.length === 0) {
            alert("Por favor, selecciona al menos una actividad.");
            return;
        }

        localStorage.setItem('destination', destination);

        this.createItineraryItem(destination, startDate, endDate, selectedActivities);

        this.refreshActivityList();
    }
    
    /**
     * Reset the list of activities
     */
    refreshActivityList() {
        this.form.reset();
        this.activitiesList.innerHTML = '';
        this.planTripBtn.disabled = true;
        this.selectedPlaces = [];
        this.activitiesCoordinates = [];
    }

    /**
     * Creates an itinerary element that includes the destination, start and end date (in "DD/MM/YYYY" format), and a numbered list of selected activities. Adds a button to delete the created itinerary
     * @param {string} destination 
     * @param {string} startDate 
     * @param {string} endDate 
     * @param {Array<string>} activities 
     */
    createItineraryItem(destination, startDate, endDate, activities) {
        const itineraryItem = document.createElement('div');
        itineraryItem.classList.add('itinerary-item');

        const formattedStartDate = this.formatDate(startDate);
        const formattedEndDate = this.formatDate(endDate);

        const activitiesListHtml = this.selectedPlaces.map((place, index) => `<li>${index + 1}. ${place}</li>`).join('');

        this.createTripCard(itineraryItem, destination, formattedStartDate, formattedEndDate, activitiesListHtml);

        this.itineraryList.appendChild(itineraryItem);

        const deleteBtn = itineraryItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => this.deleteItinerary(itineraryItem));
    }

    /**
     * Formats the date in day, month and year
     * @param {string} dateString 
     * @returns returns the date in DD/MM/YYYY
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * Create a travel card with the list of activities
     * @param {HTMLElement} itineraryItem 
     * @param {string} destination 
     * @param {string} formattedStartDate 
     * @param {string} formattedEndDate 
     * @param {string} activitiesListHtml 
     */
    createTripCard(itineraryItem, destination, formattedStartDate, formattedEndDate, activitiesListHtml) {
        itineraryItem.innerHTML = `
            <h3>Destino: ${destination}</h3>
            <p><strong>Fecha de inicio:</strong> ${formattedStartDate}</p>
            <p><strong>Fecha de fin:</strong> ${formattedEndDate}</p>
            <p><strong>Actividades seleccionadas:</strong></p>
            <ul>${activitiesListHtml}</ul>
            <button class="delete-btn">Eliminar</button>
        `;
    }

    /**
     * Geocodes the name of a destination to obtain its latitude and longitude. Use the Nominatim API to find the destination coordinates. If coordinates are found, center the map on the location and add a marker. It also clears the list of previous activities and loads activity images
     * @param {string} destination 
     */
    geocodeDestination(destination) {
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`;

        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                console.log('Geocoding response:', data);
                if (data.length > 0) {
                    this.addMapPosittion(data, destination);
                } else {
                    alert('No se encontró el destino.');
                }
            })
            .catch(error => {
                console.error('Error al obtener la ubicación:', error);
                alert('Ocurrió un error al intentar encontrar la ubicación.');
            });
    }

    /**
     * Adds the position on the map and displays a marker at the destination. Then, clears the activity list and uploads new activity images for the destination
     * @param {Array<Object>} data 
     * @param {string} destination 
     */
    addMapPosittion(data, destination) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        this.mapHandler.setView(lat, lon);
        this.mapHandler.addMarker(lat, lon, destination);
        this.activitiesList.innerHTML = '';
        this.fetchActivitiesImages(destination);
    }

    /**
     * Obtains and displays places of interest related to a destination. Updates the list of activities with a load message, then fetches the activities using the `ActivityFetcher` class. If activities are found, it displays them; If not, it displays a message indicating that there are no results
     * @param {string} destination 
     */
    fetchActivitiesImages(destination) {
        this.activitiesList.innerHTML = '<p>Cargando sitios de interés...</p>';

        ActivityFetcher.fetchActivities(destination)
            .then(places => {
                this.activitiesList.innerHTML = '';
                if (places.length > 0) {
                    this.displayInterestSites(places);
                } else {
                    this.activitiesList.innerHTML = 'No se encontraron sitios de interés para este destino.';
                }
            })
            .catch(error => {
                console.error('Error al obtener los sitios de interés:', error);
                this.activitiesList.innerHTML = 'Ocurrió un error al obtener los sitios de interés: ' + error.message;
            });
    }

    /**
     * Displays places of interest in the activities list and adds checkboxes so the user can select specific activities. Update the coordinates of the activities and establish event listeners for each box
     * @param {Array<Object>} places 
     */
    displayInterestSites(places) {
        this.activitiesCoordinates = [];

        places.forEach((place, index) => {
            const placeName = place.name;
            const lat = place.geocodes.main.latitude;
            const lon = place.geocodes.main.longitude;

            const checkbox = this.createInputSite(placeName, index, lat, lon);

            const label = this.createLabelSite(index, placeName);

            this.insertSite(checkbox, label);

            
        });
    }
    
    insertSite(checkbox, label) {
        const div = document.createElement('div');
        div.classList.add('activity-item');
        div.appendChild(checkbox);
        div.appendChild(label);
        this.activitiesList.appendChild(div);
        }

    createLabelSite(index, placeName) {
        const label = document.createElement('label');
        label.htmlFor = `place-${index}`;
        label.textContent = placeName;
        return label;
    }

    createInputSite(placeName, index, lat, lon) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = placeName;
        checkbox.id = `place-${index}`;
        checkbox.addEventListener('change', () => this.handleCheckboxChange(checkbox, placeName, lat, lon, index));
        return checkbox;
    }

    /**
     * Handle the change of state of the checkboxes (checked or unchecked) for the selected activities. Update lists of selected activities and their coordinates, manage markers on the map and shows an error if the 10 selected activities are exceeded
     * @param {HTMLInputElement} checkbox 
     * @param {string} placeName 
     * @param {number} lat 
     * @param {number} lon 
     * @param {number} index 
     */
    handleCheckboxChange(checkbox, placeName, lat, lon, index) {
        if (checkbox.checked) {
            if (this.selectedPlaces.length < 10) {
                this.selectedPlaces.push(placeName);
                this.activitiesCoordinates.push({ lat, lon, name: placeName });
                this.mapHandler.addActivityMarker(lat, lon, placeName, this.selectedPlaces.length); // Usar la longitud actual como índice
                this.selectionError.style.display = 'none';
            } else {
                checkbox.checked = false;
                this.selectionError.style.display = 'block';
            }
        } else {
            const idx = this.selectedPlaces.indexOf(placeName);
            if (idx > -1) {
                this.selectedPlaces.splice(idx, 1);
                this.activitiesCoordinates = this.activitiesCoordinates.filter(coord => coord.name !== placeName);
            }
            this.selectionError.style.display = 'none';
            this.mapHandler.removeActivityMarkers();

            this.activitiesCoordinates.forEach((coord, i) =>
                this.mapHandler.addActivityMarker(coord.lat, coord.lon, coord.name, i + 1)
            );
        }

        this.planTripBtn.disabled = this.selectedPlaces.length === 0;
    }

    /**
     * Redirects the user to the more information page
     */
    showMoreInfo() {
        window.location.href = 'masinformacion.html';
    }

    /**
     * Removes the itinerary item from the activity list, removes the map marker if it exists, and resets the map marker variable to `null`.
     * @param {HTMLElement} itineraryItem 
     */
    deleteItinerary(itineraryItem) {
        itineraryItem.remove();
        if (this.mapHandler.marker) {
            this.mapHandler.marker.remove();
            this.mapHandler.marker = null;
        }
    }
}

export default TripPlanner;
