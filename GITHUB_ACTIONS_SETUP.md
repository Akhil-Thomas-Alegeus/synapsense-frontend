# GitHub Actions Deployment Setup

## Fix the Authentication Error

The error you're seeing is because GitHub Actions needs proper Azure credentials. Here's how to set it up:

## Step 1: Create the Azure Web App First

Before setting up GitHub Actions, you need to create the Azure App Service. Run:

```bash
az login
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_NAME"

# Create resources
az group create --name synapsense-rg --location westus2
az appservice plan create --name synapsense-plan --resource-group synapsense-rg --sku B1 --is-linux
az webapp create --resource-group synapsense-rg --plan synapsense-plan --name synapsense-frontend --runtime "NODE:22-lts"
```

## Step 2: Get the Publish Profile

Once the web app is created, get the publish profile:

```bash
az webapp deployment list-publishing-profiles \
  --name synapsense-frontend \
  --resource-group synapsense-rg \
  --xml
```

This will output XML content. **Copy the entire XML output**.

## Step 3: Add Secret to GitHub

1. Go to your GitHub repository: https://github.com/Akhil-Thomas-Alegeus/synapsense-frontend
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
5. Value: Paste the XML content from Step 2
6. Click **Add secret**

## Step 4: Update Workflow (if needed)

Make sure your workflow file uses the correct app name. In `.github/workflows/azure-deploy.yml`, verify:

```yaml
env:
  AZURE_WEBAPP_NAME: synapsense-frontend  # Change this if you used a different name
```

## Step 5: Deploy

Push your code to trigger the deployment:

```bash
git add .
git commit -m "Setup GitHub Actions deployment"
git push origin main
```

## Alternative: Manual Deployment (Skip GitHub Actions)

If you prefer to skip GitHub Actions for now and deploy manually:

### Option A: PowerShell Script
```powershell
.\deploy-azure.ps1
```

Then:
```bash
git add .
git commit -m "Initial deployment"
git push azure main
```

### Option B: Azure CLI Direct
```bash
# Zip your files
Compress-Archive -Path * -DestinationPath deploy.zip -Force

# Deploy the zip
az webapp deployment source config-zip `
  --resource-group synapsense-rg `
  --name synapsense-frontend `
  --src deploy.zip
```

## Troubleshooting

### "No subscriptions found"
- Run `az login` first
- Verify you have access: `az account list`
- Set the subscription: `az account set --subscription "YOUR_SUBSCRIPTION_ID"`

### "App name already taken"
- App names must be globally unique
- Try a different name like `synapsense-frontend-yourname` or `synapsense-frontend-123`
- Update the name in `deploy-azure.ps1` and workflow file

### GitHub Actions keeps failing
- Make sure the web app exists in Azure first
- Verify the secret `AZURE_WEBAPP_PUBLISH_PROFILE` is set correctly
- Check the secret name matches exactly in the workflow file

## Verify Deployment

After successful deployment:

1. **Check deployment logs** in GitHub Actions tab
2. **Visit your app**: https://synapsense-frontend.azurewebsites.net
3. **Check Azure logs**:
   ```bash
   az webapp log tail --name synapsense-frontend --resource-group synapsense-rg
   ```

## Quick Reference

```bash
# Login to Azure
az login

# List subscriptions
az account list --output table

# Set subscription
az account set --subscription "SUBSCRIPTION_NAME_OR_ID"

# Get publish profile
az webapp deployment list-publishing-profiles --name synapsense-frontend --resource-group synapsense-rg --xml

# View logs
az webapp log tail --name synapsense-frontend --resource-group synapsense-rg

# Restart app
az webapp restart --name synapsense-frontend --resource-group synapsense-rg
```
