document.addEventListener("DOMContentLoaded", () => {
    const destino = localStorage.getItem('destinoSeleccionado');
    if (destino) {
        document.getElementById('destino-titulo').innerText = destino;
        document.getElementById('destino-titulo2').innerText = destino;
        cargarResumenDestino(destino);
        cargarImagenesDestino(destino);
    } else {
        alert("No se ha seleccionado ningún destino.");
    }
});

async function obtenerDatosCiudad(ciudad) {
    const username = 'eamoresano85'; // Reemplaza con tu nombre de usuario de GeoNames
    const url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(ciudad)}&maxRows=1&username=${username}`;
    console.log(`Buscando datos de ciudad para: ${ciudad} en la URL: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener datos de la ciudad");

        const data = await response.json();
        console.log("Datos recibidos de GeoNames:", data);

        if (data.geonames.length === 0) {
            console.warn("No se encontró la ciudad en los resultados de GeoNames");
            throw new Error("Ciudad no encontrada");
        }

        const pais = data.geonames[0].countryName;
        console.log(`País encontrado: ${pais}`);
        return pais;
    } catch (error) {
        console.error("Error al obtener datos de la ciudad:", error);
        return null;
    }
}

async function obtenerDatosPais(pais) {
    console.log(`Buscando datos del país: ${pais}`);
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(pais)}`);
        if (!response.ok) throw new Error("Error al obtener datos del país");

        const data = await response.json();
        console.log("Datos recibidos de RestCountries:", data);

        const idioma = data[0].languages[Object.keys(data[0].languages)[0]]; // Idioma principal
        const moneda = data[0].currencies[Object.keys(data[0].currencies)[0]].name; // Moneda

        return { idioma, moneda };
    } catch (error) {
        console.error("Error al obtener datos del país:", error);
        return { idioma: 'No disponible', moneda: 'No disponible' };
    }
}

async function cargarResumenDestino(destino) {
    try {
        const pais = await obtenerDatosCiudad(destino);
        if (!pais) {
            document.getElementById('descripcion-destino').innerText = "No se pudo encontrar el país para la ciudad.";
            return;
        }

        const datosPais = await obtenerDatosPais(pais);

        const response = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(destino)}`);
        if (!response.ok) throw new Error("Error al obtener datos de Wikipedia");

        const data = await response.json();
        const resumen = data.extract;

        const detalles = `
            <p>${resumen}</p>
            <p><strong>Moneda oficial:</strong> ${datosPais.moneda}</p>
            <p><strong>Idioma oficial:</strong> ${datosPais.idioma}</p>
            <p>Para más información, visita la página completa en <a href="https://es.wikipedia.org/wiki/${encodeURIComponent(destino)}" target="_blank">${destino}</a>.</p>
        `;
        document.getElementById('descripcion-destino').innerHTML = detalles;
    } catch (error) {
        console.error("Error al cargar el resumen del destino:", error);
        document.getElementById('descripcion-destino').innerText = "No se pudo cargar la información del destino.";
    }
}

async function cargarImagenesDestino(destino) {
    const apiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1';
    const url = `https://api.pexels.com/v1/search?query=${destino}&per_page=15`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: apiKey }
        });
        const data = await response.json();

        if (data.photos.length === 0) {
            document.getElementById('carousel-image').alt = "No hay imágenes disponibles para este destino.";
            return;
        }

        const images = data.photos.map(photo => photo.src.medium);
        let currentIndex = 0;
        const carouselImage = document.getElementById('carousel-image');

        carouselImage.src = images[currentIndex];

        document.getElementById('next-btn').addEventListener('click', () => {
            currentIndex = (currentIndex + 1) % images.length;
            carouselImage.src = images[currentIndex];
        });

        document.getElementById('prev-btn').addEventListener('click', () => {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            carouselImage.src = images[currentIndex];
        });

    } catch (error) {
        console.error("Error al cargar las imágenes del destino:", error);
    }
}
