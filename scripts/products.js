// scripts/products.js
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const sortFilter = document.getElementById('sort-filter');
const gamesList = document.getElementById('games-list');
const fullGamesList = document.getElementById('full-games-list');
const seeAllBtn = document.getElementById('see-all-btn');
const carousel = document.getElementById('carousel');
const fullGames = document.getElementById('full-games');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let filteredGames = [];
let currentIndex = 0;
const itemsPerPage = 5;

function displayGames(games, container, limit = games.length) {
    container.innerHTML = '';
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    games.slice(0, limit).forEach(game => {
        const finalPrice = game.discount > 0 ? (game.price * (1 - game.discount / 100)).toFixed(2) : game.price;
        const card = document.createElement('div');
        card.className = 'game-card';
        card.innerHTML = `
        <img src="${game.image}" alt="${game.title}">
        <h3>${game.title}<button class="add-to-wishlist-btn ${wishlist.some(w => w.id === game.id) ? 'active' : ''}" data-id="${game.id}">❤️</button></h3>
        <p>$${finalPrice}${game.discount > 0 ? `<span class="discount">(-${game.discount}%)</span>` : ''}</p>
        <div class="star-rating">${'★'.repeat(game.rating)}${'☆'.repeat(5 - game.rating)}</div>
        <div class="button-container">
            <button class="add-to-cart-btn" data-id="${game.id}">Add to Cart</button>
            <a href="product-detail.html?id=${game.id}" class="details-btn">Details</a>
        </div>
    `;
        container.appendChild(card);
    });
}

function applyFilters() {
    let games = [...gameData];
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const sort = sortFilter.value;

    if (searchTerm) games = games.filter(game => game.title.toLowerCase().includes(searchTerm));
    if (category !== 'all') games = games.filter(game => game.category === category);

    if (sort === 'name-asc') games.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'name-desc') games.sort((a, b) => b.title.localeCompare(a.title));
    else if (sort === 'rating-desc') games.sort((a, b) => b.rating - a.rating);
    else if (sort === 'price-asc') games.sort((a, b) => (a.price * (1 - (a.discount || 0) / 100)) - (b.price * (1 - (b.discount || 0) / 100)));
    else if (sort === 'price-desc') games.sort((a, b) => (b.price * (1 - (b.discount || 0) / 100)) - (a.price * (1 - (a.discount || 0) / 100)));

    filteredGames = games;
    currentIndex = 0;
    displayGames(filteredGames, gamesList, itemsPerPage);
}

function updateCarousel() {
    const offset = currentIndex * (300 + 35); // Width + gap
    gamesList.style.transform = `translateX(-${offset}px)`;
}

searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);

prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentIndex < filteredGames.length - itemsPerPage) {
        currentIndex++;
        updateCarousel();
    }
});

seeAllBtn.addEventListener('click', () => {
    carousel.style.display = 'none';
    seeAllBtn.style.display = 'none';
    fullGames.style.display = 'block';
    displayGames(filteredGames, fullGamesList);
});

document.addEventListener('DOMContentLoaded', () => {
    applyFilters();

    // Logika Wishlist
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const updateWishlistCount = () => {
        // Opsional: Tambahkan elemen untuk menampilkan jumlah item di wishlist di navbar
    };

    gamesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const id = parseInt(e.target.dataset.id);
            const game = gameData.find(g => g.id === id);
            cartItems.push(game);
            localStorage.setItem('cart', JSON.stringify(cartItems));
            document.getElementById('cart-total').textContent = cartItems.length;
            alert(`${game.title} added to cart!`);
        } else if (e.target.classList.contains('add-to-wishlist-btn')) {
            const id = parseInt(e.target.dataset.id);
            const game = gameData.find(g => g.id === id);
            if (!wishlist.some(w => w.id === id)) {
                wishlist.push(game);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                e.target.classList.add('active');
                alert(`${game.title} added to wishlist!`);
            } else {
                wishlist = wishlist.filter(w => w.id !== id);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                e.target.classList.remove('active');
                alert(`${game.title} removed from wishlist!`);
            }
            updateWishlistCount();
        }
    });

    fullGamesList.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            const id = parseInt(e.target.dataset.id);
            const game = gameData.find(g => g.id === id);
            cartItems.push(game);
            localStorage.setItem('cart', JSON.stringify(cartItems));
            document.getElementById('cart-total').textContent = cartItems.length;
            alert(`${game.title} added to cart!`);
        } else if (e.target.classList.contains('add-to-wishlist-btn')) {
            const id = parseInt(e.target.dataset.id);
            const game = gameData.find(g => g.id === id);
            if (!wishlist.some(w => w.id === id)) {
                wishlist.push(game);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                e.target.classList.add('active');
                alert(`${game.title} added to wishlist!`);
            } else {
                wishlist = wishlist.filter(w => w.id !== id);
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
                e.target.classList.remove('active');
                alert(`${game.title} removed from wishlist!`);
            }
            updateWishlistCount();
        }
    });
});