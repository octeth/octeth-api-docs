---
layout: doc
---

# Email Campaigns

## Approve Campaign

This API endpoint allows for setting the status of a campaign to 'Ready', effectively approving it for launch.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter  | Description                            |          |
|------------|----------------------------------------|----------|
| Command    | `Campaign.Approve`                     | Required |
| CampaignId | The ID of the campaign to be approved. | Required |

**Success Response:**

A successful response indicates that the campaign status has been updated to 'Ready'.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)

**Error Response:**

- `1`: Missing campaign ID.
- `2`: Invalid campaign ID.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing campaign id"
}
```

## Cancel Campaign

This API endpoint allows for canceling a specific campaign by setting its status to 'Ready' and 'Not Scheduled',
effectively pausing it. The endpoint also handles split test settings associated with the campaign.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter  | Description                            |          |
|------------|----------------------------------------|----------|
| Command    | `Campaign.Cancel`                      | Required |
| CampaignId | The ID of the campaign to be canceled. | Required |

**Success Response:**

A successful response indicates that the campaign has been successfully canceled.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)

**Error Response:**

- `1`: Missing campaign ID.
- `2`: Invalid campaign ID.
- `3`: Campaign status is not in a cancellable state.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing campaign id"
}
```

## Copy Campaign

This API endpoint is designed to create a copy of an existing campaign, including its recipient lists and email content.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter  | Description                          |          |
|------------|--------------------------------------|----------|
| Command    | `Campaign.Copy`                      | Required |
| CampaignId | The ID of the campaign to be copied. | Required |

**Success Response:**

A successful response indicates that the campaign has been successfully copied.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `NewCampaignID`: The ID of the newly created campaign copy.

**Error Response:**

- `1`: Missing source campaign ID.
- `2`: Invalid source campaign or email content.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "NewCampaignID": 12345
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Invalid source campaign"
}
```

## Create Campaign

This API endpoint facilitates the creation of a new campaign with the provided name.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter     | Description                                  |          |
|---------------|----------------------------------------------|----------|
| Command       | `Campaign.Create`                            | Required |
| CampaignName  | The name for the new campaign to be created. | Required |

**Success Response:**

A successful response indicates that a new campaign has been created.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `CampaignID`: The ID of the newly created campaign.

**Error Response:**

- `1`: Missing campaign name.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignID": 12345
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing campaign name"
}
```

## Retrieve Campaign Details

This API endpoint retrieves detailed information about a specific campaign, including statistics if requested.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter         | Description                                                                                |          |
|-------------------|--------------------------------------------------------------------------------------------|----------|
| Command           | `Campaign.Get`                                                                             | Required |
| CampaignId        | The ID of the campaign for which details are being retrieved.                              | Required |
| RetrieveStatistics| *(Optional)* Boolean to indicate whether to retrieve detailed statistics for the campaign. | Optional |
| RetrieveTags      | *(Optional)* Boolean to indicate whether to retrieve tag information for the campaign.     | Optional |

**Success Response:**

A successful response includes detailed information about the specified campaign.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `Campaign`: A JSON object containing detailed information about the campaign, including statistics if requested.
- `CampaignThroughput`: Information about the campaign's email delivery throughput.

**Error Response:**

- `1`: Missing campaign ID.
- `2`: Invalid campaign ID (e.g., non-numeric value).

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "Campaign": {
    // Detailed campaign information
  },
  "CampaignThroughput": {
    // Campaign throughput information
  }
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing campaign id"
}
```

## Pause Campaign

This API endpoint allows for pausing an ongoing campaign that is currently in the sending process.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter  | Description                          |          |
|------------|--------------------------------------|----------|
| Command    | `Campaign.Pause`                     | Required |
| CampaignId | The ID of the campaign to be paused. | Required |

**Success Response:**

A successful response indicates that the campaign has been paused.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)

**Error Response:**

- `1`: Missing campaign ID.
- `2`: Invalid campaign ID.
- `3`: Campaign status is not in a pausable state.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing campaign id"
}
```

## Resume Campaign

This API endpoint facilitates the resumption of a paused campaign, updating its status to 'Ready', and handling
associated split tests accordingly.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter  | Description                           |          |
|------------|---------------------------------------|----------|
| Command    | `Campaign.Resume`                     | Required |
| CampaignId | The ID of the campaign to be resumed. | Required |

**Success Response:**

A successful response indicates that the campaign has been updated to 'Ready' status, effectively resuming it.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)

**Error Response:**

