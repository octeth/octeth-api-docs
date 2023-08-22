---
layout: doc
---

# Journeys

::: warning
The API calls detailed on this page are compatible with Octeth's most recent authorization method. You can include the
SessionID or APIKey parameter within the JSON request body.
:::

## Create a Journey

Use this API command to create a new journey. The created journey will be set as Disabled by default and trigger mode
will be set to Manual.

### <Badge type="info" text="POST" /> `https://octeth.mydomain.com/api/v1/journey`

**Request Body:**

::: info
This API end-point accepts raw body in JSON syntax.
:::

```json
{
  "SessionID": "<user_session_id>",
  "APIKey": "",
  "Name": "Contact Form Journey",
  "Trigger": "ListSubscrpition",
  "Trigger_ListID": 10
}
```

| Parameter       | Description                                                                                                                                        |          |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID       | The user session ID.                                                                                                                               | Required | 
| APIKey          | The API key of the user. Either `SessionID` or `APIKey` must be provided.                                                                          | Required | 
| Name            | Name of the journey                                                                                                                                | Required | 
| Trigger         | Any of these trigger types: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`.                  | Required | 
| Trigger_ListID  | If the trigger is `ListSubscription` or `ListUnsubscrpition`, the value of this parameter must be `0` (any list) or a specific subscriber list ID. | Optional | 
| Trigger_EmailID | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, the value of this parameter must be `0` (any email) or a specific email ID.  | Optional | 

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

This API request will yield a list of journeys established within the specified user account.

### <Badge type="info" text="GET" /> `https://octeth.mydomain.com/api/v1/journeys`

::: info
This API end-point accepts raw body in JSON syntax.
:::

**Request Body:**

| Parameter | Description                                                               |          |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The user session ID.                                                      | Required | 
| APIKey    | The API key of the user. Either `SessionID` or `APIKey` must be provided. | Required | 

**Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

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

## Delete a Journey

This API call will remove the specific journey that corresponds to the JourneyID parameter.

### <Badge type="info" text="POST" /> `https://octeth.mydomain.com/api/v1/journey.delete`

::: info
This API end-point accepts raw body in JSON syntax.
:::

**Request Body:**

| Parameter | Description                                                               |          |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The user session ID.                                                      | Required | 
| APIKey    | The API key of the user. Either `SessionID` or `APIKey` must be provided. | Required | 
| JourneyID | Journey ID to delete.                                                     | Required | 

**Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "JourneyID": "5"
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

## Retrieve a Journey

This API call will remove the specific journey that corresponds to the JourneyID parameter.

### <Badge type="info" text="GET" /> `https://octeth.mydomain.com/api/v1/journey`

::: info
This API end-point accepts raw body in JSON syntax.
:::

**Request Body:**

| Parameter | Description                                                               |          |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The user session ID.                                                      | Required | 
| APIKey    | The API key of the user. Either `SessionID` or `APIKey` must be provided. | Required | 
| JourneyID | Journey ID to retrieve.                                                   | Required | 

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
      "RelParentActionID": 0,
      "ConditionType": "",
      "OrderNo": 1,
      "Action": "Wait",
      "ActionParameters": {
        "WaitUnit": "seconds",
        "WaitAmount": 20
      },
      "ActionParametersRaw": "{\"WaitUnit\":\"seconds\",\"WaitAmount\":20}",
      "Stats": {
        "ActiveSubscribers": "0"
      }
    },
    {
      "ActionID": 11,
      "RelParentActionID": 0,
      "ConditionType": "",
      "OrderNo": 2,
      "Action": "Wait",
      "ActionParameters": {
        "WaitUnit": "minutes",
        "WaitAmount": 10
      },
      "ActionParametersRaw": "{\"WaitUnit\":\"minutes\",\"WaitAmount\":10}",
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

This API call will transition a journey from a Disabled status to an Enabled status.

### <Badge type="info" text="GET" /> `https://octeth.mydomain.com/api/v1/journey.enable`

::: info
This API end-point accepts raw body in JSON syntax.
:::

**Request Body:**

| Parameter | Description                                                               |          |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The user session ID.                                                      | Required | 
| APIKey    | The API key of the user. Either `SessionID` or `APIKey` must be provided. | Required | 
| JourneyID | Journey ID to enable.                                                     | Required | 

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
    "Status": "Enabled",
    "CreatedAt": "2023-08-11 18:13:17",
    "UpdatedAt": "2023-08-11 18:13:17"
  }
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

