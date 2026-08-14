---
layout: doc
---

# Autoresponders API Documentation

Automated email sequence endpoints for creating, managing, and configuring autoresponder campaigns that trigger based on subscriber actions.

## Create Autoresponder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Creates a new autoresponder that sends an email based on subscriber triggers such as subscription, link clicks, campaign opens, conversions, forward-to-friend actions, or specific dates. Supports delayed sending with various time intervals, optional recurring sequences (hours/days/weeks/months), an Enabled/Disabled status flag for soft-pause, and optional segment scoping.

**Request Body Parameters:**

| Parameter                  | Type    | Required | Description                                                                                      |
|----------------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command                    | String  | Yes      | API command: `autoresponder.create`                                                              |
| SessionID                  | String  | No       | Session ID obtained from login                                                                   |
| APIKey                     | String  | No       | API key for authentication                                                                       |
| SubscriberListID           | Integer | Yes      | Subscriber list ID to attach the autoresponder to                                                |
| AutoResponderName          | String  | Yes      | Name of the autoresponder                                                                        |
| AutoResponderTriggerType   | String  | Yes      | Trigger type. Possible values: `OnSubscription`, `OnSubscriberLinkClick`, `OnSubscriberCampaignOpen`, `OnSubscriberCampaignConversion`, `OnSubscriberForwardToFriend`, `OnSubscriberDate` |
| AutoResponderTriggerValue  | String  | Conditional | Trigger value (required for: `OnSubscriberLinkClick`, `OnSubscriberCampaignOpen`, `OnSubscriberCampaignConversion`, `OnSubscriberDate`) |
| AutoResponderTriggerValue2 | String  | No       | Additional trigger value for certain trigger types                                               |
| EmailID                    | Integer | Yes      | Email template ID to send                                                                        |
| TriggerTimeType            | String  | Yes      | Time delay type. Possible values: `Immediately`, `Seconds later`, `Minutes later`, `Hours later`, `Days later`, `Weeks later`, `Months later` |
| TriggerTime                | Integer | Conditional | Time delay value (required when TriggerTimeType is not `Immediately`)                        |
| Repeat                     | String  | No       | Repeat pattern in ISO 8601-style duration format: `R{count}/P{interval}{unit}` where unit is `H` (hours), `D` (days), `W` (weeks), or `M` (months). Examples: `R5/P2D` (5 occurrences every 2 days), `R3/P2W` (3 occurrences every 2 weeks), `R6/P1M` (6 occurrences every month). |
| Status                     | String  | No       | Soft-pause flag. Possible values: `Enabled`, `Disabled`. Default: `Enabled`. Disabled autoresponders do not enqueue new sends but already-queued sends continue to fire (forward-looking pause). |
| SegmentID                  | Integer | No       | Segment scope. When supplied, only subscribers matching this segment trigger the autoresponder. The segment must belong to the same list and the calling user. NULL means whole-list scope (default). |

::: code-group

```bash [Example Request - Welcome Email]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "Welcome Email",
    "AutoResponderTriggerType": "OnSubscription",
    "EmailID": 456,
    "TriggerTimeType": "Immediately"
  }'
```

```bash [Example Request - Delayed Follow-up]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "3-Day Follow-up",
    "AutoResponderTriggerType": "OnSubscription",
    "EmailID": 457,
    "TriggerTimeType": "Days later",
    "TriggerTime": 3
  }'
```

```bash [Example Request - Monthly Recurring]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "Monthly Newsletter Series",
    "AutoResponderTriggerType": "OnSubscription",
    "EmailID": 458,
    "TriggerTimeType": "Days later",
    "TriggerTime": 7,
    "Repeat": "R6/P1M"
  }'
```

```bash [Example Request - Segment-Scoped, Pre-Paused]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "AutoResponderName": "Win-back Sequence",
    "AutoResponderTriggerType": "OnSubscription",
    "EmailID": 459,
    "TriggerTimeType": "Days later",
    "TriggerTime": 1,
    "SegmentID": 42,
    "Status": "Disabled"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AutoResponderID": 789
}
```

