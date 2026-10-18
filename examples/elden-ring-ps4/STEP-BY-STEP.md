# Porting an Elden Ring PC moveset mod to PS4: step by step

Draft, 2026-10-17. Written from one real port (Clever's Moveset Modpack 26.1 on a
base/Slim PS4, system software 13.52, Elden Ring app 01.25 / game 1.17.1).

Each step is marked:

- ✅ **Verified**: done on the console and confirmed working.
- ❌ **Verified failure**: done and confirmed **not** to work.
- ⚠️ **Unverified**: planned, inferred or reported by someone else.

This guide does not explain how to jailbreak a console, does not link any exploit,
payload or firmware, and does not provide any game or mod file.

---

## Before you start

1. **Ask the mod author for permission.** Many authors forbid modifying their files.
   Even with permission, never share the converted files: everyone converts their own.
2. **You need a console that already runs a homebrew environment with plugin support
   and a file-redirection plugin.** The tested setup used GoldHEN with the AFR plugin.
   Setting that up is outside this guide and is your own responsibility.
3. **Use a second account.** Keep encrypted and decrypted backups; existing saves can be preserved with Apollo.
4. **Turn off automatic updates and keep the game offline.** A game update can arrive
   that needs newer system software and stop the game from launching.
5. **Tools on the PC:** Node.js, curl (comes with Git for Windows) and REA (Reverse
   Engineer Anything, npm package `rea-agents`), which was used to inspect a serializer library related to the
   game's Havok format without running third-party binaries. See
   `../../pc-to-console-mod-port/references/rea.md`.
6. **Write down your versions:** console model, system software, game app version
   (APP_VER), calibration version, DLC owned, mod version and the SHA256 of the mod ZIP.

## Step 1. Check the mod is data-only ✅

Open the mod ZIP and list its files. If it contains `.dll` or `.exe`, it relies on PC
native code and cannot be ported this way. A data-only mod contains things like
`regulation.bin`, `.hks`, `.behbnd.dcx`, `.anibnd.dcx`, `.partsbnd.dcx`.

## Step 2. Check file redirection works ✅

1. Enable the redirection plugin for the game. Tested: `afr.prx` in
   `/data/GoldHEN/plugins/`, with a `[CUSA18723]` section in
   `/data/GoldHEN/plugins.ini` (use your own title ID).
2. Files go in `/data/GoldHEN/AFR/<TITLE_ID>/` with the same relative path as in the
   game, for example `/data/GoldHEN/AFR/CUSA18723/regulation.bin`.
3. Copy files with the homebrew FTP server. Large files are slow (about 148 KB/s
   observed); give each transfer at least 10 minutes.
4. After each upload, download the file back and compare its SHA256 with your copy.

## Step 3. Load the mod's regulation ✅

1. Copy the mod's `regulation.bin` **exactly as downloaded** to the AFR folder.
2. Use a separate test account, or preserve the existing save with the Apollo procedure linked below.
3. Start the game offline and create a character.
4. Check something only the mod changes (for this mod: the Samurai class started at
   level 12 with 18 Dexterity).

Earlier experimental repacks of `regulation.bin` gave error
CE-34878-0.

## Step 4. Add the character script ✅

Copy `action/script/c0000.hks` as it is (plain text). The game boots with it.
⚠️ Booting does not prove all of the mod's script runs. Test a move that only the mod has.

## Step 5. Dump the PS4 originals ✅

With the game running, copy from the console the original files you will replace
(behavior, the three player anibnds, each weapon's partsbnd, the material catalogue).
They are under `/mnt/sandbox/pfsmnt/<TITLE_ID>-patch0/` or `<TITLE_ID>-app0/`.
Re-dump after every game update.

## Step 6. Convert the behavior file ✅ / ❌

❌ The PC `chr/c0000.behbnd.dcx` copied as-is crashes the PS4 game.

✅ A converted version works. Both platforms use the same Havok version, but some
internal structures have different sizes. The conversion rewrites each object into
the PS4 layout taken from the PS4 original, then repacks with Oodle (KRAK level 7).
Always check the result by converting it back and comparing.

## Step 7. Convert the player animations ✅

Apply the same conversion to the three player anibnds (`c0000.anibnd.dcx`,
`c0000_a00_hi.anibnd.dcx`, `c0000_a6x.anibnd.dcx`). Result: the character loads,
runs and plays animations, including the mod's new ones.

⚠️ Some Havok classes had no PS4 example and their layout was inferred. If the game
crashes on one specific attack or in one specific place, suspect this first and
write down exactly what you were doing.

## Step 8. Convert weapon models ✅ (one weapon so far)

If a weapon is invisible, its model file is probably missing on PS4.

1. Find the weapon's model ID in the regulation and the matching
   `parts/wp_a_XXXX.partsbnd.dcx` (and `_l`) in the mod.
2. Inside: textures (TPF), models (FLVER) and small animation files (HKX).
3. Textures must be converted: PS4 uses a different texture header and a swizzled
   pixel layout. Test your converter on PS4 original textures first: converting them
   back and forth must give identical bytes.
4. Models were kept as-is. Check the material names they use exist on PS4.
5. Convert the small HKX files like step 6.
6. Repack (KRAK level 7), upload both files, test.

Result: the weapon was visible and usable.

## Step 9. Everything else ⚠️

Not verified yet: weapons with cloth, visual effects (`sfx`), menu textures, item
text (`msg`), the player model (`c0000.chrbnd.dcx`), long play sessions and every area.

⚠️ Others report converting Havok files with Havok Content Tools 2018; that route was
not tested here.

⚠️ Very large textures may cause memory problems on a base or Slim PS4.

## Step 10. Roll out safely ✅

- One batch at a time, easiest first.
- Close the game before replacing files.
- Keep the previous file renamed (for example `.off`) so you can undo.
- For each batch write down: files, hashes, test done, result.

## What not to do

- Do not share game files, mod files or converted files.
- Do not install firmware from unofficial sources.
- Do not play online with modified files.
- Do not apply a 60 FPS patch made for another game version.


## Updated save-preserving procedure (2026-10-18)

Read [APOLLO-END-TO-END.md](APOLLO-END-TO-END.md) for the current procedure. Deleting saves is not required. Earlier repack failures do not prove universal incompatibility. Compare source-version losses separately from conversion errors; Marais combo follow-ups remain unresolved.
