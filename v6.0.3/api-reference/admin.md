---
layout: doc
---

# Admin API Documentation

Admin-level endpoints for system administrators to manage and monitor campaigns, processes, and other administrative functions.

::: danger Behavior changes in v6.0.0
**`admin.login` no longer returns credential fields.** `AdminInfo.Password`, `.AuthToken`, `.2FA_SecretKey` and `.2FA_RecoveryKey` are gone. `AdminInfo` now carries the same field set `admin.get` returns, plus a new boolean `APIKeyIssued` so a client can render the regenerate and revoke state without holding the key.

Two shape consequences of using that shared projection: **`AdminInfo.AdminID` is now a JSON number** where it used to be a quoted string, and `AdminInfo.Options` is always an object or array rather than sometimes a JSON string. Both match what `admin.get`, `admin.subadmin.get` and `admin.subadmins.get` have always returned, so a client that handles those handles this. `AdminID` is the only field whose type changes anywhere in this release.

**Restricted sub-admin accounts are now scoped to their allowed user groups.** Nine commands enforced the sub-admin privilege list but never the allowed user groups, so a sub-admin limited to one group could read, modify, credit, impersonate and delete accounts in every other group. `User.Get`, `User.Create`, `User.Update`, `User.AddCredits`, `User.Switch`, `Users.Delete`, `User.PaymentPeriods` and `User.PaymentPeriods.Update` now refuse a target outside the caller's groups with `ErrorCode 5003`. `Users.Get` **filters** its listing instead, `TotalUsers` included, except for the blocked sender domains filter which is refused outright because it builds from a join that cannot carry a group restriction.

`Users.Delete` is **all or nothing**: if any id in the list is outside the caller's groups, nothing is deleted, because the response has no field to report which ids were skipped.

**Nothing changes for the master `ADMIN_API_KEY`**, which resolves to the unrestricted master administrator, for any admin account without the restriction flag, or for calls made under user authentication. `ErrorCode 5003` can only come from a restricted sub-admin.

**`Disable2FA` and `Disable2FAToken` on `admin.login` are stripped from any request arriving over HTTP.** They now work only for Octeth's own in-process callers.

See [Behavior changes in v6.0.0](/v6.0.0/api-reference/behavior-changes) for the full list.
:::

## Get Campaign Batches

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.batches`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves a paginated list of batches for a specific campaign with filtering and sorting options. This endpoint provides detailed information about each batch including status, processing statistics, and timing metrics.

**Request Body Parameters:**

| Parameter          | Type    | Required | Description                                                                                      |
|--------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command            | String  | Yes      | API command: `admin.campaign.batches`                                                            |
| SessionID          | String  | No       | Session ID obtained from login                                                                   |
| APIKey             | String  | No       | API key for authentication                                                                       |
| CampaignID         | Integer | Yes      | Campaign ID to retrieve batches for                                                              |
| RecordsPerRequest  | Integer | No       | Number of records per request (default: 50, max: 500). Pass `0` to return **all** matching records with no row cap. <Badge type="tip" text="Fixed in v5.9.3" /> `0` is honoured in every request shape — JSON integer `0`, JSON string `"0"`, and form-encoded `0`. |
| RecordsFrom        | Integer | No       | Offset for pagination (default: 0)                                                               |
| ExactOffset        | Boolean | No       | <Badge type="tip" text="New in v5.9.3" /> When `true`, `RecordsFrom` is honoured as an exact row offset. When omitted or `false` (default), `RecordsFrom` is floored down to the nearest `RecordsPerRequest` boundary — the historical behaviour, kept for backward compatibility. |
| Status             | String  | No       | Filter by batch status: `Pending`, `Working`, `Completed`, `Failed`, `Paused`                   |
| OrderField         | String  | No       | Field to sort by: `ID`, `CreatedAt`, `UpdatedAt`, `FinishedAt`, `Status`, `ProcessedEmails`, `EmailsPerSec` |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC` (default: ASC)                                                   |

::: warning Pagination offset semantics
By default `RecordsFrom` is converted to a page number (`floor(RecordsFrom / RecordsPerRequest) + 1`), so any value that is **not** an exact multiple of `RecordsPerRequest` is rounded down to the start of that page. For example, `RecordsFrom=25` with `RecordsPerRequest=50` returns rows 0–49, not rows 25–74.

Pass `ExactOffset: true` to have `RecordsFrom` treated as a true row offset. This is opt-in so that existing integrations keep receiving identical results.

When `ExactOffset` is enabled together with `RecordsPerRequest: 0` ("all records"), the first `RecordsFrom` rows are skipped and every remaining row is returned.

`ExactOffset` accepts the usual boolean spellings — `true`, `1`, `"1"`, `"true"`, `"yes"`, `"on"`. Anything else is treated as false and yields the default behaviour. As everywhere on `/api.php`, the parameter name itself is matched case-insensitively.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.batches \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.batches",
    "APIKey": "your-admin-api-key",
    "CampaignID": 123,
    "RecordsPerRequest": 50,
    "RecordsFrom": 0,
    "Status": "Completed",
    "OrderField": "FinishedAt",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Batches": [
    {
      "ID": 123,
      "BatchID": "batch_abc123def456",
      "Status": "Completed",
      "StatusMessage": null,
      "CreatedAt": "2025-11-10 14:30:00",
      "UpdatedAt": "2025-11-10 14:35:00",
      "FinishedAt": "2025-11-10 14:35:00",
      "ProcessID": 5,
      "WorkerPID": 12345,
      "StartedAt": "2025-11-10 14:30:00",
      "LastPingedAt": "2025-11-10 14:35:00",
      "AttemptCount": 1,
      "TotalProcessingTime": 300,
      "ProcessedEmails": 1000,
      "EmailsPerSec": "3.33",
      "CurrentProcessingDuration": 300,
      "SecondsSinceLastPing": 120,
      "TotalRecipients": 1000,
      "PendingRecipients": 0,
      "SentRecipients": 995,
      "FailedRecipients": 5
    }
  ],
  "TotalBatches": 256
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "campaignid parameter is required"
}
```

```txt [Error Codes]
0: Success
1: campaignid parameter is required
11: Access denied to this campaign (restricted sub-admin, issue #2856)
```

:::

## Get Campaign Details

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.details`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves comprehensive campaign information including batches, worker assignments, delivery metrics, and health status. This endpoint is designed for campaign monitoring and debugging, providing a complete view of campaign state, performance metrics, and diagnostic information.

**Request Body Parameters:**

| Parameter            | Type    | Required | Description                                                                                |
|----------------------|---------|----------|--------------------------------------------------------------------------------------------|
| Command              | String  | Yes      | API command: `admin.campaign.details`                                                      |
| SessionID            | String  | No       | Session ID obtained from login                                                             |
| APIKey               | String  | No       | API key for authentication                                                                 |
| CampaignID           | Integer | Yes      | Campaign ID to retrieve details for                                                        |
| IncludeBatchDetails  | Boolean | No       | Include detailed batch information (can be expensive for large campaigns). Default: true   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.details \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.details",
    "APIKey": "your-admin-api-key",
    "CampaignID": 123,
    "IncludeBatchDetails": true
  }'
