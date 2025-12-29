# GitHub Actions Workflow Usage Guide

## Automatic Deployments

The workflow automatically deploys when you push to `main` or `master`:

```bash
git add .
git commit -m "Your changes"
git push origin main
```

This will:
1. ✅ Build frontend (Next.js with pnpm)
2. ✅ Build backend (Spring Boot with Maven)
3. ✅ Bundle frontend into Spring Boot JAR
4. ✅ Deploy to VM
5. ✅ Start LGTM observability stack
6. ✅ Start Spring Boot with prod profile
7. ✅ Run health checks

## Manual Control Actions

You can manually control the application from GitHub Actions:

### Access Manual Controls
1. Go to your repository
2. Click **Actions** tab
3. Select **Build and Deploy to GCP** workflow
4. Click **Run workflow** dropdown
5. Select an action
6. Click **Run workflow** button

### Available Actions

#### 🚀 Deploy
Builds and deploys the application (same as automatic push)
```
Action: deploy
```
Use when: You want to deploy without pushing code changes

#### 🔄 Restart
Restarts the application and observability stack
```
Action: restart
```
Use when:
- Application is unresponsive
- Need to reload configuration
- After manual changes on VM

#### ▶️ Start
Starts the application if it's stopped
```
Action: start
```
Use when:
- Application was manually stopped
- After maintenance

#### 🛑 Stop
Stops the application and observability stack
```
Action: stop
```
Use when:
- Performing maintenance
- Need to stop for troubleshooting
- Reducing costs temporarily

#### 📊 Status
Checks application status without changing anything
```
Action: status
```
Use when:
- Want to check if app is running
- Need to see resource usage
- Want to view recent logs

## Monitoring Deployments

### View Deployment Progress
1. Go to **Actions** tab
2. Click on the running workflow
3. Watch real-time logs

### Check Deployment Status
After deployment completes:
- ✅ Green checkmark = Success
- ❌ Red X = Failed (click to view logs)

### View Application Logs
Access logs from the workflow or SSH to VM:

```bash
# SSH to VM
ssh -i peakkineticspt peakkineticspt@34.174.61.205

# View live logs
tail -f ~/deployment/app.log

# View last 100 lines
tail -n 100 ~/deployment/app.log

# Search logs
grep "ERROR" ~/deployment/app.log
```

## Application URLs

After successful deployment:

| Service | URL | Purpose |
|---------|-----|---------|
| Main Application | https://peakkineticspt.com | Your Spring Boot app |
| Health Check | https://peakkineticspt.com/actuator/health | Application health status |
| Grafana | https://peakkineticspt.com:3000 | Observability dashboard (if exposed) |

## Deployment Timeline

Typical deployment takes:
- **Build**: 3-5 minutes
- **Deploy**: 1-2 minutes
- **Health Check**: 30-60 seconds
- **Total**: ~5-8 minutes

## Rollback Procedure

If deployment fails or introduces issues:

### Option 1: Revert Git Commit
```bash
git revert HEAD
git push origin main
```
This automatically triggers a new deployment with previous code.

### Option 2: Manual Rollback on VM
```bash
ssh -i peakkineticspt peakkineticspt@34.174.61.205

# Stop current version
cd ~/deployment
kill $(cat app.pid)

# Start previous JAR (if you kept it)
# Or redeploy from Actions
```

### Option 3: Use Status Action
Check what's wrong first:
1. Go to Actions
2. Run workflow with action: **status**
3. Review logs and decide next steps

## Troubleshooting

### Deployment Failed at Build Stage
**Cause**: Code compilation error
**Fix**: Check build logs, fix code, push again

### Deployment Failed at Deploy Stage
**Cause**: SSH connection or VM issue
**Fix**: 
- Verify VM is running
- Check SSH key is correct
- Ensure VM has space: `df -h`

### Health Check Failed
**Cause**: Application didn't start properly
**Fix**:
1. Run **status** action to see logs
2. Check for missing environment variables
3. Verify database is accessible
4. Review application logs

### Application Running but Not Accessible
**Cause**: Nginx or firewall issue
**Fix**:
```bash
ssh -i peakkineticspt peakkineticspt@34.174.61.205

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check application
curl http://localhost:8080/actuator/health

# Check firewall
sudo ufw status
```

### Docker Compose Issues
**Cause**: LGTM stack not running
**Fix**:
```bash
ssh -i peakkineticspt peakkineticspt@34.174.61.205
cd ~/deployment
docker compose ps
docker compose logs
docker compose restart
```

## Best Practices

### Before Deploying
- ✅ Test locally first
- ✅ Review changes in pull request
- ✅ Ensure all tests pass
- ✅ Check environment variables are set

### During Deployment
- 📊 Monitor the Actions workflow
- 🔍 Watch for any warnings or errors
- ⏱️ Wait for health check to pass

### After Deployment
- 🌐 Visit https://peakkineticspt.com to verify
- 📊 Run **status** action to confirm everything is running
- 📝 Check logs for any errors
- 🧪 Test critical functionality

### Regular Maintenance
- 🔄 Restart weekly to clear memory
- 📊 Monitor with Grafana dashboard
- 🗂️ Clean old logs: `truncate -s 0 ~/deployment/app.log`
- 📦 Check disk space: `df -h`

## Emergency Procedures

### Application Down
```bash
# Quick restart from Actions
Actions → Run workflow → restart

# Or manually on VM
ssh -i peakkineticspt peakkineticspt@34.174.61.205
cd ~/deployment/backend/target
export $(cat ~/deployment/.env | xargs)
nohup java -Dspring.profiles.active=prod -jar *.jar > ~/deployment/app.log 2>&1 &
echo $! > ~/deployment/app.pid
```

### Database Connection Lost
```bash
# Restart application to reconnect
Actions → Run workflow → restart
```

### Out of Memory
```bash
# Stop, clean, restart
Actions → Run workflow → stop
# SSH to VM and clean logs/temp files
Actions → Run workflow → start
```

## Support Checklist

When reporting issues, include:
- [ ] Workflow run URL
- [ ] Error message from logs
- [ ] Action that was run (deploy/restart/etc)
- [ ] Time of deployment
- [ ] Status action output
