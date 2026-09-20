---
layout: doc
---

# SMS Reporting API Documentation

Reporting endpoints for bulk SMS campaigns: counters and rates, time series, breakdowns, per-recipient status, raw events, replies, link clicks, and asynchronous CSV export.

::: tip How these numbers are produced
Campaign counters are recomputed from the deduplicated event store by a scheduled rollup that runs every minute, and are read from the campaign record rather than recalculated per request. `CountersUpdatedAt` on `smscampaign.stats` tells you how fresh they are, so you can tell a campaign whose counters were just refreshed and genuinely has no activity from one that has never been rolled up.

Everything else reads the event store directly and is deduplicated at read time. Bot clicks are excluded from every count unless you pass `IncludeBots=1`.
:::

## Get Campaign Statistics

<Badge type="info" text="GET" /> `/api/v1/smscampaign.stats`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.stats` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to report on |

**Response fields worth knowing:**

| Field | Meaning |
|---|---|
| `Counters.AwaitingReport` | Messages sent that have no final delivery outcome yet. This is reported as its own number and is never folded into failures, so a campaign read moments after sending does not look like it failed |
| `Rates.*` | `null` rather than `0` when the denominator is zero. A campaign that has delivered nothing has no click rate, and `0` would render as "0% clicked" next to a campaign that genuinely got none |
| `DetailExpired` | `true` once per-recipient detail has passed its retention window. Counters remain correct and available; only the per-recipient list is gone |
| `Funnel.Skipped` | Recipients removed before sending, broken down by reason |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.stats \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.stats",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234
  }'
```

```json [Success Response]
{
  "Success": true,
  "SMSCampaignID": 1234,
  "Status": "Sent",
  "DetailExpired": false,
  "DetailExpiredAt": null,
  "Counters": {
    "TotalAudience": 5,
    "TotalQueued": 4,
    "TotalSent": 4,
    "TotalDelivered": 3,
    "TotalUndelivered": 0,
    "TotalExpired": 0,
    "TotalClicks": 2,
    "TotalUniqueClicks": 1,
    "TotalReplies": 1,
    "TotalOptOuts": 1,
    "TotalParts": 8,
    "AwaitingReport": 1,
    "ActualCost": "0.08000",
    "CostCurrency": "USD",
    "CountersUpdatedAt": "2026-09-20 09:41:07"
  },
  "Rates": {
    "DeliveryRate": 0.75,
    "UndeliveredRate": 0,
    "ClickRate": 0.333333,
    "ReplyRate": 0.333333,
    "OptOutRate": 0.333333
  },
  "Funnel": {
    "Audience": 5,
    "Skipped": [{"Reason": "suppressed", "Total": 1}],
    "Queued": 4,
    "Sent": 4,
    "Delivered": 3,
    "Clicked": 1,
    "Replied": 1,
    "OptedOut": 1
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
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
5: The event store could not be read
```

:::

## Get Campaign Statistics Over Time

<Badge type="info" text="GET" /> `/api/v1/smscampaign.stats.timeseries`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.stats.timeseries` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to report on |
| Granularity | String | No | Possible values: `hour` (default), `day` |
| Events | String | No | Comma-separated event types to include. Possible values: `queued`, `skipped`, `send_attempt`, `sent`, `send_failed`, `delivered`, `undelivered`, `expired`, `clicked`, `replied`, `opted_out`. Defaults to all of them. An unrecognised value is an error, not an empty series |
| IncludeBots | Boolean | No | Include bot clicks. Defaults to excluding them |

::: warning Events and Messages count different things
Each point returns both `Events` and `Messages`.

`Events` counts distinct events and is meaningful for every event type. `Messages` counts distinct messages and is only meaningful for event types that carry a message identifier. `queued` events do not carry one, so read `Events` for those; reading `Messages` would report a single message for an entire campaign's queueing.

`Granularity=day` is served from a pre-aggregated table that carries no bot flag, so a daily click series always includes bot clicks whatever `IncludeBots` says. The `ExcludesBots` field in the response tells you which you got.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.stats.timeseries \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.stats.timeseries",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234,
    "Granularity": "hour",
    "Events": "sent,delivered,clicked"
  }'
```

```json [Success Response]
{
  "Success": true,
  "SMSCampaignID": 1234,
  "Granularity": "hour",
  "Events": ["sent", "delivered", "clicked"],
  "ExcludesBots": true,
  "MessagesOnlyMeaningfulForOutcomes": true,
  "Series": [
    {"Bucket": "2026-09-19 14:00:00", "Event": "sent", "Events": 20, "Messages": 20}
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
3: Invalid Granularity
4: Unknown event type
5: The event store could not be read
```

