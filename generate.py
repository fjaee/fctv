import json
import urllib.request
import os
from datetime import datetime

SOURCE_URL  = "https://raw.githubusercontent.com/noodtayo/app/refs/heads/main/channels.json"
BACKUP_FILE = "channels-backup.json"

# ── 1. Load backup (always exists in repo) ────────────────────────────────────
with open(BACKUP_FILE, "r", encoding="utf-8") as f:
    backup = json.load(f)
print(f"Backup loaded: {len(backup)} channels.")

# ── 2. Try fetching source ────────────────────────────────────────────────────
fetched = []
try:
    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        fetched = json.loads(resp.read().decode("utf-8"))
    print(f"Source fetched: {len(fetched)} channels.")
except Exception as e:
    print(f"Source unavailable ({e}). Using backup only.")

# ── 3. Merge logic: NEVER delete, only add/update ────────────────────────────
def merge_channels(fetched, backup):
    # Use channel name as stable key
    merged = {ch["name"]: ch for ch in backup}   # start from full backup

    for ch in fetched:
        name = ch["name"]
        if name in merged:
            # Update streamUrl if source has one
            if ch.get("streamUrl"):
                merged[name]["streamUrl"] = ch["streamUrl"]
            # Update DRM/ClearKeys if source has new ones
            if "drm" in ch:
                merged[name]["drm"] = ch["drm"]
            # Update headers if present
            if "headers" in ch:
                merged[name]["headers"] = ch["headers"]
        else:
            # Brand new channel — add it
            merged[name] = ch
            print(f"  [NEW] {name}")

    return list(merged.values())

data = merge_channels(fetched, backup)
print(f"Merged total: {len(data)} channels (backup: {len(backup)}, fetched: {len(fetched)}).")

