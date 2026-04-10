---
layout: doc
---

# Octeth Installation

On the server, create the Octeth directory and unzip the Octeth package:

```bash
mkdir -p /opt/octeth
unzip /opt/oempro-rel-v5.8.3.zip -d /opt/octeth
```

Make installation tool executable:

```bash
chmod +x /opt/octeth/cli/octeth.sh
```

Run installation tool:

```bash
/opt/octeth/cli/octeth.sh install:start
```

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
