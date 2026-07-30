---
layout: doc
---

# Subscriber API Documentation

Subscriber management endpoints for managing email list subscribers, including creation, updates, imports, exports, tagging, and journey management.

## Create a Subscriber

<Badge type="info" text="POST" /> `/api/v1/subscriber.create`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.create`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Yes   | Email address of the subscriber       |
| Status    | String | No       | Subscription status: Opt-In Pending, Subscribed, Opt-Out Pending, Unsubscribed (default: Subscribed) |
| OptInDate | String | No       | Opt-in date in Y-m-d or Y-m-d H:i:s format |
| SubscriptionDate | String | Conditional | Required if Status is Subscribed or Opt-In Pending (Y-m-d or Y-m-d H:i:s format) |
| SubscriptionIP | String | Conditional | Required if Status is Subscribed or Opt-In Pending (IP address) |
| UnsubscriptionDate | String | Conditional | Required if Status is Unsubscribed or Opt-Out Pending (Y-m-d or Y-m-d H:i:s format) |
| UnsubscriptionIP | String | Conditional | Required if Status is Unsubscribed or Opt-Out Pending (IP address) |
| BounceType | String | No      | Bounce type: Not Bounced, Soft, Hard (default: Not Bounced) |
| CustomFields | Object | No     | Custom field values (key: CustomFieldID, value: field value). Accepts both list-specific and global custom field IDs. |
| EnforceRequiredFields | Boolean | No | <Badge type="tip" text="New in v5.9.3" /> Opt in to strict custom-field enforcement. When `true`, the endpoint rejects a request whose custom-field values violate the list's own rules: a required (`IsRequired`) field that is empty **or omitted with no usable default**, a value that fails its `ValidationMethod`, or a duplicate value on a unique (`IsUnique`) field. Defaults to `false`, in which case custom-field values are accepted exactly as before (ownership and existence of each field ID are still validated). The same flag exists on `subscriber.subscribe` and `subscriber.update`. See the warning below. |
| OptInConfirmationEmailID | Integer | No | Email ID to send for opt-in confirmation |
| UpdateIfDuplicate | Boolean | No | Update subscriber if email already exists (default: false) |
| UpdateIfUnsubscribed | Boolean | No | Update subscriber if previously unsubscribed (default: false) |
| ApplyBehaviors | Boolean | No | Apply list subscription behaviors (default: false) |
| SendConfirmationEmail | Boolean | No | Send opt-in confirmation email (default: false) |
| UpdateStatistics | Boolean | No | Update list statistics (default: false) |
| TriggerWebServices | Boolean | No | Trigger web service integrations (default: false) |
| TriggerAutoResponders | Boolean | No | Trigger autoresponders (default: false) |
| Source    | String | No       | Acquisition source bucket persisted on the subscriber row. Possible values: `CSVImport`, `API`, `Webhook`, `Manual`, `Other`, `Unknown`. Defaults to `API` for this endpoint. Anything outside this set is coerced to `Unknown`. |
| SourceRef | String | No       | Optional free-text source reference (e.g., a custom label or integration id). Truncated server-side to 64 characters. |

::: warning Custom-field content rules are only enforced on request
By default `subscriber.create` validates that each submitted custom-field ID belongs to the caller and applies to the target list, but it does **not** check the field's own content rules — so a subscriber can be created that violates every required, unique and validation rule on the list. Pass `EnforceRequiredFields=true` to also enforce `IsRequired`, `IsUnique` and `ValidationMethod`.

Precedence, per submitted field, is required (`26`) → validation (`28`) → uniqueness (`27`). Required fields the request omits entirely are reported after all submitted fields have been checked.

A required **list-specific** field that is omitted but has a non-empty default value is considered satisfied — the default is written for you. A required **global** field (one that applies to all lists) is never defaulted, so omitting it is always an error.

`"0"` and `0` are real values and never count as empty.

Note that these error codes differ from the equivalents on `subscriber.subscribe` and `subscriber.update` (`6`/`7`/`8` and `8`/`9`/`10` respectively). `subscriber.create` already used `0`–`25` for other conditions, so its custom-field codes start at `26`.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.create \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.create",
    "SessionID": "your-session-id",
    "ListID": 123,
    "EmailAddress": "subscriber@example.com",
    "Status": "Subscribed",
    "SubscriptionDate": "2025-01-01 12:00:00",
    "SubscriptionIP": "192.168.1.1",
    "Source": "API",
    "SourceRef": "campaign-abc-2025",
    "CustomFields": {
      "1": "John",
      "2": "Doe"
    }
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": 456,
    "EmailAddress": "subscriber@example.com",
    "SubscriptionStatus": "Subscribed",
    "SubscriptionDate": "2025-01-01 12:00:00"
  },
  "Suppressed": false,
  "SubscriberTags": [],
  "SubscriberSegments": [],
  "SubscriberJourneys": [],
  "SubscriberWebsiteEvents": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "Errors": [
    {
      "Code": 2,
      "Message": "Missing EmailAddress parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid EmailAddress
4: Invalid ListID
5: Invalid BounceType value
6: Invalid Status value
7: Invalid SubscriptionDate value
8: Missing SubscriptionDate parameter
9: Missing SubscriptionIP parameter
10: Invalid SubscriptionIP value
11: Missing UnsubscriptionDate parameter
12: Missing UnsubscriptionIP parameter
13: Invalid UnsubscriptionDate value
14: Invalid UnsubscriptionIP value
15: Missing OptInDate parameter
16: Invalid OptInDate value
17: Invalid Custom Field value
18: Subscriber create limit is exceeded
19: Invalid EmailAddress
20: Duplicate EmailAddress
21: Previously unsubscribed EmailAddress
22: Invalid user information
23: Invalid list information
24: Invalid OptInConfirmationEmailID value
25: Invalid OptInConfirmationEmailID (email does not exist or does not belong to user)
26: Required custom field is empty or was omitted (EnforceRequiredFields only)
27: Unique custom field value already exists (EnforceRequiredFields only)
28: Custom field value failed its validation method (EnforceRequiredFields only)
```

:::

## Subscribe to a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.subscribe`   |
| ListID    | String | Yes      | ID of the subscriber list (can be comma-separated for multiple lists) |
| EmailAddress | String | Yes   | Email address of the subscriber       |
| IPAddress | String | Yes      | IP address of the subscriber          |
| CustomFieldN | String | No    | Custom field values (N = CustomFieldID) |
| EnforceRequiredFields | Boolean | No | <Badge type="tip" text="New in v5.9.3" /> When `true`, every custom field the list marks `IsRequired = Yes` is validated — **including fields whose `CustomFieldN` key is not present in the request at all**. Omitting a required field then returns `ErrorCode 6` with `ErrorCustomFieldID` / `ErrorCustomFieldTitle`. It additionally applies a corrected emptiness test, so a required multi-value field submitted as an empty array is rejected rather than silently accepted. Defaults to `false`, which preserves the historical behaviour where a required field is only checked when its key is submitted with an empty value. |
| Source    | String | No       | Acquisition source bucket persisted on the subscriber row. Possible values: `CSVImport`, `API`, `Webhook`, `Manual`, `Other`, `Unknown`. Defaults to `API` for this endpoint. Anything outside this set is coerced to `Unknown`. |
| SourceRef | String | No       | Optional free-text source reference (e.g., a custom label or integration id). Truncated server-side to 64 characters. |

