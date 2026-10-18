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
