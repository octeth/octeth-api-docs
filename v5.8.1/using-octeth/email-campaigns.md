---
layout: doc
---

# Email Campaigns

Email campaigns are the core of your email marketing efforts in Octeth. A campaign is a single email message sent to one or more subscriber lists or segments. Campaigns allow you to reach your audience with newsletters, promotions, announcements, and other content — and then track how recipients interact with your emails through detailed statistics.

This article covers how to browse, create, configure, schedule, and manage email campaigns, as well as how to analyze campaign performance using built-in reports.

## Browsing Campaigns

To view your campaigns, navigate to **Campaigns** from the main menu. The campaigns page displays your campaigns organized by status category.

[[SCREENSHOT: Campaigns browse page showing the left sidebar with status categories, tag filters, saved filters, and the main campaign table with performance metrics]]

### Status Categories

The left sidebar groups campaigns into six status categories. Each category shows the number of campaigns in that status:

| Category | Description |
|---|---|
| **Sent** | Campaigns that have finished sending to all recipients. |
| **Outbox** | Campaigns that are currently being sent or are queued for immediate delivery. |
| **Draft** | Campaigns that have been created but not yet scheduled or sent. |
| **Scheduled** | Campaigns scheduled for a future date and time. |
| **Paused** | Campaigns that were paused during the sending process. |
| **Pending Approval** | Campaigns waiting for administrator approval before they can be sent. |

Click any status category to view only campaigns matching that status.

::: info
The **Pending Approval** category only appears when your administrator has enabled the approval workflow for your user group. If your campaigns do not require approval, this category is not displayed.
:::

### Campaign Table

The campaign table displays different columns depending on the selected status category.

#### Sent Campaigns

| Column | Description |
|---|---|
| **Checkbox** | Select individual campaigns for bulk actions. |
| **Campaign Name** | The campaign name, along with assigned tags, content type indicators (HTML/Plain), and the date the campaign was sent. Click the name to open the campaign overview page. |
| **Total Sent** | The number of emails successfully delivered. |
| **Open Rate** | The percentage of unique opens relative to total sent, with a color-coded indicator. |
| **Click Rate** | The percentage of unique clicks relative to total sent, with a color-coded indicator. |
| **CTOR** | Click-to-Open Rate — the percentage of recipients who clicked after opening the email. |
| **Campaign Health** | A visual indicator showing the overall health of the campaign based on bounce rate, unsubscribe rate, and spam reports. |

If a sent campaign has an auto-resend campaign associated with it, the auto-resend campaign appears as an indented row below the parent campaign, showing uplift metrics for additional opens and clicks gained.

#### Outbox Campaigns

| Column | Description |
|---|---|
| **Campaign Name** | The campaign name with tags and content type indicators. |
| **Send Date/Time** | The date and time when sending started or is queued. |
| **Quick Stats** | Real-time delivery progress statistics. |

#### Draft Campaigns

| Column | Description |
|---|---|
| **Campaign Name** | The campaign name with tags and content type indicators. |
| **Creation Date** | The date when the campaign was created. |

#### Scheduled Campaigns

| Column | Description |
|---|---|
| **Campaign Name** | The campaign name with tags. Recurring campaigns display a "Recursive x#" label showing how many times they have been sent. |
| **Estimated Recipients** | The estimated number of subscribers who will receive the campaign, based on the selected lists and segments. |
| **Scheduled Send Time** | The date, time, and timezone when the campaign is scheduled to send. |

#### Paused Campaigns

| Column | Description |
|---|---|
| **Campaign Name** | The campaign name with tags and content type indicators. |

#### Pending Approval Campaigns

| Column | Description |
|---|---|
| **Campaign Name** | The campaign name with tags. |

### Performance Metrics

For sent campaigns, Octeth displays color-coded performance badges next to each campaign:

- **Open Rate** — Green indicates strong performance, yellow indicates average, and red indicates below-average open rates.
- **Click Rate** — Uses the same color-coded system as open rate.
- **CTOR (Click-to-Open Rate)** — Measures how effective your email content is at driving clicks among those who opened it.

