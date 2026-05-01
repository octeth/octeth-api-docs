---
layout: doc
---

# List API Documentation

List management endpoints for creating, updating, and managing email subscriber lists and their integration settings.

## Create a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- The endpoint is **additive and backwards-compatible**. Callers passing only `SubscriberListName` continue to receive the original response shape (no `ConfirmationEmailID` field present).
:::

**Request Body Parameters:**

| Parameter             | Type   | Required | Description                                    |
|-----------------------|--------|----------|------------------------------------------------|
| Command               | String | Yes      | API command: `list.create`                     |
| SessionID             | String | No       | Session ID obtained from login                 |
| APIKey                | String | No       | API key for authentication                     |
| SubscriberListName    | String | Yes      | Name of the subscriber list to create          |
| Description           | String | No       | Optional human-readable description for the list |
| OptInMode             | String | No       | `Single` (default) or `Double`. Auto-promoted to `Double` when `ConfirmationEmail` is supplied or when the user group has `ForceOptInList` enabled. |
| SenderName            | String | No       | List-level default sender name                 |
| SenderEmailAddress    | String | No       | List-level default sender email address        |
| SenderCompany         | String | No       | List-level default sender company              |
| SenderAddress         | String | No       | List-level default sender postal address       |
| ConfirmationEmail     | Object | No       | Optional confirmation-email block. When supplied, the handler atomically creates the email row, links it to the list via `RelOptInConfirmationEmailID`, and returns the new `ConfirmationEmailID` in the response. `OptInMode` is auto-promoted to `Double`. See sub-fields below. **Sending this key with an empty object/array opts you into the bundled flow and surfaces a missing-required-field error — it does NOT silently fall back to the legacy single-parameter behavior.** |

**`ConfirmationEmail` sub-fields:**

| Sub-field      | Type   | Required When Present                                              | Description |
|----------------|--------|--------------------------------------------------------------------|-------------|
| Subject        | String | Yes                                                                | Email subject line |
| FromName       | String | Yes                                                                | Sender name |
| FromEmail      | String | Yes                                                                | Sender email address |
| ContentType    | String | Yes                                                                | One of `HTML`, `Plain`, or `Both` |
| HTMLContent    | String | Yes when `ContentType` is `HTML` or `Both`                         | HTML body |
| PlainContent   | String | Yes when `ContentType` is `Plain` or `Both`                        | Plain-text body |
| ReplyToName    | String | No                                                                 | Reply-to display name |
| ReplyToEmail   | String | No                                                                 | Reply-to email address |
| PreHeaderText  | String | No                                                                 | Inbox preview text |
| EmailName      | String | No                                                                 | Internal email label. Defaults to `Confirmation email: {ListID}` |
| Mode           | String | No                                                                 | One of `Editor`, `Stripo`, `Unlayer`, `Empty`, `Template`, `Import`. Defaults to `Empty`. |
| RelTemplateID  | Integer | Required when `Mode` is `Template`                                | Existing email-template ID to base the confirmation email on. |

**Atomicity:** When the bundled path is used and any step fails (validation, email creation, link update), the handler rolls back: it deletes the new email row, deletes the new list row, and drops the dynamic `oempro_subscribers_<ListID>` table. The caller sees an error response with no orphaned rows.

::: code-group

```bash [Example: Single Opt-In (legacy)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.create",
    "SessionID": "your-session-id",
    "SubscriberListName": "My New List",
    "Description": "Customers who signed up via the spring 2026 promotion"
  }'
```

