// Koszyk zakupowy dla Narzędzia HDD PL
const CART_KEY = 'hdd_shop_cart';

// Pobierz koszyk z localStorage
function getCart() {
    try {
        const cartData = localStorage.getItem(CART_KEY);
        return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
        console.error('Błąd podczas odczytu koszyka:', e);
        return [];
    }
}

// Zapisz koszyk do localStorage
function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartBadge();
        // Wyślij zdarzenie informujące o aktualizacji koszyka
        window.dispatchEvent(new Event('cartUpdated'));
    } catch (e) {
        console.error('Błąd podczas zapisu koszyka:', e);
    }
}

// Dodaj produkt do koszyka
function addToCart(product) {
    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.sku === product.sku);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += (product.quantity || 1);
    } else {
        cart.push({
            sku: product.sku,
            name: product.name,
            price: parseFloat(product.price),
            image: product.image,
            quantity: product.quantity || 1,
            thread: product.thread || '',
            stock: product.stock || 'W magazynie'
        });
    }

    saveCart(cart);
    showToast(`Dodano do koszyka: ${product.name}`);
}

// Usuń produkt z koszyka
function removeFromCart(sku) {
    let cart = getCart();
    cart = cart.filter(item => item.sku !== sku);
    saveCart(cart);
}

// Zmień ilość produktu w koszyku
function updateQuantity(sku, quantity) {
    let cart = getCart();
    const index = cart.findIndex(item => item.sku === sku);
    if (index > -1) {
        cart[index].quantity = Math.max(1, parseInt(quantity));
        saveCart(cart);
    }
}

// Wyczyść koszyk
function clearCart() {
    localStorage.removeItem(CART_KEY);
    updateCartBadge();
    window.dispatchEvent(new Event('cartUpdated'));
}

// Zaktualizuj licznik koszyka w nagłówku
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Obsługa wszystkich linków/przycisków prowadzących do koszyka
    const cartLinks = document.querySelectorAll('a[href="koszyk.html"], a[href="checkout.html"], button[onclick*="checkout"]');
    
    cartLinks.forEach(link => {
        // Znajdź lub utwórz badge
        let badge = link.querySelector('.cart-badge');
        
        // Jeśli nie ma elementu badge, spróbuj znaleźć istniejącą kropkę span
        if (!badge) {
            const existingDot = link.querySelector('span');
            if (existingDot) {
                existingDot.className = 'cart-badge absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border border-canvas transition-all duration-300';
                badge = existingDot;
            }
        }

        if (badge) {
            if (totalItems > 0) {
                badge.textContent = totalItems;
                badge.style.display = 'flex';
                badge.style.opacity = '1';
                badge.style.transform = 'scale(1)';
            } else {
                badge.style.display = 'none';
                badge.style.opacity = '0';
                badge.style.transform = 'scale(0)';
            }
        }
    });
}

// Funkcja powiadomień (Toast)
function showToast(message) {
    // Sprawdź czy kontener na toasty już istnieje
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-ink-deep text-canvas text-body-sm-bold py-3.5 px-6 rounded-xl shadow-panel border border-hairline/10 flex items-center gap-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto';
    
    // Ikona sukcesu
    toast.innerHTML = `
        <svg class="text-success" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Animacja wjazdu
    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    // Animacja wyjazdu
    setTimeout(() => {
        toast.classList.add('translate-y-2', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Inicjalizacja licznika po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});
