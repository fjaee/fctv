import type { Channel, RawChannel, LogoMap } from "./types";

const DATA_URL = "https://raw.githubusercontent.com/fjaee/fctv/master/channels-backup.json";
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

export async function fetchChannels(): Promise<RawChannel[]> {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`channels ${res.status}`);
  const raw = await res.json();
  return (raw as RawChannel[]).filter((c) => c && c.name && c.streamUrl);
}

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
  if (lower.endsWith(".m3u8") || lower.includes(".m3u8")) return "hls";
  if (lower.endsWith(".mpd") || lower.includes(".mpd")) return "dash";
  return "other";
}

function resolveLogo(ch: RawChannel, logos: LogoMap): string {
  if (ch.logo) return ch.logo;
  const ll = ch.logoLocal || "";
  if (ll && logos.TV_LOGO_MAP[ll]) return logos.TV_LOGO_MAP[ll];
  if (ll && logos.WIKI_FILE_MAP[ll]) {
    return `https://en.wikipedia.org/wiki/Special:FilePath/${logos.WIKI_FILE_MAP[ll]}?width=400`;
  }
  return "";
}

export function normalizeChannel(ch: RawChannel, logos: LogoMap, idx: number): Channel {
  const streamUrl = fixUrl(ch.streamUrl);
  const standbyUrls = (ch.standbyUrls || []).map(fixUrl);
  const hasDrm = Boolean(ch.drm);
  const playableType = classifyStream(streamUrl, hasDrm);
  const isPlayable = playableType === "hls";
  return {
    id: `${idx}-${ch.name.replace(/\s+/g, "-").toLowerCase()}`,
    name: ch.name,
    category: ch.category || "General",
    streamUrl,
    standbyUrls,
    logo: resolveLogo(ch, logos),
    isPlayable,
    playableType,
    headers: extractHeaders(ch.headers),
  };
}

export function normalizeChannels(raw: RawChannel[], logos: LogoMap): Channel[] {
  const seen = new Set<string>();
  const out: Channel[] = [];
  raw.forEach((ch, idx) => {
    const norm = normalizeChannel(ch, logos, idx);
    if (seen.has(norm.streamUrl)) return;
    seen.add(norm.streamUrl);
    out.push(norm);
  });
  return out;
}

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
