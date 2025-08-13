---
layout: doc
---

# Getting Started

Start sending emails through the Octeth API in minutes.

## Get your API key

Navigate to **User Dashboard → Settings → API Keys** and create your API key.

```bash
# Your API key looks like this:
XXXX-XXXX-XXXX-XXXX
```

## Make your first API call

Create a subscriber list:

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=List.Create" \
  -F "APIKey=your-api-key" \
  -F "SubscriberListName=Newsletter"
```

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ListID": 1
}
```

## Add a subscriber

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Subscriber.Create" \
  -F "APIKey=your-api-key" \
  -F "ListID=1" \
  -F "EmailAddress=john@example.com" \
  -F "Status=Subscribed" \
  -F "SubscriptionDate=$(date +%Y-%m-%d)" \
  -F "OptInDate=$(date +%Y-%m-%d)" \
  -F "SubscriptionIP=192.168.1.1"
```

## Send your first campaign

### Step 1: Create an email

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Email.Create" \
  -F "APIKey=your-api-key"
# Returns: {"EmailID": 1}
```

### Step 2: Add content

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Email.Update" \
  -F "APIKey=your-api-key" \
  -F "EmailID=1" \
  -F "EmailName=Welcome Email" \
  -F "Subject=Welcome!" \
  -F "HTMLContent=<h1>Welcome to our newsletter!</h1>"
```

### Step 3: Create and send campaign

```bash
# Create campaign
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Campaign.Create" \
  -F "APIKey=your-api-key" \
  -F "CampaignName=Welcome Campaign"
# Returns: {"CampaignID": 1}

# Configure and send
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Campaign.Update" \
  -F "APIKey=your-api-key" \
  -F "CampaignID=1" \
  -F "RelEmailID=1" \
  -F "RecipientListsAndSegments=1:0" \
  -F "ScheduleType=Immediate" \
  -F "CampaignStatus=Ready"
```

## Common use cases

### Import subscribers

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Subscriber.Import" \
  -F "APIKey=your-api-key" \
  -F "ListID=1" \
  -F "ImportData=john@example.com,John,Doe
jane@example.com,Jane,Smith"
```

### Track subscriber activity

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Subscriber.Get.Activity" \
  -F "APIKey=your-api-key" \
  -F "ListID=1" \
  -F "SubscriberID=123" \
  -F 'FilterJSON=["opened","clicked"]'
```

### Schedule a campaign

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Campaign.Update" \
  -F "APIKey=your-api-key" \
  -F "CampaignID=1" \
  -F "ScheduleType=Future" \
  -F "SendDate=2024-02-01" \
  -F "SendTime=14:30" \
  -F "SendTimeZone=America/New_York"
```

### Enable auto-resend for non-openers

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Campaign.Update" \
  -F "APIKey=your-api-key" \
  -F "CampaignID=1" \
  -F "AutoResendEnabled=true" \
  -F "AutoResendWaitDays=3" \
  -F "AutoResendSubject=Don't miss out!"
```

### Setup A/B testing

```bash
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Campaign.Update" \
  -F "APIKey=your-api-key" \
  -F "CampaignID=1" \
  -F 'ABTesting={"variations":[{"emailid":1,"weight":50},{"emailid":2,"weight":50}]}'
```

## Quick reference

### Authentication

All API calls require authentication:

```bash
# User scope (lists, campaigns, subscribers)
-F "APIKey=your-api-key"

# Admin scope (users, system settings)  
-F "AdminAPIKey=your-admin-api-key"

# Session-based (temporary)
-F "SessionID=session-id-from-login"
```

### Request format

- **Endpoint**: `https://your-domain.com/api.php`
- **Method**: POST
- **Required**: `ResponseFormat=JSON` and `Command=Action.Name`

### Response format

```json
{
  "Success": true,
  "ErrorCode": 0,
  "ErrorText": "",
  "Data": {...}
}
```

## SDKs & libraries

### PHP

```php
<?php
class OctethAPI {
    private $apiUrl;
    private $apiKey;
    
    public function __construct($domain, $apiKey) {
        $this->apiUrl = "https://{$domain}/api.php";
        $this->apiKey = $apiKey;
    }
    
    public function call($command, $data = []) {
        $data['ResponseFormat'] = 'JSON';
        $data['Command'] = $command;
        $data['APIKey'] = $this->apiKey;
        
        $ch = curl_init($this->apiUrl);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
}

// Usage
$api = new OctethAPI('your-domain.com', 'your-api-key');
$list = $api->call('List.Create', ['SubscriberListName' => 'Newsletter']);
$subscriber = $api->call('Subscriber.Create', [
    'ListID' => $list['ListID'],
    'EmailAddress' => 'user@example.com',
    'Status' => 'Subscribed',
    'SubscriptionDate' => date('Y-m-d'),
    'OptInDate' => date('Y-m-d'),
    'SubscriptionIP' => '127.0.0.1'
]);
?>
```

### Python

```python
import requests

class OctethAPI:
    def __init__(self, domain, api_key):
        self.api_url = f"https://{domain}/api.php"
        self.api_key = api_key
    
    def call(self, command, data={}):
        data.update({
            'ResponseFormat': 'JSON',
            'Command': command,
            'APIKey': self.api_key
        })
        
        response = requests.post(self.api_url, data=data)
        return response.json()

# Usage
api = OctethAPI('your-domain.com', 'your-api-key')
list_result = api.call('List.Create', {'SubscriberListName': 'Newsletter'})
subscriber = api.call('Subscriber.Create', {
    'ListID': list_result['ListID'],
    'EmailAddress': 'user@example.com',
    'Status': 'Subscribed',
    'SubscriptionDate': '2024-01-15',
    'OptInDate': '2024-01-15',
    'SubscriptionIP': '127.0.0.1'
})
```

### Node.js

```javascript
const FormData = require('form-data');
const fetch = require('node-fetch');

class OctethAPI {
    constructor(domain, apiKey) {
        this.apiUrl = `https://${domain}/api.php`;
        this.apiKey = apiKey;
    }
    
    async call(command, data = {}) {
        const formData = new FormData();
        formData.append('ResponseFormat', 'JSON');
        formData.append('Command', command);
        formData.append('APIKey', this.apiKey);
        
        for (const [key, value] of Object.entries(data)) {
            formData.append(key, value);
        }
        
        const response = await fetch(this.apiUrl, {
            method: 'POST',
            body: formData
        });
        
        return response.json();
    }
}

// Usage
const api = new OctethAPI('your-domain.com', 'your-api-key');
const list = await api.call('List.Create', {SubscriberListName: 'Newsletter'});
const subscriber = await api.call('Subscriber.Create', {
    ListID: list.ListID,
    EmailAddress: 'user@example.com',
    Status: 'Subscribed',
    SubscriptionDate: '2024-01-15',
    OptInDate: '2024-01-15',
    SubscriptionIP: '127.0.0.1'
});
```

## Next steps

- **[API Reference →](/v5.7.x/api-reference/subscribers)**  
  Complete documentation for all endpoints

- **[Authentication →](/v5.7.x/authorization)**  
  API keys, sessions, and 2FA

- **[Error Handling →](/v5.7.x/error-handling)**  
  Error codes and troubleshooting

- **[Advanced Filtering →](/v5.7.x/api-reference/criteria-syntax)**  
  RulesJson syntax for segmentation

## Support

**Email**: support@octeth.com  
**GitHub**: [octeth/octeth-api-docs](https://github.com/octeth/octeth-api-docs)