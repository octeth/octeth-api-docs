---
layout: doc
---

# Email Gateway API Documentation

::: warning
Each API end-point on this article may have a different authentication method. Please make sure you use the correct
authentication method.
:::

## Add a New API Key for Email Gateway

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows the creation of a new API key for the Email Gateway. It requires the user to provide a description
and the ID of the domain for which the API key will be created.

**Request Body Parameters:**

| Parameter    | Description                                                          | Required? |
|--------------|----------------------------------------------------------------------|-----------|
| SessionID    | The ID of the user's current session                                 | Yes       |
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command      | EmailGateway.AddAPI                                                  | Yes       |
| Description  | A brief description of the API key's intended use                    | Yes       |
| DomainID     | The unique identifier for the domain                                 | Yes       |
| ListID       | The list ID of the target subscriber                                 | No        |
| SubscriberID | The subscriber ID of the subscriber this email belongs to            | No        |
| JourneyID    | The journey ID this email is sent by                                 | No        |
| ActionID     | The action ID of the journey this email is sent by                   | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.AddAPI", "Description": "My new API key", "DomainID": "123"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewAPIKeyID": "new-api-key-id",
  "APIKey": {
    "Key": "generated-api-key",
    "Permissions": "permissions-list",
    "DomainID": "123",
    "Description": "My new API key"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing or invalid 'Description' parameter
2: Missing or invalid 'DomainID' parameter
3: Unable to retrieve sender domain with provided 'DomainID'
```

:::

## Add a New Email Sender Domain

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to add a new email sender domain to the user's account. It requires the domain name to be provided
and will validate it before adding it to the system.

**Request Body Parameters:**

| Parameter  | Description                                                          | Required? |
|------------|----------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                 | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command    | EmailGateway.AddDomain                                               | Yes       |
| DomainName | The domain name to be added as a sender domain                       | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.AddDomain",
    "DomainName": "example.com"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewSenderDomainID": 12345,
  "Domain": {
    "DomainName": "example.com",
    "VerificationStatus": "Pending",
    "DKIMStatus": "Pending",
    "SPFStatus": "Pending"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter: DomainName
2: Invalid domain name provided
3: User has reached the maximum number of sender domains allowed
```

:::

### Error Codes and Explanations

- **1**: Missing required parameter: DomainName. This error occurs when the `DomainName` parameter is not provided in
  the request.
- **2**: Invalid domain name provided. This error is returned when the provided domain name does not pass the validation
  checks.
- **3**: User has reached the maximum number of sender domains allowed. This error indicates that the user cannot add
  more sender domains because they have reached the limit set by their user group.

::: warning NOTICE
Please note that the actual domain name should be a valid domain and the user must have the capacity to add new sender
domains according to their group's limitations.
:::

## Add a New SMTP Configuration

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to add a new SMTP configuration for sending emails. The user must provide the domain ID associated
with their account to create the SMTP configuration.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.AddSMTP                                                 | Yes       |
| DomainID  | The unique identifier for the domain                                 | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.AddSMTP", "DomainID": "your-domain-id"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewSMTPID": "new-smtp-id",
  "SMTP": {
    "SMTPHost": "smtp.example.com",
    "SMTPPorts": [
      "25",
      "587",
      "465"
    ],
    "OtherSMTPInfo": "..."
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required field 'DomainID' is missing."
}
```

```txt [Error Codes]
1: Required field 'DomainID' is missing.
2: Unable to retrieve the sender domain.
```

:::

## Add a New Webhook for Email Events

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows the user to create a new webhook for tracking specific email events related to a domain. The
webhook will be triggered by events such as email delivery, bounces, opens, clicks, unsubscribes, and complaints.

**Request Body Parameters:**

| Parameter  | Description                                                                              | Required? |
|------------|------------------------------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                                     | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided.                     | Yes       |
| Command    | EmailGateway.AddWebhook                                                                  | Yes       |
| DomainID   | The unique identifier for the domain                                                     | Yes       |
| Event      | The type of email event to track (delivery, bounce, open, click, unsubscribe, complaint) | Yes       |
| WebhookURL | The URL to which the webhook will send event notifications                               | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.AddWebhook",
    "DomainID": "123",
    "Event": "bounce",
    "WebhookURL": "https://yourdomain.com/webhook"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "NewWebhookID": "456"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ]
}
```

```txt [Error Codes]
1: Missing required parameter DomainID
2: Missing required parameter Event
3: Invalid event type specified
4: Domain not found or access denied
5: Missing required parameter WebhookURL
```

:::

::: warning NOTICE
Please note that the `DomainID` must correspond to a domain that the user has access to, and the `Event` must be one of
the specified types.
:::

## Add a New Webhook for Email Events (End User Friendly)

<Badge type="info" text="POST" /> `/api/v1/webhooks`

This API end-point is used to register a new webhook for a specific event type. The webhook URL will be called when the
specified event occurs.

**Request Body Parameters:**

| Parameter    | Description                                             | Required? |
|--------------|---------------------------------------------------------|-----------|
| Event        | The type of event to register the webhook for           | Yes       |
| WebhookURL   | The URL to which the webhook should send the event data | Yes       |
| SenderAPIKey | The API key associated with the sender domain           | Yes       |

::: code-group

```bash [Example Request]
curl -X POST "https://example.com/api/v1/webhooks" \
     -H "Authorization: Bearer {sender_domain_api_key}" \
     -H "Content-Type: application/json" \
     -d '{
           "Event": "delivered",
           "WebhookURL": "https://yourdomain.com/webhook"
         }'
```

```json [Success Response]
{
  "NewWebhookID": "12345"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 5,
      "Message": "WebhookURL is missing"
    }
  ]
}
```

```txt [Error Codes]
2: "Event is missing"
3: "Invalid Event value"
5: "WebhookURL is missing"
13: "Invalid SenderAPIKey"
429: "Too many requests. Wait for {seconds} seconds for another {attempts} attempts."
```

:::

::: warning NOTICE

- Please note that the error codes are associated with specific error messages that provide more context about the
  error.
- Ensure that the `Event` parameter is one of the
  following: `delivery`, `bounce`, `open`, `click`, `unsubscribe`, `complaint`.
- The `WebhookURL` must be a valid URL format.
- The `SenderAPIKey` must be valid and associated with an active user account and sender domain.
- If you exceed the rate limit, you will need to wait before sending more requests.
  :::

## Retrieve Aggregated Email Events

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves aggregated email event data for a specified sender domain within a given date range. It allows
for the aggregation of events based on a specified field and size limit.

**Request Body Parameters:**

| Parameter       | Description                                                          | Required? |
|-----------------|----------------------------------------------------------------------|-----------|
| SessionID       | The ID of the user's current session                                 | Yes       |
| APIKey          | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command         | EmailGateway.AggrEvents                                              | Yes       |
| DomainID        | The unique identifier for the sender's domain                        | Yes       |
| StartDate       | The start date for the event data retrieval (format: YYYY-MM-DD)     | No        |
| EndDate         | The end date for the event data retrieval (format: YYYY-MM-DD)       | No        |
| AggregatedField | The field to aggregate the event data by                             | No        |
| AggregateSize   | The maximum number of aggregation buckets to return                  | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.AggrEvents",
    "DomainID": 123,
    "StartDate": "2023-01-01",
    "EndDate": "2023-01-31",
    "AggregatedField": "eventType",
    "AggregateSize": 10
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "AggBuckets": [
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required parameter missing: DomainID"
}
```

```txt [Error Codes]
1: Required parameter missing: DomainID
2: Failed to retrieve sender domain
```

:::

## Clear Domain Email Queue

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to clear the email queue for a specific domain. It updates the status of pending emails to "
Failed" for the given domain associated with the user's account.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.ClearDomainQueue                                        | Yes       |
| DomainID  | The unique identifier for the domain to clear the queue              | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.ClearDomainQueue", "DomainID": 123}'
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
1: Missing required parameter: DomainID
2: Unable to retrieve sender domain
```

:::

## Delete an Email Gateway API Key

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows a user to delete an existing API key associated with their email gateway. The user must provide the
unique identifier for the API key they wish to delete.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.DeleteAPI                                               | Yes       |
| ApiKeyId  | The unique identifier for the API key to be deleted                  | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.DeleteAPI", "ApiKeyId": "your-api-key-id"}'
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
  "ErrorCode": 1,
  "ErrorMessage": "Missing required parameter: ApiKeyId"
}
```

```txt [Error Codes]
1: Missing required parameter: ApiKeyId
2: Invalid API key or API key not found
```

:::

## Delete Email Gateway Domain

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to delete a domain from the email gateway system. It requires the user to provide the unique
identifier for the domain they wish to delete.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.DeleteDomain                                            | Yes       |
| DomainID  | The unique identifier for the domain to be deleted                   | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.DeleteDomain",
    "DomainID": "12345"
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
  "ErrorCode": 1,
  "ErrorMessage": "Missing required parameter: DomainID"
}
```

