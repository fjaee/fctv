import type { Channel, RawChannel, LogoMap } from "./types";

const M3U_URL = "https://raw.githubusercontent.com/fjaee/fctv/refs/heads/master/channels-all.m3u";
const JSON_URL = "https://raw.githubusercontent.com/fjaee/fctv/master/channels-backup.json";
const LOGOS_URL = "https://raw.githubusercontent.com/fjaee/fctv/master/logos.json";

export async function fetchLogos(): Promise<LogoMap> {
  try {
    const res = await fetch(LOGOS_URL);
    if (!res.ok) throw new Error(`logos ${res.status}`);
    return (await res.json()) as LogoMap;
  } catch (e) {
    console.error("Failed to fetch logos:", e);
    return { TV_LOGO_MAP: {}, WIKI_FILE_MAP: {} };
  }
}

/* ===== M3U Parser ===== */

interface M3uEntry {
  name: string;
  logo: string;
  category: string;
  url: string;
  headers: Record<string, string>;
  drmKey?: string;
  drmJson?: string;
}

function parseM3U(content: string): M3uEntry[] {
  const lines = content.split(/\r?\n/);
  const entries: M3uEntry[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    if (!line.startsWith("#EXTINF")) { i++; continue; }

    const logoMatch = line.match(/tvg-logo="([^"]*)"/);
    const groupMatch = line.match(/group-title="([^"]*)"/);
    const nameMatch = line.match(/,(.+)$/);
    const name = nameMatch ? nameMatch[1].trim() : "";
    const logo = logoMatch ? logoMatch[1].trim() : "";
    const category = groupMatch ? groupMatch[1].trim() : "General";

    // Collect KODIPROP lines between EXTINF and the URL
    let drmKey: string | undefined;
    let drmJson: string | undefined;
    let j = i + 1;
    while (j < lines.length && lines[j].trim().startsWith("#KODIPROP")) {
      const prop = lines[j].trim();
      const keyMatch = prop.match(/inputstream\.adaptive\.license_key=(.+)/);
      if (keyMatch) {
        const val = keyMatch[1].trim();
        if (val.startsWith("{")) drmJson = val;
        else drmKey = val;
      }
      j++;
    }

    // The URL line
    if (j < lines.length && !lines[j].trim().startsWith("#")) {
      const rawUrl = lines[j].trim();
      // Split pipe-delimited headers: url|User-Agent=...|Referer=...
      const parts = rawUrl.split("|");
      const url = parts[0].trim();
      const headers: Record<string, string> = {};
      for (let p = 1; p < parts.length; p++) {
        const eq = parts[p].indexOf("=");
        if (eq > 0) {
          const hk = parts[p].slice(0, eq).trim();
          const hv = parts[p].slice(eq + 1).trim();
          headers[hk] = hv;
        }
      }

      if (url && !url.startsWith("#") && (url.startsWith("http") || url.startsWith("htp"))) {
        entries.push({ name, logo, category, url, headers, drmKey, drmJson });
      }
    }
    i = j + 1;
  }
  return entries;
}

export async function fetchM3U(): Promise<M3uEntry[]> {
  const res = await fetch(M3U_URL);
  if (!res.ok) throw new Error(`m3u ${res.status}`);
  const text = await res.text();
  return parseM3U(text);
}

export async function fetchJSONChannels(): Promise<RawChannel[]> {
  try {
    const res = await fetch(JSON_URL);
    if (!res.ok) throw new Error(`json ${res.status}`);
    const raw = await res.json();
    return (raw as RawChannel[]).filter((c) => c && c.name && c.streamUrl);
  } catch (e) {
    console.error("Failed to fetch JSON fallback:", e);
    return [];
  }
}

/* ===== URL fixing ===== */

function fixUrl(url: string): string {
  let u = url.trim();
  if (u.startsWith("htps://")) u = "https://" + u.slice(7);
  else if (u.startsWith("htp://")) u = "http://" + u.slice(6);
  return u;
}

function extractHeaders(rawHeaders: RawChannel["headers"]): Record<string, string> {
  if (!rawHeaders) return {};
  const out: Record<string, string> = {};
  const ua = rawHeaders["User-Agent"];
  if (ua) {
    const parts = ua.split("&");
    out["User-Agent"] = parts[0] || "";
    for (let i = 1; i < parts.length; i++) {
      const eq = parts[i].indexOf("=");
      if (eq > 0) out[parts[i].slice(0, eq)] = parts[i].slice(eq + 1);
    }
  }
  return out;
}

