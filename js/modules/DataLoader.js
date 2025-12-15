/**
 * DataLoader Module
 * Handles fetching and caching JSON data from the /data/ directory
 */

class DataLoader {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Fetches JSON data from a file
     * @param {string} filePath - Path to the JSON file
     * @returns {Promise<Object>} Parsed JSON data
     */
    async loadData(filePath) {
        // Check cache first
        if (this.cache.has(filePath)) {
            return this.cache.get(filePath);
        }

        try {
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${filePath}: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Cache the data
            this.cache.set(filePath, data);
            
            return data;
        } catch (error) {
            console.error(`Error loading data from ${filePath}:`, error);
            throw error;
        }
    }

    /**
     * Clears the cache
     */
    clearCache() {
        this.cache.clear();
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

