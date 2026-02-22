---
layout: doc
---

# SSO API Documentation

Single Sign-On (SSO) source management endpoints for creating, updating, and deleting SSO integration sources.

## Create an SSO Source

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
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
  "SSOSourceID": 123
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
