---
layout: doc
---

# Subscribers

Subscribers are the contacts stored in your subscriber lists. Each subscriber belongs to one or more lists and has an email address, a subscription status, and optional custom field data. Managing subscribers effectively is essential for targeted email campaigns, automations, and maintaining a healthy sender reputation.

This article covers how to browse, add, import, edit, export, and manage subscribers across your lists.

## Browsing Subscribers

To view subscribers for a specific list, navigate to **Subscribers** from the main menu and select the list you want to work with. The subscriber management page displays a filterable list of all subscribers in that list.

[[SCREENSHOT: Subscribers browse page showing the left sidebar with status filters, the subscriber table, and pagination controls]]

### Status Filters

The left sidebar provides status-based filters. Each filter shows the number of subscribers in that status:

| Status | Description |
|---|---|
| **Active** | Subscribers who are confirmed and eligible to receive emails. |
| **Unsubscribed** | Subscribers who have opted out of receiving emails from this list. |
| **Pending** | Subscribers awaiting opt-in confirmation (applies to double opt-in lists). |
| **Soft Bounced** | Subscribers whose email addresses returned a temporary delivery failure. |
| **Hard Bounced** | Subscribers whose email addresses returned a permanent delivery failure. |
| **Suppressed** | Subscribers whose email addresses are on a suppression list. |

Click any status filter to view only subscribers matching that status.

### Segment Filters

If segments have been defined for the list, a **Segments** section appears below the status filters. Click a segment name to view only subscribers matching that segment's rules. A **Manage Segments** link is also available for quick access to the segment configuration page.

::: tip
Segments are dynamic filters based on subscriber data and activity. For details on creating and managing segments, see the [Segments](./segments) article.
:::

### Subscriber Table

The main content area displays a table of subscribers with the following columns:

| Column | Description |
|---|---|
| **Checkbox** | Select individual subscribers for bulk actions. |
| **Email Address** | The subscriber's email address. Click to open the subscriber's edit page. |

Use the **Select All** and **Select None** links above the table to quickly select or deselect all subscribers on the current page.

### Pagination

When the list contains more subscribers than a single page can display, pagination controls appear on the right side. Navigate between pages using the numbered page links or the first/last page shortcuts.

### Bulk Deletion

To delete subscribers in bulk:

1. Select subscribers using the checkboxes or click **All** to select everyone on the current page.
2. Click **Delete Subscriber** in the toolbar above the table.
3. Confirm the deletion when prompted.

::: danger
Deleting subscribers is permanent and cannot be undone. The subscriber and all associated data (activity history, custom field values) are removed from the list.
:::

## Advanced Filtering

The advanced subscriber browse provides a powerful rule-based filtering system that allows you to search for subscribers using multiple criteria combined with AND/OR logic.

[[SCREENSHOT: Advanced subscriber browse showing the filter rule board with multiple rules applied, the subscriber table with custom columns, and sorting controls]]

### Building Filter Rules

Click **Create advanced filter rules** to expand the filter panel. The filter board allows you to build complex queries:

1. Click **Add new rule** to add a filter criterion. A dropdown appears with all available fields organized into two groups:
   - **Available fields** — subscriber data fields such as email address, subscription status, subscription date, and all custom fields defined for the list.
   - **Activity fields** — engagement-based fields such as email opens, link clicks, and bounces from specific campaigns or autoresponders.

2. For each rule, select a field, an operator, and a value. The available operators depend on the field type:

   **Text fields:** Is, Is not, Contains, Does not contain, Begins with, Ends with, Is set, Is not set.

   **Number fields:** Equals to, Is greater than, Is smaller than.

   **Date fields:** Is, Is not, Is before, Is after, Is set, Is not set, In the last X days, Not in the last X days, In the next X days, Not in the next X days, Is exactly X days ago, Is exactly X days from now, Between, Not between.

3. Add multiple rules to narrow your results. Click the **AND/OR** toggle to switch between combining rules with AND (all rules must match) or OR (any rule must match).

4. Click **Add segment rules** to apply an existing segment's rules to the filter. Click **Remove segment rules** to clear them.

5. Click **Clear the board** to remove all filter rules and start over.

6. Click **Apply Filter** to execute the filter and display matching subscribers.

### Customizing the Results View

After applying a filter, you can customize how results are displayed:

- **Show fields** — Click the dropdown to select which columns appear in the subscriber table. Available columns include all default fields and custom fields.
- **Sort by** — Select a field to sort results by, and choose **Ascending** or **Descending** order.
- **Export** — Click the export icon to export the filtered subscribers.
- **Delete** — Select subscribers using checkboxes and click the delete icon to remove them.

## Adding a Single Subscriber

To add a single subscriber manually:

1. Navigate to the subscriber list where you want to add the subscriber.
2. Click **Add Subscriber** in the toolbar.
3. Select the **Form** import method on the flow selection page.

