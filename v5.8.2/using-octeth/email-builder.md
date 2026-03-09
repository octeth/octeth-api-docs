---
layout: doc
---

# Email Builder

The Email Builder is the interface where you create and design email content in Octeth. Whether you are composing a campaign email, setting up an auto responder, configuring a confirmation email, or building a reusable template, the Email Builder provides the tools to design professional emails with personalized content.

Octeth offers multiple ways to create email content — from a visual drag-and-drop editor powered by Stripo to a full HTML code editor for developers. This article covers how to use every aspect of the Email Builder, including configuring sender settings, designing email content, inserting personalization tags, previewing and testing your emails, and managing reusable email templates.

## Accessing the Email Builder

You can access the Email Builder from several places in Octeth, depending on what type of email you are creating.

### From a Campaign

1. Navigate to **Campaigns** and open your campaign.
2. In the **Settings** tab, click **Create Email** (for a new campaign) or **Edit Email** (for an existing campaign email).

This opens the Email Builder wizard where you can configure your email step by step.

::: info
The **Create Email** and **Edit Email** buttons are only available while the campaign is in **Draft** or **Ready** status. Once a campaign starts sending, the email content is locked.
:::

### From an Auto Responder

1. Navigate to the subscriber list containing your auto responder.
2. Click **Autoresponders** in the left sidebar.
3. Click the auto responder name to open it.
4. Click **Create email** or **Edit email** at the bottom of the edit form.

### From Email Templates

1. Navigate to **Email Templates** from the main menu.
2. Click **Create** to create a new template, or click an existing template name to edit it.