```bash [Example: Atomic Double Opt-In]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.create",
    "SessionID": "your-session-id",
    "SubscriberListName": "Newsletter — Double Opt-In",
    "Description": "Subscribers who must confirm via email before receiving campaigns",
    "OptInMode": "Double",
    "SenderName": "Acme Marketing",
    "SenderEmailAddress": "marketing@acme.example",
    "SenderCompany": "Acme Inc.",
    "SenderAddress": "123 Main St, Anytown",
    "ConfirmationEmail": {
      "Subject": "Please confirm your subscription",
      "FromName": "Acme Marketing",
      "FromEmail": "marketing@acme.example",
      "ContentType": "Both",
      "HTMLContent": "<p>Hi, click <a href=\"%Link:Confirm%\">here</a> to confirm.</p>",
      "PlainContent": "Hi, click %Link:Confirm% to confirm your subscription.",
      "PreHeaderText": "Confirm your newsletter signup",
      "Mode": "Editor"
    }
  }'
```

```json [Success Response (legacy single-parameter call)]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123
}
```

```json [Success Response (bundled create)]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 124,
  "ConfirmationEmailID": 567
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 3]
}
```

```txt [Error Codes]
0:  Success
1:  Missing subscriber list name
3:  User has exceeded maximum number of subscriber lists allowed by their user group
20: Invalid optinmode (must be Single or Double)
21: Missing required confirmationemail sub-field (subject, fromname, fromemail, or contenttype)
22: Invalid confirmationemail.contenttype (must be HTML, Plain, or Both)
23: confirmationemail.htmlcontent is required when contenttype is HTML or Both
24: confirmationemail.plaincontent is required when contenttype is Plain or Both
25: Invalid confirmationemail.mode (must be Editor, Stripo, Unlayer, Empty, Template, or Import)
26: confirmationemail.reltemplateid is required when confirmationemail.mode is Template
30: Confirmation email creation failed; list and email were rolled back
```

:::

