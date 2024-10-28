class ActivityFetcher {
    static fetchActivities(destination) {
        const foursquareApiKey = 'fsq3LTq26zit3XsJ0g36ORlV5EShWfAlN0zh0YUPPAjE+RE='; // Reemplaza con tu clave de Foursquare
        const url = `https://api.foursquare.com/v3/places/search?near=${encodeURIComponent(destination)}&limit=15`;

        return fetch(url, {
            headers: {
                Authorization: foursquareApiKey,
                'Accept': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en la respuesta de la API: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => data.results) // Asegúrate de que el resultado sea un array de lugares
        .catch(error => {
            console.error('Error al obtener las actividades:', error);
            throw new Error('Ocurrió un error al obtener los sitios de interés.');
        });
    }
}

export default ActivityFetcher;