::: tip
CTOR is often a better measure of content quality than click rate alone, because it filters out the effect of subject line performance and focuses on how engaging the email body is.
:::

### Campaign Health

The campaign health indicator provides an at-a-glance view of your campaign's deliverability performance. It factors in bounce rates, unsubscribe rates, and spam reports. Click the health indicator to expand a detailed breakdown of the contributing metrics.

### Tags in the Campaign Listing

Campaigns can have one or more tags assigned to them. Tags appear as small labels next to the campaign name in the listing. You can filter campaigns by tag using the **Tags** section in the left sidebar.

### Pagination

When you have more campaigns than a single page can display, pagination controls appear at the bottom of the table. Navigate between pages using the numbered page links.

## Searching and Filtering Campaigns

The search bar above the campaign table allows you to find specific campaigns using free-text search or advanced query syntax.

[[SCREENSHOT: Campaign search bar with the search query helper modal open, showing available operators and searchable fields]]

### Free-Text Search

Type any text into the search bar and press enter to find campaigns matching your query. The search looks at campaign names by default.

### Search Query Syntax

For more precise searches, use the advanced query syntax. Click the help icon next to the search bar to open the **Search Query Helper**, which lists all available operators and fields.

**Available Operators:**

| Operator | Description |
|---|---|
| **Exact match** | Find campaigns where a field exactly matches a value. |
| **Partial match** | Find campaigns where a field contains a value. |
| **Greater than** | Find campaigns where a numeric field exceeds a value. |
| **Less than** | Find campaigns where a numeric field is below a value. |
| **Before** | Find campaigns with a date field before a specific date. |
| **After** | Find campaigns with a date field after a specific date. |

**Searchable Fields:**

You can search across more than 20 fields, including: `name`, `type`, `tag`, `created_at`, `sent_at`, `subject`, `html_email`, `plain_email`, `s2s`, `ga`, `recipient_count`, `recipient_list_id`, `recipient_segment_id`, `is_ab`, `open_rate`, `click_rate`, `conversion_rate`, `unsubscribe_rate`, and `hardbounce_rate`.

### Saved Filters

You can save frequently used search queries as named filters for quick access.

**To create a saved filter:**

1. Enter your search query in the search bar and apply it.
2. Click **Save Filter** in the toolbar.
3. Enter a **Filter Name** to identify the saved filter.
4. Optionally select an icon from the icon selector to visually distinguish the filter.
5. Click **Save**.

[[SCREENSHOT: Save Filter modal showing the filter name field, search query field, and icon selector grid]]

Saved filters appear in the left sidebar below the tag filters. Click a saved filter name to instantly apply it.

## Bulk Actions

The toolbar above the campaign table provides several bulk actions for managing multiple campaigns at once.

### Selecting Campaigns

Use the checkboxes next to each campaign to select individual campaigns, or use the **Select All** and **Select None** links to quickly select or deselect all campaigns on the current page.

### Deleting Campaigns

To delete multiple campaigns:

1. Select the campaigns you want to delete using the checkboxes.
2. Click **Delete** in the toolbar.
3. Confirm the deletion when prompted.

::: danger
Deleting a campaign is permanent and cannot be undone. All campaign data, statistics, and associated queue records are permanently removed.
:::

### Comparing Campaign Performance

You can compare the performance of multiple sent campaigns side by side:

1. Select between 2 and 5 sent campaigns using the checkboxes.
2. Click **Compare Performances** in the toolbar.

