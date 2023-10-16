---
layout: doc
---

# Users API Documentation

Certainly! Below is the API documentation for the `User.Get` endpoint in markdown format based on the provided PHP code:

## Retrieve a User

Retrieve user information using either an email address or user ID.

### <Badge type="info" text="POST" /> `/api.php`

**Request Body Parameters:**

| Parameter    | Description                                                                                          | Required |
|--------------|------------------------------------------------------------------------------------------------------|----------|
| SessionID    | The ID of the user's current session.                                                                | Yes      | 
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided.                                 | Yes      | 
| Command      | `User.Get`                                                                                           | Yes      | 
| EmailAddress | The email address of the user. Either `EmailAddress` or `UserID` must be provided, but not both.     | Yes*     | 
| UserID       | The unique identifier of the user. Either `EmailAddress` or `UserID` must be provided, but not both. | Yes*     | 

::: info
(*) Only one of these parameters should be provided. If both are provided, `UserID` takes precedence.
:::

**Example Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "Success": true,
  "ErrorCode": 0,
  "UserInformation": {
    "UserID": "12345",
    "EmailAddress": "example@example.com",
    "...": "..."
  }
}
```

**HTTP Response and Error Codes:**

| HTTP Code | Response JSON                          | Description                                |
|-----------|----------------------------------------|--------------------------------------------|
| 200 OK    | { "Success": true, ... }               | The request was successful.                |
| 200 OK    | { "Success": false, "ErrorCode": [1] } | Missing `EmailAddress` parameter.          |
| 200 OK    | { "Success": false, "ErrorCode": [2] } | Missing `UserID` parameter.                |
| 200 OK    | { "Success": false, "ErrorCode": [3] } | User not found with the provided criteria. |

## Retrieve Current User

Retrieve publicly available information about the current logged-in user, including details related to email gateway
usage and rate limits.

### <Badge type="info" text="POST" /> `/api.php`

**Request Body Parameters:**

| Parameter    | Description                                                                                          | Required |
|--------------|------------------------------------------------------------------------------------------------------|----------|
| SessionID    | The ID of the user's current session.                                                                | Yes      | 
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided.                                 | Yes      | 
| Command      | `User.Current`                                                                                       | Yes      | 

**Example Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "Success": true,
  "ErrorCode": 0,
  "UserInfo": {
    "UserID": "12345",
    "RelUserGroupID": "...",
    "EmailAddress": "example@example.com",
    "...": "...",
    "MFA_QRCode": "url_to_qrcode",
    "MFA_SecretKey": "secret_key",
    "SubscriptionID": "sub_id_or_false"
  },
  "Usage": {
    "EmailGateway_TotalSentThisMonth": 100,
    "EmailGateway_TotalSentAllTime": 5000,
    "Limit_Monthly": 1000,
    "Limit_Lifetime": 50000
  },
  "SendRateLimits": {
    "EmailGateway": {
      "RateLimits": "user_or_group_rate_limits",
      "SendRates": "user_send_rates"
    }
  }
}
```

**HTTP Response and Error Codes:**

| HTTP Code  | Response JSON                                  | Description                            |
|------------|------------------------------------------------|----------------------------------------|
| 200 OK     | { "Success": true, ... }                       | The request was successful.            |

## Update User Information

This API endpoint is used to update the information of a specific user. The user is identified by their `UserID`. The
endpoint checks if the user is logged in and if the user ID matches the logged-in user's ID. If the user is an admin,
they can update additional fields. The endpoint also validates the email address and username to ensure they are unique.
If the user is not an admin and tries to update fields that are only updatable by an admin, an error is thrown.

### <Badge type="info" text="POST" /> `/api.php`

**Request Body Parameters:**

