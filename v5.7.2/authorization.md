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
  -F "Password=password" \
  -F "DisableCaptcha=true"

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
  -F "Password=password" \
  -F "DisableCaptcha=true"

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
  -F "tfacode=123456" \
  -F "DisableCaptcha=true"
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
  -F "Password=admin-password" \
  -F "DisableCaptcha=true"

# With admin API key (if ADMIN_API_KEY configured)
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Admin.Login" \
  -F "adminapikey=admin-api-key"
```

## Two-Factor Authentication

When 2FA is enabled, include the verification code:

```bash
# User login with 2FA
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "Username=user@example.com" \
  -F "Password=password" \
  -F "tfacode=123456" \
  -F "DisableCaptcha=true"

# Using recovery code (disables 2FA)
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=User.Login" \
  -F "Username=user@example.com" \
  -F "Password=password" \
  -F "tfarecoverycode=XXXX-XXXX-XXXX" \
  -F "DisableCaptcha=true"
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
| 5 | Invalid captcha |
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
| `disablecaptcha` | Skip captcha validation | `true` |

### API Call Parameters

Authentication parameters for API calls are **PascalCase**:

| Parameter | Scope | Description |
|-----------|-------|-------------|
| `APIKey` | User | User API key |
| `AdminAPIKey` | Admin | Admin API key |
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

- [API Reference →](/v5.7.2/api-reference/subscribers)
- [Error Handling →](/v5.7.2/error-handling)
- [Getting Started →](/v5.7.2/getting-started)