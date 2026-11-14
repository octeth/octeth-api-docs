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

The `admin.sms.suppression.*` commands at the end of this page are the staff equivalents: they list, count, add and remove suppressions across every account and every scope, including the `gateway` scope (an unattributed STOP reply, which suppresses the number for every account on that gateway). They back the staff **Suppression > SMS** screen (new in v6.0.2). The `Source` column can also hold `inbound` (a STOP reply), which the inbound SMS path writes.

## Browse SMS Suppression List

<Badge type="info" text="GET" /> `/api/v1/smssuppression.browse`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- v1 REST alias: `GET /api/v1/smssuppression.browse`. Legacy access via `/api.php` is also supported
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
| PhoneNumber | String | No | Exact number lookup. The value is normalized the same way `smssuppression.add` normalizes a number before storing it, so `+33 6 12 34 56 78` and `+33612345678` return the same row, however either was typed when it was added. Use it to ask whether one number is suppressed: `SearchPattern` is a substring match on the raw `PhoneNumber` column and can miss a number stored with spaces or dashes. Wildcard patterns are not accepted. Omit it and the response is unchanged. *(Added in v6.0.1.)* |
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
6: PhoneNumber is not a valid phone number, or is a wildcard pattern
5: Suppression entries could not be retrieved (internal error; the cause is
   written to the application log). Retry; if it persists, contact the operator.
5001: UserID missing or invalid (admin auth, Level=user or Level=list)
5002: User not found (admin auth)
5003: User outside the user groups this admin account may access (admin auth)
```

:::

## SMS Suppression Stats

<Badge type="info" text="GET" /> `/api/v1/smssuppression.stats`

Returns the total count and a per-type / per-reason breakdown for the authenticated user (user auth), or for the install or a chosen account (admin auth). All ENUM values are always present in `ByType` and `ByReason` (zero when absent) so typed clients see a stable shape.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- v1 REST alias: `GET /api/v1/smssuppression.stats`. Legacy access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api/v1/smssuppression.add`

Accepts a single phone number or a bulk payload. Phone numbers may be exact (e.g. `+15551234567`) or patterns (containing `*`). Pattern detection happens automatically: `+1555*` is stored as a pattern and matched at SMS send-time.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- When using both auth types simultaneously, pass `Access=user` to disambiguate
- System-wide entries (`Level=system`) require Admin API Key
- v1 REST alias: `POST /api/v1/smssuppression.add`. Legacy access via `/api.php` is also supported
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
10: Target UserID does not exist, or is outside the user groups this admin account may access (admin-authed only)
```

:::

## Delete from SMS Suppression List

<Badge type="info" text="POST" /> `/api/v1/smssuppression.delete`

Accepts either a single suppression ID or a bulk payload of IDs. Under user auth only entries owned by the authenticated user (and not `system`-level) can be deleted; admin auth widens this, see below.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- v1 REST alias: `POST /api/v1/smssuppression.delete`. Legacy access via `/api.php` is also supported
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

<Badge type="info" text="GET" /> `/api/v1/smssuppression.patterns.browse`

Returns wildcard pattern entries (numbers containing `*`) owned by the authenticated user (user auth), or across the install or a chosen account (admin auth). Useful for rendering a dedicated "patterns" tab without filtering through the full `smssuppression.browse` payload.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- v1 REST alias: `GET /api/v1/smssuppression.patterns.browse`. Legacy access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api/v1/smssuppression.patterns.add`

