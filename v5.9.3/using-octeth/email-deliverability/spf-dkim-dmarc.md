---
layout: doc
---

# SPF, DKIM, and DMARC

Every email you send is checked by the recipient's mail server before it reaches the inbox. The server looks at your domain's DNS records to verify that your email is legitimate and has not been tampered with in transit. Three protocols make this possible: **SPF**, **DKIM**, and **DMARC**. If your outgoing emails do not pass these checks, they are far more likely to land in the spam folder or be rejected outright.

This article explains what each protocol does, how to configure your Octeth installation for full compliance, and how to enforce compliant sender domains for all users on your system. It is written for Octeth administrators (owners) who manage the server-side configuration and delivery infrastructure.

## Why Email Authentication Matters

Major email providers — including Gmail, Yahoo, Microsoft, and Apple — require senders to authenticate their emails. Since February 2024, Google and Yahoo enforce strict authentication requirements for bulk senders. Emails that fail SPF, DKIM, or DMARC checks face:

- Delivery to the spam folder instead of the inbox
- Outright rejection by the receiving mail server
- Damage to your sending domain's reputation over time
- Blacklisting of your sending IP addresses

Proper email authentication is not optional. It is a baseline requirement for reaching your recipients.

## Understanding the Three Protocols

Before configuring anything, it helps to understand what each protocol does and how they work together.

### SPF (Sender Policy Framework)

SPF lets you declare which mail servers are authorized to send email on behalf of your domain. You publish this list as a DNS TXT record on your domain. When a receiving server gets an email from your domain, it checks the SPF record to see if the sending server's IP address is on the authorized list.

**What SPF validates:** The envelope sender domain (also called the return-path or MFROM domain) — not the "From" address visible to the recipient.

### DKIM (DomainKeys Identified Mail)

DKIM adds a cryptographic digital signature to each outgoing email. The sending server signs the message with a private key, and the corresponding public key is published as a DNS TXT record. The receiving server uses the public key to verify that the email has not been modified since it was signed.

**What DKIM validates:** The integrity of the email message. It proves the email was sent by an authorized server and was not altered in transit.

### DMARC (Domain-based Message Authentication, Reporting & Conformance)

DMARC ties SPF and DKIM together. It tells receiving servers what to do when an email fails authentication checks — whether to deliver it, quarantine it, or reject it. DMARC also provides a reporting mechanism so you can monitor authentication results.

**What DMARC validates:** Alignment between the visible "From" domain and the domains used by SPF and DKIM. DMARC ensures that the domain the recipient sees in the "From" header is the same domain that passed authentication.

### How They Work Together

When a receiving mail server processes an incoming email, it runs these checks in sequence:

| Step | Protocol | Check Performed |
|---|---|---|
| 1 | **SPF** | Is the sending server's IP address authorized by the envelope sender domain's SPF record? |
| 2 | **DKIM** | Does the email's digital signature match the public key published in DNS? |
| 3 | **DMARC** | Does the visible "From" domain align with the domain that passed SPF or DKIM? What policy should be applied if alignment fails? |

For an email to pass DMARC, it must pass **either** SPF **or** DKIM — and the passing protocol must align with the "From" domain. Best practice is to pass both.

## The Master Sender Domain Strategy

The recommended approach for Octeth installations is to set up a single **master sender domain** — a dedicated infrastructure domain where all actual DNS records (A, MX, SPF, DKIM, DMARC) are configured. User sender domains then inherit this configuration through DNS CNAME records.

This strategy provides several advantages:

- **Centralized management** — SPF, DKIM, and DMARC records are maintained in one place. If you need to update a DKIM key or change your SPF policy, you update it once on the master domain.
- **Simplified user setup** — Users only need to add a few CNAME records at their domain registrar. They do not need to understand or manage SPF, DKIM, or DMARC directly.
- **Consistent compliance** — Every sender domain on the system automatically inherits the same authentication configuration, eliminating the risk of individual misconfiguration.
- **Easy infrastructure changes** — If you change SMTP providers or rotate DKIM keys, you update the master domain. All user sender domains pick up the change automatically through their CNAME records.

### Setting Up the Master Sender Domain

Choose a domain dedicated to your email sending infrastructure. This domain will host the actual DNS records that all user sender domains point to.

