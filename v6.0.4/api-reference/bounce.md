---
layout: doc
---

# Bounce Processing API Documentation

Admin-only commands covering the bounce receiver metrics, MTA feedback freshness, the bounce webhook settings, the incoming message spool, manual processing and the bounce pattern set. They back the staff [Bounce processing](/v6.0.4/new-user-interface/staff-bounces) screen. Every command requires the Admin API key or an admin SessionID and the `Bounce` privilege. Since v6.0.2 each command checks `Bounce` in its handler, so a sub-admin without it gets `ErrorCode 99999` even when `ADMIN_API_ENFORCE_PRIVILEGES` is off.

## Get Bounce Receiver Metrics

<Badge type="info" text="POST" /> `/api/v1/bounce.metrics.get`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the live counters shown on the admin Bounce Processing screen plus two per-day history series: the bounce SMTP receiver series (messages, connections, message size) and the bounce-webhook series (hard, soft, unidentified, total). The four counters always cover the last 7 days (`Counters.WindowDays`); `Days` controls the two series only.

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                                 |
|-----------|---------|----------|-----------------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `bounce.metrics.get`                                           |
| AdminAPIKey | String | Yes     | Admin API key                                                               |
| Days      | Integer | No       | History window in days for the two series. Default 30, clamped to 1..365    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.metrics.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.metrics.get",
    "AdminAPIKey": "your-admin-api-key",
    "Days": 7
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Days": 7,
  "Counters": {
    "TotalMessages": 1240,
    "TotalConnectionsMade": 1310,
    "TotalMessageSizeKB": 8120,
    "TotalActiveConnections": 2,
    "WindowDays": 7
  },
  "Metrics": {
    "2026-09-04": { "TotalMessages": 210, "TotalConnections": 220, "TotalMessageSizeKB": 1400 },
    "2026-09-03": { "TotalMessages": 180, "TotalConnections": 190, "TotalMessageSizeKB": 1210 }
  },
  "BounceWebhookMetrics": {
    "Hard": { "2026-09-04": 12, "2026-09-03": 9 },
    "Soft": { "2026-09-04": 4, "2026-09-03": 6 },
    "Unidentified": { "2026-09-04": 1, "2026-09-03": 0 },
    "Total": { "2026-09-04": 17, "2026-09-03": 15 }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Days must be an integer between 1 and 365."
}
```

```txt [Error Codes]
0: Success
1: Days is not numeric
99999: Not enough privileges (sub-admin without Bounce)
```

:::

`Metrics` only contains days that have receiver rows (most recent `Days` of them); `BounceWebhookMetrics` is zero-filled for every day in the window.

## List Spooled Bounce Messages

<Badge type="info" text="POST" /> `/api/v1/bounce.messages.get`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Lists the raw messages the bounce SMTP server kept for manual processing (complaint reports and List-Unsubscribe requests it could not act on automatically). Each entry carries the SMTP envelope and a `MessageID` (the md5 of the spool filename) accepted by `bounce.message.get` and `bounce.message.delete`. Newest first.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                        |
|-------------|--------|----------|------------------------------------|
| Command     | String | Yes      | API command: `bounce.messages.get` |
| AdminAPIKey | String | Yes      | Admin API key                      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.messages.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.messages.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalMessages": 1,
  "Messages": [
    {
      "MessageID": "9f2c1b5a7e0d4c3b8a6f5e4d3c2b1a09",
      "FileName": "20260904_101010_Ab3dE9fGh.eml",
      "ReceivedAt": "2026-09-04 10:10:10",
      "GreetingHost": "mx.example.net",
      "MailFrom": "complaints@example.net",
      "RcptTo": "bounce-abc@bounce.example.com",
      "FileSizeBytes": 4821
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998,
  "ErrorText": "Authentication failed or session expired"
}
```

```txt [Error Codes]
0: Success
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Get a Spooled Bounce Message

<Badge type="info" text="POST" /> `/api/v1/bounce.message.get`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns one spooled message: its envelope and the raw SMTP data, base64 encoded. `MessageID` is resolved by matching against the spool listing; it is never used to build a file path.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                          |
|-------------|--------|----------|------------------------------------------------------|
| Command     | String | Yes      | API command: `bounce.message.get`                    |
| AdminAPIKey | String | Yes      | Admin API key                                        |
| MessageID   | String | Yes      | The `MessageID` returned by `bounce.messages.get`    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.message.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.message.get",
    "AdminAPIKey": "your-admin-api-key",
    "MessageID": "9f2c1b5a7e0d4c3b8a6f5e4d3c2b1a09"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Message": {
    "MessageID": "9f2c1b5a7e0d4c3b8a6f5e4d3c2b1a09",
    "FileName": "20260904_101010_Ab3dE9fGh.eml",
    "ReceivedAt": "2026-09-04 10:10:10",
    "GreetingHost": "mx.example.net",
    "MailFrom": "complaints@example.net",
    "RcptTo": "bounce-abc@bounce.example.com",
    "FileSizeBytes": 4821,
    "MessageBase64": "RnJvbTogY29tcGxhaW50c0BleGFtcGxlLm5ldA0K..."
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "No spooled message matches MessageID."
}
```

