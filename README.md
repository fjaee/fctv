<div align="center">

# 📺 FCTV

**A self-updating IPTV playlist for Filipino and international channels.**  
Auto-refreshes daily from live sources. Channels are never removed — only added or updated.

[![Last Updated](https://img.shields.io/github/last-commit/fjaee/fctv?label=Last%20Updated&style=flat-square&color=4CAF50)](https://github.com/fjaee/fctv/commits/master)
[![Channels](https://img.shields.io/badge/Channels-233%2B-blue?style=flat-square)](https://raw.githubusercontent.com/fjaee/fctv/master/channels-all.m3u)
[![Auto Update](https://img.shields.io/badge/Auto%20Update-Daily%20Midnight%20GMT%2B8-orange?style=flat-square)](https://github.com/fjaee/fctv/actions)
[![License](https://img.shields.io/badge/License-Personal%20Use-lightgrey?style=flat-square)](#)

</div>

---

## 📡 Playlist URL

```
https://raw.githubusercontent.com/fjaee/fctv/master/channels-all.m3u
```

```
https://goo.su/tq6Et
```

> Copy either URL and paste it directly into **TiviMate**, **Kodi**, or any M3U-compatible IPTV player.

---

## 📊 Channel Breakdown

| Category | Count |
|---|---|
| 🏆 Sports | 56 |
| 🎬 Movies | 38 |
| 📺 Entertainment | 38 |
| 🧒 Kids | 20 |
| 🌿 Lifestyle | 14 |
| 📰 News | 14 |
| 🌏 International | 12 |
| 📖 Documentary | 11 |
| 🎵 Music | 7 |
| ✝️ Religious | 7 |
| 🎓 Educational | 2 |
| 🏛️ Government | 3 |
| **Total** | **233+** |

---

## 📲 How to Use in TiviMate

1. Open **TiviMate** → ⚙️ Settings → **Playlists**
2. Tap **Add Playlist** → **M3U URL**
3. Paste the playlist URL above
4. Set **Update Interval** to daily
5. Done! All channels will appear grouped by category

> ⚠️ Some channels require **Widevine / ClearKey DRM**. Make sure your device supports it.  
> Encrypted channels are labelled with `#KODIPROP` entries for Kodi/IPTV players.

---

## ⚙️ How It Works

```
Every day at midnight (GMT+8)
        ↓
GitHub Actions fetches latest channel data from live source
        ↓
Compares content hash with previous run
        ↓
    No changes?          Changes found?
    → Skip commit        → Merge updates
                               ↓
                         Never removes channels
                         Only adds NEW or updates
                         stream URL / DRM keys
                               ↓
                         Commits channels-all.m3u
                         with summary message:
                         "[timestamp] Total: 233 | New: 5 | Updated: 12"
```

---

## 🛡️ Safety Features

| Feature | Description |
|---|---|
| **Never-delete protection** | Channels are never removed from the playlist, even if the upstream source removes them |
| **Backup persistence** | `channels-backup.json` stores all channels locally as a permanent safety net |
| **No fake commits** | A SHA-256 hash fingerprints channel data — commits only happen when content actually changes, not just timestamps |
| **Source resilience** | If the upstream source goes down, the full backup is used as-is with zero data loss |

---

## 📁 Repository Structure

```
fctv/
├── channels-all.m3u        ← The main playlist (use this URL)
├── channels-backup.json    ← Full channel backup with metadata
├── channels.hash           ← SHA-256 fingerprint for change detection
├── generate.py             ← Script that fetches, merges, and builds the M3U
└── .github/
    └── workflows/
        └── update-iptv.yml ← Daily GitHub Actions schedule
```

---

## 🔒 Notable Protected Channels

These channels are not available from the upstream source but are permanently kept in the backup:

- Kapamilya Channel
- One PH
- One Sports / One Sports+
- TVN Movies
- F1 TV (1) / F1 TV (2)

---

## ⚠️ Disclaimer

This repository is for **personal use only**. All stream URLs and channel data are sourced from publicly available third-party sources. This project does not host, store, or distribute any video content. Use responsibly and in accordance with your local laws.

---

<div align="center">
  <sub>Auto-maintained by GitHub Actions · Built with ❤️ for Filipino TV fans</sub>
</div>
