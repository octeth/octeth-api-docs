# The Staff SMS Suppression Screen

The **SMS** screen of the staff **Suppression** group lists every phone number and pattern that is suppressed on the install, for every account. A suppressed number receives no SMS in its scope. Use the screen to check why a number gets no messages, to suppress numbers for every account or for one, and to remove a suppression that was added by mistake. It replaces the classic admin **Settings > SMS Suppression List** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| SMS suppression | `/user/staff/sms/suppression` | SMS and Settings |

Open it from the staff sidebar: click **Suppression**, then **SMS**. The classic admin menu item and the old `/app/admin/sms_suppression/` address open the same screen.

## Scopes

Every suppression has a scope, which decides who it applies to:

| Scope | Stops SMS to the number from |
|---|---|
| **System** | Every account on the install |
| **Account** | One account, on all its lists |
| **List** | One list of one account |
| **Gateway** | Every account that sends through one SMS gateway. Octeth writes these when a recipient replies STOP and the reply cannot be matched to an account, because on a shared gateway it could belong to any of them |

## Opt-outs

A suppression whose reason is **Opt-out** was added because the recipient asked for no more SMS: they replied STOP, or used an opt-out link. A gateway row is always an opt-out. These are the rows that most carriers and many laws require you to keep, so removing one asks for a reason first (see [Removing a suppression](#removing-a-suppression)).

## Who sees which rows

An administrator without a user group limit sees every row.

An administrator limited to some user groups sees and changes the system rows and the rows of the accounts in those groups. A gateway row belongs to no account, so it is not shown to them, and a note above the list says so.

## The counts

The tiles above the list count, in your reach. The scope tiles count numbers only, so together they add up to **Numbers**:

- **Numbers**, and how many of them are opt-outs.
- **System**: rows that apply to every account.
- **Accounts and lists**: rows of one account or one list.
- **Gateway**: unattributed STOP replies. Not shown to an administrator limited to user groups.
- **Patterns**: wildcard rules.

## Filtering the list

The **Numbers** and **Patterns** tabs list the numbers and the patterns. Use the toolbar above the list. Each filter applies as you type or choose:

- **Number digits** finds the digits anywhere in the number: `0198` finds `+15550198804`.
- **Any scope** limits the list to **System**, **Account**, **List** or **Gateway** rows.
- **User ID or username** shows the rows of one account. Type its user ID, or the start of its username.
- **List ID** shows the rows of one list.
- **Any reason** limits the list to one reason, for example **Opt-out** or **Complaint**.
- In the second row, **Any source** shows how the rows were added (for example **STOP reply**, **Opt-out link** or **Import**), **Any gateway** shows the gateway rows of one gateway, and the date button limits the list by the date a row was added, in UTC.

**Clear filters** removes every filter. The list shows 50 rows per page. The tab, the filters and the page are part of the address, so you can bookmark or share a filtered view, for example `/user/staff/sms/suppression?reason=optout`.

The refresh button at the right of the toolbar reads the counts and the list again, and shows the time it last read them.

## Reading a row

| Column | What it shows |
|---|---|
| **Number** | The number as it was entered. On the Patterns tab, the pattern. |
| **Scope** | **System**, **Account**, **List** or **Gateway**. |
| **Applies to** | **Every account** for a system row. The account, with its email address, for an account row: click the name to open the account. The list, with its account and ID, for a list row. The gateway for a gateway row. |
| **Reason** | **Manual**, **Opt-out**, **Complaint**, **Bounce**, **Invalid number** or **Other**. A gateway row shows **STOP reply**. Opt-outs are highlighted. |
| **Source** | How the row was added: **STOP reply**, **Opt-out link**, **Manual entry**, **Import**, **API**, or **Legacy admin**. |
| **Notes** | The note added with the row, shortened. Point at it to read it whole. |
| **Added (UTC)** | The date and, under it, the time the row was added. |

## Adding numbers

1. On the **Numbers** tab, click **Add numbers**.
2. Paste the numbers, one per line, or separated by commas. Up to 1,000 at a time. Write them in full international form, for example `+15551234567`.
3. Choose the **Scope**. For **Account**, enter the account's user ID. For **List**, enter the list ID: a list belongs to one account, so its ID is enough. A system suppression stops SMS to the numbers from every account, and the form says so.
4. Choose a **Reason**, and add a note if it helps whoever reads the row later.
5. Click **Add**.

A message then says how many numbers were added, how many were already suppressed in that scope and were left alone, and how many could not be read as a phone number. There is no gateway scope: gateway rows come only from STOP replies.

## Adding a pattern

A pattern suppresses every number it matches, including numbers added later, because it is checked when a message is sent. Use it to block a range, such as premium-rate numbers.

1. On the **Patterns** tab, click **New pattern**.
2. Enter the pattern: `+`, the country code, then digits, with `*` for any run of digits. For example, `+1900*` blocks every number that starts with `+1900`.
3. Choose the **Scope**, as for numbers, and click **Add pattern**.

A pattern needs at least one digit before its first `*`. A pattern such as `+*` would match every number on the install and stop all SMS, so it is refused.

## Removing a suppression

Click the trash icon of a row, or tick several rows and click **Remove** in the bar that replaces the toolbar. A dialog asks you to confirm.

When the rows include an opt-out, the dialog says that it is the recipient's own opt-out and asks for a **Reason for removing**. Removing it lets messages reach someone who asked for none, so do it only with a new consent, for example a signed form. The reason is kept in the staff audit log.

A message then says how many rows were removed. A row that someone else removed in the meantime, or that is outside your user groups, is counted separately.

## Clearing the suppression cache

When a message is sent, Octeth keeps the answer to "is this number suppressed?" for up to an hour. Changes made on this screen take effect at once, but a change made outside Octeth, for example directly in the database, may not until that answer expires. Click **Clear cache**, then confirm, to drop every cached answer so the next check of each number reads the list again. No suppression changes.

## The audit log

Adding numbers or a pattern, removing numbers or patterns, and clearing the cache each write a staff audit row. The row keeps the counts, the scope and, for an opt-out, the reason you typed. It never keeps a phone number, a pattern or a note.

## Related

- [SMS Campaigns](./sms-campaigns)
- [The Staff Inbound SMS Screen](./staff-sms-inbound), where STOP replies are received
- [SMS Suppression API](/v6.0.2/api-reference/sms-suppression#browse-sms-suppressions-admin), the API commands behind the screen
