---
layout: doc
---

# Setup and Alerts API Documentation

Install readiness and operator alert endpoints. The setup report tells an operator, or the operator's AI assistant, what is configured on the install and what is still missing, in dependency order. The alert endpoints show the threshold rules an operator set and the alerts Octeth raised on its own. Alert rules are managed on the server with `./cli/octeth.sh alerts:*`.

All three endpoints are available to an operator AI assistant connected through the built-in MCP connector (`get_setup_status`, `list_alerts`, `get_alert`) with the `admin:read` scope. An assistant can never read or change `.oempro_env` or restart a container through the connector: those changes run only on the server with `./cli/octeth.sh env:plan`, `env:apply` and `env:rollback`.

## Get the Setup Readiness Report

<Badge type="info" text="POST" /> `/api/v1/admin.setup.status`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required permissions: `Settings`
- Rate limit: 60 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns the readiness checks in dependency order: `license`, `delivery_server`, `delivery_server_test`, `sending_dns`, `reverse_dns`, `app_tls`, `default_user_group`, `bounce_fbl`, `workers`, `cron`, `connector`, `alerts`. Each check has a `Status`, whether it is `Required`, the `Evidence` it was judged on and the `NextAction` that would fix it. `Ready` is false while a required check is `missing` or `failing`, and `NextStep` is the first check that is not `ok`.

The report reads stored state only and never contacts an external host. The SPF, DKIM and DMARC results are the ones the last delivery server verification stored. A check that cannot be measured (for example the reverse DNS of the sending IPs, which Octeth does not know) is `unknown`, never `ok`.

**Request Body Parameters:**

| Parameter   | Type   | Required | Description                         |
|-------------|--------|----------|-------------------------------------|
| Command     | String | Yes      | API command: `admin.setup.status`   |
| SessionID   | String | No       | Session ID obtained from login      |
| AdminAPIKey | String | No       | Admin API key for authentication    |

Check statuses. Possible values: `ok`, `missing`, `failing`, `warning`, `unknown`.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.setup.status \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.setup.status",
    "AdminAPIKey": "your-admin-api-key"
  }'
```

```json [Success Response]
{
  "Success": true,
  "Ready": false,
  "NextStep": {
    "Key": "delivery_server_test",
    "Title": "Delivery server test connection",
    "NextAction": "Test a delivery server (test_delivery_server sends one message to your own admin address)."
  },
  "Checks": [
    {
      "Key": "license",
      "Title": "License",
      "Status": "ok",
      "Required": true,
      "Evidence": "A valid license key is installed.",
      "NextAction": ""
    },
    {
      "Key": "delivery_server_test",
      "Title": "Delivery server test connection",
      "Status": "missing",
      "Required": true,
      "Evidence": "No delivery server has been tested yet: Relay.",
      "NextAction": "Test a delivery server (test_delivery_server sends one message to your own admin address)."
    }
  ],
  "CheckedAt": "2026-10-15 12:00:00"
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": 99999
}
```

```txt [Error Codes]
0: Success
99998: Authentication failed
99999: The admin account lacks the Settings privilege
```

:::

## Get Operator Alert Rules and Recent Alerts

<Badge type="info" text="POST" /> `/api/v1/admin.alerts.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required permissions: `Settings`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns every alert rule and the most recent alerts. Octeth checks enabled rules every five minutes from cron, with no AI agent involved, and sends an email or a webhook when a measured value is above the rule's threshold and the rule's cooldown has passed. A rate needs at least 200 messages in its window before it can fire, and a value that cannot be measured never fires. A webhook destination is returned as its scheme and host only, because the URL can carry a token (a Telegram bot URL does).

**Request Body Parameters:**

| Parameter   | Type    | Required | Description                                          |
|-------------|---------|----------|------------------------------------------------------|
| Command     | String  | Yes      | API command: `admin.alerts.get`                      |
| SessionID   | String  | No       | Session ID obtained from login                       |
| AdminAPIKey | String  | No       | Admin API key for authentication                     |
| Limit       | Integer | No       | Recent alerts to return, 1 to 100. Default 20.       |

