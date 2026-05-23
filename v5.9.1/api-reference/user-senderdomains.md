---
layout: doc
---

# User Sender Domain API Documentation

User-area sender domain management endpoints for creating, listing, retrieving, updating, deleting, verifying, and inspecting the DNS records of from-address domains owned by the authenticated user.

These are the user-owned, list-bound sender domains visible at `/app/user/senderdomains/`, with per-domain DNS records (CNAME / A / MX / TXT) for SPF/DMARC, an MFROM/return-path subdomain, an optional tracking subdomain, and a verification flow that performs live DNS lookups. They are distinct from the email-gateway delivery domains managed via the `emailgateway.*domain*` endpoints, and from the admin-only `sender.domains` endpoint, which returns a flat cross-tenant dump used for PowerMTA provisioning.

## List User Sender Domains

<Badge type="info" text="GET" /> `/api/v1/user.senderdomains`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns only user-owned, addressable sender domains. The synthetic group-default sender domain (`DomainID=0`) that the model normally prepends is intentionally excluded — every entry in the response has a real `DomainID` and is valid for `Get` / `Update` / `Delete` / `Verify` / `DNS`.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| Command   | String | Yes      | API command: `user.senderdomain.list` |
| SessionID | String | No       | Session ID obtained from login       |
| APIKey    | String | No       | API key for authentication           |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.senderdomains?APIKey=your-api-key"
```

```json [Success Response]
{
  "Success": true,
  "SenderDomains": [
    {
      "DomainID": "12",
      "SenderDomain": "example.com",
      "UserID": "1",
      "CreatedAt": "2026-04-25 22:54:00",
      "Status": "Enabled",
      "LastVerifiedAt": "2026-05-23 09:11:00",
      "VerificationMeta": {
        "DNSRecords": {
          "sl.example.com": ["CNAME", "tracking-host.octeth.example.", true]
        }
      },
      "PolicyMeta": [],
      "Options": {
        "LinkTracking": 1,
        "OpenTracking": 1,
        "UnsubscribeLink": 0,
        "CustomSubdomain": "sl",
        "CustomTrackPrefix": "track",
        "TrackPrefixDisabled": false
      },
      "Volume7d": 184320,
      "VolumeDelta": "+12%",
      "Reputation": 96,
      "ReputationBucket": "excellent",
      "DeliveryRate": 99.4,
      "BounceRate": 0.5
    }
  ]
}
```

**Operational fields (issue #1889).** The following fields are derived from `oempro_sender_domain_stats` / `oempro_eg_domain_stats` and are populated on every `List` and `Get` response:

| Field            | Type             | Description |
|------------------|------------------|-------------|
| `LastVerifiedAt` | datetime / null  | Updated on every `user.senderdomain.verify` call (regardless of pass/fail). `null` when the domain has never been verified. |
| `Volume7d`       | integer          | Total attributable sends in the last 7 days. |
| `VolumeDelta`    | string / null    | Trailing-7-day volume change vs the prior 7-day window — for example `"+12%"`, `"-3%"`, `"new"` (no prior-window data), or `null` (no current-window volume). |
| `Reputation`     | integer / null   | 0–100 score over the last 30 days. `null` when there's no send volume to score. |
| `ReputationBucket` | string / null  | One of `excellent` (≥90), `good` (≥70), `fair` (≥50), `poor`. `null` when `Reputation` is `null`. |
| `DeliveryRate`   | float / null     | Last-30-day delivery percentage. Falls back to `(Sent − Bounced − Complaints) / Sent` when explicit `Delivered` events aren't recorded for the period (non-PMTA installs). |
| `BounceRate`     | float / null     | Last-30-day bounce percentage. |

```json [Error Response]
{
  "Errors": [
    {
      "Code": 0,
      "Message": "Authentication failed"
    }
  ]
}
```

```txt [Error Codes]
(none — this endpoint has no business-logic error codes; an empty result returns SenderDomains: [])
```

:::

## Get a Sender Domain

<Badge type="info" text="GET" /> `/api/v1/user.senderdomain`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                            |
|-----------|---------|----------|------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `user.senderdomain.get`                                   |
| SessionID | String  | No       | Session ID obtained from login                                         |
| APIKey    | String  | No       | API key for authentication                                             |
| DomainID  | Integer | Yes      | The ID of the sender domain to retrieve. Must be owned by the calling user |
| days      | Integer | No       | When present, the response also includes a `Stats` map keyed by `Y-m-d` covering the last N days of per-domain activity. Clamped to `1..365` (default `30`). Mirrors `user.webhook.stats`. |

The same operational fields documented under [List User Sender Domains](#list-user-sender-domains) (`LastVerifiedAt`, `Volume7d`, `VolumeDelta`, `Reputation`, `ReputationBucket`, `DeliveryRate`, `BounceRate`) are returned on every `Get` response regardless of whether `days` is supplied.

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.senderdomain?APIKey=your-api-key&DomainID=12"
```

