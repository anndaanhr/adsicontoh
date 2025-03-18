/**
 * Zafago Product Detail Script
 * Handles product display, reviews, and related functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    // Elements
    const productTitle = document.getElementById('product-title');
    const productImg = document.getElementById('product-img');
    const productDesc = document.getElementById('product-desc');
    const productPrice = document.getElementById('product-price');
    const productDiscount = document.getElementById('product-discount');
    const productRating = document.getElementById('product-rating');
    const productCategory = document.getElementById('product-category');
    const addToCartBtn = document.getElementById('add-to-cart');
    const addToWishlistBtn = document.getElementById('add-to-wishlist');
    const reviewsContainer = document.getElementById('reviews-container');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const pageLoader = document.getElementById('page-loader');
    const reviewForm = document.getElementById('review-form');
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingValue = document.getElementById('rating-value');
    const reviewText = document.getElementById('review-text');
    const submitReviewBtn = document.getElementById('submit-review');
    
    // Initialize
    init();
    
    /**
     * Initialization function
     */
    function init() {
      // Show loading state
      showLoader(true);
      
      // Attempt to load product
      loadProduct();
      
      // Setup event listeners
      setupEventListeners();
    }
    
    /**
     * Load product data
     */
    function loadProduct() {
      // Check if game data is available
      if (!window.gameData) {
        console.error("Game data not available");
        showLoader(false);
        showErrorState("Could not load game data");
        return;
      }
      
      // Find product by ID
      const product = window.gameData.find(g => g.id === productId);
      
      if (!product) {
        console.error(`Product with ID ${productId} not found`);
        showLoader(false);
        showErrorState("Game not found");
        return;
      }
      
      // Display product info
      displayProductInfo(product);
      
      // Load reviews
      loadReviews(productId);
      
      // Load recommendations
      loadRecommendations(product);
      
      // Add to recently viewed
      addToRecentlyViewed(productId);
      
      // Hide loader
      showLoader(false);
    }
    
    /**
     * Display product information
     */
    function displayProductInfo(product) {
      // Set document title
      document.title = `ZafaGo - ${product.title}`;
      
      // Set product information
      if (productTitle) productTitle.textContent = product.title;
      if (productDesc) productDesc.textContent = product.desc;
      
      // Set product image with error handling
      if (productImg) {
        productImg.src = product.image;
        productImg.alt = product.title;
        if (window.zafagoUtils && window.zafagoUtils.handleImageError) {
          window.zafagoUtils.handleImageError(productImg, product.title);
        }
      }
      
      // Set price and discount
      const finalPrice = product.discount > 0 
        ? (product.price * (1 - product.discount / 100)).toFixed(2) 
        : product.price.toFixed(2);
        
      if (productPrice) productPrice.textContent = `$${finalPrice}`;
      
      // Show/hide discount
      if (productDiscount) {
        if (product.discount > 0) {
          productDiscount.textContent = `-${product.discount}%`;
          productDiscount.style.display = 'inline-block';
        } else {
          productDiscount.style.display = 'none';
        }
      }
      
      // Set rating stars
      if (productRating) {
        productRating.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
          const star = document.createElement('span');
          star.textContent = i <= product.rating ? '★' : '☆';
          productRating.appendChild(star);
        }
      }
      
      // Set category
      if (productCategory) {
        productCategory.textContent = product.category
          ? product.category.charAt(0).toUpperCase() + product.category.slice(1)
          : 'Unknown';
      }
      
      // Update wishlist button state
      updateWishlistButtonState();
      
      // Check cart button state
      updateCartButtonState(product.id);
    }
    
    /**
     * Load reviews for the product
     */
    function loadReviews(productId) {
      if (!reviewsContainer) return;
      
      // Get reviews from localStorage
      let allReviews = {};
      try {
        allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
      } catch (e) {
        console.error('Error loading reviews:', e);
        allReviews = {};
      }
      
      const productReviews = allReviews[productId] || [];
      
      // Display reviews
      if (productReviews.length === 0) {
        reviewsContainer.innerHTML = '<p style="text-align: center; color: #888;">No reviews yet. Be the first to review this game!</p>';
        return;
      }
      
      // Sort reviews by date (newest first)
      productReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // Clear container
      reviewsContainer.innerHTML = '';
      
      // Add reviews
      productReviews.forEach((review, index) => {
        const reviewItem = createReviewElement(review, index);
        reviewsContainer.appendChild(reviewItem);
      });
    }
    
    /**
     * Create a review element
     */
    function createReviewElement(review, index) {
      const reviewDate = new Date(review.date);
      const formattedDate = reviewDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      const reviewItem = document.createElement('div');
      reviewItem.className = 'review-item animate-in';
      reviewItem.style.animationDelay = `${0.1 * index}s`;
      
      reviewItem.innerHTML = `
        <div class="review-header">
          <span class="review-user">${review.userName}</span>
          <span class="review-date">${formattedDate}</span>
        </div>
        <div class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
        <div class="review-text">${review.text}</div>
      `;
      
      return reviewItem;
    }
    
    /**
     * Load recommendations based on the current product
     */
    function loadRecommendations(currentProduct) {
      if (!recommendationsContainer) return;
      
      let recommendations = [];
      
      // Use the recommendation API if available
      if (window.zafagoFeatures && window.zafagoFeatures.getRecommendations) {
        recommendations = window.zafagoFeatures.getRecommendations(productId, 5);
      } else {
        // Fallback: show games from the same category
        const sameCategory = window.gameData.filter(g => 
          g.category === currentProduct.category && g.id !== currentProduct.id
        );
        
        // Randomly select up to 5 games
        recommendations = sameCategory
          .sort(() => 0.5 - Math.random())
          .slice(0, 5);
        
        // If not enough games in the same category, add some random ones
        if (recommendations.length < 5) {
          const otherGames = window.gameData.filter(g => 
            g.category !== currentProduct.category && g.id !== currentProduct.id
          );
          
          const additionalGames = otherGames
            .sort(() => 0.5 - Math.random())
            .slice(0, 5 - recommendations.length);
            
          recommendations = [...recommendations, ...additionalGames];
        }
      }
      
      // Display recommendations
      recommendationsContainer.innerHTML = '';
      
      recommendations.forEach((game, index) => {
        const cardElement = createRecommendationCard(game, index);
        recommendationsContainer.appendChild(cardElement);
      });
    }
    
    /**
     * Create a recommendation card element
     */
    function createRecommendationCard(game, index) {
      const finalPrice = game.discount > 0 
        ? (game.price * (1 - game.discount / 100)).toFixed(2) 
        : game.price.toFixed(2);
        
      const card = document.createElement('div');
      card.className = 'recommendation-card animate-in';
      card.style.animationDelay = `${0.1 * index}s`;
      card.dataset.id = game.id;
      
      card.innerHTML = `
        <img src="${game.image}" alt="${game.title}" onerror="window.zafagoUtils.handleImageError(this, '${game.title}')">
        <div class="recommendation-card-info">
          <h4>${game.title}</h4>
          <div class="rating">${'★'.repeat(game.rating)}${'☆'.repeat(5 - game.rating)}</div>
          <div class="price">$${finalPrice}</div>
        </div>
      `;
      
      card.addEventListener('click', () => {
        window.location.href = `product-detail.html?id=${game.id}`;
      });
      
      return card;
    }
    
    /**
     * Add product to recently viewed list
     */
    function addToRecentlyViewed(productId) {
      try {
        const recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];
        // Remove if already in list to add to front
        const filteredRecent = recentlyViewed.filter(id => id !== productId);
        // Add to beginning and limit to 10 items
        const updatedRecent = [productId, ...filteredRecent].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updatedRecent));
      } catch (e) {
        console.error('Error updating recently viewed:', e);
      }
    }
    
    /**
     * Setup event listeners
     */
    function setupEventListeners() {
      // Add to cart button
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', handleAddToCart);
      }
      
      // Add to wishlist button
      if (addToWishlistBtn) {
        addToWishlistBtn.addEventListener('click', handleAddToWishlist);
      }
      
      // Rating stars
      if (ratingStars.length > 0) {
        ratingStars.forEach(star => {
          star.addEventListener('mouseover', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
          });
          
          star.addEventListener('mouseout', () => {
            highlightStars(parseInt(ratingValue.value) || 0);
          });
          
          star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            ratingValue.value = rating;
            highlightStars(rating);
          });
        });
      }
      
      // Review form submission
      if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
      }
      
      // Recommendation clicks
      if (recommendationsContainer) {
        recommendationsContainer.addEventListener('click', (e) => {
          const card = e.target.closest('.recommendation-card');
          if (card) {
            const gameId = parseInt(card.dataset.id);
            if (gameId) {
              window.location.href = `product-detail.html?id=${gameId}`;
            }
          }
        });
      }
    }
    
    /**
     * Handle add to cart button click
     */
    function handleAddToCart() {
      const product = window.gameData.find(g => g.id === productId);
      if (!product) return;
      
      // Check if product is already in cart
      const cart = JSON.parse(localStorage.getItem('cart')) || [];
      if (cart.some(item => item.id === productId)) {
        if (window.zafagoUtils && window.zafagoUtils.showToast) {
          window.zafagoUtils.showToast('This game is already in your cart', 'info');
        }
        return;
      }
      
      // Add to cart
      cart.push(product);
      localStorage.setItem('cart', JSON.stringify(cart));
      
      // Update cart count
      const cartTotalElements = document.querySelectorAll('#cart-total');
      cartTotalElements.forEach(el => {
        el.textContent = cart.length;
      });
      
      // Update button state
      addToCartBtn.innerHTML = '<span class="icon-bounce">✓</span> Added to Cart!';
      addToCartBtn.disabled = true;
      
      // Reset button after delay
      setTimeout(() => {
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.disabled = false;
      }, 2000);
      
      // Show toast notification
      if (window.zafagoUtils && window.zafagoUtils.showToast) {
        window.zafagoUtils.showToast(`${product.title} added to cart!`, 'success');
      }
      
      // Track for recommendations system
      if (product.category) {
        document.dispatchEvent(new CustomEvent('gamePurchased', {
          detail: {
            gameId: product.id,
            gameCategory: product.category
          }
        }));
      }
    }
    
    /**
     * Handle add to wishlist button click
     */
    function handleAddToWishlist() {
      const product = window.gameData.find(g => g.id === productId);
      if (!product) return;
      
      // Get wishlist from localStorage
      let wishlist = [];
      try {
        wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
      } catch (e) {
        console.error('Error loading wishlist:', e);
        wishlist = [];
      }
      
      // Check if already in wishlist
      const itemIndex = wishlist.findIndex(item => item.id === productId);
      
      if (itemIndex >= 0) {
        // Remove from wishlist
        wishlist.splice(itemIndex, 1);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Update button
        addToWishlistBtn.innerHTML = '<span>♡</span> Add to Wishlist';
        addToWishlistBtn.classList.remove('active');
        
        // Show toast
        if (window.zafagoUtils && window.zafagoUtils.showToast) {
          window.zafagoUtils.showToast(`${product.title} removed from wishlist`, 'info');
        }
      } else {
        // Add to wishlist
        wishlist.push(product);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        
        // Update button
        addToWishlistBtn.innerHTML = '<span>❤</span> In Wishlist';
        addToWishlistBtn.classList.add('active');
        
        // Show toast
        if (window.zafagoUtils && window.zafagoUtils.showToast) {
          window.zafagoUtils.showToast(`${product.title} added to wishlist!`, 'success');
        }
      }
    }
    
    /**
     * Handle review form submission
     */
    function handleReviewSubmit(e) {
      e.preventDefault();
      
      // Check if user is logged in
      const user = JSON.parse(localStorage.getItem('user')) || {};
      if (!user.email) {
        // Show login prompt
        if (window.zafagoUtils && window.zafagoUtils.showToast) {
          window.zafagoUtils.showToast('Please log in to submit a review', 'error');
        }
        return;
      }
      
      // Validate rating
      const rating = parseInt(ratingValue.value);
      if (!rating || rating < 1 || rating > 5) {
        if (window.zafagoUtils && window.zafagoUtils.showToast) {
          window.zafagoUtils.showToast('Please select a rating', 'error');
        }
        return;
      }
      
      // Validate review text
      const reviewContent = reviewText.value.trim();
      if (!reviewContent) {
        if (window.zafagoUtils && window.zafagoUtils.showToast) {
          window.zafagoUtils.showToast('Please write a review', 'error');
        }
        return;
      }
      
      // Create new review object
      const newReview = {
        userId: user.email,
        userName: user.name || user.email.split('@')[0],
        rating: rating,
        text: reviewContent,
        date: new Date().toISOString()
      };
      
      // Save to localStorage
      saveReview(newReview);
      
      // Reset form
      ratingValue.value = 0;
      highlightStars(0);
      reviewText.value = '';
      
      // Show success message
      if (window.zafagoUtils && window.zafagoUtils.showToast) {
        window.zafagoUtils.showToast('Thank you for your review!', 'success');
      }
      
      // Refresh reviews
      loadReviews(productId);
    }
    
    /**
     * Save review to localStorage
     */
    function saveReview(review) {
      try {
        // Get all reviews
        const allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
        
        // Initialize product reviews if needed
        if (!allReviews[productId]) {
          allReviews[productId] = [];
        }
        
        // Check if user already reviewed this product
        const existingReviewIndex = allReviews[productId].findIndex(r => r.userId === review.userId);
        
        if (existingReviewIndex !== -1) {
          // Update existing review
          allReviews[productId][existingReviewIndex] = review;
        } else {
          // Add new review
          allReviews[productId].push(review);
        }
        
        // Save to localStorage
        localStorage.setItem('reviews', JSON.stringify(allReviews));
        
        // Dispatch event for ratings update
        document.dispatchEvent(new CustomEvent('gameReviewed', {
          detail: {
            gameId: productId,
            rating: review.rating
          }
        }));
        
        return true;
      } catch (e) {
        console.error('Error saving review:', e);
        return false;
      }
    }
    
    /**
     * Highlight rating stars
     */
    function highlightStars(rating) {
      ratingStars.forEach(star => {
        const starRating = parseInt(star.dataset.rating);
        star.textContent = starRating <= rating ? '★' : '☆';
        star.classList.toggle('active', starRating <= rating);
      });
    }
    
    /**
     * Update wishlist button state based on localStorage
     */
    function updateWishlistButtonState() {
      if (!addToWishlistBtn) return;
      
      try {
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const isInWishlist = wishlist.some(item => item.id === productId);
        
        if (isInWishlist) {
          addToWishlistBtn.innerHTML = '<span>❤</span> In Wishlist';
          addToWishlistBtn.classList.add('active');
        } else {
          addToWishlistBtn.innerHTML = '<span>♡</span> Add to Wishlist';
          addToWishlistBtn.classList.remove('active');
        }
      } catch (e) {
        console.error('Error checking wishlist state:', e);
      }
    }
    
    /**
     * Update cart button state based on localStorage
     */
    function updateCartButtonState(productId) {
      if (!addToCartBtn) return;
      
      try {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const isInCart = cart.some(item => item.id === productId);
        
        if (isInCart) {
          addToCartBtn.innerHTML = '<span>✓</span> In Cart';
          addToCartBtn.disabled = true;
        }
      } catch (e) {
        console.error('Error checking cart state:', e);
      }
    }
    
    /**
     * Show/hide loader
     */
    function showLoader(show) {
      if (pageLoader) {
        if (show) {
          pageLoader.style.display = 'flex';
        } else {
          pageLoader.style.opacity = '0';
          setTimeout(() => {
            pageLoader.style.display = 'none';
          }, 500);
        }
      }
    }
    
    /**
     * Show error state when product cannot be loaded
     */
    function showErrorState(message) {
      const productContainer = document.querySelector('.product-container');
      if (productContainer) {
        productContainer.innerHTML = `
          <div class="load-failed">
            <div class="load-failed-icon">✗</div>
            <h3>Failed to Load Game</h3>
            <p>${message || 'Something went wrong. Please try again later.'}</p>
            <a href="products.html" class="btn">Browse Other Games</a>
          </div>
        `;
      }
    }
  });