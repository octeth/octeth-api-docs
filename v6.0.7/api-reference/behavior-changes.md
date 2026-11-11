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

### SMS campaigns

#### `SendRatePerMinute` is spread evenly across the minute

A campaign's `SendRatePerMinute` now releases one message every 60 / rate seconds instead of the whole minute's quota in the first second (octeth/oempro#4089). At 6 a minute that is one message about every 10 seconds. Campaigns sending at the same time are offset from each other, so their messages fall in different seconds. Before v6.0.7 every campaign sent its full quota at the top of each minute, which carriers and gateways read as a per-second flood.

A campaign that starts, resumes from a pause or leaves quiet hours sends its first message at its next slot, at most 60 / rate seconds later, rather than at once.

**Not affected:** the number of messages sent per minute, campaigns with `SendRatePerMinute` 0 (no campaign limit), quiet hours, pausing, account rate limits and gateway limits.

**Who needs to act:** nobody. A rate of 60 or more a minute still sends every second, spread at rate / 60 messages per second.

## Upgrade checklist

Nothing to check yet.

---

Previous releases: [v6.0.6](/v6.0.6/api-reference/behavior-changes), [v6.0.5](/v6.0.5/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
