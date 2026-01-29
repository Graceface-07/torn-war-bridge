const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Server start time for uptime tracking
const serverStartTime = Date.now();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS support for external access
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

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
            return res.status(500).json({ 
                error: 'FF Scouter API key not configured',
                hint: 'Create a .env file with FF_SCOUTER_KEY=your_key_here'
            });
        }
        
        // Updated FF Scouter API endpoint
        const url = `https://www.ffscouter.com/api/v1/user/${targetId}/battlestats.json?key=${FF_SCOUTER_KEY}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching scouter data:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.status, error.response.data);
        }
        res.status(500).json({ 
            error: 'Failed to fetch scouter data', 
            details: error.message,
            hint: error.response?.status === 403 ? 'Invalid FF Scouter API key' : 'User may not be in FF Scouter database'
        });
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
            return res.status(500).json({ 
                error: 'Torn API key not configured',
                hint: 'Create a .env file with TORN_API_KEY=your_key_here'
            });
        }
        
        // Use Torn API with selections parameter (NOT v2)
        const url = `https://api.torn.com/faction/${factionId}?selections=basic&key=${TORN_API_KEY}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        console.log('Faction API Response:', JSON.stringify(response.data).substring(0, 200));
        
        res.json({
            name: response.data.name || 'UNKNOWN',
            members: response.data.members || {}
        });
    } catch (error) {
        console.error('Error fetching faction data:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.status, error.response.data);
        }
        res.status(500).json({ 
            error: 'Failed to fetch faction data', 
            details: error.message,
            hint: error.response?.status === 403 ? 'Invalid API key' : 'Check if faction ID exists'
        });
    }
});

// Get user basic info with battle stats
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Validate input
        if (!validateNumericId(userId)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        
        if (!TORN_API_KEY) {
            return res.status(500).json({ 
                error: 'Torn API key not configured',
                hint: 'Create a .env file with TORN_API_KEY=your_key_here'
            });
        }
        
        // Use Torn API with selections parameter (NOT v2)
        const url = `https://api.torn.com/user/${userId}?selections=profile,battlestats&key=${TORN_API_KEY}`;
        const response = await axios.get(url, { timeout: 10000 });
        
        console.log('User API Response keys:', Object.keys(response.data));
        
        // Return the user data with battle stats
        res.json({
            name: response.data.name || 'Unknown',
            player_id: response.data.player_id || userId,
            level: response.data.level || 0,
            status: response.data.status || {},
            strength: response.data.strength || 0,
            defense: response.data.defense || 0,
            speed: response.data.speed || 0,
            dexterity: response.data.dexterity || 0,
            total: response.data.total || 0,
            battle_stats: response.data
        });
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.status, error.response.data);
        }
        res.status(500).json({ 
            error: 'Failed to fetch user data', 
            details: error.message,
            hint: error.response?.status === 403 ? 'Invalid API key' : 'Check if user ID exists'
        });
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
