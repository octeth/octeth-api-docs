---
layout: doc
title: What's New in Octeth v5.8.0
description: Release notes for Octeth v5.8.0 - Redesigned campaign creation, Caddy TLS, natural language segments, and legacy code removal
---

# What's New in Octeth v5.8.0

## Release Summary

Octeth v5.8.0 is a major release delivering a **redesigned campaign creation workflow**, **automatic TLS via Caddy proxy**, **natural language segment rules**, and a **significant legacy code cleanup**. This release includes 70 commits with 29 new features and 22 bug fixes over 43 days of development.

**Release Date:** February 15, 2026
**Development Period:** 43 days (January 3, 2026 - February 15, 2026)
**Upgrade Impact:** Medium (requires database migrations, ~10 minute downtime)
**Breaking Changes:** Yes (legacy code removed, ClickHouse upgraded, campaign edit page retired)

---

## Should You Upgrade?

| Priority | Audience | Reason |
|----------|----------|--------|
| 🔴 **URGENT** | Campaign managers | Redesigned campaign creation UI with advanced audience targeting |
| 🔴 **URGENT** | All installations | Security hardening: SQL injection prevention, Apache header removal |
| 🟡 **RECOMMENDED** | Sender domain users | Automatic TLS certificate provisioning via Caddy integration |
| 🟡 **RECOMMENDED** | Journey users | Multi-list triggers, delivery windows, email preview |
| 🟡 **RECOMMENDED** | Segment users | Natural language rule summaries and future date operators |
| 🟢 **BENEFICIAL** | System admins | ClickHouse upgrade, cluster preparation, new CLI tools |

---

## Table of Contents

[[toc]]

---

## Top New Features

### Simplified Campaign Create UI

**What's New:** Complete redesign of the campaign creation workflow with advanced audience targeting, real-time estimated recipients, and read-only mode for sent campaigns.

**Why It Matters:** Campaign creation is the most frequently used workflow in Octeth. The new UI reduces campaign setup time with inline audience targeting and provides real-time feedback on estimated recipient counts.

**Key Capabilities:**
- **Advanced Audience Targeting**: RulesJSONBundle support for building complex audience targeting rules directly in campaign creation
- **Estimated Recipients Widget**: Real-time estimated recipient count displayed during campaign setup, including API endpoint support
- **Read-Only Mode for Sent Campaigns**: Sent campaigns now open in a clean read-only view instead of the old edit page
- **UX Improvements**: Improved redirect flow, datepicker behavior, and read-only field cleanup

::: warning Campaign Edit Page Retired
The old campaign edit page has been removed. Sent campaigns now open in read-only mode through the new simplified UI. This is a breaking change for any workflows that relied on the old edit page URL patterns.
:::

---

### Caddy Link Proxy with On-Demand TLS

**What's New:** Automatic HTTPS certificate provisioning via Caddy reverse proxy integration for sender domains.

**Why It Matters:** Setting up TLS certificates for sender domains has historically been a manual and error-prone process. Caddy integration automates certificate provisioning and renewal, significantly reducing sender domain setup time.

**Key Capabilities:**
- **Automatic HTTPS Certificates**: On-demand TLS certificate provisioning for sender domains
- **Auto-Generated Verify Code**: Domain verification codes are now auto-generated during installation
- **Custom Subdomain & Tracking Prefix**: Support for custom subdomains and tracking prefixes on sender domains

**Configuration:**

Add the following to your `.oempro_env` file:

```bash
## Caddy Link Proxy Configuration (v5.8.0)
CADDY_DOMAIN_VERIFY_CODE=your-auto-generated-code
CADDY_ACME_EMAIL=admin@example.com
```

::: tip Automatic Setup
On fresh installations, the verify code is auto-generated. For existing installations, add the Caddy environment variables to `.oempro_env` to enable the feature.
:::

---

### Retry Failed Recipients

**What's New:** Ability to retry delivery to failed recipients for sent or failed campaigns without creating new campaigns.

