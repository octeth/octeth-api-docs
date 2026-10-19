# The Staff Logs Screen

**Logs** lists the log files of this install and lets you read the last lines of one, download it whole, or empty it. It replaces the classic admin **Log Observer**.

| Screen | Path on a default install | Permission |
|---|---|---|
| Logs | `/user/staff/logs` | Settings |

Open it from the staff sidebar: click **Administration**, then **Logs**. The classic admin **Settings > Logs** link, and the old `/app/admin/logobserver/` address, open the same screen.

::: warning
Log files can hold request parameters, email addresses and other personal data. Only administrators with the Settings permission can open this screen, and every download and every emptied file is recorded in the staff audit log.
:::

## Log files

The **Log files** card lists the files that changed recently, newest first:

- **Name**: the file name.
- **Source**: **Application Logs** (`data/logs`) or **System Logs** (`system/storage/logs`).
- **Type**: the name without its date, for example `errors` for `errors-2026-10-18.log`.
- **Size** and **Modified**.

Choose **7 days**, **30 days** or **90 days** at the top right of the card to change how far back the list goes. The default is 30 days. Type in **Search log files** to narrow the list by name, type or source.

Only the files directly inside the two log folders are listed. Nothing else on the server can be opened from this screen.

## Read a log file

Click a file, or its eye icon, to open it above the list. The card shows the last 100 lines in a scrollable box. Long lines are kept on one line: scroll sideways to read them.

- Choose **100 lines**, **500 lines** or **1,000 lines** to see more.
- Click **Refresh** to read the file again. The list is refreshed too.
- Open the **…** menu and click **Close** to close the file.

When the last lines are very long, only the last 1 MB is shown and a notice says so. Download the file to read all of it.

## Download a log file

Click **Download** in the open file's card, or the download icon in the file's row. The whole file downloads under its own name. A file that keeps growing while it downloads is saved as it was when the download started.

## Empty a log file

1. Open the file.
2. Open the **…** menu and click **Empty this file**.
3. Click **Empty file** to confirm.

Everything in the file is deleted and cannot be recovered, so download it first if you may need it. The application keeps writing new lines to the same file. Emptying a file is not available in demo mode.