:::

## Get a Campaign Breakdown

<Badge type="info" text="GET" /> `/api/v1/smscampaign.stats.breakdown`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.stats.breakdown` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to report on |
| Dimension | String | Yes | The single dimension to group by. Possible values: `hour`, `day`, `gateway_status`, `error_code`, `carrier`, `country`, `link`, `sender_id` |
| Event | String | No | Restrict to one event type. Possible values: `queued`, `skipped`, `send_attempt`, `sent`, `send_failed`, `delivered`, `undelivered`, `expired`, `clicked`, `replied`, `opted_out` |
| IncludeBots | Boolean | No | Include bot clicks. Defaults to excluding them |
| Limit | Integer | No | Rows to return, 1 to 500. Default 50 |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.stats.breakdown \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.stats.breakdown",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234,
    "Dimension": "carrier"
  }'
```

```json [Success Response]
{
  "Success": true,
  "SMSCampaignID": 1234,
  "Dimension": "carrier",
  "Event": null,
  "ExcludesBots": true,
  "Limit": 50,
  "Breakdown": [
    {"Dimension": "Turkcell", "Events": 120, "Messages": 118}
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
3: Invalid Dimension
4: Unknown event type
5: The event store could not be read
```

:::

## Browse Campaign Recipients

<Badge type="info" text="GET" /> `/api/v1/smscampaign.recipients`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.recipients.browse` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to read |
| Status | String | No | Filter by delivery status. Possible values: `Queued`, `Released`, `Sending`, `Sent`, `Delivered`, `Failed`, `Expired`, `Rejected`, `Suppressed`, `Cancelled` |
| Limit | Integer | No | Rows per page, 1 to 500. Default 50 |
| Cursor | Integer | No | `NextCursor` from the previous page |

::: warning Per-recipient detail expires
Once a campaign's queue rows pass their retention window, this endpoint returns `DetailExpired: true` and an empty `Recipients` array rather than pretending the campaign reached nobody. The campaign's counters remain correct and available through `smscampaign.stats`.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.recipients \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.recipients.browse",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234,
    "Status": "Delivered",
    "Limit": 100
  }'
```

```json [Success Response]
{
  "Success": true,
  "SMSCampaignID": 1234,
  "DetailExpired": false,
  "Status": "Delivered",
  "Limit": 100,
  "Recipients": [
    {
      "QueueID": 994463,
      "RelSubscriberID": 1005,
      "RecipientNumber": "+905550000005",
      "Status": "Delivered",
      "SentTime": "2026-09-19 14:15:08",
      "DeliveredTime": "2026-09-19 14:15:31",
      "FirstClickedAt": null,
      "ClickCount": 0
    }
  ],
  "NextCursor": 994463
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
3: Invalid Status
5: The recipients could not be read
```

:::

## Browse Campaign Events

<Badge type="info" text="GET" /> `/api/v1/smscampaign.events`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.events.browse` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to read |
| Event | String | No | Restrict to one event type. Possible values: `queued`, `skipped`, `send_attempt`, `sent`, `send_failed`, `delivered`, `undelivered`, `expired`, `clicked`, `replied`, `opted_out` |
| From | String | No | Earliest event time, any parseable date |
| To | String | No | Latest event time |
| SubscriberID | Integer | No | Restrict to one contact |
| Limit | Integer | No | Rows per page, 1 to 500. Default 50 |
| CursorTime | String | No | `NextCursor.CursorTime` from the previous page. Must be sent together with `CursorID` |
| CursorID | String | No | `NextCursor.CursorID` from the previous page |

::: tip Why the cursor is a pair
Thousands of events can share the same millisecond at campaign volume, so a cursor on time alone would either repeat that millisecond on the next page or skip it. Paging is on `(EventTime, EventID)` together, which is unique. Send both values back exactly as received.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.events \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.events.browse",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234,
    "Event": "clicked",
    "Limit": 100
  }'
```

```json [Success Response]
{
  "Success": true,
  "SMSCampaignID": 1234,
  "Event": "clicked",
  "Limit": 100,
  "Events": [
    {
      "EventTime": "2026-09-19 14:15:08.000",
      "EventID": "0cd4ad1c2deb6b2d7f10ffa11b5dea23e9bd4c03",
      "Event": "clicked",
      "Source": "campaign",
      "SubscriberID": 1005,
      "URL": "https://example.com/offer",
      "IsBot": 0
    }
  ],
  "NextCursor": {
    "CursorTime": "2026-09-19 14:15:08.000",
    "CursorID": "0cd4ad1c2deb6b2d7f10ffa11b5dea23e9bd4c03"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [4]
}
```

