# Managing User Groups in the Staff Area

A user group sets the limits, permissions and delivery servers of the accounts in it. The staff
area of the new interface has three screens for user groups: the **User groups** list, **Create
user group** and the group's Edit page. They replace the classic admin **User Groups** list and
its create and edit pages.

| Screen | Path on a default install | Permission |
|---|---|---|
| User groups list | `/user/staff/user-groups` | UserGroups |
| Create a user group | `/user/staff/user-groups/new` | UserGroups. Not available to a sub-administrator limited to some user groups |
| Edit a user group | `/user/staff/user-groups/<id>/edit` | UserGroups |

::: info
The staff screens act as the administrator who is signed in. A sub-administrator limited to some
user groups sees, opens and edits only those groups, and has no create, duplicate or delete
action: Octeth refuses those for such an account.
:::

## The User groups list

Choose **Accounts**, then **User groups** in the left menu. Each row shows:

- **Name**. Click the row to open the group's Edit page.
- **Users**: the number of accounts in the group. Click it to open the **Users** list filtered by
  that group. The link needs the Users and User.Browse permissions.
- **Delivery servers**: the server assigned to **Marketing**, **Transactional** and **Auto
  responder** email, or **Not assigned** when the group uses the system send method for that
  channel.
- **Send method**: System, SMTP with its host, or the stored method (for example PowerMTA).
- **ID**.

Type in the **Search user groups** box to filter by name or ID. Click the **Name**, **Users** or
**ID** column header to sort, and click it again to reverse the order.

The **Create user group** button opens the page described in
[Create a user group](#create-a-user-group).

## Create a user group

Open **User groups** and choose **Create user group**. The page has four parts.

- **General.** The **Name** and the **Subscriber area logout URL** are required. When a billing
  plug-in offers subscription plans, choose the **Subscription plan** and whether new sign-ups on
  that plan join this group. Only one group can be the default of a plan. Turn on **This is a
  trial group** to set the **Trial length in days**.
- **Limits.** Subscribers, lists, campaigns per month, emails per month, per day and in the
  account's lifetime, email gateway sender domains, and the import and send approval thresholds.
  0 or empty means unlimited. **Rate limits** is a JSON document with the `EmailGateway` and
  `SMS` buckets. **Load defaults** fills it with the default buckets, and an empty field stores
  the defaults.
- **Sending.** **System** sends through the install's delivery settings. **Custom SMTP server**
  asks for the SMTP host, port, security, timeout and, with authentication on, a username and
  password. A test email is sent to your address first, and the group is not created when it
  cannot be sent.
- **Permissions.** What users of the group can do, by section, with **All** and **None** per
  section and **Select all** and **Select none** for the whole list. The plug-in section grants
  each enabled plug-in.

Click **Create user group** at the bottom of the page.

The new group uses the install's default theme. The delivery servers, headers and footers, sender
domain options, AI assistant limits and sender screening are set on the Edit page once the group
exists.

## Edit a user group

Choose a group in the list. The Edit page has six sections in the menu on the left. Each one has
its own save button, for example **Save general settings**, and changes nothing outside it, so an
unsaved change in another section is not sent.

- **General.** Name, subscriber area logout URL, plan and plan default, trial, user area logout
  URL, the **Links in every email** options (require an unsubscribe link, require a reject link in
  opt-in confirmations, require double opt-in on every list) and the **Campaigns** options (show
  email throughput, simplified campaign creation, block campaigns with a SpamAssassin score).
- **Sending.** The send method, a delivery server for campaigns, transactional emails and auto
  responders, the X-Mailer header, the plain text and HTML headers and footers, the sender domain
  options, the default sender domain with its monthly limit, the email gateway and campaign DNS
  templates (a template once chosen can be changed but not cleared here), the email gateway
  options (including **Track opens on new sender domains** and **Track clicks on new sender
  domains**), and the custom email headers as JSON.
- **Limits.** The same fields as on the Create page.
- **Permissions.** Only the permissions you turn on or off are changed. A permission of a plug-in
  that is disabled today is kept.
- **AI and screening.** What AI assistants of the group's users may do (not connect at all, read
  only, read and change data, or also send), sends per day, recipients per send and the size above
  which a send must be confirmed. Under **Sender screening**, the threshold (0 to 100) and action
  for sign-ups, imports and campaign content.