::: tip
Use a domain or subdomain that clearly identifies it as email infrastructure, such as `mailinfra.example.com` or `mail.example.com`. Do not use your main website domain for this purpose — keep email infrastructure separate.
:::

Add the following DNS records to your master sender domain at your domain registrar or DNS hosting provider:

| Host | Type | Value | Purpose |
|---|---|---|---|
| `mailinfra.example.com` | A | `203.0.113.50` | Points to the Octeth server (or MTA server) IP address. |
| `mailinfra.example.com` | MX | `mail.mailinfra.example.com` | Specifies the mail server that handles replies and bounces for the envelope sender domain. |
| `mail.mailinfra.example.com` | A | `203.0.113.50` | Points the MX target to the mail server IP address. |
| `mailinfra.example.com` | TXT | `"v=spf1 mx ip4:203.0.113.0/24 -all"` | SPF record — authorizes the specified IP range to send email for this domain. |
| `_dmarc.mailinfra.example.com` | TXT | `"v=DMARC1; p=none; rua=mailto:noc@mailinfra.example.com; fo=1; adkim=r; aspf=r"` | DMARC policy — defines how authentication failures should be handled and where reports are sent. |
| `key1._domainkey.mailinfra.example.com` | TXT | `"k=rsa; p=MIIBIjANBgkqhkiG..."` | DKIM public key — used by receiving servers to verify email signatures. |
| `upl.mailinfra.example.com` | A | `203.0.113.51` | Points to the Octeth Link Proxy Add-On server for link tracking (or the main Octeth server IP if you are not using a separate link proxy). |

::: info
The IP addresses and domain names above are examples. Replace them with your actual server IP addresses and your chosen infrastructure domain name. The DKIM public key value (`MIIBIjANBgkqhkiG...`) must match the private key configured on your mail server.
:::

### Understanding Each Master Domain Record

**A Record (`mailinfra.example.com`)** — This is the foundation. It maps your infrastructure domain to the IP address of your mail server. The MFROM (return-path) address on outgoing emails will use this domain, so receiving servers need to be able to resolve it.

**MX Record** — Specifies which server receives incoming mail for the infrastructure domain. This is important for processing bounces — when an email bounces, the bounce notification is sent back to the MFROM address, and the MX record tells the sending server where to deliver that notification.

**SPF Record** — The `v=spf1` tag declares this as an SPF record. The `mx` mechanism authorizes any server listed in the MX record. The `ip4:203.0.113.0/24` mechanism authorizes the entire IP range. The `-all` suffix means any server not on the list is **not** authorized (hard fail). Adjust the IP range to match your sending infrastructure.

**DMARC Record** — The key parameters are:

| Parameter | Value | Meaning |
|---|---|---|
| `p=none` | Policy | No action on failures (monitoring only). Change to `quarantine` or `reject` once you confirm everything works. |
| `rua=mailto:...` | Reporting | Email address to receive aggregate DMARC reports. |
| `fo=1` | Failure options | Send a report for every authentication failure. |
| `adkim=r` | DKIM alignment | Relaxed — allows subdomain alignment. |
| `aspf=r` | SPF alignment | Relaxed — allows subdomain alignment. |

::: warning
Start with `p=none` (monitoring mode) until you have verified that all legitimate emails pass authentication. Moving to `p=quarantine` or `p=reject` too early can cause legitimate emails to be blocked.
:::

**DKIM Record** — The public key record published under the `key1` selector. Your mail server (Postfix, PowerMTA, KumoMTA, SendGrid, Mailgun, etc.) signs outgoing emails with the corresponding private key. The selector name (`key1`) must match what your mail server uses.

**Link Proxy A Record** — If you use the Octeth Link Proxy Add-On for tracking link clicks, this record points to the link proxy server. If you do not use a separate link proxy, point it to your main Octeth server IP.

### SMTP Provider Considerations

The master sender domain DNS records must align with the SMTP service you use to send emails. The configuration varies depending on whether you use a cloud-based or in-house SMTP provider.

**Cloud-Based Providers (SendGrid, Mailgun, Amazon SES, Postmark, etc.)**

Cloud providers typically manage DKIM signing on their side and give you specific DNS records to add. Your SPF record should include their sending infrastructure. For example:

- SendGrid: `v=spf1 include:sendgrid.net -all`
- Mailgun: `v=spf1 include:mailgun.org -all`
- Amazon SES: `v=spf1 include:amazonses.com -all`

