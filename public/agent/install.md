# Install Octeth: instructions for an AI coding agent

You are an AI coding agent (Claude Code, Codex, OpenCode or similar) asked to install Octeth, an on-premise email marketing platform, on a Linux server. Follow these steps in order. Run each command, compare the result with the expected output, and stop when a stop condition below is met. Do not improvise steps that are not here.

Human documentation, if you need background: https://dev.octeth.com/

## Hard rules

1. Never print, echo, log or repeat the license key or the admin password, in a command, in your output or in a summary. Pass them only through the files described below. Never put them on a command line.
2. Never edit `.oempro_env` by hand, never run SQL, and never change Docker or container settings unless a step here says so.
3. Never pass `--force` to the installer unless the user asked for it in this conversation.
4. When a stop condition is met, stop, tell the user what you found and what they can do, and wait for their answer.
5. Do not install anything that is not listed here.

## What you need from the user

Ask for these before you start. Ask for all of them in one message.

- **The server.** Either you are running on it, or the user gives you SSH access (`ssh root@<host>`). In SSH mode, run every server command below through that SSH connection.
- **The app domain**, for example `mailer.example.com`. Users and administrators open Octeth here.
- **The license key file.** The user gets the key in the client area at https://my.octeth.com: open the license, add the app domain to it, and press **Show license key** (an Owner, Admin or Technical member of the team can do this). The key is one line. Ask the user to save it in a file and give you the file's path. Do not ask them to paste the key into this conversation. In SSH mode the file is on the user's computer, and step 4 copies it to the server.
- **The administrator's full name, email address and username** (3 to 32 characters, starts with a letter, then letters, digits or underscores).
- **Whether outbound mail goes directly from this server**, or through another relay host. Only needed if step 3 finds port 25 blocked.

You do not need the admin password from the user. Step 4 generates one and stores it in a file on the server.

## Step 1: Check the server

```bash
. /etc/os-release && echo "$ID $VERSION_ID"
nproc
free -g | awk '/^Mem:/ {print $2}'
df -BG --output=avail / | tail -1
id -u
```

Expected: `ubuntu 24.04`, at least 4 CPUs, at least 8 GB of RAM (the `free` figure may show 7), at least 80 GB of free disk, and user id `0`.

Stop if:
- The OS is not Ubuntu 24.04. Other releases and distributions are not supported by these instructions.
- The CPU, RAM or disk figures are below the minimum. Tell the user the numbers and ask whether to continue anyway.
- You are not root and `sudo -n true` fails. Ask the user for root access.

If you are not root but `sudo` works, prefix the commands below with `sudo`.

Check that nothing else uses the web ports:

```bash
ss -ltnp | grep -E ':(80|443|25|587) ' || echo "ports free"
```

Expected: `ports free`. Stop if another program listens on 80, 443, 25 or 587, and tell the user which program it is.

## Step 2: Install Docker and the required packages

Skip this step if both of these succeed:

```bash
systemctl is-active docker
docker info --format 'ServerVersion={{.ServerVersion}}'
```

Otherwise run:

```bash
export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y ca-certificates curl unzip zip jq openssl dnsutils git
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
systemctl is-active docker
docker info --format 'ServerVersion={{.ServerVersion}}'
```

Expected: `active`, then a line such as `ServerVersion=29.8.0`. Never install Ubuntu's `docker.io` package.

Stop if `systemctl is-active docker` prints anything other than `active`. Show the user the last 20 lines of `journalctl -u docker --no-pager`.

## Step 3: Check DNS and mail delivery

Find the server's public IPv4 address and the domain's address:

```bash
SERVER_IP=$(curl -4 -fsS https://api.ipify.org); echo "$SERVER_IP"
dig +short A <app-domain>
dig +short -x "$SERVER_IP"
```

Stop if `dig +short A <app-domain>` does not print the server's IP. Tell the user to create an A record for the app domain pointing at that IP, and wait. Certificates are issued automatically only when the domain points directly at this server. If the user's domain is behind Cloudflare or another CDN, stop and point them to https://dev.octeth.com/v6.0.2/getting-started/ssl-certificates (that setup is manual).

Check outbound port 25:

```bash
timeout 8 bash -c 'exec 3<>/dev/tcp/gmail-smtp-in.l.google.com/25 && head -c 3 <&3' && echo " port 25 open" || echo "port 25 blocked"
```

Expected: `220 port 25 open`.

If it prints `port 25 blocked`: many cloud providers block outbound port 25 on new servers. Stop and tell the user. They can ask their provider to open it, or confirm that they will send through another relay host. Continue only after they answer.

Report, but do not stop on:
- **Reverse DNS.** The `dig -x` result should be a host name, ideally inside the user's domain. If it is empty or a provider default (such as `static.123.45.67.89.clients.your-server.de`), tell the user to set the reverse DNS of the IP at their provider. Mail without matching reverse DNS lands in spam.
- **SPF and DKIM.** These are published after the install, per sending domain. Octeth shows the exact records on its Sender Domains page. Tell the user this is a later step.

## Step 4: Put the secrets on the server

Create the license key file on the server with mode 600.

If you run on the server and the user gave you a path on it, copy it:

```bash
install -m 600 <path-the-user-gave> /root/octeth-license
```

In SSH mode, copy it from the user's computer without printing it:

```bash
ssh root@<host> 'umask 077 && cat > /root/octeth-license' < <local-path-the-user-gave>
```

