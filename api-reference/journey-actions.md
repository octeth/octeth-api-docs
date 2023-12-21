---
layout: doc
prev:
    text: 'Return Back'
    link: 'javascript:history.back()'
---

# Journey Actions

## `Wait`

This action pauses the journey for a specified period.

```json
{
  "ActionID": 1,
  "Action": "Wait",
  "WaitUnit": "seconds",
  "WaitAmount": 20,
  "Notes": "Administative note"
}
```

| Parameter  | Description                                                                                                      |
|------------|------------------------------------------------------------------------------------------------------------------|
| ActionID   | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action     | Set this parameter to `Wait`.                                                                                    |
| Published  | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| WaitUnit   | Set to one of `seconds`, `minutes`, `hours`, `days`.                                                             |
| WaitAmount | Set to an integer value based on the `WaitUnit` parameter.                                                       |
| Notes      | The administrative note for the journey action.                                                                  |

## `UpdateCustomFieldValue`

This action updates a subscriber's custom field.

```json
{
  "ActionID": 1,
  "Action": "UpdateCustomFieldValue",
  "TargetCustomFieldID": 10,
  "NewCustomFieldValue": "New Value",
  "Notes": "Administative note"
}
```

| Parameter           | Description                                                                                                      |
|---------------------|------------------------------------------------------------------------------------------------------------------|
| ActionID            | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action              | Set this parameter to `UpdateCustomFieldValue`.                                                                  |
| Published           | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| TargetCustomFieldID | The ID of the subscriber's custom field.                                                                         |
| NewCustomFieldValue | The new value for the custom field.                                                                              |

## `Unsubscribe`

This action unsubscribes the subscriber from the target list.

```json
{
  "ActionID": 1,
  "Action": "Unsubscribe",
  "TargetListID": 10,
  "Notes": "Administative note"
}
```

| Parameter    | Description                                                                                                      |
|--------------|------------------------------------------------------------------------------------------------------------------|
| ActionID     | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action       | Set this parameter to `Unsubscribe`.                                                                             |
| Published    | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| TargetListID | The ID of the target list from which to unsubscribe.                                                             |

## `ExitJourney`

This action stops the specified journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitJourney",
  "TargetJourneyID": 10,
  "Notes": "Administative note"
}
```

or an array of journey ID numbers can be passed as shown below:

```json
{
  "ActionID": 1,
  "Action": "ExitJourney",
  "TargetJourneyID": [
    10,
    11,
    12
  ],
  "Notes": "Administative note"
}
```

| Parameter       | Description                                                                                                      |
|-----------------|------------------------------------------------------------------------------------------------------------------|
| ActionID        | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action          | Set this parameter to `ExitJourney`.                                                                             |
| Published       | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| TargetJourneyID | The ID of the journey to stop for the subscriber. Alternatively, it can be an array of Journey ID numbers.       |

## `ExitThisJourney`

This action stops the current journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitThisJourney",
  "Notes": "Administative note"
}
```

| Parameter | Description                                                                                                      |
|-----------|------------------------------------------------------------------------------------------------------------------|
| ActionID  | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action    | Set this parameter to `ExitThisJourney`.                                                                         |
| Published | Set this parameter to `true` to activate it. Default is `false`.                                                 |

## `ExitAllOtherJourneys`

This action stops all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitAllOtherJourneys",
  "Notes": "Administative note"
}
```

| Parameter | Description                                                                                                      |
|-----------|------------------------------------------------------------------------------------------------------------------|
| ActionID  | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action    | Set this parameter to `ExitAllOtherJourneys`.                                                                    |
| Published | Set this parameter to `true` to activate it. Default is `false`.                                                 |

## `ExitAllJourneys`

This action stops all active journeys of the subscriber.

```json
{
  "ActionID": 1,
  "Action": "ExitAllJourneys",
  "Notes": "Administative note"
}
```

| Parameter | Description                                                                                                      |
|-----------|------------------------------------------------------------------------------------------------------------------|
| ActionID  | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action    | Set this parameter to `ExitAllJourneys`.                                                                         |
| Published | Set this parameter to `true` to activate it. Default is `false`.                                                 |

## `Webhook`

This action triggers a webhook.

```json
{
  "ActionID": 1,
  "Action": "Webhook",
  "WebhookURL": "",
  "Notes": "Administative note"
}
```

| Parameter  | Description                                                                                                      |
|------------|------------------------------------------------------------------------------------------------------------------|
| ActionID   | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action     | Set this parameter to `Webhook`.                                                                                 |
| Published  | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| WebhookURL | The URL of the webhook to trigger.                                                                               |

## `StartJourney`

This action starts a journey for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "StartJourney",
  "TargetJourneyID": 0,
  "Notes": "Administative note"
}
```

| Parameter       | Description                                                                                                      |
|-----------------|------------------------------------------------------------------------------------------------------------------|
| ActionID        | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action          | Set this parameter to `StartJourney`.                                                                            |
| Published       | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| TargetJourneyID | The ID of the journey to start for the subscriber.                                                               |

## `Subscribe`

This action subscribes the subscriber to a list.

```json
{
  "ActionID": 1,
  "Action": "Subscribe",
  "TargetListID": 0,
  "Notes": "Administative note"
}
```

| Parameter    | Description                                                                                                      |
|--------------|------------------------------------------------------------------------------------------------------------------|
| ActionID     | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action       | Set this parameter to `Subscribe`.                                                                               |
| Published    | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| TargetListID | The ID of the list to which to subscribe.                                                                        |

