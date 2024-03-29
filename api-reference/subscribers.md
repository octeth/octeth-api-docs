---
layout: doc
---

# Subscribers

## Unsubscribe a Subscriber

<Badge type="info" text="POST" /> `/api.php`

This API call allows you to unsubscribe a subscriber from a mailing list.

**Request Body Parameters:**

| Parameter         | Description                                                                 | Required? |
|-------------------|-----------------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                        | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command           | Subscriber.Unsubscribe                                                      | Yes       |
| ListID            | The unique identifier for the mailing list                                  | Yes       |
| IPAddress         | The IP address of the user making the request                               | Yes       |
| EmailAddress      | The email address of the subscriber to unsubscribe (if known)               | No        |
| SubscriberID      | The unique identifier for the subscriber to unsubscribe (if known)          | No        |
| CampaignID        | The unique identifier for the campaign associated with the unsubscription   | No        |
| AutoResponderID   | The unique identifier for the autoresponder associated with the unsubscription | No      |
| EmailID           | The unique identifier for the email associated with the unsubscription      | No        |
| Channel           | The channel through which the unsubscription is made                        | No        |
| Preview           | A flag to indicate if the unsubscription should be simulated (1) or not (0) | No        |
| AddToGlobalSuppression | A flag to indicate if the email should be added to the global suppression list | No    |
| RulesJSON         | A JSON string containing the rules for bulk unsubscription                  | No        |
| RulesOperator     | The operator to be used with the rules ('and' or 'or')                      | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Subscriber.Unsubscribe' \
  -d 'ListID=123' \
  -d 'IPAddress=192.168.1.1' \
  -d 'EmailAddress=john.doe@example.com'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "RedirectURL": "https://example.com/unsubscribed.html"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "List ID is required."
}
```

```txt [Error Codes]
1: List ID is required.
2: IP address is required.
3: Either email address or subscriber ID must be provided.
4: Invalid list ID or list does not exist.
5: User information could not be retrieved.
6: Invalid email address format.
7: Subscriber does not exist or does not belong to the list.
8: Invalid campaign ID or autoresponder ID.
9: Subscriber is already unsubscribed.
10: Invalid email ID.
11: Invalid query builder response.
```

:::

## Retrieve Subscriber Information

<Badge type="info" text="POST" /> `/api.php`

This API call retrieves detailed information about a specific subscriber, including tags, segments, and journeys
associated with them.

**Request Body Parameters:**

| Parameter       | Description                                           | Required? |
|-----------------|-------------------------------------------------------|-----------|
| SessionID       | The ID of the user's current session                  | Yes       |
| APIKey          | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command         | Subscriber.Get                                        | Yes       |
| EmailAddress    | The email address of the subscriber to retrieve       | Yes       |
| ListID          | The ID of the list the subscriber belongs to          | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Subscriber.Get", "EmailAddress": "subscriber@example.com", "ListID": "123"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": "456",
    "EmailAddress": "subscriber@example.com",
    "Suppressed": false,
    // Additional subscriber details...
  },
  "SubscriberTags": [
    // List of tags associated with the subscriber...
  ],
  "SubscriberSegments": [
    // List of segments the subscriber is part of...
  ],
  "SubscriberJourneys": [
    // List of journeys the subscriber is part of...
  ],
  "SubscriberWebsiteEvents": [
    // List of website events the subscriber is part of...
  ]
}
```

::: warning NOTICE
Available `SubscriptionStatus` values are `Opt-In Pending`, `Subscribed`, `Opt-Out Pending`, `Unsubscribed`
:::

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
1: Email address is required.
2: List ID is required.
3: Subscriber not found.
4: List not found.
```

:::

## Delete Subscribers

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to delete subscribers from a list. You can either specify individual subscriber IDs or use a
JSON rule set to define a group of subscribers to be deleted.

**Request Body Parameters:**

| Parameter         | Description                                                                 | Required? |
|-------------------|-----------------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                        | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command           | Subscribers.Delete                                                          | Yes       |
| SubscriberListID  | The unique identifier of the subscriber list                                | Yes       |
| Subscribers       | A comma-separated list of subscriber IDs to delete                          | No        |
| RulesJSON         | A JSON string defining the rules to select subscribers to delete            | Conditional |
| RulesOperator     | Operator to be used with rules ('and'/'or'). Defaults to 'or' if not valid. | No        |
| Suppressed        | A boolean to indicate if subscribers should be removed from suppression list| No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Subscribers.Delete' \
  -d 'SubscriberListID=123' \
  -d 'Subscribers=456,789' \
  -d 'Suppressed=true'
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
  "ErrorCode": [2],
  "ErrorText": ["Missing subscriber list id"]
}
```

