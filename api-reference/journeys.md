---
layout: doc
---

# Journeys API Documentation

::: warning NOTICE
The API calls detailed in this document are compatible with Octeth's latest authorization method. You have the option to
include either the `SessionID` or `APIKey` parameter within the JSON request body.
:::

## Create a Journey

<Badge type="info" text="POST" /> `/api/v1/journey`

This API command allows you to create a new journey. By default, the newly created journey will be set to 'Disabled' and
the trigger mode will be set to 'Manual'.

**Request Body:**

::: warning NOTICE
This API endpoint accepts raw body in JSON format.
:::

| Parameter       | Description                                                                                                                                        | Required |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID       | The user's session ID.                                                                                                                             | Yes      | 
| APIKey          | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                               | Yes      | 
| Name            | The name of the journey.                                                                                                                           | Yes      | 
| Trigger         | The trigger type. Options include: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`.           | Yes      | 
| Trigger_ListID  | If the trigger is `ListSubscription` or `ListUnsubscription`, this parameter should be `0` (any list) or a specific subscriber list ID.            | No       | 
| Trigger_EmailID | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, this parameter should be `0` (any email) or a specific email ID.             | No       | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "ListSubscription",
  "Trigger_ListID": 10
}
```

```json [Success Response]
200 OK 
{
  "JourneyID": 5,
  "Journey": {
    "JourneyID": "5",
    "RelUserID": "1",
    "JourneyName": "Test",
    "Trigger": "Manual",
    "TriggerParameters": [],
    "Status": "Disabled",
    "Notes": "This is an administrative note for the journey",
    "CreatedAt": "2023-08-11 17:19:34",
    "UpdatedAt": "2023-08-11 17:19:34"
  }
}
```

```json [Error Response]
422 Unprocessable Entity
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing Name parameter"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                               |
|--------------------|------------|-------------------------------------------|
| 422                | 1          | Missing Name parameter                    |
| n/a                | 2          | [reserved]                                |
| 400                | 3          | Invalid trigger                           |
| 422                | 4          | Missing Trigger_ListID parameter          |
| 422                | 5          | Invalid Trigger_ListID parameter          |
| 404                | 6          | Trigger_ListID matching record not found  |
| 422                | 7          | Missing Trigger_EmailID parameter         |
| 422                | 8          | Invalid Trigger_EmailID parameter         |
| 404                | 9          | Trigger_EmailID matching record not found |

## Journey List

<Badge type="info" text="GET" /> `/api/v1/journeys`

This API endpoint returns a list of journeys associated with a specific user account.

::: warning NOTICE
This API endpoint accepts a raw JSON body.
:::

**Request Body Parameters:**

| Parameter | Description                                                               | Required |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The ID of the user's current session.                                     | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.      | Yes      | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": ""
}
```

```json [Success Response]
200 OK
{
  "Journeys": [
    {
      "JourneyID": "5",
      "RelUserID": "1",
      "JourneyName": "Test",
      "Trigger": "Manual",
      "TriggerParameters": "[]",
      "Status": "Disabled",
      "Notes": "This is an administrative note for the journey",
      "CreatedAt": "2023-08-11 17:19:34",
      "UpdatedAt": "2023-08-11 17:19:34",
      "JourneyStats": {
        "ActiveSubscribers": "0",
        "TotalSubscribers": "0"
      }
    }
  ]
}
```

```text [Error Response
This API endpoint doesn't return any errors.
```

:::

In the `JourneyStats` object, `ActiveSubscribers` represents the number of active subscribers, and `TotalSubscribers`
represents the total number of subscribers for the journey.

## Delete a Journey

<Badge type="info" text="POST" /> `/api/v1/journey.delete`

This API call is designed to delete a specific journey. The journey to be deleted is identified by the `JourneyID`
parameter.

::: warning NOTICE
Please note that this API endpoint requires a raw body in JSON format.
:::

**Request Body Parameters:**

