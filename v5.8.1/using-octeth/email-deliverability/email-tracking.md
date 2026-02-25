---
layout: doc
---

# Email Tracking

Email tracking lets you measure how recipients interact with your emails after delivery. Octeth tracks three core engagement metrics — email opens, link clicks, and conversions — giving you detailed insight into campaign performance and subscriber behavior. This data drives campaign reporting, powers segment rules, triggers automated journeys, and connects email activity to revenue on your website.

This article covers how open tracking, link click tracking, revenue and conversion tracking, and website event tracking work together to provide a complete picture of email engagement.

## How Email Tracking Works

Octeth uses two standard tracking techniques — a tracking pixel for opens and URL rewriting for clicks — combined with a JavaScript event tracker for website behavior and conversions. Here is how each method works at a high level:

1. **Open tracking** — When you send an HTML email, Octeth inserts a tiny invisible image (a 1x1 pixel) at the bottom of the email body. When the recipient opens the email and their email client loads images, the pixel is requested from the Octeth server. This request is recorded as an email open.

2. **Link click tracking** — Before sending, Octeth rewrites all links in the email body to point through the Octeth tracking server. When a recipient clicks a link, the request passes through Octeth first (recording the click), and the recipient is immediately redirected to the original destination URL.

3. **Conversion and revenue tracking** — When a recipient clicks a tracked link and visits your website, Octeth stores attribution data in a browser cookie. If the visitor later completes a purchase or other conversion (tracked by the JavaScript event tracker), the conversion is attributed back to the email campaign that drove the click.

4. **Website event tracking** — A JavaScript tracker installed on your website captures page views, visitor identification, custom events, and conversions. When a visitor is identified by email address, their website activity is linked to their subscriber profile in Octeth.

[[SCREENSHOT: Campaign report page showing open rate, click rate, and conversion metrics in a summary dashboard]]

::: info
Open tracking only works with HTML emails. Plain text emails do not support tracking pixels because they cannot load images. Link click tracking works in both HTML and plain text emails.
:::

## Open Tracking

Open tracking tells you which subscribers opened your email and how many times they opened it. Octeth distinguishes between **unique opens** (the number of individual subscribers who opened the email) and **total opens** (the total number of times the email was opened, including repeat opens by the same subscriber).

### How the Tracking Pixel Works

When Octeth prepares an email for delivery, it inserts a transparent 1x1 pixel image just before the closing `</body>` tag of the HTML content. The pixel's `src` attribute points to a unique tracking URL on the Octeth server that contains encrypted information identifying the campaign, email, subscriber, and list.

The pixel is styled to be completely invisible to the recipient:
- Width and height of 1 pixel
- No border or margin
- Transparent background

When the recipient opens the email in their email client (Gmail, Outlook, Apple Mail, etc.), the client loads the pixel image from the Octeth server. This image request is recorded and queued for processing. The server responds with a transparent image and the recipient sees nothing.

### What Happens When an Open Is Recorded

Each open event is processed asynchronously through a message queue. During processing, Octeth:

1. Checks whether this subscriber has opened this campaign before.
2. If it is the first open, increments the campaign's **Unique Opens** counter.
3. Increments the campaign's **Total Opens** counter regardless.
4. Records the open in the statistics database with the subscriber's IP address and timestamp.
5. Updates the subscriber's **Last Email Opened At** activity timestamp.
6. Logs the open in the subscriber's activity history.
7. Triggers any auto-responders configured to fire on first email open.
8. Evaluates any active journeys with email open triggers.

### Unique Opens vs. Total Opens

| Metric | What It Counts |
|---|---|
| **Unique Opens** | The number of individual subscribers who opened the email at least once. Each subscriber counts only once, regardless of how many times they reopen the email. |
| **Total Opens** | The total number of times the email was opened across all subscribers, including repeat opens. If one subscriber opens the email three times, it counts as three total opens. |

The **open rate** shown in campaign reports is calculated as: Unique Opens / Total Delivered Emails.

