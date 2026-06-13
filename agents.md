# Instrukcje dla Agentów AI (agents.md)

Ten plik zawiera kluczowe wytyczne projektowe, architekturę oraz ograniczenia dla projektu **Narzędzia HDD PL**. Każdy agent AI rozpoczynający pracę nad tym projektem ma obowiązek w pierwszej kolejności zapoznać się z poniższymi regułami.

---

## 1. Architektura Projektu
- **Brak klasycznego Backend'u i baz SQL**: Projekt jest w 100% statyczny.
- **Baza danych w JS**: Cała baza produktów znajduje się w pliku `products.js` w stałej `const PRODUCTS`.
- **W pełni dynamiczne podstrony (PDP)**: Plik `pdp.html` jest szablonem, który wczytuje dane dynamicznie z `products.js` przy użyciu parametru URL `?sku=...`.
- **Koszyk zakupowy**: Obsługiwany lokalnie przez plik `cart.js`.

---

## 2. Kluczowe Zasady i Wytyczne Designu (Aesthetic Rules)
- **Spójność z szablonem wzorcowym**: Każda oferta w sklepie musi wyglądać i zachowywać się dokładnie tak jak wzorcowy szablon w `pdp.html`.
- **Stylizacja**: Używamy biblioteki Tailwind CSS (ładowanej z CDN w celach prototypowania).
- **Czcionka**: Montserrat (jako fallback dla Optimistic VF).
- **Kolorystyka**: Motyw oparty o głębokie szarości/czerń (`#0a1317`, `#1c1e21`) z akcentem wyrazistego kobaltu/niebieskiego (`#0064e0` / `#0457cb`).

---

## 3. Dynamiczne Cechy i Opinie (Testimonials)
- Zamiast statycznych tekstów o rozwieraczach na każdej karcie, sekcja cech w `pdp.html` (kontener `#product-features-row`) oraz sekcja rekomendacji klienta (`#product-testimonial-container`) są renderowane dynamicznie w JavaScript w zależności od **kategorii produktu** (`catId`), aby teksty logicznie pasowały do asortymentu (np. chwytaki, żerdzie, lokalizatory).

---

## 4. Ochrona przed Wdrożeniem (Pre-release password protection)
- Sklep tymczasowo posiada blokadę wejścia zaimplementowaną w pliku `auth-gate.js`.
- Skrypt ten jest wstrzyknięty na początku sekcji `<head>` na wszystkich podstronach.
- **Hasło dostępu**: `hdd2026` (zapamiętywane w `localStorage` pod kluczem `hdd_authorized`).
- **Przed oficjalną publikacją**: Należy usunąć plik `auth-gate.js` oraz usunąć tagi `<script src="auth-gate.js"></script>` ze wszystkich plików HTML.

---

## 5. Przetwarzanie Zdjęć (SEO i unikanie plagiatu)
Wszystkie zdjęcia pobierane/importowane z innych sklepów (np. mp-technik) muszą przechodzić przez proces transformacji:
1. **Odbicie lustrzane w poziomie** (Horizontal Flip).
2. **Korekcja jasności** (delikatne ściemnienie/rozjaśnienie o ok. 3-5%).
3. **Konwersja kolorów**: Obsługa formatów przezroczystości (RGBA) i palet kolorów (P, CMYK) z poprawną konwersją do RGB przed zapisem.

---

## 6. Polityka Commitów i Wdrażania (Git & Netlify)
Aby oszczędzać darmowe minuty kompilacji na Netlify (które uruchamia wdrożenie przy każdym `git push` do gałęzi `main`):
- **Brak automatycznego `git push`**: Agent nie może samodzielnie wykonywać polecenia `git push` przy drobnych poprawkach, chyba że użytkownik wyraźnie o to poprosi.
- **Lokalne commity**: Zmiany należy zapisywać lokalnie (`git add` i `git commit`).
- **Grupowanie zmian**: Kod na serwer zdalny (GitHub) powinien być wysyłany w większych, skumulowanych paczkach po zakończeniu określonego etapu prac.
- **Omijanie wdrożenia (Skip CI)**: Jeśli musimy wysłać kod na GitHub, ale **nie chcemy** uruchamiać wdrożenia na Netlify, w opisie commita należy bezwzględnie dopisać tag `[skip ci]` (np. `git commit -m "poprawka literówki [skip ci]"`). Netlify zignoruje taki commit i nie zużyje limitu minut.

