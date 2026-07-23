export interface RawChannel {
  name: string;
  logoLocal?: string;
  category?: string;
  streamUrl: string;
  standbyUrls?: string[];
  drm?: Record<string, string> | { keys: unknown[]; type: string };
  headers?: { [k: string]: string };
  logo?: string;
  type?: string;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface Channel {
  id: string;
  name: string;
  category: string;
  streamUrl: string;
  standbyUrls: string[];
  logo: string;
  isPlayable: boolean;
  playableType: "hls" | "dash" | "drm" | "other";
  headers: Record<string, string>;
}

export interface LogoMap {
  TV_LOGO_MAP: Record<string, string>;
  WIKI_FILE_MAP: Record<string, string>;
}

export interface CategoryGroup {
  name: string;
  channels: Channel[];
}
