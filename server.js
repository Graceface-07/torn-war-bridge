const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// Server start time for uptime tracking
const serverStartTime = Date.now();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Configuration
const FF_SCOUTER_KEY = process.env.FF_SCOUTER_KEY;
const TORN_API_KEY = process.env.TORN_API_KEY;

// Validation function for numeric IDs
function validateNumericId(id) {
    return /^\d+$/.test(id);
}

// Check if API keys are configured
if (!FF_SCOUTER_KEY || !TORN_API_KEY) {
    console.error('WARNING: API keys not configured. Please set FF_SCOUTER_KEY and TORN_API_KEY in .env file');
}

// Health check / Status endpoint
app.get('/api/health', (req, res) => {
    const uptime = Math.floor((Date.now() - serverStartTime) / 1000);
    const uptimeMinutes = Math.floor(uptime / 60);
    const uptimeSeconds = uptime % 60;
    
    res.json({
        status: 'OK',
        message: 'Server is running',
        uptime: `${uptimeMinutes}m ${uptimeSeconds}s`,
        uptimeSeconds: uptime,
        timestamp: new Date().toISOString(),
        apiKeys: {
            ffScouter: !!FF_SCOUTER_KEY,
            tornApi: !!TORN_API_KEY
        }
    });
});

// API Endpoints

// Get scouter data for a target
app.get('/api/scouter/:targetId', async (req, res) => {
    try {
        const { targetId } = req.params;
        const { userId } = req.query;
        
        // Validate input
        if (!validateNumericId(targetId)) {
            return res.status(400).json({ error: 'Invalid target ID format' });
        }
        
        if (userId && !validateNumericId(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        if (!FF_SCOUTER_KEY) {
            return res.status(500).json({ error: 'FF Scouter API key not configured' });
        }
        
        const url = `https://ffscouter.com/api/v1/get-stats?key=${FF_SCOUTER_KEY}&targets=${targetId}&user_id=${userId || 0}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching scouter data:', error.message);
        res.status(500).json({ error: 'Failed to fetch scouter data', details: error.message });
    }
});

// Get faction members data
app.get('/api/faction/:factionId/members', async (req, res) => {
    try {
        const { factionId } = req.params;
        
        // Validate input
        if (!validateNumericId(factionId)) {
            return res.status(400).json({ error: 'Invalid faction ID format' });
        }
        
        if (!TORN_API_KEY) {
            return res.status(500).json({ error: 'Torn API key not configured' });
        }
        
        const url = `https://api.torn.com/v2/faction/${factionId}/members?key=${TORN_API_KEY}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        res.json({
            name: response.data.name || 'UNKNOWN',
            members: response.data.members || {}
        });
    } catch (error) {
        console.error('Error fetching faction data:', error.message);
        res.status(500).json({ error: 'Failed to fetch faction data', details: error.message });
    }
});

// Get user basic info
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate input
        if (!validateNumericId(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        if (!TORN_API_KEY) {
            return res.status(500).json({ error: 'Torn API key not configured' });
        }
        
        const url = `https://api.torn.com/user/${userId}?selections=basic,profile&key=${TORN_API_KEY}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).json({ error: 'Failed to fetch user data', details: error.message });
    }
});

// Root route handler serving index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`
╔════════════════════════════════════════╗
║   🎯 TORN WAR BRIDGE - SERVER RUNNING  ║
╚════════════════════════════════════════╝

✅ Server Status: ONLINE
🌐 URL: http://localhost:${port}
📊 Health Check: http://localhost:${port}/api/health
⏰ Started: ${new Date().toLocaleString()}

${!FF_SCOUTER_KEY || !TORN_API_KEY ? '⚠️  WARNING: API keys not configured\n   Create .env file with API keys for full functionality\n' : '✅ API Keys: Configured'}
Ready to accept connections!
Press Ctrl+C to stop
    `);
});
