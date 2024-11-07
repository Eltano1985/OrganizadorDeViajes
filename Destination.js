class Destination {
    constructor(name) {
        this.name = name;
        this.geoNamesUsername = 'eamoresano85';
        this.restCountriesApiUrl = 'https://restcountries.com/v3.1/name/';
    }

    async loadDestinationData() {
        if (!this.name) {
            alert("No se ha seleccionado ningún destino.");
            return;
        }

        this.displayDestinationName();
        const country = await this.getCountry();
        const countryData = await this.getCountryData(country);

        await this.displaySummary(countryData);
        const imageCarousel = new ImageCarousel(this.name, this.pexelsApiKey);
        imageCarousel.loadImages();
    }

    displayDestinationName() {
        document.getElementById('destino-titulo').innerText = this.name;
        document.getElementById('destino-titulo2').innerText = this.name;
    }

    async getCountry() {
        const url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(this.name)}&maxRows=1&username=${this.geoNamesUsername}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Error al obtener datos de la ciudad");

            const data = await response.json();
            if (data.geonames.length === 0) throw new Error("Ciudad no encontrada");

            return data.geonames[0].countryName;
        } catch (error) {
            console.error("Error al obtener datos de la ciudad:", error);
            return null;
        }
    }

    async getCountryData(country) {
        if (!country) return { language: "No disponible", currency: "No disponible" };

        try {
            const response = await fetch(`${this.restCountriesApiUrl}${encodeURIComponent(country)}`);
            if (!response.ok) throw new Error("Error al obtener datos del país");

            const data = await response.json();
            const language = this.getLanguageInSpanish(Object.values(data[0].languages)[0] || 'No disponible');
            const currency = this.getCurrencyInSpanish(data[0].currencies[Object.keys(data[0].currencies)[0]].name || 'No disponible');

            return { language, currency };
        } catch (error) {
            console.error("Error al obtener datos del país:", error);
            return { language: "No disponible", currency: "No disponible" };
        }
    }

    getLanguageInSpanish(language) {
        const languagesInSpanish = {
            "English": "Inglés",
            "Spanish": "Español",
            "French": "Francés",
            "German": "Alemán",
            // Agrega otros idiomas aquí según sea necesario
        };
        return languagesInSpanish[language] || language;
    }

    getCurrencyInSpanish(currency) {
        const currenciesInSpanish = {
            "Dollar": "Dólar",
            "Euro": "Euro",
            "Pound": "Libra",
            "Yen": "Yen",
            "Peso": "Peso",
            // Agrega otras monedas aquí según sea necesario
        };
        return currenciesInSpanish[currency] || currency;
    }

    async displaySummary({ language, currency }) {
        try {
            const response = await fetch(`https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(this.name)}`);
            if (!response.ok) throw new Error("Error al obtener el resumen de Wikipedia");

            const data = await response.json();
            const summaryHtml = `
                <p>${data.extract}</p>
                <p><strong>Moneda oficial:</strong> ${currency}</p>
                <p><strong>Idioma oficial:</strong> ${language}</p>
                <p>Para más información, visita la página completa <a href="https://es.wikipedia.org/wiki/${encodeURIComponent(this.name)}" target="_blank">${this.name}</a>.</p>
            `;
            document.getElementById('descripcion-destino').innerHTML = summaryHtml;
        } catch (error) {
            console.error("Error al cargar el resumen del destino:", error);
            document.getElementById('descripcion-destino').innerHTML = `
                <p>No se pudo encontrar información de ${this.name}.</p>
                <p>Igual puedes disfrutar imágenes de este precioso lugar.</p>
                <p><strong>Moneda oficial:</strong> ${currency}</p>
                <p><strong>Idioma oficial:</strong> ${language}</p>
            `;
        }
    }
}

export default Destination;
