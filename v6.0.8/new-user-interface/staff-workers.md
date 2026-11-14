# The Staff Workers Screen

**Workers** lists the background workers registered on this install: the programs that send campaigns, run journeys, import and export lists, deliver webhooks and record opens and clicks. It shows how many copies of each worker run and when each last checked in, and it can clear the entries of workers that stopped. It replaces the classic admin **Processes** page. Nothing on this screen starts, stops or restarts a worker.

| Screen | Path on a default install | Permission |
|---|---|---|
| Workers | `/user/staff/workers` | Processes |

Open it from the staff sidebar: click **Administration**, then **Workers**. The classic admin no longer links to it, but the old `/app/admin/processes/` address opens this screen. A request to the old page's clear action, or a form posted to it, is refused and changes nothing.

## How a worker checks in

Every worker adds itself to a list when it starts and updates its entry, called a ping, every few seconds while it works. When a worker stops cleanly it removes itself. A worker that crashes or is killed leaves its entry behind, and that entry stops being updated.

A worker that has not pinged for **10 minutes** is marked **Stale**.

::: tip
Some workers wait on a queue, for example the open and click loggers. They ping only when work arrives, so on a quiet install they can show as stale while they are still running. Check the process with `/opt/octeth/cli/octeth.sh backend:status` before you assume it has stopped.
:::

## The worker list

The **Workers** card has one row per type of worker:

- **Worker**: the name of the worker, with its internal name under it.
- **Instances**: how many copies of it are registered.
- **Last ping**: how long ago the most recent copy pinged. Point at it to see the exact date and time, in UTC.
- **Status**: **Running**, or **Stale** when no copy has pinged for 10 minutes.

Stale workers are listed first, and a notice above the card names them.

Click the **instances** button at the end of a row to see each copy of that worker:

- **PID**: the process ID on its server.
- **Host**: the server or container it runs on.
- **Running for**: how long ago it started. Point at it to see the start time.
- **Last ping**: how long ago this copy pinged.
- **Memory (MB)**: the memory it used at its last ping. Point at it to see the peak.
- **Status**: **Running** or **Stale**.

The time next to the refresh button shows when the list was read. Click the refresh button to read it again. The list does not refresh on its own.

## Clear stale workers

Clearing removes the entries of workers that have not pinged for 10 minutes. It does not stop or restart anything.

1. Click **Clear stale**. The button is disabled when no entry is stale.
2. Click **Clear stale** in the dialog to confirm.

A message says how many entries were removed, and the list is read again. Every clear is recorded in the staff audit log. Clearing is not available in demo mode.

::: warning
A worker that is still running but idle loses its entry and stays off this list until it restarts. Restart the backend processes afterwards if you want every running worker listed again.
:::
