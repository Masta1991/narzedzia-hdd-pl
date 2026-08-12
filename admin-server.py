"""
Lekki serwer deweloperski i autozapisu dla Narzędzia HDD PL.
Uruchomienie: python admin-server.py
Otwiera sklep i panel administracyjny na http://localhost:8080/admin.html
"""

import http.server
import socketserver
import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class HDDShopHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                products = data.get('products')
                shop_config = data.get('shopConfig', {})

                if products:
                    prod_path = os.path.join(DIRECTORY, 'products.js')
                    with open(prod_path, 'w', encoding='utf-8') as f:
                        f.write(f"let PRODUCTS = {json.dumps(products, indent=4, ensure_ascii=False)};\n\n")
                        f.write("// Wczytaj niestandardowe produkty z panelu administratora (jeśli istnieją)\n")
                        f.write("try {\n")
                        f.write("    const customData = localStorage.getItem('hdd_custom_products');\n")
                        f.write("    if (customData) {\n")
                        f.write("        const parsed = JSON.parse(customData);\n")
                        f.write("        if (Array.isArray(parsed) && parsed.length > 0) {\n")
                        f.write("            PRODUCTS = parsed;\n")
                        f.write("        }\n")
                        f.write("    }\n")
                        f.write("} catch(e) {}\n")
                    print(f"✅ Zapisano {len(products)} produktów do products.js")

                if shop_config:
                    cfg_path = os.path.join(DIRECTORY, 'shop-config.js')
                    categories = shop_config.get('CATEGORIES', [])
                    cat_details = shop_config.get('CAT_DETAILS', {})
                    filter_options = shop_config.get('FILTER_OPTIONS', {})
                    promo_codes = shop_config.get('PROMO_CODES', {})
                    company_cfg = shop_config.get('SHOP_CONFIG', {})

                    with open(cfg_path, 'w', encoding='utf-8') as f:
                        f.write("/**\n * Centralna konfiguracja sklepu Narzędzia HDD PL\n */\n\n")
                        f.write(f"let SHOP_CONFIG = {json.dumps(company_cfg, indent=4, ensure_ascii=False)};\n\n")
                        f.write(f"let CATEGORIES = {json.dumps(categories, indent=4, ensure_ascii=False)};\n\n")
                        f.write(f"let CAT_DETAILS = {json.dumps(cat_details, indent=4, ensure_ascii=False)};\n\n")
                        f.write(f"let FILTER_OPTIONS = {json.dumps(filter_options, indent=4, ensure_ascii=False)};\n\n")
                        f.write(f"let PROMO_CODES = {json.dumps(promo_codes, indent=4, ensure_ascii=False)};\n\n")
                        f.write("let POPULAR_PACZKOMATY = [\n")
                        f.write('    { code: "KRA01M", desc: "Kraków, ul. Pawia 5 (Galeria Krakowska)" },\n')
                        f.write('    { code: "KRA15A", desc: "Kraków, ul. Mogilska 43" },\n')
                        f.write('    { code: "WAW01N", desc: "Warszawa, Al. Jerozolimskie 54" },\n')
                        f.write('    { code: "WAW22A", desc: "Warszawa, ul. Marszałkowska 100" },\n')
                        f.write('    { code: "WRO05M", desc: "Wrocław, ul. Piłsudskiego 105" },\n')
                        f.write('    { code: "POZ03A", desc: "Poznań, ul. Półwiejska 42" },\n')
                        f.write('    { code: "GDA02N", desc: "Gdańsk, ul. Rajska 10" },\n')
                        f.write('    { code: "KAT01M", desc: "Katowice, ul. 3 Maja 30" }\n')
                        f.write("];\n\n")
                        f.write("let POPULAR_BANKS = [\n")
                        f.write('    { id: "blik", name: "BLIK", logoText: "BLIK", isBlik: true },\n')
                        f.write('    { id: "mbank", name: "mBank", color: "#e60000" },\n')
                        f.write('    { id: "pko", name: "PKO Bank Polski (iPKO)", color: "#003399" },\n')
                        f.write('    { id: "santander", name: "Santander Bank Polska", color: "#ec0000" },\n')
                        f.write('    { id: "ing", name: "ING Bank Śląski", color: "#ff6200" },\n')
                        f.write('    { id: "pekao", name: "Bank Pekao S.A.", color: "#d5002b" },\n')
                        f.write('    { id: "alior", name: "Alior Bank", color: "#851a2d" },\n')
                        f.write('    { id: "millennium", name: "Bank Millennium", color: "#b5006b" },\n')
                        f.write('    { id: "bnp", name: "BNP Paribas", color: "#008a54" }\n')
                        f.write("];\n\n")
                        f.write("function validateNIP(nip) {\n")
                        f.write("    if (!nip) return false;\n")
                        f.write("    const cleanNip = nip.replace(/[\\s-]/g, '');\n")
                        f.write("    if (cleanNip.length !== 10 || !/^\\d{10}$/.test(cleanNip)) return false;\n")
                        f.write("    const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];\n")
                        f.write("    let sum = 0;\n")
                        f.write("    for (let i = 0; i < 9; i++) sum += parseInt(cleanNip[i], 10) * weights[i];\n")
                        f.write("    const checkDigit = sum % 11;\n")
                        f.write("    return checkDigit === parseInt(cleanNip[9], 10) && checkDigit !== 10;\n")
                        f.write("}\n\n")
                        f.write("try {\n")
                        f.write("    const customConfig = localStorage.getItem('hdd_custom_shop_config');\n")
                        f.write("    if (customConfig) {\n")
                        f.write("        const parsed = JSON.parse(customConfig);\n")
                        f.write("        if (parsed.CATEGORIES) CATEGORIES = parsed.CATEGORIES;\n")
                        f.write("        if (parsed.CAT_DETAILS) CAT_DETAILS = parsed.CAT_DETAILS;\n")
                        f.write("        if (parsed.FILTER_OPTIONS) FILTER_OPTIONS = parsed.FILTER_OPTIONS;\n")
                        f.write("        if (parsed.PROMO_CODES) PROMO_CODES = parsed.PROMO_CODES;\n")
                        f.write("        if (parsed.SHOP_CONFIG) Object.assign(SHOP_CONFIG, parsed.SHOP_CONFIG);\n")
                        f.write("    }\n")
                        f.write("} catch(e) {}\n")
                    print(f"✅ Zapisano konfigurację sklepu do shop-config.js")

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"status": "ok", "message": "Zapisano zmiany na dysku"}')
                return

            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return

        super().do_POST()

if __name__ == "__main__":
    print(f"🚀 Uruchamianie serwera sklepu Narzędzia HDD PL na porcie {PORT}...")
    print(f"📂 Katalog: {DIRECTORY}")
    print(f"🌐 Sklep: http://localhost:{PORT}/index.html")
    print(f"⚙️  Panel Administratora (CMS): http://localhost:{PORT}/admin.html (Hasło/PIN: admin2026)")
    
    with socketserver.TCPServer(("", PORT), HDDShopHandler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nZatrzymano serwer.")
