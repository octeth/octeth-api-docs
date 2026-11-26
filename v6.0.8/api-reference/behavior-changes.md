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

### Suppression

#### `*@domain` suppression rows suppress the whole domain

A suppression row whose `EmailAddress` is `*@example.com` now suppresses every address at exactly that domain, at the row's scope (octeth/oempro#3662). Before, `suppression.import` accepted and stored such a row, but it matched no address. Rows that already exist start suppressing after the upgrade, so sends to those domains drop.

Only rows with the source `Administrator` or `User` act this way. A `*@domain` row recorded by a bounce, a complaint or an unsubscribe keeps matching only that literal address. `@domain` rows added by an older CSV import with one of those two sources are rewritten to `*@domain` by the upgrade.

To list the rows that take effect, before or after the upgrade:

```sql
SELECT * FROM oempro_suppression_list
WHERE (EmailAddress LIKE '*@%' OR EmailAddress LIKE '@%')
  AND SuppressionSource IN ('Administrator', 'User');
```

#### `suppression.import` accepts domain entries

- `@example.com`, rejected before, is accepted and stored as `*@example.com`. The domain is lowercased.
- A domain entry is stored with the source `User`, or `Administrator` under admin auth, when the request names another source.
- `*@[192.0.2.1]` (an address literal), accepted before, is counted in `TotalFailed`.
- No other writer can add a `*@domain` row: a bounce, complaint or unsubscribe of such an address records no suppression.

**Not affected:** the default response fields of every suppression command. The new fields are returned only with `IncludeDomainEntries`.

### Account review

#### An Untrusted account cannot send SMS or auto responders

