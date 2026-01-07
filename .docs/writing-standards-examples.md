# Writing Standards Examples

This document contains detailed examples for writing standards used across the Octeth Help Portal documentation.

## Help Article Writing Style Examples

### Example Comparison: Imperative vs First-Person

**❌ Wrong (First-person narrative):**
```markdown
I will initialize a virtual machine on Hetzner. I will choose the CX33 option.
```

**✓ Correct (Imperative mood):**
```markdown
Initialize a virtual machine with your hosting provider. Choose specifications similar to: 4 vCPUs, 8GB RAM, 80GB SSD.
```

**❌ Wrong (Passive voice):**
```markdown
Now we need to install Docker and then we can start using it.
```

**✓ Correct (Active voice, imperative):**
```markdown
Install Docker on your server. The following commands download and configure the Docker packages.
```

## Code Examples with Proper Context

### Example: Command with Explanation Before and After

**Good Example:**
```markdown
Update your package lists to ensure you get the latest version of Docker:

```bash
apt update && apt upgrade -y
```

**What this does:**
- Updates the package index from all configured sources
- Upgrades all installed packages to their latest versions
- The `-y` flag automatically confirms the upgrade

**Expected output:**
```
Reading package lists... Done
Building dependency tree... Done
0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.
```
```

## VitePress Components Usage Examples

### Security Warning Example

**Good Usage:**
```markdown
::: danger Never Commit Sensitive Information
Real credentials, IP addresses, names, or other personal information must NEVER appear in documentation. Always use placeholder values from reserved ranges.
:::
```

### Best Practice Tip Example

**Good Usage:**
```markdown
::: tip Performance Optimization
For production environments, enable Redis caching to improve response times by up to 10x. Configure Redis in your `.env` file with `REDIS_HOST=127.0.0.1`.
:::
```

### Important Warning Example

**Good Usage:**
```markdown
::: warning Database Backup Required
Before running migrations, create a complete database backup. This process modifies table structures and cannot be automatically reversed.
:::
```

### Additional Context Example

**Good Usage:**
```markdown
::: info Why We Use Docker
Docker provides consistent environments across development and production, eliminating "it works on my machine" issues. All Octeth dependencies are bundled in the container.
:::
```

## Changelog Writing Examples

### Release Summary Example

**Good Example:**
```markdown
## Release Summary

**Released:** January 3, 2026
**Development Period:** 4 weeks
**Upgrade Impact:** Medium
**Breaking Changes:** None

This release focuses on performance optimization and bug fixes, with significant improvements to journey execution speed and campaign batch processing. All users running v5.7.2 should upgrade to benefit from these enhancements.
```

### "Should You Upgrade?" Table Example

**Good Example:**
```markdown
## Should You Upgrade?

| Priority | Who Should Upgrade | Why |
|----------|-------------------|-----|
| 🔴 **URGENT** | Users experiencing stuck campaigns or journey delays | Critical fixes for campaign batch processing and journey execution |
| 🟡 **RECOMMENDED** | All production environments | 3x performance improvement in journey execution, better error handling |
| 🟢 **BENEFICIAL** | Development/staging environments | Enhanced debugging tools, improved logging capabilities |
```

### Feature Highlight Example

**Good Example:**
```markdown
## 🎯 Top New Features

### Journey Execution Performance Boost

**What's New:** Journey step execution is now 3x faster through optimized database queries and batch processing.

**Why It Matters:** Faster execution means subscribers move through your journeys in real-time, improving engagement and conversion rates. No more delays between journey steps.

**Use Case Example:** An e-commerce company with 100,000 subscribers in an abandoned cart journey saw step delays reduced from 5 minutes to under 1 minute, increasing recovery conversions by 15%.

**How to Use:**
No configuration needed. After upgrading, all journeys automatically benefit from the performance improvements:

```bash
# Verify journey performance with the health check
/opt/octeth/cli/octeth.sh health:check --journeys
```

**Expected output:**
```
✓ Journey queue processing: 450 subscribers/minute (3x improvement)
✓ Average step execution: 0.8 seconds
```

[Learn more about Journey Optimization →](/v5.7.x/api-reference/journeys)
```

### Upgrade Guide Example

