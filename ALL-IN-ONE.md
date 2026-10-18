# PC-to-console mod investigation: collected documentation

Updated 2026-10-18. Generated from the source documents listed below. Source paths are relative to the repository root; use source files for relative links. Scripts are distributed separately.

---
Source: README.md

# PC mod → console port: skill and guides (draft)

Draft release, updated 2026-10-18. Distributed by Alex.

A workflow for investigating and porting data-only PC mods to console, with an Elden Ring → PS4 case study.

## How to use it with any AI

1. Clone this repository or download its source files from GitHub.
2. Give your AI assistant the whole folder (or `ALL-IN-ONE.md` if it only accepts one
   file).
3. Write to it, in your own language: "Read AI-START-HERE.md and follow it."

## Contents

- `QUICK-GUIDE.md`: one-page summary for people. Read this first.
- `AI-START-HERE.md`: instructions for the AI.
- `ALL-IN-ONE.md`: every document in one file (scripts not included).
- `pc-to-console-mod-port/`: the generic skill (`SKILL.md` plus `references/`:
  methodology, REA, file transfer, safety and licensing).
- `examples/elden-ring-ps4/`: the worked example: case study, workflow, formats, PS4
  connection (GoldHEN FTP + AFR), detailed step-by-step, and the research scripts
  (`tools/`) with their SHA256 list.

## What is not included

No game files, mod assets, converted assets, personal saves or proprietary DLLs are distributed. The repository also excludes exploits, payloads and firmware. Links to source references and tool documentation are not downloads of those excluded files.

## Credits

- REA (Reverse Engineer Anything), https://github.com/morluto/rea, MIT.
- Worked example tested with Clever's Moveset Modpack (Nexus Mods 1928); Clever is cited
  with permission. None of the mod's files are included.

## Licence

- Documentation: CC-BY-4.0.
- Scripts (`examples/elden-ring-ps4/tools/`): GPL-3.0, full text in `tools/LICENSE`.


## Scope and installation

The investigation workflow can guide other games. Included conversion scripts are specific to Elden Ring; other games require format research and new tooling. Successful booting is not full gameplay validation.

Start with the [end-to-end PS4 and Apollo guide](examples/elden-ring-ps4/APOLLO-END-TO-END.md): local IP and FTP, original regulation dump, conversion/deployment, backups, decrypted save export, embedded regulation replacement, Apollo import, gameplay checks and rollback.

For an assistant with directory-based skills, install the `pc-to-console-mod-port` folder in its supported skills directory. Keep `examples/` beside that folder so the worked-example links remain available. Alternatively give the assistant this repository and ask it to read `AI-START-HERE.md`. This is a workflow skill, not an MCP server or a universal mod converter; installation mechanics depend on the assistant.

The repository distributes individual source files. There is no bundled ZIP to maintain.

---
Source: AI-START-HERE.md

# AI: START HERE

You are an AI assistant. A person has given you this package so you can help them port
a **PC game mod to a console**. The workflow can guide investigations of other games, but has only been tested on
one (Elden Ring → PS4, in `examples/`). Assume you know nothing else about this
project, and that the person may be a beginner, may not speak English, and may be on a
slow connection.

## 0. Read first, in this order

1. This file.
2. `pc-to-console-mod-port/references/safety-and-licensing.md`
3. `pc-to-console-mod-port/SKILL.md` (the method and the hard limits)
4. `pc-to-console-mod-port/references/methodology.md` (phases and gates)
5. `pc-to-console-mod-port/references/rea.md` (the reverse-engineering tool)
6. `pc-to-console-mod-port/references/file-transfer.md` (PC ↔ console)
7. If the game is **Elden Ring on PS4**: `examples/elden-ring-ps4/CASE-STUDY.md`,
   `workflow.md`, `ftp-and-afr.md`, `formats.md` and `tools/README.md`. You can follow
   that example as a partly validated case study, and read `APOLLO-END-TO-END.md` before any save operation. Check the installed versions and recorded limitations.
   For any other game: read the example anyway, to see the method applied, but do not
   copy its formats, paths or results without checking them on the new game.

`QUICK-GUIDE.md` is the short version for people; show it at the start.

If files are missing, identify them and obtain the complete repository checkout or the missing source files. This repository is distributed as individual files, not a maintained ZIP. Do not fill gaps from memory.

## 1. How to talk to the person

- **Answer in the person's language.** Keep file names, paths and commands as they are.
- Use simple words; explain each technical term the first time.
- One step at a time. After each step, ask what they see; wait for the answer.
- Ask for screenshots and exact error codes when something fails.
- Never guess. Say "I cannot verify this" when you cannot. Mark anything not confirmed
  as `[Unverified]`, `[Inference]` or `[Speculation]`.
- Do not promise it will work.

## 2. Things you must refuse

- Publicly redistributing game files, mod files or converted files. Transfers between the user's own PC and console are part of the authorized workflow and are not public redistribution.
- Giving, linking or searching for exploits, payloads, exploit sites or unofficial
  firmware. **The console's homebrew environment is a prerequisite.** If it is not
  installed, tell the person to install it first by following the official project's
  own instructions for their system software, and to come back when it runs.
- Giving or linking proprietary libraries (for example compression DLLs). The person
  obtains them from a legitimate copy they own.
- Playing online with modified files.

## 3. Conversation plan (gates must pass in order)

### Phase A: Interview, no files touched

1. Which game, which mod (link, version)? Does the mod include `.dll`/`.exe` or
   script-extender plugins? → If it depends on them: stop, this method is for data mods.
2. Has the mod author allowed modifications? → If not: stop.
3. Which console, model and system software version?
4. Is the homebrew environment already running? Which one and which version? Does it
   offer FTP (or another transfer) and a way to redirect game files?
   → If not installed: pause (section 2).
5. Console game version and region. DLC owned. Is it the same game version the mod
   targets?
6. A PC (Windows was used in the example) with Node.js? An AI client that can use MCP
   tools (for REA)?
7. A separate test account/save, or an explicit request to preserve and modify an existing Elden Ring PS4 save through Apollo? For the latter, verify encrypted and decrypted backups and explain that importing the candidate replaces live save data.

Summarise the answers and ask the person to confirm.

**Gate A:** data-only mod, permission, homebrew running with transfer + redirection, a
PC, and an agreed save strategy: an isolated test save, or an authorized existing-save procedure with verified backups.

### Phase B: Safety and connection

- Automatic updates off; game offline while testing.
- Explain the rule: before every upload you list the files and wait for "yes".
- Connect the PC to the console (`file-transfer.md`; for PS4/GoldHEN follow
  `examples/elden-ring-ps4/ftp-and-afr.md`). Test read-only first.
- Set up file redirection without overwriting existing configuration.

**Gate B:** the PC can list console folders and redirection is configured.

### Phase C: Tools on the PC

- Node.js from its official site.
- Use format readers and source references for supported game-data formats. If executable or library inspection is needed, set up REA following `rea.md`. Missing MCP access does not invalidate independently checked parser results; label only claims that lack evidence as `[Unverified]`.

### Phase D: Inventory and originals (methodology phases 1–2)