```txt [Error Codes]
1: Missing required parameter: DomainID
2: Domain not found or user does not have permission to delete the domain
```

:::

## Delete SMTP Configuration

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to delete an SMTP configuration associated with a user's account. The SMTP configuration is
identified by its unique ID.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.DeleteSMTP                                              | Yes       |
| smtpid    | The unique identifier for the SMTP configuration                     | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.DeleteSMTP", "smtpid": "123"}'
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
1: Required field is missing
2: SMTP configuration not found or user does not have permission
```

:::

## Delete an Email Webhook

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows the user to delete a specific email webhook associated with their account. The user must provide
the unique identifiers for the webhook and the domain it is associated with.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.DeleteWebhook                                           | Yes       |
| WebhookID | The unique identifier for the webhook to delete                      | Yes       |
| DomainID  | The unique identifier for the domain associated with the webhook     | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=EmailGateway.DeleteWebhook' \
  -d 'WebhookID=123' \
  -d 'DomainID=456'
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
1: Missing required parameter: WebhookID or DomainID
2: Invalid DomainID or DomainID not found
3: Domain validation failed
4: Webhook not found or user does not have permission to access it
```

:::

## Delete an Email Webhook (End User Friendly)

<Badge type="info" text="DELETE" /> `/api/v1/webhooks`

