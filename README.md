# PC mod → console port: skill and guides 

Draft release, 2026-10-17. Distributed by Alex.

A game-agnostic method, for AI assistants and people, to port data-only PC mods to a
console that already runs homebrew. Proven once: Elden Ring → PS4 (worked example
included).

## How to use it with any AI

1. Unzip the package.
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

No game files, no mod files, no converted files, no proprietary DLLs, no exploits,
payloads or firmware, and no links to them.

## Credits

- REA (Reverse Engineer Anything), https://github.com/morluto/rea, MIT.
- Worked example tested with Clever's Moveset Modpack (Nexus Mods 1928); None of the mod's files are included.

## Licence

- Documentation: CC-BY-4.0.
- Scripts (`examples/elden-ring-ps4/tools/`): GPL-3.0, full text in `tools/LICENSE`.