**Why It Matters:** Previously, when recipients failed delivery, the only option was to create a new campaign targeting those specific subscribers. The retry mechanism allows re-sending to failed recipients directly from the campaign view.

---

### Natural Language Segment Rules

**What's New:** Segment rules are now displayed as human-readable natural language descriptions instead of technical rule syntax.

**Why It Matters:** Complex segment rules were difficult to understand at a glance. Natural language summaries make segment management accessible to non-technical users and reduce errors when building audience segments.

**Example:** Instead of seeing `CustomField:5 CONTAINS "enterprise"`, the rule displays as *"Custom field 'Company Size' contains 'enterprise'"*.

---

### Journey Builder Enhancements

**Multi-List Subscription Triggers:** Journey subscription triggers now support selecting multiple lists, allowing a single journey to activate when subscribers join any of the selected lists.

**Delivery Window Constraints:** The wait action now supports delivery window time constraints, ensuring journey emails are only sent during specified time windows for better engagement.

**Email Preview Button:** Added preview email functionality directly in the SendEmail action node, allowing journey builders to verify email content without leaving the builder.

---

### Future Date Segment Operators

**What's New:** Added future range and exact date offset operators for date-based segmentation.

**Why It Matters:** Enables proactive targeting such as "subscription expires in 30 days" or "birthday is within the next 7 days" without manual date calculations.

---

### New Admin & API Tools

- **Recipient Domain Stats API**: New API endpoint for recipient domain statistics
- **Database Stats CLI & API**: New `db:stats` CLI command and `admin.database.stats` API endpoint for quick database health overview
- **Upgrade CLI Command**: New `upgrade` command added to `octeth.sh` CLI tool
- **Delivery Server / User Group Cross-Reference**: Admin listings now show cross-reference between delivery servers and user groups

---

## Security Improvements

### ClickHouse SQL Escaping

**Vulnerability Fixed:** Improved SQL query escaping in ClickHouse operations to prevent malformed inserts and potential injection attacks.

**Impact:** Prevents potential data corruption or unauthorized access through malformed ClickHouse queries.

---

### Table Name Sanitization

**Enhancement:** Sanitized table names and partition IDs in `dropPartitionsInEventsTables()` to prevent SQL injection through table name manipulation.

---

### Apache Version Disclosure

**Enhancement:** Hidden Apache version from error pages and HTTP headers to reduce information disclosure to potential attackers.

---

### CampaignID Validation

**Vulnerability Fixed:** Validated CampaignID in gaclickregister plugin to prevent SQL syntax errors that could be exploited.

---

## Notable Bug Fixes

### Performance Fixes

- **N+1 Query in Campaigns API** - Fixed N+1 query problem in `campaigns.get` API for improved performance
- **Stuck Campaign Zero Recipients** - Detects stuck campaigns with 0 sent recipients in Sending status

### Segment & Subscriber Fixes

- **Segment Pagination Consistency** - Deterministic `RAND(seed)` ensures consistent results across segment pages
- **"Any Campaign" Segment Rules** - Rules with "Any Campaign" now work correctly when no campaigns exist
- **Global Custom Fields** - Fixed global custom fields breaking subscriber subscription flow
- **MergeTagAlias Validation** - Reserved subscriber field names now properly rejected as MergeTagAlias

### Journey Builder Fixes

- **Duplicate Journey Entry** - Prevented duplicate journey entry registration for active subscribers
- **Sender Domain Scoping** - Sender domain lookup in journey email sending now scoped by UserID

### UI/UX Fixes

- **Chart Line Colors** - Swapped chart line colors to correctly match legend icons
- **Anomaly Alert Styling** - Replaced inline styles with CSS classes for anomaly alerts

### Infrastructure Fixes

- **MySQL 8.0+ Compatibility** - Added `SET sql_mode` for MySQL 8.0+ installation compatibility
- **ClickHouse Retention** - Changed website events retention from infinite to 180 days
- **Env File Parsing** - Fixed support for parentheses in `.oempro_*_env` comment lines

---

## Performance Improvements

### N+1 Query Elimination

