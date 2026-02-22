---
layout: doc
title: Octeth Changelog
description: Complete release history for all Octeth versions - features, improvements, and bug fixes
---

# Octeth Changelog

This document tracks the complete release history of Octeth, including new features, enhancements, bug fixes, security patches, and deprecations for each version. Use this changelog to understand what changed between releases and determine when to upgrade your installation.

## v5.8.1

### Release Summary

Release in progress. Changelog will be updated upon release.

### New Features

- (To be documented)

### Enhancements

- (To be documented)

### Bug Fixes

- (To be documented)

### Security Patches

- (To be documented)

### Deprecations

None

## v5.8.0

### Release Summary

Released February 15, 2026 after 43 days of development. Major release featuring redesigned campaign creation, automatic TLS via Caddy proxy, natural language segment rules, and significant legacy code removal.

### New Features

- **Simplified Campaign Create UI** - Complete redesign with advanced audience targeting, estimated recipients widget, and read-only mode for sent campaigns
- **Caddy Link Proxy with On-Demand TLS** - Automatic HTTPS certificate provisioning via Caddy reverse proxy for sender domains
- **Retry Failed Recipients** - Ability to retry delivery to failed recipients for sent or failed campaigns
- **Multi-List Journey Triggers** - Journey subscription triggers now support selecting multiple lists
- **Delivery Window Constraints** - Journey wait action supports delivery window time constraints
- **Journey Email Preview** - Preview email functionality directly in SendEmail action node
- **Natural Language Segment Rules** - Segment rules displayed as human-readable natural language descriptions
- **Future Date Segment Operators** - Future range and exact date offset operators for date-based segmentation
- **Recipient Domain Stats API** - New API endpoint for recipient domain statistics
- **Database Stats CLI & API** - New db:stats CLI command and admin.database.stats API endpoint
- **Upgrade CLI Command** - New upgrade command added to octeth.sh CLI tool

### Enhancements

- **Estimated Recipients in Campaign API** - Real-time estimated recipient count in campaign API and scheduled views
- **Campaign ID in Admin Reports** - Campaign ID shown alongside campaign name in admin reports
- **Seed List Exclusion** - Seed list deliveries excluded from campaign metrics, billing, and limits
- **Delivery Server / User Group Cross-Reference** - Admin listings show cross-reference between servers and groups
- **Stuck Campaign High Failure Detection** - Stuck campaign monitor detects campaigns with high failure rates
- **Health Check Logging** - System health check API endpoint now logs error responses
- **Custom Subdomain & Tracking Prefix** - Support for custom subdomains and tracking prefixes on sender domains
- **Deterministic Random Sampling** - Segment random sampling uses deterministic RAND(seed) for consistent pagination
- **Default Features on Fresh Install** - SenderDomainManagement and SimplifiedCampaignCreateUI enabled by default
- **ClickHouse Upgrade** - Updated ClickHouse image from 21.3.20.1 to 22.8
- **Primary Keys for Cluster Support** - Added primary keys to tables missing them for database cluster compatibility

### Bug Fixes

- **N+1 Query in Campaigns API** - Fixed N+1 query problem in campaigns.get API for improved performance
- **Stuck Campaign Zero Recipients** - Detects stuck campaigns with 0 sent recipients in Sending status
- **Segment Pagination Consistency** - Deterministic RAND(seed) ensures consistent results across segment pages
- **"Any Campaign" Segment Rules** - Rules with "Any Campaign" now work correctly when no campaigns exist
- **Global Custom Fields** - Fixed global custom fields breaking subscriber subscription flow
- **MergeTagAlias Validation** - Reserved subscriber field names properly rejected as MergeTagAlias
- **Duplicate Journey Entry** - Prevented duplicate journey entry registration for active subscribers
- **Sender Domain Scoping** - Sender domain lookup in journey email sending scoped by UserID
- **Chart Line Colors** - Swapped chart line colors to correctly match legend icons
- **MySQL 8.0+ Compatibility** - Added SET sql_mode for MySQL 8.0+ installation compatibility
- **ClickHouse Retention** - Changed website events retention from infinite to 180 days
- **Env File Parsing** - Fixed support for parentheses in .oempro_*_env comment lines

### Security Patches

- Various security improvements and fixes

### Deprecations

