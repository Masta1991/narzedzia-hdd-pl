const crypto = require('crypto');
const {error,validIban,validNip,validateOrder} = require('./order-core');

function installOrders(app, deps) {
    const {catalog,env,mailConfigured,BASE_URL,getOrders,saveOrder,sendOrderEmails,requireAdminAuth,respondError,rateLimit} = deps;
    const checkoutLimiter = rateLimit({windowMs:15*60*1000,limit:30,standardHeaders:'draft-7',legacyHeaders:false});
    const config = () => catalog.read().shopConfig;
    const legalUrl = value => {try {const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
    const ready = () => {
        const company=config().SHOP_CONFIG.company;
        return env.SHOP_ENABLED==='true' && mailConfigured && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SHOP_OWNER_EMAIL || '') && company.name.trim() && company.address.trim() && company.email.trim() && company.phone.trim() && validNip(company.nip) && legalUrl(env.TERMS_URL) && legalUrl(env.PRIVACY_URL);
    };
    const active=new Set();
    const find = id => {const order=getOrders().find(o=>o.orderId===id);if(!order)throw error('Nie znaleziono zamówienia.',404);return order;};
    async function notify(order) {
        if(order.orderStatus==='CANCELLED')return;
        if(active.has(order.orderId))return;
        active.add(order.orderId);
        try {
            await sendOrderEmails(order, (recipient,result) => {
                const latest=find(order.orderId);
                saveOrder({...latest,notifications:{...latest.notifications,[recipient]:result}});
            });
        } finally {active.delete(order.orderId);}
    }
    const transition = (order,changes,event) => saveOrder({...order,...changes,statusHistory:[...(order.statusHistory || []),{event,orderStatus:changes.orderStatus || order.orderStatus,paymentStatus:changes.paymentStatus || order.paymentStatus,at:new Date().toISOString(),actor:'administrator'}]});
    app.get('/api/payment-options',(_req,res) => {
        try { res.json({online:false,transfer:false,proforma:!!ready(),termsUrl:legalUrl(env.TERMS_URL)?env.TERMS_URL:null,privacyUrl:legalUrl(env.PRIVACY_URL)?env.PRIVACY_URL:null}); }
        catch (caught) { respondError(res,caught); }
    });
    app.post('/api/create-manual-order',checkoutLimiter,async(req,res) => {
        try {
            if(!ready())throw error('Sklep jest w przygotowaniu. Zamówienia są obecnie wyłączone.',503);
            if(req.body?.termsAccepted!==true)throw error('Wymagana jest akceptacja warunków sprzedaży.');
            if(!Array.isArray(req.body.cart))throw error('Nieprawidłowy koszyk.');
            const key=req.body.requestId;
            if(typeof key!=='string'||!/^[0-9a-f-]{36}$/i.test(key))throw error('Odśwież formularz zamówienia.');
            if(!Number.isSafeInteger(req.body.expectedTotalCents) || req.body.expectedTotalCents<=0)throw error('Odśwież stronę i sprawdź kwotę zamówienia.');
            const fingerprint=crypto.createHash('sha256').update(JSON.stringify({cart:req.body.cart?.map(i=>({sku:i?.sku,quantity:i?.quantity})),customer:req.body.customer,delivery:req.body.delivery,coupon:req.body.coupon?.code || '',expectedTotalCents:req.body.expectedTotalCents})).digest('hex');
            let order=getOrders().find(o=>o.requestId===key);
            if(order && (order.paymentMethod!=='proforma'||order.requestFingerprint!==fingerprint))throw error('Treść zamówienia zmieniła się. Odśwież formularz przed nową próbą.',409);
            if(!order) {
                const data=catalog.read(),verified=validateOrder(req.body,data.products,data.shopConfig);
                if(verified.totalCents!==req.body.expectedTotalCents)throw error('Wycena zamówienia zmieniła się. Odśwież stronę i sprawdź kwotę przed ponownym złożeniem zamówienia.',409);
                const orderId=crypto.randomUUID(),at=new Date().toISOString();
                order=saveOrder({orderId,orderNumber:`HDD-${new Date().getFullYear()}-${orderId.slice(0,8).toUpperCase()}`,accessToken:crypto.randomBytes(32).toString('hex'),customer:verified.customer,delivery:verified.delivery,items:verified.items,couponCode:verified.couponCode,totals:verified.totals,paymentMethod:'proforma',paymentStatus:'UNPAID',orderStatus:'NEW',requestId:key,requestFingerprint:fingerprint,termsAcceptedAt:at,termsUrl:env.TERMS_URL,privacyUrl:env.PRIVACY_URL,statusHistory:[{event:'CREATED',orderStatus:'NEW',paymentStatus:'UNPAID',at,actor:'customer'}],notifications:{customer:{status:'PENDING'},owner:{status:'PENDING'}}});
            }
            await notify(order);
            res.json({success:true,orderId:order.orderId,orderNumber:order.orderNumber,redirectUrl:`${BASE_URL}/order-success.html?order_id=${encodeURIComponent(order.orderId)}&access_token=${order.accessToken}`});
        } catch (caught) { respondError(res,caught); }
    });
    app.get('/api/order-status',(req,res) => {
        try {
            const orderId=String(req.query.order_id || ''),token=String(req.query.access_token || '');
            const order=getOrders().find(item=>item.orderId===orderId);
            if(!order || !order.accessToken || !/^[0-9a-f]{64}$/.test(token) || token.length!==order.accessToken.length || !crypto.timingSafeEqual(Buffer.from(token),Buffer.from(order.accessToken)))throw error('Nie znaleziono zamówienia.',404);
            const result={orderId:order.orderId,orderNumber:order.orderNumber,paymentMethod:order.paymentMethod,paymentStatus:order.paymentStatus,orderStatus:order.orderStatus,totals:{total:order.totals.total},delivery:order.delivery,invoiceRequested:order.customer.isB2B};
            if(order.paymentMethod==='transfer' && validIban(order.bank?.iban))result.bank=order.bank;
            res.json({success:true,order:result});
        } catch(caught){respondError(res,caught);}
    });
    app.get('/api/orders',requireAdminAuth,(_req,res)=>{
        try{res.json({success:true,orders:getOrders()});}catch(caught){respondError(res,caught);}
    });
    app.post('/api/orders/:id/status',requireAdminAuth,(req,res)=>{
        try {
            const order=find(req.params.id),status=req.body?.status;
            if(order.paymentMethod!=='proforma')throw error('Historyczne zamówienie nie obsługuje nowego procesu.',409);
            if(!['PROFORMA_SENT','IN_PROGRESS','COMPLETED','CANCELLED'].includes(status))throw error('Nieprawidłowy status.');
            if(status===order.orderStatus)return res.json({success:true,order});
            const allowed=(status==='PROFORMA_SENT' && order.orderStatus==='NEW') || (status==='IN_PROGRESS' && order.orderStatus==='PROFORMA_SENT' && order.paymentStatus==='PAID') || (status==='COMPLETED' && order.orderStatus==='IN_PROGRESS' && order.paymentStatus==='PAID') || (status==='CANCELLED' && ['NEW','PROFORMA_SENT'].includes(order.orderStatus) && order.paymentStatus!=='PAID');
            if(!allowed)throw error('Niedozwolona zmiana etapu zamówienia.',409);
            res.json({success:true,order:transition(order,{orderStatus:status},status)});
        }catch(caught){respondError(res,caught);}
    });
    app.post('/api/orders/:id/mark-paid',requireAdminAuth,(req,res)=>{
        try {
            const order=find(req.params.id);
            if(!['proforma','transfer'].includes(order.paymentMethod))throw error('Nie znaleziono zamówienia przelewowego.',404);
            if(req.body?.confirmed!==true)throw error('Potwierdź sprawdzenie wpływu pieniędzy na rachunek.');
            if(order.paymentStatus==='PAID')return res.json({success:true,order});
            if(order.paymentMethod==='proforma' && order.orderStatus!=='PROFORMA_SENT')throw error('Najpierw oznacz wysłanie pro formy.',409);
            res.json({success:true,order:transition(order,{paymentStatus:'PAID',paidAt:new Date().toISOString(),paymentConfirmedBy:'administrator'},'PAYMENT_CONFIRMED')});
        }catch(caught){respondError(res,caught);}
    });
    app.post('/api/orders/:id/retry-notifications',requireAdminAuth,async(req,res)=>{
        try {
            const order=find(req.params.id);
            if(order.paymentMethod!=='proforma')throw error('Historyczne powiadomienia nie są ponawiane.',409);
            if(order.orderStatus==='CANCELLED')throw error('Zamówienie anulowano.',409);
            await notify(order);
            res.json({success:true,order:find(order.orderId)});
        }catch(caught){respondError(res,caught);}
    });
}
module.exports={installOrders};