- Inventory the mod with hashes; classify every file.
- Dump the console originals of the same files, same game version.

### Phase E: Analyse and cross (methodology phase 3)

- Using format readers and REA where appropriate, analyse each mod file and its console original; build the comparison table
  (container, compression, encryption, version, byte order, layout, platform encoding,
  scripts). Decide per file: as-is / repack only / convert / not portable.
- Show the person a plain summary of the decision per file type.

### Phase F: Cheapest proof (methodology phase 4)

Load a compatible untouched mod file through redirection and check a mod-only change. For Elden Ring, distinguish an isolated test save from the Apollo existing-save route: the embedded regulation may affect what loads. Diagnose the active data source before attributing a failed test to conversion.
**Gate F:** a mod-only change is demonstrated, or the missing prerequisite is documented before proceeding.

### Phase G: Convert, verify, deploy (methodology phases 5–8)

Per batch: convert → verify locally → list files/sizes/SHA256 → person closes the game →
"yes" → upload → download back and compare → one specific test → record the result.
On a crash: what were they doing, which batch, which error code; roll back.

## 4. Say plainly what is unknown

- Results outside the worked example are unknown until tested.
- Long-term stability and every part of the game are untested unless the person tests them.


For Elden Ring save preservation, read examples/elden-ring-ps4/APOLLO-END-TO-END.md before editing or resetting saves. Use version-aware PARAM definitions and compare previous/current mod sources before attributing failures to conversion.

---
Source: QUICK-GUIDE.md

# Quick guide (for people)

**What this is:** a workflow for investigating and porting data-only PC mods to console, with a partly validated Elden Ring → PS4 case study. Other games need format research and new tools; this is not a universal converter.

## What you need

- A console with **homebrew already working** (for PS4, GoldHEN). This package does
  not install it.
- A PC on the same Wi-Fi or router as the console.
- The game on your console, and the PC mod you want (data only: no `.dll` or `.exe`).
- **Permission from the mod's author.**
- An AI assistant that can run local tools, plus Node.js for the included scripts. REA can help inspect executables and libraries when needed; game-data readers do not require it.
- A save strategy: use a separate test account/save for initial tests, or explicitly choose the existing-save Apollo route for Elden Ring PS4. That route modifies the live save when you import the candidate. Preserve verified encrypted and decrypted backups first; a backup does not eliminate the risk of losing progress.
- Patience.

## How it goes

1. **Give this folder to your AI** and write, in your language:
   "Read AI-START-HERE.md and follow it."
2. **The AI asks you questions** about your console, game and mod.
3. **You connect the PC to the console** over Wi-Fi. The AI tells you where to click.
4. **The AI studies the mod's files and your console's files**, using format readers and REA where appropriate, and tells you
   which files can be copied as they are, which must be converted, and which cannot work.
5. **First test:** use one compatible, untouched mod file if available. Verify redirection and the active data source. For Elden Ring, an existing save can retain regulation data; choose the test-save or Apollo route before concluding that redirection failed.
6. **The AI converts the rest on your PC**, and checks each result before you copy it.
7. **You copy in small groups** and test after each one. The AI always asks first.
8. **If the game crashes**, record the exact action and error. Restore verified asset/save backups as appropriate; restoring an older save discards progress made after that backup.

## Important

- Turn off automatic updates. An update can stop the game or the homebrew from working.
- Do not play online with mods.
- Do not share game files or mod files. Everyone converts their own.
- Use at your own risk.

**Elden Ring on PS4?** There is a worked example with explicit validation limits in `examples/elden-ring-ps4/`.


For the complete PS4 IP/FTP/Apollo procedure and existing-save preservation, read [the end-to-end guide](examples/elden-ring-ps4/APOLLO-END-TO-END.md).

---
Source: examples/elden-ring-ps4/APOLLO-END-TO-END.md

# Elden Ring PS4: connection, mod deployment, Apollo and saved regulation

Updated 2026-10-18. This is an end-to-end record of a partly validated Elden Ring PC-to-PS4 port, not a universal save editor. Run the commands in PowerShell on your PC unless stated otherwise. Replace example addresses and IDs with values observed on your console.

The tested outcome was importing an existing save through Apollo, loading its characters and seeing mod weapons. A later export retained the mod regulation; inventory plus storage comparison detected no decreases. This does not establish compatibility with every game update or validate every move.

## 1. Prepare the console and preserve the save

1. GoldHEN, a working FTP server, AFR and Apollo Save Tool are prerequisites. This guide does not install a jailbreak.
2. On PS4, open Settings → Network → View Connection Status. Record the local IP address. Connect the PC and console to the same local network.
3. Enable GoldHEN's FTP server and record its actual port; the tested setup used 2121. Do not forward this port on your router.
4. Record the application TITLE_ID, APP_VER, calibration version, DLC and mod version. In the tested setup the application was CUSA18723 but the save used CUSA18581. Application and save IDs can differ.
5. Close Elden Ring before exporting/importing a save or replacing active assets.
6. Use PS4 saved-data management to copy the encrypted save to USB. Preserve the complete SAVEDATA folder. If this option is unavailable, establish and verify an equivalent backup before editing. Keep later exports separate.

```powershell
$ps4Address = '192.168.0.34' # Replace with the current console IP
$ftpPort = 2121
$titleId = 'CUSA18723'      # Replace with your application TITLE_ID
$ftpRoot = "ftp://${ps4Address}:$ftpPort"
New-Item -ItemType Directory -Force work/originals,work/backup,work/mod,work/candidate,work/readback
curl.exe --fail --show-error --max-time 15 --list-only "$ftpRoot/"
```

If listing fails, check the IP, port, server and connection. Successful FTP access does not prove that AFR is redirecting game files.

## 2. Download the game's original regulation

Start Elden Ring to mount the game files, then list the actual mounts:

```powershell
curl.exe --fail --show-error --list-only "$ftpRoot/mnt/sandbox/pfsmnt/"
$gameMount = "/mnt/sandbox/pfsmnt/${titleId}-patch0"
curl.exe --fail --show-error --list-only "$ftpRoot$gameMount/"
curl.exe --fail --show-error --max-time 600 --output work/originals/regulation.bin "$ftpRoot$gameMount/regulation.bin"
Get-FileHash work/originals/regulation.bin -Algorithm SHA256
```

Prefer the matching patch0 mount. If the file is absent there, inspect app0 and record its actual source. Do not silently substitute an older dump. In the project, the union mount sometimes listed files it could not deliver; actual patch/app mounts were used instead. Record size and hash; a second independent download can verify transfer consistency.

Download the corresponding original behavior, player anibnds, weapon parts and material catalogues required by the conversion. See [workflow.md](workflow.md) and [formats.md](formats.md). Close the game after downloading and before deployment.

## 3. Inspect the mod and convert its resources

