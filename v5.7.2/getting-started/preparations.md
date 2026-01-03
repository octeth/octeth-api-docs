---
layout: doc
---

# Preparations

Before installing Octeth and its add-ons, ensure you have the following prerequisites ready.

## Required Resources

### Main Octeth Server

A vanilla Ubuntu 24.04 or newer VM server for running the Octeth application:

- **Minimum Specs**: 4 vCPU / 8 GB RAM / 80 GB SSD
- **Recommended**: 8 vCPU / 16 GB RAM / 160 GB SSD
- **Operating System**: Ubuntu 24.04 LTS (fresh installation, no control panels)
- **Access**: Root SSH access

### Link Proxy Server (Optional)

If you plan to use the Link Proxy add-on, you'll need a separate server:

- **Minimum Specs**: 2 vCPU / 4 GB RAM / 40 GB SSD
- **Operating System**: Ubuntu 24.04 LTS (fresh installation)
- **Access**: Root SSH access

## Domain and DNS

- **Domain Name** (optional but recommended): A root or subdomain to access Octeth
  - Example: `octeth.yourdomain.com` or `mail.yourdomain.com`
- **DNS Access**: Ability to create A, TXT, and CNAME records for your domain

## Octeth Software

### Software Package

Download the latest Octeth package from the [Octeth Client Area](https://my.octeth.com/):

- File format: ZIP archive (e.g., `oempro-rel-v5.7.2.zip`)
- Size: Approximately 200-300 MB
- Version: 5.7.2 or newer

### License File

Obtain a valid license file from the [Octeth Client Area](https://my.octeth.com/):

- File: `license.dat`
- Must be active and not expired
- Required for installation

## Additional Requirements

### Email Infrastructure

- **SMTP Server Access**: For sending emails (can be third-party like SendGrid, Mailgun, Amazon SES, or your own)
- **Sender Domains**: Domains you plan to send emails from
- **DNS Control**: Ability to add SPF, DKIM, and DMARC records

### Skills and Access

- Basic Linux command-line knowledge
- SSH client software
- Text editor familiarity (vi, nano, etc.)
- Understanding of DNS management

## Cost Considerations

**Server Hosting**: Costs vary by provider, typically:
- Main server: $6-20/month depending on specifications
- Link proxy server: $3-10/month (if using)

**Octeth License**: Check [Octeth Pricing](https://octeth.com/pricing) for current license costs

**Email Sending**: SMTP service costs vary based on volume (some free tiers available)

## Next Steps

Once you have all prerequisites ready:

1. Proceed to [Server Requirements](./server-requirements) to verify your server meets specifications
2. Follow [Server Initialization](./server-initialization) to set up your VM
3. Continue with [Server Setup](./server-setup) to prepare the server for Octeth installation

::: tip Checklist
Before proceeding, ensure you have:
- [ ] Ubuntu 24.04 server(s) with root access
- [ ] Octeth software package downloaded
- [ ] Valid license file obtained
- [ ] Domain name ready (optional)
- [ ] SMTP server access configured
:::
