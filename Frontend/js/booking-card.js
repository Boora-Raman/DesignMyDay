const API_BASE_URL = 'http://13.53.216.29:8085';

const bookingModal = document.getElementById('booking-modal');
const closeModal = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const bookingContent = document.getElementById('booking-content');
const bookingLoading = document.getElementById('booking-loading');
const bookingError = document.getElementById('booking-error');
const prevButton = document.getElementById('prev-button');
const nextButton = document.getElementById('next-button');
const confirmBooking = document.getElementById('confirm-booking');
const cancelButton = document.getElementById('cancel-button');
const progressBar = document.querySelector('#booking-progress .progress-bar');

let currentStage = 'carters';
let selectedCarters = [];
let selectedVendors = [];
let bookingDate = '';
let venueId = '';
let venueName = '';
let venuePrice = '';
let carters = [];
let vendors = [];

const showToast = (message, isError = false) => {
    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: isError ? '#dc3545' : '#28a745',
    }).showToast();
};

const updateProgress = () => {
    const stages = ['carters', 'vendors', 'confirm'];
    const currentStep = stages.indexOf(currentStage) + 1;
    const progress = (currentStep / stages.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `Step ${currentStep}/${stages.length}`;
};

const fetchCarters = async () => {
    try {
        bookingLoading.style.display = 'flex';
        bookingError.style.display = 'none';
        const token = sessionStorage.getItem('jwt');
        if (!token) throw new Error('You must be logged in to fetch carters.');
        const response = await axios.get(`${API_BASE_URL}/carters`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(response.data)) throw new Error('Invalid response format from carters endpoint.');
        carters = response.data.filter(c => c.carterId && c.carterName);
        return carters;
    } catch (error) {
        bookingError.innerHTML = `${error.message} <button class="btn btn-link retry-carters">Retry</button>`;
        bookingError.style.display = 'block';
        showToast('Failed to fetch carters.', true);
        console.error('Error fetching carters:', error);
        return [];
    } finally {
        bookingLoading.style.display = 'none';
    }
};

const fetchVendors = async () => {
    try {
        bookingLoading.style.display = 'flex';
        bookingError.style.display = 'none';
        const token = sessionStorage.getItem('jwt');
        if (!token) throw new Error('You must be logged in to fetch vendors.');
        const response = await axios.get(`${API_BASE_URL}/vendors`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!Array.isArray(response.data)) throw new Error('Invalid response format from vendors endpoint.');
        vendors = response.data.filter(v => v.vendorId && v.vendorName);
        return vendors;
    } catch (error) {
        bookingError.innerHTML = `${error.message} <button class="btn btn-link retry-vendors">Retry</button>`;
        bookingError.style.display = 'block';
        showToast('Failed to fetch vendors.', true);
        console.error('Error fetching vendors:', error);
        return [];
    } finally {
        bookingLoading.style.display = 'none';
    }
};

const renderCarters = () => {
    bookingError.style.display = 'none';
    bookingContent.innerHTML = `
        <h5 class="fw-bold mb-3">Select Carters</h5>
        <ul class="list-group">
            ${carters.length === 0 ? '<li class="list-group-item">No carters available.</li>' : carters.map(carter => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <p class="mb-1 font-weight-bold text-primary">${carter.carterName || 'Unnamed Carter'}</p>
                        <p class="mb-1 small">Price: ₹${carter.price ? carter.price.toFixed(2) : 'N/A'}</p>
                        <p class="mb-0 small">Specialties: ${carter.carterSpecialties?.length > 0 ? carter.carterSpecialties.join(', ') : 'None'}</p>
                    </div>
                    <button class="btn btn-sm ${selectedCarters.some(c => c.carterId === carter.carterId) ? 'btn-danger' : 'btn-success'} carter-button" data-id="${carter.carterId}">
                        ${selectedCarters.some(c => c.carterId === carter.carterId) ? 'Remove' : 'Add'}
                    </button>
                </li>
            `).join('')}
        </ul>
    `;

    document.querySelectorAll('.carter-button').forEach(button => {
        button.addEventListener('click', () => {
            const carterId = button.dataset.id;
            const carter = carters.find(c => c.carterId == carterId);
            if (carter) {
                selectedCarters = selectedCarters.some(c => c.carterId === carter.carterId)
                    ? selectedCarters.filter(c => c.carterId !== carter.carterId)
                    : [...selectedCarters, carter];
                renderCarters();
            }
        });
    });

    prevButton.style.display = 'none';
    nextButton.style.display = 'inline-block';
    confirmBooking.style.display = 'none';
    updateProgress();
};

const renderVendors = () => {
    bookingError.style.display = 'none';
    bookingContent.innerHTML = `
        <h5 class="fw-bold mb-3">Select Vendors</h5>
        <ul class="list-group">
            ${vendors.length === 0 ? '<li class="list-group-item">No vendors available.</li>' : vendors.map(vendor => `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <p class="mb-1 font-weight-bold text-primary">${vendor.vendorName || 'Unnamed Vendor'}</p>
                        <p class="mb-1 small">Price: ₹${vendor.price ? vendor.price.toFixed(2) : 'N/A'}</p>
                        <p class="mb-0 small">Specialties: ${vendor.vendorSpecialties?.length > 0 ? vendor.vendorSpecialties.join(', ') : 'None'}</p>
                    </div>
                    <button class="btn btn-sm ${selectedVendors.some(v => v.vendorId === vendor.vendorId) ? 'btn-danger' : 'btn-success'} vendor-button" data-id="${vendor.vendorId}">
                        ${selectedVendors.some(v => v.vendorId === vendor.vendorId) ? 'Remove' : 'Add'}
                    </button>
                </li>
            `).join('')}
        </ul>
    `;

    document.querySelectorAll('.vendor-button').forEach(button => {
        button.addEventListener('click', () => {
            const vendorId = button.dataset.id;
            const vendor = vendors.find(v => v.vendorId == vendorId);
            if (vendor) {
                selectedVendors = selectedVendors.some(v => v.vendorId === vendor.vendorId)
                    ? selectedVendors.filter(v => v.vendorId !== vendor.vendorId)
                    : [...selectedVendors, vendor];
                renderVendors();
            }
        });
    });

    prevButton.style.display = 'inline-block';
    nextButton.style.display = 'inline-block';
    confirmBooking.style.display = 'none';
    updateProgress();
};

const renderConfirmation = () => {
    bookingError.style.display = 'none';
    bookingContent.innerHTML = `
        <h5 class="fw-bold mb-3">Confirm Booking Details</h5>
        <div class="form-group">
            <label for="bookingDate" class="font-weight-bold">Booking Date</label>
            <input type="date" id="bookingDate" class="form-control" min="${new Date().toISOString().split('T')[0]}" value="${bookingDate}" required />
            <div id="date-error" class="alert alert-danger mt-2" style="display: none;"></div>
        </div>
        <h6>Selected Carters:</h6>
        <ul class="list-group mb-3">
            ${selectedCarters.length === 0 ? '<li class="list-group-item">No carters selected.</li>' : selectedCarters.map(carter => `
                <li class="list-group-item">${carter.carterName} (₹${carter.price ? carter.price.toFixed(2) : 'N/A'})</li>
            `).join('')}
        </ul>
        <h6>Selected Vendors:</h6>
        <ul class="list-group mb-3">
            ${selectedVendors.length === 0 ? '<li class="list-group-item">No vendors selected.</li>' : selectedVendors.map(vendor => `
                <li class="list-group-item">${vendor.vendorName} (₹${vendor.price ? vendor.price.toFixed(2) : 'N/A'})</li>
            `).join('')}
        </ul>
    `;

    const bookingDateInput = document.getElementById('bookingDate');
    const dateError = document.getElementById('date-error');
    bookingDateInput.addEventListener('change', () => {
        bookingDate = bookingDateInput.value;
        if (!bookingDate) {
            dateError.textContent = 'Booking date is required.';
            dateError.style.display = 'block';
        } else {
            const selectedDate = new Date(bookingDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                dateError.textContent = 'Booking date cannot be in the past.';
                dateError.style.display = 'block';
            } else {
                dateError.style.display = 'none';
            }
        }
    });

    prevButton.style.display = 'inline-block';
    nextButton.style.display = 'none';
    confirmBooking.style.display = 'inline-block';
    updateProgress();
};

const handleNext = async () => {
    if (currentStage === 'carters') {
        currentStage = 'vendors';
        await fetchVendors();
        renderVendors();
    } else if (currentStage === 'vendors') {
        currentStage = 'confirm';
        renderConfirmation();
    }
};

const handlePrevious = async () => {
    if (currentStage === 'vendors') {
        currentStage = 'carters';
        renderCarters();
    } else if (currentStage === 'confirm') {
        currentStage = 'vendors';
        renderVendors();
    }
};

const handleConfirmBooking = async () => {
    const bookingDateInput = document.getElementById('bookingDate');
    bookingDate = bookingDateInput.value;
    const dateError = document.getElementById('date-error');

    if (!bookingDate) {
        dateError.textContent = 'Booking date is required.';
        dateError.style.display = 'block';
        return;
    }
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
        dateError.textContent = 'Booking date cannot be in the past.';
        dateError.style.display = 'block';
        return;
    }

    try {
        bookingLoading.style.display = 'flex';
        bookingError.style.display = 'none';
        const token = sessionStorage.getItem('jwt');
        if (!token) throw new Error('You must be logged in to book a venue.');
        await axios.post(`${API_BASE_URL}/bookings`, {
            venueId: parseInt(venueId),
            bookingDate,
            vendorIds: selectedVendors.map(v => v.vendorId).filter(id => id != null),
            carterIds: selectedCarters.map(c => c.carterId).filter(id => id != null),
        }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        showToast('Booking confirmed successfully!');
        bookingModal.style.display = 'none';
        if (window.fetchVenues) window.fetchVenues();
    } catch (error) {
        bookingError.textContent = error.response?.data?.message || 'Failed to confirm booking.';
        bookingError.style.display = 'block';
        showToast('Failed to confirm booking.', true);
        console.error('Error confirming booking:', error);
    } finally {
        bookingLoading.style.display = 'none';
    }
};

const openBookingModal = async (id, name, price) => {
    venueId = id;
    venueName = name;
    venuePrice = price;
    modalTitle.textContent = `Book ${venueName} (₹${price ? price.toFixed(2) : 'N/A'})`;
    currentStage = 'carters';
    selectedCarters = [];
    selectedVendors = [];
    bookingDate = '';
    await fetchCarters();
    renderCarters();
    bookingModal.classList.add('show');
    bookingModal.style.display = 'block';
};

prevButton.addEventListener('click', handlePrevious);
nextButton.addEventListener('click', handleNext);
confirmBooking.addEventListener('click', handleConfirmBooking);
cancelButton.addEventListener('click', () => bookingModal.style.display = 'none');
closeModal.addEventListener('click', () => bookingModal.style.display = 'none');

window.openBookingModal = openBookingModal;
