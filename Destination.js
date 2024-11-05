class Destination {
    constructor(name) {
        this.name = name;
        this.geoNamesUsername = 'eamoresano85';
        this.pexelsApiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1';
        this.restCountriesApiUrl = 'https://restcountries.com/v3.1/name/';
    }

    async loadDestinationData() {
        if (!this.name) {
            alert("No destination selected.");
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
            if (!response.ok) throw new Error("Error fetching city data");

            const data = await response.json();
            if (data.geonames.length === 0) throw new Error("City not found");

            return data.geonames[0].countryName;
        } catch (error) {
            console.error("Error fetching city data:", error);
            return null;
        }
    }

    async getCountryData(country) {
        if (!country) return { language: "Unavailable", currency: "Unavailable" };

        try {
            const response = await fetch(`${this.restCountriesApiUrl}${encodeURIComponent(country)}`);
            if (!response.ok) throw new Error("Error fetching country data");

            const data = await response.json();
            const language = Object.values(data[0].languages)[0] || 'Unavailable';
            const currency = data[0].currencies[Object.keys(data[0].currencies)[0]].name || 'Unavailable';

            return { language, currency };
        } catch (error) {
            console.error("Error fetching country data:", error);
            return { language: "Unavailable", currency: "Unavailable" };
        }
    }

    async displaySummary({ language, currency }) {
        try {
            const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(this.name)}`);
            if (!response.ok) throw new Error("Error fetching Wikipedia summary");

            const data = await response.json();
            const summaryHtml = `
                <p>${data.extract}</p>
                <p><strong>Official currency:</strong> ${currency}</p>
                <p><strong>Official language:</strong> ${language}</p>
                <p>For more information, visit the full page on <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(this.name)}" target="_blank">${this.name}</a>.</p>
            `;
            document.getElementById('descripcion-destino').innerHTML = summaryHtml;
        } catch (error) {
            console.error("Error loading destination summary:", error);
            document.getElementById('descripcion-destino').innerHTML = `
                <p>Could not load information for ${this.name}.</p>
                <p>You can still enjoy images of this beautiful place.</p>
                <p><strong>Official currency:</strong> ${currency}</p>
                <p><strong>Official language:</strong> ${language}</p>
            `;
        }
    }
}

class ImageCarousel {
    constructor(destination, apiKey) {
        this.destination = destination;
        this.apiKey = apiKey;
        this.images = [];
        this.currentIndex = 0;
    }

    async loadImages() {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(this.destination)}&per_page=15`;

        try {
            const response = await fetch(url, { headers: { Authorization: this.apiKey } });
            if (!response.ok) throw new Error("Error fetching images");

            const data = await response.json();
            this.images = data.photos.map(photo => photo.src.medium);
            this.displayImage();
            this.addEventListeners();
        } catch (error) {
            console.error("Error loading images:", error);
            document.getElementById('carousel-image').alt = "No images available for this destination.";
        }
    }

    displayImage() {
        const carouselImage = document.getElementById('carousel-image');
        carouselImage.src = this.images[this.currentIndex];
    }

    addEventListeners() {
        document.getElementById('next-btn').addEventListener('click', () => this.nextImage());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevImage());
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.displayImage();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.displayImage();
    }
}

// Event listener to load the destination when the page loads
document.addEventListener("DOMContentLoaded", () => {
    const selectedDestination = localStorage.getItem('destinoSeleccionado');
    const destinationManager = new Destination(selectedDestination);
    destinationManager.loadDestinationData();
});

export default Destination;