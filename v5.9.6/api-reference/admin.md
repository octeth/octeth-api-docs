---
layout: doc
---

# Admin API Documentation

Admin-level endpoints for system administrators to manage and monitor campaigns, processes, and other administrative functions.

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

> This command browses every account (`FilterByUserID` empty = all) and does not take the `UserID` parameter of the admin-reach commands. Restricted sub-admins only see the accounts of their allowed user groups. Owner decoration (`UserFirstName`, `UserLastName`, `UserEmailAddress`, `UserCompany`) is attached to every row.

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
```

:::

## Composite Campaign Statuses Used by the Admin Campaign Report

The admin Campaign Report does not use raw `CampaignStatus` values. Every command in this group (`admin.campaigns.stuck`, `admin.campaigns.statuscounts`, `admin.campaigns.timeseries`, `admin.campaigns.export`) takes `Status` from the table below, `admin.campaigns.statuscounts` returns one counter per row, and each row's date range applies to its own date column. This is the mapping the admin Campaign Report screen uses: `campaigns.get` documents `SendProcessFinishedOn` for Sent, which the report does NOT use.

All four commands require the Admin API key and the `Reports` sub-admin privilege (the privilege the admin Campaign Report screen checks). Restricted sub-admins (`Options.AccessLimited` with `AccessAllowedUserGroupIDs`) only see campaigns owned by accounts in their allowed user groups.

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

Shared error codes: `1` invalid DateFrom, `2` invalid DateTo, `3` unknown Status, `4` invalid FilterByUserID, `5` SearchQuery could not be translated, `7` DateFrom after DateTo.

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
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
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
```

:::

## Get Campaign Report Time Series

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.timeseries`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
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
```

:::

## Export Campaign Report

<Badge type="info" text="POST" /> `/api/v1/admin.campaigns.export`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The 19-column row set of the admin Campaign Report's CSV download, with the derived rates and the average throughput already computed, under the same filters as the other report commands. Rows are JSON objects by default; `Format=csv` returns one CSV string (header row included, no BOM) whose free-text cells are formula-protected (`Core::SanitizeCSVRow`, see `CSV_EXPORT_FORMULA_PROTECTION`). The result is capped at `CAMPAIGN_EXPORT_MAX_ROWS` (default 10000): when the filtered set is larger, the first `MaxRows` rows in sort order are returned and `Truncated` is `true`. Narrow the filters or page with `admin.campaigns.search` for larger sets.

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
```

:::

With `Format=csv` the response carries `CSV` (the file contents as a string) and `Filename` (`campaign_report_YYYY-MM-DD_HH-MM-SS.csv`) instead of `Rows`.

## Get Dashboard Overview

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Dashboard` privilege)
- Rate limit: 100 requests per 60 seconds
- Read-only; no parameters besides the command and the key
:::

Returns the aggregates the admin Dashboard shows: the total number of user accounts and three top-10 leaderboards, accounts by campaign count (each with its list count), by bounce records and by feedback-loop (spam complaint) reports. Leaderboards are sorted by their count descending; accounts that no longer exist are not listed.

Two dashboard blocks are deliberately not part of this command because they already have one: campaigns pending approval come from `admin.campaigns.search` with `CampaignStatus=Pending Approval`, and online users from `users.get` with `RelUserGroupID=Online`. The two charts have their own commands, `admin.delivery.history` and `admin.delivery.forecast`.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.overview.get` |
| AdminAPIKey | String | Yes | Admin API key |

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

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
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
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
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

The rows are cached for 60 seconds (the same cache the screen uses); the classification is applied after the cache, so a threshold change shows immediately.

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
99999: Not enough privileges
```

:::

`BestFreshnessDays` and `MostRecentActivity` are `null` for a `No Data` account. When sorting by `WorstFreshness`, `No Data` accounts sort first on `DESC` and last on `ASC`, as on the screen. `ActiveSubscribers` is the sum of the denormalized per-list active counts, with a live count only for lists that have never been counted.

## Get List Freshness Detail

<Badge type="info" text="POST" /> `/api/v1/admin.lists.freshness.detail`

