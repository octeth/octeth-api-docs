---
layout: doc
---

# Administrators

## Administrator Login

::: info
This API end-point can be used to create a SessionID for admin only API end-point authorizations.
:::

This API endpoint, `Admin.Login`, is primarily used for logging in an administrator into the system. It validates the
provided credentials, which include the username and password, and optionally a two-factor authentication code if 2FA is
enabled for the account.

Upon successful validation, it returns a session ID which can be used for subsequent API calls. This session ID is
crucial as it maintains the state of the logged-in user for further interactions with the API.

Additionally, this endpoint provides the option to disable CAPTCHA during the login process. This can be useful in
scenarios where the API is being used to build a separate top UI layer and CAPTCHA might not be necessary or feasible.

In case of any errors during the login process, such as missing or incorrect credentials, missing or invalid CAPTCHA, or
incorrect 2FA code, the API endpoint will return specific error codes to help identify the issue.

### <Badge type="info" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter       | Description                                                                                                             |          |
|-----------------|-------------------------------------------------------------------------------------------------------------------------|----------|
| Command         | `Admin.Login`                                                                                                           | Required | 
| Username        | Admin username                                                                                                          | Required | 
| Password        | Admin password                                                                                                          | Required | 
| TFACode         | Generated two factor authentication code. This parameter is required if the user has enabled 2FA for the admin account. | Optional |
| DisableCaptcha  | Disables the captcha verification for API login. Available options: `true`, `false`                                     | Optional |
| TFARecoveryCode | Enter the TFA recovery code to reset and disable TFA setup.                                                             | Optional |

**Success Response:**

```json
{
  "Success": true,
  "ErrorCode": 0,
  "SessionID": "**********",
  "AdminInfo": {
    "AdminID": "1",
    "Name": "Admin Name",
    "EmailAddress": "test@test.com",
    "Username": "admin",
    "Password": "*****",
    "2FA_SecretKey": "*****",
    "2FA_RecoveryKey": "*****",
    "2FA_Enabled": "No",
    "Options": []
  }
}
```

**Error Response:**

- `1`: Missing username
- `2`: Missing password
- `3`: Invalid login credentials
- `4`: Missing catpcha
- `5`: Invalid captcha
- `6`: Invalid 2FA code

## Update Administrator Account

This API end-point is designed to update an administrator account on the system. It can be used to validate user account
credentials, especially when building a separate top UI layer, or for gathering a session ID for your next user API
end-point execution.

### <Badge type="tip" text="POST" /> `/api.php`

**Request Parameters:**

| Parameter    | Description                                        |          |
|--------------|----------------------------------------------------|----------|
| Command      | `Admin.Update`                                     | Required | 
| AdminID      | The corresponding ID of the admin to update        | Required |
| Name         | The new name of the administrator account          | Required |
| Username     | The new username of the administrator account      | Required |
| Password     | The new password of the administrator account      | Required |
| EmailAddress | The new email address of the administrator account | Required |

**Success Response:**

```json
{
  "Command": "Admin.Update",
  "Name": "Admin Name",
  "Username": "admin",
  "EmailAddress": "test@test.com",
  "Password": "****",
  "AdminID": 1
}
```

**Error Response:**

```json
{
  "Success": true,
  "ErrorCode": 0
}
```

- `1`: Missing username
- `2`: Missing password
- `3`: Invalid login credentials
- `4`: Missing catpcha
- `5`: Invalid catpcha
- `6`: Invalid 2FA code