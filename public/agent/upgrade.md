# Upgrade Octeth: instructions for an AI coding agent

You are an AI coding agent (Claude Code, Codex, OpenCode or similar) asked to upgrade an existing Octeth installation. Follow these steps in order. Run each command, compare the result with the expected output, and stop when a stop condition below is met. Do not improvise steps that are not here.

Human documentation, if you need background: https://dev.octeth.com/

## Hard rules

1. Never print, echo, log or repeat the license key. Pass it only through the files described below. Never put it on a command line.
2. Never edit `.oempro_env` by hand, never run SQL, and never change Docker or container settings.
3. Never pass `--skip-backup` or `--force` to the upgrade unless the user asked for it in this conversation.
4. Never pass `--yes` past a question the upgrade raises about active campaigns or new settings without the user's answer. Step 5 shows how.
5. When a stop condition is met, stop, tell the user what you found and what they can do, and wait for their answer.

## What you need from the user

- **The server.** Either you are running on it, or the user gives you SSH access. In SSH mode, run every server command below through that SSH connection.
- **The installation directory.** Usually `/opt/octeth`. The commands below use `/opt/octeth`. Replace it if the user's differs.
- **The license key file**, only if the installation has no valid signed key yet or the user wants to replace it. Ask the user to save the one-line key from **Show license key** on the license page at https://my.octeth.com in a file and give you the path. Do not ask them to paste it into this conversation.

## Step 1: Read the installation

```bash
cd /opt/octeth && test -x cli/octeth.sh && echo ok
grep '^PRODUCT_VERSION=' /opt/octeth/.oempro_env
grep -c '^LICENSE_KEY=..*' /opt/octeth/.oempro_env
df -BG --output=avail /opt | tail -1
/opt/octeth/cli/octeth.sh health:check
```

Expected: `ok`, the current version (for example `PRODUCT_VERSION=v6.0.1`), `1` when a license key is set, at least 10 GB free, and a health check where every line is OK.

Stop if:
- `cli/octeth.sh` is missing. This is not an Octeth installation directory. Ask the user where Octeth is installed.
- The health check shows failures. Tell the user which. Upgrading a broken installation makes the failure harder to find. Continue only if the user says so.

## Step 2: Prepare the license key

If the user gave you a key file, copy it to the server with mode 600 without printing it. On the server:

```bash
install -m 600 <path-the-user-gave> /root/octeth-license
```

In SSH mode, from the user's computer:

```bash
ssh root@<host> 'umask 077 && cat > /root/octeth-license' < <local-path-the-user-gave>
```

If the user gave no file, read the key the installation already uses, without printing it:

```bash
(umask 077 && sed -n 's/^LICENSE_KEY=//p' /opt/octeth/.oempro_env | tr -d "\"'" | head -1 > /root/octeth-license)
```

Check its shape, and build the download header:

```bash
grep -c '^[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*$' /root/octeth-license
(umask 077 && printf 'Authorization: Bearer %s\n' "$(cat /root/octeth-license)" > /root/octeth-auth.hdr)
```

Expected: `1`. If it prints `0`, the installation has no signed key (it was installed before v6.0.1, or the key was never set). Stop and ask the user for the one-line key from **Show license key**.

## Step 3: Find the release

```bash
curl -sS -H @/root/octeth-auth.hdr -H 'Accept: application/json' \
  -o /root/octeth-release.json -w '%{http_code}\n' \
  https://my.octeth.com/api/releases/latest
jq -r '.version, .newest_version, .newest_version_entitled, .sha256, .error // empty' /root/octeth-release.json
```

Expected: HTTP `200`, then the newest version this license may download, the newest version overall, whether the license covers it, and the checksum.

Compare `version` with the installed `PRODUCT_VERSION` (without the `v`):
- Equal: the installation is up to date. If `newest_version_entitled` is `false`, tell the user that `newest_version` exists but needs a license renewal. Stop.
- Lower than installed: stop and tell the user. Octeth does not downgrade.
- Higher: continue. If `newest_version_entitled` is `false`, tell the user that a newer version than the one you will install exists and needs a renewal.

The user may ask for a specific version instead. Then request `https://my.octeth.com/api/releases/<version>` the same way.

On another status, read the `error` field and stop:

| `error` | What to tell the user |
|---|---|
| `key_missing`, `key_invalid` | The key was not accepted. The installation's key may be for another domain, or the domain was removed from the license. Ask for the current one-line key from **Show license key**. |
| `license_inactive` | The license is suspended or archived. Contact Octeth support. |
| `not_entitled` | This license may not download that release. `newest_entitled_version` says what it may download. Renew the license in the client area. |
| `release_not_found` | No such release. Check the version. |
| `rate_limited` | Wait for the number of seconds in the `Retry-After` header, then try once more. |

