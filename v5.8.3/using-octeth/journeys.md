---
layout: doc
---

# Journeys

Journeys are automated, multi-step workflows that guide subscribers through a sequence of actions based on their behavior and attributes. Unlike one-time email campaigns, journeys run continuously — each subscriber enters the journey when a trigger event occurs and then progresses through the workflow at their own pace.

Use journeys to build onboarding sequences, nurture campaigns, re-engagement flows, and other automated communications that respond to how subscribers interact with your emails, lists, and website.

This article covers how to browse, create, design, and manage journeys, as well as how to analyze journey performance using built-in reports.

## Browsing Journeys

To view your journeys, navigate to **Journeys** from the main menu. The journeys page displays all of your journeys along with their performance metrics.

[[SCREENSHOT: Journeys listing page showing the left sidebar with status filters, the performance chart, date range toolbar, and the journey data table with metrics columns]]

### Status Filters

The left sidebar groups journeys by status:

| Status | Description |
|---|---|
| **Enabled** | Journeys that are actively running. New subscribers can enter these journeys, and existing subscribers continue progressing through them. |
| **Disabled** | Journeys that are paused. No new subscribers can enter, and existing subscribers do not progress. |

Each status shows the number of journeys in that category. Click a status to filter the list.

### Performance Chart

At the top of the page, a line chart displays **Emails Sent** versus **Emails Opened** across all journeys for the selected date range. This gives you a quick visual overview of your journey email engagement trends.

### Date Range Filtering

Use the date range toolbar above the journey table to control the time period for all displayed metrics:

1. Select a preset from the dropdown: **This Week**, **Last Week**, **Last 7 Days**, **This Month**, **Last Month**, or **Last 30 Days**.
2. Alternatively, select **Custom Range** and pick specific start and end dates using the date pickers.
3. Click **Apply** to refresh the metrics.

::: info
The default date range is **Last 30 Days**. All metrics in the journey table and chart reflect the selected date range.
:::

### Journey Table

The journey table displays the following columns:

| Column | Description |
|---|---|
| **Name** | The journey name. Click the expand icon to reveal individual email action rows within the journey. |
| **Sent** | The total number of emails sent by the journey during the selected date range. |
| **Opened** | The open rate percentage and total number of unique opens. |
| **Clicked** | The click rate percentage and total number of unique clicks. |
| **Bounced** | The bounce rate percentage and total number of bounces. |
| **Unsubscribed** | The unsubscribe rate percentage and total number of unsubscriptions. |
| **Complained** | The spam complaint rate percentage and total number of complaints. |
| **Total Revenue** | The total revenue attributed to this journey during the selected date range. |

### Expanding Email Actions

Click the expand icon next to a journey name to reveal the individual email actions within that journey. Each email action row shows its own metrics (sent, opened, clicked, etc.), allowing you to compare the performance of different emails within the same journey.

If any email templates have been deleted since they were used in the journey, their combined metrics appear in a separate row labeled as deleted email metrics.

### Row Actions

Each journey row provides the following actions:

| Action | Description |
|---|---|
| **Report** | Opens the journey overview page with detailed performance reporting. |
| **Show Emails** / **Hide Emails** | Expands or collapses the individual email action rows. |
| **Edit** | Opens the journey design page where you can modify the workflow. |
| **Copy** | Creates a duplicate of the journey. The copy starts in disabled status. |
| **Enable** / **Disable** | Toggles the journey between enabled and disabled status. |

### Journey Actions Menu

The **Journey Actions** dropdown menu in the page header provides bulk operations:

- **Export as CSV** — Downloads the journey list and metrics as a CSV file.
- **Disable All Journeys** — Disables all currently enabled journeys. A confirmation dialog appears before this action is executed.

### Pagination

When you have more journeys than a single page can display, pagination controls appear at the bottom of the table. Navigate between pages using the numbered page links.

## Creating a Journey

To create a new journey:

1. Navigate to **Journeys** from the main menu.
2. Click **Create a Journey**.
3. Enter a **Journey Name** in the text field. Choose a descriptive name that identifies the purpose of the journey, such as "Welcome Onboarding Sequence" or "Re-engagement Flow".
4. Click **Create Journey**.

[[SCREENSHOT: Create Journey page showing the journey name field and the Create Journey button]]

After creating the journey, you are redirected to the journey design page where you can configure the trigger and add actions.

::: tip
Give your journey a clear, descriptive name. Since you may have many journeys running simultaneously, a good naming convention helps you identify each journey's purpose at a glance.
:::

## Journey Navigation

When you are inside a journey (after clicking a journey name or creating a new one), a left sidebar navigation panel provides access to the journey's pages:

| Item | Description |
|---|---|
| **Overview** | The journey reporting dashboard with performance metrics, quick stats, and filtering options. |
| **Design** | The visual journey builder where you configure the trigger, add actions, and define the workflow. |

## Designing a Journey

The journey design page is where you build and configure your journey workflow using a visual drag-and-drop builder.

[[SCREENSHOT: Journey design page showing the visual builder canvas with a trigger node at the top, connected action nodes below it, and the canvas control buttons in the top-right corner]]

### The Journey Builder Canvas

The journey builder provides a visual canvas where you design your workflow as a vertical flow of connected nodes. Each node represents either a trigger (the starting point) or an action (a step in the workflow). Nodes are connected by lines that show the sequence subscribers follow as they progress through the journey.

The workflow always starts with a single **trigger node** at the top. Below the trigger, you add **action nodes** that execute in sequence from top to bottom.

### Canvas Controls

The top-right corner of the canvas provides several control buttons:

| Control | Description |
|---|---|
| **Stats Toggle** | Expands or collapses inline performance metrics displayed on each node. |
| **Fit to Screen** | Adjusts the zoom level and position to fit all nodes within the visible canvas area. |
| **Center on Trigger** | Centers the view on the trigger node and zooms in. |
| **Auto-Layout** | Automatically arranges all nodes with consistent spacing and alignment. |
| **Zoom Controls** | Zoom in, zoom out, and display the current zoom percentage. Click the percentage to reset to 100%. Zoom range is 10% to 200%. |

### Header Actions

The journey design page header provides the following actions:

| Button | Description |
|---|---|
| **Save** | Saves all changes to the journey workflow. Always save after making changes. |
| **Enable** / **Disable** | Toggles the journey between enabled and disabled status. |
| **Delete** | Permanently deletes the journey and all associated data. A confirmation dialog appears before deletion. |

::: warning
Changes to the journey workflow are not saved automatically. Always click **Save** after adding, removing, or configuring nodes.
:::

## Triggers

Every journey begins with a trigger — the event that causes a subscriber to enter the journey. The trigger node is always the first node at the top of the canvas and cannot be deleted or moved.

### Trigger Types

Octeth supports the following trigger types:

| Trigger | Description |
|---|---|
| **Manual** | Subscribers are added to the journey manually through the API or user interface. Use this for journeys you want to control programmatically. |
| **List Subscription** | Triggers when a subscriber is added to a list. You can monitor any list or select specific lists. |
| **List Unsubscription** | Triggers when a subscriber is removed from a list. You can monitor any list or select specific lists. |
| **Tag** | Triggers when a specific tag is added to a subscriber. |
| **Untag** | Triggers when a specific tag is removed from a subscriber. |
| **Email Open** | Triggers when a subscriber opens an email. You can monitor any email or select a specific email. |
| **Email Link Click** | Triggers when a subscriber clicks a link in an email. You can monitor any email or select a specific email. |
| **Custom Field Value Changed** | Triggers when a subscriber's custom field value changes. You can monitor all lists and fields, or select a specific list and custom field. |

### Configuring a Trigger

To configure the trigger:

1. Click the **Configure** button on the trigger node.
2. A configuration panel opens with fields specific to the selected trigger type.
3. Fill in the required fields (described below for each trigger type).
4. Close the configuration panel. Your changes are applied immediately.

