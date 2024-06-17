---
layout: doc
---

## Create New Email

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to create a new email record associated with the user's account.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | Email.Create                                                         | Yes       |
| RelUserID | The ID of the user related to the email                              | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Email.Create",
    "RelUserID": "12345"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailID": "new-email-id"
}
```

```txt [Error Response]
No error code is returned for this API end-point
```

```txt [Error Codes]
No error code is returned for this API end-point
```

:::

## Delete Email

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows for the deletion of an email associated with a user's account. The user must provide the unique
identifier of the email they wish to delete.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | The API command parameter, in this case, `Email.Delete`              | Yes       |
| EmailID   | The unique identifier of the email to be deleted                     | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Email.Delete", "EmailID": "123"}'
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
  "ErrorCode": 1,
  "ErrorText": "Required field missing: EmailID"
}
```

```txt [Error Codes]
1: Required field missing: EmailID
```

:::

## Duplicate an Email

<Badge type="info" text="POST" /> `/api.php`

This endpoint duplicates an existing email by its unique identifier and associates the duplicate with the current user's
account.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | Email.Duplicate                                                      | Yes       |
| EmailID   | The unique identifier of the email to duplicate                      | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
-H "Content-Type: application/json" \
-d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Email.Duplicate", "EmailID": "123"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailID": "124",
  "EmailName": "Copy of Original Email Name"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ]
}
```

```txt [Error Codes]
1: The 'EmailID' parameter is missing or invalid.
2: The specified email does not exist or you do not have permission to access it.
```

:::

## Preview an Email

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows you to preview an email by sending it to a specified email address. It is useful for testing the
appearance and content of an email before sending it out to the actual recipients.

**Request Body Parameters:**

Here are the rephrased descriptions:

| Parameter                | Description                                                                                                                              | Required? |
|--------------------------|------------------------------------------------------------------------------------------------------------------------------------------|-----------|
| SessionID                | The ID of the user's current session.                                                                                                    | Yes       |
| APIKey                   | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                     | Yes       |
| Command                  | The command for email preview, set as `Email.EmailPreview`.                                                                              | Yes       |
| EmailID                  | The unique identifier of the email to be previewed.                                                                                      | Yes       |
| EmailAddress             | The email address where the preview will be sent.                                                                                        | Yes       |
| CampaignID               | The ID of the campaign associated with the email (optional).                                                                             | No        |
| ListID                   | The ID of the list associated with the email (optional).                                                                                 | No        |
| AddUserGroupHeaderFooter | Indicates if the user group header and footer should be added (optional).                                                                | No        |
| EmailType                | The type of the email, e.g., 'optinconfirmation' (optional).                                                                             | No        |
| HTMLContent              | The HTML content of the preview email (if `EmailID` is not provided).                                                                    | No        |
| PlainTextContent         | The plain text content of the preview email (if `EmailID` is not provided).                                                              | No        |
| FromName                 | The "from name" email header of the preview email (if `EmailID` is not provided). If not provided, `Preview Email` will be set.          | No        |
| FromEmailAddress         | The "from email address" header of the preview email (if `EmailID` is not provided). If not provided, `preview@preview.com` will be set. | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Email.EmailPreview",
    "EmailID": "123",
    "EmailAddress": "test@example.com",
    "CampaignID": "456",
    "ListID": "789",
    "AddUserGroupHeaderFooter": true,
    "EmailType": "optinconfirmation"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1
}
```

```txt [Error Codes]
1: Email ID is required.
2: Email address is required.
3: Email not found.
4: Invalid email address format.
6: List not found.
7: Campaign not found.
8: Sender domain not found or not associated with the user.
```

:::

## Retrieve Email Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves detailed information about a specific email by its unique identifier.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | Email.Get                                                            | Yes       |
| EmailID   | The unique identifier of the email to retrieve                       | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Email.Get",
    "EmailID": "12345"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "EmailInformation": {
    "EmailID": "12345",
    "Subject": "Your Email Subject",
    "Body": "The content of the email..."
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ]
}
```

```txt [Error Codes]
1: The required parameter 'EmailID' is missing.
2: Email not found or you do not have permission to view it.
```

:::

## Retrieve Personalization Tags

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows the retrieval of various personalization tags based on the specified scope. Personalization tags
can include subscriber information, campaign links, opt-in links, list links, and user information.

**Request Body Parameters:**

| Parameter | Description                                                                                                                                            | Required?   |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| SessionID | The ID of the user's current session                                                                                                                   | Yes         |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                                   | Yes         |
| Command   | Email.PersonalizationTags                                                                                                                              | Yes         |
| Scope     | A list of scopes to retrieve personalization tags for. Possible values are 'Subscriber', 'CampaignLinks', 'OptLinks', 'ListLinks', 'AllLinks', 'User'. | Yes         |
| ListID    | The ID of the list to retrieve subscriber tags for. Required if 'Subscriber' is included in the scope.                                                 | Conditional |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Email.PersonalizationTags",
    "Scope": ["Subscriber", "User"],
    "ListID": "123"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "PersonalizationTags": [
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": {
    "scope": 1,
    "listid": 2
  }
}
```

