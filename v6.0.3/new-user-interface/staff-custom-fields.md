# Managing Global Custom Fields in the Staff Area

A **global custom field** is one field for the whole install: every account can use it in its lists, segments, journeys, imports and email personalization, and each account stores its own value for each subscriber. Use it for data every account keeps the same way, such as a customer ID from your own system. The **Custom fields** screens of the staff **Settings** group replace the classic admin **Preferences > Global Custom Fields** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Custom fields | `/user/staff/settings/custom-fields` | CustomFields |
| Create custom field | `/user/staff/settings/custom-fields/new` | CustomFields |
| Edit custom field | `/user/staff/settings/custom-fields/<id>/edit` | CustomFields |

Open it from the staff sidebar: click **Settings**, then **Custom fields**. The classic admin **Preferences > Global Custom Fields** link, and the old `/app/admin/customfields/` addresses, open the same screens.

Each account can still create its own fields on its lists. Those are managed by the account, not here.

## The list

The list shows the global custom fields by name, 25 to a page:

- **Name**, with the field's ID under it.
- **Type**, with the number of options of a choice field, or its validation method.
- **Merge tag**: the code email content uses to insert the value, for example <code v-pre>{{ Subscriber:CustomerID }}</code>.
- **Visibility**, and whether the field is **Required** or **Unique**.

Search by name or merge tag with the search box. Click a row to open the field. The row actions edit and delete it.

### Delete fields

Click the **Delete** icon of a row, or tick several rows and click **Delete**. Before anything is deleted, the confirmation shows, for each field:

- How many **values** are stored in it across every account. Deleting the field deletes all of them.
- **Segments** whose rules use it, with the account that owns each one. A segment with no account is a global segment.
- **Journeys** that use it, and how: they start when the field changes, a Decision step checks it, or a step changes its value.
- **SMS lists** that read their phone numbers from it.

When your account is limited to some user groups, the references of other accounts are not named: the confirmation says how many more there are.

Nothing that uses a field is changed by the delete. A segment that uses it stops working, journey steps that check it no longer match and steps that change it do nothing, and SMS lists that read their phone numbers from it lose their phone field. Change them first if that is not what you want. You can still confirm with **Delete anyway**. A delete cannot be undone.

If Octeth cannot read what uses a field, the confirmation says so. Treat the field as in use.

## Create a field

Click **Create custom field** and fill in three cards.

**Field:**

- **Name**: shown in forms, subscriber profiles and segment rules.
- **Merge tag**: required. It follows the name as you type it ("Customer ID" becomes `CustomerID`) until you change it. Use letters, numbers, spaces, dots, dashes and underscores. Each merge tag can be used by one field only, and the subscriber fields (`SubscriberID`, `EmailAddress`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`, `SubscriptionStatus` and `BounceType`) cannot be used.

**Type and values:**

- **Type**: **Single line text**, **Paragraph text**, **Drop down**, **Multiple choice**, **Checkboxes**, **Date**, **Time** or **Hidden field**.
- **Validation**: what a value must be, for the types other than Date and Time: no validation, numbers, letters, numbers and letters, an email address, a URL, or a **Custom rule**, a regular expression the value must match.
- **Rule (regular expression)**, for a Custom rule: enter the expression without the surrounding slashes, for example `^[A-Z]{2}[0-9]{4}$`. Octeth adds the slashes itself, so slashes you paste around a rule are removed, and escape a `/` inside the rule as `\/`. A rule that is not a valid regular expression is refused when you save.
- **First year** and **Last year**, for a Date field: the range of the year picker in forms.
- **Default value**, for text and hidden fields: shown in the field until a value is entered.
- **Options**, for Drop down, Multiple choice and Checkboxes: a label subscribers see and the value that is stored, per option. Tick **Default** on the options that are selected at first. A Drop down or Multiple choice field holds one value, so tick at most one.

**Access:**

- **Visible to**: **Users only**, or **Users and subscribers**, who can then see and change the value in the subscriber area.
- **Required**: a form cannot be submitted without a value.
- **Unique**: no two subscribers of an account can have the same value.

Click **Create custom field**.

## Edit a field

The edit page is the same form with the field's settings. It says how many values are stored in the field, and your changes apply to every account at once.

### Type and validation are locked once values are stored

Changing a field's type, or its validation method, moves its stored values to another kind of column, and can blank or hide them for every account. So once any value is stored in a field, its **Type** and **Validation** are shown read-only with a note. To store a different kind of value, create a new field and move to it.

Octeth checks this again when you save, so a value stored after you opened the page still blocks the change, and the form says so. If Octeth cannot count the values when the page opens, the page says so and leaves the two settings editable, and the save is refused if values are stored.

## What is recorded

Creating, editing and deleting a field each writes a staff audit row: the settings of a new field, the settings an edit changed, and the deleted ids with what used each one and how many values it stored.

## Related

- [The new user interface](./index)
- [Global custom fields in the API](/v6.0.3/api-reference/customfields#create-a-global-custom-field)
