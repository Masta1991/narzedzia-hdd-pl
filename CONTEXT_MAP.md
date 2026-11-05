# Mapa kontekstu — Narzedzia HDD PL

| Zadanie | Czytaj |
|---|---|
| Obsługa sklepu / panelu | `README.md`, właściwy rozdział `INSTRUKCJA_OBSLUGI.md` |
| Architektura / wymagania CMS | `docs/ARCHITEKTURA_I_CMS.md` |
| Uruchomienie / konfiguracja i odbiór | `docs/KONFIGURACJA_I_ODBIOR.md`, `package.json`, `.env.example` |
| Konkretny widok | wybrany HTML i powiązany JS |
| Oferta / konfiguracja | `products.js`, `shop-config.js`; dane tylko w zakresie zmiany |
| Płatności / autoryzacja | `server.js`, `order-routes.js`, `order-core.js`, `order-mail.js`, `tests/security.test.cjs` |
| Zapis CMS | `catalog-store.js`, `admin.html`, `tests/security.test.cjs` |
| Audyt działania i bezpieczeństwa / bieżąca gotowość | `docs/AUDYT_2026-10-02.html`, `docs/MODEL_HANDOFF.md`; szczegóły testów w `docs/audit-20261002/` |
| Historia | `walkthrough.md`, tylko potrzebny fragment `archive/` |

Nie czytaj `node_modules/`, `.env` ani `data/orders.json` na starcie. Dowody wydania wymagają osobnego aktualnego testu.
