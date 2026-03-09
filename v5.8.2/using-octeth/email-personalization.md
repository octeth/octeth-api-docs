---
layout: doc
---

# Email Personalization

Email personalization lets you insert dynamic content into your emails so that each subscriber receives a message tailored to them. Instead of sending the same generic text to everyone, you can greet subscribers by name, reference their location, display relevant dates, and adapt entire content blocks based on subscriber data.

This article covers all available personalization tags, helper functions, conditional content, and advanced features you can use in email subject lines, body content, autoresponder messages, and journey email templates.

## What Is Email Personalization?

When you compose an email in Octeth, you can insert **personalization tags** — placeholders that are replaced with actual subscriber data at the moment the email is sent. Each recipient receives a unique version of the email with their own data filled in.

Personalization tags can be used in:

- **Email subject lines** — Personalize the subject to improve open rates.
- **Email body content** (HTML and plain text) — Address subscribers by name, show custom data, or display dynamic content.
- **Autoresponder messages** — Personalize automated follow-up emails.
- **Journey email templates** — Use subscriber data and event properties in journey automation emails.

For example, if you write:

```
Hello {{ Subscriber:FirstName }}, here are your weekly updates.
```

A subscriber named Sarah receives "Hello Sarah, here are your weekly updates." while a subscriber named James receives "Hello James, here are your weekly updates."

## Personalization Tag Syntax

Octeth uses a **handlebars-style syntax** with double or triple curly braces for personalization tags.

### Modern Syntax (Recommended)

The modern syntax uses double curly braces for standard output and triple curly braces for raw output:

```
{{ Subscriber:FirstName }}
{{{ Subscriber:FirstName }}}
```

- **Double braces** <code v-pre>{{ }}</code> — The output is HTML-encoded. Special characters like `<`, `>`, and `&` are converted to their HTML entity equivalents. Use this in most situations.
- **Triple braces** <code v-pre>{{{ }}}</code> — The output is inserted as-is without encoding. Use this when the field value contains HTML that should be rendered.

### Legacy Syntax

Octeth also supports a legacy syntax using percent signs:

```
%Subscriber:FirstName%
```

The legacy syntax is fully functional and maintained for backward compatibility with older email templates. However, it does not support fallback values or helper functions. New templates should use the modern handlebars syntax.

::: tip
Use the modern <code v-pre>{{ }}</code> syntax for all new email content. It supports fallback values, helper functions, and provides safer HTML encoding by default.
:::

## Inserting Personalization Tags

You do not need to memorize tag names to use personalization. The email editor provides built-in tools for inserting tags.

### Using the Personalize Dropdown in the Editor

When composing email content in the visual editor:

1. Place your cursor where you want the personalized content to appear.
2. Click the **Personalize** dropdown button in the editor toolbar.
3. Browse the available tag categories (Subscriber, User, List, Links, and more).
4. Click the tag you want to insert.

The tag is inserted at your cursor position in the editor.

[[SCREENSHOT: The email content editor showing the Personalize dropdown menu open with tag categories listed]]

### Inserting Tags in the Subject Line

When editing the email subject line:

1. Place your cursor in the **Subject** field.
2. Select a tag from the personalization dropdown next to the subject field.

The selected tag is inserted into the subject line at the cursor position.

[[SCREENSHOT: The email subject line field with the personalization tag dropdown open]]

::: info
Link tags (such as unsubscribe and forward links) are not available in the subject line dropdown — they can only be used in the email body content.
:::

## Subscriber Tags

Subscriber tags insert data from the recipient's subscriber record. These are the most commonly used personalization tags.

### Standard Subscriber Fields

| Tag | Description |
|---|---|
| <code v-pre>{{ Subscriber:EmailAddress }}</code> | The subscriber's email address. |
| <code v-pre>{{ Subscriber:SubscriptionDate }}</code> | The date the subscriber was added to the list. |
| <code v-pre>{{ Subscriber:SubscriptionIP }}</code> | The IP address recorded when the subscriber joined. |
| <code v-pre>{{ Subscriber:OptInDate }}</code> | The date the subscriber confirmed their subscription (double opt-in). |
| <code v-pre>{{ Subscriber:SubscriberID }}</code> | The unique numeric identifier for the subscriber. |
| <code v-pre>{{ Subscriber:HashedSubscriberID }}</code> | An MD5 hash of the subscriber ID, useful for generating unique URLs. |

