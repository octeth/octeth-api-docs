---
layout: doc
---

# Users

Octeth uses a multi-tenant architecture where the system administrator manages **User Groups** and **Users**. User Groups define the rules, limits, permissions, and delivery settings that apply to all users within a group. Users are individual accounts assigned to a User Group, each with their own subscriber lists, campaigns, and settings.

This article covers how to create and manage User Groups, create and manage user accounts, monitor user activity and limits, and perform administrative actions such as impersonation, messaging, and account control.

## User Groups

User Groups are the foundation of Octeth's multi-tenancy model. Each User Group defines:

- **Permissions** — what features and actions users in the group can access
- **Limits** — how many subscribers, emails, campaigns, and other resources users can consume
- **Delivery settings** — which SMTP servers or email service providers are used for sending
- **Billing** — whether the payment and credit system is active, and how usage is priced
- **UI settings** — which template and theme users see when they log in

Every user account belongs to exactly one User Group.

### Browsing User Groups

Navigate to the **User Groups** page from the admin panel. The page displays a table listing all configured user groups.

[[SCREENSHOT: User Groups browse page showing the table with group names, user counts, and delivery server badges]]

The table includes the following columns:

| Column | Description |
|---|---|
| **Group Name** | The name of the user group. Click to edit the group. |
| **# Of Users** | The number of user accounts assigned to this group. Click the count to browse users filtered by that group. |
| **Delivery Servers** | Shows delivery server assignments using colored badges: **M** (Marketing, blue), **T** (Transactional, green), and **AR** (Auto Responder, purple). If multiple channels share the same server, they are grouped together. Unassigned channels display as "Not Assigned" in grey. |

Use the checkboxes on the left to select multiple groups, then click **Delete** in the toolbar to remove them.

::: warning
A User Group cannot be deleted if it has users assigned to it. Reassign or delete the users first.
:::

### Creating a User Group

Click the **Create User Group** button on the User Groups page. The creation form is organized into five tabs: **Preferences**, **Limits**, **Billing**, **Permissions**, and **User Interface**.

#### Preferences Tab

The Preferences tab contains the core configuration for the user group.

[[SCREENSHOT: User Group creation — Preferences tab showing basic settings and behavior checkboxes]]

**Basic Settings**

| Field | Description |
|---|---|
| **Group Name** | A descriptive name for the user group (required). |
| **Product Name** | A white-label product name displayed to users in this group instead of "Octeth". |

**Behavior Settings**

These checkboxes control what users in this group can and must do:

| Setting | Description |
|---|---|
| **Enable Sender Info** | Requires users to enter sender information when creating subscriber lists. |
| **Force Sender Info** | Appends sender information to the bottom of all outgoing emails. |
| **Force Unsubscription Link** | Prevents users from sending campaigns without an unsubscription link in the email content. |
| **Force Reject Opt Link** | Requires users to include an opt-in rejection link in confirmation emails. |
| **Force Opt-In List** | Restricts users to creating double opt-in subscriber lists only. |
| **Show Email Throughput** | Displays email delivery throughput metrics on the campaign dashboard. |
| **Prevent Campaign Create If SpamAssassin Score Is Not Zero** | Blocks campaign scheduling unless the SpamAssassin spam score is 0.0. |
| **Simplified Campaign Create UI** | Enables the simplified campaign creation interface for users in this group. |
| **Enable Sender Domain Management** | Requires users to configure and verify their own sender domains. |
| **Disable AWS SES Integrations** | Skips Amazon SES domain and identity setup for this group. |
| **Require New Domain Approval** | Email gateway sender domains remain inactive until an admin manually activates them. |
| **Disable List-Unsubscribe Email Header** | Removes the List-Unsubscribe header from outgoing emails for this group. |
| **Activate Default Sender Domain** | Enables a shared default sender domain for all users in this group. |

**Default Sender Domain**

When **Activate Default Sender Domain** is checked, two additional fields appear:

| Field | Description |
|---|---|
| **Default Sender Domain** | The base domain to use as the default sender domain. The system's tracking subdomain is automatically appended. |
| **Default Sender Domain Monthly Limit** | Maximum number of emails that can be sent per month using the default sender domain. |

**URL Settings**

| Field | Description |
|---|---|
| **Subscriber Area Logout URL** | The URL where subscribers are redirected after unsubscribing. |
| **User Area Logout URL** | The URL where users are redirected after logging out of the admin panel. |

