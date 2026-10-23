# Routing Segments Through Delivery Servers

A **segment routing rule** (a global segment) sends the subscribers who match its rules through a delivery server you choose, per user group. It applies to campaigns, autoresponders and transactional email of every account in those user groups. Use it, for example, to send every Gmail address of one user group through a dedicated IP pool. Accounts never see these segments. The **Segment routing** screens of the staff **Delivery** group replace the classic admin **Preferences > Global Segments** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Segment routing | `/user/staff/settings/global-segments` | Settings.Segments |
| Create segment routing | `/user/staff/settings/global-segments/new` | Settings.Segments |
| Edit segment routing | `/user/staff/settings/global-segments/<id>/edit` | Settings.Segments |

Open it from the staff sidebar: click **Delivery**, then **Segment routing**. The classic admin **Preferences > Global Segments** link, and the old `/app/admin/segments/` addresses, open the same screens.

A subscriber who matches no segment routing rule is sent through the delivery server of the account's user group, as usual.

When a subscriber matches more than one segment routing rule, the one created first (the lowest ID) among those with a delivery server for the account's user group is used. A segment without a delivery server for that user group is skipped, so it never stops a later segment from routing the subscriber. The list shows the segments in this order.

## The list

The list shows every segment routing rule, oldest first, the order in which they are tried:

- **Name**, with the segment's ID under it.
- **Rules**: whether all rules or any rule must match, and how many rules there are.
- **Routing**: how many user groups the segment routes, or **Not routed**.
- **Matching subscribers**: how many subscribers match, counted across all lists every 10 minutes, with the time of the last count. A new segment shows **Not counted yet** until the next count.

Search by name with the search box. Click a row to open the segment. The row actions edit and delete it.

### Delete segments

Click the **Delete** icon of a row, or tick several rows and click **Delete**. Before anything is deleted, the confirmation lists the routing that stops, one user group and its delivery server per line. When your account is limited to some user groups, the routing of the other groups is counted, not named.

After the delete, the matching subscribers of those user groups go back to their group's own delivery server. A delete cannot be undone.

## Create a segment

Click **Create segment routing** and fill in three cards.

**Segment:**

- **Name**: only staff see it.
- **Match**: **All rules** or **Any rule**. Rules inside a group combine the other way: with **All rules**, a group matches when any one of its rules matches, and with **Any rule**, a group matches when all of its rules match.

**Rules:** each rule is a field, a condition and a value. Click **Add**, then **Rule** to add one, or **Group** to add a group of rules. Groups cannot hold other groups.

- **Subscriber** fields: email address, subscriber ID, subscription status, bounce type, subscription date, opt-in date and subscription IP.
- **Global custom fields**: every field on the [Custom fields](./staff-custom-fields) screen. A choice field offers its options as values.
- **Activity**: **Opened any campaign** and **Clicked in any campaign**, at least, at most or exactly a number of times, in the last number of days or of emails sent (a new rule starts at 30 days, and 0 counts as 1). A click rule can also name a link: only clicks on that exact link URL count. Activity rules cannot go inside a group.
- Date conditions such as **In the last X days** take a number of days. Other date values take a date as `YYYY-MM-DD`, or `TODAY`, `NOW`, `TODAY-7 days` and similar.

A segment needs at least one rule: a segment without rules would match every subscriber. A value is saved exactly as entered, spaces before or after it included. A value cannot contain the sequences Octeth uses to store rules (`,,,`, `]||[`, `,::,`, `,#,`, `!))`, `((!`, `[[` and `]]`).

**Delivery routing:** one row per user group. Turn a group on, then choose its **delivery server**. **The user group's own delivery server** keeps the group's server for these subscribers, which is useful to exempt a group while the segment exists. When your account is limited to some user groups, only those are listed.

Running send processes pick up routing changes after they restart.

Click **Create segment routing**.

## Edit a segment

The edit page is the same form with the segment's settings. Saving changes the segment for the next emails sent to the user groups it routes.

- If you change only the name, the match or the routing, the stored rules are kept exactly as they were and are not checked again.
- A rule this form cannot edit is shown locked, with **Kept as stored**, and saving keeps it unchanged. That covers a **Subscriber list ID** rule saved with the classic page, a rule on a field that no longer exists, an activity rule on one specific campaign or without a period, and a stored value this form would refuse, such as an empty value.
- When your account is limited to some user groups, the routing of the other groups is kept when you save, and the form says how many there are.

## What is recorded

Creating, editing and deleting a segment each writes a staff audit row: the name, the match, how many rules and groups there are and the fields they use, and the routing by user group. An edit records what changed. Rule values are not recorded.

## Related

- [The new user interface](./index)
- [Managing Delivery Servers in the Staff Area](./staff-delivery-servers)
- [Global segments in the API](/v6.0.4/api-reference/segments#get-global-segments)