```txt [Error Codes]
0: Success
1: MessageID is required
2: No spooled message matches MessageID
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Delete a Spooled Bounce Message

<Badge type="info" text="POST" /> `/api/v1/bounce.message.delete`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
:::

Removes one spooled message without processing it.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                          |
|-------------|--------|----------|------------------------------------------------------|
| Command     | String | Yes      | API command: `bounce.message.delete`                 |
| AdminAPIKey | String | Yes      | Admin API key                                        |
| MessageID   | String | Yes      | The `MessageID` returned by `bounce.messages.get`    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.message.delete \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.message.delete",
    "AdminAPIKey": "your-admin-api-key",
    "MessageID": "9f2c1b5a7e0d4c3b8a6f5e4d3c2b1a09"
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
  "ErrorCode": 2,
  "ErrorText": "No spooled message matches MessageID, or it could not be deleted."
}
```

```txt [Error Codes]
0: Success
1: MessageID is required
2: No spooled message matches MessageID, or the file could not be removed
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Process the Bounce Message Spool

<Badge type="info" text="POST" /> `/api/v1/bounce.messages.process`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
:::

Runs every spooled message through the bounce processor (the same code path the bounce SMTP server and `internal.bounce.register` use), in this request. A message is deleted from the spool only after it was processed successfully. Messages that fail (for example a message that matches no bounce pattern, or one whose campaign no longer exists) stay in the spool and are listed in `Results` with the reason, so they can be inspected with `bounce.message.get` or removed with `bounce.message.delete`.

**Batches (new in v6.0.2).** Processing runs synchronously, so a long spool can outlast an HTTP timeout. Pass `MaxMessages` to process at most that many messages per request, and pass the `Cursor` of each answer as `After` in the next one, until `Remaining` is `0`. A message that failed stays in the spool but is not attempted again in the same drain, and a message spooled after the drain started waits for the next one. Without `MaxMessages` the whole spool is processed and the response has no `Remaining` or `Cursor`, as before. The staff [Bounce processing](/v6.0.4/new-user-interface/staff-bounces) screen drains the spool 25 messages at a time. In a batch answer, `TotalMessages`, `Processed`, `Failed` and `Results` cover the batch only.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                             |
|-------------|--------|----------|-----------------------------------------|
| Command     | String | Yes      | API command: `bounce.messages.process`  |
| AdminAPIKey | String | Yes      | Admin API key                           |
| MaxMessages | Integer | No       | New in v6.0.2. Process at most this many messages, 1 to 500. Absent: the whole spool, as before |
| After       | String  | No       | New in v6.0.2. With `MaxMessages`: the `Cursor` of the previous batch. Absent or empty: start from the newest message. Ignored without `MaxMessages` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.messages.process \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.messages.process",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalMessages": 2,
  "Processed": 1,
  "Failed": 1,
  "Results": [
    {
      "MessageID": "9f2c1b5a7e0d4c3b8a6f5e4d3c2b1a09",
      "FileName": "20260904_101010_Ab3dE9fGh.eml",
      "Success": true,
      "ErrorText": ""
    },
    {
      "MessageID": "1a2b3c4d5e6f708192a3b4c5d6e7f809",
      "FileName": "20260904_090909_Zy8xW7vUt.eml",
      "Success": false,
      "ErrorText": "Bounce type not recognized (code 8)"
    }
  ]
}
```

```bash [Batch Request]
curl -X POST https://example.com/api/v1/bounce.messages.process \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.messages.process",
    "AdminAPIKey": "your-admin-api-key",
    "MaxMessages": 25,
    "After": "1760000400_4_d4e5f6.eml"
  }'
```

```json [Batch Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalMessages": 25,
  "Processed": 24,
  "Failed": 1,
  "Results": [ ... ],
  "Remaining": 40,
  "Cursor": "1760000150_9_a1b2c3.eml"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": "NOT AVAILABLE IN DEMO MODE."
}
```

