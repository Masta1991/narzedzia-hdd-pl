# Narzedzia HDD PL — jak korzystać

Sklep z osprzętem do przewiertów HDD: oferta, koszyk, finalizacja zakupu oraz panel zarządzania. Pełna instrukcja właściciela: [INSTRUKCJA_OBSLUGI.md](INSTRUKCJA_OBSLUGI.md).

## Start i obsługa

1. Otwórz ten folder w aplikacji agenta i poproś: „Sprawdź lokalną konfigurację i uruchom podgląd Narzedzia HDD PL”. Projekt używa Node.js; manifest przewiduje `npm start` i `npm run dev`.
2. Agent powinien ustalić lokalny adres z konfiguracji serwera. Sekrety pozostają w `.env`; wzór pól jest w `.env.example`.
3. Ofertę i zamówienia obsługuje `admin.html`. Wchodź przez adres /admin.html zapisany w zakładkach; publiczny sklep nie pokazuje linku. Panel wymaga prawidłowo skonfigurowanego `ADMIN_SECRET`. Operacja zapisu w CMS może nadpisywać dane na dysku.

## Polecenia do agenta

- „W Narzedzia HDD PL zmień opis produktu [SKU], pokaż różnicę przed zapisem”.
- „Sprawdź koszyk na telefonie i działanie panelu na danych testowych”.
- „Przygotuj lokalny raport gotowości do wydania z wynikiem testów zamówień i wpłat”.

Mapa agenta: [CONTEXT_MAP.md](CONTEXT_MAP.md). Architektura i wymagania: [docs/ARCHITEKTURA_I_CMS.md](docs/ARCHITEKTURA_I_CMS.md).

Publikacja i rzeczywiste transakcje wymagają jawnego polecenia. Proces od 2026-11-05: zamówienie → pro forma wystawiana i wysyłana poza sklepem → ręczne potwierdzenie wpłaty → realizacja. Nie ma płatności online. Przed włączeniem zamówień wymagane są dane właściciela i odbiór poczty oraz hostingu. Lista konfiguracji: [docs/KONFIGURACJA_I_ODBIOR.md](docs/KONFIGURACJA_I_ODBIOR.md). Bieżący wynik testów: [docs/MODEL_HANDOFF.md](docs/MODEL_HANDOFF.md).

## Struktura

```text
Narzedzia HDD PL/ — projekt sklepu
├── server.js — serwer, autoryzacja, dostęp do plików i zapis zamówień
├── order-core.js — walidacja oraz obliczenia cen i rabatów
├── order-routes.js — zamówienia, statusy realizacji i ręczne wpłaty
├── order-mail.js — wiadomości transakcyjne
├── catalog-store.js — atomowy zapis katalogu i konfiguracji
├── index.html — katalog i wyszukiwanie
├── pdp.html — karta produktu
├── koszyk.html — koszyk
├── checkout.html — formularz zamówienia
├── order-success.html — odczyt statusu realizacji i wpłaty
├── admin.html — panel właściciela
├── products.js — oferta startowa przed pierwszym zapisem CMS
├── shop-config.js — ustawienia startowe i funkcje strony
├── cart.js — obsługa koszyka w przeglądarce
├── ui-safety.js — escapowanie tekstu i fokus okien
├── assets/ — lokalna biblioteka stylów Tailwind
├── images/ — zdjęcia produktów
├── data/ — prywatne zamówienia i nadrzędny katalog po zapisie CMS
├── tests/ — izolowane testy API i przeglądarki
├── docs/ — konfiguracja, architektura, audyt i bieżący stan
├── archive/ — materiały historyczne
├── zdjecia przyklady/ — zdjęcia referencyjne
├── .tmp/ — lokalne dane testowe i zrzuty, poza repozytorium
├── node_modules/ — lokalne zależności, poza repozytorium
├── .env — prywatne sekrety środowiska, poza repozytorium
├── .env.example — pusty wzór konfiguracji
├── .gitignore — wyłączenia danych i sekretów
├── package.json — zależności oraz komendy uruchomienia i testów
├── package-lock.json — przypięte wersje zależności
├── admin-server.py — wyłączony stary serwer, wskazuje uruchomienie Node.js
├── auth-gate.js — nieużywana bramka demonstracyjna, nieudostępniana przez serwer
├── scrape_and_populate.py — historyczne narzędzie importu oferty
├── INSTRUKCJA_OBSLUGI.md — instrukcja właściciela
├── agents.md — reguły pracy nad projektem
├── CONTEXT_MAP.md — mapa dokumentacji
├── walkthrough.md — opis historycznych prac
└── README.md — punkt wejścia do projektu
```
