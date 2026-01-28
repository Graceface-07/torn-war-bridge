const express = require('express');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Configuration
const FF_SCOUTER_KEY = process.env.FF_SCOUTER_KEY;
const TORN_API_KEY = process.env.TORN_API_KEY;
const WORKER_URL = process.env.WORKER_URL;

// API Endpoints

// Get scouter data for a target
app.get('/api/scouter/:targetId', async (req, res) => {
    try {
        const { targetId } = req.params;
        const { userId } = req.query;
        
        const url = `https://ffscouter.com/api/v1/get-stats?key=${FF_SCOUTER_KEY}&targets=${targetId}&user_id=${userId || 0}`;
        const response = await axios.get(url);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching scouter data:', error.message);
        res.status(500).json({ error: 'Failed to fetch scouter data' });
    }
});

// Get faction members data
app.get('/api/faction/:factionId/members', async (req, res) => {
    try {
        const { factionId } = req.params;
        
        const url = `https://api.torn.com/v2/faction/${factionId}/members?key=${TORN_API_KEY}`;
        const response = await axios.get(url);
        
        res.json({
            name: response.data.name || 'UNKNOWN',
            members: response.data.members || {}
        });
    } catch (error) {
        console.error('Error fetching faction data:', error.message);
        res.status(500).json({ error: 'Failed to fetch faction data' });
    }
});

// Get user basic info
app.get('/api/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const url = `https://api.torn.com/user/${userId}?selections=basic,profile&key=${TORN_API_KEY}`;
        const response = await axios.get(url);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Root route handler serving index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
