---
layout: doc
---

# System API Documentation

System health monitoring and diagnostics endpoints for infrastructure components.

## Check System Health

<Badge type="info" text="GET" /> `/api/v1/system-health-check`

::: tip API Usage Notes
- Authentication required: Admin API Key (via Bearer token or query parameter)
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Parameters:**

| Parameter | Type   | Required | Description                                                    |
|-----------|--------|----------|----------------------------------------------------------------|
| Command   | String | Yes      | API command: `system.health.check` (only for legacy endpoint)  |
| AdminAPIKey | String | No     | Admin API key for authentication (alternative to Bearer token) |

**Authentication Methods:**

This endpoint supports two authentication methods:

1. **Bearer Token (Recommended):** Include the Admin API Key in the Authorization header:
   ```
   Authorization: Bearer YOUR_ADMIN_API_KEY
   ```

2. **Query Parameter:** Pass the Admin API Key as a query parameter:
   ```
   ?adminapikey=YOUR_ADMIN_API_KEY
   ```

::: code-group

```bash [Example Request (Bearer Token)]
curl -X GET https://example.com/api/v1/system-health-check \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY"
```

```bash [Example Request (Query Parameter)]
curl -X GET "https://example.com/api/v1/system-health-check?adminapikey=YOUR_ADMIN_API_KEY"
```

```bash [Example Request (Legacy)]
curl -X GET "https://example.com/api.php?Command=system.health.check&adminapikey=YOUR_ADMIN_API_KEY"
```

```json [Success Response (HTTP 200)]
{
  "Checks": {
    "MySQL": "OK",
    "ClickHouse": "OK",
    "Elasticsearch": "OK",
    "RabbitMQ": "OK",
    "Redis": "OK",
    "Session": "OK",
    "SystemContainer": "OK",
    "Vector": "OK",
    "Haproxy": "OK",
    "Cron": "OK",
    "Supervisor": "OK",
    "SendEngine": "OK",
    "AdminFrontend": "OK",
    "UserFrontend": "OK",
    "FilePermissions": "OK"
  }
}
```

```json [Partial Failure Response (HTTP 503)]
{
  "Checks": {
    "MySQL": "OK",
    "ClickHouse": "OK",
    "Elasticsearch": "Connection refused",
    "RabbitMQ": "OK",
    "Redis": "[111] Connection refused",
    "Session": "OK",
    "SystemContainer": "OK",
    "Vector": "Timeout after 3 seconds",
    "Haproxy": "OK",
    "Cron": "App container cron not executing (last run: 120 seconds ago)",
    "Supervisor": "# campaign_delivery_worker: STOPPED # journey_worker: FATAL ",
    "SendEngine": "No send engine containers running",
    "AdminFrontend": "OK",
    "UserFrontend": "Backend user login form action is not found",
    "FilePermissions": "logs/campaign_delivery.log: expected 0777, 0666 or 0644, found 0640"
  }
}
```

```json [Authentication Error (HTTP 403)]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Authentication failed. Invalid admin API key."
    }
  ]
}
```

```txt [Error Codes]
0: Success - All health checks passed
1: Authentication failed. Invalid admin API key.

HTTP Status Codes:
200: All health checks passed
403: Authentication failed
503: One or more health checks failed (see Checks object for details)
```

:::

**Health Check Components:**

The endpoint performs comprehensive health checks on the following components:

- **MySQL**: Database connectivity and admin user existence
- **ClickHouse**: Analytics database connectivity
- **Elasticsearch**: Search engine connectivity and indices
- **RabbitMQ**: Message queue connectivity
- **Redis**: Cache server connectivity
- **Session**: PHP session functionality
- **SystemContainer**: Laravel backend container health (`/system/ping`)
- **Vector**: Log aggregation service health
- **Haproxy**: Load balancer connectivity
- **Cron**: App and system container cron job execution (heartbeat checks)
- **Supervisor**: Process manager status for all managed processes
- **SendEngine**: Send engine container discovery and supervisor process status
- **AdminFrontend**: Admin login page accessibility and form validation
- **UserFrontend**: User login page accessibility and form validation
- **FilePermissions**: Directory and log file permissions (expects 0777 for directories, 0777/0666/0644 for log files)

**Response Details:**

- Each check returns `"OK"` if successful
- Failed checks return detailed error messages explaining the failure
- HTTP status code 200 indicates all checks passed
- HTTP status code 503 indicates one or more checks failed (response still includes all check results)
- The Cron check monitors heartbeat files updated every minute; considers cron failed if > 90 seconds since last update
- The Supervisor check reports processes not in `RUNNING` state with format: `# process_name: STATE`
- The SendEngine check discovers containers dynamically using Docker Compose project prefix detection

## Process PowerMTA Log File

<Badge type="info" text="POST" /> `/api/v1/process_pmta_log_file`

::: tip API Usage Notes
- Authentication required: Admin API Key (via Bearer token)
- Rate limit: 100 requests per 60 seconds
- This endpoint is designed for PowerMTA integration to process email delivery logs
- Accepts batch processing of email events (delivery, bounce, etc.)
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                                                     |
|-------------|--------|----------|-----------------------------------------------------------------|
| AdminAPIKey | String | Yes      | Admin API key for authentication (via Bearer token)             |
| LogData     | Array  | Yes      | Array of PowerMTA log entries (JSON format in POST body)        |

**PowerMTA Log Entry Format:**

Each log entry in the array should contain PowerMTA event data following the PowerMTA log format specification.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/process_pmta_log_file \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_API_KEY" \
  -d '[
    {
      "type": "delivery",
      "timeLogged": "2025-01-15T10:30:00Z",
      "recipient": "user@example.com",
      "messageId": "550e8400-e29b-41d4-a716-446655440000"
    },
    {
      "type": "bounce",
      "timeLogged": "2025-01-15T10:31:00Z",
      "recipient": "invalid@example.com",
      "bounceType": "hard"
    }
  ]'
```

```json [Success Response]
{
  "Success": true,
  "ProcessedCount": 2,
  "ErrorCount": 0
}
```

```json [Error Response - Auth]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Invalid AdminAPIKey"
    }
  ]
}
```

```json [Error Response - Invalid Data]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Invalid or empty log data"
    }
  ]
}
```

```txt [HTTP Status Codes]
200: Success - Log data processed successfully
400: Bad Request - Invalid or empty log data
401: Unauthorized - Invalid Admin API Key
429: Too many requests - Rate limit exceeded
```

```txt [Error Codes]
1: Invalid AdminAPIKey
2: Invalid or empty log data
```

:::

**Processing Behavior:**

- Accepts both JSON and form-encoded POST data
- Processes events in batch for improved performance
- Returns processing results with success/error counts
- Failed events within a batch do not cause the entire batch to fail
