---
layout: doc
title: API Behavior Changes in v6.0.8
description: Deliberate API behavior changes in Octeth v6.0.8 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.8

This page lists every deliberate change in v6.0.8 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.8.
:::

## Tier 1: changes that can break an integration

None recorded yet.

## Tier 2: shape and value changes

### SMS campaigns

#### SMS campaign reads say when an account rate limit is holding a campaign

`smscampaign.get` returns a new `RateLimitHold` key, and `smscampaign.browse` a new top-level `RateLimitHolds` key keyed by `SMSCampaignID` (octeth/oempro#3418). Each hold has `Interval`, `Limit` and `Reason`, and appears only for a `Sending` campaign that an account SMS rate limit is holding. `RateLimitHold` is `null` and `RateLimitHolds` is empty when nothing is held.

**Not affected:** every existing key and the campaign rows, which are unchanged.

**Who needs to act:** nobody. A client that rejects unknown keys must accept the new ones.

### Subscribers

#### `RulesJSON` accepts SMS activity rules

`subscribers.search`, `subscribers.delete`, `subscriber.tag`, `subscriber.untag`, `subscriber.unsubscribe` and `subscribers.journey.bulk` now accept a `RulesJSON` whose rules are `sms-events` (octeth/oempro#4157). Before v6.0.8 such a payload was refused as invalid RulesJSON (`ErrorCode` `6` on `subscribers.search`, `8` on `subscribers.journey.bulk`, `7` on the others), although the same rule worked in a saved segment. A bulk command sent with an SMS activity rule now acts on the contacts the rule matches.

**Who needs to act:** nobody, unless an integration relied on the refusal to skip SMS rules.

### Segments

#### `converted` and `not converted` SMS operators

`sms-events` rules accept `converted` and `not converted`, which match the same contacts as `integration converted` and `not integration converted` and take the same `status` key (octeth/oempro#4157). The older pair stays accepted. The new interface offers "Converted" and "Did not convert" for new rules and shows a saved rule that uses the older pair as "Converted (legacy rule)".

The two `sms-events` status error texts no longer name Keitaro: "The status filter is only available for conversion rules." and "The conversion status must be text of 1 to 64 characters." The error code is still `12`.

**Who needs to act:** an integration that compares `ErrorText` against the old "Keitaro conversion" messages.

### Journeys

#### ScheduledPull time windows follow daylight saving time in the account timezone

A ScheduledPull journey with **Time window restriction** on and no **Timezone** of its own evaluates its allowed days, start time and end time in the journey owner's account timezone (octeth/oempro#4136). Before v6.0.8 the worker read the account timezone label (for example `(GMT-05:00) Eastern Time (US & Canada)`) as a fixed UTC offset, so the window ignored daylight saving time, and a label whose offset is out of date was wrong all year. From v6.0.8 the label is resolved to its IANA zone (for example `America/New_York`) before the window is checked, so the window opens and closes at the same local time all year.

What moves on upgrade:

- Accounts in a zone with daylight saving time: during summer time the window now opens and closes one hour earlier in UTC than before. A 09:00 to 17:00 window for an Eastern Time account ran from 10:00 to 18:00 New York time between March and November, and now runs from 09:00 to 17:00 all year.
- Accounts on a label with a stale offset: the window moves by the label's error all year. `(GMT+02:00) Istanbul` now runs on `Europe/Istanbul`, which has been UTC+03:00 since 2016, so the window opens one hour earlier in UTC.
- `(GMT+02:00) Kyev` resolves to `Europe/Minsk`, which is UTC+03:00 all year. Its window is now right during Kyiv's summer time and one hour early in winter. Set the journey's **Timezone** to `Europe/Kyiv` to follow Kyiv time exactly.

**Not affected:** journeys that set their own **Timezone**, journeys with the time window off, accounts in a zone without daylight saving time whose label offset is correct, and the labels `(GMT-03:00) Greenland`, `(GMT) Edinburgh`, `(GMT+01:00) Bern` and `(GMT+06:30) Rangoon`, which keep their fixed offset.

Both journey builders now name the zone the window follows: the IANA zone (for example "Account timezone: America/New_York"), or the label for the four labels that keep their fixed offset.

**Who needs to act:** anyone whose ScheduledPull windows were set to compensate for the old fixed offset.

### Event tracking

#### `event.track` fails when the message queue does not confirm the event

`event.track` now waits for the message queue to confirm the event before it answers success (octeth/oempro#3846). If the queue refuses the event or does not confirm it within 2 seconds, the call answers the hard-failure envelope with `ErrorCode` `100005` and HTTP 500, the same answer an unreachable queue has always produced. Before v6.0.8 it answered success and the event could be lost.

**Not affected:** the success response, the validation errors, test events (`isTest`) and the browser tracker.

**Who needs to act:** an integration that treats every answered call as recorded. After an unconfirmed attempt the event may still have been recorded, so a retry can record it twice.

### Media library

#### Media files are streamed, cached and answered with 404 when missing

`image_viewer.php` and `public/file/view` serve every media library file themselves (octeth/oempro#4112). A file stored in S3 used to answer a 302 redirect to the bucket. Responses now carry `Cache-Control`, `ETag`, `X-Content-Type-Options: nosniff` and a sandboxing `Content-Security-Policy` (except PDF files). File types a browser could run, such as HTML, are sent as a download. A missing file answers HTTP 404 instead of 200 with the text "Media not found".

**Who needs to act:** an integration that relied on the redirect to the bucket, or on HTTP 200 for a missing file.

#### Media images in sent mail use the sender domain's tracking host

In sent mail, media library addresses on the application's own URL move to the sender domain's tracking host when the domain is Enabled and its DNS records list that host, and otherwise to the host open tracking uses (octeth/oempro#4112). The application URL stays when the tracking host's last TLS check failed. The stored email content does not change.

**Who needs to act:** anyone who matches media library addresses in delivered mail.

#### `media.upload`, `media.browse` and `media.retrieve` return more, and a failed store is an error

`media.upload` and `media.retrieve` return `MediaURL`. `media.browse` returns `MediaURL`, `Type` and `Size` for each file, and `Path` and `Rules` (octeth/oempro#4112). `media.upload` takes the optional `FolderID` and `EnforceMediaRules`. When the storage refuses a file, `media.upload` now answers `ErrorCode` `9` and keeps nothing. Before v6.0.8 it answered success and the file could not be opened.

**Not affected:** every existing key, and which files `media.upload` accepts without `EnforceMediaRules`.

**Who needs to act:** an integration that treats every `media.upload` answer as stored must handle `ErrorCode` `9`.

#### Objects in S3 are private

Files uploaded to S3 are written without the public-read ACL (octeth/oempro#4112). Files uploaded earlier keep working. `S3_URL` is now only the address earlier public files are read from when the bucket does not hold them, so it can be empty.

**Who needs to act:** an integration that builds bucket addresses itself. Use `MediaURL`.

### Delivery servers

#### A delivery server that cannot be connected to fails over

A delivery server that cannot be connected to 3 times in a row is marked down (octeth/oempro#3232). With a fallback server set, its Email Gateway and autoresponder email goes to the fallback until a probe finds it working again. `oempro_eg_queue` records the server that sent. Without a fallback, email is retried on the server as before. No server has a fallback until you choose one.

`deliveryserver.get` and `deliveryservers.get` return the new `FallbackDeliveryServerID`, and `admin.deliveryserver.references.get` returns the new `FallbackFor` list. `admin.deliveryserver.archive` refuses a server that another active server falls back to.

**Not affected:** campaign email, and every existing key of these responses.

**Who needs to act:** nobody. A client that rejects unknown keys must accept the new ones.

#### The delivery server of an autoresponder in the subscriber activity

The `delivery_server_id` of a transactional email delivery activity is the server of the channel that sent the email (octeth/oempro#3232). Before v6.0.8 it was always the Marketing channel's server.

**Who needs to act:** an integration that reads this value.

## Upgrade checklist

- If you store media in Amazon S3, check that the access key may read and delete objects, not only write them, and run **Test connection** in **Settings**, **Uploads and media**. Set the region there if the lookup cannot reach Amazon S3.
- If **Media library file** in **Settings**, **Uploads and media** is still 10,240 bytes, the old default, raise it. New installs start at 5 MB.
- If a custom plugin loads `aws_s3`, switch it to the AWS SDK in `vendor/`. The old class is removed.

- If you call `event.track` from a server, handle HTTP 500 with `ErrorCode` `100005`. The event was not confirmed, and a retry can record it twice.
- If you run ScheduledPull journeys with a time window and no journey **Timezone**, check that the new local-time window is the one you want. To pin a window to a specific zone, set the journey's **Timezone**.
- If your integration matches the `ErrorText` "The status filter is only available for Keitaro conversion rules." or "The Keitaro conversion status must be text of 1 to 64 characters.", match error code `12` or the new texts instead.

---

Previous releases: [v6.0.7](/v6.0.7/api-reference/behavior-changes), [v6.0.6](/v6.0.6/api-reference/behavior-changes), [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
