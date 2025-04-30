const API_BASE_URL = 'http://localhost:8085';

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signup-form');
    const errorContainer = document.getElementById('signup-error');

    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = {
                name: document.getElementById('signup-name').value,
                email: document.getElementById('signup-email').value,
                password: document.getElementById('signup-password').value,
            };

            const image = document.getElementById('signup-profile-pic').files[0];

            const formData = new FormData();
            formData.append('user', new Blob([JSON.stringify(user)], { type: 'application/json' }));
            if (image) formData.append('image', image);

            try {
                await axios.post(`${API_BASE_URL}/signup`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                Toastify({
                    text: 'Signup successful! Please login.',
                    duration: 3000,
                    gravity: 'top',
                    position: 'right',
                    backgroundColor: '#28a745',
                }).showToast();

                window.location.href = 'login.html';
            } catch (error) {
                console.error('Signup error:', error);
                const message = error.response?.data?.message || error.message || 'Signup failed!';
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