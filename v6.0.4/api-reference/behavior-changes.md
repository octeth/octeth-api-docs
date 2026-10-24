---
layout: doc
title: API Behavior Changes in v6.0.4
description: Deliberate API behavior changes in Octeth v6.0.4 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.4

This page lists every deliberate change in v6.0.4 that an existing integration can observe, so you can check your code against it before upgrading.

::: info Release in progress
This page is written as changes merge during the release cycle, not at release time. A deliberate contract change reads as an ordinary bug fix in the commit log, so a page assembled from commit subjects at the end of a cycle will miss it.

If this notice is still here when the release ships, there were no observable API behavior changes in v6.0.4.
:::

## Tier 1: changes that can break an integration

### Removed features

#### The ClickBank S2S postback address `/app/public/cbs2spostback/` is removed

`/app/public/cbs2spostback/` now answers HTTP 404, and the staff **Settings, S2S postback** screen in the new interface no longer shows a "ClickBank address".

The address recorded nothing. It accepted either a `tid` and `value` pair or ClickBank's encrypted notification, but every request ended in `{"success":false,"error":"Legacy SMS tracking is no longer supported"}` or an earlier validation error, because the legacy SMS tracking tables it wrote to were removed in an earlier release.

- **ClickBank instant notifications** are handled per subscriber list by `clickbank_webhook.php?list=<list hash>`. Copy the address from the list's integration settings, where the ClickBank secret key is also set.
- **Conversion postbacks** keep using `/system/s2s-postback/` with the parameter names on **Settings, S2S postback**. Nothing about that endpoint changed.

On an upgraded install, `./cli/octeth.sh upgrade:remove-retired-files` removes the old controller file.

## Tier 2: shape and value changes

None recorded yet.

## Upgrade checklist

1. **If a ClickBank account still sends instant notifications to `/app/public/cbs2spostback/`**, point it at the list's `clickbank_webhook.php?list=<list hash>` address instead. The old address never recorded a sale, so nothing that worked before stops working.

---

Previous releases: [v6.0.3](/v6.0.3/api-reference/behavior-changes), [v6.0.2](/v6.0.2/api-reference/behavior-changes), [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
