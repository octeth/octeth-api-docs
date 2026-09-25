---
layout: doc
---

# Segment API Documentation

Segment management endpoints for creating, updating, and managing subscriber segments within email lists, plus the admin-only endpoints for global segments (the segments managed under **Settings > Segments**, used for per-user-group delivery-server routing).

## Create a Segment

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segment.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segment.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list |
| SegmentName | String | Yes | Name of the segment |
| SegmentOperator | String | Yes | Connector between top-level rule **groups**: `and` or `or`. It is **not** applied uniformly to every rule: the connector alternates with nesting depth (see the note below). |
| SegmentRuleField | Array | No | Array of rule field names (old style). Each value must be a known subscriber column, a `CustomField<n>` id, an activity field (`Opens`/`Clicks`), or a `DATE_FORMAT(CustomField<n>, '<format>')` date-grouping wrapper. See the validation note below. |
| SegmentRuleOperator | Array | No | Array of rule operators (old style). Each value must be a recognised operator phrase (e.g. `Contains`, `Equals to`, `Is`, `Is not`, `Is set`, `Between`). See the validation note below. |
| SegmentRuleFilter | Array | No | Array of rule filter values (old style) |
| RulesJson | String | No | Segment rules in JSON format |
| Randomness | Boolean | No | Pick a random audience matching the segment rules. Accepts `true`/`false`/`yes`/`no`/`1`/`0`. Defaults to `false`. Persisted as the `Randomness` key inside the segment's `Options` JSON blob (round-trips via `Segments.Get`). |
| RandomnessAudienceSize | Integer | No | Maximum number of subscribers to pick when `Randomness` is enabled. Non-numeric values silently coerce to `0`. Defaults to `0`. Persisted as the `RandomnessAudienceSize` key inside the segment's `Options` JSON blob. |

