# Top 5 Unique Games per System

One pass through all 41 emulated systems in this collection. **"Unique" is the selection rule, not a tiebreaker:** each pick had to be a game you can only really have *on that system* — a hardware exclusive, a region-locked release, or a version so far ahead of its ports that the others don't count. Where a platform's whole identity is arcade conversions (CPS boards, ColecoVision), the pick is the board/console the game was *built for*.

Each entry carries a `canon_score` — a **curated 0–100 index** of how strongly the title sits in the retro canon (contemporary reception + retrospective standing + how often it gets re-released or re-ranked). It is an editorial construct built for this collection, not a scraped Metacritic figure, and `analysis.ipynb` treats it as exactly that: an ordinal judgement to be tested against independent data (hardware install base, library size, release timing).

Source of truth is `data/games.csv` + `data/systems.csv`. This file is generated — run `python3 scripts/build_markdown.py` after editing the data.

## Contents

**Nintendo** — [NES](#1-nes) · [Famicom](#2-famicom) · [Super Nintendo](#3-super-nintendo) · [Super Famicom](#4-super-famicom) · [Nintendo 64](#5-nintendo-64) · [Game Boy](#6-game-boy) · [Game Boy Color](#7-game-boy-color) · [Game Boy Advance](#8-game-boy-advance) · [Virtual Boy](#9-virtual-boy) · [Pokemon Mini](#10-pokemon-mini) · [Game & Watch](#11-game--watch)

**Sega** — [Mega Drive / Genesis](#12-mega-drive--genesis) · [Master System](#13-master-system) · [Game Gear](#14-game-gear) · [SG-1000](#15-sg-1000) · [Sega CD](#16-sega-cd)

**NEC** — [PC Engine / TurboGrafx-16](#17-pc-engine--turbografx-16) · [PC Engine CD](#18-pc-engine-cd) · [SuperGrafx](#19-supergrafx)

**Sony** — [PlayStation](#20-playstation) · [PlayStation Portable](#21-playstation-portable)

**Arcade** — [Capcom CPS-1](#22-capcom-cps-1) · [Capcom CPS-2](#23-capcom-cps-2) · [Capcom CPS-3](#24-capcom-cps-3) · [Neo Geo](#25-neo-geo) · [MAME 2003-Plus](#26-mame-2003-plus)

**Handhelds** — [Neo Geo Pocket](#27-neo-geo-pocket) · [Neo Geo Pocket Color](#28-neo-geo-pocket-color) · [WonderSwan](#29-wonderswan) · [WonderSwan Color](#30-wonderswan-color) · [Atari Lynx](#31-atari-lynx)

**Atari & early consoles** — [Atari 2600](#32-atari-2600) · [Atari 7800](#33-atari-7800) · [Odyssey 2 / Videopac](#34-odyssey-2--videopac) · [Intellivision](#35-intellivision) · [ColecoVision](#36-colecovision)

**Computers** — [MSX](#37-msx) · [MSX2](#38-msx2) · [ZX Spectrum](#39-zx-spectrum) · [Amstrad CPC](#40-amstrad-cpc)

**Ports** — [Ports](#41-ports)

---

# Nintendo

## 1. NES

> Nintendo · Console · launched 1983 · gen 3 · Cartridge · 8-bit · 61.91M units · ~1400 titles
>
> Western branding of the Famicom (US 1985); 61.91M is the combined NES/Famicom figure.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Super Mario Bros. 3** | 1988 | Platformer | Nintendo R&D4 | exclusive | 99 |
| 2 | **The Legend of Zelda** | 1986 | Action-adventure | Nintendo R&D4 | exclusive | 98 |
| 3 | **Mega Man 2** | 1988 | Action-platformer | Capcom | exclusive | 94 |
| 4 | **Castlevania III: Dracula's Curse** | 1989 | Action-platformer | Konami | exclusive | 92 |
| 5 | **Kirby's Adventure** | 1993 | Platformer | HAL Laboratory | exclusive | 90 |

- **Super Mario Bros. 3** — The 8-bit platformer's final form: world map, suits, scrolling that never stutters.
- **The Legend of Zelda** — Battery-backed saves invented the long-form console game.
- **Mega Man 2** — Non-linear stage select plus the best NES soundtrack ever authored.
- **Castlevania III: Dracula's Curse** — Branching paths and swappable partners; the VRC6 chip adds three audio channels.
- **Kirby's Adventure** — Shipped in 1993 on hardware from 1983 and still looks impossible.

## 2. Famicom

> Nintendo · Console · launched 1983 · gen 3 · Cartridge · 8-bit · 61.91M units · ~1050 titles
>
> Same hardware as NES; ~300 titles never left Japan.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Mother** | 1989 | RPG | Ape / Nintendo | region-locked | 93 |
| 2 | **Fire Emblem: Ankoku Ryu to Hikari no Tsurugi** | 1990 | Tactical RPG | Intelligent Systems | region-locked | 91 |
| 3 | **Sweet Home** | 1989 | Survival horror | Capcom | region-locked | 90 |
| 4 | **Gimmick!** | 1992 | Platformer | Sunsoft | region-locked | 89 |
| 5 | **Summer Carnival '92: Recca** | 1992 | Shoot 'em up | Naxat Soft | region-locked | 86 |

- **Mother** — Shigesato Itoi's suburban-America RPG; no English release until 2015.
- **Fire Emblem: Ankoku Ryu to Hikari no Tsurugi** — Permadeath tactics RPG; the series' first 13 years were Japan-only.
- **Sweet Home** — The direct design ancestor of Resident Evil, down to the mansion.
- **Gimmick!** — Physics-driven star projectile and an expanded-sound-chip score.
- **Summer Carnival '92: Recca** — A competition prize cart that pushes more sprites than the NES should allow.

## 3. Super Nintendo

> Nintendo · Console · launched 1990 · gen 4 · Cartridge · 16-bit · 49.10M units · ~1750 titles
>
> US launch 1991; Mode 7 + S-SMP audio defined the 16-bit look and sound.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Super Metroid** | 1994 | Metroidvania | Nintendo R&D1 | exclusive | 99 |
| 2 | **Chrono Trigger** | 1995 | RPG | Square | exclusive | 99 |
| 3 | **The Legend of Zelda: A Link to the Past** | 1991 | Action-adventure | Nintendo EAD | exclusive | 98 |
| 4 | **Super Mario World** | 1990 | Platformer | Nintendo EAD | exclusive | 97 |
| 5 | **Donkey Kong Country** | 1994 | Platformer | Rare | exclusive | 92 |

- **Super Metroid** — Environmental storytelling with zero cutscenes; the genre's reference text.
- **Chrono Trigger** — Multiple endings, no random encounters, Toriyama + Mitsuda + the Dream Team.
- **The Legend of Zelda: A Link to the Past** — Two overlaid worlds; the template every top-down Zelda still follows.
- **Super Mario World** — Cape physics, Yoshi, and a secret-exit map that rewards obsession.
- **Donkey Kong Country** — Pre-rendered SGI sprites made a 16-bit machine look next-gen.

## 4. Super Famicom

> Nintendo · Console · launched 1990 · gen 4 · Cartridge · 16-bit · 49.10M units · ~1450 titles
>
> JP library is ~2x the US RPG count.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Seiken Densetsu 3** | 1995 | Action RPG | Square | region-locked | 93 |
| 2 | **Fire Emblem: Seisen no Keifu** | 1996 | Tactical RPG | Intelligent Systems | region-locked | 92 |
| 3 | **Bahamut Lagoon** | 1996 | Tactical RPG | Square | region-locked | 88 |
| 4 | **Rudra no Hihou** | 1996 | RPG | Square | region-locked | 86 |
| 5 | **Umihara Kawase** | 1994 | Puzzle-platformer | TNN | region-locked | 85 |

- **Seiken Densetsu 3** — Six protagonists, class-change trees, three-player co-op; fan-translated for decades.
- **Fire Emblem: Seisen no Keifu** — Generational inheritance mechanics on enormous single-map chapters.
- **Bahamut Lagoon** — Square's dragon-raising SRPG; never officially localised.
- **Rudra no Hihou** — The "mantra" system lets you type spell words the engine parses.
- **Umihara Kawase** — An elastic fishing-line grapple with real spring physics in 1994.

## 5. Nintendo 64

> Nintendo · Console · launched 1996 · gen 5 · Cartridge · 64-bit · 32.93M units · ~390 titles
>
> Smallest library of its gen; analog stick + 4 controller ports.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **The Legend of Zelda: Ocarina of Time** | 1998 | Action-adventure | Nintendo EAD | exclusive | 100 |
| 2 | **Super Mario 64** | 1996 | Platformer | Nintendo EAD | exclusive | 100 |
| 3 | **GoldenEye 007** | 1997 | FPS | Rare | exclusive | 95 |
| 4 | **The Legend of Zelda: Majora's Mask** | 2000 | Action-adventure | Nintendo EAD | exclusive | 94 |
| 5 | **Banjo-Kazooie** | 1998 | Platformer | Rare | exclusive | 92 |

- **The Legend of Zelda: Ocarina of Time** — Z-targeting solved 3D combat for everyone who came after.
- **Super Mario 64** — Invented the analog 3D moveset and the free camera in one go.
- **GoldenEye 007** — Objective-based stealth shooting plus the console split-screen deathmatch.
- **The Legend of Zelda: Majora's Mask** — A three-day clock and a doomed town; the strangest first-party Nintendo game.
- **Banjo-Kazooie** — The collect-a-thon at its most tightly designed, before the genre bloated.

## 6. Game Boy

> Nintendo · Handheld · launched 1989 · gen 4 · Cartridge · 8-bit · 64.42M units · ~1050 titles
>
> 118.69M is GB+GBC combined; split here by common estimate.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Tetris** | 1989 | Puzzle | Nintendo R&D1 | multi-platform | 98 |
| 2 | **Pokemon Red / Blue** | 1996 | RPG | Game Freak | exclusive | 99 |
| 3 | **The Legend of Zelda: Link's Awakening** | 1993 | Action-adventure | Nintendo EAD | exclusive | 96 |
| 4 | **Super Mario Land 2: 6 Golden Coins** | 1992 | Platformer | Nintendo R&D1 | exclusive | 90 |
| 5 | **Metroid II: Return of Samus** | 1991 | Metroidvania | Nintendo R&D1 | exclusive | 88 |

- **Tetris** — The pack-in that sold the hardware; still the purest game ever bundled.
- **Pokemon Red / Blue** — Link-cable trading turned a handheld into a social network.
- **The Legend of Zelda: Link's Awakening** — A Zelda with no Zelda; dense, funny, and built for a 2.6-inch screen.
- **Super Mario Land 2: 6 Golden Coins** — Introduced Wario and a non-linear overworld at 4x the sprite size of SML1.
- **Metroid II: Return of Samus** — Isolation horror in four shades of green; no map, no mercy.

## 7. Game Boy Color

> Nintendo · Handheld · launched 1998 · gen 5 · Cartridge · 8-bit · 54.27M units · ~580 titles
>
> Backwards compatible; 118.69M GB+GBC combined.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Pokemon Gold / Silver** | 1999 | RPG | Game Freak | exclusive | 98 |
| 2 | **The Legend of Zelda: Oracle of Seasons / Ages** | 2001 | Action-adventure | Flagship / Capcom | exclusive | 93 |
| 3 | **Metal Gear: Ghost Babel** | 2000 | Stealth | Konami | exclusive | 91 |
| 4 | **Wario Land 3** | 2000 | Platformer | Nintendo R&D1 | exclusive | 90 |
| 5 | **Shantae** | 2002 | Platformer | WayForward | exclusive | 87 |

- **Pokemon Gold / Silver** — Two full regions, a day/night clock, and breeding on 8-bit hardware.
- **The Legend of Zelda: Oracle of Seasons / Ages** — Two games that link into one via password; Capcom out-Zelda-ing Nintendo.
- **Metal Gear: Ghost Babel** — A full top-down MGS with codec drama and VR missions, built in 8-bit.
- **Wario Land 3** — An invincible protagonist turns a platformer into a lock-and-key puzzle box.
- **Shantae** — Released after the GBA launched; the most technically absurd GBC game ever.

## 8. Game Boy Advance

> Nintendo · Handheld · launched 2001 · gen 6 · Cartridge · 32-bit · 81.51M units · ~1500 titles
>
> 32-bit ARM7 handheld; the 2D craft endpoint.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Metroid Fusion** | 2002 | Metroidvania | Nintendo R&D1 | exclusive | 95 |
| 2 | **Castlevania: Aria of Sorrow** | 2003 | Metroidvania | Konami | exclusive | 94 |
| 3 | **Mother 3** | 2006 | RPG | Brownie Brown / HAL | region-locked | 93 |
| 4 | **Advance Wars** | 2001 | Tactical | Intelligent Systems | exclusive | 92 |
| 5 | **WarioWare, Inc.: Mega Microgame$!** | 2003 | Minigame | Nintendo R&D1 | exclusive | 91 |

- **Metroid Fusion** — An original Metroid built for the hardware, with the SA-X turning exploration into a hunt.
- **Castlevania: Aria of Sorrow** — The soul-collection system; the best-balanced Igavania.
- **Mother 3** — A rhythm combo system wrapped around the saddest script Nintendo ever shipped.
- **Advance Wars** — Perfect-information turn-based war with zero randomness.
- **WarioWare, Inc.: Mega Microgame$!** — 200 five-second games; invented the microgame as a form.

## 9. Virtual Boy

> Nintendo · Console · launched 1995 · gen 5 · Cartridge · 32-bit · 0.77M units · ~22 titles
>
> Commercial failure; 22 games total, 14 in the West.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Virtual Boy Wario Land** | 1995 | Platformer | Nintendo R&D1 | exclusive | 88 |
| 2 | **Jack Bros.** | 1995 | Action | Atlus | exclusive | 80 |
| 3 | **Teleroboxer** | 1995 | Fighting | Nintendo R&D1 | exclusive | 74 |
| 4 | **Galactic Pinball** | 1995 | Pinball | Intelligent Systems | exclusive | 72 |
| 5 | **Red Alarm** | 1995 | Shoot 'em up | T&E Soft | exclusive | 68 |

- **Virtual Boy Wario Land** — Uses the parallax layers as actual level geometry you move between.
- **Jack Bros.** — The first Megami Tensei game released in the West, on the worst possible console.
- **Teleroboxer** — First-person boxing where the stereoscopy genuinely helps you read punches.
- **Galactic Pinball** — Depth makes the table read correctly; the system's best-feeling game.
- **Red Alarm** — Wireframe 3D combat; unreadable and fascinating in equal measure.

## 10. Pokemon Mini

> Nintendo · Handheld · launched 2001 · gen 6 · Cartridge · 8-bit · <0.01M units · ~10 titles
>
> Smallest cartridge console ever made; exactly 10 games.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Pokemon Puzzle Collection** | 2001 | Puzzle | Jupiter | exclusive | 72 |
| 2 | **Pokemon Pinball mini** | 2001 | Pinball | Jupiter | exclusive | 68 |
| 3 | **Pokemon Tetris** | 2002 | Puzzle | Jupiter | exclusive | 66 |
| 4 | **Pichu Bros. mini** | 2002 | Minigame | Jupiter | region-locked | 62 |
| 5 | **Pokemon Zany Cards** | 2001 | Card | Jupiter | exclusive | 60 |

- **Pokemon Puzzle Collection** — Three solid puzzle modes; the most game on the smallest cartridge console.
- **Pokemon Pinball mini** — Uses the built-in rumble and tilt sensor as core mechanics.
- **Pokemon Tetris** — Tetris with a catching meta-layer on a 96x64 screen.
- **Pichu Bros. mini** — Five minigames; Japan-only and the system's most charming cart.
- **Pokemon Zany Cards** — Five card rulesets including a full Uno clone with AI personalities.

## 11. Game & Watch

> Nintendo · Handheld · launched 1980 · gen 1 · Built-in · 4-bit · 43.40M units · ~60 titles
>
> One game per unit; invented the D-pad.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Donkey Kong** | 1982 | Platformer | Nintendo R&D1 | exclusive | 95 |
| 2 | **Ball** | 1980 | Action | Nintendo R&D1 | exclusive | 88 |
| 3 | **Fire** | 1980 | Action | Nintendo R&D1 | exclusive | 82 |
| 4 | **Mario Bros.** | 1983 | Action | Nintendo R&D1 | exclusive | 80 |
| 5 | **Zelda** | 1989 | Action-adventure | Nintendo R&D1 | exclusive | 78 |

- **Donkey Kong** — The dual-screen clamshell and the first cross-shaped D-pad.
- **Ball** — Unit one. Juggling. The entire handheld industry starts here.
- **Fire** — Timing-based rescue loop; the purest score-chase in the line.
- **Mario Bros.** — Two-screen conveyor coordination with both hands doing different jobs.
- **Zelda** — A full dungeon crawl with items and bosses rendered in fixed LCD segments.

---

# Sega

## 12. Mega Drive / Genesis

> Sega · Console · launched 1988 · gen 4 · Cartridge · 16-bit · 34.06M units · ~900 titles
>
> 68000 + YM2612 FM; Sega's only real win vs Nintendo.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Sonic the Hedgehog 2** | 1992 | Platformer | Sega Technical Institute | exclusive | 96 |
| 2 | **Gunstar Heroes** | 1993 | Run and gun | Treasure | exclusive | 95 |
| 3 | **Streets of Rage 2** | 1992 | Beat 'em up | Ancient / Sega | exclusive | 95 |
| 4 | **Phantasy Star IV** | 1993 | RPG | Sega | exclusive | 93 |
| 5 | **Ristar** | 1995 | Platformer | Sega | exclusive | 88 |

- **Sonic the Hedgehog 2** — Spin dash plus split-screen versus; Sega's commercial and design peak.
- **Gunstar Heroes** — Weapon-combination system and sprite scaling nobody else attempted.
- **Streets of Rage 2** — Yuzo Koshiro's FM house soundtrack and the genre's best-weighted hits.
- **Phantasy Star IV** — Manga-panel cutscenes and combo macros; closes a four-game arc.
- **Ristar** — Grab-and-throw traversal; released into the Saturn's shadow and forgotten.

## 13. Master System

> Sega · Console · launched 1985 · gen 3 · Cartridge · 8-bit · 13.00M units · ~320 titles
>
> Dominant in Brazil and PAL Europe, not the US.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Phantasy Star** | 1987 | RPG | Sega | exclusive | 94 |
| 2 | **Wonder Boy III: The Dragon's Trap** | 1989 | Action RPG | Westone | exclusive | 93 |
| 3 | **Golden Axe Warrior** | 1991 | Action-adventure | Sega | exclusive | 86 |
| 4 | **Alex Kidd in Miracle World** | 1986 | Platformer | Sega | exclusive | 84 |
| 5 | **Sonic the Hedgehog** | 1991 | Platformer | Ancient | exclusive | 82 |

- **Phantasy Star** — First-person animated 3D dungeons and a female lead, in 1987.
- **Wonder Boy III: The Dragon's Trap** — Animal transformations as a metroidvania key system.
- **Golden Axe Warrior** — An unapologetic Zelda clone that is genuinely as good as Zelda.
- **Alex Kidd in Miracle World** — Built into the console in some regions; janky, inventive, janken bosses.
- **Sonic the Hedgehog** — A completely different game from the 16-bit one, with its own level design.

## 14. Game Gear

> Sega · Handheld · launched 1990 · gen 4 · Cartridge · 8-bit · 14.00M units · ~370 titles
>
> Backlit colour handheld; 6 hours on 6 AAs.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Shining Force: The Sword of Hajya** | 1993 | Tactical RPG | Sonic! Software Planning | exclusive | 88 |
| 2 | **Sonic the Hedgehog: Triple Trouble** | 1994 | Platformer | Aspect | exclusive | 86 |
| 3 | **Defenders of Oasis** | 1992 | RPG | Sega | exclusive | 83 |
| 4 | **The GG Shinobi** | 1991 | Action-platformer | Sega | exclusive | 82 |
| 5 | **Land of Illusion starring Mickey Mouse** | 1992 | Platformer | Sega | exclusive | 80 |

- **Shining Force: The Sword of Hajya** — A full console-scale SRPG campaign on a handheld in 1993.
- **Sonic the Hedgehog: Triple Trouble** — The 8-bit Sonic line's best level design, not a port of anything.
- **Defenders of Oasis** — Arabian-nights RPG with a genie companion; criminally unknown.
- **The GG Shinobi** — Swap between five ninja with distinct kits to open the hub.
- **Land of Illusion starring Mickey Mouse** — Castle of Illusion's sequel line; bigger, with light RPG progression.

## 15. SG-1000

> Sega · Console · launched 1983 · gen 2 · Cartridge · 8-bit · 2.00M units · ~70 titles
>
> Launched the same day as the Famicom and lost instantly.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Girl's Garden** | 1985 | Action | Sega | exclusive | 70 |
| 2 | **Flicky** | 1984 | Action | Sega | exclusive | 68 |
| 3 | **The Castle** | 1986 | Puzzle-platformer | ASCII | exclusive | 66 |
| 4 | **Ninja Princess** | 1986 | Action | Sega | exclusive | 62 |
| 5 | **Gulkave** | 1986 | Shoot 'em up | Compile | exclusive | 60 |

- **Girl's Garden** — Yuji Naka's first game; flower-collecting with a bear chasing you.
- **Flicky** — Herd the birds home; Sega's first real original character design.
- **The Castle** — 100 rooms of key-and-door logic; the best-regarded SG-1000 game.
- **Ninja Princess** — Vertically scrolling shuriken stealth; later an arcade hit.
- **Gulkave** — Compile's early shooter, and the best-looking thing on the hardware.

## 16. Sega CD

> Sega · Add-on · launched 1991 · gen 4 · CD-ROM · 16-bit · 2.24M units · ~210 titles
>
> CD audio + scaling/rotation ASIC; FMV era epicentre.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Sonic CD** | 1993 | Platformer | Sega CS | exclusive | 94 |
| 2 | **Snatcher** | 1994 | Adventure | Konami | exclusive | 93 |
| 3 | **Lunar: The Silver Star** | 1993 | RPG | Game Arts | exclusive | 90 |
| 4 | **Popful Mail** | 1994 | Action RPG | Falcom / Working Designs | exclusive | 86 |
| 5 | **Final Fight CD** | 1993 | Beat 'em up | Sega | exclusive | 84 |

- **Sonic CD** — Time travel changes the level geometry; two full soundtracks.
- **Snatcher** — Kojima's cyberpunk visual novel; the only English console release it ever got.
- **Lunar: The Silver Star** — Animated cutscenes and a sung theme; the CD RPG that justified the add-on.
- **Popful Mail** — Falcom action-RPG with a fully voiced comedy script.
- **Final Fight CD** — The arcade-complete Final Fight nobody else managed, with CD audio.

---

# NEC

## 17. PC Engine / TurboGrafx-16

> NEC · Console · launched 1987 · gen 4 · HuCard · 8-bit · 10.00M units · ~320 titles
>
> 8-bit CPU, 16-bit video; #1 in Japan in 1988.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Blazing Lazers** | 1989 | Shoot 'em up | Compile | exclusive | 93 |
| 2 | **Devil's Crush** | 1990 | Pinball | Compile | exclusive | 92 |
| 3 | **Bonk's Adventure** | 1990 | Platformer | Red Company / Atlus | exclusive | 89 |
| 4 | **Soldier Blade** | 1992 | Shoot 'em up | Hudson Soft | exclusive | 88 |
| 5 | **Military Madness** | 1989 | Turn-based strategy | Hudson Soft | exclusive | 87 |

- **Blazing Lazers** — Gradius-grade weapon layering; the shooter that defined the hardware.
- **Devil's Crush** — A pinball table with bosses, HP bars, and a death-metal score.
- **Bonk's Adventure** — Headbutt physics and meat-powered rage modes; NEC's mascot attempt.
- **Soldier Blade** — The Star Soldier line's cleanest entry, with 2- and 5-minute score modes.
- **Military Madness** — Hex-grid lunar warfare; still one of the best console wargames.

## 18. PC Engine CD

> NEC · Add-on · launched 1988 · gen 4 · CD-ROM · 8-bit · 10.00M units · ~450 titles
>
> First CD-ROM games console add-on anywhere.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Castlevania: Rondo of Blood** | 1993 | Action-platformer | Konami | region-locked | 97 |
| 2 | **Ys Book I & II** | 1989 | Action RPG | Falcom / Hudson | exclusive | 95 |
| 3 | **Lords of Thunder** | 1993 | Shoot 'em up | Hudson / Red | exclusive | 94 |
| 4 | **Gate of Thunder** | 1992 | Shoot 'em up | Red Company | exclusive | 91 |
| 5 | **Sapphire** | 1995 | Shoot 'em up | Hudson Soft | region-locked | 88 |

- **Castlevania: Rondo of Blood** — Branching stages, a second playable character, and Redbook audio.
- **Ys Book I & II** — Voice acting and a CD score in 1989; the first great CD-ROM game.
- **Lords of Thunder** — Elemental armour loadouts over a full hard-rock CD soundtrack.
- **Gate of Thunder** — The pack-in for the Duo and still a reference-grade horizontal shooter.
- **Sapphire** — Arcade CD technical showpiece; sprite counts the hardware should refuse.

## 19. SuperGrafx

> NEC · Console · launched 1989 · gen 4 · HuCard · 8-bit · 0.06M units · ~7 titles
>
> 5 dedicated games + 2 hybrids. That is the whole library.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Daimakaimura (Ghouls 'n Ghosts)** | 1990 | Action-platformer | Capcom / NEC Avenue | region-locked | 84 |
| 2 | **Aldynes** | 1991 | Shoot 'em up | Hudson Soft | region-locked | 80 |
| 3 | **1941: Counter Attack** | 1991 | Shoot 'em up | Capcom / Hudson | region-locked | 76 |
| 4 | **Madou King Granzort** | 1990 | Action | Hudson Soft | region-locked | 62 |
| 5 | **Battle Ace** | 1989 | Shoot 'em up | Hudson Soft | region-locked | 50 |

- **Daimakaimura (Ghouls 'n Ghosts)** — The single reason to own the hardware; near-arcade parallax.
- **Aldynes** — Built from scratch for the dual-VDC; the only original SuperGrafx shooter of note.
- **1941: Counter Attack** — The last SuperGrafx exclusive ever released.
- **Madou King Granzort** — Anime tie-in platformer; mostly a curiosity.
- **Battle Ace** — The launch title, alone on the system for four months, and not good.

---

# Sony

## 20. PlayStation

> Sony · Console · launched 1994 · gen 5 · CD-ROM · 32-bit · 102.49M units · ~4100 titles
>
> First console past 100M; killed the cartridge.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Metal Gear Solid** | 1998 | Stealth | Konami | exclusive | 99 |
| 2 | **Final Fantasy VII** | 1997 | RPG | Square | exclusive | 99 |
| 3 | **Castlevania: Symphony of the Night** | 1997 | Metroidvania | Konami | multi-platform | 98 |
| 4 | **Resident Evil 2** | 1998 | Survival horror | Capcom | multi-platform | 95 |
| 5 | **Gran Turismo** | 1997 | Racing | Polyphony Digital | exclusive | 94 |

- **Metal Gear Solid** — Cinematic direction, fourth-wall breaks, and stealth as a full genre.
- **Final Fantasy VII** — Pre-rendered backgrounds and a 3-disc script; made RPGs mainstream in the West.
- **Castlevania: Symphony of the Night** — Named half a genre; the inverted castle is still a structural flex.
- **Resident Evil 2** — Two interlocking scenarios; fixed cameras used as deliberate dread.
- **Gran Turismo** — Licence tests and 140 cars; the simulation racer arrives on console.

## 21. PlayStation Portable

> Sony · Handheld · launched 2004 · gen 7 · UMD · 32-bit · 82.50M units · ~1900 titles
>
> Console-class 3D in a handheld.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Metal Gear Solid: Peace Walker** | 2010 | Stealth | Kojima Productions | exclusive | 93 |
| 2 | **Monster Hunter Freedom Unite** | 2008 | Action RPG | Capcom | exclusive | 92 |
| 3 | **Patapon** | 2007 | Rhythm/Strategy | Pyramid / JAPAN Studio | exclusive | 90 |
| 4 | **God of War: Chains of Olympus** | 2008 | Action | Ready at Dawn | exclusive | 88 |
| 5 | **LocoRoco** | 2006 | Platformer | JAPAN Studio | exclusive | 86 |

- **Metal Gear Solid: Peace Walker** — Base management plus co-op; a mainline MGS built for a handheld.
- **Monster Hunter Freedom Unite** — Ad-hoc multiplayer made this the biggest handheld game in Japan.
- **Patapon** — Four drum inputs command an army; nothing else plays like it.
- **God of War: Chains of Olympus** — Proved a handheld could carry a full-scale action-adventure.
- **LocoRoco** — You tilt the world, not the character; two shoulder buttons, total control.

---

# Arcade

## 22. Capcom CPS-1

> Capcom · Arcade · launched 1988 · gen 4 · Board · 16-bit · no install base (arcade board) · ~35 titles
>
> The Street Fighter II board.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Street Fighter II: Champion Edition** | 1992 | Fighting | Capcom | multi-platform | 99 |
| 2 | **Final Fight** | 1989 | Beat 'em up | Capcom | multi-platform | 94 |
| 3 | **Ghouls 'n Ghosts** | 1988 | Action-platformer | Capcom | multi-platform | 90 |
| 4 | **Strider** | 1989 | Action-platformer | Capcom | multi-platform | 89 |
| 5 | **Captain Commando** | 1991 | Beat 'em up | Capcom | multi-platform | 85 |

- **Street Fighter II: Champion Edition** — Playable bosses and mirror matches; the board's defining revision.
- **Final Fight** — Set the scrolling-brawler template the whole genre copied.
- **Ghouls 'n Ghosts** — Brutal, gorgeous, and the launch showcase for the hardware.
- **Strider** — Momentum-based acrobatics and set-pieces far beyond 1989 norms.
- **Captain Commando** — Four wildly asymmetric characters, each with a mech suit.

## 23. Capcom CPS-2

> Capcom · Arcade · launched 1993 · gen 5 · Board · 16-bit · no install base (arcade board) · ~45 titles
>
> Encrypted "suicide battery" board; peak 2D Capcom.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Marvel vs. Capcom: Clash of Super Heroes** | 1998 | Fighting | Capcom | multi-platform | 95 |
| 2 | **Street Fighter Alpha 3** | 1998 | Fighting | Capcom | multi-platform | 94 |
| 3 | **Alien vs. Predator** | 1994 | Beat 'em up | Capcom | never ported | 93 |
| 4 | **Dungeons & Dragons: Shadow over Mystara** | 1996 | Beat 'em up | Capcom | multi-platform | 92 |
| 5 | **Progear** | 2001 | Shoot 'em up | Cave / Capcom | multi-platform | 89 |

- **Marvel vs. Capcom: Clash of Super Heroes** — Assists and tag-outs; the crossover-fighter formula locks in here.
- **Street Fighter Alpha 3** — Three selectable combat systems and 30+ characters.
- **Alien vs. Predator** — The best-looking brawler ever made and still never ported.
- **Dungeons & Dragons: Shadow over Mystara** — Inventory, branching routes, and spell systems inside a brawler.
- **Progear** — Cave's only Capcom board shooter; the last CPS-2 release.

## 24. Capcom CPS-3

> Capcom · Arcade · launched 1996 · gen 5 · Board · 32-bit · no install base (arcade board) · ~6 titles
>
> Exactly 6 games; highest-resolution 2D sprite work of the era.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Street Fighter III: 3rd Strike** | 1999 | Fighting | Capcom | multi-platform | 99 |
| 2 | **JoJo's Bizarre Adventure: Heritage for the Future** | 1999 | Fighting | Capcom | multi-platform | 90 |
| 3 | **Street Fighter III: 2nd Impact** | 1997 | Fighting | Capcom | multi-platform | 87 |
| 4 | **Red Earth** | 1996 | Fighting | Capcom | never ported | 84 |
| 5 | **Street Fighter III: New Generation** | 1997 | Fighting | Capcom | multi-platform | 80 |

- **Street Fighter III: 3rd Strike** — Parries. Twenty-five years of competitive play and still unsolved.
- **JoJo's Bizarre Adventure: Heritage for the Future** — Stand on/off as a second resource layer; one of the weirdest great fighters.
- **Street Fighter III: 2nd Impact** — Added Urien and parry-timing refinements; the bridge to 3rd Strike.
- **Red Earth** — RPG levelling in an arcade fighter; the launch title, unported until 2022.
- **Street Fighter III: New Generation** — The risky reboot: all-new roster, hand-animated at absurd frame counts.

## 25. Neo Geo

> SNK · Arcade · launched 1990 · gen 4 · Cartridge · 16-bit · 0.41M units · ~150 titles
>
> Identical arcade and home hardware; 14-year lifespan.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Metal Slug 3** | 2000 | Run and gun | SNK | multi-platform | 97 |
| 2 | **Garou: Mark of the Wolves** | 1999 | Fighting | SNK | multi-platform | 96 |
| 3 | **The King of Fighters '98** | 1998 | Fighting | SNK | multi-platform | 95 |
| 4 | **The Last Blade 2** | 1998 | Fighting | SNK | multi-platform | 94 |
| 5 | **Samurai Shodown II** | 1994 | Fighting | SNK | multi-platform | 93 |

- **Metal Slug 3** — Branching paths and animation density nobody has matched since.
- **Garou: Mark of the Wolves** — The T.O.P. system and just-defend; SNK's mechanical high point.
- **The King of Fighters '98** — No story, just the roster; the series' balance benchmark.
- **The Last Blade 2** — Speed/power stance split over the prettiest sprite work SNK ever drew.
- **Samurai Shodown II** — Weapon clashes and one-hit-kill tension; deflection as a core system.

## 26. MAME 2003-Plus

> Various · Arcade · launched 1975 · gen 2 · Board · 8-bit · no install base (arcade board) · ~4000 titles
>
> Curated set of the golden-age coin-op canon.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Pac-Man** | 1980 | Maze | Namco | multi-platform | 100 |
| 2 | **Donkey Kong** | 1981 | Platformer | Nintendo R&D1 | multi-platform | 98 |
| 3 | **Galaga** | 1981 | Shoot 'em up | Namco | multi-platform | 95 |
| 4 | **Robotron: 2084** | 1982 | Twin-stick shooter | Vid Kidz / Williams | multi-platform | 94 |
| 5 | **Bubble Bobble** | 1986 | Puzzle-platformer | Taito | multi-platform | 92 |

- **Pac-Man** — Non-violent, pattern-based, and the first game with a mass audience.
- **Donkey Kong** — Cutscenes, a story, and jumping; Miyamoto's first design.
- **Galaga** — Capture-and-dual-fighter risk/reward on top of Galaxian.
- **Robotron: 2084** — Invented twin-stick controls; still one of the hardest games ever shipped.
- **Bubble Bobble** — Co-op bubble physics and a true ending that requires two players.

---

# Handhelds

## 27. Neo Geo Pocket

> SNK · Handheld · launched 1998 · gen 5 · Cartridge · 16-bit · 2.00M units · ~10 titles
>
> Mono model; microswitched clicky stick.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **King of Fighters R-1** | 1998 | Fighting | SNK | exclusive | 82 |
| 2 | **Samurai Shodown!** | 1998 | Fighting | SNK | exclusive | 78 |
| 3 | **Baseball Stars** | 1998 | Sports | SNK | exclusive | 72 |
| 4 | **Puzzle Link** | 1999 | Puzzle | Yumekobo | exclusive | 70 |
| 5 | **Neo Geo Cup '98** | 1998 | Sports | SNK | exclusive | 66 |

- **King of Fighters R-1** — A real KOF on a mono handheld, built around the clicky microswitch stick.
- **Samurai Shodown!** — Weapon fighting with chibi sprites; the mono library's other standout.
- **Baseball Stars** — Launch title; deep enough that people still rank it over the colour sports games.
- **Puzzle Link** — Connect-the-pairs under time pressure; a perfect one-AA-battery game.
- **Neo Geo Cup '98** — Arcadey football with the arcade series' feel intact.

## 28. Neo Geo Pocket Color

> SNK · Handheld · launched 1999 · gen 5 · Cartridge · 16-bit · 2.00M units · ~85 titles
>
> Best fighting-game handheld ever built.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **SNK vs. Capcom: The Match of the Millennium** | 1999 | Fighting | SNK | exclusive | 96 |
| 2 | **Sonic the Hedgehog Pocket Adventure** | 1999 | Platformer | SNK / Sega | exclusive | 90 |
| 3 | **SNK vs. Capcom: Card Fighters' Clash** | 1999 | Card battle | SNK | exclusive | 89 |
| 4 | **Faselei!** | 1999 | Tactical RPG | Sacnoth | region-locked | 85 |
| 5 | **Metal Slug: 2nd Mission** | 2000 | Run and gun | SNK | exclusive | 83 |

- **SNK vs. Capcom: The Match of the Millennium** — The best handheld fighting game ever made, by a wide margin.
- **Sonic the Hedgehog Pocket Adventure** — SNK building a Sonic game, and getting the physics genuinely right.
- **SNK vs. Capcom: Card Fighters' Clash** — A deckbuilder with two rival carts; the system's cult classic.
- **Faselei!** — Programmed action queues; a mech SRPG from the Shadow Hearts team.
- **Metal Slug: 2nd Mission** — Branching mission structure built for short handheld sessions.

## 29. WonderSwan

> Bandai · Handheld · launched 1999 · gen 5 · Cartridge · 16-bit · 3.50M units · ~100 titles
>
> Gunpei Yokoi's last design; 40 hours on one AA.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Gunpey** | 1999 | Puzzle | Bandai | exclusive | 84 |
| 2 | **Klonoa: Moonlight Museum** | 1999 | Platformer | Namco | region-locked | 82 |
| 3 | **Makaimura for WonderSwan** | 1999 | Action-platformer | Capcom | region-locked | 80 |
| 4 | **Rhyme Rider Kerorican** | 2000 | Rhythm | Bandai | region-locked | 78 |
| 5 | **Terrors** | 1999 | Puzzle/Horror | Bandai | region-locked | 72 |

- **Gunpey** — Gunpei Yokoi's namesake puzzler; slide line segments into unbroken paths.
- **Klonoa: Moonlight Museum** — A real Klonoa game with the grab-and-throw loop intact in mono.
- **Makaimura for WonderSwan** — Ghosts 'n Goblins rebuilt, not downported, for a 1-bit screen.
- **Rhyme Rider Kerorican** — A rhythm-platformer hybrid years before the genre existed.
- **Terrors** — Mono horror vignettes using the vertical screen orientation.

## 30. WonderSwan Color

> Bandai · Handheld · launched 2000 · gen 5 · Cartridge · 16-bit · 3.50M units · ~90 titles
>
> Square's handheld home before the GBA deal.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Final Fantasy IV** | 2002 | RPG | Square | region-locked | 90 |
| 2 | **Riviera: The Promised Land** | 2002 | RPG | Sting | region-locked | 88 |
| 3 | **Judgement Silversword** | 2004 | Shoot 'em up | Qute | region-locked | 87 |
| 4 | **Guilty Gear Petit 2** | 2001 | Fighting | Arc System Works | region-locked | 80 |
| 5 | **Romancing SaGa** | 2001 | RPG | Square | region-locked | 78 |

- **Final Fantasy IV** — Square's remake line lived on WSC first; new art, rebalanced.
- **Riviera: The Promised Land** — Trigger-point exploration and item-durability combat; later ported widely.
- **Judgement Silversword** — Won a WonderWitch dev contest and got a real release; a bullet-hell cult legend.
- **Guilty Gear Petit 2** — Chibi Guilty Gear with the roman-cancel feel surprisingly intact.
- **Romancing SaGa** — The free-scenario SaGa structure, playable on a AA battery.

## 31. Atari Lynx

> Atari · Handheld · launched 1989 · gen 4 · Cartridge · 8-bit · 2.00M units · ~75 titles
>
> First colour backlit handheld; hardware sprite scaling.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **California Games** | 1989 | Sports | Epyx | multi-platform | 84 |
| 2 | **Chip's Challenge** | 1989 | Puzzle | Epyx | multi-platform | 83 |
| 3 | **Todd's Adventures in Slime World** | 1990 | Action | Epyx | multi-platform | 80 |
| 4 | **Blue Lightning** | 1989 | Flight | Epyx | exclusive | 76 |
| 5 | **Battlezone 2000** | 1995 | Vehicular combat | Hand Made Software | exclusive | 72 |

- **California Games** — The launch pack-in; the Lynx's hardware scaling finally justified.
- **Chip's Challenge** — 149 tile-logic levels; originated here before becoming a Windows staple.
- **Todd's Adventures in Slime World** — Six game modes and co-op over a comm-link cable.
- **Blue Lightning** — Afterburner-style scaling that no other handheld of the era could do.
- **Battlezone 2000** — Filled-polygon 3D on a 1989 handheld, released in 1995.

---

# Atari & early consoles

## 32. Atari 2600

> Atari · Console · launched 1977 · gen 2 · Cartridge · 8-bit · 30.00M units · ~500 titles
>
> Created the third-party software industry.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Pitfall!** | 1982 | Platformer | Activision | multi-platform | 96 |
| 2 | **River Raid** | 1982 | Shoot 'em up | Activision | multi-platform | 93 |
| 3 | **Yars' Revenge** | 1982 | Shoot 'em up | Atari | exclusive | 91 |
| 4 | **Adventure** | 1980 | Action-adventure | Atari | exclusive | 90 |
| 5 | **H.E.R.O.** | 1984 | Action | Activision | multi-platform | 88 |

- **Pitfall!** — 255 screens from a procedural seed in 4KB; the pre-NES platformer.
- **River Raid** — Fuel as a timer and a procedurally generated river; Carol Shaw's landmark.
- **Yars' Revenge** — The best-selling original 2600 game; the neutral zone is pure design.
- **Adventure** — The first action-adventure and the first Easter egg.
- **H.E.R.O.** — Rotor-pack flight, dynamite, and a laser helmet; late-era 2600 mastery.

## 33. Atari 7800

> Atari · Console · launched 1986 · gen 3 · Cartridge · 8-bit · 1.00M units · ~60 titles
>
> MARIA chip; arcade ports but a thin library.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Ninja Golf** | 1990 | Action/Sports | Atari | exclusive | 84 |
| 2 | **Food Fight** | 1987 | Action | Atari | multi-platform | 82 |
| 3 | **Ballblazer** | 1987 | Sports | Lucasfilm Games | multi-platform | 80 |
| 4 | **Midnight Mutants** | 1990 | Action-adventure | Atari | exclusive | 78 |
| 5 | **Alien Brigade** | 1990 | Light gun | Atari | exclusive | 72 |

- **Ninja Golf** — You golf, then fight ninjas on the walk to your ball. Genuinely great.
- **Food Fight** — MARIA's sprite count doing what the 2600 never could; the system's signature.
- **Ballblazer** — Split-screen 3D future-sport with procedurally generated music.
- **Midnight Mutants** — A Zelda-like with Grandpa Munster; the 7800's most ambitious cart.
- **Alien Brigade** — Operation Wolf-style shooting with branching paths.

## 34. Odyssey 2 / Videopac

> Magnavox · Console · launched 1978 · gen 2 · Cartridge · 8-bit · 2.00M units · ~75 titles
>
> Built-in keyboard; board-game/videogame hybrids.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **K.C. Munchkin!** | 1981 | Maze | Philips | exclusive | 82 |
| 2 | **Pick Axe Pete!** | 1982 | Platformer | Philips | exclusive | 76 |
| 3 | **Killer Bees!** | 1983 | Action | Philips | exclusive | 74 |
| 4 | **Quest for the Rings** | 1981 | Action RPG | Philips | exclusive | 72 |
| 5 | **Attack of the Timelord!** | 1983 | Shoot 'em up | Philips | exclusive | 70 |

- **K.C. Munchkin!** — Editable mazes and smart ghosts; Atari sued it off the shelves and won.
- **Pick Axe Pete!** — Ladder-and-boulder timing with a key-collection loop.
- **Killer Bees!** — Control a swarm, not a character; uses the console's weird plane-blending.
- **Quest for the Rings** — A board game plus a video game; the Master Strategy Series' best idea.
- **Attack of the Timelord!** — The system's technical showpiece and its hardest game.

## 35. Intellivision

> Mattel · Console · launched 1979 · gen 2 · Cartridge · 16-bit · 3.50M units · ~125 titles
>
> 16-bit CPU in 1979; disc controller and overlays.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Utopia** | 1981 | Strategy | Mattel | exclusive | 88 |
| 2 | **AD&D: Treasure of Tarmin** | 1983 | Dungeon crawler | Mattel | exclusive | 84 |
| 3 | **Astrosmash** | 1981 | Shoot 'em up | Mattel | exclusive | 82 |
| 4 | **Tron: Deadly Discs** | 1982 | Action | Mattel | exclusive | 80 |
| 5 | **BurgerTime** | 1982 | Platformer | Mattel | multi-platform | 78 |

- **Utopia** — The first god game / city-builder, two-player and resource-driven.
- **AD&D: Treasure of Tarmin** — First-person grid-based dungeon crawling on a console in 1983.
- **Astrosmash** — The pack-in; scoring curve engineered for the million-point chase.
- **Tron: Deadly Discs** — The disc controller's best use case; still a sharp twin-input game.
- **BurgerTime** — The best home version of the arcade game by a long way.

## 36. ColecoVision

> Coleco · Console · launched 1982 · gen 2 · Cartridge · 8-bit · 6.00M units · ~145 titles
>
> Arcade-accurate ports were the entire pitch.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Donkey Kong** | 1982 | Platformer | Coleco | multi-platform | 90 |
| 2 | **Zaxxon** | 1982 | Shoot 'em up | Coleco | multi-platform | 86 |
| 3 | **Lady Bug** | 1982 | Maze | Coleco | multi-platform | 84 |
| 4 | **Mr. Do!** | 1983 | Maze | Coleco | multi-platform | 82 |
| 5 | **Cosmic Avenger** | 1982 | Shoot 'em up | Coleco | multi-platform | 78 |

- **Donkey Kong** — The pack-in that proved arcade-accurate home ports were possible.
- **Zaxxon** — Isometric scrolling flight, close enough to the arcade to matter.
- **Lady Bug** — Rotating gates turn a Pac-Man maze into a shifting puzzle.
- **Mr. Do!** — Digging, apple-crushing, and the best-regarded ColecoVision cart.
- **Cosmic Avenger** — Launch-window horizontal shooter; showed off the TMS9918 sprites.

---

# Computers

## 37. MSX

> Microsoft/ASCII · Computer · launched 1983 · gen 3 · Cartridge/Tape · 8-bit · 5.00M units · ~1200 titles
>
> A standard, not a machine; Konami's lab.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Metal Gear** | 1987 | Stealth | Konami | region-locked | 95 |
| 2 | **The Maze of Galious** | 1987 | Metroidvania | Konami | region-locked | 92 |
| 3 | **Vampire Killer** | 1986 | Action-platformer | Konami | region-locked | 87 |
| 4 | **Penguin Adventure** | 1986 | Action | Konami | region-locked | 85 |
| 5 | **Eggerland Mystery** | 1985 | Puzzle | HAL Laboratory | region-locked | 82 |

- **Metal Gear** — Kojima's debut and the origin of avoid-don't-fight as a design rule.
- **The Maze of Galious** — Two swappable heroes over a huge interconnected castle; years ahead.
- **Vampire Killer** — The MSX2 Castlevania: key-hunting and room exploration instead of linear stages.
- **Penguin Adventure** — Kojima's first production credit; multiple endings in 1986.
- **Eggerland Mystery** — The Adventures of Lolo puzzle lineage starts here.

## 38. MSX2

> Microsoft/ASCII · Computer · launched 1985 · gen 3 · Cartridge/Disk · 8-bit · 3.00M units · ~900 titles
>
> V9938 VDP; where Kojima learned to direct.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Metal Gear 2: Solid Snake** | 1990 | Stealth | Konami | region-locked | 96 |
| 2 | **SD Snatcher** | 1990 | RPG | Konami | region-locked | 90 |
| 3 | **Space Manbow** | 1989 | Shoot 'em up | Konami | region-locked | 88 |
| 4 | **Nemesis 3: The Eve of Destruction** | 1988 | Shoot 'em up | Konami | region-locked | 86 |
| 5 | **Aleste 2** | 1989 | Shoot 'em up | Compile | region-locked | 83 |

- **Metal Gear 2: Solid Snake** — Crouching, radar, and a script that embarrasses most 32-bit games.
- **SD Snatcher** — Snatcher rebuilt as a body-part-targeting RPG.
- **Space Manbow** — The MSX2's technical ceiling: smooth scroll, huge bosses, SCC audio.
- **Nemesis 3: The Eve of Destruction** — Branching routes and a time-travel plot inside a Gradius spin-off.
- **Aleste 2** — Compile's vertical shooter line at its most polished.

## 39. ZX Spectrum

> Sinclair · Computer · launched 1982 · gen 2 · Tape · 8-bit · 5.00M units · ~24000 titles
>
> Colour clash and the UK bedroom-coder industry.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Manic Miner** | 1983 | Platformer | Matthew Smith | multi-platform | 94 |
| 2 | **Knight Lore** | 1984 | Action-adventure | Ultimate Play the Game | multi-platform | 93 |
| 3 | **Head Over Heels** | 1987 | Puzzle-platformer | Jon Ritman / Bernie Drummond | multi-platform | 92 |
| 4 | **Elite** | 1984 | Space trading | Bell & Braben | multi-platform | 91 |
| 5 | **Jet Set Willy** | 1984 | Platformer | Matthew Smith | multi-platform | 88 |

- **Manic Miner** — 20 single-screen rooms, in-game music on a beeper; the UK canon's origin.
- **Knight Lore** — Filmation isometric engine; invented a visual language overnight.
- **Head Over Heels** — Two characters with different abilities who combine into one unit.
- **Elite** — An open galaxy in 48KB; procedural generation as a survival tactic.
- **Jet Set Willy** — A 60-room mansion and the most famous bug in British gaming.

## 40. Amstrad CPC

> Amstrad · Computer · launched 1984 · gen 3 · Tape/Disk · 8-bit · 3.00M units · ~6000 titles
>
> Better palette than the Spectrum, worse scrolling.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **Prehistorik 2** | 1993 | Platformer | Titus | multi-platform | 89 |
| 2 | **Get Dexter! (Crafton & Xunk)** | 1986 | Isometric adventure | ERE Informatique | multi-platform | 88 |
| 3 | **Sorcery+** | 1985 | Action-adventure | Virgin Games | multi-platform | 86 |
| 4 | **Megablasters** | 1994 | Action | Radical Software | exclusive | 84 |
| 5 | **Super Cauldron** | 1993 | Platformer | Titus | multi-platform | 80 |

- **Prehistorik 2** — The CPC's showcase: 16-colour parallax that the Spectrum could not touch.
- **Get Dexter! (Crafton & Xunk)** — Isometric puzzle-adventure with timed NPC routines; a CPC high-water mark.
- **Sorcery+** — The expanded CPC version with extra rooms; flick-screen rescue adventure.
- **Megablasters** — A CPC-exclusive Bomberman done better than most licensed versions.
- **Super Cauldron** — Late-era CPC with full-colour sprite animation and real scrolling.

---

# Ports

## 41. Ports

> Open source · Ports · launched 1993 · gen 5 · Source port · 32-bit · no install base (source ports) · ~40 titles
>
> Not emulation: native rebuilds of released engines from source.

| # | Game | Year | Genre | Developer | Availability | canon |
|---|------|------|-------|-----------|--------------|-------|
| 1 | **DOOM** | 1993 | FPS | id Software | multi-platform | 99 |
| 2 | **Quake** | 1996 | FPS | id Software | multi-platform | 96 |
| 3 | **Cave Story** | 2004 | Metroidvania | Daisuke Amaya | multi-platform | 94 |
| 4 | **Tomb Raider (OpenLara)** | 1996 | Action-adventure | Core Design | multi-platform | 90 |
| 5 | **OpenTyrian (Tyrian)** | 1995 | Shoot 'em up | Eclipse Productions | multi-platform | 86 |

- **DOOM** — The source release made it the most ported game in history; runs anywhere.
- **Quake** — True polygonal 3D plus the modding culture that produced modern FPS design.
- **Cave Story** — One person, five years, freeware; the indie era's founding document.
- **Tomb Raider (OpenLara)** — An open reimplementation; the original 3D-platformer-with-guns.
- **OpenTyrian (Tyrian)** — Shareware vertical shooter with a deep upgrade economy, now GPL.

---

# Tools

The one category with no games in it. Listed for completeness — these are what actually run everything above.

| Tool | Purpose | Why it matters |
|------|---------|----------------|
| **RetroArch** | Multi-system frontend | The libretro host every core listed here plugs into |
| **mGBA / SameBoy** | Accuracy-first GB/GBA cores | Use over gpSP/VBA when timing-sensitive games glitch |
| **Mesen / Nestopia UE** | Cycle-accurate NES/Famicom | Mesen for debugging, Nestopia UE for low-overhead play |
| **bsnes / Snes9x** | SNES accuracy vs speed | bsnes for coprocessor carts, Snes9x when CPU is tight |
| **ScummVM** | Point-and-click engine host | Not an emulator: reimplements the engines, so it runs ports natively |

---

## Method & caveats

- **Availability** is judged at original release. `region-locked` means it never got an official release outside Japan (or, for a few PAL titles, outside Europe) during the system's life; later Virtual Console / collection re-releases are ignored, because they are not what made the game unique to the hardware.
- **Hardware units** are lifetime shipped figures from published manufacturer or encyclopaedic sources. Two caveats carried in the data: the 61.91M NES figure is NES+Famicom combined (same for SNES/Super Famicom at 49.10M), and Nintendo only ever reported Game Boy and Game Boy Color together (118.69M) — the 64.42M / 54.27M split used here is the common estimate, not an official number.
- **Software sales** are left blank wherever no credible figure is published. That is most of the obscure library on purpose: the notebook analyses the missingness rather than imputing through it, because the gaps are not random — they track commercial obscurity, which is exactly the variable under test.
- **ColecoVision at 6.00M** is the as-of-1984 figure; lower numbers circulate.
- **`canon_score` is editorial.** It is reproducible (one author, one pass, one rubric) but not independent of the author. The notebook's central check is whether it correlates with things nobody curated — and where it doesn't.