::: warning
Open tracking relies on the recipient's email client loading images. Many email clients block images by default or use privacy features that prevent tracking pixels from loading (such as Apple Mail Privacy Protection). This means open rates undercount actual opens. Use open data as a directional indicator rather than an exact measurement.
:::

### Enabling and Disabling Open Tracking

Open tracking is **enabled by default** for all emails. You can disable it per email through the sender domain settings:

1. Navigate to **Settings** > **Sender Domains**.
2. Click the sender domain to edit it.
3. In the **Tracking Options** section, uncheck **Track email open activities**.
4. Save the sender domain.

When open tracking is disabled, the tracking pixel is not inserted into emails sent through that sender domain.

[[SCREENSHOT: Sender domain edit page showing the Tracking Options section with the "Track email open activities" checkbox]]

### Open Tracking Domains

The tracking pixel URL uses the **Open Tracking Domain** configured on the delivery server. This domain must have DNS records pointing to your Octeth server for the pixel to load correctly.

To configure the open tracking domain:

1. Log in as an administrator.
2. Navigate to **Settings** > **Delivery Servers**.
3. Edit the delivery server.
4. Go to the **Domains** tab.
5. Set the **Open Tracking Domain** field (e.g., `track.example.com`).
6. Save the delivery server.

::: tip
Use a subdomain like `track.example.com` for tracking domains. Keep it separate from your link tracking domain if possible, so that email clients do not associate your marketing tracking with your click tracking domain.
:::

## Link Click Tracking

Link click tracking tells you which links subscribers clicked in your email, how many times each link was clicked, and which subscribers clicked them. Like open tracking, Octeth records both **unique clicks** and **total clicks** per campaign and per individual link.

### How Link Rewriting Works

When Octeth prepares an email for delivery, it scans the HTML content for all `<a>` tags and `<area>` tags. For each link found, the system:

1. Extracts the original destination URL from the `href` attribute.
2. Encodes the URL and generates encrypted tracking parameters containing the campaign ID, email ID, subscriber ID, and list ID.
3. Generates a security hash to prevent URL tampering.
4. Replaces the original `href` with a tracking URL that points through the Octeth server.

The resulting tracking URL follows this format:

```
https://{tracking-domain}/lt/?p={encrypted-parameters}
```

When the recipient hovers over a link in their email client, they see the tracking domain rather than the original destination URL.

### What Happens When a Link Is Clicked

When a subscriber clicks a tracked link in an email:

1. The request arrives at the Octeth tracking server.
2. The server decrypts the tracking parameters to identify the campaign, email, subscriber, and list.
3. The server validates the security hash to prevent tampering.
4. The click event (including IP address, user agent, and timestamp) is published to a message queue for asynchronous processing.
5. The subscriber is immediately redirected to the original destination URL with no noticeable delay.

During asynchronous processing, Octeth:

1. Checks whether this subscriber has clicked any link in this campaign before.
2. If it is the first click, increments the campaign's **Unique Clicks** counter.
3. Increments the campaign's **Total Clicks** counter.
4. Records the specific link URL, link title, subscriber, and timestamp in the click statistics.
5. Updates the subscriber's **Last Link Clicked At** activity timestamp.
6. Logs the click in the subscriber's activity history.
7. If no open was previously recorded for this subscriber, records an email open as well (since a click implies the email was opened).
8. Triggers any auto-responders configured to fire on first click of a specific link.
9. Evaluates any active journeys with email link click triggers.

### Unique Clicks vs. Total Clicks

| Metric | What It Counts |
|---|---|
| **Unique Clicks** | The number of individual subscribers who clicked at least one link in the email. Each subscriber counts only once. |
| **Total Clicks** | The total number of link clicks across all subscribers and all links, including repeat clicks. |

The **click rate** shown in campaign reports is calculated as: Unique Clicks / Total Delivered Emails.

### Excluding Links from Tracking