1. Extract your own legitimate copy of the mod. Copy its untouched regulation.bin to work/mod/regulation.bin and record its SHA256.
2. Distinguish application version, calibration version and the internal BND4 regulation version. They are not interchangeable.
3. Read PARAM fields with definitions applicable to that regulation version, including FirstVersion/RemovedVersion. Validate field bounds and row sizes rather than relying only on dataVersion.
4. Compare previous mod release → current release → converted output. The tested 26.1 source had lost actions/events present in 26.0. Accurate conversion alone would preserve those losses. Do not revert every changed action automatically.
5. Follow [STEP-BY-STEP.md](STEP-BY-STEP.md) for HKX, TPF and other resource conversion, and the [research tools guide](tools/README.md) for scripts and dependencies. These scripts require your own source files and matching PS4 originals; they are not a one-command converter.
6. Verify reconstructed containers, references, hashes and appropriate roundtrips before deployment. A successful boot does not validate all actions or effects.

In the save experiment, the original embedded regulation was BND4 version 11711000 and the mod regulation was 11701000, both with 194 tables. These are observed values, not constants for future ports. Earlier external regulation repacks crashed with CE-34878-0; their cause was not proven, nor was universal repacking incompatibility established.

## 4. Deploy through AFR with read-back verification

The tested AFR configuration used afr.prx in /data/GoldHEN/plugins/ and a [CUSA18723] section in plugins.ini. See [ftp-and-afr.md](ftp-and-afr.md) for the configuration. Back up existing configuration before editing; do not replace it wholesale with an example.

With Elden Ring closed, put the mod's untouched regulation at /data/GoldHEN/AFR/TITLE_ID/regulation.bin and converted assets at their game-relative paths. Create required directories with your FTP client. Before replacing any existing remote file, download it to a distinct backup path and verify it. If it did not exist, record that fact for rollback.

```powershell
curl.exe --fail --show-error --max-time 600 --upload-file work/mod/regulation.bin "$ftpRoot/data/GoldHEN/AFR/$titleId/regulation.bin"
curl.exe --fail --show-error --max-time 600 --output work/readback/regulation.bin "$ftpRoot/data/GoldHEN/AFR/$titleId/regulation.bin"
if ((Get-FileHash work/mod/regulation.bin).Hash -ne (Get-FileHash work/readback/regulation.bin).Hash) { throw 'Read-back mismatch: stop' }
```

Use small asset batches and verify every uploaded file the same way. A fresh character on a separate test account can establish a baseline without modifying the main save. Deleting an existing save is not a general prerequisite: use the Apollo route below to preserve it.

## 5. Export a decrypted save with Apollo

1. Close Elden Ring. Open Apollo using the user who owns the save.
2. In HDD Saves, select Elden Ring and confirm the actual save ID, rather than assuming it matches the application ID.
3. Select the decrypted-file export operation. Menu wording and destination may vary with Apollo version: record the path reported by your installed application. Export and import are different operations.
4. Find memory.dat in the exported directory. The observed structure was /data/apollo/USER_ID/SAVE_ID_sce_sdmemory/memory.dat. A USB decrypted export is also usable. Do not guess USER_ID or SAVE_ID.
5. Exit Apollo once export completes. Use the FTP server that is actually active; update the address/port if it changes.

```powershell
$apolloExport = '/data/apollo/YOUR_USER_ID/YOUR_SAVE_ID_sce_sdmemory'
curl.exe --fail --show-error --max-time 600 --output work/backup/memory-original.dat "$ftpRoot$apolloExport/memory.dat"
Get-FileHash work/backup/memory-original.dat -Algorithm SHA256
```

Preserve this decrypted original separately from both the encrypted USB backup and later exports. Download a second copy and compare hashes if remote hashing is unavailable. Never publish saves, account identifiers or identifying metadata.

## 6. Replace only the embedded regulation in a local copy

[build-save-regulation.cjs](tools/build-save-regulation.cjs) adapts the project's tested candidate generator to explicit file paths and input hashes. It never connects to the console and refuses to overwrite an existing candidate or report. It needs Node.js with ZSTD support (Node 24 was used) and the included tools/analysis-26.0/analyze-mod.cjs reader.

Run from the repository root:

```powershell
node --version
$saveHash = (Get-FileHash work/backup/memory-original.dat -Algorithm SHA256).Hash.ToLower()
$modHash = (Get-FileHash work/mod/regulation.bin -Algorithm SHA256).Hash.ToLower()
node examples/elden-ring-ps4/tools/build-save-regulation.cjs work/backup/memory-original.dat work/mod/regulation.bin work/candidate/memory.dat $saveHash $modHash
```

Supported layout is limited to the observed raw PS4 save: 28967040 bytes; ten 0x280000-byte slots starting at 0x70; a 0x60000-byte profile; UserData11 header at 0x1960070 and encrypted payload at 0x1960080. The script checks these assumptions, headers, allocation bounds, versions and decryptability. These offsets are not universal. If input is rejected, investigate rather than removing assertions.

The generator preserves the mod's compressed DCX and exact encrypted prefix, extends encryption to the save's allocation, and changes only the UserData11 version field and its regulation allocation. It does not invent a higher version number. It rereads the output, checks that all ten slots and the profile are byte-identical, and verifies the decrypted replacement BND4. It also rejects deliberately malformed inputs as a local self-check.

Review swap-verification.json beside the output before importing. Hashes bind the operation to the files you chose; they cannot establish that you selected the correct account, game version or mod. Local verification is not proof of game acceptance on an untested update.

## 7. Upload to the Apollo export and import manually

Confirm Elden Ring is still closed. Upload to the decrypted Apollo export, not directly into the console's live save database:

```powershell
curl.exe --fail --show-error --max-time 600 --upload-file work/candidate/memory.dat "$ftpRoot$apolloExport/memory.dat"
curl.exe --fail --show-error --max-time 600 --output work/readback/memory.dat "$ftpRoot$apolloExport/memory.dat"
if ((Get-FileHash work/candidate/memory.dat).Hash -ne (Get-FileHash work/readback/memory.dat).Hash) { throw 'Candidate read-back mismatch: do not import' }
```

1. Open Apollo with the same user.
2. Select HDD Saves → Elden Ring with the verified save ID → Import decrypted save files → memory.dat, following the actual menus in your version.
3. Check Apollo's import result. Cheats and account changes are not part of this procedure.
4. Exit Apollo and start Elden Ring offline with the corresponding AFR assets active.

## 8. Test, restart and reexport

1. Record calibration, errors and whether the expected character loads.
2. Check a mod-exclusive observable. In the tested pack, Samurai character creation showed level 12 / Dexterity 18 instead of 9 / 15. Existing character stats do not validate changes to starting-class parameters.
3. Test individual light/heavy attacks, charged R2, skill follow-ups and one-/two-handed variants. Record rendering, effects, damage and combos separately.
4. Save normally, close and reopen the game, and check persistence.
5. Close Elden Ring and reexport with Apollo. Download as work/backup/memory-after-test.dat, without replacing memory-original.dat.
6. Reinspect UserData11, its decrypted regulation and BND4 contents. The title-screen calibration alone is insufficient evidence of which regulation persisted.
7. Compare each character's inventory plus storage by item ID and quantity. Visual sorting or translated names alone cannot establish losses. Character bytes may legitimately change after playing; exact slot equality is required when building the candidate, not after gameplay.

