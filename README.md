<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0d1117,50:161b22,100:21262d&height=220&section=header&text=FCTV&fontSize=90&fontColor=58a6ff&animation=fadeIn&fontAlignY=40&desc=Personal+Media+Index&descAlignY=62&descSize=18&descColor=8b949e" width="100%" />

<br/>

[![Last Updated](https://img.shields.io/github/last-commit/fjaee/fctv?label=Last+Updated&style=for-the-badge&color=238636&labelColor=161b22&logo=github)](https://github.com/fjaee/fctv/commits/master)&nbsp;
[![Entries](https://img.shields.io/badge/Entries-233%2B-1f6feb?style=for-the-badge&labelColor=161b22&logo=databricks&logoColor=58a6ff)](https://raw.githubusercontent.com/fjaee/fctv/master/channels-all.m3u)&nbsp;
[![Schedule](https://img.shields.io/badge/Schedule-Daily_GMT%2B8-9e6a03?style=for-the-badge&labelColor=161b22&logo=githubactions&logoColor=e3b341)](https://github.com/fjaee/fctv/actions)&nbsp;
[![Use](https://img.shields.io/badge/Use-Personal_Only-6e7681?style=for-the-badge&labelColor=161b22)](https://github.com/fjaee/fctv)

<br/>

<img src="https://img.shields.io/github/repo-size/fjaee/fctv?style=flat-square&color=30363d&labelColor=161b22&label=Repo+Size" />&nbsp;
<img src="https://img.shields.io/github/languages/top/fjaee/fctv?style=flat-square&color=30363d&labelColor=161b22" />&nbsp;
<img src="https://img.shields.io/badge/Maintained-Yes-238636?style=flat-square&labelColor=161b22" />

<br/><br/>

> 🔒 &nbsp;**Personal project. Not for redistribution.**
> &nbsp;Auto-maintained daily — entries are never removed, only added or refreshed.

</div>

<br/>

---

### 🔗 &nbsp;Index URL

```
https://raw.githubusercontent.com/fjaee/fctv/master/channels-all.m3u
```
```
https://goo.su/tq6Et
```

<sup>Paste either URL into a compatible media player. Both point to the same file.</sup>

---

### 📊 &nbsp;Content Breakdown

<div align="center">

|  | Category | Count |
|:---:|:---|:---:|
| 🏆 | Sports | `56` |
| 🎬 | Movies | `38` |
| 📺 | Entertainment | `38` |
| 🧒 | Kids | `20` |
| 🌿 | Lifestyle | `14` |
| 📰 | News | `14` |
| 🌏 | International | `12` |
| 📖 | Documentary | `11` |
| 🎵 | Music | `7` |
| ✝️ | Religious | `7` |
| 🎓 | Educational | `2` |
| 🏛️ | Government | `3` |
| | **Total** | **`233+`** |

</div>

---

### ⚙️ &nbsp;How It Works

```
  ╔══════════════════════════════════════╗
  ║   Runs daily at midnight  (GMT+8)    ║
  ╚══════════════════╦═══════════════════╝
                     ║
                     ▼
         Fetches latest data from source
                     ║
                     ▼
       Computes SHA-256 content fingerprint
                     ║
          ┌──────────┸──────────┐
          ▼                     ▼
    Unchanged?            Changes found?
    Skip commit         Merge into dataset
                              ║
                              ▼
                   ✦  Entries never removed
                   ✦  New entries appended
                   ✦  Outdated data refreshed
                              ║
                              ▼
                  Commit with change summary
          "[date] Total: 233 | New: 5 | Updated: 12"
```

---

### 🛡️ &nbsp;Reliability

<div align="center">

| | Feature | Description |
|:---:|:---|:---|
| 🔒 | **Permanent entries** | Nothing is ever removed — even if the upstream source drops it |
| 💾 | **Local backup** | Full snapshot in `channels-backup.json` acts as a permanent safety net |
| 🧮 | **Smart commits** | SHA-256 fingerprint prevents commits from timestamp-only changes |
| 🔄 | **Source resilience** | If upstream goes offline, local backup serves as complete fallback |

</div>

---

<details>
<summary>&nbsp;📁 &nbsp;<b>Repository Structure</b> &nbsp;·&nbsp; <i>click to expand</i></summary>
<br/>

```
fctv/
├── 📄  channels-all.m3u        ←  Primary data file
├── 🗄️   channels-backup.json    ←  Full local backup with metadata
├── 🔑  channels.hash           ←  SHA-256 fingerprint for change detection
├── 🐍  generate.py             ←  Fetch, merge, and build script
└── 📁  .github/workflows/
         └── update-index.yml   ←  Daily automation schedule
```

</details>

<details>
<summary>&nbsp;🔒 &nbsp;<b>Preserved Entries</b> &nbsp;·&nbsp; <i>click to expand</i></summary>
<br/>

These entries are absent from the upstream source but permanently kept in the local backup:

<div align="center">

| Entry | Status |
|:---|:---:|
| 𝗞𝗮𝗽𝗮𝗺𝗶𝗹𝘆𝗮 𝗖𝗵𝗮𝗻𝗻𝗲𝗹 | 🔒 Local only |
| 𝗢𝗻𝗲 𝗣𝗛 | 🔒 Local only |
| 𝗢𝗻𝗲 𝗦𝗽𝗼𝗿𝘁𝘀 | 🔒 Local only |
| 𝗢𝗻𝗲 𝗦𝗽𝗼𝗿𝘁𝘀+ | 🔒 Local only |
| 𝗧𝗩𝗡 𝗠𝗼𝘃𝗶𝗲𝘀 | 🔒 Local only |
| 𝗙𝟭 𝗧𝗩 (𝟭) | 🔒 Local only |
| 𝗙𝟭 𝗧𝗩 (𝟮) | 🔒 Local only |

</div>
</details>

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:21262d,50:161b22,100:0d1117&height=120&section=footer" width="100%" />

<div align="center">
<sub>
  Auto-maintained by GitHub Actions &nbsp;·&nbsp; Personal use only &nbsp;·&nbsp; Not for redistribution
</sub>
</div>
