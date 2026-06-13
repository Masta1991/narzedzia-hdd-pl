(function() {
    // Hasło dostępu do sklepu (możesz je zmienić poniżej)
    const ACCESS_PASSWORD = "hdd2026";
    const AUTH_KEY = "hdd_authorized";

    // Sprawdzamy, czy użytkownik jest już autoryzowany
    if (localStorage.getItem(AUTH_KEY) === "true") {
        return;
    }

    // Ukrywamy zawartość strony przed załadowaniem dom
    const style = document.createElement('style');
    style.id = 'auth-gate-initial-hide';
    style.innerHTML = 'body { display: none !important; }';
    document.head.appendChild(style);

    document.addEventListener("DOMContentLoaded", function() {
        // Usuwamy ukrycie body, ale natychmiast narzucamy pełnoekranową blokadę
        const hideStyle = document.getElementById('auth-gate-initial-hide');
        if (hideStyle) hideStyle.remove();

        const gate = document.createElement('div');
        gate.id = 'auth-gate-overlay';
        gate.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(10, 19, 23, 0.95);
            backdrop-filter: blur(12px);
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Montserrat', sans-serif;
            color: #ffffff;
        `;

        gate.innerHTML = `
            <div style="background: #1c1e21; border: 1px solid rgba(255,255,255,0.08); padding: 40px; border-radius: 24px; max-width: 400px; w-full: true; width: 90%; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                <div style="display: inline-flex; width: 64px; height: 64px; border-radius: 50%; background: rgba(0, 100, 224, 0.1); color: #0064e0; align-items: center; justify-content: center; margin-bottom: 24px;">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <h2 style="font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #ffffff; tracking-tight: -0.16px;">Strona w budowie</h2>
                <p style="font-size: 14px; color: #8595a4; margin-bottom: 28px; line-height: 1.5;">Trwają prace przygotowawcze przed oficjalnym startem. Wprowadź hasło dostępu, aby przetestować sklep.</p>
                <form id="auth-gate-form" style="display: flex; flex-col: true; flex-direction: column; gap: 16px;">
                    <input type="password" id="auth-gate-input" placeholder="Wpisz hasło" style="width: 100%; height: 48px; border-radius: 100px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.15); padding: 0 24px; color: #ffffff; font-size: 15px; font-weight: 500; outline: none; transition: border-color 0.2s;" />
                    <button type="submit" style="width: 100%; height: 48px; border-radius: 100px; background: #0064e0; border: none; color: #ffffff; font-size: 14px; font-weight: 700; cursor: pointer; transition: background 0.2s;">Wejdź do sklepu</button>
                    <p id="auth-gate-error" style="color: #f0284a; font-size: 12px; font-weight: 600; margin-top: 4px; display: none;">Niepoprawne hasło. Spróbuj ponownie.</p>
                </form>
            </div>
        `;

        document.body.appendChild(gate);

        // Autofocus na input
        const input = document.getElementById('auth-gate-input');
        input.focus();
        
        input.addEventListener('focus', () => {
            input.style.borderColor = '#0064e0';
        });
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(255,255,255,0.15)';
        });

        // Obsługa wysłania formularza
        document.getElementById('auth-gate-form').addEventListener('submit', function(e) {
            e.preventDefault();
            const val = input.value;
            const errorMsg = document.getElementById('auth-gate-error');
            
            if (val === ACCESS_PASSWORD) {
                localStorage.setItem(AUTH_KEY, "true");
                gate.remove();
            } else {
                errorMsg.style.display = 'block';
                input.value = '';
                input.style.borderColor = '#f0284a';
                input.focus();
            }
        });
    });
})();
