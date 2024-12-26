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

| Parameter           | Description                                                                                                                                                                                                                                                                                                                        | Required |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID           | The user's session ID.                                                                                                                                                                                                                                                                                                             | Yes      | 
| APIKey              | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                                                                                                                                                                                                               | Yes      | 
| Name                | The name of the journey.                                                                                                                                                                                                                                                                                                           | Yes      |
| Notes               | An administrative note for the journey.                                                                                                                                                                                                                                                                                            | No       |
| Trigger             | The trigger type. Options include: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`, `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, `WebsiteEvent_conversion`, `Tag`, `UnTag`, `CustomFieldValueChanged`, `RevenueHit`, `WebsiteEvent_pageView` | Yes      | 
| Trigger_ListID      | If the trigger is `ListSubscription` or `ListUnsubscription`, this parameter should be `0` (any list) or a specific subscriber list ID.                                                                                                                                                                                            | No       | 
| Trigger_EmailID     | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, this parameter should be `0` (any email) or a specific email ID.                                                                                                                                                                                             | No       | 
| Trigger_Criteria    | If the trigger is `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, or `WebsiteEvent_conversion`, this parameter should be an array.                                                                                                                                                                   | No       | 
| Trigger_Value       | Specifying the actions of the trigger. This number can be the `ID` of the tag or `CustomField` that will trigger or the `RevenueHit` value (ex: 200.50)                                                                                                                                                                            | No       | 
| Run_Criteria        | The final filter before enrolling the subscriber to the journey. This parameter should be in [criteria syntax](/v5.6.x/api-reference/criteria-syntax.html).                                                                                                                                                                        | No       |
| RunCriteriaOperator | The operator to be used for the `Run_Criteria`. Options include: `and`, `or`.                                                                                                                                                                                                                                                      | No       |

::: code-group

```json [Example Request]
// Trigger when a subscription occurs
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "ListSubscription",
  "Trigger_ListID": 10
}

// Trigger when a subscriber is tagged
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "Tag",
  "Trigger_Value": 1
}

// Trigger when a subscriber is un-tagged
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "UnTag",
  "Trigger_Value": 1
}

// Trigger when any custom field value is changed
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "CustomFieldValueChanged"
}

// Trigger when a specific custom field is changed to any value
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "CustomFieldValueChanged",
  "Trigger_ListID": "1",
  "Trigger_Value": "2"
  // Target custom field ID
}

// Trigger when a specific custom field value partially matches a value
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "CustomFieldValueChanged",
  "Trigger_ListID": "1",
  "Trigger_Value": "2",
  // Target custom field ID
  "Trigger_Criteria": [
    {
      "property": "",
      "operator": "contains",
      "value": "Hard"
    }
  ]
}

// Trigger when a revenue hit is made
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "RevenueHit",
  "Trigger_Value": "20.01"
  // in cents
}

