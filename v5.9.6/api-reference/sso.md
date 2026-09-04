---
layout: doc
---

# SSO API Documentation

Single Sign-On (SSO) source management endpoints for creating, reading, updating, and deleting SSO integration sources, reading their daily usage statistics, and regenerating their signing keys.

## Create an SSO Source

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- `Key1` and `Key2` are returned since v5.9.6 (#2777) so the integration can be finished from the API. Existing fields and error codes are unchanged. Store both keys: they are the cipher and HMAC keys your application uses to sign SSO tokens. They can be re-read later with `sso.get` and replaced with `sso.keys.regenerate`.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sso.create`             |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceName | String | Yes      | Name of the SSO source                |
| SourceCode | String | Yes      | Unique code for the SSO source (alphanumeric, underscores, and hyphens only) |
| SourceDescription | String | No | Description of the SSO source         |
| ExpiresAt | String | No       | Expiration date and time (format: YYYY-MM-DD HH:MM:SS) |
| ValidForSeconds | Integer | Yes | Token validity duration in seconds (must be >= 1) |
| Options   | Object | No       | SSO options configuration             |
| Options.CreateNewUserIfNotExists | String | No | Create new user if not exists (`Enabled` or `Disabled`) |
| Options.PerformLogin | String | No | Perform automatic login (`Enabled` or `Disabled`) |
| Options.ReturnUserData | String | No | Return user data in response (`Enabled` or `Disabled`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sso.create",
    "SessionID": "your-session-id",
    "SourceName": "External Portal",
    "SourceCode": "external_portal_v1",
    "SourceDescription": "SSO integration for external portal",
    "ExpiresAt": "2025-12-31 23:59:59",
    "ValidForSeconds": 3600,
    "Options": {
      "CreateNewUserIfNotExists": "Enabled",
      "PerformLogin": "Enabled",
      "ReturnUserData": "Enabled"
    }
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SSOSourceID": 123,
  "Key1": "base64-encoded-32-byte-key",
  "Key2": "base64-encoded-64-byte-key"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2],
  "ErrorText": ["Missing sourcename", "Missing sourcecode"]
}
```

```txt [Error Codes]
0: Success
1: Missing sourcename
2: Missing sourcecode
4: Invalid sourcecode (must contain only alphanumeric characters, underscores, and hyphens)
5: Invalid expiresat (must be in YYYY-MM-DD HH:MM:SS format)
6: sourcecode already exists
7: Missing validforseconds
8: Invalid validforseconds (must be numeric and >= 1)
```

:::

## Update an SSO Source

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

::: warning Behavior change (v5.9.3, #2352)
`SourceDescription` and `ExpiresAt` are now **preserved** when omitted. In earlier versions, a partial `sso.update` (for example, sending only `SourceID`, `SourceName`, `SourceCode`, and `ValidForSeconds` to rename a source) overwrote both with empty values, silently dropping the description and, more importantly, removing a previously-set `ExpiresAt` token-expiry constraint. Send each field only when you intend to change it; send `ExpiresAt` as an empty string to explicitly clear an expiry.
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sso.update`             |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceID  | Integer | Yes     | ID of the SSO source to update        |
| SourceName | String | Yes      | Name of the SSO source                |
| SourceCode | String | Yes      | Unique code for the SSO source (alphanumeric, underscores, and hyphens only) |
| SourceDescription | String | No | Description of the SSO source         |
| ExpiresAt | String | No       | Expiration date and time (format: YYYY-MM-DD HH:MM:SS) |
| ValidForSeconds | Integer | Yes | Token validity duration in seconds (must be >= 1) |
| Options   | Object | No       | SSO options configuration             |
| Options.CreateNewUserIfNotExists | String | No | Create new user if not exists (`Enabled` or `Disabled`) |
| Options.PerformLogin | String | No | Perform automatic login (`Enabled` or `Disabled`) |
| Options.ReturnUserData | String | No | Return user data in response (`Enabled` or `Disabled`) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sso.update",
    "SessionID": "your-session-id",
    "SourceID": 123,
    "SourceName": "Updated External Portal",
    "SourceCode": "external_portal_v2",
    "SourceDescription": "Updated SSO integration for external portal",
    "ExpiresAt": "2026-12-31 23:59:59",
    "ValidForSeconds": 7200,
    "Options": {
      "CreateNewUserIfNotExists": "Disabled",
      "PerformLogin": "Enabled",
      "ReturnUserData": "Enabled"
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
  "ErrorCode": [9, 10],
  "ErrorText": ["Missing sourceid", "Invalid sourceid"]
}
```

```txt [Error Codes]
0: Success
1: Missing sourcename
2: Missing sourcecode
4: Invalid sourcecode (must contain only alphanumeric characters, underscores, and hyphens)
5: Invalid expiresat (must be in YYYY-MM-DD HH:MM:SS format)
6: sourcecode already exists
7: Missing validforseconds
8: Invalid validforseconds (must be numeric and >= 1)
9: Missing sourceid
10: Invalid sourceid
```

:::

## Delete an SSO Source

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sso.delete`             |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceID  | String | Yes      | ID of the SSO source to delete (can be comma-separated list for multiple deletions) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sso.delete",
    "SessionID": "your-session-id",
    "SourceID": "123"
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing sourceid
```

:::

## Get an SSO Source

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege for sub-administrators: `Settings.SSO`
- Returns the full source record including `Key1` and `Key2`. This is one of three places the key material is returned (with `sso.create` and `sso.keys.regenerate`); `ssosources.get` never includes it.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sso.get`                |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceID  | Integer | Yes     | ID of the SSO source to read          |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sso.get",
    "SessionID": "your-session-id",
    "SourceID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SSOSource": {
    "SourceID": "123",
    "SourceName": "External Portal",
    "SourceCode": "external_portal_v1",
    "SourceDescription": "SSO integration for external portal",
    "CreatedAt": "2026-09-04 10:00:00",
    "UpdatedAt": "2026-09-04 10:00:00",
    "ExpiresAt": "0000-00-00 00:00:00",
    "Key1": "base64-encoded-32-byte-key",
    "Key2": "base64-encoded-64-byte-key",
    "Options": {
      "CreateNewUserIfNotExists": "Enabled",
      "PerformLogin": "Enabled",
      "ReturnUserData": "Disabled",
      "ValidForSeconds": "3600"
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid sourceid"
}
```

```txt [Error Codes]
0: Success
1: Missing sourceid
2: Invalid sourceid (not numeric or no such source)
```

:::

## List SSO Sources

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege for sub-administrators: `Settings.SSO`
- Ordered by `SourceName` ascending. `Key1` and `Key2` are never part of this listing; call `sso.get` for one source to read them.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `ssosources.get`         |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "ssosources.get",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SSOSources": [
    {
      "SourceID": "123",
      "SourceName": "External Portal",
      "SourceCode": "external_portal_v1",
      "SourceDescription": "SSO integration for external portal",
      "CreatedAt": "2026-09-04 10:00:00",
      "UpdatedAt": "2026-09-04 10:00:00",
      "ExpiresAt": "0000-00-00 00:00:00",
      "Options": {
        "CreateNewUserIfNotExists": "Enabled",
        "PerformLogin": "Enabled",
        "ReturnUserData": "Disabled",
        "ValidForSeconds": "3600"
      }
    }
  ],
  "TotalSSOSources": 1
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998,
  "ErrorMessage": "Invalid API key"
}
```

```txt [Error Codes]
0: Success
```

:::

## Get SSO Source Statistics

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege for sub-administrators: `Settings.SSO`
- Returns one entry per calendar day for the last `Days` days ending today, newest first, with days that saw no activity zero-filled. This is the same window the admin SSO edit screen renders.
- `Days` defaults to 30 and is clamped to the range 1 to 365. A non-numeric value falls back to 30.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sso.stats.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceID  | Integer | Yes     | ID of the SSO source                  |
| Days      | Integer | No      | Number of days to return (default 30, clamped to 1..365) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sso.stats.get",
    "SessionID": "your-session-id",
    "SourceID": 123,
    "Days": 7
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SourceID": 123,
  "Days": 7,
  "Stats": [
    { "Date": "2026-09-04", "SuccessfulData": 12, "FailedData": 1, "Logins": 10, "SignUps": 2 },
    { "Date": "2026-09-03", "SuccessfulData": 0, "FailedData": 0, "Logins": 0, "SignUps": 0 },
    { "Date": "2026-09-02", "SuccessfulData": 4, "FailedData": 0, "Logins": 4, "SignUps": 0 },
    { "Date": "2026-09-01", "SuccessfulData": 0, "FailedData": 0, "Logins": 0, "SignUps": 0 },
    { "Date": "2026-08-31", "SuccessfulData": 0, "FailedData": 0, "Logins": 0, "SignUps": 0 },
    { "Date": "2026-08-30", "SuccessfulData": 0, "FailedData": 0, "Logins": 0, "SignUps": 0 },
    { "Date": "2026-08-29", "SuccessfulData": 1, "FailedData": 2, "Logins": 1, "SignUps": 0 }
  ],
  "Totals": { "SuccessfulData": 17, "FailedData": 3, "Logins": 15, "SignUps": 2 }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid sourceid"
}
```

```txt [Error Codes]
0: Success
1: Missing sourceid
2: Invalid sourceid (not numeric or no such source)
```

:::

## Regenerate SSO Source Keys

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privilege for sub-administrators: `Settings.SSO`
- Mints a new `Key1` (32 bytes) and `Key2` (64 bytes) pair exactly as `sso.create` does, stores them, updates `UpdatedAt`, and returns both. Tokens signed with the previous keys stop validating immediately, so update the integrating application first or during a maintenance window.
- Not available in demo mode.
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `sso.keys.regenerate`    |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SourceID  | Integer | Yes     | ID of the SSO source whose keys are replaced |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sso.keys.regenerate",
    "SessionID": "your-session-id",
    "SourceID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SSOSourceID": 123,
  "Key1": "base64-encoded-32-byte-key",
  "Key2": "base64-encoded-64-byte-key"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Invalid sourceid"
}
```

```txt [Error Codes]
0: Success
1: Missing sourceid
2: Invalid sourceid (not numeric or no such source)
3: Key regeneration failed
NOT AVAILABLE IN DEMO MODE.: returned as ErrorCode when DEMO_MODE_ENABLED is on
```

:::
