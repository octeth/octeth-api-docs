---
layout: doc
---

# SMS Campaign API Documentation

Creating, costing, sending and controlling bulk SMS campaigns, plus the supporting endpoints for gateways, merge tags, saved templates and one-off messages.

## The shape of a campaign

A campaign moves through a fixed set of states, and most endpoints here only accept it in some of them.

| Status | Meaning |
|---|---|
| `Draft` | Being edited. The only status in which a campaign can be changed |
| `Scheduled` | Waiting for its `ScheduledAt` to pass |
| `Queueing` | Its audience is being resolved and queue rows written |
| `Sending` | Rows are being released to the gateway |
| `Paused` | Stopped by a user, or automatically on a cost drift |
| `Cancelling` | Winding down; workers are stopping cleanly |
| `Sent`, `Cancelled`, `Failed` | Final |

The usual sequence is: `smscampaign.create`, then `smscampaign.estimate` and `smscampaign.estimate.get` to obtain a confirmation token, then `smscampaign.send` or `smscampaign.schedule` with that token. `smscampaign.pause`, `.resume` and `.cancel` control it afterwards.

::: warning A campaign cannot be sent without a cost estimate
`smscampaign.send` and `smscampaign.schedule` both require an `EstimateID` and a `ConfirmationToken`, and refuse without them. This is deliberate: it is what guarantees the cost a sender approved is the cost they are charged. Estimating is not an optional preview step, it is part of sending.
:::

## Campaign management

### Create a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.create`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

The campaign is created as a `Draft`. Its list must have a mobile phone number field configured, which `list.sms.settings.update` sets.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.create` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| CampaignName | String | Yes | A name for the campaign |
| ListID | Integer | Yes | The audience list. Must belong to the caller and have a phone field |
| MessageContent | String | Yes | The message body. May contain merge tags from `sms.mergetags.get` |
| GatewayID | Integer | No | The sending gateway. Must be active and assigned to the account |
| SegmentID | Integer | No | Narrow the audience to a segment of that list |
| SenderID | String | No | The sender number or alphanumeric id to send from |
| AppendOptOutFooter | Boolean | No | Append the opt-out footer. Defaults to the account setting |
| OptOutFooterText | String | No | Override the footer text for this campaign |
| Timezone | String | No | The timezone quiet hours are evaluated in |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.create \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.create",
    "SessionID": "your-session-id",
    "CampaignName": "October promotion",
    "ListID": 42,
    "MessageContent": "Hi {FirstName}, 20% off this week only.",
    "GatewayID": 3
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SMSCampaignID": 4821
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 5,
      "Message": "This list has no mobile phone number field configured, so it cannot be an SMS campaign audience."
    }
  ],
  "ErrorCode": 5
}
```

```txt [Error Codes]
0: Success
4: Invalid ListID
5: The list has no mobile phone number field, so it cannot be an SMS audience
7: MessageContent is empty
8: Invalid GatewayID, or the gateway is not available to this account
9: The message is too long for the gateway's concatenation limit
10: The campaign could not be created
11: Invalid SegmentID, or the segment does not belong to this list
```

:::

