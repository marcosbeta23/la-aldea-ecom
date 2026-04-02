import requests
import xml.etree.ElementTree as ET

SITE = "https://laaldeatala.com.uy"
KEY = "9906a89364914aed991b38fadcb32a94"
KEY_LOCATION = f"{SITE}/{KEY}.txt"

# 1) Validar que la clave está publicada
k = requests.get(KEY_LOCATION, timeout=20)
print("Key status:", k.status_code, k.text.strip())

# 2) Extraer URLs del sitemap
sitemap = requests.get(f"{SITE}/sitemap.xml", timeout=30)
sitemap.raise_for_status()

root = ET.fromstring(sitemap.content)
ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
urls = [loc.text for loc in root.findall(".//sm:loc", ns) if loc.text]

# 3) Enviar a IndexNow
payload = {
    "host": "laaldeatala.com.uy",
    "key": KEY,
    "keyLocation": KEY_LOCATION,
    "urlList": urls
}

response = requests.post("https://api.indexnow.org/indexnow", json=payload, timeout=30)
print("IndexNow status:", response.status_code)
print("Response:", response.text)