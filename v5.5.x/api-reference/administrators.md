---
layout: doc
---

# Administrators

## Admin Login

<Badge type="info" text="POST" /> `/api.php`

This endpoint is used for administrator authentication. It validates the provided credentials and, if successful,
initiates a new admin session.

**Request Body Parameters:**

| Parameter      | Description                                      | Required?   |
|----------------|--------------------------------------------------|-------------|
| Command        | Admin.Login                                      | Yes         |
| Username       | The username of the admin attempting to log in   | Yes         |
| Password       | The password for the admin account               | Yes         |
| Captcha        | The captcha code to verify if captcha is enabled | Conditional |
| DisableCaptcha | Set to true to disable captcha verification      | No          |
| AdminApiKey    | The API key for admin verification               | No          |
| Disable2FA     | Set to true to disable two-factor authentication | No          |
| TfaCode        | The two-factor authentication code               | Conditional |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'Command=Admin.Login' \
  -d 'Username=admin' \
  -d 'Password=123456'
```

```json [Success Response]
{
  "Success": true,
  "ErrorCode": 0,
  "SessionID": "newSessionId",
  "AdminInfo": {
    "AdminID": "1",
    "Username": "admin"
  }
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [
    3
  ]
}
```

```txt [Error Codes]
1: Missing username
2: Missing password
3: Invalid username or password
4: Missing captcha
5: Invalid captcha
101: Invalid two-factor authentication code
```

:::

## Update Administrator Details

<Badge type="info" text="POST" /> `/api.php`

This endpoint allows for updating the details of an existing administrator account. It requires the admin to be
authenticated and to own the account that is being updated.

**Request Body Parameters:**

| Parameter    | Description                                                          | Required? |
|--------------|----------------------------------------------------------------------|-----------|
| SessionID    | The ID of the user's current session                                 | Yes       |
| APIKey       | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| Command      | Admin.Update                                                         | Yes       |
| AdminID      | The unique identifier for the admin account                          | Yes       |
| Name         | The full name of the admin                                           | Yes       |
| Username     | The username for the admin account                                   | Yes       |
| EmailAddress | The email address associated with the admin account                  | Yes       |
| Password     | The new password for the admin account (optional)                    | No        |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api.php \
  -d 'SessionID=exampleSessionId' \
  -d 'APIKey=exampleApiKey' \
  -d 'Command=Admin.Update' \
  -d 'AdminID=1' \
  -d 'Name=John Doe' \
  -d 'Username=johndoe' \
  -d 'EmailAddress=john.doe@example.com' \
  -d 'Password=newpassword123'
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
    7
  ]
}
```

```txt [Error Codes]
1: Missing name
2: Missing username
4: Missing email address
6: Invalid admin ID
7: Invalid email address format
8: Admin account not owned by the logged-in admin
```

:::
