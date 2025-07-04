console.log('AgroLink frontend loaded');

const API_URL = 'http://localhost:3001/api/listings';

let localListings = [];

const cropIcons = {
    cocoa: '🍫',
    coffee: '☕',
};

function getCropTypeClass(crop) {
    if (!crop) return '';
    const c = crop.trim().toLowerCase();
    if (c.includes('cocoa')) return 'cocoa';
    if (c.includes('coffee')) return 'coffee';
    return '';
}

function getCropIcon(crop) {
    if (!crop) return '';
    const c = crop.trim().toLowerCase();
    if (c.includes('cocoa')) return cropIcons.cocoa;
    if (c.includes('coffee')) return cropIcons.coffee;
    return '🌱';
}

function renderListings(listings) {
    const listingsEl = document.getElementById('listings');
    listingsEl.innerHTML = '';
    listings.forEach(listing => {
        const card = document.createElement('li');
        const cropClass = getCropTypeClass(listing.crop);
        card.className = `crop-card${cropClass ? ' ' + cropClass : ''}`;
        card.innerHTML = `
            <span class="crop-icon">${getCropIcon(listing.crop)}</span>
            <span class="crop-type">${listing.crop}</span>
            <span class="farmer">Farmer: ${listing.farmer}</span>
            <span class="details">${listing.quantity} kg &nbsp; | &nbsp; $${listing.price}</span>
        `;
        if (listing.imageDataUrl) {
            const img = document.createElement('img');
            img.src = listing.imageDataUrl;
            img.alt = 'Crop Image';
            img.style.width = '100px';
            img.style.marginTop = '0.5rem';
            img.style.borderRadius = '0.5rem';
            card.appendChild(img);
        }
        listingsEl.appendChild(card);
    });
}

const form = document.getElementById('listingForm');
const successMsg = document.getElementById('form-success');
const imageInput = document.getElementById('imageUpload');
let imageDataUrl = '';

if (imageInput) {
    imageInput.addEventListener('change', function () {
        const preview = document.getElementById('image-preview');
        preview.innerHTML = '';
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                imageDataUrl = e.target.result;
                const img = document.createElement('img');
                img.src = imageDataUrl;
                img.style.width = '100px';
                img.style.borderRadius = '0.5rem';
                preview.appendChild(img);
            };
            reader.readAsDataURL(this.files[0]);
        } else {
            imageDataUrl = '';
        }
    });
}

if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const farmer = document.getElementById('farmer').value.trim();
        const crop = document.getElementById('crop').value.trim();
        const quantity = document.getElementById('quantity').value.trim();
        const price = document.getElementById('price').value.trim();
        if (!farmer || !crop || !quantity || !price) {
            alert('Please fill in all fields.');
            return;
        }
        // Add the new listing to the top of the list so it feels instant
        localListings.unshift({ farmer, crop, quantity, price, imageDataUrl });
        renderListings(localListings);
        form.reset();
        imageDataUrl = '';
        document.getElementById('image-preview').innerHTML = '';
        if (successMsg) {
            successMsg.style.display = 'block';
            setTimeout(() => { successMsg.style.display = 'none'; }, 2000);
        }
    });
}

renderListings(localListings);
