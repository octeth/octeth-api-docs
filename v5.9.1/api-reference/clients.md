---
layout: doc
---

# Client API Documentation

Client account management endpoints for creating and managing client sub-accounts with restricted access to specific lists and campaigns.

## Create a Client

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Client.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter           | Type   | Required | Description                              |
|---------------------|--------|----------|------------------------------------------|
| Command             | String | Yes      | API command: `client.create`             |
| SessionID           | String | No       | Session ID obtained from login           |
| APIKey              | String | No       | API key for authentication               |
| ClientName          | String | Yes      | Full name of the client                  |
| ClientUsername      | String | Yes      | Username for client login (must be unique)|
| ClientPassword      | String | Yes      | Password for client account              |
| ClientEmailAddress  | String | Yes      | Email address (must be unique)           |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.create",
    "SessionID": "your-session-id",
    "ClientName": "John Doe",
    "ClientUsername": "johndoe",
    "ClientPassword": "securepassword",
    "ClientEmailAddress": "john@example.com"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "ClientID": 123
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 5, 6, 7]
}
```

```txt [Error Codes]
0: Success
1: Missing client name
2: Missing client username
3: Missing client password
4: Missing client email address
5: Invalid email address format
6: Username already exists in the system
7: Email address already exists in the system
```

:::

## Update a Client

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: User API Key or Client API Key
- Required permissions: `Client.Update`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter            | Type    | Required | Description                                                  |
|----------------------|---------|----------|--------------------------------------------------------------|
| Command              | String  | Yes      | API command: `client.update`                                 |
| SessionID            | String  | No       | Session ID obtained from login                               |
| APIKey               | String  | No       | API key for authentication                                   |
| ClientID             | Integer | Yes      | ID of the client to update                                   |
| ClientName           | String  | Yes      | Full name of the client                                      |
| ClientUsername       | String  | Yes      | Username for client login                                    |
| ClientEmailAddress   | String  | Yes      | Email address                                                |
| ClientPassword       | String  | No       | New password (only if changing password)                     |
| ClientAccountStatus  | String  | No       | Account status. Possible values: `Enabled`, `Disabled`       |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.update",
    "SessionID": "your-session-id",
    "ClientID": 123,
    "ClientName": "John Doe Updated",
    "ClientUsername": "johndoe",
    "ClientEmailAddress": "john.doe@example.com",
    "ClientAccountStatus": "Enabled"
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
  "ErrorCode": [1, 5, 6, 7, 8, 9, 10]
}
```

```txt [Error Codes]
0: Success
1: Missing client name
2: Missing client username
4: Missing client email address
5: Invalid account status (must be "Enabled" or "Disabled")
6: Missing client ID
7: Invalid email address format
8: Client not found or access denied
9: Username already exists for another client
10: Email address already exists for another client
```

:::

## Get All Clients

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Clients.Get`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type   | Required | Description                                                                                  |
|------------|--------|----------|----------------------------------------------------------------------------------------------|
| Command    | String | Yes      | API command: `clients.get`                                                                   |
| SessionID  | String | No       | Session ID obtained from login                                                               |
| APIKey     | String | No       | API key for authentication                                                                   |
| OrderField | String | Yes      | Field to order by. Possible values: `ClientName`, `ClientID`, `ClientUsername`, `ClientEmailAddress`, `ClientAccountStatus` |
| OrderType  | String | Yes      | Sort direction. Possible values: `ASC`, `DESC`                                               |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "clients.get",
    "SessionID": "your-session-id",
    "OrderField": "ClientName",
    "OrderType": "ASC"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalClientCount": 5,
  "Clients": [
    {
      "ClientID": 123,
      "ClientName": "John Doe",
      "ClientUsername": "johndoe",
      "ClientEmailAddress": "john@example.com",
      "ClientAccountStatus": "Enabled",
      "RelOwnerUserID": 1
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing order field
2: Missing order type
```

:::

## Delete Clients

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Clients.Delete`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| Command   | String | Yes      | API command: `clients.delete`                    |
| SessionID | String | No       | Session ID obtained from login                   |
| APIKey    | String | No       | API key for authentication                       |
| Clients   | String | Yes      | Comma-separated list of client IDs to delete     |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "clients.delete",
    "SessionID": "your-session-id",
    "Clients": "123,456,789"
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
1: Client IDs are missing
```

:::

## Client Login

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| Command   | String | Yes      | API command: `client.login`    |
| Username  | String | Yes      | Client username                |
| Password  | String | Yes      | Client password                |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.login",
    "Username": "johndoe",
    "Password": "securepassword"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "SessionID": "abc123sessionid",
  "ClientInfo": {
    "ClientID": 123,
    "ClientName": "John Doe",
    "ClientUsername": "johndoe",
    "ClientEmailAddress": "john@example.com",
    "ClientAccountStatus": "Enabled"
  }
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
1: Missing username
2: Missing password
3: Invalid username or password
```

:::

## Client Password Reminder

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter        | Type   | Required | Description                                                    |
|------------------|--------|----------|----------------------------------------------------------------|
| Command          | String | Yes      | API command: `client.passwordremind`                           |
| EmailAddress     | String | Yes      | Client email address                                           |
| CustomResetLink  | String | No       | Custom password reset URL (Base64-encoded, URL-encoded with %s placeholder for reset token) |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.passwordremind",
    "EmailAddress": "john@example.com"
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
  "ErrorCode": [1, 2, 3]
}
```