### Custom Field Tags

Any [custom field](./custom-fields) defined on the subscriber list is available as a personalization tag. The tag name depends on whether a **merge tag alias** has been set for the field:

- **With alias:** <code v-pre>{{ Subscriber:AliasName }}</code> — for example, <code v-pre>{{ Subscriber:FirstName }}</code>
- **Without alias:** <code v-pre>{{ Subscriber:CustomFieldID }}</code> — for example, <code v-pre>{{ Subscriber:CustomField5 }}</code>

**Example:**

```
Hi {{ Subscriber:FirstName }}, thank you for being a subscriber since {{ Subscriber:SubscriptionDate }}.
```

::: tip
Assign a meaningful merge tag alias to every custom field you plan to use in emails. A tag like <code v-pre>{{ Subscriber:FirstName }}</code> is much easier to read than <code v-pre>{{ Subscriber:CustomField42 }}</code>.
:::

## User (Sender) Tags

User tags insert data from the account that owns the subscriber list. These are useful for including sender information such as company name and contact details.

| Tag | Description |
|---|---|
| <code v-pre>{{ User:FirstName }}</code> | The account owner's first name. |
| <code v-pre>{{ User:LastName }}</code> | The account owner's last name. |
| <code v-pre>{{ User:EmailAddress }}</code> | The account owner's email address. |
| <code v-pre>{{ User:CompanyName }}</code> | The company name. |
| <code v-pre>{{ User:Website }}</code> | The company website URL. |
| <code v-pre>{{ User:Street }}</code> | Street address. |
| <code v-pre>{{ User:City }}</code> | City. |
| <code v-pre>{{ User:State }}</code> | State or province. |
| <code v-pre>{{ User:Zip }}</code> | Postal or ZIP code. |
| <code v-pre>{{ User:Country }}</code> | Country. |
| <code v-pre>{{ User:Phone }}</code> | Phone number. |
| <code v-pre>{{ User:Fax }}</code> | Fax number. |
| <code v-pre>{{ User:TimeZone }}</code> | The account's time zone. |

**Example — adding a physical mailing address to comply with anti-spam regulations:**

```
{{ User:CompanyName }}
{{ User:Street }}, {{ User:City }}, {{ User:State }} {{ User:Zip }}
{{ User:Country }}
```

## List Tags

List tags insert data from the subscriber list associated with the email being sent.

| Tag | Description |
|---|---|
| <code v-pre>{{ List:ListID }}</code> | The unique numeric identifier of the list. |
| <code v-pre>{{ List:Name }}</code> | The name of the subscriber list. |
| <code v-pre>{{ List:SenderName }}</code> | The sender name configured for the list. |
| <code v-pre>{{ List:SenderEmailAddress }}</code> | The sender email address configured for the list. |
| <code v-pre>{{ List:SenderAddress }}</code> | The physical sender address configured for the list. |
| <code v-pre>{{ List:SenderCompany }}</code> | The sender company name configured for the list. |

## Campaign Tags

Campaign tags insert data related to the email campaign being sent.

| Tag | Description |
|---|---|
| <code v-pre>{{ Campaign:CampaignID }}</code> | The unique numeric identifier of the campaign. |
| <code v-pre>{{ Campaign:HashedCampaignID }}</code> | An MD5 hash of the campaign ID. |
| <code v-pre>{{ Campaign:Name }}</code> | The name of the campaign. |

## Link Tags

Link tags insert special action links into your email content. These tags generate tracked URLs that perform specific actions when clicked by the subscriber.

::: info
Link tags are only available in the email body content. They cannot be used in subject lines.
:::

### List Management Links

These links allow subscribers to manage their subscription:

| Tag | Description |
|---|---|
| `%Link:Unsubscribe%` | Inserts an unsubscribe link. When clicked, the subscriber is removed from the list. |
| `%Link:Suppression%` | Inserts a global suppression link. When clicked, the subscriber's email address is added to the suppression list, preventing emails from all lists. |
| `%Link:SubscriberArea%` | Inserts a link to the subscriber preference center where subscribers can update their information. |

::: warning
Including an unsubscribe link in every marketing email is required by most anti-spam regulations (such as CAN-SPAM and GDPR). Always include `%Link:Unsubscribe%` in your email templates.
:::

