---
layout: doc
---

# Google Postmaster Tools API Documentation

Admin endpoints for the Google Postmaster Tools integration: connection status, the OAuth consent flow, the collected domain and IP reputation metrics, anomaly detection, sender-domain discovery and the sender IP / CIDR list the collector polls. They back the admin "Google Postmaster Tools" screens and call the same classes.

All commands require the Admin API key (or an admin session) and the `Settings` sub-admin privilege.

::: warning No credential ever leaves the server
No command returns the Google access token, the refresh token or the OAuth client secret. `postmaster.status.get` reports flags, the token expiry time and the granted scope only. The consent URL returned by `postmaster.oauth.url.get` carries the OAuth client id, which Google displays in the browser address bar during consent; it is a public identifier, not a secret.
:::

::: tip Credentials gate
The commands that read Google-sourced data (`postmaster.oauth.url.get`, `postmaster.dashboard.get`, `postmaster.domain.metrics.get`, `postmaster.domain.anomalies.get`, `postmaster.ip.metrics.get`) answer `ErrorCode: 1` when `GOOGLE_POSTMASTER_CLIENT_ID`, `GOOGLE_POSTMASTER_CLIENT_SECRET` or `GOOGLE_POSTMASTER_REDIRECT_URI` is empty in `.oempro_env`. `postmaster.status.get`, `postmaster.domains.discover` and the `postmaster.ip*` commands work on local data and do not need the Google client.
:::

## Get Integration Status

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- `Connected` means a token row exists; `HasValidToken` means the access token has more than five minutes left. The collector refreshes an expired token with the stored refresh token automatically.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.status.get` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.status.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Status": {
    "CredentialsConfigured": true,
    "Connected": true,
    "HasValidToken": true,
    "TokenExpiresAt": "2026-09-04 19:12:40",
    "Scope": "https://www.googleapis.com/auth/postmaster.readonly",
    "ConnectedAt": "2026-08-01 10:03:11",
    "TokenUpdatedAt": "2026-09-04 18:12:40"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998,
  "ErrorText": "Authentication failure or session expired"
}
```

```txt [Error Codes]
99998: Authentication failure or session expired
99999: Not enough privileges (sub-admin without the Settings privilege, when ADMIN_API_ENFORCE_PRIVILEGES is on)
```

:::

## Get OAuth Consent URL

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Open `AuthorizationURL` in a browser. Google redirects to the frontend callback route configured as `GOOGLE_POSTMASTER_REDIRECT_URI` (`/google-postmaster-oauth/callback`), which exchanges the code and stores the tokens. The callback is not an API command.
- `State` is single-use and expires after `StateExpiresInSeconds` (600). Request a fresh URL if the consent flow is not completed in time.
- Each call is logged with the acting admin's id.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.oauth.url.get` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.oauth.url.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "AuthorizationURL": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=...&access_type=offline&prompt=consent&state=3f9c...",
  "State": "3f9c...",
  "StateExpiresInSeconds": 600
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Google Postmaster credentials are not configured (GOOGLE_POSTMASTER_CLIENT_ID, GOOGLE_POSTMASTER_CLIENT_SECRET, GOOGLE_POSTMASTER_REDIRECT_URI)"
}
```

```txt [Error Codes]
1: Google Postmaster credentials are not configured
2: OAuth state could not be stored (Redis unavailable), see the server log
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Disconnect Google Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Deletes the stored OAuth tokens. Collected metrics are kept. Succeeds even when nothing was connected (`WasConnected: false`).
- Not available in demo mode. Logged with the acting admin's id.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.oauth.disconnect` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.oauth.disconnect",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "WasConnected": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Failed to disconnect from Google Postmaster Tools, see the server log"
}
```

```txt [Error Codes]
1: The token row could not be deleted
NOT AVAILABLE IN DEMO MODE.: Demo mode is enabled
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Get Dashboard

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- The same data the admin dashboard renders: summary counters, every domain with collected metrics (latest values), the active sender IPs and the anomalies detected over the lookback window, sorted by severity (`critical`, `high`, `medium`) then date, most recent first.
- Rates are fractions from Google (0 to 1), not percentages.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.dashboard.get` |
| AdminAPIKey | String | Yes | Admin API key |
| AnomalyLookbackDays | Integer | No | Days of history the anomaly detector compares, 1 to 365 (default 30) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.dashboard.get",
    "AdminAPIKey": "your-admin-api-key",
    "AnomalyLookbackDays": 30
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Summary": {
    "TotalDomains": 3,
    "TotalMetrics": 1023,
    "TotalIPs": 2,
    "DomainsWithIssues": 0,
    "LatestCollection": "2026-09-04 03:10:22",
    "OAuthConnected": true,
    "HasValidToken": true
  },
  "Domains": [
    {
      "DomainName": "example.com",
      "LatestMetricDate": "2026-09-02",
      "DomainReputation": "HIGH",
      "SPFSuccessRate": 1,
      "DKIMSuccessRate": 0.998,
      "DMARCSuccessRate": 0.997,
      "SpamRate": 0.001,
      "InboxRate": null,
      "UserReportedSpamRate": 0.001
    }
  ],
  "SenderIPs": [
    {
      "IPID": 4,
      "IPAddress": "198.51.100.0/28",
      "IPType": "cidr",
      "CIDRFirstIP": "198.51.100.0",
      "CIDRLastIP": "198.51.100.15",
      "Description": "Outbound pool A",
      "CreatedAt": "2026-08-12 09:41:00",
      "Status": "Active"
    }
  ],
  "Anomalies": [
    {
      "Type": "spam_rate_spike",
      "Severity": "high",
      "Date": "2026-08-30",
      "PreviousDate": "2026-08-29",
      "Message": "Spam rate increased by 120% (from 0.05% to 0.11%)",
      "PreviousValue": "0.0005",
      "CurrentValue": "0.0011",
      "PercentIncrease": 120,
      "DomainName": "example.com"
    }
  ],
  "AnomalyLookbackDays": 30
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Google Postmaster credentials are not configured (GOOGLE_POSTMASTER_CLIENT_ID, GOOGLE_POSTMASTER_CLIENT_SECRET, GOOGLE_POSTMASTER_REDIRECT_URI)"
}
```

