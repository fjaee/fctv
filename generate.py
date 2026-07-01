import json
import urllib.request
import hashlib
import sys
import os
import re
import xml.etree.ElementTree as ET
import copy
from datetime import datetime, timezone, timedelta

# ── 0. Configuration ────────────────────────────────────────────────────────────
SOURCES = [
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zxnew.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zzzzteevee.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zhy.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/tgdb.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zradio.json"
]

EPG_SOURCES = [
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/alltv2.xml",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/kol.xml",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/kcha.xml",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/kapusostream.xml"
]

BACKUP_FILE = "channels-backup.json"
HASH_FILE = "channels.hash"
LOGOS_FILE = "logos.json"
EPG_FILE = "epg.xml"
MY_EPG_URL = "https://raw.githubusercontent.com/fjaee/fctv/master/epg.xml"

# ── 1. Fetch JSON Data ────────────────────────────────────────────────────────
fetched = []
for url in SOURCES:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
            data = raw.get("channels", raw) if isinstance(raw, dict) else raw
            if isinstance(data, list):
                fetched.extend(data)
    except Exception as e:
        print(f"[FAIL] Could not fetch {url.split('/')[-1]}: {e}")

# ── 2. Filter URLs (Drop blanks, .mp4, and bad links) ─────────────────────────
filtered_data = []

for ch in fetched:
    stream_url = ch.get("streamUrl", "").strip()
    
    # 2a. Fix intentional upstream typos (Anti-Leech)
    if stream_url.startswith("htps://"): 
        stream_url = stream_url.replace("htps://", "https://", 1)
    elif stream_url.startswith("htp://"): 
        stream_url = stream_url.replace("htp://", "http://", 1)
        
    ch["streamUrl"] = stream_url # Save the fixed URL back to the channel data
    
    # 2b. Strict Quality Filters
    if not stream_url:
        continue # Drop blanks
        
    if not stream_url.startswith("http"):
        continue # Drop raw YouTube IDs or malformed links
        
    if ".mp4" in stream_url.lower():
        continue # Drop static VOD files
        
    # If it survives the filters, keep it exactly as-is (preserves Pilipinas Live 1, 2, etc.)
    filtered_data.append(ch)

print(f"Data cleaned. Retained {len(filtered_data)} high-quality channels.")

# ── 3. EPG Aggregation & Duplication ──────────────────────────────────────────
root_tv = ET.Element("tv")
for url in EPG_SOURCES:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            tree = ET.fromstring(resp.read())
            for child in tree:
                root_tv.append(child)
    except Exception as e:
        print(f"Failed to fetch EPG {url.split('/')[-1]}: {e}")

DUPLICATE_MAP = {"alltv2": "Kapamilya Channel", "kapusostream": "GMA 7"}
new_elements = []
for elem in root_tv:
    if elem.tag == "channel":
        ch_id = elem.get("id", "").lower()
        for src, target in DUPLICATE_MAP.items():
            if src in ch_id:
                new_ch = copy.deepcopy(elem)
                new_ch.set("id", target)
                for dn in new_ch.findall('display-name'): dn.text = target
                new_elements.append(new_ch)
    elif elem.tag == "programme":
        prog_ch = elem.get("channel", "").lower()
        for src, target in DUPLICATE_MAP.items():
            if src in prog_ch:
                new_prog = copy.deepcopy(elem)
                new_prog.set("channel", target)
                new_elements.append(new_prog)
for n in new_elements: root_tv.append(n)

tree = ET.ElementTree(root_tv)
tree.write(EPG_FILE, encoding="utf-8", xml_declaration=True)

# ── 4. Load Logos ─────────────────────────────────────────────────────────────
tv_logo_map = {}
wiki_file_map = {}
if os.path.exists(LOGOS_FILE):
    with open(LOGOS_FILE, "r", encoding="utf-8") as f:
        logos = json.load(f)
        tv_logo_map = logos.get("TV_LOGO_MAP", {})
        wiki_file_map = logos.get("WIKI_FILE_MAP", {})

# ── 5. Build M3U ──────────────────────────────────────────────────────────────
def get_logo(ch):
    if "logo" in ch: return ch["logo"]
    ll = ch.get("logoLocal","")
    if ll in tv_logo_map: return tv_logo_map[ll]
    if ll in wiki_file_map: return f"https://en.wikipedia.org/wiki/Special:FilePath/{wiki_file_map[ll]}?width=400"
    return ""

def build_m3u_entry(ch):
    name = ch.get("name", "Unknown")
    category = ch.get("category", "General")
    logo = get_logo(ch)
    stream_url = ch.get("streamUrl", "")
    drm = ch.get("drm", None)
    headers = ch.get("headers", {})
    
    extinf = f'#EXTINF:-1 tvg-id="{name}" tvg-name="{name}" tvg-logo="{logo}" group-title="{category}",{name}'
    lines = [extinf]
    
    if drm:
        lines.append("#KODIPROP:inputstream=inputstream.adaptive")
        lines.append("#KODIPROP:inputstream.adaptive.manifest_type=mpd")
        lines.append("#KODIPROP:inputstream.adaptive.license_type=clearkey")
        if "keys" in drm:
            keys_out = [{"kty":"oct","k":k["k"].replace("+","-").replace("/","_").rstrip("="),"kid":k["kid"].replace("+","-").replace("/","_").rstrip("=")} for k in drm["keys"]]
            lines.append(f"#KODIPROP:inputstream.adaptive.license_key={json.dumps({'keys':keys_out,'type':'temporary'},separators=(',',':'))}")
        else:
            kid, key = next(iter(drm.items()))
            lines.append(f"#KODIPROP:inputstream.adaptive.license_key={kid}:{key}")
            
    ua = headers.get("User-Agent", "")
    if ua: stream_url = f"{stream_url}|User-Agent={ua}"
    
    lines.append(stream_url)
    return "\n".join(lines)

timestamp = datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S GMT+8")
m3u_header = f'#EXTM3U x-tvg-url="{MY_EPG_URL}"\n# Last Updated: {timestamp}'
m3u_all = [m3u_header] + [build_m3u_entry(ch) for ch in filtered_data]

with open("channels-all.m3u", "w", encoding="utf-8") as f:
    f.write("\n\n".join(m3u_all))