---
layout: doc
---

# Troubleshooting

This guide covers common issues you may encounter when setting up or running Octeth, along with their solutions.

## Installation Issues

### Installation Fails with "License Invalid" Error

**Problem:** The installer rejects your license key

**Solutions:**
1. Verify the license file is correctly formatted:
   ```bash
   cat /opt/octeth/data/license.dat
   ```
2. Ensure there are no extra spaces or line breaks
3. Download a fresh license file from [Octeth Client Area](https://my.octeth.com/)
4. Check that your license is active and not expired
5. Contact support if the issue persists

### Docker Services Won't Start

**Problem:** Docker containers fail to start during installation

**Check Docker Status:**
```bash
systemctl status docker
docker ps -a
```

**Solutions:**
1. Restart Docker service:
   ```bash
   systemctl restart docker
   ```
2. Check for port conflicts (especially ports 80, 443, 3306, 6379):
   ```bash
   netstat -tulpn | grep -E ':(80|443|3306|6379)\s'
   ```
3. Ensure sufficient disk space:
   ```bash
   df -h
   ```
4. Review Docker logs:
   ```bash
   journalctl -u docker -n 100
   ```

### Database Connection Errors

**Problem:** Cannot connect to MySQL database

**Check Database Status:**
```bash
/opt/octeth/cli/octeth.sh docker:status
```

**Solutions:**
1. Verify MySQL container is running:
   ```bash
   docker ps | grep mysql
   ```
2. Check MySQL credentials in environment file:
   ```bash
   cat /opt/octeth/.oempro_env | grep MYSQL
   ```
3. Restart MySQL container:
   ```bash
   docker restart oempro_mysql
   ```
4. Check MySQL logs:
   ```bash
   docker logs oempro_mysql
   ```

## Performance Issues

### Slow Email Delivery

**Problem:** Campaigns take too long to send

**Diagnose:**
```bash
/opt/octeth/cli/octeth.sh sendengine:status
/opt/octeth/cli/octeth.sh backend:status
```

**Solutions:**
1. Scale up send engine instances:
   ```bash
   /opt/octeth/cli/octeth.sh sendengine:scale 5
   ```
2. Check SMTP server response times
3. Verify send engine logs for errors:
   ```bash
   /opt/octeth/cli/octeth.sh sendengine:logs
   ```
4. Review RabbitMQ queue depth:
   ```bash
   docker exec oempro_rmq rabbitmqctl list_queues
   ```

### High Memory Usage

**Problem:** Server running out of memory

**Check Memory Usage:**
```bash
free -h
docker stats
```

**Solutions:**
1. Adjust MySQL configuration to use less memory:
   ```bash
   /opt/octeth/cli/octeth.sh mysql:switch-config standard
   ```
2. Reduce RabbitMQ memory limit if needed:
   ```bash
   vi /opt/octeth/.oempro_rabbitmq_env
   # Adjust RABBITMQ_VM_MEMORY_HIGH_WATERMARK
   ```
3. Restart services to clear memory:
   ```bash
   /opt/octeth/cli/octeth.sh docker:restart
   ```
4. Consider upgrading server RAM

### Disk Space Full

**Problem:** Server has no remaining disk space

**Check Disk Usage:**
```bash
df -h
du -sh /opt/octeth/* | sort -h
du -sh /var/lib/docker/* | sort -h
```

**Solutions:**
1. Clear old Docker images:
   ```bash
   docker system prune -a
   ```
2. Clear log files:
   ```bash
   /opt/octeth/cli/octeth.sh logs:reset
   ```
3. Remove old backups if using backup addon:
   ```bash
   rm -rf /var/backups/octeth/daily/backup-older-than-30-days*
   ```
4. Expand disk space on your server

## Email Delivery Issues

### Emails Going to Spam

**Problem:** Emails consistently land in spam folders

**Verify DNS Configuration:**
```bash
dig TXT yourdomain.com +short  # SPF
dig TXT octeth._domainkey.yourdomain.com +short  # DKIM
dig TXT _dmarc.yourdomain.com +short  # DMARC
```

**Solutions:**
1. Review [Sender Domain DNS Settings](./sender-domain-dns-settings) guide
2. Verify SPF, DKIM, and DMARC records are correctly configured
3. Check domain reputation using [SenderScore](https://www.senderscore.org/)
4. Warm up new IP addresses gradually
5. Review email content for spam trigger words
6. Ensure proper list hygiene (remove bounces and complaints)

### Bounces and Rejections

**Problem:** High bounce rate or emails being rejected

**Check Bounce Logs:**
1. Log in to Octeth Admin Dashboard
2. Navigate to **Reports** > **Bounce Reports**
3. Review rejection reasons

**Common Solutions:**
- **Invalid Recipients**: Clean your email list, remove invalid addresses
- **Blacklisted IP**: Check if your IP is on blacklists using [MXToolbox](https://mxtoolbox.com/blacklists.aspx)
- **Authentication Failures**: Verify DNS records (SPF, DKIM, DMARC)
- **Content Filters**: Review email content, remove spam triggers
- **Rate Limiting**: Slow down sending rate for specific domains

### SMTP Connection Failures

**Problem:** Cannot connect to SMTP servers

**Test SMTP Connection:**
```bash
telnet smtp.example.com 587
# Or for SSL/TLS
openssl s_client -connect smtp.example.com:465
```

**Solutions:**
1. Verify SMTP credentials in Octeth delivery server settings
2. Check firewall isn't blocking SMTP ports (25, 465, 587)
3. Confirm SMTP server is reachable from your Octeth server
4. Review SMTP server logs for authentication errors
5. Try alternative SMTP port (587 vs 465)

## Backend Process Issues

### Backend Workers Not Running

**Problem:** Email campaigns not processing

**Check Status:**
```bash
/opt/octeth/cli/octeth.sh backend:status
```

**Solutions:**
1. Restart backend processes:
   ```bash
   /opt/octeth/cli/octeth.sh backend:restart
   ```
2. Check supervisor status:
   ```bash
   docker exec oempro_app supervisorctl status
   ```
3. Review error logs:
   ```bash
   /opt/octeth/cli/octeth.sh logs:tail
   ```
4. Verify RabbitMQ is running:
   ```bash
   docker ps | grep rabbitmq
   ```

### Cron Jobs Not Executing

**Problem:** Scheduled tasks aren't running

**Check Cron Status:**
```bash
docker exec oempro_app crontab -l
docker exec oempro_app supervisorctl status cron
```

**Solutions:**
1. Restart cron service:
   ```bash
   docker exec oempro_app supervisorctl restart cron
   ```
2. Check cron logs:
   ```bash
   docker exec oempro_app tail -f /var/log/cron.log
   ```
3. Verify system time is correct:
   ```bash
   date
   ```

## Database Issues

### Database Corruption

**Problem:** MySQL reports corrupted tables

**Check and Repair:**
```bash
docker exec oempro_mysql mysqlcheck -u root -p oempro --auto-repair
```

**Solutions:**
1. Stop Octeth:
   ```bash
   /opt/octeth/cli/octeth.sh backend:stop
   ```
2. Repair tables:
   ```bash
   docker exec oempro_mysql mysqlcheck -u root -p oempro --repair --extended
   ```
3. If repair fails, restore from backup
4. Restart Octeth:
   ```bash
   /opt/octeth/cli/octeth.sh backend:start
   ```

### Slow Queries

**Problem:** Database queries taking too long

**Enable Slow Query Log:**
```bash
docker exec oempro_mysql mysql -u root -p -e "SET GLOBAL slow_query_log = 'ON';"
docker exec oempro_mysql mysql -u root -p -e "SET GLOBAL long_query_time = 2;"
```

**Solutions:**
1. Review slow query log:
   ```bash
   docker exec oempro_mysql cat /var/lib/mysql/slow-query.log
   ```
2. Optimize tables:
   ```bash
   docker exec oempro_mysql mysqlcheck -u root -p oempro --optimize
   ```
3. Consider upgrading to MySQL `highperf` configuration:
   ```bash
   /opt/octeth/cli/octeth.sh mysql:switch-config highperf
   ```

## Web Interface Issues

### Cannot Access Admin Dashboard

**Problem:** Admin login page not loading

**Check Web Server:**
```bash
curl -I http://203.0.113.10/app/admin/
```

**Solutions:**
1. Verify Docker containers are running:
   ```bash
   /opt/octeth/cli/octeth.sh docker:status
   ```
2. Check HAProxy status:
   ```bash
   docker ps | grep haproxy
   docker logs oempro_haproxy
   ```
3. Verify firewall isn't blocking port 80/443:
   ```bash
   ufw status
   ```
4. Restart all containers:
   ```bash
   /opt/octeth/cli/octeth.sh docker:restart
   ```

### Login Failures

**Problem:** Cannot log in with correct credentials

**Reset Admin Password:**
```bash
docker exec oempro_app php /var/www/html/cli/reset-admin-password.php
```

**Solutions:**
1. Clear browser cache and cookies
2. Try different browser or incognito mode
3. Check session storage (Redis):
   ```bash
   docker exec oempro_redis redis-cli ping
   ```
4. Regenerate authentication tokens:
   ```bash
   /opt/octeth/cli/octeth.sh regenerate-auth-tokens
   ```

## System Health Checks

### Running Health Check

Verify all services are operational:

```bash
/opt/octeth/cli/octeth.sh health:check
```

This comprehensive check validates:
- MySQL connection
- Redis connectivity
- RabbitMQ status
- ClickHouse database
- ElasticSearch service
- All backend processes
- File permissions
- Container health

### Viewing System Logs

**Real-time Error Logs:**
```bash
/opt/octeth/cli/octeth.sh logs:tail
```

**Docker Container Logs:**
```bash
docker logs oempro_app
docker logs oempro_mysql
docker logs oempro_redis
docker logs oempro_rmq
```

## Getting Help

If you've tried the solutions above and still need assistance:

1. **Gather Information:**
   - Run health check: `/opt/octeth/cli/octeth.sh health:check`
   - Create log snapshot: `/opt/octeth/cli/octeth.sh logs:snapshot`
   - Note exact error messages
   - Document steps to reproduce

2. **Contact Support:**
   - Email: support@octeth.com
   - Include your Octeth version
   - Attach log snapshots
   - Describe what you've already tried

3. **Community Resources:**
   - [Octeth Help Portal](https://help.octeth.com/)
   - [GitHub Issues](https://github.com/octeth/octeth-api-docs/issues)

::: tip Pro Tip
Enable debug mode temporarily when troubleshooting:
```bash
vi /opt/octeth/.oempro_env
# Set OEMPRO_DEBUG=true
# Set OEMPRO_LOG_LEVEL=DEBUG
/opt/octeth/cli/octeth.sh docker:restart
```
Remember to disable debug mode after troubleshooting to avoid performance impact.
:::