There are situations where you may want to prevent a specific link from being tracked. To exclude a link from click tracking, add `class="no-link-track"` to the `<a>` tag in your email HTML:

```html
<a href="https://example.com/privacy" class="no-link-track">Privacy Policy</a>
```

Links with this class are left unchanged during email preparation and point directly to the original URL without passing through the tracking server.

The following link types are automatically excluded from tracking:

| Link Type | Example |
|---|---|
| Anchor links | `#section-name` |
| Email links | `mailto:user@example.com` |
| System links | Unsubscribe, forward-to-friend, and web browser version links inserted by personalization tags |

::: tip
Consider excluding links to your privacy policy, terms of service, or legal pages from tracking. This keeps your click statistics focused on content engagement rather than compliance-related interactions.
:::

### Enabling and Disabling Link Tracking

Link tracking is **enabled by default** for all emails. You can disable it per email through the sender domain settings:

1. Navigate to **Settings** > **Sender Domains**.
2. Click the sender domain to edit it.
3. In the **Tracking Options** section, uncheck **Track link click activities inside emails**.
4. Save the sender domain.

When link tracking is disabled, links in emails sent through that sender domain are not rewritten and point directly to their original destinations.

[[SCREENSHOT: Sender domain edit page showing the Tracking Options section with the "Track link click activities inside emails" checkbox]]

### Link Tracking Domains

Tracked links use the **Link Tracking Domain** configured on the delivery server. This domain must have DNS records pointing to your Octeth server for click redirects to work.

To configure the link tracking domain:

1. Log in as an administrator.
2. Navigate to **Settings** > **Delivery Servers**.
3. Edit the delivery server.
4. Go to the **Domains** tab.
5. Set the **Link Tracking Domain** field (e.g., `click.example.com`).
6. Save the delivery server.

::: warning
If the link tracking domain DNS is not configured correctly, tracked links in your emails will not work. Recipients who click links will see an error page instead of being redirected to the destination. Always verify DNS records are in place before sending campaigns.
:::

### Link Tracking Security

Octeth includes built-in security to prevent link hijacking — an attack where someone modifies the tracking URL to redirect recipients to a malicious website. Each tracked link includes a cryptographic security hash that is validated before the redirect occurs. If the hash does not match, the redirect is blocked.

This protection is enabled by default and requires no configuration.

## Viewing Tracking Data

Tracking data appears in several places throughout the Octeth interface.

### Campaign Reports

After a campaign is sent, the campaign report page displays aggregate tracking metrics:

| Metric | Description |
|---|---|
| **Total Sent** | Number of emails successfully sent. |
| **Unique Opens** | Number of individual subscribers who opened the email. |
| **Total Opens** | Total number of times the email was opened. |
| **Open Rate** | Percentage of delivered emails that were opened (unique opens / delivered). |
| **Unique Clicks** | Number of individual subscribers who clicked at least one link. |
| **Total Clicks** | Total number of link clicks across all subscribers. |
| **Click Rate** | Percentage of delivered emails where a link was clicked (unique clicks / delivered). |

[[SCREENSHOT: Campaign report summary showing the key metrics table with opens, clicks, and rates]]

### Link Click Details

The campaign report includes a breakdown of clicks by individual link, showing which links received the most engagement:

| Column | Description |
|---|---|
| **Link URL** | The original destination URL of the tracked link. |
| **Link Title** | The link text that was displayed to the recipient. |
| **Unique Clicks** | Number of individual subscribers who clicked this specific link. |
| **Total Clicks** | Total number of clicks on this specific link, including repeats. |

[[SCREENSHOT: Campaign report link click breakdown table showing individual links with their click counts]]

### Subscriber Activity

Individual subscriber profiles show a chronological activity log that includes email opens and link clicks:

1. Navigate to a subscriber list and click **Subscribers**.
2. Click a subscriber's email address to open their profile.
3. The activity section shows open and click events with timestamps.

[[SCREENSHOT: Subscriber profile activity log showing email open and link click events with campaign names and timestamps]]

