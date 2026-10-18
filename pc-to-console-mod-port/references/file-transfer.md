# File transfer and redirection (generic)

Prerequisite: the console already runs a homebrew environment. Guide the person one step
at a time and wait after each step.

## Typical route: FTP over the home network

1. PC and console on the same network. Not signed in to the online service.
2. Find the console's local IP address in its network settings.
3. Enable the homebrew environment's FTP server; note IP and port.
4. Test read-only from the PC, for example with curl:
   `curl --max-time 30 "ftp://IP:PORT/"`
5. Download: `curl --max-time 600 -o local "ftp://IP:PORT/path"`
6. Upload (only after "yes"): `curl --max-time 900 -T local "ftp://IP:PORT/path"`
   (`--ftp-create-dirs` for new folders, `-C -` to resume).
7. After every upload, download it back and compare SHA256.

Big files can be slow; allow generous timeouts. Rest mode usually drops the connection.

## File redirection

Prefer a mechanism that serves replacement files from a separate folder (so the game
install stays untouched and changes can be undone by renaming). Before editing any
loader configuration file, download the current one and add to it, never overwrite it.

## Worked example

PS4 with GoldHEN (FTP on port 2121) and the AFR plugin:
`../../examples/elden-ring-ps4/ftp-and-afr.md`.
