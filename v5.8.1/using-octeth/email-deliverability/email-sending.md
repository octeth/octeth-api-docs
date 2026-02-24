---
layout: doc
---

# Email Sending

Email sending in Octeth involves several interconnected components working together to deliver your campaigns, transactional emails, and automated sequences. Before any email leaves the system, you need a properly configured delivery pipeline: a delivery server to handle SMTP connections, user group settings to control who sends through which server, verified sender domains for email authentication, and send engine instances to process the delivery queue.

This article covers the complete setup process for email sending — from configuring delivery servers and user group settings to managing sender domains and scaling send engine instances using the Octeth CLI tool.

## How Email Sending Works

Understanding the email delivery pipeline helps you configure each component correctly. Here is a high-level overview of how Octeth sends an email:

1. A user creates and sends a campaign (or a transactional email / journey triggers).
2. Octeth builds a delivery queue with all recipients.
3. The system resolves which **delivery server** to use based on the user's **user group settings** and the email type (marketing, transactional, or autoresponder).
4. The **sender domain** configuration determines the MFROM (return-path) address, tracking domains, and email authentication (SPF, DKIM, DMARC).
5. **Send engine instances** pick up queued emails and deliver them through the assigned delivery server's SMTP connection.
6. Bounce handling, tracking, and reporting happen after delivery.

Each component in this pipeline must be configured correctly for reliable email delivery.

[[SCREENSHOT: Diagram or high-level visual showing the email delivery pipeline: User creates campaign → Queue built → Delivery server selected → Sender domain resolved → Send engine delivers → Tracking and bounces processed]]

## Delivery Servers

A delivery server is an SMTP server configuration that Octeth uses to send emails. Each delivery server stores connection credentials, domain settings for tracking and bounce handling, and optional sender enforcement rules. You can create multiple delivery servers and assign them to different user groups for different email types.

### Creating a Delivery Server

To create a new delivery server:

1. Log in as an administrator.
2. Navigate to **Settings** > **Delivery Servers**.
3. Click **Create a New Delivery Server**.

[[SCREENSHOT: Delivery Servers list page showing existing servers with their names, SMTP hosts, Mail From domains, and user group allocation badges]]

The creation form has two tabs: **Delivery Method** and **Domains**.

### Delivery Method Settings

The **Delivery Method** tab configures the SMTP connection parameters:

| Field | Description |
|---|---|
| **Name** | A descriptive name to identify this delivery server (e.g., "US Marketing Server" or "EU Transactional"). |
| **SMTP Host** | The hostname or IP address of the SMTP server (e.g., `smtp.example.com`). |
| **SMTP Port** | The port number for the SMTP connection. Common ports: `25` (unencrypted), `587` (STARTTLS), `465` (SSL). |
| **Encryption** | The security protocol: **None**, **SSL**, or **TLS**. Use TLS or SSL for production environments. |
| **Timeout** | Connection timeout in seconds. The default is `10` seconds. Increase this if your SMTP server is on a remote or slow network. |
| **Authentication** | Whether the SMTP server requires a username and password. Set to **True** for most production SMTP servers. |
| **Username** | The SMTP authentication username. Only required when Authentication is set to True. |
| **Password** | The SMTP authentication password. Only required when Authentication is set to True. |

[[SCREENSHOT: Create Delivery Server form showing the Delivery Method tab with SMTP Host, Port, Encryption dropdown, Timeout, Authentication dropdown, Username, and Password fields]]

::: tip
Always use **TLS** or **SSL** encryption in production. Unencrypted SMTP connections expose your email content and credentials to network eavesdropping.
:::

### Domain Settings

The **Domains** tab configures tracking and bounce-handling domains associated with this delivery server:

| Field | Description |
|---|---|
| **Link Tracking Domain** | The domain used for click tracking URLs in emails (e.g., `click.example.com`). Recipients see this domain when hovering over links. |
| **Open Tracking Domain** | The domain used for open tracking pixels in HTML emails (e.g., `track.example.com`). |
| **Mail From Domain** | The MFROM (return-path / envelope sender) domain used for bounce handling (e.g., `bounces.example.com`). Bounce notifications are sent to this domain. |
| **Enforced From Email** | An optional email address to force as the From header for all emails sent through this server. Leave empty to let each campaign set its own From address. |
| **Use Sender Info as MFROM** | When checked, uses the sender information configured in the subscriber list as part of the Mail From address. |
| **Use Sender Info as FROM** | When checked, uses the sender information from the subscriber list in the From header. |