## Disable a Journey

This API call will transition a journey from an Enabled status to a Disabled status.

### <Badge type="info" text="GET" /> `https://octeth.mydomain.com/api/v1/journey.disable`

::: info
This API end-point accepts raw body in JSON syntax.
:::

**Request Body:**

| Parameter | Description                                                               |          |
|-----------|---------------------------------------------------------------------------|----------|
| SessionID | The user session ID.                                                      | Required | 
| APIKey    | The API key of the user. Either `SessionID` or `APIKey` must be provided. | Required | 
| JourneyID | Journey ID to disable.                                                    | Required | 

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
  }
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

## Update a Journey

Utilize this API call to modify the parameters of a journey.

### <Badge type="info" text="PATCH" /> `https://octeth.mydomain.com/api/v1/journey`

::: info
This API end-point accepts raw body in JSON syntax.
:::

**Request Body:**

| Parameter       | Description                                                                                                                                        |          |
|-----------------|----------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID       | The user session ID.                                                                                                                               | Required | 
| APIKey          | The API key of the user. Either `SessionID` or `APIKey` must be provided.                                                                          | Required | 
| JourneyID       | Journey ID to update.                                                                                                                              | Required | 
| Name            | New name of the journey.                                                                                                                           | Optional | 
| Trigger         | Any of these trigger types: `ListSubscription`, `ListUnsubscription`, `EmailOpen`, `EmailConversion`, `EmailLinkClick`, `Manual`.                  | Optional | 
| Trigger_ListID  | If the trigger is `ListSubscription` or `ListUnsubscrpition`, the value of this parameter must be `0` (any list) or a specific subscriber list ID. | Optional | 
| Trigger_EmailID | If the trigger is `EmailOpen`, `EmailConversion` or `EmailLinkClick`, the value of this parameter must be `0` (any email) or a specific email ID.  | Optional | 

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
  }
}
```

**Error Response:**

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

## Update Journey Actions

Every time you would like to make a change on journey actions, you need to pass the entire action list to this API
end-point. Utilize this API end-point to set/update journey actions.

::: danger
The entire action list must be provided. Missing actions in the provided action list will be deleted from the journey.
:::

### <Badge type="info" text="PATCH" /> `https://octeth.mydomain.com/api/v1/journey.actions`

**Request Body:**

| Parameter | Description                                                                                |          |
|-----------|--------------------------------------------------------------------------------------------|----------|
| SessionID | The user session ID.                                                                       | Required | 
| APIKey    | The API key of the user. Either `SessionID` or `APIKey` must be provided.                  | Required | 
| JourneyID | Journey ID to update.                                                                      | Required | 
| Actions   | The list of action objects must be proivded. Please see below for action object structure. | Required | 

**Wait Action Object:**

This action forces the journey to pause for a given period of time.

