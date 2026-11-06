---
layout: doc
title: API Behavior Changes in v6.0.6
description: Deliberate API behavior changes in Octeth v6.0.6 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.6

This page lists every deliberate change in v6.0.6 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.6.
:::

## Tier 1: changes that can break an integration

### Subscribers

#### `subscriber.subscribe` no longer re-subscribes an unsubscribed contact

This is a compliance fix. Before v6.0.6, `subscriber.subscribe` always re-subscribed an email address that had unsubscribed from the list: the status went back to `Subscribed` (or `Opt-In Pending` on a double opt-in list), the list suppression entry was deleted, and the response was identical to a new subscription. Any integration that synced contacts through this command silently undid opt-outs, which exposes the sender under CAN-SPAM and GDPR (octeth/oempro#3881).

The call is now refused with the new `ErrorCode 12` and `"PreviousSubscriptionStatus": "Unsubscribed"`. The subscriber row, its subscription source and its list suppression entry are left as they were, and no confirmation email is sent. A new request parameter, `UpdateIfUnsubscribed`, restores the old behaviour for one call when set to `true`.

Every success response also carries the new `PreviousSubscriptionStatus` field: empty for a new contact, `Unsubscribed` when `UpdateIfUnsubscribed=true` re-subscribed it.

**Not affected:** new contacts, and addresses already on the list (still `ErrorCode 9`, nothing changed). The public signup form, the re-subscribe action in the user area and subscribe requests sent by email pass `UpdateIfUnsubscribed=true`, so a person who subscribes again through them is re-subscribed as before. The journey **Subscribe to list** action and incoming subscription webhooks now skip a contact who unsubscribed from the target list.

**Who needs to act:** an integration that calls `subscriber.subscribe` and expects an unsubscribed contact to come back. Handle `ErrorCode 12` as "skipped, the contact opted out". Send `UpdateIfUnsubscribed=true` only when the contact has given fresh consent, for example by submitting your own signup form.

### SMS campaigns

#### Tracked SMS links carry a five-character code

Before v6.0.6 every tracked link in an SMS campaign carried a 20-character code, both in `/sc/` short links and where <code v-pre>{{ SMS:TrackingCode }}</code> is replaced in a passthrough link. Twenty characters often pushed a message into a second billed part. New messages now carry a five-character code of letters and digits, for example `https://go.example.com/sc/aB3x9` (octeth/oempro#3935). The cost estimate counts five characters per link, so it matches what is sent.

A five-character code is case-sensitive and resolves for 90 days after the message is sent, or for the campaign's link expiry (`LinkExpiryHours`) when that is longer. After that its click and its Keitaro conversions are no longer attributed. Codes already sent keep their 20 characters and keep working. A test message carries the code `00000`, which never resolves.

**Not affected:** the Keitaro postback URL, the poller and the postback parameters. Messages already queued before the upgrade are sent with five-character codes, so they can use fewer parts than were estimated, never more.

**Who needs to act:** an account that forwards <code v-pre>{{ SMS:TrackingCode }}</code> links through a Cloudflare redirect rule with `len(http.request.uri.path) eq 21`. Change the rule before you send a campaign after the upgrade, as described in [shorter links with Cloudflare](/v6.0.6/new-user-interface/sms-keitaro#optional-shorter-links-with-cloudflare), or new links stop reaching Keitaro. Anything else that validates the code's length or pattern must accept five characters as well as 20.

## Tier 2: shape and value changes

### Subscribers

#### `subscriber.subscribe` returns the status code instead of `ErrorCode 7` for a contact's own unique value

Before v6.0.6 the uniqueness check of a unique custom field counted the contact's own stored value, so a call for an address already on the list that carried its own unique value failed with `ErrorCode 7`, and so did an address joining a second list with a global unique value it already held (octeth/oempro#3883). The check now ignores the contact's own record. Such a call returns `ErrorCode 9` (already on the list) or `ErrorCode 12` (unsubscribed), or succeeds for a new list or with `UpdateIfUnsubscribed=true`. A value held by a different subscriber still returns `ErrorCode 7`.

**Who needs to act:** an integration that treats `ErrorCode 7` from `subscriber.subscribe` as "this contact already exists". Handle `ErrorCode 9` and `ErrorCode 12` for that case.

#### `subscribers.get` returns only a segment's members for a segment builder segment

Before v6.0.6, `subscribers.get` with a numeric `SubscriberSegment` returned a page of the whole active list for a segment built with the segment builder, `segment.create` with `RulesJson` or the MCP `create_segment` tool, while `TotalSubscribers` counted only the segment. Legacy campaign recipient estimates and segment exports had the same fault (octeth/oempro#3943). These reads now return only the segment's members. With `SearchKeyword` and a numeric `SubscriberSegment`, the call now searches within the segment and `TotalSubscribers` counts the matches, where before it returned no subscribers. A segment of another account, or one whose `RulesJson` is malformed, reads as empty. When the segment cannot be resolved, the call returns the standard error envelope instead of a page of the wrong subscribers, and a segment export is marked failed.

**Not affected:** segments with classic `SegmentRules`, and calls without `SubscriberSegment`.

**Who needs to act:** an integration that pages a segment through `subscribers.get`. Expect fewer rows, matching `TotalSubscribers`, and handle the error envelope.

### User groups

#### `usergroup.update` and `usergroup.patch` refuse an archived or missing delivery server

Before v6.0.6 both commands stored any `TargetDeliveryServerID_*` value in `Options` and answered success, even for a delivery server that does not exist or is archived. Sending then fell back to the system default without telling the admin (octeth/oempro#3847). Such a value is now refused with `ErrorCode 37` (`usergroup.update`) or `ErrorCode 41` (`usergroup.patch`), with `ErrorField` naming the key, and nothing is written. This is the rule `usergroup.options.patch` already applied as `ErrorCode 7`.

**Not affected:** `0` (system default), an active delivery server, and calls that do not send `Options`.

**Who needs to act:** an integration that sets a group's delivery servers through these commands. Handle `ErrorCode 37` or `41`, and pick an active server or `0`.

### SMS reporting

#### `smscampaign.stats.breakdown` counts each message once for `carrier` and `country`

Before v6.0.6 the `carrier` and `country` dimensions grouped every event of the campaign by the raw column. A message's carrier and country come from its delivery report, so every message was counted under the empty value through its `queued`, `send_attempt` and `sent` events, and each message whose report named a network was counted a second time under that network. A 500-message campaign could report 501 messages with no carrier plus 22 under named networks (octeth/oempro#3920). Each message is now resolved to one value first, the one its latest delivery report (`delivered`, `undelivered` or `expired`) named, so the rows add up to the campaign's messages and are ordered by `Messages`. A click's geolocated country no longer counts toward the `country` breakdown. `Events` for these rows is the number of events of the messages in the row.

Every response also carries the new `TotalMessages` field, the message count independent of `Limit`.

**Not affected:** the `hour`, `day`, `gateway_status`, `error_code`, `link` and `sender_id` dimensions, which still count events per value.

**Who needs to act:** an integration that reads `carrier` or `country` breakdowns. The empty row now holds only messages with no reported value, and the figures under each network no longer include a second count of the same message.

#### Keitaro conversions count status `sale` only

Before v6.0.6 any latest status except `rejected` was a conversion, so `lead` and custom statuses such as `quiz_started` counted in `smscampaign.stats` `Integrations.Conversions`, `Integrations.Revenue` and `Integrations.Links`, in the `integration_conversion` series of `smscampaign.stats.timeseries`, and in the segment `integration converted` and `not integration converted` operators without a `status`. Now only `sale` counts (octeth/oempro#3925). The rule is applied when reading, so existing campaigns show fewer conversions and less revenue after the upgrade, with no data change.

**Not affected:** every status is still stored, listed in `Integrations.Statuses` and returned by `smscampaign.events.browse`, and a segment rule that names a `status` still matches that status.

**Who needs to act:** an integration that reads Keitaro conversions or revenue. Expect lower figures where Keitaro sends `lead` or custom statuses, and name `status` in a segment rule to target a status other than `sale`.

### SMS campaigns

#### `smscampaign.get` says whose quiet hours a campaign follows

The `QuietHours` block carries the new `Source` field: `campaign` when the campaign sets both `QuietHoursStart` and `QuietHoursEnd`, `default` when it follows the install's quiet hours (octeth/oempro#3919). Before v6.0.6 the block gave only the window in force, so a client showed the install default as if the campaign had chosen it.

**Not affected:** every other field of `smscampaign.get`, and when messages are held. The sender resolves quiet hours exactly as before.

**Who needs to act:** nobody. A client that labels a campaign's quiet hours can read `Source` to mark the install default.

### Journeys

#### Journey emails skip the email API request limit and wait out throttles and account holds

Before v6.0.6 a journey Send email spent the account's `POST /api/v1/email` request budget (100 requests a minute), shared with the account's own transactional API traffic, so a large enrolment failed most of its sends with HTTP 429 and could also refuse the account's own API sends (octeth/oempro#3944). A journey send signed by Octeth now skips that limiter. It is still bounded by the account's email gateway send rate limit, credits and daily cap, and unsigned requests are limited as before.

A journey Send email refused with HTTP 429, or refused because of the account itself (codes 12, 32, 34 and 40: disabled account, inactive sender domain, unverified phone, pending approval), used to count as a failed attempt, so after six attempts subscribers who passed the step while the account was held never got the email (octeth/oempro#3951). These refusals now wait without spending an attempt: a throttle retries after the gateway's `Retry-After` (60 seconds when none is given) for up to 24 hours, and an account hold retries hourly for up to 7 days, then the entry is dead-ended with a reason naming the throttle or hold. A sender domain that is not Enabled when the step runs (Approval Pending, Suspended, Blocked or Disabled) used to skip that email and move the subscriber on. It is now the same domain hold and waits. A retry is never scheduled past a wait cap. The recorded `ErrorCode` on the action execution is now `Throttled` or `AccountHold:<reason>` instead of `SendFailed`, and retries after an ordinary failure carry up to 20 percent jitter.

`journey.get` takes the new opt-in `IncludeSendHolds` parameter, which adds a `SendHolds` array listing the holds this journey's entries are waiting on.

**Not affected:** entries already dead-ended before the upgrade, which are not revived, and `journey.get` calls without `IncludeSendHolds`.

**Who needs to act:** an integration that reads journey action `ErrorCode` values. Expect `Throttled` and `AccountHold:<reason>` for these refusals.

### Segments

#### Changing a segment's rules resets its count timestamp

Before v6.0.6, `segment.update` and the legacy segment editor kept the stored count when a segment's rules changed, so `segments.get` served the old rules' count as fresh for up to 10 minutes (octeth/oempro#3939). When the rules or the match operator change, `SubscriberCountLastCalculatedOn` now becomes `0000-00-00 00:00:00` and the cached count is dropped. `SubscriberCount` keeps the last number until the recount. The legacy editor used to write a timestamp three days in the past instead. A count is now saved only while the segment still has the rules it was counted for, so a count that runs across a rule edit is dropped and the segment is counted again, and opening a segment in the legacy editor no longer stores 0 when its recount times out. Subscriber deletions and imports still mark every counted segment for a recount, but leave a never-counted segment never counted.

`segments.get` also takes the new opt-in `ComputeMissingCount` parameter. With it and one `SegmentID`, a never-counted segment is counted during the request (up to `SEGMENT_COUNT_INLINE_TIMEOUT`, default 10 seconds). The AI connector's `get_segment_count`, `create_segment` and `list_segments` tools report `CountStatus` (`counted` or `pending`), and a segment still being counted has `SubscriberCount: null`, never 0 (octeth/oempro#3937).

**Not affected:** a rename or an update that leaves the rules as they are, and `segments.get` calls without `ComputeMissingCount`.

**Who needs to act:** an integration that reads `SubscriberCount` right after changing a segment's rules. Treat a zero `SubscriberCountLastCalculatedOn` as "not counted yet", or pass `ComputeMissingCount=true` with the `SegmentID`.

### Bounce and unsubscribe attribution

#### Processed bounces record their email, and link unsubscribes record a channel

Before v6.0.6 bounces processed from the bounce spool, `cli/bounce.php` and the internal bounce register call were stored with no email (A/B variant) and did not count toward the sender domain's bounce total, and unsubscribes through the unsubscribe link were stored with an empty channel (octeth/oempro#3947). Such a bounce now records the email it was sent from when that email belongs to the account, and counts toward its sender domain. Such an unsubscribe records `List-Unsubscribe one-click` for an RFC 8058 one-click request from a mailbox provider, or `Unsubscribe link` for a link confirmed on the unsubscribe page, next to the existing `List-Unsubscribe header` and `SPAM complaint` values in the subscriber's activity history.

**Not affected:** rows recorded before the upgrade, and unsubscribes posted directly to a customer-hosted form, which keep an empty channel.

**Who needs to act:** nobody. A report that reads the unsubscribe channel or per-email bounces will see the new values on new rows.

## Upgrade checklist

- [ ] If you call `subscriber.subscribe`, handle `ErrorCode 12` (the contact unsubscribed from the list, nothing changed). Send `UpdateIfUnsubscribed=true` only for a contact who asked to subscribe again.
- [ ] If you call `subscriber.subscribe` with unique custom fields, `ErrorCode 7` now means another subscriber holds the value. An existing contact resubmitting its own value gets `ErrorCode 9` or `ErrorCode 12`.
- [ ] If you set `TargetDeliveryServerID_*` through `usergroup.update` or `usergroup.patch`, handle `ErrorCode 37` or `ErrorCode 41` (the server is archived or does not exist, nothing changed).
- [ ] If you read `smscampaign.stats.breakdown` by `carrier` or `country`, expect each message in one row (the rows add up to `TotalMessages`) and a smaller empty `Dimension` row.
- [ ] If you read Keitaro `Conversions` or `Revenue`, expect sales only, and set `status` in a segment rule to match `lead` or a custom status.
- [ ] If you forward <code v-pre>{{ SMS:TrackingCode }}</code> links through a Cloudflare redirect rule, change its length check to accept 6 as well as 21 before you send a campaign. Anything else that checks the tracking code must accept five characters.

---

Previous releases: [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
