---
layout: doc
---

# Sender Domains

A sender domain is a domain (or subdomain) that you register in Octeth for sending emails. Before you can send any email campaign, you need at least one verified sender domain. Sender domains enable email authentication through DNS records such as SPF, DKIM, and DMARC, which help receiving mail servers confirm that your emails are legitimate.

This article covers how to create and verify sender domains, configure domain options like link and open tracking, customize subdomain settings, and manage default sender domains. It includes guidance for both users and administrators.

## Why Sender Domains Matter

When you send an email, the recipient's mail server checks whether the sending domain is authorized to send on your behalf. This is done through DNS-based authentication mechanisms:

- **SPF (Sender Policy Framework)** — Specifies which mail servers are allowed to send email for your domain.
- **DKIM (DomainKeys Identified Mail)** — Adds a digital signature to your emails, proving they have not been altered in transit.
- **DMARC (Domain-based Message Authentication, Reporting & Conformance)** — Defines a policy for how receiving servers should handle emails that fail SPF or DKIM checks.

Without proper sender domain configuration, your emails are more likely to be rejected or flagged as spam.

::: tip Use a Subdomain for Sending
It is recommended to use a subdomain such as `mail.yourdomain.com` rather than your root domain `yourdomain.com`. This isolates your email sending reputation from your main domain, protecting your website and other services if deliverability issues arise.
:::

## Key Concepts

Before getting started, here are the key terms used throughout this article:

| Term | Description |
|---|---|
| **Sender Domain** | The domain registered in Octeth for sending emails (e.g., `mail.example.com`). |
| **From Address** | The email address recipients see (e.g., `newsletter@mail.example.com`). The domain part comes from your sender domain. |
| **MFROM Domain** | The return-path domain used for bounce handling. Constructed by combining the subdomain prefix with your sender domain (e.g., `sl.mail.example.com`). |
| **Tracking Domain** | The domain used for link click and open tracking URLs (e.g., `track-sl.mail.example.com`). |
| **Default Sender Domain** | A fallback domain configured by the administrator for a user group. Used when no custom sender domain is selected. |

## Browsing Sender Domains

To view your sender domains:

1. Navigate to **Settings** from the main menu.
2. Click **Sender Domains** in the sidebar.

[[SCREENSHOT: Sender Domains list page showing the table with domain names, status indicators, and action links (Edit, Verify), plus the Select All/None, Delete, and Setup a New Sender Domain links above the table]]

The page displays all your sender domains in a table with the following columns:

| Column | Description |
|---|---|
| **Sender Domain** | The domain name. Click to open the edit page. |
| **Status** | The current verification and availability status of the domain. |
| **Options** | Action links: **Edit** and **Verify** (when domain is pending verification). |

Above the table, the following actions are available:

- **Select All** / **Select None** — Quickly select or deselect all domains.
- **Delete** — Delete the selected domains.
- **Setup a New Sender Domain** — Create a new sender domain.

If you have not created any sender domains yet, a message prompts you to set up your first one.

::: info
If the administrator has configured a default sender domain for your user group, it appears in the list labeled **Default Domain**. Default domains cannot be edited or deleted by users.
:::

### Domain Status Indicators

Each sender domain has a status that determines whether it can be used for sending:

| Status | Icon | Description |
|---|---|---|
| **ENABLED** | Green checkmark | The domain is verified and ready for sending emails. |
| **APPROVAL PENDING** | Yellow hourglass | DNS records have not been verified yet. The domain cannot be used for sending. |
| **DISABLED** | Red exclamation | The domain has been disabled and cannot be used for sending. |
| **SUSPENDED** | Red exclamation | The domain has been suspended and cannot be used for sending. |
| **DELETED** | Grey trash icon | The domain has been soft-deleted and cannot be used for sending. |

## Creating a Sender Domain

To create a new sender domain:

1. Navigate to **Settings** > **Sender Domains**.
2. Click **Setup a New Sender Domain**.
3. Enter your domain name in the **Sender Domain** field (e.g., `mail.example.com`).
4. Click **Create Sender Domain**.

[[SCREENSHOT: Create Sender Domain page showing the Sender Domain text input field, the CREATE SENDER DOMAIN button, and the sidebar help text explaining that DNS records will be generated]]

After creation, Octeth generates the required DNS records and redirects you to the edit page where you can view and verify them. The domain status is initially set to **Approval Pending** until DNS verification is completed.

