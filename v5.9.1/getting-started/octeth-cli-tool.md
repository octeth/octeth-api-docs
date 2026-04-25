---
layout: doc
---

# Octeth CLI Tool

The Octeth CLI tool helps you manage your Octeth installation from the command line. You'll find it at `/opt/octeth/cli/octeth.sh` on your server. This tool gives you control over containers, processes, logs, and other system operations.

All commands follow this pattern:

```bash
/opt/octeth/cli/octeth.sh <command>
```

::: tip
You can run `/opt/octeth/cli/octeth.sh help` at any time to see a complete list of available commands.
:::

## Docker Container Management

These commands control the main Octeth containers that run your email marketing platform.

**Starting Octeth containers:**

```bash
/opt/octeth/cli/octeth.sh docker:up
```

This starts all Octeth containers. Use this command when you first set up Octeth or after stopping the containers.

**Stopping Octeth containers:**

```bash
/opt/octeth/cli/octeth.sh docker:down
```

This stops and removes all Octeth containers. Your data remains safe in Docker volumes.

**Checking container status:**

```bash
/opt/octeth/cli/octeth.sh docker:status
```

This shows you which containers are running and their current state. Use this to verify everything is working properly.

**Restarting containers:**

```bash
/opt/octeth/cli/octeth.sh docker:restart
```

This restarts all Octeth containers. Use this when you need to apply configuration changes.

## Backend Process Management

Backend processes handle important tasks like sending emails and processing campaigns. These commands help you manage them.

**Starting backend processes:**

```bash
/opt/octeth/cli/octeth.sh backend:start
```

This starts all background workers that process your email campaigns and handle automation. Run this after starting Docker containers.

**Stopping backend processes:**

```bash
/opt/octeth/cli/octeth.sh backend:stop
```

This stops all background workers. Use this when you need to perform maintenance or updates.

**Checking backend status:**

```bash
/opt/octeth/cli/octeth.sh backend:status
```

This shows you which background processes are running. Use this to verify your email campaigns are being processed.

**Restarting backend processes:**

```bash
/opt/octeth/cli/octeth.sh backend:restart
```

This restarts all background workers. Use this when processes aren't responding or after configuration changes.

## Send Engine Management

The send engine handles the actual delivery of your emails. You can scale it up or down based on your sending volume.

**Starting the send engine:**

```bash
/opt/octeth/cli/octeth.sh sendengine:start
```

This starts one send engine instance. The send engine connects to your SMTP servers and delivers emails.

**Scaling the send engine:**

```bash
/opt/octeth/cli/octeth.sh sendengine:scale 5
```

This adjusts the number of send engine instances. Increase this number when sending large campaigns to speed up delivery.

**Checking send engine status:**

```bash
/opt/octeth/cli/octeth.sh sendengine:status
```

This shows how many send engine instances are running and their current state.

**Viewing send engine logs:**

```bash
/opt/octeth/cli/octeth.sh sendengine:logs -f
```

This displays live logs from the send engine. Use this to monitor email delivery in real-time.

::: tip
Start with one send engine instance and scale up only when needed. Each instance uses additional server resources.
:::

## Log Management

Logs help you understand what's happening in your Octeth system and troubleshoot issues.

**Viewing live logs:**

```bash
/opt/octeth/cli/octeth.sh logs:tail
```

This displays live error logs from Octeth. The logs update automatically as new entries appear.

**Clearing log files:**

```bash
/opt/octeth/cli/octeth.sh logs:reset
```

This clears all error log files. Use this to start fresh when troubleshooting or after resolving issues.

**Creating a log snapshot:**

```bash
/opt/octeth/cli/octeth.sh logs:snapshot
```

This creates a backup of all current log files. Use this before clearing logs or when you need to share logs with support.

**Checking log file sizes:**

```bash
/opt/octeth/cli/octeth.sh logs:size
```

This shows how much disk space your log files are using.

**Fixing log file permissions:**

```bash
/opt/octeth/cli/octeth.sh logs:fix-permissions
```

This fixes permission issues that prevent Octeth from writing to log files. Run this if you see permission denied errors.

## Environment and Configuration

These commands help you view and modify your Octeth configuration settings.

**Viewing a configuration value:**

```bash
/opt/octeth/cli/octeth.sh env:get MYSQL_HOST
```

This displays the current value of a specific setting.

**Changing a configuration value:**

```bash
/opt/octeth/cli/octeth.sh env:set MYSQL_HOST 'localhost'
```

This updates a configuration setting. Restart the affected containers after making changes.

**Searching configuration:**

```bash
/opt/octeth/cli/octeth.sh env:search MYSQL
```

This finds all configuration settings that match your search term.

**Viewing system configuration:**

```bash
/opt/octeth/cli/octeth.sh config:list
```

This displays all active configuration values loaded by Octeth.

**Getting a specific configuration value:**

```bash
/opt/octeth/cli/octeth.sh config:get APP_URL
```

This displays the current value of a specific configuration constant.

**Migrating from an old configuration file:**

```bash
/opt/octeth/cli/octeth.sh config:migrate /path/to/old/config.inc.php
```

This analyzes an old monolithic `config.inc.php` file and generates a migration report. Use this when upgrading from an older Octeth installation that used a single configuration file instead of the current modular system (environment files + `config/global/*.php`).

The report shows:

- **Environment variables to set** — Settings that differ from new defaults, grouped by config file. Copy these values into your `.oempro_env` file.
- **Array constant differences** — Changes in const arrays like `OEMPRO_SERVICE_HOSTNAMES`. Edit the corresponding `const_*.php` files in `config/global/`.
- **Data structures** — Large data structures (bounce patterns, custom field presets, TinyMCE settings, DNS templates) that are now in dedicated config files. Review these only if you customized them.
- **Dynamic values** — Constants that referenced variables or other constants. Each one includes guidance on where to configure it in the new system.
- **Obsolete settings** — Old constants that no longer exist, with explanations of what replaced them.
- **Matching defaults** — Constants that already match the new default values. No action needed for these.

Example:

```bash
/opt/octeth/cli/octeth.sh config:migrate data/config.inc.old.php
```

::: tip
This command is read-only. It does not modify any files — it only analyzes and reports. You apply the changes manually based on the report.
:::

::: warning
Always restart the appropriate containers after changing configuration values to apply your changes.
:::

## Database Operations

These commands help you manage your Octeth database and run maintenance tasks.

**Running database updates:**

```bash
/opt/octeth/cli/octeth.sh migrate
```

This applies database updates needed for new Octeth versions. Always run this after upgrading Octeth.

**Opening the ClickHouse database:**

```bash
/opt/octeth/cli/octeth.sh clickhouse:client
```

This opens an interactive session with the ClickHouse database where Octeth stores analytics data.

**Running a ClickHouse query:**

```bash
/opt/octeth/cli/octeth.sh clickhouse:query "SHOW TABLES"
```

This runs a single query against the ClickHouse database and displays the results.

**Switching MySQL configuration:**

```bash
/opt/octeth/cli/octeth.sh mysql:switch-config standard
```

This changes MySQL performance settings. Options include **development**, **small**, **standard**, and **highperf**. Choose based on your server's resources.

::: danger
Switching MySQL configuration will temporarily stop your database and all backend processes. Only do this during a maintenance window.
:::

**Viewing MySQL slow query log:**

```bash
/opt/octeth/cli/octeth.sh mysql:slow-log
```

This displays slow database queries that may be affecting performance. By default, it shows the last 50 queries. Use this when diagnosing performance issues or troubleshooting slow campaign sending.

You can specify how many lines to display:

```bash
/opt/octeth/cli/octeth.sh mysql:slow-log --lines=100
```

::: tip
If you see queries taking several seconds to complete, contact Octeth support. They can help optimize your database performance.
:::

## Cache Management

Octeth uses caching to improve performance. These commands help you manage cached data.

**Viewing cached data:**

```bash
/opt/octeth/cli/octeth.sh cache:get 'subscriber_count_123'
```

This displays the value stored in cache for a specific key.

**Listing cache keys:**

```bash
/opt/octeth/cli/octeth.sh cache:list 'subscriber_*'
```

This shows all cache keys matching your pattern.

**Removing cached data:**

```bash
/opt/octeth/cli/octeth.sh cache:forget 'subscriber_count_123'
```

This deletes a specific cached value. Octeth will recreate it when needed.

**Clearing multiple cache entries:**

```bash
/opt/octeth/cli/octeth.sh cache:flush 'subscriber_counts_*'
```

This removes all cache entries matching your pattern. Use this carefully as it can temporarily slow down your system.

**Viewing cache statistics:**

```bash
/opt/octeth/cli/octeth.sh cache:stats
```

This shows information about your cache system including memory usage.

## Installation and Setup

These commands help you install and configure Octeth.

**Starting a fresh installation:**

```bash
/opt/octeth/cli/octeth.sh install:start
```

This guides you through setting up a new Octeth installation. Only use this on a fresh server or after running `install:reset`.

**Resetting your installation:**

```bash
/opt/octeth/cli/octeth.sh install:reset
```

This removes all Octeth data and configuration, returning your server to a clean state.

::: danger
This command permanently deletes all your data, campaigns, subscribers, and settings. Use only when you want to start completely fresh.
:::

**Installing CLI tools globally:**

```bash
/opt/octeth/cli/octeth.sh cli:install
```

This makes the Octeth CLI tool available from anywhere on your server. After running this, you can use `octeth` instead of `/opt/octeth/cli/octeth.sh`.

## System Health and Testing

These commands help you verify that Octeth is working correctly.

**Checking system health:**

```bash
/opt/octeth/cli/octeth.sh health:check
```

This runs a comprehensive check of all Octeth services and displays their status. Use this to verify everything is working properly.

**Setting up the test database:**

```bash
/opt/octeth/cli/octeth.sh test:setup
```

This prepares a test database for running automated tests. Only needed if you're testing new features or troubleshooting.

**Running tests:**

```bash
/opt/octeth/cli/octeth.sh test:run all
```

This runs all automated tests to verify Octeth functionality. Mainly used by support staff or when troubleshooting complex issues.

## System Utilities

These commands perform maintenance tasks and fix common issues.

**Fixing file permissions:**

```bash
/opt/octeth/cli/octeth.sh permissions:fix
```

This corrects file and folder permissions that may prevent Octeth from working properly. Run this if you see permission errors.

**Installing dependencies:**

```bash
/opt/octeth/cli/octeth.sh composer:install
```

This installs or updates required software packages. Run this after upgrading Octeth or when instructed by support.

**Regenerating authentication tokens:**

```bash
/opt/octeth/cli/octeth.sh regenerate-auth-tokens
```

This fixes authentication issues where users can't log in. Use this if users report login problems after password changes.

::: tip
Most day-to-day operations only require the **backend:start**, **backend:stop**, and **backend:status** commands. The other commands are typically used during setup, upgrades, or troubleshooting.
:::