### Campaign Action Links

These links provide sharing and viewing options:

| Tag | Description |
|---|---|
| `%Link:Forward%` | Inserts a "forward to a friend" link that opens a sharing page. |
| `%Link:WebBrowser%` | Inserts a "view in browser" link that opens the email as a web page. |
| `%Link:ReportAbuse%` | Inserts a link for reporting the email as abuse. |
| `%Link:SocialShare:Twitter%` | Inserts a link to share the email on Twitter/X. |
| `%Link:SocialShare:Facebook%` | Inserts a link to share the email on Facebook. |

**Example — a standard email footer with management links:**

```html
<a href="%Link:WebBrowser%">View in browser</a> |
<a href="%Link:Forward%">Forward to a friend</a> |
<a href="%Link:Unsubscribe%">Unsubscribe</a>
```

### Opt-In Confirmation Links

These links are used in double opt-in confirmation emails:

| Tag | Description |
|---|---|
| `%Link:Confirm%` | Inserts the confirmation link that subscribers click to verify their subscription. |
| `%Link:Reject%` | Inserts a link that subscribers can click to reject the subscription. |

::: info
Opt-in confirmation links are only available in confirmation email templates, not in regular campaigns.
:::

## Fallback Values

When a subscriber's field is empty, you can provide a **fallback value** that is displayed instead. Fallback values are specified after a pipe character (`|`) inside the tag:

```
{{ Subscriber:FirstName|"Subscriber" }}
```

If the subscriber's first name is empty, the output is "Subscriber" instead of a blank space.

**More examples:**

```
Hello {{ Subscriber:FirstName|"there" }}, welcome to our newsletter.
You are located in {{ Subscriber:City|"your area" }}.
Your company: {{{ Subscriber:CompanyName|"N/A" }}}
```

::: tip
Always use fallback values for fields that may be empty, especially in greetings and subject lines. An email that says "Hello , welcome!" looks unprofessional.
:::

::: info
Fallback values are only supported in the modern <code v-pre>{{ }}</code> and <code v-pre>{{{ }}}</code> syntax. The legacy `%Tag%` syntax does not support fallbacks.
:::

## Helper Functions

Helper functions transform the output of a personalization tag. Place the helper name before the tag inside the curly braces:

```
{{ helperName Subscriber:FieldName }}
```

### Text Case Helpers

| Helper | Description | Example Input | Example Output |
|---|---|---|---|
| `uppercase` | Converts to uppercase. | `sarah connor` | `SARAH CONNOR` |
| `lowercase` | Converts to lowercase. | `SARAH CONNOR` | `sarah connor` |
| `capitalize` | Capitalizes the first letter. | `sarah connor` | `Sarah connor` |
| `capitalizeAll` | Capitalizes the first letter of each word. | `sarah connor` | `Sarah Connor` |
| `titleize` | Same as `capitalizeAll`. | `sarah connor` | `Sarah Connor` |
| `camelcase` | Converts to camelCase. | `first name` | `firstName` |
| `pascalcase` | Converts to PascalCase. | `first name` | `FirstName` |
| `dashcase` | Converts camelCase to dash-case. | `firstName` | `first-name` |
| `dotcase` | Converts camelCase to dot.case. | `firstName` | `first.name` |
| `snakecase` | Converts camelCase to snake_case. | `firstName` | `first_name` |

### Trimming Helpers

| Helper | Description |
|---|---|
| `trim` | Removes whitespace from both ends of the value. |
| `trimLeft` | Removes whitespace from the beginning of the value. |
| `trimRight` | Removes whitespace from the end of the value. |

### Truncation Helpers

| Helper | Description |
|---|---|
| `ellipsis` | Truncates to 20 characters and appends "...". |
| `ellipsis-N` | Truncates to N characters and appends "...". For example, `ellipsis-50`. |
| `truncate` | Truncates to 20 characters without appending anything. |
| `truncate-N` | Truncates to N characters. For example, `truncate-100`. |
| `truncateWords` | Truncates to 5 words and appends "...". |
| `truncateWords-N` | Truncates to N words and appends "...". For example, `truncateWords-10`. |

### Encoding Helpers

