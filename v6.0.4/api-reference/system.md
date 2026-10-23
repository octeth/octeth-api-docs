---
layout: doc
---

# System API Documentation

System health monitoring and diagnostics endpoints for infrastructure components.

## Check System Health

<Badge type="info" text="GET" /> `/api/v1/system-health-check`

::: tip API Usage Notes
- Authentication required: Admin API Key (via Bearer token or query parameter), or the dedicated health-check token when `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED` is on
- Legacy endpoint access via `/api.php` is also supported
- Admin-key calls are subject to `ADMIN_API_ENFORCE_ALLOWED_IP`; token calls are not
:::

**Request Parameters:**

| Parameter        | Type   | Required | Description                                                                                         |
|------------------|--------|----------|-----------------------------------------------------------------------------------------------------|
| Command          | String | Yes      | API command: `system.health.check` (only for legacy endpoint)                                       |
| AdminAPIKey      | String | No       | Admin API key, master or per-sub-admin (alternative to Bearer token)                                |
| HealthCheckToken | String | No       | The install's `SYSTEM_HEALTH_CHECK_TOKEN` (alternative to a Bearer token carrying the same value). Honoured only when `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED` is on |

**Authentication Methods:**

This endpoint supports two authentication methods:

1. **Bearer Token (Recommended):** Include the Admin API Key in the Authorization header:
   ```
   Authorization: Bearer YOUR_ADMIN_API_KEY
   ```

2. **Query Parameter:** Pass the Admin API Key as a query parameter:
   ```
   ?adminapikey=YOUR_ADMIN_API_KEY
   ```

### Strict authentication mode (v5.9.6)

With `SYSTEM_HEALTH_CHECK_AUTH_REQUIRED=true` in `.oempro_env` (the default for fresh installs), the endpoint accepts exactly two credentials:

1. **Admin API key**, master or per-sub-admin, as `AdminAPIKey` or `Authorization: Bearer <key>`.
2. **Health-check token**, the value of `SYSTEM_HEALTH_CHECK_TOKEN`, as `HealthCheckToken` or `Authorization: Bearer <token>`. Use this for external monitors so they never hold the master key; it grants the health report and nothing else.

Any other call answers HTTP 401. With the switch off (upgraded installs that have not enabled it), the historical behaviour is unchanged: the master key only, refused with HTTP 500 and error `100005`.

::: code-group

```bash [Example Request (Monitor token)]
curl -X GET https://example.com/api/v1/system-health-check \
  -H "Authorization: Bearer YOUR_SYSTEM_HEALTH_CHECK_TOKEN"
```

```json [Error Response (HTTP 401, strict mode)]
{
  "Success": false,
  "ErrorCode": 99998,
  "ErrorMessage": "Invalid API key"
}
```

:::

| Code   | HTTP | Description                                                                 |
|--------|------|-----------------------------------------------------------------------------|
| 99998  | 401  | Strict mode: no valid admin key or health-check token was presented         |
| 100005 | 500  | Legacy mode: the master admin key was missing or wrong                      |

::: code-group

```bash [Example Request (Bearer Token)]
curl -X GET https://example.com/api/v1/system-health-check \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

```bash [Example Request (Query Parameter)]
curl -X GET "https://example.com/api/v1/system-health-check?adminapikey=YOUR_ADMIN_API_KEY"
```

```bash [Example Request (Legacy)]
curl -X GET "https://example.com/api.php?Command=system.health.check&adminapikey=YOUR_ADMIN_API_KEY"
```

```json [Success Response (HTTP 200)]
{
  "Checks": {
    "MySQL": "OK",
    "ClickHouse": "OK",
    "RabbitMQ": "OK",
    "Redis": "OK",
    "Session": "OK",
    "SystemContainer": "OK",
    "Vector": "OK",
    "WebsiteEventRouting": "OK",
    "Haproxy": "OK",
    "ClientIPResolution": "OK",
    "ListUnsubscribeOneClick": "OK",
    "TrackingDomainTLS": "OK",
    "Cron": "OK",
    "Supervisor": "OK",
    "SendEngine": "OK",
    "AdminFrontend": "OK",
    "UserFrontend": "OK",
    "FilePermissions": "OK"
  }
}
```

```json [Partial Failure Response (HTTP 503)]
{
  "Checks": {
    "MySQL": "OK",
    "ClickHouse": "OK",
    "RabbitMQ": "OK",
    "Redis": "[111] Connection refused",
    "Session": "OK",
    "SystemContainer": "OK",
    "Vector": "Timeout after 3 seconds",
    "WebsiteEventRouting": "HAProxy did not route /hello/message to backend_vector (HTTP 503; \"X-Server: oempro_vector\" response header missing). Check that backend_vector has an available server.",
    "NewUserInterface": "The new user interface did not answer /ui/health through HAProxy (HTTP 404). Check: docker logs oempro_ui, then run ./cli/octeth.sh docker:up, or docker restart oempro_ui.",
    "Haproxy": "OK",
    "ClientIPResolution": "WARNING: this request carried X-Forwarded-For (\"203.0.113.7\") but the client address resolved to 192.168.99.100, which is inside INTERNAL_PROXY_NETWORKS. The forwarded chain is being discarded ...",
    "ListUnsubscribeOneClick": "WARNING: this install is not advertising RFC 8058 one-click unsubscribe on every path. APP_URL is \"http://mail.example.com/\", which is not https, so campaign and autoresponder messages emit an http: List-Unsubscribe URI and their List-Unsubscribe-Post header is SUPPRESSED ...",
    "TrackingDomainTLS": "WARNING: 2 enabled sender domain(s) have a tracking host that did not complete a TLS handshake when probed from this server: example.com (handshake_failed), example.org (expired). Their click, open and List-Unsubscribe links may not work over https. Check the certificate Caddy issued for each tracking host; the probe repeats on the hourly re-verification sweep.",
    "Cron": "App container cron not executing (last run: 120 seconds ago)",
    "Supervisor": "# campaign_delivery_worker: STOPPED # journey_worker: FATAL ",
    "SendEngine": "No send engine containers running",
    "AdminFrontend": "OK",
    "UserFrontend": "Backend user login form action is not found",
    "FilePermissions": "logs/campaign_delivery.log: expected 0664, 0660, 0644 or 0640, found 0666"
  }
}
```

```json [Authentication Error (HTTP 403)]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Authentication failed. Invalid admin API key."
    }
  ]
}
```

```txt [Error Codes]
0: Success - All health checks passed
1: Authentication failed. Invalid admin API key.

