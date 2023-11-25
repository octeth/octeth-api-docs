---
layout: doc
---

# Suppression Lists

## Browse Suppression List

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of suppressed email addresses for a user, with optional search patterns and pagination.

**Request Body Parameters:**

| Parameter     | Description                                                                    | Required? |
|---------------|--------------------------------------------------------------------------------|-----------|
| SessionID     | The ID of the user's current session                                           | Yes       |
| APIKey        | The user's API key. Either `SessionID` or `APIKey` must be provided.           | Yes       |
| Command       | Suppression.Browse                                                             | Yes       |
| SearchPattern | The pattern to search for in the suppressed email list. Use '*' as a wildcard. | No        |
| StartFrom     | The starting index for the list of suppressed emails to retrieve.              | No        |
| RetrieveCount | The number of suppressed emails to retrieve.                                   | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Suppression.Browse' \
  -d 'SearchPattern=example*' \
  -d 'StartFrom=0' \
  -d 'RetrieveCount=100'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalRecords": 250,
  "SuppressedEmails": [
    "example1@example.com",
    "example2@example.com"
  ]
}
```

```text [Error Response]
This API call does not return any error codes.
```

```text [Error Codes]
This API call does not return any error codes.
```
:::

## Remove Email from Suppression List

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to remove an email address from a user's suppression list. The suppression list is a list of email addresses that a user has chosen not to receive communications from.

**Request Body Parameters:**

| Parameter    | Description                                                          | Required? |
|--------------|----------------------------------------------------------------------|-----------|
| SessionID    | The ID of the user's current session                                 | Yes       |
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command      | Suppression.Delete                                                   | Yes       |
| EmailAddress | The email address to be removed from the suppression list            | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
      "SessionID": "your-session-id", 
      "APIKey": "your-api-key", 
      "Command": "Suppression.Delete", 
      "EmailAddress": "user@example.com"
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
  "ErrorCode": [1]
}
```

```text [Error Codes]
1: Missing required parameter: EmailAddress
2: Invalid email address format
```
:::

## Import Email Addresses to Suppression List

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to import email addresses into the suppression list. The suppression list is a list of email addresses that are excluded from receiving emails. This can be done by providing a JSON array of email addresses or a bulk string with email addresses separated by new lines.

**Request Body Parameters:**

| Parameter          | Description                                                                 | Required? |
|--------------------|-----------------------------------------------------------------------------|-----------|
| SessionID          | The ID of the user's current session                                        | Yes       |
| APIKey             | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command            | Suppression.Import                                                          | Yes       |
| EmailAddresses     | JSON array of email addresses to be added to the suppression list           | No        |
| EmailAddressesBulk | Bulk string of email addresses separated by new lines                       | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "your-session-id",
        "APIKey": "your-api-key",
        "Command": "Suppression.Import",
        "EmailAddresses": "[\"user1@example.com\", \"user2@example.com\"]",
        "EmailAddressesBulk": "user3@example.com\nuser4@example.com"
      }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "TotalImported": 4,
  "TotalFailed": 0,
  "FailedEmailAddresses": []
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2],
  "ErrorMessage": "Invalid email address format or missing email addresses."
}
```

```text [Error Codes]
1: Email addresses not provided in either 'EmailAddresses' or 'EmailAddressesBulk'.
2: Invalid email address format.
```
:::

 
::: warning NOTICE
- Please note that at least one of the parameters `EmailAddresses` or `EmailAddressesBulk` must be provided. 
- If both are provided, they will be processed together. 
- The `EmailAddresses` parameter must be a valid JSON array of email addresses, and `EmailAddressesBulk` must be a string with email addresses separated by new lines. 
- If an email address is invalid, it will be counted as failed and returned in the `FailedEmailAddresses` array in the response.
:::