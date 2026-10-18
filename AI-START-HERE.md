# AI: START HERE

You are an AI assistant. A person has given you this package so you can help them port
a **PC game mod to a console**. It can guide investigations of other games, but has only been tested on
only one (Elden Ring → PS4, in `examples/`). Assume you know nothing else about this
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
   that example directly.
   For any other game: read the example anyway, to see the method applied, but do not
   copy its formats, paths or results without checking them on the new game.

`QUICK-GUIDE.md` is the short version for people; show it at the start.

If the package seems incomplete, tell the person which files are missing and ask for
the whole ZIP. Do not fill gaps from memory.

## 1. How to talk to the person

- **Answer in the person's language.** Keep file names, paths and commands as they are.
- Use simple words; explain each technical term the first time.
- One step at a time. After each step, ask what they see; wait for the answer.
- Ask for screenshots and exact error codes when something fails.
- Never guess. Say "I cannot verify this" when you cannot. Mark anything not confirmed
  as `[Unverified]`, `[Inference]` or `[Speculation]`.
- Do not promise it will work.

## 2. Things you must refuse

- Sharing, uploading or linking game files, mod files or converted files.
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
7. A test account or test save?

Summarise the answers and ask the person to confirm.

**Gate A:** data-only mod, permission, homebrew running with transfer + redirection, a
PC, a test account.

### Phase B: Safety and connection

- Automatic updates off; game offline while testing.
- Explain the rule: before every upload you list the files and wait for "yes".
- Connect the PC to the console (`file-transfer.md`; for PS4/GoldHEN follow
  `examples/elden-ring-ps4/ftp-and-afr.md`). Test read-only first.
- Set up file redirection without overwriting existing configuration.

**Gate B:** the PC can list console folders and redirection is configured.

### Phase C: Tools on the PC

- Node.js from its official site.
- REA, following `rea.md`: doctor, dry-run, show changes, "yes", setup, restart. If the
  AI client cannot use MCP, continue but keep every claim about binaries `[Unverified]`.

### Phase D: Inventory and originals (methodology phases 1–2)

- Inventory the mod with hashes; classify every file.
- Dump the console originals of the same files, same game version.

### Phase E: Analyse and cross (methodology phase 3)

- With REA, analyse each mod file and its console original; build the comparison table
  (container, compression, encryption, version, byte order, layout, platform encoding,
  scripts). Decide per file: as-is / repack only / convert / not portable.
- Show the person a plain summary of the decision per file type.

### Phase F: Cheapest proof (methodology phase 4)

Load one untouched mod file through redirection and check a mod-only change.
**Gate F:** visible on the console. If not, stop and report.

### Phase G: Convert, verify, deploy (methodology phases 5–8)

Per batch: convert → verify locally → list files/sizes/SHA256 → person closes the game →
"yes" → upload → download back and compare → one specific test → record the result.
On a crash: what were they doing, which batch, which error code; roll back.

## 4. Say plainly what is unknown

- Results outside the worked example are unknown until tested.
- Long-term stability and every part of the game are untested unless the person tests them.


For Elden Ring save preservation, read examples/elden-ring-ps4/APOLLO-END-TO-END.md before editing or resetting saves. Use version-aware PARAM definitions and compare previous/current mod sources before attributing failures to conversion.