| Helper | Description |
|---|---|
| `urlEncode` | URL-encodes the value using standard encoding. |
| `encodeURI` | URL-encodes the value using RFC 3986 encoding. |
| `decodeURI` | Decodes a URL-encoded value. |
| `raw` | Outputs the value without HTML encoding (same effect as triple braces). |

### Date Formatting Helper

The `dateFormat` helper formats a date field value using a PHP date format string:

```
{{ dateFormat-FORMAT Subscriber:FieldName }}
```

Replace `FORMAT` with a PHP date format pattern. Use underscores (`_`) in place of spaces within the format string.

**Examples:**

| Tag | Output Example |
|---|---|
| <code v-pre>{{ dateFormat-Y-m-d Subscriber:BirthDate }}</code> | `2024-12-25` |
| <code v-pre>{{ dateFormat-F_j,_Y Subscriber:BirthDate }}</code> | `December 25, 2024` |
| <code v-pre>{{ dateFormat-M_d Subscriber:BirthDate }}</code> | `Dec 25` |
| <code v-pre>{{ dateFormat-d/m/Y Subscriber:BirthDate }}</code> | `25/12/2024` |

The `dateFormat` helper also supports fallback values:

```
{{ dateFormat-F_j,_Y Subscriber:BirthDate|"No date provided" }}
```

**Common PHP date format characters:**

| Character | Description | Example |
|---|---|---|
| `Y` | Four-digit year | `2024` |
| `y` | Two-digit year | `24` |
| `m` | Month with leading zero | `01` to `12` |
| `n` | Month without leading zero | `1` to `12` |
| `F` | Full month name | `January` |
| `M` | Abbreviated month name | `Jan` |
| `d` | Day with leading zero | `01` to `31` |
| `j` | Day without leading zero | `1` to `31` |
| `D` | Abbreviated day name | `Mon` |
| `l` | Full day name | `Monday` |
| `H` | Hour (24-hour, leading zero) | `00` to `23` |
| `h` | Hour (12-hour, leading zero) | `01` to `12` |
| `i` | Minutes with leading zero | `00` to `59` |
| `A` | Uppercase AM/PM | `AM` or `PM` |

### Helper Usage Examples

```
Hello {{ capitalizeAll Subscriber:FirstName|"Subscriber" }}!

Here is a short preview: {{ ellipsis-100 Subscriber:Bio }}

Your subscription date: {{ dateFormat-F_j,_Y Subscriber:SubscriptionDate }}

Visit: {{ urlEncode Subscriber:Website }}
```

::: info
Helpers can be combined with fallback values. Place the helper before the tag and the fallback after the pipe: <code v-pre>{{ uppercase Subscriber:City|"UNKNOWN" }}</code>.
:::

## Date Personalization

You can insert the current date into your emails using the `%Date%` tag with a PHP date format:

```
%Date=FORMAT%
```

**Examples:**

| Tag | Output Example |
|---|---|
| `%Date=Y-m-d%` | `2024-12-25` |
| `%Date=F j, Y%` | `December 25, 2024` |
| `%Date=D, d M Y%` | `Wed, 25 Dec 2024` |
| `%Date=l%` | `Wednesday` |
| `%Date=h:i A%` | `02:30 PM` |

The date reflects the moment the email is sent, so each delivery batch may show a slightly different time.

::: tip
Use the current date tag in time-sensitive content such as daily digests or event reminders. For example: "Here is your daily summary for `%Date=F j, Y%`."
:::

To format a **subscriber's date field** (such as a birthday or registration date), use the `dateFormat` helper instead — see [Date Formatting Helper](#date-formatting-helper).

## Conditional Content

Conditional content lets you show or hide sections of your email based on subscriber data. Different subscribers see different content within the same email.

### Modern Conditional Syntax

Use the `{{ if }}` block to conditionally display content:

```
{{ if Subscriber:City }}
  We have a local event in {{ Subscriber:City }} coming up!
{{ else }}
  Check out our upcoming events near you!
{{ endif }}
```

**Comparing values:**

Use the `<>` operator to compare a field against a specific value:

```
{{ if Subscriber:Country<>United States }}
  Free shipping on all US orders this week!
{{ else }}
  International shipping rates apply.
{{ endif }}
```

### Legacy Conditional Syntax

Octeth also supports a legacy conditional syntax:

```
[IF:EXPRESSION]
  Content shown when the expression is true.
[ELSE]
  Content shown when the expression is false.
[ENDIF]
```

