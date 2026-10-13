---
layout: doc
title: API Behavior Changes in v6.0.2
description: Deliberate API behavior changes in Octeth v6.0.2 that an existing integration can observe, with an upgrade checklist
---

# API Behavior Changes in v6.0.2

This page lists every deliberate change in v6.0.2 that an existing integration can observe, so you can check your code against it before upgrading.

## Tier 1: changes that can break an integration

### Google Postmaster

#### The Google Postmaster integration is removed and the `postmaster.*` commands return a fixed error

Google retired the Postmaster Tools API, so the integration could no longer fetch data. v6.0.2 removes it: the **Reports > Google Postmaster** screens, the OAuth connection, the three nightly crons (collector, cleanup and sending-statistics aggregation) and the stored metrics. An upgrade migration drops the `oempro_google_postmaster_oauth_tokens`, `oempro_google_postmaster_domain_metrics`, `oempro_google_postmaster_ip_metrics`, `oempro_google_postmaster_sending_stats` and `oempro_sender_ip_addresses` tables, which also deletes the stored Google refresh token and the sender IP list entered for Postmaster collection.

The 11 `postmaster.*` admin commands stay registered for this release. Each one, whatever parameters are sent, answers `{"Success": false, "ErrorCode": 99, "ErrorText": "Google Postmaster integration has been removed: the Google Postmaster Tools API is no longer available"}` and still requires the `Settings` privilege. They will be deleted in a later release. See [Google Postmaster Tools](/v6.0.2/api-reference/postmaster) for the list.

There is no opt-in flag, because the commands had no working data source left.

## Tier 2: shape and value changes

### Email Gateway

#### `emailgateway.getsmtps` and `emailgateway.addsmtp` return `smtp.example.com` as `SMTPHost` until `EMAILGATEWAY_SMTP_HOST` is set

`SMTPHost` comes from `EMAILGATEWAY_SMTP_HOST`. An install that never set the key used a built-in default. The v6.0.2 upgrade adds the key with the placeholder `smtp.example.com`, so these commands return that value until an administrator sets the real SMTP host in `.oempro_env`. The response shape is unchanged.

### Journeys and Email Gateway

#### Links in journey and Email Gateway mail return to a sender domain's own verified tracking host

Since v5.9.6, journey and Email Gateway mail used a sender domain's own tracking host only when its stored DNS records listed the host composed from the `EMAILGATEWAY_DNS_*` settings. A domain added on the Sender Domains page stores its tracking record in the campaign form, composed from the `EMAILCAMPAIGN_DNS_*` settings. On an install where the two differ, for example `EMAILCAMPAIGN_DNS_TRACK_PREFIX=upl` and `EMAILGATEWAY_DNS_TRACK_PREFIX=track`, every such domain failed the check and its tracking, opt-out, web-version and forward links moved to the delivery-server tracking domain or the `APP_URL` host.

v6.0.2 accepts the tracking host in either form. The gateway form is checked first, so a domain whose records are in the gateway form keeps its current host. The other conditions are unchanged: Sender Domain Management on for the owner's group, the domain `Enabled`, and the host listed in its stored DNS records. The admin sender domain health report and the domain edit page now name the same host the mail carries (issue #3307).

Links already sent keep their fallback host and keep working.

## Upgrade checklist

- If you set `EMAILGATEWAY_DNS_TRACK_PREFIX` to your campaign prefix as a workaround for journey and Email Gateway links leaving your sender domains, you can keep it or restore the previous value. Sender domains created on the Sender Domains page use their own verified tracking host again either way.
- Set `EMAILGATEWAY_SMTP_HOST` in `.oempro_env` to the SMTP host your customers use, then run `./cli/octeth.sh smtp:sync-config`.
- Remove any calls to the `postmaster.*` commands. They answer `ErrorCode: 99` in v6.0.2 and will be deleted later.
- The upgrade leaves `GOOGLE_POSTMASTER_CLIENT_ID`, `GOOGLE_POSTMASTER_CLIENT_SECRET` and `GOOGLE_POSTMASTER_REDIRECT_URI` in your `.oempro_env`. Nothing reads them any more, so you can delete them.
- Octeth does not revoke the OAuth grant you gave it in your Google account. Revoke it there, under your Google account's third-party access settings, and delete the OAuth client in Google Cloud if nothing else uses it.

---

Previous releases: [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