### Update a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.update`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Only a `Draft` campaign can be updated.** Every update bumps the campaign's modification time and changes its content fingerprint, which invalidates any estimate taken before it: after updating, run the estimate again before sending.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.update` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to update. Must be in `Draft` |
| CampaignName | String | No | A new name |
| MessageContent | String | No | A new message body |
| GatewayID | Integer | No | A different gateway |
| SenderID | String | No | A different sender id |
| AppendOptOutFooter | Boolean | No | Whether to append the opt-out footer |
| OptOutFooterText | String | No | Override the footer text |
| Timezone | String | No | The quiet-hours timezone |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.update \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.update",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821,
    "MessageContent": "Hi {FirstName}, 25% off this week only."
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
  "Errors": [{ "Code": 7, "Message": "The campaign could not be updated, so nothing was changed." }],
  "ErrorCode": 7
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
7: The campaign could not be updated, so nothing was changed
10: The campaign could not be updated as a single transaction, so nothing was changed
```

:::

### Get a Campaign

<Badge type="info" text="GET" /> `/api/v1/smscampaign.get`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.get` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to read |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.get",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Campaign": {
    "SMSCampaignID": 4821,
    "CampaignName": "October promotion",
    "Status": "Sending",
    "StatusReason": "",
    "RelListID": 42,
    "RelGatewayID": 3,
    "MessageContent": "Hi {FirstName}, 20% off this week only.",
    "TotalAudience": 400318,
    "ConfirmedCost": "4315.66000",
    "CostCurrency": "USD"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 2, "Message": "Campaign not found." }],
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing SMSCampaignID parameter
2: Campaign not found
4: The campaign's links could not be read
```

:::

### List Campaigns

<Badge type="info" text="GET" /> `/api/v1/smscampaign.browse`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.browse` |
| SessionID | String | No | Session ID obtained from login |
| Status | String | No | Filter by status. Possible values: `Draft`, `Scheduled`, `Queueing`, `Sending`, `Paused`, `Cancelling`, `Cancelled`, `Sent`, `Failed` |
| ListID | Integer | No | Only campaigns targeting this list |
| RecordsPerRequest | Integer | No | Page size, default 25, clamped to 200 |
| RecordsFrom | Integer | No | Offset, default 0 |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.browse \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.browse",
    "SessionID": "your-session-id",
    "Status": "Sending",
    "RecordsPerRequest": 25
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Campaigns": [
    { "SMSCampaignID": 4821, "CampaignName": "October promotion", "Status": "Sending" }
  ],
  "TotalCampaigns": 1
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 1, "Message": "Invalid Status value." }],
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Invalid Status value
2: The campaign list could not be read
```

:::

### Delete a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.delete`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

A campaign in progress cannot be deleted; cancel it first. Deleting removes its queue rows, links and estimates with it.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.delete` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.delete \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.delete",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821
  }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0 }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 3, "Message": "A campaign in progress cannot be deleted. Cancel it first." }],
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing SMSCampaignID parameter
2: Campaign not found
3: A campaign in progress cannot be deleted; cancel it first
4: The campaign could not be deleted, so nothing was deleted
5: The campaign could not be deleted as a single transaction, so nothing was deleted
```

:::

## Sending

### Send a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.send`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

Starts sending immediately. Requires the `EstimateID` and `ConfirmationToken` from `smscampaign.estimate.get`, and stores the confirmed cost, recipient count and projected completion on the campaign. Nothing is recomputed here: the figures the sender approved are the figures that are stored.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.send` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to send. Must be in `Draft` |
| EstimateID | Integer | Yes | From `smscampaign.estimate` |
| ConfirmationToken | String | Yes | From `smscampaign.estimate.get` |
| SendDeadlineAt | String | No | `YYYY-MM-DD HH:MM:SS`. Stop sending after this moment even if recipients remain |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.send \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.send",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821,
    "EstimateID": 173,
    "ConfirmationToken": "1758377028.8f2c..."
  }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0, "Status": "Queueing" }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 34, "Message": "The campaign changed after it was costed. Run the estimate again." }],
  "ErrorCode": 34
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
4: Missing or invalid EstimateID parameter; run smscampaign.estimate first
9: The campaign could not be sent, so nothing was sent
10: The campaign could not be sent as a single transaction, so nothing was sent
31: The cost estimate could not be read, so nothing was sent
32: Estimate not found for this campaign
33: The estimate has not finished; wait for it or run a new one
34: The campaign changed after it was costed; run the estimate again
35: The confirmation token is invalid or has expired
36: The estimate result is incomplete; run the estimate again
```

:::

### Schedule a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.schedule`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

The same as sending, but at a future moment. The campaign sits in `Scheduled` until `ScheduledAt` passes, then moves to `Queueing` on its own. The confirmation token is required and expires on the same schedule, so schedule promptly after estimating.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.schedule` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to schedule. Must be in `Draft` |
| ScheduledAt | String | Yes | `YYYY-MM-DD HH:MM:SS`, in the campaign's timezone. Must be in the future |
| EstimateID | Integer | Yes | From `smscampaign.estimate` |
| ConfirmationToken | String | Yes | From `smscampaign.estimate.get` |
| SendDeadlineAt | String | No | Stop sending after this moment. Must be after `ScheduledAt` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.schedule \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.schedule",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821,
    "ScheduledAt": "2026-10-01 09:00:00",
    "EstimateID": 173,
    "ConfirmationToken": "1758377028.8f2c..."
  }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0, "Status": "Scheduled" }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 11, "Message": "Missing ScheduledAt parameter." }],
  "ErrorCode": 11
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
4: Missing or invalid EstimateID parameter; run smscampaign.estimate first
9: The campaign could not be scheduled, so nothing was scheduled
10: The campaign could not be scheduled as a single transaction
11: Missing ScheduledAt parameter
31-36: The estimate and token errors listed under smscampaign.send
```

