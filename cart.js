// Koszyk zakupowy dla Narzędzia HDD PL
const CART_KEY = 'hdd_shop_cart';
const COUPON_KEY = 'hdd_shop_coupon';

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
    showToast(`Usunięto produkt z koszyka`);
}

// Zmień ilość produktu w koszyku
function updateQuantity(sku, quantity) {
    let cart = getCart();
    const index = cart.findIndex(item => item.sku === sku);
    if (index > -1) {
        const parsed = parseInt(quantity, 10);
        if (isNaN(parsed) || parsed < 1) {
            cart[index].quantity = 1;
        } else {
            cart[index].quantity = parsed;
        }
        saveCart(cart);
    }
}

// Wyczyść koszyk
function clearCart() {
    localStorage.removeItem(CART_KEY);
    localStorage.removeItem(COUPON_KEY);
    updateCartBadge();
    window.dispatchEvent(new Event('cartUpdated'));
}

// Obsługa Kuponów Rabatowych
function getAppliedCoupon() {
    try {
        const coupon = localStorage.getItem(COUPON_KEY);
        if (!coupon) return null;
        if (typeof PROMO_CODES !== 'undefined' && PROMO_CODES[coupon]) {
            return { code: coupon, ...PROMO_CODES[coupon] };
        }
        return null;
    } catch (e) {
        return null;
    }
}

function applyCoupon(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (typeof PROMO_CODES !== 'undefined' && PROMO_CODES[cleanCode]) {
        localStorage.setItem(COUPON_KEY, cleanCode);
        window.dispatchEvent(new Event('cartUpdated'));
        return { success: true, coupon: PROMO_CODES[cleanCode] };
    }
    return { success: false, message: "Niepoprawny kod rabatowy." };
}

function removeCoupon() {
    localStorage.removeItem(COUPON_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
}

// Obliczenia Koszyka
function calculateCartTotals(deliveryCost = 20) {
    const cart = getCart();
    const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (parseInt(item.quantity, 10) || 1), 0);
    const coupon = getAppliedCoupon();
    
    let discount = 0;
    let isFreeShippingCoupon = false;

    if (coupon) {
        if (coupon.type === 'percent') {
            discount = subtotal * (parseFloat(coupon.value) / 100);
        } else if (coupon.type === 'fixed') {
            discount = Math.min(parseFloat(coupon.value), subtotal);
        } else if (coupon.type === 'free_shipping') {
            isFreeShippingCoupon = true;
        }
    }

    const freeThreshold = (typeof SHOP_CONFIG !== 'undefined' && SHOP_CONFIG.freeShippingThreshold) 
        ? parseFloat(SHOP_CONFIG.freeShippingThreshold) 
        : 500;
        
    const qualifiesForFreeThreshold = subtotal >= freeThreshold && subtotal > 0;
    
    let shipping = parseFloat(deliveryCost) || 0;
    if (qualifiesForFreeThreshold || isFreeShippingCoupon || deliveryCost === 0) {
        shipping = 0;
    }

    const total = Math.max(0, subtotal - discount + shipping);
    const vatRate = (typeof SHOP_CONFIG !== 'undefined' && SHOP_CONFIG.vatRate) ? parseFloat(SHOP_CONFIG.vatRate) : 0.23;
    const netTotal = total / (1 + vatRate);
    const vatAmount = total - netTotal;

    return {
        subtotal,
        discount,
        shipping,
        deliveryCost: parseFloat(deliveryCost) || 0,
        total,
        netTotal,
        vatAmount,
        qualifiesForFreeThreshold,
        isFreeShippingCoupon,
        isFreeShipping: shipping === 0,
        freeThreshold,
        missingForFreeShipping: Math.max(0, freeThreshold - subtotal),
        freeShippingProgress: freeThreshold > 0 ? Math.min(100, Math.round((subtotal / freeThreshold) * 100)) : 100,
        coupon
    };
}


// Pobierz produkty rekomendowane (Cross-sell)
function getCartRecommendations(limit = 4) {
    if (typeof PRODUCTS === 'undefined') return [];
    const cart = getCart();
    const cartSkus = new Set(cart.map(i => i.sku));
    
    // Priorytetyzuj smary, zęby i akcesoria
    const priorityCats = ['smary', 'zeby', 'kretliki'];
    const candidates = PRODUCTS.filter(p => !cartSkus.has(p.sku));
    
    const prioritized = candidates.filter(p => p.categories && p.categories.some(c => priorityCats.includes(c)));
    const others = candidates.filter(p => !p.categories || !p.categories.some(c => priorityCats.includes(c)));
    
    return [...prioritized, ...others].slice(0, limit);
}

// Zaktualizuj licznik koszyka w nagłówku
function updateCartBadge() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartLinks = document.querySelectorAll('a[href*="koszyk.html"], a[href*="checkout.html"]');
    
    cartLinks.forEach(link => {
        let badge = link.querySelector('.cart-badge');
        
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
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-ink-deep text-canvas text-body-sm-bold py-3.5 px-6 rounded-xl shadow-panel border border-hairline/10 flex items-center gap-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto';
    
    toast.innerHTML = `
        <svg class="text-success" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

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