A green checkmark on the trigger node indicates the trigger is properly configured. A red exclamation mark indicates the trigger needs configuration.

#### Manual Trigger

The manual trigger has no specific configuration beyond the common settings. Subscribers enter this journey only when triggered through the API or user interface.

#### List Subscription / List Unsubscription

| Field | Description |
|---|---|
| **Trigger Scope** | Choose **Any List** to trigger for all lists, or **Specific Lists** to select particular lists. |
| **Trigger Lists** | When using specific lists, select one or more lists from the dropdown. Only shown when **Specific Lists** is selected. |

#### Tag / Untag

| Field | Description |
|---|---|
| **Trigger Tag** | Select the tag that triggers the journey when it is added to (or removed from) a subscriber. |

#### Email Open / Email Link Click

| Field | Description |
|---|---|
| **Trigger Email** | Select **Any Email** to trigger for all emails, or choose a specific email from the dropdown. |

#### Custom Field Value Changed

| Field | Description |
|---|---|
| **What to Monitor** | Select **Monitor all lists and custom fields** to trigger for any field change, or choose a specific list and custom field from the grouped dropdown. |

### Rate Limiting

All trigger types support rate limiting to control how many subscribers can enter the journey within a given time period:

| Field | Description |
|---|---|
| **Max Triggers Per Hour** | The maximum number of subscribers that can enter the journey per hour. Set to `0` for unlimited. |
| **Max Triggers Per Day** | The maximum number of subscribers that can enter the journey per day. Set to `0` for unlimited. |

::: tip
Rate limiting is useful for high-volume journeys where you want to control the pace of subscriber entry. For example, if a journey sends an email immediately upon entry, rate limiting helps prevent overwhelming your email sending infrastructure.
:::

### Administrative Notes

All triggers include an **Administrative Notes** field where you can add internal notes about the trigger configuration. These notes are not visible to subscribers and serve as documentation for your team.

## Actions

Actions are the individual steps that make up your journey workflow. Each action performs a specific task — sending an email, waiting for a period of time, making a decision based on subscriber attributes, and more.

### Adding an Action

To add a new action to your journey:

1. Click the **+** button that appears below the last node in the workflow (or below any existing action node).
2. The **Action Selection** modal opens, displaying all available action types.
3. Browse the available actions or use the **Search** field to filter by name.
4. Click on an action to add it to the workflow.

[[SCREENSHOT: Action Selection modal showing the search field, category filter, and action cards organized by category]]

The new action node is inserted into the workflow and connected to the preceding node. You can then configure the action by clicking its **Configure** button.

### Action Categories

Actions are organized into the following categories:

#### Communication

| Action | Description |
|---|---|
| **Send Email** | Sends an email to the subscriber using a pre-designed email template. |
| **Send SMS** | Sends an SMS message to the subscriber through a configured SMS gateway. |

#### Timing and Flow Control

| Action | Description |
|---|---|
| **Wait** | Pauses the subscriber's progress for a specified amount of time before continuing to the next action. |
| **Decision** | Evaluates subscriber attributes and branches the workflow into **True** and **False** paths based on the result. |

#### Subscriber Management

| Action | Description |
|---|---|
| **Subscribe** | Subscribes the subscriber to a specified list. |
| **Unsubscribe** | Unsubscribes the subscriber from a specified list. |
| **Delete Subscriber** | Permanently deletes the subscriber from the system. |

#### Tags and Fields

| Action | Description |
|---|---|
| **Add Tag** | Adds a specified tag to the subscriber. |
| **Remove Tag** | Removes a specified tag from the subscriber. |
| **Update Custom Field Value** | Updates a custom field on the subscriber's record with a new value. |

#### Journey Control

| Action | Description |
|---|---|
| **Start Journey** | Enrolls the subscriber into another journey. |
| **Exit This Journey** | Removes the subscriber from the current journey. |
| **Exit All Other Journeys** | Removes the subscriber from all other journeys they are currently enrolled in, while keeping them in the current journey. |
| **Exit All Journeys** | Removes the subscriber from all journeys, including the current one. |

