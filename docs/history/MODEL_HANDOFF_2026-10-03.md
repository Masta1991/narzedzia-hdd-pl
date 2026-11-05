# Stan po naprawach — 2026-10-03

- Projekt: Narzedzia HDD PL, C:/Projects/Websites/Narzedzia HDD PL.
- Użytkownik zatwierdził niezbędne poprawki po audycie i polecił dokończenie.
- Brak danych firmy, kluczy Stripe i SMTP: przygotować kod oraz listę konfiguracji.
- Zmiany wykonano lokalnie. Brak publikacji, realnych płatności i wysyłki wiadomości.
- Nie zmieniono prywatnego .env ani data/orders.json (daty modyfikacji: 2026-08-13).
- Zachowano niezwiązane wcześniejsze zmiany; nie synchronizowano LLM-WIKI.
- Checkpoint źródeł przed dokończeniem: C:/Projects/Backups/narzedzia-hdd-pl/fixes-20261003.
- Poprzedni handoff: MODEL_HANDOFF_AUDYT_20261002.md; pełny raport historyczny: AUDYT_2026-10-02.html.

## Wynik implementacji

- Serwer udostępnia tylko jawne pliki publiczne; blokuje bazę, sekrety i źródła.
- Stary serwer Python wyłączony; bramka auth-gate usunięta z widoków i udostępniania.
- Panel wymaga serwerowego ADMIN_SECRET, co najmniej 32 znaki, bez domyślnej wartości.
- Zamówienia walidują klienta, ilości, SKU, dostępność, dostawę, NIP i warunki kuponów.
- Kwoty liczone w groszach ze wspólnego katalogu; rabaty uwzględniane w Stripe.
- Podpis webhooka obowiązkowy; sesja, waluta, kwota i status porównywane z zamówieniem.
- Obsługiwane płatności asynchroniczne, odmowa, wygaśnięcie i ponowienia.
- Idempotencja formularza i żądań Stripe; brak tworzenia drugiego zakupu przy zwykłym retry.
- Losowe identyfikatory i token statusu; brak publicznych danych osobowych z numeru zamówienia.
- Błąd zapisu nie daje sukcesu; uszkodzone zamówienia nie są zerowane.
- CMS zapisuje produkty i ustawienia atomowo w data/catalog.json, bez localStorage override.
- HTML klienta/oferty escapowany; katalog walidowany, JSON odczytywany bez eval/VM.
- SMTP używa danych konfiguracji, poprawnych pól klienta i danych bankowych z zamówienia.
- Status PAID zachowany po błędzie maila; webhook można ponowić dla powiadomienia.
- Formularz przekazuje właściwe pola; brak lokalnych pól karty/BLIK; wymagane warunki sprzedaży.
- Mobilna ilość zsynchronizowana; status strony z serwera; ponowny link nie czyści nowego koszyka.
- Panel pokazuje błędy zapisu i pozwala potwierdzić ręczny przelew po sprawdzeniu rachunku.
- Fokus izolowany w oknach; usunięto overflow 320 px; lokalny Tailwind i ograniczająca CSP.
- Sprzedaż domyślnie wyłączona przez SHOP_ENABLED; brak danych/config blokuje API.

## Weryfikacja

- npm test: 9/9 grup PASS, obejmujących manipulacje, autoryzację, replay, SMTP i błędy dysku.
- tests/browser.cjs: 43/43 sprawdzenia PASS, Chrome 154.0.8037.95, Node v24.15.0.
- Widoki katalog/produkt/koszyk/checkout: 1440, 1366, 1024, 768, 390, 320 px.
- Sprawdzono też 200% tekstu, reduced motion, fokus panelu/edycji, Escape i powrót fokusu.
- Brak zarejestrowanych błędów JavaScript/CSP; składnia skryptów inline i git diff --check OK.
- Wyniki oraz 24 zrzuty: .tmp/verification-20261003/browser/results.json i sąsiednie PNG.
- Przejrzano montaże wszystkich sześciu rozmiarów; nie jest to pełny audyt WCAG/axe.
- Testy odizolowane: syntetyczna baza, atrapy Checkout/SMTP, prawdziwa weryfikacja podpisu SDK.
- Brak potwierdzenia sandboxu operatora, SMTP dostawcy, hostingu/TLS, CVE i zgodności prawnej.
- Baza JSON wymaga jednego procesu; CSP nadal dopuszcza inline; SMTP nie daje exactly-once.

## Jeden następny krok

Po uzyskaniu danych właściciela przejść docs/KONFIGURACJA_I_ODBIOR.md, uzupełnić
konfigurację i wykonać odbiór Stripe w sandboxie oraz SMTP przed włączeniem sprzedaży.