```

```json [Success Response]
{
  "Campaign": {
    "CampaignID": 123,
    "CampaignName": "Newsletter Campaign",
    "CampaignStatus": "Sending",
    "TotalRecipients": 25000,
    "TotalSent": 9500
  },
  "QueueTable": {
    "Exists": true,
    "TableName": "oempro_queue_c_123",
    "Stats": {
      "TotalRecipients": 25000,
      "Pending": 15500,
      "Sending": 0,
      "Sent": 9500,
      "Failed": 0
    }
  },
  "Throughput": {
    "EmailsPerSecond": 2.64,
    "EmailsPerMinute": 158.4,
    "EmailsPerHour": 9504,
    "TotalSent": 9500,
    "DurationSeconds": 3600,
    "EmailsRemaining": 15500,
    "EstimatedSecondsRemaining": 5871,
    "EstimatedTimeRemaining": "01:37:51"
  },
  "Velocity": {
    "EmailsSentInWindow": 125,
    "WindowSeconds": 60,
    "ElapsedSeconds": 58,
    "EmailsPerSecond": 2.16,
    "EmailsRemaining": 15500,
    "EstimatedSecondsRemaining": 7176,
    "EstimatedTimeRemaining": "01:59:36"
  },
  "BatchSummary": {
    "TotalBatches": 25,
    "BatchesByStatus": {
      "Pending": 5,
      "Working": 10,
      "Completed": 8,
      "Failed": 2,
      "Other": 0
    },
    "TotalRecipients": 25000,
    "TotalAttempts": 28,
    "AverageAttemptsPerBatch": 1.12,
    "BatchesWithWorkers": 10,
    "PotentiallyStuckBatches": 0,
    "DiagnosticNote": null
  },
  "Health": {
    "Status": "Healthy",
    "Note": "Campaign is actively sending with 5 worker(s) (38.0% complete)",
    "Issues": [],
    "Warnings": [],
    "WorkerTracking": {
      "LastWorkerActivityAt": "2025-11-09 14:30:00",
      "ActiveWorkerCount": 5,
      "SecondsSinceLastActivity": 3,
      "IsStuck": false,
      "StuckReason": null,
      "IsPotentiallyStuck": false,
      "HasInactiveWorkers": false
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "campaignid parameter is required"
}
```

```txt [Error Codes]
0: Success
1: campaignid parameter is required
11: Access denied to this campaign (restricted sub-admin, issue #2856)
```

:::

## Get Campaign Processes

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.processes`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves a paginated list of processes associated with a campaign's batches, along with aggregated counts by hostname. This endpoint is useful for monitoring worker distribution and process health across different servers.

**Request Body Parameters:**

| Parameter          | Type    | Required | Description                                                                                      |
|--------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command            | String  | Yes      | API command: `admin.campaign.processes`                                                          |
| SessionID          | String  | No       | Session ID obtained from login                                                                   |
| APIKey             | String  | No       | API key for authentication                                                                       |
| CampaignID         | Integer | Yes      | Campaign ID to retrieve processes for                                                            |
| RecordsPerRequest  | Integer | No       | Number of records per request (default: 50, max: 500). Pass `0` to return **all** matching records with no row cap. <Badge type="tip" text="Fixed in v5.9.3" /> `0` is honoured in every request shape — JSON integer `0`, JSON string `"0"`, and form-encoded `0`. |
| RecordsFrom        | Integer | No       | Offset for pagination (default: 0)                                                               |
| OrderField         | String  | No       | Field to sort by: `ProcessID`, `PID`, `Hostname`, `ProcessType`, `RegisteredAt`, `LastPingedAt`, `MemoryUsage`, `MemoryPeakUsage` (default: LastPingedAt) |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC` (default: DESC)                                                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.processes \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.processes",
    "APIKey": "your-admin-api-key",
    "CampaignID": 123,
    "RecordsPerRequest": 50,
    "RecordsFrom": 0,
    "OrderField": "LastPingedAt",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Processes": [
    {
      "ProcessID": 123,
      "PID": 12345,
      "Hostname": "worker-1",
      "ProcessType": "campaign_sender",
      "RegisteredAt": "2025-11-10 14:30:00",
      "LastPingedAt": "2025-11-10 14:35:00",
      "MemoryUsage": 52428800,
      "MemoryPeakUsage": 67108864,
      "KeyMetricValue1": 0,
      "KeyMetricValue2": 0,
      "KeyMetricValue3": 0,
      "KeyMetricValue4": 0,
      "KeyMetricValue5": 0
    }
  ],
  "TotalProcesses": 10,
  "ProcessCountByHostname": [
    {
      "Hostname": "worker-1",
      "ProcessCount": 5
    },
    {
      "Hostname": "worker-2",
      "ProcessCount": 3
    },
    {
      "Hostname": "worker-3",
      "ProcessCount": 2
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "campaignid parameter is required"
}
```

```txt [Error Codes]
0: Success
1: campaignid parameter is required
11: Access denied to this campaign (restricted sub-admin, issue #2856)
```

:::

## Get Campaign Queue

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.queue`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves a paginated list of queued emails for a specific campaign with filtering and search options. This endpoint is useful for inspecting individual queue items, debugging email delivery issues, and monitoring queue status.

**Request Body Parameters:**

| Parameter          | Type    | Required | Description                                                                                      |
|--------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command            | String  | Yes      | API command: `admin.campaign.queue`                                                              |
| SessionID          | String  | No       | Session ID obtained from login                                                                   |
| APIKey             | String  | No       | API key for authentication                                                                       |
| CampaignID         | Integer | Yes      | Campaign ID to retrieve queue items for                                                          |
| RecordsPerRequest  | Integer | No       | Number of records per request (default: 50, max: 500). Pass `0` to return **all** matching records with no row cap. Non-numeric or negative values are invalid and fall back to the default (50). |
| RecordsFrom        | Integer | No       | Offset for pagination (default: 0)                                                               |
| ExactOffset        | Boolean | No       | <Badge type="tip" text="New in v5.9.3" /> When `true`, `RecordsFrom` is honoured as an exact row offset. When omitted or `false` (default), `RecordsFrom` is floored down to the nearest `RecordsPerRequest` boundary — the historical behaviour, kept for backward compatibility. |
| Status             | String  | No       | Filter by queue status: `Pending`, `Sending`, `Sent`, `Delivered`, `Failed`                     |
| Search             | String  | No       | Search term for EmailAddress field                                                               |
| BatchID            | String  | No       | Filter by specific QueueBatchID                                                                  |
| IsTest             | Boolean | No       | Filter by IsTest flag (true/false)                                                               |
| OrderField         | String  | No       | Field to sort by: `QueueID`, `EmailAddress`, `Status`, `QueuedAt`, `SentAt`, `FailedAt`, `QueueBatchID` (default: QueueID) |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC` (default: ASC)                                                   |

::: warning Pagination offset semantics
By default `RecordsFrom` is converted to a page number (`floor(RecordsFrom / RecordsPerRequest) + 1`), so any value that is **not** an exact multiple of `RecordsPerRequest` is rounded down to the start of that page. For example, `RecordsFrom=25` with `RecordsPerRequest=50` returns rows 0–49, not rows 25–74.

Pass `ExactOffset: true` to have `RecordsFrom` treated as a true row offset. This is opt-in so that existing integrations keep receiving identical results.

`ExactOffset` accepts the usual boolean spellings — `true`, `1`, `"1"`, `"true"`, `"yes"`, `"on"`. Anything else is treated as false and yields the default behaviour. As everywhere on `/api.php`, the parameter name itself is matched case-insensitively.
:::

::: tip `RecordsPerRequest: 0` returns all records
<Badge type="tip" text="Changed in v5.9.3" /> `RecordsPerRequest: 0` returns every matching row with no cap, matching the sibling `admin.campaign.batches` endpoint. Before v5.9.3 it was silently capped at 500 rows, with nothing in the response indicating that truncation had occurred.

A campaign queue can hold millions of rows, and an unbounded request materialises the entire result set — including the `Options`, `SenderSettings` and `CustomFieldSnapshot` payloads — in a single response. For large campaigns, page with an explicit `RecordsPerRequest` plus `ExactOffset`, or narrow the result set with `Status`, `BatchID` or `Search` first.

Combining `RecordsPerRequest: 0` with `ExactOffset: true` and a non-zero `RecordsFrom` returns **every remaining row from that offset onward** (not just one page). With `RecordsFrom: 0`, or with `ExactOffset` omitted, it returns the full result set from the beginning.

Non-numeric (e.g. `"abc"`) or negative values are invalid and fall back to the default page size of 50. Prior to v5.9.3 such values were treated as `0` and returned 500 rows.
:::

::: tip `RecordsPerRequest: 0` works in every request shape
<Badge type="tip" text="Fixed in v5.9.3" /> A bare JSON integer `0` (`"RecordsPerRequest": 0`), the JSON string `"0"`, and a form-encoded `RecordsPerRequest=0` are now all honoured identically as "all records".

Before this fix a JSON integer `0` was misread as an omitted parameter and silently replaced with the default page size, so a JSON client following this page verbatim received one page instead of the full result set, with nothing in the response indicating the shortfall. The same fix applies to `admin.campaign.batches`, `admin.campaign.processes` and `admin.users.activity`.

`0 = all records` is a convention of these admin campaign endpoints, **not** a global one. It is explicitly not supported on `subscribers.get`, `subscribers.search` or `journey.action.subscribers` — see the note on those commands before passing `0` to them.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.queue \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.queue",
    "APIKey": "your-admin-api-key",
    "CampaignID": 123,
    "RecordsPerRequest": 50,
    "RecordsFrom": 0,
    "Status": "Sent",
    "Search": "example.com",
    "OrderField": "SentAt",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "QueueItems": [
    {
      "QueueID": 12345,
      "RelListID": 10,
      "RelSegmentID": 0,
      "RelSubscriberID": 5432,
      "RelDeliveryServerID": 3,
      "RelEmailID": 123,
      "IsTest": false,
      "EmailAddress": "user@example.com",
      "Status": "Sent",
      "StatusMessage": "",
      "QueueBatchID": "batch_abc123def456",
      "Options": null,
      "SenderSettings": null,
      "QueuedAt": "2025-11-10 14:30:00",
      "FailedAt": null,
      "SentAt": "2025-11-10 14:35:00",
      "CustomFieldSnapshot": null
    }
  ],
  "TotalQueueItems": 10000
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "campaignid parameter is required"
}
```

```txt [Error Codes]
0: Success
1: campaignid parameter is required
11: Access denied to this campaign (restricted sub-admin, issue #2856)
```

:::

## Get Campaign Sending Velocity

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.sending-velocity`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns time-series data showing how many emails were sent per time interval for a campaign. This endpoint is useful for visualizing sending velocity in charts and graphs, and for monitoring real-time campaign performance. Only available for campaigns in 'Sending' or 'Sent' status.

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                                                                      |
|------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command    | String  | Yes      | API command: `admin.campaign.sending-velocity`                                                   |
| SessionID  | String  | No       | Session ID obtained from login                                                                   |
| APIKey     | String  | No       | API key for authentication                                                                       |
| CampaignID | Integer | Yes      | Campaign ID (must be in 'Sending' or 'Sent' status)                                             |
| Interval   | String  | No       | Time interval for grouping: `auto`, `minute`, `5min`, `10min`, `15min`, `hour` (default: auto). The 'auto' option automatically selects optimal interval to keep data points ≤ 200 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.sending-velocity \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.sending-velocity",
    "APIKey": "your-admin-api-key",
    "CampaignID": 123,
    "Interval": "minute"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "CampaignID": 123,
  "CampaignStatus": "Sent",
  "Interval": "minute",
  "DataPoints": [
    {
      "TimeBucket": "2025-11-10 14:30",
      "EmailsSent": 150,
      "EmailsPerSecond": 2.5
    },
    {
      "TimeBucket": "2025-11-10 14:31",
      "EmailsSent": 145,
      "EmailsPerSecond": 2.42
    }
  ],
  "Summary": {
    "TotalDataPoints": 60,
    "TotalEmailsSent": 9000,
    "MinEmailsPerInterval": 100,
    "MaxEmailsPerInterval": 200,
    "AvgEmailsPerInterval": 150,
    "FirstSentAt": "2025-11-10 14:30:00",
    "LastSentAt": "2025-11-10 15:29:59"
  },
  "Velocity": {
    "EmailsSentInWindow": 125,
    "WindowSeconds": 60,
    "ElapsedSeconds": 58,
    "EmailsPerSecond": 2.16,
    "EmailsPerMinute": 129.6,
    "EmailsPerHour": 7776,
    "EmailsRemaining": 15500,
    "EstimatedSecondsRemaining": 7176,
    "EstimatedTimeRemaining": "01:59:36"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Campaign must be in Sending or Sent status. Current status: Draft"
}
```

```txt [Error Codes]
0: Success
1: campaignid parameter is required
2: Invalid interval. Valid values: auto, minute, 5min, 10min, 15min, hour
3: Campaign not found
4: Campaign must be in Sending or Sent status
5: Queue table does not exist for this campaign
11: Access denied to this campaign (restricted sub-admin, issue #2856)
```

:::

## Get Campaigns Overview

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.overview`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Provides campaign status totals and overview counts for admin users. Returns counts for all campaign statuses, currently sending campaigns, sent campaigns (with time filters), and scheduled campaigns (with time filters). This endpoint is useful for dashboard displays and campaign monitoring.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| Command   | String | Yes      | API command: `admin.campaigns.overview` |
| SessionID | String | No       | Session ID obtained from login       |
| APIKey    | String | No       | API key for authentication           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.overview \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.overview",
    "APIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "StatusTotals": {
    "Draft": 15,
    "Ready": 3,
    "Sending": 5,
    "Paused": 2,
    "PendingApproval": 1,
    "Sent": 120,
    "Failed": 4,
    "Scheduled": 8
  },
  "CurrentlySending": {
    "Count": 5,
    "ReadyCount": 3
  },
  "Sent": {
    "Today": 2,
    "Past7Days": 15,
    "Past30Days": 45
  },
  "Scheduled": {
    "Today": 1,
    "Next7Days": 5,
    "Next30Days": 8
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Authentication failed"
}
```

```txt [Error Codes]
0: Success
```

:::

## Search Campaigns

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.search`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Sub-admins need the `Reports` privilege, checked in the handler since v6.0.2
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Searches and filters campaigns across all accounts with admin privileges. This endpoint provides powerful filtering, search, and pagination capabilities, along with optional performance metrics like batch statistics and velocity. By default, statistics are disabled for better performance.

**Request Body Parameters:**

| Parameter               | Type    | Required | Description                                                                                      |
|-------------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command                 | String  | Yes      | API command: `admin.campaigns.search`                                                            |
| AdminAPIKey             | String  | Yes      | Admin API key                                                                                    |
| CampaignStatus          | String  | No       | Filter by status: `Draft`, `Ready`, `Scheduled`, `Sending`, `Sent`, `Paused`. Note: 'Scheduled' is mapped to 'Ready' with ScheduleType='Future' |
| SearchKeyword           | String  | No       | Search by campaign name or email subject (LIKE query)                                            |
| FilterByUserID          | Integer | No       | Filter by account/user ID (empty for all accounts)                                              |
| CampaignIDs             | String/Array | No  | Filter by specific campaign IDs (comma-separated string or array). Example: "1,2,3" or [1,2,3]  |
| Date_From               | String  | No       | Start date (Y-m-d). The underscore is part of the name; keys are matched case-insensitively. The column depends on `CampaignStatus`: `Sent` and `Failed` filter on `SendProcessFinishedOn`, `Sending` on `SendProcessStartedOn`, `Scheduled` and any other status on `SendDate`; `Draft`, `Pending Approval` and unscheduled `Ready` campaigns ignore the window. Note this differs from the `DateFrom` the campaign-report commands below take, which apply the screen's bucket mapping (`Sent` on `SendProcessStartedOn`) |
| Date_To                 | String  | No       | End date (Y-m-d), same column rules as `Date_From`                                               |
| OrderField              | String  | No       | Field to sort by (e.g., CampaignName, SendProcessFinishedOn)                                     |
| OrderType               | String  | No       | Sort direction: `ASC` or `DESC`                                                                  |
| RecordsPerRequest       | Integer | No       | Number of records per page (0 for all)                                                           |
| RecordsFrom             | Integer | No       | Offset for pagination                                                                            |
| RetrieveStatistics      | Boolean | No       | Include campaign statistics (default: false for performance)                                     |
| RetrieveTags            | Boolean | No       | Include campaign tags (default: false)                                                           |
| Tags                    | String  | No       | Comma-separated tag IDs to filter by                                                             |
| SplitABTestStatistics   | Boolean | No       | Include A/B split test statistics (default: false)                                              |
| ExcludeColumns          | Array   | No       | Column names to exclude from SELECT for performance (e.g., ['Options', 'HTMLContent'])          |
| IncludeTotalRecipients  | Boolean | No       | Include aggregate sums over the filtered window: TotalRecipients, TotalSent, TotalDelivered, TotalFailed, TotalOpens, UniqueOpens, TotalClicks, UniqueClicks, TotalHardBounces, TotalSoftBounces, TotalUnsubscriptions (default: false) |
| IncludeBatchStats       | Boolean | No       | Include batch statistics for each campaign (default: false)                                     |
| IncludeVelocity         | Boolean | No       | Include current sending velocity metrics for each campaign (default: false)                     |
| HasFailed               | Boolean | No       | Only campaigns with `TotalFailed` > 0 (the report's "Failed Recipients" tab combines this with `CampaignStatus=Sent`). Default false |
| SearchQuery             | String  | No       | Advanced search DSL, translated on the server and AND-ed with the other filters (see the shared filters under "Composite Campaign Statuses Used by the Admin Campaign Report" below). The generated SQL is never returned. Failure to translate is `ErrorCode 5` |
| ApprovalContext         | Boolean | No       | Add what a reviewer of campaigns pending approval needs to each row: `FromName`, `FromEmail` and `Subject` of the campaign's email (null when the campaign has no email of its owner), `ApprovalFingerprint` (the value `campaign.approve` and `admin.campaign.reject` expect as `ExpectedFingerprint`, null when it cannot be computed or the campaign changed while the row was being read, in which case reload) and `ScreeningHold` (`{"Reason": "...", "HeldAt": "YYYY-MM-DD HH:MM:SS"}` when content screening held the campaign, otherwise null). Each row costs a fingerprint, so with this flag `RecordsPerRequest` is capped at 25: 0, absent or a larger value returns 25 rows. Default false, and without it the response is unchanged. Added in v6.0.2 |

> This command browses every account (`FilterByUserID` empty = all) and does not take the `UserID` parameter of the admin-reach commands. Restricted sub-admins only see the accounts of their allowed user groups. Owner decoration (`UserFirstName`, `UserLastName`, `UserEmailAddress`, `UserCompany`) is attached to every row.

> To list campaigns waiting for approval with their review context, send `CampaignStatus=Pending Approval` and `ApprovalContext=true`, and page with `RecordsFrom`.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.search \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.search",
    "AdminAPIKey": "your-admin-api-key",
    "CampaignStatus": "Sending",
    "SearchKeyword": "newsletter",
    "RecordsPerRequest": 25,
    "RecordsFrom": 0,
    "OrderField": "CreatedOn",
    "OrderType": "DESC",
    "IncludeBatchStats": true,
    "IncludeVelocity": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Campaigns": [
    {
      "CampaignID": 123,
      "CampaignName": "Weekly Newsletter",
      "CampaignStatus": "Sending",
      "RelOwnerUserID": 5,
      "UserFirstName": "John",
      "UserLastName": "Doe",
      "UserEmailAddress": "john@example.com",
      "UserCompany": "Example Corp",
      "TotalRecipients": 10000,
      "TotalSent": 5000,
      "TotalFailed": 50,
      "CreatedOn": "2025-11-10 14:00:00",
      "BatchStats": {
        "TotalBatches": 10,
        "Pending": 2,
        "Working": 3,
        "Completed": 5,
        "Failed": 0,
        "Paused": 0
      },
      "Velocity": {
        "EmailsSentInWindow": 125,
        "WindowSeconds": 60,
        "ElapsedSeconds": 58,
        "EmailsPerSecond": 2.16,
        "EmailsPerMinute": 129.6,
        "EmailsPerHour": 7776,
        "EmailsRemaining": 5000,
        "EstimatedSecondsRemaining": 2314,
        "EstimatedTimeRemaining": "00:38:34"
      }
    }
  ],
  "TotalCampaigns": 50,
  "AggregateSums": {
    "TotalRecipients": 250000,
    "TotalSent": 125000,
    "TotalDelivered": 121000,
    "TotalFailed": 1250,
    "TotalOpens": 60000,
    "UniqueOpens": 42000,
    "TotalClicks": 9800,
    "UniqueClicks": 7100,
    "TotalHardBounces": 900,
    "TotalSoftBounces": 350,
    "TotalUnsubscriptions": 640
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Authentication failed"
}
```

```txt [Error Codes]
0: Success
5: SearchQuery could not be translated
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Composite Campaign Statuses Used by the Admin Campaign Report

The admin Campaign Report does not use raw `CampaignStatus` values. Every command in this group (`admin.campaigns.report`, `admin.campaigns.stuck`, `admin.campaigns.statuscounts`, `admin.campaigns.timeseries`, `admin.campaigns.export`) takes `Status` from the table below, `admin.campaigns.statuscounts` returns one counter per row, and each row's date range applies to its own date column. This is the mapping the staff Campaign Report screen uses: `campaigns.get` documents `SendProcessFinishedOn` for Sent, which the report does NOT use.

All of them require the Admin API key and the `Reports` sub-admin privilege. Since v6.0.2 `admin.campaigns.report`, `admin.campaigns.statuscounts`, `admin.campaigns.timeseries` and `admin.campaigns.export` check `Reports` in the handler, so a sub-admin without it gets `ErrorCode 99999` even when `ADMIN_API_ENFORCE_PRIVILEGES` is off. Restricted sub-admins (`Options.AccessLimited` with `AccessAllowedUserGroupIDs`) only see campaigns owned by accounts in their allowed user groups.

| Status (bucket) | Definition | Date column for DateFrom / DateTo |
|---|---|---|
| `Sent` | `CampaignStatus` is `Sent` OR `Failed` | `SendProcessStartedOn` |
| `Outbox` | `Sending` OR (`Ready` AND `ScheduleType` = `Immediate`) | `CreateDateTime` |
| `Draft` | `Draft` OR (`Ready` AND `ScheduleType` = `Not Scheduled`) | `CreateDateTime` |
| `Scheduled` | `Ready` AND `ScheduleType` IN (`Future`, `Recursive`) | `SendDate` |
| `Paused` | `Paused` | `SendProcessStartedOn` |
| `PendingApproval` | `Pending Approval` | `CreateDateTime` |
| `Failed` | `Failed` | `SendProcessStartedOn` |
| `HasFailed` | (`Sent` OR `Failed`) AND `TotalFailed` > 0 | `SendProcessStartedOn` |
| `Stuck` | `Sending` AND the campaign health check reports `WorkerTracking.IsStuck` | none (always every stuck campaign) |

A/B variation rows (`RelOriginalCampaignID` set) are excluded from every bucket. `admin.campaigns.overview` uses a different, unfiltered taxonomy and cannot drive the report sidebar; use `admin.campaigns.statuscounts` for that.

### Shared filter parameters

Every command in this group accepts these, with identical semantics to `admin.campaigns.search`:

| Parameter | Type | Required | Description |
|---|---|---|---|
| FilterByUserID | Integer | No | Only this account's campaigns. Empty = every account |
| DateFrom | String | No | `Y-m-d`. Applied on the bucket's date column (table above) |
| DateTo | String | No | `Y-m-d`. Must not be before DateFrom |
| SearchKeyword | String | No | Campaign name OR email subject `LIKE` match |
| SearchQuery | String | No | Advanced search DSL (`name:"Weekly" recipient_count>1000`, keys: `name`, `type`, `sent_at`, `created_at`, `recipient_count`, `total_recipients`, `open_rate`, `click_rate`, `conversion_rate`, `unsubscribe_rate`, `hardbounce_rate`, ...). Translated on the server and AND-ed with the other filters. The generated SQL is never returned |

Shared error codes: `1` invalid DateFrom, `2` invalid DateTo, `3` unknown Status, `4` invalid FilterByUserID, `5` SearchQuery could not be translated, `7` DateFrom after DateTo, `99999` the sub-admin lacks `Reports` (every command except `admin.campaigns.stuck`).

## List a Campaign Report Bucket

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.report`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege, checked in the handler)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.2
:::

One page of a report bucket: the table of the staff Campaign Report screen. The rows are the bucket's campaigns under the shared filters, with the owner, the rates, the average throughput and the health the screen shows per row. Rows of the `Stuck` bucket carry their `StuckReason`. Use this command rather than `admin.campaigns.search` to list a bucket: `admin.campaigns.search` filters raw `CampaignStatus` values and has no `Outbox`, `HasFailed` or `Stuck` bucket.

Each row is an allow-listed projection. Campaign content, `Options` and internal columns are never returned.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.campaigns.report` |
| AdminAPIKey | String | Yes | Admin API key |
| Status | String | No | A bucket from the table above. Default `Sent` |
| FilterByUserID | Integer | No | See shared filters |
| DateFrom | String | No | See shared filters |
| DateTo | String | No | See shared filters |
| SearchKeyword | String | No | See shared filters |
| SearchQuery | String | No | See shared filters |
| OrderField | String | No | `Started`, `Finished`, `Recipients`, `Delivered`, `Failed`, `CreateDateTime` or `SendDate`. Default is the bucket's own order. `Draft` (newest first) and `Scheduled` (soonest first) always keep their own order |
| OrderType | String | No | `ASC` or `DESC` (default) |
| RecordsFrom | Integer | No | Offset, default 0 |
| RecordsPerRequest | Integer | No | Page size, 10 to 100, default 25. A value outside the range is brought into it |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.report \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.report",
    "AdminAPIKey": "your-admin-api-key",
    "Status": "HasFailed",
    "DateFrom": "2026-10-01",
    "DateTo": "2026-10-18",
    "OrderField": "Failed",
    "RecordsPerRequest": 25
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Status": "HasFailed",
  "TotalCampaigns": 1,
  "RecordsFrom": 0,
  "RecordsPerRequest": 25,
  "OrderField": "TotalFailed",
  "OrderType": "DESC",
  "Campaigns": [
    {
      "CampaignID": 7746,
      "CampaignName": "Fall collection launch",
      "CampaignStatus": "Sent",
      "ScheduleType": "Immediate",
      "OwnerUserID": 20,
      "OwnerName": "Acme Inc",
      "OwnerEmailAddress": "ops@acme.example",
      "CreateDateTime": "2026-10-10 08:00:00",
      "LastActivityDateTime": "2026-10-13 06:21:40",
      "SendProcessStartedOn": "2026-10-13 06:00:01",
      "SendProcessFinishedOn": "2026-10-13 06:21:40",
      "SendDate": null,
      "SendTime": "",
      "SendTimeZone": "",
      "TotalRecipients": 38900,
      "TotalSent": 37620,
      "TotalDelivered": 37210,
      "TotalFailed": 1280,
      "UniqueOpens": 9050,
      "UniqueClicks": 1320,
      "TotalUnsubscriptions": 64,
      "TotalHardBounces": 410,
      "Rates": { "Open": 24.06, "Click": 3.51, "CTOR": 14.59, "Optout": 0.17, "Bounce": 1.05, "Progress": 96.71 },
      "Throughput": { "DurationSeconds": 1299, "EmailsPerSecond": 28.96 },
      "Health": {
        "OpenRate": "good", "ClickRate": "good", "BounceRate": "good", "UnsubscribeRate": "good",
        "HardBounceRatePercent": 1.1, "UnsubscribeRatePercent": 0.2, "EngagementScore": 6.8
      },
      "StuckReason": null,
      "CanRetryFailed": true
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
1: DateFrom is not a valid Y-m-d date
2: DateTo is not a valid Y-m-d date
3: Status is unknown
4: FilterByUserID is not a whole number (0 or empty = all accounts)
5: SearchQuery could not be translated
7: DateFrom is after DateTo
99999: Not enough privileges (sub-admin without Reports)
```

:::

Row fields:

- `OwnerName` is the owner's company, else first and last name, else `Unknown`.
- Dates are `Y-m-d H:i:s` (`SendDate` is `Y-m-d`) or `null` when empty. `SendTime` and `SendTimeZone` are the scheduled time and the time zone it is in.
- `Rates` are percentages with two decimals, or `null` when the denominator is zero: `Open` and `Click` over sent, `CTOR` clicks over opens, `Optout` unsubscriptions over sent, `Bounce` hard bounces over sent plus failed, `Progress` sent over recipients.
- `Throughput` is the average sending rate since the send started, or `null` for a campaign that has not started.
- `Health` holds one verdict per metric (`good`, `average`, `poor`, or `na` for the open rate of a plain-text campaign) under the `CAMPAIGN_HEALTH_*` thresholds, the hard bounce and unsubscribe rates, and the 0 to 10 engagement score.
- `CanRetryFailed` is `true` for a `Sent` or `Failed` campaign with failed recipients, the campaigns `admin.campaign.retryfailed` accepts.

## List Stuck Campaigns

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.stuck`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Lists campaigns that are in `Sending` status but whose health check (`Campaigns::CalculateCampaignHealth`, the same verdict `admin.campaign.details` returns under `Health.WorkerTracking.IsStuck`) reports them stuck. This is the "Stuck Campaigns" tab of the admin Campaign Report and the campaign counterpart of `admin.journeys.stuck`. The verdict is computed per campaign, so the result is filtered and then paginated. There is no date filter.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.campaigns.stuck` |
| AdminAPIKey | String | Yes | Admin API key |
| FilterByUserID | Integer | No | See shared filters (0 or empty = all accounts) |
| SearchKeyword | String | No | See shared filters |
| SearchQuery | String | No | See shared filters |
| DateFrom | Date | No | `Y-m-d`. Validated for symmetry with the other report commands but not applied: the stuck list has no date window |
| DateTo | Date | No | `Y-m-d`. Same as DateFrom |
| OrderField | String | No | `Started` (default), `Finished`, `Recipients`, `Delivered`, `Failed`, `CreateDateTime`, `SendDate` |
| OrderType | String | No | `ASC` or `DESC` (default) |
| RecordsPerRequest | Integer | No | Page size, 0 = all (default 0) |
| RecordsFrom | Integer | No | Offset (default 0) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.stuck \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.stuck",
    "AdminAPIKey": "your-admin-api-key",
    "RecordsPerRequest": 25
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalStuckCampaigns": 1,
  "Campaigns": [
    {
      "CampaignID": "812",
      "RelOwnerUserID": "14",
      "CampaignStatus": "Sending",
      "CampaignName": "September newsletter",
      "TotalRecipients": "52000",
      "TotalSent": "12400",
      "SendProcessStartedOn": "2026-09-04 08:00:02",
      "UserFirstName": "Ada",
      "UserLastName": "Lovelace",
      "UserEmailAddress": "ada@example.com",
      "UserCompany": "Analytical Engines",
      "StuckReason": "No worker activity for 35 minutes",
      "WorkerTracking": { "IsStuck": true, "StuckReason": "No worker activity for 35 minutes", "ActiveWorkers": 0 },
      "Health": { "Status": "Critical", "Note": "...", "Issues": [], "Warnings": [], "WorkerTracking": { "IsStuck": true } }
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "FilterByUserID must be a positive integer"
}
```

```txt [Error Codes]
0: Success
1: DateFrom is not a valid Y-m-d date
2: DateTo is not a valid Y-m-d date
4: FilterByUserID is not a whole number
5: SearchQuery could not be translated
7: DateFrom is after DateTo
```

:::

Each row carries every `oempro_campaigns` column plus the owner decoration and the health verdict. Feed `CampaignID` to `admin.campaign.unstuck`, `admin.campaign.markfailed` or `admin.campaign.details`.

## Get Campaign Report Status Counts

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.statuscounts`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege, checked in the handler since v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The nine sidebar counters of the admin Campaign Report, under the same filters as the listing. Composite buckets and per-bucket date columns are in the table above; `DateFields` in the response repeats the mapping so a client can label its date picker. `Stuck` requires the health check of every `Sending` campaign and ignores the date range.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.campaigns.statuscounts` |
| AdminAPIKey | String | Yes | Admin API key |
| FilterByUserID | Integer | No | See shared filters |
| DateFrom | String | No | See shared filters |
| DateTo | String | No | See shared filters |
| SearchKeyword | String | No | See shared filters |
| SearchQuery | String | No | See shared filters |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.statuscounts \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.statuscounts",
    "AdminAPIKey": "your-admin-api-key",
    "DateFrom": "2026-08-29",
    "DateTo": "2026-09-04"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "StatusCounts": {
    "Sent": 42, "Outbox": 1, "Draft": 7, "Scheduled": 3, "Paused": 0,
    "PendingApproval": 0, "Failed": 2, "HasFailed": 5, "Stuck": 0
  },
  "DateFields": {
    "Sent": "SendProcessStartedOn", "Outbox": "CreateDateTime", "Draft": "CreateDateTime",
    "Scheduled": "SendDate", "Paused": "SendProcessStartedOn", "PendingApproval": "CreateDateTime",
    "Failed": "SendProcessStartedOn", "HasFailed": "SendProcessStartedOn", "Stuck": null
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 7,
  "ErrorText": "DateFrom must not be after DateTo"
}
```

```txt [Error Codes]
0: Success
1: DateFrom is not a valid Y-m-d date
2: DateTo is not a valid Y-m-d date
4: FilterByUserID is not a whole number (0 or empty = all accounts)
5: SearchQuery could not be translated
7: DateFrom is after DateTo
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Get Campaign Report Time Series

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.timeseries`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege, checked in the handler since v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Per-day sums of `TotalRecipients` and `UniqueOpens` over the campaigns matching a status bucket and the filters, keyed on that bucket's date column (no `Status` = every status on `SendProcessStartedOn`). This is the chart on the admin Campaign Report. The window is `DateFrom`..`DateTo`, cut to the last 365 days ending on `DateTo`; with no dates it is the last 365 days ending today. Every day in the window is present, zero-filled, ascending. `Status=Stuck` is rejected (stuck is a per-campaign verdict, not an aggregate).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.campaigns.timeseries` |
| AdminAPIKey | String | Yes | Admin API key |
| Status | String | No | A bucket from the table above except `Stuck`. Empty = all statuses |
| FilterByUserID | Integer | No | See shared filters |
| DateFrom | String | No | See shared filters |
| DateTo | String | No | See shared filters |
| SearchKeyword | String | No | See shared filters |
| SearchQuery | String | No | See shared filters |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.timeseries \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.timeseries",
    "AdminAPIKey": "your-admin-api-key",
    "Status": "Sent",
    "DateFrom": "2026-09-01",
    "DateTo": "2026-09-03"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Status": "Sent",
  "DateField": "SendProcessStartedOn",
  "StartDate": "2026-09-01",
  "EndDate": "2026-09-03",
  "Days": 3,
  "Series": [
    { "Date": "2026-09-01", "TotalRecipients": 12000, "UniqueOpens": 3100 },
    { "Date": "2026-09-02", "TotalRecipients": 0, "UniqueOpens": 0 },
    { "Date": "2026-09-03", "TotalRecipients": 8400, "UniqueOpens": 1900 }
  ],
  "Totals": { "TotalRecipients": 20400, "UniqueOpens": 5000 }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Status=Stuck is not supported by the time series; use admin.campaigns.stuck"
}
```

```txt [Error Codes]
0: Success
1: DateFrom is not a valid Y-m-d date
2: DateTo is not a valid Y-m-d date
3: Status is unknown, or is Stuck
4: FilterByUserID is not a whole number (0 or empty = all accounts)
5: SearchQuery could not be translated
7: DateFrom is after DateTo
8: The time series query failed
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Export Campaign Report

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.export`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege, checked in the handler since v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The 19-column row set of the admin Campaign Report's CSV download, with the derived rates and the average throughput already computed, under the same filters as the other report commands. Rows are JSON objects by default; `Format=csv` returns one CSV string (header row included, no BOM) whose free-text cells are formula-protected (`Core::SanitizeCSVRow`, see `CSV_EXPORT_FORMULA_PROTECTION`). The result is capped at `CAMPAIGN_EXPORT_MAX_ROWS` (default 10000): when the filtered set is larger, the first `MaxRows` rows in sort order are returned and `Truncated` is `true`. Narrow the filters, or page through the bucket with `admin.campaigns.report`, for larger sets.

Columns: `CampaignID`, `CampaignName`, `UserID`, `UserName` (company, else first and last name, else `Unknown`), `Status` (raw `CampaignStatus`), `Started`, `Finished` (`Y-m-d H:i:s` or `N/A`), `Recipients`, `Sent`, `Delivered`, `Failed`, `OpenRate` (UniqueOpens / Sent), `ClickRate` (UniqueClicks / Sent), `CTOR` (UniqueClicks / UniqueOpens), `OptoutRate` (Unsubscriptions / Sent), `BounceRate` (HardBounces / (Sent + Failed)), `Progress` (Sent / Recipients), `Duration` (seconds), `Speed` (emails per second). Rates are strings with two decimals and a `%` sign, or `N/A` when the denominator is zero (`Progress` is `0%`). `Duration` and `Speed` are empty for statuses without a send window (`Campaigns::CalculateThroughput`).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.campaigns.export` |
| AdminAPIKey | String | Yes | Admin API key |
| Status | String | No | A bucket from the table above. Default `Sent` |
| FilterByUserID | Integer | No | See shared filters |
| DateFrom | String | No | See shared filters |
| DateTo | String | No | See shared filters |
| SearchKeyword | String | No | See shared filters |
| SearchQuery | String | No | See shared filters |
| OrderField | String | No | As `admin.campaigns.stuck`. Default is the bucket's own order (Draft: CreateDateTime DESC, Scheduled: SendDate ASC, others: SendProcessStartedOn DESC) |
| OrderType | String | No | `ASC` or `DESC` |
| Format | String | No | `json` (default) or `csv` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.export \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.export",
    "AdminAPIKey": "your-admin-api-key",
    "Status": "Sent",
    "DateFrom": "2026-08-01",
    "DateTo": "2026-08-31"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Status": "Sent",
  "Columns": ["CampaignID", "CampaignName", "UserID", "UserName", "Status", "Started", "Finished", "Recipients", "Sent", "Delivered", "Failed", "OpenRate", "ClickRate", "CTOR", "OptoutRate", "BounceRate", "Progress", "Duration", "Speed"],
  "TotalRows": 1,
  "TotalCampaigns": 1,
  "MaxRows": 10000,
  "Truncated": false,
  "Rows": [
    {
      "CampaignID": 7746, "CampaignName": "August promotion", "UserID": 20, "UserName": "Acme Inc",
      "Status": "Sent", "Started": "2026-08-30 06:00:01", "Finished": "2026-08-30 06:04:39",
      "Recipients": 59157, "Sent": 59154, "Delivered": 58900, "Failed": 3,
      "OpenRate": "24.10%", "ClickRate": "3.02%", "CTOR": "12.53%", "OptoutRate": "0.11%", "BounceRate": "0.40%",
      "Progress": "99.99%", "Duration": 278, "Speed": 212.78
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 6,
  "ErrorText": "Format must be json or csv"
}
```

```txt [Error Codes]
0: Success
1: DateFrom is not a valid Y-m-d date
2: DateTo is not a valid Y-m-d date
3: Status is unknown
4: FilterByUserID is not a whole number (0 or empty = all accounts)
5: SearchQuery could not be translated
6: Format is not json or csv
7: DateFrom is after DateTo
99999: Not enough privileges (sub-admin without Reports)
```

:::

With `Format=csv` the response carries `CSV` (the file contents as a string) and `Filename` (`campaign_report_YYYY-MM-DD_HH-MM-SS.csv`) instead of `Rows`.

## Get Dashboard Overview

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Dashboard` privilege)
- Rate limit: 100 requests per 60 seconds
- Read-only. `Days` is optional
:::

Returns the aggregates the admin Dashboard shows: the total number of user accounts and three top-10 leaderboards, accounts by campaign count (each with its list count), by bounce records and by feedback-loop (spam complaint) reports. Leaderboards are sorted by their count descending; accounts that no longer exist are not listed.

Two dashboard blocks are deliberately not part of this command because they already have one: campaigns pending approval come from `admin.campaigns.search` with `CampaignStatus=Pending Approval`, and online users from `users.get` with `RelUserGroupID=Online`. The two charts have their own commands, `admin.delivery.history` and `admin.delivery.forecast`.

**Windowed leaderboards.** Send `Days` (7, 30 or 90) to count only the last `Days` days: campaigns by the time they were created, bounces by the time they were recorded, spam complaints by the time they were received. `TotalLists` and `TotalUsers` stay current counts. The windowed response adds `Days`, `StartDate` (start of the window), `GeneratedAt` (when the figures were computed) and `FromCache`. Windowed results are cached for 300 seconds per window and per administrator reach: administrators with the same user group limits share an entry, and an administrator limited to some user groups never receives a result computed for another reach. Without `Days` the response is the all-time one, computed on every call, exactly as before.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.overview.get` |
| AdminAPIKey | String | Yes | Admin API key |
| Days | Integer | No | `7`, `30` or `90`. Counts the leaderboards over that many days and caches the result for 300 seconds. Any other value is refused with error code 1. An empty value is treated as absent. Added in v6.0.2 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=admin.overview.get" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "TotalUsers": 113,
  "TopUsersLimit": 10,
  "Scoped": false,
  "TopUsersByCampaigns": [
    { "UserID": 21, "FirstName": "Acme", "LastName": "Newsletters", "EmailAddress": "ops@acme.example", "TotalCampaigns": 834, "TotalLists": 5 }
  ],
  "TopUsersByBounces": [
    { "UserID": 21, "FirstName": "Acme", "LastName": "Newsletters", "EmailAddress": "ops@acme.example", "TotalBounces": 88 }
  ],
  "TopUsersByComplaints": [
    { "UserID": 7, "FirstName": "Jane", "LastName": "Doe", "EmailAddress": "jane@example.com", "TotalComplaints": 2 }
  ]
}
```

```json [Success Response (Days=30)]
{
  "Success": true,
  "TotalUsers": 113,
  "TopUsersLimit": 10,
  "Scoped": false,
  "TopUsersByCampaigns": [
    { "UserID": 21, "FirstName": "Acme", "LastName": "Newsletters", "EmailAddress": "ops@acme.example", "TotalCampaigns": 12, "TotalLists": 5 }
  ],
  "TopUsersByBounces": [
    { "UserID": 21, "FirstName": "Acme", "LastName": "Newsletters", "EmailAddress": "ops@acme.example", "TotalBounces": 9 }
  ],
  "TopUsersByComplaints": [],
  "Days": 30,
  "StartDate": "2026-09-17 10:00:00",
  "GeneratedAt": "2026-10-17 10:00:00",
  "FromCache": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
1: Days must be 7, 30 or 90
99998: Authentication failed
99999: Not enough privileges (sub-admin without Dashboard)
```

:::

## Get Delivery History

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Dashboard` privilege)
- Rate limit: 100 requests per 60 seconds
- Returns exactly `Days` points, zero-filled
:::

The Dashboard's delivery history chart as data: one point per day with the total emails sent (`SUM(TotalSent)`) by campaigns in status `Sent`, keyed on the day the send started. The window is `Days` days **ending yesterday**; the current, partial day is excluded, which is what the Dashboard chart has always shown. `StartDate` and `EndDate` give the exact window.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.delivery.history` |
| AdminAPIKey | String | Yes | Admin API key |
| Days | Integer | No | Window length in days, default 30. Values below 1 become 1 and values above 365 become 365. A non-integer is rejected with error 1 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=admin.delivery.history" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "Days=7" \
  --data-urlencode "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "Days": 7,
  "StartDate": "2026-08-28",
  "EndDate": "2026-09-03",
  "Scoped": false,
  "Series": [
    { "Date": "2026-08-28", "TotalSent": 59154 },
    { "Date": "2026-08-29", "TotalSent": 0 },
    { "Date": "2026-08-30", "TotalSent": 0 },
    { "Date": "2026-08-31", "TotalSent": 12400 },
    { "Date": "2026-09-01", "TotalSent": 0 },
    { "Date": "2026-09-02", "TotalSent": 0 },
    { "Date": "2026-09-03", "TotalSent": 3010 }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Days must be an integer"
}
```

```txt [Error Codes]
1: Days is not an integer
99998: Authentication failed
99999: Not enough privileges (sub-admin without Dashboard)
```

:::

## Get Delivery Forecast

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Dashboard` privilege)
- Rate limit: 100 requests per 60 seconds
- Served from a 300-second cache shared with the Dashboard and the forecast cron; `FromCache` and `GeneratedAt` say which copy you got
:::

The Dashboard's delivery forecast as data, with the per-campaign rows the chart only sums: for today and the next seven days (always 8 entries), every campaign scheduled for that day (`ScheduleType` Future) with its estimated recipient count (`Campaigns::EstimatedCampaignRecipients`, the active subscribers of the campaign's recipient lists and segments at the time the forecast was built), plus per-day totals.

The forecast is recomputed at most every 300 seconds. The cron `plugin_campaign_forecast_calculator` refreshes it, the Dashboard reads it, and this command reads the same cached copy, so all three agree. A cache miss rebuilds it inline. A restricted sub-admin receives the cached forecast filtered to campaigns of accounts in their allowed groups, with the totals recomputed.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.delivery.forecast` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=admin.delivery.forecast" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "GeneratedAt": "2026-09-04 10:15:02",
  "FromCache": true,
  "CacheTTL": 300,
  "Scoped": false,
  "Days": [
    {
      "Date": "2026-09-04",
      "TotalCampaigns": 2,
      "TotalEstimatedRecipients": 51200,
      "Campaigns": [
        { "CampaignID": 91, "CampaignName": "September promo", "RelOwnerUserID": 3, "EstimatedRecipients": 50000 },
        { "CampaignID": 94, "CampaignName": "Welcome batch", "RelOwnerUserID": 8, "EstimatedRecipients": 1200 }
      ]
    },
    { "Date": "2026-09-05", "TotalCampaigns": 0, "TotalEstimatedRecipients": 0, "Campaigns": [] }
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
99998: Authentication failed
99999: Not enough privileges (sub-admin without Dashboard)
```

:::

## Get Live Sending View

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
- Rate limit: 100 requests per 60 seconds
- Throughput here is batch-derived and is NOT the same figure as `admin.campaigns.search` with `IncludeVelocity`
:::

Everything the admin Live view shows, as data: campaigns currently in status `Sending` or `Paused` (`SendingCampaigns`), campaigns in status `Sent` or `Failed` whose delivery batches have completed (`SentCampaigns`), both restricted to campaigns whose send started within the last `TimeFrame` days, and the "at a glance" tiles (`GlanceMetrics`).

Throughput per campaign (`EmailsPerSecond`, `EmailsPerHour`, `ProcessDurationInSeconds`, `TotalProcessedEmails`, `BatchCount`) is derived from the campaign's delivery batches: the emails processed divided by the wall-clock span from the earliest batch start to the latest batch finish. `admin.campaigns.search` with `IncludeVelocity=true` measures a rolling 60-second queue window instead; the two definitions answer different questions and will not agree. The six rates are percentages of `TotalSent`. Campaigns with no delivery batches yet are not listed.

`GlanceMetrics` are the screen's tiles: `TotalRecipients` summed over the listed campaigns, distinct `UserCount`, `CampaignCount`, and the plain (unweighted) means of throughput, open rate and click rate across every listed campaign. On an idle window every average is 0.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.live.sending` |
| AdminAPIKey | String | Yes | Admin API key |
| TimeFrame | Integer | No | `1` (default), `7` or `30` days; anything else is rejected with error 1. Campaigns whose send started at or after midnight `TimeFrame` days ago are included (`StartFrom` in the response) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=admin.live.sending" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "TimeFrame=7" \
  --data-urlencode "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "TimeFrame": 7,
  "StartFrom": "2026-08-28 00:00:00",
  "Scoped": false,
  "SendingCampaigns": [
    {
      "UserID": 21, "Name": "Acme Newsletters", "EmailAddress": "ops@acme.example",
      "CampaignStatus": "Sending", "CampaignName": "September promo", "SendProcessStartedOn": "2026-09-04 09:00:04",
      "CampaignID": 7758, "TotalProcessedEmails": 12000, "StartedEarliestBy": "2026-09-04 09:00:07",
      "FinishedLatestBy": "2026-09-04 09:04:17", "ProcessDurationInSeconds": 250, "EmailsPerSecond": 48,
      "EmailsPerHour": 172800, "BatchCount": 120, "TotalRecipients": 59157, "TotalSent": 12000, "TotalFailed": 3,
      "UniqueOpens": 240, "OpenRate": 2, "UniqueClicks": 12, "ClickRate": 0.1, "UniqueConversions": 0,
      "ConversionRate": 0, "TotalUnsubscriptions": 1, "UnsubscriptionRate": 0.01, "TotalHardBounces": 0, "HardBounceRate": 0
    }
  ],
  "SentCampaigns": [],
  "GlanceMetrics": {
    "TotalRecipients": 59157, "UserCount": 1, "CampaignCount": 1,
    "AvgThroughputSec": 48, "AvgThroughputHour": 172800, "AvgOpenRate": 2, "AvgClickRate": 0.1
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "TimeFrame must be one of 1, 7, 30"
}
```

```txt [Error Codes]
1: TimeFrame is not one of 1, 7, 30
99998: Authentication failed
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Get System Wide Delivery Metrics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
- Rate limit: 100 requests per 60 seconds
- Platform-wide aggregates; this is a full scan of the campaigns table per call, so cache the result on your side rather than polling
:::

The admin System Wide Delivery Metrics report as data: campaign aggregates per period, newest first, over campaigns in status `Sent`, `Paused`, `Sending` or `Failed`, grouped on the day the send started. Each row carries the report's 12 columns.

| Column | Meaning |
|---|---|
| Period | `Y-m-d` (Daily), `Y-<ISO week number>` (Weekly, MySQL `%u`), `Y-m` (Monthly), `Y` (Yearly) |
| TotalUsers | Distinct accounts that sent in the period |
| TotalCampaigns | Campaigns that started sending in the period |
| TotalRecipients, TotalSent, TotalFailed | Sums over those campaigns |
| UniqueOpens, UniqueClicks, OptOuts, HardBounces | Sums over those campaigns |
| OpenRate | `UniqueOpens / TotalSent`, percent, 2 decimals |
| ClickRate | `UniqueClicks / UniqueOpens`, percent, 2 decimals. This is the report's definition (a click-to-open rate), not clicks over sends |

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.delivery.metrics` |
| AdminAPIKey | String | Yes | Admin API key |
| Period | String | Yes | `Daily`, `Weekly`, `Monthly` or `Yearly` (case-insensitive) |
| Limit | Integer | No | Number of most recent periods to return, default 12. Values below 1 become 1 and values above 120 become 120 (the admin screen always shows 120). A non-integer is rejected with error 2 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=admin.delivery.metrics" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "Period=Monthly" \
  --data-urlencode "Limit=3" \
  --data-urlencode "ResponseFormat=JSON"
```

```json [Success Response]
{
  "Success": true,
  "Period": "Monthly",
  "Limit": 3,
  "Scoped": false,
  "Metrics": [
    { "Period": "2026-09", "TotalUsers": 14, "TotalCampaigns": 88, "TotalRecipients": 910000, "TotalSent": 905000, "TotalFailed": 5000, "UniqueOpens": 190000, "UniqueClicks": 21000, "OptOuts": 800, "HardBounces": 1200, "OpenRate": 20.99, "ClickRate": 11.05 },
    { "Period": "2026-08", "TotalUsers": 12, "TotalCampaigns": 71, "TotalRecipients": 640000, "TotalSent": 638100, "TotalFailed": 1900, "UniqueOpens": 150300, "UniqueClicks": 14020, "OptOuts": 610, "HardBounces": 900, "OpenRate": 23.55, "ClickRate": 9.33 },
    { "Period": "2026-07", "TotalUsers": 1, "TotalCampaigns": 1, "TotalRecipients": 59157, "TotalSent": 59154, "TotalFailed": 3, "UniqueOpens": 0, "UniqueClicks": 0, "OptOuts": 0, "HardBounces": 0, "OpenRate": 0, "ClickRate": 0 }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Period must be one of Daily, Weekly, Monthly, Yearly"
}
```

```txt [Error Codes]
1: Period missing or not one of Daily, Weekly, Monthly, Yearly
2: Limit is not an integer
99998: Authentication failed
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Get Delivery Server KPI Dashboard

<Badge type="info" text="POST" /> `/api/v1/admin.deliveryserver.kpi`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `DeliveryServers` privilege, the same one the admin Delivery Servers Reports screen checks)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The KPI dashboard of the admin Delivery Servers Reports screen as data: the totals of every campaign that started sending inside a time frame, the same totals for the preceding comparison window, the period-over-period change in percent, a per-recipient-domain (ESP) roll-up and a per-delivery-server breakdown of unique opens, clicks, conversions, unsubscriptions and bounces.

The result is cached in Redis under the same entry the screen uses (`admin_delivery_report_kpi_<TimeFrame>`), with a TTL that depends on the time frame: 10 seconds for `today` and `yesterday`, 10 minutes for `last7days`, 30 minutes for `last14days`, 1 hour for `last28days`, `thismonth` and `lastmonth`, 2 hours for `last3months`, 24 hours for `thisyear` and `lastyear`. `CacheHit` and `CacheTTLSeconds` tell you whether you were served from the cache and for how long it stays valid. A failed computation is never cached and never returned as zeros; it answers ErrorCode 2. A first call on a long time frame can take a while: the breakdown runs a set of statistics subqueries per campaign, delivery server and recipient domain.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.deliveryserver.kpi` |
| AdminAPIKey | String | Yes | Admin API key |
| TimeFrame | String | No | `today` (default), `yesterday`, `last7days`, `last14days`, `last28days`, `thismonth`, `lastmonth`, `last3months`, `thisyear`, `lastyear` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.deliveryserver.kpi \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.deliveryserver.kpi",
    "AdminAPIKey": "your-admin-api-key",
    "TimeFrame": "last7days"
  }'
```

```json [Success Response]
{
  "Success": true,
  "TimeFrame": "last7days",
  "TimeFrameBeginsAt": "2026-08-28 00:00:00",
  "TimeFrameEndsAt": "2026-09-04 23:59:59",
  "CompareTimeFrameBeginsAt": "2026-08-21 00:00:00",
  "CompareTimeFrameEndsAt": "2026-08-27 23:59:59",
  "Totals": {
    "TotalRecipients": 184220,
    "TotalSent": 183901,
    "TotalUniqueOpens": 61204,
    "TotalUniqueClicks": 9110,
    "OpenRate": 33,
    "DeliveredToClickRate": 5,
    "OpenedToClickRate": 15
  },
  "Compare": {
    "TotalRecipients": 160010,
    "TotalSent": 159700,
    "TotalUniqueOpens": 50120,
    "TotalUniqueClicks": 8002,
    "DeliveredToClickRate": 5,
    "OpenedToClickRate": 16
  },
  "Change": {
    "TotalRecipients": 15.13,
    "UniqueOpens": 22.11,
    "DeliveredToClickRate": 0,
    "OpenedToClickRate": -6.25
  },
  "DeliveryServers": {
    "1": {"DeliveryServerID": 1, "Name": "Primary MTA"}
  },
  "ESPDomainStats": {
    "gmail.com": {
      "TotalQueued": 90112,
      "UniqueOpens": 30871,
      "UniqueClicks": 4410,
      "UniqueConversions": 12,
      "UniqueUnsubscriptions": 88,
      "UniqueBounces": 140,
      "DeliveryServerIDs": [1]
    }
  },
  "ESPDomainTotalQueued": {"gmail.com": 90112},
  "DeliveryServerStats": {
    "1": {
      "gmail.com": {
        "TotalQueued": 90112,
        "UniqueOpens": 30871,
        "UniqueClicks": 4410,
        "UniqueConversions": 12,
        "UniqueUnsubscriptions": 88,
        "UniqueBounces": 140
      }
    }
  },
  "CacheHit": false,
  "CacheTTLSeconds": 600,
  "Scoped": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Invalid TimeFrame. Accepted values: today, yesterday, last7days, last14days, last28days, thismonth, lastmonth, last3months, thisyear, lastyear"
}
```

```txt [Error Codes]
1: TimeFrame is not one of the ten accepted values
2: The campaign roll-up failed (see the application log). A response of zeros would be
   indistinguishable from a genuinely idle window, so the call is refused instead
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

`Totals.OpenRate`, `Totals.DeliveredToClickRate` and `Totals.OpenedToClickRate` are whole-number percentages of `TotalSent` (or of `TotalUniqueOpens` for the opened-to-click rate). The `Change` figures are percentages relative to the comparison window; when the comparison figure is 0 the change is reported as 0, never as an infinite value. `DeliveryServerStats` is keyed by delivery server id, then by recipient domain; only the five most-queued domains per campaign and server are included. `DeliveryServers` carries ids and names only, never connection parameters.

## Get Delivery Server Performance Matrix

<Badge type="info" text="POST" /> `/api/v1/admin.deliveryserver.performance`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `DeliveryServers` privilege, the same one the admin Delivery Servers Reports screen checks)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The performance matrix of the admin Delivery Servers Reports screen: for each chosen account, its last 20 sent, paused or failed campaigns (returned in `Campaigns` so a client can offer them for selection); for each chosen campaign, the delivery servers it was queued on; for each server, the five most-queued recipient domains with unique opens, clicks, conversions, unsubscriptions and bounces, with the remaining domains folded into an `Other` entry.

