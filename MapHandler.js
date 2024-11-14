class MapHandler {
    constructor(mapId) {
        this.map = L.map(mapId).setView([20.5937, 78.9629], 5);
        this.marker = null;
        this.activityMarkers = [];

        /**
        * Adds an OpenStreetMap tile layer to the map. Uses the OpenStreetMap tile server to display map tiles in the "map" object. The tile layer URL format includes placeholders for subdomain (`{s}`), zoom level (`{z}`), x coordinate (`{x}`), and y coordinate (`{y}`). Attribution is provided based on OpenStreetMap requirements
        * @param {string} url - The URL template for the OpenStreetMap tile server
        * @param {Object} options - Configuration options for the tile layer
        * @param {string} options.attribution - HTML string for OpenStreetMap attribution
        * @returns {L.TileLayer} The created tile layer, added to the `map` object
        */
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    /**
     * Adds a marker to the map at the specified latitude and longitude. If a bookmark already exists, it is deleted before adding a new one. The marker is added to the map at the specified coordinates and a pop-up window is linked to the marker with the provided destination name. Popup opens automatically once bookmark is added
     * @param {number} lat - The latitude of the location where the marker will be placed
     * @param {number} lon - The longitude of the location where the marker will be placed
     * @param {string} destination The name of the destination to be displayed in the popup
     * @returns {void}
     */
    addMarker(lat, lon, destination) {
        if (this.marker) {
            this.marker.remove();
        }
        this.marker = L.marker([lat, lon]).addTo(this.map).bindPopup(`Destino: ${destination}`).openPopup();
    }

    /**
     * Adds an activity marker to the map at the specified latitude and longitude. Creates a new marker at the provided coordinates, links to a popup showing the activity name and index, and adds the marker to an internal list ("activityMarkers")
     * @param {number} lat - The latitude of the activity location where the marker will be placed
     * @param {number} lon - The longitude of the activity location where the marker will be placed
     * @param {string} placeName - The name of the activity to be displayed in the popup
     * @param {number} index - The index of the activity in the list (used for identifying the activity)
     * @returns {void}
     */
    addActivityMarker(lat, lon, placeName, index) {
        const activityMarker = L.marker([lat, lon]).addTo(this.map).bindPopup(`Actividad ${index}: ${placeName}`);
        this.activityMarkers.push(activityMarker);
    }
    
    /**
     * Removes all activity markers from the map and clears the list of activity markers. Loops through all markers stored in the `activityMarkers` array and removes them from the map. After deleting all markers, clear the `activityMarkers` array to reset the list
     * @returns {void}
     */
    removeActivityMarkers() {
        this.activityMarkers.forEach(marker => marker.remove());
        this.activityMarkers = [];
    }

    /**
     * Changes the center of the map to the specified latitude and longitude and sets the zoom level. Updates the center of the map to the given coordinates (`lat`, `lon`) and sets the zoom level to 12. This function is used to adjust the map viewport to focus on a new location
     * @param {number} lat - The latitude of the new map center
     * @param {number} lon - The longitude of the new map center
     * @returns {void}
     */
    setView(lat, lon) {
        this.map.setView([lat, lon], 12);
    }
}

export default MapHandler;
