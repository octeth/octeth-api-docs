---
layout: doc
---

# Google Analytics Integration

Octeth integrates with Google Analytics by adding UTM tracking parameters to the links in your email campaigns. When a subscriber clicks a link in your email, these parameters tell Google Analytics where the visitor came from — specifically, that they arrived from your email campaign. This allows you to measure how much website traffic, engagement, and conversions your email campaigns generate.

This article covers what UTM parameters are, how to configure default tracking values, and how to enable Google Analytics tracking on your email campaigns.

## What Are UTM Parameters?

UTM (Urchin Tracking Module) parameters are tags added to the end of a URL. When someone clicks a tagged link, Google Analytics reads these tags and records the visit with the associated campaign information.

For example, a regular link looks like this:

```
https://www.example.com/pricing
```

With UTM parameters added, the same link looks like this:

```
https://www.example.com/pricing?utm_source=Octeth&utm_medium=Email&utm_campaign=Summer+Sale
```

The visitor reaches the same page, but Google Analytics now knows this visit came from an email campaign called "Summer Sale" sent through Octeth.

### The Five UTM Parameters

There are five UTM parameters. Each one describes a different aspect of the traffic source:

| Parameter | Purpose | Example Value |
|---|---|---|
| `utm_source` | Identifies **where** the traffic comes from. This is the name of the platform or tool sending the traffic. | `Octeth` |
| `utm_medium` | Identifies the **marketing channel** or type of traffic. | `Email` |
| `utm_campaign` | Identifies the **specific campaign** that generated the click. | `Summer Sale 2026` |
| `utm_content` | Differentiates between **multiple links** in the same campaign. Useful when your email has more than one call-to-action. | `header-button` |
| `utm_term` | Identifies a **keyword or term** associated with the link. In email marketing, this is typically the link text or title. | `Learn More` |

The first three parameters — `utm_source`, `utm_medium`, and `utm_campaign` — are the most important. Together, they tell you which platform sent the traffic, through which channel, and for which campaign.

::: tip
Consistent naming is key. If one campaign uses `utm_source=Octeth` and another uses `utm_source=octeth`, Google Analytics treats them as two different sources. Decide on a naming convention and stick with it across all campaigns.
:::

## Configuring Default UTM Values

Before enabling Google Analytics tracking on individual campaigns, configure the default values for `utm_source` and `utm_medium`. These defaults apply to every campaign that has Google Analytics tracking enabled.

This is an administrator-level setting.

1. Log in as an administrator.
2. Navigate to **Settings** in the top menu.
3. Click the **Integrations** tab.
4. Select the **Google Analytics** section.

[[SCREENSHOT: The Admin Settings Integrations page showing the Google Analytics tab with Source Keyword and Medium Keyword fields]]

You will see two fields:

| Field | Description | Default Value |
|---|---|---|
| **Source Keyword** | The value used for the `utm_source` parameter. This identifies Octeth as the traffic source in your Google Analytics reports. | `Octeth` |
| **Medium Keyword** | The value used for the `utm_medium` parameter. This identifies email as the marketing channel. | `Email` |

5. Enter or update the **Source Keyword** value. For example, keep the default `Octeth` or change it to match your organization's naming convention (such as your company name).
6. Enter or update the **Medium Keyword** value. The standard practice is to use `Email` for email campaigns.
7. Click **Save** to apply your changes.

::: info
These values are applied globally. Every campaign with Google Analytics tracking enabled uses the same source and medium values. If you need different source or medium values for specific emails, use the email-level UTM tracking available through the API.
:::

## Enabling Google Analytics on a Campaign

Once the default UTM values are configured, you can enable Google Analytics tracking on individual email campaigns. When enabled, Octeth automatically appends UTM parameters to every tracked link in the campaign's email content.

### When Creating a New Campaign

1. Navigate to **Campaigns** and click **Create New Campaign**.
2. Fill in the campaign details (name, subscriber list, email content).
3. In the campaign settings area, check the **Enable Google Analytics integration** checkbox.

[[SCREENSHOT: The campaign creation form showing the Enable Google Analytics integration checkbox and the Domains textarea field]]

4. A **Domains** field appears below the checkbox. Enter the domains you want to track — one domain per line.

   For example:
   ```
   example.com
   shop.example.com
   ```

   Only links pointing to these domains will have UTM parameters added. Links to other domains (such as social media sites or external resources) remain unchanged.

   ::: tip
   Enter `*` (an asterisk) in the Domains field to add UTM parameters to links pointing to any domain.
   :::

5. Complete the rest of the campaign setup and save or send your campaign.

### When Editing an Existing Campaign

1. Navigate to **Campaigns** and click on the campaign you want to edit.
2. Click **Edit** to open the campaign settings.
3. Check or uncheck the **Enable Google Analytics integration** checkbox.
4. Update the **Domains** field if needed.
5. Click **Save** to apply your changes.

## How Campaign-Level Tracking Works

