---
layout: doc
---

# Email Gateway API Documentation

Email Gateway endpoints for managing transactional email sending through verified domains, including domain management, API keys, SMTP credentials, webhooks, and email delivery.

## Add a Sender Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.AddDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `emailgateway.adddomain` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| DomainName | String | Yes     | Domain name to add (e.g., example.com) |
| Subdomain | String | No       | Custom subdomain override (e.g., `outbound`). Only letters, numbers, and hyphens allowed (max 32 characters). |
| TrackPrefix | String | No     | Custom tracking prefix override (e.g., `links`). Only letters, numbers, and hyphens allowed (max 32 characters). |
| TrackMerge | String | No      | Custom tracking merge character (e.g., `-`). |
| TrackPrefixDisabled | Integer | No | Set to `1` to disable the separate tracking subdomain. When disabled, tracking URLs use the sender (MFROM) domain instead. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.adddomain",
    "SessionID": "your-session-id",
    "DomainName": "example.com",
    "Subdomain": "outbound",
    "TrackPrefix": "links"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewSenderDomainID": 123,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Approval Pending",
    "Options": {
      "LinkTracking": 1,
      "OpenTracking": 1,
      "UnsubscribeLink": 0,
      "CustomSubdomain": "outbound",
      "CustomTrackPrefix": "links"
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainName)
2: Invalid domain name format
3: Maximum sender domains limit reached for user
4: Invalid subdomain or track prefix value
```

:::

## Get Sender Domain Details

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getdomain` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| DomainID  | Integer | Yes      | Sender domain ID                      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getdomain",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Enabled",
    "Options": {
      "LinkTracking": 1,
      "OpenTracking": 1,
      "UnsubscribeLink": 0
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Update Sender Domain Settings

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                    |
|-----------|---------|----------|------------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.updatedomain`       |
| SessionID | String  | No       | Session ID obtained from login                 |
| APIKey    | String  | No       | API key for authentication                     |
| DomainID  | Integer | Yes      | Sender domain ID                               |
| LinkTracking | Integer | No    | Enable link tracking (1 = enabled, 0 = disabled) |
| OpenTracking | Integer | No    | Enable open tracking (1 = enabled, 0 = disabled) |
| UnsubscribeLink | Integer | No | Enable unsubscribe link (1 = enabled, 0 = disabled) |
| HostingProvider | String | No   | Hosting provider name                          |
| Subdomain | String | No        | Custom subdomain override (e.g., `outbound`). Only letters, numbers, and hyphens allowed (max 32 characters). Leave empty to reset to global default. |
| TrackPrefix | String | No      | Custom tracking prefix override (e.g., `links`). Only letters, numbers, and hyphens allowed (max 32 characters). Leave empty to reset to global default. |
| TrackMerge | String | No       | Custom tracking merge character (e.g., `-`). |
| TrackPrefixDisabled | Integer | No | Set to `1` to disable the separate tracking subdomain. When disabled, tracking URLs use the sender (MFROM) domain instead. Set to `0` to re-enable. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.updatedomain",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "LinkTracking": 1,
    "OpenTracking": 1,
    "Subdomain": "outbound",
    "TrackPrefixDisabled": 1
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Approval Pending",
    "Options": {
      "LinkTracking": 1,
      "OpenTracking": 1,
      "CustomSubdomain": "outbound",
      "TrackPrefixDisabled": true
    }
  },
  "SubdomainChanged": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
5: Domain not found or access denied
6: Invalid subdomain or track prefix value
```

:::

## Verify Sender Domain DNS Records

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                            |
|-----------|---------|----------|----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.verifydomain` |
| SessionID | String  | No       | Session ID obtained from login         |
| APIKey    | String  | No       | API key for authentication             |
| DomainID  | Integer | Yes      | Sender domain ID                       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.verifydomain",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": 123,
    "SenderDomain": "example.com",
    "Status": "Enabled"
  },
  "DNSVerificationResults": {
    "mail.example.com": ["CNAME", "target.example.com", true],
    "example.com": ["TXT", "v=spf1 include:example.com ~all", true]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Get All Sender Domains

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns every sender domain owned by the caller. By default the response shape is byte-for-byte identical to the pre-#1996 endpoint — useful for the legacy dashboard.

When `WithCounts=1` is supplied, each row is additionally enriched with **per-row API-key / SMTP / webhook counts** (one SQL aggregation) and **7-day Sent / BounceRate / LastActivityAt stats from ES** (one ES terms aggregation). This replaces the legacy 4×N pattern of calling `emailgateway.getapis` + `emailgateway.getsmtps` + `emailgateway.getwebhooks` + `emailgateway.domainstats` once per domain, which made the Overview unusable past ~20 domains.

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                                                                                                                                                                                                                          |
|------------|---------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Command    | String  | Yes      | API command: `emailgateway.getdomains`                                                                                                                                                                                                              |
| SessionID  | String  | No       | Session ID obtained from login                                                                                                                                                                                                                       |
| APIKey     | String  | No       | API key for authentication                                                                                                                                                                                                                            |
| WithCounts | Mixed   | No       | When truthy (`1`, `'1'`, `'true'`, `'yes'`, `true`), each domain row is enriched with `APIKeyCount`, `SMTPCount`, `WebhookCount`, `Sent7d`, `BounceRate7d`, `LastActivityAt`. Any other value (missing, `0`, `'false'`, garbage) → no enrichment, legacy shape preserved. |

**Enrichment field reference (only present when `WithCounts=1`):**

| Field            | Type           | Source | Definition                                                                            |
|------------------|----------------|--------|---------------------------------------------------------------------------------------|
| `APIKeyCount`    | Integer        | SQL    | Count of `oempro_eg_api_keys` rows for this domain with `Status='Enabled'`            |
| `SMTPCount`      | Integer        | SQL    | Count of `oempro_eg_smtp_credentials` rows for this domain with `Status='Enabled'`    |
| `WebhookCount`   | Integer        | SQL    | Count of `oempro_eg_webhooks` rows for this domain with `Status='Enabled'`            |
| `Sent7d`         | Integer        | ES     | Count of `accepted-by-oempro` events for this domain in the last 7 days               |
| `BounceRate7d`   | Float (2dp)    | computed | `Bounced / Sent × 100`. Returns `0` when `Sent7d` is 0 (no divide-by-zero NaN)      |
| `LastActivityAt` | String or null | ES     | `MAX(logged-at)` within the 7-day window as ISO 8601 UTC; `null` if no events         |

::: code-group

```bash [Example Request (without counts — legacy shape)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getdomains",
    "SessionID": "your-session-id"
  }'
```

```bash [Example Request (with overview counts)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getdomains",
    "SessionID": "your-session-id",
    "WithCounts": 1
  }'
```

```json [Success Response (without WithCounts — legacy shape)]
{
  "Success": true,
  "Domains": [
    {
      "DomainID": "123",
      "SenderDomain": "mail.apex.com",
      "CreatedAt": "2026-04-01 10:00:00",
      "Status": "Enabled",
      "VerificationMeta": {"DNSRecords": []},
      "PolicyMeta": [],
      "Options": {"LinkTracking": 1, "OpenTracking": 1, "UnsubscribeLink": 0}
    }
  ]
}
```

```json [Success Response (with WithCounts=1 — enriched)]
{
  "Success": true,
  "Domains": [
    {
      "DomainID": "123",
      "SenderDomain": "mail.apex.com",
      "CreatedAt": "2026-04-01 10:00:00",
      "Status": "Enabled",
      "VerificationMeta": {"DNSRecords": []},
      "PolicyMeta": [],
      "Options": {"LinkTracking": 1, "OpenTracking": 1, "UnsubscribeLink": 0},
      "APIKeyCount": 1,
      "SMTPCount": 2,
      "WebhookCount": 2,
      "Sent7d": 184320,
      "BounceRate7d": 1.00,
      "LastActivityAt": "2026-05-15T18:42:11Z"
    }
  ]
}
```

```txt [Error Codes]
0: Success
```

:::

## Delete a Sender Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                              |
|-----------|---------|----------|------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.deletedomain` |
| SessionID | String  | No       | Session ID obtained from login           |
| APIKey    | String  | No       | API key for authentication               |
| DomainID  | Integer | Yes      | Sender domain ID to delete               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deletedomain",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Clear Domain Email Queue

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                  |
|-----------|---------|----------|----------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.cleardomainqueue` |
| SessionID | String  | No       | Session ID obtained from login               |
| APIKey    | String  | No       | API key for authentication                   |
| DomainID  | Integer | Yes      | Sender domain ID                             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.cleardomainqueue",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Get Domain Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.domainstats` |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| DomainID  | Integer | Yes      | Sender domain ID                      |
| StartDate | String  | No       | Start date (Y-m-d format, default: 28 days ago) |
| EndDate   | String  | No       | End date (Y-m-d format, default: today) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.domainstats",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "StartDate": "2024-01-01",
    "EndDate": "2024-01-31"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Stats": {
    "Sent": 1000,
    "Delivered": 950,
    "Bounced": 50,
    "Opened": 400,
    "Clicked": 150
  },
  "ComparisonStats": {
    "PreviousPeriod": {
      "Sent": 800,
      "Delivered": 760
    }
  },
  "TagStats": {
    "campaign1": {
      "Sent": 500,
      "Delivered": 475
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Get Account-Wide Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns cross-domain aggregate statistics (Sent / Delivered / Bounced / Opened / Clicked + rates) for the caller's email gateway domains in a single call. Replaces the N+1 pattern of looping `emailgateway.domainstats` once per sender domain. Per-domain rows are ordered by `Sent` descending; domains with no events in the period are zero-filled. The `ComparisonTotals` window is the same length as the requested period, ending the second before `StartDate`.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                                                                            |
|-----------|--------|----------|------------------------------------------------------------------------------------------------------------------------|
| Command   | String | Yes      | API command: `emailgateway.accountstats`                                                                               |
| SessionID | String | No       | Session ID obtained from login                                                                                         |
| APIKey    | String | No       | API key for authentication                                                                                             |
| StartDate | String | No       | Start date (`Y-m-d` format, default: 30 days ago)                                                                      |
| EndDate   | String | No       | End date (`Y-m-d` format, default: today). Clamped to `>= StartDate`                                                   |
| DomainIDs | String | No       | Comma-separated list of sender domain IDs to scope the result to. IDs not owned by the caller are silently ignored. Omit to include all of the caller's gateway domains |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.accountstats",
    "SessionID": "your-session-id",
    "StartDate": "2024-01-01",
    "EndDate": "2024-01-31",
    "DomainIDs": "1,2,3"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "StartDate": "2024-01-01 00:00:00",
  "EndDate": "2024-01-31 23:59:59",
  "Totals": {
    "Sent": 232530,
    "Delivered": 226115,
    "Bounced": 1931,
    "Opened": 90636,
    "Clicked": 14261,
    "DeliveryRate": 97.24,
    "OpenRate": 38.99,
    "ClickRate": 6.14,
    "BounceRate": 0.83
  },
  "ComparisonTotals": {
    "Sent": 198400,
    "Delivered": 192100,
    "Bounced": 1820,
    "Opened": 74500,
    "Clicked": 11020,
    "DeliveryRate": 96.83,
    "OpenRate": 37.55,
    "ClickRate": 5.55,
    "BounceRate": 0.92
  },
  "PerDomain": [
    {
      "DomainID": 1,
      "SenderDomain": "mail.apex.com",
      "Sent": 184320,
      "Delivered": 178224,
      "Bounced": 1520,
      "Opened": 71890,
      "Clicked": 11420,
      "DeliveryRate": 96.69,
      "BounceRate": 0.82,
      "OpenRate": 39.0,
      "ClickRate": 6.19
    }
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
99998: Authentication failure or session expired
```

:::

## Create API Key for Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                          |
|-------------|---------|----------|--------------------------------------|
| Command     | String  | Yes      | API command: `emailgateway.addapi`   |
| SessionID   | String  | No       | Session ID obtained from login       |
| APIKey      | String  | No       | API key for authentication           |
| Description | String  | Yes      | Description for the API key          |
| DomainID    | Integer | Yes      | Sender domain ID                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.addapi",
    "SessionID": "your-session-id",
    "Description": "Production API Key",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewAPIKeyID": 456,
  "APIKey": {
    "APIKeyID": 456,
    "APIKey": "eg_live_xxxxxxxxxxxx",
    "Description": "Production API Key",
    "DomainID": 123
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (Description)
2: Missing required parameter (DomainID)
3: Domain not found or access denied
```

:::

## Get Domain API Keys

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                         |
|-----------|---------|----------|-------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getapis` |
| SessionID | String  | No       | Session ID obtained from login      |
| APIKey    | String  | No       | API key for authentication          |
| DomainID  | Integer | Yes      | Sender domain ID                    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getapis",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "APIKeys": [
    {
      "APIKeyID": 456,
      "APIKey": "eg_live_xxxxxxxxxxxx",
      "Description": "Production API Key",
      "DomainID": 123
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Delete Domain API Key

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                            |
|-----------|---------|----------|----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.deleteapi`  |
| SessionID | String  | No       | Session ID obtained from login         |
| APIKey    | String  | No       | API key for authentication             |
| APIKeyID  | Integer | Yes      | API Key ID to delete                   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deleteapi",
    "SessionID": "your-session-id",
    "APIKeyID": 456
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (APIKeyID)
2: API Key not found or access denied
```

:::

## Create SMTP Credentials for Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.addsmtp`  |
| SessionID | String  | No       | Session ID obtained from login       |
| APIKey    | String  | No       | API key for authentication           |
| DomainID  | Integer | Yes      | Sender domain ID                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.addsmtp",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewSMTPID": 789,
  "SMTP": {
    "SMTPID": 789,
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "generated_password",
    "SMTPHost": "smtp.example.com",
    "SMTPPorts": [25, 587, 2525]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Get Domain SMTP Credentials

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getsmtps`  |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| DomainID  | Integer | Yes      | Sender domain ID                      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getsmtps",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTPs": [
    {
      "SMTPID": 789,
      "SMTPUsername": "smtp_user_xxx",
      "SMTPHost": "smtp.example.com",
      "SMTPPorts": [25, 587, 2525]
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Delete SMTP Credentials

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                             |
|-----------|---------|----------|-----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.deletesmtp`  |
| SessionID | String  | No       | Session ID obtained from login          |
| APIKey    | String  | No       | API key for authentication              |
| SMTPID    | Integer | Yes      | SMTP credentials ID to delete           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deletesmtp",
    "SessionID": "your-session-id",
    "SMTPID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (SMTPID)
2: SMTP credentials not found or access denied
```

:::

## Reset SMTP Password

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                  |
|-----------|---------|----------|----------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.resetsmtppassword` |
| SessionID | String  | No       | Session ID obtained from login               |
| APIKey    | String  | No       | API key for authentication                   |
| SMTPID    | Integer | Yes      | SMTP credentials ID                          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.resetsmtppassword",
    "SessionID": "your-session-id",
    "SMTPID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTP": {
    "SMTPID": 789,
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "new_generated_password"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (SMTPID)
2: SMTP credentials not found or access denied
```

:::

## Create Webhook for Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                                    |
|------------|---------|----------|----------------------------------------------------------------|
| Command    | String  | Yes      | API command: `emailgateway.addwebhook`                         |
| SessionID  | String  | No       | Session ID obtained from login                                 |
| APIKey     | String  | No       | API key for authentication                                     |
| DomainID   | Integer | Yes      | Sender domain ID                                               |
| Event      | String  | Yes      | Event type: delivery, bounce, open, click, unsubscribe, complaint |
| WebhookURL | String  | Yes      | Webhook URL to receive event notifications                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.addwebhook",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "Event": "delivery",
    "WebhookURL": "https://example.com/webhooks/email-events"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewWebhookID": 999
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Missing required parameter (Event)
3: Invalid event type
4: Domain not found or access denied
5: Missing required parameter (WebhookURL)
```

:::

## Get Domain Webhooks

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                             |
|-----------|---------|----------|-----------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.getwebhooks` |
| SessionID | String  | No       | Session ID obtained from login          |
| APIKey    | String  | No       | API key for authentication              |
| DomainID  | Integer | Yes      | Sender domain ID                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getwebhooks",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SigningKey": "whsec_xxxxxxxxxxxx",
  "Webhooks": [
    {
      "WebhookID": 999,
      "Event": "delivery",
      "WebhookURL": "https://example.com/webhooks/email-events"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Delete Domain Webhook

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                |
|------------|---------|----------|--------------------------------------------|
| Command    | String  | Yes      | API command: `emailgateway.deletewebhook`  |
| SessionID  | String  | No       | Session ID obtained from login             |
| APIKey     | String  | No       | API key for authentication                 |
| WebhookID  | Integer | Yes      | Webhook ID to delete                       |
| DomainID   | Integer | Yes      | Sender domain ID                           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.deletewebhook",
    "SessionID": "your-session-id",
    "WebhookID": 999,
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (WebhookID)
2: Missing required parameter (DomainID)
3: Domain not found or access denied
4: Webhook not found or access denied
```

:::

## Create Webhook (Public API)

<Badge type="info" text="POST" /> `/api/v1/webhooks`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter     | Type   | Required | Description                                                    |
|---------------|--------|----------|----------------------------------------------------------------|
| SenderAPIKey  | String | Yes      | API key for the sender domain (Bearer token)                   |
| Event         | String | Yes      | Event type: delivered, bounced, opened, clicked, unsubscribed, complained |
| WebhookURL    | String | Yes      | Webhook URL to receive event notifications                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -d '{
    "Event": "delivered",
    "WebhookURL": "https://example.com/webhooks/email-events"
  }'
```

```json [Success Response]
{
  "NewWebhookID": 999
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 3, "Message": "Invalid Event value"}
  ]
}
```

```txt [Error Codes]
2: Event is missing
3: Invalid event type or invalid webhook URL
5: WebhookURL is missing
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Get Webhooks (Public API)

<Badge type="info" text="GET" /> `/api/v1/webhooks`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter    | Type   | Required | Description                                |
|--------------|--------|----------|--------------------------------------------|
| SenderAPIKey | String | Yes      | API key for the sender domain (Bearer token) |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/webhooks \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx"
```

```json [Success Response]
{
  "Webhooks": [
    {
      "WebhookID": 999,
      "Event": "delivered",
      "WebhookURL": "https://example.com/webhooks/email-events"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 13, "Message": "Invalid SenderAPIKey"}
  ]
}
```

```txt [Error Codes]
2: Invalid user account
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Delete Webhook (Public API)

<Badge type="info" text="DELETE" /> `/api/v1/webhooks`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                                |
|--------------|---------|----------|--------------------------------------------|
| SenderAPIKey | String  | Yes      | API key for the sender domain (Bearer token) |
| WebhookID    | Integer | Yes      | Webhook ID to delete                       |

::: code-group

```bash [Example Request]
curl -X DELETE https://example.com/api/v1/webhooks \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "WebhookID": 999
  }'
```

```json [Success Response]
{}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 4, "Message": "Invalid WebhookID"}
  ]
}
```

```txt [Error Codes]
1: WebhookID is missing
2: Invalid user account
4: Invalid WebhookID
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Get Email Events

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

::: info Cross-domain queries
`DomainID` is optional. When a `DomainID` is supplied, events are scoped to that single domain and ownership is verified against the authenticated user. When `DomainID` is omitted, the query spans every sender domain owned by the authenticated user. Tenant isolation is inherent: events are indexed per-user in Elasticsearch (`eg-events-u<UserID>-<date>`) and the query always filters by `user-id` regardless of whether a `DomainID` is provided.

Note that the public variant (`emailgateway.getevents.public`) still requires `DomainID` because it is authenticated by a domain-scoped API key.
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                              |
|---------------|---------|----------|----------------------------------------------------------|
| Command       | String  | Yes      | API command: `emailgateway.getevents`                    |
| SessionID     | String  | No       | Session ID obtained from login                           |
| APIKey        | String  | No       | API key for authentication                               |
| DomainID      | Integer | No       | Sender domain ID to scope the query to. Omit to return events across all of the authenticated user's sender domains. |
| StartFrom     | Integer | Yes      | Starting record index for pagination                     |
| RetrieveCount | Integer | Yes      | Number of records to retrieve (max 100)                  |
| StartDate     | String  | No       | Start date filter (Y-m-d format)                         |
| EndDate       | String  | No       | End date filter (Y-m-d format)                           |
| Event         | String  | No       | Filter by event type (delivery, bounce, open, click, etc.) |
| Query         | String  | No       | Search query string                                      |

::: code-group

```bash [Example Request — Single Domain]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getevents",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "StartFrom": 0,
    "RetrieveCount": 50,
    "Event": "delivery"
  }'
```

```bash [Example Request — All Domains]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.getevents",
    "SessionID": "your-session-id",
    "StartFrom": 0,
    "RetrieveCount": 50,
    "Event": "delivery"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 150,
  "Events": [
    {
      "event": "delivery",
      "timestamp": 1640000000,
      "message": {
        "headers": {
          "from": "sender@example.com",
          "to": "recipient@example.com",
          "subject": "Test Email"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
2: Domain not found or access denied (only when DomainID is supplied)
4: Missing required parameter (StartFrom)
5: Missing required parameter (RetrieveCount)
```

:::

## Get Email Events (Public API)

<Badge type="info" text="GET" /> `/api/v1/events`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                              |
|---------------|---------|----------|----------------------------------------------------------|
| SenderAPIKey  | String  | Yes      | API key for the sender domain (Bearer token)             |
| StartFrom     | Integer | No       | Starting record index for pagination (default: 0)        |
| RetrieveCount | Integer | No       | Number of records to retrieve (default: 5, max 100)      |
| StartDate     | Integer | No       | Start date filter (Unix timestamp)                       |
| EndDate       | Integer | No       | End date filter (Unix timestamp)                         |
| Event         | String  | No       | Filter by event type                                     |
| MessageID     | String  | No       | Filter by message ID                                     |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/events \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -d '{
    "StartFrom": 0,
    "RetrieveCount": 50,
    "Event": "delivery"
  }'
```

```json [Success Response]
{
  "TotalRecords": 150,
  "Events": [
    {
      "Event": "delivery",
      "LoggedAt": 1640000000,
      "Message": {
        "Headers": {
          "From": "sender@example.com",
          "To": "recipient@example.com",
          "Subject": "Test Email"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 13, "Message": "Invalid SenderAPIKey"}
  ]
}
```

```txt [Error Codes]
1: Missing SenderAPIKey
2: Invalid sender domain
4: Missing StartFrom
5: Missing RetrieveCount
13: Invalid SenderAPIKey
429: Too many requests
```

:::

## Get Aggregated Event Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                  |
|------------------|---------|----------|----------------------------------------------|
| Command          | String  | Yes      | API command: `emailgateway.aggrevents`       |
| SessionID        | String  | No       | Session ID obtained from login               |
| APIKey           | String  | No       | API key for authentication                   |
| DomainID         | Integer | Yes      | Sender domain ID                             |
| StartDate        | String  | No       | Start date filter (Y-m-d format)             |
| EndDate          | String  | No       | End date filter (Y-m-d format)               |
| AggregatedField  | String  | No       | Field to aggregate by                        |
| AggregateSize    | Integer | No       | Number of aggregation buckets                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.aggrevents",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "StartDate": "2024-01-01",
    "EndDate": "2024-01-31"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "AggBuckets": [
    {
      "key": "delivery",
      "doc_count": 1000
    },
    {
      "key": "bounce",
      "doc_count": 50
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or access denied
```

:::

## Send Email via API

<Badge type="info" text="POST" /> `/api/v1/email`

::: tip API Usage Notes
- Authentication required: Bearer token
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                                |
|---------------|---------|----------|------------------------------------------------------------|
| SenderAPIKey  | String  | Yes      | API key for the sender domain (Bearer token)               |
| Subject       | String  | Yes      | Email subject line                                         |
| ContentType   | String  | Yes      | Content type: html or plain                                |
| HTMLContent   | String  | Conditional | HTML email content (required if ContentType is html)    |
| PlainContent  | String  | Conditional | Plain text email content (required if ContentType is plain) |
| From          | Object  | Yes      | Sender information: {name, email}                          |
| To            | Array   | Conditional | Array of recipients: [{name, email}] (required unless TargetListID is set) |
| CC            | Array   | No       | Array of CC recipients: [{name, email}]                    |
| BCC           | Array   | No       | Array of BCC recipients: [{name, email}]                   |
| ReplyTo       | Array   | No       | Array of reply-to addresses: [{name, email}]               |
| Tags          | Array   | No       | Array of custom tags for tracking                          |
| Headers       | Object  | No       | Custom email headers as key-value pairs                    |
| TrackLinks    | String  | No       | Enable link tracking: true or false                        |
| TrackOpens    | String  | No       | Enable open tracking: true or false                        |
| SendAt        | Integer | No       | Schedule send time (Unix timestamp)                        |
| Attachments   | Array   | No       | Array of attachments: [{filename, content, type, disposition, contentid}] |
| TemplateID    | Integer | No       | Email template ID to use                                   |
| TargetListID  | Integer | No       | Send to all subscribers in a list                          |
| ListID        | Integer | No       | List ID for subscriber context                             |
| SubscriberID  | Integer | No       | Subscriber ID for personalization                          |
| JourneyID     | Integer | No       | Journey ID for tracking                                    |
| ActionID      | Integer | No       | Journey action ID for tracking                             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eg_live_xxxxxxxxxxxx" \
  -d '{
    "Subject": "Welcome to Our Service",
    "ContentType": "html",
    "HTMLContent": "<h1>Welcome!</h1><p>Thank you for signing up.</p>",
    "From": {
      "name": "John Doe",
      "email": "john@example.com"
    },
    "To": [
      {
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    ]
  }'
```

```json [Success Response]
{
  "MessageID": "550e8400-e29b-41d4-a716-446655440000"
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 8, "Message": "Missing Subject"}
  ]
}
```

```txt [Error Codes]
1: Missing SenderAPIKey
2: Invalid DomainID or invalid user account
3: From parameter is missing or invalid
8: Missing Subject or To email address
9: Missing ContentType
10: Missing HTMLContent
11: Missing PlainContent
12: Invalid or deactivated user account
13: Invalid SenderAPIKey
14: Email address is in the suppression list
15: Invalid TemplateID
16: Invalid TargetListID
17: Email sending limit reached
18: Recipient name or email address is missing
19: Recipient email address is invalid
20: There is no recipient set or count exceeds limit
21-22: CC email validation errors
23: Invalid from email address format
24-26: BCC email validation errors
27: BCC count exceeds limit
28-30: Reply-To email validation errors
31: Reply-To count exceeds limit
32: Domain is not activated
34: User account is not verified
35: Invalid ListID
36: Invalid SubscriberID
37: Invalid JourneyID
38: Invalid ActionID
429: Email send rate limit exceeded
```

:::

## Send Email via SMTP Relay

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- This is an internal endpoint used by the SMTP relay server
:::

**Request Body Parameters:**

| Parameter     | Type   | Required | Description                                |
|---------------|--------|----------|--------------------------------------------|
| Command       | String | Yes      | API command: `emailgateway.smtprelay`      |
| AdminAPIKey   | String | Yes      | Admin API key for authentication           |
| SMTPUsername  | String | Yes      | SMTP username for authentication           |
| SMTPPassword  | String | Yes      | SMTP password for authentication           |
| UUID          | String | No       | Unique message identifier                  |
| MailFrom      | String | No       | MAIL FROM envelope address                 |
| RcptTo        | String | No       | RCPT TO envelope addresses (comma-separated) |
| Subject       | String | No       | Email subject line                         |
| RawEmail      | String | No       | Raw email content (RFC 822 format)         |

::: code-group

```bash [Example Request - Auth Only]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.smtprelay",
    "AdminAPIKey": "your-admin-key",
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "smtp_password"
  }'
```

```bash [Example Request - Send Email]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.smtprelay",
    "AdminAPIKey": "your-admin-key",
    "SMTPUsername": "smtp_user_xxx",
    "SMTPPassword": "smtp_password",
    "UUID": "550e8400-e29b-41d4-a716-446655440000",
    "MailFrom": "sender@example.com",
    "RcptTo": "recipient@example.com",
    "Subject": "Test Email",
    "RawEmail": "From: sender@example.com..."
  }'
```

```json [Success Response - Auth]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTPUsername": "smtp_user_xxx",
  "SMTPPassword": "smtp_password"
}
```

```json [Success Response - Send]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTPResponse": "250 2.0.0 Ok: queued",
  "SMTPUsername": "smtp_user_xxx",
  "SMTPPassword": "smtp_password"
}
```

```json [Error Response]
{
  "Success": false,
  "SMTPResponse": "500 5.0.0 AUTH ERROR",
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing SMTPUsername
2: Missing SMTPPassword
3: Invalid SMTP credentials
4: Invalid sender domain
5: Sender domain is not active
6: Invalid user account
7: User is not trusted or not enabled
8: Recipient email address is suppressed
```

:::

## Get All Sender Domains for PowerMTA Configuration

<Badge type="info" text="POST" /> `/api/v1/sender.domains`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                                 |
|-----------|--------|----------|-----------------------------------------------------------------------------|
| Command   | String | No       | API command: `sender.domains` (only required for legacy endpoint)           |
| AdminAPIKey | String | No     | Admin API key for authentication (only required for legacy endpoint)        |
| DomainsResponseFormat | String | No | Response format: json, powermta-bounce-domains, powermta-relay-domains (default: json) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/sender.domains \
  -H "Content-Type: application/json" \
  -d '{
    "DomainsResponseFormat": "json"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Domains": [
    "example.com",
    "another.com",
    "third.com"
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Invalid DomainsResponseFormat"
}
```

```txt [Error Codes]
0: Success
1: Invalid DomainsResponseFormat (must be json, powermta-bounce-domains, or powermta-relay-domains)
```

:::

## Check Inbound Relay Domain Authorization

<Badge type="info" text="GET" /> `/api/v1/inbound-relay-domain-check`

::: tip API Usage Notes
- Authentication required: Bearer token (Admin API Key)
- This endpoint is designed for MX server integration to validate relay domains
- Returns HTTP status codes to indicate relay authorization
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                    |
|-----------|--------|----------|----------------------------------------------------------------|
| Domain    | String | Yes      | Domain name to check for relay authorization (can be full email address) |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/inbound-relay-domain-check?domain=example.com" \
  -H "Authorization: Bearer your-admin-api-key"
```

```json [Success Response - Relay Allowed]
{
  "Success": true,
  "RelayDomain": "example.com"
}
```

```json [Error Response - Auth Failed]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Authentication failed. Invalid admin API key."
    }
  ]
}
```

```json [Error Response - Relay Denied]
{}
```

```txt [HTTP Status Codes]
200: Relay allowed - domain is authorized for relay
403: Temporary error - authentication failed
500: Relay access denied - domain is not authorized
```

```txt [Error Codes]
1: Authentication failed - Invalid admin API key
```

:::

## Get Recipient Domain Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                              |
|------------------|---------|----------|----------------------------------------------------------|
| Command          | String  | Yes      | API command: `emailgateway.recipientdomainstats`         |
| SessionID        | String  | No       | Session ID obtained from login                           |
| APIKey           | String  | No       | API key for authentication                               |
| DomainID         | Integer | Yes      | Sender domain ID (used to verify user ownership)         |
| RecipientToDomain | String | Yes      | Recipient domain to filter by (e.g., `gmail.com`)        |
| StartDate        | String  | No       | Start date (Y-m-d format, default: 28 days ago)         |
| EndDate          | String  | No       | End date (Y-m-d format, default: today)                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.recipientdomainstats",
    "SessionID": "your-session-id",
    "DomainID": 123,
    "RecipientToDomain": "gmail.com",
    "StartDate": "2026-01-01",
    "EndDate": "2026-02-11"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SummaryStats": [
    {
      "Status": "Sent",
      "TotalEmails": 1523,
      "AvgDeliverySeconds": 4.32,
      "MinDeliverySeconds": 0,
      "MaxDeliverySeconds": 187
    },
    {
      "Status": "Failed",
      "TotalEmails": 42,
      "AvgDeliverySeconds": 12.58,
      "MinDeliverySeconds": 1,
      "MaxDeliverySeconds": 95
    }
  ],
  "DeliverySpeedHistogram": {
    "Sent": [
      { "DeliveryBucket": "< 1s", "EmailCount": 312, "Percentage": 20.49 },
      { "DeliveryBucket": "1-5s", "EmailCount": 845, "Percentage": 55.48 },
      { "DeliveryBucket": "5-10s", "EmailCount": 200, "Percentage": 13.13 },
      { "DeliveryBucket": "10-30s", "EmailCount": 100, "Percentage": 6.57 },
      { "DeliveryBucket": "30-60s", "EmailCount": 40, "Percentage": 2.63 },
      { "DeliveryBucket": "1-5m", "EmailCount": 20, "Percentage": 1.31 },
      { "DeliveryBucket": "5-10m", "EmailCount": 4, "Percentage": 0.26 },
      { "DeliveryBucket": "> 10m", "EmailCount": 2, "Percentage": 0.13 }
    ],
    "Failed": [
      { "DeliveryBucket": "1-5s", "EmailCount": 30, "Percentage": 71.43 },
      { "DeliveryBucket": "5-10s", "EmailCount": 12, "Percentage": 28.57 }
    ]
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID or RecipientToDomain)
2: Domain not found or access denied
```

:::

## Export Events as CSV

<Badge type="info" text="GET" /> `/api.php` &nbsp; <Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Response is `text/csv; charset=utf-8` (streamed), not JSON. The dispatcher's JSON wrapping is bypassed.
:::

Streams the email-gateway event log as CSV. Accepts the same filters as [`emailgateway.getevents`](#get-email-gateway-events) but bypasses the 100-row browse cap (hard cap at 10,000 rows). Designed to be embedded directly in a browser download link — when the user clicks "Export CSV", the browser streams the file to disk.

Data is fetched from Elasticsearch in chunks of 1,000 rows; each chunk is flushed to the client immediately, so the loop is cancelable mid-download (closing the browser tab terminates the export before the next ES round-trip).

**Response headers:**

- `Content-Type: text/csv; charset=utf-8`
- `Content-Disposition: attachment; filename="transactional-events-YYYY-MM-DD.csv"`
- `X-Octeth-Export-Total: <int>` — total matching events reported by ES.
- `X-Octeth-Export-Truncated: 1` — present only when `Total > 10000`; the CSV body contains the first 10,000 rows.
- `X-Octeth-Export-Limit: 10000` — present only when truncated.

**CSV columns:** `Time` (ISO 8601 UTC), `Event`, `MessageID`, `From`, `To`, `Subject`, `Domain`, `SMTPCode`. The file begins with a UTF-8 BOM so Excel opens it with the correct encoding. Address-like cells starting with `=`, `+`, `-`, `@`, tab, or carriage return are prefixed with a single quote to neutralize spreadsheet formula injection.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                                                                            |
|-----------|---------|----------|----------------------------------------------------------------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.exportevents`                                                                                               |
| SessionID | String  | No       | Session ID obtained from login                                                                                                         |
| APIKey    | String  | No       | API key for authentication                                                                                                             |
| DomainID  | Integer | No       | Scope to a single sender domain. Omit (or pass `0`) to export across all of the caller's gateway domains                               |
| Event     | String  | No       | Filter by event type. Possible values: same as [`emailgateway.getevents`](#get-email-gateway-events) — `accepted`, `rejected`, `delivered`, `bounced`, `opened`, `clicked`, `unsubscribed`, `complained`, `accepted-by-oempro`, `accepted-by-mta`, `rejected-by-oempro`, `rejected-by-mta` |
| MessageID | String  | No       | Filter by message-id (takes precedence over `Query` when both are supplied)                                                            |
| Query     | String  | No       | Free-text search across message metadata (subject, from, to, IP, MX host, SMTP response, etc.). Ignored when `MessageID` is supplied   |
| StartDate | String  | No       | Start date (`Y-m-d` strict). Defaults to 30 days ago. Invalid formats fall back to the default                                         |
| EndDate   | String  | No       | End date (`Y-m-d` strict). Defaults to today. Clamped to `>= StartDate`                                                                |

::: code-group

```bash [Example Request]
# Browser-friendly GET — drop this into an <a href> or window.location:
curl -OJ -G https://example.com/api.php \
  --data-urlencode 'Command=emailgateway.exportevents' \
  --data-urlencode 'SessionID=your-session-id' \
  --data-urlencode 'DomainID=123' \
  --data-urlencode 'Event=bounced' \
  --data-urlencode 'StartDate=2026-01-01' \
  --data-urlencode 'EndDate=2026-01-31'
```

```text [Success Response (CSV body)]
Time,Event,MessageID,From,To,Subject,Domain,SMTPCode
2026-01-31T18:42:11Z,bounced,bb1a701c-dcf0-4948-81eb-62726da0d67d,sender@apex.com,"Recipient <recipient@example.com>","Welcome to Apex",example.com,550
2026-01-31T18:41:55Z,bounced,162a101e-0c78-491a-9403-94dad8a3e1ca,sender@apex.com,"recipient2@example.org",,example.org,553
...
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success (CSV streamed)
2: DomainID supplied but not owned by the caller
```

:::

## Regenerate the Webhook Signing Key for a Domain

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `EmailGateway.ManageDomain`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Generates a fresh per-domain HMAC-SHA256 signing key, stores it atomically against the domain row, and returns it once. Subsequent calls to [`emailgateway.getwebhooks`](#get-domain-webhooks) for the same domain return the new key, and outgoing webhook payloads from that domain are signed with it.

**Backwards compatibility:** until you call this endpoint for a given domain, that domain continues to sign and verify webhooks with the legacy installation-wide secret (`md5(OEMPRO_PASSWORD_SALT . LICENSE_KEY)`, formatted as `XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`). Existing integrations that haven't rotated are entirely unaffected by the rollout of this endpoint. Once you rotate a domain, the consumer of *that* domain's webhooks must update its verification key — every other domain's consumer keeps working unchanged.

The new key format is a 64-character uppercase hex string (256 bits of entropy from `random_bytes(32)`). It's shown once in the response and stored in the `SigningKey` column of the sender-domain row. There's no way to retrieve it later other than via `getwebhooks` for the same domain.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                            |
|-----------|---------|----------|--------------------------------------------------------|
| Command   | String  | Yes      | API command: `emailgateway.regeneratesigningkey`       |
| SessionID | String  | No       | Session ID obtained from login                         |
| APIKey    | String  | No       | API key for authentication                             |
| DomainID  | Integer | Yes      | The sender domain to rotate. Must be owned by the caller |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "emailgateway.regeneratesigningkey",
    "SessionID": "your-session-id",
    "DomainID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SigningKey": "7F94D1EF4F798E4E1F306F06DC3DF317424D60C91B2C4DC7F11D13A8D1B1C5FC"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (DomainID)
2: Domain not found or not owned by the caller
3: Rotation failed — the UPDATE matched zero rows (typically because the domain was deleted between the ownership check and the rotation). No key was persisted; safe to retry.
```

:::
