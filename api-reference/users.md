---
layout: doc
---

# Users API Documentation

## Retrieve Current User Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves the current user's public information, including personal details, group information, multi-factor authentication (MFA) setup, WooCommerce subscription ID, and email gateway usage and rate limits.

**Request Body Parameters:**

| Parameter       | Description                                           | Required? |
|-----------------|-------------------------------------------------------|-----------|
| SessionID       | The ID of the user's current session                  | Yes       |
| APIKey          | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command         | User.Current                                          | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "User.Current"}'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserInfo": {
    "UserID": "12345",
    "RelUserGroupID": "1",
    "EmailAddress": "user@example.com",
    "Username": "johndoe",
    "ReputationLevel": "5",
    "UserSince": "2020-01-01T00:00:00Z",
    "FirstName": "John",
    "LastName": "Doe",
    "CompanyName": "Example Corp",
    "Website": "https://www.example.com",
    "Street": "123 Example St",
    "Street2": "Suite 100",
    "City": "Example City",
    "State": "EX",
    "Zip": "12345",
    "Country": "Exampleland",
    "VAT": "EX1234567",
    "Phone": "+1234567890",
    "PhoneVerified": "Yes",
    "Fax": "+1234567891",
    "TimeZone": "UTC",
    "LastActivityDateTime": "2023-01-01T12:00:00Z",
    "AccountStatus": "Active",
    "AvailableCredits": "100",
    "2FA_Enabled": "No",
    "2FA_RecoveryKey": "abcd-efgh-ijkl-mnop",
    "SSOID": "sso-12345",
    "GroupInfo": {
      "UserGroupID": "1",
      "GroupName": "Standard",
      "GroupPlanName": "Basic Plan"
    },
    "MFA_QRCode": "https://example.com/mfa-qr-code",
    "MFA_SecretKey": "MFA123SECRET",
    "SubscriptionID": "123456789"
  },
  "Usage": {
    "EmailGateway_TotalSentThisMonth": 100,
    "EmailGateway_TotalSentAllTime": 1000,
    "Limit_Monthly": 500,
    "Limit_Lifetime": 10000
  },
  "SendRateLimits": {
    "EmailGateway": {
      "RateLimits": {
        "MaxSendPerMinute": 10,
        "MaxSendPerHour": 200,
        "MaxSendPerDay": 1000
      },
      "SendRates": {
        "CurrentSendRatePerMinute": 5,
        "CurrentSendRatePerHour": 150,
        "CurrentSendRatePerDay": 800
      }
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorMessage": "Invalid SessionID or APIKey"
}
```

```text [Error Codes]
1: Invalid SessionID or APIKey
2: User not found
3: Access denied
4: Required parameter missing
5: Internal server error
```
:::

## Retrieve User Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves user information based on the provided email address or user ID.

**Request Body Parameters:**

| Parameter     | Description                                           | Required? |
|---------------|-------------------------------------------------------|-----------|
| SessionID     | The ID of the user's current session                  | Yes       |
| APIKey        | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command       | User.Get                                              | Yes       |
| EmailAddress  | The email address of the user to retrieve information for. Required if `UserID` is not provided. | Conditional |
| UserID        | The unique identifier of the user to retrieve information for. Required if `EmailAddress` is not provided. | Conditional |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "User.Get",
    "EmailAddress": "user@example.com"
}'
```

```json [Success Response]
{
    "Success": true,
    "ErrorCode": 0,
    "UserInformation": {
        "UserID": "123",
        "FirstName": "John",
        "LastName": "Doe",
        "EmailAddress": "user@example.com",
        // Other user details
    }
}
```

```json [Error Response]
{
    "Success": false,
    "ErrorCode": [3]
}
```

```text [Error Codes]
1: "EmailAddress is required when UserID is not provided."
2: "UserID is required when EmailAddress is not provided."
3: "User not found with the provided information."
```
:::

## User Authentication

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used for authenticating a user with a username and password or an API key. It supports both standard and email-based logins, as well as two-factor authentication (2FA) recovery.

**Request Body Parameters:**

| Parameter         | Description                                                                 | Required? |
|-------------------|-----------------------------------------------------------------------------|-----------|
| SessionID         | The ID of the user's current session                                        | Yes       |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command           | User.Login                                                                  | Yes       |
| Username          | The username of the user trying to log in                                   | No*       |
| Password          | The password of the user in plain text                                      | No*       |
| PasswordEncrypted | Set to true if the password is already encrypted (MD5)                      | No        |
| DisableCaptcha    | Set to true to disable captcha verification                                 | No        |
| Captcha           | The captcha value that needs to be verified                                 | No*       |
| TfaRecoveryCode   | The recovery code for users with 2FA enabled                                | No        |
| Disable2fa        | Set to true to disable 2FA verification for this login attempt              | No        |
| TfaCode           | The 2FA code from the user's authentication app                             | No        |

::: warning NOTE
(*) `username` and `password` are required unless an `APIKey` is provided. If `disablecaptcha` is not set to true, `captcha` is required.
:::
::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=User.Login' \
  -d 'username=johndoe' \
  -d 'password=examplePassword'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "newSessionId",
  "UserInfo": {
    "UserID": "123",
    "Username": "johndoe",
    "EmailAddress": "john@example.com",
    "AccountStatus": "Enabled",
    // Additional user info fields
    "Password": "****** masked ******"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3],
  "ErrorText": ["Invalid login information"]
}
```

```text [Error Codes]
1: Missing username
2: Missing password
3: Invalid login information
4: Missing or invalid captcha
5: Invalid captcha
6: Invalid 2FA code or recovery code
```
:::

## Update User Information

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows for updating user information. It can be used to modify various user details such as email address, username, personal information, and account settings. Some parameters can only be updated by an administrator.

**Request Body Parameters:**

| Parameter             | Description                                                                 | Required? |
|-----------------------|-----------------------------------------------------------------------------|-----------|
| SessionID             | The ID of the user's current session                                        | Yes       |
| APIKey                | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command               | User.Update                                                                 | Yes       |
| UserID                | The unique identifier of the user to update                                 | Yes       |
| AccountStatus         | The new status of the user's account (admin only)                           | No        |
| AvailableCredits      | The number of available credits for the user (admin only)                   | No        |
| SignUpIPAddress       | The IP address from which the user signed up (admin only)                   | No        |
| APIKey                | The new API key for the user (admin only)                                   | No        |
| RelUserGroupID        | The ID of the user group to which the user belongs (admin only)             | No        |
| ReputationLevel       | The reputation level of the user, either 'Trusted' or 'Untrusted' (admin only) | No     |
| UserSince             | The date since the user has been a member (admin only)                      | No        |
| EmailAddress          | The new email address for the user                                          | No        |
| Username              | The new username for the user                                               | No        |
| Password              | The new password for the user                                               | No        |
| FirstName             | The user's first name                                                       | No        |
| LastName              | The user's last name                                                        | No        |
| CompanyName           | The name of the user's company                                              | No        |
| Website               | The user's website URL                                                      | No        |
| OtherEmailAddresses   | Other email addresses associated with the user                              | No        |
| Street                | The user's street address                                                   | No        |
| Street2               | Additional street address information for the user                          | No        |
| City                  | The user's city                                                             | No        |
| State                 | The user's state or region                                                  | No        |
| Zip                   | The user's postal or zip code                                               | No        |
| Country               | The user's country                                                          | No        |
| VAT                   | The user's VAT number                                                       | No        |
| Phone                 | The user's phone number                                                     | No        |
| PhoneVerified         | Whether the user's phone number is verified (1 or 0)                        | No        |
| Fax                   | The user's fax number                                                       | No        |
| TimeZone              | The user's time zone                                                        | No        |
| Language              | The user's preferred language                                               | No        |
| LastActivityDateTime  | The last activity date and time for the user                                | No        |
| ForwardToFriendHeader | Custom header for the 'Forward to Friend' emails                            | No        |
| ForwardToFriendFooter | Custom footer for the 'Forward to Friend' emails                            | No        |
| PreviewMyEmailAccount | The account information for PreviewMyEmail integration                      | No        |
| PreviewMyEmailAPIKey  | The API key for PreviewMyEmail integration                                  | No        |
| Enable2FA             | Enable two-factor authentication ('true' to enable)                        | No        |
| Cancel2FA             | Cancel two-factor authentication ('true' to cancel)                        | No        |
| RateLimits            | Custom rate limits for the user                                             | No        |
| CustomEmailHeaders    | Custom email headers for the user                                           | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=User.Update' \
  -d 'UserID=123' \
  -d 'EmailAddress=newemail@example.com'
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
  "ErrorCode": 2,
  "ErrorText": "User ID mismatch or unauthorized access."
}
```

