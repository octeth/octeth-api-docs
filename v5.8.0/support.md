---
layout: doc
---

# Support

Get help with the Octeth API from our support team and community resources.

## Get Help

### Email Support

**Primary**: [support@octeth.com](mailto:support@octeth.com)  
**Sales**: [hello@octeth.com](mailto:hello@octeth.com)

Response time: Within 24 hours on business days

### Help Portal

Browse our knowledge base for guides, tutorials, and FAQs:  
[https://help.octeth.com](https://help.octeth.com)

## Before You Contact Support

### 1. Check the Documentation

- [Getting Started Guide](/v5.7.2/getting-started) - Quick setup and first API calls
- [API Reference](/v5.7.2/api-reference/subscribers) - Complete endpoint documentation
- [Error Handling](/v5.7.2/error-handling) - Common error codes and solutions
- [Authorization](/v5.7.2/authorization) - Authentication methods and troubleshooting

### 2. Verify Your Setup

```bash
# Test your API key
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Lists.Get" \
  -F "APIKey=your-api-key"

# Check API version
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=System.Get.Version" \
  -F "APIKey=your-api-key"
```

### 3. Review Common Issues

**Authentication Errors**
- Verify API key is active in User Dashboard → Settings → API Keys
- Check you're using correct parameter: `APIKey` for user, `AdminAPIKey` for admin
- Ensure API key has necessary permissions for the operation

**Rate Limiting**
- Default: 1000 requests per hour
- Check response headers for rate limit status
- Implement exponential backoff for retries

**Data Format Issues**
- Dates must use `YYYY-MM-DD` format
- Email addresses must be valid format
- Custom fields use `CustomFields[ID]` syntax

## Reporting an Issue

### What to Include

To help us resolve your issue quickly, please provide:

#### 1. Environment Details
```
Octeth Version: 5.7.x
API Endpoint: https://your-domain.com/api.php
License Key: XXXX-XXXX-XXXX (last 4 digits)
```

#### 2. API Request
```bash
# Include the exact API call (redact sensitive data)
curl https://your-domain.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Your.Command" \
  -F "APIKey=REDACTED" \
  -F "Parameter=value"
```

#### 3. API Response
```json
{
  "Success": false,
  "ErrorCode": [error_codes],
  "ErrorText": ["error messages"]
}
```

#### 4. Expected vs Actual Behavior
- What you expected to happen
- What actually happened
- Any error messages or unexpected behavior

### Example Support Request

```markdown
Subject: API Error - Subscriber.Create returning error 18

Environment:
- Octeth Version: 5.7.2
- License ends with: XXXX-1234
- API URL: https://email.example.com/api.php

Issue:
Subscriber.Create endpoint returns error 18 (subscriber limit exceeded) 
even though dashboard shows 45,000/50,000 subscribers used.

API Request:
curl https://email.example.com/api.php \
  -F "ResponseFormat=JSON" \
  -F "Command=Subscriber.Create" \
  -F "APIKey=REDACTED" \
  -F "ListID=123" \
  -F "EmailAddress=test@example.com" \
  -F "Status=Subscribed"

Response:
{
  "Success": false,
  "ErrorCode": 18,
  "ErrorText": "Subscriber limit exceeded"
}

Expected: Subscriber should be created successfully
Actual: Error 18 returned despite available quota

Steps tried:
1. Verified subscriber count in dashboard
2. Checked user group limits
3. Tested with different lists
```

## Development Resources

### SDKs and Libraries

Official and community SDKs:

- **PHP SDK**: Coming soon
- **Python SDK**: Coming soon
- **Node.js SDK**: Coming soon
- **Community Libraries**: [GitHub Search](https://github.com/search?q=octeth+api)

### Testing Tools

**Postman Collection**
- Import our API collection for testing
- Download: Coming soon

**cURL Examples**
- All documentation includes cURL examples
- Copy and modify for your testing

### API Changelog

Stay updated with API changes:
- [What's New](https://help.octeth.com/whats-new)
- [Release Notes](https://help.octeth.com/release-notes)

## Service Status

### System Status

Check current system status and planned maintenance:
- Status Page: Coming soon
- Maintenance notifications sent via email

### API Limits

| Limit Type | Default | How to Increase |
|------------|---------|-----------------|
| Rate Limit | 1000/hour | Contact support |
| Payload Size | 10MB | Contact support |
| Batch Size | 1000 records | Use pagination |
| Concurrent Connections | 10 | Upgrade plan |

## Community

### Developer Forum

Join discussions with other developers:
- Forum: Coming soon
- Share integrations and best practices
- Get help from the community

### Feature Requests

Have an idea to improve the API?
- Submit via [GitHub Issues](https://github.com/octeth/octeth-api-docs/issues)
- Vote on existing requests
- Track implementation progress

## Enterprise Support

### Priority Support Plans

For mission-critical deployments:
- Dedicated support engineer
- Priority response times
- Direct phone support
- Custom SLA agreements

Contact [enterprise@octeth.com](mailto:enterprise@octeth.com) for details.

### Professional Services

Need help with implementation?
- API integration assistance
- Custom development
- Training and workshops
- Architecture review

## Legal & Compliance

### Terms of Service
[https://octeth.com/terms](https://octeth.com/terms)

### Privacy Policy
[https://octeth.com/privacy](https://octeth.com/privacy)

### Data Processing Agreement
Available upon request for enterprise customers

### Security
- Report security issues to [security@octeth.com](mailto:security@octeth.com)
- Do not post security vulnerabilities publicly
- Responsible disclosure program available

## Company Information

**50SAAS LLC**  
Email: [hello@octeth.com](mailto:hello@octeth.com)  
Website: [https://octeth.com](https://octeth.com)

---

*We're here to help you succeed with the Octeth API. Don't hesitate to reach out if you need assistance.*