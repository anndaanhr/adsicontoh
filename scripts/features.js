// Centralized features management
document.addEventListener('DOMContentLoaded', () => {
    // User data
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const purchases = JSON.parse(localStorage.getItem('purchases')) || [];
    
    // Initialize storage for reviews if it doesn't exist
    if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify({}));
    }
    
    // Initialize ratings cache for re-use
    const RATINGS_CACHE = {};
    
    // Calculate average rating for a product
    function getProductRating(productId) {
        if (RATINGS_CACHE[productId] !== undefined) {
            return RATINGS_CACHE[productId];
        }
        
        const allReviews = JSON.parse(localStorage.getItem('reviews')) || {};
        const productReviews = allReviews[productId] || [];
        
        if (productReviews.length === 0) {
            const game = gameData.find(g => g.id === parseInt(productId));
            RATINGS_CACHE[productId] = game ? game.rating : 0;
            return RATINGS_CACHE[productId];
        }
        
        const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.round((totalRating / productReviews.length) * 10) / 10;
        
        RATINGS_CACHE[productId] = averageRating;
        return averageRating;
    }
    
    // Get recommendations for a user
    function getRecommendations(currentGameId = null, limit = 5) {
        // If no purchase history, show random games from same category
        if (purchases.length === 0 && currentGameId) {
            const currentGame = gameData.find(g => g.id === parseInt(currentGameId));
            if (!currentGame) return getRandomGames(limit);
            
            // Filter games from same category except current game
            const sameCategory = gameData.filter(g => g.category === currentGame.category && g.id !== currentGame.id);
            
            // Return random games from the same category, or random games if none found
            return sameCategory.length > 0 ? 
                sameCategory.sort(() => 0.5 - Math.random()).slice(0, limit) : 
                getRandomGames(limit);
        }
        
        // Get user's most purchased categories
        const categories = {};
        purchases.forEach(p => {
            categories[p.category] = (categories[p.category] || 0) + 1;
        });
        
        // Sort categories by purchase count
        const sortedCategories = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
        
        // Filter games from user's top categories and high ratings
        let recommendations = [];
        
        // Add games from user's top categories with high ratings
        for (const category of sortedCategories) {
            if (recommendations.length >= limit) break;
            
            const categoryGames = gameData.filter(g => {
                return g.category === category && 
                       (!currentGameId || g.id !== parseInt(currentGameId)) && 
                       !recommendations.some(r => r.id === g.id);
            });
            
            const topRatedInCategory = categoryGames
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 2);
                
            recommendations = [...recommendations, ...topRatedInCategory];
        }
        
        // Fill remaining slots with random popular games
        if (recommendations.length < limit) {
            const popularGames = gameData
                .filter(g => {
                    return !recommendations.some(r => r.id === g.id) && 
                           (!currentGameId || g.id !== parseInt(currentGameId));
                })
                .sort((a, b) => b.rating - a.rating)
                .slice(0, limit - recommendations.length);
            
            recommendations = [...recommendations, ...popularGames];
        }
        
        // Limit to requested number
        return recommendations.slice(0, limit);
    }
    
    // Get random popular games
    function getRandomGames(limit = 5) {
        // Get top rated games
        const topRated = [...gameData]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, Math.min(20, gameData.length));
            
        // Return random selection from top rated
        return topRated
            .sort(() => 0.5 - Math.random())
            .slice(0, limit);
    }
    
    // Add event listener for purchases
    document.addEventListener('gamePurchased', (e) => {
        const { gameId, gameCategory } = e.detail;
        
        // Save this purchase for recommendation system
        let purchases = JSON.parse(localStorage.getItem('purchases')) || [];
        if (!purchases.find(p => p.id === gameId)) {
            purchases.push({
                id: gameId,
                category: gameCategory,
                timestamp: Date.now()
            });
            localStorage.setItem('purchases', JSON.stringify(purchases));
        }
    });
    
    // Add event listener for reviews
    document.addEventListener('gameReviewed', (e) => {
        const { gameId, rating } = e.detail;
        
        // Clear the rating cache for this game
        delete RATINGS_CACHE[gameId];
    });
    
    // Global API for other scripts to use
    window.zafagoFeatures = {
        getProductRating,
        getRecommendations,
        getRandomGames
    };
});