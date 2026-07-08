---
layout: doc
---

# SMS Suppression API Documentation

SMS suppression list management endpoints for browsing, adding, deleting, and aggregating phone numbers (and wildcard patterns) suppressed at the user or list level.

The `Reason` column is a fixed enumeration. The valid values are:

- `manual`
- `optout`
- `complaint`
- `bounce`
- `invalid`
- `other`

The `Source` column is a fixed enumeration. The valid values are:

- `manual_entry`
- `import`
- `api`
- `optout_link`

The `Level` column is a fixed enumeration. The valid values for user-authenticated calls are:

- `user`
- `list` (requires `ListID`)

Admin-authenticated calls (`smssuppression.add`, `smssuppression.patterns.add`) may additionally pass `system` to create system-wide suppressions.

Phone numbers must be in E.164 format with a leading `+` (e.g. `+15551234567`). Patterns use `*` as a wildcard (e.g. `+1555*` blocks all numbers starting with `+1555`).

## Browse SMS Suppression List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.browse`  |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Level | String | No | Suppression level to query. One of `user` (default), `list`. |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the authenticated user. |
| Reason | String | No | Filter by `Reason` ENUM value. |
| SearchPattern | String | No | Substring match against `PhoneNumber` and `Notes` (always a contains search; no wildcard syntax — pass the literal value to look for). |
| IsPattern | Integer | No | When `1`, only return wildcard pattern entries. When `0`, only return exact-match entries. |
| StartFrom | Integer | No | Starting record index for pagination (default: `0`). |
| RetrieveCount | Integer | No | Number of records to retrieve (default: `100`, max: `1000`). |

\* `ListID` is required only when `Level=list`.

**Response Shape:**

