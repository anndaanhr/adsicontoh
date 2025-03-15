// scripts/navbar.js
document.addEventListener('DOMContentLoaded', () => {
    // Handle theme toggle
    const modeToggle = document.getElementById('mode-toggle');
    
    // Handle active menu item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.menu a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        }
    });
    
    // Initial theme setup
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.toggle('light-mode', currentTheme === 'light');
    modeToggle.textContent = currentTheme === 'light' ? '🌙' : '☀️';
    
    // Theme toggle click handler
    modeToggle.addEventListener('click', () => {
        const isDarkMode = !document.body.classList.contains('light-mode');
        document.body.classList.toggle('light-mode', isDarkMode);
        modeToggle.textContent = isDarkMode ? '🌙' : '☀️';
        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
        
        // Create and dispatch a custom event for components that need to react
        const themeEvent = new Event('themeChange');
        document.dispatchEvent(themeEvent);
    });
    
    // Setup auth link and profile visibility
    const authLink = document.getElementById('auth-link');
    const profileMenuItem = document.querySelector('.menu li a[href="profile.html"]');
    if (authLink && profileMenuItem) {
        updateAuthState();
    }
    
    function updateAuthState() {
        const user = JSON.parse(localStorage.getItem('user')) || {};
        const profileMenuItem = document.querySelector('.menu li a[href="profile.html"]');
        const profileParent = profileMenuItem ? profileMenuItem.parentElement : null;
        
        if (user.email) {
            // User is logged in - show profile, hide login
            if (profileParent) profileParent.style.display = 'list-item';
            authLink.innerHTML = `<a href="#" id="logout-link">Logout</a>`;
            
            // Setup logout handler
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('user');
                alert('You have been logged out successfully');
                updateAuthState();
                // Redirect to home if on profile page
                if (window.location.pathname.includes('profile.html')) {
                    window.location.href = 'index.html';
                }
            });
        } else {
            // User is not logged in - hide profile, show login
            if (profileParent) profileParent.style.display = 'none';
            authLink.innerHTML = `<a href="login.html">Login</a>`;
        }
    }
    
    // Mobile Menu Toggle
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    
    const navbar = document.querySelector('.navbar');
    const menu = document.querySelector('.menu');
    
    // Insert the menu toggle before the menu
    navbar.insertBefore(menuToggle, menu);
    
    // Add click event to toggle menu
    menuToggle.addEventListener('click', function() {
        menu.classList.toggle('active');
        this.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close menu when clicking on a menu item
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        const isMenuToggle = e.target.closest('.menu-toggle');
        const isMenu = e.target.closest('.menu');
        
        if (!isMenuToggle && !isMenu && menu.classList.contains('active')) {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Handle resize events
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && menu.classList.contains('active')) {
            menu.classList.remove('active');
            menuToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // Event listener for authentication changes
    document.addEventListener('authChange', () => {
        updateAuthState();
    });
    
    // Handle login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Simple authentication (in a real app, this would be a server request)
            if (email && password) {
                const user = {
                    email: email,
                    name: email.split('@')[0]
                };
                localStorage.setItem('user', JSON.stringify(user));
                
                // Dispatch auth change event
                document.dispatchEvent(new Event('authChange'));
                
                // Redirect
                window.location.href = 'index.html';
            }
        });
    }
    
    // Handle register form submission
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const name = document.getElementById('name').value;
            
            if (email && password) {
                const user = {
                    email: email,
                    name: name || email.split('@')[0]
                };
                localStorage.setItem('user', JSON.stringify(user));
                
                // Dispatch auth change event
                document.dispatchEvent(new Event('authChange'));
                
                // Redirect
                window.location.href = 'index.html';
            }
        });
    }
});