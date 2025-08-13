---
layout: doc
---

# Error Handling

The Octeth API returns detailed error information to help you debug issues quickly.

## Response Structure

All API responses follow this format:

```json
{
  "Success": false,
  "ErrorCode": 3,
  "ErrorText": "Invalid credentials"
}
```

Error codes can be single values or arrays:

```json
{
  "Success": false,
  "ErrorCode": [1, 2],
  "ErrorText": ["Missing username", "Missing password"]
}
```

## Common Error Codes

### Authentication Errors

| Code | Description | Fix |
|------|-------------|-----|
| 99998 | Invalid API key or session | Check your authentication credentials |
| 99999 | Session expired | Re-authenticate to get a new session |
| 3 | Invalid login credentials | Verify username and password |
| 5 | Invalid captcha | Pass `DisableCaptcha=true` or valid captcha |
| 6 | Invalid 2FA code | Check your authenticator app |
| 101 | 2FA required | Include `tfacode` parameter |

### Validation Errors

| Code | Description | Common Cause |
|------|-------------|--------------|
| 1 | Missing required field | Check API documentation for required parameters |
| 2 | Invalid field format | Ensure correct data type (string, number, etc.) |
| 10 | Invalid email address | Use valid email format |
| 11 | Invalid date format | Use YYYY-MM-DD format |

### Resource Errors

| Code | Description | Common Cause |
|------|-------------|--------------|
| 404 | Resource not found | Check if ID exists and belongs to your account |
| 403 | Permission denied | Ensure correct scope (User vs Admin) |
| 409 | Duplicate entry | Resource already exists (e.g., duplicate email) |
| 429 | Rate limit exceeded | Slow down API requests |

### Limit Errors

| Code | Description | Resolution |
|------|-------------|------------|
| 16 | User limit reached | Upgrade license or delete unused users |
| 18 | Subscriber limit reached | Upgrade plan or remove inactive subscribers |
| 3 | List limit exceeded | Delete unused lists or upgrade plan |

## Handling Errors in Code

### JavaScript/Node.js

```javascript
async function apiCall(command, data) {
  const response = await fetch('https://your-domain.com/api.php', {
    method: 'POST',
    body: new URLSearchParams({
      ResponseFormat: 'JSON',
      Command: command,
      APIKey: apiKey,
      ...data
    })
  });
  
  const result = await response.json();
  
  if (!result.Success) {
    // Handle error
    const errors = Array.isArray(result.ErrorCode) 
      ? result.ErrorCode 
      : [result.ErrorCode];
    
    errors.forEach((code, index) => {
      const message = Array.isArray(result.ErrorText)
        ? result.ErrorText[index]
        : result.ErrorText;
      
      console.error(`Error ${code}: ${message || getErrorMessage(code)}`);
    });
    
    throw new Error(`API Error: ${errors.join(', ')}`);
  }
  
  return result;
}

// Usage with error handling
try {
  const list = await apiCall('List.Create', {
    SubscriberListName: 'Newsletter'
  });
  console.log('List created:', list.ListID);
} catch (error) {
  console.error('Failed to create list:', error.message);
}
```

### PHP

```php
<?php
function apiCall($command, $data = []) {
    $data['ResponseFormat'] = 'JSON';
    $data['Command'] = $command;
    $data['APIKey'] = $_ENV['OCTETH_API_KEY'];
    
    $ch = curl_init('https://your-domain.com/api.php');
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $result = json_decode($response, true);
    
    if (!$result['Success']) {
        $errors = is_array($result['ErrorCode']) 
            ? $result['ErrorCode'] 
            : [$result['ErrorCode']];
        
        $errorMessages = [];
        foreach ($errors as $index => $code) {
            $message = is_array($result['ErrorText']) 
                ? $result['ErrorText'][$index] 
                : $result['ErrorText'] ?? '';
            
            $errorMessages[] = "Error $code: $message";
        }
        
        throw new Exception(implode(', ', $errorMessages));
    }
    
    return $result;
}

// Usage
try {
    $list = apiCall('List.Create', [
        'SubscriberListName' => 'Newsletter'
    ]);
    echo "List created: " . $list['ListID'];
} catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
}
?>
```

### Python

```python
import requests
from typing import Dict, Any

class OctethAPIError(Exception):
    def __init__(self, errors, messages=None):
        self.errors = errors if isinstance(errors, list) else [errors]
        self.messages = messages if isinstance(messages, list) else [messages]
        super().__init__(self.format_message())
    
    def format_message(self):
        if self.messages and self.messages[0]:
            return ', '.join(f"Error {e}: {m}" 
                           for e, m in zip(self.errors, self.messages))
        return f"API Errors: {', '.join(map(str, self.errors))}"

def api_call(command: str, data: Dict[str, Any] = {}) -> Dict:
    payload = {
        'ResponseFormat': 'JSON',
        'Command': command,
        'APIKey': os.getenv('OCTETH_API_KEY'),
        **data
    }
    
    response = requests.post('https://your-domain.com/api.php', data=payload)
    result = response.json()
    
    if not result.get('Success'):
        raise OctethAPIError(
            result.get('ErrorCode'),
            result.get('ErrorText')
        )
    
    return result

# Usage
try:
    list_data = api_call('List.Create', {
        'SubscriberListName': 'Newsletter'
    })
    print(f"List created: {list_data['ListID']}")
except OctethAPIError as e:
    print(f"Failed: {e}")
```