::: info No DNS Templates Configured
If the administrator has not configured any DNS record templates for your user group, the domain is automatically set to **Enabled** immediately after creation — no DNS verification is required. This is common in development or testing environments.
:::

::: warning
The domain name `localhost` cannot be used as a sender domain. Your administrator may also set a limit on the number of sender domains you can create. If you reach the limit, a message informs you that no more domains can be added. Contact your administrator to increase the limit.
:::

## Understanding DNS Records

When you create a sender domain, Octeth generates a set of DNS records that you must add to your domain's DNS settings at your domain registrar (or DNS hosting provider). These records authenticate your emails and enable tracking features.

### Types of DNS Records

The specific records generated depend on the DNS template configured by your administrator. A typical set of records includes:

| Record Type | Host Example | Purpose |
|---|---|---|
| **CNAME** | `sl.mail.example.com` | Routes outgoing email through the delivery infrastructure (MFROM / return-path). |
| **CNAME** | `key1._domainkey.mail.example.com` | DKIM signing — allows receiving servers to verify email signatures. |
| **CNAME** | `_dmarc.mail.example.com` | DMARC policy — tells receiving servers how to handle authentication failures. |
| **CNAME** | `track-sl.mail.example.com` | Tracking domain — used for link click and open tracking URLs. |
| **TXT** | `<random>.mail.example.com` | Domain ownership verification — a unique token proving you control the domain. |

::: info
The actual record hosts and values are unique to your installation and domain. The examples above are illustrative. Always use the exact records shown on your domain's edit page in Octeth.
:::

### Adding DNS Records at Your Registrar

The process for adding DNS records varies by registrar, but the general steps are:

1. Log in to your domain registrar or DNS hosting provider.
2. Navigate to the DNS management section for your domain.
3. For each record shown in Octeth, create a new DNS record with the matching type, host, and value.
4. Save your changes.

::: tip
Use the **Copy** link next to the DNS Records heading on the edit page to copy all records to your clipboard in a plain text format. This makes it easy to paste them into your registrar's DNS management panel.
:::

::: warning
DNS changes can take anywhere from a few minutes to 48 hours to propagate across the internet. If verification fails immediately after adding records, wait and try again later.
:::

## Verifying DNS Records

After adding the DNS records at your registrar, you need to verify them in Octeth:

1. Navigate to **Settings** > **Sender Domains**.
2. Click the domain name (or click **Edit**) to open the edit page.
3. Scroll down to the **DNS Records** section.
4. Click **Verify DNS Records**.

[[SCREENSHOT: Edit Sender Domain page showing the DNS Records section with a mix of verified (green checkmark), error (red warning), and pending (grey clock) status icons next to each DNS record entry, plus the VERIFY DNS RECORDS button at the bottom]]

Octeth queries the DNS servers and checks each record against the expected values. Each record displays a status icon:

| Icon | Meaning |
|---|---|
| Green checkmark | The record is verified and correct. |
| Red warning triangle | The record was not found or the value does not match. |
| Grey clock | The record has not been checked yet. |

When all records pass verification, the domain status changes to **Enabled** and the domain becomes available for sending emails.

::: tip
If some records show errors, double-check the record type, host, and value at your registrar. Common issues include missing trailing dots in CNAME values, incorrect record types (e.g., using A instead of CNAME), or typos in the record value.
:::

### Automatic Background Verification

Octeth periodically re-verifies sender domains in the background. This ensures that domains remain properly configured over time. If a domain fails verification three consecutive times, its status reverts to **Approval Pending** and it can no longer be used for sending until the DNS records are corrected and re-verified.

## Domain Options

The edit page for a sender domain includes several options that control how emails sent through that domain are handled.

[[SCREENSHOT: Edit Sender Domain page showing the Options section with three checkboxes: Track link click activities, Track email open activities, and Insert unsubscription link, along with their descriptions]]

### Link Tracking

When **Track link click activities inside emails** is checked, Octeth replaces all links in your outgoing emails with tracking URLs. This allows you to see which links each recipient clicked and measure click-through rates in your campaign reports.

Uncheck this option if you do not want link tracking or prefer to keep the original URLs in your emails.

### Open Tracking

When **Track email open activities in HTML emails** is checked, Octeth inserts an invisible tracking pixel into your HTML emails. When a recipient opens the email and loads images, the open is recorded and visible in your campaign reports.