- `1`: Missing campaign ID.
- `2`: Invalid campaign ID.
- `3`: Campaign status is not in a resumable state.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing campaign id"
}
```

## Update Campaign

This API endpoint allows for updating the details of an existing campaign, including its schedule, recipient lists, and
other settings.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter                        | Description                                              | Required |
|----------------------------------|----------------------------------------------------------|----------|
| Command                          | `Campaign.Update`                                        | Yes      |
| CampaignId                       | The ID of the campaign to be updated.                    | Yes      |
| CampaignName                     | *(Optional)* The new name for the campaign.              | No       |
| RelEmailId                       | *(Optional)* The email ID associated with the campaign.  | No       |
| ScheduleType                     | *(Optional)* Type of scheduling ('Future', 'Recursive'). | No       |
| SendDate                         | *(Optional)* Scheduled date for future sending.          | No       |
| SendTime                         | *(Optional)* Scheduled time for future sending.          | No       |
| SendTimeZone                     | *(Optional)* Time zone for scheduling.                   | No       |
| ScheduleRecDaysOfWeek            | *(Optional)* Days of the week for recursive sending.     | No       |
| ScheduleRecDaysOfMonth           | *(Optional)* Days of the month for recursive sending.    | No       |
| ScheduleRecMonths                | *(Optional)* Months for recursive sending.               | No       |
| ScheduleRecHours                 | *(Optional)* Hours for recursive sending.                | No       |
| ScheduleRecMinutes               | *(Optional)* Minutes for recursive sending.              | No       |
| ScheduleRecSendMaxInstance       | *(Optional)* Maximum instances for recursive sending.    | No       |
| ApprovalUserExplanation          | *(Optional)* Explanation for campaign approval.          | No       |
| GoogleAnalyticsDomains           | *(Optional)* Domains for Google Analytics tracking.      | No       |
| PublishOnRss                     | *(Optional)* Enable or disable publishing on RSS.        | No       |
| RecipientListsAndSegments        | *(Optional)* Recipient list and segment IDs.             | No       |
| ExcludeRecipientListsAndSegments | *(Optional)* Exclude recipient list and segment IDs.     | No       |
| Other campaign options           | *(Optional)* Additional campaign options.                | No       |

**Success Response:**

A successful response indicates that the campaign has been updated.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)

**Error Response:**

- `1`: Missing campaign ID.
- `2`: Invalid campaign ID.
- `3`: Invalid campaign status.
- `4`: Invalid email ID or email ID does not belong to the user.
- `5`: Invalid schedule type, date, time, or timezone.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing required fields"
}
```

## Delete Campaigns

This API endpoint is used to delete one or more campaigns owned by the user.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                     | Required |
|-----------|-----------------------------------------------------------------|----------|
| Command   | `Campaigns.Delete`                                              | Yes      |
| Campaigns | A comma-separated list of campaign IDs that need to be deleted. | Yes      |

**Success Response:**

A successful response indicates that the specified campaigns have been deleted.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)

**Error Response:**

- `1`: Missing campaign IDs.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing campaign IDs"
}
```

## Get Campaigns

This API endpoint retrieves a list of campaigns based on specified criteria, including status, search keywords, and
optional statistics.

### <Badge type="info" text="HTTP REQUEST TYPE: POST" /> `/api.php`

**Request Parameters:**

| Parameter           | Description                                                | Required | Default |
|---------------------|------------------------------------------------------------|----------|---------|
| Command             | `Campaigns.Get`                                            | Yes      |         |
| RecordsPerRequest   | Number of campaigns to retrieve per request.               | No       | 0       |
| RecordsFrom         | Starting record number from where to retrieve campaigns.   | No       | 0       |
| CampaignStatus      | *(Optional)* Filter by campaign status (e.g., 'Draft').    | No       | All     |
| SearchKeyword       | *(Optional)* Keyword to search within campaign names.      | No       |         |
| OrderField          | Field to order the campaigns by (e.g., 'CampaignName').    | No       |         |
| OrderType           | Type of ordering ('ASC' or 'DESC').                        | No       |         |
| RetrieveTags        | *(Optional)* Indicates whether to retrieve campaign tags.  | No       | false   |
| Tags                | *(Optional)* Filter campaigns by specific tag IDs.         | No       |         |
| RetrieveStatistics  | *(Optional)* Indicates whether to retrieve campaign stats. | No       | true    |

**Success Response:**

A successful response contains an array of campaigns along with their total count.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `Campaigns`: Array of campaign details
- `TotalCampaigns`: Total number of campaigns matching the criteria

**Error Response:**

- No specific error codes defined in the provided code.
- 
**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "Campaigns": [
    /* Array of campaign details */
  ],
  "TotalCampaigns": 25
}
```