| Parameter | Description                                                                  | Required |
|-----------|------------------------------------------------------------------------------|----------|
| SessionID | This is the user's session ID.                                               | Yes      | 
| APIKey    | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID | This is the ID of the journey to be deleted.                                 | Yes      | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 5
}
```

```json [Success Response]
200 OK
{
  "JourneyID": "5"
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

:::

Please ensure that the `JourneyID` parameter is provided and is valid to avoid errors.

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                 |
|--------------------|------------|-----------------------------|
| 422                | 1          | Missing JourneyID parameter |
| 422                | 2          | Invalid JourneyID parameter |
| 404                | 3          | Journey not found           |

## Retrieve a Journey

<Badge type="info" text="GET" /> `/api/v1/journey`

This API call retrieves the details of a specific journey corresponding to the provided JourneyID parameter.

::: warning NOTICE
This API endpoint expects a request body in JSON format.
:::

**Request Body:**

| Parameter | Description                                                               | Required |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The ID of the user's current session.                                     | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.      | Yes      | 
| JourneyID | The ID of the journey to be retrieved.                                    | Yes      | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6
}
```

```json [Success Response]
200 OK
{
  "Journey": {
    "JourneyID": "6",
    "RelUserID": "1",
    "JourneyName": "Test",
    "Trigger": "Manual",
    "TriggerParameters": [],
    "Status": "Disabled",
    "Notes": "This is an administrative note for the journey",
    "CreatedAt": "2023-08-11 18:13:17",
    "UpdatedAt": "2023-08-11 18:13:17"
  },
  "Actions": [
    {
      "ActionID": 1,
      "OrderNo": 1,
      "Action": "Wait",
      "ActionParameters": {
        "WaitUnit": "seconds",
        "WaitAmount": 20
      },
      "Stats": {
        "ActiveSubscribers": "0",
        "TotalSubscribers": "0"
      }
    },
    {
      "ActionID": 11,
      "OrderNo": 2,
      "Action": "Wait",
      "ActionParameters": {
        "WaitUnit": "minutes",
        "WaitAmount": 10
      },
      "Stats": {
        "ActiveSubscribers": "0",
        "TotalSubscribers": "0"
      }
    }
  ]
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
````

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                 |
|--------------------|------------|-----------------------------|
| 422                | 1          | Missing JourneyID parameter |
| 422                | 2          | Invalid JourneyID parameter |
| 404                | 3          | Journey not found           |

## Enable a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.enable`

This API call allows you to change a journey's status from Disabled to Enabled.

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter | Description                                                                  | Required |
|-----------|------------------------------------------------------------------------------|----------|
| SessionID | This is the user's session ID.                                               | Yes      | 
| APIKey    | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID | This is the ID of the journey you wish to enable.                            | Yes      | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6  
}
```

```json [Success Response]
200 OK
{
  "Journey": {
    "JourneyID": "6",
    "RelUserID": "1",
    "JourneyName": "Test",
    "Trigger": "Manual",
    "TriggerParameters": [],
    "Status": "Enabled",
    "CreatedAt": "2023-08-11 18:13:17",
    "UpdatedAt": "2023-08-11 18:13:17"
  }
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                 |
|--------------------|------------|-----------------------------|
| 422                | 1          | Missing JourneyID parameter |
| 422                | 2          | Invalid JourneyID parameter |
| 404                | 3          | Journey not found           |
| 409                | 4          | Journey is already enabled  |

## Disabling a Journey

<Badge type="info" text="GET" /> `/api/v1/journey.disable`

This API call allows you to change the status of a journey from 'Enabled' to 'Disabled'.

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Required Parameters:**

| Parameter | Description                                                               | Requirement |
|-----------|---------------------------------------------------------------------------|-------------|
| SessionID | This is the user's session ID.                                            | Mandatory   | 
| APIKey    | This is the user's API key. Either the `SessionID` or `APIKey` is needed. | Mandatory   | 
| JourneyID | This is the ID of the journey you wish to disable.                        | Mandatory   | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6  
}
```

```json [Success Response]
200 OK
{
  "Journey": {
    "JourneyID": "6",
    "RelUserID": "1",
    "JourneyName": "Test",
    "Trigger": "Manual",
    "TriggerParameters": [],
    "Status": "Disabled",
    "CreatedAt": "2023-08-11 18:13:17",
    "UpdatedAt": "2023-08-11 18:13:17"
  }
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                 |
|--------------------|------------|-----------------------------|
| 422                | 1          | Missing JourneyID parameter |
| 422                | 2          | Invalid JourneyID parameter |
| 404                | 3          | Journey not found           |
| 409                | 4          | Journey is already disabled |

## Modify a Journey

<Badge type="info" text="PATCH" /> `/api/v1/journey`

This API call allows you to update the details of a specific journey.

::: warning NOTICE
This endpoint expects a raw JSON body.
:::

**Request Body Parameters:**

| Parameter       | Description                                                                                                                                 | Required |
|-----------------|---------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID       | The ID of the user's current session.                                                                                                       | Yes      | 
| APIKey          | The user's API key. You must provide either the `SessionID` or `APIKey`.                                                                    | Yes      | 
| JourneyID       | The ID of the journey you want to update.                                                                                                   | Yes      | 
| Name            | The new name for the journey.                                                                                                               | No       | 
| Notes           | The administrative note for the journey.                                                                                                    | No       | 
| Trigger         | The type of trigger. Options include: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`. | No       | 
| Trigger_ListID  | If the trigger is `ListSubscription` or `ListUnsubscription`, this parameter should be `0` (for any list) or a specific subscriber list ID. | No       | 
| Trigger_EmailID | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, this parameter should be `0` (for any email) or a specific email ID.  | No       | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6,
  "Name":"New Name",
  "Notes":"",
  "Trigger":"ListSubscription",
  "Trigger_ListID":30
}
```

```json [Success Response]
200 OK
{
  "Journey": {
    "JourneyID": "6",
    "RelUserID": "1",
    "JourneyName": "Test",
    "Trigger": "Manual",
    "TriggerParameters": [],
    "Status": "Disabled",
    "Notes": "This is an administrative note for the journey",
    "CreatedAt": "2023-08-11 18:13:17",
    "UpdatedAt": "2023-08-11 18:13:17"
  }
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Invalid trigger"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                               |
|--------------------|------------|-------------------------------------------|
| 422                | 1          | Missing JourneyID parameter               |
| 422                | 2          | Invalid JourneyID parameter               |
| 400                | 3          | Invalid trigger                           |
| 422                | 4          | Missing Trigger_ListID parameter          |
| 422                | 5          | Invalid Trigger_ListID parameter          |
| 404                | 6          | Trigger_ListID matching record not found  |
| 422                | 7          | Missing Trigger_EmailID parameter         |
| 422                | 8          | Invalid Trigger_EmailID parameter         |
| 404                | 9          | Trigger_EmailID matching record not found |
| 404                | 10         | Journey not found                         |

## Modifying Journey Actions

<Badge type="info" text="PATCH" /> `/api/v1/journey.actions`

This API endpoint allows you to modify journey actions. To do so, you must provide the complete list of actions.

::: warning NOTICE
Please note that any actions not included in the provided list will be removed from the journey.
:::

**Request Body:**

| Parameter | Description                                                                                | Required |
|-----------|--------------------------------------------------------------------------------------------|----------|
| SessionID | The user's session ID.                                                                     | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.                        | Yes      | 
| JourneyID | The ID of the journey to be updated.                                                       | Yes      | 
| Actions   | The list of action objects. See below for the structure of action objects.                 | Yes      | 

> For the detailed usage instructions of journey actions, refer to the [Journey Actions](/api-reference/journey-actions.html)
> .

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6,
  "Actions": [
    {
      "ActionID": 1,
      "Action": "Wait",
      "WaitUnit": "seconds",
      "WaitAmount": 20,
      "Notes": "Administative note"
    },
    {
      "ActionID": null,
      "Action": "Subscribe",
      "TargetListID": 30,
      "Notes": "Test note"
    },
    // ...
    // Action objects
    // ...
  ],
}
```

```json [Success Response]
200 OK
{
    "JourneyID": 22,
    "Actions": [
        {
            "ActionID": 401,
            "OrderNo": 1,
            "Action": "Wait",
            "ActionParameters": {
                "WaitUnit": "seconds",
                "WaitAmount": 3
            },
            "Notes": "note-1",
            "CompletedRuns": "0",
            "Stats": {
                "ActiveSubscribers": "0",
                "TotalSubscribers": "0"
            }
        },
        {
            "ActionID": 402,
            "OrderNo": 2,
            "Action": "SendEmail",
            "ActionParameters": {
                "EmailID": 129,
                "SenderDomainID": 101,
                "From": {
                    "Name": "From Name",
                    "Email": "from@email.com"
                },
                "ReplyTo": {
                    "Name": "Reply-To Name",
                    "Email": "replyto@email.com"
                },
                "CC": [
                    {
                        "Name": "CC Name 1",
                        "Email": "cc1@email.com"
                    },
                    {
                        "Name": "CC Name 2",
                        "Email": "cc2@email.com"
                    }
                ],
                "BCC": [
                    {
                        "Name": "BCC Name 1",
                        "Email": "bcc1@email.com"
                    },
                    {
                        "Name": "BCC Name 2",
                        "Email": "bcc2@email.com"
                    }
                ],
                "Email": {
                    "EmailName": "Email name for administrative purposes",
                    "ContentType": "Both",
                    "Mode": "Editor",
                    "FetchURL": "",
                    "FetchPlainURL": "",
                    "Subject": "{{{Hey|Hi|Hello}}}! Subject of the email",
                    "PlainContent": "Plain contetn",
                    "HTMLContent": "<p><strong>HTML content</strong></p>",
                    "ExtraContent1": "",
                    "ExtraContent2": "",
                    "ImageEmbedding": "Disabled",
                    "PreHeaderText": "",
                    "Options": []
                }
            },
            "Notes": "note-2",
            "CompletedRuns": "0",
            "Stats": {
                "ActiveSubscribers": "0",
                "TotalSubscribers": "0",
                "EmailSent": 0,
                "EmailOpened": 0,
                "EmailClicked": 0,
                "EmailConverted": 0,
                "EmailUnsubscribed": 0,
                "EmailBounced": 0,
                "EmailSpamComplaint": 0
            }
        },
        {
            "ActionID": 403,
            "OrderNo": 3,
            "Action": "Wait",
            "ActionParameters": {
                "WaitUnit": "seconds",
                "WaitAmount": 3
            },
            "Notes": "",
            "CompletedRuns": "0",
            "Stats": {
                "ActiveSubscribers": "0",
                "TotalSubscribers": "0"
            }
        },
        {
            "ActionID": 404,
            "OrderNo": 4,
            "Action": "SendEmail",
            "ActionParameters": {
                "EmailID": 129,
                "SenderDomainID": 101,
                "From": {
                    "Name": "From Name",
                    "Email": "from@email.com"
                },
                "ReplyTo": {
                    "Name": "Reply-To Name",
                    "Email": "replyto@email.com"
                },
                "CC": [
                    {
                        "Name": "CC Name 1",
                        "Email": "cc1@email.com"
                    },
                    {
                        "Name": "CC Name 2",
                        "Email": "cc2@email.com"
                    }
                ],
                "BCC": [
                    {
                        "Name": "BCC Name 1",
                        "Email": "bcc1@email.com"
                    },
                    {
                        "Name": "BCC Name 2",
                        "Email": "bcc2@email.com"
                    }
                ],
                "Email": {
                    "EmailName": "Email name for administrative purposes",
                    "ContentType": "Both",
                    "Mode": "Editor",
                    "FetchURL": "",
                    "FetchPlainURL": "",
                    "Subject": "{{{Hey|Hi|Hello}}}! Subject of the email",
                    "PlainContent": "Plain contetn",
                    "HTMLContent": "<p><strong>HTML content</strong></p>",
                    "ExtraContent1": "",
                    "ExtraContent2": "",
                    "ImageEmbedding": "Disabled",
                    "PreHeaderText": "",
                    "Options": []
                }
            },
            "Notes": "note-3",
            "CompletedRuns": "0",
            "Stats": {
                "ActiveSubscribers": "0",
                "TotalSubscribers": "0",
                "EmailSent": 0,
                "EmailOpened": 0,
                "EmailClicked": 0,
                "EmailConverted": 0,
                "EmailUnsubscribed": 0,
                "EmailBounced": 0,
                "EmailSpamComplaint": 0
            }
        }
    ]
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 10,
      "Message": "Journey not found"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                 |
|--------------------|------------|-----------------------------|
| 422                | 1          | Missing JourneyID parameter |
| 422                | 2          | Missing Actions parameter   |
| 422                | 3          | Invalid JourneyID parameter |
| 422                | 4          | Invalid Actions parameter   |
| 404                | 5          | Journey not found           |

## Trigger a Journey For A Subscriber

<Badge type="info" text="GET" /> `/api/v1/subscriber.journey.trigger`

This API call will triger a journey for a subscriber.

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter    | Description                                                                  | Required |
|--------------|------------------------------------------------------------------------------|----------|
| SessionID    | This is the user's session ID.                                               | Yes      | 
| APIKey       | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID    | This is the ID of the journey you would like to trigger for a subscriber.    | Yes      | 
| ListID       | List ID of the subscriber.                                                   | Yes      | 
| SubscriberID | ID of the target subscriber.                                                 | Yes      | 

::: code-group
```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6,
  "ListID": 30,
  "SubscriberID": 11
}
```

```json [Success Response]
200 OK
{
  "JourneyID": "18",
  "ListID": "26",
  "SubscriberID": "1"
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 7,
      "Message": "Journey not found"
    }
  ]
}
```
:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                                   |
|--------------------|------------|-----------------------------------------------|
| 422                | 1          | Missing JourneyID parameter                   |
| 422                | 2          | Missing ListID parameter                      |
| 422                | 3          | Missing SubscriberID parameter                |
| 422                | 4          | Invalid JourneyID parameter                   |
| 422                | 5          | Invalid ListID parameter                      |
| 422                | 6          | Invalid SubscriberID parameter                |
| 404                | 7          | Journey not found                             |
| 404                | 8          | List not found                                |
| 404                | 9          | Subscriber not found                          |
| 403                | 10         | Journey is disabled. Operation not permitted. |

## Remove Subscriber From A Journey

<Badge type="info" text="POST" /> `/api/v1/subscriber.journey.remove`

This API call will remove a subscriber from an enrolled journey.

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter    | Description                                                                  | Required |
|--------------|------------------------------------------------------------------------------|----------|
| SessionID    | This is the user's session ID.                                               | Yes      | 
| APIKey       | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID    | This is the ID of the journey you would like remove from a subscriber.       | Yes      | 
| ListID       | List ID of the subscriber.                                                   | Yes      | 
| SubscriberID | ID of the target subscriber.                                                 | Yes      | 

::: code-group
```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6,
  "ListID": 30,
  "SubscriberID": 11
}
```

```json [Success Response]
200 OK
{
  "JourneyID": "18",
  "ListID": "26",
  "SubscriberID": "1"
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 7,
      "Message": "Journey not found"
    }
  ]
}
```
:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                    |
|--------------------|------------|--------------------------------|
| 422                | 1          | Missing JourneyID parameter    |
| 422                | 2          | Missing ListID parameter       |
| 422                | 3          | Missing SubscriberID parameter |
| 422                | 4          | Invalid JourneyID parameter    |
| 422                | 5          | Invalid ListID parameter       |
| 422                | 6          | Invalid SubscriberID parameter |
| 404                | 7          | Journey not found              |
| 404                | 8          | List not found                 |
| 404                | 9          | Subscriber not found           |

## Enrolled Journeys

<Badge type="info" text="GET" /> `/api/v1/subscriber.journey.list`

This API call will return the list of journeys for a given subscriber

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter    | Description                                                                  | Required |
|--------------|------------------------------------------------------------------------------|----------|
| SessionID    | This is the user's session ID.                                               | Yes      | 
| APIKey       | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| ListID       | List ID of the subscriber.                                                   | Yes      | 
| SubscriberID | ID of the target subscriber.                                                 | Yes      | 

::: code-group
```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6,
  "ListID": 30,
  "SubscriberID": 11
}
```

```json [Success Response]
200 OK
{
  "ListID": "26",
  "SubscriberID": "1",
  "Journeys": [
    {
      "JourneyID": "18",
      "RelUserID": "1",
      "JourneyName": "Test",
      "Trigger": "ListSubscription:0",
      "TriggerParameters": "{\"ListID\":0}",
      "Status": "Enabled",
      "CreatedAt": "2023-08-23 13:26:23",
      "UpdatedAt": "2023-08-25 10:40:02"
    }
  ]
}
```

```json [Error Response]
404 Not Found
{
  "Errors": [
    {
      "Code": 9,
      "Message": "Subscriber not found"
    }
  ]
}
```
:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                    |
|--------------------|------------|--------------------------------|
| n/a                | 1          | [reserved]                     |
| 422                | 2          | Missing ListID parameter       |
| 422                | 3          | Missing SubscriberID parameter |
| 422                | 5          | Invalid ListID parameter       |
| 422                | 6          | Invalid SubscriberID parameter |
| 404                | 8          | List not found                 |
| 404                | 9          | Subscriber not found           |

