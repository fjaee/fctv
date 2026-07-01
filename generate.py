import json
import urllib.request
import hashlib
import sys
import os
from datetime import datetime, timezone, timedelta

# ── 0. Configuration ────────────────────────────────────────────────────────────
SOURCES = [
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zxnew.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zzzzteevee.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zhy.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/tgdb.json",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/zradio.json"
]

# TiviMate accepts multiple EPGs if comma-separated. We list the raw URLs here.
EPG_URLS = [
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/alltv2.xml",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/kol.xml",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/kcha.xml",
    "https://raw.githubusercontent.com/eyhehez/ugh/main/epg/kapusostream.xml"
]

BACKUP_FILE = "channels-backup.json"
HASH_FILE = "channels.hash"
LOGOS_FILE = "logos.json"

# ── 1. Load Backup ────────────────────────────────────────────────────────────
backup = []
if os.path.exists(BACKUP_FILE):
    with open(BACKUP_FILE, "r", encoding="utf-8") as f:
        backup = json.load(f)
print(f"Backup loaded: {len(backup)} channels.")

# ── 2. Load Logos ─────────────────────────────────────────────────────────────
tv_logo_map = {}
wiki_file_map = {}
if os.path.exists(LOGOS_FILE):
    with open(LOGOS_FILE, "r", encoding="utf-8") as f:
        logos = json.load(f)
        tv_logo_map = logos.get("TV_LOGO_MAP", {})
        wiki_file_map = logos.get("WIKI_FILE_MAP", {})
else:
    print(f"Warning: {LOGOS_FILE} not found. Logos may not render.")

# ── 3. Fetch All New Sources ──────────────────────────────────────────────────
fetched = []
for url in SOURCES:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
            data = raw.get("channels", raw) if isinstance(raw, dict) else raw
            
            if isinstance(data, list):
                fetched.extend(data)
                print(f" [OK] Fetched {len(data)} channels from {url.split('/')[-1]}")
            else:
                print(f" [WARN] Invalid format in {url.split('/')[-1]}")
    except Exception as e:
        print(f" [FAIL] Could not fetch {url.split('/')[-1]}: {e}")

if not fetched:
    print("All sources unavailable. Using backup only.")
else:
    print(f"Total source channels fetched: {len(fetched)}.")

# ── 4. Merge Logic ────────────────────────────────────────────────────────────
def merge_channels(fetched, backup):
    merged = {ch["name"]: ch for ch in backup}
    for ch in fetched:
        name = ch["name"]
        if name in merged:
            if ch.get("streamUrl"): merged[name]["streamUrl"] = ch["streamUrl"]
            if "drm" in ch: merged[name]["drm"] = ch["drm"]
            if "headers" in ch: merged[name]["headers"] = ch["headers"]
            if "logoLocal" in ch and "logoLocal" not in merged[name]:
                merged[name]["logoLocal"] = ch["logoLocal"]
            if "category" in ch: merged[name]["category"] = ch["category"]
        else:
            merged[name] = ch
            print(f" [NEW] {name}")
    return list(merged.values())

data = merge_channels(fetched, backup)
print(f"Merged total: {len(data)} channels.")

# ── 5. Hash Check ─────────────────────────────────────────────────────────────
def compute_hash(channels):
    fingerprint = json.dumps(
        sorted([
            {
                "n": ch.get("name",""),
                "u": ch.get("streamUrl",""),
                "d": ch.get("drm",""),
                "h": ch.get("headers",""),
            } for ch in channels
        ], key=lambda x: x["n"]),
        sort_keys=True, separators=(",",":")
    )
    return hashlib.sha256(fingerprint.encode()).hexdigest()

new_hash = compute_hash(data)
old_hash = ""
try:
    with open(HASH_FILE, "r") as f:
        old_hash = f.read().strip()
except FileNotFoundError:
    pass

if new_hash == old_hash:
    print("No channel changes detected. Skipping M3U regeneration.")
    sys.exit(0)

print(f"Changes detected! Regenerating M3U files...")

