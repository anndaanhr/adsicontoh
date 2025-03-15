// Handle navigation and theme toggle
document.addEventListener('DOMContentLoaded', () => {
    // Set up auth link
    const authLinkDiv = document.getElementById('auth-link');
    const user = JSON.parse(localStorage.getItem('user')) || {};
    
    if (authLinkDiv) {
        if (user.email) {
            // User is logged in
            authLinkDiv.innerHTML = `<a href="login.html" id="logout-link">Logout</a>`;
            
            // Set up logout functionality
            document.getElementById('logout-link').addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('user');
                alert('You have been logged out');
                window.location.href = 'index.html';
            });
        } else {
            // User is not logged in
            authLinkDiv.innerHTML = `<a href="login.html">Login</a>`;
        }
    }
    
    // Theme toggle button
    const modeToggleBtn = document.getElementById('mode-toggle');
    
    if (modeToggleBtn) {
        const currentMode = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('light-mode', currentMode === 'light');
        modeToggleBtn.textContent = currentMode === 'light' ? '🌙' : '☀️';
        
        modeToggleBtn.addEventListener('click', () => {
            const newMode = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            document.body.classList.toggle('light-mode');
            localStorage.setItem('theme', newMode);
            modeToggleBtn.textContent = newMode === 'light' ? '🌙' : '☀️';
            
            // Dispatch theme change event for other components to listen to
            document.dispatchEvent(new CustomEvent('themeChange'));
        });
    } else {
        // If no toggle button exists, still set the theme based on saved preference
        const currentMode = localStorage.getItem('theme') || 'dark';
        document.body.classList.toggle('light-mode', currentMode === 'light');
    }
    
    // Update cart count
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        cartTotal.textContent = cartItems.length;
    }
    
    // Handle active menu item
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuItems = document.querySelectorAll('.menu a');
    
    menuItems.forEach(item => {
        const href = item.getAttribute('href');
        if (href === currentPage) {
            item.classList.add('active');
        }
    });
});