const API_BASE_URL = 'http://localhost:8085';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/100';

document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const profileContent = document.getElementById('profile-content');
    const profileImage = document.getElementById('profile-image');
    const profileName = document.getElementById('profile-name');
    const profileUserId = document.getElementById('profile-user-id');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    const bookingsList = document.getElementById('bookings-list');
    const logoutButton = document.getElementById('logout-button');

    const showToast = (message, isError = false) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: 'top',
            position: 'center',
            backgroundColor: isError ? '#dc3545' : '#28a745',
        }).showToast();
    };

    const getFriendlyError = (error) => {
        if (error.response?.status === 401) return 'Unauthorized. Please log in again.';
        if (error.response?.status === 403) return 'Access forbidden. Please check your permissions.';
        if (error.response?.status === 404) return 'User not found.';
        if (error.response?.status === 400) return 'Invalid or expired token.';
        if (error.message.includes('Network Error')) return 'Network error. Please check your connection.';
        if (error.message.includes('Username not found')) return 'Username not found. Please log in again.';
        return 'Failed to load user profile.';
    };

    const fetchProfile = async () => {
        try {
            loading.style.display = 'flex';
            error.style.display = 'none';
            profileContent.style.display = 'none';

            const token = sessionStorage.getItem('jwt');
            const name = sessionStorage.getItem('name');
            if (!token) {
                showToast('Please log in to view your profile.', true);
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }
            if (!name) {
                throw new Error('Username not found in session storage');
            }

            const response = await axios.get(`${API_BASE_URL}/users/name/${encodeURIComponent(name)}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const user = response.data;

            profileImage.src = user.profileImagePath ? `${API_BASE_URL}/api/images/${encodeURIComponent(user.profileImagePath)}` : PLACEHOLDER_IMAGE;
            profileImage.onerror = () => { profileImage.src = PLACEHOLDER_IMAGE; };
            profileName.textContent = user.name || 'N/A';
            profileUserId.textContent = user.userId || 'N/A';
            profileUsername.textContent = user.name || 'N/A';
            profileEmail.textContent = user.email || 'N/A';

            if (user.bookings && user.bookings.length > 0) {
                bookingsList.innerHTML = user.bookings.map(booking => `
                    <div class="booking-item">
                        <div class="booking-content">
                            <div class="booking-details">
                                <p><i class="fas fa-map-marker-alt"></i> <strong>Venue:</strong> ${booking.venue?.venueName || 'N/A'}</p>
                                <p><i class="fas fa-info-circle"></i> <strong>Booking ID:</strong> ${booking.bookingId || 'N/A'}</p>
                                <p><i class="fas fa-user-friends"></i> <strong>Vendors:</strong> ${
                                    booking.vendors?.length > 0
                                        ? booking.vendors.map(v => v.vendorName || 'Unknown Vendor').join(', ')
                                        : 'None'
                                }</p>
                                <p><i class="fas fa-utensils"></i> <strong>Carters:</strong> ${
                                    booking.carters?.length > 0
                                        ? booking.carters.map(c => c.carterName || 'Unknown Carter').join(', ')
                                        : 'None'
                                }</p>
                                <p><i class="fas fa-money-bill-wave"></i> <strong>Total Price:</strong> ₹${booking.totalPrice ? booking.totalPrice.toFixed(2) : 'N/A'}</p>
                                <p><i class="fas fa-calendar-alt"></i> <strong>Booking Date:</strong> ${
                                    booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'
                                }</p>
                                <p><strong>Status:</strong> <span class="booking-status ${booking.status?.toLowerCase() || ''}">${booking.status || 'N/A'}</span></p>
                            </div>
                            <div class="booking-actions">
                                ${booking.status === 'Pending' ? `<button class="cta-button danger-button cancel-booking" data-id="${booking.bookingId}">Cancel Booking</button>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
            } else {
                bookingsList.innerHTML = '<div class="no-bookings">No venues booked yet. Start planning your event!</div>';
            }

            loading.style.display = 'none';
            profileContent.style.display = 'block';

            // Add event listeners for cancel buttons
            document.querySelectorAll('.cancel-booking').forEach(button => {
                button.addEventListener('click', () => handleCancelBooking(button.dataset.id));
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            const message = getFriendlyError(error);
            loading.style.display = 'none';
            errorMessage.textContent = message;
            error.style.display = 'block';
            showToast(message, true);
            if (error.response?.status === 401 || error.response?.status === 400) {
                sessionStorage.removeItem('jwt');
                sessionStorage.removeItem('email');
                sessionStorage.removeItem('name');
                setTimeout(() => window.location.href = 'login.html', 2000);
            }
        }
    };

    const handleCancelBooking = async (bookingId) => {
        try {
            const token = sessionStorage.getItem('jwt');
            await axios.put(`${API_BASE_URL}/bookings/cancel/${bookingId}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showToast('Booking cancelled successfully!');
            fetchProfile();
        } catch (error) {
            console.error('Error cancelling booking:', error);
            const message = error.response?.data?.message || 'Failed to cancel booking.';
            showToast(message, true);
        }
    };

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('jwt');
            sessionStorage.removeItem('email');
            sessionStorage.removeItem('name');
            showToast('Logged out successfully!');
            window.location.href = 'login.html';
        });
    }

    fetchProfile();
});