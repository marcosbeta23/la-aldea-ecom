import requests
import xml.etree.ElementTree as ET

SITE = "https://laaldeatala.com.uy"
KEY = "9906a89364914aed991b38fadcb32a94"
KEY_LOCATION = f"{SITE}/{KEY}.txt"

# 1) Validar que la clave está publicada
k = requests.get(KEY_LOCATION, timeout=20)
print("Key status:", k.status_code, k.text.strip())

# MEJORA: detener si la key no es accesible
if k.status_code != 200 or k.text.strip() != KEY:
    print("❌ Key no accesible o contenido incorrecto — abortando")
    exit(1)

# 2) Extraer URLs del sitemap (MEJORA: manejar sitemap index)
def get_all_urls(sitemap_url):
    r = requests.get(sitemap_url, timeout=30)
    r.raise_for_status()
    root = ET.fromstring(r.content)
    
    # Detectar si es un sitemap index
    ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    sitemaps = root.findall(".//sm:sitemap/sm:loc", ns)
    
    if sitemaps:
        # Es un sitemap index — recursivo
        all_urls = []
        for sm in sitemaps:
            all_urls.extend(get_all_urls(sm.text))
        return all_urls
    else:
        # Es un sitemap regular
        return [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]

urls = get_all_urls(f"{SITE}/sitemap.xml")

# MEJORA: filtrar URLs que ya tienen noindex (no vale la pena submitear)
urls = [u for u in urls if "?q=" not in u and "?marca=" not in u and "?stock=" not in u]

print(f"Total URLs a enviar: {len(urls)}")

# 3) Enviar a IndexNow (en chunks de 10,000 — límite de la API)
def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i+n]

for chunk in chunks(urls, 10000):
    payload = {
        "host": "laaldeatala.com.uy",
        "key": KEY,
        "keyLocation": KEY_LOCATION,
        "urlList": chunk
    }
    response = requests.post("https://api.indexnow.org/indexnow", json=payload, timeout=30)
    print(f"IndexNow status: {response.status_code} — {len(chunk)} URLs enviadas")
    print("Response:", response.text)