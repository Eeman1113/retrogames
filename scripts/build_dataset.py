#!/usr/bin/env python3
"""
build_dataset.py — single source of truth for the retrogames collection.

Emits:
  data/systems.csv  — one row per emulated system (hardware facts)
  data/games.csv    — one row per curated pick (5 per system)
  data/tools.csv    — the non-game "Tools" category

Everything downstream (TOP5_GAMES.md, analysis.ipynb) reads these CSVs.
Regenerate with:  python3 scripts/build_dataset.py
"""
import csv, os, textwrap

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(HERE, "data")

# ---------------------------------------------------------------- systems ----
# units_m = lifetime hardware units shipped, millions. NaN-ish -> "" when the
# figure is not meaningfully defined (arcade boards, home-computer standards
# with fuzzy totals are still given as best published estimate).
# gen = contemporaneous console generation (arcade boards & computers are
#       mapped to the generation they competed with, not a literal gen).
SYSTEMS = """\
id|system|maker|category|launch|gen|units_m|media|cpu_bits|library_size|note
nes|NES|Nintendo|Console|1983|3|61.91|Cartridge|8|~1400|Western branding of the Famicom (US 1985); 61.91M is the combined NES/Famicom figure
famicom|Famicom|Nintendo|Console|1983|3|61.91|Cartridge|8|~1050|Same hardware as NES; ~300 titles never left Japan
snes|Super Nintendo|Nintendo|Console|1990|4|49.10|Cartridge|16|~1750|US launch 1991; Mode 7 + S-SMP audio defined the 16-bit look and sound
sfc|Super Famicom|Nintendo|Console|1990|4|49.10|Cartridge|16|~1450|JP library is ~2x the US RPG count
n64|Nintendo 64|Nintendo|Console|1996|5|32.93|Cartridge|64|~390|Smallest library of its gen; analog stick + 4 controller ports
gb|Game Boy|Nintendo|Handheld|1989|4|64.42|Cartridge|8|~1050|118.69M is GB+GBC combined; split here by common estimate
gbc|Game Boy Color|Nintendo|Handheld|1998|5|54.27|Cartridge|8|~580|Backwards compatible; 118.69M GB+GBC combined
gba|Game Boy Advance|Nintendo|Handheld|2001|6|81.51|Cartridge|32|~1500|32-bit ARM7 handheld; the 2D craft endpoint
vb|Virtual Boy|Nintendo|Console|1995|5|0.77|Cartridge|32|22|Commercial failure; 22 games total, 14 in the West
pkmn_mini|Pokemon Mini|Nintendo|Handheld|2001|6|0.00|Cartridge|8|10|Smallest cartridge console ever made; exactly 10 games
gw|Game & Watch|Nintendo|Handheld|1980|1|43.40|Built-in|4|60|One game per unit; invented the D-pad
md|Mega Drive / Genesis|Sega|Console|1988|4|34.06|Cartridge|16|~900|68000 + YM2612 FM; Sega's only real win vs Nintendo
sms|Master System|Sega|Console|1985|3|13.00|Cartridge|8|~320|Dominant in Brazil and PAL Europe, not the US
gg|Game Gear|Sega|Handheld|1990|4|14.00|Cartridge|8|~370|Backlit colour handheld; 6 hours on 6 AAs
sg1000|SG-1000|Sega|Console|1983|2|2.00|Cartridge|8|~70|Launched the same day as the Famicom and lost instantly
segacd|Sega CD|Sega|Add-on|1991|4|2.24|CD-ROM|16|~210|CD audio + scaling/rotation ASIC; FMV era epicentre
pce|PC Engine / TurboGrafx-16|NEC|Console|1987|4|10.00|HuCard|8|~320|8-bit CPU, 16-bit video; #1 in Japan in 1988
pcecd|PC Engine CD|NEC|Add-on|1988|4|10.00|CD-ROM|8|~450|First CD-ROM games console add-on anywhere
sgfx|SuperGrafx|NEC|Console|1989|4|0.06|HuCard|8|7|5 dedicated games + 2 hybrids. That is the whole library
ps1|PlayStation|Sony|Console|1994|5|102.49|CD-ROM|32|~4100|First console past 100M; killed the cartridge
psp|PlayStation Portable|Sony|Handheld|2004|7|82.50|UMD|32|~1900|Console-class 3D in a handheld
cps1|Capcom CPS-1|Capcom|Arcade|1988|4||Board|16|~35|The Street Fighter II board
cps2|Capcom CPS-2|Capcom|Arcade|1993|5||Board|16|~45|Encrypted "suicide battery" board; peak 2D Capcom
cps3|Capcom CPS-3|Capcom|Arcade|1996|5||Board|32|6|Exactly 6 games; highest-resolution 2D sprite work of the era
neogeo|Neo Geo|SNK|Arcade|1990|4|0.41|Cartridge|16|~150|Identical arcade and home hardware; 14-year lifespan
mame|MAME 2003-Plus|Various|Arcade|1975|2||Board|8|~4000|Curated set of the golden-age coin-op canon
ngp|Neo Geo Pocket|SNK|Handheld|1998|5|2.00|Cartridge|16|10|Mono model; microswitched clicky stick
ngpc|Neo Geo Pocket Color|SNK|Handheld|1999|5|2.00|Cartridge|16|~85|Best fighting-game handheld ever built
ws|WonderSwan|Bandai|Handheld|1999|5|3.50|Cartridge|16|~100|Gunpei Yokoi's last design; 40 hours on one AA
wsc|WonderSwan Color|Bandai|Handheld|2000|5|3.50|Cartridge|16|~90|Square's handheld home before the GBA deal
lynx|Atari Lynx|Atari|Handheld|1989|4|2.00|Cartridge|8|~75|First colour backlit handheld; hardware sprite scaling
a2600|Atari 2600|Atari|Console|1977|2|30.00|Cartridge|8|~500|Created the third-party software industry
a7800|Atari 7800|Atari|Console|1986|3|1.00|Cartridge|8|~60|MARIA chip; arcade ports but a thin library
o2|Odyssey 2 / Videopac|Magnavox|Console|1978|2|2.00|Cartridge|8|~75|Built-in keyboard; board-game/videogame hybrids
intv|Intellivision|Mattel|Console|1979|2|3.50|Cartridge|16|~125|16-bit CPU in 1979; disc controller and overlays
coleco|ColecoVision|Coleco|Console|1982|2|6.00|Cartridge|8|~145|Arcade-accurate ports were the entire pitch
msx|MSX|Microsoft/ASCII|Computer|1983|3|5.00|Cartridge/Tape|8|~1200|A standard, not a machine; Konami's lab
msx2|MSX2|Microsoft/ASCII|Computer|1985|3|3.00|Cartridge/Disk|8|~900|V9938 VDP; where Kojima learned to direct
zx|ZX Spectrum|Sinclair|Computer|1982|2|5.00|Tape|8|~24000|Colour clash and the UK bedroom-coder industry
cpc|Amstrad CPC|Amstrad|Computer|1984|3|3.00|Tape/Disk|8|~6000|Better palette than the Spectrum, worse scrolling
ports|Ports|Open source|Ports|1993|5||Source port|32|~40|Not emulation: native rebuilds of released engines from source
"""

