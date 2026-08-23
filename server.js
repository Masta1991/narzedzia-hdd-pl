/**
 * ==============================================================================
 * PRODUKCYJNY SERWER TRANSAKCYJNY & E-COMMERCE — NARZĘDZIA HDD PL
 * ==============================================================================
 * - Zabezpieczenia: Helmet, CORS, Rate-Limiting, Price Tampering Protection
 * - Ochrona Ilości: Sanitization Math.max(1, qty)
 * - Autoryzacja Admina: Token-based Access Control dla /api/orders i /api/save
 * - Bramka płatności: Stripe (BLIK, Karty Visa/Mastercard, Przelewy24, Apple/Google Pay)
 * - Bezpieczny Webhook: Kryptograficzna weryfikacja podpisu HMAC (stripe-signature)
 * - Baza Zamówień: Persistent JSON database (data/orders.json)
 * - Powiadomienia: Automatyczna wysyłka e-maili transakcyjnych (Nodemailer)
 * - Panel CMS: Pełna obsługa edycji produktów i odczytu zamówień
 * ==============================================================================
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_SECRET = process.env.ADMIN_SECRET;

// Inicjalizacja Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY || '';
const isStripeConfigured = stripeKey && !stripeKey.includes('placeholder') && !stripeKey.includes('MockKey');
let stripe = null;

if (isStripeConfigured) {
    try {
        stripe = require('stripe')(stripeKey);
        console.log('💳 Stripe API: Zainicjalizowano w trybie produkcyjnym/sandbox.');
    } catch (e) {
        console.warn('⚠️ Stripe API Error:', e.message);
    }
} else {
    console.log('ℹ️ Stripe API: Brak aktywnego klucza w .env — serwer działa w bezpiecznym trybie testowym.');
}

// ── Ścieżki do plików danych ──────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.js');
const CONFIG_FILE = path.join(__dirname, 'shop-config.js');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// ── Pomocnicze funkcje bazodanowe ─────────────────────────────────────────────
function getOrders() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) return [];
        const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
        return JSON.parse(data || '[]');
    } catch (e) {
        console.error('Błąd odczytu bazy zamówień:', e);
        return [];
    }
}

function saveOrder(order) {
    try {
        const orders = getOrders();
        const existingIdx = orders.findIndex(o => o.orderId === order.orderId);
        if (existingIdx >= 0) {
            orders[existingIdx] = { ...orders[existingIdx], ...order, updatedAt: new Date().toISOString() };
        } else {
            orders.unshift({ ...order, createdAt: new Date().toISOString() });
        }
        fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
        return true;
    } catch (e) {
        console.error('Błąd zapisu zamówienia:', e);
        return false;
    }
}

function getBackendProducts() {
    try {
        if (!fs.existsSync(PRODUCTS_FILE)) return [];
        const content = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
        const match = content.match(/let PRODUCTS\s*=\s*(\[[\s\S]*?\]);/);
        if (match) {
            return JSON.parse(match[1]);
        }
        return [];
    } catch (e) {
        console.error('Błąd wczytywania bazy produktów:', e);
        return [];
    }
}

// ── Middleware Autoryzacji Administratora (Ochrona API) ───────────────────────
function requireAdminAuth(req, res, next) {
    if (!ADMIN_SECRET) {
        return res.status(503).json({ error: 'Panel administratora nie jest skonfigurowany.' });
    }
    const token = req.headers['x-admin-token'] || req.query.admin_token;
    if (!token || token !== ADMIN_SECRET) {
        return res.status(401).json({ error: 'Brak autoryzacji administratora. Nieprawidłowy token (x-admin-token).' });
    }
    next();
}

// ── Konfiguracja Poczty E-mail ────────────────────────────────────────────────
let mailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });
}

async function sendOrderEmails(order) {
    const ownerEmail = process.env.SHOP_OWNER_EMAIL || 'zamowienia@narzedzia-hdd.pl';
    const emailFrom = process.env.EMAIL_FROM || 'Narzędzia HDD PL <sklep@narzedzia-hdd.pl>';

    const itemsListHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (SKU: ${item.sku})</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} szt.</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} zł</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;"><strong>${(item.price * item.quantity).toFixed(2)} zł</strong></td>
        </tr>
    `).join('');

    const emailHtmlCustomer = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1c1e21;">
            <div style="background: #0a1317; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
                <h1 style="color: #FFCD00; margin: 0; font-size: 24px;">Narzędzia HDD PL</h1>
                <p style="color: #fff; margin: 5px 0 0 0; font-size: 14px;">Potwierdzenie Zamówienia ${order.orderNumber || order.orderId}</p>
            </div>
            <div style="background: #fff; padding: 25px; border: 1px solid #dee3e9; border-top: none; border-radius: 0 0 8px 8px;">
                <p>Witaj <strong>${order.customer?.name || 'Kliencie'}</strong>,</p>
                <p>Dziękujemy za złożenie zamówienia w sklepie Narzędzia HDD PL. Poniżej znajduje się podsumowanie transakcji:</p>

                <div style="background: #f1f4f7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <p style="margin: 0 0 5px 0;"><strong>Numer zamówienia:</strong> ${order.orderNumber || order.orderId}</p>
                    <p style="margin: 0 0 5px 0;"><strong>Status płatności:</strong> <span style="color: ${order.paymentStatus === 'PAID' ? '#31a24c' : '#f2a918'}; font-weight: bold;">${order.paymentStatus === 'PAID' ? 'OPŁACONE (Stripe/BLIK)' : 'OCZEKUJE NA WPŁATĘ'}</span></p>
                    <p style="margin: 0 0 5px 0;"><strong>Metoda dostawy:</strong> ${order.delivery?.methodName || order.delivery?.method || 'Kurier DPD'}</p>
                    ${order.delivery?.inpostCode ? `<p style="margin: 0 0 5px 0;"><strong>Kod Paczkomatu:</strong> ${order.delivery.inpostCode}</p>` : ''}
                    ${order.customer?.nip ? `<p style="margin: 0;"><strong>Faktura VAT na NIP:</strong> ${order.customer.nip} (${order.customer.companyName || ''})</p>` : ''}
                </div>

                <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                    <thead>
                        <tr style="background: #f8fafc;">
                            <th style="padding: 8px; text-align: left;">Produkt</th>
                            <th style="padding: 8px; text-align: center;">Ilość</th>
                            <th style="padding: 8px; text-align: right;">Cena</th>
                            <th style="padding: 8px; text-align: right;">Suma</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsListHtml}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3" style="padding: 8px; text-align: right;">Wysyłka:</td>
                            <td style="padding: 8px; text-align: right;">${(order.totals?.shipping || 0).toFixed(2)} zł</td>
                        </tr>
                        ${order.totals?.discount > 0 ? `
                        <tr>
                            <td colspan="3" style="padding: 8px; text-align: right; color: #31a24c;">Rabat:</td>
                            <td style="padding: 8px; text-align: right; color: #31a24c;">-${order.totals.discount.toFixed(2)} zł</td>
                        </tr>` : ''}
                        <tr style="font-size: 16px; font-weight: bold; background: #f1f4f7;">
                            <td colspan="3" style="padding: 10px; text-align: right;">RAZEM BRUTTO:</td>
                            <td style="padding: 10px; text-align: right; color: #0064e0;">${order.totals?.total?.toFixed(2)} zł</td>
                        </tr>
                    </tfoot>
                </table>

                ${order.paymentMethod === 'transfer' ? `
                <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <h3 style="margin-top: 0; color: #856404;">Dane do przelewu tradycyjnego:</h3>
                    <p style="margin: 3px 0;"><strong>Odbiorca:</strong> Narzędzia HDD Sp. z o.o.</p>
                    <p style="margin: 3px 0;"><strong>Nr rachunku:</strong> PL 42 1050 1445 1000 0090 8123 4567</p>
                    <p style="margin: 3px 0;"><strong>Bank:</strong> ING Bank Śląski S.A.</p>
                    <p style="margin: 3px 0;"><strong>Tytuł przelewu:</strong> Zamówienie ${order.orderNumber || order.orderId}</p>
                    <p style="margin: 3px 0;"><strong>Kwota:</strong> ${order.totals?.total?.toFixed(2)} zł</p>
                </div>` : ''}

                <p style="font-size: 12px; color: #8595a4; text-align: center; margin-top: 20px;">
                    Narzędzia HDD Sp. z o.o. • ul. Wiertnicza 44, Kraków • Infolinia techniczna: +48 123 456 789
                </p>
            </div>
        </div>
    `;

    if (mailTransporter) {
        try {
            if (order.customer?.email) {
                await mailTransporter.sendMail({
                    from: emailFrom,
                    to: order.customer.email,
                    subject: `Potwierdzenie zamówienia ${order.orderNumber || order.orderId} — Narzędzia HDD PL`,
                    html: emailHtmlCustomer
                });
            }
            await mailTransporter.sendMail({
                from: emailFrom,
                to: ownerEmail,
                subject: `🔔 Nowe zamówienie ${order.orderNumber || order.orderId} (${order.totals?.total?.toFixed(2)} zł) [${order.paymentStatus}]`,
                html: emailHtmlCustomer
            });
            console.log(`✉️ Wysłano powiadomienia e-mail dla zamówienia ${order.orderId}`);
        } catch (err) {
            console.error('Błąd wysyłki e-mail:', err.message);
        }
    } else {
        console.log(`📝 [POWIADOMIENIE ZAMÓWIENIA ${order.orderId}]: Kwota: ${order.totals?.total?.toFixed(2)} zł | Klient: ${order.customer?.name} (${order.customer?.email}) | Status: ${order.paymentStatus}`);
    }
}

// ── Webhook Stripe (Musi być PRZED express.json() z raw body!) ────────────────
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    if (isStripeConfigured && webhookSecret && !webhookSecret.includes('placeholder')) {
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            console.error(`❌ Webhook Signature Verification Error:`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
    } else {
        try {
            event = JSON.parse(req.body.toString('utf-8'));
        } catch (err) {
            return res.status(400).send('Invalid payload');
        }
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log(`✅ Otrzymano potwierdzenie płatności dla sesji: ${session.id}`);

        const metadata = session.metadata || {};
        const orderId = metadata.orderId || session.client_reference_id || `HDD-${Date.now()}`;

        const updatedOrder = {
            orderId: orderId,
            orderNumber: metadata.orderNumber || `#${orderId}`,
            stripeSessionId: session.id,
            paymentStatus: 'PAID',
            paymentMethod: session.payment_method_types?.[0] || 'stripe',
            totals: {
                total: session.amount_total ? session.amount_total / 100 : parseFloat(metadata.total || 0),
                currency: session.currency?.toUpperCase() || 'PLN'
            },
            customer: {
                name: metadata.customerName || session.customer_details?.name || 'Klient',
                email: metadata.customerEmail || session.customer_details?.email || '',
                phone: metadata.customerPhone || session.customer_details?.phone || '',
                nip: metadata.nip || '',
                companyName: metadata.companyName || ''
            },
            delivery: {
                method: metadata.deliveryMethod || 'dpd',
                inpostCode: metadata.inpostCode || '',
                address: metadata.deliveryAddress || ''
            },
            paidAt: new Date().toISOString()
        };

        saveOrder(updatedOrder);
        await sendOrderEmails(updatedOrder);
    }

    res.json({ received: true });
});

// ── Standardowe Middlewares Express ───────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiter dla API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Zbyt wiele zapytań z Twojego adresu IP, spróbuj ponownie za 15 minut.' }
});
app.use('/api/', apiLimiter);

// ── API: Tworzenie Sesji Płatności Stripe ──────────────────────────────────────
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { cart, customer, delivery, coupon } = req.body;

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: 'Koszyk jest pusty.' });
        }

        // 🛡️ Ochrona przed manipulacją cenami i ujemnymi ilościami
        const dbProducts = getBackendProducts();
        const verifiedItems = [];
        let subtotal = 0;

        for (const item of cart) {
            const dbProd = dbProducts.find(p => p.sku === item.sku);
            if (!dbProd) {
                return res.status(400).json({ error: `Nieprawidłowy lub nieznany produkt w koszyku (Błędny SKU: ${item.sku}). Odśwież stronę.` });
            }
            const verifiedPrice = Number(dbProd.price);
            const verifiedName = dbProd.name;

            // Wymuszenie dodatnich ilości: min 1, max 1000
            const qty = Math.max(1, Math.min(1000, parseInt(item.quantity, 10) || 1));

            subtotal += verifiedPrice * qty;
            verifiedItems.push({
                sku: dbProd.sku,
                name: verifiedName,
                price: verifiedPrice,
                quantity: qty,
                image: dbProd.image
            });
        }

        const freeShippingThreshold = 500.00;
        let shippingCost = delivery.method === 'pickup' ? 0 : (delivery.method === 'inpost' ? 15.00 : 20.00);
        if (subtotal >= freeShippingThreshold) {
            shippingCost = 0;
        }

        let discount = 0;
        if (coupon && coupon.code) {
            const code = coupon.code.toUpperCase().trim();
            if (code === 'START10') discount = subtotal * 0.10;
            else if (code === 'WIERCENIE50' && subtotal >= 500) discount = 50.00;
            else if (code === 'FREESHIP') shippingCost = 0;
        }

        const total = Math.max(0, subtotal - discount + shippingCost);
        const vatAmount = total * (0.23 / 1.23);
        const netTotal = total - vatAmount;

        const date = new Date();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `#HDD-${date.getFullYear()}-${randomNum}`;
        const orderId = `HDD-${Date.now()}-${randomNum}`;

        const initialOrder = {
            orderId,
            orderNumber,
            customer,
            delivery,
            items: verifiedItems,
            totals: {
                subtotal,
                discount,
                shipping: shippingCost,
                total,
                vatAmount,
                netTotal
            },
            paymentMethod: 'stripe',
            paymentStatus: 'PENDING_PAYMENT'
        };

        saveOrder(initialOrder);

        // Obsługa zamówienia 100% darmowego (0 PLN)
        if (total === 0) {
            initialOrder.paymentStatus = 'PAID';
            saveOrder(initialOrder);
            await sendOrderEmails(initialOrder);
            return res.json({
                success: true,
                url: `${BASE_URL}/order-success.html?order_id=${orderId}`,
                orderId,
                orderNumber
            });
        }

        // Jeśli Stripe jest skonfigurowany, generujemy prawdziwą sesję Stripe Checkout
        if (isStripeConfigured && stripe) {
            const line_items = verifiedItems.map(item => ({
                price_data: {
                    currency: 'pln',
                    product_data: {
                        name: item.name,
                        images: item.image ? [`${BASE_URL}/${item.image}`] : []
                    },
                    unit_amount: Math.round(item.price * 100)
                },
                quantity: item.quantity
            }));

            if (shippingCost > 0) {
                line_items.push({
                    price_data: {
                        currency: 'pln',
                        product_data: {
                            name: `Dostawa (${delivery.methodName || 'Kurier DPD'})`
                        },
                        unit_amount: Math.round(shippingCost * 100)
                    },
                    quantity: 1
                });
            }

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card', 'blik', 'p24'],
                line_items,
                mode: 'payment',
                customer_email: customer.email,
                client_reference_id: orderId,
                metadata: {
                    orderId,
                    orderNumber,
                    customerName: customer.name,
                    customerEmail: customer.email,
                    customerPhone: customer.phone,
                    nip: customer.nip || '',
                    companyName: customer.companyName || '',
                    deliveryMethod: delivery.method,
                    inpostCode: delivery.inpostCode || '',
                    deliveryAddress: `${customer.street || ''}, ${customer.postalCode || ''} ${customer.city || ''}`,
                    total: total.toString()
                },
                success_url: `${BASE_URL}/order-success.html?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
                cancel_url: `${BASE_URL}/checkout.html?canceled=true`
            });

            return res.json({
                success: true,
                url: session.url,
                orderId,
                orderNumber
            });
        } else {
            console.log(`ℹ️ [SANDBOX SIMULATION] Utworzono zamówienie ${orderNumber} bez Stripe API`);
            return res.json({
                success: true,
                url: `${BASE_URL}/order-success.html?mock=true&order_id=${orderId}`,
                orderId,
                orderNumber,
                isMock: true
            });
        }

    } catch (error) {
        console.error('Błąd tworzenia sesji płatności:', error);
        res.status(500).json({ error: error.message || 'Wystąpił błąd podczas inicjalizacji płatności.' });
    }
});

// ── API: Zamówienie Przelewem Tradycyjnym (Proforma) ─────────────────────────
app.post('/api/create-manual-order', async (req, res) => {
    try {
        const { cart, customer, delivery, coupon } = req.body;

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return res.status(400).json({ error: 'Koszyk jest pusty.' });
        }

        const dbProducts = getBackendProducts();
        const verifiedItems = [];
        let subtotal = 0;

        for (const item of cart) {
            const dbProd = dbProducts.find(p => p.sku === item.sku);
            if (!dbProd) {
                return res.status(400).json({ error: `Nieprawidłowy lub nieznany produkt w koszyku (Błędny SKU: ${item.sku}). Odśwież stronę.` });
            }
            const verifiedPrice = Number(dbProd.price);
            const verifiedName = dbProd.name;
            const qty = Math.max(1, Math.min(1000, parseInt(item.quantity, 10) || 1));

            subtotal += verifiedPrice * qty;
            verifiedItems.push({
                sku: dbProd.sku,
                name: verifiedName,
                price: verifiedPrice,
                quantity: qty,
                image: dbProd.image
            });
        }

        const freeShippingThreshold = 500.00;
        let shippingCost = delivery.method === 'pickup' ? 0 : (delivery.method === 'inpost' ? 15.00 : 20.00);
        if (subtotal >= freeShippingThreshold) shippingCost = 0;

        let discount = 0;
        if (coupon && coupon.code) {
            const code = coupon.code.toUpperCase().trim();
            if (code === 'START10') discount = subtotal * 0.10;
            else if (code === 'WIERCENIE50' && subtotal >= 500) discount = 50.00;
            else if (code === 'FREESHIP') shippingCost = 0;
        }

        const total = Math.max(0, subtotal - discount + shippingCost);
        const vatAmount = total * (0.23 / 1.23);
        const netTotal = total - vatAmount;

        const date = new Date();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        const orderNumber = `#HDD-${date.getFullYear()}-${randomNum}`;
        const orderId = `HDD-${Date.now()}-${randomNum}`;

        const order = {
            orderId,
            orderNumber,
            customer,
            delivery,
            items: verifiedItems,
            totals: { subtotal, discount, shipping: shippingCost, total, vatAmount, netTotal },
            paymentMethod: 'transfer',
            paymentStatus: 'PENDING_PAYMENT'
        };

        saveOrder(order);
        await sendOrderEmails(order);

        res.json({
            success: true,
            orderId,
            orderNumber,
            redirectUrl: `${BASE_URL}/order-success.html?order_id=${orderId}`
        });

    } catch (error) {
        console.error('Błąd zamówienia proforma:', error);
        res.status(500).json({ error: error.message || 'Błąd rejestracji zamówienia.' });
    }
});

// ── API: Status Zamówienia (Dla order-success.html) ────────────────────────────
app.get('/api/order-status', async (req, res) => {
    const { session_id, order_id } = req.query;

    const orders = getOrders();
    let order = null;

    if (order_id) {
        order = orders.find(o => o.orderId === order_id);
    }
    if (!order && session_id) {
        order = orders.find(o => o.stripeSessionId === session_id);
    }

    if (order) {
        return res.json({ success: true, order });
    }

    if (session_id && isStripeConfigured && stripe) {
        try {
            const session = await stripe.checkout.sessions.retrieve(session_id);
            if (session) {
                return res.json({
                    success: true,
                    order: {
                        orderId: session.client_reference_id || session.id,
                        orderNumber: session.metadata?.orderNumber || '#HDD-PAID',
                        paymentStatus: session.payment_status === 'paid' ? 'PAID' : 'PENDING_PAYMENT',
                        totals: { total: session.amount_total / 100 }
                    }
                });
            }
        } catch (e) {}
    }

    res.status(404).json({ error: 'Nie znaleziono zamówienia.' });
});

// ── API: Pobieranie Zamówień dla Panelu CMS (Chronione Tokenem) ────────────────
app.get('/api/orders', requireAdminAuth, (req, res) => {
    const orders = getOrders();
    res.json({ success: true, orders });
});

// ── API: Zapisywanie Produktów i Konfiguracji z CMS (Chronione Tokenem) ────────
app.post('/api/save', requireAdminAuth, (req, res) => {
    try {
        const { products, shopConfig } = req.body;

        if (products && Array.isArray(products)) {
            const prodCode = `let PRODUCTS = ${JSON.stringify(products, null, 4)};\n\n` +
                `// Wczytaj niestandardowe produkty z panelu administratora (jeśli istnieją)\n` +
                `try {\n` +
                `    const customData = localStorage.getItem('hdd_custom_products');\n` +
                `    if (customData) {\n` +
                `        const parsed = JSON.parse(customData);\n` +
                `        if (Array.isArray(parsed) && parsed.length > 0) {\n` +
                `            PRODUCTS = parsed;\n` +
                `        }\n` +
                `    }\n` +
                `} catch(e) {}\n`;
            fs.writeFileSync(PRODUCTS_FILE, prodCode, 'utf-8');
            console.log(`✅ Zapisano ${products.length} produktów do products.js`);
        }

        if (shopConfig) {
            const categories = shopConfig.CATEGORIES || [];
            const cat_details = shopConfig.CAT_DETAILS || {};
            const filter_options = shopConfig.FILTER_OPTIONS || {};
            const promo_codes = shopConfig.PROMO_CODES || {};
            const company_cfg = shopConfig.SHOP_CONFIG || {};

            const cfgCode = `/**\n * Centralna konfiguracja sklepu Narzędzia HDD PL\n */\n\n` +
                `let SHOP_CONFIG = ${JSON.stringify(company_cfg, null, 4)};\n\n` +
                `let CATEGORIES = ${JSON.stringify(categories, null, 4)};\n\n` +
                `let CAT_DETAILS = ${JSON.stringify(cat_details, null, 4)};\n\n` +
                `let FILTER_OPTIONS = ${JSON.stringify(filter_options, null, 4)};\n\n` +
                `let PROMO_CODES = ${JSON.stringify(promo_codes, null, 4)};\n\n` +
                `let POPULAR_PACZKOMATY = [\n` +
                `    { code: "KRA01M", desc: "Kraków, ul. Pawia 5 (Galeria Krakowska)" },\n` +
                `    { code: "KRA15A", desc: "Kraków, ul. Mogilska 43" },\n` +
                `    { code: "WAW01N", desc: "Warszawa, Al. Jerozolimskie 54" },\n` +
                `    { code: "WAW22A", desc: "Warszawa, ul. Marszałkowska 100" },\n` +
                `    { code: "WRO05M", desc: "Wrocław, ul. Piłsudskiego 105" },\n` +
                `    { code: "POZ03A", desc: "Poznań, ul. Półwiejska 42" },\n` +
                `    { code: "GDA02N", desc: "Gdańsk, ul. Rajska 10" },\n` +
                `    { code: "KAT01M", desc: "Katowice, ul. 3 Maja 30" }\n` +
                `];\n\n` +
                `let POPULAR_BANKS = [\n` +
                `    { id: "blik", name: "BLIK", logoText: "BLIK", isBlik: true },\n` +
                `    { id: "mbank", name: "mBank", color: "#e60000" },\n` +
                `    { id: "pko", name: "PKO Bank Polski (iPKO)", color: "#003399" },\n` +
                `    { id: "santander", name: "Santander Bank Polska", color: "#ec0000" },\n` +
                `    { id: "ing", name: "ING Bank Śląski", color: "#ff6200" },\n` +
                `    { id: "pekao", name: "Bank Pekao S.A.", color: "#d5002b" },\n` +
                `    { id: "alior", name: "Alior Bank", color: "#851a2d" },\n` +
                `    { id: "millennium", name: "Bank Millennium", color: "#b5006b" },\n` +
                `    { id: "bnp", name: "BNP Paribas", color: "#008a54" }\n` +
                `];\n\n` +
                `function validateNIP(nip) {\n` +
                `    if (!nip) return false;\n` +
                `    const cleanNip = nip.replace(/[\\s-]/g, '');\n` +
                `    if (cleanNip.length !== 10 || !/^\\d{10}$/.test(cleanNip)) return false;\n` +
                `    if (/^(\\d)\\1{9}$/.test(cleanNip)) return false;\n` +
                `    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];\n` +
                `    let sum = 0;\n` +
                `    for (let i = 0; i < 9; i++) sum += parseInt(cleanNip[i], 10) * weights[i];\n` +
                `    const checkDigit = sum % 11;\n` +
                `    return checkDigit === parseInt(cleanNip[9], 10) && checkDigit !== 10;\n` +
                `}\n\n` +
                `try {\n` +
                `    const customConfig = localStorage.getItem('hdd_custom_shop_config');\n` +
                `    if (customConfig) {\n` +
                `        const parsed = JSON.parse(customConfig);\n` +
                `        if (parsed.CATEGORIES) CATEGORIES = parsed.CATEGORIES;\n` +
                `        if (parsed.CAT_DETAILS) CAT_DETAILS = parsed.CAT_DETAILS;\n` +
                `        if (parsed.FILTER_OPTIONS) FILTER_OPTIONS = parsed.FILTER_OPTIONS;\n` +
                `        if (parsed.PROMO_CODES) PROMO_CODES = parsed.PROMO_CODES;\n` +
                `        if (parsed.SHOP_CONFIG) SHOP_CONFIG = parsed.SHOP_CONFIG;\n` +
                `    }\n` +
                `} catch(e) {}\n`;

            fs.writeFileSync(CONFIG_FILE, cfgCode, 'utf-8');
            console.log(`✅ Zapisano konfigurację sklepu do shop-config.js`);
        }

        res.json({ success: true, message: 'Pomyślnie zsynchronizowano pliki na dysku.' });
    } catch (e) {
        console.error('Błąd zapisu CMS:', e);
        res.status(500).json({ error: 'Nie udało się zapisać plików na dysku.' });
    }
});

// ── Serwowanie Plików Statycznych Sklepu ──────────────────────────────────────
app.use(express.static(__dirname));

// Start Serwera
app.listen(PORT, () => {
    console.log(`\n================================================================`);
    console.log(`🚀 Narzędzia HDD PL — Serwer Transakcyjny Działa na Porcie ${PORT}`);
    console.log(`🌐 Sklep:   http://localhost:${PORT}/index.html`);
    console.log(`🛍️ Koszyk:  http://localhost:${PORT}/koszyk.html`);
    console.log(`💳 Kasa:    http://localhost:${PORT}/checkout.html`);
    console.log(`⚙️ Admin:   http://localhost:${PORT}/admin.html`);
    console.log(`================================================================\n`);
});
