import os
import re
import sys
import json
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageOps, ImageEnhance
import urllib.parse

# Configure output to support Polish characters
sys.stdout.reconfigure(encoding='utf-8')

# Target category mapping
CATEGORY_MAP = {
    'chwytaki': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/chwytaki-do-rur/',
    'glowice-obudowy': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/glowice-obudowy-sondy/',
    'kretliki': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/kretliki-hdd/',
    'plyty-pletwy': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/plytki-i-pletwy-wiercace/',
    'rolki': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/rolki-do-rur/',
    'rozwiertaki': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/rozwiertaki/',
    'sondy-lokalizacja': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/sondy-i-systemy-lokalizacyjne/',
    'zerdzie': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/zerdzie-wiertnicze/',
    'zeby': 'https://mp-technik.com.pl/kategoria-produktu/narzedzia-wiertnicze-hdd/zeby/'
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

IMAGES_DIR = "images"
os.makedirs(IMAGES_DIR, exist_ok=True)

def process_image(img_url, sku):
    if not img_url or img_url == 'No image':
        return 'images/rozwieracz_skrzydlowy.png' # Fallback
    
    try:
        # Download image
        print(f"Downloading image: {img_url}")
        r = requests.get(img_url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            return 'images/rozwieracz_skrzydlowy.png'
            
        # Get extension
        ext = ".jpg"
        if ".png" in img_url.lower():
            ext = ".png"
            
        local_filename = f"images/{sku.lower()}{ext}"
        temp_path = local_filename + ".tmp"
        
        with open(temp_path, "wb") as f:
            f.write(r.content)
            
        # Transform image to differ from original
        with Image.open(temp_path) as img:
            # 1. Flip horizontal
            transformed = ImageOps.mirror(img)
            # 2. Adjust brightness slightly (e.g. 0.97)
            enhancer = ImageEnhance.Brightness(transformed)
            transformed = enhancer.enhance(0.97)
            
            # Save transformed image
            transformed.save(local_filename)
            
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)
            
        print(f"Saved transformed image to: {local_filename}")
        return local_filename
    except Exception as e:
        print(f"Error processing image {img_url}: {e}")
        return 'images/rozwieracz_skrzydlowy.png'

def parse_price(price_text):
    # Regex to find numbers in format 3.965,77 or 4500,00
    prices = re.findall(r'[\d\.\s]+,\d{2}', price_text)
    net_val = 0.0
    gross_val = 0.0
    
    clean_prices = []
    for p in prices:
        # Remove spaces, replace dot with nothing, replace comma with dot
        clean_p = p.replace(" ", "").replace("\xa0", "").replace(".", "").replace(",", ".")
        try:
            clean_prices.append(float(clean_p))
        except ValueError:
            pass
            
    if len(clean_prices) >= 2:
        # Assume smaller is net, larger is gross, or follow labels
        clean_prices.sort()
        net_val = clean_prices[0]
        gross_val = clean_prices[1]
    elif len(clean_prices) == 1:
        gross_val = clean_prices[0]
        net_val = round(gross_val / 1.23, 2)
        
    return net_val, gross_val

def generate_sku(title, category_id, parsed_sku):
    if parsed_sku and parsed_sku != 'No SKU':
        # Add HDD- prefix if not already present
        if not parsed_sku.startswith("HDD-"):
            return f"HDD-{parsed_sku}"
        return parsed_sku
        
    # Generate based on title and category
    title_slug = re.sub(r'[^a-zA-Z0-9\s]', '', title)
    words = title_slug.split()
    sku_parts = []
    
    # Prefix based on category
    cat_prefixes = {
        'chwytaki': 'CH',
        'glowice-obudowy': 'GL',
        'kretliki': 'KR',
        'plyty-pletwy': 'PL',
        'rolki': 'RL',
        'rozwiertaki': 'RE',
        'sondy-lokalizacja': 'SN',
        'zerdzie': 'ZE',
        'zeby': 'ZB'
    }
    sku_parts.append(cat_prefixes.get(category_id, 'X'))
    
    # Try to find dimension (like 315, 250, 2 7/8, etc)
    dimensions = re.findall(r'\d+', title)
    if dimensions:
        sku_parts.append(dimensions[0])
    else:
        # Use first letters of first 2 words
        sku_parts.append("".join([w[0].upper() for w in words[:2] if w]))
        
    generated = f"HDD-{'_'.join(sku_parts)}"
    return generated

def get_product_details(url, category_id):
    print(f"Scraping PDP: {url}")
    try:
        r = requests.get(url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            return None
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Title
        title_el = soup.select_one('.product_title, h1')
        if not title_el:
            return None
        title = title_el.text.strip()
        
        # Price
        price_el = soup.select_one('.summary .price, .summary p.price')
        price_text = price_el.text.strip() if price_el else ''
        net_price, gross_price = parse_price(price_text)
        
        # SKU
        sku_el = soup.select_one('.sku')
        parsed_sku = sku_el.text.strip() if sku_el else 'No SKU'
        sku = generate_sku(title, category_id, parsed_sku)
        
        # Image
        img_el = soup.select_one('.woocommerce-product-gallery__image img, img[class*="wp-post-image"]')
        img_url = img_el['src'] if img_el else 'No image'
        local_img = process_image(img_url, sku)
        
        # Description
        # We can extract text from tab-description, or short-description, or entry-content
        desc_el = soup.select_one('#tab-description')
        if not desc_el:
            desc_el = soup.select_one('.woocommerce-product-details__short-description')
        if not desc_el:
            desc_el = soup.select_one('.entry-content')
            
        desc = ""
        if desc_el:
            # Get clean HTML paragraphs or text
            paragraphs = []
            for p in desc_el.find_all(['p', 'li']):
                txt = p.text.strip()
                if txt and len(txt) > 15 and "regulamin" not in txt.lower():
                    paragraphs.append(txt)
            desc = " ".join(paragraphs[:3]) # First 3 good sentences
            
        if not desc or len(desc) < 10:
            desc = f"Wysokiej klasy {title.lower()} przeznaczony do profesjonalnych zastosowań przy przewiertach sterowanych HDD. Gwarantuje niezawodność w trudnych warunkach gruntowych."
            
        # Specs
        specs = {}
        spec_table = soup.select_one('.shop_attributes')
        if spec_table:
            for row in spec_table.select('tr'):
                th = row.select_one('th')
                td = row.select_one('td')
                if th and td:
                    specs[th.text.strip()] = td.text.strip()
                    
        # Thread detection if not in specs
        thread = ""
        thread_match = re.search(r'\d\s?\d/\d\s?\"\s?[a-zA-Z\s]+', title)
        if thread_match:
            thread = thread_match.group(0).strip()
            
        stock_status = "W magazynie"
        badge = "W magazynie"
        badgeClass = "badge-success"
        
        if gross_price == 0:
            gross_price = 1200.00 # fallback
            net_price = round(gross_price / 1.23, 2)
            stock_status = "Na zamówienie"
            badge = "Na zamówienie"
            badgeClass = "bg-stone text-canvas text-[11px] font-bold leading-[1.33] rounded-full py-1 px-2.5 inline-block"
            
        return {
            "sku": sku,
            "name": title,
            "price": gross_price,
            "image": local_img,
            "categories": [category_id],
            "thread": thread,
            "stock": stock_status,
            "badge": badge,
            "badgeClass": badgeClass,
            "description": desc,
            "specs": specs
        }
    except Exception as e:
        print(f"Error scraping PDP {url}: {e}")
        return None

def scrape_category(category_id, cat_url):
    print(f"Scraping category: {category_id} -> {cat_url}")
    try:
        r = requests.get(cat_url, headers=HEADERS, timeout=15)
        if r.status_code != 200:
            print(f"Failed to fetch category page: {cat_url}")
            return []
            
        soup = BeautifulSoup(r.text, 'html.parser')
        
        # Find product links directly on the page
        product_links = set()
        for a in soup.find_all('a', href=True):
            href = a['href']
            if '/produkt/' in href:
                product_links.add(href)
                
        # Find subcategories if any
        subcat_links = set()
        for a in soup.find_all('a', href=True):
            href = a['href']
            # Subcategory links contain the base category URL but are deeper
            if href.startswith(cat_url) and href != cat_url:
                subcat_links.add(href)
                
        print(f"Direct products: {len(product_links)}, Subcategories: {len(subcat_links)}")
        
        # If not enough products, crawl subcategories
        if len(product_links) < 5:
            for sub_url in list(subcat_links):
                if len(product_links) >= 8: # Gather a few more to be safe
                    break
                print(f"Crawling subcategory: {sub_url}")
                try:
                    sub_r = requests.get(sub_url, headers=HEADERS, timeout=15)
                    if sub_r.status_code == 200:
                        sub_soup = BeautifulSoup(sub_r.text, 'html.parser')
                        for a in sub_soup.find_all('a', href=True):
                            href = a['href']
                            if '/produkt/' in href:
                                product_links.add(href)
                except Exception as e:
                    print(f"Error crawling subcat {sub_url}: {e}")
                    
        # Limit to 5 products and scrape them
        collected = []
        product_links = list(product_links)
        print(f"Total product links found for {category_id}: {len(product_links)}. Scrapping first 5.")
        
        for plink in product_links[:5]:
            p_details = get_product_details(plink, category_id)
            if p_details:
                collected.append(p_details)
                
        return collected
    except Exception as e:
        print(f"Error scraping category {category_id}: {e}")
        return []

def main():
    all_products = []
    
    # Keep the reference model
    reference_model = {
        "sku": 'HDD-SK-350',
        "name": 'Rozwieracz Skrzydłowy HDD Standard 350mm',
        "price": 6150.00,
        "image": 'images/rozwieracz_skrzydlowy.png',
        "categories": ['rozwiertaki'],
        "thread": '2 7/8" IF',
        "stock": 'W magazynie',
        "badge": 'W magazynie',
        "badgeClass": 'badge-success',
        "description": "Rozwieracz Skrzydłowy HDD Standard o średnicy 350mm to solidne narzędzie wiertnicze zaprojektowane dla wiertnic kierunkowych, idealne do poszerzania otworów w gruntach piaszczystych i gliniastych.",
        "specs": {
            "Średnica zewnętrzna": "350 mm",
            "Typ gwintu": "2 7/8\" IF",
            "Zbrojenie": "Węglik spiekany",
            "Waga": "55 kg"
        }
    }
    all_products.append(reference_model)
    
    # Scrape each mapped category
    for cat_id, cat_url in CATEGORY_MAP.items():
        products = scrape_category(cat_id, cat_url)
        all_products.extend(products)
        print(f"Finished {cat_id}: gathered {len(products)} products.")
        
    # Remove duplicates by SKU
    seen_skus = set()
    unique_products = []
    for p in all_products:
        if p["sku"] not in seen_skus:
            seen_skus.add(p["sku"])
            unique_products.append(p)
            
    # Write out products.js
    output_path = "products.js"
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("const PRODUCTS = ")
        json.dump(unique_products, f, ensure_ascii=False, indent=4)
        f.write(";\n")
        
    print(f"Successfully generated products.js with {len(unique_products)} unique products!")

if __name__ == "__main__":
    main()
