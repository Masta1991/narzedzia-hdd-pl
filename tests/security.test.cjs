const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('fs'),path=require('path');
const {start,payload,token,root}=require('./harness.cjs');
async function scenario(options,fn){const s=await start(options);try{await fn(s);}finally{await s.close();}}
test('private files, authentication, same-origin and cache policy',()=>scenario({},async s=>{
 for(const url of ['/data/orders.json','/data/catalog.json','/.env','/server.js','/package.json','/order-core.js','/docs/MODEL_HANDOFF.md','/admin-server.py','/auth-gate.js']) assert.equal((await s.request(url)).status,404,url);
 for(const url of ['/api/orders','/api/save'])assert.equal((await s.request(url,url.endsWith('save')?{}:undefined)).status,401);
 assert.equal((await s.request('/api/orders',undefined,{'x-admin-token':'bad'})).status,401);
 assert.equal((await s.request('/api/orders',undefined,{'x-admin-token':token})).status,200);
 assert.equal((await s.request('/api/create-manual-order',payload(),{origin:'https://attacker.invalid'})).status,403);
 const r=await s.request('/api/orders',undefined,{'x-admin-token':token});assert.equal(r.headers.get('cache-control'),'no-store');
 assert.match((await s.request('/')).headers.get('content-security-policy'),/object-src 'none'/);
}));
test('server prices, coupons, quantities, stock and customer validation',()=>scenario({},async s=>{
 let r=await s.request('/api/create-manual-order',payload());assert.equal(r.status,200);assert.equal(s.orders()[0].totals.total,220);
 for(const quantity of [0,-1,1.5,1001,'2',null])assert.equal((await s.request('/api/create-manual-order',payload({cart:[{sku:'TEST-100',quantity}]}))).status,400);
 for(const override of [{customer:{}},{delivery:{method:'unknown'}},{delivery:{method:'inpost'}},{cart:[{sku:'unknown',quantity:1}]},{cart:[{sku:'TEST-OOS',quantity:1}]},{cart:[{sku:'TEST-100',quantity:1},{sku:'TEST-100',quantity:1}]},{termsAccepted:false},{coupon:{code:'START10'}},{coupon:{code:'WIERCENIE50'}}])assert.equal((await s.request('/api/create-manual-order',payload(override))).status,400,JSON.stringify(override));
 for(const [code,total] of [['HDD2026',200],['FREESHIP',200],['VIPB2B',190]]) {
   r=await s.request('/api/create-manual-order',payload({coupon:{code},expectedTotalCents:total*100}));assert.equal(r.status,200);
   const o=s.orders().find(o=>o.orderId===r.data.orderId);assert.equal(o.totals.total,total);
 }
 r=await s.request('/api/create-manual-order',payload({cart:[{sku:'TEST-100',quantity:5}],expectedTotalCents:45000,coupon:{code:'WIERCENIE50'}}));assert.equal(r.status,200);assert.equal(s.orders()[0].totals.total,450);
}));
test('corruption and disk failure cannot be reported as successful writes',()=>scenario({},async s=>{
 const file=path.join(s.dir,'data/orders.json');fs.writeFileSync(file,'INVALID');
 assert.equal((await s.request('/api/create-manual-order',payload())).status,500);assert.equal(fs.readFileSync(file,'utf8'),'INVALID');
 fs.unlinkSync(file);fs.mkdirSync(file);assert.equal((await s.request('/api/create-manual-order',payload())).status,500);
 const catalogFile=path.join(s.dir,'data/catalog.json'),cfg=s.store.read();fs.unlinkSync(catalogFile);fs.mkdirSync(catalogFile);
 assert.equal((await s.request('/api/save',cfg,{'x-admin-token':token})).status,500);
}));
test('catalog save validates config, commits both sections, preserves source and public runtime',()=>scenario({},async s=>{
 const data=s.store.read(),headers={'x-admin-token':token};data.products[0].name='Changed';data.shopConfig.SHOP_CONFIG.freeShippingThreshold=300;
 assert.equal((await s.request('/api/save',data,headers)).status,200);assert.equal(s.store.read().products[0].name,'Changed');assert.equal(s.store.read().shopConfig.SHOP_CONFIG.freeShippingThreshold,300);
 assert.match((await s.request('/products.js')).data,/Changed/);assert.match((await s.request('/shop-config.js')).data,/function validateNIP/);
 for(const mutate of [d=>d.products[0].price=-1,d=>d.products[0].image='javascript:alert(1)',d=>d.products[0].pdfDoc='javascript:alert(1)',d=>d.shopConfig.SHOP_CONFIG.accountIban='bad',d=>d.shopConfig.PROMO_CODES.X={type:'percent',value:101,label:'bad'}].filter((_,i)=>i!==3)) {
   const bad=structuredClone(data);mutate(bad);assert.equal((await s.request('/api/save',bad,headers)).status,400);
 }
 const invalid=structuredClone(data);invalid.shopConfig.SHOP_CONFIG.company.accountIban='PL123';assert.equal((await s.request('/api/save',invalid,headers)).status,400);
 assert.equal(s.store.read().products[0].price,100);
}));
const admin={'x-admin-token':token};
test('manual-only configuration; bank optional; no electronic payment routes',async()=>{
 await scenario({noBank:true},async s=>{
  assert.equal((await s.request('/api/payment-options')).data.proforma,true);
  assert.equal((await s.request('/api/payment-options')).data.online,false);
  for(const route of ['/api/create-checkout-session','/api/webhook'])assert.equal((await s.request(route,payload())).status,404);
  assert.equal((await s.request('/api/create-manual-order',payload())).status,200);
  assert.equal(s.orders()[0].bank,undefined);
  assert.match((await s.request('/admin.html')).headers.get('x-robots-tag'),/noindex/);
 });
 await scenario({unconfigured:true},async s=>{assert.equal((await s.request('/api/create-manual-order',payload())).status,503);assert.equal(s.orders().length,0);});
 await scenario({noAdmin:true},async s=>assert.equal((await s.request('/api/orders')).status,503));
});
test('retry keeps original price and one order; protects status and personal data',()=>scenario({},async s=>{
 const body=payload(),r=await s.request('/api/create-manual-order',body);assert.equal(r.status,200);
 const order=s.orders()[0],link=new URL(r.data.redirectUrl),count=s.mails.length;
 const cfg=s.store.read();cfg.products[0].price=999;s.store.save(cfg);
 assert.equal((await s.request('/api/create-manual-order',body)).data.orderId,order.orderId);
 assert.equal(s.orders().length,1);assert.equal(s.orders()[0].totals.total,220);assert.equal(s.mails.length,count);
 assert.equal((await s.request('/api/create-manual-order',{...body,cart:[{sku:'TEST-100',quantity:3}]})).status,409);
 for(const suffix of ['', '&access_token='+ 'a'.repeat(64),'&access_token='+encodeURIComponent('ą'.repeat(64))])assert.equal((await s.request('/api/order-status?order_id='+order.orderId+suffix)).status,404);
 const status=(await s.request('/api/order-status'+link.search)).data.order;
 assert.equal(status.customer,undefined);assert.equal(status.notifications,undefined);assert.equal(status.bank,undefined);assert.equal(status.orderStatus,'NEW');assert.equal(status.paymentStatus,'UNPAID');
 assert.ok(s.mails.every(m=>m.html.includes('220.00 zł') && m.html.includes('Poczekaj na pro formę') && !m.html.includes('PL')));
}));
test('B2B and private customers; NIP and immutable final amount',()=>scenario({},async s=>{
 const body=payload();body.customer={...body.customer,isB2B:true,nip:'1234563218',companyName:'Synthetic Company'};
 assert.equal((await s.request('/api/create-manual-order',body)).status,200);assert.equal(s.orders()[0].customer.isB2B,true);
 assert.match(s.mails[0].html,/1234563218/);
 body.requestId=require('crypto').randomUUID();body.customer.nip='1234567890';assert.equal((await s.request('/api/create-manual-order',body)).status,400);
 assert.equal((await s.request('/api/create-manual-order',payload())).status,200);assert.equal(s.orders()[0].customer.isB2B,false);
}));
test('workflow transitions, explicit payment confirmation, cancellation and authorization',()=>scenario({},async s=>{
 await s.request('/api/create-manual-order',payload());const original=s.orders()[0],route='/api/orders/'+original.orderId;
 for(const suffix of ['/status','/mark-paid','/retry-notifications'])assert.equal((await s.request(route+suffix,{})).status,401);
 const status=x=>s.request(route+'/status',{status:x},admin);
 assert.equal((await status('IN_PROGRESS')).status,409);assert.equal((await status('COMPLETED')).status,409);
 assert.equal((await s.request(route+'/mark-paid',{confirmed:true},admin)).status,409);
 assert.equal((await status('PROFORMA_SENT')).status,200);assert.equal((await status('IN_PROGRESS')).status,409);
 assert.equal((await s.request(route+'/mark-paid',{},admin)).status,400);
 assert.equal((await s.request(route+'/mark-paid',{confirmed:true},admin)).status,200);
 const paid=s.orders()[0];assert.equal(paid.orderStatus,'PROFORMA_SENT');assert.equal(paid.paymentStatus,'PAID');assert.ok(paid.paidAt);
 await s.request(route+'/mark-paid',{confirmed:true},admin);assert.equal(s.orders()[0].statusHistory.length,3);
 assert.equal((await status('CANCELLED')).status,409);assert.equal((await status('IN_PROGRESS')).status,200);assert.equal((await status('COMPLETED')).status,200);
 assert.equal((await status('PROFORMA_SENT')).status,409);assert.equal(s.orders()[0].statusHistory.length,5);assert.deepEqual(s.orders()[0].totals,original.totals);
 for(const proforma of [false,true]) {
  await s.request('/api/create-manual-order',payload());const id=s.orders()[0].orderId,r='/api/orders/'+id;
  if(proforma)await s.request(r+'/status',{status:'PROFORMA_SENT'},admin);
  assert.equal((await s.request(r+'/status',{status:'CANCELLED'},admin)).status,200);
  assert.equal((await s.request(r+'/mark-paid',{confirmed:true},admin)).status,409);
  assert.equal((await s.request(r+'/status',{status:'PROFORMA_SENT'},admin)).status,409);
 }
}));
test('recipient-specific notification retry preserves successful delivery and escapes HTML',()=>scenario({mailFailTo:'owner@example.invalid'},async s=>{
 const body=payload();body.customer.name='<img src=x onerror=alert(1)>';
 assert.equal((await s.request('/api/create-manual-order',body)).status,200);const o=s.orders()[0],r='/api/orders/'+o.orderId;
 assert.equal(o.notifications.customer.status,'SENT');assert.equal(o.notifications.owner.status,'FAILED');assert.equal(s.mails.length,1);
 assert.ok(s.mails[0].html.includes('&lt;img'));assert.ok(!s.mails[0].html.includes('<img'));
 await s.request(r+'/status',{status:'PROFORMA_SENT'},admin);await s.request(r+'/mark-paid',{confirmed:true},admin);
 s.options.mailFailTo=null;assert.equal((await s.request(r+'/retry-notifications',{},admin)).status,200);
 const latest=s.orders()[0];assert.equal(latest.paymentStatus,'PAID');assert.equal(latest.notifications.owner.status,'SENT');assert.equal(s.mails.length,2);assert.equal(s.mails[1].to,'owner@example.invalid');assert.match(s.mails[1].html,/Wpłata została potwierdzona/);
 await s.request(r+'/retry-notifications',{},admin);assert.equal(s.mails.length,2);
}));
test('legacy records remain byte-for-byte unchanged on reads and backup restore',()=>scenario({},async s=>{
 const file=path.join(s.dir,'data/orders.json');const legacy=[{orderId:'old',paymentMethod:'stripe',paymentStatus:'PAID',customer:{name:'synthetic'},totals:{total:123},extra:'preserve'}];
 const raw=JSON.stringify(legacy);fs.writeFileSync(file,raw);const backup=path.join(s.dir,'orders-backup.json');fs.copyFileSync(file,backup);
 assert.equal((await s.request('/api/orders',undefined,admin)).status,200);assert.equal(fs.readFileSync(file,'utf8'),raw);
 assert.equal((await s.request('/api/orders/old/status',{status:'COMPLETED'},admin)).status,409);assert.equal(fs.readFileSync(file,'utf8'),raw);
 fs.writeFileSync(file,'[]');fs.copyFileSync(backup,file);assert.deepEqual((await s.request('/api/orders',undefined,admin)).data.orders,legacy);
}));
test('parallel submissions and malformed carts cannot duplicate orders',()=>scenario({},async s=>{
 for(const cart of [null,{},'bad'])assert.equal((await s.request('/api/create-manual-order',payload({cart}))).status,400);
 const body=payload();const responses=await Promise.all([s.request('/api/create-manual-order',body),s.request('/api/create-manual-order',body)]);
 assert.ok(responses.every(r=>r.status===200));assert.equal(responses[0].data.orderId,responses[1].data.orderId);assert.equal(s.orders().length,1);assert.equal(s.mails.length,2);
}));
test('mail outage retains accepted order and cancellation prevents late receipt retry',()=>scenario({mailFail:true},async s=>{
 const body=payload();assert.equal((await s.request('/api/create-manual-order',body)).status,200);
 const o=s.orders()[0];assert.equal(o.notifications.customer.status,'FAILED');assert.equal(o.notifications.owner.status,'FAILED');
 const r='/api/orders/'+o.orderId;await s.request(r+'/status',{status:'CANCELLED'},admin);s.options.mailFail=false;
 assert.equal((await s.request(r+'/retry-notifications',{},admin)).status,409);
 assert.equal((await s.request('/api/create-manual-order',body)).status,200);assert.equal(s.mails.length,0);assert.equal(s.orders()[0].orderStatus,'CANCELLED');
}));
test('changed quote cannot silently replace the total accepted by the customer',()=>scenario({},async s=>{
 const body=payload();
 const cfg=s.store.read();cfg.products[0].price=110;s.store.save(cfg);
 const rejected=await s.request('/api/create-manual-order',body);
 assert.equal(rejected.status,409);assert.match(rejected.data.error,/Odśwież stronę i sprawdź kwotę/);
 assert.equal(s.orders().length,0);assert.equal(s.mails.length,0);
 const accepted={...body,expectedTotalCents:24000};assert.equal((await s.request('/api/create-manual-order',accepted)).status,200);
 assert.equal(s.orders()[0].totals.total,240);
 cfg.products[0].price=120;s.store.save(cfg);
 assert.equal((await s.request('/api/create-manual-order',accepted)).status,200);assert.equal(s.orders().length,1);assert.equal(s.orders()[0].totals.total,240);
 assert.equal((await s.request('/api/create-manual-order',{...accepted,expectedTotalCents:26000})).status,409);
 for(const expectedTotalCents of [undefined,null,'24000',24000.1,0,-1])assert.equal((await s.request('/api/create-manual-order',payload({expectedTotalCents}))).status,400);
}));
