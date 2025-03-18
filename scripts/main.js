/**
 * Zafago Main Script
 * Entry point for main functionality that applies to all pages
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all common components
    initLoader();
    setupRouting();
    initTheme();
    initSakuraEffect();
    initParallax();
    displayGames();
    
    // Setup image error handling
    if (window.zafagoUtils && window.zafagoUtils.setupImageErrorHandlers) {
      window.zafagoUtils.setupImageErrorHandlers();
    }
    
    /**
     * Page Loader Initialization
     */
    function initLoader() {
      const pageLoader = document.getElementById('page-loader');
      if (!pageLoader) {
        createLoader();
      } else {
        // Hide loader after content loads
        window.addEventListener('load', () => {
          fadeOutLoader();
        });
      }
    }
    
    function createLoader() {
      const loader = document.createElement('div');
      loader.id = 'page-loader';
      loader.className = 'page-loader';
      loader.innerHTML = `
        <div class="loader"></div>
        <div class="loader-text">Loading ZafaGo...</div>
      `;
      document.body.appendChild(loader);
      
      // Hide loader after content loads
      window.addEventListener('load', () => {
        fadeOutLoader();
      });
    }
    
    function fadeOutLoader() {
      const pageLoader = document.getElementById('page-loader');
      if (pageLoader) {
        setTimeout(() => {
          pageLoader.style.opacity = '0';
          setTimeout(() => {
            pageLoader.style.display = 'none';
          }, 500);
        }, 500); // Short delay for smoother perceived loading
      }
    }
    
    /**
     * Setup Routing and Navigation
     */
    function setupRouting() {
      // Add click handlers to all internal links for smooth transitions
      document.querySelectorAll('a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:')) {
          link.addEventListener('click', handleLinkClick);
        }
      });
      
      // Check for transition classes
      if (document.body.classList.contains('page-transition')) {
        // Already has transition class, trigger animation
        document.body.style.animation = 'fadeIn 0.4s ease-out forwards';
      } else {
        // Add transition class
        document.body.classList.add('page-transition');
      }
    }
    
    function handleLinkClick(e) {
      const link = e.currentTarget;
      const href = link.getAttribute('href');
      
      // Don't intercept if modifier keys are pressed (for opening in new tabs)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  
      // Don't intercept if link has external attributes
      if (link.getAttribute('target') === '_blank' || link.getAttribute('rel') === 'external') return;
      
      // Only intercept internal links with .html extension
      if (href && href.endsWith('.html')) {
        e.preventDefault();
        
        // Show loader
        const pageLoader = document.getElementById('page-loader');
        if (pageLoader) {
          pageLoader.style.display = 'flex';
          pageLoader.style.opacity = '1';
        }
        
        // Trigger fade out animation
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.3s ease';
        
        // Navigate after animation
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      }
    }
    
    /**
     * Initialize Theme Handling
     */
    function initTheme() {
      const modeToggle = document.getElementById('mode-toggle');
      
      // Set initial theme
      const currentTheme = localStorage.getItem('theme') || 'dark';
      document.body.classList.toggle('light-mode', currentTheme === 'light');
      updateThemeElements(currentTheme);
      
      // Handle theme toggle click
      if (modeToggle) {
        modeToggle.addEventListener('click', () => {
          const isDarkMode = !document.body.classList.contains('light-mode');
          document.body.classList.toggle('light-mode', isDarkMode);
          localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
          
          // Update UI for theme change
          updateThemeElements(isDarkMode ? 'light' : 'dark');
          
          // Create and dispatch a custom event for components that need to react
          const themeEvent = new Event('themeChange');
          document.dispatchEvent(themeEvent);
        });
      }
    }
    
    function updateThemeElements(theme) {
      // Update theme toggle icon
      const modeToggle = document.getElementById('mode-toggle');
      if (modeToggle) {
        modeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
      }
      
      // Update meta theme color
      let metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (!metaThemeColor) {
        metaThemeColor = document.createElement('meta');
        metaThemeColor.setAttribute('name', 'theme-color');
        document.head.appendChild(metaThemeColor);
      }
      metaThemeColor.setAttribute('content', theme === 'light' ? '#ffffff' : '#0f0f0f');
      
      // Update video background if it exists
      updateVideoBackground(theme);
    }
    
    function updateVideoBackground(theme) {
      const videoSource = document.getElementById('video-source');
      const video = document.querySelector('.layer-sky');
      
      if (videoSource && video) {
        videoSource.src = theme === 'light' 
          ? 'assets/sky-anime-light.mp4' 
          : 'assets/sky-anime-dark.mp4';
        video.load();
        video.play().catch(err => {
          console.warn('Auto-play was prevented:', err);
        });
      }
    }
    
    /**
     * Initialize Sakura Effect
     */
    function initSakuraEffect() {
      const canvas = document.getElementById('sakura-canvas');
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Dynamically adjust particle count based on screen size
      const isMobile = window.innerWidth < 768;
      const particleCount = isMobile ? 30 : Math.min(80, Math.floor(canvas.width * canvas.height / 20000));
      
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
      
      // Draw and update particles
      let animationFrameId;
      
      function animateSakura() {
        if (!canvas.isConnected) {
          // Stop animation if canvas is removed from the DOM
          cancelAnimationFrame(animationFrameId);
          return;
        }
        
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
      
      // Handle resize with debounce
      const handleResize = window.zafagoUtils?.debounce 
        ? window.zafagoUtils.debounce(onResize, 150) 
        : onResize;
      
      function onResize() {
        // Cancel existing animation
        cancelAnimationFrame(animationFrameId);
        
        // Reset canvas dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Restart animation
        animateSakura();
      }
      
      window.addEventListener('resize', handleResize);
      
      // Clean up event listeners on page unload
      window.addEventListener('beforeunload', () => {
        window.removeEventListener('resize', handleResize);
        cancelAnimationFrame(animationFrameId);
      });
      
      // Page visibility API to pause/resume animations when tab is inactive
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Page is hidden, pause heavy animations
          cancelAnimationFrame(animationFrameId);
        } else {
          // Page is visible again, resume animations
          animateSakura();
        }
      });
    }
    
    /**
     * Initialize Parallax Effects
     */
    function initParallax() {
      const parallaxLayers = document.querySelectorAll('.parallax-layer');
      if (parallaxLayers.length === 0) return;
      
      const handleMouseMove = window.zafagoUtils?.debounce 
        ? window.zafagoUtils.debounce(onMouseMove, 10) 
        : onMouseMove;
      
      function onMouseMove(e) {
        const xShift = (e.clientX - window.innerWidth / 2) / 60;
        const yShift = (e.clientY - window.innerHeight / 2) / 60;
        
        parallaxLayers.forEach(layer => {
          const speed = layer.dataset.speed || 0.4;
          layer.style.transform = `translate(${xShift * speed}px, ${yShift * speed}px)`;
        });
      }
      
      document.addEventListener('mousemove', handleMouseMove);
    }
    
    /**
     * Display Game Cards
     */
    function displayGames() {
      const gamesList = document.getElementById('games-list');
      if (!gamesList) return;
      
      // Only create game cards if none exist yet
      if (gamesList.children.length > 0) return;
      
      // Check if game data is available
      if (!window.gameData) {
        console.error('Game data not available');
        return;
      }
      
      // Show first 3 games on home page
      const gamesToShow = window.gameData.slice(0, 3);
      
      // Create game cards
      gamesToShow.forEach((game, index) => {
        const finalPrice = game.discount > 0 
          ? (game.price * (1 - game.discount / 100)).toFixed(2) 
          : game.price.toFixed(2);
        
        const discountText = game.discount > 0 
          ? `<span class="discount">-${game.discount}%</span>` 
          : '';
        
        const card = document.createElement('div');
        card.className = 'game-card fade-in';
        card.style.animationDelay = `${index * 0.1}s`;
        
        card.innerHTML = `
          <div class="img-zoom-container">
            <img src="${game.image}" alt="${game.title}" loading="lazy" class="img-zoom" 
                 onerror="window.zafagoUtils.handleImageError(this, '${game.title}')">
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
    }
  });