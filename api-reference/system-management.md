---
layout: doc
---

# System Management

## System Health Check

This API endpoint performs a health check of various system components including MySQL, Elasticsearch, RabbitMQ, Redis,
and Session status. Authorization is required via a Bearer token admin API key.

### <Badge type="info" text="GET" /> `/api/v1/system-health-check`

**Authorization:**

- Bearer token (Admin API key) is required for authentication.

**Success Response:**

A successful response is given if all system components are functioning correctly.

- HTTP Status Code: 200
- Body: A JSON object with the status of each system component.

**Error Response:**

- If authentication fails:
    - HTTP Status Code: 403
    - Body: A JSON object with error code `1` and a message indicating authentication failure.
- If any system check fails:
    - HTTP Status Code: 503
    - Body: A JSON object with the status of each system component, indicating which component(s) failed.

**System Components Checked:**

- **MySQL**: Checks if the MySQL database is accessible and if there's at least one admin user.
- **Elasticsearch**: Validates the accessibility and response of the Elasticsearch service.
- **RabbitMQ**: Tests the RabbitMQ service connection.
- **Redis**: Verifies the Redis service is operational.
- **Session**: Confirms if PHP sessions are active.

**Example Success Response:**

```json
{
  "Checks": {
    "MySQL": "OK",
    "Elasticsearch": "OK",
    "RabbitMQ": "OK",
    "Redis": "OK",
    "Session": "OK"
  }
}
```

**Example Error Response:**

```json
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Authentication failed. Invalid admin API key."
    }
  ]
}
```