## Revenue and Conversion Tracking

Revenue tracking connects email campaign engagement to measurable business outcomes on your website. When a subscriber clicks a tracked link in your email and later makes a purchase or completes another conversion on your website, Octeth attributes that conversion back to the email campaign.

### How Revenue Attribution Works

Revenue attribution connects the email click to the website conversion through a browser cookie:

1. **Subscriber clicks a tracked link** — When a subscriber clicks a link in your email, they pass through the Octeth tracking server before reaching your website. The tracking URL includes an attribution parameter.

2. **Attribution cookie is set** — When the subscriber arrives on your website, the JavaScript event tracker detects the attribution parameter in the URL and stores it in a browser cookie. This cookie persists for **30 days** by default.

3. **Subscriber converts** — When the subscriber completes a purchase, registration, or other conversion on your website, your code fires a conversion event through the JavaScript tracker.

4. **Conversion is attributed** — The conversion event automatically includes the stored attribution cookie value. Octeth uses this value to link the conversion back to the specific campaign, email, subscriber, and list that generated the click.

This means that even if a subscriber clicks a link today but does not purchase until two weeks later, the conversion is still attributed to the original email campaign — as long as it falls within the 30-day attribution window.

[[SCREENSHOT: Diagram showing the attribution flow: Email click → Tracking server → Website with cookie → Conversion event → Attributed to campaign]]

### Setting Up Conversion Tracking

Conversion tracking requires two components working together:

1. **Event tracking JavaScript** installed on your website (see [Event Tracking](../event-tracking) for setup instructions).
2. **Conversion events** fired from your website code when a purchase or other conversion occurs.

Once event tracking is set up, add conversion tracking calls to your website at the point where conversions happen (e.g., the order confirmation page):

```javascript
octethTracker.eventC('order-456', 'Purchase', 89.99, {
    product: 'Annual Plan',
    currency: 'USD'
});
```

The conversion event parameters are:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `conversionId` | String | Yes | A unique identifier for the conversion (such as an order number). |
| `conversionName` | String | Yes | A descriptive name for the conversion type (e.g., "Purchase", "Trial Signup"). |
| `conversionValue` | Number | Yes | The monetary value of the conversion. |
| `properties` | Object | No | Additional key-value pairs for extra context. |

::: info
Revenue attribution works automatically once the event tracking JavaScript is installed and conversion events are implemented. No additional configuration is needed in the Octeth interface. The attribution parameter is included in tracked links by default.
:::

### Server-Side Conversion Tracking

For conversions that happen outside the browser (such as phone orders, offline purchases, or backend system events), Octeth provides a server-to-server (S2S) postback API. This allows your backend systems to report conversions directly to Octeth without relying on the JavaScript tracker.

The S2S postback uses an attribution identifier that is passed through the tracked link URL parameters. Your backend extracts this identifier when the subscriber arrives on your website and sends it back to Octeth when the conversion occurs.

::: tip
For details on the S2S postback API parameters and implementation, see the API reference documentation.
:::

### Attribution Window

The default attribution window is **30 days**. If a subscriber clicks a tracked link and converts within 30 days, the conversion is attributed to that campaign. Conversions that occur after the 30-day window are not attributed.

The attribution window is configured at the server level and applies to all campaigns. The cookie name used for attribution is `oempro_pr` and the URL parameter is `pr`.

## Website Event Tracking and Subscriber Attribution

Website event tracking goes beyond email-level metrics by capturing what subscribers do on your website after they click through from an email. This data enables behavioral segmentation, journey automation, and a complete view of each subscriber's engagement across email and web channels.

::: info
Website event tracking is covered in full detail in the [Event Tracking](../event-tracking) article, including installation, all four event types, segment integration, and journey triggers. This section provides a summary focused on how event tracking connects to email tracking.
:::

### How Subscriber Attribution Works

Subscriber attribution is the process of linking anonymous website visitors to known email subscribers. This connection enables Octeth to show you what a specific subscriber did on your website — not just that someone visited a page, but that *this subscriber* visited *this page*.