```text [Error Codes]
1: Missing required field(s).
2: User ID mismatch or unauthorized access.
3: Connection error occurred with PreviewMyEmail.com API.
4: Two-factor authentication code verification failed.
5: User information retrieval failed.
6: Email address or username already exists.
```
:::

## Delete Users

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used to delete one or more users from the system. The user IDs to be deleted are passed as a comma-separated list.

**Request Body Parameters:**

| Parameter  | Description                                           | Required? |
|------------|-------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                  | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes |
| Command    | Users.Delete                                          | Yes       |
| users      | Comma-separated list of user IDs to delete            | Yes       |

::: code-group

```bash [Example Request]
curl -X POST https://yourapiendpoint.com/api.php \
-H "Content-Type: application/json" \
-d '{"SessionID": "your-session-id", "APIKey": "your-api-key", "Command": "Users.Delete", "users": "1,2,3"}'
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
  "ErrorCode": {
    "users": "NOT AVAILABLE IN DEMO MODE"
  }
}
```

```text [Error Codes]
NOT AVAILABLE IN DEMO MODE: The function is not available in demo mode.
```
:::

## Retrieve User List

<Badge type="info" text="POST" /> `/api.php`

This endpoint retrieves a list of users based on various criteria such as user group, account status, reputation, or a specific search term.