:::

## Lifecycle

### Pause a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.pause`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

Only a `Queueing` or `Sending` campaign can be paused. Pausing stops future releases; messages already handed to the gateway cannot be recalled. Pausing an already-paused campaign is a success rather than an error, because pause is the button people press twice.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.pause` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to pause |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.pause \
  -H "Content-Type: application/json" \
  -d '{ "Command": "smscampaign.pause", "SessionID": "your-session-id", "SMSCampaignID": 4821 }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0, "Status": "Paused" }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 3, "Message": "Only a campaign that is queueing or sending can be paused. This one is Draft." }],
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
2: Campaign not found
3: Only a queueing or sending campaign can be paused
4: The campaign changed status before it could be paused; read it again
```

:::

### Resume a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.resume`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

Returns a paused campaign to the status it was paused from. A campaign paused automatically because its queued cost drifted from the confirmed cost needs `AcknowledgeCost=1`, which is how the sender says they accept the new figure; the response carries the confirmed and drifted costs so they can see what they are accepting.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.resume` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to resume. Must be `Paused` |
| AcknowledgeCost | Integer | No | Pass `1` to resume a campaign paused on cost drift |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.resume \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.resume",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821,
    "AcknowledgeCost": 1
  }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0, "Status": "Sending" }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 4, "Message": "This campaign was paused because its queued cost drifted from the confirmed cost. Pass AcknowledgeCost=1 to resume it anyway." }],
  "ErrorCode": 4,
  "ConfirmedCost": "12.50000",
  "ConfirmedRecipients": 250,
  "CostCurrency": "USD",
  "CostDriftTolerance": 0.05
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
2: Campaign not found
3: Only a Paused campaign can be resumed
4: Paused on cost drift; pass AcknowledgeCost=1 to resume anyway
5: The campaign changed status before it could be resumed; read it again
```

:::

### Cancel a Campaign

<Badge type="info" text="POST" /> `/api/v1/smscampaign.cancel`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

Cancelling returns immediately and does not wait for the send to wind down. A `Draft` campaign goes straight to `Cancelled`; anything already in flight passes through `Cancelling` so the workers can stop cleanly, and its queue rows are still present for a short time afterwards. Cancellation is final: a cancelled campaign cannot be resumed.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.cancel` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign to cancel |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.cancel \
  -H "Content-Type: application/json" \
  -d '{ "Command": "smscampaign.cancel", "SessionID": "your-session-id", "SMSCampaignID": 4821 }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0, "Status": "Cancelling" }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 3, "Message": "This campaign has already finished. It is Sent." }],
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
2: Campaign not found
3: The campaign has already finished
4: The campaign changed status before it could be cancelled; read it again
```

:::

## Cost estimation

::: tip Why the estimate is a job rather than an answer
Measuring a campaign means resolving its audience, removing suppressed, invalid and duplicate numbers, personalizing every message and counting the parts each one will take. For a one-million recipient audience that cannot finish inside a single request, so `smscampaign.estimate` queues the work and returns an id. Poll `smscampaign.estimate.get` until it reports `Done`, then pass the `EstimateID` and `ConfirmationToken` it returns to `smscampaign.send` or `smscampaign.schedule`.

The token is what proves the cost was seen before the campaign was sent. It is signed over the estimate, the campaign and the campaign's content, so editing the campaign after estimating it invalidates the token and the estimate has to be run again. It also expires, after `SMS_CAMPAIGN_ESTIMATE_TOKEN_TTL` seconds (900 by default).

Cost is message parts multiplied by the configured cost per part. No SMS gateway exposes its pricing to the platform, so this is an estimate for planning, not a billing figure.
:::

### Start a Campaign Cost Estimate

<Badge type="info" text="POST" /> `/api/v1/smscampaign.estimate`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