This opens the template builder, which provides a streamlined single-page editing experience. See [Managing Email Templates](#managing-email-templates) for details.

### From a Confirmation Email

1. Navigate to the subscriber list where double opt-in is enabled.
2. Access the confirmation email settings.
3. Click to create or edit the confirmation email content.

## Choosing an Email Content Source

When you create a new email (from a campaign, auto responder, or confirmation email), the first screen you see is the **flow selection** page. This page lets you choose how you want to create your email content.

[[SCREENSHOT: Flow selection page showing the available email content source options as clickable cards with titles and descriptions]]

The available options depend on the context (campaign, auto responder, or confirmation email). Here are all the possible content sources:

| Content Source | Description | Availability |
|---|---|---|
| **Stripo Email Builder** | A visual drag-and-drop email editor with pre-designed templates and a full design toolkit. Best for creating professional, responsive emails without writing code. | Campaigns, auto responders, confirmation emails (when Stripo is enabled). |
| **HTML Code Editor** | A code editor with syntax highlighting, live preview, and personalization support. Best for developers or users who prefer full control over the HTML. | Campaigns, auto responders, confirmation emails. |
| **From Scratch** | A rich text editor (similar to a word processor) for composing simple email content with basic formatting. | Campaigns, auto responders, confirmation emails. |
| **From Template** | Browse your saved email templates and load one as the starting point for your email. | Campaigns. |
| **Copy from Campaign** | Duplicate the email content from a previously sent or drafted campaign. | Campaigns. |
| **Copy from List** | Copy email content from a confirmation email on another subscriber list. | Confirmation emails. |
| **Fetch from URL** | Import HTML content from an external URL. Useful if you design your emails in an external tool and host the HTML online. | Campaigns, auto responders, confirmation emails. |

Click the content source you want to use. The Email Builder then proceeds to the **Settings** step.

::: tip
If you are new to email design or want the fastest path to a professional-looking email, choose **Stripo Email Builder**. It provides a visual editor with drag-and-drop content blocks and a gallery of pre-designed templates you can customize.
:::

::: info
The **Stripo Email Builder** option only appears if your administrator has enabled Stripo integration for your account. If you do not see this option, contact your administrator. For setup details, see [Stripo Email Builder Integration](./integrations/stripo-email-builder).
:::

## Configuring Email Settings

The **Settings** step is where you configure the sender information and preview text for your email.

[[SCREENSHOT: Email Settings step showing the From Name, From Email, Reply-To, and Pre-Header Text fields]]

### From Name and From Email

These fields control who the email appears to be from in the recipient's inbox.

| Field | Description |
|---|---|
| **From Name** | The sender name that recipients see in their inbox. For example, "Acme Marketing" or "Jane from Acme". |
| **From Email** | The email address that appears as the sender. For example, `newsletter@example.com`. |

::: info
If your administrator has configured **sender domains** for your account, the **From Email** field may appear as a combination of a text field and a domain dropdown. Enter the local part (the portion before the `@`) and select a domain from the dropdown. If a sender domain is enforced, the domain portion may be pre-selected and read-only.
:::

### Reply-To Settings

By default, replies to your email go to the same address specified in the **From Email** field. If you want replies sent to a different address:

1. Uncheck the **Same as From Name/Email** checkbox.
2. Enter the **Reply-To Name** and **Reply-To Email** in the fields that appear.

This is useful when the sending address is a no-reply address but you want recipients to be able to reply to a real mailbox.

### Pre-Header Text

The **Pre-Header Text** field lets you enter a short summary that appears next to or below the subject line in many email clients. This text gives recipients a preview of the email content before they open it.

[[SCREENSHOT: Pre-Header Text field with the character count progress bar showing green for short text]]

A character count indicator appears below the field:

- **Green** (0-50 characters) — Optimal length.
- **Yellow** (50-85 characters) — Acceptable but getting long.
- **Red** (85+ characters) — May be truncated in some email clients.

::: tip
Keep your pre-header text under 85 characters for best results across all email clients. Use it to complement your subject line — for example, if your subject is "Spring Sale Starts Today", your pre-header could be "Save up to 40% on selected items this week only."
:::

### Image Embedding

If your administrator has enabled image embedding for your account, an **Enable Image Embedding** checkbox appears. When enabled, images referenced in your email HTML are embedded directly into the email as inline attachments instead of being loaded from external URLs.

::: warning
Image embedding increases the email file size significantly. Only enable this if your recipients are in environments where external image loading is blocked (such as certain corporate email systems).
:::

After configuring the settings, click **Save & Next** to proceed to the **Content** step.

## Setting Up Email Content

The **Content** step is where you write your email subject line and design the email body. The interface adapts based on the content source you selected in the flow selection step.

### Content Type

At the top of the Content step, select the **Content Type** for your email:

| Content Type | Description |
|---|---|
| **HTML** | Send an HTML email only. Best for visually designed emails with images, colors, and formatting. |
| **Plain Text** | Send a plain text email only. Contains no formatting, images, or links — just text. |
| **Both** | Send an email with both HTML and plain text versions. The recipient's email client automatically displays the appropriate version. |

::: tip
Selecting **Both** is recommended for best deliverability. Some email clients and spam filters prefer emails that include a plain text alternative alongside the HTML version.
:::

### Subject Line

Enter the email subject in the **Subject** field. This is the text recipients see in their inbox before opening the email.

You can insert personalization tags into the subject line to customize it for each recipient. Click the **personalization dropdown** next to the subject field and select a merge tag (for example, a subscriber's first name) to insert it at the cursor position. See [Personalizing Your Emails](#personalizing-your-emails) for details on available tags.

### Using the Stripo Visual Email Builder

If you selected **Stripo Email Builder** as your content source, a large **Open Email Builder** button appears in the content area. Click it to open the Stripo editor in a fullscreen overlay.

[[SCREENSHOT: The Stripo visual editor open in fullscreen mode, showing the settings panel on the left and the email preview/canvas on the right]]

#### Editor Layout

The Stripo editor fills the entire screen and is divided into two panels:

- **Left panel** — The settings and content panel where you configure blocks, edit text, upload images, and adjust styling.
- **Right panel** — The email canvas where you see a live preview of your email design. Click any element on the canvas to select it and edit it in the left panel.

#### Editor Toolbar

The toolbar at the top of the Stripo editor provides these controls:

| Button | Description |
|---|---|
| **Cancel** | Close the editor and discard any changes made since it was opened. |
| **Save & Close** | Save the current design and close the editor. The HTML content is extracted and stored in your email. |
| **Undo / Redo** | Step backward or forward through your recent changes. |
| **Code Editor** | Toggle the HTML code view to make direct edits to the underlying HTML. |
| **Template Picker** | Open the template gallery to browse and load a pre-designed template. |
| **Change History** | View the history of changes made during this editing session. |

#### Using the Template Gallery

Click **Template Picker** in the toolbar to open the Stripo template gallery. The gallery displays a collection of pre-designed, responsive email templates organized in folders.

[[SCREENSHOT: Stripo template gallery showing folder navigation on the left and template thumbnails on the right]]

To load a template:

1. Browse through the folders by double-clicking a folder name to open it.
2. Click **Go Back** to navigate up to the parent folder.
3. Click a template thumbnail to select it (a highlighted border appears around the selected template).
4. Click **Load Template** to load the selected template into the editor.

::: warning
Loading a template replaces the current email content. If you have unsaved changes, they will be lost when you load a new template.
:::

#### Saving Your Design

When you are satisfied with your email design, click **Save & Close** in the toolbar. The Stripo editor closes, and your email's HTML content is updated with the design you created. The HTML content field on the Content step is populated automatically.

::: tip
You can switch between the Stripo visual editor and the underlying HTML at any time. Click **Code Editor** in the Stripo toolbar to view and edit the raw HTML. This is useful for making fine-tuned adjustments that are difficult to achieve in the visual editor.
:::

### Using the HTML Code Editor

If you selected **HTML Code Editor** as your content source, the Content step displays the ACE code editor — a professional code editing environment with syntax highlighting.

[[SCREENSHOT: The HTML Code Editor showing the ACE editor with syntax-highlighted HTML code, the toolbar with Personalize/Fullscreen/Load From URL buttons, and the live preview pane below]]

#### Editor Features

The ACE editor provides:

- **Syntax highlighting** — HTML tags, attributes, and values are color-coded for readability.
- **Line numbers** — Every line is numbered for easy reference.
- **Code folding** — Collapse and expand HTML sections to focus on specific parts of your email.

#### Editor Toolbar

Above the code editor, a toolbar provides three tools:

| Button | Description |
|---|---|
| **Personalize** | A dropdown menu that lists all available merge tags. Click a tag to insert it at the current cursor position in the editor. |
| **Toggle Fullscreen** | Expand the code editor to fill the entire browser window. Click again to return to the normal view. |
| **Load From URL** | Fetch HTML content from an external URL and load it into the editor. You are prompted to confirm before the current content is replaced. |

#### Live Preview Pane

Below the code editor, a live preview pane shows a rendered version of your HTML. The preview updates automatically as you type, with a short delay to avoid flickering during rapid edits. This lets you see the visual result of your code changes without leaving the editor.

::: tip
Use the **Load From URL** feature if you design your emails in an external tool (such as a web-based email designer) and want to import the HTML into Octeth. Enter the URL where your email HTML is hosted, and the editor fetches and loads it automatically.
:::

### Using the Rich Text Editor

If you selected **From Scratch** as your content source, the Content step displays a rich text editor powered by TinyMCE. This is a familiar word-processor-style editor that lets you compose emails using a formatting toolbar.

[[SCREENSHOT: The rich text editor showing the TinyMCE toolbar with formatting buttons and the editing area below]]

The toolbar includes:

- **Text formatting** — Bold, italic, underline, strikethrough, font family, font size, and text color.
- **Paragraph formatting** — Alignment (left, center, right, justified), bulleted lists, numbered lists, indentation, and blockquotes.
- **Insert tools** — Tables, links, images, and horizontal rules.
- **Utility tools** — Cleanup formatting, fullscreen mode, and HTML code view.
- **Personalizer** — A toolbar button that opens a merge tag selector. Click it to insert personalization tags into your email content.

::: info
The rich text editor is best suited for simple, text-focused emails. If you need advanced layout control, responsive design, or complex visual elements, use the **Stripo Email Builder** or the **HTML Code Editor** instead.
:::

### Plain Text Content

When you select **Plain Text** or **Both** as your content type, a plain text editor area appears. This is a simple text area where you type or paste your email's plain text version.

You can insert personalization tags into the plain text content using the **personalization dropdown** above the editor.

#### Converting HTML to Plain Text

When the content type is set to **Both**, a **Convert HTML to Plain Text** button appears between the HTML and plain text editors. Click this button to automatically generate a plain text version from your HTML content. The conversion strips all HTML tags, extracts link URLs, and formats the text for readability.

::: warning
Converting HTML to plain text overwrites any existing plain text content. Review and edit the generated plain text after conversion to ensure it reads well.
:::

### Fetching Content from a URL

If you selected **Fetch from URL** as your content source, URL input fields appear in the Content step. Enter the URL where your email HTML is hosted, and Octeth fetches the content and loads it into the editor.

If your content type is set to **Both**, separate URL fields appear for the HTML version and the plain text version.

### Copying Content from an Existing Campaign

If you selected **Copy from Campaign**, a dropdown appears listing your existing campaigns. Select a campaign, and its email content (including subject line, HTML, and plain text) is loaded into the editor for you to modify.

### Adding Attachments

The Content step may include an **Attachments** section where you can upload files to include with your email.

To add an attachment:

1. Click the file upload field in the **Attachments** section.
2. Select a file from your computer.
3. The file uploads and appears in the attachment list with its filename and file size.

Uploaded attachments are listed with checkboxes. Uncheck an attachment to exclude it from the email without deleting it.

::: warning
Large attachments increase email size and may cause deliverability issues. Many email providers reject messages larger than 10-25 MB. Keep attachments small, or consider hosting files on your website and linking to them in your email instead.
:::

After completing the content, click **Save & Next** to proceed to the **Preview** step.

## Personalizing Your Emails

Octeth supports personalization through merge tags — placeholders that are automatically replaced with each recipient's actual data when the email is sent. You can insert merge tags into the subject line, HTML content, and plain text content.

### Available Merge Tag Categories

| Category | Description | Examples |
|---|---|---|
| **Subscriber Fields** | Built-in subscriber data fields. | First name, last name, email address. |
| **Custom Fields** | Custom fields you have defined on your subscriber list. | Birthday, company name, membership level — any custom field you created. |
| **Link Tags** | Dynamic links that are unique to each recipient. | Unsubscribe link, browser view link, forward-to-friend link, subscriber area link. |
| **User Fields** | Information about the sending account or organization. | Company name, user email address. |

### Inserting Merge Tags

There are several ways to insert merge tags depending on which editor you are using:

**In the Subject Line:**
Click the **personalization dropdown** next to the subject field. Select a tag from the categorized list, and it is inserted at the cursor position.

**In the HTML Code Editor:**
Click the **Personalize** button in the editor toolbar. A dropdown menu appears with all available tags organized by category. Click a tag to insert it at the current cursor position.

**In the Rich Text Editor:**
Click the **Personalizer** button in the TinyMCE toolbar. Select a tag from the menu to insert it into your content.

**In the Stripo Visual Editor:**
Merge tags are available through the Stripo editor's built-in personalization support. When editing a text block, you can access merge tags from the editor's formatting options.

**In the Plain Text Editor:**
Click the **personalization dropdown** above the plain text editor and select a tag.

### Common Merge Tags

Here are some frequently used merge tags:

| Tag | Description |
|---|---|
| Subscriber email address | Inserts the recipient's email address. |
| Subscriber first name | Inserts the recipient's first name. |
| Subscriber last name | Inserts the recipient's last name. |
| Unsubscribe link | Inserts a unique unsubscribe URL for the recipient. |
| Browser view link | Inserts a URL to view the email in a web browser. |
| Forward link | Inserts a URL for forwarding the email to a friend. |
| Subscriber area link | Inserts a URL to the subscriber's preference management area. |

::: tip
Personalizing the subject line with the recipient's first name can significantly improve open rates. For example, a subject like "John, your weekly digest is ready" feels more personal than "Your weekly digest is ready."
:::

::: warning
If a merge tag references a field that is empty for a particular subscriber, the tag is replaced with an empty string. Consider using default values or writing your content so that it reads naturally even if personalization fields are blank.
:::

## Previewing and Testing Your Email

The **Preview** step is the final step before saving your email. It provides tools to verify that your email looks correct and performs well across different email clients.

[[SCREENSHOT: The Preview step showing the email preview panel, spam filter analysis results, and content analysis summary]]

### Sending a Preview Email

To see how your email looks in an actual email client:

1. Select **Preview in Email Client** as the preview type.
2. Enter one or more email addresses in the **Preview Email Address** field (separate multiple addresses with commas).
3. Click **Send Test Email**.

Octeth sends the email to the specified addresses so you can review it in your inbox. The preview email includes all personalization tags replaced with sample data.

::: tip
Send preview emails to yourself and colleagues using different email clients (such as Gmail, Outlook, and Apple Mail) to verify that your email renders correctly across platforms.
:::

### Previewing in Browser

Select **Preview in Browser** and click the preview button to open your email in a new browser tab. This shows the rendered HTML as it would appear in a web-based email client.

### Spam Filter Analysis

If your administrator has enabled spam testing for your account, the Preview step displays a **Spam Filter Analysis** section. This runs your email content through SpamAssassin, a widely used spam detection engine, and shows the results.

[[SCREENSHOT: Spam Filter Analysis results showing a table of spam rules with point values and descriptions, and the total spam score]]

The analysis displays:

- A table of spam rules that matched your email, each with a **point value** and a **description** of the rule.
- A **total spam score** — the sum of all matching rule points.

A lower score is better. Most email providers consider emails with a score above 5.0 as likely spam.

::: tip
If your spam score is high, review the matched rules and adjust your email content accordingly. Common issues include using all-uppercase subject lines, excessive use of sales language ("Buy now!", "Free!"), missing unsubscribe links, and image-heavy layouts with little text.
:::

### Content Analysis

The **Content Analysis** section scans your email HTML and reports on elements that may affect rendering or deliverability:

| Element | What It Checks |
|---|---|
| **Images** | The number and types of images found in your email (JPG, PNG, GIF, etc.), including whether they are embedded or external. |
| **CSS Styles** | The number of inline CSS declarations and CSS style tags. Some email clients strip or ignore certain CSS. |
| **JavaScript** | Whether any JavaScript is present. JavaScript is not supported in emails and is stripped by virtually all email clients. |

::: warning
If the content analysis detects JavaScript in your email, remove it. JavaScript in emails is universally blocked by email clients and may cause your email to be flagged as suspicious by spam filters.
:::

### Design Preview Testing

If your administrator has enabled design preview testing, a **Test Email Design** button appears. Click it to submit your email for rendering across dozens of email clients and devices. After the test completes, a gallery of screenshots shows how your email appears in each client.

Previous design tests are available in a dropdown so you can compare results over time.

::: info
Design preview testing uses an external service to render your email in real email clients. The test may take a few minutes to complete depending on the number of clients being tested.
:::

## Managing Email Templates

Email templates are reusable email designs that you can save and apply to multiple campaigns, auto responders, or other emails. Instead of designing an email from scratch each time, you can create a template once and reuse it whenever needed.

### Browsing Email Templates

To view your email templates, navigate to **Email Templates** from the main menu.

[[SCREENSHOT: Email Templates browse page showing a list of templates with their names, descriptions, creation dates, and action links]]

The template list displays:

| Column | Description |
|---|---|
| **Checkbox** | Select individual templates for bulk actions. |
| **Template Name** | The name of the template. Click to open it for editing. |
| **Description** | A brief description of the template's purpose or design. |
| **Owner** | The user or user group that owns the template. |
| **Created Date** | When the template was created. |

### Creating an Email Template

To create a new email template:

1. Navigate to **Email Templates**.
2. Click **Create**.

[[SCREENSHOT: Email template builder page showing the template name, subject, pre-header text, content type selector, HTML editor area, and the right-side panel with spam analysis, content analysis, and preview]]

The template builder opens as a single-page editor with two columns:

**Left column — Template content:**

| Field | Description |
|---|---|
| **Email Name** | A descriptive name for the template (for example, "Monthly Newsletter Template" or "Welcome Email Design"). |
| **Email Subject** | The default subject line for emails using this template. Can be changed when the template is applied to a campaign. |
| **Pre-Header Text** | Default pre-header text. Can also be changed per campaign. |
| **Content Type** | Select **HTML**, **Plain Text**, or **Both**. |
| **HTML Content** | The email design editor. Depending on your configuration, this is either the Stripo visual builder (with an **Open Email Builder** button) or the ACE HTML code editor. |
| **Plain Text Content** | The plain text version of the email (shown when content type is Plain Text or Both). |

A **Convert HTML Content Into Plain Text** button is available when the content type is set to **Both**.

**Right column — Analysis and preview:**

- **Spam Filter Analysis** — Real-time SpamAssassin score with rule breakdown.
- **Content Analysis** — Image, CSS, and JavaScript detection summary.
- **Email Preview** — A scaled-down preview of the rendered email with a **Refresh preview** link and a **Preview on web browser** link.
- **Send a Preview Email** — Enter recipient email addresses and click **Send Preview Email** to test the template.

Click **Create Email Template** to save the new template.

### Editing an Email Template

To edit an existing template:

1. Navigate to **Email Templates**.
2. Click the template name in the list.
3. Make your changes in the template builder.
4. Click **Save Email Template**.

::: info
Editing a template does not retroactively update campaigns or auto responders that have already used the template. Only future emails that load the template will use the updated version.
:::

### Template Access and Permissions

When creating or editing a template, you may see additional settings for controlling access:

| Setting | Description |
|---|---|
| **Owner** | Assign the template to a specific user or user group. |
| **Access Type** | **Read** — Other users can view and use the template but cannot modify it. **Read-Edit** — Other users can both use and modify the template. |

### Using a Template in a Campaign

To use a saved template when creating a campaign email:

1. In the flow selection step, choose **From Template**.
2. Browse the template gallery that appears.
3. Select the template you want to use.
4. The template's content is loaded into the editor, where you can customize it for your specific campaign.

The template's default subject line, pre-header text, and content are pre-filled but fully editable.

### Deleting Email Templates

To delete one or more templates:

1. Navigate to **Email Templates**.
2. Select the templates using the checkboxes.
3. Click **Delete** in the toolbar.
4. Confirm the deletion when prompted.

::: danger
Deleting an email template is permanent and cannot be undone. Campaigns and auto responders that previously used the template are not affected — they retain their own copy of the email content.
:::

## Tips and Best Practices

::: tip Write a Compelling Subject Line
The subject line is the single most important factor in whether recipients open your email. Keep it under 60 characters, make it specific, and avoid all-caps or excessive punctuation. Test different subject lines across campaigns to learn what resonates with your audience.
:::

::: tip Always Include an Unsubscribe Link
Including an unsubscribe link is not just a best practice — it is required by email regulations such as CAN-SPAM and GDPR. Use the unsubscribe merge tag to insert a compliant unsubscribe link in every email. Your administrator may enforce this requirement at the account level.
:::

::: tip Use Pre-Header Text Strategically
Many email clients display the pre-header text alongside the subject line in the inbox. Use this space to add context that complements your subject line and encourages recipients to open the email. Do not leave it blank — some email clients will pull in the first line of your email body, which may not be ideal.
:::

::: tip Design for Mobile First
A significant portion of emails are opened on mobile devices. Use responsive email templates (the Stripo editor creates responsive designs by default), keep your layout simple, use large tap-friendly buttons, and test your emails on multiple screen sizes.
:::

::: tip Test Before Sending
Always send a preview email and review the spam filter analysis before scheduling a campaign. Catching issues in the preview step prevents sending a broken or poorly rendered email to your entire list.
:::

::: tip Build a Template Library
If you send emails regularly, create templates for your most common email types — newsletters, announcements, promotions, and transactional emails. This saves time and ensures brand consistency across all your communications.
:::

::: tip Check Your Spam Score
Use the Spam Filter Analysis tool in the Preview step to check your email's spam score before sending. Aim for a score below 3.0. If your score is high, the analysis table shows which rules triggered and what to fix.
:::

## Related Features

- **[Email Campaigns](./email-campaigns)** — Create and send campaigns using the emails you build.
- **[Auto Responders](./auto-responders)** — Set up automated emails triggered by subscriber events.
- **[Journeys](./journeys)** — Build multi-step automation workflows that include email actions.
- **[Email Personalization](./email-personalization)** — Learn more about merge tags and dynamic content.
- **[Sender Domains](./sender-domains)** — Configure authenticated sending domains for your emails.
- **[Stripo Email Builder Integration](./integrations/stripo-email-builder)** — Set up and configure the Stripo visual email builder.