**Trial Group Settings**

| Field | Description |
|---|---|
| **Trial Group** | Set to **Yes** to make this a trial user group. |
| **Trial Expire (days)** | Number of days before the trial expires. Required when Trial Group is set to Yes. |

**Import / Send Thresholds**

Thresholds trigger warnings when usage approaches a configured percentage limit.

| Field | Description |
|---|---|
| **Import Threshold** | Percentage threshold that triggers a warning during subscriber imports. Set to `0` to disable. |
| **Email Send Threshold** | Percentage threshold that triggers a warning during email sending. Set to `0` to disable. |

**Email Headers and Footers**

Configure default text that is prepended or appended to every email sent by users in this group:

| Field | Description |
|---|---|
| **Plain Email Header** | Text prepended to all plain-text emails. |
| **Plain Email Footer** | Text appended to all plain-text emails. |
| **HTML Email Header** | HTML prepended to all HTML emails. |
| **HTML Email Footer** | HTML appended to all HTML emails. |

**X-Mailer Header**

| Field | Description |
|---|---|
| **X-Mailer** | A custom X-Mailer header value included in all outgoing emails from this group. |

**Send Method**

Select how emails are delivered for users in this group. The available options are:

| Send Method | Description |
|---|---|
| **System** | Uses the system default delivery server. |
| **SMTP** | A custom SMTP server. Additional fields appear for host, port, encryption, timeout, authentication, username, and password. |
| **SendGrid (via SMTP)** | Sends through SendGrid. Provide your SendGrid username and password. |
| **Mailgun (via SMTP)** | Sends through Mailgun. Provide your Mailgun SMTP credentials. |
| **Mailjet (via SMTP)** | Sends through Mailjet. Provide your Mailjet SMTP credentials. |
| **Amazon SES (via SMTP)** | Sends through Amazon SES. Provide the SES SMTP host, access key, and secret key. |
| **Save to Disk** | Saves emails to a specified directory instead of sending them. Useful for testing. |

When **SMTP** is selected, the following additional fields appear:

| Field | Description |
|---|---|
| **SMTP Host** | The SMTP server hostname or IP address. |
| **SMTP Port** | The SMTP server port number (e.g., `587`). |
| **SMTP Secure** | Encryption method: **None**, **SSL**, or **TLS**. |
| **SMTP Timeout** | Connection timeout in seconds. |
| **SMTP Authentication** | Whether to use authentication (**Yes** or **No**). |
| **SMTP Username** | Username for SMTP authentication. |
| **SMTP Password** | Password for SMTP authentication. |

::: tip
When using an ESP integration like SendGrid or Mailgun, the SMTP host is automatically configured by the system. You only need to provide your credentials.
:::

**DNS Templates**

| Field | Description |
|---|---|
| **Email Gateway DNS Template** | DNS configuration template applied to transactional email sender domains. |
| **Email Campaign DNS Template** | DNS configuration template applied to marketing email sender domains. |

**Delivery Server Assignments**

Assign specific delivery servers to each email channel:

| Field | Description |
|---|---|
| **Marketing Delivery Server** | Delivery server for marketing email campaigns. Select **System Default** or a specific server. |
| **Transactional Delivery Server** | Delivery server for transactional emails (email gateway). Select **System Default** or a specific server. |
| **Auto Responder Delivery Server** | Delivery server for auto-responder emails. Select **System Default** or a specific server. |

#### Limits Tab

The Limits tab defines usage quotas for users in this group. Set any value to `0` for unlimited.

[[SCREENSHOT: User Group creation — Limits tab showing rate limits JSON editor and limit fields]]

**Rate Limits**

A JSON editor allows you to configure per-user rate limits for email sending. Rate limits control how many emails a user can send within specific time intervals (per minute, per hour, per day, per week, per month, per year). Set values to `-1` to disable rate limiting for a specific interval.

**Asset Limits**

| Field | Description |
|---|---|
| **Subscribers** | Maximum total subscribers across all lists. `0` = unlimited. |
| **Lists** | Maximum number of subscriber lists. `0` = unlimited. |

**Daily Limits**

| Field | Description |
|---|---|
| **Emails Per Day** | Maximum emails a user can send per day. `0` = unlimited. |

**Monthly Limits**

| Field | Description |
|---|---|
| **Campaigns Per Period** | Maximum campaigns a user can send per month. `0` = unlimited. |
| **Emails Per Period** | Maximum emails a user can send per month. `0` = unlimited. |