**Good Example:**
```markdown
## 🔄 Upgrade Guide

### Prerequisites

Before upgrading, ensure you have:

- [ ] **Full database backup** created and tested
- [ ] **SSH access** to your Octeth server
- [ ] **15-30 minutes** of maintenance window
- [ ] **Root or sudo privileges** for running upgrade commands

### Step-by-Step Process

#### 1. Backup Your Database

Create a complete backup before proceeding:

```bash
/opt/octeth/cli/octeth.sh backup:create --full
```

**What this does:** Creates a timestamped backup of your database and uploads folder in `/opt/octeth/backups/`.

**Expected output:**
```
Creating full backup...
✓ Database exported: octeth_20260103_120000.sql.gz
✓ Uploads archived: uploads_20260103_120000.tar.gz
Backup completed: /opt/octeth/backups/full_20260103_120000/
```

#### 2. Stop Application Services

```bash
docker-compose stop app worker scheduler
```

**What this does:** Gracefully stops Octeth services while keeping the database running.

#### 3. Pull Latest Docker Image

```bash
docker-compose pull app
```

**What this does:** Downloads the v5.7.3 Docker image from the registry.

#### 4. Update Environment Configuration

Review your `.env` file for any new configuration options:

```bash
nano /opt/octeth/.env
```

Add the following new optional settings:
```env
# Journey performance optimization (optional)
JOURNEY_BATCH_SIZE=100
JOURNEY_PARALLEL_WORKERS=4
```

#### 5. Run Database Migrations

```bash
docker exec oempro_app bash -c "cd /var/www/html/cli/ && php5.6 dbmigrator.php migrate"
```

**What this does:**
- Adds composite index on Journeys table for faster queries
- Updates AuthToken handling schema
- Adds campaign batch profiling support

**Expected output:**
```
Running migration 001_journey_composite_index.php... ✓
Running migration 002_authtoken_update.php... ✓
Running migration 003_campaign_profiling.php... ✓
All migrations completed successfully.
```

#### 6. Restart Services

```bash
docker-compose up -d
```

**What this does:** Starts all Octeth services with the new version.

#### 7. Verify Upgrade

```bash
/opt/octeth/cli/octeth.sh health:check
```

**Expected output:**
```
✓ Version: v5.7.3
✓ Database: Connected
✓ Workers: 4 active
✓ Scheduler: Running
All systems operational.
```

### Troubleshooting

<details>
<summary><strong>Migration fails with "Duplicate column" error</strong></summary>

**Symptoms:** Migration script errors with "Column already exists"

**Solution:**
```bash
# Check current schema version
docker exec oempro_db mysql -u root -p octeth -e "SELECT * FROM migrations;"

# If migration already applied, mark as complete
docker exec oempro_app bash -c "cd /var/www/html/cli/ && php5.6 dbmigrator.php mark-complete 001"
```
</details>

<details>
<summary><strong>Services fail to start after upgrade</strong></summary>

**Symptoms:** Docker containers exit immediately after starting

**Solution:**
```bash
# Check logs for errors
docker-compose logs app

# Common fix: Clear cache
docker exec oempro_app bash -c "cd /var/www/html/cli/ && php5.6 cache-clear.php"

# Restart services
docker-compose restart
```
</details>

### Rollback Procedure

::: danger Data Loss Warning
Rolling back after running migrations may cause data loss for features created in v5.7.3. Only rollback if absolutely necessary.
:::

If you need to rollback to v5.7.2:

```bash
# Stop services
docker-compose stop

# Restore database backup
/opt/octeth/cli/octeth.sh backup:restore full_20260103_120000

# Revert to previous image
docker-compose down
docker pull octeth/octeth:v5.7.2
# Update docker-compose.yml to use v5.7.2 tag
docker-compose up -d
```
```

## Placeholder Values Examples

### Standard Placeholders

**IP Addresses:**
- Primary: `203.0.113.10` (TEST-NET-3: 203.0.113.0/24)
- Secondary: `203.0.113.20`
- Never use: Real production IPs

**Email Addresses:**
- Admin: `admin@example.com`
- User: `user@example.com`
- Support: `support@example.com`

**Passwords:**
- `YourSecurePassword123`
- `your-password-here`
- `Ch@ng3M3!`

**API Keys:**
- `your-api-key-here`
- `sk_xxxxxxxxxxxxx`
- `api_key_placeholder`

**Server Names:**
- `octeth-server`
- `octeth-link-proxy`
- `octeth.example.com`

**SSH Keys:**
- "Your SSH key"
- "your-ssh-key-name"
- `~/.ssh/id_rsa_octeth`

## Document Structure Example

**Good Example:**
```markdown
---
layout: doc
---

# Installing Octeth on Ubuntu 22.04

This guide walks through installing Octeth on a fresh Ubuntu 22.04 server using Docker. You will set up the database, configure environment variables, and verify the installation. The process takes approximately 30 minutes.

## Prerequisites

Before beginning, ensure you have:
- Ubuntu 22.04 LTS server with at least 4GB RAM
- Root or sudo access
- Port 80 and 443 available

## Install Docker

Docker provides the containerized environment for Octeth. Install Docker Engine and Docker Compose:

```bash
# Update package index
apt update

# Install required dependencies
apt install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
```

**Expected output:**
```
OK
```

Continue with Docker installation:

```bash
# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list

# Install Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

Verify Docker installation:

```bash
docker --version
```

**Expected output:**
```
Docker version 24.0.7, build afdd53b
```

## Configure Octeth

Create the Octeth directory structure:

```bash
mkdir -p /opt/octeth/{data,config,logs}
```

**What this does:** Creates the directory structure where Octeth stores its configuration files, uploaded files, and logs.

::: tip Best Practice
Use `/opt/octeth` as the installation directory for consistency with official documentation and support.
:::

## Next Steps

Now that Docker is installed, proceed to:
- [Configure Environment Variables](./environment-setup)
- [Initialize the Database](./database-setup)
- [Start Octeth Services](./starting-services)
```