An HTTP `503` with no `error` means the client area is in maintenance. Wait a few minutes and retry.

Each answer that carries a download link counts as a download in the license's history. Do not repeat requests without a reason.

## Step 4: Download and verify

Download within 10 minutes of the request, because the link expires. The upgrade command needs the file name `oempro-rel-v<version>.zip`.

```bash
VERSION=$(jq -r .version /root/octeth-release.json)
curl -fsS -o "/opt/oempro-rel-v${VERSION}.zip" "$(jq -r .download_url /root/octeth-release.json)"
echo "$(jq -r .sha256 /root/octeth-release.json)  /opt/oempro-rel-v${VERSION}.zip" | sha256sum -c -
```

Expected: `/opt/oempro-rel-v<version>.zip: OK`. Stop if it fails twice. If `sha256` is `null`, tell the user the checksum is not available for this release and ask whether to continue.

Before upgrading, read the release's upgrade notes and tell the user about anything that applies to them: the version's section of https://dev.octeth.com/changelog, and, for v6.0.2 and later, the `behavior-changes` page of that version under https://dev.octeth.com/.

## Step 5: Dry run

```bash
/opt/octeth/cli/octeth.sh upgrade "/opt/oempro-rel-v${VERSION}.zip" --dry-run < /dev/null
echo "exit $?"
```

Expected: `exit 0` and the upgrade plan. Nothing changes in a dry run.

Cover two things with the user before going on:
1. **Active campaigns.** The upgrade stops backend services for some minutes, and sending pauses. When the installed version is v6.0.2 or later, the dry run says how many campaigns are sending. With an older installed version, ask the user whether a campaign is sending now or scheduled in the next hour (the admin area's dashboard shows it). Either way, ask whether to upgrade now or after the campaigns finish.
2. **Settings that change behaviour.** A warning block lists settings the upgrade adds that switch something on, with the value it writes and how to keep each one off. Show the list to the user and ask whether to accept those values. If they want a setting off, stop: they set it in `.oempro_env` themselves, or they tell you exactly which `KEY=false` line to add, and you add only that line.

Stop if the dry run exits with a non-zero code, and show the user the last 40 lines.

## Step 6: Upgrade

Run this only after the user answered both questions from step 5. `--yes` accepts the active-campaign pause and the listed settings, which is why you asked first.

```bash
/opt/octeth/cli/octeth.sh upgrade "/opt/oempro-rel-v${VERSION}.zip" --yes --license-key-file /root/octeth-license < /dev/null
echo "exit $?"
```

Leave out `--license-key-file` when the user is upgrading from v6.0.0 or older: that upgrade command does not know the option. Run it with the key in the environment instead, read from the file so it never appears in the command:

```bash
OCTETH_LICENSE_KEY="$(cat /root/octeth-license)" /opt/octeth/cli/octeth.sh upgrade "/opt/oempro-rel-v${VERSION}.zip" --yes < /dev/null
```

The upgrade takes 5 to 30 minutes and keeps a backup of the env files and the database.

Exit codes:

| Code | Meaning | What to do |
|---|---|---|
| `0` | Upgraded | Go to step 7 |
| `1` | Failed. The upgrade rolls back what it changed | Stop. Show the user the last 60 lines. Do not retry without their answer |
| `3` | It needed a confirmation it could not get | Should not happen with `--yes`. Stop and show the output |
| `130` | Interrupted and rolled back | Stop and tell the user |

## Step 7: Verify

```bash
grep '^PRODUCT_VERSION=' /opt/octeth/.oempro_env
/opt/octeth/cli/octeth.sh health:check
```

Expected: the new version, and every check OK. Stop if a check fails, and show the user the failing lines.

## Step 8: Clean up and report

```bash
rm -f /root/octeth-auth.hdr /root/octeth-release.json /root/octeth-license
```

Tell the user:
1. The old and new versions, and that the health check passed.
2. The upgrade notes from step 4 that apply to them.
3. Where the backup is: the upgrade output names the backup directory under `/opt/octeth/data/backups/`.
4. The release zip `/opt/oempro-rel-v<version>.zip` can be deleted.
5. If the installation runs v6.0.2 or later with an `https://` app URL, they can manage it from Claude or ChatGPT with the connector URL `https://<app-domain>/mcp`. Guide: https://dev.octeth.com/v6.0.2/new-user-interface/ai-assistants
