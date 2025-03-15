document.addEventListener('DOMContentLoaded', () => {
    const promoData = [
        {
            title: 'Zafa Summer Sale🔥',
            desc: 'Up to 50% off on summer-themed games! Grab your favorites before the heat fades! ⏳🎮',
            image: 'assets/zafa-sale-summer.jpg',
            games: [
                { id: 2, title: 'Tides of Annihilation', price: 49.99, discount: 0, image: 'assets/game2.jpg', category: 'action', rating: 4 },
                { id: 9, title: 'Black Myth: Wukong', price: 59.99, discount: 15, image: 'assets/game9.jpg', category: 'rpg', rating: 4 },
                { id: 17, title: 'Far Cry 6', price: 37.99, discount: 30, image: 'assets/game17.jpg', category: 'adventure', rating: 4 },
                { id: 25, title: 'Kong: Survivor Instinct', price: 20.99, discount: 10, image: 'assets/game25.jpg', category: 'action', rating: 1 },
            ]
        },
        {
            title: 'Zafa Winter Sale❄️',
            desc: 'Chill deals, hot discounts! Get up to 50% off on winter-themed games. Grab yours before the season melts away! ⏳🎮',
            image: 'assets/zafa-sale-winter.jpg',
            games: [
                { id: 3, title: 'World War Z: Aftermath', price: 10.99, discount: 35, image: 'assets/game3.jpg', category: 'adventure', rating: 3 },
                { id: 13, title: 'Cyberpunk 2077', price: 29.00, discount: 25, image: 'assets/game13.jpg', category: 'rpg', rating: 4 },
                { id: 18, title: 'Final Fantasy XVI', price: 64.99, discount: 25, image: 'assets/game18.jpg', category: 'rpg', rating: 4 },
                { id: 28, title: 'Need For Speed Heat', price: 9.99, discount: 99, image: 'assets/game28.jpg', category: 'sports', rating: 3 },
            ]
        },
        {
            title: 'Zafa Autumn Sale🍂',
            desc: 'Fall into great deals! Get up to 50% off on autumn-themed games. Grab them before the leaves are gone! ⏳🎮',
            image: 'assets/zafa-sale-autumn.jpg',
            games: [
                { id: 4, title: 'Assassins Creed Mirage', price: 15.00, discount: 20, image: 'assets/game4.jpg', category: 'adventure', rating: 4 },
                { id: 12, title: 'Cities Skylines 2', price: 29.99, discount: 40, image: 'assets/game12.jpg', category: 'simulation', rating: 3 },
                { id: 20, title: 'GhostRunner', price: 12.99, discount: 90, image: 'assets/game20.jpg', category: 'action', rating: 2 },
                { id: 27, title: 'Flight Simulator', price: 59.99, discount: 25, image: 'assets/game27.jpg', category: 'simulation', rating: 4 },
            ]
        },
        {
            title: 'Zafa Mega Sale🚀',
            desc: 'Biggest discounts of the year! Get up to 80% off on hundreds of games. Don’t miss out—shop now before the deals disappear! ⏳🎮',
            image: 'assets/zafa-sale-mega.jpg',
            games: [
                { id: 1, title: 'Elden Ring', price: 29.99, discount: 30, image: 'assets/game1.jpg', category: 'action', rating: 5 },
                { id: 6, title: 'Assassins Creed Valhalla', price: 44.99, discount: 40, image: 'assets/game6.jpg', category: 'adventure', rating: 3 },
                { id: 21, title: 'God Of War: Ragnarok', price: 31.99, discount: 15, image: 'assets/game21.jpg', category: 'adventure', rating: 5 },
                { id: 31, title: 'Wuthering Waves', price: 1.00, discount: 90, image: 'assets/game31.jpg', category: 'rpg', rating: 1 },
            ]
        }
    ];

    const promoList = document.getElementById('promo-list');
    const saleGames = document.getElementById('sale-games');
    const cartTotal = document.getElementById('cart-total');
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    function refreshCart() {
        if (cartTotal) cartTotal.textContent = cartItems.length;
    }

    promoData.forEach(promo => {
        const card = document.createElement('div');
        card.className = 'promo-card';
        card.innerHTML = `
            <img src="${promo.image}" alt="${promo.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x150?text=${promo.title}'">
            <h3>${promo.title}</h3>
            <p>${promo.desc}</p>
        `;
        card.addEventListener('click', () => showSaleGames(promo.games));
        promoList.appendChild(card);
    });

    function showSaleGames(games) {
        promoList.style.display = 'none';
        saleGames.style.display = 'grid';
        saleGames.innerHTML = '';

        games.forEach(game => {
            const finalPrice = game.discount > 0 ? (game.price * (1 - game.discount / 100)).toFixed(2) : game.price;
            const discountText = game.discount > 0 ? `<span class="discount">-${game.discount}%</span>` : '';

            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img src="${game.image}" alt="${game.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x200?text=${game.title}'">
                <h3>${game.title}</h3>
                <p>$${finalPrice}${discountText}</p>
                <div class="button-container">
                    <button class="add-to-cart-btn" data-id="${game.id}">Add to Cart</button>
                    <a href="product-detail.html?id=${game.id}" class="btn">Details</a>
                </div>
            `;
            saleGames.appendChild(card);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const game = games.find(g => g.id === id);
                cartItems.push(game);
                localStorage.setItem('cart', JSON.stringify(cartItems));
                refreshCart();
                e.target.textContent = 'Added!';
                e.target.disabled = true;
                setTimeout(() => {
                    e.target.textContent = 'Add to Cart';
                    e.target.disabled = false;
                }, 2000);
            });
        });
    }

    refreshCart();
});