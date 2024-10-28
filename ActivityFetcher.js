class ActivityFetcher {
    static fetchActivities(lat, lon) {
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:5000,${lat},${lon})[tourism];out;`;
        const pexelsApiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1'; // Reemplaza con tu clave API de Pexels
        const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(destination)}&per_page=10&page=1`;

        return Promise.all([
            fetch(overpassUrl).then(response => response.json()),
            fetch(pexelsUrl, {
                headers: {
                    Authorization: pexelsApiKey,
                },
            }).then(response => response.json())
        ]).then(([activitiesData, imagesData]) => {
            return { activitiesData, imagesData };
        }).catch(error => {
            console.error('Error al obtener las actividades o imágenes:', error);
            throw new Error('Ocurrió un error al obtener las actividades o imágenes.');
        });
    }
}