**Lifetime Limits**

| Field | Description |
|---|---|
| **Emails (lifetime)** | Maximum total emails a user can send over the lifetime of the account. `0` = unlimited. |
| **Email Gateway Sender Domains** | Maximum number of sender domains a user can configure. `0` = unlimited. |

::: info
Limits set at the User Group level apply to all users in the group. Individual user limits can be viewed and monitored on the user's **Limit Utilization** page.
:::

#### Payment & Credit Settings Tab

The Billing tab controls whether the payment and credit system is active for this group.

[[SCREENSHOT: User Group creation — Billing tab showing payment system and credit settings]]

| Field | Description |
|---|---|
| **Payment System** | Set to **Enabled** to activate billing features for this group, or **Disabled** to turn them off. |

When the Payment System is enabled, the following additional fields appear:

| Field | Description |
|---|---|
| **Monthly Charge Amount** | Fixed monthly fee charged to users in this group. |
| **Campaigns Per Campaign Cost** | Fee charged per campaign sent. |
| **Design Preview Charge Per Request** | Number of free design previews before charges apply. |
| **Design Preview Charge Amount** | Fee charged per design preview after the free allowance. |
| **Auto Responders Charge Amount** | Fee charged for auto-responder usage. |
| **Credit System** | Set to **Enabled** to require email credits, or **Disabled** to allow unlimited sending within limits. |
| **Charge Per Auto Responder Recipient** | Whether to deduct credits for each auto-responder recipient. |
| **Charge Per Campaign Recipient** | Whether to deduct credits for each campaign recipient. |
| **Pricing Range** | Define tiered pricing for email credits. Add rows specifying "Up to X emails = Y per email" for volume-based pricing. |

#### Permissions Tab

The Permissions tab controls which features and actions are available to users in this group.

[[SCREENSHOT: User Group creation — Permissions tab showing preset dropdown and permission checkboxes]]

**Permission Presets**

Use the preset dropdown to quickly apply a common permission configuration:

| Preset | Description |
|---|---|
| **Full Access** | Grants all permissions. |
| **Lists & Subscribers Manager** | Permissions focused on list and subscriber management. |
| **Email Campaign Manager** | Permissions focused on campaign creation and management. |
| **Read Only Access** | View-only permissions with no create, update, or delete capabilities. |

After selecting a preset, you can further customize individual permissions.

**Permission Categories**

Permissions are organized into the following categories, each containing individual checkboxes:

| Category | Permissions |
|---|---|
| **Account** | Update own account settings, set custom email header/footer |
| **Email** | Spam test, design preview, manage email templates |
| **Campaigns** | Create, update, delete, view campaigns |
| **Subscriber Lists** | Create, update, delete, view lists, connect external MySQL |
| **Custom Fields** | Create, update, delete, view custom fields |
| **Media** | Upload, browse, retrieve, delete media files |
| **Auto Responders** | Create, update, delete, view auto responders |
| **Segments** | Create, update, delete, view segments |
| **Subscribers** | View, update, delete, import subscribers |
| **Clients** | Create, update, delete, view sub-user accounts |
| **Email Gateway** | Add and manage transactional email sender domains |
| **Plugins** | Access to individual installed plugins (one permission per plugin) |

#### User Interface Tab

The User Interface tab controls the visual appearance for users in this group.

| Field | Description |
|---|---|
| **Template** | Select the UI template that users in this group will see when logged in. |
| **Theme CSS Settings** | After selecting a template, color pickers appear for customizing the template's CSS color values. |

### Editing a User Group

Click the name of any user group on the browse page to open the edit form. The edit form has the same five tabs and fields as the creation form, pre-populated with the group's current settings.

An additional **Save As** option is available, which creates a duplicate of the current group with a new name. This is useful for creating variations of an existing configuration.

### Deleting a User Group

To delete user groups, select them using the checkboxes on the browse page and click **Delete** in the toolbar.

::: danger
A User Group cannot be deleted while it has users assigned to it. Reassign or remove all users from the group before deleting it.
:::

## Managing Users

### Browsing Users

Navigate to the **Users** page from the admin panel. The page displays a searchable, filterable list of all user accounts.

[[SCREENSHOT: Users browse page showing user table with sidebar filters]]

**User Table**

Each row in the table displays:

| Element | Description |
|---|---|
| **Avatar** | A Gravatar image based on the user's email address. Click to open the user's edit page. |
| **Name** | The user's full name (first and last name) or company name. A "Disabled" badge appears if the account is disabled. |
| **Limit Status** | A colored dot indicator showing the user's limit utilization: green (OK), orange (Warning), or red (Exceeded). |
| **Username** | The user's login username. |
| **Email** | The user's email address (clickable mailto link). |
| **Action Links** | Quick links to **Login as User** and **Edit**. |
| **Activity Spark** | A sparkline chart showing the user's email sending activity over the past 7 days. |
| **User Group** | The name of the user group the account belongs to. Click to edit the group. |

**Sidebar Filters**

The left sidebar provides multiple filtering options:

| Filter | Options |
|---|---|
| **By Category** | All Users, Uncategorized, and each named category with its user count. |
| **Activity** | All Users, Online Users (currently logged in), Pending Sender Domains (users with domains awaiting activation). |
| **By User Group** | Any User Group, plus one entry per user group. |
| **By Account Status** | Enabled, Disabled. |
| **By Reputation Level** | Trusted, Untrusted. |
| **Limit Utilization** | All Users, OK (green), Warning (orange), Exceeded (red). |

**Sorting**

Use the **Sort Field** dropdown in the toolbar to sort by:
- User ID
- SSO ID
- Email Address
- Account Create Date
- First Name
- Last Name
- Company Name
- Last Activity Time

Choose **Ascending** or **Descending** order with the Sort Type dropdown.

**Bulk Operations**

Select users with checkboxes, then use the toolbar actions:

- **Delete** — Delete the selected user accounts.
- **Change Status** — Set the selected accounts to **Enabled** or **Disabled**.

### Creating a New User

Click the **Create User** button on the Users page. The creation form has two tabs: **Account Information** and **Personal Information**.

[[SCREENSHOT: Create User form — Account Information tab]]

#### Account Information Tab

| Field | Type | Required | Notes |
|---|---|---|---|
| **Company Name** | Text | Conditional | Required if First Name and Last Name are not provided. |
| **First Name** | Text | Conditional | Required if Company Name is not provided. |
| **Last Name** | Text | Conditional | Required if Company Name is not provided. |
| **Username** | Text | Yes | The login username for the account. |
| **Password** | Password | Yes | Click **Generate a random password** to create a secure 18-character password. The generated password is briefly displayed for copying. |
| **Email Address** | Text | Yes | Must be a valid email address format. |
| **Time Zone** | Dropdown | Yes | Select the user's time zone. |
| **Language** | Dropdown | No | Select from available language packs. |
| **User Group** | Dropdown | Yes | Assign the user to a User Group. |

::: tip
Either **Company Name** or both **First Name** and **Last Name** must be provided. You can fill in all three fields if desired.
:::

#### Personal Information Tab

| Field | Type | Notes |
|---|---|---|
| **Website** | Text | The user's website URL. |
| **Other Email Addresses** | Textarea | Additional email addresses, one per line. |
| **Street** | Textarea | Street address. |
| **City** | Text | City name. |
| **State** | Text | State or province. |
| **Zip** | Text | Postal or ZIP code. |
| **Country** | Dropdown | Select from the country list. |
| **Phone** | Text | Phone number. |
| **Fax** | Text | Fax number. |

Click **Create User** to save the new account.

### Editing a User

Click a user's avatar or the **Edit** link on the Users browse page to open the edit screen. The edit page has a sidebar navigation on the left and a tabbed form on the right.

[[SCREENSHOT: Edit User page showing sidebar navigation and Account Information tab]]

#### Account Information Tab

The Account Information tab includes the following fields:

| Field | Type | Notes |
|---|---|---|
| **Available Credits** | Text | Current email credit balance. Only shown if the user's group has the Credit System enabled. |
| **Reputation Level** | Dropdown | **Trusted** or **Untrusted**. |
| **Category** | Dropdown | Select **Uncategorized**, an existing category, or **New Category** to create one. |
| **New Category Name** | Text | Appears when **New Category** is selected. Enter the name for the new category. |
| **Company Name** | Text | |
| **First Name** | Text | |
| **Last Name** | Text | |
| **Username** | Text | The login username. |
| **New Password** | Password | Leave blank to keep the current password. Click **Generate a random password** for a secure password. |
| **Email Address** | Text | |
| **Time Zone** | Dropdown | |
| **Language** | Dropdown | |
| **User Group** | Dropdown | Change the user's group assignment. |

**Options (Checkboxes)**

