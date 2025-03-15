document.addEventListener('DOMContentLoaded', () => {
    const cartItemsDiv = document.getElementById('cart-items');
    const totalPriceSpan = document.getElementById('total-price');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const user = JSON.parse(localStorage.getItem('user')) || {};

    function refreshCart() {
        // Update cart page if on cart page
        if (cartItemsDiv) {
            cartItemsDiv.innerHTML = '';
            let total = 0;

            cartItems.forEach((item, index) => {
                const finalPrice = item.discount > 0 ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price;
                total += parseFloat(finalPrice);

                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${item.image}" alt="${item.title}">
                    <h3>${item.title}</h3>
                    <p>$${finalPrice}</p>
                    <button class="btn" data-index="${index}">Remove</button>
                `;
                cartItemsDiv.appendChild(div);
            });

            totalPriceSpan.textContent = `$${total.toFixed(2)}`;
            
            if (cartItems.length === 0) {
                checkoutBtn.textContent = 'Cart is Empty';
                checkoutBtn.disabled = true;
            } else if (!user.email) {
                checkoutBtn.textContent = 'Login to Checkout';
                checkoutBtn.disabled = false; 
            } else {
                checkoutBtn.textContent = 'Proceed to Checkout';
                checkoutBtn.disabled = false;
            }
        }
        
        // Update cart count
        const cartTotalElements = document.querySelectorAll('#cart-total');
        cartTotalElements.forEach(el => {
            el.textContent = cartItems.length;
        });
        
        // Update floating cart if it exists
        updateFloatingCart();
    }
    
    // Floating cart functionality
    function createFloatingCart() {
        // Check if floating cart already exists
        if (document.querySelector('.floating-cart')) return;
        
        // Create cart toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'floating-cart-toggle';
        toggleBtn.innerHTML = `
            <span id="floating-cart-count">${cartItems.length}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
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
        
        // Event listeners
        toggleBtn.addEventListener('click', () => {
            floatingCart.classList.toggle('active');
        });
        
        floatingCart.querySelector('.floating-cart-close').addEventListener('click', () => {
            floatingCart.classList.remove('active');
        });
        
        floatingCart.querySelector('#floating-cart-checkout').addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
        
        // Initial update
        updateFloatingCart();
    }
    
    function updateFloatingCart() {
        const floatingCartItems = document.querySelector('.floating-cart-items');
        const floatingCartCount = document.getElementById('floating-cart-count');
        
        if (!floatingCartItems || !floatingCartCount) return;
        
        floatingCartItems.innerHTML = '';
        floatingCartCount.textContent = cartItems.length;
        
        // Show max 3 items in floating cart
        const itemsToShow = cartItems.slice(0, 3);
        
        if (itemsToShow.length === 0) {
            floatingCartItems.innerHTML = '<p style="text-align: center; color: #888;">Your cart is empty</p>';
            return;
        }
        
        itemsToShow.forEach(item => {
            const finalPrice = item.discount > 0 ? (item.price * (1 - item.discount / 100)).toFixed(2) : item.price;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'floating-cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="floating-cart-item-info">
                    <h4>${item.title}</h4>
                    <p>$${finalPrice}</p>
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

    // Set up event listeners for cart page
    if (cartItemsDiv) {
        cartItemsDiv.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                const index = parseInt(e.target.dataset.index);
                cartItems.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cartItems));
                refreshCart();
            }
        });

        checkoutBtn.addEventListener('click', () => {
            if (cartItems.length === 0) {
                // Do nothing for empty cart
            } else if (!user.email) {
                window.location.href = 'login.html';
            } else {
                window.location.href = 'checkout.html';
            }
        });
    }

    // Create the floating cart on all pages except cart and checkout
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'cart.html' && currentPage !== 'checkout.html') {
        createFloatingCart();
    }

    refreshCart();
});