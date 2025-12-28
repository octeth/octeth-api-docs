---
layout: doc
---

# Internal API Documentation

Internal API endpoints for system operations, bounce processing, and server-to-server communications. These endpoints are typically used by internal services and infrastructure components.

## Register Bounce Email

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- No authentication required
- This endpoint is designed for internal bounce processing systems
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter             | Type   | Required | Description                                              |
|-----------------------|--------|----------|----------------------------------------------------------|
| Command               | String | Yes      | API command: `internal.bounce.register`                  |
| SessionID             | String | No       | Session ID obtained from login                           |
| APIKey                | String | No       | API key for authentication                               |
| EmailMessage          | String | Yes      | Raw bounce email message content (RFC 822 format)        |
| MailFrom              | String | No       | MAIL FROM envelope address (default: localhost)          |
| PowerMTABounceCategory| String | No       | PowerMTA bounce category classification                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "internal.bounce.register",
    "EmailMessage": "From: MAILER-DAEMON@example.com\r\nTo: sender@example.com\r\n...",
    "MailFrom": "bounce@example.com",
    "PowerMTABounceCategory": "bad-mailbox"
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
  "ErrorCode": 0,
  "ErrorText": "Bounce processing error"
}
```

```txt [Error Codes]
0: Success or processing completed
```

:::

## Register Server-to-Server Conversion Postback

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- No authentication required
- This endpoint is designed for server-to-server conversion tracking
- Tracks conversions from external systems and updates campaign/autoresponder statistics
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                                          |
|-----------|--------|----------|----------------------------------------------------------------------|
| Command   | String | Yes      | API command: `internal.s2spostback.register`                         |
| SessionID | String | No       | Session ID obtained from login                                       |
| APIKey    | String | No       | API key for authentication                                           |
| OCRID     | String | Yes      | Encrypted conversion tracking ID containing user, campaign, subscriber, and list information |
| Channel   | String | No       | Conversion channel name (e.g., "purchase", "signup")                 |
| Value     | Number | No       | Conversion value amount                                              |
| Unit      | String | No       | Conversion value unit (e.g., "USD", "points")                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "internal.s2spostback.register",
    "OCRID": "encrypted_tracking_id_string",
    "Channel": "purchase",
    "Value": 49.99,
    "Unit": "USD"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ocrid": "encrypted_tracking_id_string",
  "ErrorCode": 0,
  "ErrorText": ""
}
```

```json [Error Response]
{
  "Success": false,
  "ocrid": "encrypted_tracking_id_string",
  "ErrorCode": 2,
  "ErrorText": "user is invalid"
}
```

```txt [Error Codes]
0: Success
1: OCRID parameter is missing
2: User is invalid or not found
3: Campaign or autoresponder must be valid (both cannot be invalid)
```

:::