Every (campaign, delivery server, domain) tuple costs a block of statistics subqueries, so `Limit` caps how many blocks one call executes. When the cap is reached the response carries `Truncated: true` and `TupleCount` equals `Limit`; narrow the selection with `CampaignIDs`, `DeliveryServerIDs` or `ESPs`, or raise `Limit` (at most 1000).

When `UserIDs` is empty the command applies the screen's default selection, the owners and ids of the five most recently started campaigns of the last seven days, and reports `DefaultSelectionApplied: true`. Pass `IgnoreDefaultSelections=true` to get an empty matrix instead.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.deliveryserver.performance` |
| AdminAPIKey | String | Yes | Admin API key |
| UserIDs | String | No | Comma-separated account ids to expand. Empty = the default selection (see above) |
| CampaignIDs | String | No | Comma-separated campaign ids to expand. A campaign is only expanded when its owner is in `UserIDs` |
| DeliveryServerIDs | String | No | Comma-separated delivery server ids to keep. Empty = all |
| ESPs | String | No | Comma-separated recipient domains to keep (case-insensitive). Empty = all |
| IgnoreDefaultSelections | Boolean | No | `true` = never apply the default selection when `UserIDs` is empty |
| Limit | Integer | No | Maximum number of (campaign, delivery server, domain) tuples computed. Default 100, clamped to [1, 1000] |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.deliveryserver.performance \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.deliveryserver.performance",
    "AdminAPIKey": "your-admin-api-key",
    "UserIDs": "12",
    "CampaignIDs": "7746",
    "Limit": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ChosenUsers": [12],
  "ChosenCampaigns": [7746],
  "ChosenDeliveryServers": [],
  "ChosenESPs": [],
  "DefaultSelectionApplied": false,
  "Users": [
    {"UserID": 12, "RelUserGroupID": 2, "Username": "acme", "EmailAddress": "ops@acme.example", "FirstName": "Ada", "LastName": "Lovelace", "CompanyName": "Acme", "AccountStatus": "Enabled", "UserSince": "2024-02-01 10:00:00", "GroupName": "Pro"}
  ],
  "Campaigns": [
    {"CampaignID": 7746, "CampaignName": "September newsletter", "RelOwnerUserID": 12}
  ],
  "ESPs": {"gmail.com": 36789, "yahoo.com": 8102},
  "Matrix": [
    {
      "UserID": 12,
      "CampaignID": 7746,
      "CampaignName": "September newsletter",
      "CampaignStatus": "Sent",
      "SendProcessStartedOn": "2026-09-01 09:00:00",
      "TotalProcessedEmails": "57637",
      "StartedEarliestBy": "2026-09-01 09:00:02",
      "FinishedLatestBy": "2026-09-01 09:41:10",
      "ProcessDurationInSeconds": "2468",
      "EmailsPerSecond": "23",
      "EmailsPerHour": "84072",
      "BatchCount": "527",
      "TotalRecipients": "57637",
      "TotalSent": "57402",
      "TotalFailed": "235",
      "UniqueOpens": "18220",
      "OpenRate": "31.74",
      "UniqueClicks": "2710",
      "ClickRate": "4.72",
      "UniqueConversions": "0",
      "ConversionRate": "0.00",
      "TotalUnsubscriptions": "41",
      "UnsubscriptionRate": "0.07",
      "TotalHardBounces": "90",
      "HardBounceRate": "0.16",
      "DeliveryServers": [
        {
          "DeliveryServerID": 1,
          "Name": "Primary MTA",
          "Domains": [
            {"Domain": "gmail.com", "TotalQueued": 36789, "UniqueOpens": 12005, "UniqueClicks": 1840, "UniqueConversions": 0, "UniqueUnsubscriptions": 20, "UniqueBounces": 31}
          ],
          "Other": {"TotalQueued": 9120, "UniqueOpens": 2100, "UniqueClicks": 300, "UniqueConversions": 0, "UniqueUnsubscriptions": 9, "UniqueBounces": 22}
        }
      ]
    }
  ],
  "Limit": 50,
  "TupleCount": 5,
  "Truncated": false,
  "UsersOutOfScope": [],
  "Scoped": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

`Other` is `null` when every queued domain of that server fits in the top five. Its opens, clicks and the rest are the campaign totals minus the top-five totals, so they are the screen's arithmetic, not a separate count. `UsersOutOfScope` lists the ids a restricted sub-admin asked for but may not see; they are skipped, not an error. Ids in `UserIDs`, `CampaignIDs` and `DeliveryServerIDs` that are not positive integers are ignored.

## Get List Freshness Report

<Badge type="info" text="POST" /> `/api/v1/admin.lists.freshness`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Reports`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy List Freshness screen did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The admin List Freshness report: every account that owns at least one list, with the number of days since its most recent subscription or import across all its lists (`BestFreshnessDays`), the list count, the most recent activity date, the active subscriber total and a freshness status. The status comes from the `ListFreshnessThresholds` option (days: `Active`, `SlowingDown`, `Stale`), which you read and write through `settings.get` and `settings.update`:

| Status | Rule |
|---|---|
| `Active` | `BestFreshnessDays` at most `Active` |
| `Slowing Down` | at most `SlowingDown` |
| `Stale` | at most `Stale` |
| `Dead` | more than `Stale` |
| `No Data` | no list of the account has any subscription or import history |

The rows are cached for 60 seconds (the same cache the staff [List freshness report](/v6.0.3/new-user-interface/staff-list-freshness) uses), and `CacheHit` is `true` when this answer came from that cache. The classification is applied after the cache, so a threshold change shows immediately.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.lists.freshness` |
| AdminAPIKey | String | Yes | Admin API key |
| OrderField | String | No | `WorstFreshness` (default), `User`, `TotalLists`, `LastActivity`. Any other value is refused |
| OrderType | String | No | `ASC` or `DESC` (default) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.lists.freshness \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.lists.freshness",
    "AdminAPIKey": "your-admin-api-key",
    "OrderField": "LastActivity",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "OrderField": "LastActivity",
  "OrderType": "DESC",
  "Thresholds": {"Active": 14, "SlowingDown": 45, "Stale": 90},
  "StatusCounts": {"Active": 3, "Slowing Down": 1, "Stale": 0, "Dead": 4, "No Data": 2},
  "TotalUsers": 10,
  "Users": [
    {
      "UserID": 12,
      "Username": "acme",
      "FirstName": "Ada",
      "LastName": "Lovelace",
      "CompanyName": "Acme",
      "RelUserGroupID": 2,
      "RelUserCategoryID": 1,
      "CategoryName": "Agencies",
      "TotalLists": 4,
      "ActiveSubscribers": 58210,
      "BestFreshnessDays": 2,
      "MostRecentActivity": "2026-09-02",
      "FreshnessStatus": "Active"
    }
  ],
  "CacheHit": false,
  "Scoped": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Invalid OrderField. Accepted values: WorstFreshness, User, TotalLists, LastActivity"
}
```

```txt [Error Codes]
1: OrderField is not in the allow-list
2: OrderType is not ASC or DESC
3: The report query failed (see the application log)
99998: Authentication failure or session expired
99999: Not enough privileges (the caller lacks Reports)
```

:::

`BestFreshnessDays` and `MostRecentActivity` are `null` for a `No Data` account. When sorting by `WorstFreshness`, `No Data` accounts sort first on `DESC` and last on `ASC`, as on the screen. `ActiveSubscribers` is the sum of the denormalized per-list active counts, with a live count only for lists that have never been counted.

## Get List Freshness Detail

<Badge type="info" text="POST" /> `/api/v1/admin.lists.freshness.detail`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Reports`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy List Freshness screen did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Per-list freshness for one account: every list with its last subscription or import date, the days since, the 90-day subscription, import and unsubscription totals, the active subscriber count, the freshness status (same rules as `admin.lists.freshness`) and a 90-point `DailyGrowth` series (subscriptions plus imports per day, oldest first, ending today), which the staff List freshness report draws as the 90-day trend. `OverallStatus` is the status of the account's freshest list, `No Data` only when no list has any history. Cached 60 seconds per account.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.lists.freshness.detail` |
| AdminAPIKey | String | Yes | Admin API key |
| UserID | Integer | Yes | The account |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.lists.freshness.detail \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.lists.freshness.detail",
    "AdminAPIKey": "your-admin-api-key",
    "UserID": 12
  }'
```

```json [Success Response]
{
  "Success": true,
  "User": {"UserID": 12, "RelUserGroupID": 2, "Username": "acme", "EmailAddress": "ops@acme.example", "FirstName": "Ada", "LastName": "Lovelace", "CompanyName": "Acme", "AccountStatus": "Enabled", "UserSince": "2024-02-01 10:00:00", "GroupName": "Pro"},
  "OverallStatus": "Active",
  "Thresholds": {"Active": 14, "SlowingDown": 45, "Stale": 90},
  "StatusCounts": {"Active": 1, "Slowing Down": 0, "Stale": 0, "Dead": 1, "No Data": 0},
  "SparklineDays": 90,
  "TotalLists": 2,
  "Lists": [
    {
      "ListID": 301,
      "ListName": "Newsletter",
      "CreatedOn": "2024-02-01 10:05:00",
      "ActiveSubscribers": 58210,
      "LastActivityDate": "2026-09-02",
      "DaysSinceActivity": 2,
      "RecentSubscriptions": 1204,
      "RecentImports": 0,
      "RecentUnsubscriptions": 31,
      "FreshnessStatus": "Active",
      "DailyGrowth": [0, 0, 12, 40, 9]
    }
  ],
  "CacheHit": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "User not found"
}
```

```txt [Error Codes]
1: UserID is missing or not a positive integer
2: The account does not exist (or, for a restricted sub-admin, is outside the allowed user groups)
99998: Authentication failure or session expired
99999: Not enough privileges (the caller lacks Reports)
```

:::

The `DailyGrowth` example is shortened; the real array always has exactly `SparklineDays` (90) integers.

## Get Revenue Summary

<Badge type="info" text="POST" /> `/api/v1/admin.revenue.summary`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The admin Payment Reports screen as data. Revenue is the sum of `TotalAmount` over the payment log plus `NetAmount` over paid credit purchases, in `Currency` (the install's `PAYMENT_CURRENCY`). The response holds this month against last month, the all-time total split into paid and not paid, this month's highest payment period, the five accounts with the highest all-time revenue and every account with an unpaid balance.

Ratios are always finite: a month with no revenue gives `RevenueDifferenceRatio` 0, and an empty payment log gives 0 for both `TotalPaidRevenueRatio` and `TotalNotPaidRevenueRatio`.

Aggregates are install-wide. For a restricted sub-admin the three per-account lists are filtered to the allowed user groups and `Scoped` is `true`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.revenue.summary` |
| AdminAPIKey | String | Yes | Admin API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.revenue.summary \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.revenue.summary",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Currency": "USD",
  "Month": "2026-09",
  "PreviousMonth": "2026-08",
  "CurrentMonthRevenue": 4120.5,
  "PreviousMonthRevenue": 3980,
  "RevenueDifference": 140.5,
  "RevenueDifferenceRatio": 3.41,
  "TotalRevenue": 187650.75,
  "TotalPaidRevenue": 171200.75,
  "TotalNotPaidRevenue": 16450,
  "TotalPaidRevenueRatio": 91,
  "TotalNotPaidRevenueRatio": 9,
  "TopUserThisMonth": {
    "User": {"UserID": 12, "RelUserGroupID": 2, "Username": "acme", "EmailAddress": "ops@acme.example", "FirstName": "Ada", "LastName": "Lovelace", "CompanyName": "Acme", "AccountStatus": "Enabled", "UserSince": "2024-02-01 10:00:00", "GroupName": "Pro"},
    "TotalAmount": 1290,
    "PeriodStartDate": "2026-09-01",
    "PeriodEndDate": "2026-09-30",
    "PaymentStatus": "Paid"
  },
  "AllTimeTopUsers": [
    {"User": {"UserID": 12, "FirstName": "Ada", "LastName": "Lovelace", "GroupName": "Pro"}, "AllTimeTotalAmount": 40210}
  ],
  "AllTimeReceivables": [
    {"User": {"UserID": 31, "FirstName": "Grace", "LastName": "Hopper", "GroupName": "Starter"}, "ReceivableAmount": 980}
  ],
  "Scoped": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

`RevenueDifferenceRatio` is `RevenueDifference` as a percentage of `CurrentMonthRevenue`, rounded to two decimals (the screen rounds it to a whole number). `TopUserThisMonth` is `null` when no payment period ends in the current month. The `User` objects in the example lists are shortened; every one carries the same fields as `TopUserThisMonth.User`, and never a password, API key or two-factor secret.

## Get Revenue Series

<Badge type="info" text="POST" /> `/api/v1/admin.revenue.series`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Monthly revenue (payment log `TotalAmount` plus paid credit purchases `NetAmount`) for a range of calendar months, one point per month with 0 where nothing was billed. This is the source of the revenue chart on the Payment Reports screen. The range is capped at 36 months: a longer range is cut to the 36 months ending at `To` and `Capped` is `true`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.revenue.series` |
| AdminAPIKey | String | Yes | Admin API key |
| From | String | No | First month, `YYYY-MM`. Default: twelve months before `To` (13 points) |
| To | String | No | Last month, `YYYY-MM`. Default: the current month |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.revenue.series \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.revenue.series",
    "AdminAPIKey": "your-admin-api-key",
    "From": "2026-01",
    "To": "2026-03"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Currency": "USD",
  "From": "2026-01",
  "To": "2026-03",
  "Months": 3,
  "MaxMonths": 36,
  "Capped": false,
  "Series": [
    {"Month": "2026-01", "TotalAmount": 3900},
    {"Month": "2026-02", "TotalAmount": 4015.25},
    {"Month": "2026-03", "TotalAmount": 0}
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "From must not be after To"
}
```

```txt [Error Codes]
1: From is not YYYY-MM
2: To is not YYYY-MM
3: From is after To
99998: Authentication failure or session expired
99999: Not enough privileges
```

:::

## Get Email

<Badge type="info" text="GET" /> `/api/v1/admin.email.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- v1 REST alias: `GET /api/v1/admin.email.get`. Legacy access via `/api.php` is also supported
:::

Retrieves complete email information for admin users without user restrictions. This allows administrators to view email details from any account, useful for debugging and cross-account support.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                          |
|-----------|---------|----------|--------------------------------------|
| Command   | String  | Yes      | API command: `admin.email.get`       |
| SessionID | String  | No       | Session ID obtained from login       |
| APIKey    | String  | No       | API key for authentication           |
| EmailID   | Integer | Yes      | Email ID to retrieve                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.email.get",
    "APIKey": "your-admin-api-key",
    "EmailID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailInformation": {
    "EmailID": 123,
    "EmailName": "Weekly Newsletter Template",
    "Subject": "Your Weekly Update",
    "HTMLContent": "<html>...</html>",
    "TextContent": "Plain text version...",
    "RelOwnerUserID": 5,
    "CreatedOn": "2025-11-10 14:00:00",
    "UpdatedOn": "2025-11-10 15:30:00",
    "EmailStatus": "Active"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
0: Success
emailid: Missing required parameter emailid
2: Email not found
```

:::

## Search Events

<Badge type="info" text="POST" /> `/api/v1/admin.events.search`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Searches and filters website tracking events and subscriber activity events across all accounts with admin privileges. This endpoint provides comprehensive filtering by user, list, subscriber, event type, date range, and search keywords. Useful for debugging tracking events, analyzing subscriber activity, and cross-account event monitoring.

**Request Body Parameters:**

| Parameter           | Type    | Required | Description                                                                                      |
|---------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command             | String  | Yes      | API command: `admin.events.search`                                                               |
| SessionID           | String  | No       | Session ID obtained from login                                                                   |
| APIKey              | String  | No       | API key for authentication                                                                       |
| RecordsPerRequest   | Integer | No       | Number of records per request (default: 0 for all records)                                      |
| RecordsFrom         | Integer | No       | Offset for pagination (default: 0)                                                               |
| FilterByUserID      | Integer | No       | Filter by account/user ID                                                                        |
| FilterByListID      | Integer | No       | Filter by list ID                                                                                |
| FilterBySubscriberID| Integer | No       | Filter by subscriber ID                                                                          |
| EventType           | String  | No       | Filter by event type (e.g., `PageView`, `EmailOpen`, `LinkClick`, `FormSubmit`). Use `All` or omit for all event types |
| SearchKeyword       | String  | No       | Search term for event name (LIKE query)                                                          |
| DateFrom            | String  | No       | Start date for filtering (Y-m-d format, e.g., 2025-11-01)                                       |
| DateTo              | String  | No       | End date for filtering (Y-m-d format, e.g., 2025-11-30)                                         |
| WebsiteEventUUID    | String  | No       | Filter by specific website event UUID                                                            |
| OrderField          | String  | No       | Field to sort by (e.g., EventID, CreatedAt). Default: EventID. Must be sent together with `OrderType` — see the sorting note below. |
| OrderType           | String  | No       | Sort direction: `ASC` or `DESC` (default: DESC). Must be sent together with `OrderField` — see the sorting note below. |
| IncludeProperties   | Boolean | No       | Include event properties/metadata (default: true)                                                |