Uncheck this option if you do not want to track email opens. This setting only affects HTML emails — plain text emails do not support open tracking.

### Unsubscribe Link

When **Insert unsubscription link into outgoing emails** is checked, Octeth adds a `List-Unsubscribe` header to your outgoing emails. This header allows email clients (such as Gmail, Outlook, and Apple Mail) to display a built-in unsubscribe button, making it easy for recipients to opt out.

::: tip
Enabling the unsubscribe link header is recommended. Major email providers like Gmail and Yahoo require this header for bulk senders. Having it improves deliverability and compliance.
:::

### Saving Options

After changing any options, click **Save Settings** to apply your changes. A confirmation message appears indicating the settings have been updated.

## Custom Subdomain Settings

Below the domain options, the edit page includes settings for customizing the subdomain prefix and tracking domain structure. These settings affect the MFROM (return-path) address and tracking URLs used by the domain.

[[SCREENSHOT: Edit Sender Domain page showing the Custom Subdomain Settings section with the Subdomain field, Use separate tracking subdomain checkbox, Tracking Prefix field, and the yellow warning about DNS regeneration]]

### Subdomain

The **Subdomain** field lets you override the global subdomain prefix for this specific domain. The global default is shown as placeholder text in the field (typically `sl`).

- **How it works:** The subdomain is prepended to your sender domain to form the MFROM address. For example, if your sender domain is `mail.example.com` and the subdomain is `sl`, the MFROM address becomes `sl.mail.example.com`.
- **When to customize:** Use a custom subdomain if you want different domains to use different prefixes. For instance, you might use `newsletter` for one domain and `transactional` for another, resulting in `newsletter.mail.example.com` and `transactional.mail.example.com`.
- **Default behavior:** Leave the field empty to use the global default subdomain.

The page displays a live preview of the resulting MFROM address as you type.

**Validation rules:** Only letters, numbers, and hyphens are allowed. Maximum 32 characters. No leading or trailing hyphens.

### Tracking Subdomain

The **Use separate tracking subdomain** checkbox controls how tracking URLs are structured:

- **Checked (default):** Tracking URLs use a dedicated subdomain that combines the tracking prefix with the subdomain. For example: `track-sl.mail.example.com`. This requires an additional DNS CNAME record for the tracking subdomain.
- **Unchecked:** Tracking URLs use the same MFROM domain (e.g., `sl.mail.example.com`). This simplifies DNS setup by removing the need for a separate tracking record, but reduces the separation between bounce handling and tracking.

### Tracking Prefix

The **Tracking Prefix** field is only visible when **Use separate tracking subdomain** is checked. It lets you override the global tracking prefix (typically `track`).

- **How it works:** The tracking prefix is combined with the subdomain to form the tracking domain. For example, with prefix `track`, subdomain `sl`, and domain `mail.example.com`, the tracking domain becomes `track-sl.mail.example.com`.
- **Default behavior:** Leave the field empty to use the global default tracking prefix.

The page displays a live preview of the resulting tracking domain as you type.

**Validation rules:** Same as the subdomain field — letters, numbers, and hyphens only, maximum 32 characters, no leading or trailing hyphens.

::: danger
Changing subdomain or tracking settings regenerates all DNS records for the domain and resets the verification status to **Approval Pending**. You must update the DNS records at your registrar and re-verify the domain before it can be used for sending again.
:::

## Using Sender Domains in Campaigns

When sender domain management is enabled, the campaign creation form changes how you enter the **From Email** address:

- Instead of a single free-text email field, the From Email is split into two parts: a **username** text field and a **sender domain dropdown**.
- The dropdown lists all your sender domains that have **Enabled** status.
- Select the domain you want to send from, and type the local part (the portion before the `@`) in the text field.

For example, to send as `newsletter@mail.example.com`, type `newsletter` in the text field and select `@mail.example.com` from the dropdown.

[[SCREENSHOT: Campaign creation form showing the From Name field, the From Email split input with a text field for the username portion and a dropdown selector showing available sender domains prefixed with @]]

If you have not created any sender domains yet, a warning message appears with a link to the Sender Domain Management page.

::: warning
Only domains with **Enabled** status appear in the campaign sender domain dropdown. If your domain is still in **Approval Pending** status, complete the DNS verification process first.
:::

