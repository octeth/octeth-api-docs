---
layout: doc
---

# Email Contents

::: warning
Each API end-point on this article may have a different authentication method. Please make sure you use the correct authentication method.
:::

## Create Email Content

This API end-point will create a new email content record and it will return the `EmailID`.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| Command   | `Email.Create`                                                       | Yes      | 
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "EmailID": 127
}
```

**Example Error Response:**

There's no error case for this API end-point.

## Update Email Content

This API end-point will update the email content record.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter                | Description                                                                                               | Required |
|--------------------------|-----------------------------------------------------------------------------------------------------------|----------|
| Command                  | `Email.Update`                                                                                            | Yes      | 
| SessionID                | The user's session ID.                                                                                    | Yes      | 
| APIKey                   | The user's API key. Either `SessionID` or `APIKey` must be provided.                                      | Yes      | 
| EmailId                  | The unique identifier of the email.                                                                       | Yes      |
| EmailName                | The name of the email.                                                                                    | No       |
| ValidateScope            | The scope of validation. It can be `OptIn`, `Campaign`, or `AutoResponder`.                               | Yes      |
| Mode                     | The mode of the email. It can be `Template`, `Editor`, `Stripo`, `Unlayer`, `Empty`, or `Import`.         | Yes      |
| RelTemplateId            | The unique identifier of the related template. This parameter is required only if the mode is 'Template'. | No       |
| SenderDomain             | The domain of the sender. Ex: `abc.com`                                                                   | No       |
| FromName                 | The name of the sender.                                                                                   | No       |
| FromEmail                | The email address of the sender.                                                                          | No       |
| ReplyToName              | The name for replies.                                                                                     | No       |
| ReplyToEmail             | The email address for replies.                                                                            | No       |
| PreHeaderText            | The pre-header text of the email.                                                                         | No       |
| Subject                  | The subject of the email.                                                                                 | Yes      |
| HtmlContent              | The HTML content of the email.                                                                            | Yes      |
| PlainContent             | The plain text content of the email.                                                                      | Yes      |
| ExtraContent1            | Extra content for the email. Required only if `Mode` is set to `Stripo`                                   | No       |
| ExtraContent2            | Additional extra content for the email. Required only if `Mode` is set to `Stripo`                        | No       |
| FetchUrl                 | The URL to fetch the email content from. Leave empty to disable this feature.                             | No       |
| FetchPlainUrl            | The URL to fetch the plain text email content from. Leave empty to disable this feature.                  | No       |
| ImageEmbedding           | The image embedding option for the email. It can be set as `Enabled` or `Disabled`                        | No       |
| PlainContentAutoConvert  | The option to automatically convert plain content. It can be set as `1` or `0`                            | No       |
| SubjectSetToTitleElement | The option to set the subject to the title element. It can be set as `1` or `0`                           | No       |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0
}
```

**Example Error Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": false,
    "ErrorCode": [
        1,
        9
    ]
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                                                                                          |
|--------------------|------------|------------------------------------------------------------------------------------------------------|
| 200                | 1          | Missing required field: `EmailID`                                                                    |
| 200                | 3          | Auto responder does not exist                                                                        |
| 200                | 4          | Invalid mode                                                                                         |
| 200                | 5          | Missing required field: `RelTemplateID` when mode is `Template`                                      |
| 200                | 8          | Invalid content type                                                                                 |
| 200                | 9          | Missing required field: `ValidateScope`                                                              |
| 200                | 10         | Invalid validation scope                                                                             |
| 200                | 11         | Missing `%Link:Unsubscribe%` tag in HTML content for `Campaign` or `AutoResponder` validation scope  |
| 200                | 12         | Missing `%Link:Unsubscribe%` tag in Plain content for `Campaign` or `AutoResponder` validation scope |
| 200                | 13         | Missing `%Link:Confirm%` tag in HTML content for `OptIn` validation scope                            |
| 200                | 14         | Missing `%Link:Confirm%` tag in Plain content for `OptIn` validation scope                           |
| 200                | 15         | Missing `%Link:Reject%` tag in HTML content for `OptIn` validation scope                             |
| 200                | 16         | Missing `%Link:Reject%` tag in Plain content for `OptIn` validation scope                            |
| 200                | 17         | Sender domain does not exist                                                                         |

