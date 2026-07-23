import { useScrollNav } from "./icons";
import { SearchIcon, TvIcon } from "./icons";

interface TopNavProps {
  search: string;
  onSearchChange: (v: string) => void;
  onHome: () => void;
  channelCount: number;
}

export function TopNav({ search, onSearchChange, onHome, channelCount }: TopNavProps) {
  const navRef = useScrollNav();

  return (
    <nav className="topnav" ref={navRef}>
      <div className="topnav-inner">
        <div className="brand" onClick={onHome} role="button" tabIndex={0}>
          <span className="brand-mark">FCTV</span>
          <span className="brand-text">Stream</span>
        </div>
        <div className="nav-links">
          <button className="nav-link active" onClick={onHome}>Home</button>
          <span className="nav-link" style={{ cursor: "default" }}>{channelCount} Channels</span>
        </div>
        <div className="nav-right">
          <div className="search-box">
            <SearchIcon size={18} />
            <input
              type="text"
              placeholder="Search channels…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search channels"
            />
          </div>
          <TvIcon size={22} />
        </div>
      </div>
    </nav>
  );
}