::: warning Sorting parameters are coupled and format-filtered (v5.9.3, #2359)
`OrderField` and `OrderType` are validated for **shape**, not against a list of sortable columns, and they are validated **as a pair**:

- **Both must be present and non-empty.** Sending `OrderField` alone, without `OrderType`, silently yields the default ordering (`EventID DESC`) — this is the most common surprise here. Always send both.
- `OrderField` must be a plain column identifier (letters, digits and underscores, starting with a letter or underscore) and `OrderType` must be `ASC` or `DESC`. If either fails, the pair is discarded and ordering falls back to `EventID DESC`.
- Because there is no column allow-list, a value that *is* identifier-shaped but names a column that does not exist is passed through to the query and surfaces as a **database error** rather than falling back.

The silent-fallback cases return HTTP `200` with `Success: true` and no error code. If results come back in an unexpected order after upgrading, your sort parameters are being rejected silently — confirm you are sending both of them.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.events.search \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.events.search",
    "APIKey": "your-admin-api-key",
    "EventType": "PageView",
    "DateFrom": "2025-11-01",
    "DateTo": "2025-11-30",
    "RecordsPerRequest": 50,
    "RecordsFrom": 0,
    "OrderField": "CreatedAt",
    "OrderType": "DESC",
    "IncludeProperties": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Events": [
    {
      "EventID": 12345,
      "Event": "PageView",
      "UserID": 5,
      "ListID": 10,
      "SubscriberID": 1234,
      "WebsiteEventUUID": "evt_abc123def456",
      "CreatedAt": "2025-11-15 14:30:00",
      "Properties": {
        "page_url": "https://example.com/products",
        "page_title": "Product Catalog",
        "referrer": "https://google.com",
        "user_agent": "Mozilla/5.0..."
      }
    },
    {
      "EventID": 12344,
      "Event": "FormSubmit",
      "UserID": 5,
      "ListID": 10,
      "SubscriberID": 1234,
      "WebsiteEventUUID": "evt_xyz789ghi012",
      "CreatedAt": "2025-11-15 14:25:00",
      "Properties": {
        "form_id": "contact_form",
        "form_name": "Contact Us"
      }
    }
  ],
  "TotalEvents": 1523
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Authentication failed"
}
```

```txt [Error Codes]
0: Success
```

:::

## Admin Login

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Authenticates an administrator and creates a session. This endpoint supports both username/password authentication and Admin API Key authentication. Optional 2FA (Two-Factor Authentication) verification is supported based on system configuration.

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                                                                      |
|---------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command       | String  | Yes      | API command: `admin.login`                                                                       |
| Username      | String  | Yes*     | Administrator username (*required unless using AdminAPIKey)                                      |
| Password      | String  | Yes*     | Administrator password (*required unless using AdminAPIKey)                                      |
| TFACode       | String  | Conditional | Two-Factor Authentication code (required if 2FA is enabled for the admin account)             |
| TFARecoveryCode | String | No | The administrator's two-factor recovery key, for a lost authenticator. Checked after the username, password and IP allow-list. A matching key turns two-factor authentication off for the account (secret, recovery key and the enabled flag are cleared) and the login succeeds without `TFACode`. A wrong key answers `ErrorCode 6` and counts as a failed sign-in (v6.0.2, #3584) |
| AdminAPIKey   | String  | No       | Admin API Key for alternative authentication (bypasses username/password when valid). Either the master `ADMIN_API_KEY` from `.oempro_env`, which logs in the master administrator, or a sub-admin's own key issued on the sub-admin edit screen, which logs in that sub-admin (v5.9.6, #2774) |
| Disable2FA    | Boolean | No       | Skip 2FA verification for this request. Honored **only** when `Disable2FAToken` is also supplied and valid (see note below). |
| Disable2FAToken | String | Conditional | Server-derived token that authorizes `Disable2FA`. Required for `Disable2FA` to take effect. |

::: warning Behavior change (v5.9.3, #2317)
`Disable2FA` alone no longer skips two-factor authentication. In earlier versions **any** client could send `Disable2FA=true` and bypass 2FA — a security hole. It is now honored only when accompanied by a matching `Disable2FAToken`:

```
Disable2FAToken = HMAC_SHA256("admin.login.disable2fa", SCRTY_SALT)   // lowercase hex
```

`SCRTY_SALT` is a server-side secret from `.oempro_env`, so only a trusted integration that has access to it can compute the token; an ordinary caller cannot forge it. If `SCRTY_SALT` is empty the token can never validate and `Disable2FA` is ignored. When the token is absent or invalid, normal 2FA handling applies — supply `TFACode`. Authenticating with `AdminAPIKey` is unaffected.
:::

::: tip Sub-admin keys and the response (v5.9.6, #2774)
`AdminInfo` never contains the sub-admin `APIKey` column, whichever way the login was performed. When a sub-admin logs in and `ADMIN_API_ENFORCE_PRIVILEGES` is enabled on the install, the returned `SessionID` is limited to the commands that sub-admin's privileges allow; other admin commands answer `99999`. See [Authorization](/v6.0.3/api-reference/authorization#sub-admin-api-keys-and-privilege-enforcement).
:::

::: warning Behavior change (v6.0.2, #2986)
Repeated failed sign-ins are refused. After `LOGIN_THROTTLE_MAX_FAILURES_PER_IDENTITY` failures for one username (default 10) or `LOGIN_THROTTLE_MAX_FAILURES_PER_IP` failures from one client address (default 50) within `LOGIN_THROTTLE_WINDOW_SECONDS` (default 900), further attempts are refused for `LOGIN_THROTTLE_LOCKOUT_SECONDS` (default 900) with **HTTP 429**, a `Retry-After` header and:

`{"Success":false,"ErrorCode":429,"ErrorText":"Too many failed attempts. Try again later.","RetryAfterSeconds":840}`

The check runs before the credentials are looked up, so the answer is identical for an unknown username, and a correct password is refused too until the lock expires. A wrong `TFACode` counts as a failure. A successful login clears the count for that username. A login with a valid `AdminAPIKey` is not counted or refused, while an `AdminAPIKey` that does not resolve falls back to `Username` and `Password` and is counted like any password attempt. The settings are under **Login Brute-Force Protection** in [Octeth Configuration](/v6.0.3/getting-started/octeth-configuration#main-configuration-file-oempro-env).
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.login",
    "Username": "admin",
    "Password": "securepassword123"
  }'
```

```bash [Example Request with 2FA]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.login",
    "Username": "admin",
    "Password": "securepassword123",
    "TFACode": "123456"
  }'
```

```bash [Example Request with Recovery Key]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.login",
    "Username": "admin",
    "Password": "securepassword123",
    "TFARecoveryCode": "your-recovery-key"
  }'
```

```bash [Example Request with Admin API Key]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.login",
    "Username": "admin",
    "Password": "any",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SessionID": "abc123def456ghi789",
  "AdminInfo": {
    "AdminID": 1,
    "Username": "admin",
    "FirstName": "System",
    "LastName": "Administrator",
    "EmailAddress": "admin@example.com",
    "2FA_Enabled": "No",
    "CreatedOn": "2025-01-01 00:00:00",
    "LastLoginOn": "2025-11-15 14:30:00"
  }
}
```

```json [Error Response - Invalid Credentials]
{
  "Success": false,
  "ErrorCode": 3
}
```

```json [Error Response - Invalid 2FA Code]
{
  "Success": false,
  "ErrorCode": 101
}
```

```txt [Error Codes]
0: Success
username: Missing required parameter username
password: Missing required parameter password
3: Invalid username or password
3: Invalid username or password. With ErrorText "Access from this IP address is not allowed": a staff sign-in through the new interface from an address outside Authorized IP Addresses
6: Invalid 2FA recovery key (TFARecoveryCode sent and wrong, or two-factor authentication is not on)
101: Invalid 2FA code
429: Too many failed attempts, try again after RetryAfterSeconds (HTTP 429, see above)
```

:::

## Admin Password Remind

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Sends a password reset link to the administrator's email address. The link carries a signed token that is valid for one hour and stops working once the password changes. By default it opens the staff reset page of the new interface (`/<UI_CUSTOMER_PREFIX>/reset-password/staff?token=...`).

**Request Body Parameters:**

| Parameter        | Type   | Required | Description                                                                                      |
|------------------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String | Yes      | API command: `admin.passwordremind`                                                              |
| EmailAddress     | String | Yes      | Administrator email address                                                                      |
| CustomResetLink  | String | No       | Custom reset URL template, base64 encoded, with exactly one `%s` placeholder for the token. Honoured only when it has the same scheme, host and port as the installation; otherwise the default link is used |
| ReturnParams     | Boolean | No      | With a valid master `AdminAPIKey`, return the token as `PasswordResetToken` and send no email, so the caller can deliver its own link. Ignored without the key (v6.0.2, #3584) |
| AdminAPIKey      | String | No       | The master `ADMIN_API_KEY`. Only needed with `ReturnParams` |

::: warning Behavior change (v6.0.2, #2986)
Every request counts, not only failed ones, because each one that matches an administrator sends an email. After `LOGIN_THROTTLE_MAX_FAILURES_PER_IDENTITY` requests for one `EmailAddress` (default 10) or `LOGIN_THROTTLE_MAX_FAILURES_PER_IP` requests from one client address (default 50) within `LOGIN_THROTTLE_WINDOW_SECONDS` (default 900), further requests are refused for `LOGIN_THROTTLE_LOCKOUT_SECONDS` (default 900) with **HTTP 429**, a `Retry-After` header and `{"Success":false,"ErrorCode":429,"ErrorText":"Too many failed attempts. Try again later.","RetryAfterSeconds":840}`. The refusal is identical for an email address that belongs to no administrator. The settings are under **Login Brute-Force Protection** in [Octeth Configuration](/v6.0.3/getting-started/octeth-configuration#main-configuration-file-oempro-env).
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.passwordremind",
    "EmailAddress": "admin@example.com"
  }'
```

```bash [Example Request with Custom Reset Link]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.passwordremind",
    "EmailAddress": "admin@example.com",
    "CustomResetLink": "aHR0cHM6Ly9leGFtcGxlLmNvbS9yZXNldC1wYXNzd29yZD9jb2RlPSVz"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Success Response with ReturnParams]
{
  "Success": true,
  "ErrorCode": 0,
  "PasswordResetToken": "MS0xNzMwMDAwMDAwLWFi..."
}
```

```json [Error Response - Invalid Email]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```json [Error Response - Email Not Found]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
0: Success
emailaddress: Missing required parameter emailaddress
2: Invalid email address format
3: Email address not found
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
429: Too many reminder requests, try again after RetryAfterSeconds (HTTP 429, see above)
```

:::

## Admin Password Reset

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Resets an administrator's password from the token sent by `admin.passwordremind`. By default a new random password is generated, stored and emailed to the administrator. The token expires after one hour and is spent by the reset.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                                                      |
|-----------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command   | String | Yes      | API command: `admin.passwordreset`                                                               |
| AdminID   | String | Yes      | The token from the reset link (`admin.passwordremind`)                                           |
| NewPassword | String | No | With a valid master `AdminAPIKey`, store this password instead of a generated one. It must differ from the current password (v6.0.2, #3584) |
| DontSendNewPasswordEmail | String | No | `true` with a valid master `AdminAPIKey`: send no email (v6.0.2, #3584) |
| AdminAPIKey | String | No | The master `ADMIN_API_KEY`. Only needed with `NewPassword` or `DontSendNewPasswordEmail` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.passwordreset",
    "AdminID": "<token from the reset link>"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response - Admin Not Found]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
0: Success
adminid: Missing required parameter adminid
2: Invalid, expired or already used reset token
3: The new password could not be stored (nothing changed, no email sent)
4: NewPassword is the current password (the token stays unspent, choose a different password)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## List Processes

<Badge type="info" text="POST" /> `/api/v1/admin.processes.list`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves a list of all currently active processes with their details, including process type information, memory usage, key metrics, and health status. This endpoint is useful for monitoring system processes, detecting stale processes, and troubleshooting performance issues.

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                                                                                      |
|--------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command      | String  | Yes      | API command: `admin.processes.list`                                                              |
| SessionID    | String  | No       | Session ID obtained from login                                                                   |
| APIKey       | String  | No       | API key for authentication                                                                       |
| ProcessType  | String  | No       | Filter by process type (e.g., `campaign_sender`, `journey_worker`, `autoresponder_worker`). Use `All` or omit for all process types |
| PID          | Integer | No       | Filter by specific process ID (PID)                                                              |
| StaleMinutes | Integer | No       | Filter processes that haven't pinged in the last X minutes (useful for detecting stale/stuck processes) |
| OrderField   | String  | No       | Field to sort by: `ProcessID`, `PID`, `ProcessType`, `RegisteredAt`, `LastPingedAt`, `MemoryUsage`, `MemoryPeakUsage` (default: LastPingedAt) |
| OrderType    | String  | No       | Sort direction: `ASC` or `DESC` (default: DESC)                                                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.processes.list \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.processes.list",
    "APIKey": "your-admin-api-key",
    "ProcessType": "campaign_sender",
    "OrderField": "LastPingedAt",
    "OrderType": "DESC"
  }'
```

```bash [Example Request - Find Stale Processes]
curl -X POST https://example.com/api/v1/admin.processes.list \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.processes.list",
    "APIKey": "your-admin-api-key",
    "StaleMinutes": 5,
    "OrderField": "LastPingedAt",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Processes": [
    {
      "ProcessID": 123,
      "PID": 12345,
      "Hostname": "worker-1",
      "ProcessType": "campaign_sender",
      "ProcessTypeLabel": "Campaign Sender",
      "ProcessTypeDescription": "Processes email campaign batches",
      "RegisteredAt": "2025-11-10 14:30:00",
      "LastPingedAt": "2025-11-10 14:35:00",
      "MemoryUsage": 52428800,
      "MemoryPeakUsage": 67108864,
      "KeyMetricValue1": 1000,
      "KeyMetricValue2": 50,
      "KeyMetricValue3": 2.5,
      "KeyMetricValue4": 0,
      "KeyMetricValue5": 0,
      "IsHealthy": true,
      "SecondsSinceLastPing": 3
    }
  ],
  "TotalProcesses": 15,
  "AvailableProcessTypes": [
    {
      "Type": "campaign_sender",
      "Label": "Campaign Sender",
      "Description": "Processes email campaign batches"
    },
    {
      "Type": "journey_worker",
      "Label": "Journey Worker",
      "Description": "Processes journey actions and events"
    },
    {
      "Type": "autoresponder_worker",
      "Label": "Autoresponder Worker",
      "Description": "Processes autoresponder emails"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Authentication failed"
}
```

```txt [Error Codes]
0: Success
```

:::

## Clear Stale Processes

<Badge type="info" text="POST" /> `/api/v1/admin.processes.clear`

<Badge type="tip" text="New in v5.9.6" />

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Processes`)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
:::

Deletes rows from the process registry (`oempro_processes`) whose `LastPingedAt` is older than `StaleMinutes`. This is the API form of the admin Processes screen's "clear dead processes" link, which uses a fixed 10 minutes; the screen and this command share one implementation. Workers ping every few seconds, so a row older than the window belongs to a process that died without recording its exit. Only the registry row is removed; no process is signalled or stopped. Use `admin.processes.list` with the same `StaleMinutes` to preview what would be removed.

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                                                                                              |
|--------------|---------|----------|----------------------------------------------------------------------------------------------------------|
| Command      | String  | Yes      | API command: `admin.processes.clear`                                                                     |
| AdminAPIKey  | String  | Yes      | Admin API key                                                                                            |
| StaleMinutes | Integer | No       | Rows whose last ping is older than this many minutes are deleted. Default 10. Clamped to 1..1440; a non-numeric value is refused with `ErrorCode 1`. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.processes.clear \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.processes.clear",
    "AdminAPIKey": "your-admin-api-key",
    "StaleMinutes": 30
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DeletedCount": 3,
  "StaleMinutes": 30,
  "StaleBefore": "2026-09-04 18:15:00"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "StaleMinutes must be a number of minutes"
}
```

```txt [Error Codes]
0: Success
1: StaleMinutes is not numeric
2: Process cleanup query failed
NOT AVAILABLE IN DEMO MODE.: DEMO_MODE_ENABLED is on
99998: Authentication failure
99999: Not enough privileges
```

:::

## Delete All Subscribers from a List

<Badge type="info" text="POST" /> `/api/v1/admin.subscribers.delete.all`

::: tip API Usage Notes
- Authentication is done by Admin API Key
- v1 REST alias: `POST /api/v1/admin.subscribers.delete.all`. Legacy access via `/api.php` is also supported
:::

Deletes all subscribers from a specific list for a given user account. This endpoint is restricted to administrators and allows deletion across any user account by specifying the UserID. All subscriber records and their tag associations are permanently removed from the specified list. Optionally, the actual tag entities can also be deleted.

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                                                                      |
|------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String  | Yes      | API command: `admin.subscribers.delete.all`                                                      |
| SessionID        | String  | No       | Session ID obtained from login                                                                   |
| APIKey           | String  | No       | API key for authentication                                                                       |
| UserID           | Integer | Yes      | User ID of the account that owns the list                                                        |
| ListID           | Integer | Yes      | List ID to delete all subscribers from                                                           |
| DeleteListTags   | Boolean | No       | If true, deletes the actual tag entities in addition to tag associations (default: false)        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subscribers.delete.all",
    "APIKey": "your-admin-api-key",
    "UserID": 5,
    "ListID": 123,
    "DeleteListTags": false
  }'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Access denied to this list"
}
```

```txt [Error Codes]
0: Success
userid: Missing required parameter userid
listid: Missing required parameter listid
3: Invalid list ID
4: Access denied to this list
5: Failed to delete subscribers
6: Failed to delete tag associations
7: Failed to delete tag entities
8: An error occurred during deletion of all subscribers
```

:::

## Get Administrator Account

<Badge type="info" text="GET" /> `/api/v1/admin.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Account`
- v1 REST alias: `GET /api/v1/admin.get`. Legacy access via `/api.php` is also supported
:::

Returns the authenticated administrator's own profile without any credential. `APIKeyIssued` reports
whether a per-sub-admin API key exists for the account without revealing it. Before this command the only
way to read an admin profile was the `admin.login` round trip, which returns the password hash.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                   |
|-------------|--------|----------|-----------------------------------------------|
| Command     | String | Yes      | API command: `admin.get`                      |
| SessionID   | String | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Admin": {
    "AdminID": 1,
    "Name": "System Administrator",
    "Username": "admin",
    "EmailAddress": "admin@example.com",
    "2FA_Enabled": "No",
    "Options": [],
    "APIKeyIssued": false
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Admin account not found."
}
```

```txt [Error Codes]
0: Success
1: Admin account not found
```

:::

## Get Own Administrator Account (Session)

<Badge type="info" text="GET" /> `/api/v1/admin.self.get`

::: tip API Usage Notes
- Authentication is done by admin SessionID only. The master Admin API key, a per-sub-admin API key and an admin AI assistant key are refused with error code 2
- Required privilege: none. Every administrator, including a sub-administrator without the `Account` privilege, can read its own account
- v1 REST alias: `GET /api/v1/admin.self.get`. Legacy access via `/api.php` is also supported
:::

Returns the administrator the session belongs to, in the same shape as `AdminInfo` from `admin.login`
and without any credential. `Options` carries the sub-administrator limits (`AccessLimited`,
`AccessOptions`, `AccessAllowedUserGroupIDs`) as they are stored now, so a client that signed in earlier
can pick up permission changes without signing in again. The new user interface uses it to refresh a
staff member's permissions during the session. The command has no parameter that selects an
administrator: it only ever describes the caller.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                            |
|-----------|--------|----------|----------------------------------------|
| Command   | String | Yes      | API command: `admin.self.get`          |
| SessionID | String | Yes      | Session ID obtained from `admin.login` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.self.get",
    "SessionID": "your-admin-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminInfo": {
    "AdminID": 4,
    "Name": "Support Team",
    "Username": "support",
    "EmailAddress": "support@example.com",
    "2FA_Enabled": "No",
    "Options": {
      "AccessLimited": true,
      "AccessOptions": ["Users", "User.Browse"],
      "AccessAllowedUserGroupIDs": [5]
    },
    "APIKeyIssued": false
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "admin.self.get requires an admin session (SessionID). API keys and AI assistant keys are not accepted."
}
```

```txt [Error Codes]
0: Success
1: Admin account not found
2: Not called with an admin session (an Admin API key or AI assistant key was used)
99998: Authentication failure or session expired
```

:::

## Update Administrator Account

<Badge type="info" text="POST" /> `/api/v1/admin.update`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Account`
- v1 REST alias: `POST /api/v1/admin.update`. Legacy access via `/api.php` is also supported
:::

Updates administrator account details including username, email address, name, and optionally password.
Administrators can only update their own account information (AdminID must match the authenticated
administrator). This endpoint is disabled in demo mode.

<Badge type="tip" text="Changed in v5.9.6" /> `CurrentPassword` is an additive parameter. When it is supplied
alongside `Password` it is always verified against the account's current password (`ErrorCode 10` when
wrong). Whether omitting it alongside `Password` is refused (`ErrorCode 9`) is controlled by the
`ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD` setting. The shipped `.oempro_env.example` turns it on, and an upgrade adds the setting with that value unless `.oempro_env` already has it, so it is on for fresh and upgraded installs alike. To keep an integration that changes the password without `CurrentPassword` working, add `ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD=false` to `.oempro_env` before upgrading. The admin Account screen always sends it.

**Request Body Parameters:**

| Parameter       | Type    | Required | Description                                                                  |
|-----------------|---------|----------|------------------------------------------------------------------------------|
| Command         | String  | Yes      | API command: `admin.update`                                                  |
| SessionID       | String  | No       | Session ID obtained from `admin.login`                                       |
| AdminAPIKey     | String  | No       | Admin API key (master or per-sub-admin)                                      |
| AdminID         | Integer | Yes      | Administrator ID to update (must match the authenticated admin)              |
| Name            | String  | Yes      | Administrator name                                                           |
| Username        | String  | Yes      | Administrator username                                                       |
| EmailAddress    | String  | Yes      | Administrator email address (must be valid format)                           |
| Password        | String  | No       | New password (leave empty to keep the existing password)                     |
| CurrentPassword | String  | No       | The current password. Verified whenever supplied with `Password`; required with `Password` when `ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD` is on |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.update",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 1,
    "Name": "System Administrator",
    "Username": "admin",
    "EmailAddress": "admin@example.com"
  }'
```

```bash [Example Request with Password Update]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.update",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 1,
    "Name": "System Administrator",
    "Username": "admin",
    "EmailAddress": "admin@example.com",
    "Password": "newSecurePassword123",
    "CurrentPassword": "theCurrentPassword"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response - Wrong Current Password]
{
  "Success": false,
  "ErrorCode": 10,
  "ErrorText": "CurrentPassword is incorrect."
}
```

```txt [Error Codes]
0: Success
adminid: Missing required parameter adminid
name: Missing required parameter name
username: Missing required parameter username
emailaddress: Missing required parameter emailaddress
7: Invalid email address format
8: Admin account is not owned by the authenticated admin
9: CurrentPassword is required when changing the password (only when ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD is on)
10: CurrentPassword is incorrect
11: The password could not be changed (nothing updated, retry)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Admin Logout

<Badge type="info" text="POST" /> `/api/v1/admin.logout`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Account`
- v1 REST alias: `POST /api/v1/admin.logout`. Legacy access via `/api.php` is also supported
:::

Ends the admin session behind the call, so a client that created a session with `admin.login` can
invalidate it. Pass the `SessionID` to log out. With an `AdminAPIKey` call there is no persistent session
to end and the command succeeds as a no-op.

<Badge type="tip" text="Changed in v6.0.1" /> When the call carries the admin "remember me" cookie, that remembered browser is also revoked on the server, so a copy of the cookie stops working too. The success response is unchanged. If the server-side revoke fails, the session and the cookie are still ended, the failure is logged at ERROR, and the call returns `Success` `false` with `ErrorCode` `1`. Revoke the browser from **Settings > Security** in that case.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                   |
|-------------|--------|----------|-----------------------------------------------|
| Command     | String | Yes      | API command: `admin.logout`                   |
| SessionID   | String | No       | The session to end                            |
| AdminAPIKey | String | No       | Admin API key (no-op, see above)              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.logout",
    "SessionID": "session-id-from-admin-login"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
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
0: Success
1: The session has ended, but the remember-me token could not be revoked on the server
99998: Authentication failure or session expired
```

:::

## End a User Session (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.user.session.end`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key
- Required privilege: `User.Impersonate`
- v1 REST alias: `POST /api/v1/admin.user.session.end`. Legacy access via `/api.php` is also supported
:::

Ends one user session, typically the one `user.switch` returned when an administrator started acting as a user, so it stops working at once instead of living until it expires. After the call, `api.php` rejects that `SessionID` with error 99998.

Only a session signed in as a user is ended. A session that holds an administrator login, any other kind of session, and the calling session itself are refused (error 3) and left unchanged. A session that no longer exists answers `Success` with `Ended` `false`.

An administrator limited to some user groups can end only the sessions of accounts in those groups. A session of any other account is refused with error 5003 and keeps working.

The session to end is passed as `TargetSessionID`, not `SessionID`, because `SessionID` names the caller's own session. Call this command with an Admin API key. An admin `SessionID` call works too, but the API key form never touches the caller's own session.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `admin.user.session.end` |
| AdminAPIKey | String | Yes | Admin API key |
| TargetSessionID | String | Yes | The user session to end, for example the `SessionID` returned by `user.switch` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.user.session.end",
    "AdminAPIKey": "your-admin-api-key",
    "TargetSessionID": "q8l1v0c3m2k5t7r9a4b6d8f0e1"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Ended": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Only a user session can be ended with this command"
}
```

```txt [Error Codes]
0: Success
1: TargetSessionID is missing
2: TargetSessionID is not a valid session id
3: The session belongs to an administrator, is not a user session, or is the calling session
4: The session could not be ended
5003: The session's account is outside the user groups this admin account may access
99998: Authentication failure
99999: Not enough privileges
```

:::

## Provision Two-Factor Authentication

<Badge type="info" text="POST" /> `/api/v1/admin.2fa.provision`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: none <Badge type="tip" text="Changed in v6.0.2" />. Every administrator and sub-administrator manages their own two-factor authentication, whatever their privileges (before v6.0.2 it needed `Security`). The command acts only on the calling administrator's own account
- v1 REST alias: `POST /api/v1/admin.2fa.provision`. Legacy access via `/api.php` is also supported
:::

Issues the TOTP secret and recovery key for the authenticated administrator, or returns the pending ones
when a secret was already provisioned but not yet enabled. This is the only command that returns the secret
and recovery key; keep them, they are not retrievable afterwards. Nothing is enabled by this call: enrol
the secret in an authenticator app (the `OTPAuthURL` or `QRCodeURL`), then confirm with
`admin.2fa.enable`. Once two-factor authentication is enabled this command answers `ErrorCode 2`; disable
first to re-enrol. Disabled in demo mode.

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                                              |
|-------------|---------|----------|--------------------------------------------------------------------------|
| Command     | String  | Yes      | API command: `admin.2fa.provision`                                       |
| SessionID   | String  | No       | Session ID obtained from `admin.login`                                   |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)                                  |
| Regenerate  | Boolean | No       | `true` replaces a provisioned, not yet enabled secret with a fresh one   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.2fa.provision",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SecretKey": "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ",
  "RecoveryKey": "1a2b-3c4d-5e6f-7a8b-9c0d-1e2f-3a4b-5c6d",
  "Issuer": "Octeth",
  "OTPAuthURL": "otpauth://totp/Octeth%3Aadmin%40example.com?secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ&issuer=Octeth",
  "QRCodeURL": "https://example.com/system/qr?data=otpauth://totp/..."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Two-factor authentication is already enabled. Disable it before provisioning a new secret."
}
```