Supported comparison operators: `=`, `!=`, `>`, `<`, `>=`, `<=`

**Example:**

```
[IF:%Subscriber:Country%=United States]
  Free domestic shipping!
[ELSE]
  International shipping rates apply.
[ENDIF]
```

::: info
The `[ELSE]` block is optional. If omitted, nothing is displayed when the expression is false.
:::

**Practical examples:**

```
[IF:%Subscriber:FirstName%!=""]
  Hello %Subscriber:FirstName%,
[ELSE]
  Hello,
[ENDIF]
```

```
{{ if Subscriber:MembershipLevel<>Gold }}
  As a Gold member, you get exclusive early access.
{{ else }}
  Upgrade to Gold for early access to all new products.
{{ endif }}
```

::: tip
Use conditional content to create a single email template that adapts to different subscriber segments. This is easier to maintain than creating separate campaigns for each audience group.
:::

## Text Modifiers

Text modifiers transform inline text within your email content. Unlike helper functions (which work inside handlebars tags), modifiers wrap any text — including already-replaced personalization values.

| Modifier | Description | Example | Output |
|---|---|---|---|
| `[TITLE:text]` | Capitalizes the first letter of each word. | `[TITLE:sarah connor]` | `Sarah Connor` |
| `[UPPER:text]` | Converts all characters to uppercase. | `[UPPER:sarah connor]` | `SARAH CONNOR` |
| `[LOWER:text]` | Converts all characters to lowercase. | `[LOWER:SARAH CONNOR]` | `sarah connor` |

**Using modifiers with personalization tags:**

Since modifiers are processed after tag replacement, you can wrap a personalization tag with a modifier:

```
Dear [TITLE:%Subscriber:FirstName% %Subscriber:LastName%],
```

If the subscriber's name is stored as "sarah connor", the output is "Dear Sarah Connor,".

## Content Spinning

Content spinning lets you randomly vary the text in your emails. Define multiple text variants separated by pipe characters inside double square brackets, and Octeth randomly selects one variant for each recipient:

```
[[variant1|variant2|variant3]]
```

**Example:**

```
[[Hello|Hi|Hey|Greetings]] {{ Subscriber:FirstName|"there" }},

[[We hope you're having a great day.|Thanks for being a subscriber.|Welcome back!]]
```

Each subscriber receives a random combination of the greeting and the follow-up sentence.

::: tip
Content spinning is useful for A/B testing different wording within the same campaign, and for adding natural variation to automated or recurring emails.
:::

## Random Data Tags

Random data tags generate random values each time an email is sent. These are useful for generating unique codes, reference numbers, or adding variation to content.

| Tag | Description | Example Output |
|---|---|---|
| `%Random:FirstName%` | A random first name from a pool of 1,000 names. | `Emily` |
| `%Random:LastName%` | A random last name from a pool of 1,000 names. | `Thompson` |
| `%Random:Letters:N%` | N random uppercase letters. | `%Random:Letters:6%` → `KBWDMF` |
| `%Random:Numbers:N%` | N random digits. | `%Random:Numbers:4%` → `8293` |
| `%Random:Alpha:N%` | N random alphanumeric characters. | `%Random:Alpha:8%` → `k3Bw9mF2` |

**Example — generating a unique reference code:**

```
Your reference code: %Random:Alpha:10%
```

## Remote Content

Remote content tags fetch and insert content from an external URL at the time the email is sent. This is useful for including dynamic content such as live pricing, inventory status, or personalized product recommendations from your own systems.

### Fetching Remote Content

```
%RemoteContent=https://example.com/api/content%
```

When the email is sent, Octeth makes an HTTP request to the specified URL and inserts the response body into the email at that position.

### Pre-Send Remote Content

```
%RemoteContentBeforeSend=https://example.com/api/content%
```

This variant fetches the content earlier in the delivery pipeline, before other personalization processing occurs.

### Using Subscriber Data in Remote Content URLs

You can include subscriber personalization tags in the remote content URL. Subscriber values are URL-encoded automatically before the HTTP request is made:

```
%RemoteContent=https://example.com/api/recommendations?email=%Subscriber:EmailAddress%%
```

::: warning
Remote content URLs must be accessible from the Octeth server at send time. If the URL is unreachable or returns an error, the tag is replaced with an empty string.
:::

## HTML Encoding Behavior