## Get a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                   |
|------------|---------|----------|-----------------------------------------------|
| Command    | String  | Yes      | API command: `list.get`                       |
| SessionID  | String  | No       | Session ID obtained from login                |
| APIKey     | String  | No       | API key for authentication                    |
| ListID     | Integer | Yes      | ID of the list to retrieve                    |
| GetStats   | Boolean | No       | Whether to include statistics (default: false)|

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.get",
    "SessionID": "your-session-id",
    "ListID": 123,
    "GetStats": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListID": 123,
    "Name": "My List",
    "RelOwnerUserID": 1,
    "EventListTrackerID": "abc123",
    "EventUserTrackerID": "xyz789",
    "EventTrackerVariables": {},
    "EventTrackerJS": "...",
    "EventTrackerProperties": [],
    "LastEventTrackedAt": "2024-01-15 10:30:00"
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
1: Missing list ID
```

:::

## Update a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter                                       | Type    | Required | Description                                                  |
|-------------------------------------------------|---------|----------|--------------------------------------------------------------|
| Command                                         | String  | Yes      | API command: `list.update`                                   |
| SessionID                                       | String  | No       | Session ID obtained from login                               |
| APIKey                                          | String  | No       | API key for authentication                                   |
| SubscriberListID                                | Integer | Yes      | ID of the list to update                                     |
| Name                                            | String  | No       | New name for the list                                        |
| Description                                     | String  | No       | Description for the list. Pass an empty string to clear it.  |
| SenderName                                      | String  | No       | Default sender name for campaigns                            |
| SenderEmailAddress                              | String  | No       | Default sender email address                                 |
| SenderCompany                                   | String  | No       | Sender company name                                          |
| SenderAddress                                   | String  | No       | Sender physical address                                      |
| OptInMode                                       | String  | No       | Opt-in mode: "Single" or "Double"                            |
| OptInConfirmationEmailID                        | Integer | No       | Email ID for double opt-in confirmation                      |
| OptOutAddToSuppressionList                      | String  | No       | Add to list suppression list on unsubscribe: "Yes" or "No"   |
| OptOutAddToGlobalSuppressionList                | String  | No       | Add to global suppression list on unsubscribe: "Yes" or "No" |
| HideInSubscriberArea                            | String  | No       | Hide list in subscriber area: "true" or "false"              |
| SendServiceIntegrationFailedNotification        | String  | No       | Send integration failure notifications: "true" or "false"    |
| SendActivityNotification                        | String  | No       | Send activity notifications: "true" or "false"               |
| SubscriptionConfirmationPendingPageURL          | String  | No       | URL for confirmation pending page                            |
| SubscriptionConfirmedPageURL                    | String  | No       | URL for subscription confirmed page                          |
| SubscriptionErrorPageURL                        | String  | No       | URL for subscription error page                              |
| UnsubscriptionConfirmedPageURL                  | String  | No       | URL for unsubscription confirmed page                        |
| UnsubscriptionErrorPageURL                      | String  | No       | URL for unsubscription error page                            |
| ReqByEmailSearchToAddress                       | String  | No       | Email address for subscription by email requests             |
| ReqByEmailSubscriptionCommand                   | String  | No       | Command word for email subscription requests                 |
| ReqByEmailUnsubscriptionCommand                 | String  | No       | Command word for email unsubscription requests               |
| SyncStatus                                      | String  | No       | Data sync status: "Enabled" or "Disabled"                    |
| SyncPeriod                                      | String  | No       | Synchronization period                                       |
| SyncSendReportEmail                             | String  | No       | Send sync report emails: "Yes" or "No"                       |
| SyncMySQLHost                                   | String  | No       | MySQL host for data synchronization                          |
| SyncMySQLPort                                   | Integer | No       | MySQL port for data synchronization                          |
| SyncMySQLUsername                               | String  | No       | MySQL username for sync                                      |
| SyncMySQLPassword                               | String  | No       | MySQL password for sync                                      |
| SyncMySQLDBName                                 | String  | No       | MySQL database name for sync                                 |
| SyncMySQLQuery                                  | String  | No       | SQL query for data synchronization                           |
| SyncFieldMapping                                | String  | No       | Field mapping configuration for sync                         |
| OptOutScope                                     | String  | No       | Unsubscription scope: "This list" or "All lists"             |
| OptOutSubscribeTo                               | Integer | No       | List ID to subscribe to on unsubscription                    |
| OptOutUnsubscribeFrom                           | Integer | No       | List ID to unsubscribe from on unsubscription                |
| OptInSubscribeTo                                | Integer | No       | List ID to subscribe to on subscription                      |
| OptInUnsubscribeFrom                            | Integer | No       | List ID to unsubscribe from on subscription                  |
| Options                                         | Object  | No       | Additional list options (JSON object). Supported keys: `DoNotSendEmailCampaignIfRecipientIsEnrolledInJourneyOrAutoresponder` (Boolean), `PlainEmailHeader` (String), `PlainEmailFooter` (String), `HTMLEmailHeader` (String), `HTMLEmailFooter` (String). Email header/footer options override user-level settings for emails sent to this list. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.update",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "Name": "Updated List Name",
    "OptInMode": "Double",
    "SenderName": "My Company",
    "SenderEmailAddress": "sender@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "List": {
    "ListID": 123,
    "Name": "Updated List Name",
    "OptInMode": "Double",
    "SenderName": "My Company",
    "SenderEmailAddress": "sender@example.com"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3, 4]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
2: Invalid subscriber list ID
3: Invalid opt-in mode
4: Invalid opt-out scope
5: Invalid send notification setting
6: Invalid hide in subscriber area setting
8: Missing sync configuration parameters
9: Invalid email address format for ReqByEmailSearchToAddress
10: Invalid suppression list option
11: Nothing to update
```

:::

## Archive a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Marks a list as archived by setting its `ArchivedAt` timestamp. Archived lists are hidden from `lists.get` by default (use `Archived=true` or `Archived=all` to retrieve them). Idempotent: re-archiving a list keeps the original `ArchivedAt` timestamp untouched.

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                              |
|------------------|---------|----------|------------------------------------------|
| Command          | String  | Yes      | API command: `list.archive`              |
| SessionID        | String  | No       | Session ID obtained from login           |
| APIKey           | String  | No       | API key for authentication               |
| SubscriberListID | Integer | Yes      | ID of the list to archive                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.archive",
    "SessionID": "your-session-id",
    "SubscriberListID": 123
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
  "ErrorCode": [2],
  "ErrorText": ["Invalid subscriber list id"]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
