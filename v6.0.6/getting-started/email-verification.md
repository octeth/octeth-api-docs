---
layout: doc
---

# Set Up Email Verification

Email verification checks whether an address can receive email before you send to it. Octeth runs each check through the Octeth client area (my.octeth.com) and bills it to the user's own verification credits, so you can offer verification to your users and sell it to them.

## How billing works

There are two balances:

- **Your client area balance.** Every check Octeth sends costs one credit from the balance of the my.octeth.com team that owns your license. You top it up in the client area.
- **Each user's verification credits.** Every check a user runs costs that user one credit. You give users credits as a free grant or they buy credit packs. These credits are separate from delivery credits.

When a user checks an address that was checked recently, Octeth answers from its own result cache without spending a client area credit. The user is still charged one credit. The cache stores only a keyed hash of each address, never the address itself.

## Before you start

You need:

- A signed license key installed on Settings > License, or in `LICENSE_KEY`.
- The installation switched on in the client area: sign in to my.octeth.com, open Email verification, then the Octeth installations tab, and turn on your installation. You can set a daily credit cap there too.
- Credits in your client area balance.

Every step below can be done in the staff area or through the API. In the staff area, open **Settings > Email verification**.

## Step 1: Turn on email verification

Email verification is off on every installation until you turn it on.

In the staff area, **Upstream status** shows whether my.octeth.com accepts this installation, its client area balance and the credits your users hold. Choose the refresh button to check again. If the status says the installation is not switched on, choose **Switch it on at my.octeth.com** and enable it there. Then turn on **Offer email verification**.

Through the API, call `verification.settings.update` with your admin API key:

```bash
curl -X POST https://your-octeth-domain/api/v1/verification.settings.update \
  -H "Content-Type: application/json" \
  -d '{"Command": "verification.settings.update", "AdminAPIKey": "your-admin-api-key", "Enabled": true}'
```

Octeth then checks the connection to the client area once. Look at `Upstream` in the answer:

- `"Ready": true` means the client area accepts your installation.
- `"Error": "installation_disabled"` means the installation is not switched on in the client area yet. Open the address in `EnableURL`, switch it on, then check again with `verification.status.get`.
- `"Error": "no_license_key"` or `"key_invalid"` means the license key is missing or not accepted. Check Settings > License.

## Step 2: Choose who can verify

By default every user group can use email verification. In the staff area, turn off **Every user group** and choose the groups. **Reuse a result for** sets how long a cached result answers a repeat check.

Through the API, to allow only some groups, set `AllUserGroups` to `false` and list the groups:

```bash
curl -X POST https://your-octeth-domain/api/v1/verification.settings.update \
  -H "Content-Type: application/json" \
  -d '{"Command": "verification.settings.update", "AdminAPIKey": "your-admin-api-key", "AllUserGroups": false, "UserGroupIDs": [2, 5]}'
```

You can also set how many days a cached result answers a repeat check (`CacheDays`, default 30, `0` turns the cache off) and a low-balance warning level (`LowBalanceThreshold`).

## Step 3: Give users credits

In the staff area, open the user in **Users**, then the **Email verification** tab. It shows the user's balance and history. Enter the credits and a note (only staff see it) and choose **Grant credits**.

To sell credits, create a credit pack in **Billing > Catalog** with a verification credits entitlement. Users see its **Buy** button on the Credits card of their Billing page while it is live, and the credits are added as soon as the payment goes through.

Through the API, grant credits with `user.verificationcredits.add`:

```bash
curl -X POST https://your-octeth-domain/api/v1/user.verificationcredits.add \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.verificationcredits.add", "AdminAPIKey": "your-admin-api-key", "UserID": 12, "Credits": 500, "Note": "Included with the Pro plan"}'
```

Users see their balance with `user.verificationcredits.get` and every grant and check with `user.verificationcredits.history`.

## Step 4: Watch your client area balance

All your users' checks are paid from one client area balance. If it runs out, users cannot verify even when they hold credits. Call `verification.status.get` to see the balance, the total credits your users hold and a warning. The staff area shows the same warning on its Email verification page:

- `below_user_balances`: your balance cannot cover the credits your users hold.
- `below_threshold`: your balance is below the `LowBalanceThreshold` you set.

Top up the client area balance before it runs out.

## Your verification credits

Users open **Email verification** in the sidebar. The page shows their credit balance and every change to it: single checks, list verifications, credits returned, purchases and grants. If a user does not see Email verification in the sidebar, it is not turned on for their user group.

## Check a single address

1. Open **Email verification**.
2. Type the address and choose **Check address**.

