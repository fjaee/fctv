import type { Channel } from "../types";
import { usePlayer } from "../hooks/usePlayer";
import { AlertIcon, CloseIcon, PlayIcon } from "./icons";

interface PlayerModalProps {
  channel: Channel;
  player: ReturnType<typeof usePlayer>;
}

export function PlayerModal({ channel, player }: PlayerModalProps) {
  const { videoRef, status, errorMsg, tryNextFallback, hasFallback, triedFallback } = player;

  return (
    <div className="player-overlay" onClick={player.close}>
      <div className="player-modal" onClick={(e) => e.stopPropagation()}>
        <div className="player-video-wrap">
          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            crossOrigin="anonymous"
          />
          {status === "loading" && (
            <div className="player-loading">
              <div className="spinner" />
              <div className="player-loading-text">Loading stream…</div>
            </div>
          )}
          {status === "error" && (
            <div className="player-error">
              <AlertIcon size={48} />
              <h3>Playback Error</h3>
              <p>{errorMsg}</p>
              {hasFallback && triedFallback < channel.standbyUrls.length ? (
                <button className="btn btn-primary" onClick={tryNextFallback}>
                  <PlayIcon size={18} /> Try mirror {triedFallback + 1}
                </button>
              ) : (
                <button className="btn btn-secondary" onClick={player.close}>Close</button>
              )}
            </div>
          )}
          <button className="player-close" onClick={player.close} aria-label="Close player">
            <CloseIcon size={22} />
          </button>
        </div>
        <div className="player-info">
          <div className="player-info-left">
            {channel.logo ? (
              <img className="player-info-logo" src={channel.logo} alt={channel.name} />
            ) : null}
            <div style={{ minWidth: 0 }}>
              <div className="player-info-name">{channel.name}</div>
              <div className="player-info-cat">{channel.category}</div>
            </div>
          </div>
          {hasFallback && status === "error" && (
            <button className="btn btn-secondary" onClick={tryNextFallback}>
              Switch source
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