2: Invalid subscriber list id (not found or not owned by the authenticated user)
```

:::

## Unarchive a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Clears the `ArchivedAt` timestamp on a list, restoring it to active state.

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                              |
|------------------|---------|----------|------------------------------------------|
| Command          | String  | Yes      | API command: `list.unarchive`            |
| SessionID        | String  | No       | Session ID obtained from login           |
| APIKey           | String  | No       | API key for authentication               |
| SubscriberListID | Integer | Yes      | ID of the list to unarchive              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.unarchive",
    "SessionID": "your-session-id",
    "SubscriberListID": 123
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
  "ErrorCode": [2],
  "ErrorText": ["Invalid subscriber list id"]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
2: Invalid subscriber list id (not found or not owned by the authenticated user)
```

:::

## Get All Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Lists.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns the authenticated user's subscriber lists with full per-row metadata. Supports pagination, free-text search across `Name` and `Description`, and filtering by archive state.

**Request Body Parameters:**

| Parameter          | Type    | Required | Description                                          |
|--------------------|---------|----------|------------------------------------------------------|
| Command            | String  | Yes      | API command: `lists.get`                             |
| SessionID          | String  | No       | Session ID obtained from login                       |
| APIKey             | String  | No       | API key for authentication                           |
| RecordsPerRequest  | Integer | No       | Number of records per page (default: 0 = all)        |
| RecordsFrom        | Integer | No       | Starting record offset (default: 0)                  |
| OrderField         | String  | No       | Field to order by (default: `ListID`). Possible values: `ListID`, `Name`, `CreatedOn`, `ArchivedAt`, `ActiveSubscriberCount`, `SegmentCount`, `LastActivityAt`. Any other value falls back to the default. |
| OrderType          | String  | No       | Sort direction: `ASC` or `DESC` (default: `ASC`). Any other value falls back to the default. |
| Search             | String  | No       | Case-insensitive substring match against `Name` and `Description`. Empty string disables the filter. |
| Archived           | String  | No       | Archive-state filter (default: `false`). Possible values: `false` (only active lists), `true` (only archived lists), `all` (no filter). |

**Response Shape**

Each row returned in `Lists` includes every column from `oempro_subscriber_lists` (`ListID`, `Name`, `Description`, `OptInMode`, `CreatedOn`, `ArchivedAt`, `ActiveSubscriberCount`, `SegmentCount`, `LastActivityAt`, sender fields, sync fields, opt-in/opt-out URLs, etc.) plus the following computed fields:

| Field | Type | Description |
|-------|------|-------------|
| `SubscriberCount` | Integer | Active subscribers (Subscribed, non-Hard-bounced). 5-minute Redis cache. Identical to `ActiveSubscriberCount` for sort consistency, kept for backwards compatibility. |
| `ActiveSubscriberCount` | Integer | Denormalized active subscriber count (column on the list row). Maintained via write-through on `Subscribers::GetActiveTotal` cache miss. Eventually consistent within the 5-minute Redis cache TTL. Sortable. |
| `SegmentCount` | Integer | Denormalized segment count. Maintained atomically by `Segments::Create` / `Segments::Delete`. Sortable. |
| `LastActivityAt` | String \| null | Most recent list activity timestamp (subscription, unsubscription, import, bounce, send). Maintained at the `Statistics::UpdateListActivityStatistics` chokepoint. Null until the first activity. Sortable. |
| `EncryptedSaltedListID` | String | `md5(MD5_SALT . ListID)` – useful for read-only public links. |
| `SyncLastDateTime` | String | Localized "Never" placeholder substituted when the underlying value is `0000-00-00 00:00:00`. |
| `EventListTrackerID` | String | Hashids-encoded list ID for the website event tracker. |
| `EventUserTrackerID` | String | Hashids-encoded user ID for the website event tracker. |
| `EventTrackerVariables` | Object | Configuration object for the website event tracker JS. |
| `EventTrackerJS` | String | Pre-rendered `<script>…</script>` block for the website event tracker. |
| `Options` | Object \| null | Decoded JSON of list-level options (e.g. `PlainEmailHeader`, `HTMLEmailFooter`, `DoNotSendEmailCampaignIfRecipientIsEnrolledInJourneyOrAutoresponder`). Returned as a decoded object, matching the `list.get` response. |

