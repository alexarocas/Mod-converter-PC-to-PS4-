# Quick guide (for people)

**What this is:** a workflow for investigating and porting data-only PC mods to console, with a partly validated Elden Ring → PS4 case study. Other games need format research and new tools; this is not a universal converter.

## What you need

- A console with **homebrew already working** (for PS4, GoldHEN). This package does
  not install it.
- A PC on the same Wi-Fi or router as the console.
- The game on your console, and the PC mod you want (data only: no `.dll` or `.exe`).
- **Permission from the mod's author.**
- An AI assistant that can run local tools, plus Node.js for the included scripts. REA can help inspect executables and libraries when needed; game-data readers do not require it.
- A save strategy: use a separate test account/save for initial tests, or explicitly choose the existing-save Apollo route for Elden Ring PS4. That route modifies the live save when you import the candidate. Preserve verified encrypted and decrypted backups first; a backup does not eliminate the risk of losing progress.
- Patience.

## How it goes

1. **Give this folder to your AI** and write, in your language:
   "Read AI-START-HERE.md and follow it."
2. **The AI asks you questions** about your console, game and mod.
3. **You connect the PC to the console** over Wi-Fi. The AI tells you where to click.
4. **The AI studies the mod's files and your console's files**, using format readers and REA where appropriate, and tells you
   which files can be copied as they are, which must be converted, and which cannot work.
5. **First test:** use one compatible, untouched mod file if available. Verify redirection and the active data source. For Elden Ring, an existing save can retain regulation data; choose the test-save or Apollo route before concluding that redirection failed.
6. **The AI converts the rest on your PC**, and checks each result before you copy it.
7. **You copy in small groups** and test after each one. The AI always asks first.
8. **If the game crashes**, record the exact action and error. Restore verified asset/save backups as appropriate; restoring an older save discards progress made after that backup.

## Important

- Turn off automatic updates. An update can stop the game or the homebrew from working.
- Do not play online with mods.
- Do not share game files or mod files. Everyone converts their own.
- Use at your own risk.

**Elden Ring on PS4?** There is a worked example with explicit validation limits in `examples/elden-ring-ps4/`.


For the complete PS4 IP/FTP/Apollo procedure and existing-save preservation, read [the end-to-end guide](examples/elden-ring-ps4/APOLLO-END-TO-END.md).
