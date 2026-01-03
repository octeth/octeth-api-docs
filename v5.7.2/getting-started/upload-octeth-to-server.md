---
layout: doc
---

# Upload Octeth To The Server

After setting up your server, you need to transfer the Octeth installation package from your local computer to the server. You can download the latest Octeth package from the [Octeth Client Area](https://my.octeth.com/).

## Download Octeth Package

1. Log in to the [Octeth Client Area](https://my.octeth.com/)
2. Navigate to your active Octeth license
3. Download the latest version (e.g., `oempro-rel-v5.7.2.zip`)
4. Save it to your `~/Downloads/` directory

## Upload to Server

You can use either `rsync` (recommended) or `scp` to transfer the file to your server.

### Option 1: Using rsync (Recommended)

The `rsync` command provides progress indication and resume capability:

```bash
rsync -avz --progress -e "ssh -p 22" ~/Downloads/oempro-rel-v5.7.2.zip root@203.0.113.10:/opt/
```

**Parameters explained:**
- `-a`: Archive mode (preserves permissions, timestamps)
- `-v`: Verbose output
- `-z`: Compress data during transfer
- `--progress`: Show transfer progress
- `-e "ssh -p 22"`: Use SSH on port 22

### Option 2: Using scp

Alternatively, use the simpler `scp` command:

```bash
scp -P 22 ~/Downloads/oempro-rel-v5.7.2.zip root@203.0.113.10:/opt/
```

::: tip File Size
The Octeth package is approximately 200-300 MB. Upload time will depend on your internet connection speed.
:::

## Verify Upload

SSH into your server and verify the file was uploaded successfully:

```bash
ssh root@203.0.113.10 -p 22
ls -lh /opt/oempro-rel-v5.7.2.zip
```

You should see the file size and confirmation that the file exists in `/opt/`.

::: warning Important
Replace `203.0.113.10` with your actual server IP address and `oempro-rel-v5.7.2.zip` with your downloaded version filename.
:::

## Next Steps

Once the file is uploaded, proceed to the [Octeth Installation](./octeth-installation) guide to begin the installation process.
