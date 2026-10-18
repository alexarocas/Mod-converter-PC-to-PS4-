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

- Static analysis only. Do not run third-party DLLs or executables to "see what happens".
- REA shows what a binary contains. It does not prove the console will accept a converted
  file; only a console test proves that.
- [Unverified] The tool list depends on the installed REA version; use the tools the
  connected server actually offers.

## Example (Elden Ring → PS4, verified in the project records)

- Verified the mod ZIP's inventory and integrity, with an evidence record.
- Inspected the Havok serializer library (`Havok.HKLib.Serialization.dll`) statically:
  it writes TAG0/TYPE/ITEM/PTCH and lays out fields from a type registry (offset, size,
  alignment). That explained why raw PC files crash on PS4 and shaped the converter in
  `../../examples/elden-ring-ps4/tools/`.
