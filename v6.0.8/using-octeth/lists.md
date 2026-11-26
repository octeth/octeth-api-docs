---
layout: doc
---

# Lists

Lists are the foundation of email marketing in Octeth. A subscriber list is a collection of contacts (subscribers) that you send email campaigns to. Each list has its own set of subscribers, custom fields, segments, subscription settings, and analytics. Organizing your contacts into well-defined lists helps you target the right audience, maintain compliance, and track engagement effectively.

This article covers how to browse, create, configure, and manage subscriber lists, including statistics, subscription forms, web service integrations, and more.

## Browsing Lists

To view all your subscriber lists, navigate to **Lists** from the main menu. The lists page displays a table of all lists in your account.

[[SCREENSHOT: Lists browse page showing the table of lists with subscriber counts, action links, and the Create New List button]]

### List Table

Each row in the table represents a subscriber list and displays:

| Column | Description |
|---|---|
| **Checkbox** | Select individual lists for bulk actions. |
| **List Name** | The name of the subscriber list. Click to open the list's statistics page. |
| **Subscribers** | The total number of subscribers in the list. |
| **Actions** | Quick-access icons for Statistics, Subscribers, Custom Fields, Segments, and Auto Responders. |

Use the **Select All** and **Select None** links above the table to quickly select or deselect all lists.

### Creating a New List

