---
layout: doc
---

# Journeys API Documentation

::: note
The API calls detailed in this document are compatible with Octeth's latest authorization method. You have the option to
include either the `SessionID` or `APIKey` parameter within the JSON request body.
:::

## Create a Journey

This API command allows you to create a new journey. By default, the newly created journey will be set to 'Disabled' and
the trigger mode will be set to 'Manual'.

### <Badge type="info" text="POST" /> `/api/v1/journey`

**Request Body:**

::: note
This API endpoint accepts raw body in JSON format.
:::

```json
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Trigger": "ListSubscription",
  "Trigger_ListID": 10
}
```

| Parameter       | Description                                                                                                                                        | Required |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID       | The user's session ID.                                                                                                                             | Yes      | 
| APIKey          | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                               | Yes      | 
| Name            | The name of the journey.                                                                                                                           | Yes      | 
| Trigger         | The trigger type. Options include: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`.           | Yes      | 
| Trigger_ListID  | If the trigger is `ListSubscription` or `ListUnsubscription`, this parameter should be `0` (any list) or a specific subscriber list ID.            | No       | 
| Trigger_EmailID | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, this parameter should be `0` (any email) or a specific email ID.             | No       | 

**Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "JourneyID": 5,
  "Journey": {
    "JourneyID": "5",
    "RelUserID": "1",
    "JourneyName": "Test",
    "Trigger": "Manual",
    "TriggerParameters": [],
    "Status": "Disabled",
    "CreatedAt": "2023-08-11 17:19:34",
    "UpdatedAt": "2023-08-11 17:19:34"
  }
}
```

