# Stan projektu — 2026-11-05

## Wdrożone lokalnie

- Przywrócono C:/Projects/Websites/Narzedzia HDD PL z archiwum; 2214 plików zgodnych z manifestem przed edycjami. Archiwum nietknięte.
- Brak płatności online: Stripe usunięty z runtime, package i wzoru konfiguracji, stare endpointy nieaktywne.
- Firmy i osoby prywatne składają zamówienie z ostateczną kwotą. Pro forma wystawiana i wysyłana poza sklepem; dane przelewu nie są w nowych potwierdzeniach.
- expectedTotalCents chroni przed cichą zmianą kwoty podczas zamawiania; różnica daje 409 bez zapisu. Ponowienie zachowuje pierwotne ceny.
- Etap realizacji, wpłata, historia zmian i per-recipient status potwierdzeń. Osobna świadoma akcja potwierdzenia wpływu pieniędzy.
- Brak publicznych linków do panelu; wejście przez /admin.html i ADMIN_SECRET. Serwerowe uprawnienia, noindex, wylogowanie zachowane.
- Poprawiono panel 320 px, kontrast etykiet, nazwy pól, opisy paczkomatu i komunikat błędu odczytu zamówień.
- Prywatny .env i data/orders.json identyczne bajtowo z kopią archiwalną. Nie odczytywano ustawień produkcyjnych ani danych klientów.
- Instrukcja właściciela i dokumentacja konfiguracji zaktualizowane. Poprzedni handoff: history/MODEL_HANDOFF_2026-10-03.md.

## Dowody

- npm ci --offline --ignore-scripts: odtworzone zależności. Wynik audytu offline nie stanowi aktualnego audytu CVE.
- npm test: 13/13 PASS; log .tmp/verification-20261105/api.log. Manipulacja ceną, walidacja, równoległe żądania, wszystkie etapy, auth, błędy dysku i SMTP, historia oraz syntetyczna kopia/odtworzenie.
- node tests/browser.cjs: 58/58 PASS, Chrome 156.0.8078.80; log browser.log, browser/results.json i 36 zrzutów. Szerokości 1440/1366/1024/768/390/320, 200% tekstu, reduced motion, logowanie/modal i działania zamówień.
- node tests/accessibility.cjs: 12 stanów axe bez zgłoszonych naruszeń WCAG 2A/AA + 2.1AA w badanych stanach. Formularz B2B, paczkomat, pięć zakładek admina i edycja produktu; extra/results.json.
- Dodatkowo w przeglądarce: zmiana ceny po otwarciu formularza blokuje zakup, zachowuje koszyk i przywraca fokus; błąd 500 zamówień pokazuje błąd.
- Ręcznie przejrzano montaże 36 bieżących zrzutów. Archiwalne zrzuty są wyłącznie historycznym punktem odniesienia, nie wykonano pełnej nowej macierzy przed zmianami. To nie pełny audyt WCAG ani kompletnego katalogu produktów.
- Recenzja integracji UI przez osobnego agenta wykryła rozbieżność wyceny, brak etykiety NIP i błędną prezentację HTTP500; poprawione. Recenzent pisał backend, więc jego ocena backendu jest kontrolą własnej pracy.
- git diff --check PASS; różnice względem archiwum: .tmp/verification-20261105/changes.diff. Nie cofano wcześniejszych zmian użytkownika.
- Rejestr HDD poprawny. Wspólny workspace_doctor nadal zgłasza wyłącznie dwa niezwiązane brakujące projekty ERPNext Docker i Frappe Docker; nie zmieniano ich.

## Pozostałe warunki publikacji

- Nie publikowano, nie włączano sprzedaży, nie wysyłano prawdziwej poczty. Dane firmy, oferta, transport oraz dokumenty wymagają potwierdzenia właściciela.
- SMTP testowany atrapą; SENT oznacza przyjęcie przez serwer poczty. Dostarczalność, TLS i hosting wymagają rzeczywistego odbioru. Możliwe powtórzenie maila przy awarii pomiędzy wysłaniem i zapisem.
- Jeden proces, trwały dysk, brak liczbowych rezerwacji magazynu, automatycznych zwrotów i generatora pro form. Kwoty pro form wystawianych poza sklepem kontroluje sprzedawca.
- Bankowe ustawienia katalogu pozostają publiczną konfiguracją, jeśli właściciel je wpisze; nowe potwierdzenia ich nie używają. Panel opisuje to zgodnie ze stanem.
- Nie przeprowadzono produkcyjnego odtworzenia, audytu CVE, audytu prawnego ani pełnej kontroli wszystkich wariantów dostępności. Google Fonts testowano z fallbackiem; CSP nadal dopuszcza inline.

## Jeden następny krok

Przeprowadzić z właścicielem checklistę docs/KONFIGURACJA_I_ODBIOR.md, uzupełnić i potwierdzić rzeczywiste dane, pocztę oraz docelowy hosting przed osobno uzgodnioną publikacją.