```txt [Error Codes]
1: Missing subscribers parameter
2: Missing subscriber list id
3: Missing RulesJSON parameter
4: Missing RulesOperator parameter
5: Invalid list id
6: Invalid query builder response
7: Missing rules operator when RulesJSON is provided
```

:::

::: warning NOTICE

- Please note that if you do not provide the `Subscribers` parameter, you must provide both `RulesJSON`
  and `RulesOperator`.
- If `RulesOperator` is not provided or is invalid, it will default to 'or'.
- If `Suppressed` is set to true, the specified subscribers will be removed from the suppression list instead of being
  deleted.
  :::

## Retrieve Subscribers of a List

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves subscriber information based on various segments and criteria from a specified subscriber list.

**Request Body Parameters:**

| Parameter           | Description                                                                 | Required? |
|---------------------|-----------------------------------------------------------------------------|-----------|
| SessionID           | The ID of the user's current session                                        | Yes       |
| APIKey              | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command             | Subscribers.Get                                                             | Yes       |
| SubscriberListID    | The unique identifier for the subscriber list                               | Yes       |
| SubscriberSegment   | The segment of subscribers to retrieve (e.g., 'Active', 'Unsubscribed')     | Yes       |
| RecordsPerRequest   | The number of records to return per request                                 | No        |
| RecordsFrom         | The starting point from which to return records                             | No        |
| SearchField         | The field to search within (e.g., 'Email', 'Name')                          | No        |
| SearchKeyword       | The keyword to search for within the specified field                        | No        |
| OrderField          | The field to order the results by (e.g., 'DateAdded', 'Email')              | No        |
| OrderType           | The type of ordering to apply (e.g., 'ASC', 'DESC')                         | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Subscribers.Get' \
  -d 'SubscriberListID=123' \
  -d 'SubscriberSegment=Active' \
  -d 'RecordsPerRequest=25' \
  -d 'RecordsFrom=0'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": "1",
      "EmailAddress": "subscriber@example.com",
      // More subscriber fields...
    }
    // More subscribers...
  ],
  "TotalSubscribers": 100
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "SubscriberListID is a required field."
}
```

```txt [Error Codes]
1: SubscriberListID is a required field.
2: SubscriberSegment is a required field.
3: The list does not belong to the authenticated user.
```

:::

## Retrieve Subscribers

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of subscribers based on various criteria such as list ID, segment, and search parameters.

**Request Body Parameters:**

| Parameter            | Description                                                                 | Required? |
|----------------------|-----------------------------------------------------------------------------|-----------|
| SessionID            | The ID of the user's current session                                        | Yes       |
| APIKey               | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command              | `Subscribers.Search`                                                        | Yes       |
| ListID               | The unique identifier for the subscriber list                               | Yes       |
| Operator             | The operator to apply on the search (e.g., AND, OR)                         | Yes       |
| RecordsPerRequest    | The number of records to return per request                                 | No        |
| RecordsFrom          | The starting record number from which to return results                     | No        |
| OrderField           | The field by which to order the results                                     | No        |
| OrderType            | The order type (e.g., ASC, DESC)                                            | No        |
| Rules                | The search rules in JSON format                                             | No        |
| RulesJson            | The search rules in a JSON string                                           | No        |
| DebugQueryBuilder    | A flag to return the prepared SQL query for debugging purposes              | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Subscribers.Search' \
  -d 'ListID=123' \
  -d 'Operator=AND' \
  -d 'RecordsPerRequest=25' \
  -d 'RecordsFrom=0' \
  -d 'OrderField=EmailAddress' \
  -d 'OrderType=ASC'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "SubscriberID": 1,
      "EmailAddress": "example@example.com",
      "Suppressed": false,
      // More subscriber fields...
    }
    // More subscribers...
  ],
  "TotalSubscribers": 150
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "ListID is a required field."
}
```