::: warning `SegmentRuleField` / `SegmentRuleOperator` are validated
Each `SegmentRuleField` must be a known subscriber column, a `CustomField<n>` id, an activity field (`Opens`/`Clicks`), or a `DATE_FORMAT(CustomField<n>, '<format>')` date-grouping wrapper, and each `SegmentRuleOperator` must be a recognised operator phrase. A value outside those sets returns `Success: false` with `ErrorCode: 5` (`"Invalid segment rule field or operator"`) and no segment is created. This closes a legacy-criteria-builder SQL injection where a crafted rule field reached raw SQL (issue #2720).
:::

::: warning `SegmentOperator` alternates with nesting depth
`SegmentOperator` sets the connector between top-level **groups** in `RulesJson`. It is not applied to every rule uniformly: the connector flips at each level of nesting.

| `SegmentOperator` | Between groups | Inside one group | Inside a sub-group |
|---|---|---|---|
| `and` | AND | **OR** | AND |
| `or` | OR | **AND** | OR |

So `SegmentOperator: "or"` with several rules in a **single** `RulesJson` group ANDs those rules together. To OR a set of rules, put each one in its **own** group. The structure of `RulesJson`, not `SegmentOperator` alone, determines the resolved audience.

Only three levels are evaluated (groups, sub-groups, and their rules); anything nested deeper is ignored by the segment engine. Changing `SegmentOperator` on an existing segment re-resolves its audience in both directions, since the within-group connector flips as well.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segment.create",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "SegmentName": "Active Subscribers",
    "SegmentOperator": "and",
    "RulesJson": "{\"rules\":[{\"field\":\"status\",\"operator\":\"equals\",\"value\":\"active\"}]}",
    "Randomness": true,
    "RandomnessAudienceSize": 500
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SegmentID": 456
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3],
  "ErrorText": ["Missing subscriber list id", "Missing segment name", "Missing segment operator"]
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
2: Missing segment name
3: Missing segment operator
4: List not found or doesn't belong to user
5: Invalid segment rule field or operator (issue #2720)
12: An sms-events rule in RulesJSON is not valid (issue #2742)
```

:::


::: tip Segmenting on SMS behaviour <Badge type="tip" text="New in v6.0.0" />
`RulesJSON` accepts a new leaf type, `sms-events`, alongside the existing ones:

```json
{
  "type": "sms-events",
  "operator": "clicked",
  "value": 1234,
  "time_filter": { "type": "in_last_x_days", "value": 30 },
  "aggregation": { "operator": "at_least", "count": 2 }
}
```

| Field | Values |
|---|---|
| `operator` | `sent`, `not sent`, `delivered`, `not delivered`, `failed`, `not failed`, `clicked`, `not clicked`, `replied`, `not replied`, `opted out`, `not opted out` |
| `value` | An `SMSCampaignID`, or empty for any SMS |
| `time_filter` | `in_last_x_days`, `not_in_last_x_days`, `after`, `before`. `between` and `not_between` only with a campaign `value` |
| `aggregation` | `at_least`, `at_most`, `exactly` with `count`. Only with an empty `value` and no `time_filter`, and not with `opted out`, which has no counter |

These rules are validated when the segment is saved, so an unknown operator, an unsupported combination, a campaign you do not own, or a campaign whose per-recipient detail has passed its retention window is refused with error code `12` rather than saved as a rule that silently matches nobody.

A negative rule naming a specific campaign means "was a recipient of it and did not", not "is not in the matching set", so contacts who never received that campaign do not satisfy "did not click it".

Segment results lag SMS activity by the rollup cycle, about one minute.
:::

## Update a Segment

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segment.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segment.update`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SegmentID | Integer | Yes | ID of the segment to update |
| SegmentName | String | Yes | Name of the segment |
| SubscriberListID | Integer | No | ID of the subscriber list (to move segment). Must be a numeric ID of a list **owned by the authenticated user**, otherwise the update aborts with error code `6`. Non-numeric values (e.g. `12abc`, `0`) are silently ignored and the segment keeps its current list. |
| SegmentOperator | String | No | Connector between top-level rule **groups**: `and` or `or`. It is **not** applied uniformly to every rule: the connector alternates with nesting depth (see the note under `segment.create`). Changing it re-resolves the segment's audience, because the connector *inside* each group flips too. |
| SegmentRuleField | Array | No | Array of rule field names (old style). Each value must be a known subscriber column, a `CustomField<n>` id, an activity field (`Opens`/`Clicks`), or a `DATE_FORMAT(CustomField<n>, '<format>')` date-grouping wrapper. An out-of-set value returns `ErrorCode: [7]` (see below). |
| SegmentRuleOperator | Array | No | Array of rule operators (old style). Each value must be a recognised operator phrase (e.g. `Contains`, `Equals to`, `Is`, `Is not`, `Is set`, `Between`). An out-of-set value returns `ErrorCode: [7]` (see below). |
| SegmentRuleFilter | Array | No | Array of rule filter values (old style) |
| RulesJson | String | No | Segment rules in JSON format |
| Randomness | Boolean | No | Pick a random audience matching the segment rules. Accepts `true`/`false`/`yes`/`no`/`1`/`0`. **When this parameter is omitted (or sent as an empty string) along with `RandomnessAudienceSize`, the segment's existing `Options` value is preserved as-is.** When at least one of the two randomness params is provided, the missing one is read from the segment's existing `Options` blob (no silent reset to defaults). |
| RandomnessAudienceSize | Integer | No | Maximum number of subscribers to pick when `Randomness` is enabled. Non-numeric values silently coerce to `0`. **When this parameter is omitted (or sent as an empty string) along with `Randomness`, the segment's existing `Options` value is preserved as-is.** When at least one of the two randomness params is provided, the missing one is read from the segment's existing `Options` blob. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segment.update",
    "SessionID": "your-session-id",
    "SegmentID": 456,
    "SegmentName": "Updated Active Subscribers",
    "SegmentOperator": "or",
    "Randomness": true,
    "RandomnessAudienceSize": 500
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
  "ErrorCode": [1, 2, 4],
  "ErrorText": ["Missing segment id", "Missing segment name", "Invalid segment id"]
}
```

```txt [Error Codes]
0: Success
1: Missing segment id
2: Missing segment name
4: Invalid segment id
5: Invalid segment operator
6: Invalid subscriber list id
7: Invalid segment rule field or operator (issue #2720)
12: An sms-events rule in RulesJSON is not valid (issue #2742)
```

:::

::: warning `SubscriberListID` ownership
When `SubscriberListID` is supplied, the target list is looked up scoped to the authenticated user. A list belonging to another account is therefore indistinguishable from one that does not exist: both return `Success: false` with `ErrorCode: [6]` and `ErrorText: ["Invalid subscriber list id"]`, and the update aborts before any change is written.

This response is returned with **HTTP 200**, like every other error from this legacy endpoint. Always branch on the `Success` / `ErrorCode` fields in the body, not on the HTTP status.

Non-numeric values (`"12abc"`, `"0"`) fail the numeric guard and are **silently ignored**: no error is raised and the segment keeps its existing list. Ownership of the segment itself is checked separately and reports error code `4` (`Invalid segment id`).
:::

## Copy Segments

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segment.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segments.copy`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceListID | Integer | Yes | ID of the source subscriber list |
| TargetListID | Integer | Yes | ID of the target subscriber list |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segments.copy",
    "SessionID": "your-session-id",
    "SourceListID": 123,
    "TargetListID": 789
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
  "ErrorCode": [1, 2, 4],
  "ErrorText": ["Missing required field"]
}
```

```txt [Error Codes]
0: Success
1: Missing sourcelistid
2: Missing targetlistid
4: Invalid source subscriber id or Invalid target subscriber id
```

:::

## Delete Segments

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Segments.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segments.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Segments  | String | Yes      | Comma-separated list of segment IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segments.delete",
    "SessionID": "your-session-id",
    "Segments": "456,457,458"
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
  "ErrorCode": [1],
  "ErrorText": ["Segment ids are missing"]
}
```

```txt [Error Codes]
0: Success
1: Segment ids are missing
```

:::

## Get Segments

<Badge type="info" text="GET" /> `/api/v1/segments.get`

::: tip API Usage Notes
- Authentication required: User API Key. Admin authentication is also accepted with `Access=admin` and `UserID` (see Admin usage below)
- Required permissions: `Segments.Get`
- v1 REST alias: `GET /api/v1/segments.get`. Legacy access via `/api.php` is also supported
:::

::: tip Admin usage (v5.9.6, #2775)
This command also accepts admin authentication. Pass `AdminAPIKey` (or an admin `SessionID`), `Access=admin`, and `UserID` naming the account to act on; the response is exactly what that account's own API key would receive. Without `Access=admin` the call is treated as a user call, so existing integrations are unaffected. `UserID` is ignored under user authentication. Admin-only error codes: `5001` UserID missing or invalid, `5002` user not found, `5003` user outside the user groups a restricted sub-admin may access. Requires the `User.Edit` privilege when `ADMIN_API_ENFORCE_PRIVILEGES` is on.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `segments.get`          |
| UserID | Integer | Admin only | Account to act on when calling with admin authentication and `Access=admin`. Ignored under user authentication (v5.9.6, #2775) |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SubscriberListID | Integer | Yes | ID of the subscriber list |
| SegmentID | Integer | No | ID of specific segment to retrieve |
| IncludeTotals | Boolean | No | Include total counts (default: true) |
| OrderField | String | No | Field to order by: `SegmentName`, `SegmentID`, `SegmentOperator`, `SubscriberCount`, `SubscriberCountLastCalculatedOn` (default: `SegmentName`) |
| OrderType | String | No | Sort order: `ASC` or `DESC` (default: `DESC`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "segments.get",
    "SessionID": "your-session-id",
    "SubscriberListID": 123,
    "OrderField": "SegmentName",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSegmentCount": 5,
  "Segments": [
    {
      "SegmentID": 456,
      "SegmentName": "Active Subscribers",
      "SegmentOperator": "and",
      "SubscriberCount": 1250,
      "SegmentRules": "...",
      "SegmentRulesJson": "{...}"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": "Missing subscriber list id"
}
```

```txt [Error Codes]
0: Success
1: Missing subscriber list id
```

:::

## Get Global Segments

<Badge type="info" text="GET" /> `/api/v1/global.segments.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required sub-admin privilege: `Settings.Segments`
- v1 REST alias: `GET /api/v1/global.segments.get`. Legacy access via `/api.php` is also supported
:::

A global segment is an admin-managed segment that is not attached to any list or user (`RelOwnerUserID = 0`, `RelListID = 0`). It is what the admin **Settings > Segments** screen manages. Its `Options.UserGroupSettings` map drives per-user-group delivery-server routing at send time: when a recipient matches the segment, the campaign or transactional email of a user in that group is routed through the assigned delivery server.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.segments.get` |
| AdminAPIKey | String | Yes | Admin API key |
| OrderField | String | No | `SegmentName` (default), `SegmentID`, `SegmentOperator`, `SubscriberCount`, `SubscriberCountLastCalculatedOn` |
| OrderType | String | No | `ASC` (default) or `DESC` |

Each returned segment carries the raw `SegmentRules` string, its parsed `RulesArray`, the decoded `Options` object, and a flattened `UserGroupSettings` map (`UserGroupID => DeliveryServerID`, `0` meaning no override). An empty `Options` or `UserGroupSettings` serialises as `[]`, the way PHP encodes an empty array. `SubscriberCount` is the persisted value; global segments are not recounted on read.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d "Command=global.segments.get" \
  -d "AdminAPIKey=your-admin-api-key" \
  -d "OrderField=SegmentID" \
  -d "OrderType=DESC"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSegmentCount": 1,
  "Segments": [
    {
      "SegmentID": "12",
      "RelOwnerUserID": "0",
      "RelListID": "0",
      "SegmentName": "Gmail recipients",
      "SegmentOperator": "and",
      "SegmentRules": "[[EmailAddress]||[Ends with]||[@gmail.com]]",
      "SubscriberCount": "0",
      "SubscriberCountLastCalculatedOn": "0000-00-00 00:00:00",
      "Options": {"UserGroupSettings": {"3": {"DeliveryServerID": 2}}},
      "RulesArray": [{"field": "EmailAddress", "operator": "Ends with", "filter": "@gmail.com"}],
      "UserGroupSettings": {"3": 2}
    }
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
0: Success
99998: Authentication failure (invalid admin API key)
99999: Not enough privileges (sub-admin without Settings.Segments)
```

:::

## Get a Global Segment

<Badge type="info" text="GET" /> `/api/v1/global.segment.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required sub-admin privilege: `Settings.Segments`
- v1 REST alias: `GET /api/v1/global.segment.get`. Legacy access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.segment.get` |
| AdminAPIKey | String | Yes | Admin API key |
| SegmentID | Integer | Yes | ID of the global segment. A segment owned by a user is never returned, even when the ID exists. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d "Command=global.segment.get" \
  -d "AdminAPIKey=your-admin-api-key" \
  -d "SegmentID=12"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Segment": {
    "SegmentID": "12",
    "RelOwnerUserID": "0",
    "RelListID": "0",
    "SegmentName": "Gmail recipients",
    "SegmentOperator": "and",
    "SegmentRules": "[[EmailAddress]||[Ends with]||[@gmail.com]]",
    "SubscriberCount": "0",
    "SubscriberCountLastCalculatedOn": "0000-00-00 00:00:00",
    "Options": {"UserGroupSettings": {"3": {"DeliveryServerID": 2}}},
    "RulesArray": [{"field": "EmailAddress", "operator": "Ends with", "filter": "@gmail.com"}],
    "UserGroupSettings": {"3": 2}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid segment id"
}
```

```txt [Error Codes]
0: Success
1: Missing segment id
2: Invalid segment id (not numeric, not found, or not a global segment)
```

:::

## Create a Global Segment

<Badge type="info" text="POST" /> `/api/v1/global.segment.create`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required sub-admin privilege: `Settings.Segments`
- v1 REST alias: `POST /api/v1/global.segment.create`. Legacy access via `/api.php` is also supported
- Not available when `DEMO_MODE_ENABLED` is on
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.segment.create` |
| AdminAPIKey | String | Yes | Admin API key |
| SegmentName | String | Yes | Name of the global segment |
| SegmentOperator | String | Yes | `and` or `or`. Same alternating-by-depth semantics as `segment.create`. |
| SegmentRules | String | Yes | The rules, in either accepted form (see below). Send it as a **string**. |
| UserGroupSettings | String | No | JSON object mapping `UserGroupID` to `DeliveryServerID`, e.g. `{"3":"2","5":"0"}`. `0` or empty means "no delivery-server override for that group". Every user group must exist and every non-zero delivery server must exist. Send it as a **JSON string**. |

::: warning Send `SegmentRules` and `UserGroupSettings` as JSON strings
`api.php` lower-cases every nested request key recursively. Sending these two parameters as nested form fields or as JSON objects inside a JSON body therefore mangles their keys. Send each one as a single string value; the handler decodes it itself and key case is preserved.
:::

**Accepted `SegmentRules` forms**

1. The stored rule string, exactly what `global.segment.get` returns in `SegmentRules` and what the admin rule builder posts. One rule is `[[Field]||[Operator]||[Filter]]`; top-level rules are joined with `,,,`; rule groups follow a `,::,` separator, each wrapped as `((!...!))` and joined with `,#,`. Activity rules (`Opens`, `Clicks`) use the builder's extended part list.
2. A JSON array in the shape of `RulesArray`: rule objects (`Field`, `Operator`, `Filter`, case-insensitive keys) at the top level, and arrays of rule objects for groups. Example: `[{"Field":"EmailAddress","Operator":"Contains","Filter":"gmail"},[{"Field":"SubscriberID","Operator":"Is greater than","Filter":"10"}]]`.

Either way, every rule field must be a known subscriber column, a `CustomField<n>` id, an activity field, or a `DATE_FORMAT(CustomField<n>, '<format>')` wrapper, and every operator must be a recognised operator phrase (`segments.rulevocabulary.get` returns the exact lists). Activity rules must carry a `Total`/`Any`/`Specific` campaign filter, a recognised times filter, and numeric campaign/times/period values. Anything else is refused with error `5` and nothing is created. This is the same allow-list `segment.create` applies (issue #2720); global segments are evaluated by the same criteria builder.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=global.segment.create" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "SegmentName=Gmail recipients" \
  --data-urlencode "SegmentOperator=and" \
  --data-urlencode 'SegmentRules=[{"Field":"EmailAddress","Operator":"Ends with","Filter":"@gmail.com"}]' \
  --data-urlencode 'UserGroupSettings={"3":"2"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SegmentID": 12
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 6,
  "ErrorText": "Invalid user group id: 999"
}
```

```txt [Error Codes]
0: Success
1: Missing segment name
2: Missing segment operator
3: Missing segment rules
4: Invalid segment operator (must be and/or)
5: Invalid segment rules (unparsable, or a rule field/operator/value outside the allow-list; ErrorText carries the reason)
6: Invalid user group settings (unparsable map, or a user group id that does not exist)
7: Invalid delivery server id
8: Segment could not be created
NOT AVAILABLE IN DEMO MODE.: demo mode is enabled
```

:::

## Update a Global Segment

<Badge type="info" text="POST" /> `/api/v1/global.segment.update`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required sub-admin privilege: `Settings.Segments`
- v1 REST alias: `POST /api/v1/global.segment.update`. Legacy access via `/api.php` is also supported
- Not available when `DEMO_MODE_ENABLED` is on
:::

Only the parameters you send are changed. `UserGroupSettings`, when sent, **replaces** the stored map (send `{}` to clear every assignment); every other key in the segment's `Options` blob is preserved.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.segment.update` |
| AdminAPIKey | String | Yes | Admin API key |
| SegmentID | Integer | Yes | ID of the global segment. A user-owned segment id is refused with error `2`. |
| SegmentName | String | No | New name (empty values are ignored) |
| SegmentOperator | String | No | `and` or `or` |
| SegmentRules | String | No | New rules, either accepted form (see `global.segment.create`) |
| UserGroupSettings | String | No | JSON object `UserGroupID => DeliveryServerID`; replaces the stored map |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=global.segment.update" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "SegmentID=12" \
  --data-urlencode 'UserGroupSettings={"3":"2","5":"0"}'
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
  "ErrorCode": 5,
  "ErrorText": "Invalid segment rule field or operator"
}
```

```txt [Error Codes]
0: Success
1: Missing segment id
2: Invalid segment id (not numeric, not found, or not a global segment)
4: Invalid segment operator
5: Invalid segment rules
6: Invalid user group settings / unknown user group id
7: Invalid delivery server id
NOT AVAILABLE IN DEMO MODE.: demo mode is enabled
```

:::

## Delete Global Segments

<Badge type="info" text="POST" /> `/api/v1/global.segments.delete`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required sub-admin privilege: `Settings.Segments`
- v1 REST alias: `POST /api/v1/global.segments.delete`. Legacy access via `/api.php` is also supported
- Not available when `DEMO_MODE_ENABLED` is on
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `global.segments.delete` |
| AdminAPIKey | String | Yes | Admin API key |
| Segments | String | Yes | Comma-separated global segment IDs. Only rows with `RelOwnerUserID = 0` and `RelListID = 0` are deleted; a user-owned id in the list is ignored. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d "Command=global.segments.delete" \
  -d "AdminAPIKey=your-admin-api-key" \
  -d "Segments=12,13"
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
  "ErrorText": "Invalid segment id"
}
```

```txt [Error Codes]
0: Success
1: Segment ids are missing
2: Invalid segment id (a non-numeric entry in the list)
NOT AVAILABLE IN DEMO MODE.: demo mode is enabled
```

:::

## Get the Segment Rule Vocabulary

<Badge type="info" text="GET" /> `/api/v1/segments.rulevocabulary.get`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Admin callers must pass `Access=admin` (the command is registered user-first so existing user-key calls are unchanged); sub-admins need the `Settings.Segments` privilege
- No user permission is required
- v1 REST alias: `GET /api/v1/segments.rulevocabulary.get`. Legacy access via `/api.php` is also supported
:::

Returns the static vocabulary a rule builder needs: the default subscriber fields with their validation methods and enum values, the operator sets per validation method, the activity fields, and the exact allow-lists (`PhysicalFields`, `AllowedOperators`) that `segment.create`, `segment.update` and `global.segment.*` enforce on rule fields and operators. Custom fields are per install and come from `global.customfields.get` (admin) or `customfields.get` (user).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `segments.rulevocabulary.get` |
| APIKey | String | Conditional | User API key |
| AdminAPIKey | String | Conditional | Admin API key (with `Access=admin`) |
| Access | String | No | `admin` when authenticating with an admin key |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d "Command=segments.rulevocabulary.get" \
  -d "AdminAPIKey=your-admin-api-key" \
  -d "Access=admin"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "DefaultFields": [
    {"CustomFieldID": "SubscriberID", "ValidationMethod": "Numbers"},
    {"CustomFieldID": "EmailAddress", "ValidationMethod": "Email address"},
    {"CustomFieldID": "BounceType", "ValidationMethod": "Enum", "Values": "[[Not Bounced]||[Not Bounced]],,,[[Hard Bounced]||[Hard]],,,[[Soft Bounced]||[Soft]]"}
  ],
  "RuleOperators": [
    {"Name": "Disabled", "Operators": ["Is", "Is not", "Contains", "Does not contain", "Begins with", "Ends with", "Is set", "Is not set"]}
  ],
  "ActivityFields": [{"CustomFieldID": "Opens"}, {"CustomFieldID": "Clicks"}],
  "PhysicalFields": ["SubscriberID", "EmailAddress", "EmailDomain", "BounceType", "SubscriptionStatus", "SubscriptionDate", "SubscriptionIP", "UnsubscriptionDate", "UnsubscriptionIP", "OptInDate", "SubscriptionSource", "SubscriptionSourceRef"],
  "AllowedOperators": ["Contains", "Does not contain", "Begins with", "Ends with", "Equals to", "Is greater than", "Is smaller than", "Is before", "Is after", "Is set", "Is not set", "Is", "Is not", "At most", "At least", "Only", "In the last X days", "Not in the last X days", "In the next X days", "Not in the next X days", "Is exactly X days ago", "Is exactly X days from now", "Between", "Not between"]
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
99998: Authentication failure
99999: Not enough privileges (sub-admin without Settings.Segments)
```

:::
