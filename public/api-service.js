const API_CONFIG = {
    CACHE_TIMEOUT: 5 * 60 * 1000,
    BASE_URL: 'https://api.torn.com'
};

class TornAPIService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = API_CONFIG.CACHE_TIMEOUT;
    }

    clearCache() {
        this.cache.clear();
    }

    async fetch(url, options = {}) {
        const cacheKey = url;
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }
        try {
            const response = await fetch(url, { method: 'GET', ...options });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (data.error) {
                throw new Error(`Torn API Error: ${data.error.error || data.error}`);
            }
            this.cache.set(cacheKey, { data, timestamp: Date.now() });
            return data;
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    }

    async getPlayerData(playerId, apiKey) {
        const url = `${API_CONFIG.BASE_URL}/user/${playerId}?selections=profile,battlestats&key=${apiKey}`;
        return await this.fetch(url);
    }

    async getFactionData(factionId, apiKey) {
        const url = `${API_CONFIG.BASE_URL}/v2/faction/${factionId}?selections=basic,members&key=${apiKey}`;
        return await this.fetch(url);
    }

    async getUserDisplay(userId, apiKey) {
        const url = `${API_CONFIG.BASE_URL}/user/${userId}?selections=profile,battlestats&key=${apiKey}`;
        const res = await this.fetch(url);
        return { name: (res.name || "OPERATOR").toUpperCase(), total: Number(res.total || 0) };
    }

    async getKeyPermissions(apiKey) {
        const url = `${API_CONFIG.BASE_URL}/user/?selections=key&key=${apiKey}`;
        const data = await this.fetch(url);
        
        // Validate that we received expected fields
        if (!data.access_level && !data.selections) {
            throw new Error('Invalid API response: missing permissions data');
        }
        
        return {
            access_level: data.access_level || 'unknown',
            access_type: data.access_type || 'unknown',
            selections: data.selections || []
        };
    }
}

window.apiService = new TornAPIService();