```txt [Error Codes]
0: Success
1: Admin account not found
2: Two-factor authentication is already enabled
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Enable Two-Factor Authentication

<Badge type="info" text="POST" /> `/api/v1/admin.2fa.enable`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: none <Badge type="tip" text="Changed in v6.0.2" />. Every administrator and sub-administrator manages their own two-factor authentication, whatever their privileges (before v6.0.2 it needed `Security`). The command acts only on the calling administrator's own account
- v1 REST alias: `POST /api/v1/admin.2fa.enable`. Legacy access via `/api.php` is also supported
:::

Verifies a six-digit TOTP code against the secret issued by `admin.2fa.provision` and turns two-factor
authentication on for the authenticated administrator. From then on `admin.login` requires `TFACode`.
Disabled in demo mode.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                   |
|-------------|--------|----------|-----------------------------------------------|
| Command     | String | Yes      | API command: `admin.2fa.enable`               |
| SessionID   | String | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)       |
| Code        | String | Yes      | Current six-digit code from the authenticator |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.2fa.enable",
    "AdminAPIKey": "your-admin-api-key",
    "Code": "123456"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "2FA_Enabled": "Yes"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "The code could not be verified."
}
```

```txt [Error Codes]
0: Success
1: Code is required
2: Admin account not found
3: No two-factor secret is provisioned (call admin.2fa.provision first)
4: The code could not be verified
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Disable Two-Factor Authentication

<Badge type="info" text="POST" /> `/api/v1/admin.2fa.disable`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: none <Badge type="tip" text="Changed in v6.0.2" />. Every administrator and sub-administrator manages their own two-factor authentication, whatever their privileges (before v6.0.2 it needed `Security`). The command acts only on the calling administrator's own account and needs its current password
- v1 REST alias: `POST /api/v1/admin.2fa.disable`. Legacy access via `/api.php` is also supported
:::

Clears the authenticated administrator's two-factor secret, recovery key and enabled flag after
confirming the current password. This is the only operation that clears admin two-factor authentication;
editing a sub-admin account no longer does. Disabled in demo mode.

**Request Body Parameters:**

| Parameter       | Type   | Required | Description                                   |
|-----------------|--------|----------|-----------------------------------------------|
| Command         | String | Yes      | API command: `admin.2fa.disable`              |
| SessionID       | String | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey     | String | No       | Admin API key (master or per-sub-admin)       |
| CurrentPassword | String | Yes      | The administrator's current password          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.2fa.disable",
    "AdminAPIKey": "your-admin-api-key",
    "CurrentPassword": "theCurrentPassword"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "2FA_Enabled": "No"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "CurrentPassword is incorrect."
}
```

```txt [Error Codes]
0: Success
1: CurrentPassword is required
2: Admin account not found
3: CurrentPassword is incorrect
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Get the Admin Access Rules

<Badge type="info" text="GET" /> `/api/v1/admin.security.settings.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Security page did
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the install-wide admin access rules the staff Security screen shows: the admin area IP allow-list, whether the same list applies to user sign-ins, and whether admin API calls are measured against it. `CallerIP` is the address of this request as the admin login resolves it (after the trusted-proxy resolution), and `CallerAllowed` says whether the stored list admits it. An empty `AdminAllowedIPs` means every address may sign in, unless `AdminAllowedIPsStoredBlank` is `true`: the stored list then holds only blank lines, which the admin sign-in enforces as a list with no address on it (only the server itself gets in). `CallerAllowed` is measured the way the sign-in measures it, so it is `false` in that state. Saving an empty `AdminAllowedIPs` with `admin.security.settings.update` clears it.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                    |
|-------------|--------|----------|------------------------------------------------|
| Command     | String | Yes      | API command: `admin.security.settings.get`     |
| SessionID   | String | No       | Session ID obtained from `admin.login`         |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.security.settings.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.security.settings.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminAllowedIPs": ["203.0.113.7", "198.51.100.0/24"],
  "AdminAllowedIPsStoredBlank": false,
  "PreventUserLoginFromAlienIPs": false,
  "AdminAPIEnforceAllowedIP": true,
  "CallerIP": "203.0.113.7",
  "CallerAllowed": true
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
99999: The administrator does not hold the Security privilege
```

:::

## Save the Admin Access Rules

<Badge type="info" text="POST" /> `/api/v1/admin.security.settings.update`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 20 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Saves the admin area IP allow-list, the user sign-in rule, or both. Only the parameters sent are saved, and at least one must be sent. This is the same column and option `settings.update` writes, but it needs `Security` rather than `Settings`, the privilege the legacy Security page checked. Disabled in demo mode.

The list holds one entry per line: an IP address (exact match) or an IPv4 CIDR range. Blank lines and surrounding spaces are ignored and exact duplicates dropped. An empty value removes the list, including a stored list of only blank lines.

Lockout guard: a non-empty list that does not admit the calling address is refused with error 4 and the address in `CallerIP`, unless `ConfirmLockout` is `true`. Loopback is always admitted, as at the admin login.

**Request Body Parameters:**

| Parameter                    | Type    | Required | Description |
|------------------------------|---------|----------|-------------|
| Command                      | String  | Yes      | API command: `admin.security.settings.update` |
| SessionID                    | String  | No       | Session ID obtained from `admin.login` |
| AdminAPIKey                  | String  | No       | Admin API key (master or per-sub-admin) |
| AdminAllowedIPs              | String  | No       | The allow-list, one IP address or IPv4 CIDR range per line. At most 1000 entries |
| PreventUserLoginFromAlienIPs | Boolean | No       | Apply the list to user sign-ins too. Possible values: `true`, `false` |
| ConfirmLockout               | Boolean | No       | Save a list that does not admit the calling address. Possible values: `true`, `false` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.security.settings.update \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.security.settings.update",
    "AdminAPIKey": "your-admin-api-key",
    "AdminAllowedIPs": "203.0.113.7\n198.51.100.0/24",
    "PreventUserLoginFromAlienIPs": false
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminAllowedIPs": ["203.0.113.7", "198.51.100.0/24"],
  "AdminAllowedIPsStoredBlank": false,
  "PreventUserLoginFromAlienIPs": false,
  "AdminAPIEnforceAllowedIP": true,
  "CallerIP": "203.0.113.7",
  "CallerAllowed": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "The list does not include your address, so the admin area would refuse you. Add your address, or send ConfirmLockout=true to save it anyway.",
  "CallerIP": "192.0.2.44"
}
```

```txt [Error Codes]
0: Success
1: AdminAllowedIPs holds an entry that is not an IP address or an IPv4 CIDR range (InvalidEntries lists up to 20), or is not a string
2: PreventUserLoginFromAlienIPs is not true or false
3: Neither AdminAllowedIPs nor PreventUserLoginFromAlienIPs was sent
4: The list does not admit the calling address (CallerIP). Nothing was saved
5: The list holds more than 1000 entries or more than 65535 bytes
99999: The administrator does not hold the Security privilege
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Get the Stripo Integration State

<Badge type="info" text="GET" /> `/api/v1/admin.integrations.stripo.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Integrations page did
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the state of the Stripo email builder integration without its secrets, as the staff Settings > Integrations screen shows it: the stored plugin ID, whether a secret key is stored, and which users have a project API key for the template gallery of the legacy email builder. No secret key is ever returned, and the project keys are returned only when `RevealKeyList` asks for them. `settings.get` redacts the same two values, and `settings.update` writes them.

`Connected` is `true` when the plugin ID and the secret key are both stored, which is when both email builders offer Stripo. `KeyUserIDs` lists, in ascending order, the users whose entry in the stored key list is a non-empty key under a positive user ID; any other entry can never match a user and is not counted. `KeyListReadable` is `false` when a stored list is not a JSON object of user ID and key (for example a list truncated by MySQL, or a JSON array), and the template gallery then shows nothing to anyone.

With `RevealKeyList`, the response also carries `KeyList`: the stored key list exactly as stored (the `Stripo_APIKey` setting, a JSON object of user ID and project API key, or an empty string when none is stored), so it can be edited and saved back through `settings.update`. Each such call is logged with the calling admin's ID. Without the parameter the response is unchanged.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                     |
|-------------|--------|----------|-------------------------------------------------|
| Command     | String | Yes      | API command: `admin.integrations.stripo.get`    |
| SessionID   | String | No       | Session ID obtained from `admin.login`          |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)         |
| RevealKeyList | String | No     | `1`, `true` or `yes` adds `KeyList`, the stored template gallery key list. Refused in demo mode |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.integrations.stripo.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.integrations.stripo.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "PluginId": "d0b1c2e3-plugin-id",
  "SecretKeyStored": true,
  "Connected": true,
  "KeyListStored": true,
  "KeyListReadable": true,
  "KeyUserCount": 2,
  "KeyUserIDs": [12, 31]
}
```

```json [Success Response with RevealKeyList]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "PluginId": "d0b1c2e3-plugin-id",
  "SecretKeyStored": true,
  "Connected": true,
  "KeyListStored": true,
  "KeyListReadable": true,
  "KeyUserCount": 2,
  "KeyUserIDs": [12, 31],
  "KeyList": "{\"12\":\"project-key-12\",\"31\":\"project-key-31\"}"
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
99999: The administrator does not hold the Settings privilege
NOT AVAILABLE IN DEMO MODE.: RevealKeyList was sent on a demo install
```

:::

## Check a Stripo Connection

<Badge type="info" text="POST" /> `/api/v1/admin.integrations.stripo.test`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 5 requests per 60 seconds, because each call reaches Stripo
- Disabled in demo mode
- Legacy endpoint access via `/api.php` is also supported
:::

Checks a Stripo plugin ID and secret key with Stripo, without saving them. It runs the same handshake `settings.update` runs before it saves a changed pair (error 17 there). A parameter you leave out or send empty is taken from the stored settings, so you can check the stored pair without sending the secret key, or check a new plugin ID against the stored secret key. Nothing is written, and the Stripo token is not returned. Octeth waits at most 15 seconds for Stripo.

`Connected` is `true` when Stripo issued a token for the pair. `Reachable` is `false` when Stripo did not answer at all, which usually means the server has no outbound access to `plugins.stripo.email`.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description |
|-------------|--------|----------|-------------|
| Command     | String | Yes      | API command: `admin.integrations.stripo.test` |
| SessionID   | String | No       | Session ID obtained from `admin.login` |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin) |
| PluginId    | String | No       | A plugin ID to check instead of the stored one |
| SecretKey   | String | No       | A secret key to check instead of the stored one |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.integrations.stripo.test \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.integrations.stripo.test",
    "AdminAPIKey": "your-admin-api-key",
    "PluginId": "d0b1c2e3-plugin-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Connected": true,
  "Reachable": true,
  "UsedStoredPluginId": false,
  "UsedStoredSecretKey": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Enter a plugin ID and a secret key, or store them first."
}
```

```txt [Error Codes]
0: Success (read Connected and Reachable for the result)
1: No complete pair: a value is neither in the request nor stored
429: Too many requests (the rate limit above)
99999: The administrator does not hold the Settings privilege
NOT AVAILABLE IN DEMO MODE.
```

:::

## List Remembered Admin Sign-Ins

<Badge type="info" text="GET" /> `/api/v1/admin.remembertokens.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Lists every administrator's outstanding "remember me" sign-in of the legacy admin area, newest first. Only metadata is returned: never the token or its hash. Dates are UTC. `LastUsedAt` is empty for a sign-in not used since it was issued, and `UserAgent` is empty for one issued before v6.0.2.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                |
|-------------|--------|----------|--------------------------------------------|
| Command     | String | Yes      | API command: `admin.remembertokens.get`    |
| SessionID   | String | No       | Session ID obtained from `admin.login`     |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.remembertokens.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.remembertokens.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Tokens": [
    {
      "TokenID": 12,
      "AdminID": 1,
      "Username": "admin",
      "Name": "Admin",
      "CreatedAt": "2026-10-18 09:12:00",
      "LastUsedAt": "2026-10-18 10:00:00",
      "ExpiresAt": "2026-11-01 09:12:00",
      "UserAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) Safari/605.1.15"
    }
  ],
  "TotalTokens": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "The remembered sign-ins could not be listed."
}
```

```txt [Error Codes]
0: Success
1: The remembered sign-ins could not be listed. Some may still exist
99999: The administrator does not hold the Security privilege
```

:::

## Revoke a Remembered Admin Sign-In

<Badge type="info" text="POST" /> `/api/v1/admin.remembertoken.revoke`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 30 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Revokes one remembered sign-in of any administrator. That browser signs in with the form next time. A session already open there is not ended: change that administrator's password to end it. Disabled in demo mode.

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                        |
|-------------|---------|----------|----------------------------------------------------|
| Command     | String  | Yes      | API command: `admin.remembertoken.revoke`          |
| SessionID   | String  | No       | Session ID obtained from `admin.login`             |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)            |
| TokenID     | Integer | Yes      | The `TokenID` from `admin.remembertokens.get`      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.remembertoken.revoke \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.remembertoken.revoke",
    "AdminAPIKey": "your-admin-api-key",
    "TokenID": 12
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Revoked": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "That remembered sign-in no longer exists. It may have expired or been revoked already."
}
```

```txt [Error Codes]
0: Success
1: TokenID is required
2: TokenID is not a positive whole number
3: No such remembered sign-in. It may have expired or been revoked already
4: The remembered sign-in could not be revoked
99999: The administrator does not hold the Security privilege
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Revoke All Remembered Admin Sign-Ins

<Badge type="info" text="POST" /> `/api/v1/admin.remembertokens.revokeall`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 10 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Revokes every administrator's remembered sign-ins, the caller's own included. Sessions already open are not ended. Disabled in demo mode.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                   |
|-------------|--------|----------|-----------------------------------------------|
| Command     | String | Yes      | API command: `admin.remembertokens.revokeall` |
| SessionID   | String | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.remembertokens.revokeall \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.remembertokens.revokeall",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Revoked": 3
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "The remembered sign-ins could not be revoked."
}
```

```txt [Error Codes]
0: Success
1: The remembered sign-ins could not be revoked
99999: The administrator does not hold the Security privilege
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Get Admin Privileges

<Badge type="info" text="GET" /> `/api/v1/admin.privileges.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- v1 REST alias: `GET /api/v1/admin.privileges.get`. Legacy access via `/api.php` is also supported
:::

Returns every privilege string a sub-admin's `AccessOptions` may contain, so a client can render a
permission editor. `admin.subadmin.create` and `admin.subadmin.update` reject any value outside this list.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                   |
|-------------|--------|----------|-----------------------------------------------|
| Command     | String | Yes      | API command: `admin.privileges.get`           |
| SessionID   | String | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.privileges.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Privileges": ["Account", "Admin.Dashboard.Links", "Admin.Footer", "AdminTools", "Bounce", "CustomFields", "Dashboard", "DeliveryServers", "Email", "PluginAccess", "Processes", "Reports", "Search", "Security", "Settings", "Settings.General", "Settings.Segments", "Settings.SSO", "SMS", "SubAdmins", "SuperAuth", "Suppression", "System", "User.Activity", "User.Browse", "User.Create", "User.Delete", "User.Edit", "User.Impersonate", "User.PaymentHistory", "User.Update", "UserGroups", "Users"],
  "TotalPrivileges": 33
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
99999: Not enough privileges
```

:::

## Get Sub-Admin Accounts

<Badge type="info" text="GET" /> `/api/v1/admin.subadmins.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Sub Admin Accounts screen did
- v1 REST alias: `GET /api/v1/admin.subadmins.get`. Legacy access via `/api.php` is also supported
:::

Lists every administrator account other than the master admin (AdminID 1). Each row carries only `AdminID`, `Name`, `Username`, `EmailAddress`, `2FA_Enabled`, `Options` and `APIKeyIssued`. Any administrator holding `SubAdmins` sees every row, including accounts with wider access than their own: the escalation guard applies to the writes only.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                   |
|-------------|--------|----------|-----------------------------------------------|
| Command     | String | Yes      | API command: `admin.subadmins.get`            |
| SessionID   | String | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmins.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SubAdmins": [
    {
      "AdminID": 2,
      "Name": "Support Desk",
      "Username": "support",
      "EmailAddress": "support@example.com",
      "2FA_Enabled": "No",
      "Options": {
        "AccessLimited": true,
        "AccessAllowedUserGroupIDs": [3],
        "AccessOptions": ["Users", "User.Browse", "User.Edit"]
      },
      "APIKeyIssued": true
    }
  ],
  "TotalSubAdmins": 1
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
99999: Not enough privileges (the caller lacks SubAdmins)
```

:::

## Get a Sub-Admin Account

<Badge type="info" text="GET" /> `/api/v1/admin.subadmin.get`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `GET /api/v1/admin.subadmin.get`. Legacy access via `/api.php` is also supported
:::

Returns one sub-admin account with the same projection as `admin.subadmins.get`. AdminID 1 is refused: the master admin is not a sub-admin and is read through `admin.get` by its own credentials.

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                   |
|-------------|---------|----------|-----------------------------------------------|
| Command     | String  | Yes      | API command: `admin.subadmin.get`             |
| SessionID   | String  | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)       |
| AdminID     | Integer | Yes      | Sub-admin id (greater than 1)                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.get",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 2
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SubAdmin": {
    "AdminID": 2,
    "Name": "Support Desk",
    "Username": "support",
    "EmailAddress": "support@example.com",
    "2FA_Enabled": "No",
    "Options": {
      "AccessLimited": true,
      "AccessAllowedUserGroupIDs": [3],
      "AccessOptions": ["Users", "User.Browse", "User.Edit"]
    },
    "APIKeyIssued": false
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "AdminID does not refer to a sub-admin account."
}
```

```txt [Error Codes]
0: Success
1: AdminID is required
2: AdminID does not refer to a sub-admin account (AdminID 1 or not a positive integer)
3: Sub-admin account not found
99999: Not enough privileges (the caller lacks SubAdmins)
```

:::

## Create a Sub-Admin Account

<Badge type="info" text="POST" /> `/api/v1/admin.subadmin.create`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `POST /api/v1/admin.subadmin.create`. Legacy access via `/api.php` is also supported
:::

Creates an access-limited sub-admin. The same validation the staff Sub-admins screen applies runs here: email and username must be unique across all administrators, `Username` may contain letters, digits, underscores and dashes, and `Permissions` must be an object with two lists, `AccessAllowedUserGroupIDs` (positive integers; empty means every user group) and `AccessOptions` (values from `admin.privileges.get`). `Permissions` may be sent as a JSON object in a JSON body or as a JSON string in a form-encoded body. On a validation failure `ErrorCode` is the list of every failed rule. Disabled in demo mode.

A caller with `Options.AccessLimited` cannot grant more than it holds: every value of `AccessOptions` must be one of its own privileges (`5103`), and a caller limited to some user groups must list at least one group, each of them one of its own (`5104`). The master admin and every admin without `Options.AccessLimited` can grant anything.

**Request Body Parameters:**

| Parameter    | Type          | Required | Description                                                   |
|--------------|---------------|----------|---------------------------------------------------------------|
| Command      | String        | Yes      | API command: `admin.subadmin.create`                          |
| SessionID    | String        | No       | Session ID obtained from `admin.login`                        |
| AdminAPIKey  | String        | No       | Admin API key (master or per-sub-admin)                       |
| Name         | String        | Yes      | Display name                                                  |
| EmailAddress | String        | Yes      | Unique email address                                          |
| Username     | String        | Yes      | Unique login name (letters, digits, underscore, dash)         |
| Password     | String        | Yes      | Initial password                                              |
| Permissions  | Object/String | Yes      | `{"AccessAllowedUserGroupIDs": [...], "AccessOptions": [...]}` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.create",
    "AdminAPIKey": "your-admin-api-key",
    "Name": "Support Desk",
    "EmailAddress": "support@example.com",
    "Username": "support",
    "Password": "aStrongPassword",
    "Permissions": {"AccessAllowedUserGroupIDs": [3], "AccessOptions": ["Users", "User.Browse", "User.Edit"]}
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminID": 2,
  "SubAdmin": {
    "AdminID": 2,
    "Name": "Support Desk",
    "Username": "support",
    "EmailAddress": "support@example.com",
    "2FA_Enabled": "No",
    "Options": {
      "AccessLimited": true,
      "AccessAllowedUserGroupIDs": [3],
      "AccessOptions": ["Users", "User.Browse", "User.Edit"]
    },
    "APIKeyIssued": false
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5103,
  "ErrorText": "You cannot grant a privilege you do not hold yourself."
}
```

```txt [Error Codes]
0: Success
1: Name is required
2: EmailAddress is required
3: Username is required
4: Password is required
5: Permissions is required
6: EmailAddress is not a valid email address
7: Username may only contain letters, digits, underscores and dashes
8: This email address is in use by another administrator
9: This username is in use by another administrator
10: Permissions is not a JSON object
11: AccessAllowedUserGroupIDs is missing, not a list, or contains a non-positive-integer value
12: AccessOptions is missing or not a list
13: AccessOptions contains a privilege that does not exist
20: The sub-admin account could not be created
5103: A restricted caller asked for a privilege it does not hold
5104: A caller limited to some user groups asked for every group (an empty list) or a group outside its own
99999: Not enough privileges (the caller lacks SubAdmins)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Update a Sub-Admin Account

<Badge type="info" text="POST" /> `/api/v1/admin.subadmin.update`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `POST /api/v1/admin.subadmin.update`. Legacy access via `/api.php` is also supported
:::

Updates the supplied fields of an access-limited sub-admin; omitted fields are left unchanged. The validation rules and error codes 1 to 13 are those of `admin.subadmin.create`, applied to the fields present. Only accounts whose `Options.AccessLimited` is true can be edited, so the master admin is refused. The account's two-factor authentication is never touched by this command. A new password, or a new username, signs the sub-admin out of every open session and remembered browser. Disabled in demo mode.

A caller with `Options.AccessLimited` cannot update its own account (`5101`, its name, email and password are changed with `admin.update`), cannot update an account holding a privilege or user group it lacks (`5102`), which covers setting that account's password, and cannot grant more than it holds (`5103`, `5104`, as for `admin.subadmin.create`).

**Request Body Parameters:**

| Parameter    | Type          | Required | Description                                                   |
|--------------|---------------|----------|---------------------------------------------------------------|
| Command      | String        | Yes      | API command: `admin.subadmin.update`                          |
| SessionID    | String        | No       | Session ID obtained from `admin.login`                        |
| AdminAPIKey  | String        | No       | Admin API key (master or per-sub-admin)                       |
| AdminID      | Integer       | Yes      | Sub-admin id                                                  |
| Name         | String        | No       | New display name                                              |
| EmailAddress | String        | No       | New unique email address                                      |
| Username     | String        | No       | New unique login name                                         |
| Password     | String        | No       | New password                                                  |
| Permissions  | Object/String | No       | Replacement `AccessAllowedUserGroupIDs` and `AccessOptions`   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.update",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 2,
    "Name": "Support Desk (EMEA)",
    "Permissions": {"AccessAllowedUserGroupIDs": [3, 4], "AccessOptions": ["Users", "User.Browse"]}
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SubAdmin": {
    "AdminID": 2,
    "Name": "Support Desk (EMEA)",
    "Username": "support",
    "EmailAddress": "support@example.com",
    "2FA_Enabled": "Yes",
    "Options": {
      "AccessLimited": true,
      "AccessAllowedUserGroupIDs": [3, 4],
      "AccessOptions": ["Users", "User.Browse"]
    },
    "APIKeyIssued": true
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5102,
  "ErrorText": "This sub-admin holds privileges or user groups outside your own, so you cannot change it."
}
```

```txt [Error Codes]
0: Success
6-13: Validation failures, as listed for admin.subadmin.create (ErrorCode is a list)
20: AdminID is required
21: Sub-admin account not found
22: This admin account cannot be edited (not AccessLimited, e.g. the master admin)
23: Nothing to update (pass at least one of Name, EmailAddress, Username, Password, Permissions)
24: The sub-admin account could not be updated (nothing changed, retry)
5101: A restricted caller targeted its own account
5102: A restricted caller targeted an account holding privileges or user groups outside its own
5103: A restricted caller asked for a privilege it does not hold
5104: A caller limited to some user groups asked for every group (an empty list) or a group outside its own
99999: Not enough privileges (the caller lacks SubAdmins)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Delete Sub-Admin Accounts

<Badge type="info" text="POST" /> `/api/v1/admin.subadmin.delete`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `POST /api/v1/admin.subadmin.delete`. Legacy access via `/api.php` is also supported
:::

Deletes one or more sub-admin accounts. Ids that do not exist, accounts that are not access-limited (the master admin) and the calling admin's own account are skipped and reported in `SkippedAdminIDs`, so the call is idempotent and can never remove the master admin or the caller. Disabled in demo mode.

A caller with `Options.AccessLimited` is refused before anything is deleted when the list holds its own account (`5101`) or an account holding a privilege or user group it lacks (`5102`). `RefusedAdminID` names the first refused id. An unrestricted caller's own id is still skipped, as before.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                          |
|-------------|--------|----------|------------------------------------------------------|
| Command     | String | Yes      | API command: `admin.subadmin.delete`                 |
| SessionID   | String | No       | Session ID obtained from `admin.login`               |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)              |
| AdminIDs    | String | Yes      | Comma-separated sub-admin ids (a JSON list also works) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.delete",
    "AdminAPIKey": "your-admin-api-key",
    "AdminIDs": "2,3"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DeletedAdminIDs": [2, 3],
  "SkippedAdminIDs": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5102,
  "ErrorText": "This sub-admin holds privileges or user groups outside your own, so you cannot change it.",
  "RefusedAdminID": 3
}
```

```txt [Error Codes]
0: Success
1: AdminIDs is required
5101: A restricted caller listed its own account (nothing was deleted)
5102: A restricted caller listed an account holding privileges or user groups outside its own (nothing was deleted)
99999: Not enough privileges (the caller lacks SubAdmins)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Regenerate a Sub-Admin API Key

<Badge type="info" text="POST" /> `/api/v1/admin.subadmin.apikey.regenerate`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `POST /api/v1/admin.subadmin.apikey.regenerate`. Legacy access via `/api.php` is also supported
:::

Issues a per-sub-admin API key, or rotates the existing one. The key is returned exactly once, in this response; no other command ever returns it (`admin.get`, `admin.subadmin.get` and `admin.subadmins.get` only report `APIKeyIssued`). The previous key stops authenticating immediately. The key is accepted on the `AdminAPIKey` parameter and, when `ADMIN_API_ENFORCE_PRIVILEGES` is on, is limited to the account's `AccessOptions`. Only access-limited accounts can hold a key; the master admin uses `ADMIN_API_KEY`. Disabled in demo mode.

A caller with `Options.AccessLimited` cannot issue a key for its own account (`5101`) or for an account holding a privilege or user group it lacks (`5102`).

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                   |
|-------------|---------|----------|-----------------------------------------------|
| Command     | String  | Yes      | API command: `admin.subadmin.apikey.regenerate` |
| SessionID   | String  | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)       |
| AdminID     | Integer | Yes      | Sub-admin id                                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.apikey.regenerate",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 2
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminID": 2,
  "APIKey": "3f9c2a7b1e4d5c6a8b9d0e1f2a3b4c5d"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "API keys can only be issued for AccessLimited sub-admin accounts. The master admin uses ADMIN_API_KEY."
}
```

