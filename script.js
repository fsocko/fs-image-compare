const imageUpload = document.getElementById('imageUpload');
const imageContainer = document.getElementById('imageContainer');
const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');

imageUpload.addEventListener('change', handleImageUpload);
scaleSlider.addEventListener('input', handleScaleChange);
imageContainer.addEventListener('dragover', (event) => event.preventDefault());
imageContainer.addEventListener('drop', handleFileDrop);

function handleImageUpload(event) {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.classList.add('image-slide');
            img.src = URL.createObjectURL(file);

            // Set a random initial position within the container
            img.style.top = `${Math.random() * 200}px`;
            img.style.left = `${Math.random() * 200}px`;

            // Add event listeners for drag functionality
            img.addEventListener('mousedown', startDrag);

            // Append the image to the container
            imageContainer.appendChild(img);
        }
    });

    // Clear the file input to allow re-uploading the same files if needed
    imageUpload.value = '';
}

function handleFileDrop(event) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.classList.add('image-slide');
            img.src = URL.createObjectURL(file);

            // Set a random initial position within the container
            img.style.top = `${Math.random() * 200}px`;
            img.style.left = `${Math.random() * 200}px`;

            // Add event listeners for drag functionality
            img.addEventListener('mousedown', startDrag);

            // Append the image to the container
            imageContainer.appendChild(img);
        }
    });
}

let activeImage = null;
let offsetX = 0;
let offsetY = 0;

function startDrag(event) {
    activeImage = event.target;
    const rect = activeImage.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    // Add event listeners to handle drag and drop behavior
    document.addEventListener('mousemove', dragImage);
    document.addEventListener('mouseup', stopDrag);
}

function dragImage(event) {
    if (!activeImage) return;

    // Update the position of the active image
    activeImage.style.left = `${event.clientX - offsetX}px`;
    activeImage.style.top = `${event.clientY - offsetY}px`;

    // Provide visual feedback for snapping direction
    showSnapFeedback();
}

function stopDrag() {
    // Remove event listeners to prevent dragging after mouse is released
    document.removeEventListener('mousemove', dragImage);
    document.removeEventListener('mouseup', stopDrag);

    // Snap and scale images after dragging stops
    if (activeImage) {
        snapAndScaleImages();
        activeImage.classList.remove('snapping');
    }
    activeImage = null;
}

function showSnapFeedback() {
    const images = Array.from(document.getElementsByClassName('image-slide'));
    const snappingImageRect = activeImage.getBoundingClientRect();

    images.forEach(img => {
        if (img !== activeImage) {
            const imgRect = img.getBoundingClientRect();
            const horizontalOverlap = Math.abs(snappingImageRect.right - imgRect.left) < snappingImageRect.width;
            const verticalOverlap = Math.abs(snappingImageRect.bottom - imgRect.top) < snappingImageRect.height;

            // Reset border classes
            img.classList.remove('snapping', 'snapping-horizontal', 'snapping-vertical');

            // Highlight the image border if it's close enough to snap
            if (horizontalOverlap) {
                img.classList.add('snapping-horizontal');
            } 
            if (verticalOverlap) {
                img.classList.add('snapping-vertical');
            }
            if (horizontalOverlap || verticalOverlap) {
                img.classList.add('snapping');
            }
        }
    });
}

function snapAndScaleImages() {
    const images = Array.from(document.getElementsByClassName('image-slide'));
    const snappingImageRect = activeImage.getBoundingClientRect();

    // Determine snapping direction
    let snapToLeft = false;
    let snapToRight = false;
    let snapAbove = false;
    let snapBelow = false;

    images.forEach((img, index) => {
        if (img !== activeImage) {
            const imgRect = img.getBoundingClientRect();

            // Check for snapping conditions
            if (snappingImageRect.bottom > imgRect.top && snappingImageRect.top < imgRect.bottom) {
                if (snappingImageRect.right > imgRect.left && snappingImageRect.left < imgRect.left) {
                    snapToLeft = true;
                }
                if (snappingImageRect.left < imgRect.right && snappingImageRect.right > imgRect.right) {
                    snapToRight = true;
                }
            }

            if (snappingImageRect.right > imgRect.left && snappingImageRect.left < imgRect.right) {
                if (snappingImageRect.bottom > imgRect.top && snappingImageRect.top < imgRect.top) {
                    snapAbove = true;
                }
                if (snappingImageRect.top < imgRect.bottom && snappingImageRect.bottom > imgRect.bottom) {
                    snapBelow = true;
                }
            }
        }
    });

    if (snapToLeft || snapToRight) {
        snapSideBySide(images);
    } else if (snapAbove || snapBelow) {
        snapStacked(images);
    }
}

function snapSideBySide(images) {
    const positions = [];
    let maxHeight = 0;

    images.forEach(img => {
        const rect = img.getBoundingClientRect();
        positions.push({ img, height: rect.height });
        maxHeight = Math.max(maxHeight, rect.height);
    });

    let leftPos = 10; // Start position for horizontal snapping
    positions.forEach(({ img }) => {
        img.style.height = `${maxHeight}px`;
        img.style.width = 'auto';
        img.style.top = '10px';
        img.style.left = `${leftPos}px`;
        leftPos += maxHeight + 10; // Increment position for the next image
    });
}

function snapStacked(images) {
    const positions = [];
    let maxWidth = 0;

    images.forEach(img => {
        const rect = img.getBoundingClientRect();
        positions.push({ img, width: rect.width });
        maxWidth = Math.max(maxWidth, rect.width);
    });

    let topPos = 10; // Start position for vertical snapping
    positions.forEach(({ img }) => {
        img.style.width = `${maxWidth}px`;
        img.style.height = 'auto';
        img.style.left = '10px';
        img.style.top = `${topPos}px`;
        topPos += img.getBoundingClientRect().height + 10; // Increment position for the next image
    });
}

function handleScaleChange(event) {
    const scale = parseFloat(event.target.value);
    scaleValue.textContent = `${(scale * 100).toFixed(0)}%`; // Update the display of scale value
    const images = document.querySelectorAll('.image-slide');

    images.forEach(img => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        if (img.style.left) {
            img.style.width = `${Math.max(scale * imageContainer.clientWidth, 100)}px`;
            img.style.height = `${(img.style.width / aspectRatio)}px`;
        } else {
            img.style.height = `${Math.max(scale * imageContainer.clientHeight, 100)}px`;
            img.style.width = `${(img.style.height * aspectRatio)}px`;
        }
    });
}