[[SCREENSHOT: Create Delivery Server form showing the Domains tab with Link Tracking Domain, Open Tracking Domain, Mail From Domain, Enforced From Email, and the two Sender Info checkboxes]]

::: warning
The Link Tracking Domain, Open Tracking Domain, and Mail From Domain must have proper DNS records (A records or CNAME records) pointing to your Octeth server. Without these, tracking links will not work and bounces will not be processed.
:::

### Testing a Delivery Server

After creating a delivery server, you can verify that the SMTP connection works:

1. Navigate to **Settings** > **Delivery Servers**.
2. Click the delivery server name to open the edit page.
3. Go to the **Test** tab.
4. Click the **Test** button.

Octeth attempts to connect to the SMTP server using the configured credentials. The test result shows:

| Status | Meaning |
|---|---|
| Green checkmark | The SMTP connection was successful. |
| Red X | The connection failed. Check the hostname, port, credentials, and firewall settings. |
| Grey clock | The server has not been tested yet. |

::: tip
If the test fails, verify that your SMTP server allows connections from your Octeth server's IP address. Many SMTP providers require IP whitelisting.
:::

### Delivery Server Allocation

Delivery servers are not assigned to individual users. Instead, they are assigned to **user groups** per email channel. This means all users within a user group share the same delivery server for each type of email. The allocation is visible in the delivery server list, where badges indicate which user groups and channels are assigned:

- **M** (blue) — Marketing campaigns
- **T** (green) — Transactional emails
- **AR** (purple) — Autoresponder emails

A delivery server showing **Not Allocated** is not currently assigned to any user group and will not be used for sending.

[[SCREENSHOT: Delivery Servers list page showing allocation badges next to each server — one server showing "M" and "T" badges for UserGroup1, another showing "Not Allocated"]]

## User Group Sender Settings

User group settings control how each group of users sends emails. These settings determine which delivery server is used, what sending limits apply, whether users can manage their own sender domains, and how email headers are configured.

### Accessing User Group Settings

To configure sender settings for a user group:

1. Log in as an administrator.
2. Navigate to **User Management** > **User Groups**.
3. Click the user group name to open the edit page.

The user group edit page contains several tabs. The settings relevant to email sending are spread across the **Preferences**, **Limits**, and **Sending Settings** sections.

### Delivery Server Assignment

The most important sender setting is the delivery server assignment, which routes emails through the correct SMTP infrastructure.

In the user group edit page, scroll to the **Sending Settings** section. You will see three delivery server dropdowns — one for each email channel:

| Channel | Setting | Description |
|---|---|---|
| **Marketing** | Target Delivery Server (Marketing) | The delivery server used for email campaigns. |
| **Transactional** | Target Delivery Server (Transactional) | The delivery server used for transactional emails (e.g., password resets, order confirmations). |
| **Auto Responder** | Target Delivery Server (Auto Responder) | The delivery server used for autoresponder sequences. |

Select the appropriate delivery server from each dropdown. Only delivery servers that have been created in **Settings** > **Delivery Servers** appear in these lists.

[[SCREENSHOT: User group edit page showing the Sending Settings section with three dropdown selectors for Marketing, Transactional, and Auto Responder delivery servers]]

::: info
If no delivery server is assigned for a channel, the system falls back to the user group's legacy send method configuration (System, SMTP, LocalMTA, PowerMTA, PHPMail, or SaveToDisk). For new installations, always use delivery servers instead of the legacy send method.
:::

### DNS Template Selection

Each user group can use a different DNS record template for sender domains. This determines what DNS records are generated when users in the group create new sender domains.

In the user group edit page, scroll to the **Email Delivery** section:

1. Select a template from the **Email Campaign DNS Template** dropdown.
2. If you also use the Email Gateway feature, select a template from the **Email Gateway DNS Template** dropdown.
3. Save the user group.

