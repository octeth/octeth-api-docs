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

### SMS campaigns

#### `smscampaign.get` says whose quiet hours a campaign follows

The `QuietHours` block carries the new `Source` field: `campaign` when the campaign sets both `QuietHoursStart` and `QuietHoursEnd`, `default` when it follows the install's quiet hours (octeth/oempro#3919). Before v6.0.6 the block gave only the window in force, so a client showed the install default as if the campaign had chosen it.

**Not affected:** every other field of `smscampaign.get`, and when messages are held. The sender resolves quiet hours exactly as before.

**Who needs to act:** nobody. A client that labels a campaign's quiet hours can read `Source` to mark the install default.

## Upgrade checklist

- [ ] If you call `subscriber.subscribe`, handle `ErrorCode 12` (the contact unsubscribed from the list, nothing changed). Send `UpdateIfUnsubscribed=true` only for a contact who asked to subscribe again.
- [ ] If you call `subscriber.subscribe` with unique custom fields, `ErrorCode 7` now means another subscriber holds the value. An existing contact resubmitting its own value gets `ErrorCode 9` or `ErrorCode 12`.
- [ ] If you set `TargetDeliveryServerID_*` through `usergroup.update` or `usergroup.patch`, handle `ErrorCode 37` or `ErrorCode 41` (the server is archived or does not exist, nothing changed).
- [ ] If you read `smscampaign.stats.breakdown` by `carrier` or `country`, expect each message in one row (the rows add up to `TotalMessages`) and a smaller empty `Dimension` row.
- [ ] If you forward <code v-pre>{{ SMS:TrackingCode }}</code> links through a Cloudflare redirect rule, change its length check to accept 6 as well as 21 before you send a campaign. Anything else that checks the tracking code must accept five characters.

---

Previous releases: [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
