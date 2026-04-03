<div align="center">

# 📺 FCTV

**A personal auto-updating media index.**  
Maintained daily. Entries are never removed — only added or refreshed.

[![Last Updated](https://img.shields.io/github/last-commit/fjaee/fctv?label=Last%20Updated&style=flat-square&color=4CAF50)](https://github.com/fjaee/fctv/commits/master)
[![Entries](https://img.shields.io/badge/Entries-233%2B-blue?style=flat-square)](https://raw.githubusercontent.com/fjaee/fctv/master/channels-all.m3u)
[![Auto Update](https://img.shields.io/badge/Auto%20Update-Daily%20Midnight%20GMT%2B8-orange?style=flat-square)](https://github.com/fjaee/fctv/actions)
[![License](https://img.shields.io/badge/Use-Personal%20Only-lightgrey?style=flat-square)](#)

</div>

---

## 🔗 Index URL

```
https://raw.githubusercontent.com/fjaee/fctv/master/channels-all.m3u
```
```
https://goo.su/tq6Et
```

> For personal use with a compatible media player.

---

## 📊 Content Breakdown

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

## ⚙️ How It Works

```
Every day at midnight (GMT+8)
        ↓
GitHub Actions fetches latest data from upstream source
        ↓
Compares SHA-256 fingerprint with previous run
        ↓
    No changes?            Changes found?
    → Skip commit          → Merge updates
                                 ↓
                           Existing entries preserved
                           Only adds NEW or refreshes
                           outdated entries
                                 ↓
                           Commits updated index
                           "[timestamp] Total: 233 | New: 5 | Updated: 12"
```

---

## 🛡️ Reliability Features

| Feature | Description |
|---|---|
| **Permanent entries** | Nothing is ever removed, even if the upstream source drops it |
| **Local backup** | `channels-backup.json` stores all entries as a permanent safety net |
| **Smart commits** | SHA-256 fingerprinting ensures commits only happen on real data changes |
| **Source resilience** | If upstream goes down, the full local backup is used with zero data loss |

---

## 📁 Structure

```
fctv/
├── channels-all.m3u        ← Main index file
├── channels-backup.json    ← Full local backup with metadata
├── channels.hash           ← SHA-256 fingerprint for change detection
├── generate.py             ← Fetch, merge, and build script
└── .github/
    └── workflows/
        └── update-index.yml ← Daily automation schedule
```

---

## 🔒 Preserved Entries

These entries are not available from the upstream source but are permanently kept locally:

- Kapamilya Channel
- One PH / One Sports / One Sports+
- TVN Movies
- F1 TV (1 & 2)

---

<div align="center">
  <sub>Personal project · Auto-maintained by GitHub Actions · Not for redistribution</sub>
</div>