```bash [With Daily Stats]
curl -X GET "https://example.com/api/v1/user.senderdomain?APIKey=your-api-key&DomainID=12&days=30"
```

```json [Success Response]
{
  "Success": true,
  "SenderDomain": {
    "DomainID": "12",
    "SenderDomain": "example.com",
    "UserID": "1",
    "CreatedAt": "2026-04-25 22:54:00",
    "Status": "Enabled",
    "LastVerifiedAt": "2026-05-23 09:11:00",
    "VerificationMeta": {
      "DNSRecords": {
        "sl.example.com": ["CNAME", "tracking-host.octeth.example.", true]
      }
    },
    "PolicyMeta": [],
    "Options": {
      "LinkTracking": 1,
      "OpenTracking": 1,
      "UnsubscribeLink": 0,
      "CustomSubdomain": "sl",
      "CustomTrackPrefix": "track",
      "TrackPrefixDisabled": false
    },
    "Volume7d": 184320,
    "VolumeDelta": "+12%",
    "Reputation": 96,
    "ReputationBucket": "excellent",
    "DeliveryRate": 99.4,
    "BounceRate": 0.5
  }
}
```

```json [With Daily Stats]
{
  "Success": true,
  "SenderDomain": { /* same shape as above */ },
  "Days": 30,
  "Stats": {
    "2026-05-23": { "Period": "2026-05-23", "Sent": 12000, "Delivered": 11940, "Bounced": 60, "Complaints": 0 },
    "2026-05-22": { "Period": "2026-05-22", "Sent": 11820, "Delivered": 11760, "Bounced": 58, "Complaints": 2 }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Sender domain not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing DomainID parameter
2: Sender domain not found (also returned when the domain exists but is owned by another user — to avoid leaking ownership)
```

Days with no recorded activity are omitted from `Stats` rather than zero-filled — callers that need a full window should pad client-side.

:::

## Create a Sender Domain

<Badge type="info" text="POST" /> `/api/v1/user.senderdomain`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The new domain starts in `Status='Approval Pending'`. The response includes the auto-generated `VerificationMeta.DNSRecords` array — these are the CNAME / A / MX / TXT records the user must add to their DNS zone before the domain can be verified.

If a `(SenderDomain, UserID)` pair already exists (e.g. it was previously soft-deleted), the model uses `ON DUPLICATE KEY UPDATE` to refresh the row's Status to `Approval Pending` rather than failing.

**Request Body Parameters:**

| Parameter         | Type    | Required | Description                                                                                                  |
|-------------------|---------|----------|--------------------------------------------------------------------------------------------------------------|
| Command           | String  | Yes      | API command: `user.senderdomain.create`                                                                      |
| SessionID         | String  | No       | Session ID obtained from login                                                                               |
| APIKey            | String  | No       | API key for authentication                                                                                   |
| SenderDomain      | String  | Yes      | The domain name to register (e.g. `example.com`). Cannot be `localhost`                                      |
| LinkTracking      | Boolean | No       | Whether to enable click tracking on links sent from this domain. Default: `true`                            |
| OpenTracking      | Boolean | No       | Whether to enable open tracking. Default: `true`                                                             |
| UnsubscribeLink   | Boolean | No       | Whether to inject the unsubscribe link automatically. Default: `false`                                       |
| CustomSubdomain   | String  | No       | Override the default MFROM/return-path subdomain. Letters, digits, and hyphens only; max 32 chars; no leading/trailing hyphens |
| CustomTrackPrefix | String  | No       | Override the default click-tracking subdomain prefix. Same character rules as `CustomSubdomain`             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.senderdomain \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.senderdomain.create",
    "APIKey": "your-api-key",
    "SenderDomain": "example.com",
    "LinkTracking": true,
    "OpenTracking": true,
    "UnsubscribeLink": false
  }'
