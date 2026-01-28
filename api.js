// api.js

const config = require('./config');

const axios = require('axios');

// Function to call Torn API
const callTornAPI = async (endpoint, params = {}) => {
    try {
        const response = await axios.get(`https://api.torn.com/${endpoint}`, {
            params: {
                ...params,
                key: config.tornAPIKey,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error calling Torn API:', error);
        throw new Error('Failed to fetch data from Torn API');
    }
};

// Function to call FF Scouter API
const callFFScouterAPI = async (endpoint, params = {}) => {
    try {
        const response = await axios.get(`https://scouter.ff.api/${endpoint}`, {
            params: {
                ...params,
                userId: config.ffScouterUserId,
                key: config.ffScouterAPIKey,
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error calling FF Scouter API:', error);
        throw new Error('Failed to fetch data from FF Scouter API');
    }
};

// Function to fetch faction data
const fetchFactionData = async (factionId) => {
    return await callTornAPI(`faction/${factionId}`);
};

// Function to fetch member stats
const fetchMemberStats = async (memberId) => {
    return await callTornAPI(`user/${memberId}`);
};

// Function to fetch weapon information
const fetchWeaponInfo = async (weaponId) => {
    return await callTornAPI(`item/${weaponId}`);
};

module.exports = {
    fetchFactionData,
    fetchMemberStats,
    fetchWeaponInfo,
};