# ── 6. Update Backup ──────────────────────────────────────────────────────────
if fetched:
    with open(BACKUP_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Backup updated with latest merged data.")

# ── 7. Helper Functions ───────────────────────────────────────────────────────
def get_logo(ch):
    if "logo" in ch: return ch["logo"]
    ll = ch.get("logoLocal","")
    if ll in tv_logo_map: return tv_logo_map[ll]
    if ll in wiki_file_map: return f"https://en.wikipedia.org/wiki/Special:FilePath/{wiki_file_map[ll]}?width=400"
    return ""

def build_m3u_entry(ch):
    name = ch.get("name","Unknown")
    category = ch.get("category","General")
    logo = get_logo(ch)
    stream_url = ch.get("streamUrl","")
    drm = ch.get("drm",None)
    headers = ch.get("headers",{})
    
    # EPG mapper fallback logic
    tvg_id = ch.get("tvg-id", ch.get("epg_id", name))
    
    extinf = f'#EXTINF:-1 tvg-id="{tvg_id}" tvg-name="{name}" tvg-logo="{logo}" group-title="{category}",{name}'
    lines = [extinf]
    
    if drm:
        lines.append("#KODIPROP:inputstream=inputstream.adaptive")
        lines.append("#KODIPROP:inputstream.adaptive.manifest_type=mpd")
        lines.append("#KODIPROP:inputstream.adaptive.license_type=clearkey")
        if "keys" in drm:
            keys_out=[]
            for key in drm["keys"]:
                k = key["k"].replace("+","-").replace("/","_").rstrip("=")
                kid = key["kid"].replace("+","-").replace("/","_").rstrip("=")
                keys_out.append({"kty":"oct","k":k,"kid":kid})
            license_key = json.dumps({"keys":keys_out,"type":"temporary"},separators=(",",":"))
            lines.append(f"#KODIPROP:inputstream.adaptive.license_key={license_key}")
        else:
            kid, key = next(iter(drm.items()))
            lines.append(f"#KODIPROP:inputstream.adaptive.license_key={kid}:{key}")
            
    ua = headers.get("User-Agent","")
    if ua: stream_url = f"{stream_url}|User-Agent={ua}"
    
    lines.append(stream_url)
    return "\n".join(lines)

# ── 8. Build and Save M3U ─────────────────────────────────────────────────────
timestamp = datetime.now(timezone.utc).astimezone(timezone(timedelta(hours=8))).strftime("%Y-%m-%d %H:%M:%S GMT+8")

# Join EPG URLs with commas for TiviMate
epg_string = ",".join(EPG_URLS)
m3u_header = f'#EXTM3U x-tvg-url="{epg_string}"\n# Last Updated: {timestamp}'

m3u_all = [m3u_header] + [build_m3u_entry(ch) for ch in data]
with open("channels-all.m3u", "w", encoding="utf-8") as f:
    f.write("\n\n".join(m3u_all))

# ── 9. Save Hash ──────────────────────────────────────────────────────────────
with open(HASH_FILE, "w") as f:
    f.write(new_hash)

# ── 10. Commit Message ────────────────────────────────────────────────────────
fetched_names = {ch["name"] for ch in fetched}
backup_names = {ch["name"] for ch in backup}
added_channels = fetched_names - backup_names
updated_channels = [
    ch["name"] for ch in fetched 
    if ch["name"] in backup_names and ch.get("streamUrl","") != next((c.get("streamUrl","") for c in backup if c["name"] == ch["name"]), "")
]

commit_msg = (
    f"[{timestamp}]\n"
    f"Total: {len(data)} channels | "
    f"New: {len(added_channels)} | "
    f"Updated: {len(updated_channels)}"
)
with open("commit_msg.txt", "w") as f:
    f.write(commit_msg)

print(f"channels-all.m3u → {len(data)} channels")
print(f"New: {len(added_channels)} | Updated: {len(updated_channels)}")
print(f"Hash updated: {new_hash[:12]}...")