The DKIM records provided by the cloud service should be added to your master sender domain.

**In-House Providers (Postfix, PowerMTA, KumoMTA, etc.)**

With in-house mail servers, you generate your own DKIM key pair, configure the mail server to sign outgoing emails with the private key, and publish the public key on your master sender domain. Your SPF record should authorize the IP addresses of your mail servers.

::: tip
Regardless of your SMTP provider, the principle is the same: configure the actual SPF, DKIM, and DMARC records on the master sender domain, and let user sender domains point to them via CNAME records.
:::

## Configuring the Delivery Server

Before configuring DNS templates, you need at least one delivery server configured in Octeth. A delivery server defines the SMTP connection that Octeth uses to send emails.

### Creating a Delivery Server

1. Log in as an administrator.
2. Navigate to **Settings** > **Delivery Servers**.
3. Click **Create a New Delivery Server**.
4. Configure the SMTP connection settings:

| Field | Description |
|---|---|
| **Name** | A descriptive name (e.g., "Primary Mail Server" or "SendGrid Production"). |
| **SMTP Host** | The hostname or IP of your SMTP server (e.g., `smtp.mailinfra.example.com` or `smtp.sendgrid.net`). |
| **SMTP Port** | The port number: `587` (TLS), `465` (SSL), or `25` (unencrypted — not recommended). |
| **Encryption** | Select **TLS** or **SSL**. Always use encryption in production. |
| **Authentication** | Set to **True** if the SMTP server requires credentials. |
| **Username / Password** | Your SMTP authentication credentials. |

5. Switch to the **Domains** tab and configure:

| Field | Description |
|---|---|
| **Mail From Domain** | Your master sender domain (e.g., `mailinfra.example.com`). This is the return-path domain for bounce handling. |
| **Link Tracking Domain** | The tracking domain (e.g., `track.mailinfra.example.com`). |
| **Open Tracking Domain** | The open tracking domain (same as link tracking or a dedicated one). |

6. Save the delivery server.
7. Go to the **Test** tab and click **Test** to verify the SMTP connection works.

[[SCREENSHOT: Delivery Server creation form showing the Delivery Method tab with SMTP host, port, encryption, and authentication fields filled in for a production mail server]]

::: warning
The Mail From Domain on the delivery server must match the domain configured in your master sender domain DNS records. Mismatches cause SPF alignment failures.
:::

For complete delivery server documentation, see the [Email Sending](./email-sending) article.

## Assigning Delivery Servers to User Groups

Once your delivery server is created, assign it to the appropriate user groups so that users can send emails through it.

### Assigning the Delivery Server

1. Navigate to **User Management** > **User Groups**.
2. Click the user group name to edit it.
3. Scroll to the **Sending Settings** section.
4. Select your delivery server from the dropdown for each email channel:

| Channel | Description |
|---|---|
| **Marketing** | Email campaigns sent to subscriber lists. |
| **Transactional** | One-to-one emails like password resets or order confirmations. |
| **Auto Responder** | Automated email sequences. |

5. Save the user group.

[[SCREENSHOT: User group edit page showing the Sending Settings section with the delivery server selected for Marketing, Transactional, and Auto Responder channels]]

### Enabling Sender Domain Management

To enforce email authentication compliance, enable sender domain management for the user group. This forces users to use verified sender domains instead of arbitrary email addresses.

1. In the user group edit page, scroll to the **Preferences** section.
2. Check **Enable sender domain management**.
3. Save the user group.

When enabled:

- Users must create and verify a sender domain before they can send campaigns.
- The campaign creation form shows a sender domain dropdown instead of a free-text From Email field.
- Only domains with **Enabled** status (DNS records verified) can be used for sending.

::: tip
Enabling sender domain management is the key step for enforcing compliance. When this setting is active, users cannot bypass email authentication — they must use a verified sender domain that has proper DNS records in place.
:::

### Selecting the DNS Template

Each user group can use a different DNS template, which determines what DNS records Octeth generates when users create sender domains.

1. In the user group edit page, scroll to the **Email Delivery** section.
2. Select a template from the **Email Campaign DNS Template** dropdown.
3. If you use the Email Gateway feature, also select a template from the **Email Gateway DNS Template** dropdown.
4. Save the user group.

