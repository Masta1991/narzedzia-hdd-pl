# Agent projektu — Narzedzia HDD PL

Specjalizacja: **ecommerce**. Zakres: Katalog, koszyk, zamówienia z pro formą poza sklepem i CMS.

1. Przeczytaj `CONTEXT_MAP.md`, potem wyłącznie wiersz właściwy zadaniu.
2. Obejrzyj stan repozytorium; zachowaj zmiany użytkownika. Wyszukuj w konkretnym pliku lub katalogu, bez skanowania zależności, historii i całego workspace.
3. Stosuj wspólny router `C:\Projects\.agents\AGENTS.md` i reguły dobrane przez Activation/Scope. Pełny skill czytaj dopiero po dopasowaniu opisu do zadania.
4. Dokumentacja użytkownika: `README.md`. Nie twórz kopii stanu w wielu plikach. Handoff, jeżeli potrzebny, zawiera aktualny wynik, ograniczenia i jeden następny krok; starą historię zachowuj poza ścieżką startową.
5. Dane pozostają lokalne bez jawnej decyzji o innym przetwarzaniu. Publikacja, koszty cykliczne i destrukcyjne działania wymagają odpowiedniej autoryzacji i checkpointu.
6. Checkpoint: `C:\Projects\Backups`; materiały robocze wewnątrz projektu. Zakończ proporcjonalną kontrolą i aktualizacją stanu tylko, gdy faktycznie się zmienił. LLM-WIKI aktualizuj wyłącznie na jawne polecenie synchronizacji.

## Specyfika tego projektu

- Architektura i dotychczasowe wymagania są zachowane w `docs/ARCHITEKTURA_I_CMS.md`; użytkownik korzysta z `INSTRUKCJA_OBSLUGI.md`.
- Czytaj `.env.example` tylko przy konfiguracji; nie wyświetlaj sekretów `.env` ani zamówień klientów w raportach.
- `ADMIN_SECRET` musi być losowy i sprawdzany po stronie serwera. Bramki przeglądarkowe nie zabezpieczają panelu.
- Zmiany cen, zamówień i płatności wymagają testów zachowania na danych syntetycznych: manipulacja ceną, brak autoryzacji, niedozwolona zmiana statusu, powtórzenie zamówienia i błąd wysyłki potwierdzeń. Wyszukanie nazw funkcji nie potwierdza bezpieczeństwa.
- Stare opisy „produkcyjny” i lista funkcji dokumentują intencję, nie stan aktualnego wdrożenia. Nie wykonuj realnej transakcji podczas zwykłego audytu.