When Google Analytics tracking is enabled on a campaign and a subscriber clicks a tracked link, Octeth generates UTM parameters automatically based on the campaign and subscriber information:

| UTM Parameter | Value | Source |
|---|---|---|
| `utm_source` | The **Source Keyword** from admin settings | Admin > Settings > Integrations > Google Analytics |
| `utm_medium` | The **Medium Keyword** from admin settings | Admin > Settings > Integrations > Google Analytics |
| `utm_campaign` | The **campaign name** | The name you gave the campaign |
| `utm_content` | `Subscriber#` followed by the subscriber's ID number | Automatically generated (e.g., `Subscriber#1042`) |
| `utm_term` | The **link title** or text | Extracted from the link in the email content |

For example, if your campaign is named "March Newsletter" and a subscriber with ID 1042 clicks a link titled "Read More" pointing to `https://example.com/blog`, the final URL becomes:

```
https://example.com/blog?utm_source=Octeth&utm_medium=Email&utm_term=Read+More&utm_content=Subscriber%231042&utm_campaign=March+Newsletter
```

::: warning
Google Analytics tracking only works when **link tracking** is also enabled on the email. Link tracking is what allows Octeth to intercept the click and append UTM parameters before redirecting the subscriber. If link tracking is disabled, UTM parameters cannot be added.
:::

### Domain Matching

Octeth checks each link in the email against the domains you entered in the campaign settings. Only links whose domain matches one of the listed domains receive UTM parameters.

- If the link points to `https://example.com/page` and `example.com` is in the list, UTM parameters are added.
- If the link points to `https://other-site.com/page` and `other-site.com` is not in the list, UTM parameters are not added.
- If you entered `*` as the domain, UTM parameters are added to all links regardless of domain.

This prevents UTM parameters from being appended to links where they are not needed, such as links to social media profiles or unsubscribe pages hosted on third-party platforms.

## Email-Level UTM Tracking via API

For more granular control, Octeth also supports configuring UTM parameters at the individual email level through the API. This allows you to set custom values for all five UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) on a per-email basis, and even use merge tags for dynamic values.

Email-level UTM tracking is configured through the `Email.Update` API endpoint. For details on the available parameters and usage, refer to the [API Reference](/v5.8.1/api-reference/emails).

::: info
When both campaign-level and email-level UTM tracking are configured, Octeth avoids duplicating parameters. If campaign-level tracking has already added UTM parameters to a link, email-level tracking does not overwrite them.
:::

## Tips and Best Practices

::: tip Use Consistent Naming Conventions
Establish a naming convention for your campaigns and stick with it. For example, use the format `YYYY-MM - Campaign Name` (such as `2026-03 - March Newsletter`). Consistent naming makes it much easier to filter and compare campaigns in Google Analytics.
:::

::: tip Track Only Your Own Domains
Rather than using `*` to track all domains, list only the domains you own and have Google Analytics installed on. Adding UTM parameters to third-party URLs serves no purpose since you cannot see those visits in your own analytics account.
:::

::: tip Enable Link Tracking on Your Emails
UTM parameters are appended during the link tracking redirect. Make sure link tracking is enabled when composing your email content in the email builder. Without link tracking, Octeth cannot modify the URLs when subscribers click them.
:::

::: tip Test Before Sending
Send a test email to yourself before launching the campaign. Click the links and check the URL in your browser's address bar to verify that UTM parameters appear correctly. You can also check Google Analytics in real time to confirm the visit is being attributed to the correct source and campaign.
:::

## Troubleshooting

### UTM Parameters Are Not Appearing on Links

1. **Verify Google Analytics is enabled on the campaign.** Open the campaign settings and confirm the **Enable Google Analytics integration** checkbox is checked.
2. **Check the Domains field.** Make sure the domain of your link is listed in the Domains field, or that `*` is entered to track all domains.
3. **Confirm link tracking is enabled.** Open the email in the email builder and verify that link tracking is turned on. UTM parameters require link tracking to function.
4. **Check the admin settings.** Navigate to **Admin** > **Settings** > **Integrations** > **Google Analytics** and verify that the Source Keyword and Medium Keyword fields are not empty.

### Google Analytics Is Not Showing Email Campaign Traffic

1. **Verify Google Analytics is installed on your website.** The UTM parameters only work if Google Analytics is active on the destination pages.
2. **Check for UTM parameter conflicts.** If your links already contain `utm_` parameters before Octeth processes them, Octeth does not overwrite the existing values. Remove any pre-existing UTM parameters from your email links if you want Octeth to generate them.
3. **Allow time for data processing.** Google Analytics may take several hours to fully process incoming data. Check the Real-Time reports first to confirm data is arriving.

### Duplicate UTM Parameters on Links

If you see duplicate UTM parameters in your URLs, this may happen when both campaign-level and email-level UTM tracking are active. Octeth checks for existing parameters and avoids adding duplicates, but if UTM parameters were manually included in the original link URL, they may appear alongside the auto-generated ones. Remove manually added UTM parameters from your email content to let Octeth manage them consistently.
