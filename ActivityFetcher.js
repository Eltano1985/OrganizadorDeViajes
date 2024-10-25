class ActivityFetcher {
    static fetchActivities(destination) {
        const apiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1'; // Reemplaza con tu clave de API de Pexels
        const url = `https://api.pexels.com/v1/search?query=${destination}&per_page=10`;

        return fetch(url, {
            headers: {
                Authorization: apiKey
            }
        })
        .then(response => response.json())
        .then(data => data.photos) // Asegúrate de que el resultado sea un array de fotos
        .catch(error => {
            console.error('Error al obtener las actividades:', error);
            throw new Error('Ocurrió un error al obtener las imágenes del destino.');
        });
    }
}

export default ActivityFetcher;
