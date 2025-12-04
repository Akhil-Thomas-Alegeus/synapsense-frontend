# SynapSense Frontend 🎯

Interview Intelligence Platform - Frontend Application

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Azure Blob Storage (optional):**
   ```bash
   cp .env.example .env
   # Edit .env with your Azure Storage credentials
   ```
   
   See [AZURE_BLOB_STORAGE.md](./AZURE_BLOB_STORAGE.md) for detailed configuration.

3. **Run the server:**
   ```bash
   npm start
   ```

4. **Access the application:**
   - Frontend: http://127.0.0.1:8080/
   - Admin Dashboard: http://127.0.0.1:8080/admin.html
   - Azure Storage Test: http://127.0.0.1:8080/test-azure-storage.html

## 📦 Azure Deployment

### Option 1: Automated Script (Recommended)

Run the PowerShell deployment script:

```powershell
.\deploy-azure.ps1
```

This will:
- Create Azure resources (Resource Group, App Service Plan, Web App)
- Configure deployment settings
- Set up git deployment

Then deploy with:

```bash
git add .
git commit -m "Deploy to Azure"
git push azure main
```

### Option 2: Manual Deployment

Follow the step-by-step guide in [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)

### Option 3: GitHub Actions

1. Get your Azure publish profile:
   ```bash
   az webapp deployment list-publishing-profiles --name synapsense-frontend --resource-group synapsense-rg --xml
   ```

2. Add it as a GitHub secret named `AZURE_WEBAPP_PUBLISH_PROFILE`

3. Push to main branch - automatic deployment will trigger

## 🏗️ Project Structure

```
synapsense-frontend/
├── index.html              # Main candidate interface
├── admin.html              # Admin dashboard
├── server.js               # Node.js proxy server
├── package.json            # Dependencies & scripts
├── web.config              # IIS configuration for Azure
├── deploy.cmd              # Kudu deployment script
├── .deployment             # Azure deployment config
├── deploy-azure.ps1        # PowerShell deployment script
└── AZURE_DEPLOYMENT.md     # Detailed deployment guide
```

## 🔧 Configuration

### Backend URL

The frontend proxies API requests to the Azure backend. Update in `server.js`:

```javascript
const AZURE_BACKEND = 'https://synapsencebackend-dzceeafvbwgca8br.westus2-01.azurewebsites.net';
```

### Port Configuration

- **Local:** Runs on port 8080
- **Azure:** Uses `process.env.PORT` (automatically assigned)

## 📊 Features

### Candidate View (`index.html`)
- Real-time AI interview interface
- Voice interaction with speech-to-text
- Progress tracking
- Interview submission

### Admin Dashboard (`admin.html`)
- Interview analytics and metrics
- Invite code management
- Candidate performance review
- Detailed interview analysis

## 🛠️ Development

### Prerequisites
- Node.js 22.x or higher
- npm or yarn
- Azure CLI (for deployment)

### Environment Variables

- `PORT` - Server port (default: 8080)
- `AZURE_BACKEND` - Backend API URL

### Running Locally

```bash
# Install dependencies
npm install

# Start server
npm start

# Server will be available at http://127.0.0.1:8080/
```

## 🌐 Deployment URLs

After deployment, your app will be accessible at:

```
https://synapsense-frontend.azurewebsites.net
```

Admin dashboard:
```
https://synapsense-frontend.azurewebsites.net/admin.html
```

## 📝 Useful Commands

### Azure CLI

```bash
# View app logs
az webapp log tail --name synapsense-frontend --resource-group synapsense-rg

# Restart app
az webapp restart --name synapsense-frontend --resource-group synapsense-rg

# Check app status
az webapp show --name synapsense-frontend --resource-group synapsense-rg

# SSH into container
az webapp ssh --name synapsense-frontend --resource-group synapsense-rg
```

### Git Deployment

```bash
# Add changes
git add .

# Commit
git commit -m "Your message"

# Deploy to Azure
git push azure main

# Or deploy to GitHub
git push origin main
```

## 🐛 Troubleshooting

### Port Issues
- Ensure server.js uses `process.env.PORT || 8080`
- Azure automatically assigns the port

### Deployment Fails
- Check Azure deployment logs in Portal
- Verify package.json has `"start": "node server.js"`
- Ensure all files are committed to git

### API Connection Issues
- Verify AZURE_BACKEND URL in server.js
- Check CORS settings on backend
- Review browser console for errors

## 📚 Documentation

- [Azure Deployment Guide](./AZURE_DEPLOYMENT.md) - Detailed deployment instructions
- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Node.js on Azure](https://docs.microsoft.com/en-us/azure/app-service/quickstart-nodejs)

## 🔒 Security

- HTTPS enforced on Azure App Service
- Microphone permissions required for voice features
- Invite codes for candidate access control

## 📄 License

[Your License Here]

## 🤝 Contributing

[Contributing guidelines if applicable]

---

**Need Help?** Check the [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) for detailed deployment instructions.