Adds a single wildcard pattern entry. The class auto-detects pattern entries by the presence of `*`. Passing a non-pattern phone number will create an exact-match suppression instead. Reason is hardcoded to `manual` for parity with the Octeth UI; use `smssuppression.add` if you need a different `Reason`.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- When using both auth types simultaneously, pass `Access=user` to disambiguate
- v1 REST alias: `POST /api/v1/smssuppression.patterns.add`. Legacy access via `/api.php` is also supported
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
8: Target UserID does not exist, or is outside the user groups this admin account may access (admin-authed only)
```

:::

## Delete SMS Suppression Pattern

<Badge type="info" text="POST" /> `/api/v1/smssuppression.patterns.delete`

Removes pattern entries by `SuppressionID`. Functionally identical to `smssuppression.delete`, provided as a separate endpoint for consistency with the patterns namespace.

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- The command is registered `user,admin`: a request carrying both credentials takes the **user** path unless `Access=admin` is passed. Existing user-key integrations are unaffected.
- v1 REST alias: `POST /api/v1/smssuppression.patterns.delete`. Legacy access via `/api.php` is also supported
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

<Badge type="info" text="POST" /> `/api/v1/smssuppression.cache.clear`

<Badge type="tip" text="New in v5.9.6" />

Flushes every SMS suppression cache entry in Redis, the "Clear cache" action of the admin SMS Suppression screen. Use it after bulk changes made outside the API (direct database edits, imports) so the send path re-reads the table.

::: tip API Usage Notes
- Authentication required: Admin API Key (privilege `SMS`)
- v1 REST alias: `POST /api/v1/smssuppression.cache.clear`. Legacy access via `/api.php` is also supported
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

## Browse SMS Suppressions (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

One page of the suppressed numbers of every account, newest first (`CreatedAt`, then `SuppressionID`), at every scope: `system`, `user` (one account), `list` (one list) and `gateway`. It reads the suppression table directly, so it lists what is stored, not the cached answer of the send path. Patterns are listed by [Browse SMS Suppression Patterns (Admin)](#browse-sms-suppression-patterns-admin).

A sub-admin limited to some user groups gets the system rows and the rows of accounts in those groups. A gateway row belongs to no account, so only administrators without a user group limit get it, and `Gateways` is empty for a limited sub-admin. `UserGroupScoped` says which applies to the caller.

Phone numbers and notes are personal data. The command returns them and logs neither.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.sms.suppression.get` |
| AdminAPIKey | String | No | Admin API key. Or authenticate with an admin `SessionID` |
| Page | Integer | No | Page number, default 1. A value that is not a positive whole number is page 1 |
| RecordsPerPage | Integer | No | Page size, 10 to 100, default 50. A value outside the range is brought into it |
| Number | String | No | Digits found anywhere in the normalized number. Everything but digits is dropped, so `+1 (555)` matches numbers containing `1555` |
| Scope | String | No | `system`, `user`, `list` or `gateway` |
| Account | String | No | A user ID, or the start of a username |
| ListID | Integer | No | Rows of one list |
| GatewayID | Integer | No | Gateway rows of one gateway |
| Reason | String | No | `manual`, `optout`, `complaint`, `bounce`, `invalid` or `other` |
| Source | String | No | The stored source, for example `manual_entry`, `import`, `api`, `optout_link` or `inbound`. Lowercase letters and underscores |
| DateFrom | String | No | Added on or after this date, `YYYY-MM-DD` in UTC |
| DateTo | String | No | Added on or before this date, `YYYY-MM-DD` in UTC, the whole day included |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.sms.suppression.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.sms.suppression.get",
    "AdminAPIKey": "your-admin-api-key",
    "Reason": "optout",
    "Account": "acme",
    "RecordsPerPage": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSuppressions": 1,
  "Page": 1,
  "RecordsPerPage": 50,
  "TotalPages": 1,
  "UserGroupScoped": false,
  "Suppressions": [
    {
      "SuppressionID": 135901,
      "Scope": "user",
      "PhoneNumber": "+15551234567",
      "PhoneNumberNormalized": "15551234567",
      "IsPattern": false,
      "UserID": 42,
      "Username": "acme",
      "UserEmailAddress": "ops@acme.example",
      "ListID": null,
      "ListName": null,
      "GatewayID": null,
      "GatewayName": null,
      "Reason": "optout",
      "Source": "inbound",
      "Notes": "",
      "AddedByAdminID": null,
      "AddedByUserID": null,
      "CreatedAt": "2026-10-17 09:12:44",
      "IsOptOut": true
    }
  ],
  "Gateways": [
    {"GatewayID": 2, "GatewayName": "Primary"}
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
1: Scope is not system, user, list or gateway
2: Reason is not one of the six reasons
3: Source holds something other than lowercase letters and underscores
4: Account is not a user ID or a username of at most 100 characters
5: ListID is not a positive whole number
6: GatewayID is not a positive whole number
7: DateFrom is not a valid YYYY-MM-DD date
8: DateTo is not a valid YYYY-MM-DD date
9: DateFrom is after DateTo
10: The suppressions could not be read (see the error log)
99999: Not enough privileges (sub-admin without SMS or Settings)
```

:::

**Response fields:**

| Field | Type | Description |
|---|---|---|
| TotalSuppressions | Integer | Rows matching the filters and the caller's user group scope |
| Page, RecordsPerPage, TotalPages | Integer | The page returned, its size, and the number of pages (at least 1). A page past the end returns an empty `Suppressions` |
| UserGroupScoped | Boolean | `true` when the caller is limited to user groups, so gateway rows are left out |
| Suppressions | Array | The page, described below |
| Gateways | Array | Every SMS gateway (`GatewayID`, `GatewayName`), for a gateway filter. Empty for a limited sub-admin, or when the gateways could not be read |

Row fields:

- `PhoneNumber` is the number as it was entered, `PhoneNumberNormalized` the form the send path compares.
- `UserID`, `Username` and `UserEmailAddress` are set for `user` and `list` rows. `ListID` and `ListName` are set for `list` rows. `GatewayID` and `GatewayName` are set for `gateway` rows, and a name is `null` when the record no longer exists.
- `IsOptOut` is `true` for the recipient's own opt-out: `Reason` `optout` (a STOP reply or an opt-out link), or any `gateway` row.
- `CreatedAt` is `Y-m-d H:i:s` in UTC.

## SMS Suppression Stats (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.stats`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself
- Rate limit: 100 requests per 60 seconds
:::

The counts of the suppression table across every account, in the caller's reach (the same user group rule as above). `ByScope`, `ByReason` and `OptOuts` count numbers only, so `ByScope` and `ByReason` each add up to `Numbers`; `PatternsByScope` counts the patterns. Every key is present, `0` when no row has it. `OptOuts` counts the numbers that are the recipient's own opt-out.

**Request Body Parameters:** `Command` (`admin.sms.suppression.stats`) and the admin credential. No other parameter.

::: code-group

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Total": 94,
  "Numbers": 86,
  "Patterns": 8,
  "OptOuts": 37,
  "ByScope": {"system": 0, "user": 74, "list": 12, "gateway": 0},
  "ByReason": {"manual": 19, "optout": 37, "complaint": 10, "bounce": 12, "invalid": 8, "other": 0},
  "PatternsByScope": {"system": 0, "user": 8, "list": 0, "gateway": 0},
  "UserGroupScoped": false
}
```

```txt [Error Codes]
0: Success
1: The counts could not be read (see the error log)
99999: Not enough privileges (sub-admin without SMS or Settings)
```

:::

## Add to SMS Suppressions (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.add`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself
- Rate limit: 30 requests per 60 seconds
- Refused in demo mode
:::