#### Integration

| Action | Description |
|---|---|
| **Webhook** | Sends an HTTP POST request to an external URL with subscriber data and custom payload fields. |

### Configuring Actions

Each action type has its own configuration fields. Click the **Configure** button on any action node to open its configuration panel.

#### Send Email

[[SCREENSHOT: Send Email configuration panel showing the email dropdown, from name, from email with sender domain, reply-to fields, and CC/BCC sections]]

| Field | Description |
|---|---|
| **Email** | Select the email template to send from the dropdown. |
| **From Name** | The sender name that appears in the recipient's inbox. |
| **From Email** | The sender email address, composed of a username and a selected sender domain. |
| **Reply-To Name** | (Optional) The name used when a recipient replies to the email. |
| **Reply-To Email** | (Optional) The email address that receives replies. |
| **CC** | (Optional) Add one or more CC recipients. Click **+ Add CC Recipient** to add additional entries. Each entry requires a name and email address. |
| **BCC** | (Optional) Add one or more BCC recipients. Click **+ Add BCC Recipient** to add additional entries. Each entry requires a name and email address. |

::: info
You must have at least one email template created before configuring the Send Email action. If no emails exist, a message prompts you to create one first.
:::

#### Send SMS

| Field | Description |
|---|---|
| **Message** | The SMS message text. A character counter displays the remaining characters. Supports personalization merge tags. |
| **Include Tracking Link** | Enable this toggle to append a trackable link to the SMS message. When enabled, additional fields appear for the link URL, expiry hours, and UTM parameters. |
| **SMS Gateway** | Select the SMS gateway to use for delivery. |
| **Sender ID** | Choose **Use gateway default** or select a specific sender number from the dropdown. |
| **Priority** | Select **Normal Priority** or **High Priority**. |
| **Max Retry Attempts** | The number of times to retry delivery if the initial attempt fails (0 to 10, default: 3). |
| **Skip if No Phone Number** | Enable this toggle to silently skip subscribers who do not have a phone number, rather than logging an error. |
| **Enable Delivery Window** | Enable this toggle to restrict SMS delivery to specific days and times. When enabled, additional fields appear for timezone, start time, end time, and allowed days of the week. |

#### Wait

| Field | Description |
|---|---|
| **Amount** | The number of time units to wait (minimum: 1). |
| **Unit** | The time unit: **Seconds**, **Minutes**, **Hours**, or **Days**. |
| **Enable Delivery Window** | Enable this toggle to restrict when the subscriber advances past the wait step. When enabled, additional fields appear. |
| **Allowed Days** | Select which days of the week the subscriber can proceed. Use the **Weekdays** or **All Days** quick-select buttons. |
| **Don't Send Before** | The earliest time of day the subscriber can proceed (HH:MM format). |
| **Don't Send After** | The latest time of day the subscriber can proceed (HH:MM format). |

::: tip
Use the delivery window option on Wait actions to ensure subscribers advance to the next action (such as sending an email) only during appropriate hours. For example, set the window to weekdays between 09:00 and 17:00 to avoid sending business emails on weekends or late at night.
:::

#### Decision

The Decision action evaluates one or more criteria against the subscriber's attributes and routes them down either the **True** path or the **False** path. See [Decision Branching](#decision-branching) for a detailed explanation.

| Field | Description |
|---|---|
| **Criteria Logic** | Choose **AND** (all criteria must match) or **OR** (any criteria can match). |
| **Decision Criteria** | Define one or more conditions using the visual criteria builder. |

#### Subscribe / Unsubscribe

| Field | Description |
|---|---|
| **Target List** | Select the subscriber list to subscribe to or unsubscribe from. |

#### Delete Subscriber

This action permanently deletes the subscriber from the system. No additional configuration fields are required beyond the common settings.