Rule metrics. Possible values: `complaint_rate`, `bounce_rate`, `delivery_server_failure_rate` (percent over the window), `queue_depth` (messages), `worker_down` (workers), `disk_usage` (percent). For `complaint_rate` and `bounce_rate`, email gateway messages are counted over the rule's window. Campaign and autoresponder sends are stored per UTC day, so their bounces and complaints are counted from the start of the same UTC day, and each rate compares events with the sends of the same period.

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.alerts.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.alerts.get",
    "AdminAPIKey": "your-admin-api-key",
    "Limit": 5
  }'
```

```json [Success Response]
{
  "Success": true,
  "Rules": [
    {
      "AlertRuleID": 1,
      "Metric": "complaint_rate",
      "Label": "Complaint rate",
      "Unit": "%",
      "Threshold": 0.1,
      "WindowMinutes": 60,
      "CooldownMinutes": 60,
      "Channel": "webhook",
      "Destination": "https://api.telegram.org/...",
      "Enabled": true,
      "Note": "",
      "LastCheckedAt": "2026-10-15 12:05:00",
      "LastValue": 0.02,
      "LastFiredAt": null
    }
  ],
  "RecentAlerts": [
    {
      "AlertEventID": 9,
      "AlertRuleID": 1,
      "Metric": "complaint_rate",
      "Value": 0.4,
      "Threshold": 0.1,
      "Channel": "webhook",
      "DeliveryStatus": "sent",
      "DeliveryError": "",
      "Evidence": {"Sent": 5200, "Complaints": 21},
      "FiredAt": "2026-10-14 09:10:00"
    }
  ],
  "Metrics": {}
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [1],
  "ErrorText": ["Alerts could not be read (is the #3387 migration applied?)"]
}
```

```txt [Error Codes]
0: Success
1: Alerts could not be read (the database migration is not applied)
99999: The admin account lacks the Settings privilege
```

:::

## Get One Operator Alert

<Badge type="info" text="POST" /> `/api/v1/admin.alert.get`

::: tip API Usage Notes
- Authentication required: Admin API Key
- Required permissions: `Settings`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

Returns one alert that fired, with the measured value, the threshold, the evidence the check recorded, whether the delivery succeeded, and its rule (destination masked).

**Request Body Parameters:**

| Parameter    | Type    | Required | Description                               |
|--------------|---------|----------|-------------------------------------------|
| Command      | String  | Yes      | API command: `admin.alert.get`            |
| SessionID    | String  | No       | Session ID obtained from login            |
| AdminAPIKey  | String  | No       | Admin API key for authentication          |
| AlertEventID | Integer | Yes      | The alert ID from `admin.alerts.get`      |

::: code-group

```bash [Example Request]
curl -X POST https://example.com/api/v1/admin.alert.get \
  -H "Content-Type: application/json" \
  -d '{
    "Command": "admin.alert.get",
    "AdminAPIKey": "your-admin-api-key",
    "AlertEventID": 9
  }'
```

```json [Success Response]
{
  "Success": true,
  "Alert": {
    "AlertEventID": 9,
    "AlertRuleID": 1,
    "Metric": "complaint_rate",
    "Value": 0.4,
    "Threshold": 0.1,
    "Channel": "webhook",
    "DeliveryStatus": "sent",
    "DeliveryError": "",
    "Evidence": {"GatewaySent": 1200, "CampaignSent": 4000, "Sent": 5200, "Complaints": 21, "MinimumVolume": 200},
    "FiredAt": "2026-10-14 09:10:00"
  },
  "Rule": {"AlertRuleID": 1, "Metric": "complaint_rate", "Destination": "https://api.telegram.org/..."}
}
```

```json [Error Response]
{
  "Success": false,
  "ErrorCode": [2],
  "ErrorText": ["Alert not found"]
}
```

```txt [Error Codes]
0: Success
1: Missing AlertEventID
2: Alert not found
3: Alerts could not be read (the database migration is not applied)
99999: The admin account lacks the Settings privilege
```

:::