This endpoint allows you to delete a specific webhook by providing its unique identifier. The request must be
authenticated using a bearer token, which should be the sender domain API key.

**Request Body Parameters:**

| Parameter | Description                                        | Required? |
|-----------|----------------------------------------------------|-----------|
| WebhookID | The unique identifier of the webhook to be deleted | Yes       |

::: code-group

```bash [Example Request]
curl -X DELETE "https://example.com/api/v1/webhooks" \
     -H "Authorization: Bearer {senderapikey}" \
     -d '{"WebhookID":"123"}'
```

```json [Success Response]
{
  "Message": "Webhook successfully deleted."
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Invalid WebhookID"
    }
  ]
}
```

```txt [Error Codes]
1: "WebhookID is missing"
2: "Invalid user account"
4: "Invalid WebhookID"
13: "Invalid SenderAPIKey"
429: "Too many requests. Wait for {seconds} seconds for another {attempts} attempts."
```

:::

## Retrieve Domain Statistics

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to retrieve statistical data for a specific domain within the email gateway system. It provides
overall statistics, comparison statistics, and tag-based statistics for the domain.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.DomainStats                                             | Yes       |
| DomainID  | The unique identifier for the domain                                 | Yes       |
| StartDate | The start date for the statistics period (format: YYYY-MM-DD)        | No        |
| EndDate   | The end date for the statistics period (format: YYYY-MM-DD)          | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.DomainStats",
    "DomainID": "123",
    "StartDate": "2023-01-01",
    "EndDate": "2023-01-31"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Stats": {
  },
  "ComparisonStats": {
  },
  "TagStats": {
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required parameter missing: DomainID"
}
```

```txt [Error Codes]
1: Required parameter missing: DomainID
2: Unable to retrieve domain information
```

:::

## Retrieve Sender Domain API Keys

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to retrieve the API keys associated with a specific sender domain for the authenticated user.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.GetAPIs                                                 | Yes       |
| DomainID  | The unique identifier for the domain                                 | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.GetAPIs", "DomainID": 123}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "APIKeys": [
    {
      "KeyID": "key-id",
      "DomainID": "domain-id",
      "UserID": "user-id",
      "Key": "api-key",
      "Permissions": "permissions",
      "CreationDate": "creation-date",
      "LastUsedDate": "last-used-date"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter: DomainID
2: Unable to retrieve sender domain
```

:::

## Retrieve Sender Domain Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves the public information of a sender domain associated with the user's account.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.GetDomain                                               | Yes       |
| DomainID  | The unique identifier for the domain to retrieve                     | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.GetDomain", "DomainID": 123}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": 123,
    "DomainName": "example.com",
    "IsActive": true
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required parameter missing: DomainID"
}
```

```txt [Error Codes]
1: Required parameter missing: DomainID
2: Unable to retrieve domain information
```

:::

## Retrieve Sender Domains

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of sender domains associated with the user's account.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.GetDomains                                              | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.GetDomains"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domains": [
    {
      "DomainID": "123",
      "DomainName": "example.com",
      "Verified": true,
      "Active": true
    },
    {
      "DomainID": "124",
      "DomainName": "example.net",
      "Verified": false,
      "Active": false
    }
  ]
}
```

