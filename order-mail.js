const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
async function sendOrderEmails(order,transport,shop,env,onResult) {
    const rows=order.items.map(item=>`<li>${escapeHtml(item.name)} (${escapeHtml(item.sku)}) — ${item.quantity} × ${item.price.toFixed(2)} zł</li>`).join('');
    const instruction=order.paymentStatus==='PAID'?'Wpłata została potwierdzona.':order.orderStatus==='PROFORMA_SENT'?'Pro forma została wysłana osobno przez sprzedawcę. Dane do przelewu znajdziesz w pro formie.':'Otrzymaliśmy zamówienie. Poczekaj na pro formę przed wykonaniem przelewu.';
    const company=order.customer.isB2B?`<p>Firma: ${escapeHtml(order.customer.companyName)}, NIP: ${escapeHtml(order.customer.nip)}</p>`:'';
    const html=`<h1>Zamówienie ${escapeHtml(order.orderNumber)}</h1><p>${instruction}</p><p>Klient: ${escapeHtml(order.customer.name)} (${escapeHtml(order.customer.email)})</p>${company}<p>Telefon: ${escapeHtml(order.customer.phone)}</p><p>Adres: ${escapeHtml([order.customer.street,order.customer.postalCode,order.customer.city].filter(Boolean).join(', '))}</p><p>Dostawa: ${escapeHtml(order.delivery.methodName || order.delivery.method)} ${escapeHtml(order.delivery.inpostCode || '')}</p><ul>${rows}</ul><p>Produkty: ${order.totals.subtotal.toFixed(2)} zł<br>Rabat: ${order.totals.discount.toFixed(2)} zł<br>Dostawa: ${order.totals.shipping.toFixed(2)} zł<br>Razem brutto: ${order.totals.total.toFixed(2)} zł</p><p>Kwota zamówienia jest ostateczna. Pro forma będzie wystawiona i wysłana osobno przez sprzedawcę.</p>`;
    const from=env.EMAIL_FROM || shop.company?.email;
    for(const [recipient,to] of [['customer',order.customer.email],['owner',env.SHOP_OWNER_EMAIL]]) {
        if(order.notifications?.[recipient]?.status==='SENT')continue;
        const at=new Date().toISOString();
        let result;
        try {
            if(!transport || !to)throw Error('Mail not configured');
            await transport.sendMail({from,to,subject:`Zamówienie ${order.orderNumber} — Narzędzia HDD PL`,html,messageId:`<${order.orderId}.receipt.${recipient}@narzedzia-hdd.local>`});
            result={status:'SENT',sentAt:at,lastAttemptAt:at};
        }catch(_){result={status:'FAILED',lastAttemptAt:at};console.error('Nie udało się wysłać powiadomienia zamówienia.');}
        // Persist each recipient separately; never interpret a disk failure as an SMTP failure.
        await onResult(recipient,result);
    }
}
module.exports={sendOrderEmails};
