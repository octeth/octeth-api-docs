---
layout: doc
---

# User API Documentation

User management endpoints for creating, authenticating, and managing user accounts and user groups.

## Create a User

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| RelUserGroupID | Integer | Yes | User group ID to assign the user to |
| EmailAddress | String | Yes | User's email address |
| Username | String | Yes | Username for login (must be unique) |
| Password | String | Yes | User's password (will be hashed) |
| TimeZone | String | Yes | User's timezone |
| Language | String | Yes | User's language code (e.g., 'en') |
| CompanyName | String | Conditional | Company name (required if FirstName not provided) |
| FirstName | String | Conditional | First name (required if CompanyName not provided) |
| LastName | String | No | Last name |
| Website | String | No | Website URL |
| OtherEmailAddresses | String | No | Additional email addresses |
| Street | String | No | Street address |
| City | String | No | City |
| State | String | No | State/Province |
| Zip | String | No | ZIP/Postal code |
| Country | String | No | Country |
| Phone | String | No | Phone number |
| PhoneVerified | Boolean | No | Phone verification status |
| Fax | String | No | Fax number |
| PreviewMyEmailAccount | String | No | Preview email account |
| PreviewMyEmailAPIKey | String | No | Preview email API key |
| ForwardToFriendHeader | String | No | Forward to friend header text |
| ForwardToFriendFooter | String | No | Forward to friend footer text |
| AccountStatus | String | No | Account status ('Enabled' or 'Disabled', default: 'Enabled') |
| AvailableCredits | Integer | No | Initial credits (default: 0) |
| ReputationLevel | String | No | Reputation level ('Trusted' or 'Untrusted', default: 'Trusted') |
| SignUpIPAddress | String | No | User signup IP address |
| SSOID | String | No | Single sign-on ID |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.create",
    "SessionID": "your-session-id",
    "RelUserGroupID": 1,
    "EmailAddress": "user@example.com",
    "Username": "newuser",
    "Password": "securepassword",
    "TimeZone": "America/New_York",
    "Language": "en",
    "FirstName": "John",
    "LastName": "Doe"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserID": 123
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2, 3]
}
```

```txt [Error Codes]
0: Success
1: Missing RelUserGroupID parameter
2: Missing EmailAddress parameter
3: Missing Username parameter
4: Missing Password parameter
6: Missing CompanyName or FirstName parameter
8: Missing TimeZone parameter
9: Missing Language parameter
10: Invalid email address format
11: Invalid user group ID
12: Username already exists
13: Email address already exists
14: Invalid language code
15: Invalid reputation level (must be 'Trusted' or 'Untrusted')
16: Maximum number of user accounts exceeded
```

:::

## User Login

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.login`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | Conditional | API key for authentication (alternative to username/password) |
| Username | String | Conditional | Username or email address (required if not using APIKey) |
| Password | String | Conditional | User's password (required if not using APIKey) |
| PasswordEncrypted | Boolean | No | Set to true if password is already MD5 hashed |
| Captcha | String | Conditional | CAPTCHA value (required if CAPTCHA is enabled) |
| DisableCaptcha | Boolean | No | Set to true to disable CAPTCHA requirement |
| TFACode | String | Conditional | Two-factor authentication code (required if 2FA is enabled) |
| TFARecoveryCode | String | No | Two-factor authentication recovery code |
| Disable2FA | Boolean | No | Set to true to disable 2FA verification |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.login",
    "Username": "john.doe",
    "Password": "securepassword"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "abc123def456",
  "UserInfo": {
    "UserID": 123,
    "Username": "john.doe",
    "EmailAddress": "john@example.com",
    "FirstName": "John",
    "LastName": "Doe",
    "AccountStatus": "Enabled"
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

```txt [Error Codes]
0: Success
1: Missing Username parameter
2: Missing Password parameter
3: Invalid login information
4: Missing Captcha parameter
5: Invalid CAPTCHA value
6: Invalid 2FA code or recovery code
```

:::

## Get Current User Information

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.current`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.current",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserInfo": {
    "UserID": 123,
    "RelUserGroupID": 1,
    "EmailAddress": "user@example.com",
    "Username": "john.doe",
    "ReputationLevel": "Trusted",
    "UserSince": "2024-01-15 10:30:00",
    "FirstName": "John",
    "LastName": "Doe",
    "CompanyName": "",
    "Website": "",
    "Street": "",
    "Street2": "",
    "City": "",
    "State": "",
    "Zip": "",
    "Country": "",
    "VAT": "",
    "Phone": "",
    "PhoneVerified": 0,
    "Fax": "",
    "TimeZone": "America/New_York",
    "LastActivityDateTime": "2024-12-28 10:00:00",
    "AccountStatus": "Enabled",
    "AvailableCredits": 1000,
    "2FA_Enabled": "No",
    "2FA_RecoveryKey": "",
    "SSOID": "",
    "GroupInfo": {
      "UserGroupID": 1,
      "GroupName": "Standard Users",
      "GroupPlanName": "Standard Plan",
      "DefaultSenderDomain": "example.com"
    },
    "MFA_QRCode": "otpauth://totp/...",
    "MFA_SecretKey": "ABCDEF123456",
    "SubscriptionID": false
  },
  "Usage": {
    "EmailGateway_TotalSentThisMonth": 500,
    "EmailGateway_TotalSentAllTime": 5000,
    "Limit_Monthly": 10000,
    "Limit_Lifetime": 100000
  },
  "SendRateLimits": {
    "EmailGateway": {
      "RateLimits": {},
      "SendRates": {}
    },
    "DefaultSenderDomain": {
      "MonthlyLimit": 5000,
      "SendRates": 500,
      "RemainingMonthlyQuota": 4500
    }
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Authentication required
```

:::

## Get User Information

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Conditional | User ID (required if EmailAddress not provided) |
| EmailAddress | String | Conditional | Email address (required if UserID not provided) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.get",
    "SessionID": "your-session-id",
    "UserID": 123
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserInformation": {
    "UserID": 123,
    "RelUserGroupID": 1,
    "EmailAddress": "user@example.com",
    "Username": "john.doe",
    "FirstName": "John",
    "LastName": "Doe",
    "GroupInformation": {}
  },
  "LimitUtilization": {
    "Subscribers": {"Used": 100, "Limit": 1000},
    "Lists": {"Used": 5, "Limit": 10}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing UserID or EmailAddress parameter
3: User not found
```

:::

## Update User

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key or User API Key
- Required permissions: `User.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.update`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Yes | User ID to update |
| EmailAddress | String | No | New email address |
| Username | String | No | New username |
| Password | String | No | New password (will be hashed) |
| FirstName | String | No | First name |
| LastName | String | No | Last name |
| CompanyName | String | No | Company name |
| Website | String | No | Website URL |
| OtherEmailAddresses | String | No | Additional email addresses |
| Street | String | No | Street address |
| Street2 | String | No | Street address line 2 |
| City | String | No | City |
| State | String | No | State/Province |
| Zip | String | No | ZIP/Postal code |
| Country | String | No | Country |
| VAT | String | No | VAT number |
| Phone | String | No | Phone number |
| PhoneVerified | Boolean | No | Phone verification status |
| Fax | String | No | Fax number |
| TimeZone | String | No | Timezone |
| Language | String | No | Language code |
| AccountStatus | String | No | Account status (admin only) |
| AvailableCredits | Integer | No | Available credits (admin only) |
| RelUserGroupID | Integer | No | User group ID (admin only) |
| ReputationLevel | String | No | Reputation level (admin only) |
| RateLimits | String | No | JSON string of rate limits |
| CustomEmailHeaders | String | No | Custom email headers |
| WhiteListedEmailAddresses | String | No | Whitelisted email addresses |
| Enable2FA | String | No | Set to 'true' to enable 2FA |
| 2FACode | String | Conditional | 2FA code (required when enabling 2FA) |
| Cancel2FA | String | No | Set to 'true' to disable 2FA |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.update",
    "SessionID": "your-session-id",
    "UserID": 123,
    "FirstName": "Jane",
    "LastName": "Smith"
  }'
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
  "ErrorCode": 2
}
```

```txt [Error Codes]
0: Success
1: Missing UserID parameter
2: User can only update their own account
3: PreviewMyEmail connection error
4: Invalid 2FA code
5: User not found
6: Email address or username already exists
```

:::

## Get Monthly User Snapshot

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key or User API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.snapshot`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Conditional | User ID (required if not logged in and EmailAddress not provided) |
| EmailAddress | String | Conditional | Email address (alternative to UserID) |
| Month | String | Yes | Month in YYYY-MM format (e.g., '2024-12') |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.snapshot",
    "SessionID": "your-session-id",
    "Month": "2024-12"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "CampaignsSent": 15,
  "EmailsSent": 5000,
  "Subscribers": 1500,
  "Lists": 8
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [3]
}
```

```txt [Error Codes]
0: Success
1: Missing EmailAddress parameter
2: Missing UserID parameter
3: Missing Month parameter
4: Invalid month format
5: User not found
```

:::

## Get User Statistics

<Badge type="info" text="POST" /> `/api/v1/user.stats`

::: tip API Usage Notes
- Authentication required: User API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.stats`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| StartDate | String | Yes | Start date in YYYY-MM-DD format |
| EndDate | String | Yes | End date in YYYY-MM-DD format |
| Aggregation | String | Yes | Aggregation type: 'daily', 'weekly', or 'monthly' |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.stats \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.stats",
    "SessionID": "your-session-id",
    "StartDate": "2024-01-01",
    "EndDate": "2024-12-31",
    "Aggregation": "monthly"
  }'
```

```json [Success Response]
{
  "TotalCampaigns": 150,
  "TotalEmails": 50000,
  "Stats": {
    "2024-01": {
      "Campaigns": 10,
      "Emails": 3000
    }
  }
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 1, "Message": "Missing StartDate parameter"}
  ]
}
```

```txt [Error Codes]
1: Missing StartDate parameter
2: Missing EndDate parameter
3: Missing Aggregation parameter
4: Invalid Aggregation value (must be 'daily', 'weekly', or 'monthly')
6: Statistics retrieval error
```

:::

## Switch to User Account

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.switch`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | Integer | Yes | User ID to switch to |
| PrivilegeType | String | No | Privilege type: 'Default' or 'Full' (default: 'Default') |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.switch",
    "SessionID": "your-admin-session-id",
    "UserID": 123,
    "PrivilegeType": "Full"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "new-session-id",
  "UserInfo": {
    "UserID": 123,
    "Username": "john.doe"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing UserID parameter
2: User not found
3: Invalid privilege type (must be 'Default' or 'Full')
```

:::

## Send Password Reminder

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.passwordremind`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| EmailAddress | String | Yes | User's email address |
| CustomResetLink | String | No | Base64 encoded custom reset link template |
| ReturnParams | Boolean | No | Set to true to return reset token and link |
| AdminAPIKey | String | No | Admin API key for custom email settings |
| ResetEmailSubject | String | No | Custom email subject (requires AdminAPIKey) |
| ResetEmailContent | String | No | Custom email content (requires AdminAPIKey) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.passwordremind",
    "SessionID": "your-session-id",
    "EmailAddress": "user@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "PasswordResetToken": "",
  "PasswordResetLink": ""
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing EmailAddress parameter
2: Invalid email address format
3: Email address not found (Note: For security, this returns success even if not found)
```

:::

## Reset User Password

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.passwordreset`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserID    | String | Yes | Password reset token (from passwordremind) |
| AdminAPIKey | String | No | Admin API key for custom password |
| NewPassword | String | No | Custom new password (requires AdminAPIKey) |
| DontSendNewPasswordEmail | String | No | Set to 'true' to skip email (requires AdminAPIKey) |
| ShowPassword | Boolean | No | Set to true to include password in email |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.passwordreset",
    "UserID": "reset-token-here"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "WoocommerceUserId": false
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
0: Success
1: Missing UserID parameter
2: Invalid reset token or user not found
```

:::

## Create API Key

<Badge type="info" text="POST" /> `/api/v1/user.apikey`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.apikey.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Note | String | Yes | Administrative note for the API key |
| BoundIPAddress | String | No | IP address to bind the key to |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.apikey \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.apikey.create",
    "SessionID": "your-session-id",
    "Note": "Production API key"
  }'
