# Quick guide (for people)

**What this is:** a method to play a PC game mod on a console, with an AI helping you
step by step. It was proven once (Elden Ring on PS4). For other games it may work or
not: you and your AI find out by testing.

## What you need

- A console with **homebrew already working** (for PS4, GoldHEN). This package does
  not install it.
- A PC on the same Wi-Fi or router as the console.
- The game on your console, and the PC mod you want (data only: no `.dll` or `.exe`).
- **Permission from the mod's author.**
- An AI assistant that can run tools on your PC, with **REA (Reverse Engineer
  Anything)**. Your AI will help you install it. Plus Node.js.
- A second account or save for testing. Your real save is not touched.
- Patience.

## How it goes

1. **Give this folder to your AI** and write, in your language:
   "Read AI-START-HERE.md and follow it."
2. **The AI asks you questions** about your console, game and mod.
3. **You connect the PC to the console** over Wi-Fi. The AI tells you where to click.
4. **The AI studies the mod's files and your console's files** (with REA) and tells you
   which files can be copied as they are, which must be converted, and which cannot work.
5. **First test:** one mod file copied as it is. If the game does not change, stop.
6. **The AI converts the rest on your PC**, and checks each result before you copy it.
7. **You copy in small groups** and test after each one. The AI always asks first.
8. **If the game crashes**, tell the AI exactly what you were doing. You can undo.

## Important

- Turn off automatic updates. An update can stop the game or the homebrew from working.
- Do not play online with mods.
- Do not share game files or mod files. Everyone converts their own.
- Use at your own risk.

**Elden Ring on PS4?** There is a full worked example in `examples/elden-ring-ps4/`.


For the complete PS4 IP/FTP/Apollo procedure and existing-save preservation, read [the end-to-end guide](examples/elden-ring-ps4/APOLLO-END-TO-END.md).
