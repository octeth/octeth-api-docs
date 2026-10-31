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

None recorded yet.

## Upgrade checklist

- [ ] If you call `subscriber.subscribe`, handle `ErrorCode 12` (the contact unsubscribed from the list, nothing changed). Send `UpdateIfUnsubscribed=true` only for a contact who asked to subscribe again.

---

Previous releases: [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
