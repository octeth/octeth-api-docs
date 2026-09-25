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

You will need to use Octeth's `/api/v1/system-health-check` API endpoint. You can learn more about API usage instructions [here](https://dev.octeth.com/v5.8.3/api-reference/system.html#check-system-health).

## Bulk SMS Prometheus Gauges <Badge type="tip" text="New in v6.0.0" />

The `prometheus` plugin exposes a `/metrics` endpoint in the Prometheus text format. With bulk SMS in use it publishes the gauges below, refreshed at scrape time.

::: warning A missing gauge is not a zero
Each family is only written when its query succeeds. If a query fails the gauge is left at its previous value and a warning goes to the log, rather than publishing a zero. This matters when you write alert rules: a zero here means the system measured zero, and a series that stops updating means the measurement failed. Alert on staleness as well as on value.
:::

| Gauge | What it counts |
|---|---|
| `oempro_sms_outbox_rows` | Rows waiting in the transactional event outbox |
| `oempro_sms_outbox_oldest_age_seconds` | Age of the oldest row in that outbox |
| `oempro_sms_rollup_dirty_keys{key_type}` | Rollup backlog, split into `campaign` and `subscriber` keys |
| `oempro_sms_campaign_queue_stuck_rows` | Queue rows released or sending longer than the stuck threshold |
| `oempro_sms_campaign_queue_stuck_threshold_seconds` | The threshold that count uses, so an alert does not have to guess it |
| `oempro_sms_inbound_problems_last_hour{kind}` | Inbound problems in the last hour: `failed`, `unattributed`, `unsubscribe_failed` |
| `oempro_sms_delivery_reports_exhausted_last_hour` | Delivery reports that ran out of match attempts in the last hour |
| `oempro_sms_campaign_queue_pmax_rows` | Rows in the campaign queue's catch-all `pMAX` partition |

### Reading three of these correctly

**The outbox has two gauges because one is not enough.** A steady small row count can mean a healthy pipeline draining as fast as it fills, or one row stuck since Tuesday with everything else flowing past it. Only the age separates them, so alert on `oempro_sms_outbox_oldest_age_seconds` rather than on the count.

**`oempro_sms_campaign_queue_stuck_rows` reads zero on a healthy system because the release worker repairs the condition it counts.** Its own sweep reclaims rows released longer ago than the threshold and returns them to the queue. So a sustained non-zero value does not mean some messages are slow: it means the sweep itself has stopped running or cannot keep up, which no other signal shows. Alert on it being non-zero for several consecutive scrapes, not on a single sample.

**`oempro_sms_campaign_queue_pmax_rows` must be zero.** `pMAX` is the catch-all partition above the last dated one. A row landing there means partition maintenance has not run far enough ahead, and retention can never drop that row's partition without taking `pMAX` with it. Any non-zero value is actionable immediately. On an install whose queue table is not partitioned the gauge is absent rather than zero, for the reason in the warning above.

`oempro_sms_inbound_problems_last_hour` is split by `kind` rather than summed because the three need different responses. `failed` is the worker erroring, `unattributed` is a reply that matched no contact, and `unsubscribe_failed` is an opt-out the system accepted and did not carry out, which is the one that carries compliance weight.