## `AddTag`

This action adds a tag to the subscriber.

```json
{
  "ActionID": 1,
  "Action": "AddTag",
  "TargetTagID": 0,
  "Notes": "Administative note"
}
```

| Parameter   | Description                                                                                                      |
|-------------|------------------------------------------------------------------------------------------------------------------|
| ActionID    | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action      | Set this parameter to `AddTag`.                                                                                  |
| Published   | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| TargetTagID | The ID of the tag to add.                                                                                        |

## `RemoveTag`

This action will halt all journeys except the current one for the subscriber.

```json
{
  "ActionID": 1,
  "Action": "RemoveTag",
  "TargetTagID": 0,
  "Notes": "Administative note"
}
```

| Parameter   | Description                                                                                           |
|-------------|-------------------------------------------------------------------------------------------------------|
| ActionID    | Provide an ActionID to update a specific action. Set this parameter to `null` to create a new action. |
| Action      | Set this parameter to `RemoveTag`.                                                                    |
| Published   | Set this parameter to `true` to activate it. Default is `false`.                                      |
| TargetTagID | The ID of the tag.                                                                                    |

## YesNo

This action will implement a basic yes or no condition with a single criteria and set of actions for both `yes` and `no`
cases.

::: warning
This action is deprecated and will be removed in one of the coming Octeth version releases. Please use `Decision` action
instead.
:::

```json
{
  "ActionID": null,
  "Action": "YesNo",
  "Notes": "Administative note",
  "CriteriaLeft": "EmailAddress",
  "CriteriaOperator": "Contains",
  "CriteriaRight": "@gmail",
  "CriteriaOption": "",
  "Actions": {
    "Yes": [],
    "No": []
  }
}
```

| Parameter        | Description                                                                                                                                                                                                                                                                      |
|------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ActionID         | Provide an ActionID to update a specific action. Set this parameter to `null` to create a new action.                                                                                                                                                                            |
| Action           | Set this parameter to `YesNo`.                                                                                                                                                                                                                                                   |
| Published        | Set this parameter to `true` to activate it. Default is `false`.                                                                                                                                                                                                                 |
| CriteriaLeft     | The left side of the criteria. It can be `SubscriberID`, `EmailAddress`, `BounceType`, `SubscriptionStatus`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`, `CustomField:XX` (XX represents the custom field ID), `Opens`, `Clicks`                                          |
| CriteriaOperator | Set the operator to compare left to the right. It can be `Contains`, `Does not contain`, `Begins with`, `Ends with`, `Equals to`, `Is greater than`, `Is smaller than`, `Is before`, `Is after`, `Is set`, `Is not set`, `Is`, `Is not`, `At most`, `At least`, `Only`           |
| CriteriaRight    | It can be any value or an array of campaign or autoresponder ID numbers. If you are going to provide campaign ID numbers, ID numbers should have a prefix `c`. For autoresponders, prefix `a`. Example: `['c100', 'c101']` for campaigns, `['a100', 'a101']` for autoresponders. |
| CriteriaOption   | This parameter accepts `any` or `all`. It defines how to match campaign or autoresponder opens or clicks.                                                                                                                                                                        |
| Actions.Yes      | The array of action objects in case of `Yes` condition.                                                                                                                                                                                                                          |
| Actions.No       | The array of action objects in case of `No` condition.                                                                                                                                                                                                                           |

## `Decision`

This action will implement a decision with a criteria and set of actions for both `true` and `false` cases.

```json
{
  "ActionID": 1,
  "Action": "Decision",
  "Notes": "Administative note",
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
| Action           | Set this parameter to `Decision`.                                                                     |
| Published        | Set this parameter to `true` to activate it. Default is `false`.                                      |
| CriteriaOperator | It can be set as `and`, `or`. Default value is `and`                                                  |
| Criteria         | The array of criteria. [Please refer to the criteria object below](/api-reference/criteria-syntax).   |
| Actions          | The array of action objects in case `True` and `False` cases.                                         |

## `SendEmail`

This action sends the email to the subscriber.

```json
{
  "ActionID": 1,
  "Action": "SendEmail",
  "Notes": "Administative note",
  "EmailID": 1,
  "SenderDomainID": 2,
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
      "Name": "CC Name",
      "Email": "cc@email.com"
    }
  ],
  "BCC": [
    {
      "Name": "BCC Name",
      "Email": "bcc@email.com"
    }
  ]
}
```

| Parameter      | Description                                                                                                      |
|----------------|------------------------------------------------------------------------------------------------------------------|
| ActionID       | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action. |
| Action         | Set this parameter to `AddTag`.                                                                                  |
| Published      | Set this parameter to `true` to activate it. Default is `false`.                                                 |
| EmailID        | The ID of the target email content.                                                                              |
| SenderDomainID | The ID of the email gateway sender domain to use when sending the email.                                         |
| From           | `From.Name` and `From.Email` parameters to set as `From` header of the email.                                    |
| Reply-To       | `ReplyTo.Name` and `ReplyTo.Email` parameters to set as `Reply-To` header of the email.                          |
| CC             | The array with `Name` and `Email` parameters to set as `CC` header of the email.                                 |
| BCC            | The array with `Name` and `Email` parameters to set as `BCC` header of the email.                                |
