document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const profileCard = document.querySelector('.profile-card');
    const orderHistory = document.querySelector('.order-history ul');
    const cartTotal = document.getElementById('cart-total');
  
    let users = JSON.parse(localStorage.getItem('users')) || [];
  
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
  

    function isValidEmail(email) {

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return false;
      }
  
      const domain = email.split('@')[1].toLowerCase();
      return validDomains.includes(domain);
    }
  
    function saveUsers() {
      localStorage.setItem('users', JSON.stringify(users));
    }
  
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = registerForm.querySelector('input[type="text"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelector('input[type="password"]').value;
  
        if (!name || !email || !password) {
          alert('Please fill in all fields');
          return;
        }
        if (!isValidEmail(email)) {
          alert('Please use a valid email address (e.g., @gmail.com, @yahoo.com)');
          return;
        }
        if (password.length < 8) {
          alert('Password must be at least 8 characters');
          return;
        }
  
        if (users.some(user => user.email === email)) {
          alert('Email already registered');
          return;
        }
  
        const newUser = { name, email, password };
        users.push(newUser);
        saveUsers();
  
        localStorage.setItem('user', JSON.stringify(newUser));
        alert('Registration successful! Please log in.');
        window.location.href = 'login.html';
      });
    }
  
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
  
        if (!isValidEmail(email)) {
          alert('Please use a valid email address (e.g., @gmail.com, @yahoo.com)');
          return;
        }
  
        const user = users.find(user => user.email === email);
  
        if (!user) {
          alert('Email not found');
          return;
        }
  
        if (user.password !== password) {
          alert('Incorrect password');
          return;
        }
  
        localStorage.setItem('user', JSON.stringify({ name: user.name, email: user.email }));
        window.location.href = 'profile.html';
      });
    }
  
    if (profileCard) {
      const user = JSON.parse(localStorage.getItem('user')) || {};
  
      if (!user.email) {
        window.location.href = 'login.html';
        return;
      }
  
      profileCard.innerHTML = `
        <h3>${user.name || 'Guest'}</h3>
        <p class="email">${user.email}</p>
        <button id="logout">Logout</button>
      `;
  
      let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      if (cartTotal) cartTotal.textContent = cartItems.length;
  
      const orders = JSON.parse(localStorage.getItem(`orders_${user.email}`)) || [];
      if (orders.length === 0) {
        orderHistory.innerHTML = '<li>No orders yet.</li>';
      } else {
        orderHistory.innerHTML = orders.map(order => `
          <li>
            <div class="game-name">${order.game.title} - $${order.game.price.toFixed(2)}</div>
            <span class="order-date">${new Date(order.date).toLocaleString()}</span>
            <button class="redeem-btn" data-order-id="${order.id}">👁️</button>
          </li>
        `).join('');
      }
  
      document.getElementById('logout').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('user');
        window.location.href = 'login.html';
      });
  
      document.querySelectorAll('.redeem-btn').forEach(button => {
        button.addEventListener('click', (e) => {
          const orderId = e.target.dataset.orderId;
          const order = orders.find(o => o.id === parseInt(orderId));
          if (order && !order.redeemed) {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let code = '';
            for (let i = 0; i < 20; i++) {
              if (i === 4 || i === 9 || i === 14) {
                code += '-';
              } else {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
              }
            }
            order.redeemed = true;
            order.redeemCode = code;
            localStorage.setItem(`orders_${user.email}`, JSON.stringify(orders));
  
            const li = e.target.parentElement;
            li.innerHTML += `
              <div class="redeem-code">${code}</div>
            `;
            e.target.disabled = true;
          }
        });
      });
    }
  });