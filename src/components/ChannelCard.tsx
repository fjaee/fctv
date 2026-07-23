import { useState } from "react";
import type { Channel } from "../types";
import { PlayIcon } from "./icons";

interface ChannelCardProps {
  channel: Channel;
  onPlay: (ch: Channel) => void;
}

export function ChannelCard({ channel, onPlay }: ChannelCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasLogo = channel.logo && !imgError;

  return (
    <div
      className="card"
      onClick={() => onPlay(channel)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onPlay(channel)}
    >
      <div className="card-poster">
        {hasLogo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="placeholder">{channel.name.slice(0, 2).toUpperCase()}</div>
        )}
        <div className="card-play">
          <PlayIcon size={20} />
        </div>
        <span className={`card-badge ${channel.isPlayable ? "live" : ""}`}>
          {channel.isPlayable ? "Live" : channel.playableType.toUpperCase()}
        </span>
      </div>
      <div className="card-body">
        <div className="card-name">{channel.name}</div>
        <div className="card-cat">{channel.category}</div>
      </div>
    </div>
  );
}