`TotalListCount` reflects the **filtered** total (i.e. it respects `Search` and `Archived`), so paginated callers can use it as the basis for page counts.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "lists.get",
    "SessionID": "your-session-id",
    "RecordsPerRequest": 20,
    "RecordsFrom": 0,
    "OrderField": "Name",
    "OrderType": "ASC",
    "Search": "newsletter",
    "Archived": "false"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalListCount": 5,
  "Lists": [
    {
      "ListID": 123,
      "Name": "Spring Newsletter",
      "Description": "Customers from the spring 2026 promotion",
      "ArchivedAt": null,
      "RelOwnerUserID": 1,
      "OptInMode": "Single",
      "CreatedOn": "2026-04-01 09:12:33",
      "SubscriberCount": 12345,
      "Options": {
        "DoNotSendEmailCampaignIfRecipientIsEnrolledInJourneyOrAutoresponder": false
      },
      "EncryptedSaltedListID": "abc123...",
      "EventListTrackerID": "xyz789",
      "EventUserTrackerID": "def456",
      "EventTrackerVariables": {},
      "EventTrackerJS": "..."
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

**Migration note:** prior to v5.9.1 the `Options` field was returned as a raw JSON-encoded string. It is now returned as a decoded object/array, matching `list.get`. Callers that parsed the string client-side must remove that step.

## Get Per-List Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Lists.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns aggregate per-list statistics over a configurable lookback window. Designed for the "Lists browse" page stat strip and per-row metrics — one round-trip across `oempro_subscriber_lists` joined with the pre-aggregated `oempro_stats_list_daily_aggregated` (opens / clicks) and `oempro_stats_activity` (sent / subscriptions / unsubscriptions / imports / hard bounces) sources. Archived lists are excluded.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                 |
|-----------|---------|----------|-----------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `lists.stats`                                                  |
| SessionID | String  | No       | Session ID obtained from login                                              |
| APIKey    | String  | No       | API key for authentication                                                  |
| Days      | Integer | No       | Lookback window in days. Default `30`. Clamped to `[1, 365]`.               |
| ListIDs   | String  | No       | Optional comma-separated list of `ListID` values to scope the response to.  |

**Per-row response shape**

| Field                    | Type         | Description |
|--------------------------|--------------|-------------|
| `ListID`                 | Integer      | List identifier |
| `Name`                   | String       | List name |
| `ActiveSubscriberCount`  | Integer      | Denormalized active subscriber count (PR #1910 phase 2a) |
| `SegmentCount`           | Integer      | Denormalized segment count |
| `LastActivityAt`         | String\|null | Most recent recorded list activity timestamp |
| `UniqueOpens`            | Integer      | Sum of `UniqueOpens` over the window |
| `UniqueClicks`           | Integer      | Sum of `UniqueClicks` over the window |
| `TotalSent`              | Integer      | Sum of `TotalSentEmail` over the window |
| `NetGrowth`              | Integer      | `subscriptions + imports - unsubscriptions - hard_bounces` over the window |
| `OpenRate`               | Float\|null  | `UniqueOpens / TotalSent` (industry-standard convention). `null` when `TotalSent == 0`. |
| `ClickRate`              | Float\|null  | `UniqueClicks / TotalSent`. `null` when `TotalSent == 0`. |

**Top-level fields**

- `Days` — the actual window applied (echoed back after clamping).
- `TotalListCount` — number of lists included in the response.
- `WeightedAvgOpenRate` — subscriber-weighted average of `OpenRate` across the response set, weighted by `ActiveSubscriberCount * TotalSent`. `null` when no list in the response had any sends in the window.
- `Lists` — array of per-list stat rows.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "lists.stats",
    "SessionID": "your-session-id",
    "Days": 30
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Days": 30,
  "TotalListCount": 2,
  "WeightedAvgOpenRate": 0.21,
  "Lists": [
    {
      "ListID": 11,
      "Name": "Buyers List",
      "ActiveSubscriberCount": 1250,
      "SegmentCount": 5,
      "LastActivityAt": "2026-04-29 14:33:01",
      "UniqueOpens": 312,
      "UniqueClicks": 41,
      "TotalSent": 1250,
      "NetGrowth": 18,
      "OpenRate": 0.2496,
      "ClickRate": 0.0328
    },
    {
      "ListID": 313,
      "Name": "MOCK DATA",
      "ActiveSubscriberCount": 1000,
      "SegmentCount": 0,
      "LastActivityAt": "2026-04-30 20:00:43",
      "UniqueOpens": 0,
      "UniqueClicks": 0,
      "TotalSent": 0,
      "NetGrowth": -1,
      "OpenRate": null,
      "ClickRate": null
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

## Delete Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| Command   | String | Yes      | API command: `lists.delete`                     |
| SessionID | String | No       | Session ID obtained from login                  |
| APIKey    | String | No       | API key for authentication                      |
| Lists     | String | Yes      | Comma-separated list of list IDs to delete      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "lists.delete",
    "SessionID": "your-session-id",
    "Lists": "123,456,789"
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: List IDs are missing
```

:::

## Get List Assets

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Retrieves comprehensive list information including all related assets: segments, custom fields, subscriber tags, and autoresponders.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                             |
|-----------|---------|----------|-----------------------------------------|
| Command   | String  | Yes      | API command: `list.assets`              |
| SessionID | String  | No       | Session ID obtained from login          |
| APIKey    | String  | No       | API key for authentication              |
| ListID    | Integer | Yes      | ID of the list to retrieve assets for   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.assets",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListID": 123,
    "Name": "My List"
  },
  "Segments": {
    "Success": true,
    "Segments": []
  },
  "CustomFields": {
    "Success": true,
    "CustomFields": []
  },
  "SubscriberTags": {
    "Success": true,
    "Tags": []
  },
  "AutoResponders": {
    "Success": true,
    "AutoResponders": []
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
1: Missing list ID
```

:::

## Add Integration URL

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                          |
|------------------|---------|----------|------------------------------------------------------|
| Command          | String  | Yes      | API command: `listintegration.addurl`                |
| SessionID        | String  | No       | Session ID obtained from login                       |
| APIKey           | String  | No       | API key for authentication                           |
| SubscriberListID | Integer | Yes      | ID of the list for integration                       |
| URL              | String  | Yes      | Integration webhook URL                              |
| Event            | String  | Yes      | Event type to trigger webhook                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.addurl",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "URL": "https://example.com/webhook",
    "Event": "Subscribe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "WebServiceIntegrationID": 456,
  "EventType": "Subscribe",
  "ServiceURL": "https://example.com/webhook"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3, 4]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
2: Missing URL
3: Missing event type
4: Invalid subscriber list ID
```

:::

## Delete Integration URLs

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                              |
|-----------|--------|----------|----------------------------------------------------------|
| Command   | String | Yes      | API command: `listintegration.deleteurls`                |
| SessionID | String | No       | Session ID obtained from login                           |
| APIKey    | String | No       | API key for authentication                               |
| URLs      | String | Yes      | Comma-separated list of web service integration IDs      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.deleteurls",
    "SessionID": "your-session-id",
    "URLs": "456,789,012"
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Web service integration URL IDs are missing
```

:::

## Get Integration URLs

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type    | Required | Description                                |
|------------------|---------|----------|--------------------------------------------|
| Command          | String  | Yes      | API command: `listintegration.geturls`     |
| SessionID        | String  | No       | Session ID obtained from login             |
| APIKey           | String  | No       | API key for authentication                 |
| SubscriberListID | Integer | Yes      | ID of the list to get integration URLs for |
| Event            | String  | No       | Filter by specific event type              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.geturls",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "Event": "Subscribe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "URLs": [
    {
      "WebServiceIntegrationID": 456,
      "RelListID": 123,
      "EventType": "Subscribe",
      "ServiceURL": "https://example.com/webhook"
    }
  ]
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
1: Missing subscriber list ID
```

:::

## Test Integration URL

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Please migrate to the webhook-based integration system available through the Email Gateway API endpoints.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                              |
|-----------|--------|----------|------------------------------------------|
| Command   | String | Yes      | API command: `listintegration.testurl`   |
| SessionID | String | No       | Session ID obtained from login           |
| APIKey    | String | No       | API key for authentication               |
| URL       | String | Yes      | Integration webhook URL to test          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.testurl",
    "SessionID": "your-session-id",
    "URL": "https://example.com/webhook"
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: URL is missing
```

:::

## Generate Subscription Form HTML

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Modern integration methods should use direct API calls via the subscriber.create endpoint or use embedded JavaScript-based subscription forms.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter               | Type    | Required | Description                                              |
|-------------------------|---------|----------|----------------------------------------------------------|
| Command                 | String  | Yes      | API command: `listintegration.generatesubscriptionformhtmlcode` |
| SessionID               | String  | No       | Session ID obtained from login                           |
| APIKey                  | String  | No       | API key for authentication                               |
| SubscriberListID        | Integer | Yes      | ID of the list for the subscription form                 |
| CustomFields            | String  | No       | Comma-separated custom field IDs to include in form      |
| EmailAddressString      | String  | No       | Label text for email address field                       |
| SubscribeButtonString   | String  | No       | Text for subscribe button                                |
| HTMLSpecialChars        | String  | No       | Apply htmlspecialchars encoding (default: "true")        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.generatesubscriptionformhtmlcode",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "CustomFields": "1,2,3",
    "EmailAddressString": "Your Email",
    "SubscribeButtonString": "Join Now"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "HTMLCode": [
    "&lt;form action=&quot;https://example.com/subscribe.php&quot; method=&quot;post&quot;&gt;",
    "&lt;input type=&quot;text&quot; name=&quot;FormValue_Fields[EmailAddress]&quot;&gt;",
    "..."
  ]
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
1: Missing subscriber list ID
```

:::

## Generate Unsubscription Form HTML

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. Modern integration methods should use direct API calls via the subscriber.unsubscribe endpoint or use embedded JavaScript-based unsubscription forms.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter                 | Type    | Required | Description                                                 |
|---------------------------|---------|----------|-------------------------------------------------------------|
| Command                   | String  | Yes      | API command: `listintegration.generateunsubscriptionformhtmlcode` |
| SessionID                 | String  | No       | Session ID obtained from login                              |
| APIKey                    | String  | No       | API key for authentication                                  |
| SubscriberListID          | Integer | Yes      | ID of the list for the unsubscription form                  |
| UnsubscribeButtonString   | String  | No       | Text for unsubscribe button                                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "listintegration.generateunsubscriptionformhtmlcode",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "UnsubscribeButtonString": "Opt Out"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "HTMLCode": [
    "&lt;form action=&quot;https://example.com/unsubscribe.php&quot; method=&quot;post&quot;&gt;",
    "&lt;input type=&quot;text&quot; name=&quot;FormValue_EmailAddress&quot;&gt;",
    "..."
  ]
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
1: Missing subscriber list ID
```

:::
