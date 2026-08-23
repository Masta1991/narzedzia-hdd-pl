/**
 * Centralna konfiguracja sklepu Narzędzia HDD PL
 */

let SHOP_CONFIG = {
    freeShippingThreshold: 500.00,
    vatRate: 0.23,
    currency: "zł",
    topBannerEnabled: true,
    topBannerText: "🚚 Darmowa dostawa dla wszystkich zamówień powyżej 500 PLN | Magazyn Kraków • Wysyłka w 24h",
    company: {
        name: "Narzędzia HDD Sp. z o.o.",
        address: "ul. Wiertnicza 44, 30-001 Kraków",
        nip: "6762589916",
        accountIban: "PL 42 1050 1445 1000 0090 8123 4567",
        bankName: "ING Bank Śląski S.A.",
        swift: "INGBPLPW",
        phone: "+48 123 456 789",
        email: "inzynier@narzedzia-hdd.pl"
    },
    footer: {
        aboutText: "Specjalistyczny dystrybutor osprzętu do przewiertów sterowanych HDD. Rozwiertaki, chwytaki, żerdzie, krętliki i chemia wiertnicza z dostawą w 24h na plac budowy.",
        workingHours: "Pn - Pt: 7:00 - 17:00 | Dyżur serwisowy: 24/7",
        copyright: "© 2026 Narzędzia HDD PL. Wszelkie prawa zastrzeżone."
    }
};

let CATEGORIES = [
    { id: 'all', name: 'Wszystkie produkty', icon: 'grid' },
    { id: 'rozwiertaki', name: 'Rozwiertaki', icon: 'tool' },
    { id: 'chwytaki', name: 'Chwytaki do Rur', icon: 'anchor' },
    { id: 'kretliki', name: 'Krętliki HDD', icon: 'refresh' },
    { id: 'glowice-obudowy', name: 'Głowice i obudowy sondy', icon: 'cpu' },
    { id: 'plyty-pletwy', name: 'Płyty i płetwy wiercące', icon: 'layers' },
    { id: 'rolki', name: 'Rolki do rur', icon: 'circle' },
    { id: 'sondy-lokalizacja', name: 'Sondy i systemy lokalizacyjne', icon: 'radio' },
    { id: 'zerdzie', name: 'Żerdzie wiertnicze', icon: 'bar-chart' },
    { id: 'zeby', name: 'Zęby wiertnicze', icon: 'hash' },
    { id: 'smary', name: 'Smary i chemia', icon: 'droplet' }
];

let CAT_DETAILS = {
    'all': { 
        title: 'Wszystkie produkty', 
        desc: 'Pełen katalog profesjonalnego osprzętu wiertniczego HDD, narzędzi poszerzających oraz części zamiennych dostępnych od ręki.' 
    },
    'rozwiertaki': { 
        title: 'Rozwiertaki wiertnicze HDD', 
        desc: 'Rozwiertaki baryłkowe, skrzydłowe, kompaktowe i skałkowe (reamery) o średnicach od 150 mm do 800 mm. Wzmocnione zbrojeniem z węglika spiekanego.' 
    },
    'chwytaki': { 
        title: 'Chwytaki do Rur PE / PVC', 
        desc: 'Wytrzymałe chwytaki zaciskowe, gwintowane oraz kołnierzowe do bezpiecznego zaciągania rurociągów w technologiach bezwykopowych.' 
    },
    'kretliki': { 
        title: 'Krętliki HDD (Swivels)', 
        desc: 'Krętliki łożyskowane o uciągach od 5T do 60T, zapobiegające przenoszeniu momentu obrotowego na zaciągane rury.' 
    },
    'glowice-obudowy': { 
        title: 'Głowice pilotujące i obudowy sond', 
        desc: 'Pancerne obudowy nadajników systemów lokalizacyjnych oraz głowice pilotujące z wymiennymi płytami sterującymi.' 
    },
    'plyty-pletwy': { 
        title: 'Płyty i płetwy wiercące', 
        desc: 'Wymienne płetwy twarde i skałkowe do głowic pilotujących, zbrojone węglikiem, optymalizowane pod grunty piaszczyste, gliniaste i żwirowe.' 
    },
    'rolki': { 
        title: 'Rolki prowadzące do rur', 
        desc: 'Wprowadzające i podporowe rolki ułatwiające transport rur PE/stalowych na placu budowy bez uszkodzeń powłoki.' 
    },
    'sondy-lokalizacja': { 
        title: 'Sondy i systemy lokalizacyjne', 
        desc: 'Wieloczęstotliwościowe sondy nadawcze, odbiorniki i wyświetlacze kabinowe kompatybilne z wiodącymi systemami telemetrycznymi.' 
    },
    'zerdzie': { 
        title: 'Żerdzie wiertnicze', 
        desc: 'Jednorodne oraz zgrzewane tarciowo żerdzie wiertnicze ze stali stopowej o wysokiej odporności na zmęczenie materiałowe i skręcanie.' 
    },
    'zeby': { 
        title: 'Zęby i listwy wiertnicze', 
        desc: 'Wymienne zęby tnące, listwy oraz węgliki spiekane do rozwiertaków baryłkowych, głowic i łyżek wiertniczych.' 
    },
    'smary': { 
        title: 'Smary miedziowe i biodegradowalne', 
        desc: 'Specjalistyczne smary wysokociśnieniowe do ochrony gwintów żerdzi wiertniczych przed zatarciem i korozją pod ziemią.' 
    }
};

