---
layout: doc
---

# Email Campaigns

## Campaign Approval

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to approve a campaign by updating its status to 'Ready'. The campaign is identified by its
unique `CampaignID`.

**Request Body Parameters:**

| Parameter  | Description                                                          | Required? |
|------------|----------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                 | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command    | Campaign.Approve                                                     | Yes       |
| CampaignID | The unique identifier for the campaign to approve                    | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Campaign.Approve", "CampaignID": "123"}'
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter: CampaignID
2: Campaign not found
```

:::

## Cancel a Campaign

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to cancel a specific campaign. The campaign must belong to the user making the request.

**Request Body Parameters:**

| Parameter  | Description                                                          | Required? |
|------------|----------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                 | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command    | Campaign.Cancel                                                      | Yes       |
| CampaignID | The unique identifier for the campaign to be canceled                | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Campaign.Cancel' \
  -d 'CampaignID=123'
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required field: CampaignID
2: Campaign does not belong to the user or does not exist
```

:::

## Copy Campaign

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to create a copy of an existing campaign. The new campaign will be created with the status '
Draft' and all the settings from the original campaign, except for the scheduled sending information.

**Request Body Parameters:**

| Parameter  | Description                                                          | Required? |
|------------|----------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                 | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command    | Campaign.Copy                                                        | Yes       |
| CampaignID | The unique identifier of the campaign to be copied                   | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Campaign.Copy' \
  -d 'CampaignID=123'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewCampaignID": "456"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": [
    "Invalid source campaign"
  ]
}
```

```txt [Error Codes]
1: Invalid source campaign
```

:::

## Create a New Campaign

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to create a new campaign in the system. It requires the user to provide a unique campaign name.

**Request Body Parameters:**

| Parameter    | Description                                                          | Required? |
|--------------|----------------------------------------------------------------------|-----------|
| SessionID    | The ID of the user's current session                                 | Yes       |
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command      | Campaign.Create                                                      | Yes       |
| CampaignName | The name of the campaign to be created                               | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Campaign.Create", "CampaignName": "Summer Sale Campaign"}'
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: "The campaign name is required."
```

:::

## Retrieve Campaign Details

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves detailed information about a specific campaign, including statistics if requested, and
calculates the campaign's email delivery throughput.

**Request Body Parameters:**

| Parameter          | Description                                                          | Required? |
|--------------------|----------------------------------------------------------------------|-----------|
| SessionID          | The ID of the user's current session                                 | Yes       |
| APIKey             | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command            | Campaign.Get                                                         | Yes       |
| campaignid         | Unique identifier for the campaign to retrieve                       | Yes       |
| retrievestatistics | Boolean flag to indicate if campaign statistics should be retrieved  | No        |
| retrievetags       | Boolean flag to indicate if campaign tags should be retrieved        | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Campaign.Get' \
  -d 'campaignid=123' \
  -d 'retrievestatistics=true' \
  -d 'retrievetags=true'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Campaign": {
    "CampaignID": 123,
    "Name": "Summer Sale",
    "Status": "Active",
    "TotalSent": 10000,
    "TotalHardBounces": 100,
    "TotalSoftBounces": 50,
    "HardBounceRatio": "1.00",
    "SoftBounceRatio": "0.50",
    "Statistics": {
      "OpenStatistics": {
        ...
      },
      "ClickStatistics": {
        ...
      },
      ...
    },
    "Tags": [
      "Summer",
      "Sale"
    ]
  },
  "CampaignThroughput": {
    "EmailsPerSecond": 5
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required parameter 'campaignid' is missing."
}
```

```txt [Error Codes]
1: Required parameter 'campaignid' is missing.
2: The 'campaignid' parameter must be numeric.
```

:::

## Pause a Campaign

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to pause an ongoing campaign. It ensures that the campaign belongs to the user and is currently in
a 'Sending' state before pausing it.

**Request Body Parameters:**

| Parameter  | Description                                                          | Required? |
|------------|----------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                 | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command    | Campaign.Pause                                                       | Yes       |
| CampaignID | The unique identifier of the campaign to be paused                   | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Campaign.Pause' \
  -d 'CampaignID=123'
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter: CampaignID
2: Campaign does not belong to the user
3: Campaign is not in a 'Sending' state
```

