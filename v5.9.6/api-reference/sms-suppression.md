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

Admin-authenticated calls may additionally pass `system`: `smssuppression.add` and `smssuppression.patterns.add` create system-wide suppressions with it, and `smssuppression.browse`, `smssuppression.stats` and `smssuppression.patterns.browse` read them with it (new in v5.9.6).

Phone numbers must be in E.164 format with a leading `+` (e.g. `+15551234567`). Patterns use `*` as a wildcard (e.g. `+1555*` blocks all numbers starting with `+1555`).

## Browse SMS Suppression List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.browse`  |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| AdminAPIKey | String | No | Admin API key (privilege `SMS`). Unlocks the admin behaviour described below. |
| Access | String | No | Set to `admin` when calling with an Admin API Key. |
| Level | String | No | Suppression level to query. One of `user` (default), `list`. Admin auth may also pass `system`. |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the authenticated user (user auth) or to the account named by `UserID` (admin auth). |
| UserID | Integer | No* | Target account. Required under admin auth when `Level` is `user` or `list`; ignored under user auth. |
| Reason | String | No | Filter by `Reason` ENUM value. |
| SearchPattern | String | No | Substring match against `PhoneNumber` and `Notes` (always a contains search with no wildcard syntax: pass the literal value to look for). |
| IsPattern | Integer | No | When `1`, only return wildcard pattern entries. When `0`, only return exact-match entries. |
| StartFrom | Integer | No | Starting record index for pagination (default: `0`). |
| RetrieveCount | Integer | No | Number of records to retrieve (default: `100`, max: `1000`). |

\* `ListID` is required only when `Level=list`. `UserID` is required only under admin auth with `Level=user` or `Level=list`.

**Admin authentication:**

- `Level` additionally accepts `system`, which lists the install-wide suppressions (no `UserID` needed).
- For `Level=user` or `Level=list`, `UserID` names the target account (required). The list named by `ListID` must belong to that account. A restricted sub-admin can only target accounts inside its allowed user groups.
- Additional error codes under admin auth: `5001` UserID missing or invalid, `5002` user not found, `5003` user outside the user groups this admin account may access.

**Response Shape:**

`Suppressions` is a JSON array of suppression rows, ordered by `CreatedAt DESC`. `TotalRecords` reflects the filtered count, so paging math always lines up with the rendered page.

A retrieval failure is never reported as an empty list. If the suppression entries cannot be read, the response is `Success: false` with `ErrorCode: [5]` and no `TotalRecords` / `Suppressions` keys. `Success: true` with `TotalRecords: 0` therefore means the filter genuinely matched nothing (or, for `Level=list`, that the list has no suppressed numbers). It is never a masked error.

::: warning Behavior change in v5.9.3
Before v5.9.3, `Level=list` always returned `Success: true, TotalRecords: 0, Suppressions: []` for every account, because the list owner was resolved from a table that does not exist and the resulting query failure was reported as an empty success. List-level browsing now returns the correct rows, and its `TotalRecords` agrees with `smssuppression.stats` for the same list.

Integrations that treat `TotalRecords: 0` as "empty" must now also handle `Success: false` with `ErrorCode: [5]`.
:::

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

```bash [Example Request (admin, system level)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.browse",
    "AdminAPIKey": "your-admin-api-key",
    "Access": "admin",
    "Level": "system",
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

```json [Retrieval Failure Response]
{
  "Success": false,
  "ErrorCode": [5]
}
```

```txt [Error Codes]
0: Success
1: Invalid Level value
2: Missing ListID when Level=list
3: ListID does not belong to the authenticated user
4: Invalid Reason value
5: Suppression entries could not be retrieved (internal error; the cause is
   written to the application log). Retry; if it persists, contact the operator.
5001: UserID missing or invalid (admin auth, Level=user or Level=list)
5002: User not found (admin auth)
5003: User outside the user groups this admin account may access (admin auth)
```

:::

## SMS Suppression Stats

<Badge type="info" text="POST" /> `/api.php`

Returns the total count and a per-type / per-reason breakdown for the authenticated user (user auth), or for the install or a chosen account (admin auth). All ENUM values are always present in `ByType` and `ByReason` (zero when absent) so typed clients see a stable shape.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.stats`   |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| AdminAPIKey | String | No | Admin API key (privilege `SMS`). Unlocks the admin behaviour described below. |
| Access | String | No | Set to `admin` when calling with an Admin API Key. |
| Level | String | No | Optional `Level` filter. One of `user`, `list`. Admin auth may also pass `system`. |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the authenticated user (user auth) or to the account named by `UserID` (admin auth). |
| UserID | Integer | No* | Target account (admin auth only). Optional; required with `Level=user` or `Level=list`. |