Fixed N+1 query problem in `campaigns.get` API endpoint, significantly reducing database queries when retrieving campaign lists.

### Deterministic Segment Sampling

Segment random sampling now uses deterministic `RAND(seed)` for consistent pagination. This ensures that browsing through segment pages shows consistent results instead of reshuffling subscribers on each page load.

### ClickHouse Upgrade

Updated ClickHouse image from 21.3.20.1 to 22.8 with improved query performance and stability.

### Primary Keys for Cluster Support

Added primary keys to tables missing them for database cluster compatibility, preparing the infrastructure for future horizontal scaling.

---

## Enhancements

- **Estimated Recipients in Campaign API** - Real-time estimated recipient count in campaign API and scheduled views
- **Campaign ID in Admin Reports** - Campaign ID shown alongside campaign name in admin reports
- **Seed List Exclusion** - Seed list deliveries excluded from campaign metrics, billing, and limits
- **Stuck Campaign High Failure Detection** - Stuck campaign monitor now detects campaigns with high failure rates
- **Health Check Logging** - System health check API endpoint now logs error responses
- **Default Features on Fresh Install** - SenderDomainManagement and SimplifiedCampaignCreateUI enabled by default

---

## Legacy Code Removal

This release includes a significant cleanup initiative removing years of accumulated legacy code:

- **ionCube Loader** - Removed all ionCube loader references from the codebase
- **Legacy PHP Frameworks** - Removed `includes/framework_1_7_1/` directory
- **Flash SWF References** - Removed all Flash/SWF file references from `assets/` directory
- **Call-Home License Checks** - Removed remote license verification and upgrade code
- **Obsolete Docker Configs** - Removed Docker configurations for Elasticsearch, HAProxy, Kibana, SSH, and PHP 7.2/7.4/8.2/8.3
- **Legacy Files** - Removed `cron.php`, orphaned `package-lock.json`, legacy directories (`_workshop/`, `e2e/`, `extras/`)

::: danger Breaking Change
Installations relying on ionCube-encoded files, the old `cron.php`, or PHP 7.2/7.4/8.2/8.3 Docker configs will not work after upgrading. Only PHP 5.6 and PHP 8.1 remain supported.
:::

---

## Complete Change List

<details>
<summary><strong>Click to expand full changelog</strong></summary>