HTTP Status Codes:
200: All health checks passed
403: Authentication failed
503: One or more health checks failed (see Checks object for details), or MySQL could not be reached (plain-text body, see below)
```

:::

**Health Check Components:**

The endpoint performs comprehensive health checks on the following components:

- **MySQL**: Database connectivity and admin user existence. The check fails with `There is no registered admin user.` when the admins table is empty <Badge type="tip" text="Changed in v6.0.1" />
- **ClickHouse**: Analytics database connectivity
- **RabbitMQ**: Message queue connectivity
- **Redis**: Cache server connectivity
- **Session**: PHP session functionality
- **SystemContainer**: Laravel backend container health (`/system/ping`)
- **Vector**: Log aggregation service health (probed directly)
- **WebsiteEventRouting** <Badge type="tip" text="New in v5.9.3" />: The full load-balancer → Vector path used by the public website-event tracker
- **NewUserInterface** <Badge type="tip" text="Changed in v6.0.2" />: Whether the new user interface answers through the load balancer. Present on every install from v6.0.2, because the interface is always on

- **Haproxy**: Load balancer connectivity
- **ClientIPResolution** <Badge type="tip" text="New in v6.0.0" />: Whether the real visitor IP is being resolved, or a forwarded chain is being discarded and a container address recorded instead
- **ListUnsubscribeOneClick** <Badge type="tip" text="New in v6.0.0" />: Whether this install can advertise RFC 8058 one-click unsubscribe, which requires https from both `APP_URL` and `TRACKING_URL_PROTOCOL`
- **TrackingDomainTLS** <Badge type="tip" text="New in v6.0.1" />: Whether every enabled sender domain's tracking host completed a TLS handshake at its last out-of-band probe. A warning only, it never makes the endpoint fail
- **Cron**: App and system container cron job execution (heartbeat checks)
- **Supervisor**: Process manager status for all managed processes
- **SendEngine**: Send engine container discovery and supervisor process status
- **AdminFrontend**: Admin login page renders on the origin server, with the expected login form <Badge type="tip" text="Changed in v6.0.1" />
- **UserFrontend**: User login page renders on the origin server, with the expected login form <Badge type="tip" text="Changed in v6.0.1" />
- **FilePermissions**: Directory and log file permissions (expects 0775 or 0770 for directories, which `permissions:fix` sets as 2775, and 0664, 0660, 0644 or 0640 for log files; since v6.0.2 a world-writable directory or log file fails)

**Response Details:**

- Each check returns `"OK"` if successful
- Failed checks return detailed error messages explaining the failure
- HTTP status code 200 indicates all checks passed
- HTTP status code 503 indicates one or more checks failed (response still includes all check results)
- When MySQL cannot be reached at all (connection refused, unknown host, too many connections, authentication failure or a missing database), the request ends before the handler runs. The response is HTTP 503 with a `Retry-After: 30` header and a plain-text body starting `MySQL Error:`, not the JSON `Checks` object <Badge type="tip" text="Changed in v6.0.1" />. Earlier versions answered this case with HTTP 200, so monitors must key on the status code, not on the body. Every other page and API command returns the same 503 during a MySQL outage.
- The Cron check monitors heartbeat files updated every minute; considers cron failed if > 90 seconds since last update
- The Supervisor check reports processes not in `RUNNING` state with format: `# process_name: STATE`
- The SendEngine check discovers containers dynamically using Docker Compose project prefix detection

### The `ClientIPResolution` check

<Badge type="tip" text="New in v6.0.0" />

This check reports whether the install is recording the real visitor IP, or a container address.

Forwarded headers are only honoured when the request's immediate peer is trusted, which is loopback, the bundled composition's own network (`INTERNAL_PROXY_NETWORKS`), or a proxy you listed in `TRUSTED_PROXIES`. If you put your own load balancer, reverse proxy or CDN in front of Octeth at an address that is not in those sets, the `X-Forwarded-For` chain is discarded and that proxy's address is recorded as the visitor for every request.

The symptoms are wide and none of them look like an IP problem:

- the admin **Authorized IP Addresses** allow-list compares the wrong address, so it either locks everyone out or admits everyone;
- per-IP rate limits treat all traffic as a single visitor;
- geo attribution resolves every open and click to one place;
- `SubscriptionIP`, `OptInIP` and `UnsubscriptionIP`, which exist as the consent audit trail, hold a container address. That one is **not recoverable**, because the real address was never stored.

The check fires only on the combination that actually proves the fault: a forwarded chain arrived **and** the address resolution still settled on an internal one. A caller with no forwarded chain is a direct internal caller, which says nothing either way and is reported as `OK`, so a health check run from inside the install (a monitor container, the CLI, a cron) does not produce a false warning.

If it warns, add your proxy's address or subnet to `TRUSTED_PROXIES`, or set `TRUST_CLOUDFLARE_CONNECTING_IP=true` if you are behind Cloudflare. If you changed the compose network, correct `INTERNAL_PROXY_NETWORKS` instead.

