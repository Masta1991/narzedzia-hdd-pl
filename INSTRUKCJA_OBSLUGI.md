# Podręcznik Administratora i Instrukcja Obsługi Sklepu — Narzędzia HDD PL

Kompletny przewodnik po obsłudze, edycji ofert, zmianie statusów magazynowych, zarządzaniu kategoriami oraz mechanizmie rekomendacji zestawów w sklepie **Narzędzia HDD PL**.

---

## 1. Jak Wejść do Panelu Zarządzania (CMS)

1. W przeglądarce otwórz stronę panelu:
   * Wpisz adres: `admin.html` (np. `http://localhost:8080/admin.html` lub `twojadomena.pl/admin.html`).
   * Albo zjedź na sam dół strony głównej sklepu i w stopce kliknij: **[Panel Zarządzania (CMS)](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/admin.html)**.
2. Na ekranie blokady wpisz kod PIN: **`admin2026`** i kliknij *Zaloguj do panelu*.

---

## 2. Statusy Magazynowe Produktów — Jak to Działa i Jak je Zmieniać?

W sklepie wdrożono **3 niezależne statusy dostępności**, dopasowane do specyfiki sprzedaży ciężkiego osprzętu wiertniczego:

| Status w Panelu | Wygląd na Karcie Produktu (PDP) | Zachowanie Przycisku Zakupu | Filtrowanie w Katalogu |
| :--- | :--- | :--- | :--- |
| **`W magazynie`** *(Domyślny)* | 🟢 **Zielona etykieta:** <br>`W magazynie (wysyłka 24h)` | Niebieski przycisk: **`Dodaj do koszyka`** (klient zamawia od ręki). | Wyświetla się przy zaznaczeniu checkboxa *"Tylko w magazynie"*. |
| **`Na zamówienie`** | 🟡 **Bursztynowa etykieta:** <br>`Na zamówienie (3-5 dni)` | Żółty przycisk: **`Zamów z dostawą 3-5 dni`** (klient zamawia ze świadomością czasu sprowadzenia). | Ukrywany przy filtrze "Tylko w magazynie", widoczny w katalogu ogólnym. |
| **`Brak w magazynie`** <br>*(Niedostępny)* | ⚪ **Szara etykieta:** <br>`Chwilowo niedostępny` | Przycisk kontaktowy: **`✉️ Zapytaj o dostępność inżyniera`** (otwiera gotowy e-mail z numerem SKU). | Ukrywany przy filtrze "Tylko w magazynie". |

### Jak zmienić status danego produktu:
1. Wejdź do panelu `admin.html` w zakładkę **Produkty i Oferty**.
2. Znajdź produkt (możesz użyć wyszukiwarki lub filtra kategorii) i kliknij przycisk **`Edytuj`**.
3. W polu **Status magazynowy** wybierz z listy:
   * *W magazynie (Dostępny od ręki)*
   * *Na zamówienie (3-5 dni)*
   * *Brak w magazynie*
4. Kliknij **`Zapisz Produkt`**. Zmiana jest natychmiast widoczna w sklepie.

---

## 3. Mechanizm „Często Kupowane Razem” (Bundle Recommendations)

Na karcie każdego produktu ([pdp.html](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/pdp.html)) znajduje się moduł rekomendacji zestawu z wyliczoną łączną ceną i przyciskiem *"Dodaj zestaw do koszyka"*.

### Czy to działa automatycznie?
**TAK, w 100% automatycznie i inteligentnie.** 

Sklep posiada wbudowany algorytm logicznego dopasowania asortymentu wiertniczego na podstawie kategorii:
1. **Gdy klient ogląda Rozwiertak lub Żerdzie wiertnicze:**
   * System automatycznie dobiera dedykowany **Smar miedziowy do gwintów** lub **Wymienne zęby węglikowe**.
2. **Gdy klient ogląda Chwytak do rur PE:**
   * System automatycznie dobiera kompatybilny **Krętlik łożyskowany HDD (Swivel)**.
3. **Gdy klient ogląda Głowicę lub Obudowę sondy:**
   * System automatycznie dobiera **Wymienną płetwę sterującą** lub **Sondę nadawczą**.

### Opcjonalne ręczne przypisanie (jeśli chcesz połączyć konkretne SKU):
W obiekcie produktu możesz opcjonalnie podać parametr `bundleSku` (np. `"bundleSku": "HDD-SM-CU"`). Wtedy system zawsze powiąże ten konkretny artykuł zamiast losowania kategorii.

