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

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener datos de la ciudad");
        
        const data = await response.json();
        if (data.geonames.length === 0) throw new Error("Ciudad no encontrada");

        // Extraer país de los datos de la ciudad
        const pais = data.geonames[0].countryName; // Obtén el nombre del país desde la respuesta
        return pais;

    } catch (error) {
        console.error("Error al obtener datos de la ciudad:", error);
        return null;
    }
}


async function obtenerDatosPais(pais) {
    const traduccionesIdiomas = {
        "English": "Inglés",
        "French": "Francés",
        "Spanish": "Español",
        "German": "Alemán",
        "Portuguese": "Portugués",
        "Italian": "Italiano",
        "Dutch": "Neerlandés",
        "Russian": "Ruso",
        "Chinese": "Chino",
        "Japanese": "Japonés",
        "Arabic": "Árabe",
        "Hindi": "Hindi",
        "Bengali": "Bengalí",
        "Korean": "Coreano",
        "Turkish": "Turco",
        "Swedish": "Sueco",
        "Polish": "Polaco"
        // Agrega más traducciones según sea necesario
    };

    const traduccionesMonedas = {
        "Euro": "Euro",
        "United States dollar": "Dólar estadounidense",
        "Pound sterling": "Libra esterlina",
        "Yen": "Yen",
        "Swiss franc": "Franco suizo",
        "Canadian dollar": "Dólar canadiense",
        "Australian dollar": "Dólar australiano",
        "Brazilian real": "Real brasileño",
        "Mexican peso": "Peso mexicano",
        "Russian ruble": "Rublo ruso",
        "Indian rupee": "Rupia india",
        "Chinese yuan": "Yuan chino",
        "Turkish lira": "Lira turca",
        "South African rand": "Rand sudafricano"
        // Agrega más traducciones según sea necesario
    };

    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(pais)}`);
        if (!response.ok) throw new Error("Error al obtener datos del país");

        const data = await response.json();
        const idiomasDisponibles = data[0].languages;
        
        // Priorizar el español si está disponible
        const idioma = idiomasDisponibles['spa'] ? traduccionesIdiomas['Spanish'] : 
                        traduccionesIdiomas[Object.keys(idiomasDisponibles)[0]] || 'No disponible';

        const monedaOriginal = data[0].currencies[Object.keys(data[0].currencies)[0]].name;
        const moneda = traduccionesMonedas[monedaOriginal] || monedaOriginal;

        return { idioma, moneda };
    } catch (error) {
        console.error("Error al obtener datos del país:", error);
        return { idioma: 'No disponible', moneda: 'No disponible' };
    }
}


async function cargarResumenDestino(destino) {
    let pais = "No se encontró el país"; // Valor predeterminado
    let datosPais = { idioma: "No disponible", moneda: "No disponible" }; // Valores predeterminados

    try {
        // Intentar obtener el país de la ciudad
        pais = await obtenerDatosCiudad(destino) || pais;
        
        // Obtener el idioma y moneda del país
        datosPais = await obtenerDatosPais(pais);

    } catch (error) {
        console.error("Error al obtener datos de la ciudad o país:", error);
    }

    try {
        // Intentar obtener el resumen de Wikipedia
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
        
        // Mensaje alternativo que se mostrará si hay algún error
        const mensajeAlternativo = `
            <p>No se pudo cargar la información de ${destino}.</p>
            <p>Aún puedes disfrutar de imágenes de este hermoso lugar.</p>
            <p><strong>Moneda oficial:</strong> ${datosPais.moneda}</p>
            <p><strong>Idioma oficial:</strong> ${datosPais.idioma}</p>
        `;
        
        document.getElementById('descripcion-destino').innerHTML = mensajeAlternativo;
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
