# Methodology

Game-agnostic. Each phase ends with a gate. Lessons in boxes come from the Elden Ring
example and are marked with where they were verified; treat them as things to check,
not as facts about your game.

## Phase 0. Facts and permissions

Ask, do not guess:

- Game, platform of the mod (PC), target console and model, system software version.
- Console game version, region/title ID, DLC owned.
- Mod name, version, download hash; the mod's target game version.
- Mod author's permission.
- Homebrew environment and the file-redirection mechanism available (plugin, loader,
  path layout). Verify it is already running.

**Gate 0:** permission, homebrew running, versions written down.

## Phase 1. Inventory the mod

- List every file with size and SHA256.
- Split **data** (tables, scripts, models, textures, animations, audio, text) from
  **native code** (DLL, EXE, script-extender plugins). Native code is normally not
  portable; if the mod depends on it, stop or scope it out.
- For each data file record: extension, magic bytes, container type, compression,
  encryption, declared version.

**REA here:** inventory and integrity of the archive; identify unknown magic bytes and
containers; keep the evidence reference for each finding.

## Phase 2. Get the console's originals

- Dump, from the person's own console, the originals of every file the mod replaces,
  for the **exact** console game version. Re-dump after any game update.
- Some consoles only expose decrypted game files while the game runs; read from the
  mounted paths the homebrew environment offers.

> Elden Ring/PS4: an untouched mod regulation loaded with a fresh test save. Later, an existing save was preserved through Apollo by replacing only its embedded regulation. Earlier external repacks failed; the cause remains unresolved. Do not require save deletion or infer universal repacking incompatibility from those tests. See the end-to-end Apollo guide in the worked example.

**Gate 4:** a mod-only change is visible on the console. If not, stop.

## Phase 5. Write converters

Rules that kept the example safe:
- Read the console original's layout; relocate each field; recompute offsets and
  pointer tables; preserve indices and references.
- Refuse, do not silently drop: missing fields, overlaps, lost non-zero bytes.
- Where a class/record has no console sample, infer only with explicit rules, count how
  many known cases the rule reproduces, and flag the inferred ones.
- For pixel data: validate the swizzle/tiling code by exact round-trip on console
  original textures of each format before touching mod textures.

## Phase 6. Verify locally

- Reverse conversion must reproduce the input byte for byte (per object or per block).
- Compare object/reference graphs between source and output.
- Repack, decompress again, re-read every member, compare hashes.
- Check references across files (bones in animations vs skeleton, materials vs catalogue).

## Phase 7. Deploy and test in batches

- Smallest risk first. Close the game before replacing files.
- List files, sizes, SHA256; wait for "yes"; upload; download back; compare SHA256.
- One specific test per batch, ideally one only the mod can pass.
- On a crash, record what the player was doing and which batch was last; roll back.

## Phase 8. Record

Per batch: files, hashes, approval, test, result, and any REA evidence references.
Keep verified and unverified results in separate lists.

## General warnings

- Turn off automatic updates; a game update can require newer system software and
  invalidate both the dump and the homebrew setup.
- Keep the game offline with modified files.
- Large PC assets may exceed console memory. [Inference] Plan for reduced resolution.