::: warning Required custom fields are only fully enforced on request
By default this endpoint validates `IsRequired` custom fields **only when the caller submits the field's key**. A required field that is omitted entirely is not checked, and the subscriber is created without it. Set `EnforceRequiredFields=true` to validate every required field on the list.

The parameter is opt-in precisely because enabling it by default would turn existing, currently-successful integrations into `ErrorCode 6` failures.

When `EnforceRequiredFields=true`:

- **All** required fields applicable to the list are checked — both list-specific fields and the account's global custom fields, using the same ownership scoping as the rest of the endpoint.
- **`Visibility` is not considered.** A required field marked `User Only` or `Hidden` is enforced too, so a caller opting in must be able to supply every required field on the list.
- **A list-specific required field that is omitted but has a non-empty `FieldDefaultValue` is accepted**, because that default is written to the subscriber row — the stored value ends up non-empty, so the requirement is genuinely satisfied.
- **A global required field is not excused by its `FieldDefaultValue`.** Global custom-field values are only written from what the request submits — no default is backfilled — so an omitted global field would be stored empty and is reported.
- Error precedence is unchanged: a submitted-but-empty required field (`6`), a validation failure (`8`) or a uniqueness conflict (`7`) is still reported before any omitted-field error.
- **Emptiness is evaluated correctly for multi-value fields.** With the flag off, the historical test is `value == ''`, which in PHP is never true for an array — so a required checkbox or multi-select submitted as an empty array (`CustomField7[]` with nothing selected) passes validation and the subscriber is created with the field blank. With `EnforceRequiredFields=true` a submitted value counts as missing when it is an array with no non-empty member (`[]`, `[""]`, `[" "]`) **or** a scalar that is empty once trimmed (`""`, `" "`). A submitted `"0"` is always a real value and is never treated as empty.
- Only the **first** list in a comma-separated `ListID` is validated. Subsequent lists never receive custom-field values from this endpoint and are not checked.