Only a campaign still in `Draft` can be estimated. Requesting an estimate for a campaign that already has an unfinished job for the same content returns that job instead of queueing a second one, so polling clients and double-clicked buttons do not cause the same audience to be measured twice.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.estimate` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign to estimate. Must belong to the authenticated user and be in `Draft` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.estimate \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.estimate",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EstimateID": 173,
  "Status": "Pending",
  "Reused": false
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 3,
      "Message": "Only a draft campaign can be estimated. This one is Sending."
    }
  ],
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
2: Campaign not found
3: The campaign is not a draft, so it cannot be estimated
4: The list could not be read; retry
5: The list has no mobile phone number field, so it cannot receive SMS
6: The estimate could not be started; retry
```

:::

`Reused` is `true` when an unfinished job for this campaign and this exact content already existed and was returned instead of a new one.

### Read a Campaign Cost Estimate

<Badge type="info" text="GET" /> `/api/v1/smscampaign.estimate`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`, including for this read: the confirmation token it returns is what authorizes a spend, so it is not a `SMSCampaigns.Get` capability
- Legacy endpoint access via `/api.php` is also supported (command `smscampaign.estimate.get`)
:::

Poll this until `Status` is `Done` or `Failed`. A `ConfirmationToken` is returned only when the estimate is `Done` **and** the campaign still matches the one that was costed.

"Still matches" is decided on the campaign's content, not only on its modification time. The estimate records a fingerprint of the audience, message, footer and gateway it measured, and that is compared with the campaign as it stands now. A modification time alone would not be enough: it has one second of resolution, so an edit landing in the same second as the measurement would leave the timestamp unchanged while the content it describes had moved on. When the two disagree the response carries `Stale: true` and a `StaleReason`, and no token, so run the estimate again.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.estimate.get` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| SMSCampaignID | Integer | Yes | The campaign the estimate belongs to |
| EstimateID | Integer | Yes | The id returned by `smscampaign.estimate` |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smscampaign.estimate \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.estimate.get",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821,
    "EstimateID": 173
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EstimateID": 173,
  "SMSCampaignID": 4821,
  "Status": "Done",
  "CreatedAt": "2026-09-20 14:02:11",
  "CompletedAt": "2026-09-20 14:03:48",
  "Result": {
    "Audience": 412903,
    "Invalid": 1184,
    "Duplicate": 2071,
    "Suppressed": 9330,
    "TooLong": 0,
    "Sendable": 400318,
    "TotalParts": 431566,
    "Encodings": {
      "GSM7": 388201,
      "UCS2": 12117
    },
    "ProjectedCost": 4315.66,
    "CostCurrency": "USD",
    "CostPerPart": 0.01,
    "ProjectedCompletionAt": "2026-09-22 09:15:00",
    "MeasuredAt": "2026-09-20 14:03:48",
    "CampaignFingerprint": "6b1e...c04a"
  },
  "Stale": false,
  "ConfirmationToken": "1758377028.8f2c...",
  "ConfirmationTokenExpiresInSeconds": 900
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [
    {
      "Code": 5,
      "Message": "Estimate not found for this campaign."
    }
  ],
  "ErrorCode": 5
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
2: Missing or invalid EstimateID parameter
3: Campaign not found
4: The estimate could not be read; retry
5: Estimate not found for this campaign
6: The estimate finished but its result cannot be read; run it again
```

:::

**Response fields**

| Field | Meaning |
|---|---|
| `Status` | `Pending`, `Running`, `Done` or `Failed` |
| `Error` | Present only when `Status` is `Failed`, explaining why |
| `Result` | Present only when `Status` is `Done` |
| `Stale` | `true` when the campaign changed after it was costed. No token is issued and the estimate has to be run again |
| `ConfirmationToken` | Present only when `Status` is `Done` and `Stale` is `false` |

**The funnel in `Result`**

| Field | Meaning |
|---|---|
| `Audience` | Subscribers matching the campaign's list and segment with a phone number present |
| `Invalid` | Numbers that could not be normalized to a sendable form |
| `Duplicate` | Numbers appearing more than once, counted once as sendable and the rest here |
| `Suppressed` | Numbers suppressed at system, user, list or gateway scope |
| `TooLong` | Messages needing more parts than the gateway will concatenate |
| `Sendable` | What will actually be sent. This is the number the cost is based on |
| `TotalParts` | Message parts across every sendable recipient |
| `Encodings` | Sendable recipients by message encoding, `GSM7` and `UCS2` |
| `ProjectedCost` | `TotalParts` multiplied by `CostPerPart` |
| `ProjectedCompletionAt` | When the campaign would finish at the account's current send-rate limits. `null` when there is nothing to project from, which includes an account with no configured limit and a send-rate counter that could not be read: an unknown schedule is reported as unknown rather than as immediate |
| `CampaignFingerprint` | A fingerprint of the campaign content that was measured. Used to decide staleness; see below |


## Test and direct sends

### Send a Test Message

<Badge type="info" text="POST" /> `/api/v1/smscampaign.test`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Sends one copy of a campaign's message to one number, using the campaign's gateway and links. It counts against the account's SMS send limits like any other message.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smscampaign.test` |
| SessionID | String | No | Session ID obtained from login |
| SMSCampaignID | Integer | Yes | The campaign whose message to test |
| RecipientNumber | String | Yes | The destination number |
| SenderID | String | No | Override the campaign's sender id |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smscampaign.test \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smscampaign.test",
    "SessionID": "your-session-id",
    "SMSCampaignID": 4821,
    "RecipientNumber": "+15550100001"
  }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0 }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 4, "Message": "This campaign has no SMS gateway. Set GatewayID with smscampaign.update first." }],
  "ErrorCode": 4
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid SMSCampaignID parameter
2: Missing RecipientNumber parameter
3: Campaign not found
4: The campaign has no SMS gateway
5: The campaign's gateway is no longer active or assigned to this account
7: The campaign's links could not be read, so nothing was sent
8: The campaign has no message content to test
9: The test message is too long for the gateway's concatenation limit
10: SMS rate limit exceeded for an interval
11: The test message could not be queued, so nothing was sent
```

:::

### Send a Single Message

<Badge type="info" text="POST" /> `/api/v1/sms.send`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Rate limit: 300 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

One message to one number, with no campaign involved. `ListID` and `SubscriberID` are optional and must be given together: supplying them attributes the message to that contact, so it appears in their SMS history.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `sms.send` |
| SessionID | String | No | Session ID obtained from login |
| RecipientNumber | String | Yes | The destination number |
| MessageContent | String | Yes | The message body |
| GatewayID | Integer | Yes | The gateway to send through. `sms.gateways.get` lists the available ones |
| SenderID | String | No | The sender number or alphanumeric id |
| ListID | Integer | No | Attribute the message to a contact. Must be sent with `SubscriberID` |
| SubscriberID | Integer | No | The contact on that list. Must be sent with `ListID` |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/sms.send \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "sms.send",
    "SessionID": "your-session-id",
    "RecipientNumber": "+15550100001",
    "MessageContent": "Your code is 4821.",
    "GatewayID": 3
  }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0 }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 6, "Message": "ListID and SubscriberID must be sent together, or not at all." }],
  "ErrorCode": 6
}
```

