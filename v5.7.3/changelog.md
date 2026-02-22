---
layout: doc
title: What's New in Octeth v5.7.3
description: Release notes for Octeth v5.7.3 - Stuck campaign detector, security hardening, and operational reliability
---

# What's New in Octeth v5.7.3

## Release Summary

Octeth v5.7.3 is a focused release emphasizing **operational reliability**, **security hardening**, and **campaign monitoring capabilities**. This release includes critical fixes for journey email delivery and introduces an automated stuck campaign detection system to prevent campaign delivery failures.

**Release Date:** January 3, 2026
**Development Period:** 6 days (December 29, 2025 - January 3, 2026)
**Upgrade Impact:** Low (requires database migrations, ~5 minute downtime)
**Breaking Changes:** None (fully backward compatible with v5.7.2)

---

## Should You Upgrade?

| Priority | Audience | Reason |
|----------|----------|--------|
| 🔴 **URGENT** | Journey users | Critical Reply-To validation fix preventing email delivery failures |
| 🟡 **RECOMMENDED** | Campaign managers | Automated stuck campaign detection and recovery system |
| 🟡 **RECOMMENDED** | System admins | Security improvements and performance optimizations |
| 🟢 **BENEFICIAL** | All users | Enhanced UI, improved developer tools, better debugging |

---

## Table of Contents

[[toc]]

---

## 🎯 Top New Features

### Stuck Campaign Detector

**What's New:** Automated detection and recovery system for campaigns that stop progressing due to worker failures.

**Why It Matters:** Campaign delivery failures can go unnoticed for hours, resulting in missed opportunities and revenue loss. This system automatically detects stuck campaigns and provides tools for recovery.

**Key Capabilities:**
- **Automated Detection**: Cron job running every 5 minutes monitors campaigns in 'Sending' status
- **Detection Criteria**: Identifies campaigns with no active workers, silent workers (LastPingedAt > 60s), or lost worker assignments
- **Webhook Notifications**: Real-time alerts with 30-minute cooldown to prevent spam
- **Admin UI Management**: "Stuck Campaigns" filter, "Unstuck" action, and "Mark as Failed" action
- **Audit Trail**: Complete logging in `oempro_stuck_campaigns_log` table with resolution tracking

**How to Use:**

Enable the detector in your `.oempro_env` file:

```bash
# Stuck Campaign Detector Configuration
STUCK_CAMPAIGN_DETECTOR_ENABLED=true
STUCK_CAMPAIGN_WEBHOOK_URL=https://octeth.example.com/webhook
STUCK_CAMPAIGN_WEBHOOK_HMAC_SECRET=your-secret-key-here
STUCK_CAMPAIGN_NOTIFICATION_COOLDOWN_MINUTES=30
```

**What this does:**
- Enables automated stuck campaign detection every 5 minutes
- Sends webhook notifications to your specified URL
- Uses HMAC-SHA256 signature for security
- Prevents notification spam with 30-minute cooldown

**Verify the detector is running:**
```bash
# Test the detector
docker exec oempro_app bash -c "php5.6 /var/www/html/cli/stuck_campaign_detector.php --help"

# Check cron status
./cli/octeth.sh supervisor:status
```

**Access stuck campaigns:**
1. Navigate to Admin > Campaign Reports
2. Click "Stuck Campaigns" filter in sidebar
3. Use "Unstuck" action to reset batches to Pending
4. Use "Mark as Failed" to cancel stuck campaigns

::: tip Webhook Security
Always set `STUCK_CAMPAIGN_WEBHOOK_HMAC_SECRET` to validate webhook authenticity. The webhook payload includes campaign details, stuck reason, and batch information.
:::

