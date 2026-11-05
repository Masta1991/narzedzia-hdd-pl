// Values inserted into HTML must never become markup or event handlers.
function htmlText(value) {
    return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
function addSkuToCart(sku) {
    const product=PRODUCTS.find(p=>p.sku===sku);
    if(product) addToCart({...product,quantity:1});
}
function contactShop(sku='') {
    const email=SHOP_CONFIG.company?.email;
    if(!email) {alert('Dane kontaktowe sprzedawcy zostaną udostępnione przed rozpoczęciem sprzedaży.');return;}
    location.href='mailto:'+encodeURIComponent(email)+'?subject='+encodeURIComponent('Zapytanie o produkt '+sku);
}
document.addEventListener('DOMContentLoaded',()=>{
    // Isolate each existing overlay without changing its visual presentation.
    const overlays=[...document.querySelectorAll('#admin-login-overlay,#product-modal,#category-modal,#coupon-modal,#processing-modal')];
    let current=null,previous=null;
    const visible=el=>!el.classList.contains('hidden');
    function sync() {
        const next=overlays.find(visible)||null;
        if(next===current) return;
        document.querySelectorAll('[data-modal-inert]').forEach(el=>{el.inert=false;el.removeAttribute('data-modal-inert');});
        if(next) {
            if(!current) previous=document.activeElement;
            next.setAttribute('role','dialog');next.setAttribute('aria-modal','true');next.tabIndex=-1;
            next.setAttribute('aria-label',next.querySelector('h2,h3')?.textContent || 'Przetwarzanie zamówienia');
            for(const child of document.body.children) if(child!==next&&!child.contains(next)&&!['SCRIPT','STYLE'].includes(child.tagName)) {child.inert=true;child.setAttribute('data-modal-inert','');}
            (next.querySelector('input,button,select,textarea')||next).focus();
        } else {
            const target=previous?.isConnected && previous.getClientRects().length && !previous.closest('.hidden') ? previous : document.getElementById('tab-btn-products');
            target?.focus();
        }
        current=next;
    }
    for(const el of overlays) new MutationObserver(sync).observe(el,{attributes:true,attributeFilter:['class']});
    document.addEventListener('keydown',event=>{
        if(!current) return;
        if(event.key==='Escape' && !['admin-login-overlay','processing-modal'].includes(current.id)) {
            const close={ 'product-modal':'closeProductModal','category-modal':'closeCategoryModal','coupon-modal':'closeCouponModal'}[current.id];
            if(typeof window[close]==='function') window[close]();
        }
        if(event.key!=='Tab') return;
        const controls=[...current.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length);
        if(!controls.length) {event.preventDefault();current.focus();return;}
        const first=controls[0],last=controls.at(-1);
        if(event.shiftKey && (document.activeElement===first||document.activeElement===current)) {event.preventDefault();last.focus();}
        else if(!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus();}
    });
    sync();
});
