// scripts/main.js
document.addEventListener('DOMContentLoaded', () => {
    const gamesList = document.getElementById('games-list');
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];

    function refreshCart() {
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) cartTotal.textContent = cartItems.length;
    }

    if (gamesList) {
        gameData.slice(0, 3).forEach(game => { // Hanya 3 game untuk featured
            const finalPrice = game.discount > 0 ? (game.price * (1 - game.discount / 100)).toFixed(2) : game.price;
            const discountText = game.discount > 0 ? `<span class="discount">-${game.discount}%</span>` : '';

            const card = document.createElement('div');
            card.className = 'game-card';
            card.innerHTML = `
                <img src="${game.image}" alt="${game.title}" loading="lazy">
                <h3>${game.title}</h3>
                <p>$${finalPrice}${discountText}</p>
                <button class="add-to-cart-btn" data-id="${game.id}">Add to Cart</button>
            `;
            gamesList.appendChild(card);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const game = gameData.find(g => g.id === id);
                if (game) {
                    cartItems.push(game);
                    localStorage.setItem('cart', JSON.stringify(cartItems));
                    refreshCart();
                    e.target.textContent = 'Added!';
                    e.target.disabled = true;
                    setTimeout(() => {
                        e.target.textContent = 'Add to Cart';
                        e.target.disabled = false;
                    }, 2000);
                }
            });
        });
    }

    refreshCart();

    const skyLayer = document.querySelector('.layer-sky');
    if (skyLayer) {
        document.addEventListener('mousemove', (e) => {
            const xShift = (e.clientX - window.innerWidth / 2) / 60;
            const yShift = (e.clientY - window.innerHeight / 2) / 60;
            const speed = skyLayer.dataset.speed || 0.4;
            skyLayer.style.transform = `translate(${xShift * speed}px, ${yShift * speed}px)`;
        });
    }

    const canvas = document.getElementById('sakura-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const sakuraParticles = [];
        const particleCount = 90;

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
                this.color = currentMode === 'dark' ? `rgba(255, 64, 129, ${this.opacity})` : `rgba(0, 204, 255, ${this.opacity})`;
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

        for (let i = 0; i < particleCount; i++) {
            sakuraParticles.push(new Sakura());
        }

        function animateSakura() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            sakuraParticles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateSakura);
        }

        animateSakura();

        document.addEventListener('themeChange', () => {
            sakuraParticles.forEach(p => p.updateColor());
        });
    }

    window.addEventListener('resize', () => {
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
    });
});