[Learn more about stuck campaign detector →](/v5.7.3/api-reference/system-management#stuck-campaign-detector)

---

### Enhanced Email Validation for Journeys

**What's New:** Comprehensive validation and trimming for all email fields in journey actions.

**Why It Matters:** A single trailing space in an email address can cause journey email delivery to fail. This enhancement prevents such failures and provides clear diagnostic information.

**Improvements:**
- **From Email Validation**: Validates From email before API calls to catch issues early
- **Trimming & Validation**: Applied to all email fields (From, Reply-To, CC, BCC)
- **Smart Reply-To Handling**: Skips Reply-To field if personalization returns invalid email
- **Enhanced Error Logging**: Includes actual email addresses in error context for easier debugging

**Use Case Example:** Journey action configured with `"support@example.com "` (trailing space) will now:
1. Trim the whitespace automatically
2. Validate the resulting email address
3. Send successfully instead of failing with validation error
4. Log clear error messages if email is invalid

::: warning Important
This fix is critical for installations using journey email actions with Reply-To addresses. Update immediately if experiencing "Reply-To email address is invalid" errors.
:::

---

### MySQL Slow Query Analysis Tool

**What's New:** New CLI command for analyzing MySQL slow query log directly from the command line.

**Why It Matters:** Quick access to slow query diagnostics helps identify performance bottlenecks without accessing log files manually.

**How to Use:**

```bash
# View last 50 slow queries (default)
./cli/octeth.sh mysql:slow-log

# View last 100 slow queries
./cli/octeth.sh mysql:slow-log --lines=100
```

**Expected output:**
```
=== MySQL Slow Query Log (Last 50 lines) ===
# Time: 2026-01-03T14:30:22.123456Z
# User@Host: oempro[oempro] @ localhost []
# Query_time: 2.345678  Lock_time: 0.000123 Rows_sent: 1000  Rows_examined: 50000
SELECT * FROM oempro_campaigns WHERE Status='Sending' ORDER BY CreatedAt DESC;
...
```

::: tip Best Practice
Combine with enhanced log management to reset logs after analysis:
```bash
./cli/octeth.sh mysql:slow-log --lines=200 > /tmp/slow-queries.txt
./cli/octeth.sh logs:reset
```
:::

---

## 🔐 Security Improvements

### Current Password Requirement for Password Changes

**Enhancement:** Added current password validation when users change their passwords.

**Security Benefits:**
- Prevents unauthorized password changes if session is compromised
- Follows security best practices for password management
- Protects user accounts from session hijacking scenarios

**Implementation:**
- Users must enter current password before setting new password
- Server-side validation of current password
- Clear error messages for failed validation

::: danger Session Security
This feature significantly improves account security. If an attacker gains access to an active session, they cannot change the account password without knowing the current password.
:::

---

### XSS Prevention in DatePreset Parameter

**Vulnerability Fixed:** DatePreset parameter lacked input validation, creating potential XSS vector.

**Fix:**
- Implemented whitelist validation for DatePreset values
- Only allows predefined safe values: "today", "yesterday", "last7days", "last30days", "thismonth", "lastmonth"
- Rejects any unexpected or malicious input

**Impact:** Prevents potential cross-site scripting attacks via URL parameters.

---

## 🐛 Notable Bug Fixes

### Critical Fixes

#### Journey Email Reply-To Validation Errors

**Problem:** Journey emails failing with "Reply-To email address is invalid" errors.

**Root Cause:** Journey action parameters contained email addresses with trailing whitespace (e.g., `"support@example.com "`), which failed `filter_var()` validation.

**Solution:**
- Add `trim()` to all personalized email fields (From, Reply-To, CC, BCC)
- Validate Reply-To before including in API request
- Skip Reply-To entirely if personalized email is empty or invalid
- Enhanced error logging with actual email addresses for debugging

**Impact:** All journey emails with Reply-To addresses containing trailing whitespace can now send successfully.

#### Installation Theme and Permission Issues

**Problem:** Fresh installations failing with theme errors and permission issues.

**Fixes:**
- Resolved theme selection errors during installation
- Fixed file and directory permission issues
- Improved installation script robustness

### UI/UX Fixes

✅ **Campaign Report Chart Overlap** - Adjusted chart positioning to prevent overlap with "Scheduled" link, making it clickable again

✅ **Invalid Custom Fields During Subscription** - Validate custom fields during subscription process, skip invalid fields instead of failing the entire subscription

✅ **Campaign Report Empty State Improvements** - Removed CREATE CAMPAIGN button from admin campaign report (admins shouldn't create campaigns), improved Octeth Plug-Ins empty state messaging

✅ **Campaign Report UI Enhancements** - Better scheduled campaign display, improved campaign metrics visibility, increased column widths for Recipients/Delivered and Open/Click Rate columns

---

## ⚡ Performance Improvements

### Composite Index for Link Click Deduplication

Added database index to improve link click statistics query performance.

**Technical Details:**
- Created composite index on `oempro_link_stats` table: `(RelCampaignID, SubscriberID, LinkID)`
- Optimizes deduplication queries for campaign link click reporting
- Reduces query execution time for large campaigns

**Performance Impact:** Significantly faster campaign link click reporting, especially for campaigns with 100k+ recipients.

::: tip Database Optimization
This index is automatically created during database migration. No manual action required.
:::

---

## 🛠️ Developer Tools

### Enhanced Log Management

Improved `logs:reset` command to include additional log files.

**Now Includes:**
- Daily error logs from `data/logs/`
- MySQL slow query log
- Existing log files (queue logs, supervisor logs, etc.)

**Usage:**
```bash
# Reset all logs (includes slow query log)
./cli/octeth.sh logs:reset
```

**What this does:**
- Truncates all application log files
- Clears MySQL slow query log
- Resets supervisor process logs
- Frees up disk space

::: warning Data Loss
Log reset is irreversible. Export logs before resetting if you need to retain them for analysis.
:::

---

## 📋 Complete Change List

<details>
<summary><strong>Click to expand full changelog</strong></summary>

### Features (3)
1. **Enhanced Email Sending** - From field validation and comprehensive email field trimming
2. **Version 5.7.3 Upgrade Function** - Automated upgrade process for smooth transitions
3. **Stuck Campaign Detector** - Automated detection with webhook notifications (#1500)

### Bug Fixes (6)
1. **Journey Email Reply-To Validation** - Fixed trailing space validation errors (#1497)
2. **Campaign Report Empty State** - Removed CREATE CAMPAIGN button for admins (#1504)
3. **Octeth Plug-Ins Empty State** - Improved messaging and updated plugin links (#1496)
4. **Campaign Chart Overlap** - Prevented chart from overlapping Scheduled link (#1494)
5. **Custom Field Validation** - Skip invalid custom fields during subscription (#1503)
6. **Installation Issues** - Resolved theme error and permission issues

### Enhancements (4)
1. **Campaign Report UI** - Better scheduled campaign display and metrics (#1495)
2. **Log Management** - Include daily error logs and MySQL slow log in logs:reset (#1499)
3. **MySQL Slow Log Command** - New CLI command for slow query analysis (#1502)
4. **Link Click Performance** - Composite index for deduplication (#1501)

### Security (2)
1. **Password Change Validation** - Current password requirement (#1498)
2. **XSS Prevention** - Whitelist validation for DatePreset parameter

### UI Improvements (1)
1. **Column Width Optimization** - Increased widths for Recipients/Delivered and Open/Click Rate columns

</details>

---

## 🔄 Upgrade Guide

### Prerequisites

Before upgrading, ensure you have:
- [ ] Access to server with root/sudo privileges
- [ ] Current database backup
- [ ] Configuration file backup
- [ ] At least 5 minutes for maintenance window
- [ ] Reviewed new environment variables

### Step-by-Step Upgrade Process

#### 1. Backup Everything

**Backup database:**
```bash
./cli/octeth.sh db:backup
```

**Expected output:**
```
Creating database backup...
Backup saved to: /opt/octeth/backups/oempro_20260103_120000.sql.gz
```

**Backup configuration:**
```bash
cp .oempro_env .oempro_env.backup.$(date +%Y%m%d)
```

#### 2. Add New Environment Variables

Add stuck campaign detector configuration to `.oempro_env`:

```bash
# Add to .oempro_env
nano .oempro_env
```

**Add these lines:**
```bash
## Stuck Campaign Detector (v5.7.3)
STUCK_CAMPAIGN_DETECTOR_ENABLED=true
STUCK_CAMPAIGN_WEBHOOK_URL=
STUCK_CAMPAIGN_WEBHOOK_HMAC_SECRET=
STUCK_CAMPAIGN_NOTIFICATION_COOLDOWN_MINUTES=30
```

::: tip Optional Configuration
Leave `STUCK_CAMPAIGN_WEBHOOK_URL` empty to disable webhook notifications. The detector will still run and log stuck campaigns.
:::

#### 3. Pull Latest Code

```bash
# Navigate to Octeth directory
cd /opt/octeth

# Pull latest code
git pull origin main
```

#### 4. Run Database Migrations

This updates your database schema to support v5.7.3 features:

```bash
docker exec oempro_app bash -c "cd /var/www/html/cli/ && php5.6 dbmigrator.php migrate"
```

**What this does:**
- Creates `oempro_stuck_campaigns_log` table for audit logging
- Adds composite index on `oempro_link_stats` for performance
- Updates schema for stuck campaign detection

**Expected output:**
```
Running migration 001_stuck_campaigns_log.php... ✓
Running migration 002_link_stats_composite_index.php... ✓
All migrations completed successfully.
```

#### 5. Update Docker Containers

```bash
# Pull latest container images
./cli/octeth.sh docker:pull

# Restart containers with new images
./cli/octeth.sh docker:up
```

**Expected downtime:** 2-3 minutes while containers restart.

#### 6. Verify Cron Job Configuration

Verify stuck campaign detector cron is running:

```bash
# Check supervisor status
./cli/octeth.sh supervisor:status

# Should show: stuck_campaign_detector   RUNNING
```

#### 7. Clear Application Cache

```bash
./cli/octeth.sh cache:flush
```

#### 8. Verify Installation

Run comprehensive health checks:

```bash
# Test stuck campaign detector
docker exec oempro_app bash -c "php5.6 /var/www/html/cli/stuck_campaign_detector.php --help"

# Check Docker container health
./cli/octeth.sh docker:status

# Verify backend processes
./cli/octeth.sh backend:status

# Test MySQL slow log command
./cli/octeth.sh mysql:slow-log --lines=10

# View logs
./cli/octeth.sh logs:tail
```

**Expected results:**
- Stuck campaign detector help message displays
- All containers show "healthy" status
- Backend workers are running
- MySQL slow log command works

---

### Troubleshooting

<details>
<summary><strong>Database migration fails</strong></summary>

**Symptom:** Migration script returns errors

**Solution:**
1. Check database connectivity
2. Ensure user has ALTER TABLE and CREATE TABLE privileges
3. Review migration error messages
4. Contact support if issue persists

```bash
# Test database connection
docker exec oempro_mysql mysql -u$MYSQL_USERNAME -p$MYSQL_PASSWORD -e "SELECT 1;"
```
</details>

<details>
<summary><strong>Stuck campaign detector not running</strong></summary>

**Symptom:** Detector help command fails or cron not showing in supervisor

**Solution:**
```bash
# Restart supervisor to reload cron configuration
./cli/octeth.sh supervisor:restart

# Check supervisor logs
./cli/octeth.sh logs:tail supervisor

# Verify cron file contains detector entry
docker exec oempro_app cat /etc/cron.d/oempro-crons
```
</details>

<details>
<summary><strong>Journey emails still failing with Reply-To errors</strong></summary>

**Symptom:** Journey emails continue to fail with "Reply-To email address is invalid"

**Solution:**
1. Verify you're running v5.7.3 (not v5.7.2)
2. Clear Redis cache
3. Check journey action configuration for other email field issues
4. Review error logs for specific email addresses

```bash
# Verify version
./cli/octeth.sh version

# Clear cache
./cli/octeth.sh cache:flush

# Check error logs
./cli/octeth.sh logs:tail | grep "Reply-To"
```
</details>

---

### Rollback Procedure

If you need to rollback to v5.7.2:

::: danger Data Loss Warning
Rolling back may cause loss of stuck campaign log data and any campaigns detected after upgrade. Only rollback if absolutely necessary.
:::

```bash
# 1. Stop all containers
./cli/octeth.sh docker:down

# 2. Restore database backup
gunzip < /opt/octeth/backups/oempro_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i oempro_mysql mysql -u$MYSQL_USERNAME -p$MYSQL_PASSWORD $MYSQL_DATABASE

# 3. Restore configuration
cp .oempro_env.backup.YYYYMMDD .oempro_env

# 4. Checkout previous version
git checkout v5.7.2

# 5. Restart containers
./cli/octeth.sh docker:up
```

---

## 📝 Migration Notes

### Database Changes

**New tables:**
- `oempro_stuck_campaigns_log` - Audit log for stuck campaign detection and resolution

**New indexes:**
- Composite index on `oempro_link_stats(RelCampaignID, SubscriberID, LinkID)` for performance

**Automatic migration:** All changes applied automatically during upgrade.

### Configuration Changes

**New environment variables** (optional - have defaults):

```bash
STUCK_CAMPAIGN_DETECTOR_ENABLED=true  # Enable/disable detector
STUCK_CAMPAIGN_WEBHOOK_URL=  # Webhook endpoint for notifications
STUCK_CAMPAIGN_WEBHOOK_HMAC_SECRET=  # HMAC secret for webhook security
STUCK_CAMPAIGN_NOTIFICATION_COOLDOWN_MINUTES=30  # Notification cooldown
```

**No breaking changes** - All existing configuration remains compatible.

### Cron Job Changes

**New cron job** (automatically added):
```bash
*/5 * * * * /usr/bin/php5.6 /var/www/html/cli/stuck_campaign_detector.php
```

This runs every 5 minutes to detect stuck campaigns.

### API Changes

**No breaking changes** - All existing API endpoints remain compatible.

**Enhanced error messages:**
- Journey email validation errors now include actual email addresses for debugging
- More descriptive error messages for email field validation failures

---

## 🎓 For Developers

### Testing Stuck Campaign Detection

Manually test the stuck campaign detector:

```bash
# Run detector manually
docker exec oempro_app bash -c "php5.6 /var/www/html/cli/stuck_campaign_detector.php"

# Check stuck campaign log
docker exec oempro_mysql mysql -u$MYSQL_USERNAME -p$MYSQL_PASSWORD $MYSQL_DATABASE -e "SELECT * FROM oempro_stuck_campaigns_log ORDER BY DetectedAt DESC LIMIT 10;"
```

### Webhook Payload Example

When a stuck campaign is detected, the webhook receives this payload:

```json
{
  "event": "campaign.stuck",
  "timestamp": "2026-01-03T14:30:00Z",
  "campaign": {
    "id": 12345,
    "name": "Weekly Newsletter",
    "status": "Sending",
    "user_id": 789
  },
  "stuck_reason": "No workers processing pending batches",
  "batch_info": {
    "total_batches": 100,
    "pending_batches": 45,
    "working_batches": 0,
    "completed_batches": 55
  },
  "detection_time": "2026-01-03T14:30:00Z"
}
```

**Webhook signature verification:**
```php
$secret = 'your-secret-key-here';
$payload = file_get_contents('php://input');
$signature = hash_hmac('sha256', $payload, $secret);
$expected = $_SERVER['HTTP_X_OCTETH_SIGNATURE'];

if (!hash_equals($signature, $expected)) {
    http_response_code(401);
    exit('Invalid signature');
}
```

### Code Quality Standards

All contributions in this release follow:

1. **Email Validation:** All email fields trimmed and validated
2. **XSS Prevention:** Whitelist validation for user input
3. **Test Coverage:** Stuck campaign detector has comprehensive tests
4. **Logging Levels:** Appropriate levels used (DEBUG, INFO, WARNING, ERROR)
5. **Error Context:** Enhanced error messages with actual values for debugging

---

## 📚 Additional Resources

- [User Guide](https://help.octeth.com/)
- [Octeth Help Portal](https://dev.octeth.com/)
- [GitHub Repository](https://github.com/octeth/octeth)
- [Support Portal](https://my.octeth.com/)

## 💬 Support

Need help with the upgrade?

- **Email:** support@octeth.com
- **Client Area:** https://my.octeth.com/
- **Help Portal:** https://help.octeth.com/

---

## Previous Versions

## v5.7.2

::: danger Critical Security Update
This release includes fixes for SQL injection vulnerabilities in API endpoints. **Immediate upgrade recommended for all installations.**
:::

## Release Summary

Octeth v5.7.2 represents a major milestone with powerful multi-tag journey automation, comprehensive security improvements, and significant performance optimizations. This release includes 585 commits over 7.5 months of development.

**Release Date:** January 3, 2026
**Development Period:** 7.5 months
**Upgrade Impact:** Medium (requires database migrations, ~15 minute downtime)
**Breaking Changes:** None (fully backward compatible with v5.7.1)

---

## Should You Upgrade?

| Priority | Audience | Reason |
|----------|----------|--------|
| 🔴 **URGENT** | All installations | Critical SQL injection and XSS security fixes |
| 🟡 **RECOMMENDED** | Journey users | Multi-tag triggers, rate limiting, enhanced automation |
| 🟡 **RECOMMENDED** | Admins | Campaign reporting improvements, performance optimizations |
| 🟢 **BENEFICIAL** | Developers | API documentation generation, improved testing tools |

---

## Table of Contents

[[toc]]

---

## 🎯 Top New Features

### Multi-Tag Journey Triggers

**What's New:** Trigger journeys when subscribers have multiple specific tags simultaneously.

**Why It Matters:** Create sophisticated automation workflows without custom development. Perfect for complex customer segmentation and targeted campaigns.

**Use Case Example:** Trigger a "VIP Customer Onboarding" journey only when a subscriber has both "Premium Plan" AND "New Customer" tags.

**How to Use:**

```javascript
// API endpoint: journey.bulk_trigger
POST /api.php?command=journey.bulk_trigger
{
  "api_key": "your-api-key-here",
  "journeyids": [123, 456],
  "trigger": {
    "type": "Tag",
    "trigger_listid": 789,
    "trigger_tagids": [10, 20, 30]  // Subscriber must have ALL these tags
  }
}
```

::: tip Performance Optimized
Multi-tag validation uses a single optimized query instead of loops, ensuring fast performance even with thousands of subscribers.
:::

[Learn more about journey triggers →](/v5.7.2/api-reference/journeys)

---

### Advanced Campaign Reporting Dashboard

**What's New:** Comprehensive admin campaign report page with advanced filtering and real-time metrics.

**Key Features:**
- Advanced filtering capabilities for campaign data
- Real-time velocity and throughput metrics
- Batch statistics and performance monitoring
- Time-filtered counts for granular analysis

**Perfect For:** System administrators who need deep insights into campaign performance and delivery patterns.

---

### API Documentation Generation System

**What's New:** Automated documentation generation for all API endpoints integrated into development workflow.

**Benefits:**
- Automatically analyzes endpoint code to generate comprehensive docs
- Integrated into pre-commit workflow for automatic updates
- Structured documentation in `.docs/api/` directory
- Always up-to-date API reference

**For Developers:** No more manual documentation updates when API endpoints change.

---

## 🔐 Critical Security Fixes

::: danger Security Patches Included
**Action Required:** Review and apply this update immediately if running v5.7.1 or earlier.
:::

### SQL Injection Vulnerabilities Fixed

Fixed SQL injection vulnerabilities in multiple API endpoints. These vulnerabilities could potentially allow unauthorized database access.

**Affected Endpoints:**
- Order parameter validation across all API endpoints
- Tag trigger API endpoints
- Journey bulk operations

**Resolution:** Comprehensive validation for all orderfield/ordertype parameters using centralized FormHandler validation.

### XSS Prevention Enhanced

Enhanced cross-site scripting (XSS) prevention in admin views and controllers. All user input now properly escaped before rendering.

### Authentication Token Management

Multiple fixes for AuthToken regeneration and synchronization:
- AuthToken now regenerates on password changes
- Fixed sync issues between sessions
- Improved token validation

---

## ⚡ Performance Improvements

### Redis Entity Caching

Comprehensive Redis caching implementation for frequently accessed data:

- **Cached Entities:** Themes, delivery servers, user groups, custom fields, lists
- **Cache Pattern:** EntityCache pattern for consistent cache management
- **Smart Invalidation:** Automatic cache clearing on entity updates
- **Force Refresh:** Optional cache bypass when needed

**Performance Impact:** Significantly reduced database queries for common operations.

::: tip Best Practice
```php
// Force cache refresh when needed
$list = Lists::GetListByID($listID, true); // forceRefresh = true

// Cache automatically invalidated on updates
Lists::Update($listID, $data); // Cache cleared automatically
```
:::

### Campaign Monitoring API Optimization

- Optimized endpoints with auto-interval for velocity calculations
- Batch status query improvements
- Connection health checks prevent stale connections
- Composite index on (RelUserID, Status) for 10x faster queries

### Database Query Improvements

- SQL precedence bug fixed in RunCriteria OR operator
- Redis KEYS replaced with SCAN for better performance
- Queue table existence caching
- MySQL connection health checks in workers

---

## 🧪 Testing & Quality Improvements

### Test Database Isolation

Complete separation of test and production databases for safer development:

```bash
# Setup test database (first time only)
./cli/octeth.sh test:db:setup

# Run all tests
./cli/octeth.sh test:run all

# Run specific test file
./cli/octeth.sh test:run system/tests/Unit/SubscriberStateTransitionTest.php
```

**Key Features:**
- Automatic test database setup and seeding
- HTTP header support for API test routing (local environment only)
- Reusable test infrastructure with OctethApiTrait
- Comprehensive seeder for test data generation

::: warning Security Note
Test database routing via HTTP header (`X-Octeth-Test-Database: 1`) only works in local environment (`APP_ENV=local`).
:::

### Comprehensive Test Coverage

- API endpoint tests for subscribers, journeys, and tags
- Form handler validation tests
- Subscriber state transition tests
- Multi-tag journey trigger tests

---

## 🔧 Developer Experience Enhancements

### Granular MySQL Query Logging

Per-request/process MySQL query logging for detailed debugging:

```bash
# Enable in .oempro_env
LOG_MYSQL_QUERIES_GRANULAR=true
LOG_MYSQL_QUERIES_PATH=/var/www/html/data/logs/

# Restart services
./cli/octeth.sh backend:restart

# Logs created with format:
# mysql_queries_[context]_[pid]_[timestamp].log
# Example: mysql_queries_web_12345_20260103_143022.log
```

**What This Logs:**
- All SQL queries for each request/process
- Query execution time
- Context (web, CLI, worker)
- Process ID for correlation

### New CLI Commands

- `test:db:setup` - Create and seed test database
- `logs:fix-permissions` - Fix log file permission issues
- `auth:regenerate` - Regenerate authentication tokens for users/admins

### Enhanced Logging & Debugging

- Request Context tracking for log correlation
- Dedicated loggers for journey workers, delivery workers, campaign pickers
- Configurable log levels via environment variables
- Performance profiling for batch operations

---

## 🐛 Notable Bug Fixes

### Campaign & Email Fixes

✅ **Campaign Pause Logic** - Allow pausing campaigns when status is 'Ready'
✅ **Orphaned Worker Termination** - Workers terminated when campaign is deleted
✅ **Memory Exhaustion** - Fixed memory issues when storing campaign recipient domains
✅ **SMTP Error Handling** - Improved error message handling and logging
✅ **Delivery Worker Blocking** - Prevented workers from blocking on stdout

### Journey & Workflow Fixes

✅ **Website Event Triggers** - Support for both trigger formats
✅ **Case-Insensitive Triggers** - Proper comparison for trigger types
✅ **Journey Validation** - Comprehensive validation for tags, lists, and parameters
✅ **Disabled Journey Filtering** - SQL-level filtering for better performance

### Configuration & Environment Fixes

✅ **Log File Permissions** (#1438) - Resolved conflicts between Apache and root processes
✅ **XDebug Default Disabled** - Better default performance
✅ **AuthToken Sync** - Multiple synchronization fixes
✅ **Laravel Test Isolation** - Resolved phpdotenv conflicts

---

## 🐳 Infrastructure & Docker Updates

### HAProxy Upgrade

**Upgraded from v2.2.32 to v3.3.1**

::: warning Configuration Review Needed
Review your HAProxy configuration after upgrade. See [upgrade notes](#haproxy-configuration) below.
:::

**Improvements:**
- Enhanced security features
- Better performance and stability
- Updated configuration options

### Multi-Platform Docker Builds

- Support for multiple CPU architectures (AMD64, ARM64)
- Proper manifest creation with docker buildx
- Faster deployment across different platforms

### Docker Compose Enhancements

- Support for `docker-compose.override.yml`
- Improved container health checks
- Dynamic SendEngine container discovery
- Better volume mount configuration for PHP and Xdebug

---

## 📋 Complete Change List

<details>
<summary><strong>Click to expand full changelog</strong></summary>

### Journey Builder Enhancements

- Multi-Tag Journey Triggers (#1471) with backend support for complex automation
- Journey Trigger Rate Limiting to prevent system overload
- Journey API bulk operations with improved error handling
- Comprehensive validation for tag ownership and list IDs

### Campaign & Email Features

- Admin Campaign Report Page (#1470) with advanced filtering
- Message-ID Header Storage (#1171) for email threading
- User-Level Sender Settings (#1433) per-user configuration
- Campaign Monitoring API improvements
- Enhanced campaign pause logic

### API & Integration

- API Documentation Generation System (#958)
- Subscriber Tags API for bulk operations
- Segment Retrieval Optimization with SegmentID filtering
- Journey bulk operations with proper error codes
- Error code standardization across responses

### Database & Performance

- Redis entity caching with EntityCache pattern
- Composite index on Journeys table
- SQL precedence bug fixes
- Redis KEYS replaced with SCAN
- Queue table existence caching
- MySQL connection health checks

### Testing Infrastructure

- Test database isolation
- Reusable test traits (OctethApiTrait)
- Comprehensive API tests
- Form handler unit tests
- Subscriber state transition tests

### Documentation & Tools

- Plugin Hook Reference Documentation (#1489)
- CLI Modularization (#1268)
- Release procedures documentation
- Granular MySQL query logging

### Code Quality

- CLI refactor into modular structure
- Config parameter standardization
- Entity cache pattern consolidation
- Order parameter validation centralization
- Form handler refactoring

### Bug Fixes (Additional)

- Double JSON encoding fixes
- Associative array key preservation
- Tag ownership validation
- 404 error handling improvements
- PHP 5.6 compatibility fixes
- Docker buildx manifest creation
- SendEngine container discovery

</details>

---

## 🔄 Upgrade Guide

### Prerequisites

Before upgrading, ensure you have:
- [ ] Access to server with root/sudo privileges
- [ ] Current database backup
- [ ] Configuration file backup
- [ ] At least 15 minutes for maintenance window
- [ ] Reviewed new environment variables

### Step-by-Step Upgrade Process

#### 1. Backup Everything

**Backup database:**
```bash
./cli/octeth.sh db:backup
```

**Expected output:**
```
Creating database backup...
Backup saved to: /opt/octeth/backups/oempro_20260103_120000.sql.gz
```

**Backup configuration:**
```bash
cp .oempro_env .oempro_env.backup.$(date +%Y%m%d)
```

#### 2. Review New Environment Variables

Compare your current `.oempro_env` with the new example file:

```bash
# View new environment variables
cat _dockerfiles/examples/.oempro_env.example | grep -A 50 "## New in v5.7.2"
```

**New environment variables in v5.7.2:**

```bash
## Granular MySQL query logging (creates separate log files per request/process)
LOG_MYSQL_QUERIES_GRANULAR=false

## Test database configuration (local environment only)
TEST_MYSQL_HOST=localhost
TEST_MYSQL_USERNAME=root
TEST_MYSQL_PASSWORD=YourSecurePassword123
TEST_MYSQL_DATABASE=oempro_test

## Session lifetime in days
SESSION_LIFETIME_DAYS=30

## Campaign delivery profiling
CAMPAIGN_DELIVERY_PROFILING_ENABLED=false
CAMPAIGN_BATCH_PROFILING_RETENTION_DAYS=30

## Personalization profiling (samples 1 in 100 calls)
PERSONALIZATION_PROFILING_ENABLED=false

## Journey worker logging
JOURNEY_WORKER_LOG_ENABLED=true
JOURNEY_WORKER_LOG_LEVEL=INFO

## Campaign delivery logging
CAMPAIGN_DELIVERY_LOG_LEVEL=INFO

## Credits system (can be disabled for testing)
CREDITS_SYSTEM_ENABLED=true

## OemproOptions cache TTL (default: 24 hours)
OEMPRO_OPTIONS_CACHE_TTL=86400
```

::: tip Optional Configuration
These new variables have sensible defaults. You only need to add them if you want to change the default behavior.
:::

#### 3. Pull Latest Code

```bash
# Navigate to Octeth directory
cd /opt/octeth

# Pull latest code
git pull origin main
```

#### 4. Run Database Migrations

This updates your database schema to support new v5.7.2 features:

```bash
docker exec oempro_app bash -c "cd /var/www/html/cli/ && php5.6 dbmigrator.php migrate"
```

**What this does:**
- Adds composite index on Journeys table (RelUserID, Status)
- Updates AuthToken handling schema
- Adds campaign batch profiling support

**Expected output:**
```
Running migration 001_journey_composite_index.php... ✓
Running migration 002_authtoken_updates.php... ✓
Running migration 003_campaign_profiling.php... ✓
All migrations completed successfully.
```

#### 5. Update Docker Containers

```bash
# Pull latest container images
./cli/octeth.sh docker:pull

# Restart containers with new images
./cli/octeth.sh docker:up
```

**Expected downtime:** 2-5 minutes while containers restart.

#### 6. Fix Log Permissions (If Needed)

If you experience log permission issues:

```bash
./cli/octeth.sh logs:fix-permissions
```

This sets correct umask and permissions for log files shared between Apache (www-data) and root processes.

#### 7. Restart Backend Services

```bash
./cli/octeth.sh backend:restart
```

This restarts:
- Campaign picker workers
- Journey workers
- Delivery workers
- Event processors

#### 8. Verify Installation

Run comprehensive health checks:

```bash
# Check Docker container health
./cli/octeth.sh docker:status

# Verify backend processes
./cli/octeth.sh backend:status

# Test MySQL connectivity
source .oempro_env
docker exec oempro_mysql bash -c "mysql -u$MYSQL_USERNAME -p$MYSQL_PASSWORD -h$MYSQL_HOST $MYSQL_DATABASE -e 'SELECT VERSION();'"

# Verify log file permissions
ls -la data/logs/

# Test API endpoint
curl -X GET "http://localhost/api.php?command=system.info&api_key=$ADMIN_API_KEY"
```

**Expected results:**
- All containers show "healthy" status
- Backend workers are running
- MySQL connection succeeds
- API responds with system information

#### 9. Clear Redis Cache

```bash
./cli/octeth.sh redis:cache:flush
```

This ensures the new EntityCache pattern starts fresh.

---

### Troubleshooting

<details>
<summary><strong>Database migration fails</strong></summary>

**Symptom:** Migration script returns errors

**Solution:**
1. Check database connectivity
2. Ensure user has ALTER TABLE privileges
3. Review migration error messages
4. Contact support if issue persists

```bash
# Test database connection
docker exec oempro_mysql mysql -u$MYSQL_USERNAME -p$MYSQL_PASSWORD -e "SELECT 1;"
```
</details>

<details>
<summary><strong>Containers won't start after upgrade</strong></summary>

**Symptom:** Docker containers fail to start or show unhealthy status

**Solution:**
1. Check container logs
2. Verify docker-compose.yml not modified incorrectly
3. Ensure sufficient disk space
4. Try rebuilding containers

```bash
# View container logs
./cli/octeth.sh logs:tail oempro_app

# Check disk space
df -h

# Rebuild if necessary
./cli/octeth.sh docker:rebuild
```
</details>

<details>
<summary><strong>Log permission errors</strong></summary>

**Symptom:** "Permission denied" errors in logs

**Solution:**
```bash
# Fix permissions
./cli/octeth.sh logs:fix-permissions

# Verify ownership
ls -la data/logs/

# Should show:
# -rw-rw-r-- 1 www-data www-data ... campaign_picker.log
```
</details>

<details>
<summary><strong>HAProxy won't start after upgrade</strong></summary>

**Symptom:** HAProxy container fails with configuration errors

**Solution:**
HAProxy v3.3.1 has some configuration syntax changes from v2.2.32.

1. Review HAProxy logs:
```bash
docker logs oempro_haproxy
```

2. Check configuration:
```bash
docker exec oempro_haproxy haproxy -c -f /usr/local/etc/haproxy/haproxy.cfg
```

3. If configuration issues found, restore from backup and contact support
</details>

---

### Rollback Procedure

If you need to rollback to v5.7.1:

::: danger Data Loss Warning
Rolling back may cause loss of data created after upgrade. Only rollback if absolutely necessary.
:::

```bash
# 1. Stop all containers
./cli/octeth.sh docker:down

# 2. Restore database backup
gunzip < /opt/octeth/backups/oempro_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i oempro_mysql mysql -u$MYSQL_USERNAME -p$MYSQL_PASSWORD $MYSQL_DATABASE

# 3. Restore configuration
cp .oempro_env.backup.YYYYMMDD .oempro_env

# 4. Checkout previous version
git checkout v5.7.1

# 5. Restart containers
./cli/octeth.sh docker:up
```

---

## 📝 Migration Notes

### HAProxy Configuration

**Important:** HAProxy has been upgraded from v2.2.32 to v3.3.1.

**Action Required:**
- Review custom HAProxy configurations
- Test SSL certificate renewal process
- Verify load balancing rules still work

**Key Changes:**
- Improved security defaults
- Better HTTP/2 support
- Updated TLS configuration

### Environment Variables

**New optional variables** (all have defaults, no action required unless you want to customize):

- `LOG_MYSQL_QUERIES_GRANULAR` - Enable detailed query logging
- `TEST_MYSQL_*` - Test database configuration
- `SESSION_LIFETIME_DAYS` - Session duration (default: 30)
- `*_LOG_LEVEL` - Logging levels for various components
- `*_PROFILING_ENABLED` - Performance profiling toggles

**No breaking changes** - All existing configuration remains compatible.

### Database Changes

**New indexes added:**
- Composite index on `Journeys(RelUserID, Status)` for better query performance

**Schema updates:**
- AuthToken handling improvements
- Campaign batch profiling support

**Automatic migration:** All changes applied automatically during upgrade.

### API Changes

**No breaking changes** - All existing API endpoints remain compatible.

**New features:**
- Multi-tag journey trigger support
- Enhanced error codes
- Improved bulk operations

### Docker Changes

**Container updates:**
- HAProxy: v2.2.32 → v3.3.1
- Multi-platform build support added
- Improved health checks

**Volume changes:**
- New PHP config volume mounts
- Xdebug configuration volumes

---

## 🎓 For Developers

### Using the Test Database

The new test database isolation feature allows safe testing:

```bash
# Setup test database (first time)
./cli/octeth.sh test:db:setup

# Run all tests
./cli/octeth.sh test:run all

# Run specific test file
./cli/octeth.sh test:run system/tests/Unit/SubscriberStateTransitionTest.php

# Run test suite
./cli/octeth.sh test:run journey
```

**HTTP API Testing:**
```bash
# Use test database header (local environment only)
curl -H "X-Octeth-Test-Database: 1" \
  -X POST "http://localhost/api.php" \
  -d "command=subscriber.create&..." \
  -d "api_key=your-api-key-here"
```

### Monitoring Campaign Performance

New API endpoints for performance monitoring:

```bash
# Campaign velocity metrics
curl "http://localhost/api.php?command=admin.campaigns.search&includevelocity=1&api_key=$ADMIN_API_KEY"

# Batch statistics
curl "http://localhost/api.php?command=admin.campaigns.search&includebatchstats=1&api_key=$ADMIN_API_KEY"

# Time-filtered counts
curl "http://localhost/api.php?command=admin.campaigns.overview&includetimefiltered=1&api_key=$ADMIN_API_KEY"
```

### Code Quality Standards

All contributions must follow these standards:

1. **SQL Injection Prevention:** All orderfield/ordertype parameters must be validated
2. **XSS Prevention:** All user input must be properly escaped
3. **Test Coverage:** New features require comprehensive tests
4. **API Error Codes:** Use standardized ErrorCode field
5. **Cache Management:** Use EntityCache pattern
6. **Logging Levels:** Use appropriate levels (DEBUG, INFO, WARNING, ERROR)

### Documentation Requirements

When contributing code:

1. **API Changes:** Update using api-doc-gen skill
2. **Plugin Hooks:** Document using plugin-hook-reference skill
3. **GitHub Content:** Draft PR/issue descriptions in /tmp for review
4. **Changelog:** Follow conventional commit format

---

## 📚 Additional Resources

- [User Guide](https://help.octeth.com/)
- [Octeth Help Portal](https://dev.octeth.com/)
- [GitHub Repository](https://github.com/octeth/octeth)
- [Support Portal](https://my.octeth.com/)

## 💬 Support

Need help with the upgrade?

- **Email:** support@octeth.com
- **Client Area:** https://my.octeth.com/
- **Help Portal:** https://help.octeth.com/

---

## Previous Versions

## v5.7.1

This document represents a cumulative list of all user-facing changes in Octeth v5.7.1. For more information, see our [user guide](https://help.octeth.com/) and [API documentation](https://dev.octeth.com/).

### Core System Updates

- **MySQL Performance Optimization** - Comprehensive query optimization with strategic index hints for faster data retrieval
- **ClickHouse Optimization** - Increased concurrent queries to 200 with system log TTL optimization and disk usage monitoring
- **Session Management Extended** - Default session lifetime increased to 30 days to prevent premature logouts
- **UTF8MB4 Migration** - Complete database charset update from utf8 to utf8mb4 for better character support
- **Docker Hub Integration** - Consolidated Docker architecture for simplified deployment and management
- **Horizontally Scalable Send Engine** - Enhanced send engine with health monitoring and scalability support
- **Redis Caching System** - Implemented caching for subscriber counts, list counts, tags, and custom fields
- **Cache Invalidation** - Automatic cache clearing on subscriber and list mutations
- **Custom MySQL Profiles** - Support for custom MySQL configuration profiles
- **Phpdotenv Integration** - Enhanced .env file parsing with support for special characters

### New Features

#### Journey Builder

- **Journey Decision Nodes** - Advanced conditional logic and branching with nested decision support
- **Send Email Actions** - Complete email action implementation with template selection and sender configuration
- **Multiple Journey Triggers** - EmailOpen, EmailLinkClick, CustomFieldValueChanged, JourneyCompleted, and Untag triggers
- **Multiple Journey Enrollments** - Allow contacts to enroll in the same journey multiple times
- **Journey Statistics Screen** - Comprehensive journey analytics and performance tracking dashboard
- **Journey Activity Tracking** - Detailed execution tracking with 95% database load reduction
- **Journey Copy/Clone** - Clone entire journeys with proper action ID handling
- **Node Cloning** - Duplicate individual journey nodes within the builder
- **Drag-and-Drop Improvements** - Enhanced drag-and-move functionality for better user experience

#### Google Postmaster Tools

- **Complete Integration** - Full OAuth flow, data collection, and automated monitoring
- **Analytics Dashboard** - Correlation analysis with encryption/spam charts and detailed metrics
- **Redis Caching** - Performance optimization for Postmaster data retrieval
- **Security Enhancements** - Secure OAuth handling and validation
- **Date Range Filtering** - Enhanced charts with flexible date range selection

#### Campaign & Email Features

- **Automated Campaign Reports** - Schedule campaign reports to be generated and delivered automatically
- **Auto-Resend Campaigns** - Automated follow-up campaigns targeting non-openers
- **Enhanced Campaign Metrics** - Improved campaign performance display and tracking
- **Email Template Preview** - Preview templates without associating them with lists or campaigns
- **Email Cloning** - Clone and resend functionality for existing emails
- **Custom Email Headers** - Journey/Action merge tag support in email headers
- **Campaign ISP/Domain Reports** - Normalized reporting table for optimized ISP and domain analytics

### Version Information

**Release Version:** v5.7.1
**Release Date:** December 4, 2025
**Development Period:** 7.5 months (March 30 - November 16, 2025)
**Total Commits:** 585
**Features Added:** 62
**Bugs Fixed:** 91
**Performance Enhancements:** 23

---

## v5.7.0

This document represents a cumulative list of all user-facing changes in Octeth v5.7.0. For more information, see our [user guide](https://help.octeth.com/) and [API documentation](https://dev.octeth.com/).

### Core System Updates

- **MySQL Performance Optimization** - Comprehensive query optimization with strategic index hints for faster data retrieval
- **ClickHouse Optimization** - Increased concurrent queries to 200 with system log TTL optimization and disk usage monitoring
- **Session Management Extended** - Default session lifetime increased to 30 days to prevent premature logouts
- **UTF8MB4 Migration** - Complete database charset update from utf8 to utf8mb4 for better character support
- **Docker Hub Integration** - Consolidated Docker architecture for simplified deployment and management
- **Horizontally Scalable Send Engine** - Enhanced send engine with health monitoring and scalability support
- **Redis Caching System** - Implemented caching for subscriber counts, list counts, tags, and custom fields
- **Cache Invalidation** - Automatic cache clearing on subscriber and list mutations
- **Custom MySQL Profiles** - Support for custom MySQL configuration profiles
- **Phpdotenv Integration** - Enhanced .env file parsing with support for special characters

### Version Information

**Release Version:** v5.7.0
**Release Date:** December 1, 2025
**Development Period:** 7.5 months (March 30 - November 16, 2025)
**Total Commits:** 585
**Features Added:** 62
**Bugs Fixed:** 91
**Performance Enhancements:** 23

---

## v5.6.0

This change log represents the major updates in Octeth v5.6.0. For detailed implementation guides or technical specifications about specific features, please refer to our documentation or contact support.

### Core System Updates

- Upgraded from MySQL 5.7 to MySQL 8.0 for improved performance and security
- Added full UTF8MB4 support for complete emoji and special character compatibility
- Extended PHP session lifetime to 30 days for improved user experience

### New Features

- A/B Testing for email campaigns with automatic winner selection
- Campaign Auto-Resend functionality for non-openers with customizable settings
- Event API for tracking custom events and subscriber behavior
- Delete Subscriber journey action for automated list management
- Email-level control over open tracking, link tracking, and UTM parameters
- Custom Code plugin for extending platform functionality
- User Overall Stats API endpoint for comprehensive reporting
- Website event personalization in journey emails for more relevant content
- Journey webhook action improvements with enhanced security options
- Custom field unique identifier flag for better subscriber tracking

### Enhancements

- Database migrator tool for improved schema management
- Improved error logging and monitoring capabilities
- Revenue tracking and attribution improvements
- Website event tracker updates with CDN support
- Handlebar improvements for advanced personalization
- Additional database indexes for better performance
- Email gateway queue table optimization
- Journey event trigger with advanced rules JSON criteria
- Journey webhook payload customization
- MySQL query optimization for slow queries

### Importers

- Improved Mailchimp import functionality
- Enhanced ActiveCampaign data mapping
- Upgraded Drip import capabilities
- Support for mapping full name to first and last name fields

### Bug Fixes

- Fixed default sender domain issue that could block campaign delivery
- Resolved admin password reset functionality
- Fixed website event tracker and subscriber association issues
- Campaign schedule now defaults to user's timezone instead of Hawaii
- Corrected tag count for deleted subscribers
- Fixed subscriber journey trigger for silenced custom events
- Resolved email open activity registration issue
- Fixed campaign daily stats reporting
- Improved email tracking URL validation

### Development Tools

- Added xdebug PHP module for development environments
- Improved MySQL configuration for slow query logging
- Added SQL query debugging capabilities

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.5

Welcome to the latest update for Octeth! Here's what's new in version 5.5.5:

### New Features

- **One-Click Sender Domain DNS Record Setup:** Simplifies the process of setting up DNS records for sender domains. ([API documentation](https://dev.octeth.com/api-reference/sender-domains.html))
- **Subscriber Activity Monitor Enhancements:**
    - New ability to disable checks and logging for specific thresholds in the Subscriber Activity Monitor plugin.
    - Improved settings page UI for the Subscriber Activity Monitor.
    - New menu items 'Drop' and 'Subscriber Activity' added under 'Subscriber Activity Mon.' menu title.

### Enhancements

- **Admin Interface Improvements:**
    - Small improvements to the admin top header menu.
    - Subscriber Activity Monitor admin top menu placement changed.
- **Email System Enhancements:**
    - Updated the email subject format for preview emails.
- **Debugging and Error Reporting:**
    - Added debug mode settings and error reporting configuration.

### Bug Fixes

- **Typo Fix:** Corrected a typo in the codebase.
- **PHP Error:** Fixed an error during installation.
- **API Error Code Correction:** Corrected an API error code from 3 to 4.

### Security Patches

- **Database Migration Security:** Implemented db migration methods for transitioning from v5.5.4 to v5.5.5 securely.

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.4

Welcome to the latest update for Octeth! Here's what's new in version 5.5.4:

### Enhancement

- **Website Event Tracking Improvements**Improved the supervisor process for the website event identifier to prevent hanging, ensuring that no events are lost. Commit `2ff1df573`.

### New Feature

- **Cleanify Plug-In Update**

    Updated the Cleanify Plug-In to enhance functionality. Commit `34fd43714`.

- **Enable ClickHouse Native Access**

    Enabled direct access to ClickHouse native port 9000. Commit `23bbc5012`.


### Bug Fix

- **Refactor Email Bounce Handling**Refactored the logic for handling email bounces to improve reliability and performance. Commit `053c776b5`.

Stay tuned for more updates and improvements!

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.3

Welcome to the v5.5.3 update for Octeth! Here's what's new in version 5.5.3:

### New Feature

- **Revise Campaign Share Links**: Now includes a "copy link" option for easier sharing. (#319)

### Bug Fix

- **MySQL Errors in Email Campaign Sending**: Fixed an issue where sending email campaigns was causing MySQL errors. (#683)
- **"RevenueHit" Journey Trigger Issue**: Resolved an issue affecting the "RevenueHit" journey trigger. (#672)
- **Task #682 Fix**: Resolved an issue related to SSL renewal with HAProxy and Certbot. (#682)

### Enhancement

- **System-wide Error Logging Improvements**: Enhanced error logging across the system for better troubleshooting and support. (#570)
- **Unification of Column Collation**: Ensured consistency by unifying column collation across all table columns. (#661)
- **Segment Management UI Update**: The segment management UI now utilizes the new `RulesJSON`, offering improved handling of segment rules. (#685)
- **Removed Latest Product News from Admin Dashboard**: The product news section has been removed from the admin dashboard for a cleaner interface. (#686)

### Security Patch

- **Ioncube Encryption Settings Update**: Updated the Ioncube encryption settings for improved security and compatibility. (#678)

### Deprecated

- **Removal of Upgrade Script**: The `upgrade.sh` script has been removed as part of task #679 completion.

Stay tuned for more updates and improvements!

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.2

We're excited to announce the release of Octeth v5.5.2! This update brings a variety of new features, enhancements, and bug fixes to improve your experience with our platform. Below are the details of what's new in this version:

### New Features

- **New Journey Triggers**: Automate email campaigns with newly added journey triggers. Now you can easily initiate workflows based on specific actions or criteria (#642, #670).
- **Automated HAProxy SSL Certificate Renewal**: Streamline your SSL management with the automated renewal process for HAProxy SSL certificates (#668).
- **Phone Verification on Signup**: Enhance security and verify user identities by requiring phone verification when signing up to send emails (#675).

### Enhancements

- **Improved Email Whitelist Functionality**: Get more control over your email sending with improved whitelist functionality.
- **Filter Subscribers by Failed Delivery**: Now filter and manage subscribers based on failed campaign delivery attempts, allowing for better campaign management (#667).
- **Improved Email Gateway Personalization**: Personalize your email campaigns more effectively with updated personalization options in the email gateway (#665).
- **Sort Campaigns in Campaign.Get API**: Optimize your campaign management by sorting campaigns based on scheduled time directly through the Campaign.Get API endpoint (#658, #655).
- **Improved Link Redirection Security Checks**: Enhanced security measures for link redirection within emails to prevent hijacking and unauthorized redirects (#660).

### Bug Fixes

- **Fixed Campaign Copy Feature**: Resolved an issue where the `RulesJsonBundle` parameter wasn't copied when using the Campaign.Copy API endpoint (#650).
- **Fixed Email Import Functionality**: Addressed a bug that prevented importing a single email address without a newline (#644).

### Security Patch

- **Update to Email Address Suppression List**: Implemented a whitelist feature for the email address suppression list to improve handling of sender domains and campaign rules (#645).

### Miscellaneous Updates

- **Improved Infrastructure for Sender Domains**: Updated several backend elements related to sender domain management, ensuring smoother operations and better alignment with user configurations.
- **Issue and Documentation Templates Updated**: Streamlined GitHub issue and pull request templates for better user and contributor experience.

We hope you enjoy the new features and improvements in Octeth v5.5.2. If you have any questions or need further assistance, please don't hesitate to reach out to our support team.

Thank you for using Octeth!

---

## v5.5.1

We're excited to announce the release of Octeth v5.5.1! This update brings a variety of new features, enhancements, and bug fixes to improve your experience with our platform. Below are the details of what's new in this version:

### New Features

- **Email Previews Customization**: You can now pass `FromName` and `FromEmailAddress` for email previews, allowing for more personalized and accurate previewing of your emails.
- **Revenue Calculation**: Introduced a new feature for revenue calculation to better track and analyze your campaign performance.

### Enhancements

- **System Components Check**: Improved system stability by ensuring that all system components are thoroughly checked during operation.
- **Sub Admin User Management**: Sub admin accounts now have the ability to view the list of all users in the impersonated user list, enhancing administrative oversight.
- **Drip Importer**: Enhanced the Drip importer functionality for better data handling and efficiency.
- **Campaign Queue Maintenance**: Implemented a cron job to automatically delete campaign queue tables that are older than a specified number of days, keeping your database clean and efficient.
- **Upgrade Tool Improvement**: The upgrade tool now preserves custom changes to `config.inc.php`, preventing overwrites of user-defined parameters.

### Bug Fixes

- **Vendor Directories**: Removed unnecessary vendor directories from the Octeth project, reducing clutter and potential conflicts.
- **Clone Journey Endpoint**: Fixed an issue where the "Clone Journey" endpoint was not working correctly, ensuring smooth cloning of journeys.
- **Subscriber.Import API Validation**: Resolved validation errors for the `Subscriber.Import` API endpoint related to Drip, improving reliability.

We hope you enjoy the new features and improvements in Octeth v5.5.1. If you have any questions or need further assistance, please don't hesitate to reach out to our support team.

Thank you for using Octeth!

---

## v5.5.0

### New Features

- **Campaigns.Get API Endpoint Enhancements**: Updated to support `CampaignStatus=Scheduled` for better campaign management. [#559]
- **Ability to Get the List of Subscribers for Specific Email Campaign Activities**: This feature allows for more detailed analysis of email campaign engagement. [#550]
- **Subscriber Filtering and Segmentation Based on Website Events**: Enhanced segmentation capabilities to target subscribers based on their interactions on your website. [#502, #531]
- **Customizable Website Activity Tracker JavaScript**: Allows for customization of the web activity tracking script for more tailored tracking. [#538]
- **Journey Email Action Metrics**: Introduced metrics for email actions within journeys to provide insights into performance. [#545]
- **Email Gateway ListID and SubscriberID Support**: Enhanced support for ListID and SubscriberID in email gateways for improved data management. [#544]
- **User API Key Management**: Added endpoints for managing user API keys, enhancing security and control over API access. [#450]
- **New Subscriber API End-Points**: Create and Update API end-points for subscribers have been introduced, streamlining the management of subscriber data. [#467]
- **SMS Connector for MessageBird**: Implemented an SMS connector for MessageBird, expanding communication channels with subscribers. [#411]
- **Antivirus Plugin**: Introduced an antivirus plugin to ensure email attachments are scanned for viruses, enhancing security. [Various commits]
- **Mailchimp Import Integration**: Completed integration with Mailchimp, allowing for seamless import of subscriber data. [Various commits]
- **ActiveCampaign Import Tool**: Implemented a tool for importing data from ActiveCampaign, facilitating easy migration. [Various commits]

### Enhancements

- **SMTP Server Error Message Refactoring**: Improved error handling for SMTP server messages for clearer communication of issues. [Various commits]
- **UI Text and Database Value Updates**: Updated various UI texts and database values to reflect "Octeth" branding. [#499]
- **Performance Improvements**: Various enhancements have been made to improve the performance of the system, including optimizations to query handling and email campaign delivery. [Various commits]
- **API Notation Changes**: Standardized request and response notation for API calls, making API interactions more consistent. [#513]
- **Security Patches**: Various improvements have been made to enhance the security of the platform, including the implementation of a connection limiter for the email gateway and updates to ACL rules. [Various commits]

### Bug Fixes

- **Multiple RSS Feeds Conflict Issue Resolved**: Fixed an issue where multiple RSS feeds could conflict with each other. [#549]
- **SMTP Password Optionality**: Corrected settings to make the SMTP password optional as intended, addressing user feedback. [#491]
- **Segment Count Expiration Time Update**: Updated the expiration time for segment counts to 30 seconds, improving the accuracy of data. [#547]
- **Journey Action Subscribers API Optimization**: Optimized the Journey Action Subscribers API endpoint for better performance. [#537]
- **Email Recipient Handling and Credit Calculation**: Updated how email recipients are handled and how credits are calculated for more accurate accounting. [#509]

---

## v5.1.1

#### Octeth v5.1.1 Release Highlights

- Enhancement Segment engine minor performance improvements
- New Feature Ability to setup custom email headers (with personalization support) for each user account
- New Feature Link proxy add-on. [More details can be found here](https://www.notion.so/Link-Proxy-Add-On-a6fbffd4f8504342ac1816a2500a045a?pvs=21).
- New Feature A brand new IMAP powered inbound bounce and list-unsubscribe MX server add-on. [More details can be found here](https://www.notion.so/Bounce-Catcher-Add-On-59d4ff84909f43d8b62bb746f90d5648?pvs=21).
- Bug Fix Various bug fixes.

---

## v5.1.0

#### Octeth v5.1 Release Highlights

- Enhancement Ability to set list suppression settings enabled by default
- Enhancement Improved list subscription webhook payload
- Enhancement HTML and plain text email content is enabled by default for the simplified campaign create flow
- Enhancement Timezone DST calculation improvements for scheduled campaigns
- Enhancement Custom field data type is changed from `TEXT` to `LONGTEXT`
- Enhancement Stripo drag-n-drop email builder session timeout prevention improvements
- New Feature User account suppression list pagination and search features
- New Feature Sender Domain Management section for the user area. [Read this article](https://help.octeth.com/sender-domain-management) to learn more.
- New Feature Backend daemon processes and cron jobs are now being managed by separate containers for easier scaling
- New Feature Fallback personalization in case a custom field value is empty for the recipient. [Read this article](https://help.octeth.com/email-personalization#fd6ed9f7105b4d0d81caaedcbd15a0a5) to learn more.

---

## v5.0.3

#### Octeth v5.0.3 Release Highlights

- Enhancement Delivery server list ordering in user groups
- Enhancement Improved personalization
- Enhancement Improved campaign KPI metrics on the campaign browse page
- Enhancement Display timezone for scheduled campaigns
- Enhancement Campaign schedule minute time intervals are every 5 minutes
- Enhancement IMAP based hard bounce and FBL processing module
- Enhancement Abiltiy to search for a user ID
- Enhancement Display opt-in pending subscribers count on the list dashboard
- Enhancement POST method support for inbound webhooks
- Enhancement User's first and last names are optional, company name can be used
- New Feature %MFROMDomain% merge tag support for email's from header.
- New Feature System wide daily/weekly/monthly/yearly delivery metrics
- New Feature New campaign personalization tags, Campaign ID, Hashed Campaign ID, Campaign Name
- New Feature Pre-email delivery remote content fetch merge tag
- New Feature JSON custom field personalization
- New Feature Merge tag functions
- New Feature Log latest subscriber email activities

---

## v5.0.2

We have made plenty amount of improvements, fixed bugs, applied security updates and added new features in this new version.

#### Unified CLI Based Installation Tool

A straightforward command line installation tool that simplifies and speeds up the web-based installation process.

### Ability to hide "Coming Soon" features in the user area

![Ability to hide "Coming Soon" features.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/a12b74ce-2632-4126-8987-289aeaa84103/Untitled.png)

Ability to hide "Coming Soon" features.

Full control over "Coming soon" features and an option to hide them from the user area to avoid confusion.

#### Better User Management

![Number of users are displayed next to each user group.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/1edbb332-9cfd-4186-8357-e5b2e23cec11/Untitled.png)

Number of users are displayed next to each user group.

Easily manage user groups and instantly see the number of users in each group. Faster and easier user management with improved search filters and additional fields for user information.

![Users can be sorted.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/6e568697-0df4-4645-b8b3-cb1063f45669/Untitled.png)

Users can be sorted.

#### Email Campaign Cloning

![Clone and send a campaign with a single click.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/cc2aa78f-48b4-4878-8044-1beb6931345a/Untitled.png)

Clone and send a campaign with a single click.

Set up your campaign in minutes with the "Clone" feature that enables you to duplicate a draft email campaign.

#### Powerful Email Delivery Engine

A powerful new email send engine system with the capacity to handle 10 million+ email deliveries a day without system resource overload.

![Screenshot taken from PowerMTA dashboard.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/e62ec966-7d58-43c1-8401-1551a8f228f4/Untitled.png)

Screenshot taken from PowerMTA dashboard.

#### Daily Email Delivery Limit

![Limit the number of emails that can be sent every day.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5bb2d36f-ac59-4a14-b2cc-1b8f02f04141/Untitled.png)

Limit the number of emails that can be sent every day.

On top of monthly limit settings, limit the number of email deliveries users can send out daily.

#### Simplified Campaign Creation Process

![Enable simplified campaign create process for specific user groups.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3e78b448-9409-4bc4-8de0-f29334a053b9/Untitled.png)

Enable simplified campaign create process for specific user groups.

Create email campaigns in one step instead of five. A huge time saver, the new simplified campaign creation process gets you up and running in no time.

#### Multi-Role Sub Administrator Accounts

![Create sub-admin accounts with different permissions.](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/5b45d161-b2b9-4a6d-9dc3-c4144cfd2ca6/Untitled.png)

Create sub-admin accounts with different permissions.

Set up sub-admin accounts with different access permissions. Empower your team to manage your CDP.

#### Various Improvements, Bug Fixes and Security Patches

- Personalization support for `%RemoteContent=....%` merge tag. Send recipient data to your remote content source for more creative content personalization.
- Performance improvement for RSS-to-email campaigns.
- Enforced from email address feature reply-to issue fix. Users can now easily set "Reply to" email addresses on their email campaigns.
- Important security update for tracking links and preventing third-party phishing attacks.

---

## v5.0.1

We have made plenty amount of improvements, fixed bugs, applied security updates and added new features in this new version.

#### **Randomized Segment Audience**

![Randomized segment audiences](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/c37eb244-fb93-4355-a123-3f4596c9e453/Untitled.png)

Randomized segment audiences

You can set a segment audience size and randomize the target people matched by this segment. Every time you send an email campaign to this randomized segment, a different group of recipients matching the segment rule set will be picked.

#### Email Content Spinning

Content similarity check across ISP's and ESP's is becoming a big challenge for email marketers. Oempro's new "Email Content Spinning" feature will help you unify your email content quickly by setting spinning contents. Oempro will randomly pick one of these contents and personalize the email content. With a few spins, you can easily generate thousands of different content variations for your audience.

Here's an example email content spinning:

```html
...
<p>{{{Hey!|Hi There!|Welcome!}}} %Subscriber:FirstName%</p>
<p>In this episode, I will talk about {{{how to build habits just in a few days|how to change your life with new habits}}}
...
```

#### CTR Retention Cohort

![Keep an eye on your audience engagement](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/30370a2c-44a9-4349-887a-afb04b3fe4f9/Untitled.png)

Keep an eye on your audience engagement

Monitoring your email open rates (which is getting less accurate day by day) or CTR is good but what about your audience CTR engagement? This new email marketing metric will help you understand your audience reaction to your emails over time and run more optimized email campaigns.

#### Randomizer Merge Tags

Insert randomized strings and numbers into your email subject, content and links for sending more unique content to your audience.

```html
...
<p>Hi there,</p>
<p>Here's your unique case ID: %RANDOM:Number%-%RANDOM:String%</p>
...
```

#### JSON Custom Field Personalization Engine

In addition to the regular custom field personalization method, you can now inject a JSON data into the subscriber custom field and use this custom field to performan personalization based on JSON data.

```html
...
<p>Hi {{ Subscriber:CRMData.FirstName }},</p>
<p>You have purchased our software on {{ Subscriber:CRMData.PurchaseDate }}.</p>
...
```

#### Advanced Conditional Content Personalization

We have implemented a new conditional content personalization module in Oempro v5.0.0. This module will give you more flexibility when customizing the entire email layout based on subscriber data.

```html
...
{{ if Subscriber:FirstName }}
    <p>My name is {{ Subscriber:FirstName }} {{ Subscriber:LastName }}</p>
{{ else }}
    <p>I don't know what my name is</p>
{{ endif }}

{{ if Subscriber:CustomField18 == 'customer' }}
    <p>You are a Customer!</p>
{{ elseif Subscriber:CustomField18 == 'trial' }}
    <p>You are a trial User.</p>
{{ else }}
    <p>I don't know what you are.</p>
{{ endif }}

{{ unless age > 21 }}
    <p>You are too young.</p>
{{ elseunless age < 80 }}
    <p>You are to old...it'll kill ya!</p>
{{ else }}
    <p>Go ahead and drink!</p>
{{ endif }}
...
```

#### Drag-n-Drop Stripo.email Email Builder Integration

![Create beautiful and mobile friendly emails quickly](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/79b41e8d-7dac-435e-8fbb-8655e38455d6/Untitled.png)

Create beautiful and mobile friendly emails quickly

The well known drag-n-drop email builder Stripo is now 100% embedded into Octeth. Activate it by entering your Stripo API key and start using it inside your Octeth. Create beautiful mobile friendly emails in minutes.

#### Drag-n-Drop Unlayer.com Email Builder Integration

An easy-to-use drag-n-drop email builder Unlayer can be used inside Octeth. Activate it by entering your Unlayer API key and start creating beautiful mobile friendly emails inside Octeth.

#### Strict SpamAssassin Test Result Restrictions

Octeth has built-in integration with SpamAssassin. Starting from Octeth v5.0.1 release, you can restrict your users to send email camaigns if the SpamAssassin score is below a threshold.

#### Including;

- Campaign resend flow user experience improvement
- TLS crypto change
- Segment engine SQL improvements
- Oempro's frontend Docker container Apache version upgrade
- Subscribe/Unsubscribe from "ALL" lists event trigger for journeys
- Ability to rename audience export processes
- Conditional personalization improvements
- SMS marketing module support
- Email gateway module support
- On-demand SSL and reverse proxy module support
- Various bug fixes and security patches

#### What's Next?

Until the Oempro v6.0.0 major version release in 2023, we will be working on two version branches in 2022:

- v5.0.x
These minor versions will include bug fixes and security improvements based on user feedback and test group results. We plan releasing a v5.0.x minor version every few months in 2022 until the release of v5.1.0.
- v5.x.0
We plan releasing three v5.x versions in 2022 and each one of these minor versions will include a few new features which will improve the functionality of the software.
