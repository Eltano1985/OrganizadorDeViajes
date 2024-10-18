class ActivityFetcher {
    static fetchActivities(lat, lon) {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:5000,${lat},${lon})[tourism];out;`;
  
        return fetch(overpassUrl)
            .then(response => response.json())
            .catch(error => {
                console.error('Error al obtener las actividades:', error);
                throw new Error('Ocurrió un error al obtener las actividades.');
            });
    }
  }

export default  ActivityFetcher