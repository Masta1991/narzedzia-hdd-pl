# Wytyczne Projektowe i Architektura — Narzędzia HDD PL (agents.md)

Ten plik zawiera kluczowe wytyczne projektowe, architekturę oraz instrukcję obsługi panelu zarządzania dla projektu **Narzędzia HDD PL**.

---

## 1. Architektura Projektu

- **Struktura**: Platforma e-commerce z produkcyjnym backendem Node.js / Express i warstwą klienta (HTML5, Vanilla JS, Tailwind CSS).
- **Baza Danych i Konfiguracja**:
  - `products.js`: Baza produktów osprzętu wiertniczego (`PRODUCTS`), z automatyczną obsługą nadpisywania z poziomu panelu CMS (`localStorage` / eksport / `/api/save`).
  - `shop-config.js`: Centralna konfiguracja kategorii (`CATEGORIES`, `CAT_DETAILS`), filtrów wielowymiarowych (`FILTER_OPTIONS`), kodów rabatowych (`PROMO_CODES`), paczkomatów, banków i danych firmy.
  - `data/orders.json`: Trwała baza zarejestrowanych zamówień i transakcji.
  - `.env`: Konfiguracja środowiskowa kluczy Stripe (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) i powiadomień e-mail.
- **Backend Transakcyjny (`server.js`)**:
  - `/api/create-checkout-session`: Weryfikacja cen po stronie serwera i generowanie sesji Stripe (BLIK, Karty, P24, Google/Apple Pay).
  - `/api/webhook`: Kryptograficzna weryfikacja potwierdzeń wpłat ze Stripe (`stripe-signature`).
  - `/api/create-manual-order`: Rejestracja zamówień tradycyjnym przelewem / proforma.
  - `/api/orders`: Endpoint odczytu historii zamówień dla panelu CMS.
  - `/api/save`: Autozapis produktów i konfiguracji z CMS.
- **Kluczowe Podstrony**:
  - `index.html`: Główny katalog z Live Instant Search, wielowymiarowymi filtrami (średnice, gwinty, typy), menu kategorii i siatką ofert.
  - `pdp.html`: Dynamiczna karta produktu zasilana z parametru URL `?sku=...`, tabelą kompatybilności maszyn (Vermeer, Ditch Witch, etc.), zestawem "Często kupowane razem" i stepperem ilości.
  - `koszyk.html`: Koszyk zakupowy z paskiem postępu darmowej dostawy (próg 500 PLN), modułem kuponów rabatowych, rekomendacjami cross-sell i rozbiciem Netto/Brutto (VAT 23%).
  - `checkout.html`: 4-etapowa finalizacja zamówienia z fakturowaniem B2B (walidacja sumy kontrolnej polskiego NIP), wyborem Paczkomatów InPost oraz bezpiecznym wywołaniem płatności Stripe / BLIK / Przelew.
  - `order-success.html`: Dedykowana strona potwierdzenia zamówienia i statusu płatności.
  - `admin.html`: Dedykowany, wizualny Panel Zarządzania (CMS) dla właściciela sklepu z modułem „Zamówienia i Płatności”.

---

## 2. Moduł Zarządzania (CMS) dla Klienta ([admin.html](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/admin.html))

Właściciel sklepu może w 100% zarządzać stroną bez znajomości kodu:
1. **Dostęp do Panelu**: Ustaw długi, losowy `ADMIN_SECRET` w lokalnym `.env`, uruchom
   `server.js`, a następnie wpisz ten token w `admin.html`. Brak sekretu wyłącza endpointy
   administratora; nie wolno dodawać wartości domyślnej do kodu klienta lub serwera.
2. **Zamówienia i Płatności**: Podgląd na żywo wszystkich wpływających zamówień, weryfikacja statusu wpłat Stripe/BLIK, danych NIP do faktur oraz kodów Paczkomatów.
3. **Zarządzanie Ofertami**: Dodawanie nowych produktów, edycja cen brutto/netto, typów gwintów, opisów, zdjęć i specyfikacji technicznych.
4. **Zarządzanie Zakładkami / Kategoriami**: Tworzenie nowych kategorii osprzętu, zmiana kolejności i opisów.
5. **Kody Rabatowe**: Konfiguracja promocji procentowych, kwotowych lub darmowej dostawy.
6. **Dane Firmowe**: Zmiana numeru rachunku bankowego IBAN, NIP-u, adresu czy progu darmowej dostawy.
7. **Zapis Zmian**:
   - **Autozapis lokalny**: Serwer `server.js` natychmiastowo nadpisuje pliki na dysku po kliknięciu "Zapisz".
   - **Eksport do plików**: Przycisk *"Zapisz / Pobierz pliki bazy"* generuje zaktualizowane pliki `products.js` i `shop-config.js`.

---

## 3. Ochrona przed Wdrożeniem (Pre-release password protection)

- `auth-gate.js` jest wyłącznie demonstracyjną bramką pre-release po stronie przeglądarki
  i nie stanowi zabezpieczenia. Przed publikacją należy go usunąć wraz z odwołaniami;
  właściwą ochronę panelu zapewnia serwerowy `ADMIN_SECRET`.