```txt [Error Codes]
0: Success
1: AdminID is required
2: Sub-admin account not found
3: Not an AccessLimited sub-admin account
4: The API key could not be generated (no cryptographically strong random source)
5: The API key change could not be saved (run the pending database migrations)
5101: A restricted caller targeted its own account
5102: A restricted caller targeted an account holding privileges or user groups outside its own
99999: Not enough privileges (the caller lacks SubAdmins)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Revoke a Sub-Admin API Key

<Badge type="info" text="POST" /> `/api/v1/admin.subadmin.apikey.revoke`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `POST /api/v1/admin.subadmin.apikey.revoke`. Legacy access via `/api.php` is also supported
:::

Removes the per-sub-admin API key so it stops authenticating immediately. Revoking an account that has no key succeeds. Disabled in demo mode.

A caller with `Options.AccessLimited` cannot revoke the key of its own account (`5101`) or of an account holding a privilege or user group it lacks (`5102`).

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                   |
|-------------|---------|----------|-----------------------------------------------|
| Command     | String  | Yes      | API command: `admin.subadmin.apikey.revoke`   |
| SessionID   | String  | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)       |
| AdminID     | Integer | Yes      | Sub-admin id                                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.apikey.revoke",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 2
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminID": 2,
  "APIKeyIssued": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Sub-admin account not found."
}
```

```txt [Error Codes]
0: Success
1: AdminID is required
2: Sub-admin account not found
3: Not an AccessLimited sub-admin account
4: The API key change could not be saved
5101: A restricted caller targeted its own account
5102: A restricted caller targeted an account holding privileges or user groups outside its own
99999: Not enough privileges (the caller lacks SubAdmins)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Reset a Sub-Admin's Two-Factor Authentication

<Badge type="info" text="POST" /> `/api/v1/admin.subadmin.2fa.reset`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `POST /api/v1/admin.subadmin.2fa.reset`. Legacy access via `/api.php` is also supported
:::

Turns two-factor authentication off for a sub-admin who lost their authenticator: the secret, the recovery key and the enabled flag are cleared, the same change `admin.2fa.disable` makes to the caller's own account. The sub-admin then signs in with their password alone and can turn two-factor authentication on again in Your profile. Resetting an account without two-factor authentication succeeds. Only access-limited accounts can be reset here; the master admin turns its own off with `admin.2fa.disable`. Disabled in demo mode.

A caller with `Options.AccessLimited` cannot reset its own account (`5101`) or an account holding a privilege or user group it lacks (`5102`).

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                   |
|-------------|---------|----------|-----------------------------------------------|
| Command     | String  | Yes      | API command: `admin.subadmin.2fa.reset`       |
| SessionID   | String  | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)       |
| AdminID     | Integer | Yes      | Sub-admin id                                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.2fa.reset",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 2
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminID": 2,
  "2FA_Enabled": "No"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 5101,
  "ErrorText": "An admin account limited to some privileges cannot change its own sub-admin account. Edit your name, email and password in Your profile."
}
```

```txt [Error Codes]
0: Success
1: AdminID is required (or not a positive whole number)
2: Sub-admin account not found
3: Not an AccessLimited sub-admin account
4: Two-factor authentication could not be reset
5101: A restricted caller targeted its own account
5102: A restricted caller targeted an account holding privileges or user groups outside its own
99999: Not enough privileges (the caller lacks SubAdmins)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Sign a Sub-Admin Out of Remembered Browsers

<Badge type="info" text="POST" /> `/api/v1/admin.subadmin.signins.revoke`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- v1 REST alias: `POST /api/v1/admin.subadmin.signins.revoke`. Legacy access via `/api.php` is also supported
:::

Revokes every remember-me token of one sub-admin, for a lost device or a departing teammate: each browser where they ticked **Remember me** on the classic admin sign-in page signs in with the form next time. Other administrators' tokens are untouched (`admin.remembertokens.revokeall` revokes everyone's). A session that is already open stays open until it ends; set a new password with `admin.subadmin.update` to end it as well. `Revoked` is the number of tokens removed, `0` when there were none. Disabled in demo mode.

A caller with `Options.AccessLimited` cannot revoke its own account's tokens here (`5101`) or those of an account holding a privilege or user group it lacks (`5102`).

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                   |
|-------------|---------|----------|-----------------------------------------------|
| Command     | String  | Yes      | API command: `admin.subadmin.signins.revoke`  |
| SessionID   | String  | No       | Session ID obtained from `admin.login`        |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)       |
| AdminID     | Integer | Yes      | Sub-admin id                                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subadmin.signins.revoke",
    "AdminAPIKey": "your-admin-api-key",
    "AdminID": 2
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AdminID": 2,
  "Revoked": 2
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Remembered sign-ins can only be revoked here for AccessLimited sub-admin accounts."
}
```

```txt [Error Codes]
0: Success
1: AdminID is required (or not a positive whole number)
2: Sub-admin account not found
3: Not an AccessLimited sub-admin account
4: The remembered sign-ins could not be revoked
5101: A restricted caller targeted its own account
5102: A restricted caller targeted an account holding privileges or user groups outside its own
99999: Not enough privileges (the caller lacks SubAdmins)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Get User Activity

<Badge type="info" text="GET" /> `/api/v1/admin.users.activity`

::: tip API Usage Notes
- Authentication is done by Admin API Key
- v1 REST alias: `GET /api/v1/admin.users.activity`. Legacy access via `/api.php` is also supported
:::

Retrieves a paginated list of users with their email sending activity status. Users are classified as "Active" or "Idle" based on whether they sent any campaigns or journey emails within the specified activity period. This endpoint provides detailed activity metrics including recent campaign and journey email counts, with support for filtering, searching, and sorting.

**Request Body Parameters:**

| Parameter          | Type    | Required | Description                                                                                      |
|--------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command            | String  | Yes      | API command: `admin.users.activity`                                                              |
| SessionID          | String  | No       | Session ID obtained from login                                                                   |
| APIKey             | String  | No       | API key for authentication                                                                       |
| ActivityPeriod     | Integer | No       | Number of days to look back for activity (1-365, default: 30)                                   |
| ActivityStatus     | String  | No       | Filter by status: `All`, `Active`, `Idle` (default: All)                                        |
| SearchKeyword      | String  | No       | Search by username, email, first name, last name, or company name                               |
| RecordsPerRequest  | Integer | No       | Number of records per request (1-1000, default: 25). Pass `0` for **all** records. <Badge type="tip" text="Fixed in v5.9.3" /> `0` is honoured in every request shape — JSON integer `0`, JSON string `"0"`, and form-encoded `0`. Non-numeric values and booleans now fall back to the default instead of being read as `0`. See the caution below before using `0`. |
| RecordsFrom        | Integer | No       | Offset for pagination (default: 0)                                                               |
| OrderField         | String  | No       | Field to sort by: `Username`, `CompanyName`, `LastActivityDateTime`, `LastSendingActivityDateTime`, `AccountStatus`, `UserActivityStatus`. Any other value is silently ignored — see the sorting note below. |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC` (default: `ASC`). Coerced, not validated — any value other than `DESC` is treated as `ASC`. |

::: warning `RecordsPerRequest: 0` removes the row cap entirely
`0` does not mean "the maximum of 1000" — it removes the `LIMIT` from the query, so the response contains **every** enabled user account matching the filters. On a large installation that is a slow request and a large response body.

Prefer an explicit page size and paginate with `RecordsFrom`. Use `0` only when you genuinely need the whole set in one call and know the account count is manageable.
:::

::: warning Sorting is restricted to an allow-list (v5.9.3, #2321)
`OrderField` accepts only the six columns listed above. A value outside that list is **dropped silently**; if no valid column remains, the endpoint falls back to its default ordering (`UserActivityStatus DESC`, then last activity descending).

`OrderType` is coerced rather than validated: any value that is not `DESC` — including a typo or an unrelated string — becomes `ASC`.

Neither case returns an error. The response is HTTP `200` with `Success: true`, just ordered differently than requested. If results come back in an unexpected order after upgrading, check your `OrderField` against the list above.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.users.activity",
    "APIKey": "your-admin-api-key",
    "ActivityPeriod": 30,
    "ActivityStatus": "Active",
    "RecordsPerRequest": 25,
    "RecordsFrom": 0,
    "OrderField": "LastSendingActivityDateTime",
    "OrderType": "DESC"
  }'
```

```bash [Example Request - Find Idle Users]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.users.activity",
    "APIKey": "your-admin-api-key",
    "ActivityPeriod": 90,
    "ActivityStatus": "Idle",
    "SearchKeyword": "example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Users": [
    {
      "UserID": 5,
      "Username": "john.doe",
      "EmailAddress": "john@example.com",
      "FirstName": "John",
      "LastName": "Doe",
      "CompanyName": "Example Corp",
      "AccountStatus": "Enabled",
      "LastActivityDateTime": "2025-11-15 14:30:00",
      "UserActivityStatus": "Active",
      "RecentCampaignsSent": 3,
      "RecentJourneyEmailsSent": 125,
      "LastSendingActivityDateTime": "2025-11-15 14:30:00"
    },
    {
      "UserID": 12,
      "Username": "jane.smith",
      "EmailAddress": "jane@example.com",
      "FirstName": "Jane",
      "LastName": "Smith",
      "CompanyName": "Test Inc",
      "AccountStatus": "Enabled",
      "LastActivityDateTime": "2025-10-05 10:15:00",
      "UserActivityStatus": "Idle",
      "RecentCampaignsSent": 0,
      "RecentJourneyEmailsSent": 0,
      "LastSendingActivityDateTime": null
    }
  ],
  "TotalUsers": 45,
  "ActivityPeriod": 30,
  "ActivityStatus": "Active"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Activity period must be a number between 1 and 365 days"
}
```

```txt [Error Codes]
0: Success
2: Database query failed
3: Database count query failed
4: Activity period must be a number between 1 and 365 days
5: Activity status must be one of: All, Active, Idle
6: Records per request must be a number between 0 and 1000
7: Records from must be a non-negative number
```

:::

## Get User Activity Summary

<Badge type="info" text="GET" /> `/api/v1/admin.users.activity.summary`

::: tip API Usage Notes
- Authentication is done by Admin API Key
- v1 REST alias: `GET /api/v1/admin.users.activity.summary`. Legacy access via `/api.php` is also supported
:::

Retrieves summary statistics of user activity, showing counts and percentages of Active vs. Idle users. Users are classified based on whether they sent any campaigns or journey emails within the specified activity period. This endpoint is useful for dashboard displays and quick activity overview.

**Request Body Parameters:**

| Parameter      | Type    | Required | Description                                                                                      |
|----------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command        | String  | Yes      | API command: `admin.users.activity.summary`                                                      |
| SessionID      | String  | No       | Session ID obtained from login                                                                   |
| APIKey         | String  | No       | API key for authentication                                                                       |
| ActivityPeriod | Integer | No       | Number of days to look back for activity (1-365, default: 30)                                   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.users.activity.summary",
    "APIKey": "your-admin-api-key",
    "ActivityPeriod": 30
  }'
```

```bash [Example Request - 90 Day Period]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.users.activity.summary",
    "APIKey": "your-admin-api-key",
    "ActivityPeriod": 90
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Summary": [
    {
      "UserActivityStatus": "Active",
      "UserCount": 35,
      "Percentage": 70
    },
    {
      "UserActivityStatus": "Idle",
      "UserCount": 15,
      "Percentage": 30
    }
  ],
  "TotalUsers": 50,
  "ActivityPeriod": 30
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Activity period must be a number between 1 and 365 days"
}
```

```txt [Error Codes]
0: Success
2: Database query failed
3: Activity period must be a number between 1 and 365 days
```

:::

## Unstuck a Stuck Campaign

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.unstuck`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Reports`, checked in the handler since v6.0.2
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Manually unstucks a stuck campaign by resetting stuck batches to Pending status. This endpoint verifies the campaign is actually stuck before resetting batches. A campaign is considered stuck when batches remain in "Working" status with no activity (no ping updates for over 60 seconds) or when batches have a "Working" status but no assigned ProcessID.

The endpoint performs the following operations atomically:
1. Validates the campaign exists and is in "Sending" status
2. Checks if the campaign is actually stuck using health metrics
3. Resets stuck batches to "Pending" status
4. Updates campaign's last activity timestamp
5. Logs the unstuck action in the stuck campaigns log

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                                         |
|------------|---------|----------|---------------------------------------------------------------------|
| Command    | String  | Yes      | API command: `admin.campaign.unstuck`                               |
| SessionID  | String  | No       | Session ID obtained from login                                      |
| APIKey     | String  | No       | API key for authentication                                          |
| CampaignID | Integer | Yes      | Campaign ID to unstuck. Must be a campaign in "Sending" status.     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.unstuck \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.unstuck",
    "APIKey": "your-admin-api-key",
    "CampaignID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "BatchesReset": 5,
  "Message": "Campaign unstuck successfully. 5 batch(es) reset to Pending status."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Campaign is not stuck. The campaign appears to be processing normally."
}
```

```txt [Error Codes]
0: Success
1: campaign_id parameter is required
2: Campaign not found
3: Campaign is not in Sending status. Only campaigns in Sending status can be unstuck.
4: Campaign is not stuck. The campaign appears to be processing normally.
5: Database error during unstuck operation
11: Access denied to this campaign (restricted sub-admin, issue #2856)
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Mark Campaign as Failed

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.markfailed`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Reports`, checked in the handler since v6.0.2
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Marks a stuck campaign as failed by completing all pending/working batches and setting the campaign status to Failed. This endpoint verifies the campaign is actually stuck before marking it as failed. Use this endpoint when a campaign cannot be recovered through the unstuck operation or when you need to definitively end a problematic campaign.

The endpoint performs the following operations atomically:
1. Validates the campaign exists and is in "Sending" status
2. Checks if the campaign is actually stuck using health metrics
3. Marks all pending/working batches as "Completed"
4. Updates campaign status to "Failed" with reason
5. Sets SendProcessFinishedOn timestamp
6. Logs the action in the stuck campaigns log

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                                         |
|------------|---------|----------|---------------------------------------------------------------------|
| Command    | String  | Yes      | API command: `admin.campaign.markfailed`                            |
| SessionID  | String  | No       | Session ID obtained from login                                      |
| APIKey     | String  | No       | API key for authentication                                          |
| CampaignID | Integer | Yes      | Campaign ID to mark as failed. Must be a stuck campaign in "Sending" status. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.markfailed \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.markfailed",
    "APIKey": "your-admin-api-key",
    "CampaignID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "BatchesCompleted": 5,
  "Message": "Campaign marked as failed successfully. 5 batch(es) completed."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "Campaign is not stuck. Only stuck campaigns can be marked as failed."
}
```

```txt [Error Codes]
0: Success
1: campaign_id parameter is required
2: Campaign not found
3: Campaign is not in Sending status. Only campaigns in Sending status can be marked as failed.
4: Campaign is not stuck. Only stuck campaigns can be marked as failed.
5: Database error during mark as failed operation
11: Access denied to this campaign (restricted sub-admin, issue #2856)
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Retry Failed Recipients

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.retryfailed`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Reports`, checked in the handler since v6.0.2
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retries failed recipients for campaigns with status "Sent" or "Failed". This endpoint resets failed queue entries to Pending, creates new delivery batches, sets the campaign to "Sending" status, and pushes it to RabbitMQ for delivery workers to process.

**Important:** This endpoint bypasses the campaign picker and handles batch creation and RabbitMQ publishing directly. This ensures only the original failed recipients are retried without re-inserting subscribers who joined target lists after the original send.

::: warning If delivery cannot be dispatched
The database work (resetting failed recipients to `Pending`, creating batches, moving the campaign to `Sending`) is committed **before** the campaign is published to the message queue. The publish is retried up to three times.

If it still fails, for example while the message queue service is unreachable, the committed work is **deliberately not rolled back**: the recipients stay re-queued and the campaign stays in `Sending`. The response reports `ErrorCode 6` with an `ErrorText` saying exactly that, and naming the recovery action.

Because the campaign then has pending batches with no worker processing them, it is reported as stuck. Resume delivery with [Unstuck a Stuck Campaign](#unstuck-a-stuck-campaign) (`admin.campaign.unstuck`). Calling `admin.campaign.retryfailed` again will **not** help: it rejects campaigns already in `Sending` status with `ErrorCode 3`.
:::

::: tip Changed in v5.9.3: a failed COMMIT is now reported
The transaction's `COMMIT` result was not inspected. A failed commit fell through to the message-queue publish and the endpoint could return `Success: true` for work that never became durable, and a delivery worker consuming that message would find the campaign without its new pending batches.

A failed commit is now caught and returned as `ErrorCode 6` with the "Database error" wording. Conversely, a message-queue dispatch failure *after* a successful commit is no longer misreported as a database error accompanied by a no-op `ROLLBACK`; it gets its own explicit `ErrorText`, as described above.
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                           |
|------------|---------|----------|-------------------------------------------------------|
| Command    | String  | Yes      | API command: `admin.campaign.retryfailed`             |
| SessionID  | String  | No       | Session ID obtained from login                        |
| APIKey     | String  | No       | API key for authentication                            |
| CampaignID | Integer | Yes      | ID of the campaign to retry failed recipients for     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.retryfailed \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.retryfailed",
    "APIKey": "your-admin-api-key",
    "CampaignID": 4069
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "RetriedCount": 150,
  "BatchesCreated": 1,
  "Message": "150 failed recipients queued for retry in 1 batch(es)."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Campaign is not in Sent or Failed status. Only completed or failed campaigns can have their failed recipients retried."
}
```

```json [Error Response: delivery not dispatched]
{
  "Success": false,
  "ErrorCode": 6,
  "ErrorText": "150 failed recipients were re-queued and the campaign is now in Sending status, but the delivery queue could not be notified after 3 attempts, so no delivery worker has started. Nothing was rolled back. Once the message queue service is reachable again, resume delivery with the campaign unstuck action (admin.campaign.unstuck). Message queue error: ..."
}
```

```txt [Error Codes]
0: Success
1: campaign_id parameter is required
2: Campaign not found
3: Campaign is not in Sent or Failed status
4: Queue table does not exist for this campaign
5: No failed recipients found for this campaign
6: Database error during retry operation, or the retry was committed but the campaign
   could not be dispatched to the delivery queue. The ErrorText distinguishes the two.
11: Access denied to this campaign (restricted sub-admin, issue #2856)
99999: Not enough privileges (sub-admin without Reports)
```

:::

## Reject a Campaign

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.reject`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Reports`, and `User.Edit` when `Message` is sent
- Rate limit: 100 requests per 60 seconds
- Not available to AI assistant (agent) keys: the operator rejects campaigns in the admin area
- Added in v6.0.2
:::

Sends a campaign that is waiting for approval (`CampaignStatus` `Pending Approval`) back to its owner as a `Draft`. Any approval recorded on the campaign is removed and its content screening hold is cleared, so the campaign is reviewed again when its owner schedules it. The owner can optionally be told why by email, with the same mailer as `admin.user.message.send`.

`ExpectedFingerprint` is the `ApprovalFingerprint` of the version you reviewed (from `admin.campaigns.search` with `ApprovalContext=true`, or from `admin.campaign.preview`). When the campaign changed since, nothing is rejected (`ErrorCode 4`). Only a `Pending Approval` campaign is rejected, and the status is checked in the write itself, so a campaign approved, paused or withdrawn by someone else at the same moment is refused with `ErrorCode 5`. An approve and a reject of the same campaign can never both succeed.

A sub-admin limited to some user groups may only reject campaigns of accounts in those groups, and gets `ErrorCode 5003` for any other campaign and for a campaign that does not exist. `CampaignID` must be a plain positive integer, and any other form (for example `1.234e3`, `5.0` or a value with spaces) is answered with `ErrorCode 2`.

A message that cannot be delivered does not undo the rejection: the response has `MessageSent: false` and the reason in `MessageError`.

**Request Body Parameters:**

| Parameter           | Type    | Required | Description |
|---------------------|---------|----------|-------------|
| Command             | String  | Yes      | API command: `admin.campaign.reject` |
| AdminAPIKey         | String  | Yes      | Admin API key |
| CampaignID          | Integer | Yes      | The campaign to reject. Must be `Pending Approval` |
| ExpectedFingerprint | String  | Yes      | `ApprovalFingerprint` of the version you reviewed |
| Message             | String  | No       | Plain text to the campaign owner, at most 5000 characters. HTML is shown as text, line breaks are kept. Needs the `User.Edit` privilege |
| Subject             | String  | No       | Subject of that email, at most 255 characters. Default `Your campaign was not approved: <campaign name>` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.reject \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.reject",
    "AdminAPIKey": "your-admin-api-key",
    "CampaignID": 123,
    "ExpectedFingerprint": "3f1c...e9",
    "Message": "Please remove the shortened links and schedule the campaign again."
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignID": 123,
  "CampaignStatus": "Draft",
  "MessageSent": true
}
```

```json [Message Not Delivered]
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignID": 123,
  "CampaignStatus": "Draft",
  "MessageSent": false,
  "MessageError": "Message could not be sent: the mail transport gave no reason. Check the system email settings."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "The campaign changed after you opened it for review. Review it again before rejecting it."
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (CampaignID)
2: Campaign not found, or CampaignID is not a plain positive integer
3: Missing required parameter (ExpectedFingerprint)
4: The campaign changed after it was reviewed (ExpectedFingerprint does not match), review it again
5: The campaign is not Pending Approval (also when it was approved, paused, cancelled or moved back to Draft while it was being rejected), nothing was changed
6: The campaign could not be read or written to record the rejection (retry)
7: Message is longer than 5000 characters
8: Subject is longer than 255 characters
9: Sending a message to the campaign owner needs the User.Edit privilege
5003: The campaign was not found or belongs to an account outside the user groups this sub-admin may access
```

:::

## Preview a Campaign for Review

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.preview`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Reports`
- Rate limit: 100 requests per 60 seconds
- Added in v6.0.2
:::

Returns the email of a campaign as it is stored, for an administrator reviewing it, together with the `ApprovalFingerprint` to send back to `campaign.approve` or `admin.campaign.reject`, so you approve or reject exactly the version you read. Merge tags are not rendered, no subscriber data is read, and remote content (`FetchURL`) is never fetched: the URL is returned for you to see.

A sub-admin limited to some user groups may only preview campaigns of accounts in those groups, and gets `ErrorCode 5003` for any other campaign and for a campaign that does not exist. `EmailID` must be one of the campaign's emails (`EmailIDs` in the response: the campaign email, its A/B variations and split test emails). `CampaignID` and `EmailID` must be plain positive integers, and any other value is answered like a missing campaign (`ErrorCode 2`).

`HTMLContent` is the customer's HTML and must be treated as untrusted. Render it only inside a sandboxed iframe (`<iframe sandbox srcdoc="...">` with no `allow-scripts` and no `allow-same-origin`), never inline in your page, and show every other field as plain text.

**Request Body Parameters:**

| Parameter   | Type    | Required | Description |
|-------------|---------|----------|-------------|
| Command     | String  | Yes      | API command: `admin.campaign.preview` |
| AdminAPIKey | String  | Yes      | Admin API key |
| CampaignID  | Integer | Yes      | The campaign to preview, in any status |
| EmailID     | Integer | No       | One of the campaign's `EmailIDs`. Default the campaign's email |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.preview \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.preview",
    "AdminAPIKey": "your-admin-api-key",
    "CampaignID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignID": 123,
  "CampaignName": "October newsletter",
  "CampaignStatus": "Pending Approval",
  "OwnerUserID": 45,
  "EmailID": 678,
  "EmailIDs": [678, 679],
  "Subject": "Our October picks",
  "PreHeaderText": "",
  "FromName": "Example Shop",
  "FromEmail": "news@example.com",
  "ReplyToName": "",
  "ReplyToEmail": "",
  "ContentType": "HTML",
  "HTMLContent": "<p>Hello %Subscriber:FirstName%</p>",
  "PlainContent": "",
  "FetchURL": "",
  "FetchPlainURL": "",
  "ApprovalFingerprint": "3f1c...e9"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Campaign or email not found"
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (CampaignID)
2: Campaign or email not found, EmailID is not one of the campaign's emails, or an id is not a plain positive integer
3: The campaign could not be read, or its owner kept changing it while it was being read (retry)
5003: The campaign was not found or belongs to an account outside the user groups this sub-admin may access
```

:::

`ApprovalFingerprint` always describes the content in the same response: it is read before and after the content, and the read is repeated when the owner changed the campaign in between. It is null when the campaign could not be read to compute it.

## Get Database Table Statistics

<Badge type="info" text="GET" /> `/api/v1/admin.database.stats`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retrieves database table statistics including row counts, data sizes, index sizes, and total sizes for all tables in the current database. Results are ordered by total size (descending). A summary object with aggregate totals is also included.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| Command   | String | Yes      | API command: `admin.database.stats`      |
| SessionID | String | No       | Session ID obtained from login           |
| APIKey    | String | No       | API key for authentication               |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.database.stats?APIKey=your-admin-api-key"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Tables": [
    {
      "TableName": "oempro_stats_open",
      "Engine": "InnoDB",
      "TableRows": 7678970,
      "DataMB": 597.00,
      "IndexMB": 3094.09,
      "TotalMB": 3691.09
    },
    {
      "TableName": "oempro_campaigns",
      "Engine": "InnoDB",
      "TableRows": 1250,
      "DataMB": 12.45,
      "IndexMB": 3.21,
      "TotalMB": 15.66
    }
  ],
  "Summary": {
    "TotalTables": 85,
    "TotalDataMB": 234.56,
    "TotalIndexMB": 89.12,
    "TotalSizeMB": 323.68
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Database query failed"
}
```

```txt [Error Codes]
0: Success
1: Database query failed
```

:::

## Check Database Tables

<Badge type="info" text="GET" /> `/api/v1/admin.database.check`

<Badge type="tip" text="New in v5.9.6" />

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `System`)
- Rate limit: 10 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
- `CHECK TABLE` reads every page of every table it covers. Run `Scope=All` off-peak; see the scope note below.
:::

Runs MySQL `CHECK TABLE` over Octeth's tables and returns one row per table with MySQL's own `Msg_type` / `Msg_text`. This is the API form of the About page's database health panel. A table is flagged `HasIssue` when its final status row is anything other than `status` / `OK`, including a synthetic `error` row when the statement for that table's batch failed (so "not checked" is never reported as healthy).

**Scope.** Octeth creates one table per list (`oempro_subscribers_<ListID>`), per campaign (`oempro_queue_c_<CampaignID>`) and per day (`oempro_email_metrics_<yyyymmdd>` and `oempro_email_metrics_aggregated_<yyyymmdd>`). On a mature install those outnumber the roughly 300 core tables twenty to one and hold nearly all the data. The default `Scope=Core` covers only the core tables. `Scope=All` covers every table: it is a full read of the database through the InnoDB buffer pool, takes minutes, and on a host whose buffer pool is sized close to its RAM it can exhaust memory. Name specific tables with `Tables` to check the per-entity tables you care about.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                                                                                      |
|-------------|--------|----------|------------------------------------------------------------------------------------------------------------------|
| Command     | String | Yes      | API command: `admin.database.check`                                                                              |
| AdminAPIKey | String | Yes      | Admin API key                                                                                                    |
| Scope       | String | No       | `Core` (default): the core schema tables only. `All`: every Octeth table. Ignored when `Tables` is given.         |
| Tables      | String | No       | Comma-separated list or JSON array of table names to check, e.g. `oempro_subscribers_12,oempro_queue_c_6014`. Every name must be an existing Octeth table (`ErrorCode 2` otherwise). Omit the parameter entirely to use `Scope`: supplying it while naming no table (`Tables=`, or a JSON `"Tables": []`) is `ErrorCode 2`, never a fall-back to `Scope`. |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.database.check?AdminAPIKey=your-admin-api-key&Tables=oempro_admins,oempro_subscribers_12"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Scope": "Tables",
  "Tables": [
    {
      "TableName": "oempro_admins",
      "Operation": "check",
      "MessageType": "status",
      "MessageText": "OK",
      "HasIssue": false
    },
    {
      "TableName": "oempro_subscribers_12",
      "Operation": "check",
      "MessageType": "error",
      "MessageText": "Table './oempro/oempro_subscribers_12' is marked as crashed and should be repaired",
      "HasIssue": true
    }
  ],
  "TotalTables": 2,
  "TablesWithIssues": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Tables must name existing Octeth tables",
  "UnknownTables": ["oempro_nope"]
}
```

```txt [Error Codes]
0: Success
1: Database check query failed (the table list could not be read)
2: Tables was supplied but names no table, or names a table that is not an Octeth table
3: Scope is not Core or All
99998: Authentication failure
99999: Not enough privileges
```

:::

## Repair Database Tables

<Badge type="info" text="POST" /> `/api/v1/admin.database.repair`

<Badge type="tip" text="New in v5.9.6" />

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `System`)
- Rate limit: 10 requests per 300 seconds
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
:::

Runs MySQL `REPAIR TABLE` over Octeth's tables and returns MySQL's per-table result rows. This is the API form of the About page's "Repair database" button, which discards those rows. Every Octeth table uses InnoDB, and InnoDB does not support `REPAIR TABLE`: MySQL answers one `note` row per table saying so, and that row is passed through unchanged so you see what MySQL said. The command exists for the MyISAM case and for parity with the screen; for InnoDB corruption use `admin.database.check` to find the table and MySQL's own recovery procedure.

`Scope` and `Tables` work exactly as on `admin.database.check` (default `Scope=Core`).

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                                                           |
|-------------|--------|----------|---------------------------------------------------------------------------------------|
| Command     | String | Yes      | API command: `admin.database.repair`                                                  |
| AdminAPIKey | String | Yes      | Admin API key                                                                         |
| Scope       | String | No       | `Core` (default) or `All`. Ignored when `Tables` is given.                            |
| Tables      | String | No       | Comma-separated list or JSON array of existing Octeth table names to repair. Omit it to use `Scope`; supplying it while naming no table is `ErrorCode 2`. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.database.repair \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.database.repair",
    "AdminAPIKey": "your-admin-api-key",
    "Tables": ["oempro_admins"]
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Scope": "Tables",
  "Tables": [
    {
      "TableName": "oempro_admins",
      "Operation": "repair",
      "MessageType": "note",
      "MessageText": "The storage engine for the table doesn't support repair"
    }
  ],
  "TotalTables": 1
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
1: Database repair query failed (the table list could not be read)
2: Tables was supplied but names no table, or names a table that is not an Octeth table
3: Scope is not Core or All
NOT AVAILABLE IN DEMO MODE.: DEMO_MODE_ENABLED is on
99998: Authentication failure
99999: Not enough privileges
```