```json [Error Response - Invalid Trigger Type]
{
  "Success": false,
  "ErrorCode": [6]
}
```

```json [Error Response - Invalid Email]
{
  "Success": false,
  "ErrorCode": [9]
}
```

```txt [Error Codes]
0: Success
subscriberlistid: Missing required parameter subscriberlistid
autorespondername: Missing required parameter autorespondername
autorespondertriggertype: Missing required parameter autorespondertriggertype
autorespondertriggervalue: Missing required parameter autorespondertriggervalue (required for certain trigger types)
5: Missing triggertime when triggertimetype is not Immediately
6: Invalid autoresponder trigger type
7: Invalid trigger time type
8: Missing required parameter emailid
9: Invalid email ID (email not found or does not belong to user)
10: Invalid status value (must be Enabled or Disabled)
11: Invalid segment id (segment does not belong to this list / user)
12: Auto responder could not be created (persistence failed)
```

:::

## Get Autoresponder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Retrieves detailed information about a specific autoresponder including configuration, trigger settings, and optionally performance statistics. The autoresponder must be owned by the authenticated user. `RepeatSettings` is returned as a decoded object (or `null` when never set).

::: warning Behavior change (v5.9.3, #2367)
An `AutoResponderID` that does not exist, or that belongs to another user, now returns `Success: false` with error code `2`. Earlier versions returned `Success: true` with a fabricated, near-empty `AutoResponder` object, so an integration that treated a `200` response as a valid record was reading placeholder data.

Lookup is scoped by owner, so a non-owned ID is deliberately indistinguishable from a missing one — both produce the same error. This prevents callers from enumerating other users' autoresponder IDs.
:::

**Request Body Parameters:**

| Parameter           | Type    | Required | Description                                                                                      |
|---------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command             | String  | Yes      | API command: `autoresponder.get`                                                                 |
| SessionID           | String  | No       | Session ID obtained from login                                                                   |
| APIKey              | String  | No       | API key for authentication                                                                       |
| AutoResponderID     | Integer | Yes      | Autoresponder ID to retrieve                                                                     |
| RetrieveStatistics  | Boolean | No       | Include performance statistics (default: false)                                                  |

::: code-group

```bash [Example Request - Basic]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789
  }'
```

```bash [Example Request - With Statistics]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "RetrieveStatistics": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AutoResponder": {
    "AutoResponderID": 789,
    "AutoResponderName": "Welcome Email",
    "RelListID": 123,
    "RelSegmentID": null,
    "RelEmailID": 456,
    "AutoResponderTriggerType": "OnSubscription",
    "AutoResponderTriggerValue": "",
    "AutoResponderTriggerValue2": "",
    "TriggerTimeType": "Immediately",
    "TriggerTime": 0,
    "Status": "Enabled",
    "RepeatSettings": {
      "Status": "Disabled"
    },
    "TotalSent": 1250,
    "TotalOpens": 875,
    "TotalClicks": 320,
    "TotalRevenue": "1250.50",
    "UniqueOpens": 825,
    "UniqueClicks": 295
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": ["autoresponderid"],
  "ErrorText": "Missing auto responder id"
}
```

```txt [Error Codes]
0: Success
autoresponderid: Missing required parameter autoresponderid
2: Auto responder not found or not owned by the authenticated user
```

:::

## List Autoresponders

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponders.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Retrieves autoresponders for a specific subscriber list, with optional pagination, search-by-name, trigger-type filter, and status filter. `TotalResponderCount` reflects the filtered total (before pagination), so callers can size their UI correctly. `RepeatSettings` is returned as a decoded object on every row, matching the singular `Get` endpoint.

**Request Body Parameters:**

| Parameter           | Type    | Required | Description                                                                                      |
|---------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command             | String  | Yes      | API command: `autoresponders.get`                                                                |
| SessionID           | String  | No       | Session ID obtained from login                                                                   |
| APIKey              | String  | No       | API key for authentication                                                                       |
| SubscriberListID    | Integer | Yes      | Subscriber list ID to retrieve autoresponders for                                                |
| RecordsPerRequest   | Integer | No       | Pagination limit. Default: `0` (unbounded — return all matching rows)                            |
| RecordsFrom         | Integer | No       | Pagination offset. Default: `0`                                                                  |
| SearchKeyword       | String  | No       | Case-insensitive substring match on `AutoResponderName`                                          |
| TriggerType         | String  | No       | Exact-match filter. Possible values: `OnSubscription`, `OnSubscriberLinkClick`, `OnSubscriberCampaignOpen`, `OnSubscriberCampaignConversion`, `OnSubscriberForwardToFriend`, `OnSubscriberDate` |
| TriggerValue        | String  | No       | Exact-match filter on `AutoResponderTriggerValue`. Only honored when `TriggerType` is also provided. |
| Status              | String  | No       | Exact-match enum filter. Possible values: `Enabled`, `Disabled`                                  |
| OrderField          | String  | No       | Field to sort by. Possible values: `AutoResponderName`, `AutoResponderID`, `TotalSent`, `TotalOpens`, `TotalClicks`, `TotalDelivered`, `TotalFailed`, `UniqueOpens`, `UniqueClicks`, `TotalConversions`, `UniqueConversions`, `TotalForwards`, `UniqueForwards`, `TotalViewsOnBrowser`, `UniqueViewsOnBrowser`, `TotalUnsubscriptions`, `TotalHardBounces`, `TotalSoftBounces`, `TotalRevenue`, `Status`. Default: `AutoResponderName` |
| OrderType           | String  | No       | Sort direction: `ASC` or `DESC` (default: ASC)                                                   |

::: code-group

```bash [Example Request - Default]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123
  }'
```

```bash [Example Request - Paginated]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "RecordsPerRequest": 25,
    "RecordsFrom": 50,
    "OrderField": "TotalSent",
    "OrderType": "DESC"
  }'
```

```bash [Example Request - Search + Filter]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "SearchKeyword": "Welcome",
    "TriggerType": "OnSubscription",
    "Status": "Enabled"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalResponderCount": 5,
  "AutoResponders": [
    {
      "AutoResponderID": 789,
      "AutoResponderName": "Welcome Email",
      "RelListID": 123,
      "RelSegmentID": null,
      "RelEmailID": 456,
      "AutoResponderTriggerType": "OnSubscription",
      "TriggerTimeType": "Immediately",
      "TriggerTime": 0,
      "Status": "Enabled",
      "RepeatSettings": {
        "Status": "Disabled"
      },
      "TotalSent": 1250,
      "TotalOpens": 875,
      "TotalClicks": 320,
      "TotalRevenue": "1250.50",
      "UniqueOpens": 825,
      "UniqueClicks": 295
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": ["subscriberlistid"],
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
0: Success
subscriberlistid: Missing required parameter subscriberlistid
```

:::

## List Autoresponders Across Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponders.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns autoresponders across every list owned by the authenticated user in a single round-trip. Use this to back account-wide automation dashboards or cross-list reporting without doing N+1 fan-outs. Mirrors `autoresponders.get`'s filter and paging surface but `SubscriberListID` is optional — when omitted, the endpoint returns ARs from all of the user's lists. Each row carries `RelListID` for client-side grouping.

**Request Body Parameters:**

| Parameter         | Type    | Required | Description                                                                                      |
|-------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command           | String  | Yes      | API command: `autoresponders.acrosslists.get`                                                    |
| SessionID         | String  | No       | Session ID obtained from login                                                                   |
| APIKey            | String  | No       | API key for authentication                                                                       |
| SubscriberListID  | Integer | No       | Optional list scope. When omitted, returns ARs across all lists owned by the user.               |
| RecordsPerRequest | Integer | No       | Pagination limit (default: `0` — unbounded)                                                      |
| RecordsFrom       | Integer | No       | Pagination offset (default: `0`)                                                                 |
| SearchKeyword     | String  | No       | Case-insensitive substring match on `AutoResponderName`                                          |
| TriggerType       | String  | No       | Exact-match filter (same enum as `autoresponders.get`)                                           |
| TriggerValue      | String  | No       | Exact-match filter; only honored with `TriggerType`                                              |
| Status            | String  | No       | Possible values: `Enabled`, `Disabled`                                                           |
| OrderField        | String  | No       | Field to sort by (adds `RelListID` to the standard set)                                          |
| OrderType         | String  | No       | `ASC` or `DESC` (default: ASC)                                                                   |

::: code-group

```bash [Example Request - All ARs]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.acrosslists.get",
    "SessionID": "your-session-id"
  }'
```

```bash [Example Request - Filter By Trigger Type]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.acrosslists.get",
    "SessionID": "your-session-id",
    "TriggerType": "OnSubscription",
    "Status": "Enabled",
    "RecordsPerRequest": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalResponderCount": 12,
  "AutoResponders": [
    {
      "AutoResponderID": 789,
      "AutoResponderName": "Welcome",
      "RelListID": 123,
      "RelSegmentID": null,
      "RelEmailID": 456,
      "AutoResponderTriggerType": "OnSubscription",
      "TriggerTimeType": "Immediately",
      "TriggerTime": 0,
      "Status": "Enabled",
      "RepeatSettings": null,
      "TotalSent": 1250,
      "TotalRevenue": "1250.50"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [],
  "ErrorText": ""
}
```

```txt [Error Codes]
0: Success
```

:::

## Update Autoresponder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Updates an existing autoresponder. All fields except `AutoResponderID` are optional, allowing partial updates. The autoresponder must be owned by the authenticated user. `Status` and `SegmentID` are partial-update fields just like the others; pass `SegmentID: 0` to broaden scope back to whole-list.

**Request Body Parameters:**

| Parameter                  | Type    | Required | Description                                                                                      |
|----------------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command                    | String  | Yes      | API command: `autoresponder.update`                                                              |
| SessionID                  | String  | No       | Session ID obtained from login                                                                   |
| APIKey                     | String  | No       | API key for authentication                                                                       |
| AutoResponderID            | Integer | Yes      | Autoresponder ID to update                                                                       |
| SubscriberListID           | Integer | No       | Updated subscriber list ID                                                                       |
| AutoResponderName          | String  | No       | Updated autoresponder name                                                                       |
| AutoResponderTriggerType   | String  | No       | Updated trigger type (same enum as create)                                                       |
| AutoResponderTriggerValue  | String  | Conditional | Updated trigger value (required when updating to certain trigger types)                      |
| AutoResponderTriggerValue2 | String  | No       | Updated additional trigger value                                                                 |
| EmailID                    | Integer | No       | Updated email template ID                                                                        |
| TriggerTimeType            | String  | No       | Updated time delay type (same enum as create)                                                    |
| TriggerTime                | Integer | Conditional | Updated time delay value (required when TriggerTimeType is not `Immediately`)                |
| Repeat                     | String  | No       | Updated repeat pattern: `R{count}/P{interval}{H\|D\|W\|M}` or `null` to disable repeating        |
| Status                     | String  | No       | Possible values: `Enabled`, `Disabled`                                                           |
| SegmentID                  | Integer | No       | Updated segment scope. Pass `0` (or `null`) to clear scope back to whole-list.                   |

::: code-group

```bash [Example Request - Pause]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.update",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "Status": "Disabled"
  }'
```

```bash [Example Request - Update Timing]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.update",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "TriggerTimeType": "Days later",
    "TriggerTime": 1
  }'
```

```bash [Example Request - Clear Segment Scope]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.update",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "SegmentID": 0
  }'
```

```bash [Example Request - Disable Repeat]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.update",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "Repeat": null
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response - Not Found]
{
  "Success": false,
  "ErrorCode": [5],
  "ErrorText": ["Invalid auto responder id"]
}
```

```json [Error Response - Invalid Status]
{
  "Success": false,
  "ErrorCode": [10],
  "ErrorText": ["Invalid status value"]
}
```

```txt [Error Codes]
0: Success
autoresponderid: Missing required parameter autoresponderid
autorespondertriggervalue: Missing auto responder trigger value (required for certain trigger types)
triggertime: Missing auto responder trigger time (required when TriggerTimeType is not Immediately)
5: Invalid auto responder id (not found or access denied)
7: Invalid auto responder trigger type
8: Invalid trigger time type
9: Invalid email ID (email not found or does not belong to user)
10: Invalid status value (must be Enabled or Disabled)
11: Invalid segment id (segment does not belong to this list / user)
```

:::

## Duplicate Autoresponder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Duplicates a single autoresponder including its linked email template and attachments. Returns the new `AutoResponderID` and `RelEmailID` so callers don't need to refetch the listing to identify the clone. By default the duplicate lives on the same list as the source; pass `TargetListID` for cross-list duplication (the user must own both lists). The duplicate always starts in `Status: Disabled` so users can review it before it fires.

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                                                                      |
|------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String  | Yes      | API command: `autoresponder.duplicate`                                                           |
| SessionID        | String  | No       | Session ID obtained from login                                                                   |
| APIKey           | String  | No       | API key for authentication                                                                       |
| AutoResponderID  | Integer | Yes      | Source autoresponder ID to duplicate                                                             |
| NamePrefix       | String  | No       | Prefix to add to the duplicate's name (default: `"Copy of "`)                                    |
| TargetListID     | Integer | No       | Target list ID for cross-list duplication (default: source AR's list). User must own both lists. When the target differs from the source, segment scope is dropped because segments are list-bound. |

::: code-group

```bash [Example Request - Default]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.duplicate",
    "SessionID": "your-session-id",
    "AutoResponderID": 789
  }'
```

```bash [Example Request - Cross-List With Custom Prefix]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.duplicate",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "TargetListID": 456,
    "NamePrefix": "Cross-List - "
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AutoResponderID": 990,
  "RelEmailID": 991
}
```

```json [Error Response - Source Not Found]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": ["Invalid auto responder id"]
}
```

```json [Error Response - Target List Not Owned]
{
  "Success": false,
  "ErrorCode": [3],
  "ErrorText": ["Invalid target list id"]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter autoresponderid
2: Invalid auto responder id (source not found or access denied)
3: Invalid target list id (not owned by user)
4: Failed to clone auto responder email
5: Failed to create duplicated auto responder
```

:::

## Send Test Email

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Update`
- Rate limit: 10 requests per 300 seconds (per user)
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Renders an autoresponder's email and dispatches a real test copy to up to 5 recipient addresses synchronously (no queue insertion). The render path is the same as the production AR delivery, so footer rendering, sender domain enforcement, and personalization tokens behave identically. Personalization is computed against the `SubscriberID` provided, or against a random subscriber from the AR's list, or against a synthetic stand-in if the list is empty.

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                                                                      |
|------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String  | Yes      | API command: `autoresponder.sendtest`                                                            |
| SessionID        | String  | No       | Session ID obtained from login                                                                   |
| APIKey           | String  | No       | API key for authentication                                                                       |
| AutoResponderID  | Integer | Yes      | Autoresponder ID to render                                                                       |
| Recipients       | String  | Yes      | Comma-separated list of email addresses (max 5 per call)                                         |
| SubscriberID     | Integer | No       | Optional subscriber ID for personalization context. If omitted, a random subscriber from the AR's list is selected; if the list is empty, a synthetic subscriber is used. |

::: code-group

```bash [Example Request - Single Recipient]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.sendtest",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "Recipients": "you@example.com"
  }'
```

```bash [Example Request - Multiple Recipients With Personalization]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.sendtest",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "Recipients": "alice@example.com,bob@example.com",
    "SubscriberID": 4421
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "RecipientsAttempted": 2,
  "RecipientsAccepted": 2,
  "RecipientFailures": []
}
```

```json [Partial Failure Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "RecipientsAttempted": 3,
  "RecipientsAccepted": 2,
  "RecipientFailures": [
    { "Recipient": "broken@bad-domain.example", "Error": "SMTP connect failed" }
  ]
}
```

```json [Error Response - Invalid Email]
{
  "Success": false,
  "ErrorCode": [8],
  "ErrorText": ["Invalid recipient email address: not-an-email"]
}
```

```json [Error Response - Too Many Recipients]
{
  "Success": false,
  "ErrorCode": [10],
  "ErrorText": ["Too many recipients (max 5 per call)"]
}
```

```json [Error Response - All Recipients Failed]
{
  "Success": false,
  "ErrorCode": [11],
  "ErrorText": ["All recipients failed delivery"],
  "RecipientsAttempted": 2,
  "RecipientsAccepted": 0,
  "RecipientFailures": [
    { "Recipient": "broken1@example.invalid", "Error": "SMTP connect failed" },
    { "Recipient": "broken2@example.invalid", "Error": "SMTP connect failed" }
  ]
}
```

```txt [Error Codes]
0: Success (Success=true; per-recipient failures, if any, are listed in RecipientFailures)
1: Missing required parameter autoresponderid
2: Missing required parameter recipients
3: Invalid auto responder id (not found or access denied)
4: Auto responder is not linked to an email
5: Auto responder email not found
6: Auto responder list not found
7: Invalid subscriber id (does not belong to this list)
8: Invalid recipient email address
9: No recipients provided
10: Too many recipients (max 5 per call)
11: All recipients failed delivery (returned only when zero recipients were accepted)
99: NOT AVAILABLE IN DEMO MODE
```

:::

## Get Activity Log

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Paginated activity log for one autoresponder, sourced from `oempro_transactional_email_queue`. Each entry captures one render-and-deliver attempt: the recipient subscriber, status, timestamp, and event flags (Opened, Clicked, Bounced).

**Request Body Parameters:**

| Parameter         | Type    | Required | Description                                                                                      |
|-------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command           | String  | Yes      | API command: `autoresponder.activity.get`                                                        |
| SessionID         | String  | No       | Session ID obtained from login                                                                   |
| APIKey            | String  | No       | API key for authentication                                                                       |
| AutoResponderID   | Integer | Yes      | Autoresponder ID                                                                                 |
| RecordsPerRequest | Integer | No       | Pagination limit (default: 50, max: 200)                                                         |
| RecordsFrom       | Integer | No       | Pagination offset (default: 0)                                                                   |
| Since             | String  | No       | Filter to entries with `TimeToSend >= Since` (Y-m-d or Y-m-d H:i:s format)                       |
| Status            | String  | No       | Filter by delivery status. Possible values: `Pending`, `Sending`, `Sent`, `Failed`, `Delivered`, `Bounced` |

::: code-group

```bash [Example Request - Default]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.activity.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789
  }'
