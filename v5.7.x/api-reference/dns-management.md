---
layout: doc
---

# DNS Management

The DNS Management API provides tools for managing DNS records related to email authentication and deliverability, including SPF, DKIM, and DMARC configuration.

::: warning Note
This section is under development. Documentation will be available soon.
:::

## API Endpoints Covered

This section will document the following DNS management endpoints:

- **DNS Configuration**
  - `DNS.Set` - Configure DNS records for email authentication
  - `DNS.Get` - Retrieve current DNS configuration
  - `DNS.Validate` - Validate DNS record configuration
  - `DNS.Update` - Update existing DNS records

- **DNS Authorization**
  - `DNS.Authorize` - Authorize DNS changes and updates
  - `DNS.GetAuthStatus` - Check authorization status
  - `DNS.RevokeAuth` - Revoke DNS authorization
  - `DNS.RefreshAuth` - Refresh authorization tokens

- **DNS Providers**
  - `DNS.Provider` - Manage DNS provider integrations
  - `DNS.Providers.Get` - List supported DNS providers
  - `DNS.Provider.Connect` - Connect to DNS provider API
  - `DNS.Provider.Disconnect` - Remove provider integration

- **Email Authentication**
  - SPF (Sender Policy Framework) record management
  - DKIM (DomainKeys Identified Mail) configuration
  - DMARC (Domain-based Message Authentication) setup
  - MX record validation and configuration
  - PTR record management for reverse DNS
  - Subdomain delegation and management

## Coming Soon

Full documentation for these endpoints including request parameters, response formats, error codes, and usage examples will be added in future updates.