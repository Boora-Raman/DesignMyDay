const API_BASE_URL = 'http://localhost:8085';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/200';

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const retryButton = document.getElementById('retry-button');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const errorMessage = document.getElementById('error-message');
    const vendorsList = document.getElementById('vendors-list');

    const showToast = (message, isError = false) => {
        Toastify({
            text: message,
            duration: 3000,
            gravity: 'top',
            position: 'right',
            backgroundColor: isError ? '#dc3545' : '#28a745',
            toastId: 'fetch-vendors-error'
        }).showToast();
    };

    const getFriendlyError = (error) => {
        if (error.message.includes('logged in')) return 'Please log in to view vendors.';
        if (error.response?.status === 401) return 'Unauthorized access. Please log in again.';
        if (error.response?.status === 404) return 'No vendors found.';
        if (error.response?.status === 500) return 'Server error. Please try again later.';
        if (error.message.includes('Network Error')) return 'Unable to connect. Please check your internet.';
        return 'Unable to load vendors. Please try again.';
    };

    const fetchVendors = async (query = '') => {
        try {
            loading.style.display = 'flex';
            error.style.display = 'none';
            vendorsList.innerHTML = '';

            const token = sessionStorage.getItem('jwt');
            if (!token) {
                throw new Error('You must be logged in to view vendors.');
            }

            const response = await axios.get(`${API_BASE_URL}/vendors${query ? `?name=${encodeURIComponent(query)}` : ''}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const vendors = response.data;

            if (!Array.isArray(vendors)) {
                throw new Error('Invalid response format from vendors endpoint.');
            }

            if (vendors.length === 0) {
                vendorsList.innerHTML = '<div class="no-vendors">No vendors found.</div>';
            } else {
                vendorsList.innerHTML = vendors.map((vendor, index) => `
                    <div class="vendor-card">
                        <div class="vendor-content">
                            <div class="vendor-image">
                                <div class="swiper vendor-swiper-${index}">
                                    <div class="swiper-wrapper">
                                        ${
                                            vendor.images && vendor.images.length > 0
                                                ? vendor.images.map((img, idx) => `
                                                    <div class="swiper-slide">
                                                        <img src="${API_BASE_URL}/api/images/${img.imgName}" 
                                                             alt="${vendor.vendorName} view ${idx + 1}"
                                                             class="vendor-img"
                                                             onerror="this.src='${PLACEHOLDER_IMAGE}'">
                                                    </div>
                                                `).join('')
                                                : `
                                                    <div class="swiper-slide">
                                                        <img src="${PLACEHOLDER_IMAGE}" 
                                                             alt="${vendor.vendorName} placeholder"
                                                             class="vendor-img">
                                                    </div>
                                                `
                                        }
                                    </div>
                                    <div class="swiper-button-prev"></div>
                                    <div class="swiper-button-next"></div>
                                </div>
                            </div>
                            <div class="vendor-details">
                                <h3>${vendor.vendorName || 'Unknown'}</h3>
                                <p><strong>Contact:</strong> ${vendor.vendorContact || 'N/A'}</p>
                                <p><strong>Price:</strong> ₹${vendor.price ? vendor.price.toFixed(2) : 'N/A'}</p>
                                <div class="vendor-specialties">
                                    <h4>Specialties</h4>
                                    ${
                                        vendor.vendorSpecialties && vendor.vendorSpecialties.length > 0
                                            ? `<ul>${vendor.vendorSpecialties.map(s => `<li>${s}</li>`).join('')}</ul>`
                                            : '<p class="no-data">No specialties listed.</p>'
                                    }
                                </div>
                                <div class="vendor-description">
                                    <h4>Description</h4>
                                    <p>${vendor.description || 'No description provided.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');

                // Initialize Swiper for each vendor
                vendors.forEach((_, index) => {
                    new Swiper(`.vendor-swiper-${index}`, {
                        navigation: {
                            nextEl: '.swiper-button-next',
                            prevEl: '.swiper-button-prev',
                        },
                        spaceBetween: 10,
                    });
                });
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
            const message = getFriendlyError(error);
            errorMessage.textContent = message;
            error.style.display = 'block';
            showToast(message, true);
        } finally {
            loading.style.display = 'none';
        }
    };

    // Event listeners
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            fetchVendors(query);
        });
    } else {
        console.warn('Search button not found');
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                fetchVendors(query);
            }
        });
    }

    if (retryButton) {
        retryButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            fetchVendors(query);
        });
    }

    // Initial fetch
    fetchVendors();
});