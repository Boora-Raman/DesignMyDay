const API_BASE_URL = '/api';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorContainer = document.getElementById('login-error');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = {
                email: document.getElementById('login-email').value,
                password: document.getElementById('login-password').value,
            };

            try {
                const response = await axios.post(`${API_BASE_URL}/login`, user, {
                    headers: { 'Content-Type': 'application/json' },
                });

                if (response.status === 200 && response.data.token) {
                    const token = response.data.token;
                    sessionStorage.setItem('jwt', token);
                    sessionStorage.setItem('email', response.data.email || user.email);

                    // Fetch username using /username/{token}
                    try {
                        const usernameResponse = await axios.get(`${API_BASE_URL}/username/${token}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const username = usernameResponse.data;
                        if (username) {
                            sessionStorage.setItem('name', username);
                        }
                    } catch (usernameError) {
                        console.error('Error fetching username:', usernameError);
                    }

                    Toastify({
                        text: response.data.message || 'Login successful!',
                        duration: 3000,
                        gravity: 'top',
                        position: 'right',
                        backgroundColor: '#28a745',
                    }).showToast();

                    window.location.href = 'profile.html';
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (error) {
                console.error('Login error:', error);
                const message = error.response?.data?.message || error.message || 'Invalid credentials or server error';
                errorContainer.textContent = message;
                errorContainer.style.display = 'block';
                Toastify({
                    text: message,
                    duration: 3000,
                    gravity: 'top',
                    position: 'right',
                    backgroundColor: '#dc3545',
                }).showToast();
            }
        });
    }
});