```txt [Error Response]
This API end-point doesn't return an error code.
```

```txt [Error Codes]
This API end-point doesn't return an error code.
```

:::

## Retrieve Email Events

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of email events for a specified sender domain. It allows filtering by event type, query
string, and date range.

**Request Body Parameters:**

| Parameter     | Description                                                          | Required? |
|---------------|----------------------------------------------------------------------|-----------|
| SessionID     | The ID of the user's current session                                 | Yes       |
| APIKey        | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command       | EmailGateway.GetEvents                                               | Yes       |
| DomainID      | Unique identifier for the sender domain                              | Yes       |
| StartFrom     | The starting point for records retrieval                             | Yes       |
| RetrieveCount | The number of records to retrieve (max 100)                          | Yes       |
| StartDate     | The start date for filtering events (format: YYYY-MM-DD)             | No        |
| EndDate       | The end date for filtering events (format: YYYY-MM-DD)               | No        |
| Event         | The type of event to filter by                                       | No        |
| Query         | A query string to filter events                                      | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.GetEvents",
    "DomainID": 123,
    "StartFrom": 0,
    "RetrieveCount": 50,
    "StartDate": "2023-01-01",
    "EndDate": "2023-01-31",
    "Event": "open",
    "Query": "subject:welcome"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 150,
  "Events": [
    {
      "event_type": "open",
      "timestamp": "2023-01-01T12:00:00Z",
      "message": {
        "headers": {
          "subject": "Welcome to our service!"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required parameter missing: DomainID"
}
```

```txt [Error Codes]
1: Required parameter missing: DomainID
4: Required parameter missing: StartFrom
5: Required parameter missing: RetrieveCount
2: Failed to retrieve sender domain
```

:::

## Retrieve Email Events (End User Friendly)

<Badge type="info" text="GET" /> `/api/v1/events`

This API end-point allows you to retrieve a list of events for a given sender domain. The events can be filtered by date
range, event type, and message ID.

**Request Body Parameters:**

| Parameter     | Description                                                              | Required? |
|---------------|--------------------------------------------------------------------------|-----------|
| StartFrom     | The starting index for the events to retrieve                            | No        |
| RetrieveCount | The number of events to retrieve (default is 5, max is 100)              | No        |
| StartDate     | The start date for filtering events (timestamp or `YYYY-MM-DD HH:MM:SS`) | No        |
| EndDate       | The end date for filtering events (timestamp or `YYYY-MM-DD HH:MM:SS`)   | No        |
| Event         | The type of event to filter (e.g., `open`, `click`, etc.)                | No        |
| MessageID     | The ID of the message to filter events                                   | No        |

::: code-group

```bash [Example Request]
curl -X GET "https://api.example.com/api/v1/events" \
     -H "Authorization: Bearer {sender_domain_api_key}" \
     -d "StartFrom=0" \
     -d "RetrieveCount=10" \
     -d "StartDate=1617235200" \
     -d "EndDate=1619827200" \
     -d "Event=open" \
     -d "MessageID=12345"
```

```json [Success Response]
{
  "TotalRecords": 25,
  "Events": [
    {
      "EventId": "evt_123",
      "EventType": "open",
      "EventTimestamp": "2021-04-01T12:00:00Z",
      "Recipient": "user@example.com",
      "MessageId": "msg_123",
      "CampaignId": "camp_123",
      "Details": {
        "UserAgent": "Mozilla/5.0...",
        "IpAddress": "192.0.2.1"
      }
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing SenderAPIKey"
    },
    {
      "Code": 4,
      "Message": "Missing StartFrom"
    },
    {
      "Code": 5,
      "Message": "Missing RetrieveCount"
    }
  ]
}
```

```txt [Error Codes]
1: Missing SenderAPIKey
2: Invalid user account
4: Missing StartFrom
5: Missing RetrieveCount
13: Invalid SenderAPIKey
429: Too many requests. Please wait for {seconds} seconds before trying again.
```

:::

## Retrieve SMTP Server Details

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves the SMTP server details associated with a given domain ID for the authenticated user.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.GetSMTPs                                                | Yes       |
| DomainID  | The unique identifier for the domain                                 | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.GetSMTPs", "DomainID": 123}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTPs": [
    {
      "SMTPID": "smtp-id",
      "SMTPHost": "smtp.example.com",
      "SMTPPorts": [
        "25",
        "587",
        "465"
      ],
      "Username": "user@example.com",
      "Password": "encrypted-password",
      "FromEmail": "from@example.com",
      "FromName": "Example Sender",
      "ReplyToEmail": "reply-to@example.com",
      "ReplyToName": "Example Reply",
      "IsActive": true
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter 'DomainID'.
2: Unable to retrieve sender domain details.
```

:::

## Retrieve Domain Webhooks

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of webhooks associated with a specific domain owned by the user.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.GetWebhooks                                             | Yes       |
| DomainID  | The unique identifier for the domain                                 | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.GetWebhooks",
    "DomainID": "your-domain-id"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SigningKey": "webhook-signing-key",
  "Webhooks": [
    {
      "WebhookID": "webhook-id-1",
      "URL": "https://yourdomain.com/webhook1",
      "Events": [
        "send",
        "open",
        "click"
      ]
    },
    {
      "WebhookID": "webhook-id-2",
      "URL": "https://yourdomain.com/webhook2",
      "Events": [
        "bounce",
        "complaint"
      ]
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter DomainID
2: Invalid domain or domain does not belong to the user
```

:::

## Retrieve Domain Webhooks (End User Friendly)

<Badge type="info" text="GET" /> `/api/v1/webhooks`

This endpoint retrieves a list of webhooks associated with a sender domain. The sender domain API key must be provided
as a bearer token for authorization.

**Request Body Parameters:**

| Parameter    | Description                                   | Required? |
|--------------|-----------------------------------------------|-----------|
| SenderAPIKey | The API key associated with the sender domain | Yes       |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/webhooks" \
     -H "Authorization: Bearer {senderapikey}" \
     -H "Content-Type: application/json"
```

```json [Success Response]
{
  "Webhooks": [
    {
      "Event": "delivered",
      "URL": "https://example.com/webhook/delivery",
      "Status": "Active"
    },
    {
      "Event": "bounced",
      "URL": "https://example.com/webhook/bounce",
      "Status": "Active"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 13,
      "Message": "Invalid SenderAPIKey"
    },
    {
      "Code": 2,
      "Message": "Invalid user account"
    },
    {
      "Code": 429,
      "Message": "Too many requests. Wait for {seconds} seconds for another {attempts} attempts."
    }
  ]
}
```

```txt [Error Codes]
2: Invalid user account
13: Invalid SenderAPIKey
429: Too many requests. Rate limit exceeded.
```

:::

## Reset SMTP Password

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows a user to reset the password for a specific SMTP configuration associated with their account.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.ResetSMTPPassword                                       | Yes       |
| smtpid    | The unique identifier for the SMTP configuration                     | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.ResetSMTPPassword",
    "smtpid": "your-smtp-id"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SMTP": {
    "SMTPID": "your-smtp-id",
    "Server": "smtp.example.com",
    "Port": 587,
    "Username": "user@example.com"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Missing required parameter 'smtpid'
2: SMTP configuration not found or access denied
```

:::

## Update Email Sender Domain

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to update the settings of an email sender domain. It allows the user to modify tracking options,
hosting provider, and subdomain information associated with a sender domain.

**Request Body Parameters:**

| Parameter       | Description                                                          | Required? |
|-----------------|----------------------------------------------------------------------|-----------|
| SessionID       | The ID of the user's current session                                 | Yes       |
| APIKey          | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command         | EmailGateway.UpdateDomain                                            | Yes       |
| DomainID        | The unique identifier for the domain to be updated                   | Yes       |
| LinkTracking    | Enable or disable link tracking (1 for enable, 0 for disable)        | No        |
| OpenTracking    | Enable or disable open tracking (1 for enable, 0 for disable)        | No        |
| UnsubscribeLink | Enable or disable unsubscribe link (1 for enable, 0 for disable)     | No        |
| HostingProvider | The name of the hosting provider                                     | No        |
| Subdomain       | The subdomain to be associated with the sender domain                | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "EmailGateway.UpdateDomain",
    "DomainID": "123",
    "LinkTracking": "1",
    "OpenTracking": "1",
    "UnsubscribeLink": "1",
    "HostingProvider": "YourHostingProvider",
    "Subdomain": "mail"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": "123",
    "LinkTracking": "1",
    "OpenTracking": "1",
    "UnsubscribeLink": "1",
    "HostingProvider": "YourHostingProvider",
    "Subdomain": "mail"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required field 'DomainID' is missing."
}
```

```txt [Error Codes]
1: Required field 'DomainID' is missing.
5: Unable to retrieve sender domain information.
```

:::

## Verify Domain Ownership

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to verify the ownership of a domain by checking its DNS records. It ensures that the domain is
properly configured with the necessary DNS records for email sending services.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | EmailGateway.VerifyDomain                                            | Yes       |
| DomainID  | The unique identifier for the domain to be verified                  | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "EmailGateway.VerifyDomain", "DomainID": "123"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Domain": {
    "DomainID": "123",
    "DomainName": "example.com",
    "Status": "Enabled"
  },
  "DNSVerificationResults": [
    {
      "Host": "example.com",
      "Type": "TXT",
      "Value": "v=spf1 include:mailgun.org ~all",
      "Verified": true
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required field 'DomainID' is missing."
}
```

```txt [Error Codes]
1: Required field 'DomainID' is missing.
2: Unable to retrieve the sender domain information.
```

:::

## Send Email

<Badge type="info" text="POST" /> `/api/v1/email`

This API end-point allows you to send an email with various options such as HTML content, plain text content,
attachments, and more. It requires a sender domain API key for authorization.

**Request Body Parameters:**

| Parameter    | Description                                                              | Required? |
|--------------|--------------------------------------------------------------------------|-----------|
| SenderAPIKey | The API key associated with the sender's domain                          | Yes       |
| Subject      | The subject of the email                                                 | Yes       |
| ContentType  | The type of content being sent (e.g., 'html' or 'plain')                 | Yes       |
| HtmlContent  | The HTML content of the email (required if ContentType is 'html')        | No        |
| PlainContent | The plain text content of the email (required if ContentType is 'plain') | No        |
| From         | The sender's email address and name                                      | Yes       |
| To           | The recipient's email address and name                                   | Yes       |
| CC           | The CC'd recipients' email addresses and names                           | No        |
| BCC          | The BCC'd recipients' email addresses and names                          | No        |
| ReplyTo      | The Reply-To email address and name                                      | No        |
| Attachments  | An array of attachments to include in the email                          | No        |
| Headers      | Custom headers to include in the email                                   | No        |
| Tags         | Tags associated with the email for tracking purposes                     | No        |
| TrackLinks   | Whether to track links in the email                                      | No        |
| TrackOpens   | Whether to track opens of the email                                      | No        |
| SendAt       | The planned delivery time of the email                                   | No        |
| TargetListID | The ID of the target subscriber list (if sending to a list)              | No        |

::: code-group

```bash [Example Request]
curl -X POST "http://example.com/api/v1/email" \
     -H "Authorization: Bearer {SenderDomainAPIKey}" \
     -H "Content-Type: application/json" \
     -d '{
           "SenderAPIKey": "example-sender-api-key",
           "Subject": "Hello World",
           "ContentType": "html",
           "HtmlContent": "<p>Hello, World!</p>",
           "From": {
             "email": "sender@example.com",
             "name": "John Doe"
           },
           "To": [
             {
               "email": "recipient@example.com",
               "name": "Jane Doe"
             }
           ]
         }'
```

```json [Success Response]
{
  "MessageID": "example-uuid"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 8,
      "Message": "Missing Subject"
    }
  ]
}
```

```txt [Error Codes]
1: Missing SenderAPIKey
2: Invalid DomainID
3: From parameter is either missing or invalid. Make sure you pass both name and email address for the from field
8: Missing Subject
9: Missing ContentType
10: Missing HTMLContent
11: Missing PlainContent
12: Invalid or deactivated user account
13: Invalid SenderAPIKey
14: Email address is in the suppression list. Email delivery is blocked.
15: Invalid TemplateID
16: Invalid TargetListID
17: Email sending limit reached
18: Recipient name or email address is missing
19: Recipient email address is invalid.
20: There is no recipient set for the email.
21: CC name or email address is missing
22: CC email address is invalid.
23: Invalid from email address format
24: BCC email addresses must be set as an array
25: BCC name or email address is missing
26: BCC email address is invalid.
27: The number of BCC email addresses exceed the allowed email address count
28: Reply-To email addresses must be set as an array
29: Reply-To name or email address is missing
30: Reply-To email address is invalid.
31: The number of Reply-To email addresses exceed the allowed email address count
32: Domain is not activated
34: User account is not verified
429: Too many requests. Wait for X seconds for another Y attempts.
429: You have exceeded your send rate limits. Please wait before sending another email.
```

:::
