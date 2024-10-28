class MapHandler {
    constructor(mapId) {
        this.map = L.map(mapId).setView([20.5937, 78.9629], 5); // Coordenadas iniciales (India)
        this.marker = null;
        this.activityMarkers = []; // Array para almacenar marcadores de actividades
  
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
  
    addActivityMarker(lat, lon, placeName) {
        // Añadir un marcador para actividades seleccionadas
        const activityMarker = L.marker([lat, lon]).addTo(this.map).bindPopup(placeName);
        this.activityMarkers.push(activityMarker); // Almacenar el marcador en el array
    }
  
    setView(lat, lon) {
        this.map.setView([lat, lon], 12);
    }

    // Método para eliminar todos los marcadores de actividades
    clearActivityMarkers() {
        this.activityMarkers.forEach(marker => marker.remove());
        this.activityMarkers = []; // Resetear el array
    }
}

export default MapHandler;
