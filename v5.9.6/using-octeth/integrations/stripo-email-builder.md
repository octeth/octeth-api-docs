---
layout: doc
---

# Stripo Email Builder Integration

Stripo is a drag-and-drop email builder that allows you to design professional, responsive emails without writing HTML code. Octeth integrates with Stripo as an embedded email editor, giving your users access to a visual design tool directly within the campaign creation, auto responder, confirmation email, and email template workflows.

This article covers how to set up the Stripo integration as an administrator, configure per-user API keys for the template gallery, and verify that the integration is working correctly. For instructions on using the Stripo editor to design emails, see [Email Builder](../email-builder).

## How the Integration Works

When the Stripo integration is enabled, a **Drag-n-drop email builder (Stripo)** option appears as a content source whenever a user creates or edits an email in Octeth. Selecting this option opens a fullscreen visual editor where the user can design their email using drag-and-drop content blocks, pre-designed templates, and built-in formatting tools.

Behind the scenes, Octeth communicates with Stripo's servers to authenticate the editor session and (optionally) load templates from your Stripo account. The integration requires three credentials:

| Credential | Purpose |
|---|---|
| **Plugin ID** | Identifies your Stripo plugin instance. Required for editor authentication. |
| **Secret Key** | Authenticates your Stripo plugin with Stripo's servers. Required for editor authentication. |
| **API Key** | Provides access to saved templates in your Stripo project. Optional, but required for the template gallery feature. |

The **Plugin ID** and **Secret Key** are shared across all users in your Octeth installation. The **API Key** is configured per user, allowing different users to access different Stripo template projects.

## Prerequisites

Before you begin, you need a Stripo.email account with plugin credentials. If you do not already have these:

