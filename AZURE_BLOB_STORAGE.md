# Azure Blob Storage Configuration

## Overview
This project includes Azure Blob Storage integration using SAS (Shared Access Signature) tokens for secure access to blob containers.

## Setup

### 1. Environment Variables
Copy `.env.example` to `.env` and configure your Azure Storage credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Azure Storage details:
```env
AZURE_STORAGE_SAS_TOKEN=your-sas-token-here
AZURE_STORAGE_BLOB_URL=https://your-account.blob.core.windows.net/your-container
AZURE_STORAGE_ACCOUNT_NAME=your-account-name
AZURE_STORAGE_CONTAINER_NAME=your-container-name
```

### 2. Current Configuration
- **Storage Account**: `interviewresources`
- **Container**: `interviews`
- **SAS Token Expiry**: December 4, 2025, 6:57:54 PM UTC
- **Permissions**: Read (r)
- **Protocol**: HTTPS only

**Note**: The SAS token will expire on December 4, 2025 at 6:57:54 PM UTC. You'll need to generate a new token before this date.

## Usage in Frontend

### Basic Usage
```javascript
// Load the configuration first
await azureBlobStorage.loadConfig();

// Get URL for a specific blob
const videoUrl = azureBlobStorage.getBlobUrl('interview-videos/session-123.webm');

// Use the URL in your application
const video = document.createElement('video');
video.src = videoUrl;
```

### List Blobs
```javascript
// List all blobs in the container
const blobs = await azureBlobStorage.listBlobs();

// List blobs with a specific prefix
const videoBlobs = await azureBlobStorage.listBlobs('interview-videos/');

blobs.forEach(blob => {
  console.log(`Name: ${blob.name}`);
  console.log(`Size: ${blob.contentLength} bytes`);
  console.log(`URL: ${blob.url}`);
});
```

### Download Blobs
```javascript
// Download a blob
const blob = await azureBlobStorage.downloadBlob('interview-videos/session-123.webm');

// Create a download link
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'interview.webm';
a.click();
```

## Integration in HTML Files

Add the script to your HTML file:
```html
<script src="/azure-blob-storage.js"></script>
```

Then use it in your code:
```html
<script>
  async function loadVideo(sessionId) {
    await azureBlobStorage.loadConfig();
    const videoUrl = azureBlobStorage.getBlobUrl(`videos/${sessionId}.webm`);
    
    const videoElement = document.getElementById('videoPlayer');
    videoElement.src = videoUrl;
  }
</script>
```

## Server Configuration

The server automatically loads the `.env` file and exposes the configuration through the `/config/azure-storage.json` endpoint. The frontend can fetch this configuration without exposing secrets in the HTML.

## Generating New SAS Tokens

When the current SAS token expires, generate a new one using Azure Portal or Azure CLI:

### Using Azure Portal
1. Navigate to your Storage Account
2. Go to "Shared access signature" under Security + networking
3. Configure permissions (at minimum: Read)
4. Set start and expiry time
5. Select "HTTPS only"
6. Generate SAS token
7. Update `.env` file with the new token

### Using Azure CLI
```bash
az storage container generate-sas \
  --account-name interviewresources \
  --name interviews \
  --permissions r \
  --expiry 2026-12-04T18:57:54Z \
  --https-only
```

## Security Notes

- ✅ `.env` file is in `.gitignore` - never commit secrets
- ✅ SAS token has limited permissions (read-only)
- ✅ SAS token has expiry date
- ✅ HTTPS-only protocol enforced
- ⚠️ Remember to rotate SAS tokens before expiry
- ⚠️ For production, consider using Azure AD authentication instead of SAS tokens

## Troubleshooting

### "Failed to load Azure Storage configuration"
- Ensure the server is running (`node server.js`)
- Check that `.env` file exists with valid configuration
- Verify `dotenv` package is installed (`npm install`)

### "Failed to download blob: 403"
- SAS token may be expired
- Check if the SAS token has the correct permissions
- Verify the blob exists in the container

### "Failed to list blobs"
- Current SAS token only has Read permission, not List
- To list blobs, generate a new SAS token with List (l) permission

## API Reference

### `AzureBlobStorage` Class

#### Methods

- `loadConfig()`: Loads configuration from server
- `getBlobUrl(blobName)`: Returns full URL with SAS token for a blob
- `listBlobs(prefix)`: Lists all blobs (requires list permission)
- `downloadBlob(blobName)`: Downloads a blob as Blob object
- `isConfigured()`: Returns true if config is loaded
- `getConfig()`: Returns current configuration

## Example: Video Playback

```javascript
async function playInterviewVideo(sessionId) {
  try {
    // Ensure config is loaded
    if (!azureBlobStorage.isConfigured()) {
      await azureBlobStorage.loadConfig();
    }

    // Get video URL
    const videoUrl = azureBlobStorage.getBlobUrl(`interviews/${sessionId}/recording.webm`);
    
    // Set video source
    const video = document.getElementById('videoPlayer');
    video.src = videoUrl;
    video.play();
    
    console.log('Video loaded successfully');
  } catch (error) {
    console.error('Error loading video:', error);
    alert('Failed to load video');
  }
}
```
