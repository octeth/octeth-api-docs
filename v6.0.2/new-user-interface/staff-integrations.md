# Staff Integrations

**Integrations** holds the install-wide settings for Google Analytics and the Stripo email builder. It replaces the Google Analytics and Stripo tabs of the classic admin **Settings > Integrations** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Integrations, Google Analytics section | `/user/staff/settings/integrations` | Settings |
| Integrations, Stripo section | `/user/staff/settings/integrations?section=stripo` | Settings |

Open it from the staff sidebar: click **Settings**, then **Integrations**. The **Integrations** link of the classic admin **Settings** sidebar opens the same screen.

Each section has its own **Save** button and saves only its own settings. When nothing in a section changed, saving says so and sends nothing.

::: info
Every save, every **Disconnect Stripo** and every **Check connection** is recorded in the staff audit log, with the section and the names of the settings involved. Values, keys and secrets are never recorded.
:::

The Unlayer settings of the classic email builder, and the tabs plugins such as TCPAProtect, IP Monitor and Cleanify add, stay on the classic admin page, now named **Integrations (legacy builders and plugins)** (`/app/admin/integration/`).

## Google Analytics

Octeth adds `utm_source` and `utm_medium` tags to the tracked links of a campaign that has Google Analytics tracking set, so Google Analytics can attribute the visits. See [Google Analytics Integration](/v6.0.2/using-octeth/integrations/google-analytics).

- **Source (utm_source)**: where the visit came from, for example `newsletter`.
- **Medium (utm_medium)**: the kind of channel, for example `email`.

Both are optional, up to 250 characters each. Click **Save Google Analytics settings**.

::: warning
These tags apply to campaigns that have Google Analytics tracking set, which are campaigns made in the classic user area and through the API. Emails made in the new interface use their own UTM options instead. A change also applies to the links of campaigns already sent.
:::

## Stripo

Stripo is the drag-and-drop email builder of both the classic and the new interface. See [Stripo Email Builder Integration](/v6.0.2/using-octeth/integrations/stripo-email-builder) for the Stripo account you need.

### Stripo email builder

The pill next to the title says **Connected** when a plugin ID and a secret key are both stored. Both email builders offer Stripo only while both are set.

- **Plugin ID**: shown in your Stripo account under the plugin's settings.
- **Secret key**: write-only. When one is stored, the field is named **Replace secret key** and says **A secret key is stored**. The stored key is never shown. Leave the field blank to keep it, or enter a new one to replace it.

Click **Save Stripo settings**. When the plugin ID or the secret key changed, Octeth checks the pair with Stripo first and saves nothing if Stripo rejects it.

**Check connection** asks Stripo whether it accepts the plugin ID and secret key, without saving anything. It uses what you entered, and the stored value for a field you left blank, so you can check the stored pair without typing the secret key. The answer appears under the fields: accepted, rejected, or Stripo could not be reached from the server. Checks are limited to five a minute.

**Disconnect Stripo** turns Stripo off. It asks you to confirm, then clears the stored plugin ID and secret key, and both email builders stop offering Stripo until a new pair is saved. The template gallery keys stay. To turn Stripo off, use Disconnect: emptying the **Plugin ID** field and saving is refused.

### Template gallery keys

The template gallery of the classic email builder loads templates from a Stripo project, with that project's API key, per user. The card shows **Users with a key** and their **User IDs**. The keys themselves are never shown.

To change the keys, paste a JSON object of user ID and project API key into **Replace the key list** and save:

```json
{
  "12": "project-api-key-for-user-12",
  "31": "project-api-key-for-user-31"
}
```

::: warning
A filled list replaces the whole stored list. Include every user who should keep a key, because the stored keys cannot be read back here. `{}` removes every key. Leave the field blank to keep the stored list.
:::

The screen refuses anything that is not a JSON object of keys, such as a JSON array, and Octeth refuses a list too large for its settings storage. When the stored list cannot be read (for example it was cut short when saved in an earlier version), the card says so: the gallery then shows nothing to anyone until you paste a corrected list.