Click the **Create New List** button at the top of the page to create a new list. See [Creating a List](#creating-a-list) for details.

### Bulk Deletion

To delete multiple lists at once:

1. Select the lists you want to delete using the checkboxes.
2. Click **Delete** in the toolbar above the table.
3. Confirm the deletion when prompted.

::: danger
Deleting a list is permanent and cannot be undone. All subscribers, custom fields, segments, tags, auto responders, and associated data in the list are permanently removed.
:::

### Global Suppression List

Below the lists table, a link to the **Global Suppression List** is displayed along with the total number of suppressed email addresses. Click this link to manage globally suppressed addresses. For details, see [Suppression Lists](./email-deliverability/suppression-lists).

## Creating a List

To create a new subscriber list:

1. Navigate to **Lists** from the main menu.
2. Click **Create New List**.

[[SCREENSHOT: Create New List form showing the list name field, sender information fields, opt-in mode selector, and the hide in subscriber area checkbox]]

3. Fill in the list details:

| Field | Description |
|---|---|
| **List Name** | A descriptive name for the list (required). Choose a name that clearly identifies the purpose or audience of the list, such as "Monthly Newsletter" or "Product Updates". |

4. If sender information is enabled by your administrator, fill in the sender fields:

| Field | Description |
|---|---|
| **Sender Name** | The name that appears as the email sender (required). |
| **Sender Email Address** | The email address used for sending campaigns from this list (required). |
| **Sender Company** | The company name included in emails (required). |
| **Sender Address** | The physical mailing address included in emails for compliance purposes (required). |

::: info
Sender information fields are only visible when your administrator has enabled the **Sender Information** setting for your user group. If you do not see these fields, default sender information is configured at the account level.
:::

5. Select the **Opt-in Mode**:

| Mode | Description |
|---|---|
| **Double Opt-in** | Subscribers must confirm their subscription by clicking a link in a confirmation email before being added to the list. This is the recommended approach for compliance and list quality. |
| **Single Opt-in** | Subscribers are added to the list immediately without requiring email confirmation. |

::: tip
Double opt-in is recommended for most use cases. It ensures that subscribers genuinely want to receive your emails, improves deliverability, and helps you comply with data protection regulations such as GDPR.
:::

::: info
If your administrator has enforced double opt-in for your user group, the opt-in mode selector is not displayed and all lists are created as double opt-in.
:::

6. Optionally, check **Hide in Subscriber Area** to prevent this list from appearing in the subscriber self-service management page.

7. Click **Create List**.

After creating the list, you are redirected to the list's settings page where you can configure additional options.

## List Navigation

When you are inside a list (for example, after clicking a list name from the browse page), a left sidebar navigation panel provides access to all list-level features.

[[SCREENSHOT: List navigation sidebar showing the Overview and Management sections with all navigation items]]

### Header Actions

At the top of the list page, two action buttons are available:

- **Forms** — Opens the subscription and unsubscription form management page.
- **Subscribers** — A dropdown menu with options to Browse Subscribers, Import Subscribers, Remove Subscribers, and Export Subscribers.

### Navigation Sections

The sidebar is organized into two sections:

**Overview**

| Item | Description |
|---|---|
| **Statistics** | List performance dashboard with activity charts and engagement metrics. |
| **ESP Breakdown** | Analysis of subscriber distribution and engagement by email service provider. |
| **CTR Retention** | Cohort retention analysis showing click-through rate trends across campaigns. |

**Management**

| Item | Description |
|---|---|
| **Custom Fields** | Manage additional data fields for subscribers in this list. |
| **Subscriber Tags** | Create and manage tags for categorizing subscribers. |
| **Segments** | Define dynamic subscriber segments based on rules and criteria. |
| **Event Tracker** | Configure website event tracking for this list. |
| **Auto Responders** | Set up automated email sequences triggered by subscription events. |
| **Suppression List** | Manage the list-specific email suppression list. |
| **SMS Settings** | Configure SMS-related settings for the list (if SMS marketing is enabled). |
| **List Settings** | Edit the list's name, opt-in mode, subscription/unsubscription behavior, and integrations. |
| **List Delete** | Permanently delete the list and all associated data. |

## List Statistics

The Statistics page provides a comprehensive dashboard of your list's performance and subscriber engagement.

Navigate to a list and click **Statistics** in the sidebar (this is also the default page when opening a list).

[[SCREENSHOT: List statistics page showing the activity chart, open/click performance panels, subscriber count, and email domain distribution]]

### Activity Chart

A 30-day line graph shows subscription and unsubscription trends over time. This visual helps you identify patterns in list growth and spot any unusual spikes in unsubscriptions.

### Performance Metrics

The statistics page displays two performance panels side by side:

**Open Rate Performance**

| Metric | Description |
|---|---|
| **Overall Open Rate** | The percentage of emails opened across all campaigns sent to this list, displayed with a sparkline trend. |
| **Account Average** | The average open rate across all lists in your account, for comparison. |
| **Performance Difference** | The difference between your list's open rate and the account average. |
| **Highest Open Day** | The day of the week when your list's subscribers are most likely to open emails. |

**Click Rate Performance**

| Metric | Description |
|---|---|
| **Overall Click Rate** | The percentage of email link clicks across all campaigns sent to this list, displayed with a sparkline trend. |
| **Account Average** | The average click rate across all lists in your account, for comparison. |
| **Performance Difference** | The difference between your list's click rate and the account average. |
| **Highest Click Day** | The day of the week when your list's subscribers are most likely to click links. |

### Additional Metrics

The page also displays:

- **Subscriber Count** — The total number of subscribers currently in the list.
- **Opt-in Pending** — The number of subscribers awaiting double opt-in confirmation.
- **Spam Complaints** — The total number of spam complaints received.
- **Forwards and Page Views** — Sparkline charts showing forward and page view trends.
- **Email Domain Distribution** — A pie chart showing the breakdown of subscriber email domains (e.g., gmail.com, yahoo.com, outlook.com).

### Exporting Statistics

Click the **CSV** or **XML** export buttons to download the list statistics in your preferred format.

## ESP Breakdown

The ESP (Email Service Provider) Breakdown page analyzes your subscribers and their engagement metrics grouped by email domain. This helps you understand which email providers your subscribers use and how engagement varies across providers.

Navigate to a list and click **ESP Breakdown** in the sidebar.

[[SCREENSHOT: ESP Breakdown page showing the Charts tab with pie charts for subscribers, openers, clickers, and opt-outs by email provider]]

### Charts Tab

The Charts tab displays four pie charts side by side:

| Chart | Description |
|---|---|
| **Subscribers by Email Provider** | Distribution of all subscribers by their email domain. |
| **Openers by Email Provider** | Distribution of email opens by subscriber email domain. |
| **Clickers by Email Provider** | Distribution of link clicks by subscriber email domain. |
| **Opt-outs by Email Provider** | Distribution of unsubscriptions by subscriber email domain. |

### Breakdown Tables

Four additional tabs provide tabular data for each metric:

- **Breakdown by Subscribers** — Shows each email domain with its percentage and subscriber count.
- **Breakdown by Openers** — Shows each email domain with its percentage and open count.
- **Breakdown by Clickers** — Shows each email domain with its percentage and click count.
- **Breakdown by Opt-outs** — Shows each email domain with its percentage and unsubscription count.

::: tip
Use the ESP Breakdown data to identify deliverability issues with specific email providers. If a particular provider shows low open rates compared to others, investigate whether your emails are being filtered or landing in spam folders for that provider.
:::

## CTR Retention

The CTR (Click-Through Rate) Retention page provides a cohort retention analysis that shows how subscriber click engagement changes across consecutive campaigns.

Navigate to a list and click **CTR Retention** in the sidebar.

[[SCREENSHOT: CTR Retention page showing the color-coded cohort retention table with campaign names and retention percentages]]

### Reading the Retention Table

The retention table is organized as a matrix:

- **Rows** represent campaigns sent to the list.
- **Columns** represent subsequent campaigns (Campaign 1 through Campaign 11).
- **Each cell** shows the retention percentage and click count relative to the first campaign in that row.

The first column (Campaign 1) always shows 100% as the baseline. Subsequent columns show what percentage of clickers from the first campaign continued to click in later campaigns.

### Color Coding

Cells are color-coded from light blue to dark blue based on the retention percentage:

- **Darker blue** indicates higher retention (more subscribers continued clicking).
- **Lighter blue** indicates lower retention (fewer subscribers continued clicking).

Click any campaign name in the table to navigate to that campaign's overview page.

::: info
CTR Retention analysis requires multiple campaigns to have been sent to the list. If fewer than two campaigns have been sent, the table appears empty.
:::

## List Settings

The List Settings page is where you configure the core behavior of your subscriber list, including opt-in/opt-out behavior, redirect URLs, and web service integrations.

Navigate to a list and click **List Settings** in the sidebar.

[[SCREENSHOT: List Settings page showing the basic settings section with list name, opt-in mode, and options checkboxes]]

### Basic Settings

| Field | Description |
|---|---|
| **List Tracker ID** | A read-only unique identifier used for website event tracking. Copy this ID when configuring the event tracker on your website. |
| **List Name** | The name of the list. Update it at any time. |

If sender information is enabled, the following fields are also displayed:

| Field | Description |
|---|---|
| **Sender Name** | The name that appears as the email sender. |
| **Sender Email Address** | The email address used for sending campaigns. |
| **Sender Company** | The company name included in emails. |
| **Sender Address** | The physical mailing address included for compliance. |

### Opt-in Mode

Select the opt-in mode for the list:

| Mode | Description |
|---|---|
| **Double Opt-in** | Subscribers must confirm their subscription via a confirmation email. |
| **Single Opt-in** | Subscribers are added immediately without confirmation. |

When double opt-in is selected, a button appears to manage the confirmation email:

- **Create Opt-in Confirmation Email** — If no confirmation email exists yet, click this button to create one.
- **Edit Opt-in Confirmation Email** — If a confirmation email already exists, click this button to edit it.
- **Delete** — Remove the existing confirmation email. A default system confirmation email is used when no custom email is configured.

::: warning
If you delete the custom opt-in confirmation email, the system's default confirmation email is used. Make sure the default email is appropriate for your audience before deleting your custom version.
:::

### Options

| Option | Description |
|---|---|
| **Hide in Subscriber Area** | When checked, this list is hidden from the subscriber self-service management page. Subscribers cannot see or manage their subscription to this list through the subscriber area. |
| **Send Activity Notification** | When checked, an email notification is sent to your account email address whenever subscription activity occurs on this list (new subscriptions, unsubscriptions). |
| **Do not send email campaign if recipient is enrolled in journey or autoresponder** | When checked, subscribers who are currently enrolled in a journey or autoresponder are excluded from regular email campaign sends for this list. This prevents subscribers from receiving too many emails at once. |

::: tip
Enable the **Do not send email campaign** option if you have active journeys or autoresponders running. This prevents subscribers from being overwhelmed with emails from both automated sequences and manual campaigns simultaneously.
:::

### Subscription Settings

The subscription settings control what happens when a new subscriber joins this list.

| Setting | Description |
|---|---|
| **Subscribe to another list** | When checked, new subscribers are automatically added to a second list that you select from the dropdown. Useful for maintaining a master list alongside topic-specific lists. |
| **Unsubscribe from another list** | When checked, new subscribers are automatically removed from a specified list. Useful when migrating subscribers between lists. |
| **Subscription pending page URL** | When checked, subscribers are redirected to the specified URL after submitting their subscription on a double opt-in list (before confirmation). Leave unchecked to use the default Octeth confirmation pending page. |
| **Subscription confirmed page URL** | When checked, subscribers are redirected to the specified URL after clicking the confirmation link in the double opt-in email. Leave unchecked to use the default Octeth confirmation page. |
| **Subscription error page URL** | When checked, subscribers are redirected to the specified URL if an error occurs during the subscription process. Leave unchecked to use the default Octeth error page. |

::: info
Custom redirect URLs must be fully qualified URLs starting with `http://` or `https://`. For example: `https://example.com/thank-you`.
:::

### Unsubscription Settings

The unsubscription settings control what happens when a subscriber opts out of this list.

| Setting | Description |
|---|---|
| **Subscribe to another list** | When checked, unsubscribing subscribers are automatically added to a specified list. Useful for moving unsubscribed contacts to a "paused" or "inactive" list. This option may not be available depending on your system configuration. |
| **Unsubscribe from another list** | When checked, unsubscribing subscribers are also removed from a specified list. |
| **Unsubscribe from all lists** | When checked, an unsubscription from this list removes the subscriber from all lists they belong to, not just this one. |
| **Add to list suppression list** | When checked, the subscriber's email address is added to this list's suppression list upon unsubscription, preventing re-subscription. |
| **Add to global suppression list** | When checked, the subscriber's email address is added to the global suppression list upon unsubscription, preventing emails across all lists. |
| **Unsubscription confirmed page URL** | When checked, subscribers are redirected to the specified URL after successfully unsubscribing. Leave unchecked to use the default Octeth unsubscription page. This option may not be available depending on your system configuration. |
| **Unsubscription error page URL** | When checked, subscribers are redirected to the specified URL if an error occurs during the unsubscription process. Leave unchecked to use the default Octeth error page. This option may not be available depending on your system configuration. |

::: warning
Enabling **Unsubscribe from all lists** means a single unsubscription removes the subscriber from every list in your account. Use this carefully — in most cases, unsubscribing from the specific list only is the preferred behavior.
:::

::: tip
Adding unsubscribed contacts to the suppression list prevents them from being accidentally re-imported. Consider enabling **Add to list suppression list** if you regularly import subscribers from external sources.
:::

### Web Service Integration

Web service integration allows you to trigger external webhook calls whenever a subscription or unsubscription event occurs on this list. This is useful for syncing subscriber data with CRM systems, analytics platforms, or other third-party services.

[[SCREENSHOT: Web Service Integration section showing existing integration URLs with event types and the form to add a new URL]]

**Viewing Existing Integrations**

If integrations have already been configured, a table displays each integration URL along with its event type (subscription or unsubscription). Click **Remove** next to an integration to delete it.

**Adding a New Integration**

1. Enter the webhook URL in the **Service URL** field.
2. Select the **Event Type**:
   - **Subscription** — The URL is called when a new subscriber joins the list.
   - **Unsubscription** — The URL is called when a subscriber opts out.
3. Click **Add**.

::: info
When a subscription or unsubscription event occurs, Octeth sends an HTTP POST request to the configured URL with the subscriber's data. Ensure your endpoint is accessible and can handle incoming POST requests.
:::

### Saving Settings

Click **Save Settings** at the bottom of the page to save all changes to the list configuration.

## Copying a List

You can create a copy of an existing list, including all its settings and custom fields. This is useful when you want to create a new list with a similar configuration without starting from scratch.

To copy a list:

1. Navigate to the list you want to copy.
2. Click **List Settings** in the sidebar.
3. Click **Save As A New List** at the bottom of the settings page.
4. Enter a name for the new list when prompted.
5. Confirm the action.

The new list is created with the same settings, custom fields, and configuration as the original list. You are redirected to the lists browse page.

::: info
Copying a list duplicates the list's settings and custom field definitions only. Subscribers, subscriber data, segments, tags, auto responders, and statistics are not copied to the new list.
:::

## Subscription and Unsubscription Forms

Octeth can generate ready-to-use HTML forms that you embed on your website to allow visitors to subscribe to or unsubscribe from your lists.

Navigate to a list and click **Forms** in the header area.

[[SCREENSHOT: Subscription Form tab showing the form preview with style selector, lists and custom fields multi-selects, and the embed code tab]]

### Subscription Form

The Subscription Form tab provides a visual preview of the form and the embeddable HTML code.

**Configuring the Form**

1. **Form Style** — Select a visual style from the dropdown. Multiple pre-built form styles are available to match your website's design.
2. **Lists** — Select which lists the form subscribes visitors to. By default, the current list is selected. Hold Ctrl (or Cmd on Mac) to select multiple lists.
3. **Custom Fields** — Select which custom fields to display on the form. Only selected fields appear on the subscription form.
4. Click **Update Form** to apply your changes to the preview.

**Getting the Embed Code**

1. Click the **Form Code** tab to view the generated HTML and JavaScript code.
2. Copy the code from the text area.
3. Paste the code into your website's HTML where you want the subscription form to appear.

::: tip
Preview the form after making changes to ensure it looks correct before copying the embed code. The form preview updates in real time when you click **Update Form**.
:::

### Unsubscription Form

The Unsubscription Form tab provides the HTML code for an unsubscription form that you can embed on your website.

1. Switch to the **Unsubscription Form** tab.
2. Copy the HTML code from the text area.
3. Paste it into your website where you want the unsubscription form to appear.

::: info
The unsubscription form requires the subscriber to enter their email address. When submitted, the subscriber is unsubscribed according to the unsubscription settings configured for the list.
:::

## Deleting a List

There are two ways to delete subscriber lists:

### Deleting a Single List

1. Navigate to the list you want to delete.
2. Click **List Delete** in the sidebar navigation.
3. Review the warning about permanent deletion.
4. Click **Delete** to confirm.

### Deleting Multiple Lists

1. Navigate to **Lists** from the main menu.
2. Select the lists you want to delete using the checkboxes.
3. Click **Delete** in the toolbar.
4. Confirm the deletion when prompted.

::: danger
Deleting a list permanently removes all associated data including subscribers, custom field values, segments, tags, auto responders, statistics, and suppression entries. This action cannot be undone.
:::

## SMS Settings

If SMS marketing is enabled for your account, each list has an SMS Settings page where you configure which subscriber custom fields store mobile phone data.

Navigate to a list and click **SMS Settings** in the sidebar.

[[SCREENSHOT: SMS Settings page showing the Mobile Phone Number and Carrier custom field dropdowns]]

| Field | Description |
|---|---|
| **Mobile Phone Number Custom Field** | Select the custom field that stores subscriber mobile phone numbers (required for SMS campaigns). Both global and list-specific custom fields are available in the dropdown. |
| **Mobile Phone Number Carrier Custom Field** | Optionally select the custom field that stores the subscriber's mobile carrier information. |

Click **Save** to apply the SMS settings.

::: info
SMS Settings are only visible when SMS marketing features are enabled for your account. For details on SMS campaigns, see [SMS Messages](./sms-messages).
:::

## Sync a list from an external database

If your contacts live in your own MySQL database, such as a shop or CRM database, a list sync keeps an Octeth list up to date from it automatically. You connect the database once and choose a schedule. On every run, Octeth reads the rows, adds the new ones as subscribers and updates the ones that changed. You no longer need to export and import a file each time your data changes.

The sync works in one direction only. Octeth reads your database and never writes to it.

### Before you start

- **The Lists.Sync permission.** The **Sync** tab appears only when your user group has the **Sync lists from an external database** permission. It is off by default. Ask your Octeth administrator to enable it on your user group.
- **A database user that can only read.** Create a MySQL user for Octeth that can read the table or view you want to sync, and nothing else. Octeth also opens every connection in read-only mode.
- **A reachable database server.** Octeth connects to public addresses only. If your database is on a private network (for example `10.x.x.x` or `192.168.x.x`), your Octeth administrator must add it to the allowed hosts first. Otherwise the connection is refused with "This host is not allowed".

### Create a sync

1. Navigate to **Lists** and open the list you want to keep up to date.
2. Click the **Sync** tab.
3. Click **New sync**.

[[SCREENSHOT: The Sync tab of a list with the New sync button and the list of syncs]]

The wizard has four steps.

**Step 1: Connection**

1. Enter a **Sync name**, for example "Customers from the shop database". It is shown on the Sync tab and in the run history.
2. Enter the **Host**, **Port** (usually `3306`), **User**, **Password** and **Database** of your MySQL server.
3. Leave **Use an encrypted connection (TLS)** on. If your server uses a self-signed certificate or a managed database certificate, paste its CA certificate into **CA certificate** (see [Encrypted connections](#encrypted-connections) below).
4. Click **Test connection** to check that Octeth can reach the database and sign in.
5. Click **Next**.

The password and the CA certificate are stored encrypted and are never shown again. When you edit a sync later, leave the password empty to keep the stored one. If you change the host, port or user, turn TLS off, or change the CA certificate, you must enter the password again.

#### Encrypted connections

Octeth encrypts the connection to your database with TLS by default, so your contacts' data and the database password cannot be read on the way. It also checks the server's certificate: the certificate must be signed by a certificate authority Octeth trusts and must be issued for the host you entered. If one of these checks fails, **Test connection** says which:

- **The server does not offer TLS.** Turn on TLS on your MySQL server. MySQL 8 enables it by default.
- **The certificate is not trusted.** The server uses a self-signed certificate, such as the one MySQL creates when it is installed, or a certificate from a private CA. Paste the CA certificate that signed it into **CA certificate**. For a self-signed MySQL server, this is the `ca.pem` file in the server's data directory.
- **The certificate does not name this host.** Enter the host name the certificate was issued for, not an IP address or another alias.

Managed databases sign their certificates with their own CA. Download it from your provider and paste it into **CA certificate**:

- **Amazon RDS and Aurora:** the certificate bundle for your database's region, from the AWS documentation page "Using SSL/TLS to encrypt a connection to a DB instance". Use the regional bundle, not the global one, which is larger than the 16 KB Octeth accepts.
- **Google Cloud SQL:** the server CA certificate on the **Connections** page of your instance.
- **Azure Database for MySQL:** the root CA certificate listed in the Azure documentation for your server type.

Turn **Use an encrypted connection (TLS)** off only when the database is on a trusted private network. The synced data and the password then travel unencrypted, and Octeth sends the password in clear text to a server that asks for it that way.

**Step 2: Source**

1. Choose where the rows come from:
   - **Table**: enter the table name, or `database.table`.
   - **SELECT query**: enter one `SELECT` statement, for example `SELECT email, first_name, plan FROM customers WHERE active = 1`. Only a single `SELECT` is accepted, and each statement is stopped after 60 seconds.
2. Click **Load columns**. Octeth shows the columns and the first rows of your source so you can check them.
3. Click **Next**.

Each row of the source becomes one subscriber.

**Step 3: Key and mapping**

1. In **Match rows by**, choose how Octeth recognizes the same contact on the next run:
   - **Email address**: a row is matched to the subscriber with the same email address.
   - **An ID column**: a row is matched by a column that never changes, such as a customer ID. Choose it in **ID column**. When a contact's email address changes in your database, Octeth renames the existing subscriber instead of adding a new one.
2. In the **Columns** table, choose a **Field in this list** for each column you want to import. Map exactly one column to **Email address**. Columns set to **Do not import** are ignored. Global custom fields are shared by all of your lists.
3. Under **Tags**, select the tags every subscriber this sync adds or updates should get. Tags must exist on the list first.
4. Click **Next**.

[[SCREENSHOT: The Key and mapping step with source columns mapped to list fields]]

**Step 4: Behaviour**

1. Choose the **Mode**:
   - **Full** reads every row on each run. Choose it when you want contacts removed from your database to be handled in Octeth too.
   - **Incremental** reads only rows that changed since the last run. It is faster for large tables. Choose a **Watermark column** that grows whenever a row changes, such as `updated_at` or an auto-increment ID.
2. In **Rows removed from the source**, choose what happens to subscribers whose row is no longer in your database:
   - **Keep them in the list** (the default).
   - **Unsubscribe them from this list**.
   - **Delete them from this list**.
3. Choose how often the sync should **Run**, from every 15 minutes to every 4 weeks.
4. Decide whether to turn on **Autoresponders and journeys** (see the warning below).
5. Click **Create sync**.

The first run starts within a minute of saving.

::: info
An incremental sync cannot detect rows removed from your database, because it reads only rows that changed. Removed rows stay in the list. Choose **Full** if you want them unsubscribed or deleted. In full mode, removals happen only after a run read your whole source without an error, so a failed run never removes anyone.
:::

::: warning
**Autoresponders and journeys** is off by default, so synced subscribers are added and updated quietly. If you turn it on, every subscriber the sync adds starts the list's autoresponders and journeys and calls its web service integrations, just like a new signup. The first run adds every row of your source, so this can send email to your whole existing base at once. Turn it on only when that is what you want.
:::

### What a sync never changes

A sync respects the choices your contacts made in Octeth:

- A subscriber who **unsubscribed** stays unsubscribed. The sync does not resubscribe them, even when their row is still in your database.
- A subscriber whose address **hard bounced** is not updated.
- An address on a **suppression list** (the list's, your account's or the system-wide one) is not added or updated.
- New subscribers are added without a confirmation email, also on a double opt-in list.
- Only the fields you mapped are written. Other fields of a subscriber keep their values.

These rows are counted as **Skipped** in the run history. A removal behaviour skips them too.

The subscriber limit of your account still applies. Rows above the limit are counted as **Failed**.

### Run history

Click a sync on the **Sync** tab to open its run history. Each run shows when it started, whether it was scheduled or started with **Run now**, and how many rows it read, added, updated, left unchanged, removed, skipped and failed. A failed run shows its error.

[[SCREENSHOT: The run history of a sync with the counts of each run]]

From the Sync tab or the run history you can also:

- Click **Run now** to start a run within a minute instead of waiting for the schedule.
- Click **Edit** to change the sync. The next run uses the new settings.
- Choose **Pause** to stop scheduled runs, and **Resume** to start them again.
- Choose **Delete** to remove the sync and its run history. The subscribers it added stay in the list.

### When a sync keeps failing

If a run fails, for example because the database is unreachable or the password changed, the sync shows the error on the Sync tab and tries again at its next scheduled time. After **5 failed runs in a row**, Octeth pauses the sync so it stops retrying. Fix the cause, for example by editing the connection, then choose **Resume**. The sync runs again within a minute.

::: tip
A sync moved from the earlier synchronization settings is marked **Moved** on the Sync tab. Check its settings once after an upgrade. It keeps contacts whose rows leave the source, and it runs autoresponders for new subscribers, as the earlier sync did. It also connects without encryption, as the earlier sync did, and the Sync tab shows a warning until you edit it and turn on **Use an encrypted connection (TLS)**. Click **Test connection** after turning it on: if your server needs a CA certificate, add it as described in [Encrypted connections](#encrypted-connections).
:::

## Related Features

Lists serve as the central hub for many features in Octeth. The following articles cover list-level features in detail:

- **[Subscribers](./subscribers)** — Browse, add, import, edit, export, and manage subscribers within your lists.
- **[Custom Fields](./custom-fields)** — Create and manage additional data fields for storing subscriber information beyond the email address.
- **[Tags](./tags)** — Organize and categorize subscribers with lightweight labels.
- **[Segments](./segments)** — Build dynamic subscriber groups based on data and activity rules.
- **[Event Tracking](./event-tracking)** — Track website visitor behavior and attribute it to subscribers.
- **[Auto Responders](./auto-responders)** — Set up automated email sequences triggered by subscription events.
- **[Suppression Lists](./email-deliverability/suppression-lists)** — Manage email addresses that are blocked from receiving emails.
- **[SMS Messages](./sms-messages)** — Send SMS campaigns to subscribers with mobile phone data.