// Trigger on a page view website event
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "WebsiteEvent_pageView",
  "Trigger_ListID": "3",
  "Trigger_Criteria": [
    {
      "property": "pageView.url",
      "operator": "contains",
      "value": "/tracker/example/index"
    }
  ]
}
```

```json [Success Response]
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

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| SessionID | The ID of the user's current session.                                | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": ""
}
```

```json [Success Response]
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
        "TotalSubscribers": "0",
        "TotalRevenue": "0",
        "DaysRevenue": [],
        "AggregatedEmailActions": [],
        "AggregatedDaysEmailActions": []
      }
    }
  ]
}
```

```txt [Error Response]
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
{
  "JourneyID": "5"
}
```

```json [Error Response]
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

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| SessionID | The ID of the user's current session.                                | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID | The ID of the journey to be retrieved.                               | Yes      |
| StartDate | The start date of journey's statistics. Ex: `2024-12-01`             | No       | 
| EndDate   | The end date of journey's statistics. Ex: `2024-12-31`               | No       | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6
}
```

```json [Success Response]
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
    "UpdatedAt": "2023-08-11 18:13:17",
    "JourneyStats": {
      "ActiveSubscribers": 100,
      "TotalSubscribers": 200,
      "TotalRevenue": 0,
      "AggregatedEmailActionStats": {
        "SendCount": 0,
        "OpenCount": 0,
        "ClickCount": 0,
        "ConversionCount": 0,
        "BrowserViewCount": 0,
        "ForwardCount": 0,
        "UnsubscribeCount": 0,
        "BounceCount": 0,
        "SpamComplaintCount": 0
      },
      "AggregatedDaysEmailActions": [
        {
          "2024-12-02": {
            "SendCount": 0,
            "OpenCount": 0,
            "ClickCount": 0,
            "ConversionCount": 0,
            "BrowserViewCount": 0,
            "ForwardCount": 0,
            "UnsubscribeCount": 0,
            "BounceCount": 0,
            "SpamComplaintCount": 0
          },
          "2024-12-01": {
            "SendCount": 0,
            "OpenCount": 0,
            "ClickCount": 0,
            "ConversionCount": 0,
            "BrowserViewCount": 0,
            "ForwardCount": 0,
            "UnsubscribeCount": 0,
            "BounceCount": 0,
            "SpamComplaintCount": 0
          }
        }
      ]
    }
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
      "CompletedRuns": 0,
      "Published": true,
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
      "CompletedRuns": 0,
      "Published": true,
      "Stats": {
        "ActiveSubscribers": "0",
        "TotalSubscribers": "0"
      }
    }
  ]
}
```

```json [Error Response]
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

| Parameter           | Description                                                                                                                                                                                                                                            | Required |
|---------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID           | The ID of the user's current session.                                                                                                                                                                                                                  | Yes      | 
| APIKey              | The user's API key. You must provide either the `SessionID` or `APIKey`.                                                                                                                                                                               | Yes      | 
| JourneyID           | The ID of the journey you want to update.                                                                                                                                                                                                              | Yes      | 
| Name                | The new name for the journey.                                                                                                                                                                                                                          | No       | 
| Notes               | The administrative note for the journey.                                                                                                                                                                                                               | No       | 
| Trigger             | The type of trigger. Options include: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`, , `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, `WebsiteEvent_conversion`. | No       | 
| Trigger_ListID      | If the trigger is `ListSubscription` or `ListUnsubscription`, this parameter should be `0` (any list) or a specific subscriber list ID.                                                                                                                | No       | 
| Trigger_EmailID     | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, this parameter should be `0` (any email) or a specific email ID.                                                                                                                 | No       | 
| Trigger_Criteria    | If the trigger is `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, or `WebsiteEvent_conversion`, this parameter should be an array.                                                                                       | No       | 
| Trigger_Value       | Specifying the actions of the trigger. This number can be the `ID` of the tag or `CustomField` that will trigger or the `RevenueHit` value (ex: 200.50)                                                                                                | No       |
| Run_Criteria        | The final filter before enrolling the subscriber to the journey. This parameter should be in [criteria syntax](/v5.6.x/api-reference/criteria-syntax.html).                                                                                            | No       |
| RunCriteriaOperator | The operator to be used for the `Run_Criteria`. Options include: `and`, `or`.                                                                                                                                                                          | No       |

::: code-group

```json [Example Request]
// Trigger when a subscription occurs
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "ListSubscription",
  "Trigger_ListID": 10
}

// Trigger when a subscriber is tagged
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "Tag",
  "Trigger_Value": 1
}

// Trigger when a subscriber is un-tagged
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "UnTag",
  "Trigger_Value": 1
}

// Trigger when any custom field value is changed
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "CustomFieldValueChanged"
}

// Trigger when a specific custom field is changed to any value
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "CustomFieldValueChanged",
  "Trigger_ListID": "1",
  "Trigger_Value": "2"
  // Target custom field ID
}

// Trigger when a specific custom field value partially matches a value
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "CustomFieldValueChanged",
  "Trigger_ListID": "1",
  "Trigger_Value": "2",
  // Target custom field ID
  "Trigger_Criteria": [
    {
      "property": "",
      "operator": "contains",
      "value": "Hard"
    }
  ]
}

// Trigger when a revenue hit is made
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "RevenueHit",
  "Trigger_Value": "20.01"
  // in cents
}