`Suppressions` is a JSON array of suppression rows, ordered by `CreatedAt DESC`. `TotalRecords` reflects the filtered count, so paging math always lines up with the rendered page.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.browse",
    "APIKey": "your-api-key",
    "Level": "user",
    "Reason": "bounce",
    "SearchPattern": "+1555",
    "StartFrom": 0,
    "RetrieveCount": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 1,
  "Suppressions": [
    {
      "SuppressionID": "1",
      "SuppressionType": "user",
      "RelUserID": "1",
      "RelListID": null,
      "PhoneNumber": "+15551234567",
      "PhoneNumberNormalized": "15551234567",
      "IsPattern": "0",
      "Reason": "bounce",
      "Source": "api",
      "Notes": "Hard bounce",
      "AddedByUserID": "1",
      "AddedByAdminID": null,
      "CreatedAt": "2026-04-30 14:27:45",
      "UpdatedAt": "2026-04-30 14:27:45"
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
1: Invalid Level value
2: Missing ListID when Level=list
3: ListID does not belong to the authenticated user
4: Invalid Reason value
```

:::

## SMS Suppression Stats

<Badge type="info" text="POST" /> `/api.php`

Returns the total count and a per-type / per-reason breakdown for the authenticated user. All ENUM values are always present in `ByType` and `ByReason` (zero when absent) so typed clients see a stable shape.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.stats`   |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Level | String | No | Optional `Level` filter. One of `user`, `list`. |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the authenticated user. |

\* `ListID` is required only when `Level=list`.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.stats",
    "APIKey": "your-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Total": 1240,
  "ByType": {
    "System": 0,
    "User": 1100,
    "List": 140
  },
  "Patterns": 12,
  "ByReason": {
    "Manual": 5,
    "Optout": 312,
    "Complaint": 14,
    "Bounce": 871,
    "Invalid": 0,
    "Other": 38
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
1: Invalid Level value
2: Missing ListID when Level=list
3: ListID does not belong to the authenticated user
```

:::

## Add to SMS Suppression List

<Badge type="info" text="POST" /> `/api.php`

Accepts a single phone number or a bulk payload. Phone numbers may be exact (e.g. `+15551234567`) or patterns (containing `*`). Pattern detection happens automatically — `+1555*` is stored as a pattern and matched at SMS send-time.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- When using both auth types simultaneously, pass `Access=user` to disambiguate
- System-wide entries (`Level=system`) require Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.add`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| AdminAPIKey | String | No | Admin API key for authentication      |
| Access | String | No | When the request bears both admin and user credentials, set to `user` or `admin` to choose the authentication path. |
| PhoneNumber | String | No* | Single phone number to add (E.164 format with `+`). |
| PhoneNumbers | String | No* | JSON-encoded array of phone numbers, **or** newline-separated phone numbers. |
| Level | String | No | One of `user` (default), `list`. Admin auth may also pass `system`. |
| UserID | Integer | No* | Target user ID. Required when admin-authed and `Level` is `user` or `list`. Ignored for user-authed calls (always the authenticated user). |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the target user (this applies to both user and admin auth — the list's `RelOwnerUserID` must equal the supplied or authenticated `UserID`). |
| Reason | String | No | One of the `Reason` ENUM values. Defaults to `manual`. |
| Source | String | No | One of the `Source` ENUM values. Defaults to `api`. |
| Notes | String | No | Free-text notes attached to the entry. |

\* At least one of `PhoneNumber` or `PhoneNumbers` is required. `UserID` and `ListID` are conditional on `Level` and auth context.

::: code-group

```bash [Example Request — single]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.add",
    "APIKey": "your-api-key",
    "Access": "user",
    "PhoneNumber": "+15551234567",
    "Level": "user",
    "Reason": "bounce",
    "Notes": "Hard bounce"
  }'
```

```bash [Example Request — bulk JSON]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.add",
    "APIKey": "your-api-key",
    "Access": "user",
    "PhoneNumbers": "[\"+15552223333\",\"+15554445555\"]",
    "Level": "user"
  }'
```

```bash [Example Request — bulk newline]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.add",
    "APIKey": "your-api-key",
    "Access": "user",
    "PhoneNumbers": "+15552223333\n+15554445555",
    "Level": "user"
  }'
```

```json [Success Response — single]
{
  "Success": true,
  "ErrorCode": 0,
  "SuppressionID": 42
}
```

```json [Success Response — bulk]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalAdded": 2,
  "TotalFailed": 1,
  "FailedPhoneNumbers": ["not-a-phone"]
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
1: Missing input — neither PhoneNumber nor PhoneNumbers was provided
2: Invalid Level value (or Level=system attempted with user auth)
3: Missing UserID (admin-authed only, when Level is user or list)
4: Missing ListID when Level=list
5: ListID does not belong to the target user (or does not exist)
6: Invalid Reason value
7: Invalid Source value
8: Add failed (single path — see server log; typically an invalid phone number)
9: PhoneNumbers parsed to an empty list
10: Target UserID does not exist (admin-authed only)
```

:::

## Delete from SMS Suppression List

<Badge type="info" text="POST" /> `/api.php`

Accepts either a single suppression ID or a bulk payload of IDs. Only entries owned by the authenticated user (and not `system`-level) can be deleted.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.delete`  |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SuppressionID | Integer | No* | Single SuppressionID to remove. |
| SuppressionIDs | String | No* | JSON-encoded array of SuppressionIDs to remove. |

\* At least one of `SuppressionID` or `SuppressionIDs` is required. When `SuppressionIDs` is set, the response uses the bulk shape (with `TotalDeleted`, `TotalFailed`, `FailedSuppressionIDs`).

::: code-group

```bash [Example Request — single]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.delete",
    "APIKey": "your-api-key",
    "SuppressionID": 42
  }'
```

```bash [Example Request — bulk]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.delete",
    "APIKey": "your-api-key",
    "SuppressionIDs": "[42, 43, 44]"
  }'
```

```json [Success Response — single]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Success Response — bulk]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalDeleted": 2,
  "TotalFailed": 1,
  "FailedSuppressionIDs": [44]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
0: Success
1: Missing input — neither SuppressionID nor SuppressionIDs was provided
2: Invalid SuppressionID (single path)
3: Suppression not found, is system-level, or does not belong to the authenticated user (single path)
4: Removal failed (single path — see server log)
5: SuppressionIDs JSON could not be decoded as a non-empty array
```

:::

## Browse SMS Suppression Patterns

<Badge type="info" text="POST" /> `/api.php`

Returns wildcard pattern entries (numbers containing `*`) owned by the authenticated user. Useful for rendering a dedicated "patterns" tab without filtering through the full `smssuppression.browse` payload.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.patterns.browse` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Level | String | No | Optional level filter. One of `user`, `list`. When omitted, returns all patterns owned by the user. |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the authenticated user. |

\* `ListID` is required only when `Level=list`.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.patterns.browse",
    "APIKey": "your-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Patterns": [
    {
      "SuppressionID": "4",
      "SuppressionType": "user",
      "RelUserID": "1",
      "RelListID": null,
      "PhoneNumber": "+1555*",
      "PhoneNumberNormalized": "+1555*",
      "IsPattern": "1",
      "Reason": "manual",
      "Source": "api",
      "Notes": "",
      "AddedByUserID": "1",
      "AddedByAdminID": null,
      "CreatedAt": "2026-04-30 14:27:55",
      "UpdatedAt": "2026-04-30 14:27:55",
      "ListName": null
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
1: Invalid Level value
2: Missing ListID when Level=list
3: ListID does not belong to the authenticated user
```

:::

## Add SMS Suppression Pattern

<Badge type="info" text="POST" /> `/api.php`

Adds a single wildcard pattern entry. The class auto-detects pattern entries by the presence of `*` — passing a non-pattern phone number will create an exact-match suppression instead. Reason is hardcoded to `manual` for parity with the Octeth UI; use `smssuppression.add` if you need a different `Reason`.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- When using both auth types simultaneously, pass `Access=user` to disambiguate
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.patterns.add` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| AdminAPIKey | String | No | Admin API key for authentication      |
| Access | String | No | Choose `user` or `admin` when both credentials are supplied. |
| PhoneNumber | String | Yes | Pattern (e.g. `+1555*`). |
| Level | String | No | One of `user` (default), `list`. Admin auth may also pass `system`. |
| UserID | Integer | No* | Target user ID. Required when admin-authed and `Level` is `user` or `list`. |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the target user (applies to both user and admin auth). |
| Source | String | No | One of the `Source` ENUM values. Defaults to `api`. |
| Notes | String | No | Free-text notes attached to the entry. |

\* `UserID` and `ListID` are conditional on `Level` and auth context.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.patterns.add",
    "APIKey": "your-api-key",
    "Access": "user",
    "PhoneNumber": "+1555*",
    "Level": "user",
    "Notes": "Block all 1-555 numbers"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SuppressionID": 42
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [7]
}
```

```txt [Error Codes]
0: Success
1: Missing PhoneNumber
2: Invalid Level value (or Level=system attempted with user auth)
3: Missing UserID (admin-authed only, when Level is user or list)
4: Missing ListID when Level=list
5: ListID does not belong to the target user (or does not exist)
6: Invalid Source value
7: Add failed (see server log; typically an invalid pattern format)
8: Target UserID does not exist (admin-authed only)
```

:::

## Delete SMS Suppression Pattern

<Badge type="info" text="POST" /> `/api.php`

Removes pattern entries by `SuppressionID`. Functionally identical to `smssuppression.delete` — provided as a separate endpoint for consistency with the patterns namespace.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.patterns.delete` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SuppressionID | Integer | No* | Single SuppressionID to remove. |
| SuppressionIDs | String | No* | JSON-encoded array of SuppressionIDs to remove. |

\* At least one of `SuppressionID` or `SuppressionIDs` is required.

::: code-group

```bash [Example Request — single]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.patterns.delete",
    "APIKey": "your-api-key",
    "SuppressionID": 42
  }'
```

```bash [Example Request — bulk]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.patterns.delete",
    "APIKey": "your-api-key",
    "SuppressionIDs": "[42, 43]"
  }'
```

```json [Success Response — single]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Success Response — bulk]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalDeleted": 2,
  "TotalFailed": 0,
  "FailedSuppressionIDs": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
0: Success
1: Missing input — neither SuppressionID nor SuppressionIDs was provided
2: Invalid SuppressionID (single path)
3: Suppression not found, is system-level, or does not belong to the authenticated user (single path)
4: Removal failed (single path — see server log)
5: SuppressionIDs JSON could not be decoded as a non-empty array
```

:::