let FILTER_OPTIONS = {
    'chwytaki': [
        { value: 'gladkie', label: 'Chwytaki gładkie' },
        { value: 'gwintowane', label: 'Chwytaki gwintowane' },
        { value: 'kolnierzowe-dlugie', label: 'Kołnierzowe – długie' },
        { value: 'kolnierzowe-krotkie', label: 'Kołnierzowe – krótkie' },
        { value: 'glowice-pe', label: 'Głowice PE' }
    ],
    'rozwiertaki': [
        { value: 'skrzydlowy', label: 'Skrzydłowe' },
        { value: 'barylkowy', label: 'Baryłkowe' },
        { value: 'kompaktowy', label: 'Kompaktowe' },
        { value: 'skalkowy', label: 'Skałkowe / TCI' }
    ],
    'kretliki': [
        { value: '5t-15t', label: 'Uciąg 5T – 15T' },
        { value: '20t-35t', label: 'Uciąg 20T – 35T' },
        { value: '40t-60t', label: 'Uciąg 40T – 60T' }
    ],
    'glowice-obudowy': [
        { value: 'obudowa-standard', label: 'Obudowy standardowe' },
        { value: 'obudowa-skalka', label: 'Obudowy na skałę' },
        { value: 'glowica-pilot', label: 'Głowice pilotujące' }
    ],
    'zeby': [
        { value: 'listwy', label: 'Listwy zębate' },
        { value: 'pojedyncze', label: 'Zęby pojedyncze' },
        { value: 'stozkowe', label: 'Zęby stożkowe / pick' }
    ]
};

let PROMO_CODES = {
    'HDD2026': { type: 'percent', value: 10, label: 'Rabat -10% na całe zamówienie' },
    'WIERCENIE50': { type: 'fixed', value: 50, label: 'Zniżka -50 zł' },
    'FREESHIP': { type: 'free_shipping', value: 0, label: 'Darmowa dostawa' },
    'VIPB2B': { type: 'percent', value: 15, label: 'Rabat partnerski B2B -15%' }
};

let POPULAR_PACZKOMATY = [
    { code: "KRA01M", desc: "Kraków, ul. Pawia 5 (Galeria Krakowska)" },
    { code: "KRA15A", desc: "Kraków, ul. Mogilska 43" },
    { code: "WAW01N", desc: "Warszawa, Al. Jerozolimskie 54" },
    { code: "WAW22A", desc: "Warszawa, ul. Marszałkowska 100" },
    { code: "WRO05M", desc: "Wrocław, ul. Piłsudskiego 105" },
    { code: "POZ03A", desc: "Poznań, ul. Półwiejska 42" },
    { code: "GDA02N", desc: "Gdańsk, ul. Rajska 10" },
    { code: "KAT01M", desc: "Katowice, ul. 3 Maja 30" }
];