### Features (29)
1. **Simplified Campaign Create UI** - Complete redesign with audience targeting (#1606)
2. **Caddy Link Proxy** - On-demand TLS certificate provisioning (#1531)
3. **Retry Failed Recipients** - Re-send to failed subscribers (#1561)
4. **Multi-List Journey Triggers** - Multiple list support for subscription triggers (#1519)
5. **Delivery Window Constraints** - Wait action time constraints (#1518)
6. **Journey Email Preview** - Preview in SendEmail action (#1546)
7. **Natural Language Segment Rules** - Human-readable rule summaries (#1537)
8. **Future Date Operators** - Future range and exact date offset (#1557)
9. **Deterministic Random Sampling** - Consistent segment pagination (#1610)
10. **Recipient Domain Stats API** - New API endpoint (#1564)
11. **Database Stats CLI & API** - db:stats command (#1517)
12. **Upgrade CLI Command** - New upgrade command (#1534)
13. **Estimated Recipients Widget** - Real-time count in campaign setup (#1605)
14. **Campaign ID in Admin Reports** - ID shown alongside name (#1521)
15. **Seed List Exclusion** - Excluded from metrics and billing (#1551)
16. **Delivery Server / User Group Cross-Reference** - Admin listings (#1529)
17. **Stuck Campaign High Failure Detection** - High failure rate detection (#1565)
18. **Health Check Logging** - Error response logging (#1549)
19. **Custom Subdomain & Tracking Prefix** - Sender domain support (#1560)
20. **Default Features on Fresh Install** - SenderDomainManagement enabled (#1548)
21. **ClickHouse Upgrade** - Updated to 22.8
22. **Primary Keys for Cluster Support** - Database cluster preparation (#1544)
23. **Scheduled Campaign Enhancements** - Time remaining display (#1522)
24. **Advanced Audience Targeting** - RulesJSONBundle support (#1606)
25. **Read-Only Sent Campaigns** - New read-only campaign view (#1606)
26. **Auto-Generated Verify Code** - Domain verification (#1531)
27. **Segment Random Enforcement** - Random enforcement in browse paths (#1550)
28. **Date Range Auto-Apply Removal** - Journey browse improvement (#1543)
29. **Version 5.8.0 Upgrade Function** - Automated upgrade process

### Bug Fixes (22)
1. **N+1 Query Elimination** - campaigns.get API optimization (#1601)
2. **Stuck Campaign Zero Recipients** - Zero sent detection (#1520)
3. **Segment Pagination Consistency** - Deterministic RAND(seed) (#1610)
4. **"Any Campaign" Rules** - No campaigns edge case (#1582)
5. **Global Custom Fields** - Subscription flow fix (#1538)
6. **MergeTagAlias Validation** - Reserved names rejection (#1533)
7. **Duplicate Journey Entry** - Prevention for active subscribers (#1525)
8. **Sender Domain Scoping** - UserID scoping (#1523)
9. **Chart Line Colors** - Legend icon matching (#1569)
10. **MySQL 8.0+ Compatibility** - sql_mode fix (#1558)
11. **ClickHouse Retention** - 180-day retention (#1568)
12. **Env File Parsing** - Parentheses support (#1526)
13. **Anomaly Alert Styling** - CSS class replacement (#1614)
14. **Seed List Metrics** - Excluded from billing (#1551)
15. **Segment Random Enforcement** - Browse and filter paths (#1550)
16. **Date Range Auto-Apply** - Journey browse fix (#1543)
17. **MergeTagAlias UI** - Validation and button placement (#1533)
18. **Campaign Redirect Flow** - Improved redirect behavior (#1606)
19. **Datepicker Behavior** - UI improvements (#1606)
20. **Read-Only Field Cleanup** - Sent campaign display (#1606)
21. **DNS Template Entries** - Updated tracking merge character
22. **Favicon Update** - Updated favicon

### Security (4)
1. **ClickHouse SQL Escaping** - Injection prevention (#1535)
2. **Table Name Sanitization** - Partition ID sanitization
3. **Apache Version Disclosure** - Header removal (#1595)
4. **CampaignID Validation** - Plugin SQL prevention (#1547)

### Legacy Code Removal (14)
1. **ionCube Loader** - All references removed (#1609)
2. **Legacy PHP Frameworks** - framework_1_7_1/ removed (#1609)
3. **Flash SWF References** - All SWF references removed (#1609)
4. **Call-Home License Checks** - Remote verification removed (#1609)
5. **Obsolete Docker Configs** - ES, HAProxy, Kibana, SSH removed (#1609)
6. **PHP Version Configs** - PHP 7.2/7.4/8.2/8.3 removed (#1609)
7. **Legacy Campaign Data** - RecipientDomains purged (#1563)
8. **cron.php** - Removed (#1609)
9. **package-lock.json** - Orphaned file removed (#1609)
10. **Legacy Directories** - _workshop/, e2e/, extras/ removed (#1609)
11. **DNS Template Entries** - Unused entries commented out
12. **Gitignore Updates** - Additional exclusions
13. **Favicon & htaccess** - Updated and cleaned (#1609)
14. **ClickHouse Image** - Upgraded from 21.3.20.1 to 22.8

</details>

---

## Upgrade Guide

### Prerequisites

Before upgrading, ensure you have:
- [ ] Access to server with root/sudo privileges
- [ ] Current database backup
- [ ] Configuration file backup
- [ ] At least 10 minutes for maintenance window
- [ ] Reviewed breaking changes (legacy code removal, ClickHouse upgrade)
- [ ] Verified ClickHouse 22.8 compatibility

### Step-by-Step Upgrade Process

#### 1. Backup Everything

**Backup database:**
```bash
./cli/octeth.sh db:backup
```

**Expected output:**
```
Creating database backup...
Backup saved to: /opt/octeth/backups/oempro_20260215_120000.sql.gz
```

**Backup configuration:**
```bash
cp .oempro_env .oempro_env.backup.$(date +%Y%m%d)
```

#### 2. Add New Environment Variables

Add Caddy configuration to `.oempro_env` if using the link proxy:

```bash
## Caddy Link Proxy Configuration (v5.8.0)
CADDY_DOMAIN_VERIFY_CODE=your-verify-code
CADDY_ACME_EMAIL=admin@example.com
```

::: tip Optional Configuration
These variables are only needed if using the Caddy link proxy feature. Existing link proxy configurations continue to work.
:::

#### 3. Pull Latest Docker Images

```bash
# Pull latest container images
./cli/octeth.sh docker:pull

# Restart containers with new images
./cli/octeth.sh docker:up
```

**Expected downtime:** 5-10 minutes while containers restart.

#### 4. Run Database Migrations

```bash
docker exec oempro_app bash -c "cd /var/www/html/cli/ && php5.6 dbmigrator.php migrate"
```

**What this does:**
- Adds primary keys to tables for cluster support
- Removes legacy campaign data columns
- Applies MergeTagAlias validation constraints

#### 5. Run Upgrade Command

```bash
./cli/octeth.sh upgrade
```

#### 6. Clear Application Cache

```bash
./cli/octeth.sh cache:flush
```

#### 7. Verify Installation

```bash
# Check Docker container health
./cli/octeth.sh docker:status

# Verify backend processes
./cli/octeth.sh backend:status

# Test database stats command
./cli/octeth.sh db:stats

# Verify version
./cli/octeth.sh version
```

**Expected results:**
- All containers show "healthy" status
- Backend workers are running
- Database stats command returns results
- Version shows v5.8.0

---

### Troubleshooting

<details>
<summary><strong>ClickHouse upgrade issues</strong></summary>

**Symptom:** ClickHouse container fails to start or shows errors after upgrade.

**Solution:**
1. Check ClickHouse logs for compatibility issues
2. Verify data directory permissions
3. Review ClickHouse configuration for deprecated settings

```bash
# View ClickHouse logs
docker logs oempro_clickhouse

# Check ClickHouse health
docker exec oempro_clickhouse clickhouse-client -q "SELECT version()"
```
</details>

<details>
<summary><strong>Database migration fails</strong></summary>

**Symptom:** Migration script returns errors about primary keys or column removal.

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
<summary><strong>Campaign edit page not found</strong></summary>

**Symptom:** Old campaign edit URLs return 404 errors.

**Solution:** The old campaign edit page has been retired. Sent campaigns now open in read-only mode through the new simplified UI. Update any bookmarks or external links that referenced the old edit page.
</details>

---

### Rollback Procedure

If you need to rollback to v5.7.3:

::: danger Data Loss Warning
Rolling back requires restoring the database backup. Any data created after the upgrade will be lost. The ClickHouse downgrade from 22.8 to 21.3.20.1 may also require data directory cleanup. Only rollback if absolutely necessary.
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
git checkout v5.7.3

# 5. Restart containers
./cli/octeth.sh docker:up
```

---

## Migration Notes

### Database Changes

**Primary keys added:**
- Several tables now have primary keys added for cluster support

**Columns removed:**
- `RecipientDomains` and `AggregatedQueuedDomains` from campaigns table

**MergeTagAlias validation:**
- Reserved field names are now enforced; existing aliases using reserved names may need updating

**Automatic migration:** All changes applied automatically during upgrade.

### Configuration Changes

**New environment variables** (optional):

```bash
CADDY_DOMAIN_VERIFY_CODE=  # Domain verification code for Caddy
CADDY_ACME_EMAIL=  # ACME email for certificate provisioning
```

### Breaking Changes

**Legacy code removed:**
- ionCube loader support removed
- Call-home license checks removed
- PHP 7.2/7.4/8.2/8.3 Docker configs removed (only PHP 5.6 and PHP 8.1 remain)
- Legacy `cron.php` removed (use backend supervisor processes)
- Flash SWF assets removed

**ClickHouse version:**
- Upgraded from 21.3.20.1 to 22.8. Verify compatibility before upgrading.

**Campaign edit page retired:**
- The old campaign edit page has been removed. Sent campaigns now open in read-only mode.

### API Changes

**No breaking changes** - All existing API endpoints remain compatible.

**New endpoints:**
- `admin.database.stats` - Database statistics
- Recipient domain stats endpoint

**Enhanced features:**
- Estimated recipient count in campaign API
- Campaign ID in admin report responses

---

## Additional Resources

- [User Guide](https://help.octeth.com/)
- [Octeth Help Portal](https://dev.octeth.com/)
- [GitHub Repository](https://github.com/octeth/octeth)
- [Support Portal](https://my.octeth.com/)

## Support

Need help with the upgrade?

- **Email:** support@octeth.com
- **Client Area:** https://my.octeth.com/
- **Help Portal:** https://help.octeth.com/

---

## Previous Versions

## v5.7.3

::: tip Maintenance Release
Focused release emphasizing operational reliability, security hardening, and campaign monitoring capabilities.
:::

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

## Top New Features

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

---

### Enhanced Email Validation for Journeys

**What's New:** Comprehensive validation and trimming for all email fields in journey actions.

**Why It Matters:** A single trailing space in an email address can cause journey email delivery to fail. This enhancement prevents such failures and provides clear diagnostic information.

::: warning Important
This fix is critical for installations using journey email actions with Reply-To addresses. Update immediately if experiencing "Reply-To email address is invalid" errors.
:::

---

### MySQL Slow Query Analysis Tool

**What's New:** New CLI command for analyzing MySQL slow query log directly from the command line.

```bash
# View last 50 slow queries (default)
./cli/octeth.sh mysql:slow-log

# View last 100 slow queries
./cli/octeth.sh mysql:slow-log --lines=100
```

---

## Security Improvements

- **Current Password Requirement** - Added current password validation when users change passwords
- **XSS Prevention** - Whitelist validation for DatePreset parameter

---

## Notable Bug Fixes

- **Journey Email Reply-To Validation** - Fixed trailing space validation errors
- **Installation Theme and Permissions** - Resolved theme selection and permission issues
- **Campaign Report Chart Overlap** - Adjusted chart positioning
- **Invalid Custom Fields During Subscription** - Skip invalid fields instead of failing

---

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

## Top New Features

- **Multi-Tag Journey Triggers** - Trigger journeys when subscribers have multiple specific tags simultaneously
- **Advanced Campaign Reporting Dashboard** - Admin campaign report page with advanced filtering and real-time metrics
- **API Documentation Generation System** - Automated documentation generation for all API endpoints

## Critical Security Fixes

- **SQL Injection Prevention** - Fixed SQL injection vulnerabilities in order parameter validation, tag trigger endpoints, and journey bulk operations
- **XSS Prevention** - Enhanced cross-site scripting prevention in admin views and controllers
- **Authentication Token Management** - AuthToken regeneration on password changes with improved token validation

## Performance Improvements

- **Redis Entity Caching** - Comprehensive caching for themes, delivery servers, user groups, custom fields, and lists
- **Campaign Monitoring API Optimization** - Optimized endpoints with auto-interval for velocity calculations
- **Database Query Improvements** - SQL precedence fixes, Redis SCAN replacement, queue table caching

---

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

### New Features

- **One-Click Sender Domain DNS Record Setup:** Simplifies the process of setting up DNS records for sender domains.
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

### Enhancement

- **Website Event Tracking Improvements** - Improved the supervisor process for the website event identifier to prevent hanging, ensuring that no events are lost.

### New Feature

- **Cleanify Plug-In Update** - Updated the Cleanify Plug-In to enhance functionality.
- **Enable ClickHouse Native Access** - Enabled direct access to ClickHouse native port 9000.

### Bug Fix

- **Refactor Email Bounce Handling** - Refactored the logic for handling email bounces to improve reliability and performance.

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.3

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

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.2

### New Features

- **New Journey Triggers**: Automate email campaigns with newly added journey triggers. (#642, #670)
- **Automated HAProxy SSL Certificate Renewal**: Streamline SSL management with the automated renewal process. (#668)
- **Phone Verification on Signup**: Enhance security by requiring phone verification when signing up to send emails. (#675)

### Enhancements

- **Improved Email Whitelist Functionality**: More control over email sending with improved whitelist functionality.
- **Filter Subscribers by Failed Delivery**: Filter and manage subscribers based on failed campaign delivery attempts. (#667)
- **Improved Email Gateway Personalization**: Updated personalization options in the email gateway. (#665)
- **Sort Campaigns in Campaign.Get API**: Sort campaigns based on scheduled time through the Campaign.Get API endpoint. (#658, #655)
- **Improved Link Redirection Security Checks**: Enhanced security measures for link redirection within emails. (#660)

### Bug Fixes

- **Fixed Campaign Copy Feature**: Resolved an issue where the `RulesJsonBundle` parameter wasn't copied when using the Campaign.Copy API endpoint. (#650)
- **Fixed Email Import Functionality**: Addressed a bug that prevented importing a single email address without a newline. (#644)

### Security Patch

- **Update to Email Address Suppression List**: Implemented a whitelist feature for the email address suppression list. (#645)

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.1

### New Features

- **Email Previews Customization**: Pass `FromName` and `FromEmailAddress` for email previews for more personalized previewing.
- **Revenue Calculation**: Track and analyze campaign performance with revenue calculation feature.

### Enhancements

- **System Components Check**: Improved system stability with thorough component checking.
- **Sub Admin User Management**: Sub admins can view all users in impersonated user list.
- **Drip Importer**: Enhanced functionality for better data handling.
- **Campaign Queue Maintenance**: Automatic deletion of old campaign queue tables via cron job.
- **Upgrade Tool Improvement**: Preserves custom changes to `config.inc.php`.

### Bug Fixes

- **Vendor Directories**: Removed unnecessary vendor directories.
- **Clone Journey Endpoint**: Fixed journey cloning functionality.
- **Subscriber.Import API Validation**: Resolved Drip-related validation errors.

For more details, visit our [Help Portal](https://help.octeth.com/whats-new/).

---

## v5.5.0

### New Features

- **Campaigns.Get API Endpoint Enhancements**: Support for `CampaignStatus=Scheduled` parameter. [#559]
- **Campaign Activity Subscribers**: Get list of subscribers for specific email campaign activities. [#550]
- **Website Event Segmentation**: Filter and segment subscribers based on website interactions. [#502, #531]
- **Customizable Website Activity Tracker**: Customization support for web activity tracking script. [#538]
- **Journey Email Action Metrics**: Performance metrics for email actions within journeys. [#545]
- **Email Gateway ListID and SubscriberID Support**: Enhanced support for ListID and SubscriberID in email gateways. [#544]
- **User API Key Management**: Endpoints for managing user API keys. [#450]
- **New Subscriber API End-Points**: Create and Update endpoints for subscriber management. [#467]
- **SMS Connector for MessageBird**: SMS communication channel integration. [#411]
- **Antivirus Plugin**: Email attachment virus scanning.
- **Mailchimp Import Integration**: Import integration for Mailchimp data.
- **ActiveCampaign Import Tool**: Import tool for ActiveCampaign migration.

### Enhancements

- **SMTP Error Messages**: Improved error handling for clearer communication.
- **Performance Improvements**: System-wide performance improvements including query and campaign delivery optimizations.
- **API Notation Changes**: Standardized request and response notation.
- **Security Patches**: Connection limiter for email gateway and ACL rules updates.

### Bug Fixes

- **Multiple RSS Feeds Conflict**: Fixed conflict issue with multiple RSS feeds. [#549]
- **SMTP Password Optionality**: Made SMTP password optional as intended. [#491]
- **Segment Count Expiration**: Updated expiration time to 30 seconds. [#547]
- **Journey Action Subscribers API**: Optimized API endpoint. [#537]
- **Email Recipient Handling**: Updated recipient handling and credit calculation. [#509]

---

## v5.1.1

#### Octeth v5.1.1 Release Highlights

- Enhancement Segment engine minor performance improvements
- New Feature Ability to setup custom email headers (with personalization support) for each user account
- New Feature Link proxy add-on
- New Feature A brand new IMAP powered inbound bounce and list-unsubscribe MX server add-on
- Bug Fix Various bug fixes

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
- New Feature Sender Domain Management section for the user area
- New Feature Backend daemon processes and cron jobs are now being managed by separate containers for easier scaling
- New Feature Fallback personalization in case a custom field value is empty for the recipient

---

## v5.0.3

#### Octeth v5.0.3 Release Highlights

- Enhancement Delivery server list ordering in user groups
- Enhancement Improved personalization
- Enhancement Improved campaign KPI metrics on the campaign browse page
- Enhancement Display timezone for scheduled campaigns
- Enhancement Campaign schedule minute time intervals are every 5 minutes
- Enhancement IMAP based hard bounce and FBL processing module
- Enhancement Ability to search for a user ID
- Enhancement Display opt-in pending subscribers count on the list dashboard
- Enhancement POST method support for inbound webhooks
- Enhancement User's first and last names are optional, company name can be used
- New Feature %MFROMDomain% merge tag support for email's from header
- New Feature System wide daily/weekly/monthly/yearly delivery metrics
- New Feature New campaign personalization tags, Campaign ID, Hashed Campaign ID, Campaign Name
- New Feature Pre-email delivery remote content fetch merge tag
- New Feature JSON custom field personalization
- New Feature Merge tag functions
- New Feature Log latest subscriber email activities

---

## v5.0.2

### New Features

- **CLI Installation Tool** - Command line installation tool for simplified setup
- **Email Campaign Cloning** - Clone feature for duplicating draft email campaigns
- **Powerful Delivery Engine** - Enhanced send engine with capacity for 10 million+ daily deliveries
- **Daily Delivery Limit** - Set daily email delivery limits on top of monthly limits
- **Simplified Campaign Creation** - One-step campaign creation process
- **Multi-Role Sub Admins** - Sub-administrator accounts with different access permissions

### Enhancements

- **User Management** - Improved user group management with user counts, search filters, and sorting
- **RemoteContent Personalization** - Send recipient data to remote content sources
- **RSS Campaign Performance** - Performance improvements for RSS-to-email campaigns

### Bug Fixes

- **Reply-To Address** - Fixed enforced from email address feature reply-to issue

### Security Patches

- **Tracking Link Security** - Security update for tracking links to prevent third-party phishing attacks

---

## v5.0.1

### New Features

- **Randomized Segment Audience** - Set segment audience size and randomize target recipients
- **Email Content Spinning** - Generate content variations using spinning syntax
- **CTR Retention Cohort** - Track audience CTR engagement over time
- **Randomizer Merge Tags** - Insert randomized strings and numbers for unique content
- **JSON Custom Field Personalization** - Inject and use JSON data in custom fields
- **Conditional Content Personalization** - Flexible email layout customization based on subscriber data
- **Stripo Email Builder** - Drag-and-drop Stripo.email builder integration
- **Unlayer Email Builder** - Drag-and-drop Unlayer.com builder integration
- **SpamAssassin Restrictions** - Restrict campaigns based on SpamAssassin score threshold
- **SMS Marketing Module** - SMS communication channel support
- **Email Gateway Module** - Enhanced email gateway capabilities
- **SSL Reverse Proxy Module** - On-demand SSL and reverse proxy support

### Enhancements

- Campaign resend flow user experience improvement
- TLS crypto change
- Segment engine SQL improvements
- Docker container Apache version upgrade
- Subscribe/Unsubscribe from ALL lists event trigger for journeys
- Ability to rename audience export processes
- Conditional personalization improvements
