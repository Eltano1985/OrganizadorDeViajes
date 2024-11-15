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
     * @param {string} destination - The name of the destination to be geocoded
     * @returns {void} If the destination is found, call the `addMapPosition` method to add the marker to the map. If the destination is not found: Display an alert stating "Destination not found"
     * @throws {Error} Displays an alert stating "an error occurred while trying to find the location"
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
     * @param {Array<Object>} data - Data returned by the Geocoding API, including geographic coordinates*
     * @param {string} destination - The name of the destination associated with the coordinates
     * @returns {void}
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
     * Gets and displays places of interest related to a destination. Updates the list of activities with a load message, then fetches the activities using the `ActivityFetcher` class. If activities are found, it displays them; If not, it displays a message indicating that there are no results
     * @param {string} destination - The name of the destination to search for places of interest
     * @returns {void}
     * @throws {Error} Error in API request: Displays a message in the interface with the error that occurred
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
     * Takes a list of places of interest and clears the current list of coordinates stored in `this.activitiesCoordinates`. Iterates over each site in the list and dynamically generates HTML elements to display a checkbox for selecting the site and a label with the name of the site. Inserts these elements into the interface using `insertSite`.
     * @param {Array<Object>} places - List of places of interest, where each place contains information such as name and geographic coordinates
     * @returns {void}
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
     * @param {HTMLElement} checkbox - Checkbox input element to select the site
     * @param {HTMLElement} label - Label associated with the checkbox that displays the name of the site
     * @returns {void}
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
     * @param {number} index - Unique index that identifies the site, used to associate the `label` with an input element.
     * @param {string} placeName - Nombre del sitio de interés que se mostrará en la etiqueta
     * @returns {HTMLLabelElement} The `label` element set with the corresponding text and `htmlFor` attribute
     */
    createLabelSite(index, placeName) {
        const label = document.createElement('label');
        label.htmlFor = `place-${index}`;
        label.textContent = placeName;
        return label;
    }

    /**
     * Creates an `input` checkbox configured with a unique ID and a value corresponding to the site name. A `change` event is also added to it that calls `handleCheckboxChange` when its selected state is changed.
     * @param {string} placeName - Name of the site of interest, which will be used as the value of the checkbox
     * @param {number} index - Unique index that identifies the checkbox and associates its ID with a `label`
     * @param {number} lat - Latitude of the site of interest, used to manage selections
     * @param {number} lon - Longitude of the site of interest, used to drive selections
     * @returns {HTMLInputElement} The checkbox-type `input` element configured with the corresponding values ​​and events
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
     * If the checkbox is selected it calls `limitActivityList` to add the site to the selected list and manage restrictions. If the checkbox is deselected it removes the site from the selected list and from the map, restores the markers of the remaining sites on the map, hides possible selection error messages and enables or disables the "Plan Trip" button (`planTripBtn`) depending on if there are selected sites
     * @param {HTMLInputElement} checkbox - The checkbox that changed state (selected or deselected)
     * @param {string} placeName - Name of the site of interest associated with the checkbox
     * @param {number} lat - Latitude of the site of interest
     * @param {number} lon - Longitude of site of interest
     * @returns {void}
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

    /**
     * Removes a site from both the list (selectedPlaces) and the list of coordinates (activitiesCoordinates). Checks if the given index (`positionPlace`) is valid. If the index is valid (greater than -1), remove the site from the list of selected places. Filters the list of coordinates (`activitiesCoordinates`) to exclude those associated with the deleted site
     * @param {number} positionPlace - Site index in the list of selected places (`selectedPlaces`)
     * @param {string} placeName - Name of the site of interest to be deleted
     * @returns {void}
     */
    removePlace(positionPlace, placeName) {
        if (positionPlace > -1) {
            this.selectedPlaces.splice(positionPlace, 1);
            this.activitiesCoordinates = this.activitiesCoordinates.filter(coord => coord.name !== placeName);
        }
    }

    /**
     * Controls the maximum number of places of interest that can be added to the selected list (`selectedPlaces`). If the list contains fewer than 10 sites add the site name to `selectedPlaces`, add the site coordinates to `activitiesCoordinates`, call `mapHandler.addActivityMarker` to display a site marker on the map, and hide any error messages selection (`selectionError`). If there are already 10 sites selected, uncheck the checkbox associated with the site and display an error message indicating that the limit has been reached.
     * @param {string} placeName - Name of the site of interest you are trying to add to the list 
     * @param {number} lat - Latitude of the site of interest
     * @param {number} lon - Longitude of site of interest
     * @param {HTMLInputElement} checkbox The checkbox associated with the site, which can be unchecked if the limit is reached
     * @returns {void}
     */
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
     * Change the current browser location to the `masinformacion.html` page. Use `window.location.href` to redirect the user to the more information page
     * @returns {void}
     */
    showMoreInfo() {
        window.location.href = 'masinformacion.html';
    }

    /**
     * Removes the element from the DOM itinerary using the `remove()` method. If there is a marker on the map (referenced by `mapHandler.marker`), it removes it from the map. After deleting the marker, the `mapHandler.marker` property is set to `null` to indicate that there is no active marker
     * @param {HTMLElement} itineraryItem - The DOM element that represents the itinerary item to delete
     * @returns {void}
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