```

```bash [Example Request - Failed Sends Last 7 Days]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.activity.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "Status": "Failed",
    "Since": "2026-04-26",
    "RecordsPerRequest": 100
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSendCount": 1820,
  "Activity": [
    {
      "LogID": 99211,
      "SubscriberID": 4421,
      "Email": "alice@example.com",
      "Status": "Sent",
      "SentAt": "2026-04-30 14:12:08",
      "FailureReason": null,
      "Bounced": false,
      "Opened": true,
      "Clicked": false
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": ["Invalid auto responder id"]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter autoresponderid
2: Invalid auto responder id (not found or access denied)
```

:::

## Get Window Stats

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Aggregated counters for one autoresponder over a rolling time window (default 30 days, max 365). Sourced from `oempro_transactional_email_queue` so the numbers match the bundled CodeIgniter activity report. Use this instead of the lifetime counters on `AutoResponder.Get` when you want a true windowed view (e.g., a "Sent (30d)" column).

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                                                                      |
|------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command          | String  | Yes      | API command: `autoresponder.stats.window.get`                                                    |
| SessionID        | String  | No       | Session ID obtained from login                                                                   |
| APIKey           | String  | No       | API key for authentication                                                                       |
| AutoResponderID  | Integer | Yes      | Autoresponder ID                                                                                 |
| WindowDays       | Integer | No       | Window size in days. Default: 30, max: 365                                                       |

::: code-group

```bash [Example Request - 30 Day Window]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.stats.window.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789
  }'
```

```bash [Example Request - 90 Day Window]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponder.stats.window.get",
    "SessionID": "your-session-id",
    "AutoResponderID": 789,
    "WindowDays": 90
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Window": {
    "Days": 30,
    "From": "2026-04-03",
    "To": "2026-05-03"
  },
  "Counters": {
    "TotalSent": 7240,
    "TotalDelivered": 7115,
    "TotalFailed": 125,
    "TotalOpens": 4012,
    "UniqueOpens": 2870,
    "TotalClicks": 1240,
    "UniqueClicks": 1004,
    "TotalUnsubscriptions": 32,
    "TotalHardBounces": 18,
    "TotalSoftBounces": 87
  },
  "LastSentAt": "2026-05-03 09:12:14",
  "NextScheduledAt": "2026-05-03 13:30:00"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": ["Invalid auto responder id"]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter autoresponderid