# ------------------------------------------------------------------ games ----
# rank          1..5 within the system (1 = strongest pick)
# exclusive     exclusive | regional | multi    (at the time of release)
# sales_m       known lifetime sales, millions; "" where no figure is published
# canon_score   CURATED 0-100 index, see README: strength of the title's standing
#               in the retro canon (contemporary + retrospective critical
#               consensus, preservation/port history, community ranking).
#               It is an editorial construct, not a scraped Metacritic number.
GAMES = """\
sys_id|rank|game|year|genre|developer|exclusive|sales_m|canon_score|note
nes|1|Super Mario Bros. 3|1988|Platformer|Nintendo R&D4|exclusive|17.28|99|The 8-bit platformer's final form: world map, suits, scrolling that never stutters
nes|2|The Legend of Zelda|1986|Action-adventure|Nintendo R&D4|exclusive|6.51|98|Battery-backed saves invented the long-form console game
nes|3|Mega Man 2|1988|Action-platformer|Capcom|exclusive|1.50|94|Non-linear stage select plus the best NES soundtrack ever authored
nes|4|Castlevania III: Dracula's Curse|1989|Action-platformer|Konami|exclusive||92|Branching paths and swappable partners; the VRC6 chip adds three audio channels
nes|5|Kirby's Adventure|1993|Platformer|HAL Laboratory|exclusive|1.75|90|Shipped in 1993 on hardware from 1983 and still looks impossible
famicom|1|Mother|1989|RPG|Ape / Nintendo|regional||93|Shigesato Itoi's suburban-America RPG; no English release until 2015
famicom|2|Fire Emblem: Ankoku Ryu to Hikari no Tsurugi|1990|Tactical RPG|Intelligent Systems|regional||91|Permadeath tactics RPG; the series' first 13 years were Japan-only
famicom|3|Sweet Home|1989|Survival horror|Capcom|regional||90|The direct design ancestor of Resident Evil, down to the mansion
famicom|4|Gimmick!|1992|Platformer|Sunsoft|regional||89|Physics-driven star projectile and an expanded-sound-chip score
famicom|5|Summer Carnival '92: Recca|1992|Shoot 'em up|Naxat Soft|regional||86|A competition prize cart that pushes more sprites than the NES should allow
snes|1|Super Metroid|1994|Metroidvania|Nintendo R&D1|exclusive|1.42|99|Environmental storytelling with zero cutscenes; the genre's reference text
snes|2|Chrono Trigger|1995|RPG|Square|exclusive|2.65|99|Multiple endings, no random encounters, Toriyama + Mitsuda + the Dream Team
snes|3|The Legend of Zelda: A Link to the Past|1991|Action-adventure|Nintendo EAD|exclusive|4.61|98|Two overlaid worlds; the template every top-down Zelda still follows
snes|4|Super Mario World|1990|Platformer|Nintendo EAD|exclusive|20.61|97|Cape physics, Yoshi, and a secret-exit map that rewards obsession
snes|5|Donkey Kong Country|1994|Platformer|Rare|exclusive|9.30|92|Pre-rendered SGI sprites made a 16-bit machine look next-gen
sfc|1|Seiken Densetsu 3|1995|Action RPG|Square|regional||93|Six protagonists, class-change trees, three-player co-op; fan-translated for decades
sfc|2|Fire Emblem: Seisen no Keifu|1996|Tactical RPG|Intelligent Systems|regional||92|Generational inheritance mechanics on enormous single-map chapters
sfc|3|Bahamut Lagoon|1996|Tactical RPG|Square|regional||88|Square's dragon-raising SRPG; never officially localised
sfc|4|Rudra no Hihou|1996|RPG|Square|regional||86|The "mantra" system lets you type spell words the engine parses
sfc|5|Umihara Kawase|1994|Puzzle-platformer|TNN|regional||85|An elastic fishing-line grapple with real spring physics in 1994
n64|1|The Legend of Zelda: Ocarina of Time|1998|Action-adventure|Nintendo EAD|exclusive|7.60|100|Z-targeting solved 3D combat for everyone who came after
n64|2|Super Mario 64|1996|Platformer|Nintendo EAD|exclusive|11.91|100|Invented the analog 3D moveset and the free camera in one go
n64|3|GoldenEye 007|1997|FPS|Rare|exclusive|8.09|95|Objective-based stealth shooting plus the console split-screen deathmatch
n64|4|The Legend of Zelda: Majora's Mask|2000|Action-adventure|Nintendo EAD|exclusive|3.36|94|A three-day clock and a doomed town; the strangest first-party Nintendo game
n64|5|Banjo-Kazooie|1998|Platformer|Rare|exclusive|3.65|92|The collect-a-thon at its most tightly designed, before the genre bloated
gb|1|Tetris|1989|Puzzle|Nintendo R&D1|multi|35.00|98|The pack-in that sold the hardware; still the purest game ever bundled
gb|2|Pokemon Red / Blue|1996|RPG|Game Freak|exclusive|31.38|99|Link-cable trading turned a handheld into a social network
gb|3|The Legend of Zelda: Link's Awakening|1993|Action-adventure|Nintendo EAD|exclusive|3.83|96|A Zelda with no Zelda; dense, funny, and built for a 2.6-inch screen
gb|4|Super Mario Land 2: 6 Golden Coins|1992|Platformer|Nintendo R&D1|exclusive|11.18|90|Introduced Wario and a non-linear overworld at 4x the sprite size of SML1
gb|5|Metroid II: Return of Samus|1991|Metroidvania|Nintendo R&D1|exclusive|1.72|88|Isolation horror in four shades of green; no map, no mercy
gbc|1|Pokemon Gold / Silver|1999|RPG|Game Freak|exclusive|23.73|98|Two full regions, a day/night clock, and breeding on 8-bit hardware
gbc|2|The Legend of Zelda: Oracle of Seasons / Ages|2001|Action-adventure|Flagship / Capcom|exclusive|3.96|93|Two games that link into one via password; Capcom out-Zelda-ing Nintendo
gbc|3|Metal Gear: Ghost Babel|2000|Stealth|Konami|exclusive||91|A full top-down MGS with codec drama and VR missions, built in 8-bit
gbc|4|Wario Land 3|2000|Platformer|Nintendo R&D1|exclusive|2.33|90|An invincible protagonist turns a platformer into a lock-and-key puzzle box
gbc|5|Shantae|2002|Platformer|WayForward|exclusive||87|Released after the GBA launched; the most technically absurd GBC game ever
gba|1|Metroid: Zero Mission|2004|Metroidvania|Nintendo R&D1|exclusive|1.07|95|A remake that out-designs the original and adds a stealth third act
gba|2|Castlevania: Aria of Sorrow|2003|Metroidvania|Konami|exclusive|0.16|94|The soul-collection system; the best-balanced Igavania
gba|3|Mother 3|2006|RPG|Brownie Brown / HAL|regional|0.40|93|A rhythm combo system wrapped around the saddest script Nintendo ever shipped
gba|4|Advance Wars|2001|Tactical|Intelligent Systems|exclusive|0.90|92|Perfect-information turn-based war with zero randomness
gba|5|WarioWare, Inc.: Mega Microgame$!|2003|Minigame|Nintendo R&D1|exclusive|1.08|91|200 five-second games; invented the microgame as a form
vb|1|Virtual Boy Wario Land|1995|Platformer|Nintendo R&D1|exclusive||88|Uses the parallax layers as actual level geometry you move between
vb|2|Jack Bros.|1995|Action|Atlus|exclusive||80|The first Megami Tensei game released in the West, on the worst possible console
vb|3|Teleroboxer|1995|Fighting|Nintendo R&D1|exclusive||74|First-person boxing where the stereoscopy genuinely helps you read punches
vb|4|Galactic Pinball|1995|Pinball|Intelligent Systems|exclusive||72|Depth makes the table read correctly; the system's best-feeling game
vb|5|Red Alarm|1995|Shoot 'em up|T&E Soft|exclusive||68|Wireframe 3D combat; unreadable and fascinating in equal measure
pkmn_mini|1|Pokemon Puzzle Collection|2001|Puzzle|Jupiter|exclusive||72|Three solid puzzle modes; the most game on the smallest cartridge console
pkmn_mini|2|Pokemon Pinball mini|2001|Pinball|Jupiter|exclusive||68|Uses the built-in rumble and tilt sensor as core mechanics
pkmn_mini|3|Pokemon Tetris|2002|Puzzle|Jupiter|exclusive||66|Tetris with a catching meta-layer on a 96x64 screen
pkmn_mini|4|Pichu Bros. mini|2002|Minigame|Jupiter|regional||62|Five minigames; Japan-only and the system's most charming cart
pkmn_mini|5|Pokemon Zany Cards|2001|Card|Jupiter|exclusive||60|Five card rulesets including a full Uno clone with AI personalities
gw|1|Donkey Kong|1982|Platformer|Nintendo R&D1|exclusive||95|The dual-screen clamshell and the first cross-shaped D-pad
gw|2|Ball|1980|Action|Nintendo R&D1|exclusive||88|Unit one. Juggling. The entire handheld industry starts here
gw|3|Fire|1980|Action|Nintendo R&D1|exclusive||82|Timing-based rescue loop; the purest score-chase in the line
gw|4|Mario Bros.|1983|Action|Nintendo R&D1|exclusive||80|Two-screen conveyor coordination with both hands doing different jobs
gw|5|Zelda|1989|Action-adventure|Nintendo R&D1|exclusive||78|A full dungeon crawl with items and bosses rendered in fixed LCD segments
md|1|Sonic the Hedgehog 2|1992|Platformer|Sega Technical Institute|exclusive|6.03|96|Spin dash plus split-screen versus; Sega's commercial and design peak
md|2|Gunstar Heroes|1993|Run and gun|Treasure|exclusive||95|Weapon-combination system and sprite scaling nobody else attempted
md|3|Streets of Rage 2|1992|Beat 'em up|Ancient / Sega|exclusive||95|Yuzo Koshiro's FM house soundtrack and the genre's best-weighted hits
md|4|Phantasy Star IV|1993|RPG|Sega|exclusive||93|Manga-panel cutscenes and combo macros; closes a four-game arc
md|5|Ristar|1995|Platformer|Sega|exclusive||88|Grab-and-throw traversal; released into the Saturn's shadow and forgotten
sms|1|Phantasy Star|1987|RPG|Sega|exclusive||94|First-person animated 3D dungeons and a female lead, in 1987
sms|2|Wonder Boy III: The Dragon's Trap|1989|Action RPG|Westone|exclusive||93|Animal transformations as a metroidvania key system
sms|3|Golden Axe Warrior|1991|Action-adventure|Sega|exclusive||86|An unapologetic Zelda clone that is genuinely as good as Zelda
sms|4|Alex Kidd in Miracle World|1986|Platformer|Sega|exclusive||84|Built into the console in some regions; janky, inventive, janken bosses
sms|5|Sonic the Hedgehog|1991|Platformer|Ancient|exclusive||82|A completely different game from the 16-bit one, with its own level design
gg|1|Shining Force: The Sword of Hajya|1993|Tactical RPG|Sonic! Software Planning|exclusive||88|A full console-scale SRPG campaign on a handheld in 1993
gg|2|Sonic the Hedgehog: Triple Trouble|1994|Platformer|Aspect|exclusive||86|The 8-bit Sonic line's best level design, not a port of anything
gg|3|Defenders of Oasis|1992|RPG|Sega|exclusive||83|Arabian-nights RPG with a genie companion; criminally unknown
gg|4|The GG Shinobi|1991|Action-platformer|Sega|exclusive||82|Swap between five ninja with distinct kits to open the hub
gg|5|Land of Illusion starring Mickey Mouse|1992|Platformer|Sega|exclusive||80|Castle of Illusion's sequel line; bigger, with light RPG progression
sg1000|1|Girl's Garden|1985|Action|Sega|exclusive||70|Yuji Naka's first game; flower-collecting with a bear chasing you
sg1000|2|Flicky|1984|Action|Sega|exclusive||68|Herd the birds home; Sega's first real original character design
sg1000|3|The Castle|1986|Puzzle-platformer|ASCII|exclusive||66|100 rooms of key-and-door logic; the best-regarded SG-1000 game
sg1000|4|Ninja Princess|1986|Action|Sega|exclusive||62|Vertically scrolling shuriken stealth; later an arcade hit
sg1000|5|Gulkave|1986|Shoot 'em up|Compile|exclusive||60|Compile's early shooter, and the best-looking thing on the hardware
segacd|1|Sonic CD|1993|Platformer|Sega CS|exclusive|1.50|94|Time travel changes the level geometry; two full soundtracks
segacd|2|Snatcher|1994|Adventure|Konami|exclusive||93|Kojima's cyberpunk visual novel; the only English console release it ever got
segacd|3|Lunar: The Silver Star|1993|RPG|Game Arts|exclusive||90|Animated cutscenes and a sung theme; the CD RPG that justified the add-on
segacd|4|Popful Mail|1994|Action RPG|Falcom / Working Designs|exclusive||86|Falcom action-RPG with a fully voiced comedy script
segacd|5|Final Fight CD|1993|Beat 'em up|Sega|exclusive||84|The arcade-complete Final Fight nobody else managed, with CD audio
pce|1|Blazing Lazers|1989|Shoot 'em up|Compile|exclusive||93|Gradius-grade weapon layering; the shooter that defined the hardware
pce|2|Devil's Crush|1990|Pinball|Compile|exclusive||92|A pinball table with bosses, HP bars, and a death-metal score
pce|3|Bonk's Adventure|1990|Platformer|Red Company / Atlus|exclusive||89|Headbutt physics and meat-powered rage modes; NEC's mascot attempt
pce|4|Soldier Blade|1992|Shoot 'em up|Hudson Soft|exclusive||88|The Star Soldier line's cleanest entry, with 2- and 5-minute score modes
pce|5|Military Madness|1989|Turn-based strategy|Hudson Soft|exclusive||87|Hex-grid lunar warfare; still one of the best console wargames
pcecd|1|Castlevania: Rondo of Blood|1993|Action-platformer|Konami|regional||97|Branching stages, a second playable character, and Redbook audio
pcecd|2|Ys Book I & II|1989|Action RPG|Falcom / Hudson|exclusive||95|Voice acting and a CD score in 1989; the first great CD-ROM game
pcecd|3|Lords of Thunder|1993|Shoot 'em up|Hudson / Red|exclusive||94|Elemental armour loadouts over a full hard-rock CD soundtrack
pcecd|4|Gate of Thunder|1992|Shoot 'em up|Red Company|exclusive||91|The pack-in for the Duo and still a reference-grade horizontal shooter
pcecd|5|Sapphire|1995|Shoot 'em up|Hudson Soft|regional||88|Arcade CD technical showpiece; sprite counts the hardware should refuse
sgfx|1|Daimakaimura (Ghouls 'n Ghosts)|1990|Action-platformer|Capcom / NEC Avenue|regional||84|The single reason to own the hardware; near-arcade parallax
sgfx|2|Aldynes|1991|Shoot 'em up|Hudson Soft|regional||80|Built from scratch for the dual-VDC; the only original SuperGrafx shooter of note
sgfx|3|1941: Counter Attack|1991|Shoot 'em up|Capcom / Hudson|regional||76|The last SuperGrafx exclusive ever released
sgfx|4|Madou King Granzort|1990|Action|Hudson Soft|regional||62|Anime tie-in platformer; mostly a curiosity
sgfx|5|Battle Ace|1989|Shoot 'em up|Hudson Soft|regional||50|The launch title, alone on the system for four months, and not good
ps1|1|Metal Gear Solid|1998|Stealth|Konami|exclusive|6.00|99|Cinematic direction, fourth-wall breaks, and stealth as a full genre
ps1|2|Final Fantasy VII|1997|RPG|Square|exclusive|13.90|99|Pre-rendered backgrounds and a 3-disc script; made RPGs mainstream in the West
ps1|3|Castlevania: Symphony of the Night|1997|Metroidvania|Konami|multi|0.95|98|Named half a genre; the inverted castle is still a structural flex
ps1|4|Resident Evil 2|1998|Survival horror|Capcom|multi|4.96|95|Two interlocking scenarios; fixed cameras used as deliberate dread
ps1|5|Gran Turismo|1997|Racing|Polyphony Digital|exclusive|10.85|94|Licence tests and 140 cars; the simulation racer arrives on console
psp|1|Metal Gear Solid: Peace Walker|2010|Stealth|Kojima Productions|exclusive|0.84|93|Base management plus co-op; a mainline MGS built for a handheld
psp|2|Monster Hunter Freedom Unite|2008|Action RPG|Capcom|exclusive|3.80|92|Ad-hoc multiplayer made this the biggest handheld game in Japan
psp|3|Patapon|2007|Rhythm/Strategy|Pyramid / JAPAN Studio|exclusive|0.50|90|Four drum inputs command an army; nothing else plays like it
psp|4|God of War: Chains of Olympus|2008|Action|Ready at Dawn|exclusive|3.20|88|Proved a handheld could carry a full-scale action-adventure
psp|5|LocoRoco|2006|Platformer|JAPAN Studio|exclusive|0.80|86|You tilt the world, not the character; two shoulder buttons, total control
cps1|1|Street Fighter II: Champion Edition|1992|Fighting|Capcom|multi||99|Playable bosses and mirror matches; the board's defining revision
cps1|2|Final Fight|1989|Beat 'em up|Capcom|multi||94|Set the scrolling-brawler template the whole genre copied
cps1|3|Ghouls 'n Ghosts|1988|Action-platformer|Capcom|multi||90|Brutal, gorgeous, and the launch showcase for the hardware
cps1|4|Strider|1989|Action-platformer|Capcom|multi||89|Momentum-based acrobatics and set-pieces far beyond 1989 norms
cps1|5|Captain Commando|1991|Beat 'em up|Capcom|multi||85|Four wildly asymmetric characters, each with a mech suit
cps2|1|Marvel vs. Capcom: Clash of Super Heroes|1998|Fighting|Capcom|multi||95|Assists and tag-outs; the crossover-fighter formula locks in here
cps2|2|Street Fighter Alpha 3|1998|Fighting|Capcom|multi||94|Three selectable combat systems and 30+ characters
cps2|3|Alien vs. Predator|1994|Beat 'em up|Capcom|arcade-only||93|The best-looking brawler ever made and still never ported
cps2|4|Dungeons & Dragons: Shadow over Mystara|1996|Beat 'em up|Capcom|multi||92|Inventory, branching routes, and spell systems inside a brawler
cps2|5|Progear|2001|Shoot 'em up|Cave / Capcom|multi||89|Cave's only Capcom board shooter; the last CPS-2 release
cps3|1|Street Fighter III: 3rd Strike|1999|Fighting|Capcom|multi||99|Parries. Twenty-five years of competitive play and still unsolved
cps3|2|JoJo's Bizarre Adventure: Heritage for the Future|1999|Fighting|Capcom|multi||90|Stand on/off as a second resource layer; one of the weirdest great fighters
cps3|3|Street Fighter III: 2nd Impact|1997|Fighting|Capcom|multi||87|Added Urien and parry-timing refinements; the bridge to 3rd Strike
cps3|4|Red Earth|1996|Fighting|Capcom|arcade-only||84|RPG levelling in an arcade fighter; the launch title, unported until 2022
cps3|5|Street Fighter III: New Generation|1997|Fighting|Capcom|multi||80|The risky reboot: all-new roster, hand-animated at absurd frame counts
neogeo|1|Metal Slug 3|2000|Run and gun|SNK|multi||97|Branching paths and animation density nobody has matched since
neogeo|2|Garou: Mark of the Wolves|1999|Fighting|SNK|multi||96|The T.O.P. system and just-defend; SNK's mechanical high point
neogeo|3|The King of Fighters '98|1998|Fighting|SNK|multi||95|No story, just the roster; the series' balance benchmark
neogeo|4|The Last Blade 2|1998|Fighting|SNK|multi||94|Speed/power stance split over the prettiest sprite work SNK ever drew
neogeo|5|Samurai Shodown II|1994|Fighting|SNK|multi||93|Weapon clashes and one-hit-kill tension; deflection as a core system
mame|1|Pac-Man|1980|Maze|Namco|multi||100|Non-violent, pattern-based, and the first game with a mass audience
mame|2|Donkey Kong|1981|Platformer|Nintendo R&D1|multi||98|Cutscenes, a story, and jumping; Miyamoto's first design
mame|3|Galaga|1981|Shoot 'em up|Namco|multi||95|Capture-and-dual-fighter risk/reward on top of Galaxian
mame|4|Robotron: 2084|1982|Twin-stick shooter|Vid Kidz / Williams|multi||94|Invented twin-stick controls; still one of the hardest games ever shipped
mame|5|Bubble Bobble|1986|Puzzle-platformer|Taito|multi||92|Co-op bubble physics and a true ending that requires two players
ngp|1|King of Fighters R-1|1998|Fighting|SNK|exclusive||82|A real KOF on a mono handheld, built around the clicky microswitch stick
ngp|2|Samurai Shodown!|1998|Fighting|SNK|exclusive||78|Weapon fighting with chibi sprites; the mono library's other standout
ngp|3|Baseball Stars|1998|Sports|SNK|exclusive||72|Launch title; deep enough that people still rank it over the colour sports games
ngp|4|Puzzle Link|1999|Puzzle|Yumekobo|exclusive||70|Connect-the-pairs under time pressure; a perfect one-AA-battery game
ngp|5|Neo Geo Cup '98|1998|Sports|SNK|exclusive||66|Arcadey football with the arcade series' feel intact
ngpc|1|SNK vs. Capcom: The Match of the Millennium|1999|Fighting|SNK|exclusive||96|The best handheld fighting game ever made, by a wide margin
ngpc|2|Sonic the Hedgehog Pocket Adventure|1999|Platformer|SNK / Sega|exclusive||90|SNK building a Sonic game, and getting the physics genuinely right
ngpc|3|SNK vs. Capcom: Card Fighters' Clash|1999|Card battle|SNK|exclusive||89|A deckbuilder with two rival carts; the system's cult classic
ngpc|4|Faselei!|1999|Tactical RPG|Sacnoth|regional||85|Programmed action queues; a mech SRPG from the Shadow Hearts team
ngpc|5|Metal Slug: 2nd Mission|2000|Run and gun|SNK|exclusive||83|Branching mission structure built for short handheld sessions
ws|1|Gunpey|1999|Puzzle|Bandai|exclusive||84|Gunpei Yokoi's namesake puzzler; slide line segments into unbroken paths
ws|2|Klonoa: Moonlight Museum|1999|Platformer|Namco|regional||82|A real Klonoa game with the grab-and-throw loop intact in mono
ws|3|Makaimura for WonderSwan|1999|Action-platformer|Capcom|regional||80|Ghosts 'n Goblins rebuilt, not downported, for a 1-bit screen
ws|4|Rhyme Rider Kerorican|2000|Rhythm|Bandai|regional||78|A rhythm-platformer hybrid years before the genre existed
ws|5|Terrors|1999|Puzzle/Horror|Bandai|regional||72|Mono horror vignettes using the vertical screen orientation
wsc|1|Final Fantasy IV|2002|RPG|Square|regional||90|Square's remake line lived on WSC first; new art, rebalanced
wsc|2|Riviera: The Promised Land|2002|RPG|Sting|regional||88|Trigger-point exploration and item-durability combat; later ported widely
wsc|3|Judgement Silversword|2004|Shoot 'em up|Qute|regional||87|Won a WonderWitch dev contest and got a real release; a bullet-hell cult legend
wsc|4|Guilty Gear Petit 2|2001|Fighting|Arc System Works|regional||80|Chibi Guilty Gear with the roman-cancel feel surprisingly intact
wsc|5|Romancing SaGa|2001|RPG|Square|regional||78|The free-scenario SaGa structure, playable on a AA battery
lynx|1|California Games|1989|Sports|Epyx|multi||84|The launch pack-in; the Lynx's hardware scaling finally justified
lynx|2|Chip's Challenge|1989|Puzzle|Epyx|multi||83|149 tile-logic levels; originated here before becoming a Windows staple
lynx|3|Todd's Adventures in Slime World|1990|Action|Epyx|multi||80|Six game modes and co-op over a comm-link cable
lynx|4|Blue Lightning|1989|Flight|Epyx|exclusive||76|Afterburner-style scaling that no other handheld of the era could do
lynx|5|Battlezone 2000|1995|Vehicular combat|Hand Made Software|exclusive||72|Filled-polygon 3D on a 1989 handheld, released in 1995
a2600|1|Pitfall!|1982|Platformer|Activision|multi|4.00|96|255 screens from a procedural seed in 4KB; the pre-NES platformer
a2600|2|River Raid|1982|Shoot 'em up|Activision|multi|1.00|93|Fuel as a timer and a procedurally generated river; Carol Shaw's landmark
a2600|3|Yars' Revenge|1982|Shoot 'em up|Atari|exclusive|1.00|91|The best-selling original 2600 game; the neutral zone is pure design
a2600|4|Adventure|1980|Action-adventure|Atari|exclusive|1.00|90|The first action-adventure and the first Easter egg
a2600|5|H.E.R.O.|1984|Action|Activision|multi||88|Rotor-pack flight, dynamite, and a laser helmet; late-era 2600 mastery
a7800|1|Ninja Golf|1990|Action/Sports|Atari|exclusive||84|You golf, then fight ninjas on the walk to your ball. Genuinely great
a7800|2|Food Fight|1987|Action|Atari|multi||82|MARIA's sprite count doing what the 2600 never could; the system's signature
a7800|3|Ballblazer|1987|Sports|Lucasfilm Games|multi||80|Split-screen 3D future-sport with procedurally generated music
a7800|4|Midnight Mutants|1990|Action-adventure|Atari|exclusive||78|A Zelda-like with Grandpa Munster; the 7800's most ambitious cart
a7800|5|Alien Brigade|1990|Light gun|Atari|exclusive||72|Operation Wolf-style shooting with branching paths
o2|1|K.C. Munchkin!|1981|Maze|Philips|exclusive||82|Editable mazes and smart ghosts; Atari sued it off the shelves and won
o2|2|Pick Axe Pete!|1982|Platformer|Philips|exclusive||76|Ladder-and-boulder timing with a key-collection loop
o2|3|Killer Bees!|1983|Action|Philips|exclusive||74|Control a swarm, not a character; uses the console's weird plane-blending
o2|4|Quest for the Rings|1981|Action RPG|Philips|exclusive||72|A board game plus a video game; the Master Strategy Series' best idea
o2|5|Attack of the Timelord!|1983|Shoot 'em up|Philips|exclusive||70|The system's technical showpiece and its hardest game
intv|1|Utopia|1981|Strategy|Mattel|exclusive||88|The first god game / city-builder, two-player and resource-driven
intv|2|AD&D: Treasure of Tarmin|1983|Dungeon crawler|Mattel|exclusive||84|First-person grid-based dungeon crawling on a console in 1983
intv|3|Astrosmash|1981|Shoot 'em up|Mattel|exclusive||82|The pack-in; scoring curve engineered for the million-point chase
intv|4|Tron: Deadly Discs|1982|Action|Mattel|exclusive||80|The disc controller's best use case; still a sharp twin-input game
intv|5|BurgerTime|1982|Platformer|Mattel|multi||78|The best home version of the arcade game by a long way
coleco|1|Donkey Kong|1982|Platformer|Coleco|multi||90|The pack-in that proved arcade-accurate home ports were possible
coleco|2|Zaxxon|1982|Shoot 'em up|Coleco|multi||86|Isometric scrolling flight, close enough to the arcade to matter
coleco|3|Lady Bug|1982|Maze|Coleco|multi||84|Rotating gates turn a Pac-Man maze into a shifting puzzle
coleco|4|Mr. Do!|1983|Maze|Coleco|multi||82|Digging, apple-crushing, and the best-regarded ColecoVision cart
coleco|5|Cosmic Avenger|1982|Shoot 'em up|Coleco|multi||78|Launch-window horizontal shooter; showed off the TMS9918 sprites
msx|1|Metal Gear|1987|Stealth|Konami|regional||95|Kojima's debut and the origin of avoid-don't-fight as a design rule
msx|2|The Maze of Galious|1987|Metroidvania|Konami|regional||92|Two swappable heroes over a huge interconnected castle; years ahead
msx|3|Vampire Killer|1986|Action-platformer|Konami|regional||87|The MSX2 Castlevania: key-hunting and room exploration instead of linear stages
msx|4|Penguin Adventure|1986|Action|Konami|regional||85|Kojima's first production credit; multiple endings in 1986
msx|5|Eggerland Mystery|1985|Puzzle|HAL Laboratory|regional||82|The Adventures of Lolo puzzle lineage starts here
msx2|1|Metal Gear 2: Solid Snake|1990|Stealth|Konami|regional||96|Crouching, radar, and a script that embarrasses most 32-bit games
msx2|2|SD Snatcher|1990|RPG|Konami|regional||90|Snatcher rebuilt as a body-part-targeting RPG
msx2|3|Space Manbow|1989|Shoot 'em up|Konami|regional||88|The MSX2's technical ceiling: smooth scroll, huge bosses, SCC audio
msx2|4|Nemesis 3: The Eve of Destruction|1988|Shoot 'em up|Konami|regional||86|Branching routes and a time-travel plot inside a Gradius spin-off
msx2|5|Aleste 2|1989|Shoot 'em up|Compile|regional||83|Compile's vertical shooter line at its most polished
zx|1|Manic Miner|1983|Platformer|Matthew Smith|multi||94|20 single-screen rooms, in-game music on a beeper; the UK canon's origin
zx|2|Knight Lore|1984|Action-adventure|Ultimate Play the Game|multi||93|Filmation isometric engine; invented a visual language overnight
zx|3|Head Over Heels|1987|Puzzle-platformer|Jon Ritman / Bernie Drummond|multi||92|Two characters with different abilities who combine into one unit
zx|4|Elite|1984|Space trading|Bell & Braben|multi||91|An open galaxy in 48KB; procedural generation as a survival tactic
zx|5|Jet Set Willy|1984|Platformer|Matthew Smith|multi||88|A 60-room mansion and the most famous bug in British gaming
cpc|1|Prehistorik 2|1993|Platformer|Titus|multi||89|The CPC's showcase: 16-colour parallax that the Spectrum could not touch
cpc|2|Get Dexter! (Crafton & Xunk)|1986|Isometric adventure|ERE Informatique|multi||88|Isometric puzzle-adventure with timed NPC routines; a CPC high-water mark
cpc|3|Sorcery+|1985|Action-adventure|Virgin Games|multi||86|The expanded CPC version with extra rooms; flick-screen rescue adventure
cpc|4|Megablasters|1994|Action|Radical Software|exclusive||84|A CPC-exclusive Bomberman done better than most licensed versions
cpc|5|Super Cauldron|1993|Platformer|Titus|multi||80|Late-era CPC with full-colour sprite animation and real scrolling
ports|1|DOOM|1993|FPS|id Software|multi|3.50|99|The source release made it the most ported game in history; runs anywhere
ports|2|Quake|1996|FPS|id Software|multi|1.80|96|True polygonal 3D plus the modding culture that produced modern FPS design
ports|3|Cave Story|2004|Metroidvania|Daisuke Amaya|multi||94|One person, five years, freeware; the indie era's founding document
ports|4|Tomb Raider (OpenLara)|1996|Action-adventure|Core Design|multi|7.10|90|An open reimplementation; the original 3D-platformer-with-guns
ports|5|OpenTyrian (Tyrian)|1995|Shoot 'em up|Eclipse Productions|multi||86|Shareware vertical shooter with a deep upgrade economy, now GPL
"""