## List of Email Contents

This API end-point will return the list of emails created.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| Command   | `Emails.Get`                                                         | Yes      | 
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalEmailCount": 109,
  "Emails": [
    {
      "EmailID": "127",
      "RelUserID": "1",
      "EmailName": "Email name for administrative purposes",
      "FromName": "From Name",
      "FromEmail": "test@from.com",
      "ReplyToName": "Reply-To Name",
      "ReplyToEmail": "test@replyto.com",
      "ContentType": "Both",
      "Mode": "Editor",
      "FetchURL": "",
      "FetchPlainURL": "",
      "Subject": "Subject of the email",
      "PlainContent": "Plain contetn",
      "HTMLContent": "<p><strong>HTML content</strong></p>",
      "ExtraContent1": "",
      "ExtraContent2": "",
      "ImageEmbedding": "Disabled",
      "RelTemplateID": "0",
      "PreHeaderText": "This is pre-header text",
      "Options": "[]"
    }
  ]
}
```

**Example Error Response:**

There's no error case for this API end-point.

## Delete Email Content

This API end-point will delete the email record that matches `EmailID`.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| Command   | `Email.Delete`                                                       | Yes      | 
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| EmailId   | The unique identifier for the email to be deleted.                   | Yes      |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "ErrorText": ""
}
```

**Example Error Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": false,
    "ErrorCode": [
        1
    ]
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description     |
|--------------------|------------|-----------------|
| 200                | 1          | Missing EmailID |

## Duplicate Email Content

This API end-point will clone an email content matching `EmailID`.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| Command   | `Email.Duplicate`                                                    | Yes      | 
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| EmailId   | The unique identifier for the email to be duplicated.                | Yes      |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "EmailID": 128,
    "EmailName": "Copy of Campaign email: 106"
}
```

**Example Error Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": false,
    "ErrorCode": [
        1
    ]
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                    |
|--------------------|------------|--------------------------------|
| 200                | 1          | `EmailID` parameter is missing |
| 200                | 2          | Email does not exist           |

## Retrieve Email Content

This API end-point will return the email content record that matches the `EmailID`.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| Command   | `Email.Gate`                                                         | Yes      | 
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| EmailId   | The unique identifier for the email to be retrieve.                  | Yes      |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "EmailInformation": {
        "EmailID": "129",
        "RelUserID": "1",
        "EmailName": "Email name for administrative purposes",
        "FromName": "",
        "FromEmail": "",
        "ReplyToName": "",
        "ReplyToEmail": "",
        "ContentType": "Both",
        "Mode": "Editor",
        "FetchURL": "",
        "FetchPlainURL": "",
        "Subject": "Subject of the email",
        "PlainContent": "Plain contetn",
        "HTMLContent": "<p><strong>HTML content</strong></p>",
        "ExtraContent1": "",
        "ExtraContent2": "",
        "ImageEmbedding": "Disabled",
        "RelTemplateID": "0",
        "PreHeaderText": "",
        "Options": [],
        "Attachments": false
    }
}
```

**Example Error Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": false,
    "ErrorCode": [
        2
    ]
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                                                                 |
|--------------------|------------|-----------------------------------------------------------------------------|
| 200                | 1          | Required field `EmailID` is missing                                         |
| 200                | 2          | Email with provided 'emailid' does not exist or does not belong to the user |

## Email Personalization Tags

