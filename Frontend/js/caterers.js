const API_BASE_URL = 'http://localhost:8085';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const retryButton = document.getElementById('retry-button');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const caterersList = document.getElementById('caterers-list');

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
        if (error.message.includes('logged in')) return 'Please log in to view caterers.';
        if (error.response?.status === 401) return 'Unauthorized access. Please log in again.';
        if (error.response?.status === 404) return 'No caterers found.';
        if (error.response?.status === 500) return 'Server error. Please try again later.';
        if (error.message.includes('Network Error')) return 'Unable to connect. Please check your internet.';
        return 'Unable to load caterers. Please try again.';
    };

    const fetchCaterers = async (query = '') => {
        try {
            loading.style.display = 'flex';
            error.style.display = 'none';
            caterersList.innerHTML = '';

            const token = sessionStorage.getItem('jwt');
            // if (!token) {
            //     throw new Error('You must be logged in to view caterers.');
            // }

            const response = await axios.get(`${API_BASE_URL}/carters${query ? `?name=${encodeURIComponent(query)}` : ''}`, {
                // headers: { Authorization: `Bearer ${token}` },
            });

            const caterers = response.data;

            if (!Array.isArray(caterers)) {
                throw new Error('Invalid response format from caterers endpoint.');
            }

            if (caterers.length === 0) {
                caterersList.innerHTML = '<div class="no-caterers">No caterers found.</div>';
            } else {
                caterersList.innerHTML = caterers.map(caterer => `
                    <div class="caterer-card">
                        <div class="caterer-content">
                            <div class="caterer-image">
                                <img src="${caterer.images && caterer.images.length > 0 ? `${API_BASE_URL}/api/images/${caterer.images[0].imgName}` : PLACEHOLDER_IMAGE}" alt="${caterer.carterName || 'Caterer'}" class="caterer-img" onerror="this.src='${PLACEHOLDER_IMAGE}'">
                            </div>
                            <div class="caterer-details">
                                <h3>${caterer.carterName || 'Unknown'}</h3>
                                <p><strong>Contact:</strong> ${caterer.carterContact || 'N/A'}</p>
                                <p><strong>Price:</strong> ₹${caterer.price ? caterer.price.toFixed(2) : 'N/A'}</p>
                                <div class="caterer-specialties">
                                    <h4>Specialties</h4>
                                    <ul>
                                        ${caterer.carterSpecialties && caterer.carterSpecialties.length > 0 ? caterer.carterSpecialties.map(specialty => `<li>${specialty}</li>`).join('') : '<li>None</li>'}
                                    </ul>
                                </div>
                                <div class="caterer-description">
                                    <h4>Description</h4>
                                    <p>${caterer.description || 'No description available.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error fetching caterers:', error);
            const message = getFriendlyError(error);
            errorMessage.textContent = message;
            error.style.display = 'block';
            showToast(message, true);
        } finally {
            loading.style.display = 'none';
        }
    };

    // Ensure search button works correctly
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            fetchCaterers(query);
        });
    } else {
        console.warn('Search button not found');
    }

    if (retryButton) {
        retryButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            fetchCaterers(query);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                fetchCaterers(query);
            }
        });
    }

    // Initial fetch
    fetchCaterers();
});