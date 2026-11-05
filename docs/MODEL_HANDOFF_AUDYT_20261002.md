# Stan po audycie — 2026-10-02

- Projekt: Narzedzia HDD PL, `C:/Projects/Websites/Narzedzia HDD PL`.
- Zadanie: lokalna analiza działania i bezpieczeństwa sklepu dla kolegi użytkownika.
- Wynik: nie rekomendować realnej sprzedaży przed naprawami.
- Zakres obejmował audyt, nie implementację zmian produktu ani publikację.
- Kod aplikacji, oferta, prawdziwy `.env` i baza zamówień pozostały bez zmian.
- Zachowano wcześniejsze zmiany użytkownika w instrukcji, agents.md i dokumentacji.

## Kanoniczny wynik

- Raport: `docs/AUDYT_2026-10-02.html`.
- Szczegółowe wyniki: `docs/audit-20261002/backend-results.json` i `browser-results.json`.
- Reprodukcja i zrzuty: `.tmp/audit-20261002/` (lokalne, ignorowane przez Git).
- Node v24.15.0; Chrome 154.0.8037.95.
- 37 sprawdzeń serwera/katalogu: 11 PASS, 26 FAIL.
- 28 sprawdzeń przeglądarki: 19 PASS, 9 FAIL.
- Liczby oznaczają przypadki testowe, nie liczbę niezależnych luk ani ocenę punktową.

## Blokery sprzedaży

1. Publiczny `/data/orders.json` przez `express.static(__dirname)`.
2. Webhook akceptuje niepodpisany JSON przy braku konfiguracji podpisu.
3. Checkout wysyła puste imię/nazwisko, ulicę i kod pocztowy przez błędne ID pól.
4. Rabaty w przeglądarce, backendzie i żądaniu do Stripe dają różne kwoty.
5. Webhook ignoruje payment_status, powtarza e-maile i traci część danych zamówienia.
6. Ekran końcowy pokazuje OPŁACONE dla PENDING_PAYMENT i nieznanego zamówienia.
7. Błąd zapisu bazy daje success:true; uszkodzony JSON jest nadpisywany jak pusta baza.
8. Lokalnie brak ADMIN_SECRET i SMTP; przykładowa konfiguracja Stripe.
9. Publiczny IBAN z konfiguracji ma niepoprawną sumę kontrolną; dane bankowe są powielone w kodzie.

## Dodatkowe wyniki

- Cena towaru sprawdzana na serwerze; nieznane SKU odrzucane.
- API admina Node sprawdza token; brak sekretu daje 503.
- Podpis webhooka działa przy kompletnej konfiguracji.
- Panel escapuje testowane dane klienta, e-mail HTML ich nie escapuje.
- Mobilna wpisana ilość ignorowana; koszyk po płatności elektronicznej nieczyszczony.
- Panel zgłasza udany zapis mimo HTTP 500.
- Katalog 37 produktów, wyszukiwanie i podstawowy koszyk działają.
- Katalog przy 320 px ma 327 px szerokości; Tab wychodzi poza bramkę pre-release.

## Granice

- Testy wykonywano na syntetycznych danych w lokalnym odizolowanym środowisku.
- Stripe Checkout i SMTP były atrapami; weryfikacja podpisu używała SDK Stripe.
- Nie wykonano rzeczywistych płatności, wysyłki wiadomości ani publikacji.
- Nie badano publicznego wdrożenia, realnej bazy, TLS, kopii, CVE ani zgodności prawnej.
- Przegląd widoków: 1440/390/320 px, zablokowane fonty zewnętrzne; to nie pełne QA wydania.
- LLM-WIKI nie aktualizowano.

## Jeden następny krok

Po zleceniu napraw przez użytkownika przygotować checkpoint i usunąć blokery
bezpieczeństwa danych oraz integralności zamówień wskazane w raporcie, z testami regresji.