```txt [Error Codes]
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
4: Unknown event type
5: The event store could not be read
6: Invalid From, To or CursorTime date
```

:::

## Browse Campaign Replies

<Badge type="info" text="GET" /> `/api/v1/smscampaign.replies`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.replies.browse` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to read |
| OptOutsOnly | Boolean | No | Return only replies that were treated as an opt-out |
| Limit | Integer | No | Rows per page, 1 to 500. Default 50 |
| Cursor | Integer | No | `NextCursor` from the previous page |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.replies \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.replies.browse",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234
  }'
```

```json [Success Response]
{
  "Success": true,
  "SMSCampaignID": 1234,
  "OptOutsOnly": false,
  "Limit": 50,
  "Replies": [
    {
      "InboundID": 8811,
      "FromNumber": "+905550000005",
      "MessageText": "STOP",
      "ReceivedAt": "2026-09-19 14:22:10",
      "IsOptOut": 1,
      "OptOutScope": "user",
      "UnsubscribeStatus": "done"
    }
  ],
  "NextCursor": null
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
5: The replies could not be read
```

:::

## Get Campaign Link Clicks

<Badge type="info" text="GET" /> `/api/v1/smscampaign.linkclicks`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.linkclicks.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to read |
| IncludeBots | Boolean | No | Include bot clicks. Defaults to excluding them |

Links that were sent and never clicked are returned with zero counts rather than omitted, so a report cannot silently hide the link nobody clicked.

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.linkclicks \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.linkclicks.get",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234
  }'