TOOLS = """\
tool|purpose|note
RetroArch|Multi-system frontend|The libretro host every core listed here plugs into
mGBA / SameBoy|Accuracy-first GB/GBA cores|Use over gpSP/VBA when timing-sensitive games glitch
Mesen / Nestopia UE|Cycle-accurate NES/Famicom|Mesen for debugging, Nestopia UE for low-overhead play
bsnes / Snes9x|SNES accuracy vs speed|bsnes for coprocessor carts, Snes9x when CPU is tight
ScummVM|Point-and-click engine host|Not an emulator: reimplements the engines, so it runs ports natively
"""


def parse(block):
    lines = [l for l in block.strip().splitlines() if l.strip()]
    head = lines[0].split("|")
    rows = []
    for i, l in enumerate(lines[1:], start=2):
        parts = l.split("|")
        if len(parts) != len(head):
            raise SystemExit(
                f"row {i} has {len(parts)} fields, expected {len(head)}:\n  {l}"
            )
        rows.append(dict(zip(head, parts)))
    return head, rows


def write(name, head, rows):
    path = os.path.join(DATA, name)
    with open(path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=head)
        w.writeheader()
        w.writerows(rows)
    print(f"wrote {path}  ({len(rows)} rows)")
    return rows


if __name__ == "__main__":
    os.makedirs(DATA, exist_ok=True)
    sh, srows = parse(SYSTEMS)
    gh, grows = parse(GAMES)
    th, trows = parse(TOOLS)

    # --- integrity gates: fail loudly rather than ship a broken dataset -----
    sys_ids = [r["id"] for r in srows]
    assert len(sys_ids) == len(set(sys_ids)), "duplicate system id"
    assert len(sys_ids) == 41, f"expected 41 systems, got {len(sys_ids)}"
    for r in grows:
        assert r["sys_id"] in sys_ids, f"unknown sys_id {r['sys_id']}"
    from collections import Counter
    c = Counter(r["sys_id"] for r in grows)
    bad = {k: v for k, v in c.items() if v != 5}
    assert not bad, f"systems without exactly 5 picks: {bad}"
    missing = set(sys_ids) - set(c)
    assert not missing, f"systems with no picks: {missing}"
    for r in grows:
        assert 0 <= int(r["canon_score"]) <= 100, r["game"]
        assert 1975 <= int(r["year"]) <= 2011, r["game"]
    launch = {r["id"]: int(r["launch"]) for r in srows}
    neg = [(r["game"], int(r["year"]) - launch[r["sys_id"]]) for r in grows
           if int(r["year"]) < launch[r["sys_id"]]]
    assert not neg, f"negative lag (launch/year convention mismatch): {neg}"

    ranks = Counter((r["sys_id"], r["rank"]) for r in grows)
    assert all(v == 1 for v in ranks.values()), "duplicate rank within a system"
    names = Counter(r["game"] for r in grows)
    dupes = {k: v for k, v in names.items() if v > 1}
    print(f"note: {len(dupes)} titles appear on >1 system (expected for ports): {sorted(dupes)}")

    write("systems.csv", sh, srows)
    write("games.csv", gh, grows)
    write("tools.csv", th, trows)
    print(f"\n{len(sys_ids)} systems x 5 = {len(grows)} games. integrity: OK")