Observed later export: the mod regulation persisted, and combined inventory/storage comparison found no decreases relative to the preserved baseline. The exact runtime precedence between the external regulation and embedded copy remains inferred rather than traced in the engine.

Reported gameplay after later TAE recovery: single/dual Lightblades and Tachikaze R2 work. Marais still fails to chain after the initial skill attack even with enough FP. The original Moonveil model fallback remains untested. This port is not fully validated.

## 9. Roll back

1. Close Elden Ring.
2. Upload work/backup/memory-original.dat to the Apollo export as memory.dat. Download it back and verify its hash against the original backup.
3. Import through Apollo using the same owner and save entry.
4. Restore the corresponding earlier AFR assets/configuration if reverting the mod too. Disable added overrides that had no prior counterpart. Keep the save and deployed assets consistent.
5. Keep the encrypted USB backup as an alternative. Restoring an older backup also discards progress made after that backup.

Never edit your only copy. This procedure does not require deleting characters.

---
Source: examples/elden-ring-ps4/CASE-STUDY.md

# Case study: Elden Ring PC mod → PS4

Verified on: PS4 base/Slim, system software 13.52, GoldHEN 2.4b18.x, AFR plugin 1.210,
Elden Ring app 01.25 (game 1.17.1). Resources originated from Clever's Moveset Modpack 26.1, with later 26.0 TAE recoveries. Identify the regulation by hash: project labels were inconsistent. Last updated 2026-10-18.


This case study describes a workflow that was tested on one console with one mod. It is a
record of what worked, what failed and what is still unknown. It is **not** a
guarantee that any other mod, game version or console will behave the same way.