[[SCREENSHOT: User group edit page showing the Email Delivery section with the Email Campaign DNS Template and Email Gateway DNS Template dropdowns]]

The available templates are defined in the `config/global/sender_domain_dns.php` configuration file, which is covered in detail in the next section.

## Configuring the DNS Template

The DNS template configuration file is the most important piece of the compliance setup. It tells Octeth exactly what DNS records to generate for each user's sender domain. When configured correctly, it creates CNAME records that point to your master sender domain, inheriting all SPF, DKIM, and DMARC configuration automatically.

### Configuration File Location

```
config/global/sender_domain_dns.php
```

This file contains two template functions:

- **`$EmailCampaignDNSTemplates`** — DNS templates for email campaign sender domains.
- **`$EmailGatewayDNSTemplates`** — DNS templates for email gateway sender domains.

Both functions follow the same structure. You should configure both with matching templates.

### Setting Up the Template

Open the configuration file and update the `Default` template inside both `$EmailCampaignDNSTemplates` and `$EmailGatewayDNSTemplates`. Replace the commented-out example records with CNAME records pointing to your master sender domain.

Here is the recommended template configuration:

```php
'Default' => [
    $Subdomain.'._SenderDomain_' => ['CNAME', 'mailinfra.example.com'],
    'key1._domainkey.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'key1._domainkey.mailinfra.example.com'],
    'key1._domainkey._SenderDomain_' => ['CNAME', 'key1._domainkey.mailinfra.example.com'],
    '_dmarc.'.$Subdomain.'._SenderDomain_' => ['CNAME', '_dmarc.mailinfra.example.com'],
    '_dmarc._SenderDomain_' => ['CNAME', '_dmarc.mailinfra.example.com'],
    'track.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'track.mailinfra.example.com'],
    '_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_' => ['TXT', '_SenderDomainHash_'],
],
```

::: warning
Replace `mailinfra.example.com` with your actual master sender domain in every CNAME value. The template above is an example — your values must match the domain where you configured the real SPF, DKIM, and DMARC records.
:::

### Understanding Each Template Record

The following table explains every record in the template and what it does:

| Template Record | Type | Points To | Purpose |
|---|---|---|---|
| `$Subdomain.'._SenderDomain_'` | CNAME | `mailinfra.example.com` | **MFROM / Return-Path.** Routes the envelope sender (bounce handling) subdomain to your master sender domain. This is where SPF is validated. |
| `'key1._domainkey.'.$Subdomain.'._SenderDomain_'` | CNAME | `key1._domainkey.mailinfra.example.com` | **DKIM (subdomain level).** Points the DKIM selector on the MFROM subdomain to the DKIM public key on the master domain. |
| `'key1._domainkey._SenderDomain_'` | CNAME | `key1._domainkey.mailinfra.example.com` | **DKIM (root sender domain level).** Points the DKIM selector on the user's root sender domain to the DKIM public key on the master domain. Covers DKIM lookups at the root domain level. |
| `'_dmarc.'.$Subdomain.'._SenderDomain_'` | CNAME | `_dmarc.mailinfra.example.com` | **DMARC (subdomain level).** Points the DMARC policy record on the MFROM subdomain to the master domain's DMARC policy. |
| `'_dmarc._SenderDomain_'` | CNAME | `_dmarc.mailinfra.example.com` | **DMARC (root sender domain level).** Points the DMARC policy on the user's root sender domain to the master domain's DMARC policy. Covers DMARC lookups at the root domain level. |
| `'track.'.$Subdomain.'._SenderDomain_'` | CNAME | `track.mailinfra.example.com` | **Link and open tracking.** Routes the tracking subdomain to your tracking server (or Octeth Link Proxy Add-On). |
| `'_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_'` | TXT | `_SenderDomainHash_` | **Domain ownership verification.** A unique random TXT record that proves the user controls the domain. Octeth generates a random hostname and a hash value for each sender domain. |

### How Placeholders Work

The template uses three placeholders that Octeth replaces with actual values when generating DNS records for a user's sender domain:

| Placeholder | Replaced With | Example |
|---|---|---|
| `_SenderDomain_` | The sender domain the user registered. | `newsletter.example.com` |
| `_SenderDomainHash_` | A unique Base64-encoded hash derived from the domain name. Used for ownership verification. | `dG9rZW4xMjM0NTY3ODk=` |
| `_SenderDomainRandom_` | A random 10-character string. Used for unique TXT record hostnames. | `a8f3k2m9x1` |

