---
layout: doc
---

# Campaign API Documentation

Manage email marketing campaigns through programmatic API access. Create, update, monitor, and control campaign lifecycles.

## Cancel a Campaign

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaign.Update`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                               |
|-----------|---------|----------|-------------------------------------------|
| Command   | String  | Yes      | API command: `campaign.cancel`            |
| SessionID | String  | No       | Session ID obtained from login            |
| APIKey    | String  | No       | API key for authentication                |
| CampaignID| Integer | Yes      | ID of the campaign to cancel              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.cancel",
    "SessionID": "your-session-id",
    "CampaignID": 12345
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
1: Missing required parameter (CampaignID)
2: Campaign not found or doesn't belong to user
```

:::

## Copy a Campaign

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaign.Create`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                               |
|-----------|---------|----------|-------------------------------------------|
| Command   | String  | Yes      | API command: `campaign.copy`              |
| SessionID | String  | No       | Session ID obtained from login            |
| APIKey    | String  | No       | API key for authentication                |
| CampaignID| Integer | Yes      | ID of the campaign to copy                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.copy",
    "SessionID": "your-session-id",
    "CampaignID": 12345
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewCampaignID": 12346
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": ["Invalid source campaign"]
}
```

```txt [Error Codes]
0: Success
1: Invalid source campaign or campaign not found
```

:::

## Create a Campaign

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaign.Create`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter    | Type   | Required | Description                               |
|--------------|--------|----------|-------------------------------------------|
| Command      | String | Yes      | API command: `campaign.create`            |
| SessionID    | String | No       | Session ID obtained from login            |
| APIKey       | String | No       | API key for authentication                |
| CampaignName | String | Yes      | Name of the new campaign                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.create",
    "SessionID": "your-session-id",
    "CampaignName": "Summer Sale 2025"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignID": 12345
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
1: Missing required parameter (CampaignName)
```

:::

## Get Campaign Details

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key or Admin API Key
- Required permissions: `Campaign.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter               | Type    | Required | Description                                                          |
|-------------------------|---------|----------|----------------------------------------------------------------------|
| Command                 | String  | Yes      | API command: `campaign.get`                                          |
| SessionID               | String  | No       | Session ID obtained from login                                       |
| APIKey                  | String  | No       | API key for authentication                                           |
| CampaignID              | Integer | Yes      | ID of the campaign to retrieve                                       |
| RetrieveStatistics      | Boolean | No       | Include campaign statistics (default: false)                         |
| RetrieveTags            | Boolean | No       | Include campaign tags (default: false)                               |
| SplitABTestStatistics   | Boolean | No       | Include A/B test statistics (default: false)                         |
| RetrieveRecipientDomains| Boolean | No       | Include recipient domain statistics (default: true)                  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.get",
    "SessionID": "your-session-id",
    "CampaignID": 12345,
    "RetrieveStatistics": true,
    "RetrieveRecipientDomains": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Campaign": {
    "CampaignID": 12345,
    "CampaignName": "Summer Sale 2025",
    "CampaignStatus": "Sent",
    "TotalRecipients": 10000,
    "TotalSent": 9950,
    "TotalOpens": 3500,
    "UniqueOpens": 2100,
    "TotalClicks": 850,
    "UniqueClicks": 650
  },
  "CampaignThroughput": {
    "EmailsPerSecond": 125.5,
    "Duration": 79
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
2: Campaign not found or invalid CampaignID
```

:::

## Pause a Campaign

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaign.Update`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                               |
|-----------|---------|----------|-------------------------------------------|
| Command   | String  | Yes      | API command: `campaign.pause`             |
| SessionID | String  | No       | Session ID obtained from login            |
| APIKey    | String  | No       | API key for authentication                |
| CampaignID| Integer | Yes      | ID of the campaign to pause               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.pause",
    "SessionID": "your-session-id",
    "CampaignID": 12345
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
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (CampaignID)
2: Campaign not found or doesn't belong to user
3: Invalid campaign status (campaign must be Sending or Ready to be paused)
```

:::

