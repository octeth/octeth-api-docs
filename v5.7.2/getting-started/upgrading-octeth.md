---
layout: doc
---

# Upgrading Octeth

This guide walks you through upgrading your Octeth installation to a newer version while preserving your data and configuration.

## Before You Begin

### Prerequisites

- Root access to your Octeth server
- Active Octeth license
- Recent backup of your database (strongly recommended)
- Maintenance window for potential downtime

### Backup Your Data

::: danger Critical Step
Always create a complete backup before upgrading. Upgrades modify your database schema and may be difficult to reverse.
:::

If you have the [Backup Add-On](./backup-addon-setup) installed, run a manual backup:

```bash
/opt/octeth-backup-tools/bin/octeth-backup.sh
```

Otherwise, create a manual database backup:

```bash
docker exec oempro_mysql mysqldump -u root -p oempro > octeth-backup-$(date +%Y%m%d).sql
```

### Check Current Version

Verify your current Octeth version:

```bash
cat /opt/octeth/.oempro_env | grep PRODUCT_VERSION
```

### Download New Version

1. Log in to [Octeth Client Area](https://my.octeth.com/)
2. Download the latest version (e.g., `oempro-rel-v5.7.2.zip`)
3. Upload to your server at `/opt/`

## Upgrade Process

### Step 1: Stop Octeth Services

Stop all backend processes and email delivery:

```bash
/opt/octeth/cli/octeth.sh backend:stop
/opt/octeth/cli/octeth.sh sendengine:scale 0
```

Verify all processes are stopped:

```bash
/opt/octeth/cli/octeth.sh backend:status
```

### Step 2: Backup Current Installation

Create a backup of your current Octeth installation directory:

```bash
cp -r /opt/octeth /opt/octeth-backup-$(date +%Y%m%d)
```

### Step 3: Extract New Version

Extract the new version to a temporary directory:

```bash
cd /tmp
unzip /opt/oempro-rel-v5.7.2.zip -d /tmp/octeth-upgrade
```

### Step 4: Preserve Configuration Files

Your configuration and data must be preserved. The following files/directories should NOT be overwritten:

**Critical Files to Preserve:**
- `/opt/octeth/.oempro_*_env` - All environment files
- `/opt/octeth/data/license.dat` - License file
- `/opt/octeth/system/.env` - Laravel environment
- `/opt/octeth/config/` - Custom configuration (if modified)
- `/opt/octeth/_dockerfiles/mysql/` - MySQL data
- `/opt/octeth/storage/` - Uploaded files and attachments

### Step 5: Update Application Files

Copy new files while preserving your configuration:

```bash
# Copy new application files
rsync -av --exclude='.oempro_*_env' \
          --exclude='data/license.dat' \
          --exclude='system/.env' \
          --exclude='_dockerfiles/mysql/' \
          --exclude='storage/' \
          /tmp/octeth-upgrade/ /opt/octeth/
```

::: warning Double-Check
Verify your environment files are still present after the copy:
```bash
ls -la /opt/octeth/.oempro*_env
cat /opt/octeth/data/license.dat
```
:::

### Step 6: Update Version Number

Update the version number in your environment file:

```bash
vi /opt/octeth/.oempro_env
# Change PRODUCT_VERSION=5.7.2 (or your new version)
```

### Step 7: Run Database Migrations

Apply database schema updates for the new version:

```bash
/opt/octeth/cli/octeth.sh migrate
```

This command will:
- Update database tables
- Add new columns and indexes
- Migrate data to new structures
- Update system configuration

### Step 8: Update Docker Images

Rebuild Docker images with the new code:

```bash
/opt/octeth/cli/octeth.sh docker:down
/opt/octeth/cli/octeth.sh docker:up
```

Wait for all containers to start (this may take 2-3 minutes).

### Step 9: Install Composer Dependencies

Update PHP dependencies:

```bash
/opt/octeth/cli/octeth.sh composer:install
```

### Step 10: Clear Caches

Clear all cached data to ensure new code is loaded:

```bash
docker exec oempro_app php /var/www/html/cli/cache-clear.php
```

### Step 11: Fix Permissions

Ensure correct file permissions:

```bash
/opt/octeth/cli/octeth.sh permissions:fix
```

### Step 12: Start Services

Start backend processes and email delivery:

```bash
/opt/octeth/cli/octeth.sh backend:start
/opt/octeth/cli/octeth.sh sendengine:start
```

### Step 13: Verify Upgrade

Check system health:

```bash
/opt/octeth/cli/octeth.sh health:check
```

All services should show "✓ OK" status.

## Post-Upgrade Verification

### Test Core Functionality

1. **Admin Dashboard**: Log in to verify access
2. **Send Test Campaign**: Create and send a test email
3. **Check Reports**: Verify analytics are tracking
4. **Review Logs**: Check for any errors

```bash
/opt/octeth/cli/octeth.sh logs:tail
```

### Verify Version

Confirm the upgrade was successful:

```bash
# Check environment file
cat /opt/octeth/.oempro_env | grep PRODUCT_VERSION

# Check in Admin Dashboard
# Login > Settings > About > Version
```

### Monitor System

Keep an eye on the system for the first few hours after upgrade:

```bash
# Watch backend processes
/opt/octeth/cli/octeth.sh backend:status

# Monitor send engine
/opt/octeth/cli/octeth.sh sendengine:status

# Check system health
/opt/octeth/cli/octeth.sh health:check
```

## Troubleshooting Upgrades

### Database Migration Fails

**Problem:** Migration command reports errors

**Solution:**
1. Review migration error messages carefully
2. Check database connection:
   ```bash
   docker exec oempro_mysql mysql -u root -p oempro -e "SELECT 1"
   ```
3. Restore from backup if needed
4. Contact support with error details

### Services Won't Start After Upgrade

**Problem:** Backend or send engine fails to start

**Solutions:**
1. Check Docker container status:
   ```bash
   docker ps -a
   ```
2. Review container logs:
   ```bash
   docker logs oempro_app
   ```
3. Restart all containers:
   ```bash
   /opt/octeth/cli/octeth.sh docker:restart
   ```
4. Verify file permissions:
   ```bash
   /opt/octeth/cli/octeth.sh permissions:fix
   ```

### Performance Degraded After Upgrade

**Problem:** System is slower after upgrade

**Solutions:**
1. Clear all caches:
   ```bash
   docker exec oempro_app php /var/www/html/cli/cache-clear.php
   ```
2. Optimize database tables:
   ```bash
   docker exec oempro_mysql mysqlcheck -u root -p oempro --optimize
   ```
3. Restart services:
   ```bash
   /opt/octeth/cli/octeth.sh backend:restart
   ```

## Rolling Back an Upgrade

If you need to rollback to your previous version:

### Step 1: Stop Octeth

```bash
/opt/octeth/cli/octeth.sh backend:stop
/opt/octeth/cli/octeth.sh docker:down
```

### Step 2: Restore Backup

```bash
# Remove new installation
rm -rf /opt/octeth

# Restore backed up version
cp -r /opt/octeth-backup-YYYYMMDD /opt/octeth
```

### Step 3: Restore Database (if needed)

If database was modified:

```bash
# Stop MySQL
docker stop oempro_mysql

# Restore database from backup
docker exec -i oempro_mysql mysql -u root -p oempro < octeth-backup-YYYYMMDD.sql

# Start MySQL
docker start oempro_mysql
```

### Step 4: Restart Services

```bash
/opt/octeth/cli/octeth.sh docker:up
/opt/octeth/cli/octeth.sh backend:start
```

## Upgrade Best Practices

**Test in Staging First**
- Create a staging server with a copy of your production data
- Test the upgrade process on staging before production
- Verify all functionality works as expected

**Schedule Maintenance Windows**
- Upgrade during low-traffic periods
- Allow 1-2 hours for the upgrade process
- Notify users of scheduled maintenance

**Keep Backups**
- Maintain at least 3 backup copies
- Store backups off-server (cloud storage)
- Test backup restoration periodically

**Stay Updated**
- Subscribe to Octeth release announcements
- Review changelog before upgrading
- Plan upgrades within 30 days of new releases

**Document Everything**
- Note any custom configuration changes
- Document third-party integrations
- Keep a log of upgrade steps performed

## Version-Specific Upgrade Notes

### Upgrading to v5.7.x

- New ClickHouse analytics engine requires initial data migration
- RabbitMQ configuration format has changed
- Review new features in [Changelog](../changelog)

### Upgrading from v5.5.x to v5.6.x or Later

- Major database schema changes require extended migration time
- Plan for 15-30 minutes of downtime depending on database size
- Backup is absolutely critical for this major version jump

## Getting Help

If you encounter issues during the upgrade:

1. **Check Logs:**
   ```bash
   /opt/octeth/cli/octeth.sh logs:snapshot
   ```

2. **Consult Documentation:**
   - Review [Troubleshooting Guide](./troubleshooting)
   - Check version-specific notes in changelog

3. **Contact Support:**
   - Email: support@octeth.com
   - Include your Octeth version (before and after)
   - Provide log snapshots
   - Describe upgrade steps completed

::: tip Keep Your License Active
Ensure your Octeth license is active before upgrading. Expired licenses may prevent successful upgrades. Renew at [Octeth Client Area](https://my.octeth.com/).
:::
