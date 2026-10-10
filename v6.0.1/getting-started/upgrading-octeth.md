---
layout: doc
---

# Upgrading Octeth

Octeth provides an automated upgrade command that handles the entire upgrade process for you. It backs up your data, updates application files, merges configuration changes, runs database migrations, and verifies everything is working — all in a single command.

## Before You Begin

### Prerequisites

- Root or sudo access to your Octeth server
- Active Octeth license
- All Docker containers running
- The release zip file uploaded to your server

::: warning Read the Upgrade Notes for your target version first
The [changelog](/changelog) carries an **Upgrade Notes** section for every release. It is the only place that lists settings a release switches on for you, behavior that changes for existing data, and migrations that need scheduling. The upgrade adds any setting your `.oempro_env` does not already have, using the new version's default, so a release can change how your installation behaves without you editing anything.

Upgrade notes for this release are published in the [changelog](/changelog) as the release is cut. Read them before you start: a release can introduce settings whose default changes how your installation behaves.
:::

### Download the New Version

1. Log in to [Octeth Client Area](https://my.octeth.com/)
2. Download the latest release zip file (e.g., `oempro-rel-v6.0.1.zip`)
3. Upload it to your server:

```bash
scp oempro-rel-v6.0.1.zip root@your-server:/opt/
```

### Check Your Current Version

Verify what version you're currently running:

```bash
cat /opt/octeth/.oempro_env | grep PRODUCT_VERSION
```

## Running the Upgrade

The upgrade command takes a path to the release zip file:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip
```

The command will display the upgrade plan and ask for confirmation before proceeding:

```text
  Upgrade Summary:
    Version:  v6.0.0 → v6.0.1
    Zip:      oempro-rel-v6.0.1.zip
    Backup:   Yes (env + database)

  ▸ Proceed with upgrade? (y/N):
```

Type `y` and press Enter to start the upgrade.

::: tip
If you have campaigns actively sending, the upgrade command will warn you and ask for confirmation before stopping backend services.
:::

::: tip The summary appears twice — this is expected (new in v5.9.3)
After you confirm, the command refreshes its own `cli/` scripts from the release you are installing and restarts itself once. That is why the version summary is printed a second time. You are only asked to confirm once.

This guarantees that a years-old installation is still upgraded by the newest, fixed upgrade logic rather than by the scripts that shipped with the version you are leaving. The step is skipped automatically when your `cli/` already matches the release.
:::

## What the Upgrade Command Does

Once confirmed, the upgrade runs through these steps automatically:

1. **Refreshes the upgrade runner** — Before touching anything, the command replaces its own `cli/` scripts with the ones from the release you are installing and re-runs itself once. This means the upgrade is always performed by the newest upgrade logic, even if the copy installed on your server is several versions old. Your previous `cli/` is copied to `data/backups/cli.bak.[version].[timestamp]/` first, so the swap is fully reversible. You will see the pre-flight output twice — that is expected, and you are only asked to confirm once. The step is skipped automatically when your `cli/` already matches the release.

2. **Stops backend services** — Pauses all background workers, supervisor processes, and cron jobs so no tasks run during the upgrade.

3. **Creates a backup** — Saves all your environment files (`.oempro_*_env`), Docker Compose configuration, and a full MySQL database dump to `data/backups/upgrade_[timestamp]/`.

4. **Extracts and syncs release files** — Unpacks the zip file and syncs new application files into your installation. Your configuration files, data directory, plugins, and Docker volumes are preserved.

5. **Merges environment files** — Compares your current environment files against the new version's defaults. Any new configuration keys introduced in the new version are added to your files with their default values. Your existing settings are never overwritten.

6. **Updates the Octeth image tag**: Moves every `image: octeth/oempro:<tag>` line in your `docker-compose.yml` (and `docker-compose.mta.yml` if you have one) to the tag the release's own `docker-compose.yml` carries, and pulls that image. The tag only changes in a release that rebuilds the image, so most upgrades leave it as it is and pull nothing. Comments, other images and the rest of your file are not changed.

7. **Rebuilds local images and restarts containers**: Rebuilds the container images that Octeth builds on your server rather than downloading (the new user interface, HAProxy, the link proxy, RabbitMQ, Redis, Mailpit and the inbound SMTP server), so their startup scripts match the release. The build runs while the old containers are still serving. Containers are then brought down and back up with the new images and code. If a rebuild fails, the upgrade continues on the existing images and tells you how to retry (see [Image Rebuild Fails](#image-rebuild-fails)).

8. **Installs dependencies** — Waits for Composer to install PHP dependencies in both the app and system containers.

9. **Runs database migrations** — Applies database schema changes for both the legacy (PHP 5.6) and Laravel (PHP 8.1) codebases.

10. **Builds JavaScript assets** — Compiles the Journey Builder and Website Event Tracker from source.

11. **Starts backend services and runs a health check** — Restarts all background workers and verifies the system is operational.

When finished, you'll see a summary:

```text
  ═══════════════════════════════════════════════════════
    Upgrade Complete!
  ═══════════════════════════════════════════════════════

  Version:     v6.0.0 → v6.0.1
  Backup:      data/backups/upgrade_20260215_143022/
  New env keys:
    + .oempro_env: CADDY_DOMAIN_VERIFY_CODE
    + .oempro_env: CADDY_ACME_EMAIL

  Log: data/logs/upgrade_20260215_143022.log

  Upgrade completed in 4m 32s
```

## Command Options

The upgrade command supports several options:

### Preview with Dry Run

See what the upgrade would do without making any changes:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip --dry-run
```

This shows the full upgrade plan including which new environment keys would be added. Use this to review the upgrade before committing.

The plan also shows the image tag step, for example `octeth/oempro: v5.7.4 -> v6.0.1`, or `already on v6.0.1, unchanged`.

### Skip Backup

If you already have a recent backup (for example, from the [Backup Add-On](./backup-addon-setup)), you can skip the built-in backup step:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip --skip-backup
```

::: warning
Skipping the backup means the upgrade cannot automatically roll back if something goes wrong. Only use this if you have a verified recent backup.
:::

### Debug Mode

Enable verbose output to see exactly what each step is doing:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip --debug
```

This is helpful when troubleshooting a failed upgrade or when sharing details with support.

### Force Mode

Allow a same-version reinstall or downgrade:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip --force
```

By default, the command prevents downgrading or reinstalling the same version. Use `--force` to override this check.

::: danger
Downgrading is not recommended and may cause database incompatibilities. Only use `--force` for downgrades if instructed by Octeth support.
:::

### Change the License Key

Pass a new license key to write it to `LICENSE_KEY` in `.oempro_env` as part of the upgrade:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip --license-key YOUR-LICENSE-KEY
```

`--license-key-file <path>` reads the key from a file instead, and the `OCTETH_LICENSE_KEY` environment variable works too. If you give more than one, `--license-key` wins over the file, and the file wins over the environment variable. The key is written after the environment files are merged, it is never printed or logged, and a rollback restores the previous key. Without any of these options the key is left unchanged. Reading the key from standard input (`--license-key-file -`) is not supported during an upgrade.

When you upgrade from a version older than v6.0.1, use `OCTETH_LICENSE_KEY`. The older upgrade command rejects the new options before it refreshes itself from the new release.

```bash
OCTETH_LICENSE_KEY=YOUR-LICENSE-KEY /opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip
```

### Install a License File

Pass the signed license file from my.octeth.com to install it as part of the upgrade:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip --license-file /root/octeth.license
```

`OCTETH_LICENSE_FILE=<path>` works too. The file is verified with the new release's verifier before anything is stopped, so an invalid file stops the upgrade with the reason and changes nothing. It is installed at `data/octeth.license` (or `LICENSE_FILE`) after the environment files are merged. When upgrading from a version older than v6.0.1, use `OCTETH_LICENSE_FILE`, because the older upgrade command rejects the new option before it refreshes itself. If `LICENSE_FILE` points outside the installation, copy the file there yourself.

### Combining Options

Options can be combined as needed:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v6.0.1.zip --skip-backup --debug
```

### Exit Codes

Scripts and automation can rely on these exit codes:

| Code | Meaning |
|---|---|
| `0` | The upgrade finished, the dry run finished, or the upgrade was cancelled by answering `n` at a prompt |
| `1` | The upgrade failed (validation, pre-flight checks or a later step) |
| `3` | The upgrade stopped before Phase 2 because it ran without `--yes` and could not ask for confirmation: input ended at a prompt, or it would add settings that change how the installation behaves while input is not a terminal. No service was stopped and no application or env file was written, though the upgrade runner in `cli/` may already have been refreshed (backup in `data/backups/cli.bak.*`). Re-run with `--yes`, or add the listed settings to your env file first. See [The upgrade asks before turning on new settings](#the-upgrade-asks-before-turning-on-new-settings) |
| `130` | The upgrade was interrupted (Ctrl+C), or the confirmation for new settings (asked later, at a terminal) got no answer, and it rolled back |

## Pre-Flight Checks

Before starting the upgrade, the command automatically verifies:

- **Required tools** are installed (`unzip`, `rsync`, `docker`)
- **Docker is running** and accessible
- **Essential containers** are up (`oempro_app`, `oempro_mysql`, `oempro_supervisor`, `oempro_system`)
- **Version compatibility** — confirms the target version is newer than the current version
- **Disk space** — ensures there is enough free space for extraction and backup (roughly 3x the zip file size)

If any check fails, the command stops and tells you what to fix before retrying.

## Automatic Rollback

If the upgrade fails at any point after the backup is created, the command automatically attempts a rollback:

- Restores your environment files (`.oempro_*_env`)
- Restores your Docker Compose configuration
- Restores your Laravel `.env` file
- Restarts containers with the original configuration
- Starts backend services

The database backup is saved but not automatically restored during rollback since database changes are applied in a later phase. If the upgrade failed during or after database migrations, you may need to restore the database manually.

::: info
The backup directory location is displayed in the rollback output. Your database dump is available at `data/backups/upgrade_[timestamp]/database.sql`.
:::

## Notes for This Release

### License files

Octeth now reads the signed license file (`octeth.license`) from my.octeth.com and takes its edition, user account limit and subscriber limit from it. Every upgrade prints the license state before it starts: valid with its limits, no valid file with the reason and the grace days left, or that the Community limits apply. **Install the license file within 30 days of upgrading to keep your plan's limits.** After 30 days without a valid file, the installation runs with the Community limits (one user account and 10,000 subscribers). Sending never stops, but new users and subscribers above those limits are refused. Download the file for your domain from my.octeth.com and install it with `--license-file` (see [Install a License File](#install-a-license-file)) or on the administrator area's Settings > License page. See [Octeth Configuration](./octeth-configuration.md) for the details.

### The email gateway monitor now watches for missing MTA feedback

The upgrade adds five settings to `.oempro_env`: `EG_QUEUE_FEEDBACK_MONITOR_ENABLED=true`, `EG_QUEUE_FEEDBACK_WINDOW_MINUTES=60`, `EG_QUEUE_FEEDBACK_MIN_SENDS=500`, `EG_QUEUE_FEEDBACK_MIN_DELIVERED_RATIO=0.10` and `EG_QUEUE_FEEDBACK_BOUNCE_SILENCE_HOURS=6`. The values match the built-in defaults, so the upgrade does not ask about them.

With them, the Email Gateway Queue Monitor alerts when gateway sends continue but delivered or bounce events from your MTA stop arriving. The check only arms after Octeth has received such an event, so an install whose MTA never reports back does not start alerting after the upgrade. An install that has received delivered or bounce events in the last 31 days, or any bounce on the bounce webhook, is armed on the first monitor run in which gateway sends reach the send floor. If its feedback is already broken at that point, expect an alert (logged, and sent to `EG_QUEUE_MONITOR_WEBHOOK_URL` when set) on that run. That alert is the intended outcome.

To turn the check off, set `EG_QUEUE_FEEDBACK_MONITOR_ENABLED=false` in `.oempro_env`. It is read on every monitor run, so no restart is needed.

### Laravel storage is no longer world-writable

From v6.0.1, the upgrade, `permissions:fix` and a fresh installation no longer set `system/storage` and `system/bootstrap/cache` to mode `0777`. They now set owner `root`, group `www-data`, mode `2775` on directories and `0664` on files. The web server keeps write access through the `www-data` group, and other local accounts on the server can no longer write files that the application executes.

The upgrade applies this automatically. If the upgrade warned that it could not apply file permissions, or you change these permissions by hand later, run this once:

```bash
/opt/octeth/cli/octeth.sh permissions:fix
```

Then confirm that nothing in the two directories is world-writable. Run this from `/opt/octeth`. It prints nothing when the fix is in place:

```bash
find system/storage system/bootstrap/cache -perm -o+w
```

The `data/` directories are unchanged in this release and stay at `0777`.

### The drag-and-drop builder in the new interface uses the integration settings

The new user interface no longer reads `UI_STRIPO_PLUGIN_ID` and `UI_STRIPO_SECRET_KEY` from `.oempro_env`. It uses the Stripo Plugin ID and Secret Key saved in **Admin > Settings > Integrations**, the same credentials the legacy interface uses. See [Stripo.email](/v6.0.1/getting-started/octeth-configuration#stripo-email).

**Action required** only if you set `UI_STRIPO_PLUGIN_ID` and `UI_STRIPO_SECRET_KEY` in v6.0.0 and left the Integrations settings empty: enter the same Plugin ID and Secret Key in Admin > Settings > Integrations. Until you do, the new interface shows the drag-and-drop builder as not configured. Custom HTML and Plain text keep working.

The leftover `UI_STRIPO_*` lines in an upgraded `.oempro_env` are ignored and can be deleted. `STRIPO_EMAIL_ID_SALT` is no longer used either.

**Image library.** The new interface now sends Stripo the same `emailId` as the legacy builder, so a user sees the same uploaded images in both interfaces, and `STRIPO_BASE_USERID` applies to both. Images uploaded in the new interface since v6.0.0 were stored under a different `emailId` and no longer appear in that user's image library. Emails and templates that already use them keep rendering, because Stripo stores absolute image URLs in the saved design.

**New API commands.** [`stripo.editor.get` and `stripo.auth`](/v6.0.1/api-reference/emails#get-stripo-editor-settings) (user authentication) were added. Both are additive and return no credential.

### An unparseable `.oempro_env` now stops Octeth

From v6.0.1, Octeth refuses to start when `.oempro_env` exists but cannot be parsed. Web requests show a "Configuration error" page with HTTP `500`, and CLI workers and cron scripts exit at start. The message names the file, line and key, never the value. Before v6.0.1, one malformed line made Octeth discard the whole file and run on built-in defaults (for example `MYSQL_HOST=localhost` and empty password salts) without stopping.

**Action required** only if `.oempro_env` has been edited by hand: before upgrading, check that every line is a comment, blank, or `KEY=VALUE`, and that values containing spaces are wrapped in quotes. After upgrading, you can check the file with:

```bash
/opt/octeth/cli/octeth.sh env:validate .oempro_env
```

The parser check in `env:validate` needs PHP on the host. Without it, the command checks only the `KEY=VALUE` format and says so.

The other five `.oempro_*_env` files do not stop Octeth. An unparseable one is logged and its settings are ignored until the line is fixed, as before. The `OEMPRO_USE_PHPDOTENV` setting has been removed. A leftover line in an upgraded `.oempro_env` is ignored and can be deleted. See [API Behavior Changes in v6.0.1](/v6.0.1/api-reference/behavior-changes#an-unparseable-oempro-env-now-stops-octeth-instead-of-running-on-defaults).

### The upgrade asks before turning on new settings

When the upgrade adds a setting that your `.oempro_env` does not have yet, it writes the value from the shipped example. Seven of those settings switch something on: `ADMIN_API_ENFORCE_PRIVILEGES`, `ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD`, `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED`, `ADMIN_API_ENFORCE_ALLOWED_IP`, `SYSTEM_INTERNAL_SIGNATURE_REQUIRED` and `UI_ENABLED` (new in v5.9.6), and `USER_UPDATE_REQUIRE_CURRENT_PASSWORD` (new in v6.0.0). Each is added as `true`, while its code default is `false`. An installation upgrading straight from a version older than v5.9.6 gets all seven.

From v6.0.1, the upgrade lists any of these it adds in a separate warning block, with the value it writes, what changes and how to keep it off. `--dry-run` shows the same block before anything is written.

In an interactive run without `--yes`, the upgrade then stops at the environment merge step, before any container restarts, and asks:

```text
  ▸ Continue with these values? (y/N):
```

- Type `y` to continue with the values shown.
- Any other answer pauses the upgrade. Edit `.oempro_env`, set any of the listed keys to the value you want, then press Enter to continue with the edited file, or press Ctrl+C to stop and roll back.

Without `--yes`, an upgrade whose input is not a terminal (a scheduled job, a CI pipeline, an AI agent, or a run with input piped in) cannot show you this prompt. If the upgrade would add any of these settings, it stops before Phase 2 and exits with code `3`, even when the earlier prompts were answered (including `yes | ./cli/octeth.sh upgrade ...`). The message lists each setting, the value it would be given and the env file it would be added to.

::: warning Unattended upgrades must pass --yes
A run without `--yes` whose input is not a terminal also exits with code `3` when input ends at a prompt asked before any service is stopped: "Proceed with upgrade?" or the active-campaign check. Nobody can answer, so the run is treated as non-interactive rather than cancelled. An explicit `n` (or an empty answer) still cancels with exit code `0`.

In every exit `3` case, no service is stopped, no application file is synced and no env file or database table is written. If the upgrade had already refreshed its own runner (`cli/`) from the new release, the new-settings message says so and names the backup of the previous `cli/` under `data/backups/cli.bak.<version>.<timestamp>/`. The next run uses the refreshed runner, which is the intended state.

Choose one of the remedies and run the same command again:

- Add `--yes` (alias `--non-interactive`) to accept the prompts and the listed values. `--yes` confirms the upgrade summary, the active-campaign check and the new settings.
- For new settings, add each one you want to keep off to the env file named next to it, as described below.

`--dry-run` in the same situation lists the settings, states that the real run would stop before Phase 2 with exit code `3`, and exits `0`.
:::

To keep a setting off without answering the prompt, add it to `.oempro_env` as `false` before upgrading, for example `ADMIN_API_ENFORCE_ALLOWED_IP=false`. The upgrade never changes a setting that is already there, and a setting you added is not listed. You can also change a value after the upgrade and run `/opt/octeth/cli/octeth.sh docker:up` to recreate the containers.

### Workers and cron stay stopped until the migrations finish

From v6.0.1, the upgrade holds cron and the supervisord workers from the moment it recreates the containers (step 7) until the database migrations are done. Before v6.0.1, the recreated containers started their workers and cron jobs straight away, so new code could run against the old database schema while the migrations were still running.

The hold is the file `data/.upgrade_in_progress`. The upgrade writes it before recreating the containers, and while it exists the containers start without cron and supervisord. The upgrade removes it in step 11, which then starts the workers and cron. A failed upgrade that rolls back, and an upgrade you stop with Ctrl+C, also remove it, so neither leaves the workers stopped. If the upgrade cannot write the file, it does not recreate the containers at all.

If an upgrade is killed outright (for example the server reboots or the process receives `SIGKILL`), the file can remain and the workers and cron stay stopped. `./cli/octeth.sh docker:up` warns when the file exists. If no upgrade is running, remove the file and recreate the containers:

```bash
rm /opt/octeth/data/.upgrade_in_progress
/opt/octeth/cli/octeth.sh docker:up
```

Held containers start their workers and cron within a few seconds of the file being removed, and `docker:up` brings the containers back on their normal startup configuration. An upgrade killed this way stopped part way, so read its log in `data/logs/` before relying on the installation.

### The Octeth containers move to a new image

From v6.0.1, the five Octeth containers (`oempro_system`, `oempro`, `oempro_cron`, `oempro_supervisor` and the send engine, including the send engine in `docker-compose.mta.yml` for a dedicated MTA server) run the image `octeth/oempro:v6.0.1`. Installations until now ran `octeth/oempro:v5.7.4` (or an older tag), whatever version they upgraded to. The new image is built for both amd64 and arm64 servers, and it runs each container's startup script from the installed release, so later changes to those scripts take effect on upgrade without a new image.

The upgrade makes this change for you in step 6 and logs it as `octeth/oempro: v5.7.4 -> v6.0.1`. It reads the tag from the release package rather than from the version number, so an installation that skips v6.0.1 and upgrades straight to a later release still moves to the new image.

The upgrade downloads the new image, so allow for that on a slow connection or a server with little free disk space.

If you edited `docker-compose.yml`:

- Only lines of the form `image: octeth/oempro:<tag>` change. Your resource limits, send engine replicas, volumes and other services are kept.
- If you pinned a different `octeth/oempro` tag on purpose, it is moved to `v6.0.1` too, and the log names the tag it replaced.
- If you set the image in `docker-compose.override.yml`, the upgrade does not edit that file and warns that it decides the tag. Change the tag there to `v6.0.1` yourself.
- If the release's tag cannot be read, or Docker Hub cannot be reached to confirm it, the upgrade keeps your current tag, warns, and continues. Once the server can reach Docker Hub, change the lines to `octeth/oempro:v6.0.1` and run `/opt/octeth/cli/octeth.sh docker:up`.

A failed upgrade restores your original `docker-compose.yml` from the backup it takes in step 3. With `--skip-backup` there is no such copy, so the old tag in the upgrade log is what to change the lines back to.

## Post-Upgrade Verification

After the upgrade completes, verify everything is working:

**Check system health:**

```bash
/opt/octeth/cli/octeth.sh health:check
```

All services should show a green checkmark.

**Verify the new version:**

```bash
cat /opt/octeth/.oempro_env | grep PRODUCT_VERSION
```

**Log in to the admin dashboard** and check that you can access your campaigns, subscribers, and settings.

**Monitor logs** for the first few hours:

```bash
/opt/octeth/cli/octeth.sh logs:tail
```

## Review New Configuration

When the upgrade adds new environment keys, they are set to default values. Review these after upgrading and adjust as needed:

```bash
/opt/octeth/cli/octeth.sh env:search NEW_KEY_NAME
```

The upgrade summary lists all new keys that were added. Check the release notes for details on what each new setting controls.

### Migrating From the Old Configuration System

If you are upgrading from an older Octeth version that used a single `config.inc.php` file (with `define()` statements), use the `config:migrate` command to generate a migration report:

```bash
/opt/octeth/cli/octeth.sh config:migrate /path/to/old/config.inc.php
```

This compares your old configuration against the new modular system and tells you exactly which values to set in `.oempro_env` and which config files to update. See the [Octeth CLI Tool](./octeth-cli-tool#environment-and-configuration) documentation for full details.

## Manual Database Restore

If you need to restore the database from the upgrade backup:

```bash
# Stop backend services
/opt/octeth/cli/octeth.sh backend:stop

# Restore the database
docker exec -i oempro_mysql mysql -uoempro -p oempro < /opt/octeth/data/backups/upgrade_YYYYMMDD_HHMMSS/database.sql

# Restart backend services
/opt/octeth/cli/octeth.sh backend:start
```

Replace `YYYYMMDD_HHMMSS` with the actual timestamp from your backup directory.

## Restoring the Previous CLI

Each upgrade copies your existing `cli/` scripts to `data/backups/cli.bak.[version].[timestamp]/` before refreshing them from the release (step 1 above). To go back to the CLI you had before an upgrade attempt:

```bash
rsync -a --checksum --delete \
  /opt/octeth/data/backups/cli.bak.5.9.3.20260729_101500/ \
  /opt/octeth/cli/
```

Use the timestamped directory printed during the upgrade, or the newest `cli.bak.*` under `data/backups/`.

::: info
Setting `OCTETH_UPGRADE_SELF_UPDATED=1` in the environment makes the upgrade command skip the refresh and run with the CLI currently installed. This is a support and debugging escape hatch only — it is not needed for normal upgrades, and using it re-exposes an old installation to upgrade bugs that are already fixed in the target release.
:::

## Troubleshooting

### Upgrade Fails During Pre-Flight

**Problem:** The command exits before starting the upgrade.

**Solutions:**
1. Read the error message — it tells you exactly what's missing
2. Start any missing containers:
   ```bash
   /opt/octeth/cli/octeth.sh docker:up
   ```
3. Free up disk space if the space check fails
4. Verify the zip filename matches the pattern `oempro-rel-vX.Y.Z.zip`

### Composer Install Times Out

**Problem:** The upgrade hangs at "Waiting for composer install"

**Solutions:**
1. Check container logs for errors:
   ```bash
   docker logs oempro_app
   docker logs oempro_system
   ```
2. Verify the containers have internet access for downloading packages
3. Re-run the upgrade with `--debug` to see detailed output

### Database Migration Fails

**Problem:** Migrations report errors

**Solutions:**
1. Check the upgrade log file (path shown in the output) for the specific error
2. Verify MySQL is running and accessible:
   ```bash
   docker exec oempro_mysql mysqladmin ping -uoempro -p
   ```
3. If needed, restore from the backup and contact support with the error details

### Health Check Fails After Upgrade

**Problem:** Health check returns errors after the upgrade completes

**Solutions:**
1. Wait a few minutes — some services take time to fully start
2. Restart backend processes:
   ```bash
   /opt/octeth/cli/octeth.sh backend:restart
   ```
3. Check individual service status:
   ```bash
   /opt/octeth/cli/octeth.sh docker:status
   /opt/octeth/cli/octeth.sh backend:status
   ```
4. Review logs for specific error messages:
   ```bash
   /opt/octeth/cli/octeth.sh logs:tail
   ```

### Image Pull Fails

**Problem:** The upgrade stops with `Failed to pull Docker images` after `octeth/oempro: v5.7.4 -> v6.0.1`.

The upgrade rolls back and restores your `docker-compose.yml`. The usual cause is a server that cannot reach Docker Hub during the upgrade. Check with `docker pull octeth/oempro:v6.0.1`, then run the upgrade again.

### Image Rebuild Fails

**Problem:** The upgrade warns `Could not rebuild images for: ...` and the summary shows `Images: rebuild failed`

This is non-fatal. The upgrade completed on the images your server already had, which is how upgrades behaved before v6.0.1. The usual causes are a registry that could not be reached while pulling a base image, or a host that does not allow image builds (for example some nested container setups). The upgrade log in `data/logs/` holds the last lines of the build output.

Once the cause is fixed, run the command the warning printed from your installation directory, for example:

```bash
docker compose -f docker-compose.yml --env-file .oempro_env up -d --build oempro_ui haproxy
```

Until it succeeds, changes to those containers' startup scripts in this release do not take effect.

### Journey Builder Build Fails

**Problem:** The upgrade shows a warning about Journey Builder build failure

This is non-fatal. The release zip typically includes pre-built JavaScript assets. If the Journey Builder works in your browser after the upgrade, no action is needed. If it doesn't:

```bash
docker exec oempro_app bash -c "cd /var/www/html/templates/weefive/js/journey_builder && npm install && npm run build"
```

## Upgrade Best Practices

**Always preview first.** Run with `--dry-run` before performing the actual upgrade to see what will change.

**Schedule a maintenance window.** The upgrade stops email delivery while it runs. Plan for 5-15 minutes of downtime depending on your database size and server speed.

**Keep the backup.** The upgrade creates a backup at `data/backups/`. Don't delete it until you've verified the new version is stable.

**Review release notes.** Each version may introduce breaking changes or new configuration requirements. Read the [Upgrade Notes for your target version](/changelog) before upgrading.

**Test on staging first.** If you have a staging environment, upgrade it first to catch any issues before touching production.

## Getting Help

If you encounter issues during the upgrade:

1. **Check the upgrade log** at `data/logs/upgrade_[timestamp].log`
2. **Create a log snapshot:**
   ```bash
   /opt/octeth/cli/octeth.sh logs:snapshot
   ```
3. **Contact support** at support@octeth.com with:
   - Your current and target Octeth versions
   - The upgrade log file
   - Any error messages shown during the upgrade