Understanding when to use double braces versus triple braces is important for rendering your content correctly.

- **Double braces** <code v-pre>{{ Subscriber:Field }}</code> — HTML-encodes the output. Characters like `<`, `>`, `&`, and `"` are converted to `&lt;`, `&gt;`, `&amp;`, and `&quot;`. Use this in most situations to prevent unintended HTML rendering.

- **Triple braces** <code v-pre>{{{ Subscriber:Field }}}</code> — Outputs the raw value without any encoding. Use this when the field contains HTML that should be rendered, such as a custom HTML snippet stored in a subscriber field.

**Example:**

If a subscriber's `CompanyName` field contains `Smith & Co`:

| Syntax | Output |
|---|---|
| <code v-pre>{{ Subscriber:CompanyName }}</code> | `Smith &amp; Co` (HTML source) — renders as "Smith & Co" in the email |
| <code v-pre>{{{ Subscriber:CompanyName }}}</code> | `Smith & Co` (raw) — renders as "Smith & Co" in the email |

In most cases, double braces produce the correct result. Use triple braces only when you intentionally store HTML content in subscriber fields.

::: info
When a personalization tag appears inside a URL attribute (such as an `href`), the value is URL-encoded instead of HTML-encoded, ensuring the link functions correctly.
:::

## Journey Event Data Tags

When sending emails through [Journeys](./journeys), you can access event data that triggered the journey or was passed along the journey flow. Event data tags use the `Event` namespace:

| Tag | Description |
|---|---|
| <code v-pre>{{ Event:name }}</code> | The name of the event that triggered the journey. |
| <code v-pre>{{ Event:Property:propertyName }}</code> | A specific property from the event data. |
| <code v-pre>{{ Event:Property:nested:key }}</code> | A nested property accessed using colon-separated keys. |

**Example — a purchase confirmation journey email:**

```
Thank you for purchasing {{ Event:Property:productName }}!

Order total: {{ Event:Property:orderTotal }}
Order ID: {{ Event:Property:orderId }}
```

::: info
Event data tags are only available in journey email templates. They are not available in regular campaigns or autoresponders.
:::

## Tips and Best Practices

::: tip Always Use Fallback Values
Provide fallback values for any subscriber field that might be empty, especially in greetings and subject lines. <code v-pre>{{ Subscriber:FirstName|"there" }}</code> ensures every subscriber gets a complete, professional message.
:::

::: tip Preview Before Sending
Use the email preview feature to check how personalization tags render with sample subscriber data. This helps catch formatting issues, missing fallbacks, and broken conditional logic before the email reaches your subscribers.
:::

::: tip Keep Conditional Blocks Simple
Avoid deeply nested conditional blocks. If you find yourself nesting three or more levels of conditions, consider splitting the content into separate campaigns targeted at different segments instead.
:::

::: tip Use Helper Functions for Consistent Formatting
If subscriber data is entered inconsistently (mixed case names, for example), use helpers like `capitalizeAll` to normalize the display: <code v-pre>{{ capitalizeAll Subscriber:FirstName }}</code> ensures "sarah", "SARAH", and "Sarah" all render as "Sarah".
:::

::: tip Set Merge Tag Aliases on Custom Fields
When creating [custom fields](./custom-fields), always set a merge tag alias. Writing <code v-pre>{{ Subscriber:FirstName }}</code> is clearer and less error-prone than <code v-pre>{{ Subscriber:CustomField12 }}</code>.
:::

::: tip Include Required Footer Links
Always include `%Link:Unsubscribe%` in your email templates. Most anti-spam regulations require a visible unsubscribe mechanism. Consider also adding `%Link:WebBrowser%` so subscribers can view the email in their browser if it does not render correctly in their email client.
:::

## Related Features

- **[Custom Fields](./custom-fields)** — Create subscriber data fields that can be used as personalization tags.
- **[Subscribers](./subscribers)** — Browse and manage the subscriber data that powers personalization.
- **[Segments](./segments)** — Create dynamic subscriber groups based on field values and engagement data.
- **[Email Campaigns](./email-campaigns)** — Send personalized campaigns to your subscriber lists and segments.
- **[Journeys](./journeys)** — Build automated email sequences with event-driven personalization.
- **[Auto Responders](./auto-responders)** — Set up automated personalized follow-up emails.