:::

## Resume a Campaign

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows the user to resume a previously paused campaign. The campaign must belong to the user and must be
in a 'Paused' state before it can be resumed.

**Request Body Parameters:**

| Parameter  | Description                                                          | Required? |
|------------|----------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                 | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command    | Campaign.Resume                                                      | Yes       |
| CampaignID | The unique identifier of the campaign to be resumed                  | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Campaign.Resume' \
  -d 'CampaignID=123'
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter: CampaignID
2: Campaign does not belong to the user
3: Campaign is not in a 'Paused' state
```

:::

## Update Campaign Details

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to update the details of an existing campaign. You can modify various attributes of the
campaign, including its status, schedule, recipients, and more.

**Request Body Parameters:**

| Parameter                         | Description                                                                                                                                                                                                  | Required? |
|-----------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| SessionID                         | The ID of the user's current session                                                                                                                                                                         | Yes       |
| APIKey                            | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                                                                                         | Yes       |
| Command                           | Campaign.Update                                                                                                                                                                                              | Yes       |
| CampaignID                        | Unique identifier for the campaign to be updated                                                                                                                                                             | Yes       |
| CampaignStatus                    | The new status of the campaign (e.g., Draft, Ready, Sending)                                                                                                                                                 | No        |
| CampaignName                      | The new name for the campaign                                                                                                                                                                                | No        |
| RelEmailID                        | The ID of the email associated with the campaign                                                                                                                                                             | No        |
| ScheduleType                      | The type of scheduling for the campaign (e.g., Immediate, Future, Recursive)                                                                                                                                 | No        |
| SendDate                          | The date when the campaign is scheduled to be sent                                                                                                                                                           | No        |
| SendTime                          | The time when the campaign is scheduled to be sent                                                                                                                                                           | No        |
| SendTimeZone                      | The timezone for the send date and time                                                                                                                                                                      | No        |
| ScheduleRecDaysOfWeek             | Days of the week when the campaign is scheduled to recur                                                                                                                                                     | No        |
| ScheduleRecDaysOfMonth            | Days of the month when the campaign is scheduled to recur                                                                                                                                                    | No        |
| ScheduleRecMonths                 | Months when the campaign is scheduled to recur                                                                                                                                                               | No        |
| ScheduleRecHours                  | Hours when the campaign is scheduled to recur                                                                                                                                                                | No        |
| ScheduleRecMinutes                | Minutes when the campaign is scheduled to recur                                                                                                                                                              | No        |
| ScheduleRecSendMaxInstance        | Maximum instances for the campaign to be sent on a recurring schedule                                                                                                                                        | No        |
| ApprovalUserExplanation           | Explanation from the user for campaign approval                                                                                                                                                              | No        |
| GoogleAnalyticsDomains            | Domains to be tracked with Google Analytics                                                                                                                                                                  | No        |
| PublishOnRSS                      | Whether to publish the campaign on RSS (Enabled or Disabled)                                                                                                                                                 | No        |
| RulesJsonBundle                   | Target audience in RulesJson syntax ([see instructions](#rulesjsonbundle-instructions)). If this parameter is provided, `RecipientListsAndSegments` and `Exclude_RecipientListsAndSegments` will be ignored. | No        |
| RecipientListsAndSegments         | Comma-separated list of recipient list and segment IDs                                                                                                                                                       | No        |
| Exclude_RecipientListsAndSegments | Comma-separated list of recipient list and segment IDs to exclude                                                                                                                                            | No        |
| S2SEnabled                        | Whether the Send-to-Send feature is enabled or not                                                                                                                                                           | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Campaign.Update' \
  -d 'CampaignID=123' \
  -d 'CampaignStatus=Ready' \
  -d 'CampaignName=New Campaign Name'
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
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Campaign ID is required
2: Campaign does not belong to the user
3: Invalid campaign status
4: Email ID does not belong to the user
5: Invalid schedule type
6: Send date is required for future scheduled campaigns
7: Send time is required for future scheduled campaigns
8: Either days of the week or days of the month must be specified for recursive campaigns
9: Months are required for recursive campaigns
10: Hours are required for recursive campaigns
11: Minutes are required for recursive campaigns
12: Maximum instances are required for recursive campaigns
13: Timezone is required for scheduled campaigns
```

