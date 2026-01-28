/**
 * Torn API Service Module
 * Centralized data-fetching logic with error handling and caching
 */

class TornAPIService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * Generic API fetch with error handling
     * @param {string} endpoint - The API endpoint
     * @param {string} apiKey - The API key
     * @param {Object} options - Additional fetch options
     * @returns {Promise<Object>} - The API response data
     */
    async fetch(endpoint, apiKey, options = {}) {
        const cacheKey = `${endpoint}-${apiKey}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const url = `https://api.torn.com/${endpoint}?key=${apiKey}`;
            const response = await fetch(url, {
                method: 'GET',
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Check for Torn API errors
            if (data.error) {
                throw new Error(`Torn API Error: ${data.error.error || 'Unknown error'}`);
            }

            // Cache the response
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * Fetch player data
     * @param {string} playerId - The player ID
     * @param {string} apiKey - The API key
     * @param {string} selections - Comma-separated selections (e.g., 'profile,battlestats')
     * @returns {Promise<Object>} - Player data
     */
    async getPlayerData(playerId, apiKey, selections = 'profile,battlestats') {
        const endpoint = `user/${playerId}?selections=${selections}`;
        return await this.fetch(endpoint, apiKey);
    }

    /**
     * Fetch faction data
     * @param {string} factionId - The faction ID
     * @param {string} apiKey - The API key
     * @param {string} selections - Comma-separated selections
     * @returns {Promise<Object>} - Faction data
     */
    async getFactionData(factionId, apiKey, selections = 'basic,members') {
        const endpoint = `faction/${factionId}?selections=${selections}`;
        return await this.fetch(endpoint, apiKey);
    }

    /**
     * Fetch member stats from a faction
     * @param {string} factionId - The faction ID
     * @param {string} apiKey - The API key
     * @returns {Promise<Object>} - Member stats
     */
    async getMemberStats(factionId, apiKey) {
        const factionData = await this.getFactionData(factionId, apiKey, 'basic,members');
        
        if (!factionData.members) {
            throw new Error('No member data available');
        }

        return {
            totalMembers: Object.keys(factionData.members).length,
            members: factionData.members
        };
    }

    /**
     * Get cached data for offline mode
     * @returns {Object} - Cached data
     */
    getCachedData() {
        const cached = {};
        this.cache.forEach((value, key) => {
            cached[key] = value.data;
        });
        return cached;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export as singleton
const apiService = new TornAPIService();