::: tip API Usage Notes
- Authentication required: Admin API Key (sub-admins need the `Reports` privilege)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Per-list freshness for one account: every list with its last subscription or import date, the days since, the 90-day subscription, import and unsubscription totals, the active subscriber count, the freshness status (same rules as `admin.lists.freshness`) and a 90-point `DailyGrowth` series (subscriptions plus imports per day, oldest first, ending today), which is the screen's sparkline. `OverallStatus` is the status of the account's freshest list, `No Data` only when no list has any history. Cached 60 seconds per account.

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
99999: Not enough privileges
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
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
`AdminInfo` never contains the sub-admin `APIKey` column, whichever way the login was performed. When a sub-admin logs in and `ADMIN_API_ENFORCE_PRIVILEGES` is enabled on the install, the returned `SessionID` is limited to the commands that sub-admin's privileges allow; other admin commands answer `99999`. See [Authorization](/v5.9.6/api-reference/authorization#sub-admin-api-keys-and-privilege-enforcement).
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
101: Invalid 2FA code
```

:::

## Admin Password Remind

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Sends a password reset link to the administrator's email address. This endpoint validates the email address, generates a password reset link, and sends it via email. The reset link contains an MD5 hash of the admin ID for security.

**Request Body Parameters:**

| Parameter        | Type   | Required | Description                                                                                      |
|------------------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String | Yes      | API command: `admin.passwordremind`                                                              |
| EmailAddress     | String | Yes      | Administrator email address                                                                      |
| CustomResetLink  | String | No       | Custom password reset URL template (base64 encoded). Use `%s` placeholder for MD5 hash. If not provided, default reset link will be used |

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
```

:::

## Admin Password Reset

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Resets an administrator's password and sends the new password via email. This endpoint requires the MD5 hash of the admin ID (typically obtained from the password reset link). A new random password is generated, stored in the database, and emailed to the administrator.

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                                                      |
|-----------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command   | String | Yes      | API command: `admin.passwordreset`                                                               |
| AdminID   | String | Yes      | MD5 hash of the admin ID (obtained from password reset link)                                    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.passwordreset",
    "AdminID": "c4ca4238a0b923820dcc509a6f75849b"
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
2: Admin ID not found (invalid reset link)
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key
- Legacy endpoint access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Account`
- Legacy endpoint access via `/api.php` is also supported
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

## Update Administrator Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Account`
- Legacy endpoint access via `/api.php` is also supported
:::

Updates administrator account details including username, email address, name, and optionally password.
Administrators can only update their own account information (AdminID must match the authenticated
administrator). This endpoint is disabled in demo mode.

<Badge type="tip" text="Changed in v5.9.6" /> `CurrentPassword` is an additive parameter. When it is supplied
alongside `Password` it is always verified against the account's current password (`ErrorCode 10` when
wrong). Whether omitting it alongside `Password` is refused (`ErrorCode 9`) is controlled by the
`ADMIN_UPDATE_REQUIRE_CURRENT_PASSWORD` setting: it defaults to off on upgraded installs, so existing
integrations that change the password without it keep working, and the shipped `.oempro_env.example`
turns it on for fresh installs. The admin Account screen always sends it.

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
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Admin Logout

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Account`
- Legacy endpoint access via `/api.php` is also supported
:::

Ends the admin session behind the call, so a client that created a session with `admin.login` can
invalidate it. Pass the `SessionID` to log out. With an `AdminAPIKey` call there is no persistent session
to end and the command succeeds as a no-op.

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
99998: Authentication failure or session expired
```

:::

## Provision Two-Factor Authentication

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`
- Legacy endpoint access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`
- Legacy endpoint access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `Security`
- Legacy endpoint access via `/api.php` is also supported
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

## Get Admin Privileges

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
:::

Lists every administrator account other than the master admin (AdminID 1). Each row carries only
`AdminID`, `Name`, `Username`, `EmailAddress`, `2FA_Enabled`, `Options` and `APIKeyIssued`.

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
99999: Not enough privileges
```

:::

## Get a Sub-Admin Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
:::

Returns one sub-admin account with the same projection as `admin.subadmins.get`. AdminID 1 is refused:
the master admin is not a sub-admin and is read through `admin.get` by its own credentials.

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
```

:::

## Create a Sub-Admin Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
:::

Creates an access-limited sub-admin. The same validation the admin Sub Admin Accounts screen applies runs
here: email and username must be unique across all administrators, `Username` may contain letters,
digits, underscores and dashes, and `Permissions` must be an object with two lists,
`AccessAllowedUserGroupIDs` (positive integers; empty means every user group) and `AccessOptions` (values
from `admin.privileges.get`). `Permissions` may be sent as a JSON object in a JSON body or as a JSON
string in a form-encoded body. On a validation failure `ErrorCode` is the list of every failed rule.
Disabled in demo mode.

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
  "ErrorCode": [8, 13],
  "ErrorText": "This email address is in use by another administrator. Permissions contain a privilege that does not exist."
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
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Update a Sub-Admin Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
:::