# ── 4. Update backup with merged result (persists to repo) ───────────────────
if fetched:
    with open(BACKUP_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Backup updated with latest merged data.")
else:
    print("Source was empty/unavailable — backup unchanged, no channels removed.")

# ── 5. Logo maps ──────────────────────────────────────────────────────────────
BASE_NOODTAYO = "https://raw.githubusercontent.com/noodtayo/app/main/images/"
BASE_TVLOGO   = "https://raw.githubusercontent.com/tv-logo/tv-logos/main/countries/"
PH  = BASE_TVLOGO + "philippines/"
INT = BASE_TVLOGO + "international/"
AU  = BASE_TVLOGO + "australia/"
UK  = BASE_TVLOGO + "united-kingdom/"
US  = BASE_TVLOGO + "united-states/"
CA  = BASE_TVLOGO + "canada/"
MY  = BASE_TVLOGO + "malaysia/"
ASI = BASE_TVLOGO + "world-asia/"

NOODTAYO_REPO = {
    "ch_ani_blast","ch_astro_grandstand","ch_astro_showcase","ch_astro_showtime",
    "ch_boomerang","ch_ccm","ch_celestial_movies","ch_comedy_central",
    "ch_disney_xd","ch_espn","ch_f1_tv","ch_fight_plus","ch_game_show_network",
    "ch_gma_life_tv","ch_gma_news_tv","ch_gma_pinoy_tv","ch_kartoon_channel",
    "ch_pickle_tv","ch_starz","ch_tennis_channel_2","ch_tlc","ch_trace_urban",
    "ch_tv_maria","ch_zoomoo"
}

TV_LOGO_MAP = {
    "ch_kapamilya_channel":  "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Kapamilya_Channel_Logo_2020.svg/960px-Kapamilya_Channel_Logo_2020.svg.png?_=20260323175529",
    "ch_alltv2":             "https://static.wikia.nocookie.net/abscbn/images/9/94/Kapamilya_Channel_sa_ALLTV2.png/revision/latest/scale-to-width-down/1000?cb=20260110141630",
    "ch_gma7":               "https://upload.wikimedia.org/wikipedia/en/thumb/c/c0/GMA_Network_Logo_Vector.svg/1280px-GMA_Network_Logo_Vector.svg.png",
    "ch_kapatid_channel":    "https://static.wikia.nocookie.net/tv5network/images/8/8b/Kapatid_Channel_%282025%29.png/revision/latest/scale-to-width-down/1200?cb=20260129063212",
    "ch_pilipinas_live":     "https://pilipinaslive.com/assets/images/logo/pilipinaslive-logo-wbg.png",
    "ch_tv5":PH+"tv5-ph.png","ch_gtv":PH+"gtv-ph.png","ch_a2z":PH+"a2z-ph.png",
    "ch_ibc":PH+"ibc-ph.png","ch_ptv":PH+"ptv-ph.png","ch_net25":PH+"net25-ph.png",
    "ch_untv":PH+"untv-ph.png","ch_inctv":PH+"inc-tv-ph.png","ch_ewtn":PH+"ewtn-ph.png",
    "ch_smni":PH+"smni-ph.png","ch_rjtv_29":PH+"rj-tv-ph.png","ch_dzrh_tv":PH+"dzrh-tv-ph.png",
    "ch_cinema_one":PH+"cinema-one-ph.png","ch_cinemo":PH+"cine-mo-ph.png","ch_cinemax":PH+"cinemax-ph.png",
    "ch_hbo":PH+"hbo-ph.png","ch_hbo_hits":PH+"hbo-hits-ph.png","ch_hbo_family":PH+"hbo-family-ph.png",
    "ch_hbo_signature":PH+"hbo-signature-ph.png","ch_anc":PH+"anc-ph.png",
    "ch_dzmm_teleradyo":PH+"dzmm-teleradyo-ph.png","ch_one_news":PH+"one-news-ph.png",
    "ch_one_ph":PH+"one-ph-ph.png","ch_one_sports":PH+"one-sports-ph.png",
    "ch_one_sports_plus":PH+"one-sports-plus-ph.png","ch_pba_rush":PH+"pba-rush-ph.png",
    "ch_pbo":PH+"pinoy-box-office-ph.png","ch_premier_sports":PH+"premier-sports-ph.png",
    "ch_premier_sports_2":PH+"premier-sports-2-ph.png","ch_rptv":PH+"rptv-ph.png",
    "ch_sari_sari":PH+"sari-sari-channel-ph.png","ch_spotv":PH+"spotv-ph.png",
    "ch_spotv2":PH+"spotv2-ph.png","ch_tap_movies":PH+"tap-movies-ph.png",
    "ch_tap_sports":PH+"tap-sports-ph.png","ch_tmc":PH+"tmc-ph.png","ch_buko":PH+"buko-ph.png",
    "ch_nba_tv_philippines":PH+"nba-tv-philippines-ph.png","ch_tvn_movies_pinoy":PH+"tvn-movies-pinoy-ph.png",
    "ch_viva_cinema":PH+"viva-cinema-ph.png","ch_warner_tv":PH+"warner-tv-ph.png",
    "ch_knowledge_channel":PH+"knowledge-channel-ph.png","ch_solar_sports":PH+"solar-sports-ph.png",
    "ch_solarflix":PH+"solar-flix-ph.png","ch_kix":PH+"kix-ph.png","ch_aniplus":PH+"aniplus-ph.png",
    "ch_jeepney_tv":PH+"jeepney-tv-ph.png","ch_rock_action":PH+"rock-action-ph.png",
    "ch_celestial_movies_pinoy":PH+"celestial-movies-pinoy-ph.png",
    "ch_animal_planet":INT+"animal-planet-int.png","ch_arirang":INT+"arirang-int.png",
    "ch_bbc_news":INT+"bbc-world-news-int.png","ch_cartoon_network":INT+"cartoon-network-int.png",
    "ch_cna":INT+"cna-int.png","ch_cnn":INT+"cnn-international-int.png",
    "ch_dazn_combat":INT+"dazn-int.png","ch_dazn_ringside":INT+"dazn-int.png",
    "ch_disney_channel":INT+"disney-channel-int.png","ch_dreamworks":INT+"dreamworks-tv-int.png",
    "ch_fashion_tv":INT+"fashion-tv-int.png","ch_bloomberg":INT+"bloomberg-television-int.png",
    "ch_nat_geo":INT+"national-geographic-int.png","ch_nat_geo_wild":INT+"national-geographic-wild-int.png",
    "ch_nickelodeon":INT+"nickelodeon-int.png","ch_nick_jr":INT+"nick-jr-int.png",
    "ch_nhk_world_japan":INT+"nhk-world-japan-int.png","ch_discovery_asia":INT+"discovery-asia-int.png",
    "ch_afn":INT+"asian-food-network-int.png","ch_kbs_world":INT+"kbs-world-int.png",
    "ch_disney_jr":INT+"disney-jr-int.png","ch_cartoonito":INT+"cartoonito-int.png",
    "ch_animax":INT+"animax-int.png","ch_anime_x_hidive":INT+"hidive-int.png","ch_axn":INT+"axn-int.png",
    "ch_love_nature":INT+"love-nature-int.png","ch_tvn":INT+"tvn-int.png",
    "ch_tvn_movies":INT+"tvn-movies-int.png","ch_bein_sports_1":INT+"bein-sports-1-int.png",
    "ch_bein_sports_2":INT+"bein-sports-2-int.png","ch_bein_sports_3":INT+"bein-sports-3-int.png",
    "ch_one_championship":INT+"one-championship-int.png","ch_fifa_plus":INT+"fifa-plus-int.png",
    "ch_bbc_earth":AU+"bbc-earth-au.png","ch_discovery":AU+"discovery-channel-au.png",
    "ch_crime_investigation":AU+"crime-and-investigation-au.png","ch_adult_swim":AU+"adult-swim-au.png",
    "ch_abc_australia":AU+"abc-au.png","ch_cbeebies":AU+"bbc-cbeebies-au.png",
    "ch_al_jazeera":UK+"al-jazeera-uk.png","ch_sky_sports_f1":UK+"sky-sports-f1-uk.png",
    "ch_tnt_sports_1":UK+"tnt-sports-1-uk.png","ch_tnt_sports_2":UK+"tnt-sports-2-uk.png",
    "ch_tnt_sports_3":UK+"tnt-sports-3-uk.png","ch_tnt_sports_4":UK+"tnt-sports-4-uk.png",
    "ch_eurosport_1":UK+"eurosport-1-uk.png","ch_eurosport_2":UK+"eurosport-2-uk.png",
    "ch_hgtv":US+"hgtv-us.png","ch_food_network":US+"food-network-us.png",
    "ch_history":US+"history-us.png","ch_lifetime":US+"lifetime-us.png",
    "ch_trutv":US+"trutv-us.png","ch_true_tv":US+"trutv-us.png",
    "ch_travel_channel":US+"travel-channel-us.png","ch_nba_tv":US+"nba-tv-us.png",
    "ch_nfl_network":US+"nfl-network-us.png","ch_cnbc":US+"cnbc-us.png",
    "ch_ytv":CA+"ytv-ca.png","ch_moonbug":MY+"moonbug-kids-my.png",
    "ch_hits":ASI+"hits-asi.png","ch_hits_movies":ASI+"hits-movies-asi.png",
    "ch_rock_x_stream":ASI+"rock-entertainment-asi.png",
}

WIKI_FILE_MAP = {
    "ch_star_movies":"Star_Movies_logo.svg","ch_star_movies_select":"Star_Movies_Select_logo.png",
    "ch_movies_now":"Movies_Now_Logo.png","ch_bnc":"Bilyonaryo_News_Channel_logo.png",
    "ch_deped_tv":"DepEd_TV_logo.png","ch_hits_now":"HITS_Now_logo.png",
    "ch_thrill":"THRILL_Channel_PH.png","ch_varsity_channel":"UAAP_Varsity_Channel_logo.png",
    "ch_wil_tv":"Wil_TV_logo.png","ch_myx":"MYX_logo_2021.svg","ch_tfc":"The_Filipino_Channel_logo.svg",
    "ch_light_tv":"Light_TV_logo.png","ch_mindanow_network":"Mindanow_Network_logo.png",
    "ch_living_asia_channel":"Living_Asia_Channel_logo.png","ch_metro_channel":"Metro_Channel_PH_logo.png",
    "ch_amc_presents":"AMC_logo_2016.svg","ch_moviesphere":"Moviesphere_logo.png",
    "ch_wild_earth":"Wild_Earth_channel_logo.png","ch_new_k_pop":"K-pop_logo.png",
    "ch_vevo_pop":"Vevo_logo.svg","ch_one":"ONE_TV_Philippines.png",
    "ch_tennis_plus":"Tennis_Channel_logo.svg","ch_k_plus":"K%2B_channel_logo.png",
    "ch_abante_radyo":"No_image_available.svg",
}

# ── 6. Helper functions ───────────────────────────────────────────────────────
def get_logo(ch):
    if "logo" in ch: return ch["logo"]
    ll = ch.get("logoLocal","")
    if ll in NOODTAYO_REPO: return BASE_NOODTAYO + ll + ".webp"
    if ll in TV_LOGO_MAP:   return TV_LOGO_MAP[ll]
    if ll in WIKI_FILE_MAP: return f"https://en.wikipedia.org/wiki/Special:FilePath/{WIKI_FILE_MAP[ll]}?width=400"
    return ""

def build_m3u_entry(ch):
    name=ch.get("name","Unknown"); category=ch.get("category","General")
    logo=get_logo(ch); stream_url=ch.get("streamUrl","")
    drm=ch.get("drm",None); headers=ch.get("headers",{})
    extinf=f'#EXTINF:-1 tvg-name="{name}" tvg-logo="{logo}" group-title="{category}",{name}'
    lines=[extinf]
    if drm:
        lines.append("#KODIPROP:inputstream=inputstream.adaptive")
        lines.append("#KODIPROP:inputstream.adaptive.manifest_type=mpd")
        lines.append("#KODIPROP:inputstream.adaptive.license_type=clearkey")
        if "keys" in drm:
            keys_out=[]
            for key in drm["keys"]:
                k=key["k"].replace("+","-").replace("/","_").rstrip("=")
                kid=key["kid"].replace("+","-").replace("/","_").rstrip("=")
                keys_out.append({"kty":"oct","k":k,"kid":kid})
            license_key=json.dumps({"keys":keys_out,"type":"temporary"},separators=(",",":"))
            lines.append(f"#KODIPROP:inputstream.adaptive.license_key={license_key}")
        else:
            kid,key=next(iter(drm.items()))
            lines.append(f"#KODIPROP:inputstream.adaptive.license_key={kid}:{key}")
    ua=headers.get("User-Agent","")
    if ua: stream_url=f"{stream_url}|User-Agent={ua}"
    lines.append(stream_url)
    return "\n".join(lines)

# ── 7. Build and save M3U files ───────────────────────────────────────────────
timestamp  = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
m3u_header = f'#EXTM3U\n# Last Auto-Update: {timestamp}'

drm_channels = [ch for ch in data if "drm" in ch]

m3u_drm = [m3u_header] + [build_m3u_entry(ch) for ch in drm_channels]
with open("channels-drm.m3u","w",encoding="utf-8") as f:
    f.write("\n\n".join(m3u_drm))

m3u_all = [m3u_header] + [build_m3u_entry(ch) for ch in data]
with open("channels-all.m3u","w",encoding="utf-8") as f:
    f.write("\n\n".join(m3u_all))

print(f"channels-all.m3u  → {len(data)} channels")
print(f"channels-drm.m3u  → {len(drm_channels)} channels")
print(f"Timestamp: {timestamp}")
