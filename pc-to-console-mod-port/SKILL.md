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
