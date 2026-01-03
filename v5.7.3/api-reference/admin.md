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
| RecordsPerRequest  | Integer | No       | Number of records per request (default: 50, 0 for all records, max: 500)                        |
| RecordsFrom        | Integer | No       | Offset for pagination (default: 0)                                                               |
| Status             | String  | No       | Filter by batch status: `Pending`, `Working`, `Completed`, `Failed`, `Paused`                   |
| OrderField         | String  | No       | Field to sort by: `ID`, `CreatedAt`, `UpdatedAt`, `FinishedAt`, `Status`, `ProcessedEmails`, `EmailsPerSec` |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC` (default: ASC)                                                   |

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
| RecordsPerRequest  | Integer | No       | Number of records per request (default: 50, 0 for all records, max: 500)                        |
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
| RecordsPerRequest  | Integer | No       | Number of records per request (default: 50, 0 for all records, max: 500)                        |
| RecordsFrom        | Integer | No       | Offset for pagination (default: 0)                                                               |
| Status             | String  | No       | Filter by queue status: `Pending`, `Sending`, `Sent`, `Delivered`, `Failed`                     |
| Search             | String  | No       | Search term for EmailAddress field                                                               |
| BatchID            | String  | No       | Filter by specific QueueBatchID                                                                  |
| IsTest             | Boolean | No       | Filter by IsTest flag (true/false)                                                               |
| OrderField         | String  | No       | Field to sort by: `QueueID`, `EmailAddress`, `Status`, `QueuedAt`, `SentAt`, `FailedAt`, `QueueBatchID` (default: QueueID) |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC` (default: ASC)                                                   |

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
| SessionID               | String  | No       | Session ID obtained from login                                                                   |
| APIKey                  | String  | No       | API key for authentication                                                                       |
| CampaignStatus          | String  | No       | Filter by status: `Draft`, `Ready`, `Scheduled`, `Sending`, `Sent`, `Paused`. Note: 'Scheduled' is mapped to 'Ready' with ScheduleType='Future' |
| SearchKeyword           | String  | No       | Search by campaign name (LIKE query)                                                             |
| FilterByUserID          | Integer | No       | Filter by account/user ID (empty for all accounts)                                              |
| CampaignIDs             | String/Array | No  | Filter by specific campaign IDs (comma-separated string or array). Example: "1,2,3" or [1,2,3]  |
| DateFrom                | String  | No       | Start date for filtering (Y-m-d format). For Sent campaigns, filters by SendProcessFinishedOn; for Scheduled, filters by SendDate |
| DateTo                  | String  | No       | End date for filtering (Y-m-d format)                                                            |
| OrderField              | String  | No       | Field to sort by (e.g., CampaignName, SendProcessFinishedOn)                                     |
| OrderType               | String  | No       | Sort direction: `ASC` or `DESC`                                                                  |
| RecordsPerRequest       | Integer | No       | Number of records per page (0 for all)                                                           |
| RecordsFrom             | Integer | No       | Offset for pagination                                                                            |
| RetrieveStatistics      | Boolean | No       | Include campaign statistics (default: false for performance)                                     |
| RetrieveTags            | Boolean | No       | Include campaign tags (default: false)                                                           |
| Tags                    | String  | No       | Comma-separated tag IDs to filter by                                                             |
| SplitABTestStatistics   | Boolean | No       | Include A/B split test statistics (default: false)                                              |
| ExcludeColumns          | Array   | No       | Column names to exclude from SELECT for performance (e.g., ['Options', 'HTMLContent'])          |
| IncludeTotalRecipients  | Boolean | No       | Include aggregate sums of TotalRecipients, TotalSent, TotalFailed (default: false)              |
| IncludeBatchStats       | Boolean | No       | Include batch statistics for each campaign (default: false)                                     |
| IncludeVelocity         | Boolean | No       | Include current sending velocity metrics for each campaign (default: false)                     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaigns.search \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaigns.search",
    "APIKey": "your-admin-api-key",
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
    "TotalFailed": 1250
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
| OrderField          | String  | No       | Field to sort by (e.g., EventID, CreatedAt). Default: EventID                                   |
| OrderType           | String  | No       | Sort direction: `ASC` or `DESC` (default: DESC)                                                  |
| IncludeProperties   | Boolean | No       | Include event properties/metadata (default: true)                                                |

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

Authenticates an administrator and creates a session. This endpoint supports both username/password authentication and Admin API Key authentication. Optional CAPTCHA and 2FA (Two-Factor Authentication) verification are supported based on system configuration.

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                                                                      |
|---------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command       | String  | Yes      | API command: `admin.login`                                                                       |
| Username      | String  | Yes*     | Administrator username (*required unless using AdminAPIKey)                                      |
| Password      | String  | Yes*     | Administrator password (*required unless using AdminAPIKey)                                      |
| Captcha       | String  | Conditional | CAPTCHA code (required if ADMIN_CAPTCHA is enabled and DisableCaptcha is not set)            |
| TFACode       | String  | Conditional | Two-Factor Authentication code (required if 2FA is enabled for the admin account)             |
| AdminAPIKey   | String  | No       | Admin API Key for alternative authentication (bypasses username/password when valid)             |
| DisableCaptcha| Boolean | No       | Set to true to disable CAPTCHA verification for this request                                     |
| Disable2FA    | Boolean | No       | Set to true to disable 2FA verification for this request                                         |

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
captcha: Missing required parameter captcha
5: Invalid CAPTCHA code
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

## Update Administrator Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by Admin API Key
- Legacy endpoint access via `/api.php` is also supported
:::

Updates administrator account details including username, email address, name, and optionally password. Administrators can only update their own account information (AdminID must match the logged-in administrator). This endpoint is disabled in demo mode.

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                                                                                      |
|--------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command      | String  | Yes      | API command: `admin.update`                                                                      |
| SessionID    | String  | No       | Session ID obtained from login                                                                   |
| APIKey       | String  | No       | API key for authentication                                                                       |
| AdminID      | Integer | Yes      | Administrator ID to update (must match logged-in admin)                                          |
| Name         | String  | Yes      | Administrator name                                                                               |
| Username     | String  | Yes      | Administrator username                                                                           |
| EmailAddress | String  | Yes      | Administrator email address (must be valid format)                                               |
| Password     | String  | No       | New password (leave empty to keep existing password)                                             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.update",
    "APIKey": "your-admin-api-key",
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
    "APIKey": "your-admin-api-key",
    "AdminID": 1,
    "Name": "System Administrator",
    "Username": "admin",
    "EmailAddress": "admin@example.com",
    "Password": "newSecurePassword123"
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
  "ErrorCode": 7
}
```

```json [Error Response - Unauthorized]
{
  "Success": false,
  "ErrorCode": 8
}
```

```txt [Error Codes]
0: Success
adminid: Missing required parameter adminid
name: Missing required parameter name
username: Missing required parameter username
emailaddress: Missing required parameter emailaddress
7: Invalid email address format
8: Admin account is not owned by logged in admin
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
| RecordsPerRequest  | Integer | No       | Number of records per request (0-1000, default: 25, 0 for all)                                 |
| RecordsFrom        | Integer | No       | Offset for pagination (default: 0)                                                               |
| OrderField         | String  | No       | Field to sort by: `Username`, `CompanyName`, `LastActivityDateTime`, `LastSendingActivityDateTime`, `AccountStatus`, `UserActivityStatus` |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC`                                                                  |

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

