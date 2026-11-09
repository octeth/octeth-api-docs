---
layout: doc
---

# Google Postmaster Tools API Documentation

::: danger Removed in v6.0.2
Google retired the Postmaster Tools API, so Octeth removed its Google Postmaster integration in v6.0.2. The admin screens, the OAuth connection, the nightly collector and the stored metrics are gone.
:::

The 11 `postmaster.*` commands stay registered for v6.0.2 only, so an existing caller gets a clear error instead of an unknown command. They will be deleted in a later release.

| Command | HTTP method |
|---------|-------------|
| `postmaster.status.get` | GET |
| `postmaster.oauth.url.get` | GET |
| `postmaster.oauth.disconnect` | POST |
| `postmaster.dashboard.get` | GET |
| `postmaster.domain.metrics.get` | GET |
| `postmaster.domain.anomalies.get` | GET |
| `postmaster.domains.discover` | POST |
| `postmaster.ips.get` | GET |
| `postmaster.ip.metrics.get` | GET |
| `postmaster.ip.add` | POST |
| `postmaster.ip.delete` | POST |

All of them still require the Admin API key (or an admin session) and the `Settings` sub-admin privilege. Whatever parameters are sent, each one answers:

```json
{
  "Success": false,
  "ErrorCode": 99,
  "ErrorText": "Google Postmaster integration has been removed: the Google Postmaster Tools API is no longer available"
}
```

Remove these calls from your integration. See [API Behavior Changes in v6.0.2](/v6.0.2/api-reference/behavior-changes) for the upgrade notes.
