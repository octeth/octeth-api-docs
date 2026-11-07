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

## Step 1: Turn on email verification

Email verification is off on every installation until you turn it on. Call `verification.settings.update` with your admin API key:

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

By default every user group can use email verification. To allow only some groups, set `AllUserGroups` to `false` and list the groups:

```bash
curl -X POST https://your-octeth-domain/api/v1/verification.settings.update \
  -H "Content-Type: application/json" \
  -d '{"Command": "verification.settings.update", "AdminAPIKey": "your-admin-api-key", "AllUserGroups": false, "UserGroupIDs": [2, 5]}'
```

You can also set how many days a cached result answers a repeat check (`CacheDays`, default 30, `0` turns the cache off) and a low-balance warning level (`LowBalanceThreshold`).

## Step 3: Give users credits

Grant credits with `user.verificationcredits.add`:

```bash
curl -X POST https://your-octeth-domain/api/v1/user.verificationcredits.add \
  -H "Content-Type: application/json" \
  -d '{"Command": "user.verificationcredits.add", "AdminAPIKey": "your-admin-api-key", "UserID": 12, "Credits": 500, "Note": "Included with the Pro plan"}'
```

Users see their balance with `user.verificationcredits.get` and every grant and check with `user.verificationcredits.history`.

## Step 4: Watch your client area balance

All your users' checks are paid from one client area balance. If it runs out, users cannot verify even when they hold credits. Call `verification.status.get` to see the balance, the total credits your users hold and a warning:

- `below_user_balances`: your balance cannot cover the credits your users hold.
- `below_threshold`: your balance is below the `LowBalanceThreshold` you set.

Top up the client area balance before it runs out.

## Privacy

Octeth never writes a checked address to a log file, and the result cache holds only a keyed hash of each address. Results that suggest a corrected address, and results of type unknown, are never cached.