// Trigger on a page view website event
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Notes": "This is an administrative note for the journey",
  "Trigger": "WebsiteEvent_pageView",
  "Trigger_ListID": "3",
  "Trigger_Criteria": [
    {
      "property": "pageView.url",
      "operator": "contains",
      "value": "/tracker/example/index"
    }
  ]
}
```

```json [Success Response]
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

| Parameter | Description                                                                | Required |
|-----------|----------------------------------------------------------------------------|----------|
| SessionID | The user's session ID.                                                     | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.       | Yes      | 
| JourneyID | The ID of the journey to be updated.                                       | Yes      | 
| Actions   | The list of action objects. See below for the structure of action objects. | Yes      | 

> For the detailed usage instructions of journey actions, refer to
> the [Journey Actions](/v5.6.x/api-reference/journey-actions.html)
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
      "Published": "true",
      "WaitUnit": "seconds",
      "WaitAmount": 20,
      "Notes": "Administative note"
    },
    {
      "ActionID": null,
      "Action": "Subscribe",
      "Published": "true",
      "TargetListID": 30,
      "Notes": "Test note"
    }
  ]
}
```

```json [Success Response]
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

## Update Journey Actions Publication Status

<Badge type="info" text="PATCH" /> `api/v1/journey.actions.published`

This endpoint is used to update the publication status of actions within a specified journey. It requires a journey ID
and a list of actions with their desired publication statuses.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| journeyid | The unique identifier of the journey                                 | Yes       |
| actions   | An array of actions with their IDs and publication statuses          | Yes       |

::: code-group

```bash [Example Request]
curl -X PATCH 'https://example.com/api/v1/journey.actions.published' \
-H 'Content-Type: application/json' \
-d '{
    "SessionID": "your_session_id",
    "APIKey": "your_api_key",
    "JourneyID": 123,
    "Actions": [
        {"ActionID": 1, "Published": "true"},
        {"ActionID": 2, "Published": "false"}
    ]
}'
```

```json [Success Response]
{
  "JourneyID": 123,
  "Actions": [
    {
      "ActionID": 1,
      "Published": true
    },
    {
      "ActionID": 2,
      "Published": false
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing JourneyID parameter"
    },
    {
      "Code": 2,
      "Message": "Missing Actions parameter"
    },
    {
      "Code": 3,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                 |
|--------------------|------------|-----------------------------|
| n/a                | 1          | Missing JourneyID parameter |
| 422                | 2          | Missing Actions parameter   |
| 422                | 3          | Invalid JourneyID parameter |
| 422                | 4          | Invalid Actions parameter   |
| 404                | 5          | Journey not found           |
| 404                | 6          | Action not found            |

## Trigger a Journey For A Subscriber

<Badge type="info" text="GET" /> `/api/v1/subscriber.journey.trigger`

This API call will triger a journey for a subscriber.

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter                | Description                                                                  | Required |
|--------------------------|------------------------------------------------------------------------------|----------|
| SessionID                | This is the user's session ID.                                               | Yes      | 
| APIKey                   | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID                | This is the ID of the journey you would like to trigger for a subscriber.    | Yes      | 
| ListID                   | List ID of the subscriber.                                                   | Yes      | 
| SubscriberID             | ID of the target subscriber.                                                 | Yes      |
| BypassJourneyStatusCheck | Bypass the journey status check. Default: `false`.                           | No       |

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
{
  "JourneyID": "18",
  "ListID": "26",
  "SubscriberID": "1"
}
```

```json [Error Response]
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
{
  "JourneyID": "18",
  "ListID": "26",
  "SubscriberID": "1"
}
```

