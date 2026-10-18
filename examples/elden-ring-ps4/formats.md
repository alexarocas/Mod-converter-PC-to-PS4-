# Format notes (PC vs PS4), as observed

Observed on Elden Ring PC files from one mod and PS4 app 01.25 originals. Treat every
row as true for those files only.

## Containers

- `.dcx`: compressed wrapper. Seen: DFLT, ZSTD (regulation), KRAK (Oodle). PS4
  repacks that loaded were KRAK level 7. [Unverified] whether level 7 is required.
- BND4: archive inside most `.dcx`. When repacking, keep member order, names, IDs,
  flags and the hash table coherent; re-read every member after writing.
- `regulation.bin`: encrypted, DCX/ZSTD → BND4 of PARAM tables. The mod's file
  declared version 11701000 and 194 tables. Do not repack (CE-34878-0).

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
  tested weapon. Material references (`.matxml`, `.mtd`) must exist in the PS4
  material catalogue.

## Reference sources (read, not run)

- SoulsFormatsNEXT source (TPF, Headerizer, DCX, BND4).
- WitchyBND and Smithbox documentation.
- DrSwizzler source (PS4 swizzle/deswizzle).