### The `ListUnsubscribeOneClick` check

<Badge type="tip" text="New in v6.0.0" />

This check reports whether the install is able to advertise RFC 8058 one-click unsubscribe, which Gmail and Yahoo require of bulk senders.

RFC 8058 requires the `List-Unsubscribe` URI paired with `List-Unsubscribe-Post` to be https. Where that URI's scheme comes from depends on the send path, and **two independent settings decide it**:

| Setting | Governs |
|---|---|
| `APP_URL` | Campaign and autoresponder messages, which build the URI from `APP_URL` and replace only the host with the tracking domain |
| `TRACKING_URL_PROTOCOL` | Email Gateway and opt-in confirmation messages sent on a sender domain's own tracking host, which do not consult `APP_URL` at all |

Wherever the resulting URI would be `http:`, Octeth suppresses the `List-Unsubscribe-Post` header **on that path** rather than advertise one-click against a URI that does not meet the specification, because a receiver that notices may distrust the header pair entirely.

So an https `APP_URL` on its own does not guarantee one-click everywhere. The check inspects both settings and names whichever is not https, along with the paths that setting governs, so a mismatch between the two cannot hide.

That suppression is invisible from outside the install: mail still delivers, recipients can still unsubscribe through the `List-Unsubscribe` URI, and nothing reports an error. This check is the only place an operator finds out it is happening.

It reads configuration rather than the current request, so it reports the same result on every scrape.

A custom tracking domain takes its certificate from Caddy on-demand TLS, and an https URI whose TLS handshake fails is worse than an http one. That case is reported by the separate [`TrackingDomainTLS`](#the-trackingdomaintls-check) check.

### The `TrackingDomainTLS` check

<Badge type="tip" text="New in v6.0.1" />

Each sender domain's tracking host gets its certificate from Caddy on-demand TLS. If issuance fails for one domain (the customer's DNS record was repointed, the host was put behind a CDN, an ACME rate limit was hit), every click, open and `List-Unsubscribe` URL in that customer's mail points at an https host whose handshake fails. Mail still delivers and nothing else reports it.

The `sender_domain_verifier` worker probes each enabled sender domain's tracking host out of band: it opens a TLS connection to port 443 with certificate and host name verification, and stores the outcome on the sender domain. It runs on the hourly re-verification sweep (`SENDER_DOMAIN_REVERIFY_STALENESS_HOURS` decides how often each domain is probed, and probes share the `SENDER_DOMAIN_REVERIFY_BATCH_SIZE` cap with DNS re-verification) and once about two minutes after a domain is verified. A failure is stored only when a confirmation probe about two minutes later fails too.

This check reads those stored results. It never probes during the request, so it is cheap to scrape. It names up to 20 affected domains with the reason in parentheses, then a count of the rest:

| Reason | Meaning |
|---|---|
| `dns_failed` | The tracking host does not resolve |
| `blocked_address` | It resolves to a private or reserved address, so it was not probed |
| `unreachable` | No TCP connection on port 443 |
| `handshake_failed` | Port 443 answered but the handshake failed, typically no certificate issued |
| `name_mismatch` | The certificate does not cover the tracking host |
| `expired` / `not_yet_valid` | The certificate is outside its validity period |
| `self_signed` / `untrusted` | The certificate does not chain to a trusted authority |

The value is a warning and never sets the overall result to failed. The probe runs from the Octeth server, and a recipient's network can see a different answer, for example when a CDN blocks the origin's address. The same per-domain warning, with the full error text, is shown to the domain's owner on the sender domain screen.

Only hosts listed in the domain's DNS record template are probed, because only those are used by the send paths. The default sender domain is never probed. A failing probe never disables a domain or changes where its links point.

If the check reports that the results could not be read, the database migration that adds the probe columns has not run yet.

### The `WebsiteEventRouting` check

<Badge type="tip" text="New in v5.9.3" />

The `Vector` check talks to the Vector container directly, so it cannot see a broken load-balancer route. `WebsiteEventRouting` exercises the **routed** path instead, the same path the public website-event tracker uses, so that failure mode is actually detected. Both checks are kept, so a genuine Vector outage stays distinguishable from broken routing.

This exists because of a real, long-lived outage: a startup DNS race left the Vector backend with no available server for roughly four weeks. The load balancer resolved the container name once at boot, failed while the container was still starting, and permanently disabled the server. Vector itself stayed healthy the whole time, so the health check reported `OK` while the public website-event endpoint returned HTTP 503 to every visitor.

How it probes:

- It issues a **GET** to the website-event path through the load balancer. `GET` is deliberate: Vector's HTTP source only accepts `POST`, so a `GET` is rejected before ingestion. A synthetic `POST` would be forwarded downstream and inject a junk website event on every health-check tick.
- It is also deliberately **not** an `OPTIONS` request: `OPTIONS` on the website-event paths is answered by a static backend that never touches Vector, so an `OPTIONS` probe would have stayed green throughout the outage described above.
- The assertion is the presence of the `X-Server: oempro_vector` **response header**, which only the Vector backend adds. The load balancer's internally generated "no server available" 503 is produced before those backend response rules run and therefore carries no such header. Matching the header rather than the status code proves the response really came from Vector through the intended route.

On failure the check reports the observed HTTP status and states that the `X-Server: oempro_vector` header was missing, pointing the operator at the Vector backend's server availability.

### The `NewUserInterface` check

<Badge type="tip" text="New in v6.0.1" /> <Badge type="tip" text="Changed in v6.0.2" />

This check reports whether the new user interface is actually serving pages. From v6.0.2 the interface is always on, so `Checks` and `Timings` have a `NewUserInterface` entry on every install. In v6.0.1 the entry appeared only while `UI_ENABLED` was `true`, so an install that had the interface off sees a new key after upgrading, and the whole call answers HTTP 503 when the interface does not answer.