```txt [Error Codes]
1: "ListID is a required field."
2: "Operator is a required field."
3: "The list does not belong to the authenticated user."
```

:::

## Request Subscriber Data Export

<Badge type="info" text="POST" /> `/api/v1/subscriber.export`

This API end-point allows for the export of subscriber data based on specified criteria. It supports filtering and
exporting in different formats.

**Request Body Parameters:**

| Parameter       | Description                                                                 | Required? |
|-----------------|-----------------------------------------------------------------------------|-----------|
| SessionID       | The ID of the user's current session                                        | Yes       |
| APIKey          | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| ListID          | The unique identifier for the list to export from                           | Yes       |
| RulesJSON       | JSON string containing the rules for filtering subscribers                  | Yes       |
| RulesOperator   | Operator to apply between rules ("and" or "or")                             | Yes       |
| ExportFormat    | The format for the export file ("csv" or "json")                            | Yes       |
| FieldsToExport  | Array of field names to include in the export                               | Yes       |
| Target          | The target subscribers to export ("", "Active", "Suppressed", etc. or ID)   | No        |

::: code-group

```bash [Example Request]
curl -X POST 'https://example.com/api/v1/subscriber.export' \
-H 'Authorization: Bearer {User API Key}' \
-H 'Content-Type: application/json' \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "ListID": "123",
    "RulesJSON": "{\"field\":\"value\"}",
    "RulesOperator": "and",
    "ExportFormat": "csv",
    "FieldsToExport": ["EmailAddress", "Name"],
    "Target": "Active"
}'
```

```json [Success Response]
{
    "ExportID": 456
}
```

```json [Error Response]
{
    "Errors": [
        {
            "Code": 1,
            "Message": "Missing ListID parameter"
        },
        {
            "Code": 2,
            "Message": "Missing RulesJSON parameter"
        }
        // Additional errors based on the validation
    ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
2: Missing RulesJSON parameter
3: Missing RulesOperator parameter
4: Missing ExportFormat parameter
5: Missing FieldsToExport parameter
6: Invalid ListID parameter
7: Invalid RulesJSON syntax. It must be a properly formatted JSON payload
8: RulesOperator must be either "and" or "or"
9: ExportFormat must be either "csv" or "json"
10: List not found
11: Target must be "", "Active", "Suppressed", "Unsubscribed", "Soft bounced", "Hard bounced" or segment ID
12: Segment not found
```

:::

## Export Subscriber Data

<Badge type="info" text="GET" /> `/api/v1/subscriber.export`

This API end-point allows you to export subscriber data from a specified list. You can also retrieve the status of an
export job or download the exported data if the job is completed.

**Request Body Parameters:**

| Parameter  | Description                                              | Required? |
|------------|----------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                     | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes |
| ListID     | The unique identifier for the list to export from        | Yes       |
| ExportID   | The unique identifier for a specific export job          | No        |
| Download   | A flag to indicate if the exported data should be downloaded (set to true to download) | No |

::: code-group

```bash [Example Request]
curl -X GET 'https://api.example.com/api/v1/subscriber.export' \
-H 'Authorization: Bearer {User API Key}' \
-H 'Content-Type: application/json' \
-d '{
    "SessionID": "example-session-id",
    "APIKey": "example-api-key",
    "ListID": "123",
    "ExportID": "456",
    "Download": true
}'
```

```json [Success Response]
{
    "ExportJob": {
        "ExportID": "456",
        "Status": "Completed",
        "SubmittedAt": "2023-01-01T00:00:00Z",
        "ExportOptions": {...},
        "DownloadSize": 1024
    }
}
```

```json [Error Response]
{
    "Errors": [
        {
            "Code": 1,
            "Message": "Missing ListID parameter"
        },
        {
            "Code": 2,
            "Message": "Invalid ListID parameter"
        },
        {
            "Code": 3,
            "Message": "Invalid ExportID parameter"
        },
        {
            "Code": 4,
            "Message": "List not found"
        },
        {
            "Code": 5,
            "Message": "Invalid ExportID parameter"
        },
        {
            "Code": 6,
            "Message": "Export job not found"
        }
    ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
2: Invalid ListID parameter
3: Invalid ExportID parameter
4: List not found
5: Invalid ExportID parameter
6: Export job not found
```

