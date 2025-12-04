// Azure Blob Storage Configuration Helper
// This module provides access to Azure Blob Storage with SAS token authentication

class AzureBlobStorage {
  constructor() {
    this.config = null;
  }

  // Load configuration from server
  async loadConfig() {
    try {
      const response = await fetch('/config/azure-storage.json');
      if (!response.ok) {
        throw new Error('Failed to load Azure Storage configuration');
      }
      this.config = await response.json();
      console.log('Azure Blob Storage configuration loaded successfully');
      return this.config;
    } catch (error) {
      console.error('Error loading Azure Storage config:', error);
      throw error;
    }
  }

  // Get blob URL with SAS token
  getBlobUrl(blobName) {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    
    const baseUrl = this.config.blobUrl.split('?')[0]; // Remove any existing query params
    const separator = baseUrl.endsWith('/') ? '' : '/';
    return `${baseUrl}${separator}${blobName}?${this.config.sasToken}`;
  }

  // List blobs in the container (requires list permission in SAS token)
  async listBlobs(prefix = '') {
    if (!this.config) {
      await this.loadConfig();
    }

    const url = `https://${this.config.accountName}.blob.core.windows.net/${this.config.containerName}?${this.config.sasToken}&restype=container&comp=list${prefix ? '&prefix=' + encodeURIComponent(prefix) : ''}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to list blobs: ${response.status} ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
      
      const blobs = [];
      const blobElements = xmlDoc.getElementsByTagName('Blob');
      
      for (let i = 0; i < blobElements.length; i++) {
        const nameElement = blobElements[i].getElementsByTagName('Name')[0];
        const propertiesElement = blobElements[i].getElementsByTagName('Properties')[0];
        
        if (nameElement && propertiesElement) {
          blobs.push({
            name: nameElement.textContent,
            url: this.getBlobUrl(nameElement.textContent),
            contentType: propertiesElement.getElementsByTagName('Content-Type')[0]?.textContent,
            contentLength: parseInt(propertiesElement.getElementsByTagName('Content-Length')[0]?.textContent || '0'),
            lastModified: propertiesElement.getElementsByTagName('Last-Modified')[0]?.textContent
          });
        }
      }
      
      return blobs;
    } catch (error) {
      console.error('Error listing blobs:', error);
      throw error;
    }
  }

  // Download a blob
  async downloadBlob(blobName) {
    if (!this.config) {
      await this.loadConfig();
    }

    const url = this.getBlobUrl(blobName);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download blob: ${response.status} ${response.statusText}`);
      }
      return await response.blob();
    } catch (error) {
      console.error('Error downloading blob:', error);
      throw error;
    }
  }

  // Check if configuration is loaded
  isConfigured() {
    return this.config !== null;
  }

  // Get configuration
  getConfig() {
    return this.config;
  }
}

// Export singleton instance
const azureBlobStorage = new AzureBlobStorage();
