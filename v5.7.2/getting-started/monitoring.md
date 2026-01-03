---
layout: doc
---

# Monitoring

Octeth system and infrastructure can be monitored by using Octeth's health check API endpoint and command tool.

### Health Check via CLI Tool

SSH to the server:

```bash
ssh root@203.0.113.10 -p 22
cd /opt/octeth/
```

Run the health check command:

```bash
/opt/octeth/cli/octeth.sh health:check
```

This should return "✓ Health check completed successfully (HTTP 200)" response with a detailed overview of the system health:

```
ℹ Using API endpoint: http://203.0.113.10/api/v1/system-health-check
ℹ Using API key: sk_xxxxxxxx... (truncated for security)

ℹ Checking system health...

✓ Health check completed successfully (HTTP 200)

System Health Status:

┌─────────────────────┬────────────────────────────────────┐
│ Service             │ Status                             │
├─────────────────────┼────────────────────────────────────┤
│ MySQL               │ ✓ OK                               │
│ Redis               │ ✓ OK                               │
│ RabbitMQ            │ ✓ OK                               │
│ ElasticSearch       │ ✓ OK                               │
│ ClickHouse          │ ✓ OK                               │
│ Session             │ ✓ OK                               │
│ System Container    │ ✓ OK                               │
│ Vector              │ ✓ OK                               │
│ HAProxy             │ ✓ OK                               │
│ Cron                │ ✓ OK                               │
│ Supervisor          │ ✓ OK                               │
│ Send Engine         │ ✓ OK                               │
│ Admin Frontend      │ ✓ OK                               │
│ User Frontend       │ ✓ OK                               │
│ File Permissions    │ ✓ OK                               │
└─────────────────────┴────────────────────────────────────┘

Raw JSON response (for debugging):
{"Checks":{"MySQL":"OK","ClickHouse":"OK","Elasticsearch":"OK","RabbitMQ":"OK","Redis":"OK","Session":"OK","SystemContainer":"OK","Vector":"OK","Haproxy":"OK","Cron":"OK","Supervisor":"OK","SendEngine":"OK","AdminFrontend":"OK","UserFrontend":"OK","FilePermissions":"OK"}}

ℹ Health check completed
```

### Health Check, Monitoring and Alerts Programmatically

You can use Octeth's health check API endpoint for this purpose. [Cronitor](https://cronitor.io/), [Uptime Kuma](https://github.com/louislam/uptime-kuma), [Hyperping](https://hyperping.com/) or any similar uptime monitoring and alerting service can be used.

You will need to use Octeth's `/api/v1/system-health-check` API endpoint. You can learn more about API usage instructions [here](https://dev.octeth.com/v5.7.2/api-reference/system.html#check-system-health).