\* `ListID` is required only when `Level=list`.

**Admin authentication:**

- With no `Level` and no `UserID` the figures are **install-wide** (every level, every account), the numbers the admin SMS Suppression screen shows.
- `Level=system` counts the install-wide rows only.
- `UserID` (optional, required with `Level=user` / `Level=list`) scopes the figures to that account. Error codes `5001` / `5002` / `5003` as for `smssuppression.browse`.

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
5001: UserID missing or invalid (admin auth, Level=user or Level=list)
5002: User not found (admin auth)
5003: User outside the user groups this admin account may access (admin auth)
```

:::

## Add to SMS Suppression List

<Badge type="info" text="POST" /> `/api.php`

Accepts a single phone number or a bulk payload. Phone numbers may be exact (e.g. `+15551234567`) or patterns (containing `*`). Pattern detection happens automatically: `+1555*` is stored as a pattern and matched at SMS send-time.

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
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the target user (this applies to both user and admin auth: the list's `RelOwnerUserID` must equal the supplied or authenticated `UserID`). |
| Reason | String | No | One of the `Reason` ENUM values. Defaults to `manual`. |
| Source | String | No | One of the `Source` ENUM values. Defaults to `api`. |
| Notes | String | No | Free-text notes attached to the entry. |

\* At least one of `PhoneNumber` or `PhoneNumbers` is required. `UserID` and `ListID` are conditional on `Level` and auth context.

::: code-group

```bash [Example Request (single)]
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

```bash [Example Request (bulk JSON)]
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

```bash [Example Request (bulk newline)]
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

```json [Success Response (single)]
{
  "Success": true,
  "ErrorCode": 0,
  "SuppressionID": 42
}
```

```json [Success Response (bulk)]
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
1: Missing input: neither PhoneNumber nor PhoneNumbers was provided
2: Invalid Level value (or Level=system attempted with user auth)
3: Missing UserID (admin-authed only, when Level is user or list)
4: Missing ListID when Level=list
5: ListID does not belong to the target user (or does not exist)
6: Invalid Reason value
7: Invalid Source value
8: Add failed (single path, see server log; typically an invalid phone number)
9: PhoneNumbers parsed to an empty list
10: Target UserID does not exist (admin-authed only)
```

:::

## Delete from SMS Suppression List

<Badge type="info" text="POST" /> `/api.php`

Accepts either a single suppression ID or a bulk payload of IDs. Under user auth only entries owned by the authenticated user (and not `system`-level) can be deleted; admin auth widens this, see below.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.delete`  |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| AdminAPIKey | String | No | Admin API key (privilege `SMS`). Unlocks the admin behaviour described below. |
| Access | String | No | Set to `admin` when calling with an Admin API Key. |
| SuppressionID | Integer | No* | Single SuppressionID to remove. |
| SuppressionIDs | String | No* | JSON-encoded array of SuppressionIDs to remove. |

\* At least one of `SuppressionID` or `SuppressionIDs` is required. When `SuppressionIDs` is set, the response uses the bulk shape (with `TotalDeleted`, `TotalFailed`, `FailedSuppressionIDs`).

**Admin authentication:**

- System-level rows are deletable (they were previously refused with `ErrorCode: [3]` under user auth, which is unchanged for user callers).
- Rows of any account are deletable by an unrestricted admin. A restricted sub-admin may only delete rows whose owning account is inside its allowed user groups; other rows fail with `ErrorCode: [3]` (single) or land in `FailedSuppressionIDs` (bulk).

::: code-group

```bash [Example Request (single)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.delete",
    "APIKey": "your-api-key",
    "SuppressionID": 42
  }'
```

```bash [Example Request (bulk)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.delete",
    "APIKey": "your-api-key",
    "SuppressionIDs": "[42, 43, 44]"
  }'
```

```bash [Example Request (admin, system row)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.delete",
    "AdminAPIKey": "your-admin-api-key",
    "Access": "admin",
    "SuppressionID": 42
  }'
