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
     * Binds event listeners to various interface elements. Configures event listeners for the following interactions: the form submit event is handled by `handleFormSubmit` when the user submits the form, the `blur` event on the destination input triggers the `geocodeDestination` function to process the entered value, and the "More Info" button click event triggers the "showMoreInfo" function to display additional information
     * @returns {void}
     */
    bindEvents() {
        this.form.addEventListener('submit', (event) => this.handleFormSubmit(event));
        document.getElementById('destination').addEventListener('blur', (event) => this.geocodeDestination(event.target.value));
        this.moreInfoBtn.addEventListener('click', () => this.showMoreInfo());
    }

    /**
     * Responsible for sending the trip planning form. This feature bypasses the default form submission behavior, validating input fields to ensure all required information is provided (destination, start date, end date, and selected activities). If any fields are missing, an alert is displayed. If the input is valid, the destination is saved to "localStorage", an itinerary item is created with the selected information, and the activity list is updated
     * @param {Event} event - The submit event triggered by the form
     * @returns {void}
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
     * Resets the activity list and clears the form fields. This function performs the following actions: resets the form fields to their default values, clears the list of activities displayed in the user interface, disables the "Plan Trip" button to prevent further actions, and clears the selected places and arrays of activity coordinates to reset the state
     * @returns {void}
     */
    refreshActivityList() {
        this.form.reset();
        this.activitiesList.innerHTML = '';
        this.planTripBtn.disabled = true;
        this.selectedPlaces = [];
        this.activitiesCoordinates = [];
    }

    /**
     * Creates and adds a new itinerary item to the itinerary list. This function creates a new `div` element to represent a single itinerary item, formats the start and end dates, generates an HTML list of selected activities and adds the item to the itinerary list. It also sets an event listener on the Delete button to remove the item from the itinerary when it is clicked
     * @param {string} destination - The destination of the trip
     * @param {string} startDate - The start date of the trip
     * @param {string} endDate - The end date of the trip
     * @param {string} activities - A list of activities for the trip
     * @returns {void}
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
     * Formats a date string in the format "DD/MM/YYYY". This function takes a date string, converts it to a "Date" object, and then formats it to a string in the format "DD/MM/YYYY". If the day or month is a single digit, add a leading zero
     * @param {string} dateString - The date string to format
     * @returns {string} the formatted date string in the format "DD/MM/YYYY"
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    /**
     * This function creates an HTML structure for a travel card, inserting the destination, start and end dates, and a list of selected activities into the itinerary element. It also adds a delete button to allow deletion of the item from the itinerary
     * @param {HTMLElement} itineraryItem - The HTML element representing the itinerary item to be populated
     * @param {string} destination - The destination of the trip
     * @param {string} formattedStartDate The formatted start date of the trip (in "DD/MM/YYYY" format)
     * @param {string} formattedEndDate - The formatted end date of the trip (in "DD/MM/YYYY" format)
     * @param {string} activitiesListHtml - The HTML string representing the list of selected activities
     * @returns {void}
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
    
    /**
     * This function creates a `div` container for a site of interest and then adds the `checkbox` and `label` elements to the container. Finally, it inserts the container into the activity list
     * @param {HTMLElement} checkbox 
     * @param {HTMLElement} label 
     */
    insertSite(checkbox, label) {
        const div = document.createElement('div');
        div.classList.add('activity-item');
        div.appendChild(checkbox);
        div.appendChild(label);
        this.activitiesList.appendChild(div);
        }
    
    /**
     * Creates and returns a label element for a location of interest
     * @param {number} index 
     * @param {string} placeName 
     * @returns {HTMLLabelElement}
     */
    createLabelSite(index, placeName) {
        const label = document.createElement('label');
        label.htmlFor = `place-${index}`;
        label.textContent = placeName;
        return label;
    }

    /**
     * Creates an `input` checkbox configured with a unique ID and a value corresponding to the site name. A `change` event is also added to it that calls `handleCheckboxChange` when its selected state is changed.
     * @param {string} placeName 
     * @param {number} index 
     * @param {number} lat 
     * @param {number} lon 
     * @returns {HTMLInputElement}
     */
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
     * @param {HTMLInputElement} checkbox of the activity
     * @param {string} placeName of the activity
     * @param {number} lat of the activity site
     * @param {number} lon of the activity
     */
    handleCheckboxChange(checkbox, placeName, lat, lon) {
        if (checkbox.checked) {
            this.limitActivityList(placeName, lat, lon, checkbox);
        } else {
            const positionPlace = this.selectedPlaces.indexOf(placeName);
            this.removePlace(positionPlace, placeName);
            this.selectionError.style.display = 'none';
            this.mapHandler.removeActivityMarkers();

            this.activitiesCoordinates.forEach((coord, i) =>
                this.mapHandler.addActivityMarker(coord.lat, coord.lon, coord.name, i + 1)
            );
        }

        this.planTripBtn.disabled = this.selectedPlaces.length === 0;
    }

    removePlace(positionPlace, placeName) {
        if (positionPlace > -1) {
            this.selectedPlaces.splice(positionPlace, 1);
            this.activitiesCoordinates = this.activitiesCoordinates.filter(coord => coord.name !== placeName);
        }
    }

    limitActivityList(placeName, lat, lon, checkbox) {
        if (this.selectedPlaces.length < 10) {
            this.selectedPlaces.push(placeName);
            this.activitiesCoordinates.push({ lat, lon, name: placeName });
            this.mapHandler.addActivityMarker(lat, lon, placeName, this.selectedPlaces.length);
            this.selectionError.style.display = 'none';
        } else {
            checkbox.checked = false;
            this.selectionError.style.display = 'block';
        }
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
