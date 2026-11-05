// Local single-process ecommerce server. See docs/KONFIGURACJA_I_ODBIOR.md.

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {catalogStore} = require('./catalog-store');
const catalog = catalogStore(__dirname);

const app = express();
const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const ADMIN_SECRET = process.env.ADMIN_SECRET || '';
const adminConfigured = ADMIN_SECRET.length >= 32 && !/replace|placeholder|mock|example/i.test(ADMIN_SECRET);

// ── Ścieżki do plików danych ──────────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.js');
const CONFIG_FILE = path.join(__dirname, 'shop-config.js');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}
// An absent database can be created on the first accepted order. A corrupt one must never be reset.

// ── Pomocnicze funkcje bazodanowe ─────────────────────────────────────────────
function getOrders() {
    if (!fs.existsSync(ORDERS_FILE)) return [];
    const orders = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
    if (!Array.isArray(orders)) throw new Error('Nieprawidłowa baza zamówień.');
    return orders;
}

function saveOrder(order) {
    const orders = getOrders();
    const existingIdx = orders.findIndex(o => o.orderId === order.orderId);
    if (existingIdx >= 0) orders[existingIdx] = { ...orders[existingIdx], ...order, updatedAt: new Date().toISOString() };
    else orders.unshift({ ...order, createdAt: new Date().toISOString() });
    const temporary = path.join(DATA_DIR, `orders.${crypto.randomUUID()}.tmp`);
    try {
        fs.writeFileSync(temporary, JSON.stringify(orders, null, 2), { encoding: 'utf8', flag: 'wx', flush:true });
        fs.renameSync(temporary, ORDERS_FILE);
    } catch (error) {
        try { fs.unlinkSync(temporary); } catch (_) {}
        throw error;
    }
    return existingIdx >= 0 ? orders[existingIdx] : orders[0];
}

// ── Middleware Autoryzacji Administratora (Ochrona API) ───────────────────────
function requireAdminAuth(req, res, next) {
    if (!adminConfigured) {
        return res.status(503).json({ error: 'Panel administratora nie jest skonfigurowany.' });
    }
    const token = req.headers['x-admin-token'] || '';
    const left = Buffer.from(token);
    const right = Buffer.from(ADMIN_SECRET);
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
        return res.status(401).json({ error: 'Brak autoryzacji administratora. Nieprawidłowy token (x-admin-token).' });
    }
    next();
}

// Email is optional; order status never depends on delivery of a message.
let mailTransporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT || 587),secure:process.env.SMTP_SECURE === 'true',auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});
}
async function sendOrderEmails(order, onResult) {
    return require('./order-mail').sendOrderEmails(order,mailTransporter,catalog.read().shopConfig.SHOP_CONFIG,process.env,onResult);
}
function respondError(res,caught) {
    if (!caught.status || caught.status >= 500) console.error('Błąd sklepu:',caught.code || caught.status || 'operation_failed');
    res.status(caught.status || 500).json({error:caught.status ? caught.message : 'Operacja nie powiodła się. Spróbuj ponownie później.'});
}

const {installOrders} = require('./order-routes');

// ── Standardowe Middlewares Express ───────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: {directives:{defaultSrc:["'self'"],scriptSrc:["'self'","'unsafe-inline'"],scriptSrcAttr:["'unsafe-inline'"],styleSrc:["'self'","'unsafe-inline'","https://fonts.googleapis.com"],fontSrc:["'self'","https://fonts.gstatic.com"],imgSrc:["'self'","data:"],connectSrc:["'self'"],objectSrc:["'none'"],frameAncestors:["'none'"],formAction:["'self'"],upgradeInsecureRequests:null}},
    referrerPolicy:{policy:'no-referrer'},
    crossOriginEmbedderPolicy: false
}));
app.use(express.json({ limit: '5mb' }));


// Rate limiter dla API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: { error: 'Zbyt wiele zapytań z Twojego adresu IP, spróbuj ponownie za 15 minut.' }
});
app.use('/api/',apiLimiter,(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
app.use((req,res,next)=>{
    if(req.method==='POST' && req.get('origin') && req.get('origin')!==new URL(BASE_URL).origin && req.get('origin')!==req.protocol+'://'+req.get('host')) return res.status(403).json({error:'Nieprawidłowe źródło żądania.'});
    next();
});

installOrders(app,{catalog,env:process.env,mailConfigured:!!mailTransporter,BASE_URL,PRODUCTS_FILE,CONFIG_FILE,getOrders,saveOrder,sendOrderEmails,requireAdminAuth,respondError,rateLimit});

// ── API: Zapisywanie Produktów i Konfiguracji z CMS (Chronione Tokenem) ────────
app.post('/api/save', requireAdminAuth, (req,res)=>{
    try { catalog.save(req.body);res.json({success:true}); }
    catch(caught) {respondError(res,caught);}
});
app.get(['/products.js','/shop-config.js'],(req,res)=>{
    try {res.set('Cache-Control','no-store').type('js').send(catalog.script(req.path.slice(1)));}
    catch(caught) {respondError(res,caught);}
});

// Only explicit public files. Never expose data/, .env, source, or docs.
const publicPages = new Set(['index.html','pdp.html','koszyk.html','checkout.html','order-success.html','admin.html']);
const publicScripts = new Set(['cart.js','ui-safety.js']);
app.get('/',(_req,res) => res.sendFile(path.join(__dirname,'index.html')));
app.get('/:file',(req,res,next) => {
    if(req.params.file==='admin.html')res.set('X-Robots-Tag','noindex, nofollow, noarchive');
    if (publicPages.has(req.params.file) || publicScripts.has(req.params.file)) return res.sendFile(path.join(__dirname,req.params.file));
    next();
});
app.use('/assets',express.static(path.join(__dirname,'assets'),{dotfiles:'deny',index:false}));
app.use('/images',express.static(path.join(__dirname,'images'),{dotfiles:'deny',index:false,fallthrough:false}));
app.use((_req,res) => res.status(404).send('Nie znaleziono strony.'));

app.use((err,_req,res,_next)=>{res.status(err.status || 500).json({error:'Nieprawidłowe żądanie lub błąd serwera.'});});

// Start Serwera
app.listen(PORT, process.env.HOST || '127.0.0.1', () => {
    console.log(`\n================================================================`);
    console.log(`🚀 Narzędzia HDD PL — Serwer Transakcyjny Działa na Porcie ${PORT}`);
    console.log(`🌐 Sklep:   http://localhost:${PORT}/index.html`);
    console.log(`🛍️ Koszyk:  http://localhost:${PORT}/koszyk.html`);
    console.log(`💳 Kasa:    http://localhost:${PORT}/checkout.html`);
    console.log(`⚙️ Admin:   http://localhost:${PORT}/admin.html`);
    console.log(`================================================================\n`);
});