- **ionCube Loader** - Removed all ionCube loader references
- **Legacy PHP Frameworks** - Removed includes/framework_1_7_1/ directory
- **Flash SWF References** - Removed all Flash/SWF file references
- **Obsolete Docker Configs** - Removed Docker configs for Elasticsearch, HAProxy, Kibana, SSH, and PHP 7.2/7.4/8.2/8.3
- **Legacy Files** - Removed cron.php, orphaned package-lock.json, and legacy directories

## v5.7.3

### Release Summary

Released January 3, 2026. Maintenance release focused on campaign monitoring, email validation fixes, and security hardening.

### New Features

- **Stuck Campaign Detector** - Automated detection and recovery system for campaigns stuck due to worker failures with webhook notifications and admin UI management
- **Enhanced Email Validation for Journeys** - Comprehensive validation and trimming for all email fields in journey actions to prevent delivery failures from whitespace issues
- **MySQL Slow Query Analysis Tool** - New CLI command for analyzing MySQL slow query log directly from command line

### Enhancements

- **Campaign Report UI** - Better scheduled campaign display with improved metrics visibility and increased column widths for Recipients/Delivered and Open/Click Rate
- **Log Management** - Enhanced logs:reset command now includes daily error logs and MySQL slow query log
- **Link Click Performance** - Added composite index on oempro_link_stats table for faster deduplication queries in large campaigns

### Bug Fixes

- **Journey Email Reply-To Validation** - Fixed validation errors caused by trailing whitespace in email addresses
- **Installation Theme and Permissions** - Resolved theme selection errors and file permission issues during fresh installations
- **Campaign Report Chart Overlap** - Adjusted chart positioning to prevent overlap with Scheduled link
- **Invalid Custom Fields During Subscription** - Added validation to skip invalid custom fields instead of failing entire subscription
- **Campaign Report Empty State** - Removed CREATE CAMPAIGN button from admin campaign report and improved Octeth Plug-Ins empty state messaging

### Security Patches

- **Current Password Requirement** - Added current password validation when users change passwords to prevent unauthorized changes if session is compromised
- **XSS Prevention** - Implemented whitelist validation for DatePreset parameter to prevent cross-site scripting attacks via URL parameters

### Deprecations

None

## v5.7.2

### Release Summary

Released December 29, 2025. Major release with multi-tag journey triggers, advanced campaign reporting, test database isolation, and critical SQL injection fixes.

### New Features

- **Multi-Tag Journey Triggers** - Trigger journeys when subscribers have multiple specific tags simultaneously for sophisticated automation workflows
- **Advanced Campaign Reporting Dashboard** - Admin campaign report page with advanced filtering, real-time velocity metrics, and batch statistics
- **API Documentation Generation System** - Automated documentation generation for all API endpoints integrated into development workflow
- **Journey Trigger Rate Limiting** - Prevents system overload from excessive journey triggers
- **Test Database Isolation** - Complete separation of test and production databases for safer development with automated setup
- **Granular MySQL Query Logging** - Per-request/process MySQL query logging for detailed debugging
- **Message-ID Header Storage** - Email threading support through Message-ID header storage
- **User-Level Sender Settings** - Per-user configuration for sender settings

### Enhancements

- **Redis Entity Caching** - Comprehensive caching for themes, delivery servers, user groups, custom fields, and lists with EntityCache pattern
- **Campaign Monitoring API** - Optimized endpoints with auto-interval for velocity calculations and batch status improvements
- **Database Performance** - Composite index on Journeys table, SQL precedence bug fixes, Redis KEYS replaced with SCAN for better performance
- **MySQL Connection Health** - Health checks in workers to prevent stale connections
- **Queue Table Caching** - Queue table existence caching for improved performance
- **Subscriber Tags API** - Bulk operations support for subscriber tags
- **Segment Retrieval Optimization** - SegmentID filtering for better performance
- **Journey API** - Bulk operations with improved error handling and proper error codes
- **Error Code Standardization** - Standardized ErrorCode field across API responses
- **CLI Modularization** - CLI refactored into modular structure for better maintainability
- **Plugin Hook Reference** - Complete documentation for plugin hook system
- **Config Parameter Standardization** - Unified configuration parameter naming
- **Order Parameter Validation** - Centralized validation for orderfield/ordertype parameters
- **Form Handler Refactoring** - Improved form handling architecture
- **Enhanced Campaign Pause** - Improved logic for pausing campaigns including Ready status
- **Docker Compose** - Support for docker-compose.override.yml with improved health checks and dynamic SendEngine container discovery

