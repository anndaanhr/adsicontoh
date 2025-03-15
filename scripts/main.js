// scripts/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const gamesList = document.getElementById('games-list');
    const cartTotal = document.getElementById('cart-total');
    const skyLayer = document.querySelector('.layer-sky');
    const canvas = document.getElementById('sakura-canvas');
    
    // Cache local storage data
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Performance optimization: Debounce function to limit expensive operations
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
    
    // Function to refresh cart count
    function refreshCart() {
        if (cartTotal) cartTotal.textContent = cartItems.length;
    }
    
    // Initialize cart
    refreshCart();
    
    // Create and add game cards to page
    function initializeGameCards() {
        if (!gamesList) return;
        
        // Clear existing content
        gamesList.innerHTML = '';
        
        // Performance optimization: Only show first 3 games initially for home page
        const gamesToShow = gameData.slice(0, 3);
        
        // Add game cards
        gamesToShow.forEach((game, index) => {
            const finalPrice = game.discount > 0 
                ? (game.price * (1 - game.discount / 100)).toFixed(2) 
                : game.price.toFixed(2);
                
            const discountText = game.discount > 0 
                ? `<span class="discount">-${game.discount}%</span>` 
                : '';
            
            // Create card with animation
            const card = document.createElement('div');
            card.className = 'game-card fade-in';
            card.style.animationDelay = `${index * 0.1}s`;
            
            // Use HTML template with image lazy loading
            card.innerHTML = `
                <div class="img-zoom-container">
                    <img src="${game.image}" alt="${game.title}" loading="lazy" class="img-zoom">
                </div>
                <h3>${game.title}</h3>
                <p>$${finalPrice}${discountText}</p>
                <div class="button-container">
                    <a href="product-detail.html?id=${game.id}" class="details-btn">Details</a>
                    <button class="add-to-cart-btn btn-glow" data-id="${game.id}">Add to Cart</button>
                </div>
            `;
            
            gamesList.appendChild(card);
        });
        
        // Add event listeners to the newly created buttons
        addCartEventListeners();
    }
    
    // Add event listeners to cart buttons
    function addCartEventListeners() {
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }
    
    // Handle add to cart button click
    function handleAddToCart(e) {
        const id = parseInt(e.target.dataset.id);
        const game = gameData.find(g => g.id === id);
        
        if (!game) return;
        
        // Add to cart
        cartItems.push(game);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        refreshCart();
        
        // UI feedback
        e.target.innerHTML = '<span class="icon-bounce">✓</span> Added!';
        e.target.disabled = true;
        e.target.style.background = '#00ccff';
        
        // Reset button after delay
        setTimeout(() => {
            e.target.innerHTML = 'Add to Cart';
            e.target.disabled = false;
            e.target.style.background = '';
        }, 2000);
    }
    
    // Handle parallax effect with debouncing
    function initParallax() {
        if (!skyLayer) return;
        
        const handleMouseMove = debounce((e) => {
            const xShift = (e.clientX - window.innerWidth / 2) / 60;
            const yShift = (e.clientY - window.innerHeight / 2) / 60;
            const speed = skyLayer.dataset.speed || 0.4;
            
            skyLayer.style.transform = `translate(${xShift * speed}px, ${yShift * speed}px)`;
        }, 10);
        
        document.addEventListener('mousemove', handleMouseMove);
    }
    
    // Initialize parallax effect
    initParallax();
    
    // Sakura effect (optimized)
    function initSakuraEffect() {
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Dynamically adjust particle count based on screen size
        const devicePixelRatio = window.devicePixelRatio || 1;
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 30 : Math.min(90, Math.floor(canvas.width * canvas.height / 20000));
        
        const sakuraParticles = [];
        
        class Sakura {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * -canvas.height;
                this.size = Math.random() * 5 + 2;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 2.5 + 1;
                this.opacity = Math.random() * 0.6 + 0.4;
                this.updateColor();
            }
            
            updateColor() {
                const currentMode = localStorage.getItem('theme') || 'dark';
                this.color = currentMode === 'dark' 
                    ? `rgba(255, 64, 129, ${this.opacity})` 
                    : `rgba(0, 204, 255, ${this.opacity})`;
            }
            
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.y > canvas.height) {
                    this.x = Math.random() * canvas.width;
                    this.y = -this.size;
                    this.opacity = Math.random() * 0.6 + 0.4;
                    this.updateColor();
                }
            }
            
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            sakuraParticles.push(new Sakura());
        }
        
        // Draw and update particles (using requestAnimationFrame for performance)
        let animationFrameId;
        
        function animateSakura() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            sakuraParticles.forEach(p => {
                p.update();
                p.draw();
            });
            
            animationFrameId = requestAnimationFrame(animateSakura);
        }
        
        // Start animation
        animateSakura();
        
        // Handle theme changes
        document.addEventListener('themeChange', () => {
            sakuraParticles.forEach(p => p.updateColor());
        });
        
        // Handle resize with debouncing
        const handleResize = debounce(() => {
            // Cancel existing animation
            cancelAnimationFrame(animationFrameId);
            
            // Reset canvas dimensions
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Restart animation
            animateSakura();
        }, 150);
        
        window.addEventListener('resize', handleResize);
        
        // Clean up event listeners on page unload
        window.addEventListener('beforeunload', () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        });
    }
    
    // Initialize Sakura effect
    initSakuraEffect();
    
    // Initialize game cards
    initializeGameCards();
    
    // Page visibility API to pause/resume animations when tab is inactive
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            // Page is hidden, pause heavy animations
            if (canvas) {
                canvas.style.display = 'none';
            }
        } else {
            // Page is visible again, resume animations
            if (canvas) {
                canvas.style.display = 'block';
            }
        }
    });
    
    // Export functions for other scripts to use
    window.zafagoMain = {
        refreshCart,
        addCartEventListeners
    };
});