```txt [Error Codes]
0: Success
1: Missing RecipientNumber parameter
2: Missing MessageContent parameter
3: Missing or invalid GatewayID parameter
4: Invalid GatewayID, or the gateway is not available to this account
6: ListID and SubscriberID must be sent together, or not at all
7: Invalid ListID
8: The subscriber could not be read, so nothing was sent
9: That subscriber is not on that list
10: The message is too long for the gateway's concatenation limit
11: SMS rate limit exceeded for an interval
12: The message could not be queued, so nothing was sent
```

:::

## Message templates

A saved message body that can be reused when composing a campaign. Templates are per account: one account can never read, change or delete another's.

### Create a Template

<Badge type="info" text="POST" /> `/api/v1/smstemplate.create`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Manage`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `smstemplate.create` |
| SessionID | String | No | Session ID obtained from login |
| TemplateName | String | Yes | A name, up to 255 characters |
| MessageContent | String | No | The body. May be empty, so a name can be saved to fill in later |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/smstemplate.create \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smstemplate.create",
    "SessionID": "your-session-id",
    "TemplateName": "Weekly promo",
    "MessageContent": "Hi {FirstName}, this week only."
  }'
```

```json [Success Response]
{ "Success": true, "ErrorCode": 0, "TemplateID": 17 }
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 1, "Message": "Missing TemplateName parameter" }],
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: Missing TemplateName parameter
2: TemplateName is longer than 255 characters
3: The template could not be created
```