`EnforceRequiredFields` accepts the usual boolean spellings — `true`, `1`, `"1"`, `"true"`, `"yes"`, `"on"`. Anything else is treated as false. No new error codes are introduced: omitted required fields reuse `ErrorCode 6` with the same `ErrorCustomFieldID` / `ErrorCustomFieldTitle` keys the present-but-empty case already returns.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.subscribe",
    "ListID": "123",
    "EmailAddress": "subscriber@example.com",
    "IPAddress": "192.168.1.1",
    "Source": "API",
    "SourceRef": "campaign-abc-2025",
    "CustomField1": "John",
    "CustomField2": "Doe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberID": 456,
  "RedirectURL": "https://example.com/confirmation",
  "Subscriber": {
    "SubscriberID": 456,
    "EmailAddress": "subscriber@example.com",
    "SubscriptionStatus": "Opt-In Pending"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```json [Error Response — missing required field]
{
  "Success": false,
  "ErrorCode": 6,
  "ErrorCustomFieldID": 5,
  "ErrorCustomFieldTitle": "Company"
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Missing IPAddress parameter
4: Invalid ListID
5: Invalid EmailAddress
6: Required custom field missing (returned with ErrorCustomFieldID and
   ErrorCustomFieldTitle)
7: Custom field value is not unique
8: Invalid custom field value
9: Duplicate email address
10: Subscription failed
11: Invalid user information
101: Plugin validation failed
```

:::

## Unsubscribe from a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.unsubscribe` |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| IPAddress | String | Yes      | IP address of the subscriber          |
| EmailAddress | String | Conditional | Email address (required if SubscriberID and RulesJSON not provided) |
| SubscriberID | Integer | Conditional | Subscriber ID (required if EmailAddress and RulesJSON not provided) |
| RulesJSON | String | Conditional | JSON rules for bulk unsubscription (required if EmailAddress and SubscriberID not provided). A **non-empty** value selects the bulk path; an empty value is treated as not supplied (see below). |
| RulesOperator | String | Conditional | Rules operator: and, or (required if RulesJSON provided) |
| CampaignID | Integer | No      | ID of the campaign (for tracking)     |
| EmailID   | Integer | No       | ID of the email (for tracking)        |
| AutoResponderID | Integer | No | ID of the autoresponder (for tracking) |
| Channel   | String | No       | Unsubscription channel (for tracking) |
| AddToGlobalSuppression | Boolean | No | Add to global suppression list (default: false) |
| BypassListSuppressionSettings | Boolean | No | When `true`, skip the list-level `OptOutAddToSuppressionList` and `OptOutAddToGlobalSuppressionList` auto-add (default: `false`). Used by admin-initiated unsubscribe actions in the subscriber edit page so the explicit "Add to suppression list" menu item is the only way an admin action writes suppression rows. End-user opt-outs from email links and journey actions leave this unset and keep honoring the list settings. Gated by the `ADMIN_UNSUBSCRIBE_BYPASSES_LIST_SUPPRESSION_SETTINGS` feature flag; an explicit `AddToGlobalSuppression=true` still adds the global suppression row even when the bypass is on. |
| Preview   | Integer | No       | Preview mode (1 = don't actually unsubscribe) |

::: warning RulesJSON validation (new in v5.9.3)
When `RulesJSON` is supplied it is validated **before** anything is modified. A payload that cannot produce a filter is rejected with `ErrorCode 7` and the request has **no effect**.

Rejected payloads:

- anything that is not a JSON **string** (send `RulesJSON` as a JSON-encoded string, not as a nested array/object, even when posting an `application/json` body);
- a string that is not syntactically valid JSON;
- a structurally empty payload in which no rule carries a `type` key — e.g. `[]`, `[[]]`, `[[{}]]`.

Previously such a payload silently degraded to *no filter at all*, so the unsubscribe ran against **every subscriber in the list** and still returned `"Success": true`.

An **omitted** `RulesJSON` is unchanged: it keeps its existing meaning.
:::

::: tip `RulesJSON` validation is shared across five commands
`RulesJSON` is validated identically on `subscribers.search`, `subscribers.delete`, `subscriber.unsubscribe`, `subscriber.tag` and `subscriber.untag`. The accepted payload shapes and the message text are the same on all five; only the error **code** differs — `6` on `subscribers.search`, `7` on the other four.
:::

::: warning Empty RulesJSON no longer takes the bulk path (new in v5.9.3)
A **present-but-empty** `RulesJSON` (`RulesJSON=`) is now treated as **not supplied**.

Previously the bulk branch was selected on presence alone. Because an empty string is
"present", a request sending an empty `RulesJSON` together with `RulesOperator` **and** a single
`EmailAddress`/`SubscriberID` entered the bulk path with no filter — unsubscribing the **entire
list** while silently discarding the one subscriber the caller named, and still returning
`"Success": true`.

Behaviour now:

| Request | Result |
|---|---|
| Empty `RulesJSON` + `EmailAddress`/`SubscriberID` | Only that subscriber is unsubscribed |
| Empty `RulesJSON`, no selector | `ErrorCode 3` (unchanged) |
| Omitted `RulesJSON` + selector | Only that subscriber (unchanged) |
| Non-empty, valid `RulesJSON` | Bulk unsubscribe (unchanged) |

Note `RulesJSON=0` is **not** treated as empty — it is a supplied-but-unusable payload and is
rejected with `ErrorCode 7` by the validation above.

This precedence applies to `subscriber.unsubscribe` only. On `subscribers.delete`,
`subscriber.tag` and `subscriber.untag` an empty `RulesJSON` with no selector already returned a
missing-parameter error and is unaffected.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.unsubscribe",
    "ListID": 123,
    "EmailAddress": "subscriber@example.com",
    "IPAddress": "192.168.1.1"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "RedirectURL": "https://example.com/unsubscribe-confirmed"
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
1: Missing ListID parameter
2: Missing IPAddress parameter
3: Missing EmailAddress/SubscriberID parameter
4: Invalid ListID
5: Invalid user information
6: Invalid EmailAddress
7: Subscriber not found
   -- OR -- "Invalid RulesJSON syntax. It must be a properly formatted JSON payload"
   (distinguish by the ErrorText field, which is only present for the RulesJSON rejection)
8: Invalid CampaignID
9: Subscriber already unsubscribed
10: Invalid EmailID
11: Invalid query builder response
```

:::

## Delete Subscribers

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.delete`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |
| Subscribers | String | Conditional | Comma-separated subscriber IDs (required if RulesJSON not provided). Each ID must be a positive integer; a value containing a non-integer ID is rejected (error code `8`). |
| RulesJSON | String | Conditional | JSON rules for bulk deletion (required if Subscribers not provided). Must be a JSON **string** describing at least one rule (each rule object requires a `type` key). An unparseable or rule-less payload returns error code `7` and deletes nothing. |
| RulesOperator | String | Conditional | Rules operator: and, or (required if RulesJSON provided) |
| Suppressed | Boolean | No      | Delete from suppression list instead (default: false) |

::: warning RulesJSON validation (new in v5.9.3)
When `RulesJSON` is supplied it is validated **before** anything is deleted. A payload that cannot produce a filter is rejected with `ErrorCode 7` and the request has **no effect**.

Rejected payloads:

- anything that is not a JSON **string** (send `RulesJSON` as a JSON-encoded string, not as a nested array/object, even when posting an `application/json` body);
- a string that is not syntactically valid JSON;
- a structurally empty payload in which no rule carries a `type` key — e.g. `[]`, `[[]]`, `[[{}]]`.

Previously such a payload silently degraded to *no filter at all*, so the deletion ran against **every subscriber in the list** and still returned `"Success": true`.

An **omitted or empty** `RulesJSON` is unchanged: it keeps its existing meaning.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.delete",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "Subscribers": "456,789,101"
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
  "ErrorCode": 2,
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
0: Success
2: Missing subscriber list id
5: Invalid list id
6: Invalid query builder response
7: Invalid RulesJSON syntax. It must be a properly formatted JSON payload
8: Invalid Subscribers value (contains a non-integer subscriber ID)
```

:::

## Delete All Subscribers from a List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.delete.all` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| DeleteListTags | Boolean | No | Also delete tag entities (default: false; tag associations always deleted) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.delete.all",
    "SessionID": "your-session-id",
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
3: Invalid list ID
4: Access denied to this list
5: Failed to delete subscribers
6: Failed to delete tag associations
7: Failed to delete tag entities
8: An error occurred during deletion
```

:::

## Search Subscribers

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.search`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| Operator  | String | Yes      | Rules operator: and, or               |
| Rules     | String | No       | Legacy rules format                   |
| RulesJSON | String | No       | JSON rules format. Optional — omit it (or send an empty string) to search the whole list. When supplied it must be a JSON **string** describing at least one rule, and each rule object requires a `type` key. An unparseable or rule-less payload returns error code `6` and no results. |
| RecordsPerRequest | Integer | No | Number of records to return (default: 25) |
| RecordsFrom | Integer | No   | Offset for pagination (default: 0)    |
| OrderField | String | No      | Field to order by (default: EmailAddress) |
| OrderType | String | No       | Order direction: ASC, DESC (default: ASC) |
| OnlyTotal | Boolean | No      | Return only total count (default: false) |
| AddMustHaveFilters | Boolean | No | Add mandatory filters for segment rules (default: false) |
| DebugQueryBuilder | Boolean | No | Return SQL query for debugging (default: false) |

::: warning RulesJSON validation (new in v5.9.3)
When `RulesJSON` is supplied it is validated **before** the search runs. A payload that cannot produce a filter is rejected with `ErrorCode 6`.

Rejected payloads:

- anything that is not a JSON **string** (send `RulesJSON` as a JSON-encoded string, not as a nested array/object, even when posting an `application/json` body);
- a string that is not syntactically valid JSON;
- a structurally empty payload in which no rule carries a `type` key — e.g. `[]`, `[[]]`, `[[{}]]`, `[[[]]]`;
- a payload whose only rules use a `type` the segment engine does not recognise, or whose rules are nested more than three levels deep (the engine does not evaluate level 3 or deeper).

Previously such a payload silently degraded to *no filter at all*, so the search returned **every subscriber in the list** together with `"Success": true` — indistinguishable from a deliberate whole-list search. Callers that relied on that response were receiving unfiltered results without any indication the filter had been discarded.

Omitting `RulesJSON`, or sending it as an empty string, is unaffected: that remains the documented "no filter, return the whole list" call. Filtering via the legacy `Rules` string parameter is also unaffected.
:::

::: warning `RecordsPerRequest: 0` is not supported here
`0` is **not** interpreted as "all records" on this command, unlike the admin campaign endpoints. Always pass a positive page size and paginate with `RecordsFrom`.

A JSON integer `0` falls back to the default of 25. A form-encoded `0` or the JSON string `"0"` reaches the segment engine as `LIMIT 0` and returns **no rows at all**.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.search",
    "SessionID": "your-session-id",
    "ListID": 123,
    "Operator": "and",
    "RulesJSON": "[[{\"type\":\"fields\",\"field_id\":\"EmailAddress\",\"operator\":\"contains\",\"value\":\"example\"}]]",
    "RecordsPerRequest": 50,
    "RecordsFrom": 0
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSubscribers": 150,
  "Subscribers": [
    {
      "SubscriberID": 456,
      "EmailAddress": "user@example.com",
      "SubscriptionStatus": "Subscribed",
      "SubscriberTags": [],
      "Suppressed": false,
      "TotalRevenue": 0
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [6],
  "ErrorText": ["Invalid RulesJSON syntax. It must be a properly formatted JSON payload"]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing Operator parameter
3: ListID not found
4: Problem with the segment engine
5: Segment recursion limit exceeded
6: Invalid RulesJSON syntax. It must be a properly formatted JSON payload
```

:::

## Import Subscribers (Legacy Multi-Step)

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

::: warning DEPRECATED
This is a legacy multi-step import endpoint. **Use [`subscribers.import.post`](#import-subscribers-modern-single-step) (via `/api/v1/subscribers.import`) for new integrations.**

The modern endpoint provides:
- Single-step import (no multi-step workflow)
- Support for CSV, Mailchimp, ActiveCampaign, and Drip imports
- Better error handling and validation
- Webhook notifications on completion
- Tag assignment during import
:::

**Request Body Parameters (Step 1):**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ImportStep | Integer | Yes     | Import step: 1 or 2                   |
| ListID    | Integer| No       | ID of the subscriber list             |
| ImportType | String | Yes      | Import type: Copy, File, MySQL        |
| ImportData | String | Conditional | CSV data (required if ImportType = Copy) |
| ImportFileName | String | Conditional | File name within the imports directory (required if ImportType = File). Provide a bare filename only — any path components are stripped (`basename`), so a value containing `/` or `..` is reduced to just the filename. |
| ImportMySQLHost | String | Conditional | MySQL host (required if ImportType = MySQL) |
| ImportMySQLPort | Integer | Conditional | MySQL port (required if ImportType = MySQL) |
| ImportMySQLDatabase | String | Conditional | MySQL database (required if ImportType = MySQL) |
| ImportMySQLQuery | String | Conditional | MySQL query (required if ImportType = MySQL) |
| FieldTerminator | String | No | Field delimiter (default: ,)          |
| FieldEncloser | String | No  | Field encloser (default: ")           |
| MappedFields | Object | Conditional | Step 2 only. Maps each import column to a target field, **keyed by the column identifiers (`FIELD1`, `FIELD2`, …) returned in the Step 1 `ImportFields` response** — e.g. `{"FIELD1": "EmailAddress", "FIELD2": "5"}`. At least one column must map to `EmailAddress`. |

::: warning Fixed in v5.9.3 (#2338)
Prior to v5.9.3, `File`-type imports through the public API always failed at Step 2 with error code `8` ("EmailAddress field not mapped"), because the nested `MappedFields` keys were case-folded and no longer matched the uppercase `FIELD1`/`FIELD2`/… column identifiers. This is fixed — send `MappedFields` keyed by the `FIELDn` identifiers exactly as returned in the Step 1 `ImportFields` response (case is normalized for you).
:::

::: code-group

```bash [Example Request - Step 1]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.import",
    "SessionID": "your-session-id",
    "ImportStep": 1,
    "ListID": 123,
    "ImportType": "Copy",
    "ImportData": "email,name\nuser@example.com,John Doe",
    "FieldTerminator": ",",
    "FieldEncloser": "\""
  }'
```

```json [Success Response - Step 1]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ImportID": 789,
  "ImportFields": [
    {
      "FIELD1": "email",
      "FIELD2": "name"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ImportType parameter
2: Missing ImportData parameter
3: Invalid ImportStep
4: Invalid ListID
5: Failed to parse CSV data
6: Import record already processed
7: EmailAddress field mapped more than once
8: EmailAddress field not mapped
9: Missing ImportFileName parameter
10: Missing ImportMySQLHost parameter
11: Missing ImportMySQLPort parameter
12: Missing ImportMySQLDatabase parameter
13: Import file does not exist
14: Missing ImportMySQLQuery parameter
15: MySQL connection failed
16: MySQL query failed
17: Import type not supported
18: File size exceeds maximum allowed size
```

:::

## Export Subscribers (Create Export Job)

<Badge type="info" text="POST" /> `/api/v1/subscribers.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.export.post` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| RulesJSON | Array  | Yes      | JSON rules for filtering subscribers  |
| RulesOperator | String | Yes   | Rules operator: and, or               |
| ExportFormat | String | Yes   | Export format: csv, json              |
| FieldsToExport | Array | Yes  | Array of field names to export        |
| Target    | String | No       | Target segment: Active, Suppressed, Unsubscribed, Soft bounced, Hard bounced, or segment ID |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscribers.export \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.export.post",
    "SessionID": "your-session-id",
    "ListID": 123,
    "RulesJSON": [],
    "RulesOperator": "and",
    "ExportFormat": "csv",
    "FieldsToExport": ["EmailAddress", "SubscriptionDate"],
    "Target": "Active"
  }'
```

```json [Success Response]
{
  "ExportID": 456
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing RulesJSON parameter
3: Missing RulesOperator parameter
4: Missing ExportFormat parameter
5: Missing FieldsToExport parameter
6: Invalid ListID parameter
7: Invalid RulesJSON syntax
8: RulesOperator must be either "and" or "or"
9: ExportFormat must be either "csv" or "json"
10: List not found
11: Target must be valid status or segment ID
12: Segment not found
```

:::

## Get Export Job Status

<Badge type="info" text="GET" /> `/api/v1/subscribers.export`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.export.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| ExportID  | Integer| No       | ID of the export job (omit to list all export jobs) |
| Download  | Boolean| No       | Download the export file (only when ExportID provided and status is Completed) |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/subscribers.export?Command=subscribers.export.get&SessionID=your-session-id&ListID=123&ExportID=456"
```

```json [Success Response]
{
  "ExportJob": {
    "ExportID": 456,
    "Module": "SubscriberExport",
    "Status": "Completed",
    "ExportOptions": {
      "Command": "ExportSubscribers",
      "ListID": 123,
      "FileFormat": "csv",
      "Fields": ["EmailAddress", "SubscriptionDate"]
    },
    "SubmittedAt": "2025-01-01 12:00:00",
    "FinishedAt": "2025-01-01 12:05:00",
    "DownloadSize": 1024000
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Invalid ListID parameter
3: Invalid ExportID parameter
4: List not found
5: Invalid ExportID parameter
6: Export job not found
7: Export file has expired and is no longer available for download (HTTP 410)
```

:::

::: warning Export file retention
Completed export result files are removed automatically after `EXPORT_FILE_RETENTION_DAYS` (default 30 days) by the export cleanup cron. When a `Download` is requested for a `Completed` export whose file has already been cleaned up, this endpoint responds with **HTTP 410 Gone** and error `Code 7`. The export job record itself is preserved, so listing export jobs still returns the (now file-less) row. Re-submit the export to obtain a fresh file.
:::

## Import Subscribers (Modern Single-Step)

<Badge type="info" text="POST" /> `/api/v1/subscribers.import`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import.post` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| AddToGlobalSuppressionList | Boolean | Yes | Add failed imports to global suppression |
| AddToSuppressionList | Boolean | Yes | Add failed imports to list suppression |
| UpdateDuplicates | Boolean | Yes | Update existing subscribers on duplicate |
| TriggerActions | Boolean | Yes | Trigger autoresponders and journeys   |
| Tags      | Array  | Yes      | Array of tag names to apply to imported subscribers |
| ImportFrom | Object | Yes     | Import source configuration           |
| ImportFrom.CSV.URL | String | Conditional | URL to fetch CSV data (required if ImportFrom.CSV.Data not provided) |
| ImportFrom.CSV.Data | String | Conditional | CSV data string (required if ImportFrom.CSV.URL not provided) |
| ImportFrom.CSV.FieldTerminator | String | Yes (for CSV) | Field delimiter |
| ImportFrom.CSV.FieldEncloser | String | No | Field encloser (default: empty) |
| ImportFrom.CSV.EscapedBy | String | Yes (for CSV) | Escape character |
| ImportFrom.CSV.MappedFields | Object | Yes (for CSV) | Field mapping (FieldName: CustomFieldID or EmailAddress) |
| ImportStatusUpdateWebhookURL | String | No | Webhook URL to notify on import completion |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscribers.import \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.import.post",
    "SessionID": "your-session-id",
    "ListID": 123,
    "AddToGlobalSuppressionList": false,
    "AddToSuppressionList": false,
    "UpdateDuplicates": true,
    "TriggerActions": true,
    "Tags": ["newsletter", "2025"],
    "ImportFrom": {
      "CSV": {
        "Data": "email,name\nuser@example.com,John Doe",
        "FieldTerminator": ",",
        "FieldEncloser": "\"",
        "EscapedBy": "\\",
        "MappedFields": {
          "FIELD1": "EmailAddress",
          "FIELD2": "1"
        }
      }
    }
  }'
```

```json [Success Response]
{
  "ImportID": 789,
  "ImportType": "async"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing FieldTerminator parameter
4: Missing AddToGlobalSuppressionList parameter
5: Missing AddToSuppressionList parameter
6: Missing UpdateDuplicates parameter
7: Missing TriggerActions parameter
8: Missing MappedFields parameter
9: Invalid AddToGlobalSuppressionList parameter
10: Invalid AddToSuppressionList parameter
11: Invalid UpdateDuplicates parameter
12: Invalid TriggerActions parameter
13: Invalid MappedFields parameter
14: ImportFrom source must be provided
15: Fields are not mapped
16: Missing EscapedBy parameter
17: Field mapping is invalid
18: ImportFrom.CSV.URL remote data fetch failure
19: List not found
20: Invalid ListID parameter / Failed to create import record
21: Missing Tags parameter
```

:::

## Get Import Job Status

<Badge type="info" text="GET" /> `/api/v1/subscribers.import`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import.get` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| ImportID  | Integer| Yes      | ID of the import job                  |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/subscribers.import?Command=subscribers.import.get&SessionID=your-session-id&ListID=123&ImportID=789"
```

```json [Success Response]
{
  "ImportJob": {
    "ImportID": 789,
    "ImportDate": "2025-01-01 12:00:00",
    "FinishedAt": "2025-01-01 12:05:00",
    "ImportStatus": "Completed",
    "FailedData": "",
    "TotalSubscribers": 1000,
    "TotalImported": 950,
    "TotalDuplicates": 30,
    "TotalFailed": 20
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing ImportID parameter
3: Invalid ListID parameter
4: Invalid ImportID parameter
5: List not found
6: Invalid ImportID parameter
7: Import job not found
```

:::

## Prepare Import from Third-Party Service

<Badge type="info" text="POST" /> `/api/v1/subscribers.import`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Import`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

This endpoint prepares import by fetching metadata from third-party services (Mailchimp, ActiveCampaign, Drip).

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.import.prepare` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ImportFrom | Object | Yes     | Import source configuration           |
| ImportFrom.Mailchimp.APIKey | String | Conditional | Mailchimp API key |
| ImportFrom.Mailchimp.Server | String | Conditional | Mailchimp server (e.g., us1) |
| ImportFrom.ActiveCampaign.APIKey | String | Conditional | ActiveCampaign API key |
| ImportFrom.ActiveCampaign.AccountName | String | Conditional | ActiveCampaign account name |
| ImportFrom.Drip.APIKey | String | Conditional | Drip API key |

::: code-group

```bash [Example Request - Mailchimp]
curl -X POST https://example.com/api/v1/subscribers.import \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.import.prepare",
    "SessionID": "your-session-id",
    "ImportFrom": {
      "Mailchimp": {
        "APIKey": "your-mailchimp-api-key",
        "Server": "us1"
      }
    }
  }'
```

```json [Success Response - Mailchimp]
{
  "Lists": [
    {
      "ID": "abc123",
      "Name": "Newsletter List",
      "ActiveSubscribersCount": 1500,
      "SubscribersCount": 2000,
      "MergeFields": [
        {
          "ID": "FNAME",
          "Name": "First Name",
          "Type": "text"
        }
      ],
      "Tags": [
        {
          "ID": 456,
          "Name": "VIP"
        }
      ],
      "Groups": []
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "ImportFrom.Mailchimp.APIKey, ImportFrom.ActiveCampaign.APIKey or ImportFrom.Drip.APIKey must be provided"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: ImportFrom source must be provided
2: Invalid ImportFrom source
3: ActiveCampaign API key is missing
4: ActiveCampaign account name is missing
5: ActiveCampaign Error
7: Mailchimp API key is missing
8: Mailchimp server is missing
9: Mailchimp Error / Drip Error
11: Mailchimp Error While Retrieving Lists
12: Mailchimp Error While Retrieving Merge Fields
13: Mailchimp Error While Retrieving Tags
14: Mailchimp Error While Retrieving Interest Categories
15: Mailchimp Error While Retrieving Interests
16-23: Various third-party API errors
```

:::

## Get Subscribers List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscribers.get`        |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |
| SubscriberSegment | String | Yes | Segment: Active, Suppressed, Unsubscribed, Soft bounced, Hard bounced, Opt-in pending, or segment ID |
| RecordsPerRequest | Integer | No | Number of records to return (default: 25) |
| RecordsFrom | Integer | No   | Offset for pagination (default: 0)    |
| OrderField | String | No      | Field to order by (default: EmailAddress) |
| OrderType | String | No       | Order direction: ASC, DESC (default: ASC) |
| SearchField | String | No      | Field to search in                    |
| SearchKeyword | String | No    | Search keyword                        |

::: danger `RecordsPerRequest: 0` is not supported here
`0` is **not** interpreted as "all records" on this command, unlike the admin campaign endpoints. Always pass a positive page size and paginate with `RecordsFrom`.

What `0` actually does depends on how you send it and which segment you request, and neither outcome is useful:

- a JSON integer `0` falls back to the default of 25;
- a form-encoded `0` or the JSON string `"0"` on a **segment ID** produces `LIMIT 0, 0` and returns **no rows**;
- a form-encoded `0` or the JSON string `"0"` on any **named** segment (`Active`, `Suppressed`, `Unsubscribed`, …) drops the `LIMIT` entirely and reads the **whole subscriber table** for that list into memory. On a large list this will exhaust memory or time out.

Use `RecordsPerRequest` with `RecordsFrom` to page through a large list.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscribers.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "SubscriberSegment": "Active",
    "RecordsPerRequest": 50,
    "RecordsFrom": 0,
    "OrderField": "SubscriptionDate",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": 456,
      "EmailAddress": "user@example.com",
      "SubscriptionStatus": "Subscribed",
      "SubscriptionDate": "2025-01-01 12:00:00"
    }
  ],
  "TotalSubscribers": 1500
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing SubscriberListID parameter
2: Missing SubscriberSegment parameter
3: Invalid ListID or list does not belong to user
```

:::

## Update a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Subscriber session
- Required permissions: `Subscriber.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.update`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |
| EmailAddress | String | No    | New email address                     |
| SubscriptionStatus | String | No | New status: Opt-In Pending, Subscribed, Opt-Out Pending, Unsubscribed |
| UnsubscriptionIP | String | No | IP address for unsubscription        |
| UnsubscriptionDate | String | No | Date for unsubscription (Y-m-d H:i:s) |
| BounceType | String | No      | Bounce type: Not Bounced, Soft, Hard  |
| Fields    | Object | No       | Custom field values (CustomFieldID: value). Keys are matched **case-insensitively** — see the note below. |
| EnforceRequiredFields | Boolean | No | <Badge type="tip" text="New in v5.9.3" /> Opt in to the corrected custom-field checks. When `true`, a required multi-value field submitted as an **empty array** (`[]`, `[""]`, or an unfilled Date field's `["", "", ""]`) is rejected with `ErrorCode 8` instead of being accepted and stored blank, and the validation and uniqueness checks are evaluated against the submitted value. Defaults to `false`, which preserves historical behaviour. Same flag name and semantics as `subscriber.subscribe` and `subscriber.create`. See the warning below. |
| IgnoreAllOtherCustomFieldsExceptGivenOnes | Boolean | No | Only update specified fields (default: false) |
| TriggerEvents | Boolean | No   | Trigger journey events (default: true) |

::: tip Custom-field names in `Fields` are matched case-insensitively
<Badge type="tip" text="Fixed in v5.9.3" /> The public API lowercases every request key, including the keys inside the nested `Fields` object. Until v5.9.3 this endpoint looked its custom-field values up in PascalCase, so **no** submission shape matched: on a list with a required custom field `subscriber.update` returned `ErrorCode 8` even when the value *was* submitted, and the validation and uniqueness checks were evaluated against an empty value rather than the submitted one (issue #2661).

`Fields` keys are now resolved case-insensitively, so `CustomField1`, `customfield1` and `CUSTOMFIELD1` are equivalent. The documented example below works verbatim.
:::

::: warning What `EnforceRequiredFields` changes
The key-casing fix is applied so that **no request that succeeded before can start failing**: with `EnforceRequiredFields` absent or false, a custom field is only rejected when the corrected check **and** the historical check both reject it. In practice that means, by default:

- a **required** field you submit is now accepted (previously `ErrorCode 8` regardless of what you sent);
- a value now seen to be **valid** is no longer rejected — e.g. a real URL in a `URL`-validated field previously failed with *"Custom field value is not an URL address"*;
- a value now seen to be **unique** is no longer rejected — previously a genuinely unique value could fail with `ErrorCode 9` because the empty lookup collided with another subscriber's empty value;
- but a value now seen to be **invalid** or a **duplicate** is still accepted, exactly as before. Rejecting those is new enforcement.

Set `EnforceRequiredFields=true` to apply the corrected checks on their own, which additionally:

- rejects a required multi-value field submitted as an empty array (`ErrorCode 8`);
- rejects a value that duplicates another subscriber's value in an `IsUnique` field (`ErrorCode 9`);
- rejects a value that fails the field's `ValidationMethod` (`ErrorCode 10`);
- makes `IgnoreAllOtherCustomFieldsExceptGivenOnes` filter on the **keys** present in `Fields` rather than on its values, so the fields you *did* submit are actually checked. With the flag off, that filter continues to skip effectively every field.

With the flag on, a submitted value counts as missing when it is an array with no non-empty member — `[]`, `[""]`, `[" "]`, `["", "", ""]`, evaluated recursively so the positional Date `(d, m, Y)` and Time `(H, i)` arrays are handled — or a scalar that is empty once trimmed. A submitted `"0"` is always a real value and is never treated as missing, with the flag on or off.

No new error codes are introduced. Two consequences worth calling out:

- On a list whose required field also has a `Numbers`, `Letters`, `Numbers and letters` or `Date` validation method, submitting an **invalid** value used to be rejected with `ErrorCode 8` and is now accepted and stored. `EnforceRequiredFields=true` rejects it with `ErrorCode 10`.
- Multi-value fields (Date, Time, checkbox groups) are checked for **presence** but not for validity or uniqueness, because those two helpers accept scalars only.

`EnforceRequiredFields` accepts the usual boolean spellings — `true`, `1`, `"1"`, `"true"`, `"yes"`, `"on"`. Anything else is treated as false.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.update",
    "SessionID": "your-session-id",
    "SubscriberID": 456,
    "SubscriberListID": 123,
    "EmailAddress": "newemail@example.com",
    "EnforceRequiredFields": true,
    "Fields": {
      "CustomField1": "Updated Value"
    }
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing SubscriberID parameter
2: Missing SubscriberListID parameter
3: Missing EmailAddress parameter
4: Invalid EmailAddress
5: Invalid ListID
6: Subscriber not found
7: Duplicate EmailAddress
8: Required custom field missing
9: Custom field value is not unique
10: Invalid custom field value
11: Unknown custom field ID(s) - ErrorCustomFieldIDs lists the invalid IDs
```

:::

## Get a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Subscriber session
- Required permissions: `Subscribers.Get`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.get`         |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Conditional | Email address (required if SubscriberID not provided) |
| SubscriberID | Integer | Conditional | Subscriber ID (required if EmailAddress not provided) |
| IncludeJourneys | Boolean | No | Include journey data (default: true) |
| IncludeEvents | Boolean | No | Include website events (default: true) |
| IncludeActivity | Boolean | No | Include activity log (default: true) |
| IncludeRevenue | Boolean | No | Include revenue data (default: true) |
| IncludeTags | Boolean | No | Include tags (default: true)          |
| IncludeSegments | Boolean | No | Include segments (default: true)      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.get",
    "SessionID": "your-session-id",
    "ListID": 123,
    "EmailAddress": "user@example.com",
    "IncludeJourneys": true,
    "IncludeEvents": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": 456,
    "EmailAddress": "user@example.com",
    "SubscriptionStatus": "Subscribed",
    "SubscriptionDate": "2025-01-01 12:00:00"
  },
  "Suppressed": false,
  "SubscriberTags": [
    {
      "TagID": 1,
      "TagName": "VIP"
    }
  ],
  "SubscriberSegments": [],
  "SubscriberJourneys": {
    "InProgress": [
      {
        "JourneyID": 7,
        "JourneyName": "Welcome series",
        "EntryID": 42,
        "RelActionID": 13,
        "SnoozedUntil": null,
        "EnrolledAt": "2026-03-12 09:00:00",
        "CurrentStep": 3,
        "TotalSteps": 7
      }
    ],
    "Completed": [
      {
        "JourneyID": 9,
        "JourneyName": "Onboarding",
        "EntryID": 21,
        "RelActionID": 0,
        "EnrolledAt": "2026-02-14 11:30:00",
        "CompletedAt": "2026-02-28 11:30:00",
        "CurrentStep": 4,
        "TotalSteps": 4
      }
    ]
  },
  "SubscriberWebsiteEvents": [],
  "SubscriberActivity": [],
  "TotalRevenue": 0
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
1: Missing EmailAddress/SubscriberID parameter
2: Missing ListID parameter
3: Subscriber not found
4: Invalid ListID
429: Too many requests (rate limit exceeded)
```

:::

::: info SubscriberJourneys fields

When `IncludeJourneys` is true and the subscriber is enrolled in at least one journey, the `SubscriberJourneys` object contains two buckets: `InProgress` and `Completed`. Each entry exposes:

- `JourneyID`, `JourneyName` — journey metadata
- `EntryID` — the per-subscriber enrollment row id
- `RelActionID` — the action the entry is currently parked on (0 on Completed entries)
- `SnoozedUntil` — Wait gate, if any (InProgress only)
- `EnrolledAt` — when the subscriber entered the journey
- `CompletedAt` — when the enrollment finished (Completed bucket only)
- `CurrentStep` — 1-based position in the journey's linearized execution path
- `TotalSteps` — length of the journey's longest linearized path; useful for rendering "Step k of n" UIs

`CurrentStep` and `TotalSteps` count only published actions. On Completed entries, `CurrentStep` equals `TotalSteps`.

:::

## Get Subscriber Activity

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Subscriber session
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.get.activity` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| SubscriberListID | Integer | Yes | ID of the subscriber list           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.get.activity",
    "SessionID": "your-session-id",
    "SubscriberID": 456,
    "SubscriberListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Activity": [
    {
      "ActivityType": "EmailOpen",
      "CampaignID": 789,
      "EmailID": 101,
      "ActivityDate": "2025-01-15 10:30:00"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing SubscriberID parameter
2: Missing SubscriberListID parameter
3: Subscriber not found
```

:::

## Check if Subscriber Exists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscribers.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.exists`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Yes   | Email address to check                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.exists",
    "SessionID": "your-session-id",
    "ListID": 123,
    "EmailAddress": "user@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Exists": true,
  "SubscriberID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid ListID
```

:::

## Get Subscriber Lists

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Subscriber session
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.getlists`    |
| SessionID | String | Yes      | Subscriber session ID                 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.getlists",
    "SessionID": "subscriber-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Lists": [
    {
      "ListID": 123,
      "ListName": "Newsletter",
      "SubscriptionStatus": "Subscribed"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Authentication failure or session expired
```

:::

## Subscriber Login

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.login`       |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| EmailAddress | String | Yes   | Email address of the subscriber       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.login",
    "ListID": 123,
    "EmailAddress": "user@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SessionID": "subscriber-session-id",
  "SubscriberInformation": {
    "SubscriberID": 456,
    "EmailAddress": "user@example.com",
    "SubscriptionStatus": "Subscribed"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid EmailAddress
4: Subscriber not found
```

:::

## Confirm Opt-In

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.optin`       |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| ConfirmationCode | String | Yes | Opt-in confirmation code            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.optin",
    "ListID": 123,
    "SubscriberID": 456,
    "ConfirmationCode": "abc123def456"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "RedirectURL": "https://example.com/welcome"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing SubscriberID parameter
3: Missing ConfirmationCode parameter
4: Invalid confirmation code
5: Subscriber not found
```

:::

## Tag a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscriber.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tag`         |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list          |
| TagID     | Integer/Array | Yes | ID of the tag to apply. Accepts a single ID, a comma-separated string, or an array. |
| SubscriberID | Integer/String | Conditional | Subscriber ID, or a comma-separated list of IDs. Required unless `RulesJSON` is provided. |
| RulesJSON | String | Conditional | JSON rules for filter-based bulk tagging. Required when `SubscriberID` is not provided. Must be a JSON **string** describing at least one rule (each rule object requires a `type` key). |
| RulesOperator | String | Conditional | Rules operator: and, or. Required when `RulesJSON` is provided. |

::: warning RulesJSON validation (new in v5.9.3)
When `RulesJSON` is supplied it is validated **before** anything is modified. A payload that cannot produce a filter is rejected with `ErrorCode 7` and the request has **no effect**.

Rejected payloads:

- anything that is not a JSON **string** (send `RulesJSON` as a JSON-encoded string, not as a nested array/object, even when posting an `application/json` body);
- a string that is not syntactically valid JSON;
- a structurally empty payload in which no rule carries a `type` key — e.g. `[]`, `[[]]`, `[[{}]]`.

Previously such a payload silently degraded to *no filter at all*, so the tagging ran against **every subscriber in the list** and still returned `"Success": true`.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tag",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456,
    "TagID": 789
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing TagID parameter
2: Missing SubscriberListID parameter
4: Invalid SubscriberListID
6: Missing RulesJSON parameter (when SubscriberID is not supplied)
   -- OR -- Invalid TagID (no matching tag found)
7: Missing RulesOperator parameter (when SubscriberID is not supplied)
   -- OR -- "Invalid RulesJSON syntax. It must be a properly formatted JSON payload"
   (distinguish by the ErrorText field, which is only present for the RulesJSON rejection)
8: Invalid query builder response
```

:::

## Untag a Subscriber

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Subscriber.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.untag`       |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list          |
| TagID     | Integer/Array | Yes | ID of the tag to remove. Accepts a single ID, a comma-separated string, or an array. |
| SubscriberID | Integer/String | Conditional | Subscriber ID, or a comma-separated list of IDs. Required unless `RulesJSON` is provided. |
| RulesJSON | String | Conditional | JSON rules for filter-based bulk untagging. Required when `SubscriberID` is not provided. Must be a JSON **string** describing at least one rule (each rule object requires a `type` key). |
| RulesOperator | String | Conditional | Rules operator: and, or. Required when `RulesJSON` is provided. |

::: warning RulesJSON validation (new in v5.9.3)
When `RulesJSON` is supplied it is validated **before** anything is modified. A payload that cannot produce a filter is rejected with `ErrorCode 7` and the request has **no effect**.

Rejected payloads:

- anything that is not a JSON **string** (send `RulesJSON` as a JSON-encoded string, not as a nested array/object, even when posting an `application/json` body);
- a string that is not syntactically valid JSON;
- a structurally empty payload in which no rule carries a `type` key — e.g. `[]`, `[[]]`, `[[{}]]`.

Previously such a payload silently degraded to *no filter at all*, so the untagging ran against **every subscriber in the list** and still returned `"Success": true`.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.untag",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456,
    "TagID": 789
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing TagID parameter
2: Missing SubscriberListID parameter
4: Invalid SubscriberListID
6: Missing RulesJSON parameter (when SubscriberID is not supplied)
   -- OR -- Invalid TagID (no matching tag found)
7: Missing RulesOperator parameter (when SubscriberID is not supplied)
   -- OR -- "Invalid RulesJSON syntax. It must be a properly formatted JSON payload"
   (distinguish by the ErrorText field, which is only present for the RulesJSON rejection)
8: Invalid query builder response
```

:::

## Create a Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tags.create` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| TagName   | String | Yes      | Name of the tag                       |
| TagDescription | String | No   | Description of the tag                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.create",
    "SessionID": "your-session-id",
    "ListID": 123,
    "TagName": "VIP Customer",
    "TagDescription": "High-value customers"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TagID": 789
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing TagName parameter
3: Invalid tag format (only letters, numbers, spaces, hyphens and underscores allowed, and percent signs)
4: Invalid ListID
5: Tag name already exists
```

Tag names are trimmed of leading and trailing whitespace and must contain only letters, numbers, spaces, hyphens, underscores, or percent signs (`%`).

:::

## Update a Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tags.update` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| TagID     | Integer| Yes      | ID of the tag                         |
| TagName   | String | No       | New name of the tag                   |
| TagDescription | String | No   | New description of the tag            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.update",
    "SessionID": "your-session-id",
    "ListID": 123,
    "TagID": 789,
    "TagName": "Premium Customer"
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Missing TagID parameter
3: Invalid tag format (only letters, numbers, spaces, hyphens and underscores allowed, and percent signs)
4: Invalid ListID, Invalid TagID, or Tag cannot be empty after trimming whitespace
5: Tag name already exists
```

When provided, the tag name is trimmed of leading and trailing whitespace and must contain only letters, numbers, spaces, hyphens, underscores, or percent signs (`%`).

:::

## Get Subscriber Tags

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.tags.get`    |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.get",
    "SessionID": "your-session-id",
    "ListID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Tags": [
    {
      "TagID": 789,
      "TagName": "VIP Customer",
      "TagDescription": "High-value customers",
      "SubscriberCount": 50
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Invalid ListID
```

:::

## Delete a Subscriber Tag

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `List.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command          | String | Yes | API command: `subscriber.tags.delete` |
| SessionID        | String | No  | Session ID obtained from login        |
| APIKey           | String | No  | API key for authentication            |
| SubscriberListID | Integer| Yes | ID of the subscriber list             |
| TagIDs           | String | Yes | Comma-separated list of tag IDs to delete (e.g. `"12,15,20"`). Must contain at least one positive integer ID. |

::: warning Behavior change (v5.9.3, #2337)
`TagIDs` is now **required** and must contain at least one valid positive integer ID. In earlier versions, omitting `TagIDs` (or sending an empty value) silently deleted **every tag on the list**; it now returns error code `5` instead. Malformed values such as `","` or non-numeric IDs are also rejected. To remove tags, always send an explicit comma-separated ID list.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.tags.delete",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "TagIDs": "789,790"
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
  "ErrorCode": 5,
  "ErrorText": ["Tag ids are missing"]
}
```

```txt [Error Codes]
0: Success
2: Missing SubscriberListID parameter
4: Invalid SubscriberListID (list not found or not owned by you)
5: Tag ids are missing (TagIDs absent, empty, or has no valid positive integer ID)
```

:::

## Trigger Journey for Subscriber

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.trigger`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.trigger` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| JourneyID | Integer/Array | Yes | ID of the journey to trigger, or an array of journey IDs |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |
| BypassJourneyStatusCheck | Boolean | No | If `true`, triggers the journey even if it is disabled. Default: `false` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.trigger \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.trigger",
    "SessionID": "your-session-id",
    "JourneyID": 789,
    "ListID": 123,
    "SubscriberID": 456
  }'
```

```json [Success Response]
{
  "Success": true,
  "JourneyIDs": [789],
  "ListID": 123,
  "SubscriberID": 456
}
```

```json [Partial Success Response]
{
  "Success": true,
  "JourneyIDs": [789],
  "ListID": 123,
  "SubscriberID": 456,
  "SkippedJourneys": [
    {
      "JourneyID": 790,
      "Reason": "Journey is disabled"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 7,
      "Message": "Journey not found"
    }
  ],
  "SkippedJourneys": [
    {
      "JourneyID": 789,
      "Reason": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing ListID parameter
3: Missing SubscriberID parameter
4: Invalid JourneyID parameter
5: Invalid ListID parameter
6: Invalid SubscriberID parameter
7: Journey not found (all journeys skipped)
8: List not found
9: Subscriber not found
```

:::

## Remove Subscriber from Journey

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.remove`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.remove` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| JourneyID | Integer/Array | Yes | ID of the journey, or an array of journey IDs |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.remove \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.remove",
    "SessionID": "your-session-id",
    "JourneyID": 789,
    "ListID": 123,
    "SubscriberID": 456
  }'
```

```json [Success Response]
{
  "Success": true,
  "JourneyIDs": [789],
  "ListID": 123,
  "SubscriberID": 456
}
```

```json [Partial Success Response]
{
  "Success": true,
  "JourneyIDs": [789],
  "ListID": 123,
  "SubscriberID": 456,
  "SkippedJourneys": [
    {
      "JourneyID": 790,
      "Reason": "Journey not found"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 7,
      "Message": "Journey not found"
    }
  ],
  "SkippedJourneys": [
    {
      "JourneyID": 789,
      "Reason": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing ListID parameter
3: Missing SubscriberID parameter
4: Invalid JourneyID parameter
5: Invalid ListID parameter
6: Invalid SubscriberID parameter
7: Journey not found (all journeys skipped)
8: List not found
9: Subscriber not found
```

:::

## Exit Subscriber from Journey

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.exit`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.exit` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| JourneyID | Integer| Yes      | ID of the journey                     |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.exit \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.exit",
    "SessionID": "your-session-id",
    "JourneyID": 789,
    "ListID": 123,
    "SubscriberID": 456
  }'
```

```json [Success Response]
{
  "JourneyID": 789,
  "ListID": 123,
  "SubscriberID": 456
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 7,
      "Message": "Journey not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
1: Missing JourneyID parameter
2: Missing ListID parameter
3: Missing SubscriberID parameter
4: Invalid JourneyID parameter
5: Invalid ListID parameter
6: Invalid SubscriberID parameter
7: Journey not found
8: List not found
9: Subscriber not found
```

:::

## List Subscriber Journeys

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.list`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `subscriber.journey.list` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| ListID    | Integer| Yes      | ID of the subscriber list             |
| SubscriberID | Integer | Yes   | ID of the subscriber                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/subscriber.journey.list \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "subscriber.journey.list",
    "SessionID": "your-session-id",
    "ListID": 123,
    "SubscriberID": 456
  }'
```

```json [Success Response]
{
  "ListID": 123,
  "SubscriberID": 456,
  "Journeys": [
    {
      "JourneyID": 789,
      "JourneyName": "Welcome Series",
      "Status": "Enabled",
      "JoinedAt": "2025-01-01 12:00:00"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 8,
      "Message": "List not found"
    }
  ]
}
```

```txt [Error Codes]
0: Success
2: Missing ListID parameter
3: Missing SubscriberID parameter
5: Invalid ListID parameter
6: Invalid SubscriberID parameter
8: List not found
9: Subscriber not found
```

:::