| Parameter             | Description                                                               | Required |
|-----------------------|---------------------------------------------------------------------------|----------|
| SessionID             | The ID of the user's current session.                                     | Yes      | 
| APIKey                | The user's API key. Either `SessionID` or `APIKey` must be provided.      | Yes      | 
| Command               | `User.Update`                                                             | Yes      | 
| UserID                | The ID of the user to update.                                             | Yes      |
| AccountStatus         | The status of the user's account. Only updatable by an admin.             | No       |
| AvailableCredits      | The number of available credits for the user. Only updatable by an admin. | No       |
| SignupIpAddress       | The IP address from which the user signed up. Only updatable by an admin. | No       |
| AccountApiKey         | The user's API key. Only updatable by an admin.                           | No       |
| RelUserGroupId        | The ID of the user group the user belongs to. Only updatable by an admin. | No       |
| ReputationLevel       | The reputation level of the user. Only updatable by an admin.             | No       |
| UserSince             | The date and time the user joined. Only updatable by an admin.            | No       |
| EmailAddress          | The user's email address.                                                 | No       |
| Username              | The user's username.                                                      | No       |
| Password              | The user's password.                                                      | No       |
| FirstName             | The user's first name.                                                    | No       |
| LastName              | The user's last name.                                                     | No       |
| CompanyName           | The user's company name.                                                  | No       |
| Website               | The user's website.                                                       | No       |
| OtherEmailAddresses   | Other email addresses of the user.                                        | No       |
| Street                | The user's street address.                                                | No       |
| Street2               | The user's secondary street address.                                      | No       |
| City                  | The user's city.                                                          | No       |
| State                 | The user's state.                                                         | No       |
| Zip                   | The user's zip code.                                                      | No       |
| Country               | The user's country.                                                       | No       |
| Vat                   | The user's VAT number.                                                    | No       |
| Phone                 | The user's phone number.                                                  | No       |
| PhoneVerified         | Whether the user's phone number is verified.                              | No       |
| Fax                   | The user's fax number.                                                    | No       |
| TimeZone              | The user's timezone.                                                      | No       |
| Language              | The user's language.                                                      | No       |
| LastActivityDateTime  | The date and time of the user's last activity.                            | No       |
| ForwardToFriendHeader | The header of the user's "forward to friend" emails.                      | No       |
| ForwardToFriendFooter | The footer of the user's "forward to friend" emails.                      | No       |
| PreviewMyEmailAccount | The user's PreviewMyEmail account.                                        | No       |
| PreviewMyEmailApiKey  | The user's PreviewMyEmail API key.                                        | No       |
| Enable2fa             | Whether to enable two-factor authentication for the user.                 | No       |
| 2facode               | The two-factor authentication code.                                       | No       |
| Cancel2fa             | Whether to cancel two-factor authentication for the user.                 | No       |
| RateLimits            | The rate limits for the user.                                             | No       |
| CustomEmailHeaders    | Custom email headers for the user.                                        | No       |

**Example Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

**HTTP Response and Error Codes:**

| Code | Description                                                     |
|------|-----------------------------------------------------------------|
| 0    | Success                                                         |
| 1    | Required fields are missing                                     |
| 2    | User ID does not match the logged in user's ID                  |
| 3    | Connection error occurred while checking PreviewMyEmail account |
| 4    | Two-factor authentication code is incorrect                     |
| 5    | User information could not be retrieved                         |
| 6    | Email address or username is not unique                         |

## Retrieve User List

This API endpoint is used to retrieve users based on various criteria such as user group, online status, account status, and account reputation. It also supports pagination and ordering of results.

### <Badge type="info" text="POST" /> `/api.php`

**Request Body Parameters:**

| Parameter         | Description                                                                                                                                                 | Required |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------|----------|
| SessionID         | The ID of the user's current session.                                                                                                                       | Yes      |
| APIKey            | The user's API key. Either `SessionID` or `APIKey` must be provided.                                                                                        | Yes      |
| Command           | `Users.Get`                                                                                                                                                 | Yes      | 
| RecordsPerRequest | The number of records to return per request. Defaults to 25 if not provided.                                                                                | No       |
| RecordsFrom       | The starting index from which to return records. Defaults to 0 if not provided.                                                                             | No       |
| RelUsergroupId    | The ID of the user group to filter by. Can be an array for multiple groups. Special values include 'Online', 'Enabled', 'Disabled', 'Trusted', 'Untrusted'. | No       |
| OrderField        | The field to order the results by. Can be a pipe-separated string for multiple fields.                                                                      | No       |
| OrderType         | The order type (ASC or DESC). Can be a pipe-separated string for multiple fields.                                                                           | No       |
| SearchField       | The field to search by.                                                                                                                                     | No       |
| SearchKeyword     | The keyword to search for.                                                                                                                                  | No       |

**Example Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
    "Success": true,
    "ErrorCode": 0,
    "Users": [
        {
            "UserID": 1,
            "Username": "JohnDoe",
            "Email": "johndoe@example.com",
            "LastActivityDateTime": "2021-12-01T12:00:00Z",
            "AccountStatus": "Enabled",
            "ReputationLevel": "Trusted"
        },
        // More users...
    ],
    "TotalUsers": 100
}
```

**HTTP Response and Error Codes:**

This API endpoint doesn't return any errors.

## Delete a User

This API endpoint is used to delete one or more users from the system.

### <Badge type="info" text="POST" /> `/api.php`

**Request Body Parameters:**

| Parameter | Description                                                          | Required |
|-----------|----------------------------------------------------------------------|----------|
| SessionID | The ID of the user's current session.                                | Yes      | 
| APIKey    | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes      |
| Command   | `Users.Delete`                                                       | Yes      | 
| Users     | A comma-separated list of user IDs to be deleted.                    | Yes      |

**Example Successful Response:**

<Badge type="info" text="HTTP Code: 200 OK" /> 

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": ""
}
```

**Error Codes:**

| Error Code | Description                 |
|------------|-----------------------------|
| 1          | UserID parameter is missing |