function classifyStream(url: string, hasDrm: boolean): Channel["playableType"] {
  const lower = url.toLowerCase();
  if (hasDrm) return "drm";
  if (lower.includes(".m3u8")) return "hls";
  if (lower.includes(".mpd")) return "dash";
  return "other";
}

/* ===== Logo resolution ===== */

// Build a name-to-key index from logos.json keys at load time
function buildNameIndex(logos: LogoMap): Map<string, string> {
  const index = new Map<string, string>();
  const allKeys = new Set([...Object.keys(logos.TV_LOGO_MAP), ...Object.keys(logos.WIKI_FILE_MAP)]);

  for (const key of allKeys) {
    // ch_animax -> "animax", "amc" -> "amc"
    const cleanKey = key.replace(/^ch_/, "").replace(/_/g, " ").trim();
    index.set(cleanKey.toLowerCase(), key);
  }
  return index;
}

// Local images that ship in /images/
const LOCAL_IMAGE_KEYS = [
  "ch_ani_blast", "ch_astro_grandstand", "ch_astro_showcase", "ch_astro_showtime",
  "ch_blast_movies", "ch_boomerang", "ch_ccm", "ch_celestial_movies", "ch_comedy_central",
  "ch_disney_xd", "ch_espn", "ch_f1_tv", "ch_fight_plus", "ch_france_24",
  "ch_game_show_network", "ch_gma_life_tv", "ch_gma_news_tv", "ch_gma_pinoy_tv",
  "ch_kartoon_channel", "ch_mnplus", "ch_mnx_hd", "ch_pickle_tv", "ch_pop",
  "ch_romedy_now", "ch_sony_movies", "ch_starz", "ch_tennis_channel_2", "ch_tlc",
  "ch_trace_urban", "ch_tv_maria", "ch_zee_sine", "ch_zoomoo",
];

function tryLocalImage(name: string): string {
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  // Direct match
  const directKey = `ch_${normalized}`;
  if (LOCAL_IMAGE_KEYS.includes(directKey)) return `/images/${directKey}.webp`;
  // Fuzzy: try partial matches
  for (const key of LOCAL_IMAGE_KEYS) {
    const keyClean = key.replace(/^ch_/, "").replace(/_/g, "");
    const nameClean = normalized.replace(/_/g, "");
    if (nameClean.length > 3 && (keyClean.includes(nameClean) || nameClean.includes(keyClean))) {
      return `/images/${key}.webp`;
    }
  }
  return "";
}

function resolveLogo(
  name: string,
  tvgLogo: string,
  logoLocal: string | undefined,
  logos: LogoMap,
  nameIndex: Map<string, string>
): string {
  // 1. Direct tvg-logo from M3U if present
  if (tvgLogo && tvgLogo.startsWith("http")) return tvgLogo;

  // 2. logoLocal direct lookup (from JSON)
  if (logoLocal) {
    if (logos.TV_LOGO_MAP[logoLocal]) return logos.TV_LOGO_MAP[logoLocal];
    if (logos.WIKI_FILE_MAP[logoLocal]) {
      return `https://en.wikipedia.org/wiki/Special:FilePath/${logos.WIKI_FILE_MAP[logoLocal]}?width=400`;
    }
  }

  // 3. Name-based matching against logos.json keys
  const normalized = name.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
  const lookedUp = nameIndex.get(normalized);
  if (lookedUp) {
    if (logos.TV_LOGO_MAP[lookedUp]) return logos.TV_LOGO_MAP[lookedUp];
    if (logos.WIKI_FILE_MAP[lookedUp]) {
      return `https://en.wikipedia.org/wiki/Special:FilePath/${logos.WIKI_FILE_MAP[lookedUp]}?width=400`;
    }
  }

  // 4. Fuzzy name matching - try partial
  for (const [idxName, key] of nameIndex) {
    if (normalized.length > 3 && idxName.includes(normalized)) {
      if (logos.TV_LOGO_MAP[key]) return logos.TV_LOGO_MAP[key];
      if (logos.WIKI_FILE_MAP[key]) {
        return `https://en.wikipedia.org/wiki/Special:FilePath/${logos.WIKI_FILE_MAP[key]}?width=400`;
      }
    }
  }

  // 5. Local image fallback
  const local = tryLocalImage(name);
  if (local) return local;

  return "";
}

