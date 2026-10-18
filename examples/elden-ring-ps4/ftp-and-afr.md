# Connecting the PC to the PS4 (FTP) and enabling AFR

Prerequisite: GoldHEN is already running on the console. This package does not cover
how to install or load GoldHEN; the person must do that on their own beforehand.

Guide the person through this one step at a time and wait for their answer after each
step. Steps marked Verified are what worked in the original project. Menu names may
differ slightly between GoldHEN versions [Unverified].

## 1. Same network (Verified)

- The PS4 and the PC must be on the same home network (same router or Wi-Fi).
- Do not sign in to PSN. Keep automatic updates off.

## 2. Find the console's IP address (Verified)

On the PS4: Settings → Network → View Connection Status → "IP Address".
It looks like `192.168.x.x`. It is a local address; it is safe to share with the AI.
[Inference] It can change after a router restart; check it again if the connection fails.

## 3. Turn on the FTP server (Verified)

In the GoldHEN menu: GoldHEN Settings → Server Settings → FTP Server (enable).
A notification usually shows the IP and the port. In the original project the port was
**2121**. If no port is shown, try 2121.

Notes observed:
- If the PS4 goes into rest mode, the FTP connection stops. Keep it awake.
- FTP needs the network on. That is why automatic updates must be off.

## 4. Test the connection from the PC (Verified)

The original project used `curl` from Git Bash on Windows. Any FTP client works; curl
is shown because it is installed with Git for Windows and its output is easy to read.
Replace `IP` with the console's address.

List a folder (read only):

```
curl --max-time 30 "ftp://IP:2121/data/GoldHEN/"
```

If it prints a list of files, the connection works. If it times out: same network?
FTP enabled? correct IP? console awake?

## 5. Download a file (read only, Verified)

```
curl --max-time 600 -o "local-name.ext" "ftp://IP:2121/path/on/console"
```

Game originals are readable while the game is running, under
`/mnt/sandbox/pfsmnt/<TITLE_ID>-patch0/` or `/mnt/sandbox/pfsmnt/<TITLE_ID>-app0/`.

## 6. Upload a file (writes to the console: ask for "yes" first, Verified)

```
curl --max-time 900 -T "local-file" "ftp://IP:2121/data/GoldHEN/AFR/<TITLE_ID>/chr/c0000.behbnd.dcx"
```

- Add `--ftp-create-dirs` when the destination folder does not exist yet.
- Big files are slow (about 148 KB/s observed). If an upload stops halfway, it can be
  resumed with `-C -`, then must be checked as below.
- After every upload: download it back to a different name and compare SHA256
  (`sha256sum` in Git Bash, or `Get-FileHash` in PowerShell). Only a matching hash
  counts as uploaded.

## 7. Install the AFR plugin (Verified with AFR 1.210)

AFR ("Application File Redirector") is a GoldHEN plugin that makes the game read files
from `/data/GoldHEN/AFR/<TITLE_ID>/` instead of its own.

1. The person obtains `afr.prx` from the plugin's official release. Record its SHA256.
2. Upload it to `/data/GoldHEN/plugins/afr.prx`.
3. **Download the existing `/data/GoldHEN/plugins.ini` first, if there is one**, and
   add to it instead of replacing it (other plugins may be listed there).
4. Add a section for the game's title ID with the plugin path. Tested content:

   ```
   [CUSA18723]
   /data/GoldHEN/plugins/afr.prx
   ```

   Use the person's own title ID (shown in the game's folder name under
   `/user/app/` or in the console's game information).
5. Upload the edited `plugins.ini` back to `/data/GoldHEN/plugins.ini`.
6. Create `/data/GoldHEN/AFR/<TITLE_ID>/`.
7. Restart the game. Files placed under that folder, with the same relative path as
   inside the game, now replace the originals.

To undo: rename the replaced file on the console (for example add `.off`) or remove the
section from `plugins.ini`.
