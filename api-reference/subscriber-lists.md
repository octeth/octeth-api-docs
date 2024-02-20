---
layout: doc
---

# Subscriber Lists

## Retrieve List Details

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves detailed information about a specific list, including segments, custom fields, subscriber tags, and autoresponders associated with the list.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | List.Assets                                                          | Yes       |
| ListID    | The unique identifier for the list to retrieve details for           | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
      "SessionID": "your-session-id",
      "APIKey": "your-api-key",
      "Command": "List.Assets",
      "ListID": "123"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListID": "123",
    "ListName": "Sample List",
    "RelOwnerUserID": "456"
    // ... other list details
  },
  "Segments": [
    // ... list of segments
  ],
  "CustomFields": [
    // ... list of custom fields
  ],
  "SubscriberTags": [
    // ... list of subscriber tags
  ],
  "AutoResponders": [
    // ... list of autoresponders
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Required field 'ListID' is missing."
}
```

```txt [Error Codes]
1: Required field 'ListID' is missing.
```
:::

## Create a New Subscriber List

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to create a new subscriber list for the user. The list will be associated with the user's account based on their `UserID`.

**Request Body Parameters:**

| Parameter          | Description                                                          | Required? |
|--------------------|----------------------------------------------------------------------|-----------|
| SessionID          | The ID of the user's current session                                 | Yes       |
| APIKey             | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command            | `List.Create` - The command to create a new subscriber list          | Yes       |
| SubscriberListName | The name of the new subscriber list to be created                    | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "List.Create",
    "subscriberlistname": "My New List"
}'
```

```json [Success Response]
{
    "Success": true,
    "ErrorCode": 0,
    "ErrorText": "",
    "ListID": 12345
}
```

```json [Error Response]
{
    "Success": false,
    "ErrorCode": [1],
    "ErrorText": "Required field missing: subscriberlistname"
}
```

```txt [Error Codes]
1: Required field missing: subscriberlistname
2: Duplicate list name (Note: This check is currently disabled)
3: User has exceeded the maximum number of subscriber lists
```
:::

## Retrieve Subscriber List

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a specific subscriber list based on the provided list identifier.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | List.Get                                                             | Yes       |
| ListID    | The unique identifier for the list to be retrieved                   | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "List.Get", "ListID": "123"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListID": "123",
    "ListName": "My Subscriber List",
    "SubscriberCount": 250,
    "EventListTrackerID": "abc",
    "EventUserTrackerID": "abc",
    "EventTrackerJS": "...",
    "EventTrackerProperties": []
    // Other list details...
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": {
    "listid": 1
  }
}
```

```txt [Error Codes]
1: The 'ListID' parameter is missing or invalid.
```
:::

## Update Subscriber List

<Badge type="info" text="POST" /> `/api.php`

This endpoint updates the information of an existing subscriber list based on the provided parameters.

**Request Body Parameters:**

| Parameter                                | Description                                                                      | Required? |
|------------------------------------------|----------------------------------------------------------------------------------|-----------|
| SessionID                                | The ID of the user's current session                                             | Yes       |
| APIKey                                   | The user's API key. Either `SessionID` or `APIKey` must be provided.             | Yes       |
| Command                                  | `List.Update`                                                                    | Yes       |
| SubscriberListID                         | The unique identifier of the subscriber list to update                           | Yes       |
| Name                                     | The new name of the subscriber list                                              | No        |
| SenderName                               | The new sender's name                                                            | No        |
| SenderEmailAddress                       | The new sender's email address                                                   | No        |
| SenderCompany                            | The new sender's company name                                                    | No        |
| SenderAddress                            | The new sender's address                                                         | No        |
| OptInMode                                | The opt-in mode for the list (`Single` or `Double`)                              | No        |
| OptInConfirmationEmailID                 | The email ID used for opt-in confirmation                                        | No        |
| OptOutAddToSuppressionList               | Whether to add opt-outs to the suppression list (`Yes` or `No`)                  | No        |
| OptOutAddToGlobalSuppressionList         | Whether to add opt-outs to the global suppression list (`Yes` or `No`)           | No        |
| HideInSubscriberArea                     | Whether to hide the list in the subscriber area (`true` or `false`)              | No        |
| SendServiceIntegrationFailedNotification | Whether to send notifications on service integration failure (`true` or `false`) | No        |
| SendActivityNotification                 | Whether to send activity notifications (`true` or `false`)                       | No        |
| SubscriptionConfirmationPendingPageURL   | URL for the subscription confirmation pending page                               | No        |
| SubscriptionConfirmedPageURL             | URL for the subscription confirmed page                                          | No        |
| SubscriptionErrorPageURL                 | URL for the subscription error page                                              | No        |
| UnsubscriptionConfirmedPageURL           | URL for the unsubscription confirmed page                                        | No        |
| UnsubscriptionErrorPageURL               | URL for the unsubscription error page                                            | No        |
| ReqByEmailSearchToAddress                | The email address to search for email-based requests                             | No        |
| ReqByEmailSubscriptionCommand            | The command for email-based subscription                                         | No        |
| ReqByEmailUnsubscriptionCommand          | The command for email-based unsubscription                                       | No        |
| SyncStatus                               | The status of data synchronization (`Enabled` or `Disabled`)                     | No        |
| SyncPeriod                               | The period for data synchronization                                              | No        |
| SyncSendReportEmail                      | Whether to send a report email after synchronization (`Yes` or `No`)             | No        |
| SyncMySQLHost                            | The MySQL host for data synchronization                                          | No        |
| SyncMySQLPort                            | The MySQL port for data synchronization                                          | No        |
| SyncMySQLUsername                        | The MySQL username for data synchronization                                      | No        |
| SyncMySQLPassword                        | The MySQL password for data synchronization                                      | No        |
| SyncMySQLDBName                          | The MySQL database name for data synchronization                                 | No        |
| SyncMySQLQuery                           | The MySQL query for data synchronization                                         | No        |
| SyncFieldMapping                         | The field mapping for data synchronization                                       | No        |
| SyncLastDateTime                         | The last date and time of data synchronization                                   | No        |
| OptOutScope                              | The scope of opt-out (`This list` or `All lists`)                                | No        |
| OptOutSubscribeTo                        | The list ID to subscribe to on opt-out                                           | No        |
| OptOutUnsubscribeFrom                    | The list ID to unsubscribe from on opt-out                                       | No        |
| OptInSubscribeTo                         | The list ID to subscribe to on opt-in                                            | No        |
| OptInUnsubscribeFrom                     | The list ID to unsubscribe from on opt-in                                        | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=List.Update' \
  -d 'SubscriberListID=123' \
  -d 'Name=Updated List Name'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "List": {
    "ListID": "123",
    "Name": "Updated List Name",
    // Other updated list details...
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": ["Subscriber list id is missing"]
}
```