```txt [Error Codes]
1: Google Postmaster credentials are not configured
2: AnomalyLookbackDays must be an integer between 1 and 365
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Get Domain Metrics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Daily rows for one domain over an inclusive window of at most 365 days, the latest row on record for the domain (any date) and the IP reputation rows recorded for that domain in the window.
- `IncludeSendingActivity=true` adds `SendingActivity`, the day-by-day correlation of the metrics with Octeth's own campaign sends, bounces, complaints and unsubscribes (the "Sending Activity" panel of the domain detail screen).
- Dates are UTC calendar dates. Google delivers metrics with a two to three day lag.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.domain.metrics.get` |
| AdminAPIKey | String | Yes | Admin API key |
| Domain | String | Yes | Domain name, e.g. `example.com` |
| DateFrom | String | Yes | First day of the window, `Y-m-d` |
| DateTo | String | Yes | Last day of the window, `Y-m-d` (window at most 365 days) |
| IncludeSendingActivity | Boolean | No | Add the `SendingActivity` correlation series (default false) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.domain.metrics.get",
    "AdminAPIKey": "your-admin-api-key",
    "Domain": "example.com",
    "DateFrom": "2026-08-01",
    "DateTo": "2026-08-31"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": "example.com",
  "DateFrom": "2026-08-01",
  "DateTo": "2026-08-31",
  "Metrics": [
    {
      "MetricID": 8812,
      "DomainName": "example.com",
      "MetricDate": "2026-08-01",
      "DomainReputation": "HIGH",
      "SpamRate": 0.001,
      "InboxRate": null,
      "SPFSuccessRate": 1,
      "DKIMSuccessRate": 0.998,
      "DMARCSuccessRate": 0.997,
      "InboundEncryptionRate": 1,
      "UserReportedSpamRate": 0.001,
      "SampleSize": null,
      "CollectedAt": "2026-08-03 03:10:12"
    }
  ],
  "LatestMetric": {
    "MetricID": 9107,
    "DomainName": "example.com",
    "MetricDate": "2026-09-02",
    "DomainReputation": "HIGH",
    "SpamRate": 0.001,
    "InboxRate": null,
    "SPFSuccessRate": 1,
    "DKIMSuccessRate": 0.998,
    "DMARCSuccessRate": 0.997,
    "InboundEncryptionRate": 1,
    "UserReportedSpamRate": 0.001,
    "SampleSize": null,
    "CollectedAt": "2026-09-04 03:10:22"
  },
  "IPMetrics": [
    {
      "MetricID": 412,
      "IPID": 4,
      "DomainName": "example.com",
      "SpecificIPAddress": "198.51.100.3",
      "MetricDate": "2026-08-01",
      "IPReputation": "HIGH",
      "SampleSize": null,
      "CollectedAt": "2026-08-03 03:10:15",
      "ConfiguredIP": "198.51.100.0/28",
      "IPType": "cidr",
      "IPDescription": "Outbound pool A"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 7,
  "ErrorText": "The date window must not exceed 365 days"
}
```

```txt [Error Codes]
1: Google Postmaster credentials are not configured
2: Domain is missing
3: Domain is not a valid domain name
4: DateFrom is missing or not a valid Y-m-d date
5: DateTo is missing or not a valid Y-m-d date
6: DateFrom is after DateTo
7: The date window exceeds 365 days
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Get Domain Anomalies

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Day-over-day detector: reputation drops of more than one level (`reputation_drop`, critical), spam rate up more than 50% relative (`spam_rate_spike`, high), SPF / DKIM / DMARC success down more than 10 points (`spf_failure`, `dkim_failure`, `dmarc_failure`, medium). Needs at least two days of data in the window.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.domain.anomalies.get` |
| AdminAPIKey | String | Yes | Admin API key |
| Domain | String | Yes | Domain name |
| LookbackDays | Integer | No | Days of history to compare, 1 to 365 (default 30) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.domain.anomalies.get",
    "AdminAPIKey": "your-admin-api-key",
    "Domain": "example.com",
    "LookbackDays": 30
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": "example.com",
  "LookbackDays": 30,
  "Anomalies": [
    {
      "Type": "reputation_drop",
      "Severity": "critical",
      "Date": "2026-08-30",
      "PreviousDate": "2026-08-29",
      "Message": "Reputation dropped from HIGH to LOW",
      "PreviousValue": "HIGH",
      "CurrentValue": "LOW"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Domain is not a valid domain name"
}
```

```txt [Error Codes]
1: Google Postmaster credentials are not configured
2: Domain is missing
3: Domain is not a valid domain name
4: LookbackDays must be an integer between 1 and 365
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Discover Sending Domains

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- The candidate list for Postmaster monitoring, gathered from sender domains, email From addresses, delivery server domains and user group default sender domains, de-duplicated. Reads local tables only; the Google client is not required.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.domains.discover` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.domains.discover",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domains": ["example.com", "mail.example.org"],
  "TotalDomains": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998,
  "ErrorText": "Authentication failure or session expired"
}
```

```txt [Error Codes]
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## List Sender IPs

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Active rows only (soft-deleted rows are never listed). `TotalSenderIPs` is the full active count regardless of paging.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.ips.get` |
| AdminAPIKey | String | Yes | Admin API key |
| RecordsFrom | Integer | No | 0-based offset (default 0) |
| RecordsPerRequest | Integer | No | Page size; 0 returns every row (default 0) |
| OrderField | String | No | One of `IPID`, `IPAddress`, `IPType`, `Description`, `CreatedAt` (default `CreatedAt`) |
| OrderType | String | No | `ASC` or `DESC` (default `DESC`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.ips.get",
    "AdminAPIKey": "your-admin-api-key",
    "RecordsFrom": 0,
    "RecordsPerRequest": 25
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SenderIPs": [
    {
      "IPID": 4,
      "IPAddress": "198.51.100.0/28",
      "IPType": "cidr",
      "CIDRFirstIP": "198.51.100.0",
      "CIDRLastIP": "198.51.100.15",
      "Description": "Outbound pool A",
      "CreatedAt": "2026-08-12 09:41:00",
      "Status": "Active"
    },
    {
      "IPID": 3,
      "IPAddress": "203.0.113.25",
      "IPType": "single",
      "CIDRFirstIP": null,
      "CIDRLastIP": null,
      "Description": "Transactional relay",
      "CreatedAt": "2026-08-10 14:02:37",
      "Status": "Active"
    }
  ],
  "TotalSenderIPs": 2,
  "RecordsFrom": 0,
  "RecordsPerRequest": 25
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "OrderField must be one of IPID, IPAddress, IPType, Description, CreatedAt"
}
```