The interface container answers "not found" for every page when it cannot read the settings it renders from `.oempro_env`, while the load balancer still sends `/user/` and `/ui/` to it. Nothing else reports that problem.

How it probes:

- It issues a **GET** to `http://oempro_haproxy:80/ui/health`, through the load balancer, so one request covers both the routing and the container's state. The request carries the host of `APP_URL` as its `Host` header.
- It passes only when the response is HTTP `200` **and** carries the `X-Server: oempro_ui` response header. The status matters because the interface container adds that header to its "not found" answers too. The header matters because without the routing rules `/ui/health` falls through to the classic application. When the request is redirected, only the final response's headers count.

On failure the check reports the observed HTTP status, states whether the `X-Server: oempro_ui` header was missing, and names the fix: read `docker logs oempro_ui`, then run `./cli/octeth.sh docker:up` or `docker restart oempro_ui`. A transport error (for example a timeout after 3 seconds) is reported as the error text. Either way the check counts as a failure of the whole call: the response answers HTTP 503 instead of 200, like any other failed check, and the failure is written to `data/logs/health_check_errors.log`. See [The interface container is unhealthy](/v6.0.4/new-user-interface/troubleshooting#the-interface-container-is-unhealthy).

### The `AdminFrontend` and `UserFrontend` checks

<Badge type="tip" text="Changed in v6.0.1" />

These checks load the admin and user login pages and confirm each page contains its login form. They test the origin server only. They do not test whether the login pages are reachable through your CDN, WAF or load balancer.

Before v6.0.1 the checks requested the login pages through the public `APP_URL`. The request left the server, resolved the app domain through public DNS and came back in through any CDN in front of the install. A firewall rule that restricted `/app/admin*` to your own IP address, or a short CDN outage, therefore failed the check and turned the whole response into HTTP 503 while the application was healthy.

How they probe now:

- Each check requests `http://127.0.0.1/app/admin/` or `http://127.0.0.1/app/user/` from inside the application container, with the host of `APP_URL` as the `Host` header. No DNS lookup is made for the app domain.
- Redirects are not followed, so the request cannot be sent back out through the public URL. A redirect answer counts as a failure.
- The request comes from `127.0.0.1`, which the admin **Authorized IP Addresses** allow-list always permits, so an allow-list does not block the check.
- The check passes when the page contains the login form, whose action is built from `APP_URL`. On failure it reports `Backend admin login form action is not found` (or the `user` equivalent), or the connection error text.

The check names, the failure messages and the 200/503 behaviour are unchanged.

To monitor whether the login pages are reachable from the internet, point an external uptime monitor at your public login URL, for example `https://example.com/app/admin/`. That monitor sees the CDN, DNS and TLS path that these checks deliberately skip.

## Process PowerMTA Log File

<Badge type="info" text="POST" /> `/api/v1/process_pmta_log_file`

::: tip API Usage Notes
- Authentication required: Admin API Key (via Bearer token)
- Rate limit: 100 requests per 60 seconds
- This endpoint is designed for PowerMTA integration to process email delivery logs
- Accepts batch processing of email events (delivery, bounce, etc.)
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                                     |
|-------------|--------|----------|-----------------------------------------------------------------|
| AdminAPIKey | String | Yes      | Admin API key for authentication (via Bearer token)             |
| LogData     | Array  | Yes      | Array of PowerMTA log entries (JSON format in POST body)        |

**PowerMTA Log Entry Format:**

Each log entry in the array should contain PowerMTA event data following the PowerMTA log format specification.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/process_pmta_log_file \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -d '[
    {
      "type": "delivery",
      "timeLogged": "2025-01-15T10:30:00Z",
      "recipient": "user@example.com",
      "messageId": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "type": "bounce",
      "timeLogged": "2025-01-15T10:31:00Z",
      "recipient": "invalid@example.com",
      "bounceType": "hard"
    }
  ]'
