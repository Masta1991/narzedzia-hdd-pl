# Architektura sklepu Narzędzia HDD PL

## Sprzedaż i dane

Node.js/Express, HTML i JavaScript, lokalne style Tailwind. Jeden proces i trwały dysk.
Katalog startowy: products.js i shop-config.js. Po pierwszym zapisie CMS nadrzędny jest data/catalog.json.
Zamówienia zapisują się atomowo w prywatnym data/orders.json. Ceny, rabaty i dostawa są liczone przez serwer i utrwalane w zamówieniu.

Klienci firmowi i prywatni składają zamówienia z ostateczną kwotą. Sprzedawca sprawdza realizację, wystawia i wysyła pro formę poza sklepem. Dopiero pro forma zawiera dane do zapłaty. Brak integracji płatności online.

## API i proces

- POST /api/create-manual-order: walidacja, expectedTotalCents porównywane z wyceną serwera (409 przy zmianie), requestId chroniący przed powtórzeniem, trwały zapis i potwierdzenia. Nowe rekordy: paymentMethod=proforma, orderStatus=NEW, paymentStatus=UNPAID.
- GET /api/payment-options: proforma wskazuje gotowość przyjmowania zamówień. online i transfer zawsze false.
- GET /api/order-status: minimalny status za losowym tokenem; nowe rekordy nie ujawniają banku ani danych osobowych klienta.
- GET /api/orders: chroniony odczyt dla właściciela.
- POST /api/orders/:id/status: NEW → PROFORMA_SENT → IN_PROGRESS → COMPLETED; IN_PROGRESS wymaga PAID. CANCELLED tylko dla nieopłaconego NEW/PROFORMA_SENT.
- POST /api/orders/:id/mark-paid: osobne potwierdzenie confirmed=true po sprawdzeniu rachunku. W nowym procesie wymaga PROFORMA_SENT. Ustawia PAID bez zmiany etapu realizacji.
- POST /api/orders/:id/retry-notifications: ponawia brakujące potwierdzenia oddzielnie dla klienta i właściciela. Nie wysyła pro form.
- POST /api/save: chroniony, atomowy zapis katalogu i ustawień.
- Dawne /api/create-checkout-session i /api/webhook są nieaktywne (404).

statusHistory przechowuje czas, zdarzenie, etap, status wpłaty i rolę wykonawcy. Historyczne rekordy nie są migrowane. Dawny przelew można ręcznie oznaczyć jako opłacony; pozostałe dawne przepływy wymagają indywidualnego uzgodnienia.

## Panel i bezpieczeństwo

Panel /admin.html otwierany z zakładki, bez linków w sklepie. Wymaga serwerowo weryfikowanego ADMIN_SECRET (minimum 32 znaki), bez wartości domyślnej. Meta robots i X-Robots-Tag wykluczają indeksowanie; nie zastępują uwierzytelnienia.
Sekret jest przechowywany w sessionStorage do wylogowania/zamknięcia karty. Nie dodano kont użytkowników ani sesji serwerowych.

## Ograniczenia

Brak liczbowego magazynu, rezerwacji, automatycznych zwrotów, generatora faktur i integracji dostawy. SMTP nie gwarantuje dostarczenia do skrzynki ani dokładnie jednej wysyłki przy awarii procesu między wysłaniem i zapisem wyniku. Szczegóły uruchomienia: KONFIGURACJA_I_ODBIOR.md. Bieżące dowody: MODEL_HANDOFF.md.