[[SCREENSHOT: Add single subscriber form showing the email address field, custom fields, and import settings checkboxes]]

4. Fill in the subscriber information:

| Field | Description |
|---|---|
| **Email Address** | The subscriber's email address (required). |
| **Custom Fields** | Any custom fields defined for the list. Required fields are marked with an asterisk (*). |

5. Configure the import settings:

| Setting | Description |
|---|---|
| **Update if subscriber already exists** | When checked, updates the existing subscriber's data if the email address is already in the list. When unchecked, duplicate email addresses are skipped. Checked by default. |
| **Do not send opt-in confirmation email** | Only appears for double opt-in lists. When checked, the subscriber is added without sending a confirmation email. |
| **Trigger behaviors/automations** | When checked, any journeys or automations configured for new subscribers are triggered. Unchecked by default. |

6. Click **Next** to add the subscriber.

The results page displays whether the subscriber was added successfully, was a duplicate, or failed validation.

## Importing Subscribers

Octeth provides multiple methods for importing subscribers in bulk. Navigate to the subscriber list, click **Add Subscriber**, and choose an import method on the flow selection page.

[[SCREENSHOT: Import flow selection page showing the available import methods — Copy and Paste, Form, and From File]]

### Copy and Paste

Use this method to quickly import a small number of subscribers by pasting data directly.

1. Select **Copy and Paste** on the flow selection page.
2. Paste your subscriber data into the text area. Each line represents one subscriber. Fields within a line should be separated by the delimiter you select.
3. Configure the data format:

| Setting | Description |
|---|---|
| **Field Terminator** | The character that separates fields in each line. Options: Comma (`,`), Semicolon (`;`), Tab, Pipe (`\|`). |
| **Field Encloser** | The character that wraps field values. Options: None, Single quote (`'`), Double quote (`"`). |

4. Click **Next** to proceed to field mapping.

### From File

Use this method to import subscribers from a CSV, XLS, or XLSX file.

1. Select **From File** on the flow selection page.
2. Upload your file using the file selector.
3. Configure the data format:

| Setting | Description |
|---|---|
| **Field Terminator** | The character that separates fields in your file. Options: Comma (`,`), Semicolon (`;`), Tab, Pipe (`\|`). |
| **Field Encloser** | The character that wraps field values. Options: None, Single quote (`'`), Double quote (`"`). |

::: info
The maximum upload file size is displayed on the upload form. If your file exceeds this limit, split it into smaller files or ask your administrator to increase the upload limit.
:::

4. Click **Next** to proceed to field mapping.

### Field Mapping

After entering or uploading data, the field mapping step displays a preview of the detected fields. Map each column from your data to the corresponding subscriber field.

[[SCREENSHOT: Field mapping step showing imported columns on the left mapped to subscriber fields on the right via dropdown selectors]]

For each detected column, select the matching subscriber field from the dropdown:

- **Skip this field** — Ignores the column during import.
- **Email Address** — Maps to the subscriber's email address (required — at least one column must be mapped to Email Address).
- **Custom Fields** — Any custom fields defined for the list appear as mapping options.

::: tip
If a column in your data contains a valid email address, Octeth automatically pre-selects the **Email Address** mapping for that column.
:::

#### Suppression List Options

Choose whether imported email addresses should also be added to a suppression list:

| Option | Description |
|---|---|
| **Don't add to suppression list** | Subscribers are imported without being suppressed (default). |
| **Add to global suppression list** | Imported addresses are added to the global suppression list, preventing emails across all lists. |
| **Add to list-specific suppression list** | Imported addresses are added to this list's suppression list only. |

::: info
The suppression list options are useful when importing a list of addresses that should be blocked from receiving emails, such as known bounces or complaint addresses.
:::

#### Import Settings

| Setting | Description |
|---|---|
| **Update duplicates if subscriber already exists** | Updates existing subscriber data when a matching email address is found. Checked by default. |
| **Do not send opt-in confirmation email** | Only appears for double opt-in lists. Skips sending confirmation emails to imported subscribers. Checked by default. |
| **Trigger behaviors/automations for new subscribers** | Triggers configured journeys and automations for each imported subscriber. Unchecked by default. |

::: warning
Enabling **Trigger behaviors/automations** during a large import can generate a high volume of automated emails and journey enrollments. Use this option with caution for large imports.
:::

Click **Next** to start the import.

### Import Results

The results page displays real-time progress as subscribers are imported.

[[SCREENSHOT: Import results page showing the progress bar, total imported count, duplicates count, and failed count]]

A progress bar shows the current completion percentage. Below it, the following statistics are displayed:

| Metric | Description |
|---|---|
| **Total subscribers** | The total number of records in the import. |
| **Total imported** | The number of subscribers successfully added or updated. |
| **Total duplicates** | The number of duplicate email addresses encountered. Click **Download** to get a file of duplicates. |
| **Total failed** | The number of records that failed validation. Click **Download** to get a file of failures. |

::: tip
Download the duplicates and failures files to review which records were not imported and why. Common failure reasons include invalid email address format and exceeding subscriber limits.
:::

## Editing a Subscriber

Click a subscriber's email address in the browse table to open their profile page. The subscriber profile is organized into three tabs: **Profile**, **Enrolled Journeys**, and **Activity**.

[[SCREENSHOT: Subscriber edit page showing the profile tab with tags, default fields, and custom fields in a card layout]]

### Subscriptions Sidebar

If the subscriber exists in multiple lists, the left sidebar displays all lists the subscriber belongs to. Click a list name to view the subscriber's profile in the context of that list.

### Profile Tab

The Profile tab displays the subscriber's data organized into sections:

**Tags**

Displays all tags currently applied to the subscriber as badges. Click the **x** button on a tag badge to remove it. Click **Add a tag** to assign a new tag.

::: tip
Tags are lightweight labels for organizing and targeting subscribers. For details on creating and managing tags, see the [Tags](./tags) article.
:::

**Default Fields**

Displays the subscriber's core system fields in a card layout:

| Field | Description |
|---|---|
| **Email Address** | The subscriber's email address. Click to edit inline. |
| **Bounce Type** | Current bounce status: Not Bounced, Soft Bounced, or Hard Bounced (read-only). |
| **Subscription Status** | Current status with a colored badge: Subscribed, Unsubscribed, or Opt-In Pending (read-only). |
| **Subscription Date** | The date the subscriber was added to the list (read-only). |

**Custom Fields**

Displays all custom fields defined for the list with their current values. Field types include text inputs, dropdowns, checkboxes, date pickers, and more, depending on how the custom field was configured.

::: info
Custom fields store additional subscriber data beyond the email address. For details on creating and managing custom fields, see the [Custom Fields](./custom-fields) article.
:::

### Enrolled Journeys Tab

Displays a list of journeys the subscriber is currently enrolled in, including the journey name, enrollment date, and current status.

### Activity Tab

Displays a visual timeline of the subscriber's engagement history. See [Subscriber Activity](#subscriber-activity) for details.

## Subscriber Statuses

Every subscriber has a subscription status that determines whether they can receive emails. Statuses change based on subscriber actions, bounce processing, and manual operations.

| Status | Description | Can Receive Emails? |
|---|---|---|
| **Subscribed** | The subscriber is confirmed and active. | Yes |
| **Unsubscribed** | The subscriber has opted out of receiving emails. | No |
| **Opt-In Pending** | The subscriber signed up on a double opt-in list but has not yet confirmed. | No |
| **Soft Bounced** | A temporary delivery failure occurred (e.g., mailbox full). | Depends on configuration |
| **Hard Bounced** | A permanent delivery failure occurred (e.g., address does not exist). | No |

**How statuses change:**

- **Subscribed → Unsubscribed** — The subscriber clicks an unsubscription link, or an administrator manually unsubscribes them.
- **Opt-In Pending → Subscribed** — The subscriber clicks the confirmation link in the double opt-in email.
- **Opt-In Pending → Unsubscribed** — The subscriber clicks the rejection link in the double opt-in email, or the pending period expires.
- **Subscribed → Soft Bounced / Hard Bounced** — The bounce processing system detects a delivery failure and updates the status.
- **Unsubscribed → Subscribed** — An administrator manually re-subscribes the subscriber.

::: info
Suppression is not a subscription status — it is a separate mechanism. A subscriber can be both "Subscribed" and "Suppressed". Suppressed subscribers are excluded from email delivery regardless of their subscription status. For details, see [Suppression Lists](./email-deliverability/suppression-lists).
:::

## Subscriber Actions

The subscriber edit page provides a **Subscriber Actions** dropdown menu with the following operations:

[[SCREENSHOT: Subscriber Actions dropdown menu expanded showing all available actions]]

| Action | Description |
|---|---|
| **Unsubscribe from this list** | Changes the subscriber's status to Unsubscribed for the current list. Only available when the subscriber is currently Subscribed. |
| **Re-subscribe to this list** | Changes the subscriber's status back to Subscribed. Only available when the subscriber is currently Unsubscribed. |
| **Add to suppression list** | Adds the subscriber's email address to the suppression list, preventing email delivery across applicable lists. |
| **Remove from suppression list** | Removes the subscriber's email address from the suppression list. Only available when the subscriber is currently suppressed. |
| **Tag subscriber** | Opens a dialog to assign one or more tags to the subscriber. |
| **Untag subscriber** | Opens a dialog to remove tags from the subscriber. |
| **Enroll in a journey** | Enrolls the subscriber in a selected journey automation. |
| **Unenroll from a journey** | Removes the subscriber from an active journey. |
| **Mark as hard bounced** | Manually sets the subscriber's bounce type to Hard Bounced. Only available when the subscriber is not already hard bounced. |
| **Mark as not bounced** | Clears the subscriber's bounce status. Only available when the subscriber is currently bounced. |
| **Unsubscribe from all lists** | Unsubscribes the subscriber from every list they belong to. |
| **Export VCard** | Downloads the subscriber's information as a VCard (.vcf) contact file. |
| **Delete subscriber** | Permanently removes the subscriber from the list. |