An account whose `ReputationLevel` is not `Trusted` could send SMS and auto responder mail although campaigns, journeys and the email gateway were held. It no longer can (octeth/oempro#3088).

- `sms.send`, `sms.testnumber.add`, `smscampaign.send`, `smscampaign.schedule`, `smscampaign.resume`, `smscampaign.test` and `autoresponder.sendtest` answer HTTP 403 with code `40` (`Account pending approval`). When the account's status cannot be read they answer HTTP 503 with code `41`, and nothing is sent.
- An SMS campaign that is already sending stops releasing messages and goes on when the account becomes `Trusted`. A journey Send SMS step waits like a journey email. A single SMS that was queued before the account was held fails with `Account pending approval`.
- Queued auto responder mail waits and goes out after the account becomes `Trusted`, within an hour.

**Not affected:** `Trusted` accounts, and the responses of every command listed above for them.

**Who needs to act:** an operator with accounts that are still `Untrusted` and send SMS or auto responders. Approve them before the upgrade, or tell them. To list the candidates:

```sql
SELECT UserID, EmailAddress FROM oempro_users
WHERE ReputationLevel <> 'Trusted' AND AccountStatus = 'Enabled';
```

### Journeys

#### Journey run criteria apply `excludeAutomated` and `includeAutomated`

Run criteria sent to `journey.create` or `journey.update` lost the `excludeAutomated` and `includeAutomated` rule keys, because the API lowercases every request key and the criteria engine reads them in camelCase (octeth/oempro#4208). Both keys are now kept, and journeys saved before the upgrade are evaluated with them too, so a live journey can start or skip different subscribers.

- A `campaign-events` or `journey-email-action` rule with `excludeAutomated: true` counts human opens only. Before, it counted every open.
- A `campaign-events` click rule with `includeAutomated: true` counts automated clicks too. Before, it left them out.
- A `journey-email-action` click rule with `includeAutomated: false` counts human clicks only. Before, it counted every click.
- `journey.get` returns the camelCase keys for a journey saved after the upgrade. A journey saved before keeps the lowercased keys in `journey.get` until it is saved again.

**Not affected:** run criteria without either key, decision criteria, and journeys saved in the Journey Builder.

**Who needs to act:** an integration that sets either key in `run_criteria`. To list the journeys that change:

```sql
SELECT JourneyID, RelUserID, JourneyName FROM oempro_journeys
WHERE TriggerParameters LIKE BINARY '%excludeautomated%'
   OR TriggerParameters LIKE BINARY '%includeautomated%';
```

### List sync

#### The legacy MySQL list sync is replaced by List Sync

The scheduled MySQL list sync that lists configured on the legacy **Synchronization** screen is replaced by [List Sync](./lists#list-sync), managed with the new `list.sync.*` commands and on the list's **Sync** tab in the new interface (octeth/oempro#4106). `cli/sync.php`, its cron line and the legacy Synchronization screen are removed.

After the upgrade, Octeth converts every list whose legacy `SyncStatus` is `Enabled` into a list sync, once, within a minute of the first scheduler run:

- The sync is named "Legacy MySQL sync", reads the legacy query (`SourceType` `query`), matches rows by email and keeps the legacy field mapping and period. Every Month becomes every 4 weeks. The first run is due one period after the last legacy sync.
- `RemovalBehavior` is `ignore`, as before: contacts whose rows leave the source stay on the list.
- `TriggerActions` is on, because the legacy sync started autoresponders.
- The password is stored encrypted in the new sync.
- The list's legacy `SyncStatus` is set to `Disabled`.
- A legacy query the new query check refuses (anything but a single read-only `SELECT`), or a mapping with no email column, gives a sync that is `Paused` with the reason in `LastError`.

What runs differently after the conversion:

- An unsubscribed contact is no longer resubscribed. Unsubscribed, hard bounced and suppressed contacts are skipped and never rewritten.
- A source host that is private, loopback or one of Octeth's own containers is refused unless the operator lists it in `LIST_SYNC_ALLOWED_HOSTS`. Such a sync fails, and after 5 failed runs in a row it is paused.
- The report email after each sync (`SyncSendReportEmail`) is no longer sent. The run history on the **Sync** tab and `list.sync.runs` replace it.

#### `list.update` accepts the `Sync` parameters but they have no effect

`list.update` still accepts `SyncStatus`, `SyncPeriod`, `SyncSendReportEmail`, `SyncMySQLHost`, `SyncMySQLPort`, `SyncMySQLUsername`, `SyncMySQLPassword`, `SyncMySQLDBName`, `SyncMySQLQuery` and `SyncFieldMapping`, with the same validation and the same response (octeth/oempro#4106). They now write only columns that nothing reads, so setting `SyncStatus` to `Enabled` starts no sync. `SyncMySQLPassword` is no longer stored at all. There is no flag that keeps the old behavior, because the legacy sync engine is removed.

**Who needs to act:** an integration that sets up a list sync through `list.update`. Move it to `list.sync.create`.

#### The `Cron.Sync` plugin hook no longer fires

`Cron.Sync` was fired by `cli/sync.php` every 10 minutes, and that script is removed (octeth/oempro#4106).

**Who needs to act:** a plugin that hooks `Cron.Sync`. Move the callback to `Cron.General`, which fires every 5 minutes, or ship a `cli/` script with its own crontab line.

## Tier 2: shape and value changes

### List sync

#### `list.get` and `list.clone` return a blank `SyncMySQLPassword`

`list.get` returned the legacy sync password in plain text in `SyncMySQLPassword`. After the upgrade that column is blanked on every list, so `list.get` and `list.clone` return it as an empty string (octeth/oempro#4106). Both responses keep their shape, and the other `Sync` fields are unchanged. The passwords of converted syncs are stored encrypted in the new sync and are never returned: `list.sync.get` returns `HasPassword` instead.

**Who needs to act:** nobody, unless an integration read the password from `list.get`.

#### The new `Lists.Sync` permission

The `list.sync.*` commands need the new user group permission `Lists.Sync` (**Sync lists from an external database**), which is off for every group by default (octeth/oempro#4106). The upgrade grants it to every group that had the legacy `List.ExternalMySQL` permission, so their users keep a working sync.

**Who needs to act:** an administrator who wants other groups to use List Sync. Enable the permission on those groups.

### SMS campaigns

#### SMS campaign reads say when an account rate limit is holding a campaign

`smscampaign.get` returns a new `RateLimitHold` key, and `smscampaign.browse` a new top-level `RateLimitHolds` key keyed by `SMSCampaignID` (octeth/oempro#3418). Each hold has `Interval`, `Limit` and `Reason`, and appears only for a `Sending` campaign that an account SMS rate limit is holding. `RateLimitHold` is `null` and `RateLimitHolds` is empty when nothing is held.

**Not affected:** every existing key and the campaign rows, which are unchanged.

**Who needs to act:** nobody. A client that rejects unknown keys must accept the new ones.

### Subscribers

#### `RulesJSON` accepts SMS activity rules

`subscribers.search`, `subscribers.delete`, `subscriber.tag`, `subscriber.untag`, `subscriber.unsubscribe` and `subscribers.journey.bulk` now accept a `RulesJSON` whose rules are `sms-events` (octeth/oempro#4157). Before v6.0.8 such a payload was refused as invalid RulesJSON (`ErrorCode` `6` on `subscribers.search`, `8` on `subscribers.journey.bulk`, `7` on the others), although the same rule worked in a saved segment. A bulk command sent with an SMS activity rule now acts on the contacts the rule matches.

**Who needs to act:** nobody, unless an integration relied on the refusal to skip SMS rules.

#### Abandoned imports end as `Failed`

An import whose worker stopped (a crash, an out-of-memory kill or a deployment) stayed in `Importing` before v6.0.8. Import workers now mark such an import `Failed` after `IMPORT_STALE_TIMEOUT_MINUTES` without progress, 360 by default (octeth/oempro#4200). The final status webhook is sent once, with `ImportStatus` `Failed`. Contacts imported before the stop remain on the list.

After the upgrade, imports left in `Importing` by earlier versions are marked `Failed` too. Those with no progress for more than 7 days are marked without a webhook.

**Who needs to act:** nobody. An integration that treats `Importing` as still running can stop waiting when the status becomes `Failed`.

### Segments

#### `converted` and `not converted` SMS operators

`sms-events` rules accept `converted` and `not converted`, which match the same contacts as `integration converted` and `not integration converted` and take the same `status` key (octeth/oempro#4157). The older pair stays accepted. The new interface offers "Converted" and "Did not convert" for new rules and shows a saved rule that uses the older pair as "Converted (legacy rule)".

The two `sms-events` status error texts no longer name Keitaro: "The status filter is only available for conversion rules." and "The conversion status must be text of 1 to 64 characters." The error code is still `12`.

**Who needs to act:** an integration that compares `ErrorText` against the old "Keitaro conversion" messages.

### Administration

#### Every worker appears in the process registry

`admin.processes.list` now returns rows for workers that never registered before, such as the email gateway events, MTA log and SMS workers, and queue workers keep their row while they wait for work (octeth/oempro#1312). `AvailableProcessTypes` lists 13 more types, and the `Metrics` of `admin.alerts.get` gain `worker_hung`. The new `Heartbeat` object, the `KeepRunning` parameter and the `WorkerHeartbeat` health check entry appear only when they are asked for.

**Who needs to act:** an integration that accepts only a fixed list of process types.

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

- List the `*@domain` and `@domain` suppression rows with the query under [Suppression](#suppression), and delete the ones that should not block a whole domain before you upgrade.
- If you store media in Amazon S3, check that the access key may read and delete objects, not only write them, and run **Test connection** in **Settings**, **Uploads and media**. Set the region there if the lookup cannot reach Amazon S3.
- If **Media library file** in **Settings**, **Uploads and media** is still 10,240 bytes, the old default, raise it. New installs start at 5 MB.
- If a custom plugin loads `aws_s3`, switch it to the AWS SDK in `vendor/`. The old class is removed.

- If a list synced from a MySQL server on your own network or in a container, list that host in `LIST_SYNC_ALLOWED_HOSTS` before the upgrade, or the converted sync fails and pauses. After the upgrade, check each converted sync on the list's **Sync** tab.
- If an integration sets up list syncs through the `Sync` parameters of `list.update`, or a plugin hooks `Cron.Sync`, move it as described under [List sync](#list-sync).
- If you set `excludeAutomated` or `includeAutomated` in journey `run_criteria` through the API, list the affected journeys with the query under [Journeys](#journeys) and check that the new filtering is what you want.
- If you call `event.track` from a server, handle HTTP 500 with `ErrorCode` `100005`. The event was not confirmed, and a retry can record it twice.
- If you run ScheduledPull journeys with a time window and no journey **Timezone**, check that the new local-time window is the one you want. To pin a window to a specific zone, set the journey's **Timezone**.
- If your integration matches the `ErrorText` "The status filter is only available for Keitaro conversion rules." or "The Keitaro conversion status must be text of 1 to 64 characters.", match error code `12` or the new texts instead.

---

Previous releases: [v6.0.7](/v6.0.7/api-reference/behavior-changes), [v6.0.6](/v6.0.6/api-reference/behavior-changes), [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
