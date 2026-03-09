---
layout: doc
---

# Suppression List API Documentation

Suppression list management endpoints for browsing, importing, and deleting email addresses from the suppression list.

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
| SearchPattern | String | No   | Search pattern for filtering email addresses (supports * wildcard) |
| StartFrom | Integer | No      | Starting record index for pagination (default: 0) |
| RetrieveCount | Integer | No  | Number of records to retrieve (default: 100) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.browse",
    "SessionID": "your-session-id",
    "SearchPattern": "*@example.com",
    "StartFrom": 0,
    "RetrieveCount": 50
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 150,
  "SuppressedEmails": [
    {
      "EmailAddress": "user@example.com",
      "SuppressionSource": "User",
      "Reason": "Unsubscribed",
      "DateAdded": "2025-01-15 10:30:00"
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

## Delete from Suppression List

<Badge type="info" text="POST" /> `/api.php`

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
| EmailAddress | String | Yes   | Email address to remove from suppression list |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.delete",
    "SessionID": "your-session-id",
    "EmailAddress": "user@example.com"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing EmailAddress
2: Invalid email address or email address not found in suppression list
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

\* **Note:** Either `EmailAddresses` or `EmailAddressesBulk` must be provided. Both can be provided simultaneously.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "suppression.import",
    "SessionID": "your-session-id",
    "EmailAddresses": "[\"user1@example.com\", \"user2@example.com\"]",
    "EmailAddressesBulk": "user3@example.com\nuser4@example.com\nuser5@example.com"
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
```

:::