2: Invalid auto responder id (not found or access denied)
```

:::

## Copy Autoresponders

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponder.Create`
- Legacy endpoint access via `/api.php` is also supported
:::

Copies all autoresponders (or a specific one) from a source list to a target list. Creates clones of the email templates and autoresponder configurations. Optionally adds a prefix to copied autoresponder names.

For duplicating a single autoresponder (especially within the same list), prefer the dedicated `autoresponder.duplicate` endpoint which returns the new IDs.

**Request Body Parameters:**

| Parameter             | Type    | Required | Description                                                                                      |
|-----------------------|---------|----------|--------------------------------------------------------------------------------------------------|
| Command               | String  | Yes      | API command: `autoresponders.copy`                                                               |
| SessionID             | String  | No       | Session ID obtained from login                                                                   |
| APIKey                | String  | No       | API key for authentication                                                                       |
| SourceListID          | Integer | Yes      | Source subscriber list ID to copy autoresponders from                                            |
| TargetListID          | Integer | Yes      | Target subscriber list ID to copy autoresponders to                                              |
| TargetAutoResponderID | Integer | No       | Specific autoresponder ID to copy (if omitted, copies all autoresponders from source list)      |
| Prefix                | String  | No       | Prefix to add to copied autoresponder names (e.g., "Copy - ")                                   |

