class ImagesCarousel {
    constructor(destination) {
        this.destination = destination;
        this.apiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1'; // Incluye aquí la clave API de Pexels
        this.images = [];
        this.currentIndex = 0;
    }

    // Función para cargar las imágenes desde la API de Pexels
    async loadImages() {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(this.destination)}&per_page=15`;

        try {
            const response = await fetch(url, { headers: { Authorization: this.apiKey } });
            if (!response.ok) throw new Error("Error fetching images");

            const data = await response.json();
            // Extrae las URLs de las imágenes de la respuesta de la API
            this.images = data.photos.map(photo => photo.src.medium);

            // Verifica si hay imágenes y muestra la primera, o un mensaje alternativo
            if (this.images.length > 0) {
                this.displayImage();
                this.addEventListeners();
            } else {
                this.showNoImagesMessage();
            }
        } catch (error) {
            console.error("Error loading images:", error);
            this.showNoImagesMessage();
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

    showNoImagesMessage() {
        const carouselImage = document.getElementById('carousel-image');
        carouselImage.alt = "No images available for this destination.";
        carouselImage.src = ""; // Deja el src vacío si no hay imágenes disponibles
    }
}

export default ImagesCarousel;