::: warning
**Unsubscribe from all lists** affects every list the subscriber belongs to across your account. Use this action carefully.
:::

## Subscriber Activity

The Activity tab on the subscriber edit page displays a visual timeline and detailed log of the subscriber's engagement history.

[[SCREENSHOT: Subscriber activity tab showing the timeline visualization at the top and the activity log table below]]

### Timeline

The timeline is a horizontal visualization spanning the subscriber's history. Activity events are displayed as colored markers:

| Color | Activity Type |
|---|---|
| Blue | Email opens |
| Purple | Link clicks |
| Red | Unsubscriptions |
| Green | Subscriptions |
| Yellow | Forwards |
| Orange | Bounces |

Hover over a marker to see the date and details of that activity event.

### Activity Log

Below the timeline, a table lists each activity event in chronological order:

| Column | Description |
|---|---|
| **Color** | A colored indicator matching the activity type. |
| **Date** | The date and time the activity occurred. |
| **Action** | The type of activity (e.g., Opened, Clicked, Subscribed). |
| **Entity** | The name of the related campaign or autoresponder (clickable link). |

## Exporting Subscribers

To export subscribers from a list:

1. Navigate to the subscriber list and click **Export Subscribers** (or access it from the subscriber management toolbar).

[[SCREENSHOT: Export Subscribers form showing the subscriber filter dropdown, file format selector, and field multi-select]]

2. Configure the export settings:

| Field | Description |
|---|---|
| **List Name** | The name of the list being exported (read-only). |
| **Subscribers** | Select which subscribers to export. Options include: **Active subscribers**, **Suppressed subscribers**, **Unsubscribed subscribers**, individual segments (listed under a Segments group), **Soft bounced subscribers**, and **Hard bounced subscribers**. |
| **File Format** | Select the export file format: **CSV**, **XML**, or **Tab-delimited**. |
| **Fields** | Select which fields to include in the export. Hold Ctrl (or Cmd on Mac) to select multiple fields. Both default fields and custom fields are available. At least one field must be selected. |

3. Click **Export Subscribers** to submit the export request.

### Export History

Click **View Export History** on the export page to see all previous export requests.

[[SCREENSHOT: Export history page showing a table of export requests with status badges and action buttons]]

Each export request displays:

| Column | Description |
|---|---|
| **Request Details** | The export name (or "Subscriber Export" if unnamed), export ID, list name, and submission date. |
| **Status** | The current status of the export with a colored badge: **Pending** (grey), **Processing** (yellow), **Completed** (green), or **Failed** (red). |
| **Elapsed Time** | The time elapsed since the request was submitted, or the total processing time if completed. |

Available actions for each export:

- **Rename** — Click the pencil icon to rename the export for easier identification.
- **Download** — Click the download icon to download the completed export file. Only available for completed exports.
- **Delete** — Click the trash icon to remove a failed export request.

## Subscriber Tags

Tags are lightweight labels that help you organize and target subscribers. You can create tags, assign them to subscribers, and use them in segments and journey triggers.

### Managing Tags

Navigate to **Tags** within a subscriber list context to browse, create, and manage tags.

[[SCREENSHOT: Subscriber Tags page showing the browse tab with a list of tags and their IDs]]

The tag management page provides three tabs:

- **Browse Subscriber Tags** — Displays all tags with their names and IDs. Select tags using checkboxes and click **Delete** to remove them.
- **Create a New Tag** — Enter a tag name and click **Create** to add a new tag.
- **Edit Tag** — Appears when editing an existing tag. Update the tag name and click **Save**.

### Assigning Tags to Subscribers

Tags can be assigned to subscribers in several ways:

- From the subscriber's profile page, click **Add a tag** in the Tags section.
- From the **Subscriber Actions** dropdown, select **Tag subscriber**.
- During import, tags can be mapped to a custom field.
- Automatically via journey actions.

To remove a tag from a subscriber, click the **x** button on the tag badge in the subscriber's profile, or select **Untag subscriber** from the **Subscriber Actions** dropdown.

::: tip
For comprehensive details on tag management, including using tags in segments and journey triggers, see the [Tags](./tags) article.
:::
