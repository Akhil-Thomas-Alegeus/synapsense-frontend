# Azure App Service Deployment Guide

## Prerequisites
1. Azure account with active subscription
2. Azure CLI installed (or use Azure Portal)
3. Git repository initialized

## Option 1: Deploy via Azure CLI (Recommended)

### Step 1: Install Azure CLI
Download from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli

### Step 2: Login to Azure
```bash
az login
```

### Step 3: Create Resource Group (if not exists)
```bash
az group create --name synapsense-rg --location westus2
```

### Step 4: Create App Service Plan
```bash
az appservice plan create --name synapsense-plan --resource-group synapsense-rg --sku B1 --is-linux
```

### Step 5: Create Web App
```bash
az webapp create --resource-group synapsense-rg --plan synapsense-plan --name synapsense-frontend --runtime "NODE:22-lts"
```

### Step 6: Configure App Settings
```bash
az webapp config appsettings set --resource-group synapsense-rg --name synapsense-frontend --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

### Step 7: Deploy from Local Git
```bash
# Set up local git deployment
az webapp deployment source config-local-git --name synapsense-frontend --resource-group synapsense-rg

# Get deployment credentials
az webapp deployment list-publishing-credentials --name synapsense-frontend --resource-group synapsense-rg --query "{username:publishingUserName, password:publishingPassword}"

# Add Azure remote to your git repo
git remote add azure https://<deployment-username>@synapsense-frontend.scm.azurewebsites.net/synapsense-frontend.git

# Push to Azure
git add .
git commit -m "Initial deployment"
git push azure main
```

## Option 2: Deploy via Azure Portal

### Step 1: Create Web App
1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" > "Web App"
3. Fill in the details:
   - **Resource Group**: Create new or select existing
   - **Name**: synapsense-frontend (must be globally unique)
   - **Publish**: Code
   - **Runtime stack**: Node 22 LTS
   - **Operating System**: Linux
   - **Region**: West US 2 (or your preferred region)
   - **App Service Plan**: Create new (B1 Basic or higher)
4. Click "Review + Create" > "Create"

### Step 2: Configure Deployment
1. Go to your App Service in Azure Portal
2. Navigate to "Deployment Center"
3. Select deployment source:
   - **GitHub**: Connect your GitHub account and select repository
   - **Local Git**: Use git push deployment
   - **Azure DevOps**: Use Azure Pipelines
4. Configure and save

### Step 3: Set Application Settings
1. Go to "Configuration" > "Application settings"
2. Add these settings:
   - `SCM_DO_BUILD_DURING_DEPLOYMENT` = `true`
   - `WEBSITE_NODE_DEFAULT_VERSION` = `22-lts`
3. Click "Save"

## Option 3: Deploy via GitHub Actions

### Step 1: Generate Deployment Credentials
```bash
az webapp deployment list-publishing-profiles --name synapsense-frontend --resource-group synapsense-rg --xml
```

### Step 2: Add Secret to GitHub
1. Go to your GitHub repository
2. Settings > Secrets and variables > Actions
3. Add new secret named `AZURE_WEBAPP_PUBLISH_PROFILE`
4. Paste the XML content from Step 1

### Step 3: Create Workflow File
Create `.github/workflows/azure-deploy.yml` (already created in your repo)

### Step 4: Push to GitHub
```bash
git add .
git commit -m "Add Azure deployment workflow"
git push origin main
```

## Verify Deployment

After deployment, your app will be available at:
```
https://synapsense-frontend.azurewebsites.net
```

### Check Logs
```bash
# Stream logs
az webapp log tail --name synapsense-frontend --resource-group synapsense-rg

# Or in Azure Portal: 
# App Service > Log stream
```

## Troubleshooting

### 1. App won't start
- Check that `package.json` has `"start": "node server.js"`
- Verify Node.js version in Application Settings
- Check logs for errors

### 2. Port issues
- Server.js should use `process.env.PORT` (already configured)
- Azure automatically assigns port

### 3. Deployment fails
- Ensure all files are committed to git
- Check deployment logs in Azure Portal
- Verify build succeeded

## Environment Variables

If you need to configure the backend URL differently for production:

```bash
az webapp config appsettings set --resource-group synapsense-rg --name synapsense-frontend --settings AZURE_BACKEND="https://your-backend-url.azurewebsites.net"
```

Then update server.js to use:
```javascript
const AZURE_BACKEND = process.env.AZURE_BACKEND || 'https://synapsencebackend-dzceeafvbwgca8br.westus2-01.azurewebsites.net';
```

## Quick Commands Reference

```bash
# Check app status
az webapp show --name synapsense-frontend --resource-group synapsense-rg

# Restart app
az webapp restart --name synapsense-frontend --resource-group synapsense-rg

# View app logs
az webapp log tail --name synapsense-frontend --resource-group synapsense-rg

# SSH into container (Linux apps)
az webapp ssh --name synapsense-frontend --resource-group synapsense-rg

# Delete app
az webapp delete --name synapsense-frontend --resource-group synapsense-rg
```

## Cost Optimization

- **Free Tier (F1)**: Limited to 60 CPU minutes/day, good for testing
- **Basic B1**: ~$13/month, suitable for dev/test
- **Standard S1**: ~$70/month, production workloads
- **Premium**: Higher performance and scaling

Change tier:
```bash
az appservice plan update --name synapsense-plan --resource-group synapsense-rg --sku F1
```

## Next Steps

1. Set up custom domain (optional)
2. Enable SSL/HTTPS (automatic with Azure)
3. Configure monitoring and alerts
4. Set up CI/CD pipeline
5. Configure scaling rules
