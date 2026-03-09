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
