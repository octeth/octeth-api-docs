# Managing Sub-admins in the Staff Area

A **sub-admin** is an administrator account with limited permissions. Each one signs in to the admin area with their own username and password, can do only what their permissions allow, and reaches only the user groups you choose. The **Sub-admins** screens replace the classic admin **Settings > Sub Admin Accounts** section.

| Screen | Path on a default install | Permission |
|---|---|---|
| Sub-admins | `/user/staff/sub-admins` | SubAdmins |
| Create sub-admin | `/user/staff/sub-admins/new` | SubAdmins |
| Edit sub-admin | `/user/staff/sub-admins/<id>/edit` | SubAdmins |

Open it from the staff sidebar: click **Administration**, then **Sub-admins**. The classic admin **Settings > Sub-admins** link, and the old `/app/admin/subadmins/` addresses, open the same screens.

## The list

The list shows every administrator account except the main administrator:

- **Name**, **Username** and **Email**.
- **Privileges**: how many permissions the account holds, or **All** for an account without limits.
- **User groups**: the groups the account reaches, or **All**. A group that was deleted shows as **Deleted group #N**.
- **Two-factor** and **API key**: whether two-factor authentication is on and whether an API key is issued.

Click a row to open the account. Your own row is marked **You** and opens [Your profile](./staff-profile). An account marked **Outside your access** holds a permission or a user group you do not have, so you cannot open or delete it. An account marked **Full access** has no limits and is not managed here.

To delete accounts, tick their rows, click **Delete** and confirm. A deleted account can no longer sign in, its API key stops working, and it cannot be restored.

## Create a sub-admin

1. Click **Create sub-admin**.
2. Enter the **Name**, **Email address**, **Username** and **Password**. Click **Generate** for a random password, and share it with the sub-admin over a safe channel: it is not shown again.
3. Tick the **permissions** the sub-admin needs. They are grouped by area, and each one says what it allows. Use **Select all** or **Select none** to change them all at once.
4. Under **User groups**, tick the groups whose accounts the sub-admin may reach. Leave every box empty to give access to all user groups.
5. Click **Create sub-admin**.

The account's Edit screen opens, where you can issue its API key.

::: tip
If your own account has permission limits, the form offers only the permissions you hold and the user groups you reach. If you are limited to some user groups, you must choose at least one: you cannot give anyone access to every group.
:::

## Edit a sub-admin

The Edit screen has three sections on the left. Each one saves on its own.

### Account

Change the name, email address or username, or enter a **New password**. Leave the password empty to keep the current one. A new password, or a new username, signs the sub-admin out of every open session and remembered browser.

### Permissions

Tick or untick permissions and user groups, then click **Save permissions**. A deleted user group stays ticked as **Deleted group #N** until you untick it, so saving never widens the account to every group by accident.

### Access

- **API key**: click **Issue key** to create one. The key appears once, right after it is issued: copy it then. It disappears when you leave the page or change anything on it, and the screen shows **Issued** afterwards. **Rotate** replaces the key, and the old one stops working at once. **Revoke** removes it. Both ask you to confirm.
- **Two-factor authentication**: when a sub-admin loses their authenticator app, click **Reset two-factor** and confirm. They sign in with their password alone until they turn two-factor authentication on again in Your profile. Confirm who is asking before you do this.
- **Remembered sign-ins**: click **Sign out remembered sign-ins** and confirm to sign the sub-admin out of every browser where they ticked **Remember me** on the classic admin sign-in page, for example when a laptop is lost or a teammate leaves. A session that is open right now stays open until it ends: set a new password on the Account section to end it as well. Administrators who also hold the Security permission see how many browsers are remembered.

## Limits for sub-admins who manage sub-admins

A sub-admin who holds the SubAdmins permission can manage other sub-admins, within their own access:

- They can grant only the permissions they hold and the user groups they reach.
- They cannot change or delete their own account here. They change their name, email and password in [Your profile](./staff-profile).
- They cannot change, delete, reset or sign out an account that holds a permission or a user group they do not have.

The Octeth API applies the same rules, so these limits hold for API keys as well. The main administrator, and every administrator without permission limits, can manage every sub-admin.

The new API key, the two-factor reset and the remembered sign-in revocation are not available in demo mode.