The result is safe, risky, invalid or unknown (see [Read the results](#read-the-results)). When the address looks like a typing mistake, the result suggests a correction. Choose **Use this address** to check it.

Each check costs one verification credit. If the check cannot finish (for example, it times out), the credit is returned and the user can try again later. Through the API, the same check is `email.verify`.

## Check new subscribers when they sign up

Each list can check new subscribers before they are added. To turn it on in the interface:

1. Open the list, choose the **Settings** tab, then **Verification**.
2. Turn on **Verify new subscribers**.
3. Choose which results to refuse. Invalid is the default.
4. Optionally refuse risky addresses for a reason, for example disposable addresses.
5. Set how long a signup waits for the check (1 to 20 seconds) and an optional daily cap.
6. Choose **Save verification settings**.

The **Let in unchecked** column counts the signups that were added without a check.

Through the API, turn it on with `list.verification.settings.update`:

```json
{
  "Command": "list.verification.settings.update",
  "APIKey": "your-api-key",
  "ListID": 12,
  "VerifyOnSubscribe": true
}
```

From then on, every new signup through a subscription form or `subscriber.subscribe` is checked and costs the list owner one verification credit. By default only invalid addresses are refused. The visitor sees "Invalid Email Address", with a "Did you mean ...?" suggestion when the check has one.

Good to know:

- **Signups are never blocked by a problem with the check.** If the check takes longer than the list's timeout (8 seconds by default), verification is unavailable, or the owner has no credits left, the subscriber is added unchecked. These signups are counted as "failed open" in the list's counters.
- **Existing subscribers are not checked again.** A signup for an address already on the list costs nothing.
- **Journeys are not checked.** A journey's subscribe action adds the contact without a check or a charge.
- **Refuse more than invalid addresses** with `VerifyRejectGroups` (add `risky` or `unknown`) or `VerifyRejectRiskyReasons` (for example `disposable` or `role`).
- **Limit the spend** with `VerifyDailyCap`, the most checks a list runs per day. It protects the owner's credits from bots that post the form many times. Past the cap, signups are added unchecked.
- **See what happened** with `list.verification.settings.get`: per day, how many signups were checked, refused, and let in unchecked.

To check an address added through the API with `subscriber.create`, pass `Verify` set to `true`.

## Verify a whole list or segment

You can check every subscriber of a list, or of one segment, in one run. Octeth sends the addresses in the background and keeps the results for 30 days by default.

### What a run covers and costs

- A run covers subscribers who are subscribed and have not bounced when the run starts. Subscribers added later are not in it.
- Each unique address costs one verification credit. Two subscribers with the same address are checked once and share the result.
- All credits are charged when the run starts. If your balance is too small, nothing is charged and you see how many credits you need.
- When the run ends, you get back the credits for every address that was not checked, for example a subscriber who unsubscribed during the run or an address the check could not reach.
- A list has one run at a time.

### Start a run

In the interface:

1. Open the list and choose the **Verification** tab.
2. Choose **Verify subscribers**.
3. Choose **Whole list** or **One segment**. The dialog shows the most credits the run can use against your balance.
4. Choose **Start verification**.

The page updates by itself while the run is in progress.

Through the API, call `list.verification.start` with the list, and a segment if you want only part of the list:

```bash
curl -X POST https://example.com/api/v1/list.verification.start \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.start", "APIKey": "your-api-key", "ListID": 12}'
```

Then check its progress with `list.verification.get` until `Finished` is `true`. A list of 100,000 subscribers usually takes a few minutes to half an hour.

### Read the results

Each subscriber gets one of these results:

| Result | Meaning |
|--------|---------|
| safe | The address accepts mail |
| risky | The address may work, but carries a risk: it accepts everything (`accept_all`), belongs to a role such as info@ (`role`), is a throwaway address (`disposable`) or looks low quality (`low_quality`) |
| invalid | The address cannot receive mail |
| unknown | The mail server did not give a clear answer |
| skipped | The address was not checked, and its credit came back |

In the interface, the page shows how many addresses fell in each result and why risky addresses are risky, and the **Results** table lists each subscriber. Filter it by result or by risky reason.

Through the API, `list.verification.results` lists the subscribers of a result, for example every invalid address, with paging.

### Clean the list

In the interface, choose **Apply to subscribers**, tick the results to act on (Invalid is ticked for you), choose the action and choose **Apply**. Through the API, call `list.verification.apply` with the results to act on:

- **Unsubscribe** (the default) marks those subscribers as unsubscribed on this list only.
- **Suppress** adds their addresses to the list's suppression list, so they are never mailed even if they subscribe again.

```bash
curl -X POST https://example.com/api/v1/list.verification.apply \
  -H "Content-Type: application/json" \
  -d '{"Command": "list.verification.apply", "APIKey": "your-api-key", "RunID": 7, "Groups": ["invalid"], "Action": "unsubscribe"}'
```

The action runs in the background. The Verification tab shows its progress, and `list.verification.get` shows how many subscribers it changed.

### Cancel a run

Choose **Cancel** on the Verification tab, or call `list.verification.cancel`. Addresses already sent still finish checking, and you get back the credits for the rest.

### If a run fails

A run fails when the installation's own verification balance in the Octeth client area runs out, or when the client area keeps refusing the installation for a day. Results already checked are kept, and the credits for every address not checked come back. Ask your administrator to top up the client area balance, then start a new run.

## Privacy

Octeth never writes a checked address to a log file, and the result cache holds only a keyed hash of each address. Results that suggest a corrected address, and results of type unknown, are never cached.