The `$Subdomain` variable comes from the global configuration (default: `sl`) and represents the prefix added to user sender domains for the MFROM address.

### Example: Generated DNS Records

When a user creates the sender domain `newsletter.example.com` and the default subdomain is `sl`, Octeth generates the following DNS records from the template above:

| Host | Type | Value |
|---|---|---|
| `sl.newsletter.example.com` | CNAME | `mailinfra.example.com` |
| `key1._domainkey.sl.newsletter.example.com` | CNAME | `key1._domainkey.mailinfra.example.com` |
| `key1._domainkey.newsletter.example.com` | CNAME | `key1._domainkey.mailinfra.example.com` |
| `_dmarc.sl.newsletter.example.com` | CNAME | `_dmarc.mailinfra.example.com` |
| `_dmarc.newsletter.example.com` | CNAME | `_dmarc.mailinfra.example.com` |
| `track.sl.newsletter.example.com` | CNAME | `track.mailinfra.example.com` |
| `a8f3k2m9x1.sl.newsletter.example.com` | TXT | `dG9rZW4xMjM0NTY3ODk=` |

The user adds these records at their domain registrar. Notice that the user only deals with simple CNAME records — they do not need to configure SPF, DKIM, or DMARC themselves. All authentication is inherited from the master sender domain through the CNAME chain.

### Why CNAME Records Are Used

Using CNAME records instead of direct TXT records for SPF, DKIM, and DMARC provides centralized control:

- **Single point of update** — When you rotate a DKIM key, update an SPF IP range, or change a DMARC policy, you update it once on the master sender domain. All user domains that CNAME to it automatically pick up the change.
- **No user error** — Users cannot misconfigure SPF or DMARC values because they never type them. They only create CNAME records pointing to your infrastructure.
- **Scalability** — Whether you have 10 or 10,000 sender domains, they all inherit from the same master configuration.

### Why Both Subdomain and Root Domain Records

You may notice that the template includes records at both the subdomain level (e.g., `key1._domainkey.sl.newsletter.example.com`) and the root sender domain level (e.g., `key1._domainkey.newsletter.example.com`). This is intentional:

- **Subdomain-level records** cover the MFROM (return-path) domain, which includes the `sl` prefix (e.g., `sl.newsletter.example.com`).
- **Root-level records** cover the visible "From" domain that the recipient sees (e.g., `newsletter.example.com`).

DMARC alignment requires that the authentication domain matches the "From" domain. By including records at both levels, you ensure authentication passes regardless of whether the receiving server checks the MFROM subdomain or the visible "From" domain.

### Configuring the Full File

Here is a complete example of the `$EmailCampaignDNSTemplates` function configured with the master sender domain strategy:

```php
$EmailCampaignDNSTemplates = function($AppDomain, $Subdomain = '', $TrackPrefix = '') {
    $Template = [
        'Default' => [
            $Subdomain.'._SenderDomain_' => ['CNAME', 'mailinfra.example.com'],
            'key1._domainkey.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'key1._domainkey.mailinfra.example.com'],
            'key1._domainkey._SenderDomain_' => ['CNAME', 'key1._domainkey.mailinfra.example.com'],
            '_dmarc.'.$Subdomain.'._SenderDomain_' => ['CNAME', '_dmarc.mailinfra.example.com'],
            '_dmarc._SenderDomain_' => ['CNAME', '_dmarc.mailinfra.example.com'],
            'track.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'track.mailinfra.example.com'],
            '_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_' => ['TXT', '_SenderDomainHash_'],
        ],
    ];

    return $Template;
};
```

Apply the same configuration to `$EmailGatewayDNSTemplates` (without the `$TrackPrefix` parameter):

```php
$EmailGatewayDNSTemplates = function ($AppDomain, $Subdomain = '') {
    $Template = [
        'Default' => [
            $Subdomain.'._SenderDomain_' => ['CNAME', 'mailinfra.example.com'],
            'key1._domainkey.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'key1._domainkey.mailinfra.example.com'],
            'key1._domainkey._SenderDomain_' => ['CNAME', 'key1._domainkey.mailinfra.example.com'],
            '_dmarc.'.$Subdomain.'._SenderDomain_' => ['CNAME', '_dmarc.mailinfra.example.com'],
            '_dmarc._SenderDomain_' => ['CNAME', '_dmarc.mailinfra.example.com'],
            'track.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'track.mailinfra.example.com'],
            '_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_' => ['TXT', '_SenderDomainHash_'],
        ],
    ];

    return $Template;
};
```

