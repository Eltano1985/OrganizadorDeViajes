class ImagesCarousel {
    constructor(destination) {
        this.destination = destination;
        this.apiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1'; 
        this.images = [];
        this.currentIndex = 0;
    }

    /**
     * Load images from the entered destination using the pexels API key
     */
    async loadImages() {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(this.destination)}&per_page=30`;

        try {
            const response = await fetch(url, { headers: { Authorization: this.apiKey } });
            if (!response.ok) throw new Error("Error fetching images");

            const data = await response.json();
            this.images = data.photos.map(photo => photo.src.medium);

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

    /**
     * Show the current image in the image carousel item
     */
    displayImage() {
        const carouselImage = document.getElementById('carousel-image');
        carouselImage.src = this.images[this.currentIndex];
    }

    /**
     * Add click events to carousel navigation buttons
     */
    addEventListeners() {
        document.getElementById('next-btn').addEventListener('click', () => this.nextImage());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevImage());
    }

    /**
     * Move to the next image in the carousel. If the end of the image list is reached, it returns to the beginning
     */
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.displayImage();
    }

    /**
     * Go back to the previous image in the carousel. If it is at the beginning of the image list, it returns to the end
     */
    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.displayImage();
    }

    /**
     * Displays an alternative message when no images are available for the destination
     */
    showNoImagesMessage() {
        const carouselImage = document.getElementById('carousel-image');
        carouselImage.alt = "No images available for this destination.";
        carouselImage.src = "";
    }
}

export default ImagesCarousel;
