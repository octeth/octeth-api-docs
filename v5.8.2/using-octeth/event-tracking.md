---
layout: doc
---

# Event Tracking

Event tracking captures visitor interactions on your website and links them to your email subscribers. By adding a small JavaScript snippet to your website, you can monitor page views, identify visitors by email address, track custom events, and measure conversions — all connected to your subscriber lists in Octeth.

This data powers behavioral segmentation, automated journey triggers, and subscriber-level activity history. You can see exactly what each subscriber does on your website and use that information to send targeted, relevant communications.

This article covers how to set up event tracking, the available event types, how to use tracked data in segments and journeys, and best practices for implementation.

## How Event Tracking Works

Event tracking follows a straightforward flow:

1. **Visitor arrives** — When a visitor loads a page on your website, the tracking script assigns them a unique identifier (UUID) stored in a browser cookie. This identifier persists across visits.

2. **Events are captured** — As the visitor browses your website, the tracker records page views automatically. You can also capture custom events and conversions by adding JavaScript calls to your pages.

3. **Visitor is identified** — When the visitor provides their email address (through a form submission, login, or purchase), you call the identify event. This links the UUID to the email address, associating all past and future events with that subscriber.

4. **Data flows into Octeth** — Tracked events are processed and stored. The subscriber's profile shows their website activity history. Segments can filter subscribers based on website behavior, and journeys can trigger automatically when specific events occur.

::: info
Event tracking is configured per subscriber list. Each list has its own tracker IDs and JavaScript snippet. If you want to track events for multiple lists, set up event tracking separately for each list.
:::

## Setting Up Event Tracking

To set up event tracking for a subscriber list:

1. Navigate to the subscriber list where you want to enable event tracking.
2. Click **Event Tracker** in the sidebar navigation.

[[SCREENSHOT: Event Tracker page showing the User Tracker ID field, List Tracker ID field, the JavaScript code block in the code editor, and the status indicator]]

The Event Tracker page displays the following:

| Field | Description |
|---|---|
| **User Tracker ID** | A unique identifier for your account. This is automatically generated and read-only. |
| **List Tracker ID** | A unique identifier for this subscriber list. This is automatically generated and read-only. |
| **Website Event Tracker Javascript** | The JavaScript code snippet to install on your website. |

### Installing the Tracking Code

1. Click inside the **Website Event Tracker Javascript** code editor to select all the code.
2. Copy the code to your clipboard.
3. Paste the code into your website's HTML, just before the closing `</head>` tag.

The tracking script loads asynchronously and does not block page rendering. Once installed, the tracker begins capturing page view events immediately.

::: tip
Install the tracking code on every page of your website where you want to capture visitor behavior. If the code is only on certain pages, events from other pages are not tracked.
:::

### Verifying the Installation

After installing the tracking code, the Event Tracker page displays a status indicator:

- **Waiting for the first event** — The tracker has not yet received any events. Visit your website to generate a page view, then click the refresh link on the page to check again.
- **An event has been received** — The tracker is working correctly and has received at least one event.

[[SCREENSHOT: Event Tracker page showing the green success banner indicating an event has been received]]

## Event Types

The tracking script provides four event methods, each designed for a specific type of interaction:

| Method | Purpose | When to Use |
|---|---|---|
| `octethTracker.eventP()` | Track page views | Automatically on every page load; manually for single-page applications |
| `octethTracker.eventI()` | Identify a visitor | When the visitor provides their email address |
| `octethTracker.eventT()` | Track a custom event | For any named interaction you want to monitor |
| `octethTracker.eventC()` | Track a conversion | For purchases, registrations, and other measurable outcomes |

All event methods accept optional properties as key-value pairs, allowing you to attach additional data to each event.

### Automatically Captured Properties

Every event automatically captures the following properties from the visitor's browser:

| Property | Description |
|---|---|
| Browser name and version | The visitor's web browser and its version number. |
| Operating system | The visitor's operating system. |
| Device type | Whether the visitor is using a desktop, tablet, or mobile device. |
| Screen dimensions | The visitor's screen width and height. |
| Viewport dimensions | The browser window's visible area width and height. |
| Current URL | The full URL of the page where the event occurred. |
| Page title | The title of the current page. |
| Referrer | The URL of the page that linked to the current page. |
| Referring domain | The domain name of the referring page. |
| Browser language | The visitor's browser language setting. |

These properties are collected automatically — you do not need to pass them manually.

## Page View Events

Page view events track which pages a visitor views on your website. A page view event is sent automatically when the tracking script loads on a page, so no additional code is needed for basic page tracking.

### Automatic Page View Tracking

Once the tracking code is installed, every page load triggers a page view event. The event captures the page URL, title, and all automatically collected properties.

### Manual Page View Tracking

For single-page applications or situations where you need to track a page view manually, call the `eventP` method:

```javascript
octethTracker.eventP();
```

You can optionally pass a custom URL and additional properties:

```javascript
octethTracker.eventP('/products/widget-pro', {
    category: 'Products',
    section: 'Widgets'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `url` | String | No | The URL to record. Defaults to the current page URL if omitted. |
| `properties` | Object | No | Additional key-value pairs to attach to the event. |

## Identify Events

Identify events link an anonymous visitor to an email address. Once a visitor is identified, all of their past events (tracked under the same UUID) and all future events become associated with that email address as a subscriber in your list.

### When to Use Identify

Call the identify event whenever a visitor provides their email address on your website. Common scenarios include:

- Contact form submissions
- User registration or account creation
- Login pages
- Newsletter sign-up forms
- Purchase or checkout flows

### Calling the Identify Event

```javascript
octethTracker.eventI('visitor@example.com');
```

You can also pass additional properties:

```javascript
octethTracker.eventI('visitor@example.com', {
    source: 'contact-form',
    page: '/contact'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `email` | String | Yes | The visitor's email address. |
| `properties` | Object | No | Additional key-value pairs to attach to the event. |

### What Happens After Identification

When an identify event is processed:

1. **Subscriber creation** — If the email address does not exist in the subscriber list, a new subscriber is created automatically.
2. **Event association** — All past events from the visitor's browsing session (tracked under the same UUID) are linked to the subscriber.
3. **Journey activation** — Any journeys configured with a website event identify trigger are evaluated and may enroll the subscriber.

::: warning
The identify event creates a subscriber record in the list associated with the tracker. Make sure your website's privacy policy and consent mechanisms account for this automatic subscription behavior.
:::

## Custom Events

Custom events let you track any named interaction on your website beyond page views. Use them to capture specific actions that are meaningful for your marketing and segmentation strategy.

### Tracking a Custom Event

```javascript
octethTracker.eventT('button_click', {
    buttonName: 'Get Started',
    page: '/pricing'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `event` | String | Yes | The name of the event. Choose a descriptive, consistent name. |
| `properties` | Object | No | Additional key-value pairs to attach to the event. |

### Example Use Cases

| Event Name | Description |
|---|---|
| `video_played` | Visitor started watching a video. |
| `file_downloaded` | Visitor downloaded a resource. |
| `pricing_viewed` | Visitor viewed the pricing page. |
| `demo_requested` | Visitor submitted a demo request form. |
| `add_to_cart` | Visitor added an item to their shopping cart. |

::: tip
Use consistent, descriptive event names across your website. Event names appear in the segment builder and journey trigger configuration, so names like `video_played` are easier to work with than generic names like `event1`.
:::

## Conversion Events

Conversion events track measurable outcomes such as purchases, registrations, or sign-ups. Unlike custom events, conversions include structured fields for a conversion identifier, name, and value, making them suitable for revenue tracking and attribution.

### Tracking a Conversion

```javascript
octethTracker.eventC('order-123', 'Product Purchase', 49.99, {
    product: 'Widget Pro',
    currency: 'USD'
});
```

**Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `conversionId` | String | Yes | A unique identifier for the conversion (such as an order number). |
| `conversionName` | String | Yes | A descriptive name for the conversion type. |
| `conversionValue` | Number | Yes | The monetary value of the conversion. |
| `properties` | Object | No | Additional key-value pairs to attach to the event. |

### Revenue Attribution

Event tracking supports revenue attribution through URL parameters. This links conversions back to the email campaigns or sources that drove the visitor to your website.

**How it works:**

1. When a visitor arrives on your website through a link containing a special URL parameter (default: `pr`), the tracker stores the parameter value in a browser cookie.
2. When a conversion event occurs, the stored value is automatically included in the conversion data.
3. This allows you to track which campaigns, emails, or traffic sources generated revenue.

The attribution cookie has a default lifetime of 30 days. If the visitor converts within that window, the conversion is attributed to the original source.

::: info
Revenue attribution works automatically once the tracking code is installed. Add the `pr` parameter to your campaign links to connect email campaigns to website conversions. For example: `https://yoursite.com/offer?pr=campaign-123`.
:::

## Using Event Data in Segments

Tracked website events are available as a rule type in the segment builder. This allows you to create subscriber segments based on website behavior.

To use website events in a segment:

1. Navigate to a subscriber list and click **Segments**.
2. Create a new segment or edit an existing one.
3. In the rule builder, add a rule and select the **Website Event** rule type.

[[SCREENSHOT: Segment rule builder showing a Website Event rule with an event selected, operator configured, and value field]]

### Available Operators

| Operator | Description |
|---|---|
| **Happened** | The event has occurred at least once. |
| **Did not happen** | The event has never occurred. |
| **Happened in the last X days** | The event occurred within the specified number of days. |
| **Did not happen in the last X days** | The event has not occurred within the specified number of days. |

### Filtering on Event Properties

For more precise segmentation, you can filter on specific event properties using advanced operators:

| Operator | Description |
|---|---|
| **Equals** / **Does not equal** | Exact match on a property value. |
| **Contains** / **Does not contain** | Partial match on a property value. |
| **Matches regex** / **Does not match regex** | Pattern-based matching on a property value. |
| **Greater than** / **Less than** | Numeric comparison on a property value. |
| **Is set** / **Is not set** | Whether the property has any value. |

Available properties for filtering include the event name, page title, current URL, email address, conversion value, and any custom properties you pass with your events.

::: tip
Combine website event rules with other rule types for powerful segments. For example, create a segment of subscribers who visited your pricing page (website event) but have not opened any email in the last 30 days (campaign event) to build a re-engagement campaign targeting interested but inactive subscribers.
:::

For full details on the segment builder, see [Segments](./segments).

## Using Event Data in Journeys

Website events can trigger automated journeys, enrolling subscribers into workflows based on their website behavior. Octeth supports four website event journey triggers:

| Trigger | Description |
|---|---|
| **Page View** | Triggers when a visitor views a page. You can optionally filter by URL. |
| **Identify** | Triggers when a visitor is identified with an email address. |
| **Custom Event** | Triggers when a specific custom event occurs. You can filter by event name. |
| **Conversion** | Triggers when a conversion event occurs. |

### Configuring a Website Event Trigger

To create a journey with a website event trigger:

1. Navigate to **Journeys** and create a new journey (or edit an existing one).
2. Click **Configure** on the trigger node.
3. Select one of the website event trigger types.
4. Configure the trigger parameters, such as the URL to match for page views or the event name for custom events.
5. Optionally add **trigger criteria** to filter on specific event properties (such as only triggering when a particular property value matches).

[[SCREENSHOT: Journey designer showing a website event trigger node configured with a custom event trigger type and property-based criteria]]

### Trigger Criteria

Website event triggers support property-based criteria, allowing you to narrow when the trigger fires. Each criterion specifies a property name, an operator, and a value. The journey only triggers when all criteria are met.

::: info
A subscriber must be identified (via an identify event) before they can be enrolled in a journey. Page view, custom event, and conversion triggers only apply to visitors whose email address is already known through a prior identify event.
:::

For full details on journey design and configuration, see [Journeys](./journeys).

## Viewing Subscriber Events

Once event tracking is active and visitors have been identified, you can view a subscriber's website activity history from their profile.

1. Navigate to a subscriber list and click **Subscribers**.
2. Click on a subscriber's email address to open their profile.
3. The subscriber's website events are displayed alongside their other activity data.

Each event entry shows the event type, the event name, the timestamp, and the associated properties.

[[SCREENSHOT: Subscriber profile page showing the website events section with a list of tracked events including page views, custom events, and conversions with timestamps]]

## Tracking via the API

In addition to the JavaScript tracker, you can send events through the Octeth API. This is useful for server-side event tracking where JavaScript is not available, such as backend purchase confirmations or system-generated events.

The API endpoint accepts events with the same types and properties as the JavaScript tracker: page views, identify, custom events, and conversions. Events sent through the API are processed identically — they appear in subscriber profiles, trigger journeys, and are available for segmentation.

::: info
API-based tracking uses a high rate limit (5,000 requests per 60 seconds) to support high-volume event ingestion. For details on the API endpoint parameters and authentication, see the API reference documentation.
:::

## Tips and Best Practices

::: tip Install on All Pages
Place the tracking code on every page of your website for comprehensive visitor behavior data. If the code is only on landing pages, you miss the full browsing journey.
:::

::: tip Identify Visitors Early
Call the identify event as soon as the visitor provides their email address. The earlier you identify a visitor, the more browsing history you associate with their subscriber profile.
:::

::: tip Use Descriptive Event Names
Choose clear, consistent names for custom events. Names like `pricing_page_viewed` or `whitepaper_downloaded` are immediately understandable when building segments or configuring journey triggers.
:::

::: tip Pass Meaningful Properties
Attach relevant properties to your events. For example, include product names on conversion events, video titles on play events, or form names on submission events. These properties become available for segment filtering and journey criteria.
:::

::: tip Test Before Relying on Data
After installing the tracking code, visit your website and perform the actions you want to track. Check the Event Tracker page for the success indicator, and verify events appear on subscriber profiles after identifying yourself with a test email address.
:::

::: tip One List Per Website Section
If your website serves different purposes (such as a blog and an e-commerce store), consider tracking events to different subscriber lists. This keeps event data organized and makes segmentation more focused.
:::

## Troubleshooting

### No Events Are Being Received

1. Verify the tracking code is installed correctly — check that it appears before the closing `</head>` tag in your page source.
2. Check for JavaScript errors in your browser's developer console that might prevent the tracker from loading.
3. Ensure there are no content security policies or ad blockers preventing the tracker script from loading or sending data.
4. Visit the **Event Tracker** page in Octeth and click the refresh link to check for received events.

### Subscriber Not Created After Identify

1. Confirm the identify event is being called with a valid email address — open your browser's developer console and check for the identify call in the network requests.
2. Verify the email address format is correct. Invalid email addresses are rejected during processing.

### Events Not Appearing on Subscriber Profile

1. Ensure the visitor has been identified with an identify event. Events are only linked to a subscriber profile after identification.
2. Allow a few moments for event processing. Events are queued and processed asynchronously, so there may be a short delay before they appear.

## Related Features

- **[Segments](./segments)** — Create dynamic subscriber groups using website event rules.
- **[Journeys](./journeys)** — Trigger automated workflows based on website events.
- **[Subscribers](./subscribers)** — View website event activity on individual subscriber profiles.
- **[Lists](./lists)** — Manage the subscriber lists that event tracking is configured for.
