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
| Published  | Set this parameter to `true` to activate it. Default: `false`.                                                   |
| WaitUnit   | Set to one of `seconds`, `minutes`, `hours`, `days`.                                                             |
| WaitAmount | Set to an integer value based on the `WaitUnit` parameter.                                                       |
| Notes      | The administrative note for the journey action.                                                                  |
| Published  | If this is set to `true`, the action will be enabled. Values: `true`, `false`                                    |

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
| Published           | Set this parameter to `true` to activate it. Default: `false`.                                                   |
| TargetCustomFieldID | The ID of the subscriber's custom field.                                                                         |
| NewCustomFieldValue | The new value for the custom field.                                                                              |
| Published           | If this is set to `true`, the action will be enabled. Values: `true`, `false`                                    |

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
| Published    | Set this parameter to `true` to activate it. Default: `false`.                                                   |
| TargetListID | The ID of the target list from which to unsubscribe.                                                             |
| Published    | If this is set to `true`, the action will be enabled. Values: `true`, `false`                                    |

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
| Published       | Set this parameter to `true` to activate it. Default: `false`.                                                   |
| TargetJourneyID | The ID of the journey to stop for the subscriber. Alternatively, it can be an array of Journey ID numbers.       |
| Published       | If this is set to `true`, the action will be enabled. Values: `true`, `false`                                    |

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
| Published | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                  |

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
| Published | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                  |

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
| Published | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                  |

## `Webhook`

This action triggers a webhook.

```json
{
  "ActionID": 1,
  "Action": "Webhook",
  "WebhookURL": "https://example.com/webhook",
  "WebhookSecurity": {
    "Method": "HMAC",
    "SecretKey": "your_secret_key",
    "HeaderName": "X-Octeth-Signature"
  },
  "WebhookBody": {
    "custom": "payload with &lcub;&lcub; Subscriber:EmailAddress &rcub;&rcub;",
    "data": "values"
  },
  "WebhookHeaders": {
    "X-Custom-Header": "CustomValue",
    "Another-Header": "AnotherValue"
  },
  "Notes": "Administrative note",
  "Published": "true"
}
```

| Parameter         | Description                                                                                                                                                                                                                                                              |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| ActionID          | If provided, this will update the specified action. If not, set this parameter to `null` to create a new action.                                                                                                                                                         |
| Action            | Set this parameter to `Webhook`.                                                                                                                                                                                                                                         |
| Published         | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                                                                                                                                                                          |
| WebhookURL        | The URL of the webhook to trigger.                                                                                                                                                                                                                                       |
| WebhookSecurity   | Object containing security configuration for the webhook:                                                                                                                                                                                                                |
| &rdsh; Method     | Security method to use. Currently supports `HMAC` (HMAC-SHA256).                                                                                                                                                                                                         |
| &rdsh; SecretKey  | Secret key used to generate the signature.                                                                                                                                                                                                                               |
| &rdsh; HeaderName | Name of the header containing the signature. Default: `X-Octeth-Signature`                                                                                                                                                                                               |
| WebhookBody       | JSON object containing additional fields to include in the request body. These fields will be merged with the default payload data as a "CustomPayload" property. The WebhookBody values support merge tags (e.g., `&lcub;&lcub; Subscriber:EmailAddress &rcub;&rcub;`). |
| WebhookHeaders    | Object containing custom HTTP headers to include in the webhook request.                                                                                                                                                                                                 |

### Default Webhook Payload

When a webhook is triggered, the following structured data is included in the payload:

```json
{
  "Journey": {
    "JourneyID": 9,
    "JourneyName": "Welcome Journey",
    "JourneyTrigger": "ListSubscription:12"
  },
  
  "List": {
    "ListID": 12,
    "ListName": "Newsletter List"
  },
  
  "CustomFields": {
    "1": "First Name",
    "2": "Last Name",
    "3": "Country"
  },
  
  "Subscriber": {
    "SubscriberID": 42,
    "EmailAddress": "subscriber@example.com",
    "BounceType": "Not Bounced",
    "SubscriptionStatus": "Subscribed",
    "SubscriptionDate": "2025-02-20",
    "SubscriptionIP": "192.168.1.1",
    "UnsubscriptionDate": "0000-00-00",
    "UnsubscriptionIP": "0.0.0.0",
    "OptInDate": "2025-02-20",
    "CustomField1": "John",
    "CustomField2": "Doe",
    "CustomField3": "USA"
  },
  
  "CustomPayload": {
    "custom": "payload with actual_email@example.com",
    "data": "values"
  }
}
```

### Available Merge Tags

The following merge tag formats are available for use in WebhookBody values:

- `&lcub;&lcub; Subscriber:FieldName &rcub;&rcub;` - Access subscriber data fields (e.g., `&lcub;&lcub; Subscriber:EmailAddress &rcub;&rcub;`, `&lcub;&lcub; Subscriber:CustomField1 &rcub;&rcub;`)
- `&lcub;&lcub; List:FieldName &rcub;&rcub;` - Access list data fields (e.g., `&lcub;&lcub; List:Name &rcub;&rcub;`)
- `&lcub;&lcub; Entry:FieldName &rcub;&rcub;` - Access journey entry data
- `&lcub;&lcub; Action:FieldName &rcub;&rcub;` - Access journey action data

Note that all merge tags in your custom payload will be replaced with actual values before the webhook is triggered.

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
| Published       | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                  |
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
| Published    | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                  |
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
| Published   | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                  |
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
| Published   | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`       |
| TargetTagID | The ID of the tag.                                                                                    |

## `YesNo`

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
| Published        | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                                                                                                                                                                                  |
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

Decision action can have multi-nested decision actions. Here is an example:

```json
{
  "ActionID": 1,
  "Action": "Decision",
  "Notes": "Administative note",
  "CriteriaOperator": "or",
  "Criteria": [
  ],
  "Actions": {
    "True": [
      {
        "ActionID": 2,
        "Action": "Decision",
        "Notes": "Administative note",
        "CriteriaOperator": "and",
        "Criteria": [
        ],
        "Actions": {
          "True": [],
          "False": []
        }
      }
    ],
    "False": [
      {
        "ActionID": 3,
        "Action": "Decision",
        "Notes": "Administative note",
        "CriteriaOperator": "and",
        "Criteria": [
        ],
        "Actions": {
          "True": [],
          "False": []
        }
      }
    ]
  }
}
```

| Parameter        | Description                                                                                           |
|------------------|-------------------------------------------------------------------------------------------------------|
| ActionID         | Provide an ActionID to update a specific action. Set this parameter to `null` to create a new action. |
| Action           | Set this parameter to `Decision`.                                                                     |
| Published        | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`       |
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
| Published      | If this is set to `true`, the action will be enabled. Values: `true`, `false`. Default: `false`                  |
| EmailID        | The ID of the target email content.                                                                              |
| SenderDomainID | The ID of the email gateway sender domain to use when sending the email.                                         |
| From           | `From.Name` and `From.Email` parameters to set as `From` header of the email.                                    |
| Reply-To       | `ReplyTo.Name` and `ReplyTo.Email` parameters to set as `Reply-To` header of the email.                          |
| CC             | The array with `Name` and `Email` parameters to set as `CC` header of the email.                                 |
| BCC            | The array with `Name` and `Email` parameters to set as `BCC` header of the email.                                |
