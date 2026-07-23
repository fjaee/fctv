import type { Channel } from "../types";
import { PlayIcon, InfoIcon } from "./icons";

interface HeroProps {
  channel: Channel;
  onPlay: (ch: Channel) => void;
}

export function Hero({ channel, onPlay }: HeroProps) {
  const bg = channel.logo || "";

  return (
    <section className="hero">
      {bg ? (
        <div
          className="hero-bg"
          style={{ backgroundImage: `url(${bg})`, filter: "blur(40px) brightness(0.35) saturate(1.3)" }}
        />
      ) : (
        <div className="hero-bg" style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }} />
      )}
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-badge">
          <span className="dot" /> Live Now
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 20 }}>
          {bg && (
            <img
              src={bg}
              alt={channel.name}
              style={{
                height: 80,
                width: "auto",
                maxWidth: 180,
                objectFit: "contain",
                borderRadius: 8,
                filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))",
              }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          )}
          <h1 className="hero-title" style={{ marginBottom: 0 }}>{channel.name}</h1>
        </div>
        <div className="hero-meta">
          <span>{channel.category}</span>
          <span className="sep">•</span>
          <span>Live TV</span>
          {channel.standbyUrls.length > 0 && (
            <>
              <span className="sep">•</span>
              <span>{channel.standbyUrls.length + 1} sources</span>
            </>
          )}
        </div>
        <p className="hero-desc">
          Streaming live now. Click play to watch {channel.name} directly in your browser.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onPlay(channel)}>
            <PlayIcon size={20} /> Play
          </button>
          <button className="btn btn-secondary">
            <InfoIcon size={20} /> Details
          </button>
        </div>
      </div>
    </section>
  );
}
