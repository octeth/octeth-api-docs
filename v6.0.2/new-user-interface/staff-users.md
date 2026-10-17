# Managing Users in the Staff Area

The staff area of the new interface has three screens for user accounts: the **Users** list,
**Create user** and the user **Edit** page. They replace the classic **Users** browse screen,
**Users > Create** and the user **Edit** page of the classic admin area. The user page itself,
with its tabs, the account actions and containment, is described in
[Managing one user from the staff area](./#managing-one-user-from-the-staff-area).

| Screen | Path on a default install | Permission |
|---|---|---|
| Users list | `/user/staff/customers` | Users and User.Browse |
| Create user | `/user/staff/customers/new` | Users and User.Create |
| Edit user | `/user/staff/customers/<user id>/edit` | Users and User.Edit to open it, User.Update to save |

::: info
The staff screens act as the administrator who is signed in. A sub-administrator sees only the
users in the user groups their account may access, and controls for actions they lack the
permission for are hidden. Octeth checks the same permissions again on every request.
:::

The classic admin **Users** section forwards to these screens, see
[Coming from the classic Users and User Groups sections](./#coming-from-the-classic-users-and-user-groups-sections).

## The Users list

Sign in to the new interface with your Octeth administrator credentials and choose **Users** in
the left menu.

[[SCREENSHOT: The staff Users list with the search box, the filter row, the Categories and Create user buttons, and a table of users with limit status dots and 7-day send charts]]

### Searching

Type in the search box above the list. The search matches the first name, last name, company
name, email address and username of a user, and a user ID when you type the whole number.
Results update as you type.

The search box in the top bar of the staff area opens this page with your search filled in.

### Filtering

All filters combine. Choosing a user group and **Disabled**, for example, lists the disabled
users in that group.

| Filter | Shows |
|---|---|
| User groups | Users in any of the ticked groups. Shown when your account has the UserGroups permission |
| Status | Enabled or disabled users |
| Reputation | Trusted or untrusted users |
| Category | Users in one category, or uncategorized users |
| Limit status | Users within their sending limits, near a limit, or over a limit |
| Online now | Users active in the last 10 minutes |
| Blocked sender domains | Users with at least one blocked sender domain. Not available to an administrator limited to some user groups |

The limit status comes from a job that runs every 15 minutes. On a new install, until that job
has run once, the limit status filter shows an error. Clear the filter to see the list again.

Click **Clear search and filters** to start over.

#### Billing filters

When [billing](./billing-setup) is on, a second row offers **plan**, **add-on** and **credits**
filters. These come from the billing records of the new interface, so they work as a separate
mode: choosing one clears the search and the filters above, and choosing a search or filter
clears the billing filters. In this mode the list shows 20 users per page and cannot be
re-sorted.

### Sorting and page size

Click the **Name**, **Email**, **Created** or **Last active** column header to sort by it, and
click again to reverse the order. **Name** sorts by first name. The **Sort by** menu also offers
last name, company, user ID and single sign-on ID. Show 25, 50 or 100 users per page.

The search, filters, sort order, page size and page number are kept in the address of the page,
so a reload or a shared link opens the same view.

### What each row shows

- The user's name, or the company name when the user has no name, with the company underneath.
- A **Disabled** label on disabled users.
- A coloured dot for the limit status: green within limits, amber near a limit, red over a
  limit. Click it to open the user's **Limits** tab.
- Username, email address and user group.
- **Sends, 7 days**: a small chart of the campaign emails the user sent on each of the last seven
  days (UTC), with the total. Shown when your account has the User.Edit permission.
- Plan and credits, when billing is on.
- When the user was created, and when they were last active.
- **Open user** and, when your account has the User.Impersonate permission, **Switch user**.

On an install with no users yet, the page says so and, when your account may create users,
offers a **Create user** button.

### Acting on several users

Tick the users you want, or tick the box in the header to select every user on the page. A bar
appears above the list with the actions your account may take. An action applies only to the
selected users on the current page.

| Action | What it does | Permission |
|---|---|---|
| Enable | Enables each selected user | User.Update |
| Disable | Disables each selected user, who can then no longer sign in | User.Update |
| Set category | Puts each selected user in a category, or makes them uncategorized | User.Update |
| Delete | Deletes the selected users with their lists, subscribers and campaigns | User.Delete |

Enable, disable and set category update the users one by one. When some users cannot be
changed, for example because they are outside the user groups your account may access, the
result above the list names each one and the reason. The others are still changed.

Delete asks you to type the number of selected users to confirm. Octeth deletes all of the
selected users or none of them: if one user cannot be deleted, nothing is deleted and the result
says why. A deleted user cannot be restored.

Every bulk action is written to the staff audit log, one entry per user.

### Managing categories

Categories group users for your own use, for example by sales channel. Click **Categories** at
the top of the page (needs the Users permission) to:

- add a category,
- rename a category with the pencil icon,
- delete a category with the bin icon. Its users become uncategorized. No user is deleted.

The number of users in each category is shown to administrators who may access every user
group. It is hidden from an administrator limited to some groups, because the count includes
users in other groups.

## Creating a user

1. On the **Users** list, click **Create user**.
2. Fill in the **Account** section:
   - **Company name**, or both **First name** and **Last name**. One of the two is required.
   - **Username** and **Email address**. Both must be unused by any other user.
   - **Password**. Type one, or click **Generate** for an 18-character random password. Copy a
     generated password before you create the user: it is shown only on this page and cannot be
     shown again.
   - **Time zone** and **Language**. Both start at your install's defaults.
   - **User group**. Only the groups you may access are listed. Limits, permissions and the
     delivery server come from the group.
   - **Reputation**. Leave it on **Default for new users** to apply the new-user reputation set
     in Octeth's settings, or choose Trusted or Untrusted.
3. Optionally fill in the **Personal** section: website, other email addresses (one per line),
   address, country, phone, fax, and whether the phone number is verified.
4. Click **Create user**. You land on the new user's page.

Rate limits, the delivery server and plug-in options are set on the user's **Edit** page once the
account exists.

If something is wrong, the message appears next to the field that needs fixing, for example
"This username is already taken" or "You may not create users in this user group". For
security, the password field is emptied after every attempt, so enter or generate it again
before you retry.

[[SCREENSHOT: The Create user page with the Account section filled in, the Generate button next to the password field, and the Reputation menu on Default for new users]]

## Editing a user

Open a user and click **Edit**. Everything is on one page in three sections. Click **Save user**
at the bottom to save all of it at once. Without the User.Update permission the page opens
read-only and has no **Save user** button.

To remove an optional value, empty the field and save. The field is cleared.

### Account

- Name, company, username and email address.
- **New password**. Leave it empty to keep the current password.
- Time zone, language, user group and reputation. Without the UserGroups permission the current
  group is shown but cannot be changed.
- **Available credits**, shown only when the user's group uses the credit system.
- **Category**: an existing category, **Uncategorized**, or **New category** with a name. A new
  category is created when you save.
- Options: disable the List-Unsubscribe header, disable the suppression check, and disable the
  revenue tracking parameter in links.

::: warning
With the suppression check disabled, campaigns, journeys, transactional and email gateway sends
go to suppressed addresses too, including hard bounces and spam complaints.
:::

### Personal

Website, other email addresses (one per line), street (two lines), city, state or region, postal
code, country, phone, fax, VAT number, and whether the phone number is verified.

### Settings

- **Delivery server**. Keep **User group's delivery server**, or pick a server to send this
  user's email through. Without the DeliveryServers permission the current setting is shown but
  cannot be changed.
- **Default sender domain**. Overrides the group's default sender domain. Leave it empty to use
  the group's.
- **Rate limits**. A JSON document that overrides the user group's sending limits. Leave it empty
  to apply the group's limits. Click **Load group defaults** to start from the selected group's
  limits. Use the buckets `EmailGateway` and `SMS`, each with any of `Minute`, `Hour`, `Day`,
  `Week`, `Month` and `Year`. `-1` means unlimited and `0` blocks sending. For example:

  ```json
  {
    "EmailGateway": { "Hour": 1000, "Day": 10000 },
    "SMS": { "Day": 500 }
  }
  ```

- **Custom email headers**. A JSON document applied to every email the user sends. `Add` sets
  headers and `Remove` lists headers to drop:

  ```json
  {
    "Add": { "X-Campaign": "spring" },
    "Remove": ["X-Mailer"]
  }
  ```

- **Whitelisted email addresses**. One address or regular expression per line. These addresses
  are never added to the suppression list, even after an opt-out or a hard bounce.

The rate limits and custom headers are checked before anything is saved. A mistake is shown under
the editor and nothing is changed.

[[SCREENSHOT: The Settings section of the Edit user page with the delivery server menu, the rate limits JSON editor and its Load group defaults button]]

### Plug-in fields

Enabled plug-ins can add their own settings to the Account and Settings sections, for example
the Amazon SES "Whitelist User" option. Each is labeled with the plug-in it comes from. They are
saved after the account itself.

- If a plug-in refuses a value, the reason appears under that field and no plug-in value is
  saved. The account changes are saved.
- If a plug-in fails while saving, a warning names the field. The account changes are saved, and
  other plug-in values may already be saved too, so check them before you try again.

## Troubleshooting

| Message or symptom | What to do |
|---|---|
| This username is already taken, or Another user already has this email address | Choose a different value. |
| You may not create users in this user group | Pick one of your groups, or ask an administrator for access to the group. |
| Your administrator account cannot list any user group | Ask an administrator for the UserGroups permission or for access to a group. |
| Your license does not allow more user accounts | Delete an unused user or upgrade the license. |
| Limit status is not available yet | The limit job has not run on this install. Clear the limit filter, or wait up to 15 minutes. |
| This filter is not available to an admin account limited to specific user groups | The blocked sender domains filter needs access to every user group. Clear it. |
| You are taken to the sign-in page while saving | Your administrator session ended in Octeth. Sign in again and repeat the change. |
