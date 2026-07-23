import { useCallback, useEffect, useMemo, useState } from "react";
import type { Channel, LogoMap } from "./types";
import { fetchAndNormalizeAll, fetchLogos, groupByCategory, filterPlayable } from "./data";
import { TopNav } from "./components/TopNav";
import { Hero } from "./components/Hero";
import { CategoryRow } from "./components/CategoryRow";
import { SearchView } from "./components/SearchView";
import { PlayerModal } from "./components/PlayerModal";
import { usePlayer } from "./hooks/usePlayer";
import { AlertIcon } from "./components/icons";

type LoadState = "loading" | "ready" | "error";

export default function App() {
  const [state, setState] = useState<LoadState>("loading");
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [, setLogos] = useState<LogoMap>({ TV_LOGO_MAP: {}, WIKI_FILE_MAP: {} });
  const [search, setSearch] = useState("");
  const [heroChannel, setHeroChannel] = useState<Channel | null>(null);
  const player = usePlayer();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const logoMap = await fetchLogos();
        if (cancelled) return;
        setLogos(logoMap);
        const normalized = await fetchAndNormalizeAll(logoMap);
        if (cancelled) return;
        setAllChannels(normalized);
        const playable = filterPlayable(normalized);
        const withLogo = playable.filter(c => c.logo);
        const pick = withLogo.length > 0 ? withLogo[Math.floor(Math.random() * Math.min(withLogo.length, 10))] : (playable[0] ?? normalized[0]);
        setHeroChannel(pick ?? null);
        setState("ready");
      } catch (e) {
        console.error("Load failed:", e);
        if (!cancelled) setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = useMemo(() => groupByCategory(allChannels), [allChannels]);
  const playableCount = useMemo(() => filterPlayable(allChannels).length, [allChannels]);

  const handlePlay = useCallback((ch: Channel) => {
    player.play(ch);
  }, [player]);

  const handleHome = useCallback(() => {
    setSearch("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (state === "loading") {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p style={{ color: "var(--text-2)" }}>Loading channels…</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="app-error">
        <AlertIcon size={48} />
        <h2>Failed to load channels</h2>
        <p>Could not fetch the channel data. Please check your connection and try again.</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const showSearch = search.trim().length > 0;

  return (
    <div className="app">
      <TopNav
        search={search}
        onSearchChange={setSearch}
        onHome={handleHome}
        channelCount={playableCount}
      />
      {showSearch ? (
        <SearchView query={search} channels={allChannels} onPlay={handlePlay} />
      ) : (
        <>
          {heroChannel && <Hero channel={heroChannel} onPlay={handlePlay} />}
          <div className="content">
            {categories.map((cat) => (
              <CategoryRow
                key={cat.name}
                name={cat.name}
                channels={cat.channels}
                onPlay={handlePlay}
              />
            ))}
          </div>
        </>
      )}
      <footer className="footer">
        FCTV Stream · {allChannels.length} channels loaded · {playableCount} playable in browser
        <br />
        Personal educational project · Not for redistribution
      </footer>
      {player.channel && (
        <PlayerModal
          channel={player.channel}
          player={player}
          allChannels={allChannels}
          onSelectChannel={handlePlay}
        />
      )}
    </div>
  );
}
