---
layout: doc
---

# Octeth Configuration

Octeth is a powerful and feature-packed email and SMS marketing, marketing automation and audience management software. It includes several features and configuration options. Based on your use case such as running an ESP, using for your own email campaigns only, running an email agency, etc.

In this tutorial, we will show you some fundamental configurations for the optimum email deliverability and ease of use.

## Configuration Modules

Octeth has a few configuration modules:

| Module                | Purpose                                                                                                                                                                                  |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Environment Variables | Environment files are `/opt/octeth/.oempro_*_env`, `/opt/octeth/system/.env` and `/opt/octeth/cli/email_campaign_controller/.env` and they are used to set environment for the platform. |
| Configuration Files   | Configuration files are located inside `/opt/octeth/config/` directory and consists of many files. These files can be extended or updated directly.                                      |
| System Settings       | System settings can be configured on the Administrator Dashboard → Preferences → System Settings                                                                                         |

## System Configuration Part I: Environment Variables

Octeth uses environment variable files to configure system-level settings and service connections. These files contain sensitive information like database credentials, API keys, and system parameters that control how Octeth operates.

Understanding these configuration files is essential for proper installation, maintenance, and troubleshooting of your Octeth instance.

### Overview of Environment Files

Octeth uses multiple environment files located in the `/opt/octeth/` directory. Each file serves a specific purpose:

| File Name                            | Location                                     | Purpose                                                                                  |
|--------------------------------------|----------------------------------------------|------------------------------------------------------------------------------------------|
| `.oempro_env`                        | `/opt/octeth/`                               | Main application configuration including URLs, credentials, debugging, and feature flags |
| `.oempro_mysql_env`                  | `/opt/octeth/`                               | MySQL database server configuration                                                      |
| `.oempro_redis_env`                  | `/opt/octeth/`                               | Redis cache server configuration                                                         |
| `.oempro_rabbitmq_env`               | `/opt/octeth/`                               | RabbitMQ message queue server configuration                                              |
| `.oempro_clickhouse_env`             | `/opt/octeth/`                               | ClickHouse analytics database configuration                                              |
| `.oempro_supervisor_env`             | `/opt/octeth/`                               | Supervisor process manager credentials                                                   |
| `system/.env`                        | `/opt/octeth/system/`                        | Laravel backend application configuration                                                |
| `cli/email_campaign_controller/.env` | `/opt/octeth/cli/email_campaign_controller/` | Email delivery campaign controller settings                                              |

### Main Configuration File: `.oempro_env`

The `.oempro_env` file is the primary configuration file for your Octeth installation. It contains all core application settings.

**Location:** `/opt/octeth/.oempro_env`

**Key Configuration Categories:**

1. **Environment Settings**
   ```bash
   APP_ENV=local                    # Environment: local, staging, production
   APP_URL=http://203.0.113.10/   # Your Octeth access URL (always end with /)
   PRODUCT_VERSION=5.7.2            # Octeth version number
   ```

2. **Database Credentials**
   ```bash
   MYSQL_HOST=192.168.99.108        # MySQL server IP address or hostname
   MYSQL_USERNAME=oempro            # MySQL database username
   MYSQL_PASSWORD=password          # MySQL database password
   MYSQL_DATABASE=oempro            # MySQL database name
   MYSQL_TABLE_PREFIX=oempro_       # Database table prefix
   ```

3. **Security & Authentication**
   ```bash
   LICENSE_KEY=6491-2039-4581-F4C6-F1CC-8334-38B9-CBA9-1092  # Your Octeth license
   ADMIN_API_KEY=SZaQtZfJ4zufb8blykpvHPM6IBhFGFf0           # Admin API access key
   HASH_IDS_SALT=elis9RqKmDLLt3B+Ls5kfC_+fl7IZoO3          # Hash ID salt
   OEMPRO_PASSWORD_SALT=elis9RqKmDLLt3B+Ls5kfC_+fl7IZoO3   # Password encryption salt
   SCRTY_SALT=elis9RqKmDLLt3B+Ls5kfC_+fl7IZoO3             # Security salt
   ```

4. **Debugging & Logging**
   ```bash
   OEMPRO_DEBUG=true                        # Enable/disable debug mode
   OEMPRO_DEBUG_FILTER_IP=                  # Limit debug to specific IP (optional)
   OEMPRO_LOG_LEVEL=DEBUG                   # Log level: DEBUG, INFO, NOTICE, WARNING, ERROR
   API_SLOW_QUERY_THRESHOLD=0.1             # Log API calls slower than X seconds
   ```

5. **Session Management**
   ```bash
   SESSION_LIFETIME_DAYS=30                 # Session validity in days
   SESSION_SECURE_COOKIE=false              # Enable for HTTPS/SSL only
   ```

6. **Feature Flags**
   ```bash
   DEMO_MODE_ENABLED=false                  # Disable email delivery for demo
   DISABLE_LATEST_NEWS=false                # Disable news from Octeth servers
   HIDE_COMING_SOON_FEATURES=true           # Hide unreleased features
   CREDITS_SYSTEM_ENABLED=true              # Enable credit-based delivery
   ```

::: warning Important
The `.oempro_env` file contains sensitive credentials. Never commit this file to version control or share it publicly. Keep secure backups in encrypted storage.
:::

### Service-Specific Environment Files

#### `.oempro_mysql_env` - MySQL Configuration

Configures the MySQL database server that powers Octeth's data storage.

**Location:** `/opt/octeth/.oempro_mysql_env`

**Configuration:**
```bash
HOSTNAME=oempro_mysql              # MySQL container hostname
MYSQL_ROOT_PASSWORD=password       # MySQL root user password
```

::: tip
The MySQL root password is only used internally by Docker containers. Your application connects using the credentials in `.oempro_env`.
:::

#### `.oempro_redis_env` - Redis Configuration

Configures Redis, which provides high-speed caching for improved performance.

**Location:** `/opt/octeth/.oempro_redis_env`

**Configuration:**
```bash
HOSTNAME=oempro_redis              # Redis container hostname
```

#### `.oempro_rabbitmq_env` - RabbitMQ Configuration

Configures RabbitMQ, the message queue system that handles asynchronous tasks like email delivery, journey processing, and background jobs.

**Location:** `/opt/octeth/.oempro_rabbitmq_env`

**Configuration:**
```bash
HOSTNAME=oempro_rmq                          # RabbitMQ container hostname
RABBITMQ_ERLANG_COOKIE=oempro-rmq            # Erlang cluster cookie
RABBITMQ_VM_MEMORY_HIGH_WATERMARK=1024MiB    # Memory limit before throttling
RABBITMQ_DEFAULT_USER=oempro                 # RabbitMQ username
RABBITMQ_DEFAULT_PASS=password               # RabbitMQ password
RABBITMQ_DEFAULT_VHOST=oempro_rmq_vhost      # Virtual host name
```

::: tip Performance Tuning
Increase `RABBITMQ_VM_MEMORY_HIGH_WATERMARK` if you're processing high-volume email campaigns. For servers with 16GB RAM, you can set this to `4096MiB` or higher.
:::

#### `.oempro_clickhouse_env` - ClickHouse Configuration

Configures ClickHouse, the analytics database used for reporting and high-volume event tracking.

**Location:** `/opt/octeth/.oempro_clickhouse_env`

**Configuration:**
```bash
CLICKHOUSE_DB=oempro               # ClickHouse database name
CLICKHOUSE_USER=oempro             # ClickHouse username
CLICKHOUSE_PASSWORD=password       # ClickHouse password
```

#### `.oempro_supervisor_env` - Supervisor Configuration

Configures Supervisor, the process control system that manages background workers and ensures they restart automatically if they fail.

**Location:** `/opt/octeth/.oempro_supervisor_env`

**Configuration:**
```bash
SUPERVISOR_USERNAME=oempro         # Supervisor web interface username
SUPERVISOR_PASSWORD=password       # Supervisor web interface password
```

### Laravel Backend: `system/.env`

The Laravel backend handles modern PHP 8.1+ features including API endpoints, webhooks, and advanced system operations.

**Location:** `/opt/octeth/system/.env`

**Key Configuration:**
```bash
APP_NAME=Octeth                              # Application name
APP_ENV=local                                # Environment: local, staging, production
APP_KEY=base64:j54qtJlSJjSTkPXk...          # Laravel encryption key (auto-generated)
APP_DEBUG=false                              # Enable debug mode
APP_URL=http://localhost                     # Application URL

# Database (should match main .oempro_env)
DB_CONNECTION=mysql
DB_HOST=192.168.99.108
DB_PORT=3306
DB_DATABASE=oempro
DB_USERNAME=oempro
DB_PASSWORD=password
DB_TABLE_PREFIX=oempro_system_               # Different prefix for Laravel tables

# RabbitMQ Connection
OEMPRO_RABBITMQ_HOST=oempro_rmq
OEMPRO_RABBITMQ_PORT=5672
OEMPRO_RABBITMQ_USERNAME=oempro
OEMPRO_RABBITMQ_PASSWORD=password
OEMPRO_RABBITMQ_VHOST=oempro_rmq_vhost

# ClickHouse Connection
CLICKHOUSE_HOST=192.168.99.114
CLICKHOUSE_DB=oempro
CLICKHOUSE_USER=oempro
CLICKHOUSE_PASSWORD=password
```

::: info Laravel vs CodeIgniter
Octeth uses a hybrid architecture. The main application runs on CodeIgniter (PHP 5.6 compatible), while the `system/` directory contains a Laravel application (PHP 8.1+) for modern features. Both share the same MySQL database but use different table prefixes.
:::

### Email Campaign Controller: `cli/email_campaign_controller/.env`

Controls the email delivery system's concurrency and performance settings.

**Location:** `/opt/octeth/cli/email_campaign_controller/.env`

**Configuration:**
```bash
MAXSENDERSPERCAMPAIGN=15           # Maximum parallel senders per campaign
MAXSENDERSPERSERVER=150            # Maximum parallel senders per delivery server
```

**Understanding the Settings:**

- **MAXSENDERSPERCAMPAIGN**: Controls how many simultaneous SMTP connections are used for a single campaign. Higher values speed up delivery but increase server load.

- **MAXSENDERSPERSERVER**: Controls how many total SMTP connections can be active on a single delivery server. This prevents overwhelming your SMTP servers.

::: tip Delivery Performance
For high-volume sending (1M+ emails/hour):
- Set `MAXSENDERSPERCAMPAIGN=25`
- Set `MAXSENDERSPERSERVER=200`

For shared SMTP servers or rate-limited providers:
- Set `MAXSENDERSPERCAMPAIGN=5`
- Set `MAXSENDERSPERSERVER=50`
:::

### Best Practices for Environment Files

**Security:**
1. Never commit `.env` files to version control (Git, SVN, etc.)
2. Store backups in encrypted, secure locations
3. Use strong, unique passwords for all services
4. Change default passwords immediately after installation
5. Restrict file permissions: `chmod 600 /opt/octeth/.oempro*_env`

**Consistency:**
1. Database credentials must match across all environment files
2. Keep IP addresses and hostnames consistent
3. Update both `.oempro_env` and `system/.env` when changing database settings

**Documentation:**
1. Document any changes you make to environment files
2. Keep a changelog of configuration modifications
3. Note the reason for any non-standard settings

**Testing:**
1. Test configuration changes in a staging environment first
2. Always create backups before modifying environment files
3. Verify system health after changes using `/opt/octeth/cli/octeth.sh health:check`

### Common Configuration Scenarios

#### Scenario 1: Changing the Application URL

When you set up a domain name or move to a new IP address:

1. Update `.oempro_env`:
   ```bash
   APP_URL=https://octeth.yourdomain.com/
   ```

2. Update `system/.env`:
   ```bash
   APP_URL=https://octeth.yourdomain.com
   ```

3. Restart Docker containers:
   ```bash
   cd /opt/octeth
   /opt/octeth/cli/octeth.sh docker:restart
   ```

#### Scenario 2: Enabling Production Mode

When moving from staging to production:

1. Update `.oempro_env`:
   ```bash
   APP_ENV=production
   OEMPRO_DEBUG=false
   OEMPRO_LOG_LEVEL=ERROR
   SESSION_SECURE_COOKIE=true        # Only if using HTTPS
   ```

2. Update `system/.env`:
   ```bash
   APP_ENV=production
   APP_DEBUG=false
   ```

3. Clear caches and restart:
   ```bash
   cd /opt/octeth
   docker exec oempro_app php /var/www/html/cli/cache-clear.php
   /opt/octeth/cli/octeth.sh docker:restart
   ```

#### Scenario 3: Optimizing for High-Volume Sending

For sending millions of emails:

1. Update `cli/email_campaign_controller/.env`:
   ```bash
   MAXSENDERSPERCAMPAIGN=25
   MAXSENDERSPERSERVER=200
   ```

2. Update `.oempro_rabbitmq_env`:
   ```bash
   RABBITMQ_VM_MEMORY_HIGH_WATERMARK=4096MiB
   ```

3. Update `.oempro_env`:
   ```bash
   CAMPAIGN_DELIVERY_LOG_LEVEL=WARNING    # Reduce log verbosity
   ```

4. Restart affected services:
   ```bash
   /opt/octeth/cli/octeth.sh backend:restart
   ```

#### Scenario 4: Enabling Debug Mode for Troubleshooting

When investigating issues:

1. Update `.oempro_env`:
   ```bash
   OEMPRO_DEBUG=true
   OEMPRO_LOG_LEVEL=DEBUG
   API_SLOW_QUERY_THRESHOLD=0.5         # Log slow API calls
   ```

2. Update `system/.env`:
   ```bash
   APP_DEBUG=true
   LOG_MYSQL_QUERIES=true
   ```

3. Monitor logs:
   ```bash
   /opt/octeth/cli/octeth.sh logs:tail
   ```

::: danger Remember to Disable Debug Mode
Debug mode can expose sensitive information and reduce performance. Always disable it after troubleshooting:
```bash
OEMPRO_DEBUG=false
OEMPRO_LOG_LEVEL=ERROR
```
:::

### Viewing Current Configuration

To view your current environment configuration:

```bash
# View main configuration
cat /opt/octeth/.oempro_env

# View MySQL configuration
cat /opt/octeth/.oempro_mysql_env

# View RabbitMQ configuration
cat /opt/octeth/.oempro_rabbitmq_env

# View all environment files
ls -la /opt/octeth/.oempro*_env
```

### Editing Environment Files

To safely edit environment files:

```bash
# Create a backup first
cp /opt/octeth/.oempro_env /opt/octeth/.oempro_env.backup

# Edit the file using vi or nano
vi /opt/octeth/.oempro_env

# After making changes, restart Docker containers
cd /opt/octeth
/opt/octeth/cli/octeth.sh docker:restart

# Verify system health
/opt/octeth/cli/octeth.sh health:check
```

::: warning Configuration File Format
Environment files use a simple `KEY=value` format. Important rules:
- No spaces around the `=` sign
- No parentheses `()` or equal signs `=` in comments
- Quote values with spaces: `APP_NAME="My Company"`
- Comments start with `#`
- Empty values are allowed: `SENTRY_API=`
:::

## System Configuration Part II: Configuration Files

While environment variables control system-level settings, configuration files provide detailed, structured PHP-based configuration for Octeth's features and behaviors. These files allow you to customize everything from SMS settings to email delivery parameters without modifying core application code.

Configuration files are automatically loaded at startup and can be overridden on a per-project basis, making them ideal for multi-tenant deployments or custom implementations.

### What Are Configuration Files?

Configuration files are PHP files that return arrays of key-value pairs. Octeth automatically loads these files and makes their values available throughout the application as constants or global variables.

**Location:** `/opt/octeth/config/`

**Two Main Types:**

1. **Constants Files** (`const_*.php`) - Define PHP constants (immutable values)
2. **Configuration Files** (other `.php` files) - Define scalar constants or global array variables

### Directory Structure

The config directory is organized into two main subdirectories:

```
/opt/octeth/config/
├── global/                    # Global configuration (all environments)
│   ├── app.php               # Core application settings
│   ├── features.php          # Feature flags and toggles
│   ├── sms.php               # SMS system configuration
│   ├── email_delivery.php    # Email delivery settings
│   ├── const_*.php           # Constant definitions
│   └── ...                   # Other config files
├── environments/             # Environment-specific overrides
│   ├── local/                # Local development settings
│   │   └── config.php
│   ├── staging/              # Staging environment settings
│   │   └── config.php
│   └── production/           # Production environment settings
│       └── config.php
└── .htaccess                 # Apache security rules
```

### Global Configuration Files

The `config/global/` directory contains configuration files that apply to all environments unless overridden.

| File Name                  | Purpose                              | Key Settings                                                          |
|----------------------------|--------------------------------------|-----------------------------------------------------------------------|
| `app.php`                  | Core application settings            | MySQL credentials, debugging, logging, session management             |
| `features.php`             | Feature flags and behavioral toggles | WYSIWYG editor, CRON settings, credit deductions, webhooks            |
| `sms.php`                  | SMS system configuration             | Link shortening, gateway settings, queue processing, delivery reports |
| `email_delivery.php`       | Email delivery parameters            | SMTP settings, bounce handling, delivery throttling                   |
| `dns.php`                  | DNS lookup and validation            | DNS servers, validation rules, timeout settings                       |
| `services.php`             | External service integrations        | Third-party API configurations                                        |
| `session.php`              | User session management              | Session lifetime, storage, security settings                          |
| `cookie.php`               | Cookie configuration                 | Cookie names, domains, security flags                                 |
| `ui.php`                   | User interface settings              | UI themes, layouts, display options                                   |
| `sender_domain_dns.php`    | Sender domain DNS requirements       | SPF, DKIM, DMARC validation rules                                     |
| `event_tracker.php`        | Website event tracking               | Tracking pixel settings, event mapping                                |
| `custom_field_presets.php` | Predefined custom field templates    | Common custom field configurations                                    |
| `timezones.php`            | Timezone definitions                 | Supported timezones for the system                                    |
| `tiny_mce.php`             | Rich text editor configuration       | TinyMCE toolbar settings, plugins                                     |

### Constants Files (`const_*.php`)

Files prefixed with `const_` define PHP constants that cannot be changed during runtime. These are used for system-wide immutable values.

| File Name                                 | Purpose                         |
|-------------------------------------------|---------------------------------|
| `const_BOUNCE_PATTERNS.php`               | Email bounce detection patterns |
| `const_EMAILGATEWAY_TO_CC_BCC_LIMITS.php` | Email gateway recipient limits  |
| `const_METRIC_WEIGHTS.php`                | Engagement scoring weights      |
| `const_OEMPRO_DNS_LOOKUP_SERVERS.php`     | DNS servers for lookups         |
| `const_OEMPRO_REDIS_PARAMETERS.php`       | Redis connection parameters     |
| `const_OEMPRO_SERVICE_HOSTNAMES.php`      | Internal service hostnames      |
| `const_WEBSITE_EVENT_MAPPING.php`         | Website event type mappings     |

::: info How Configuration Files Work
When Octeth starts:
1. Environment variables are loaded first (`.oempro_env`, `system/.env`, etc.)
2. Configuration files in `config/global/` are loaded and processed
3. Environment-specific configs from `config/environments/{APP_ENV}/` override global settings
4. Scalar values are defined as PHP constants
5. Array values are stored in PHP's `$GLOBALS` array
:::

### Environment-Specific Configuration

The `config/environments/` directory allows you to override global settings based on the current environment (local, staging, production).

**How It Works:**

1. The environment is determined by the `APP_ENV` variable in `.oempro_env`
2. Octeth loads the corresponding directory: `config/environments/{APP_ENV}/`
3. Files in this directory override global settings with the same keys

**Example: Production-Specific Settings**

Create `/opt/octeth/config/environments/production/config.php`:

```php
<?php

return [
    'OEMPRO_DEBUG' => false,
    'OEMPRO_LOG_LEVEL' => 'ERROR',
    'MYSQL_ERRORS_ON_SCREEN' => false,
];
```

When `APP_ENV=production` is set in `.oempro_env`, these values override the defaults from `config/global/app.php`.

::: tip Environment-Based Configuration
Use environment-specific configs for:
- Different debug levels per environment
- Environment-specific API endpoints
- Different cache TTL values
- Testing vs production feature flags
:::

### How to Edit Configuration Files

Configuration files are PHP files that return arrays. Follow these steps to safely modify them:

1. **Create a backup:**
   ```bash
   cp /opt/octeth/config/global/features.php /opt/octeth/config/global/features.php.backup
   ```

2. **Edit the file:**
   ```bash
   vi /opt/octeth/config/global/features.php
   ```

3. **Modify values in the returned array:**
   ```php
   <?php

   return [
       'WYSIWYG_ENABLED' => true,  // Change from false to true
       'DEMO_MODE_ENABLED' => false,
       // ... other settings
   ];
   ```

4. **Validate PHP syntax:**
   ```bash
   php -l /opt/octeth/config/global/features.php
   ```

5. **Restart Docker containers:**
   ```bash
   cd /opt/octeth
   /opt/octeth/cli/octeth.sh docker:restart
   ```

6. **Verify system health:**
   ```bash
   /opt/octeth/cli/octeth.sh health:check
   ```

::: warning PHP Syntax
Configuration files must return a valid PHP array. Common mistakes:
- Missing semicolon at end of lines
- Unclosed brackets or parentheses
- Incorrect boolean values (`true/false` not `"true"/"false"` strings)
- Missing commas between array elements
:::

### Project-Specific Configuration Overrides

Octeth supports project-specific configuration overrides using the `APP_PROJECT_CONFIG_PATH` mechanism. This is ideal for:

- Multi-tenant deployments with custom settings per tenant
- White-label installations requiring specific configurations
- Testing custom configurations without modifying core files

**How It Works:**

1. Set `APP_PROJECT_CONFIG_PATH` in `.oempro_env` to point to your project directory
2. Create a `config/` directory in your project path
3. Mirror the structure of `/opt/octeth/config/`
4. Add only the files and settings you want to override

**Loading Priority (highest to lowest):**

1. Project environment constants (`{PROJECT_PATH}/config/environments/{APP_ENV}/const_*.php`)
2. Project environment configs (`{PROJECT_PATH}/config/environments/{APP_ENV}/*.php`)
3. Project global constants (`{PROJECT_PATH}/config/global/const_*.php`)
4. Project global configs (`{PROJECT_PATH}/config/global/*.php`)
5. Core environment constants (`/opt/octeth/config/environments/{APP_ENV}/const_*.php`)
6. Core environment configs (`/opt/octeth/config/environments/{APP_ENV}/*.php`)
7. Core global constants (`/opt/octeth/config/global/const_*.php`)
8. Core global configs (`/opt/octeth/config/global/*.php`)

### Example: Creating a Project-Specific Configuration

Let's create a custom configuration for a project called "acme-corp":

**Step 1: Create the project directory structure**

```bash
mkdir -p /opt/octeth/.acme-corp/config/global
mkdir -p /opt/octeth/.acme-corp/config/environments/production
```

**Step 2: Configure APP_PROJECT_CONFIG_PATH**

Edit `/opt/octeth/.oempro_env`:

```bash
APP_PROJECT_CONFIG_PATH=.acme-corp
```

**Step 3: Create project-specific feature flags**

Create `/opt/octeth/.acme-corp/config/global/features.php`:

```php
<?php

return [
    // Enable WYSIWYG editor for this project
    'WYSIWYG_ENABLED' => true,

    // Disable credit notices for this premium client
    'DISPLAY_CREDIT_NOTICE' => false,

    // Custom webhook timeout for their slower server
    'WEBHOOK_TIMEOUT_SECONDS' => 15,
];
```

**Step 4: Create production environment overrides**

Create `/opt/octeth/.acme-corp/config/environments/production/config.php`:

```php
<?php

return [
    // Stricter log level for production
    'OEMPRO_LOG_LEVEL' => 'WARNING',

    // Enable session secure cookies for their HTTPS setup
    'SESSION_SECURE_COOKIE' => true,
];
```

**Step 5: Restart Octeth**