```txt [Error Codes]
1: RecordsFrom must be a non-negative integer
2: RecordsPerRequest must be a non-negative integer
3: OrderField is not in the allow-list
4: OrderType must be ASC or DESC
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Get IP Metrics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- `Metrics` holds one row per specific address, domain and day inside the window (a CIDR block yields rows for every address Google reported on). `Summary` groups all history of the configured IP by specific address, domain and reputation with the latest date and row count, as the IP detail screen shows.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.ip.metrics.get` |
| AdminAPIKey | String | Yes | Admin API key |
| IPID | Integer | Yes | Id of an active sender IP row (`postmaster.ips.get`) |
| DateFrom | String | Yes | First day of the window, `Y-m-d` |
| DateTo | String | Yes | Last day of the window, `Y-m-d` (window at most 365 days) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.ip.metrics.get",
    "AdminAPIKey": "your-admin-api-key",
    "IPID": 4,
    "DateFrom": "2026-08-01",
    "DateTo": "2026-08-31"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SenderIP": {
    "IPID": 4,
    "IPAddress": "198.51.100.0/28",
    "IPType": "cidr",
    "CIDRFirstIP": "198.51.100.0",
    "CIDRLastIP": "198.51.100.15",
    "Description": "Outbound pool A",
    "CreatedAt": "2026-08-12 09:41:00",
    "Status": "Active"
  },
  "DateFrom": "2026-08-01",
  "DateTo": "2026-08-31",
  "Metrics": [
    {
      "MetricID": 412,
      "IPID": 4,
      "DomainName": "example.com",
      "SpecificIPAddress": "198.51.100.3",
      "MetricDate": "2026-08-01",
      "IPReputation": "HIGH",
      "SampleSize": null,
      "CollectedAt": "2026-08-03 03:10:15",
      "ConfiguredIP": "198.51.100.0/28",
      "IPType": "cidr"
    }
  ],
  "Summary": [
    {
      "SpecificIPAddress": "198.51.100.3",
      "DomainName": "example.com",
      "IPReputation": "HIGH",
      "LatestDate": "2026-09-02",
      "MetricCount": 31
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "IP address not found"
}
```

```txt [Error Codes]
1: Google Postmaster credentials are not configured
2: IPID is missing or not a positive integer
3: No active sender IP with that IPID
4: DateFrom is missing or not a valid Y-m-d date
5: DateTo is missing or not a valid Y-m-d date
6: DateFrom is after DateTo
7: The date window exceeds 365 days
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Add Sender IP

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Accepts a single IPv4 or IPv6 address, or an IPv4 CIDR block (`a.b.c.d/0` to `/32`). A single address already inside an active CIDR block is refused: its reputation is collected under the block.
- The address is unique. Re-adding a soft-deleted address reactivates the same row (`Reactivated: true`, same `IPID`) with the new description.
- Not available in demo mode. Logged with the acting admin's id.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.ip.add` |
| AdminAPIKey | String | Yes | Admin API key |
| IPAddress | String | Yes | Single IP address or IPv4 CIDR block, as it should appear |
| Description | String | No | Admin note, up to 255 characters |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.ip.add",
    "AdminAPIKey": "your-admin-api-key",
    "IPAddress": "198.51.100.0/28",
    "Description": "Outbound pool A"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "IPID": 4,
  "Reactivated": false,
  "SenderIP": {
    "IPID": 4,
    "IPAddress": "198.51.100.0/28",
    "IPType": "cidr",
    "CIDRFirstIP": "198.51.100.0",
    "CIDRLastIP": "198.51.100.15",
    "Description": "Outbound pool A",
    "CreatedAt": "2026-09-04 18:40:12",
    "Status": "Active"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "IP address 198.51.100.9 is already covered by CIDR block 198.51.100.0/28. To view metrics for this IP, go to the CIDR block detail page."
}
```

```txt [Error Codes]
[1]: IPAddress is missing (array form, from the required-field validator)
2: Invalid CIDR notation (IPv4 only, prefix 0 to 32)
3: Invalid IP address format
4: The single address is already covered by an active CIDR block
5: This IP address is already configured and active
6: The row could not be written, see the server log
NOT AVAILABLE IN DEMO MODE.: Demo mode is enabled
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Delete Sender IP

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Privilege: `Settings`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Soft delete: the row is marked `Deleted` and its collected metrics are kept. Deleting a row that is not active answers `ErrorCode: 2`.
- Not available in demo mode. Logged with the acting admin's id.
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `postmaster.ip.delete` |
| AdminAPIKey | String | Yes | Admin API key |
| IPID | Integer | Yes | Id of an active sender IP row |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "postmaster.ip.delete",
    "AdminAPIKey": "your-admin-api-key",
    "IPID": 4
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "IPID": 4
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "IP address not found"
}
```

```txt [Error Codes]
[1]: IPID is missing (array form, from the required-field validator)
1: IPID is not a positive integer
2: No active sender IP with that IPID
3: The row could not be updated, see the server log
NOT AVAILABLE IN DEMO MODE.: Demo mode is enabled
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::
