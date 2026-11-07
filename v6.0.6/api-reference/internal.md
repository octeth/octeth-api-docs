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
- The OCRID may also be a journey identifier, minted for clicks in journeys with S2S postback tracking on. Its conversion is credited to the journey, the Send Email action and the email gateway queue row (`RelJourneyID`, `RelActionID`, `RelQueueID`, `AttributionSource` `gateway`), and journey identifiers are always signed
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
6: OCRID signature is invalid
7: Conversion value is not a number within the accepted range
8: Conversion could not be recorded
9: Journey, action or queue record does not match the identifier
```

:::

## Notify the Reviewer of a Submitted Account Review <Badge type="tip" text="New in v6.0.6" />

<Badge type="info" text="POST" /> `/api.php` (legacy)

Emails the alert address (`ALERT_RECIPIENT_EMAIL`) the answers an account gave in the account review questionnaire of the new user interface, with a link to the account, through the install's system email settings. The new user interface calls it when a customer first submits the questionnaire, and at most once a day after that. See [Reviewing New Accounts](../new-user-interface/staff-account-review).

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privileges: `User.Edit`
- Only the new user interface's own container may call it. A call from any other address is refused with error 4.
- Not available to admin agent keys
- One notice per account per 24 hours. A call inside that window sends nothing and returns `Sent: false`.
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| Command   | String  | Yes      | API command: `admin.accountreview.notify` |
| AdminAPIKey | String | Yes     | Admin API key |
| UserID    | Integer | Yes      | The account that submitted its answers |
| Answers   | String  | Yes      | A JSON-encoded list of at most 50 objects, each with a string `label` (at most 255 characters) and a string `value` (at most 5,000 characters). An empty list `[]` is accepted. Labels and values are plain text: they are HTML-escaped into the email |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=admin.accountreview.notify" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "UserID=42" \
  --data-urlencode 'Answers=[{"label":"Company or organization name","value":"Acme Inc."},{"label":"Industry","value":"Ecommerce and retail"}]'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Sent": true
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorText": "This command is only available to the new user interface"
}
```

```txt [Error Codes]
0: Success. Sent is false when a notice for this account went out in the last 24 hours
1: UserID missing or not a positive integer
2: User not found
3: Answers missing or not a valid list of label and value pairs
4: Not called from the new user interface
5: The notification email could not be sent
5003: The account is outside the user groups this admin may access
```

:::

## Pull Approved Accounts for the Approval Email <Badge type="tip" text="New in v6.0.6" />

<Badge type="info" text="POST" /> `/api.php` (legacy)

Returns the accounts that moved from `Untrusted` to `Trusted` since the last call, oldest first, and removes them from the queue. `user.update` queues every such change. The new user interface calls it every minute and emails the accounts that submitted a review application. See [Reviewing New Accounts](../new-user-interface/staff-account-review#the-approval-email).

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required privileges: `User.Edit`
- Only the new user interface's own container may call it, because a returned entry is gone. A call from any other address is refused with error 4.
- Not available to admin agent keys
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description |
|-----------|---------|----------|-------------|
| Command   | String  | Yes      | API command: `admin.accountreview.approvals.pull` |
| AdminAPIKey | String | Yes     | Admin API key |
| Limit     | Integer | No       | How many entries to return, from 1 to 200. Default 50 |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  --data-urlencode "Command=admin.accountreview.approvals.pull" \
  --data-urlencode "AdminAPIKey=your-admin-api-key" \
  --data-urlencode "Limit=100"
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Approvals": [
    {
      "UserID": 42,
      "ApprovedAt": 1794571200
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Limit must be a whole number from 1 to 200"
}
```

```txt [Error Codes]
0: Success. ApprovedAt is a Unix timestamp
1: Limit is not a whole number from 1 to 200
4: Not called from the new user interface
5: The approval queue could not be read
```

:::
