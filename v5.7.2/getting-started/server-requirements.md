---
layout: doc
---

# Server Requirements

Octeth requires a clean Linux server environment to ensure proper installation and optimal performance. This guide outlines the specific requirements your server must meet.

## Operating System

### Supported OS

- **Ubuntu 24.04 LTS** (recommended)
- **Ubuntu 22.04 LTS** (supported)
- Other Debian-based distributions may work but are not officially supported

### Fresh Installation Required

::: warning Critical Requirement
The server must be a **fresh, vanilla installation** with no pre-installed software packages or control panels (cPanel, Plesk, etc.). Octeth will configure all necessary services automatically.
:::

**Do NOT install:**
- Web servers (Apache, Nginx)
- Database servers (MySQL, PostgreSQL)
- Control panels (cPanel, Plesk, DirectAdmin)
- Mail servers (Postfix, Exim)
- Other containerization platforms

Octeth installs and manages all required services via Docker containers.

## Hardware Requirements

### Minimum Specifications

For testing or small deployments (up to 10,000 subscribers):

- **CPU**: 2 vCPUs
- **RAM**: 4 GB
- **Storage**: 50 GB SSD
- **Network**: 1 Gbps connection

::: warning
Minimum specs are suitable for testing only. Production use requires recommended specifications.
:::

### Recommended Specifications

For standard production use (up to 100,000 subscribers):

- **CPU**: 4 vCPUs (Intel/AMD x86_64)
- **RAM**: 8 GB
- **Storage**: 80 GB SSD
- **Network**: 1 Gbps connection

### High-Volume Specifications

For large deployments (100,000 - 1,000,000+ subscribers):

- **CPU**: 8-16 vCPUs
- **RAM**: 16-32 GB
- **Storage**: 160-320 GB SSD
- **Network**: 1 Gbps+ connection

## Resource Scaling Guide

The table below shows recommended resources based on your subscriber count:

| Subscribers | vCPUs | RAM | Storage | Typical Performance |
|------------|-------|-----|---------|---------------------|
| Up to 10K | 2 | 4 GB | 50 GB | 10K emails/hour |
| Up to 50K | 4 | 8 GB | 80 GB | 50K emails/hour |
| Up to 100K | 4 | 8 GB | 80 GB | 100K emails/hour |
| Up to 500K | 8 | 16 GB | 160 GB | 250K emails/hour |
| Up to 1M | 8 | 16 GB | 160 GB | 500K emails/hour |
| 1M+ | 16 | 32 GB | 320 GB | 1M+ emails/hour |

::: info
Email sending performance also depends on SMTP server capacity and configuration. These numbers assume optimal SMTP setup.
:::

## Network Requirements

### Internet Connection

- Stable, high-speed internet connection
- Minimum 100 Mbps upload/download
- Low latency (<50ms to major data centers)

### IP Address

- Static public IPv4 address required
- IPv6 optional but recommended

### Firewall & Ports

Octeth requires these ports to be accessible:

**Inbound (Required):**
- Port **80** (HTTP) - Web interface and API
- Port **443** (HTTPS) - Secure web interface
- Port **22** (SSH) - Server administration

**Outbound (Required):**
- Port **25, 465, 587** (SMTP) - Email delivery
- Port **80, 443** (HTTP/HTTPS) - Updates and external APIs
- Port **53** (DNS) - Domain lookups

## Storage Requirements

### Disk Space Breakdown

Typical disk space usage:

- **Docker Images**: 5-10 GB
- **Application Files**: 2-3 GB
- **MySQL Database**: Grows with subscribers and campaign data
- **ClickHouse Analytics**: Grows with tracking events
- **Log Files**: 1-5 GB (rotated automatically)
- **Email Attachments**: Varies based on usage
- **Backups**: Plan for 2-3x database size if using local backups

### Storage Type

- **SSD Required**: For database performance
- **NVMe Recommended**: For high-volume deployments
- **HDD Not Recommended**: Will cause severe performance issues

## Access Requirements

### SSH Access

- Root or sudo access required
- SSH key authentication recommended
- Password authentication acceptable but less secure

### DNS Access

- Ability to create/modify DNS records for your domains
- Access to domain registrar or DNS hosting provider

## Software Requirements

### Pre-installation

The following will be installed automatically by Octeth, but ensure your server can install packages:

- Docker and Docker Compose
- Git
- Common Linux utilities

::: tip No Manual Installation Needed
You do **NOT** need to install Docker, MySQL, Redis, or any other software manually. The Octeth installer handles all dependencies.
:::

## Cloud Provider Compatibility

Octeth works with all major cloud providers:

- **AWS EC2**: Fully supported
- **DigitalOcean**: Fully supported
- **Linode**: Fully supported
- **Vultr**: Fully supported
- **Hetzner**: Fully supported
- **Google Cloud**: Fully supported
- **Azure**: Fully supported
- **Dedicated Servers**: Fully supported

## Unsupported Configurations

::: danger Will Not Work
Octeth **will not** install or function properly on:
- Windows servers
- Servers with existing control panels (cPanel, Plesk)
- Servers with pre-installed web/database software
- ARM architecture (Raspberry Pi, AWS Graviton)
- Shared hosting environments
- 32-bit operating systems
:::

## Next Steps

Once your server meets these requirements:

1. Verify you have [Preparations](./preparations) ready
2. Proceed to [Server Initialization](./server-initialization) to create your VM
3. Continue with [Server Setup](./server-setup) to prepare for installation

::: tip Server Sizing
If unsure about sizing, start with recommended specifications (4 vCPU / 8 GB RAM). You can always upgrade your server resources later as your subscriber base grows.
:::
