---
layout: doc
---

# Monitoring API Documentation

Prometheus-compatible metrics endpoint for monitoring Octeth infrastructure and API performance.

## Prerequisites

The Prometheus plugin must be enabled in the Octeth admin panel before using the metrics endpoint. Navigate to **Admin > Plugins** and enable the **Prometheus** plugin.

## Prometheus Metrics

<Badge type="info" text="GET" /> `/app/prometheus/metrics/`

Returns all collected metrics in [Prometheus text exposition format](https://prometheus.io/docs/instrumenting/exposition_formats/). This endpoint is designed to be scraped by a Prometheus server at regular intervals.

::: tip API Usage Notes
- Authentication required: HTTP Basic Auth
- Username: `admin`
- Password: HMAC-SHA256 token derived from your `APP_URL` and `ADMIN_API_KEY`
- The Prometheus plugin must be enabled
:::

**Authentication:**

This endpoint uses HTTP Basic Authentication with a computed token. The token is generated as follows:

```
base64( hmac_sha256( APP_URL + "app/plugins/prometheus/", ADMIN_API_KEY ) )
```

You can generate the token using this command:

```bash
source /opt/octeth/.oempro_env
TOKEN=$(php -r "echo base64_encode(hash_hmac('sha256', '${APP_URL}app/plugins/prometheus/', '${ADMIN_API_KEY}', true));")
echo $TOKEN
```

::: code-group

```bash [Example Request]
# Generate the auth token
source /opt/octeth/.oempro_env
TOKEN=$(php -r "echo base64_encode(hash_hmac('sha256', '${APP_URL}app/plugins/prometheus/', '${ADMIN_API_KEY}', true));")

# Scrape metrics
curl -u "admin:$TOKEN" https://example.com/app/prometheus/metrics/
```

```txt [Example Response]
# HELP api_requests_duration_seconds api_requests_duration_seconds
# TYPE api_requests_duration_seconds histogram
api_requests_duration_seconds_bucket{command="System.Login",le="0.001"} 0
api_requests_duration_seconds_bucket{command="System.Login",le="0.005"} 0
api_requests_duration_seconds_bucket{command="System.Login",le="0.01"} 2
api_requests_duration_seconds_bucket{command="System.Login",le="0.025"} 15
api_requests_duration_seconds_bucket{command="System.Login",le="0.05"} 42
api_requests_duration_seconds_bucket{command="System.Login",le="0.1"} 68
api_requests_duration_seconds_bucket{command="System.Login",le="0.25"} 95
api_requests_duration_seconds_bucket{command="System.Login",le="0.5"} 100
api_requests_duration_seconds_bucket{command="System.Login",le="1"} 100
api_requests_duration_seconds_bucket{command="System.Login",le="2.5"} 100
api_requests_duration_seconds_bucket{command="System.Login",le="5"} 100
api_requests_duration_seconds_bucket{command="System.Login",le="10"} 100
api_requests_duration_seconds_bucket{command="System.Login",le="+Inf"} 100
api_requests_duration_seconds_sum{command="System.Login"} 3.85
api_requests_duration_seconds_count{command="System.Login"} 100
```

```txt [No Metrics Response]
# No metrics collected yet
```

```txt [Authentication Error (HTTP 401)]
You are not authorized to access this page.
```

:::

## Available Metrics

### api_requests_duration_seconds

A histogram metric tracking API request latency, labeled by API command name.

| Label | Description |
|-------|-------------|
| `command` | The API command name (e.g., `Subscribers.Get`, `Campaigns.Create`) |

**Histogram buckets (seconds):** 0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10

**Derived metrics available in Prometheus/Grafana:**

| Metric | Description |
|--------|-------------|
| `api_requests_duration_seconds_bucket` | Cumulative request count per latency bucket |
| `api_requests_duration_seconds_sum` | Total sum of all observed request durations |
| `api_requests_duration_seconds_count` | Total number of requests observed |

**Example PromQL queries:**

```promql
# Average API response time over the last 5 minutes
rate(api_requests_duration_seconds_sum[5m]) / rate(api_requests_duration_seconds_count[5m])

# 95th percentile latency
histogram_quantile(0.95, rate(api_requests_duration_seconds_bucket[5m]))

# Request rate per command
sum(rate(api_requests_duration_seconds_count[5m])) by (command)
```

## Prometheus Configuration

Add the following scrape configuration to your `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: octeth
    scheme: https
    scrape_interval: 60s
    scrape_timeout: 5s
    metrics_path: /app/prometheus/metrics/
    basic_auth:
      username: admin
      password: "YOUR_TOKEN_HERE"
    static_configs:
      - targets:
          - example.com
```

::: warning
Replace `YOUR_TOKEN_HERE` with the HMAC-SHA256 token generated using the command shown in the Authentication section above. Replace `example.com` with your Octeth installation domain.
:::

## API Response ExecutionTime Field

Every API response now includes an `ExecutionTime` field (in milliseconds) indicating how long the request took to process.

::: code-group

```json [Example API Response]
{
  "Success": true,
  "ErrorCode": 0,
  "ExecutionTime": 12.45
}
```

:::