Attribution works through a combination of cookies and identification events:

1. **UUID assignment** — When a visitor first arrives on your website, the tracking script assigns a unique identifier (UUID) stored in a browser cookie called `octethUUID`. This UUID persists across visits and pages.

2. **Anonymous tracking** — As the visitor browses your website, all page views, custom events, and conversions are recorded and associated with the UUID. At this point, the visitor is anonymous — Octeth knows what the UUID did, but not who they are.

3. **Identification** — When the visitor provides their email address (through a form, login, or purchase), your code calls the identify event:

    ```javascript
    octethTracker.eventI('subscriber@example.com');
    ```

4. **Linking** — The identify event matches the email address to a subscriber in your list (or creates a new subscriber). All past events associated with the UUID are retroactively linked to the subscriber, and all future events under the same UUID are automatically attributed.

### Email Click to Website Activity Flow

When email tracking and website event tracking work together, you get a complete engagement timeline:

1. Subscriber receives your email campaign.
2. Subscriber opens the email (recorded by the tracking pixel).
3. Subscriber clicks a link (recorded by link tracking, redirected to your website).
4. The attribution cookie is set from the link tracking URL parameter.
5. The website event tracker records the page view and identifies the visitor by their UUID cookie.
6. If the subscriber was previously identified (from a prior visit or form submission), the page view is immediately attributed to the subscriber.
7. If the subscriber later completes a conversion, it is attributed to the original email campaign through the attribution cookie.

This creates a continuous thread from email delivery through website engagement to conversion — all visible on the subscriber's profile.

### Available Event Types

The JavaScript tracker provides four event methods:

| Method | Purpose |
|---|---|
| `octethTracker.eventP()` | Track page views (fired automatically on page load). |
| `octethTracker.eventI()` | Identify a visitor by email address. |
| `octethTracker.eventT()` | Track a named custom event. |
| `octethTracker.eventC()` | Track a conversion with a monetary value. |

Each event automatically captures browser metadata including the visitor's browser, operating system, device type, screen dimensions, current URL, page title, and referrer.

### Using Event Data for Email Targeting

Website event data integrates with two key features for targeted email delivery:

**Segments** — Create subscriber segments based on website behavior. For example, segment subscribers who viewed your pricing page but did not convert, or subscribers who downloaded a specific resource. Website event rules are available in the segment builder alongside email engagement rules.

**Journeys** — Trigger automated email workflows based on website events. For example, send a follow-up email when a subscriber views a product page, or start a nurture sequence when a subscriber is identified for the first time. Website event triggers support property-based criteria for precise targeting.

For full details on event tracking setup, event types, segment integration, and journey triggers, see the [Event Tracking](../event-tracking) article.

## System Links and Tracking

Octeth inserts several system links into emails through personalization tags. These links are tracked separately from regular content links and serve specific functions:

| Personalization Tag | Purpose |
|---|---|
| `%Link:Unsubscribe%` | Generates a one-click unsubscribe link for the subscriber. |
| `%Link:Forward%` | Generates a forward-to-friend link. |
| `%Link:WebBrowser%` | Generates a link to view the email in a web browser. |
| `%Link:SubscriberArea%` | Generates a link to the subscriber self-service area. |

System links pass through the tracking infrastructure for redirect purposes but are not included in your link click statistics. They serve functional roles rather than engagement measurement.

::: info
For details on how unsubscribe links work, including list-unsubscribe headers and one-click unsubscribe compliance, see the [Unsubscriptions](./unsubscriptions) article.
:::

## Tips and Best Practices

::: tip Use Tracking Subdomains
Configure dedicated subdomains for link tracking and open tracking (e.g., `click.example.com` and `track.example.com`). This separates tracking infrastructure from your main domain and improves deliverability by building a consistent tracking reputation.
:::