```

```json [Success Response]
{
  "APIKeyID": 5,
  "APIKey": {
    "APIKey": "1234-5678-9abc-def0",
    "Note": "Production API key",
    "BoundIPAddress": "",
    "CreatedAt": "2024-12-28 10:00:00"
  }
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 1, "Message": "Missing administrative note parameter"}
  ]
}
```

```txt [Error Codes]
1: Missing administrative note parameter
3: API key create process failed
4: New API key create process has failed
```

:::

## Delete API Key

<Badge type="info" text="POST" /> `/api/v1/user.apikey.delete`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.apikey.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| APIKeyID | Integer | Yes | API key ID to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/user.apikey.delete \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.apikey.delete",
    "SessionID": "your-session-id",
    "APIKeyID": 5
  }'
```

```json [Success Response]
{
  "Success": true
}
```

```json [Error Response]
{
  "Errors": [
    {"Code": 1, "Message": "Missing APIKeyID parameter"}
  ]
}
```

```txt [Error Codes]
1: Missing APIKeyID parameter
2: API key not found
```

:::

## List API Keys

<Badge type="info" text="GET" /> `/api/v1/user.apikeys`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `user.apikey.list`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/user.apikeys \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "user.apikey.list",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "APIKeys": [
    {
      "APIKeyID": 1,
      "APIKey": "1234-5678-9abc-def0",
      "Note": "Production API key",
      "BoundIPAddress": ""
    }
  ]
}
```

```json [Error Response]
{
  "Errors": []
}
```

```txt [Error Codes]
No specific error codes for this endpoint
```

:::

## Get Users List

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `users.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| RecordsPerRequest | Integer | No | Number of records per page (default: 25) |
| RecordsFrom | Integer | No | Starting record offset (default: 0) |
| OrderField | String | No | Field to order by |
| OrderType | String | No | Order direction: 'ASC' or 'DESC' |
| RelUserGroupID | Mixed | No | User group ID, array of IDs, or special value ('Online', 'Enabled', 'Disabled', 'Trusted', 'Untrusted') |
| RelUserCategoryID | Integer | No | User category ID (-1 for uncategorized) |
| SearchField | String | No | Field to search in |
| SearchKeyword | String | No | Search keyword |
| ReturnStats | Boolean | No | Set to true to include statistics |
| IncludeLimitUtilization | Boolean | No | Set to true to include limit utilization data |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.get",
    "SessionID": "your-session-id",
    "RecordsPerRequest": 25,
    "RecordsFrom": 0,
    "OrderField": "UserID",
    "OrderType": "DESC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Users": [
    {
      "UserID": 123,
      "Username": "john.doe",
      "EmailAddress": "john@example.com",
      "GroupInformation": {}
    }
  ],
  "TotalUsers": 150
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 0
}
```

```txt [Error Codes]
0: Success
```

:::

## Delete Users

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Note: Not available in demo mode
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `users.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Users | String | Yes | Comma-separated list of user IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.delete",
    "SessionID": "your-session-id",
    "Users": "123,124,125"
  }'
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
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing Users parameter
```

:::

## Get Users Status

<Badge type="info" text="GET" /> `/api/v1/users.status`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `users.status`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| Duration | Integer | No | Number of days to look back (1-90, default: 30) |

::: code-group

```bash [Example Request]
curl -X GET https://example.com/api/v1/users.status \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "users.status",
    "SessionID": "your-session-id",
    "Duration": 30
  }'