:::

## List DNS Template Names

<Badge type="info" text="GET" /> `/api/v1/admin.dnstemplates.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `GET /api/v1/admin.dnstemplates.get`. Legacy access via `/api.php` is also supported
- The names of the sender-domain DNS record templates the install ships (`EMAILGATEWAY_DNS_TEMPLATES` and `EMAILCAMPAIGN_DNS_TEMPLATES`). Only names are returned; the record bodies are expanded per domain when a sender domain is created.
:::

`TrackingWarnings` lists, per template group, only the templates with a warning. `EmptyRecordSet`: the template has no records, so domains created from it verify without any DNS lookup (this is the case for the shipped `Default` templates, whose records are commented out). `NoTrackingRecord`: the template lists no tracking host for the global subdomain and tracking prefix settings (for example `track-sl._SenderDomain_` with the defaults), so domains created from it have no tracking host of their own. A template that lists the tracking host in either the campaign or the gateway form is not reported.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.dnstemplates.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| IncludeTrackingCheck <Badge type="tip" text="New in v6.0.2" /> | Boolean | No | When true (`1`, `true`, `yes` or `on`), adds `TrackingWarnings`: the templates that give a domain no tracking host of its own. Absent or any other value leaves the response unchanged (issue #3310) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.dnstemplates.get", "APIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "DNSTemplates": {"EmailGateway": ["Default"], "EmailCampaign": ["Default"]}
}
```

```json [Response with IncludeTrackingCheck]
{
  "Success": true,
  "ErrorCode": 0,
  "DNSTemplates": {"EmailGateway": ["Default"], "EmailCampaign": ["Default", "Branded"]},
  "TrackingWarnings": {
    "EmailGateway": [{"Template": "Default", "Warning": "EmptyRecordSet"}],
    "EmailCampaign": [
      {"Template": "Default", "Warning": "EmptyRecordSet"}
    ]
  }
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

## List Theme Templates

<Badge type="info" text="GET" /> `/api/v1/admin.themes.templates.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- v1 REST alias: `GET /api/v1/admin.themes.templates.get`. Legacy access via `/api.php` is also supported
- The UI templates installed under `templates/`, each with the CSS settings its stylesheet exposes to the theme editor. `theme.create` / `theme.update` take a `Template` code from this list.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.themes.templates.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.themes.templates.get", "APIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Templates": [
    {
      "Code": "weefive",
      "Name": "Weefive",
      "Description": "Default template",
      "CSSSettings": [{"Tag": "PrimaryColor", "Description": "Primary colour", "Default": "#0057ff"}]
    }
  ],
  "TotalTemplates": 1
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

## List Installed Plugins

<Badge type="info" text="GET" /> `/api/v1/admin.plugins.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the classic Plugins page did (answers `99999` without it)
- v1 REST alias: `GET /api/v1/admin.plugins.get`. Legacy access via `/api.php` is also supported
- Every plugin under `plugins/` with a parsable header. `Enabled` reflects the `ENABLED_PLUGINS` setting.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.plugins.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| IncludeCompatibility | Boolean | No | `true` or `1` adds `Compatible` to each plugin: whether this install's version meets the plugin's `MinOemproVersion`. **New in v6.0.2.** Without it the response is unchanged |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.plugins.get", "APIKey": "your-admin-api-key"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Plugins": [
    {"Code": "lindris", "Name": "Lindris", "Description": "AI assistant", "MinOemproVersion": "5.0.0", "Enabled": true}
  ],
  "TotalPlugins": 1
}
```

```json [Success Response with IncludeCompatibility]
{
  "Success": true,
  "ErrorCode": 0,
  "Plugins": [
    {"Code": "lindris", "Name": "Lindris", "Description": "AI assistant", "MinOemproVersion": "5.0.0", "Enabled": true, "Compatible": true},
    {"Code": "future", "Name": "Future", "Description": "Needs a newer Octeth", "MinOemproVersion": "9.0.0", "Enabled": false, "Compatible": false}
  ],
  "TotalPlugins": 2
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
99999: Not enough privileges (the admin account does not hold Settings)
```

:::

## Enable Plugin

<Badge type="info" text="POST" /> `/api/v1/admin.plugin.enable`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the classic Plugins page did (answers `99999` without it)
- v1 REST alias: `POST /api/v1/admin.plugin.enable`. Legacy access via `/api.php` is also supported
- Runs the same sequence as the staff Settings > Plugins screen: validates the code against the plugins on disk, adds it to `ENABLED_PLUGINS`, includes the plugin and runs its `enable_<code>()` lifecycle hook (table creation, option seeding), then its `load_<code>()`. This is what writing `EnabledPlugins` through `settings.update` does NOT do.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.plugin.enable` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| PluginCode | String | Yes     | Plugin code (directory name), see `admin.plugins.get` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.plugin.enable", "APIKey": "your-admin-api-key", "PluginCode": "lindris"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "PluginCode": "lindris",
  "PluginName": "Lindris",
  "EnabledPlugins": ["prometheus", "lindris"]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Plugin \"lindris\" is already enabled."
}
```

```txt [Error Codes]
0: Success
1: PluginCode is missing
2: PluginCode is not an installed plugin
3: The plugin is already enabled
99999: Not enough privileges (the admin account does not hold Settings)
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## Disable Plugin

<Badge type="info" text="POST" /> `/api/v1/admin.plugin.disable`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Settings`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the classic Plugins page did (answers `99999` without it)
- v1 REST alias: `POST /api/v1/admin.plugin.disable`. Legacy access via `/api.php` is also supported
- Removes the code from `ENABLED_PLUGINS` and runs the plugin's `disable_<code>()` lifecycle hook, exactly like the staff Settings > Plugins screen.
:::

::: warning
For most plugins, `disable_<code>()` drops the plugin's tables and settings, and enabling the plugin again does not restore them. A plugin worker started by supervisord keeps running until it is restarted.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.plugin.disable` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |
| PluginCode | String | Yes     | Plugin code (directory name), see `admin.plugins.get` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"Command": "admin.plugin.disable", "APIKey": "your-admin-api-key", "PluginCode": "lindris"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "PluginCode": "lindris",
  "PluginName": "Lindris",
  "EnabledPlugins": ["prometheus"]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Plugin \"nope\" is not installed. See admin.plugins.get."
}
```

```txt [Error Codes]
0: Success
1: PluginCode is missing
2: PluginCode is not an installed plugin
3: The plugin is already disabled
99999: Not enough privileges (the admin account does not hold Settings)
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## List Stuck Journey Entries

<Badge type="info" text="GET" /> `/api/v1/admin.journeys.stuck`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns a list of journeys that have stuck entries. An entry is considered "stuck" when a journey worker picked it up (set `ActionUpdatedAt`) but the worker process was terminated before completing the action, leaving `SnoozedUntil` as `NULL`. Stuck entries are identified as those with `ActionUpdatedAt` older than 5 minutes and `SnoozedUntil` being `NULL`.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.journeys.stuck`   |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/admin.journeys.stuck \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.journeys.stuck",
    "APIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalStuckEntries": 15,
  "Journeys": [
    {
      "JourneyID": 42,
      "JourneyName": "Welcome Series",
      "RelUserID": 1,
      "StuckCount": 10
    },
    {
      "JourneyID": 87,
      "JourneyName": "Re-engagement Flow",
      "RelUserID": 1,
      "StuckCount": 5
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Database query failed"
}
```

```txt [Error Codes]
0: Success
1: Database query failed
```

:::

## Unstick Stuck Journey Entries

<Badge type="info" text="POST" /> `/api/v1/admin.journeys.unstuck`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Resets stuck journey entries by setting `ActionUpdatedAt` to `NULL` so they get picked up again by the journey worker on its next iteration. Can target all stuck entries or entries for a specific journey.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                 |
|-----------|---------|----------|-----------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `admin.journeys.unstuck`                                       |
| SessionID | String  | No       | Session ID obtained from login                                              |
| APIKey    | String  | No       | API key for authentication                                                  |
| JourneyID | Integer | No       | If provided, only unstick entries for this journey. If omitted, unstick all. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.journeys.unstuck \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.journeys.unstuck",
    "APIKey": "your-admin-api-key",
    "JourneyID": 42
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "EntriesReset": 5,
  "Message": "5 stuck journey entry(ies) have been reset."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "No stuck entries found"
}
```

```txt [Error Codes]
0: Success
1: Journey not found (when JourneyID is provided but invalid)
2: No stuck entries found
3: Database error during unstuck operation
```

:::

## Get Pending Journey Entry Count

<Badge type="info" text="GET" /> `/api/v1/admin.journeys.pending`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the total number of journey entries waiting to be picked up by journey workers, with a per-user breakdown. This helps identify bottlenecks when workers cannot keep up with incoming entries. A "pending" entry matches the same criteria as the worker picking query: the journey must be enabled, the entry must have an action assigned, and the entry must be either fresh (never picked), snoozed and ready, or stuck.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                             |
|-----------|--------|----------|-----------------------------------------|
| Command   | String | Yes      | API command: `admin.journeys.pending`   |
| SessionID | String | No       | Session ID obtained from login          |
| APIKey    | String | No       | API key for authentication              |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/admin.journeys.pending \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.journeys.pending",
    "APIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalPendingEntries": 1523,
  "Users": [
    {
      "UserID": 1,
      "Username": "john",
      "PendingCount": 1200
    },
    {
      "UserID": 2,
      "Username": "jane",
      "PendingCount": 323
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Database query failed"
}
```

```txt [Error Codes]
0: Success
1: Database query failed
```

:::

## Get Journey Queue Overview

<Badge type="info" text="GET" /> `/api/v1/admin.journeys.overview`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns queue state counts, throughput metrics, and worker health for monitoring journey queue backlogs and processing performance. Useful for dashboards, incident response, and integration with external monitoring tools.

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                      |
|-------------|---------|----------|--------------------------------------------------|
| Command     | String  | Yes      | API command: `admin.journeys.overview`            |
| AdminAPIKey | String  | Yes      | Admin API key for authentication                  |
| JourneyID   | Integer | No       | Filter stats to a specific journey                |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.journeys.overview?AdminAPIKey=your-admin-api-key&JourneyID=42"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "QueueStats": {
    "TotalActive": 1523,
    "NeverTouched": 500,
    "WaitingForNextPass": 1023,
    "SnoozedCount": 200,
    "OverdueCount": 823,
    "StuckCount": 15,
    "InProgressCount": 485,
    "EstimatedDrainMinutes": 45.2
  },
  "Throughput": {
    "PerMinute": 18.2,
    "PerSecond": 0.3,
    "MeasurementWindowMinutes": 5,
    "CompletionsInWindow": 91
  },
  "Workers": {
    "Total": 3,
    "Healthy": 2,
    "Unhealthy": 1
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid journey_id parameter"
}
```

```txt [Error Codes]
0: Success
1: Database query failed
2: Invalid journey_id parameter
```

:::

## List Journey Queue Entries

<Badge type="info" text="GET" /> `/api/v1/admin.journeys.queue`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns a paginated list of journey queue entries with subscriber details, action information, touch state, and due timestamps. Supports filtering by journey, action, and queue status.

**Request Body Parameters:**

| Parameter         | Type    | Required | Description                                                                                                                   |
|-------------------|---------|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Command           | String  | Yes      | API command: `admin.journeys.queue`                                                                                            |
| AdminAPIKey       | String  | Yes      | Admin API key for authentication                                                                                               |
| JourneyID         | Integer | No       | Filter to a specific journey                                                                                                   |
| ActionID          | Integer | No       | Filter to a specific action                                                                                                    |
| Status            | String  | No       | Queue status filter. Possible values: `all`, `overdue`, `snoozed`, `never_touched`, `waiting`. Default: `all`                  |
| SearchKeyword     | String  | No       | Filter by subscriber email address (partial match). LIKE wildcards `%` and `_` in input are treated as literal characters       |
| RecordsPerRequest | Integer | No       | Page size (default: 25, max: 500)                                                                                              |
| RecordsFrom       | Integer | No       | Offset for pagination (default: 0)                                                                                             |
| OrderField        | String  | No       | Sort field. Possible values: `EntryID`, `CreatedAt`, `SnoozedUntil`. Default: `EntryID`                                       |
| OrderType         | String  | No       | Sort direction. Possible values: `ASC`, `DESC`. Default: `ASC`                                                                 |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.journeys.queue?AdminAPIKey=your-admin-api-key&JourneyID=42&Status=overdue&RecordsPerRequest=10&RecordsFrom=0"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalQueueEntries": 1523,
  "QueueEntries": [
    {
      "EntryID": 101,
      "RelUserID": 1,
      "RelJourneyID": 42,
      "JourneyName": "Welcome Series",
      "RelListID": 5,
      "RelSubscriberID": 999,
      "EmailAddress": "user@example.com",
      "RelActionID": 7,
      "ActionType": "SendEmail",
      "ActionOrderNo": 3,
      "TouchState": "NeverTouched",
      "DueAt": "2026-04-03 10:00:00",
      "CreatedAt": "2026-04-03 09:55:00",
      "ActionUpdatedAt": null,
      "SnoozedUntil": null
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid status parameter. Allowed values: all, overdue, snoozed, never_touched, waiting"
}
```

```txt [Error Codes]
0: Success
1: Database query failed
2: Invalid parameter value
```

:::

## Get Subscriber Queue Position

<Badge type="info" text="GET" /> `/api/v1/admin.journey.queue.position`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Given a subscriber identifier (entry ID, subscriber ID, or email address), returns the position in the processing queue, estimated time until processing, and current action details. At least one lookup parameter (`EntryID`, `SubscriberID`, or `Email`) must be provided.

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                                                                                        |
|--------------|---------|----------|----------------------------------------------------------------------------------------------------|
| Command      | String  | Yes      | API command: `admin.journey.queue.position`                                                        |
| AdminAPIKey  | String  | Yes      | Admin API key for authentication                                                                   |
| EntryID      | Integer | No       | Direct lookup by queue entry ID                                                                    |
| SubscriberID | Integer | No       | Lookup by subscriber ID                                                                            |
| Email        | String  | No       | Lookup by email address (requires `ListID`)                                                        |
| ListID       | Integer | No       | Narrow scope for subscriber or email lookup. Required when using `Email`                           |
| JourneyID    | Integer | No       | Filter to a specific journey                                                                       |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.journey.queue.position?AdminAPIKey=your-admin-api-key&Email=user@example.com&ListID=5"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Entries": [
    {
      "EntryID": 101,
      "RelJourneyID": 42,
      "JourneyName": "Welcome Series",
      "RelListID": 5,
      "RelSubscriberID": 999,
      "EmailAddress": "user@example.com",
      "Position": 347,
      "EstimatedMinutesUntilProcessed": 19.1,
      "TouchState": "NeverTouched",
      "DueAt": "2026-04-03 10:00:00",
      "CurrentAction": {
        "ActionID": 7,
        "Action": "SendEmail",
        "OrderNo": 3
      },
      "CreatedAt": "2026-04-03 09:55:00",
      "ActionUpdatedAt": null,
      "SnoozedUntil": null
    }
  ],
  "Throughput": {
    "PerMinute": 18.2,
    "PerSecond": 0.3
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "list_id is required when searching by email"
}
```

```txt [Error Codes]
0: Success
1: No lookup parameter provided (must supply EntryID, SubscriberID, or Email)
2: Entry or subscriber not found in queue
3: ListID required when searching by Email
4: Database query failed
5: Invalid parameter value
```

:::

## Audit Journey Action

<Badge type="info" text="GET" /> `/api/v1/admin.journey.action.audit`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns comprehensive diagnostic data for a specific journey action: action metadata, queue state breakdown, subscription status breakdown, bounce type breakdown, and completion count. Designed for diagnosing stuck entries at a particular action step.

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                    |
|-------------|---------|----------|------------------------------------------------|
| Command     | String  | Yes      | API command: `admin.journey.action.audit`      |
| AdminAPIKey | String  | Yes      | Admin API key for authentication               |
| ActionID    | Integer | Yes      | The journey action ID to audit                 |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/admin.journey.action.audit?AdminAPIKey=your-admin-api-key&ActionID=47"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ActionMeta": {
    "ActionID": 47,
    "ActionType": "SendEmail",
    "OrderNo": 3,
    "JourneyID": 42,
    "JourneyName": "Welcome Series",
    "JourneyStatus": "Enabled"
  },
  "QueueState": {
    "TotalAtAction": 500,
    "NeverTouched": 200,
    "WaitingForNextPass": 300,
    "OverdueCount": 280,
    "SnoozedCount": 15,
    "InProgressCount": 5
  },
  "SubscriptionBreakdown": {
    "Subscribed": 420,
    "Unsubscribed": 50,
    "OptInPending": 10,
    "OptOutPending": 5,
    "SubscriberNotFound": 15
  },
  "BounceBreakdown": {
    "NotBounced": 400,
    "Hard": 60,
    "Soft": 25,
    "SubscriberNotFound": 15
  },
  "CompletionCount": 3500
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Action not found"
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid action_id parameter
2: Action not found
3: Database query failed
```

:::

## Search Subscribers Across All Lists

<Badge type="info" text="POST" /> `/api/v1/admin.subscriber.search`

::: tip API Usage Notes
- Authentication required: Admin API Key, or an administrator session
- Required privilege: `Search`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Searches the subscriber lists of every user for one email address, or for every subscriber on one domain. Send either `EmailAddress` or `SearchDomain`, not both. The staff **Subscriber search** screen of the new interface calls this command.

An administrator limited to some user groups (`AccessLimited` with `AccessAllowedUserGroupIDs`) sees only the lists of users in those groups. The master Admin API Key and administrators without user group limits see every list. A list whose owner was deleted is returned with an empty `OwnerName` to an administrator without limits.

Every list probe runs with a time limit, and the whole search has a time budget. When a probe fails or times out, or the budget runs out before every list was searched, the response is still a success but carries `Incomplete: true`, so the results may be missing lists. A domain search returns at most 500 subscribers and sets `Truncated: true` when that cap stopped it.

**Request Body Parameters:**

| Parameter    | Type   | Required | Description |
|--------------|--------|----------|-------------|
| Command      | String | Yes      | API command: `admin.subscriber.search` |
| AdminAPIKey  | String | Yes      | Admin API key for authentication |
| EmailAddress | String | One of the two | Exact email address to search for |
| SearchDomain | String | One of the two | A domain such as `example.com` (a leading `@` is accepted, case does not matter). Finds every address that ends in `@` followed by that domain. A subdomain is a different domain. Letters, digits, hyphens and dots only, with at least two labels. Added in v6.0.2 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.subscriber.search \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subscriber.search",
    "AdminAPIKey": "your-admin-api-key",
    "EmailAddress": "john@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "EmailAddress": "john@example.com",
  "TotalLists": 2,
  "Lists": [
    {
      "ListID": 42,
      "ListName": "Newsletter",
      "OwnerUserID": 7,
      "OwnerName": "Acme Inc",
      "SubscriberID": 1234,
      "SubscriptionStatus": "Subscribed",
      "BounceType": "Not Bounced",
      "Archived": false
    },
    {
      "ListID": 57,
      "ListName": "Spring promo",
      "OwnerUserID": 7,
      "OwnerName": "Acme Inc",
      "SubscriberID": 88,
      "SubscriptionStatus": "Unsubscribed",
      "BounceType": "Hard",
      "Archived": true
    }
  ],
  "Incomplete": false
}
```

```bash [Domain Request]
curl -X POST https://example.com/api/v1/admin.subscriber.search \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.subscriber.search",
    "AdminAPIKey": "your-admin-api-key",
    "SearchDomain": "example.com"
  }'
