# DNS Configuration Guide

## Required DNS Records

You need to configure DNS A records for ALL your domains to point to your VM IP: **34.174.61.205**

### Configure These Records in Your Domain Registrar

Go to your domain registrar (GoDaddy, Namecheap, Google Domains, etc.) and add these DNS records:

#### For peakkineticspt.com
| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | 34.174.61.205 | 3600 |
| A | www | 34.174.61.205 | 3600 |

#### For peakkineticspt.net
| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | 34.174.61.205 | 3600 |
| A | www | 34.174.61.205 | 3600 |

#### For peakkineticspt.store
| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | 34.174.61.205 | 3600 |
| A | www | 34.174.61.205 | 3600 |

#### For peakkineticspt.shop
| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | 34.174.61.205 | 3600 |
| A | www | 34.174.61.205 | 3600 |

#### For peakkineticspt.info
| Type | Name/Host | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | 34.174.61.205 | 3600 |
| A | www | 34.174.61.205 | 3600 |

## What Each Field Means

- **Type**: Always `A` (for IPv4 address)
- **Name/Host**: 
  - `@` = root domain (e.g., peakkineticspt.com)
  - `www` = www subdomain (e.g., www.peakkineticspt.com)
- **Value/Points To**: Your VM IP address `34.174.61.205`
- **TTL**: Time to Live (3600 seconds = 1 hour is standard)

## Steps to Configure DNS

### If Using GoDaddy:
1. Log in to GoDaddy
2. Go to **My Products** → **Domains**
3. Click **DNS** next to each domain
4. Click **Add** to add new A records
5. Add the records as shown in the table above

### If Using Namecheap:
1. Log in to Namecheap
2. Go to **Domain List**
3. Click **Manage** next to each domain
4. Go to **Advanced DNS** tab
5. Add A records as shown above

### If Using Google Domains / Squarespace:
1. Log in to your account
2. Select your domain
3. Go to **DNS** settings
4. Add Custom Records (A records) as shown above

### If Using Cloudflare:
1. Log in to Cloudflare
2. Select your domain
3. Go to **DNS** → **Records**
4. Add A records
5. **Important**: Set proxy status to "DNS only" (gray cloud) for initial setup

## Verify DNS Configuration

After configuring DNS, wait 5-10 minutes, then verify:

```bash
# Check from your local machine
dig peakkineticspt.com +short
dig www.peakkineticspt.com +short
dig peakkineticspt.net +short
dig www.peakkineticspt.net +short
dig peakkineticspt.store +short
dig www.peakkineticspt.store +short
dig peakkineticspt.shop +short
dig www.peakkineticspt.shop +short
dig peakkineticspt.info +short
dig www.peakkineticspt.info +short
```

All should return: **34.174.61.205**

Or use online tools:
- https://dnschecker.org
- https://www.whatsmydns.net

## DNS Propagation Time

- **Minimum**: 5-10 minutes
- **Typical**: 1-2 hours
- **Maximum**: 24-48 hours (rare)

## After DNS is Configured

Once DNS is pointing to your VM, run the setup script:

```bash
ssh -i peakkineticspt peakkineticspt@34.174.61.205
./setup-vm.sh
```

The script will:
1. Verify DNS configuration
2. Set up Nginx
3. Obtain SSL certificates for all domains
4. Configure auto-renewal

## Troubleshooting

### "Domain doesn't point to this server"
- Wait longer for DNS propagation
- Clear your DNS cache: `sudo systemd-resolve --flush-caches` (Linux) or `ipconfig /flushdns` (Windows)
- Check with multiple DNS checkers

### "SSL certificate request failed"
- Ensure ports 80 and 443 are open in Google Cloud firewall
- Verify DNS with `dig` command
- Check Nginx is running: `sudo systemctl status nginx`

### "Too many certificates already issued"
- Let's Encrypt has a limit of 50 certificates per domain per week
- Wait a week or use staging environment for testing
