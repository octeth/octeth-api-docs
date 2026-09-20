---
layout: doc
---

# SMS Campaign API Documentation

Cost estimation for bulk SMS campaigns. A campaign cannot be sent until its cost has been estimated and the result confirmed, so these two endpoints sit between creating a campaign and sending it.

::: tip Why the estimate is a job rather than an answer
Measuring a campaign means resolving its audience, removing suppressed, invalid and duplicate numbers, personalizing every message and counting the parts each one will take. For a one-million recipient audience that cannot finish inside a single request, so `smscampaign.estimate` queues the work and returns an id. Poll `smscampaign.estimate.get` until it reports `Done`, then pass the `EstimateID` and `ConfirmationToken` it returns to `smscampaign.send` or `smscampaign.schedule`.

The token is what proves the cost was seen before the campaign was sent. It is signed over the estimate, the campaign and the campaign's content, so editing the campaign after estimating it invalidates the token and the estimate has to be run again. It also expires, after `SMS_CAMPAIGN_ESTIMATE_TOKEN_TTL` seconds (900 by default).

Cost is message parts multiplied by the configured cost per part. No SMS gateway exposes its pricing to the platform, so this is an estimate for planning, not a billing figure.
:::

## Start a Campaign Cost Estimate

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

## Read a Campaign Cost Estimate

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
