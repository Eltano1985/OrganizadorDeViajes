class MapHandler {
    constructor(mapId) {
        this.map = L.map(mapId).setView([20.5937, 78.9629], 5);
        this.marker = null;
        this.activityMarkers = [];

        /**
        * Adds an OpenStreetMap map layer to the map object
        */
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);
    }

    /**
     * Adds a marker on the map at the provided latitude and longitude coordinates. If a marker already exists on the map, it deletes it before adding the new marker
     * @param {number} lat 
     * @param {number} lon 
     * @param {string} destination 
     */
    addMarker(lat, lon, destination) {
        if (this.marker) {
            this.marker.remove();
        }
        this.marker = L.marker([lat, lon]).addTo(this.map).bindPopup(`Destino: ${destination}`).openPopup();
    }

    /**
     * Adds a marker on the map for a selected activity at the provided latitude and longitude coordinates. The marker includes a popup that shows the name of the activity and its index in the list
     * @param {number} lat 
     * @param {number} lon 
     * @param {string} placeName 
     * @param {number} index 
     */
    addActivityMarker(lat, lon, placeName, index) {
        const activityMarker = L.marker([lat, lon]).addTo(this.map).bindPopup(`Actividad ${index}: ${placeName}`);
        this.activityMarkers.push(activityMarker);
    }
    
    /**
     * Removes all activity markers from the map and cleans the array that stores them
     */
    removeActivityMarkers() {
        this.activityMarkers.forEach(marker => marker.remove());
        this.activityMarkers = [];
    }

    /**
     * Sets the map view to a specific latitude and longitude coordinates with a zoom level fixed to 12
     * @param {number} lat 
     * @param {number} lon 
     */
    setView(lat, lon) {
        this.map.setView([lat, lon], 12);
    }
}

export default MapHandler;
