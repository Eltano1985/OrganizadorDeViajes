class ImagesCarousel {
    constructor(destination) {
        this.destination = destination;
        this.apiKey = 'JYsFV9lbfdIrA9TYZ0QfFc6d61DFbbQub8lLLrplXYuIADPBYDp6XnC1'; 
        this.images = [];
        this.currentIndex = 0;
    }

    /**
     * Load images related to the destination from the Pexels API. Constructs a search URL using the user-specified destination, retrieves up to 30 images that match the query and stores the URLs of medium-sized images in the `images` array. If an error occurs during recovery, it logs the error to the console and displays a message that no images are available
     * @returns {Promise<void>} A promise that resolves when images are loaded or an error is handled
     */
    async loadImages() {
        const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(this.destination)}&per_page=30`;

        try {
            const response = await fetch(url, { headers: { Authorization: this.apiKey } });
            if (!response.ok) throw new Error("Error fetching images");

            const data = await response.json();
            this.images = data.photos.map(photo => photo.src.medium);

            this.showImages();
        } catch (error) {
            console.error("Error loading images:", error);
            this.showNoImagesMessage();
        }
    }
    
    /**
     * Displays images in the user interface if any are loaded; otherwise, it displays a message stating that there are no images available. Checks if the `images` array contains any uploaded images. If so, call `displayImage` to render the images and `addEventListeners` to enable interactivity. If no images are present, call "showNoImagesMessage"
     * @returns {void}
     */
    showImages() {
        if (this.images.length > 0) {
            this.displayImage();
            this.addEventListeners();
        } else {
            this.showNoImagesMessage();
        }
    }

    /**
     * Displays the current image in the carousel based on the `currentIndex` in the `images` array. Sets the `src` attribute of the image element with the id `carousel-image` to the image URL at position `currentIndex` in the `images` array. This updates the image displayed in the carousel
     * @returns {void}
     */
    displayImage() {
        const carouselImage = document.getElementById('carousel-image');
        carouselImage.src = this.images[this.currentIndex];
    }

    /**
     * Add event listeners to the "Next" and "Previous" buttons to navigate the image carousel. Binds click events to the "Next" and "Previous" buttons (identified by their IDs, `next-btn` and `prev-btn`). When clicked, these buttons call the `nextImage` and `prevImage` methods, respectively, to update the image displayed in the carousel
     * @returns {void}
     */
    addEventListeners() {
        document.getElementById('next-btn').addEventListener('click', () => this.nextImage());
        document.getElementById('prev-btn').addEventListener('click', () => this.prevImage());
    }

    /**
     * Moves to the next image in the carousel and updates the displayed image. Increments `currentIndex` by 1 to point to the next image in the `images` array. If `currentIndex` exceeds the length of the array, it returns to the beginning (index 0). Call `displayImage` to display the updated image
     * @returns {void}
     */
    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.displayImage();
    }

    /**
     * Moves to the previous image in the carousel and updates the displayed image. Decrements `currentIndex` by 1 so that it points to the previous image in the `images` array. If `currentIndex` drops below 0, it returns to the last image in the array. Call `displayImage` to display the updated image
     * @returns {void}
     */
    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.displayImage();
    }

    /**
     * Displays a message indicating that there are no images available for the selected destination. Sets the "alt" attribute of the image element with the ID "carousel-image" to a message stating "There are no images available for this destination." Clear the `src` attribute to remove any previously displayed images
     * @returns {void}
     */
    showNoImagesMessage() {
        const carouselImage = document.getElementById('carousel-image');
        carouselImage.alt = "No images available for this destination.";
        carouselImage.src = "";
    }
}

export default ImagesCarousel;