### Global Settings

The default subdomain prefix, tracking prefix, and merge character are configured in `.oempro_env`:

| Variable | Default | Description |
|---|---|---|
| `EMAILCAMPAIGN_DNS_SUBDOMAIN` | `sl` | Subdomain prefix for the MFROM address (e.g., `sl.example.com`). |
| `EMAILCAMPAIGN_DNS_TRACK_PREFIX` | `track` | Prefix for tracking subdomains (e.g., `track-sl.example.com`). |
| `EMAILCAMPAIGN_DNS_TRACK_MERGE` | `-` | Character joining the tracking prefix and subdomain. |
| `EMAILGATEWAY_DNS_SUBDOMAIN` | `sl` | Subdomain prefix for Email Gateway domains. |

::: danger
After modifying the DNS template configuration file, restart the application container for changes to take effect. Changes only affect **newly created** sender domains — existing domains retain their original DNS records.
:::

## User Sender Domain Setup

Once the administrator has completed the infrastructure configuration, users can set up their sender domains. The process is straightforward because all the complexity is handled by the DNS template.

### Creating a Sender Domain

1. Log in to your Octeth user account.
2. Navigate to **Settings** > **Sender Domains**.
3. Click **Setup a New Sender Domain**.
4. Enter your domain name (e.g., `newsletter.example.com`).
5. Click **Create Sender Domain**.

[[SCREENSHOT: Create Sender Domain page showing the domain name input field and the Create Sender Domain button]]

After creation, Octeth generates the required DNS records based on the template configured by the administrator. The domain status is set to **Approval Pending** until DNS verification is completed.

### Adding DNS Records

1. On the sender domain edit page, review the list of required DNS records.
2. Log in to your domain registrar or DNS hosting provider.
3. For each record, create a new DNS entry matching the host, type, and value shown in Octeth.
4. Save your changes at the registrar.

[[SCREENSHOT: Sender domain edit page showing the DNS Records section with a list of CNAME and TXT records, each with a host, type, and value column]]

::: tip
Use the **Copy** link on the DNS Records section to copy all records to your clipboard. This makes it easy to paste them into your registrar's DNS management panel.
:::

Most of the records will be CNAME records pointing to the administrator's master sender domain. Users do not need to understand SPF, DKIM, or DMARC — they simply add the CNAME records as instructed.

### Verifying DNS Records

1. Wait for DNS propagation (typically a few minutes, but can take up to 48 hours).
2. Return to the sender domain edit page in Octeth.
3. Click **Verify DNS Records**.

Octeth checks each record against the expected values. When all records pass, the domain status changes to **Enabled** and is ready for sending.

[[SCREENSHOT: Sender domain edit page showing all DNS records with green checkmark verification status and the domain status showing Enabled]]

### Using the Sender Domain

Once the domain is enabled, it appears in the campaign creation form:

1. Create a new email campaign.
2. In the **From Email** field, type the local part (e.g., `newsletter`).
3. Select your verified sender domain from the dropdown (e.g., `@newsletter.example.com`).
4. Complete and send the campaign.

All outgoing emails will automatically use the proper SPF, DKIM, and DMARC configuration inherited from the master sender domain through the CNAME records.

## How It All Comes Together

Here is the complete flow from initial setup to a fully authenticated email being delivered:

### Administrator Setup (One-Time)

1. **Set up the master sender domain** — Configure A, MX, SPF, DKIM, and DMARC records on your infrastructure domain (e.g., `mailinfra.example.com`).
2. **Configure the delivery server** — Create a delivery server in Octeth with SMTP credentials pointing to your mail server, and set the Mail From Domain to your master sender domain.
3. **Configure the DNS template** — Edit `config/global/sender_domain_dns.php` to generate CNAME records pointing to the master sender domain.
4. **Assign delivery server to user groups** — In user group settings, select the delivery server for each email channel.
5. **Enable sender domain management** — In user group preferences, check **Enable sender domain management** to enforce compliance.
6. **Select the DNS template** — In user group email delivery settings, select the configured DNS template.

