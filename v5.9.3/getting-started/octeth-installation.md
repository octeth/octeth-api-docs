---
layout: doc
---

# Octeth Installation

On the server, create the Octeth directory and unzip the Octeth package:

```bash
mkdir -p /opt/octeth
unzip /opt/oempro-rel-v5.9.3.zip -d /opt/octeth
```

Make installation tool executable:

```bash
chmod +x /opt/octeth/cli/octeth.sh
```

Run installation tool:

```bash
/opt/octeth/cli/octeth.sh install:start
```

::: tip Installing from a script, a CI job or an AI agent
`install:start` and `install:reset` can run with no prompts at all using `--yes` and the accompanying value flags. See [Unattended installation](./octeth-cli-tool.md#unattended-installation-ci-automation-ai-agents) in the CLI tool reference.
:::

The installer will check server requirements and then ask you a few questions:

- Application URL: http://203.0.113.10/
- Full Name: John Doe
- Email Address: admin@example.com
- Username: admin
- Password: YourSecurePassword123
- EULA Agree: Y
- License Key: XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX (can be left blank and added later in `.oempro_env`)

Once you confirm, installation utility will start installing Octeth on your server.

The installation process will take several minutes. Please be patient.

Once it's completed, you will see a success message like:

```text
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║  ✓ Installation Successfully Completed!                                    ║
║                                                                            ║
║  🔐 Admin Login Details:                                                   ║
║  ────────────────────────────────────────────────────────────────────────  ║
║  URL:      http://203.0.113.10/app/admin/                                  ║
║  Username: admin                                                           ║
║  Password: YourSecurePassword123                                           ║
║                                                                            ║
║  📚 Helpful Resources:                                                     ║
║  ────────────────────────────────────────────────────────────────────────  ║
║  • Octeth Website:      https://octeth.com/                                ║
║  • Octeth Client Area:  https://my.octeth.com/                             ║
║  • Octeth Help Portal:  https://help.octeth.com/                           ║
║  • Octeth Dev Portal:   https://dev.octeth.com/                            ║
║                                                                            ║
║  🚀 Getting Started:                                                       ║
║  ────────────────────────────────────────────────────────────────────────  ║
║  Visit https://octeth.com/getting-started/ to learn more about:            ║
║  • Configuring your Octeth installation                                    ║
║  • Setting up email delivery                                               ║
║  • Creating your first campaign                                            ║
║  • Best practices and optimization tips                                    ║
║                                                                            ║
║  🔒 Security Reminder:                                                     ║
║  ────────────────────────────────────────────────────────────────────────  ║
║  • Change the default admin password after first login                     ║
║  • Enable SSL certificates for enhanced security                           ║
║                                                                            ║
║  💪 Thank you for using Oempro!                                            ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

Open your web browser and visit admin login URL:

http://203.0.113.10/app/admin/

Enter your admin username and password. They are shown at the success message as above.

In the meantime, you can check the health status of the Octeth system by running this command:

```bash
/opt/octeth/cli/octeth.sh health:check
```

You should see a success screen like:

```text
ℹ Using API endpoint: http://203.0.113.10/api/v1/system-health-check
ℹ Using API key: sk_xxxxxxxx... (truncated for security)

ℹ Checking system health...

✓ Health check completed successfully (HTTP 200)

System Health Status:

┌─────────────────────┬────────────────────────────────────┐
│ Service             │ Status                             │
├─────────────────────┼────────────────────────────────────┤
│ MySQL               │ ✓ OK                               │
│ Redis               │ ✓ OK                               │
│ RabbitMQ            │ ✓ OK                               │
│ ElasticSearch       │ ✓ OK                               │
│ ClickHouse          │ ✓ OK                               │
│ Session             │ ✓ OK                               │
│ System Container    │ ✓ OK                               │
│ Vector              │ ✓ OK                               │
│ HAProxy             │ ✓ OK                               │
│ Cron                │ ✓ OK                               │
│ Supervisor          │ ✓ OK                               │
│ Send Engine         │ ✓ OK                               │
│ Admin Frontend      │ ✓ OK                               │
│ User Frontend       │ ✓ OK                               │
│ File Permissions    │ ✓ OK                               │
└─────────────────────┴────────────────────────────────────┘

Raw JSON response (for debugging):
{"Checks":{"MySQL":"OK","ClickHouse":"OK","Elasticsearch":"OK","RabbitMQ":"OK","Redis":"OK","Session":"OK","SystemContainer":"OK","Vector":"OK","Haproxy":"OK","Cron":"OK","Supervisor":"OK","SendEngine":"OK","AdminFrontend":"OK","UserFrontend":"OK","FilePermissions":"OK"}}

ℹ Health check completed
```

## Container resource limits

Octeth runs as 14 Docker containers. Each one can be given a CPU and a memory cap through `.oempro_env`:

```bash
<SERVICE>_CPU_LIMIT        # CPU cores, e.g. 1.5 - a ceiling, not a pinning
<SERVICE>_MEM_LIMIT        # hard memory cap - exceeding it OOM-kills the container
<SERVICE>_MEM_RESERVATION  # soft reclaim hint under host memory pressure
```

`0` means unlimited, and it is the default for 12 of the 14 services. The full key list and per-service sizing guidance is in the *Container Resource Limits* entry of [Octeth configuration](./octeth-configuration.md).

### What the installer does for you

Two services — the send engine (`SENDENGINE_*`) and the link proxy (`LINK_PROXY_*`) — ship with a real CPU limit of `3.0` rather than unlimited, because that was their historical hardcoded value.

**`install:start` sizes those two down to your server automatically.** On a fresh install it sets them to `(CPU cores − 1)`, with a floor of `1.0`, whenever that is lower than the shipped value:

| Server vCPUs | `SENDENGINE_CPU_LIMIT` / `LINK_PROXY_CPU_LIMIT` |
| --- | --- |
| 1 | `1.0` |
| 2 (minimum spec) | `1.0` |
| 3 | `2.0` |
| 4 (recommended spec) or more | `3.0` (unchanged) |

One core is deliberately left for the other containers — MySQL is by far the heaviest consumer in the stack.

::: warning A CPU limit above your core count stops the container from starting
Docker validates the CPU limit against the number of cores the host really has and refuses to start the container if it is exceeded:

```
Error response from daemon: range of CPUs is from 0.01 to 2.00,
as there are only 2 CPUs available
```

If you edit `<SERVICE>_CPU_LIMIT` by hand, or you move an existing `.oempro_env` to a smaller server, keep every CPU limit at or below the server's core count.

Memory has no such constraint: a `<SERVICE>_MEM_LIMIT` larger than the server's RAM is accepted and simply never takes effect, and `<SERVICE>_MEM_RESERVATION` is only a hint to the kernel — it never reserves memory and never prevents an out-of-memory kill.
:::

### Applying a change

Resource limits take effect when a container is created, so after editing `.oempro_env`:

```bash
/opt/octeth/cli/octeth.sh docker:up
```

Confirm what actually got applied:

```bash
docker inspect oempro_sendengine \
  --format 'Memory={{.HostConfig.Memory}} NanoCpus={{.HostConfig.NanoCpus}}'
```

::: tip Running `docker compose` by hand
The Octeth CLI passes `--env-file .oempro_env` for you. There is no root `.env` file, so if you call `docker compose` directly you must add `--env-file .oempro_env` yourself — otherwise your limits are ignored and the compose file's built-in defaults are used.
:::

### Upgrading an existing installation

`./cli/octeth.sh upgrade` adds any resource-limit keys that your `.oempro_env` does not yet have, using the shipped values (`3.0` CPU for the send engine and link proxy, `0` for everything else). It does **not** re-run the installer's host sizing, and it never changes a key you have already set. On a server with fewer than 4 cores, review `SENDENGINE_CPU_LIMIT` and `LINK_PROXY_CPU_LIMIT` after your first upgrade.

## Sizing the send engine on a dedicated MTA server

`./cli/sendengine-deploy-to-server.sh` copies **the app server's** `.oempro_env` to the MTA server, so `SENDENGINE_CPU_LIMIT`, `SENDENGINE_MEM_LIMIT` and `SENDENGINE_MEM_RESERVATION` arrive sized for the app server — usually too conservative for a box that does nothing but send. Review them on the MTA server before the first start:

```bash
ssh root@<MTA_SERVER_IP>
cd /opt/oempro
vi .oempro_env
```

Then bring the containers up, **always passing `--env-file`**:

```bash
docker compose --env-file .oempro_env -f docker-compose.mta.yml build
docker compose --env-file .oempro_env -f docker-compose.mta.yml up -d --scale oempro_sendengine=2
```

Without `--env-file .oempro_env` your limits are ignored and the defaults inside `docker-compose.mta.yml` (3.0 CPU / 6G) are used instead.

::: warning The limits are per container
`docker-compose.mta.yml` runs 2 send-engine replicas by default, and `--scale` raises that. The server must be able to satisfy `SENDENGINE_CPU_LIMIT × replicas` — with the default `3.0` and 2 replicas that is 6 cores. Exceeding the core count on any single container makes that container refuse to start.
:::

`docker-compose.mta.yml` is used on its own (`-f docker-compose.mta.yml`). It is not an overlay for `docker-compose.yml`, and the two cannot be combined.
