// Torn War Bridge - Dashboard JavaScript
let USER_ID = null;
let FACTION_ID = null;
const FACTION_KEY = 'CZP2D2ZnbXWsYiDT';
const SCOUTER_KEY = 'rwLgZTyqgWDxhoCx';
const PERSONAL_KEY = 'gc43XVxOpCcwLnY6';

let factionMembers = [];
let myStats = {};
let myBattleStats = {};

// Calculate effective battle stats from base stats and modifiers
function calculateEffectiveBS(battleStats) {
    if (!battleStats || !battleStats.strength) {
        return 0;
    }
    
    const strength = battleStats.strength.value * (1 + battleStats.strength.modifier / 100);
    const defense = battleStats.defense.value * (1 + battleStats.defense.modifier / 100);
    const speed = battleStats.speed.value * (1 + battleStats.speed.modifier / 100);
    const dexterity = battleStats.dexterity.value * (1 + battleStats.dexterity.modifier / 100);
    
    return strength + defense + speed + dexterity;
}

// Fetch player's own stats from Torn API
async function fetchMyTornStats() {
    try {
        const url = `https://api.torn.com/v2/user?key=${PERSONAL_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('My Torn stats:', data);
        
        if (data.error) {
            document.getElementById('playerData').innerHTML = `<p>Error loading player data: ${data.error.message}</p>`;
            return false;
        }

        // Add delay before next fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Now fetch battle stats
        return await fetchMyBattleStats();
    } catch (error) {
        console.error('Torn API error:', error);
        document.getElementById('playerData').innerHTML = `<p>Error: ${error.message}</p>`;
        return false;
    }
}

// Fetch player's battle stats
async function fetchMyBattleStats() {
    try {
        const url = `https://api.torn.com/v2/user/battlestats`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `ApiKey ${PERSONAL_KEY}`
            }
        });
        const data = await response.json();
        
        console.log('My Battle stats:', data);
        
        if (data.error) {
            document.getElementById('playerData').innerHTML = `<p>Error loading battle stats: ${data.error.message}</p>`;
            return false;
        }

        myBattleStats = data.battlestats || {};
        
        // Add delay before next fetch
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Now fetch FF Scouter data
        return await fetchMyScouterStats();
    } catch (error) {
        console.error('Battle stats error:', error);
        document.getElementById('playerData').innerHTML = `<p>Error: ${error.message}</p>`;
        return false;
    }
}

// Fetch player's FF Scouter stats
async function fetchMyScouterStats() {
    try {
        const url = `https://ffscouter.com/api/v1/get-stats?key=${SCOUTER_KEY}&targets=${USER_ID}&user_id=${USER_ID}`;
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('My Scouter stats:', data);
        
        if (!Array.isArray(data) || data.length === 0) {
            document.getElementById('playerData').innerHTML = `<p>No Scouter data available</p>`;
            return false;
        }

        myStats = data[0];
        
        // Calculate base and effective battle stats
        const baseBS = myBattleStats.total || 0;
        const baseBSRounded = Math.round(baseBS / 1000000) + 'M';
        
        const effectiveBS = calculateEffectiveBS(myBattleStats);
        const effectiveBSRounded = Math.round(effectiveBS / 1000000) + 'M';
        
        const html = `
            <div class="player-card">
                <h3>Your Stats</h3>
                <div class="stat-row">
                    <span class="stat-label">Fair Fight:</span>
                    <span class="stat-value">${myStats.fair_fight}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Battle Stats:</span>
                    <span class="stat-value">${myStats.bs_estimate_human}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Base Battle Stats:</span>
                    <span class="stat-value">${baseBSRounded}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Effective Battle Stats:</span>
                    <span class="stat-value">${effectiveBSRounded}</span>
                </div>
            </div>
        `;
        
        document.getElementById('playerData').innerHTML = html;
        return true;
    } catch (error) {
        console.error('Scouter error:', error);
        document.getElementById('playerData').innerHTML = `<p>Error: ${error.message}</p>`;
        return false;
    }
}

// Fetch faction data
async function fetchFactionData() {
    try {
        const url = `https://api.torn.com/v2/faction/${FACTION_ID}?key=${FACTION_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Faction data:', data);
        
        if (data.error) {
            document.getElementById('factionData').innerHTML = `<p>Error: ${data.error.message}</p>`;
            return false;
        }

        const faction = data.basic;
        const html = `
            <div class="faction-card">
                <h3>${faction.name}</h3>
                <div class="stat-row">
                    <span class="stat-label">Members:</span>
                    <span class="stat-value">${faction.members}/${faction.capacity}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Respect:</span>
                    <span class="stat-value">${faction.respect.toLocaleString()}</span>
                </div>
                <div class="stat-row">
                    <span class="stat-label">Best Chain:</span>
                    <span class="stat-value">${faction.best_chain.toLocaleString()}</span>
                </div>
            </div>
        `;
        
        document.getElementById('factionData').innerHTML = html;
        return true;
    } catch (error) {
        console.error('Faction error:', error);
        document.getElementById('factionData').innerHTML = `<p>Error: ${error.message}</p>`;
        return false;
    }
}

// Fetch faction members
async function fetchFactionMembers() {
    try {
        const url = `https://api.torn.com/v2/faction/${FACTION_ID}/members?key=${FACTION_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Faction members:', data);
        
        if (data.error) {
            document.getElementById('membersData').innerHTML = `<p>Error: ${data.error.message}</p>`;
            return false;
        }

        factionMembers = data.members || [];
        
        // Now fetch FF Scouter data for all members in batches of 5
        return await fetchMembersScouterData();
    } catch (error) {
        console.error('Members error:', error);
        document.getElementById('membersData').innerHTML = `<p>Error: ${error.message}</p>`;
        return false;
    }
}

