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
| IncludeIntegrations | Boolean | No | <Badge type="tip" text="New in v6.0.4" /> Add the `Integrations` block with Keitaro clicks, conversions and revenue. Accepted values: `1`, `true`, `yes` (any case). The block is added only when the campaign has a link carrying the <code v-pre>{{ SMS:TrackingCode }}</code> tag. Without this parameter the response is unchanged |

**Response fields worth knowing:**

| Field | Meaning |
|---|---|
| `Counters.AwaitingReport` | Messages sent that have no final delivery outcome yet. This is reported as its own number and is never folded into failures, so a campaign read moments after sending does not look like it failed |
| `Rates.*` | `null` rather than `0` when the denominator is zero. A campaign that has delivered nothing has no click rate, and `0` would render as "0% clicked" next to a campaign that genuinely got none |
| `DetailExpired` | `true` once per-recipient detail has passed its retention window. Counters remain correct and available; only the per-recipient list is gone |
| `Funnel.Skipped` | Recipients removed before sending, broken down by reason |
| `Integrations` | <Badge type="tip" text="New in v6.0.4" /> Present only when `IncludeIntegrations` is set and the campaign has a tracking-tag link. `null` when the integration figures could not be read: the rest of the response is still correct, and the call does not fail |
| `Integrations.UniqueClicks` | Contacts with at least one Keitaro click. Bot clicks are excluded. These clicks never count in `TotalClicks`, `TotalUniqueClicks` or `Rates.ClickRate`, which stay the figures of the tracked short links |
| `Integrations.ClickRate` | `UniqueClicks` over delivered messages, a 0 to 1 ratio rounded to 6 decimals like `Rates.ClickRate` (so `0.048` means 4.8%). `null` when nothing was delivered |
| `Integrations.Conversions` | Contacts with a conversion whose latest status is not `rejected`. Bots are excluded |
| `Integrations.Revenue` | Revenue of those conversions by currency, as 4 decimal strings. Revenue never goes into `ActualCost` |
| `Integrations.Statuses` | Every conversion status Keitaro reported, with `Count` and `Revenue`, including statuses a conversion later moved past (a lead that became a sale counts once as `lead` and once as `sale`) and `rejected` ones. Bots are excluded |
| `Integrations.Links` | Per link ordinal (`LinkOrdinal` matches the campaign's links): `UniqueClicks`, `Conversions` and `Revenue` |
| `Integrations.LastPolledAt` | When Octeth last read clicks from Keitaro (UTC), or `null` when the account has no Keitaro connection |

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

::: details Integrations block (with IncludeIntegrations)

```json
"Integrations": {
  "Provider": "keitaro",
  "UniqueClicks": 120,
  "ClickRate": 0.048,
  "Conversions": 9,
  "Revenue": {"USD": "315.0000"},
  "Statuses": [
    {"Status": "lead", "Count": 14, "Revenue": "0.0000"},
    {"Status": "sale", "Count": 9, "Revenue": "315.0000"},
    {"Status": "rejected", "Count": 2, "Revenue": "0.0000"}
  ],
  "Links": [
    {"LinkOrdinal": 1, "UniqueClicks": 120, "Conversions": 9, "Revenue": "315.0000"}
  ],
  "LastPolledAt": "2026-10-24 12:00:00"
}
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
| Granularity | String | No | Possible values: `minute`, `hour` (default), `day`. <Badge type="tip" text="New in v6.0.1" /> `minute` buckets each event by the minute it happened in, for a campaign that finished sending inside a single hour |
| Events | String | No | Comma-separated event types to include. Possible values: `queued`, `skipped`, `send_attempt`, `sent`, `send_failed`, `delivered`, `undelivered`, `expired`, `clicked`, `replied`, `opted_out`. Defaults to all of them. An unrecognised value is an error, not an empty series. <Badge type="tip" text="New in v6.0.4" /> `integration_click` and `integration_conversion` (Keitaro activity) can be named too, and are never part of the default list |
| IncludeBots | Boolean | No | Include bot clicks, and bot `integration_click` and `integration_conversion` events. Defaults to excluding them |

::: warning Events and Messages count different things
Each point returns both `Events` and `Messages`.

`Events` counts distinct events and is meaningful for every event type. `Messages` counts distinct messages and is only meaningful for event types that carry a message identifier. `queued` events do not carry one, so read `Events` for those; reading `Messages` would report a single message for an entire campaign's queueing.

`Granularity=minute` and `Granularity=hour` read the raw events and honour `IncludeBots`. `Granularity=day` is served from a pre-aggregated table that carries no bot flag, so a daily click series always includes bot clicks whatever `IncludeBots` says. The `ExcludesBots` field in the response tells you which you got.
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
| Event | String | No | Restrict to one event type. Possible values: `queued`, `skipped`, `send_attempt`, `sent`, `send_failed`, `delivered`, `undelivered`, `expired`, `clicked`, `replied`, `opted_out`, and with `IncludeIntegrations` also `integration_click`, `integration_conversion` |
| IncludeIntegrations | Boolean | No | <Badge type="tip" text="New in v6.0.4" /> Count Keitaro activity (`integration_click`, `integration_conversion`) in the breakdown. Accepted values: `1`, `true`, `yes` (any case). Without it those events are left out, and naming one in `Event` returns error 4, so the response is the same as before they existed |
| IncludeBots | Boolean | No | Include bot clicks, and bot `integration_click` and `integration_conversion` events. Defaults to excluding them |
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
| Status | String | No | Filter by delivery status. Possible values: `Queued`, `Released`, `Sending`, `Sent`, `Delivered`, `Failed`, `Expired`, `Rejected`, `Suppressed`, `Cancelled`, and `Skipped` when `IncludeSkipped` is sent |
| Limit | Integer | No | Rows per page, 1 to 500. Default 50 |
| Cursor | Integer | No | `NextCursor` from the previous page. Ignored when `RecordsFrom` is sent |
| RecordsFrom | Integer | No | <Badge type="tip" text="New in v6.0.1" /> Offset into the result set. Sending it switches this call from cursor paging to offset paging and implies `IncludeTotal` |
| IncludeTotal | Boolean | No | <Badge type="tip" text="New in v6.0.1" /> Return `TotalRecipients`. Costs one extra `COUNT` over the same filters, so it is off unless asked for |
| IncludeSkipped | Boolean | No | <Badge type="tip" text="New in v6.0.1" /> Also list the recipients that were skipped before anything was queued for them. Implies offset paging and `IncludeTotal`. Off by default |
| Engagement | String | No | <Badge type="tip" text="New in v6.0.1" /> List only recipients who clicked a link, replied or opted out in this campaign. Combines with `Status`. Possible values: `clicked`, `replied`, `optedout` |

::: tip Skipped recipients
A recipient who is skipped when the campaign is queued (already suppressed, an invalid or duplicate number, a frequency cap, a message that could not be personalized, too long, or a blocked word) never gets a queue row, so by default this endpoint does not list them. A campaign of 7 with 1 suppressed returns 6 rows.

Send `IncludeSkipped` to list them after the queue rows, read from the campaign's skip events. Each one has the queue row's keys, with `QueueID` `null`, `Status` `Skipped`, a `SkipReason` (`suppressed`, `invalid_number`, `duplicate`, `frequency_capped`, `personalization_failed`, `too_long` or `forbidden_word`), and `CreatedAt` set to when it was skipped. The fields that only exist for a sent message are `null`.

- No `Status` lists every recipient, queued and skipped.
- `Status: Suppressed` lists the ones suppressed after queueing and the ones skipped as `suppressed`.
- `Status: Skipped` lists only skipped recipients, for every reason.
- Any other status lists queue rows only.

`RecipientNumber` can be empty for a skipped recipient whose contact has since been deleted. Without `IncludeSkipped` the response is unchanged.
:::

::: tip Filtering by engagement
`Engagement` filters on the queue row's `FirstClickedAt`, `RepliedAt` or `OptedOutAt`. Replies and opt-outs are recorded as they arrive. Clicks are copied onto the queue rows by the periodic rollup, so a new click can take about a minute to appear here.

Skipped recipients were never sent anything, so an `Engagement` filter never lists them, even with `IncludeSkipped`. The response echoes the filter as `Engagement`, or `null` when none was sent. Without `Engagement` the response is unchanged.
:::

::: tip Two ways to page, and when each one is right
By default this endpoint pages by cursor, which steps forward cheaply however many rows a campaign has but cannot say "page 3 of 40" or jump to one.

Send `RecordsFrom` to page by offset instead, which is what a numbered pagination control needs. That is sound here because the result set is bounded by a single campaign's audience; it would not be on `sms.replies.browse`, whose table grows with every reply the account ever receives.

The two are mutually exclusive. A cursor is a position in the ordered set and an offset is a count into it, so honouring both at once would silently skip rows. `RecordsFrom` wins when both are sent.

`TotalRecipients` is `null` when it was not asked for, which is not the same as `0`: one means "not counted", the other means "none".
:::

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
  "Engagement": null,
  "Limit": 100,
  "RecordsFrom": 0,
  "TotalRecipients": null,
  "Recipients": [
    {
      "QueueID": "994463",
      "RelSubscriberID": "1005",
      "RecipientNumber": "+905550000005",
      "Status": "Delivered",
      "SenderID": "OCTETH",
      "MessageParts": "1",
      "MessageEncoding": "GSM7",
      "GatewayStatus": "DELIVRD",
      "GatewayErrorCode": "",
      "ErrorMessage": "",
      "Cost": "0.04500",
      "RetryCount": "0",
      "SentTime": "2026-09-19 14:15:08",
      "DeliveredTime": "2026-09-19 14:15:31",
      "FirstClickedAt": null,
      "ClickCount": "0",
      "RepliedAt": null,
      "OptedOutAt": null,
      "CreatedAt": "2026-09-19 14:15:02"
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
6: The skipped recipients could not be read (only with IncludeSkipped, new in v6.0.1)
7: Invalid Engagement (new in v6.0.1)
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
| Event | String | No | Restrict to one event type. Possible values: `queued`, `skipped`, `send_attempt`, `sent`, `send_failed`, `delivered`, `undelivered`, `expired`, `clicked`, `replied`, `opted_out`, and with `IncludeIntegrations` also `integration_click`, `integration_conversion` |
| IncludeIntegrations | Boolean | No | <Badge type="tip" text="New in v6.0.4" /> Include Keitaro activity (`integration_click`, `integration_conversion`). Accepted values: `1`, `true`, `yes` (any case). Without it those events are left out of the page, and naming one in `Event` returns error 4, so the response is the same as before they existed |
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
| Event | String | No | Restrict to one event type. Same values as `smscampaign.events.browse` |
| IncludeIntegrations | Boolean | No | <Badge type="tip" text="New in v6.0.4" /> Include Keitaro activity (`integration_click`, `integration_conversion`) in the file. Accepted values: `1`, `true`, `yes` (any case). Without it those events are left out, and naming one in `Event` returns error 4. When set, `Filters` in the response carries `"includeintegrations": true` |
| From | String | No | Earliest event time |
| To | String | No | Latest event time |

The export runs as a background job because a campaign's event set runs to millions of rows. Filters are validated when you submit, not when the job runs, so a mistake is reported immediately rather than becoming a failed job minutes later.

Only one export per campaign per account can be queued or running at a time, enforced by the database rather than by a check the request makes first, so two requests arriving together cannot both enqueue. Submitting again while one is in flight returns the existing `ExportID` with `AlreadyQueued: true`, so polling with POST cannot queue a job per poll. In that case `Status` reflects the existing job and is `Pending` or `Running`.

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

::: tip An export that does not finish is failed, not left running
If the worker handling an export dies partway through, a container restart is enough, the job would otherwise sit in `Running` forever and neither complete nor fail. Such a job is given up on after an hour and returned with `Status: "Failed"` and an `Error` saying so, which is your signal to submit it again.

It is failed rather than retried deliberately: retrying a job whose original worker might still be alive would put two workers on the same file.
:::

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
| IncludeIntegrations | Boolean | No | <Badge type="tip" text="New in v6.0.4" /> Add the daily rows of Keitaro activity (`Event` `integration_click` and `integration_conversion`). Accepted values: `1`, `true`, `yes` (any case). Without it those rows are left out and the series is the same as before they existed |

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
| OptOutsOnly | Boolean | No | Return only replies that were treated as an opt-out. Superseded by `Filter`, and ignored when `Filter` is sent |
| Filter | String | No | <Badge type="tip" text="New in v6.0.1" /> One bucket of the feed. Possible values: `optouts`, `failedoptouts`, `unattributed`. Omit for everything |
| IncludeUnattributed | Boolean | No | Include replies that could not be matched to a contact. Defaults to `true`, so send it explicitly as `false` to exclude them |
| Order | String | No | <Badge type="tip" text="New in v6.0.1" /> Possible values: `oldest` (default), `newest`. See the note below before changing it |
| SearchNumber | String | No | <Badge type="tip" text="New in v6.0.1" /> Return only replies from numbers containing these digits. Non-digits are stripped; at least 3 digits are required |
| CreatedAfter | String | No | <Badge type="tip" text="New in v6.0.1" /> Only replies received at or after this point. `YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`; a bare date means 00:00:00 |
| CreatedBefore | String | No | <Badge type="tip" text="New in v6.0.1" /> Only replies received at or before this point. A bare date means 23:59:59, so the whole day is included |
| Limit | Integer | No | Rows per page, 1 to 500. Default 50 |
| Cursor | Integer | No | `NextCursor` from the previous page. Ignored when `RecordsFrom` is sent |
| RecordsFrom | Integer | No | <Badge type="tip" text="New in v6.0.1" /> Offset into the result set. Sending it switches this call from cursor paging to offset paging, which is what a numbered pagination control needs |

::: tip Paging a feed that carries no total
This endpoint returns no row count, deliberately: the table grows with every reply the account ever receives, and a `COUNT` on every page turn is the cost cursor paging exists to avoid.

If you need page numbers, page by `RecordsFrom` and take the total from `sms.replies.summary.get`, which answers the same filters and breaks its counts out per bucket. That is what the interface does, so its page count costs no extra call. Take the count for the bucket you are showing, not `Total`, or a filtered feed gets the page count of the unfiltered one.
:::

::: warning A cursor belongs to one order
`Order` changes the direction the cursor walks: ascending asks for `InboundID > Cursor`, descending asks for `InboundID < Cursor`. A cursor taken from one direction is meaningless in the other, so reset paging when you change `Order` rather than carrying a stored cursor across.

The default stays `oldest` so existing integrations paging through history are unaffected. A reply feed shown to a person usually wants `newest`.
:::

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
  "Filter": "",
  "Order": "oldest",
  "RecordsFrom": 0,
  "SearchNumber": "",
  "CreatedAfter": null,
  "CreatedBefore": null,
  "Replies": [
    {
      "InboundID": "8811",
      "RelGatewayID": "3",
      "FromNumber": "905550000005",
      "ToNumber": "905550000100",
      "MessageText": "STOP",
      "ReceivedAt": "2026-09-19 14:22:10",
      "ProcessingStatus": "processed",
      "RelUserID": "12",
      "RelSMSCampaignID": "41",
      "RelListID": "7",
      "RelSubscriberID": "1503",
      "IsOptOut": "1",
      "OptOutScope": "user",
      "UnsubscribeStatus": "done",
      "ProcessedAt": "2026-09-19 14:22:11"
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
6: Invalid Filter value
7: Invalid Order value
8: Invalid CreatedAfter or CreatedBefore value
9: SearchNumber contains fewer than 3 digits
```

:::

<Badge type="tip" text="New in v6.0.1" /> The response echoes the request: `Filter` (lowercase, empty when not sent), `Order`, `RecordsFrom` (`0` in cursor mode), `SearchNumber` (the digits used, empty when not sent), and `CreatedAfter` and `CreatedBefore` as the applied `YYYY-MM-DD HH:MM:SS` boundary, or `null` when not sent. `NextCursor` is always `null` in offset mode. `FromNumber` is stored as bare digits, without `+`.

`Filter` and `IncludeUnattributed` can appear to contradict each other. `Filter=unattributed` wins: asking for the unattributed bucket while also excluding unattributed replies would otherwise answer an empty list rather than an error.

## Get Account SMS Reply Counts

<Badge type="info" text="GET" /> `/api/v1/sms.replies.summary.get`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

How many replies match a set of filters, broken down by the states worth acting on. `sms.replies.browse` is cursor-paged and returns no total on purpose, because the inbound table grows with every reply the system ever receives and counting it on every page turn is the cost cursor paging exists to avoid. Ask this once instead.

Takes the same scope and the same filters as the feed, minus `Filter` itself: the response already breaks the buckets out separately, so narrowing to one would empty the others.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `sms.replies.summary.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| IncludeUnattributed | Boolean | No | Count replies that could not be matched to a contact. Defaults to `true` |
| SearchNumber | String | No | Count only replies from numbers containing these digits. At least 3 digits |
| CreatedAfter | String | No | Only replies received at or after this point, parsed as in `sms.replies.browse` |
| CreatedBefore | String | No | Only replies received at or before this point |

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| Total | Integer | Replies matching the filters |
| OptOuts | Integer | Of those, the ones treated as an opt-out |
| FailedOptOuts | Integer | Opt-outs the unsubscribe did not complete for. Any non-zero value needs attention: the person asked to be removed and was not |
| Unattributed | Integer | Replies that could not be matched to a contact |
| IncludesUnattributed | Boolean | Whether unattributed replies are actually inside these counts. Asking for them is not the same as getting them: they are only counted for gateways assigned to your account alone |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/sms.replies.summary.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sms.replies.summary.get",
    "APIKey": "your-api-key",
    "CreatedAfter": "2026-09-01"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Total": 1284,
  "OptOuts": 212,
  "FailedOptOuts": 3,
  "Unattributed": 41,
  "IncludesUnattributed": true,
  "SearchNumber": "",
  "CreatedAfter": "2026-09-01 00:00:00",
  "CreatedBefore": null
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 8, "Message": "Invalid createdafter value. Expected YYYY-MM-DD or YYYY-MM-DD HH:MM:SS." }],
  "ErrorCode": 8
}
```

```txt [Error Codes]
5: The reply summary could not be read
8: Invalid CreatedAfter or CreatedBefore value
9: SearchNumber contains fewer than 3 digits
```

:::

## Browse Inbound SMS (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.inbound.get`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.2
:::

One page of every reply and opt-out received on the install's SMS gateways, newest first (`ReceivedAt`, then `InboundID`). It is the list behind the staff **SMS > Inbound** screen, which replaced the classic admin **Reports > Inbound SMS** page, and it includes the replies that could not be attributed to an account.

A sub-admin limited to some user groups sees only the messages attributed to accounts in those groups. An unattributed message belongs to no account, so only administrators without a user group limit see it. `UserGroupScoped` says which applies to the caller.

Phone numbers and message bodies are personal data. The command returns them and logs neither. Each row is an allow-listed projection: the raw gateway payload and the list and subscriber IDs are never returned.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.sms.inbound.get` |
| AdminAPIKey | String | No | Admin API key. Or authenticate with an admin `SessionID` |
| Page | Integer | No | Page number, default 1. A value that is not a positive whole number is page 1 |
| RecordsPerPage | Integer | No | Page size, 10 to 100, default 50. A value outside the range is brought into it |
| Status | String | No | Processing status: `pending`, `processed`, `unattributed` or `failed` |
| Number | String | No | The start of the sending number. Everything but digits is dropped, so `+1 (555)` matches numbers starting `1555` |
| OptOut | String | No | `yes` for opt-outs, `no` for the other messages, `failed` for opt-outs whose unsubscribe failed |
| GatewayID | Integer | No | The receiving gateway |
| DateFrom | String | No | Received on or after this date, `YYYY-MM-DD` in UTC |
| DateTo | String | No | Received on or before this date, `YYYY-MM-DD` in UTC, the whole day included |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.sms.inbound.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.sms.inbound.get",
    "AdminAPIKey": "your-admin-api-key",
    "OptOut": "failed",
    "DateFrom": "2026-10-01",
    "DateTo": "2026-10-18",
    "RecordsPerPage": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalMessages": 1,
  "Page": 1,
  "RecordsPerPage": 50,
  "TotalPages": 1,
  "UserGroupScoped": false,
  "Filters": {
    "Status": "",
    "Number": "",
    "OptOut": "failed",
    "GatewayID": "",
    "DateFrom": "2026-10-01",
    "DateTo": "2026-10-18"
  },
  "Messages": [
    {
      "InboundID": 981,
      "ReceivedAt": "2026-10-17 09:12:44",
      "GatewayID": 2,
      "GatewayName": "Primary",
      "FromNumber": "15551234567",
      "ToNumber": "18005550100",
      "MessageText": "stop texting me",
      "ProcessingStatus": "processed",
      "ProcessingError": "",
      "UserID": 42,
      "Username": "acme",
      "UserEmailAddress": "ops@acme.example",
      "SMSCampaignID": 7,
      "CampaignName": "October promo",
      "IsOptOut": true,
      "OptOutScope": "user",
      "UnsubscribeStatus": "failed",
      "ProcessedAt": "2026-10-17 09:12:45"
    }
  ],
  "Gateways": [
    {"GatewayID": 2, "GatewayName": "Primary"},
    {"GatewayID": 3, "GatewayName": "Backup"}
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
1: Status is not pending, processed, unattributed or failed
2: OptOut is not yes, no or failed
3: GatewayID is not a positive whole number
4: DateFrom is not a valid YYYY-MM-DD date
5: DateTo is not a valid YYYY-MM-DD date
6: DateFrom is after DateTo
7: The messages could not be read (see the error log)
99999: Not enough privileges (sub-admin without SMS or Settings)
```

:::

**Response fields:**

| Field | Type | Description |
|---|---|---|
| TotalMessages | Integer | Messages matching the filters and the caller's user group scope |
| Page, RecordsPerPage, TotalPages | Integer | The page returned, its size, and the number of pages (at least 1). A page past the end returns an empty `Messages` |
| UserGroupScoped | Boolean | `true` when the caller is limited to user groups, so unattributed messages are left out |
| Filters | Object | The filters applied, as sent |
| Messages | Array | The page, described below |
| Gateways | Array | Every SMS gateway (`GatewayID`, `GatewayName`), for a gateway filter. Empty when the gateways could not be read |

Message fields:

- `ReceivedAt` and `ProcessedAt` are `Y-m-d H:i:s` in UTC. `ProcessedAt` is `null` until the message is processed.
- `GatewayName` is `null` when the gateway no longer exists.
- `ProcessingStatus` is `pending` (not processed yet), `processed`, `unattributed` (no message matched it, so no account owns it) or `failed`, with the reason in `ProcessingError`.
- `UserID`, `Username`, `UserEmailAddress`, `SMSCampaignID` and `CampaignName` are `null` when the message is not attributed to an account or a campaign.
- `IsOptOut` is `true` for an opt-out. `OptOutScope` is `user` (the account's contact) or `gateway` (every account on the gateway), and `none` for other messages.
- `UnsubscribeStatus` is `none`, `pending`, `done` or `failed`. A `failed` opt-out is suppressed, but the contact still counts as subscribed until the unsubscribe succeeds.

## Get Bulk SMS Settings (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.settings.get`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.2
:::

Every bulk SMS business setting with the value in force and the layer it comes from. It is the read behind the staff **SMS > Settings** screen, which replaced the classic admin **Bulk SMS Settings** page. Each setting uses a value stored by an administrator first, then its `.oempro_env` key, then the shipped default.

Not to be confused with `sms.settings.get`, which reads the SMS frequency limits and forbidden words.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.sms.settings.get` |
| AdminAPIKey | String | No | Admin API key. Or authenticate with an admin `SessionID` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.sms.settings.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.sms.settings.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Settings": [
    {
      "Name": "SMSCampaignCostPerPart",
      "Value": 0.0125,
      "Type": "float",
      "Source": "option",
      "EnvKey": "SMS_CAMPAIGN_COST_PER_PART",
      "EnvValue": "0.0100",
      "Default": 0.01
    },
    {
      "Name": "SMSReplyAttributionDays",
      "Value": 30,
      "Type": "int",
      "Source": "default",
      "EnvKey": "SMS_REPLY_ATTRIBUTION_DAYS",
      "EnvValue": null,
      "Default": 30
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

:::

**Error Codes:**

| Code | Description |
|---|---|
| 1 | The settings could not be read |
| 99999 | The administrator lacks the `SMS` or `Settings` privilege |

**Response fields:**

- `Settings` lists all 17 settings in a fixed order: `SMSCampaignMaxRecipients`, `SMSCampaignCostPerPart`, `SMSCampaignCostCurrency`, `SMSCampaignCostDriftTolerance`, `SMSCampaignQuietHoursStart`, `SMSCampaignQuietHoursEnd`, `SMSCampaignDefaultSendRatePerMinute`, `SMSCampaignJourneyReservePercent`, `SMSCampaignOptOutFooterEnabledDefault`, `SMSCampaignOptOutFooterDefault`, `SMSOptOutKeywords`, `SMSReplyAttributionDays`, `SMSEventRetentionDays`, `SMSCampaignQueueRetentionDays`, `SMSInboundRetentionDays`, `SMSTestDailyLimit` and `SMSTestCooldownSeconds`. <Badge type="tip" text="New in v6.0.4" /> The last two limit campaign test sends: tests per account in any 24 hours (0 to 1000, 0 turns them off) and seconds between two tests (0 to 3600).
- `Type` is `int`, `float`, `string` or `bool`, and `Value` and `Default` carry that type. `Value` is what the workers use, after the clamps (for example a journey reserve above 50 reads as 50).
- `Source` is `option` (stored by an administrator), `env` (`.oempro_env` sets the key) or `default` (the shipped default).
- `EnvValue` is the raw `.oempro_env` string, or `null` when the file does not set the key.

## Update Bulk SMS Settings (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.settings.update`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 100 requests per 60 seconds
- Not available in demo mode
- Legacy endpoint access via `/api.php` is also supported
- Added in v6.0.2
:::

Stores or removes administrator values for the bulk SMS business settings. Send each setting to change as its own parameter, named after the setting. A setting you do not send is left alone. A change reaches the running workers within about a minute.

- **An empty value** removes the stored value and hands the setting back to `.oempro_env`.
- **A value equal to the one in force is not stored**, so sending the current value never turns an `.oempro_env` value into a stored one.
- **Every value is checked before anything is written.** `int` settings take whole numbers of zero or more, `float` settings take decimals of zero or more, `bool` settings take `1`, `0`, `true`, `false`, `yes`, `no`, `on` or `off` (or a JSON boolean), and the two quiet-hours settings take a 24-hour `HH:MM` time. Other text settings are stored as sent, spaces included. Ranges are not refused: the workers clamp what is stored, and a retention of `0` turns pruning off.

Not to be confused with `sms.settings.update`, which writes the SMS frequency limits and forbidden words.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.sms.settings.update` |
| AdminAPIKey | String | No | Admin API key. Or authenticate with an admin `SessionID` |
| `<SettingName>` | String | At least one | Any setting name returned by `admin.sms.settings.get`, for example `SMSCampaignCostPerPart`. Names match in any letter case. An empty value hands the setting back to `.oempro_env` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.sms.settings.update \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.sms.settings.update",
    "AdminAPIKey": "your-admin-api-key",
    "SMSCampaignCostPerPart": "0.0125",
    "SMSCampaignQuietHoursStart": "",
    "SMSCampaignOptOutFooterEnabledDefault": false
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Saved": ["SMSCampaignCostPerPart", "SMSCampaignOptOutFooterEnabledDefault"],
  "Cleared": ["SMSCampaignQuietHoursStart"],
  "Unchanged": [],
  "Settings": [
    {
      "Name": "SMSCampaignMaxRecipients",
      "Value": 1000000,
      "Type": "int",
      "Source": "env",
      "EnvKey": "SMS_CAMPAIGN_MAX_RECIPIENTS",
      "EnvValue": "1000000",
      "Default": 1000000
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "SMSCampaignQuietHoursEnd must be a time as HH:MM, for example 21:00. Nothing was saved.",
  "InvalidSettings": {
    "SMSCampaignQuietHoursEnd": "must be a time as HH:MM, for example 21:00"
  }
}
```

:::

**Error Codes:**

| Code | Description |
|---|---|
| 1 | No setting was sent |
| 2 | A value is invalid. `InvalidSettings` names each one with the reason. Nothing was written |
| 3 | The settings could not be read, so nothing was written |
| 4 | A write failed after others succeeded. `FailedSettings` lists the failures, `Saved` and `Cleared` what was written |
| 99999 | The administrator lacks the `SMS` or `Settings` privilege |

**Response fields:**

- `Saved` lists the settings stored, `Cleared` the settings handed back to `.oempro_env`, and `Unchanged` the settings sent with the value already in force, or empty with no stored value to remove.
- `Settings` is the full list as `admin.sms.settings.get` returns it, read after the write.

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
| Event | String | No | Restrict to one event type. Possible values: `queued`, `skipped`, `send_attempt`, `sent`, `send_failed`, `delivered`, `undelivered`, `expired`, `clicked`, `replied`, `opted_out`, and with `IncludeIntegrations` also `integration_click`, `integration_conversion` |
| IncludeIntegrations | Boolean | No | <Badge type="tip" text="New in v6.0.4" /> Include the contact's Keitaro activity (`integration_click`, `integration_conversion`). Accepted values: `1`, `true`, `yes` (any case). Without it those events are left out of the page, and naming one in `Event` returns error 4, so the response is the same as before they existed |
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