```

```json [Success Response]
{
  "Success": true,
  "SMSCampaignID": 1234,
  "ExcludesBots": true,
  "Links": [
    {
      "LinkOrdinal": 1,
      "URL": "https://example.com/offer",
      "TotalClicks": 2,
      "UniqueClickers": 1,
      "FirstClickedAt": "2026-09-19 14:20:01.000",
      "LastClickedAt": "2026-09-19 14:41:55.000"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
4: The campaign's links could not be read
5: The event store could not be read
```

:::

## Start a Campaign Event Export

<Badge type="info" text="POST" /> `/api/v1/smscampaign.events.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.events.export.post` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to export |
| Event | String | No | Restrict to one event type |
| From | String | No | Earliest event time |
| To | String | No | Latest event time |

The export runs as a background job because a campaign's event set runs to millions of rows. Filters are validated when you submit, not when the job runs, so a mistake is reported immediately rather than becoming a failed job minutes later.

Only one export per campaign per account can be queued or running at a time. Submitting again while one is in flight returns the existing `ExportID` with `AlreadyQueued: true`, so polling with POST cannot queue a job per poll.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.events.export \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.events.export.post",
    "APIKey": "your-api-key",
    "SMSCampaignID": 1234,
    "Event": "delivered"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ExportID": 91,
  "Status": "Pending",
  "AlreadyQueued": false,
  "Filters": {"event": "delivered"}
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [4]
}
```

```txt [Error Codes]
1: Invalid or missing SMSCampaignID
2: Campaign not found, or it belongs to another account
4: Unknown event type
5: The export could not be queued
6: Invalid From or To date
7: From is after To
```

:::

## Get a Campaign Event Export

<Badge type="info" text="GET" /> `/api/v1/smscampaign.events.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.events.export.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| ExportID | Integer | Yes | The export job to read |

::: warning The download link is signed and expires
`DownloadURL` carries a signature over the export and its owner and is valid for `DownloadExpiresInSeconds`. Request a fresh one when it expires rather than storing it.

A link is only offered when the file is actually on disk. Export files are removed after 7 days, so a `Done` export whose file has aged out returns `FileAvailable: false` and no URL rather than a link to a missing file.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.events.export \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.events.export.get",
    "APIKey": "your-api-key",
    "ExportID": 91
  }'
```

```json [Success Response]
{
  "Success": true,
  "ExportID": 91,
  "SMSCampaignID": 1234,
  "Status": "Done",
  "RowCount": 40,
  "Error": "",
  "Filters": {"event": "delivered"},
  "CreatedAt": "2026-09-20 09:40:00",
  "CompletedAt": "2026-09-20 09:41:12",
  "DownloadURL": "https://example.com/sms_export_download.php?exportid=91&token=...",
  "DownloadExpiresInSeconds": 900,
  "FileAvailable": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
1: Invalid or missing ExportID
2: Export not found, or it belongs to another account
5: The export could not be read
```

:::

## Get Account SMS Statistics

<Badge type="info" text="GET" /> `/api/v1/sms.stats.account`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `sms.stats.account` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| From | String | No | First day to include. Defaults to 30 days ago |
| To | String | No | Last day to include. Defaults to today |

Results are broken down by `Source`, because an account's SMS activity is not one number and "why did this month cost more" is usually answered by which source grew.

::: warning Cost and parts here are approximate
`ApproxCost` and `ApproxParts` are sums over a pre-aggregated table that cannot deduplicate a repeated event, so they are a trend rather than an invoice. For the exact figure read `ActualCost` on the campaign, which is derived from a deduplicated query. The response says so with `CostAndPartsAreApproximate`.

As with the campaign time series, `Events` counts distinct events and is meaningful everywhere, while `Messages` is only meaningful for event types that carry a message identifier.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/sms.stats.account \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sms.stats.account",
    "APIKey": "your-api-key",
    "From": "2026-09-01",
    "To": "2026-09-30"
  }'
```

```json [Success Response]
{
  "Success": true,
  "From": "2026-09-01",
  "To": "2026-09-30",
  "CostAndPartsAreApproximate": true,
  "MessagesOnlyMeaningfulForCampaignOutcomes": true,
  "Series": [
    {
      "Day": "2026-09-19",
      "Source": "campaign",
      "Event": "sent",
      "Events": 120205,
      "Messages": 120205,
      "ApproxCost": "0.16",
      "ApproxParts": 120201
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [6]
}
```

```txt [Error Codes]
5: The event store could not be read
6: Invalid From or To date
7: From is after To
```

:::

## Browse Account SMS Replies

<Badge type="info" text="GET" /> `/api/v1/sms.replies`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `sms.replies.browse` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| OptOutsOnly | Boolean | No | Return only replies that were treated as an opt-out |
| IncludeUnattributed | Boolean | No | Include replies that could not be matched to a contact. Defaults to `true` |
| Limit | Integer | No | Rows per page, 1 to 500. Default 50 |
| Cursor | Integer | No | `NextCursor` from the previous page |

::: tip Unattributed replies
A reply that could not be matched to a contact still belongs to somebody. Where the receiving gateway is assigned to your account alone, and is not a shared gateway, such replies are included here so they are not silently lost. On a shared gateway they are not, because they cannot be attributed unambiguously.

`IncludesUnattributed` in the response tells you whether any were eligible to be included.
:::

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/sms.replies \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sms.replies.browse",
    "APIKey": "your-api-key",
    "OptOutsOnly": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "Limit": 50,
  "OptOutsOnly": true,
  "IncludesUnattributed": true,
  "Replies": [
    {
      "InboundID": 8811,
      "FromNumber": "+905550000005",
      "MessageText": "STOP",
      "ReceivedAt": "2026-09-19 14:22:10",
      "ProcessingStatus": "processed",
      "IsOptOut": 1
    }
  ],
  "NextCursor": null
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [5]
}
```

```txt [Error Codes]
5: The replies could not be read
```

:::

## Get a Subscriber's SMS History

<Badge type="info" text="GET" /> `/api/v1/subscriber.sms.events`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `subscriber.sms.events.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| ListID | Integer | Yes | The list the contact belongs to. This is the ownership boundary and is checked before anything is read |
| SubscriberID | Integer | Yes | The contact to read |
| Event | String | No | Restrict to one event type |
| Limit | Integer | No | Rows per page, 1 to 500. Default 50 |
| CursorTime | String | No | `NextCursor.CursorTime` from the previous page. Must be sent together with `CursorID` |
| CursorID | String | No | `NextCursor.CursorID` from the previous page |

Newest first, unlike the campaign event browser, because a contact's history is read from the most recent thing that happened.

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/subscriber.sms.events \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.sms.events.get",
    "APIKey": "your-api-key",
    "ListID": 124,
    "SubscriberID": 1005
  }'
```

```json [Success Response]
{
  "Success": true,
  "ListID": 124,
  "SubscriberID": 1005,
  "Event": null,
  "Limit": 50,
  "Events": [
    {
      "EventTime": "2026-09-19 14:15:31.000",
      "EventID": "1b2ba54fb97af29a5672af2295c1f06ee88c1969",
      "Event": "delivered",
      "Source": "campaign",
      "SMSCampaignID": 1234,
      "GatewayStatus": "Delivered"
    }
  ],
  "NextCursor": null
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
1: Invalid or missing ListID or SubscriberID
2: List not found, or it belongs to another account
4: Unknown event type
5: The event store could not be read
6: Invalid CursorTime
```

:::
