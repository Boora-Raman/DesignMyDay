const API_BASE_URL = 'http://localhost:8085';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const retryButton = document.getElementById('retry-button');
    const refreshButton = document.getElementById('refresh-venues');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const venuesList = document.getElementById('venues-list');
    const bookingModal = document.getElementById('booking-modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const confirmBooking = document.getElementById('confirm-booking');
    const toastSet = new Set();

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
            );
            return JSON.parse(jsonPayload);
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
        if (error.message.includes('Invalid token')) return 'Your session is invalid. Please log in again.';
        return 'Unable to load venues. Please try again.';
    };

    const fetchVenues = async (query = '') => {
        try {
            loading.style.display = 'flex';
            error.style.display = 'none';
            venuesList.innerHTML = '';

            const token = sessionStorage.getItem('jwt');
            if (!token) throw new Error('You must be logged in to view venues.');

            const decoded = decodeJWT(token);
            if (!decoded?.sub) throw new Error('Invalid token: user ID not found.');

            const response = await axios.get(`${API_BASE_URL}/venues${query ? `?name=${encodeURIComponent(query)}` : ''}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const venues = response.data;

            if (!Array.isArray(venues)) throw new Error('Invalid response format from venues endpoint.');

            if (venues.length === 0) {
                venuesList.innerHTML = '<div class="no-venues">No venues found.</div>';
                return;
            }

            venuesList.innerHTML = venues.map((venue, index) => {
                const swiperId = `venue-swiper-${index}`;
                const imagesHTML = venue.images && venue.images.length > 0
                    ? venue.images.map((img, idx) => `
                        <div class="swiper-slide">
                            <img src="${API_BASE_URL}/api/images/${img.imgName}" 
                                 alt="${venue.venueName} view ${idx + 1}" 
                                 class="venue-img"
                                 onerror="this.src='${PLACEHOLDER_IMAGE}'">
                        </div>`).join('')
                    : `<div class="swiper-slide">
                            <img src="${PLACEHOLDER_IMAGE}" 
                                 alt="${venue.venueName || 'Venue'} placeholder" 
                                 class="venue-img">
                       </div>`;

                return `
                    <div class="venue-card fade-in">
                        <div class="venue-content">
                            <div class="venue-image">
                                <div class="swiper ${swiperId}">
                                    <div class="swiper-wrapper">
                                        ${imagesHTML}
                                    </div>
                                    <div class="swiper-button-prev swiper-button-prev-${index}"></div>
                                    <div class="swiper-button-next swiper-button-next-${index}"></div>
                                </div>
                            </div>
                            <div class="venue-details">
                                <h3>${venue.venueName || 'Unknown'}</h3>
                                <p><strong>Address:</strong> ${venue.venueAddress || 'N/A'}</p>
                                <p><strong>Price:</strong> ₹${venue.venuePrice ? parseFloat(venue.venuePrice).toFixed(2) : 'N/A'}</p>
                                <div class="venue-actions">
                                    <button class="cta-button vr-button" data-venue-id="${venue.venueId}">Show in VR</button>
                                    <button class="cta-button book-button" 
                                            data-venue-id="${venue.venueId}" 
                                            data-venue-name="${venue.venueName}" 
                                            data-venue-price="${venue.venuePrice || 'N/A'}">Book Venue</button>
                                </div>
                            </div>
                        </div>
                    </div>`;
            }).join('');

            // Initialize Swipers
            venues.forEach((_, index) => {
                new Swiper(`.venue-swiper-${index}`, {
                    navigation: {
                        nextEl: `.swiper-button-next-${index}`,
                        prevEl: `.swiper-button-prev-${index}`,
                    },
                    spaceBetween: 10,
                });
            });

            // Add button listeners
            document.querySelectorAll('.vr-button').forEach(button => {
                button.addEventListener('click', () => {
                    const venueId = button.getAttribute('data-venue-id');
                    showToast(`VR view for venue ${venueId} is not implemented yet.`, 'info');
                });
            });

            document.querySelectorAll('.book-button').forEach(button => {
                button.addEventListener('click', () => {
                    const venueName = button.getAttribute('data-venue-name');
                    const venuePrice = button.getAttribute('data-venue-price');
                    modalTitle.textContent = `Book ${venueName}`;
                    modalPrice.textContent = `Price: ₹${venuePrice !== 'N/A' ? parseFloat(venuePrice).toFixed(2) : 'N/A'}`;
                    bookingModal.style.display = 'block';
                });
            });

        } catch (error) {
            console.error('Error fetching venues:', error);
            const message = getFriendlyError(error);
            errorMessage.textContent = message;
            error.style.display = 'block';
            showToast(message, 'error');
        } finally {
            loading.style.display = 'none';
        }
    };

    // Event Bindings
    searchButton?.addEventListener('click', () => fetchVenues(searchInput.value.trim()));
    searchInput?.addEventListener('keypress', (e) => e.key === 'Enter' && fetchVenues(searchInput.value.trim()));
    retryButton?.addEventListener('click', () => fetchVenues(searchInput.value.trim()));
    refreshButton?.addEventListener('click', () => fetchVenues());
    closeModal?.addEventListener('click', () => bookingModal.style.display = 'none');
    confirmBooking?.addEventListener('click', () => {
        showToast('Booking functionality is not fully implemented yet.', 'info');
        bookingModal.style.display = 'none';
    });

    // Initial Load
    fetchVenues();
});
