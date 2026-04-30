---
layout: doc
---

# Suppression List API Documentation

Suppression list management endpoints for browsing, importing, deleting, and aggregating email addresses from the suppression list.

The `SuppressionSource` column is a fixed enumeration. The valid values are:

- `Administrator`
- `User`
- `SPAM complaint`
- `Hard Bounced`
- `Unsubscribe`

## Browse Suppression List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.browse`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SearchPattern | String | No   | Search pattern for filtering email addresses (supports `*` wildcard). When supplied, `TotalRecords` reflects the filtered count. |
| SuppressionSource | String | No | Restrict results to one or more sources. Comma-separated list of `SuppressionSource` ENUM values (e.g. `Hard Bounced,SPAM complaint`). |
| StartFrom | Integer | No      | Starting record index for pagination (default: 0) |
| RetrieveCount | Integer | No  | Number of records to retrieve (default: 100) |

**Response Shape:**

`SuppressedEmails` is an associative map keyed by email address (not a JSON array). Use `Object.values()` (or the equivalent in your language) if you need a list. `TotalRecords` reflects whatever filters (`SearchPattern`, `SuppressionSource`) the request set, so paging math always lines up with the rendered page.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.browse",
    "SessionID": "your-session-id",
    "SearchPattern": "*@example.com",
    "SuppressionSource": "Hard Bounced,SPAM complaint",
    "StartFrom": 0,
    "RetrieveCount": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 12,
  "SuppressedEmails": {
    "user@example.com": {
      "SuppressionID": "1234",
      "RelListID": "0",
      "RelOwnerUserID": "42",
      "EmailAddress": "user@example.com",
      "SuppressionSource": "Hard Bounced",
      "Reason": "Bounce: 550 mailbox unavailable"
    }
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
1: Invalid SuppressionSource value
```

:::

## Suppression Stats

<Badge type="info" text="POST" /> `/api.php`

Returns the total suppression count and a per-source breakdown for the authenticated user. Useful for rendering "Total / Manual / Bounce / Complaint / Unsubscribe" stat strips without fanning out into multiple `suppression.browse` calls. All ENUM values are always present in `BySource` (zero when absent) so typed clients see a stable shape.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.stats`      |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| SearchPattern | String | No   | Optional pattern for filtering by email (supports `*` wildcard). |
| SuppressionSource | String | No | Optional comma-separated list of `SuppressionSource` ENUM values. When supplied, `Total` and `BySource` only reflect those sources. |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.stats",
    "APIKey": "your-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Total": 1240,
  "BySource": {
    "Administrator": 5,
    "User": 312,
    "SPAM complaint": 14,
    "Hard Bounced": 871,
    "Unsubscribe": 38
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
1: Invalid SuppressionSource value
```

:::

## Delete from Suppression List

<Badge type="info" text="POST" /> `/api.php`

Accepts either a single address (legacy) or a bulk payload. The bulk path returns counts and a list of skipped (invalid) addresses.

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.delete`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| EmailAddress | String | No*   | Single email address to remove (legacy single-delete path). |
| EmailAddresses | String | No* | JSON-encoded array of email addresses (bulk path). |
| EmailAddressesBulk | String | No* | Newline-separated email addresses (bulk path). |

\* At least one of `EmailAddress`, `EmailAddresses`, or `EmailAddressesBulk` is required. When any of the bulk parameters is set, the legacy single-address validation is skipped and the response uses the bulk shape (with `TotalDeleted`, `TotalFailed`, `FailedEmailAddresses`).

::: code-group

```bash [Example Request — single]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.delete",
    "SessionID": "your-session-id",
    "EmailAddress": "user@example.com"
  }'
```

```bash [Example Request — bulk]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.delete",
    "APIKey": "your-api-key",
    "EmailAddresses": "[\"a@example.com\",\"b@example.com\"]",
    "EmailAddressesBulk": "c@example.com\nd@example.com"
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
  "TotalDeleted": 4,
  "TotalFailed": 0,
  "FailedEmailAddresses": []
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
1: Missing input — none of EmailAddress, EmailAddresses, or EmailAddressesBulk was provided
2: Invalid email address (single path), email not in suppression list (single path), or invalid JSON in EmailAddresses
```

:::

## Import to Suppression List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key or Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `suppression.import`     |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| EmailAddresses | String | No* | JSON-encoded array of email addresses to import |
| EmailAddressesBulk | String | No* | Newline-separated list of email addresses to import |
| SuppressionSource | String | No | Override the source recorded for imported rows. Must be one of the `SuppressionSource` ENUM values. Defaults to `User`. |
| Reason | String | No | Override the reason recorded for imported rows. Capped at 250 characters. Defaults to `Suppression List Import`. |

\* **Note:** Either `EmailAddresses` or `EmailAddressesBulk` must be provided. Both can be provided simultaneously.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.import",
    "SessionID": "your-session-id",
    "EmailAddresses": "[\"user1@example.com\", \"user2@example.com\"]",
    "EmailAddressesBulk": "user3@example.com\nuser4@example.com\nuser5@example.com",
    "SuppressionSource": "Hard Bounced",
    "Reason": "Imported from bounce log 2026-04-30"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalImported": 5,
  "TotalFailed": 0,
  "FailedEmailAddresses": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing EmailAddresses parameter
2: Missing EmailAddressesBulk parameter or invalid EmailAddresses format (both parameters are missing or EmailAddresses JSON is invalid)
3: Invalid SuppressionSource value
```

:::