```

```json [Success Response]
{
  "Success": true,
  "Users": [
    {
      "UserID": 123,
      "Status": "active",
      "LastActivity": "2024-12-28 10:00:00"
    }
  ],
  "Summary": {
    "ActiveUsers": 50,
    "IdleUsers": 10
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 1,
  "ErrorText": "Failed to retrieve users status"
}
```

```txt [Error Codes]
0: Success
1: Failed to retrieve users status
```

:::

## Create User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.create`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| GroupName | String | Yes | Name of the user group |
| SubscriberAreaLogoutURL | String | Yes | Subscriber area logout URL |
| LimitSubscribers | Integer | Yes | Maximum number of subscribers |
| LimitLists | Integer | Yes | Maximum number of lists |
| LimitCampaignSendPerPeriod | Integer | Yes | Campaign send limit per period |
| LimitEmailSendPerPeriod | Integer | Yes | Email send limit per period |
| LimitEmailSendPerDay | Integer | Yes | Email send limit per day |
| RelThemeID | Integer | Yes | Theme ID |
| ForceUnsubscriptionLink | String | Yes | 'Enabled' or 'Disabled' |
| ForceRejectOptLink | String | Yes | 'Enabled' or 'Disabled' |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.create",
    "SessionID": "your-session-id",
    "GroupName": "Premium Users",
    "SubscriberAreaLogoutURL": "https://example.com/logout",
    "LimitSubscribers": 10000,
    "LimitLists": 50,
    "LimitCampaignSendPerPeriod": 100,
    "LimitEmailSendPerPeriod": 50000,
    "LimitEmailSendPerDay": 5000,
    "RelThemeID": 1,
    "ForceUnsubscriptionLink": "Enabled",
    "ForceRejectOptLink": "Enabled"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroupID": 5
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing GroupName parameter
2: Missing SubscriberAreaLogoutURL parameter
5: Missing LimitSubscribers parameter
6: Missing LimitLists parameter
7: Missing LimitCampaignSendPerPeriod parameter
8: Missing RelThemeID parameter
17: Missing ForceUnsubscriptionLink parameter
18: Missing ForceRejectOptLink parameter
19: Invalid theme ID
20: Missing LimitEmailSendPerPeriod parameter
22: Invalid send method
23: Invalid SMTP secure setting
24: Invalid SMTP auth setting
25: Email settings test failed
```

:::

## Update User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.update`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | Integer | Yes | User group ID to update |
| GroupName | String | Yes | Name of the user group |
| SubscriberAreaLogoutURL | String | Yes | Subscriber area logout URL |
| LimitSubscribers | Integer | Yes | Maximum number of subscribers |
| LimitLists | Integer | Yes | Maximum number of lists |
| LimitCampaignSendPerPeriod | Integer | Yes | Campaign send limit per period |
| LimitEmailSendPerPeriod | Integer | Yes | Email send limit per period |
| LimitEmailSendPerDay | Integer | Yes | Email send limit per day |
| RelThemeID | Integer | Yes | Theme ID |
| ForceUnsubscriptionLink | String | Yes | 'Enabled' or 'Disabled' |
| ForceRejectOptLink | String | Yes | 'Enabled' or 'Disabled' |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.update",
    "SessionID": "your-session-id",
    "UserGroupID": 5,
    "GroupName": "Premium Plus Users",
    "SubscriberAreaLogoutURL": "https://example.com/logout",
    "LimitSubscribers": 20000,
    "LimitLists": 100,
    "LimitCampaignSendPerPeriod": 200,
    "LimitEmailSendPerPeriod": 100000,
    "LimitEmailSendPerDay": 10000,
    "RelThemeID": 1,
    "ForceUnsubscriptionLink": "Enabled",
    "ForceRejectOptLink": "Enabled"
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
  "ErrorCode": [20]
}
```

```txt [Error Codes]
0: Success
1: Missing GroupName parameter
2: Missing SubscriberAreaLogoutURL parameter
5: Missing LimitSubscribers parameter
6: Missing LimitLists parameter
7: Missing LimitCampaignSendPerPeriod parameter
8: Missing RelThemeID parameter
17: Missing ForceUnsubscriptionLink parameter
18: Missing ForceRejectOptLink parameter
19: Invalid theme ID
20: Missing UserGroupID parameter
21: User group not found
22: Invalid send method
23: Invalid SMTP secure setting
24: Invalid SMTP auth setting
25: Email settings test failed
```

:::

## Get User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | Integer | Yes | User group ID to retrieve |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.get",
    "SessionID": "your-session-id",
    "UserGroupID": 5
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroup": {
    "UserGroupID": 5,
    "GroupName": "Premium Users",
    "LimitSubscribers": 10000,
    "LimitLists": 50
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1]
}
```