Suppresses up to 1,000 numbers at one scope: `system` (every account), `user` (one account) or `list` (one list). There is no `gateway` scope: gateway rows are written only by STOP replies. Each number is normalized and written once. A number already suppressed at that scope is counted as existing and left alone, and an entry that cannot be read as a phone number, or a pattern, is counted as invalid. Patterns have their own command.

A list belongs to one account, so `ListID` alone sets a list row, and the row is written for the list's owner. A sub-admin limited to some user groups can add system rows and rows of accounts in those groups. An account or list outside the groups is answered exactly like one that does not exist.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.sms.suppression.add` |
| Numbers | String or Array | Yes | Phone numbers, one per line, or separated by commas or semicolons. At most 1,000. Spaces inside a number are allowed |
| Scope | String | Yes | `system`, `user` or `list` |
| UserID | Integer | For `user` | The account |
| ListID | Integer | For `list` | The list |
| Reason | String | No | `manual` (default), `optout`, `complaint`, `bounce`, `invalid` or `other` |
| Notes | String | No | At most 1,000 characters |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.sms.suppression.add \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.sms.suppression.add",
    "AdminAPIKey": "your-admin-api-key",
    "Numbers": "+15551234567\n+15559876543",
    "Scope": "list",
    "ListID": 7,
    "Reason": "complaint"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Added": 1,
  "Existing": 1,
  "Invalid": 0,
  "Failed": 0,
  "Scope": "list",
  "UserID": 42,
  "ListID": 7
}
```

```txt [Error Codes]
0: Success
1: Numbers is missing
2: More than 1,000 numbers
3: Scope is not system, user or list
4: UserID is missing or not a positive whole number (user scope)
5: The account does not exist, or is outside the administrator's user groups
6: ListID is missing or not a positive whole number (list scope)
7: The list does not exist, or its account is outside the administrator's user groups
8: Reason is not one of the six reasons
9: Notes is longer than 1,000 characters
99999: Not enough privileges (sub-admin without SMS or Settings)
```

:::

`Failed` counts numbers that could not be saved (see the error log). `UserID` and `ListID` are the account and list the rows were written for, `null` for a system row.

## Delete from SMS Suppressions (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.delete`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself
- Rate limit: 30 requests per 60 seconds
- Refused in demo mode
:::