:::

::: warning NOTICE

- Please note that the `ExportID` parameter is optional.
- If provided, the API will return the status of the specified export job or allow you to download the exported data if
  the job is completed and the `Download` parameter is set to true.
- If `ExportID` is not provided, the API will return a list of all export jobs for the user.
  :::

## Import Subscribers

<Badge type="info" text="POST" /> `/api/v1/subscriber.import`

This API end-point allows for importing subscribers into a specified list. It supports importing from CSV data, Mailchimp, or ActiveCampaign. The import process can be customized with various options such as updating duplicates, triggering actions, and adding to suppression lists.

**Request Body Parameters:**

| Parameter | Description | Required? |
|-------------|---------------|--------------|
| SessionID | The ID of the user's current session | Yes |
| APIKey | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes |
| ListID | The unique identifier for the list to import subscribers into | Yes |
| AddToGlobalSuppressionList | Whether to add the imported subscribers to the global suppression list | Yes |
| AddToSuppressionList | Whether to add the imported subscribers to the list's suppression list | Yes |
| UpdateDuplicates | Whether to update existing subscribers if duplicates are found | Yes |
| TriggerActions | Whether to trigger actions for the imported subscribers | Yes |
| Tags | An array of tags to assign to the imported subscribers | Yes |
| ImportFrom.CSV.URL | The URL to fetch CSV data from (optional if CSV data is provided) | No |
| ImportFrom.CSV.Data | The CSV data to import (optional if a URL is provided) | No |
| ImportFrom.CSV.FieldTerminator | The character used to terminate fields in the CSV data | No |
| ImportFrom.CSV.FieldEncloser | The character used to enclose fields in the CSV data | No |
| ImportFrom.CSV.EscapedBy | The character used to escape special characters in the CSV data | No |
| ImportFrom.CSV.MappedFields | An array mapping CSV fields to subscriber attributes | Yes |
| ImportFrom.Mailchimp.APIKey | The Mailchimp API key for importing subscribers | No |
| ImportFrom.Mailchimp.Server | The Mailchimp server prefix for importing subscribers | No |
| ImportFrom.Mailchimp.MailchimpListID | The Mailchimp list ID to import subscribers from | No |
| ImportFrom.ActiveCampaign.APIKey | The ActiveCampaign API key for importing subscribers | No |
| ImportFrom.ActiveCampaign.AccountName | The ActiveCampaign account name for importing subscribers | No |
| ImportFrom.ActiveCampaign.ActiveCampaignListID | The ActiveCampaign list ID to import subscribers from | No |
| ImportStatusUpdateWebhookURL | A webhook URL to receive updates about the import status | No |

::: code-group

```bash [Example Request]
curl -X POST "https://example.com/api/v1/subscriber.import" \
     -H "Authorization: Bearer {User API Key}" \
     -H "Content-Type: application/json" \
     -d '{
           "SessionID": "example-session-id",
           "APIKey": "example-api-key",
           "ListID": "123",
           "AddToGlobalSuppressionList": false,
           "AddToSuppressionList": false,
           "UpdateDuplicates": true,
           "TriggerActions": true,
           "Tags": ["NewSubscriber", "Imported"],
           "ImportFrom": {
             "CSV": {
               "Data": "email,name\nexample@example.com,John Doe",
               "FieldTerminator": ",",
               "FieldEncloser": "\"",
               "EscapedBy": "\\",
               "MappedFields": {
                 "email": "Email",
                 "name": "FullName"
               }
             }
           }
         }'
```

