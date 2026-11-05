const fs = require('fs');


const cents = value => Math.round(Number(value) * 100);
const pln = value => value / 100;
function error(message, status = 400) {
    const err = new Error(message);
    err.status = status;
    return err;
}
function required(value, field, maximum = 200) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > maximum) throw error(`Nieprawidłowe pole: ${field}.`);
    return value.trim();
}
function readDeclaration(file, name) {
    const source = fs.readFileSync(file, 'utf8');
    const match = source.match(new RegExp(`\\blet ${name}\\s*=\\s*([\\s\\S]*?);\\s*(?:\\r?\\n|$)`));
    if (!match) throw new Error(`Brak deklaracji ${name}.`);
    return JSON.parse(match[1]);
}
function validIban(value) {
    if (typeof value !== 'string') return false;
    const iban = value.replace(/\s/g, '').toUpperCase();
    if (!/^PL\d{26}$/.test(iban)) return false;
    const expanded = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, char => String(char.charCodeAt(0) - 55));
    let remainder = 0;
    for (const digit of expanded) remainder = (remainder * 10 + Number(digit)) % 97;
    return remainder === 1;
}
function validNip(value) {
    if (typeof value !== 'string') return false;
    const nip = value.replace(/[\s-]/g, '');
    if (!/^\d{10}$/.test(nip) || /^(\d)\1{9}$/.test(nip)) return false;
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    const check = weights.reduce((sum, weight, index) => sum + weight * Number(nip[index]), 0) % 11;
    return check !== 10 && check === Number(nip[9]);
}
function validateOrder(body, products, config) {
    if (!body || !Array.isArray(body.cart) || body.cart.length < 1 || body.cart.length > 100) throw error('Koszyk jest pusty lub zbyt duży.');
    const seen = new Set();
    let subtotalCents = 0;
    const items = body.cart.map(item => {
        if (!item || typeof item.sku !== 'string' || seen.has(item.sku)) throw error('Nieprawidłowe pozycje koszyka.');
        seen.add(item.sku);
        const product = products.find(found => found.sku === item.sku);
        if (!product) throw error('Nieznany produkt. Odśwież koszyk.');
        if (['Brak w magazynie', 'Niedostępne'].includes(product.stock)) throw error(`Produkt ${product.sku} jest niedostępny.`);
        if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 1000) throw error('Ilość musi być liczbą całkowitą od 1 do 1000.');
        const price = cents(product.price);
        if (!Number.isSafeInteger(price) || price <= 0 || price > 100000000) throw new Error('Nieprawidłowa cena w katalogu.');
        subtotalCents += price * item.quantity;
        return { sku: product.sku, name: product.name, price: pln(price), quantity: item.quantity, image: product.image || '' };
    });
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents > 100000000) throw error('Wartość koszyka przekracza dopuszczalny zakres.');

    const inputCustomer = body.customer || {};
    const inputDelivery = body.delivery || {};
    const method = required(inputDelivery.method, 'dostawa', 20);
    if (!['dpd', 'inpost', 'pickup'].includes(method)) throw error('Nieznana metoda dostawy.');
    const customer = {
        name: required(inputCustomer.name, 'imię i nazwisko'),
        email: required(inputCustomer.email, 'e-mail'),
        phone: required(inputCustomer.phone, 'telefon', 40),
        street: method === 'pickup' ? String(inputCustomer.street || '').trim().slice(0, 200) : required(inputCustomer.street, 'ulica'),
        postalCode: method === 'pickup' ? String(inputCustomer.postalCode || '').trim().slice(0, 20) : required(inputCustomer.postalCode, 'kod pocztowy', 20),
        city: method === 'pickup' ? String(inputCustomer.city || '').trim().slice(0, 100) : required(inputCustomer.city, 'miasto', 100),
        isB2B: inputCustomer.isB2B === true,
        nip: inputCustomer.isB2B ? required(inputCustomer.nip, 'NIP', 20) : '',
        companyName: inputCustomer.isB2B ? required(inputCustomer.companyName, 'firma') : ''
    };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) throw error('Nieprawidłowy e-mail.');
    if (!/^[+\d\s()-]{7,40}$/.test(customer.phone)) throw error('Nieprawidłowy telefon.');
    if (method !== 'pickup' && !/^\d{2}-\d{3}$/.test(customer.postalCode)) throw error('Nieprawidłowy kod pocztowy.');
    if (customer.isB2B && !validNip(customer.nip)) throw error('Nieprawidłowy NIP.');
    const inpostCode = method === 'inpost' ? required(inputDelivery.inpostCode, 'kod paczkomatu', 30).toUpperCase() : '';
    if (method === 'inpost' && !/^[A-Z0-9-]{3,30}$/.test(inpostCode)) throw error('Nieprawidłowy kod paczkomatu.');
    const delivery = { method, methodName: { dpd: 'Kurier', inpost: 'Paczkomat InPost', pickup: 'Odbiór osobisty' }[method], inpostCode };

    const threshold = cents(config.SHOP_CONFIG.freeShippingThreshold);
    if (!Number.isSafeInteger(threshold) || threshold < 0) throw new Error('Nieprawidłowy próg darmowej dostawy.');
    let shippingCents = method === 'pickup' || subtotalCents >= threshold ? 0 : method === 'inpost' ? 1500 : 2000;
    let discountCents = 0;
    let couponCode = '';
    if (body.coupon?.code) {
        couponCode = required(body.coupon.code, 'kupon', 40).toUpperCase();
        const promotion = Object.hasOwn(config.PROMO_CODES,couponCode) ? config.PROMO_CODES[couponCode] : null;
        if (!promotion) throw error('Nieznany kod rabatowy.');
        const minimum = cents(promotion.minSubtotal || 0);
        if (!Number.isSafeInteger(minimum) || subtotalCents < minimum) throw error('Koszyk nie spełnia warunków kodu rabatowego.');
        const value = Number(promotion.value);
        if (!Number.isFinite(value) || value < 0) throw new Error('Nieprawidłowa konfiguracja kuponu.');
        if (promotion.type === 'percent' && value <= 100) discountCents = Math.round(subtotalCents * value / 100);
        else if (promotion.type === 'fixed') discountCents = Math.min(subtotalCents, cents(value));
        else if (promotion.type === 'free_shipping') shippingCents = 0;
        else throw new Error('Nieprawidłowa konfiguracja kuponu.');
    }
    const totalCents = subtotalCents - discountCents + shippingCents;
    if (totalCents <= 0) throw error('Zamówienie musi mieć dodatnią wartość.');
    const vatRate = Number(config.SHOP_CONFIG.vatRate);
    if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 1) throw new Error('Nieprawidłowa stawka VAT.');
    const netCents = Math.round(totalCents / (1 + vatRate));
    return { items, customer, delivery, couponCode, totalCents, totals: {
        subtotal: pln(subtotalCents), discount: pln(discountCents), shipping: pln(shippingCents), total: pln(totalCents),
        vatAmount: pln(totalCents - netCents), netTotal: pln(netCents)
    } };
}
module.exports = { cents, error, readDeclaration, validIban, validNip, validateOrder };