Updates the supplied fields of an access-limited sub-admin; omitted fields are left unchanged. The
validation rules and error codes 1 to 13 are those of `admin.subadmin.create`, applied to the fields
present. Only accounts whose `Options.AccessLimited` is true can be edited, so the master admin is refused.
The account's two-factor authentication is never touched by this command (the admin screen used to clear
it on every save; that was a defect and is fixed). Disabled in demo mode.

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
  "ErrorCode": 22,
  "ErrorText": "This admin account cannot be edited."
}
```

```txt [Error Codes]
0: Success
6-13: Validation failures, as listed for admin.subadmin.create (ErrorCode is a list)
20: AdminID is required
21: Sub-admin account not found
22: This admin account cannot be edited (not AccessLimited, e.g. the master admin)
23: Nothing to update (pass at least one of Name, EmailAddress, Username, Password, Permissions)
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Delete Sub-Admin Accounts

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
:::

Deletes one or more sub-admin accounts. Ids that do not exist, accounts that are not access-limited (the
master admin) and the calling admin's own account are skipped and reported in `SkippedAdminIDs`, so the
call is idempotent and can never remove the master admin or the caller. Disabled in demo mode.

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
  "ErrorCode": 1,
  "ErrorText": "AdminIDs is required: a comma-separated list of sub-admin ids."
}
```

```txt [Error Codes]
0: Success
1: AdminIDs is required
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Regenerate a Sub-Admin API Key

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
:::

Issues a per-sub-admin API key, or rotates the existing one. The key is returned exactly once, in this
response; no other command ever returns it (`admin.get`, `admin.subadmin.get` and `admin.subadmins.get`
only report `APIKeyIssued`). The previous key stops authenticating immediately. The key is accepted on the
`AdminAPIKey` parameter and, when `ADMIN_API_ENFORCE_PRIVILEGES` is on, is limited to the account's
`AccessOptions`. Only access-limited accounts can hold a key; the master admin uses `ADMIN_API_KEY`.
Disabled in demo mode.

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
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Revoke a Sub-Admin API Key

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key or admin SessionID
- Required privilege: `SubAdmins`
- Legacy endpoint access via `/api.php` is also supported
:::

Removes the per-sub-admin API key so it stops authenticating immediately. Revoking an account that has
no key succeeds. Disabled in demo mode.

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
NOT AVAILABLE IN DEMO MODE.: Feature disabled in demo mode
```

:::

## Get User Activity

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key
- Legacy endpoint access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key
- Legacy endpoint access via `/api.php` is also supported
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
```

:::

## Mark Campaign as Failed

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.markfailed`

::: tip API Usage Notes
- Authentication required: Admin API Key
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
```

:::

## Retry Failed Recipients

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.retryfailed`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege: `Reports`
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
```

:::

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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- The names of the sender-domain DNS record templates the install ships (`EMAILGATEWAY_DNS_TEMPLATES` and `EMAILCAMPAIGN_DNS_TEMPLATES`). Only names are returned; the record bodies are expanded per domain when a sender domain is created.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.dnstemplates.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |

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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
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

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Every plugin under `plugins/` with a parsable header. `Enabled` reflects the `ENABLED_PLUGINS` setting.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `admin.plugins.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | Admin API key for authentication      |

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

## Enable Plugin

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Runs the same sequence as the admin Plugins screen: validates the code against the plugins on disk, adds it to `ENABLED_PLUGINS`, includes the plugin and runs its `enable_<code>()` lifecycle hook (table creation, option seeding), then its `load_<code>()`. This is what writing `EnabledPlugins` through `settings.update` does NOT do.
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
NOT AVAILABLE IN DEMO MODE: Endpoint disabled in demo mode
```

:::

## Disable Plugin

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `Settings`)
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Removes the code from `ENABLED_PLUGINS` and runs the plugin's `disable_<code>()` lifecycle hook, exactly like the admin Plugins screen.
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

## Search a Subscriber Email Across All Lists

<Badge type="info" text="POST" /> `/api/v1/admin.subscriber.search`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Given one email address, returns every user/list (across all users) where that address is subscribed — the API analogue of the admin-area "Subscriber Email Search" page (issue #2185). When authenticated as an access-limited subadmin, results are restricted to lists owned by users in the admin's allowed user groups; the global Admin API Key is unrestricted.

**Request Body Parameters:**

| Parameter    | Type   | Required | Description                            |
|--------------|--------|----------|----------------------------------------|
| Command      | String | Yes      | API command: `admin.subscriber.search` |
| AdminAPIKey  | String | Yes      | Admin API key for authentication       |
| EmailAddress | String | Yes      | Exact email address to search for      |

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
      "BounceType": "Not Bounced"
    }
  ]
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
1: Missing EmailAddress parameter
2: Invalid EmailAddress parameter
```

:::
