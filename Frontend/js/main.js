document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const signupLink = document.querySelector('.auth-link a[href="signup.html"]')?.parentElement;
    const loginLink = document.querySelector('.login-link');
    const userLink = document.querySelector('.user-link');

    console.log('main.js loaded. DOM elements:', { signupLink, loginLink, userLink });
    console.log('Initial sessionStorage values:', {
        jwt: sessionStorage.getItem('jwt'),
        name: sessionStorage.getItem('name'),
        email: sessionStorage.getItem('email')
    });

    const updateNav = () => {
        const name = sessionStorage.getItem('name');
        if (!signupLink || !loginLink || !userLink) {
            console.warn('Navigation elements not found:', { signupLink, loginLink, userLink });
            return;
        }
        if (name) {
            console.log('Updating nav with username:', name);
            // Hide Signup link
            signupLink.style.display = 'none';
            // Update Login link to username
            loginLink.textContent = name;
            loginLink.href = 'profile.html';
            loginLink.classList.add('user-link');
            loginLink.classList.remove('active');
            userLink.style.display = 'list-item';
            // Add Logout link if not present
            if (!document.querySelector('.logout-link')) {
                const logoutLi = document.createElement('li');
                logoutLi.className = 'auth-link';
                const logoutLink = document.createElement('a');
                logoutLink.href = '#';
                logoutLink.className = 'logout-link';
                logoutLink.textContent = 'Logout';
                logoutLi.appendChild(logoutLink);
                navLinks.appendChild(logoutLi);
                logoutLink.addEventListener('click', () => {
                    sessionStorage.clear();
                    window.location.href = 'login.html';
                });
            }
        } else {
            console.log('No username found in sessionStorage. Setting default');
            // Show Signup link
            signupLink.style.display = 'list-item';
            // Reset Login link
            loginLink.textContent = 'Login';
            loginLink.href = 'login.html';
            loginLink.classList.remove('user-link');
            userLink.style.display = 'none';
            // Remove Logout link
            document.querySelector('.logout-link')?.parentElement.remove();
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