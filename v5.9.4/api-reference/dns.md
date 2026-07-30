---
layout: doc
---

# DNS API Documentation

DNS management endpoints for automated DNS record setup. These endpoints help users automatically configure DNS records for email deliverability (SPF, DKIM, DMARC) by integrating with popular DNS providers like Cloudflare, GoDaddy, and Namecheap.

## Get DNS Provider

<Badge type="info" text="GET" /> `/api/v1/dns.provider`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `dns.provider` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| Domain | String | Yes | Domain name to lookup DNS provider for (e.g., "example.com") |

::: code-group

```bash [Example Request]
curl -X GET "https://example.com/api/v1/dns.provider?Domain=example.com" \
  -H "Authorization: Bearer your-api-key"
```

```json [Success Response]
{
  "provider": "cloudflare"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 2,
      "Message": "Unable to determine DNS provider for this domain"
    }
  ]
}
```

```txt [Error Codes]
1: Missing domain parameter
2: Unable to determine DNS provider for this domain
```

:::

## Authorize DNS Provider

<Badge type="info" text="POST" /> `/api/v1/dns.authorize`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `dns.authorize` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| Domain | String | Yes | Domain name to authorize (e.g., "example.com") |
| Provider | String | Yes | DNS provider name: "cloudflare", "godaddy", or "namecheap" |
| ApiKey | String | Yes | API key for the DNS provider |
| ApiSecret | String | Conditional | API secret (required for GoDaddy) |
| ApiUser | String | Conditional | API user (required for Namecheap) |
| Username | String | Conditional | Username (required for Namecheap) |

**Provider-Specific Requirements:**

- **Cloudflare**: Requires only `ApiKey`
- **GoDaddy**: Requires `ApiKey` and `ApiSecret`
- **Namecheap**: Requires `ApiKey`, `ApiUser`, and `Username`

::: code-group

```bash [Example Request (Cloudflare)]
curl -X POST https://example.com/api/v1/dns.authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "Command": "dns.authorize",
    "Domain": "example.com",
    "Provider": "cloudflare",
    "ApiKey": "cloudflare-api-key"
  }'
```

```bash [Example Request (GoDaddy)]
curl -X POST https://example.com/api/v1/dns.authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "Command": "dns.authorize",
    "Domain": "example.com",
    "Provider": "godaddy",
    "ApiKey": "godaddy-api-key",
    "ApiSecret": "godaddy-api-secret"
  }'
```

```bash [Example Request (Namecheap)]
curl -X POST https://example.com/api/v1/dns.authorize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "Command": "dns.authorize",
    "Domain": "example.com",
    "Provider": "namecheap",
    "ApiKey": "namecheap-api-key",
    "ApiUser": "api_user",
    "Username": "username"
  }'
```

```json [Success Response]
{
  "success": true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 9,
      "Message": "Authorization failed for this DNS provider"
    }
  ]
}
```

```txt [Error Codes]
1: Missing domain parameter
2: Missing API key parameter
3: Missing provider parameter
5: Missing API secret parameter (GoDaddy)
6: Missing API user parameter (Namecheap)
7: Missing username parameter (Namecheap)
8: Unsupported provider
9: Authorization failed for this DNS provider
10: An error occurred during authorization
```

:::

## Set DNS Records

<Badge type="info" text="POST" /> `/api/v1/dns.set`

::: tip API Usage Notes
- Authentication required: User API Key
- Required permissions: `User.Update`
- Rate limit: 100 requests per 60 seconds
- Legacy endpoint access via `/api.php` is also supported
:::

**Request Body Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| Command | String | Yes | API command: `dns.set` |
| SessionID | String | No | Session ID obtained from login |
| APIKey | String | No | API key for authentication |
| Domain | String | Yes | Domain name to set DNS records for (e.g., "example.com") |
| Provider | String | Yes | DNS provider name: "cloudflare", "godaddy", or "namecheap" |
| RecordType | String | Yes | Type of records to set: "campaign" or "email-gateway" |
| ApiKey | String | Yes | API key for the DNS provider |
| ApiSecret | String | Conditional | API secret (required for GoDaddy) |
| ApiUser | String | Conditional | API user (required for Namecheap) |
| Username | String | Conditional | Username (required for Namecheap) |

**Provider-Specific Requirements:**

- **Cloudflare**: Requires only `ApiKey`
- **GoDaddy**: Requires `ApiKey` and `ApiSecret`
- **Namecheap**: Requires `ApiKey`, `ApiUser`, and `Username`

**Record Types:**

- `campaign`: Sets up DNS records for email campaigns (SPF, DKIM, DMARC)
- `email-gateway`: Sets up DNS records for transactional email gateway

::: code-group

```bash [Example Request (Cloudflare)]
curl -X POST https://example.com/api/v1/dns.set \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "Command": "dns.set",
    "Domain": "example.com",
    "Provider": "cloudflare",
    "RecordType": "campaign",
    "ApiKey": "cloudflare-api-key"
  }'
```

```bash [Example Request (GoDaddy)]
curl -X POST https://example.com/api/v1/dns.set \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "Command": "dns.set",
    "Domain": "example.com",
    "Provider": "godaddy",
    "RecordType": "email-gateway",
    "ApiKey": "godaddy-api-key",
    "ApiSecret": "godaddy-api-secret"
  }'
```

```bash [Example Request (Namecheap)]
curl -X POST https://example.com/api/v1/dns.set \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-api-key" \
  -d '{
    "Command": "dns.set",
    "Domain": "example.com",
    "Provider": "namecheap",
    "RecordType": "campaign",
    "ApiKey": "namecheap-api-key",
    "ApiUser": "api_user",
    "Username": "username"
  }'
```

```json [Success Response]
{
  "success": true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 9,
      "Message": "Failed to set DNS records"
    }
  ]
}
```

```txt [Error Codes]
1: Missing domain parameter
2: Missing API key parameter
3: Missing provider parameter
4: Missing record type parameter
5: Missing API secret parameter (GoDaddy)
6: Missing API user parameter (Namecheap)
7: Missing username parameter (Namecheap)
8: Unsupported provider
9: Failed to set DNS records
10: Error message from exception
```

:::