**Error Response:**

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" /> 

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing Name parameter"
    }
  ]
}
```

## Journey List

This API endpoint returns a list of journeys associated with a specific user account.

### <Badge type="info" text="GET" /> `/api/v1/journeys`

::: info
This API endpoint accepts a raw JSON body.
:::

**Request Body Parameters:**

| Parameter | Description                                                               | Required |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The ID of the user's current session.                                     | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.      | Yes      | 

**Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

The successful response will return a JSON object containing an array of journeys. Each journey object includes the
journey ID, related user ID, journey name, trigger type, trigger parameters, status, creation date, update date, and
journey statistics.

```json
{
  "Journeys": [
    {
      "JourneyID": "5",
      "RelUserID": "1",
      "JourneyName": "Test",
      "Trigger": "Manual",
      "TriggerParameters": "[]",
      "Status": "Disabled",
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

In the `JourneyStats` object, `ActiveSubscribers` represents the number of active subscribers, and `TotalSubscribers`
represents the total number of subscribers for the journey.

## Delete a Journey

This API call is designed to delete a specific journey. The journey to be deleted is identified by the `JourneyID`
parameter.

### <Badge type="info" text="POST" /> `/api/v1/journey.delete`

::: info
Please note that this API endpoint requires a raw body in JSON format.
:::

**Request Body Parameters:**

| Parameter | Description                                                                  | Required |
|-----------|------------------------------------------------------------------------------|----------|
| SessionID | This is the user's session ID.                                               | Yes      | 
| APIKey    | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID | This is the ID of the journey to be deleted.                                 | Yes      | 

**Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "JourneyID": "5"
}
```

**Error Responses:**

<Badge type="danger" text="HTTP Code: 404 Not Found" /> 

```json
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" /> 

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing JourneyID parameter"
    },
    {
      "Code": 2,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```

Please ensure that the `JourneyID` parameter is provided and is valid to avoid errors.

## Retrieve a Journey

This API call retrieves the details of a specific journey corresponding to the provided JourneyID parameter.

### <Badge type="info" text="GET" /> `/api/v1/journey`

::: info
This API endpoint expects a request body in JSON format.
:::

**Request Body:**

| Parameter | Description                                                               | Required |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The ID of the user's current session.                                     | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.      | Yes      | 
| JourneyID | The ID of the journey to be retrieved.                                    | Yes      | 

**Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
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
        "ActiveSubscribers": "0"
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
        "ActiveSubscribers": "0"
      }
    }
  ]
}
```

**Error Response:**

<Badge type="danger" text="HTTP Code: 404 Not Found" /> 

```json
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" /> 

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing JourneyID parameter"
    },
    {
      "Code": 2,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```

## Enable a Journey

This API call allows you to change a journey's status from Disabled to Enabled.

### <Badge type="info" text="GET" /> `/api/v1/journey.enable`

::: info
Please note that this API endpoint requires a raw JSON body.
:::

**Request Body Parameters:**

| Parameter | Description                                                                  | Required |
|-----------|------------------------------------------------------------------------------|----------|
| SessionID | This is the user's session ID.                                               | Yes      | 
| APIKey    | This is the user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| JourneyID | This is the ID of the journey you wish to enable.                            | Yes      | 

**Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
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

**Error Responses:**

<Badge type="danger" text="HTTP Code: 404 Not Found" /> 

```json
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 409 Conflict" />

```json
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Journey is already enabled"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" /> 

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing JourneyID parameter"
    },
    {
      "Code": 2,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```

## Disabling a Journey

This API call allows you to change the status of a journey from 'Enabled' to 'Disabled'.

### <Badge type="info" text="GET" /> `/api/v1/journey.disable`

::: info
Please note that this API endpoint requires a raw JSON body.
:::

**Required Parameters:**

| Parameter | Description                                                               | Requirement |
|-----------|---------------------------------------------------------------------------|-------------|
| SessionID | This is the user's session ID.                                            | Mandatory   | 
| APIKey    | This is the user's API key. Either the `SessionID` or `APIKey` is needed. | Mandatory   | 
| JourneyID | This is the ID of the journey you wish to disable.                        | Mandatory   | 

**Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
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

**Error Responses:**

<Badge type="danger" text="HTTP Code: 404 Not Found" /> 

```json
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Journey not found"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 409 Conflict" />

```json
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Journey is already disabled"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" /> 

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing JourneyID parameter"
    },
    {
      "Code": 2,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```

## Modify a Journey

This API call allows you to update the details of a specific journey.

### <Badge type="info" text="PATCH" /> `/api/v1/journey`

::: info
This endpoint expects a raw JSON body.
:::

**Request Body Parameters:**

| Parameter       | Description                                                                                                                                        | Required |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID       | The ID of the user's current session.                                                                                                              | Yes      | 
| APIKey          | The user's API key. You must provide either the `SessionID` or `APIKey`.                                                                           | Yes      | 
| JourneyID       | The ID of the journey you want to update.                                                                                                          | Yes      | 
| Name            | The new name for the journey.                                                                                                                      | No       | 
| Trigger         | The type of trigger. Options include: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`.        | No       | 
| Trigger_ListID  | If the trigger is `ListSubscription` or `ListUnsubscription`, this parameter should be `0` (for any list) or a specific subscriber list ID.        | No       | 
| Trigger_EmailID | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, this parameter should be `0` (for any email) or a specific email ID.         | No       | 

**Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
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

**Error Responses:**

<Badge type="danger" text="HTTP Code: 400 Bad Request" />

```json
{
  "Errors": [
    {
      "Code": 3,
      "Message": "Invalid trigger"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 404 Not Found" /> 

```json
{
  "Errors": [
    {
      "Code": 10,
      "Message": "Journey not found"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 409 Conflict" />

```json
{
  "Errors": [
    {
      "Code": 4,
      "Message": "Journey is already disabled"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" /> 

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing JourneyID parameter"
    },
    {
      "Code": 2,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```

## Modifying Journey Actions

This API endpoint allows you to modify journey actions. To do so, you must provide the complete list of actions.

::: warning
Please note that any actions not included in the provided list will be removed from the journey.
:::

### <Badge type="info" text="PATCH" /> `/api/v1/journey.actions`

**Request Body:**

| Parameter | Description                                                                                | Required |
|-----------|--------------------------------------------------------------------------------------------|----------|
| SessionID | The user's session ID.                                                                     | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.                        | Yes      | 
| JourneyID | The ID of the journey to be updated.                                                       | Yes      | 
| Actions   | The list of action objects. See below for the structure of action objects.                 | Yes      | 

**`Wait` Action Object:**

This action pauses the journey for a specified period.

```json
{
  "ActionID": 1,
  "Action": "Wait",
  "WaitUnit": "seconds",
  "WaitAmount": 20
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `Wait`.                                                                                                    |
| WaitUnit              | Set to one of `seconds`, `minutes`, `hours`, `days`.                                                                             |
| WaitAmount            | Set to an integer value based on the `WaitUnit` parameter.                                                                       |

**`UpdateCustomFieldValue` Action Object:**

This action updates a subscriber's custom field.

```json
{
  "ActionID": 1,
  "Action": "UpdateCustomFieldValue",
  "TargetCustomFieldID": 10,
  "NewCustomFieldValue": "New Value"
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `UpdateCustomFieldValue`.                                                                                  |
| TargetCustomFieldID   | The ID of the subscriber's custom field.                                                                                         |
| NewCustomFieldValue   | The new value for the custom field.                                                                                              |

**`Unsubscribe` Action Object:**

This action unsubscribes the subscriber from the target list.

```json
{
  "ActionID": 1,
  "Action": "Unsubscribe",
  "TargetListID": 10
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `Unsubscribe`.                                                                                             |
| TargetListID          | The ID of the target list from which to unsubscribe.                                                                             |

**`ExitJourney` Action Object:**

This action stops the specified journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitJourney",
  "TargetJourneyID": 10
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `ExitJourney`.                                                                                             |
| TargetJourneyID       | The ID of the journey to stop for the subscriber.                                                                                |

**`ExitThisJourney` Action Object:**

This action stops the current journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitThisJourney"
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `ExitThisJourney`.                                                                                         |

**`ExitAllOtherJourneys` Action Object:**

This action stops all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitAllOtherJourneys"
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `ExitAllOtherJourneys`.                                                                                    |

**`Webhook` Action Object:**

This action triggers a webhook.

```json
{
  "ActionID": 1,
  "Action": "Webhook",
  "WebhookURL": ""
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `Webhook`.                                                                                                 |
| WebhookURL            | The URL of the webhook to trigger.                                                                                               |

**`StartJourney` Action Object:**

This action starts a journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "StartJourney",
  "TargetJourneyID": 0
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `StartJourney`.                                                                                            |
| TargetJourneyID       | The ID of the journey to start for the subscriber.                                                                               |

**`Subscribe` Action Object:**

This action subscribes the subscriber to a list.

```json
{
  "ActionID": 1,
  "Action": "Subscribe",
  "TargetListID": 0
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `Subscribe`.                                                                                               |
| TargetListID          | The ID of the list to which to subscribe.                                                                                        |

**`AddTag` Action Object:**

This action adds a tag to the subscriber.

```json
{
  "ActionID": 1,
  "Action": "AddTag",
  "TargetTagID": 0
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                 |
| Action                | Set this parameter to `AddTag`.                                                                                                  |
| TargetTagID           | The ID of the tag to add.                                                                                                        |

**`RemoveTag` Action Object:**

This action will halt all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "RemoveTag",
  "TargetTagID": 0
}
```

| Parameter             | Description                                                                                                    |
|-----------------------|----------------------------------------------------------------------------------------------------------------|
| ActionID              | Provide an ActionID to update a specific action. Set this parameter to `null` to create a new action.          |
| Action                | Set this parameter to `RemoveTag`.                                                                             |
| TargetTagID           | The ID of the tag.                                                                                             |

**`Decision` Action Object:**

This action will implement a decision with a criteria and set of actions for both `true` and `false` cases.

```json
{
  "ActionID": 1,
  "Action": "Decision",
  "Criteria": [],
  "Actions": {
    "True": [],
    "False": []
  }
}
```

| Parameter | Description                                                                                           |
|-----------|-------------------------------------------------------------------------------------------------------|
| ActionID  | Provide an ActionID to update a specific action. Set this parameter to `null` to create a new action. |
| Action    | Set this parameter to `RemoveTag`.                                                                    |
| Criteria  | The array of criteria. [Please refer to the criteria object below](/api-reference/criteria-syntax).   |
| Actions   | The array of action objects in case `True` and `False` cases.                                         |

**Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "Journey": 8,
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
        "ActiveSubscribers": "0"
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
        "ActiveSubscribers": "0"
      }
    }
  ]
}
```

**Error Response:**

<Badge type="danger" text="HTTP Code: 404 Not Found" />

```json
{
  "Errors": [
    {
      "Code": 10,
      "Message": "Journey not found"
    }
  ]
}
```

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" />

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing JourneyID parameter"
    },
    {
      "Code": 2,
      "Message": "Invalid JourneyID parameter"
    }
  ]
}
```
