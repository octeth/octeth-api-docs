---
layout: doc
---

# Sender Domains

::: info NOTICE
Email Gateway email sender domain API end-points are documented under [Email Gateway](/api-reference/email-gateway.html#add-a-new-email-sender-domain) section.
:::


## Retrieve DNS Provider Information

<Badge type="info" text="GET" /> `/api/v1/dns.provider`

This endpoint retrieves the DNS provider information for the specified domain.

**Request Parameters:**

| Parameter     | Description                                                                  | Required?   |
|---------------|------------------------------------------------------------------------------|-------------|
| SessionID     | The ID of the user's current session                                         | Yes         |
| APIKey        | The user's API key. Either `SessionID` or `APIKey` must be provided.         | Yes         |
| Domain        | The domain for which to retrieve DNS provider information                    | Yes         |

::: code-group

```bash [Example Request]
curl -X GET http://example.com/api/v1/dns.provider \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "exampleSessionId",
        "Domain": "exampledomain.com"
      }'
```

```json [Success Response]
{
  "provider": "namecheap"
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing Domain parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing domain parameter
2: Unable to determine DNS provider for this domain
```

:::

::: info NOTICE
As of writing, only supported DNS providers are Namecheap, GoDaddy and CloudFlare. We will continue adding more providers in the future.
:::

## Authorize DNS Management for a Domain

<Badge type="info" text="POST" /> `/api/v1/dns.authorize`

This endpoint authorizes the user to manage the DNS records for the specified domain.

**Request Parameters:**

| Parameter  | Description                                                                                        | Required? |
|------------|----------------------------------------------------------------------------------------------------|-----------|
| SessionID  | The ID of the user's current session                                                               | Yes       |
| APIKey     | The user's API key. Either `SessionID` or `APIKey` must be provided.                               | Yes       |
| Provider   | The DNS provider for which to authorize DNS management (e.g. "namecheap", "godaddy", "cloudflare") | Yes       |
| Domain     | Fully qualified domain name (FQDN) for which to authorize DNS management                           | Yes       |
| Api_key    | API key for the DNS provider                                                                       | Yes       |
| Api_secret | API secret for the DNS provider                                                                    | No        |
| Api_user   | API user for the DNS provider                                                                      | No        |
| Useranem   | Username for the DNS provider                                                                      | No        |

::: code-group

```bash [Example Request]
# CloudFlare
curl -X GET http://example.com/api/v1/dns.authorize \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "fakeSessionID12345",
        "Provider": "cloudflare",
        "Domain": "exampledomain.com",
        "Api_key": "fakeApiKey12345"
      }'

# Namecheap
curl -X GET http://example.com/api/v1/dns.authorize \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "fakeSessionID12345",
        "Provider": "namecheap",
        "Domain": "exampledomain.com",
        "Api_key": "fakeApiKey12345",
        "Api_user": "fakeUser123",
        "Username": "fakeUser123"
      }'

# GoDaddy
curl -X GET http://example.com/api/v1/dns.authorize \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "fakeSessionID67890",
        "Provider": "godaddy",
        "Domain": "anotherexample.com",
        "Api_key": "fakeApiKey67890",
        "Api_secret": "fakeApiSecret67890"
      }'
```

```json [Success Response]
{
  "success":true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing Domain parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing domain parameter
2: Missing API key parameter
3: Missing provider parameter
4: Authorization failed for this DNS provider
5: Missing API secret parameter
6: Missing API user parameter
7: Missing username parameter
8: Unsupported provider: {provider}
9: An error occurred during authorization: {error}
```
:::

::: info NOTICE
As of writing, only supported DNS providers are Namecheap, GoDaddy and CloudFlare. We will continue adding more providers in the future.
:::

## Set DNS Records for a Domain

<Badge type="info" text="POST" /> `/api/v1/dns.set`

This API endpoint sets the DNS records for the specified domain on the specified DNS provider.














**Request Parameters:**

| Parameter   | Description                                                                                        | Required? |
|-------------|----------------------------------------------------------------------------------------------------|-----------|
| SessionID   | The ID of the user's current session                                                               | Yes       |
| Provider    | The DNS provider for which to authorize DNS management (e.g. "namecheap", "godaddy", "cloudflare") | Yes       |
| Domain      | Fully qualified domain name (FQDN) for which to set DNS records                                    | Yes       |
| Api_key     | API key for the DNS provider                                                                       | Yes       |
| Api_secret  | API secret for the DNS provider                                                                    | No        |
| Api_user    | API user for the DNS provider                                                                      | No        |
| Useranem    | Username for the DNS provider                                                                      | No        |
| Record_type | Type of DNS record set (`campaign` or `email-gateway`)                                             | Yes       |

::: code-group

```bash [Example Request]
# CloudFlare
curl -X GET http://example.com/api/v1/dns.set \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "fakeSessionID98765",
        "Provider": "cloudflare",
        "Domain": "yetanotherexample.com",
        "Api_key": "fakeCloudflareKey98765",
        "Record_type": "campaign"
      }'
      
# Namecheap
curl -X GET http://example.com/api/v1/dns.set \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "fakeSessionID12345",
        "Provider": "namecheap",
        "Domain": "exampledomain.com",
        "Api_key": "fakeApiKey12345",
        "Record_type": "campaign",
        "Api_user": "fakeUser123",
        "Username": "fakeUser123"
      }'

# GoDaddy
curl -X GET http://example.com/api/v1/dns.set \
  -H "Content-Type: application/json" \
  -d '{
        "SessionID": "fakeSessionID67890",
        "Provider": "godaddy",
        "Domain": "anotherexample.com",
        "Api_key": "fakeApiKey67890",
        "Record_type": "campaign",
        "Api_secret": "fakeApiSecret67890"
      }'
```

```json [Success Response]
{
  "success":true
}
```

```json [Error Response]
{
  "Errors": [
    {
      "Code": 1,
      "Message": "Missing Domain parameter"
    }
  ]
}
```

```txt [Error Codes]
1: Missing domain parameter
2: Missing API key parameter
3: Missing provider parameter
4: Missing record type parameter (e.g. "campaign", "email-gateway")
5: Missing API secret parameter
6: Missing API user parameter
7: Missing username parameter
8: Unsupported provider: {provider}
9: Failed to set DNS records for this domain
10: {system exception error}
```
:::

::: info NOTICE
As of writing, only supported DNS providers are Namecheap, GoDaddy and CloudFlare. We will continue adding more providers in the future.
:::