- **Team members.** How many people each account of the group can invite to sign in with their own
  email address and role, and whether every one of them must use two-factor authentication.

### Tracking on new sender domains

Open and click tracking are set per sender domain. Under **Email gateway** in the Sending
section, **Track opens on new sender domains** and **Track clicks on new sender domains** set what
a sender domain starts with when an account of the group adds it. Both are on for every group
that has never changed them, which is how Octeth has always created domains.

Turn them off for a group that sends transactional email, such as password resets and
invitations, so new domains do not add a tracking pixel or rewrite links. The setting applies to
domains added from then on, by the account in the new interface or the classic user area, with
the API, or when the default sender domain is used. Domains that already exist keep their own
setting, and the account can still turn tracking on or off for each domain. An API call that
sends `LinkTracking` or `OpenTracking` when it creates a domain uses that value instead.

### Send method

The Edit page edits two send methods: **System** and **Custom SMTP server**.

- With SMTP the password field is always empty. When a password is stored, the hint says so:
  leave the field empty to keep it. The stored password is kept only while the host stays the
  same, so changing the host asks for the password again. Switching to System removes the stored
  password.
- **Send a test email to me before saving** is ticked by default. When the test email cannot be
  sent, the mail server's answer is shown under **SMTP test failed** and nothing is saved.
- A group stored with Local MTA, PowerMTA, PHP mail(), Save to disk or an SMTP provider preset
  (Octeth, SendGrid, Mailgun, Mailjet, Postmark or Amazon SES) shows the stored method and its
  settings read-only, and the send method reads **Keep current**. Saving the section with **Keep
  current** leaves the method as it is. To change it, switch to System or Custom SMTP server.
  Other methods can still be set with the API.

### Team members

**Seats per account** is how many team members each account of the group can have. Suspended
members and invitations that are still pending count as seats. The account owner does not.

- **0** turns team members off for the group. The account owner cannot send invitations, and every
  member who is signed in to an account of the group is signed out the next time they do anything.
  Their memberships are kept, so raising the number again lets them back in.
- **Lowering the number** below the seats already in use removes no one. It only stops new
  invitations until members are removed or invitations expire.

**Require two-factor authentication from every member** signs out every member who has not set up
two-factor authentication. They must set it up before they can open the account again. Members who
already use it are not affected, and neither is the account owner's own sign-in.

When billing is on, a plan's seats come from the user group the plan puts the account in, so set
them here on that group.

The section shows a short notice instead of the fields until the database migrations of this
version have run.

### Not carried over from the classic screen

- The **User interface** tab (theme template, colours and product name). Existing theme settings
  stay as stored.
- The **Payment settings** tab. Stored payment and credit settings stay as stored, because the new
  screens never send them.
- **Save As**. Use duplicate in the list, then edit the copy.

## Duplicating a user group

Click the duplicate icon on a row. The copy is named "Duplicate of" followed by the original name,
gets its own copy of the theme, and is never the default group of a subscription plan. The copy
opens on its Edit page so you can rename it. This replaces the classic **Save As** button.

## Deleting a user group

Click the trash icon on a row. The dialog shows how many users the group has.

- A group with users needs a destination: choose it under **Move its users to**. The users take
  on that group's limits, permissions and delivery servers.
- A group with no users is deleted without asking for one.

Click **Delete user group** to confirm. The dialog refuses the delete, and names the reason, when
the group is:

- linked to a billing plan of the new interface (any role),
- the signup, suspended or cancelled group in **Billing > Settings**,
- the default group of the new interface (`OCTETH_DEFAULT_USER_GROUP_ID`),
- the signup group of the classic settings, or one of the groups new signups can choose,
- the only user group you can reach.

Point those settings at another group first, then delete it. A deleted group cannot be restored.
There is no bulk delete: each group with users needs its own destination.