## Default Sender Domain

A default sender domain is a fallback domain configured by the administrator for a user group. It allows users to send emails even if they have not created their own sender domains.

### How It Works

- The default sender domain appears in the sender domains list labeled as **Default Domain**.
- It is always shown with **Enabled** status and cannot be edited, verified, or deleted by users.
- If a user has not selected a custom sender domain for a campaign email, the system automatically uses the default sender domain.
- Default sender domains have link tracking and open tracking enabled by default, with the unsubscribe link header disabled.

### Monthly Sending Limit

The administrator can set a monthly sending limit for the default sender domain. This limit restricts the total number of emails a user can send through the default domain within a rolling 30-day window.

- Once the limit is reached, the user cannot send additional emails using the default sender domain until the rolling window resets.
- This limit only applies to the default sender domain — custom sender domains created by the user are not affected.
- The default monthly limit is **200 emails per 30 days** unless the administrator sets a different value.

::: info
If you frequently reach the default sender domain limit, consider creating your own custom sender domain. Custom sender domains do not have this monthly restriction.
:::

## Deleting Sender Domains

To delete one or more sender domains:

1. Navigate to **Settings** > **Sender Domains**.
2. Select the domains you want to delete using the checkboxes.
3. Click **Delete**.
4. Confirm the deletion when prompted.

::: danger
Deleted sender domains cannot be used for sending emails. If a campaign was configured to use a deleted domain, you must select a different sender domain before sending. The default sender domain (if configured) cannot be deleted.
:::

## Administrator Configuration

Administrators control sender domain behavior through two layers: **user group settings** (configured in the admin UI) and **system-level configuration** (configured in server-side files). This section covers both.

### Enabling Sender Domain Management

To allow users in a group to manage their own sender domains:

1. Navigate to the admin area and edit the user group.
2. In the **Preferences** section, check **Enable sender domain management**.
3. Save the user group.

When this option is enabled:
- Users can create, edit, verify, and delete their own sender domains.
- The campaign creation form displays a sender domain dropdown instead of a free-text From Email field.
- Users are required to have at least one verified sender domain before they can send campaigns.

When this option is disabled:
- Users cannot access the Sender Domains management page.
- The campaign creation form uses a standard free-text From Email field.

[[SCREENSHOT: Admin user group edit page showing the Preferences section with the "Enable sender domain management" checkbox and its description]]

### Setting the Sender Domain Limit

Administrators can limit the number of sender domains a user can create:

1. In the user group edit page, scroll to the **Limitations** section.
2. Enter a number in the **Sender Domains** field.
3. Save the user group.

Leave the field empty or set it to `0` for unlimited sender domains.

### Selecting the DNS Template

Each user group can use a different DNS record template, which determines what DNS records are generated when users create sender domains:

1. In the user group edit page, scroll to the **Email Delivery** section.
2. Select a template from the **Email Campaign DNS Template** dropdown.
3. Save the user group.

[[SCREENSHOT: Admin user group edit page showing the Email Delivery section with the Email Campaign DNS Template dropdown selector]]

