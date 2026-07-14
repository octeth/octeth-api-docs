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

**Response notes:**

- `List.Options` is returned as a decoded JSON object (not a JSON string).
- When `Options.ClickBankINS` is present (#1897), the at-rest-encrypted secret is redacted on the way out: the encrypted blob is removed and replaced with `SecretKeyMasked` — `"********"` when a secret is set, `""` when not set. Update via `list.update` with `SecretKey: "__unchanged__"` to preserve the existing value.

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
| Options                                         | Object  | No       | Additional list options (JSON object). Supported keys: `DoNotSendEmailCampaignIfRecipientIsEnrolledInJourneyOrAutoresponder` (Boolean), `PlainEmailHeader` (String), `PlainEmailFooter` (String), `HTMLEmailHeader` (String), `HTMLEmailFooter` (String), `ClickBankINS` (Object — see below). Inner keys are matched case-insensitively, but values are always persisted under the canonical CamelCase keys shown here. Partial updates merge with the row's existing Options — keys you don't include in the payload are preserved. Email header/footer options override user-level settings for emails sent to this list. |
| Options.ClickBankINS                            | Object  | No       | ClickBank INS (Instant Notification Service) integration config for this list (#1897). Supported sub-keys: `Enabled` (Boolean), `SecretKey` (String — exactly 8 chars, or sentinel `__unchanged__` to preserve the existing encrypted secret, or empty string to clear), `TriggerAutomation` (Boolean — fires autoresponders/journeys/web-service hooks on ClickBank-sourced subscribers), `TransactionTypeActions` (Object — map of ClickBank txn type to action; allowed types: `SALE`, `BILL`, `RFND`, `CGBK`, `INSF`, `CANCEL-REBILL`, `UNCANCEL-REBILL`, `TEST`; allowed actions: `subscribe`, `unsubscribe`, `ignore`), `FieldMapping` (Object — map of ClickBank source field to target; each entry is `{ "type": "builtin", "target": "EmailAddress" }` for the email built-in or `{ "type": "customfield", "target": <CustomFieldID> }` for a per-list custom field; allowed source keys: `email`, `firstName`, `lastName`, `receipt`, `productTitle`, `itemNo`, `accountAmount`, `currency`, `phone`, `country`, `city`, `state`, `zip`, `address`, `affiliate`, `transactionType`, `lastTransactionAt`). The secret is encrypted at rest via the Crypto class and never returned by `list.get` (use `__unchanged__` on update to keep the existing value). |

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
20: ClickBank secret key encryption failed
21: ClickBank secret key must be exactly 8 characters
22: ClickBank transaction-type action must be one of: subscribe, unsubscribe, ignore
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

## Clone a List

<Badge type="info" text="POST" /> `/api/v1/list.clone`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Create`
- Legacy endpoint access via `/api.php` is also supported
:::

Duplicates an existing subscriber list, including its full custom-field schema. The new list is seeded from every settings column on the source row except identity, denormalized counters, and the confirmation-email link.

**What is cloned**

- All list configuration columns (sender info, sync settings, opt-out behavior, redirection URLs, etc.).
- All custom fields on the source list, with the complete column set (including `Option1`–`Option5`, `MergeTagAlias`, and `Meta`). Set `IncludeCustomFields=false` to skip custom-field replication.

**What is not cloned**

- `ListID`, `CreatedOn`, `LastActivityAt`, `ArchivedAt` (auto-managed).
- `ActiveSubscriberCount`, `SegmentCount` (denormalized counters; the new list starts empty).
- `RelOptInConfirmationEmailID` (left unset on the new list — call `list.update` afterwards if you need to attach a confirmation email).
- Subscribers (the new list's subscriber table is created empty).

`OptInMode` is carried over from the source list. If the user's group has `ForceOptInList=Enabled`, `OptInMode` is overridden to `Double`, matching `list.create`.

**Atomicity**

If any custom-field replication fails, the new list is deleted (along with its dynamic subscribers and tags tables) and `ErrorCode: [4]` is returned. When `IncludeCustomFields=false`, the call degenerates to a single list creation with no rollback path.

**Plug-in hook**

`Plugins::HookListener('Action', 'List.Create.Post', ...)` fires for the new list with the same payload shape as `list.create`.

**Request Body Parameters:**

| Parameter            | Type    | Required | Description                                                              |
|----------------------|---------|----------|--------------------------------------------------------------------------|
| Command              | String  | Yes      | API command: `list.clone`                                                |
| SessionID            | String  | No       | Session ID obtained from login                                           |
| APIKey               | String  | No       | API key for authentication                                               |
| SubscriberListID     | Integer | Yes      | ID of the source list to clone                                           |
| Name                 | String  | Yes      | Name for the new (cloned) list                                           |
| IncludeCustomFields  | Boolean | No       | Replicate the source list's custom fields. Default: `true`               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.clone",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "Name": "My cloned list",
    "IncludeCustomFields": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 456,
  "CustomFieldsCloned": 7
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
1: Missing source subscriber list id
2: Missing new list name (or invalid source list — not found or not owned by the authenticated user)
3: Subscriber list quota exceeded (LimitLists group setting)
4: Failed to clone the list (e.g. custom-field replication failed; the new list has been rolled back)
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

Returns aggregate per-list statistics over a configurable lookback window. Designed for the "Lists browse" page stat strip and per-row metrics — one round-trip across `oempro_subscriber_lists` joined with the pre-aggregated `oempro_stats_list_daily_aggregated` (opens / clicks / forwards / browser-views) and `oempro_stats_activity` (sent / subscriptions / unsubscriptions / imports / hard bounces) sources. Archived lists are excluded.

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
| `UniqueForwards`         | Integer      | Sum of `UniqueForwards` over the window (added in v5.9.1, issue #1960) |
| `UniqueBrowserViews`     | Integer      | Sum of `UniqueBrowserViews` over the window (added in v5.9.1, issue #1960) |
| `TotalSent`              | Integer      | Sum of `TotalSentEmail` over the window |
| `NetGrowth`              | Integer      | `subscriptions + imports - unsubscriptions - hard_bounces` over the window |
| `OpenRate`               | Float\|null  | `UniqueOpens / TotalSent` (industry-standard convention). `null` when `TotalSent == 0`. |
| `ClickRate`              | Float\|null  | `UniqueClicks / TotalSent`. `null` when `TotalSent == 0`. |
| `ForwardRate`            | Float\|null  | `UniqueForwards / TotalSent`. `null` when `TotalSent == 0`. |
| `BrowserViewRate`        | Float\|null  | `UniqueBrowserViews / TotalSent`. `null` when `TotalSent == 0`. |
| `CTOR`                   | Float\|null  | Click-To-Open Rate: `UniqueClicks / UniqueOpens`. `null` when `UniqueOpens == 0`. Measures engagement **among openers** — the denominator is opens, not sends. |

**Top-level fields**

- `Days` — the actual window applied (echoed back after clamping).
- `TotalListCount` — number of lists included in the response.
- `WeightedAvgOpenRate` — subscriber-weighted average of `OpenRate` across the response set, weighted by `ActiveSubscriberCount * TotalSent`. `null` when no list in the response had any sends in the window.
- `WeightedAvgClickRate` — subscriber-weighted average of `ClickRate`. Same weighting basis as open rate. `null` when no sends. (Added in v5.9.1, issue #1960.)
- `WeightedAvgCTOR` — subscriber-weighted average of `CTOR`. **Different denominator basis**: weighted by `ActiveSubscriberCount * UniqueOpens` (lists with zero opens are skipped, not zero-weighted). `null` when no opens. (Added in v5.9.1, issue #1960.)
- `WeightedAvgForwardRate` — subscriber-weighted average of `ForwardRate`. Same weighting basis as open rate. (Added in v5.9.1, issue #1960.)
- `WeightedAvgBrowserViewRate` — subscriber-weighted average of `BrowserViewRate`. Same weighting basis as open rate. (Added in v5.9.1, issue #1960.)
- `Lists` — array of per-list stat rows.

**Migration note (v5.9.1):** the per-row `ClickRate` started returning meaningful non-zero values in v5.9.1 alongside the new metrics. Prior to this release the underlying `UniqueClicks` daily aggregate was never populated, so `ClickRate` was always `0`. Consumers that special-cased the zero value should remove that workaround.

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
  "WeightedAvgClickRate": 0.027,
  "WeightedAvgCTOR": 0.146,
  "WeightedAvgForwardRate": 0.001,
  "WeightedAvgBrowserViewRate": 0.012,
  "Lists": [
    {
      "ListID": 11,
      "Name": "Buyers List",
      "ActiveSubscriberCount": 1250,
      "SegmentCount": 5,
      "LastActivityAt": "2026-04-29 14:33:01",
      "UniqueOpens": 312,
      "UniqueClicks": 41,
      "UniqueForwards": 2,
      "UniqueBrowserViews": 14,
      "TotalSent": 1250,
      "NetGrowth": 18,
      "OpenRate": 0.2496,
      "ClickRate": 0.0328,
      "ForwardRate": 0.0016,
      "BrowserViewRate": 0.0112,
      "CTOR": 0.1314
    },
    {
      "ListID": 313,
      "Name": "MOCK DATA",
      "ActiveSubscriberCount": 1000,
      "SegmentCount": 0,
      "LastActivityAt": "2026-04-30 20:00:43",
      "UniqueOpens": 0,
      "UniqueClicks": 0,
      "UniqueForwards": 0,
      "UniqueBrowserViews": 0,
      "TotalSent": 0,
      "NetGrowth": -1,
      "OpenRate": null,
      "ClickRate": null,
      "ForwardRate": null,
      "BrowserViewRate": null,
      "CTOR": null
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

## Get List Activity Series

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns a daily series of subscription / unsubscription activity for a single list over a configurable lookback window. Designed for the Reports tab → Overview growth chart and the per-list "net growth" KPI. Reads pre-aggregated rows from `oempro_stats_activity` (one row per list / owner / day) and gap-fills missing dates with zeros so the consumer always receives exactly `Days` ordered entries ending today.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                  |
|-----------|---------|----------|------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `list.getactivityseries`                                        |
| SessionID | String  | No       | Session ID obtained from login                                               |
| APIKey    | String  | No       | API key for authentication                                                   |
| ListID    | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.           |
| Days      | Integer | No       | Lookback window in days. Default `30`. Clamped to `[1, 365]`. Values `<= 0` fall back to the default. |

**Per-day entry shape (one entry per element in `Series`)**

| Field             | Type    | Description |
|-------------------|---------|-------------|
| `Date`            | String  | Calendar date in `YYYY-MM-DD` format (UTC). |
| `Subscriptions`   | Integer | New subscriptions added on that day (`oempro_stats_activity.TotalSubscriptions`). |
| `Unsubscriptions` | Integer | Unsubscriptions on that day (`TotalUnsubscriptions`). |
| `Imports`         | Integer | Subscribers added via import (`TotalImport`). |
| `SoftBounces`     | Integer | Soft bounces (`TotalSoftBounce`). Returned for completeness but **not** included in `NetGrowth`. |
| `HardBounces`     | Integer | Hard bounces (`TotalHardBounce`). |
| `NetGrowth`       | Integer | `Subscriptions + Imports - Unsubscriptions - HardBounces` for the day. Same formula as `lists.stats`. |

**Top-level fields**

- `ListID` — the list the series describes (echoed back).
- `Days` — the actual window applied after clamping.
- `Series` — array of exactly `Days` daily entries, ascending by `Date`, ending on today.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getactivityseries",
    "SessionID": "your-session-id",
    "ListID": 123,
    "Days": 30
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "Days": 30,
  "Series": [
    {
      "Date": "2026-04-10",
      "Subscriptions": 42,
      "Unsubscriptions": 5,
      "Imports": 0,
      "SoftBounces": 1,
      "HardBounces": 2,
      "NetGrowth": 35
    },
    {
      "Date": "2026-04-11",
      "Subscriptions": 0,
      "Unsubscriptions": 0,
      "Imports": 0,
      "SoftBounces": 0,
      "HardBounces": 0,
      "NetGrowth": 0
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is missing, non-numeric, or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
```

:::

## Get Subscriber Status Breakdown

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns per-status subscriber counts for a single list in one round trip — designed for the Reports tab → Overview composition donut. Replaces the legacy six-call workaround of invoking `subscribers.get` repeatedly with different `subscribersegment` values.

Each subscriber in the per-list shard is placed in **exactly one** in-shard bucket via the precedence ladder below. Two additional buckets (`Complained`, `Suppressed`) are sourced from `oempro_suppression_list`. The endpoint is backed by a 5-minute Redis cache (`subscriber_status_breakdown_<ListID>`) — bucket counts may lag real-time changes by up to that window, matching the staleness budget of the existing per-list counters (`GetActiveTotal`, `GetOptInPendingTotal`).

**Bucketing rules (in-shard, disjoint partition):**

| Shard row state                         | Bucket          |
|-----------------------------------------|-----------------|
| `Subscribed` + `Not Bounced`            | `Active`        |
| `Subscribed` + `Soft`                   | `SoftBounced`   |
| `Subscribed` + `Hard`                   | `HardBounced`   |
| `Unsubscribed` + (any `BounceType`)     | `Unsubscribed`  |
| `Opt-In Pending` + (any `BounceType`)   | `OptInPending`  |
| `Opt-Out Pending` + (any `BounceType`)  | _excluded_ (deprecated status, intentionally not counted) |

**Suppression buckets (from `oempro_suppression_list`, scoped by `RelListID`):**

| Source                                  | Bucket          |
|-----------------------------------------|-----------------|
| `SuppressionSource = 'SPAM complaint'`  | `Complained`    |
| Any `SuppressionSource` for the list    | `Suppressed`    |

::: warning Complained is a subset of Suppressed
A `'SPAM complaint'` suppression row is counted **once in `Complained` and once in `Suppressed`** (and therefore twice in `Total`). This is intentional — `Suppressed` is the full size of the suppression list and `Complained` is the subset attributable to spam complaints, so a donut/stacked-bar visual can break out the share without losing the total. If you need a non-overlapping count, use `Suppressed - Complained` for "suppressed for reasons other than spam complaints."
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                  |
|-----------|---------|----------|------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `list.getsubscriberstatusbreakdown`                             |
| SessionID | String  | No       | Session ID obtained from login                                               |
| APIKey    | String  | No       | API key for authentication                                                   |
| ListID    | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.           |

**Response shape**

- `ListID` — the list the breakdown describes (echoed back).
- `Counts` — object with the seven buckets below, all integers.
- `Total` — arithmetic sum of all seven `Counts` values. This is **not** equal to `COUNT(*)` of the per-list shard: it pulls in `Complained` and `Suppressed` from `oempro_suppression_list`, excludes any deprecated `Opt-Out Pending` rows, and (because `Complained` is a subset of `Suppressed`) double-counts every spam-complaint suppression row.

**Counts fields**

| Field            | Type    | Description |
|------------------|---------|-------------|
| `Active`         | Integer | Subscribed and not bounced. |
| `OptInPending`   | Integer | Awaiting double opt-in confirmation. |
| `SoftBounced`    | Integer | Currently subscribed but with a soft bounce flag. |
| `HardBounced`    | Integer | Currently subscribed but with a hard bounce flag. |
| `Unsubscribed`   | Integer | All rows with `SubscriptionStatus = Unsubscribed`, regardless of bounce status. |
| `Complained`     | Integer | Suppression entries for this list with `SuppressionSource = 'SPAM complaint'`. Subset of `Suppressed`. |
| `Suppressed`     | Integer | All suppression entries for this list (any `SuppressionSource`, **including** `'SPAM complaint'` — the same rows are also counted in `Complained`). |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getsubscriberstatusbreakdown",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "Counts": {
    "Active": 12345,
    "OptInPending": 67,
    "SoftBounced": 23,
    "HardBounced": 89,
    "Unsubscribed": 412,
    "Complained": 8,
    "Suppressed": 154
  },
  "Total": 13098
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is missing, non-numeric, or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
```

:::

## Get Bounce Trend

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns a weekly trend of hard-bounce, soft-bounce, and spam-complaint percentages for a single list. Designed for the bounce-trend bar chart on the Reports tab → Overview. Reads bounce numerators and the sent denominator from `oempro_stats_activity` (already split per-list — multi-list campaigns do not bias attribution) and complaint counts from `oempro_fbl_reports`. Backed by a 5-minute Redis cache keyed by `(ListID, UserID, Weeks)`.

Week buckets are **ISO-8601 Monday-start**. The most recent entry covers Monday-of-this-week through today inclusive (current partial week is shown so the chart never lags); older entries cover full Mon–Sun weeks. The series is gap-filled to exactly `Weeks` entries.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                  |
|-----------|---------|----------|------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `list.getbouncetrend`                                           |
| SessionID | String  | No       | Session ID obtained from login                                               |
| APIKey    | String  | No       | API key for authentication                                                   |
| ListID    | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.           |
| Weeks     | Integer | No       | Lookback window in weeks. Default `6`. Clamped to `[1, 26]`. Values `<= 0` fall back to the default. |

**Per-week entry shape (one entry per element in `Series`)**

| Field            | Type         | Description |
|------------------|--------------|-------------|
| `WeekStart`      | String       | Monday of the week, in `YYYY-MM-DD` format (ISO-8601 weekday 1). |
| `TotalSent`      | Integer      | Sum of `oempro_stats_activity.TotalSentEmail` over the week (denominator for all three percentages). |
| `HardBounces`    | Integer      | Sum of `oempro_stats_activity.TotalHardBounce` over the week. |
| `SoftBounces`    | Integer      | Sum of `oempro_stats_activity.TotalSoftBounce` over the week. |
| `Complaints`     | Integer      | `COUNT(*)` of `oempro_fbl_reports` rows for the list in the week. |
| `HardBouncePct`  | Float\|null  | `HardBounces * 100 / TotalSent`, rounded to 2 decimals. **Percent number** (e.g. `0.42` = 0.42 %). `null` when `TotalSent == 0`. |
| `SoftBouncePct`  | Float\|null  | `SoftBounces * 100 / TotalSent`, rounded to 2 decimals. `null` when `TotalSent == 0`. |
| `ComplaintPct`   | Float\|null  | `Complaints * 100 / TotalSent`, rounded to 2 decimals. `null` when `TotalSent == 0`. |

::: warning Pct vs Rate convention
The `*Pct` fields here are **percent numbers** (`0.42` means 0.42 %), distinct from the `*Rate` fields on `lists.stats` which are **fractions in [0, 1]** (`0.0042` would mean 0.42 %). Both follow their respective field-name conventions.
:::

**Top-level fields**

- `ListID` — the list the trend describes (echoed back).
- `Weeks` — the actual window applied after clamping.
- `Series` — array of exactly `Weeks` weekly entries, ascending by `WeekStart`, ending on the Monday of the current week.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getbouncetrend",
    "SessionID": "your-session-id",
    "ListID": 123,
    "Weeks": 6
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "Weeks": 6,
  "Series": [
    {
      "WeekStart": "2026-04-06",
      "TotalSent": 12500,
      "HardBounces": 53,
      "SoftBounces": 22,
      "Complaints": 4,
      "HardBouncePct": 0.42,
      "SoftBouncePct": 0.18,
      "ComplaintPct": 0.03
    },
    {
      "WeekStart": "2026-04-13",
      "TotalSent": 0,
      "HardBounces": 0,
      "SoftBounces": 0,
      "Complaints": 0,
      "HardBouncePct": null,
      "SoftBouncePct": null,
      "ComplaintPct": null
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is missing, non-numeric, or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
```

:::

## Get Engagement Tiers

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns RFM-style engagement tier counts for a single list — six mutually-exclusive buckets (Champions, Engaged, Passive, Lapsed, Dormant, NeverEngaged) over the list's *deliverable* subscribers (`SubscriptionStatus='Subscribed' AND BounceType='Not Bounced'`). Designed for the Reports tab → Engagement panel. Reads recency signal from `oempro_subscriber_lastactivities` (per-subscriber `LastEmailOpenedAt` / `LastLinkClickedAt`, maintained in real time by the open/click ingestion path) joined to the per-list shard. Backed by a 5-minute Redis cache keyed by `(ListID, all five overrides)` so custom-cutoff calls do not collide with default-cutoff cache.

The default tier cutoffs match the issue spec:

| Tier         | Default rule                                                         |
|--------------|----------------------------------------------------------------------|
| Champions    | Opened **and** clicked in the last 14 days                           |
| Engaged      | Opened in the last 30 days, but not a Champion                       |
| Passive      | Last open between 30 and 60 days ago                                 |
| Lapsed       | Last open between 60 and 120 days ago                                |
| Dormant      | Last open more than 120 days ago                                     |
| NeverEngaged | Never opened, joined more than 30 days ago                           |

Each cutoff can be overridden per request. Out-of-range values fall back to their per-key default; an ordering violation (e.g. `ChampionDays > EngagedDays`) restores the entire override set to defaults rather than producing tier predicates that overlap or invert. The actual values applied — after clamping and the monotonicity guard — are echoed back in the `Overrides` field so the caller can detect when a request was clamped.

::: warning Excluded subscribers
Recent never-openers (joined less than `NeverEngagedJoinedDays` days ago, never opened) are intentionally excluded from every tier — they have not yet had time to register engagement signal. The `Total` field reflects only counted rows, so callers can reconcile against `lists.stats.ActiveSubscriberCount` to derive the excluded count. Hard-bounced, soft-bounced, unsubscribed, and Opt-In Pending subscribers are also excluded regardless of recent activity.
:::

**Request Body Parameters:**

| Parameter                | Type    | Required | Description                                                                                                                                          |
|--------------------------|---------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| Command                  | String  | Yes      | API command: `list.getengagementtiers`                                                                                                               |
| SessionID                | String  | No       | Session ID obtained from login                                                                                                                       |
| APIKey                   | String  | No       | API key for authentication                                                                                                                           |
| ListID                   | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.                                                                                   |
| ChampionDays             | Integer | No       | Champion lookback in days. Default `14`. Clamped to `[1, 365]`. Out-of-range or non-numeric values fall back to the default.                         |
| EngagedDays              | Integer | No       | Engaged lookback in days. Default `30`. Clamped to `[1, 365]`. Must be `>= ChampionDays` after clamping or all overrides revert to defaults.         |
| PassiveEndDays           | Integer | No       | Upper bound (in days ago) for the Passive bucket. Default `60`. Clamped to `[1, 730]`. Must be `>= EngagedDays` after clamping or overrides revert.  |
| LapsedEndDays            | Integer | No       | Upper bound (in days ago) for the Lapsed bucket. Default `120`. Clamped to `[1, 1825]`. Must be `>= PassiveEndDays` after clamping or overrides revert. |
| NeverEngagedJoinedDays   | Integer | No       | Minimum age (in days) of subscription before a never-opener can be classified as NeverEngaged. Default `30`. Clamped to `[1, 365]`.                  |

**Top-level response fields:**

| Field       | Type    | Description                                                                                                                                                          |
|-------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ListID`    | Integer | The list the tiers describe (echoed back).                                                                                                                           |
| `AsOf`      | String  | ISO-8601 timestamp (UTC) of when the underlying counts were computed. Frozen for the lifetime of the cache entry, so two calls within the cache TTL share an `AsOf`. |
| `Overrides` | Object  | The cutoffs actually used after clamping and the monotonicity guard. Compare against the request to detect clamped values.                                           |
| `Tiers`     | Object  | Tier counts as a strict partition (each subscriber lands in exactly one bucket).                                                                                     |
| `Total`     | Integer | Sum of the six tier counts. Excludes recent never-openers and ineligible (bounced/unsubscribed/opt-in-pending) subscribers.                                          |

**`Tiers` object shape:**

| Field          | Type    | Description                                                                                  |
|----------------|---------|----------------------------------------------------------------------------------------------|
| `Champions`    | Integer | Opened **and** clicked within the last `ChampionDays` days.                                  |
| `Engaged`      | Integer | Opened within the last `EngagedDays` days, but not a Champion.                               |
| `Passive`      | Integer | Last open between `EngagedDays` and `PassiveEndDays` days ago.                               |
| `Lapsed`       | Integer | Last open between `PassiveEndDays` and `LapsedEndDays` days ago.                             |
| `Dormant`      | Integer | Has at least one open on record, but the last one was more than `LapsedEndDays` days ago.    |
| `NeverEngaged` | Integer | Never opened, and joined more than `NeverEngagedJoinedDays` days ago.                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getengagementtiers",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```bash [Example Request With Overrides]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getengagementtiers",
    "SessionID": "your-session-id",
    "ListID": 123,
    "ChampionDays": 7,
    "EngagedDays": 21,
    "PassiveEndDays": 45,
    "LapsedEndDays": 90,
    "NeverEngagedJoinedDays": 14
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "AsOf": "2026-05-09T14:32:01+00:00",
  "Overrides": {
    "ChampionDays": 14,
    "EngagedDays": 30,
    "PassiveEndDays": 60,
    "LapsedEndDays": 120,
    "NeverEngagedJoinedDays": 30
  },
  "Tiers": {
    "Champions": 1234,
    "Engaged": 4567,
    "Passive": 890,
    "Lapsed": 234,
    "Dormant": 56,
    "NeverEngaged": 78
  },
  "Total": 7059
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is missing, non-numeric, or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
```

:::

## Get Send Time Heatmap

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns a 7×24 grid of event counts (opens or clicks) for a single list, grouped by Monday-first day-of-week and hour-of-day, over the last `Days` days. Designed for the Reports tab → Engagement send-time heatmap. Reads from `oempro_stats_open` (when `Event="open"`) or `oempro_stats_link` (when `Event="click"`), both of which expose a generated stored DOW column (`OpenDatew` / `ClickDatew`) and a covering index (`idx_list_owner_datew_covering`) so the WHERE filter and GROUP BY are answered from the index leaves alone — `HOUR(OpenDate)` / `HOUR(ClickDate)` is computed on the fly without extra row lookups. Backed by a 5-minute Redis cache keyed by `(ListID, UserID, Days, Event)`.

::: warning Day-of-week ordering
The `Grid` response uses **Monday-first** ordering: `Grid[0]` is Monday, `Grid[6]` is Sunday. This matches the ISO-8601 weekday convention used elsewhere in Octeth's per-list reporting (e.g. `List.GetBounceTrend` week buckets). Hours are 0..23 in the application timezone (UTC in the default Docker deployment); transform to the viewer's local timezone client-side.
:::

::: warning Event values
`Event` is **strictly validated**. An unrecognized value (e.g. `"opens"`, `"clicked"`) returns a validation-error envelope rather than silently falling back to `"open"`, so a typo never returns the wrong dataset. Currently supported: `open`, `click`.
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                                                                                                                  |
|------------|---------|----------|----------------------------------------------------------------------------------------------------------------------------------------------|
| Command    | String  | Yes      | API command: `list.getsendtimeheatmap`                                                                                                       |
| SessionID  | String  | No       | Session ID obtained from login                                                                                                               |
| APIKey     | String  | No       | API key for authentication                                                                                                                   |
| ListID     | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.                                                                           |
| Days       | Integer | No       | Lookback window in days. Default `90`. Clamped to `[1, 365]`. Out-of-range or non-numeric values fall back to the default.                   |
| Event      | String  | No       | Event to bucket. Default `open`. Possible values: `open`, `click`. Unrecognized values return a validation-error envelope.                   |

**Top-level response fields:**

| Field    | Type    | Description                                                                                                                                                              |
|----------|---------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ListID` | Integer | The list the grid describes (echoed back).                                                                                                                               |
| `Days`   | Integer | The lookback window actually used (after clamping). Compare against the request to detect clamped values.                                                                |
| `Event`  | String  | The event actually used (after lowercase normalization).                                                                                                                 |
| `AsOf`   | String  | ISO-8601 timestamp (UTC) of when the underlying counts were computed. Frozen for the lifetime of the cache entry, so two calls within the cache TTL share an `AsOf`.     |
| `Grid`   | Array   | 7×24 array of integers. `Grid[d][h]` is the count of events on day `d` (Monday=0..Sunday=6) at hour `h` (0..23, UTC). Empty buckets are `0`, never missing from the response. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getsendtimeheatmap",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```bash [Example Request With Days and Event]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getsendtimeheatmap",
    "SessionID": "your-session-id",
    "ListID": 123,
    "Days": 30,
    "Event": "click"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "Days": 90,
  "Event": "open",
  "AsOf": "2026-05-09T14:32:01+00:00",
  "Grid": [
    [12, 8, 5, 3, 2, 1, 1, 4, 18, 42, 67, 81, 79, 65, 58, 49, 41, 33, 27, 22, 18, 14, 11, 9],
    [45, 32, 18, 9, 5, 4, 6, 12, 38, 71, 102, 118, 110, 95, 84, 73, 62, 50, 41, 34, 27, 22, 17, 12],
    [40, 28, 16, 8, 4, 3, 5, 11, 35, 68, 98, 113, 105, 90, 80, 70, 59, 47, 39, 32, 26, 21, 16, 11],
    [38, 26, 15, 7, 4, 3, 5, 11, 34, 65, 94, 109, 102, 87, 77, 67, 56, 45, 37, 31, 25, 20, 15, 10],
    [35, 24, 14, 7, 3, 3, 4, 10, 31, 60, 87, 100, 94, 80, 71, 62, 52, 42, 35, 28, 23, 18, 14, 10],
    [22, 15, 9, 5, 3, 2, 3, 6, 19, 38, 56, 65, 60, 51, 45, 39, 33, 27, 22, 18, 14, 11, 9, 7],
    [10, 7, 4, 3, 1, 1, 1, 3, 9, 20, 30, 36, 33, 28, 24, 20, 17, 14, 11, 9, 7, 6, 4, 3]
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
1: ListID is missing (returned in the ErrorCode array as [1] by the required-field validator)
2: Unsupported Event value (returned in the ErrorCode array as [2]; the offending field name is also surfaced in ErrorText). Allowed values: open, click
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is non-numeric or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
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
| SubscriberListID        | Integer | Yes      | ID of the list for the subscription form. Must be a positive integer and a list you own. |
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
2: Invalid subscriber list id (must be a positive integer)
3: Invalid subscriber list id (list not found or not owned by you)
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

## Get Tenure Distribution

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns a tenure-bucketed snapshot of subscriber counts for a single list — six mutually-exclusive buckets keyed off `SubscriptionDate` over the list's *deliverable* subscribers (`SubscriptionStatus='Subscribed' AND BounceType='Not Bounced'`). Designed for the Reports tab → Engagement (net new) panel. Reads from the per-list shard `oempro_subscribers_<ListID>`, whose `SubscriptionDate` column is backed by the composite index `idx_subscription_date_id (SubscriptionDate, SubscriberID)` (added 2025-10-25). Backed by a 5-minute Redis cache keyed by `ListID`.

The bucket boundaries are fixed:

| Bucket    | Range                                              |
|-----------|----------------------------------------------------|
| `0_30d`   | Subscribed within the last 30 days                 |
| `1_3mo`   | Subscribed between 30 and 90 days ago              |
| `3_6mo`   | Subscribed between 90 and 180 days ago             |
| `6_12mo`  | Subscribed between 180 and 365 days ago            |
| `1_2y`    | Subscribed between 365 and 730 days ago            |
| `2y_plus` | Subscribed more than 730 days ago                  |

::: warning Boundary semantics & excluded subscribers
Boundaries are **right-open** — a subscriber whose `SubscriptionDate` lands exactly on a cutoff (e.g. exactly 30 days ago to the second) falls into the *older* bucket. This matches the `>= newer / < older` convention `list.getengagementtiers` uses, so each subscriber lands in exactly one bucket and `Total` equals the sum of the six bucket counts. Hard-bounced, soft-bounced, unsubscribed, and Opt-In Pending subscribers are excluded from every bucket regardless of subscription date — `Total` reflects deliverable subscribers only and can be reconciled against `lists.stats.ActiveSubscriberCount`.
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                  |
|-----------|---------|----------|------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `list.gettenuredistribution`                                    |
| SessionID | String  | No       | Session ID obtained from login                                               |
| APIKey    | String  | No       | API key for authentication                                                   |
| ListID    | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.           |

**Top-level response fields:**

| Field     | Type    | Description                                                                                                                                                          |
|-----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ListID`  | Integer | The list the distribution describes (echoed back).                                                                                                                   |
| `AsOf`    | String  | ISO-8601 timestamp (UTC) of when the underlying counts were computed. Frozen for the lifetime of the cache entry, so two calls within the cache TTL share an `AsOf`. |
| `Buckets` | Object  | The six tenure buckets as a strict partition (each deliverable subscriber lands in exactly one bucket).                                                              |
| `Total`   | Integer | Sum of the six bucket counts. Excludes ineligible (bounced/unsubscribed/opt-in-pending) subscribers.                                                                 |

**`Buckets` object shape:**

| Field       | Type    | Description                                                                                  |
|-------------|---------|----------------------------------------------------------------------------------------------|
| `0_30d`     | Integer | Deliverable subscribers who joined within the last 30 days.                                  |
| `1_3mo`     | Integer | Deliverable subscribers who joined between 30 and 90 days ago.                               |
| `3_6mo`     | Integer | Deliverable subscribers who joined between 90 and 180 days ago.                              |
| `6_12mo`    | Integer | Deliverable subscribers who joined between 180 and 365 days ago.                             |
| `1_2y`      | Integer | Deliverable subscribers who joined between 365 and 730 days ago.                             |
| `2y_plus`   | Integer | Deliverable subscribers who joined more than 730 days ago.                                   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.gettenuredistribution",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "AsOf": "2026-05-09T14:32:01+00:00",
  "Buckets": {
    "0_30d": 234,
    "1_3mo": 567,
    "3_6mo": 890,
    "6_12mo": 1234,
    "1_2y": 2345,
    "2y_plus": 3456
  },
  "Total": 8726
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list ID
99997: Subscriber list does not exist or is not owned by the authenticated user
```

:::

## Get ESP Breakdown

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns the domain-level distribution of subscribers, openers, clickers, or opt-outs for a single list. One call per sub-tab in the Reports tab → ESP breakdown view, replacing four separate legacy `/app/user/list/espbreakdown/<id>` page-side calls into `Statistics::RetrieveDomainBreakdownForAList`. Results are scoped to the list's *deliverable* subscribers (`SubscriptionStatus='Subscribed' AND BounceType='Not Bounced'`) and counted as `COUNT(DISTINCT RelSubscriberID)` so a single contact who opens or clicks repeatedly contributes to its domain bucket exactly once. Backed by a 5-minute Redis cache keyed by `(ListID, UserID, Event, Top)`.

The data source switches per `Event`:

| Event             | Source                                                                                |
|-------------------|---------------------------------------------------------------------------------------|
| `subscribers`     | Per-list shard `oempro_subscribers_<ListID>` only — no stats join                     |
| `opens`           | `oempro_stats_open` JOIN `oempro_subscribers_<ListID>` on `SubscriberID`              |
| `clicks`          | `oempro_stats_link` JOIN `oempro_subscribers_<ListID>` on `SubscriberID`              |
| `unsubscriptions` | `oempro_stats_unsubscription` JOIN `oempro_subscribers_<ListID>` on `SubscriberID`    |

::: warning Top-N collapsing
Domains beyond rank `Top` are summed into a single `Other` bucket appended to the end of `Domains`. The `Other` bucket is omitted entirely when its count is zero (i.e. when the named-domain list already covers every contributor). `Top` is clamped to `[1, 1000]`; missing, non-numeric, or non-positive values silently fall back to the default `30`.
:::

::: warning Event values
`Event` is **required** and **strictly validated**. Unlike `list.getsendtimeheatmap`, missing or unrecognized values (e.g. `"open"` singular, `"opened"`) return a validation-error envelope rather than silently defaulting, so a caller never receives the wrong dataset on a typo. Allowed values: `subscribers`, `opens`, `clicks`, `unsubscriptions`.
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                                                                                                                            |
|-----------|---------|----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `list.getespbreakdown`                                                                                                                                                    |
| SessionID | String  | No       | Session ID obtained from login                                                                                                                                                         |
| APIKey    | String  | No       | API key for authentication                                                                                                                                                             |
| ListID    | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.                                                                                                                     |
| Event     | String  | Yes      | Which event to break down by domain. Possible values: `subscribers`, `opens`, `clicks`, `unsubscriptions`. Missing or unrecognized values return a validation-error envelope.          |
| Top       | Integer | No       | Number of top-ranking domains to keep before collapsing the tail into `Other`. Default `30`. Clamped to `[1, 1000]`. Out-of-range or non-numeric values fall back to the default.      |

**Top-level response fields:**

| Field     | Type    | Description                                                                                                                                                          |
|-----------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ListID`  | Integer | The list the breakdown describes (echoed back).                                                                                                                      |
| `Event`   | String  | The event actually used (after lowercase normalization).                                                                                                             |
| `Top`     | Integer | The top-N cutoff actually used (after clamping). Compare against the request to detect clamped values.                                                               |
| `AsOf`    | String  | ISO-8601 timestamp (UTC) of when the underlying counts were computed. Frozen for the lifetime of the cache entry, so two calls within the cache TTL share an `AsOf`. |
| `Total`   | Integer | Sum of all `Count` values across `Domains` (including `Other` if present).                                                                                           |
| `Domains` | Array   | Numerically-indexed list of `{Domain, Count, Pct}` objects, sorted by `Count` descending. The `Other` bucket (when present) is always the last element.              |

**`Domains[]` object shape:**

| Field    | Type            | Description                                                                                                            |
|----------|-----------------|------------------------------------------------------------------------------------------------------------------------|
| `Domain` | String          | Email domain (e.g. `gmail.com`), or the literal string `Other` for the collapsed tail bucket.                          |
| `Count`  | Integer         | `COUNT(DISTINCT RelSubscriberID)` for that domain after the eligibility filter.                                        |
| `Pct`    | Number\|null    | `round(Count * 100 / Total, 2)` as a percentage. `null` when `Total` is zero (matches the `OpenRate` / `ClickRate` convention used elsewhere). |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getespbreakdown",
    "SessionID": "your-session-id",
    "ListID": 123,
    "Event": "opens"
  }'
```

```bash [Example Request With Top]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getespbreakdown",
    "SessionID": "your-session-id",
    "ListID": 123,
    "Event": "subscribers",
    "Top": 10
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "Event": "opens",
  "Top": 30,
  "AsOf": "2026-05-09T14:32:01+00:00",
  "Total": 9700,
  "Domains": [
    { "Domain": "gmail.com",   "Count": 5000, "Pct": 51.55 },
    { "Domain": "outlook.com", "Count": 3200, "Pct": 32.99 },
    { "Domain": "yahoo.com",   "Count": 1500, "Pct": 15.46 }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": "Unsupported Event value. Allowed: subscribers, opens, clicks, unsubscriptions"
}
```

```txt [Error Codes]
0: Success
1: ListID is missing (returned in the ErrorCode array as [1] by the required-field validator)
2: Unsupported Event value (returned in the ErrorCode array as [2]; the offending field name is also surfaced in ErrorText). Allowed values: subscribers, opens, clicks, unsubscriptions
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is non-numeric or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
```

:::

## Get CTR Retention Matrix

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns a per-campaign clicker cohort matrix for a single list. For each of the list's most-recently sent campaigns, the response reports the number of distinct subscribers who clicked at least once (`BaseClickers`) and the percentage of those same subscribers who *also* clicked each subsequent campaign in the chronological pool (`Retention`). One call powers the Reports tab → CTR retention view, replacing the legacy `/app/user/list/ctrretention/<id>` page-side call into `Statistics::CTRRetentionByCohort`. Results are scoped to campaigns the authenticated user owns and counted as `COUNT(DISTINCT RelSubscriberID)` so a contact who clicks a single campaign multiple times still contributes to the cohort exactly once. Backed by a 5-minute Redis cache keyed by `(ListID, UserID, LastNCampaigns, CohortDepth)`.

::: warning Retention shape
`Retention[0]` is always `100.0` (the campaign vs. itself) when `BaseClickers > 0`, and `0.0` when `BaseClickers == 0`. Subsequent values are clicker-overlap percentages rounded to **one decimal place** — the share of `BaseClickers` who also clicked the campaign at that subsequent position. Each row's `Retention` array is **trimmed to `min(CohortDepth, n - rowIndex)`**, so newer rows have shorter arrays (the newest campaign's `Retention` is just `[100.0]` because no subsequent campaigns exist yet). Iterate by `count($row['Retention'])` rather than assuming a fixed length.
:::

::: warning Defense-in-depth
Every SQL clause that touches `oempro_stats_link` and `oempro_campaigns` is scoped by `RelOwnerUserID` so a click row owned by a different tenant pointing at the same `(ListID, CampaignID)` cannot leak into another user's matrix. The user-facing tenant guard is `Lists::RetrieveList`; this is the SQL-level fallback.
:::

**Request Body Parameters:**

| Parameter      | Type    | Required | Description                                                                                                                  |
|----------------|---------|----------|------------------------------------------------------------------------------------------------------------------------------|
| Command        | String  | Yes      | API command: `list.getctrretentionmatrix`                                                                                    |
| SessionID      | String  | No       | Session ID obtained from login                                                                                               |
| APIKey         | String  | No       | API key for authentication                                                                                                   |
| ListID         | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.                                                           |
| LastNCampaigns | Integer | No       | How many of the list's most-recently sent campaigns to include as rows. Default `10`, clamped to `[1, 50]`. Missing / non-numeric / non-positive collapses to the default. |
| CohortDepth    | Integer | No       | How many campaigns (including each row's own campaign at index `0`) the `Retention` array tracks at most. Default `7`, clamped to `[1, 50]`. Missing / non-numeric / non-positive collapses to the default. |

**Top-level response fields:**

| Field            | Type    | Description                                                                                                                                                          |
|------------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ListID`         | Integer | The list the matrix describes (echoed back).                                                                                                                         |
| `LastNCampaigns` | Integer | The clamped value the model actually used. Echo this rather than the raw input — `LastNCampaigns: 9999` will return `50`.                                            |
| `CohortDepth`    | Integer | The clamped value the model actually used.                                                                                                                           |
| `AsOf`           | String  | ISO-8601 timestamp (UTC) of when the underlying counts were computed. Frozen for the lifetime of the cache entry, so two calls within the cache TTL share an `AsOf`. |
| `Campaigns`      | Array   | Per-campaign rows in chronological ascending order (oldest first) by `SendProcessStartedOn`. Empty array when the list has no `Sent` campaigns.                      |

**`Campaigns[]` row shape:**

| Field          | Type    | Description                                                                                                                                                                              |
|----------------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `CampaignID`   | Integer | The row's campaign.                                                                                                                                                                      |
| `CampaignName` | String  | Campaign name as stored in `oempro_campaigns`.                                                                                                                                           |
| `SentAt`       | String  | `SendProcessStartedOn` value (`YYYY-MM-DD HH:MM:SS`, application timezone).                                                                                                              |
| `BaseClickers` | Integer | Distinct subscribers who clicked at least one link in this campaign. The denominator for every percentage in `Retention`.                                                                |
| `Retention`    | Array   | Floats, length `min(CohortDepth, n - rowIndex)`. `Retention[0]` is `100.0` when `BaseClickers > 0`, else `0.0`. `Retention[i]` for `i > 0` is `cohort_overlap_count / BaseClickers * 100`. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getctrretentionmatrix",
    "SessionID": "your-session-id",
    "ListID": 123,
    "LastNCampaigns": 10,
    "CohortDepth": 7
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "LastNCampaigns": 10,
  "CohortDepth": 7,
  "AsOf": "2026-05-09T14:32:01+00:00",
  "Campaigns": [
    {
      "CampaignID": 4567,
      "CampaignName": "April Newsletter",
      "SentAt": "2026-04-01 10:00:00",
      "BaseClickers": 2500,
      "Retention": [100.0, 72.0, 48.0, 31.0, 22.0, 15.0, 10.0]
    },
    {
      "CampaignID": 4571,
      "CampaignName": "April Promo",
      "SentAt": "2026-04-08 10:00:00",
      "BaseClickers": 1800,
      "Retention": [100.0, 65.0, 41.0, 28.0, 19.0, 12.0]
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
1: ListID is missing (returned in the ErrorCode array as [1] by the required-field validator)
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is non-numeric or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
```

:::

## Get Source Breakdown

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns the acquisition-source distribution for a single list — total counts grouped by `SubscriptionSource` plus a 12-month rolling time series keyed by month and source. Designed for the Reports tab → Sources panel introduced by issue #1965. Counts cover the entire row population (provenance is independent of deliverability — bounced and unsubscribed rows still came from somewhere). The series filters rows whose `SubscriptionDate` falls inside the last 12 months. Backed by a 5-minute Redis cache keyed by `ListID`.

Source values are the `SubscriptionSource` ENUM:

| Bucket      | Set by                                                                                                                          |
|-------------|---------------------------------------------------------------------------------------------------------------------------------|
| `CSVImport` | All bulk import paths (CSV file, MySQL query, Mailchimp/ActiveCampaign/Drip pulls). The provider name lives in `SubscriptionSourceRef`. |
| `API`       | `subscriber.create`, `subscriber.subscribe` (when no integration context), Journey "Subscribe to list" action.                  |
| `Webhook`   | Wufoo integration, Campaign Monitor migrator, scheduled MySQL sync. The integration id lives in `SubscriptionSourceRef`.        |
| `Manual`    | Admin/user "Add subscriber" UI in the dashboard.                                                                                |
| `Other`     | Free-text custom source — the label lives in `SubscriptionSourceRef`.                                                           |
| `Unknown`   | Default for backfilled historical rows and any unspecified writes.                                                              |

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                  |
|-----------|---------|----------|------------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `list.getsourcebreakdown`                                       |
| SessionID | String  | No       | Session ID obtained from login                                               |
| APIKey    | String  | No       | API key for authentication                                                   |
| ListID    | Integer | Yes      | Subscriber list to query. Must be owned by the authenticated user.           |

**Top-level response fields:**

| Field       | Type    | Description                                                                                                                                                          |
|-------------|---------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ListID`    | Integer | The list the breakdown describes (echoed back).                                                                                                                      |
| `AsOf`      | String  | ISO-8601 timestamp (UTC) of when the underlying counts were computed. Frozen for the lifetime of the cache entry, so two calls within the cache TTL share an `AsOf`. |
| `Buckets`   | Object  | One integer per `SubscriptionSource` ENUM value — every value is present even when the count is 0, so clients can render a stable bucket list.                        |
| `Total`     | Integer | Sum of every bucket count. Covers the entire row population (no deliverability filter).                                                                              |
| `Series`    | Array   | 12-month rolling time series. One entry per (`Month`, `SubscriptionSource`) pair that has at least one row. Sorted by `Month` ASC then `SubscriptionSource` ASC.     |
| `OtherRefs` | Array   | Top 10 `SubscriptionSourceRef` values within the `Other` bucket, sorted by `Count` DESC then `Ref` ASC. Empty array when `Buckets.Other` is 0. See entry shape below.  |

**`Buckets` object shape:**

| Field       | Type    | Description                                                                                  |
|-------------|---------|----------------------------------------------------------------------------------------------|
| `CSVImport` | Integer | Subscribers acquired through the bulk import pipeline.                                       |
| `API`       | Integer | Subscribers acquired through programmatic API calls.                                          |
| `Webhook`   | Integer | Subscribers acquired through push integrations / scheduled pulls.                             |
| `Manual`    | Integer | Subscribers manually added via the admin/user UI.                                             |
| `Other`     | Integer | Subscribers tagged with a free-text custom source (label in `SubscriptionSourceRef`).         |
| `Unknown`   | Integer | Backfilled historical rows or rows whose source wasn't supplied at insert time.               |

**`Series` entry shape:**

| Field                | Type    | Description                                                                  |
|----------------------|---------|------------------------------------------------------------------------------|
| `Month`              | String  | YYYY-MM bucket; covers the last 12 months including the current month-to-date. |
| `SubscriptionSource` | String  | One of the `Buckets` keys.                                                   |
| `Count`              | Integer | New subscriber rows in that month with that source.                          |

**`OtherRefs` entry shape:**

| Field   | Type    | Description                                                                                                                                                                  |
|---------|---------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `Ref`   | String  | The `SubscriptionSourceRef` label as stored on the row. Empty string (`""`) is a valid value (the column is `VARCHAR(64) NOT NULL DEFAULT ''`) and is returned verbatim — clients typically render it as "(no label)". Empty refs are not aggregated with non-empty refs. |
| `Count` | Integer | Number of `Other`-source rows on the list with that exact `Ref` value.                                                                                                       |

The list is capped at the **top 10** entries by `Count` DESC. Ties on `Count` break by `Ref` ASC so two calls with the same underlying data return byte-identical responses (the 5-minute Redis cache relies on this). The rank-11+ tail is silently dropped — there is no "Other" sentinel entry. When `Buckets.Other` is `0`, the array is `[]` and no query is issued.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "list.getsourcebreakdown",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListID": 123,
  "AsOf": "2026-05-09T14:32:01+00:00",
  "Buckets": {
    "CSVImport": 5230,
    "API": 1840,
    "Webhook": 210,
    "Manual": 45,
    "Other": 12,
    "Unknown": 8861
  },
  "Total": 16198,
  "Series": [
    { "Month": "2025-06", "SubscriptionSource": "API",       "Count": 120 },
    { "Month": "2025-06", "SubscriptionSource": "CSVImport", "Count": 450 },
    { "Month": "2025-07", "SubscriptionSource": "API",       "Count": 95 },
    { "Month": "2025-07", "SubscriptionSource": "Webhook",   "Count": 12 }
  ],
  "OtherRefs": [
    { "Ref": "podcast-listeners", "Count": 142 },
    { "Ref": "trade-show-2026",   "Count": 89 },
    { "Ref": "",                  "Count": 31 }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99997,
  "ErrorText": "Subscriber list does not exist or is not owned by the authenticated user"
}
```

```txt [Error Codes]
0: Success
1: ListID is missing (returned in the ErrorCode array as [1] by the required-field validator)
99997: Subscriber list does not exist or is not owned by the authenticated user (also returned when ListID is non-numeric or non-positive)
99998: Authentication failure or session expired
99999: User does not have the required permission (List.Get)
```

:::

## Get Lists Overview (Lists + Custom Fields + Segments + Subscriber Tags)

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Lists.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

Returns all of the authenticated user's subscriber lists in a single response and, optionally, each list's custom fields, segments, and subscriber tags — eliminating the `1 + N` (or `1 + 2N`) round-trips (`lists.get` followed by per-list `customfields.get`, `segments.get`, and `subscriber.tags.get`) that a Decision-node / journey-trigger picker would otherwise make. Regardless of how many lists the account has, the endpoint issues a bounded number of queries (≈1 lists + 1 custom fields + 1 segments + 1 subscriber tags).

Only the authenticated user's own lists, fields, segments, and tags are returned (ownership is enforced via `RelOwnerUserID` for lists and `UserID` for tags). The response is intentionally lightweight: heavy blob columns (`SegmentRules`, `SegmentRulesJson`, `FieldOptions` raw string, `Option1..5`, raw `Meta`), per-segment subscriber counts, and per-tag subscriber counts are omitted. Choice-type custom fields carry a parsed `Options` array when custom fields are requested. Each custom field additionally includes `ValidationMethod` and — derived from its `Meta` blob — `SQLDataType` plus `SQLDataTypeValues`: both are `null` for plain fields, while `SQLDataType` is `enum` / `set` (with `SQLDataTypeValues` listing the allowed values) for choice drop-downs and a raw SQL type for custom-typed fields. Together with `ValidationMethod` (e.g. `Numbers` marks a numeric `Single line` field stored as `DOUBLE`), this is enough to derive a field's data type and validation operators from `lists.overview` alone, with no per-list `customfields.get` fan-out. The raw `Meta` blob itself is never exposed. Global (account-level, `RelListID=0`) custom fields are merged into every list's `CustomFields[]` and receive the same metadata enrichment. Subscriber tags are always list-scoped (there is no global tag concept) and are emitted as `{TagID, Tag}` objects ordered by `Tag` ascending.

The `CustomFields`, `Segments`, and `SubscriberTags` keys are present on each list **only** when their corresponding `IncludeCustomFields` / `IncludeSegments` / `IncludeSubscriberTags` flag is enabled.

**Request Body Parameters:**

| Parameter           | Type    | Required | Description                                                                                                  |
|---------------------|---------|----------|--------------------------------------------------------------------------------------------------------------|
| Command             | String  | Yes      | API command: `lists.overview`                                                                                 |
| SessionID           | String  | No       | Session ID obtained from login (use either SessionID or APIKey)                                               |
| APIKey              | String  | No       | User API key for authentication (use either SessionID or APIKey)                                              |
| IncludeCustomFields | Boolean | No       | When `true`, each list carries a `CustomFields[]` array — each field with parsed `Options` for choice fields plus `ValidationMethod`, `SQLDataType`, and `SQLDataTypeValues` metadata. Default: `false` |
| IncludeSegments     | Boolean | No       | When `true`, each list carries a `Segments[]` array. Default: `false`                                          |
| IncludeSubscriberTags | Boolean | No     | When `true`, each list carries a `SubscriberTags[]` array of `{TagID, Tag}` objects (ordered by `Tag` ascending). Default: `false` |
| Archived            | String  | No       | Archive filter. Possible values: `active` (default — active lists only), `archived` (archived only), `all` (no filter) |
| Search              | String  | No       | Case-insensitive substring matched against list Name and Description                                          |
| OrderField          | String  | No       | Sort field. Possible values: `ListID`, `Name`, `CreatedOn`. Default: `Name`                                   |
| OrderType           | String  | No       | Sort direction: `ASC` or `DESC`. Default: `ASC`                                                               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "Command=lists.overview" \
  -d "APIKey=your-user-api-key" \
  -d "IncludeCustomFields=true" \
  -d "IncludeSegments=true" \
  -d "IncludeSubscriberTags=true"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalListCount": 2,
  "Lists": [
    {
      "ListID": 12,
      "Name": "Newsletter",
      "CustomFields": [
        {
          "CustomFieldID": 3,
          "RelListID": 12,
          "FieldName": "First Name",
          "FieldType": "Single line",
          "ValidationMethod": "Disabled",
          "MergeTagAlias": "FirstName",
          "Options": [],
          "SQLDataType": null,
          "SQLDataTypeValues": null
        },
        {
          "CustomFieldID": 8,
          "RelListID": 12,
          "FieldName": "Membership Tier",
          "FieldType": "Drop down",
          "ValidationMethod": "Enum",
          "MergeTagAlias": "Tier",
          "Options": [
            { "label": "Bronze", "value": "bronze", "is_selected": "false" },
            { "label": "Gold", "value": "gold", "is_selected": "false" }
          ],
          "SQLDataType": "enum",
          "SQLDataTypeValues": ["Bronze", "Gold"]
        }
      ],
      "Segments": [
        {
          "SegmentID": 7,
          "RelListID": 12,
          "SegmentName": "Active 30d",
          "SegmentOperator": "and"
        }
      ],
      "SubscriberTags": [
        {
          "TagID": 4,
          "Tag": "VIP"
        },
        {
          "TagID": 9,
          "Tag": "Webinar"
        }
      ]
    },
    {
      "ListID": 15,
      "Name": "Customers",
      "CustomFields": [],
      "Segments": [],
      "SubscriberTags": []
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999,
  "ErrorText": "User does not have the required permission (Lists.Get)"
}
```

```txt [Error Codes]
0: Success
99998: Authentication failure or session expired
99999: User does not have the required permission (Lists.Get)
```

:::