::: tip Monitor Click-to-Open Rate
The click-to-open rate (CTOR) — calculated as unique clicks divided by unique opens — is a more meaningful engagement metric than click rate alone. It tells you how compelling your email content was to subscribers who actually read it.
:::

::: tip Identify Visitors Early
Call the identify event as soon as a visitor provides their email address on your website. The earlier you identify a visitor, the more browsing history is linked to their subscriber profile, giving you richer data for segmentation and personalization.
:::

::: tip Exclude Non-Content Links from Tracking
Use `class="no-link-track"` on links that are not part of your email's core content, such as footer links, legal pages, or social media icons. This keeps your click statistics focused on the engagement metrics that matter.
:::

::: tip Set Up Conversion Tracking for Key Actions
Even if you do not run an e-commerce store, use conversion events to track important actions like trial sign-ups, demo requests, or contact form submissions. This connects your email campaigns to measurable business outcomes beyond opens and clicks.
:::

## Troubleshooting

### Open Rate Shows Zero or Very Low Numbers

1. **Check that open tracking is enabled** — Verify the sender domain has open tracking turned on in **Settings** > **Sender Domains** > **Tracking Options**.
2. **Verify the open tracking domain** — Ensure the delivery server's open tracking domain has correct DNS records pointing to the Octeth server. If the domain does not resolve, tracking pixels cannot load.
3. **Consider email client behavior** — Many email clients block images by default or use privacy proxies. Apple Mail Privacy Protection, for example, pre-fetches tracking pixels which can either inflate or obscure real open data. Low open rates may reflect client behavior rather than a configuration issue.

### Tracked Links Are Not Working

1. **Check the link tracking domain** — Ensure the delivery server's link tracking domain has correct DNS records. Navigate to **Settings** > **Delivery Servers**, edit the server, and verify the **Link Tracking Domain** field.
2. **Verify SSL certificates** — If your tracking domain uses HTTPS, confirm the SSL certificate is valid and not expired. An invalid certificate causes browsers to block the redirect.
3. **Test with a preview email** — Send a test email to yourself and click a tracked link. If the redirect fails, check the browser's address bar for the tracking URL format and verify the domain resolves.

### Conversions Are Not Being Attributed

1. **Verify the JavaScript tracker is installed** — Check that the event tracking code is present on all pages of your website, including the conversion confirmation page.
2. **Check conversion event calls** — Open your browser's developer console on the conversion page and verify that `octethTracker.eventC()` is being called with the correct parameters.
3. **Check the attribution cookie** — After clicking a tracked link from an email, verify the `oempro_pr` cookie is set in your browser. If the cookie is missing, the attribution parameter may not be present in the tracking URL.
4. **Check the attribution window** — Conversions must occur within 30 days of the email click. Conversions outside this window are not attributed.

### Subscriber Events Are Not Appearing on Profile

1. **Ensure the visitor is identified** — Website events are only linked to a subscriber profile after an identify event (`octethTracker.eventI()`) has been called with the visitor's email address.
2. **Allow processing time** — Events are processed asynchronously through a message queue. There may be a short delay before events appear on the subscriber profile.
3. **Check browser console for errors** — JavaScript errors on the page may prevent the tracking script from loading or sending events. Check the browser console for any error messages.

## Related Features

- **[Email Sending](./email-sending)** — Configure delivery servers, tracking domains, and sender domains that support email tracking.
- **[Event Tracking](../event-tracking)** — Detailed guide on JavaScript event tracking setup, event types, and using event data in segments and journeys.
- **[Email Campaigns](../email-campaigns)** — Creating and sending campaigns with tracking enabled.
- **[Segments](../segments)** — Build subscriber segments using open, click, and website event data.
- **[Journeys](../journeys)** — Trigger automated workflows based on email opens, link clicks, and website events.
- **[Bounce Processing](./bounce-processing)** — How bounced emails affect your delivery statistics alongside tracking data.
- **[Unsubscriptions](./unsubscriptions)** — How unsubscribe links work within the tracking infrastructure.