Check its shape without printing it:

```bash
wc -l < /root/octeth-license
grep -c '^[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$' /root/octeth-license
```

Expected: `1` and `1`. Stop if not, and ask the user to save the one-line key from **Show license key**, not the downloaded file with BEGIN and END lines.

Generate the administrator password and the download header, both without printing anything:

```bash
(umask 077 && openssl rand -base64 18 | tr -d '/+=' > /root/octeth-admin.pw)
(umask 077 && printf 'Authorization: Bearer %s\n' "$(cat /root/octeth-license)" > /root/octeth-auth.hdr)
```

## Step 5: Download the release

Ask the client area for the latest release this license may download:

```bash
curl -sS -H @/root/octeth-auth.hdr -H 'Accept: application/json' \
  -o /root/octeth-release.json -w '%{http_code}\n' \
  https://my.octeth.com/api/releases/latest
jq -r '.version, .edition, .size, .sha256, .error // empty' /root/octeth-release.json
```

Expected: HTTP `200`, then the version, edition, size and checksum.

On another status, read the `error` field and stop:

| `error` | What to tell the user |
|---|---|
| `key_missing`, `key_invalid` | The key was not accepted. Check that it is the one-line key from **Show license key** for this license. |
| `license_inactive` | The license is suspended or archived. Contact Octeth support. |
| `not_entitled` | No release is available to this license. `newest_entitled_version` says what is. Renew the license in the client area. |
| `rate_limited` | Too many requests. Wait for the number of seconds in the `Retry-After` header, then try once more. |

An HTTP `503` with no `error` means the client area is in maintenance. Wait a few minutes and retry.

Download within 10 minutes of that request, because the link expires. Save the file under the name the installer expects, and verify the checksum:

```bash
VERSION=$(jq -r .version /root/octeth-release.json)
curl -fsS -o "/opt/oempro-rel-v${VERSION}.zip" "$(jq -r .download_url /root/octeth-release.json)"
echo "$(jq -r .sha256 /root/octeth-release.json)  /opt/oempro-rel-v${VERSION}.zip" | sha256sum -c -
```

Expected: `/opt/oempro-rel-v<version>.zip: OK`. Stop if the checksum fails. Download again once. If it fails twice, tell the user. If `sha256` is `null`, tell the user the checksum is not available for this release and ask whether to continue.

Each request to `/api/releases/latest` counts as a download in the license's history. Do not repeat it without a reason.

## Step 6: Unpack

```bash
test -e /opt/octeth/cli/octeth.sh && echo "existing installation" || echo "clean"
```

Stop if it prints `existing installation`. Octeth is already installed here: use https://dev.octeth.com/agent/upgrade.md instead, or ask the user what they want.

```bash
mkdir -p /opt/octeth
unzip -q "/opt/oempro-rel-v${VERSION}.zip" -d /opt/octeth
test -x /opt/octeth/cli/octeth.sh || chmod +x /opt/octeth/cli/octeth.sh
ls /opt/octeth/cli/octeth.sh
```

If `cli/octeth.sh` is not there, but `/opt/octeth/oempro-rel-v<version>/cli/octeth.sh` is, move that directory's contents up one level into `/opt/octeth` and check again.

## Step 7: Install

```bash
/opt/octeth/cli/octeth.sh install:start --yes --accept-eula \
  --app-url "https://<app-domain>/" \
  --admin-name "<full name>" \
  --admin-email "<email>" \
  --admin-username "<username>" \
  --admin-password-file /root/octeth-admin.pw \
  --license-key-file /root/octeth-license
echo "exit $?"
```

The install takes 10 to 20 minutes. Expected: `exit 0` and "Installation Successfully Completed".

By running `--accept-eula` you accept the EULA at https://octeth.com/terms on the user's behalf. Tell the user this before you run the command, and confirm they agree.

Stop if the exit code is not `0`. Show the user the last 40 lines of output. Do not retry with `--force`. If the user wants to start over, `install:reset --yes` removes the failed installation, and they must confirm that first.

## Step 8: Verify

```bash
/opt/octeth/cli/octeth.sh health:check
curl -sS -o /dev/null -w '%{http_code}\n' "https://<app-domain>/app/admin/"
```

Expected: every check shows OK, and the URL answers `200` or `302`. The first HTTPS request can take up to a minute while the certificate is issued.

Stop if a check fails. Show the user the failing lines.

## Step 9: Clean up and report

```bash
rm -f /root/octeth-auth.hdr /root/octeth-release.json /root/octeth-license
```

Leave `/root/octeth-admin.pw` in place and tell the user where it is. Do not show its content.

Tell the user, in this order:
1. Octeth is installed at `https://<app-domain>/`. The admin area is `https://<app-domain>/app/admin/`, with username `<username>`. The password is in `/root/octeth-admin.pw` on the server (readable by root only). They should sign in, change the password, then delete the file.
2. The reverse DNS and port 25 findings from step 3.
3. Next steps: add a delivery server and a sending domain in the admin area, and publish the SPF, DKIM and DMARC records Octeth shows for it.
4. They can manage Octeth from Claude or ChatGPT. Add a custom connector with the URL `https://<app-domain>/mcp` and sign in with their Octeth admin login. Guide: https://dev.octeth.com/v6.0.2/new-user-interface/ai-assistants
5. The release zip `/opt/oempro-rel-v<version>.zip` can be deleted.