```bash
cd /opt/octeth
/opt/octeth/cli/octeth.sh docker:restart
```

::: tip Project Directory Naming
Use a leading dot (`.`) for project directories to keep them hidden from casual directory listings:
- `.acme-corp` instead of `acme-corp`
- `.client-xyz` instead of `client-xyz`
:::

### Best Practices for Configuration Files

**Organization:**
1. Only override settings that need to be changed (don't copy entire files)
2. Keep project-specific configs minimal and well-documented
3. Use comments to explain why specific values were chosen
4. Group related settings together

**Version Control:**
1. **Never commit** sensitive credentials in config files
2. Use environment variables (`.oempro_env`) for secrets
3. Config files can be version-controlled since they reference environment variables via `SystemConfig::Get()`
4. Use `.gitignore` for project-specific directories

**Documentation:**
1. Document all custom configuration overrides
2. Add comments explaining non-obvious settings
3. Keep a changelog of configuration changes
4. Note dependencies between related settings

**Testing:**
1. Always validate PHP syntax after editing: `php -l filename.php`
2. Test configuration changes in staging before production
3. Create backups before making changes
4. Use environment-specific configs to test different values

**Maintenance:**
1. Review and clean up unused configuration overrides
2. Update project configs when upgrading Octeth versions
3. Periodically audit configuration for security best practices
4. Monitor logs after configuration changes

### Common Configuration Scenarios

#### Scenario 1: Enabling WYSIWYG Editor Globally

To enable the rich text editor for all users:

1. Edit `/opt/octeth/config/global/features.php`:
   ```php
   'WYSIWYG_ENABLED' => true,  // Changed from false
   ```

2. Restart Docker:
   ```bash
   /opt/octeth/cli/octeth.sh docker:restart
   ```

#### Scenario 2: Customizing SMS Link Settings

To use shorter SMS links with a custom domain:

1. Edit `/opt/octeth/config/global/sms.php`:
   ```php
   'SMS_LINK_SHORT_CODE_LENGTH' => 4,           // Shorter URLs
   'SMS_LINK_DOMAIN' => 'sms.yourdomain.com',   // Custom domain
   'SMS_LINK_EXPIRY_HOURS_DEFAULT' => 168,      // 7 days instead of 3
   ```

2. Validate and restart:
   ```bash
   php -l /opt/octeth/config/global/sms.php
   /opt/octeth/cli/octeth.sh docker:restart
   ```

#### Scenario 3: Creating a White-Label Configuration

For a white-label client who needs custom settings:

1. Set up project path in `.oempro_env`:
   ```bash
   APP_PROJECT_CONFIG_PATH=.whitelabel-client
   ```

2. Create project config directory:
   ```bash
   mkdir -p /opt/octeth/.whitelabel-client/config/global
   ```

3. Create `/opt/octeth/.whitelabel-client/config/global/features.php`:
   ```php
   <?php

   return [
       'OCTETH_TRACKERS' => false,              // Remove Octeth branding
       'DISABLE_LATEST_NEWS' => true,           // No Octeth news
       'DISPLAY_CREDIT_NOTICE' => false,        // Hide credit warnings
       'DISPLAY_LIMIT_NOTICE' => false,         // Hide limit warnings
   ];
   ```

4. Restart and verify:
   ```bash
   /opt/octeth/cli/octeth.sh docker:restart
   /opt/octeth/cli/octeth.sh health:check
   ```

#### Scenario 4: Environment-Specific Debug Settings

Different debug levels for different environments:

1. Create `/opt/octeth/config/environments/local/config.php`:
   ```php
   <?php

   return [
       'OEMPRO_DEBUG' => true,
       'OEMPRO_LOG_LEVEL' => 'DEBUG',
       'MYSQL_ERRORS_ON_SCREEN' => true,
       'LOG_MYSQL_QUERIES' => true,
   ];
   ```

2. Create `/opt/octeth/config/environments/production/config.php`:
   ```php
   <?php

   return [
       'OEMPRO_DEBUG' => false,
       'OEMPRO_LOG_LEVEL' => 'ERROR',
       'MYSQL_ERRORS_ON_SCREEN' => false,
       'LOG_MYSQL_QUERIES' => false,
   ];
   ```

3. The correct settings will be used based on `APP_ENV` in `.oempro_env`

#### Scenario 5: Customizing Email Delivery Behavior

To adjust campaign delivery performance:

1. Edit `/opt/octeth/config/global/email_delivery.php`:
   ```php
   'CAMPAIGN_DELIVERY_BATCH_SIZE' => 500,       // Larger batches
   'CAMPAIGN_DELIVERY_THROTTLE_MS' => 100,      // Slower sending
   'BOUNCE_PROCESSING_BATCH_SIZE' => 1000,      // More bounces per batch
   ```

2. Restart backend workers:
   ```bash
   /opt/octeth/cli/octeth.sh backend:restart
   ```

### Viewing Current Configuration

To view the current values from configuration files:

```bash
# View global features
cat /opt/octeth/config/global/features.php

# View SMS configuration
cat /opt/octeth/config/global/sms.php

# List all global config files
ls -la /opt/octeth/config/global/

# List environment-specific configs
ls -la /opt/octeth/config/environments/production/

# Check if project config is set
grep "APP_PROJECT_CONFIG_PATH" /opt/octeth/.oempro_env
```

### Troubleshooting Configuration Issues

**Configuration changes not taking effect:**

1. Verify PHP syntax is valid:
   ```bash
   php -l /opt/octeth/config/global/features.php
   ```

2. Ensure you restarted Docker containers:
   ```bash
   /opt/octeth/cli/octeth.sh docker:restart
   ```

3. Check for environment-specific overrides:
   ```bash
   cat /opt/octeth/config/environments/production/config.php
   ```

4. Verify project config path is correct:
   ```bash
   grep "APP_PROJECT_CONFIG_PATH" /opt/octeth/.oempro_env
   ```

**PHP syntax errors:**

If you see a blank screen or 500 error after editing:

1. Check Docker logs:
   ```bash
   /opt/octeth/cli/octeth.sh logs:tail
   ```

2. Validate PHP syntax:
   ```bash
   php -l /opt/octeth/config/global/features.php
   ```

3. Restore from backup:
   ```bash
   cp /opt/octeth/config/global/features.php.backup /opt/octeth/config/global/features.php
   /opt/octeth/cli/octeth.sh docker:restart
   ```

**Project config not loading:**

1. Verify `APP_PROJECT_CONFIG_PATH` is set:
   ```bash
   cat /opt/octeth/.oempro_env | grep APP_PROJECT_CONFIG_PATH
   ```

2. Check directory exists and has correct structure:
   ```bash
   ls -la /opt/octeth/.acme-corp/config/
   ```

3. Ensure file permissions are correct:
   ```bash
   chmod -R 644 /opt/octeth/.acme-corp/config/*.php
   ```

::: danger Configuration File Security
Configuration files can execute arbitrary PHP code. Never:
- Download config files from untrusted sources
- Copy-paste configuration code without reviewing it
- Allow users to upload configuration files
- Store passwords or API keys directly in config files (use environment variables instead)
:::

## User Group Settings

User groups are the foundation of Octeth's multi-tenancy system. Each user group acts as an isolated environment with its own settings, limits, permissions, and branding. When you create a user account in Octeth, it must belong to a user group.

Think of user groups as different "tiers" or "plans" for your users. For example, you might create separate user groups for:

- Free users with limited features
- Premium users with higher sending limits
- Agency clients with custom branding
- Internal team members with full access

To access user group settings, navigate to **Administrator Dashboard** → **Users** → **User Groups**.

### Basic Information

**Group Name**
The name of this user group. This is shown in the administrator area when managing user accounts. Choose a descriptive name like "Free Plan", "Premium Tier", or "Agency Client".

**Subscriber Area Logout URL**
The URL where subscribers are redirected after they log out from the subscriber portal. Typically set to your website homepage or a goodbye page.

**User Area Logout URL**
The URL where users are redirected after they log out from the user dashboard. Can be set to your website or a custom landing page.

### User Interface & Branding

**Template**
The UI theme template to use for this user group. Octeth comes with the "weefive" template by default.

**Product Name**
The product name displayed throughout the user interface. You can rebrand Octeth to your own product name (e.g., "YourCompany Email Marketing").

**Theme CSS Settings**
Customize colors, fonts, and visual styling for this user group. Each template has different customization options available.

### Permissions

**Permissions Checkboxes**
Control which features and modules are accessible to users in this group. Permissions include:

- Lists - Create and manage subscriber lists
- Campaigns - Create and send email campaigns
- AutoResponders - Set up automated email sequences
- Segments - Create dynamic subscriber segments
- Forms - Create subscription forms
- APIs - Access API endpoints
- Integrations - Connect third-party services
- Reports - View statistics and analytics
- And many more...

Only enable permissions for features you want this user group to access.

### Account Limits

These limits control resource usage for users in this group. Set to `0` for unlimited (use with caution).

**Limit Subscribers**
Maximum number of subscribers users in this group can have across all their lists. For example, set to `10000` to allow up to 10,000 subscribers.

**Limit Lists**
Maximum number of subscriber lists users can create. For example, set to `5` to allow 5 lists.

**Limit Campaign Send Per Period**
Maximum number of campaign emails that can be sent per period (monthly). Controls bulk email sending capacity.

**Limit Email Send Per Period**
Maximum number of total emails (campaigns + transactional) that can be sent per period (monthly).

**Limit Email Send Per Day**
Maximum number of emails that can be sent in a 24-hour period. Useful for rate limiting.

**Limit Email Send Lifetime**
Total number of emails that can be sent over the entire lifetime of the account. Useful for prepaid plans.

**Limit Email Gateway Sender Domains**
Maximum number of sender domains users can add to the Email Gateway (transactional email) feature.

::: tip Setting Appropriate Limits
Start conservative and increase limits based on usage patterns. For new customers, consider:
- Free tier: 500 subscribers, 2 lists, 5,000 emails/month
- Starter tier: 2,500 subscribers, 5 lists, 25,000 emails/month
- Pro tier: 10,000 subscribers, unlimited lists, 100,000 emails/month
:::

### Usage Thresholds

**Threshold Import**
Percentage threshold (0-100) for import operations. When users reach this percentage of their subscriber limit, they receive a warning. For example, set to `80` to warn at 80% capacity.

**Threshold Email Send**
Percentage threshold (0-100) for email sending. Users are warned when they reach this percentage of their monthly email limit.

::: info Threshold Warnings
Thresholds help users avoid hitting hard limits unexpectedly. Set them to 80-90% for best results.
:::

### Enforced Compliance Settings

**Force Unsubscription Link**
When enabled, users in this group **must** include an unsubscription link in all campaigns. The system will reject campaigns without this link. Recommended for compliance with email regulations.

**Force Reject Opt Link**
When enabled, requires a "reject opt-in" link in double opt-in confirmation emails. This allows recipients to reject the subscription during the confirmation process.

**Force Opt-In List**
When enabled, all lists created by users in this group must use double opt-in confirmation. Single opt-in is not allowed.

::: warning Compliance Best Practices
For most use cases, enable all three compliance settings to ensure adherence to anti-spam laws (CAN-SPAM, GDPR, etc.).
:::

### Email Header & Footer Templates

**Plain Email Header**
HTML content automatically added to the top of all plain-text emails sent by users in this group. Can include company branding, disclaimers, or required legal text.

**Plain Email Footer**
HTML content automatically added to the bottom of all plain-text emails. Typically includes contact information, unsubscribe links, and postal address (required by CAN-SPAM).

**HTML Email Header**
HTML content automatically added to the top of all HTML emails. Useful for inserting logos, navigation, or consistent branding.

**HTML Email Footer**
HTML content automatically added to the bottom of all HTML emails. Should include unsubscribe link, postal address, and social media links.

::: tip Header & Footer Usage
Use headers and footers to inject required compliance elements automatically, so users don't have to add them manually to every campaign.
:::

### Email Sending Configuration

**Send Method**
How emails will be delivered for users in this group. Options include:

- **System** - Use system-wide default sending configuration
- **SMTP** - Use custom SMTP server credentials
- **Local MTA** - Use server's local mail transfer agent (sendmail/postfix)
- **PHP Mail** - Use PHP's built-in mail() function (not recommended for production)
- **PowerMTA** - Use Port25 PowerMTA for high-volume sending
- **Save To Disk** - Save emails as files instead of sending (testing only)
- **SMTP-OCTETH** - Use Octeth's managed SMTP service
- **SMTP-SENDGRID** - Use SendGrid's SMTP service
- **SMTP-MAILGUN** - Use Mailgun's SMTP service
- **SMTP-MAILJET** - Use Mailjet's SMTP service
- **SMTP-SES** - Use Amazon SES SMTP interface
- **SMTP-POSTMARK** - Use Postmark's SMTP service

When selecting SMTP-based methods, you'll need to provide the appropriate credentials.

**SMTP Settings** (when Send Method is SMTP)

- **SMTP Host** - SMTP server hostname (e.g., `smtp.example.com`)
- **SMTP Port** - SMTP port number (typically 25, 587, or 465)
- **SMTP Secure** - Encryption method: none, `ssl`, or `tls`
- **SMTP Timeout** - Connection timeout in seconds
- **SMTP Authentication** - Enable if SMTP server requires authentication
- **SMTP Username** - SMTP account username
- **SMTP Password** - SMTP account password

**X-Mailer Header**
Custom value for the X-Mailer email header. Can be used for branding or tracking.

### Delivery Server Routing

**Target Delivery Server - Marketing**
Which delivery server to use for marketing campaigns (bulk emails). Select from your configured delivery servers.

**Target Delivery Server - Transactional**
Which delivery server to use for transactional emails (Email Gateway API). Transactional emails often require different sending reputation than marketing.

**Target Delivery Server - AutoResponder**
Which delivery server to use for autoresponder sequences. You can route different email types to different servers for better deliverability.

::: tip Delivery Server Strategy
Use separate delivery servers (and IP addresses) for transactional vs marketing emails. This protects your transactional email reputation if marketing campaigns hit spam traps.
:::

### Trial Group Settings

**Trial Group**
Enable this option to make this user group a trial/temporary group. Users in trial groups are automatically disabled after the trial period expires.

**Trial Expire Seconds**
Number of days until trial accounts expire. For example, set to `14` for a 14-day trial period.

::: info Trial Group Use Cases
Trial groups are perfect for:
- Free trial offers before requiring payment
- Demo accounts for sales prospects
- Time-limited testing accounts
:::

### Payment & Credit System

**Payment System**
Enable the payment system for this user group. When enabled, users are charged based on email sending volume and other usage metrics.

**Credit System**
Enable the credit-based system where users must have credits to send emails. Each email sent deducts credits from their balance.

**Payment System Charge Amount**
Monthly base fee charged to users in this group.

**Campaigns Per Campaign Cost**
Fixed cost charged per campaign sent.

**Campaigns Per Recipient**
Enable per-recipient billing for campaigns. Users are charged based on number of recipients.

**AutoResponders Charge Amount**
Monthly fee for autoresponder feature access.

**AutoResponders Per Recipient**
Enable per-recipient billing for autoresponder emails.

**Design Preview Charge Per Request**
Cost charged each time a user requests an email design preview.

**Design Preview Charge Amount**
Monthly fee for design preview feature access.

**Payment Pricing Range**
JSON configuration defining tiered pricing based on volume. Higher volumes typically get lower per-email costs.

::: warning Payment System Configuration
The payment system is complex and requires integration with payment processors. Most installations disable this and handle billing externally.
:::

### Sender Domain Management

**Sender Domain Management**
Enable advanced sender domain management features. When enabled, users can add and verify their own sending domains with SPF, DKIM, and DMARC records.

**Default Sender Domain Activate**
Enable automatic assignment of a default sender domain for users in this group.

**Default Sender Domain**
The domain automatically assigned to new users in this group (e.g., `yourdomain.com`).

**Default Sender Domain Monthly Limit**
Maximum number of emails that can be sent from the default sender domain per month.

::: tip Default Sender Domain Strategy
Provide a default sender domain for users who don't have their own domain. This allows them to send emails immediately while they set up their custom domain.
:::

### Email Gateway Settings

**Email Gateway DNS Template**
DNS record template to use for Email Gateway sender domains. Templates define required SPF, DKIM, and DMARC records.

**Email Gateway New Domain Manual Approval**
When enabled, new sender domains added to Email Gateway require administrator approval before they can be used. Useful for preventing abuse.

**Disable SES Plugins**
Disable Amazon SES-related plugins for this user group. Set to enabled if users should not access SES features.

### Email Campaign Settings

**Email Campaign DNS Template**
DNS record template to use for email campaign sender domains. Can differ from Email Gateway template.

**Disable List-Unsubscribe Header**
Remove the `List-Unsubscribe` email header from campaigns. Not recommended - this header helps deliverability.

::: danger List-Unsubscribe Header
Disabling this header can harm deliverability. Major email providers (Gmail, Yahoo, Outlook) use this header to provide one-click unsubscribe options. Keep this disabled (unchecked) unless you have a specific reason.
:::

### User Experience Settings

**Show Email Throughput**
Display real-time email sending throughput statistics in the user dashboard. Useful for users who want to monitor sending performance.

**Simplified Campaign Create UI**
Enable a streamlined campaign creation interface that hides advanced options. Recommended for non-technical users.

**Prevent Email Campaign Create If SpamAssassin Score Is Not Zero**
Block users from sending campaigns that don't pass SpamAssassin testing with a perfect score. Very strict - use cautiously.

::: warning SpamAssassin Prevention
Only enable this if you want to enforce extremely strict spam filtering. Most legitimate emails don't achieve a perfect SpamAssassin score. A score below 5.0 is generally acceptable.
:::

### Sender Information

**Enable Sender Info**
Allow users to configure sender information (company name, postal address) in their account settings.

**Forced Sender Info**
Require users to complete sender information before they can send campaigns. Helps ensure CAN-SPAM compliance.

### Subscription Plans

**Subscription Plan**
An identifier for the subscription plan associated with this user group (e.g., `starter`, `professional`, `enterprise`). Used for integration with billing systems.

**Subscription Plan Is Default**
Mark this user group as the default for the selected subscription plan. When users sign up for a plan, they're automatically assigned to the default group.

::: info Subscription Plan Workflow
Subscription plans integrate with payment processors and registration systems. When a user purchases "Professional Plan", they're automatically placed in the user group marked as default for that plan.
:::

### Rate Limits

**Default Rate Limits**
JSON configuration defining sending rate limits for this user group. Controls how quickly emails can be sent to prevent overwhelming SMTP servers or triggering spam filters.

Example configuration:
```json
{
  "hourly": 1000,
  "daily": 10000,
  "concurrent_connections": 10
}
```

::: tip Rate Limiting Strategy
Rate limits protect your sending reputation. Even with unlimited quotas, use rate limits to space out sending and avoid spam filter triggers. Start conservative: 1,000/hour for new domains, 10,000/hour for established domains.
:::

### Recommended Configuration

For most installations, we recommend the following user group settings for optimal deliverability and compliance:

**Enable Sender Information** → **Turn ON**
Enable **Enable Sender Info** and **Forced Sender Info** to ensure users provide company name and postal address. This is required for CAN-SPAM compliance and helps build trust with recipients.

**Force Unsubscribe Link** → **Turn ON**
Enable **Force Unsubscription Link** to require an unsubscribe link in all campaign emails. This is legally required in most jurisdictions and improves deliverability with major email providers.

**Simplified Campaign UI** → **Turn ON**
Enable **Simplified Campaign Create UI** to provide a streamlined, user-friendly campaign creation experience. This is especially helpful for non-technical users and reduces configuration errors.

**Sender Domain Management** → **Turn ON**
Enable **Sender Domain Management** to allow users to add and verify their own sending domains. This improves deliverability and sender reputation compared to using shared domains.

**Delivery Server Configuration** → **Required**
Before activating a user group, you must create at least one Delivery Server (under **Settings** → **Delivery Servers**) and assign it to all three delivery channels:

- **Target Delivery Server - Marketing** → Select your delivery server
- **Target Delivery Server - Transactional** → Select your delivery server
- **Target Delivery Server - AutoResponder** → Select your delivery server

Without configured delivery servers, users will not be able to send emails.

::: warning Delivery Server Requirement
User groups cannot send emails without assigned delivery servers. Configure your delivery servers first, then assign them to user groups.
:::

### Important Notes

- Changes to user group settings affect **all existing users** in that group, not just new users
- Users cannot change their own group - only administrators can reassign users to different groups
- Create separate user groups for different customer tiers or use cases rather than trying to make one group fit all needs
- Test new user group configurations with a test user account before deploying to production users

## Settings Walkthrough

Octeth's System Settings provide comprehensive control over your email marketing platform. This walkthrough guides you through each settings section, explaining what each option does and how to configure it for optimal performance and security.

All system settings are accessed through the administrator dashboard by clicking **Preferences** in the top navigation menu, then selecting **System Settings** from the dropdown.

Each settings section controls a specific aspect of your Octeth installation:
- Account and security settings for administrators
- Email delivery infrastructure and routing
- SMS gateway configuration
- Integration with external services
- User interface customization and branding
- System-wide preferences and behaviors

As you go through each section, you'll notice some settings are critical for initial setup (like delivery servers and administrator credentials), while others are optional enhancements you can configure later based on your specific needs.

::: tip Configuration Best Practice
Before making changes to system settings, it's a good idea to document your current configuration. Take screenshots or note down current values so you can revert if needed. Some settings affect email deliverability and user experience immediately.
:::

Let's walk through each settings section in detail.

## Administrator Account

The Administrator Account section is where you manage your own administrator profile, configure system email settings, and access your API key. These settings control how you log in to Octeth and how the system sends notifications and alerts.

To access these settings, navigate to **Preferences** → **System Settings** → **Admin Account** in the administrator dashboard.

### Account Information

This tab contains your personal administrator account details and login credentials.

**Name**
Your full name as the system administrator. This name appears in system logs and may be visible in certain administrative interfaces.

**Email Address**
The email address associated with your administrator account. This address is used for:
- Password recovery if you forget your login credentials
- Important system notifications about your Octeth installation
- Administrative alerts and updates

::: tip
Use a reliable email address that you check regularly. Losing access to this email could make account recovery difficult.
:::

**Username**
Your login username for accessing the Octeth administrator dashboard. This is the username you enter on the login page.

::: info
The username cannot be changed once your account is created. If you need to change it, you'll need to create a new administrator account.
:::

**New Password**
Use this field to change your administrator password. Leave this field blank if you want to keep your current password.

::: warning
Choose a strong password with at least 12 characters, including uppercase letters, lowercase letters, numbers, and symbols. Your administrator account has complete control over your Octeth installation, so password security is critical.
:::

**Best Practices for Account Information:**
- Use your actual name in the **Name** field for accountability in system logs
- Keep your email address up to date
- Change your password regularly (every 90 days is recommended)
- Never share your administrator credentials with anyone

### Email Addresses

This tab configures the email addresses and sender information used for system-generated notifications.

**Sender Name**
The name that appears in the "From" field when Octeth sends system notification emails. This might include alerts about user activity, system errors, or threshold warnings.

Example: If you set this to "Octeth Admin Team", recipients will see emails from "Octeth Admin Team" in their inbox.

**Sender Email**
The email address used in the "From" field for system notification emails. This should be a valid email address on a domain you control.

::: tip
Use a dedicated email address for system notifications, such as `noreply@yourdomain.com` or `alerts@yourdomain.com`. This keeps system emails separate from your personal correspondence.
:::

**Send Alerts To**
The email address where Octeth sends important system alerts. These alerts include:
- User threshold warnings (when users are approaching or exceeding their limits)
- System health notifications
- Critical errors or issues requiring administrator attention

::: info
This can be the same as your administrator email address, or you can route alerts to a team inbox or monitoring system.
:::

**Best Practices for Email Addresses:**
- Ensure the **Sender Email** domain has proper SPF and DKIM records configured to avoid deliverability issues
- Use a monitored email address for **Send Alerts To** so you don't miss important system notifications
- Consider using your company name or product name in **Sender Name** for professional appearance
- Test system emails after configuring these settings to ensure they're delivered correctly

### API

This tab displays your administrator API key, which provides access to administrator-only API endpoints and system configuration.

**API Key**
This unique key authenticates API requests that require administrator privileges. The API key grants full access to:
- Administrator-only API endpoints
- System configuration via API
- Advanced automation and integration capabilities

The API key is displayed in a read-only field. You cannot edit it directly, but you can regenerate it if needed.

::: danger Security Warning
Your API key provides complete administrator-level access to your Octeth installation. Treat it like a password:
- Never share it publicly or commit it to version control systems
- Never embed it directly in client-side code or public websites
- Store it securely using environment variables or secret management tools
- Regenerate the key immediately if you suspect it has been compromised
:::

::: tip
If you're using the API key in scripts or applications, store it in an environment variable rather than hardcoding it in your source code. This makes it easier to rotate the key if needed and keeps it out of version control.
:::

**When to Use the API Key:**
- Automating administrative tasks via scripts
- Integrating Octeth with other business systems
- Building custom monitoring or reporting tools
- Performing bulk operations that aren't available in the UI

**Security Best Practices for API Access:**
1. Only use the API key on secure, trusted servers
2. Never transmit the API key over unencrypted connections (always use HTTPS)
3. Implement IP whitelisting if your infrastructure supports it
4. Rotate the API key periodically (every 6-12 months)
5. Monitor API access logs for suspicious activity
6. Revoke and regenerate the key immediately if a team member with API access leaves your organization

::: details How to Regenerate Your API Key
If you need to regenerate your API key (for example, if it's been compromised or you want to rotate it for security purposes):

1. Contact Octeth support or use the regeneration feature if available in your version
2. Update all applications and scripts that use the old key
3. Test thoroughly to ensure everything works with the new key
4. Document the key change and update any stored credentials

Note: Regenerating the API key will immediately invalidate the old key, breaking any applications or scripts that use it.
:::

After configuring your Administrator Account settings, click the **UPDATE ADMINISTRATOR ACCOUNT** button at the bottom of the page to save your changes.

## Sub-Administrator Accounts

Sub-Administrator Accounts allow you to grant limited administrative access to team members without giving them full control over your Octeth installation. This feature is essential for delegating responsibilities while maintaining security and accountability.

To access this section, navigate to **Preferences** → **System Settings** → **Sub Admin Accounts** in the administrator dashboard.

### What Are Sub-Admin Accounts?

A sub-administrator account is a restricted admin account that can only access specific parts of the Octeth system. Unlike the main administrator account, which has complete control over all settings and users, sub-admin accounts are limited to the permissions you grant them.

**Common use cases for sub-admin accounts:**

- **User Support Team** - Give support staff access to manage users and view reports without allowing them to change system settings
- **Client Services** - Allow account managers to browse and edit specific user groups without access to delivery servers or system configuration
- **Marketing Team** - Grant your marketing team access to campaign management and reports without exposing sensitive system settings
- **Junior Administrators** - Provide limited access to new team members as they learn the system
- **Contractors** - Give temporary administrative access to consultants or contractors with clearly defined boundaries

::: info
The main administrator account always retains full control. Sub-admin accounts cannot create other sub-admin accounts or modify system-level settings unless explicitly granted those permissions.
:::

### Viewing Sub-Admin Accounts

The Sub Admin Accounts page displays a list of all existing sub-administrator accounts with their name and email address. If no sub-admin accounts exist, you'll see a message prompting you to create your first one.

From this page, you can:
- **Create** new sub-admin accounts using the "Create a sub admin account" button
- **Edit** existing accounts by clicking on their name
- **Delete** accounts by selecting them and clicking the Delete button

::: warning
Deleting a sub-admin account is permanent and cannot be undone. The sub-admin will immediately lose access to the administrator dashboard. Make sure to remove their access intentionally and communicate with the team member beforehand.
:::

### Creating a Sub-Admin Account

Follow these steps to create a new sub-administrator account:

1. Navigate to **Preferences** → **System Settings** → **Sub Admin Accounts**
2. Click the **Create a sub admin account** button
3. Fill in the account information (see below)
4. Configure permissions (see below)
5. Click **CREATE** to save the account

The sub-admin will then be able to log in using their username and password at your Octeth administrator login URL.

#### Account Information Tab

This tab contains the basic details for the sub-admin account.

**Name**
The full name of the person who will use this account. This name appears in system logs and helps you identify who made which changes.

**Email Address**
The contact email address for this sub-administrator. This email is used for:
- Password recovery if they forget their login credentials
- System notifications relevant to their permissions
- Communication about account status changes

**Username**
The login username for this sub-admin account. They'll enter this username when logging into the administrator dashboard.

::: tip
Use a clear naming convention for usernames, such as `firstname.lastname` or `role.firstname`. This makes it easier to identify accounts in logs and when managing multiple sub-admins.
:::

**Password**
Set a secure password for this account. You can:
- Enter a password manually in the field
- Click **Generate a strong password** to automatically create a secure random password

::: warning
Make sure to securely share the password with the sub-admin. Consider using a password manager or secure communication channel. Never send passwords via unencrypted email.
:::

**Best Practices for Account Information:**
- Use real names to maintain accountability
- Use business email addresses (not personal accounts) for professional environments
- Generate strong passwords and encourage sub-admins to change them on first login
- Keep a record of which sub-admin accounts exist and who has access to them

#### Permissions Tab

The Permissions tab is where you define exactly what this sub-admin can access and do within Octeth. Permissions are configured using a JSON (JavaScript Object Notation) structure.

::: info What is JSON?
JSON is a simple text format for storing structured data. Don't worry if you're not familiar with it - we'll provide ready-to-use examples below that you can copy and modify.
:::

The permissions configuration has two main parts:

**1. AccessAllowedUserGroupIDs**
This is an array (list) of user group IDs that this sub-admin can manage. If this array is empty `[]`, the sub-admin cannot access any user groups.

Example:
```json
"AccessAllowedUserGroupIDs": [1, 3, 5]
```

This means the sub-admin can only manage users in groups 1, 3, and 5. They won't see users from other groups.

::: tip Finding User Group IDs
To find a user group's ID, navigate to **Users** → **User Groups** and look at the URL when viewing or editing a group. The ID is the number in the URL after `/usergroups/`. For example, if the URL is `/app/admin/usergroups/edit/3`, the ID is `3`.
:::

**2. AccessOptions**
This is an array of permission strings that control which sections of Octeth this sub-admin can access and what actions they can perform.

Example:
```json
"AccessOptions": [
  "Users",
  "User.Browse",
  "User.Edit"
]
```

Common permission strings include:
- `Users` - Access to the Users section
- `User.Browse` - Ability to view user accounts
- `User.Edit` - Ability to edit user accounts
- `User.Create` - Ability to create new user accounts
- `User.Delete` - Ability to delete user accounts
- `Campaigns` - Access to email campaigns
- `Campaign.Browse` - Ability to view campaigns
- `Campaign.Edit` - Ability to edit campaigns
- `Reports` - Access to reports and analytics
- `DeliveryServers` - Access to delivery server settings
- `SystemSettings` - Access to system-wide settings

::: details Click here to learn how to set permissions
To customize permissions for your sub-admin:

1. Click the "Click here" link below the permissions editor for detailed documentation
2. Review the available permission strings for your Octeth version
3. Copy one of the example configurations below
4. Modify the user group IDs and permission strings to match your needs
5. Paste the configuration into the Permissions field

The permissions system uses a hierarchical structure. For example:
- Granting `Users` gives general access to the Users section
- Adding `User.Browse` allows viewing user details
- Adding `User.Edit` allows modifying user information

You typically need both the parent permission (`Users`) and the specific action (`User.Edit`) for the sub-admin to perform that action.
:::

### Common Permission Configurations

Here are ready-to-use permission configurations for common scenarios. Copy and paste these into the Permissions field, then modify the user group IDs as needed.

**1. User Support Representative**
Can browse and edit users in specific groups, but cannot delete users or access system settings:

```json
{
  "AccessAllowedUserGroupIDs": [1, 2],
  "AccessOptions": [
    "Users",
    "User.Browse",
    "User.Edit"
  ]
}
```

**2. Campaign Manager**
Can create, edit, and send campaigns, and view reports, but cannot manage users or system settings:

```json
{
  "AccessAllowedUserGroupIDs": [],
  "AccessOptions": [
    "Campaigns",
    "Campaign.Browse",
    "Campaign.Create",
    "Campaign.Edit",
    "Campaign.Send",
    "Reports"
  ]
}
```

**3. Account Manager**
Can fully manage users in assigned groups and view their campaign performance:

```json
{
  "AccessAllowedUserGroupIDs": [3, 4, 5],
  "AccessOptions": [
    "Users",
    "User.Browse",
    "User.Create",
    "User.Edit",
    "User.Delete",
    "Reports"
  ]
}
```

**4. Read-Only Auditor**
Can view users, campaigns, and reports, but cannot make any changes:

```json
{
  "AccessAllowedUserGroupIDs": [1, 2, 3, 4, 5],
  "AccessOptions": [
    "Users",
    "User.Browse",
    "Campaigns",
    "Campaign.Browse",
    "Reports"
  ]
}
```

**5. Technical Administrator**
Can manage delivery servers and system settings, but not users:

```json
{
  "AccessAllowedUserGroupIDs": [],
  "AccessOptions": [
    "DeliveryServers",
    "DeliveryServer.Browse",
    "DeliveryServer.Create",
    "DeliveryServer.Edit",
    "SystemSettings",
    "Reports"
  ]
}
```

::: tip Starting with Minimal Permissions
When in doubt, start with fewer permissions and add more as needed. It's easier (and safer) to grant additional access later than to revoke permissions that were too broad. Begin with browse-only access and gradually add edit/create/delete permissions based on the sub-admin's responsibilities.
:::

### Security Best Practices

Follow these security guidelines when managing sub-admin accounts:

**Account Management:**
1. **Use the principle of least privilege** - Only grant the minimum permissions needed for each sub-admin to do their job
2. **Create separate accounts for each person** - Never share sub-admin accounts between multiple team members
3. **Review permissions regularly** - Audit sub-admin access every 3-6 months and remove unnecessary permissions
4. **Disable accounts promptly** - Delete or disable sub-admin accounts immediately when team members leave or change roles
5. **Document who has access** - Keep a record of all sub-admin accounts, who they belong to, and what permissions they have

**Password Security:**
1. **Require strong passwords** - Use the "Generate a strong password" feature or enforce strong password requirements
2. **Encourage password changes** - Ask sub-admins to change their password after first login
3. **Never share passwords** - Each person should have their own unique credentials
4. **Use secure communication** - Share initial passwords through encrypted channels, not email

**Permission Security:**
1. **Limit user group access** - Only grant access to user groups the sub-admin needs to manage
2. **Restrict system settings** - Reserve SystemSettings and DeliveryServers permissions for trusted team members
3. **Monitor activity** - Regularly review system logs to ensure sub-admins are using their access appropriately
4. **Separate concerns** - Don't give billing/financial access to the same people who have technical access

::: danger Critical Security Warning
Sub-admin accounts with `SystemSettings` permissions can make changes that affect your entire Octeth installation, including email deliverability and system security. Only grant these permissions to highly trusted team members who understand the implications of system-level changes.
:::

### Managing Existing Sub-Admin Accounts

To edit an existing sub-admin account:

1. Navigate to **Preferences** → **System Settings** → **Sub Admin Accounts**
2. Click on the name of the sub-admin you want to edit
3. Update the account information or permissions as needed
4. Click **UPDATE** to save your changes

To delete a sub-admin account:

1. Navigate to **Preferences** → **System Settings** → **Sub Admin Accounts**
2. Check the box next to the sub-admin account(s) you want to delete
3. Click the **Delete** button
4. Confirm the deletion

::: warning
Changes to permissions take effect immediately. If you edit a sub-admin's permissions while they're logged in, they may need to log out and log back in for the changes to fully apply.
:::

### Troubleshooting

**Sub-admin can't see any users**

Make sure the `AccessAllowedUserGroupIDs` array contains the IDs of the user groups they should access. An empty array `[]` means they can't see any users.

**Sub-admin can't perform actions they should be able to**

Check that you've granted both the parent permission and the specific action permission. For example, to edit users, they need both `Users` and `User.Edit`.

**Sub-admin sees an "Access Denied" message**

This means they're trying to access a section they don't have permission for. Review their `AccessOptions` array and add the necessary permissions.

**JSON permissions show an error**

Make sure your JSON is properly formatted:
- All strings are in double quotes: `"Users"` not `'Users'`
- Arrays use square brackets: `[1, 2, 3]`
- Objects use curly braces: `{ }`
- Commas separate items, but don't add a comma after the last item

If you're unsure, copy one of the example configurations above and modify it carefully.

After creating or editing a sub-admin account, the new credentials and permissions take effect immediately. The sub-admin can log in at your Octeth administrator URL using their username and password.

## Security

Security settings help protect your Octeth installation from unauthorized access by restricting which IP addresses can access your system and by enabling two-factor authentication for administrator accounts.

To access these settings, navigate to **Preferences** → **System Settings** → **Security** in the administrator dashboard.

::: danger Critical Warning
The security settings on this page can lock you out of your Octeth installation if configured incorrectly. Always test IP restrictions carefully and have a backup access method (such as server console access) available before making changes.
:::

### Authorized IP Addresses

The Authorized IP Addresses feature allows you to restrict access to the Octeth administrator area to specific IP addresses or IP ranges. This is a powerful security measure that prevents unauthorized access even if someone obtains valid administrator credentials.

**How It Works:**

When you add IP addresses to this field, only visitors connecting from those IP addresses will be able to access the administrator login page and dashboard. Anyone connecting from other IP addresses will be blocked from accessing the admin area.

**To configure authorized IP addresses:**

1. Enter one IP address per line in the **Authorized IP Addresses** text area
2. You can use individual IP addresses or CIDR notation for IP ranges
3. Leave the field blank to allow access from any IP address (default behavior)
4. Click **UPDATE SECURITY SETTINGS** to save your changes

**IP Address Formats:**

You can enter IP addresses in several formats:

**Single IP Address:**
```
203.0.113.45
192.168.1.100
```

**Multiple IP Addresses (one per line):**
```
203.0.113.45
198.51.100.78
192.0.2.123
```

**CIDR Notation (IP Ranges):**
```
203.0.113.0/24
192.168.1.0/24
10.0.0.0/8
```

::: info What is CIDR Notation?
CIDR (Classless Inter-Domain Routing) notation allows you to specify a range of IP addresses using a slash followed by a number. For example:
- `192.168.1.0/24` includes all IP addresses from 192.168.1.0 to 192.168.1.255 (256 addresses)
- `10.0.0.0/8` includes all IP addresses from 10.0.0.0 to 10.255.255.255 (16.7 million addresses)
- `203.0.113.0/28` includes IP addresses from 203.0.113.0 to 203.0.113.15 (16 addresses)

Use CIDR notation when you want to allow access from an entire office network or data center.
:::

**Common Use Cases:**

**Office Network Access Only:**
```
203.0.113.0/24
```
Only allows access from your office's IP range.

**Multiple Office Locations:**
```
203.0.113.0/24
198.51.100.0/24
192.0.2.0/28
```
Allows access from multiple office networks.

**Office + Home Office + VPN:**
```
203.0.113.50
198.51.100.78
192.0.2.100
10.8.0.0/24
```
Allows access from office, specific home IPs, and VPN IP range.

::: danger Lockout Risk
If you enter IP addresses and save the settings, you will immediately lose access to the administrator area if your current IP address is not on the list. Before clicking **UPDATE SECURITY SETTINGS**, make absolutely certain that:

1. Your current IP address is included in the list
2. You know how to access your server directly (SSH/console) to revert the changes if needed
3. You've tested the IP addresses are correct

**To find your current IP address:** Search "what is my IP" in Google, or the security page may display it for you. Write it down before making changes.
:::

::: tip Testing IP Restrictions Safely
Before implementing IP restrictions in production:

1. **Find your current IP address** and add it to the list first
2. **Open a second browser** (or incognito window) while keeping your current session active
3. **Try logging in** with the new browser to verify your IP is whitelisted
4. **Only close your original session** after confirming the new session works
5. **Keep server SSH access** available as a backup to revert changes if needed

This way, if something goes wrong, you still have an active session to fix the configuration.
:::

### User Area IP Restrictions

Below the Authorized IP Addresses field, you'll find a checkbox labeled **"Disable access to the user area from IP addresses not listed above"**.

**How It Works:**

When this checkbox is enabled, the IP restrictions you configured above apply not only to the administrator area but also to the user area (where your regular users log in to manage their campaigns and subscribers).

- **Unchecked (Default):** IP restrictions only apply to the administrator area. Regular users can log in from anywhere.
- **Checked:** IP restrictions apply to both administrator and user areas. Only visitors from whitelisted IPs can access either area.

**When to Use This:**

Enable user area IP restrictions when:
- You're running an internal email platform for employees only
- Your users all work from the same office or VPN
- You want maximum security for a private installation
- Compliance requirements mandate IP-based access control

**When NOT to Use This:**

Don't enable user area IP restrictions when:
- Your users work remotely from various locations
- Users travel and need access from different networks
- You're running a public SaaS platform
- Users access from mobile networks (which have changing IPs)

::: warning User Area Lockouts
If you enable this option and users try to log in from unauthorized IP addresses, they will see a 403 Forbidden error page. Make sure all your users' IP addresses or networks are included in the authorized list before enabling this feature, or you'll receive support complaints from locked-out users.
:::

### Two Factor Authentication Settings

Two-factor authentication (2FA) adds an extra layer of security to your administrator account. Even if someone steals or guesses your password, they won't be able to log in without the 6-digit code from your authenticator app.

**How It Works:**

Once 2FA is enabled, logging into the administrator area requires two things:
1. Your username and password (something you know)
2. A 6-digit code from your authenticator app (something you have)

The 6-digit code changes every 30 seconds, making it virtually impossible for attackers to gain access even if they have your password.

**Setting Up Two-Factor Authentication:**

Follow these steps to enable 2FA on your administrator account:

1. Navigate to **Preferences** → **System Settings** → **Security**
2. Scroll down to the **Two Factor Authentication Settings** section
3. You'll see a QR code and an alphanumeric secret key
4. Install an authenticator app on your smartphone if you haven't already:
   - **Google Authenticator** ([iOS](https://apps.apple.com/app/google-authenticator/id388497605) / [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2))
   - **Authy** ([iOS](https://apps.apple.com/app/authy/id494168017) / [Android](https://play.google.com/store/apps/details?id=com.authy.authy))
   - **Microsoft Authenticator** ([iOS](https://apps.apple.com/app/microsoft-authenticator/id983156458) / [Android](https://play.google.com/store/apps/details?id=com.azure.authenticator))
5. Open your authenticator app and scan the QR code displayed on the screen
   - **Alternative:** If you can't scan the QR code, manually enter the secret key shown below it
6. Your authenticator app will now display a 6-digit code that changes every 30 seconds
7. Enter the current 6-digit code in the field labeled **"Enter the generated 6 digit code above"**
8. Click **UPDATE SECURITY SETTINGS**

If the code was entered correctly, 2FA is now enabled. The next time you log in, you'll be prompted for a 2FA code after entering your username and password.

::: tip Save Your Secret Key
Write down or securely store the alphanumeric secret key displayed below the QR code. If you lose your phone or need to set up a new device, you can use this key to restore your 2FA configuration without being locked out.

Store it in a secure location like:
- A password manager (1Password, LastPass, Bitwarden)
- An encrypted note
- A secure physical location (not with your phone)
:::

**Using Two-Factor Authentication:**

After 2FA is enabled, the login process changes:

1. Enter your username and password as usual
2. Click **Login**
3. You'll be prompted for a 2FA code
4. Open your authenticator app and find the 6-digit code for Octeth
5. Enter the code (you have 30 seconds before it expires)
6. Click **Submit** or press Enter

The code changes every 30 seconds, so if it expires while you're typing, just wait for the new code and enter that one instead.

::: warning Backup Access
Before enabling 2FA:

1. **Save your secret key** in a secure location
2. **Test the 2FA login** while keeping your current session open
3. **Ensure you have server access** to disable 2FA via configuration files if needed
4. **Don't close your current session** until you've successfully logged in with 2FA

If you lose access to your authenticator app and don't have the secret key, you may need to disable 2FA directly on the server.
:::

**Disabling Two-Factor Authentication:**

If you need to disable 2FA (for example, if you lost your phone):

**Method 1: Via the Security Settings (if you still have access):**
1. Navigate to **Preferences** → **System Settings** → **Security**
2. In the 2FA section, enter a valid 6-digit code
3. Clear the code field or enter an invalid code
4. Click **UPDATE SECURITY SETTINGS**

**Method 2: Via Server Access (if you're locked out):**
1. SSH into your Octeth server
2. Contact Octeth support for instructions on manually disabling 2FA via configuration files or database

### Security Best Practices

Follow these recommendations to maintain strong security for your Octeth installation:

**IP Address Restrictions:**
1. **Start conservatively** - Begin with a small list of known IPs and expand as needed
2. **Use CIDR notation** for entire office networks instead of listing individual IPs
3. **Document your IP list** - Keep a record of what each IP/range represents
4. **Review quarterly** - Remove IP addresses or ranges that are no longer needed
5. **Test before deploying** - Always test IP restrictions in a secondary browser session first
6. **Keep emergency access** - Maintain SSH or console access to your server to revert changes

**Two-Factor Authentication:**
1. **Enable 2FA immediately** - It's your best defense against password compromise
2. **Save the secret key** - Store it securely separate from your phone
3. **Use a reputable authenticator app** - Google Authenticator, Authy, or Microsoft Authenticator
4. **Test before committing** - Verify 2FA works while keeping your current session open
5. **Have a backup method** - Ensure you can access your server directly if locked out

**General Security:**
1. **Combine multiple methods** - Use both IP restrictions and 2FA for maximum security
2. **Monitor login attempts** - Regularly review administrator login logs
3. **Use strong passwords** - Even with 2FA, use complex, unique passwords
4. **Limit administrator accounts** - Only create admin accounts for people who absolutely need them
5. **Regular audits** - Review security settings every 3-6 months

::: info Defense in Depth
Security is most effective when you use multiple layers. Consider implementing:
- IP address restrictions (network layer)
- Two-factor authentication (application layer)
- Strong passwords (authentication layer)
- Regular security audits (process layer)
- Server firewalls (infrastructure layer)

This "defense in depth" approach ensures that if one security measure fails, others are still protecting your system.
:::

### Troubleshooting

**I'm locked out after enabling IP restrictions**

If you accidentally locked yourself out by adding the wrong IP addresses:

1. **Check if you have an active session** - If you still have Octeth open in another browser tab, use it to fix the IP list
2. **Access via SSH** - Log into your server directly and edit the security configuration:
   ```bash
   ssh root@your-server-ip
   # Contact Octeth support for specific file locations and commands
   ```
3. **Temporary disable IP restrictions** - Via server access, temporarily disable the feature to regain access
4. **Contact your hosting provider** - If you can't access the server, your hosting provider may be able to help

**2FA code isn't working**

If your authenticator app code is rejected:

1. **Check the time** - Make sure your phone's clock is accurate. 2FA codes are time-based, so even a few minutes off can cause issues
2. **Wait for a new code** - If the code is about to expire, wait for the next one
3. **Re-scan the QR code** - Delete the Octeth entry from your authenticator app and scan again
4. **Manually enter the secret key** - If QR scanning doesn't work, manually type the secret key into your app
5. **Check for typos** - Make sure you're entering all 6 digits correctly

**User area is blocked for all users**

If you enabled "Disable access to the user area" but forgot to add user IP addresses:

1. **Uncheck the option** - Navigate to Security settings and uncheck "Disable access to the user area from IP addresses not listed above"
2. **Add user IPs/ranges** - Before re-enabling, ensure all user IP addresses or networks are in the authorized list
3. **Test with one user** - Have a single user test access before rolling out to everyone

**Lost my phone with the authenticator app**

If you lost access to your 2FA app:

1. **Use your saved secret key** - Install an authenticator app on a new device and enter the secret key manually
2. **Server-level disable** - Access your server via SSH and manually disable 2FA (contact Octeth support for instructions)
3. **Recovery codes** - If you generated backup codes (some installations support this), use one to log in

::: danger Prevention is Key
Most lockout situations can be avoided by:
- Testing changes before committing to them
- Keeping secondary access methods available (SSH, console)
- Storing 2FA secret keys securely
- Noting your current IP address before enabling restrictions
- Making changes during low-traffic periods when mistakes are less disruptive
:::

After configuring your security settings, click the **UPDATE SECURITY SETTINGS** button to save your changes. Security settings take effect immediately, so test thoroughly before closing your current session.

## Default Opt-In Email

The Default Opt-In Email is a system-wide fallback template used for double opt-in confirmation emails when users haven't created their own custom opt-in email for their mailing lists. This template ensures that subscribers always receive a confirmation email, even if the list owner hasn't configured one.

**When is this email used?**

This default template is automatically used when:
1. A user creates a new mailing list without configuring a custom opt-in email
2. A user enables double opt-in for their list but hasn't set up their own confirmation email template
3. The list-specific opt-in email template is missing or deleted

**Navigation:** **Preferences** → **System Settings** → **Default Opt-In Email**

::: info Understanding Double Opt-In
Double opt-in is an email marketing best practice where subscribers must confirm their email address by clicking a link in a confirmation email. This process:
- Ensures email addresses are valid and actively monitored
- Reduces spam complaints and bounce rates
- Complies with GDPR and other email marketing regulations
- Protects your sender reputation
:::

### What You'll Configure

The Default Opt-In Email settings page has two fields that you need to fill out:

#### Email Subject

This is the subject line that subscribers will see when they receive the confirmation email. Make it clear that this is a confirmation request so subscribers know they need to take action.

**Tips for writing a good subject line:**
- Keep it short and clear (aim for under 50 characters)
- Make it obvious this is a confirmation email
- Avoid spam trigger words like "FREE" or "URGENT"
- You can use personalization tags to make it more specific (we'll explain these below)

**Example subject lines:**
```
Please confirm your subscription
Confirm your email address
%User:CompanyName%: Complete Your Subscription
One more step to subscribe
Verify your subscription request
```

#### Plain Email Content

This is the actual message that subscribers will read in the email. This field only supports plain text - you can't use HTML formatting, colors, or images here.

**What to include in your message:**
- A friendly greeting
- An explanation of why they're receiving this email
- A clear instruction to click the confirmation link
- What happens if they ignore the email
- Contact information in case they have questions
- You can use personalization tags to customize the message (we'll explain these below)

::: warning Plain Text Only
This template only supports plain text. If you try to add HTML tags like `<b>` or `<br>`, they'll show up as plain text in the email and won't format anything. If you need fancy HTML emails with logos and colors, you'll need to create custom templates for individual mailing lists.
:::

### Personalization Tags

Personalization tags are special codes that automatically get replaced with real information when the email is sent. For example, if you use `%User:FirstName%` in your template, it will show as "John" when the email goes out.

**How to add personalization tags:**

1. Click in the **Email Subject** or **Plain Email Content** field where you want to add a tag
2. Look for the **Insert Personalization Tags** dropdown menu below the field
3. Select the tag you want from the dropdown
4. The tag will be inserted at your cursor position

**Available personalization tags:**

**Opt-in confirmation links** (Required!)
- `%Link:Confirm%` - The confirmation link subscribers must click to complete their subscription
- `%Link:Reject%` - A link to reject the subscription if they didn't sign up

**Subscriber information**
- `%Subscriber:HashedSubscriberID%` - A unique identifier for the subscriber

**User information** (Information about the list owner)
- `%User:FirstName%` - List owner's first name
- `%User:LastName%` - List owner's last name
- `%User:EmailAddress%` - List owner's email address
- `%User:CompanyName%` - List owner's company name
- `%User:Website%` - List owner's website URL
- `%User:Street%` - Street address
- `%User:City%` - City
- `%User:State%` - State
- `%User:Zip%` - Zip code
- `%User:Country%` - Country
- `%User:Phone%` - Phone number
- `%User:Fax%` - Fax number
- `%User:TimeZone%` - Time zone

**Other useful tags**
- `%Date=...%` - Email delivery date (you can customize the format)
- `%MFROMDomain%` - The sending domain
- `%Random:FirstName%` - Generates a random first name
- `%Random:LastName%` - Generates a random last name

::: danger Critical Tag Required
You MUST include `%Link:Confirm%` in the email body. This is the confirmation link that subscribers click to complete their subscription. Without this tag, the opt-in process won't work and subscribers won't be able to confirm their subscription. Always double-check this tag is present before saving.
:::

### Example Template

Here's a professional example template that follows best practices:

**Email Subject:**
```
Please confirm your subscription
```

**Plain Email Content:**
```
Hello,

Thank you for subscribing to our mailing list from %User:CompanyName%!

To complete your subscription and start receiving our emails, please confirm your email address by clicking the link below:

%Link:Confirm%

If you didn't request this subscription, you can safely ignore this email. Your email address will not be added to our list unless you click the confirmation link above.

Why are you receiving this email?
Someone entered your email address into a subscription form on our website. This confirmation step ensures that we have your permission to send you emails.

Questions or concerns?
If you have any questions, please contact us at %User:EmailAddress%

Thank you,
%User:CompanyName%
```

### Relationship to List-Specific Opt-In Emails

Understanding the hierarchy of opt-in email templates:

**Priority Levels:**
1. **List-Specific Template** (Highest Priority) - If a user has created a custom opt-in email for their list, that template is used
2. **Default Template** (Fallback) - If no list-specific template exists, this system-wide default is used

**When Users Should Create List-Specific Templates:**
- When they want HTML-formatted opt-in emails (default only supports plain text)
- When they need different messaging for different lists
- When they want to customize the opt-in experience for their brand
- When they need language-specific versions for different audiences

**Your Role as Administrator:**
- The default template you configure here serves as a safety net for all users
- Make it professional, clear, and compliant with email regulations
- Keep it generic enough to work for any list or industry
- Encourage users to create their own custom templates for better branding

::: info Multi-User Considerations
In a multi-tenant Octeth installation, this default template is used by ALL users who haven't configured their own opt-in emails. Make sure your template is professional and generic enough to represent any type of business or organization.
:::

### Best Practices

**Content Guidelines:**
1. **Be transparent** - Clearly explain why they're receiving this email
2. **Make the CTA obvious** - The confirmation link should be easy to find
3. **Include context** - Mention when and where they signed up
4. **Provide an out** - Explain what happens if they ignore the email
5. **Add contact info** - Give them a way to reach support if needed

**Compliance Considerations:**
1. **GDPR Compliance** - Double opt-in helps demonstrate consent
2. **CAN-SPAM Compliance** - Include accurate sender information
3. **Brand Consistency** - Use professional language that represents your organization
4. **Accessibility** - Use plain text for maximum compatibility

**Technical Best Practices:**
1. **Always include `%Link:Confirm%`** - This is non-negotiable; without it, the opt-in won't work
2. **Test with real data** - Send test emails to verify personalization works
3. **Keep it plain text** - Don't try to use HTML tags; they won't render
4. **Use proper tag syntax** - Tags must be exact: `%Tag:Name%` with percent signs and colons
5. **Avoid special characters** - Stick to standard ASCII characters for compatibility

**Deliverability Tips:**
1. **Avoid spam words** - Don't use "FREE", "URGENT", or excessive exclamation marks
2. **Keep it concise** - Shorter emails have better deliverability
3. **Include unsubscribe context** - Explain that ignoring the email = no subscription
4. **Use sender tags** - Help subscribers recognize your brand with `%User:CompanyName%`

::: tip Professional Tone
Your default template represents your entire Octeth installation. Use professional, neutral language that works for any industry. Avoid overly casual language, emojis, or industry-specific jargon that might not apply to all users.
:::

## Delivery Servers

Delivery Servers are SMTP connections between Octeth and mail servers that handle the actual sending of your email campaigns. Each delivery server represents a configured SMTP server (like Amazon SES, SendGrid, Mailgun, or your own mail server) that physically delivers emails to recipients' inboxes.

To access delivery server management, navigate to **Preferences** → **System Settings** → **Delivery Servers** in the administrator dashboard.

::: info Production Setup
Before you can send email campaigns, you need at least one delivery server properly configured and verified. Each delivery server connects to an SMTP service that you've either set up yourself or signed up for separately. Octeth handles campaign management and personalization - the delivery servers handle the actual email transmission.
:::

::: warning Critical for Email Delivery
Delivery servers are where you configure the technical settings that make or break your email deliverability. Incorrect settings can prevent emails from sending, while proper configuration with SPF, DKIM, and DMARC ensures your emails reach inboxes instead of spam folders.
:::

### Creating a New Delivery Server

To create a new delivery server, click **Create a new delivery server** from the Delivery Servers page. The configuration is organized into two tabs: **Delivery Method** and **Domains**.

### Delivery Method Tab

This tab configures how Octeth connects to your SMTP server to send emails.

**Name**

Give your delivery server a descriptive name for administrative purposes. This helps you identify it when you have multiple servers configured or when reviewing sending reports.

Examples of good server names:
```
Amazon SES - Production
SendGrid - Transactional
Mailgun - Marketing Campaigns
Office SMTP - Internal Communications
```

::: tip Naming Convention
Use names that clearly identify the provider, purpose, or sending type. If you have multiple accounts with the same provider, include distinguishing details like "Production" vs "Testing" or campaign types like "Marketing" vs "Transactional".
:::

**Host Address/IP**

Enter the domain or IP address of your SMTP server. This is provided by your email service provider or mail server administrator.

Common examples:
- Amazon SES: `email-smtp.us-east-1.amazonaws.com`
- SendGrid: `smtp.sendgrid.net`
- Mailgun: `smtp.mailgun.org`
- Your own server: `mail.yourdomain.com` or an IP address like `192.168.1.100`

**SMTP Port**

Enter the port number your SMTP server uses for connections. Common ports depend on your security settings:
- Port `25` - Standard SMTP (usually blocked by cloud providers)
- Port `587` - SMTP with STARTTLS (recommended for most providers)
- Port `465` - SMTP with SSL (less common, but supported)
- Port `2525` - Alternative port (used by some providers when 25/587 are blocked)

::: tip Port Selection
Most modern email providers use port `587` with TLS encryption. This is the recommended configuration for best compatibility and security.
:::

**Encryption**

Select the security protocol your SMTP server requires:
- **None** - No encryption (only use for testing on trusted networks)
- **SSL** - SSL/TLS encryption from connection start (typically used with port 465)
- **TLS** - STARTTLS encryption after initial connection (typically used with port 587)

::: warning Security Recommendation
Always use TLS or SSL encryption when sending through the internet. Unencrypted connections expose your authentication credentials and email content to potential interception.
:::

**Connection Timeout**

Set how long (in seconds) Octeth should wait for the SMTP server to respond before giving up. Default is `10` seconds.

- Lower values (5-10 seconds) - Fail faster if the server is down, but may cause failures on slow connections
- Higher values (15-30 seconds) - More patient with slow servers, but delays error detection

::: tip Timeout Guidelines
For most configurations, `10` seconds works well. Only increase this if you're experiencing timeout errors with a reliable but slow SMTP server. For cloud-based providers like Amazon SES or SendGrid, `10` seconds is sufficient.
:::

**SMTP Authentication**

Choose whether your SMTP server requires username and password authentication:
- **Yes** - Most email providers require authentication (Amazon SES, SendGrid, Mailgun, etc.)
- **No** - Only for open relay servers or special configurations (rare and not recommended)

::: warning Authentication Required
Nearly all modern SMTP services require authentication to prevent spam and unauthorized use. Select "Yes" unless you have a specific reason not to.
:::

**Username** (when authentication is enabled)

Enter the username provided by your email service provider. This is often:
- An actual username like `apiuser@yourdomain.com`
- An API key identifier
- An access key ID (for Amazon SES)

**Password** (when authentication is enabled)

Enter the password or API key provided by your email service provider. For security:
- Never share this password
- Use API keys instead of account passwords when possible
- Store API keys securely - Octeth encrypts them in the database

::: tip API Keys vs Passwords
Many email providers (Amazon SES, SendGrid, Mailgun) use API keys instead of passwords. API keys are more secure because they can be:
- Revoked without changing your account password
- Created with limited permissions
- Rotated regularly for security
:::

### Domains Tab

This tab configures the domains used for email authentication, tracking, and delivery. Proper domain configuration is critical for deliverability and compliance with email authentication standards (SPF, DKIM, DMARC).

**Link Tracking Domain**

Enter the domain that will be used when Octeth tracks clicks on links in your emails. When subscribers click a link, they're briefly redirected through this domain before reaching the actual destination.

Example: `click.mydomain.com`

::: info Why Link Tracking Domains Matter
Using a dedicated subdomain for link tracking:
- Protects your main domain's reputation
- Allows separate DNS configuration for tracking infrastructure
- Provides clearer analytics by domain
- Enables domain-based filtering and routing
:::

**Open Tracking Domain**

Enter the domain used to track when recipients open your emails. Octeth inserts a tiny invisible image hosted on this domain - when the email is opened, the image loads and registers the open.

Example: `track.mydomain.com`

**MFROM Domain**

This is the "mail-from" domain (also called envelope sender or return-path domain) used in the SMTP envelope. This domain is critical for:
- SPF (Sender Policy Framework) verification
- DKIM (DomainKeys Identified Mail) signing
- DMARC (Domain-based Message Authentication) alignment
- Bounce email processing and routing

You can enter either:
- A domain like `bounces.mydomain.com`
- A full email address like `noreply@bounces.mydomain.com`

::: warning Domain vs Email Address
If you enter a full email address here, bounce processing will be disabled and the exact address will be used as the envelope sender. Some SMTP providers (like Amazon SES) require a complete email address instead of just a domain. Check your provider's documentation.
:::

::: info Email Authentication Standards
The MFROM domain is used for SPF/DKIM/DMARC verification by recipient mail servers. Make sure:
- This domain has proper SPF, DKIM, and DMARC DNS records configured
- The domain aligns with your sending domain for DMARC compliance
- You have access to manage DNS records for this domain
:::

**Enforced From Email Address**

If you want to force all emails sent through this delivery server to use a specific "From" address regardless of campaign settings, enter it here. This is useful for:
- Complying with strict DMARC alignment requirements
- Ensuring brand consistency across all campaigns
- Meeting provider requirements (some require all emails come from verified addresses)

Example: `noreply@bounces.mydomain.com`

::: tip When to Use Enforced From
Leave this empty unless you have a specific requirement:
- **Use it when:** Your email provider requires all emails to use verified sender addresses, or you need strict DMARC alignment
- **Leave empty when:** You want campaigns to use different sender addresses based on list settings or campaign configuration
:::

**Sender Email Options**

Two checkboxes control how Octeth handles sender information:

**Use the recipient list sender email address as MFROM email address if possible**

When checked, Octeth will try to use the sender email address configured in the subscriber list settings as the MFROM (envelope sender). This provides better sender alignment but requires the list's sender domain to be properly configured with SPF/DKIM records.

**Use the recipient list sender email address as From email address if possible**

When checked, Octeth will use the sender email address from the subscriber list in the visible "From" header of the email. This allows different lists to have different sender identities while using the same delivery server.

::: warning Sender Address Conflicts
If you enable these options AND set an "Enforced From Email Address", the enforced address will take priority. The checkboxes only apply when the enforced address field is empty.
:::

### DNS Verification

After creating your delivery server, Octeth provides DNS verification tools to test your configuration. On the delivery server edit page, you'll see verification status for:

- **Email Delivery** - Tests if emails can be successfully sent through the SMTP server
- **SPF** - Verifies the MFROM domain has proper SPF records
- **DKIM** - Verifies the domain has DKIM signing keys configured
- **DMARC** - Verifies the domain has a DMARC policy published
- **Sender Domain** - Checks if the sending domain is properly configured
- **Link Domain** - Verifies the link tracking domain resolves correctly
- **Open Domain** - Verifies the open tracking domain resolves correctly

::: tip Run Verification After Setup
Always click **Run DNS Test** after creating a delivery server and configuring your DNS records. Green checkmarks indicate everything is configured correctly. Red X marks show what needs attention. Fix any issues before using the server for production campaigns.
:::

[[SCREENSHOT: Delivery servers list showing server names, MFROM domains, and verification status with green checkmarks for SPF, DKIM, DMARC]]

### Creating a Test Delivery Server with Mailpit

Octeth includes a built-in email testing tool called Mailpit. Mailpit is an SMTP and mailbox simulator that captures all emails you send through it without actually delivering them to real recipients. This is invaluable for:
- Testing email templates and layouts before sending to real subscribers
- Verifying personalization tags work correctly
- Checking email structure and formatting
- Training new team members without risk of sending test emails to real people
- Development and troubleshooting without affecting your sender reputation

::: info What is Mailpit?
Mailpit acts like a real SMTP server and accepts all emails you send to it, but instead of delivering them to recipients, it stores them in a web-based inbox you can review. Think of it as a "sandbox" for safely testing your email campaigns.
:::

**Accessing Mailpit**

Mailpit runs as a Docker container within your Octeth installation and can be accessed through your web browser at:

```
http://your-oempro-domain:8025
```

Replace `your-oempro-domain` with your actual Octeth server address. For example: `http://octeth.mydomain.com:8025`

**Configuring Access to Mailpit**

For security, Mailpit is only accessible from authorized IP addresses. You need to add your IP address to the access control list.

1. SSH into your Octeth server and open the HAProxy configuration file:

```bash
nano /opt/octeth/_dockerfiles/haproxy.cfg
```

2. Find the `frontend frontend_mailpit_admin` section. It looks like this:

```
frontend frontend_mailpit_admin
    bind *:8025
    mode http

    acl network_allowed src 192.168.99.0/24
    http-request deny if !network_allowed

    use_backend backend_mailpit_admin
```

3. Add your IP address to the `acl network_allowed` line. You can add multiple IP addresses separated by spaces:

```
acl network_allowed src 192.168.99.0/24 203.0.113.45 198.51.100.22
```

Replace `203.0.113.45` with your actual IP address. If you're not sure what your IP address is, visit [https://whatismyipaddress.com](https://whatismyipaddress.com) from your computer.

4. Save the file and exit the editor (in nano: press `Ctrl+X`, then `Y`, then `Enter`)

5. Apply the changes by rebuilding and restarting the HAProxy container:

```bash
cd /opt/octeth/
docker-compose build haproxy
docker-compose kill haproxy && docker-compose up -d haproxy
```

6. Wait a few seconds for HAProxy to restart, then open your web browser and navigate to `http://your-oempro-domain:8025`

You should see the Mailpit web interface with an empty inbox ready to receive test emails.

::: tip Finding Your IP Address
Your IP address can change, especially if you're working from different locations or using a VPN. If you suddenly can't access Mailpit, check if your IP address has changed and update the HAProxy configuration accordingly.
:::

**Creating the Mailpit Delivery Server**

Now that you can access Mailpit's web interface, create a delivery server in Octeth that sends emails to Mailpit:

1. Navigate to **Preferences** → **System Settings** → **Delivery Servers**
2. Click **Create a new delivery server**
3. Configure the **Delivery Method** tab with these specific values:

| Field | Value |
|-------|-------|
| Name | `Mailpit` or `Testing - Mailpit` |
| Host Address/IP | `192.168.99.102` |
| SMTP Port | `1025` |
| Encryption | **None** (No secured connection) |
| Connection Timeout | `10` |
| SMTP Authentication | **No** (Authentication not required) |
| Username | *(leave empty)* |
| Password | *(leave empty)* |

4. Configure the **Domains** tab with these values:

| Field | Value |
|-------|-------|
| Link Tracking Domain | Your Octeth domain (e.g., `octeth.mydomain.com`) |
| Open Tracking Domain | Your Octeth domain (e.g., `octeth.mydomain.com`) |
| MFROM Domain | Your primary sender domain (e.g., `bounces.mydomain.com`) |
| Enforced From Email Address | *(leave empty)* |
| Use the recipient list sender email address as MFROM | *(unchecked)* |
| Use the recipient list sender email address as From | *(unchecked)* |

5. Click **Create Delivery Server**

**Testing Your Mailpit Setup**

After creating the delivery server, verify it works correctly:

1. Click on the newly created **Mailpit** delivery server from the list
2. Go to the **DNS Test** tab
3. Click **Test Delivery Server**
4. Wait a few seconds - you should see "Email Delivery ⇒ PASSED" with a green checkmark

[[SCREENSHOT: DNS Test tab showing "Email Delivery ⇒ PASSED" with green checkmark]]

5. Open your web browser and go to `http://your-oempro-domain:8025`
6. You should see the test email in the Mailpit inbox

[[SCREENSHOT: Mailpit web interface showing test email in inbox]]

**Using Mailpit for Campaign Testing**

To test a campaign with Mailpit:

1. Create your campaign as usual
2. When selecting the delivery server, choose **Mailpit**
3. Send the campaign to a test subscriber list
4. Check the Mailpit web interface to review the emails

All emails will be captured in Mailpit's inbox where you can:
- View HTML and plain text versions
- Check email headers
- See how personalization tags were replaced
- Test links and tracking
- Review the email source code

::: warning Mailpit is for Testing Only
Never use Mailpit for production email sending. It's designed for testing and development - emails sent to Mailpit are never delivered to real recipients. Always switch to a proper production delivery server (Amazon SES, SendGrid, etc.) before sending real campaigns.
:::

::: tip Best Practice
Keep your Mailpit delivery server clearly labeled (like "Testing - Mailpit" or "DO NOT USE FOR PRODUCTION") to prevent accidentally using it for real campaigns. You can also set it as inactive when not actively testing.
:::

### Managing Existing Delivery Servers

The Delivery Servers page shows all configured servers with:
- Server name and SMTP host
- MFROM domain
- Verification status (Email Delivery, SPF, DKIM, DMARC indicators)
- Links to verification details and Google Postmaster Tools

You can:
- **Edit** - Click the server name to modify configuration
- **Delete** - Select servers and click delete (only if not actively used in campaigns)
- **Verify** - Click "Run verification" to recheck DNS and delivery settings
- **Monitor** - Click "Google Postmaster" to view deliverability metrics (requires Google Postmaster Tools setup)

::: warning Before Deleting
You cannot delete a delivery server that's currently assigned to active campaigns or scheduled sends. Pause or complete those campaigns first, or reassign them to a different delivery server.
:::

## Email Delivery Settings

Email Delivery Settings control how Octeth sends emails, handles bounces and spam complaints, and processes email headers. These are system-wide default settings that apply when specific delivery servers aren't configured.

To access these settings, navigate to **Preferences** → **System Settings** → **Email Delivery Settings** in the administrator dashboard.

::: info Production Setup Recommendation
Most production installations should use Delivery Servers instead of these global SMTP settings. Delivery Servers provide better performance, load balancing, and failover capabilities. Use these Email Delivery Settings primarily for:
- Initial testing and setup
- Backup/fallback email delivery
- Simple installations with a single SMTP server
:::

The Email Delivery Settings page has five tabs: **Email Delivery**, **Load Balancing**, **Bounce Handling**, **Spam Complaint Handling**, and **Headers**.

### Email Delivery Tab

This tab configures the primary settings for how emails are sent from your Octeth installation.

**X-Mailer**

An optional identifier that appears in the `X-Mailer` email header. This helps you identify emails sent from your Octeth installation when reviewing email headers or troubleshooting delivery issues.

Example: If you set this to `Octeth v5.7`, the email headers will include `X-Mailer: Octeth v5.7`.

::: tip
Use a descriptive value like your company name or the Octeth version number. This makes it easier to identify your emails in logs and helps with technical support requests.
:::

**Seed List**

A list of email addresses (one per line) that will receive a blind carbon copy (BCC) of every email campaign sent through Octeth. This is useful for monitoring email deliverability, content quality, and inbox placement.

Example seed list:
```
monitoring@yourdomain.com
team@yourdomain.com
deliverability-test@example.com
```

::: info Common Use Cases
- **Deliverability Monitoring** - Send copies to Gmail, Yahoo, Outlook addresses to check inbox placement
- **Content Approval** - Include your legal or compliance team to review all outgoing campaigns
- **Archive/Backup** - Maintain a complete record of all sent campaigns
- **Testing** - Verify campaign rendering across different email clients
:::

::: warning Performance Impact
Each seed list email address adds one additional email to every campaign. If you have 1,000 seed addresses and send a campaign to 100,000 recipients, Octeth will actually send 101,000 emails. Keep your seed list small to avoid unnecessary overhead.
:::

**Alias List**

Email address mappings that rewrite recipient addresses before sending. Each line contains an original address and a replacement address separated by a space or comma.

Example alias list:
```
old-address@example.com new-address@example.com
deprecated@company.com current@company.com
```

When Octeth encounters the old address in a campaign, it automatically sends to the new address instead.

::: tip
Use aliases to handle email migrations, redirect deprecated addresses, or consolidate testing accounts without updating your subscriber lists.
:::

**Relay Domains**

A list of domains (one per line) that should be relayed through your Octeth installation's email system. This is an advanced configuration typically used in complex email infrastructure setups.

Example:
```
subsidiary.com
partner-domain.com
```

::: info
Leave this field empty unless you have a specific relay configuration requirement. Most installations don't need relay domains configured.
:::

**Pre-Header Text Template**

An HTML template that's inserted at the very beginning of every email's content. Pre-header text is the preview text that appears next to or below the subject line in email clients.

Click **Click here for default template** to insert the standard pre-header template:
```html
<div style="display: none; max-height: 0px; overflow: hidden;">_PreHeaderText_</div>
<div style="display: none; max-height: 0px; overflow: hidden;">&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
```

The `_PreHeaderText_` placeholder gets replaced with the actual pre-header text defined in each campaign.

::: info What is Pre-Header Text?
Pre-header text is the snippet of text that appears in the inbox preview, right after the subject line. It's pulled from the first visible text in your email, but this template allows you to control it explicitly. The second div with special characters helps push unwanted text out of the preview.
:::

::: tip Best Practices for Pre-Header Text
- Keep it under 100 characters for maximum compatibility
- Make it complement your subject line, not repeat it
- Use it to provide additional context or urgency
- Test how it appears across different email clients
:::

**Subscriber Snapshot**

When enabled, this option captures a complete snapshot of each subscriber's data at the moment an email is sent. This preserved data can be used for:
- Viewing historical subscriber information
- Auditing what data was personalized in past campaigns
- Compliance and data retention requirements

::: warning Storage Considerations
Enabling subscriber snapshots increases database storage requirements, as each email sent creates a copy of the subscriber's data. For high-volume sending (millions of emails per day), this can result in significant database growth.
:::

**On-Demand SSL Domain Check URL**

This read-only field displays the URL that SSL certificate authorities use to verify domain ownership when setting up automated SSL certificates for sender domains.

Example: `https://yourdomain.com/app/domain_verify/run/abc123def456...`

::: info
You don't need to configure this manually. If you're setting up SSL certificates for your sender domains, provide this URL to your SSL certificate authority or automated certificate system when requested.
:::

**Send Method**

Choose how Octeth delivers emails. The send method determines which email infrastructure Octeth uses to send your campaigns.

Available send methods are organized into three categories:

**Standard Methods:**

- **SMTP (Custom)** - Connect to any SMTP server using custom settings. This gives you full control over your email delivery infrastructure.

**Integrated Services:**

- **SendGrid** - Use SendGrid's email delivery service with simplified configuration
- **Mailgun** - Use Mailgun's email delivery API via SMTP
- **Mailjet** - Use Mailjet's email sending infrastructure
- **Amazon SES** - Use Amazon Simple Email Service for email delivery

**Advanced Methods:**

- **Save to Disk** - Save emails as files on your server instead of sending them. Useful for development and testing.

::: tip Choosing a Send Method
For production use:
- **Use Delivery Servers** (configured separately) for best performance and flexibility
- Use these global SMTP settings only as a backup or for simple installations

For testing:
- **Save to Disk** is perfect for development environments where you want to verify email content without actually sending emails
:::

Each send method has different configuration requirements:

**SMTP (Custom) Configuration:**

When you select SMTP, you'll need to configure these settings:

- **Host** - The SMTP server hostname (e.g., `smtp.yourserver.com`)
- **Port** - The SMTP port number (typically `25`, `465`, or `587`)
- **Security** - Encryption method:
  - `None` - No encryption (not recommended for production)
  - `SSL` - SSL/TLS encryption on port 465
  - `TLS` - STARTTLS encryption on port 587
- **Timeout** - How long (in seconds) to wait for the SMTP server to respond before giving up (typically `15` seconds)
- **Authentication** - Whether the SMTP server requires login credentials:
  - `Yes` - Server requires username and password
  - `No` - Server allows anonymous sending
- **Username** - Your SMTP account username (if authentication is enabled)
- **Password** - Your SMTP account password (if authentication is enabled)

::: warning SMTP Port and Security Guidelines
- Port `25` - Unencrypted, often blocked by ISPs, not recommended
- Port `465` - SSL encryption, older standard but still widely supported
- Port `587` - TLS encryption, modern standard, recommended for most setups

Always use encrypted connections (`SSL` or `TLS`) for production email sending to protect your credentials and email content.
:::

**SendGrid Configuration:**

- **Username** - Your SendGrid API username
- **Password** - Your SendGrid API key

SendGrid automatically configures the host (`smtp.sendgrid.net`) and port (`25`) for you.

::: tip Getting SendGrid Credentials
1. Log in to your SendGrid account
2. Go to Settings → API Keys
3. Create a new API key with "Mail Send" permissions
4. Use `apikey` as the username and your API key as the password
:::

**Mailgun Configuration:**

- **Username** - Your Mailgun SMTP username (format: `postmaster@yourdomain.mailgun.org`)
- **Password** - Your Mailgun SMTP password

Mailgun automatically configures the host (`smtp.mailgun.org`) and port (`25`) for you.

**Mailjet Configuration:**

- **Username** - Your Mailjet API key
- **Password** - Your Mailjet secret key

Mailjet automatically configures the host (`in.mailjet.com`) and port (`25`) for you.

**Amazon SES Configuration:**

- **Host** - Your SES SMTP endpoint (e.g., `email-smtp.us-east-1.amazonaws.com`)
- **Security** - Always uses `TLS` encryption
- **Username** - Your SMTP username (from SES console → SMTP Settings)
- **Password** - Your SMTP password (generated when creating SMTP credentials)

::: info Finding Your SES Endpoint
The endpoint depends on your AWS region:
- `email-smtp.us-east-1.amazonaws.com` - US East (N. Virginia)
- `email-smtp.us-west-2.amazonaws.com` - US West (Oregon)
- `email-smtp.eu-west-1.amazonaws.com` - Europe (Ireland)

Check the SES console in your AWS region for the correct endpoint.
:::

**Save to Disk Configuration:**

- **Directory Path** - The server directory where email files will be saved (e.g., `/var/www/html/data/emails/`)

::: warning File System Permissions
The directory must exist and be writable by the web server user (typically `www-data` or `apache`). Each email is saved as a separate `.eml` file with a timestamp and unique identifier.
:::

**Testing Your Email Delivery Settings**

After configuring your send method, click the **Test Email Delivery Settings** button at the bottom of the page. This sends a test email to verify that your configuration works correctly.

::: tip
Always test your email delivery settings after making changes. The test email will be sent to the administrator email address configured in your account settings.
:::

### Load Balancing Tab

Load balancing helps prevent your emails from being rate-limited or blocked by pausing between batches of emails. This is particularly useful when sending through SMTP servers that have hourly or daily sending limits.

**Load Balancing Status**

Enable or disable load balancing for email delivery:
- **Enabled** - Octeth pauses between email batches
- **Disabled** - Octeth sends emails continuously without pausing

**Emails Per Batch**

The number of emails to send before pausing. For example, if you set this to `100`, Octeth will send 100 emails, pause, send another 100, pause again, and continue this pattern.

::: info Choosing a Batch Size
Your batch size should align with your SMTP provider's limits:
- **SendGrid Free** - Limit to 100 emails per batch
- **Mailgun** - Typically safe with 500-1000 per batch
- **Custom SMTP** - Check with your email provider for recommended batch sizes
- **Amazon SES** - Start with 1000 per batch (SES has a default sending rate of 14 emails/second)
:::

**Sleep Duration**

The number of seconds to wait between batches. For example, if you set this to `60`, Octeth will wait 60 seconds after sending each batch before starting the next batch.

::: warning Calculating Total Send Time
Load balancing significantly impacts how long it takes to send large campaigns. For example:
- Campaign size: 10,000 emails
- Batch size: 100 emails
- Sleep duration: 60 seconds
- Total batches: 10,000 / 100 = 100 batches
- Total sleep time: 100 batches × 60 seconds = 6,000 seconds (1.67 hours)

Balance your need for rate-limiting against how quickly you need campaigns delivered.
:::

::: tip Recommended Settings
For most SMTP providers with hourly limits:
- **Emails Per Batch**: 100-500
- **Sleep Duration**: 30-60 seconds

For providers with high volume limits or dedicated infrastructure:
- **Emails Per Batch**: 1000-5000
- **Sleep Duration**: 10-30 seconds

Monitor your delivery logs and adjust based on actual performance and any rate limiting you encounter.
:::

### Bounce Handling Tab

Bounce handling processes email bounces (undeliverable emails) and automatically updates subscriber statuses to maintain list hygiene and protect your sender reputation.

**Bounce Forward To**

An optional email address where all bounce messages will be forwarded. This creates a copy of every bounce notification for your records or external processing systems.

Example: `bounces-archive@yourdomain.com`

::: tip
Use this field if you want to:
- Archive all bounces for compliance purposes
- Process bounces with external systems
- Monitor bounce patterns manually
- Feed bounce data into a data warehouse or analytics platform

Leave it empty if you only want Octeth to process bounces automatically.
:::

**Bounce Catchall Domain**

The domain used to create unique bounce email addresses for tracking. Each email sent includes a unique bounce address (e.g., `bounce-abc123@yourdomain.com`) that allows Octeth to identify which email bounced.

Example: `bounce.yourdomain.com`

::: danger Critical Configuration Requirement
This domain must be:
1. **Properly configured in DNS** - Point it to your Octeth server
2. **Set up as a catch-all** - Accept emails for any address at this domain
3. **Different from your sending domain** - Use a dedicated subdomain

Without proper configuration, bounce processing will not work, and bounced emails will not be tracked.
:::

::: details Setting Up a Bounce Domain
1. Create a subdomain like `bounce.yourdomain.com`
2. Add an MX record pointing to your Octeth server
3. Configure your server to accept all emails for this domain (catch-all)
4. Test by sending an email to `test-anything@bounce.yourdomain.com` and verify it arrives

Example DNS configuration:
```
bounce.yourdomain.com.    MX    10    mail.yourserver.com.
```
:::

**Soft Bounce Threshold**

The number of consecutive soft bounces (temporary delivery failures) before Octeth treats the address as a hard bounce (permanent failure).

Example: If set to `3`, an address that soft-bounces 3 times in a row will be marked as a hard bounce and removed from future sends.

::: info Soft vs. Hard Bounces
- **Soft Bounce** - Temporary failure (mailbox full, server temporarily unavailable)
- **Hard Bounce** - Permanent failure (address doesn't exist, domain invalid)

Soft bounces can resolve themselves (e.g., when mailbox space is freed), but repeated soft bounces usually indicate a permanent problem.
:::

::: tip Recommended Threshold
A threshold of `3-5` soft bounces works well for most use cases:
- `3` - More aggressive, faster list cleaning
- `5` - More lenient, gives temporary issues more time to resolve
- `7+` - Very lenient, may result in sending to dead addresses longer than necessary
:::

**Send Bounce Notification Email**

When enabled, Octeth sends an email notification to the administrator when bounces are detected. This helps you stay informed about delivery issues.

::: warning Notification Volume
For high-volume sending, bounce notifications can generate hundreds of emails per day. Consider disabling this for production campaigns and rely on bounce reports in the Octeth dashboard instead.
:::

**POP3 Bounce Status**

Controls whether Octeth checks a POP3 mailbox for bounce messages. This is useful when your bounce emails are delivered to a POP3 mailbox rather than being processed directly by Octeth.

Options:
- **Enabled** - Octeth connects to a POP3 mailbox to retrieve and process bounces
- **Disabled** - Octeth only processes bounces delivered directly via SMTP

When enabled, you must configure:

- **Host** - The POP3 server hostname (e.g., `mail.yourdomain.com`)
- **Port** - The POP3 port number (typically `110` for plain POP3, or `995` for SSL)
- **Username** - The POP3 account username
- **Password** - The POP3 account password
- **SSL** - Whether to use SSL encryption for the POP3 connection

::: info When to Use POP3 Bounce Processing
Use POP3 bounce processing if:
- Your email infrastructure forwards bounces to a specific mailbox
- You can't configure direct SMTP delivery of bounces to Octeth
- You're using a third-party email service that delivers bounces via email

Most modern setups process bounces directly via SMTP and don't need POP3 processing.
:::

::: tip POP3 Processing Best Practices
- Use a dedicated mailbox exclusively for bounces
- Enable SSL for security
- Configure Octeth to check the mailbox frequently (every 5-15 minutes)
- Monitor mailbox storage to ensure it doesn't fill up
- Use strong authentication credentials
:::

### Spam Complaint Handling Tab

Spam complaint handling processes feedback loop (FBL) reports from email providers when recipients mark your emails as spam. Proper handling maintains your sender reputation and ensures compliance with anti-spam regulations.

**Report Abuse Email**

The email address shown in abuse reports and List-Unsubscribe headers. Recipients and email providers can contact this address to report spam or abuse.

Example: `abuse@yourdomain.com`

::: danger Compliance Requirement
This email address must:
- Be actively monitored by a real person
- Respond to abuse complaints within 24-48 hours
- Be clearly associated with your organization
- Be capable of receiving high volumes of email

Failure to monitor this address can result in blacklisting and legal consequences under anti-spam laws like CAN-SPAM (US) and CASL (Canada).
:::

**X-Complaints-To**

The email address added to the `X-Complaints-To` email header. Many email providers use this header to route spam complaints.

You can use either:
- A specific email address: `complaints@yourdomain.com`
- A dynamic address: `complaints@%sender_domain%` (uses the sender's domain)

::: tip Dynamic Sender Domain
Using `@%sender_domain%` is useful in multi-tenant installations where each user has their own sending domain. The system automatically replaces `%sender_domain%` with the actual sender domain for each email.
:::

**FBL Incoming Email Address**

An optional email address where feedback loop (FBL) reports from email providers are sent. Major email providers (like Gmail, Yahoo, Outlook) send standardized abuse reports to this address when users mark emails as spam.

Example: `fbl@yourdomain.com`

::: info Setting Up Feedback Loops
To receive FBL reports:
1. Register with each email provider's FBL program:
   - Yahoo: https://help.yahoo.com/kb/postmaster/SLN3434.html
   - Microsoft/Outlook: https://sendersupport.olc.protection.outlook.com/snds/
   - Gmail: Uses its Postmaster Tools (no FBL program)
2. Provide this email address when registering
3. Configure Octeth to process FBL emails (see POP3 FBL Status below)
:::

**Unsubscribe Incoming Email Address**

An optional email address that processes email-based unsubscribe requests. When specified, unsubscribe links in your emails can include this address, allowing recipients to unsubscribe by sending an email.

Example: `unsubscribe@yourdomain.com`

::: warning Modern Unsubscribe Methods
Email-based unsubscribe (clicking a mailto: link) is outdated and problematic:
- Lower success rates (many email clients block mailto: links)
- Requires users to send an email manually
- Slower processing
- Less reliable

Modern best practice is to use HTTP-based unsubscribe links (one-click unsubscribe) handled through Octeth's web interface. Only configure this if you have a specific requirement for email-based unsubscribes.
:::

**POP3 FBL Status**

Controls whether Octeth checks a POP3 mailbox for feedback loop (FBL) reports and spam complaints.

Options:
- **Enabled** - Octeth connects to a POP3 mailbox to retrieve and process FBL reports
- **Disabled** - FBL processing is handled differently or not at all

When enabled, you must configure:

- **Host** - The POP3 server hostname (e.g., `mail.yourdomain.com`)
- **Port** - The POP3 port number (typically `110` for plain POP3, or `995` for SSL)
- **Username** - The POP3 account username
- **Password** - The POP3 account password
- **SSL** - Whether to use SSL encryption for the POP3 connection

::: info FBL Processing Workflow
When enabled, Octeth:
1. Connects to the POP3 mailbox at regular intervals
2. Downloads FBL reports and spam complaints
3. Parses the standardized FBL format
4. Automatically unsubscribes complainers
5. Marks subscribers as "complained" in the database
6. Deletes processed messages from the mailbox
:::

::: tip FBL Mailbox Setup
- Use a dedicated mailbox exclusively for FBL reports
- Don't use this mailbox for other purposes
- Enable SSL for security
- Monitor storage to prevent the mailbox from filling up
- Check that Octeth processes messages successfully (monitor logs)
:::

### Headers Tab

Custom email headers allow you to add metadata to your emails for categorization, tracking, and routing purposes. Headers are invisible to recipients but visible in the email's technical headers.

**What Are Custom Headers?**

Email headers are key-value pairs added to the email message that provide information about the email. While recipients never see these headers in their inbox, they're visible when viewing the email's raw source or headers.

Common uses for custom headers:
- **MTA Categorization** - Help your mail server categorize and prioritize emails
- **Tracking and Analytics** - Add identifiers for external tracking systems
- **Routing Rules** - Trigger specific handling rules in email infrastructure
- **Debugging** - Add information for troubleshooting delivery issues
- **Compliance** - Include required metadata for regulatory compliance

**Viewing Existing Headers**

The headers table shows all configured custom headers with:
- **Header Name** - The name of the header (e.g., `X-Campaign-Type`)
- **Scope** - Which delivery server this header applies to (or "Global" for all)
- **Email Type** - Which type of emails include this header
- **Header Value** - The value assigned to this header

You can select multiple headers using the checkboxes and delete them using the link at the bottom of the table.

**Adding a New Header**

To add a custom email header:

1. Scroll to the "Add a New Header" section
2. Enter the header name, email type, header value, and scope
3. Click **Add Header**

**Header Name**

The name of your custom header. Header names should:
- Start with `X-` to indicate a custom header (convention, not required)
- Use alphanumeric characters and hyphens
- Be descriptive of the header's purpose

Examples:
- `X-Campaign-ID` - Identifies the campaign
- `X-List-Category` - Categorizes the mailing list
- `X-Priority-Level` - Indicates email priority

::: tip Header Naming Conventions
While you can name headers anything, following these conventions helps:
- Prefix custom headers with `X-` (e.g., `X-Custom-Field`)
- Use title case with hyphens (e.g., `X-My-Custom-Header`)
- Make names descriptive and self-documenting
- Avoid conflicts with standard headers (don't use names like `From`, `To`, `Subject`)
:::

**Email Type**

Choose which type of emails will include this header:
- **All** - Added to all emails (campaigns, autoresponders, transactional)
- **Campaign** - Only added to regular email campaigns
- **Autoresponder** - Only added to autoresponder emails
- **Transactional** - Only added to transactional emails

::: info
Select "All" when the header should apply universally. Choose specific types when you need different headers for different email categories.
:::

**Header Value**

The value assigned to this header. This can be:
- **Static text** - A fixed value (e.g., `production`)
- **Personalization tags** - Dynamic values replaced at send time

Available personalization tags include:
- `%User:UserID%` - The sending user's ID
- `%User:EmailAddress%` - The sending user's email address
- `%UserGroup:UserGroupID%` - The user group ID
- `%Campaign:CampaignID%` - The campaign ID
- `%Campaign:CampaignName%` - The campaign name
- `%List:ListID%` - The mailing list ID
- `%Subscriber:SubscriberID%` - The recipient's subscriber ID
- `%Subscriber:EmailAddress%` - The recipient's email address
- `%Journey:JourneyID%` - The journey ID (for journey builder emails)
- `%Journey:ActionID%` - The journey action ID

::: warning Tag Validation
Invalid or unsupported merge tags will be automatically removed from header values during email delivery. Only use the tags listed in the dropdown menu or documented for your Octeth version.
:::

Example header values:
```
campaign-%Campaign:CampaignID%
user-%User:UserID%-list-%List:ListID%
subscriber:%Subscriber:EmailAddress%
```

**Scope**

Choose whether this header applies globally or only to specific delivery servers:
- **Global** - Added to all emails regardless of which delivery server is used
- **Specific Delivery Server** - Only added when emails are sent through a particular delivery server

::: tip When to Use Delivery Server Scope
Use delivery server-specific headers when:
- Different servers need different categorization
- You're A/B testing email infrastructure
- Specific servers require unique identifiers for routing
- You need to track which infrastructure handled each email

Use global scope for universal tracking and categorization that applies regardless of delivery infrastructure.
:::

**Common Header Examples**

Here are practical examples of custom headers:

**Campaign Tracking Header:**
```
Name: X-Campaign-ID
Type: Campaign
Value: %Campaign:CampaignID%
Scope: Global
```

**User Identification:**
```
Name: X-Sender-ID
Type: All
Value: user-%User:UserID%
Scope: Global
```

**List Categorization:**
```
Name: X-List-Category
Type: Campaign
Value: list-%List:ListID%
Scope: Global
```

**Priority Routing:**
```
Name: X-Priority-Level
Type: Transactional
Value: high
Scope: Specific Delivery Server
```

::: tip Testing Headers
After adding custom headers:
1. Send a test email
2. View the raw email source (most email clients have a "View Source" or "Show Original" option)
3. Verify your custom headers appear correctly in the email headers
4. Confirm personalization tags are replaced with actual values
:::

**Saving Your Settings**

After configuring all tabs, click **UPDATE EMAIL DELIVERY SETTINGS** at the bottom of the page to save your changes.

::: danger Test Before Production
After saving email delivery settings:
1. Click **Test Email Delivery Settings** to send a test email
2. Verify the test email arrives successfully
3. Check spam folders if the test doesn't arrive
4. Review email headers to confirm your configuration is correct

Never deploy to production without testing your email delivery configuration first. A misconfigured email delivery system can result in bounces, spam filtering, or complete delivery failure.
:::

::: warning Delivery Server Priority
If you have both Email Delivery Settings and Delivery Servers configured, Octeth uses this priority:
1. **Campaign-specific Delivery Server** - If a campaign specifies a server, use that
2. **Delivery Routes** - If routing rules match, use the specified server
3. **User Group Delivery Server** - If the user's group has a default server, use that
4. **Global Email Delivery Settings** - Fall back to these SMTP settings

Most production installations should rely on Delivery Servers and use these global settings only as a backup.
:::

## SMS Gateways

SMS Gateways are connections between Octeth and SMS service providers that enable you to send text messages to your subscribers. Each gateway represents a configured account with an SMS provider (like Twilio, Vonage, or other SMS services) that handles the actual message delivery.

To access SMS gateway management, navigate to **Preferences** → **System Settings** → **SMS Gateways** in the administrator dashboard.

::: info Production Setup
Before you can send SMS campaigns, you need at least one active SMS gateway configured. Each gateway connects to an SMS service provider that you've signed up with separately. Octeth doesn't provide SMS sending - it integrates with your existing SMS provider accounts.
:::

### Creating a New SMS Gateway

To create a new gateway, click **Create a new SMS gateway** from the SMS Gateways page. The creation process is organized into four tabs: **Basic Settings**, **Gateway Configuration**, **SMS Settings**, and **User Assignment**.

### Basic Settings Tab

This tab configures the fundamental properties of your SMS gateway.

**Gateway Name**

Give your gateway a descriptive name that helps you identify it later. This is especially important if you have multiple gateways configured.

Examples of good gateway names:
```
Twilio - US Numbers
Vonage - International
Testing Gateway - Sandbox
Customer Notifications - Production
```

::: tip Naming Convention
Use names that describe the purpose or geographic scope of the gateway. If you have multiple accounts with the same provider, include information that distinguishes them, like "Production" vs "Testing" or regional identifiers like "US" or "Europe".
:::

**Gateway Type**

Select your SMS service provider from the dropdown menu. Available options depend on which SMS provider integrations are installed in your Octeth system.

Common gateway types include:
- Twilio
- Vonage (formerly Nexmo)
- MessageBird
- Plivo
- Other supported providers

::: warning Cannot Be Changed
Once you create a gateway and save it, you cannot change the gateway type. If you need to switch providers, you must create a new gateway. Choose carefully when setting up your gateway for the first time.
:::

**Gateway Status**

Set whether this gateway is ready to use:
- **Active** - The gateway can be used for sending SMS messages
- **Inactive** - The gateway is disabled and won't be used for sending

::: tip When to Use Inactive
Set a gateway to Inactive when:
- You're still testing the configuration and don't want it used yet
- You need to temporarily disable a provider without deleting the gateway
- You're migrating to a new provider but want to keep the old one configured as backup
- You've hit your provider's spending limit and need to pause sending
:::

**Make this gateway available to all users (Global)**

Check this box to make the gateway available to all users in your Octeth installation. Uncheck it to limit the gateway to specific users.

**Global vs. User-Specific Gateways:**

- **Global Gateway** (checkbox checked) - All users can select this gateway when creating SMS campaigns. You don't need to assign specific users. This is useful for shared infrastructure or when all users should have the same SMS sending capabilities.

- **User-Specific Gateway** (checkbox unchecked) - Only assigned users can use this gateway. You must select which users can access it in the User Assignment tab. This is useful when:
  - Different users have their own SMS provider accounts
  - You want to control SMS sending access for billing or compliance reasons
  - You're testing a gateway with a limited group before making it globally available
  - Different users have different geographic or regulatory requirements

::: warning User Assignment Required
If you uncheck the global option, you MUST assign at least one user in the User Assignment tab. Non-global gateways with no assigned users cannot be saved.
:::

### Gateway Configuration Tab

This tab contains settings specific to your chosen SMS provider. The fields that appear here depend on which Gateway Type you selected in the Basic Settings tab.

::: info Dynamic Configuration
You won't see any fields in this tab until you select a Gateway Type in the Basic Settings tab and move to the Gateway Configuration tab. Each SMS provider requires different credentials and settings.
:::

**Common Configuration Fields:**

The exact fields vary by provider, but typically include:

**API Key / Account SID**
Your authentication credentials from the SMS provider. You'll find this in your provider's dashboard, usually under account settings or API credentials.

Example field names:
- `API Key` (MessageBird, Plivo)
- `Account SID` (Twilio)
- `API Key` (Vonage)

**API Secret / Auth Token**
A second credential that works together with your API key for authentication.

Example field names:
- `Auth Token` (Twilio)
- `API Secret` (Vonage, MessageBird)
- `Auth ID` (Plivo)

**API Base URL** (some providers)
The web address where Octeth connects to your provider's API. Most providers use a standard URL that's pre-filled, but some allow custom endpoints.

::: tip Finding Your Credentials
To locate your API credentials:

1. Log into your SMS provider's dashboard
2. Navigate to Settings, Account, or API section
3. Look for "API Credentials", "API Keys", or "Account Information"
4. Copy the credentials exactly as shown - they're often case-sensitive

If you can't find your credentials, check your provider's documentation or contact their support team.
:::

**Testing Your Configuration**

Once you've entered your gateway credentials, click the **TEST CONNECTION** button to verify that Octeth can successfully connect to your SMS provider.

The test will:
- Verify your credentials are correct
- Check that your account is active
- Confirm Octeth can communicate with the provider's API
- Report any connection issues or authentication errors

::: warning Test Before Saving
Always test your connection before clicking CREATE. If the test fails, double-check your credentials and account status with your SMS provider. A successful test doesn't send any actual SMS messages - it only verifies the connection.
:::

### SMS Settings Tab

This tab configures how SMS messages are sent through this gateway.

**Sender Numbers**

Enter the phone numbers you've registered with your SMS provider that will appear as the "from" number when recipients receive your messages. Enter one phone number per line.

Format requirements:
- Include the country code
- Start with a `+` symbol
- No spaces, dashes, or parentheses

Examples:
```
+12125551234
+442071234567
+61291234567
```

::: tip Sender Number Registration
Most SMS providers require you to register or purchase phone numbers before you can use them as sender IDs. You cannot use random numbers - they must be provisioned through your SMS provider's platform.

Some providers also support alphanumeric sender IDs (like "MyCompany") in certain countries. Check with your provider for availability and registration requirements.
:::

**Message Concatenation Limit**

SMS messages have a character limit (typically 160 characters for standard text). When your message exceeds this limit, it must be split into multiple parts that are reassembled by the recipient's phone.

This setting controls how many message parts can be combined for a single long message. Value must be between 1 and 10, with a default of 3.

Examples:
- `1` - Messages limited to 160 characters (single part only)
- `3` - Messages can be up to ~480 characters (three parts) - **Default**
- `5` - Messages can be up to ~800 characters (five parts)
- `10` - Messages can be up to ~1,600 characters (ten parts)

::: warning Cost Considerations
Each message part is billed separately by your SMS provider. A 3-part message costs 3× as much as a single message. Higher concatenation limits give you more flexibility but can significantly increase costs if users create very long messages.

Most SMS campaigns work well with the default limit of 3 parts. Only increase this if you have a specific need for longer messages and understand the cost implications.
:::

**Default Sender Number**

Select which sender number should be used by default when users create SMS campaigns with this gateway. This field is only populated after you've added sender numbers in the field above.

::: tip
Leave this empty if you want users to choose the sender number each time they create a campaign, or select a default to simplify campaign creation.
:::

**URL Shortening Domains**

Optional: Enter custom domains to use for shortening links in SMS messages. Enter one domain per line.

You can enter:
- Just the domain name: `short.link`
- Full URL with http: `http://s.link`
- Full URL with https: `https://short.link`

If you enter just a domain name, it will automatically use `https://`.

Examples:
```
txt.company.com
go.mybrand.com
https://link.example.com
```

::: warning DNS Configuration Required
Each domain you list here MUST point to your Octeth installation using a CNAME DNS record. If the domain isn't configured correctly, your shortened links won't work and recipients will see errors when they click them.

To set up a shortening domain:
1. Create a CNAME record pointing to your main Octeth domain
2. Test that the domain resolves to your Octeth installation
3. Add the domain to this field
4. Verify link shortening works by sending a test SMS
:::

::: info Why Use Custom Domains?
Custom shortening domains provide:
- **Brand recognition** - Recipients see your domain instead of a generic link shortener
- **Trust** - Links from your own domain are less likely to be flagged as spam
- **Analytics** - Track click-through rates on your branded domain
- **Compliance** - Some industries require branded links for regulatory reasons

You can leave this field empty to use Octeth's default link shortening, or skip link shortening entirely.
:::

**Country Restrictions**

Optional: Limit which countries can receive SMS messages through this gateway. Enter two-letter ISO country codes (one per line). Leave empty to allow all countries.

Examples:
```
US
CA
GB
AU
DE
```

::: tip Finding Country Codes
Country codes use the ISO 3166-1 alpha-2 standard. Find codes at:
- [Wikipedia - ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
- Your SMS provider's documentation
- Google "ISO country code" + country name

Common codes: US (United States), GB (United Kingdom), CA (Canada), AU (Australia), DE (Germany), FR (France), JP (Japan), CN (China)
:::

**When to Use Country Restrictions:**

- **Compliance requirements** - Some industries can only send to specific countries
- **Provider limitations** - Your SMS provider may only support certain countries
- **Cost control** - Block expensive international destinations
- **Geographic targeting** - Restrict campaigns to your service area
- **Regulatory requirements** - GDPR, TCPA, or other regulations may limit where you can send

::: warning Effect on Campaigns
If a recipient's phone number is from a restricted country, they will be skipped during campaign sending. Octeth will log these skips so you can review them later. Make sure your country restrictions align with your subscriber base to avoid accidentally blocking legitimate recipients.
:::

### User Assignment Tab

This tab only appears and is only required if you unchecked "Make this gateway available to all users (Global)" in the Basic Settings tab.

**Assign Users**

Select which users should have access to this gateway. Only checked users will be able to:
- Select this gateway when creating SMS campaigns
- View this gateway in their available SMS gateway list
- Send messages through this provider

The user list shows:
- **Company Name** (in bold, if provided)
- **Full Name** (First and Last name)
- **Email Address**

::: tip Selecting Multiple Users
- Click **Select All Users** to quickly assign the gateway to everyone
- Individually check boxes to select specific users
- Use the search or scroll through the list for large user bases
:::

**When User Assignment is Required:**

You MUST assign at least one user if the gateway is not global. The system will prevent you from saving if:
- The gateway is set to non-global (user-specific)
- No users are selected in this tab

**Managing User Access:**

::: info User Assignment Best Practices
- **Department-based assignment** - Create separate gateways for different departments (Sales, Support, Marketing)
- **Billing separation** - Assign gateways by who pays for SMS credits
- **Regional assignment** - Assign based on geographic responsibility
- **Testing vs. Production** - Limit test gateway access to technical users only

You can always edit the user assignment later without affecting the gateway's other settings.
:::

### Saving Your Gateway

Once you've configured all the required settings:

1. Review each tab to ensure all required fields are filled
2. Test the connection in the Gateway Configuration tab
3. Click **CREATE** at the bottom of the page

If validation fails, you'll see error messages indicating which fields need attention. Common errors:
- Missing required credentials in Gateway Configuration
- Invalid phone number format in Sender Numbers
- Invalid country codes in Country Restrictions
- No users assigned for a non-global gateway

::: tip
The gateway will be saved with the status you selected (Active or Inactive). You can always edit these settings later by clicking the gateway name from the SMS Gateways list.
:::

### Managing Existing Gateways

The SMS Gateways list page shows all configured gateways with their key information:

**Gateway Information Displayed:**
- **Gateway Name** - The name you assigned
- **Type** - The SMS provider (Twilio, Vonage, etc.)
- **Status** - Active (green checkmark) or Inactive (gray X)
- **Scope** - Global (blue globe icon) or User-specific (gray user icon)
- **Users** - Number of assigned users (N/A for global gateways)
- **Sender Numbers** - Preview of configured phone numbers

**Actions You Can Take:**
- **Edit** - Click the gateway name or the Edit link to modify settings
- **Delete** - Select one or more gateways and click Delete to remove them

::: warning Deleting Active Gateways
If you delete a gateway that's currently being used in active SMS campaigns, those campaigns may fail to send. Make sure to:
1. Check if any campaigns are using the gateway
2. Reassign campaigns to a different gateway before deleting
3. Set the gateway to Inactive first and monitor for issues before deleting permanently
:::

### Best Practices

**Gateway Organization:**
- Use clear, descriptive names that indicate purpose and provider
- Set up at least one backup gateway for redundancy
- Keep test and production gateways separate
- Document which gateway is used for which purpose

**Security:**
- Keep API credentials confidential - never share them publicly
- Rotate API keys periodically following your provider's recommendations
- Use Inactive status instead of deleting when temporarily disabling
- Review user assignments regularly for non-global gateways

**Cost Management:**
- Monitor message concatenation limits to control costs
- Use country restrictions to prevent sending to expensive destinations
- Review SMS provider bills regularly and compare with Octeth send logs
- Set spending limits with your SMS provider to prevent unexpected charges

**Reliability:**
- Always test connections before making a gateway active
- Configure multiple gateways for failover capability
- Monitor gateway performance and delivery rates
- Keep your provider account in good standing (paid balance, verified identity)

::: info Multiple Gateway Strategy
Many production deployments configure:
1. **Primary Gateway** - Your main SMS provider for production sending
2. **Secondary Gateway** - A backup provider in case the primary has issues
3. **Testing Gateway** - Sandbox or development account for testing campaigns
4. **Regional Gateways** - Specialized providers for specific countries or regions

This approach provides redundancy and allows you to optimize costs and delivery rates by geographic region.
:::

## Delivery Routes

Delivery Routes allow you to control which delivery server handles emails based on where they're being sent. Different email providers (like Gmail, Outlook, or Yahoo) may have different requirements or perform better with specific delivery configurations. By setting up delivery routes, you can optimize email delivery for each recipient's email provider.

To access these settings, navigate to **Preferences** → **System Settings** → **Delivery Routes** in the administrator dashboard.

::: info Current Scope
Delivery routing currently applies only to outgoing Email Gateway emails. Regular email campaigns do not use these routing rules at this time.
:::

### How Delivery Routes Work

When Octeth sends an email, it looks at the recipient's email address to determine their mail server (called an MX server). For example, if you're sending to `john@gmail.com`, the MX server is `gmail.com`. With delivery routes configured, you can tell Octeth to use a specific delivery server for all emails going to that mail server.

**Why This Matters:**

Different email providers have different requirements and behaviors:

- Some providers may perform better with specific IP addresses or domains
- You might want to use a dedicated delivery server for high-volume providers like Gmail
- Certain providers may have stricter requirements that work better with particular SMTP configurations
- You can isolate delivery issues by routing problematic providers through separate servers

### Setting Up a New Delivery Route

To create a new delivery route:

1. Locate the **New Email Delivery Route** section at the bottom of the page
2. In the first field, enter the mail server you want to route
3. From the dropdown menu, select which delivery server should handle emails to that mail server
4. Click **UPDATE EMAIL DELIVERY ROUTES** to save your changes

**Specifying the Mail Server:**

You have two options for defining which mail server to route:

**Option 1: Exact Match** - Enter the exact domain name

Examples:
- `gmail.com` - Routes only emails to Gmail addresses
- `outlook.com` - Routes only emails to Outlook.com addresses
- `company.com` - Routes only emails to that specific company domain

**Option 2: Pattern Match** - Use a regular expression to match multiple variations

Examples:
- `/.*\.?outlook\.com/i` - Matches outlook.com, mail.outlook.com, and any other Outlook subdomain
- `/.*\.?google\.com/i` - Matches gmail.com, googlemail.com, and Google-owned domains
- `/.*\.?yahoo\.(com|co\.uk)/i` - Matches yahoo.com and yahoo.co.uk

::: tip When to Use Patterns
Use exact matches for simple routing. Use pattern matching when:
- A provider uses multiple domain variations (like Outlook.com, hotmail.com, live.com)
- You want to route all subdomains of a company's email system
- You're consolidating multiple similar providers

If you're not familiar with regular expressions, stick with exact domain matches. They work perfectly for most use cases.
:::

**Selecting a Delivery Server:**

The dropdown menu shows all delivery servers configured in your Octeth installation. Each option displays:
- The delivery server's name
- The SMTP host it uses
- The SMTP username (if configured)

Choose the delivery server that's best suited for the target mail server.

### Managing Existing Routes

All configured delivery routes are listed at the top of the page. Each route shows:
- The mail server or pattern being matched
- An arrow (→) indicating the route direction
- The delivery server handling those emails

**To Delete a Route:**

1. Locate the route you want to remove
2. Click the dropdown menu for that route
3. Select **Delete this route** from the **Actions** section
4. Click **UPDATE EMAIL DELIVERY ROUTES** to save your changes

**To Modify a Route:**

1. Locate the route you want to change
2. Update the mail server pattern in the text field, or
3. Select a different delivery server from the dropdown menu
4. Click **UPDATE EMAIL DELIVERY ROUTES** to save your changes

::: warning Important
Changes to delivery routes take effect immediately after saving. Any emails sent after you click the update button will use the new routing configuration. Make sure your delivery servers are properly configured and tested before creating routes to them.
:::

### Common Delivery Route Scenarios

**Scenario 1: Dedicated Gmail Routing**

If you send high volumes to Gmail and have a delivery server optimized for Gmail's requirements:

- Mail Server: `gmail.com`
- Delivery Server: Your Gmail-optimized server

**Scenario 2: Outlook Family Routing**

Microsoft operates multiple email domains (Outlook.com, Hotmail.com, Live.com). Route them all through one server:

- Mail Server: `/.*\.?(outlook|hotmail|live)\.com/i`
- Delivery Server: Your Microsoft-optimized server

**Scenario 3: Corporate Domain Routing**

A client's company uses multiple email subdomains (mail.company.com, support.company.com, etc.):

- Mail Server: `/.*\.?company\.com/i`
- Delivery Server: A dedicated server for that client

**Scenario 4: Geographic Routing**

Route European email providers through a European-based delivery server for better performance:

- Create multiple routes for European providers
- Point them all to your EU-based delivery server

::: info Testing Your Routes
After configuring delivery routes, send test emails to addresses matching your routing rules. Check your delivery server logs to confirm the emails are being routed correctly. Monitor bounce rates and delivery performance to ensure the routing improves your email delivery.
:::

## S2S Postback

S2S Postback (Server-to-Server Postback) allows external services and platforms to send conversion data back to Octeth when someone who clicked a link in your email campaign completes a valuable action. This creates a complete picture of your email campaign performance beyond opens and clicks.

To access these settings, navigate to **Preferences** → **System Settings** → **S2S Postback** in the administrator dashboard.

**What Are Conversions?**

A conversion happens when someone takes a desired action after clicking a link in your email. Common conversion examples include:

- Making a purchase in your online store
- Signing up for a trial or subscription
- Completing a registration form
- Downloading a resource
- Booking an appointment or demo

**How S2S Postback Works**

When someone clicks a link in your email campaign, Octeth adds a unique tracking identifier to the URL. After the recipient completes an action on your website or platform, your system (or a third-party service like Clickbank) sends a notification back to Octeth with details about what happened. This allows Octeth to connect email clicks to actual business outcomes.

::: info Why This Matters
Without S2S Postback, you only know that someone clicked your email link. With S2S Postback configured, you can see:
- Which email campaigns generate the most sales
- The revenue generated by each campaign
- Which audience segments convert best
- Return on investment (ROI) for your email marketing
:::

**S2S Postback URL**

This is the web address that receives conversion notifications from external services. The URL is automatically generated by Octeth and cannot be changed.

Example: `http://yourdomain.com/system/s2s-postback/`

::: tip Setting Up Your Integration
Copy this URL and configure it in your:
- E-commerce platform's webhook settings
- Payment processor's postback configuration
- Affiliate network's conversion tracking
- Custom application's notification system

Your external service will send conversion data to this URL whenever a tracked action occurs.
:::

**Special Integration: Clickbank**

If you're integrating with Clickbank (a popular digital product marketplace and affiliate platform), Octeth provides a dedicated URL format. The system displays the exact Clickbank integration URL you need to use.

**Track Parameter**

The name of the URL parameter that contains the unique tracking identifier. This identifier connects a conversion back to the original email click.

Default value: `ocrid`

Example: When someone clicks a link in your email, the URL becomes `https://yoursite.com/product?ocrid=abc123xyz`. Your system includes this `ocrid` value when sending the conversion notification back to Octeth.

::: warning Important
If you change this parameter name, you must update your website, e-commerce platform, or any third-party services to use the new parameter name when sending conversion data. Otherwise, Octeth won't be able to match conversions to email campaigns.
:::

**Channel**

The name of the URL parameter that identifies which channel or category the conversion belongs to. This allows you to break down your conversion metrics by different sources or types.

Default value: `channel`

Example uses for channels:
- Product categories: `channel=electronics`, `channel=clothing`
- Traffic sources: `channel=email`, `channel=social`, `channel=affiliate`
- Campaign types: `channel=promotional`, `channel=transactional`
- Geographic regions: `channel=north-america`, `channel=europe`

::: tip Optional But Valuable
The channel parameter is optional. Your external service doesn't have to include it when reporting conversions. However, adding channel information helps you understand which types of campaigns or products perform best.
:::

**Value**

The name of the URL parameter that contains the monetary value or amount of the conversion. This lets you track revenue generated by your email campaigns.

Default value: `value`

Example: If someone purchases a product for $49.99 after clicking your email link, your system sends `value=49.99` in the conversion notification.

::: info Tracking Revenue
Always send the value in the smallest currency unit without symbols:
- Correct: `value=49.99`
- Incorrect: `value=$49.99` or `value=49`

The value helps you calculate important metrics like:
- Total revenue per campaign
- Average order value from email traffic
- Revenue per email sent
- Return on investment (ROI)
:::

**Unit**

The name of the URL parameter that specifies the currency or unit of measurement for the conversion value.

Default value: `unit`

Example: If the conversion value is in US dollars, your system sends `unit=USD`. For other currencies, use the appropriate currency code (`EUR`, `GBP`, `CAD`, etc.).

**Example S2S Postback Request**

When someone clicks an email link and completes a purchase, your system would send a request like this to Octeth's S2S Postback URL:

```
http://yourdomain.com/system/s2s-postback/?ocrid=abc123xyz&channel=electronics&value=149.99&unit=USD
```

This tells Octeth:
- The conversion is linked to tracking ID `abc123xyz`
- It came through the `electronics` channel
- The purchase value was `149.99`
- The currency is US dollars (`USD`)

Octeth then records this conversion and associates it with the correct email campaign, allowing you to see conversion metrics in your campaign reports.

::: tip Integration Testing
After configuring S2S Postback settings:
1. Send yourself a test email campaign
2. Click a link in the email and note the tracking parameter in the URL
3. Manually trigger a test conversion with that tracking ID
4. Check your campaign statistics to verify the conversion was recorded

This confirms your integration is working correctly before running live campaigns.
:::

## ESP Settings

ESP Settings control how new users can sign up for accounts, payment processing, and customer billing. These settings are essential if you plan to offer Octeth as a service to customers, run it as a multi-tenant platform, or allow users to self-register and purchase email credits.

**Navigation:** **Settings** → **ESP Settings**

The ESP Settings page has four main tabs that work together to create your customer onboarding and payment experience:
- **User Sign-Up** - Controls whether users can create their own accounts and what information they provide
- **Currency and Tax** - Sets the currency and tax rate for all credit purchases
- **Notification Emails** - Customizes receipt emails sent to customers after credit purchases
- **Payment Gateway** - Configures PayPal or custom payment processors for collecting payments

::: info When to Configure ESP Settings
Configure ESP Settings if you're running Octeth as a service where:
- Customers sign up and create their own user accounts
- Users purchase email credits through your platform
- You need to collect payment for email sending services
- You're operating a multi-tenant email marketing platform

If you're using Octeth internally (single organization, manually created user accounts), you can skip most ESP Settings configuration.
:::

### User Sign-Up

The User Sign-Up tab controls whether new users can register for accounts themselves and what happens when they do.

**Allow users to sign up from your website**

Choose whether to enable or disable self-service user registration:
- **Enabled** - Users can create their own accounts through a signup form on your website
- **Disabled** - Only administrators can create user accounts through the admin panel

When enabled, Octeth generates a registration page you can link to from your website. Users fill out a form, and their account is created automatically.

::: warning Security Consideration
Enabling public signup means anyone with the registration link can create an account. Consider using reputation settings and approval workflows to prevent abuse.
:::

**Default reputation for new signups**

When self-registration is enabled, you must choose the default trust level for new accounts:

- **Trusted** - New users can send emails immediately without restrictions. Their emails are treated as legitimate from the start.
- **Untrusted** - New users have limited sending ability until they build a reputation. This helps prevent spam abuse on your platform.

::: tip Preventing Spam Abuse
For public-facing signup forms, set default reputation to **Untrusted**. This protects your sending infrastructure from spammers who might try to abuse your platform. You can manually upgrade legitimate users to Trusted status after verifying their use case.
:::

**Required signup fields**

Choose which information to collect during the registration process. Check the boxes for fields you want to require from new users:

- **First Name** - User's given name
- **Last Name** - User's family name
- **Company Name** - Organization name
- **Website** - Company or personal website URL
- **Street** - Street address
- **City** - City name
- **State** - State or province
- **Zip** - Postal code
- **Country** - Country of residence
- **Phone** - Contact phone number
- **Fax** - Fax number (rarely used today)
- **TimeZone** - User's local timezone
- **Language** - Preferred interface language

You can select multiple fields. Only request information you actually need - longer forms reduce signup conversion rates.

::: tip Form Field Strategy
For basic email marketing accounts, collect just **First Name**, **Last Name**, **Company Name**, and **Email** (always required). You can request additional information later if needed for billing or compliance.
:::

**Default language**

Select the language for the user interface that new signups will see when they first log in. Users can change this later in their account settings if they prefer a different language.

Available languages depend on which language packs are installed in your Octeth installation.

**User group assignment**

Decide how new signups are assigned to user groups. You have two options:

**Option 1: Assign all new users to a specific group**
Select a single user group from the dropdown menu. Every new signup will automatically be placed in this group with that group's settings, limits, and permissions.

This is the simplest approach and works well when all new users should start with the same plan (e.g., a "Free Trial" group or "Basic Plan" group).

**Option 2: Let users choose their group during signup**
Select **"Allow users to choose from the following user groups"** from the dropdown. Then choose multiple groups from the list below.

During registration, users will see a selection of available plans (user groups) and can choose which one they want to join. This is useful when offering multiple tiers during signup (Free, Starter, Professional, etc.).

::: tip User Group Setup Required
Before enabling user signup, create at least one user group with appropriate limits and permissions. The user group should have delivery servers assigned, or new users won't be able to send emails.
:::

### Currency and Tax

The Currency and Tax tab configures financial settings for credit purchases.

**Payment Currency**

Enter the three-letter currency code for all credit purchases (e.g., `USD`, `EUR`, `GBP`). This currency will be used when displaying prices, processing payments, and showing billing history.

Common currency codes:
- `USD` - US Dollar
- `EUR` - Euro
- `GBP` - British Pound
- `CAD` - Canadian Dollar
- `AUD` - Australian Dollar

**Tax Percentage**

Enter the tax rate to apply to all credit purchases. Use the numeric percentage without the % symbol.

For example:
- Enter `20` for 20% tax (e.g., UK VAT)
- Enter `13` for 13% tax (e.g., Canadian HST)
- Enter `0` if you don't charge tax

The tax is calculated automatically and added to the total when users purchase credits. Tax amounts are shown separately on receipts and invoices.

::: warning Tax Compliance
Consult with an accountant or tax professional to determine the correct tax rate for your jurisdiction. Tax requirements vary by country, state, and business type. Some regions require different tax rates based on the customer's location (origin vs. destination taxation).
:::

### Notification Emails

The Notification Emails tab customizes the automatic receipt emails sent to users after they purchase credits.

**Email Subject**

Enter the subject line for receipt emails. Keep it clear and professional so recipients immediately recognize what the email is about.

Good examples:
- `Your Credit Purchase Receipt`
- `Payment Confirmation - [Company Name]`
- `Credits Added to Your Account`

You can use personalization tags to include user-specific information in the subject. Click the dropdown menu below the subject field to select available tags:

- `%User:FirstName%` - Replaced with the user's first name
- `%User:LastName%` - Replaced with the user's last name
- `%Period:StartDate%` - Billing period start date
- `%Period:FinishDate%` - Billing period end date
- `%Period:TotalAmount%` - Total amount paid including tax

Example with personalization:
```
Your Receipt - %Period:TotalAmount% Paid
```

**Email Message**

Enter the body text for receipt emails. This is what users see when they open the receipt. Include a friendly message confirming their purchase and thanking them for their business.

You can use the same personalization tags available for the subject line, plus these additional tags:

- `%Period:ReceiptDetails%` - Automatically inserts a formatted table showing the purchase breakdown (credits, tax, total)
- `%Payment:Links%` - Inserts relevant payment-related links (invoice download, payment history, etc.)

::: tip Professional Receipt Template
A good receipt email should include:
1. A friendly greeting with the user's name
2. Confirmation of what was purchased
3. The `%Period:ReceiptDetails%` tag to show the breakdown
4. A thank you message
5. Contact information for support questions
6. The `%Payment:Links%` tag for accessing invoices

Example:
```
Hi %User:FirstName%,

Thank you for your credit purchase! Your payment has been processed successfully and credits have been added to your account.

%Period:ReceiptDetails%

You can view your payment history and download invoices anytime:
%Payment:Links%

If you have any questions, reply to this email or contact us at support@yourcompany.com.

Best regards,
The [Your Company] Team
```
:::

### Payment Gateway

The Payment Gateway tab configures which payment processors are available for credit purchases.

**Payment Processing Options**

You can enable one or both payment methods:

**Enable PayPal Express Checkout**
Check this box to allow users to pay for credits using PayPal. PayPal Express Checkout lets customers pay with their PayPal balance, bank account, or credit card through PayPal's secure checkout flow.

When enabled, you must provide these additional settings:

**Business Email**
Enter the email address associated with your PayPal business account. This is where payment funds will be deposited. The email must match your verified PayPal account email exactly.

**Purchase Description**
Enter a description that appears on the PayPal payment page and on customers' PayPal transaction history. Keep it short and clear.

Examples:
- `Email Marketing Credits`
- `[Your Company] - Email Credits Purchase`
- `Octeth Platform Credits`

**Currency**
Select the currency for PayPal transactions from the dropdown menu. Available currencies include:
- USD (US Dollar)
- EUR (Euro)
- GBP (British Pound)
- CAD (Canadian Dollar)
- AUD (Australian Dollar)
- And many more...

The PayPal currency should typically match the **Payment Currency** you configured in the Currency and Tax tab.

::: warning PayPal Account Requirements
Before enabling PayPal Express Checkout:
1. Create and verify a PayPal Business account (personal accounts don't support payment processing)
2. Complete PayPal's identity verification requirements
3. Test the integration with a sandbox account first
4. Ensure your PayPal account can receive payments in the selected currency
:::

**Enable Custom Payment Gateway**
Check this box if you want to integrate a custom payment processor other than PayPal (such as Stripe, Square, Authorize.net, or your own payment system).

When enabled, you must provide:

**Payment Gateway URL**
Enter the complete URL to your custom payment gateway endpoint. This is where Octeth will redirect users when they click to purchase credits.

Your custom payment gateway must:
1. Accept the user information sent by Octeth (user ID, email, requested credit amount)
2. Process the payment through your chosen payment processor
3. Notify Octeth when payment is complete using the provided callback URL
4. Add credits to the user's account after successful payment

::: info Custom Gateway Integration
Custom payment gateway integration requires developer work. Your development team will need to:
- Create a payment processing page at the specified URL
- Handle payment processing with your chosen provider (Stripe, Square, etc.)
- Implement the callback mechanism to notify Octeth of successful payments
- Handle errors and payment failures gracefully

This option gives you full control over the payment experience and allows using any payment processor, but requires technical implementation.
:::

**Saving Your Settings**

After configuring all four tabs, click **UPDATE ESP SETTINGS** at the bottom of the page to save your changes. All settings take effect immediately.

::: tip Testing Your Configuration
After saving ESP Settings, test the complete flow:
1. If user signup is enabled, try creating a test account through the registration form
2. Log in as the test user
3. Attempt a small credit purchase using your configured payment gateway
4. Verify the receipt email arrives with correct information
5. Confirm credits are added to the test account
6. Check that tax calculations are correct
:::

## Single Sign On (SSO)

Single Sign On (SSO) allows you to connect Octeth with your existing website or application so users can access Octeth without creating a separate account or logging in manually. When someone clicks a special link from your platform, they're automatically logged into Octeth with their account already set up.

**Why use SSO?**

SSO creates a seamless experience for your users by:
- Eliminating the need for separate registration forms
- Removing the hassle of remembering another username and password
- Automatically creating Octeth accounts for your existing users
- Keeping user information synchronized between your platform and Octeth
- Providing a professional, integrated experience

**When should you set this up?**

You should configure SSO if:
1. You have an existing user base on your website or application
2. You want to offer Octeth as part of your platform's features
3. You need to automatically provision Octeth accounts for your users
4. You want users to move between your platform and Octeth without logging in again

**Navigation:** **Settings** → **Single Sign On**

::: info Understanding SSO Security
SSO uses encrypted tokens to securely transfer user information between your platform and Octeth. Each SSO source has two secret encryption keys that ensure only authorized requests from your platform are accepted. The encrypted data includes user details like name, email, and account settings.
:::

### Creating an SSO Source

An SSO source represents a connection between your platform and Octeth. You can create multiple SSO sources if you need to connect different applications or websites to the same Octeth installation.

**To create a new SSO source:**

1. Navigate to **Settings** → **Single Sign On**
2. Click **Create SSO Source**
3. Fill out the configuration fields (explained below)
4. Click **Create**

After creating the source, you'll receive two secret encryption keys that your developer will need for the integration.

### Basic Configuration

#### Source Name

This is a friendly label that helps you identify this SSO connection in your admin panel. Choose something descriptive that tells you which platform or application this source is for.

**Examples:**
```
Main Website SSO
Mobile App Integration
Partner Portal Access
Customer Dashboard
```

::: tip
If you manage multiple platforms, use clear names like "iOS App SSO" and "Android App SSO" so you can quickly identify which integration you're looking at.
:::

#### Source Code

This is a unique identifier that gets included in the SSO links. It tells Octeth which SSO source to use when processing the authentication request.

**Requirements:**
- Must be unique across all your SSO sources
- Can only contain letters, numbers, dashes (-), and underscores (_)
- Cannot contain spaces or special characters

**Examples:**
```
main-website
mobile-app
partner-portal
customer-dashboard
```

::: warning
Once you create an SSO source, the source code becomes part of your integration. If you change it later, you'll need to update all the SSO links in your platform, which could break existing integrations.
:::

#### Description

This optional field lets you add notes about what this SSO source is used for, which developers are working on it, or any other relevant details. This is purely for your internal reference and won't affect how SSO works.

#### Expires At

You can optionally set an expiration date for this SSO source. After this date and time, all SSO links for this source will stop working.

**When to use expiration:**
- **Temporary integrations:** If you're running a limited-time promotion or trial
- **Testing:** When setting up a test integration that should automatically shut down
- **Scheduled migrations:** When you know you'll be switching to a new SSO source on a specific date

**Format:** `YYYY-MM-DD HH:MM:SS`

**Example:** `2024-12-31 23:59:59`

**Leave this field empty** if you want the SSO source to work indefinitely (most common scenario).

#### Valid For

This is a critical security setting that determines how long each SSO link remains valid after it's generated.

**What this means:**
When your platform generates an SSO link for a user, that link will only work for the number of seconds you specify here. After that time expires, the link becomes invalid and won't log the user in.

**Recommended setting:** `5` seconds or less

**Why keep this short?**
- **Security:** Short validity windows prevent attackers from using stolen or intercepted links
- **Freshness:** Ensures the user data in the link is current
- **Prevention of link sharing:** Users can't bookmark or share SSO links

::: warning Important Security Note
Setting this value too high (like 60 seconds or more) creates a security risk. If someone intercepts the SSO link, they could use it to access the account before it expires. Keep this as short as possible while still giving users enough time to click through.
:::

**How this works in practice:**
1. User clicks a button on your platform to access Octeth
2. Your platform generates an encrypted SSO link (valid for 5 seconds)
3. User's browser is redirected to that link
4. Octeth verifies the link is still valid (hasn't expired)
5. User is logged in

The entire process typically takes 1-2 seconds, so a 5-second validity window is plenty of time.

### SSO Options

These three checkboxes control what happens when users access Octeth through your SSO link.

#### Create new user account if corresponding account is not found

When enabled, Octeth will automatically create a new user account if someone tries to log in through SSO but doesn't have an existing account.

**When to enable this:**
- You're integrating Octeth with an existing platform that already has users
- You want new users to seamlessly start using Octeth without manual registration
- You're offering Octeth as part of your service

**When to disable this:**
- You only want specific pre-existing Octeth users to access the system via SSO
- You want to manually control who gets Octeth accounts

**Most common setting:** Enabled (checked)

#### Login the user to the user area

When enabled, users clicking the SSO link will be automatically logged into Octeth's user area and can start using the platform immediately.

**When to enable this:**
- You want a seamless experience where users go directly to their Octeth dashboard
- You're using SSO as the primary way users access Octeth

**When to disable this:**
- You only want to create/update the user account without logging them in
- You have a custom landing page or workflow after account creation

**Most common setting:** Enabled (checked)

#### Return the user data in JSON format

When enabled, instead of logging the user into Octeth, the SSO endpoint will return the user's information in a structured data format (JSON).

**When to enable this:**
- You need to verify the account was created/updated successfully
- You want to display user information in your own application
- You're building a custom integration that processes the user data programmatically

**When to disable this:**
- You want users to be logged in directly (the normal use case)

**Most common setting:** Disabled (unchecked)

::: info Understanding the Data Return Option
If you enable "Return the user data in JSON format," the SSO process won't log the user in. Instead, it returns data like the user ID, email, and account status. This is an advanced option typically used by developers building custom integrations. For most use cases, leave this disabled.
:::

### Access Credentials and Integration

After creating your SSO source, click on it to view the **Access Credentials** tab. This is where you'll find the encryption keys and integration code that your developer needs to implement SSO.

#### Secret Encryption Keys

Octeth automatically generates two unique encryption keys for your SSO source:

- **Secret Key #1:** Used for encrypting the user data
- **Secret Key #2:** Used for verifying the encrypted data hasn't been tampered with

These keys are shown in the Access Credentials tab. Your developer will need both keys to create valid SSO links.

::: warning Keep Your Keys Secure
These encryption keys are like passwords for your SSO integration. Anyone with these keys can create SSO links that log users into your Octeth account. Never share these keys publicly or commit them to public code repositories.
:::

#### Integration Instructions

The Access Credentials tab includes complete example code showing exactly how to generate encrypted SSO links. The example is written in PHP, but the same encryption approach can be used in any programming language.

**What information needs to be encrypted:**

Your platform must send this information in the encrypted token:

**Required fields:**
- `id` — The unique user ID from your platform
- `firstname` — User's first name
- `lastname` — User's last name
- `email` — User's email address
- `username` — The username for the Octeth account
- `password` — The password for the Octeth account
- `check_time` — Current timestamp (prevents replay attacks)

**Optional fields:**
- `target_usergroup_id` — Which user group to assign this user to in Octeth
- `reputation_level` — Set to `Trusted` or `Untrusted` (affects default limits)
- `timezone` — User's timezone (like `Europe/London`)
- `language` — User's preferred language (like `en`)
- `ip` — User's IP address
- `availablecredits` — Starting email credits for the user's account

::: info About Required vs. Optional Fields
While the integration code requires all fields to be present, you can set optional fields to empty values or defaults if you don't need them. For example, if you're not tracking user timezones, you can set it to a default like `UTC`.
:::

### Monitoring SSO Usage

The **Statistics** tab shows you how your SSO integration is performing over the last 30 days.

**What you can track:**

- **Successful data transfers:** How many times users successfully authenticated through this SSO source
- **Failed data transfers:** How many SSO attempts failed (usually due to expired links or invalid encryption)
- **Logins:** How many times existing users logged in through SSO
- **Sign-ups:** How many new accounts were created through SSO

These statistics help you:
- Verify your integration is working correctly
- Identify issues if you see high failure rates
- Understand how many users are coming through this SSO source
- Monitor the adoption of your integrated platform

::: tip Understanding the Statistics
If you see a high number of "Failed data transfers," it usually means:
- The SSO links are expiring before users click them (try increasing the "Valid For" setting slightly)
- There's an encryption issue in your integration code
- Users are trying to reuse old SSO links (which is normal and expected)
:::

### Common SSO Integration Patterns

Here are typical ways Octeth's SSO feature is used:

**Pattern 1: Seamless Platform Integration**
You have a membership website, and you want members to access Octeth as part of their membership benefits. When they click "Email Marketing" in your member dashboard, they're automatically logged into Octeth with an account already created for them.

**Pattern 2: White-Label Reselling**
You're reselling Octeth as part of your own branded platform. You want your customers to see a seamless experience where they never realize they're using Octeth - they think it's part of your platform.

**Pattern 3: Partner Portal**
You're giving partners or affiliates access to Octeth for managing email campaigns. Partners log into your portal, click through to the email marketing section, and are automatically authenticated in Octeth.

**Pattern 4: Mobile App Integration**
You have a mobile app and want users to access Octeth's features without creating a separate account. The app generates an SSO link when users tap the email marketing feature.

## Preferences

The Preferences page controls global settings that affect how your Octeth system behaves. These settings apply across your entire installation and impact both the administrator and user areas.

To access Preferences: Navigate to **Settings** > **Preferences** in the administrator area.

[[SCREENSHOT: The Preferences page showing all configuration sections]]

### General Settings

These settings control basic system behavior and security features.

**Default Language**

Select the language that will be used throughout Octeth's public-facing sections, including login screens and operation confirmation pages. This language will be the default for all new users and public interfaces.

[[SCREENSHOT: Default Language dropdown showing available language options]]

::: tip
If you're running a multilingual operation, individual users can still choose their preferred language in their account settings. This setting only controls the default.
:::

**Admin CAPTCHA**

Choose whether to display CAPTCHA verification on the administrator login screen.

- **Enabled**: Shows CAPTCHA challenges when administrators attempt to log in, adding an extra layer of security against automated login attempts
- **Disabled**: Allows administrators to log in without CAPTCHA verification

::: warning
Enabling CAPTCHA on the admin login screen significantly improves security by preventing brute-force login attempts. Unless you have a specific reason to disable it, keeping this enabled is highly recommended.
:::

**User CAPTCHA**

Choose whether to display CAPTCHA verification on the user area login screen.

- **Enabled**: Shows CAPTCHA challenges when users attempt to log in, protecting user accounts from automated attacks
- **Disabled**: Allows users to log in without CAPTCHA verification

::: info
If you notice unusual login activity or suspect automated attacks on user accounts, enabling this setting can help protect your users' accounts.
:::

**User Password Reset**

Control whether users can reset their passwords through the self-service password reset feature.

- **Password reset feature is enabled**: Users can click "Forgot Password?" on the login screen and receive password reset instructions via email
- **Password reset feature is disabled**: The password reset option is hidden, and users must contact administrators to reset their passwords

[[SCREENSHOT: Password reset setting dropdown showing enabled and disabled options]]

::: tip When to disable password reset
You might want to disable this feature if:
- You manage a small team where password resets can be handled directly
- Your organization has specific security policies requiring manual password resets
- You use Single Sign-On (SSO) for authentication
:::

**Forbidden Emails**

Specify email addresses that users are not allowed to use as "From" addresses in their email campaigns. This prevents users from impersonating certain email addresses or domains.

Enter one email address or pattern per line. You can use the asterisk (`*`) as a wildcard to match multiple addresses.

Examples:
```
noreply@yourdomain.com
admin@yourdomain.com
*@gmail.com
*@yahoo.com
support@*
```

[[SCREENSHOT: Forbidden Emails textarea showing example entries]]

::: warning
Blocking major email providers (like `*@gmail.com`) prevents users from sending emails from free email accounts, which can help maintain your sender reputation. However, be careful not to block legitimate business domains your users might need.
:::

**User Area Footer**

Customize the footer text that appears at the bottom of every page in the user area. You can include HTML markup for formatting and links.

Example:
```html
© 2024 Your Company Name. All rights reserved. |
<a href="https://yourdomain.com/privacy">Privacy Policy</a> |
<a href="https://yourdomain.com/terms">Terms of Service</a>
```

[[SCREENSHOT: User Area Footer textarea showing example HTML content]]

::: tip White-labeling
Use this field to add your company branding, legal links, support contact information, or any other content you want users to see on every page.
:::

**Default Custom Fields**

Define custom fields that will be automatically created whenever a user creates a new subscriber list. These fields will be added to every new list as text-based custom fields.

Enter one field name per line. Common examples:
```
First Name
Last Name
Company
Phone Number
City
Country
```

[[SCREENSHOT: Default Custom Fields textarea showing example field names]]

::: info
This is especially useful if you want to standardize data collection across all lists in your system. Users can still add additional custom fields to their lists as needed.
:::

### Send Rate Notification Settings

Configure notifications when users exceed their sending rate limits.

**Slack Webhook**

Enter a Slack webhook URL to receive notifications when a user exceeds their configured send rate limit. When a user hits their limit, Octeth will send a message to your specified Slack channel with details about which user exceeded their limit.

Leave this field empty to disable Slack notifications.

[[SCREENSHOT: Slack Webhook field with example webhook URL]]

::: tip Getting a Slack webhook URL
1. Go to your Slack workspace settings
2. Navigate to Apps & Integrations
3. Search for "Incoming Webhooks"
4. Create a new webhook and select the channel where you want notifications
5. Copy the webhook URL and paste it here
:::

**Notification Interval**

Specify how often (in seconds) Octeth should send rate limit notifications to Slack for the same user. This prevents notification spam if a user continuously attempts to send while over their limit.

For example, setting this to `3600` means you'll receive a notification at most once per hour for each user who exceeds their rate limit.

[[SCREENSHOT: Notification Interval field showing value in seconds]]

::: info
Send rate limits can be configured in the user group settings or individually for each user account. See the User Group Settings section for more details on setting up rate limits.
:::

### Webhook Settings

Control how Octeth handles webhooks that repeatedly fail to execute successfully.

**Enable Failed Webhook Handler**

When enabled, Octeth monitors webhook execution failures and automatically takes action when webhooks fail too many times.

[[SCREENSHOT: Failed webhook handler checkbox enabled]]

When this feature is enabled, you can configure:

**Fail Threshold**

The number of consecutive failed attempts before Octeth considers a webhook as problematic. For example, if you set this to `3`, Octeth will take action after the webhook fails 3 times in a row.

**Suspend Duration**

How long (in seconds) to disable the failed webhook. During this suspension period, Octeth will not attempt to execute the webhook, giving you time to investigate and fix any issues. For example, `3600` suspends the webhook for 1 hour.

**Webhook URL**

An optional URL that Octeth will call when it disables a webhook due to repeated failures. This can be used to send notifications to your monitoring system or logging service.

[[SCREENSHOT: Failed webhook handler settings showing all three configuration fields]]

::: tip Recommended settings
- **Fail Threshold**: `3` - Three failures indicates a real problem, not just temporary issues
- **Suspend Duration**: `3600` (1 hour) - Gives you time to investigate without overwhelming your systems
- **Webhook URL**: Your monitoring system's webhook endpoint
:::

### Limit Utilization Notifications

Receive notifications when users' resource utilization status changes, allowing you to proactively manage capacity and respond to usage patterns.

**Enable Limit Utilization Webhook Notifications**

When enabled, Octeth will send webhook notifications whenever a user's limit utilization status changes between different states (OK, Warning, and Exceeded).

[[SCREENSHOT: Limit utilization webhook checkbox enabled]]

**Webhook URL**

The URL that will receive POST requests containing status change notifications. Octeth sends a JSON payload with details about the user, which limit changed, and the transition that occurred.

[[SCREENSHOT: Webhook URL field with example URL]]

**Notify on Transitions**

Select which status transitions should trigger webhook notifications. You can monitor different types of changes:

- **OK → Warning**: User's limit usage is approaching the warning threshold (typically 80% of their limit)
- **Warning → Exceeded**: User has exceeded their limit after being in warning state
- **OK → Exceeded**: User suddenly exceeded their limit without hitting the warning threshold first
- **Exceeded → Warning**: User's usage has dropped back below the limit but is still in the warning zone
- **Warning → OK**: User's usage has returned to normal levels from the warning state
- **Exceeded → OK**: User's usage has fully recovered from an exceeded state back to normal

[[SCREENSHOT: Transition checkboxes showing all six transition types]]

::: tip Recommended transition monitoring
For proactive capacity management, enable these transitions:
- **OK → Warning** (anticipate capacity issues)
- **Warning → Exceeded** (immediate attention needed)
- **OK → Exceeded** (sudden spikes that need investigation)

For recovery tracking, optionally enable:
- **Exceeded → OK** (confirm issue resolution)
:::

::: info Webhook payload format
When a transition occurs, Octeth sends a POST request with this JSON structure:
```json
{
  "user_id": 123,
  "username": "john@example.com",
  "limit_type": "subscribers",
  "previous_status": "OK",
  "current_status": "Warning",
  "current_value": 8500,
  "limit_value": 10000,
  "utilization_percentage": 85,
  "timestamp": "2024-01-15T14:30:00Z"
}
```
:::

::: warning Important requirement
When this feature is enabled, you must:
1. Provide a valid webhook URL
2. Select at least one transition type to monitor

The system will not save your settings if either requirement is missing.
:::

### Saving Your Changes

After configuring your preferences, click the **Update Preferences** button at the bottom of the page to save your changes. Your new settings will take effect immediately.

[[SCREENSHOT: Update Preferences button at bottom of form]]

::: tip
Changes to security settings (like CAPTCHA and password reset options) take effect immediately for new login attempts. Users who are already logged in will not be affected until they log out and log back in.
:::

## Rebranding

Rebranding allows you to customize Octeth's user-facing pages and elements with your own branding. This is particularly useful when offering Octeth as a white-label service to your clients or when you want to maintain consistent branding across your subscriber-facing communications.

To access rebranding settings, navigate to **Preferences** → **System Settings** → **Rebranding** in the administrator dashboard.

### Product Name

**Product Name** is the application name displayed throughout the system interface and in user communications. Instead of showing "Octeth" everywhere, you can replace it with your own company or product name.

This name appears in:
- Email templates and notifications sent to subscribers
- User dashboard and interface elements
- System-generated messages
- Forward to Friend pages
- Report abuse pages
- User sign-up pages

For example, if you set the product name to "AwesomeMail", subscribers will see "Powered by AwesomeMail" instead of "Powered by Octeth" in their emails.

::: tip White Label Strategy
Changing the product name is essential for white-label deployments where you're offering email marketing services under your own brand. Choose a name that represents your business and resonates with your target audience.
:::

### Forward To Friend Page

The Forward To Friend feature allows your email recipients to share interesting emails with their contacts. You can customize the header and footer of this page to match your branding.

**Header URL**
URL to an HTML file or web page that will be displayed at the top of the Forward To Friend page. This typically includes your logo, navigation, and branding elements.

**Footer URL**
URL to an HTML file or web page that will be displayed at the bottom of the Forward To Friend page. This typically includes copyright information, links, and contact details.

Both URLs must start with `http://` or `https://`. For example: `https://yourdomain.com/header.html`

::: info URL Requirements
Your header and footer files should contain only the HTML/CSS you want to inject into the page. Don't include full HTML document structure (like `<html>`, `<head>`, `<body>` tags) - just the content you want to appear in that section.
:::

### Report Abuse Page

The Report Abuse page allows email recipients to report unwanted or inappropriate emails. Customize this page to maintain your branding and provide appropriate contact information for abuse reports.

**Header URL**
URL to an HTML file or web page for the top section of the Report Abuse page.

**Footer URL**
URL to an HTML file or web page for the bottom section of the Report Abuse page.

Enter the complete URL starting with `http://` or `https://`, for example: `https://yourdomain.com/abuse-header.html`

::: warning Abuse Handling
Even if you customize the Report Abuse page branding, ensure you monitor and respond to abuse reports promptly. Ignoring abuse reports can harm your sender reputation and lead to deliverability issues.
:::

### User Sign Up Page

When new users register for accounts on your Octeth installation, they see a sign-up page. You can add custom header and footer sections to this page to match your company branding and provide additional information.

**Header URL**
URL to an HTML file or web page displayed at the top of the user registration page.

**Footer URL**
URL to an HTML file or web page displayed at the bottom of the user registration page.

Both URLs must be complete web addresses starting with `http://` or `https://`.

::: tip Registration Page Branding
Use the sign-up page header to welcome new users, explain your service benefits, or display trust badges. The footer can include links to your terms of service, privacy policy, and support resources.
:::

### Subscriber Area

The Subscriber Area is where your email recipients can manage their subscription preferences, update their information, and unsubscribe from your mailing lists.

**Logout URL**
When subscribers click the logout link in the Subscriber Area, they'll be redirected to this URL. This is typically your main website homepage or a custom thank you page.

Enter the full URL starting with `http://` or `https://`, for example: `https://yourdomain.com/logout-success.html`

If you leave this field empty, subscribers will see a generic logout confirmation message after logging out.

::: info Subscriber Experience
The logout URL is your last touchpoint with subscribers in this session. Consider redirecting them to a page that:
- Thanks them for managing their preferences
- Highlights your products or services
- Provides links to your main website
- Offers customer support contact information
:::

### Best Practices

**Host branding files on a reliable server**: Your header and footer URLs must be accessible 24/7. If these files become unavailable, the pages will display without your custom branding.

**Keep branding consistent**: Use the same header and footer design across all pages (Forward To Friend, Report Abuse, User Sign Up) to maintain a cohesive brand experience.

**Test on mobile devices**: Many subscribers access these pages from smartphones. Ensure your header and footer HTML is responsive and looks good on small screens.

**Use HTTPS**: Always use HTTPS URLs for your branding files to avoid security warnings and ensure subscriber trust.

**Minimize file size**: Keep your header and footer files small (under 50KB each) to ensure fast page loading times.

## Upload Settings

Upload Settings control how files are stored and managed in your Octeth installation. This includes the media library where users upload images and documents for email campaigns, as well as file size limits for imports, attachments, and media files.

To access these settings, navigate to **Preferences** → **System Settings** → **Uploads and Media Library** in the administrator dashboard.

The Upload Settings page has two main tabs: **Media Library** (where you control file uploads and storage) and **File Upload** (where you set file size limits).

### Media Library Tab

The Media Library tab controls whether users can upload files, which file types are allowed, and where those files are stored (on your server, in your database, or on Amazon S3).

**Status**

The status determines whether your users can upload and use files in the media library.

Options:
- **Media library is enabled** - Users can upload files to the media library and use them in email campaigns
- **Media library is disabled** - Users cannot upload files or access the media library

::: tip When to Disable the Media Library
You might disable the media library if:
- You want to prevent users from uploading files that consume server storage
- Your installation only sends text-based emails without images
- You're migrating to a new storage system and need to temporarily block uploads
- You want to enforce a corporate policy that all media must be hosted externally
:::

**Allowed File Types**

This field controls which types of files users can upload to the media library. File types are specified using MIME types (a standardized way to identify file formats).

Enter MIME types separated by commas. For example:
```
image/gif,image/jpg,application/pdf,application/zip
```

This configuration allows users to upload:
- GIF images (`image/gif`)
- JPEG images (`image/jpg`)
- PDF documents (`application/pdf`)
- ZIP archives (`application/zip`)

::: info What Are MIME Types?
MIME types identify file formats using a type/subtype format. Common MIME types include:
- **Images**: `image/gif`, `image/jpg`, `image/jpeg`, `image/png`
- **Documents**: `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (Word)
- **Archives**: `application/zip`, `application/x-rar-compressed`
- **Video**: `video/mp4`, `video/mpeg`

For a complete list of MIME types, visit the [IANA Media Types registry](https://www.iana.org/assignments/media-types/media-types.xhtml).
:::

**Common Allowed File Types Configurations:**

**Images Only (Recommended for most email campaigns):**
```
image/gif,image/jpg,image/jpeg,image/png
```

**Images and PDFs:**
```
image/gif,image/jpg,image/jpeg,image/png,application/pdf
```

**Images, Documents, and Archives:**
```
image/gif,image/jpg,image/jpeg,image/png,application/pdf,application/msword,application/zip
```

::: warning Security Consideration
Only allow file types that are necessary for your users. Each file type you allow increases potential security risks. Images (GIF, JPG, PNG) and PDFs are generally safe for email campaigns. Be cautious with:
- Executable files (`.exe`, `.bat`, `.sh`) - Never allow these
- Script files (`.js`, `.php`, `.py`) - Should not be allowed
- Archive files (`.zip`, `.rar`) - Only allow if users need to share downloadable resources
:::

**Upload Method**

The upload method determines where uploaded files are physically stored. Octeth supports three storage options:

**1. Upload to the server (Recommended for most installations)**

Files are stored in a directory on your Octeth server's file system. This is the simplest and most common configuration.

Advantages:
- Simple setup with no additional configuration
- Fast access to files
- No external service fees
- Complete control over your files

Disadvantages:
- Files consume server disk space
- Requires regular backups
- Scaling requires additional server storage

::: tip
This is the default and recommended option for most installations. It works well for installations with up to several gigabytes of media files.
:::

**2. Upload to the database**

Files are stored directly in your MySQL database as binary data instead of as separate files on disk.

Advantages:
- Files are automatically included in database backups
- Simplified backup and migration
- No file system permissions issues

Disadvantages:
- Slower file access compared to file system storage
- Increases database size significantly
- Can impact database performance with large files
- More complex to troubleshoot file issues

::: warning Database Performance Impact
Storing files in the database can significantly increase database size and slow down backups. This method is generally only recommended for small installations with minimal file uploads (under 1GB total).
:::

**3. Upload to Amazon S3**

Files are stored in Amazon S3 (Simple Storage Service), a cloud storage platform. This option requires an AWS account and S3 bucket.

Advantages:
- Unlimited scalable storage
- No impact on server disk space
- Global content delivery (fast access worldwide)
- Built-in redundancy and reliability
- Ideal for high-volume installations

Disadvantages:
- Requires AWS account and configuration
- Monthly AWS storage fees (typically $0.023 per GB)
- Monthly data transfer fees
- More complex initial setup

::: tip When to Use Amazon S3
Amazon S3 is ideal for:
- High-volume installations with many users uploading files
- Installations with limited server storage
- Multi-server or load-balanced environments
- Situations where you want offsite storage redundancy
- Installations sending to global audiences (S3 provides faster worldwide access)
:::

**Amazon S3 Connection Settings**

This section only appears when you select **Upload to Amazon S3** as your upload method. You'll need to configure your AWS credentials and S3 bucket information.

::: info Prerequisites for S3 Setup
Before configuring S3 storage, you need to:
1. Create an AWS account at https://aws.amazon.com/
2. Create an S3 bucket in your preferred AWS region
3. Create IAM credentials with S3 access permissions
4. Note down your Access ID, Secret Key, and Bucket Name
:::

**Access ID**

Your AWS IAM access key ID. This is a 20-character identifier that looks like: `AKIAIOSFODNN7EXAMPLE`

To create access credentials:
1. Log into AWS Console
2. Navigate to **IAM** → **Users**
3. Create a new user or select an existing user
4. Create access keys under **Security Credentials**
5. Copy the Access Key ID

::: danger Keep Credentials Secure
Never share your AWS access credentials publicly or commit them to version control systems. Anyone with these credentials can access your S3 bucket and incur AWS charges on your account.
:::

**Secret Key**

Your AWS IAM secret access key. This is a 40-character secret that looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

The secret key is only shown once when you create the access key. If you lose it, you'll need to create new credentials.

::: warning
Store your secret key securely. If someone obtains both your Access ID and Secret Key, they have full access to your S3 bucket.
:::

**Bucket Name**

The name of your S3 bucket where files will be stored. Bucket names must be globally unique across all AWS accounts.

Example: `octeth-media-files`

::: tip S3 Bucket Best Practices
When creating your S3 bucket:
- Use a descriptive name that identifies its purpose (`octeth-media-production`)
- Enable versioning to protect against accidental deletions
- Configure lifecycle rules to automatically delete old files if needed
- Set up appropriate bucket permissions (private by default, with public read access if needed)
- Choose an AWS region close to your server for faster uploads
:::

**Media Library Path**

The folder path within your S3 bucket where media library files will be stored. This helps organize files and separate media from other content in the same bucket.

Example: `media-library` or `octeth/media`

::: warning Path Format
Do **not** include forward slashes (`/`) at the beginning or end of the path.

**Correct:** `media-library` or `octeth/media`
**Incorrect:** `/media-library/` or `/octeth/media/`

The system will automatically add slashes where needed.
:::

**Media Library URL**

The public URL where uploaded files can be accessed. This is typically your S3 bucket's CloudFront distribution URL or the direct S3 URL.

Examples:
- Direct S3 URL: `https://octeth-media-files.s3.amazonaws.com`
- CloudFront URL: `https://d111111abcdef8.cloudfront.net`

::: tip Using CloudFront for Better Performance
For faster file delivery worldwide, create a CloudFront distribution that points to your S3 bucket. CloudFront is AWS's content delivery network (CDN) that caches files at edge locations globally.

To set up CloudFront:
1. In AWS Console, navigate to **CloudFront**
2. Create a distribution pointing to your S3 bucket
3. Use the CloudFront domain name (e.g., `d111111abcdef8.cloudfront.net`) as your Media Library URL
4. Files will be automatically cached and delivered from the nearest location to your recipients
:::

::: warning URL Format
Do **not** include forward slashes (`/`) at the beginning or end of the URL.

**Correct:** `https://octeth-media-files.s3.amazonaws.com` or `https://d111111abcdef8.cloudfront.net`
**Incorrect:** `https://octeth-media-files.s3.amazonaws.com/` or `https://d111111abcdef8.cloudfront.net/`
:::

### File Upload Limits Tab

The File Upload Limits tab controls the maximum file sizes for different types of uploads in Octeth. These limits prevent users from uploading excessively large files that could consume server resources or cause performance issues.

All file sizes are specified in bytes. Use this reference for conversions:
- 1 MB (megabyte) = 1,048,576 bytes
- 5 MB = 5,242,880 bytes
- 10 MB = 10,485,760 bytes
- 25 MB = 26,214,400 bytes
- 50 MB = 52,428,800 bytes

::: tip Quick Conversion
To convert MB to bytes, multiply by 1,048,576:
- 5 MB × 1,048,576 = 5,242,880 bytes
- 10 MB × 1,048,576 = 10,485,760 bytes

Or use an online converter like Google: search "5 MB to bytes"
:::

**Import File Size**

The maximum file size allowed for importing subscriber lists and data files.

When users import subscribers using CSV or text files, this limit determines the largest file they can upload.

**Recommended values:**
- **Small installations (under 10,000 subscribers):** `10485760` (10 MB)
- **Medium installations (10,000-100,000 subscribers):** `52428800` (50 MB)
- **Large installations (100,000+ subscribers):** `104857600` (100 MB) or higher

::: info Why Import Files Can Be Large
Subscriber import files can contain thousands of rows with multiple columns of data (email, name, custom fields, etc.). A CSV file with 100,000 subscribers and 10 custom fields can easily exceed 10-20 MB.

Set this limit based on the largest import your users are likely to perform.
:::

::: warning Server Configuration Limits
Your import file size limit cannot exceed your server's PHP configuration limits. Check these PHP settings:
- `upload_max_filesize` - Maximum file size PHP will accept
- `post_max_size` - Maximum POST data size PHP will accept
- `memory_limit` - Maximum memory a PHP script can use

If your import limit is higher than these PHP limits, uploads will fail. Contact your system administrator to adjust PHP settings if needed.
:::

**Attachment Size**

The maximum file size allowed for email campaign attachments.

When users attach files to email campaigns (PDFs, documents, etc.), this limit controls the largest attachment they can upload.

**Recommended values:**
- **General use:** `5242880` (5 MB)
- **Large documents/PDFs:** `10485760` (10 MB)
- **Presentations and media:** `26214400` (25 MB)

::: warning Attachment Size Impact on Email Delivery
Large email attachments can cause delivery problems:
- Many email providers reject emails over 10-25 MB
- Large attachments increase spam scores
- Attachments slow down email sending
- Recipients with slow connections struggle to download large emails

**Best practice:** Instead of attaching large files directly to emails, upload them to your media library and include download links in your email content.
:::

::: tip Recommended Attachment Limits
For transactional emails (receipts, invoices): `2097152` (2 MB)
For marketing campaigns: `5242880` (5 MB)
For document distribution: `10485760` (10 MB) maximum

Files larger than 10 MB should be hosted separately and shared via links rather than email attachments.
:::

**Media File Size**

The maximum file size allowed for uploads to the media library (images, documents, etc.).

When users upload images and files to the media library for use in email campaigns, this limit controls the largest file they can upload.

**Recommended values:**
- **Images only:** `5242880` (5 MB)
- **Images and PDFs:** `10485760` (10 MB)
- **Images, PDFs, and videos:** `52428800` (50 MB)

::: info Typical Media File Sizes
- **Optimized email images:** 50-200 KB
- **High-resolution images:** 1-3 MB
- **PDF documents:** 500 KB - 5 MB
- **Short videos:** 10-50 MB

Most users won't need to upload files larger than 10 MB for email campaigns. Larger limits are only needed if users frequently upload videos or high-resolution graphics.
:::

::: tip Optimizing Media File Sizes
Encourage your users to optimize files before uploading:
- **Images:** Use JPG format and compress to 72 DPI for web use
- **PDFs:** Compress PDFs using "Save as reduced file size" options
- **Videos:** Host videos on YouTube or Vimeo and embed them rather than attaching directly

Smaller files load faster in emails, improve delivery rates, and reduce server storage consumption.
:::

**Saving Your Upload Settings**

After configuring all settings on both tabs, click the **UPDATE UPLOAD SETTINGS** button at the bottom of the page to save your changes.

::: danger Testing After Configuration Changes
After changing upload settings, especially when switching storage methods or adjusting file size limits:

1. **Test file uploads** - Try uploading files of various types and sizes to verify your configuration works
2. **Check existing files** - Ensure previously uploaded files are still accessible
3. **Verify S3 connection** - If using S3, confirm files appear in your S3 bucket and are accessible via the public URL
4. **Test in email campaigns** - Insert uploaded media into a test email and send it to verify images display correctly

Configuration errors can prevent users from uploading files or cause existing files to become inaccessible. Always test thoroughly before rolling out changes to production users.
:::

## Integrations

Octeth can integrate with popular third-party services to enhance your email marketing campaigns. The integrations settings allow you to connect external tools for campaign tracking, professional email design, and analytics.

To access integrations settings, navigate to **Administrator Dashboard** → **Settings** → **Integrations**.

### Google Analytics

Google Analytics integration allows you to track how subscribers interact with your email campaigns in your Google Analytics dashboard. When enabled, Octeth automatically adds tracking parameters to all links in your email campaigns so you can measure:

- Which email campaigns drive the most website traffic
- How subscribers behave on your website after clicking email links
- Conversion rates from email campaigns
- Which links in your emails get the most clicks

**How It Works**

When you configure Google Analytics integration, Octeth adds two tracking parameters (`utm_source` and `utm_medium`) to every link in your email campaigns. These parameters tell Google Analytics that the visitor came from your email campaign.

**Source Keyword**

The source parameter identifies where the traffic came from. This typically identifies Octeth or your brand name.

Example: `octeth` or `email-marketing` or `newsletter`

When a subscriber clicks a link in your email, the link will include `utm_source=octeth` (or whatever value you set).

**Medium Keyword**

The medium parameter classifies the type of marketing channel. For email campaigns, this is typically set to `email`.

Example: `email` or `email-campaign`

When a subscriber clicks a link, the link will include `utm_medium=email` (or whatever value you set).

::: tip Viewing Campaign Performance in Google Analytics
After configuring this integration, you can view email campaign performance in your Google Analytics dashboard:

1. Log into Google Analytics
2. Navigate to **Acquisition** → **Campaigns** → **All Campaigns**
3. Look for campaigns with your source keyword (e.g., `octeth`)
4. See detailed metrics: sessions, bounce rate, conversions, revenue, etc.

This helps you understand which email campaigns are most effective at driving valuable actions on your website.
:::

::: info Leave Empty to Disable
If you don't use Google Analytics or don't want to track email campaigns, leave both fields empty. Email campaigns will work normally without these parameters.
:::

### Stripo.email

Stripo.email is a professional drag-and-drop email builder that makes creating beautiful, mobile-responsive emails easy—even if you have no design or coding skills. When integrated with Octeth, your users can design stunning emails using Stripo's visual editor with pre-built templates, content blocks, and design tools.

**Why Use Stripo.email?**

- **No coding required** - Build professional emails by dragging and dropping content blocks
- **Mobile-responsive** - Emails automatically adapt to mobile, tablet, and desktop screens
- **Template library** - Access hundreds of pre-designed email templates
- **Brand consistency** - Save custom blocks and templates for reuse
- **Real-time preview** - See exactly how your email looks before sending

::: info Getting Stripo.email Credentials
To use this integration, you need a Stripo.email account and plugin credentials:

1. Sign up at https://stripo.email/
2. Log into your Stripo account
3. Navigate to **Settings** → **Plugins**
4. Create a new plugin
5. Copy the **Plugin ID** and **Secret Key**
6. Optionally, create project-specific API keys for individual users
:::

**Plugin ID**

Your unique Stripo plugin identifier. This looks like a UUID string (e.g., `a1b2c3d4-e5f6-7890-abcd-ef1234567890`).

Paste the Plugin ID exactly as shown in your Stripo account.

**Secret Key**

Your Stripo plugin authentication credential. This is a long string used to securely connect Octeth to your Stripo account.

Keep this credential confidential—anyone with your Secret Key can access your Stripo plugin.

**API Key**

Optional configuration for multi-user environments. This field accepts a JSON object that maps individual user IDs to their specific Stripo project API keys.

Example format:
```json
{
  "123": "project-api-key-for-user-123",
  "456": "project-api-key-for-user-456"
}
```

This allows different users to use their own Stripo projects and templates while sharing the same Octeth installation.

::: tip When to Use API Key Mapping
The API Key field is optional and only needed if:
- You have multiple users on your Octeth installation
- Each user should have their own isolated Stripo workspace
- You want to separate templates and designs between users

For simple installations or single-user environments, you can leave this field empty.
:::

**Disabling Stripo.email Integration**

To disable Stripo.email, clear both the **Plugin ID** and **Secret Key** fields and save. The Stripo email builder option will no longer appear to users.

### Unlayer

Unlayer is an alternative drag-and-drop email builder similar to Stripo.email. It provides a visual email design tool with templates, customization options, and mobile-responsive design capabilities.

**Why Use Unlayer?**

- **Visual email builder** - Create emails by dragging and dropping content blocks
- **Template library** - Start with professionally designed templates
- **Mobile optimization** - Emails automatically adapt to different screen sizes
- **Custom branding** - Customize the editor interface with your own branding

::: info Getting Unlayer Credentials
To use this integration, you need an Unlayer account:

1. Sign up at https://unlayer.com/
2. Log into your Unlayer account
3. Navigate to **Projects** in your dashboard
4. Create a new project or select an existing one
5. Copy the **Project ID** and **API Key** from your project settings
:::

**Project ID**

Your Unlayer project identifier. This is a numeric or alphanumeric string that identifies your Unlayer project.

**API Key**

Your Unlayer project API credential. This authenticates Octeth's connection to your Unlayer project.

::: warning Stripo vs Unlayer
You can enable both Stripo.email and Unlayer integrations simultaneously. Your users will be able to choose which email builder they prefer when creating campaigns.

However, for simpler user experience, most installations enable only one email builder to avoid confusion.
:::

**Disabling Unlayer Integration**

To disable Unlayer, clear both the **Project ID** and **API Key** fields and save. The Unlayer email builder option will no longer appear to users.

### Saving Your Changes

After configuring your integrations:

1. Review all settings to ensure credentials are entered correctly
2. Click **Save Settings** at the bottom of the page
3. Test each integration to verify it's working:
   - **Google Analytics:** Send a test campaign and check if tracking parameters appear in links
   - **Stripo/Unlayer:** Try creating a new email campaign and verify the email builder loads correctly

::: danger Credential Security
Integration credentials (Secret Keys, API Keys) should be treated as sensitive passwords:

- Never share them publicly or commit them to version control
- Use credentials from trusted accounts only
- Rotate credentials periodically for better security
- If a credential is compromised, regenerate it in the third-party service immediately
:::
