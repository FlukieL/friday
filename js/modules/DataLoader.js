/**
 * DataLoader Module
 * Handles fetching and caching JSON data from the /data/ directory
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
        this.cacheTimestamps = new Map();
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache duration
    }

    /**
     * Fetches JSON data from a file
     * @param {string} filePath - Path to the JSON file
     * @param {boolean} forceRefresh - Force refresh from network, bypassing cache
     * @returns {Promise<Object>} Parsed JSON data
     */
    async loadData(filePath, forceRefresh = false) {
        const now = Date.now();
        
        // Check cache first (unless forcing refresh)
        if (!forceRefresh && this.cache.has(filePath)) {
            const timestamp = this.cacheTimestamps.get(filePath);
            // Use cached data if it's still fresh
            if (timestamp && (now - timestamp) < this.CACHE_DURATION) {
                return this.cache.get(filePath);
            }
        }

        try {
            // Add cache-busting query parameter to ensure fresh data
            const url = new URL(filePath, window.location.origin);
            url.searchParams.set('_t', now.toString());
            
            const response = await fetch(url.toString(), {
                cache: 'no-store', // Prevent browser-level caching
                headers: {
                    'Cache-Control': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache the data with timestamp
            this.cache.set(filePath, data);
            this.cacheTimestamps.set(filePath, now);
            
            return data;
        } catch (error) {
            console.error(`Error loading data from ${filePath}:`, error);
            // If network fails and we have cached data, return it even if stale
            if (this.cache.has(filePath)) {
                console.warn(`Using stale cached data for ${filePath}`);
                return this.cache.get(filePath);
            }
            throw error;
        }
    }

    /**
     * Clears the cache
     */
    clearCache() {
        this.cache.clear();
        this.cacheTimestamps.clear();
    }

    /**
     * Clears expired cache entries
     */
    clearExpiredCache() {
        const now = Date.now();
        for (const [filePath, timestamp] of this.cacheTimestamps.entries()) {
            if (now - timestamp >= this.CACHE_DURATION) {
                this.cache.delete(filePath);
                this.cacheTimestamps.delete(filePath);
            }
        }
    }

    /**
     * Preloads multiple data files
     * @param {string[]} filePaths - Array of file paths to preload
     * @returns {Promise<Object>} Object with file paths as keys and data as values
     */
    async preloadData(filePaths) {
        const promises = filePaths.map(path => 
            this.loadData(path).catch(error => {
                console.error(`Failed to preload ${path}:`, error);
                return null;
            })
        );

        const results = await Promise.all(promises);
        
        const dataMap = {};
        filePaths.forEach((path, index) => {
            if (results[index] !== null) {
                dataMap[path] = results[index];
            }
        });

        return dataMap;
    }
}

export default DataLoader;