```txt [Error Codes]
0: Success
1: MaxMessages is not a whole number from 1 to 500
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Process Bounces, Complaints and Opt-Outs Manually

<Badge type="info" text="POST" /> `/api/v1/bounce.process.manual`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
:::

Applies bounce, complaint and opt-out events from a newline-separated text block, the same format the admin Bounce Processing screen's manual box accepts. Each line is one event; fields are comma-separated and trimmed:

| Line format | Effect |
|---|---|
| `bounce,<bounce recipient address>,<hard\|soft>` | Registers a bounce for the subscriber encoded in the `bounce-...@` address (updates bounce status, list and campaign statistics, suppression list) |
| `complaint,<complainant address>` | Adds the address to the global suppression list as a spam complaint |
| `optout,<unsubscribe subject>` | Unsubscribes the subscriber encoded in an `unsubscribe:...` List-Unsubscribe subject |

Blank lines are ignored. Lines that match none of the forms are skipped and reported by line number; nothing is applied for them. This mutates subscriber state in bulk with no confirmation step.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                  |
|-------------|--------|----------|----------------------------------------------|
| Command     | String | Yes      | API command: `bounce.process.manual`         |
| AdminAPIKey | String | Yes      | Admin API key                                |
| Lines       | String | Yes      | Newline-separated event lines (see above)    |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.process.manual \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.process.manual",
    "AdminAPIKey": "your-admin-api-key",
    "Lines": "bounce,bounce-Ab12-Cd34-Ef56-Gh78-Ij90@bounce.example.com,hard\ncomplaint,someone@example.net"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Totals": {
    "Bounces": 1,
    "Complaints": 1,
    "OptOuts": 0,
    "Skipped": 0
  },
  "SkippedLines": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Lines is required."
}
```

```txt [Error Codes]
0: Success
1: Lines is missing or blank
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Get Bounce Detection Patterns

<Badge type="info" text="POST" /> `/api/v1/bounce.patterns.get`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the substring patterns the bounce processor matches against a bounce message body to classify it as a hard or soft bounce, in match order. `Source` is `Database` when custom patterns are stored and `Default` when the shipped built-in set is in effect.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                          |
|-------------|--------|----------|--------------------------------------|
| Command     | String | Yes      | API command: `bounce.patterns.get`   |
| AdminAPIKey | String | Yes      | Admin API key                        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.patterns.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.patterns.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Source": "Database",
  "TotalPatterns": 2,
  "Patterns": [
    { "Rule": "user unknown", "BounceType": "Hard" },
    { "Rule": "mailbox full", "BounceType": "Soft" }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99998,
  "ErrorText": "Authentication failed or session expired"
}
```

```txt [Error Codes]
0: Success
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Replace Bounce Detection Patterns

<Badge type="info" text="POST" /> `/api/v1/bounce.patterns.update`

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off, as the legacy Bounce Processing page did (changed in v6.0.2)
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
- Not available in demo mode
:::

Replaces the whole pattern set atomically. `Patterns` accepts either a list of `{Rule, BounceType}` objects (`BounceType` must be `Hard` or `Soft`) or the admin screen's text format, one `<rule>==><type>` per line, where a type of `hard` (any case) is Hard and anything else is Soft. The replace runs inside one database transaction: if any pattern cannot be written, the previous set is kept unchanged. An empty list is allowed and reverts to the shipped built-in patterns (`Source: Default`).

**Request Body Parameters:**

| Parameter   | Type            | Required | Description                                                                      |
|-------------|-----------------|----------|----------------------------------------------------------------------------------|
| Command     | String          | Yes      | API command: `bounce.patterns.update`                                            |
| AdminAPIKey | String          | Yes      | Admin API key                                                                    |
| Patterns    | Array or String | Yes      | List of `{Rule, BounceType}` objects, or newline-separated `rule==>type` lines. Rules are limited to 255 characters |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/bounce.patterns.update \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "bounce.patterns.update",
    "AdminAPIKey": "your-admin-api-key",
    "Patterns": [
      { "Rule": "user unknown", "BounceType": "Hard" },
      { "Rule": "mailbox full", "BounceType": "Soft" }
    ]
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalPatterns": 2,
  "Patterns": [
    { "Rule": "user unknown", "BounceType": "Hard" },
    { "Rule": "mailbox full", "BounceType": "Soft" }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2,
  "ErrorText": "Line 2: missing the \"==>\" separator between the rule and the bounce type.",
  "Errors": [
    "Line 2: missing the \"==>\" separator between the rule and the bounce type."
  ]
}
```

