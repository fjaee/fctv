import { useCallback, useEffect, useRef, useState } from "react";

export function useControls(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  enabled: boolean
) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [locked, setLocked] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, [videoRef]);

  const setVolume = useCallback((vol: number) => {
    const v = videoRef.current;
    if (!v) return;
    const clamped = Math.max(0, Math.min(1, vol));
    v.volume = clamped;
    v.muted = clamped === 0;
    setVolumeState(clamped);
    setIsMuted(clamped === 0);
  }, [videoRef]);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setIsMuted(next);
    if (!next && v.volume === 0) {
      v.volume = 0.5;
      setVolumeState(0.5);
    }
  }, [videoRef]);

  const toggleLock = useCallback(() => {
    setLocked((prev) => {
      const next = !prev;
      if (next) setControlsVisible(false);
      else setControlsVisible(true);
      return next;
    });
  }, []);

  const showControls = useCallback(() => {
    if (locked) return;
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 3500);
  }, [locked, videoRef]);

  const hideControls = useCallback(() => {
    if (locked) return;
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (!videoRef.current?.paused) setControlsVisible(false);
  }, [locked, videoRef]);

  useEffect(() => {
    if (!enabled) return;
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVol = () => { setVolumeState(v.volume); setIsMuted(v.muted); };

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("volumechange", onVol);

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("volumechange", onVol);
    };
  }, [enabled, videoRef]);

  useEffect(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying && controlsVisible && !locked) {
      hideTimerRef.current = setTimeout(() => {
        if (!videoRef.current?.paused) setControlsVisible(false);
      }, 3500);
    }
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isPlaying, controlsVisible, locked, videoRef]);

  return {
    isPlaying,
    volume,
    isMuted,
    locked,
    controlsVisible,
    togglePlay,
    setVolume,
    toggleMute,
    toggleLock,
    showControls,
    hideControls,
  };
}
