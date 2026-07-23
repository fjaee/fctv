import type { Channel } from "../types";
import { ChannelCard } from "./ChannelCard";

interface SearchViewProps {
  query: string;
  channels: Channel[];
  onPlay: (ch: Channel) => void;
}

export function SearchView({ query, channels, onPlay }: SearchViewProps) {
  const filtered = channels.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="search-results">
      <h2 className="search-title">
        {filtered.length > 0
          ? `Results for "${query}" (${filtered.length})`
          : `No results for "${query}"`}
      </h2>
      {filtered.length > 0 ? (
        <div className="search-grid">
          {filtered.map((ch) => (
            <ChannelCard key={ch.id} channel={ch} onPlay={onPlay} />
          ))}
        </div>
      ) : (
        <div className="search-empty">
          <h3>No channels found</h3>
          <p>Try a different search term.</p>
        </div>
      )}
    </div>
  );
}
