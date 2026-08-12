# Wytyczne Projektowe i Architektura — Narzędzia HDD PL (agents.md)

Ten plik zawiera kluczowe wytyczne projektowe, architekturę oraz instrukcję obsługi panelu zarządzania dla projektu **Narzędzia HDD PL**.

---

## 1. Architektura Projektu

- **Struktura**: Statyczna platforma e-commerce o wysokiej wydajności (HTML5, Vanilla JS, Tailwind CSS).
- **Baza Danych i Konfiguracja**:
  - `products.js`: Baza produktów osprzętu wiertniczego (`PRODUCTS`), z automatyczną obsługą nadpisywania z poziomu panelu CMS (`localStorage` / eksport).
  - `shop-config.js`: Centralna konfiguracja kategorii (`CATEGORIES`, `CAT_DETAILS`), filtrów wielowymiarowych (`FILTER_OPTIONS`), kodów rabatowych (`PROMO_CODES`), paczkomatów, banków i danych firmy.
- **Kluczowe Podstrony**:
  - `index.html`: Główny katalog z Live Instant Search, wielowymiarowymi filtrami (średnice, gwinty, typy), menu kategorii i siatką ofert.
  - `pdp.html`: Dynamiczna karta produktu zasilana z parametru URL `?sku=...`, tabelą kompatybilności maszyn (Vermeer, Ditch Witch, etc.), zestawem "Często kupowane razem" i stepperem ilości.
  - `koszyk.html`: Koszyk zakupowy z paskiem postępu darmowej dostawy (próg 500 PLN), modułem kuponów rabatowych, rekomendacjami cross-sell i rozbiciem Netto/Brutto (VAT 23%).
  - `checkout.html`: 4-etapowa finalizacja zamówienia z fakturowaniem B2B (walidacja sumy kontrolnej polskiego NIP), wyborem Paczkomatów InPost oraz interaktywnymi bramkami płatności (BLIK z timerem 120s, Karta z walidacją Luhna, PayU, Przelew tradycyjny/Proforma).
  - `admin.html`: Dedykowany, wizualny Panel Zarządzania (CMS) dla właściciela sklepu.

---

## 2. Moduł Zarządzania (CMS) dla Klienta ([admin.html](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/admin.html))

Właściciel sklepu może w 100% zarządzać stroną bez znajomości kodu:
1. **Dostęp do Panelu**: Otwórz `admin.html` w przeglądarce i wpisz kod PIN (domyślnie: **`admin2026`**).
2. **Zarządzanie Ofertami**: Dodawanie nowych produktów, edycja cen brutto/netto, typów gwintów, opisów, zdjęć i specyfikacji technicznych.
3. **Zarządzanie Zakładkami / Kategoriami**: Tworzenie nowych kategorii osprzętu, zmiana kolejności i opisów.
4. **Kody Rabatowe**: Konfiguracja promocji procentowych, kwotowych lub darmowej dostawy.
5. **Dane Firmowe**: Zmiana numeru rachunku bankowego IBAN, NIP-u, adresu czy progu darmowej dostawy.
6. **Zapis Zmian**:
   - **Na żywo w przeglądarce**: Zmiany zapisują się natychmiastowo w `localStorage` i od razu są widoczne w sklepie.
   - **Eksport do plików**: Przycisk *"Zapisz / Pobierz pliki bazy"* generuje zaktualizowane pliki `products.js` i `shop-config.js`.
   - **Autozapis lokalny**: Skrypt `admin-server.py` automatycznie nadpisuje pliki na dysku po kliknięciu "Zapisz".

---

## 3. Ochrona przed Wdrożeniem (Pre-release password protection)

- Strona posiada opcjonalną blokadę wejścia zaimplementowaną w pliku `auth-gate.js` (Hasło dostępu: **`hdd2026`**).
- Przed oficjalnym przekazaniem sklepu klientowi lub publikacją produkcyjną wystarczy usunąć plik `auth-gate.js` i odwołania `<script src="auth-gate.js"></script>`.