```

```json [Domain Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SearchDomain": "example.com",
  "TotalLists": 1,
  "TotalMatches": 2,
  "Lists": [
    {
      "ListID": 42,
      "ListName": "Newsletter",
      "OwnerUserID": 7,
      "OwnerName": "Acme Inc",
      "Archived": false,
      "Matches": [
        {"ListID": 42, "SubscriberID": 1234, "EmailAddress": "john@example.com", "SubscriptionStatus": "Subscribed", "BounceType": "Not Bounced"},
        {"ListID": 42, "SubscriberID": 1301, "EmailAddress": "mary@example.com", "SubscriptionStatus": "Opt-In Pending", "BounceType": "Not Bounced"}
      ]
    }
  ],
  "Incomplete": false,
  "Truncated": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid EmailAddress parameter"
}
```

```txt [Error Codes]
0: Success
1: Missing EmailAddress parameter (neither EmailAddress nor SearchDomain was sent)
2: Invalid EmailAddress parameter
3: Invalid SearchDomain parameter
4: Pass either EmailAddress or SearchDomain, not both
```

:::

**Response fields:**

| Field | Mode | Description |
|---|---|---|
| `EmailAddress` | Address | The address searched |
| `SearchDomain` | Domain | The domain searched, lowercased and without `@` |
| `TotalLists` | Both | Number of entries in `Lists` |
| `TotalMatches` | Domain | Number of subscribers in all `Matches` arrays |
| `Lists[].ListID`, `ListName`, `OwnerUserID`, `OwnerName` | Both | The list and its owner. `OwnerName` is empty when the owner account was deleted |
| `Lists[].SubscriberID`, `SubscriptionStatus`, `BounceType` | Address | The subscriber on that list |
| `Lists[].Archived` | Both | `true` when the list is archived. Added in v6.0.2 |
| `Lists[].Matches[]` | Domain | Each subscriber on that list with an address on the domain: `ListID`, `SubscriberID`, `EmailAddress`, `SubscriptionStatus`, `BounceType` |
| `Incomplete` | Both | `true` when a list probe failed or timed out, or the time budget ran out, so lists may be missing. Added in v6.0.2 |
| `Truncated` | Domain | `true` when the 500-subscriber cap stopped the search, so there may be more matches |

::: warning
A domain search reads every list table in reach in full, because it cannot use the email address index. On an install with many large lists it is far heavier than an address search. The cap and the time limits bound one request.
:::

## Admin Agent Keys

An admin agent key is the credential of an operator AI assistant connected to the built-in MCP connector with a staff login. It is created when a staff member approves the assistant on the consent screen and is sent as `AdminAPIKey`. It starts with `oak_`, and the master `ADMIN_API_KEY` and per-admin API keys keep working unchanged next to it.

An admin agent key is limited in four ways, all enforced in `api.php`, so a direct REST call gets the same rules as the assistant:

- **Allow-list.** Only these commands, each with only its listed parameters. Any other command or parameter is refused (100010, 100016).

| Command | Scope | Parameters |
|---|---|---|
| `admin.risk.digest` | admin:read | MinScore, Level, UserGroupID, Limit |
| `admin.risk.user` | admin:read | UserID, Days |
| `admin.risk.refresh` | admin:read | UserID |
| `admin.users.search` | admin:read | Keyword, RecordsFrom, RecordsPerRequest |
| `user.get` | admin:read | UserID |
| `admin.user.sendactivity.get` | admin:read | UserID, From, To |
| `admin.user.senderdomains.get` | admin:read | UserID |
| `admin.delivery.metrics` | admin:read | Period, Limit |
| `admin.overview.get` | admin:read | Days (7, 30 or 90 only) |
| `admin.campaigns.stuck` | admin:read | OrderField, OrderType, RecordsFrom, RecordsPerRequest (refused to an admin limited to some user groups) |
| `admin.agentkey.revokeself` | admin:read | none (the key revokes itself) |
| `user.update` | admin:act | UserID, ReputationLevel (Untrusted only), AccountStatus (Disabled only), RateLimits (may only lower limits) |
| `admin.setup.status` | admin:read | none (refused to an admin limited to some user groups) |
| `deliveryservers.get` | admin:read | none (refused to an admin limited to some user groups) |
| `deliveryserver.get` | admin:read | DeliveryServerID (refused to an admin limited to some user groups) |
| `usergroups.get` | admin:read | none (refused to an admin limited to some user groups) |
| `usergroup.get` | admin:read | UserGroupID (refused to an admin limited to some user groups) |
| `settings.get` | admin:read | none (refused to an admin limited to some user groups; secrets and keys containing `WEBHOOK_URL` come back redacted) |
| `admin.alerts.get`, `admin.alert.get` | admin:read | see [Setup](/v6.0.3/api-reference/setup) |
| `deliveryserver.create` | admin:act | connection and domain parameters, see [Setup actions](#setup-actions) |
| `deliveryserver.update` | admin:act | DeliveryServerID, connection and domain parameters, see [Setup actions](#setup-actions) |
| `deliveryserver.verify` | admin:act | DeliveryServerID |
| `usergroup.create` | admin:act | GroupName, SubscriberAreaLogoutURL, the `Limit*` parameters, RelThemeID, ForceUnsubscriptionLink, ForceRejectOptLink, ForceOptInList, Permissions, the six `Screening*` parameters (stricter than the defaults only) |
| `usergroup.patch` | admin:act | UserGroupID, GroupName, the `Limit*` parameters (lower only), the compliance switches (on only), the six `Screening*` parameters (stricter only) |
| `usergroup.options.patch` | admin:act | UserGroupID, Options (the three `TargetDeliveryServerID_*` keys only) |
| `settings.update` | admin:act | the bounce and FBL mailbox parameters only |

- **Restrictive actions only.** On customer accounts, an assistant can only lower what an account can do: lower its rate limits, move it to Untrusted so its campaigns wait for approval, or suspend it. Anything that raises trust or reaches the customer is done by the operator in the admin area: approving or rejecting a campaign (`campaign.approve`, `admin.campaign.reject`), setting ReputationLevel to Trusted, re-enabling an account (AccountStatus Enabled) and messaging a user (`admin.user.message.send`). Each is refused (100010 or 100016) with an `ErrorText` that says so. This keeps instructions hidden in customer data (a campaign name, a subject) from loosening an account or contacting anyone.
- **Scopes.** `admin:read` is always granted. `admin:act` only when the staff member ticked it on the consent screen.
- **The admin's own limits.** The key acts as the admin who approved it: that admin's privileges always apply, and a target user or campaign outside the admin's user groups is refused. An admin limited to some user groups with none assigned reaches nobody: every command except `admin.agentkey.revokeself` is refused, and `admin.risk.digest` returns no users.
- **Confirmation.** Every `admin:act` command first answers 100012 with a `Preview` (the values before, and the values requested) and a `ConfirmToken`. The identical request repeated with `ConfirmToken` within ten minutes runs the change. A token works once, for one key, one command and the exact parameters. Every confirmed action is recorded before it runs and completed with the values after, see `admin.agentactions.get`, so an action whose request died midway still shows up (with `Completed` false).

Staff accounts with two-factor authentication can connect an assistant. After the password, the new interface asks for the 6-digit code from the authenticator app, sends it to `admin.login` as `TFACode` and returns to the consent screen. A staff recovery key is not accepted there, because `admin.login` does not take one. The code page links to the admin area's reset page (`/app/admin/reset2fa/`), which turns two-factor authentication off with the recovery key.

::: code-group

```json [Confirmation Required]
{
  "Success": false,
  "ErrorCode": 100012,
  "ErrorText": "This action changes a customer account. Show the preview to the operator you act for, and only if they agree, repeat the identical call with ConfirmToken set to 4f1c... within 10 minutes.",
  "ConfirmationRequired": true,
  "ConfirmToken": "4f1c2b7e9a0d4c3b8e6f1a2b3c4d5e6f",
  "ConfirmTokenExpiresIn": 600,
  "Preview": {
    "Command": "user.update",
    "Before": { "UserID": 7, "Username": "acme", "AccountStatus": "Enabled" },
    "After": { "AccountStatus": "Disabled" }
  }
}
```

:::

### Setup actions

An operator assistant can help set up a new install (issue #3387). Each action below is behind the confirm step, shows the values before and after in its preview, and is recorded in the admin agent action log and the configuration change log.

- `deliveryserver.create`, `deliveryserver.update`: connection and domain parameters only. The SMTP password is write-only: it never appears in a preview, a log row or a response. A new or changed `SendMethodSMTPHost` must resolve only to public addresses (loopback, private, link-local, carrier-grade NAT, the cloud metadata address and other containers are refused with the same message whatever the reason), and a new or changed `SendMethodSMTPPort` must be 25, 465, 587 or 2525. Changing the host, port or username of a server with a stored password needs the password in the same call, whatever `SendMethodSMTPAuth` says, so a stored password is never sent to a different server. A server created by an admin agent key is marked as the assistant's (`CreatedByAdminAgentKeyID`).
- **Only the assistant's own unused servers can be repointed.** The assistant may change the routing fields only on a server an admin agent key created, and only while nothing references it: a user group `TargetDeliveryServerID_*` option, a user's own `DeliveryServerID` override, a recipient MX delivery route, a global segment's user group setting, or an upsender IP pool or IP address. References that cannot be read count as one. On every other server, including every server the operator created, only `DeliveryServerName` and `SendMethodSMTPTimeout` may change: `SendMethodSMTPHost`, `SendMethodSMTPPort`, `SendMethodSMTPSecure`, `SendMethodSMTPAuth`, `SendMethodSMTPUsername`, `DomainSettings_LinkTracking`, `DomainSettings_OpenTracking`, `DomainSettings_MFrom` and `DomainSettings_EnforcedFrom` must be sent with their stored values, and `SendMethodSMTPPassword` may not be sent. The sender rotation and sender-info settings must be sent back unchanged on every server. Changing the host, port, username or password clears the stored `email_delivery` verification result, so the server must pass `deliveryserver.verify` again before it can be assigned.
- `deliveryserver.verify`: `DeliveryServerID` only, and only on a server the assistant may repoint (see above). The test message goes to the admin's own address, and `To` is refused. The stored host is resolved when the test runs and must resolve only to public addresses. The connection is pinned to the checked address while TLS still verifies the host name, so a DNS change between the check and the connection cannot redirect it. For an admin agent key, a failed test send returns a generic `Messages.email_delivery` instead of the SMTP server's reply.
- `usergroup.create`: name, limits, theme, permissions, double opt-in and screening. The unsubscribe and reject-opt-in links must be `Enabled`, and the subscriber-area logout URL must be on the install's own domain. No send method, spam thresholds, options, signup default, trial or payment settings.
- `usergroup.patch`: rename, lower a limit (never raise one or make it unlimited), turn a compliance switch on.
- **Screening can only be tightened.** On `usergroup.create` and `usergroup.patch`, `ScreeningSignupMode`, `ScreeningImportMode` and `ScreeningContentMode` may only move towards `hold` (`off` to `flag`, `flag` to `hold`), and `ScreeningSignupThreshold`, `ScreeningImportThreshold` and `ScreeningContentThreshold` may only go down, to a whole number from 1 to 100. A new group is compared with the defaults it would get (signup and import `flag`, content `off`, threshold 50). Loosening screening, a threshold of 0, `admin.screening.settings.update` and `admin.screening.release` are done by the operator in the admin area.
- `usergroup.options.patch`: only `TargetDeliveryServerID_Marketing`, `_Transactional` and `_AutoResponder`, set to a server that passed its test delivery and that the assistant may repoint (created by an admin agent key, referenced by nothing but this group), or to 0. The group must have no users, and no users may arrive without the operator acting. Refused, with the reason in `ErrorText`:
  - a group with users, or whose users cannot be counted;
  - the signup group (`USER_SIGNUP_GROUPID`) and the groups a signup picks from (`USER_SIGNUP_GROUPIDS`), or any group when those settings cannot be read;
  - a group the new user interface places accounts in: a billing plan group of any role, the signup, suspension and cancellation groups, and its default group. The app cannot read the interface's database, so the interface's built-in connector sends that list with the call, and a call from anywhere else is refused. From v6.0.2 the interface is always on, so this applies on every install.
- `settings.update`: only the bounce and FBL mailboxes, only turning one on while it is off. A mailbox that is already `Enabled` is refused whole, so its host, username and password are changed in the admin area. The host must resolve only to public addresses and the port must be 143 or 993. Host, port or username changes need the password in the same call. `Send_Bounce_NotificationEmail` must be sent with its current value, because the handler resets it otherwise. For an admin agent key, a failed mailbox login returns a generic `ErrorText` without `EmailSettingsErrorMessage`.

Kept off the list with a reason: `usergroup.update`, `usergroup.delete`, `deliveryservers.delete`, `settings.emailsendingtest`, and every other `settings.update` parameter (signup, signup reputation, password reset and login protections, plug-ins, system send method, seed list, complaint and abuse report addresses, upload file types, Stripo key).

## Create Admin Agent Key

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: admin session or Admin API Key (sub-admins need the `Account` privilege)
- Rate limit: 30 requests per 60 seconds
- Not available to an admin agent key
:::

Creates an admin agent key for the calling admin. The new interface calls this when a staff member approves an operator AI assistant. The key is returned once, here; only its hash is stored.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.agentkey.create` |
| SessionID | String | Yes | The admin's session, or `AdminAPIKey` |
| Scopes | String | No | `admin:read` (always on), add `admin:act` to allow actions |
| Note | String | No | Free text, for example the assistant's name |

::: code-group

```json [Success Response]
{
  "Success": true,
  "AdminAPIKey": "oak_9d2f4c1a7b3e5d6f8a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
  "Key": {
    "AdminAPIKeyID": 12,
    "KeyHint": "oak_9d2f4c",
    "Scopes": ["admin:read", "admin:act"],
    "Note": "AI assistant: Claude",
    "CreatedAt": "2026-10-16 09:12:00",
    "LastUsedAt": null,
    "RequestCount": 0,
    "Revoked": false,
    "RevokedAt": null
  }
}
```

```txt [Error Codes]
1: The admin agent key could not be stored
99998: Authentication failed
99999: Not enough privileges
```

:::

## List Admin Agent Keys

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: admin session or Admin API Key (sub-admins need the `Account` privilege)
- Returns only the calling admin's keys, never a key or its hash
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.agentkeys.get` |

::: code-group

```json [Success Response]
{
  "Success": true,
  "Keys": [
    { "AdminAPIKeyID": 12, "KeyHint": "oak_9d2f4c", "Scopes": ["admin:read"], "Note": "AI assistant: Claude", "CreatedAt": "2026-10-16 09:12:00", "LastUsedAt": "2026-10-16 10:01:44", "RequestCount": 31, "Revoked": false, "RevokedAt": null }
  ],
  "TotalKeys": 1
}
```

```txt [Error Codes]
1: The admin agent keys could not be read
```

:::

## Revoke Admin Agent Key

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: admin session or Admin API Key (sub-admins need the `Account` privilege)
- The key stops working at once. The admin's own API key and every other key are untouched
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.agentkey.revoke` |
| AdminAPIKeyID | Integer | Yes | One of the calling admin's keys |

::: code-group

```json [Success Response]
{
  "Success": true,
  "AdminAPIKeyID": 12
}
```

```txt [Error Codes]
1: AdminAPIKeyID is required
2: No admin agent key with this ID belongs to this admin
3: The admin agent key could not be revoked
```

:::

## Revoke Admin Agent Key (Self)

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: the admin agent key itself, sent as `AdminAPIKey`. Not available with an admin session or any other key
- Revokes only the key that sends the request. The new interface uses it when a staff member disconnects an assistant, so revoking does not depend on the staff member's admin session. If the backend cannot be reached, the interface keeps the connection disconnected and retries every five minutes until the key is revoked
- A key that is already revoked is refused with 99998 (Invalid API key), which callers can treat as revoked
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.agentkey.revokeself` |
| AdminAPIKey | String | Yes | The admin agent key to revoke (`oak_...`) |

::: code-group

```json [Success Response]
{
  "Success": true,
  "AdminAPIKeyID": 12
}
```

```txt [Error Codes]
1: Only an admin AI assistant key can revoke itself
3: The admin agent key could not be revoked
99998: Invalid API key (the key is already revoked or unknown)
```

:::

## List Admin Agent Actions

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: admin session or Admin API Key (sub-admins need the `Account` privilege)
- Returns the actions the calling admin's AI assistants took, newest first
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.agentactions.get` |
| Limit | Integer | No | 1 to 200, default 50 |

::: code-group

```json [Success Response]
{
  "Success": true,
  "Actions": [
    {
      "ActionID": 3,
      "AdminAPIKeyID": 12,
      "Command": "user.update",
      "TargetUserID": 7,
      "TargetCampaignID": 0,
      "Succeeded": true,
      "Before": { "UserID": 7, "Username": "acme", "ReputationLevel": "Trusted" },
      "After": { "UserID": 7, "Username": "acme", "ReputationLevel": "Untrusted" },
      "Completed": true,
      "CreatedAt": "2026-10-16 10:02:10"
    }
  ],
  "TotalActions": 1
}
```

```txt [Error Codes]
1: The admin agent actions could not be read
```

:::

## Get Risk Digest

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `User.Browse` privilege)
- Rate limit: 100 requests per 60 seconds
- Read-only. Limited to enabled users in the admin's user groups
:::

Users that need attention, ranked by the newest daily risk snapshot. Each user carries the score (0 to 100), its level, the suggested action, every rule with its value, threshold and points, and the raw signals. Scores are deterministic rules over Octeth's own data: complaint rate, hard bounce rate, unknown-user rate (email gateway), volume against the user's own 30-day baseline, new and failing sender domains, the SpamAssassin score of the newest campaign, AI agent sends and recent reputation or status changes. A nightly job writes the snapshot; `admin.risk.refresh` rescores one user. A signal whose source could not be read is `null` and listed in `UnknownMetrics`, and `Complete` is false; it is never counted as 0.

Levels: low (below 15), medium (15), high (35), critical (60). Suggested actions: `none`, `review`, `throttle_user`, `require_campaign_approval`, `suspend_user`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.risk.digest` |
| AdminAPIKey | String | Yes | Admin API key |
| MinScore | Integer | No | 0 to 100, default 15 |
| Level | String | No | Minimum level: low, medium, high or critical |
| UserGroupID | Integer | No | Only users of this group |
| Limit | Integer | No | 1 to 200, default 25 |

::: code-group

```json [Success Response]
{
  "Success": true,
  "SnapshotDate": "2026-10-16",
  "RulesVersion": "2026-10-16",
  "Scoped": false,
  "Users": [
    {
      "UserID": 7,
      "Username": "acme",
      "EmailAddress": "ops@acme.example",
      "UserGroupID": 1,
      "ReputationLevel": "Trusted",
      "AccountStatus": "Enabled",
      "Score": 45,
      "Level": "high",
      "SuggestedAction": "require_campaign_approval",
      "Complete": true,
      "FiredRules": [
        { "Rule": "hard_bounce_rate", "Metric": "HardBounceRate7d", "Value": 0.06, "Status": "measured", "Fired": true, "Threshold": 0.05, "Points": 25, "Action": "require_campaign_approval" },
        { "Rule": "unknown_user_rate", "Metric": "UnknownUserRate7d", "Value": 0.12, "Status": "measured", "Fired": true, "Threshold": 0.1, "Points": 20, "Action": "require_campaign_approval" }
      ],
      "Rules": [],
      "UnknownMetrics": [],
      "Signals": { "Sent7d": 1000, "HardBounces7d": 60, "GatewaySent7d": 500, "UnknownUser7d": 60 },
      "ComputedAt": "2026-10-16 02:40:12"
    }
  ],
  "TotalUsers": 1
}
```

```txt [Error Codes]
1: MinScore must be a number between 0 and 100
2: Level must be low, medium, high or critical
3: UserGroupID must be a positive whole number
4: Limit must be a number between 1 and 200
5: UserGroupID is outside the user groups this admin account may access
6: The risk snapshots could not be read
```

:::

## Get User Risk

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `User.Browse` privilege)
- Read-only
:::

One user's newest risk snapshot and the score per day for the trend.

Since v6.0.2 the response also carries `Screening`: the user's 20 newest signup, list import and campaign content screening results, newest first (null when they could not be read). Each has the score, the `CustomerScore` (the score without the rules that read other accounts' data, which alone decides a hold), the user group's threshold and mode, the `Outcome` (`clean`, `unknown`, `flagged` or `held`), the rules that fired with their evidence, the signup `Stage` (`local`, or `external` for the opt-in lookups), and the reason the customer sees when the item is held. Import evidence holds aggregate counts only, never an address or another tenant. Three risk rules read these results: `signup_screening`, `import_screening` and `content_screening`. See [Sender Screening](#sender-screening).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.risk.user` |
| AdminAPIKey | String | Yes | Admin API key |
| UserID | Integer | Yes | The user |
| Days | Integer | No | 1 to 90, default 30 |

::: code-group

```json [Success Response]
{
  "Success": true,
  "UserID": 7,
  "Username": "acme",
  "EmailAddress": "ops@acme.example",
  "ReputationLevel": "Trusted",
  "AccountStatus": "Enabled",
  "RulesVersion": "2026-10-16",
  "Current": { "UserID": 7, "Score": 45, "Level": "high", "SuggestedAction": "require_campaign_approval", "Complete": true, "SnapshotDate": "2026-10-16" },
  "Trend": [
    { "SnapshotDate": "2026-10-16", "Score": 45, "Level": "high", "SuggestedAction": "require_campaign_approval" },
    { "SnapshotDate": "2026-10-15", "Score": 10, "Level": "low", "SuggestedAction": "none" }
  ],
  "Screening": [
    {
      "ScreeningResultID": 31,
      "SubjectType": "import",
      "SubjectID": 812,
      "ListID": 44,
      "Score": 75,
      "Threshold": 40,
      "Mode": "hold",
      "Outcome": "held",
      "Complete": true,
      "FiredRules": [
        { "Rule": "bounce_history", "Metric": "BounceHistoryShare", "Value": 0.125, "Status": "measured", "Fired": true, "Threshold": 0.1, "Points": 30, "Evidence": { "ValidAddresses": 400, "BounceHistoryAddresses": 50 } },
        { "Rule": "role_addresses", "Metric": "RoleShare", "Value": 0.335, "Status": "measured", "Fired": true, "Threshold": 0.2, "Points": 25, "Evidence": { "SampleSize": 400, "TotalRows": 400, "RoleAddresses": 134 } },
        { "Rule": "invalid_syntax", "Metric": "InvalidShare", "Value": 0.12, "Status": "measured", "Fired": true, "Threshold": 0.1, "Points": 20, "Evidence": { "SampleSize": 400, "TotalRows": 400, "InvalidSyntax": 48 } }
      ],
      "UnknownMetrics": [],
      "DurationMs": 310,
      "CustomerScore": 45,
      "Stage": null,
      "CustomerReason": "This import is waiting for a review by our team, and campaigns to the list need approval until then. Many addresses are shared role mailboxes such as info@ or sales@. Many addresses are not valid email addresses.",
      "RulesVersion": "2026-10-17",
      "CreatedAt": "2026-10-17 09:12:40",
      "ReleasedAt": null
    }
  ]
}
```

```txt [Error Codes]
1: Days must be a number between 1 and 90
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
6: The risk snapshots could not be read
```

:::

## Refresh User Risk

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `User.Browse` privilege)
- Rate limit: 30 requests per 60 seconds
- Rewrites today's snapshot for the user; changes no customer data
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.risk.refresh` |
| AdminAPIKey | String | Yes | Admin API key |
| UserID | Integer | Yes | The user |

::: code-group

```json [Success Response]
{
  "Success": true,
  "UserID": 7,
  "RulesVersion": "2026-10-16",
  "Current": { "UserID": 7, "Score": 45, "Level": "high", "SuggestedAction": "require_campaign_approval", "Complete": true, "SnapshotDate": "2026-10-16" }
}
```

```txt [Error Codes]
5001: UserID is required
5002: User not found
5003: User is outside the user groups this admin account may access
6: The risk score could not be computed or stored
```

:::

## Sender Screening

Octeth screens three points where a sender enters the platform, with deterministic rules (no language model runs inside Octeth). Every result is stored and feeds the risk digest. Each user group sets a threshold (0 to 100, default 50) and a mode per point: `off` screens nothing, `flag` only records the result, `hold` also stops the item. Signup and list import screening default to `flag`. Campaign content screening defaults to `off` for every user group, existing and new, because it runs SpamAssassin on every send. Turn it on per group with `ScreeningContentMode` `flag` or `hold` in `UserGroup.Update` or `UserGroup.Patch`, or in the sender screening section of the user group page in the admin area.

| Point | When | Rules | Hold |
|---|---|---|---|
| Signup | Every new account (`User.Create`, the public sign-up page, SSO), local checks only. The opt-in external lookups run a few minutes later in `cli/signup_screening.php` and store a second result | `disposable_domain`, `no_mx` (one DNS query, 2 seconds at most), `young_domain` (RDAP registration date, opt-in), `website_not_live` (opt-in, at most 256 KB read), `ip_signup_burst`, `suspended_domain` | An account that took the default reputation stays `Untrusted` |
| List import | The import worker, after the import finished, on a bounded sample of up to 2,000 addresses | `role_addresses`, `invalid_syntax`, `no_mx_domains`, `spam_traps`, `bounce_history` (hard bounces and complaints on any tenant, counts only, operator only), `free_mail_shift` | Campaigns to the list go to Pending Approval until the import is released |
| Campaign content | The campaign picker, when a `Ready` campaign starts sending (immediate, scheduled, resumed, recurring, auto-resend and A/B winner sends), on the emails and lists of that send | `spam_score` (SpamAssassin, local rules, one run per send), `link_text_mismatch`, `credential_form`, `url_shortener`, `brand_impersonation`, `suspended_reuse` (operator only) | The campaign goes to Pending Approval instead of sending. `Campaign.Approve` records what was approved, so the same emails and lists are not held again. While a campaign is sending, `email.update` refuses changes to the emails it uses (ErrorCode 22), and a change to an email of a `Ready` or `Paused` campaign removes its approval, so it is screened again when it starts or resumes |

A signal that cannot be read (a DNS timeout, ClickHouse unreachable, SpamAssassin missing or timed out) makes the result `unknown`: it never holds anything by itself and is never counted as clean. Rules marked operator only read other accounts' data. They add to the operator's `Score` and can flag an item, but the hold decision and the customer's reason use `CustomerScore`, which leaves them out. `bounce_history` reads the suppression lists and the email gateway events of the last 30 days (`eg_events` keeps 31). The phishing rules allow the user's own verified sender domains. User group settings are the `Screening*` parameters of `UserGroup.Create`, `UserGroup.Update` and `UserGroup.Patch`, and the global lists are set with [Update Screening Settings](#update-screening-settings).

## Release a Held Import

<Badge type="info" text="POST" /> `/api/v1/admin.screening.release`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `User.Edit` privilege)
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Not available to admin agent keys: a release loosens a hold
:::

Releases a held list import, so campaigns to its list stop going to Pending Approval because of it. A held campaign is released through the existing approval flow (`Campaign.Approve`), and a held signup by changing the account's `ReputationLevel`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.screening.release` |
| SessionID | String | No | Session ID obtained from login |
| AdminAPIKey | String | No | Admin API key |
| ScreeningResultID | Integer | Yes | The held import result, from `admin.risk.user` `Screening` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.screening.release \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.screening.release",
    "AdminAPIKey": "your-admin-api-key",
    "ScreeningResultID": 31
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Result": { "ScreeningResultID": 31, "SubjectType": "import", "SubjectID": 812, "ListID": 44, "Outcome": "held", "ReleasedAt": "2026-10-17 10:02:11" }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Only a held import can be released. Approve a held campaign with campaign.approve."
}
```

```txt [Error Codes]
0: Success
1: ScreeningResultID is required
2: Screening result not found
3: The result is not a held import
4: The import was already released
5003: User is outside the user groups this admin account may access
6: The screening result could not be read or updated
```

:::

## Get Screening Settings

<Badge type="info" text="POST" /> `/api/v1/admin.screening.settings.get`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Settings` privilege)
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The operator's global screening settings. The three lists start empty, and `SignupExternalLookups` is `false` until the operator turns it on.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.screening.settings.get` |
| SessionID | String | No | Session ID obtained from login |
| AdminAPIKey | String | No | Admin API key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.screening.settings.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.screening.settings.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ProtectedBrands": [{ "Name": "PayPal", "Domains": ["paypal.com"] }],
  "SpamTrapPatterns": ["spamtrap*@trap.example.net"],
  "DisposableDomains": ["tempbox.example"],
  "SignupExternalLookups": false,
  "BuiltInDisposableDomains": 104,
  "RulesVersion": "2026-10-17"
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
99999: Insufficient admin privileges
```

:::

## Update Screening Settings

<Badge type="info" text="POST" /> `/api/v1/admin.screening.settings.update`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Settings` privilege)
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Replaces one or more global screening settings. A setting that is not sent is left as it is, and an empty list value empties the list. Invalid entries are dropped and at most 1,000 entries per list are kept.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.screening.settings.update` |
| SessionID | String | No | Session ID obtained from login |
| AdminAPIKey | String | No | Admin API key |
| ProtectedBrands | Array or String | No | Brands for the `brand_impersonation` rule: an array of `{Name, Domains}`, its JSON, or lines of `Name: domain1, domain2`. A brand named in the From name or subject of an email that is not sent from one of its domains fires the rule |
| SpamTrapPatterns | Array or String | No | Patterns for the `spam_traps` import rule, one per line: an address or a domain with `*` wildcards, such as `spamtrap*@trap.example.net` |
| DisposableDomains | Array or String | No | Domains added to the built-in disposable list of the `disposable_domain` signup rule, separated by commas or new lines |
| SignupExternalLookups | Boolean | No | `true` lets signup screening ask `rdap.org` for the email domain's registration date and fetch the website given at sign-up (at most 256 KB, 4 seconds each). The lookups run in the `cli/signup_screening.php` cron a few minutes after the sign-up, never during it. Default `false`: the outbound requests reach a third party and an address the sign-up chose, so they are opt-in |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.screening.settings.update \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.screening.settings.update",
    "AdminAPIKey": "your-admin-api-key",
    "ProtectedBrands": [{ "Name": "PayPal", "Domains": ["paypal.com"] }],
    "DisposableDomains": "tempbox.example"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ProtectedBrands": [{ "Name": "PayPal", "Domains": ["paypal.com"] }],
  "SpamTrapPatterns": [],
  "DisposableDomains": ["tempbox.example"],
  "SignupExternalLookups": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Give at least one of ProtectedBrands, SpamTrapPatterns, DisposableDomains and SignupExternalLookups"
}
```

```txt [Error Codes]
0: Success
1: No setting was given
6: The settings could not be saved
```

:::
