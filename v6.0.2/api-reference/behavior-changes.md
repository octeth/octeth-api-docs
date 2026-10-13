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

### SMS

#### The v6.0.0 single-brace SMS merge tags render again

v6.0.1 replaced the SMS merge tag syntax with the email one, <code v-pre>{{ Subscriber:CustomField7 }}</code>, and stopped replacing the single-brace form v6.0.0 shipped, so content written for v6.0.0 reached the handset with the tag typed out. v6.0.2 renders both. `{CustomField7}` and `{CustomField7|"there"}` are read as <code v-pre>{{ Subscriber:CustomField7 }}</code> and <code v-pre>{{ Subscriber:CustomField7 | "there" }}</code> wherever SMS content is rendered: campaign sends, estimates, `smscampaign.test`, journey SMS and the SMS gateway (issue #3294).

A single-brace tag follows the same rules as the email syntax. `smscampaign.create` and `smscampaign.update` refuse one that names a field the list does not have (errors `14` and `17`), and a campaign whose field was deleted after it was saved skips its recipients. In v6.0.0 such a tag was dropped from the message instead. A fallback that holds a closing brace cannot be read: it is refused (errors `16` and `19`) and never sent.

The fallback now follows the email rules too: a field value of `0` shows the fallback, and spaces around the fallback text are trimmed.

The single-brace form is deprecated. `sms.mergetags.get` returns only the email syntax, and new content should use it.

### User Groups

#### A subscription plan has exactly one default user group

The database now enforces one default user group per subscription plan with a unique index. The commands that write a default answer a conflict with the `ErrorCode 34` refusal that `usergroup.create` and `usergroup.patch` already used, carrying `ConflictingUserGroupID` and an `ErrorText` naming the group (issue #3181):

- `usergroup.create` and `usergroup.patch` also return `ErrorCode 34` when a concurrent request made another group the plan's default first. Before v6.0.2 both requests could succeed and leave two defaults.
- `usergroup.update` returns `ErrorCode 34` when it would move a plan's default group onto a plan that already has one. It used to succeed.
- `usergroup.duplicate` creates the copy with `SubscriptionPlanIsDefault` set to `No`. It used to copy the original's default status.
- `usergroup.update` refuses a parameter sent as an array or object, where a single value is expected, with `ErrorCode 36` and `ErrorField` naming it.

The upgrade migration resolves any plan that already has more than one default: it keeps the group with the lowest `UserGroupID` as the default, sets the others to `No`, and writes each demoted group to the application log. The group it keeps is the one new signups on that plan were most likely already reaching.

## Upgrade checklist

- If a subscription plan had more than one default user group, the upgrade kept the one with the lowest `UserGroupID` and logged the others. Search the application log for `Migration #3181` to see which groups were demoted, and check each affected plan's default on the admin user group screens.
- If you set `EMAILGATEWAY_DNS_TRACK_PREFIX` to your campaign prefix as a workaround for journey and Email Gateway links leaving your sender domains, you can keep it or restore the previous value. Sender domains created on the Sender Domains page use their own verified tracking host again either way.
- SMS content that still uses the v6.0.0 `{CustomField7}` merge tags sends correctly again, so it no longer has to be rewritten before the upgrade. Move it to <code v-pre>{{ Subscriber:CustomField7 }}</code> when convenient, because the single-brace form is deprecated.
- Set `EMAILGATEWAY_SMTP_HOST` in `.oempro_env` to the SMTP host your customers use, then run `./cli/octeth.sh smtp:sync-config`.
- Remove any calls to the `postmaster.*` commands. They answer `ErrorCode: 99` in v6.0.2 and will be deleted later.
- The upgrade leaves `GOOGLE_POSTMASTER_CLIENT_ID`, `GOOGLE_POSTMASTER_CLIENT_SECRET` and `GOOGLE_POSTMASTER_REDIRECT_URI` in your `.oempro_env`. Nothing reads them any more, so you can delete them.
- Octeth does not revoke the OAuth grant you gave it in your Google account. Revoke it there, under your Google account's third-party access settings, and delete the OAuth client in Google Cloud if nothing else uses it.

---

Previous releases: [v6.0.1](/v6.0.1/api-reference/behavior-changes), [v6.0.0](/v6.0.0/api-reference/behavior-changes)