### Bug Fixes

- **Campaign Pause Logic** - Fixed ability to pause campaigns when status is Ready
- **Orphaned Workers** - Workers now properly terminated when campaign is deleted
- **Memory Exhaustion** - Fixed memory issues when storing campaign recipient domains
- **SMTP Error Handling** - Improved error message handling and logging
- **Delivery Worker Blocking** - Prevented workers from blocking on stdout
- **Website Event Triggers** - Support for both trigger format types
- **Case-Insensitive Triggers** - Fixed comparison for trigger types
- **Journey Validation** - Comprehensive validation for tags, lists, and parameters
- **Disabled Journey Filtering** - SQL-level filtering for better performance
- **Log File Permissions** - Resolved conflicts between Apache and root processes
- **XDebug Default** - XDebug now disabled by default for better performance
- **AuthToken Synchronization** - Multiple fixes for token regeneration and sync issues between sessions
- **Laravel Test Isolation** - Resolved phpdotenv configuration conflicts
- **Double JSON Encoding** - Fixed encoding issues in API responses
- **Array Key Preservation** - Fixed associative array key preservation issues
- **Tag Ownership Validation** - Added proper validation for tag ownership
- **404 Error Handling** - Improved handling of not found errors
- **PHP 5.6 Compatibility** - Various compatibility fixes for PHP 5.6
- **Docker Buildx** - Fixed manifest creation for multi-platform builds
- **SendEngine Discovery** - Fixed container discovery for SendEngine

### Security Patches

- **SQL Injection Prevention** - Fixed SQL injection vulnerabilities in order parameter validation across all API endpoints, tag trigger endpoints, and journey bulk operations
- **XSS Prevention** - Enhanced cross-site scripting prevention in admin views and controllers with proper input escaping
- **Authentication Token Management** - AuthToken now regenerates on password changes with improved token validation and sync

### Deprecations

- **HAProxy v2.2.32** - Upgraded to v3.3.1 with improved security features, better performance and updated configuration options

## v5.7.1

### Release Summary

Released December 4, 2025. Major release with journey builder enhancements, Google Postmaster Tools integration, and comprehensive system performance optimizations.

### New Features

- **Journey Decision Nodes** - Advanced conditional logic and branching with nested decision support
- **Send Email Actions** - Complete email action implementation with template selection and sender configuration
- **Multiple Journey Triggers** - EmailOpen, EmailLinkClick, CustomFieldValueChanged, JourneyCompleted, and Untag trigger support
- **Multiple Journey Enrollments** - Allow contacts to enroll in the same journey multiple times
- **Journey Statistics Screen** - Comprehensive journey analytics and performance tracking dashboard
- **Journey Activity Tracking** - Detailed execution tracking with 95% database load reduction
- **Journey Copy/Clone** - Clone entire journeys with proper action ID handling
- **Node Cloning** - Duplicate individual journey nodes within the builder
- **Google Postmaster Tools Integration** - Complete OAuth flow, data collection, automated monitoring with analytics dashboard
- **Automated Campaign Reports** - Schedule campaign reports to be generated and delivered automatically
- **Auto-Resend Campaigns** - Automated follow-up campaigns targeting non-openers
- **Email Template Preview** - Preview templates without associating them with lists or campaigns
- **Email Cloning** - Clone and resend functionality for existing emails
- **Custom Email Headers** - Journey/Action merge tag support in email headers
- **Campaign ISP/Domain Reports** - Normalized reporting table for optimized ISP and domain analytics

### Enhancements

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
- **Enhanced Campaign Metrics** - Improved campaign performance display and tracking
- **Drag-and-Drop Improvements** - Enhanced drag-and-move functionality in journey builder

### Bug Fixes

91 bugs fixed including performance improvements, UI/UX fixes, and system stability enhancements.

### Security Patches

Security enhancements for Google Postmaster Tools OAuth handling and validation.

### Deprecations

None

## v5.7.0

### Release Summary

Released December 1, 2025. Infrastructure release focused on performance optimization, database improvements, and scalability enhancements.

### New Features

None

### Enhancements

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

### Bug Fixes

62 features added, 91 bugs fixed, and 23 performance enhancements implemented.

### Security Patches

None

### Deprecations

None

## v5.6.0

### Release Summary

Major release featuring A/B testing, campaign auto-resend functionality, Event API, and MySQL 8.0 upgrade.

### New Features

