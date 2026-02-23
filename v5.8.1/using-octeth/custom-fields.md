---
layout: doc
---

# Custom Fields

Custom fields allow you to store additional subscriber data beyond the default email address. By defining your own fields — such as first name, country, birthday, or product preference — you can collect richer subscriber information and use it for personalization, segmentation, and targeted campaigns.

This article covers how to browse, create, edit, and manage custom fields, including field types, validation, presets, and how custom fields integrate with other Octeth features.

## What Are Custom Fields?

Every subscriber list in Octeth comes with a default set of system fields: email address, subscription date, subscription status, and bounce type. Custom fields extend this data model by letting you define your own fields to capture any additional information you need.

Custom fields exist in two scopes:

- **List-specific fields** — Belong to a single subscriber list. The field and its data are only available within that list.
- **Global fields** — Shared across all lists. A global field stores data per subscriber email address and can be accessed from any list.

Additionally, system administrators can create **system-wide global fields** from the admin panel. These fields are available to all user accounts and all lists across the entire Octeth installation.

Custom field values are stored per subscriber. When a subscriber is added to a list — whether through a subscription form, import, or manual entry — custom field values can be populated alongside the email address.

## Custom Field Types

Octeth supports eight field types, each designed for a different kind of data input:

| Field Type | Description | Example Use |
|---|---|---|
| **Single line** | A short text input field. | First name, company name, phone number |
| **Paragraph text** | A multi-line text area for longer content. | Notes, feedback, bio |
| **Multiple choice** | Radio buttons allowing the subscriber to pick one option. | Preferred contact method, satisfaction rating |
| **Drop down** | A dropdown select menu allowing the subscriber to pick one option. | Country, department, product interest |
| **Checkboxes** | Checkboxes allowing the subscriber to select multiple options. | Interests, newsletter topics, preferred days |
| **Date field** | A date picker with day, month, and year selectors. | Birthday, anniversary, renewal date |
| **Time field** | A time picker with hour and minute selectors. | Preferred contact time |
| **Hidden field** | A field that does not appear on subscription forms. | Internal tracking IDs, source codes, campaign tags |

::: tip
Choose the field type based on how you want subscribers to provide the data. For fields with a fixed set of choices, use **Drop down** or **Multiple choice**. For open-ended input, use **Single line** or **Paragraph text**.
:::

## Browsing Custom Fields

To view the custom fields for a list:

1. Navigate to the subscriber list you want to work with.
2. Click **Custom Fields** in the left sidebar navigation.

The **Browse** tab displays all custom fields defined for the list, including both list-specific and global fields.

[[SCREENSHOT: Custom fields browse tab showing a list of fields with checkboxes, field names, global badges, and field IDs]]

### Custom Fields Table

Each row in the table represents a custom field and displays:

| Column | Description |
|---|---|
| **Checkbox** | Select individual fields for bulk actions. System-wide global fields created by the administrator do not have a checkbox. |
| **Field Name** | The name of the custom field. Click to open the field for editing. Fields marked as global display a **Global** badge next to the name. |
| **Field ID** | The unique numeric identifier for the field, used internally and in merge tags. |

### Available Actions

From the browse tab toolbar, you can:

- **Select All / Select None** — Quickly select or deselect all fields.
- **Delete Custom Fields** — Delete the selected fields (see [Deleting Custom Fields](#deleting-custom-fields)).
- **Copy Custom Fields** — Copy field definitions from another list (see [Copying Custom Fields from Another List](#copying-custom-fields-from-another-list)).
- **Presets** — Create fields from predefined templates (see [Using Presets](#using-presets)).

## Creating a Custom Field

To create a new custom field:

1. Navigate to the subscriber list where you want to add the field.
2. Click **Custom Fields** in the left sidebar navigation.
3. Click the **Create** tab.

[[SCREENSHOT: Custom field creation form showing the field name input, field type dropdown, and configuration options]]

4. Enter a **Field Name** — choose a descriptive name that clearly identifies the data being collected, such as "First Name", "Country", or "Date of Birth".

5. Select a **Field Type** from the dropdown. The form dynamically adjusts to show relevant options based on the selected type.

6. Configure type-specific options:

   - **For Multiple choice, Drop down, and Checkboxes:** An options editor appears where you can define the available choices. For each option, enter a **Label** (what the subscriber sees) and a **Value** (what gets stored). Check the selection box next to any option that should be pre-selected by default.

   - **For Date field:** A year range selector appears. Enter the **start year** and **end year** to define the range of years available in the date picker.

7. Enter a **Default Value** (optional) — this value is automatically assigned to the field when no other value is provided.

8. Enter a **Merge Tag Alias** (optional) — a custom identifier you can use instead of the default <code>CustomField{ID}</code> tag when personalizing emails. For example, setting the alias to <code>FirstName</code> lets you use <code v-pre>{{ Subscriber:FirstName }}</code> in your email content.

::: warning
Merge tag aliases must be unique within the list and can only contain letters, numbers, hyphens (`-`), underscores (`_`), and periods (`.`). The following reserved names cannot be used as aliases: `SubscriberID`, `EmailAddress`, `SubscriptionDate`, `SubscriptionIP`, `OptInDate`, `SubscriptionStatus`, `BounceType`.
:::

9. Select a **Validation Method** to control what kind of data subscribers can enter (see [Validation Methods](#validation-methods) for details).

10. If you selected **Custom** as the validation method, enter a **Validation Rule** — a regular expression pattern that the input must match.

11. Choose the **Visibility** setting:

    - **User Only** — The field is only visible to account users in the Octeth interface. It does not appear on public subscription forms or the subscriber preference center.
    - **Public** — The field appears on subscription forms and the subscriber preference center, allowing subscribers to see and fill in the value.

12. Configure the additional checkboxes:

    - **Required field** — When checked, this field must have a value when a subscriber is added through a subscription form. Empty values are rejected.
    - **Unique field** — When checked, each subscriber in the list must have a unique value for this field. Duplicate values are rejected.
    - **Global field** — When checked, this field becomes a global field shared across all lists. Global fields store values per email address rather than per list subscription.

13. Click **Save** to create the custom field.

::: tip
If you need to collect data that subscribers should not see or modify — such as a lead source or internal score — set the field type to **Hidden field** and the visibility to **User Only**.
:::

## Editing a Custom Field

To edit an existing custom field:

1. Navigate to the subscriber list containing the field.
2. Click **Custom Fields** in the left sidebar navigation.
3. In the **Browse** tab, click the field name you want to edit.

The **Edit** tab opens with the same form used during creation, pre-populated with the current field settings. Modify the desired properties and click **Save** to apply your changes.

[[SCREENSHOT: Custom field edit form showing pre-populated field settings]]

::: warning
A global field cannot be converted back to a list-specific field. If you need a list-specific version, delete the global field and create a new list-specific field instead.
:::

## Deleting Custom Fields

To delete one or more custom fields:

1. Navigate to the subscriber list containing the fields.
2. Click **Custom Fields** in the left sidebar navigation.
3. In the **Browse** tab, select the fields you want to delete using the checkboxes.
4. Click **Delete Custom Fields** in the toolbar.
5. Confirm the deletion when prompted.

::: danger
Deleting a custom field is permanent and cannot be undone. All subscriber data stored in the deleted field is permanently removed. This includes field values for every subscriber in the list.
:::

::: info
System-wide global fields created by the administrator cannot be deleted by regular users. These fields do not display a checkbox in the browse table.
:::

## Copying Custom Fields from Another List

If you have already configured custom fields on one list and want to use the same fields on another list, you can copy the field definitions.

1. Navigate to the target list where you want to add the fields.
2. Click **Custom Fields** in the left sidebar navigation.
3. Click **Copy Custom Fields** in the browse tab toolbar.
4. Select the **Source List** from the dropdown — this is the list you want to copy fields from.
5. Click **Copy**.

[[SCREENSHOT: Copy custom fields page showing the target list name and source list dropdown]]

::: info
Copying fields duplicates the field definitions (name, type, options, validation settings) but does not copy subscriber data values. The new fields are created empty on the target list.
:::

## Using Presets

Presets are predefined field templates that let you quickly create custom fields with common option sets. Instead of manually typing each option, you can select a preset and Octeth creates the field with all options pre-configured.

1. Navigate to the subscriber list where you want to add the field.
2. Click **Custom Fields** in the left sidebar navigation.
3. Click **Presets** in the browse tab toolbar.
4. Select a **Preset** from the dropdown.
5. Click **Create**.

[[SCREENSHOT: Presets page showing the preset dropdown with available categories]]

### Available Presets

The following preset categories are available:

| Preset | Description |
|---|---|
| **Gender** | Common gender identity options. |
| **Age** | Age range brackets. |
| **Employment** | Employment status options. |
| **Income** | Income range brackets. |
| **Education** | Education level options. |
| **Days of the week** | Monday through Sunday. |
| **Months of the year** | January through December. |
| **U.S. states** | All 50 United States. |
| **Continents** | The seven continents. |
| **Satisfaction** | Satisfaction scale from Very Satisfied to Very Unsatisfied. |
| **Importance** | Importance scale from Very Important to Not at all Important. |
| **Agreement** | Agreement scale from Strongly Agree to Strongly Disagree. |
| **Comparison** | Comparison scale from Much Better to Much Worse. |
| **Country** | A comprehensive list of countries with country codes. |

::: tip
Presets are a fast way to set up commonly used option fields. After creating a preset field, you can edit it to customize the field name, add or remove options, and adjust other settings.
:::

## Field Properties Reference

The following table summarizes all configurable properties for a custom field:

| Property | Description |
|---|---|
| **Field Name** | The display name shown to users and on forms. Maximum 250 characters. |
| **Field Type** | The input type that determines how data is collected (see [Custom Field Types](#custom-field-types)). |
| **Default Value** | A pre-filled value assigned when no other value is provided. Maximum 250 characters. |
| **Merge Tag Alias** | A custom identifier for use in email personalization merge tags. Must be unique per list. |
| **Validation Method** | The validation rule applied to subscriber input (see [Validation Methods](#validation-methods)). |
| **Validation Rule** | A custom regular expression pattern, used only when the validation method is set to Custom. |
| **Visibility** | Controls whether the field appears on public forms (**Public**) or is internal only (**User Only**). |
| **Required** | When enabled, the field must have a value on subscription forms. |
| **Unique** | When enabled, each subscriber must have a distinct value for this field. |
| **Global** | When enabled, the field is shared across all lists and stores values per email address. |

### Validation Methods

Validation methods control what kind of data is accepted when subscribers fill in a custom field value:

| Method | Accepted Input |
|---|---|
| **Disabled** | No validation. Any value is accepted. |
| **Numbers** | Numeric characters only (0-9). |
| **Letters** | Alphabetic characters only (a-z, A-Z). |
| **Numbers and letters** | Alphanumeric characters only. |
| **Email address** | A valid email address format. |
| **URL** | A valid URL starting with `http://` or `https://`. |
| **Custom** | A custom regular expression pattern that you define in the **Validation Rule** field. |

::: tip
Use validation methods to maintain clean data. For example, set a phone number field to **Numbers** to prevent subscribers from entering letters, or use a **Custom** regex pattern to enforce a specific format.
:::

### Visibility Options

The **Visibility** setting determines where the field appears:

- **Public** — The field is displayed on subscription forms generated by Octeth and in the subscriber preference center where subscribers can update their own data. Use this for information you want subscribers to provide or manage themselves, such as name, interests, or preferences.
- **User Only** — The field is only visible within the Octeth interface to account users. It does not appear on any public-facing forms. Use this for internal data such as lead scores, source tracking, or administrative notes.

## Using Custom Fields in Email Personalization

Custom fields can be inserted into email content as merge tags. When an email is sent, Octeth replaces merge tags with the actual subscriber data for each recipient.

The merge tag format for custom fields is:

```
{{ Subscriber:CustomField{ID} }}
```

If a merge tag alias is defined for the field, you can use the alias instead:

```
{{ Subscriber:FirstName }}
```

Merge tags work in email subject lines, email body content, autoresponder messages, and journey email templates.

**Example:**

If you have a custom field named "First Name" with the merge tag alias `FirstName`, you can write:

```
Hello {{ Subscriber:FirstName }}, here are your weekly updates.
```

Each subscriber receives a personalized version with their own first name inserted.

::: tip
You can use output modifiers with merge tags. For example, <code v-pre>{{ Subscriber:FirstName|"Subscriber" }}</code> provides a fallback value of "Subscriber" when the field is empty. See the [Email Personalization](./email-personalization) article for the full list of modifiers.
:::

## Using Custom Fields in Segments

Custom fields are available as rule criteria in the segment builder. When creating a segment, you can add rules that filter subscribers based on their custom field values.

For example, you can create a segment for subscribers whose "Country" custom field equals "United States", or whose "Age" field contains "25-34".

The available operators depend on the field type:

- **Text fields** — Is, Is not, Contains, Does not contain, Begins with, Ends with, Is set, Is not set.
- **Date fields** — Is, Is not, Is before, Is after, In the last X days, Between, and more.
- **Number fields** — Equals to, Is greater than, Is smaller than.

For details on building segment rules, see the [Segments](./segments) article.

## Using Custom Fields in Subscription Forms

Custom fields with **Public** visibility are automatically available when generating subscription form HTML code in Octeth. These fields appear on the form with the appropriate input type based on the field configuration:

- **Required** fields are enforced during form submission — subscribers cannot complete the subscription without filling in these fields.
- **Validation rules** are applied to ensure submitted data matches the expected format.
- **Hidden fields** allow you to pass values silently without displaying an input to the subscriber.
- **Default values** are pre-filled in form inputs when no other value is provided.

::: info
Fields with **User Only** visibility do not appear on subscription forms. If you need a field on the form, set its visibility to **Public**.
:::

## Using Custom Fields in Imports

When importing subscribers from a CSV or text file, custom fields appear as available mapping targets during the field mapping step. You can map columns from your import file to the corresponding custom fields in the list.

For example, if your CSV file has a "Company" column and your list has a "Company" custom field, you can map them together so the imported values are stored in the correct field.

For details on importing subscribers, see the [Subscribers](./subscribers) article.

## Global Custom Fields (Admin)

System administrators can create and manage global custom fields that are available across all user accounts and all subscriber lists in the Octeth installation.

### Accessing Global Custom Fields

Navigate to **Admin** > **Custom Fields** to access the global custom fields management page.

[[SCREENSHOT: Admin global custom fields page showing the browse tab with system-wide global fields]]

### Managing Global Custom Fields

The admin global custom fields page works similarly to the list-level custom fields page, with **Browse**, **Create**, and **Edit** tabs.

**Creating a global custom field:**

1. Click the **Create** tab.
2. Fill in the field properties (field name, field type, options, validation, visibility).
3. Click **Save**.

All global custom fields created from the admin panel are automatically available across every user account and subscriber list in the system.

**Editing a global custom field:**

Click the field name in the browse tab to open the edit form. Modify the desired properties and click **Save**.

**Deleting a global custom field:**

Select the fields you want to delete using the checkboxes and click **Delete Custom Fields**.

::: warning
Deleting a global custom field removes the field and all associated subscriber data across the entire system. This action affects all user accounts and cannot be undone.
:::

::: info
Regular users cannot edit or delete system-wide global fields created by the administrator. These fields appear in the user's custom field list but without a checkbox or edit link.
:::

## Tips and Best Practices

::: tip Use Merge Tag Aliases
Assign a meaningful merge tag alias to every custom field you plan to use in emails. An alias like `FirstName` is much easier to read and remember than `CustomField42` when writing email content.
:::

::: tip Validate Your Data
Apply appropriate validation methods to ensure clean, consistent data. For fields that expect a specific format — such as phone numbers or postal codes — use the **Custom** validation method with a regular expression pattern.
:::

::: tip Use Visibility Wisely
Set internal tracking fields (lead source, campaign tag, score) to **User Only** visibility. Reserve **Public** visibility for fields that subscribers should see and fill in themselves.
:::

::: tip Start with Presets
If you need common fields like Country, Gender, or Satisfaction rating, use the presets feature to create them instantly. You can always customize the field after creation.
:::

::: tip Plan Your Fields Before Creating Them
Think about what subscriber data you need before creating custom fields. Consider which fields will be used for segmentation, which for personalization, and which are for internal tracking. This helps you choose the right field type, validation, and visibility settings from the start.
:::
