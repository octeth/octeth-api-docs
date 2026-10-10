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

- File format: ZIP archive (e.g., `oempro-rel-v6.0.1.zip`)
- Size: Approximately 200-300 MB
- Version: v6.0.1 or newer to use the signed license key described below

### License Key

Octeth v6.0.1 and newer read a signed license key for one domain: the host of the Application URL (`APP_URL`) you install with. Get it from the [Octeth Client Area](https://my.octeth.com/):

1. Open **Licenses** and click your license.
2. Under **Domains and license keys**, enter your installation's domain in **Add a domain** (for example `mail.example.com`) and click **Add domain**. Each add counts as a domain change, and the page shows how many of the license's domain changes you have used.
3. In the license key panel for that domain, click **Show license key**, then click **Copy**. To save it as a file instead, click **Download as file**, which saves it as `octeth.license`.

About the key:

- Format: one line of about 800 characters. It is not the short `OCT-...` key that identifies the license in the client area.
- It is bound to one domain. Changing or adding a domain needs a new key, which you get the same way.
- You will be prompted for it during installation. You can also leave it empty and paste it later on **Settings > License** in the administrator area (see [License](/v6.0.1/using-octeth/administration/license)). Until a valid key is set, the installation runs with the Community limits (one user account, 10,000 subscribers).

::: info Octeth v6.0.0 and older
Versions before v6.0.1 do not read the signed license key. They use the short `OCT-...` license key in `LICENSE_KEY`, and the client area still offers a `license.dat` file for them in the **v5 and older** column. To move such an installation to the signed key, upgrade to v6.0.1 or newer and set the key as described in [Upgrading Octeth](./upgrading-octeth#set-the-license-key).
:::

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
- [ ] Signed license key copied for your domain
- [ ] Domain name ready (optional)
- [ ] SMTP server access configured
:::