- **A/B Testing** - Email campaign A/B testing with automatic winner selection
- **Campaign Auto-Resend** - Automated follow-up campaigns targeting non-openers with customizable settings
- **Event API** - Custom event tracking and subscriber behavior monitoring
- **Delete Subscriber Action** - Journey action for automated list management
- **Email-Level Controls** - Granular control over open tracking, link tracking, and UTM parameters
- **Custom Code Plugin** - Platform extensibility through custom code
- **User Overall Stats API** - Comprehensive reporting endpoint for user statistics
- **Website Event Personalization** - Personalize journey emails using website event data
- **Journey Webhook Improvements** - Enhanced security options for webhook actions
- **Custom Field Unique Identifier** - Flag for better subscriber tracking

### Enhancements

- **MySQL 8.0 Upgrade** - Upgraded from MySQL 5.7 to 8.0 for improved performance and security
- **UTF8MB4 Support** - Complete emoji and special character compatibility
- **Extended Session Lifetime** - PHP session lifetime extended to 30 days
- **Database Migrator Tool** - Improved schema management capabilities
- **Error Logging** - Enhanced error logging and monitoring
- **Revenue Tracking** - Improved revenue tracking and attribution
- **Website Event Tracker** - Updates with CDN support
- **Handlebar Improvements** - Advanced personalization capabilities
- **Database Indexes** - Additional indexes for better performance
- **Email Gateway Optimization** - Queue table optimization
- **Journey Event Trigger** - Advanced rules JSON criteria support
- **Webhook Customization** - Journey webhook payload customization
- **MySQL Query Optimization** - Optimized slow queries
- **Mailchimp Import** - Improved import functionality
- **ActiveCampaign Mapping** - Enhanced data mapping
- **Drip Import** - Upgraded import capabilities
- **Name Field Mapping** - Support for mapping full name to first and last name fields
- **Development Tools** - Added xdebug PHP module, improved MySQL configuration, SQL query debugging

### Bug Fixes

- **Default Sender Domain** - Fixed issue that could block campaign delivery
- **Admin Password Reset** - Resolved password reset functionality
- **Website Event Tracker** - Fixed subscriber association issues
- **Campaign Timezone** - Schedule now defaults to user's timezone instead of Hawaii
- **Tag Count** - Corrected tag count for deleted subscribers
- **Journey Trigger** - Fixed subscriber journey trigger for silenced custom events
- **Email Open Activity** - Resolved activity registration issue
- **Campaign Stats** - Fixed daily stats reporting
- **Tracking URL Validation** - Improved email tracking URL validation

### Security Patches

None

### Deprecations

MySQL 5.7 replaced with MySQL 8.0

## v5.5.5

### Release Summary

Simplified DNS setup and subscriber activity monitoring enhancements.

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

- **Database Migration Security** - Implemented db migration methods for transitioning from v5.5.4 to v5.5.5 securely

### Deprecations

None

## v5.5.4

### Release Summary

Website event tracking improvements, ClickHouse native access, and email bounce handling refactor.

### New Features

- **Cleanify Plug-In Update** - Enhanced functionality for the Cleanify Plug-In
- **ClickHouse Native Access** - Enabled direct access to ClickHouse native port 9000

### Enhancements

- **Website Event Tracking** - Improved supervisor process to prevent hanging and ensure no events are lost

### Bug Fixes

- **Email Bounce Handling** - Refactored logic for improved reliability and performance

### Security Patches

None

### Deprecations

None

## v5.5.3

### Release Summary

Campaign sharing improvements, MySQL error fixes, error logging enhancements, and security updates.

### New Features

- **Campaign Share Links** - Added copy link option for easier sharing

### Enhancements

- **Error Logging** - Enhanced system-wide error logging for better troubleshooting
- **Column Collation** - Unified column collation across all table columns
- **Segment Management UI** - Updated to use new RulesJSON for improved segment rule handling
- **Admin Dashboard** - Removed product news section for cleaner interface

### Bug Fixes

- **MySQL Campaign Sending** - Fixed MySQL errors during email campaign sending
- **RevenueHit Journey Trigger** - Resolved journey trigger issue
- **SSL Renewal** - Fixed SSL renewal issue with HAProxy and Certbot

### Security Patches

- **Ioncube Encryption** - Updated encryption settings for improved security and compatibility

### Deprecations

- **Upgrade Script** - Removed upgrade.sh script

## v5.5.2

### Release Summary