```json [Success Response]
{
  "ImportID": 456
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing ListID parameter"
    },
    {
      "Code": 4,
      "Message": "Missing AddToGlobalSuppressionList parameter"
    }
    // Additional errors may be included
  ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
4: Missing AddToGlobalSuppressionList parameter
5: Missing AddToSuppressionList parameter
6: Missing UpdateDuplicates parameter
7: Missing TriggerActions parameter
8: Missing MappedFields parameter
9: Invalid AddToGlobalSuppressionList parameter
10: Invalid AddToSuppressionList parameter
11: Invalid UpdateDuplicates parameter
12: Invalid TriggerActions parameter
13: Invalid MappedFields parameter
14: ImportFrom.CSV.URL, ImportFrom.CSV.Data, ImportFrom.Mailchimp.APIKey or ImportFrom.ActiveCampaign.APIKey must be provided
15: Fields are not mapped in MappedFields parameter
16: Missing EscapedBy parameter
17: Field mapping is invalid
18: ImportFrom.CSV.URL remote data fetch failure
19: List not found
20: Failed to create import record
21: Missing Tags parameter
22: Mailchimp API key is missing
23: Mailchimp server is missing
24: Mailchimp Error: {error status} - {error title}: {error detail}
25: ActiveCampaign API key is missing
26: ActiveCampaign account name is missing
27: ActiveCampaign Error: {error status} - {error title}: {error detail}
28: ActiveCampaign Error: {error status} - {error title}: {error detail}
```
:::

## Retrieve Import Job Details

<Badge type="info" text="GET" /> `/api/v1/subscriber.import`

This API end-point is used to retrieve details of a specific import job for a subscriber list. It requires an admin-level authorization and provides comprehensive information about the import process, including status and statistics.

**Request Body Parameters:**

