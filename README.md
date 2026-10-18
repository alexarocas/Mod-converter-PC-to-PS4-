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