:::

### Read, List, Update and Delete Templates

`smstemplate.get` returns one template, `smstemplate.browse` lists them, `smstemplate.update` changes a name or body, and `smstemplate.delete` removes one. They share their parameters and error codes, so they are documented together.

<Badge type="info" text="GET" /> `/api/v1/smstemplate.get` · <Badge type="info" text="GET" /> `/api/v1/smstemplate.browse`

<Badge type="info" text="POST" /> `/api/v1/smstemplate.update` · <Badge type="info" text="POST" /> `/api/v1/smstemplate.delete`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get` for `get` and `browse`, `SMSCampaigns.Manage` for `update` and `delete`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | One of `smstemplate.get`, `smstemplate.browse`, `smstemplate.update` or `smstemplate.delete` |
| SessionID | String | No | Session ID obtained from login |
| TemplateID | Integer | Yes | For `get`, `update` and `delete`. Must belong to the caller |
| TemplateName | String | No | For `update` |
| MessageContent | String | No | For `update`. Pass at least one of the two |
| Search | String | No | For `browse`. Matches the start of a template name |
| RecordsPerRequest | Integer | No | For `browse`. Default 25, clamped to 200 |
| RecordsFrom | Integer | No | For `browse`. Offset, default 0 |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/smstemplate.browse \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "smstemplate.browse",
    "SessionID": "your-session-id",
    "Search": "Weekly"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Templates": [
    {
      "TemplateID": 17,
      "TemplateName": "Weekly promo",
      "MessageContent": "Hi {FirstName}, this week only.",
      "CreatedAt": "2026-09-20 14:02:11",
      "UpdatedAt": "2026-09-20 14:02:11"
    }
  ],
  "TotalTemplates": 1
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 3, "Message": "Template not found." }],
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing or invalid TemplateID parameter (get, update, delete); read failure (browse)
2: The template could not be read
3: Template not found, including a template belonging to another account
4: TemplateName cannot be empty (update)
5: TemplateName is longer than 255 characters (update)
6: Nothing to update; pass TemplateName, MessageContent or both
7: The template could not be updated
```

:::

Asking for a template that belongs to another account answers `Template not found` rather than a permission error, and deleting one reports the same. There is no response that distinguishes "exists but is not yours" from "does not exist", so template ids cannot be probed.

## Supporting endpoints

### Get Available SMS Gateways

<Badge type="info" text="GET" /> `/api/v1/sms.gateways.get`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

The gateways this account may send through, with the capabilities a composer needs: how many parts each will concatenate, and which sender ids are available.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `sms.gateways.get` |
| SessionID | String | No | Session ID obtained from login |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/sms.gateways.get \
  -H "Content-Type: application/json" \
  -d '{ "Command": "sms.gateways.get", "SessionID": "your-session-id" }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Gateways": [
    {
      "GatewayID": 3,
      "GatewayName": "Primary",
      "MessageConcatenation": 5,
      "SenderNumbers": ["+15550100000", "ACME"]
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 1, "Message": "The gateway list could not be read." }],
  "ErrorCode": 1
}
```

```txt [Error Codes]
0: Success
1: The gateway list could not be read
```

:::

### Get Merge Tags for a List

<Badge type="info" text="GET" /> `/api/v1/sms.mergetags.get`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `SMSCampaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

The merge tags a message for this list may use. Every tag is measured at its rendered length when the message is costed, so the parts reported by the estimate are the parts that will be sent.

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `sms.mergetags.get` |
| SessionID | String | No | Session ID obtained from login |
| ListID | Integer | Yes | The list whose fields to return |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/sms.mergetags.get \
  -H "Content-Type: application/json" \
  -d '{ "Command": "sms.mergetags.get", "SessionID": "your-session-id", "ListID": 42 }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "MergeTags": [
    { "Tag": "{FirstName}", "FieldName": "First name" },
    { "Tag": "{CustomField12}", "FieldName": "Mobile number" }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "Errors": [{ "Code": 2, "Message": "Invalid ListID." }],
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing ListID parameter
2: Invalid ListID
3: The list's SMS settings could not be read
```

:::
