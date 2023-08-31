---
layout: doc
---

# Email Gateway API Documentation

::: warning
Each API end-point on this article may have a different authentication method. Please make sure you use the correct authentication method.
:::

## Retrieve Sender Emails

This API command will return the list of sender domains set for the given user account.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| Command   | `EmailGateway.GetDomains`                                            | Yes      | 
| SessionID | The user's session ID.                                               | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      | 

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "Domains": [
        {
            "DomainID": "1",
            "SenderDomain": "abc.com",
            "CreatedAt": "2022-12-14 09:57:11",
            "Status": "Enabled",
            "VerificationMeta": {
                "DNSRecords": {
                    "sl.abc.com": [
                        "CNAME",
                        "mailer.deliveryservers.com"
                    ],
                    "key1._domainkey.sl.abc.com": [
                        "CNAME",
                        "key1._domainkey.mailer.deliveryservers.com"
                    ],
                    "_DMARC.sl.abc.com": [
                        "CNAME",
                        "_DMARC.mailer.deliveryservers.com"
                    ],
                    "track.sl.abc.com": [
                        "CNAME",
                        "track.mailer.deliveryservers.com"
                    ],
                    "87ER9i6bTe.sl.abc.com": [
                        "TXT",
                        "Z1crTW8ybTNheUVRRHR4QXhHWVd2U2xtS1o3RUZtdUx3WUhnYVdMMVZlOD0="
                    ]
                }
            },
            "PolicyMeta": [],
            "Options": {
                "LinkTracking": true,
                "OpenTracking": true,
                "UnsubscribeLink": false
            }
        },
        {
            "DomainID": "2",
            "SenderDomain": "abc2.com",
            "CreatedAt": "2022-12-14 12:38:48",
            "Status": "Approval Pending",
            "VerificationMeta": {
                "DNSRecords": {
                    "sl.abc2.com": [
                        "CNAME",
                        "mailer.deliveryservers.com"
                    ],
                    "key1._domainkey.sl.abc2.com": [
                        "CNAME",
                        "key1._domainkey.mailer.deliveryservers.com"
                    ],
                    "_DMARC.sl.abc2.com": [
                        "CNAME",
                        "_DMARC.mailer.deliveryservers.com"
                    ],
                    "track.sl.abc2.com": [
                        "CNAME",
                        "track.mailer.deliveryservers.com"
                    ],
                    "QD6O8em5yB.sl.abc2.com": [
                        "TXT",
                        "Mzg1OW55VlRsR045bm1qWk1VNlE1VElkcmJhKzVSU0plbmNaRE9jWjR2cz0="
                    ]
                }
            },
            "PolicyMeta": [],
            "Options": {
                "LinkTracking": true,
                "OpenTracking": true,
                "UnsubscribeLink": false
            }
        }
    ]
}
```

**Example Error Response:**

There's no error case for this API end-point.

## Send Email

This API command allows you to send an email using one of the verified sender domains.

### <Badge type="info" text="POST" /> `/api/v1/email`

**Request Body:**

::: info
This API endpoint accepts raw body in JSON format.
:::

::: warning
Authentication is made via `Bearer` token as request header. The bearer token is the sender domain API key. 
:::

```json
{
    "From": {"name": "Test From", "email": "test@sender.com"},
    "Reply-To": {"name":"Test ReplyTo", "email":"test@replyto.com"},
    "To": [{"name":"Test Recipient", "email":"test@recipient.com"}],
    "BCC": [{"name":"Test BCC", "email":"test@bcc.com"}],
    "Subject": "This is a test email subject!",
    "ContentType": "HTML",
    "HTMLContent": "<html><body>This is a test email</body></html>",
    "PlainContent": "This is the plain text email.",
    "TrackLinks": true,
    "TrackOpens": true,
    "Attachments":[
      {
        "Content": "<base64_encoded_attachment_file_content>",
        "Filename": "test.zip",
        "Disposition": "attachment",
        "Type": "application/zip"
      }
    ]
}
```

| Parameter    | Description                                                                                                                                                   | Required |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SenderApiKey | The API key of the sender. Alternatively, this parameter can be passed as `Bearer` authorization token.                                                       | No       |
| From         | An array containing the `name` and `email` of the sender. Both `name` and `email` are required fields.                                                        | Yes      |
| ReplyTo      | An array of Reply-To email addresses. Each item in the array should be an associative array with `name` and `email` keys.                                     | No       |
| To           | An array of recipients. Each recipient is an array containing `name` and `email`. Both `name` and `email` are required fields.                                | Yes      |
| Cc           | An array of CC email addresses. Each array item is an associative array with `name` and `email` keys.                                                         | No       |
| Bcc          | An array of BCC email addresses. Each item in the array should be an associative array with `name` and `email` keys.                                          | No       |
| TargetListId | The ID of the target subscriber list. This should be a numeric value.                                                                                         | No       |
| TemplateId   | The ID of the email template. This is an optional field.                                                                                                      | No       |
| Headers      | An array of email headers. Array key represents the email header name, and array value represents the email header value.                                     | No       |
| ContentType  | The type of content for the email. This should be either `HTML` or `Plain`.                                                                                   | Yes      |
| Subject      | The subject of the email. This is a required field.                                                                                                           | Yes      |
| HtmlContent  | The HTML content of the email. This field is required if ContentType is `HTML` and `TemplateId` is not provided.                                              | Yes      |
| PlainContent | The plain text content of the email. This field is required if ContentType is not `HTML` and `TemplateId` is not provided.                                    | Yes      |
| TrackLinks   | A `boolean` value indicating whether link tracking is enabled.                                                                                                | No       |
| TrackOpens   | A `boolean` value indicating whether open tracking is enabled.                                                                                                | No       |
| Tags         | An array of tags associated with the API request.                                                                                                             | No       |
| SendAt       | The planned delivery time of the email. It should be formatted as `YYYY-MM-DD HH:II:SS` format.                                                               | No       |
| Attachments  | An array of attachments. Each attachment is an array containing the following keys: `Content`, `Filename`, `Disposition`, `Type`, and optionally `ContentID`. | No       |

**Example Success Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "MessageID": "55c07eb1-1bc1-4628-8c77-2861fc01c627"
}
```

