const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {readDeclaration,error,validNip,validIban} = require('./order-core');
const sections = ['SHOP_CONFIG','CATEGORIES','CAT_DETAILS','FILTER_OPTIONS','PROMO_CODES'];
function atomicWrite(file,value) {
    const temp = file + '.' + crypto.randomUUID() + '.tmp';
    try {
        fs.writeFileSync(temp,value,{encoding:'utf8',flag:'wx',flush:true});
        fs.renameSync(temp,file);
    } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}
function validateCatalog(data) {
    const bad = () => {throw error('Nieprawidłowe dane katalogu lub konfiguracji.');};
    const text = (v,max=10000) => typeof v === 'string' && v.length <= max;
    const id = v => text(v,80) && /^[A-Za-z0-9_-]+$/.test(v) && !['__proto__','constructor','prototype'].includes(v);
    function inspect(v,depth=0) {
        if (depth>12) bad();
        if (v && typeof v==='object') for (const [k,x] of Object.entries(v)) {
            if (['__proto__','constructor','prototype'].includes(k)) bad();
            inspect(x,depth+1);
        }
    }
    inspect(data);
    if (!Array.isArray(data?.products) || data.products.length>1000) bad();
    const c=data.shopConfig;
    if (!c || sections.some(k=>!c[k])) bad();
    const cfg=c.SHOP_CONFIG;
    if (!Number.isFinite(cfg.freeShippingThreshold) || cfg.freeShippingThreshold<0 || cfg.freeShippingThreshold>1000000 || !Number.isFinite(cfg.vatRate) || cfg.vatRate<0 || cfg.vatRate>1) bad();
    if (!cfg.company || !cfg.footer || !text(cfg.topBannerText)) bad();
    for (const key of ['name','address','nip','accountIban','bankName','swift','phone','email']) if (!text(cfg.company[key],300)) bad();
    if (cfg.company.nip && !validNip(cfg.company.nip)) throw error('Nieprawidłowy NIP sprzedawcy.');
    if (cfg.company.accountIban && !validIban(cfg.company.accountIban)) throw error('Nieprawidłowy polski IBAN.');
    if (cfg.company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cfg.company.email)) bad();
    for (const key of ['aboutText','workingHours','copyright']) if (!text(cfg.footer[key])) bad();
    if (!Array.isArray(c.CATEGORIES) || !c.CATEGORIES.length || c.CATEGORIES.length>100) bad();
    const cats=new Set();
    for(const cat of c.CATEGORIES) {if(!id(cat.id)||cats.has(cat.id)||!text(cat.name,200)||!id(cat.icon)) bad();cats.add(cat.id);}
    if(!cats.has('all')) bad();
    for(const [key,detail] of Object.entries(c.CAT_DETAILS)) if(!id(key)||!text(detail.title,200)||!text(detail.desc)) bad();
    for(const [key,options] of Object.entries(c.FILTER_OPTIONS)) if(!id(key)||!Array.isArray(options)||options.some(x=>!id(x.value)||!text(x.label,200))) bad();
    for(const [code,promo] of Object.entries(c.PROMO_CODES)) {
        if(!/^[A-Z0-9_-]{1,40}$/.test(code)||!['percent','fixed','free_shipping'].includes(promo.type)||!Number.isFinite(promo.value)||promo.value<0||promo.value>1000000||!text(promo.label,200)) bad();
        if(promo.type==='percent' && promo.value>100) bad();
        if(promo.minSubtotal!==undefined && (!Number.isFinite(promo.minSubtotal)||promo.minSubtotal<0||promo.minSubtotal>1000000)) bad();
    }
    const skus=new Set();
    for (const p of data.products) {
        if(!p||!id(p.sku)||skus.has(p.sku)||!text(p.name,300)||!p.name.trim()||!Number.isFinite(p.price)||p.price<=0||p.price>1000000) bad();
        skus.add(p.sku);
        if(!text(p.image,4000000)||!(/^(images\/[A-Za-z0-9_.\/-]+|data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+)$/.test(p.image))||p.image.includes('..')) bad();
        if(!Array.isArray(p.categories)||p.categories.some(x=>!cats.has(x))) bad();
        if(p.pdfDoc && (!text(p.pdfDoc,4000000)||!/^data:application\/pdf;base64,[A-Za-z0-9+/=]+$/.test(p.pdfDoc))) bad();
        for(const key of ['stock','description','thread','badge','badgeClass','bundleSku','type']) if(p[key]!==undefined && !text(p[key])) bad();
        if(p.specs && Object.values(p.specs).some(v=>!text(v,1000))) bad();
    }
    return data;
}
function catalogStore(root) {
    const file=path.join(root,'data','catalog.json');
    const configFile=path.join(root,'shop-config.js');
    function read() {
        if(fs.existsSync(file)) return validateCatalog(JSON.parse(fs.readFileSync(file,'utf8')));
        return {products:readDeclaration(path.join(root,'products.js'),'PRODUCTS'),shopConfig:Object.fromEntries(sections.map(k=>[k,readDeclaration(configFile,k)]))};
    }
    function script(name) {
        const data=read();
        if(name==='products.js') return `let PRODUCTS = ${JSON.stringify(data.products)};\n`;
        let source=fs.readFileSync(configFile,'utf8');
        for(const key of sections) source=source.replace(new RegExp(`(\\blet ${key}\\s*=\\s*)[\\s\\S]*?(;\\s*(?:\\r?\\n|$))`),(_m,a,b)=>a+JSON.stringify(data.shopConfig[key])+b);
        return source;
    }
    return {read,script,save:data=>atomicWrite(file,JSON.stringify(validateCatalog(data),null,2))};
}
module.exports={catalogStore,validateCatalog,atomicWrite};
