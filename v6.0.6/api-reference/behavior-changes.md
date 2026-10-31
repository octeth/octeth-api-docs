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

## Upgrade checklist

- [ ] If you call `subscriber.subscribe`, handle `ErrorCode 12` (the contact unsubscribed from the list, nothing changed). Send `UpdateIfUnsubscribed=true` only for a contact who asked to subscribe again.
- [ ] If you call `subscriber.subscribe` with unique custom fields, `ErrorCode 7` now means another subscriber holds the value. An existing contact resubmitting its own value gets `ErrorCode 9` or `ErrorCode 12`.
- [ ] If you set `TargetDeliveryServerID_*` through `usergroup.update` or `usergroup.patch`, handle `ErrorCode 37` or `ErrorCode 41` (the server is archived or does not exist, nothing changed).

---

Previous releases: [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
