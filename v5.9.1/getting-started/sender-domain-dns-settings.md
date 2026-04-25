---
layout: doc
---

# Sender Domain DNS Settings

Proper DNS configuration for your sender domains is essential for email deliverability. Without correct DNS records, your emails may be marked as spam or rejected entirely by recipient mail servers.

## Required DNS Records

For each sender domain you use in Octeth, you need to configure three types of DNS records:

1. **SPF (Sender Policy Framework)** - Authorizes which servers can send email from your domain
2. **DKIM (DomainKeys Identified Mail)** - Cryptographically signs your emails to verify authenticity
3. **DMARC (Domain-based Message Authentication, Reporting & Conformance)** - Tells receiving servers how to handle authentication failures

## Get Your DNS Records from Octeth

Octeth automatically generates the correct DNS records for each sender domain.

### Access Sender Domain Settings

1. Log in to Octeth Admin Dashboard
2. Navigate to **Settings** > **Sender Domains**
3. Click on your sender domain (or create a new one)
4. View the **DNS Configuration** section

Octeth will display the exact DNS records you need to add to your domain's DNS management panel.

## DNS Record Examples

Here's what the DNS records typically look like (your actual values will be different):

### SPF Record

**Type:** TXT
**Name:** `@` or your domain
**Value:**
```
v=spf1 include:_spf.example.com ~all
```

The SPF record authorizes Octeth's servers to send email on behalf of your domain.

### DKIM Record

**Type:** TXT
**Name:** `octeth._domainkey` (or custom selector from Octeth)
**Value:**
```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

The DKIM record contains the public key that receiving servers use to verify your email signatures.

::: tip DKIM Key Length
The DKIM value will be a very long string (often 300+ characters). Make sure your DNS provider accepts long TXT records. If they have a character limit, you may need to upgrade your DNS service or contact support.
:::

### DMARC Record

**Type:** TXT
**Name:** `_dmarc`
**Value:**
```
v=DMARC1; p=quarantine; rua=mailto:admin@example.com; ruf=mailto:admin@example.com; pct=100
```

The DMARC record tells receiving servers what to do if SPF or DKIM validation fails.

**DMARC Policies:**
- `p=none` - Monitor only (recommended for testing)
- `p=quarantine` - Send suspicious emails to spam
- `p=reject` - Reject emails that fail authentication (strictest)

## Adding DNS Records

The process varies by DNS provider, but generally:

### Step 1: Access DNS Management

Log in to your domain registrar or DNS hosting provider (e.g., Cloudflare, GoDaddy, Namecheap, Route53).

### Step 2: Add TXT Records

For each DNS record provided by Octeth:

1. Click "Add Record" or "Add DNS Record"
2. Select **TXT** as the record type
3. Enter the **Name** (host) exactly as shown
4. Paste the **Value** exactly as provided by Octeth
5. Set TTL to 3600 (1 hour) or use automatic
6. Save the record

### Step 3: Wait for DNS Propagation

DNS changes can take anywhere from a few minutes to 48 hours to propagate worldwide. Typically, changes are visible within 1-4 hours.

## Verify DNS Records

After adding the records, verify they're configured correctly.

### Using Octeth's Built-in Verification

1. In Octeth Admin > Settings > Sender Domains
2. Click **Verify DNS** next to your domain
3. Octeth will check all required records
4. Fix any issues reported

### Using Command Line Tools

You can also manually verify using command-line tools:

**Check SPF:**
```bash
dig TXT yourdomain.com +short
```

**Check DKIM:**
```bash
dig TXT octeth._domainkey.yourdomain.com +short
```

**Check DMARC:**
```bash
dig TXT _dmarc.yourdomain.com +short
```

Replace `yourdomain.com` with your actual domain.

### Using Online Tools

Several free online tools can verify your DNS configuration:

- [MXToolbox](https://mxtoolbox.com/spf.aspx) - SPF and DKIM checker
- [DMARC Analyzer](https://www.dmarcanalyzer.com/dmarc/dmarc-record-check/) - DMARC validation
- [Google Admin Toolbox](https://toolbox.googleapps.com/apps/checkmx/) - Complete email DNS check

## Common Issues and Solutions

### SPF Record Not Found

**Problem:** DNS lookup shows no SPF record
**Solution:**
- Verify you added a TXT record, not an SPF record type
- Check the record name is `@` or your bare domain
- Wait for DNS propagation (can take up to 24 hours)

### DKIM Record Too Long

**Problem:** DNS provider rejects the DKIM record
**Solution:**
- Some DNS providers have TXT record length limits
- Contact your DNS provider support for assistance
- Consider switching to a provider that supports long TXT records (Cloudflare, Route53)

### Multiple SPF Records

**Problem:** You already have an SPF record for another email service
**Solution:**
- You can only have ONE SPF record per domain
- Merge the records by combining include statements:
```
v=spf1 include:_spf.google.com include:_spf.octeth.com ~all
```

### DMARC Policy Too Strict

**Problem:** Legitimate emails are being rejected
**Solution:**
- Start with `p=none` to monitor without affecting delivery
- Review DMARC reports sent to the `rua` email address
- Gradually tighten policy after verifying configuration

## Best Practices

**Start with Monitoring**
- Begin with DMARC policy `p=none` to collect data
- Review reports for 2-4 weeks before tightening policy
- Gradually move to `p=quarantine` then `p=reject`

**Use Subdomains for Campaigns**
- Use `mail.yourdomain.com` for marketing emails
- Keep `yourdomain.com` for transactional emails
- This protects your main domain reputation

**Monitor DNS Health**
- Set up monitoring alerts for DNS record changes
- Regularly verify records are still correctly configured
- Check DMARC reports weekly for authentication issues

**Keep Records Updated**
- If you change email infrastructure, update DNS records
- When rotating DKIM keys, update the DNS record
- Document all DNS changes for your team

## Next Steps

Once your DNS records are properly configured and verified:

1. Test email delivery by sending test campaigns
2. Monitor delivery rates and spam reports
3. Set up [Monitoring](./monitoring) to track system health
4. Review [Troubleshooting](./troubleshooting) if you encounter issues

::: tip Professional Help
If you're unsure about DNS configuration, consider hiring a professional or contacting Octeth support for assistance. Incorrect DNS settings can seriously impact email deliverability.
:::