| Option | Description |
|---|---|
| **Disable list-unsubscribe email header** | Removes the List-Unsubscribe header from this user's outgoing emails. |
| **Disable suppression check in outgoing emails** | Skips the suppression list check when this user sends emails. |

#### Personal Information Tab

The same fields as the creation form, plus:

| Field | Type | Notes |
|---|---|---|
| **Phone Verified** | Checkbox | Indicates whether the user has verified their phone number. |

#### Settings Tab

The Settings tab provides advanced configuration options that override User Group defaults for this specific user.

[[SCREENSHOT: Edit User — Settings tab showing delivery server, rate limits, and custom headers]]

| Field | Type | Notes |
|---|---|---|
| **Delivery Server** | Dropdown | Override the User Group's delivery server. Select **User Group Delivery Server** (default) or a specific server. |
| **Default Sender Domain** | Text | Override the User Group's default sender domain for this user. |
| **Rate Limits** | JSON editor | Override the User Group's rate limits. Click the helper link to paste the User Group defaults as a starting point. Leave empty to use the group defaults. |
| **Custom Email Headers** | JSON editor | Define custom email headers using JSON with `Add` and `Remove` keys. These headers are applied to all outgoing emails from this user. |
| **Whitelisted Email Addresses** | Text editor | One email address per line. Regex patterns are supported. Addresses listed here are exempt from the suppression list. |

::: info
Settings configured on this tab take precedence over the User Group settings. To revert to group defaults, clear the field or select the default option.
:::

Click **Update Account** to save changes.

### User Categories

Categories are organizational labels that help you group users for quick filtering. They are distinct from User Groups — categories are lightweight tags for administrative convenience, while User Groups define permissions, limits, and delivery settings.

**Creating a Category**

1. Open a user's edit page.
2. In the **Category** dropdown on the Account Information tab, select **New Category**.
3. Enter the category name in the text field that appears.
4. Click **Update Account** to save.

The new category becomes available for all users.

**Filtering by Category**

On the Users browse page, use the **By Category** section in the left sidebar to filter the list by a specific category.

**Renaming a Category**

1. On the Users browse page, filter by the category you want to rename.
2. In the toolbar, open the **Category Tools** dropdown and select **Rename Category**.
3. Enter the new name and confirm.

**Deleting a Category**

1. On the Users browse page, filter by the category you want to delete.
2. In the toolbar, open the **Category Tools** dropdown and select **Delete Category**.
3. Confirm the deletion.

::: info
Deleting a category does not delete the users in it. Those users become "Uncategorized".
:::

## Monitoring Users

### Account Activity

The **Account Activity** section on the user's edit page provides charts and data about the user's email performance over time.

[[SCREENSHOT: User Account Activity page showing charts and Latest Campaigns tab]]

**Charts**

Use the dropdown to select which metric to view:

| Chart | Description |
|---|---|
| **Campaigns: Unsubscriptions** | Unsubscription trends over time. |
| **Campaigns: Bounces** | Bounce rate trends over time. |
| **Campaigns: Spam Complaints** | Spam complaint trends over time. |
| **Subscriptions: Subscriptions & Unsubscriptions** | Subscription and unsubscription activity over time. |

Each chart supports three date ranges: **1 month**, **3 months**, and **6 months**.

**Data Tabs**

Below the chart, two additional tabs provide tabular data:

| Tab | Columns |
|---|---|
| **Latest Campaigns** | Campaign Name, Total Recipients, Unique Open Rate (with visual indicator). |
| **Subscriber Lists** | List Name, Subscriber Count. |

### Limit Utilization

The **Limit Utilization** section shows how much of their allocated limits a user has consumed. Navigate to this section from the user's edit page sidebar.

[[SCREENSHOT: User Limit Utilization page showing progress bars with OK/Warning/Exceeded indicators]]

Limits are displayed across four tabs:

**Send Rate Limits**

Shows email sending rate consumption for each time interval (per minute, per hour, per day, per week, per month, per year). Each card displays the used count, limit, percentage, remaining amount, and time until the counter resets.

::: info
Send rate limits apply to email gateway and journey email deliveries only.
:::

**Asset Limits**

Shows consumption for:
- Campaigns
- Subscriber Lists
- Custom Fields
- Total Subscribers
- Sub-Users
- Auto Responders
- Journeys

**Time Based Limits**

Organized into three groups:

| Group | Limits Shown |
|---|---|
| **Daily Limits** | Daily Email Send, Daily Import, Emails Sent Today |
| **Monthly Limits** | Monthly Email Send, Monthly Import, Emails Sent This Month, Campaigns Sent This Month |
| **Lifetime Limits** | Lifetime Email Send, Sender Domains, Total Emails Sent |

**Threshold Limits**

Shows whether usage is within or has exceeded configured thresholds:
- Import Threshold
- Email Send Threshold
- Default Domain Daily limit
- Default Domain Monthly limit

**Status Indicators**

Each limit card uses a color-coded status:

| Status | Color | Meaning |
|---|---|---|
| **OK** | Green | Usage is below 80% of the limit. |
| **Warning** | Orange | Usage is between 80% and 100% of the limit. |
| **Exceeded** | Red | Usage has reached or exceeded the limit. |

::: tip
Limits are inherited from the user's User Group. To change a user's limits, edit the User Group configuration in the **Limits** tab.
:::

## Sender Domains

The **Sender Domains** section on the user's edit page lists all sender domains associated with the user, including both marketing email domains and transactional email (email gateway) domains.

[[SCREENSHOT: User Sender Domains page showing domain table with status badges and action buttons]]

**Table Columns**

| Column | Description |
|---|---|
| **Sender Domain** | The domain name, with a badge indicating the type: "Marketing Email Domain" or "Transactional Email Domain". |
| **Status** | The current domain status with a colored icon. |
| **Options** | Available actions based on the domain's current status. |

**Domain Statuses**

| Status | Description |
|---|---|
| **Enabled** | The domain is active and can be used for sending. |
| **Disabled** | The domain is not active. |
| **Suspended** | The domain has been suspended by an administrator. |
| **Approval Pending** | The domain is awaiting admin approval before it can be used. |
| **Blocked** | The domain has been blocked by an administrator. |

**Available Actions**

The actions available for each domain depend on its current status:

| Current Status | Available Actions |
|---|---|
| **Blocked** | Activate, Suspend |
| **Approval Pending** | Suspend |
| **Enabled** | Suspend, Block |
| **Disabled** | Unblock |
| **Suspended** | Unblock |

## Sending Messages to Users

The **Send Message** section on the user's edit page allows you to send a direct email to the user from the admin panel.

[[SCREENSHOT: Send Message form with recipient, subject, and message fields]]

| Field | Description |
|---|---|
| **Recipient** | Pre-filled with the user's email address (read-only). |
| **Subject** | The email subject line. |
| **Message** | The body of the email. |

Click **Send Message** to deliver the email.

## Account Control

### Enabling and Disabling Accounts

To change a user's account status:

**From the edit page:**
1. Open the user's edit page.
2. In the left sidebar under **User Options**, click **Disable Account** or **Enable Account** (the label reflects the opposite of the current status).
3. Confirm the action.

**From the browse page (bulk):**
1. Select users using the checkboxes.
2. Use the **Change Status** dropdown in the toolbar to set accounts to **Enabled** or **Disabled**.

::: info
Disabling an account prevents the user from logging in and stops all scheduled campaigns and auto-responders. The user's data (lists, subscribers, campaigns) is preserved.
:::

### Deleting a User Account

1. Open the user's edit page.
2. In the left sidebar under **User Options**, click **Delete Account**.
3. Confirm the deletion.

::: danger
Deleting a user account permanently removes all associated data, including campaigns, subscriber lists, subscribers, auto-responders, segments, custom fields, and media files. This action cannot be undone.
:::

You can also delete users in bulk from the browse page by selecting users with checkboxes and clicking **Delete** in the toolbar.

### Impersonating a User

The **Login as User** feature allows administrators to log in as a user to troubleshoot issues, review their setup, or provide support. This is available from both the user's edit page and the browse page.

Two impersonation modes are available:

| Mode | Description |
|---|---|
| **Full Login** | Logs in as the user with full administrative privileges. You can perform any action as though you were the user with no restrictions. |
| **Login (Default)** | Logs in as the user with their standard permission set as defined by their User Group. This mode lets you see exactly what the user sees. |

To impersonate a user:

1. Open the user's edit page.
2. Click the **Login as User** dropdown button in the top section bar.
3. Select **Full Login** or **Login**.

The system opens the user's dashboard in a new session.

::: tip
Use **Login (Default)** when you want to verify what the user can see and do with their current permissions. Use **Full Login** when you need to perform administrative actions within the user's account.
:::
