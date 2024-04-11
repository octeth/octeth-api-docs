---
layout: doc
---

# System Management

## System Health Check

<Badge type="info" text="POST" /> `/api/v1/system-health-check`

This API end-point is used to perform a health check on various system components such as MySQL, Elasticsearch, RabbitMQ, Redis, and Session management. It requires an admin API key for authorization.

**Request Body Parameters:**

| Parameter   | Description                                                          | Required? |
|-------------|----------------------------------------------------------------------|-----------|
| SessionID   | The ID of the user's current session                                 | Yes       |
| APIKey      | The user's API key. Either `SessionID` or `APIKey` must be provided. | Yes       |
| AdminAPIKey | The admin API key for authorization                                  | Yes       |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/system-health-check" \
     -H "Authorization: Bearer {Admin API Key}" 
```

```json [Success Response]
# 200 OK
{
"Checks": {
"MySQL": "OK",
"Elasticsearch": "OK",
"RabbitMQ": "OK",
"Redis": "OK",
"Session": "OK",
"SystemContainer": "OK",
"AdminFrontend": "OK",
"UserFrontend": "OK"
}
```

```json [Error Response]
# 503 Service Unavailable
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Authentication failed. Invalid admin API key."
    },
    {
      "Code": 2,
      "Message": "There is no registered admin user."
    },
    {
      "Code": 3,
      "Message": "Elasticsearch connection failed."
    },
    {
      "Code": 4,
      "Message": "RabbitMQ connection failed."
    },
    {
      "Code": 5,
      "Message": "Redis connection failed."
    },
    {
      "Code": 6,
      "Message": "Session is not active."
    }
  ]
}
```

```txt [Error Codes]
1: Authentication failed. Invalid admin API key.
2: There is no registered admin user.
3: Elasticsearch connection failed.
4: RabbitMQ connection failed.
5: Redis connection failed.
6: Session is not active.
```
:::

**HTTP Response and Error Codes:**

| HTTP Response Code | Error Code | Description                      |
|--------------------|------------|----------------------------------|
| 403                | -          | Authentication failed            |
| 503                | 1-6        | At least one system check failed |
