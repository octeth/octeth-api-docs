---
layout: doc
---

# Subscriber Lists

## Create a Subscriber List

This API endpoint is used to create a new subscriber list. It checks for required fields, validates user limits, and
then proceeds to create a new list.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter           | Description                                |          |
|---------------------|--------------------------------------------|----------|
| Command             | `List.Create`                              | Required |
| SubscriberListName  | The name of the subscriber list to create. | Required |

**Success Response:**

A successful response will return a JSON object containing the following keys:

- `Success`: true
- `ErrorCode`: 0
- `ErrorText`: An empty string indicating no error.
- `ListId`: The ID of the newly created subscriber list.

**Error Response:**

- `1`: Missing required fields.
- `2`: User has exceeded the maximum number of subscriber lists allowed.
- `3`: Other unspecified errors.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ListId": 12345
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  "ErrorText": "Missing required fields: SubscriberListName"
}
```

## Update a Subscriber List

This API endpoint is used to update an existing subscriber list. It checks if the required fields are provided, verifies
the existence of the list, and then updates various properties of the list as specified.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter                                | Description                                                                           |          |
|------------------------------------------|---------------------------------------------------------------------------------------|----------|
| Command                                  | `List.Update`                                                                         | Required |
| SubscriberListId                         | The ID of the subscriber list to update.                                              | Required |
| Name                                     | *(Optional)* New name for the subscriber list.                                        | Optional |
| SenderName                               | *(Optional)* New sender's name. Only available if enabled in group options.           | Optional |
| SenderEmailAddress                       | *(Optional)* New sender's email address.                                              | Optional |
| SenderCompany                            | *(Optional)* New sender's company name.                                               | Optional |
| SenderAddress                            | *(Optional)* New sender's address.                                                    | Optional |
| OptInMode                                | *(Optional)* The opt-in mode for the list ('Single' or 'Double').                     | Optional |
| OptInConfirmationEmailId                 | *(Optional)* The email ID for opt-in confirmation.                                    | Optional |
| OptOutAddToSuppressionList               | *(Optional)* Whether to add opt-outs to suppression list ('Yes' or 'No').             | Optional |
| OptOutAddToGlobalSuppressionList         | *(Optional)* Whether to add opt-outs to global suppression list ('Yes' or 'No').      | Optional |
| HideInSubscriberArea                     | *(Optional)* Whether to hide the list in subscriber area ('true' or 'false').         | Optional |
| SendServiceIntegrationFailedNotification | *(Optional)* Notification setting for failed service integration ('true' or 'false'). | Optional |
| SendActivityNotification                 | *(Optional)* Notification setting for activity ('true' or 'false').                   | Optional |
| SubscriptionConfirmationPendingPageUrl   | *(Optional)* URL for pending subscription confirmation.                               | Optional |
| SubscriptionConfirmedPageUrl             | *(Optional)* URL for confirmed subscription.                                          | Optional |
| SubscriptionErrorPageUrl                 | *(Optional)* URL for subscription error.                                              | Optional |
| UnsubscriptionConfirmedPageUrl           | *(Optional)* URL for confirmed unsubscription.                                        | Optional |
| UnsubscriptionErrorPageUrl               | *(Optional)* URL for unsubscription error.                                            | Optional |
| ReqByEmailSearchToAddress                | *(Optional)* Email address for request by email feature.                              | Optional |
| ReqByEmailSubscriptionCommand            | *(Optional)* Command for subscription via email.                                      | Optional |
| ReqByEmailUnsubscriptionCommand          | *(Optional)* Command for unsubscription via email.                                    | Optional |
| SyncStatus                               | *(Optional)* Sync status ('Enabled' or 'Disabled').                                   | Optional |
| SyncPeriod                               | *(Optional)* Sync period.                                                             | Optional |
| SyncSendReportEmail                      | *(Optional)* Email setting for sync report ('Yes' or 'No').                           | Optional |
| SyncMySQLHost                            | *(Optional)* MySQL host for data sync.                                                | Optional |
| SyncMySQLPort                            | *(Optional)* MySQL port for data sync.                                                | Optional |
| SyncMySQLUsername                        | *(Optional)* MySQL username for data sync.                                            | Optional |
| SyncMySQLPassword                        | *(Optional)* MySQL password for data sync.                                            | Optional |
| SyncMySQLDBName                          | *(Optional)* MySQL database name for data sync.                                       | Optional |
| SyncMySQLQuery                           | *(Optional)* MySQL query for data sync.                                               | Optional |
| SyncFieldMapping                         | *(Optional)* Field mapping for data sync.                                             | Optional |
| OptOutScope                              | *(Optional)* Scope for opting out ('This list' or 'All lists').                       | Optional |
| OptOutSubscribeTo                        | *(Optional)* List ID to subscribe to when opting out.                                 | Optional |
| OptOutUnsubscribeFrom                    | *(Optional)* List ID to unsubscribe from when opting out.                             | Optional |
| OptInSubscribeTo                         | *(Optional)* List ID to subscribe to during opt-in.                                   | Optional |
| OptInUnsubscribeFrom                     | *(Optional)* List ID to unsubscribe from during opt-in.                               | Optional |

**Success Response:**

A successful response will return a JSON object containing the following keys:

- `Success`: true
- `ErrorCode`: 0
- `ErrorText`: An empty string indicating no error.
- `List`: An array of updated list information.

**Error Response:**

- `1`: Missing subscriber list ID.
- `2`: Invalid subscriber list ID.
- `3`: Invalid opt-in mode
- `10`: Invalid opt out suppression list option or global suppression list option.

## Get Subscriber List Details

This API endpoint retrieves the details of a specific subscriber list. It requires the list ID and returns the
information associated with that list.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter           | Description                                |          |
|---------------------|--------------------------------------------|----------|
| Command             | `List.Get`                                 | Required |
| ListId              | The ID of the subscriber list to retrieve. | Required |

**Success Response:**

A successful response will return a JSON object containing the following keys:

- `Success`: true or false (false if the list does not exist).
- `ErrorCode`: 0 (indicating no error).
- `List`: An array containing the details of the subscriber list.

**Error Response:**

- If the `ListId` is missing or the list does not exist, the `Success` key will be false, and the `ErrorCode` will
  indicate the nature of the error.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListId": 123,
    "Name": "Sample List",
    "OtherListDetails": "..."
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
  // Assuming 1 indicates a missing or invalid ListId
  "ErrorText": "List ID is missing or invalid."
}
```