This is the worked example of the generic skill `../../pc-to-console-mod-port/`.
Follow `workflow.md` step by step. Format notes are in `formats.md`, the PS4
connection in `ftp-and-afr.md`, a human walkthrough in `STEP-BY-STEP.md`, and the
research scripts in `tools/` (experimental; read `tools/README.md`).
Mod author credit: Clever (Clever's Moveset Modpack, Nexus Mods 1928), cited with
permission. This skill contains none of the mod's files.

## Tools

- **REA (Reverse Engineer Anything)**, npm `rea-agents`, was used for static
  inspection of binaries (Havok serializer DLL) without running them, with evidence
  for each finding. See `../../pc-to-console-mod-port/references/rea.md`.
- Node.js for the scripts in `tools/`; Windows PowerShell for KRAK compression with
  an Oodle DLL the person supplies.
- curl (or any FTP client) to talk to the console. See `ftp-and-afr.md`.
- Source code read for format knowledge: SoulsFormatsNEXT, WitchyBND, Smithbox,
  DrSwizzler.

## Hard limits (never break these)

1. **No redistribution.** Never upload, share, attach or link files from the game or
   from a mod whose licence forbids it. Each user converts their own copies locally.
   Publish only your own scripts and documentation.
2. **No exploits or payloads.** Do not provide, link, download or run jailbreak
   payloads, exploit hosts or firmware files. If the user has no homebrew environment,
   stop: preparing the console is the user's own decision and responsibility.
3. **Permission from the mod author.** Many mod authors forbid modification. Ask the
   user to obtain the author's permission before converting anything, and record it.
4. **Every write to the console needs an explicit "yes" from the user for that
   specific batch.** Explain exactly which files will be uploaded and where, first.
5. **Preserve backups and agree on the save route.** Prefer an isolated test save. The authorized Apollo route modifies an existing live save at import; verify encrypted/decrypted backups and the candidate first.
6. **Third-party binaries only with explicit user consent.** Name the binary, its
   source and its SHA256, and wait for approval.

## Evidence discipline

- Label every claim you have not checked yourself at the start of the sentence:
  `[Inference]`, `[Speculation]` or `[Unverified]`. If you cannot check something,
  say "I cannot verify this".
- Identify every file by SHA256 and size, not by version label. Version labels in
  logs were wrong at least once in the original project.
- "The game boots" proves only that it boots. It does not prove the mod's script,
  animations or models are in use. Design a test that only the modded file can pass.
- Keep originals untouched. Work on copies. Keep the previous file on the console
  renamed (for example `.off`) so a batch can be rolled back.
- Upload in small batches (one weapon or one asset type at a time) so a crash can be
  attributed to a file.

## Asset status (updated 2026-10-18; partial validation)

| Asset | PC file usable as-is on PS4? | Status |
|---|---|---|
| `regulation.bin` (mod's own, untouched) | Yes | Verified (existing-save Apollo route available; see workflow) |
| Experimental external `regulation.bin` repacks | Tested candidates failed with CE-34878-0 | Cause unresolved; distinct from the successful embedded-regulation Apollo procedure |
| `action/script/c0000.hks` (plain text) | Yes | Verified boots; not every branch tested |
| `chr/c0000.behbnd.dcx` | No, crashes | Verified: needs Havok layout conversion |
| `chr/c0000*.anibnd.dcx` | No | Verified: converted versions play animations |
| `parts/wp_a_*.partsbnd.dcx` | No | Verified for one weapon after TPF + nested HKX conversion |
| SFX, menu TPF, `c0000.chrbnd`, `msgbnd` | Asset-specific processing | Converted/deployed in later batches; complete visual/effect correctness remains unverified |
| Cloth (`hcl*` classes) | No general claim | Not fully validated |

## When to stop

- The homebrew environment or file redirection cannot be confirmed by a trivial test.
- The active regulation or redirection cannot be established after checking the chosen test-save or Apollo route. Do not delete a save as a diagnostic default.
- The mod author refuses permission.
- The user's game version differs from the mod's target version and no matching
  base files are available for comparison.

## Current gameplay limits

The [end-to-end Apollo guide](APOLLO-END-TO-END.md) records the current save procedure and test results. Lightblades and Tachikaze R2 were reported working after later TAE recovery. Marais follow-ups remain unresolved despite sufficient FP. Moonveil's original-model fallback remains untested. The included historical conversion scripts do not automatically apply those later recovery/mesh fixes.

---
Source: examples/elden-ring-ps4/STEP-BY-STEP.md

# Porting an Elden Ring PC moveset mod to PS4: step by step

Updated 2026-10-18. Written from one real port (Clever's Moveset Modpack 26.1 on a
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
3. **Choose the save route.** Prefer a separate test account/save. To modify an existing save through Apollo, preserve verified encrypted/decrypted backups and explicitly authorize import; that import changes live save data.
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
3. On the isolated test route, start offline and create a test character. On the Apollo route, load the existing character after the verified import.
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

## Step 8. Convert weapon models (asset-specific validation)

If a weapon is invisible, its model file is probably missing on PS4.

1. Find the weapon's model ID in the regulation and the matching
   `parts/wp_a_XXXX.partsbnd.dcx` (and `_l`) in the mod.
2. Inside: textures (TPF), models (FLVER) and small animation files (HKX).
3. Textures must be converted: PS4 uses a different texture header and a swizzled
   pixel layout. Test your converter on PS4 original textures first: converting them
   back and forth must give identical bytes.
4. The first tested model worked unchanged, but later Bloodstarved/Tachikaze rigid meshes needed layout fixes. Inspect each mesh and its material references; a matching format version does not establish compatibility.
5. Convert the small HKX files like step 6.
6. Repack (KRAK level 7), upload both files, test.

Result: the weapon was visible and usable.

## Step 9. Everything else ⚠️

Later batches converted/deployed SFX, menu textures, item text and the player model. That does not validate every effect or resource. Cloth behavior, full move coverage, every area and long-term stability remain incompletely tested.

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

## Current gameplay limits

The [end-to-end Apollo guide](APOLLO-END-TO-END.md) records the current save procedure and test results. Lightblades and Tachikaze R2 were reported working after later TAE recovery. Marais follow-ups remain unresolved despite sufficient FP. Moonveil's original-model fallback remains untested. The included historical conversion scripts do not automatically apply those later recovery/mesh fixes.

---
Source: examples/elden-ring-ps4/formats.md

# Format notes (PC vs PS4), as observed

Observed on Elden Ring PC files from one mod and PS4 app 01.25 originals. Treat every
row as true for those files only.

## Containers

- `.dcx`: compressed wrapper. Seen: DFLT, ZSTD (regulation), KRAK (Oodle). PS4
  repacks that loaded were KRAK level 7. [Unverified] whether level 7 is required.
- BND4: archive inside most `.dcx`. When repacking, keep member order, names, IDs,
  flags and the hash table coherent; re-read every member after writing.
- `regulation.bin`: encrypted, DCX/ZSTD → BND4 of PARAM tables. The mod's file
  declared version 11701000 and 194 tables. Earlier external repacks failed with CE-34878-0 for an unresolved reason. The successful Apollo procedure preserves the compressed mod regulation while replacing its embedded save allocation; see [APOLLO-END-TO-END.md](APOLLO-END-TO-END.md).

## Havok HKX (behavior, animations, nested weapon animations)

- Both platforms: TAG0 tagfile, SDK 20180100, 64-bit pointers.
- Sections used: TYPE, INDX, ITEM, PTCH (and type names/compendium references).
- Differences: per-class field offsets and sizes, so a raw copy crashes.
- Conversion method used: read the PS4 original's type metadata, match PC types by
  canonical identity (name plus inherited field list), relocate fields, recompute
  ITEM and PTCH offsets, keep indices and references. Reject missing fields, overlaps
  and loss of non-zero bytes. Verify by reverse conversion (byte-exact per ITEM) and by
  comparing reference graphs by type and field path.
- Unknown THSH type signatures were kept unchanged and flagged. Signature identity and
  file SHA256 are different checks; do not claim one from the other.

## TPF textures

| | PC | PS4 |
|---|---|---|
| Platform byte | PC | 4 |
| Texture header | 20 bytes, DDS file inside | 36 bytes: dimensions, textureCount 1, Unk2 13, explicit DXGI format |
| Pixel layout | linear BC blocks | swizzled (Morton order, tiles of 8×8 blocks) |

- The TPF format byte on PC did not always match the DDS's real BC format. Use the DDS
  header, not the TPF byte.
- Swizzle rules used: 4×4-pixel blocks; 8 bytes per block for BC1/BC4, 16 for BC7; each
  mip level padded to a multiple of 32 pixels (minimum 32).
- Candidate TPF/DXGI pairs that worked for one weapon: BC1 sRGB → 0 / 72;
  BC4 → 103 / 80; BC7 → 106 / 98; BC7 sRGB → 112 / 99. Verify each new case.
- Validate the swizzler by exact roundtrip on PS4 original textures (one per format)
  before converting mod textures.

## FLVER (models)

- Seen as little endian, version 0x2001A on both platforms; kept unchanged for the
  initial tested weapon. Material references (`.matxml`, `.mtd`) must exist in the PS4
  material catalogue. Later rigid-mesh fixes for Bloodstarved/Tachikaze show that matching FLVER versions do not guarantee every mesh is compatible.

## Reference sources (read, not run)

- SoulsFormatsNEXT source (TPF, Headerizer, DCX, BND4).
- WitchyBND and Smithbox documentation.
- DrSwizzler source (PS4 swizzle/deswizzle).

---
Source: examples/elden-ring-ps4/ftp-and-afr.md

# Connecting the PC to the PS4 (FTP) and enabling AFR

Prerequisite: GoldHEN is already running on the console. This package does not cover
how to install or load GoldHEN; the person must do that on their own beforehand.

Guide the person through this one step at a time and wait for their answer after each
step. Steps marked Verified are what worked in the original project. Menu names may
differ slightly between GoldHEN versions [Unverified].

## 1. Same network (Verified)

- The PS4 and the PC must be on the same home network (same router or Wi-Fi).
- Do not sign in to PSN. Keep automatic updates off.

## 2. Find the console's IP address (Verified)

On the PS4: Settings → Network → View Connection Status → "IP Address".
It looks like `192.168.x.x`. It is a local address; it is safe to share with the AI.
[Inference] It can change after a router restart; check it again if the connection fails.

## 3. Turn on the FTP server (Verified)

In the GoldHEN menu: GoldHEN Settings → Server Settings → FTP Server (enable).
A notification usually shows the IP and the port. In the original project the port was
**2121**. If no port is shown, try 2121.

Notes observed:
- If the PS4 goes into rest mode, the FTP connection stops. Keep it awake.
- FTP needs the network on. That is why automatic updates must be off.

## 4. Test the connection from the PC (Verified)

The original project used `curl` from Git Bash on Windows. Any FTP client works; curl
is shown because it is installed with Git for Windows and its output is easy to read.
Replace `IP` with the console's address.

List a folder (read only):

```
curl --max-time 30 "ftp://IP:2121/data/GoldHEN/"
```

If it prints a list of files, the connection works. If it times out: same network?
FTP enabled? correct IP? console awake?

## 5. Download a file (read only, Verified)

```
curl --max-time 600 -o "local-name.ext" "ftp://IP:2121/path/on/console"
```

Game originals are readable while the game is running, under
`/mnt/sandbox/pfsmnt/<TITLE_ID>-patch0/` or `/mnt/sandbox/pfsmnt/<TITLE_ID>-app0/`.

## 6. Upload a file (writes to the console: ask for "yes" first, Verified)

```
curl --max-time 900 -T "local-file" "ftp://IP:2121/data/GoldHEN/AFR/<TITLE_ID>/chr/c0000.behbnd.dcx"
```

- Add `--ftp-create-dirs` when the destination folder does not exist yet.
- Big files are slow (about 148 KB/s observed). If an upload stops halfway, it can be
  resumed with `-C -`, then must be checked as below.
- After every upload: download it back to a different name and compare SHA256
  (`sha256sum` in Git Bash, or `Get-FileHash` in PowerShell). Only a matching hash
  counts as uploaded.

## 7. Install the AFR plugin (Verified with AFR 1.210)

AFR ("Application File Redirector") is a GoldHEN plugin that makes the game read files
from `/data/GoldHEN/AFR/<TITLE_ID>/` instead of its own.

1. The person obtains `afr.prx` from the plugin's official release. Record its SHA256.
2. Upload it to `/data/GoldHEN/plugins/afr.prx`.
3. **Download the existing `/data/GoldHEN/plugins.ini` first, if there is one**, and
   add to it instead of replacing it (other plugins may be listed there).
4. Add a section for the game's title ID with the plugin path. Tested content:

   ```
   [CUSA18723]
   /data/GoldHEN/plugins/afr.prx
   ```

   Use the person's own title ID (shown in the game's folder name under
   `/user/app/` or in the console's game information).
5. Upload the edited `plugins.ini` back to `/data/GoldHEN/plugins.ini`.
6. Create `/data/GoldHEN/AFR/<TITLE_ID>/`.
7. Restart the game. Files placed under that folder, with the same relative path as
   inside the game, now replace the originals.

To undo: rename the replaced file on the console (for example add `.off`) or remove the
section from `plugins.ini`.

---
Source: examples/elden-ring-ps4/tools/README.md

# Research scripts (experimental)

These are the scripts used in the original port. They are **research code**, not a
finished tool: compact, written for one project, with paths relative to that project's
folder layout. Expect to adapt them.

No game files, mod files, converted files or third-party binaries are included.

## Requirements

- Node.js (scripts are CommonJS `.cjs`, standard library only).
- Windows PowerShell for the `.ps1` scripts, which compress/decompress KRAK `.dcx`
  through the Oodle DLL. **You must supply the DLL yourself** from a legitimate source.
  The scripts check its SHA256 and stop on mismatch; change the expected path and hash
  to yours after you have approved the binary.

The Havok converter was designed from PS4 type metadata, source reading and static
analysis with REA (Reverse Engineer Anything); see
`../../../pc-to-console-mod-port/references/rea.md`.

## Expected layout

For the historical conversion scripts, use `examples/elden-ring-ps4/tools/` as the research workspace root: it contains `analysis-26.1/`. Inspect each script's expected inputs before running it. The newer `build-save-regulation.cjs` accepts explicit paths and is invoked from the repository root in the Apollo guide.

```
analysis-26.0/analyze-mod.cjs        DCX/BND4 reader (shared helper)
analysis-ps4/task-015/build.cjs      BND4 hash-table helper
analysis-ps4/task-017/types.cjs      Havok TAG0 type-section parser
analysis-26.1/                       conversion, verification and repack scripts
analysis-26.1/inputs/...             YOUR copy of the mod's files (same paths as the ZIP)
analysis-26.1/ps4-1.17.1/...         YOUR dump of the matching PS4 originals
```

Some scripts assert the SHA256 of specific mod files (Clever's Moveset Modpack 26.0/26.1).
With another mod or version those asserts fail by design: replace them with your hashes.

## Main scripts by step

| Step | Scripts |
|---|---|
| Decode containers | `decode-*.ps1`, `decode-animation-mod.cjs`, `prepare-behavior.cjs`, `extract-inventory.ps1` |
| Havok layout | `hkx-layout.cjs`, `inspect-*-layout.cjs`, `audit-animations.cjs`, `infer-animation-layout.cjs`, `animation-schema.cjs` |
| Convert behavior | `convert-behavior.cjs`, `verify-behavior-graph.cjs`, `repack-behavior.cjs`, `encode-behavior-ps4.ps1` |
| Convert animations | `convert-animations.cjs`, `verify-animation-bindings.cjs`, `repack-animations.cjs`, `encode-animations-ps4.ps1` |
| Weapons | `inspect-weapon-model.cjs`, `inspect-model-textures.cjs`, `ps4-texture-blocks.cjs`, `convert-model-textures.cjs`, `convert-weapon-animations.cjs`, `verify-weapon-bindings.cjs`, `repack-weapon.cjs` |
| Other assets | `audit-remaining-assets.cjs`, `convert-remaining-assets.cjs`, `encode-remaining-assets.ps1`, `merge-spanish-text.cjs` |
| Deployment checks | `prepare-deployment-plan.cjs`, `verify-weapon-deployment.cjs` |

Status of each step (verified or not on a console) is in
`../workflow.md`.

## Licence

GPL-3.0; see `LICENSE`. The format knowledge comes partly from reading SoulsFormatsNEXT and
WitchyBND, which are GPL-3.0. Texture swizzling was studied from DrSwizzler, which shows
no licence file on GitHub. `ps4-texture-blocks.cjs` was compared with DrSwizzler's
`PS4Swizzler.cs` on 2026-10-17: same generic technique (Morton order inside 8×8 tiles),
different structure and code. [Inference] It is an independent implementation, not a
port; this is not a legal opinion.

SHA256 of each file: `../tools-sha256.txt`.

## Existing-save regulation candidate

Run build-save-regulation.cjs with SAVE MOD OUTPUT SAVE_SHA256 MOD_SHA256 arguments. It supports only the observed PS4 layout, preserves character/profile bytes and refuses existing output. See [the complete Apollo guide](../APOLLO-END-TO-END.md).

---
Source: examples/elden-ring-ps4/workflow.md

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
  it with the console regulation. Version labels alone do not establish compatibility: inspect the applicable schemas and changed data.

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
2. Choose either an isolated test save or the [Apollo existing-save procedure](APOLLO-END-TO-END.md). The latter modifies the live save at import and requires verified backups. The embedded regulation was extracted and inspected; its exact runtime priority remains inferred.
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

- FLVER: both used little endian version 0x2001A. The initial weapon worked without geometry edits, but later Bloodstarved/Tachikaze rigid-mesh fixes were needed. A matching version is not enough to establish compatibility.
- Materials: check the referenced material names exist in the PS4
  `allmaterial.matbinbnd.dcx`.
- TPF textures: must be converted (see `formats.md`). Validate the converter by
  exact roundtrip on PS4 original textures of each BC format before using it.
- Nested HKX: convert like step 6 and check bindings against the weapon skeleton,
  not the player's.
- Repack, KRAK level 7, decompress again and compare.

Result on console for the initial weapon: visible and usable (user report "works!"). Not yet
checked: every attack, effect, area and long sessions.

## 9. Not verified yet

- Weapons with cloth (`hcl*` Havok Cloth classes).
- Full correctness of effects, menu textures, player mesh/physics and message files. These were converted/deployed in later batches; deployment does not validate every resource.
- [Unverified] Discord report: Havok Content Tools 2018 "Standalone Filter Manager"
  with "Write to Platform → PlayStation" converts HKX; this was not tested.
- [Inference] Very large textures (one was 2048×8192) may exceed memory on a base PS4.
- The examined 60 FPS patch listing did not match the tested application version. Do not apply a patch to a different version or treat that historical listing as a claim about all current patches.

## 10. Rollout

One batch at a time, smallest risk first (weapons with no warnings, then inferred
layouts, then cloth, then effects, menu, text, player chrbnd). Close the game before
replacing files. For each batch record: files, hashes, user's "yes", the test done
and the result, including the exact action that caused any crash.

## Current gameplay limits

The [end-to-end Apollo guide](APOLLO-END-TO-END.md) records the current save procedure and test results. Lightblades and Tachikaze R2 were reported working after later TAE recovery. Marais follow-ups remain unresolved despite sufficient FP. Moonveil's original-model fallback remains untested. The included historical conversion scripts do not automatically apply those later recovery/mesh fixes.

---
Source: pc-to-console-mod-port/SKILL.md

---
name: pc-to-console-mod-port
description: Guide an AI assistant through porting a data-only PC game mod to a console that already runs homebrew with file redirection, with Elden Ring-specific example scripts, using REA where appropriate to analyse binaries and cross the mod's files with the console game's own metadata, with verified and unverified steps kept apart.
license: CC-BY-4.0
metadata:
  status: draft
  last-updated: "2026-10-18"
  worked-example: "examples/elden-ring-ps4 (Elden Ring PC mod → PS4, partly verified on console)"
---

# Investigating PC-to-console ports of data-only mods

This skill is a **method**, not a recipe for one game. It was distilled from one real
port (Elden Ring PC → PS4, see `../examples/elden-ring-ps4/`). Use that example to see
the method applied; do not assume its formats, paths or results apply to another game.

Read first: `references/safety-and-licensing.md`. Then `references/methodology.md`.

## What you need

| Need | Why |
|---|---|
| Format readers; REA when needed | Use validated readers for game data. REA can inspect executables and libraries when format rules require binary analysis. See `references/rea.md`. |
| The mod's files and their hashes | Source of the changes. |
| The console's original files for the **same game version** | Target layout ("metadata" of the console build). Dumped by the person from their own console. |
| A homebrew environment with **file redirection** already working | To load replaced files without modifying the game install. Prerequisite; this skill does not cover installing it. |
| A file transfer route (usually FTP) | See `references/file-transfer.md`. |
| Ideally the vanilla PC files of the mod's game version | To compute what the mod changed (deltas). |
| Node.js or another scripting runtime | To write converters and verifiers. |

## The core idea

```
mod binary (PC)  ──analyse──►  structure of each file  ─┐
                                                         ├──► cross ──► convert ──► verify ──► test on console
console original ──analyse──►  console metadata/layout  ─┘
          ▲                         ▲
          └──── format readers ────┘  (REA can inspect libraries / executables when a
                                        format rule requires binary-code analysis)
```

1. Analyse the mod's binary files: containers, compression, encryption, version
   fields, internal type metadata.
2. Analyse the console's originals of the same files the same way.
3. Cross them: what is identical, what differs only in wrapper (compression,
   platform byte), what differs in internal layout (field offsets, sizes,
   alignment, pixel order, compiled vs text).
4. Decide per file: **copy as-is**, **convert**, or **not portable**.
5. Convert using the console original as the layout source, never by guessing.
6. Verify locally (reverse conversion, graph comparison, re-read), then test on the
   console in small batches.

Use validated format readers for game-data inspection. REA can supplement steps 1–3 when a rule depends on executable or library behavior. Record evidence from either route; static analysis does not prove runtime behavior.

## Hard limits (never break these)

1. **No redistribution** of game files, mod files or converted files. Share only your
   own scripts and documentation.
2. **No exploits, payloads or unofficial firmware**, and no links to them. The homebrew
   environment is a prerequisite the person sets up beforehand.
3. **Mod author's permission** before modifying their files.
4. **Explicit "yes" from the person before every write to the console**, per batch.
5. **Choose and document the save route.** Prefer a separate account/save for initial experiments. An existing-save operation requires explicit authorization, verified encrypted/decrypted backups, a locally checked candidate and a rollback procedure. Importing with Apollo changes the live save; preserving character bytes during candidate generation does not guarantee every later gameplay result.
6. **No third-party binary is run** without the person's approval (name, source,
   SHA256). Prefer static analysis with REA over running a DLL "to see".

## Evidence discipline

- Label every unchecked claim: `[Inference]`, `[Speculation]`, `[Unverified]`. If you
  cannot check something, say "I cannot verify this".
- Identify files by SHA256 and size, never by version label alone.
- "It boots" proves only that it boots. Design a test only the modded file can pass.
- Keep originals untouched; keep the previous console file renamed so it can be undone.
- One batch at a time so a crash points to a file.

## When to stop

- File redirection or the active data source cannot be established after checking the chosen save route. Some mods also require coordinated files rather than a single-file proof.
- The mod contains native code (DLL/EXE/plugins) that the console cannot run.
- The person's console game version differs from the mod's and no matching base
  files are available.
- The mod author refuses permission.


For the complete Elden Ring connection-to-save workflow, read ../examples/elden-ring-ps4/APOLLO-END-TO-END.md. Included conversion scripts are specific to Elden Ring; other games need format research and new tooling.

---
Source: pc-to-console-mod-port/references/file-transfer.md

# File transfer and redirection (generic)

Prerequisite: the console already runs a homebrew environment. Guide the person one step
at a time and wait after each step.

## Typical route: FTP over the home network

1. PC and console on the same network. Not signed in to the online service.
2. Find the console's local IP address in its network settings.
3. Enable the homebrew environment's FTP server; note IP and port.
4. Test read-only from the PC, for example with curl:
   `curl --max-time 30 "ftp://IP:PORT/"`
5. Download: `curl --max-time 600 -o local "ftp://IP:PORT/path"`
6. Upload (only after "yes"): `curl --max-time 900 -T local "ftp://IP:PORT/path"`
   (`--ftp-create-dirs` for new folders, `-C -` to resume).
7. After every upload, download it back and compare SHA256.

Big files can be slow; allow generous timeouts. Rest mode usually drops the connection.

## File redirection

Prefer a mechanism that serves replacement files from a separate folder (so the game
install stays untouched and changes can be undone by renaming). Before editing any
loader configuration file, download the current one and add to it, never overwrite it.

## Worked example

PS4 with GoldHEN (FTP on port 2121) and the AFR plugin:
`../../examples/elden-ring-ps4/ftp-and-afr.md`.

---
Source: pc-to-console-mod-port/references/methodology.md

# Methodology

An investigation workflow that may guide other games; the supplied converters are Elden Ring-specific. Each phase ends with a gate. Lessons in boxes come from the Elden Ring
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

Use validated archive/format readers to inventory files and verify integrity. Use REA for executable or library inspection when needed; record the evidence for each finding.

## Phase 2. Get the console's originals

- Dump, from the person's own console, the originals of every file the mod replaces,
  for the **exact** console game version. Re-dump after any game update.
- Some consoles only expose decrypted game files while the game runs; read from the
  mounted paths the homebrew environment offers.

> Elden Ring/PS4 (verified): originals were readable while the game ran, from the real
> patch/app mounts; a "union" view listed files but failed to deliver some.

## Phase 3. Analyse and cross (the core)

For each file type, compare mod (PC) against console original:

| Layer | Question | Typical outcome |
|---|---|---|
| Container | Same archive format? Same member names, IDs, order, hash tables? | Usually same; repack must stay coherent |
| Compression | Same algorithm and level? | May differ; some need a proprietary library |
| Encryption / signature | Same key? Is the file signed or checksummed? | Repacking may break it |
| Version | Does the declared data version match the console game? | Compare schemas and content; a different version label alone does not establish incompatibility |
| Byte order / pointer size | Little/big endian, 32/64-bit? | Must match target |
| Internal layout | Same structure sizes, field offsets, alignment? | **Same SDK version does not imply same layout** |
| Platform encoding | Textures (swizzle/tiling, header), audio, shaders | Usually platform-specific |
| Scripts | Text vs compiled bytecode on console? | Console may accept text, or not |

How to cross:
- Use the console original as the source of truth for layout (its own type metadata,
  table definitions, headers).
- Match types/records by identity (name plus field list), not by position.
- Where a format rule exists only inside a binary (a serializer library, a loader, the
  game executable), use **REA** to inspect it statically and cite the evidence.
- Read open-source format libraries for the game family, if any exist, as references.
- Use version-aware definitions and bounded readers. Compare the previous mod release, current source and converted output separately: source regressions are not conversion defects.

Outcome per file: **as-is**, **wrapper-only change** (recompress/repack), **layout
conversion**, or **not portable**.

> Elden Ring/PS4 (verified): Havok files had the same SDK and pointer size on both
> platforms but nine class layouts differed, so raw copies crashed. REA's static
> inspection of the Havok serializer library showed that it writes fields from a type
> registry (offset, size, alignment), which is the basis of the converter. Textures
> needed a different header and swizzled block order. Plain-text scripts were accepted.

## Phase 4. Cheapest proof first

Where a compatible standalone file exists, load it untouched through redirection and check a mod-only change. Otherwise document the coordinated files needed for a meaningful test. For Elden Ring, identify the active regulation and choose a test-save or authorized Apollo route before diagnosing a failed load.

> Elden Ring/PS4: an untouched mod regulation loaded with a fresh test save. Later, an existing save was preserved through Apollo by replacing only its embedded regulation. Importing the candidate changes the live save; verified encrypted and decrypted backups are required. Earlier external repacks failed, but their cause remains unresolved. Deleting saves is not required. See the end-to-end Apollo guide in the worked example.

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

---
Source: pc-to-console-mod-port/references/rea.md

# REA (Reverse Engineer Anything)

REA is a CLI and MCP server for AI agents that analyses binaries and packages
statically and returns evidence for each finding. In the worked example it was
used for static inspection of a Havok serializer library. Most game-data inspection used custom readers informed by community source code.

- npm package: `rea-agents` (version used: 6.5.0), MIT licence.
- Repository: https://github.com/morluto/rea
- It ships its own skill (`reverse-engineer-anything`) with setup and recovery steps.
- Supported clients include Codex, Claude Code, Claude Desktop, Cursor, Gemini CLI,
  VS Code and others (see `doctor --client`).

## Installing (ask the person first)

```
npx -y rea-agents@6.5.0 doctor --client <client> --json
npx -y rea-agents@6.5.0 setup --client <client> --dry-run --json
```

Show the person the exact changes from the dry-run. Only after their "yes":

```
npx -y rea-agents@6.5.0 setup --client <client> --yes
```

Restart the AI client and check the REA tools appear. Requires Node.js. REA does not
install Ghidra, Hopper, IDA or other engines; install those only if a task needs them
and the person approves.

## Where REA intervenes in the method

| Phase | Use |
|---|---|
| 1. Inventory | Verify the mod archive and its file list; identify unknown containers and magic bytes. |
| 3. Analyse the mod's binaries | Read headers, version fields, type metadata inside each file. |
| 3. Analyse the console originals | Same, on the console build, to get the target layout ("metadata"). |
| 3. Cross | Compare both; when a rule is only defined in code, inspect the library or tool that reads/writes the format (statically, without running it). |
| 3. Loader behaviour (if needed) | Inspect the game executable or the redirection plugin to learn how files are opened or validated. |
| 8. Record | Keep REA's evidence references next to each conclusion. |

## Rules

- Use static analysis for investigations. A deliberately selected runtime dependency such as Oodle may be loaded only after source/hash checks and user authorization; that is separate from REA inspection.
- REA shows what a binary contains. It does not prove the console will accept a converted
  file; only a console test proves that.
- [Unverified] The tool list depends on the installed REA version; use the tools the
  connected server actually offers.

## Example (Elden Ring → PS4, verified in the project records)

- Archive inventory and integrity were checked with local readers. REA was used for the serializer inspection below; do not attribute every format check to REA.
- Inspected the Havok serializer library (`Havok.HKLib.Serialization.dll`) statically:
  it writes TAG0/TYPE/ITEM/PTCH and lays out fields from a type registry (offset, size,
  alignment). That explained why raw PC files crash on PS4 and shaped the converter in
  `../../examples/elden-ring-ps4/tools/`.

---
Source: pc-to-console-mod-port/references/safety-and-licensing.md

# Safety, licensing and scope

## Licensing

- Game files belong to the publisher. Never redistribute them, including files dumped
  from the user's own console.
- Mod files belong to their author. Read the mod page's permissions section. In the worked
  example, the mod (Clever's Moveset Modpack) requires the author's
  permission to modify files and forbids redistribution. A converted file is still a
  modified copy of the author's work: do not share it.
- Proprietary compression libraries (in the example, the Oodle DLL for KRAK `.dcx`
  files) must not be shared. The user must obtain them from a legitimate copy they own. Record
  the SHA256 of the DLL the user approved and check it before every load.
- What can be shared: your own scripts, your own documentation, hashes, file sizes,
  and descriptions of formats.

## Console safety

- This skill assumes the console **already** runs a homebrew environment that loads
  plugins and redirects files (in the example: GoldHEN with the AFR plugin on PS4). It
  does not explain how to obtain one. Do not link exploit hosts, payloads or firmware.
- Firmware files must come from the official source. The original project installed a
  firmware update from an unofficial mirror; its authenticity was never verified.
  Do not repeat that.
- Do not update the system software unless the user decides to and has checked that
  their homebrew environment supports the target version.
- Turn off automatic downloads. In the worked example the game auto-updated from
  01.23 to 01.25 when Wi-Fi was enabled, and 01.25 then required newer system
  software (SYSTEM_VER 0x13520000 in its `param.sfo`), so the game stopped launching
  until the console was updated.
- [Inference] Playing online with modified files can lead to account penalties. Keep
  the game offline while modded files are active.
- Prefer a secondary account/save for initial tests. Elden Ring PS4 also has an existing-save Apollo procedure: export, preserve verified encrypted and decrypted backups, build and verify a local candidate, then explicitly authorize its import. Importing changes the live save. Deleting saves is not required. A rollback restores the backup state and can discard later progress.

## Third-party tools

Ask the user before installing or running any third-party binary. In the original
project the only third-party PC format-processing binary approved to load was the Oodle DLL, solely to compress and decompress game containers. Apollo was separately used on the console for save export/import; Node.js and PowerShell ran the local scripts. Other tools (HKLib, DrSwizzler, Havok Content Tools) were
studied from source or statically, not run. Tools that are documentation-only for you
(for example WitchyBND or Smithbox/SoulsFormatsNEXT source) can be read to learn the
formats.