```json [Error Response]
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

## Journey Action Subscribers

<Badge type="info" text="POST" /> `/api/v1/journey.action.subscribers`

This API call will return the list of subscribers for a specific journey action.

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter         | Description                                                                  | Required |
|-------------------|------------------------------------------------------------------------------|----------|
| SessionID         | This is the user's session ID.                                               | Yes      | 
| APIKey            | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID         | Target journey ID.                                                           | Yes      | 
| ActionID          | ID of the target journey action.                                             | Yes      | 
| FilterJson        | The filter to apply in JSON syntax.                                          | Yes      | 
| Operator          | How to apply filters. Either `and` or `or`                                   | Yes      | 
| RecordsPerRequest | Pagination. Number of records to return. Default: `25`                       | No       | 
| RecordsFrom       | Pagination. The result retrieve start index. Default: `0`                    | No       | 
| OrderField        | Order results by this field. Default: `EmailAddress`                         | No       | 
| OrderType         | Sort results ascending or descending. Default: `ASC`. Values: `ASC`, `DESC`  | No       | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "JourneyID": 6,
  "ActionID": 30,
  "FilterJson": [
    "opened",
    "clicked"
  ],
  "Operator": "or"
}
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalSubscribers": 5,
  "Subscribers": [
    {
      "SubscriberID": "42",
      "EmailAddress": "email15@example.com",
      "BounceType": "Hard",
      "SubscriptionStatus": "Subscribed",
      "SubscriptionDate": "2023-01-01",
      "SubscriptionIP": "192.168.1.1",
      "UnsubscriptionDate": "0000-00-00",
      "UnsubscriptionIP": "0.0.0.0",
      "OptInDate": "2023-01-01"
    },
    {
      "SubscriberID": "8",
      "EmailAddress": "email3@test1.com",
      "BounceType": "Not Bounced",
      "SubscriptionStatus": "Subscribed",
      "SubscriptionDate": "2023-11-09",
      "SubscriptionIP": " - Manual Import",
      "UnsubscriptionDate": "0000-00-00",
      "UnsubscriptionIP": "0.0.0.0",
      "OptInDate": "0000-00-00"
    },
    {
      "SubscriberID": "5",
      "EmailAddress": "email5@test.com",
      "BounceType": "Not Bounced",
      "SubscriptionStatus": "Subscribed",
      "SubscriptionDate": "2023-11-07",
      "SubscriptionIP": " - Manual Import",
      "UnsubscriptionDate": "2023-11-13",
      "UnsubscriptionIP": "192.168.65.1",
      "OptInDate": "0000-00-00"
    },
    {
      "SubscriberID": "21",
      "EmailAddress": "email51@test1.com",
      "BounceType": "Not Bounced",
      "SubscriptionStatus": "Subscribed",
      "SubscriptionDate": "2023-12-18",
      "SubscriptionIP": " - Manual Import",
      "UnsubscriptionDate": "0000-00-00",
      "UnsubscriptionIP": "0.0.0.0",
      "OptInDate": "0000-00-00"
    },
    {
      "SubscriberID": "34",
      "EmailAddress": "email7@example.com",
      "BounceType": "Hard",
      "SubscriptionStatus": "Unsubscribed",
      "SubscriptionDate": "0000-00-00",
      "SubscriptionIP": "",
      "UnsubscriptionDate": "2023-01-02",
      "UnsubscriptionIP": "192.168.1.2",
      "OptInDate": "0000-00-00"
    }
  ]
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing journey ID"
    }
  ]
}
```

:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                  |
|--------------------|------------|------------------------------|
| 422                | 1          | Missing JourneyID parameter  |
| 422                | 2          | Missing ActionID parameter   |
| 422                | 3          | Invalid JourneyID parameter  |
| 422                | 4          | Invalid ActionID parameter   |
| 422                | 5          | Invalid FilterJson parameter |
| 422                | 6          | Invalid FilterJson value     |
| 422                | 7          | Invalid Operator value       |
| 404                | 5          | Journey not found            |
| 404                | 6          | Action not found             |
| 404                | 7          | No subscribers found         |

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

## Clone Journey

<Badge type="info" text="POST" /> `/api/v1/journey.clone`

Clone an existing journey and create a new one.

::: warning NOTICE
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter      | Description                                                                  | Required |
|----------------|------------------------------------------------------------------------------|----------|
| SessionID      | This is the user's session ID.                                               | Yes      | 
| APIKey         | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID      | The ID of the journey to clone.                                              | Yes      | 
| NewJourneyName | The name of the new journey.                                                 | Yes      | 

::: code-group