Journey triggers, automated SSL renewal, phone verification, and email security enhancements.

### New Features

- **Journey Triggers** - Added new journey triggers for workflow automation based on specific actions or criteria
- **HAProxy SSL Certificate Renewal** - Automated SSL certificate renewal process
- **Phone Verification on Signup** - Required phone verification for enhanced security when signing up to send emails

### Enhancements

- **Email Whitelist** - Improved whitelist functionality for better email sending control
- **Subscriber Filtering** - Filter and manage subscribers by failed delivery attempts
- **Email Gateway Personalization** - Enhanced personalization options in email gateway
- **Campaign API Sorting** - Sort campaigns by scheduled time in Campaign.Get API endpoint
- **Link Redirection Security** - Enhanced security measures to prevent hijacking and unauthorized redirects
- **Sender Domain Infrastructure** - Backend improvements for sender domain management
- **Documentation Templates** - Streamlined GitHub issue and pull request templates

### Bug Fixes

- **Campaign Copy Feature** - Fixed RulesJsonBundle parameter not being copied in Campaign.Copy API
- **Email Import** - Fixed bug preventing import of single email address without newline

### Security Patches

- **Email Address Suppression List** - Implemented whitelist feature for improved handling of sender domains and campaign rules

### Deprecations

None

## v5.5.1

### Release Summary

Email preview customization, revenue calculation, and improved admin user management.

### New Features

- **Email Previews Customization** - Pass FromName and FromEmailAddress for email previews for more personalized previewing
- **Revenue Calculation** - Track and analyze campaign performance with revenue calculation feature

### Enhancements

- **System Components Check** - Improved system stability with thorough component checking
- **Sub Admin User Management** - Sub admins can view all users in impersonated user list
- **Drip Importer** - Enhanced functionality for better data handling
- **Campaign Queue Maintenance** - Automatic deletion of old campaign queue tables via cron job
- **Upgrade Tool** - Preserves custom changes to config.inc.php

### Bug Fixes

- **Vendor Directories** - Removed unnecessary vendor directories
- **Clone Journey Endpoint** - Fixed journey cloning functionality
- **Subscriber.Import API** - Resolved Drip-related validation errors

### Security Patches

None

### Deprecations

None

## v5.5.0

### Release Summary

Major release with API enhancements, website event tracking, journey metrics, and import integrations.

### New Features

- **Campaigns.Get API** - Support for CampaignStatus=Scheduled parameter
- **Campaign Activity Subscribers** - Get list of subscribers for specific email campaign activities
- **Website Event Segmentation** - Filter and segment subscribers based on website interactions
- **Customizable Activity Tracker** - Customization support for web activity tracking script
- **Journey Email Metrics** - Performance metrics for email actions within journeys
- **Email Gateway Support** - Enhanced ListID and SubscriberID support
- **User API Key Management** - Endpoints for managing user API keys
- **Subscriber API Endpoints** - Create and Update endpoints for subscriber management
- **MessageBird SMS Connector** - SMS communication channel integration
- **Antivirus Plugin** - Email attachment virus scanning
- **Mailchimp Import** - Import integration for Mailchimp data
- **ActiveCampaign Import** - Import tool for ActiveCampaign migration

### Enhancements

- **SMTP Error Messages** - Improved error handling for clearer communication
- **Octeth Branding** - Updated UI texts and database values
- **Performance** - System-wide performance improvements including query and campaign delivery optimizations
- **API Notation** - Standardized request and response notation
- **Security** - Connection limiter for email gateway and ACL rules updates

### Bug Fixes

- **RSS Feeds** - Fixed conflict issue with multiple RSS feeds
- **SMTP Password** - Made SMTP password optional as intended
- **Segment Counts** - Updated expiration time to 30 seconds
- **Journey API** - Optimized Journey Action Subscribers API endpoint
- **Email Recipients** - Updated recipient handling and credit calculation

### Security Patches

Connection limiter for email gateway and ACL rules updates.

### Deprecations

None

## v5.1.1

### Release Summary

Custom email headers, link proxy add-on, and IMAP-powered bounce handling.

### New Features

- **Custom Email Headers** - Setup custom email headers with personalization support for each user account
- **Link Proxy Add-On** - Proxy service for email link tracking
- **IMAP Bounce Handler** - IMAP powered inbound bounce and list-unsubscribe MX server add-on

### Enhancements

- **Segment Engine** - Minor performance improvements