## Get Campaign Recipients

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key or Admin API Key
- Required permissions: `Campaign.Get`
- This endpoint only works for unsent campaigns (Draft, Ready, Pending Approval)
- For sent campaigns, use campaign statistics or queue endpoints instead
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                                                          |
|-----------|---------|----------|----------------------------------------------------------------------|
| Command   | String  | Yes      | API command: `campaign.recipients.get`                               |
| SessionID | String  | No       | Session ID obtained from login                                       |
| APIKey    | String  | No       | API key for authentication                                           |
| CampaignID| Integer | Yes      | ID of the campaign                                                   |
| OnlyTotal | Boolean | No       | Return only total count without recipient details (default: false)   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.recipients.get",
    "SessionID": "your-session-id",
    "CampaignID": 12345,
    "OnlyTotal": false
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignID": 12345,
  "TotalRecipients": 1500,
  "Recipients": [
    {
      "SubscriberID": 101,
      "EmailAddress": "user@example.com",
      "FirstName": "John",
      "LastName": "Doe"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 4,
  "ErrorMessage": "This endpoint only works for unsent campaigns",
  "CampaignStatus": "Sent"
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (CampaignID)
2: Invalid CampaignID (must be numeric)
3: Campaign not found or access denied
4: Invalid campaign status (must be Draft, Ready, or Pending Approval)
5: Campaign has no RulesJsonBundle or criteria defined
10: Error retrieving campaign recipients
```

:::

## Resume a Campaign

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaign.Update`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                               |
|-----------|---------|----------|-------------------------------------------|
| Command   | String  | Yes      | API command: `campaign.resume`            |
| SessionID | String  | No       | Session ID obtained from login            |
| APIKey    | String  | No       | API key for authentication                |
| CampaignID| Integer | Yes      | ID of the campaign to resume              |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.resume",
    "SessionID": "your-session-id",
    "CampaignID": 12345
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
  "ErrorCode": 3
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (CampaignID)
2: Campaign not found or doesn't belong to user
3: Campaign status is not Paused (only Paused campaigns can be resumed)
```

:::

## Update a Campaign

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaign.Update`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter                    | Type    | Required | Description                                                       |
|------------------------------|---------|----------|-------------------------------------------------------------------|
| Command                      | String  | Yes      | API command: `campaign.update`                                    |
| SessionID                    | String  | No       | Session ID obtained from login                                    |
| APIKey                       | String  | No       | API key for authentication                                        |
| CampaignID                   | Integer | Yes      | ID of the campaign to update                                      |
| CampaignName                 | String  | No       | New campaign name                                                 |
| CampaignStatus               | String  | No       | Campaign status (Draft, Ready, Sending, Paused, Pending Approval, Sent, Failed) |
| CampaignStatusReason         | String  | No       | Reason for status change                                          |
| RelEmailID                   | Integer | No       | ID of the email content to use                                    |
| ScheduleType                 | String  | No       | Schedule type (Not Scheduled, Immediate, Future, Recursive)       |
| SendDate                     | String  | No       | Send date (YYYY-MM-DD format) - required if ScheduleType=Future  |
| SendTime                     | String  | No       | Send time (HH:MM:SS format) - required if ScheduleType=Future    |
| SendTimeZone                 | String  | No       | Timezone for scheduled send                                       |
| ScheduleRecDaysOfWeek        | String  | No       | Days of week for recurring campaigns                              |
| ScheduleRecDaysOfMonth       | String  | No       | Days of month for recurring campaigns                             |
| ScheduleRecMonths            | String  | No       | Months for recurring campaigns - required if ScheduleType=Recursive |
| ScheduleRecHours             | String  | No       | Hours for recurring campaigns - required if ScheduleType=Recursive |
| ScheduleRecMinutes           | String  | No       | Minutes for recurring campaigns - required if ScheduleType=Recursive |
| ScheduleRecSendMaxInstance   | Integer | No       | Max instances for recurring campaigns - required if ScheduleType=Recursive |
| ApprovalUserExplanation      | String  | No       | User explanation for approval                                     |
| GoogleAnalyticsDomains       | String  | No       | Google Analytics tracking domains                                 |
| PublishOnRSS                 | String  | No       | Publish on RSS (Enabled/Disabled)                                 |
| AutoResendEnabled            | Boolean | No       | Enable auto-resend to non-openers                                 |
| AutoResendWaitDays           | Integer | No       | Days to wait before auto-resend - required if AutoResendEnabled=true |
| AutoResendSubject            | String  | No       | Subject line for auto-resend - required if AutoResendEnabled=true |
| AutoResendPreHeaderText      | String  | No       | Pre-header text for auto-resend                                   |
| OriginalCampaignID           | Integer | No       | ID of original campaign if this is a resend                       |
| RecipientListsAndSegments    | String  | No       | Comma-separated list (format: ListID:SegmentID)                   |
| Exclude_RecipientListsAndSegments | String | No  | Comma-separated exclusion list (format: ListID:SegmentID)         |
| RulesJsonBundle              | String  | No       | JSON string with advanced recipient selection rules               |
| S2SEnabled                   | Boolean | No       | Enable server-to-server tracking                                  |
| ABTesting                    | Object  | No       | A/B testing configuration (see [A/B Testing Parameters](#a-b-testing-parameters) below) |

**A/B Testing Parameters:**

When the `ABTesting` object is provided, the campaign is configured as an A/B split test. Each variation references a separate email (created via `Email.Create` + `Email.Update`) and is assigned a weight that determines the distribution percentage across recipients.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| ABTesting[Variations] | Array | Yes | Array of variation objects (minimum 2, maximum 5) |
| ABTesting[Variations][N][emailid] | Integer | Yes | Email ID for this variation (must belong to the authenticated user) |
| ABTesting[Variations][N][weight] | Integer | Yes | Relative weight for distribution (must be > 0). Distribution percentages are calculated automatically from the weights. For example, two variations with weight `1` each results in 50%/50% distribution. Weights of `1`, `1`, `2` result in 25%/25%/50% |

::: warning Important Notes
- When A/B testing is enabled, the campaign's `RelEmailID` is automatically set to `0` — do not pass a `RelEmailID` alongside `ABTesting`.
- Each variation must have a distribution of at least 1%.
- To disable A/B testing on a campaign, pass an empty `ABTesting` parameter.
- The system randomly distributes recipients across variations during queue generation, so each subscriber receives exactly one variation.
:::

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaign.update",
    "SessionID": "your-session-id",
    "CampaignID": 12345,
    "CampaignName": "Updated Summer Sale",
    "CampaignStatus": "Ready",
    "ScheduleType": "Future",
    "SendDate": "2025-06-15",
    "SendTime": "10:00:00",
    "SendTimeZone": "America/New_York"
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
  "ErrorCode": 6
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (CampaignID)
2: Campaign not found or doesn't belong to user
3: Invalid campaign status
4: Email not found or doesn't belong to user
5: Invalid schedule type
6: Missing SendDate for Future schedule
7: Missing SendTime for Future schedule
8: Missing ScheduleRecDaysOfWeek or ScheduleRecDaysOfMonth for Recursive schedule
9: Missing ScheduleRecMonths for Recursive schedule
10: Missing ScheduleRecHours for Recursive schedule
11: Missing ScheduleRecMinutes for Recursive schedule
12: Missing ScheduleRecSendMaxInstance for Recursive schedule
14: Missing or invalid AutoResendWaitDays when AutoResendEnabled=true
15: Missing AutoResendSubject when AutoResendEnabled=true
16: Missing AutoResendPreHeaderText when AutoResendEnabled=true
17: Invalid ABTesting parameter format (must be array)
18: Invalid ABTesting variations format (must be array)
19: Email variation not found or doesn't belong to user
21: Minimum 2 A/B test variations required
22: Maximum 5 A/B test variations allowed
23: Missing required fields in A/B variation (EmailID, Weight)
24: Invalid EmailID or Weight in A/B variation
25: A/B variation distribution percentage below 1%
```

:::

## Get Campaign Archive URL

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                               |
|-------------|---------|----------|-------------------------------------------|
| Command     | String  | Yes      | API command: `campaigns.archive.geturl`   |
| SessionID   | String  | No       | Session ID obtained from login            |
| APIKey      | String  | No       | API key for authentication                |
| TagID       | Integer | Yes      | ID of the tag for archive URL             |
| TemplateURL | String  | No       | Custom template URL for archive           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaigns.archive.geturl",
    "SessionID": "your-session-id",
    "TagID": 5,
    "TemplateURL": "https://example.com/archive-template"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "URL": "https://example.com/archive/tag/5"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (TagID)
2: Tag not found or doesn't belong to user
```

:::

## Delete Campaigns

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaign.Delete`
- This endpoint also deletes associated auto-resend campaigns automatically
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                        |
|-----------|--------|----------|----------------------------------------------------|
| Command   | String | Yes      | API command: `campaigns.delete`                    |
| SessionID | String | No       | Session ID obtained from login                     |
| APIKey    | String | No       | API key for authentication                         |
| Campaigns | String | Yes      | Comma-separated list of campaign IDs to delete     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaigns.delete",
    "SessionID": "your-session-id",
    "Campaigns": "12345,12346,12347"
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (Campaigns)
```

:::

## Get Campaigns List

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication is done by User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter               | Type    | Required | Description                                                          |
|-------------------------|---------|----------|----------------------------------------------------------------------|
| Command                 | String  | Yes      | API command: `campaigns.get`                                         |
| SessionID               | String  | No       | Session ID obtained from login                                       |
| APIKey                  | String  | No       | API key for authentication                                           |
| CampaignStatus          | String  | No       | Filter by status (Draft, Ready, Scheduled, Sending, Sent, Paused, Failed, All) |
| ScheduleType            | String/Array | No  | Filter by schedule type (Not Scheduled, Immediate, Future, Recursive) |
| SearchKeyword           | String  | No       | Search campaigns by name (LIKE query)                                |
| FilterByUserID          | Integer | No       | Filter by account/user ID (admin only)                               |
| CampaignIDs             | String/Array | No  | Filter by specific campaign IDs (comma-separated or array)           |
| Date_From               | String  | No       | Start date for filtering (YYYY-MM-DD format)                         |
| Date_To                 | String  | No       | End date for filtering (YYYY-MM-DD format)                           |
| OrderField              | String  | No       | Field to sort by (CampaignName, SendDate, etc.)                      |
| OrderType               | String  | No       | Sort direction (ASC or DESC)                                         |
| RecordsPerRequest       | Integer | No       | Number of records per page (0 for all, default: 0)                   |
| RecordsFrom             | Integer | No       | Offset for pagination (default: 0)                                   |
| RetrieveStatistics      | Boolean | No       | Include campaign statistics (default: true)                          |
| RetrieveTags            | Boolean | No       | Include campaign tags (default: false)                               |
| Tags                    | String  | No       | Comma-separated tag IDs to filter by                                 |
| SplitABTestStatistics   | Boolean | No       | Include A/B split test statistics (default: false)                   |
| ExcludeColumns          | Array   | No       | Column names to exclude from SELECT for performance                  |
| Include_AutoResend      | Boolean | No       | Include auto-resend campaigns (default: false)                       |
| IncludeTotalRecipients  | Boolean | No       | Include aggregate sums of TotalRecipients, TotalSent, TotalFailed (default: false) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "campaigns.get",
    "SessionID": "your-session-id",
    "CampaignStatus": "Sent",
    "Date_From": "2025-01-01",
    "Date_To": "2025-12-31",
    "RecordsPerRequest": 50,
    "RecordsFrom": 0,
    "OrderField": "SendDate",
    "OrderType": "DESC",
    "RetrieveStatistics": true
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Campaigns": [
    {
      "CampaignID": 12345,
      "CampaignName": "Summer Sale 2025",
      "CampaignStatus": "Sent",
      "SendDate": "2025-06-15",
      "TotalRecipients": 10000,
      "TotalSent": 9950,
      "TotalOpens": 3500,
      "UniqueOpens": 2100
    }
  ],
  "TotalCampaigns": 125
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 0
}
```

```txt [Error Codes]
0: Success
```

:::

## Get Tags List

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `tags.get`               |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "tags.get",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalTagCount": 5,
  "Tags": [
    {
      "TagID": 1,
      "Tag": "newsletter",
      "RelOwnerUserID": 123
    },
    {
      "TagID": 2,
      "Tag": "promotion",
      "RelOwnerUserID": 123
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 0
}
```

```txt [Error Codes]
0: Success
```

:::

## Create a Tag

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `tag.create`             |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Tag       | String | Yes      | Tag name (letters, numbers, spaces, hyphens, underscores only) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "tag.create",
    "SessionID": "your-session-id",
    "Tag": "summer-campaign"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TagID": 15
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (Tag)
2: Tag already exists in the system
3: Invalid tag format (only letters, numbers, spaces, hyphens and underscores allowed)
4: Tag cannot be empty after trimming whitespace
```

:::

## Update a Tag

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `tag.update`             |
| SessionID | String  | No       | Session ID obtained from login        |
| APIKey    | String  | No       | API key for authentication            |
| TagID     | Integer | Yes      | ID of the tag to update               |
| Tag       | String  | Yes      | New tag name (letters, numbers, spaces, hyphens, underscores only) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "tag.update",
    "SessionID": "your-session-id",
    "TagID": 15,
    "Tag": "summer-promotion"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (TagID)
2: Missing required parameter (Tag)
3: Invalid tag format (only letters, numbers, spaces, hyphens and underscores allowed)
4: Tag cannot be empty after trimming whitespace
```

:::

## Delete Tags

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `tags.delete`            |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Tags      | String | Yes      | Comma-separated list of tag IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "tags.delete",
    "SessionID": "your-session-id",
    "Tags": "15,16,17"
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (Tags)
```

:::

## Assign Tag to Campaigns

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                           |
|-------------|---------|----------|---------------------------------------|
| Command     | String  | Yes      | API command: `tag.assigntocampaigns`  |
| SessionID   | String  | No       | Session ID obtained from login        |
| APIKey      | String  | No       | API key for authentication            |
| TagID       | Integer | Yes      | ID of the tag to assign               |
| CampaignIDs | String  | Yes      | Comma-separated list of campaign IDs  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "tag.assigntocampaigns",
    "SessionID": "your-session-id",
    "TagID": 15,
    "CampaignIDs": "100,101,102"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (TagID)
2: Missing required parameter (CampaignIDs)
```

:::

## Unassign Tag from Campaigns

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaigns.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                           |
|-------------|---------|----------|---------------------------------------|
| Command     | String  | Yes      | API command: `tag.unassignfromcampaigns` |
| SessionID   | String  | No       | Session ID obtained from login        |
| APIKey      | String  | No       | API key for authentication            |
| TagID       | Integer | Yes      | ID of the tag to unassign             |
| CampaignIDs | String  | Yes      | Comma-separated list of campaign IDs  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "tag.unassignfromcampaigns",
    "SessionID": "your-session-id",
    "TagID": 15,
    "CampaignIDs": "100,101,102"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing required parameter (TagID)
2: Missing required parameter (CampaignIDs)
```

:::

## Create an A/B Split Test Campaign

A/B split test campaigns allow you to send different email variations to segments of your audience and compare performance. The system randomly distributes recipients across variations based on configurable weights.

### How A/B Split Testing Works

1. **Create a campaign** using `Campaign.Create`
2. **Create email variations** — one `Email.Create` + `Email.Update` call per variation (minimum 2, maximum 5)
3. **Configure the campaign** using `Campaign.Update` with `ABTesting[Variations]`, audience rules, and schedule
4. **The system handles the rest** — during delivery, recipients are randomly assigned to variations based on distribution weights

When the campaign is sent, each recipient receives exactly one email variation. Statistics (opens, clicks, conversions, unsubscriptions, revenue) are tracked per variation, allowing you to compare performance.

### Step-by-Step Example

::: code-group

```bash [Step 1: Create Campaign]
# Create the campaign shell
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Campaign.Create' \
  -d 'APIKey=your-api-key' \
  -d 'CampaignName=A/B Test: Subject Line Comparison'

# Response: {"Success": true, "ErrorCode": 0, "CampaignID": 200}
```

```bash [Step 2: Create Email Variations]
# --- Variation A ---
# Create the first email
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Email.Create' \
  -d 'APIKey=your-api-key'

# Response: {"Success": true, "ErrorCode": 0, "EmailID": 301}

# Set the content for Variation A
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Email.Update' \
  -d 'APIKey=your-api-key' \
  -d 'EmailID=301' \
  -d 'ValidateScope=Campaign' \
  -d 'EmailName=Variation A - Discount Subject' \
  -d 'Subject=Save 50% Today Only!' \
  -d 'FromName=My Store' \
  -d 'FromEmail=deals@mystore.com' \
  -d 'ReplyToName=My Store' \
  -d 'ReplyToEmail=deals@mystore.com' \
  -d 'Mode=Editor' \
  -d 'HTMLContent=<html><body><h1>Half Price Sale!</h1><p>...</p><p><a href="%Link:Unsubscribe%">Unsubscribe</a></p></body></html>'

# --- Variation B ---
# Create the second email
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Email.Create' \
  -d 'APIKey=your-api-key'

# Response: {"Success": true, "ErrorCode": 0, "EmailID": 302}

# Set the content for Variation B
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Email.Update' \
  -d 'APIKey=your-api-key' \
  -d 'EmailID=302' \
  -d 'ValidateScope=Campaign' \
  -d 'EmailName=Variation B - Urgency Subject' \
  -d 'Subject=Last Chance: Sale Ends at Midnight' \
  -d 'FromName=My Store' \
  -d 'FromEmail=deals@mystore.com' \
  -d 'ReplyToName=My Store' \
  -d 'ReplyToEmail=deals@mystore.com' \
  -d 'Mode=Editor' \
  -d 'HTMLContent=<html><body><h1>Sale Ending Soon!</h1><p>...</p><p><a href="%Link:Unsubscribe%">Unsubscribe</a></p></body></html>'
```

```bash [Step 3: Configure & Send]
# Update the campaign with A/B testing, audience, and schedule
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Campaign.Update' \
  -d 'APIKey=your-api-key' \
  -d 'CampaignID=200' \
  -d 'CampaignStatus=Ready' \
  -d 'ScheduleType=Immediate' \
  -d 'RulesJsonBundle={"operator":"and","criteria":[{"list_id":1,"operator":"and","rules":[[{"type":"fields","field_id":"EmailAddress","operator":"is_not_empty","value":""}]]}]}' \
  -d 'ABTesting[Variations][0][emailid]=301' \
  -d 'ABTesting[Variations][0][weight]=1' \
  -d 'ABTesting[Variations][1][emailid]=302' \
  -d 'ABTesting[Variations][1][weight]=1'

# Response: {"Success": true, "ErrorCode": 0}
# With equal weights of 1, each variation receives ~50% of recipients.
```

```bash [Step 4: View Results]
# Retrieve campaign with A/B test statistics
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Campaign.Get' \
  -d 'APIKey=your-api-key' \
  -d 'CampaignID=200' \
  -d 'RetrieveStatistics=true' \
  -d 'SplitABTestStatistics=true'

# The response includes per-variation stats inside Campaign.Options.ABTesting.Variations:
# Each variation object includes: EmailID, Weight, Distribution,
# TotalRecipient, TotalSent, TotalFailed, UniqueOpens, UniqueClicks,
# TotalRevenue, TotalUnsubscriptions
```

:::

### Unequal Weight Distribution

You can assign different weights to send more traffic to a preferred variation:

```bash
# 75% to Variation A, 25% to Variation B
-d 'ABTesting[Variations][0][emailid]=301'
-d 'ABTesting[Variations][0][weight]=3'
-d 'ABTesting[Variations][1][emailid]=302'
-d 'ABTesting[Variations][1][weight]=1'

# Three variations: 50% / 25% / 25%
-d 'ABTesting[Variations][0][emailid]=301'
-d 'ABTesting[Variations][0][weight]=2'
-d 'ABTesting[Variations][1][emailid]=302'
-d 'ABTesting[Variations][1][weight]=1'
-d 'ABTesting[Variations][2][emailid]=303'
-d 'ABTesting[Variations][2][weight]=1'
```

### Retrieving A/B Test Statistics

When retrieving a campaign with `SplitABTestStatistics=true`, the response includes per-variation performance metrics:

```json
{
  "Success": true,
  "Campaign": {
    "CampaignID": 200,
    "CampaignName": "A/B Test: Subject Line Comparison",
    "CampaignStatus": "Sent",
    "RelEmailID": 0,
    "Options": {
      "ABTesting": {
        "Variations": [
          {
            "EmailID": 301,
            "Weight": 1,
            "Distribution": 50,
            "TotalRecipient": 5000,
            "TotalSent": 4980,
            "TotalFailed": 20,
            "UniqueOpens": 1200,
            "UniqueClicks": 350,
            "TotalRevenue": 15000,
            "TotalUnsubscriptions": 5
          },
          {
            "EmailID": 302,
            "Weight": 1,
            "Distribution": 50,
            "TotalRecipient": 5000,
            "TotalSent": 4975,
            "TotalFailed": 25,
            "UniqueOpens": 1450,
            "UniqueClicks": 420,
            "TotalRevenue": 18500,
            "TotalUnsubscriptions": 3
          }
        ]
      }
    },
    "OpenStatistics": { ... },
    "ClickStatistics": { ... }
  }
}
```

When `SplitABTestStatistics=true`, the `OpenStatistics`, `ClickStatistics`, `ConversionStatistics`, and `UnsubscriptionStatistics` objects also include per-variation breakdowns grouped by `RelEmailID`.

### Disabling A/B Testing

To remove A/B testing from a campaign and revert to a single email, pass an empty `ABTesting` parameter and set `RelEmailID`:

```bash
curl -X POST https://example.com/api.php \
  -d 'ResponseFormat=JSON' \
  -d 'Command=Campaign.Update' \
  -d 'APIKey=your-api-key' \
  -d 'CampaignID=200' \
  -d 'ABTesting=' \
  -d 'RelEmailID=301'
```

### Copying an A/B Test Campaign

Use `Campaign.Copy` to duplicate an A/B test campaign. All email variations are automatically duplicated with new Email IDs, and the A/B testing configuration is preserved in the copy.

---

## Create a Split Test (Legacy)

::: warning Legacy API
This endpoint uses the older split test system where a test portion of recipients receive different email variations, the campaign pauses to wait for results, then the winning variation is sent to the remaining audience. For the modern A/B testing approach where all recipients are distributed across variations simultaneously, see [Create an A/B Split Test Campaign](#create-an-a-b-split-test-campaign) above.
:::

<Badge type="info" text="POST" /> `/api.php` (legacy)

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Campaign.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter     | Type    | Required | Description                                                    |
|---------------|---------|----------|----------------------------------------------------------------|
| Command       | String  | Yes      | API command: `splittest.create`                                |
| SessionID     | String  | No       | Session ID obtained from login                                 |
| APIKey        | String  | No       | API key for authentication                                     |
| CampaignID    | Integer | Yes      | ID of the campaign to create split test for                    |
| TestSize      | Integer | Yes      | Percentage of recipients to include in test (e.g., 20 for 20%) |
| TestDuration  | Integer | Yes      | Duration in seconds to wait before selecting the winner        |
| Winner        | String  | Yes      | Winner criteria: `Highest Open Rate` or `Most Unique Clicks`  |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "splittest.create",
    "SessionID": "your-session-id",
    "CampaignID": 12345,
    "TestSize": 20,
    "TestDuration": 86400,
    "Winner": "Highest Open Rate"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SplitTestID": 567
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
1: Missing required parameter (CampaignID)
2: Missing required parameter (TestSize)
4: Missing required parameter (TestDuration)
5: Missing required parameter (Winner)
6: Campaign not found or doesn't belong to user
```

:::

## Retry Failed Recipients

<Badge type="info" text="POST" /> `/api/v1/admin.campaign.retryfailed`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Retries failed recipients for campaigns with status "Sent" or "Failed". This endpoint resets failed queue entries to Pending, creates new delivery batches, sets the campaign to "Sending" status, and pushes it to RabbitMQ for delivery workers to process.

**Important:** This endpoint bypasses the campaign picker and handles batch creation + RabbitMQ publishing directly. This ensures only the original failed recipients are retried without re-inserting subscribers who joined target lists after the original send.

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                                           |
|------------|---------|----------|-------------------------------------------------------|
| Command    | String  | Yes      | API command: `admin.campaign.retryfailed`             |
| SessionID  | String  | No       | Session ID obtained from login                        |
| APIKey     | String  | No       | API key for authentication                            |
| CampaignID | Integer | Yes      | ID of the campaign to retry failed recipients for     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.campaign.retryfailed \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.campaign.retryfailed",
    "APIKey": "your-admin-api-key",
    "CampaignID": 4069
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "RetriedCount": 150,
  "BatchesCreated": 1,
  "Message": "150 failed recipients queued for retry in 1 batch(es)."
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Campaign is not in Sent or Failed status. Only completed or failed campaigns can have their failed recipients retried."
}
```

```txt [Error Codes]
0: Success
1: campaign_id parameter is required
2: Campaign not found
3: Campaign is not in Sent or Failed status
4: Queue table does not exist for this campaign
5: No failed recipients found for this campaign
6: Database error during retry operation
```

:::
