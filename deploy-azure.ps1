# Azure App Service Deployment Script for SynapSense Frontend
# Run this script in PowerShell to deploy your app to Azure

param(
    [string]$ResourceGroup = "synapsense-rg",
    [string]$AppServicePlan = "synapsense-plan",
    [string]$WebAppName = "synapsense-frontend",
    [string]$Location = "westus2",
    [string]$Sku = "B1"
)

Write-Host "🚀 SynapSense Frontend - Azure Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Azure CLI is installed
try {
    az --version | Out-Null
    Write-Host "✓ Azure CLI is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI is not installed" -ForegroundColor Red
    Write-Host "Please install from: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli" -ForegroundColor Yellow
    exit 1
}

# Login to Azure
Write-Host ""
Write-Host "📝 Logging into Azure..." -ForegroundColor Yellow
az login

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Azure login failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Successfully logged in" -ForegroundColor Green

# Create Resource Group
Write-Host ""
Write-Host "📦 Creating Resource Group: $ResourceGroup" -ForegroundColor Yellow
az group create --name $ResourceGroup --location $Location

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Resource Group created/verified" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create Resource Group" -ForegroundColor Red
    exit 1
}

# Create App Service Plan
Write-Host ""
Write-Host "📋 Creating App Service Plan: $AppServicePlan" -ForegroundColor Yellow
az appservice plan create `
    --name $AppServicePlan `
    --resource-group $ResourceGroup `
    --sku $Sku `
    --is-linux

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ App Service Plan created/verified" -ForegroundColor Green
} else {
    Write-Host "⚠ App Service Plan may already exist or creation failed" -ForegroundColor Yellow
}

# Create Web App
Write-Host ""
Write-Host "🌐 Creating Web App: $WebAppName" -ForegroundColor Yellow
az webapp create `
    --resource-group $ResourceGroup `
    --plan $AppServicePlan `
    --name $WebAppName `
    --runtime "NODE:22-lts"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Web App created successfully" -ForegroundColor Green
} else {
    Write-Host "⚠ Web App may already exist" -ForegroundColor Yellow
}

# Configure App Settings
Write-Host ""
Write-Host "⚙️ Configuring App Settings..." -ForegroundColor Yellow
az webapp config appsettings set `
    --resource-group $ResourceGroup `
    --name $WebAppName `
    --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true WEBSITE_NODE_DEFAULT_VERSION="22-lts"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ App Settings configured" -ForegroundColor Green
}

# Set up deployment source
Write-Host ""
Write-Host "🔧 Setting up Local Git deployment..." -ForegroundColor Yellow
$deploymentUrl = az webapp deployment source config-local-git `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --query url `
    --output tsv

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Local Git deployment configured" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deployment URL: $deploymentUrl" -ForegroundColor Cyan
}

# Get deployment credentials
Write-Host ""
Write-Host "🔑 Fetching deployment credentials..." -ForegroundColor Yellow
$credentials = az webapp deployment list-publishing-credentials `
    --name $WebAppName `
    --resource-group $ResourceGroup `
    --query "{username:publishingUserName, password:publishingPassword}" `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Deployment credentials retrieved" -ForegroundColor Green
}

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host ""
    Write-Host "📂 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✓ Git initialized" -ForegroundColor Green
}

# Add Azure remote
Write-Host ""
Write-Host "🔗 Adding Azure remote..." -ForegroundColor Yellow
git remote remove azure 2>$null
git remote add azure $deploymentUrl

Write-Host "✓ Azure remote added" -ForegroundColor Green

# Display final instructions
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your app is ready to deploy. To deploy:" -ForegroundColor White
Write-Host ""
Write-Host "  1. Commit your changes:" -ForegroundColor Yellow
Write-Host "     git add ." -ForegroundColor White
Write-Host "     git commit -m 'Ready for deployment'" -ForegroundColor White
Write-Host ""
Write-Host "  2. Push to Azure:" -ForegroundColor Yellow
Write-Host "     git push azure main" -ForegroundColor White
Write-Host ""
Write-Host "  3. Access your app at:" -ForegroundColor Yellow
Write-Host "     https://$WebAppName.azurewebsites.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "Deployment Credentials:" -ForegroundColor Yellow
Write-Host "  Username: $($credentials.username)" -ForegroundColor White
Write-Host "  Password: [hidden for security]" -ForegroundColor White
Write-Host ""
Write-Host "To view logs:" -ForegroundColor Yellow
Write-Host "  az webapp log tail --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host ""
Write-Host "To restart the app:" -ForegroundColor Yellow
Write-Host "  az webapp restart --name $WebAppName --resource-group $ResourceGroup" -ForegroundColor White
Write-Host ""