## Error Recovery Strategies

### Retry with exponential backoff

```javascript
async function apiCallWithRetry(command, data, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall(command, data);
    } catch (error) {
      lastError = error;
      
      // Check if error is retryable
      if (error.message.includes('99999') || // Session expired
          error.message.includes('429')) {    // Rate limited
        
        // Exponential backoff
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Re-authenticate if session expired
        if (error.message.includes('99999')) {
          await refreshSession();
        }
      } else {
        // Non-retryable error
        throw error;
      }
    }
  }
  
  throw lastError;
}
```

### Handle specific errors

```php
function createSubscriber($email, $listId) {
    try {
        return apiCall('Subscriber.Create', [
            'EmailAddress' => $email,
            'ListID' => $listId,
            'Status' => 'Subscribed',
            'SubscriptionDate' => date('Y-m-d'),
            'OptInDate' => date('Y-m-d'),
            'SubscriptionIP' => $_SERVER['REMOTE_ADDR']
        ]);
    } catch (Exception $e) {
        if (strpos($e->getMessage(), 'Error 20') !== false) {
            // Duplicate subscriber - update instead
            return apiCall('Subscriber.Update', [
                'EmailAddress' => $email,
                'ListID' => $listId,
                'Status' => 'Subscribed'
            ]);
        } elseif (strpos($e->getMessage(), 'Error 18') !== false) {
            // Subscriber limit reached
            throw new Exception('Subscriber limit reached. Please upgrade your plan.');
        } else {
            throw $e;
        }
    }
}
```

## Endpoint-Specific Errors

### User.Login

| Code | Description |
|------|-------------|
| 1 | Missing username |
| 2 | Missing password |
| 3 | Invalid credentials |
| 5 | Invalid captcha |
| 6 | Invalid 2FA code |

### List.Create

| Code | Description |
|------|-------------|
| 1 | Missing list name |
| 3 | List limit exceeded |

### Subscriber.Create

| Code | Description |
|------|-------------|
| 1 | Missing ListID |
| 2 | Missing EmailAddress |
| 3 | Invalid email format |
| 4 | Invalid ListID |
| 18 | Subscriber limit exceeded |
| 20 | Duplicate email address |

### Campaign.Create

| Code | Description |
|------|-------------|
| 1 | Missing campaign name |

### Campaign.Update

| Code | Description |
|------|-------------|
| 1 | Missing CampaignID |
| 2 | Campaign not found |
| 3 | Invalid status |
| 4 | Invalid EmailID |
| 5 | Invalid schedule type |
| 6 | Missing send date |
| 7 | Missing send time |
| 14 | Invalid auto-resend days |
| 15 | Missing auto-resend subject |

### Email.Create

No specific error codes (returns empty EmailID on success).

### Email.Update

| Code | Description |
|------|-------------|
| 1 | Missing EmailID |
| 2 | Email not found |

## Debugging Tips

### Enable verbose logging

```bash
# Log full request and response
curl -v https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=List.Create" \
  -F "APIKey=your-api-key" \
  -F "SubscriberListName=Test"
```

### Check required parameters

```javascript
// Helper to validate required fields
function validateRequired(data, required) {
  const missing = required.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

// Use before API call
validateRequired(data, ['EmailAddress', 'ListID', 'Status']);
```

### Log API errors

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def api_call_with_logging(command, data):
    logger.debug(f"API Call: {command} with {data}")
    
    try:
        result = api_call(command, data)
        logger.debug(f"Success: {result}")
        return result
    except OctethAPIError as e:
        logger.error(f"API Error in {command}: {e}")
        logger.debug(f"Request data: {data}")
        raise
```

## Best Practices

1. **Always check Success field** - Even with HTTP 200, check `Success: false`
2. **Handle arrays and single values** - ErrorCode can be either
3. **Log errors with context** - Include command and parameters
4. **Implement retry logic** - For transient errors (rate limits, timeouts)
5. **Map error codes to user messages** - Don't expose raw error codes to users
6. **Use appropriate authentication scope** - User vs Admin based on operation
7. **Validate before sending** - Check required fields client-side

## Next Steps

- [Getting Started →](/v5.7.x/getting-started)
- [Authorization →](/v5.7.x/authorization)
- [API Reference →](/v5.7.x/api-reference/subscribers)