```txt [Error Codes]
0: Success
1: Missing UserGroupID parameter
2: User group not found
```

:::

## Delete User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- Note: Not available in demo mode
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.delete`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | String | Yes | Comma-separated list of user group IDs to delete |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.delete",
    "SessionID": "your-session-id",
    "UserGroupID": "5,6,7"
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

```txt [Error Codes]
0: Success
1: Missing UserGroupID parameter
4: Cannot delete the last user group
```

:::

## Duplicate User Group

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroup.duplicate`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |
| UserGroupID | Integer | Yes | User group ID to duplicate |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroup.duplicate",
    "SessionID": "your-session-id",
    "UserGroupID": 5
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroupID": 8
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2]
}
```

```txt [Error Codes]
0: Success
1: Missing UserGroupID parameter
2: User group not found
```

:::

## Get All User Groups

<Badge type="info" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `usergroups.get`          |
| SessionID | String | No       | Session ID obtained from login        |
| APIKey    | String | No       | API key for authentication            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "usergroups.get",
    "SessionID": "your-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "UserGroups": [
    {
      "UserGroupID": 1,
      "GroupName": "Standard Users",
      "LimitSubscribers": 1000,
      "DeliveryServerAssignments": {
        "Marketing": {
          "DeliveryServerID": 5,
          "DeliveryServerName": "Primary SMTP Server"
        },
        "Transactional": {
          "DeliveryServerID": 5,
          "DeliveryServerName": "Primary SMTP Server"
        },
        "AutoResponder": {
          "DeliveryServerID": 0,
          "DeliveryServerName": ""
        }
      }
    },
    {
      "UserGroupID": 2,
      "GroupName": "Premium Users",
      "LimitSubscribers": 10000,
      "DeliveryServerAssignments": {
        "Marketing": {
          "DeliveryServerID": 8,
          "DeliveryServerName": "High Volume SMTP"
        },
        "Transactional": {
          "DeliveryServerID": 8,
          "DeliveryServerName": "High Volume SMTP"
        },
        "AutoResponder": {
          "DeliveryServerID": 8,
          "DeliveryServerName": "High Volume SMTP"
        }
      }
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 0
}
```

```txt [Error Codes]
0: Success
```

:::

**Response Field Reference:**

| Field | Type | Description |
|-------|------|-------------|
| UserGroups | Array | List of all user groups |
| UserGroupID | Integer | Unique identifier for the user group |
| GroupName | String | Display name of the user group |
| DeliveryServerAssignments | Object | Delivery server assignments per channel type. Contains three keys: `Marketing`, `Transactional`, and `AutoResponder`. Each contains `DeliveryServerID` (0 if not assigned) and `DeliveryServerName` (empty string if not assigned) |

## Add Credits (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Order Payment (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Get Payment Periods (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Update Payment Periods (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Change Subscription Payment (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

## Upgrade Subscription (DEPRECATED)

::: danger DEPRECATED
This endpoint is deprecated and will be removed in a future version. There is no replacement endpoint.
:::

<Badge type="warning" text="POST" /> `/api.php`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
- **Status:** DEPRECATED - No replacement available
:::

