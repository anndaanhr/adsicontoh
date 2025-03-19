/**
 * Zafago Utilities - Common helper functions
 */

// Handle image loading errors
function handleImageError(img, fallbackText) {
    img.onerror = () => {
      // Try to load from assets folder first
      if (!img.src.includes('via.placeholder.com')) {
        const gameName = fallbackText || img.alt || 'Game';
        img.src = `https://via.placeholder.com/300x200?text=${encodeURIComponent(gameName)}`;
      }
    };
    
    // Trigger the error handler if image is already loaded but failed
    if (img.complete && img.naturalHeight === 0) {
      img.onerror();
    }
  }
  
  // Apply image error handlers to all images on the page
  function setupImageErrorHandlers() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      if (!img.hasAttribute('data-error-handled')) {
        handleImageError(img);
        img.setAttribute('data-error-handled', 'true');
      }
    });
  }
  
  // Format price with discount applied
  function formatPrice(price, discount = 0) {
    if (!price && price !== 0) return '$0.00';
    
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) return '$0.00';
    
    const finalPrice = discount > 0 
      ? numericPrice * (1 - discount / 100) 
      : numericPrice;
      
    return `$${finalPrice.toFixed(2)}`;
  }
  
  // Generate random redemption codes
  function generateRedemptionCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    
    for (let i = 0; i < 20; i++) {
      if (i === 4 || i === 9 || i === 14) {
        code += '-';
      } else {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    }
    
    return code;
  }
  
  // Debounce function to limit expensive operations
  function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
      const context = this, args = arguments;
      const later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }
  
  // Show toast notification
  function showToast(message, type = 'info', duration = 3000) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    
    // Add to DOM
    document.body.appendChild(toast);
    
    // Show with animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // Hide after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);
  }
  
/**
 * Zafago Utilities - Common helper functions
 * (Existing content preserved, adding theme functionality)
 */

// ... (your existing utilities.js code: handleImageError, formatPrice, etc.) ...

// Theme toggle function
function toggleTheme() {
  const body = document.body;
  const isLightMode = body.classList.contains('light-mode');
  
  if (isLightMode) {
      body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
      document.getElementById('theme-toggle').textContent = 'Switch to Light Mode';
  } else {
      body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
      document.getElementById('theme-toggle').textContent = 'Switch to Dark Mode';
  }
}

// Initialize theme based on localStorage
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const body = document.body;
  
  if (savedTheme === 'light') {
      body.classList.add('light-mode');
      document.getElementById('theme-toggle').textContent = 'Switch to Dark Mode';
  } else {
      body.classList.remove('light-mode'); // Ensure dark mode is default
      document.getElementById('theme-toggle').textContent = 'Switch to Light Mode';
  }
}

// Setup theme toggle event listener
document.addEventListener('DOMContentLoaded', () => {
  initTheme(); // Set initial theme
  
  const themeToggleBtn = document.getElementById('theme-toggle');
  if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', toggleTheme);
  }
  
  // Existing utility setup calls
  setupImageErrorHandlers();
});

// Export utilities to window object (adding theme functions)
window.zafagoUtils = {
  handleImageError,
  setupImageErrorHandlers,
  formatPrice,
  generateRedemptionCode,
  debounce,
  showToast,
  toggleTheme,  // Expose toggleTheme if other scripts need it
  initTheme     // Expose initTheme if needed
};