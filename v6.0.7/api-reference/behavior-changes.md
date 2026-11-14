---
layout: doc
title: API Behavior Changes in v6.0.7
description: Deliberate API behavior changes in Octeth v6.0.7 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.7

This page lists every deliberate change in v6.0.7 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.7.
:::

## Tier 1: changes that can break an integration

None recorded yet.

## Tier 2: shape and value changes

### RSS feeds in emails

#### RSS blocks render without the RSS plug-in, gated by a user group permission

RSS blocks (`%RSS:<feed url>:<item count>%` to `%RSS:END%`) are now rendered by Octeth itself in every send path: campaigns, auto responders and transactional emails, test sends, the web browser view, `email.render` and the previews (octeth/oempro#3984). Before, they rendered only on installs with the RSS plug-in enabled, and on other installs the text went out as written. The output for a given feed is byte for byte what the plug-in produced, and the plug-in's 300 second feed cache is kept.

A new user group permission, `Email.RSSFeeds` ("Insert RSS feeds into emails"), controls it. The upgrade grants it to every existing user group. For a group without it, every RSS block is removed from the email when it is sent, tested or previewed. A `&` written as `&amp;` in a block's feed address, as HTML editors store it, is now decoded before the feed is fetched.

`personalization.gettags` accepts `RSS` in `Categories`, outside the default set, so a call without `Categories` returns the same response as before. `rss.feed.preview` and `rss.content.render` are new.

**Not affected:** content without RSS blocks, the email subject (RSS blocks are not rendered there, as before) and installs that already had the plug-in enabled, apart from the `&amp;` decoding.

**Who needs to act:** nobody, unless an install without the plug-in has existing content that contains RSS block text meant to be sent literally. To stop RSS rendering for a group, switch off "Insert RSS feeds into emails" in its user group settings.

#### RSS length tags count characters and keep HTML intact

`%RSS:TITLE:<n>%` and `%RSS:CONTENT:<n>%` now count characters instead of bytes, and `%RSS:CONTENT:<n>%` builds an HTML-aware excerpt. Before, both cut the raw value at `<n>` bytes, so a trimmed item could end inside an HTML tag or attribute (an unfinished `<a href="...` swallowed the rest of the block and sometimes the rest of the email), leave a bold or link element open into the template, split an entity such as `&#8217;`, or split a multi-byte character such as `Ç` or an emoji.

`%RSS:CONTENT:<n>%` now counts only visible text: tags, comments, `<style>` and `<script>` count nothing, and an entity counts as one character. The cut never falls inside a tag, attribute, entity or character. Links and formatting before the cut are kept, open inline elements (such as `<a>` and `<b>`) are closed, the `...` is added inside the last open block element, and every other open element is closed. Markup after the cut, such as an image, is dropped. Content whose visible text is `<n>` characters or fewer is now returned in full with no `...`, where before it was cut whenever its HTML was longer than `<n>` bytes.

`%RSS:TITLE:<n>%` keeps the same output for titles in plain ASCII. A title with accented or non-Latin characters is now cut at `<n>` characters instead of `<n>` bytes, so it keeps more text.

This applies to every send path, the previews and `rss.content.render`.

**Not affected:** `%RSS:TITLE%` and `%RSS:CONTENT%` without a length, and any value at or under its limit (returned byte for byte as before).

**Who needs to act:** nobody. A template that relied on the byte count to fit a fixed width may now show more text for non-ASCII titles and HTML content (octeth/oempro#4116).

### SMS campaigns

#### `SendRatePerMinute` is spread evenly across the minute

A campaign's `SendRatePerMinute` now releases one message every 60 / rate seconds instead of the whole minute's quota in the first second (octeth/oempro#4089). At 6 a minute that is one message about every 10 seconds. Campaigns sending at the same time are offset from each other, so their messages fall in different seconds. Before v6.0.7 every campaign sent its full quota at the top of each minute, which carriers and gateways read as a per-second flood.

A campaign that starts, resumes from a pause or leaves quiet hours sends its first message at its next slot, at most 60 / rate seconds later, rather than at once.

**Not affected:** the number of messages sent per minute, campaigns with `SendRatePerMinute` 0 (no campaign limit), quiet hours, pausing, account rate limits and gateway limits.

**Who needs to act:** nobody. A rate of 60 or more a minute still sends every second, spread at rate / 60 messages per second.

#### Keitaro clicks count as SMS clicks

A click Keitaro reports on a <code v-pre>{{SMS:TrackingCode}}</code> passthrough link is now also recorded as an ordinary `clicked` SMS event, with `attributes.provider` set to `keitaro` (octeth/oempro#4079). Every click figure counts it: the campaign's `TotalClicks` and `TotalUniqueClicks`, the recipient's `FirstClickedAt` and `ClickCount`, the contact's SMS click total behind the segment rule "SMS activity, Clicked", `smscampaign.linkclicks.get`, and the `clicked` series and rows of the stats, breakdown, timeseries and event endpoints. Before v6.0.7 a Keitaro click was recorded only as `integration_click`, so all of these stayed at zero for a passthrough-only campaign. The upgrade records the missing `clicked` event once for every Keitaro click stored before it, except on campaigns whose event history retention has already partly removed.

A contact who clicks a short link and a Keitaro link is two clicks and one unique clicker. Bot clicks Keitaro flags stay out of the counts, as Octeth's own bot clicks do.

**Not affected:** `integration_click` events and the `includeintegrations` output, the Keitaro figures in `smscampaign.stats` (`Integrations`), and saved segments that use the `integration clicked` operator, which still match the same contacts. The new interface no longer offers that operator for a new rule, because "Clicked" now covers Keitaro clicks.

**Who needs to act:** an integration that adds `integration_click` counts to `clicked` counts itself. After upgrading that sum counts every Keitaro click twice, so read `clicked` alone.

### Email gateway

#### `process_pmta_log_file` accepts batch array bodies under `enforce`

From v6.0.2 the scalar parameter check refused every PowerMTA accounting batch posted to `process_pmta_log_file` as a top-level JSON array, with HTTP 400 and `ErrorCode` 100017 for parameter `0`, so delivered, bounce and complaint events stopped arriving (octeth/oempro#4075). v6.0.7 accepts all-digit keys holding objects for this command only.

**Not affected:** named parameters such as `AdminAPIKey` are still refused when sent as an array, every other command still refuses an array under key `0`, and posts to `/system/bounce_webhook`.

**Who needs to act:** installs that set `API_SCALAR_PARAMETER_CHECK=log` only to keep PowerMTA accounting flowing can set it back to `enforce` after upgrading.

### Plug-ins

#### User group plug-in permissions apply to API calls

A user's API calls, including every action taken in the new user interface, now run only the plug-ins the user's group includes: `Plugin.<code>` or `*` in the group's permissions, the rule the legacy user area has always applied (octeth/oempro#4061). Before v6.0.7, `api.php` loaded every enabled plug-in before it knew the caller, so each plug-in's hooks ran for every user's API activity whatever their group allowed. A plug-in API command registered for user authentication is now refused with error 99999 ("Not enough privileges") when the user's group does not include its plug-in.

**Not affected:** calls served by an admin session or admin API key (including admin calls that name a `UserID`), calls with no user (public commands, webhooks), system plug-ins, background workers, and the bundled plug-in commands, which are admin-only.

**Who needs to act:** an operator whose plug-in seems to stop working for some accounts after upgrading. Add `Plugin.<code>` to the user groups that should have it.

## Upgrade checklist

- If you set `API_SCALAR_PARAMETER_CHECK=log` only to keep PowerMTA accounting flowing, set it back to `enforce` after upgrading to v6.0.7.
- If your integration adds `integration_click` events to `clicked` events, read `clicked` alone after upgrading to v6.0.7, because it now includes Keitaro clicks.
- If a plug-in should act for every account, check that each user group's permissions include it (`Plugin.<code>`), because v6.0.7 applies user group plug-in permissions to API calls.

---

Previous releases: [v6.0.6](/v6.0.6/api-reference/behavior-changes), [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