::: danger
The Delete Subscriber action is irreversible. Once a subscriber is deleted, all of their data — including custom field values, activity history, and journey entries — is permanently removed.
:::

#### Add Tag / Remove Tag

| Field | Description |
|---|---|
| **Select Tag** | Choose the tag to add or remove from a dropdown grouped by list. The subscriber must belong to the corresponding list for the tag operation to succeed. |

#### Update Custom Field Value

| Field | Description |
|---|---|
| **Custom Field** | Select the custom field to update from a dropdown grouped by list. |
| **New Value** | Enter the new value for the custom field. Supports personalization merge tags. |

#### Start Journey

| Field | Description |
|---|---|
| **Journey** | Select the target journey to enroll the subscriber in. |

#### Exit This Journey / Exit All Other Journeys / Exit All Journeys

These actions remove the subscriber from one or more journeys. No additional configuration fields are required beyond the common settings.

#### Webhook

| Field | Description |
|---|---|
| **Webhook URL** | The URL to send the HTTP POST request to (required). Must use HTTPS. |
| **Security Method** | Choose **HMAC-SHA256** for signed requests or **No Security** for unsigned requests. |
| **Secret Key** | (When HMAC-SHA256 is selected) The secret key used to generate the request signature. |
| **Header Name** | (When HMAC-SHA256 is selected) The HTTP header name that carries the signature. Default: `X-Octeth-Signature`. |
| **Custom Payload Body** | Add custom key-value pairs to the request body. Click **+** to add fields. Values support personalization merge tags. |
| **Custom Headers** | Add custom HTTP headers to the request. Click **+** to add headers. |

### Common Action Settings

All actions share the following settings:

| Setting | Description |
|---|---|
| **Published** | A toggle that controls whether the action is active. Unpublished actions are skipped during journey execution. See [Publishing and Unpublishing Actions](#publishing-and-unpublishing-actions). |
| **Administrative Notes** | A text field for internal notes about the action. Not visible to subscribers. |

## Working with Actions

### Publishing and Unpublishing Actions

Each action has a **Published** toggle that controls whether it executes when a subscriber reaches it. This allows you to temporarily disable an action without removing it from the workflow.

- **Published** actions execute normally when a subscriber reaches them.
- **Unpublished** actions are skipped. The subscriber advances to the next published action in the sequence.

Toggle the published status by clicking the publish checkbox on the action node header, or by changing the **Published** toggle in the action's configuration panel.

::: tip
Unpublishing an action is useful when you want to test a workflow without executing a specific step, or when you need to temporarily pause an action (such as a webhook) while maintaining the rest of the journey.
:::

### Cloning an Action

To duplicate an action:

1. Click the **Clone** button on the action node header.
2. A copy of the action is inserted directly below the original, with the same configuration.

Cloning is useful when you need multiple similar actions in a sequence — for example, multiple Send Email actions with slightly different configurations.

### Deleting an Action

To remove an action from the workflow:

1. Click the **Delete** button on the action node header, or select the node and press the **Delete** or **Backspace** key.
2. The action is removed from the workflow.
3. The surrounding nodes reconnect automatically to maintain the flow.

::: warning
Deleting an action is immediate and cannot be undone within the builder. However, the change is not permanent until you click **Save**. If you accidentally delete an action, you can reload the page without saving to restore it.
:::

### Reordering Actions

You can change the order of actions by dragging and dropping them:

1. Click and hold an action node.
2. Drag the node vertically to a new position.
3. Drop zones appear between other nodes, highlighted in green.
4. Release the node at the desired position.

The workflow connections update automatically to reflect the new order.

::: info
Trigger nodes cannot be dragged or reordered. They are always fixed at the top of the workflow. Only action nodes can be reordered.
:::

## Decision Branching

The **Decision** action creates a conditional branch in your journey, splitting the workflow into two paths: **True** (green) and **False** (red). Subscribers are routed to one path or the other based on whether they match the defined criteria.

[[SCREENSHOT: Decision node in the journey builder showing the True (green) and False (red) branches, each with their own sequence of action nodes]]

### How Decision Branching Works

1. When a subscriber reaches a Decision node, the system evaluates the configured criteria against the subscriber's current attributes.
2. If the subscriber matches the criteria, they follow the **True** branch.
3. If the subscriber does not match, they follow the **False** branch.
4. Each branch can contain its own sequence of actions.
5. After completing a branch, the subscriber can optionally reconverge to continue with shared actions below the decision.

### Configuring Decision Criteria

Click the **Configure** button on a Decision node to open the criteria builder. The criteria builder is a visual interface that lets you define conditions without writing code.

**Criteria Logic:**

Select how multiple criteria are combined:

- **AND** — All criteria must match for the result to be True.
- **OR** — Any single criterion matching is enough for the result to be True.

**Available Criteria Types:**

| Criteria Type | Description |
|---|---|
| **Subscriber Fields** | Evaluate subscriber custom fields and system fields (email address, subscription date, etc.) using operators such as *is*, *is not*, *contains*, *begins with*, *is greater than*, *is set*, *is empty*, *is after*, *in the last X days*, *between*, and more. |
| **Segment Membership** | Check whether the subscriber *belongs to* or *does not belong to* a specific segment. |
| **Tags** | Check whether the subscriber *has this tag*, *does not have this tag*, *has any of these tags*, *has all of these tags*, or *has no tags*. |
| **Journey and Email Events** | Evaluate the subscriber's journey state or email action events within the current journey. |
| **Campaign Events** | Check for subscriber activity related to specific email campaigns. |
| **Website Events** | Evaluate website tracking events (page views, custom events, conversions) if event tracking is configured. |
| **Suppression** | Check whether the subscriber *exists* or *does not exist* in a suppression list. |

::: tip
Use the Decision node to create personalized paths within your journey. For example, you could check whether a subscriber has opened a previous email — if yes, send a follow-up offer; if no, send a reminder.
:::

## Inline Metrics

When you have an active journey with subscriber activity, the journey builder displays performance metrics directly on each node in the canvas.

### Toggling Metrics Display

Click the **Stats Toggle** button in the canvas controls to switch between collapsed and expanded metrics views.

### Email Action Metrics

For Send Email actions, the following metrics are displayed:

| Metric | Description |
|---|---|
| **Sent** | The total number of emails sent by this action. |
| **Open Rate** | The percentage of unique opens relative to total sent. |
| **Click-Through Rate (CTR)** | The percentage of unique clicks relative to total sent. |
| **Click-to-Open Rate** | The percentage of recipients who clicked after opening the email. |
| **Unsubscribe Rate** | The percentage of recipients who unsubscribed. |
| **Bounce Rate** | The percentage of bounced emails. |
| **Spam Complaint Rate** | The percentage of spam complaints. |

### Non-Email Action Metrics

For all other action types, the following metrics are displayed:

| Metric | Description |
|---|---|
| **Active Subscribers** | The number of subscribers currently at this action (waiting to be processed). |
| **Total Subscribers** | The total number of subscribers who have passed through this action. |

## Journey Overview and Reports

The journey overview page is the primary dashboard for monitoring a journey's performance. Navigate to it by clicking **Report** on a journey row in the listing page, or by clicking **Overview** in the journey navigation sidebar.

[[SCREENSHOT: Journey overview page showing the Quick Stats cards, the performance metrics tabs, and the date range filtering toolbar]]

### Inline Name Editing

You can edit the journey name directly from the overview page. Click the journey name in the page header to activate inline editing, type the new name, and press **Enter** or click away to save.

### Quick Stats

The top section of the overview page displays key information about the journey as a set of cards. These stats are not affected by the date range filter:

| Stat | Description |
|---|---|
| **Created At** | The date when the journey was created. |
| **Total Subscribers** | The total number of subscribers who have entered the journey. |
| **Active Subscribers** | The number of subscribers currently progressing through the journey. |
| **Journey Status** | Whether the journey is **Enabled** or **Disabled**. |
| **Last Activity** | The date and time of the most recent subscriber activity in the journey. |
| **Total Revenue** | The total revenue attributed to this journey across all time. |
| **Avg Revenue / Subscriber** | The average revenue per subscriber in the journey. |
| **Trigger Type** | The type of trigger configured for the journey. |
| **Trigger Activity (Last 30 Days)** | The number of times the trigger has fired and the date of the last trigger event. |

### Performance Metrics

Below the quick stats, a tabbed interface provides detailed performance metrics. Use the toolbar to filter metrics by date range, specific email actions, or ISP.

**Filter Controls:**

| Control | Description |
|---|---|
| **Date Range Preset** | Select a preset: This Week, Last Week, Last 7 Days, This Month, Last Month, or Last 30 Days. |
| **Custom Date Range** | Pick specific start and end dates using the date pickers. |
| **Email Filter** | Filter metrics to a specific email action within the journey, or select **All Emails** to see combined metrics. |
| **ISP Filter** | Filter metrics to a specific email provider (ISP), or select **All ISPs** to see combined metrics. |

Click **Apply** to refresh the metrics with the selected filters.

#### Overall Tab

The **Overall** tab displays a comprehensive metrics grid:

**Primary Metrics:**

| Metric | Description |
|---|---|
| **Sent** | Total emails sent during the selected date range. |
| **Opened** | Total unique opens with open rate percentage. |
| **Clicked** | Total unique clicks with click rate percentage. |
| **Bounced** | Total bounces with bounce rate percentage. |
| **Unsubscribed** | Total unsubscriptions with unsubscribe rate percentage. |
| **Complained** | Total spam complaints with complaint rate percentage. |
| **Revenue** | Total revenue during the selected date range. |

**Performance Analysis:**

| Metric | Description |
|---|---|
| **Click-to-Open Rate** | The percentage of recipients who clicked a link among those who opened the email. |
| **Bounce Rate** | Color-coded: green below 2%, orange between 2% and 5%, red above 5%. |
| **Spam Complaint Rate** | Color-coded: green below 0.1%, orange between 0.1% and 0.5%, red above 0.5%. |

::: info
If no emails have been sent during the selected date range, the Overall tab displays an empty state message.
:::

#### By Email Tab

The **By Email** tab breaks down performance metrics for each individual email action within the journey:

| Column | Description |
|---|---|
| **Email Name** | The name of the email template used by the action. |
| **Sent** | Total emails sent by this action. |
| **Opened** | Open rate percentage and total unique opens. |
| **Clicked** | Click rate percentage and total unique clicks. |
| **Bounced** | Bounce rate percentage and total bounces. |
| **Unsubscribed** | Unsubscribe rate percentage and total unsubscriptions. |
| **Complained** | Complaint rate percentage and total complaints. |
| **Total Revenue** | Revenue attributed to this email action. |

If any email templates have been deleted, their aggregated metrics appear in a separate row.

#### By ISP Tab

The **By ISP** tab shows performance metrics grouped by the recipient's email provider:

| Column | Description |
|---|---|
| **ISP Name** | The email provider domain (e.g., gmail.com, outlook.com, yahoo.com). |
| **Sent** | Total emails sent to recipients at this ISP. |
| **Opened** | Open rate and total unique opens for this ISP. |
| **Clicked** | Click rate and total unique clicks for this ISP. |
| **Bounced** | Bounce rate and total bounces for this ISP. |
| **Unsubscribed** | Unsubscribe rate and total unsubscriptions for this ISP. |
| **Complained** | Complaint rate and total complaints for this ISP. |
| **Total Revenue** | Revenue from subscribers at this ISP. |

::: tip
The By ISP tab helps you identify deliverability issues with specific email providers. If you notice high bounce or complaint rates for a particular ISP, you may need to review your email content or sender reputation for that provider.
:::

### Exporting Metrics

To export journey metrics as a CSV file:

1. Navigate to the journey overview page.
2. Apply the desired date range and filters.
3. Click **Export as CSV** from the **Journey Actions** dropdown menu.

The CSV file contains the filtered metrics data.

## Managing Journeys

### Enabling a Journey

To activate a journey so it begins processing subscribers:

1. Navigate to the journey design or overview page.
2. Click the **Enable** button in the header.
3. Confirm the action when prompted.

Once enabled, the journey accepts new subscribers through its trigger and processes existing subscribers through their next actions.

::: warning
Before enabling a journey, verify that the trigger is properly configured (green checkmark) and that all actions are configured and published. Enabling a journey with unconfigured actions may result in subscribers reaching steps that cannot be executed.
:::

### Disabling a Journey

To pause a journey:

1. Navigate to the journey design or overview page.
2. Click the **Disable** button in the header.
3. Confirm the action when prompted.

When disabled:
- No new subscribers can enter the journey through the trigger.
- Existing subscribers stop progressing and remain at their current action.
- The journey and its configuration are preserved.

You can re-enable a disabled journey at any time. Subscribers resume from where they left off.

### Copying a Journey

To duplicate an existing journey:

1. Navigate to the journeys listing page.
2. Click **Copy** on the journey you want to duplicate.
3. Confirm the action when prompted.

A new journey is created with a copy of the original's name, trigger configuration, and all actions. The copied journey starts in **Disabled** status so you can review and modify it before enabling.

::: tip
Copying a journey is useful when you want to create a variation of an existing workflow — for example, an A/B test with different email content or timing.
:::

### Deleting a Journey

To permanently delete a journey:

1. Navigate to the journey design or overview page.
2. Click **Delete** in the header (or select **Delete Journey** from the **Journey Actions** menu on the overview page).
3. Confirm the deletion when prompted.

::: danger
Deleting a journey is permanent and cannot be undone. All journey data — including actions, subscriber entries, logs, and statistics — is permanently removed.
:::

### Disabling All Journeys

To disable all currently enabled journeys at once:

1. Navigate to the journeys listing page.
2. Click **Journey Actions** in the page header.
3. Select **Disable All Journeys**.
4. Confirm the action when prompted.

All enabled journeys are switched to disabled status.

### Exporting the Journey List

To download a CSV file of all journeys with their metrics:

1. Navigate to the journeys listing page.
2. Click **Journey Actions** in the page header.
3. Select **Export as CSV**.

The CSV file contains the journey names and performance metrics for the currently selected date range.

## Tips and Best Practices

::: tip
**Start simple and iterate.** Begin with a straightforward journey — such as a trigger, a wait, and a single email — and expand the workflow as you learn how subscribers respond. Complex journeys are easier to build and debug when constructed incrementally.
:::

::: tip
**Use the Wait action with delivery windows.** Pair Wait actions with delivery window settings to ensure emails and other communications reach subscribers at appropriate times. Sending a welcome email at 3:00 AM in the subscriber's timezone is unlikely to make a good impression.
:::

::: tip
**Test with the Manual trigger first.** When building a new journey, consider using the Manual trigger during development. This lets you control exactly when subscribers enter the journey, making it easier to test each step before switching to an automated trigger.
:::

::: tip
**Monitor the overview dashboard regularly.** Check the journey overview page periodically to review performance metrics, especially bounce rates and spam complaint rates. These indicators help you identify potential deliverability issues early.
:::

::: tip
**Use administrative notes generously.** Add notes to your triggers and actions explaining the purpose and logic behind each step. This documentation is valuable when revisiting a journey weeks or months later, or when team members need to understand the workflow.
:::

::: tip
**Unpublish actions instead of deleting them.** If you need to temporarily skip an action, use the Published toggle to unpublish it rather than deleting it. This preserves the configuration and makes it easy to re-enable the action later.
:::

::: tip
**Name journeys descriptively.** Include the purpose and target audience in the journey name, such as "Onboarding - New Trial Users" or "Re-engagement - Inactive 90 Days". This makes it easier to manage multiple journeys from the listing page.
:::
