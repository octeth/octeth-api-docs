---
layout: doc
prev:
    text: 'Return Back'
    link: 'javascript:history.back()'
next: false
---

# Journey Actions

## `Wait`

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

## `UpdateCustomFieldValue`

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

## `Unsubscribe`

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

## `ExitJourney`

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

## `ExitThisJourney`

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

## `ExitAllOtherJourneys`

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

## `Webhook`

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

## `StartJourney`

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

## `Subscribe`

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

## `AddTag`

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

## `RemoveTag`

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

## `Decision`

This action will implement a decision with a criteria and set of actions for both `true` and `false` cases.

```json
{
  "ActionID": 1,
  "Action": "Decision",
  "CriteriaOperator": "or",
  "Criteria": [],
  "Actions": {
    "True": [],
    "False": []
  }
}
```

| Parameter        | Description                                                                                           |
|------------------|-------------------------------------------------------------------------------------------------------|
| ActionID         | Provide an ActionID to update a specific action. Set this parameter to `null` to create a new action. |
| Action           | Set this parameter to `RemoveTag`.                                                                    |
| CriteriaOperator | It can be set as `and`, `or`. Default value is `and`                                                  |
| Criteria         | The array of criteria. [Please refer to the criteria object below](/api-reference/criteria-syntax).   |
| Actions          | The array of action objects in case `True` and `False` cases.                                         |