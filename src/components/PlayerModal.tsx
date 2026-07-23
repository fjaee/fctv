import { useMemo, useState } from "react";
import type { Channel } from "../types";
import { usePlayer } from "../hooks/usePlayer";
import { useControls } from "../hooks/useControls";
import {
  AlertIcon,
  ChevronDownIcon,
  CloseIcon,
  LockIcon,
  PauseIcon,
  PlayIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  UnlockIcon,
  VolumeIcon,
  VolumeMuteIcon,
} from "./icons";

interface PlayerModalProps {
  channel: Channel;
  player: ReturnType<typeof usePlayer>;
  allChannels: Channel[];
  onSelectChannel: (ch: Channel) => void;
}

export function PlayerModal({ channel, player, allChannels, onSelectChannel }: PlayerModalProps) {
  const { videoRef, status, errorMsg, levels, currentLevel, refresh, setLevel, tryNextFallback, hasFallback } = player;
  const controls = useControls(videoRef, status === "playing");
  const [qualityOpen, setQualityOpen] = useState(false);
  const [sidebarSearch, setSidebarSearch] = useState("");

  const sidebarChannels = useMemo(() => {
    const q = sidebarSearch.trim().toLowerCase();
    const filtered = q
      ? allChannels.filter((c) => c.name.toLowerCase().includes(q))
      : allChannels;
    return filtered;
  }, [allChannels, sidebarSearch]);

  const handleSidebarClick = (ch: Channel) => {
    onSelectChannel(ch);
  };

  const handleVideoClick = () => {
    if (controls.locked) {
      controls.showControls();
      return;
    }
    controls.togglePlay();
    controls.showControls();
  };

  return (
    <div className="player-overlay" onClick={player.close}>
      <div className="player-shell" onClick={(e) => e.stopPropagation()}>
        {/* ===== Left: Video Player (70%) ===== */}
        <div className="player-main">
          <div
            className="player-video-wrap"
            onMouseMove={controls.showControls}
            onMouseLeave={() => { if (!controls.locked && !videoRef.current?.paused) controls.hideControls(); }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onClick={handleVideoClick}
            />

            {/* Loading */}
            {status === "loading" && (
              <div className="player-loading">
                <div className="spinner" />
                <div className="player-loading-text">Loading {channel.name}…</div>
              </div>
            )}

            {/* Error */}
            {status === "error" && (
              <div className="player-error">
                <AlertIcon size={48} />
                <h3>Playback Error</h3>
                <p>{errorMsg || "This stream could not be loaded."}</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-primary" onClick={refresh}>
                    <RefreshIcon size={18} /> Retry
                  </button>
                  {hasFallback && (
                    <button className="btn btn-secondary" onClick={tryNextFallback}>
                      Try mirror
                    </button>
                  )}
                  <button className="btn btn-secondary" onClick={player.close}>Close</button>
                </div>
              </div>
            )}

            {/* Lock overlay (tap to reveal controls) */}
            {controls.locked && (
              <div className="player-locked-hint" onClick={(e) => { e.stopPropagation(); controls.toggleLock(); }}>
                <LockIcon size={32} />
                <span>Locked · Tap to unlock</span>
              </div>
            )}

            {/* Custom Control Bar */}
            {!controls.locked && (
              <div
                className={`player-controls ${controls.controlsVisible ? "visible" : "hidden"}`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Top bar: title + close */}
                <div className="player-controls-top">
                  <div className="player-now-playing">
                    <span className="live-badge"><span className="live-dot" /> LIVE</span>
                    <span className="player-now-name">{channel.name}</span>
                    <span className="player-now-cat">{channel.category}</span>
                  </div>
                  <button className="player-ctrl-btn" onClick={player.close} aria-label="Close">
                    <CloseIcon size={22} />
                  </button>
                </div>

                {/* Bottom bar: controls */}
                <div className="player-controls-bottom">
                  <div className="player-controls-left">
                    <button className="player-ctrl-btn" onClick={controls.togglePlay} aria-label="Play/Pause">
                      {controls.isPlaying ? <PauseIcon size={24} /> : <PlayIcon size={24} />}
                    </button>
                    <div className="volume-group">
                      <button className="player-ctrl-btn" onClick={controls.toggleMute} aria-label="Mute">
                        {controls.isMuted || controls.volume === 0 ? <VolumeMuteIcon size={20} /> : <VolumeIcon size={20} />}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={controls.isMuted ? 0 : controls.volume}
                        onChange={(e) => controls.setVolume(parseFloat(e.target.value))}
                        className="volume-slider"
                        aria-label="Volume"
                      />
                    </div>
                    <span className="live-persistent">
                      <span className="live-dot" /> LIVE
                    </span>
                  </div>

                  <div className="player-controls-right">
                    {/* Quality picker */}
                    <div className="quality-picker">
                      <button
                        className="quality-btn"
                        onClick={() => setQualityOpen((v) => !v)}
                        aria-label="Quality"
                      >
                        <SettingsIcon size={18} />
                        <span>{currentLevel === -1 ? "Auto" : `${levels.find((l) => l.index === currentLevel)?.height || ""}p`}</span>
                        <ChevronDownIcon size={14} />
                      </button>
                      {qualityOpen && (
                        <div className="quality-menu">
                          <button
                            className={`quality-option ${currentLevel === -1 ? "active" : ""}`}
                            onClick={() => { setLevel(-1); setQualityOpen(false); }}
                          >
                            Auto
                          </button>
                          {levels.map((lv) => (
                            <button
                              key={lv.index}
                              className={`quality-option ${currentLevel === lv.index ? "active" : ""}`}
                              onClick={() => { setLevel(lv.index); setQualityOpen(false); }}
                            >
                              {lv.height}p
                            </button>
                          ))}
                          {levels.length === 0 && (
                            <div className="quality-empty">Single quality</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Refresh */}
                    <button className="player-ctrl-btn" onClick={refresh} aria-label="Refresh stream" title="Refresh stream">
                      <RefreshIcon size={18} />
                    </button>

                    {/* Lock */}
                    <button className="player-ctrl-btn" onClick={controls.toggleLock} aria-label="Lock controls" title="Lock UI">
                      <LockIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Unlock button when locked */}
            {controls.locked && controls.controlsVisible && (
              <button className="player-unlock-btn" onClick={(e) => { e.stopPropagation(); controls.toggleLock(); }}>
                <UnlockIcon size={22} />
              </button>
            )}
          </div>
        </div>

        {/* ===== Right: Sidebar Playlist (30%) ===== */}
        <div className="player-sidebar">
          <div className="sidebar-header">
            <h3>All Channels</h3>
            <span className="sidebar-count">{sidebarChannels.length}</span>
          </div>
          <div className="sidebar-search">
            <SearchIcon size={16} />
            <input
              type="text"
              placeholder="Search…"
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              aria-label="Search channels"
            />
          </div>
          <div className="sidebar-list">
            {/* Current channel at top */}
            <div className={`sidebar-item active`} onClick={() => {}}>
              <div className="sidebar-thumb">
                {channel.logo ? (
                  <img src={channel.logo} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <span className="sidebar-placeholder">{channel.name.slice(0, 2).toUpperCase()}</span>
                )}
                <span className="sidebar-playing-icon"><PlayIcon size={12} /></span>
              </div>
              <div className="sidebar-info">
                <div className="sidebar-name">{channel.name}</div>
                <div className="sidebar-status">Now playing</div>
              </div>
            </div>

            {sidebarChannels
              .filter((ch) => ch.id !== channel.id)
              .map((ch) => (
                <div
                  key={ch.id}
                  className="sidebar-item"
                  onClick={() => handleSidebarClick(ch)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleSidebarClick(ch)}
                >
                  <div className="sidebar-thumb">
                    {ch.logo ? (
                      <img src={ch.logo} alt="" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <span className="sidebar-placeholder">{ch.name.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="sidebar-info">
                    <div className="sidebar-name">{ch.name}</div>
                    <div className="sidebar-status">{ch.category}{ch.playableType !== "hls" ? ` · ${ch.playableType.toUpperCase()}` : " · Live"}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
