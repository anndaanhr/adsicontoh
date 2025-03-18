/**
 * Zafago Authentication System
 * Handles user registration, login, and session management
 */

document.addEventListener('DOMContentLoaded', () => {
  // Cache DOM elements for better performance
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const logoutButtons = document.querySelectorAll('.logout-btn, #logout-link');
  const messageElements = document.querySelectorAll('.message');
  
  // Initialize auth state
  initAuthState();
  
  // Setup login form
  if (loginForm) {
    setupLoginForm();
  }
  
  // Setup register form
  if (registerForm) {
    setupRegisterForm();
  }
  
  // Setup logout buttons
  if (logoutButtons.length > 0) {
    setupLogoutButtons();
  }
  
  // Public API
  window.zafagoAuth = {
    isLoggedIn,
    getCurrentUser,
    logout,
    updateUser
  };
  
  /**
   * Form setup functions
   */
  
  // Setup login form handlers
  function setupLoginForm() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Toggle password visibility
    if (togglePassword) {
      togglePassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          togglePassword.textContent = '👁️‍🗨️';
        } else {
          passwordInput.type = 'password';
          togglePassword.textContent = '👁️';
        }
      });
    }
    
    // Handle form submission
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get input values
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      // Basic validation
      if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
      }
      
      // Email validation
      if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
      }
      
      // Show loading state
      if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
      }
      
      // Login process with artificial delay for UX
      setTimeout(() => {
        const success = loginUser(email, password);
        
        // Hide loading state
        if (loadingSpinner) {
          loadingSpinner.style.display = 'none';
        }
        
        if (success) {
          // Check for redirect
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          
          if (redirect) {
            window.location.href = `${redirect}.html`;
          } else {
            window.location.href = 'index.html';
          }
        }
      }, 1000);
    });
  }
  
  // Setup register form handlers
  function setupRegisterForm() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('toggle-password');
    const strengthIndicator = document.getElementById('strength-indicator');
    const strengthText = document.getElementById('strength-text');
    const loadingSpinner = document.getElementById('loading-spinner');
    
    // Toggle password visibility
    if (togglePassword) {
      togglePassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          togglePassword.textContent = '👁️‍🗨️';
        } else {
          passwordInput.type = 'password';
          togglePassword.textContent = '👁️';
        }
      });
    }
    
    // Real-time password strength
    if (passwordInput && strengthIndicator && strengthText) {
      passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const { strength, feedback } = checkPasswordStrength(password);
        
        // Update indicator
        strengthIndicator.style.width = `${strength}%`;
        
        if (strength <= 25) {
          strengthIndicator.style.backgroundColor = '#ff4040';
          strengthText.textContent = feedback || 'Weak password';
        } else if (strength <= 50) {
          strengthIndicator.style.backgroundColor = '#ffaa00';
          strengthText.textContent = feedback || 'Moderate password';
        } else if (strength <= 75) {
          strengthIndicator.style.backgroundColor = '#aaff00';
          strengthText.textContent = feedback || 'Good password';
        } else {
          strengthIndicator.style.backgroundColor = '#00cc66';
          strengthText.textContent = feedback || 'Strong password';
        }
      });
    }
    
    // Handle form submission
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Get input values
      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      
      // Basic validation
      if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
      }
      
      // Email validation
      if (!isValidEmail(email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
      }
      
      // Password strength validation
      const { strength } = checkPasswordStrength(password);
      if (strength < 50) {
        showMessage('Please choose a stronger password', 'error');
        return;
      }
      
      // Show loading state
      if (loadingSpinner) {
        loadingSpinner.style.display = 'flex';
      }
      
      // Registration process with artificial delay for UX
      setTimeout(() => {
        const success = registerUser(email, password, name);
        
        // Hide loading state
        if (loadingSpinner) {
          loadingSpinner.style.display = 'none';
        }
        
        if (success) {
          showMessage('Registration successful! Redirecting to login...', 'success');
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 1500);
        }
      }, 1000);
    });
  }
  
  // Setup logout buttons
  function setupLogoutButtons() {
    logoutButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
        
        // Use toast for notification
        if (window.zafagoUtils && window.zafagoUtils.showToast) {
          window.zafagoUtils.showToast('You have been logged out successfully', 'success');
        }
        
        // Redirect to home if not already there
        if (window.location.pathname !== '/' && window.location.pathname !== '/index.html') {
          window.location.href = 'index.html';
        } else {
          // Just reload if already on home page
          updateAuthDisplay();
        }
      });
    });
  }
  
  /**
   * Auth helper functions
   */
  
  // Initialize auth state on page load
  function initAuthState() {
    // Handle session expiration
    const user = getCurrentUser();
    if (user && user.expiry && new Date(user.expiry) < new Date()) {
      // Session expired, log out
      logout();
      
      // Show message if on login page
      if (window.location.pathname.includes('login')) {
        showMessage('Your session has expired. Please log in again.', 'info');
      } else if (window.zafagoUtils && window.zafagoUtils.showToast) {
        // Show toast on other pages
        window.zafagoUtils.showToast('Your session has expired. Please log in again.', 'info');
      }
    }
    
    // Update auth display
    updateAuthDisplay();
    
    // Force login for protected pages
    const protectedPages = ['profile.html', 'checkout.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
      window.location.href = `login.html?redirect=${currentPage.split('.')[0]}`;
    }
  }
  
  // Check if email is valid
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }
    
    // Optionally validate domain
    const validDomains = [
      'gmail.com',
      'yahoo.com',
      'outlook.com',
      'hotmail.com',
      'aol.com',
      'icloud.com',
      'protonmail.com',
      'mail.com',
    ];
    
    // Skip domain validation in development for testing
    if (window.location.hostname === 'localhost') {
      return true;
    }
    
    const domain = email.split('@')[1].toLowerCase();
    return validDomains.includes(domain);
  }
  
  // Check password strength
  function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = '';
    
    // No password
    if (!password) {
      return { strength: 0, feedback: 'Enter a password' };
    }
    
    // Length check
    if (password.length < 6) {
      return { 
        strength: 10, 
        feedback: 'Password too short (min 6 characters)' 
      };
    }
    
    // Base strength from length (max 40%)
    strength += Math.min(40, password.length * 4);
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 10;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    // Cap at 100%
    strength = Math.min(100, strength);
    
    // Feedback based on strength
    if (strength < 40) {
      feedback = 'Weak - Add numbers and special characters';
    } else if (strength < 70) {
      feedback = 'Medium - Add special characters';
    } else if (strength < 90) {
      feedback = 'Good - Consider a longer password';
    } else {
      feedback = 'Strong password';
    }
    
    return { strength, feedback };
  }
  
  // Update auth display based on login state
  function updateAuthDisplay() {
    const authLink = document.getElementById('auth-link');
    const profileLinks = document.querySelectorAll('.menu a[href="profile.html"]');
    
    if (!authLink) return;
    
    const isUserLoggedIn = isLoggedIn();
    const user = getCurrentUser();
    
    // Update auth link
    if (isUserLoggedIn) {
      authLink.innerHTML = '<a href="profile.html">My Account</a>';
      
      // Show profile links
      profileLinks.forEach(link => {
        const parentLi = link.closest('li');
        if (parentLi) parentLi.style.display = 'list-item';
      });
    } else {
      authLink.innerHTML = '<a href="login.html">Login</a>';
      
      // Hide profile links
      profileLinks.forEach(link => {
        const parentLi = link.closest('li');
        if (parentLi) parentLi.style.display = 'none';
      });
    }
    
    // Dispatch auth change event for components that depend on auth state
    document.dispatchEvent(new Event('authChange'));
  }
  
  // Show message in message container
  function showMessage(text, type = 'info') {
    messageElements.forEach(msgEl => {
      msgEl.textContent = text;
      msgEl.className = `message ${type}`;
    });
    
    // Fallback to toast notification
    if (messageElements.length === 0 && window.zafagoUtils && window.zafagoUtils.showToast) {
      window.zafagoUtils.showToast(text, type);
    }
  }
  
  /**
   * Auth core functions
   */
  
  // Check if user is logged in
  function isLoggedIn() {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    return !!user.email;
  }
  
  // Get current user
  function getCurrentUser() {
    return JSON.parse(localStorage.getItem('user')) || {};
  }
  
  // Register new user
  function registerUser(email, password, name = '') {
    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || {};
    
    // Check if email already exists
    if (users[email]) {
      showMessage('Email already registered', 'error');
      return false;
    }
    
    // Add new user
    users[email] = {
      email,
      password, // In a real app, password would be hashed
      name: name || email.split('@')[0],
      created: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    return true;
  }
  
  // Login user
  function loginUser(email, password) {
    // Get users
    const users = JSON.parse(localStorage.getItem('users')) || {};
    
    // Check if user exists
    if (!users[email]) {
      showMessage('Email not found', 'error');
      return false;
    }
    
    // Check password
    if (users[email].password !== password) {
      showMessage('Incorrect password', 'error');
      return false;
    }
    
    // Set session expiry (24 hours)
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    
    // Set user in localStorage
    const user = {
      email,
      name: users[email].name,
      expiry: expiry.toISOString()
    };
    
    localStorage.setItem('user', JSON.stringify(user));
    
    // Update auth display
    updateAuthDisplay();
    
    return true;
  }
  
  // Update user info
  function updateUser(updates) {
    const user = getCurrentUser();
    if (!user.email) return false;
    
    // Get all users
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (!users[user.email]) return false;
    
    // Update user properties
    Object.assign(users[user.email], updates);
    
    // Save to localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Update current user session
    Object.assign(user, updates);
    localStorage.setItem('user', JSON.stringify(user));
    
    return true;
  }
  
  // Logout user
  function logout() {
    localStorage.removeItem('user');
    updateAuthDisplay();
    return true;
  }
});