```

```json [Success Response]
{
  "Success": true,
  "ProcessedCount": 2,
  "ErrorCount": 0
}
```

```json [Error Response - Auth]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Invalid AdminAPIKey"
    }
  ]
}
```

```json [Error Response - Invalid Data]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Invalid or empty log data"
    }
  ]
}
```

```txt [HTTP Status Codes]
200: Success - Log data processed successfully
400: Bad Request - Invalid or empty log data
401: Unauthorized - Invalid Admin API Key
429: Too many requests - Rate limit exceeded
```

```txt [Error Codes]
1: Invalid AdminAPIKey
2: Invalid or empty log data
```

:::

**Processing Behavior:**

- Accepts both JSON and form-encoded POST data
- Processes events in batch for improved performance
- Returns processing results with success/error counts
- Failed events within a batch do not cause the entire batch to fail

## Get System Settings

<Badge type="info" text="GET" /> `/api/v1/system-settings`

::: tip API Usage Notes
- Authentication required: Admin API Key (or logged-in admin session)
- Legacy endpoint access via `/api.php` is also supported
:::

Returns a unified snapshot of every Octeth configuration value the running instance can see. Settings are grouped by source so callers can drill into a specific layer without merging four separate views themselves.

The endpoint surfaces four sources:

1. **`ConfigFiles`**: every `*.php` file under `config/global/` (each returns an array). The `app.php` file is intentionally skipped because it declares the `SystemConfig` class and has side effects; its values are already represented in `EnvSettings.octeth` and `DefinedConstants`.
2. **`EnvSettings`**: `SystemConfig::$Config`, populated from the six `.oempro_*_env` files: `octeth`, `mysql`, `redis`, `rabbitmq`, `clickhouse`, `supervisor`.
3. **`RuntimeOptions`**: every row in the `oempro_options` table (the runtime-editable options used by `OemproOptions::get()`/`set()`). JSON-encoded values are decoded automatically when they are arrays.
4. **`DefinedConstants`**: `get_defined_constants(true)['user']`: every constant registered by `ConfigLoader` plus library `define()` calls.

**Sensitive value redaction:** any key whose name contains a known secret substring (case-insensitive: `PASSWORD`, `PASSWD`, `_PASS`, `SECRET`, `SALT`, `TOKEN`, `API_KEY`, `APIKEY`, `CLIENT_SECRET`, `ENCRYPTION_KEY`, `HMAC`, `ERLANG_COOKIE`, `LICENSE_KEY`, `AUTH_CODE`, `BUGSNAG_API`, `SENTRY_API`, `PRIVATE_KEY`, `WEBHOOK_SECRET`) has its value replaced with the literal string `"***REDACTED***"`. The key itself remains visible. Empty values pass through untouched so callers can distinguish "configured but blank" from "configured with a value, redacted". Never post the literal `***REDACTED***` back as a value: `settings.update` refuses it with `ErrorCode 13` (see [Update System Settings](./settings.md#update-system-settings)), and no other write command treats it specially, so writing it anywhere else stores the marker as the real value. Omit a field to keep its stored secret.

**Request Parameters:**

| Parameter   | Type   | Required | Description                                                                                                            |
|-------------|--------|----------|------------------------------------------------------------------------------------------------------------------------|
| Command     | String | Yes      | API command: `system.getsettings` (only for legacy endpoint)                                                            |
| AdminAPIKey | String | No       | Admin API key for authentication (alternative to logged-in admin session). Sent as `adminapikey` query parameter.       |
| Section     | String | No       | Restrict the response to a single source. Possible values: `ConfigFiles`, `EnvSettings`, `RuntimeOptions`, `DefinedConstants`. If omitted, all four sections are returned. |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/system-settings?adminapikey=YOUR_ADMIN_API_KEY"
```

```bash [Example Request (Legacy)]
curl -X GET "https://example.com/api.php?Command=System.GetSettings&adminapikey=YOUR_ADMIN_API_KEY"
```

```bash [Example Request (Filtered)]
curl -X GET "https://example.com/api/v1/system-settings?Section=EnvSettings&adminapikey=YOUR_ADMIN_API_KEY"
```

```json [Success Response]
{
  "Success": true,
  "Settings": {
    "ConfigFiles": {
      "email_delivery": { "EMAIL_DELIVERY_BATCH_SIZE": 100 },
      "sms": { "SMS_GATEWAY_TIMEOUT": 30 }
    },
    "EnvSettings": {
      "octeth": {
        "APP_URL": "https://example.com/",
        "PRODUCT_VERSION": "5.9.1",
        "MYSQL_PASSWORD": "***REDACTED***",
        "LICENSE_KEY": "***REDACTED***",
        "OEMPRO_PASSWORD_SALT": "***REDACTED***"
      },
      "mysql":      { "MYSQL_HOST": "oempro_mysql", "MYSQL_PASSWORD": "***REDACTED***" },
      "redis":      { "REDIS_HOST": "oempro_redis" },
      "rabbitmq":   { "RABBITMQ_DEFAULT_USER": "oempro", "RABBITMQ_DEFAULT_PASS": "***REDACTED***" },
      "clickhouse": { "CLICKHOUSE_HOST": "oempro_clickhouse" },
      "supervisor": { "SUPERVISOR_USERNAME": "admin" }
    },
    "RuntimeOptions": {
      "FailedWebhookHandler": "email",
      "DisableUserPasswordReset": ""
    },
    "DefinedConstants": {
      "APP_PATH": "/var/www/html",
      "CHARSET": "utf-8",
      "OEMPRO_DEBUG": true,
      "PRODUCT_VERSION": "5.9.1",
      "ADMIN_API_KEY": "***REDACTED***"
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Invalid Section. Allowed: ConfigFiles, EnvSettings, RuntimeOptions, DefinedConstants"
}
```

```txt [Error Codes]
1: Invalid Section value (must be one of ConfigFiles, EnvSettings, RuntimeOptions, DefinedConstants)
99998: Authentication required - missing or invalid admin credentials
```

:::

**Use cases:**

- Diagnosing configuration drift between environments
- Support escalations where the operator needs to share a redacted config snapshot
- Verifying that a setting (env var, runtime option, or constant) is actually present and reaching the application
- Auditing which secrets are configured without exposing their values

## List Installed Language Packs

<Badge type="info" text="GET" /> `/api/v1/system.languages.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `GET /api/v1/system.languages.get`. Legacy access via `/api.php` is also supported
- The only values `settings.update` accepts for `DEFAULT_LANGUAGE` and `USER_SIGNUP_LANGUAGE`.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `system.languages.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "system.languages.get", "APIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Languages": [{"Code": "en", "Name": "English"}],
  "TotalLanguages": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998
}
```

```txt [Error Codes]
0: Success
```

:::

## Run the System Check

<Badge type="info" text="GET" /> `/api/v1/admin.system.check`

<Badge type="tip" text="New in v5.9.6" />

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `System`)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Runs the requirements and settings check shown on the admin About page: PHP ini flags (`register_globals`, `magic_quotes_*`, `safe_mode`, `max_execution_time`), the required PHP extensions, the PHP version, write access to the `data/` directories, and whether MySQL runs with a STRICT `sql_mode`. Directory messages name the path relative to the application root; the response never carries an absolute path.

`Errors` is a map of category (`PHP Errors`, `Directory Errors`, `MySQL Errors`) to the list of messages in that category. Categories with no message are omitted, so a clean install returns an empty map (`[]` in JSON) and `Passed: true`.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| Command     | String | Yes      | API command: `admin.system.check`    |
| AdminAPIKey | String | Yes      | Admin API key                        |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.system.check?AdminAPIKey=your-admin-api-key"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Passed": false,
  "Errors": {
    "PHP Errors": [
      "PHP IMAP extension is disabled. Please enable it."
    ],
    "MySQL Errors": [
      "MySQL runs in STRICT mode. Please disable STRICT option in sql_mode parameter in the MySQL configuration file."
    ]
  },
  "TotalErrors": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998
}
```

