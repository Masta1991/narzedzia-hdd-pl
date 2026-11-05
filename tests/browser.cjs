const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const {start,payload,token,root}=require('./harness.cjs');
const playwrightPath=process.env.PLAYWRIGHT_MODULE || 'playwright';
const {chromium}=require(playwrightPath);
const out=path.join(root,'.tmp','verification-20261105','browser');fs.mkdirSync(out,{recursive:true});
const checks=[],errors=[],screens=[];
const record=(name,pass,actual)=>{checks.push({name,status:pass?'PASS':'FAIL',actual});console.log(name+': '+(pass?'PASS':'FAIL'));};
(async()=>{
 const s=await start({fullCatalog:true});let browser;
 try {
  browser=await chromium.launch({executablePath:process.env.BROWSER_EXE,channel:process.env.BROWSER_EXE?undefined:'chrome',headless:true});
  const ctx=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  await ctx.route('**/*',async route=>{
   const url=new URL(route.request().url());
   if(url.origin!==s.base)return route.abort();
   if(url.pathname.startsWith('/images/')) {const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file.startsWith(path.join(root,'images')+path.sep)&&fs.existsSync(file))return route.fulfill({path:file});}
   return route.continue();
  });
  const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&& !m.text().includes('ERR_FAILED')&&!m.text().includes('status of 404')&&!m.text().includes('status of 500'))errors.push(m.text());});
  const dialogs=[];page.on('dialog',async dialog=>{dialogs.push(dialog.message());await dialog.dismiss();});
  await page.goto(s.base+'/index.html');await page.waitForFunction(()=>document.querySelectorAll('#products-grid > div').length===37);
  record('Public admin link removed',await page.locator('a[href="admin.html"]').count()===0);
  record('Catalog 37 products',await page.locator('#products-grid > div').count()===37);
  await page.locator('#live-search-input').fill('<img src=x onerror="window.xss=1">');await page.waitForTimeout(350);
  record('Search text cannot execute HTML',await page.evaluate(()=>!window.xss&&!document.querySelector('#active-filter-chips img')));
  await page.locator('#live-search-input').fill('HDD-CH_32');await page.waitForFunction(()=>document.querySelectorAll('#products-grid > div').length===1);
  await page.locator('#products-grid button[title="Dodaj do koszyka"]').click();await page.reload();
  record('Cart persists reload',await page.evaluate(()=>getCart()[0]?.quantity===1));
  await page.setViewportSize({width:390,height:844});await page.goto(s.base+'/pdp.html?sku=HDD-CH_32');await page.locator('#qty-input-mobile').fill('5');await page.evaluate(()=>handleAddToCart());
  record('Mobile quantity synchronized',await page.evaluate(()=>getCart()[0].quantity===6));
  await page.evaluate(()=>updateQuantity('HDD-CH_32',1));await page.goto(s.base+'/koszyk.html');
  record('Coupon minimum enforced',await page.evaluate(()=>!applyCoupon('WIERCENIE50').success));
  await page.goto(s.base+'/checkout.html');await page.locator('#submit-order-btn').waitFor();await page.waitForFunction(()=>!document.getElementById('submit-order-btn').disabled);
  await page.route('**/api/create-manual-order',async route=>{const response=await route.fetch();const data=await response.json();if(data.redirectUrl){const url=new URL(data.redirectUrl);data.redirectUrl=s.base+url.pathname+url.search;}await route.fulfill({response,json:data});});
  for(const [id,value] of Object.entries({'cust-firstname':'Synthetic','cust-lastname':'Test','cust-email':'test@example.invalid','cust-phone':'123456789','cust-address':'Test 1','cust-zip':'00-001','cust-city':'Test'}))await page.locator('#'+id).fill(value);
  await page.locator('#terms-accepted').check();
  const checkoutTotal=await page.evaluate(()=>Math.round(calculateCartTotals(currentDeliveryCost).total*100));
  const submitted=page.waitForRequest(r=>r.url().endsWith('/api/create-manual-order')&&r.method()==='POST');await page.locator('#submit-order-btn').click();const data=(await submitted).postDataJSON();await page.waitForURL('**/order-success.html?*');await page.waitForFunction(()=>document.getElementById('payment-status-badge').textContent.includes('Nowe'));
  record('Displayed total equals saved total',Math.round(s.orders()[0].totals.total*100)===checkoutTotal && Number(s.orders()[0].totals.total)===Number((await page.locator('#order-total').innerText()).replace(/[^0-9,]/g,'').replace(',','.')));
  record('Checkout sends entered customer fields',data.customer.name==='Synthetic Test'&&data.customer.street==='Test 1'&&data.customer.postalCode==='00-001');
  record('Proforma order not marked paid',!(await page.locator('#payment-status-badge').innerText()).includes('OPŁACONE'));
  record('Manual order clears cart',await page.evaluate(()=>getCart().length===0));
  await page.goto(s.base+'/order-success.html');record('Missing link does not claim success',!(await page.locator('#payment-status-badge').innerText()).includes('OPŁACONE'));
  await page.goto(s.base+'/index.html');await page.evaluate(()=>addSkuToCart('HDD-CH_32'));
  const expectedTotalCents=await page.evaluate(()=>Math.round(calculateCartTotals(20).total*100));const b=payload({cart:[{sku:'HDD-CH_32',quantity:1}],expectedTotalCents});const r=await s.request('/api/create-manual-order',b);const order=s.orders().find(x=>x.orderId===r.data.orderId);
  const statusUrl=s.base+'/order-success.html?order_id='+order.orderId+'&access_token='+order.accessToken;
  await page.goto(statusUrl);await page.waitForFunction(()=>document.getElementById('payment-status-badge').textContent.includes('Nowe'));
  record('Proforma instructions and no bank', (await page.locator('main').innerText()).includes('Poczekaj na pro formę') && await page.locator('#transfer-iban').count()===0);
  const headers={'x-admin-token':token};
  await s.request('/api/orders/'+order.orderId+'/status',{status:'PROFORMA_SENT'},headers);
  await s.request('/api/orders/'+order.orderId+'/mark-paid',{confirmed:true},headers);
  await page.getByRole('button',{name:'Odśwież status zamówienia'}).click();await page.waitForFunction(()=>document.getElementById('payment-status-badge').textContent.includes('OPŁACONE'));
  record('Revisiting paid link preserves new cart',await page.evaluate(()=>getCart().length===1));
  await page.setViewportSize({width:1440,height:900});await page.goto(s.base+'/admin.html');await page.locator('#admin-pin-input').focus();
  const focus=[];for(let i=0;i<6;i++){await page.keyboard.press('Tab');focus.push(await page.evaluate(()=>!!document.activeElement.closest('#admin-login-overlay')));}record('Admin login traps keyboard focus',focus.every(Boolean),focus);
  await page.locator('#admin-pin-input').fill(token);await page.locator('#admin-login-overlay button').click();await page.waitForFunction(()=>document.getElementById('admin-login-overlay').classList.contains('hidden'));
  await page.locator('#tab-btn-orders').click();await page.waitForFunction(()=>adminOrders.length>0);
  record('Admin shows workflow controls',await page.getByRole('button',{name:'Rozpocznij realizację'}).count()===1);
  // Confirm real UI actions, including the separate bank-payment confirmation.
  page.removeAllListeners('dialog');page.on('dialog',async d=>{dialogs.push(d.message());await d.accept();});
  await page.getByRole('button',{name:'Rozpocznij realizację'}).click();await page.getByRole('button',{name:'Oznacz jako zrealizowane'}).waitFor();
  await page.getByRole('button',{name:'Oznacz jako zrealizowane'}).click();await page.waitForFunction(()=>adminOrders.some(o=>o.orderStatus==='COMPLETED'));
  const row=page.locator('#admin-orders-tbody tr').filter({has:page.getByRole('button',{name:'Pro forma wysłana',exact:true})}).first();
  await row.getByRole('button',{name:'Pro forma wysłana',exact:true}).click();await page.getByRole('button',{name:'Potwierdź otrzymaną wpłatę'}).first().waitFor();
  await page.getByRole('button',{name:'Potwierdź otrzymaną wpłatę'}).first().click();await page.waitForFunction(()=>adminOrders.every(o=>o.paymentStatus==='PAID'));
  record('Admin paid confirmation is explicit',dialogs.some(t=>t.includes('rachunku bankowym')));
  await page.locator('#tab-btn-products').click();
  await page.locator('[onclick="editProduct(0)"]').click();
  const modalFocus=[];for(let i=0;i<30;i++){await page.keyboard.press('Tab');modalFocus.push(await page.evaluate(()=>!!document.activeElement.closest('#product-modal')));}
  record('Product editor keeps focus inside',modalFocus.every(Boolean));await page.keyboard.press('Escape');await page.waitForFunction(()=>document.getElementById('product-modal').classList.contains('hidden'));
  record('Product editor restores trigger focus',await page.evaluate(()=>document.activeElement.getAttribute('onclick')==='editProduct(0)'));
  await page.evaluate(()=>renderAdminOrdersTable([{orderId:'TEST',customer:{name:'<img src=x onerror="window.xss=1">'},items:[],totals:{total:1}}]));record('Admin customer escaping',await page.locator('#admin-orders-tbody img').count()===0);
  await page.route('**/api/save',route=>route.fulfill({status:500,contentType:'application/json',body:'{"error":"synthetic disk failure"}'}));await page.locator('#tab-btn-settings').click();await page.locator('#set-free-shipping').fill('900');const response=page.waitForResponse(r=>r.url().endsWith('/api/save'));await page.locator('#tab-content-settings button[type="submit"]').click();await response;await page.waitForTimeout(250);record('CMS reports failed write',dialogs.some(t=>t.includes('nie zostały zapisane'))&&!dialogs.some(t=>t.includes('pomyślnie')));await page.unroute('**/api/save');
  for(const width of [1440,1366,1024,768,390,320]) {
   await page.setViewportSize({width,height:width>768?900:844});
   for(const [name,url] of [['catalog','/index.html'],['product','/pdp.html?sku=HDD-CH_32'],['cart','/koszyk.html'],['checkout','/checkout.html'],['confirmation',new URL(statusUrl).pathname+new URL(statusUrl).search],['admin','/admin.html']]) {
    await page.goto(s.base+url);if(name==='admin'){await page.locator('#tab-btn-orders').click();await page.waitForFunction(()=>adminOrders.length>0);}await page.waitForTimeout(150);
    const metrics=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length}));
    const file=name+'-'+width+'.png';await page.screenshot({path:path.join(out,file),fullPage:true});screens.push({file,...metrics});record('Reflow '+name+' '+width,metrics.scrollWidth<=width+1&&metrics.broken===0,metrics);
   }
  }
  await page.setViewportSize({width:720,height:900});await page.goto(s.base+'/checkout.html');await page.evaluate(()=>document.documentElement.style.fontSize='200%');const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);record('Checkout 200 percent text reflow',!overflow);
  record('No JavaScript or CSP errors',errors.length===0,errors);
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({date:'2026-11-05',browser:await browser.version(),checks,screens,errors,fonts:'External fonts blocked; system fallback',externalServices:'Blocked, synthetic SMTP'},null,2));
  assert.equal(checks.filter(c=>c.status==='FAIL').length,0,'Browser failures; see results.json');
 } finally {if(browser)await browser.close();await s.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
