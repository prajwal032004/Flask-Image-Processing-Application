document.addEventListener('DOMContentLoaded', function () {
    const image = document.getElementById('image');
    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const saturationSlider = document.getElementById('saturation');
    const filterButtons = document.querySelectorAll('.filter-button');
    const saveButton = document.getElementById('save-button');

    let currentFilters = {
        brightness: 100,
        contrast: 100,
        saturation: 100
    };

    function updateImage() {
        image.style.filter = `brightness(${currentFilters.brightness}%) contrast(${currentFilters.contrast}%) saturate(${currentFilters.saturation}%)`;
    }

    brightnessSlider.addEventListener('input', function () {
        currentFilters.brightness = this.value;
        updateImage();
    });

    contrastSlider.addEventListener('input', function () {
        currentFilters.contrast = this.value;
        updateImage();
    });

    saturationSlider.addEventListener('input', function () {
        currentFilters.saturation = this.value;
        updateImage();
    });

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filter = this.dataset.filter;
            applyFilter(filter);
        });
    });

    function applyFilter(filter) {
        const filename = image.src.split('/').pop();
        fetch('/apply_filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: filename,
                filter: filter
            }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    image.src = `/static/uploads/${data.new_filename}`;
                    resetSliders();
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    function resetSliders() {
        brightnessSlider.value = 100;
        contrastSlider.value = 100;
        saturationSlider.value = 100;
        currentFilters = {
            brightness: 100,
            contrast: 100,
            saturation: 100
        };
        updateImage();
    }

    saveButton.addEventListener('click', function () {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        ctx.filter = image.style.filter;
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(function (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'edited_image.png';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        }, 'image/png');
    });
});

