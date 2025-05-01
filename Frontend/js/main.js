document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const authLink = document.querySelector('.auth-link');
    const loginLink = document.querySelector('.login-link');

    console.log('main.js loaded. DOM elements:', { authLink, loginLink });
    console.log('Initial sessionStorage values:', {
        jwt: sessionStorage.getItem('jwt'),
        name: sessionStorage.getItem('name'),
        email: sessionStorage.getItem('email')
    });

    const updateNav = () => {
        const name = sessionStorage.getItem('name');
        if (!authLink || !loginLink) {
            console.warn('Navigation elements not found:', { authLink, loginLink });
            return;
        }
        if (name) {
            console.log('Updating nav with username:', name);
            loginLink.textContent = name;
            loginLink.href = 'profile.html';
            loginLink.classList.add('user-link');
            loginLink.classList.remove('active');
            if (!document.querySelector('.logout-link')) {
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.className = 'logout-link';
                logoutLink.textContent = 'Logout';
                authLink.appendChild(logoutLink);
                logoutLink.addEventListener('click', () => {
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                });
            }
        } else {
            console.log('No username found in sessionStorage. Setting default');
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
            loginLink.classList.remove('user-link');
            document.querySelector('.logout-link')?.remove();
        }
    };

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            const isActive = navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', isActive);
        });

        navLinks.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        console.warn('Hamburger or nav-links not found:', { hamburger, navLinks });
    }

    updateNav();

    const checkSessionInterval = setInterval(() => {
        const name = sessionStorage.getItem('name');
        if (name && loginLink && loginLink.textContent !== name) {
            console.log('SessionStorage changed. Updating nav with username:', name);
            updateNav();
        }
    }, 1000);

    setTimeout(() => clearInterval(checkSessionInterval), 30000);
});