```txt [Error Codes]
0: Success
99998: Authentication failure
99999: Not enough privileges (sub-admin without the System privilege, when ADMIN_API_ENFORCE_PRIVILEGES is on)
```

:::

## Get System Information

<Badge type="info" text="GET" /> `/api/v1/admin.system.info`

<Badge type="tip" text="New in v5.9.6" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `System`)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the version and runtime facts the About section of the staff System screen shows (the admin About page before v6.0.2): the Octeth product version, the PHP version, the PHP ini values the page lists, and the MySQL server version. Nothing else is included: no filesystem paths, no environment values and no `phpinfo()` output (the About page's PHP settings dump and database export were removed in v6.0.2). For the configuration itself use `system.getsettings`.

`PHPSettings` reports an empty ini value as the string `"false"`, exactly as the About page renders it.

<Badge type="tip" text="New in v6.0.2" /> Pass `IncludeComponents` to add `Components`: the version of every runtime component, as a list of `Name`, `Role` and `Version`, always in this order: MySQL, ClickHouse, RabbitMQ, Redis, PHP for the app, API and workers, and PHP for the system backend and the send engine. Each lookup has a two-second timeout. A component that cannot be reached, or that answers with something that is not a version, keeps its row with `Version` set to `""`, and the command still succeeds. Without the parameter the response is unchanged.

**Request Body Parameters:**

| Parameter         | Type    | Required | Description                          |
|-------------------|---------|----------|--------------------------------------|
| Command           | String  | Yes      | API command: `admin.system.info`     |
| SessionID         | String  | No       | Admin session ID obtained from login |
| AdminAPIKey       | String  | No       | Admin API key                        |
| IncludeComponents | Boolean | No       | Adds the `Components` list. Possible values that turn it on: `true`, `1`, `yes`, `on` (case-insensitive). Any other value, or leaving it out, returns the response without `Components` |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.system.info?AdminAPIKey=your-admin-api-key&IncludeComponents=true"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ProductVersion": "6.0.2",
  "PHPVersion": "5.6.40",
  "PHPSettings": {
    "memory_limit": "512M",
    "max_execution_time": "0",
    "safe_mode": "false",
    "magic_quotes_gpc": "false",
    "register_globals": "false",
    "magic_quotes_runtime": "false"
  },
  "MySQLVersion": "8.0.41",
  "Components": [
    { "Name": "MySQL", "Role": "Database", "Version": "8.0.41" },
    { "Name": "ClickHouse", "Role": "Events and reports", "Version": "22.8.21.38" },
    { "Name": "RabbitMQ", "Role": "Message queue", "Version": "3.8.8" },
    { "Name": "Redis", "Role": "Cache and sessions", "Version": "6.0.8" },
    { "Name": "PHP", "Role": "App, API and workers", "Version": "5.6.40" },
    { "Name": "PHP", "Role": "System backend and send engine", "Version": "8.1.34" }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998
}
```

```txt [Error Codes]
0: Success
99998: Authentication failure
99999: Not enough privileges
```

:::

## Get the License State

<Badge type="info" text="GET" /> `/api/v1/admin.license.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `System`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy pages did)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the install's license state, as the License section of the staff System screen shows it: whether a valid license key is in effect and where it came from, the edition and the limits it sets, the facts of the license, the host a license key must name, and the state of a key pasted on the System screen. The license key and its token are never returned: `DisplayKey` is the masked short key.

`MaxUsers` and `MaxSubscribers` are `-1` for unlimited. `ReasonCode` is empty when `Status` is `valid`, otherwise one of `missing`, `short_key`, `malformed`, `unknown_kid`, `bad_signature`, `unsupported_version`, `wrong_product`, `domain_mismatch` or `verifier_unavailable`, and `ReasonText` is the localized sentence for it. The license facts (`Licensee`, `Plan`, `LicensedDomain`, `IssuedAt`, `ServiceExpiresAt`, `UpdatesUntil`) are empty strings when no valid license is in effect. `PastedKeyValid` is `null` when no key is pasted.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| Command     | String | Yes      | API command: `admin.license.get`     |
| SessionID   | String | No       | Admin session ID obtained from login |
| AdminAPIKey | String | No       | Admin API key                        |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.license.get?AdminAPIKey=your-admin-api-key"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "License": {
    "Status": "valid",
    "Source": "license",
    "TokenSource": "option",
    "ReasonCode": "",
    "ReasonText": "",
    "Edition": "standard",
    "MaxUsers": -1,
    "MaxSubscribers": 500000,
    "GraceDaysLeft": null,
    "DisplayKey": "****8KDS",
    "Licensee": "Example Inc.",
    "Plan": "unlimited",
    "LicensedDomain": "mail.example.com",
    "IssuedAt": "2026-10-10T17:27:01Z",
    "ServiceExpiresAt": "2027-10-10T00:00:00Z",
    "UpdatesUntil": "2027-10-10",
    "ExpectedHost": "mail.example.com",
    "PastedKeyStored": true,
    "PastedKeyValid": true,
    "PastedKeyReasonCode": "",
    "PastedKeyReasonText": ""
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
0: Success
99998: Authentication failure
99999: Not enough privileges
```

:::

## Save a License Key

<Badge type="info" text="POST" /> `/api/v1/admin.license.save`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `System`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy pages did)
- Rate limit: 10 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Verifies a license key against the host `APP_URL` names and, when it is valid, stores it. A stored key takes precedence over `LICENSE_KEY` in `.oempro_env` while it verifies, so this changes the edition and the limits of the whole install. The save pins the global webhook signing key first, then stores the key and reads it back from the database before reporting success.

The key is never returned, logged or echoed back, not even in an error. A refused key is logged with its reason code only. Refused in demo mode.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| Command     | String | Yes      | API command: `admin.license.save`    |
| SessionID   | String | No       | Admin session ID obtained from login |
| AdminAPIKey | String | No       | Admin API key                        |
| LicenseKey  | String | Yes      | The license key from your license page at my.octeth.com, with or without its `BEGIN` and `END` lines |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.license.save \
  -d "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "LicenseKey@license.txt"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Message": "The license key was verified and saved.",
  "License": {
    "Status": "valid",
    "Source": "license",
    "TokenSource": "option",
    "MaxUsers": -1,
    "MaxSubscribers": 500000,
    "PastedKeyStored": true,
    "PastedKeyValid": true
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "The license key was refused: the license key signature does not match its contents.",
  "ReasonCode": "bad_signature"
}
```

