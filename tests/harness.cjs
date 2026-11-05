const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {createRequire}=require('module');
const root=path.resolve(__dirname,'..'),req=createRequire(path.join(root,'package.json'));
const token='synthetic_admin_'+ 'A'.repeat(48);
const customer={name:'Synthetic Test',email:'test@example.invalid',phone:'123456789',street:'Test 1',postalCode:'00-001',city:'Test'};
const payload=(overrides={})=>({requestId:crypto.randomUUID(),termsAccepted:true,expectedTotalCents:22000,cart:[{sku:'TEST-100',quantity:2,price:0.01}],customer:{...customer},delivery:{method:'dpd'},...overrides});
async function start(options={}) {
 const dir=path.join(root,'.tmp','verification-20261105',crypto.randomUUID());fs.mkdirSync(dir,{recursive:true});
 for(const name of ['index.html','pdp.html','koszyk.html','checkout.html','order-success.html','admin.html','cart.js','shop-config.js','ui-safety.js'])fs.copyFileSync(path.join(root,name),path.join(dir,name));
 fs.mkdirSync(path.join(dir,'data'));fs.mkdirSync(path.join(dir,'assets'));fs.copyFileSync(path.join(root,'assets/tailwind-runtime.js'),path.join(dir,'assets/tailwind-runtime.js'));
 const store=req('./catalog-store').catalogStore(dir);
 fs.copyFileSync(path.join(root,'products.js'),path.join(dir,'products.js'));
 const catalog=store.read();
 if(!options.fullCatalog) catalog.products=[{sku:'TEST-100',name:'Test 100',price:100,image:'images/hdd-ch_32.jpg',categories:['chwytaki'],stock:'W magazynie'}, {sku:'TEST-OOS',name:'Unavailable',price:150,image:'images/hdd-ch_32.jpg',categories:['chwytaki'],stock:'Brak w magazynie'}];
 const number='000000000000000000000000';const checksum=(98n-BigInt(number+'252100')%97n).toString().padStart(2,'0');
 if(!options.unconfigured)catalog.shopConfig.SHOP_CONFIG.company={name:'SYNTHETIC TEST ONLY',address:'Test 1',nip:'1234563218',accountIban:'PL'+checksum+number,bankName:'Synthetic bank',swift:'',email:'shop@example.invalid',phone:'123456789'};
 if(options.noBank)catalog.shopConfig.SHOP_CONFIG.company.accountIban='';
 store.save(catalog);
 fs.writeFileSync(path.join(dir,'data/orders.json'),'[]');fs.writeFileSync(path.join(dir,'.env'),'SYNTHETIC_FIXTURE=true');
 let server;const calls=[],mails=[];
 const realExpress=req('express');function express(){const app=realExpress(),listen=app.listen.bind(app);app.listen=(...args)=>{server=listen(0,'127.0.0.1',args.at(-1));return server;};return app;}Object.assign(express,realExpress);
 const env={PORT:'0',BASE_URL:'http://127.0.0.1',ADMIN_SECRET:options.noAdmin?'':token,SMTP_HOST:'synthetic',SMTP_USER:'synthetic',SMTP_PASS:'synthetic',SHOP_OWNER_EMAIL:'owner@example.invalid',SHOP_ENABLED:options.unconfigured?'false':'true',TERMS_URL:'https://example.invalid/terms',PRIVACY_URL:'https://example.invalid/privacy'};
 const context={require:name=>name==='dotenv'?{config:()=>({})}:name==='express'?express:name==='nodemailer'?{createTransport:()=>({sendMail:async mail=>{if(options.mailFail || options.mailFailTo===mail.to)throw Error('synthetic mail failure');mails.push(mail);}})}:req(name),__dirname:dir,process:{env},console:{log(){},warn(){},error(){}},Buffer,URL,setTimeout,clearTimeout};
 vm.runInNewContext(fs.readFileSync(path.join(root,'server.js'),'utf8'),context,{filename:'server.js'});
 if(!server.listening)await new Promise(resolve=>server.once('listening',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 async function request(route,body,headers={}){const response=await fetch(base+route,{method:body===undefined?'GET':'POST',headers:{'content-type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});const raw=await response.text();let data;try{data=JSON.parse(raw)}catch{data=raw}return {status:response.status,data,headers:response.headers};}
 const orders=()=>JSON.parse(fs.readFileSync(path.join(dir,'data/orders.json'),'utf8'));
 return {dir,base,store,options,env,calls,mails,request,orders,close:()=>new Promise(resolve=>{server.closeAllConnections();server.close(resolve);})};
}
module.exports={start,payload,token,root};