:::

### `RulesJsonBundle` Instructions

This parameter is based on [`RulesJson` criteria syntax](/v5.6.x/api-reference/criteria-syntax.html). You can set a detailed
target audience for your email campaigns using `RulesJsonbundle` parameter.

Here's an example:

```json
{
  "operator": "or",
  "criteria": [
    {
      "list_id": 1,
      "operator": "and",
      "rules": [
        {
          "type": "fields",
          "field_id": "EmailAddress",
          "operator": "contains",
          "value": "user1"
        },
        {
          "type": "fields",
          "field_id": "EmailAddress",
          "operator": "contains",
          "value": ".net"
        }
      ]
    },
    {
      "list_id": 2,
      "operator": "or",
      "rules": [
        {
          "type": "fields",
          "field_id": "EmailAddress",
          "operator": "contains",
          "value": "@test"
        },
        {
          "type": "fields",
          "field_id": "EmailAddress",
          "operator": "contains",
          "value": "@gmail"
        }
      ]
    }
  ]
}
```

## Delete Campaigns

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows for the deletion of one or more campaigns associated with a user's account. The user must provide a
list of campaign IDs to be deleted.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | Campaigns.Delete                                                     | Yes       |
| Campaigns | Comma-separated list of campaign IDs to be deleted                   | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Campaigns.Delete' \
  -d 'Campaigns=1,2,3'
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
  "ErrorCode": {
    "campaigns": 1
  }
}
```

```txt [Error Codes]
1: The 'campaigns' parameter is missing or invalid.
```

:::

## Retrieve Campaigns

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of campaigns based on the provided criteria. It allows for filtering, ordering, and can
optionally include campaign statistics.

**Request Body Parameters:**

| Parameter          | Description                                                                                                                                        | Required? |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| SessionID          | The ID of the user's current session                                                                                                               | Yes       |
| APIKey             | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                               | Yes       |
| Command            | Campaigns.Get                                                                                                                                      | Yes       |
| RecordsPerRequest  | The number of records to retrieve per request                                                                                                      | No        |
| RecordsFrom        | The starting point from which to retrieve records                                                                                                  | No        |
| CampaignStatus     | The status of the campaigns to filter by `All`, `Sent`, `Draft`, `Ready`, `Sending`, `Pending`, `Sent`, `Failed`, `Scheduled`                      | No        |
| SearchKeyword      | A keyword to search for in campaign names                                                                                                          | No        |
| OrderField         | The field to order the results by. It can be any campaign field or any of `sort-by-status` (always sorts in descending order), `sort-by-send-date` | No        |
| OrderType          | The type of ordering to apply (e.g., 'ASC', 'DESC')                                                                                                | No        |
| RetrieveTags       | Whether to retrieve tags associated with the campaigns (true/false)                                                                                | No        |
| Tags               | A comma-separated list of tag IDs to filter campaigns by                                                                                           | No        |
| RetrieveStatistics | Whether to retrieve statistics for the campaigns (true/false)                                                                                      | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Campaigns.Get' \
  -d 'RecordsPerRequest=10' \
  -d 'RecordsFrom=0' \
  -d 'CampaignStatus=Scheduled' \
  -d 'SearchKeyword=Summer' \
  -d 'OrderField=CampaignName' \
  -d 'OrderType=ASC' \
  -d 'RetrieveTags=true' \
  -d 'Tags=1,2,3' \
  -d 'RetrieveStatistics=true'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Campaigns": [
    {
      "CampaignID": "123",
      "CampaignName": "Summer Sale",
      "CampaignStatus": "Active"
    }
  ],
  "TotalCampaigns": 50
}
```

```txt [Error Response]
There are no error codes for this API end-point.
```

```txt [Error Codes]
There are no error codes for this API end-point.
```

:::
