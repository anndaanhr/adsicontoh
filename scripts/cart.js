/**
 * Zafago Cart System
 * Handles cart operations, displays, and checkout flow
 */

document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const cartTotalElements = document.querySelectorAll('#cart-total');
    
    // Load cart data
    let cartItems = [];
    try {
        cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
        console.error('Error loading cart:', e);
        cartItems = [];
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }
    
    // Update cart count display
    updateCartCount();
    
    function updateCartCount() {
        cartTotalElements.forEach(el => {
            el.textContent = cartItems.length;
        });
    }
    
    // Public API for other scripts
    window.zafagoCart = {
        getCart: () => cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        updateCartDisplay
    };
    
    /**
     * Add item to cart
     */
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
        updateCartCount();
        
        return true;
    }
    
    /**
     * Remove item from cart
     */
    function removeFromCart(index) {
        if (index < 0 || index >= cartItems.length) return false;
        
        // Remove from cart
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
        // Update UI
        updateCartCount();
        
        return true;
    }
    
    /**
     * Clear cart
     */
    function clearCart() {
        cartItems = [];
        localStorage.setItem('cart', JSON.stringify(cartItems));
        updateCartCount();
        return true;
    }
    
    /**
     * Calculate cart total
     */
    function getCartTotal() {
        let total = 0;
        cartItems.forEach(item => {
            const price = parseFloat(item.price);
            const discount = item.discount > 0 ? (price * item.discount / 100) : 0;
            total += (price - discount);
        });
        return total;
    }
    
    /**
     * Update cart display in UI
     */
    function updateCartDisplay() {
        updateCartCount();
    }
});