```

```json [Success Response]
{
  "Success": true,
  "DomainID": 12,
  "SenderDomain": {
    "DomainID": "12",
    "SenderDomain": "example.com",
    "UserID": "1",
    "CreatedAt": "2026-04-26 09:30:00",
    "Status": "Approval Pending",
    "VerificationMeta": {
      "DNSRecords": {
        "sl.example.com": ["CNAME", "tracking-host.octeth.example."],
        "track-sl.example.com": ["CNAME", "tracking-host.octeth.example."]
      }
    },
    "PolicyMeta": [],
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
  "Errors": [
    {
      "Code": 5,
      "Message": "Sender domain limit reached for your account"
    }
  ]
}
```

```txt [Error Codes]
1: Missing SenderDomain parameter
4: localhost is not a valid sender domain
5: Sender domain limit reached for your account (returned with HTTP 403)
6: Invalid CustomSubdomain or CustomTrackPrefix (letters, digits, and hyphens only; max 32 chars; no leading/trailing hyphens)
7: Sender domain create process failed (returned with HTTP 400)
8: Sender domain could not be retrieved after creation (returned with HTTP 500)
```

:::

## Update a Sender Domain

<Badge type="info" text="PATCH" /> `/api/v1/user.senderdomain`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- **PATCH requests must send all parameters in a JSON body** (`Content-Type: application/json`). The dispatcher does not parse query-string or form-encoded payloads for PATCH, so `?DomainID=...` and `?APIKey=...` will be ignored — include them in the JSON body alongside the other update fields.
:::

This is a **partial update**. Only fields explicitly present in the request body are modified — omitted fields keep their currently stored value (the API does not reset them to defaults).

If the request changes any DNS-affecting field (`CustomSubdomain`, `CustomTrackPrefix`, or `UseTrackingSubdomain` / `TrackPrefixDisabled`), the server automatically:

1. Regenerates the `VerificationMeta.DNSRecords` template via `RegenerateDNSRecords`.
2. Resets `Status` to `Approval Pending` (the previous DNS verification is no longer valid for the new subdomain layout).
3. Invalidates the Redis verification cache for this domain.
4. Sets `DnsRegenerated: true` in the response so the caller knows DNS records changed.

The user must then update their DNS zone with the new records and call `user.senderdomain.verify` to re-verify.

**Request Body Parameters:**

| Parameter            | Type    | Required | Description                                                                                                                 |
|----------------------|---------|----------|-----------------------------------------------------------------------------------------------------------------------------|
| Command              | String  | Yes      | API command: `user.senderdomain.update`                                                                                     |
| SessionID            | String  | No       | Session ID obtained from login                                                                                              |
| APIKey               | String  | No       | API key for authentication                                                                                                  |
| DomainID             | Integer | Yes      | The ID of the sender domain to update. Must be owned by the calling user                                                    |
| LinkTracking         | Boolean | No       | Toggle click tracking. Omitted: stored value preserved                                                                      |
| OpenTracking         | Boolean | No       | Toggle open tracking. Omitted: stored value preserved                                                                       |
| UnsubscribeLink      | Boolean | No       | Toggle automatic unsubscribe-link injection. Omitted: stored value preserved                                                |
| UseTrackingSubdomain | Boolean | No       | Whether to use a separate tracking subdomain. Internally stored as the inverse `TrackPrefixDisabled` flag                   |
| CustomSubdomain      | String  | No       | New override for the MFROM/return-path subdomain. Letters, digits, and hyphens only; max 32 chars; no leading/trailing hyphens. **Triggers DNS regeneration** |
| CustomTrackPrefix    | String  | No       | New override for the tracking subdomain prefix. Same character rules. **Triggers DNS regeneration**                         |

::: code-group

```bash [Example Request]
curl -X PATCH https://example.com/api/v1/user.senderdomain \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.senderdomain.update",
    "APIKey": "your-api-key",
    "DomainID": 12,
    "CustomSubdomain": "em",
    "UseTrackingSubdomain": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "DnsRegenerated": true,
  "SenderDomain": {
    "DomainID": "12",
    "SenderDomain": "example.com",
    "UserID": "1",
    "CreatedAt": "2026-04-25 22:54:00",
    "Status": "Approval Pending",
    "VerificationMeta": {
      "DNSRecords": {
        "em.example.com": ["CNAME", "tracking-host.octeth.example."],
        "track-em.example.com": ["CNAME", "tracking-host.octeth.example."]
      }
    },
    "PolicyMeta": [],
    "Options": {
      "LinkTracking": 1,
      "OpenTracking": 1,
      "UnsubscribeLink": 0,
      "CustomSubdomain": "em",
      "TrackPrefixDisabled": false
    }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 6,
      "Message": "Invalid CustomSubdomain. Letters, digits, and hyphens only; max 32 chars; no leading/trailing hyphens"
    }
  ]
}
```

```txt [Error Codes]
1: Missing DomainID parameter
2: Sender domain not found (also returned when the domain exists but is owned by another user)
6: Invalid CustomSubdomain or CustomTrackPrefix (letters, digits, and hyphens only; max 32 chars; no leading/trailing hyphens)
7: Sender domain could not be retrieved after update (returned with HTTP 500)
```

:::

## Delete a Sender Domain

<Badge type="info" text="DELETE" /> `/api/v1/user.senderdomain`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Soft delete** — the row is not removed from the database. The model sets `Status='Deleted'` and fires the `Delete.SenderDomain` plugin hook so listeners can run cleanup logic (e.g., remove the domain from active campaigns). Subsequent `Get` / `List` calls will not return the domain.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                          |
|-----------|---------|----------|----------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `user.senderdomain.delete`                              |
| SessionID | String  | No       | Session ID obtained from login                                       |
| APIKey    | String  | No       | API key for authentication                                           |
| DomainID  | Integer | Yes      | The ID of the sender domain to delete. Must be owned by the calling user |

::: code-group

```bash [Example Request]
curl -X DELETE "https://example.com/api/v1/user.senderdomain?APIKey=your-api-key&DomainID=12"
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Sender domain not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing DomainID parameter
2: Sender domain not found (also returned when the domain exists but is owned by another user)
```

:::

## Verify a Sender Domain

<Badge type="info" text="POST" /> `/api/v1/user.senderdomain.verify`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Performs a **live DNS lookup** for each expected record (CNAME / A / MX / TXT). Results are cached for 60 seconds in Redis to avoid hammering DNS resolvers — calling this endpoint twice in quick succession will return the same outcome.

The endpoint **persists Status** based on the result (mirrors what the UI's edit page does on every load):

- All records resolve correctly → `Status = 'Enabled'`
- Any record fails → `Status = 'Approval Pending'`

The latest per-record verified flags are merged into the existing `VerificationMeta` (other keys are preserved) so subsequent `Get` / `DNS` calls reflect the same state shown in the UI. The `Status` and `VerificationMeta` columns are only rewritten when the verified state actually changed, but `LastVerifiedAt` is **always** updated on every call (issue #1889) — this is what powers the "Checked X ago" subtitle in the sender-domain UI.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                              |
|-----------|---------|----------|--------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `user.senderdomain.verify`                                  |
| SessionID | String  | No       | Session ID obtained from login                                           |
| APIKey    | String  | No       | API key for authentication                                               |
| DomainID  | Integer | Yes      | The ID of the sender domain to verify. Must be owned by the calling user |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.senderdomain.verify \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.senderdomain.verify",
    "APIKey": "your-api-key",
    "DomainID": 12
  }'
```

