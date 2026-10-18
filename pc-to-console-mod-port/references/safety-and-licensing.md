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
- Use a secondary account for tests. The save stores regulation data (see workflow),
  so deleting saves is part of testing.

## Third-party tools

Ask the user before installing or running any third-party binary. In the original
project the only binary approved to run was the Oodle DLL, solely to compress and
decompress game containers. Other tools (HKLib, DrSwizzler, Havok Content Tools) were
studied from source or statically, not run. Tools that are documentation-only for you
(for example WitchyBND or Smithbox/SoulsFormatsNEXT source) can be read to learn the
formats.
