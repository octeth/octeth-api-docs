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

::: tip You may not need to call identify at all
A visitor who arrived by clicking a tracked campaign link is identified automatically — see [Identification from an email click](#identification-from-an-email-click). Calling identify explicitly is for visitors who give you their address on the site, and always takes precedence over the automatic binding.
:::

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
| `email` | String | Yes | The visitor's email address, or a SHA256 hash of it. See [Identifying without sending the email address](#identifying-without-sending-the-email-address). |
| `properties` | Object | No | **Event** properties attached to the identify event. Used for analytics and journey trigger criteria. These are **not** written to the subscriber record. |
| `identifyProperties` | Object | No | **Subscriber** custom-field values written onto the matched or newly created subscriber. |

### Saving Custom Fields at Identify Time

The third argument writes values onto the subscriber themselves, rather than onto the event:

```javascript
octethTracker.eventI('newlead@example.com', {}, {
    'First-Name': 'Jane',
    'CustomField734': 'ORD-1001'
});
```

Each entry addresses one custom field on the list, by either:

1. the field's **merge tag alias** — e.g. `{'First-Name': 'Jane'}`; or
2. the field's column key **`CustomField<CustomFieldID>`** — e.g. `{'CustomField734': 'Jane'}`.

Both formats work identically whether the subscriber is being created for the first time or updated.

**Precedence.** If both formats are supplied for the same field in one call, the **merge tag alias wins** and the `CustomField<ID>` entry is ignored.

**Keys that match nothing** are not saved, and are recorded at DEBUG level in `data/logs/identify.log`. They are never applied to a different field.

**Unique-identifier fields.** If the list has a custom field flagged as a unique identifier and the event also carries an external id, that id is written into the unique-identifier field *after* the `identifyProperties` write — so if `identifyProperties` targets that same field, the external id wins. Use a different field for values you want to control yourself.

::: warning Fixed in v5.9.3
Before v5.9.3, the `CustomField<ID>` format silently stored an **empty value** when the subscriber was created for the first time (it worked correctly on update). If you previously worked around this by using merge tag aliases only, that workaround is still valid and needs no change.
:::

### Identifying Without Sending the Email Address

If your application must not transmit clear-text email addresses through the browser, you can identify the same subscriber with a **SHA256 hash of their email address** instead:

```javascript
octethTracker.eventI('7d4f0a...c9');   // 64-character hex SHA256
```

Octeth detects that the identifier is a hash — any 64-character hexadecimal string, which can never be a valid email address — looks the subscriber up by that hash, and then behaves exactly as if you had passed the clear-text address. Website-event activity is logged against the subscriber and Website Event journeys fire normally. The hash itself is never stored as an email address.

#### The normalization contract (read this first)

> **`hash = sha256( trim(email) )` — trim only. Case is preserved.**

- **Trim only.** Leading and trailing whitespace is removed. Nothing else.
- **No lowercasing.** `Jane.Doe@example.com` and `jane.doe@example.com` produce **different** hashes and will **not** match each other.
- **No `+alias` stripping, no dot removal.** `jane+news@example.com` is hashed exactly as written.

Your system must produce the hash with this exact rule, from exactly the casing Octeth holds for that subscriber. Any divergence produces **zero matches** — never a wrong match. This is by far the most common cause of "hash identification isn't working".

```php
// PHP
$hash = hash('sha256', trim($email));
```

```javascript
// JavaScript (browser, SubtleCrypto)
const bytes = new TextEncoder().encode(email.trim());
const digest = await crypto.subtle.digest('SHA-256', bytes);
const hash = [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
```

```bash
# Shell
printf '%s' "$EMAIL" | sha256sum
```

The hexadecimal digest may be upper- or lowercase; both are accepted.

#### Where the hash is stored

The hash lives in a **custom field marked as a unique identifier** on the subscriber list:

1. Create (or pick) a text custom field on the list, e.g. `EmailHash`.
2. Mark it as the list's unique identifier.
3. Populate it for every subscriber that should be resolvable, with `sha256(trim(email))`.

- **Per list.** The hash must be present in each list where you expect identification to work. A subscriber who exists in several lists needs the field populated in each of them.
- **Multiple unique-identifier fields.** If a list has more than one field marked as a unique identifier, the one with the **lowest Custom Field ID** is authoritative. This is the same field the `event.track` API matches its `ID` parameter against, so both paths always agree.
- **Indexing.** Custom-field columns are not indexed by default. On a large list, add an index to the chosen column before enabling hash identification, otherwise each identify event performs a full table scan.
- **No migration or schema change** is required to use this feature.

#### When the hash does not match

Nothing is created and nothing fires:

- No subscriber is created — a hash is **never** written into an email address field.
- No subscriber record is updated.
- No journey is triggered.
- The miss is recorded in `data/logs/identify.log` as `hash identify unmatched`, with the list ID and a short hash prefix. A steady stream of these lines almost always means a normalization mismatch — re-check the contract above.

#### Server-to-server parity

The same subscriber is resolved from the same hash through the `event.track` API. There the hash must travel in the **`ID`** parameter, not `Email` — the `Email` parameter is validated as a real email address and a hash would be rejected.

Passing a clear-text email address behaves exactly as before, including creating the subscriber when they do not yet exist. Hash handling only engages when the identifier is a 64-character hexadecimal string.

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

Event tracking supports revenue attribution through an attribution token on your campaign links. This links conversions back to the email that drove the visitor to your website.

**How it works:**

1. Octeth rewrites every tracked link in a campaign to carry an attribution token in a URL parameter (default: `pr`). You do not create this value — it is an encrypted token generated at send time that identifies the specific recipient, list and campaign.
2. When the visitor lands on your website, the tracker stores that token in a browser cookie.
3. The tracker attaches the stored token to **every** event it sends — page views, custom events and conversions alike.
4. Conversions carrying a valid token are attributed to the campaign that produced it.

The attribution cookie has a default lifetime of 30 days. If the visitor converts within that window, the conversion is attributed to the original campaign.

::: warning Do not hand-write the `pr` value
The token is produced by Octeth's link rewriter and is encrypted. A value you invent yourself (for example `?pr=campaign-123`) decrypts to nothing and is silently ignored — it attributes no revenue and identifies no one. Enable link tracking on the campaign and Octeth adds the parameter for you.
:::

### Identification From an Email Click

A visitor who clicks a tracked campaign link is **already identified**, before they do anything on your site and without any `octethTracker.eventI()` call.

The attribution token described above authoritatively encodes which subscriber the link was sent to. When the tracker sends its first event carrying that token, Octeth binds the browser to that subscriber. From that point on:

- Website-event activity is logged against the subscriber and appears on their profile.
- Website Event journeys (page view, custom event, conversion) fire for them.
- The binding **persists** — later events from the same browser still resolve to that subscriber even after the token cookie expires.

**A Website Event `identify` journey does not fire on this path.** The visitor never called identify, so triggering an identify journey on a mere link click would be surprising. Only the actual event's own trigger fires.

**Precedence: explicit identify > click-through binding > anonymous.** A click-through binding only fills an identity that is still empty, so it can never overwrite an email established by an `eventI()` call. In the other direction, a later explicit `eventI()` always wins and overrides a click-through binding.

Tokens are scoped to the account that generated them: a token belonging to another account is refused and creates no binding.

::: tip New in v5.9.3
Before v5.9.3 the token was attached only to conversion events, so revenue attribution worked from a click-through but website-event activity and journeys did not — those still required an explicit `eventI()`. The token is now attached to every event, so the binding happens on the landing page view. Revenue attribution behaviour is unchanged.
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
3. If you are passing a **SHA256 hash** rather than a clear-text address, no subscriber is ever created — a hash only ever matches an existing subscriber. See [Identifying without sending the email address](#identifying-without-sending-the-email-address).

### Custom Fields Not Saved at Identify

1. Confirm the values are in the **third** argument (`identifyProperties`), not the second. The second argument holds event properties and is never written to the subscriber record.
2. Check that each key matches a custom field on the list — either its merge tag alias or `CustomField<CustomFieldID>`. Keys matching no field are logged at DEBUG level in `data/logs/identify.log` and discarded.
3. If the field is the list's unique identifier and the event also carries an external id, the external id is written last and wins.

### Hash Identification Is Not Matching

Almost always a normalization mismatch. Octeth hashes `sha256(trim(email))` with **case preserved** — no lowercasing, no `+alias` stripping, no dot removal. Confirm your system uses exactly the same rule, from exactly the casing Octeth holds for that subscriber. Misses are logged in `data/logs/identify.log` as `hash identify unmatched`. A mismatch always produces zero matches, never a wrong match.

### Events Not Appearing on Subscriber Profile

1. Ensure the visitor has been identified. This happens either through an explicit identify event, or automatically when the visitor arrives by clicking a tracked link in one of your campaigns.
2. Allow a few moments for event processing. Events are queued and processed asynchronously, so there may be a short delay before they appear.

## Related Features

- **[Segments](./segments)** — Create dynamic subscriber groups using website event rules.
- **[Journeys](./journeys)** — Trigger automated workflows based on website events.
- **[Subscribers](./subscribers)** — View website event activity on individual subscriber profiles.
- **[Lists](./lists)** — Manage the subscriber lists that event tracking is configured for.