**Example Error Response:**

<Badge type="danger" text="HTTP Code: 422 Unprocessable Entity" /> 

```json
{
    "Errors": [
        {
            "Code": 3,
            "Message": "From parameter is either missing or invalid. Make sure you pass both name and email address for the from field"
        }
    ]
}
```

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                                                                                                    |
|--------------------|------------|----------------------------------------------------------------------------------------------------------------|
| 404                | 2          | Invalid DomainID                                                                                               |
| 422                | 3          | From parameter is either missing or invalid. Make sure you pass both name and email address for the from field |
| 422                | 8          | To email address is missing                                                                                    |
| 404                | 12         | Invalid or deactivated user account                                                                            |
| 401                | 13         | Invalid SenderAPIKey                                                                                           |
| 409                | 14         | Email address is in the suppression list. Email delivery is blocked                                            |
| 422                | 15         | Invalid TemplateID                                                                                             |
| 422                | 16         | Invalid TargetListID                                                                                           |
| 420                | 17         | Email sending limit reached                                                                                    |
| 422                | 18         | Recipient name or email address is missing                                                                     |
| 422                | 19         | Recipient email address is invalid                                                                             |
| 422                | 20         | There is no recipient set for the email                                                                        |
| 422                | 20         | CC email addresses must be set as an array                                                                     |
| 422                | 20         | The number of recipients exceed the allowed recipient email address count (X)                                  |
| 422                | 21         | CC name or email address is missing                                                                            |
| 422                | 22         | CC email address is invalid                                                                                    |
| 422                | 23         | Invalid from email address format                                                                              |
| 422                | 23         | The number of CC email addresses exceed the allowed email address count (X)                                    |
| 422                | 24         | BCC email addresses must be set as an array                                                                    |
| 422                | 25         | BCC name or email address is missing                                                                           |
| 422                | 26         | BCC email address is invalid                                                                                   |
| 422                | 27         | The number of BCC email addresses exceed the allowed email address count (X)                                   |
| 422                | 28         | Reply-To email addresses must be set as an array                                                               |
| 422                | 29         | Reply-To name or email address is missing                                                                      |
| 422                | 30         | Reply-To email address is invalid                                                                              |
| 422                | 31         | The number of Reply-To email addresses exceed the allowed email address count                                  |
| 403                | 32         | Domain is not activated                                                                                        |
| 403                | 34         | User account is not verified                                                                                   |
| 429                | 429        | Too many requests. Wait for X seconds for another X attempts                                                   |
| 429                | 429        | You have exceeded your send rate limits. Please wait before sending another email                              |
| 500                | N/A        | The server encountered an unexpected condition which prevented it from fulfilling the request.                 |

:::info
Please note that X in the descriptions represents a dynamic value that changes based on the context.
:::