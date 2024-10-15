// Inicializar el mapa centrado en una ubicación por defecto (puedes cambiar la latitud y longitud)
const map = L.map('map').setView([20.5937, 78.9629], 5); // Coordenadas de India como ejemplo

// Cargar las capas de los mapas desde OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Manejador del formulario
const form = document.getElementById('itinerary-form');
const itineraryList = document.getElementById('itinerary-list');
let marker; // Variable para almacenar el marcador

form.addEventListener('submit', function(event) {
  event.preventDefault();

  // Capturar los valores del formulario
  const destination = document.getElementById('destination').value;
  const startDate = document.getElementById('start-date').value;
  const endDate = document.getElementById('end-date').value;
  const activities = document.getElementById('activities').value;

  // Crear un nuevo itinerario
  const itineraryItem = document.createElement('div');
  itineraryItem.classList.add('itinerary-item');
  itineraryItem.innerHTML = `
    <h3>Destino: ${destination}</h3>
    <p><strong>Fecha de inicio:</strong> ${startDate}</p>
    <p><strong>Fecha de fin:</strong> ${endDate}</p>
    <p><strong>Actividades:</strong> ${activities}</p>
    <button class="delete-btn">Eliminar</button>
  `;

  // Agregar el itinerario a la lista
  itineraryList.appendChild(itineraryItem);
  form.reset();

  // Función para ubicar el destino
  const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`;

  // Llamada a la API de OpenStreetMap Nominatim para obtener las coordenadas
  fetch(geocodeUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        const lat = data[0].lat;
        const lon = data[0].lon;

        // Centrar el mapa en las coordenadas obtenidas
        map.setView([lat, lon], 12);

        // Eliminar marcador anterior si existe
        if (marker) {
          marker.remove();
        }

        // Añadir un marcador en la nueva ubicación
        marker = L.marker([lat, lon]).addTo(map).bindPopup(`Destino: ${destination}`).openPopup();
      } else {
        alert('No se encontró el destino.');
      }
    })
    .catch(error => {
      console.error('Error al obtener la ubicación:', error);
      alert('Ocurrió un error al intentar encontrar la ubicación.');
    });

  // Eliminar itinerario y marcador
  const deleteBtn = itineraryItem.querySelector('.delete-btn');
  deleteBtn.addEventListener('click', function() {
    itineraryItem.remove();
    if (marker) {
      marker.remove(); // Elimina el marcador del mapa
    }
  });
});