```json [Success Response]
{
  "Success": true,
  "DomainID": 12,
  "IsVerified": true,
  "Status": "Enabled",
  "DNSRecords": {
    "sl.example.com": ["CNAME", "tracking-host.octeth.example.", true],
    "track-sl.example.com": ["CNAME", "tracking-host.octeth.example.", true]
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Sender domain not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing DomainID parameter
2: Sender domain not found (also returned when the domain exists but is owned by another user)
```

:::

## Get DNS Records for a Sender Domain

<Badge type="info" text="GET" /> `/api/v1/user.senderdomain.dns`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Read-only. Returns the stored `VerificationMeta.DNSRecords` (the records the user needs to add to their DNS zone), normalized to a structured shape: `{ host: { Type, Value, IsVerified } }`.

`IsVerified` is **tri-state**:

- `null` — this record has never been probed (e.g. domain was just created or its subdomain settings just changed)
- `true` — the last probe by `user.senderdomain.verify` matched the expected value
- `false` — the last probe ran but did not match (DNS not configured yet, or misconfigured)

The records are kept fresh automatically — when `Update` changes a DNS-affecting setting, the server regenerates them. If the stored records are missing/empty (legacy or just-created edge case), this endpoint falls back to regenerating the template purely for display, without persisting.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                       |
|-----------|---------|----------|-----------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `user.senderdomain.dns`                                              |
| SessionID | String  | No       | Session ID obtained from login                                                    |
| APIKey    | String  | No       | API key for authentication                                                        |
| DomainID  | Integer | Yes      | The ID of the sender domain. Must be owned by the calling user                    |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/user.senderdomain.dns?APIKey=your-api-key&DomainID=12"
```

```json [Success Response]
{
  "Success": true,
  "DomainID": 12,
  "SenderDomain": "example.com",
  "DNSRecords": {
    "sl.example.com": {
      "Type": "CNAME",
      "Value": "tracking-host.octeth.example.",
      "IsVerified": true
    },
    "track-sl.example.com": {
      "Type": "CNAME",
      "Value": "tracking-host.octeth.example.",
      "IsVerified": null
    }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Sender domain not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing DomainID parameter
2: Sender domain not found (also returned when the domain exists but is owned by another user)
```

:::
