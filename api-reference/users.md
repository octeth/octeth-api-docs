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

Retrieve publicly available information about the current logged-in user, including details related to email gateway usage and rate limits.

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