Removes up to 500 suppressed numbers by ID, and clears the cached answers of each one. Patterns are removed by [Delete SMS Suppression Patterns (Admin)](#delete-sms-suppression-patterns-admin), and an ID of a pattern is counted as not found here.

**A recipient's own opt-out is removed only with `ConfirmOptOuts` set to `1`.** That is a row with `Reason` `optout` (a STOP reply or an opt-out link) or any `gateway` row. Without it, when such a row is among the IDs, the command removes nothing and answers error `3` with the number of opt-outs it found. Removing an opt-out lets messages reach someone who asked for none, which most carriers and many laws forbid without a new consent.

A sub-admin limited to some user groups can remove system rows and rows of accounts in those groups. Any other ID, a gateway row included, is counted in `NotFound`, exactly like an ID that does not exist.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.sms.suppression.delete` |
| SuppressionIDs | String or Array | Yes | IDs, comma-separated or a list, at most 500 |
| ConfirmOptOuts | Integer | No | `1` to remove opt-outs among them |

::: code-group

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Deleted": 3,
  "NotFound": 1,
  "Failed": 0,
  "OptOutsDeleted": 1,
  "DeletedByScope": {"system": 0, "user": 2, "list": 1, "gateway": 0}
}
```

```json [Opt-outs Not Confirmed]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Opt-outs are among these suppressions. Send ConfirmOptOuts=1 to remove them. Nothing was removed.",
  "OptOuts": 1
}
```

```txt [Error Codes]
0: Success
1: SuppressionIDs is missing or holds something other than positive whole numbers
2: More than 500 IDs
3: Opt-outs are among the IDs and ConfirmOptOuts is not 1. Nothing was removed
4: The suppressions could not be read (see the error log)
99999: Not enough privileges (sub-admin without SMS or Settings)
```

:::

## Browse SMS Suppression Patterns (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.patterns.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself
- Rate limit: 100 requests per 60 seconds
:::

One page of the suppression patterns of every account, newest first, with the same user group rule. A pattern such as `+1900*` suppresses every number it matches when a message is sent.

**Request Body Parameters:** `Page`, `RecordsPerPage`, `Number` (digits found anywhere in the pattern), `Scope` (`system`, `user` or `list`), `Account` and `ListID`, as in [Browse SMS Suppressions (Admin)](#browse-sms-suppressions-admin). Other filters are ignored.

**Response:** as Browse SMS Suppressions (Admin), with the total in `TotalPatterns`, the rows in `Patterns` (`IsPattern` is `true` and `PhoneNumber` holds the pattern) and no `Gateways`.

```txt [Error Codes]
0: Success
1: Scope is not system, user or list
4: Account is not a user ID or a username of at most 100 characters
5: ListID is not a positive whole number
10: The patterns could not be read (see the error log)
99999: Not enough privileges (sub-admin without SMS or Settings)
```

## Add SMS Suppression Pattern (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.patterns.add`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself
- Rate limit: 30 requests per 60 seconds
- Refused in demo mode
:::

Adds one pattern at `system`, `user` or `list` scope, with `Reason` `manual`. A pattern is `+`, then digits, with at least one `*` for any run of digits. **It must have at least one digit before the first `*`**: a pattern such as `+*` would match every number on the install and stop all SMS, so it is refused with error `3`. A pattern that already exists at that scope is answered with its ID and `Existing` `true`.

The scope, account and list rules are those of [Add to SMS Suppressions (Admin)](#add-to-sms-suppressions-admin).

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| Command | String | Yes | API command: `admin.sms.suppression.patterns.add` |
| Pattern | String | Yes | For example `+1900*`. Spaces are removed |
| Scope | String | Yes | `system`, `user` or `list` |
| UserID | Integer | For `user` | The account |
| ListID | Integer | For `list` | The list |
| Notes | String | No | At most 1,000 characters |

::: code-group

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SuppressionID": 135950,
  "Existing": false,
  "Scope": "system",
  "UserID": null,
  "ListID": null
}
```

```txt [Error Codes]
0: Success
1: Pattern is missing
2: Pattern is not + followed by digits and at least one *
3: Pattern has no digit before the first *, so it would match every number
4: Scope is not system, user or list
5: UserID is missing or not a positive whole number (user scope)
6: The account does not exist, or is outside the administrator's user groups
7: ListID is missing or not a positive whole number (list scope)
8: The list does not exist, or its account is outside the administrator's user groups
9: Notes is longer than 1,000 characters
10: The pattern could not be saved (see the error log)
99999: Not enough privileges (sub-admin without SMS or Settings)
```

:::

## Delete SMS Suppression Patterns (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.patterns.delete`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself
- Rate limit: 30 requests per 60 seconds
- Refused in demo mode
:::

Removes up to 500 patterns by ID, with the user group rule of [Delete from SMS Suppressions (Admin)](#delete-from-sms-suppressions-admin). An ID of a number is counted as not found here.

**Request Body Parameters:** `SuppressionIDs` (comma-separated or a list, at most 500).

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Deleted": 1,
  "NotFound": 0,
  "Failed": 0,
  "DeletedByScope": {"system": 1, "user": 0, "list": 0, "gateway": 0}
}
```

Error codes: `1` SuppressionIDs is missing or invalid, `2` more than 500 IDs, `4` the patterns could not be read, `99999` not enough privileges.

## Clear SMS Suppression Cache (Admin)

<Badge type="info" text="POST" /> `/api/v1/admin.sms.suppression.cache.clear`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin session
- Required privileges: `SMS` and `Settings`, checked by the command itself
- Rate limit: 10 requests per 60 seconds
- Refused in demo mode
:::

Drops every cached suppression answer of every account, as [Clear SMS Suppression Cache](#clear-sms-suppression-cache) does, but with the privileges of the staff screen. The send path keeps a suppression answer for up to an hour (`SMS_SUPPRESSION_CACHE_TTL`), so use it after changing suppressions outside the API. No suppression changes.

**Request Body Parameters:** `Command` (`admin.sms.suppression.cache.clear`) and the admin credential.

```json [Success Response]
{"Success": true, "ErrorCode": 0, "ErrorText": ""}
```

Error codes: `1` the cache could not be cleared (Redis unavailable or disabled), `99999` not enough privileges.
