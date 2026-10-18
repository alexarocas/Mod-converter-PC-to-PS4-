# Case study: Elden Ring PC mod → PS4

Verified on: PS4 base/Slim, system software 13.52, GoldHEN 2.4b18.x, AFR plugin 1.210,
Elden Ring app 01.25 (game 1.17.1), Clever's Moveset Modpack 26.1. Last updated 2026-10-17.


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
5. **Never touch the user's main save.** Test on a secondary PSN/local account.
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

## Quick status of each asset type (as of 2026-10-17)

| Asset | PC file usable as-is on PS4? | Status |
|---|---|---|
| `regulation.bin` (mod's own, untouched) | Yes | Verified (existing-save Apollo route available; see workflow) |
| `regulation.bin` repacked by us | No, error CE-34878-0 | Tested repacks failed; cause unresolved |
| `action/script/c0000.hks` (plain text) | Yes | Verified boots; not every branch tested |
| `chr/c0000.behbnd.dcx` | No, crashes | Verified: needs Havok layout conversion |
| `chr/c0000*.anibnd.dcx` | No | Verified: converted versions play animations |
| `parts/wp_a_*.partsbnd.dcx` | No | Verified for one weapon after TPF + nested HKX conversion |
| Cloth (`hcl*` classes), SFX, menu TPF, `c0000.chrbnd`, `msgbnd` | Unknown | Not verified |

## When to stop

- The homebrew environment or file redirection cannot be confirmed by a trivial test.
- The untouched regulation of the mod does not load after the save reset.
- The mod author refuses permission.
- The user's game version differs from the mod's target version and no matching
  base files are available for comparison.


## Updated save-preserving procedure (2026-10-18)

Read [APOLLO-END-TO-END.md](APOLLO-END-TO-END.md) for the current procedure. Deleting saves is not required. Earlier repack failures do not prove universal incompatibility. Compare source-version losses separately from conversion errors; Marais combo follow-ups remain unresolved.
