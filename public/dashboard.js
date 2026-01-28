// Session storage for tactical scan data
let SESSION = { data: [], myStats: 0, uid: null, factionId: null, currentFilter: 'all' };

// Server status checker
async function checkServerStatus() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.status === 'OK') {
            document.getElementById('server-status').textContent = '● ONLINE';
            document.getElementById('server-status').style.color = '#10b981';
            document.getElementById('server-status-pill').title = `Uptime: ${data.uptime}`;
        }
    } catch (error) {
        document.getElementById('server-status').textContent = '● OFFLINE';
        document.getElementById('server-status').style.color = '#ef4444';
    }
}

// Check status every 10 seconds
setInterval(checkServerStatus, 10000);

// Utility function to format numbers
function formatNum(n) {
    if (!n || isNaN(n)) return '0';
    if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return n.toLocaleString();
}

// Determine tier based on battle stats comparison
function getTier(targetStats, myStats) {
    if (targetStats < myStats * 0.5) return 'secure';
    if (targetStats < myStats * 1.0) return 'prime';
    if (targetStats < myStats * 2.0) return 'risky';
    return 'suicide';
}

// Display alert message
function showAlert(message, type = 'error') {
    const container = document.getElementById('alert-container');
    const alertClass = type === 'error' ? 'alert-error' : 'alert-success';
    const icon = type === 'error' ? '❌' : '✅';
    
    container.innerHTML = `
        <div class="alert ${alertClass}">
            <span>${icon}</span>
            <span>${message}</span>
        </div>
    `;
    
    setTimeout(() => {
        container.innerHTML = '';
    }, type === 'error' ? 5000 : 3000);
}

// Update stats overview
function updateStatsOverview() {
    const stats = SESSION.data.reduce((acc, target) => {
        acc[target.tier] = (acc[target.tier] || 0) + 1;
        return acc;
    }, { secure: 0, prime: 0, risky: 0, suicide: 0 });
    
    document.getElementById('stat-secure').textContent = stats.secure;
    document.getElementById('stat-prime').textContent = stats.prime;
    document.getElementById('stat-risky').textContent = stats.risky;
    document.getElementById('stat-suicide').textContent = stats.suicide;
    document.getElementById('stats-overview').style.display = 'grid';
}

// Render a target card with new design
function renderTargetCard(target) {
    const card = document.createElement('div');
    card.className = `target-card ${target.tier}`;
    card.dataset.tier = target.tier;
    
    const badgeClass = `badge-${target.tier}`;
    const tierLabel = target.tier.charAt(0).toUpperCase() + target.tier.slice(1);
    
    card.innerHTML = `
        <div class="target-header">
            <div>
                <div class="target-name">${target.name}</div>
                <div class="target-id">ID: ${target.id}</div>
            </div>
            <div class="target-badge ${badgeClass}">${tierLabel}</div>
        </div>
        <div class="target-stats">
            <div class="stat-item">
                <div class="stat-item-label">Battle Stats</div>
                <div class="stat-item-value">${formatNum(target.stats)}</div>
            </div>
            <div class="stat-item">
                <div class="stat-item-label">Fair Fight</div>
                <div class="stat-item-value">${target.ff.toFixed(2)}x</div>
            </div>
        </div>
    `;
    
    return card;
}