```txt [Error Codes]
1: Subscriber list id is missing
2: Invalid subscriber list id
3: Invalid opt in mode
4: Invalid opt out scope
5: Invalid send service integration notification setting
6: Invalid setting
8: Data synchronization settings are invalid
9: Invalid email address for reqbyemailsearchtoaddress
10: Invalid opt out suppression list option
11: Nothing to update
```
:::

## Delete Subscriber Lists

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows for the deletion of one or more subscriber lists associated with a user's account. The user must provide the list IDs to be deleted.

**Request Body Parameters:**

| Parameter | Description                                                            | Required? |
|-----------|------------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                   | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.   | Yes       |
| Command   | The API command to execute, which is `Lists.Delete` for this endpoint. | Yes       |
| lists     | Comma-separated list IDs to be deleted                                 | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourapi.com/api.php \
-H "Content-Type: application/json" \
-d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Lists.Delete", "lists": "123,456"}'
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
    "lists": 1
  },
  "ErrorText": "Subscriber list ids are missing"
}
```

```txt [Error Codes]
1: Subscriber list ids are missing
```
:::

## Retrieve Subscriber Lists

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of subscriber lists for the authenticated user, with options to specify the number of records, starting point, order, and additional statistics.

**Request Body Parameters:**

| Parameter         | Description                                                                | Required? |
|-------------------|----------------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                       | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided.       | Yes       |
| Command           | `Lists.Get` - The command to execute the retrieval of subscriber lists.    | Yes       |
| RecordsPerRequest | The number of records to return per request.                               | No        |
| RecordsFrom       | The starting point for records to return.                                  | No        |
| OrderField        | The field by which to order the lists. Default is `ListID`.                | No        |
| OrderType         | The type of order for the lists, either `ASC` or `DESC`. Default is `ASC`. | No        |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Lists.Get",
    "RecordsPerRequest": 10,
    "RecordsFrom": 0,
    "OrderField": "ListID",
    "OrderType": "ASC"
}'
```

```json [Success Response]
{
    "Success": true,
    "ErrorCode": 0,
    "ErrorText": "",
    "TotalListCount": 25,
    "Lists": [
        {
            "ListID": "1",
            "EncryptedSaltedListID": "e4d909c290d0fb1ca068ffaddf22cbd0",
            "SyncLastDateTime": "2023-01-01 12:00:00"
        },
        {
            "ListID": "2",
            "EncryptedSaltedListID": "ab56b4d92b40713acc5af89985d4b786",
            "SyncLastDateTime": "2023-01-02 12:00:00"
        }
        // ... more lists
    ]
}
```

```json [Error Response]
{
    "Success": false,
    "ErrorCode": 101,
    "ErrorText": "Invalid SessionID or APIKey"
}
```

```txt [Error Codes]
101: "Invalid SessionID or APIKey."
```
:::