```txt [Error Codes]
0: Success
1: Patterns is missing
2: Patterns could not be parsed (ErrorText and Errors list every offending line or entry); nothing was changed
3: The transactional replace failed; the previous patterns were kept
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Get Email Gateway Feedback Freshness

<Badge type="info" text="POST" /> `/api/v1/admin.bounce.feedback.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns when the newest delivered, bounced and complained event of email gateway sends arrived, and when the bounce webhook last received a bounce. This is the freshness card the legacy Bounce Processing page showed. An age that keeps growing while gateway sends continue means the feedback pipeline (the MTA accounting post, RabbitMQ, the `emailgateway_events` worker, ClickHouse or the bounce webhook) is broken. Read-only.

Each `*At` field is a Unix time, or `null` when nothing is on record. `EventsAvailable` is `false` when the event store (ClickHouse `eg_events`) could not be read, and the three event times are then `null`. `WebhookAvailable` is `false` when the bounce webhook statistics could not be read. The event store's error text is not returned. The bounce webhook keeps hourly counters, so `LastWebhookBounceAt` is the end of the newest hour with a bounce, capped at `Now`.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                 |
|-------------|--------|----------|---------------------------------------------|
| Command     | String | Yes      | API command: `admin.bounce.feedback.get`    |
| SessionID   | String | No       | Session ID obtained from `admin.login`      |
| AdminAPIKey | String | No       | Admin API key (master or per-sub-admin)     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.bounce.feedback.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.bounce.feedback.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Now": 1760774400,
  "EventsAvailable": true,
  "LastDeliveredAt": 1760774310,
  "LastBouncedAt": 1760773500,
  "LastComplainedAt": null,
  "WebhookAvailable": true,
  "LastWebhookBounceAt": null
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
99999: Not enough privileges (sub-admin without Bounce)
```

:::

## Get the Bounce Webhook Settings

<Badge type="info" text="POST" /> `/api/v1/admin.bounce.webhook.get`

<Badge type="tip" text="New in v6.0.2" />

::: tip API Usage Notes
- Authentication required: Admin API Key or admin SessionID
- Required privilege: `Bounce`, checked even when `ADMIN_API_ENFORCE_PRIVILEGES` is off
- Rate limit: 30 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns what a bounce sender (PowerMTA through Logstash, or fluentd) needs to post bounces to `/system/bounce_webhook`: whether `BOUNCE_WEBHOOK_AUTH_ENABLED` is on, the webhook URL and the signature header. The signature secret itself is returned only with `Reveal`.

::: warning The signature secret is a credential
The secret is derived from `OEMPRO_PASSWORD_SALT` and `ADMIN_API_KEY`, and it also signs Octeth's own calls to its private `/system/*` services. It is returned only when `Reveal` is `1`, every reveal is written to the application log with the AdminID, and a reveal is refused in demo mode. To change it, rotate `ADMIN_API_KEY`, which changes it for every sender already configured.
:::

`SecretAvailable` is `false` when `OEMPRO_PASSWORD_SALT` or `ADMIN_API_KEY` is not set, and a reveal then returns no secret. `WebhookURL` is the endpoint without its query string: the sender adds `?type=pmta` or `?type=fluentd`.

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                                                  |
|-------------|---------|----------|------------------------------------------------------------------------------|
| Command     | String  | Yes      | API command: `admin.bounce.webhook.get`                                      |
| SessionID   | String  | No       | Session ID obtained from `admin.login`                                       |
| AdminAPIKey | String  | No       | Admin API key (master or per-sub-admin)                                      |
| Reveal      | Integer | No       | `1` (or `true`) to include `SignatureSecret`. Any other value leaves it out |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.bounce.webhook.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.bounce.webhook.get",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AuthEnabled": true,
  "SecretAvailable": true,
  "SignatureHeader": "X-Octeth-Signature",
  "WebhookURL": "https://example.com/system/bounce_webhook",
  "Revealed": false
}
```

```json [Reveal Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "AuthEnabled": true,
  "SecretAvailable": true,
  "SignatureHeader": "X-Octeth-Signature",
  "WebhookURL": "https://example.com/system/bounce_webhook",
  "Revealed": true,
  "SignatureSecret": "9f2c1e7a5b3d4f60a8c2e1b7d9f3a5c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4f6"
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
99999: Not enough privileges (sub-admin without Bounce)
NOT AVAILABLE IN DEMO MODE.: a reveal on an install in demo mode
```

:::