---

## 4. Dodawanie Nowych Ofert i Wgrywanie Zdjęć oraz Dokumentacji PDF

### Dodanie nowego produktu (Krok po kroku):
1. W panelu `admin.html` kliknij niebieski przycisk **`+ Dodaj Nowy Produkt`**.
2. Wypełnij formularz:
   * **Nazwa produktu**: np. `Rozwiertak Baryłkowy Premium 400mm` (SKU wygeneruje się samoczynnie).
   * **SKU**: unikalny kod towarowy (np. `HDD-RB-400`).
   * **Kategoria**: wybierz zakładkę, do której ma trafić produkt (np. *Rozwiertaki*).
   * **Cena Brutto**: wpisz kwotę (np. `7500.00`) — cena netto wyliczy się automatycznie.
   * **Typ gwintu**: np. `2 7/8" IF` lub `3 1/2" API Reg` (używane w filtrach bocznych).
   * **Status magazynowy**: wybierz dostępność (*W magazynie*, *Na zamówienie*, *Brak w magazynie*).
   * **Zdjęcie produktu z dysku (Upload)**:
     * Kliknij przycisk **`Wybierz plik z dysku`** i wybierz zdjęcie (JPG / PNG / WEBP) ze swojego komputera.
     * Zdjęcie automatycznie załaduje się do podglądu i zostanie zapisane w ofercie (możesz też wkleić link lub ścieżkę do pliku).
   * **Dokumentacja Techniczna (Karta Katalogowa PDF / DTR)**:
     * Kliknij przycisk **`Załącz plik PDF`** i wskaż plik karty technicznej ze swojego dysku.
     * Na karcie produktu ([pdp.html](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/pdp.html)) pojawi się wtedy profesjonalna sekcja **„📄 Pobierz Kartę PDF”**, skąd klienci pobiorą rysunek techniczny i atesty materiałowe.
   * **Powiązany produkt w zestawie (Opcjonalne SKU)**:
     * Wpisz SKU produktu, z którym ma być tworzony zestaw (np. `HDD-ZB_105`), lub pozostaw puste, aby system sam dobrał pasujący osprzęt.
   * **Opis**: krótki opis techniczny przeznaczenia narzędzia.
   * **Parametry techniczne (Specyfikacja)**: klikaj `+ Dodaj wiersz`, aby dopisać parametry (np. *Średnica: 400 mm*, *Waga: 65 kg*, *Zbrojenie: Węglik spiekany*).
3. Kliknij **`Zapisz Produkt`**. Produkt od razu pojawi się w katalogu, na karcie produktu i w wyszukiwarce.


### Klonowanie (Duplikowanie) istniejących ofert:
Jeśli masz produkt o zbliżonych parametrach (np. chwytak o innej średnicy), w tabeli produktów kliknij **`Klonuj`**. Utworzy się kopia, w której wystarczy zmienić rozmiar i cenę.

---

## 5. Dodawanie Nowych Zakładek i Kategorii

Chcesz dodać nową kategorię osprzętu (np. *Płyny i Polimery płuczkowe*, *Adaptery gwintów*, *Lokalizatory*)?

1. W panelu przejdź do zakładki **`Kategorie i Zakładki`**.
2. Kliknij **`+ Dodaj Nową Kategorię`**.
3. Wpisz:
   * **Identyfikator (ID)**: krótki kod bez polskich znaków (np. `plyny-polimery`).
   * **Nazwa wyświetlana**: np. `Płyny i Polimery płuczkowe`.
   * **Tytuł sekcji (H1)**: np. `Bentonity i polimery do płuczki wiertniczej HDD`.
   * **Opis**: krótki opis korzyści widoczny nad siatką produktów.
4. Kliknij **`Zapisz Kategorię`**. Nowa kategoria automatycznie pojawi się w:
   * Menu bocznym na desktopie (z dynamicznym licznikiem produktów).
   * Rozwijanym menu na telefonach komórkowych.
   * Formularzu dodawania produktów.
   * Paskach nawigacji (Breadcrumbs).

---

## 6. Kody Rabatowe i Promocje

