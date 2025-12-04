// Configuration for Interview Intelligence Frontend
// This file manages environment-specific settings

(function() {
    // Detect environment based on hostname
    const hostname = window.location.hostname;
    
    // Environment detection
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '';
    const isAzure = hostname.includes('azurewebsites.net') || hostname.includes('azurestaticapps.net');
    
    // Backend API URLs
    const BACKEND_URLS = {
        local: 'http://localhost:5090',
        azure: 'https://synapsencebackend-dzceeafvbwgca8br.westus2-01.azurewebsites.net'
    };
    
    // Frontend URLs (for reference)
    const FRONTEND_URLS = {
        local: 'http://localhost:8080',
        azure: 'https://synapsense-frontend-h8aggkddachwgqen.westus2-01.azurewebsites.net'
    };
    
    // Determine which backend to use
    let apiBaseUrl;
    if (isLocalhost) {
        // When running locally, you can switch between local backend and Azure backend
        // Set this to true to use Azure backend even when running frontend locally
        const useAzureBackendLocally = false;
        apiBaseUrl = useAzureBackendLocally ? BACKEND_URLS.azure : BACKEND_URLS.local;
    } else {
        // When deployed, always use Azure backend
        apiBaseUrl = BACKEND_URLS.azure;
    }
    
    // Export configuration globally
    window.AppConfig = {
        // Current environment
        environment: isLocalhost ? 'local' : 'azure',
        isLocalhost: isLocalhost,
        isAzure: isAzure,
        
        // API Base URL (use this for all API calls)
        API_BASE: apiBaseUrl,
        
        // Individual service URLs if needed
        urls: {
            backend: BACKEND_URLS,
            frontend: FRONTEND_URLS
        },
        
        // Helper method to get full API URL
        getApiUrl: function(endpoint) {
            const base = this.API_BASE.endsWith('/') ? this.API_BASE.slice(0, -1) : this.API_BASE;
            const path = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
            return base + path;
        },
        
        // Log current configuration (for debugging)
        logConfig: function() {
            console.log('🔧 App Configuration:');
            console.log('   Environment:', this.environment);
            console.log('   API Base URL:', this.API_BASE);
            console.log('   Is Localhost:', this.isLocalhost);
        }
    };
    
    // Log configuration on load (can be disabled in production)
    if (isLocalhost) {
        window.AppConfig.logConfig();
    }
})();