This API end-point will return the list of personalization tags for a specific scope (and list).

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                                                                                                                                            | Required |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| Command   | `Email.PersonalizationTags`                                                                                                                                                            | Yes      | 
| SessionID | The user's session ID.                                                                                                                                                                 | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                                                                   | Yes      | 
| Scope[]   | Defines the scope of the API request. It must be provided as an `Array`. It can have the following values: `Subscriber`, `CampaignLinks`, `OptLinks`, `ListLinks`, `AllLinks`, `User`. | Yes      |
| ListId    | This parameter is required if `Subscriber` is included in the `Scope`. It represents the ID of the list.                                                                               | No       |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "PersonalizationTags": {
        "%Date=...%": "Email delivery date",
        "%Random:Letters|Numbers|Alpha:Length%": null,
        "%Random:FirstName%": null,
        "%Random:LastName%": null,
        "%MFROMDomain%": null,
        "%RemoteContentBeforeSend=http://...%": "Pre-Send Remote Content Personalization",
        "{{{var1|var2|var3|varn}}}": null
    }
}
```

**Example Error Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": false,
    "ErrorCode": [
        1
    ]
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                                                               |
|--------------------|------------|---------------------------------------------------------------------------|
| 200                | 1          | Missing `Scope` field in the request                                      |
| 200                | 2          | Missing `ListID` field in the request when `Subscriber` is in the `Scope` |

## Email Preview

This API end-point will let you preview an email by sending a test version of it.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter                | Description                                                             | Required |
|--------------------------|-------------------------------------------------------------------------|----------|
| Command                  | `Email.EmailPreview`                                                    | Yes      | 
| SessionID                | The user's session ID.                                                  | Yes      | 
| APIKey                   | The user's API key. Either `SessionID` or `APIKey` must be provided.    | Yes      | 
| EmailId                  | The unique identifier of the email.                                     | Yes      |
| EmailAddress             | The email address where the email will be sent.                         | Yes      |
| CampaignId               | The unique identifier of the campaign.                                  | No       |
| ListId                   | The unique identifier of the list.                                      | No       |
| AddUserGroupHeaderFooter | A boolean value indicating whether to add user group header and footer. | No       |
| EmailType                | The type of the email. It can be `OptInConfirmation` or `Regular`.      | No       |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0
}
```

**Example Error Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": false,
    "ErrorCode": [
        2
    ]
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                            |
|--------------------|------------|----------------------------------------|
| 200                | 1          | Missing required field: `EmailID`      |
| 200                | 2          | Missing required field: `EmailAddress` |
| 200                | 3          | Email information not found            |
| 200                | 4          | Invalid email address format           |
| 200                | 6          | List information not found             |
| 200                | 7          | Campaign information not found         |
| 200                | 8          | Sender domain not found                |

## Email Spam Test

This API end-point will test the email content matching `EmailID` via SpamAssassin filter.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| Command   | `Email.SpamTest`                                                     | Yes      | 
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 
| EmailId   | The unique identifier of the email.                                  | Yes      |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "TestResults": {
        "score": 2.2,
        "scoreLimit": 5,
        "results": [
            {
                "score": "-0.0",
                "reason": "NO_RELAYS",
                "description": "Informational: message was not relayed via SMTP"
            },
            {
                "score": "0.0",
                "reason": "HTML_MESSAGE",
                "description": "BODY: HTML included in message"
            },
            {
                "score": "2.2",
                "reason": "MPART_ALT_DIFF",
                "description": "BODY: HTML and text parts are different"
            },
            {
                "score": "-0.0",
                "reason": "NO_RECEIVED",
                "description": "Informational: message has no Received headers"
            }
        ]
    }
}
```

**Example Error Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": false,
    "ErrorCode": 2
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                                                         |
|--------------------|------------|---------------------------------------------------------------------|
| 200                | 1          | `EmailID` parameter is missing                                      |
| 200                | 2          | Email information could not be retrieved                            |
| 200                | 3          | Error occurred during SpamAssassin filter check using Octeth method |