```txt [Error Codes]
0: Success
1: LicenseKey is missing or empty
2: The key was refused. ReasonCode names the reason (see Get the License State) and ErrorText is the localized message. Nothing is changed.
3: The key verified but could not be saved. Nothing is changed.
99998: Authentication failure
99999: Not enough privileges
429: Too many requests
```

:::

The success response's `License` is the full object of `admin.license.get`, read after the save. It is shortened above.

## Remove the Pasted License Key

<Badge type="info" text="POST" /> `/api/v1/admin.license.remove`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `System`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy pages did)
- Rate limit: 10 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Removes the license key pasted on the System screen (or saved with `admin.license.save`), so `LICENSE_KEY` in `.oempro_env` decides the edition and the limits again. The removal pins the global webhook signing key first and is confirmed in the database before it is reported. Removing when no key is stored succeeds and changes nothing. Refused in demo mode.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| Command     | String | Yes      | API command: `admin.license.remove`  |
| SessionID   | String | No       | Admin session ID obtained from login |
| AdminAPIKey | String | No       | Admin API key                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.license.remove \
  -d "AdminAPIKey=your-admin-api-key"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Message": "The pasted license key was removed. LICENSE_KEY in .oempro_env decides from now on.",
  "License": {
    "Status": "valid",
    "Source": "license",
    "TokenSource": "env",
    "PastedKeyStored": false,
    "PastedKeyValid": null
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "The pasted license key could not be removed. Try again."
}
```

```txt [Error Codes]
0: Success
1: The key could not be removed. The stored key stays in place.
99998: Authentication failure
99999: Not enough privileges
429: Too many requests
```

:::

## Run the System Health Check as an Administrator

<Badge type="info" text="GET" /> `/api/v1/admin.system.health`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `System`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy pages did)
- Rate limit: 10 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Runs the same checks as [`system.health.check`](#check-system-health) for an administrator, so the staff System screen can run them on the administrator's own session. `Checks` and `Timings` carry the same keys as `system.health.check`, and `Timings` ends with `Total`, in milliseconds. A check value is `OK`, a text starting with `WARNING:` for a finding that does not fail the check, or the failure text.

Unlike `system.health.check`, this command always answers HTTP 200 with the standard envelope: a failed check is reported in `Healthy` and `Checks`, not as HTTP 503. It writes no failure log. A run can take up to 30 seconds. `system.health.check` is unchanged, so monitors keep using it.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| Command     | String | Yes      | API command: `admin.system.health`   |
| SessionID   | String | No       | Admin session ID obtained from login |
| AdminAPIKey | String | No       | Admin API key                        |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.system.health?AdminAPIKey=your-admin-api-key"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Healthy": false,
  "Checks": {
    "MySQL": "OK",
    "ClickHouse": "OK",
    "RabbitMQ": "OK",
    "Redis": "Connection refused",
    "ListUnsubscribeOneClick": "WARNING: APP_URL is not https ...",
    "FilePermissions": "OK"
  },
  "Timings": {
    "MySQL": 1.92,
    "ClickHouse": 6.4,
    "RabbitMQ": 11.8,
    "Redis": 3001.2,
    "ListUnsubscribeOneClick": 0.31,
    "FilePermissions": 3.66,
    "Total": 3025.29
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
0: Success
99998: Authentication failure
99999: Not enough privileges
429: Too many requests
```

:::

## List Log Files

