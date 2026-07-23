import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import type { Channel } from "../types";

export type PlayerStatus = "idle" | "loading" | "playing" | "error";

export function usePlayer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [channel, setChannel] = useState<Channel | null>(null);
  const [triedFallback, setTriedFallback] = useState(0);

  const cleanup = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
  }, []);

  const loadStream = useCallback(
    (url: string, label: string) => {
      const video = videoRef.current;
      if (!video) return;
      setStatus("loading");
      setErrorMsg("");

      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy();
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsRef.current = hls;
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
          setStatus("playing");
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            setStatus("error");
            setErrorMsg(`Stream unavailable: ${label}`);
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
          setStatus("playing");
        }, { once: true });
        video.addEventListener("error", () => {
          setStatus("error");
          setErrorMsg(`Stream unavailable: ${label}`);
        }, { once: true });
      } else {
        setStatus("error");
        setErrorMsg("HLS playback is not supported in this browser.");
      }
    },
    []
  );

  const play = useCallback(
    (ch: Channel) => {
      setChannel(ch);
      setTriedFallback(0);
      loadStream(ch.streamUrl, ch.name);
    },
    [loadStream]
  );

  const tryNextFallback = useCallback(() => {
    if (!channel) return;
    const next = triedFallback;
    if (next < channel.standbyUrls.length) {
      setTriedFallback(next + 1);
      loadStream(channel.standbyUrls[next], `${channel.name} (mirror ${next + 1})`);
    }
  }, [channel, triedFallback, loadStream]);

  const close = useCallback(() => {
    cleanup();
    setChannel(null);
    setStatus("idle");
    setErrorMsg("");
    setTriedFallback(0);
  }, [cleanup]);

  useEffect(() => () => cleanup(), [cleanup]);

  return { videoRef, status, errorMsg, channel, play, close, tryNextFallback, triedFallback, hasFallback: Boolean(channel && channel.standbyUrls.length > 0) };
}