// Fetch FF Scouter data for faction members in batches of 5
async function fetchMembersScouterData() {
    try {
        document.getElementById('membersData').innerHTML = `<p>Loading Scouter data...</p>`;
        
        const batchSize = 5;
        const scouterData = {};
        
        for (let i = 0; i < factionMembers.length; i += batchSize) {
            const batch = factionMembers.slice(i, i + batchSize);
            const targets = batch.map(m => m.id).join(',');
            
            console.log(`Batch ${Math.floor(i/batchSize) + 1} targets:`, targets);
            
            try {
                const url = `https://ffscouter.com/api/v1/get-stats?key=${SCOUTER_KEY}&targets=${targets}&user_id=${USER_ID}`;
                console.log(`Batch URL:`, url);
                
                const response = await fetch(url);
                const data = await response.json();
                
                console.log(`Batch ${Math.floor(i/batchSize) + 1} Scouter data:`, data);
                
                if (Array.isArray(data)) {
                    data.forEach(stat => {
                        scouterData[stat.player_id] = stat;
                    });
                }
            } catch (error) {
                console.error(`Batch ${Math.floor(i/batchSize) + 1} error:`, error);
            }
            
            // Small delay between batches to avoid rate limiting
            if (i + batchSize < factionMembers.length) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        // Display members with Scouter data
        displayMembers(scouterData);
        return true;
    } catch (error) {
        console.error('Scouter batch error:', error);
        document.getElementById('membersData').innerHTML = `<p>Error: ${error.message}</p>`;
        return false;
    }
}

// Display members sorted by Fair Fight
function displayMembers(scouterData) {
    const membersWithFF = factionMembers.map(member => {
        const stats = scouterData[member.id] || {};
        return {
            ...member,
            fair_fight: stats.fair_fight || 0,
            bs_estimate_human: stats.bs_estimate_human || 'N/A',
            color: getFFColor(stats.fair_fight)
        };
    });
    
    // Sort by fair fight (ascending - best first)
    membersWithFF.sort((a, b) => a.fair_fight - b.fair_fight);
    
    let html = `
        <h3>Faction Members (${membersWithFF.length})</h3>
        <table class="members-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Level</th>
                    <th>Fair Fight</th>
                    <th>Battle Stats</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    membersWithFF.forEach(member => {
        const colorClass = member.color.toLowerCase();
        const statusText = member.status?.description || 'Unknown';
        const statusColor = member.status?.color || 'gray';
        
        html += `
            <tr class="ff-${colorClass}">
                <td>${member.name}</td>
                <td>${member.level}</td>
                <td>${member.fair_fight}</td>
                <td>${member.bs_estimate_human}</td>
                <td><span class="status-${statusColor}">${statusText}</span></td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
        <br>
        <button id="warAnalysisBtn" onclick="goToWarAnalysis()" style="margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
            📊 Open War Analysis Tool
        </button>
    `;
    
    document.getElementById('membersData').innerHTML = html;
    
    // Store data in localStorage for war-analysis.html to access
    localStorage.setItem('playerData', JSON.stringify({
        id: USER_ID,
        stats: myStats,
        battleStats: myBattleStats
    }));
    
    localStorage.setItem('factionData', JSON.stringify(membersWithFF));
}

// Navigate to war analysis tool
function goToWarAnalysis() {
    window.location.href = 'war-analysis.html';
}

// Get FF color category
function getFFColor(ff) {
    if (ff === undefined || ff === null) return 'GRAY';
    if (ff <= 1.2) return 'GREEN';
    if (ff <= 3) return 'AMBER';
    return 'RED';
}

// Load button handler
document.getElementById('loadButton').addEventListener('click', async () => {
    const userInput = document.getElementById('userIdInput').value.trim();
    const factionInput = document.getElementById('factionIdInput').value.trim();
    
    if (!userInput || !factionInput) {
        alert('Please enter both User ID and Faction ID');
        return;
    }
    
    USER_ID = userInput;
    FACTION_ID = factionInput;
    
    document.getElementById('loadButton').disabled = true;
    document.getElementById('loadButton').textContent = 'Loading...';
    
    // Fetch in order: My Torn stats, Faction, Members
    const success1 = await fetchMyTornStats();
    if (success1) {
        const success2 = await fetchFactionData();
        if (success2) {
            await fetchFactionMembers();
        }
    }
    
    document.getElementById('loadButton').disabled = false;
    document.getElementById('loadButton').textContent = 'Load Faction';
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Dashboard initialized');
});