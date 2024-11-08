class Destination {
    constructor(name) {
        this.name = name;
        this.geoNamesUsername = 'eamoresano85';
        this.restCountriesApiUrl = 'https://restcountries.com/v3.1/name/';
    }

    /**
     Loads data for the selected destination, including the destination name, corresponding country, additional information, and a carousel of images 
     * @returns empty when destination is not entered
     */
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

    /**
     Display the target name in two DOM elements
     */
    displayDestinationName() {
        document.getElementById('destino-titulo').innerText = this.name;
        document.getElementById('destino-titulo2').innerText = this.name;
    }

    /**
     Gets the country name corresponding to the destination using the GeoNames API
     * @returns the country name if found, or "null" if an error occurs while fetching the data
     */
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

    /**
     Gets a country's language and currency information from the Rest Countries API
     * @param {string} country name to obtain the information
     * @returns the language and currency in Spanish if it finds the country, otherwise it returns "No disponible" for both.
     */
    async getCountryData(country) {
        if (!country) return { language: "No disponible", currency: "No disponible" };

        try {
            const response = await fetch(`${this.restCountriesApiUrl}${encodeURIComponent(country)}`);
            if (!response.ok) throw new Error("Error al obtener datos del país");

            const data = await response.json();
            // Verificar si el español está en los idiomas disponibles y establecerlo como idioma oficial
            const languages = Object.values(data[0].languages);
            let language = languages.includes("Spanish") || languages.includes("Español") ? "Español" : this.getLanguageInSpanish(languages[0] || 'No disponible');
            const currency = this.getCurrencyInSpanish(data[0].currencies[Object.keys(data[0].currencies)[0]].name || 'No disponible');

            return { language, currency };
        } catch (error) {
            console.error("Error al obtener datos del país:", error);
            return { language: "No disponible", currency: "No disponible" };
        }
    }


    /**
     Translates an english language name to its equivalent in spanish
     * @param {string} language name in english 
     * @returns the name of the language in spanish
     */
    getLanguageInSpanish(language) {
        const languagesInSpanish = {
            "English": "Inglés",
            "Spanish": "Español",
            "French": "Francés",
            "German": "Alemán",
            "Portuguese": "Portugués"
        };
        return languagesInSpanish[language] || language;
    }

    /**
     Convert the name of a currency in english to its equivalent in spanish
     * @param {string} currency name in english that you want to convert to spanish 
     * @returns the name of the currency in spanish
     */
    getCurrencyInSpanish(currency) {
        const currenciesInSpanish = {
            "Dollar": "Dólar",
            "Euro": "Euro",
            "Pound": "Libra",
            "Yen": "Yen",
            "Peso": "Peso",
            "Brazilian real": "Real",
            "Uruguayan peso": "peso uruguayo",
            "Mexican peso": "peso mexicano"
        };
        return currenciesInSpanish[currency] || currency;
    }

    /**
     Display a summary of the destination taken from Wikipedia and information about the language and currency
     * @param {string} param0 the official language and official currency of the destination in spanish
     */
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