let POPULAR_BANKS = [
    { id: 'blik', name: 'BLIK', logoText: 'BLIK', isBlik: true },
    { id: 'mbank', name: 'mBank', color: '#e60000' },
    { id: 'pko', name: 'PKO Bank Polski (iPKO)', color: '#003399' },
    { id: 'santander', name: 'Santander Bank Polska', color: '#ec0000' },
    { id: 'ing', name: 'ING Bank Śląski', color: '#ff6200' },
    { id: 'pekao', name: 'Bank Pekao S.A.', color: '#d5002b' },
    { id: 'alior', name: 'Alior Bank', color: '#851a2d' },
    { id: 'millennium', name: 'Bank Millennium', color: '#b5006b' },
    { id: 'bnp', name: 'BNP Paribas', color: '#008a54' }
];

// Helper walidacji polskiego NIP (zgodny z algorytmem MF i sumą kontrolną)
function validateNIP(nip) {
    if (!nip) return false;
    const cleanNip = String(nip).replace(/[\s-]/g, '');
    if (cleanNip.length !== 10 || !/^\d{10}$/.test(cleanNip)) return false;
    if (/^(\d)\1{9}$/.test(cleanNip)) return false; // Odrzucenie 10 jednakowych cyfr
    
    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleanNip[i], 10) * weights[i];
    }
    const checkDigit = sum % 11;
    return checkDigit === parseInt(cleanNip[9], 10) && checkDigit !== 10;
}

// Wczytaj niestandardowe konfiguracje z panelu administratora (jeśli istnieją)
try {
    const customConfig = localStorage.getItem('hdd_custom_shop_config');
    if (customConfig) {
        const parsed = JSON.parse(customConfig);
        if (parsed.CATEGORIES) CATEGORIES = parsed.CATEGORIES;
        if (parsed.CAT_DETAILS) CAT_DETAILS = parsed.CAT_DETAILS;
        if (parsed.FILTER_OPTIONS) FILTER_OPTIONS = parsed.FILTER_OPTIONS;
        if (parsed.PROMO_CODES) PROMO_CODES = parsed.PROMO_CODES;
        if (parsed.SHOP_CONFIG) Object.assign(SHOP_CONFIG, parsed.SHOP_CONFIG);
    }
} catch(e) {
    console.warn('Nie udało się wczytać hdd_custom_shop_config:', e);
}

// Automatyczne aplikowanie konfiguracji nagłówka i stopki w DOM
function applyShopConfigToDOM() {
    if (typeof SHOP_CONFIG === 'undefined') return;

    // 1. Górny pasek ogłoszeń (Top Announcement Bar)
    const bannerEls = document.querySelectorAll('.top-announcement-bar, #top-banner-bar, header .bg-ink-deep.text-canvas.text-xs');
    bannerEls.forEach(el => {
        if (SHOP_CONFIG.topBannerEnabled === false) {
            el.style.display = 'none';
        } else if (SHOP_CONFIG.topBannerText) {
            el.innerHTML = `<span>${SHOP_CONFIG.topBannerText}</span>`;
            el.style.display = '';
        }
    });

    // 2. Dane firmy w stopkach i nagłówkach
    const c = SHOP_CONFIG.company || {};
    if (c.name) document.querySelectorAll('.company-name-text').forEach(el => el.innerText = c.name);
    if (c.phone) document.querySelectorAll('.company-phone-text').forEach(el => el.innerText = `📞 ${c.phone}`);
    if (c.email) document.querySelectorAll('.company-email-text').forEach(el => el.innerText = `✉️ ${c.email}`);
    if (c.address) document.querySelectorAll('.company-address-text').forEach(el => el.innerText = c.address);

    // 3. Teksty w stopce
    const f = SHOP_CONFIG.footer || {};
    if (f.aboutText) document.querySelectorAll('.footer-about-text').forEach(el => el.innerText = f.aboutText);
    if (f.workingHours) document.querySelectorAll('.footer-hours-text').forEach(el => el.innerText = f.workingHours);
    if (f.copyright) document.querySelectorAll('.footer-copyright-text').forEach(el => el.innerText = f.copyright);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyShopConfigToDOM);
} else {
    applyShopConfigToDOM();
}
