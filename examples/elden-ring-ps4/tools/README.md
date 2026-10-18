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

Run every script from the project root (the folder that contains `analysis-26.1/`).

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

Proposed: GPL-3.0. The format knowledge comes partly from reading SoulsFormatsNEXT and
WitchyBND, which are GPL-3.0. Texture swizzling was studied from DrSwizzler, which shows
no licence file on GitHub. `ps4-texture-blocks.cjs` was compared with DrSwizzler's
`PS4Swizzler.cs` on 2026-10-17: same generic technique (Morton order inside 8×8 tiles),
different structure and code. [Inference] It is an independent implementation, not a
port; this is not a legal opinion.

SHA256 of each file: `../tools-sha256.txt`.

## Existing-save regulation candidate

Run build-save-regulation.cjs with SAVE MOD OUTPUT SAVE_SHA256 MOD_SHA256 arguments. It supports only the observed PS4 layout, preserves character/profile bytes and refuses existing output. See [the complete Apollo guide](../APOLLO-END-TO-END.md).
