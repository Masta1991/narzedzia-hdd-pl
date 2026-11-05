# Konfiguracja i odbiór — 2026-11-05

## Przed włączeniem zamówień

- Użyj .env.example jako listy pól. Nie zastępuj prywatnego .env automatycznie.
- ADMIN_SECRET: losowy sekret minimum 32 znaki, przechowywany wyłącznie prywatnie. Panel: /admin.html, zakładka w przeglądarce; wylogowanie przyciskiem w górnym pasku.
- Panel ustawień: potwierdzone dane sprzedawcy, NIP, adres, e-mail, telefon. Rachunek bankowy nie jest wymagany do przyjęcia zamówienia i nie jest wysyłany w nowych potwierdzeniach; właściciel podaje go na zewnętrznej pro formie.
- SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, EMAIL_FROM, SHOP_OWNER_EMAIL: konfiguracja rzeczywistej poczty. Nie wyłączaj weryfikacji TLS. Sprawdź odbiór na uzgodnionych adresach klienta i właściciela.
- TERMS_URL i PRIVACY_URL: działające HTTPS do zatwierdzonych dokumentów uwzględniających sprzedaż firmom i osobom prywatnym oraz pro formę poza sklepem.
- BASE_URL: faktyczny adres sklepu, HTTPS przy publikacji. HOST domyślnie 127.0.0.1.
- Zweryfikuj ceny brutto, VAT, dostępność, zdjęcia i parametry, rabaty, terminy i realne możliwości transportu ciężkiego osprzętu. Domyślnie kurier 20 zł, paczkomat 15 zł, odbiór 0 zł; próg darmowej dostawy 500 zł przed rabatem. Nie ma sprawdzania rozmiaru paczki, prawdziwego kodu paczkomatu ani liczbowej rezerwacji magazynu.
- SHOP_ENABLED=true dopiero po odbiorze. Nie są wymagane żadne klucze operatora płatności.

## Odbiór

1. npm ci; npm test — izolowane testy serwera na syntetycznej bazie, bez wysyłki poczty.
2. npm run test:browser — Playwright/Chrome. PLAYWRIGHT_MODULE pozwala wskazać istniejący moduł, BROWSER_EXE przeglądarkę. Zewnętrzne połączenia zablokowane; testowa poczta jest atrapą.
3. Sprawdź nowe zamówienie, pro formę oznaczoną ręcznie, potwierdzenie rzeczywistej wpłaty, realizację oraz anulowanie nieopłaconego zamówienia. Kwota pro formy musi odpowiadać zapisanej kwocie.
4. Na docelowym hostingu zweryfikuj HTTPS/proxy, nagłówki, brak dostępu do data/, .env, źródeł i kopii oraz realne doręczanie poczty. Włączenie sprzedaży i publikacja są oddzielnym etapem.

Dodatkowa kontrola: `node tests/accessibility.cjs` z PLAYWRIGHT_MODULE i AXE_SCRIPT wskazującym lokalny axe.min.js. Obejmuje formularz firmowy, panel, błąd bazy i zmianę ceny podczas zamawiania.

## Kopie i odtwarzanie

Wymagany jeden proces i trwały dysk. Zatrzymaj serwer, skopiuj data/, prywatny .env oraz wersję aplikacji do prywatnej lokalizacji poza katalogiem publicznym. Przy odtwarzaniu zatrzymaj serwer i użyj zgodnej wersji aplikacji. Najpierw wykonaj próbę na osobnej kopii; nie nadpisuj działającej bazy. Kopia archiwalna z 2026-10-25 nie jest kopią przyszłych zamówień. Retencję i lokalizację kopii produkcyjnych ustala właściciel.

## Granice

Nie ma automatycznych faktur/pro form, zwrotów, etykiet ani rezerwacji stanów. Status SENT oznacza przyjęcie przez SMTP, nie odbiór w skrzynce; możliwe ponowienie przy awarii między wysyłką a zapisem. Losowy link statusu jest poufny — logi proxy powinny pomijać parametry URL. CSP nadal dopuszcza inline; fonty Google mogą być pobierane zewnętrznie. Obecność dokumentów nie jest potwierdzeniem ich zgodności prawnej. Prywatnego .env i rzeczywistej bazy nie zmieniono w tej sesji; faktyczne ustawienia włączenia sprzedaży nie były odczytywane.
