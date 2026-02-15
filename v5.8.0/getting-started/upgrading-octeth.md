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

### Download the New Version

1. Log in to [Octeth Client Area](https://my.octeth.com/)
2. Download the latest release zip file (e.g., `oempro-rel-v5.8.0.zip`)
3. Upload it to your server:

```bash
scp oempro-rel-v5.8.0.zip root@your-server:/opt/
```

### Check Your Current Version

Verify what version you're currently running:

```bash
cat /opt/octeth/.oempro_env | grep PRODUCT_VERSION
```

## Running the Upgrade

The upgrade command takes a path to the release zip file:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v5.8.0.zip
```

The command will display the upgrade plan and ask for confirmation before proceeding:

```text
  Upgrade Summary:
    Version:  v5.7.3 → v5.8.0
    Zip:      oempro-rel-v5.8.0.zip
    Backup:   Yes (env + database)

  ▸ Proceed with upgrade? (y/N):
```

Type `y` and press Enter to start the upgrade.

::: tip
If you have campaigns actively sending, the upgrade command will warn you and ask for confirmation before stopping backend services.
:::

## What the Upgrade Command Does

Once confirmed, the upgrade runs through these steps automatically:

1. **Stops backend services** — Pauses all background workers, supervisor processes, and cron jobs so no tasks run during the upgrade.

2. **Creates a backup** — Saves all your environment files (`.oempro_*_env`), Docker Compose configuration, and a full MySQL database dump to `data/backups/upgrade_[timestamp]/`.

3. **Extracts and syncs release files** — Unpacks the zip file and syncs new application files into your installation. Your configuration files, data directory, plugins, and Docker volumes are preserved.

4. **Merges environment files** — Compares your current environment files against the new version's defaults. Any new configuration keys introduced in the new version are added to your files with their default values. Your existing settings are never overwritten.

5. **Updates Docker configuration** — Updates Docker image tags to match the new version and pulls the latest container images.

6. **Restarts containers** — Brings containers down and back up with the new images and code.

7. **Installs dependencies** — Waits for Composer to install PHP dependencies in both the app and system containers.

8. **Runs database migrations** — Applies database schema changes for both the legacy (PHP 5.6) and Laravel (PHP 8.1) codebases.

9. **Builds JavaScript assets** — Compiles the Journey Builder and Website Event Tracker from source.

10. **Starts backend services and runs a health check** — Restarts all background workers and verifies the system is operational.

When finished, you'll see a summary:

```text
  ═══════════════════════════════════════════════════════
    Upgrade Complete!
  ═══════════════════════════════════════════════════════

  Version:     v5.7.3 → v5.8.0
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
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v5.8.0.zip --dry-run
```

This shows the full upgrade plan including which new environment keys would be added. Use this to review the upgrade before committing.

### Skip Backup

If you already have a recent backup (for example, from the [Backup Add-On](./backup-addon-setup)), you can skip the built-in backup step:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v5.8.0.zip --skip-backup
```

::: warning
Skipping the backup means the upgrade cannot automatically roll back if something goes wrong. Only use this if you have a verified recent backup.
:::

### Debug Mode

Enable verbose output to see exactly what each step is doing:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v5.8.0.zip --debug
```

This is helpful when troubleshooting a failed upgrade or when sharing details with support.

### Force Mode

Allow a same-version reinstall or downgrade:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v5.8.0.zip --force
```

By default, the command prevents downgrading or reinstalling the same version. Use `--force` to override this check.

::: danger
Downgrading is not recommended and may cause database incompatibilities. Only use `--force` for downgrades if instructed by Octeth support.
:::

### Combining Options

Options can be combined as needed:

```bash
/opt/octeth/cli/octeth.sh upgrade /opt/oempro-rel-v5.8.0.zip --skip-backup --debug
```

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

**Review release notes.** Each version may introduce breaking changes or new configuration requirements. Read the changelog before upgrading.

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
