const API_BASE_URL = '/api';

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
        return error.response?.data?.message || 'Error fetching vendors.';
    };

    const fetchVendors = async (query = '') => {
        try {
            loading.style.display = 'flex';
            error.style.display = 'none';
            vendorsList.innerHTML = '';

            // const token = sessionStorage.getItem('jwt');
            // if (!token) {
            //     throw new Error('You must be logged in to view vendors.');
            // }

            console.time('fetchVendors'); // Log API fetch time
            const response = await axios.get(`${API_BASE_URL}/vendors${query ? `?name=${encodeURIComponent(query)}` : ''}`, {
                // headers: { Authorization: `Bearer ${token}` },
            });
            console.timeEnd('fetchVendors');

            const vendors = response.data;
            console.log('Vendors API response:', vendors); // Debug API response

            if (!Array.isArray(vendors)) {
                throw new Error('Invalid response format from vendors endpoint.');
            }

            if (vendors.length === 0) {
                vendorsList.innerHTML = '<div class="no-vendors">No vendors listed.</div>';
                return;
            }

            console.time('renderVendors'); // Log rendering time
            vendorsList.innerHTML = vendors.map((vendor, index) => {
                // Validate vendor fields
                const vendorName = vendor.vendorName || 'Unknown';
                const vendorContact = vendor.vendorContact && vendor.vendorContact.trim() ? vendor.vendorContact : 'N/A';
                const price = vendor.price && !isNaN(vendor.price) ? parseFloat(vendor.price).toFixed(2) : 'N/A';
                const description = vendor.description && vendor.description.trim() ? vendor.description : 'No description provided.';
                const specialties = Array.isArray(vendor.vendorSpecialties) && vendor.vendorSpecialties.length > 0
                    ? vendor.vendorSpecialties.filter(s => s && s.trim())
                    : [];

                // Log vendor data for debugging
                console.log(`Vendor ${index}:`, { vendorName, vendorContact, price, specialties, description });

                // Render images with lazy loading
                const imagesHTML = vendor.images && Array.isArray(vendor.images) && vendor.images.length > 0
                    ? vendor.images.map((img, idx) => `
                        <div class="swiper-slide">
                            <img src="${API_BASE_URL}/api/images/${img.imgName}" 
                                 alt="${vendorName} view ${idx + 1}"
                                 class="vendor-img"
                                 loading="lazy"
                                 onerror="this.src='${PLACEHOLDER_IMAGE}'">
                        </div>
                    `).join('')
                    : `
                        <div class="swiper-slide">
                            <img src="${PLACEHOLDER_IMAGE}" 
                                 alt="${vendorName} placeholder"
                                 class="vendor-img"
                                 loading="lazy">
                        </div>
                    `;

                return `
                    <div class="vendor-card">
                        <div class="vendor-content">
                            <div class="vendor-image">
                                <div class="swiper vendor-swiper-${index}">
                                    <div class="swiper-wrapper">${imagesHTML}</div>
                                    <div class="swiper-button-prev"></div>
                                    <div class="swiper-button-next"></div>
                                </div>
                            </div>
                            <div class="vendor-details">
                                <h3>${vendorName}</h3>
                                <p><strong>Contact:</strong> ${vendorContact}</p>
                                <p><strong>Price:</strong> ₹${price}</p>
                                <div class="vendor-specialties">
                                    <h4>Specialties</h4>
                                    ${
                                        specialties.length > 0
                                            ? `<ul>${specialties.map(s => `<li>${s}</li>`).join('')}</ul>`
                                            : '<p class="no-data">No specialties listed.</p>'
                                    }
                                </div>
                                <div class="vendor-description">
                                    <h4>Description</h4>
                                    <p>${description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            console.timeEnd('renderVendors');

            // Defer Swiper initialization to improve initial render
            setTimeout(() => {
                console.time('initSwiper');
                vendors.forEach((_, index) => {
                    new Swiper(`.vendor-swiper-${index}`, {
                        navigation: {
                            nextEl: `.vendor-swiper-${index} .swiper-button-next`,
                            prevEl: `.vendor-swiper-${index} .swiper-button-prev`,
                        },
                        spaceBetween: 10,
                    });
                });
                console.timeEnd('initSwiper');
            }, 100);

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
    } else {
        console.warn('Search input not found');
    }

    if (retryButton) {
        retryButton.addEventListener('click', () => {
            const query = searchInput.value.trim();
            fetchVendors(query);
        });
    } else {
        console.warn('Retry button not found');
    }

    // Initial fetch
    fetchVendors();
});