### User Setup (Per Domain)

7. **Create a sender domain** — The user creates a sender domain (e.g., `newsletter.example.com`) in **Settings** > **Sender Domains**.
8. **Add CNAME records** — The user adds the generated CNAME records at their domain registrar.
9. **Verify DNS records** — The user clicks **Verify DNS Records** in Octeth. Once all records pass, the domain is enabled.

### Email Delivery (Automatic)

10. **User sends a campaign** — The user selects their verified sender domain and sends a campaign.
11. **Octeth builds the email** — The system sets the MFROM (return-path) to the subdomain of the user's sender domain (e.g., `sl.newsletter.example.com`), which CNAMEs to the master sender domain.
12. **Mail server sends the email** — The SMTP server signs the email with DKIM using the private key for the master sender domain.
13. **Receiving server checks authentication**:
    - **SPF check** — Looks up the SPF record for `sl.newsletter.example.com`, which CNAMEs to `mailinfra.example.com`, which has an SPF record authorizing the sending IP. **Pass.**
    - **DKIM check** — Looks up the DKIM key at `key1._domainkey.newsletter.example.com`, which CNAMEs to `key1._domainkey.mailinfra.example.com`. Verifies the signature. **Pass.**
    - **DMARC check** — Looks up `_dmarc.newsletter.example.com`, which CNAMEs to `_dmarc.mailinfra.example.com`. Checks alignment between the "From" domain and the authenticated domain. **Pass.**
14. **Email delivered to inbox** — All three checks pass, and the email lands in the recipient's inbox.

## Verifying Compliance

After completing the setup, verify that your emails pass all authentication checks.

### Send a Test Email

1. Create a test campaign using a verified sender domain.
2. Send it to an email address you control (preferably a Gmail, Yahoo, or Outlook account).
3. Open the received email and inspect the email headers.

### Check Email Headers

In most email clients, you can view the full email headers (sometimes called "original message" or "message source"). Look for these header lines:

| Header | What to Look For |
|---|---|
| `Authentication-Results` | Should show `spf=pass`, `dkim=pass`, and `dmarc=pass`. |
| `Received-SPF` | Should show `pass`. |
| `DKIM-Signature` | Should be present with the correct selector (e.g., `s=key1`). |

In Gmail, click the three dots menu on the email, select **Show original**, and look for the authentication results near the top.

### Use External Verification Tools

Several free online tools can help you verify your email authentication setup:

- **Mail-Tester** — Send an email to the address provided and get a detailed score with SPF, DKIM, and DMARC results.
- **MXToolbox** — Look up SPF, DKIM, and DMARC records for any domain. Use their SuperTool to run all checks at once.
- **Google Admin Toolbox** — Check DNS records and verify authentication configuration.
- **DMARC Analyzer** — Monitor DMARC reports and track authentication results over time.

::: tip
After your initial setup, send test emails to multiple providers (Gmail, Yahoo, Outlook, Apple Mail) to confirm that authentication passes consistently across all of them.
:::

### Check DMARC Reports

If you included a `rua` email address in your DMARC record (recommended), you will start receiving aggregate reports from receiving mail servers. These XML reports show:

- How many emails passed and failed SPF, DKIM, and DMARC
- Which IP addresses are sending email for your domain
- Whether any unauthorized servers are sending email using your domain

Use a DMARC report analyzer tool to parse these XML files into readable dashboards.

## Tips and Best Practices

::: tip Start with DMARC Policy Set to None
Begin with `p=none` in your DMARC record. This monitors authentication results without affecting delivery. Once you confirm that all legitimate emails pass, gradually move to `p=quarantine` and eventually `p=reject` for maximum protection.
:::

::: tip Use Relaxed DKIM and SPF Alignment
Set `adkim=r` and `aspf=r` in your DMARC record for relaxed alignment. This allows subdomain alignment, which is necessary when the MFROM domain (e.g., `sl.newsletter.example.com`) is a subdomain of the visible "From" domain (e.g., `newsletter.example.com`). Strict alignment (`adkim=s`, `aspf=s`) requires an exact domain match and may cause failures with the subdomain-based MFROM structure.
:::

::: tip Rotate DKIM Keys Periodically
Rotate your DKIM keys every 6 to 12 months as a security best practice. With the master sender domain strategy, you only need to update the DKIM records on the master domain — all user sender domains inherit the change automatically.
:::

