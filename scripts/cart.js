/**
 * Zafago Cart System
 * Handles cart operations, displays, and checkout flow
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const cartItemsDiv = document.getElementById('cart-items');
    const subtotalPriceSpan = document.getElementById('subtotal-price');
    const discountAmountSpan = document.getElementById('discount-amount');
    const totalPriceSpan = document.getElementById('total-price');
    const cartTotalElements = document.querySelectorAll('#cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const emptyCartDiv = document.getElementById('empty-cart');
    const applyPromoBtn = document.getElementById('apply-promo');
    const promoCodeInput = document.getElementById('promo-code');
    
    // Cart state
    let cartItems = [];
    let promoApplied = false;
    
    // Initialize cart
    loadCart();
    setupEventListeners();
    createFloatingCart();
    
    // Public API for other scripts
    window.zafagoCart = {
      getCart: () => cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      refreshCart,
      getCartTotal
    };
    
    /**
     * Cart initialization and setup
     */
    
    // Load cart from localStorage
    function loadCart() {
      try {
        cartItems = JSON.parse(localStorage.getItem('cart')) || [];
      } catch (e) {
        console.error('Error loading cart:', e);
        cartItems = [];
        localStorage.setItem('cart', JSON.stringify(cartItems));
      }
      
      refreshCart();
    }
    
    // Setup event listeners for cart page
    function setupEventListeners() {
      // Cart items removal on cart page
      if (cartItemsDiv) {
        cartItemsDiv.addEventListener('click', (e) => {
          if (e.target.classList.contains('remove-btn')) {
            const index = parseInt(e.target.dataset.index);
            
            // Add animation
            const item = e.target.closest('.cart-item');
            if (item) {
              item.classList.add('removing');
              
              setTimeout(() => {
                removeFromCart(index);
              }, 300);
            } else {
              removeFromCart(index);
            }
          }
        });
      }
      
      // Checkout button
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
          if (cartItems.length === 0) {
            // Do nothing for empty cart
          } else if (!window.zafagoAuth?.isLoggedIn()) {
            window.location.href = 'login.html?redirect=checkout';
          } else {
            window.location.href = 'checkout.html';
          }
        });
      }
      
      // Promo code application
      if (applyPromoBtn && promoCodeInput) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
      }
      
      // Add listeners for dynamically loaded content
      document.addEventListener('click', (e) => {
        // Add to cart buttons
        if (e.target.classList.contains('add-to-cart-btn')) {
          handleAddToCartClick(e);
        }
      });
    }
    
    /**
     * Floating cart creation and management
     */
    
    // Create floating cart if it doesn't exist
    function createFloatingCart() {
      // Check if floating cart already exists or if we're on cart/checkout page
      const currentPage = window.location.pathname.split('/').pop();
      if (document.querySelector('.floating-cart') || 
          currentPage === 'cart.html' || 
          currentPage === 'checkout.html') {
        return;
      }
      
      // Create cart toggle button
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'floating-cart-toggle';
      toggleBtn.innerHTML = `
        <span id="floating-cart-count">${cartItems.length}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
      `;
      
      // Create floating cart
      const floatingCart = document.createElement('div');
      floatingCart.className = 'floating-cart';
      floatingCart.innerHTML = `
        <div class="floating-cart-header">
          <h3>Your Cart</h3>
          <button class="floating-cart-close">×</button>
        </div>
        <div class="floating-cart-items"></div>
        <div class="floating-cart-actions">
          <button class="btn" id="floating-cart-checkout">View Cart</button>
        </div>
      `;
      
      // Append elements to body
      document.body.appendChild(toggleBtn);
      document.body.appendChild(floatingCart);
      
      // Add event listeners
      toggleBtn.addEventListener('click', () => {
        floatingCart.classList.toggle('active');
        updateFloatingCart(); // Update contents when opened
      });
      
      floatingCart.querySelector('.floating-cart-close').addEventListener('click', () => {
        floatingCart.classList.remove('active');
      });
      
      floatingCart.querySelector('#floating-cart-checkout').addEventListener('click', () => {
        window.location.href = 'cart.html';
      });
      
      // Update floating cart contents
      updateFloatingCart();
    }
    
    // Update floating cart contents
    function updateFloatingCart() {
      const floatingCartItems = document.querySelector('.floating-cart-items');
      const floatingCartCount = document.getElementById('floating-cart-count');
      
      if (!floatingCartItems || !floatingCartCount) return;
      
      floatingCartItems.innerHTML = '';
      floatingCartCount.textContent = cartItems.length;
      
      // Show empty message if cart is empty
      if (cartItems.length === 0) {
        floatingCartItems.innerHTML = '<p style="text-align: center; color: #888;">Your cart is empty</p>';
        return;
      }
      
      // Show up to 3 items in floating cart
      const itemsToShow = cartItems.slice(0, 3);
      
      itemsToShow.forEach((item, index) => {
        const finalPrice = item.discount > 0 
          ? window.zafagoUtils?.formatPrice(item.price, item.discount) || `$${(item.price * (1 - item.discount / 100)).toFixed(2)}`
          : window.zafagoUtils?.formatPrice(item.price) || `$${parseFloat(item.price).toFixed(2)}`;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'floating-cart-item';
        cartItem.innerHTML = `
          <img src="${item.image}" alt="${item.title}" onerror="window.zafagoUtils.handleImageError(this, '${item.title}')">
          <div class="floating-cart-item-info">
            <h4>${item.title}</h4>
            <p>${finalPrice}</p>
          </div>
        `;
        
        floatingCartItems.appendChild(cartItem);
      });
      
      // Show the number of additional items if more than 3
      if (cartItems.length > 3) {
        const moreItems = document.createElement('p');
        moreItems.style.textAlign = 'center';
        moreItems.style.fontStyle = 'italic';
        moreItems.style.color = '#888';
        moreItems.textContent = `+ ${cartItems.length - 3} more item(s)`;
        floatingCartItems.appendChild(moreItems);
      }
    }
    
    /**
     * Cart operations
     */
    
    // Add item to cart
    function addToCart(item) {
      // Validate item
      if (!item || !item.id || !item.title) {
        console.error('Invalid item:', item);
        return false;
      }
      
      // Add to cart
      cartItems.push(item);
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Update UI
      refreshCart();
      
      // Show feedback
      if (window.zafagoUtils?.showToast) {
        window.zafagoUtils.showToast(`${item.title} added to cart!`, 'success');
      }
      
      return true;
    }
    
    // Remove item from cart
    function removeFromCart(index) {
      if (index < 0 || index >= cartItems.length) return false;
      
      // Get item before removing (for notification)
      const item = cartItems[index];
      
      // Remove from cart
      cartItems.splice(index, 1);
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      // Update UI
      refreshCart();
      
      // Show feedback
      if (window.zafagoUtils?.showToast) {
        window.zafagoUtils.showToast(`${item.title} removed from cart`, 'info');
      }
      
      return true;
    }
    
    // Clear cart
    function clearCart() {
      cartItems = [];
      localStorage.setItem('cart', JSON.stringify(cartItems));
      refreshCart();
      return true;
    }
    
    // Apply promo code
    function applyPromoCode() {
      if (!promoCodeInput) return;
      
      const promoCode = promoCodeInput.value.trim().toUpperCase();
      
      // Valid promo codes
      const validPromoCodes = {
        'WELCOME10': 10,  // 10% discount
        'SUMMER25': 25,   // 25% discount
        'GAME50': 50      // 50% discount
      };
      
      if (validPromoCodes[promoCode]) {
        promoApplied = {
          code: promoCode,
          discount: validPromoCodes[promoCode]
        };
        
        // Disable input and button
        if (applyPromoBtn) {
          applyPromoBtn.textContent = 'Applied';
          applyPromoBtn.disabled = true;
        }
        if (promoCodeInput) {
          promoCodeInput.disabled = true;
        }
        
        // Save to session storage
        sessionStorage.setItem('promoCode', JSON.stringify(promoApplied));
        
        // Recalculate totals
        calculateTotals();
        
        // Show success message
        const promoSection = document.querySelector('.promo-code');
        if (promoSection) {
          const message = document.createElement('div');
          message.className = 'promo-message success';
          message.textContent = `Promo code applied! ${promoApplied.discount}% discount`;
          promoSection.appendChild(message);
          
          setTimeout(() => {
            message.remove();
          }, 3000);
        }
        
        // Show toast
        if (window.zafagoUtils?.showToast) {
          window.zafagoUtils.showToast(`Promo code ${promoCode} applied! ${promoApplied.discount}% discount`, 'success');
        }
      } else {
        // Show error message
        const promoSection = document.querySelector('.promo-code');
        if (promoSection) {
          const message = document.createElement('div');
          message.className = 'promo-message error';
          message.textContent = 'Invalid promo code';
          promoSection.appendChild(message);
          
          setTimeout(() => {
            message.remove();
          }, 3000);
        }
        
        // Show toast
        if (window.zafagoUtils?.showToast) {
          window.zafagoUtils.showToast('Invalid promo code', 'error');
        }
      }
    }
    
    /**
     * Cart display and calculations
     */
    
    // Calculate cart totals
    function calculateTotals() {
      // Get promo code from session storage
      if (!promoApplied) {
        try {
          const savedPromo = JSON.parse(sessionStorage.getItem('promoCode'));
          if (savedPromo && savedPromo.code) {
            promoApplied = savedPromo;
            
            // Update promo code UI if available
            if (promoCodeInput && applyPromoBtn) {
              promoCodeInput.value = savedPromo.code;
              promoCodeInput.disabled = true;
              applyPromoBtn.textContent = 'Applied';
              applyPromoBtn.disabled = true;
            }
          }
        } catch (e) {
          console.error('Error loading promo code:', e);
        }
      }
      
      let subtotal = 0;
      let discount = 0;
      
      cartItems.forEach(item => {
        const itemPrice = parseFloat(item.price);
        const itemDiscount = item.discount > 0 ? (itemPrice * item.discount / 100) : 0;
        
        subtotal += itemPrice;
        discount += itemDiscount;
      });
      
      // Apply promo code if valid
      if (promoApplied && promoApplied.discount) {
        discount += subtotal * (promoApplied.discount / 100);
      }
      
      const total = Math.max(0, subtotal - discount);
      
      // Update UI if elements exist
      if (subtotalPriceSpan) subtotalPriceSpan.textContent = `$${subtotal.toFixed(2)}`;
      if (discountAmountSpan) discountAmountSpan.textContent = `-$${discount.toFixed(2)}`;
      if (totalPriceSpan) totalPriceSpan.textContent = `$${total.toFixed(2)}`;
      
      return { subtotal, discount, total };
    }
    
    // Get cart total (for other components)
    function getCartTotal() {
      return calculateTotals().total;
    }
    
    // Refresh cart UI
    function refreshCart() {
      // Update cart total count everywhere
      cartTotalElements.forEach(el => {
        el.textContent = cartItems.length;
      });
      
      // Update floating cart
      updateFloatingCart();
      
      // Update cart page if on it
      if (cartItemsDiv) {
        // Clear cart items
        while (cartItemsDiv.firstChild && cartItemsDiv.firstChild !== emptyCartDiv) {
          cartItemsDiv.removeChild(cartItemsDiv.firstChild);
        }
        
        // Show/hide empty cart message
        if (cartItems.length === 0) {
          if (emptyCartDiv) emptyCartDiv.style.display = 'flex';
          if (checkoutBtn) {
            checkoutBtn.textContent = 'Cart is Empty';
            checkoutBtn.disabled = true;
          }
          
          // Hide summary if it exists
          const cartSummary = document.getElementById('cart-summary');
          if (cartSummary) cartSummary.style.display = 'none';
          
          return;
        } else {
          if (emptyCartDiv) emptyCartDiv.style.display = 'none';
          if (checkoutBtn) {
            const isLoggedIn = window.zafagoAuth?.isLoggedIn && window.zafagoAuth.isLoggedIn();
            checkoutBtn.textContent = isLoggedIn ? 'Proceed to Checkout' : 'Login to Checkout';
            checkoutBtn.disabled = false;
          }
          
          // Show summary if it exists
          const cartSummary = document.getElementById('cart-summary');
          if (cartSummary) cartSummary.style.display = 'block';
        }
        
        // Add items to cart
        cartItems.forEach((item, index) => {
          const finalPrice = item.discount > 0
            ? (item.price * (1 - item.discount / 100)).toFixed(2)
            : parseFloat(item.price).toFixed(2);
          
          const cartItem = document.createElement('div');
          cartItem.className = 'cart-item';
          
          cartItem.innerHTML = `
            <div class="item-image">
              <img src="${item.image}" alt="${item.title}" onerror="window.zafagoUtils.handleImageError(this, '${item.title}')">
            </div>
            <div class="item-details">
              <h3>${item.title}</h3>
              <div class="item-price">
                ${item.discount > 0 ?
                `<span class="original-price">$${parseFloat(item.price).toFixed(2)}</span>
                <span class="discount-badge">-${item.discount}%</span>` : ''}
                <span class="final-price">$${finalPrice}</span>
              </div>
            </div>
            <div class="item-actions">
              <button class="remove-btn" data-index="${index}">Remove</button>
            </div>
          `;
          
          cartItemsDiv.appendChild(cartItem);
        });
        
        // Calculate totals
        calculateTotals();
      }
    }
    
    /**
     * Event handlers
     */
    
    // Handle add to cart button clicks
    function handleAddToCartClick(e) {
      const id = parseInt(e.target.dataset.id);
      if (!id) return;
      
      // Find game in window.gameData
      const game = window.gameData ? window.gameData.find(g => g.id === id) : null;
      
      if (game) {
        // Add to cart
        addToCart(game);
        
        // Button feedback
        e.target.innerHTML = '<span class="icon-bounce">✓</span> Added!';
        e.target.disabled = true;
        
        // Store original background to restore it later
        const originalBackground = e.target.style.background;
        e.target.style.background = window.getComputedStyle(document.body).getPropertyValue('--success-color') || '#00ccff';
        
        setTimeout(() => {
          e.target.textContent = 'Add to Cart';
          e.target.disabled = false;
          e.target.style.background = originalBackground;
        }, 2000);
        
        // Track for recommendations if feature API available
        if (game.category) {
          document.dispatchEvent(new CustomEvent('gamePurchased', {
            detail: {
              gameId: game.id,
              gameCategory: game.category
            }
          }));
        }
      }
    }
  });