1. W panelu przejdź do zakładki **`Kody Rabatowe`**.
2. Kliknij **`+ Dodaj Nowy Kod`**.
3. Wybierz typ:
   * **Procentowy (%)**: np. kod `WIOSNA10` z wartością `10` da 10% rabatu na cały koszyk.
   * **Kwotowy (zł)**: np. kod `RABAT100` z wartością `100` obniży zamówienie o 100 zł.
   * **Darmowa dostawa**: kod `FREESHIP` wyzeruje koszty wysyłki niezależnie od kwoty.
4. Klient wpisuje kod w koszyku ([koszyk.html](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/koszyk.html)) lub podczas kasy ([checkout.html](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/checkout.html)). Rabat nalicza się natychmiastowo.

---

## 7. Zmiana Danych Firmy, Nagłówka, Stopki i Rachunku Bankowego

W panelu administracyjnym w zakładce **`Dane Firmy i Sklepu`** możesz w pełni edytować wygląd i treści nagłówka oraz stopki sklepu:

### A. Górny Pasek Ogłoszeń (Nad Nagłówkiem)
* **Włącznik / Wyłącznik**: Możesz jednym kliknięciem pokazać lub ukryć górny czarny pasek ogłoszeń.
* **Treść komunikatu**: Wpisz dowolny tekst promocyjny, np.:
  > `🚚 Darmowa dostawa od 500 PLN | Magazyn Kraków • Wysyłka w 24h`  
  > `⚡ Promocja Wiosenna: Kod HDD2026 daje -10% na wszystkie rozwiertaki!`
* Tekst ten automatycznie zaktualizuje się na wszystkich podstronach (`index.html`, `pdp.html`, `koszyk.html`, `checkout.html`).

### B. Próg Darmowej Dostawy
* Wpisz kwotę (np. `500` lub `1000` zł) — pasek postępu w koszyku samoczynnie przeliczy brakujące kwoty.

### C. Treści i Opisy w Stopce Sklepu
* **Krótki opis firmy / misji**: Tekst wyświetlany w pierwszej kolumnie stopki.
* **Godziny pracy / Obsługa infolinii**: np. `Pn - Pt: 7:00 - 17:00 | Dyżur: 24/7`.
* **Tekst praw autorskich (Copyright)**: np. `© 2026 Narzędzia HDD PL. Wszelkie prawa zastrzeżone.`.

### D. Dane Rozliczeniowe i Bankowe
* **Nazwa firmy, NIP, adres siedziby, e-mail i telefon**.
* **Numer konta bankowego IBAN i nazwa Banku** (wyświetlane przy wyborze przelewu tradycyjnego / proformy).


---

## 8. Jak Zapisywać Zmiany — 3 Wygodne Metody

Strona została stworzona tak, aby działała na każdym hostingu:

### Metoda 1: Zmiany na żywo w przeglądarce (Najprostsza)
Wszystkie zmiany wprowadzone w `admin.html` zapisują się natychmiast w pamięci przeglądarki (`localStorage`). Gdy otworzysz sklep, od razu widzisz nowe produkty i ceny.

### Metoda 2: Pobranie zaktualizowanych plików bazy (Eksport 1-kliknięciem)
W prawym górnym rogu panelu kliknij zielony przycisk: **`Zapisz / Pobierz pliki bazy`**.
* Przeglądarka pobierze 2 zaktualizowane pliki: `products.js` oraz `shop-config.js`.
* Wystarczy wkleić je do głównego folderu ze stroną (lub wgrać przez FTP/Git na serwer).

### Metoda 3: Autozapis na dysku (Lokalny serwer Python)
Jeśli uruchomisz stronę za pomocą dostarczonego skryptu:
```bash
python admin-server.py
```
Każde kliknięcie *"Zapisz"* w panelu administracyjnym **automatycznie i bezpośrednio nadpisuje pliki na Twoim dysku twardym** bez konieczności ręcznego pobierania plików!

---

## 9. Usunięcie Hasła Przedpremierowego przed Sprzedażą / Premierą

Strona posiada zabezpieczenie hasłem wstępnym (**`hdd2026`**) w pliku [auth-gate.js](file:///C:/Projects/Development/Narzedzia%20HDD%20PL/auth-gate.js).

Gdy sklep jest gotowy do oddania klientowi / publikacji w sieci:
1. Usuń plik `auth-gate.js`.
2. Z plików `index.html`, `pdp.html`, `koszyk.html`, `checkout.html` usuń linijkę na samej górze:
   ```html
   <script src="auth-gate.js"></script>
   ```
Sklep będzie wtedy natychmiast dostępny publicznie dla wszystkich kupujących.