```txt [Error Codes]
1: Scope parameter is missing or invalid.
2: ListID is required when 'Subscriber' is included in the scope.
```

:::

## Email Spam Test

<Badge type="info" text="POST" /> `/api.php`

This endpoint performs a spam test on an email by passing its content through a spam filter and returning the results.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | Email.SpamTest                                                       | Yes       |
| EmailID   | The unique identifier of the email to be tested                      | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Email.SpamTest",
    "EmailID": "12345"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TestResults": {
    "SpamStatus": "No",
    "Score": 1.5,
    "Details": "Details of the spam test results..."
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Email ID is required."
}
```

```txt [Error Codes]
1: Email ID is required.
2: Email not found.
3: Error processing spam test.
```

:::

## Update Email Content

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows updating the content and settings of an existing email by providing the necessary parameters.

**Request Body Parameters:**

| Parameter                | Description                                                                 | Required? |
|--------------------------|-----------------------------------------------------------------------------|-----------|
| SessionID                | The ID of the user's current session                                        | Yes       |
| APIKey                   | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command                  | Email.Update                                                                | Yes       |
| EmailID                  | Unique identifier for the email to be updated                               | Yes       |
| ValidateScope            | Scope of validation for the email content (OptIn, Campaign, AutoResponder)  | Yes       |
| Mode                     | The mode of the email content (Editor, Stripo, Unlayer, etc.)               | No        |
| RelTemplateID            | The ID of the related template, if applicable                               | No        |
| SenderDomain             | The sender's domain to be used for the email                                | No        |
| FromEmail                | The email address that appears in the "from" field                          | No        |
| FromName                 | The name that appears in the "from" field                                   | No        |
| ReplyToEmail             | The email address that appears in the "reply-to" field                      | No        |
| ReplyToName              | The name that appears in the "reply-to" field                               | No        |
| Subject                  | The subject line of the email                                               | No        |
| HTMLContent              | The HTML content of the email                                               | No        |
| PlainContent             | The plain text content of the email                                         | No        |
| FetchURL                 | URL to fetch HTML content from, if mode is 'Import'                         | No        |
| FetchPlainURL            | URL to fetch plain text content from, if mode is 'Import'                   | No        |
| ImageEmbedding           | Indicates if images should be embedded in the email content                 | No        |
| PreHeaderText            | Pre-header text to be included in the email                                 | No        |
| ExtraContent1            | Additional content field 1                                                  | No        |
| ExtraContent2            | Additional content field 2                                                  | No        |
| PlainContentAutoConvert  | Indicates if plain content should be auto-converted from HTML content       | No        |
| SubjectSetToTitleElement | Indicates if the subject should be set to the title element of HTML content | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=example-session-id' \
  -d 'APIKey=example-api-key' \
  -d 'Command=Email.Update' \
  -d 'EmailID=123' \
  -d 'ValidateScope=OptIn' \
  -d 'Mode=Editor' \
  -d 'HTMLContent=<p>Your updated email content here</p>' \
  -d 'Subject=Updated Subject Line'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    1
  ]
}
```

```txt [Error Codes]
1: Email ID is required
3: Email does not exist
4: Invalid mode specified
5: Template ID is required when mode is 'Template'
6: Invalid FromEmail format
7: Invalid ReplyToEmail format
8: Content type cannot be empty
9: ValidateScope is required
10: Invalid ValidateScope value
11: Unsubscribe link is required in HTML content
12: Unsubscribe link is required in Plain content
13: Confirm link is required in HTML content
14: Confirm link is required in Plain content
15: Reject link is required in HTML content
16: Reject link is required in Plain content
17: Sender domain does not exist
```

:::

## Retrieve List of Emails

<Badge type="info" text="POST" /> `/api.php`

This API call returns the list of email contents associated with the user's account.

**Request Body Parameters:**

| Parameter | Description                                                          | Required? |
|-----------|----------------------------------------------------------------------|-----------|
| SessionID | The ID of the user's current session                                 | Yes       |
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command   | Emails.Get                                                           | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourdomain.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Emails.Get"
}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalEmailCount": 5,
  "Emails": [
  ]
}
```

```txt [Error Response]
No error code is returned for this API end-point
```

```txt [Error Codes]
No error code is returned for this API end-point
```

:::
