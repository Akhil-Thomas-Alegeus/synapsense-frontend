const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Load environment variables from .env file
require('dotenv').config();

// Generate self-signed certificate
function generateCertificate() {
  const { execSync } = require('child_process');
  
  // Use Node's built-in crypto to generate a key pair
  const { generateKeyPairSync } = crypto;
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  // For self-signed certs, we need to use a different approach
  // Let's create a simple HTTPS server using mkcert-like approach
  console.log('Note: For proper HTTPS, install mkcert or use the http server with localhost');
  return null;
}

// Simple static file server
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const http = require('http');

const AZURE_BACKEND = 'https://synapsencebackend-dzceeafvbwgca8br.westus2-01.azurewebsites.net';

const server = http.createServer((req, res) => {
  // Serve config endpoint for Azure Blob Storage
  if (req.url === '/config/azure-storage.json') {
    res.writeHead(200, { 
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify({
      sasToken: process.env.AZURE_STORAGE_SAS_TOKEN || '',
      blobUrl: process.env.AZURE_STORAGE_BLOB_URL || '',
      accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || '',
      containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || ''
    }));
    return;
  }

  // Proxy API requests to Azure backend
  if (req.url.startsWith('/api/')) {
    const targetUrl = AZURE_BACKEND + req.url;
    console.log(`Proxying request: ${req.method} ${req.url} -> ${targetUrl}`);
    
    const options = {
      method: req.method,
      headers: { ...req.headers, host: new URL(AZURE_BACKEND).host }
    };
    
    const proxyReq = https.request(targetUrl, options, (proxyRes) => {
      console.log(`Azure backend responded with status: ${proxyRes.statusCode}`);
      
      // Log response body for debugging
      let body = '';
      proxyRes.on('data', (chunk) => {
        body += chunk;
      });
      
      proxyRes.on('end', () => {
        console.log(`Response body: ${body.substring(0, 200)}`);
      });
      
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });
    
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(502);
      res.end('Bad Gateway');
    });
    
    req.pipe(proxyReq);
    return;
  }
  
  // Serve static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end('Server error');
      }
    } else {
      res.writeHead(200, { 
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content);
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Use this URL to access the page with microphone support');
});
