# Workflow

Each step says **Verified** (done and confirmed on a console in the original project)
or **Unverified** (planned, reported by others, or inferred). Do not present an
Unverified step as known to work.

## 0. Gather facts (Verified as a necessary step)

Ask the user, do not guess:

- Console model (base/Slim/Pro) and system software version.
- Game title ID (the tested copy was CUSA18723; other regions use other IDs) and
  app version as shown by `param.sfo` (APP_VER), plus the in-game calibration version.
- DLC owned (Shadow of the Erdtree). Mods that ship `*_dlc02` files may need it.
  [Unverified] whether a mod works without the DLC.
- Homebrew environment and plugin loader version; file redirection plugin and version.
- Mod name, version and the SHA256 of the downloaded ZIP.
- Written permission from the mod author.

## 1. Inventory the mod (Verified)

- List every file in the ZIP with size and SHA256. Confirm there are no DLL/EXE files
  (a mod with native code cannot be ported this way).
- Classify by type: `regulation.bin`, `action/script/*.hks`, `chr/*.behbnd.dcx`,
  `chr/*.anibnd.dcx`, `chr/*.chrbnd.dcx`, `parts/*.partsbnd.dcx`, `sfx/*.ffxbnd.dcx`,
  `menu/**/*.tpf.dcx`, `msg/**/*.msgbnd.dcx`.
- Record the DCX compression of each container (DFLT, ZSTD, KRAK). KRAK needs Oodle.
- Read the declared regulation version (it is inside the decrypted BND4) and compare
  it with the console's game version. A mismatch means the mod targets another patch.

## 2. Prove file redirection works (Verified)

Tested setup: the plugin `afr.prx` at `/data/GoldHEN/plugins/afr.prx`, enabled in
`/data/GoldHEN/plugins.ini` under a section named after the title ID
(`[CUSA18723]`). Files placed at `/data/GoldHEN/AFR/<TITLE_ID>/<game-relative path>`
replace the game's own file at that path. Example:
`/data/GoldHEN/AFR/CUSA18723/chr/c0000.behbnd.dcx`.

Transfer was done over the homebrew FTP server. Observed: about 148 KB/s; a 34 MB file
timed out after 180 s and had to be resumed. Allow 600 s or more for large files.
After every upload, download the file back and compare size and SHA256.

## 3. Load the mod's regulation (Verified)

1. Put the mod's **untouched** `regulation.bin` in the AFR folder.
2. Use a separate test account, or follow the Apollo procedure below to preserve an existing save. [Inference] The save carries its
   own copy of the regulation, which is why an old save can hide the new file.
3. Start the game with no network connection.
4. Check a value that only the mod changes. In the original project: the Samurai
   starting class showed level 12 / Dexterity 18 and calibration 1.17.

The tested route preserves the mod regulation without recompression. Earlier experimental repacks failed; their cause remains unresolved. Every regulation we repacked
gave error CE-34878-0. [Unverified] whether a correct repack is possible.

## 4. Script (Verified to boot)

The mod's `action/script/c0000.hks` was used as plain text, uncompiled, and the game
booted. Booting does not prove the modded branches run. Design a test that only the
mod can produce (an input combination that triggers a mod-only animation).

## 5. Dump the matching PS4 originals (Verified)

With the game running, read the originals from the real mounts
`/mnt/sandbox/pfsmnt/<TITLE_ID>-patch0/` or `<TITLE_ID>-app0/` (patch first). The
union mount listed files but failed to deliver some of them. Re-dump after every game
update: dumps from an older patch are not valid references.

## 6. Havok behavior: `c0000.behbnd.dcx` (Verified)

The PC behavior crashed the PS4 game. PC and PS4 files are both TAG0 tagfiles, SDK
20180100, 64-bit pointers, but some class layouts differ (for example
`hkbBehaviorGraph` is 432 bytes on one side and 440 on the other). Same SDK does not
mean same binary layout.

Working method (own scripts, see `formats.md`): match types by canonical identity
using the PS4 original as the layout source, move each field to its PS4 offset,
rebuild ITEM/PTCH offsets, refuse to drop non-zero bytes, then verify by reverse
roundtrip and by comparing the object graph. Repack as BND4 and KRAK level 7.

## 7. Animations: `c0000*.anibnd.dcx` (Verified)

Same Havok conversion applied to every HKX in the three player anibnds (3254 HKX in
the tested mod), including animations with no PS4 equivalent. The mod's skeleton
(150 bones) was kept byte for byte; all bindings were checked to stay within the bone
count. Result on console: character loads, moves and plays animations.

Unverified: 21 record classes had no PS4 sample and their layout was inferred
(alignment rules that matched 535/535 known cases). Treat crashes in specific attacks
or areas as a likely sign of a wrong inference. [Unverified] The Kakariko guide says to
use the PS4 skeleton; a Discord user says to keep the mod's. The tested port kept the
mod's.

## 8. Weapon parts: `parts/wp_a_*.partsbnd.dcx` (Verified for one weapon)

A weapon is invisible if its model is missing on PS4 (check `equipModelId` of the
weapon in the regulation against the console's `parts/`). For the tested weapon the
partsbnd held one TPF, three FLVER and two nested anibnds:

- FLVER: PC and PS4 both little endian, version 0x2001A; kept as-is. [Unverified]
  geometry/shader parameters were not fully audited.
- Materials: check the referenced material names exist in the PS4
  `allmaterial.matbinbnd.dcx`.
- TPF textures: must be converted (see `formats.md`). Validate the converter by
  exact roundtrip on PS4 original textures of each BC format before using it.
- Nested HKX: convert like step 6 and check bindings against the weapon skeleton,
  not the player's.
- Repack, KRAK level 7, decompress again and compare.

Result on console: weapon visible and usable (user report "funciona!"). Not yet
checked: every attack, effect, area and long sessions.

## 9. Not verified yet

- Weapons with cloth (`hcl*` Havok Cloth classes).
- `sfx/*.ffxbnd.dcx` effects, `menu` textures, `c0000.chrbnd.dcx` (player mesh and
  physics), `msgbnd` text files.
- [Unverified] Discord report: Havok Content Tools 2018 "Standalone Filter Manager"
  with "Write to Platform → PlayStation" converts HKX; this was not tested.
- [Inference] Very large textures (one was 2048×8192) may exceed memory on a base PS4.
- 60 FPS patches exist only for older app versions; do not apply them to another one.

## 10. Rollout

One batch at a time, smallest risk first (weapons with no warnings, then inferred
layouts, then cloth, then effects, menu, text, player chrbnd). Close the game before
replacing files. For each batch record: files, hashes, user's "yes", the test done
and the result, including the exact action that caused any crash.


## Updated save-preserving procedure (2026-10-18)

Read [APOLLO-END-TO-END.md](APOLLO-END-TO-END.md) for the current procedure. Deleting saves is not required. Earlier repack failures do not prove universal incompatibility. Compare source-version losses separately from conversion errors; Marais combo follow-ups remain unresolved.