The comparison page displays a table and interactive chart comparing key metrics across the selected campaigns. See [Comparing Campaigns](#comparing-campaigns) for details.

### Assigning Tags

To assign a tag to one or more campaigns:

1. Select the campaigns using the checkboxes.
2. Click **Assign Tag** in the toolbar.
3. Select a tag from the dropdown menu.

The tag is immediately applied to all selected campaigns.

## Creating a Campaign

To create a new email campaign:

1. Navigate to **Campaigns** from the main menu.
2. Click **Create New Campaign**.

[[SCREENSHOT: Create New Campaign form showing the campaign name field, recipients multi-select dropdown, and exclude recipients dropdown]]

3. Fill in the campaign details:

| Field | Description |
|---|---|
| **Campaign Name** | A descriptive name for the campaign (required). Choose a name that clearly identifies the content or purpose, such as "March Newsletter" or "Spring Sale Announcement". |
| **Recipients** | Select one or more subscriber lists and/or segments to send the campaign to (required). The dropdown groups segments under their parent list. Select "All subscribers in [List Name]" to target an entire list, or select a specific segment to target a subset. |
| **Exclude Recipients** | Optionally select lists and/or segments to exclude from the campaign. Subscribers matching the exclusion criteria are removed from the recipient pool even if they match the included recipients. |

4. Click **Create Campaign**.

::: tip
Use the **Exclude Recipients** option to suppress specific segments from receiving the campaign. For example, include your full "Newsletter" list but exclude the "Recently Purchased" segment to avoid sending promotional content to recent buyers.
:::

::: info
You must have at least one subscriber list before creating a campaign. If no lists exist, a prompt appears with a link to create your first list.
:::

After creating the campaign, you are redirected to the campaign editing page where you can configure the email content, settings, and schedule.

## Campaign Navigation

When you are inside a campaign (for example, after clicking a campaign name from the browse page or after creating a new campaign), a left sidebar navigation panel provides access to all campaign-level features.

[[SCREENSHOT: Campaign navigation sidebar showing the Reports, Export, and Options sections with all navigation items]]

The sidebar is organized into three sections:

**Reports**

| Item | Description |
|---|---|
| **Overview** | Campaign performance dashboard with activity charts, key metrics, and sending progress. |
| **Funnel** | Visual conversion funnel showing the progression from sent to opened to clicked. |
| **Opens** | Detailed email open data, including subscriber-level activity. |
| **Clicks** | Link click data with individual link performance and subscriber-level activity. |
| **Conversions** | Server-to-server (S2S) conversion tracking data, if enabled for the campaign. |
| **Unsubscriptions** | Subscribers who unsubscribed as a result of this campaign. |

**Export**

| Item | Description |
|---|---|
| **CSV** | Download the current report section's data as a CSV file. |

**Options**

| Item | Description |
|---|---|
| **Edit Campaign** | Open the campaign editing page to modify settings, email content, or schedule. |
| **Delete Campaign** | Permanently delete the campaign and all associated data. |

::: info
The **Delete Campaign** option is only visible if you have the Campaign.Delete permission in your user group.
:::

## Editing a Campaign

The campaign editing page allows you to configure all aspects of your campaign before sending. The page is organized into tabs that appear based on your campaign's current state.

[[SCREENSHOT: Campaign edit page showing the Settings tab with campaign name, recipients, email button, and tracking options]]

### Settings Tab

The **Settings** tab is always available and contains the core campaign configuration.

#### Campaign Name

Edit the campaign name in the **Campaign Name** field. This name is for your internal reference and is not visible to recipients.

#### Recipients

The **Recipients** and **Exclude Recipients** dropdowns allow you to modify which subscribers receive the campaign. Each dropdown lists all your subscriber lists, with segments nested under their parent list.

::: warning
Recipients and excluded recipients can only be modified while the campaign is in **Draft** or **Ready** status. Once a campaign starts sending, is paused, or has been sent, the recipient selection becomes read-only.
:::

#### Publish on RSS

Check the **Publish on RSS** checkbox to include this campaign in your RSS campaign archive feed. When enabled, the campaign content becomes available through your account's RSS feed URL after it is sent.

#### Email Content

The Settings tab includes a button to create or edit the email content for the campaign:

- If no email has been created yet, click **Create Email** to open the email builder and design your campaign email.
- If an email is already attached, click **Edit Email** to modify the existing email content.

The email builder is a separate interface where you design your email's subject line, sender information, HTML content, plain text content, and preheader text. For details on using the email builder, see [Email Builder](./email-builder).

::: info
The email content button is only available while the campaign is in **Draft** or **Ready** status. For sent or sending campaigns, the email content is locked.
:::

#### Server-to-Server (S2S) Tracking

S2S tracking enables conversion tracking by appending a unique tracking parameter to links in your email. When a recipient clicks a link and later completes a conversion on your website, a server-to-server postback notifies Octeth of the conversion.

To enable S2S tracking:

1. Check the **Enable S2S Postback** checkbox.
2. The **S2S URL Parameter** field displays the parameter name (default: `ocrid`) that will be appended to links in your email.
3. The **S2S Postback URL** field displays the URL your website should call to report conversions.

::: tip
Copy the S2S URL parameter and postback URL values, and configure your website or landing page to call the postback URL when a conversion occurs. Pass the `ocrid` value from the original click-through URL as a parameter in the postback request.
:::

#### Google Analytics Integration

Enable Google Analytics tracking to automatically append UTM parameters to all links in your campaign email.

To enable Google Analytics:

1. Check the **Enable Google Analytics** checkbox.
2. Enter your website domain(s) in the **Google Analytics Domains** field that appears.

When enabled, Octeth appends `utm_source`, `utm_medium`, `utm_campaign`, and other UTM parameters to links that match the specified domains, allowing you to track campaign traffic in your Google Analytics dashboard.

### Schedule Tab

The **Schedule** tab appears when the campaign has an email attached and the campaign is in **Draft** or **Ready** status. This tab controls when and how the campaign is delivered.

[[SCREENSHOT: Campaign edit page showing the Schedule tab with the schedule type dropdown, date picker, time selector, and timezone dropdown]]

#### Schedule Type

Select a scheduling option from the **Schedule Type** dropdown:

| Schedule Type | Description |
|---|---|
| **Immediate** | The campaign begins sending as soon as you save the settings. |
| **Future** | The campaign is scheduled to send at a specific date and time. |
| **Recurring** | The campaign sends repeatedly on a defined schedule. |
| **Not Scheduled** | The campaign remains as a draft and does not send. |

#### Scheduling for a Future Date

When you select **Future** as the schedule type:

1. Select a **Timezone** from the timezone dropdown. This defaults to your account's timezone.
2. Pick a **Send Date** using the inline calendar date picker.
3. Select a **Send Time** using the hour and minute dropdowns. Minutes are available in 5-minute intervals.
4. Click **Save** to schedule the campaign.

The campaign status changes to **Scheduled** and appears in the Scheduled category on the campaigns browse page.

::: tip
Always verify the timezone selection when scheduling campaigns. The send time is interpreted in the selected timezone, which may differ from your local time.
:::

#### Setting Up a Recurring Schedule

When you select **Recurring** as the schedule type, additional configuration options appear to define the recurrence pattern.

**Day Pattern:**

Select a day pattern from the **Day** dropdown:

| Option | Description |
|---|---|
| **Every day** | Sends every day of the week. |
| **Every weekday** | Sends Monday through Friday only. |
| **Monday, Wednesday, and Friday** | Sends on these three days only. |
| **Tuesday and Thursday** | Sends on these two days only. |
| **Days of week** | Manually select specific days of the week from a multi-select list. |
| **Days of month** | Enter specific day numbers (1-31) as a comma-separated list. |

**Month Pattern:**

Select a month pattern from the **Month** dropdown:

| Option | Description |
|---|---|
| **Every month** | Sends every month of the year. |
| **Months of year** | Manually select specific months from a multi-select list. |

**Time:**

Select one or more hours and minutes from the multi-select dropdowns. The campaign sends at each selected time combination on the scheduled days.

**Maximum Instances:**

Optionally enter a number in the **Maximum Send Instances** field to limit the total number of times the recurring campaign sends. Leave this field empty for unlimited recurring sends.

A human-readable summary of the schedule pattern appears below the configuration fields. For example: "On Monday, Wednesday and Friday at 10:00, 14:00 every month."

Click **Save** to activate the recurring schedule.

::: info
Each time a recurring campaign sends, it is tracked as a separate instance. You can view the history of all recurring send instances on the campaign overview page, where the instance count is displayed as "Recursive x#" in the campaign listing.
:::

## Campaign Overview

The campaign overview page is the primary dashboard for monitoring a campaign's performance. Navigate to a campaign by clicking its name in the campaigns browse page, or by clicking **Overview** in the campaign navigation sidebar.

[[SCREENSHOT: Campaign overview page showing the activity chart, metric sparklines, campaign statistics box with pie chart, and action buttons]]

### Campaign Header

The campaign overview header displays:

- The **campaign name** as the page title.
- **Status badges** showing the current campaign status and any assigned tags.
- A **Quick Email Preview** button that opens a preview of the campaign email in a new browser tab.
- A **Share** menu with options to share the campaign archive link on Twitter, Facebook, LinkedIn, or copy the link to your clipboard.

### Campaign Status and Actions

Depending on the campaign's current status, different action buttons appear in the overview:

| Button | Shown When | Action |
|---|---|---|
| **Pause** | Campaign is actively sending. | Pauses the sending process. Remaining recipients are not sent to until the campaign is resumed. |
| **Resume** | Campaign is paused. | Resumes sending to remaining recipients from where it left off. |
| **Cancel Schedule** | Campaign is scheduled for a future date or set up as recurring. | Cancels the schedule and returns the campaign to draft status. |
| **Cancel Sending** | Campaign is sending or queued for immediate delivery. | Stops the sending process. Already-sent emails are not affected. |

#### Send Progress Bar

While a campaign is actively sending or paused, an animated progress bar displays the percentage of emails that have been sent relative to the total recipients.

### Activity Chart

The activity chart visualizes campaign engagement over time. Two chart views are available via tabs:

- **Opens vs Clicks** — A line chart comparing daily unique opens and unique clicks.
- **Opens vs Unsubscriptions** — A line chart comparing daily unique opens and unsubscriptions.

Use the date range selector to switch between **7 days**, **15 days**, and **30 days** of data.

### Metric Sparklines

The left column of the overview displays key metrics, each with a sparkline chart showing the trend over time:

| Metric | Description |
|---|---|
| **Unique Opens** | The number of individual recipients who opened the email. The peak day is highlighted. |
| **Unique Clicks** | The number of individual recipients who clicked a link. The peak day is highlighted. |
| **Unique Conversions** | The number of individual recipients who completed a tracked conversion (requires S2S tracking). |
| **Unique Forwards** | The number of individual recipients who forwarded the email. |
| **Browser Views** | The number of times recipients viewed the email in a web browser using the "view in browser" link. |
| **Total Unsubscriptions** | The number of recipients who unsubscribed from the list as a result of this campaign. |
| **Total Bounces** | The total number of bounced emails, with a breakdown showing the percentage of hard bounces versus soft bounces. |

### Campaign Statistics Box

The right column displays a summary statistics box with:

- A **pie chart** showing the breakdown of sent, opened, and unopened emails.
- **Total Sent** — The number of emails successfully sent.
- **Send Completed** — The date and time when sending finished.
- **Email Throughput** — The sending speed in emails per second (displayed when campaign delivery profiling is enabled).
- **Total Recipients** — The total number of intended recipients.
- **Total Failed** — The number of emails that failed to send.
- **Spam Reports** — The number and percentage of spam complaints.
- **Open Ratio** — The unique open rate as a prominent percentage.
- **Conversion Ratio** — The unique conversion rate percentage (when S2S is enabled).
- **Bounce Ratio** — The total bounce rate percentage.

### Most Clicked Links

Below the main statistics, a table displays the most clicked links from the campaign:

| Column | Description |
|---|---|
| **Link URL** | The destination URL of the link. |
| **Click Count** | The total number of clicks on this link. |
| **Click Percentage** | The percentage of total clicks attributed to this link. |

### Exporting Bounce Data

Two export options are available below the bounce metrics:

- **Export Bounced Subscribers to CSV** — Downloads a CSV file containing all bounced subscriber records.
- **Download List of Bounced Email Addresses** — Downloads a plain text list of bounced email addresses.

## Campaign Reports

The campaign navigation sidebar provides access to detailed report views for each type of engagement metric. Each report displays subscriber-level data and supports CSV export.

### Funnel Report

The funnel report provides a visual conversion funnel showing how recipients progressed through each stage of engagement:

1. **Sent** — Total emails delivered.
2. **Opened** — Recipients who opened the email.
3. **Clicked** — Recipients who clicked a link.
4. **Converted** — Recipients who completed a tracked conversion (if S2S is enabled).

[[SCREENSHOT: Campaign funnel report showing the visual funnel with counts and percentages at each stage]]

The funnel helps identify where recipients drop off, indicating whether your subject line, email content, or call-to-action needs improvement.

### Opens Report

The opens report displays detailed data about email opens:

- A summary of total opens and unique opens.
- A breakdown of opens by day.
- A subscriber activity table showing which recipients opened the email, along with the date and time of each open.

[[SCREENSHOT: Campaign opens report showing open statistics and the subscriber activity table with email addresses and open timestamps]]

### Clicks Report

The clicks report displays detailed data about link clicks:

- A summary of total clicks and unique clicks.
- A breakdown of click performance by individual link URL.
- A subscriber activity table showing which recipients clicked, which link they clicked, and the date and time.

### Conversions Report

The conversions report displays server-to-server conversion data:

- A summary of total conversions and unique conversions.
- Conversion values and channels (if tracked).
- A subscriber activity table showing which recipients converted.

::: info
The conversions report only contains data when S2S tracking is enabled for the campaign and your website sends postback notifications to Octeth. See [Server-to-Server (S2S) Tracking](#server-to-server-s2s-tracking) for setup details.
:::

### Unsubscriptions Report

The unsubscriptions report shows recipients who unsubscribed from the list as a result of this campaign:

- A summary of total unsubscriptions.
- A subscriber activity table showing which recipients unsubscribed and the date.

### Exporting Report Data

Each report section supports CSV export. Click **CSV** in the Export section of the navigation sidebar to download the current report's data as a CSV file. The export contains the same data displayed in the report's subscriber activity table.

## Campaign Actions

### Pausing a Campaign

To pause a campaign that is currently sending:

1. Navigate to the campaign's overview page.
2. Click the **Pause** button.

The campaign status changes to **Paused**. Emails that have already been sent are not affected. Remaining recipients in the queue are held until the campaign is resumed.

::: info
A campaign may also be paused automatically by the system if it encounters an issue during delivery, such as running out of sending credits or exceeding a sender domain limit. The campaign status reason indicates why it was paused.
:::

### Resuming a Paused Campaign

To resume a paused campaign:

1. Navigate to the campaign's overview page.
2. Click the **Resume** button.

The campaign status changes back to **Ready** and sending continues from where it left off.

### Canceling a Scheduled Campaign

To cancel a campaign that is scheduled for a future date or set up as recurring:

1. Navigate to the campaign's overview page.
2. Click **Cancel Schedule**.

The campaign's schedule is removed and it returns to draft status. You can edit the campaign and reschedule it at any time.

### Copying a Campaign

To duplicate an existing campaign:

1. Navigate to the campaigns browse page.
2. Locate the campaign you want to copy.
3. Click the **Resend** or **Copy** action link next to the campaign.

A new campaign is created with the same name, recipients, email content, and settings as the original. The new campaign starts in draft status so you can make changes before sending.

::: tip
Copying a sent campaign is an efficient way to resend similar content to the same or different audience. After copying, update the campaign name, modify the email content if needed, and schedule it for delivery.
:::

### Deleting a Campaign

To delete a single campaign:

1. Navigate to the campaign's overview page.
2. Click **Delete Campaign** in the Options section of the navigation sidebar.
3. Confirm the deletion when prompted.

::: danger
Deleting a campaign is permanent and cannot be undone. All campaign data including statistics, queue records, and engagement history are permanently removed.
:::

## Auto-Resend Campaigns

Auto-resend is a feature that automatically sends a follow-up email to recipients who did not open the original campaign. This helps increase overall open rates without requiring you to manually create and send a second campaign.

[[SCREENSHOT: Campaign edit page showing the auto-resend configuration with the enable checkbox, wait days, subject, and preheader fields]]

### How Auto-Resend Works

When auto-resend is enabled for a campaign:

1. The original campaign is sent as usual.
2. After the specified wait period, Octeth identifies recipients who did not open the original email.
3. A new child campaign is automatically created and sent only to those non-openers.
4. The child campaign uses the same email content but with a different subject line and optional preheader text.

### Configuring Auto-Resend

To enable auto-resend on a campaign:

1. Navigate to the campaign editing page.
2. Enable the **Auto-Resend** option.
3. Configure the auto-resend settings:

| Field | Description |
|---|---|
| **Wait Days** | The number of days to wait after the original campaign finishes sending before sending the auto-resend. Must be at least 1 day. |
| **Subject** | The subject line for the auto-resend email (required). Use a different subject to increase the chance of the email being opened. |
| **Pre-Header Text** | Optional preheader text for the auto-resend email. This text appears as a preview in many email clients. |

4. Save the campaign settings.

::: tip
Use a significantly different subject line for the auto-resend to catch the attention of recipients who may have skipped the original email. For example, if the original subject was "Spring Collection Now Available", the auto-resend might use "Don't Miss Our New Spring Styles".
:::

### Viewing Auto-Resend Results

After the auto-resend campaign has been sent, you can view its performance:

- On the campaigns browse page, the auto-resend campaign appears as an indented row below its parent campaign, showing uplift metrics — the percentage increase in opens and clicks gained from the resend.
- On the parent campaign's overview page, an **Auto-Resend Campaign Information** section displays the child campaign details, metrics comparison, and configuration.

## Comparing Campaigns

The campaign comparison feature allows you to evaluate the performance of multiple sent campaigns side by side.

[[SCREENSHOT: Campaign comparison page showing a metrics table with multiple campaigns and an interactive chart]]

### Starting a Comparison

1. Navigate to the campaigns browse page.
2. Select between 2 and 5 sent campaigns using the checkboxes.
3. Click **Compare Performances** in the toolbar.

### Comparison Table

The comparison page displays a table with the following columns:

| Column | Description |
|---|---|
| **Campaign Name** | The name of each campaign being compared. |
| **Total Recipients** | The total number of intended recipients. |
| **Send Date** | The date the campaign was sent. |
| **Unique Opens** | The number of unique recipients who opened the email. |
| **Unique Clicks** | The number of unique recipients who clicked a link. |
| **Unique Forwards** | The number of unique recipients who forwarded the email. |
| **Browser Views** | The number of times the email was viewed in a web browser. |
| **Total Unsubscriptions** | The number of recipients who unsubscribed. |
| **Total Bounces** | The total number of bounced emails. |

Click any column header to select it as the metric displayed in the interactive chart below the table. The selected column is highlighted.

### Exporting Comparison Data

Click the export option to download the comparison data as a CSV file.

## Campaign Archives

Campaign archives allow you to make sent campaign emails available through a public RSS feed. This is useful for maintaining an email archive on your website or for syndicating campaign content.

### Enabling RSS Publishing

To include a campaign in the RSS archive:

1. Open the campaign editing page.
2. Check the **Publish on RSS** checkbox in the Settings tab.
3. Save the campaign.

When the campaign is sent, its content becomes available through the RSS archive feed URL.

### Archive URL

The campaign archive feed URL is available from the campaigns browse page. Click the **Campaign Archives** link in the left sidebar to access the archive URL. Share this URL on your website or with subscribers who prefer to read your campaigns via an RSS reader.

## Recurring Campaigns

Recurring campaigns allow you to send the same email content on a repeating schedule without manually creating a new campaign each time. This is ideal for regular communications such as weekly digests, daily reports, or monthly summaries.

### Setting Up a Recurring Campaign

1. Create a campaign and configure the email content as described in [Creating a Campaign](#creating-a-campaign) and [Editing a Campaign](#editing-a-campaign).
2. Navigate to the **Schedule** tab.
3. Select **Recurring** from the **Schedule Type** dropdown.
4. Configure the day pattern, month pattern, time, and optional maximum instances as described in [Setting Up a Recurring Schedule](#setting-up-a-recurring-schedule).
5. Save the campaign.

### Managing a Recurring Campaign

Once activated, a recurring campaign:

- Appears in the **Scheduled** category on the campaigns browse page.
- Displays a "Recursive x#" label showing how many times it has been sent.
- Sends automatically at each scheduled time according to the recurrence pattern.
- Stops automatically when the maximum send instances is reached (if configured).

To stop a recurring campaign, navigate to the campaign overview page and click **Cancel Schedule**. The campaign returns to draft status and no further recurring sends occur.

### Viewing Recurring Campaign History

Each recurring send instance is logged. The campaign overview page and the "Recursive x#" counter in the campaign listing reflect the total number of times the campaign has been sent.

::: tip
When using recurring campaigns, keep in mind that the same email content is sent each time. If you need dynamic content in recurring emails (such as the latest news or updated data), consider using the email's fetch-from-URL feature to pull content from a URL at send time.
:::

## Campaign Lifecycle

Understanding the campaign lifecycle helps you manage campaigns effectively. A campaign progresses through the following statuses:

| Status | Description |
|---|---|
| **Draft** | The campaign has been created but has no schedule set. It can be freely edited. |
| **Ready** | The campaign is configured and either scheduled for future delivery or queued for immediate sending. |
| **Sending** | The campaign is actively being sent to recipients. |
| **Paused** | Sending has been paused, either manually or by the system. |
| **Sent** | All recipients have been processed and sending is complete. |
| **Failed** | The campaign encountered a critical error during sending, such as a missing email template or a content configuration issue. |
| **Pending Approval** | The campaign is awaiting administrator approval before it can be sent. |

::: info
When a campaign is paused by the system (for example, due to running out of sending credits or exceeding a sender domain sending limit), the campaign overview page displays a reason message explaining why the campaign was paused. Resolve the underlying issue and click **Resume** to continue sending.
:::

### Status Transitions

The following diagram shows how campaigns move between statuses:

```
Draft → Ready (schedule set or immediate send selected)
Ready → Sending (delivery begins)
Sending → Sent (delivery completes)
Sending → Paused (manually paused or system-paused)
Paused → Ready (resumed)
Ready → Draft (schedule canceled)
Ready/Sending → Failed (critical error)
```

## Tips and Best Practices

::: tip
**Name your campaigns descriptively.** Use names that include the date, audience, and purpose — for example, "2026-03 Newsletter - Premium Subscribers". This makes it easier to find and compare campaigns later.
:::

::: tip
**Use segments to target specific audiences.** Instead of sending to an entire list, create segments based on subscriber activity, preferences, or custom field data. Targeted campaigns typically achieve higher engagement rates.
:::

::: tip
**Test before sending.** Use the email preview and test email features in the email builder to verify your email renders correctly across different email clients before scheduling the campaign.
:::

::: tip
**Monitor campaign health.** After sending, check the campaign health indicator for early signs of deliverability issues. High bounce rates or spam complaints may indicate list quality problems or content concerns that should be addressed before your next campaign.
:::

::: tip
**Schedule during optimal times.** Review your list statistics to identify the days and times when your subscribers are most likely to engage, and schedule your campaigns accordingly.
:::