1. Visit [stripo.email](https://stripo.email/) and create an account.
2. Navigate to your Stripo account's **Plugins** section to find your **Plugin ID** and **Secret Key**.
3. If you want to use the template gallery feature, locate your **API Key** in your Stripo project settings.

::: info
For detailed instructions on obtaining your Stripo plugin credentials and understanding the plugin integration options, see the [Stripo Plugin Integration Guide](https://stripo.email/blog/stripo-plugin-integration-comprehensive-guide-and-faq/).
:::

## Configuring the Stripo Integration

The Stripo integration is configured in the administrator settings. You must be logged in as an administrator to access these settings.

### Step 1: Open Integration Settings

1. Log in to Octeth as an administrator.
2. Navigate to **Settings** from the admin menu.
3. Click the **Integration** tab.
4. Click the **Stripo.email** tab within the integration settings.

[[SCREENSHOT: The admin Settings page with the Integration tab selected, showing the Stripo.email sub-tab with the Plugin ID, Secret Key, and API Key fields]]

### Step 2: Enter Plugin Credentials

1. Enter your **Plugin ID** in the **Plugin ID** field.
2. Enter your **Secret Key** in the **Secret Key** field.

These two credentials are required to enable the Stripo editor. When both fields are filled in, the Stripo editor option becomes available to all users in your Octeth installation.

::: tip
To disable the Stripo integration, clear both the **Plugin ID** and **Secret Key** fields and save the settings. The Stripo editor option will no longer appear for any user.
:::

### Step 3: Configure Per-User API Keys (Optional)

The **Stripo API Key** field allows you to map individual Octeth user accounts to their own Stripo API keys. This is required if you want users to access the **Template Gallery** feature, which lets them browse and load pre-designed templates from your Stripo project.

The API keys are entered as a JSON object where each key is an Octeth **User ID** and each value is the corresponding **Stripo API key**.

**Format:**

```json
{
  "1": "stripo-api-key-for-user-1",
  "5": "stripo-api-key-for-user-5",
  "12": "stripo-api-key-for-user-12"
}
```

The field uses a code editor with JSON syntax highlighting to help you format the configuration correctly.

::: info
If you do not configure an API key for a user, they can still use the Stripo editor to design emails. However, the template gallery will not be available to them — they will only be able to work with the default blank template or paste in their own HTML.
:::

#### Finding a User's ID

To find the User ID for a specific user account:

1. Navigate to **Users** from the admin menu.
2. Click on the user's name to open their profile.
3. Look at the URL in your browser's address bar. The URL follows the pattern:

   ```
   /admin/users/edit/{UserID}/Edit
   ```

   The number after `/edit/` is the User ID. For example, if the URL is `/admin/users/edit/5/Edit`, the User ID is `5`.

[[SCREENSHOT: The admin Users edit page with the browser address bar highlighted, showing the User ID in the URL path]]

::: tip
You can also find User IDs in the user list. Navigate to **Users**, and use the sort options to sort by **User ID**. The User ID for each account is visible in the list.
:::

#### Example Configuration

Suppose you have three users who need access to the Stripo template gallery:

- **User ID 1** (Admin account) — uses the main Stripo project
- **User ID 5** (Marketing team) — uses a shared marketing project
- **User ID 12** (Design team) — uses a dedicated design project

Your API key configuration would look like this:

```json
{
  "1": "abc123def456ghi789",
  "5": "jkl012mno345pqr678",
  "12": "stu901vwx234yz567"
}
```

If all users should share the same Stripo project and API key, enter the same API key value for each User ID:

```json
{
  "1": "shared-api-key-value",
  "5": "shared-api-key-value",
  "12": "shared-api-key-value"
}
```

### Step 4: Save Settings

Click **Save Settings** at the bottom of the page. Octeth validates your Plugin ID and Secret Key by attempting to authenticate with Stripo's servers. If the credentials are valid, the settings are saved. If the credentials are invalid, an error message appears asking you to check your Plugin ID and Secret Key.

::: warning
If you see the message "Stripo.email integration credentials are not correct", verify that you have copied the Plugin ID and Secret Key exactly as they appear in your Stripo account. Make sure there are no extra spaces before or after the values.
:::

## Verifying the Integration

After saving the settings, verify that the Stripo editor is available to your users:

1. Log in as a regular user account (or switch to a user account from the admin panel).
2. Navigate to **Campaigns** and create a new campaign.
3. In the campaign settings, click **Create Email**.
4. On the flow selection page, confirm that the **Drag-n-drop email builder (Stripo)** option is visible.

[[SCREENSHOT: The email flow selection page showing the Stripo Email Builder option as the first card]]

5. Click the **Drag-n-drop email builder (Stripo)** option.
6. Complete the email settings step (From Name, From Email, etc.) and proceed to the **Content** step.
7. Click the **Open Email Builder** button. The Stripo editor should open in a fullscreen overlay.

[[SCREENSHOT: The Content step showing the Open Email Builder button for the Stripo editor]]

If the editor opens successfully, the integration is working. If you configured an API key for this user, you can also verify the template gallery by clicking **Template Picker** in the editor toolbar.

::: tip
If the Stripo editor option does not appear on the flow selection page, double-check that both the **Plugin ID** and **Secret Key** are filled in and saved in the admin integration settings.
:::

## Where Users Can Access the Stripo Editor

Once enabled, the Stripo editor is available as a content source in the following areas of Octeth:

| Area | How to Access |
|---|---|
| **Email Campaigns** | Create or edit a campaign email. Select **Drag-n-drop email builder (Stripo)** as the content source. |
| **Auto Responders** | Create or edit an auto responder email. Select **Drag-n-drop email builder (Stripo)** as the content source. |
| **Confirmation Emails** | Create or edit a double opt-in confirmation email. Select **Drag-n-drop email builder (Stripo)** as the content source. |
| **Email Templates** | Create or edit a reusable email template. The Stripo editor is available when the integration is enabled. |

For detailed instructions on using the Stripo editor — including the editor layout, toolbar controls, template gallery, personalization tags, and saving your design — see [Email Builder](../email-builder#using-the-stripo-visual-email-builder).

## Personalization Tags in the Stripo Editor

The Stripo editor in Octeth supports personalization (merge) tags. When editing a text block in the Stripo editor, you can insert merge tags that are dynamically replaced with subscriber-specific data when the email is sent.

Available merge tags include:

- **Subscriber fields** — Email address, first name, last name, and any custom fields defined on the subscriber list.
- **Special tags** — Unsubscribe link, web version link, forward to a friend link, and other system-generated links.
- **Custom links** — Tracking links and other link-type personalization tags.

Merge tags appear in the Stripo editor's tag selector, organized by category. They use the same tag format as other Octeth email editors (for example, `%Tag:FirstName%`).

::: info
The available personalization tags depend on the context. Campaign emails show tags for the selected subscriber list. Auto responder and confirmation emails show tags for the list they belong to.
:::

## Important Notes

### Editor Switching

When an email is created using the Stripo editor, Octeth marks the email's content mode as **Stripo**. This means:

- The email will always open in the Stripo editor when you edit it.
- You cannot switch a Stripo email to the HTML code editor or vice versa after the email is created.
- If you want to use a different editor, create a new email and select the desired content source.

### Template Gallery Availability

The template gallery feature in the Stripo editor requires a per-user API key to be configured. Without an API key, the user can still design emails from scratch in the visual editor but cannot browse or load pre-designed templates from your Stripo project.

### Content Storage

When a user saves their design in the Stripo editor, Octeth stores three versions of the content:

- The **raw template HTML** and **CSS** used by the Stripo editor (so the email can be reopened and edited later).
- The **compiled HTML** that is sent to subscribers (a self-contained HTML file with inline styles).

This ensures that emails are both editable in the Stripo editor and ready for delivery.

## Troubleshooting

### The Stripo Editor Option Does Not Appear

If users do not see the **Drag-n-drop email builder (Stripo)** option when creating an email:

1. Verify that both the **Plugin ID** and **Secret Key** are filled in under **Settings** > **Integration** > **Stripo.email**.
2. Click **Save Settings** to re-validate the credentials.
3. If the credentials were recently changed, ask the user to log out and log back in, or refresh their browser.

### "Stripo.email integration credentials are not correct" Error

This error appears when saving the integration settings if Octeth cannot authenticate with Stripo's servers using the provided Plugin ID and Secret Key.

1. Log in to your Stripo.email account and navigate to the **Plugins** section.
2. Verify that the Plugin ID and Secret Key match exactly.
3. Check that your Stripo account is active and the plugin has not been deleted or deactivated.
4. Ensure your Octeth server has outbound internet access to reach `plugins.stripo.email`.

### Template Gallery Is Empty or Not Loading

If a user can open the Stripo editor but the template gallery shows no templates:

1. Confirm that an API key is configured for the user's User ID in the **Stripo API Key** field.
2. Verify the JSON format is correct — each User ID should be a string key with its API key as the value.
3. Check that the Stripo API key is valid and associated with a project that contains templates.
4. Ensure the Octeth server has outbound internet access to reach `my.stripo.email`.

### Editor Fails to Load or Shows Authentication Errors

If clicking **Open Email Builder** results in errors or a blank screen:

1. Check the browser's developer console for error messages.
2. Verify that the Octeth server can reach both `plugins.stripo.email` and `my.stripo.email`.
3. Ensure no browser extensions (such as ad blockers) are blocking requests to Stripo's domains.
4. Try clearing the browser cache and reloading the page.

::: warning
If your Octeth installation is behind a firewall or proxy, ensure that outbound HTTPS connections to `plugins.stripo.email` and `my.stripo.email` are allowed.
:::

## Related Articles

- [Email Builder](../email-builder) — Learn how to use the Stripo editor and other email content tools.
- [Email Campaigns](../email-campaigns) — Create and manage email campaigns.
- [Auto Responders](../auto-responders) — Set up automated email sequences.
- [Email Personalization](../email-personalization) — Learn about merge tags and dynamic content.
- [Users](../users) — Manage user accounts and find User IDs.
