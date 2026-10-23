# The Staff Plugins Screen

A **plugin** adds a feature or an integration to Octeth, for example a CRM sync or a form spam guard. Plugins live in folders under Octeth's `plugins/` folder, and each one is either enabled or disabled for the whole install. The **Plugins** screen of the staff **Settings** group lists them and enables or disables them. It replaces the classic admin **Settings > Plugins** page.

| Screen | Path on a default install | Permission |
|---|---|---|
| Plugins | `/user/staff/settings/plugins` | Settings |

Open it from the staff sidebar: click **Settings**, then **Plugins**. The classic admin **Settings > Plugins** link, the **Plugins** item of the classic admin menu and the old `/app/admin/plugins/` address open the same screen.

## The list

The list shows every plugin in the `plugins/` folder by name:

- **Plugin**: the plugin's name, with its description under it.
- **Code**: the plugin's folder name, which the API and the configuration use.
- **Minimum version**: the oldest Octeth version the plugin supports.
- **Status**: **Enabled** or **Disabled**. A plugin that needs a newer Octeth than this install also shows **Needs vX**, where X is the version it needs.

The button at the end of a row enables or disables that plugin. A plugin that needs a newer Octeth has no Enable button: upgrade Octeth first.

A plugin's own settings pages, when it has any, stay in the classic admin area.

## Enable a plugin

Click the **Enable plugin** button of its row, then **Enable plugin** in the confirmation. Octeth runs the plugin's install step, which usually creates its tables and default settings, and starts loading it.

## Disable a plugin

::: danger
For most plugins, disabling deletes the plugin's data: the tables and settings it created. Enabling it again installs it from scratch and does not bring that data back.
:::

Click the **Disable plugin** button of its row. The confirmation names the plugin and says what is deleted. Type the plugin's name in the box (the case does not matter) and click **Disable plugin**.

If the plugin has a background worker, for example one listed in a `plugin-*.conf` supervisord file, that worker keeps running until it is restarted. Restart it, or the supervisor container, after disabling the plugin.

Every enable and disable is recorded in the staff audit log with the plugin's code and name.

## Installing, updating and removing plugins

The screen does not install, upload or update plugins. To add a plugin, copy its folder into `plugins/` on the server; it then appears in the list, disabled. To remove one, disable it here first, then delete its folder.

## Coming from the classic Plugins page

- The classic page's switches both toggled the plugin, so a page left open could do the opposite of what it showed. The new screen sets the state shown on the button.
- Disabling now asks for the plugin's name and says that its data is deleted.
- The old `/app/admin/plugins/enable/<code>` and `/app/admin/plugins/disable/<code>` links no longer change anything. They answer with a page that links to the new screen.
- The **Browse plugins** link to the Octeth website is gone.
