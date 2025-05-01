const API_BASE_URL = 'http://localhost:8085';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const retryButton = document.getElementById('retry-button');
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
    const toastSet = new Set();

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
            );
            const decoded = JSON.parse(jsonPayload);
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                throw new Error('Token has expired.');
            }
            return decoded;
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };

    const showToast = (message, type = 'success') => {
        if (!toastSet.has(message)) {
            Toastify({
                text: message,
                duration: 3000,
                gravity: 'top',
                position: 'right',
                backgroundColor: type === 'error' ? '#dc3545' : type === 'info' ? '#17a2b8' : '#28a745',
            }).showToast();
            toastSet.add(message);
            setTimeout(() => toastSet.delete(message), 5000);
        }
    };

    const getFriendlyError = (error) => {
        if (error.message.includes('logged in')) return 'Please log in to view venues.';
        if (error.response?.status === 401) return 'Unauthorized access. Please log in again.';
        if (error.response?.status === 404) return 'No venues found.';
        if (error.response?.status === 500) return 'Server error. Please try again later.';
        if (error.message.includes('Network Error')) return 'Unable to connect. Please check your internet.';
        if (error.message.includes('Invalid token') || error.message.includes('Token has expired')) {
            return 'Your session is invalid or expired. Please log in again.';
        }
        return error.response?.data?.message || 'Unable to load venues. Please try again.';
    };

    const fetchVenues = async (query = '') => {
        try {
            document.getElementById('loading').style.display = 'flex';
            document.getElementById('error').style.display = 'none';
            document.getElementById('venues-list').innerHTML = '';
            const token = sessionStorage.getItem('jwt');
            if (!token) throw new Error('You must be logged in to view venues.');
            const decoded = decodeJWT(token);
            if (!decoded?.sub) throw new Error('Invalid token: user ID not found.');
            const response = await axios.get(`${API_BASE_URL}/venues${query ? `?name=${encodeURIComponent(query)}` : ''}`, {
                // headers: { Authorization: `Bearer ${token}` },
            });
            const venues = response.data;
            if (!Array.isArray(venues)) throw new Error('Invalid response format from venues endpoint.');
            if (venues.length === 0) {
                document.getElementById('venues-list').innerHTML = '<div class="no-venues">No venues listed. Add a venue to get started!</div>';
                return;
            }
            document.getElementById('venues-list').innerHTML = venues.map((venue, index) => {
                const swiperId = `venue-swiper-${index}`;
                const imagesHTML = venue.images && venue.images.length > 0 ? venue.images.map((img, idx) => `
                    <div class="swiper-slide">
                        <img src="${API_BASE_URL}/api/images/${img.imgName}" alt="${venue.venueName} view ${idx + 1}" class="venue-img" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                    </div>
                `).join('') : `
                    <div class="swiper-slide">
                        <img src="${PLACEHOLDER_IMAGE}" alt="${venue.venueName || 'Venue'} placeholder" class="venue-img">
                    </div>
                `;
                return `
                    <div class="venue-card">
                        <div class="venue-content">
                            <div class="venue-image">
                                <div class="swiper ${swiperId}">
                                    <div class="swiper-wrapper">${imagesHTML}</div>
                                    <div class="swiper-button-prev swiper-button-prev-${index}"></div>
                                    <div class="swiper-button-next swiper-button-next-${index}"></div>
                                </div>
                            </div>
                            <div class="venue-details">
                                <h3>${venue.venueName || 'Unknown'}</h3>
                                <p><strong>Address:</strong> ${venue.venueAddress || 'N/A'}</p>
                                <p><strong>Price:</strong> ₹${venue.venuePrice ? parseFloat(venue.venuePrice).toFixed(2) : 'N/A'}</p>
                                <div class="venue-actions">
                                    <button class="cta-button vr-button" data-venue-id="${venue.venueId}"><i class="fas fa-vr-cardboard"></i> Show in VR</button>
                                    <button class="cta-button book-button" data-venue-id="${venue.venueId}" data-venue-name="${venue.venueName}" data-venue-price="${venue.venuePrice || 'N/A'}"><i class="fas fa-book"></i> Book Venue</button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            venues.forEach((_, index) => {
                new Swiper(`.venue-swiper-${index}`, {
                    navigation: {
                        nextEl: `.swiper-button-next-${index}`,
                        prevEl: `.swiper-button-prev-${index}`,
                    },
                    spaceBetween: 10,
                });
            });
            document.querySelectorAll('.vr-button').forEach(button => {
                button.addEventListener('click', () => {
                    const venueId = button.getAttribute('data-venue-id');
                    showToast(`VR view for venue ${venueId} is not implemented yet.`, 'info');
                });
            });
            document.querySelectorAll('.book-button').forEach(button => {
                button.addEventListener('click', () => {
                    const venueId = button.getAttribute('data-venue-id');
                    const venueName = button.getAttribute('data-venue-name');
                    const venuePrice = button.getAttribute('data-venue-price');
                    console.log('Opening booking modal for:', { venueId, venueName, venuePrice });
                    window.openBookingModal(venueId, venueName, venuePrice === 'N/A' ? null : parseFloat(venuePrice));
                });
            });
        } catch (error) {
            console.error('Error fetching venues:', error);
            const message = getFriendlyError(error);
            document.getElementById('error-message').textContent = message;
            document.getElementById('error').style.display = 'block';
            showToast(message, 'error');
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    };

    const fetchCarters = async () => {
        try {
            bookingLoading.style.display = 'flex';
            bookingError.style.display = 'none';
            const token = sessionStorage.getItem('jwt');
            if (!token) throw new Error('You must be logged in to fetch carters.');
            const response = await axios.get(`${API_BASE_URL}/carters`, {
                // headers: { Authorization: `Bearer ${token}` },
            });
            if (!Array.isArray(response.data)) throw new Error('Invalid response format from carters endpoint.');
            carters = response.data.filter(c => c.carterId && c.carterName);
            return carters;
        } catch (error) {
            bookingError.innerHTML = `${error.message} <button class="cta-button" onclick="fetchCarters().then(renderCarters)">Retry</button>`;
            bookingError.style.display = 'block';
            showToast('Failed to fetch carters.', 'error');
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
                // headers: { Authorization: `Bearer ${token}` },
            });
            if (!Array.isArray(response.data)) throw new Error('Invalid response format from vendors endpoint.');
            vendors = response.data.filter(v => v.vendorId && v.vendorName);
            return vendors;
        } catch (error) {
            bookingError.innerHTML = `${error.message} <button class="cta-button" onclick="fetchVendors().then(renderVendors)">Retry</button>`;
            bookingError.style.display = 'block';
            showToast('Failed to fetch vendors.', 'error');
            console.error('Error fetching vendors:', error);
            return [];
        } finally {
            bookingLoading.style.display = 'none';
        }
    };

    const renderCarters = () => {
        bookingError.style.display = 'none';
        bookingContent.innerHTML = `
            <h5>Select Carters</h5>
            <ul class="list-group">
                ${carters.length === 0 ? '<div class="alert-info">No carters available.</div>' : carters.map(carter => `
                    <li class="list-group-item">
                        <div>
                            <p class="fw-semibold">${carter.carterName || 'Unnamed Carter'}</p>
                            <p><strong>Price:</strong> ₹${carter.price ? carter.price.toFixed(2) : 'N/A'}</p>
                            <p><strong>Specialties:</strong> ${carter.carterSpecialties?.length > 0 ? carter.carterSpecialties.join(', ') : 'None'}</p>
                        </div>
                        <button class="cta-button ${selectedCarters.some(c => c.carterId === carter.carterId) ? 'danger-button' : 'success'} carter-button" data-id="${carter.carterId}">
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
            <h5>Select Vendors</h5>
            <ul class="list-group">
                ${vendors.length === 0 ? '<div class="alert-info">No vendors available.</div>' : vendors.map(vendor => `
                    <li class="list-group-item">
                        <div>
                            <p class="fw-semibold">${vendor.vendorName || 'Unnamed Vendor'}</p>
                            <p><strong>Price:</strong> ₹${vendor.price ? vendor.price.toFixed(2) : 'N/A'}</p>
                            <p><strong>Specialties:</strong> ${vendor.vendorSpecialties?.length > 0 ? vendor.vendorSpecialties.join(', ') : 'None'}</p>
                        </div>
                        <button class="cta-button ${selectedVendors.some(v => v.vendorId === vendor.vendorId) ? 'danger-button' : 'success'} vendor-button" data-id="${vendor.vendorId}">
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
            <h5>Confirm Booking Details</h5>
            <div class="form-group">
                <label for="bookingDate">Booking Date</label>
                <input type="date" id="bookingDate" value="${bookingDate}" min="${new Date().toISOString().split('T')[0]}">
                <div id="date-error" class="error-container alert" style="display: none;"></div>
            </div>
            <h6>Selected Carters:</h6>
            <ul class="list-group">
                ${selectedCarters.length === 0 ? '<li class="list-group-item">No carters selected.</li>' : selectedCarters.map(carter => `
                    <li class="list-group-item">${carter.carterName} (₹${carter.price ? carter.price.toFixed(2) : 'N/A'})</li>
                `).join('')}
            </ul>
            <h6>Selected Vendors:</h6>
            <ul class="list-group">
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

    const updateProgress = () => {
        const stages = ['carters', 'vendors', 'confirm'];
        const currentStep = stages.indexOf(currentStage) + 1;
        const progress = (currentStep / stages.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `Step ${currentStep}/${stages.length}`;
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
            if (!venueId) throw new Error('Venue ID is required.');
            const payload = {
                venueId: venueId,
                bookingDate: bookingDate,
                vendorIds: selectedVendors.map(v => v.vendorId).filter(id => id != null),
                carterIds: selectedCarters.map(c => c.carterId).filter(id => id != null),
            };
            console.log('Sending booking payload:', payload);
            const response = await axios.post(`${API_BASE_URL}/bookings`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Booking response:', response.data);
            showToast('Booking confirmed successfully!');
            bookingModal.style.display = 'none';
            fetchVenues();
        } catch (error) {
            console.error('Error confirming booking:', error);
            const message = error.response?.data?.message || error.response?.data || 'Failed to confirm booking.';
            console.log('Server error response:', error.response?.data);
            bookingError.textContent = message;
            bookingError.style.display = 'block';
            showToast(message, 'error');
        } finally {
            bookingLoading.style.display = 'none';
        }
    };

    const openBookingModal = async (id, name, price) => {
        console.log('openBookingModal called with:', { id, name, price });
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

    searchButton.addEventListener('click', () => fetchVenues(searchInput.value.trim()));
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchVenues(searchInput.value.trim());
    });
    retryButton.addEventListener('click', () => fetchVenues(searchInput.value.trim()));
    prevButton.addEventListener('click', handlePrevious);
    nextButton.addEventListener('click', handleNext);
    confirmBooking.addEventListener('click', handleConfirmBooking);
    cancelButton.addEventListener('click', () => bookingModal.style.display = 'none');
    closeModal.addEventListener('click', () => bookingModal.style.display = 'none');
    window.openBookingModal = openBookingModal;

    // Initial fetch
    fetchVenues();
});