```json
{
  "ActionID": 1,
  "Action": "Wait",
  "ParentActionCondition": "",
  "WaitUnit": "seconds",
  "WaitAmount": 20
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `Wait`                                                                                                     |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| WaitUnit              | Set to one of `seconds`, `minutes`, `hours`, `days`.                                                                             |
| WaitAmount            | Set to an integer value based on the `WaitUnit` parameter.                                                                       |

**UpdateCustomFieldValue Action Object:**

This action will update subscriber's custom field.

```json
{
  "ActionID": 1,
  "Action": "UpdateCustomFieldValue",
  "ParentActionCondition": "",
  "TargetCustomFieldID": 10,
  "NewCustomFieldValue": "New Value"
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `UpdateCustomFieldValue`                                                                                                     |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| TargetCustomFieldID   | The ID number of subscriber's custom field                                                                                       |
| NewCustomFieldValue   | The new value of the given custom field.                                                                                         |

**Unsubscribe Action Object:**

This action will unsubscribe the subscriber from the target list.

```json
{
  "ActionID": 1,
  "Action": "Unsubscribe",
  "ParentActionCondition": "",
  "TargetListID": 10
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `Unsubscribe`                                                                                              |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| TargetListID          | The ID number of target list to unsubscribe                                                                                      |

**ExitJourney Action Object:**

This action will stop the given journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitJourney",
  "ParentActionCondition": "",
  "TargetJourneyID": 10
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `ExitJourney`                                                                                              |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| TargetJourneyID       | The target Journey ID to stop for the subscriber.                                                                                |

**ExitThisJourney Action Object:**

This action will stop the current journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitThisJourney",
  "ParentActionCondition": ""
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `ExitThisJourney`                                                                                          |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |

**ExitAllOtherJourneys Action Object:**

This action will stop all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitAllOtherJourneys",
  "ParentActionCondition": ""
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `ExitAllOtherJourneys`                                                                                     |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |

**Webhook Action Object:**

This action will stop all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "Webhook",
  "ParentActionCondition": "",
  "WebhookURL": ""
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `Webhook`                                                                                                  |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| WebhookURL            | Webhook URL to execute                                                                                                           |

**StartJourney Action Object:**

This action will stop all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "StartJourney",
  "ParentActionCondition": "",
  "TargetJourneyID": 0
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `StartJourney`                                                                                             |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| TargetJourneyID       | ID number of the journey to start for the subscriber                                                                             |

**Subscribe Action Object:**

This action will stop all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "Subscribe",
  "ParentActionCondition": "",
  "TargetListID": 0
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `Subscribe`                                                                                                |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| TargetListID          | ID number of the list to subscribe                                                                                               |

**AddTag Action Object:**

This action will stop all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "AddTag",
  "ParentActionCondition": "",
  "TargetTagID": 0
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `AddTag`                                                                                                   |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| TargetTagID           | ID number of the tag                                                                                                             |

**RemoveTag Action Object:**

This action will stop all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "RemoveTag",
  "ParentActionCondition": "",
  "TargetTagID": 0
}
```

| Parameter             | Description                                                                                                                      |
|-----------------------|----------------------------------------------------------------------------------------------------------------------------------|
| ActionID              | If you provide an ActionID, it will update that specific action. Otherwise, set this parameter to `null` to create a new action. |
| Action                | Set this parameter to `RemoveTag`                                                                                                |
| ParentActionCondition | Set to empty, `Yes`, `No`. Set this parameter as empty unless you are setting an action for a yes/no condition.                  |
| TargetTagID           | ID number of the tag                                                                                                             |












**Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "Journey": 8,
  "Actions": [
    {
      "ActionID": 1,
      "RelParentActionID": 0,
      "ConditionType": "",
      "OrderNo": 1,
      "Action": "Wait",
      "ActionParameters": {
        "WaitUnit": "seconds",
        "WaitAmount": 20
      },
      "ActionParametersRaw": "{\"WaitUnit\":\"seconds\",\"WaitAmount\":20}",
      "Stats": {
        "ActiveSubscribers": "0"
      }
    },
    {
      "ActionID": 11,
      "RelParentActionID": 0,
      "ConditionType": "",
      "OrderNo": 2,
      "Action": "Wait",
      "ActionParameters": {
        "WaitUnit": "minutes",
        "WaitAmount": 10
      },
      "ActionParametersRaw": "{\"WaitUnit\":\"minutes\",\"WaitAmount\":10}",
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




