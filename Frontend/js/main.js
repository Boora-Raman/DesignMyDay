document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const authLink = document.querySelector('.auth-link');
    const loginLink = document.querySelector('.login-link');

    console.log('main.js loaded. DOM elements:', { authLink, loginLink }); // Debug log
    console.log('Initial sessionStorage values:', {
        jwt: sessionStorage.getItem('jwt'),
        name: sessionStorage.getItem('name'),
        email: sessionStorage.getItem('email')
    }); // Debug log

    // Update navigation bar based on login status
    const updateNav = () => {
        const name = sessionStorage.getItem('name');
        if (!authLink || !loginLink) {
            console.warn('Navigation elements not found:', { authLink, loginLink });
            return;
        }
        if (name) {
            console.log('Updating nav with username:', name); // Debug log
            loginLink.textContent = name;
            loginLink.href = 'profile.html';
            loginLink.classList.add('user-link');
            loginLink.classList.remove('active');
        } else {
            console.log('No username found in sessionStorage. Setting -----');
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
            loginLink.classList.remove('user-link');
        }
    };

    // Hamburger menu toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });

        // Close menu when a link is clicked
        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    } else {
        console.warn('Hamburger or nav-links not found:', { hamburger, navLinks });
    }

    // Run on page load
    updateNav();

    // Persistent check for sessionStorage changes
    const checkSessionInterval = setInterval(() => {
        const name = sessionStorage.getItem('name');
        if (name && loginLink && loginLink.textContent !== name) {
            console.log('SessionStorage changed. Updating nav with username:', name);
            updateNav();
        }
    }, 1000);

    // Stop interval after 30 seconds to avoid unnecessary checks
    setTimeout(() => clearInterval(checkSessionInterval), 30000);

    // Re-run updateNav after a short delay to handle redirects
    setTimeout(updateNav, 100);
});