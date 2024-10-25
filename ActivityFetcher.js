class ActivityFetcher {
    static async fetchActivities(destination) {
        const apiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1'; // Reemplaza con tu clave de API de Pexels
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(destination)}&per_page=10`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: apiKey
                }
            });
            if (!response.ok) {
                throw new Error(`Error en la respuesta: ${response.statusText}`);
            }
            const data = await response.json();
            return data.photos || []; // Retorna un array vacío si no hay fotos
        } catch (error) {
            console.error('Error al obtener las actividades:', error);
            throw new Error('Ocurrió un error al obtener las imágenes del destino.');
        }
    }
}

export default ActivityFetcher;