```json [Example Request]
{
  "SessionID": "<user_session_id>",
  // "APIKey":""
  "JourneyID": 2,
  "NewJourneyName": "Test Journey"
}
```

```json [Success Response]
{
  "Journey": {
    "JourneyID": "3",
    "RelUserID": "1",
    "JourneyName": "Test Journey",
    "Trigger": "Manual",
    "TriggerParameters": [],
    "Status": "Disabled",
    "Notes": "Copy of journey Test Journey",
    "CreatedAt": "2024-04-27 19:52:06",
    "UpdatedAt": "2024-04-27 19:52:06",
    "JourneyStats": {
      "ActiveSubscribers": "0",
      "TotalSubscribers": "0",
      "AggregatedEmailActions": {
        "SendCount": 0,
        "OpenCount": 0,
        "ClickCount": 0,
        "ConversionCount": 0,
        "BrowserViewCount": 0,
        "ForwardCount": 0,
        "UnsubscribeCount": 0,
        "BounceCount": 0,
        "SpamComplaintCount": 0
      },
      "AggregatedDaysEmailActions": []
    }
  },
  "Actions": [
    {
      "ActionID": 6,
      "OrderNo": 1,
      "Action": "",
      "ActionParameters": {
        "EmailID": 4,
        "SenderDomainID": 1,
        "From": {
          "Name": "Sender",
          "Email": "from@test.com"
        },
        "ReplyTo": {
          "Name": "Sender",
          "Email": "from@test.com"
        },
        "CC": [],
        "BCC": [],
        "Email": {
          "EmailName": "",
          "ContentType": "Both",
          "Mode": "Editor",
          "FetchURL": "",
          "FetchPlainURL": "",
          "Subject": "Test email subject",
          "PlainContent": "Test email plain body",
          "HTMLContent": "<html><body>Test email HTML body</body></html>",
          "ExtraContent1": "",
          "ExtraContent2": "",
          "ImageEmbedding": "Disabled",
          "PreHeaderText": "This is pre-header text for HTML emails",
          "Options": {
            "SenderDomain": "test.com"
          }
        }
      },
      "Notes": "",
      "CompletedRuns": "0",
      "Published": true,
      "Stats": {
        "ActiveSubscribers": "0",
        "TotalSubscribers": "0"
      }
    },
    {
      "ActionID": 7,
      "OrderNo": 2,
      "Action": "",
      "ActionParameters": {
        "WaitUnit": "seconds",
        "WaitAmount": 20
      },
      "Notes": "",
      "CompletedRuns": "0",
      "Published": true,
      "Stats": {
        "ActiveSubscribers": "0",
        "TotalSubscribers": "0"
      }
    }
  ]
}
```

```json [Error Response]
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

| HTTP Response Code | Error Code | Description                      |
|--------------------|------------|----------------------------------|
| 422                | 1          | Missing NewJourneyName parameter |
| 422                | 2          | Missing JourneyID parameter      |
| 404                | 3          | Journey not found                |
| 404                | 4          | Journey not cloned successfully  |

## Journey Trigger Criteria

When creating or updating a journey, if you set the trigger
to `WebsiteEvent_pageView`, `WebsiteEvent_identify`, `WebsiteEvent_customEvent`, or `WebsiteEvent_conversion`, you need
to provide `Trigger_Criteria` API parameter.

The `Trigger_Criteria` parameter must be an array with at least one criteria inside. Here's an
example `Trigger_Criteria` structure:

```json
{
  "Trigger_Criteria": [
    {
      "Property": "conversionName",
      "Operator": "equals",
      "Value": "Purchase"
    },
    {
      "Property": "conversionValue",
      "Operator": "greater than",
      "Value": "300"
    }
  ]
}
```

The filtering works as "match all". Multiple criteria rules as shown above will be filtered together.

**Operators:**

- `equals`
- `doesn't equal`
- `contains`
- `doesn't contain`
- `matches regex`
- `doesn't match regex`
- `greater than`
- `less than`
- `is set`
- `is not set`

The `Property` can be any of properties for a specific website event. You can get the list of website event properties
using [`List.Get` API end-point](/api-reference/subscriber-lists.html#retrieve-subscriber-list).
