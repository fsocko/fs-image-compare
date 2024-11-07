const imageUpload = document.getElementById('imageUpload');
const imageContainer = document.getElementById('imageContainer');
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');
const alignmentToggle = document.getElementById('alignmentToggle');
const toggleLabel = document.getElementById('toggleLabel');

imageUpload.addEventListener('change', handleImageUpload);
scaleSlider.addEventListener('input', handleScaleChange);
alignmentToggle.addEventListener('change', handleAlignmentToggle);
imageContainer.addEventListener('dragover', (event) => event.preventDefault());
imageContainer.addEventListener('drop', handleFileDrop);

function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    displayImages(files);
    imageUpload.value = ''; // Clear file input to allow re-uploading the same files if needed
}

function handleFileDrop(event) {
    event.preventDefault();

    // Only process external files dropped into the container
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
        const files = Array.from(event.dataTransfer.files);
        displayImages(files);
    }
}

function displayImages(files) {
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.classList.add('image-slide');
            img.src = URL.createObjectURL(file);
            imageContainer.appendChild(img);

            img.onload = () => {
                ensureMinimumSize(img);
                handleAlignmentToggle(); // Align images immediately after upload
            };
        }
    });
}

function ensureMinimumSize(img) {
    // Ensure each image is at least 10% of the viewport width
    const minWidth = window.innerWidth * 0.1;
    const aspectRatio = img.naturalWidth / img.naturalHeight;

    img.style.width = `${Math.max(img.naturalWidth, minWidth)}px`;
    img.style.height = `${Math.max(img.naturalHeight, minWidth / aspectRatio)}px`;
}

function handleScaleChange(event) {
    const scale = parseFloat(event.target.value);
    scaleValue.textContent = `${(scale * 100).toFixed(0)}%`; // Update the display of scale value
    const images = document.querySelectorAll('.image-slide');

    images.forEach(img => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        img.style.width = `${scale * img.naturalWidth}px`;
        img.style.height = `${scale * img.naturalHeight}px`;
    });
    handleAlignmentToggle(); // Adjust alignment after scaling
}

function handleAlignmentToggle() {
    if (alignmentToggle.checked) {
        toggleLabel.textContent = "Vertical";
        snapStacked();
    } else {
        toggleLabel.textContent = "Horizontal";
        snapSideBySide();
    }
}

function snapSideBySide() {
    const images = Array.from(document.getElementsByClassName('image-slide'));
    let leftPos = 0;

    images.forEach(img => {
        img.style.position = 'absolute';
        img.style.top = '0px';
        img.style.left = `${leftPos}px`;
        leftPos += img.getBoundingClientRect().width; // Position next image immediately after the current one
    });
}

function snapStacked() {
    const images = Array.from(document.getElementsByClassName('image-slide'));
    let topPos = 0;

    images.forEach(img => {
        img.style.position = 'absolute';
        img.style.left = '0px';
        img.style.top = `${topPos}px`;
        topPos += img.getBoundingClientRect().height; // Position next image immediately below the current one
    });
}

// Initialize with current alignment setting
handleAlignmentToggle();