The available templates are defined in the system configuration file (see [Configuring DNS Record Templates](#configuring-dns-record-templates) below). The **Default** template is used when no specific template is selected.

::: info
If the selected DNS template is empty (has no records defined), sender domains are automatically set to **Enabled** immediately upon creation — no DNS verification step is required. This is common in development or testing environments where you do not need real DNS authentication.
:::

### Configuring the Default Sender Domain

To configure a default sender domain for a user group:

1. In the user group edit page, check **Activate default sender domain** in the **Preferences** section.
2. A new section appears below. Enter the domain name in the **Default Sender Domain** field (e.g., `example.com`).
3. Enter the monthly sending limit in the **Monthly Limit** field (default: `200`).
4. Save the user group.

[[SCREENSHOT: Admin user group edit page showing the Default Sender Domain section with the Activate default sender domain checkbox, Default Sender Domain text field, and Monthly Limit field]]

The global subdomain prefix (e.g., `sl`) is automatically prepended to the default sender domain. For example, if you enter `example.com`, the resulting MFROM domain becomes `sl.example.com`. Users can override this prefix per their own custom sender domains using custom subdomain settings.

The default sender domain:

- Does **not** go through DNS verification within Octeth. You must ensure the domain and its DNS records are properly configured on your mail server before setting it as a default.
- Is a virtual domain — it is not stored in the database. It is generated dynamically from the user group configuration.
- Always appears with **Enabled** status, with link tracking and open tracking enabled and the unsubscribe link header disabled.
- Has a monthly sending limit tracked per user over a rolling 30-day window using Redis.

::: warning
Ensure the default sender domain's DNS records (SPF, DKIM, DMARC) are properly configured on your mail server before enabling it. Since Octeth does not verify the default domain's DNS records, misconfigured records will cause deliverability issues for all users in the group.
:::

### Configuring DNS Record Templates

DNS record templates determine which DNS records users must set up when they create a sender domain. Templates are defined in the server-side configuration file:

```
config/global/sender_domain_dns.php
```

This file contains two template functions — one for email campaigns and one for the email gateway. Each function returns an associative array of named templates. The **Default** template is used unless a different template is assigned to a user group.

#### Template Structure

Each template is an associative array where:
- The **key** is the DNS record hostname (with placeholders).
- The **value** is an array containing the record type and the record value.

Three placeholders are available for use in template keys and values:

| Placeholder | Replaced With |
|---|---|
| `_SenderDomain_` | The actual sender domain the user registered (e.g., `mail.example.com`). |
| `_SenderDomainHash_` | A unique Base64-encoded hash derived from the domain name. Used for ownership verification. |
| `_SenderDomainRandom_` | A random 10-character string. Used for unique TXT record hostnames. |

The template function also receives these parameters that can be used in record keys:

| Parameter | Description |
|---|---|
| `$Subdomain` | The global subdomain prefix (default: `sl`). |
| `$TrackPrefix` | The global tracking prefix (default: `track`). Only available in the email campaign template. |

#### Example: Configuring the Default Template

To enable DNS verification for sender domains, uncomment and customize the records in the `$EmailCampaignDNSTemplates` function. Here is an example with all five standard record types:

```php
$EmailCampaignDNSTemplates = function($AppDomain, $Subdomain = '', $TrackPrefix = '') {
    $Template = [
        'Default' => [
            $Subdomain.'._SenderDomain_' => ['CNAME', 'mailer.deliveryserver.example.com'],
            'key1._domainkey.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'key1._domainkey.mailer.deliveryserver.example.com'],
            '_DMARC.'.$Subdomain.'._SenderDomain_' => ['CNAME', '_DMARC.mailer.deliveryserver.example.com'],
            $TrackPrefix.'-'.$Subdomain.'._SenderDomain_' => ['CNAME', 'track.mailer.deliveryserver.example.com'],
            '_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_' => ['TXT', '_SenderDomainHash_'],
        ],
    ];

    return $Template;
};
```

When a user creates a sender domain `mail.example.com` with this template, Octeth generates the following DNS records (using the default subdomain `sl` and tracking prefix `track`):

| Host | Type | Value |
|---|---|---|
| `sl.mail.example.com` | CNAME | `mailer.deliveryserver.example.com` |
| `key1._domainkey.sl.mail.example.com` | CNAME | `key1._domainkey.mailer.deliveryserver.example.com` |
| `_DMARC.sl.mail.example.com` | CNAME | `_DMARC.mailer.deliveryserver.example.com` |
| `track-sl.mail.example.com` | CNAME | `track.mailer.deliveryserver.example.com` |
| `<random>.sl.mail.example.com` | TXT | `<unique-hash>` |

The CNAME values should point to your actual mail delivery server where SPF, DKIM, and DMARC are configured.

::: info
You must also configure the corresponding `$EmailGatewayDNSTemplates` function in the same file if you use the email gateway feature. The structure is identical, except the tracking prefix parameter is not available.
:::

#### Example: Creating Multiple Templates

You can define multiple templates for different delivery server configurations. Each template name becomes an option in the **Email Campaign DNS Template** dropdown in the admin user group settings:

```php
$EmailCampaignDNSTemplates = function($AppDomain, $Subdomain = '', $TrackPrefix = '') {
    $Template = [
        'Default' => [
            $Subdomain.'._SenderDomain_' => ['CNAME', 'mailer1.deliveryserver.example.com'],
            'key1._domainkey.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'key1._domainkey.mailer1.deliveryserver.example.com'],
            '_DMARC.'.$Subdomain.'._SenderDomain_' => ['CNAME', '_DMARC.mailer1.deliveryserver.example.com'],
            $TrackPrefix.'-'.$Subdomain.'._SenderDomain_' => ['CNAME', 'track.mailer1.deliveryserver.example.com'],
            '_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_' => ['TXT', '_SenderDomainHash_'],
        ],
        'EU Server' => [
            $Subdomain.'._SenderDomain_' => ['CNAME', 'mailer-eu.deliveryserver.example.com'],
            'key1._domainkey.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'key1._domainkey.mailer-eu.deliveryserver.example.com'],
            '_DMARC.'.$Subdomain.'._SenderDomain_' => ['CNAME', '_DMARC.mailer-eu.deliveryserver.example.com'],
            $TrackPrefix.'-'.$Subdomain.'._SenderDomain_' => ['CNAME', 'track.mailer-eu.deliveryserver.example.com'],
            '_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_' => ['TXT', '_SenderDomainHash_'],
        ],
    ];

    return $Template;
};
```

In this example, the admin can assign "Default" to one user group and "EU Server" to another, directing each group's emails through different delivery infrastructure.

#### Leaving Templates Empty

If you leave a template with an empty array:

```php
'Default' => [
    // No records defined
],
```

Sender domains created by users in groups using this template will have no DNS records to verify. The domain is set to **Enabled** immediately upon creation. This is useful for development, testing, or environments where DNS authentication is managed outside of Octeth.

::: danger
After modifying the DNS template configuration file, you must restart the application container for the changes to take effect. Changes only affect **newly created** sender domains. Existing domains retain the DNS records that were generated at the time of their creation.
:::

### Configuring Global Subdomain and Tracking Defaults

The global subdomain prefix, tracking prefix, and merge character can be configured either in the `.oempro_env` environment file or through the defaults in the configuration file. Environment variables take precedence over the config file defaults.

#### Environment Variables

Add these to your `.oempro_env` file to override the defaults:

| Variable | Default | Description |
|---|---|---|
| `EMAILCAMPAIGN_DNS_SUBDOMAIN` | `sl` | The subdomain prefix prepended to sender domains for the MFROM address. |
| `EMAILCAMPAIGN_DNS_TRACK_PREFIX` | `track` | The prefix used for tracking subdomains. |
| `EMAILCAMPAIGN_DNS_TRACK_MERGE` | `-` | The character used to join the tracking prefix and subdomain (e.g., `track` + `-` + `sl` = `track-sl`). |

For example, to change the default subdomain from `sl` to `mail`:

```ini
EMAILCAMPAIGN_DNS_SUBDOMAIN=mail
```

With this setting, the default MFROM address for a sender domain `example.com` becomes `mail.example.com` instead of `sl.example.com`.

::: info
These global defaults apply to all newly created sender domains. Users can override the subdomain and tracking prefix on a per-domain basis using the Custom Subdomain Settings on the domain edit page. Existing sender domains are not affected by changes to these environment variables.
:::

### Configuring DNS Lookup Servers

Octeth uses DNS lookup servers to verify sender domain records. The servers used for DNS queries are defined in:

```
config/global/const_OEMPRO_DNS_LOOKUP_SERVERS.php
```

The default configuration uses Cloudflare's public DNS:

```php
const OEMPRO_DNS_LOOKUP_SERVERS = ['1.1.1.1'];
```

To use different DNS servers (for example, Google's public DNS or your own internal DNS servers), edit this file:

```php
const OEMPRO_DNS_LOOKUP_SERVERS = ['8.8.8.8', '8.8.4.4'];
```

::: tip
If DNS verification consistently fails even though the records are correctly configured at the registrar, try changing the lookup servers. Different DNS resolvers may have different propagation times and caching behavior.
:::

### Summary of Admin Configuration Options

The following table provides a quick reference of all administrator-configurable settings related to sender domains:

| Setting | Location | Description |
|---|---|---|
| **Enable sender domain management** | User Group > Preferences | Allows users to create and manage their own sender domains. |
| **Sender Domains limit** | User Group > Limitations | Maximum number of sender domains a user can create. Empty or `0` = unlimited. |
| **Email Campaign DNS Template** | User Group > Email Delivery | Selects which DNS record template is used for the user group. |
| **Activate default sender domain** | User Group > Preferences | Enables a fallback sender domain for the user group. |
| **Default Sender Domain** | User Group > Preferences | The domain name used as the default (e.g., `example.com`). |
| **Monthly Limit** | User Group > Preferences | Maximum emails per user per 30-day rolling window via the default domain. |
| **DNS record templates** | `config/global/sender_domain_dns.php` | Defines the DNS records users must configure for their sender domains. |
| **Global subdomain prefix** | `.oempro_env` or config file | Default subdomain prefix for MFROM addresses (default: `sl`). |
| **Global tracking prefix** | `.oempro_env` or config file | Default tracking subdomain prefix (default: `track`). |
| **Global tracking merge character** | `.oempro_env` or config file | Character joining tracking prefix and subdomain (default: `-`). |
| **DNS lookup servers** | `config/global/const_OEMPRO_DNS_LOOKUP_SERVERS.php` | DNS servers used to verify sender domain records. |

## Tips and Best Practices

::: tip Use a Dedicated Subdomain
Always use a subdomain like `mail.example.com` or `send.example.com` for sending. This keeps your root domain's reputation separate from your email sending reputation. If deliverability issues occur, they affect only the subdomain.
:::

::: tip Add All DNS Records Before Verifying
Set up all the required DNS records at your registrar before clicking **Verify DNS Records** in Octeth. Partial setups will show errors for missing records, which can be confusing.
:::

::: tip Allow Time for DNS Propagation
DNS changes take time to propagate. If you just added records and verification fails, wait 30 minutes to an hour and try again. In some cases, full propagation can take up to 48 hours.
:::

::: tip Enable Both Tracking Options
For full campaign analytics, keep both **Link Tracking** and **Open Tracking** enabled. This gives you complete visibility into how recipients interact with your emails, including open rates and click-through rates.
:::

::: tip Keep Sender Domains Consistent
Use the same sender domain across your campaigns to build domain reputation over time. Frequently switching sender domains can confuse receiving mail servers and hurt deliverability.
:::

::: tip Enable the Unsubscribe Header
Major email providers like Gmail and Yahoo require bulk senders to include a `List-Unsubscribe` header. Enable the **Insert unsubscription link** option to stay compliant and improve inbox placement.
:::

## Troubleshooting

### DNS Verification Keeps Failing

- **Check the record values:** Compare the records at your registrar with the exact values shown in Octeth. Even a single extra character or missing character can cause failure.
- **Confirm the record type:** Make sure you created the correct record type (CNAME, TXT, etc.). A common mistake is creating an A record instead of a CNAME.
- **Wait for propagation:** DNS changes can take up to 48 hours to propagate. Try verifying again after waiting.
- **Check your registrar's formatting:** Some registrars automatically append the root domain to record hosts. If the host should be `sl.mail.example.com` and your registrar appends `.example.com`, you may need to enter just `sl.mail` instead.

### Domain Is Stuck in Approval Pending

All DNS records must pass verification for the domain status to change to **Enabled**. If even one record fails, the domain remains in **Approval Pending** status.

1. Open the domain's edit page and review each record's verification status.
2. Fix any records that show a red warning icon.
3. Click **Verify DNS Records** again.

If the domain was previously **Enabled** and reverted to **Approval Pending**, this means the background verification detected that DNS records are no longer valid. Check whether records were accidentally removed or changed at your registrar.

### Cannot Create More Sender Domains

Your administrator has set a limit on the number of sender domains you can create. Contact your administrator to request a higher limit. The current limit is configured in the user group settings.

### Sender Domain Not Appearing in Campaign Dropdown

Only sender domains with **Enabled** status appear in the campaign From Email dropdown. Verify that:

1. The domain's status is **Enabled** (not **Approval Pending**, **Disabled**, or **Suspended**).
2. The **Enable sender domain management** option is enabled for your user group.
3. You are looking at the correct account — sender domains are specific to each user.

### Changed Subdomain Settings and Domain Became Pending

Changing the subdomain, tracking subdomain, or tracking prefix settings regenerates all DNS records and resets the domain to **Approval Pending**. Update the DNS records at your registrar with the new values shown on the edit page, then verify again.

## Related Features

- **[Email Campaigns](./email-campaigns)** — Create and send email campaigns using your verified sender domains.
- **[Journeys](./journeys)** — Automate email sequences that send through your sender domains.
- **[Users](./users)** — Manage user accounts and user group settings including sender domain limits.