```txt [Error Codes]
0: Success
1: Missing email address
2: Invalid email address format
3: Email address not found
```

:::

## Client Password Reset

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- No authentication required
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                                 |
|-----------|--------|----------|---------------------------------------------|
| Command   | String | Yes      | API command: `client.passwordreset`         |
| ClientID  | String | Yes      | MD5 hash of the client ID (from reset link)|

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.passwordreset",
    "ClientID": "abc123md5hashofclientid"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing client ID
2: Client not found
```

:::

## Assign Campaigns to Client

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Client.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                      |
|-------------|---------|----------|--------------------------------------------------|
| Command     | String  | Yes      | API command: `client.assigncampaigns`            |
| SessionID   | String  | No       | Session ID obtained from login                   |
| APIKey      | String  | No       | API key for authentication                       |
| ClientID    | Integer | Yes      | Client ID to assign campaigns to                 |
| CampaignIDs | String  | Yes      | Comma-separated list of campaign IDs to assign   |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.assigncampaigns",
    "SessionID": "your-session-id",
    "ClientID": 123,
    "CampaignIDs": "456,789,012"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing client ID
2: Missing campaign IDs
```

:::

## Assign Subscriber Lists to Client

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `Client.Create`
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter          | Type    | Required | Description                                           |
|--------------------|---------|----------|-------------------------------------------------------|
| Command            | String  | Yes      | API command: `client.assignsubscriberlists`           |
| SessionID          | String  | No       | Session ID obtained from login                        |
| APIKey             | String  | No       | API key for authentication                            |
| ClientID           | Integer | Yes      | Client ID to assign lists to                          |
| SubscriberListIDs  | String  | Yes      | Comma-separated list of subscriber list IDs to assign |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.assignsubscriberlists",
    "SessionID": "your-session-id",
    "ClientID": 123,
    "SubscriberListIDs": "10,20,30"
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
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing client ID
2: Missing subscriber list IDs
```

:::

## Get Client's Assigned Lists

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: Client API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `client.lists.get`       |
| SessionID | String | No       | Session ID obtained from client login |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.lists.get",
    "SessionID": "client-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalListCount": 3,
  "Lists": [
    {
      "ListID": 10,
      "Name": "Newsletter Subscribers",
      "RelOwnerUserID": 1
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

## Get a Client's Assigned List

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: Client API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type    | Required | Description                           |
|-----------|---------|----------|---------------------------------------|
| Command   | String  | Yes      | API command: `client.list.get`        |
| SessionID | String  | No       | Session ID obtained from client login |
| ListID    | Integer | Yes      | ID of the list to retrieve            |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.list.get",
    "SessionID": "client-session-id",
    "ListID": 10
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "List": {
    "ListID": 10,
    "Name": "Newsletter Subscribers",
    "RelOwnerUserID": 1,
    "Statistics": {}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing list ID
2: List not assigned to client or not found
```

:::

## Get Client's Assigned Campaigns

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: Client API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter | Type   | Required | Description                           |
|-----------|--------|----------|---------------------------------------|
| Command   | String | Yes      | API command: `client.campaigns.get`   |
| SessionID | String | No       | Session ID obtained from client login |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.campaigns.get",
    "SessionID": "client-session-id"
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "TotalCampaigns": 2,
  "Campaigns": [
    {
      "CampaignID": 456,
      "CampaignName": "Monthly Newsletter",
      "CampaignStatus": "Completed"
    }
  ]
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": []
}
```

```txt [Error Codes]
0: Success
```

:::

## Get a Client's Assigned Campaign

<Badge type="info" text="POST" /> `/api.php`

::: warning DEPRECATION WARNING
This endpoint is deprecated and will be removed in a future Octeth release. The client feature is being discontinued with no replacement or alternative API endpoint.
:::

::: tip API Usage Notes
- Authentication required: Client API Key
- Legacy endpoint access via `/api.php` only (no v1 REST alias configured)
:::

**Request Body Parameters:**

| Parameter  | Type    | Required | Description                           |
|------------|---------|----------|---------------------------------------|
| Command    | String  | Yes      | API command: `client.campaign.get`    |
| SessionID  | String  | No       | Session ID obtained from client login |
| CampaignID | Integer | Yes      | ID of the campaign to retrieve        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "client.campaign.get",
    "SessionID": "client-session-id",
    "CampaignID": 456
  }'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "Campaign": {
    "CampaignID": 456,
    "CampaignName": "Monthly Newsletter",
    "CampaignStatus": "Completed",
    "TotalSent": 5000,
    "TotalOpened": 2500,
    "TotalClicked": 750,
    "HardBounceRatio": "2",
    "SoftBounceRatio": "1",
    "Statistics": {}
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1, 2]
}
```

```txt [Error Codes]
0: Success
1: Missing campaign ID
2: Campaign not assigned to client or not found
```

:::