| Parameter   | Description                                           | Required? |
|-------------|-------------------------------------------------------|-----------|
| SessionID   | The ID of the user's current session                  | Yes       |
| APIKey      | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| ListID      | The unique identifier for the subscriber list         | Yes       |
| ImportID    | The unique identifier for the import job              | Yes       |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/subscriber.import" \
-H "Authorization: Bearer {Admin API Key}" \
-d "SessionID=exampleSessionId" \
-d "APIKey=exampleApiKey" \
-d "ListID=123" \
-d "ImportID=456"
```

```json [Success Response]
{
  "ImportJob": {
    "ImportID": "456",
    "ImportDate": "2023-01-01T00:00:00Z",
    "FinishedAt": "2023-01-01T01:00:00Z",
    "ImportStatus": "Completed",
    "FailedData": [],
    "TotalSubscribers": 1000,
    "TotalImported": 950,
    "TotalDuplicates": 30,
    "TotalFailed": 20
  }
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 5,
      "Message": "List not found"
    }
  ]
}
```

```txt [Error Codes]
1: Missing ListID parameter
2: Missing ImportID parameter
3: Invalid ListID parameter
4: Invalid ImportID parameter
5: List not found
6: Invalid ImportID parameter
7: Import job not found
```
:::

## Create a New Subscriber

<Badge type="info" text="POST" /> `api/v1/subscriber.create`

This endpoint is used to create a new subscriber in the system. It requires an admin API key for authorization and accepts various subscriber details.

**Request Body Parameters:**

| Parameter             | Description                                                                                 | Required?   |
|-----------------------|---------------------------------------------------------------------------------------------|-------------|
| SessionID             | The ID of the user's current session                                                        | Yes         |
| APIKey                | The user's API key. Either `SessionID` or `APIKey` must be provided.                        | Yes         |
| ListID                | The unique identifier for the mailing list                                                  | Yes         |
| EmailAddress          | The email address of the new subscriber                                                     | Yes         |
| Status                | The subscription status ('Opt-In Pending', 'Subscribed', 'Opt-Out Pending', 'Unsubscribed') | No          |
| OptInDate             | The date the user opted in                                                                  | Conditional |
| SubscriptionDate      | The date the user subscribed                                                                | Conditional |
| SubscriptionIP        | The IP address from which the subscription was made                                         | Conditional |
| UnsubscriptionDate    | The date the user unsubscribed                                                              | Conditional |
| UnsubscriptionIP      | The IP address from which the unsubscription was made                                       | Conditional |
| BounceType            | The type of email bounce (e.g., 'Not Bounced', 'Hard', 'Soft')                              | No          |
| CustomFields          | An array of custom field IDs and their values                                               | No          |
| UpdateIfDuplicate     | Flag to update subscriber if email address is duplicate                                     | No          |
| UpdateIfUnsubscribed  | Flag to update subscriber if previously unsubscribed                                        | No          |
| ApplyBehaviors        | Flag to apply behaviors associated with the subscription                                    | No          |
| SendConfirmationEmail | Flag to send a confirmation email to the subscriber                                         | No          |
| UpdateStatistics      | Flag to update statistics upon subscription                                                 | No          |
| TriggerWebServices    | Flag to trigger web services upon subscription                                              | No          |
| TriggerAutoResponders | Flag to trigger autoresponders upon subscription                                            | No          |

::: code-group

```bash [Example Request]
curl -X POST 'https://example.com/api/v1/subscriber.create' \
-H 'Authorization: Bearer {AdminApiKey}' \
-H 'Content-Type: application/json' \
-d '{
  "SessionID": "session_id_here",
  "APIKey": "api_key_here",
  "ListID": "list_id_here",
  "EmailAddress": "email@example.com",
  "Status": "Subscribed",
  "OptInDate": "2023-01-01",
  "SubscriptionDate": "2023-01-01",
  "SubscriptionIP": "192.168.1.1",
  "CustomFields": {
    "100":"First Name Value",
    "103":"Last Name Value"
  }
}'
```

```json [Success Response]
{
  "ErrorCode": 0,
  "SubscriberInformation": {
    "SubscriberID": "subscriber_id_here",
    "EmailAddress": "email@example.com",
    "Status": "Subscribed",
    // Additional subscriber details...
  },
  "SubscriberTags": [],
  "SubscriberSegments": [],
  "SubscriberJourneys": [],
  "SubscriberWebsiteEvents": []
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Missing EmailAddress parameter"
    },
    // Additional errors...
  ]
}
```

```text [Error Codes]
1: Missing ListID parameter
2: Missing EmailAddress parameter
3: Invalid EmailAddress. Make sure email address is valid.
4: Invalid ListID.
5: Invalid BounceType value.
6: Invalid Status value.
7: Invalid SubscriptionDate value.
8: Missing SubscriptionDate parameter
9: Missing SubscriptionIP parameter
10: Invalid SubscriptionIP value. It must be an IP address.
11: Missing UnsubscriptionDate parameter
12: Missing UnsubscriptionIP parameter
13: Invalid UnsubscriptionDate value.
14: Invalid UnsubscriptionIP value. It must be an IP address.
15: Missing OptInDate parameter
16: Invalid OptInDate value.
17: Invalid Custom Field value.
18: Subscriber create limit is exceeded
19: Invalid EmailAddress
20: Duplicate EmailAddress
21: Previously unsubscribed EmailAddress
22: Invalid user information
23: Invalid list information
```
:::

**HTTP Response and Error Codes:**

| HTTP Code | Error Code | Description                                  |
|-----------|------------|----------------------------------------------|
| 200       | 0          | Success                                      |
| 422       | 1-23       | Various errors related to input validation   |

## Update Subscriber Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to update the information of a subscriber in a mailing list. It allows for updating various subscriber details, including email address, subscription status, bounce type, and custom fields.

**Request Body Parameters:**

| Parameter                                 | Description                                                                                               | Required? |
|-------------------------------------------|-----------------------------------------------------------------------------------------------------------|-----------|
| SessionID                                 | The ID of the user's current session                                                                      | Yes       |
| APIKey                                    | The user's API key. Either `SessionID` or `APIKey` must be provided.                                      | Yes       |
| Command                                   | The API command to execute: `Subscriber.Update`                                                            | Yes       |
| SubscriberID                              | The unique identifier of the subscriber                                                                   | Yes       |
| SubscriberListID                          | The unique identifier of the subscriber list                                                              | Yes       |
| EmailAddress                              | The new email address of the subscriber (if applicable)                                                   | No        |
| SubscriptionStatus                        | The new subscription status of the subscriber (Opt-In Pending, Subscribed, Opt-Out Pending, Unsubscribed) | No        |
| BounceType                                | The new bounce type of the subscriber (Not Bounced, Soft, Hard)                                           | No        |
| Fields                                    | An array of custom field values to update                                                                 | No        |
| AuthenticationType                        | The type of authentication used                                                                           | No        |
| IgnoreAllOtherCustomFieldsExceptGivenOnes | Flag to ignore unspecified custom fields                                                                  | No        |

::: code-group

```bash [Example Request]
curl --location 'https://example.com/api.php' \
--form 'ResponseFormat="JSON"' \
--form 'Command="Subscriber.Update"' \
--form 'SessionID="exampleSessionId"' \
--form 'SubscriberListID="26"' \
--form 'SubscriberID="1008"' \
--form 'EmailAddress="test@gmail.com"' \
--form 'AuthenticationType="user"' \
--form 'IgnoreAllOtherCustomFieldsExceptGivenOnes="true"' \
--form 'Fields[CustomField59]="100"' \
--form 'SubscriptionStatus="Subscribed"' \
--form 'BounceType="Not Bounced"' \
--form 'Fields[CustomField59]="102"'
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
  "ErrorCode": 1,
  "ErrorText": "Required field 'subscriberid' is missing."
}
```

```text [Error Codes]
1: Required field 'subscriberid' is missing.
2: Required field 'subscriberlistid' is missing.
3: Email address is empty.
4: Email address is invalid.
5: Subscriber list does not exist or does not belong to the user.
6: Subscriber does not exist.
7: Email address is a duplicate.
8: Required custom field is missing.
9: Custom field value is not unique.
10: Custom field value failed validation.
```
:::

**HTTP Response and Error Codes:**

| HTTP Code | Error Code | Description                                      |
|-----------|------------|--------------------------------------------------|
| 200       | 0          | Success                                          |
| 400       | 1          | Missing required 'subscriberid' parameter        |
| 400       | 2          | Missing required 'subscriberlistid' parameter    |
| 400       | 3          | Email address is empty                           |
| 400       | 4          | Email address is invalid                         |
| 400       | 5          | Subscriber list does not exist or not owned      |
| 400       | 6          | Subscriber does not exist                        |
| 400       | 7          | Email address is a duplicate                     |
| 400       | 8          | Required custom field is missing                 |
| 400       | 9          | Custom field value is not unique                 |
| 400       | 10         | Custom field value failed validation             |

## Search Subscribers

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of subscribers based on the provided criteria, such as list ID and operator. It supports pagination and ordering of the subscriber list.

**Request Body Parameters:**

| Parameter         | Description                                                          | Required? |
|-------------------|----------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                 | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command           | `Subscribers.Search`                                                 | Yes       |
| ListID            | Unique identifier for the list                                       | Yes       |
| Operator          | Operator to apply on the list retrieval (and, or)                    | Yes       |
| RecordsPerRequest | Number of records to retrieve per request                            | No        |
| RecordsFrom       | Starting point for record retrieval                                  | No        |
| OrderField        | Field to order the records by                                        | No        |
| OrderType         | Type of ordering to apply (ASC or DESC)                              | No        |
| Rules             | Filtering rules for the query                                        | No        |
| RulesJson         | JSON representation of the filtering rules                           | No        |
| DebugQueryBuilder | If set to true, returns the prepared SQL query                       | No        |

::: code-group

::: warning NOTICE
Please refer to [this help article](/api-reference/criteria-syntax) for `RulesJSON` parameter syntax.
:::

```bash [Example Request]
curl --location 'https://example/api.php' \
--form 'ResponseFormat="JSON"' \
--form 'Command="Subscribers.Search"' \
--form 'SessionID="{SessionID}"' \
--form 'ListID="26"' \
--form 'Operator="and"' \
--form 'RulesJSON="[[{\"type\":\"fields\",\"field_id\":\"EmailAddress\",\"operator\":\"contains\",\"value\":\"cem\"}]]"' \
--form 'RecordsFrom="0"' \
--form 'RecordsPerRequest="3"' \
--form 'OrderField="EmailAddress"' \
--form 'OrderType="ASC"'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Subscribers": [
    {
      "EmailAddress": "example@example.com",
      "SubscriberID": "123",
      "SubscriberTags": ["Tag1", "Tag2"]
    }
  ],
  "TotalSubscribers": 100
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "List ID is required."
}
```

```text [Error Codes]
1: List ID is required.
2: Operator is required.
3: Unauthorized access to the list.
```
:::

**HTTP Response and Error Codes:**

| HTTP Code | Error Code | Description                        |
|-----------|------------|------------------------------------|
| 200       | 0          | Success                            |
| 400       | 1          | List ID is required.               |
| 400       | 2          | Operator is required.              |
| 403       | 3          | Unauthorized access to the list.   |