---
layout: doc
---

# Octeth Installation

On the server, create the Octeth directory and unzip the Octeth package:

```bash
mkdir -p /opt/octeth
unzip /opt/oempro-rel-v5.7.2.zip -d /opt/octeth
```

Make installation tool executable:

```bash
chmod +x /opt/octeth/cli/octeth.sh
```

Create `license.dat` file which can be created and downloaded from [Octeth Client Area](https://my.octeth.com/)

```bash
tee /opt/octeth/data/license.dat > /dev/null << 'EOF'
-------------------------------BEGIN LICENSE KEY--------------------------------
3sebEsyWGsrakl0SXVSYjN1M2NJTEliR2VB***********************YbWxxNnVsbWNXOG9teHNjM
1dvcTRGb2liU0VsRmkwMW41NmdXT0ZsY1YxbFpUT2pYZUhmc0c2Zm5kM3FwV0R3YWUrcysyc2o2bndXM
0hDcUlHTGJZMmdkMzk3WklKZm**********WW9TYWlJaVplblpxbUpCMWdJZG1wNUtNcFplemhwcVBjN
ng3akp0M2VIQ2R0RzF0Ylp5R203SzR2TE8wYVgrdmdYTncxSkNoYlZlUHBiNmN4SmpMd1hGdW43T1FkW
Uc2ZTNlT2szaml4czY4dEhoL3VZRjFlb0dTcEcrUWNvdDVyM1YxZXE1bmI0aVFpTXB0bko1OWFKeWN0S
lRJeXFUTXR0bC91TUc**********UdoMnFMdWFDVHJjN2Z5ZS9Md205dDVvaDRqR3hXbXN1a21LU20zN
GF2dWEzRnFZcW91S3RwZlo2Ymc1cHVxSHgxZTRGemVNZXZzWitiM2FtcHA3dTJzN25rVnE2NnA0V0EwY
mVBZUhhQWFjUEFpcVdseTdE***********************************NTExvTlM4M25hN3ZjaXUwc
nRTZExlSGVJUFJwcTJlazQrcXc2YTh3S**************************yaDZmbldNbXBTUWliYXZvc
2JFM1ZWd3RYNTJnWE5WbE1HSmFuQ2J3cFNPbDZDUXA1TnY1cE9paldpaXJiUzh2R2lDNDYxb2luNTdwT
XFQbEtQTmZvaWl0NXlsVmFiZGZYdUVXWVZaaDRSbWpZUGlyZz09
--------------------------------END LICENSE KEY---------------------------------
EOF
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