The available templates are defined in the `config/global/sender_domain_dns.php` configuration file. See [Configuring DNS Record Templates](#configuring-dns-record-templates) for details.

::: info
If the selected DNS template has no records defined (empty template), sender domains are automatically set to **Enabled** immediately upon creation — no DNS verification is required. This is common in development or testing environments.
:::

### Sender Domain Management

To allow users in a group to manage their own sender domains, enable the **Enable sender domain management** checkbox in the **Preferences** section.

When enabled:
- Users can create, edit, verify, and delete sender domains from **Settings** > **Sender Domains**.
- The campaign creation form displays a sender domain dropdown instead of a free-text From Email field.
- Users must have at least one verified sender domain to send campaigns.

When disabled:
- Users cannot access the Sender Domains page.
- The campaign form uses a standard free-text From Email field.

### Default Sender Domain

Administrators can configure a fallback sender domain for a user group. This allows users to send emails without setting up their own sender domains.

1. In the user group edit page, check **Activate default sender domain** in the **Preferences** section.
2. Enter the domain name (e.g., `example.com`) in the **Default Sender Domain** field.
3. Set the **Monthly Limit** — the maximum number of emails each user can send per rolling 30-day window through the default domain (default: `200`).
4. Save the user group.

::: warning
The default sender domain does not go through DNS verification in Octeth. You must ensure its DNS records (SPF, DKIM, DMARC) are properly configured on your mail server before enabling it. Misconfigured records affect all users in the group.
:::

### Sending Limits

The **Limits** section of the user group settings controls how many emails users can send:

| Limit | Description |
|---|---|
| **Monthly Email Limit** | Maximum number of emails per calendar month. |
| **Daily Email Limit** | Maximum number of emails per day. |
| **Lifetime Email Limit** | Maximum total emails over the account's lifetime. |
| **Sender Domains Limit** | Maximum number of sender domains a user can create. Set to `0` or leave empty for unlimited. |

### Email Headers

The user group settings also include options for custom email headers and footers that are automatically appended to all outgoing emails:

| Setting | Description |
|---|---|
| **Plain Text Email Header** | Text prepended to all plain text emails. |
| **Plain Text Email Footer** | Text appended to all plain text emails. |
| **HTML Email Header** | HTML content prepended to all HTML emails. |
| **HTML Email Footer** | HTML content appended to all HTML emails. |
| **X-Mailer Header** | Custom X-Mailer header value. Leave empty to use the system default. |

### Permissions

The **Permissions** tab controls which email features users in the group can access:

| Permission | Description |
|---|---|
| **EmailGateway.AddDomain** | Allows users to add new Email Gateway sender domains. |
| **EmailGateway.ManageDomain** | Allows users to manage Email Gateway domains (update, verify, delete, configure SMTPs, and webhooks). |

## Setting Up Sender Domains

Sender domains authenticate your outgoing emails through DNS records (SPF, DKIM, DMARC). Every email sent through Octeth needs a verified sender domain to ensure it reaches the recipient's inbox rather than their spam folder.

::: info
Sender domain setup is covered in full detail in the [Sender Domains](../sender-domains) article, including creation, DNS verification, domain options, custom subdomain settings, and troubleshooting. This section provides a summary of the key steps.
:::

### Quick Setup Steps

1. Navigate to **Settings** > **Sender Domains**.
2. Click **Setup a New Sender Domain**.
3. Enter your domain name (e.g., `mail.example.com`).
4. Click **Create Sender Domain**.
5. Octeth generates the required DNS records. Add these records at your domain registrar.
6. Return to the domain edit page and click **Verify DNS Records**.
7. Once all records pass verification, the domain status changes to **Enabled** and is ready for use.

::: tip Use a Subdomain
Use a subdomain like `mail.example.com` rather than your root domain. This isolates your email sending reputation from your main domain, protecting other services if deliverability issues arise.
:::

### What DNS Records Are Generated

The specific records depend on the DNS template assigned to your user group. A typical setup generates:

| Record Type | Purpose |
|---|---|
| **CNAME** (MFROM) | Routes outgoing mail and bounce handling through the delivery infrastructure. |
| **CNAME** (DKIM) | Enables DKIM email signing for message integrity verification. |
| **CNAME** (DMARC) | Defines the DMARC policy for handling authentication failures. |
| **CNAME** (Tracking) | Routes click and open tracking through the tracking infrastructure. |
| **TXT** (Verification) | A unique token proving domain ownership. |

### Using Sender Domains in Campaigns

When sender domain management is enabled, the campaign creation form splits the **From Email** field into two parts: a text field for the username (e.g., `newsletter`) and a dropdown for the sender domain (e.g., `@mail.example.com`). Only domains with **Enabled** status appear in the dropdown.

For complete documentation on creating, verifying, and configuring sender domains, see the [Sender Domains](../sender-domains) article.

## Configuring DNS Record Templates

DNS record templates are defined in a server-side configuration file and determine which DNS records users must set up when they create sender domains. Administrators can create multiple templates and assign them to different user groups.

::: info
DNS template configuration is also covered in the [Sender Domains](../sender-domains#configuring-dns-record-templates) article under the Administrator Configuration section. This section provides a focused guide for the setup process.
:::

### Configuration File

DNS templates are defined in:

```
config/global/sender_domain_dns.php
```

This file contains two template functions:

- **`$EmailCampaignDNSTemplates`** — Templates for email campaign sender domains. Supports subdomain and tracking prefix parameters.
- **`$EmailGatewayDNSTemplates`** — Templates for email gateway sender domains. Same structure but without the tracking prefix parameter.

### Template Structure

Each template is a named associative array where the key is the DNS record hostname (with placeholders) and the value is an array containing the record type and value:

```php
$EmailCampaignDNSTemplates = function($AppDomain, $Subdomain = '', $TrackPrefix = '') {
    $Template = [
        'Default' => [
            $Subdomain.'._SenderDomain_' => ['CNAME', 'mailer.yourdomain.com'],
            'key1._domainkey.'.$Subdomain.'._SenderDomain_' => ['CNAME', 'key1._domainkey.mailer.yourdomain.com'],
            '_DMARC.'.$Subdomain.'._SenderDomain_' => ['CNAME', '_DMARC.mailer.yourdomain.com'],
            $TrackPrefix.'-'.$Subdomain.'._SenderDomain_' => ['CNAME', 'track.mailer.yourdomain.com'],
            '_SenderDomainRandom_.'.$Subdomain.'._SenderDomain_' => ['TXT', '_SenderDomainHash_'],
        ],
    ];

    return $Template;
};
```

### Available Placeholders

Three placeholders can be used in template keys and values:

| Placeholder | Replaced With |
|---|---|
| `_SenderDomain_` | The sender domain the user registered (e.g., `mail.example.com`). |
| `_SenderDomainHash_` | A unique Base64-encoded hash derived from the domain name, used for ownership verification. |
| `_SenderDomainRandom_` | A random 10-character string, used for unique TXT record hostnames. |

### Creating Multiple Templates

Define multiple named templates to support different delivery infrastructure configurations:

```php
$Template = [
    'Default' => [
        // Records pointing to your primary mail server
    ],
    'EU Server' => [
        // Records pointing to your EU-based mail server
    ],
    'High Volume' => [
        // Records pointing to your dedicated high-volume infrastructure
    ],
];
```

Each template name appears as an option in the **Email Campaign DNS Template** dropdown in the user group settings. Assign different templates to different user groups based on their delivery requirements.

### Global Default Settings

The global subdomain prefix, tracking prefix, and merge character can be configured in `.oempro_env`:

| Variable | Default | Description |
|---|---|---|
| `EMAILCAMPAIGN_DNS_SUBDOMAIN` | `sl` | Subdomain prefix for the MFROM address (e.g., `sl.example.com`). |
| `EMAILCAMPAIGN_DNS_TRACK_PREFIX` | `track` | Prefix for tracking subdomains (e.g., `track-sl.example.com`). |
| `EMAILCAMPAIGN_DNS_TRACK_MERGE` | `-` | Character joining the tracking prefix and subdomain. |
| `EMAILGATEWAY_DNS_SUBDOMAIN` | `sl` | Subdomain prefix for Email Gateway domains. |

::: warning
After modifying the DNS template configuration file, restart the application container for changes to take effect. Changes only affect newly created sender domains — existing domains retain their original DNS records.
:::

### DNS Configuration File

In addition to sender domain templates, the `config/global/dns.php` file defines system-wide DNS record values used by delivery servers:

| Setting | Default | Description |
|---|---|---|
| `DNS_SPF` | `include:spf.yourdomain.com` | SPF record include value for delivery server scope. |
| `DNS_DKIM_KEY` | `key1` | The DKIM selector name. |
| `DNS_DKIM` | `<public_key>` | The DKIM public key for signature verification. |
| `DNS_DMARC` | `v=DMARC1; p=none; ...` | DMARC policy record value. |
| `DNS_SENDER_DOMAIN` | `primary-sender-domain.com` | CNAME target for sender domain records. |
| `DNS_LINK_TRACKER` | `primary-sender-domain.com` | CNAME target for link tracking records. |
| `DNS_OPEN_TRACKER` | `primary-sender-domain.com` | CNAME target for open tracking records. |

These values should point to your actual mail delivery infrastructure where SPF, DKIM, and DMARC are configured at the server level.

## Managing Send Engine Instances

Send engines are horizontally-scalable Docker containers that process the email delivery queue. Each send engine instance runs a supervisor-controlled delivery controller that picks up queued campaigns and sends emails through the assigned delivery servers. The Octeth CLI tool (`octeth.sh`) provides commands to start, stop, scale, and monitor send engine instances.

### Starting Send Engines

To start one or more send engine instances:

```bash
./cli/octeth.sh sendengine:start
```

This starts a single send engine instance. To start multiple instances:

```bash
./cli/octeth.sh sendengine:start --scale 3
```

The `--scale` flag specifies how many instances to launch. Each instance runs as a separate Docker container.

### Stopping Send Engines

To stop all send engine instances:

```bash
./cli/octeth.sh sendengine:stop
```

This gracefully stops all send engine containers. The containers remain on disk and can be restarted.

### Restarting Send Engines

To restart all send engine instances:

```bash
./cli/octeth.sh sendengine:restart
```

To restart and change the number of instances at the same time:

```bash
./cli/octeth.sh sendengine:restart --scale 5
```

### Scaling Send Engines

To change the number of running send engine instances without a full restart:

```bash
./cli/octeth.sh sendengine:scale <count>
```

For example, to scale up to 10 instances:

```bash
./cli/octeth.sh sendengine:scale 10
```

To scale down to a single instance:

```bash
./cli/octeth.sh sendengine:scale 1
```

Scaling adjusts the number of containers dynamically. New containers start automatically, and excess containers are stopped.

::: tip
Scale up during high-volume sending periods (large campaigns or peak hours) and scale down during quiet periods to conserve system resources.
:::

### Checking Status

To view the status of all send engine instances, including container health, resource usage, and active campaigns:

```bash
./cli/octeth.sh sendengine:status
```

The output includes:

- **Container Status** — Shows each container's name, running state, and exposed ports.
- **Resource Usage** — CPU percentage, memory usage, network I/O, and process count per container.
- **Active Campaigns** — Lists which campaigns are currently being delivered, the number of workers per campaign, and which containers are processing them.
- **Supervisor Process Status** — Shows the state of supervisor-managed processes in each container.

### Viewing Resource Statistics

For a focused view of resource consumption:

```bash
./cli/octeth.sh sendengine:stats
```

This displays CPU usage, memory usage, network I/O for each container, and the current state of the RabbitMQ delivery queue (pending campaigns and active consumers).

### Viewing Logs

To view send engine logs:

```bash
./cli/octeth.sh sendengine:logs
```

To follow logs in real-time:

```bash
./cli/octeth.sh sendengine:logs -f
```

To view a specific number of recent log lines:

```bash
./cli/octeth.sh sendengine:logs --lines 200
```

To view logs from a specific container:

```bash
./cli/octeth.sh sendengine:logs -f oempro-oempro_sendengine-1
```

### Managing Supervisor Processes

Each send engine container runs supervisor-managed processes. You can control these processes across all containers:

```bash
./cli/octeth.sh sendengine:supervisor status    # View process status
./cli/octeth.sh sendengine:supervisor restart   # Restart all processes
./cli/octeth.sh sendengine:supervisor stop      # Stop all processes
./cli/octeth.sh sendengine:supervisor start     # Start all processes
```

### Manually Starting Campaign Workers

In some cases, you may need to manually start delivery workers for a specific campaign:

```bash
./cli/octeth.sh sendengine:workers <campaign-id> [count] [container-index]
```

| Argument | Description |
|---|---|
| `<campaign-id>` | The campaign ID to process (required). |
| `[count]` | Number of workers to start (default: `1`). |
| `[container-index]` | Which send engine container to use (default: `1`). |

Examples:

```bash
./cli/octeth.sh sendengine:workers 1171            # 1 worker on container 1
./cli/octeth.sh sendengine:workers 1171 5          # 5 workers on container 1
./cli/octeth.sh sendengine:workers 1171 10 2       # 10 workers on container 2
```

You can also use named flags:

```bash
./cli/octeth.sh sendengine:workers -c 1171 -n 5 -i 2
```

::: warning
Manual worker management is intended for advanced troubleshooting and debugging. Under normal operation, the send engine controller automatically manages worker processes for active campaigns.
:::

### Executing Commands in Containers

To run arbitrary commands inside send engine containers:

```bash
./cli/octeth.sh sendengine:exec <command>
```

This executes the command in all running send engine containers. To target a specific container:

```bash
./cli/octeth.sh sendengine:exec oempro-oempro_sendengine-1 supervisorctl status
```

### Send Engine Command Reference

| Command | Description |
|---|---|
| `sendengine:start [--scale N]` | Start send engine instance(s). |
| `sendengine:stop` | Stop all send engine instances. |
| `sendengine:restart [--scale N]` | Restart all instances, optionally changing the count. |
| `sendengine:scale <count>` | Scale to the specified number of instances. |
| `sendengine:status` | Show container status, resource usage, and active campaigns. |
| `sendengine:stats` | Show resource statistics and queue depth. |
| `sendengine:logs [-f] [--lines N]` | View send engine logs. |
| `sendengine:supervisor <action>` | Manage supervisor processes (status, restart, stop, start). |
| `sendengine:workers <id> [count] [container]` | Manually start campaign delivery workers. |
| `sendengine:exec [container] <command>` | Execute a command inside send engine containers. |

## Complete Setup Walkthrough

This section provides a step-by-step walkthrough for setting up email sending from scratch.

### Step 1: Configure the DNS Template

1. Open `config/global/sender_domain_dns.php` on your server.
2. Uncomment and customize the DNS record entries in the `$EmailCampaignDNSTemplates` function, pointing CNAME values to your delivery server's domain.
3. If using the Email Gateway, also configure `$EmailGatewayDNSTemplates`.
4. Restart the application container for changes to take effect.

### Step 2: Configure DNS Settings

1. Open `config/global/dns.php` on your server.
2. Set the `DNS_SPF`, `DNS_DKIM`, `DNS_DKIM_KEY`, and `DNS_DMARC` values to match your delivery server's DNS configuration.
3. Set `DNS_SENDER_DOMAIN`, `DNS_LINK_TRACKER`, and `DNS_OPEN_TRACKER` to your delivery server's hostname.
4. Restart the application container.

### Step 3: Create a Delivery Server

1. Navigate to **Settings** > **Delivery Servers** in the admin area.
2. Click **Create a New Delivery Server**.
3. Configure the SMTP connection (host, port, encryption, authentication).
4. Configure the domains (link tracking, open tracking, Mail From).
5. Save the delivery server.
6. Test the SMTP connection from the **Test** tab.

### Step 4: Configure User Group Settings

1. Navigate to **User Management** > **User Groups**.
2. Edit the user group.
3. In **Sending Settings**, assign the delivery server to the appropriate channels (Marketing, Transactional, Auto Responder).
4. In **Email Delivery**, select the DNS template for the user group.
5. In **Preferences**, enable sender domain management if users should manage their own domains.
6. In **Limits**, set appropriate sending limits.
7. Save the user group.

### Step 5: Set Up Sender Domains

1. Log in as a user in the configured user group.
2. Navigate to **Settings** > **Sender Domains**.
3. Create a new sender domain (e.g., `mail.example.com`).
4. Add the generated DNS records at your domain registrar.
5. Wait for DNS propagation (up to 48 hours, typically minutes).
6. Verify the DNS records in Octeth.
7. Confirm the domain status changes to **Enabled**.

### Step 6: Start Send Engine Instances

1. Open a terminal on your Octeth server.
2. Start the send engines:

```bash
./cli/octeth.sh sendengine:start --scale 2
```

3. Verify the instances are running:

```bash
./cli/octeth.sh sendengine:status
```

### Step 7: Send a Test Campaign

1. Create a new email campaign.
2. Select your verified sender domain in the From Email field.
3. Add a small test list as recipients.
4. Send the campaign.
5. Monitor delivery in the send engine logs:

```bash
./cli/octeth.sh sendengine:logs -f
```

## Tips and Best Practices

::: tip Use Separate Delivery Servers for Different Email Types
Assign different delivery servers for marketing, transactional, and autoresponder emails. This separates sending reputation across email types — a marketing campaign that generates spam complaints will not affect your transactional email deliverability.
:::

::: tip Start with Conservative Sending Limits
Set moderate daily and monthly sending limits for new user groups. Gradually increase limits as your sending reputation builds. Sudden large volumes from a new domain trigger spam filters.
:::

::: tip Monitor Send Engine Resources
Use `./cli/octeth.sh sendengine:stats` regularly to monitor CPU, memory, and queue depth. Scale up send engines before launching large campaigns to prevent delivery delays.
:::

::: tip Keep DNS Records Consistent
Ensure your DNS record template CNAME targets match the actual DNS records configured on your delivery server. Misaligned SPF, DKIM, or DMARC records cause authentication failures and hurt deliverability.
:::

::: tip Use TLS Encryption
Always configure delivery servers with TLS or SSL encryption. This protects email content in transit and is increasingly required by receiving mail servers.
:::

## Troubleshooting

### Emails Are Not Being Sent

1. **Check send engine status** — Run `./cli/octeth.sh sendengine:status` to confirm at least one instance is running with healthy supervisor processes.
2. **Check delivery server assignment** — Verify that the user's group has a delivery server assigned for the correct channel (Marketing, Transactional, or Auto Responder).
3. **Test the SMTP connection** — Go to **Settings** > **Delivery Servers**, edit the server, and run a connection test from the **Test** tab.
4. **Check sending limits** — Verify the user has not exceeded their daily, monthly, or lifetime sending limits.
5. **Check send engine logs** — Run `./cli/octeth.sh sendengine:logs -f` to look for error messages.

### SMTP Connection Test Fails

- Verify the SMTP host, port, and credentials are correct.
- Check that your server's firewall allows outbound connections on the SMTP port.
- If using TLS/SSL, ensure the SMTP server's certificate is valid and not expired.
- Some SMTP providers require IP whitelisting — add your Octeth server's IP address.
- Increase the timeout value if the server is on a remote network.

### Sender Domain Stuck in Approval Pending

- Verify all DNS records at your registrar match the values shown in Octeth exactly.
- Confirm you created the correct record types (CNAME vs A vs TXT).
- Wait for DNS propagation (up to 48 hours) before re-verifying.
- Check your registrar's formatting — some automatically append the root domain to record hosts.

For detailed sender domain troubleshooting, see the [Sender Domains](../sender-domains#troubleshooting) article.

### Send Engine Containers Keep Restarting

- Check container logs: `./cli/octeth.sh sendengine:logs --lines 500`
- Verify the container has sufficient memory (default limit: 3 GB). Large campaigns may require more.
- Check supervisor process status: `./cli/octeth.sh sendengine:supervisor status`
- Ensure the application container and database are accessible from the send engine network.

### Delivery Server Shows "Not Allocated"

A delivery server with the **Not Allocated** badge is not assigned to any user group. To assign it:

1. Navigate to **User Management** > **User Groups**.
2. Edit the target user group.
3. In **Sending Settings**, select the delivery server for the appropriate channel.
4. Save the user group.

## Related Features

- **[Sender Domains](../sender-domains)** — Detailed guide on creating, verifying, and configuring sender domains.
- **[Email Tracking](./email-tracking)** — How open tracking and click tracking work with your delivery infrastructure.
- **[Bounce Processing](./bounce-processing)** — How bounced emails are handled through the Mail From domain.
- **[SPF/DKIM/DMARC](./spf-dkim-dmarc)** — In-depth guide to email authentication protocols.
- **[Email Campaigns](../email-campaigns)** — Creating and sending email campaigns.
- **[Journeys](../journeys)** — Automating email sequences through the Journey Builder.