### Bug Fixes

Various bug fixes.

### Security Patches

None

### Deprecations

None

## v5.1.0

### Release Summary

Sender domain management, fallback personalization, and containerized backend processes.

### New Features

- **Suppression List Pagination** - Pagination and search features for user account suppression lists
- **Sender Domain Management** - Management section for sender domains in user area
- **Containerized Backend** - Backend daemon processes and cron jobs managed by separate containers for easier scaling
- **Fallback Personalization** - Fallback values when custom field is empty for recipient

### Enhancements

- **List Suppression** - List suppression settings enabled by default
- **Webhook Payload** - Improved list subscription webhook payload
- **Campaign Content** - HTML and plain text email content enabled by default for simplified campaign create flow
- **Timezone DST** - Improved DST calculation for scheduled campaigns
- **Custom Field Type** - Changed custom field data type from TEXT to LONGTEXT
- **Stripo Builder** - Session timeout prevention improvements

### Bug Fixes

None mentioned.

### Security Patches

None

### Deprecations

None

## v5.0.3

### Release Summary

Personalization enhancements, delivery metrics, and campaign KPI improvements.

### New Features

- **MFROMDomain Merge Tag** - Support for %MFROMDomain% in email from header
- **Delivery Metrics** - System-wide daily, weekly, monthly, and yearly delivery metrics
- **Campaign Personalization Tags** - Campaign ID, Hashed Campaign ID, and Campaign Name tags
- **Remote Content Fetch** - Pre-email delivery remote content fetch merge tag
- **JSON Custom Field Personalization** - Support for JSON data in custom fields
- **Merge Tag Functions** - Functional merge tags for advanced personalization
- **Subscriber Activity Logging** - Log latest subscriber email activities

### Enhancements

- **Delivery Server Ordering** - Improved list ordering in user groups
- **Personalization** - General personalization improvements
- **Campaign KPI Metrics** - Enhanced metrics on campaign browse page
- **Timezone Display** - Display timezone for scheduled campaigns
- **Schedule Intervals** - Campaign schedule minute intervals set to every 5 minutes
- **IMAP Bounce Processing** - IMAP-based hard bounce and FBL processing module
- **User Search** - Ability to search for user ID
- **List Dashboard** - Display opt-in pending subscribers count
- **Webhook Methods** - POST method support for inbound webhooks
- **User Names** - User first and last names are optional, company name can be used

### Bug Fixes

None mentioned.

### Security Patches

None

### Deprecations

None

## v5.0.2

### Release Summary

CLI installation tool, user management improvements, campaign cloning, and email delivery engine enhancements.

### New Features

- **CLI Installation Tool** - Command line installation tool for simplified setup
- **Coming Soon Feature Toggle** - Option to hide "Coming Soon" features from user area
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

### Deprecations

None

## v5.0.1

### Release Summary

Advanced personalization features, email builder integrations, and audience engagement metrics.

### New Features

- **Randomized Segment Audience** - Set segment audience size and randomize target recipients for varied campaign targeting
- **Email Content Spinning** - Generate content variations using spinning syntax for unique email content
- **CTR Retention Cohort** - Track audience CTR engagement over time for optimized campaigns
- **Randomizer Merge Tags** - Insert randomized strings and numbers for unique content
- **JSON Custom Field Personalization** - Inject and use JSON data in custom fields for advanced personalization
- **Conditional Content Personalization** - Flexible email layout customization based on subscriber data
- **Stripo Email Builder** - Drag-and-drop Stripo.email builder integration
- **Unlayer Email Builder** - Drag-and-drop Unlayer.com builder integration
- **SpamAssassin Restrictions** - Restrict campaigns based on SpamAssassin score threshold
- **SMS Marketing Module** - SMS communication channel support
- **Email Gateway Module** - Enhanced email gateway capabilities
- **SSL Reverse Proxy Module** - On-demand SSL and reverse proxy support

### Enhancements

- **Campaign Resend Flow** - User experience improvements
- **TLS Crypto** - Updated TLS cryptography
- **Segment Engine** - SQL query improvements
- **Docker Container** - Apache version upgrade in frontend container
- **Journey Triggers** - Subscribe/Unsubscribe from ALL lists event trigger
- **Export Processes** - Ability to rename audience export processes
- **Conditional Personalization** - General improvements

### Bug Fixes

Various bug fixes.

### Security Patches

Various security patches.

### Deprecations

None
