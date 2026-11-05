const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const {start,token}=require(root+'/tests/harness.cjs');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out=root+'/.tmp/verification-20261105/extra';fs.mkdirSync(out,{recursive:true});
(async()=>{const s=await start({fullCatalog:true});const browser=await chromium.launch({channel:'chrome'});const ctx=await browser.newContext();const reports=[];try{
 await ctx.route('**/*',async route=>{const u=new URL(route.request().url());if(u.origin!==s.base)return route.abort();if(u.pathname.startsWith('/images/')){const f=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(f.startsWith(path.join(root,'images')+path.sep)&&fs.existsSync(f))return route.fulfill({path:f});}return route.continue();});
 const page=await ctx.newPage();await page.goto(s.base+'/index.html');await page.evaluate(()=>addSkuToCart('HDD-CH_32'));
 for(const url of ['/index.html','/pdp.html?sku=HDD-CH_32','/koszyk.html','/checkout.html','/admin.html']){
  await page.goto(s.base+url);await page.waitForTimeout(200);
  const axe=process.env.AXE_SCRIPT; if(!axe || !fs.existsSync(axe)) throw Error('Set AXE_SCRIPT to the locally installed axe.min.js');
  if(fs.existsSync(axe)){await page.addScriptTag({content:fs.readFileSync(axe,'utf8')});const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));reports.push({url,violations:result.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});}
  if(url==='/checkout.html'){
   await page.locator('#b2b-invoice-toggle').check();await page.locator('input[name="delivery-method"][value="inpost"]').check();await page.locator('#cust-nip').fill('123');await page.locator('#cust-nip').dispatchEvent('input');
   const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));reports.push({url:url+' B2B + parcel',violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  }
 }
 await page.locator('#admin-pin-input').fill(token);await page.locator('#admin-login-overlay button').click();await page.waitForFunction(()=>document.querySelector('#admin-login-overlay').classList.contains('hidden'));
 for(const tab of ['products','categories','coupons','settings','orders']){
  await page.locator('#tab-btn-'+tab).click();await page.waitForTimeout(120);const result=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));reports.push({url:'admin '+tab,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
 }
 await page.locator('#tab-btn-products').click();await page.locator('[onclick="editProduct(0)"]').click();const modalResult=await page.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}}));reports.push({url:'admin product modal',violations:modalResult.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});await page.keyboard.press('Escape');
 // Error response must not look like an empty orders database.
 await page.route('**/api/orders',r=>r.fulfill({status:500,contentType:'application/json',body:'{"error":"synthetic failure"}'}));await page.locator('#tab-btn-orders').click();await page.waitForTimeout(200);assert.match(await page.locator('#admin-orders-tbody').innerText(),/Nie udało/);await page.unroute('**/api/orders');
 await page.goto(s.base+'/checkout.html');await page.waitForFunction(()=>!document.getElementById('submit-order-btn').disabled);
 const cfg=s.store.read();cfg.products.find(p=>p.sku==='HDD-CH_32').price+=10;s.store.save(cfg);
 for(const [id,value] of Object.entries({'cust-firstname':'Synthetic','cust-lastname':'Test','cust-email':'test@example.invalid','cust-phone':'123456789','cust-address':'Test 1','cust-zip':'00-001','cust-city':'Test'}))await page.locator('#'+id).fill(value);
 await page.locator('#terms-accepted').check();let msg='';page.on('dialog',async d=>{msg=d.message();await d.dismiss();});await page.locator('#submit-order-btn').click();await page.waitForTimeout(500);assert.equal(s.orders().length,0);assert.match(msg,/kwot|cen/i);assert.equal(await page.locator('#submit-order-btn').isEnabled(),true);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'submit-order-btn');
 fs.writeFileSync(out+'/results.json',JSON.stringify({checks:['admin 500 visible','stale checkout rejects changed price','no order on changed price','submit restored after error'],axe:reports},null,2));console.log(JSON.stringify(reports.map(r=>({state:r.url,violations:r.violations.length}))));assert.equal(reports.reduce((n,r)=>n+r.violations.length,0),0,'Accessibility violations; inspect extra/results.json');
}finally{await browser.close();await s.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