<Badge type="info" text="GET" /> `/api/v1/admin.logs.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Log Observer did)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Lists the log files of the install that changed within the last `Days` days, newest first: the regular files directly inside `data/logs` (Source `app`) and `system/storage/logs` (Source `system`). `Path` is the value the other log commands take as `File`. `Size` is in bytes and `Modified` is a Unix time. `Type` is the file name without its date and its `.log`, `.csv` or `.jsonl` extension.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.logs.get` |
| SessionID | String | No | Admin session ID obtained from login |
| AdminAPIKey | String | No | Admin API key for authentication |
| Days | Integer | No | How far back to look, 1 to 3650. Default `30`; any other value is `30` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'Command=admin.logs.get' \
  -d 'ResponseFormat=JSON' \
  -d 'AdminAPIKey=your-admin-api-key' \
  -d 'Days=7'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Days": 7,
  "Files": [
    {
      "Name": "errors-2026-10-18.log",
      "Path": "data/logs/errors-2026-10-18.log",
      "Source": "app",
      "SourceLabel": "Application Logs",
      "Type": "errors",
      "Size": 48213,
      "Modified": 1760792400
    },
    {
      "Name": "laravel.log",
      "Path": "system/storage/logs/laravel.log",
      "Source": "system",
      "SourceLabel": "System Logs",
      "Type": "laravel",
      "Size": 1873402,
      "Modified": 1760788800
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999,
  "ErrorText": "Not enough privileges"
}
```

```txt [Error Codes]
0: Success
99998: Authentication failure or expired session
99999: The administrator does not have the Settings privilege
429: Rate limit exceeded
```

:::

## Read the Last Lines of a Log File

<Badge type="info" text="GET" /> `/api/v1/admin.log.tail`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the last `Lines` lines of one log file. The file must be a regular file directly inside `data/logs` or `system/storage/logs`. A path outside them, a `../` path, a symlink that leads outside them, a directory or a missing file is refused with error `2`, and the refusal is logged with the administrator's ID.

At most 1 MB is read back from the end of the file. When that limit is reached before the requested number of lines, `Clipped` is `true` and the first line of `Content` is partial. Bytes that are not valid UTF-8 are replaced with U+FFFD.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.log.tail` |
| SessionID | String | No | Admin session ID obtained from login |
| AdminAPIKey | String | No | Admin API key for authentication |
| File | String | Yes | The `Path` of a file from `admin.logs.get`, for example `data/logs/errors-2026-10-18.log` |
| Lines | Integer | No | 1 to 1000. Default `100`; a larger value is `1000` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'Command=admin.log.tail' \
  -d 'ResponseFormat=JSON' \
  -d 'AdminAPIKey=your-admin-api-key' \
  -d 'File=data/logs/errors-2026-10-18.log' \
  -d 'Lines=500'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "File": "data/logs/errors-2026-10-18.log",
  "Name": "errors-2026-10-18.log",
  "Lines": 500,
  "Content": "[2026-10-18 13:58:02] octeth.INFO: Campaign 4127 queued for delivery\n[2026-10-18 14:01:33] octeth.INFO: Campaign 4127 completed",
  "Clipped": false,
  "Size": 48213,
  "Modified": 1760792400
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "This is not a log file that can be opened."
}
```

```txt [Error Codes]
0: Success
1: File is missing or empty
2: The path was refused: outside the log directories, not a regular file, or not found
3: The file could not be read
99999: The administrator does not have the Settings privilege
```

:::

## Read a Chunk of a Log File

<Badge type="info" text="GET" /> `/api/v1/admin.log.read`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off)
- Rate limit: 2000 requests per 60 seconds, so a large file can be downloaded chunk by chunk
- Legacy endpoint access via `/api.php` is also supported
:::

Returns up to 1 MB of one log file, base64-encoded, starting at `Offset`. To download a whole file, call it from offset `0` and add `Length` to the offset after each call until `EOF` is `true`. The path rules are those of `admin.log.tail`.

`Length` is the number of bytes in `Content` after decoding. `Size` is the size of the file when the chunk was read, and `EOF` is `true` when `Offset + Length` reached it. An offset at or past the end of the file returns an empty `Content` and `EOF` `true`. A log file can grow while you read it: stop at the `Size` of the first chunk for a consistent copy.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.log.read` |
| SessionID | String | No | Admin session ID obtained from login |
| AdminAPIKey | String | No | Admin API key for authentication |
| File | String | Yes | The `Path` of a file from `admin.logs.get` |
| Offset | Integer | No | The byte to start at. Default `0` |
| Length | Integer | No | The most bytes to return, 1 to 1048576. Default `1048576`; a larger value is `1048576` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'Command=admin.log.read' \
  -d 'ResponseFormat=JSON' \
  -d 'AdminAPIKey=your-admin-api-key' \
  -d 'File=system/storage/logs/laravel.log' \
  -d 'Offset=0'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "File": "system/storage/logs/laravel.log",
  "Name": "laravel.log",
  "Content": "WzIwMjYtMTAtMThdIGxvY2FsLklORk86IC4uLgo=",
  "Offset": 0,
  "Length": 28,
  "Size": 28,
  "EOF": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "offset and length must be whole numbers."
}
```

```txt [Error Codes]
0: Success
1: File is missing or empty
2: The path was refused: outside the log directories, not a regular file, or not found
3: The file could not be read
4: Offset or Length is not a whole number
99999: The administrator does not have the Settings privilege
```

:::

## Empty a Log File

<Badge type="info" text="POST" /> `/api/v1/admin.log.truncate`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session (privilege `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off)
- Rate limit: 10 requests per 300 seconds
- Refused in demo mode
- Legacy endpoint access via `/api.php` is also supported
:::

Empties one log file. The content cannot be recovered, so download the file first with `admin.log.read` if you may need it. The path rules are those of `admin.log.tail`. Every truncate is logged with the administrator's ID, the file and its size before.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.log.truncate` |
| SessionID | String | No | Admin session ID obtained from login |
| AdminAPIKey | String | No | Admin API key for authentication |
| File | String | Yes | The `Path` of a file from `admin.logs.get` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.log.truncate \
  -d 'AdminAPIKey=your-admin-api-key' \
  -d 'File=data/logs/errors-2026-10-18.log'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "File": "data/logs/errors-2026-10-18.log",
  "Name": "errors-2026-10-18.log",
  "SizeBefore": 48213
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": "NOT AVAILABLE IN DEMO MODE."
}
```

```txt [Error Codes]
0: Success
1: File is missing or empty
2: The path was refused: outside the log directories, not a regular file, or not found
3: The file could not be emptied
NOT AVAILABLE IN DEMO MODE.: Demo mode is on
99999: The administrator does not have the Settings privilege
```

:::

