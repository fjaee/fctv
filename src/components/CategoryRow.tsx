import { useRef } from "react";
import type { Channel } from "../types";
import { ChannelCard } from "./ChannelCard";
import { ScrollIcon } from "./icons";

interface CategoryRowProps {
  name: string;
  channels: Channel[];
  onPlay: (ch: Channel) => void;
}

export function CategoryRow({ name, channels, onPlay }: CategoryRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <section className="category-section">
      <div className="category-header">
        <h2 className="category-title">{name}</h2>
        <span className="category-count">{channels.length} channels</span>
      </div>
      <div style={{ position: "relative" }}>
        <div className="row-track" ref={trackRef}>
          {channels.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onPlay={onPlay} />
          ))}
        </div>
        <button
          className="scroll-btn left"
          onClick={() => scroll(-1)}
          aria-label="Scroll left"
          style={{
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <ScrollIcon size={20} />
        </button>
        <button
          className="scroll-btn right"
          onClick={() => scroll(1)}
          aria-label="Scroll right"
          style={{
            position: "absolute",
            right: -8,
            top: "50%",
            transform: "translateY(50%) rotate(180deg)",
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 5,
            opacity: 0,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
        >
          <ScrollIcon size={20} />
        </button>
      </div>
    </section>
  );
}