::: tip Monitor DMARC Reports Regularly
Set up automated processing for DMARC aggregate reports. This helps you detect unauthorized use of your domain, identify misconfigured servers, and track your authentication pass rates over time.
:::

::: tip Keep SPF Records Under 10 DNS Lookups
The SPF specification limits the number of DNS lookups to 10. If your SPF record includes multiple third-party services, you may hit this limit. Use IP ranges (`ip4:`) instead of `include:` where possible to reduce lookups.
:::

::: tip Enforce Sender Domain Management for All User Groups
Always enable **sender domain management** in user group settings for production environments. This ensures that no user can send email without a verified sender domain, guaranteeing consistent authentication compliance across your entire installation.
:::

## Troubleshooting

### SPF Check Fails

- **Verify the SPF record exists** on your master sender domain. Use `dig TXT mailinfra.example.com` or an online DNS lookup tool to check.
- **Confirm the sending IP is authorized** in the SPF record. The IP address of the server sending the email must be included in the `ip4:` or `include:` mechanisms.
- **Check for too many DNS lookups.** SPF is limited to 10 DNS lookups. Use `mxtoolbox.com/spf.aspx` to count your lookups.
- **Verify the CNAME chain.** The user's sender domain MFROM subdomain must CNAME to the master domain where the SPF record is published.

### DKIM Check Fails

- **Verify the DKIM public key** is published at the correct location (e.g., `key1._domainkey.mailinfra.example.com`).
- **Check the DKIM selector.** The selector in the email's `DKIM-Signature` header (the `s=` tag) must match the selector in DNS (e.g., `key1`).
- **Confirm the private and public keys match.** If you recently rotated keys, ensure the mail server is using the new private key and DNS has the corresponding new public key.
- **Check the CNAME records.** The user's `key1._domainkey.newsletter.example.com` must CNAME to `key1._domainkey.mailinfra.example.com`.

### DMARC Check Fails

- **Verify the DMARC record exists** at `_dmarc.mailinfra.example.com`.
- **Check alignment mode.** If you use `adkim=s` (strict), the DKIM signing domain must exactly match the "From" domain. Switch to `adkim=r` (relaxed) to allow subdomain alignment.
- **Ensure at least one protocol passes with alignment.** DMARC requires either SPF or DKIM to pass **and** align with the "From" domain.
- **Check the user's CNAME records.** Both `_dmarc.newsletter.example.com` and `_dmarc.sl.newsletter.example.com` should CNAME to `_dmarc.mailinfra.example.com`.

### DNS Verification Fails in Octeth

- **Wait for propagation.** DNS changes can take up to 48 hours to propagate. Try again later.
- **Check record types.** Ensure you created CNAME records, not A or TXT records (except for the verification TXT record).
- **Check your registrar's formatting.** Some registrars automatically append the root domain to the host. If the host should be `sl.newsletter.example.com` and your registrar appends `.example.com`, you may need to enter just `sl.newsletter` instead.
- **Verify exact values.** Copy the values directly from Octeth rather than typing them manually to avoid typos.

### Emails Pass Authentication but Still Land in Spam

Authentication is necessary but not sufficient for inbox placement. Other factors include:

- **Sender reputation** — New domains need time to build reputation. Start with low volumes and gradually increase.
- **Email content** — Spam filters analyze content for spammy patterns, excessive links, or misleading subject lines.
- **Engagement rates** — Low open rates and high complaint rates signal poor quality to mailbox providers.
- **List hygiene** — Sending to invalid or unengaged addresses hurts your reputation. Use [Bounce Processing](./bounce-processing) and [Suppression Lists](./suppression-lists) to keep your lists clean.

## Related Features

- **[Sender Domains](../sender-domains)** — Complete guide to creating, verifying, and configuring sender domains.
- **[Email Sending](./email-sending)** — Delivery server setup, user group configuration, DNS templates, and send engine management.
- **[Bounce Processing](./bounce-processing)** — How bounced emails are processed through the MFROM domain.
- **[Email Tracking](./email-tracking)** — Link click and open tracking through the tracking subdomain.
- **[Suppression Lists](./suppression-lists)** — Managing suppressed email addresses for list hygiene.
- **[Unsubscriptions](./unsubscriptions)** — Unsubscribe header configuration and compliance.
