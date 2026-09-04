---
layout: doc
---

# Authorization

The Octeth API supports two authentication methods and two permission scopes.

## Authentication Methods

### API Key (Recommended)

Permanent authentication for automated integrations.

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=List.Create" \
  -F "APIKey=your-api-key" \
  -F "SubscriberListName=Newsletter"
```

**Get your API key:**
- **User API Key**: User Dashboard → Settings → API Keys
- **Admin API Key**: Admin Area → Settings → Account → API tab

### Session ID

Temporary authentication for interactive applications.

```bash
# User login
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "Username=user@example.com" \
  -F "Password=password"

# Returns: {"SessionID": "abc123..."}

# Use session in subsequent calls
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=List.Create" \
  -F "SessionID=abc123..." \
  -F "SubscriberListName=Newsletter"
```

## Permission Scopes

### User Scope

Access to marketing operations.

| Parameter | Method | Access |
|-----------|--------|--------|
| `APIKey` | API Key | Lists, campaigns, subscribers, emails |
| `SessionID` | Session | Same as API Key |

**Login options:**

```bash
# With username/password
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "Username=user@example.com" \
  -F "Password=password"

# With API key (skip password)
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "apikey=your-api-key"

# With 2FA
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "Username=user@example.com" \
  -F "Password=password" \
  -F "tfacode=123456"
```

### Admin Scope

Access to system administration.

| Parameter | Method | Access |
|-----------|--------|--------|
| `AdminAPIKey` | API Key | Users, system settings, all user data |
| `SessionID` | Session | Same as API Key |

**Login options:**

```bash
# With username/password
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Admin.Login" \
  -F "Username=admin" \
  -F "Password=admin-password"

# With admin API key (if ADMIN_API_KEY configured)
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Admin.Login" \
  -F "adminapikey=admin-api-key"
```

### Sub-admin API keys and privilege enforcement

Sub-admin accounts (Settings, Sub Admin Accounts) carry a privilege list, the same one that decides which screens they can open in the admin area. Two things follow for the API:

- **Each sub-admin can hold its own API key.** It is issued, regenerated or revoked on the sub-admin edit screen and is passed as `AdminAPIKey` exactly like the master key. The master `ADMIN_API_KEY` from `.oempro_env` keeps its meaning: it always authenticates as the unrestricted master administrator. A wrong key of either kind returns `99998`.
- **Every admin command declares the privilege it needs.** When `ADMIN_API_ENFORCE_PRIVILEGES=true` in `.oempro_env`, a call made with a sub-admin key, a sub-admin `SessionID`, or a sub-admin username and password is checked against that list and answers `99999` (`Not enough privileges`) when the account lacks it. The master key and any admin account without restricted access are never affected. When the setting is off or absent, sub-admins are not restricted over the API (the behaviour of every release before v5.9.6). Fresh installs ship with it on; upgraded installs keep it off until an operator turns it on.

The privilege a command needs mirrors the screen that owns it: for example `Settings.Update` needs `Settings`, `DeliveryServer.Update` needs `DeliveryServers`, `UserGroup.Create` needs `UserGroups`, `Users.Delete` needs `User.Delete` and `User.Switch` needs `User.Impersonate`. Commands contributed by plugins need `PluginAccess`.

The response of `Admin.Login` never includes the sub-admin API key.

### Admin access to user-owned objects

Some user commands also accept admin authentication so an admin UI can read another account's data without impersonating it: `lists.get`, `campaigns.get`, `segments.get`, `emailgateway.getdomains`, `user.senderdomain.list`, `lists.stats`, `list.getactivityseries`, `subscribers.get` and `media.upload` (v5.9.6, #2775). Pass `Access=admin` together with `UserID`; the handler then runs exactly as it would for that user's own key. Without `Access=admin` the call is a user call, so nothing changes for existing integrations. These calls need the `User.Edit` privilege when privilege enforcement is on, and a restricted sub-admin can only name accounts inside its allowed user groups. Error codes reserved for this path: `5001` (UserID missing or invalid), `5002` (user not found), `5003` (user outside the admin's allowed groups).

## Two-Factor Authentication

When 2FA is enabled, include the verification code:

```bash
# User login with 2FA
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "Username=user@example.com" \
  -F "Password=password" \
  -F "tfacode=123456"

# Using recovery code (disables 2FA)
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "Username=user@example.com" \
  -F "Password=password" \
  -F "tfarecoverycode=XXXX-XXXX-XXXX"
```

## Response Format

### Successful login

```json
{
  "Success": true,
  "ErrorCode": 0,
  "SessionID": "abc123...",
  "UserInfo": {
    "UserID": 42,
    "Username": "user@example.com",
    "EmailAddress": "user@example.com",
    "FirstName": "John",
    "LastName": "Doe",
    "GroupInformation": {...}
  }
}
```

### Failed login

```json
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Invalid credentials"
}
```

## Common Error Codes

| Code | Description |
|------|-------------|
| 1 | Missing username |
| 2 | Missing password |
| 3 | Invalid credentials |
| 6 | Invalid 2FA code |
| 101 | 2FA required |

## Parameter Reference

### Login Parameters

All login parameters are **lowercase**:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `username` | Account username or email | `user@example.com` |
| `password` | Account password | `mypassword` |
| `apikey` | User API key (skip password) | `XXXX-XXXX-XXXX` |
| `adminapikey` | Admin API key | `XXXX-XXXX-XXXX` |
| `tfacode` | 2FA verification code | `123456` |
| `tfarecoverycode` | 2FA recovery code | `XXXX-XXXX-XXXX` |

### API Call Parameters

Authentication parameters for API calls are **PascalCase**:

| Parameter | Scope | Description |
|-----------|-------|-------------|
| `APIKey` | User | User API key |
| `AdminAPIKey` | Admin | Admin API key: the master `ADMIN_API_KEY` or a sub-admin's own key |
| `SessionID` | Both | Session from login |

## Best Practices

### Use API Keys for automation

```php
// Good: API key for automated tasks
$api->call('Campaign.Send', [
    'APIKey' => getenv('OCTETH_API_KEY'),
    'CampaignID' => 123
]);
```

### Use Sessions for user interfaces

```javascript
// Good: Session for web apps
const session = await login(username, password);
localStorage.setItem('sessionId', session.SessionID);

// Use session for subsequent calls
await api.call('Lists.Get', {
    SessionID: localStorage.getItem('sessionId')
});
```

### Handle session expiration

```python
def api_call(command, data):
    response = make_request(command, data)
    
    if response['ErrorCode'] == 401:  # Session expired
        # Re-authenticate
        session = login()
        data['SessionID'] = session['SessionID']
        response = make_request(command, data)
    
    return response
```

### Secure your credentials

```bash
# Store API keys in environment variables
export OCTETH_API_KEY="your-api-key"
export OCTETH_ADMIN_KEY="your-admin-key"

# Use in scripts
curl https://your-domain.com/api.php \
  -F "APIKey=$OCTETH_API_KEY" \
  ...
```

## Testing Your Setup

Quick test to verify authentication:

```bash
# Test with API key
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Lists.Get" \
  -F "APIKey=your-api-key"

# Test with session
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Lists.Get" \
  -F "SessionID=your-session-id"
```

Success response confirms authentication is working:

```json
{
  "Success": true,
  "ErrorCode": 0,
  "TotalLists": 5,
  "Lists": [...]
}
```

## Next Steps

- [API Reference →](/v5.8.3/api-reference/subscribers)
- [Error Handling →](/v5.8.3/error-handling)
- [Getting Started →](/v5.8.3/getting-started)