/* ===== Normalization ===== */

let nameIndexCache: Map<string, string> | null = null;

function getNameIndex(logos: LogoMap): Map<string, string> {
  if (!nameIndexCache) nameIndexCache = buildNameIndex(logos);
  return nameIndexCache;
}

export function normalizeM3UEntry(entry: M3uEntry, logos: LogoMap, idx: number): Channel {
  const streamUrl = fixUrl(entry.url);
  const hasDrm = Boolean(entry.drmKey || entry.drmJson);
  const playableType = classifyStream(streamUrl, hasDrm);
  const isPlayable = playableType === "hls";
  const nameIndex = getNameIndex(logos);
  return {
    id: `m3u-${idx}-${entry.name.replace(/\s+/g, "-").toLowerCase()}`,
    name: entry.name,
    category: entry.category || "General",
    streamUrl,
    standbyUrls: [],
    logo: resolveLogo(entry.name, entry.logo, undefined, logos, nameIndex),
    isPlayable,
    playableType,
    headers: entry.headers,
  };
}

export function normalizeChannel(ch: RawChannel, logos: LogoMap, idx: number): Channel {
  const streamUrl = fixUrl(ch.streamUrl);
  const standbyUrls = (ch.standbyUrls || []).map(fixUrl);
  const hasDrm = Boolean(ch.drm);
  const playableType = classifyStream(streamUrl, hasDrm);
  const isPlayable = playableType === "hls";
  const nameIndex = getNameIndex(logos);
  return {
    id: `json-${idx}-${ch.name.replace(/\s+/g, "-").toLowerCase()}`,
    name: ch.name,
    category: ch.category || "General",
    streamUrl,
    standbyUrls,
    logo: resolveLogo(ch.name, ch.logo || "", ch.logoLocal, logos, nameIndex),
    isPlayable,
    playableType,
    headers: extractHeaders(ch.headers),
  };
}

function mergeChannels(m3u: Channel[], json: Channel[]): Channel[] {
  const seen = new Set<string>();
  const out: Channel[] = [];
  // M3U channels first (user's primary source)
  for (const ch of m3u) {
    const key = ch.streamUrl;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ch);
  }
  // JSON channels as supplement (adds channels not in M3U, especially more HLS streams)
  for (const ch of json) {
    const key = ch.streamUrl;
    if (seen.has(key)) continue;
    // Also dedupe by name to avoid near-duplicates
    const nameKey = ch.name.toLowerCase();
    if (out.some((c) => c.name.toLowerCase() === nameKey)) continue;
    seen.add(key);
    out.push(ch);
  }
  return out;
}

export async function fetchAndNormalizeAll(logos: LogoMap): Promise<Channel[]> {
  const [m3uEntries, jsonRaw] = await Promise.all([fetchM3U().catch((e) => { console.error("M3U fetch failed:", e); return []; }), fetchJSONChannels()]);
  const m3uChannels = m3uEntries.map((e, i) => normalizeM3UEntry(e, logos, i));
  const jsonChannels = jsonRaw.map((c, i) => normalizeChannel(c, logos, i));
  return mergeChannels(m3uChannels, jsonChannels);
}

/* ===== Grouping ===== */

const CATEGORY_ORDER = [
  "Entertainment",
  "Movies",
  "Sports",
  "News",
  "General",
  "International",
  "Lifestyle",
  "Documentary",
  "Kids",
  "Anime",
  "Music",
  "Religious",
  "Educational",
  "Government",
  "Digital",
  "AM",
  "FM",
];

export function groupByCategory(channels: Channel[]): { name: string; channels: Channel[] }[] {
  const groups: Record<string, Channel[]> = {};
  for (const ch of channels) {
    if (!groups[ch.category]) groups[ch.category] = [];
    groups[ch.category].push(ch);
  }
  return Object.entries(groups)
    .sort((a, b) => {
      const ia = CATEGORY_ORDER.indexOf(a[0]);
      const ib = CATEGORY_ORDER.indexOf(b[0]);
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
    })
    .map(([name, chs]) => ({ name, channels: chs }));
}

export function filterPlayable(channels: Channel[]): Channel[] {
  return channels.filter((c) => c.isPlayable);
}