::: code-group

```bash [Example Request - Copy All]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.copy",
    "SessionID": "your-session-id",
    "SourceListID": 123,
    "TargetListID": 456,
    "Prefix": "Copy - "
  }'
```

```bash [Example Request - Copy Specific]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.copy",
    "SessionID": "your-session-id",
    "SourceListID": 123,
    "TargetListID": 456,
    "TargetAutoResponderID": 789
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response - Invalid List]
{
  "Success": false,
  "ErrorCode": [4],
  "ErrorText": ["Invalid source subscriber id"]
}
```

```txt [Error Codes]
0: Success
sourcelistid: Missing source subscriber list id
targetlistid: Missing target subscriber list id
4: Invalid source or target subscriber list id (not found or access denied)
```

:::

## Delete Autoresponders

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `AutoResponders.Delete`
- Legacy endpoint access via `/api.php` is also supported
:::

Permanently deletes one or more autoresponders. Accepts comma-separated autoresponder IDs. All autoresponders must be owned by the authenticated user.

**Request Body Parameters:**

| Parameter      | Type   | Required | Description                                                                                      |
|----------------|--------|----------|--------------------------------------------------------------------------------------------------|
| Command        | String | Yes      | API command: `autoresponders.delete`                                                             |
| SessionID      | String | No       | Session ID obtained from login                                                                   |
| APIKey         | String | No       | API key for authentication                                                                       |
| AutoResponders | String | Yes      | Comma-separated autoresponder IDs to delete (e.g., "789,790,791")                               |

::: code-group

```bash [Example Request - Delete Single]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.delete",
    "SessionID": "your-session-id",
    "AutoResponders": "789"
  }'
```

```bash [Example Request - Delete Multiple]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "autoresponders.delete",
    "SessionID": "your-session-id",
    "AutoResponders": "789,790,791"
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
  "ErrorCode": ["autoresponders"],
  "ErrorText": ["Auto responder ids are missing"]
}
```

```txt [Error Codes]
0: Success
autoresponders: Auto responder ids are missing
```

:::
