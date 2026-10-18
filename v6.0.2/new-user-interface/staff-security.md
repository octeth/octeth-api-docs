# The Staff Security Screen

**Security** decides who can reach the admin area and lists the browsers that stay signed in to the classic admin area. It replaces the classic admin **Settings > Security** page. Your own two-factor authentication moved to [Your profile](./staff-profile#two-factor-authentication).

| Screen | Path on a default install | Permission |
|---|---|---|
| Security, Access section | `/user/staff/security` | Security |
| Security, Remembered sign-ins section | `/user/staff/security?section=remembered` | Security |

Open it from the staff sidebar: click **Security**. The classic admin **Settings > Security** link opens the same screen.

::: info
Every save and every revoke is recorded in the staff audit log.
:::

## Access

### Admin area IP allow-list

Only the addresses in **Allowed addresses** can open the admin area. Leave the list empty to allow every address.

1. Enter one entry per line: an IP address such as `203.0.113.7`, or an IPv4 range such as `198.51.100.0/24`. Blank lines and extra spaces are ignored.
2. Click **Save access rules**.

An entry that is neither an IP address nor an IPv4 range is refused, and the field names it. Sign-ins from the server itself are always allowed.

Below the list, the screen shows **your address** as the admin sign-in sees it, and whether the saved list lets it in.

::: warning
If the new list does not include your address, the screen asks before saving: **Save a list without your address?** After you confirm, the classic admin area refuses you from that address. This screen stays open to you, so you can change the list again here.
:::

When `ADMIN_API_ENFORCE_ALLOWED_IP` is on, admin API calls are measured against the same list. The new interface itself is exempt.

### Apply the list to user sign-ins too

Turn on **Apply the list to user sign-ins too** to let users sign in only from the addresses in the list, then click **Save access rules**. It has no effect while the list is empty.

## Remembered sign-ins

The browsers where an administrator ticked **Remember me** on the classic admin sign-in page. Each stays signed in for up to 14 days. The table shows the administrator (**You** marks your own), when the browser was remembered, when it was last used, when it expires, and the browser it was issued to. Times are UTC.

- Click the revoke icon on a row, then **Revoke**, to revoke one browser.
- Click **Revoke all**, then confirm, to revoke every browser, yours included.

A revoked browser signs in with the form next time. A session that is already open in that browser stays open until it ends. To end it as well, change that administrator's password.

::: tip
Turning on two-factor authentication revokes that administrator's remembered sign-ins, because remember me is never used for an account with two-factor authentication.
:::