## Retrieve List Assets

This API endpoint retrieves various assets related to a specific subscriber list, including segments, custom fields,
subscriber tags, and autoresponders.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                     |          |
|-----------|-----------------------------------------------------------------|----------|
| Command   | `List.Assets`                                                   | Required |
| ListId    | The ID of the subscriber list whose assets are to be retrieved. | Required |

**Success Response:**

A successful response will return a JSON object containing the following keys:

- `Success`: true or false (false if the list does not exist).
- `ErrorCode`: 0 (indicating no error).
- `List`: An array containing the details of the subscriber list.
- `Segments`: An array of segments associated with the list.
- `CustomFields`: An array of custom fields associated with the list.
- `SubscriberTags`: An array of subscriber tags associated with the list.
- `AutoResponders`: An array of autoresponders associated with the list.

**Error Response:**

- If the `ListId` is missing or the list does not exist, the `Success` key will be false, and the `ErrorCode` will
  indicate the nature of the error.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    /* List details */
  },
  "Segments": [
    /* Array of segments */
  ],
  "CustomFields": [
    /* Array of custom fields */
  ],
  "SubscriberTags": [
    /* Array of tags */
  ],
  "AutoResponders": [
    /* Array of autoresponders */
  ]
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  // Assuming 1 indicates a missing or invalid ListId
  "ErrorText": "List ID is missing or invalid."
}
```

## Delete Subscriber Lists

This API endpoint allows the deletion of one or more subscriber lists. It requires the IDs of the lists to be deleted.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                |          |
|-----------|------------------------------------------------------------|----------|
| Command   | `Lists.Delete`                                             | Required |
| Lists     | A comma-separated string of subscriber list IDs to delete. | Required |

**Success Response:**

A successful response indicates that the specified lists have been deleted.

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `ErrorText`: An empty string, indicating that no error occurred during the operation.

**Error Response:**

- `1`: Subscriber list IDs are missing. (This code is inferred from the error text "Subscriber list ids are missing" in
  the PHP code.)

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

**Example Error Response:**

```json
{
  "Success": false,
  "ErrorCode": [
    1
  ],
  // Assuming 1 indicates missing or invalid list IDs
  "ErrorText": "Subscriber list ids are missing"
}
```

## Retrieve Subscriber Lists

This API endpoint retrieves a list of subscriber lists owned by a user. It includes various optional parameters to
customize the query, such as pagination and sorting.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter         | Description                                                              |          |
|-------------------|--------------------------------------------------------------------------|----------|
| Command           | `Lists.Get`                                                              | Required |
| RecordsPerRequest | *(Optional)* The number of records to return per request. Defaults to 0. | Optional |
| RecordsFrom       | *(Optional)* The starting record number for the request. Defaults to 0.  | Optional |
| OrderField        | *(Optional)* The field to order the lists by. Defaults to 'ListID'.      | Optional |
| OrderType         | *(Optional)* The order type ('ASC' or 'DESC'). Defaults to 'ASC'.        | Optional |

**Success Response:**

A successful response will return a JSON object containing the following keys:

- `Success`: true
- `ErrorCode`: 0 (indicating no error)
- `ErrorText`: An empty string, indicating no error
- `TotalListCount`: The total number of lists available
- `Lists`: An array of subscriber lists, each with detailed information and a special encrypted and salted list ID

**Error Response:**

- There are no specific error codes for this endpoint as it defaults values when parameters are missing.

**Example Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalListCount": 100,
  "Lists": [
    {
      "ListId": 123,
      "EncryptedSaltedListID": "encrypted_list_id",
      "Name": "Sample List",
      "SyncLastDateTime": "2023-01-01 00:00:00",
      ...
    },
    ...
  ]
}
```