// Render all targets
function renderTargets(filter = 'all') {
    const grid = document.getElementById('targets-grid');
    grid.innerHTML = '';
    
    const filteredTargets = filter === 'all' 
        ? SESSION.data 
        : SESSION.data.filter(t => t.tier === filter);
    
    if (filteredTargets.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3>No ${filter !== 'all' ? filter : ''} targets found</h3>
            </div>
        `;
        return;
    }
    
    filteredTargets.forEach(target => {
        grid.appendChild(renderTargetCard(target));
    });
}

// Filter targets by tier
function filterTargets(tier, event) {
    SESSION.currentFilter = tier;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    renderTargets(tier);
}

// Main tactical scan function
async function runTacticalScan() {
    const uid = document.getElementById('uid').value.trim();
    const fid = document.getElementById('fid').value.trim();
    
    if (!uid || !fid) {
        showAlert('Please enter both User ID and Faction ID', 'error');
        return;
    }
    
    SESSION.uid = uid;
    SESSION.factionId = fid;
    SESSION.data = [];
    SESSION.currentFilter = 'all';
    
    // Reset UI
    document.getElementById('targets-grid').innerHTML = '';
    document.getElementById('stats-overview').style.display = 'none';
    document.getElementById('filter-buttons').style.display = 'none';
    document.getElementById('progress-container').style.display = 'block';
    document.getElementById('p-status').textContent = 'Loading operator data...';
    document.getElementById('section-title').textContent = 'Scanning...';
    
    try {
        // Step 1: Get user data
        const userData = await fetchUserData(uid);
        document.getElementById('op-name').textContent = userData.name || 'Unknown';
        
        // Calculate battle stats from user data
        const battleStats = (userData.strength || 0) + (userData.defense || 0) + 
                          (userData.speed || 0) + (userData.dexterity || 0);
        SESSION.myStats = battleStats;
        document.getElementById('op-stats').textContent = formatNum(battleStats);
        
        // Step 2: Get faction data
        document.getElementById('p-status').textContent = 'Loading faction data...';
        const factionData = await fetchFactionData(fid);
        document.getElementById('section-title').textContent = `${factionData.name} - Targets`;
        
        const memberIds = Object.keys(factionData.members);
        
        if (memberIds.length === 0) {
            showAlert('No members found in faction', 'error');
            document.getElementById('progress-container').style.display = 'none';
            return;
        }
        
        // Step 3: Fetch scouter data for each member
        document.getElementById('p-status').textContent = 'Scanning targets...';
        let count = 0;
        
        for (const memberId of memberIds) {
            try {
                const scouterData = await fetchScouterData(memberId, uid);
                const scouterStats = Array.isArray(scouterData) ? scouterData[0] : scouterData;
                
                const stats = Number(scouterStats.bs_estimate) || 0;
                const ff = Number(scouterStats.fair_fight) || 1.0;
                const tier = getTier(stats, SESSION.myStats);
                
                const memberData = {
                    id: memberId,
                    name: factionData.members[memberId].name || 'Unknown',
                    stats: stats,
                    ff: ff,
                    tier: tier
                };
                
                SESSION.data.push(memberData);
                
            } catch (error) {
                console.error(`Error fetching data for member ${memberId}:`, error);
            }
            
            count++;
            const pct = Math.round((count / memberIds.length) * 100);
            document.getElementById('p-fill').style.width = pct + '%';
            document.getElementById('p-percent').textContent = pct + '%';
        }
        
        // Store data in localStorage for war analysis
        localStorage.setItem('playerData', JSON.stringify(userData));
        localStorage.setItem('factionData', JSON.stringify(factionData));
        localStorage.setItem('scanResults', JSON.stringify(SESSION.data));
        
        // Render results
        setTimeout(() => {
            document.getElementById('progress-container').style.display = 'none';
            updateStatsOverview();
            renderTargets('all');
            document.getElementById('filter-buttons').style.display = 'flex';
            
            let successMsg = `Scan complete! Analyzed ${SESSION.data.length} targets.`;
            if (failedCount > 0) {
                successMsg += ` (${failedCount} targets unavailable)`;
            }
            showAlert(successMsg, 'success');
        }, 500);
        
    } catch (error) {
        console.error('Scan error:', error);
        showAlert(`Scan failed: ${error.message}`, 'error');
        document.getElementById('progress-container').style.display = 'none';
        document.getElementById('section-title').textContent = 'Scan Failed';
    }
}

// Fetch user data from API
async function fetchUserData(userId) {
    const response = await fetch(`/api/user/${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    return await response.json();
}

// Fetch faction data from API
async function fetchFactionData(factionId) {
    const response = await fetch(`/api/faction/${factionId}/members`);
    if (!response.ok) {
        throw new Error('Failed to fetch faction data');
    }
    return await response.json();
}

// Fetch scouter data from API
async function fetchScouterData(targetId, userId) {
    const response = await fetch(`/api/scouter/${targetId}?userId=${userId}`);
    if (!response.ok) {
        throw new Error('Failed to fetch scouter data');
    }
    return await response.json();
}

// Generate and display report
function showReport() {
    if (SESSION.data.length === 0) {
        showAlert('No scan data available. Please run a scan first.', 'error');
        return;
    }
    
    const summary = SESSION.data.reduce((acc, curr) => {
        acc[curr.tier] = (acc[curr.tier] || 0) + 1;
        return acc;
    }, { secure: 0, prime: 0, risky: 0, suicide: 0 });
    
    const report = `
═══════════════════════════════
    WAR INTELLIGENCE REPORT
═══════════════════════════════

Total Targets Analyzed: ${SESSION.data.length}

Target Breakdown:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟢 Secure Targets:  ${summary.secure}
🔵 Prime Targets:   ${summary.prime}
🟠 Risky Targets:   ${summary.risky}
🔴 Suicide Targets: ${summary.suicide}

═══════════════════════════════
`;
    
    alert(report);
}

// Navigate to war analysis page
function navigateToWarAnalysis() {
    if (SESSION.data.length === 0) {
        showAlert('No scan data available. Please run a scan first.', 'error');
        return;
    }
    window.location.href = 'war-analysis.html';
}

// Initialize on page load
window.onload = function() {
    // Try to restore previous session if available
    const savedResults = localStorage.getItem('scanResults');
    if (savedResults) {
        SESSION.data = JSON.parse(savedResults);
        if (SESSION.data.length > 0) {
            updateStatsOverview();
            renderTargets('all');
            document.getElementById('filter-buttons').style.display = 'flex';
            document.getElementById('section-title').textContent = 'Previous Scan Results';
        }
    }
    
    // Set up event listeners
    document.getElementById('btn-scan').addEventListener('click', runTacticalScan);
    document.getElementById('btn-report').addEventListener('click', showReport);
    document.getElementById('btn-war-analysis').addEventListener('click', navigateToWarAnalysis);
    
    // Set up filter button listeners
    document.getElementById('filter-buttons').addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-btn')) {
            const tier = e.target.dataset.tier;
            filterTargets(tier, e);
        }
    });
};