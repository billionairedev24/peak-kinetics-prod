# GitHub Secrets Configuration Guide

## Required GitHub Secrets

Navigate to your repository: **Settings → Secrets and variables → Actions → New repository secret**

### SSH & Infrastructure Secrets

| Secret Name | Description | Example/Notes |
|-------------|-------------|---------------|
| `GCP_VM_SSH_KEY` | Private SSH key content | Content of your `peakkineticspt` private key file |
| `GCP_PROJECT_ID` | Google Cloud Project ID | Get from VM: `curl -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/project/project-id` |

### Database Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection URL | `jdbc:postgresql://your-db-host:5432/peakkinetics` |
| `DATABASE_USERNAME` | Database username | `peakkinetics_user` |
| `DATABASE_PASSWORD` | Database password | `your-secure-password` |

### JWT Secret

| Secret Name | Description | Example/Notes |
|-------------|-------------|---------------|
| `JWT_SECRET` | JWT signing secret | Generate: `openssl rand -base64 64` |

### Email Service (Resend)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `RESEND_API_KEY` | Resend API key | Get from https://resend.com/api-keys |

### SMS Service (Twilio)

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `TWILIO_ACCOUNT_SID` | Twilio Account SID | Get from https://console.twilio.com |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Get from https://console.twilio.com |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | Format: `+1234567890` |

### Google Services

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GOOGLE_PLACES_API_KEY` | Google Places API key | Get from https://console.cloud.google.com/apis/credentials |

## How to Add Secrets

### 1. Navigate to Repository Settings
```
Your Repository → Settings → Secrets and variables → Actions
```

### 2. Click "New repository secret"

### 3. Add Each Secret
- **Name**: Exact name from table above (case-sensitive)
- **Value**: The actual secret value
- Click **Add secret**

## How to Get Your SSH Private Key

```bash
# On your local machine where you have the key
cat peakkineticspt

# Copy the entire output including:
# -----BEGIN OPENSSH PRIVATE KEY-----
# ... key content ...
# -----END OPENSSH PRIVATE KEY-----
```

Paste this entire content into `GCP_VM_SSH_KEY` secret.

## How to Generate JWT Secret

```bash
# Generate a secure random secret
openssl rand -base64 64
```

Copy the output and use it as `JWT_SECRET`.

## Verification

After adding all secrets, you can verify in the Actions tab:
1. Go to **Actions** tab
2. Click **Build and Deploy to GCP** workflow
3. Click **Run workflow**
4. Select action: **status**
5. Run workflow

This will check if the application can start with your configuration.

## Security Best Practices

✅ **DO:**
- Use strong, randomly generated passwords
- Rotate secrets regularly
- Use different credentials for production vs development
- Keep secrets encrypted at rest

❌ **DON'T:**
- Commit secrets to Git
- Share secrets in plain text
- Use the same password for multiple services
- Hard-code secrets in application code

## Updating Secrets

To update a secret:
1. Go to repository Settings → Secrets and variables → Actions
2. Click the secret name
3. Click **Update secret**
4. Enter new value
5. Click **Update secret**

**Note**: After updating secrets, you need to redeploy for changes to take effect:
- Go to Actions → Build and Deploy to GCP → Run workflow → Select "deploy"

## Troubleshooting

### "Secret not found" error
- Verify secret name matches exactly (case-sensitive)
- Check you added it to repository secrets, not environment secrets

### Application fails to start
- Check logs in Actions workflow
- Verify all required secrets are set
- Test database connection from VM manually

### Database connection issues
- Verify `DATABASE_URL` format: `jdbc:postgresql://host:port/database`
- Ensure database accepts connections from VM IP
- Check firewall rules allow database port

### Twilio/Resend not working
- Verify API keys are valid and not expired
- Check account status on respective platforms
- Ensure phone number format includes country code: `+1234567890`