**Request Body Parameters:**

| Parameter          | Description                                                                 | Required? |
|--------------------|-----------------------------------------------------------------------------|-----------|
| SessionID          | The ID of the user's current session                                        | Yes       |
| APIKey             | The user's API key. Either `SessionID` or `APIKey` must be provided.        | Yes       |
| Command            | Users.Get                                                                   | Yes       |
| RecordsPerRequest  | The number of records to return per request. Defaults to 25 if not provided.| No        |
| RecordsFrom        | The starting point for records to return. Defaults to 0 if not provided.    | No        |
| RelUserGroupID     | The ID of the user group to filter by. Can be an array for multiple groups. | No        |
| OrderField         | The field to order the results by.                                          | No        |
| OrderType          | The order type (e.g., ASC, DESC).                                           | No        |
| SearchField        | The field to search within.                                                 | No        |
| SearchKeyword      | The keyword to search for.                                                  | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
-H "Content-Type: application/json" \
-d '{
    "SessionID": "your-session-id",
    "APIKey": "your-api-key",
    "Command": "Users.Get",
    "RecordsPerRequest": 10,
    "RecordsFrom": 0,
    "RelUserGroupID": "Online",
    "OrderField": "LastName",
    "OrderType": "ASC",
    "SearchField": "FirstName",
    "SearchKeyword": "John"
}'
```

```json [Success Response]
{
    "Success": true,
    "ErrorCode": 0,
    "Users": [
        {
            "UserID": 1,
            "FirstName": "John",
            "LastName": "Doe",
            "Email": "john.doe@example.com",
            // Additional user fields...
        }
        // More users...
    ],
    "TotalUsers": 100
}
```

```json [Error Response]
{
    "Success": false,
    "ErrorCode": 1,
    "ErrorMessage": "An error occurred while retrieving the user list."
}
```

```text [Error Codes]
1: An error occurred while retrieving the user list.
```
:::
