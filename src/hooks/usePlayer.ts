import { useCallback, useEffect, useRef, useState } from "react";
import Hls, { type Level } from "hls.js";
import type { Channel } from "../types";

export type PlayerStatus = "idle" | "loading" | "playing" | "error";

export interface HlsLevel {
  height: number;
  index: number;
  bitrate: number;
  name?: string;
}

export function usePlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const channelRef = useRef<Channel | null>(null);
  const urlIndexRef = useRef(0);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [levels, setLevels] = useState<HlsLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState(-1);

  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.removeAttribute("src");
      try { videoRef.current.load(); } catch {}
    }
    setLevels([]);
    setCurrentLevel(-1);
  }, []);

  const loadStream = useCallback(
    (ch: Channel, url: string, label: string) => {
      const video = videoRef.current;
      if (!video) return;
      setStatus("loading");
      setErrorMsg("");
      setLevels([]);
      setCurrentLevel(-1);

      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          manifestLoadingTimeOut: 12000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 12000,
          levelLoadingMaxRetry: 4,
          fragLoadingTimeOut: 20000,
          fragLoadingMaxRetry: 6,
          fragLoadingRetryDelay: 500,
          fragLoadingMaxRetryTimeout: 64000,
        });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_e, data) => {
          const parsed: HlsLevel[] = (data.levels || [])
            .map((lv: Level, i: number) => ({
              height: lv.height || 0,
              index: i,
              bitrate: lv.bitrate || 0,
              name: lv.name,
            }))
            .filter((l) => l.height > 0)
            .sort((a, b) => a.height - b.height);
          setLevels(parsed);
          setCurrentLevel(-1);
          video.play().catch(() => {});
          setStatus("playing");
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
          setCurrentLevel(data.level);
        });

        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              tryNextUrl(ch, label);
              break;
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        const onMeta = () => {
          video.play().catch(() => {});
          setStatus("playing");
          video.removeEventListener("loadedmetadata", onMeta);
        };
        const onErr = () => {
          tryNextUrl(ch, label);
          video.removeEventListener("error", onErr);
        };
        video.addEventListener("loadedmetadata", onMeta);
        video.addEventListener("error", onErr);
      } else {
        setStatus("error");
        setErrorMsg("HLS playback is not supported in this browser.");
      }
    },
    []
  );

  const tryNextUrl = useCallback((ch: Channel, label: string) => {
    const all = [ch.streamUrl, ...ch.standbyUrls];
    const next = urlIndexRef.current + 1;
    if (next < all.length) {
      urlIndexRef.current = next;
      loadStream(ch, all[next], `${ch.name} (mirror ${next})`);
    } else {
      setStatus("error");
      setErrorMsg(`Stream unavailable: ${label}`);
    }
  }, [loadStream]);

  const play = useCallback((ch: Channel) => {
    channelRef.current = ch;
    setChannel(ch);
    urlIndexRef.current = 0;
    loadStream(ch, ch.streamUrl, ch.name);
  }, [loadStream]);

  const tryNextFallback = useCallback(() => {
    const ch = channelRef.current;
    if (!ch) return;
    const all = [ch.streamUrl, ...ch.standbyUrls];
    const next = urlIndexRef.current + 1;
    if (next < all.length) {
      urlIndexRef.current = next;
      loadStream(ch, all[next], `${ch.name} (mirror ${next})`);
    }
  }, [loadStream]);

  const refresh = useCallback(() => {
    const ch = channelRef.current;
    if (!ch) return;
    const all = [ch.streamUrl, ...ch.standbyUrls];
    const idx = Math.min(urlIndexRef.current, all.length - 1);
    loadStream(ch, all[idx], ch.name);
  }, [loadStream]);

  const setLevel = useCallback((level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentLevel(level);
    }
  }, []);

  const close = useCallback(() => {
    cleanup();
    channelRef.current = null;
    setChannel(null);
    setStatus("idle");
    setErrorMsg("");
    urlIndexRef.current = 0;
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    videoRef,
    hlsRef,
    status,
    errorMsg,
    channel,
    levels,
    currentLevel,
    play,
    close,
    refresh,
    setLevel,
    tryNextFallback,
    urlIndex: urlIndexRef.current,
    hasFallback: Boolean(channel && channel.standbyUrls.length > 0),
  };
}
