---
layout: doc
---

# Backup Add-On Setup

Protect your Octeth data with automated backups using the free [Octeth Backup Tool](https://github.com/octeth/octeth-backup-tools). This add-on creates incremental MySQL backups and optionally uploads them to AWS S3 for off-site storage.

## Features

- **Incremental Backups**: Uses Percona XtraBackup for efficient incremental backups
- **AWS S3 Integration**: Optional cloud storage for disaster recovery
- **Automated Schedule**: Cron-based automatic daily backups
- **Compression**: Reduces backup storage requirements

## Installation

### Connect to Your Server

SSH login to the Octeth server:

```bash
ssh root@203.0.113.10 -p 22
```

### Create Tool Directory

Create a directory for the backup tools:

```bash
mkdir -p /opt/octeth-backup-tools
cd /opt/octeth-backup-tools
```

### Clone the Add-On Repository

Download the backup tool from GitHub:

```bash
git clone https://github.com/octeth/octeth-backup-tools.git .
```

### Install AWS CLI (Optional)

If you plan to upload backups to AWS S3, install the AWS CLI:

```bash
# Reference: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
cd /tmp
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install
```

::: info AWS S3 Backups
AWS S3 provides reliable off-site backup storage. You'll need an AWS account and S3 bucket to use this feature.
:::

### Run the Installer

Make the installation script executable and run it:

```bash
cd /opt/octeth-backup-tools
chmod +x install.sh
./install.sh
```

The installer will ask several questions:

**Install Percona XtraBackup? (y/n)**
- Answer: **y** (Yes - required for MySQL backups)

**Install AWS CLI for S3 backups? (optional) (y/n)**
- Answer: **y** if you want cloud backups, **n** to skip

**Setup cron job for automatic backups? (y/n)**
- Answer: **y** (Yes - enables daily automatic backups)

## Configuration

### Set MySQL Credentials

Edit the configuration file and provide your MySQL credentials:

```bash
vi /opt/octeth-backup-tools/config/.env
```

Update these values:

**MYSQL_ROOT_PASSWORD**
Get the value by running:
```bash
cat /opt/octeth/.oempro_mysql_env
```
Copy the `MYSQL_ROOT_PASSWORD` value from the output.

**MYSQL_PASSWORD**
Get the value by running:
```bash
grep 'MYSQL_PASSWORD' /opt/octeth/.oempro_env
```
Copy the `MYSQL_PASSWORD` value from the output.

**MYSQL_DATA_DIR**
Set it to:
```
/opt/octeth/_dockerfiles/mysql/data_v8
```

::: warning Security
The `.env` file contains sensitive credentials. Ensure it has restrictive permissions: `chmod 600 /opt/octeth-backup-tools/config/.env`
:::

## Test the Backup

Run a manual backup to verify everything is configured correctly:

```bash
/opt/octeth-backup-tools/bin/octeth-backup.sh
```

The backup process will:
1. Create an incremental backup of your MySQL database
2. Compress the backup files
3. Store them in `/var/backups/octeth/daily/`
4. (Optional) Upload to AWS S3 if configured

### Verify Backup

Check that the backup was created successfully:

```bash
ls -h /var/backups/octeth/daily/
```

You should see backup files with timestamps indicating successful completion.

## Backup Schedule

The cron job automatically runs backups daily at 2:00 AM server time. You can modify the schedule by editing:

```bash
crontab -e
```

## Restore from Backup

To restore from a backup, refer to the [Octeth Backup Tools documentation](https://github.com/octeth/octeth-backup-tools) for detailed restore procedures.

::: danger Important
Test your backups regularly by performing restore drills in a test environment to ensure they work when needed.
:::

## Next Steps

Your Octeth installation now has automated backups. Consider:
- Setting up AWS S3 for off-site backup storage
- Testing the restore procedure
- Monitoring backup logs for failures
- Adjusting the backup schedule if needed
