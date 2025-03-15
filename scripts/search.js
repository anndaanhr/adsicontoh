// scripts/search.js
document.addEventListener('DOMContentLoaded', () => {
    // Create search bar component and add to DOM
    function initSearchBar() {
        // Create the search bar element
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <div class="search-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
            </div>
            <input type="text" id="search-input" placeholder="Search games...">
            <div class="search-close">×</div>
        `;
        
        // Append after navbar
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.parentNode.insertBefore(searchContainer, navbar.nextSibling);
        }
        
        // Setup search result container
        const searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        searchResults.innerHTML = `
            <div class="search-results-inner">
                <div class="search-results-header">
                    <span>Search Results</span>
                    <button class="close-search">×</button>
                </div>
                <div class="search-results-content"></div>
            </div>
        `;
        document.body.appendChild(searchResults);
        
        // Event listeners
        const searchInput = document.getElementById('search-input');
        const searchClose = document.querySelector('.search-close');
        const closeSearchBtn = document.querySelector('.close-search');
        
        // Show/hide clear button based on input
        searchInput.addEventListener('input', () => {
            if (searchInput.value.length > 0) {
                searchClose.style.display = 'block';
                performSearch(searchInput.value);
            } else {
                searchClose.style.display = 'none';
                hideSearchResults();
            }
        });
        
        // Clear search input
        searchClose.addEventListener('click', () => {
            searchInput.value = '';
            searchClose.style.display = 'none';
            hideSearchResults();
        });
        
        // Close search results
        closeSearchBtn.addEventListener('click', hideSearchResults);
        
        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container') && 
                !e.target.closest('.search-results') &&
                searchResults.classList.contains('active')) {
                hideSearchResults();
            }
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to close search
            if (e.key === 'Escape' && searchResults.classList.contains('active')) {
                hideSearchResults();
            }
            
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInput.focus();
            }
        });
        
        // Initialize 
        searchClose.style.display = 'none';
    }
    
    // Function to perform search and display results
    function performSearch(query) {
        query = query.toLowerCase().trim();
        
        if (query.length < 2) return; // Don't search for very short queries
        
        // Get search results container
        const searchResultsContent = document.querySelector('.search-results-content');
        const searchResults = document.querySelector('.search-results');
        
        // Clear previous results
        searchResultsContent.innerHTML = '';
        
        // Filter games based on query
        const results = gameData.filter(game => {
            return game.title.toLowerCase().includes(query) || 
                   game.category.toLowerCase().includes(query) ||
                   game.desc.toLowerCase().includes(query);
        });
        
        // Show search results container
        searchResults.classList.add('active');
        
        // No results
        if (results.length === 0) {
            searchResultsContent.innerHTML = `
                <div class="no-results">
                    <p>No games found matching "${query}"</p>
                </div>
            `;
            return;
        }
        
        // Limit to 10 results for performance
        const limitedResults = results.slice(0, 10);
        
        // Create results HTML
        limitedResults.forEach(game => {
            const finalPrice = game.discount > 0 ? 
                (game.price * (1 - game.discount / 100)).toFixed(2) : 
                game.price.toFixed(2);
            
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.innerHTML = `
                <img src="${game.image}" alt="${game.title}">
                <div class="search-result-info">
                    <h4>${game.title}</h4>
                    <div class="search-result-meta">
                        <span class="search-result-category">${game.category}</span>
                        <span class="search-result-price">$${finalPrice}</span>
                    </div>
                </div>
            `;
            
            // Add click event
            resultItem.addEventListener('click', () => {
                window.location.href = `product-detail.html?id=${game.id}`;
            });
            
            searchResultsContent.appendChild(resultItem);
        });
        
        // Add "View All Results" link if there are more results
        if (results.length > 10) {
            const viewAllLink = document.createElement('div');
            viewAllLink.className = 'view-all-results';
            viewAllLink.innerHTML = `View all ${results.length} results`;
            
            viewAllLink.addEventListener('click', () => {
                // Save search results to session storage
                sessionStorage.setItem('searchQuery', query);
                window.location.href = 'products.html?search=' + encodeURIComponent(query);
            });
            
            searchResultsContent.appendChild(viewAllLink);
        }
    }
    
    // Hide search results
    function hideSearchResults() {
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.classList.remove('active');
        }
    }
    
    // Initialize search functionality
    initSearchBar();
    
    // Handle URL search parameter on products page
    const isProductsPage = window.location.pathname.includes('products.html');
    if (isProductsPage) {
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        
        if (searchQuery) {
            // There's a search query in the URL, filter products
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = searchQuery;
                
                // Apply filter to products page
                const gamesContainer = document.querySelector('.games-container');
                const productTitle = document.querySelector('.products-page h2');
                
                if (gamesContainer && productTitle) {
                    // Update title
                    productTitle.textContent = `Search Results: "${searchQuery}"`;
                    
                    // Filter games
                    const results = gameData.filter(game => {
                        return game.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                               game.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                               game.desc.toLowerCase().includes(searchQuery.toLowerCase());
                    });
                    
                    // Clear container
                    gamesContainer.innerHTML = '';
                    
                    // Show results or no results message
                    if (results.length === 0) {
                        gamesContainer.innerHTML = `
                            <div class="no-results" style="grid-column: 1 / -1; text-align: center; padding: 50px 0;">
                                <p>No games found matching "${searchQuery}"</p>
                                <button class="btn" onclick="window.location.href='products.html'">
                                    View All Games
                                </button>
                            </div>
                        `;
                    } else {
                        // Display filtered games
                        results.forEach(game => {
                            // Create game cards (similar to main.js logic)
                            const finalPrice = game.discount > 0 ? 
                                (game.price * (1 - game.discount / 100)).toFixed(2) : 
                                game.price.toFixed(2);
                            
                            const discountText = game.discount > 0 ? 
                                `<span class="discount">-${game.discount}%</span>` : '';
                            
                            const card = document.createElement('div');
                            card.className = 'game-card fade-in';
                            card.innerHTML = `
                                <img src="${game.image}" alt="${game.title}" loading="lazy">
                                <h3>${game.title}</h3>
                                <p>$${finalPrice}${discountText}</p>
                                <div class="button-container">
                                    <a href="product-detail.html?id=${game.id}" class="details-btn">Details</a>
                                    <button class="add-to-cart-btn" data-id="${game.id}">Add to Cart</button>
                                </div>
                            `;
                            
                            gamesContainer.appendChild(card);
                        });
                        
                        // Add cart functionality to newly created buttons
                        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                            button.addEventListener('click', (e) => {
                                const id = parseInt(e.target.dataset.id);
                                const game = gameData.find(g => g.id === id);
                                if (game) {
                                    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
                                    cartItems.push(game);
                                    localStorage.setItem('cart', JSON.stringify(cartItems));
                                    
                                    // Update cart count
                                    const cartTotal = document.getElementById('cart-total');
                                    if (cartTotal) cartTotal.textContent = cartItems.length;
                                    
                                    // Button feedback
                                    button.textContent = 'Added!';
                                    button.disabled = true;
                                    setTimeout(() => {
                                        button.textContent = 'Add to Cart';
                                        button.disabled = false;
                                    }, 2000);
                                }
                            });
                        });
                    }
                }
            }
        }
    }
});