```

```json [Success Response (single)]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Success Response (bulk)]
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
1: Missing input: neither SuppressionID nor SuppressionIDs was provided
2: Invalid SuppressionID (single path)
3: Suppression not found, is system-level, or does not belong to the authenticated user (single path, user auth). Under admin auth: not found, or owned by an account outside the user groups this admin account may access
4: Removal failed (single path, see server log)
5: SuppressionIDs JSON could not be decoded as a non-empty array
```

:::

## Browse SMS Suppression Patterns

<Badge type="info" text="POST" /> `/api.php`

Returns wildcard pattern entries (numbers containing `*`) owned by the authenticated user (user auth), or across the install or a chosen account (admin auth). Useful for rendering a dedicated "patterns" tab without filtering through the full `smssuppression.browse` payload.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.patterns.browse` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| AdminAPIKey | String | No | Admin API key (privilege `SMS`). Unlocks the admin behaviour described below. |
| Access | String | No | Set to `admin` when calling with an Admin API Key. |
| Level | String | No | Optional level filter. One of `user`, `list`. When omitted, returns all patterns owned by the user. Admin auth may also pass `system`. |
| ListID | Integer | No* | List ID. Required when `Level=list`. The list must belong to the authenticated user (user auth) or to the account named by `UserID` (admin auth). |
| UserID | Integer | No* | Target account (admin auth only). Optional; required with `Level=user` or `Level=list`. |

\* `ListID` is required only when `Level=list`.

**Admin authentication:**

- With no `Level` and no `UserID` every pattern at every level is returned.
- `Level=system` returns the install-wide patterns only.
- `UserID` (optional, required with `Level=user` / `Level=list`) scopes to that account. Error codes `5001` / `5002` / `5003` as for `smssuppression.browse`.

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
5001: UserID missing or invalid (admin auth, Level=user or Level=list)
5002: User not found (admin auth)
5003: User outside the user groups this admin account may access (admin auth)
```

:::

## Add SMS Suppression Pattern

<Badge type="info" text="POST" /> `/api.php`

Adds a single wildcard pattern entry. The class auto-detects pattern entries by the presence of `*`. Passing a non-pattern phone number will create an exact-match suppression instead. Reason is hardcoded to `manual` for parity with the Octeth UI; use `smssuppression.add` if you need a different `Reason`.

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

Removes pattern entries by `SuppressionID`. Functionally identical to `smssuppression.delete`, provided as a separate endpoint for consistency with the patterns namespace.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.patterns.delete` |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| AdminAPIKey | String | No | Admin API key (privilege `SMS`). Unlocks the admin behaviour described below. |
| Access | String | No | Set to `admin` when calling with an Admin API Key. |
| SuppressionID | Integer | No* | Single SuppressionID to remove. |
| SuppressionIDs | String | No* | JSON-encoded array of SuppressionIDs to remove. |

\* At least one of `SuppressionID` or `SuppressionIDs` is required.

**Admin authentication:**

- System-level rows are deletable (they were previously refused with `ErrorCode: [3]` under user auth, which is unchanged for user callers).
- Rows of any account are deletable by an unrestricted admin. A restricted sub-admin may only delete rows whose owning account is inside its allowed user groups; other rows fail with `ErrorCode: [3]` (single) or land in `FailedSuppressionIDs` (bulk).

::: code-group

```bash [Example Request (single)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.patterns.delete",
    "APIKey": "your-api-key",
    "SuppressionID": 42
  }'
```

```bash [Example Request (bulk)]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.patterns.delete",
    "APIKey": "your-api-key",
    "SuppressionIDs": "[42, 43]"
  }'
```

```json [Success Response (single)]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Success Response (bulk)]
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
1: Missing input: neither SuppressionID nor SuppressionIDs was provided
2: Invalid SuppressionID (single path)
3: Suppression not found, is system-level, or does not belong to the authenticated user (single path, user auth). Under admin auth: not found, or owned by an account outside the user groups this admin account may access
4: Removal failed (single path, see server log)
5: SuppressionIDs JSON could not be decoded as a non-empty array
```

:::

## Clear SMS Suppression Cache

<Badge type="info" text="POST" /> `/api.php`

<Badge type="tip" text="New in v5.9.6" />

Flushes every SMS suppression cache entry in Redis, the "Clear cache" action of the admin SMS Suppression screen. Use it after bulk changes made outside the API (direct database edits, imports) so the send path re-reads the table.

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `SMS`)
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `smssuppression.cache.clear` |
| AdminAPIKey | String | Yes    | Admin API key                         |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smssuppression.cache.clear",
    "AdminAPIKey": "your-admin-api-key"
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
  "ErrorCode": [1],
  "ErrorText": "Cache clear failed, see the server log"
}
```

```txt [Error Codes]
0: Success
1: Cache clear failed (see server log)
```

:::
